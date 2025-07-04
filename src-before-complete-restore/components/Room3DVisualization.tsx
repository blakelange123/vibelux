'use client'

import { useRef, useEffect } from 'react'
import { Room, Fixture } from '@/lib/design-utils'

interface Room3DVisualizationProps {
  room: Room
  fixtures: Fixture[]
}

export default function Room3DVisualization({ room, fixtures }: Room3DVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, 800, 600)

    // Isometric projection parameters
    const scale = 40
    const offsetX = 200
    const offsetY = 150

    // Helper function for isometric projection
    const project = (x: number, y: number, z: number) => ({
      x: offsetX + (x - y) * Math.cos(Math.PI / 6) * scale,
      y: offsetY + (x + y) * Math.sin(Math.PI / 6) * scale - z * scale
    })

    // Draw room
    const corners = [
      project(0, 0, 0),           // bottom front left
      project(room.width, 0, 0),  // bottom front right
      project(room.width, room.length, 0), // bottom back right
      project(0, room.length, 0), // bottom back left
      project(0, 0, room.height), // top front left
      project(room.width, 0, room.height), // top front right
      project(room.width, room.length, room.height), // top back right
      project(0, room.length, room.height) // top back left
    ]

    // Draw floor
    ctx.fillStyle = '#F3F4F6'
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    ctx.lineTo(corners[1].x, corners[1].y)
    ctx.lineTo(corners[2].x, corners[2].y)
    ctx.lineTo(corners[3].x, corners[3].y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw walls
    // Front wall
    ctx.fillStyle = '#E5E7EB'
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    ctx.lineTo(corners[1].x, corners[1].y)
    ctx.lineTo(corners[5].x, corners[5].y)
    ctx.lineTo(corners[4].x, corners[4].y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Left wall
    ctx.fillStyle = '#D1D5DB'
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    ctx.lineTo(corners[3].x, corners[3].y)
    ctx.lineTo(corners[7].x, corners[7].y)
    ctx.lineTo(corners[4].x, corners[4].y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Ceiling (if visible)
    ctx.fillStyle = '#F9FAFB'
    ctx.beginPath()
    ctx.moveTo(corners[4].x, corners[4].y)
    ctx.lineTo(corners[5].x, corners[5].y)
    ctx.lineTo(corners[6].x, corners[6].y)
    ctx.lineTo(corners[7].x, corners[7].y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw fixtures
    fixtures.forEach(fixture => {
      const fixtureHeight = room.height - 0.3 // Mounted 0.3m from ceiling
      const center = project(fixture.x, fixture.y, fixtureHeight)
      
      // Fixture body
      const width = fixture.width * scale * 0.5
      const length = fixture.length * scale * 0.5
      
      ctx.fillStyle = '#1F2937'
      ctx.fillRect(center.x - width/2, center.y - length/2, width, length)
      
      // Light cone
      const coneRadius = 60
      const gradient = ctx.createRadialGradient(
        center.x, center.y, 0,
        center.x, center.y, coneRadius
      )
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.05)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(center.x, center.y, coneRadius, 0, 2 * Math.PI)
      ctx.fill()
      
      // Fixture label
      ctx.fillStyle = '#374151'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${fixture.wattage}W`, center.x, center.y - 15)
    })

    // Draw coordinate system
    ctx.strokeStyle = '#EF4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 550)
    ctx.lineTo(100, 550)
    ctx.stroke()
    
    ctx.strokeStyle = '#10B981'
    ctx.beginPath()
    ctx.moveTo(50, 550)
    ctx.lineTo(25, 525)
    ctx.stroke()
    
    ctx.strokeStyle = '#3B82F6'
    ctx.beginPath()
    ctx.moveTo(50, 550)
    ctx.lineTo(50, 500)
    ctx.stroke()
    
    ctx.fillStyle = '#374151'
    ctx.font = '12px Arial'
    ctx.fillText('X', 105, 555)
    ctx.fillText('Y', 20, 520)
    ctx.fillText('Z', 55, 495)

    // Add dimensions
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    const midX = (corners[0].x + corners[1].x) / 2
    const midY = (corners[0].x + corners[3].x) / 2
    ctx.fillText(`${room.width}m`, midX, corners[0].y + 20)
    ctx.fillText(`${room.length}m`, midY - 40, (corners[0].y + corners[3].y) / 2)

  }, [room, fixtures])

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">3D Room Visualization</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-200 rounded"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Room:</span> {room.width}m × {room.length}m × {room.height}m
        </div>
        <div>
          <span className="font-medium">Area:</span> {room.area}m²
        </div>
        <div>
          <span className="font-medium">Volume:</span> {Math.round(room.area * room.height)}m³
        </div>
        <div>
          <span className="font-medium">Fixtures:</span> {fixtures.length}
        </div>
      </div>
    </div>
  )
}