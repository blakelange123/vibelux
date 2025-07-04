import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionManager } from '@/lib/session-manager';

export async function GET() {
  try {
    const { userId, sessionId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user sessions
    const sessions = await sessionManager.getUserSessions(userId);
    
    // Mark current session
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.sessionId === sessionId
    }));

    return NextResponse.json({ sessions: sessionsWithCurrent });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}