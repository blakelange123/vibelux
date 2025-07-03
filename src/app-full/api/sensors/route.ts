import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { influxClient } from '@/lib/influxdb-client'
import { securityMiddleware } from '@/middleware/security'

async function getHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const measurement = searchParams.get('measurement') || 'environment'
  const hours = parseInt(searchParams.get('hours') || '24')
  const deviceId = searchParams.get('deviceId')
  const location = searchParams.get('location')
  
  try {
    // Get data from InfluxDB
    const data = await influxClient.querySensorData(measurement, {
      start: `-${hours}h`,
      aggregateWindow: '5m',
      aggregateFn: 'mean',
      limit: 1000
    })
    
    // Filter by device ID or location if specified
    let filteredData = data
    if (deviceId) {
      filteredData = data.filter(record => record.tags.device_id === deviceId)
    }
    if (location) {
      filteredData = data.filter(record => record.tags.location === location)
    }
    
    // If no real data available, return mock data for development
    if (filteredData.length === 0 && !influxClient.isReady()) {
      const mockData = generateMockSensorData(measurement, hours)
      return NextResponse.json({
        sensors: mockData,
        total: mockData.length,
        timestamp: new Date().toISOString(),
        source: 'mock'
      })
    }
    
    return NextResponse.json({
      sensors: filteredData,
      total: filteredData.length,
      timestamp: new Date().toISOString(),
      source: 'influxdb'
    })
    
  } catch (error) {
    console.error('Error fetching sensor data:', error)
    
    // Fallback to mock data on error
    const mockData = generateMockSensorData(measurement, hours)
    return NextResponse.json({
      sensors: mockData,
      total: mockData.length,
      timestamp: new Date().toISOString(),
      source: 'mock',
      warning: 'Using mock data due to database error'
    })
  }
}

async function postHandler(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate sensor data structure
    if (body.type === 'environmental') {
      const reading = await influxClient.writeEnvironmentalData({
        deviceId: body.deviceId || 'unknown',
        location: body.location || 'default',
        temperature: body.temperature,
        humidity: body.humidity,
        co2: body.co2,
        light: body.light,
        ph: body.ph,
        ec: body.ec,
        vpd: body.vpd
      })
      
      if (!reading) {
        throw new Error('Failed to write environmental data')
      }
      
    } else if (body.type === 'lighting') {
      const reading = await influxClient.writeLightingData({
        fixtureId: body.fixtureId || 'unknown',
        zone: body.zone || 'default',
        ppfd: body.ppfd,
        dli: body.dli,
        powerConsumption: body.powerConsumption,
        efficiency: body.efficiency,
        temperature: body.temperature,
        dimLevel: body.dimLevel,
        spectrum: body.spectrum
      })
      
      if (!reading) {
        throw new Error('Failed to write lighting data')
      }
      
    } else {
      // Generic sensor data
      const reading = await influxClient.writeSensorData([{
        measurement: body.measurement || 'generic',
        tags: {
          device_id: body.deviceId || 'unknown',
          location: body.location || 'default',
          sensor_type: body.type || 'generic'
        },
        fields: body.fields || { value: body.value || 0 }
      }])
      
      if (!reading) {
        throw new Error('Failed to write sensor data')
      }
    }
    
    return NextResponse.json({
      message: 'Sensor data recorded successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error saving sensor data:', error)
    return NextResponse.json(
      { error: 'Failed to save sensor data' },
      { status: 500 }
    )
  }
}

function generateMockSensorData(measurement: string, hours: number) {
  const data = []
  const now = new Date()
  const intervalMinutes = 5
  const pointsCount = Math.min(hours * (60 / intervalMinutes), 100) // Limit to 100 points
  
  // Use realistic patterns based on time of day and facility type
  const currentHour = now.getHours()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  
  for (let i = 0; i < pointsCount; i++) {
    const time = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000))
    const hour = time.getHours()
    
    if (measurement === 'environment') {
      // Temperature follows daily cycle with proper physics
      const baseTemp = 23 // Target temperature
      const nightSetback = hour >= 20 || hour < 6 ? -2 : 0 // Night setback
      const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 2 // Natural daily variation
      const noise = (Math.sin(i * 0.1) + Math.sin(i * 0.23)) * 0.5 // Realistic noise pattern
      
      data.push({
        time: time.toISOString(),
        measurement: 'environment',
        field: 'temperature',
        value: baseTemp + nightSetback + dailyVariation + noise,
        tags: { device_id: 'env-sensor-001', location: 'Zone A' }
      })
      
      // Humidity inversely correlates with temperature
      const baseHumidity = 65
      const humidityVariation = -dailyVariation * 3 // Inverse correlation
      const humidityNoise = (Math.sin(i * 0.15) + Math.sin(i * 0.31)) * 2
      
      data.push({
        time: time.toISOString(),
        measurement: 'environment', 
        field: 'humidity',
        value: Math.max(40, Math.min(80, baseHumidity + humidityVariation + humidityNoise)),
        tags: { device_id: 'env-sensor-001', location: 'Zone A' }
      })
      
      // CO2 follows occupancy and plant respiration patterns
      const baseCO2 = 800
      const photosynthesisFactor = (hour >= 6 && hour <= 18) ? -200 : 100 // Plants consume CO2 during day
      const co2Noise = (Math.sin(i * 0.08) + Math.sin(i * 0.19)) * 50
      
      data.push({
        time: time.toISOString(),
        measurement: 'environment',
        field: 'co2',
        value: Math.max(400, baseCO2 + photosynthesisFactor + co2Noise),
        tags: { device_id: 'co2-sensor-001', location: 'Zone A' }
      })
      
      // VPD (Vapor Pressure Deficit) - calculated from temp and humidity
      const temp = baseTemp + nightSetback + dailyVariation + noise
      const rh = Math.max(40, Math.min(80, baseHumidity + humidityVariation + humidityNoise))
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)) // Saturation vapor pressure
      const avp = svp * (rh / 100) // Actual vapor pressure
      const vpd = svp - avp
      
      data.push({
        time: time.toISOString(),
        measurement: 'environment',
        field: 'vpd',
        value: Math.round(vpd * 100) / 100,
        tags: { device_id: 'env-sensor-001', location: 'Zone A' }
      })
    } else if (measurement === 'lighting') {
      // PPFD follows photoperiod schedule
      const lightSchedule = hour >= 6 && hour <= 20 // 14-hour photoperiod
      const basePPFD = lightSchedule ? 800 : 0
      const dimmingFactor = lightSchedule ? (
        hour === 6 || hour === 20 ? 0.5 : // Sunrise/sunset simulation
        hour === 7 || hour === 19 ? 0.75 : 1.0
      ) : 0
      const ppfdNoise = lightSchedule ? (Math.sin(i * 0.12) + Math.sin(i * 0.27)) * 20 : 0
      
      data.push({
        time: time.toISOString(),
        measurement: 'lighting',
        field: 'ppfd',
        value: basePPFD * dimmingFactor + ppfdNoise,
        tags: { fixture_id: 'led-fixture-001', zone: 'Zone A' }
      })
      
      // Power consumption correlates with PPFD output
      const basePower = 650 // watts
      const powerFactor = dimmingFactor
      const efficiency = 2.8 // μmol/J efficiency
      const actualPower = basePower * powerFactor
      
      data.push({
        time: time.toISOString(),
        measurement: 'lighting',
        field: 'power_consumption',
        value: actualPower + (Math.sin(i * 0.09) * 5), // Small power fluctuations
        tags: { fixture_id: 'led-fixture-001', zone: 'Zone A' }
      })
      
      // DLI (Daily Light Integral) calculation
      const dli = (basePPFD * dimmingFactor * 14 * 3600) / 1000000 // mol/m²/day
      
      data.push({
        time: time.toISOString(),
        measurement: 'lighting',
        field: 'dli',
        value: Math.round(dli * 10) / 10,
        tags: { fixture_id: 'led-fixture-001', zone: 'Zone A' }
      })
    }
  }
  
  return data.reverse() // Most recent first
}

export const GET = securityMiddleware(getHandler)
export const POST = securityMiddleware(postHandler)
