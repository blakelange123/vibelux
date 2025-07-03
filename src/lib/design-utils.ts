// Design and layout utilities for lighting design

export interface Room {
  width: number
  length: number
  height: number
  area: number
}

export interface Fixture {
  id: string
  x: number
  y: number
  wattage: number
  efficacy: number
  name: string
  width: number
  length: number
}

export interface DesignResult {
  averagePPFD: number
  uniformity: number
  totalPower: number
  powerDensity: number
  fixtures: Fixture[]
}

export function createRoom(width: number, length: number, height: number = 3): Room {
  return {
    width,
    length,
    height,
    area: width * length
  }
}

export function calculateUniformity(ppfdValues: number[]): number {
  if (ppfdValues.length === 0) return 0
  
  const min = Math.min(...ppfdValues)
  const max = Math.max(...ppfdValues)
  const avg = ppfdValues.reduce((sum, val) => sum + val, 0) / ppfdValues.length
  
  // Calculate uniformity ratio (min/avg)
  return min / avg
}

export function generateFixtureLayout(
  room: Room,
  fixtureSpacing: number,
  fixtureWattage: number = 320,
  fixtureEfficacy: number = 2.7
): Fixture[] {
  const fixtures: Fixture[] = []
  let id = 1
  
  // Calculate number of fixtures per dimension
  const fixturesX = Math.floor(room.width / fixtureSpacing)
  const fixturesY = Math.floor(room.length / fixtureSpacing)
  
  // Calculate actual spacing to center the layout
  const actualSpacingX = room.width / fixturesX
  const actualSpacingY = room.length / fixturesY
  
  // Generate fixture positions
  for (let i = 0; i < fixturesX; i++) {
    for (let j = 0; j < fixturesY; j++) {
      const x = (i + 0.5) * actualSpacingX
      const y = (j + 0.5) * actualSpacingY
      
      fixtures.push({
        id: `fixture-${id++}`,
        x,
        y,
        wattage: fixtureWattage,
        efficacy: fixtureEfficacy,
        name: `LED-${fixtureWattage}W`,
        width: 1.2,
        length: 0.3
      })
    }
  }
  
  return fixtures
}

export function analyzeDesign(room: Room, fixtures: Fixture[]): DesignResult {
  // Calculate grid points for analysis
  const gridSize = 0.5 // 0.5m grid
  const pointsX = Math.floor(room.width / gridSize) + 1
  const pointsY = Math.floor(room.length / gridSize) + 1
  const ppfdValues: number[] = []
  
  // Calculate PPFD at each grid point
  for (let i = 0; i < pointsX; i++) {
    for (let j = 0; j < pointsY; j++) {
      const x = i * gridSize
      const y = j * gridSize
      let totalPPFD = 0
      
      // Sum contribution from each fixture
      fixtures.forEach(fixture => {
        const distance = Math.sqrt(
          Math.pow(x - fixture.x, 2) + Math.pow(y - fixture.y, 2) + Math.pow(room.height - 0.3, 2)
        )
        
        // Simplified inverse square law with cosine factor
        const cosineAngle = (room.height - 0.3) / distance
        const ppfdContribution = (fixture.wattage * fixture.efficacy * cosineAngle) / (distance * distance)
        totalPPFD += ppfdContribution
      })
      
      ppfdValues.push(totalPPFD)
    }
  }
  
  const averagePPFD = ppfdValues.reduce((sum, val) => sum + val, 0) / ppfdValues.length
  const uniformity = calculateUniformity(ppfdValues)
  const totalPower = fixtures.reduce((sum, fixture) => sum + fixture.wattage, 0)
  const powerDensity = totalPower / room.area
  
  return {
    averagePPFD,
    uniformity,
    totalPower,
    powerDensity,
    fixtures
  }
}

export function optimizeLayout(room: Room, targetPPFD: number = 400): DesignResult {
  let bestDesign: DesignResult | null = null
  let bestScore = 0
  
  // Test different spacing options
  for (let spacing = 1.5; spacing <= 3.0; spacing += 0.25) {
    const fixtures = generateFixtureLayout(room, spacing)
    const design = analyzeDesign(room, fixtures)
    
    // Score based on proximity to target PPFD and uniformity
    const ppfdScore = 1 - Math.abs(design.averagePPFD - targetPPFD) / targetPPFD
    const uniformityScore = design.uniformity
    const score = (ppfdScore * 0.7) + (uniformityScore * 0.3)
    
    if (score > bestScore && design.averagePPFD >= targetPPFD * 0.8) {
      bestScore = score
      bestDesign = design
    }
  }
  
  return bestDesign || analyzeDesign(room, generateFixtureLayout(room, 2.0))
}