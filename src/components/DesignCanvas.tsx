'use client'

import { useRef, useEffect, useState } from 'react'
import { Room, Fixture, analyzeDesign } from '@/lib/design-utils'

interface DesignCanvasProps {
  room: Room
  fixtures: Fixture[]
  onFixtureMove?: (fixtureId: string, x: number, y: number) => void
}

export default function DesignCanvas({ room, fixtures, onFixtureMove }: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draggedFixture, setDraggedFixture] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const scale = Math.min(600 / room.width, 400 / room.length)
  const canvasWidth = room.width * scale
  const canvasHeight = room.length * scale

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Draw room outline
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    const gridSize = 1 * scale // 1m grid
    
    for (let x = gridSize; x < canvasWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }
    
    for (let y = gridSize; y < canvasHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    // Draw PPFD heatmap (simplified)
    const analysis = analyzeDesign(room, fixtures)
    
    // Draw fixtures
    fixtures.forEach(fixture => {
      const x = fixture.x * scale
      const y = fixture.y * scale
      const width = fixture.width * scale
      const height = fixture.length * scale

      // Fixture body
      ctx.fillStyle = draggedFixture === fixture.id ? '#3B82F6' : '#1F2937'
      ctx.fillRect(x - width/2, y - height/2, width, height)

      // Light coverage circle
      ctx.beginPath()
      ctx.arc(x, y, 30, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.stroke()

      // Fixture label
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${fixture.wattage}W`, x, y + 3)
    })

    // Draw dimensions
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${room.width}m`, canvasWidth / 2, canvasHeight + 20)
    
    ctx.save()
    ctx.translate(15, canvasHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`${room.length}m`, 0, 0)
    ctx.restore()

  }, [room, fixtures, draggedFixture, canvasWidth, canvasHeight, scale])

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePosition(e)
    
    // Find clicked fixture
    const clickedFixture = fixtures.find(fixture => {
      const dx = Math.abs(pos.x - fixture.x)
      const dy = Math.abs(pos.y - fixture.y)
      return dx < fixture.width/2 && dy < fixture.length/2
    })

    if (clickedFixture) {
      setDraggedFixture(clickedFixture.id)
      setMousePos(pos)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePosition(e)
    setMousePos(pos)

    if (draggedFixture && onFixtureMove) {
      onFixtureMove(draggedFixture, pos.x, pos.y)
    }
  }

  const handleMouseUp = () => {
    setDraggedFixture(null)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-gray-300 rounded cursor-crosshair"
        style={{ width: canvasWidth, height: canvasHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Fixtures:</span> {fixtures.length}
        </div>
        <div>
          <span className="font-medium">Total Power:</span> {fixtures.reduce((sum, f) => sum + f.wattage, 0)}W
        </div>
      </div>
    </div>
  )
}