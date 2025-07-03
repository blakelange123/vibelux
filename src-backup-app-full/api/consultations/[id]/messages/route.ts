import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { interceptMessage } from '@/lib/content-monitor';

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
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify user is part of this consultation
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [
          { clientId: session.user.id },
          { expertId: session.user.id }
        ]
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found or access denied' },
        { status: 404 }
      );
    }

    // Check if consultation is in a valid state for messaging
    if (!['APPROVED', 'SCHEDULED', 'IN_PROGRESS'].includes(consultation.status)) {
      return NextResponse.json(
        { success: false, error: 'Messaging not available for this consultation status' },
        { status: 400 }
      );
    }

    // Monitor message content for policy violations
    const monitoringResult = await interceptMessage(
      content,
      session.user.id,
      consultationId
    );

    if (!monitoringResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: monitoringResult.warning || 'Message blocked due to policy violation',
          flagged: true
        },
        { status: 403 }
      );
    }

    // Create message record
    const message = await prisma.consultationMessage.create({
      data: {
        consultationId,
        senderId: session.user.id,
        content: monitoringResult.processedContent,
        flaggedContent: monitoringResult.flagged,
        flagReason: monitoringResult.flagged ? 'content_policy_violation' : null
      }
    });

    // Return message with any warnings
    const response: any = {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt.toISOString(),
        flagged: message.flaggedContent
      }
    };

    if (monitoringResult.warning) {
      response.warning = monitoringResult.warning;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify user is part of this consultation
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [
          { clientId: session.user.id },
          { expertId: session.user.id }
        ]
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consultation not found or access denied' },
        { status: 404 }
      );
    }

    // Get messages for this consultation
    const messages = await prisma.consultationMessage.findMany({
      where: { consultationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });

    return NextResponse.json({
      success: true,
      messages: messages.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name
        },
        createdAt: message.createdAt.toISOString(),
        flagged: message.flaggedContent
      }))
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}