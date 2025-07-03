import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth, connectionManager } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth()
    
    // Get system metrics
    const systemHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      connections: {
        active: connectionManager.getConnectionCount(),
        limit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
      },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    }

    // Determine overall health status
    const isHealthy = dbHealth.status === 'healthy' && 
                     connectionManager.getConnectionCount() < parseInt(process.env.DB_CONNECTION_LIMIT || '10')

    return NextResponse.json(
      {
        ...systemHealth,
        status: isHealthy ? 'healthy' : 'degraded'
      },
      { 
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        connections: {
          active: connectionManager.getConnectionCount(),
          limit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
        }
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      }
    )
  }
}