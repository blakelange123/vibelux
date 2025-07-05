/**
 * Weather API Proxy
 * Securely proxy OpenWeather API calls server-side
 */

import { NextRequest, NextResponse } from 'next/server'
import { securityMiddleware } from '@/middleware/security'

async function handler(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Weather service not configured' },
      { status: 503 }
    )
  }
  
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const units = searchParams.get('units') || 'metric'
  
  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    )
  }
  
  // Validate coordinates
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)
  
  if (isNaN(latitude) || isNaN(longitude) || 
      latitude < -90 || latitude > 90 || 
      longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates' },
      { status: 400 }
    )
  }
  
  try {
    const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather')
    weatherUrl.searchParams.set('lat', lat)
    weatherUrl.searchParams.set('lon', lon)
    weatherUrl.searchParams.set('units', units)
    weatherUrl.searchParams.set('appid', apiKey)
    
    const response = await fetch(weatherUrl.toString(), {
      headers: {
        'User-Agent': 'VibeLux/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Return only necessary data to minimize exposure
    return NextResponse.json({
      location: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      pressure: data.main?.pressure,
      description: data.weather?.[0]?.description,
      cloudiness: data.clouds?.all,
      windSpeed: data.wind?.speed,
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      timezone: data.timezone
    })
    
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

export const GET = securityMiddleware(handler)