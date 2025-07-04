import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function authMiddleware(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add userId to request headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}