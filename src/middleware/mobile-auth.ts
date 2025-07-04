import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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