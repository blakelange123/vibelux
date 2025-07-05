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

// Higher-order function for route handlers that require authentication
export function requireAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResponse = await authMiddleware(req);
    
    // If auth middleware returned an error response, return it
    if (authResponse.status !== 200) {
      return authResponse;
    }
    
    // Otherwise, call the handler with the authenticated request
    return handler(req);
  };
}

// Middleware to check facility role permissions
export async function requireFacilityRole(
  req: NextRequest,
  facilityId: string,
  requiredRole: 'owner' | 'admin' | 'member'
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // TODO: Check user's role in the facility from database
  // For now, just check if authenticated
  return NextResponse.next();
}