import { performance } from 'perf_hooks'

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: number
  tags: Record<string, string>
  type: 'timing' | 'counter' | 'gauge' | 'histogram'
}

export interface DatabaseMetrics {
  activeConnections: number
  totalConnections: number
  queryDuration: number
  slowQueries: number
  queryCount: number
}

export interface CacheMetrics {
  hitRate: number
  missRate: number
  evictions: number
  memoryUsage: number
  keyCount: number
}

export interface APIMetrics {
  requestCount: number
  responseTime: number
  errorRate: number
  throughput: number
  queueDepth: number
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIO: number
  uptime: number
}

export interface WebVitalsMetrics {
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  fid: number // First Input Delay
  lcp: number // Largest Contentful Paint
  ttfb: number // Time to First Byte
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers: Map<string, number> = new Map()
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()

  // Start a performance timer
  startTimer(name: string, tags: Record<string, string> = {}): string {
    const id = `${name}_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
    this.timers.set(id, performance.now())
    return id
  }

  // End a performance timer and record the duration
  endTimer(id: string, tags: Record<string, string> = {}): number {
    const startTime = this.timers.get(id)
    if (!startTime) {
      console.warn(`Timer ${id} not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(id)

    this.recordMetric({
      id,
      name: id.split('_')[0],
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags,
      type: 'timing'
    })

    return duration
  }

  // Time a function execution
  async timeFunction<T>(
    name: string, 
    fn: () => Promise<T> | T, 
    tags: Record<string, string> = {}
  ): Promise<T> {
    const timerId = this.startTimer(name, tags)
    try {
      const result = await fn()
      this.endTimer(timerId, { ...tags, status: 'success' })
      return result
    } catch (error) {
      this.endTimer(timerId, { ...tags, status: 'error' })
      throw error
    }
  }

  // Increment a counter
  incrementCounter(name: string, value: number = 1, tags: Record<string, string> = {}): void {
    const currentValue = this.counters.get(name) || 0
    const newValue = currentValue + value
    this.counters.set(name, newValue)

    this.recordMetric({
      id: `${name}_${Date.now()}`,
      name,
      value: newValue,
      unit: 'count',
      timestamp: Date.now(),
      tags,
      type: 'counter'
    })
  }

  // Set a gauge value
  setGauge(name: string, value: number, tags: Record<string, string> = {}): void {
    this.gauges.set(name, value)

    this.recordMetric({
      id: `${name}_${Date.now()}`,
      name,
      value,
      unit: 'value',
      timestamp: Date.now(),
      tags,
      type: 'gauge'
    })
  }

  // Record a histogram value
  recordHistogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const values = this.histograms.get(name) || []
    values.push(value)
    this.histograms.set(name, values)

    this.recordMetric({
      id: `${name}_${Date.now()}`,
      name,
      value,
      unit: 'value',
      timestamp: Date.now(),
      tags,
      type: 'histogram'
    })
  }

  // Record database performance metrics
  async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    const timerId = this.startTimer('db_metrics_collection')
    
    try {
      // In production, these would be real database queries
      const metrics: DatabaseMetrics = {
        activeConnections: await this.getActiveConnections(),
        totalConnections: await this.getTotalConnections(),
        queryDuration: await this.getAverageQueryDuration(),
        slowQueries: await this.getSlowQueryCount(),
        queryCount: await this.getQueryCount()
      }

      // Record individual metrics
      this.setGauge('db.active_connections', metrics.activeConnections)
      this.setGauge('db.total_connections', metrics.totalConnections)
      this.setGauge('db.avg_query_duration', metrics.queryDuration)
      this.setGauge('db.slow_queries', metrics.slowQueries)
      this.incrementCounter('db.query_count', metrics.queryCount)

      this.endTimer(timerId, { status: 'success' })
      return metrics
    } catch (error) {
      this.endTimer(timerId, { status: 'error' })
      throw error
    }
  }

  // Record cache performance metrics
  async collectCacheMetrics(): Promise<CacheMetrics> {
    const timerId = this.startTimer('cache_metrics_collection')
    
    try {
      const metrics: CacheMetrics = {
        hitRate: await this.getCacheHitRate(),
        missRate: await this.getCacheMissRate(),
        evictions: await this.getCacheEvictions(),
        memoryUsage: await this.getCacheMemoryUsage(),
        keyCount: await this.getCacheKeyCount()
      }

      // Record individual metrics
      this.setGauge('cache.hit_rate', metrics.hitRate)
      this.setGauge('cache.miss_rate', metrics.missRate)
      this.setGauge('cache.evictions', metrics.evictions)
      this.setGauge('cache.memory_usage', metrics.memoryUsage)
      this.setGauge('cache.key_count', metrics.keyCount)

      this.endTimer(timerId, { status: 'success' })
      return metrics
    } catch (error) {
      this.endTimer(timerId, { status: 'error' })
      throw error
    }
  }

  // Record API performance metrics
  recordAPIMetrics(endpoint: string, method: string, statusCode: number, duration: number): void {
    const tags = { endpoint, method, status_code: statusCode.toString() }
    
    this.recordHistogram('api.response_time', duration, tags)
    this.incrementCounter('api.requests', 1, tags)
    
    if (statusCode >= 400) {
      this.incrementCounter('api.errors', 1, tags)
    }
    
    if (statusCode >= 500) {
      this.incrementCounter('api.server_errors', 1, tags)
    }
  }

  // Record system metrics
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const timerId = this.startTimer('system_metrics_collection')
    
    try {
      const metrics: SystemMetrics = {
        cpuUsage: await this.getCPUUsage(),
        memoryUsage: await this.getMemoryUsage(),
        diskUsage: await this.getDiskUsage(),
        networkIO: await this.getNetworkIO(),
        uptime: process.uptime()
      }

      // Record individual metrics
      this.setGauge('system.cpu_usage', metrics.cpuUsage)
      this.setGauge('system.memory_usage', metrics.memoryUsage)
      this.setGauge('system.disk_usage', metrics.diskUsage)
      this.setGauge('system.network_io', metrics.networkIO)
      this.setGauge('system.uptime', metrics.uptime)

      this.endTimer(timerId, { status: 'success' })
      return metrics
    } catch (error) {
      this.endTimer(timerId, { status: 'error' })
      throw error
    }
  }

  // Get performance statistics
  getStatistics(metricName: string, timeWindow: number = 60000): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } {
    const cutoff = Date.now() - timeWindow
    const values = this.metrics
      .filter(m => m.name === metricName && m.timestamp > cutoff)
      .map(m => m.value)
      .sort((a, b) => a - b)

    if (values.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 }
    }

    const count = values.length
    const min = values[0]
    const max = values[values.length - 1]
    const avg = values.reduce((sum, val) => sum + val, 0) / count
    const p50 = this.percentile(values, 50)
    const p95 = this.percentile(values, 95)
    const p99 = this.percentile(values, 99)

    return { count, min, max, avg, p50, p95, p99 }
  }

  // Export metrics for external monitoring systems
  exportMetrics(format: 'prometheus' | 'json' | 'influxdb' = 'json'): string {
    switch (format) {
      case 'prometheus':
        return this.exportPrometheusFormat()
      case 'influxdb':
        return this.exportInfluxDBFormat()
      default:
        return JSON.stringify(this.metrics)
    }
  }

  // Clean up old metrics
  cleanup(maxAge: number = 300000): void { // 5 minutes default
    const cutoff = Date.now() - maxAge
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
  }

  // Private helper methods
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Send to external monitoring system if configured
    this.sendToExternalMonitoring(metric)
  }

  private percentile(values: number[], p: number): number {
    const index = Math.ceil(values.length * (p / 100)) - 1
    return values[index] || 0
  }

  private async sendToExternalMonitoring(metric: PerformanceMetric): Promise<void> {
    // Send to InfluxDB, Prometheus, or other monitoring systems
    try {
      if (process.env.INFLUXDB_URL) {
        await this.sendToInfluxDB(metric)
      }
    } catch (error) {
      console.warn('Failed to send metric to external monitoring:', error)
    }
  }

  private async sendToInfluxDB(metric: PerformanceMetric): Promise<void> {
    // InfluxDB integration would go here
    // This is a placeholder for the actual implementation
  }

  private exportPrometheusFormat(): string {
    const lines: string[] = []
    const grouped = this.groupMetricsByName()

    for (const [name, metrics] of grouped) {
      const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_')
      
      for (const metric of metrics) {
        const labels = Object.entries(metric.tags)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',')
        
        lines.push(`${sanitizedName}{${labels}} ${metric.value} ${metric.timestamp}`)
      }
    }

    return lines.join('\n')
  }

  private exportInfluxDBFormat(): string {
    const lines: string[] = []
    
    for (const metric of this.metrics) {
      const tags = Object.entries(metric.tags)
        .map(([key, value]) => `${key}=${value}`)
        .join(',')
      
      lines.push(`${metric.name},${tags} value=${metric.value} ${metric.timestamp * 1000000}`)
    }

    return lines.join('\n')
  }

  private groupMetricsByName(): Map<string, PerformanceMetric[]> {
    const grouped = new Map<string, PerformanceMetric[]>()
    
    for (const metric of this.metrics) {
      if (!grouped.has(metric.name)) {
        grouped.set(metric.name, [])
      }
      grouped.get(metric.name)!.push(metric)
    }
    
    return grouped
  }

  // Mock implementations for system metrics (replace with real implementations)
  private async getActiveConnections(): Promise<number> {
    // Mock implementation
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10
  }

  private async getTotalConnections(): Promise<number> {
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100) + 50
  }

  private async getAverageQueryDuration(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 10
  }

  private async getSlowQueryCount(): Promise<number> {
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5)
  }

  private async getQueryCount(): Promise<number> {
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000) + 100
  }

  private async getCacheHitRate(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3 + 0.7 // 70-100%
  }

  private async getCacheMissRate(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3 // 0-30%
  }

  private async getCacheEvictions(): Promise<number> {
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10)
  }

  private async getCacheMemoryUsage(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1024 * 1024 * 100 // MB
  }

  private async getCacheKeyCount(): Promise<number> {
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000) + 1000
  }

  private async getCPUUsage(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8 + 0.1 // 10-90%
  }

  private async getMemoryUsage(): Promise<number> {
    const memUsage = process.memoryUsage()
    return memUsage.heapUsed / memUsage.heapTotal
  }

  private async getDiskUsage(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.6 + 0.2 // 20-80%
  }

  private async getNetworkIO(): Promise<number> {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000000 // bytes/sec
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Middleware for automatic API monitoring
export function createPerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = performance.now()
    const timerId = performanceMonitor.startTimer('api_request', {
      method: req.method,
      endpoint: req.route?.path || req.path
    })

    // Override res.end to capture response time
    const originalEnd = res.end
    res.end = function(...args: any[]) {
      const duration = performance.now() - startTime
      
      performanceMonitor.recordAPIMetrics(
        req.route?.path || req.path,
        req.method,
        res.statusCode,
        duration
      )
      
      performanceMonitor.endTimer(timerId, {
        status_code: res.statusCode.toString()
      })
      
      originalEnd.apply(res, args)
    }

    next()
  }
}

// Web Vitals monitoring for client-side
export function recordWebVitals(vitals: WebVitalsMetrics): void {
  performanceMonitor.setGauge('web_vitals.cls', vitals.cls)
  performanceMonitor.setGauge('web_vitals.fcp', vitals.fcp)
  performanceMonitor.setGauge('web_vitals.fid', vitals.fid)
  performanceMonitor.setGauge('web_vitals.lcp', vitals.lcp)
  performanceMonitor.setGauge('web_vitals.ttfb', vitals.ttfb)
}