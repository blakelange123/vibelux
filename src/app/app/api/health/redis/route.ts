/**
 * Redis Health Check Endpoint
 */

import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/cache/redis-client'

export async function GET() {
  try {
    const redis = getRedisClient()
    
    if (!redis) {
      return NextResponse.json({
        status: 'degraded',
        redis: 'not configured',
        message: 'Redis not configured, using in-memory cache',
        timestamp: new Date().toISOString()
      })
    }

    // Test Redis connection
    const startTime = Date.now()
    await redis.ping()
    const pingTime = Date.now() - startTime

    // Get Redis info
    const info = await redis.info('memory')
    const memoryUsed = info.match(/used_memory_human:(.+)/)?.[1] || 'unknown'
    
    return NextResponse.json({
      status: 'healthy',
      redis: 'connected',
      pingTime: `${pingTime}ms`,
      memory: memoryUsed,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Redis health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        redis: 'disconnected',
        error: error instanceof Error ? error.message : 'Connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}