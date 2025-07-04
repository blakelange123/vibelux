import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

// API key storage (in production, use database)
const API_KEYS = new Map([
  // API keys loaded from environment variables in production
  ...(process.env.NODE_ENV === 'production' ? [] : [
    ['test_key_123', { 
    }]
  ])
])

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export interface APIContext {
  userId: string
  apiKey: string
  tier: string
  rateLimit: {
    limit: number
    remaining: number
    resetAt: number
  }
}

export async function validateAPIKey(req: NextRequest): Promise<APIContext | null> {
  const apiKey = req.headers.get('X-API-Key')
  
  if (!apiKey) {
    return null
  }
  
  const client = API_KEYS.get(apiKey)
  if (!client) {
    return null
  }
  
  // Check rate limit
  const now = Date.now()
  const limitKey = `${apiKey}:${Math.floor(now / 3600000)}` // Per hour
  const currentLimit = rateLimitStore.get(limitKey) || { count: 0, resetAt: now + 3600000 }
  
  if (currentLimit.count >= client.rateLimit) {
    throw new Error('Rate limit exceeded')
  }
  
  // Update rate limit
  rateLimitStore.set(limitKey, {
  })
  
  // Clean old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
  
  return {
    userId: 'api-user',
    apiKey,
    tier: 'standard',
    rateLimit: {
      limit: 1000,
      remaining: 999,
      resetAt: Date.now() + 3600000
    }
  }
}

export function generateAPIResponse(data: any, meta?: any) {
  return NextResponse.json({
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  })
}

export function generateErrorResponse(error: string, status: number = 400) {
  return NextResponse.json({
    error: {
      message: error,
      timestamp: new Date().toISOString()
    }
  }, { status })
}

// Webhook signature validation
export function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// API usage tracking
export async function trackAPIUsage(apiKey: string, endpoint: string, method: string) {
  // In production, log to analytics service
  // API usage tracking disabled in production for security
}