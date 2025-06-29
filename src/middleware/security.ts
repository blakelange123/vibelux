/**
 * Security Middleware
 * Implements rate limiting, request validation, and API key management
 */

import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env-validator'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
}

const apiRateLimits: Record<string, RateLimitConfig> = {
  '/api/ai-assistant': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  '/api/ai-design-chat': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  '/api/fixtures': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 per minute
  '/api/sensors': { windowMs: 10 * 1000, maxRequests: 100 }, // 100 per 10 seconds
  // Tracking API rate limits
  '/api/tracking/location': { windowMs: 60 * 1000, maxRequests: 120 }, // 2 per second max
  '/api/tracking/messages': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
  '/api/tracking/alerts': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  '/api/tracking/geofences': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
  '/api/qr-codes': { windowMs: 60 * 1000, maxRequests: 50 }, // 50 per minute
}

/**
 * Rate limiting middleware
 */
export function rateLimit(request: NextRequest, config?: RateLimitConfig): NextResponse | null {
  const clientIP = getClientIP(request)
  const path = new URL(request.url).pathname
  const rateLimitConfig = config || apiRateLimits[path] || defaultRateLimit
  
  const key = `${clientIP}:${path}`
  const now = Date.now()
  const windowStart = now - rateLimitConfig.windowMs
  
  // Clean up old entries
  if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.1) { // 10% chance to cleanup
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }
  
  let current = rateLimitStore.get(key)
  
  if (!current || current.resetTime < now) {
    current = { count: 1, resetTime: now + rateLimitConfig.windowMs }
    rateLimitStore.set(key, current)
  } else {
    current.count++
  }
  
  // Check if limit exceeded
  if (current.count > rateLimitConfig.maxRequests) {
    console.warn(`Rate limit exceeded for ${clientIP} on ${path}`)
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': current.resetTime.toString(),
          'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
        }
      }
    )
  }
  
  return null // Continue processing
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.mapbox.com wss: wss://ws-*.pusher.com https://sockjs-*.pusher.com",
    "frame-ancestors 'none'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Prevent information disclosure
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
  
  return response
}

/**
 * Input validation middleware
 */
export function validateInput(request: NextRequest): NextResponse | null {
  const url = new URL(request.url)
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\.\./,
    /\/etc\/passwd/,
    /\/proc\/self\/environ/,
    /(union|select|insert|update|delete|drop)\s+/i
  ]
  
  const checkValue = (value: string) => {
    return suspiciousPatterns.some(pattern => pattern.test(value))
  }
  
  // Check URL parameters
  for (const [key, value] of url.searchParams.entries()) {
    if (checkValue(key) || checkValue(value)) {
      console.warn(`Suspicious input detected: ${key}=${value}`)
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
  }
  
  return null // Continue processing
}

/**
 * API key validation for external APIs
 */
export function validateApiAccess(request: NextRequest, requiredKey: string): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  const apiKey = request.headers.get('x-api-key')
  
  if (!authHeader && !apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    )
  }
  
  // Extract token from Bearer authorization
  const token = authHeader?.replace('Bearer ', '') || apiKey
  
  if (!token || token !== requiredKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 403 }
    )
  }
  
  return null // Continue processing
}

/**
 * CORS middleware
 */
export function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    env.get('NEXT_PUBLIC_APP_URL'),
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vibelux.app',
    'https://app.vibelux.com'
  ].filter(Boolean)
  
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }
  
  return null // Continue processing
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  const logEntry = {
    event,
    severity,
    details,
    timestamp: new Date().toISOString()
  }
  
  if (severity === 'critical' || severity === 'high') {
    console.error('🚨 SECURITY EVENT:', logEntry)
  } else {
    console.warn('⚠️ Security Event:', logEntry)
  }
  
  // In production, send to security monitoring service
  if (env.isProduction()) {
    // TODO: Send to security monitoring service (e.g., Sentry, DataDog)
  }
}

/**
 * Tracking-specific security validations
 */
export function validateLocationData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (typeof data.latitude !== 'number' || isNaN(data.latitude)) {
    errors.push('Invalid latitude');
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude out of range');
  }
  
  if (typeof data.longitude !== 'number' || isNaN(data.longitude)) {
    errors.push('Invalid longitude');
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude out of range');
  }
  
  if (typeof data.accuracy !== 'number' || isNaN(data.accuracy) || data.accuracy < 0) {
    errors.push('Invalid accuracy');
  } else if (data.accuracy > 10000) { // More than 10km accuracy is suspicious
    errors.push('Accuracy too low');
  }
  
  // Optional fields validation
  if (data.altitude !== undefined && (typeof data.altitude !== 'number' || isNaN(data.altitude))) {
    errors.push('Invalid altitude');
  }
  
  if (data.speed !== undefined && (typeof data.speed !== 'number' || isNaN(data.speed) || data.speed < 0)) {
    errors.push('Invalid speed');
  } else if (data.speed > 200) { // More than 200 m/s (720 km/h) is suspicious
    errors.push('Speed too high');
  }
  
  if (data.heading !== undefined) {
    if (typeof data.heading !== 'number' || isNaN(data.heading)) {
      errors.push('Invalid heading');
    } else if (data.heading < 0 || data.heading > 360) {
      errors.push('Heading out of range');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function sanitizeMessageContent(content: string): string {
  if (typeof content !== 'string') return '';
  
  return content
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

export function validateGeofenceData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Invalid geofence name');
  }
  
  if (!['circular', 'polygon', 'indoor'].includes(data.type)) {
    errors.push('Invalid geofence type');
  }
  
  if (data.type === 'circular') {
    if (!data.boundaries?.center?.lat || !data.boundaries?.center?.lng) {
      errors.push('Invalid circular geofence center');
    }
    if (!data.boundaries?.radius || data.boundaries.radius <= 0 || data.boundaries.radius > 10000) {
      errors.push('Invalid circular geofence radius (must be 1-10000 meters)');
    }
  }
  
  if (data.type === 'polygon') {
    if (!Array.isArray(data.boundaries?.polygon) || data.boundaries.polygon.length < 3) {
      errors.push('Invalid polygon geofence (need at least 3 points)');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * HTTPS enforcement for tracking endpoints
 */
export function enforceHTTPS(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto');
  
  // In production, redirect HTTP to HTTPS for tracking endpoints
  if (process.env.NODE_ENV === 'production' && proto === 'http' && request.nextUrl.pathname.startsWith('/tracking')) {
    return NextResponse.redirect(`https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`, 301);
  }
  
  return null;
}

/**
 * Comprehensive security middleware wrapper
 */
export function securityMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Environment validation
      env.validate()
      
      // CORS handling
      const corsResponse = handleCors(request)
      if (corsResponse) return addSecurityHeaders(corsResponse)
      
      // Rate limiting
      const rateLimitResponse = rateLimit(request)
      if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse)
      
      // Input validation
      const validationResponse = validateInput(request)
      if (validationResponse) return addSecurityHeaders(validationResponse)
      
      // Execute the handler
      const response = await handler(request)
      
      // Add security headers
      return addSecurityHeaders(response)
      
    } catch (error) {
      logSecurityEvent('middleware_error', {
        error: error.message,
        url: request.url,
        method: request.method
      }, 'high')
      
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      
      return addSecurityHeaders(errorResponse)
    }
  }
}