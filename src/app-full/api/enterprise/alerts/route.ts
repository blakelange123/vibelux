import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const facilityId = searchParams.get('facilityId')
    const acknowledged = searchParams.get('acknowledged')
    
    // Get user's accessible facilities
    const userFacilities = await prisma.facility.findMany({
      where: {
        users: {
          some: {
            userId: userId,
            role: { in: ['OWNER', 'ADMIN', 'MANAGER'] }
          }
        }
      },
      select: { id: true, name: true }
    })
    
    const facilityIds = userFacilities.map(f => f.id)
    
    if (facilityIds.length === 0) {
      return NextResponse.json([])
    }

    // Build where clause
    const whereClause: any = {
      facilityId: { in: facilityIds }
    }
    
    if (severity) {
      whereClause.severity = severity
    }
    
    if (facilityId && facilityId !== 'all') {
      whereClause.facilityId = facilityId
    }
    
    if (acknowledged !== null) {
      whereClause.acknowledged = acknowledged === 'true'
    }

    // Get water alerts
    const waterAlerts = await prisma.waterAlert.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    // Get scouting alerts (action required scouting records)
    const scoutingAlerts = await prisma.scoutingRecord.findMany({
      where: {
        userId,
        actionRequired: true,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 25
    })

    // Transform to enterprise alert format
    const enterpriseAlerts = [
      ...waterAlerts.map(alert => {
        const facility = userFacilities.find(f => f.id === alert.facilityId)
        return {
          id: `water-${alert.id}`,
          facilityId: alert.facilityId,
          facilityName: facility?.name || 'Unknown Facility',
          type: getAlertType(alert.type),
          severity: mapSeverity(alert.severity),
          title: getWaterAlertTitle(alert.type, alert.severity),
          description: alert.message,
          timestamp: alert.createdAt,
          acknowledged: alert.acknowledged,
          assignedTo: alert.acknowledgedBy || undefined
        }
      }),
      ...scoutingAlerts.map(record => ({
        id: `scouting-${record.id}`,
        facilityId: 'unknown', // Scouting records don't have facilityId yet
        facilityName: 'Field Operations',
        type: 'operational' as const,
        severity: mapScoutingSeverity(record.issueType),
        title: `${record.issueType.toUpperCase()}: ${record.issue}`,
        description: record.notes || 'Scouting issue requires attention',
        timestamp: record.timestamp,
        acknowledged: false,
        assignedTo: record.assignedTo || undefined
      }))
    ]

    // Sort by timestamp (newest first) and severity
    enterpriseAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      if (severityDiff !== 0) return severityDiff
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    return NextResponse.json(enterpriseAlerts)
  } catch (error) {
    console.error('Error fetching enterprise alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enterprise alerts' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { alertId, action } = await request.json()
    
    if (action === 'acknowledge') {
      const [alertType, id] = alertId.split('-')
      
      if (alertType === 'water') {
        await prisma.waterAlert.update({
          where: { id },
          data: {
            acknowledged: true,
            acknowledgedBy: userId,
            acknowledgedAt: new Date()
          }
        })
      }
      // Add other alert types as needed
      
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating enterprise alert:', error)
    return NextResponse.json(
      { error: 'Failed to update enterprise alert' },
      { status: 500 }
    )
  }
}

// Helper functions
function getAlertType(waterAlertType: string): 'operational' | 'compliance' | 'financial' | 'security' | 'maintenance' {
  switch (waterAlertType) {
    case 'high_usage':
    case 'low_pressure':
    case 'leak':
      return 'operational'
    case 'ph_alert':
    case 'ec_alert':
      return 'compliance'
    case 'maintenance':
      return 'maintenance'
    default:
      return 'operational'
  }
}

function mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'critical'
  }
  return severityMap[severity] || 'medium'
}

function mapScoutingSeverity(issueType: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (issueType) {
    case 'pest':
      return 'high'
    case 'disease':
      return 'critical'
    case 'deficiency':
      return 'medium'
    case 'general':
      return 'low'
    default:
      return 'medium'
  }
}

function getWaterAlertTitle(type: string, severity: string): string {
  const titles: Record<string, string> = {
    'high_usage': 'High Water Usage Detected',
    'low_pressure': 'Low Water Pressure Alert',
    'ph_alert': 'pH Level Out of Range',
    'ec_alert': 'EC Level Out of Range',
    'leak': 'Water Leak Detected',
    'maintenance': 'Maintenance Required'
  }
  
  const baseTitle = titles[type] || 'Water System Alert'
  return severity === 'critical' ? `CRITICAL: ${baseTitle}` : baseTitle
}