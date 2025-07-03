/**
 * Database Health Check Endpoint
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const queryTime = Date.now() - startTime

    // Get connection stats
    const [fixtureCount, userCount] = await Promise.all([
      prisma.fixture.count(),
      prisma.user.count().catch(() => 0) // May not exist yet
    ])

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      queryTime: `${queryTime}ms`,
      stats: {
        fixtures: fixtureCount,
        users: userCount
      },
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
  } finally {
    await prisma.$disconnect()
  }
}