// DLC Fixture Selection Algorithm for Optimal Efficiency
import { dlcFixturesDatabase as dlcFixtures } from './dlc-fixtures-data'

export interface FixtureSelectionParams {
  targetPPFD: number
  canopyWidth: number  // feet
  canopyLength: number // feet
  mountingHeight: number // feet above canopy
  preferredFormFactor?: 'bar' | 'panel' | 'compact'
  maxWattage?: number
  minEfficacy?: number
}

export interface FixtureRecommendation {
  fixture: any
  quantity: number
  layout: {
    rows: number
    columns: number
    spacing: number
  }
  expectedPPFD: number
  uniformity: number
  totalPower: number
  efficacyScore: number
  reasoning: string[]
}

// Calculate the illuminated area based on beam angle and mounting height
function calculateFootprint(fixture: any, mountingHeight: number): { width: number; length: number } {
  const beamAngle = fixture.beamAngle || 120 // degrees
  const beamRadius = mountingHeight * Math.tan((beamAngle / 2) * Math.PI / 180)
  
  // For bar lights, footprint is elongated
  if (fixture.formFactor === 'bar' || fixture.width > fixture.length * 2) {
    return {
      width: beamRadius * 2,
      length: fixture.length + beamRadius
    }
  }
  
  // For panel/compact lights, footprint is more square
  return {
    width: beamRadius * 2,
    length: beamRadius * 2
  }
}

// Calculate PPFD at a point based on inverse square law
function calculatePPFD(ppf: number, area: number, losses: number = 0.85): number {
  // Convert area from sq ft to sq m
  const areaM2 = area * 0.092903
  // Apply typical losses (wall reflections, etc.)
  return (ppf / areaM2) * losses
}

// Find optimal fixture for narrow spaces like 2' x 30' racks
export function selectOptimalFixture(params: FixtureSelectionParams): FixtureRecommendation[] {
  const {
    targetPPFD,
    canopyWidth,
    canopyLength,
    mountingHeight,
    preferredFormFactor,
    maxWattage = 1000,
    minEfficacy = 2.5
  } = params

  const canopyArea = canopyWidth * canopyLength
  const canopyAreaM2 = canopyArea * 0.092903
  const requiredPPF = targetPPFD * canopyAreaM2 / 0.85 // Account for losses

  // Filter DLC fixtures based on criteria
  const eligibleFixtures = dlcFixtures.filter(fixture => {
    if (!fixture.ppf || !fixture.wattage) return false
    if (fixture.wattage > maxWattage) return false
    if ((fixture.ppf / fixture.wattage) < minEfficacy) return false
    if (preferredFormFactor && fixture.formFactor !== preferredFormFactor) return false
    return true
  })

  const recommendations: FixtureRecommendation[] = []

  // For narrow spaces like 2' x 30', prefer bar lights
  const isNarrowSpace = canopyWidth <= 4 && canopyLength >= canopyWidth * 5

  for (const fixture of eligibleFixtures) {
    const footprint = calculateFootprint(fixture, mountingHeight)
    
    // Skip fixtures that are too wide for the space
    if (footprint.width > canopyWidth * 1.5) continue

    // Calculate optimal fixture count and layout
    let layout: { rows: number; columns: number; spacing: number }
    let fixtureCount: number

    if (isNarrowSpace) {
      // For narrow spaces, arrange fixtures in a single row
      const fixtureSpacing = Math.min(footprint.length, canopyLength / Math.ceil(requiredPPF / fixture.ppf))
      fixtureCount = Math.ceil(canopyLength / fixtureSpacing)
      
      // Ensure we meet PPFD requirements
      const ppfPerFixture = fixture.ppf
      const minFixturesNeeded = Math.ceil(requiredPPF / ppfPerFixture)
      fixtureCount = Math.max(fixtureCount, minFixturesNeeded)
      
      layout = {
        rows: 1,
        columns: fixtureCount,
        spacing: canopyLength / fixtureCount
      }
    } else {
      // For wider spaces, calculate grid layout
      const fixturesPerRow = Math.floor(canopyWidth / footprint.width)
      const rowsNeeded = Math.ceil(requiredPPF / (fixture.ppf * fixturesPerRow))
      
      layout = {
        rows: rowsNeeded,
        columns: fixturesPerRow,
        spacing: Math.min(footprint.length, canopyLength / rowsNeeded)
      }
      
      fixtureCount = rowsNeeded * fixturesPerRow
    }

    // Calculate expected performance
    const totalPPF = fixture.ppf * fixtureCount
    const expectedPPFD = calculatePPFD(totalPPF, canopyArea)
    const totalPower = fixture.wattage * fixtureCount
    const systemEfficacy = totalPPF / totalPower

    // Estimate uniformity based on overlap
    const overlap = (footprint.width * fixtureCount) / canopyWidth
    const uniformity = Math.min(0.9, 0.6 + (overlap - 1) * 0.3)

    // Score based on multiple factors
    const efficacyScore = 
      (systemEfficacy / 3.5) * 0.4 + // Efficacy (40%)
      (Math.min(1, targetPPFD / Math.abs(expectedPPFD - targetPPFD + 1)) * 0.3) + // PPFD accuracy (30%)
      (uniformity * 0.2) + // Uniformity (20%)
      (Math.min(1, 500 / totalPower) * 0.1) // Power efficiency (10%)

    const reasoning: string[] = []
    
    if (isNarrowSpace && fixture.formFactor === 'bar') {
      reasoning.push('Bar form factor ideal for narrow rack')
    }
    
    if (systemEfficacy >= 3.0) {
      reasoning.push(`High efficacy: ${systemEfficacy.toFixed(2)} μmol/J`)
    }
    
    if (Math.abs(expectedPPFD - targetPPFD) <= targetPPFD * 0.05) {
      reasoning.push('Excellent PPFD match')
    }
    
    if (uniformity >= 0.8) {
      reasoning.push('Superior uniformity expected')
    }

    recommendations.push({
      fixture,
      quantity: fixtureCount,
      layout,
      expectedPPFD: Math.round(expectedPPFD),
      uniformity,
      totalPower,
      efficacyScore,
      reasoning
    })
  }

  // Sort by efficacy score
  recommendations.sort((a, b) => b.efficacyScore - a.efficacyScore)

  // Return top 5 recommendations
  return recommendations.slice(0, 5)
}

// Helper function to generate fixture placement coordinates
export function generateFixturePlacements(
  recommendation: FixtureRecommendation,
  startX: number,
  startY: number,
  z: number
): Array<{ x: number; y: number; z: number; rotation: number }> {
  const placements: Array<{ x: number; y: number; z: number; rotation: number }> = []
  const { rows, columns, spacing } = recommendation.layout

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      placements.push({
        x: startX + col * spacing,
        y: startY + row * spacing,
        z: z,
        rotation: rows === 1 ? 90 : 0 // Rotate for single-row layouts
      })
    }
  }

  return placements
}

// Calculate exact PPFD for a specific calculation surface
export function calculateSurfacePPFD(
  fixtures: Array<{ x: number; y: number; z: number; ppf: number; beamAngle: number }>,
  surfaceX: number,
  surfaceY: number,
  surfaceWidth: number,
  surfaceLength: number,
  surfaceHeight: number,
  gridResolution: number = 0.5 // feet
): {
  averagePPFD: number
  minPPFD: number
  maxPPFD: number
  uniformity: number
  ppfdMap: number[][]
} {
  const gridCols = Math.ceil(surfaceWidth / gridResolution)
  const gridRows = Math.ceil(surfaceLength / gridResolution)
  const ppfdMap: number[][] = []
  let totalPPFD = 0
  let minPPFD = Infinity
  let maxPPFD = 0

  for (let row = 0; row < gridRows; row++) {
    ppfdMap[row] = []
    for (let col = 0; col < gridCols; col++) {
      const pointX = surfaceX + col * gridResolution
      const pointY = surfaceY + row * gridResolution
      let ppfdAtPoint = 0

      // Calculate contribution from each fixture
      for (const fixture of fixtures) {
        const distance = Math.sqrt(
          Math.pow(fixture.x - pointX, 2) +
          Math.pow(fixture.y - pointY, 2) +
          Math.pow(fixture.z - surfaceHeight, 2)
        )
        
        // Check if point is within beam angle
        const verticalDistance = fixture.z - surfaceHeight
        const horizontalDistance = Math.sqrt(
          Math.pow(fixture.x - pointX, 2) +
          Math.pow(fixture.y - pointY, 2)
        )
        const angle = Math.atan(horizontalDistance / verticalDistance) * 180 / Math.PI
        
        if (angle <= fixture.beamAngle / 2) {
          // Apply inverse square law with cosine correction
          const cosineAngle = verticalDistance / distance
          const ppfContribution = (fixture.ppf * cosineAngle) / (4 * Math.PI * distance * distance * 10.764) // Convert to m²
          ppfdAtPoint += ppfContribution
        }
      }

      ppfdMap[row][col] = ppfdAtPoint
      totalPPFD += ppfdAtPoint
      minPPFD = Math.min(minPPFD, ppfdAtPoint)
      maxPPFD = Math.max(maxPPFD, ppfdAtPoint)
    }
  }

  const averagePPFD = totalPPFD / (gridRows * gridCols)
  const uniformity = minPPFD / averagePPFD

  return {
    averagePPFD: Math.round(averagePPFD),
    minPPFD: Math.round(minPPFD),
    maxPPFD: Math.round(maxPPFD),
    uniformity: Number(uniformity.toFixed(2)),
    ppfdMap
  }
}