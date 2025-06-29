import type { LightSource } from './lighting-design'

// Memoization cache for PPFD calculations
const ppfdCache = new Map<string, number>()

// Generate cache key for PPFD calculation
function generateCacheKey(x: number, y: number, source: LightSource): string {
  return `${x},${y}-${source.position.x},${source.position.y},${source.ppf},${source.beamAngle},${source.height}`
}

// Calculate PPFD at a single point from a single source (with memoization)
export function calculatePPFDAtPoint(
  x: number,
  y: number,
  source: LightSource
): number {
  const cacheKey = generateCacheKey(x, y, source)
  
  if (ppfdCache.has(cacheKey)) {
    return ppfdCache.get(cacheKey)!
  }

  // Distance from light source
  const dx = x - source.position.x
  const dy = y - source.position.y
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy)
  const totalDistance = Math.sqrt(
    horizontalDistance * horizontalDistance + 
    source.height * source.height
  )

  // Angle from vertical
  const angle = Math.atan(horizontalDistance / source.height) * (180 / Math.PI)

  // Simple lambertian distribution
  let intensity = 1.0
  if (angle > source.beamAngle / 2) {
    // Outside beam angle - rapid falloff
    const outsideAngle = angle - source.beamAngle / 2
    intensity = Math.exp(-outsideAngle * 0.1)
  } else {
    // Inside beam angle - cosine distribution
    intensity = Math.cos(angle * Math.PI / 180)
  }

  // Inverse square law
  const distanceFactor = 1 / (totalDistance * totalDistance)
  
  // Convert PPF to PPFD considering the coverage area
  const ppfd = source.ppf * intensity * distanceFactor * 10

  ppfdCache.set(cacheKey, ppfd)
  return ppfd
}

// Optimized PPFD grid calculation
export function calculateOptimizedPPFDGrid(
  width: number,
  height: number,
  sources: LightSource[],
  resolution: number = 50
): number[][] {
  const gridWidth = Math.ceil(width * resolution / 10)
  const gridHeight = Math.ceil(height * resolution / 10)
  const grid: number[][] = []

  // Pre-calculate step sizes
  const xStep = width / gridWidth
  const yStep = height / gridHeight

  for (let y = 0; y < gridHeight; y++) {
    const row: number[] = []
    const yPos = y * yStep + yStep / 2

    for (let x = 0; x < gridWidth; x++) {
      const xPos = x * xStep + xStep / 2
      let totalPPFD = 0

      // Sum contributions from all light sources
      for (const source of sources) {
        totalPPFD += calculatePPFDAtPoint(xPos, yPos, source)
      }

      row.push(totalPPFD)
    }
    grid.push(row)
  }

  return grid
}

// Clear cache when needed (e.g., when fixtures change significantly)
export function clearPPFDCache(): void {
  ppfdCache.clear()
}

// Calculate uniformity metrics with optimizations
export function calculateUniformityMetrics(grid: number[][]): {
  average: number
  min: number
  max: number
  uniformity: number
  cv: number // Coefficient of variation
} {
  if (grid.length === 0 || grid[0].length === 0) {
    return { average: 0, min: 0, max: 0, uniformity: 0, cv: 0 }
  }

  let sum = 0
  let min = Infinity
  let max = -Infinity
  let count = 0

  // Single pass to calculate min, max, and sum
  for (const row of grid) {
    for (const value of row) {
      sum += value
      min = Math.min(min, value)
      max = Math.max(max, value)
      count++
    }
  }

  const average = count > 0 ? sum / count : 0
  const uniformity = max > 0 ? average / max : 0

  // Calculate coefficient of variation
  let variance = 0
  for (const row of grid) {
    for (const value of row) {
      variance += Math.pow(value - average, 2)
    }
  }
  variance = count > 1 ? variance / (count - 1) : 0
  const cv = average > 0 ? Math.sqrt(variance) / average : 0

  return {
    average: Math.round(average),
    min: Math.round(min),
    max: Math.round(max),
    uniformity: Math.round(uniformity * 100) / 100,
    cv: Math.round(cv * 100) / 100
  }
}

// Calculate coverage area above threshold
export function calculateCoverageArea(
  grid: number[][],
  threshold: number
): number {
  if (grid.length === 0 || grid[0].length === 0) {
    return 0
  }

  let aboveThreshold = 0
  let total = 0

  for (const row of grid) {
    for (const value of row) {
      if (value >= threshold) {
        aboveThreshold++
      }
      total++
    }
  }

  return total > 0 ? (aboveThreshold / total) * 100 : 0
}

// Batch calculate DLI for different photoperiods
export function calculateDLIBatch(
  ppfd: number,
  photoperiods: number[]
): Map<number, number> {
  const dliMap = new Map<number, number>()
  
  for (const photoperiod of photoperiods) {
    // DLI = PPFD × photoperiod × 3.6 / 1000
    const dli = ppfd * photoperiod * 3.6 / 1000
    dliMap.set(photoperiod, Math.round(dli * 10) / 10)
  }
  
  return dliMap
}

// Calculate DLI (Daily Light Integral) from PPFD and photoperiod
export function calculateDLI(ppfd: number, photoperiod: number): number {
  // DLI = PPFD × photoperiod × 3.6 / 1000
  return (ppfd * photoperiod * 3.6) / 1000
}

// Calculate PPFD from multiple fixtures at a point
export function calculateMultiFixturePPFD(
  x: number,
  y: number,
  fixtures: Array<{
    ppf: number
    x: number
    y: number
    height: number
    beamAngle: number
  }>
): number {
  let totalPPFD = 0
  
  for (const fixture of fixtures) {
    const source: LightSource = {
      position: { x: fixture.x, y: fixture.y },
      ppf: fixture.ppf,
      beamAngle: fixture.beamAngle,
      height: fixture.height,
      enabled: true
    }
    totalPPFD += calculatePPFDAtPoint(x, y, source)
  }
  
  return totalPPFD
}

// Generate PPFD heatmap data for visualization
export function generatePPFDHeatmap(
  fixtures: Array<{
    ppf: number
    x: number
    y: number
    height: number
    beamAngle: number
  }>,
  roomWidth: number,
  roomLength: number,
  resolution: number = 0.25
): Array<{ x: number; y: number; ppfd: number }> {
  const data: Array<{ x: number; y: number; ppfd: number }> = []
  
  // Generate grid points
  for (let y = resolution / 2; y < roomLength; y += resolution) {
    for (let x = resolution / 2; x < roomWidth; x += resolution) {
      const ppfd = calculateMultiFixturePPFD(x, y, fixtures)
      data.push({ x, y, ppfd })
    }
  }
  
  return data
}

// Calculate uniformity metrics from PPFD values
export function calculateUniformity(ppfdValues: number[]): {
  min: number
  max: number
  avg: number
  uniformityRatio: number
  cv: number
} {
  if (ppfdValues.length === 0) {
    return { min: 0, max: 0, avg: 0, uniformityRatio: 0, cv: 0 }
  }
  
  const min = Math.min(...ppfdValues)
  const max = Math.max(...ppfdValues)
  const sum = ppfdValues.reduce((a, b) => a + b, 0)
  const avg = sum / ppfdValues.length
  
  // Uniformity ratio (min/avg)
  const uniformityRatio = avg > 0 ? min / avg : 0
  
  // Calculate coefficient of variation (CV)
  const variance = ppfdValues.reduce((sum, value) => {
    return sum + Math.pow(value - avg, 2)
  }, 0) / (ppfdValues.length - 1)
  
  const stdDev = Math.sqrt(variance)
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0
  
  return {
    min: Math.round(min),
    max: Math.round(max),
    avg: Math.round(avg),
    uniformityRatio: Math.round(uniformityRatio * 100) / 100,
    cv: Math.round(cv * 10) / 10
  }
}