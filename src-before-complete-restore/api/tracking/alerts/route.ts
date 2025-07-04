import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push-notifications';

// Create alert (including SOS)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, type, severity, title, message, location, targetUsers, metadata } = body;

    if (!facilityId || !type || !severity || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: auth.userId,
        facilityId: facilityId
      }
    });

    if (!facilityAccess) {
      return NextResponse.json(
        { error: 'No access to this facility' },
        { status: 403 }
      );
    }

    // Create alert
    const alert = await prisma.trackingAlert.create({
      data: {
        facilityId,
        type,
        severity,
        title,
        message,
        location,
        triggeredBy: auth.userId,
        targetUsers: targetUsers || [],
        metadata
      },
      include: {
        triggerer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send push notifications based on alert type and severity
    let notificationTargets = [];

    if (type === 'SOS' || severity === 'CRITICAL') {
      // Notify all facility managers and owners
      const managers = await prisma.facilityUser.findMany({
        where: {
          facilityId,
          role: { in: ['OWNER', 'MANAGER'] }
        }
      });
      notificationTargets = managers.map(m => m.userId);
    } else if (targetUsers && targetUsers.length > 0) {
      notificationTargets = targetUsers;
    } else if (type === 'PROXIMITY') {
      // Find nearby users
      const radius = metadata?.radius || 100; // meters
      const nearbyUsers = await findNearbyUsers(location, radius, facilityId, auth.userId);
      notificationTargets = nearbyUsers.map(u => u.userId);
    }

    // Send notifications
    const notificationPromises = notificationTargets.map(userId =>
      sendPushNotification(userId, {
        title: `${getSeverityEmoji(severity)} ${title}`,
        body: `${message} - from ${alert.triggerer.name}`,
        data: {
          type: 'alert',
          alertId: alert.id,
          alertType: type,
          severity,
          facilityId,
          requiresAction: severity === 'CRITICAL' || type === 'SOS'
        }
      })
    );

    await Promise.all(notificationPromises);

    // Emit to WebSocket
    await emitToWebSocket('alert', alert);

    return NextResponse.json({
      success: true,
      alert,
      notifiedUsers: notificationTargets.length
    });
  } catch (error) {
    console.error('Alert creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// Get alerts
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const unacknowledgedOnly = searchParams.get('unacknowledgedOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: auth.userId,
        facilityId: facilityId
      }
    });

    if (!facilityAccess) {
      return NextResponse.json(
        { error: 'No access to this facility' },
        { status: 403 }
      );
    }

    // Build query
    const where: any = { facilityId };
    
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (unacknowledgedOnly) where.acknowledged = false;

    const alerts = await prisma.trackingAlert.findMany({
      where,
      include: {
        triggerer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        acknowledger: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Alert fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// Acknowledge alert
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      );
    }

    // Get alert to verify access
    const alert = await prisma.trackingAlert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: auth.userId,
        facilityId: alert.facilityId,
        role: { in: ['OWNER', 'MANAGER', 'OPERATOR'] }
      }
    });

    if (!facilityAccess) {
      return NextResponse.json(
        { error: 'No permission to acknowledge alerts' },
        { status: 403 }
      );
    }

    // Update alert
    const updatedAlert = await prisma.trackingAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy: auth.userId,
        acknowledgedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error('Alert acknowledge error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}

// Helper functions
function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return '🚨';
    case 'WARNING': return '⚠️';
    case 'INFO': return 'ℹ️';
    default: return '📢';
  }
}

async function findNearbyUsers(location: any, radius: number, facilityId: string, excludeUserId: string) {
  // Get recent locations of all users in facility
  const recentLocations = await prisma.locationUpdate.findMany({
    where: {
      facilityId,
      userId: { not: excludeUserId },
      timestamp: {
        gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      }
    },
    distinct: ['userId'],
    orderBy: { timestamp: 'desc' }
  });

  // Filter by distance
  return recentLocations.filter(loc => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      loc.latitude,
      loc.longitude
    );
    return distance <= radius;
  });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

async function emitToWebSocket(event: string, data: any) {
}