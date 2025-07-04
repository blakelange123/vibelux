"use client"

import { useEffect, useRef } from 'react'

interface CoverageVisualizationProps {
  roomWidth: number
  roomLength: number
  fixtures: Array<{ x: number; y: number }>
  coverageRadius: number
  mountingHeight: number
  targetPPFD: number
  actualPPFD: number
}

export function CoverageVisualization({
  roomWidth,
  roomLength,
  fixtures,
  coverageRadius,
  mountingHeight,
  targetPPFD,
  actualPPFD
}: CoverageVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const scale = Math.min(600 / roomWidth, 400 / roomLength)
    canvas.width = roomWidth * scale
    canvas.height = roomLength * scale
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Create PPFD heatmap
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data
    
    // Calculate PPFD at each pixel
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        // Convert pixel to room coordinates
        const roomX = x / scale
        const roomY = y / scale
        
        // Calculate total PPFD at this point
        let totalPPFD = 0
        
        fixtures.forEach(fixture => {
          const distance = Math.sqrt(
            Math.pow(roomX - fixture.x, 2) + 
            Math.pow(roomY - fixture.y, 2)
          )
          
          // Simple inverse square law with beam angle consideration
          const horizontalDistance = distance
          const totalDistance = Math.sqrt(
            Math.pow(horizontalDistance, 2) + 
            Math.pow(mountingHeight, 2)
          )
          
          // PPFD falls off with distance
          const fixturePPFD = actualPPFD * Math.pow(mountingHeight / totalDistance, 2)
          
          // Apply beam angle cutoff
          const angle = Math.atan(horizontalDistance / mountingHeight) * 180 / Math.PI
          const beamAngle = 120 // degrees
          
          if (angle <= beamAngle / 2) {
            // Cosine correction for angle
            const cosineCorrection = Math.cos(angle * Math.PI / 180)
            totalPPFD += fixturePPFD * cosineCorrection
          }
        })
        
        // Convert PPFD to color
        const intensity = Math.min(totalPPFD / targetPPFD, 2) // Cap at 2x target
        
        // Color gradient: Blue (low) -> Green (optimal) -> Yellow -> Red (high)
        let r, g, b
        
        if (intensity < 0.5) {
          // Blue to Cyan
          r = 0
          g = intensity * 2 * 255
          b = 255
        } else if (intensity < 1) {
          // Cyan to Green
          r = 0
          g = 255
          b = (1 - (intensity - 0.5) * 2) * 255
        } else if (intensity < 1.5) {
          // Green to Yellow
          r = (intensity - 1) * 2 * 255
          g = 255
          b = 0
        } else {
          // Yellow to Red
          r = 255
          g = (1 - (intensity - 1.5) * 2) * 255
          b = 0
        }
        
        // Set pixel
        const idx = (y * canvas.width + x) * 4
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
        data[idx + 3] = 200 // Slightly transparent
      }
    }
    
    // Apply gaussian blur for smoother visualization
    ctx.putImageData(imageData, 0, 0)
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    
    // Draw 1-foot grid
    for (let x = 0; x <= roomWidth; x++) {
      ctx.beginPath()
      ctx.moveTo(x * scale, 0)
      ctx.lineTo(x * scale, canvas.height)
      ctx.stroke()
    }
    
    for (let y = 0; y <= roomLength; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * scale)
      ctx.lineTo(canvas.width, y * scale)
      ctx.stroke()
    }
    
    // Draw fixtures
    fixtures.forEach(fixture => {
      const x = fixture.x * scale
      const y = fixture.y * scale
      
      // Fixture body
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(x - 10, y - 5, 20, 10)
      
      // Light cone
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, coverageRadius * scale, 0, 2 * Math.PI)
      ctx.stroke()
      
      // Center point
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
    
    // Draw room outline
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    // Add scale
    ctx.fillStyle = '#fff'
    ctx.font = '12px sans-serif'
    ctx.fillText(`${roomWidth}' × ${roomLength}'`, 10, canvas.height - 10)
    
  }, [roomWidth, roomLength, fixtures, coverageRadius, mountingHeight, targetPPFD, actualPPFD])
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-auto max-w-full rounded-lg shadow-2xl"
        style={{ imageRendering: 'auto' }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur rounded-lg p-3">
        <h4 className="text-xs font-semibold text-white mb-2">PPFD Intensity</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-xs text-gray-300">&lt;50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-xs text-gray-300">90-110%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-xs text-gray-300">110-150%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-xs text-gray-300">&gt;150%</span>
          </div>
        </div>
      </div>
    </div>
  )
}