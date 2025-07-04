import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Store location update
export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, latitude, longitude, accuracy, altitude, speed, heading, batteryLevel, metadata } = body;

    if (!facilityId || !latitude || !longitude || !accuracy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: userId,
        facilityId: facilityId,
        role: { in: ['OWNER', 'MANAGER', 'OPERATOR', 'VIEWER'] }
      }
    });

    if (!facilityAccess) {
      return NextResponse.json(
        { error: 'No access to this facility' },
        { status: 403 }
      );
    }

    // Store location update
    const locationUpdate = await prisma.locationUpdate.create({
      data: {
        userId: userId,
        facilityId,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
        batteryLevel,
        metadata
      }
    });

    // Update worker device last seen
    await prisma.workerDevice.updateMany({
      where: {
        userId: userId,
        facilityId
      },
      data: {
        lastSeen: new Date()
      }
    });

    // Check geofences
    const geofences = await checkGeofences(locationUpdate);

    return NextResponse.json({
      success: true,
      locationUpdate,
      geofenceAlerts: geofences
    });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// Get location history
export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const targetUserId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: userId,
        facilityId: facilityId,
        role: { in: ['OWNER', 'MANAGER', 'OPERATOR', 'VIEWER'] }
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
    
    // Only allow viewing own location unless manager/owner
    if (facilityAccess.role === 'OPERATOR' || facilityAccess.role === 'VIEWER') {
      where.userId = userId;
    } else if (targetUserId) {
      where.userId = targetUserId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const locations = await prisma.locationUpdate.findMany({
      where,
      include: {
        user: {
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
      locations
    });
  } catch (error) {
    console.error('Location fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// Helper function to check geofences
async function checkGeofences(location: any) {
  const geofences = await prisma.geofenceZone.findMany({
    where: {
      facilityId: location.facilityId,
      active: true
    }
  });

  const alerts = [];

  for (const zone of geofences) {
    const isInside = checkIfInsideGeofence(location, zone);
    
    // Get previous location to check entry/exit
    const previousLocation = await prisma.locationUpdate.findFirst({
      where: {
        userId: location.userId,
        facilityId: location.facilityId,
        timestamp: { lt: location.timestamp }
      },
      orderBy: { timestamp: 'desc' }
    });

    const wasInside = previousLocation ? checkIfInsideGeofence(previousLocation, zone) : false;

    // Create alerts based on entry/exit
    if (!wasInside && isInside && zone.alerts.onEnter) {
      alerts.push(await createGeofenceAlert(zone, location, 'entered'));
    } else if (wasInside && !isInside && zone.alerts.onExit) {
      alerts.push(await createGeofenceAlert(zone, location, 'exited'));
    }
  }

  return alerts;
}

function checkIfInsideGeofence(location: any, zone: any): boolean {
  if (zone.type === 'CIRCULAR') {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      zone.boundaries.center.lat,
      zone.boundaries.center.lng
    );
    return distance <= zone.boundaries.radius;
  }
  // Add polygon check logic here
  return false;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
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

async function createGeofenceAlert(zone: any, location: any, action: string) {
  return await prisma.trackingAlert.create({
    data: {
      facilityId: location.facilityId,
      type: 'GEOFENCE',
      severity: 'INFO',
      title: `Geofence ${action}`,
      message: `User ${location.userId} ${action} ${zone.name}`,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      triggeredBy: location.userId,
      metadata: {
        zoneId: zone.id,
        zoneName: zone.name,
        action
      }
    }
  });
}