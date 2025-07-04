/**
 * Redis Health Check Endpoint
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For now, return a degraded status since Redis isn't configured
    // This can be updated when Redis is properly set up
    return NextResponse.json({
      status: 'degraded',
      redis: 'not configured',
      message: 'Redis not configured, using in-memory cache',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Redis health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        redis: 'error',
        error: error instanceof Error ? error.message : 'Check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}