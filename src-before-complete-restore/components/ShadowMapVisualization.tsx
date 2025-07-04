"use client"

import { useEffect, useRef } from 'react'

interface ShadowPoint {
  x: number
  y: number
  intensity: number // 0-1, where 0 is full shadow
}

interface Obstruction {
  id: string
  position: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  color: string
  visible: boolean
}

interface ShadowMapVisualizationProps {
  width: number
  height: number
  shadowMap: ShadowPoint[]
  obstructions: Obstruction[]
  showObstructions: boolean
  highlightSevere: boolean
  viewMode: 'top' | 'side' | '3d'
  roomDimensions: { width: number; height: number; depth: number }
}

export default function ShadowMapVisualization({
  width,
  height,
  shadowMap,
  obstructions,
  showObstructions,
  highlightSevere,
  viewMode,
  roomDimensions
}: ShadowMapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Scale factors
    const scaleX = width / roomDimensions.width
    const scaleY = height / roomDimensions.height

    if (viewMode === 'top') {
      // Draw shadow map
      if (shadowMap.length > 0) {
        // Create a grid-based visualization
        const gridSize = Math.sqrt(shadowMap.length)
        const cellWidth = width / gridSize
        const cellHeight = height / gridSize

        shadowMap.forEach((point, index) => {
          const gridX = index % gridSize
          const gridY = Math.floor(index / gridSize)
          const x = gridX * cellWidth
          const y = gridY * cellHeight

          if (highlightSevere && point.intensity < 0.5) {
            // Highlight severe shadows in red
            const opacity = 1 - point.intensity
            ctx.fillStyle = `rgba(239, 68, 68, ${opacity * 0.8})`
          } else {
            // Normal shadow visualization
            const grayValue = Math.floor(point.intensity * 255)
            ctx.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, 0.7)`
          }

          ctx.fillRect(x, y, cellWidth, cellHeight)
        })
      }

      // Draw obstructions
      if (showObstructions) {
        obstructions.forEach(obs => {
          if (!obs.visible) return

          const x = (obs.position.x - obs.dimensions.width / 2) * scaleX
          const y = (obs.position.y - obs.dimensions.depth / 2) * scaleY
          const w = obs.dimensions.width * scaleX
          const h = obs.dimensions.depth * scaleY

          // Draw obstruction
          ctx.fillStyle = obs.color + '80' // Add transparency
          ctx.fillRect(x, y, w, h)
          
          // Draw border
          ctx.strokeStyle = obs.color
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, w, h)
        })
      }
    } else if (viewMode === 'side') {
      // Side view visualization
      const scaleZ = height / roomDimensions.depth

      // Draw obstructions from side
      if (showObstructions) {
        obstructions.forEach(obs => {
          if (!obs.visible) return

          const x = (obs.position.x - obs.dimensions.width / 2) * scaleX
          const y = height - ((obs.position.z + obs.dimensions.height / 2) * scaleZ)
          const w = obs.dimensions.width * scaleX
          const h = obs.dimensions.height * scaleZ

          // Draw obstruction
          ctx.fillStyle = obs.color + '80'
          ctx.fillRect(x, y, w, h)
          
          // Draw border
          ctx.strokeStyle = obs.color
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, w, h)
        })
      }

      // Draw canopy level line
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      const canopyY = height - (roomDimensions.depth * 0.3 * scaleZ) // Assuming canopy at 30% height
      ctx.beginPath()
      ctx.moveTo(0, canopyY)
      ctx.lineTo(width, canopyY)
      ctx.stroke()
      ctx.setLineDash([])

      // Label
      ctx.fillStyle = '#10B981'
      ctx.font = '12px sans-serif'
      ctx.fillText('Canopy Level', 10, canopyY - 5)
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)'
    ctx.lineWidth = 1
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Add scale indicators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '10px sans-serif'
    ctx.fillText(`${roomDimensions.width}ft`, width - 30, height - 5)
    ctx.fillText(`${viewMode === 'top' ? roomDimensions.height : roomDimensions.depth}ft`, 5, 15)

  }, [shadowMap, obstructions, showObstructions, highlightSevere, viewMode, width, height, roomDimensions])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-gray-700"
      style={{ background: 'linear-gradient(to br, #1f2937, #111827)' }}
    />
  )
}