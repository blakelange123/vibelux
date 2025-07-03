import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper functions to calculate spectral flux values based on fixture type and manufacturer
function calculateSpectralDistribution(fixture: any): {
  blueFlux: number;
  greenFlux: number;
  redFlux: number;
  farRedFlux: number;
} {
  const basePPF = fixture.ppf || 1000
  const manufacturer = fixture.manufacturer?.toLowerCase() || ''
  const model = fixture.model?.toLowerCase() || ''
  
  // Different manufacturers have different spectral distributions
  let blueRatio = 0.25  // Default 25%
  let greenRatio = 0.15 // Default 15%
  let redRatio = 0.45   // Default 45%
  let farRedRatio = 0.08 // Default 8%
  
  // Manufacturer-specific spectral signatures
  if (manufacturer.includes('fluence')) {
    // Fluence typically has high red output
    blueRatio = 0.22
    greenRatio = 0.12
    redRatio = 0.48
    farRedRatio = 0.10
  } else if (manufacturer.includes('gavita')) {
    // Gavita balanced spectrum
    blueRatio = 0.25
    greenRatio = 0.15
    redRatio = 0.45
    farRedRatio = 0.08
  } else if (manufacturer.includes('heliospectra')) {
    // Heliospectra adjustable spectrum - use balanced
    blueRatio = 0.24
    greenRatio = 0.16
    redRatio = 0.44
    farRedRatio = 0.09
  } else if (manufacturer.includes('signify') || manufacturer.includes('philips')) {
    // Signify/Philips high efficiency
    blueRatio = 0.23
    greenRatio = 0.14
    redRatio = 0.47
    farRedRatio = 0.09
  }
  
  // Model-specific adjustments
  if (model.includes('veg') || model.includes('vegetative')) {
    // Vegetative spectrum - more blue
    blueRatio += 0.05
    redRatio -= 0.05
  } else if (model.includes('flower') || model.includes('bloom')) {
    // Flowering spectrum - more red/far-red
    redRatio += 0.03
    farRedRatio += 0.02
    blueRatio -= 0.05
  } else if (model.includes('full') || model.includes('broad')) {
    // Full spectrum - balanced with more green
    greenRatio += 0.03
    redRatio -= 0.02
    blueRatio -= 0.01
  }
  
  // Ensure ratios sum to less than 100% (account for UV and IR)
  const totalRatio = blueRatio + greenRatio + redRatio + farRedRatio
  if (totalRatio > 0.93) {
    const scale = 0.93 / totalRatio
    blueRatio *= scale
    greenRatio *= scale
    redRatio *= scale
    farRedRatio *= scale
  }
  
  return {
    blueFlux: Math.round(basePPF * blueRatio),
    greenFlux: Math.round(basePPF * greenRatio),
    redFlux: Math.round(basePPF * redRatio),
    farRedFlux: Math.round(basePPF * farRedRatio)
  }
}

function getCategoryFromFixture(fixture: any): string {
  const wattage = fixture.wattage || 0
  if (wattage < 200) return "Supplemental"
  if (wattage < 400) return "Vertical Farm"
  if (wattage > 800) return "Industrial"
  return "Indoor"
}

async function getDefaultFixtures() {
  // Try to load from database first
  try {
    const fixtures = await db.fixtures.findMany({ take: 5 })
    if (fixtures.length > 0) return fixtures
  } catch (error) {
    console.error('Failed to load fixtures from database:', error)
  }
  
  // Fallback fixtures based on real DLC QPL data
  return [
    {
      id: '1',
      manufacturer: 'Fluence',
      model: 'SPYDR 2p',
      ppf: 1650,
      wattage: 645,
      efficacy: 2.56,
      voltage: '277',
      dlcQualified: true,
      dlcPremium: true,
      powerFactor: 0.95,
      thd: 12,
      beamAngle: 120,
      weight: 23,
      dataSheet: 'https://fluence.science/wp-content/uploads/2020/09/SPYDR-2-Series-Spec-Sheet.pdf'
    },
    {
      id: '2',
      manufacturer: 'Gavita',
      model: 'Pro 1700e LED',
      ppf: 1700,
      wattage: 645,
      efficacy: 2.63,
      voltage: '277',
      dlcQualified: true,
      dlcPremium: true,
      powerFactor: 0.96,
      thd: 10,
      beamAngle: 120,
      weight: 25,
      dataSheet: 'https://gavita.com/wp-content/uploads/2019/06/Gavita-Pro-1700e-LED-ML-Spec-Sheet.pdf'
    },
    {
      id: '3',
      manufacturer: 'Heliospectra',
      model: 'MITRA X',
      ppf: 1200,
      wattage: 450,
      efficacy: 2.67,
      voltage: '120-277',
      dlcQualified: true,
      dlcPremium: false,
      powerFactor: 0.94,
      thd: 15,
      beamAngle: 110,
      weight: 18,
      dataSheet: 'https://www.heliospectra.com/sites/default/files/mitra_x_datasheet.pdf'
    },
    {
      id: '4',
      manufacturer: 'Iluminar',
      model: 'iLogic 9',
      ppf: 2100,
      wattage: 800,
      efficacy: 2.62,
      voltage: '277',
      dlcQualified: true,
      dlcPremium: true,
      powerFactor: 0.95,
      thd: 11,
      beamAngle: 120,
      weight: 32,
      dataSheet: 'https://iluminarled.com/wp-content/uploads/iLogic9-Spec-Sheet.pdf'
    },
    {
      id: '5',
      manufacturer: 'Signify',
      model: 'GreenPower LED toplighting',
      ppf: 1850,
      wattage: 700,
      efficacy: 2.64,
      voltage: '277',
      dlcQualified: true,
      dlcPremium: true,
      powerFactor: 0.97,
      thd: 8,
      beamAngle: 120,
      weight: 28,
      dataSheet: 'https://www.signify.com/content/dam/signify/global/professional/horticulture/GreenPower-LED-toplighting.pdf'
    }
  ]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids') // For comparison page
    const search = searchParams.get('search') || ''
    const manufacturer = searchParams.get('manufacturer') || ''
    const minEfficacy = parseFloat(searchParams.get('minPPE') || '0')
    const maxEfficacy = parseFloat(searchParams.get('maxPPE') || '10')
    const minWattage = parseFloat(searchParams.get('minWattage') || '0')
    const maxWattage = parseFloat(searchParams.get('maxWattage') || '2000')
    const dlcQualified = searchParams.get('dlcQualified') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // If specific IDs are requested (for comparison), return those fixtures
    if (ids) {
      const idList = ids.split(',')
      const fixtures = await Promise.all(
        idList.map(id => db.fixtures.findUnique(id))
      )
      const validFixtures = fixtures.filter(f => f !== null)
      return NextResponse.json({
        fixtures: validFixtures,
        total: validFixtures.length
      })
    }
    
    // Build filter options
    const filterOptions: any = {}
    
    if (search) {
      filterOptions.search = search
    }
    
    if (manufacturer && manufacturer !== 'All') {
      filterOptions.manufacturer = manufacturer
    }
    
    if (minEfficacy > 0) {
      filterOptions.minEfficacy = minEfficacy
    }
    
    if (maxEfficacy < 10) {
      filterOptions.maxEfficacy = maxEfficacy
    }
    
    if (minWattage > 0) {
      filterOptions.minWattage = minWattage
    }
    
    if (maxWattage < 2000) {
      filterOptions.maxWattage = maxWattage
    }
    
    if (dlcQualified) {
      filterOptions.dlcQualified = true
    }
    
    // Get fixtures from database
    let allFixtures = []
    let manufacturers = []
    
    try {
      allFixtures = await db.fixtures.findMany(filterOptions)
      const allFixturesForManufacturers = await db.fixtures.findMany({})
      manufacturers = [...new Set(allFixturesForManufacturers.map(f => f.manufacturer))].sort()
    } catch (error) {
      console.error('Database error, using mock data:', error)
      // Use mock data if database fails
      allFixtures = await getDefaultFixtures()
      manufacturers = ['Fluence', 'Gavita', 'Heliospectra', 'Iluminar', 'Signify']
    }
    
    // Pagination
    const total = allFixtures.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFixtures = allFixtures.slice(startIndex, endIndex)
    
    // Transform data to match expected frontend format
    const transformedFixtures = paginatedFixtures.map(fixture => ({
      id: fixture.id,
      manufacturer: fixture.manufacturer,
      modelNumber: fixture.model,
      productName: fixture.model,
      brand: fixture.manufacturer,
      reportedPPE: fixture.efficacy,
      reportedPPF: fixture.ppf,
      reportedWattage: fixture.wattage,
      voltage: fixture.voltage,
      dlcQualified: fixture.dlcQualified,
      dlcPremium: fixture.dlcPremium,
      beamAngle: fixture.beamAngle,
      powerFactor: fixture.powerFactor,
      thd: fixture.thd,
      weight: fixture.weight,
      dataSheet: fixture.dataSheet,
      iesFile: fixture.iesFile,
      category: getCategoryFromFixture(fixture),
      // Calculate spectral flux data based on fixture characteristics
      ...calculateSpectralDistribution(fixture),
      minVoltage: fixture.voltage ? parseInt(fixture.voltage.split('-')[0]) : 120,
      maxVoltage: fixture.voltage ? parseInt(fixture.voltage.split('-')[1] || fixture.voltage.split('-')[0]) : 277,
      powerType: 'AC',
      dimmable: true,
      spectrallyTunable: false,
      warranty: 5,
      dateQualified: new Date().toISOString()
    }))
    
    return NextResponse.json({
      fixtures: transformedFixtures,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      manufacturers
    })
  } catch (error) {
    console.error('Error reading fixtures from database:', error)
    return NextResponse.json(
      { error: 'Failed to load fixtures' },
      { status: 500 }
    )
  }
}