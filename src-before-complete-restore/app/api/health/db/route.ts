/**
 * Database Health Check Endpoint
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const queryTime = Date.now() - startTime

    // Get connection stats - check if tables exist first
    const stats: any = {}
    
    try {
      stats.fixtures = await prisma.fixture.count()
    } catch {
      stats.fixtures = 0
    }
    
    try {
      stats.users = await prisma.user.count()
    } catch {
      stats.users = 0
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      queryTime: `${queryTime}ms`,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}