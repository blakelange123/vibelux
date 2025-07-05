/**
 * NREL Solar API Proxy
 * Securely proxy NREL solar radiation API calls server-side
 */

import { NextRequest, NextResponse } from 'next/server'
import { securityMiddleware } from '@/middleware/security'

async function handler(request: NextRequest) {
  const apiKey = process.env.NREL_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Solar data service not configured' },
      { status: 503 }
    )
  }
  
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const year = searchParams.get('year')
  
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
    const nrelUrl = new URL('https://developer.nrel.gov/api/solar/solar_resource/v1.json')
    nrelUrl.searchParams.set('lat', lat)
    nrelUrl.searchParams.set('lon', lon)
    nrelUrl.searchParams.set('api_key', apiKey)
    
    if (year) {
      nrelUrl.searchParams.set('year', year)
    }
    
    const response = await fetch(nrelUrl.toString(), {
      headers: {
        'User-Agent': 'VibeLux/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Return only necessary solar radiation data
    return NextResponse.json({
      location: {
        latitude: data.outputs?.lat,
        longitude: data.outputs?.lon,
        elevation: data.outputs?.elev,
        timezone: data.outputs?.tz
      },
      solar: {
        globalHorizontalIrradiance: data.outputs?.avg_ghi,
        directNormalIrradiance: data.outputs?.avg_dni,
        diffuseHorizontalIrradiance: data.outputs?.avg_dhi,
        globalTiltedIrradiance: data.outputs?.avg_gti,
        solarResourceGrade: data.outputs?.solar_resource_grade
      },
      monthly: data.outputs?.monthly || null
    })
    
  } catch (error) {
    console.error('NREL API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch solar data' },
      { status: 500 }
    )
  }
}

export const GET = securityMiddleware(handler)