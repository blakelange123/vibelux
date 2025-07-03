'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DraggableFixture } from './DraggableFixture'
import { FalseColorPPFDMap } from './FalseColorPPFDMap'
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Grid, 
  Package,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react'

interface Fixture {
  id: string
  x: number // percentage
  y: number // percentage
  rotation: number
  model: {
    id: string
    brand: string
    model: string
    wattage: number
    ppf: number
    efficacy: number
    spectrumData: {
      red: number
      blue: number
      green: number
      farRed: number
    }
    coverage: number
  }
  enabled: boolean
}

interface DesignCanvasV2Props {
  selectedTool: string
  selectedFixtureModel?: any
  onFixtureAdd?: (fixture: Fixture) => void
  onFixtureUpdate?: (fixtures: Fixture[]) => void
}

export function DesignCanvasV2({ 
  selectedTool, 
  selectedFixtureModel,
  onFixtureAdd,
  onFixtureUpdate 
}: DesignCanvasV2Props) {
  const [roomDimensions, setRoomDimensions] = useState({ width: 10, height: 10 })
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [showPPFDMap, setShowPPFDMap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [ppfdData, setPpfdData] = useState<number[][]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasBounds, setCanvasBounds] = useState<DOMRect | null>(null)

  // Update canvas bounds
  useEffect(() => {
    const updateBounds = () => {
      if (canvasRef.current) {
        setCanvasBounds(canvasRef.current.getBoundingClientRect())
      }
    }
    
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  // Generate PPFD data based on fixtures
  useEffect(() => {
    const gridSize = 50
    const data: number[][] = []
    
    for (let y = 0; y < gridSize; y++) {
      const row: number[] = []
      for (let x = 0; x < gridSize; x++) {
        let value = 100 // Base ambient PPFD
        
        // Add contribution from each enabled fixture
        fixtures.filter(f => f.enabled).forEach(fixture => {
          const fx = (fixture.x / 100) * gridSize
          const fy = (fixture.y / 100) * gridSize
          const dx = x - fx
          const dy = y - fy
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Simple inverse square law with fixture PPF
          const contribution = (fixture.model.ppf / 100) * Math.exp(-distance * distance / 50)
          value += contribution
        })
        
        row.push(Math.min(1200, value))
      }
      data.push(row)
    }
    
    setPpfdData(data)
  }, [fixtures])

  // Handle canvas click for placing fixtures
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== 'place' || !canvasBounds) return
    
    const rect = canvasBounds
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Use selected fixture model or default
    const model = selectedFixtureModel || {
      id: 'default-led',
      brand: 'Generic',
      model: '600W LED',
      wattage: 600,
      ppf: 1600,
      efficacy: 2.67,
      spectrumData: {
        red: 65,
        blue: 20,
        green: 10,
        farRed: 5
      },
      coverage: 16
    }
    
    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      x,
      y,
      rotation: 0,
      model,
      enabled: true
    }
    
    const updatedFixtures = [...fixtures, newFixture]
    setFixtures(updatedFixtures)
    onFixtureAdd?.(newFixture)
    onFixtureUpdate?.(updatedFixtures)
  }, [selectedTool, canvasBounds, selectedFixtureModel, fixtures, onFixtureAdd, onFixtureUpdate])

  // Fixture manipulation handlers
  const handleFixtureMove = useCallback((id: string, x: number, y: number) => {
    const updatedFixtures = fixtures.map(f => 
      f.id === id ? { ...f, x, y } : f
    )
    setFixtures(updatedFixtures)
    onFixtureUpdate?.(updatedFixtures)
  }, [fixtures, onFixtureUpdate])

  const handleFixtureRotate = useCallback((id: string, rotation: number) => {
    const updatedFixtures = fixtures.map(f => 
      f.id === id ? { ...f, rotation } : f
    )
    setFixtures(updatedFixtures)
    onFixtureUpdate?.(updatedFixtures)
  }, [fixtures, onFixtureUpdate])

  const handleFixtureDelete = useCallback((id: string) => {
    const updatedFixtures = fixtures.filter(f => f.id !== id)
    setFixtures(updatedFixtures)
    setSelectedFixture(null)
    onFixtureUpdate?.(updatedFixtures)
  }, [fixtures, onFixtureUpdate])

  const handleFixtureToggle = useCallback((id: string) => {
    const updatedFixtures = fixtures.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    )
    setFixtures(updatedFixtures)
    onFixtureUpdate?.(updatedFixtures)
  }, [fixtures, onFixtureUpdate])

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="absolute inset-0 bg-gray-950">
      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          cursor: selectedTool === 'place' ? 'crosshair' : 'default'
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
        )}

        {/* PPFD Map */}
        {showPPFDMap && ppfdData.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <FalseColorPPFDMap
              width={roomDimensions.width}
              height={roomDimensions.height}
              ppfdData={ppfdData}
              colorScale="turbo"
              showGrid={false}
              showContours={true}
              showLabels={false}
              targetPPFD={600}
              opacity={0.7}
            />
          </div>
        )}

        {/* Fixtures */}
        {fixtures.map(fixture => (
          <DraggableFixture
            key={fixture.id}
            fixture={fixture}
            isSelected={selectedFixture === fixture.id}
            onSelect={setSelectedFixture}
            onMove={handleFixtureMove}
            onRotate={handleFixtureRotate}
            onDelete={handleFixtureDelete}
            onToggle={handleFixtureToggle}
            containerBounds={canvasBounds}
          />
        ))}

        {/* Empty state */}
        {fixtures.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium text-gray-400">No fixtures placed</p>
              <p className="text-sm mt-2 text-gray-500">
                {selectedTool === 'place' 
                  ? 'Click anywhere to place a fixture'
                  : 'Select the Place tool (P) to add fixtures'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* View toggles */}
        <div className="flex items-center gap-2 bg-gray-800/90 backdrop-blur rounded-lg p-2">
          <button
            onClick={() => setShowPPFDMap(!showPPFDMap)}
            className={`p-2 rounded transition-colors ${
              showPPFDMap 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
            title="Toggle PPFD Map (H)"
          >
            {showPPFDMap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${
              showGrid 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
            title="Toggle Grid (G)"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex flex-col gap-1 bg-gray-800/90 backdrop-blur rounded-lg p-2">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Reset View (0)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="bg-gray-800/90 backdrop-blur rounded-lg px-4 py-2 text-sm text-gray-300">
          <span className="mr-4">Fixtures: {fixtures.length}</span>
          <span className="mr-4">Active: {fixtures.filter(f => f.enabled).length}</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
        
        {selectedFixture && (
          <div className="bg-gray-800/90 backdrop-blur rounded-lg px-4 py-2 text-sm text-gray-300">
            Selected: {fixtures.find(f => f.id === selectedFixture)?.model.model}
          </div>
        )}
      </div>
    </div>
  )
}