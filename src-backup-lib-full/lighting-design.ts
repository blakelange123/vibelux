// Lighting design calculation utilities

import { generateIESPhotometry, type IESPhotometry } from './ies-generator'
import type { DLCFixture } from './fixtures-data'

export interface Point {
  x: number
  y: number
}

export interface LightSource {
  position: Point
  ppf: number
  beamAngle: number
  height: number
  enabled: boolean
  fixture?: DLCFixture // Optional DLC fixture data for IES generation
  iesData?: IESPhotometry // Cached IES photometry
}

export interface GridPoint {
  position: Point
  ppfd: number
  dli: number
}

// Calculate PPFD at a specific point from a light source using IES photometry
export function calculatePPFDAtPoint(
  point: Point,
  source: LightSource,
  roomDimensions: { width: number; height: number }
): number {
  if (!source.enabled) return 0

  // Convert percentage positions to actual distances (meters)
  const pointX = (point.x / 100) * roomDimensions.width * 0.3048
  const pointY = (point.y / 100) * roomDimensions.height * 0.3048
  const sourceZ = source.height * 0.3048 // Convert ft to m

  // If we have a DLC fixture with dimensions, use distributed light calculation
  if (source.fixture && source.fixture.width > 0 && source.fixture.length > 0) {
    // Convert fixture dimensions to meters
    const fixtureWidth = source.fixture.width * 0.3048
    const fixtureLength = source.fixture.length * 0.3048
    
    // Calculate number of sample points based on fixture size
    const samplesX = Math.max(3, Math.ceil(source.fixture.width))
    const samplesY = Math.max(3, Math.ceil(source.fixture.length))
    
    let totalPPFD = 0
    const ppfPerPoint = source.ppf / (samplesX * samplesY)
    
    // Sample multiple points across the fixture surface
    for (let sx = 0; sx < samplesX; sx++) {
      for (let sy = 0; sy < samplesY; sy++) {
        // Calculate position of this sample point on the fixture
        const sampleOffsetX = (sx - (samplesX - 1) / 2) * (fixtureWidth / samplesX)
        const sampleOffsetY = (sy - (samplesY - 1) / 2) * (fixtureLength / samplesY)
        
        const sourceX = (source.position.x / 100) * roomDimensions.width * 0.3048 + sampleOffsetX
        const sourceY = (source.position.y / 100) * roomDimensions.height * 0.3048 + sampleOffsetY
        
        // Calculate 3D vector from this sample point to target point
        const dx = pointX - sourceX
        const dy = pointY - sourceY
        const dz = -sourceZ
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        // Calculate angles for IES lookup
        const horizontalDistance = Math.sqrt(dx * dx + dy * dy)
        const verticalAngle = Math.acos(-dz / distance) * (180 / Math.PI)
        let horizontalAngle = Math.atan2(dy, dx) * (180 / Math.PI)
        if (horizontalAngle < 0) horizontalAngle += 360
        
        // Use IES data if available
        const iesData = source.iesData || generateIESPhotometry(source.fixture)
        const candela = interpolateIESData(iesData, verticalAngle, horizontalAngle)
        
        // Convert candela to PPFD for this sample point
        const cosineFactor = Math.cos(verticalAngle * Math.PI / 180)
        const lumens = candela * cosineFactor / (distance * distance)
        const ppfd = (lumens * 4.54 * ppfPerPoint) / source.ppf // Scale by portion of total PPF
        
        totalPPFD += ppfd
      }
    }
    
    return Math.max(0, totalPPFD)
  }

  // For fixtures without dimensions, use center point calculation
  const sourceX = (source.position.x / 100) * roomDimensions.width * 0.3048
  const sourceY = (source.position.y / 100) * roomDimensions.height * 0.3048

  // Calculate 3D vector from source to point
  const dx = pointX - sourceX
  const dy = pointY - sourceY
  const dz = -sourceZ

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  
  // Calculate angles for IES lookup
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy)
  const verticalAngle = Math.acos(-dz / distance) * (180 / Math.PI)
  let horizontalAngle = Math.atan2(dy, dx) * (180 / Math.PI)
  if (horizontalAngle < 0) horizontalAngle += 360

  // Use IES data if available
  if (source.fixture && (source.iesData || source.fixture)) {
    const iesData = source.iesData || generateIESPhotometry(source.fixture)
    const candela = interpolateIESData(iesData, verticalAngle, horizontalAngle)
    
    const cosineFactor = Math.cos(verticalAngle * Math.PI / 180)
    const lumens = candela * cosineFactor / (distance * distance)
    const ppfd = lumens * 4.54
    
    return Math.max(0, ppfd)
  }

  // Fallback to simple inverse square law calculation
  const angle = Math.atan(horizontalDistance / sourceZ) * (180 / Math.PI)
  const angleAttenuation = angle <= source.beamAngle / 2 ? 1 : 
    Math.cos((angle - source.beamAngle / 2) * Math.PI / 180)
  
  const ppfd = (source.ppf / (4 * Math.PI * Math.pow(distance, 2))) * angleAttenuation

  return Math.max(0, ppfd)
}

/**
 * Interpolate candela value from IES photometric data
 */
function interpolateIESData(
  iesData: IESPhotometry, 
  verticalAngle: number, 
  horizontalAngle: number
): number {
  // Find closest vertical angle indices
  let v1 = 0, v2 = 0
  for (let i = 0; i < iesData.verticalAngles.length - 1; i++) {
    if (verticalAngle >= iesData.verticalAngles[i] && verticalAngle <= iesData.verticalAngles[i + 1]) {
      v1 = i
      v2 = i + 1
      break
    }
  }
  if (verticalAngle > iesData.verticalAngles[iesData.verticalAngles.length - 1]) {
    v1 = v2 = iesData.verticalAngles.length - 1
  }

  // Find closest horizontal angle indices
  let h1 = 0, h2 = 0
  for (let i = 0; i < iesData.horizontalAngles.length - 1; i++) {
    if (horizontalAngle >= iesData.horizontalAngles[i] && horizontalAngle <= iesData.horizontalAngles[i + 1]) {
      h1 = i
      h2 = i + 1
      break
    }
  }
  
  // Handle 360° wraparound
  if (horizontalAngle > iesData.horizontalAngles[iesData.horizontalAngles.length - 1]) {
    h1 = iesData.horizontalAngles.length - 1
    h2 = 0
  }

  // Bilinear interpolation
  const vWeight = v1 === v2 ? 0 : 
    (verticalAngle - iesData.verticalAngles[v1]) / (iesData.verticalAngles[v2] - iesData.verticalAngles[v1])
  
  const hWeight = h1 === h2 ? 0 :
    (horizontalAngle - iesData.horizontalAngles[h1]) / (iesData.horizontalAngles[h2] - iesData.horizontalAngles[h1])

  // Get four corner values
  const c11 = iesData.candela[v1][h1]
  const c12 = iesData.candela[v1][h2]
  const c21 = iesData.candela[v2][h1]
  const c22 = iesData.candela[v2][h2]

  // Interpolate
  const c1 = c11 * (1 - hWeight) + c12 * hWeight
  const c2 = c21 * (1 - hWeight) + c22 * hWeight
  const candela = c1 * (1 - vWeight) + c2 * vWeight

  return candela
}

// Calculate PPFD grid for multiple light sources
export function calculatePPFDGrid(
  sources: LightSource[],
  roomDimensions: { width: number; height: number },
  gridResolution: number = 20
): GridPoint[] {
  const grid: GridPoint[] = []
  const stepX = 100 / gridResolution
  const stepY = 100 / gridResolution

  for (let x = 0; x <= 100; x += stepX) {
    for (let y = 0; y <= 100; y += stepY) {
      const point = { x, y }
      let totalPPFD = 0

      // Sum PPFD from all sources
      sources.forEach(source => {
        totalPPFD += calculatePPFDAtPoint(point, source, roomDimensions)
      })

      grid.push({
        position: point,
        ppfd: totalPPFD,
        dli: totalPPFD * 0.0036 * 16 // Assuming 16-hour photoperiod
      })
    }
  }

  return grid
}

// Calculate uniformity (avg/max ratio)
export function calculateUniformity(grid: GridPoint[]): number {
  if (grid.length === 0) return 0

  const ppfdValues = grid.map(point => point.ppfd).filter(ppfd => ppfd > 0)
  if (ppfdValues.length === 0) return 0

  const max = Math.max(...ppfdValues)
  const avg = ppfdValues.reduce((sum, val) => sum + val, 0) / ppfdValues.length

  return avg / max
}

// Calculate coverage area above threshold
export function calculateCoverage(
  grid: GridPoint[],
  threshold: number,
  roomArea: number
): number {
  const pointsAboveThreshold = grid.filter(point => point.ppfd >= threshold).length
  const totalPoints = grid.length
  
  return (pointsAboveThreshold / totalPoints) * roomArea
}

// Generate optimal fixture layout
export function generateOptimalLayout(
  roomDimensions: { width: number; height: number },
  targetPPFD: number,
  fixtureSpecs: { ppf: number; coverage: number }
): Point[] {
  const positions: Point[] = []
  
  // Calculate optimal spacing based on fixture coverage
  const fixtureRadius = Math.sqrt(fixtureSpecs.coverage / Math.PI)
  const spacing = fixtureRadius * 1.5 // 1.5x for overlap
  
  // Generate grid layout
  const cols = Math.ceil(roomDimensions.width / spacing)
  const rows = Math.ceil(roomDimensions.height / spacing)
  
  const xOffset = (100 - (cols - 1) * (spacing / roomDimensions.width * 100)) / 2
  const yOffset = (100 - (rows - 1) * (spacing / roomDimensions.height * 100)) / 2
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: xOffset + col * (spacing / roomDimensions.width * 100),
        y: yOffset + row * (spacing / roomDimensions.height * 100)
      })
    }
  }
  
  return positions
}

// Calculate power metrics
export function calculatePowerMetrics(
  fixtures: { wattage: number; enabled: boolean }[],
  roomArea: number,
  hoursPerDay: number,
  electricityRate: number
) {
  const totalPower = fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
  const powerDensity = totalPower / roomArea
  const dailyEnergy = (totalPower * hoursPerDay) / 1000 // kWh
  const dailyCost = dailyEnergy * electricityRate
  const monthlyCost = dailyCost * 30
  const yearlyCost = dailyCost * 365

  return {
    totalPower,
    powerDensity,
    dailyEnergy,
    dailyCost,
    monthlyCost,
    yearlyCost
  }
}

// Export design data
export function exportDesign(
  room: any,
  fixtures: any[],
  metrics: any
): string {
  const design = {
    room,
    fixtures: fixtures.map(f => ({
      id: f.id,
      position: { x: f.x, y: f.y },
      rotation: f.rotation,
      model: f.model,
      specifications: {
        ppf: f.ppf,
        wattage: f.wattage,
        coverage: f.coverage
      },
      enabled: f.enabled
    })),
    metrics,
    timestamp: new Date().toISOString()
  }

  return JSON.stringify(design, null, 2)
}