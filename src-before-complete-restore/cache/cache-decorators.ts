/**
 * Cache Decorators and Utilities
 * Provides easy-to-use caching decorators for functions and methods
 */

import { cacheManager, CacheStrategy } from './cache-manager'

export interface CacheDecoratorOptions extends Partial<CacheStrategy> {
  keyBuilder?: (...args: any[]) => string
  condition?: (...args: any[]) => boolean
  onHit?: (key: string, value: any) => void
  onMiss?: (key: string) => void
  onError?: (error: Error, key: string) => void
}

/**
 * Method decorator for caching function results
 */
export function Cache(options: CacheDecoratorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        // Check if caching should be applied
        if (options.condition && !options.condition.apply(this, args)) {
          return await originalMethod.apply(this, args)
        }

        // Build cache key
        const key = options.keyBuilder 
          ? options.keyBuilder.apply(this, args)
          : `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`

        // Try to get from cache
        const cached = await cacheManager.get(key, options)
        if (cached !== null) {
          options.onHit?.(key, cached)
          return cached
        }

        options.onMiss?.(key)

        // Execute original method
        const result = await originalMethod.apply(this, args)

        // Cache the result
        await cacheManager.set(key, result, options)

        return result

      } catch (error) {
        options.onError?.(error as Error, 'unknown')
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Decorator for caching with automatic invalidation
 */
export function CacheInvalidate(pattern: string, options: Partial<CacheStrategy> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        // Execute original method
        const result = await originalMethod.apply(this, args)

        // Invalidate cache pattern
        await cacheManager.invalidatePattern(pattern, options)

        return result

      } catch (error) {
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Utility functions for common caching patterns
 */
export class CacheUtils {
  /**
   * Memoize function with cache
   */
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    options: CacheDecoratorOptions = {}
  ): T {
    return (async (...args: any[]) => {
      const key = options.keyBuilder 
        ? options.keyBuilder(...args)
        : `memoized:${fn.name}:${JSON.stringify(args)}`

      return await cacheManager.getOrSet(key, () => fn(...args), options)
    }) as T
  }

  /**
   * Cache expensive computations
   */
  static async computeAndCache<T>(
    key: string,
    computation: () => Promise<T> | T,
    options: Partial<CacheStrategy> = {}
  ): Promise<T> {
    return await cacheManager.getOrSet(key, computation, options)
  }

  /**
   * Cache API responses
   */
  static async cacheApiResponse<T>(
    url: string,
    fetcher: () => Promise<T>,
    options: Partial<CacheStrategy> = {}
  ): Promise<T> {
    const key = `api:response:${this.hashString(url)}`
    return await cacheManager.getOrSet(key, fetcher, {
      ...options,
      prefix: 'api'
    })
  }

  /**
   * Cache user session data
   */
  static async cacheUserSession<T>(
    userId: string,
    sessionKey: string,
    data?: T,
    options: Partial<CacheStrategy> = {}
  ): Promise<T | null> {
    const key = `user:session:${userId}:${sessionKey}`
    
    if (data !== undefined) {
      await cacheManager.set(key, data, {
        ...options,
        prefix: 'user'
      })
      return data
    }
    
    return await cacheManager.get<T>(key, {
      ...options,
      prefix: 'user'
    })
  }

  /**
   * Cache search results
   */
  static async cacheSearchResults<T>(
    query: any,
    results?: T,
    options: Partial<CacheStrategy> = {}
  ): Promise<T | null> {
    const queryString = typeof query === 'string' ? query : JSON.stringify(query)
    const key = `search:results:${this.hashString(queryString)}`
    
    if (results !== undefined) {
      await cacheManager.set(key, results, {
        ...options,
        prefix: 'search'
      })
      return results
    }
    
    return await cacheManager.get<T>(key, {
      ...options,
      prefix: 'search'
    })
  }

  /**
   * Cache rate limiting data
   */
  static async cacheRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }> {
    const key = `rate:limit:${identifier}`
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const resetTime = windowStart + windowMs

    // Get current count
    let count = await cacheManager.get<number>(`${key}:${windowStart}`) || 0
    count++

    // Set new count with expiration
    await cacheManager.set(`${key}:${windowStart}`, count, {
      ttl: Math.ceil(windowMs / 1000),
      l1: false, // Don't cache rate limits in memory
      l2: true
    })

    return { count, resetTime }
  }

  /**
   * Cache file metadata
   */
  static async cacheFileMetadata<T>(
    filePath: string,
    metadata?: T,
    options: Partial<CacheStrategy> = {}
  ): Promise<T | null> {
    const key = `assets:metadata:${this.hashString(filePath)}`
    
    if (metadata !== undefined) {
      await cacheManager.set(key, metadata, {
        ...options,
        prefix: 'assets'
      })
      return metadata
    }
    
    return await cacheManager.get<T>(key, {
      ...options,
      prefix: 'assets'
    })
  }

  /**
   * Batch cache operations
   */
  static async batchGet<T>(
    keys: string[],
    options: Partial<CacheStrategy> = {}
  ): Promise<(T | null)[]> {
    return await cacheManager.mget<T>(keys, options)
  }

  static async batchSet<T>(
    entries: Array<{ key: string; value: T }>,
    options: Partial<CacheStrategy> = {}
  ): Promise<boolean> {
    return await cacheManager.mset(entries, options)
  }

  /**
   * Cache warming utilities
   */
  static async warmupCache<T>(
    warmupData: Array<{ 
      key: string
      factory: () => Promise<T> | T
      strategy?: Partial<CacheStrategy>
    }>
  ): Promise<void> {
    const promises = warmupData.map(async ({ key, factory, strategy }) => {
      try {
        const value = await factory()
        await cacheManager.set(key, value, strategy)
      } catch (error) {
        console.error(`Cache warmup failed for key ${key}:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Cache invalidation utilities
   */
  static async invalidateUser(userId: string): Promise<number> {
    return await cacheManager.invalidatePattern(`user:*:${userId}:*`)
  }

  static async invalidateSearch(): Promise<number> {
    return await cacheManager.invalidateNamespace('search')
  }

  static async invalidateApi(pattern: string = '*'): Promise<number> {
    return await cacheManager.invalidatePattern(`api:*:${pattern}`)
  }

  /**
   * Cache monitoring utilities
   */
  static getPerformanceMetrics() {
    return cacheManager.getMetrics()
  }

  static async healthCheck() {
    return await cacheManager.healthCheck()
  }

  /**
   * Hash string for consistent key generation
   */
  private static hashString(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }
}

/**
 * Typed cache namespace builders
 */
export class CacheKeys {
  static fixture(id: string): string {
    return `fixtures:catalog:${id}`
  }

  static fixtureSearch(queryHash: string): string {
    return `search:results:fixtures:${queryHash}`
  }

  static cropData(cropName: string): string {
    return `crops:database:${cropName}`
  }

  static userSession(userId: string, sessionKey: string): string {
    return `user:session:${userId}:${sessionKey}`
  }

  static userPreferences(userId: string): string {
    return `user:preferences:${userId}`
  }

  static sensorData(sensorId: string): string {
    return `sensors:data:${sensorId}`
  }

  static apiResponse(endpoint: string, params: string = ''): string {
    const hash = CacheUtils['hashString'](`${endpoint}:${params}`)
    return `api:response:${hash}`
  }

  static rateLimit(identifier: string): string {
    return `rate:limit:${identifier}`
  }

  static assetMetadata(assetPath: string): string {
    const hash = CacheUtils['hashString'](assetPath)
    return `assets:metadata:${hash}`
  }
}

export default CacheUtils