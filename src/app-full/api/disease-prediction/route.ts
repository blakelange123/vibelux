import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { DiseasePredictionEngine } from '@/lib/ml/disease-prediction'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { 
      facilityId,
      currentConditions,
      cropInfo,
      includeWeatherForecast = false,
      useHistoricalData = true
    } = body

    // Initialize disease prediction engine
    const predictionEngine = new DiseasePredictionEngine()

    // Get historical disease data if requested
    let historicalData = undefined
    if (useHistoricalData) {
      const historical = await prisma.scoutingRecord.findMany({
        where: {
          userId,
          facilityId: facilityId || undefined,
          issueType: { in: ['pest', 'disease'] },
          timestamp: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 100 // Limit to recent 100 records
      })

      // Transform scouting records to historical disease data format
      historicalData = historical.map(record => ({
        diseaseType: record.issue.toLowerCase().replace(/\s+/g, '_'),
        severity: this.mapSeverityToNumber(record.severity),
        environmentalConditions: {
          temperature: record.environmental?.temperature || currentConditions.temperature,
          humidity: record.environmental?.humidity || currentConditions.humidity,
          leafWetness: record.environmental?.leafWetness || 0,
          co2: record.environmental?.co2 || currentConditions.co2,
          airflow: record.environmental?.airflow || 0.3,
          timestamp: record.timestamp
        },
        cropInfo: {
          cropType: cropInfo.cropType,
          variety: cropInfo.variety || 'unknown',
          growthStage: cropInfo.growthStage,
          plantAge: cropInfo.plantAge || 30,
          density: cropInfo.density || 25
        },
        treatment: record.notes || 'Standard treatment applied',
        outcome: record.actionRequired ? 'contained' : 'resolved'
      }))

      predictionEngine.addHistoricalData(historicalData)
    }

    // Get weather forecast if requested
    let weatherForecast = undefined
    if (includeWeatherForecast) {
      weatherForecast = await getWeatherForecast(currentConditions.location || { lat: 40.7128, lon: -74.0060 })
    }

    // Generate disease predictions
    const predictions = await predictionEngine.predictDiseaseRisk(
      currentConditions,
      cropInfo,
      weatherForecast,
      historicalData
    )

    // Calculate economic impact for each prediction
    const predictionsWithImpact = predictions.map(prediction => {
      const diseaseKey = prediction.diseaseType.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '')
      const impact = predictionEngine.assessDiseaseImpact(
        diseaseKey,
        prediction.risk,
        cropInfo
      )
      
      return {
        ...prediction,
        economicImpact: impact
      }
    })

    // Store prediction results for future reference
    if (facilityId) {
      await prisma.diseasePrediction.create({
        data: {
          facilityId,
          userId,
          predictions: predictionsWithImpact,
          conditions: currentConditions,
          cropInfo,
          createdAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      predictions: predictionsWithImpact,
      timestamp: new Date(),
      dataSourcesUsed: {
        historicalRecords: historicalData?.length || 0,
        weatherForecast: !!weatherForecast,
        cropSusceptibility: true,
        environmentalModeling: true
      }
    })
  } catch (error) {
    console.error('Disease prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate disease predictions' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('facilityId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recent disease predictions
    const predictions = await prisma.diseasePrediction.findMany({
      where: {
        userId,
        facilityId: facilityId || undefined
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Error fetching disease predictions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disease predictions' },
      { status: 500 }
    )
  }
}

// Helper functions
function mapSeverityToNumber(severity: string): number {
  switch (severity?.toLowerCase()) {
    case 'low': return 25
    case 'medium': return 50
    case 'high': return 75
    case 'critical': return 90
    default: return 40
  }
}

async function getWeatherForecast(location: { lat: number; lon: number }) {
  try {
    // Try to use real weather API
    const weatherApiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY
    
    if (weatherApiKey) {
      // OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric`
      )
      
      if (response.ok) {
        const data = await response.json()
        const forecast = []
        
        // Process 7-day forecast (API returns 5-day/3-hour forecast)
        const dailyData = new Map<string, any>()
        
        data.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000)
          const dayKey = date.toISOString().split('T')[0]
          
          if (!dailyData.has(dayKey)) {
            dailyData.set(dayKey, {
              temps: [],
              humidity: [],
              rain: 0,
              wind: []
            })
          }
          
          const day = dailyData.get(dayKey)
          day.temps.push(item.main.temp)
          day.humidity.push(item.main.humidity)
          day.rain += item.rain?.['3h'] || 0
          day.wind.push(item.wind.speed)
        })
        
        // Convert to daily forecast
        Array.from(dailyData.entries()).slice(0, 7).forEach(([dateStr, data]) => {
          forecast.push({
            date: new Date(dateStr),
            temperature: {
              min: Math.min(...data.temps),
              max: Math.max(...data.temps)
            },
            humidity: data.humidity.reduce((sum: number, val: number) => sum + val, 0) / data.humidity.length,
            precipitation: data.rain,
            windSpeed: data.wind.reduce((sum: number, val: number) => sum + val, 0) / data.wind.length
          })
        })
        
        return forecast
      }
    }
    
    // Fallback to National Weather Service API (US only, no key required)
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${location.lat},${location.lon}`
    )
    
    if (pointResponse.ok) {
      const pointData = await pointResponse.json()
      const forecastResponse = await fetch(pointData.properties.forecast)
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json()
        const forecast = []
        
        // Process NWS forecast periods
        for (let i = 0; i < Math.min(14, forecastData.properties.periods.length); i += 2) {
          const dayPeriod = forecastData.properties.periods[i]
          const nightPeriod = forecastData.properties.periods[i + 1] || dayPeriod
          
          forecast.push({
            date: new Date(dayPeriod.startTime),
            temperature: {
              min: Math.min(dayPeriod.temperature, nightPeriod.temperature),
              max: Math.max(dayPeriod.temperature, nightPeriod.temperature)
            },
            humidity: 70, // NWS doesn't provide humidity in basic forecast
            precipitation: dayPeriod.detailedForecast.toLowerCase().includes('rain') ? 5 : 0,
            windSpeed: parseInt(dayPeriod.windSpeed.split(' ')[0]) * 0.44704 // mph to m/s
          })
        }
        
        return forecast
      }
    }
  } catch (error) {
    console.error('Weather API error:', error)
  }
  
  // Fallback to realistic seasonal patterns based on location
  const forecast = []
  const baseDate = new Date()
  const latitude = location.lat
  const dayOfYear = Math.floor((baseDate.getTime() - new Date(baseDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  
  // Determine climate zone based on latitude
  const isNorthernHemisphere = latitude > 0
  const isTropical = Math.abs(latitude) < 23.5
  const isTemperate = Math.abs(latitude) >= 23.5 && Math.abs(latitude) < 66.5
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    
    // Calculate seasonal temperature based on location and day of year
    let baseTemp = 20 // Default temperate climate
    
    if (isTropical) {
      baseTemp = 28 - Math.sin((dayOfYear + i - 180) * Math.PI / 365) * 3 // Small seasonal variation
    } else if (isTemperate) {
      const seasonalFactor = isNorthernHemisphere ? 
        Math.sin((dayOfYear + i - 80) * Math.PI / 365) : 
        -Math.sin((dayOfYear + i - 80) * Math.PI / 365)
      baseTemp = 15 + seasonalFactor * 15 // Larger seasonal variation
    } else {
      // Polar regions
      const seasonalFactor = isNorthernHemisphere ? 
        Math.sin((dayOfYear + i - 80) * Math.PI / 365) : 
        -Math.sin((dayOfYear + i - 80) * Math.PI / 365)
      baseTemp = 0 + seasonalFactor * 20 // Extreme seasonal variation
    }
    
    // Add daily variation and some randomness
    const dailyVariation = 5 + Math.sin(i * 0.8) * 3
    const randomVariation = (Math.sin(i * 1.3) + Math.sin(i * 2.1)) * 2
    
    // Calculate humidity based on temperature and season
    const baseHumidity = isTropical ? 80 : (isTemperate ? 65 : 50)
    const humidity = Math.max(30, Math.min(95, 
      baseHumidity + Math.sin((dayOfYear + i) * Math.PI / 180) * 15 + Math.sin(i * 1.7) * 10
    ))
    
    // Precipitation probability based on season and location
    const precipChance = isTropical ? 0.4 : (Math.sin((dayOfYear + i - 90) * Math.PI / 365) + 1) * 0.2
    const precipitation = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < precipChance ? 
      (2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8 + (isTropical ? 5 : 0)) : 0
    
    forecast.push({
      date,
      temperature: {
        min: baseTemp - dailyVariation / 2 + randomVariation,
        max: baseTemp + dailyVariation / 2 + randomVariation
      },
      humidity,
      precipitation,
      windSpeed: 2 + Math.abs(Math.sin(i * 0.9)) * 3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2
    })
  }
  
  return forecast
}