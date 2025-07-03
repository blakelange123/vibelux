'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Move, Save, AlertCircle, Shapes, Square } from 'lucide-react'
import {
  Vertex,
  calculatePolygonArea,
  calculatePolygonBounds,
  getPredefinedShapes,
  validatePolygon,
  isPointInPolygon
} from '@/lib/polygon-utils'

interface PolygonRoomEditorProps {
  vertices: Vertex[]
  onVerticesChange: (vertices: Vertex[]) => void
  roomWidth: number
  roomHeight: number
  onShapeTypeChange: (shapeType: 'rectangle' | 'polygon') => void
  currentShapeType: 'rectangle' | 'polygon'
}

export function PolygonRoomEditor({
  vertices,
  onVerticesChange,
  roomWidth,
  roomHeight,
  onShapeTypeChange,
  currentShapeType
}: PolygonRoomEditorProps) {
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(0.5) // 0.5 ft grid
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 })
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null)
  const [predefinedShape, setPredefinedShape] = useState<string>('custom')

  // Calculate scale for canvas display
  const scale = Math.min(canvasSize.width / roomWidth, canvasSize.height / roomHeight) * 0.9
  const offsetX = (canvasSize.width - roomWidth * scale) / 2
  const offsetY = (canvasSize.height - roomHeight * scale) / 2

  // Convert room coordinates to canvas coordinates
  const toCanvasCoords = (vertex: Vertex) => ({
    x: vertex.x * scale + offsetX,
    y: vertex.y * scale + offsetY
  })

  // Convert canvas coordinates to room coordinates
  const toRoomCoords = (x: number, y: number): Vertex => {
    let roomX = (x - offsetX) / scale
    let roomY = (y - offsetY) / scale

    // Snap to grid if enabled
    if (snapToGrid) {
      roomX = Math.round(roomX / gridSize) * gridSize
      roomY = Math.round(roomY / gridSize) * gridSize
    }

    // Clamp to room bounds
    roomX = Math.max(0, Math.min(roomWidth, roomX))
    roomY = Math.max(0, Math.min(roomHeight, roomY))

    return { x: roomX, y: roomY }
  }

  // Draw the polygon and UI on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw room bounds
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 2
    ctx.strokeRect(offsetX, offsetY, roomWidth * scale, roomHeight * scale)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])

      // Vertical lines
      for (let x = 0; x <= roomWidth; x += gridSize) {
        const canvasX = x * scale + offsetX
        ctx.beginPath()
        ctx.moveTo(canvasX, offsetY)
        ctx.lineTo(canvasX, offsetY + roomHeight * scale)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= roomHeight; y += gridSize) {
        const canvasY = y * scale + offsetY
        ctx.beginPath()
        ctx.moveTo(offsetX, canvasY)
        ctx.lineTo(offsetX + roomWidth * scale, canvasY)
        ctx.stroke()
      }

      ctx.setLineDash([])
    }

    // Draw polygon
    if (vertices.length > 0) {
      // Fill polygon
      ctx.fillStyle = validation.valid ? 'rgba(147, 51, 234, 0.1)' : 'rgba(239, 68, 68, 0.1)'
      ctx.beginPath()
      const firstVertex = toCanvasCoords(vertices[0])
      ctx.moveTo(firstVertex.x, firstVertex.y)
      for (let i = 1; i < vertices.length; i++) {
        const vertex = toCanvasCoords(vertices[i])
        ctx.lineTo(vertex.x, vertex.y)
      }
      ctx.closePath()
      ctx.fill()

      // Draw edges
      ctx.strokeStyle = validation.valid ? '#9333EA' : '#EF4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(firstVertex.x, firstVertex.y)
      for (let i = 1; i < vertices.length; i++) {
        const vertex = toCanvasCoords(vertices[i])
        ctx.lineTo(vertex.x, vertex.y)
      }
      ctx.closePath()
      ctx.stroke()

      // Draw vertices
      vertices.forEach((vertex, index) => {
        const canvasVertex = toCanvasCoords(vertex)
        
        // Vertex circle
        ctx.beginPath()
        ctx.arc(canvasVertex.x, canvasVertex.y, 6, 0, Math.PI * 2)
        
        if (index === selectedVertex) {
          ctx.fillStyle = '#7C3AED'
          ctx.strokeStyle = '#5B21B6'
        } else if (index === hoveredVertex) {
          ctx.fillStyle = '#A78BFA'
          ctx.strokeStyle = '#7C3AED'
        } else {
          ctx.fillStyle = '#9333EA'
          ctx.strokeStyle = '#7C3AED'
        }
        
        ctx.fill()
        ctx.stroke()

        // Vertex label
        ctx.fillStyle = '#FFF'
        ctx.font = '12px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((index + 1).toString(), canvasVertex.x, canvasVertex.y)
      })
    }

    // Draw measurements
    if (vertices.length >= 3) {
      const area = calculatePolygonArea(vertices)
      const bounds = calculatePolygonBounds(vertices)
      
      ctx.fillStyle = '#E5E7EB'
      ctx.font = '14px monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      
      const infoY = 10
      ctx.fillText(`Area: ${area.toFixed(1)} ft²`, 10, infoY)
      ctx.fillText(`Bounds: ${bounds.width.toFixed(1)} × ${bounds.height.toFixed(1)} ft`, 10, infoY + 20)
    }
  }, [vertices, canvasSize, roomWidth, roomHeight, scale, offsetX, offsetY, selectedVertex, hoveredVertex, showGrid, gridSize, validation])

  // Handle canvas mouse events
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on existing vertex
    for (let i = 0; i < vertices.length; i++) {
      const canvasVertex = toCanvasCoords(vertices[i])
      const distance = Math.sqrt(
        Math.pow(x - canvasVertex.x, 2) + Math.pow(y - canvasVertex.y, 2)
      )
      if (distance <= 8) {
        setSelectedVertex(i)
        return
      }
    }

    // Add new vertex if in polygon mode
    if (currentShapeType === 'polygon' && !isDragging) {
      const roomCoords = toRoomCoords(x, y)
      const newVertices = [...vertices, roomCoords]
      onVerticesChange(newVertices)
      setValidation(validatePolygon(newVertices))
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedVertex !== null) {
      setIsDragging(true)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check hover state
    let foundHover = false
    for (let i = 0; i < vertices.length; i++) {
      const canvasVertex = toCanvasCoords(vertices[i])
      const distance = Math.sqrt(
        Math.pow(x - canvasVertex.x, 2) + Math.pow(y - canvasVertex.y, 2)
      )
      if (distance <= 8) {
        setHoveredVertex(i)
        foundHover = true
        break
      }
    }
    if (!foundHover) setHoveredVertex(null)

    // Handle dragging
    if (isDragging && selectedVertex !== null) {
      const roomCoords = toRoomCoords(x, y)
      const newVertices = [...vertices]
      newVertices[selectedVertex] = roomCoords
      onVerticesChange(newVertices)
      setValidation(validatePolygon(newVertices))
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  // Delete selected vertex
  const deleteVertex = () => {
    if (selectedVertex !== null && vertices.length > 3) {
      const newVertices = vertices.filter((_, index) => index !== selectedVertex)
      onVerticesChange(newVertices)
      setValidation(validatePolygon(newVertices))
      setSelectedVertex(null)
    }
  }

  // Load predefined shape
  const loadPredefinedShape = (shapeName: string) => {
    const shapes = getPredefinedShapes()
    if (shapes[shapeName]) {
      // Scale shape to room dimensions
      const shapeVertices = shapes[shapeName].map(v => ({
        x: (v.x / 10) * roomWidth,
        y: (v.y / 10) * roomHeight
      }))
      onVerticesChange(shapeVertices)
      setValidation(validatePolygon(shapeVertices))
      setPredefinedShape(shapeName)
    }
  }

  // Clear all vertices
  const clearVertices = () => {
    onVerticesChange([])
    setSelectedVertex(null)
    setPredefinedShape('custom')
    setValidation({ valid: true })
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Shapes className="w-4 h-4" />
          Room Shape Editor
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onShapeTypeChange('rectangle')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              currentShapeType === 'rectangle'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Square className="w-3 h-3" />
            Rectangle
          </button>
          <button
            onClick={() => onShapeTypeChange('polygon')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              currentShapeType === 'polygon'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Shapes className="w-3 h-3" />
            Polygon
          </button>
        </div>
      </div>

      {currentShapeType === 'polygon' && (
        <>
          {/* Predefined shapes */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Predefined Shapes</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => loadPredefinedShape('l-shape')}
                className={`px-2 py-1 text-xs rounded ${
                  predefinedShape === 'l-shape'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                L-Shape
              </button>
              <button
                onClick={() => loadPredefinedShape('t-shape')}
                className={`px-2 py-1 text-xs rounded ${
                  predefinedShape === 't-shape'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                T-Shape
              </button>
              <button
                onClick={() => loadPredefinedShape('u-shape')}
                className={`px-2 py-1 text-xs rounded ${
                  predefinedShape === 'u-shape'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                U-Shape
              </button>
              <button
                onClick={() => loadPredefinedShape('hexagon')}
                className={`px-2 py-1 text-xs rounded ${
                  predefinedShape === 'hexagon'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Hexagon
              </button>
            </div>
          </div>

          {/* Canvas for drawing */}
          <div className="mb-3 bg-gray-900 rounded-lg p-2">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="w-full cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={() => setIsDragging(false)}
            />
          </div>

          {/* Validation message */}
          {!validation.valid && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-600/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{validation.error}</span>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                Show Grid
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                Snap to Grid
              </label>
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <span>Grid:</span>
                <input
                  type="number"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  min={0.25}
                  max={2}
                  step={0.25}
                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                />
                <span>ft</span>
              </div>
            </div>

            {/* Vertex list */}
            {vertices.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Vertices ({vertices.length})</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {vertices.map((vertex, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                        index === selectedVertex
                          ? 'bg-purple-600/20 border border-purple-500/50'
                          : 'bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedVertex(index)}
                    >
                      <span className="text-gray-300">
                        {index + 1}: ({vertex.x.toFixed(1)}, {vertex.y.toFixed(1)}) ft
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (vertices.length > 3) {
                            const newVertices = vertices.filter((_, i) => i !== index)
                            onVerticesChange(newVertices)
                            setValidation(validatePolygon(newVertices))
                            if (selectedVertex === index) setSelectedVertex(null)
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        disabled={vertices.length <= 3}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={clearVertices}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
              {selectedVertex !== null && vertices.length > 3 && (
                <button
                  onClick={deleteVertex}
                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Vertex
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-400 space-y-1 mt-3">
              <p>• Click to add vertices</p>
              <p>• Click and drag vertices to move them</p>
              <p>• Select a vertex and press Delete to remove it</p>
              <p>• Minimum 3 vertices required</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}