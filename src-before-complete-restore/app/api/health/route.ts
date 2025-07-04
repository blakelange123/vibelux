/**
 * Health Check Endpoint
 * Used for monitoring application health
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const startTime = performance.now()
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
        unit: 'MB'
      },
      database: 'unknown',
      errors: []
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      health.database = 'connected'
    } catch (dbError: any) {
      health.database = 'error'
      health.errors.push(`Database: ${dbError.message}`)
      health.status = 'degraded'
    }

    const responseTime = performance.now() - startTime

    return NextResponse.json({
      ...health,
      responseTime: Math.round(responseTime)
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    const responseTime = performance.now() - startTime
    
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: Math.round(responseTime)
      },
      { status: 503 }
    )
  }
}