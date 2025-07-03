import { NextResponse } from 'next/server';

// Simple in-memory rate limiter for MVP
// In production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  const userLimit = rateLimitStore.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export function getRateLimitHeaders(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Record<string, string> {
  const userLimit = rateLimitStore.get(identifier);
  const now = Date.now();
  
  if (!userLimit) {
    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': maxRequests.toString(),
      'X-RateLimit-Reset': new Date(now + windowSeconds * 1000).toISOString()
    };
  }
  
  const remaining = Math.max(0, maxRequests - userLimit.count);
  
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
  };
}

export function rateLimitResponse(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): NextResponse {
  const headers = getRateLimitHeaders(identifier, maxRequests, windowSeconds);
  
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `You have exceeded the rate limit of ${maxRequests} requests per ${windowSeconds} seconds`,
      retryAfter: headers['X-RateLimit-Reset']
    },
    { 
      status: 429,
      headers: {
        ...headers,
        'Retry-After': Math.ceil((new Date(headers['X-RateLimit-Reset']).getTime() - Date.now()) / 1000).toString()
      }
    }
  );
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute