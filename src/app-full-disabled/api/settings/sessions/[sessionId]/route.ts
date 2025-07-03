import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId, sessionId: currentSessionId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetSessionId = params.sessionId;

    // Prevent terminating current session
    if (targetSessionId === currentSessionId) {
      return NextResponse.json(
        { error: 'Cannot terminate current session' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const session = await prisma.userSession.findUnique({
      where: { id: targetSessionId }
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Terminate the session
    await sessionManager.terminateSessions([targetSessionId]);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SESSION_TERMINATED_MANUAL',
        entityType: 'UserSession',
        entityId: targetSessionId,
        details: {
          terminatedBy: 'user',
          fromSession: currentSessionId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error terminating session:', error);
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    );
  }
}