/**
 * Crop-specific Fixture Recommendations API
 * Provides AI-powered fixture recommendations based on crop requirements
 */

import { NextRequest, NextResponse } from 'next/server'
import { fixtureSearchEngine } from '@/lib/fixture-search-engine'
import { requireAuth, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'

interface RecommendationRequest {
  cropName: string
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'all'
  facilityType?: 'greenhouse' | 'vertical-farm' | 'grow-tent' | 'warehouse'
  coverageArea?: number // sq ft
  budget?: number
  mountingHeight?: number // inches
  electricityRate?: number // $/kWh
  priority?: 'efficiency' | 'performance' | 'cost' | 'spectrum'
}

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    
    if (request.method === 'GET') {
      // Get recommendations via query parameters
      const { searchParams } = new URL(request.url)
      const cropName = searchParams.get('crop')
      
      if (!cropName) {
        return NextResponse.json(
          { error: 'Crop name is required' },
          { status: 400 }
        )
      }
      
      const growthStage = searchParams.get('growthStage') as any || 'all'
      const facilityType = searchParams.get('facilityType') as any
      const coverageArea = searchParams.get('coverageArea') ? parseInt(searchParams.get('coverageArea')!) : undefined
      const budget = searchParams.get('budget') ? parseInt(searchParams.get('budget')!) : undefined
      const mountingHeight = searchParams.get('mountingHeight') ? parseInt(searchParams.get('mountingHeight')!) : undefined
      const priority = searchParams.get('priority') as any || 'performance'
      
      const additionalFilters: any = {}
      
      if (facilityType) additionalFilters.indoorType = facilityType
      if (coverageArea) additionalFilters.coverageArea = coverageArea
      if (budget) additionalFilters.priceRange = [0, budget]
      if (mountingHeight) additionalFilters.mountingHeight = mountingHeight
      
      // Set sort order based on priority
      switch (priority) {
        case 'efficiency':
          additionalFilters.sortBy = 'efficacy'
          break
        case 'cost':
          additionalFilters.sortBy = 'price'
          break
        case 'performance':
          additionalFilters.sortBy = 'ppfd'
          break
        default:
          additionalFilters.sortBy = 'relevance'
      }
      
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop(
        cropName,
        growthStage,
        additionalFilters
      )
      
      // Generate insights and recommendations
      const insights = generateCropInsights(cropName, recommendations, {
        facilityType,
        coverageArea,
        budget,
        priority
      })
      
      return NextResponse.json({
        crop: cropName,
        growthStage,
        recommendations,
        insights,
        meta: {
          userId: user.userId,
          timestamp: Date.now(),
          filters: additionalFilters
        }
      })
      
    } else if (request.method === 'POST') {
      // Get recommendations via request body
      const body: RecommendationRequest = await request.json()
      
      if (!body.cropName) {
        return NextResponse.json(
          { error: 'cropName is required' },
          { status: 400 }
        )
      }
      
      const additionalFilters: any = {}
      
      if (body.facilityType) additionalFilters.indoorType = body.facilityType
      if (body.coverageArea) additionalFilters.coverageArea = body.coverageArea
      if (body.budget) additionalFilters.priceRange = [0, body.budget]
      if (body.mountingHeight) additionalFilters.mountingHeight = body.mountingHeight
      
      // Set sort order based on priority
      switch (body.priority) {
        case 'efficiency':
          additionalFilters.sortBy = 'efficacy'
          break
        case 'cost':
          additionalFilters.sortBy = 'price'
          break
        case 'performance':
          additionalFilters.sortBy = 'ppfd'
          break
        default:
          additionalFilters.sortBy = 'relevance'
      }
      
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop(
        body.cropName,
        body.growthStage || 'all',
        additionalFilters
      )
      
      // Calculate facility-specific recommendations
      const facilityRecommendations = generateFacilityRecommendations(
        body,
        recommendations
      )
      
      const insights = generateCropInsights(body.cropName, recommendations, body)
      
      return NextResponse.json({
        crop: body.cropName,
        growthStage: body.growthStage || 'all',
        recommendations,
        facilityRecommendations,
        insights,
        meta: {
          userId: user.userId,
          timestamp: Date.now(),
          requestParams: body
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
    
  } catch (error) {
    console.error('Fixture recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

function generateCropInsights(cropName: string, recommendations: any[], params: any) {
  const insights = {
    summary: '',
    topRecommendation: null as any,
    budgetOption: null as any,
    premiumOption: null as any,
    considerations: [] as string[],
    costAnalysis: null as any,
    performanceAnalysis: null as any
  }
  
  if (recommendations.length === 0) {
    insights.summary = `No fixtures found matching criteria for ${cropName}. Consider adjusting filters.`
    return insights
  }
  
  // Top recommendation (highest overall score)
  const topRec = recommendations[0]
  insights.topRecommendation = {
    fixture: topRec.fixture,
    score: topRec.score.overall,
    reasoning: topRec.reasoning
  }
  
  // Budget option (lowest price with decent score)
  const budgetOptions = recommendations
    .filter(r => r.score.overall >= 70)
    .sort((a, b) => a.fixture.pricing.msrp - b.fixture.pricing.msrp)
  
  if (budgetOptions.length > 0) {
    insights.budgetOption = budgetOptions[0]
  }
  
  // Premium option (highest performance)
  const premiumOptions = recommendations
    .sort((a, b) => b.fixture.specifications.ppfd - a.fixture.specifications.ppfd)
  
  if (premiumOptions.length > 0) {
    insights.premiumOption = premiumOptions[0]
  }
  
  // Generate summary
  insights.summary = generateSummaryText(cropName, recommendations, params)
  
  // Generate considerations
  insights.considerations = generateConsiderations(cropName, recommendations, params)
  
  // Cost analysis
  insights.costAnalysis = {
    averageInitialCost: Math.round(recommendations.reduce((sum, r) => sum + r.fixture.pricing.msrp, 0) / recommendations.length),
    averageOperatingCost: Math.round(recommendations.reduce((sum, r) => sum + r.costAnalysis.operatingCostPerYear, 0) / recommendations.length),
    bestValue: recommendations.sort((a, b) => a.costAnalysis.totalCostOfOwnership - b.costAnalysis.totalCostOfOwnership)[0],
    priceRange: [
      Math.min(...recommendations.map(r => r.fixture.pricing.msrp)),
      Math.max(...recommendations.map(r => r.fixture.pricing.msrp))
    ]
  }
  
  // Performance analysis
  insights.performanceAnalysis = {
    averageEfficacy: Math.round((recommendations.reduce((sum, r) => sum + r.fixture.specifications.efficacy, 0) / recommendations.length) * 10) / 10,
    averageScore: Math.round(recommendations.reduce((sum, r) => sum + r.score.overall, 0) / recommendations.length),
    spectrumCompatibility: Math.round(recommendations.reduce((sum, r) => sum + r.score.spectrum, 0) / recommendations.length),
    topPerformer: recommendations.sort((a, b) => b.score.overall - a.score.overall)[0]
  }
  
  return insights
}

function generateSummaryText(cropName: string, recommendations: any[], params: any): string {
  const avgScore = recommendations.reduce((sum, r) => sum + r.score.overall, 0) / recommendations.length
  const topScore = recommendations[0]?.score.overall || 0
  
  let summary = `Found ${recommendations.length} suitable fixtures for ${cropName}. `
  
  if (topScore >= 90) {
    summary += `Excellent options available with ${topScore}% compatibility. `
  } else if (topScore >= 75) {
    summary += `Good options available with ${topScore}% compatibility. `
  } else {
    summary += `Moderate options available with ${topScore}% compatibility. `
  }
  
  if (params.budget) {
    const withinBudget = recommendations.filter(r => r.fixture.pricing.msrp <= params.budget).length
    summary += `${withinBudget} fixtures within $${params.budget} budget. `
  }
  
  return summary
}

function generateConsiderations(cropName: string, recommendations: any[], params: any): string[] {
  const considerations = []
  
  // Check if coverage area is specified
  if (params.coverageArea) {
    const inadequateCoverage = recommendations.filter(r => r.estimatedCoverage.area < params.coverageArea * 0.8).length
    if (inadequateCoverage > 0) {
      considerations.push(`${inadequateCoverage} fixtures may require multiple units for ${params.coverageArea} sq ft coverage`)
    }
  }
  
  // Check spectrum compatibility
  const lowSpectrumCount = recommendations.filter(r => r.score.spectrum < 75).length
  if (lowSpectrumCount > 0) {
    considerations.push(`${lowSpectrumCount} fixtures have suboptimal spectrum for ${cropName}`)
  }
  
  // Check efficiency
  const lowEfficiencyCount = recommendations.filter(r => r.score.efficiency < 75).length
  if (lowEfficiencyCount > 0) {
    considerations.push(`${lowEfficiencyCount} fixtures have lower efficiency, increasing operating costs`)
  }
  
  // Facility-specific considerations
  if (params.facilityType === 'greenhouse') {
    considerations.push('Consider fixtures with IP65+ rating for greenhouse humidity')
  } else if (params.facilityType === 'vertical-farm') {
    considerations.push('Prioritize fixtures with excellent thermal management for stacked growing')
  }
  
  return considerations
}

function generateFacilityRecommendations(params: RecommendationRequest, recommendations: any[]) {
  const facilityRecs = {
    layoutSuggestions: [] as string[],
    quantityEstimate: null as any,
    spacingRecommendations: null as any,
    powerRequirements: null as any,
    thermalConsiderations: [] as string[]
  }
  
  if (params.coverageArea && recommendations.length > 0) {
    const topFixture = recommendations[0]
    const fixtureArea = topFixture.estimatedCoverage.area
    const quantity = Math.ceil(params.coverageArea / fixtureArea)
    
    facilityRecs.quantityEstimate = {
      recommended: quantity,
      totalWattage: quantity * topFixture.fixture.specifications.wattage,
      totalCost: quantity * topFixture.fixture.pricing.msrp,
      annualOperatingCost: quantity * topFixture.costAnalysis.operatingCostPerYear
    }
    
    // Spacing recommendations
    const spacingFeet = Math.sqrt(fixtureArea)
    facilityRecs.spacingRecommendations = {
      centerToCenter: `${spacingFeet} feet`,
      mountingHeight: `${params.mountingHeight || 18} inches`,
      uniformityNote: 'Maintain consistent spacing for uniform light distribution'
    }
    
    // Power requirements
    const totalWattage = quantity * topFixture.fixture.specifications.wattage
    facilityRecs.powerRequirements = {
      totalWattage,
      recommendedCircuit: totalWattage > 15000 ? '208V 3-phase' : '240V single-phase',
      estimatedAmperage: Math.ceil(totalWattage / 240),
      powerDensity: `${(totalWattage / params.coverageArea).toFixed(1)} W/sq ft`
    }
  }
  
  return facilityRecs
}

export const GET = requireAuth(handler)
export const POST = requireAuth(handler)