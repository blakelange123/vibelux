/**
 * Cache Statistics API
 * Provides real-time cache performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { cacheManager } from '@/lib/cache/cache-manager'
import { CacheUtils } from '@/lib/cache/cache-decorators'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    
    // Get comprehensive cache metrics
    const metrics = cacheManager.getMetrics()
    const healthCheck = await cacheManager.healthCheck()
    
    // Additional performance metrics
    const performanceMetrics = CacheUtils.getPerformanceMetrics()
    
    // Calculate efficiency metrics
    const efficiencyMetrics = {
      memoryEfficiency: metrics.l1.hitRate,
      redisEfficiency: metrics.l2.hitRate,
      overallEfficiency: metrics.overall.hitRate,
      memorySavings: {
        requestsSavedFromRedis: metrics.l1.hits,
        estimatedLatencySaved: metrics.l1.hits * 5, // Assume 5ms saved per memory hit
      },
      redisSavings: {
        requestsSavedFromDatabase: metrics.l2.hits,
        estimatedLatencySaved: metrics.l2.hits * 50, // Assume 50ms saved per Redis hit
      }
    }

    // Cache size and usage statistics
    const usageStats = {
      memoryCache: {
        currentSize: metrics.l1.size,
        maxSize: 1000, // From memory cache configuration
        utilizationPercent: (metrics.l1.size / 1000) * 100
      },
      redisCache: {
        connected: healthCheck.redis,
        operationalStatus: healthCheck.redis ? 'healthy' : 'disconnected'
      }
    }

    // Recent performance trends (mock data - in production would come from metrics storage)
    const trends = {
      last24Hours: {
        averageHitRate: metrics.overall.hitRate,
        peakHitRate: Math.min(100, metrics.overall.hitRate + 10),
        lowestHitRate: Math.max(0, metrics.overall.hitRate - 15),
        totalRequests: metrics.overall.hits + metrics.overall.misses,
        cacheEvictions: 0 // Would come from actual metrics
      },
      recommendations: generateRecommendations(metrics, healthCheck)
    }

    return NextResponse.json({
      status: 'success',
      timestamp: Date.now(),
      metrics: {
        cache: metrics,
        health: healthCheck,
        efficiency: efficiencyMetrics,
        usage: usageStats,
        trends
      },
      meta: {
        adminUser: user.userId,
        requestTime: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    )
  }
}

function generateRecommendations(metrics: any, healthCheck: any): string[] {
  const recommendations: string[] = []

  // Hit rate recommendations
  if (metrics.overall.hitRate < 70) {
    recommendations.push('Consider increasing cache TTL values for better hit rates')
  }

  if (metrics.l1.hitRate < 80 && metrics.l1.size < 500) {
    recommendations.push('Memory cache has capacity for more items - consider caching more frequently accessed data')
  }

  if (metrics.l2.hitRate > 90 && metrics.l1.hitRate < 60) {
    recommendations.push('Consider moving high-hit Redis items to memory cache for better performance')
  }

  // Health recommendations
  if (!healthCheck.redis) {
    recommendations.push('Redis connection is down - cache performance will be degraded')
  }

  if (!healthCheck.memory) {
    recommendations.push('Memory cache is experiencing issues - check memory usage')
  }

  // Performance recommendations
  if (metrics.overall.misses > metrics.overall.hits) {
    recommendations.push('High cache miss ratio - review caching strategy and TTL values')
  }

  if (metrics.l1.size >= 950) { // Close to max size
    recommendations.push('Memory cache is near capacity - consider increasing max size or reducing TTL')
  }

  // Default recommendation if everything looks good
  if (recommendations.length === 0) {
    recommendations.push('Cache performance is optimal - no immediate actions needed')
  }

  return recommendations
}

export const GET = requireAdmin(handler)