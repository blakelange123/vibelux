/**
 * Redis Client Configuration
 * High-performance caching layer for VibeLux
 */

import Redis from 'ioredis'
import { env } from '@/lib/env-validator'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
  compress?: boolean
  serialize?: boolean
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  hitRate: number
}

class RedisClient {
  private client: Redis | null = null
  private isConnected = false
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0
  }

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      const redisUrl = env.get('REDIS_URL') || 'redis://localhost:6379'
      
      this.client = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        db: env.get('NODE_ENV') === 'test' ? 1 : 0, // Use different DB for tests
      })

      this.client.on('connect', () => {
        this.isConnected = true
      })

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
        this.isConnected = false
        this.stats.errors++
      })

      this.client.on('close', () => {
        this.isConnected = false
      })

      // Test connection
      await this.client.ping()
      
    } catch (error) {
      console.error('Failed to initialize Redis client:', error)
      this.client = null
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      this.stats.misses++
      return null
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options.prefix)
      const value = await this.client.get(prefixedKey)
      
      if (value === null) {
        this.stats.misses++
        return null
      }

      this.stats.hits++
      this.updateHitRate()

      // Deserialize if needed
      if (options.serialize !== false) {
        try {
          return JSON.parse(value) as T
        } catch {
          return value as T
        }
      }

      return value as T

    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.errors++
      this.stats.misses++
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string, 
    value: any, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options.prefix)
      let serializedValue: string

      // Serialize if needed
      if (options.serialize !== false) {
        serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
      } else {
        serializedValue = value
      }

      // Set with TTL if specified
      if (options.ttl) {
        await this.client.setex(prefixedKey, options.ttl, serializedValue)
      } else {
        await this.client.set(prefixedKey, serializedValue)
      }

      this.stats.sets++
      return true

    } catch (error) {
      console.error('Cache set error:', error)
      this.stats.errors++
      return false
    }
  }

  /**
   * Delete from cache
   */
  async del(key: string | string[], options: CacheOptions = {}): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0
    }

    try {
      const keys = Array.isArray(key) ? key : [key]
      const prefixedKeys = keys.map(k => this.getPrefixedKey(k, options.prefix))
      
      const deletedCount = await this.client.del(...prefixedKeys)
      this.stats.deletes += deletedCount
      
      return deletedCount

    } catch (error) {
      console.error('Cache delete error:', error)
      this.stats.errors++
      return 0
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options.prefix)
      const exists = await this.client.exists(prefixedKey)
      return exists === 1

    } catch (error) {
      console.error('Cache exists error:', error)
      this.stats.errors++
      return false
    }
  }

  /**
   * Set expiration for key
   */
  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options.prefix)
      const result = await this.client.expire(prefixedKey, ttl)
      return result === 1

    } catch (error) {
      console.error('Cache expire error:', error)
      this.stats.errors++
      return false
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T = any>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    if (!this.client || !this.isConnected) {
      return new Array(keys.length).fill(null)
    }

    try {
      const prefixedKeys = keys.map(key => this.getPrefixedKey(key, options.prefix))
      const values = await this.client.mget(...prefixedKeys)
      
      return values.map(value => {
        if (value === null) {
          this.stats.misses++
          return null
        }

        this.stats.hits++
        
        if (options.serialize !== false) {
          try {
            return JSON.parse(value) as T
          } catch {
            return value as T
          }
        }

        return value as T
      })

    } catch (error) {
      console.error('Cache mget error:', error)
      this.stats.errors++
      this.stats.misses += keys.length
      return new Array(keys.length).fill(null)
    } finally {
      this.updateHitRate()
    }
  }

  /**
   * Set multiple values at once
   */
  async mset(keyValuePairs: Record<string, any>, options: CacheOptions = {}): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      const pipeline = this.client.pipeline()
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const prefixedKey = this.getPrefixedKey(key, options.prefix)
        let serializedValue: string

        if (options.serialize !== false) {
          serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
        } else {
          serializedValue = value
        }

        if (options.ttl) {
          pipeline.setex(prefixedKey, options.ttl, serializedValue)
        } else {
          pipeline.set(prefixedKey, serializedValue)
        }
      })

      await pipeline.exec()
      this.stats.sets += Object.keys(keyValuePairs).length
      
      return true

    } catch (error) {
      console.error('Cache mset error:', error)
      this.stats.errors++
      return false
    }
  }

  /**
   * Clear all keys with pattern
   */
  async clear(pattern: string = '*', options: CacheOptions = {}): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0
    }

    try {
      const prefixedPattern = this.getPrefixedKey(pattern, options.prefix)
      const keys = await this.client.keys(prefixedPattern)
      
      if (keys.length === 0) {
        return 0
      }

      const deletedCount = await this.client.del(...keys)
      this.stats.deletes += deletedCount
      
      return deletedCount

    } catch (error) {
      console.error('Cache clear error:', error)
      this.stats.errors++
      return 0
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options.prefix)
      const result = await this.client.incr(prefixedKey)
      
      if (options.ttl) {
        await this.client.expire(prefixedKey, options.ttl)
      }
      
      return result

    } catch (error) {
      console.error('Cache incr error:', error)
      this.stats.errors++
      return 0
    }
  }

  /**
   * Decrement counter
   */
  async decr(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0
    }

    try {
      const prefixedKey = this.getPrefixedKey(key, options.prefix)
      const result = await this.client.decr(prefixedKey)
      
      if (options.ttl) {
        await this.client.expire(prefixedKey, options.ttl)
      }
      
      return result

    } catch (error) {
      console.error('Cache decr error:', error)
      this.stats.errors++
      return 0
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    }
  }

  /**
   * Get connection status
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
      this.isConnected = false
    }
  }

  /**
   * Flush all data (use with caution)
   */
  async flushAll(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false
    }

    try {
      await this.client.flushdb()
      this.resetStats()
      return true

    } catch (error) {
      console.error('Cache flush error:', error)
      this.stats.errors++
      return false
    }
  }

  private getPrefixedKey(key: string, prefix?: string): string {
    const basePrefix = 'vibelux:'
    const customPrefix = prefix ? `${prefix}:` : ''
    return `${basePrefix}${customPrefix}${key}`
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }
}

// Export singleton instance
export const redisClient = new RedisClient()

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redisClient.close()
})

process.on('SIGINT', async () => {
  await redisClient.close()
})

export default redisClient