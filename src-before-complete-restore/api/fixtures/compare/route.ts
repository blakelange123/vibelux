/**
 * Fixture Comparison API
 * Provides advanced comparison and analysis of LED grow lights
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { FixtureAnalyzer, AnalysisParams } from '@/lib/analysis/fixture-analyzer'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fixtureIds, analysisParams } = body

    if (!Array.isArray(fixtureIds) || fixtureIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 fixture IDs are required for comparison' },
        { status: 400 }
      )
    }

    if (fixtureIds.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 fixtures can be compared at once' },
        { status: 400 }
      )
    }

    // Get fixtures from database
    const fixtures = await prisma.fixture.findMany({
      where: {
        id: {
          in: fixtureIds
        }
      }
    })

    if (fixtures.length !== fixtureIds.length) {
      return NextResponse.json(
        { error: 'One or more fixtures not found' },
        { status: 404 }
      )
    }

    // Prepare fixtures data for analysis
    const fixturesForAnalysis = fixtures.map(fixture => ({
      id: fixture.id,
      name: fixture.name,
      brand: fixture.manufacturer,
      model: fixture.model || fixture.name,
      wattage: fixture.wattage,
      ppfd: fixture.ppfd,
      price: fixture.price,
      coverageArea: fixture.coverageArea,
      efficiency: fixture.efficiency,
      spectrum: {
        fullSpectrum: true, // Default assumption
        peakWavelengths: [450, 660, 730], // Default peaks
        redBlueRatio: 1.2
      },
      dimmable: fixture.dimmable || false,
      cooling: fixture.cooling || 'Passive',
      warranty: fixture.warranty || 3,
      weight: fixture.weight || 15,
      features: fixture.features || ['Full Spectrum', 'Energy Efficient']
    }))

    // Set default analysis parameters if not provided
    const defaultParams: AnalysisParams = {
      growStage: 'all',
      spaceSize: 16, // 4x4 default
      budget: 500,
      priority: 'efficiency',
      experience: 'intermediate'
    }

    const params = { ...defaultParams, ...analysisParams }

    // Perform comparison analysis
    const comparisonResult = FixtureAnalyzer.compareFixtures(fixturesForAnalysis, params)

    // Calculate additional metrics
    const metrics = {
      averageEfficiency: fixturesForAnalysis.reduce((sum, f) => sum + (f.ppfd / f.wattage), 0) / fixturesForAnalysis.length,
      priceRange: {
        min: Math.min(...fixturesForAnalysis.map(f => f.price)),
        max: Math.max(...fixturesForAnalysis.map(f => f.price))
      },
      powerRange: {
        min: Math.min(...fixturesForAnalysis.map(f => f.wattage)),
        max: Math.max(...fixturesForAnalysis.map(f => f.wattage))
      },
      coverageRange: {
        min: Math.min(...fixturesForAnalysis.map(f => f.coverageArea)),
        max: Math.max(...fixturesForAnalysis.map(f => f.coverageArea))
      }
    }

    // Generate recommendations
    const recommendations = {
      bestEfficiency: fixturesForAnalysis.reduce((best, current) => 
        (current.ppfd / current.wattage) > (best.ppfd / best.wattage) ? current : best
      ),
      bestValue: fixturesForAnalysis.reduce((best, current) => 
        (current.price / current.ppfd) < (best.price / best.ppfd) ? current : best
      ),
      largestCoverage: fixturesForAnalysis.reduce((best, current) => 
        current.coverageArea > best.coverageArea ? current : best
      )
    }

    return NextResponse.json({
      comparison: comparisonResult,
      fixtures: fixturesForAnalysis,
      metrics,
      recommendations,
      analysisParams: params,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Fixture comparison error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to compare fixtures' },
      { status: 500 }
    )
  }
}

// Get comparison presets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'popular'

    let whereClause = {}

    switch (category) {
      case 'budget':
        whereClause = {
          price: {
            lte: 300
          }
        }
        break
      case 'premium':
        whereClause = {
          price: {
            gte: 500
          }
        }
        break
      case 'efficient':
        whereClause = {
          efficiency: {
            gte: 2.5
          }
        }
        break
      case 'commercial':
        whereClause = {
          wattage: {
            gte: 400
          }
        }
        break
      default:
        // Popular fixtures
        whereClause = {}
    }

    const fixtures = await prisma.fixture.findMany({
      where: whereClause,
      orderBy: [
        { efficiency: 'desc' },
        { ppfd: 'desc' }
      ],
      take: 12
    })

    // Create suggested comparison sets
    const comparisonSets = []

    // Budget comparison
    if (category === 'budget' || category === 'popular') {
      const budgetFixtures = fixtures
        .filter(f => f.price <= 300)
        .slice(0, 3)
      
      if (budgetFixtures.length >= 2) {
        comparisonSets.push({
          name: 'Budget Champions',
          description: 'Best value fixtures under $300',
          fixtures: budgetFixtures.map(f => ({
            id: f.id,
            name: f.name,
            price: f.price,
            wattage: f.wattage,
            ppfd: f.ppfd
          }))
        })
      }
    }

    // High-efficiency comparison
    const efficientFixtures = fixtures
      .sort((a, b) => (b.ppfd / b.wattage) - (a.ppfd / a.wattage))
      .slice(0, 3)
    
    if (efficientFixtures.length >= 2) {
      comparisonSets.push({
        name: 'Efficiency Leaders',
        description: 'Most efficient PPFD per watt',
        fixtures: efficientFixtures.map(f => ({
          id: f.id,
          name: f.name,
          price: f.price,
          wattage: f.wattage,
          ppfd: f.ppfd,
          efficiency: f.ppfd / f.wattage
        }))
      })
    }

    // Coverage comparison
    const coverageFixtures = fixtures
      .sort((a, b) => b.coverageArea - a.coverageArea)
      .slice(0, 3)
    
    if (coverageFixtures.length >= 2) {
      comparisonSets.push({
        name: 'Coverage Kings',
        description: 'Largest coverage areas',
        fixtures: coverageFixtures.map(f => ({
          id: f.id,
          name: f.name,
          price: f.price,
          wattage: f.wattage,
          coverageArea: f.coverageArea
        }))
      })
    }

    return NextResponse.json({
      category,
      comparisonSets,
      totalFixtures: fixtures.length
    })

  } catch (error) {
    console.error('Comparison presets error:', error)
    return NextResponse.json(
      { error: 'Failed to load comparison presets' },
      { status: 500 }
    )
  }
}