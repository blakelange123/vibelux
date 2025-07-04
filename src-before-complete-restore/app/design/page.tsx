"use client"

import { useState } from 'react'
import { 
  Maximize2, 
  Square, 
  Circle, 
  Pentagon,
  Plus,
  Minus,
  Move,
  RotateCw,
  Download,
  Upload,
  Settings,
  Grid,
  Zap,
  Sun,
  Ruler,
  Target,
  Eye,
  EyeOff,
  Layers,
  Save,
  FolderOpen
} from 'lucide-react'
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary'

interface Room {
  width: number
  height: number
  shape: 'rectangle' | 'square' | 'circle' | 'polygon'
  mountingHeight: number
  targetPPFD: number
  targetDLI: number
  photoperiod: number
}

interface Fixture {
  id: string
  x: number
  y: number
  rotation: number
  model: string
  ppf: number
  wattage: number
  coverage: number
  enabled: boolean
}

export default function LightingDesignPage() {
  const [room, setRoom] = useState<Room>({
    width: 10,
    height: 10,
    shape: 'rectangle',
    mountingHeight: 3,
    targetPPFD: 600,
    targetDLI: 20,
    photoperiod: 16
  })

  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [selectedFixtureModel, setSelectedFixtureModel] = useState<FixtureModel | null>(null)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [showPARMap, setShowPARMap] = useState(true)
  const [designMode, setDesignMode] = useState<'place' | 'move' | 'rotate'>('place')

  // Calculate uniformity
  const calculateUniformity = () => {
    if (fixtures.length === 0) return 0
    // Simplified uniformity calculation
    return 0.85 // Placeholder
  }

  // Calculate total power
  const totalPower = fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
  
  // Calculate average PPFD
  const averagePPFD = fixtures.length > 0 ? 
    fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf / f.coverage : 0), 0) / fixtures.length : 0

  // Add fixture
  const addFixture = (x: number, y: number) => {
    if (!selectedFixtureModel) {
      alert('Please select a fixture model first')
      return
    }
    
    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      x,
      y,
      rotation: 0,
      model: `${selectedFixtureModel.brand} ${selectedFixtureModel.model}`,
      ppf: selectedFixtureModel.ppf,
      wattage: selectedFixtureModel.wattage,
      coverage: 16, // Default 4x4 ft, can be calculated based on mounting height
      enabled: true
    }
    setFixtures([...fixtures, newFixture])
  }

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
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Lighting Design Studio
                  </h1>
                  <p className="text-gray-400 text-sm">Create and optimize your grow room layout</p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all">
                  <FolderOpen className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all">
                  <Save className="w-5 h-5 text-gray-300" />
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  Export Design
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Tools */}
          <div className="w-64 bg-gray-900/90 backdrop-blur-xl border-r border-gray-800 p-4 space-y-4 overflow-y-auto">
            {/* Room Configuration */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Square className="w-4 h-4 text-purple-400" />
                Room Setup
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Shape</label>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {[
                      { shape: 'rectangle', icon: Square },
                      { shape: 'square', icon: Square },
                      { shape: 'circle', icon: Circle },
                      { shape: 'polygon', icon: Pentagon }
                    ].map(({ shape, icon: Icon }) => (
                      <button
                        key={shape}
                        onClick={() => setRoom({...room, shape: shape as any})}
                        className={`p-2 rounded-lg transition-all ${
                          room.shape === shape 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Width (ft)</label>
                    <input
                      type="number"
                      value={room.width}
                      onChange={(e) => setRoom({...room, width: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height (ft)</label>
                    <input
                      type="number"
                      value={room.height}
                      onChange={(e) => setRoom({...room, height: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Mounting Height (ft)</label>
                  <input
                    type="number"
                    value={room.mountingHeight}
                    onChange={(e) => setRoom({...room, mountingHeight: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fixture Library */}
            <FixtureLibrary 
              onSelectFixture={setSelectedFixtureModel}
              selectedFixtureId={selectedFixtureModel?.id}
            />

            {/* Design Tools */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Design Tools</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDesignMode('place')}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    designMode === 'place' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Place</span>
                </button>
                <button
                  onClick={() => setDesignMode('move')}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    designMode === 'move' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Move className="w-5 h-5" />
                  <span className="text-xs">Move</span>
                </button>
                <button
                  onClick={() => setDesignMode('rotate')}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    designMode === 'rotate' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="text-xs">Rotate</span>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setGridEnabled(!gridEnabled)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Grid Snap
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    gridEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      gridEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowPARMap(!showPARMap)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    {showPARMap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    PAR Map
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showPARMap ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showPARMap ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Targets */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Lighting Targets
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Target PPFD</label>
                  <input
                    type="number"
                    value={room.targetPPFD}
                    onChange={(e) => setRoom({...room, targetPPFD: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Target DLI</label>
                  <input
                    type="number"
                    value={room.targetDLI}
                    onChange={(e) => setRoom({...room, targetDLI: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Photoperiod (hrs)</label>
                  <input
                    type="number"
                    value={room.photoperiod}
                    onChange={(e) => setRoom({...room, photoperiod: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-950 p-8">
            <div className="h-full flex items-center justify-center">
              <div 
                className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                style={{
                  width: `${room.width * 50}px`,
                  height: `${room.height * 50}px`,
                  maxWidth: '90%',
                  maxHeight: '90%'
                }}
                onClick={(e) => {
                  if (designMode === 'place') {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    addFixture(x, y)
                  }
                }}
              >
                {/* Grid */}
                {gridEnabled && (
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: Math.ceil(room.width) }, (_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-gray-600"
                        style={{ left: `${(i / room.width) * 100}%` }}
                      />
                    ))}
                    {Array.from({ length: Math.ceil(room.height) }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-gray-600"
                        style={{ top: `${(i / room.height) * 100}%` }}
                      />
                    ))}
                  </div>
                )}

                {/* PAR Map Overlay */}
                {showPARMap && fixtures.length > 0 && (
                  <div className="absolute inset-0 opacity-60 pointer-events-none">
                    <div className="w-full h-full bg-gradient-radial from-yellow-500/50 via-green-500/30 to-transparent" />
                  </div>
                )}

                {/* Fixtures */}
                {fixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                      selectedFixture === fixture.id ? 'scale-110' : ''
                    }`}
                    style={{
                      left: `${fixture.x}%`,
                      top: `${fixture.y}%`,
                      transform: `translate(-50%, -50%) rotate(${fixture.rotation}deg)`
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFixture(fixture.id)
                    }}
                  >
                    <div className={`relative w-full h-full rounded-lg ${
                      fixture.enabled 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50' 
                        : 'bg-gray-600'
                    }`}>
                      <Zap className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    {selectedFixture === fixture.id && (
                      <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-pulse" />
                    )}
                  </div>
                ))}

                {/* Room label */}
                <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-lg border border-gray-700">
                  <p className="text-white text-sm font-medium">
                    {room.width} × {room.height} ft
                  </p>
                </div>
              </div>
            </div>

            {/* Floating metrics panel */}
            <div className="absolute bottom-8 right-8 bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-700 p-6 space-y-4">
              <h3 className="text-white font-semibold">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Fixtures</p>
                  <p className="text-2xl font-bold text-white">{fixtures.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Power</p>
                  <p className="text-2xl font-bold text-white">{totalPower}W</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Avg PPFD</p>
                  <p className="text-2xl font-bold text-white">{averagePPFD.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Uniformity</p>
                  <p className="text-2xl font-bold text-white">{(calculateUniformity() * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Coverage</span>
                  <span className="text-white font-medium">
                    {fixtures.reduce((sum, f) => sum + f.coverage, 0)} ft²
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">W/ft²</span>
                  <span className="text-white font-medium">
                    {(totalPower / (room.width * room.height)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Fixture Properties */}
          {selectedFixture && (
            <div className="w-80 bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 p-4">
              <h3 className="text-white font-semibold mb-4">Fixture Properties</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Model</p>
                  <p className="text-white font-medium">Generic 600W LED</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs">PPF</p>
                    <p className="text-white font-medium">1620 μmol/s</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs">Wattage</p>
                    <p className="text-white font-medium">600W</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">X Position (%)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.x || 0}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, x: Number(e.target.value)} : f
                        ))
                      }}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Y Position (%)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.y || 0}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, y: Number(e.target.value)} : f
                        ))
                      }}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Rotation (°)</label>
                    <input
                      type="number"
                      value={fixtures.find(f => f.id === selectedFixture)?.rotation || 0}
                      onChange={(e) => {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, rotation: Number(e.target.value)} : f
                        ))
                      }}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button 
                    onClick={() => {
                      const fixture = fixtures.find(f => f.id === selectedFixture)
                      if (fixture) {
                        setFixtures(fixtures.map(f => 
                          f.id === selectedFixture ? {...f, enabled: !f.enabled} : f
                        ))
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all"
                  >
                    {fixtures.find(f => f.id === selectedFixture)?.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => {
                      setFixtures(fixtures.filter(f => f.id !== selectedFixture))
                      setSelectedFixture(null)
                    }}
                    className="w-full px-4 py-2 bg-red-900/50 hover:bg-red-900/70 border border-red-800 rounded-lg text-red-400 transition-all"
                  >
                    Delete Fixture
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}