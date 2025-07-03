// Production monitoring and alerting system
import { createClient } from '@vercel/postgres'
import { Redis } from 'ioredis'

interface SystemMetrics {
  timestamp: number
  cpu_usage: number
  memory_usage: number
  response_time: number
  error_rate: number
  active_users: number
  ai_requests_per_minute: number
  cache_hit_rate: number
  database_connections: number
}

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: number
  acknowledged: boolean
  resolved: boolean
}

export class ProductionMonitor {
  private redis: Redis
  private alerts: Alert[] = []
  private metrics: SystemMetrics[] = []
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  }
  
  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = Date.now()
    
    // Collect system metrics
    const metrics: SystemMetrics = {
      timestamp,
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(),
      response_time: await this.getAverageResponseTime(),
      error_rate: await this.getErrorRate(),
      active_users: await this.getActiveUsers(),
      ai_requests_per_minute: await this.getAIRequestRate(),
      cache_hit_rate: await this.getCacheHitRate(),
      database_connections: await this.getDatabaseConnections()
    }
    
    // Store metrics
    await this.storeMetrics(metrics)
    
    // Check for alerts
    await this.checkAlerts(metrics)
    
    return metrics
  }
  
  private async getCPUUsage(): Promise<number> {
    // In a real implementation, this would read from system monitoring
    // For now, simulate based on request load
    const requestCount = await this.redis.get('requests_last_minute') || '0'
    const load = parseInt(requestCount) / 100 // Normalize to percentage
    return Math.min(load, 100)
  }
  
  private async getMemoryUsage(): Promise<number> {
    // Simulate memory usage based on active connections
    const connections = await this.getDatabaseConnections()
    return Math.min((connections * 2), 100) // Each connection ~2% memory
  }
  
  private async getAverageResponseTime(): Promise<number> {
    const responseTimesKey = 'response_times_last_5min'
    const responseTimes = await this.redis.lrange(responseTimesKey, 0, -1)
    
    if (responseTimes.length === 0) return 0
    
    const times = responseTimes.map(t => parseFloat(t))
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }
  
  private async getErrorRate(): Promise<number> {
    const totalRequests = await this.redis.get('total_requests_last_hour') || '0'
    const errorRequests = await this.redis.get('error_requests_last_hour') || '0'
    
    const total = parseInt(totalRequests)
    const errors = parseInt(errorRequests)
    
    return total > 0 ? (errors / total) * 100 : 0
  }
  
  private async getActiveUsers(): Promise<number> {
    // Count unique user sessions in the last 5 minutes
    const activeSessionsKey = 'active_sessions'
    const sessions = await this.redis.smembers(activeSessionsKey)
    return sessions.length
  }
  
  private async getAIRequestRate(): Promise<number> {
    const aiRequestsKey = 'ai_requests_last_minute'
    const requests = await this.redis.get(aiRequestsKey) || '0'
    return parseInt(requests)
  }
  
  private async getCacheHitRate(): Promise<number> {
    const cacheHits = await this.redis.get('cache_hits_last_hour') || '0'
    const cacheMisses = await this.redis.get('cache_misses_last_hour') || '0'
    
    const hits = parseInt(cacheHits)
    const misses = parseInt(cacheMisses)
    const total = hits + misses
    
    return total > 0 ? (hits / total) * 100 : 0
  }
  
  private async getDatabaseConnections(): Promise<number> {
    try {
      const client = createClient()
      await client.connect()
      
      const result = await client.sql`
        SELECT count(*) as connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `
      
      await client.end()
      return result.rows[0]?.connections || 0
    } catch (error) {
      console.error('Failed to get database connections:', error)
      return 0
    }
  }
  
  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    // Store in Redis for real-time monitoring
    await this.redis.lpush('system_metrics', JSON.stringify(metrics))
    await this.redis.ltrim('system_metrics', 0, 1000) // Keep last 1000 entries
    
    // Store in InfluxDB for long-term analysis
    if (process.env.INFLUXDB_URL) {
      await this.storeInInfluxDB(metrics)
    }
  }
  
  private async storeInInfluxDB(metrics: SystemMetrics): Promise<void> {
    // InfluxDB line protocol format
    const lineProtocol = `
system_metrics,host=production cpu_usage=${metrics.cpu_usage},memory_usage=${metrics.memory_usage},response_time=${metrics.response_time},error_rate=${metrics.error_rate},active_users=${metrics.active_users},ai_requests_per_minute=${metrics.ai_requests_per_minute},cache_hit_rate=${metrics.cache_hit_rate},database_connections=${metrics.database_connections} ${metrics.timestamp}000000
    `.trim()
    
    try {
      const response = await fetch(`${process.env.INFLUXDB_URL}/api/v2/write?org=${process.env.INFLUXDB_ORG}&bucket=${process.env.INFLUXDB_BUCKET}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.INFLUXDB_TOKEN}`,
          'Content-Type': 'text/plain'
        },
        body: lineProtocol
      })
      
      if (!response.ok) {
        console.error('Failed to write to InfluxDB:', response.statusText)
      }
    } catch (error) {
      console.error('Error writing to InfluxDB:', error)
    }
  }
  
  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const alerts: Alert[] = []
    
    // Critical alerts
    if (metrics.error_rate > 5) {
      alerts.push({
        id: `error_rate_${Date.now()}`,
        type: 'critical',
        message: `High error rate: ${metrics.error_rate.toFixed(2)}%`,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      })
    }
    
    if (metrics.response_time > 5000) {
      alerts.push({
        id: `response_time_${Date.now()}`,
        type: 'critical',
        message: `Slow response time: ${metrics.response_time.toFixed(0)}ms`,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      })
    }
    
    if (metrics.database_connections > 80) {
      alerts.push({
        id: `db_connections_${Date.now()}`,
        type: 'critical',
        message: `High database connections: ${metrics.database_connections}`,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      })
    }
    
    // Warning alerts
    if (metrics.cpu_usage > 80) {
      alerts.push({
        id: `cpu_usage_${Date.now()}`,
        type: 'warning',
        message: `High CPU usage: ${metrics.cpu_usage.toFixed(1)}%`,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      })
    }
    
    if (metrics.memory_usage > 85) {
      alerts.push({
        id: `memory_usage_${Date.now()}`,
        type: 'warning',
        message: `High memory usage: ${metrics.memory_usage.toFixed(1)}%`,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      })
    }
    
    if (metrics.cache_hit_rate < 60) {
      alerts.push({
        id: `cache_hit_rate_${Date.now()}`,
        type: 'warning',
        message: `Low cache hit rate: ${metrics.cache_hit_rate.toFixed(1)}%`,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      })
    }
    
    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert)
    }
  }
  
  private async sendAlert(alert: Alert): Promise<void> {
    // Store alert
    this.alerts.push(alert)
    await this.redis.lpush('system_alerts', JSON.stringify(alert))
    await this.redis.ltrim('system_alerts', 0, 100) // Keep last 100 alerts
    
    // Send to monitoring channels
    if (alert.type === 'critical') {
      await this.sendSlackAlert(alert)
      await this.sendEmailAlert(alert)
      await this.sendPagerDutyAlert(alert)
    } else if (alert.type === 'warning') {
      await this.sendSlackAlert(alert)
    }
    
  }
  
  private async sendSlackAlert(alert: Alert): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) return
    
    const color = alert.type === 'critical' ? '#ff0000' : '#ffa500'
    const emoji = alert.type === 'critical' ? '🚨' : '⚠️'
    
    const message = {
      attachments: [{
        color,
        title: `${emoji} Vibelux Production Alert`,
        fields: [
          {
            title: 'Type',
            value: alert.type,
            short: true
          },
          {
            title: 'Message',
            value: alert.message,
            short: true
          },
          {
            title: 'Time',
            value: new Date(alert.timestamp).toISOString(),
            short: true
          }
        ]
      }]
    }
    
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
    } catch (error) {
      console.error('Failed to send Slack alert:', error)
    }
  }
  
  private async sendEmailAlert(alert: Alert): Promise<void> {
    // Implementation would use your email service (SendGrid, SES, etc.)
  }
  
  private async sendPagerDutyAlert(alert: Alert): Promise<void> {
    if (!process.env.PAGERDUTY_INTEGRATION_KEY) return
    
    const payload = {
      routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
      event_action: 'trigger',
      payload: {
        summary: alert.message,
        severity: alert.type === 'critical' ? 'critical' : 'warning',
        source: 'vibelux-production',
        component: 'monitoring-system',
        group: 'infrastructure',
        class: 'system-alert'
      }
    }
    
    try {
      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to send PagerDuty alert:', error)
    }
  }
  
  // Dashboard data for monitoring UI
  async getDashboardData() {
    const recentMetrics = await this.redis.lrange('system_metrics', 0, 59) // Last 60 entries
    const recentAlerts = await this.redis.lrange('system_alerts', 0, 9)    // Last 10 alerts
    
    const metrics = recentMetrics.map(m => JSON.parse(m)).reverse()
    const alerts = recentAlerts.map(a => JSON.parse(a))
    
    const latestMetrics = metrics[metrics.length - 1] || null
    
    return {
      current: latestMetrics,
      history: metrics,
      alerts: alerts,
      status: this.getSystemStatus(latestMetrics),
      uptime: await this.getUptime()
    }
  }
  
  private getSystemStatus(metrics: SystemMetrics | null): 'healthy' | 'warning' | 'critical' {
    if (!metrics) return 'critical'
    
    if (metrics.error_rate > 5 || metrics.response_time > 5000 || metrics.database_connections > 80) {
      return 'critical'
    }
    
    if (metrics.cpu_usage > 80 || metrics.memory_usage > 85 || metrics.cache_hit_rate < 60) {
      return 'warning'
    }
    
    return 'healthy'
  }
  
  private async getUptime(): Promise<number> {
    const startTime = await this.redis.get('system_start_time')
    if (!startTime) {
      await this.redis.set('system_start_time', Date.now())
      return 0
    }
    
    return Date.now() - parseInt(startTime)
  }
  
  // Acknowledge an alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    const alertsData = await this.redis.lrange('system_alerts', 0, -1)
    const alerts = alertsData.map(a => JSON.parse(a))
    
    const alertIndex = alerts.findIndex(a => a.id === alertId)
    if (alertIndex !== -1) {
      alerts[alertIndex].acknowledged = true
      
      // Update in Redis
      await this.redis.del('system_alerts')
      for (const alert of alerts.reverse()) {
        await this.redis.lpush('system_alerts', JSON.stringify(alert))
      }
    }
  }
  
  // Resolve an alert
  async resolveAlert(alertId: string): Promise<void> {
    const alertsData = await this.redis.lrange('system_alerts', 0, -1)
    const alerts = alertsData.map(a => JSON.parse(a))
    
    const alertIndex = alerts.findIndex(a => a.id === alertId)
    if (alertIndex !== -1) {
      alerts[alertIndex].resolved = true
      alerts[alertIndex].acknowledged = true
      
      // Update in Redis
      await this.redis.del('system_alerts')
      for (const alert of alerts.reverse()) {
        await this.redis.lpush('system_alerts', JSON.stringify(alert))
      }
    }
  }
  
  // Health check for load balancer
  async healthCheck(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      claude: await this.checkClaude(),
      memory: await this.checkMemory()
    }
    
    const allHealthy = Object.values(checks).every(check => check)
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks
    }
  }
  
  private async checkDatabase(): Promise<boolean> {
    try {
      const client = createClient()
      await client.connect()
      await client.sql`SELECT 1`
      await client.end()
      return true
    } catch {
      return false
    }
  }
  
  private async checkRedis(): Promise<boolean> {
    try {
      await this.redis.ping()
      return true
    } catch {
      return false
    }
  }
  
  private async checkClaude(): Promise<boolean> {
    // In production, you might want to make a lightweight test request
    return !!process.env.CLAUDE_API_KEY
  }
  
  private async checkMemory(): Promise<boolean> {
    const usage = await this.getMemoryUsage()
    return usage < 90 // Fail health check if memory > 90%
  }
}

// Export singleton instance
export const productionMonitor = new ProductionMonitor()

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  // Collect metrics every 30 seconds
  setInterval(() => {
    productionMonitor.collectMetrics().catch(console.error)
  }, 30000)
  
}