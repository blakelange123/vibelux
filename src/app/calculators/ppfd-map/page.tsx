"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Download, Settings, Grid, Info } from "lucide-react"
import {
  calculateMultiFixturePPFD,
  generatePPFDHeatmap,
  calculateUniformity,
  calculateDLI
} from "@/lib/lighting-calculations"

interface Fixture {
  id: number
  ppf: number
  x: number
  y: number
  height: number
  beamAngle: number
  name: string
}

export default function PPFDMapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Room dimensions (meters)
  const [roomWidth, setRoomWidth] = useState(10)
  const [roomLength, setRoomLength] = useState(10)
  const [canopyHeight, setCanopyHeight] = useState(0) // Height of canopy from floor
  
  // Fixtures
  const [fixtures, setFixtures] = useState<Fixture[]>([
    {
      id: 1,
      ppf: 1700,
      x: 5,
      y: 5,
      height: 2.5, // Height above canopy
      beamAngle: 120,
      name: "Fixture 1"
    }
  ])
  
  // Display settings
  const [showGrid, setShowGrid] = useState(true)
  const [resolution, setResolution] = useState(0.25) // meters
  const [colorScale, setColorScale] = useState<'viridis' | 'heat' | 'grayscale'>('viridis')
  const [photoperiod, setPhotoperiod] = useState(16)
  
  // Calculated data
  const [heatmapData, setHeatmapData] = useState<Array<{ x: number; y: number; ppfd: number }>>([])
  const [uniformityData, setUniformityData] = useState<any>(null)

  // Add new fixture
  const addFixture = () => {
    const newFixture: Fixture = {
      id: Date.now(),
      ppf: 1700,
      x: roomWidth / 2,
      y: roomLength / 2,
      height: 2.5,
      beamAngle: 120,
      name: `Fixture ${fixtures.length + 1}`
    }
    setFixtures([...fixtures, newFixture])
  }

  // Update fixture
  const updateFixture = (id: number, updates: Partial<Fixture>) => {
    setFixtures(fixtures.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  // Remove fixture
  const removeFixture = (id: number) => {
    setFixtures(fixtures.filter(f => f.id !== id))
  }

  // Generate heatmap data
  useEffect(() => {
    const data = generatePPFDHeatmap(fixtures, roomWidth, roomLength, resolution)
    setHeatmapData(data)
    
    // Calculate uniformity
    const ppfdValues = data.map(d => d.ppfd)
    setUniformityData(calculateUniformity(ppfdValues))
  }, [fixtures, roomWidth, roomLength, resolution])

  // Draw heatmap
  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const scale = 50 // pixels per meter
    canvas.width = roomWidth * scale
    canvas.height = roomLength * scale
    
    // Find min and max PPFD for color scaling
    const ppfdValues = heatmapData.map(d => d.ppfd)
    const minPPFD = Math.min(...ppfdValues)
    const maxPPFD = Math.max(...ppfdValues)
    
    // Draw heatmap
    heatmapData.forEach(point => {
      const normalizedValue = (point.ppfd - minPPFD) / (maxPPFD - minPPFD)
      const color = getColor(normalizedValue, colorScale)
      
      ctx.fillStyle = color
      ctx.fillRect(
        point.x * scale - (resolution * scale) / 2,
        point.y * scale - (resolution * scale) / 2,
        resolution * scale,
        resolution * scale
      )
    })
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      
      // Vertical lines
      for (let x = 0; x <= roomWidth; x++) {
        ctx.beginPath()
        ctx.moveTo(x * scale, 0)
        ctx.lineTo(x * scale, canvas.height)
        ctx.stroke()
      }
      
      // Horizontal lines
      for (let y = 0; y <= roomLength; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * scale)
        ctx.lineTo(canvas.width, y * scale)
        ctx.stroke()
      }
    }
    
    // Draw fixtures
    fixtures.forEach(fixture => {
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      
      const size = 20
      ctx.fillRect(
        fixture.x * scale - size / 2,
        fixture.y * scale - size / 2,
        size,
        size
      )
      ctx.strokeRect(
        fixture.x * scale - size / 2,
        fixture.y * scale - size / 2,
        size,
        size
      )
      
      // Draw coverage circle
      const coverageRadius = fixture.height * Math.tan((fixture.beamAngle * Math.PI) / 360) * scale
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(fixture.x * scale, fixture.y * scale, coverageRadius, 0, 2 * Math.PI)
      ctx.stroke()
    })
  }, [heatmapData, fixtures, roomWidth, roomLength, showGrid, colorScale, resolution])

  // Color scale function
  const getColor = (value: number, scale: 'viridis' | 'heat' | 'grayscale'): string => {
    const clampedValue = Math.max(0, Math.min(1, value))
    
    switch (scale) {
      case 'viridis':
        // Simplified viridis colormap
        const r = Math.floor(68 + (253 - 68) * clampedValue)
        const g = Math.floor(1 + (231 - 1) * clampedValue)
        const b = Math.floor(84 + (37 - 84) * clampedValue)
        return `rgb(${r}, ${g}, ${b})`
        
      case 'heat':
        // Heat colormap (blue -> green -> yellow -> red)
        if (clampedValue < 0.25) {
          const t = clampedValue * 4
          return `rgb(0, 0, ${Math.floor(255 * (1 - t))})`
        } else if (clampedValue < 0.5) {
          const t = (clampedValue - 0.25) * 4
          return `rgb(0, ${Math.floor(255 * t)}, 0)`
        } else if (clampedValue < 0.75) {
          const t = (clampedValue - 0.5) * 4
          return `rgb(${Math.floor(255 * t)}, 255, 0)`
        } else {
          const t = (clampedValue - 0.75) * 4
          return `rgb(255, ${Math.floor(255 * (1 - t))}, 0)`
        }
        
      case 'grayscale':
        const gray = Math.floor(255 * clampedValue)
        return `rgb(${gray}, ${gray}, ${gray})`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/calculators">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">PPFD Heat Map Calculator</h1>
                <p className="text-sm text-gray-600">Visualize light distribution and uniformity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Room Settings */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-4">Room Dimensions</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Width (m)</label>
                  <input
                    type="number"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Length (m)</label>
                  <input
                    type="number"
                    value={roomLength}
                    onChange={(e) => setRoomLength(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Canopy Height (m)</label>
                  <input
                    type="number"
                    value={canopyHeight}
                    onChange={(e) => setCanopyHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Fixtures */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Fixtures</h3>
                <button
                  onClick={addFixture}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fixtures.map((fixture) => (
                  <div key={fixture.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={fixture.name}
                        onChange={(e) => updateFixture(fixture.id, { name: e.target.value })}
                        className="font-medium bg-transparent"
                      />
                      <button
                        onClick={() => removeFixture(fixture.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="text-gray-600">PPF (μmol/s)</label>
                        <input
                          type="number"
                          value={fixture.ppf}
                          onChange={(e) => updateFixture(fixture.id, { ppf: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Height (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fixture.height}
                          onChange={(e) => updateFixture(fixture.id, { height: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">X Position (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fixture.x}
                          onChange={(e) => updateFixture(fixture.id, { x: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Y Position (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fixture.y}
                          onChange={(e) => updateFixture(fixture.id, { y: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-600">Beam Angle (°)</label>
                        <input
                          type="number"
                          value={fixture.beamAngle}
                          onChange={(e) => updateFixture(fixture.id, { beamAngle: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-4">Display Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Color Scale</label>
                  <select
                    value={colorScale}
                    onChange={(e) => setColorScale(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="viridis">Viridis</option>
                    <option value="heat">Heat Map</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Resolution (m)</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="0.1">0.1m (High)</option>
                    <option value="0.25">0.25m (Medium)</option>
                    <option value="0.5">0.5m (Low)</option>
                    <option value="1">1m (Fast)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Photoperiod (hours)</label>
                  <input
                    type="number"
                    value={photoperiod}
                    onChange={(e) => setPhotoperiod(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showGrid"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showGrid" className="text-sm">Show Grid</label>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Heat Map */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-4">PPFD Distribution</h3>
              <div className="relative overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300"
                  style={{ imageRendering: 'pixelated' }}
                />
                {/* Color scale legend */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-medium mb-2">PPFD (μmol/m²/s)</div>
                  <div className="w-6 h-32 rounded" style={{
                    background: colorScale === 'viridis' 
                      ? 'linear-gradient(to bottom, #FDE725, #5EC962, #21918C, #3B528B, #440154)'
                      : colorScale === 'heat'
                      ? 'linear-gradient(to bottom, #FF0000, #FFFF00, #00FF00, #0000FF)'
                      : 'linear-gradient(to bottom, #FFFFFF, #000000)'
                  }} />
                  <div className="text-xs mt-1">{uniformityData?.max || 0}</div>
                  <div className="text-xs absolute bottom-3">{uniformityData?.min || 0}</div>
                </div>
              </div>
            </div>

            {/* Uniformity Analysis */}
            {uniformityData && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold mb-4">Uniformity Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {uniformityData.avg.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Average PPFD</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {uniformityData.min.toFixed(0)}-{uniformityData.max.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Min-Max Range</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {(uniformityData.uniformityRatio * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Uniformity Ratio</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {uniformityData.cv.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">CV</div>
                  </div>
                </div>
                
                {/* DLI Information */}
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Daily Light Integral</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-purple-700">Average DLI:</span>
                      <span className="font-medium text-purple-900 ml-1">
                        {calculateDLI(uniformityData.avg, photoperiod).toFixed(1)} mol/m²/day
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Min DLI:</span>
                      <span className="font-medium text-purple-900 ml-1">
                        {calculateDLI(uniformityData.min, photoperiod).toFixed(1)} mol/m²/day
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Max DLI:</span>
                      <span className="font-medium text-purple-900 ml-1">
                        {calculateDLI(uniformityData.max, photoperiod).toFixed(1)} mol/m²/day
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}