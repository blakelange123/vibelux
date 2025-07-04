import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

export async function mobileAuthMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Add user info to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-mobile-user', JSON.stringify(decoded));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Helper function to get authenticated user from request
export function getAuthenticatedUser(req: NextRequest): any {
  const userHeader = req.headers.get('x-mobile-user');
  if (!userHeader) {
    return null;
  }
  
  try {
    return JSON.parse(userHeader);
  } catch {
    return null;
  }
}

// Helper function to check permissions
export function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const user = getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has required permission
    if (!user.permissions || !user.permissions.includes(permission)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    return NextResponse.next();
  };
}