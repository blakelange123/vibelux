/**
 * Mobile Dashboard API
 * Provides dashboard data for mobile applications
 */

import { NextResponse } from 'next/server'
import { requireAuth, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { influxClient } from '@/lib/influxdb-client'
import { db } from '@/lib/db'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24')

    // Get user's recent projects
    const projects = await db.projects.findMany(user.userId)
    const recentProjects = projects.slice(0, 5)

    // Get recent sensor data
    const environmentalData = await influxClient.getRecentEnvironmentalData(undefined, hours)
    const lightingData = await influxClient.getRecentLightingData(undefined, hours)

    // Calculate summary statistics
    const summary = {
      totalProjects: projects.length,
      activeFixtures: lightingData.length,
      avgTemperature: calculateAverage(environmentalData, 'temperature'),
      avgHumidity: calculateAverage(environmentalData, 'humidity'),
      avgPPFD: calculateAverage(lightingData, 'ppfd'),
      totalPowerConsumption: calculateSum(lightingData, 'power_consumption')
    }

    // Get user's recent activity
    const recentActivity = await db.usageRecords.getUserUsage(
      user.userId,
      new Date(Date.now() - hours * 60 * 60 * 1000)
    )

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        permissions: user.permissions
      },
      summary,
      recentProjects: recentProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        updatedAt: p.updatedAt,
        fixtureCount: p.fixtures?.length || 0
      })),
      sensorData: {
        environmental: environmentalData.slice(0, 20), // Last 20 readings
        lighting: lightingData.slice(0, 20)
      },
      recentActivity: recentActivity.slice(0, 10), // Last 10 activities
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mobile dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}

function calculateAverage(data: any[], field: string): number {
  const values = data
    .filter(d => d.field === field && typeof d.value === 'number')
    .map(d => d.value)
  
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

function calculateSum(data: any[], field: string): number {
  const values = data
    .filter(d => d.field === field && typeof d.value === 'number')
    .map(d => d.value)
  
  return values.reduce((a, b) => a + b, 0)
}

export const GET = requireAuth(handler)