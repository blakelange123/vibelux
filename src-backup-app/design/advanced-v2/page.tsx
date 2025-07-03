"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Square, 
  Circle, 
  Pentagon,
  Plus,
  Move,
  RotateCw,
  Download,
  Grid,
  Layers,
  Save,
  Sparkles,
  Copy,
  Trash2,
  BarChart3,
  Leaf,
  Thermometer,
  Brain,
  TrendingUp,
  Droplets,
  Activity,
  Zap,
  Calendar,
  Flame
} from 'lucide-react'
import { HeatMapCanvas } from '@/components/HeatMapCanvas'
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary'
import { MetricsPanel } from '@/components/MetricsPanel'
import { SpectrumAnalysisPanel } from '@/components/SpectrumAnalysisPanel'
import { DLIOptimizerPanel } from '@/components/DLIOptimizerPanel'
import { EnergyCostCalculator } from '@/components/EnergyCostCalculator'
import { EnvironmentalMonitor } from '@/components/EnvironmentalMonitor'
import { AISpectrumRecommendations } from '@/components/AISpectrumRecommendations'
import { Simple3DView } from '@/components/Simple3DView'
import { CropYieldPredictor } from '@/components/CropYieldPredictor'
import { LightingScheduler } from '@/components/LightingScheduler'
import { HeatLoadCalculator } from '@/components/HeatLoadCalculator'
import { ElectricalLoadBalancer } from '@/components/ElectricalLoadBalancer'
import { CollapsibleSidebar, type SidebarSection } from '@/components/CollapsibleSidebar'
import {
  generateOptimalLayout,
  calculatePowerMetrics,
  exportDesign,
  type LightSource
} from '@/lib/lighting-design'
import {
  calculateOptimizedPPFDGrid,
  calculateUniformityMetrics,
  calculateCoverageArea
} from '@/lib/lighting-calculations'

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
}

export default function AdvancedDesignerV2Page() {
  // Core state
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
  const [colorScale, setColorScale] = useState<'viridis' | 'heat' | 'grayscale'>('viridis')
  const [targetCrop, setTargetCrop] = useState<'lettuce' | 'tomato' | 'cannabis' | 'herbs' | 'strawberry' | 'cucumber' | 'custom'>('lettuce')
  const [view3DMode, setView3DMode] = useState(false)

  // Feature toggles for sidebar
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(new Set([
    'spectrum-analysis',
    'dli-optimizer',
    'ai-recommendations'
  ]))

  // Memoized PPFD grid calculation
  const ppfdGrid = useMemo(() => {
    if (!room.width || !room.height || fixtures.length === 0) return []
    
    const lightSources: LightSource[] = fixtures
      .filter(f => f.enabled)
      .map(f => ({
        x: f.x,
        y: f.y,
        ppf: f.model.ppf,
        beamAngle: 120,
        mountingHeight: room.mountingHeight
      }))

    return calculateOptimizedPPFDGrid(
      room.width,
      room.height,
      lightSources,
      50
    )
  }, [fixtures, room])

  // Memoized metrics calculations
  const metrics = useMemo(() => {
    const uniformity = calculateUniformityMetrics(ppfdGrid)
    const coverage = calculateCoverageArea(ppfdGrid, room.targetPPFD * 0.8) // 80% of target
    const power = calculatePowerMetrics(fixtures.filter(f => f.enabled).map(f => f.model))
    
    return { uniformity, coverage, power }
  }, [ppfdGrid, fixtures, room.targetPPFD])

  // Memoized spectrum fixtures
  const spectrumFixtures = useMemo(() => {
    return fixtures
      .filter(f => f.enabled)
      .map(f => ({
        ...f.model,
        count: fixtures.filter(fx => fx.model.id === f.model.id && fx.enabled).length
      }))
      .filter((fixture, index, self) => 
        index === self.findIndex(f => f.id === fixture.id)
      )
  }, [fixtures])

  // Feature sections for sidebar
  const sidebarSections: SidebarSection[] = [
    {
      id: 'spectrum-analysis',
      title: 'Spectrum Analysis',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'analysis',
      enabled: enabledFeatures.has('spectrum-analysis'),
      component: <SpectrumAnalysisPanel fixtures={spectrumFixtures} targetCrop={targetCrop} />
    },
    {
      id: 'dli-optimizer',
      title: 'DLI Optimizer',
      icon: <Leaf className="w-4 h-4" />,
      category: 'optimization',
      enabled: enabledFeatures.has('dli-optimizer'),
      component: (
        <DLIOptimizerPanel
          currentPPFD={metrics.uniformity.average}
          currentPhotoperiod={room.photoperiod}
          targetCrop={targetCrop}
          growthStage="vegetative"
          onOptimize={(ppfd, photoperiod) => {
            setRoom(prev => ({ ...prev, targetPPFD: ppfd, photoperiod }))
          }}
        />
      )
    },
    {
      id: 'ai-recommendations',
      title: 'AI Recommendations',
      icon: <Brain className="w-4 h-4" />,
      category: 'optimization',
      enabled: enabledFeatures.has('ai-recommendations'),
      component: (
        <AISpectrumRecommendations
          currentFixtures={fixtures}
          targetCrop={targetCrop}
          growthStage="vegetative"
          roomDimensions={room}
        />
      )
    },
    {
      id: 'energy-calculator',
      title: 'Energy Cost Calculator',
      icon: <Zap className="w-4 h-4" />,
      category: 'analysis',
      enabled: enabledFeatures.has('energy-calculator'),
      component: (
        <EnergyCostCalculator
          fixtures={fixtures.filter(f => f.enabled).map(f => f.model)}
          photoperiod={room.photoperiod}
        />
      )
    },
    {
      id: 'environmental-monitor',
      title: 'Environmental Monitor',
      icon: <Thermometer className="w-4 h-4" />,
      category: 'monitoring',
      enabled: enabledFeatures.has('environmental-monitor'),
      component: (
        <EnvironmentalMonitor
          onAlert={(alert) => console.log('Environmental alert:', alert)}
        />
      )
    },
    {
      id: 'crop-yield',
      title: 'Crop Yield Predictor',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'analysis',
      enabled: enabledFeatures.has('crop-yield'),
      component: (
        <CropYieldPredictor
          cropType={targetCrop}
          averagePPFD={metrics.uniformity.average}
          dli={metrics.uniformity.average * room.photoperiod * 3.6 / 1000}
          growArea={room.width * room.height}
        />
      )
    },
    {
      id: 'lighting-scheduler',
      title: 'Lighting Scheduler',
      icon: <Calendar className="w-4 h-4" />,
      category: 'optimization',
      enabled: enabledFeatures.has('lighting-scheduler'),
      component: (
        <LightingScheduler
          fixtures={fixtures}
          onScheduleUpdate={(schedule) => console.log('Schedule updated:', schedule)}
        />
      )
    },
    {
      id: 'heat-load',
      title: 'Heat Load Calculator',
      icon: <Flame className="w-4 h-4" />,
      category: 'analysis',
      enabled: enabledFeatures.has('heat-load'),
      component: (
        <HeatLoadCalculator
          fixtures={fixtures.filter(f => f.enabled).map(f => f.model)}
          roomVolume={room.width * room.height * room.mountingHeight}
          ventilationRate={10}
        />
      )
    },
    {
      id: 'electrical-load',
      title: 'Electrical Load Balancer',
      icon: <Activity className="w-4 h-4" />,
      category: 'advanced',
      enabled: enabledFeatures.has('electrical-load'),
      component: (
        <ElectricalLoadBalancer
          fixtures={fixtures}
          maxCircuitLoad={20}
          voltage={277}
        />
      )
    }
  ]

  // Handlers
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (designMode !== 'place' || !selectedFixtureModel) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (rect.width / room.width)
    const y = (e.clientY - rect.top) / (rect.height / room.height)

    const newFixture: Fixture = {
      id: `fixture-${Date.now()}`,
      x,
      y,
      rotation: 0,
      model: selectedFixtureModel,
      enabled: true
    }

    setFixtures(prev => [...prev, newFixture])
  }, [designMode, selectedFixtureModel, room])

  const handleGenerateLayout = useCallback(() => {
    if (!selectedFixtureModel) return

    const layout = generateOptimalLayout(
      room.width,
      room.height,
      room.targetPPFD,
      selectedFixtureModel
    )

    const newFixtures: Fixture[] = layout.map((pos, index) => ({
      id: `fixture-auto-${Date.now()}-${index}`,
      x: pos.x,
      y: pos.y,
      rotation: 0,
      model: selectedFixtureModel,
      enabled: true
    }))

    setFixtures(newFixtures)
  }, [room, selectedFixtureModel])

  const handleExport = useCallback(() => {
    const designData = exportDesign({
      room,
      fixtures,
      metrics: {
        uniformity: metrics.uniformity,
        coverage: metrics.coverage,
        power: metrics.power,
        ppfdGrid
      }
    })

    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lighting-design-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [room, fixtures, metrics, ppfdGrid])

  const toggleFeature = (featureId: string, enabled: boolean) => {
    setEnabledFeatures(prev => {
      const newSet = new Set(prev)
      if (enabled) {
        newSet.add(featureId)
      } else {
        newSet.delete(featureId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Panel - Fixture Library */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Fixture Library</h2>
        <FixtureLibrary
          onSelectFixture={setSelectedFixtureModel}
          selectedFixtureId={selectedFixtureModel?.id}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Design Mode */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDesignMode('place')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    designMode === 'place' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Place
                </button>
                <button
                  onClick={() => setDesignMode('move')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    designMode === 'move' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Move className="w-4 h-4" />
                  Move
                </button>
                <button
                  onClick={() => setDesignMode('rotate')}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    designMode === 'rotate' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  Rotate
                </button>
              </div>

              {/* View Options */}
              <div className="flex gap-2">
                <button
                  onClick={() => setGridEnabled(!gridEnabled)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    gridEnabled 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setView3DMode(!view3DMode)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    view3DMode 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  3D
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateLayout}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={!selectedFixtureModel}
              >
                <Sparkles className="w-4 h-4" />
                Auto Layout
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Canvas or 3D View */}
        <div className="flex-1 p-4">
          {view3DMode ? (
            <Simple3DView
              room={room}
              fixtures={fixtures}
              ppfdGrid={ppfdGrid}
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <HeatMapCanvas
                width={room.width}
                height={room.height}
                ppfdData={ppfdGrid}
                fixtures={fixtures}
                gridEnabled={gridEnabled}
                showPAR={showPARMap}
                colorScale={colorScale}
                onClick={handleCanvasClick}
              />
            </div>
          )}
        </div>

        {/* Bottom Metrics Bar */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <MetricsPanel
            fixtureCount={fixtures.filter(f => f.enabled).length}
            totalPower={metrics.power.totalWattage || 0}
            averagePPFD={metrics.uniformity.average || 0}
            uniformity={metrics.uniformity.uniformity || 0}
            coverage={metrics.coverage || 0}
            roomArea={room.width * room.height}
            targetPPFD={room.targetPPFD}
            powerCost={{
              daily: (metrics.power.totalWattage || 0) * room.photoperiod * 0.12 / 1000,
              monthly: (metrics.power.totalWattage || 0) * room.photoperiod * 30 * 0.12 / 1000,
              yearly: (metrics.power.totalWattage || 0) * room.photoperiod * 365 * 0.12 / 1000
            }}
          />
        </div>
      </div>

      {/* Right Sidebar - Collapsible Features */}
      <CollapsibleSidebar
        sections={sidebarSections}
        onSectionToggle={toggleFeature}
        width={400}
      />
    </div>
  )
}