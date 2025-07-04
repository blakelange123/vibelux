/**
 * Extended lighting design calculations for polygon-shaped rooms
 */

import { 
  Vertex, 
  isPointInPolygon, 
  calculatePolygonArea,
  calculatePolygonBounds,
  generatePolygonGrid
} from './polygon-utils'
import { 
  LightSource, 
  GridPoint, 
  calculatePPFDAtPoint 
} from './lighting-design'

export interface PolygonRoom {
  vertices: Vertex[]
  mountingHeight: number
  targetPPFD: number
  targetDLI: number
  photoperiod: number
}

/**
 * Calculate PPFD grid for polygon-shaped rooms
 */
export function calculatePPFDGridPolygon(
  sources: LightSource[],
  room: PolygonRoom,
  gridResolution: number = 30
): GridPoint[] {
  const bounds = calculatePolygonBounds(room.vertices)
  const grid: GridPoint[] = []
  
  // Generate grid points
  const stepX = bounds.width / gridResolution
  const stepY = bounds.height / gridResolution
  
  for (let i = 0; i <= gridResolution; i++) {
    for (let j = 0; j <= gridResolution; j++) {
      const x = bounds.minX + i * stepX
      const y = bounds.minY + j * stepY
      const point = { x, y }
      
      // Only calculate PPFD for points inside the polygon
      if (isPointInPolygon(point, room.vertices)) {
        // Convert to percentage for compatibility with existing calculations
        const percentPoint = {
          x: ((x - bounds.minX) / bounds.width) * 100,
          y: ((y - bounds.minY) / bounds.height) * 100
        }
        
        let totalPPFD = 0
        sources.forEach(source => {
          totalPPFD += calculatePPFDAtPoint(
            percentPoint, 
            source, 
            { width: bounds.width, height: bounds.height }
          )
        })
        
        grid.push({
          position: { x, y },
          ppfd: totalPPFD,
          dli: totalPPFD * 0.0036 * room.photoperiod
        })
      }
    }
  }
  
  return grid
}

/**
 * Generate optimal fixture layout for polygon rooms
 */
export function generateOptimalLayoutPolygon(
  room: PolygonRoom,
  targetPPFD: number,
  fixtureSpecs: { ppf: number; coverage: number }
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  const bounds = calculatePolygonBounds(room.vertices)
  const area = calculatePolygonArea(room.vertices)
  
  // Calculate fixture spacing
  const fixtureRadius = Math.sqrt(fixtureSpecs.coverage / Math.PI)
  const spacing = fixtureRadius * 1.5
  
  // Generate hexagonal grid for better coverage
  const rows = Math.ceil(bounds.height / (spacing * Math.sqrt(3) / 2))
  const cols = Math.ceil(bounds.width / spacing)
  
  for (let row = 0; row < rows; row++) {
    const yOffset = row * spacing * Math.sqrt(3) / 2
    const xOffset = (row % 2) * spacing / 2
    
    for (let col = 0; col < cols; col++) {
      const x = bounds.minX + xOffset + col * spacing
      const y = bounds.minY + yOffset
      
      // Check if position is inside polygon
      if (isPointInPolygon({ x, y }, room.vertices)) {
        // Check if fixture would be fully inside (approximate)
        const checkPoints = [
          { x: x + fixtureRadius * 0.7, y },
          { x: x - fixtureRadius * 0.7, y },
          { x, y: y + fixtureRadius * 0.7 },
          { x, y: y - fixtureRadius * 0.7 }
        ]
        
        const fullyInside = checkPoints.every(p => isPointInPolygon(p, room.vertices))
        
        if (fullyInside) {
          positions.push({ x, y })
        }
      }
    }
  }
  
  // Estimate required fixtures based on area and target PPFD
  const requiredPPF = targetPPFD * area * 0.0929 // Convert ft² to m²
  const requiredFixtures = Math.ceil(requiredPPF / fixtureSpecs.ppf)
  
  // If we have too many positions, select the most evenly distributed ones
  if (positions.length > requiredFixtures) {
    // Use a simple algorithm to select evenly distributed fixtures
    const selected = selectEvenlyDistributed(positions, requiredFixtures)
    return selected
  }
  
  return positions
}

/**
 * Select evenly distributed positions from a set
 */
function selectEvenlyDistributed(
  positions: { x: number; y: number }[],
  count: number
): { x: number; y: number }[] {
  if (positions.length <= count) return positions
  
  const selected: { x: number; y: number }[] = []
  const remaining = [...positions]
  
  // Start with the position closest to center
  const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length
  const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length
  
  let closest = remaining[0]
  let closestDist = Infinity
  let closestIndex = 0
  
  remaining.forEach((p, i) => {
    const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
    if (dist < closestDist) {
      closest = p
      closestDist = dist
      closestIndex = i
    }
  })
  
  selected.push(closest)
  remaining.splice(closestIndex, 1)
  
  // Select remaining positions to maximize minimum distance
  while (selected.length < count && remaining.length > 0) {
    let bestPosition = remaining[0]
    let bestMinDist = 0
    let bestIndex = 0
    
    remaining.forEach((candidate, i) => {
      const minDist = Math.min(...selected.map(s => 
        Math.sqrt(Math.pow(candidate.x - s.x, 2) + Math.pow(candidate.y - s.y, 2))
      ))
      
      if (minDist > bestMinDist) {
        bestPosition = candidate
        bestMinDist = minDist
        bestIndex = i
      }
    })
    
    selected.push(bestPosition)
    remaining.splice(bestIndex, 1)
  }
  
  return selected
}

/**
 * Calculate uniformity for polygon rooms
 */
export function calculateUniformityPolygon(grid: GridPoint[]): number {
  if (grid.length === 0) return 0
  
  const ppfdValues = grid.map(point => point.ppfd).filter(ppfd => ppfd > 0)
  if (ppfdValues.length === 0) return 0
  
  const max = Math.max(...ppfdValues)
  const min = Math.min(...ppfdValues)
  const avg = ppfdValues.reduce((sum, val) => sum + val, 0) / ppfdValues.length
  
  // Use min/avg ratio for polygon rooms (more appropriate for irregular shapes)
  return min / avg
}

/**
 * Calculate coverage for polygon rooms
 */
export function calculateCoveragePolygon(
  grid: GridPoint[],
  threshold: number,
  vertices: Vertex[]
): number {
  const pointsAboveThreshold = grid.filter(point => point.ppfd >= threshold).length
  const totalPoints = grid.length
  
  if (totalPoints === 0) return 0
  
  const area = calculatePolygonArea(vertices)
  const coverageRatio = pointsAboveThreshold / totalPoints
  
  return area * coverageRatio
}

/**
 * Export polygon room design
 */
export function exportPolygonDesign(
  room: PolygonRoom,
  fixtures: any[],
  metrics: any
): string {
  const bounds = calculatePolygonBounds(room.vertices)
  const area = calculatePolygonArea(room.vertices)
  
  const design = {
    room: {
      shape: 'polygon',
      vertices: room.vertices,
      bounds,
      area,
      mountingHeight: room.mountingHeight,
      targetPPFD: room.targetPPFD,
      targetDLI: room.targetDLI,
      photoperiod: room.photoperiod
    },
    fixtures: fixtures.map(f => ({
      id: f.id,
      position: { x: f.x, y: f.y },
      rotation: f.rotation,
      model: f.model,
      specifications: {
        ppf: f.model.ppf,
        wattage: f.model.wattage,
        coverage: f.model.coverage
      },
      enabled: f.enabled
    })),
    metrics: {
      ...metrics,
      roomArea: area
    },
    timestamp: new Date().toISOString()
  }
  
  return JSON.stringify(design, null, 2)
}