import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VideoConferenceManager } from '@/lib/video-conference';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const consultationId = params.id;
    const body = await request.json();
    const { action } = body; // 'join', 'leave', 'end'

    // Verify user is part of this consultation
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [
          { clientId: session.user.id },
          { expertId: session.user.id }
        ]
      },
      include: {
        expert: { select: { id: true, displayName: true } },
        client: { select: { id: true, name: true } }
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found or access denied' },
        { status: 404 }
      );
    }

    // Check if consultation is in valid state for video
    if (!['APPROVED', 'SCHEDULED', 'IN_PROGRESS'].includes(consultation.status)) {
      return NextResponse.json(
        { success: false, error: 'Video conference not available for this consultation status' },
        { status: 400 }
      );
    }

    const isExpert = consultation.expert.id === session.user.id;
    const participantType = isExpert ? 'expert' : 'client';

    switch (action) {
      case 'join':
        return await handleJoinVideo(consultation, session.user.id, participantType, isExpert);
      
      case 'leave':
        return await handleLeaveVideo(consultation, session.user.id);
      
      case 'end':
        if (!isExpert) {
          return NextResponse.json(
            { success: false, error: 'Only experts can end consultations' },
            { status: 403 }
          );
        }
        return await handleEndVideo(consultation);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error handling video conference:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to handle video conference request' },
      { status: 500 }
    );
  }
}

async function handleJoinVideo(
  consultation: any,
  userId: string,
  participantType: 'expert' | 'client',
  isHost: boolean
) {
  try {
    // Check if already has an active meeting
    let roomId = consultation.meetingId;
    
    if (!roomId) {
      // Initialize new video conference session
      const videoConfig = await VideoConferenceManager.initializeSession({
        consultationId: consultation.id,
        participantId: userId,
        participantType,
        isHost
      });
      
      roomId = videoConfig.roomId;
      
      return NextResponse.json({
        success: true,
        conference: {
          roomId: videoConfig.roomId,
          token: videoConfig.token,
          config: videoConfig.sessionConfig,
          isNewSession: true
        }
      });
    } else {
      // Join existing session
      await VideoConferenceManager.handleParticipantJoin(
        roomId,
        userId,
        participantType
      );

      // Generate token for existing session
      const token = Buffer.from(JSON.stringify({
        roomId,
        userId,
        role: participantType,
        consultationId: consultation.id,
        exp: Date.now() + (4 * 60 * 60 * 1000)
      })).toString('base64');

      return NextResponse.json({
        success: true,
        conference: {
          roomId,
          token,
          config: {
            roomId,
            participantName: participantType === 'expert' 
              ? consultation.expert.displayName 
              : consultation.client.name,
            isHost,
            maxDuration: consultation.duration,
            recordingEnabled: true,
            features: {
              chat: true,
              screenShare: true,
              recording: isHost,
              fileSharing: true
            }
          },
          isNewSession: false
        }
      });
    }

  } catch (error) {
    console.error('Error joining video:', error);
    throw error;
  }
}

async function handleLeaveVideo(consultation: any, userId: string) {
  try {
    if (consultation.meetingId) {
      await VideoConferenceManager.handleParticipantLeave(
        consultation.meetingId,
        userId
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully left video conference'
    });

  } catch (error) {
    console.error('Error leaving video:', error);
    throw error;
  }
}

async function handleEndVideo(consultation: any) {
  try {
    if (!consultation.meetingId) {
      return NextResponse.json(
        { success: false, error: 'No active video session' },
        { status: 400 }
      );
    }

    // End the video conference and calculate billing
    const result = await VideoConferenceManager.endSession(
      consultation.meetingId,
      consultation.id
    );

    return NextResponse.json({
      success: true,
      sessionEnded: true,
      billing: {
        actualDuration: result.actualDuration,
        originalAmount: result.adjustedBilling.originalAmount,
        finalAmount: result.adjustedBilling.actualAmount,
        refundAmount: result.adjustedBilling.refundAmount,
        message: result.adjustedBilling.refundAmount > 0 
          ? `Consultation lasted ${result.actualDuration} minutes. $${result.adjustedBilling.refundAmount.toFixed(2)} will be refunded.`
          : `Consultation completed in ${result.actualDuration} minutes.`
      }
    });

  } catch (error) {
    console.error('Error ending video:', error);
    throw error;
  }
}