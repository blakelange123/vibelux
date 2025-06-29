import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push-notifications';
import { emitRealtimeEvent, getFacilityChannel, getUserChannel, TrackingEvents } from '@/lib/realtime-service';

// Send message
export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, toUser, type, content, location, attachments, priority, metadata } = body;

    if (!facilityId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: userId,
        facilityId: facilityId
      }
    });

    if (!facilityAccess) {
      return NextResponse.json(
        { error: 'No access to this facility' },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.trackingMessage.create({
      data: {
        facilityId,
        fromUser: userId,
        toUser,
        type,
        content,
        location,
        attachments: attachments || [],
        priority: priority || 'NORMAL',
        metadata
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send push notification for high/urgent priority
    if (priority === 'HIGH' || priority === 'URGENT') {
      if (toUser) {
        // Direct message
        await sendPushNotification(toUser, {
          title: `${priority === 'URGENT' ? '🔴' : '🟡'} Message from ${message.sender.name}`,
          body: content,
          data: {
            type: 'message',
            messageId: message.id,
            facilityId
          }
        });
      } else {
        // Broadcast - notify all facility users
        const facilityUsers = await prisma.facilityUser.findMany({
          where: {
            facilityId,
            userId: { not: userId }
          }
        });

        await Promise.all(
          facilityUsers.map(user => 
            sendPushNotification(user.userId, {
              title: `${priority === 'URGENT' ? '🔴' : '🟡'} Broadcast from ${message.sender.name}`,
              body: content,
              data: {
                type: 'broadcast',
                messageId: message.id,
                facilityId
              }
            })
          )
        );
      }
    }

    // Emit to real-time channels for instant delivery
    if (toUser) {
      await emitRealtimeEvent(getUserChannel(toUser), TrackingEvents.MESSAGE_NEW, message);
    } else {
      await emitRealtimeEvent(getFacilityChannel(facilityId), TrackingEvents.MESSAGE_NEW, message);
    }

    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Get messages
export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
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
        userId: userId,
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
    const where: any = {
      facilityId,
      OR: [
        { toUser: userId },
        { toUser: null }, // Broadcast messages
        { fromUser: userId }
      ]
    };

    if (unreadOnly) {
      where.read = false;
      where.toUser = userId;
    }

    const messages = await prisma.trackingMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
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
      messages
    });
  } catch (error) {
    console.error('Message fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    // Update message - only if user is recipient
    const message = await prisma.trackingMessage.updateMany({
      where: {
        id: messageId,
        toUser: userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      updated: message.count
    });
  } catch (error) {
    console.error('Message update error:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

