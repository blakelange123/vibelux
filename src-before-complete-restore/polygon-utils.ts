/**
 * Polygon utilities for non-rectangular room shapes
 */

export interface Vertex {
  x: number // in feet or percentage
  y: number // in feet or percentage
}

export interface PolygonRoom {
  vertices: Vertex[]
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    width: number
    height: number
  }
  area: number
  perimeter: number
  centroid: Vertex
}

/**
 * Calculate the area of a polygon using the shoelace formula
 */
export function calculatePolygonArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0
  
  let area = 0
  const n = vertices.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += vertices[i].x * vertices[j].y
    area -= vertices[j].x * vertices[i].y
  }
  
  return Math.abs(area) / 2
}

/**
 * Calculate the perimeter of a polygon
 */
export function calculatePolygonPerimeter(vertices: Vertex[]): number {
  if (vertices.length < 2) return 0
  
  let perimeter = 0
  const n = vertices.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const dx = vertices[j].x - vertices[i].x
    const dy = vertices[j].y - vertices[i].y
    perimeter += Math.sqrt(dx * dx + dy * dy)
  }
  
  return perimeter
}

/**
 * Calculate the centroid of a polygon
 */
export function calculatePolygonCentroid(vertices: Vertex[]): Vertex {
  if (vertices.length === 0) return { x: 0, y: 0 }
  
  let cx = 0
  let cy = 0
  let area = 0
  const n = vertices.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const a = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y
    area += a
    cx += (vertices[i].x + vertices[j].x) * a
    cy += (vertices[i].y + vertices[j].y) * a
  }
  
  area *= 0.5
  const factor = 1 / (6 * area)
  
  return {
    x: cx * factor,
    y: cy * factor
  }
}

/**
 * Calculate bounding box of a polygon
 */
export function calculatePolygonBounds(vertices: Vertex[]) {
  if (vertices.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0
    }
  }
  
  let minX = vertices[0].x
  let maxX = vertices[0].x
  let minY = vertices[0].y
  let maxY = vertices[0].y
  
  for (const vertex of vertices) {
    minX = Math.min(minX, vertex.x)
    maxX = Math.max(maxX, vertex.x)
    minY = Math.min(minY, vertex.y)
    maxY = Math.max(maxY, vertex.y)
  }
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: Vertex, vertices: Vertex[]): boolean {
  if (vertices.length < 3) return false
  
  let inside = false
  const n = vertices.length
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x
    const yi = vertices[i].y
    const xj = vertices[j].x
    const yj = vertices[j].y
    
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
    
    if (intersect) inside = !inside
  }
  
  return inside
}

/**
 * Get predefined room shapes
 */
export function getPredefinedShapes(): Record<string, Vertex[]> {
  return {
    'l-shape': [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 10 },
      { x: 0, y: 10 }
    ],
    'l-shape-reversed': [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 4, y: 10 },
      { x: 4, y: 4 },
      { x: 0, y: 4 }
    ],
    't-shape': [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 4 },
      { x: 7, y: 4 },
      { x: 7, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 2 },
      { x: 7, y: 2 },
      { x: 7, y: 10 },
      { x: 3, y: 10 },
      { x: 3, y: 2 },
      { x: 0, y: 2 }
    ],
    'u-shape': [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 7 },
      { x: 7, y: 7 },
      { x: 7, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ],
    'trapezoid': [
      { x: 2, y: 0 },
      { x: 8, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ],
    'pentagon': [
      { x: 5, y: 0 },
      { x: 10, y: 3.82 },
      { x: 8.09, y: 10 },
      { x: 1.91, y: 10 },
      { x: 0, y: 3.82 }
    ],
    'hexagon': [
      { x: 5, y: 0 },
      { x: 9.33, y: 2.5 },
      { x: 9.33, y: 7.5 },
      { x: 5, y: 10 },
      { x: 0.67, y: 7.5 },
      { x: 0.67, y: 2.5 }
    ],
    'octagon': [
      { x: 3, y: 0 },
      { x: 7, y: 0 },
      { x: 10, y: 3 },
      { x: 10, y: 7 },
      { x: 7, y: 10 },
      { x: 3, y: 10 },
      { x: 0, y: 7 },
      { x: 0, y: 3 }
    ]
  }
}

/**
 * Normalize vertices to a specific scale
 */
export function normalizeVertices(vertices: Vertex[], targetWidth: number, targetHeight: number): Vertex[] {
  const bounds = calculatePolygonBounds(vertices)
  if (bounds.width === 0 || bounds.height === 0) return vertices
  
  const scaleX = targetWidth / bounds.width
  const scaleY = targetHeight / bounds.height
  
  return vertices.map(v => ({
    x: (v.x - bounds.minX) * scaleX,
    y: (v.y - bounds.minY) * scaleY
  }))
}

/**
 * Validate if vertices form a valid polygon
 */
export function validatePolygon(vertices: Vertex[]): { valid: boolean; error?: string } {
  if (vertices.length < 3) {
    return { valid: false, error: 'A polygon must have at least 3 vertices' }
  }
  
  // Check for duplicate consecutive vertices
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length
    if (vertices[i].x === vertices[j].x && vertices[i].y === vertices[j].y) {
      return { valid: false, error: 'Polygon contains duplicate consecutive vertices' }
    }
  }
  
  // Check for self-intersection (simplified check)
  // A more robust implementation would check all edge pairs
  const area = calculatePolygonArea(vertices)
  if (area < 0.1) {
    return { valid: false, error: 'Polygon area is too small' }
  }
  
  return { valid: true }
}

/**
 * Generate a grid of points within a polygon for PPFD calculations
 */
export function generatePolygonGrid(
  vertices: Vertex[],
  gridResolution: number = 20
): { x: number; y: number; inside: boolean }[] {
  const bounds = calculatePolygonBounds(vertices)
  const grid: { x: number; y: number; inside: boolean }[] = []
  
  const stepX = bounds.width / gridResolution
  const stepY = bounds.height / gridResolution
  
  for (let i = 0; i <= gridResolution; i++) {
    for (let j = 0; j <= gridResolution; j++) {
      const x = bounds.minX + i * stepX
      const y = bounds.minY + j * stepY
      const inside = isPointInPolygon({ x, y }, vertices)
      
      grid.push({ x, y, inside })
    }
  }
  
  return grid
}

/**
 * Convert percentage-based vertices to actual coordinates
 */
export function percentageToActual(
  vertices: Vertex[],
  roomWidth: number,
  roomHeight: number
): Vertex[] {
  return vertices.map(v => ({
    x: (v.x / 100) * roomWidth,
    y: (v.y / 100) * roomHeight
  }))
}

/**
 * Convert actual coordinates to percentage-based
 */
export function actualToPercentage(
  vertices: Vertex[],
  roomWidth: number,
  roomHeight: number
): Vertex[] {
  return vertices.map(v => ({
    x: (v.x / roomWidth) * 100,
    y: (v.y / roomHeight) * 100
  }))
}