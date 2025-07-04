/**
 * Health Check Endpoint
 * Used for monitoring application health
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { performanceMonitor } from '@/lib/performance/performance-monitor'

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
      services: 'unknown',
      performance: 'unknown',
      errors: []
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      health.database = 'connected'
    } catch (dbError) {
      health.database = 'error'
      health.errors.push(`Database: ${dbError.message}`)
      health.status = 'degraded'
    }

    // Test new services
    try {
      // Just try to import them without initializing
      const { utilityRateService } = await import('@/services/utility-rate-service')
      const { securityService } = await import('@/services/security-service')
      health.services = 'available'
    } catch (serviceError) {
      health.services = 'error'
      health.errors.push(`Services: ${serviceError.message}`)
      health.status = 'degraded'
    }

    // Test performance monitoring
    try {
      const systemMetrics = await performanceMonitor.collectSystemMetrics()
      health.performance = 'monitoring'
      health.system = {
        cpu: Math.round(systemMetrics.cpuUsage * 100),
        memory: Math.round(systemMetrics.memoryUsage * 100),
        disk: Math.round(systemMetrics.diskUsage * 100)
      }
    } catch (perfError) {
      health.performance = 'error'
      health.errors.push(`Performance monitoring: ${perfError.message}`)
    }

    const responseTime = performance.now() - startTime
    
    // Record the health check performance
    performanceMonitor.recordAPIMetrics('/api/health', 'GET', 200, responseTime)

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
    performanceMonitor.recordAPIMetrics('/api/health', 'GET', 503, responseTime)
    
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