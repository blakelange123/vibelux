"use client"

import { useState, useMemo, useEffect } from 'react'
import { 
  Sun, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  BarChart3,
  Sunrise,
  Sunset,
  MapPin
} from 'lucide-react'
import SolarRadiationPanel from './SolarRadiationPanel'
import type { SolarRadiationData } from '@/lib/solar-radiation-data'

interface DLITarget {
  crop: string
  seedling: { min: number; max: number; optimal: number }
  vegetative: { min: number; max: number; optimal: number }
  flowering: { min: number; max: number; optimal: number }
  fruiting?: { min: number; max: number; optimal: number }
}

interface DLICalculation {
  currentPPFD: number
  photoperiod: number
  currentDLI: number
  targetDLI: number
  efficiency: number
  status: 'deficit' | 'optimal' | 'excess'
  adjustment: number
}

interface SeasonalData {
  month: string
  solarDLI: number
  temperature: number
  recommendations: {
    supplementalDLI: number
    photoperiod: number
    intensity: number
  }
}

interface DLIOptimizerPanelProps {
  currentPPFD: number
  photoperiod: number
  selectedCrop: string
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  location?: { lat: number; lng: number; name: string }
  onOptimizationChange: (optimization: {
    recommendedPPFD: number
    recommendedPhotoperiod: number
    targetDLI: number
  }) => void
  className?: string
}

// Comprehensive DLI targets for different crops and growth stages
const DLI_TARGETS: Record<string, DLITarget> = {
  lettuce: {
    crop: 'Lettuce',
    seedling: { min: 8, max: 12, optimal: 10 },
    vegetative: { min: 12, max: 18, optimal: 15 },
    flowering: { min: 15, max: 20, optimal: 17 }
  },
  tomato: {
    crop: 'Tomato',
    seedling: { min: 10, max: 15, optimal: 12 },
    vegetative: { min: 15, max: 25, optimal: 20 },
    flowering: { min: 20, max: 35, optimal: 25 },
    fruiting: { min: 25, max: 40, optimal: 30 }
  },
  cannabis: {
    crop: 'Cannabis',
    seedling: { min: 15, max: 25, optimal: 20 },
    vegetative: { min: 35, max: 50, optimal: 40 },
    flowering: { min: 40, max: 60, optimal: 50 }
  },
  herbs: {
    crop: 'Herbs (Basil, Cilantro)',
    seedling: { min: 8, max: 15, optimal: 12 },
    vegetative: { min: 15, max: 25, optimal: 18 },
    flowering: { min: 18, max: 30, optimal: 22 }
  },
  strawberry: {
    crop: 'Strawberry',
    seedling: { min: 12, max: 18, optimal: 15 },
    vegetative: { min: 15, max: 25, optimal: 20 },
    flowering: { min: 20, max: 30, optimal: 25 },
    fruiting: { min: 25, max: 35, optimal: 30 }
  },
  cucumber: {
    crop: 'Cucumber',
    seedling: { min: 10, max: 15, optimal: 12 },
    vegetative: { min: 18, max: 28, optimal: 22 },
    flowering: { min: 22, max: 32, optimal: 26 },
    fruiting: { min: 25, max: 35, optimal: 30 }
  },
  peppers: {
    crop: 'Peppers',
    seedling: { min: 10, max: 15, optimal: 12 },
    vegetative: { min: 15, max: 25, optimal: 20 },
    flowering: { min: 20, max: 30, optimal: 25 },
    fruiting: { min: 25, max: 35, optimal: 28 }
  },
  microgreens: {
    crop: 'Microgreens',
    seedling: { min: 6, max: 10, optimal: 8 },
    vegetative: { min: 8, max: 15, optimal: 12 },
    flowering: { min: 12, max: 18, optimal: 15 }
  }
}

// Seasonal solar radiation data (example for temperate climate)
const SEASONAL_DATA: SeasonalData[] = [
  { month: 'Jan', solarDLI: 8, temperature: 35, recommendations: { supplementalDLI: 15, photoperiod: 14, intensity: 400 }},
  { month: 'Feb', solarDLI: 12, temperature: 40, recommendations: { supplementalDLI: 12, photoperiod: 14, intensity: 380 }},
  { month: 'Mar', solarDLI: 18, temperature: 50, recommendations: { supplementalDLI: 8, photoperiod: 12, intensity: 350 }},
  { month: 'Apr', solarDLI: 25, temperature: 60, recommendations: { supplementalDLI: 5, photoperiod: 12, intensity: 300 }},
  { month: 'May', solarDLI: 32, temperature: 70, recommendations: { supplementalDLI: 2, photoperiod: 10, intensity: 250 }},
  { month: 'Jun', solarDLI: 38, temperature: 78, recommendations: { supplementalDLI: 0, photoperiod: 8, intensity: 200 }},
  { month: 'Jul', solarDLI: 36, temperature: 82, recommendations: { supplementalDLI: 0, photoperiod: 8, intensity: 200 }},
  { month: 'Aug', solarDLI: 30, temperature: 80, recommendations: { supplementalDLI: 2, photoperiod: 10, intensity: 250 }},
  { month: 'Sep', solarDLI: 22, temperature: 72, recommendations: { supplementalDLI: 6, photoperiod: 12, intensity: 300 }},
  { month: 'Oct', solarDLI: 15, temperature: 60, recommendations: { supplementalDLI: 10, photoperiod: 14, intensity: 360 }},
  { month: 'Nov', solarDLI: 10, temperature: 45, recommendations: { supplementalDLI: 14, photoperiod: 16, intensity: 400 }},
  { month: 'Dec', solarDLI: 6, temperature: 38, recommendations: { supplementalDLI: 16, photoperiod: 16, intensity: 420 }}
]

export function DLIOptimizerPanel({ 
  currentPPFD, 
  photoperiod, 
  selectedCrop,
  growthStage,
  location,
  onOptimizationChange,
  className = '' 
}: DLIOptimizerPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [seasonalMode, setSeasonalMode] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [customTargets, setCustomTargets] = useState(false)
  const [showSolarAnalysis, setShowSolarAnalysis] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<SolarRadiationData | null>(null)
  const [electricityRate, setElectricityRate] = useState(0.12) // Default $0.12/kWh

  // Get DLI targets for current crop and growth stage
  const cropTargets = DLI_TARGETS[selectedCrop] || DLI_TARGETS.lettuce
  const stageTargets = cropTargets[growthStage] || cropTargets.vegetative

  // Calculate current DLI
  const currentDLI = useMemo(() => {
    // DLI = PPFD × photoperiod × 3600 / 1,000,000
    return (currentPPFD * photoperiod * 3.6) / 1000
  }, [currentPPFD, photoperiod])

  // Calculate DLI optimization
  const optimization = useMemo((): DLICalculation => {
    const targetDLI = stageTargets.optimal
    const efficiency = currentDLI / targetDLI
    
    let status: 'deficit' | 'optimal' | 'excess' = 'optimal'
    if (currentDLI < stageTargets.min) status = 'deficit'
    else if (currentDLI > stageTargets.max) status = 'excess'
    
    const adjustment = targetDLI - currentDLI
    
    return {
      currentPPFD,
      photoperiod,
      currentDLI,
      targetDLI,
      efficiency,
      status,
      adjustment
    }
  }, [currentPPFD, photoperiod, currentDLI, stageTargets])

  // Calculate recommended PPFD for optimal DLI
  const recommendedPPFD = useMemo(() => {
    return Math.round((stageTargets.optimal * 1000) / (photoperiod * 3.6))
  }, [stageTargets.optimal, photoperiod])

  // Seasonal adjustments
  const seasonalData = SEASONAL_DATA[currentMonth]
  const seasonalRecommendations = useMemo(() => {
    if (!seasonalMode) return null
    
    const naturalDLI = seasonalData.solarDLI
    const requiredSupplemental = Math.max(0, stageTargets.optimal - naturalDLI)
    const recommendedPhotoperiod = seasonalData.recommendations.photoperiod
    const recommendedIntensity = Math.round((requiredSupplemental * 1000) / (recommendedPhotoperiod * 3.6))
    
    return {
      naturalDLI,
      supplementalDLI: requiredSupplemental,
      recommendedPhotoperiod,
      recommendedIntensity,
      energySavings: Math.max(0, currentDLI - stageTargets.optimal)
    }
  }, [seasonalMode, currentMonth, stageTargets.optimal, currentDLI, seasonalData])

  // Update parent component when optimization changes
  useEffect(() => {
    onOptimizationChange({
      recommendedPPFD,
      recommendedPhotoperiod: seasonalRecommendations?.recommendedPhotoperiod || photoperiod,
      targetDLI: stageTargets.optimal
    })
  }, [recommendedPPFD, seasonalRecommendations, photoperiod, stageTargets.optimal, onOptimizationChange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'deficit': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'excess': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />
      case 'deficit': return <AlertTriangle className="w-4 h-4" />
      case 'excess': return <Info className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">DLI Optimizer</h3>
            <p className="text-sm text-gray-400">Daily Light Integral optimization for {cropTargets.crop}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSolarAnalysis(!showSolarAnalysis)}
            className={`p-2 rounded-lg border transition-all ${
              showSolarAnalysis 
                ? 'bg-yellow-600 border-yellow-500 text-white' 
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
            title="Solar Radiation Analysis"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSeasonalMode(!seasonalMode)}
            className={`p-2 rounded-lg border transition-all ${
              seasonalMode 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">Current Status</h4>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(optimization.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(optimization.status)}
              {optimization.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Current DLI</p>
            <p className="text-xl font-bold text-white">{currentDLI.toFixed(1)}</p>
            <p className="text-xs text-gray-500">mol/m²/day</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Target DLI</p>
            <p className="text-xl font-bold text-white">{stageTargets.optimal}</p>
            <p className="text-xs text-gray-500">mol/m²/day</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Efficiency</p>
            <p className="text-xl font-bold text-white">{(optimization.efficiency * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">of target</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Adjustment</p>
            <p className={`text-xl font-bold ${optimization.adjustment > 0 ? 'text-red-400' : optimization.adjustment < 0 ? 'text-green-400' : 'text-white'}`}>
              {optimization.adjustment > 0 ? '+' : ''}{optimization.adjustment.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">mol/m²/day</p>
          </div>
        </div>
      </div>

      {/* DLI Target Range Visualization */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">DLI Range for {growthStage.charAt(0).toUpperCase() + growthStage.slice(1)} Stage</h4>
        <div className="relative h-12 bg-gray-900 rounded-lg overflow-hidden">
          {/* Target range background */}
          <div 
            className="absolute top-0 bottom-0 bg-green-600/30 border-l border-r border-green-500"
            style={{
              left: `${(stageTargets.min / 60) * 100}%`,
              width: `${((stageTargets.max - stageTargets.min) / 60) * 100}%`
            }}
          />
          
          {/* Optimal line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-green-400"
            style={{ left: `${(stageTargets.optimal / 60) * 100}%` }}
          />
          
          {/* Current DLI indicator */}
          <div 
            className="absolute top-1 bottom-1 w-1 bg-white rounded-full"
            style={{ left: `${Math.min((currentDLI / 60) * 100, 98)}%` }}
          />
          
          {/* Scale labels */}
          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-gray-400">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Min: {stageTargets.min}</span>
          <span>Optimal: {stageTargets.optimal}</span>
          <span>Max: {stageTargets.max}</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Optimization Recommendations
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Recommended PPFD:</span>
            <span className="font-medium text-white">{recommendedPPFD} μmol/m²/s</span>
          </div>
          
          {optimization.status === 'deficit' && (
            <div className="text-sm text-red-300">
              💡 Increase light intensity by {Math.round(recommendedPPFD - currentPPFD)} μmol/m²/s to reach optimal DLI
            </div>
          )}
          
          {optimization.status === 'excess' && (
            <div className="text-sm text-yellow-300">
              ⚡ Reduce light intensity by {Math.round(currentPPFD - recommendedPPFD)} μmol/m²/s or decrease photoperiod to save energy
            </div>
          )}
          
          {optimization.status === 'optimal' && (
            <div className="text-sm text-green-300">
              ✅ Your current DLI is optimal for {cropTargets.crop} in {growthStage} stage
            </div>
          )}
        </div>
      </div>

      {/* Seasonal Optimization */}
      {seasonalMode && seasonalRecommendations && (
        <div className="mb-6 bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Seasonal Optimization - {SEASONAL_DATA[currentMonth].month}
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400">Month</label>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {SEASONAL_DATA.map((data, index) => (
                  <option key={index} value={index}>{data.month}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Natural DLI:</span>
                <span className="text-white">{seasonalRecommendations.naturalDLI.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Supplemental needed:</span>
                <span className="text-white">{seasonalRecommendations.supplementalDLI.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recommended photoperiod:</span>
                <span className="text-white">{seasonalRecommendations.recommendedPhotoperiod}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Energy savings:</span>
                <span className="text-green-400">{seasonalRecommendations.energySavings.toFixed(1)} DLI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Stage Selector */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Growth Stage DLI Targets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(cropTargets).filter(stage => stage !== 'crop').map((stage) => {
            const targets = cropTargets[stage as keyof DLITarget] as { min: number; max: number; optimal: number }
            return (
              <div key={stage} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                <p className="text-xs text-gray-400 capitalize">{stage}</p>
                <p className="font-bold text-white">{targets.optimal}</p>
                <p className="text-xs text-gray-500">{targets.min}-{targets.max}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-medium text-white mb-3">Advanced Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={customTargets}
                  onChange={(e) => setCustomTargets(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                Custom DLI Targets
              </label>
            </div>
            
            {location && (
              <div className="text-sm text-gray-300">
                <span className="text-gray-400">Location:</span> {location.name}
                <br />
                <span className="text-gray-400">Coordinates:</span> {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Sunrise:</span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Sunrise className="w-4 h-4" />
                  <span>6:30 AM</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Sunset:</span>
                <div className="flex items-center gap-1 text-orange-400">
                  <Sunset className="w-4 h-4" />
                  <span>7:45 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Solar Radiation Analysis */}
      {showSolarAnalysis && (
        <div className="mt-4">
          <SolarRadiationPanel
            targetDLI={stageTargets.optimal}
            photoperiod={photoperiod}
            fixtureWattage={630} // Default 630W fixture
            electricityRate={electricityRate}
            onLocationChange={setSelectedLocation}
          />
        </div>
      )}
    </div>
  )
}