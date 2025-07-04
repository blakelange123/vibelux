/**
 * In-Memory Cache Implementation
 * Fast L1 cache for frequently accessed data
 */

export interface MemoryCacheOptions {
  maxSize?: number
  defaultTtl?: number
  checkInterval?: number // Cleanup interval in seconds
}

export interface MemoryCacheItem<T = any> {
  value: T
  expires: number
  accessed: number
  created: number
}

export interface MemoryCacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  size: number
  hitRate: number
}

export class MemoryCache {
  private cache = new Map<string, MemoryCacheItem>()
  private options: Required<MemoryCacheOptions>
  private stats: MemoryCacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  }
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options: MemoryCacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 1000,
      defaultTtl: options.defaultTtl || 3600,
      checkInterval: options.checkInterval || 300
    }

    // Start cleanup interval
    this.startCleanup()
  }

  /**
   * Get value from memory cache
   */
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size--
      this.updateHitRate()
      return null
    }

    // Update access time
    item.accessed = Date.now()
    
    this.stats.hits++
    this.updateHitRate()
    
    return item.value as T
  }

  /**
   * Set value in memory cache
   */
  set<T = any>(key: string, value: T, options: { ttl?: number } = {}): boolean {
    try {
      const ttl = options.ttl || this.options.defaultTtl
      const now = Date.now()
      
      const item: MemoryCacheItem<T> = {
        value,
        expires: now + (ttl * 1000),
        accessed: now,
        created: now
      }

      // Check if we need to evict items
      if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
        this.evictLRU()
      }

      // Set the item
      const wasUpdate = this.cache.has(key)
      this.cache.set(key, item)
      
      if (!wasUpdate) {
        this.stats.size++
      }
      
      this.stats.sets++
      return true

    } catch (error) {
      console.error('Memory cache set error:', error)
      return false
    }
  }

  /**
   * Delete from memory cache
   */
  del(key: string): boolean {
    const deleted = this.cache.delete(key)
    
    if (deleted) {
      this.stats.deletes++
      this.stats.size--
    }
    
    return deleted
  }

  /**
   * Check if key exists (without updating access time)
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      this.stats.size--
      return false
    }

    return true
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    this.cleanupExpired()
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clear cache by pattern
   */
  clear(pattern: string = '*'): number {
    if (pattern === '*') {
      return this.clearAll() ? this.cache.size : 0
    }

    const regex = this.patternToRegex(pattern)
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      this.stats.deletes++
    })

    this.stats.size = this.cache.size
    return keysToDelete.length
  }

  /**
   * Clear all cache entries
   */
  clearAll(): boolean {
    try {
      const size = this.cache.size
      this.cache.clear()
      this.stats.deletes += size
      this.stats.size = 0
      return true
    } catch (error) {
      console.error('Memory cache clear error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): MemoryCacheStats {
    return { ...this.stats }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.cache.size,
      hitRate: 0
    }
  }

  /**
   * Get cache info for debugging
   */
  getInfo(): {
    size: number
    maxSize: number
    usage: number
    oldestItem: number
    newestItem: number
  } {
    this.cleanupExpired()
    
    let oldest = Date.now()
    let newest = 0
    
    for (const item of this.cache.values()) {
      oldest = Math.min(oldest, item.created)
      newest = Math.max(newest, item.created)
    }

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      usage: (this.cache.size / this.options.maxSize) * 100,
      oldestItem: oldest,
      newestItem: newest
    }
  }

  /**
   * Check if cache is healthy
   */
  isHealthy(): boolean {
    return this.cache.size <= this.options.maxSize && this.stats.hitRate >= 0
  }

  /**
   * Get TTL for key
   */
  getTTL(key: string): number {
    const item = this.cache.get(key)
    
    if (!item) {
      return -1
    }

    const ttl = Math.max(0, item.expires - Date.now())
    return Math.floor(ttl / 1000)
  }

  /**
   * Update TTL for existing key
   */
  expire(key: string, ttl: number): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    item.expires = Date.now() + (ttl * 1000)
    return true
  }

  /**
   * Get multiple values
   */
  mget<T = any>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key))
  }

  /**
   * Set multiple values
   */
  mset<T = any>(keyValuePairs: Record<string, T>, options: { ttl?: number } = {}): boolean {
    try {
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        this.set(key, value, options)
      })
      return true
    } catch (error) {
      console.error('Memory cache mset error:', error)
      return false
    }
  }

  /**
   * Cleanup and destroy cache
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    
    this.cache.clear()
    this.resetStats()
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
    }, this.options.checkInterval * 1000)
  }

  private cleanupExpired(): number {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })

    this.stats.size = this.cache.size
    return keysToDelete.length
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestAccess = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (item.accessed < oldestAccess) {
        oldestAccess = item.accessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
      this.stats.size--
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  private patternToRegex(pattern: string): RegExp {
    // Convert simple glob pattern to regex
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*/g, '.*') // Convert * to .*
      .replace(/\?/g, '.') // Convert ? to .
    
    return new RegExp(`^${escaped}$`)
  }
}

export default MemoryCache