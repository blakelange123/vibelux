import { NextRequest } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse, trackAPIUsage } from '@/middleware/api-auth'

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/environmental/data', 'GET')
    
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const zone = searchParams.get('zone')
    const metrics = searchParams.get('metrics')?.split(',') || ['all']
    const timeRange = searchParams.get('timeRange') || 'current'
    
    // Mock current environmental data
    const currentData = {
      timestamp: new Date().toISOString(),
      zones: {
        'zone-1': {
          name: 'Vegetative Area',
          temperature: {
            value: 24.2,
            unit: '°C',
            status: 'optimal'
          },
          humidity: {
            value: 65,
            unit: '%',
            status: 'optimal'
          },
          co2: {
            value: 1200,
            unit: 'ppm',
            status: 'optimal'
          },
          vpd: {
            value: 0.95,
            unit: 'kPa',
            status: 'optimal'
          },
          airflow: {
            value: 0.3,
            unit: 'm/s',
            status: 'optimal'
          },
          lightLevel: {
            ppfd: 450,
            dli: 25.9,
            unit: 'μmol/m²/s',
            status: 'optimal'
          },
          irrigation: {
            ec: 1.8,
            ph: 6.0,
            waterTemp: 22,
            flowRate: 2.5,
            runoffEc: 2.1,
            runoffPh: 6.2
          },
          rootZone: {
            temperature: 22.5,
            moisture: 65,
            oxygen: 8.2
          }
        },
        'zone-2': {
          name: 'Flowering Area',
          temperature: {
            value: 26.1,
            unit: '°C',
            status: 'warning'
          },
          humidity: {
            value: 55,
            unit: '%',
            status: 'optimal'
          },
          co2: {
            value: 1500,
            unit: 'ppm',
            status: 'optimal'
          },
          vpd: {
            value: 1.45,
            unit: 'kPa',
            status: 'warning'
          },
          airflow: {
            value: 0.4,
            unit: 'm/s',
            status: 'optimal'
          },
          lightLevel: {
            ppfd: 650,
            dli: 28.1,
            unit: 'μmol/m²/s',
            status: 'optimal'
          },
          irrigation: {
            ec: 2.2,
            ph: 6.1,
            waterTemp: 23,
            flowRate: 3.0,
            runoffEc: 2.5,
            runoffPh: 6.3
          },
          rootZone: {
            temperature: 23.8,
            moisture: 60,
            oxygen: 7.8
          }
        }
      }
    }
    
    // Filter by zone if specified
    let responseData: any = currentData
    if (zone && zone !== 'all') {
      responseData = {
        timestamp: currentData.timestamp,
        zones: {
          [zone]: currentData.zones[zone as keyof typeof currentData.zones]
        } as any
      }
    }
    
    // Filter by metrics if specified
    if (!metrics.includes('all')) {
      const filteredZones: any = {}
      Object.entries(responseData.zones).forEach(([zoneId, zoneData]: [string, any]) => {
        filteredZones[zoneId] = {
          name: zoneData.name
        }
        metrics.forEach(metric => {
          if (metric in zoneData) {
            filteredZones[zoneId][metric] = zoneData[metric as keyof typeof zoneData]
          }
        })
      })
      responseData.zones = filteredZones
    }
    
    // Add historical data if requested
    if (timeRange !== 'current') {
      const historicalData = generateHistoricalData(timeRange)
      responseData = {
        ...responseData,
        historical: historicalData
      }
    }
    
    return generateAPIResponse(responseData, {
      version: '1.0',
      cached: false,
      queryParams: {
        zone,
        metrics: metrics.join(','),
        timeRange
      }
    })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return generateErrorResponse('Rate limit exceeded', 429)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}

function generateHistoricalData(timeRange: string) {
  const now = Date.now()
  const dataPoints = []
  
  let interval = 3600000 // 1 hour
  let points = 24
  
  switch (timeRange) {
    case '24h':
      interval = 3600000 // 1 hour
      points = 24
      break
    case '7d':
      interval = 86400000 // 1 day
      points = 7
      break
    case '30d':
      interval = 86400000 // 1 day
      points = 30
      break
  }
  
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now - (i * interval))
    dataPoints.unshift({
      timestamp: timestamp.toISOString(),
      temperature: 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
      humidity: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      co2: 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500,
      vpd: 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4
    })
  }
  
  return dataPoints
}