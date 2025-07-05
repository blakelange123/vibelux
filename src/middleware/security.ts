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
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
  
  return response;
}

// Input validation function
export function validateInput<T = any>(input: any, schema?: any): T {
  // Basic input validation
  if (input === null || input === undefined) {
    throw new Error('Input is required');
  }
  
  // Remove any potential XSS attempts
  if (typeof input === 'string') {
    // Basic XSS prevention
    const cleaned = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return cleaned as T;
  }
  
  // For objects, recursively clean
  if (typeof input === 'object' && !Array.isArray(input)) {
    const cleaned: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        cleaned[key] = validateInput(input[key]);
      }
    }
    return cleaned as T;
  }
  
  // For arrays
  if (Array.isArray(input)) {
    return input.map(item => validateInput(item)) as T;
  }
  
  // For other types, return as is
  return input as T;
}