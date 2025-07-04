import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId, sessionId: currentSessionId } = await auth();
    
    if (!userId || !currentSessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Terminate all other sessions
    const terminatedCount = await sessionManager.terminateOtherSessions(userId, currentSessionId);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ALL_OTHER_SESSIONS_TERMINATED',
        details: {
          terminatedCount,
          fromSession: currentSessionId,
          reason: 'User initiated logout everywhere else'
        }
      }
    });

    // Create security event if many sessions were terminated
    if (terminatedCount > 3) {
      await prisma.securityEvent.create({
        data: {
          userId,
          eventType: 'MASS_SESSION_TERMINATION',
          severity: 'low',
          details: {
            terminatedCount,
            initiatedBy: 'user'
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      terminatedCount,
      message: `Successfully terminated ${terminatedCount} session${terminatedCount !== 1 ? 's' : ''}`
    });
  } catch (error) {
    console.error('Error terminating sessions:', error);
    return NextResponse.json(
      { error: 'Failed to terminate sessions' },
      { status: 500 }
    );
  }
}