import { Redis } from 'ioredis'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
})

// Rate limit configurations by tier
export const RATE_LIMITS = {
  free: {
    requests_per_hour: 100,
    requests_per_minute: 20,
    burst_limit: 5,
    ai_requests_per_day: 10,
    api_calls_per_hour: 50
  },
  startup: {
    requests_per_hour: 500,
    requests_per_minute: 50,
    burst_limit: 10,
    ai_requests_per_day: 50,
    api_calls_per_hour: 250
  },
  professional: {
    requests_per_hour: 1000,
    requests_per_minute: 100,
    burst_limit: 20,
    ai_requests_per_day: 100,
    api_calls_per_hour: 500
  },
  enterprise: {
    requests_per_hour: 10000,
    requests_per_minute: 500,
    burst_limit: 100,
    ai_requests_per_day: 1000,
    api_calls_per_hour: 5000
  },
  custom: {
    requests_per_hour: -1, // Unlimited
    requests_per_minute: -1,
    burst_limit: -1,
    ai_requests_per_day: -1,
    api_calls_per_hour: -1
  }
}

// DDoS protection thresholds
const DDOS_THRESHOLDS = {
  requests_per_second: 50,
  unique_ips_per_minute: 1000,
  requests_per_ip_per_minute: 300,
  suspicious_patterns_threshold: 10
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// Get client identifier (IP + user agent fingerprint)
export async function getClientIdentifier(req: NextRequest): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  // Create a fingerprint combining IP and user agent
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
  
  return fingerprint
}

// Main rate limiting function
export async function checkRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMITS = 'free',
  endpoint?: string
): Promise<RateLimitResult> {
  const limits = RATE_LIMITS[tier]
  const now = Date.now()
  
  // Skip rate limiting for unlimited tiers
  if (limits.requests_per_hour === -1) {
    return {
      allowed: true,
      limit: -1,
      remaining: -1,
      reset: now + 3600000
    }
  }
  
  // Use sliding window algorithm
  const hourKey = `rate_limit:hour:${identifier}:${endpoint || 'global'}`
  const minuteKey = `rate_limit:minute:${identifier}:${endpoint || 'global'}`
  const burstKey = `rate_limit:burst:${identifier}:${endpoint || 'global'}`
  
  // Check burst limit (sliding window)
  const burstCount = await redis.incr(burstKey)
  if (burstCount === 1) {
    await redis.expire(burstKey, 1) // 1 second window
  }
  
  if (burstCount > limits.burst_limit) {
    return {
      allowed: false,
      limit: limits.burst_limit,
      remaining: 0,
      reset: now + 1000,
      retryAfter: 1
    }
  }
  
  // Check minute limit
  const minuteCount = await redis.incr(minuteKey)
  if (minuteCount === 1) {
    await redis.expire(minuteKey, 60)
  }
  
  if (minuteCount > limits.requests_per_minute) {
    const ttl = await redis.ttl(minuteKey)
    return {
      allowed: false,
      limit: limits.requests_per_minute,
      remaining: 0,
      reset: now + (ttl * 1000),
      retryAfter: ttl
    }
  }
  
  // Check hour limit
  const hourCount = await redis.incr(hourKey)
  if (hourCount === 1) {
    await redis.expire(hourKey, 3600)
  }
  
  if (hourCount > limits.requests_per_hour) {
    const ttl = await redis.ttl(hourKey)
    return {
      allowed: false,
      limit: limits.requests_per_hour,
      remaining: 0,
      reset: now + (ttl * 1000),
      retryAfter: ttl
    }
  }
  
  return {
    allowed: true,
    limit: limits.requests_per_hour,
    remaining: limits.requests_per_hour - hourCount,
    reset: now + 3600000
  }
}

// Check for AI-specific rate limits
export async function checkAIRateLimit(
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'free'
): Promise<RateLimitResult> {
  const limits = RATE_LIMITS[tier]
  const now = Date.now()
  const today = new Date().toISOString().split('T')[0]
  
  if (limits.ai_requests_per_day === -1) {
    return {
      allowed: true,
      limit: -1,
      remaining: -1,
      reset: now + 86400000
    }
  }
  
  const key = `ai_limit:daily:${userId}:${today}`
  const count = await redis.incr(key)
  
  if (count === 1) {
    await redis.expire(key, 86400) // 24 hours
  }
  
  if (count > limits.ai_requests_per_day) {
    return {
      allowed: false,
      limit: limits.ai_requests_per_day,
      remaining: 0,
      reset: now + 86400000,
      retryAfter: 86400
    }
  }
  
  return {
    allowed: true,
    limit: limits.ai_requests_per_day,
    remaining: limits.ai_requests_per_day - count,
    reset: now + 86400000
  }
}

// DDoS detection
export async function checkDDoSPattern(req: NextRequest): Promise<boolean> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
  const now = Date.now()
  
  // Track requests per second from this IP
  const secondKey = `ddos:second:${ip}:${Math.floor(now / 1000)}`
  const secondCount = await redis.incr(secondKey)
  await redis.expire(secondKey, 2)
  
  if (secondCount > DDOS_THRESHOLDS.requests_per_second) {
    await logSuspiciousActivity(ip, 'high_request_rate', { count: secondCount })
    return true
  }
  
  // Track unique IPs per minute
  const minuteWindow = Math.floor(now / 60000)
  const uniqueIPKey = `ddos:ips:${minuteWindow}`
  await redis.sadd(uniqueIPKey, ip)
  await redis.expire(uniqueIPKey, 120)
  
  const uniqueIPs = await redis.scard(uniqueIPKey)
  if (uniqueIPs > DDOS_THRESHOLDS.unique_ips_per_minute) {
    await logSuspiciousActivity('global', 'too_many_unique_ips', { count: uniqueIPs })
  }
  
  // Check for suspicious patterns
  const patterns = await checkSuspiciousPatterns(req)
  if (patterns.score > DDOS_THRESHOLDS.suspicious_patterns_threshold) {
    await logSuspiciousActivity(ip, 'suspicious_patterns', patterns)
    return true
  }
  
  return false
}

// Check for suspicious request patterns
async function checkSuspiciousPatterns(req: NextRequest): Promise<{ score: number; reasons: string[] }> {
  const headersList = await headers()
  let score = 0
  const reasons: string[] = []
  
  // Check for missing common headers
  if (!headersList.get('user-agent')) {
    score += 3
    reasons.push('missing_user_agent')
  }
  
  if (!headersList.get('accept')) {
    score += 2
    reasons.push('missing_accept_header')
  }
  
  // Check for suspicious user agents
  const userAgent = headersList.get('user-agent') || ''
  const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    score += 5
    reasons.push('suspicious_user_agent')
  }
  
  // Check for rapid endpoint switching
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
  const endpointKey = `pattern:endpoints:${ip}`
  const endpoint = req.nextUrl.pathname
  
  await redis.sadd(endpointKey, endpoint)
  await redis.expire(endpointKey, 60)
  
  const endpointCount = await redis.scard(endpointKey)
  if (endpointCount > 20) {
    score += 4
    reasons.push('endpoint_scanning')
  }
  
  return { score, reasons }
}

// Log suspicious activity
async function logSuspiciousActivity(
  identifier: string,
  type: string,
  details: any
): Promise<void> {
  const key = `suspicious:${identifier}:${type}`
  const data = {
    timestamp: new Date().toISOString(),
    type,
    details
  }
  
  await redis.lpush(key, JSON.stringify(data))
  await redis.ltrim(key, 0, 99) // Keep last 100 entries
  await redis.expire(key, 86400) // 24 hours
  
  // Increment suspicious activity counter
  const counterKey = `suspicious:counter:${identifier}`
  const count = await redis.incr(counterKey)
  await redis.expire(counterKey, 3600) // 1 hour
  
  // Auto-block if too many suspicious activities
  if (count > 10) {
    await blockIP(identifier, 3600) // Block for 1 hour
  }
}

// Block an IP address
export async function blockIP(ip: string, duration: number): Promise<void> {
  const key = `blocked:${ip}`
  await redis.set(key, '1', 'EX', duration)
}

// Check if IP is blocked
export async function isBlocked(identifier: string): Promise<boolean> {
  const key = `blocked:${identifier}`
  const blocked = await redis.get(key)
  return blocked === '1'
}

// Cleanup old rate limit data
export async function cleanupRateLimitData(): Promise<void> {
  // This would be run as a cron job
  const patterns = [
    'rate_limit:*',
    'ddos:*',
    'pattern:*',
    'suspicious:*'
  ]
  
  for (const pattern of patterns) {
    const keys = await redis.keys(pattern)
    for (const key of keys) {
      const ttl = await redis.ttl(key)
      if (ttl === -1) {
        // No expiration set, check if it's old
        await redis.del(key)
      }
    }
  }
}

// Export rate limit headers
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
  }
}