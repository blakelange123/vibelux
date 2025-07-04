import { LRUCache } from 'lru-cache'
import { performanceMonitor } from './performance-monitor'

// Cache implementation with performance monitoring
export class PerformanceCache<K, V> {
  private cache: LRUCache<K, V>
  private hits = 0
  private misses = 0
  private name: string

  constructor(options: {
    max: number
    ttl?: number
    name: string
  }) {
    this.name = options.name
    this.cache = new LRUCache({
      max: options.max,
      ttl: options.ttl || 1000 * 60 * 15, // 15 minutes default
      updateAgeOnGet: true,
      allowStale: false
    })

    // Report metrics every minute
    setInterval(() => {
      this.reportMetrics()
    }, 60000)
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    
    if (value !== undefined) {
      this.hits++
      performanceMonitor.incrementCounter('cache.hits', 1, { cache: this.name })
    } else {
      this.misses++
      performanceMonitor.incrementCounter('cache.misses', 1, { cache: this.name })
    }

    return value
  }

  set(key: K, value: V): void {
    this.cache.set(key, value)
    performanceMonitor.incrementCounter('cache.sets', 1, { cache: this.name })
  }

  delete(key: K): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      performanceMonitor.incrementCounter('cache.deletes', 1, { cache: this.name })
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    performanceMonitor.incrementCounter('cache.clears', 1, { cache: this.name })
  }

  getHitRate(): number {
    const total = this.hits + this.misses
    return total > 0 ? this.hits / total : 0
  }

  private reportMetrics(): void {
    const hitRate = this.getHitRate()
    performanceMonitor.setGauge('cache.hit_rate', hitRate, { cache: this.name })
    performanceMonitor.setGauge('cache.size', this.cache.size, { cache: this.name })
  }
}

// Database query optimization
export class QueryOptimizer {
  private static queryCache = new PerformanceCache<string, any>({
    max: 1000,
    ttl: 1000 * 60 * 5, // 5 minutes
    name: 'query_cache'
  })

  static async executeWithCache<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.queryCache.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    // Execute query with performance monitoring
    const result = await performanceMonitor.timeFunction(
      'db_query',
      queryFn,
      { cache_key: cacheKey }
    )

    // Cache the result
    this.queryCache.set(cacheKey, result)

    return result
  }

  static clearCache(pattern?: string): void {
    if (pattern) {
      // Clear specific pattern - would need more complex implementation
      this.queryCache.clear()
    } else {
      this.queryCache.clear()
    }
  }
}

// Request deduplication for preventing duplicate API calls
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      performanceMonitor.incrementCounter('request.deduplicated', 1, { key })
      return this.pendingRequests.get(key)!
    }

    // Execute request
    const promise = performanceMonitor.timeFunction(
      'deduplicated_request',
      async () => {
        try {
          return await requestFn()
        } finally {
          this.pendingRequests.delete(key)
        }
      },
      { key }
    )

    this.pendingRequests.set(key, promise)
    return promise
  }
}

// Batch processing for database operations
export class BatchProcessor<T, R> {
  private queue: Array<{ item: T; resolve: (result: R) => void; reject: (error: Error) => void }> = []
  private timer: NodeJS.Timeout | null = null
  private processing = false

  constructor(
    private batchProcessor: (items: T[]) => Promise<R[]>,
    private batchSize: number = 100,
    private batchTimeout: number = 100
  ) {}

  async process(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ item, resolve, reject })

      if (this.queue.length >= this.batchSize) {
        this.flush()
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.batchTimeout)
      }
    })
  }

  private async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const batch = this.queue.splice(0, this.batchSize)
    const items = batch.map(b => b.item)

    try {
      const results = await performanceMonitor.timeFunction(
        'batch_process',
        () => this.batchProcessor(items),
        { batch_size: batch.length.toString() }
      )

      // Resolve all promises with their corresponding results
      batch.forEach((b, index) => {
        b.resolve(results[index])
      })

      performanceMonitor.incrementCounter('batch.processed', batch.length)
    } catch (error) {
      // Reject all promises with the error
      batch.forEach(b => {
        b.reject(error as Error)
      })

      performanceMonitor.incrementCounter('batch.failed', batch.length)
    } finally {
      this.processing = false

      // Process remaining queue if any
      if (this.queue.length > 0) {
        setImmediate(() => this.flush())
      }
    }
  }
}

// Memory usage optimization
export class MemoryOptimizer {
  private static intervals: NodeJS.Timeout[] = []

  static startMonitoring(): void {
    // Monitor memory usage every 30 seconds
    const memoryInterval = setInterval(() => {
      const usage = process.memoryUsage()
      
      performanceMonitor.setGauge('memory.heap_used', usage.heapUsed)
      performanceMonitor.setGauge('memory.heap_total', usage.heapTotal)
      performanceMonitor.setGauge('memory.external', usage.external)
      performanceMonitor.setGauge('memory.rss', usage.rss)

      // Calculate memory usage percentage
      const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100
      performanceMonitor.setGauge('memory.heap_usage_percent', heapUsagePercent)

      // Trigger garbage collection if memory usage is high
      if (heapUsagePercent > 85) {
        this.forceGarbageCollection()
      }
    }, 30000)

    this.intervals.push(memoryInterval)
  }

  static stopMonitoring(): void {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
  }

  private static forceGarbageCollection(): void {
    if (global.gc) {
      performanceMonitor.incrementCounter('gc.forced')
      global.gc()
    }
  }

  static getMemoryUsage(): {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
    heapUsagePercent: number
  } {
    const usage = process.memoryUsage()
    return {
      ...usage,
      heapUsagePercent: (usage.heapUsed / usage.heapTotal) * 100
    }
  }
}

// Connection pooling for external services
export class ConnectionPool<T> {
  private pool: T[] = []
  private inUse = new Set<T>()
  private waiting: Array<{ resolve: (conn: T) => void; reject: (error: Error) => void }> = []

  constructor(
    private createConnection: () => Promise<T>,
    private destroyConnection: (conn: T) => Promise<void>,
    private validateConnection: (conn: T) => Promise<boolean>,
    private minSize: number = 2,
    private maxSize: number = 10,
    private maxWaitTime: number = 5000
  ) {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Create minimum connections
    for (let i = 0; i < this.minSize; i++) {
      try {
        const conn = await this.createConnection()
        this.pool.push(conn)
      } catch (error) {
        console.error('Failed to create initial connection:', error)
      }
    }
  }

  async acquire(): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection pool timeout'))
        performanceMonitor.incrementCounter('connection_pool.timeout')
      }, this.maxWaitTime)

      try {
        // Try to get connection from pool
        let conn = this.pool.pop()

        // Create new connection if pool is empty and under max size
        if (!conn && this.getTotalConnections() < this.maxSize) {
          conn = await this.createConnection()
          performanceMonitor.incrementCounter('connection_pool.created')
        }

        if (conn) {
          // Validate connection
          const isValid = await this.validateConnection(conn)
          if (!isValid) {
            await this.destroyConnection(conn)
            conn = await this.createConnection()
            performanceMonitor.incrementCounter('connection_pool.recreated')
          }

          this.inUse.add(conn)
          clearTimeout(timeout)
          resolve(conn)
          performanceMonitor.incrementCounter('connection_pool.acquired')
        } else {
          // Add to waiting queue
          this.waiting.push({ resolve, reject })
          performanceMonitor.incrementCounter('connection_pool.waiting')
        }
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
        performanceMonitor.incrementCounter('connection_pool.acquire_failed')
      }
    })
  }

  async release(conn: T): Promise<void> {
    this.inUse.delete(conn)

    // Check if someone is waiting
    const waiter = this.waiting.shift()
    if (waiter) {
      this.inUse.add(conn)
      waiter.resolve(conn)
      performanceMonitor.incrementCounter('connection_pool.released_to_waiter')
    } else {
      // Return to pool
      this.pool.push(conn)
      performanceMonitor.incrementCounter('connection_pool.released')
    }

    // Update pool size metrics
    performanceMonitor.setGauge('connection_pool.available', this.pool.length)
    performanceMonitor.setGauge('connection_pool.in_use', this.inUse.size)
  }

  getTotalConnections(): number {
    return this.pool.length + this.inUse.size
  }

  async destroy(): Promise<void> {
    // Destroy all connections
    const allConnections = [...this.pool, ...this.inUse]
    
    for (const conn of allConnections) {
      try {
        await this.destroyConnection(conn)
      } catch (error) {
        console.error('Failed to destroy connection:', error)
      }
    }

    this.pool = []
    this.inUse.clear()

    // Reject all waiting requests
    while (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!
      waiter.reject(new Error('Connection pool destroyed'))
    }
  }
}

// Performance-aware pagination
export class PerformancePagination {
  static async paginate<T>(
    query: (offset: number, limit: number) => Promise<T[]>,
    countQuery: () => Promise<number>,
    page: number = 1,
    pageSize: number = 20,
    maxPageSize: number = 100
  ): Promise<{
    data: T[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    // Enforce maximum page size for performance
    const limitedPageSize = Math.min(pageSize, maxPageSize)
    const offset = (page - 1) * limitedPageSize

    const timerId = performanceMonitor.startTimer('pagination_query', {
      page: page.toString(),
      page_size: limitedPageSize.toString()
    })

    try {
      // Execute queries in parallel
      const [data, total] = await Promise.all([
        query(offset, limitedPageSize),
        countQuery()
      ])

      const totalPages = Math.ceil(total / limitedPageSize)

      performanceMonitor.endTimer(timerId, { 
        status: 'success',
        total_items: total.toString()
      })

      return {
        data,
        pagination: {
          page,
          pageSize: limitedPageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      performanceMonitor.endTimer(timerId, { status: 'error' })
      throw error
    }
  }
}

// Export utility instances
export const requestDeduplicator = new RequestDeduplicator()

// Create shared caches
export const sharedCaches = {
  fixtures: new PerformanceCache<string, any>({
    max: 1000,
    ttl: 1000 * 60 * 30, // 30 minutes
    name: 'fixtures'
  }),
  
  calculations: new PerformanceCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 15, // 15 minutes
    name: 'calculations'
  }),
  
  users: new PerformanceCache<string, any>({
    max: 10000,
    ttl: 1000 * 60 * 5, // 5 minutes
    name: 'users'
  })
}

// Initialize memory monitoring
MemoryOptimizer.startMonitoring()