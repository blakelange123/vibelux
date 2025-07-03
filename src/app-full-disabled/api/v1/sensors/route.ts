import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// Declare global WebSocket server type
declare global {
  var wsServer: any
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, roomId, readings } = body

    // Validate project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Process sensor readings
    const processedReadings = []
    for (const reading of readings) {
      // Validate reading data
      if (!reading.type || reading.value === undefined) {
        continue
      }

      // Store in database (you'd create a SensorReading model)
      // For now, we'll just process and return
      const processed = {
        id: `reading_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        projectId,
        roomId,
        sensorId: reading.sensorId || 'default',
        type: reading.type,
        value: reading.value,
        timestamp: new Date(reading.timestamp || Date.now()),
        metadata: reading.metadata || {}
      }

      processedReadings.push(processed)

      // Send to WebSocket server if available
      // This would be done via a message queue in production
      if (global.wsServer) {
        global.wsServer.processSensorData(processed)
      }
    }

    // Calculate aggregates
    const aggregates = calculateAggregates(processedReadings)

    // Check for alerts
    const alerts = await checkForAlerts(processedReadings, project)

    return NextResponse.json({
      success: true,
      processed: processedReadings.length,
      aggregates,
      alerts
    })
  } catch (error) {
    console.error('Sensor data processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAggregates(readings: any[]) {
  const byType: Record<string, number[]> = {}
  
  readings.forEach(reading => {
    if (!byType[reading.type]) {
      byType[reading.type] = []
    }
    byType[reading.type].push(reading.value)
  })

  const aggregates: Record<string, any> = {}
  
  Object.entries(byType).forEach(([type, values]) => {
    aggregates[type] = {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      current: values[values.length - 1]
    }
  })

  return aggregates
}

async function checkForAlerts(readings: any[], project: any) {
  const alerts = []
  
  // Temperature alerts
  const tempReadings = readings.filter(r => r.type === 'temperature')
  tempReadings.forEach(reading => {
    if (reading.value > 85) {
      alerts.push({
        type: 'critical',
        sensor: 'temperature',
        message: `High temperature: ${reading.value}°F`,
        value: reading.value,
        threshold: 85,
        roomId: reading.roomId
      })
    } else if (reading.value < 65) {
      alerts.push({
        type: 'warning',
        sensor: 'temperature',
        message: `Low temperature: ${reading.value}°F`,
        value: reading.value,
        threshold: 65,
        roomId: reading.roomId
      })
    }
  })

  // Humidity alerts
  const humidityReadings = readings.filter(r => r.type === 'humidity')
  humidityReadings.forEach(reading => {
    if (reading.value > 70) {
      alerts.push({
        type: 'warning',
        sensor: 'humidity',
        message: `High humidity: ${reading.value}%`,
        value: reading.value,
        threshold: 70,
        roomId: reading.roomId
      })
    } else if (reading.value < 40) {
      alerts.push({
        type: 'warning',
        sensor: 'humidity',
        message: `Low humidity: ${reading.value}%`,
        value: reading.value,
        threshold: 40,
        roomId: reading.roomId
      })
    }
  })

  // CO2 alerts
  const co2Readings = readings.filter(r => r.type === 'co2')
  co2Readings.forEach(reading => {
    if (reading.value < 400) {
      alerts.push({
        type: 'warning',
        sensor: 'co2',
        message: `Low CO2: ${reading.value} ppm`,
        value: reading.value,
        threshold: 400,
        roomId: reading.roomId
      })
    } else if (reading.value > 1500) {
      alerts.push({
        type: 'info',
        sensor: 'co2',
        message: `High CO2: ${reading.value} ppm`,
        value: reading.value,
        threshold: 1500,
        roomId: reading.roomId
      })
    }
  })

  return alerts
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const roomId = searchParams.get('roomId')
    const type = searchParams.get('type')
    const hours = parseInt(searchParams.get('hours') || '24')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId
      },
      include: {
        rooms: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // In production, this would query from a time-series database
    // For now, return simulated data
    const now = Date.now()
    const startTime = now - (hours * 60 * 60 * 1000)
    
    const data = generateSimulatedData({
      projectId,
      roomId,
      type,
      startTime,
      endTime: now,
      interval: hours > 24 ? 3600000 : 300000 // 1 hour or 5 min intervals
    })

    return NextResponse.json({
      projectId,
      roomId,
      type,
      startTime: new Date(startTime),
      endTime: new Date(now),
      data
    })
  } catch (error) {
    console.error('Sensor data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSimulatedData(params: any) {
  const { startTime, endTime, interval, type, roomId } = params
  const data = []
  
  // Base values with some randomness
  const baseValues: Record<string, { value: number, variance: number }> = {
    temperature: { value: 75, variance: 5 },
    humidity: { value: 55, variance: 10 },
    co2: { value: 800, variance: 200 },
    ppfd: { value: 600, variance: 100 },
    ph: { value: 6.2, variance: 0.3 },
    ec: { value: 1.8, variance: 0.2 }
  }

  const sensorTypes = type ? [type] : Object.keys(baseValues)
  
  for (let timestamp = startTime; timestamp <= endTime; timestamp += interval) {
    sensorTypes.forEach(sensorType => {
      const base = baseValues[sensorType]
      if (!base) return
      
      // Add daily cycle variation
      const hourOfDay = new Date(timestamp).getHours()
      let cycleMultiplier = 1
      
      if (sensorType === 'temperature') {
        // Temperature higher during day
        cycleMultiplier = hourOfDay >= 6 && hourOfDay <= 18 ? 1.1 : 0.9
      } else if (sensorType === 'humidity') {
        // Humidity inverse of temperature
        cycleMultiplier = hourOfDay >= 6 && hourOfDay <= 18 ? 0.9 : 1.1
      } else if (sensorType === 'ppfd') {
        // Light only during day hours
        cycleMultiplier = hourOfDay >= 6 && hourOfDay <= 18 ? 1 : 0
      } else if (sensorType === 'co2') {
        // CO2 drops during light hours (photosynthesis)
        cycleMultiplier = hourOfDay >= 6 && hourOfDay <= 18 ? 0.8 : 1.2
      }
      
      // Generate value with realistic sensor variance based on time and type
      const timeVariance = Math.sin(timestamp / (1000 * 60 * 60)) * (base.variance * 0.3);
      const sensorNoise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * (base.variance * 0.7);
      const value = base.value * cycleMultiplier + timeVariance + sensorNoise
      
      data.push({
        sensorId: `sensor_${sensorType}_${roomId || 'default'}`,
        type: sensorType,
        value: Math.round(value * 100) / 100,
        timestamp: new Date(timestamp),
        roomId: roomId || 'room_1'
      })
    })
  }
  
  return data
}