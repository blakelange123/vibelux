"use client"

import { useState, useEffect, useMemo } from 'react'
import { 
  Maximize2, 
  Square, 
  Circle, 
  Pentagon,
  Plus,
  Move,
  RotateCw,
  Download,
  Settings,
  Grid,
  Zap,
  Eye,
  EyeOff,
  Layers,
  Save,
  FolderOpen,
  Sparkles,
  Copy,
  Trash2,
  Sun,
  Move3D,
  BarChart3,
  Leaf,
  Thermometer,
  SunDim,
  Package,
  Brain,
  TrendingUp,
  Calendar,
  Droplets,
  TrendingDown,
  Palette,
  Sunrise,
  Flame,
  Activity
} from 'lucide-react'
import { HeatMapCanvas } from '@/components/HeatMapCanvas'
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary'
import { IESUploader } from '@/components/IESUploader'
import { MetricsPanel } from '@/components/MetricsPanel'
import { SpectrumAnalysisPanel } from '@/components/SpectrumAnalysisPanel'
import { MultiLayerCanopyPanel } from '@/components/MultiLayerCanopyPanel'
import { DLIOptimizerPanel } from '@/components/DLIOptimizerPanel'
import { MultiCropBalancer } from '@/components/MultiCropBalancer'
import { EnergyCostCalculator } from '@/components/EnergyCostCalculator'
import { MaintenanceScheduler } from '@/components/MaintenanceScheduler'
import { EnvironmentalMonitor } from '@/components/EnvironmentalMonitor'
import ShadowObstructionMapper from '@/components/ShadowObstructionMapper'
import ShadowMapVisualization from '@/components/ShadowMapVisualization'
import ThreeDExportPanel from '@/components/ThreeDExportPanel'
import { AISpectrumRecommendations } from '@/components/AISpectrumRecommendations'
import { Simple3DView } from '@/components/Simple3DView'
import { CropYieldPredictor } from '@/components/CropYieldPredictor'
import { LightingScheduler } from '@/components/LightingScheduler'
import { EnergyMonitoringDashboard } from '@/components/EnergyMonitoringDashboard'
import WaterNutrientManager from '@/components/WaterNutrientManager'
import PeakHourSpectrumOptimizer from '@/components/PeakHourSpectrumOptimizer'
import { CustomSpectrumDesigner } from '@/components/CustomSpectrumDesigner'
import PhotoperiodScheduler from '@/components/PhotoperiodScheduler'
import { HeatLoadCalculator } from '@/components/HeatLoadCalculator'
import SensorDashboard from '@/components/SensorDashboard'
import ThermalImageViewer from '@/components/ThermalImageViewer'
// Removed non-essential component imports that were causing build errors
import { ElectricalLoadBalancer } from '@/components/ElectricalLoadBalancer'
// import ThreeDPPFDViewer from '@/components/ThreeDPPFDViewer'
import {
  calculatePPFDGrid,
  calculateUniformity,
  calculateCoverage,
  generateOptimalLayout,
  calculatePowerMetrics,
  exportDesign,
  type LightSource
} from '@/lib/lighting-design'
import { generateIESPhotometry } from '@/lib/ies-generator'
import type { DLCFixture } from '@/lib/fixtures-data'
import type { ParsedIESFile } from '@/lib/ies-parser'

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
  model: FixtureModel
  enabled: boolean
  assignedLayer?: string // Which canopy layer this fixture is assigned to
}

interface CanopyLayer {
  id: string
  name: string
  height: number
  visible: boolean
  enabled: boolean
  targetPPFD: number
  cropType: string
  canopyDensity: number
  transmittance: number
  color: string
}

export default function AdvancedLightingDesignPage() {
  const [room, setRoom] = useState<Room>({
    width: 10,
    height: 10,
    shape: 'rectangle',
    mountingHeight: 3,
    targetPPFD: 600,
    targetDLI: 20,
    photoperiod: 16
  })

  // Validate room dimensions to prevent errors
  const safeRoom = {
    ...room,
    width: room.width || 10,
    height: room.height || 10,
    mountingHeight: room.mountingHeight || 3,
    targetPPFD: room.targetPPFD || 600,
    targetDLI: room.targetDLI || 20,
    photoperiod: room.photoperiod || 16
  }

  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [selectedFixtureModel, setSelectedFixtureModel] = useState<FixtureModel | null>(null)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [showPARMap, setShowPARMap] = useState(true)
  const [designMode, setDesignMode] = useState<'place' | 'move' | 'rotate'>('place')
  const [ppfdGrid, setPpfdGrid] = useState<any[]>([])
  const [colorScale, setColorScale] = useState<'viridis' | 'heat' | 'grayscale'>('viridis')
  const [targetCrop, setTargetCrop] = useState<'lettuce' | 'tomato' | 'cannabis' | 'herbs' | 'strawberry' | 'cucumber' | 'custom'>('lettuce')
  const [showSpectrumAnalysis, setShowSpectrumAnalysis] = useState(true)
  const [canopyLayers, setCanopyLayers] = useState<CanopyLayer[]>([
    {
      id: 'layer-ground',
      name: 'Ground Level',
      height: 0,
      visible: true,
      enabled: true,
      targetPPFD: 600,
      cropType: 'Lettuce',
      canopyDensity: 80,
      transmittance: 0,
      color: '#10B981'
    }
  ])
  const [showMultiLayer, setShowMultiLayer] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [showDLIOptimizer, setShowDLIOptimizer] = useState(true)
  const [growthStage, setGrowthStage] = useState<'seedling' | 'vegetative' | 'flowering' | 'fruiting'>('vegetative')
  const [optimizedPPFD, setOptimizedPPFD] = useState<number>(600)
  const [optimizedPhotoperiod, setOptimizedPhotoperiod] = useState<number>(16)
  const [show3D, setShow3D] = useState(false)
  const [view3DMode, setView3DMode] = useState(false)
  const [customIESFixtures, setCustomIESFixtures] = useState<FixtureModel[]>([])
  const [showMultiCropBalancer, setShowMultiCropBalancer] = useState(false)
  const [showEnergyCostCalculator, setShowEnergyCostCalculator] = useState(false)
  const [showMaintenanceScheduler, setShowMaintenanceScheduler] = useState(false)
  const [showEnvironmentalMonitor, setShowEnvironmentalMonitor] = useState(false)
  const [environmentalAlerts, setEnvironmentalAlerts] = useState<any[]>([])
  const [showShadowMapper, setShowShadowMapper] = useState(false)
  const [obstructions, setObstructions] = useState<any[]>([])
  const [shadowMap, setShadowMap] = useState<any[]>([])
  const [show3DExport, setShow3DExport] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(true)
  const [showCropYieldPredictor, setShowCropYieldPredictor] = useState(false)
  const [showLightingScheduler, setShowLightingScheduler] = useState(false)
  const [showEnergyMonitoring, setShowEnergyMonitoring] = useState(false)
  const [showWaterNutrientManager, setShowWaterNutrientManager] = useState(false)
  const [showPeakHourOptimizer, setShowPeakHourOptimizer] = useState(false)
  const [showCustomSpectrumDesigner, setShowCustomSpectrumDesigner] = useState(false)
  const [showPhotoperiodScheduler, setShowPhotoperiodScheduler] = useState(false)
  const [showHeatLoadCalculator, setShowHeatLoadCalculator] = useState(false)
  const [showSensorDashboard, setShowSensorDashboard] = useState(false)
  const [latestThermalReading, setLatestThermalReading] = useState<any>(null)
  const [showElectricalLoadBalancer, setShowElectricalLoadBalancer] = useState(false)

  // Calculate PPFD grid when fixtures or room changes
  useEffect(() => {
    const lightSources: LightSource[] = fixtures.map(f => {
      // Create mock DLC fixture data for IES generation
      const mockDLCFixture: DLCFixture = {
        id: parseInt(f.id.replace(/\D/g, '')) || 1,
        manufacturer: f.model.brand,
        brand: f.model.brand,
        productName: f.model.model,
        modelNumber: f.model.model,
        dateQualified: new Date().toISOString(),
        reportedPPE: f.model.efficacy,
        reportedPPF: f.model.ppf,
        reportedWattage: f.model.wattage,
        testedPPE: f.model.efficacy,
        testedPPF: f.model.ppf,
        testedWattage: f.model.wattage,
        minVoltage: 100,
        maxVoltage: 277,
        powerType: 'AC',
        powerFactor: 0.9,
        dimmable: true,
        spectrallyTunable: false,
        // Estimate dimensions based on coverage area
        width: Math.sqrt(f.model.coverage) * 0.8,
        height: 0.1, // Typical LED panel thickness
        length: Math.sqrt(f.model.coverage) * 1.2,
        warranty: 5,
        // Convert spectrum percentages to flux values
        blueFlux: f.model.ppf * (f.model.spectrumData.blue / 100),
        greenFlux: f.model.ppf * (f.model.spectrumData.green / 100),
        redFlux: f.model.ppf * (f.model.spectrumData.red / 100),
        farRedFlux: f.model.ppf * (f.model.spectrumData.farRed / 100),
        dimming010V: true,
        dimmingDALI: false,
        dimmingPWM: false,
        dimmingResistance: false
      }

      return {
        position: { x: f.x, y: f.y },
        ppf: f.model.ppf,
        beamAngle: 120, // Default - will be overridden by IES data
        height: safeRoom.mountingHeight,
        enabled: f.enabled,
        fixture: mockDLCFixture,
        iesData: f.model.customIES?.photometry || generateIESPhotometry(mockDLCFixture)
      }
    })

    const grid = calculatePPFDGrid(lightSources, safeRoom, 30)
    setPpfdGrid(grid)
  }, [fixtures, room])

  // Calculate metrics
  const uniformity = calculateUniformity(ppfdGrid)
  const coverage = calculateCoverage(ppfdGrid, safeRoom.targetPPFD * 0.8, safeRoom.width * safeRoom.height)
  const averagePPFD = ppfdGrid.length > 0 
    ? ppfdGrid.reduce((sum, p) => sum + p.ppfd, 0) / ppfdGrid.length 
    : 0

  const powerMetrics = calculatePowerMetrics(
    fixtures.map(f => ({ wattage: f.model.wattage, enabled: f.enabled })),
    safeRoom.width * safeRoom.height,
    safeRoom.photoperiod,
    0.12
  )

  // Calculate spectrum fixtures for analysis
  const spectrumFixtures = useMemo(() => {
    const totalPPF = fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.ppf : 0), 0)
    
    return fixtures.map(f => ({
      id: f.id,
      name: `${f.model.brand} ${f.model.model}`,
      brand: f.model.brand,
      model: f.model.model,
      wattage: f.model.wattage,
      enabled: f.enabled,
      spectrumData: f.model.spectrumData,
      ppf: f.model.ppf,
      weight: f.enabled && totalPPF > 0 ? f.model.ppf / totalPPF : 0
    }))
  }, [fixtures])

  // Transform data for 3D visualization
  const ppfd3DData = useMemo(() => {
    return ppfdGrid.map(point => ({
      x: point.x || 0,
      y: point.y || 0,
      z: 0, // Ground level for now
      ppfd: point.ppfd || 0,
      uniformity: point.uniformity || 0
    }))
  }, [ppfdGrid])

  const fixtures3D = useMemo(() => {
    return fixtures.map(f => ({
      id: f.id,
      x: (f.x / 100) * safeRoom.width,
      y: (f.y / 100) * safeRoom.height,
      z: safeRoom.mountingHeight,
      ppf: f.model.ppf,
      beamAngle: 120, // Default beam angle
      enabled: f.enabled,
      color: '#FFD700'
    }))
  }, [fixtures, room])

  const layers3D = useMemo(() => {
    return canopyLayers
      .filter(layer => layer.visible)
      .map(layer => ({
        height: layer.height,
        visible: layer.visible,
        color: layer.color
      }))
  }, [canopyLayers])

  // Add fixture
  const addFixture = (x: number, y: number) => {
    if (!selectedFixtureModel) {
      alert('Please select a fixture model from the library first')
      return
    }

    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      x,
      y,
      rotation: 0,
      model: selectedFixtureModel,
      enabled: true
    }
    setFixtures([...fixtures, newFixture])
  }

  // Auto-generate optimal layout
  const autoGenerateLayout = () => {
    if (!selectedFixtureModel) {
      alert('Please select a fixture model from the library first')
      return
    }

    const positions = generateOptimalLayout(
      safeRoom,
      safeRoom.targetPPFD,
      { ppf: selectedFixtureModel.ppf, coverage: selectedFixtureModel.coverage }
    )

    const newFixtures = positions.map((pos, index) => ({
      id: `fixture-auto-${Date.now()}-${index}`,
      x: pos.x,
      y: pos.y,
      rotation: 0,
      model: selectedFixtureModel,
      enabled: true
    }))

    setFixtures(newFixtures)
  }

  // Handle custom IES upload
  const handleIESUpload = (iesData: ParsedIESFile) => {
    const customFixture: FixtureModel = {
      id: `custom-ies-${Date.now()}`,
      brand: iesData.header.manufacturer || 'Custom',
      model: iesData.header.luminaire || iesData.header.filename || 'Uploaded IES',
      category: 'Custom IES',
      wattage: 100, // Default - user can modify
      ppf: Math.round(iesData.photometry.totalLumens * 4.54), // Convert lumens to PPF
      efficacy: 2.5, // Default
      spectrum: 'Custom',
      spectrumData: {
        blue: 20,   // Default spectrum distribution
        green: 10,
        red: 65,
        farRed: 5
      },
      coverage: iesData.metadata.luminousWidth * iesData.metadata.luminousLength * 10.764, // Convert m² to ft²
      customIES: {
        parsedData: iesData,
        photometry: iesData.photometry
      }
    }

    setCustomIESFixtures(prev => [...prev, customFixture])
    setSelectedFixtureModel(customFixture)
  }

  // Export design
  const handleExport = () => {
    const design = exportDesign(safeRoom, fixtures, {
      uniformity,
      coverage,
      averagePPFD,
      powerMetrics
    })

    const blob = new Blob([design], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lighting-design-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    Advanced Lighting Design
                  </h1>
                  <p className="text-gray-400 text-sm">Professional grow room optimization</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView3DMode(!view3DMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    view3DMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Move3D className="w-4 h-4" />
                  {view3DMode ? 'Close 3D' : 'View 3D'}
                </button>
                <button 
                  onClick={autoGenerateLayout}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Auto Layout
                </button>
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button 
                  onClick={() => setShow3DExport(!show3DExport)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    show3DExport
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  3D Export
                </button>
                <button
                  onClick={() => setShowElectricalLoadBalancer(!showElectricalLoadBalancer)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    showElectricalLoadBalancer
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/25'
                      : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Electrical
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Main Content Area */}
          <div className="flex flex-1">
            {/* Main Canvas Area */}
            <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-950 p-8">
              <div className="h-full flex items-center justify-center">
                <div 
                  className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden cursor-crosshair"
                  style={{
                    width: `${safeRoom.width * 50}px`,
                    height: `${safeRoom.height * 50}px`,
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
                  {/* Heat Map */}
                  {showPARMap && ppfdGrid.length > 0 && !showShadowMapper && (
                    <HeatMapCanvas
                      grid={ppfdGrid}
                      width={safeRoom.width * 50}
                      height={safeRoom.height * 50}
                      minPPFD={0}
                      maxPPFD={safeRoom.targetPPFD * 1.5}
                      colorScale={colorScale}
                    />
                  )}

                  {/* Shadow Map Visualization */}
                  {showShadowMapper && shadowMap.length > 0 && (
                    <div className="absolute inset-0">
                      <ShadowMapVisualization
                        width={safeRoom.width * 50}
                        height={safeRoom.height * 50}
                        shadowMap={shadowMap}
                        obstructions={obstructions}
                        showObstructions={true}
                        highlightSevere={true}
                        viewMode="top"
                        roomDimensions={{ 
                          width: safeRoom.width, 
                          height: safeRoom.height,
                          depth: safeRoom.mountingHeight 
                        }}
                      />
                    </div>
                  )}

                  {/* 3D View */}
                  {view3DMode && (
                    <div className="absolute inset-0 bg-gray-900">
                      <Simple3DView
                        fixtures={fixtures.map(f => ({
                          id: f.id,
                          x: f.x,
                          y: f.y,
                          z: safeRoom.mountingHeight,
                          enabled: f.enabled
                        }))}
                        roomDimensions={{
                          width: safeRoom.width,
                          height: safeRoom.height,
                          depth: safeRoom.mountingHeight
                        }}
                      />
                    </div>
                  )}

                  {/* Fixtures */}
                  {!view3DMode && fixtures.map(fixture => (
                    <div
                      key={fixture.id}
                      className={`absolute w-8 h-8 transition-all duration-200 cursor-pointer ${
                        selectedFixture === fixture.id ? 'z-20' : 'z-10'
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
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                          {fixture.model.model}
                        </div>
                      </div>
                      {selectedFixture === fixture.id && (
                        <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-pulse" />
                      )}
                    </div>
                  ))}

                  {/* Room dimensions overlay */}
                  <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-lg border border-gray-700">
                    <p className="text-white text-sm font-medium">
                      {safeRoom.width} × {safeRoom.height} ft
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Metrics (Made Larger) */}
            <div className="w-[600px] bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 p-4 overflow-y-auto">
              {/* Environmental Alerts Notification */}
              {environmentalAlerts.length > 0 && (
                <div className="mb-4 bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                  <p className="text-sm text-red-400 font-medium">
                    ⚠️ {environmentalAlerts.length} Environmental Alert{environmentalAlerts.length > 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setShowEnvironmentalMonitor(true)}
                    className="text-xs text-red-300 hover:text-red-200 mt-1"
                  >
                    View Environmental Monitor →
                  </button>
                </div>
              )}

              <MetricsPanel
                fixtureCount={fixtures.length}
                totalPower={fixtures.reduce((sum, f) => sum + f.model.wattage, 0)}
                averagePPFD={averagePPFD}
                uniformity={uniformity}
                coverage={coverage}
                roomArea={safeRoom.width * safeRoom.height}
                targetPPFD={safeRoom.targetPPFD}
                powerCost={{
                  daily: powerMetrics.dailyCost,
                  monthly: powerMetrics.monthlyCost,
                  yearly: powerMetrics.yearlyCost
                }}
              />
            </div>
          </div>

          {/* Bottom Sidebar - Controls (Moved from Left) */}
          <div className="h-64 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 p-4 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4 h-full">
              {/* Fixture Library */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Fixture Library</h3>
                <FixtureLibrary 
                  onSelectFixture={setSelectedFixtureModel}
                  selectedFixtureId={selectedFixtureModel?.id}
                  customFixtures={customIESFixtures}
                />
              </div>

              {/* Room Settings */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Room Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400">Width (ft)</label>
                    <input
                      type="number"
                      value={room.width}
                      onChange={(e) => setRoom({...room, width: Number(e.target.value)})}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height (ft)</label>
                    <input
                      type="number"
                      value={room.height}
                      onChange={(e) => setRoom({...room, height: Number(e.target.value)})}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Design Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Design Mode</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDesignMode('place')}
                    className={`px-3 py-2 rounded-lg font-medium transition-all text-xs ${
                      designMode === 'place'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Plus className="w-3 h-3 mx-auto mb-1" />
                    Place
                  </button>
                  <button
                    onClick={() => setDesignMode('move')}
                    className={`px-3 py-2 rounded-lg font-medium transition-all text-xs ${
                      designMode === 'move'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Move className="w-3 h-3 mx-auto mb-1" />
                    Move
                  </button>
                </div>
              </div>

              {/* Analysis Tools */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Analysis Tools</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setShowPARMap(!showPARMap)}
                    className="w-full flex items-center justify-between px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-all text-xs"
                  >
                    <span className="text-gray-300 flex items-center gap-1">
                      <Grid className="w-3 h-3" />
                      PAR Map
                    </span>
                    <div className={`w-6 h-3 rounded-full transition-all ${
                      showPARMap ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all ${
                        showPARMap ? 'translate-x-3' : 'translate-x-0.5'
                      } transform mt-0.25`} />
                    </div>
                  </button>
                  <button
                    onClick={() => setShowSpectrumAnalysis(!showSpectrumAnalysis)}
                    className="w-full flex items-center justify-between px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-all text-xs"
                  >
                    <span className="text-gray-300 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      Spectrum
                    </span>
                    <div className={`w-6 h-3 rounded-full transition-all ${
                      showSpectrumAnalysis ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all ${
                        showSpectrumAnalysis ? 'translate-x-3' : 'translate-x-0.5'
                      } transform mt-0.25`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panels - moved below main content */}
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto p-4 space-y-4">

            {/* IES File Upload */}
            <IESUploader 
              onIESUploaded={handleIESUpload}
            />

            {/* Room Configuration */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Square className="w-4 h-4" />
                Room Configuration
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
                    step="0.5"
                    value={room.mountingHeight}
                    onChange={(e) => setRoom({...room, mountingHeight: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">Target PPFD</label>
                  <input
                    type="number"
                    value={room.targetPPFD}
                    onChange={(e) => setRoom({...room, targetPPFD: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Design Tools */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Design Tools</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
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

              {/* Visualization Options */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowPARMap(!showPARMap)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    {showPARMap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Heat Map
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showPARMap ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showPARMap ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                {showPARMap && (
                  <div className="pl-6 space-y-2">
                    <label className="text-xs text-gray-400">Color Scale</label>
                    <select
                      value={colorScale}
                      onChange={(e) => setColorScale(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="viridis">Viridis</option>
                      <option value="heat">Heat</option>
                      <option value="grayscale">Grayscale</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setShowSpectrumAnalysis(!showSpectrumAnalysis)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Spectrum Analysis
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showSpectrumAnalysis ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showSpectrumAnalysis ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowAIRecommendations(!showAIRecommendations)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Recommendations
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showAIRecommendations ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showAIRecommendations ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowCustomSpectrumDesigner(!showCustomSpectrumDesigner)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Spectrum Designer
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showCustomSpectrumDesigner ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showCustomSpectrumDesigner ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowMultiLayer(!showMultiLayer)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Multi-Layer Mode
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showMultiLayer ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showMultiLayer ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowDLIOptimizer(!showDLIOptimizer)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    DLI Optimizer
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showDLIOptimizer ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showDLIOptimizer ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowMultiCropBalancer(!showMultiCropBalancer)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Multi-Crop Balancer
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showMultiCropBalancer ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showMultiCropBalancer ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowCropYieldPredictor(!showCropYieldPredictor)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Crop Yield Predictor
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showCropYieldPredictor ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showCropYieldPredictor ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowLightingScheduler(!showLightingScheduler)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Lighting Scheduler
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showLightingScheduler ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showLightingScheduler ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowPhotoperiodScheduler(!showPhotoperiodScheduler)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Sunrise className="w-4 h-4" />
                    Photoperiod Control
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showPhotoperiodScheduler ? 'bg-orange-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showPhotoperiodScheduler ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowWaterNutrientManager(!showWaterNutrientManager)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Water & Nutrients
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showWaterNutrientManager ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showWaterNutrientManager ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowEnvironmentalMonitor(!showEnvironmentalMonitor)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Environmental Monitor
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showEnvironmentalMonitor ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showEnvironmentalMonitor ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowShadowMapper(!showShadowMapper)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <SunDim className="w-4 h-4" />
                    Shadow Mapping
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showShadowMapper ? 'bg-gray-500' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showShadowMapper ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowPeakHourOptimizer(!showPeakHourOptimizer)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Peak Hour Optimizer
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showPeakHourOptimizer ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showPeakHourOptimizer ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowHeatLoadCalculator(!showHeatLoadCalculator)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    HVAC Calculator
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showHeatLoadCalculator ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showHeatLoadCalculator ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowElectricalLoadBalancer(!showElectricalLoadBalancer)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Electrical Load Balancing
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showElectricalLoadBalancer ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showElectricalLoadBalancer ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowSensorDashboard(!showSensorDashboard)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Sensor Integration
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all ${
                    showSensorDashboard ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                      showSensorDashboard ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Crop Optimization */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Crop Optimization</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Target Crop</label>
                  <select
                    value={targetCrop}
                    onChange={(e) => setTargetCrop(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="lettuce">Lettuce & Leafy Greens</option>
                    <option value="tomato">Tomato</option>
                    <option value="cannabis">Cannabis</option>
                    <option value="herbs">Herbs (Basil, Cilantro)</option>
                    <option value="strawberry">Strawberry</option>
                    <option value="cucumber">Cucumber</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="seedling">Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="fruiting">Fruiting</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Multi-Layer Canopy */}
            {showMultiLayer && (
              <MultiLayerCanopyPanel
                layers={canopyLayers}
                onLayersChange={setCanopyLayers}
                maxHeight={safeRoom.mountingHeight}
              />
            )}

            {/* Shadow & Obstruction Mapper */}
            {showShadowMapper && (
              <ShadowObstructionMapper
                roomDimensions={{ 
                  width: safeRoom.width, 
                  height: safeRoom.height, 
                  depth: safeRoom.mountingHeight 
                }}
                fixtures={fixtures.map(f => ({
                  id: f.id,
                  position: { 
                    x: (f.x / 100) * safeRoom.width, 
                    y: (f.y / 100) * safeRoom.height, 
                    z: safeRoom.mountingHeight 
                  },
                  beamAngle: 120,
                  intensity: f.model.ppf,
                  enabled: f.enabled
                }))}
                canopyHeight={canopyLayers[0]?.height || 0}
                onObstructionsChange={setObstructions}
                onShadowMapUpdate={setShadowMap}
              />
            )}
          </div>

          {/* Main Canvas */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-950 p-8">
            <div className="h-full flex items-center justify-center">
                <div 
                  className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden cursor-crosshair"
                  style={{
                    width: `${safeRoom.width * 50}px`,
                    height: `${safeRoom.height * 50}px`,
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
                  {/* Heat Map */}
                  {showPARMap && ppfdGrid.length > 0 && !showShadowMapper && (
                    <HeatMapCanvas
                      grid={ppfdGrid}
                      width={safeRoom.width * 50}
                      height={safeRoom.height * 50}
                      minPPFD={0}
                      maxPPFD={safeRoom.targetPPFD * 1.5}
                      colorScale={colorScale}
                    />
                  )}

                  {/* Shadow Map Visualization */}
                  {showShadowMapper && shadowMap.length > 0 && (
                    <div className="absolute inset-0">
                      <ShadowMapVisualization
                        width={safeRoom.width * 50}
                        height={safeRoom.height * 50}
                        shadowMap={shadowMap}
                        obstructions={obstructions}
                        showObstructions={true}
                        highlightSevere={true}
                        viewMode="top"
                        roomDimensions={{ 
                          width: safeRoom.width, 
                          height: safeRoom.height, 
                          depth: safeRoom.mountingHeight 
                        }}
                      />
                    </div>
                  )}

                  {/* Grid */}
                  {gridEnabled && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      {Array.from({ length: Math.ceil(safeRoom.width) }, (_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute top-0 bottom-0 w-px bg-gray-600"
                          style={{ left: `${(i / safeRoom.width) * 100}%` }}
                        />
                      ))}
                      {Array.from({ length: Math.ceil(safeRoom.height) }, (_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute left-0 right-0 h-px bg-gray-600"
                          style={{ top: `${(i / safeRoom.height) * 100}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Canopy Layers Visualization */}
                  {showMultiLayer && canopyLayers.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {canopyLayers
                        .filter(layer => layer.visible)
                        .map((layer) => (
                          <div
                            key={layer.id}
                            className="absolute inset-x-4 opacity-20 border-2 border-dashed rounded"
                            style={{
                              borderColor: layer.color,
                              backgroundColor: `${layer.color}20`,
                              height: '20px',
                              bottom: `${(layer.height / safeRoom.mountingHeight) * 100}%`,
                            }}
                          >
                            <div 
                              className="absolute -left-2 -top-6 text-xs font-medium px-2 py-1 rounded text-white"
                              style={{ backgroundColor: layer.color }}
                            >
                              {layer.name}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Fixtures */}
                  {fixtures.map((fixture) => (
                    <div
                      key={fixture.id}
                      className={`absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                        selectedFixture === fixture.id ? 'scale-110 z-10' : ''
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
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                          {fixture.model.model}
                        </div>
                      </div>
                      {selectedFixture === fixture.id && (
                        <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-pulse" />
                      )}
                    </div>
                  ))}

                  {/* Room dimensions overlay */}
                  <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-lg border border-gray-700">
                    <p className="text-white text-sm font-medium">
                      {safeRoom.width} × {safeRoom.height} ft
                    </p>
                  </div>
                </div>
              </div>
          </div>

          {/* Right Sidebar - Metrics */}
          <div className="w-96 bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 p-4 overflow-y-auto">
            {/* Environmental Alerts Notification */}
            {environmentalAlerts.length > 0 && (
              <div className="mb-4 bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                <p className="text-sm text-red-400 font-medium">
                  ⚠️ {environmentalAlerts.length} Environmental Alert{environmentalAlerts.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setShowEnvironmentalMonitor(true)}
                  className="text-xs text-red-300 hover:text-red-200 mt-1"
                >
                  View Environmental Monitor →
                </button>
              </div>
            )}
            
            <MetricsPanel
              fixtureCount={fixtures.length}
              totalPower={powerMetrics.totalPower}
              averagePPFD={averagePPFD}
              uniformity={uniformity}
              coverage={coverage}
              roomArea={safeRoom.width * safeRoom.height}
              targetPPFD={safeRoom.targetPPFD}
              powerCost={{
                daily: powerMetrics.dailyCost,
                monthly: powerMetrics.monthlyCost,
                yearly: powerMetrics.yearlyCost
              }}
              onShowEnergyCostCalculator={() => setShowEnergyCostCalculator(!showEnergyCostCalculator)}
              onShowMaintenanceScheduler={() => setShowMaintenanceScheduler(!showMaintenanceScheduler)}
              onShowEnergyMonitoring={() => setShowEnergyMonitoring(!showEnergyMonitoring)}
            />

            {/* Spectrum Analysis */}
            {showSpectrumAnalysis && fixtures.length > 0 && (
              <div className="mt-4">
                <SpectrumAnalysisPanel
                  fixtures={spectrumFixtures}
                  targetCrop={targetCrop}
                />
              </div>
            )}

            {/* AI Spectrum Recommendations */}
            {showAIRecommendations && fixtures.length > 0 && (
              <div className="mt-4">
                <AISpectrumRecommendations
                  currentSpectrum={(() => {
                    const totalPPF = fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.ppf : 0), 0)
                    let weighted = { blue: 0, green: 0, red: 0, farRed: 0 }
                    
                    fixtures.forEach(f => {
                      if (f.enabled && totalPPF > 0) {
                        const weight = f.model.ppf / totalPPF
                        weighted.blue += f.model.spectrumData.blue * weight
                        weighted.green += f.model.spectrumData.green * weight
                        weighted.red += f.model.spectrumData.red * weight
                        weighted.farRed += f.model.spectrumData.farRed * weight
                      }
                    })
                    
                    return weighted
                  })()}
                  targetCrop={targetCrop}
                  growthStage={growthStage}
                  environmentalData={environmentalAlerts.length > 0 ? {
                    temperature: 22,
                    humidity: 65,
                    co2: 1000
                  } : undefined}
                />
              </div>
            )}

            {/* Custom Spectrum Designer */}
            {showCustomSpectrumDesigner && (
              <div className="mt-4">
                <CustomSpectrumDesigner
                  onSpectrumChange={(spectrum) => {
                    console.log('Custom spectrum updated:', spectrum)
                  }}
                  onPresetSave={(preset) => {
                    console.log('Spectrum preset saved:', preset)
                  }}
                />
              </div>
            )}

            {/* DLI Optimizer */}
            {showDLIOptimizer && (
              <div className="mt-4">
                <DLIOptimizerPanel
                  currentPPFD={averagePPFD}
                  photoperiod={safeRoom.photoperiod}
                  selectedCrop={targetCrop}
                  growthStage={growthStage}
                  onOptimizationChange={(optimization) => {
                    setOptimizedPPFD(optimization.recommendedPPFD)
                    setOptimizedPhotoperiod(optimization.recommendedPhotoperiod)
                  }}
                />
              </div>
            )}

            {/* Multi-Crop Balancer */}
            {showMultiCropBalancer && (
              <div className="mt-4">
                <MultiCropBalancer
                  totalPPFD={fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.ppf : 0), 0)}
                  photoperiod={safeRoom.photoperiod}
                  roomArea={safeRoom.width * safeRoom.height}
                />
              </div>
            )}

            {/* Energy Cost Calculator */}
            {showEnergyCostCalculator && (
              <div className="mt-4">
                <EnergyCostCalculator
                  fixtures={fixtures.map(f => ({
                    wattage: f.model.wattage,
                    enabled: f.enabled
                  }))}
                  photoperiod={safeRoom.photoperiod}
                />
              </div>
            )}

            {/* Maintenance Scheduler */}
            {showMaintenanceScheduler && (
              <div className="mt-4">
                <MaintenanceScheduler
                  fixtures={fixtures.map((f, index) => ({
                    id: f.id,
                    name: `${f.model.brand} ${f.model.model}`,
                    wattage: f.model.wattage,
                    cost: f.model.price || f.model.wattage * 2
                  }))}
                  hoursPerDay={safeRoom.photoperiod}
                />
              </div>
            )}

            {/* Environmental Monitor */}
            {showEnvironmentalMonitor && (
              <div className="mt-4">
                <EnvironmentalMonitor
                  cropType={targetCrop}
                  growthStage={growthStage}
                  onAlertChange={setEnvironmentalAlerts}
                />
              </div>
            )}

            {/* Crop Yield Predictor */}
            {showCropYieldPredictor && (
              <div className="mt-4">
                <CropYieldPredictor
                  averagePPFD={averagePPFD}
                  photoperiod={safeRoom.photoperiod}
                  temperature={22}
                  humidity={60}
                  co2={1000}
                  spectrum={{
                    red: fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.spectrumData.red * f.model.ppf : 0), 0) / Math.max(1, fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.ppf : 0), 0)),
                    blue: fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.spectrumData.blue * f.model.ppf : 0), 0) / Math.max(1, fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.ppf : 0), 0)),
                    farRed: fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.spectrumData.farRed * f.model.ppf : 0), 0) / Math.max(1, fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.ppf : 0), 0))
                  }}
                  energyCostPerKWh={0.12}
                />
              </div>
            )}

            {/* Lighting Scheduler */}
            {showLightingScheduler && (
              <div className="mt-4">
                <LightingScheduler />
              </div>
            )}

            {/* Photoperiod Scheduler */}
            {showPhotoperiodScheduler && (
              <div className="mt-4">
                <PhotoperiodScheduler
                  defaultPhotoperiod={safeRoom.photoperiod}
                  cropType={targetCrop}
                  growthStage={growthStage}
                  onScheduleChange={(schedule) => {
                    console.log('Photoperiod schedule updated:', schedule)
                  }}
                />
              </div>
            )}

            {/* Energy Monitoring Dashboard */}
            {showEnergyMonitoring && (
              <div className="mt-4">
                <EnergyMonitoringDashboard />
              </div>
            )}

            {/* Water & Nutrient Manager */}
            {showWaterNutrientManager && (
              <div className="mt-4">
                <WaterNutrientManager
                  cropType={targetCrop}
                  growthStage={growthStage}
                  growArea={safeRoom.width * safeRoom.height * 0.092903} // Convert ft² to m²
                  temperature={22}
                  humidity={60}
                  lightIntensity={averagePPFD}
                  co2={1000}
                />
              </div>
            )}

            {/* Peak Hour Spectrum Optimizer */}
            {showPeakHourOptimizer && (
              <div className="mt-4">
                <PeakHourSpectrumOptimizer
                  fixtures={fixtures.map(f => ({
                    id: f.id,
                    name: `${f.model.brand} ${f.model.model}`,
                    wattage: f.model.wattage,
                    hasSpectralControl: f.model.brand.toLowerCase().includes('fluence') || 
                                       f.model.brand.toLowerCase().includes('heliospectra') ||
                                       f.model.model.toLowerCase().includes('spectrum') ||
                                       f.model.model.toLowerCase().includes('tunable'),
                    spectrumChannels: {
                      deepRed: 3.0,
                      red: 2.8,
                      blue: 2.5,
                      white: 2.3,
                      farRed: 2.7,
                      uv: 1.5
                    }
                  }))}
                  peakHours={{ start: 14, end: 21 }}
                  peakRate={0.15}
                  offPeakRate={0.10}
                  photoperiod={safeRoom.photoperiod}
                />
              </div>
            )}

            {/* Heat Load Calculator */}
            {showHeatLoadCalculator && (
              <div className="mt-4">
                <HeatLoadCalculator
                  roomDimensions={{
                    width: safeRoom.width,
                    height: safeRoom.height,
                    depth: safeRoom.mountingHeight
                  }}
                  fixtures={fixtures.map(f => ({
                    wattage: f.model.wattage,
                    enabled: f.enabled
                  }))}
                  targetTemperature={75}
                  outsideTemperature={95}
                />
              </div>
            )}

            {/* Electrical Load Balancer */}
            {showElectricalLoadBalancer && (
              <div className="mt-4">
                <ElectricalLoadBalancer
                  fixtures={fixtures.map(f => ({
                    id: f.id,
                    wattage: f.model.wattage,
                    voltage: 208, // Most commercial grow operations use 208V 3-phase
                    enabled: f.enabled
                  }))}
                  defaultVoltage={208}
                  onPanelConfigChange={(panels) => {
                    console.log('Electrical panel configuration:', panels);
                  }}
                />
              </div>
            )}

            {/* Sensor Dashboard */}
            {showSensorDashboard && (
              <div className="mt-4">
                <SensorDashboard
                  onSensorData={(sensorId, reading) => {
                    // Handle thermal camera data
                    if (sensorId === 'flir-1' && reading) {
                      setLatestThermalReading(reading)
                    }
                  }}
                />
              </div>
            )}

            {/* Thermal Image Viewer */}
            {latestThermalReading && showSensorDashboard && (
              <div className="mt-4">
                <ThermalImageViewer
                  reading={latestThermalReading}
                  onSpotSelect={(x, y, temp) => {
                    console.log(`Selected spot at (${x}, ${y}): ${temp}°C`)
                  }}
                />
              </div>
            )}

            {/* 3D Export Panel */}
            {show3DExport && (
              <div className="mt-4">
                <ThreeDExportPanel
                  roomDimensions={{
                    width: safeRoom.width,
                    height: safeRoom.height,
                    depth: safeRoom.mountingHeight
                  }}
                  fixtures={fixtures.map(f => ({
                    id: f.id,
                    position: {
                      x: (f.x / 100) * safeRoom.width,
                      y: (f.y / 100) * safeRoom.height,
                      z: safeRoom.mountingHeight
                    },
                    dimensions: {
                      width: Math.sqrt(f.model.coverage) * 0.8,
                      height: 0.5,
                      depth: Math.sqrt(f.model.coverage) * 1.2
                    },
                    model: f.model
                  }))}
                  obstructions={obstructions}
                />
              </div>
            )}

            {/* Selected Fixture Controls */}
            {selectedFixture && (
              <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-white font-semibold mb-3">Fixture Controls</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const fixture = fixtures.find(f => f.id === selectedFixture)
                        if (fixture) {
                          const duplicate = {
                            ...fixture,
                            id: `fixture-${Date.now()}`,
                            x: Math.min(fixture.x + 10, 95),
                            y: Math.min(fixture.y + 10, 95)
                          }
                          setFixtures([...fixtures, duplicate])
                        }
                      }}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setFixtures(fixtures.filter(f => f.id !== selectedFixture))
                        setSelectedFixture(null)
                      }}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setFixtures(fixtures.map(f => 
                        f.id === selectedFixture ? {...f, enabled: !f.enabled} : f
                      ))
                    }}
                    className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    {fixtures.find(f => f.id === selectedFixture)?.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D View Modal */}
      {view3DMode && (
        <Simple3DView
          roomDimensions={{
            width: safeRoom.width,
            height: safeRoom.height,
            depth: safeRoom.mountingHeight
          }}
          fixtures={fixtures.map(f => ({
            id: f.id,
            x: f.x,
            y: f.y,
            z: safeRoom.mountingHeight,
            enabled: f.enabled
          }))}
          onClose={() => setView3DMode(false)}
        />
      )}
    </div>
  )
}