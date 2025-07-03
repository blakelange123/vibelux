import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Common fixture recommendations based on room size and PPFD requirements
const FIXTURE_DATABASE = {
  small: { // Up to 100 sq ft
    low: { // 100-300 PPFD
      fixtures: [
        { name: 'LED Bar Light 150W', wattage: 150, ppf: 405, efficacy: 2.7, width: 4, length: 0.5 },
        { name: 'Compact Panel 200W', wattage: 200, ppf: 540, efficacy: 2.7, width: 2, length: 2 }
      ]
    },
    medium: { // 300-600 PPFD
      fixtures: [
        { name: 'LED Bar Light 320W', wattage: 320, ppf: 896, efficacy: 2.8, width: 4, length: 0.5 },
        { name: 'Pro Panel 400W', wattage: 400, ppf: 1120, efficacy: 2.8, width: 2, length: 4 }
      ]
    },
    high: { // 600-1000 PPFD
      fixtures: [
        { name: 'High Output Bar 640W', wattage: 640, ppf: 1920, efficacy: 3.0, width: 4, length: 0.5 },
        { name: 'Commercial Panel 800W', wattage: 800, ppf: 2400, efficacy: 3.0, width: 4, length: 4 }
      ]
    }
  },
  medium: { // 100-500 sq ft
    low: {
      fixtures: [
        { name: 'LED Bar Light 320W', wattage: 320, ppf: 896, efficacy: 2.8, width: 4, length: 0.5 },
        { name: 'Standard Panel 400W', wattage: 400, ppf: 1120, efficacy: 2.8, width: 2, length: 4 }
      ]
    },
    medium: {
      fixtures: [
        { name: 'Pro Bar Light 640W', wattage: 640, ppf: 1920, efficacy: 3.0, width: 4, length: 0.5 },
        { name: 'Commercial Panel 600W', wattage: 600, ppf: 1800, efficacy: 3.0, width: 4, length: 4 }
      ]
    },
    high: {
      fixtures: [
        { name: 'High Power Bar 800W', wattage: 800, ppf: 2560, efficacy: 3.2, width: 4, length: 0.5 },
        { name: 'Industrial Panel 1000W', wattage: 1000, ppf: 3200, efficacy: 3.2, width: 4, length: 4 }
      ]
    }
  },
  large: { // 500+ sq ft
    low: {
      fixtures: [
        { name: 'Commercial Bar 640W', wattage: 640, ppf: 1920, efficacy: 3.0, width: 6, length: 0.5 },
        { name: 'Large Panel 600W', wattage: 600, ppf: 1800, efficacy: 3.0, width: 4, length: 4 }
      ]
    },
    medium: {
      fixtures: [
        { name: 'Industrial Bar 800W', wattage: 800, ppf: 2560, efficacy: 3.2, width: 6, length: 0.5 },
        { name: 'Pro Panel 1000W', wattage: 1000, ppf: 3200, efficacy: 3.2, width: 4, length: 4 }
      ]
    },
    high: {
      fixtures: [
        { name: 'Max Output Bar 1000W', wattage: 1000, ppf: 3500, efficacy: 3.5, width: 6, length: 0.5 },
        { name: 'Mega Panel 1200W', wattage: 1200, ppf: 4200, efficacy: 3.5, width: 4, length: 4 }
      ]
    }
  }
}

interface DesignRequest {
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  targetPPFD: number;
  cropType?: string;
  mountingHeight?: number;
  isRack?: boolean;
  tiers?: number;
  requestDLC?: boolean;
  fixtureType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: DesignRequest = await request.json()
    const { 
      roomWidth, 
      roomLength, 
      roomHeight = 10, 
      targetPPFD, 
      cropType = 'leafy greens',
      mountingHeight = 2,
      isRack = false,
      tiers = 1
    } = body

    // Calculate room area
    const roomArea = roomWidth * roomLength
    const roomAreaSqM = roomArea * 0.092903 // Convert sq ft to sq m

    // Determine room size category
    let sizeCategory: 'small' | 'medium' | 'large'
    if (roomArea <= 100) sizeCategory = 'small'
    else if (roomArea <= 500) sizeCategory = 'medium'
    else sizeCategory = 'large'

    // Determine PPFD category
    let ppfdCategory: 'low' | 'medium' | 'high'
    if (targetPPFD <= 300) ppfdCategory = 'low'
    else if (targetPPFD <= 600) ppfdCategory = 'medium'
    else ppfdCategory = 'high'

    // Get appropriate fixtures
    const fixtureOptions = FIXTURE_DATABASE[sizeCategory][ppfdCategory].fixtures
    const selectedFixture = fixtureOptions[0] // Use bar lights for better uniformity

    // Calculate required PPF
    const requiredPPF = targetPPFD * roomAreaSqM
    const ppfWithLosses = requiredPPF * 1.15 // Add 15% for wall losses

    // Calculate number of fixtures needed
    let fixturesNeeded = Math.ceil(ppfWithLosses / selectedFixture.ppf)
    
    // For racks, ensure at least 2 fixtures for uniformity on smaller areas
    if (isRack && roomArea <= 50 && fixturesNeeded === 1) {
      fixturesNeeded = 2
    }

    // Calculate optimal layout
    let rows: number, cols: number
    const aspectRatio = roomWidth / roomLength

    if (aspectRatio > 1.5) {
      // Wide room - more columns
      cols = Math.ceil(Math.sqrt(fixturesNeeded * aspectRatio))
      rows = Math.ceil(fixturesNeeded / cols)
    } else if (aspectRatio < 0.67) {
      // Narrow room - more rows
      rows = Math.ceil(Math.sqrt(fixturesNeeded / aspectRatio))
      cols = Math.ceil(fixturesNeeded / rows)
    } else {
      // Square-ish room
      rows = Math.ceil(Math.sqrt(fixturesNeeded))
      cols = Math.ceil(fixturesNeeded / rows)
    }

    // Adjust if we have too many fixtures
    if (rows * cols > fixturesNeeded + 2) {
      if (rows > cols) rows--
      else cols--
    }

    // Calculate spacing
    const rowSpacing = roomLength / (rows + 1)
    const colSpacing = roomWidth / (cols + 1)

    // Generate fixture positions
    const fixtures = []
    let fixtureCount = 0

    // For multi-tier racks, distribute fixtures across levels
    const levelsToUse = isRack && tiers > 1 ? Math.min(tiers, 3) : 1 // Cap at 3 levels for practical reasons
    const fixturesPerLevel = Math.ceil(fixturesNeeded / levelsToUse)
    
    for (let level = 0; level < levelsToUse; level++) {
      // Recalculate layout for each level
      const levelFixtures = Math.min(fixturesPerLevel, fixturesNeeded - fixtureCount)
      const levelRows = Math.ceil(Math.sqrt(levelFixtures * (roomLength / roomWidth)))
      const levelCols = Math.ceil(levelFixtures / levelRows)
      
      // Calculate spacing for this level
      const levelRowSpacing = roomLength / (levelRows + 1)
      const levelColSpacing = roomWidth / (levelCols + 1)
      
      // Height for each level (assuming 18" between rack levels)
      const levelHeight = isRack ? (level * 1.5) + mountingHeight : roomHeight - mountingHeight
      
      let levelFixtureCount = 0
      for (let row = 0; row < levelRows && fixtureCount < fixturesNeeded && levelFixtureCount < levelFixtures; row++) {
        for (let col = 0; col < levelCols && fixtureCount < fixturesNeeded && levelFixtureCount < levelFixtures; col++) {
          const x = levelColSpacing * (col + 1)
          const y = levelRowSpacing * (row + 1)
          const z = levelHeight

          fixtures.push({
            type: 'fixture',
            x: x,
            y: y,
            z: z,
            rotation: roomWidth > roomLength ? 0 : 90, // Rotate fixtures for optimal coverage
            width: selectedFixture.width,
            length: selectedFixture.length,
            height: 0.5,
            enabled: true,
            customName: levelsToUse > 1 ? `Level ${level + 1} - ${row + 1}x${col + 1}` : undefined,
            model: {
              name: selectedFixture.name,
              wattage: selectedFixture.wattage,
              ppf: selectedFixture.ppf,
              efficacy: selectedFixture.efficacy,
              beamAngle: 120,
              manufacturer: 'DLC Premium',
              spectrum: ppfdCategory === 'high' ? 'Full Spectrum Enhanced Red' : 'Full Spectrum',
              isDLC: true
            },
            dimmingLevel: 100
          })
          fixtureCount++
          levelFixtureCount++
        }
      }
    }

    // Calculate expected results
    const totalPPF = fixturesNeeded * selectedFixture.ppf
    const actualPPFD = Math.round(totalPPF / roomAreaSqM * 0.85) // Account for losses
    const totalPower = fixturesNeeded * selectedFixture.wattage
    const monthlyEnergy = totalPower * 16 * 30 / 1000 // 16h photoperiod, 30 days
    const dli = actualPPFD * 16 * 0.0036

    // Generate design summary
    const design = {
      room: {
        width: roomWidth,
        length: roomLength,
        height: roomHeight,
        workingHeight: isRack ? 0.5 : 2.5,
        ceilingHeight: roomHeight,
        reflectances: {
          ceiling: 80,
          walls: 50,
          floor: 20
        }
      },
      fixtures,
      summary: {
        fixtureModel: selectedFixture.name,
        fixtureCount: fixturesNeeded,
        layout: levelsToUse > 1 
          ? `${fixturesNeeded} fixtures across ${levelsToUse} levels` 
          : `${rows} rows × ${cols} columns`,
        spacing: `${colSpacing.toFixed(1)}' × ${rowSpacing.toFixed(1)}'`,
        mountingHeight: levelsToUse > 1 
          ? `${mountingHeight}' with ${1.5}' between levels` 
          : `${mountingHeight}' above ${isRack ? 'rack' : 'canopy'}`,
        tiers: levelsToUse,
        expectedPPFD: actualPPFD,
        expectedDLI: dli.toFixed(1),
        totalPower: totalPower,
        systemEfficacy: (totalPPF / totalPower).toFixed(2),
        monthlyEnergy: monthlyEnergy.toFixed(0),
        monthlyCost: `$${(monthlyEnergy * 0.12).toFixed(0)}`, // Assuming $0.12/kWh
        uniformityEstimate: fixturesNeeded <= 4 ? '>0.7' : '>0.8'
      },
      recommendations: generateRecommendations(cropType, actualPPFD, dli)
    }

    return NextResponse.json(design)

  } catch (error) {
    console.error('Design generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate design' },
      { status: 500 }
    )
  }
}

function generateRecommendations(cropType: string, ppfd: number, dli: number): string[] {
  const recommendations = []

  // Crop-specific recommendations
  switch (cropType.toLowerCase()) {
    case 'cannabis':
    case 'hemp':
      if (ppfd < 600) {
        recommendations.push('Consider increasing PPFD to 600-900 μmol/m²/s for flowering stage')
      }
      recommendations.push('Use 18h photoperiod for vegetative, 12h for flowering')
      recommendations.push('Maintain high R:FR ratio (>4:1) for dense flower development')
      break
    
    case 'lettuce':
    case 'leafy greens':
      if (ppfd > 250) {
        recommendations.push('PPFD above 250 may not increase yield but will increase energy costs')
      }
      recommendations.push('16-18 hour photoperiod optimal for continuous harvest')
      recommendations.push('Higher blue ratio (25-30%) promotes compact growth')
      break
    
    case 'tomatoes':
    case 'tomato':
      if (ppfd < 400) {
        recommendations.push('Increase PPFD to 600-800 for fruiting stage')
      }
      recommendations.push('Consider inter-canopy lighting for 20-30% yield increase')
      recommendations.push('Add far-red (10-15%) during flowering')
      break
    
    case 'herbs':
    case 'basil':
      recommendations.push('Blue light (20-30%) enhances essential oil production')
      recommendations.push('14-16 hour photoperiod optimal')
      recommendations.push('Reduce intensity by 20% one week before harvest')
      break
  }

  // General recommendations
  if (dli < 12) {
    recommendations.push(`Current DLI of ${dli.toFixed(1)} is low - consider increasing photoperiod or intensity`)
  } else if (dli > 40) {
    recommendations.push(`DLI of ${dli.toFixed(1)} is very high - ensure proper cooling and consider CO₂ enrichment`)
  }

  recommendations.push('Install temperature/humidity sensors at canopy level')
  recommendations.push('Consider implementing sunrise/sunset dimming for 5-10% energy savings')

  return recommendations
}