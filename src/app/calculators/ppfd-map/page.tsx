"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Download, Settings, Grid, Info, Search, Lightbulb } from "lucide-react"
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
  beamAngleY?: number // For asymmetric beams like QB (150x135)
  name: string
  wattage?: number
  model?: string
}

interface DLCFixture {
  manufacturer: string
  brand: string
  catalogNumber: string
  productName: string
  wattage: number
  ppf: number
  ppe?: number
  model?: string
}

export default function PPFDMapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Room dimensions (meters)
  const [roomWidth, setRoomWidth] = useState(10)
  const [roomLength, setRoomLength] = useState(10)
  const [canopyHeight, setCanopyHeight] = useState(0.5) // Height of canopy from floor - default to 0.5m for better visibility
  
  // Fixtures - Start with a grid of fixtures for better initial visualization
  const [fixtures, setFixtures] = useState<Fixture[]>([
    {
      id: 1,
      ppf: 1700,
      x: 3.33,
      y: 3.33,
      height: 2.5,
      beamAngle: 120,
      name: "Fixture 1",
      wattage: 600
    },
    {
      id: 2,
      ppf: 1700,
      x: 6.66,
      y: 3.33,
      height: 2.5,
      beamAngle: 120,
      name: "Fixture 2",
      wattage: 600
    },
    {
      id: 3,
      ppf: 1700,
      x: 3.33,
      y: 6.66,
      height: 2.5,
      beamAngle: 120,
      name: "Fixture 3",
      wattage: 600
    },
    {
      id: 4,
      ppf: 1700,
      x: 6.66,
      y: 6.66,
      height: 2.5,
      beamAngle: 120,
      name: "Fixture 4",
      wattage: 600
    }
  ])
  
  // DLC fixtures
  const [dlcFixtures, setDlcFixtures] = useState<DLCFixture[]>([])
  const [selectedDLCFixture, setSelectedDLCFixture] = useState<DLCFixture | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false)
  const [showDLCSelector, setShowDLCSelector] = useState(false)
  const [fixtureType, setFixtureType] = useState<'dlc' | 'custom'>('dlc')
  
  // Display settings
  const [showGrid, setShowGrid] = useState(true)
  const [resolution, setResolution] = useState(0.25) // meters
  const [colorScale, setColorScale] = useState<'viridis' | 'heat' | 'grayscale' | 'plasma'>('plasma') // Changed to plasma for better visibility
  const [photoperiod, setPhotoperiod] = useState(16)
  
  // Calculated data
  const [heatmapData, setHeatmapData] = useState<Array<{ x: number; y: number; ppfd: number }>>([])
  const [uniformityData, setUniformityData] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Load DLC fixtures
  useEffect(() => {
    loadDLCFixtures()
  }, [searchQuery])

  const loadDLCFixtures = async () => {
    setIsLoadingFixtures(true)
    try {
      const response = await fetch(`/api/fixtures?search=${searchQuery}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setDlcFixtures(data.fixtures || [])
      }
    } catch (error) {
      console.error('Error loading fixtures:', error)
    } finally {
      setIsLoadingFixtures(false)
    }
  }

  // Common fixture presets
  const fixturePresets = [
    { name: "Verjure Arize Element XWD - PKR", ppf: 2500, beamAngle: 155, beamAngleY: 140, wattage: 800, description: "XWD Optic - 10-15% fewer fixtures" },
    { name: "Verjure Arize Element XWD - PKF", ppf: 2500, beamAngle: 155, beamAngleY: 140, wattage: 800, description: "XWD Optic with Far Red" },
    { name: "Verjure Arize Element XWD - BRI", ppf: 2450, beamAngle: 155, beamAngleY: 140, wattage: 800, description: "XWD Optic - High Blue" },
    { name: "Verjure Arize Element XWD - BRH", ppf: 2400, beamAngle: 155, beamAngleY: 140, wattage: 800, description: "XWD Optic - Balanced Blue" },
    { name: "Signify TLF QB (150°x135°)", ppf: 3500, beamAngle: 150, beamAngleY: 135, wattage: 1000 },
    { name: "Signify TLF SB (120°)", ppf: 2600, beamAngle: 120, wattage: 750 },
    { name: "Generic 600W LED", ppf: 1620, beamAngle: 120, wattage: 600 },
    { name: "Generic 1000W LED", ppf: 2700, beamAngle: 120, wattage: 1000 },
    { name: "Narrow Beam (90°)", ppf: 1800, beamAngle: 90, wattage: 650 },
    { name: "Wide Beam (140°)", ppf: 1500, beamAngle: 140, wattage: 550 },
  ]

  // Add new fixture
  const addFixture = (dlcFixture?: DLCFixture, preset?: any) => {
    // Calculate PPE if not provided
    let ppf = dlcFixture?.ppf || preset?.ppf || 1700
    let wattage = dlcFixture?.wattage || preset?.wattage || 600
    
    const newFixture: Fixture = {
      id: Date.now(),
      ppf: ppf,
      x: roomWidth / 2,
      y: roomLength / 2,
      height: 2.5,
      beamAngle: preset?.beamAngle || 120,
      beamAngleY: preset?.beamAngleY,
      name: dlcFixture 
        ? `${dlcFixture.manufacturer} ${dlcFixture.productName}` 
        : preset?.name || `Fixture ${fixtures.length + 1}`,
      wattage: wattage,
      model: dlcFixture?.catalogNumber
    }
    setFixtures([...fixtures, newFixture])
    setShowDLCSelector(false)
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
    
    // Set canvas size - dynamic scale based on room size and container
    const containerWidth = canvas.parentElement?.clientWidth || 800
    const containerHeight = 600 // Fixed height to prevent excessive scrolling
    const scaleX = (containerWidth - 100) / roomWidth // Leave some padding
    const scaleY = containerHeight / roomLength
    const scale = Math.min(scaleX, scaleY, 80) // Cap at 80 pixels per meter
    
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
      
      // Draw coverage ellipse for asymmetric beams
      if (fixture.beamAngleY) {
        const coverageRadiusX = fixture.height * Math.tan((fixture.beamAngle * Math.PI) / 360) * scale
        const coverageRadiusY = fixture.height * Math.tan((fixture.beamAngleY * Math.PI) / 360) * scale
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(fixture.x * scale, fixture.y * scale, coverageRadiusX, coverageRadiusY, 0, 0, 2 * Math.PI)
        ctx.stroke()
      } else {
        // Draw coverage circle for symmetric beams
        const coverageRadius = fixture.height * Math.tan((fixture.beamAngle * Math.PI) / 360) * scale
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(fixture.x * scale, fixture.y * scale, coverageRadius, 0, 2 * Math.PI)
        ctx.stroke()
      }
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
        // Improved heat colormap (dark purple -> blue -> green -> yellow -> red)
        if (clampedValue < 0.2) {
          const t = clampedValue * 5
          return `rgb(${Math.floor(50 * t)}, 0, ${Math.floor(100 + 155 * t)})`
        } else if (clampedValue < 0.4) {
          const t = (clampedValue - 0.2) * 5
          return `rgb(${Math.floor(50 + 50 * t)}, ${Math.floor(100 * t)}, ${Math.floor(255 - 155 * t)})`
        } else if (clampedValue < 0.6) {
          const t = (clampedValue - 0.4) * 5
          return `rgb(${Math.floor(100 + 155 * t)}, ${Math.floor(100 + 155 * t)}, 0)`
        } else if (clampedValue < 0.8) {
          const t = (clampedValue - 0.6) * 5
          return `rgb(255, ${Math.floor(255 - 127 * t)}, 0)`
        } else {
          const t = (clampedValue - 0.8) * 5
          return `rgb(255, ${Math.floor(128 - 128 * t)}, 0)`
        }
        
      case 'grayscale':
        const gray = Math.floor(255 * clampedValue)
        return `rgb(${gray}, ${gray}, ${gray})`
        
      case 'plasma':
        // Plasma colormap (purple -> pink -> yellow)
        if (clampedValue < 0.25) {
          const t = clampedValue * 4
          return `rgb(${Math.floor(13 + 87 * t)}, ${Math.floor(2 + 48 * t)}, ${Math.floor(134 + 43 * t)})`
        } else if (clampedValue < 0.5) {
          const t = (clampedValue - 0.25) * 4
          return `rgb(${Math.floor(100 + 122 * t)}, ${Math.floor(50 + 55 * t)}, ${Math.floor(177 - 77 * t)})`
        } else if (clampedValue < 0.75) {
          const t = (clampedValue - 0.5) * 4
          return `rgb(${Math.floor(222 + 28 * t)}, ${Math.floor(105 + 93 * t)}, ${Math.floor(100 - 60 * t)})`
        } else {
          const t = (clampedValue - 0.75) * 4
          return `rgb(${Math.floor(250 - 10 * t)}, ${Math.floor(198 + 37 * t)}, ${Math.floor(40 - 27 * t)})`
        }
    }
  }

  // Calculate total power
  const totalPower = fixtures.reduce((sum, f) => sum + (f.wattage || 0), 0)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/calculators">
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">PPFD Heat Map Calculator</h1>
                  <p className="text-sm text-gray-400">Visualize light distribution with DLC fixtures</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-2 transition-colors">
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
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-gray-800 p-4">
                <h3 className="font-semibold text-white mb-4">Room Dimensions</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Width (m)</label>
                    <input
                      type="number"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Length (m)</label>
                    <input
                      type="number"
                      value={roomLength}
                      onChange={(e) => setRoomLength(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Canopy Height (m)</label>
                    <input
                      type="number"
                      value={canopyHeight}
                      onChange={(e) => setCanopyHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Add Fixture Section */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-gray-800 p-4">
                <h3 className="font-semibold text-white mb-4">Add Fixture</h3>
                
                {/* Fixture Type Selector */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setFixtureType('dlc')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                      fixtureType === 'dlc'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    DLC Fixtures
                  </button>
                  <button
                    onClick={() => setFixtureType('custom')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                      fixtureType === 'custom'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Custom/Presets
                  </button>
                </div>

                {fixtureType === 'dlc' ? (
                  <div className="space-y-3">
                    {/* DLC Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search DLC fixtures..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    
                    {/* DLC Fixtures List */}
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {isLoadingFixtures ? (
                        <div className="text-center py-4 text-gray-500">Loading fixtures...</div>
                      ) : dlcFixtures.length > 0 ? (
                        dlcFixtures.map((fixture, idx) => (
                          <button
                            key={idx}
                            onClick={() => addFixture(fixture)}
                            className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-white text-sm">
                                  {fixture.manufacturer} {fixture.productName}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {fixture.wattage}W • {fixture.ppf} μmol/s • {fixture.ppe ? `${fixture.ppe.toFixed(1)} μmol/J` : 'N/A'}
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">No fixtures found</div>
                      )}
                    </div>
                    
                    {/* Popular Signify Fixtures */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Popular Signify Fixtures:</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => addFixture(undefined, {
                            name: "Signify TLF QB",
                            ppf: 3500,
                            beamAngle: 150,
                            beamAngleY: 135,
                            wattage: 1000
                          })}
                          className="w-full text-left p-2 bg-purple-900/20 hover:bg-purple-900/30 rounded border border-purple-700/50 transition-colors text-sm"
                        >
                          <div className="text-purple-300">Signify TopLighting Force QB</div>
                          <div className="text-xs text-purple-400">150°×135° • 3500 μmol/s</div>
                        </button>
                        <button
                          onClick={() => addFixture(undefined, {
                            name: "Signify TLF SB",
                            ppf: 2600,
                            beamAngle: 120,
                            wattage: 750
                          })}
                          className="w-full text-left p-2 bg-purple-900/20 hover:bg-purple-900/30 rounded border border-purple-700/50 transition-colors text-sm"
                        >
                          <div className="text-purple-300">Signify TopLighting Force SB</div>
                          <div className="text-xs text-purple-400">120° • 2600 μmol/s</div>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Preset Fixtures */}
                    <p className="text-xs text-gray-500 mb-2">Fixture Presets:</p>
                    {fixturePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => addFixture(undefined, preset)}
                        className="w-full text-left p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="text-white text-sm">{preset.name}</div>
                        <div className="text-xs text-gray-400">
                          {preset.ppf} μmol/s • {preset.beamAngle}°{preset.beamAngleY ? `×${preset.beamAngleY}°` : ''} • {preset.wattage}W
                        </div>
                        {preset.description && (
                          <div className="text-xs text-purple-400 mt-1">{preset.description}</div>
                        )}
                      </button>
                    ))}
                    
                    {/* Add Custom Button */}
                    <button
                      onClick={() => addFixture()}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Custom Fixture
                    </button>
                  </div>
                )}
              </div>

              {/* Fixtures List */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Active Fixtures ({fixtures.length})</h3>
                  <div className="text-sm text-gray-400">{totalPower}W Total</div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fixtures.map((fixture) => (
                    <div key={fixture.id} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={fixture.name}
                          onChange={(e) => updateFixture(fixture.id, { name: e.target.value })}
                          className="font-medium bg-transparent text-white focus:outline-none"
                        />
                        <button
                          onClick={() => removeFixture(fixture.id)}
                          className="p-1 hover:bg-red-900/50 rounded text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {fixture.model && (
                        <div className="text-xs text-gray-500 mb-2">{fixture.model}</div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="text-xs text-gray-500">PPF (μmol/s)</label>
                          <input
                            type="number"
                            value={fixture.ppf}
                            onChange={(e) => updateFixture(fixture.id, { ppf: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Wattage</label>
                          <input
                            type="number"
                            value={fixture.wattage || 0}
                            onChange={(e) => updateFixture(fixture.id, { wattage: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Height (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={fixture.height}
                            onChange={(e) => updateFixture(fixture.id, { height: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">X Pos (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={fixture.x}
                            onChange={(e) => updateFixture(fixture.id, { x: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Y Pos (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={fixture.y}
                            onChange={(e) => updateFixture(fixture.id, { y: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Beam X (°)</label>
                          <input
                            type="number"
                            value={fixture.beamAngle}
                            onChange={(e) => updateFixture(fixture.id, { beamAngle: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        {fixture.beamAngleY && (
                          <div>
                            <label className="text-xs text-gray-500">Beam Y (°)</label>
                            <input
                              type="number"
                              value={fixture.beamAngleY}
                              onChange={(e) => updateFixture(fixture.id, { beamAngleY: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-gray-800 p-4">
                <h3 className="font-semibold text-white mb-4">Display Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Color Scale</label>
                    <select
                      value={colorScale}
                      onChange={(e) => setColorScale(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="plasma">Plasma (Recommended)</option>
                      <option value="viridis">Viridis</option>
                      <option value="heat">Heat Map</option>
                      <option value="grayscale">Grayscale</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Resolution (m)</label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="0.1">0.1m (High)</option>
                      <option value="0.25">0.25m (Medium)</option>
                      <option value="0.5">0.5m (Low)</option>
                      <option value="1">1m (Fast)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Photoperiod (hours)</label>
                    <input
                      type="number"
                      value={photoperiod}
                      onChange={(e) => setPhotoperiod(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showGrid"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="showGrid" className="text-sm text-gray-300">Show Grid</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Heat Map */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-gray-800 p-4">
                <h3 className="font-semibold text-white mb-4">PPFD Distribution</h3>
                <div className="relative overflow-auto max-h-[600px] flex justify-center items-center p-4">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-700"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {/* Color scale legend */}
                  <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur rounded-lg p-3 shadow-lg">
                    <div className="text-xs font-medium text-white mb-2">PPFD (μmol/m²/s)</div>
                    <div className="w-6 h-32 rounded" style={{
                      background: colorScale === 'viridis' 
                        ? 'linear-gradient(to bottom, #FDE725, #5EC962, #21918C, #3B528B, #440154)'
                        : colorScale === 'heat'
                        ? 'linear-gradient(to bottom, #FF0000, #FF8000, #FFFF00, #00FF00, #0064FF)'
                        : colorScale === 'plasma'
                        ? 'linear-gradient(to bottom, #F0E442, #F57C7C, #CC4778, #7E2F8E, #0D0887)'
                        : 'linear-gradient(to bottom, #FFFFFF, #000000)'
                    }} />
                    <div className="text-xs text-gray-300 mt-1">{uniformityData?.max || 0}</div>
                    <div className="text-xs text-gray-300 absolute bottom-3">{uniformityData?.min || 0}</div>
                  </div>
                </div>
              </div>

              {/* Uniformity Analysis */}
              {uniformityData && (
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg border border-gray-800 p-4">
                  <h3 className="font-semibold text-white mb-4">Uniformity Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {uniformityData.avg.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Average PPFD</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {uniformityData.min.toFixed(0)}-{uniformityData.max.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Min-Max Range</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {(uniformityData.uniformityRatio * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-400">Uniformity Ratio</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {uniformityData.cv.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">CV</div>
                    </div>
                  </div>
                  
                  {/* DLI Information */}
                  <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-purple-300">Daily Light Integral</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-purple-400">Average DLI:</span>
                        <span className="font-medium text-white ml-1">
                          {calculateDLI(uniformityData.avg, photoperiod).toFixed(1)} mol/m²/day
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-400">Min DLI:</span>
                        <span className="font-medium text-white ml-1">
                          {calculateDLI(uniformityData.min, photoperiod).toFixed(1)} mol/m²/day
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-400">Max DLI:</span>
                        <span className="font-medium text-white ml-1">
                          {calculateDLI(uniformityData.max, photoperiod).toFixed(1)} mol/m²/day
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Power Metrics */}
                  <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-blue-300">Power Metrics</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-400">Total Power:</span>
                        <span className="font-medium text-white ml-1">{totalPower}W</span>
                      </div>
                      <div>
                        <span className="text-blue-400">W/m²:</span>
                        <span className="font-medium text-white ml-1">
                          {(totalPower / (roomWidth * roomLength)).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400">PPE:</span>
                        <span className="font-medium text-white ml-1">
                          {totalPower > 0 ? (fixtures.reduce((sum, f) => sum + f.ppf, 0) / totalPower).toFixed(2) : 0} μmol/J
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
    </div>
  )
}