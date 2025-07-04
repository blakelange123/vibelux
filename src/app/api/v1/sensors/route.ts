import { NextRequest, NextResponse } from 'next/server'

// Mock sensor data storage (in production, use database)
const sensorData: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, roomId, readings } = body

    // Validate required fields
    if (!projectId || !readings || !Array.isArray(readings)) {
      return NextResponse.json(
        { error: 'Project ID and readings array are required' },
        { status: 400 }
      )
    }

    // Process sensor readings
    const processedReadings = []
    for (const reading of readings) {
      // Validate reading data
      if (!reading.type || reading.value === undefined) {
        continue
      }

      // Create processed reading
      const processed = {
        id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        roomId: roomId || 'default',
        sensorId: reading.sensorId || 'default',
        type: reading.type,
        value: reading.value,
        timestamp: new Date(reading.timestamp || Date.now()),
        metadata: reading.metadata || {}
      }

      processedReadings.push(processed)
      sensorData.push(processed)
    }

    // Calculate aggregates
    const aggregates = calculateAggregates(processedReadings)

    // Check for alerts
    const alerts = checkForAlerts(processedReadings)

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const projectId = searchParams.get('projectId')
    const roomId = searchParams.get('roomId')
    const type = searchParams.get('type')
    const hours = parseInt(searchParams.get('hours') || '24')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Filter sensor data
    const now = Date.now()
    const startTime = now - (hours * 60 * 60 * 1000)
    
    let filteredData = sensorData.filter(reading => 
      reading.projectId === projectId &&
      new Date(reading.timestamp).getTime() >= startTime
    )

    if (roomId) {
      filteredData = filteredData.filter(reading => reading.roomId === roomId)
    }

    if (type) {
      filteredData = filteredData.filter(reading => reading.type === type)
    }

    // If no data, generate simulated data
    if (filteredData.length === 0) {
      filteredData = generateSimulatedData({
        projectId,
        roomId,
        type,
        startTime,
        endTime: now,
        interval: hours > 24 ? 3600000 : 300000 // 1 hour or 5 min intervals
      })
    }

    return NextResponse.json({
      projectId,
      roomId,
      type,
      startTime: new Date(startTime),
      endTime: new Date(now),
      data: filteredData
    })
  } catch (error) {
    console.error('Sensor data fetch error:', error)
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

function checkForAlerts(readings: any[]) {
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
      
      // Generate value with variance
      const variance = (Math.random() - 0.5) * base.variance
      const value = base.value * cycleMultiplier + variance
      
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