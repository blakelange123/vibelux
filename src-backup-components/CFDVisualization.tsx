'use client'

import React, { useRef, useEffect, useState } from 'react'
import {
  Wind,
  Thermometer,
  Gauge,
  Settings,
  Play,
  Pause,
  RotateCw,
  Download,
  Info,
  Sliders,
  Grid3x3,
  Activity
} from 'lucide-react'
import { CFDEngine, CFDConfig, CFDResult } from '@/lib/cfd/cfd-engine'

interface CFDVisualizationProps {
  roomDimensions: {
    width: number
    height: number
    depth: number
  }
  fixtures?: Array<{
    x: number
    y: number
    z: number
    power: number
  }>
  hvacInlets?: Array<{
    x: number
    y: number
    z: number
    width: number
    height: number
    flowRate: number
    temperature: number
  }>
  hvacOutlets?: Array<{
    x: number
    y: number
    z: number
    width: number
    height: number
  }>
}

type VisualizationMode = 'velocity' | 'temperature' | 'pressure' | 'streamlines'

export function CFDVisualization({
  roomDimensions,
  fixtures = [],
  hvacInlets = [],
  hvacOutlets = []
}: CFDVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<CFDResult | null>(null)
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('temperature')
  const [sliceZ, setSliceZ] = useState(0.5) // Z-slice position (0-1)
  const [showVectors, setShowVectors] = useState(true)
  const [vectorScale, setVectorScale] = useState(10)
  const [showGrid, setShowGrid] = useState(true)
  
  // CFD Configuration
  const [cfdConfig] = useState<CFDConfig>({
    gridSizeX: 50,
    gridSizeY: 30,
    gridSizeZ: 20,
    cellSize: Math.max(roomDimensions.width, roomDimensions.depth) / 50,
    airDensity: 1.225,
    airViscosity: 1.8e-5,
    thermalDiffusivity: 2.2e-5,
    timeStep: 0.01,
    iterations: 100,
    convergenceTolerance: 0.001,
    ambientTemperature: 20,
    ambientPressure: 101325
  })

  const runSimulation = async () => {
    setIsSimulating(true)
    
    // Create CFD engine
    const engine = new CFDEngine(cfdConfig)
    
    // Add room boundaries
    engine.addBoundary({
      type: 'wall',
      position: { x: 0, y: 0, z: 0 },
      size: { width: 0.1, height: roomDimensions.height, depth: roomDimensions.depth },
      properties: {}
    })
    engine.addBoundary({
      type: 'wall',
      position: { x: roomDimensions.width - 0.1, y: 0, z: 0 },
      size: { width: 0.1, height: roomDimensions.height, depth: roomDimensions.depth },
      properties: {}
    })
    // Add other walls, floor, ceiling...
    
    // Add HVAC inlets
    hvacInlets.forEach(inlet => {
      const velocity = inlet.flowRate / (inlet.width * inlet.height)
      engine.addBoundary({
        type: 'inlet',
        position: { x: inlet.x, y: inlet.y, z: inlet.z },
        size: { width: inlet.width, height: inlet.height, depth: 0.1 },
        properties: {
          velocity: { x: 0, y: -velocity, z: 0 }, // Downward flow
          temperature: inlet.temperature
        }
      })
    })
    
    // Add HVAC outlets
    hvacOutlets.forEach(outlet => {
      engine.addBoundary({
        type: 'outlet',
        position: { x: outlet.x, y: outlet.y, z: outlet.z },
        size: { width: outlet.width, height: outlet.height, depth: 0.1 },
        properties: {}
      })
    })
    
    // Add heat sources (fixtures)
    fixtures.forEach(fixture => {
      engine.addHeatSource({
        position: { x: fixture.x - 0.3, y: fixture.y - 0.3, z: fixture.z - 0.1 },
        size: { width: 0.6, height: 0.6, depth: 0.2 },
        power: fixture.power * 0.5, // Assume 50% heat generation
        type: 'fixture'
      })
    })
    
    // Run simulation
    const result = await new Promise<CFDResult>((resolve) => {
      setTimeout(() => {
        const res = engine.simulate()
        resolve(res)
      }, 100)
    })
    
    setSimulationResult(result)
    setIsSimulating(false)
    
    // Visualize results
    visualizeResults(result)
  }

  const visualizeResults = (result: CFDResult) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Calculate slice index
    const zIndex = Math.floor(sliceZ * cfdConfig.gridSizeZ)
    
    // Draw background
    ctx.fillStyle = '#1F2937'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Cell dimensions for visualization
    const cellWidth = canvas.width / cfdConfig.gridSizeX
    const cellHeight = canvas.height / cfdConfig.gridSizeY
    
    // Draw field data
    for (let i = 0; i < cfdConfig.gridSizeX; i++) {
      for (let j = 0; j < cfdConfig.gridSizeY; j++) {
        const idx = i + j * cfdConfig.gridSizeX + zIndex * cfdConfig.gridSizeX * cfdConfig.gridSizeY
        
        // Get value based on visualization mode
        let value = 0
        let minVal = 0
        let maxVal = 1
        
        switch (visualizationMode) {
          case 'temperature':
            value = result.temperatureField[idx]
            minVal = result.minTemperature
            maxVal = result.maxTemperature
            break
          case 'velocity':
            const vx = result.velocityField[idx * 3]
            const vy = result.velocityField[idx * 3 + 1]
            value = Math.sqrt(vx * vx + vy * vy)
            minVal = 0
            maxVal = result.maxVelocity
            break
          case 'pressure':
            value = result.pressureField[idx]
            minVal = Math.min(...result.pressureField)
            maxVal = Math.max(...result.pressureField)
            break
        }
        
        // Normalize value
        const normalized = (value - minVal) / (maxVal - minVal + 0.001)
        
        // Get color
        const color = getColorForValue(normalized, visualizationMode)
        ctx.fillStyle = color
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight)
      }
    }
    
    // Draw velocity vectors if enabled
    if (showVectors && (visualizationMode === 'velocity' || visualizationMode === 'streamlines')) {
      drawVelocityVectors(ctx, result, zIndex)
    }
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx)
    }
    
    // Draw fixtures and HVAC components
    drawComponents(ctx)
  }

  const getColorForValue = (value: number, mode: VisualizationMode): string => {
    const clamp = (v: number) => Math.max(0, Math.min(1, v))
    value = clamp(value)
    
    switch (mode) {
      case 'temperature':
        // Blue to red gradient
        const r = Math.floor(255 * value)
        const b = Math.floor(255 * (1 - value))
        const g = Math.floor(128 * (1 - Math.abs(value - 0.5) * 2))
        return `rgb(${r}, ${g}, ${b})`
        
      case 'velocity':
        // Black to white through blue
        if (value < 0.5) {
          const intensity = Math.floor(value * 2 * 255)
          return `rgb(0, ${intensity}, ${intensity})`
        } else {
          const intensity = Math.floor((value - 0.5) * 2 * 255)
          return `rgb(${intensity}, ${intensity + 128}, 255)`
        }
        
      case 'pressure':
        // Green to yellow to red
        if (value < 0.5) {
          const r = Math.floor(value * 2 * 255)
          return `rgb(${r}, 255, 0)`
        } else {
          const g = Math.floor((1 - value) * 2 * 255)
          return `rgb(255, ${g}, 0)`
        }
        
      default:
        return '#666'
    }
  }

  const drawVelocityVectors = (ctx: CanvasRenderingContext2D, result: CFDResult, zIndex: number) => {
    const canvas = canvasRef.current!
    const cellWidth = canvas.width / cfdConfig.gridSizeX
    const cellHeight = canvas.height / cfdConfig.gridSizeY
    
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    
    // Draw vectors at every nth cell for clarity
    const step = 3
    
    for (let i = step; i < cfdConfig.gridSizeX; i += step) {
      for (let j = step; j < cfdConfig.gridSizeY; j += step) {
        const idx = i + j * cfdConfig.gridSizeX + zIndex * cfdConfig.gridSizeX * cfdConfig.gridSizeY
        
        const vx = result.velocityField[idx * 3] * vectorScale
        const vy = result.velocityField[idx * 3 + 1] * vectorScale
        
        if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
          const x = i * cellWidth + cellWidth / 2
          const y = j * cellHeight + cellHeight / 2
          
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + vx, y + vy)
          ctx.stroke()
          
          // Draw arrowhead
          const angle = Math.atan2(vy, vx)
          const headLength = 3
          ctx.beginPath()
          ctx.moveTo(x + vx, y + vy)
          ctx.lineTo(
            x + vx - headLength * Math.cos(angle - Math.PI / 6),
            y + vy - headLength * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(x + vx, y + vy)
          ctx.lineTo(
            x + vx - headLength * Math.cos(angle + Math.PI / 6),
            y + vy - headLength * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      }
    }
  }

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!
    const cellWidth = canvas.width / cfdConfig.gridSizeX
    const cellHeight = canvas.height / cfdConfig.gridSizeY
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 0.5
    
    for (let i = 0; i <= cfdConfig.gridSizeX; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellWidth, 0)
      ctx.lineTo(i * cellWidth, canvas.height)
      ctx.stroke()
    }
    
    for (let j = 0; j <= cfdConfig.gridSizeY; j++) {
      ctx.beginPath()
      ctx.moveTo(0, j * cellHeight)
      ctx.lineTo(canvas.width, j * cellHeight)
      ctx.stroke()
    }
  }

  const drawComponents = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!
    const scaleX = canvas.width / roomDimensions.width
    const scaleY = canvas.height / roomDimensions.height
    
    // Draw fixtures
    ctx.fillStyle = 'rgba(255, 255, 0, 0.6)'
    fixtures.forEach(fixture => {
      ctx.fillRect(
        (fixture.x - 0.3) * scaleX,
        (fixture.y - 0.3) * scaleY,
        0.6 * scaleX,
        0.6 * scaleY
      )
    })
    
    // Draw HVAC inlets
    ctx.fillStyle = 'rgba(0, 100, 255, 0.6)'
    hvacInlets.forEach(inlet => {
      ctx.fillRect(
        inlet.x * scaleX,
        inlet.y * scaleY,
        inlet.width * scaleX,
        inlet.height * scaleY
      )
    })
    
    // Draw HVAC outlets
    ctx.fillStyle = 'rgba(255, 100, 0, 0.6)'
    hvacOutlets.forEach(outlet => {
      ctx.fillRect(
        outlet.x * scaleX,
        outlet.y * scaleY,
        outlet.width * scaleX,
        outlet.height * scaleY
      )
    })
  }

  useEffect(() => {
    if (simulationResult) {
      visualizeResults(simulationResult)
    }
  }, [simulationResult, visualizationMode, sliceZ, showVectors, vectorScale, showGrid])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Wind className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">CFD Airflow Analysis</h2>
            <p className="text-sm text-gray-400">Computational fluid dynamics simulation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isSimulating
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Visualization Mode
          </label>
          <select
            value={visualizationMode}
            onChange={(e) => setVisualizationMode(e.target.value as VisualizationMode)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="temperature">Temperature</option>
            <option value="velocity">Velocity</option>
            <option value="pressure">Pressure</option>
            <option value="streamlines">Streamlines</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Z-Slice Position: {Math.round(sliceZ * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sliceZ}
            onChange={(e) => setSliceZ(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Display Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded border-gray-600"
              />
              Show velocity vectors
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-gray-600"
              />
              Show grid
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Vector Scale: {vectorScale}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={vectorScale}
            onChange={(e) => setVectorScale(parseInt(e.target.value))}
            className="w-full"
            disabled={!showVectors}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full"
        />
        
        {/* Legend */}
        {simulationResult && (
          <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-400 mb-2">
              {visualizationMode === 'temperature' && 'Temperature (°C)'}
              {visualizationMode === 'velocity' && 'Velocity (m/s)'}
              {visualizationMode === 'pressure' && 'Pressure (Pa)'}
            </h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-24 bg-gradient-to-t from-blue-600 to-red-600 rounded" />
              <div className="text-xs text-gray-300 space-y-4">
                <div>
                  {visualizationMode === 'temperature' && simulationResult.maxTemperature.toFixed(1)}
                  {visualizationMode === 'velocity' && simulationResult.maxVelocity.toFixed(2)}
                  {visualizationMode === 'pressure' && Math.max(...simulationResult.pressureField).toFixed(0)}
                </div>
                <div>
                  {visualizationMode === 'temperature' && simulationResult.minTemperature.toFixed(1)}
                  {visualizationMode === 'velocity' && '0.00'}
                  {visualizationMode === 'pressure' && Math.min(...simulationResult.pressureField).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {simulationResult && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs">Temperature Range</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {simulationResult.minTemperature.toFixed(1)} - {simulationResult.maxTemperature.toFixed(1)}°C
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: {simulationResult.avgTemperature.toFixed(1)}°C
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Wind className="w-4 h-4" />
              <span className="text-xs">Max Velocity</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {simulationResult.maxVelocity.toFixed(2)} m/s
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Gauge className="w-4 h-4" />
              <span className="text-xs">Uniformity Index</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {(simulationResult.uniformityIndex * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Convergence</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {simulationResult.convergenceHistory.length} iterations
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">About CFD Analysis</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Simulates airflow patterns and temperature distribution</li>
              <li>• Helps optimize HVAC placement for uniform conditions</li>
              <li>• Identifies dead zones and hot spots</li>
              <li>• Improves energy efficiency and plant health</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}