'use client'

import { useRef, useEffect } from 'react'
import { Vertex, isPointInPolygon, calculatePolygonBounds } from '@/lib/polygon-utils'

interface PolygonHeatMapCanvasProps {
  grid: { position: { x: number; y: number }; ppfd: number }[]
  vertices: Vertex[]
  width: number
  height: number
  minPPFD: number
  maxPPFD: number
  colorScale: 'viridis' | 'heat' | 'grayscale'
}

export function PolygonHeatMapCanvas({
  grid,
  vertices,
  width,
  height,
  minPPFD,
  maxPPFD,
  colorScale
}: PolygonHeatMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Color scale functions
  const getColor = (value: number) => {
    const normalized = Math.max(0, Math.min(1, (value - minPPFD) / (maxPPFD - minPPFD)))
    
    switch (colorScale) {
      case 'viridis':
        return viridisScale(normalized)
      case 'heat':
        return heatScale(normalized)
      case 'grayscale':
        return grayscaleScale(normalized)
      default:
        return viridisScale(normalized)
    }
  }

  const viridisScale = (t: number) => {
    const colors = [
      [68, 1, 84],    // 0.0 - dark purple
      [71, 44, 122],  // 0.2
      [59, 81, 139],  // 0.4
      [44, 113, 142], // 0.6
      [33, 144, 141], // 0.8
      [39, 173, 129], // 1.0
      [92, 200, 99],  // 1.2
      [253, 231, 37]  // 1.0 - bright yellow
    ]
    
    const index = t * (colors.length - 1)
    const i = Math.floor(index)
    const f = index - i
    
    if (i >= colors.length - 1) {
      return `rgb(${colors[colors.length - 1].join(',')})`
    }
    
    const c1 = colors[i]
    const c2 = colors[i + 1]
    
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * f)
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * f)
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * f)
    
    return `rgb(${r},${g},${b})`
  }

  const heatScale = (t: number) => {
    if (t < 0.25) {
      return `rgb(0,0,${Math.round(t * 4 * 255)})`
    } else if (t < 0.5) {
      return `rgb(0,${Math.round((t - 0.25) * 4 * 255)},255)`
    } else if (t < 0.75) {
      return `rgb(${Math.round((t - 0.5) * 4 * 255)},255,${Math.round(255 - (t - 0.5) * 4 * 255)})`
    } else {
      return `rgb(255,${Math.round(255 - (t - 0.75) * 4 * 255)},0)`
    }
  }

  const grayscaleScale = (t: number) => {
    const value = Math.round(t * 255)
    return `rgb(${value},${value},${value})`
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || grid.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Get polygon bounds
    const bounds = calculatePolygonBounds(vertices)
    const scaleX = width / bounds.width
    const scaleY = height / bounds.height

    // Create clipping path for polygon
    ctx.save()
    ctx.beginPath()
    vertices.forEach((vertex, index) => {
      const x = (vertex.x - bounds.minX) * scaleX
      const y = (vertex.y - bounds.minY) * scaleY
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.clip()

    // Create image data for heat map
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Calculate cell size based on grid density
    const gridBounds = {
      minX: Math.min(...grid.map(p => p.position.x)),
      maxX: Math.max(...grid.map(p => p.position.x)),
      minY: Math.min(...grid.map(p => p.position.y)),
      maxY: Math.max(...grid.map(p => p.position.y))
    }

    // Interpolate PPFD values for each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Convert pixel to room coordinates
        const roomX = bounds.minX + (x / width) * bounds.width
        const roomY = bounds.minY + (y / height) * bounds.height
        
        // Check if pixel is inside polygon
        if (isPointInPolygon({ x: roomX, y: roomY }, vertices)) {
          // Find nearest grid points for interpolation
          let totalWeight = 0
          let weightedPPFD = 0
          
          grid.forEach(point => {
            const dx = roomX - point.position.x
            const dy = roomY - point.position.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            // Use inverse distance weighting
            if (distance < 0.01) {
              weightedPPFD = point.ppfd
              totalWeight = 1
              return
            }
            
            const weight = 1 / (distance * distance)
            weightedPPFD += point.ppfd * weight
            totalWeight += weight
          })
          
          const ppfd = totalWeight > 0 ? weightedPPFD / totalWeight : 0
          const color = getColor(ppfd)
          const rgb = color.match(/\d+/g)
          
          if (rgb) {
            const index = (y * width + x) * 4
            data[index] = parseInt(rgb[0])     // R
            data[index + 1] = parseInt(rgb[1]) // G
            data[index + 2] = parseInt(rgb[2]) // B
            data[index + 3] = 255               // A
          }
        }
      }
    }

    // Put image data on canvas
    ctx.putImageData(imageData, 0, 0)

    // Draw polygon outline
    ctx.restore()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    vertices.forEach((vertex, index) => {
      const x = (vertex.x - bounds.minX) * scaleX
      const y = (vertex.y - bounds.minY) * scaleY
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Draw scale legend
    const legendWidth = 40
    const legendHeight = 200
    const legendX = width - legendWidth - 20
    const legendY = 20

    // Legend background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(legendX - 10, legendY - 10, legendWidth + 20, legendHeight + 40)

    // Legend gradient
    for (let i = 0; i < legendHeight; i++) {
      const value = maxPPFD - (i / legendHeight) * (maxPPFD - minPPFD)
      ctx.fillStyle = getColor(value)
      ctx.fillRect(legendX, legendY + i, legendWidth, 1)
    }

    // Legend border
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight)

    // Legend labels
    ctx.fillStyle = 'white'
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    
    // Top label (max)
    ctx.fillText(`${maxPPFD}`, legendX - 5, legendY)
    
    // Middle labels
    const steps = 4
    for (let i = 1; i < steps; i++) {
      const value = maxPPFD - (i / steps) * (maxPPFD - minPPFD)
      const y = legendY + (i / steps) * legendHeight
      ctx.fillText(`${Math.round(value)}`, legendX - 5, y)
    }
    
    // Bottom label (min)
    ctx.fillText(`${minPPFD}`, legendX - 5, legendY + legendHeight)
    
    // Unit label
    ctx.textAlign = 'center'
    ctx.fillText('μmol/m²/s', legendX + legendWidth / 2, legendY + legendHeight + 20)

  }, [grid, vertices, width, height, minPPFD, maxPPFD, colorScale])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0"
      style={{ imageRendering: 'auto' }}
    />
  )
}