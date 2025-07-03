import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyImpersonationToken, endImpersonationSession } from '@/lib/admin/impersonation';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const impersonationToken = cookieStore.get('vibelux_impersonation');
    
    if (!impersonationToken?.value) {
      return NextResponse.json(
        { error: 'No active impersonation session' },
        { status: 400 }
      );
    }
    
    // Verify token
    const tokenData = await verifyImpersonationToken(impersonationToken.value);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid impersonation token' },
        { status: 400 }
      );
    }
    
    // End the session
    await endImpersonationSession(
      tokenData.sessionId,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );
    
    // Clear the cookie
    cookieStore.delete('vibelux_impersonation');
    
    return NextResponse.json({ 
      success: true,
      message: 'Impersonation session ended'
    });
  } catch (error) {
    console.error('Error ending impersonation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}