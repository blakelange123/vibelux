// AI Assistant monitoring and error tracking
interface AIMetrics {
  endpoint: string
  userId: string
  timestamp: Date
  responseTime: number
  tokensUsed: number
  cost: number
  success: boolean
  errorType?: string
  errorMessage?: string
  userQuery: string
  aiResponse: string
}

interface AIHealthMetrics {
  totalRequests: number
  successRate: number
  avgResponseTime: number
  totalCost: number
  topErrors: Array<{ error: string; count: number }>
  peakUsageHour: number
}

class AIMonitor {
  private metrics: AIMetrics[] = []
  private readonly MAX_METRICS = 10000

  // Track AI request
  async trackRequest(
    endpoint: string,
    userId: string,
    userQuery: string,
    execution: () => Promise<any>
  ): Promise<any> {
    const startTime = Date.now()
    const timestamp = new Date()
    
    try {
      const result = await execution()
      const responseTime = Date.now() - startTime
      
      // Extract metrics from result
      const tokensUsed = result.usage?.input_tokens + result.usage?.output_tokens || 0
      const cost = this.calculateCost(result.usage?.input_tokens || 0, result.usage?.output_tokens || 0)
      
      this.addMetric({
        endpoint,
        userId,
        timestamp,
        responseTime,
        tokensUsed,
        cost,
        success: true,
        userQuery: this.sanitizeQuery(userQuery),
        aiResponse: this.sanitizeResponse(result.response || result.content?.[0]?.text || '')
      })
      
      return result
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      this.addMetric({
        endpoint,
        userId,
        timestamp,
        responseTime,
        tokensUsed: 0,
        cost: 0,
        success: false,
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        userQuery: this.sanitizeQuery(userQuery),
        aiResponse: ''
      })
      
      // Log error with context
      console.error('AI Request Failed:', {
        endpoint,
        userId,
        error: error instanceof Error ? error.message : error,
        userQuery: this.sanitizeQuery(userQuery),
        responseTime
      })
      
      throw error
    }
  }

  // Get health metrics for monitoring
  getHealthMetrics(timeframe = 24): AIHealthMetrics {
    const cutoff = new Date(Date.now() - timeframe * 60 * 60 * 1000)
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        totalCost: 0,
        topErrors: [],
        peakUsageHour: 0
      }
    }
    
    const totalRequests = recentMetrics.length
    const successfulRequests = recentMetrics.filter(m => m.success).length
    const successRate = (successfulRequests / totalRequests) * 100
    
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
    const totalCost = recentMetrics.reduce((sum, m) => sum + m.cost, 0)
    
    // Top errors
    const errorCounts = new Map<string, number>()
    recentMetrics.filter(m => !m.success).forEach(m => {
      if (m.errorType) {
        errorCounts.set(m.errorType, (errorCounts.get(m.errorType) || 0) + 1)
      }
    })
    
    const topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Peak usage hour
    const hourCounts = new Map<number, number>()
    recentMetrics.forEach(m => {
      const hour = m.timestamp.getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })
    
    const peakUsageHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0
    
    return {
      totalRequests,
      successRate,
      avgResponseTime,
      totalCost,
      topErrors,
      peakUsageHour
    }
  }

  // Get user-specific metrics
  getUserMetrics(userId: string, timeframe = 24): Partial<AIHealthMetrics> {
    const cutoff = new Date(Date.now() - timeframe * 60 * 60 * 1000)
    const userMetrics = this.metrics.filter(m => 
      m.userId === userId && m.timestamp > cutoff
    )
    
    if (userMetrics.length === 0) return {}
    
    return {
      totalRequests: userMetrics.length,
      successRate: (userMetrics.filter(m => m.success).length / userMetrics.length) * 100,
      avgResponseTime: userMetrics.reduce((sum, m) => sum + m.responseTime, 0) / userMetrics.length,
      totalCost: userMetrics.reduce((sum, m) => sum + m.cost, 0)
    }
  }

  // Check for anomalies
  detectAnomalies(): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const anomalies: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> = []
    const recentMetrics = this.metrics.filter(m => 
      m.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    )
    
    if (recentMetrics.length === 0) return anomalies
    
    // High error rate
    const errorRate = (recentMetrics.filter(m => !m.success).length / recentMetrics.length) * 100
    if (errorRate > 20) {
      anomalies.push({
        type: 'HIGH_ERROR_RATE',
        message: `Error rate is ${errorRate.toFixed(1)}% in the last hour`,
        severity: errorRate > 50 ? 'high' : 'medium'
      })
    }
    
    // Slow response times
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    if (avgResponseTime > 10000) { // 10 seconds
      anomalies.push({
        type: 'SLOW_RESPONSE',
        message: `Average response time is ${(avgResponseTime / 1000).toFixed(1)} seconds`,
        severity: avgResponseTime > 30000 ? 'high' : 'medium'
      })
    }
    
    // High cost spike
    const hourCost = recentMetrics.reduce((sum, m) => sum + m.cost, 0)
    if (hourCost > 10) { // $10/hour
      anomalies.push({
        type: 'HIGH_COST',
        message: `Cost in last hour: $${hourCost.toFixed(2)}`,
        severity: hourCost > 50 ? 'high' : 'medium'
      })
    }
    
    return anomalies
  }

  // Export metrics for analysis
  exportMetrics(userId?: string, timeframe = 24): string {
    const cutoff = new Date(Date.now() - timeframe * 60 * 60 * 1000)
    let metricsToExport = this.metrics.filter(m => m.timestamp > cutoff)
    
    if (userId) {
      metricsToExport = metricsToExport.filter(m => m.userId === userId)
    }
    
    return JSON.stringify(metricsToExport, null, 2)
  }

  private addMetric(metric: AIMetrics): void {
    this.metrics.push(metric)
    
    // Cleanup old metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude pricing: $3/1M input, $15/1M output
    return (inputTokens * 0.003 + outputTokens * 0.015) / 1000
  }

  private sanitizeQuery(query: string): string {
    // Remove potential PII and limit length
    return query.substring(0, 500).replace(/\b\d{10,}\b/g, '[NUMBER]')
  }

  private sanitizeResponse(response: string): string {
    // Limit response length for storage
    return response.substring(0, 1000)
  }
}

export const aiMonitor = new AIMonitor()
export type { AIMetrics, AIHealthMetrics }