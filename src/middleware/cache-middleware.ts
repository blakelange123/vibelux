/**
 * Cache Middleware
 * Automatic caching for API responses and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { cacheManager } from '@/lib/cache/cache-manager'
import { CacheUtils, CacheKeys } from '@/lib/cache/cache-decorators'

export interface CacheMiddlewareOptions {
  ttl?: number
  varyBy?: string[] // Headers to vary cache by
  skipCache?: (request: NextRequest) => boolean
  keyBuilder?: (request: NextRequest) => string
  onHit?: (key: string) => void
  onMiss?: (key: string) => void
}

/**
 * API Response Caching Middleware
 */
export function withCache(options: CacheMiddlewareOptions = {}) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      // Skip caching for non-GET requests by default
      if (request.method !== 'GET') {
        return await handler(request)
      }

      // Check if caching should be skipped
      if (options.skipCache?.(request)) {
        return await handler(request)
      }

      // Build cache key
      const cacheKey = options.keyBuilder 
        ? options.keyBuilder(request)
        : buildDefaultCacheKey(request, options.varyBy)

      try {
        // Try to get from cache
        const cached = await cacheManager.get<{
          body: any;
          status?: number;
          headers?: Record<string, string>;
        }>(cacheKey)

        if (cached) {
          options.onHit?.(cacheKey)
          
          // Return cached response
          return new NextResponse(
            JSON.stringify(cached.body),
            {
              status: cached.status || 200,
              headers: {
                ...cached.headers,
                'X-Cache': 'HIT',
                'X-Cache-Key': cacheKey.slice(-12)
              }
            }
          )
        }

        options.onMiss?.(cacheKey)

        // Execute handler
        const response = await handler(request)
        
        // Cache successful responses
        if (response.status >= 200 && response.status < 400) {
          const responseBody = await response.json()
          const responseHeaders: Record<string, string> = {}
          
          // Extract cacheable headers
          response.headers.forEach((value, key) => {
            if (shouldCacheHeader(key)) {
              responseHeaders[key] = value
            }
          })

          // Cache the response
          await cacheManager.set(
            cacheKey,
            {
              body: responseBody,
              status: response.status,
              headers: responseHeaders
            },
            {
              ttl: options.ttl || 60
            }
          )

          // Return response with cache headers
          return new NextResponse(
            JSON.stringify(responseBody),
            {
              status: response.status,
              headers: {
                ...responseHeaders,
                'Content-Type': 'application/json',
                'X-Cache': 'MISS',
                'X-Cache-Key': cacheKey.slice(-12)
              }
            }
          )
        }

        return response

      } catch (error) {
        console.error('Cache middleware error:', error)
        // Fall back to executing handler without caching
        return await handler(request)
      }
    }
  }
}

/**
 * Rate Limiting Middleware
 */
export function withRateLimit(options: {
  limit: number;
  windowMs: number;
  keyBuilder?: (request: NextRequest) => string;
  onLimit?: (identifier: string, limit: number) => void;
}) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      try {
        // Build rate limit key
        const identifier = options.keyBuilder 
          ? options.keyBuilder(request)
          : getClientIdentifier(request)

        // Check rate limit
        const { count, resetTime } = await CacheUtils.cacheRateLimit(
          identifier,
          options.limit,
          options.windowMs
        )

        // Check if limit exceeded
        if (count > options.limit) {
          options.onLimit?.(identifier, options.limit)
          
          return new NextResponse(
            JSON.stringify({
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
              resetTime,
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': options.limit.toString(),
                'X-RateLimit-Remaining': Math.max(0, options.limit - count).toString(),
                'X-RateLimit-Reset': resetTime.toString(),
                'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
              }
            }
          )
        }

        // Execute handler with rate limit headers
        const response = await handler(request)
        
        // Add rate limit headers to response
        response.headers.set('X-RateLimit-Limit', options.limit.toString())
        response.headers.set('X-RateLimit-Remaining', Math.max(0, options.limit - count).toString())
        response.headers.set('X-RateLimit-Reset', resetTime.toString())

        return response

      } catch (error) {
        console.error('Rate limit middleware error:', error)
        // Fall back to executing handler without rate limiting
        return await handler(request)
      }
    }
  }
}

/**
 * Cache Invalidation Middleware
 */
export function withCacheInvalidation(patterns: string | string[]) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      try {
        // Execute handler first
        const response = await handler(request)
        
        // Invalidate cache patterns on successful mutations
        if (response.status >= 200 && response.status < 400) {
          const invalidationPatterns = Array.isArray(patterns) ? patterns : [patterns]
          
          await Promise.all(
            invalidationPatterns.map(pattern => 
              cacheManager.invalidatePattern(pattern)
            )
          )
        }

        return response

      } catch (error) {
        console.error('Cache invalidation middleware error:', error)
        throw error
      }
    }
  }
}

/**
 * Smart Cache Middleware
 * Combines caching, rate limiting, and automatic invalidation
 */
export function withSmartCache(options: {
  cache?: CacheMiddlewareOptions
  rateLimit?: {
    limit: number;
    windowMs: number;
    keyBuilder?: (request: NextRequest) => string;
  }
  invalidatePatterns?: string[]
}) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    let wrappedHandler = handler

    // Apply cache invalidation (innermost)
    if (options.invalidatePatterns) {
      wrappedHandler = withCacheInvalidation(options.invalidatePatterns)(wrappedHandler)
    }

    // Apply rate limiting
    if (options.rateLimit) {
      wrappedHandler = withRateLimit(options.rateLimit)(wrappedHandler)
    }

    // Apply caching (outermost)
    if (options.cache) {
      wrappedHandler = withCache(options.cache)(wrappedHandler)
    }

    return wrappedHandler
  }
}

/**
 * Conditional Cache Middleware
 * Only caches responses based on custom conditions
 */
export function withConditionalCache(
  condition: (request: NextRequest, response: NextResponse) => boolean,
  options: CacheMiddlewareOptions = {}
) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      // Always try to get from cache first
      if (request.method === 'GET') {
        const cacheKey = options.keyBuilder 
          ? options.keyBuilder(request)
          : buildDefaultCacheKey(request, options.varyBy)

        const cached = await cacheManager.get<{
          body: any;
          status?: number;
          headers?: Record<string, string>;
        }>(cacheKey)
        if (cached) {
          return new NextResponse(
            JSON.stringify(cached.body),
            {
              status: cached.status || 200,
              headers: {
                ...cached.headers,
                'X-Cache': 'HIT'
              }
            }
          )
        }
      }

      // Execute handler
      const response = await handler(request)
      
      // Check condition before caching
      if (condition(request, response)) {
        const cacheKey = options.keyBuilder 
          ? options.keyBuilder(request)
          : buildDefaultCacheKey(request, options.varyBy)

        if (response.status >= 200 && response.status < 400) {
          const responseBody = await response.json()
          
          await cacheManager.set(
            cacheKey,
            {
              body: responseBody,
              status: response.status,
              headers: {}
            },
            {
              ttl: options.ttl || 60
            }
          )
        }
      }

      return response
    }
  }
}

// Helper functions

function buildDefaultCacheKey(request: NextRequest, varyBy?: string[]): string {
  const url = new URL(request.url)
  const baseKey = `${request.method}:${url.pathname}:${url.search}`
  
  if (!varyBy || varyBy.length === 0) {
    return CacheKeys.apiResponse(baseKey)
  }

  // Include vary headers in key
  const varyValues = varyBy
    .map(header => `${header}:${request.headers.get(header) || 'null'}`)
    .join('|')
  
  return CacheKeys.apiResponse(`${baseKey}:${varyValues}`)
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  
  return `ip:${ip}`
}

function shouldCacheHeader(headerName: string): boolean {
  const cacheableHeaders = [
    'content-type',
    'cache-control',
    'etag',
    'last-modified',
    'x-ratelimit-limit',
    'x-ratelimit-remaining'
  ]
  
  return cacheableHeaders.includes(headerName.toLowerCase())
}

export {
  withCache,
  withRateLimit,
  withCacheInvalidation,
  withSmartCache,
  withConditionalCache
}