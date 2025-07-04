"use client"

import { useState, useEffect } from 'react'
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
  FolderOpen,
  BarChart3,
  Lock,
  Crown,
  FileText,
  Wind,
  Thermometer
} from 'lucide-react'
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary'
import { NotificationProvider, useNotifications } from '@/components/designer/context/NotificationContext'
import { ClimateIntegratedDesign } from '@/components/ClimateIntegratedDesign'

interface Room {
  width: number
  length: number
  height: number
  shape: 'rectangle' | 'square' | 'circle' | 'polygon'
  mountingHeight: number
  targetPPFD: number
  targetDLI: number
  photoperiod: number
  targetTemperature: number
  targetHumidity: number
  cropType: 'leafy' | 'fruiting' | 'herbs' | 'ornamental'
}

interface Fixture {
  id: string
  x: number
  y: number
  rotation: number
  model: string
  brand: string
  ppf: number
  wattage: number
  efficacy: number
  coverage: number
  enabled: boolean
  isDLC: boolean
  spectrum?: string
  dimmable?: boolean
}

function ClimateIntegratedDesignPageContent() {
  const { showNotification } = useNotifications()
  const [room, setRoom] = useState<Room>({
    width: 10,
    length: 10,
    height: 10,
    shape: 'rectangle',
    mountingHeight: 3,
    targetPPFD: 600,
    targetDLI: 20,
    photoperiod: 16,
    targetTemperature: 24,
    targetHumidity: 65,
    cropType: 'leafy'
  })

  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [selectedFixtureModel, setSelectedFixtureModel] = useState<FixtureModel | null>(null)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [showPARMap, setShowPARMap] = useState(true)
  const [designMode, setDesignMode] = useState<'place' | 'move' | 'rotate'>('place')
  const [showClimateIntegration, setShowClimateIntegration] = useState(true)

  // Calculate metrics
  const totalPower = fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
  const totalPPF = fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf : 0), 0)
  const averagePPFD = fixtures.length > 0 ? 
    fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf / f.coverage : 0), 0) / fixtures.length : 0
  const averageEfficacy = fixtures.filter(f => f.enabled).length > 0 ?
    fixtures.reduce((sum, f) => sum + (f.enabled ? f.efficacy : 0), 0) / fixtures.filter(f => f.enabled).length : 0

  // Prepare lighting data for climate integration
  const lightingData = {
    roomWidth: room.width,
    roomLength: room.length,
    roomHeight: room.height,
    totalLightingPower: totalPower,
    averagePPFD: averagePPFD,
    fixtureCount: fixtures.filter(f => f.enabled).length,
    operatingHours: room.photoperiod,
    targetTemperature: room.targetTemperature,
    targetHumidity: room.targetHumidity,
    cropType: room.cropType
  }

  // Add fixture
  const addFixture = (x: number, y: number) => {
    if (!selectedFixtureModel) {
      showNotification('warning', 'Please select a fixture model first')
      return
    }
    
    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      x,
      y,
      rotation: 0,
      model: selectedFixtureModel.model,
      brand: selectedFixtureModel.brand,
      ppf: selectedFixtureModel.ppf,
      wattage: selectedFixtureModel.wattage,
      efficacy: selectedFixtureModel.efficacy,
      coverage: selectedFixtureModel.coverage || 16, // Use actual coverage from DLC data
      enabled: true,
      isDLC: selectedFixtureModel.category === 'DLC Qualified',
      spectrum: selectedFixtureModel.spectrum,
      dimmable: selectedFixtureModel.dimmable
    }
    setFixtures([...fixtures, newFixture])
  }

  // Handle climate analysis updates
  const handleClimateUpdate = (results: any) => {
    // Could save results, trigger notifications, etc.
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-cyan-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl shadow-lg shadow-purple-500/20">
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Climate-Integrated Design Studio
                  </h1>
                  <p className="text-gray-400 text-sm">Lighting design with real-time environmental analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClimateIntegration(!showClimateIntegration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    showClimateIntegration
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  Climate Analysis
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
                    <label className="text-xs text-gray-400">Length (ft)</label>
                    <input
                      type="number"
                      value={room.length}
                      onChange={(e) => setRoom({...room, length: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Ceiling Height (ft)</label>
                  <input
                    type="number"
                    value={room.height}
                    onChange={(e) => setRoom({...room, height: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
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

            {/* Environmental Targets */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                Environmental Targets
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Temperature (°C)</label>
                  <input
                    type="number"
                    value={room.targetTemperature}
                    onChange={(e) => setRoom({...room, targetTemperature: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Humidity (%)</label>
                  <input
                    type="number"
                    value={room.targetHumidity}
                    onChange={(e) => setRoom({...room, targetHumidity: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Crop Type</label>
                  <select
                    value={room.cropType}
                    onChange={(e) => setRoom({...room, cropType: e.target.value as any})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="leafy">Leafy Greens</option>
                    <option value="fruiting">Fruiting Crops</option>
                    <option value="herbs">Herbs</option>
                    <option value="ornamental">Ornamental</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fixture Library */}
            <FixtureLibrary 
              onSelectFixture={setSelectedFixtureModel}
              selectedFixtureId={selectedFixtureModel?.id}
            />

            {/* DLC Info */}
            {selectedFixtureModel?.category === 'DLC Qualified' && (
              <div className="bg-blue-900/20 rounded-xl p-3 border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-blue-300 font-medium mb-1">DLC Qualified Product</p>
                    <p className="text-blue-400/80">This fixture meets DesignLights Consortium standards for efficiency and performance.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lighting Targets */}
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

            {/* Performance Metrics */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Fixtures</p>
                  <p className="text-xl font-bold text-white">{fixtures.length}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Power</p>
                  <p className="text-xl font-bold text-white">{totalPower}W</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Avg PPFD</p>
                  <p className="text-xl font-bold text-white">{averagePPFD.toFixed(0)}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Avg PPE</p>
                  <p className="text-xl font-bold text-white">
                    {averageEfficacy.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-950 p-8 overflow-y-auto">
            <div className="space-y-6">
              {/* Canvas */}
              <div className="flex items-center justify-center">
                <div 
                  className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    width: `${room.width * 40}px`,
                    height: `${room.length * 40}px`,
                    maxWidth: '600px',
                    maxHeight: '600px'
                  }}
                  onClick={(e) => {
                    if (designMode === 'place') {
                      const rect = e.currentTarget.getBoundingClientRect()
                      let x = ((e.clientX - rect.left) / rect.width) * 100
                      let y = ((e.clientY - rect.top) / rect.height) * 100
                      
                      // Apply grid snap if enabled
                      if (gridEnabled) {
                        const gridSizeX = 100 / room.width
                        const gridSizeY = 100 / room.length
                        x = Math.round(x / gridSizeX) * gridSizeX
                        y = Math.round(y / gridSizeY) * gridSizeY
                      }
                      
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
                      {Array.from({ length: Math.ceil(room.length) }, (_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute left-0 right-0 h-px bg-gray-600"
                          style={{ top: `${(i / room.length) * 100}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Fixtures */}
                  {fixtures.map((fixture) => (
                    <div
                      key={fixture.id}
                      className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
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
                          ? fixture.isDLC 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50' 
                            : 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50'
                          : 'bg-gray-600'
                      }`}>
                        <Zap className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        {fixture.isDLC && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" title="DLC Qualified" />
                        )}
                      </div>
                      {selectedFixture === fixture.id && (
                        <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-pulse" />
                      )}
                    </div>
                  ))}

                  {/* Room label */}
                  <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur px-2 py-1 rounded-lg border border-gray-700">
                    <p className="text-white text-xs font-medium">
                      {room.width} × {room.length} ft
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded" />
                        <span className="text-gray-300">DLC Qualified</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded" />
                        <span className="text-gray-300">Standard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Climate Integration Panel */}
              {showClimateIntegration && (
                <ClimateIntegratedDesign 
                  lightingData={lightingData}
                  onClimateUpdate={handleClimateUpdate}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar - Fixture Properties */}
          {selectedFixture && (
            <div className="w-64 bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 p-4">
              <h3 className="text-white font-semibold mb-4">Fixture Properties</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Brand</p>
                      <p className="text-white font-medium text-sm">
                        {fixtures.find(f => f.id === selectedFixture)?.brand || 'Unknown'}
                      </p>
                    </div>
                    {fixtures.find(f => f.id === selectedFixture)?.isDLC && (
                      <div className="px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/50">
                        <p className="text-blue-400 text-xs font-medium">DLC</p>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-1 mt-3">Model</p>
                  <p className="text-white font-medium text-sm">
                    {fixtures.find(f => f.id === selectedFixture)?.model || 'Unknown'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                    <p className="text-gray-400 text-xs">PPF</p>
                    <p className="text-white font-medium text-sm">
                      {fixtures.find(f => f.id === selectedFixture)?.ppf} μmol/s
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                    <p className="text-gray-400 text-xs">Wattage</p>
                    <p className="text-white font-medium text-sm">
                      {fixtures.find(f => f.id === selectedFixture)?.wattage}W
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                    <p className="text-gray-400 text-xs">Efficacy</p>
                    <p className="text-white font-medium text-sm">
                      {fixtures.find(f => f.id === selectedFixture)?.efficacy.toFixed(2)} μmol/J
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                    <p className="text-gray-400 text-xs">Coverage</p>
                    <p className="text-white font-medium text-sm">
                      {fixtures.find(f => f.id === selectedFixture)?.coverage} ft²
                    </p>
                  </div>
                </div>

                {fixtures.find(f => f.id === selectedFixture)?.spectrum && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">Spectrum</p>
                    <p className="text-white font-medium text-sm">
                      {fixtures.find(f => f.id === selectedFixture)?.spectrum}
                    </p>
                  </div>
                )}

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
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
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
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
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
                    className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white transition-all text-sm"
                  >
                    {fixtures.find(f => f.id === selectedFixture)?.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => {
                      setFixtures(fixtures.filter(f => f.id !== selectedFixture))
                      setSelectedFixture(null)
                    }}
                    className="w-full px-3 py-2 bg-red-900/50 hover:bg-red-900/70 border border-red-800 rounded text-red-400 transition-all text-sm"
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

export default function ClimateIntegratedDesignPage() {
  return (
    <NotificationProvider>
      <ClimateIntegratedDesignPageContent />
    </NotificationProvider>
  )
}