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
    const zone = searchParams.get('zone')
    const period = searchParams.get('period') || '24h'
    
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const whereClause: any = {
      facilityId: userId, // TODO: Get actual facility ID
      timestamp: {
        gte: startDate,
        lte: now
      }
    }

    if (zone && zone !== 'all') {
      whereClause.zone = zone
    }

    const usageData = await prisma.waterUsage.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Calculate aggregated metrics
    const totalUsage = usageData.reduce((sum, record) => sum + record.usage, 0)
    const averageFlow = usageData.length > 0 ? 
      usageData.reduce((sum, record) => sum + record.flow, 0) / usageData.length : 0
    const averageEfficiency = usageData.length > 0 ?
      usageData.reduce((sum, record) => sum + (record.efficiency || 0), 0) / usageData.length : 0

    return NextResponse.json({
      data: usageData,
      summary: {
        totalUsage,
        averageFlow,
        averageEfficiency,
        recordCount: usageData.length
      }
    })
  } catch (error) {
    console.error('Error fetching water usage data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch water usage data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    const usageRecord = await prisma.waterUsage.create({
      data: {
        facilityId: userId, // TODO: Get actual facility ID
        zone: data.zone,
        usage: data.usage,
        flow: data.flow,
        pressure: data.pressure,
        temperature: data.temperature,
        ph: data.ph,
        ec: data.ec,
        runoff: data.runoff,
        efficiency: data.efficiency,
        timestamp: new Date(data.timestamp || Date.now())
      }
    })

    // Check for alerts based on thresholds
    const alerts = []
    
    // High usage alert (>20% above average)
    if (data.usage > 25) {
      alerts.push({
        type: 'high_usage',
        severity: 'medium',
        message: `High water usage detected: ${data.usage}L`
      })
    }
    
    // pH out of range (5.5-6.5)
    if (data.ph < 5.5 || data.ph > 6.5) {
      alerts.push({
        type: 'ph_alert',
        severity: data.ph < 5.0 || data.ph > 7.0 ? 'high' : 'medium',
        message: `pH level out of range: ${data.ph}`
      })
    }
    
    // Low pressure alert (<25 PSI)
    if (data.pressure < 25) {
      alerts.push({
        type: 'low_pressure',
        severity: data.pressure < 20 ? 'high' : 'medium',
        message: `Low water pressure: ${data.pressure} PSI`
      })
    }
    
    // EC out of range (1.0-2.0 mS/cm)
    if (data.ec < 1.0 || data.ec > 2.0) {
      alerts.push({
        type: 'ec_alert',
        severity: 'medium',
        message: `EC level out of range: ${data.ec} mS/cm`
      })
    }

    // Create alert records
    if (alerts.length > 0) {
      await Promise.all(
        alerts.map(alert =>
          prisma.waterAlert.create({
            data: {
              facilityId: userId,
              zone: data.zone,
              type: alert.type,
              severity: alert.severity,
              message: alert.message,
              acknowledged: false
            }
          })
        )
      )
    }

    return NextResponse.json({
      success: true,
      recordId: usageRecord.id,
      alertsGenerated: alerts.length
    }, { status: 201 })
  } catch (error) {
    console.error('Error recording water usage:', error)
    return NextResponse.json(
      { error: 'Failed to record water usage' },
      { status: 500 }
    )
  }
}