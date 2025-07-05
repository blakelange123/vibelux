/**
 * Multi-Level Cache Manager
 * Provides intelligent caching with Redis + Memory layers
 */

import { redisClient } from './redis-client'
import { MemoryCache } from './memory-cache'

export interface CacheStrategy {
  l1?: boolean // Memory cache
  l2?: boolean // Redis cache
  ttl?: number // Time to live in seconds
  prefix?: string
  invalidatePattern?: string
  refreshAfter?: number // Refresh threshold in seconds
}

export interface CacheKey {
  namespace: string
  identifier: string
  version?: string
}

export interface CacheMetrics {
  l1: {
    hits: number
    misses: number
    hitRate: number
    size: number
  }
  l2: {
    hits: number
    misses: number
    hitRate: number
  }
  overall: {
    hits: number
    misses: number
    hitRate: number
  }
}

class CacheManager {
  private memoryCache: MemoryCache
  private defaultStrategy: CacheStrategy = {
    l1: true,
    l2: true,
    ttl: 3600, // 1 hour default
  }

  // Cache namespace configurations
  private strategies: Record<string, CacheStrategy> = {
    // Short-lived, frequently accessed
    'api:response': {
      l1: true,
      l2: true,
      ttl: 300, // 5 minutes
      refreshAfter: 240 // Refresh after 4 minutes
    },
    
    // Medium-lived, session data
    'user:session': {
      l1: true,
      l2: true,
      ttl: 3600, // 1 hour
      refreshAfter: 2700 // Refresh after 45 minutes
    },
    
    // Long-lived, relatively static
    'fixtures:catalog': {
      l1: true,
      l2: true,
      ttl: 86400, // 24 hours
      refreshAfter: 21600 // Refresh after 6 hours
    },
    
    // Very long-lived, rarely changing
    'crops:database': {
      l1: true,
      l2: true,
      ttl: 604800, // 7 days
      refreshAfter: 432000 // Refresh after 5 days
    },
    
    // Real-time data, short cache
    'sensors:data': {
      l1: true,
      l2: false, // Too frequent for Redis
      ttl: 60, // 1 minute
    },
    
    // Search results, medium cache
    'search:results': {
      l1: true,
      l2: true,
      ttl: 1800, // 30 minutes
      refreshAfter: 1200 // Refresh after 20 minutes
    },
    
    // User preferences, persistent
    'user:preferences': {
      l1: true,
      l2: true,
      ttl: 7200, // 2 hours
      refreshAfter: 5400 // Refresh after 1.5 hours
    },
    
    // Rate limiting, short-lived
    'rate:limit': {
      l1: false, // Don't cache in memory
      l2: true,
      ttl: 3600, // 1 hour
    },
    
    // File/image cache, long-lived
    'assets:metadata': {
      l1: true,
      l2: true,
      ttl: 43200, // 12 hours
      refreshAfter: 32400 // Refresh after 9 hours
    }
  }

  constructor() {
    this.memoryCache = new MemoryCache({
      maxSize: 1000, // Max 1000 items in memory
      defaultTtl: 3600,
      checkInterval: 300 // Clean up every 5 minutes
    })
  }

  /**
   * Get value from cache with multi-level strategy
   */
  async get<T = any>(
    key: CacheKey | string,
    strategy?: Partial<CacheStrategy>
  ): Promise<T | null> {
    const cacheKey = this.buildKey(key)
    const config = this.getStrategy(cacheKey, strategy)
    
    // Try L1 cache (memory) first
    if (config.l1) {
      const l1Value = this.memoryCache.get<T>(cacheKey)
      if (l1Value !== null) {
        return l1Value
      }
    }

    // Try L2 cache (Redis)
    if (config.l2) {
      const l2Value = await redisClient.get<T>(cacheKey, {
        ttl: config.ttl,
        prefix: config.prefix
      })

      if (l2Value !== null) {
        // Populate L1 cache for faster future access
        if (config.l1) {
          this.memoryCache.set(cacheKey, l2Value, { ttl: Math.min(config.ttl || 3600, 3600) })
        }
        return l2Value
      }
    }

    return null
  }

  /**
   * Set value in cache with multi-level strategy
   */
  async set<T = any>(
    key: CacheKey | string,
    value: T,
    strategy?: Partial<CacheStrategy>
  ): Promise<boolean> {
    const cacheKey = this.buildKey(key)
    const config = this.getStrategy(cacheKey, strategy)
    
    let l1Success = true
    let l2Success = true

    // Set in L1 cache (memory)
    if (config.l1) {
      l1Success = this.memoryCache.set(cacheKey, value, { 
        ttl: Math.min(config.ttl || 3600, 3600) // Limit memory cache to 1 hour max
      })
    }

    // Set in L2 cache (Redis)
    if (config.l2) {
      l2Success = await redisClient.set(cacheKey, value, {
        ttl: config.ttl,
        prefix: config.prefix
      })
    }

    return l1Success && l2Success
  }

  /**
   * Delete from all cache levels
   */
  async del(
    key: CacheKey | string | (CacheKey | string)[],
    strategy?: Partial<CacheStrategy>
  ): Promise<number> {
    const keys = Array.isArray(key) ? key : [key]
    const cacheKeys = keys.map(k => this.buildKey(k))
    let deletedCount = 0

    for (const cacheKey of cacheKeys) {
      const config = this.getStrategy(cacheKey, strategy)
      
      // Delete from L1 cache
      if (config.l1) {
        if (this.memoryCache.del(cacheKey)) {
          deletedCount++
        }
      }

      // Delete from L2 cache
      if (config.l2) {
        const l2Deleted = await redisClient.del(cacheKey, {
          prefix: config.prefix
        })
        deletedCount += l2Deleted
      }
    }

    return deletedCount
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T = any>(
    key: CacheKey | string,
    factory: () => Promise<T> | T,
    strategy?: Partial<CacheStrategy>
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, strategy)
    if (cached !== null) {
      return cached
    }

    // Compute value
    const value = await factory()
    
    // Cache the computed value
    await this.set(key, value, strategy)
    
    return value
  }

  /**
   * Refresh cache entry if it's getting stale
   */
  async refreshIfStale<T = any>(
    key: CacheKey | string,
    factory: () => Promise<T> | T,
    strategy?: Partial<CacheStrategy>
  ): Promise<T | null> {
    const cacheKey = this.buildKey(key)
    const config = this.getStrategy(cacheKey, strategy)
    
    // Check if we need to refresh based on age
    if (config.refreshAfter && config.l2) {
      const ttl = await redisClient.client?.ttl(cacheKey)
      const age = (config.ttl || 3600) - (ttl || 0)
      
      if (age > config.refreshAfter) {
        // Refresh in background
        this.refreshInBackground(key, factory, strategy)
      }
    }

    return await this.get<T>(key, strategy)
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string, strategy?: Partial<CacheStrategy>): Promise<number> {
    let deletedCount = 0
    
    // Clear from memory cache
    deletedCount += this.memoryCache.clear(pattern)
    
    // Clear from Redis
    deletedCount += await redisClient.clear(pattern, {
      prefix: strategy?.prefix
    })
    
    return deletedCount
  }

  /**
   * Invalidate namespace
   */
  async invalidateNamespace(namespace: string): Promise<number> {
    const pattern = `${namespace}:*`
    return await this.invalidatePattern(pattern)
  }

  /**
   * Warm cache with pre-computed values
   */
  async warmCache<T = any>(
    entries: Array<{ key: CacheKey | string; value: T; strategy?: Partial<CacheStrategy> }>
  ): Promise<boolean> {
    const promises = entries.map(entry => 
      this.set(entry.key, entry.value, entry.strategy)
    )
    
    const results = await Promise.all(promises)
    return results.every(result => result)
  }

  /**
   * Batch get multiple keys
   */
  async mget<T = any>(
    keys: (CacheKey | string)[],
    strategy?: Partial<CacheStrategy>
  ): Promise<(T | null)[]> {
    const cacheKeys = keys.map(k => this.buildKey(k))
    const config = this.getStrategy('batch', strategy)
    
    const results: (T | null)[] = new Array(keys.length).fill(null)
    const missingIndices: number[] = []

    // Try L1 cache first
    if (config.l1) {
      cacheKeys.forEach((cacheKey, index) => {
        const value = this.memoryCache.get<T>(cacheKey)
        if (value !== null) {
          results[index] = value
        } else {
          missingIndices.push(index)
        }
      })
    } else {
      missingIndices.push(...cacheKeys.map((_, index) => index))
    }

    // Get missing keys from L2 cache
    if (config.l2 && missingIndices.length > 0) {
      const missingKeys = missingIndices.map(i => cacheKeys[i])
      const l2Values = await redisClient.mget<T>(missingKeys, {
        ttl: config.ttl,
        prefix: config.prefix
      })

      missingIndices.forEach((originalIndex, l2Index) => {
        const value = l2Values[l2Index]
        if (value !== null) {
          results[originalIndex] = value
          
          // Populate L1 cache
          if (config.l1) {
            this.memoryCache.set(cacheKeys[originalIndex], value, { 
              ttl: Math.min(config.ttl || 3600, 3600) 
            })
          }
        }
      })
    }

    return results
  }

  /**
   * Batch set multiple keys
   */
  async mset<T = any>(
    entries: Array<{ key: CacheKey | string; value: T }>,
    strategy?: Partial<CacheStrategy>
  ): Promise<boolean> {
    const config = this.getStrategy('batch', strategy)
    
    let l1Success = true
    let l2Success = true

    // Set in L1 cache
    if (config.l1) {
      entries.forEach(entry => {
        const cacheKey = this.buildKey(entry.key)
        if (!this.memoryCache.set(cacheKey, entry.value, { 
          ttl: Math.min(config.ttl || 3600, 3600) 
        })) {
          l1Success = false
        }
      })
    }

    // Set in L2 cache
    if (config.l2) {
      const keyValuePairs: Record<string, T> = {}
      entries.forEach(entry => {
        const cacheKey = this.buildKey(entry.key)
        keyValuePairs[cacheKey] = entry.value
      })

      l2Success = await redisClient.mset(keyValuePairs, {
        ttl: config.ttl,
        prefix: config.prefix
      })
    }

    return l1Success && l2Success
  }

  /**
   * Get comprehensive cache metrics
   */
  getMetrics(): CacheMetrics {
    const memoryStats = this.memoryCache.getStats()
    const redisStats = redisClient.getStats() || { hits: 0, misses: 0, hitRate: 0 }
    
    const totalHits = memoryStats.hits + redisStats.hits
    const totalMisses = memoryStats.misses + redisStats.misses
    const totalOperations = totalHits + totalMisses
    
    return {
      l1: {
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hitRate,
        size: memoryStats.size
      },
      l2: {
        hits: redisStats.hits,
        misses: redisStats.misses,
        hitRate: redisStats.hitRate
      },
      overall: {
        hits: totalHits,
        misses: totalMisses,
        hitRate: totalOperations > 0 ? (totalHits / totalOperations) * 100 : 0
      }
    }
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<boolean> {
    const memoryCleared = this.memoryCache.clearAll()
    const redisCleared = await redisClient.flushAll()
    
    return memoryCleared && redisCleared
  }

  /**
   * Health check for cache system
   */
  async healthCheck(): Promise<{
    memory: boolean
    redis: boolean
    overall: boolean
  }> {
    const memoryHealth = this.memoryCache.isHealthy()
    const redisHealth = redisClient.isReady()
    
    return {
      memory: memoryHealth,
      redis: redisHealth,
      overall: memoryHealth && redisHealth
    }
  }

  private buildKey(key: CacheKey | string): string {
    if (typeof key === 'string') {
      return key
    }
    
    const parts = [key.namespace, key.identifier]
    if (key.version) {
      parts.push(key.version)
    }
    
    return parts.join(':')
  }

  private getStrategy(keyOrNamespace: string, override?: Partial<CacheStrategy>): CacheStrategy {
    // Extract namespace from key
    const namespace = keyOrNamespace.split(':')[0]
    
    // Get base strategy
    const baseStrategy = this.strategies[namespace] || this.defaultStrategy
    
    // Apply overrides
    return { ...baseStrategy, ...override }
  }

  private async refreshInBackground<T>(
    key: CacheKey | string,
    factory: () => Promise<T> | T,
    strategy?: Partial<CacheStrategy>
  ): Promise<void> {
    try {
      const value = await factory()
      await this.set(key, value, strategy)
    } catch (error) {
      console.error('Background cache refresh failed:', error)
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

export default cacheManager