import { NextRequest, NextResponse } from 'next/server';

export async function securityMiddleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  // Add rate limiting headers
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
  
  return response;
}