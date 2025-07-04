'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Move,
  Square,
  Circle,
  Lightbulb,
  Trash2,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Save,
  Download,
  ChevronUp
} from 'lucide-react'
import { useMobile } from '@/hooks/useMobile'

interface MobileDesignerProps {
  projectId?: string
}

export function MobileDesigner({ projectId }: MobileDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { viewport, orientation } = useMobile()
  
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showToolbar, setShowToolbar] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  
  // Handle canvas setup and rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Set canvas size
    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    // Clear canvas
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height)
    }

    // Draw room outline
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoom, zoom)
    
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, 300, 200)
    
    // Draw sample fixtures
    ctx.fillStyle = '#FBBF24'
    ctx.fillRect(100, 100, 30, 30)
    ctx.fillRect(200, 100, 30, 30)
    ctx.fillRect(150, 150, 30, 30)
    
    ctx.restore()
  }, [zoom, panOffset, showGrid, viewport])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#1F2937'
    ctx.lineWidth = 0.5
    
    const gridSize = 20 * zoom
    const offsetX = panOffset.x % gridSize
    const offsetY = panOffset.y % gridSize
    
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setTouchStart({ x: touch.clientX, y: touch.clientY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart && e.touches.length === 1) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      
      if (selectedTool === 'pan') {
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }))
        setTouchStart({ x: touch.clientX, y: touch.clientY })
      }
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
  }

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))
  const handleZoomReset = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const tools = [
    { id: 'select', icon: Move, label: 'Select' },
    { id: 'pan', icon: Move, label: 'Pan' },
    { id: 'fixture', icon: Lightbulb, label: 'Fixture' },
    { id: 'rectangle', icon: Square, label: 'Wall' },
    { id: 'delete', icon: Trash2, label: 'Delete' }
  ]

  return (
    <div className="relative h-full bg-gray-950">
      {/* Canvas Container */}
      <div ref={containerRef} className="relative h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          {/* Zoom Controls */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-800/90 backdrop-blur rounded-lg text-white"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-3 py-2 bg-gray-800/90 backdrop-blur rounded-lg text-white text-sm"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-800/90 backdrop-blur rounded-lg text-white"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          
          {/* Right Controls */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 backdrop-blur rounded-lg ${
                showGrid ? 'bg-purple-600' : 'bg-gray-800/90'
              } text-white`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-800/90 backdrop-blur rounded-lg text-white">
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Bottom Toolbar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
          {/* Toolbar Toggle */}
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className="w-full py-2 flex items-center justify-center gap-2 text-gray-400"
          >
            <ChevronUp className={`w-4 h-4 transition-transform ${showToolbar ? 'rotate-180' : ''}`} />
            <span className="text-sm">Tools</span>
          </button>
          
          {/* Expanded Toolbar */}
          {showToolbar && (
            <div className="px-4 pb-4">
              <div className="flex justify-around">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                      selectedTool === tool.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="text-xs">{tool.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Quick Info */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-gray-500">Fixtures</p>
                  <p className="text-white font-medium">3</p>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-gray-500">Avg PPFD</p>
                  <p className="text-white font-medium">650</p>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-gray-500">Power</p>
                  <p className="text-white font-medium">1.8kW</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Floating Action Button */}
        <button className="absolute bottom-24 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center text-white">
          <Lightbulb className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

// Mobile Designer Wrapper with proper layout
export function MobileDesignerWrapper() {
  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-white">Lighting Designer</h1>
        <p className="text-xs text-gray-400">Mobile Edition</p>
      </div>
      
      {/* Designer Canvas */}
      <div className="flex-1 overflow-hidden">
        <MobileDesigner />
      </div>
    </div>
  )
}