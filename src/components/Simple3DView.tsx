"use client"

import { useEffect, useRef } from 'react'
import { Camera, RotateCw, ZoomIn, ZoomOut, Move3D } from 'lucide-react'

interface Simple3DViewProps {
  roomDimensions: { width: number; height: number; depth: number }
  fixtures: Array<{
    id: string
    x: number // percentage
    y: number // percentage
    z: number // height
    enabled: boolean
  }>
  onClose?: () => void
}

export function Simple3DView({ roomDimensions, fixtures, onClose }: Simple3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef({ x: -30, y: 45 })
  const zoomRef = useRef(1)
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  // Convert room dimensions to pixels for 3D view
  const scale = 40 // pixels per foot
  const room = {
    width: roomDimensions.width * scale,
    height: roomDimensions.height * scale,
    depth: roomDimensions.depth * scale
  }

  // Simple 3D to 2D projection
  const project3D = (x: number, y: number, z: number) => {
    const centerX = 400
    const centerY = 300
    
    // Apply rotation
    const cosX = Math.cos(rotationRef.current.x * Math.PI / 180)
    const sinX = Math.sin(rotationRef.current.x * Math.PI / 180)
    const cosY = Math.cos(rotationRef.current.y * Math.PI / 180)
    const sinY = Math.sin(rotationRef.current.y * Math.PI / 180)
    
    // Rotate around Y axis
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY
    
    // Rotate around X axis
    const y1 = y * cosX - z1 * sinX
    const z2 = y * sinX + z1 * cosX
    
    // Simple perspective projection
    const perspective = 800 / (800 + z2)
    const projX = centerX + x1 * perspective * zoomRef.current
    const projY = centerY + y1 * perspective * zoomRef.current
    
    return { x: projX, y: projY, scale: perspective }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, 800, 600)
    
    // Draw grid
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    
    // Floor grid
    const gridSize = scale
    for (let x = 0; x <= room.width; x += gridSize) {
      const start = project3D(x - room.width/2, room.height/2, -room.depth/2)
      const end = project3D(x - room.width/2, room.height/2, room.depth/2)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
    
    for (let z = 0; z <= room.depth; z += gridSize) {
      const start = project3D(-room.width/2, room.height/2, z - room.depth/2)
      const end = project3D(room.width/2, room.height/2, z - room.depth/2)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
    
    // Draw room outline
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 2
    
    // Floor
    const corners = [
      project3D(-room.width/2, room.height/2, -room.depth/2),
      project3D(room.width/2, room.height/2, -room.depth/2),
      project3D(room.width/2, room.height/2, room.depth/2),
      project3D(-room.width/2, room.height/2, room.depth/2)
    ]
    
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    corners.forEach(corner => ctx.lineTo(corner.x, corner.y))
    ctx.closePath()
    ctx.stroke()
    
    // Walls
    for (let i = 0; i < 4; i++) {
      const bottom = corners[i]
      const top = project3D(
        i === 0 || i === 3 ? -room.width/2 : room.width/2,
        -room.height/2,
        i < 2 ? -room.depth/2 : room.depth/2
      )
      ctx.beginPath()
      ctx.moveTo(bottom.x, bottom.y)
      ctx.lineTo(top.x, top.y)
      ctx.stroke()
    }
    
    // Draw fixtures
    fixtures.forEach(fixture => {
      if (!fixture.enabled) return
      
      const x = (fixture.x / 100) * room.width - room.width/2
      const y = (fixture.y / 100) * room.depth - room.depth/2
      const z = -room.height/2 + fixture.z * scale
      
      const pos = project3D(x, z, y)
      
      // Draw fixture
      ctx.fillStyle = '#FDE047'
      ctx.strokeStyle = '#CA8A04'
      ctx.lineWidth = 2
      
      const size = 20 * pos.scale * zoomRef.current
      ctx.beginPath()
      ctx.rect(pos.x - size/2, pos.y - size/2, size, size)
      ctx.fill()
      ctx.stroke()
      
      // Draw light cone
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      
      const bottomPos = project3D(x, room.height/2, y)
      const coneRadius = 60 * bottomPos.scale * zoomRef.current
      
      ctx.lineTo(bottomPos.x - coneRadius, bottomPos.y)
      ctx.lineTo(bottomPos.x + coneRadius, bottomPos.y)
      ctx.closePath()
      ctx.stroke()
      
      // Fill light area
      ctx.fillStyle = 'rgba(253, 224, 71, 0.1)'
      ctx.fill()
    })
    
    // Draw labels
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px sans-serif'
    ctx.fillText(`${roomDimensions.width}' x ${roomDimensions.height}' x ${roomDimensions.depth}'`, 10, 20)
    ctx.fillText(`Fixtures: ${fixtures.filter(f => f.enabled).length}`, 10, 40)
  }

  useEffect(() => {
    draw()
  }, [roomDimensions, fixtures, rotationRef.current.x, rotationRef.current.y, zoomRef.current])

  // Mouse controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    
    const deltaX = e.clientX - lastMouseRef.current.x
    const deltaY = e.clientY - lastMouseRef.current.y
    
    rotationRef.current.y += deltaX * 0.5
    rotationRef.current.x += deltaY * 0.5
    
    // Clamp rotation
    rotationRef.current.x = Math.max(-89, Math.min(89, rotationRef.current.x))
    
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
    draw()
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoomRef.current *= e.deltaY < 0 ? 1.1 : 0.9
    zoomRef.current = Math.max(0.5, Math.min(3, zoomRef.current))
    draw()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Move3D className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">3D Room View</h3>
              <p className="text-sm text-gray-400">Drag to rotate, scroll to zoom</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => {
                zoomRef.current = Math.min(3, zoomRef.current * 1.2)
                draw()
              }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all"
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => {
                zoomRef.current = Math.max(0.5, zoomRef.current * 0.8)
                draw()
              }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all"
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => {
                rotationRef.current = { x: -30, y: 45 }
                zoomRef.current = 1
                draw()
              }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all"
            >
              <RotateCw className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur rounded-lg p-3 text-xs text-gray-400">
            <p>🖱️ Drag to rotate</p>
            <p>🔍 Scroll to zoom</p>
            <p>🎯 Click fixtures in 2D view</p>
          </div>
        </div>
      </div>
    </div>
  )
}