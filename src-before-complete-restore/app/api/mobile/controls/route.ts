/**
 * Mobile Lighting Controls API
 * Allows mobile apps to control lighting systems
 */

import { NextResponse } from 'next/server'
import { requirePermission, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { influxClient } from '@/lib/influxdb-client'
import { db } from '@/lib/db'

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const zone = searchParams.get('zone')

    // Get user's projects for control access
    const projects = await db.projects.findMany(user.userId)
    
    let availableFixtures = []
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        const projectFixtures = await db.projectFixtures.findMany(projectId)
        availableFixtures = projectFixtures
      }
    } else {
      // Get all fixtures from all user projects
      for (const project of projects) {
        const fixtures = await db.projectFixtures.findMany(project.id)
        availableFixtures.push(...fixtures.map(f => ({ ...f, projectId: project.id, projectName: project.name })))
      }
    }

    // Get current lighting status from InfluxDB
    const lightingData = await influxClient.getRecentLightingData(undefined, 1)
    
    // Combine fixture info with current status
    const fixturesWithStatus = availableFixtures.map(fixture => {
      const currentData = lightingData.find(d => 
        d.tags.fixture_id === fixture.fixtureId || 
        d.tags.fixture_id === fixture.id
      )
      
      return {
        id: fixture.id,
        fixtureId: fixture.fixtureId,
        projectId: fixture.projectId,
        projectName: fixture.projectName,
        position: fixture.position,
        quantity: fixture.quantity,
        fixture: fixture.fixture,
        currentStatus: {
          ppfd: currentData?.value || 0,
          dimLevel: 80, // Default dim level
          isOn: true,
          lastUpdate: currentData?.time || new Date().toISOString()
        }
      }
    })

    // Filter by zone if specified
    const filteredFixtures = zone 
      ? fixturesWithStatus.filter(f => f.position?.zone === zone)
      : fixturesWithStatus

    return NextResponse.json({
      fixtures: filteredFixtures,
      zones: [...new Set(fixturesWithStatus.map(f => f.position?.zone).filter(Boolean))],
      total: filteredFixtures.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mobile controls get error:', error)
    return NextResponse.json(
      { error: 'Failed to get lighting controls' },
      { status: 500 }
    )
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    const body = await request.json()
    const { fixtureId, action, value, zone } = body

    if (!fixtureId && !zone) {
      return NextResponse.json(
        { error: 'Either fixtureId or zone must be specified' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (dim, on, off, spectrum)' },
        { status: 400 }
      )
    }

    // Validate user has access to this fixture/zone
    const projects = await db.projects.findMany(user.userId)
    let hasAccess = false
    
    for (const project of projects) {
      const fixtures = await db.projectFixtures.findMany(project.id)
      if (fixtureId && fixtures.some(f => f.id === fixtureId || f.fixtureId === fixtureId)) {
        hasAccess = true
        break
      }
      if (zone && fixtures.some(f => f.position?.zone === zone)) {
        hasAccess = true
        break
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to specified fixture/zone' },
        { status: 403 }
      )
    }

    // Execute the control action
    const result = await executeControlAction(action, { fixtureId, zone, value })
    
    // Log the control action
    await db.usageRecords.create({
      userId: user.userId,
      feature: 'mobile_controls',
      action: `lighting_${action}`,
      metadata: {
        fixtureId,
        zone,
        value,
        timestamp: new Date().toISOString()
      }
    })

    // Record in InfluxDB for monitoring
    if (result.success) {
      await influxClient.writeLightingData({
        fixtureId: fixtureId || `zone_${zone}`,
        zone: zone || 'unknown',
        dimLevel: action === 'dim' ? value : undefined,
        powerConsumption: calculatePowerConsumption(action, value)
      })
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      action,
      target: fixtureId || zone,
      value,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mobile controls post error:', error)
    return NextResponse.json(
      { error: 'Failed to execute lighting control' },
      { status: 500 }
    )
  }
}

async function executeControlAction(action: string, params: any): Promise<{ success: boolean; message: string }> {
  // In a real implementation, this would communicate with actual lighting hardware
  // For now, we'll simulate the control actions
  
  switch (action) {
    case 'on':
      return { success: true, message: 'Lighting turned on' }
    case 'off':
      return { success: true, message: 'Lighting turned off' }
    case 'dim':
      if (params.value < 0 || params.value > 100) {
        return { success: false, message: 'Dim value must be between 0-100%' }
      }
      return { success: true, message: `Lighting dimmed to ${params.value}%` }
    case 'spectrum':
      return { success: true, message: 'Spectrum adjusted' }
    default:
      return { success: false, message: 'Unknown action' }
  }
}

function calculatePowerConsumption(action: string, value?: number): number {
  // Simple power consumption calculation
  switch (action) {
    case 'off':
      return 0
    case 'on':
      return 800 // Default full power
    case 'dim':
      return 800 * (value || 100) / 100
    default:
      return 800
  }
}

export const GET = requirePermission('control_environment', getHandler)
export const POST = requirePermission('control_environment', postHandler)