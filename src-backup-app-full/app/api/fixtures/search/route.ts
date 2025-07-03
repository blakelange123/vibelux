/**
 * Advanced Fixture Search API
 * Provides intelligent fixture recommendations and search capabilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { fixtureSearchEngine, SearchFilters } from '@/lib/fixture-search-engine'
import { requireAuth, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    
    // Parse search filters from query parameters
    const filters: SearchFilters = {}
    
    // Basic filters
    if (searchParams.get('wattageMin') && searchParams.get('wattageMax')) {
      filters.wattageRange = [
        parseInt(searchParams.get('wattageMin')!),
        parseInt(searchParams.get('wattageMax')!)
      ]
    }
    
    if (searchParams.get('efficacyMin') && searchParams.get('efficacyMax')) {
      filters.efficacyRange = [
        parseFloat(searchParams.get('efficacyMin')!),
        parseFloat(searchParams.get('efficacyMax')!)
      ]
    }
    
    if (searchParams.get('priceMin') && searchParams.get('priceMax')) {
      filters.priceRange = [
        parseInt(searchParams.get('priceMin')!),
        parseInt(searchParams.get('priceMax')!)
      ]
    }
    
    if (searchParams.get('coverageArea')) {
      filters.coverageArea = parseInt(searchParams.get('coverageArea')!)
    }
    
    if (searchParams.get('mountingHeight')) {
      filters.mountingHeight = parseInt(searchParams.get('mountingHeight')!)
    }
    
    // Spectrum filters
    if (searchParams.get('spectrumType')) {
      filters.spectrumType = searchParams.get('spectrumType') as any
    }
    
    // Application filters
    if (searchParams.get('cropType')) {
      filters.cropType = searchParams.get('cropType')!
    }
    
    if (searchParams.get('growthStage')) {
      filters.growthStage = searchParams.get('growthStage') as any
    }
    
    if (searchParams.get('indoorType')) {
      filters.indoorType = searchParams.get('indoorType') as any
    }
    
    // Performance filters
    if (searchParams.get('dimmable')) {
      filters.dimmable = searchParams.get('dimmable') === 'true'
    }
    
    if (searchParams.get('lifespan')) {
      filters.lifespan = parseInt(searchParams.get('lifespan')!)
    }
    
    if (searchParams.get('certification')) {
      filters.certification = searchParams.get('certification') as any
    }
    
    // Brand preferences
    if (searchParams.get('manufacturers')) {
      filters.manufacturer = searchParams.get('manufacturers')!.split(',')
    }
    
    if (searchParams.get('excludeManufacturers')) {
      filters.excludeManufacturers = searchParams.get('excludeManufacturers')!.split(',')
    }
    
    // Sustainability
    if (searchParams.get('energyStarRated')) {
      filters.energyStarRated = searchParams.get('energyStarRated') === 'true'
    }
    
    // Advanced
    if (searchParams.get('ppfdTarget')) {
      filters.ppfdTarget = parseInt(searchParams.get('ppfdTarget')!)
    }
    
    if (searchParams.get('dliTarget')) {
      filters.dliTarget = parseInt(searchParams.get('dliTarget')!)
    }
    
    if (searchParams.get('sortBy')) {
      filters.sortBy = searchParams.get('sortBy') as any
    }
    
    if (searchParams.get('limit')) {
      filters.limit = parseInt(searchParams.get('limit')!)
    }
    
    // Perform search
    const recommendations = await fixtureSearchEngine.searchFixtures(filters)
    
    // Get search metadata
    const stats = fixtureSearchEngine.getStats()
    
    return NextResponse.json({
      recommendations,
      meta: {
        total: recommendations.length,
        filters: filters,
        stats,
        userId: user.userId
      }
    })
    
  } catch (error) {
    console.error('Fixture search error:', error)
    return NextResponse.json(
      { error: 'Failed to search fixtures' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)