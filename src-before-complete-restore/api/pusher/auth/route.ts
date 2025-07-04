import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getPusherServer } from '@/lib/realtime-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.formData();
    const socketId = body.get('socket_id') as string;
    const channelName = body.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json(
        { error: 'Pusher not configured' },
        { status: 500 }
      );
    }

    // Verify channel access
    if (channelName.startsWith('private-facility-')) {
      const facilityId = channelName.replace('private-facility-', '');
      
      // Check if user has access to facility
      const hasAccess = await prisma.facilityUser.findFirst({
        where: {
          userId,
          facilityId
        }
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'No access to this facility' },
          { status: 403 }
        );
      }
    } else if (channelName.startsWith('private-user-')) {
      const channelUserId = channelName.replace('private-user-', '');
      
      // Users can only subscribe to their own channel
      if (channelUserId !== userId) {
        return NextResponse.json(
          { error: 'Cannot subscribe to other user channels' },
          { status: 403 }
        );
      }
    } else if (channelName.startsWith('presence-facility-')) {
      const facilityId = channelName.replace('presence-facility-', '');
      
      // Check if user has access to facility
      const facilityUser = await prisma.facilityUser.findFirst({
        where: {
          userId,
          facilityId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!facilityUser) {
        return NextResponse.json(
          { error: 'No access to this facility' },
          { status: 403 }
        );
      }

      // For presence channels, include user info
      const presenceData = {
        user_id: userId,
        user_info: {
          name: facilityUser.user.name || 'Unknown',
          email: facilityUser.user.email,
          role: facilityUser.role
        }
      };

      const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
      return NextResponse.json(authResponse);
    }

    // For private channels
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
    
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}