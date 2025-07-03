"use client"

import { useState, useMemo } from 'react'
import { 
  Clock, 
  Sunrise, 
  Sunset, 
  Moon,
  Zap,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface PhotoperiodSchedule {
  hour: number
  intensity: number // 0-100%
  phase: 'off' | 'ramp-up' | 'full' | 'ramp-down'
}

interface PhotoperiodOptimizerProps {
  currentPhotoperiod: number
  targetDLI: number
  maxPPFD: number
  cropType: string
  growthStage: string
  energyCostPerKWh?: number
  onScheduleChange: (schedule: PhotoperiodSchedule[]) => void
  className?: string
}

// Crop-specific photoperiod preferences
const PHOTOPERIOD_PREFERENCES = {
  lettuce: {
    optimal: { min: 14, max: 18, preferred: 16 },
    lightSensitive: false,
    canExtend: true
  },
  tomato: {
    optimal: { min: 12, max: 16, preferred: 14 },
    lightSensitive: false,
    canExtend: true
  },
  cannabis: {
    optimal: { min: 18, max: 24, preferred: 18 },
    lightSensitive: true,
    canExtend: false
  },
  herbs: {
    optimal: { min: 14, max: 18, preferred: 16 },
    lightSensitive: false,
    canExtend: true
  },
  strawberry: {
    optimal: { min: 12, max: 16, preferred: 14 },
    lightSensitive: false,
    canExtend: true
  },
  cucumber: {
    optimal: { min: 12, max: 16, preferred: 14 },
    lightSensitive: false,
    canExtend: true
  },
  peppers: {
    optimal: { min: 12, max: 16, preferred: 14 },
    lightSensitive: false,
    canExtend: true
  }
}

export default function PhotoperiodOptimizer({
  currentPhotoperiod,
  targetDLI,
  maxPPFD,
  cropType,
  growthStage,
  energyCostPerKWh = 0.12,
  onScheduleChange,
  className = ''
}: PhotoperiodOptimizerProps) {
  const [optimizationMode, setOptimizationMode] = useState<'energy' | 'yield' | 'balance'>('balance')
  const [rampDuration, setRampDuration] = useState(1) // hours for sunrise/sunset ramp
  const [startTime, setStartTime] = useState(6) // 6 AM
  const [customSchedule, setCustomSchedule] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const cropPrefs = PHOTOPERIOD_PREFERENCES[cropType as keyof typeof PHOTOPERIOD_PREFERENCES] || PHOTOPERIOD_PREFERENCES.lettuce

  // Calculate optimal photoperiod based on DLI and PPFD constraints
  const optimizedPhotoperiod = useMemo(() => {
    const requiredHours = (targetDLI * 1000) / (maxPPFD * 3.6)
    
    // Clamp to crop-specific preferences
    const clampedHours = Math.max(
      cropPrefs.optimal.min,
      Math.min(cropPrefs.optimal.max, requiredHours)
    )
    
    return {
      calculated: requiredHours,
      optimal: clampedHours,
      withinRange: requiredHours >= cropPrefs.optimal.min && requiredHours <= cropPrefs.optimal.max
    }
  }, [targetDLI, maxPPFD, cropPrefs])

  // Generate optimized schedule
  const optimizedSchedule = useMemo((): PhotoperiodSchedule[] => {
    const schedule: PhotoperiodSchedule[] = []
    
    for (let hour = 0; hour < 24; hour++) {
      const lightStart = startTime
      const lightEnd = (startTime + optimizedPhotoperiod.optimal) % 24
      const rampUpEnd = (lightStart + rampDuration) % 24
      const rampDownStart = (lightEnd - rampDuration + 24) % 24
      
      let intensity = 0
      let phase: PhotoperiodSchedule['phase'] = 'off'
      
      // Handle wraparound scenarios
      const isLightPeriod = lightEnd > lightStart 
        ? hour >= lightStart && hour < lightEnd
        : hour >= lightStart || hour < lightEnd
      
      if (isLightPeriod) {
        if (rampDuration > 0) {
          if (lightEnd > lightStart) {
            // No wraparound
            if (hour < rampUpEnd) {
              // Ramp up
              const progress = (hour - lightStart + 1) / rampDuration
              intensity = Math.min(100, progress * 100)
              phase = 'ramp-up'
            } else if (hour >= rampDownStart) {
              // Ramp down
              const progress = (lightEnd - hour) / rampDuration
              intensity = Math.min(100, progress * 100)
              phase = 'ramp-down'
            } else {
              // Full intensity
              intensity = 100
              phase = 'full'
            }
          } else {
            // Wraparound case - simplified for now
            intensity = 100
            phase = 'full'
          }
        } else {
          // No ramping
          intensity = 100
          phase = 'full'
        }
      }
      
      schedule.push({ hour, intensity, phase })
    }
    
    return schedule
  }, [startTime, optimizedPhotoperiod.optimal, rampDuration])

  // Calculate energy and cost metrics
  const energyMetrics = useMemo(() => {
    const currentEnergy = (maxPPFD / 100) * currentPhotoperiod * 0.001 // Simplified calculation
    const optimizedEnergy = optimizedSchedule.reduce((sum, slot) => 
      sum + (maxPPFD / 100) * (slot.intensity / 100) * 0.001, 0
    )
    
    const savings = currentEnergy - optimizedEnergy
    const dailyCostSavings = savings * energyCostPerKWh
    
    return {
      currentEnergy: currentEnergy.toFixed(2),
      optimizedEnergy: optimizedEnergy.toFixed(2),
      savings: savings.toFixed(2),
      dailyCostSavings: dailyCostSavings.toFixed(2),
      monthlyCostSavings: (dailyCostSavings * 30.44).toFixed(2),
      yearlyCostSavings: (dailyCostSavings * 365).toFixed(2)
    }
  }, [currentPhotoperiod, optimizedSchedule, maxPPFD, energyCostPerKWh])

  // Handle schedule changes
  const handleScheduleUpdate = () => {
    onScheduleChange(optimizedSchedule)
  }

  const formatTime = (hour: number) => {
    const h = hour % 24
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:00 ${ampm}`
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Photoperiod Optimizer</h3>
            <p className="text-sm text-gray-400">Optimize lighting schedule for {cropType}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-2 rounded-lg border transition-all ${
              previewMode 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {previewMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCustomSchedule(!customSchedule)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Current vs Optimized */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-medium text-white mb-3">Current Schedule</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Photoperiod:</span>
              <span className="text-white">{currentPhotoperiod}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Energy/day:</span>
              <span className="text-white">{energyMetrics.currentEnergy} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cost/day:</span>
              <span className="text-white">${(parseFloat(energyMetrics.currentEnergy) * energyCostPerKWh).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-medium text-white mb-3">Optimized Schedule</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Photoperiod:</span>
              <span className="text-white">{optimizedPhotoperiod.optimal}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Energy/day:</span>
              <span className="text-white">{energyMetrics.optimizedEnergy} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Savings/day:</span>
              <span className="text-green-400">${energyMetrics.dailyCostSavings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Visualization */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">24-Hour Schedule</h4>
        <div className="relative h-20 bg-gray-900 rounded-lg overflow-hidden">
          {/* Hour markers */}
          <div className="absolute inset-0">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-700"
                style={{ left: `${(i / 24) * 100}%` }}
              />
            ))}
          </div>
          
          {/* Schedule bars */}
          {optimizedSchedule.map((slot, index) => (
            <div
              key={index}
              className={`absolute top-2 bottom-2 transition-all ${
                slot.phase === 'off' ? 'bg-gray-800' :
                slot.phase === 'ramp-up' ? 'bg-gradient-to-r from-orange-500 to-yellow-400' :
                slot.phase === 'ramp-down' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                'bg-yellow-400'
              }`}
              style={{
                left: `${(index / 24) * 100}%`,
                width: `${100 / 24}%`,
                opacity: slot.intensity / 100
              }}
            />
          ))}
          
          {/* Time labels */}
          <div className="absolute inset-0 flex items-end justify-between px-2 pb-1 text-xs text-gray-400">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded" />
            <span className="text-gray-400">Ramp Up</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded" />
            <span className="text-gray-400">Full Intensity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded" />
            <span className="text-gray-400">Ramp Down</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-800 rounded" />
            <span className="text-gray-400">Off</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-gray-400">Start Time</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{formatTime(i)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Ramp Duration (hours)</label>
          <input
            type="number"
            min="0"
            max="4"
            step="0.5"
            value={rampDuration}
            onChange={(e) => setRampDuration(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Optimization Mode */}
      <div className="mb-6">
        <label className="text-xs text-gray-400">Optimization Mode</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { id: 'energy', label: 'Energy Savings', icon: TrendingDown },
            { id: 'yield', label: 'Max Yield', icon: TrendingUp },
            { id: 'balance', label: 'Balanced', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setOptimizationMode(id as any)}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                optimizationMode === id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Savings Summary */}
      <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          Energy Savings
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Daily:</span>
            <p className="text-green-400 font-medium">${energyMetrics.dailyCostSavings}</p>
          </div>
          <div>
            <span className="text-gray-400">Monthly:</span>
            <p className="text-green-400 font-medium">${energyMetrics.monthlyCostSavings}</p>
          </div>
          <div>
            <span className="text-gray-400">Yearly:</span>
            <p className="text-green-400 font-medium">${energyMetrics.yearlyCostSavings}</p>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleScheduleUpdate}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Apply Optimized Schedule
      </button>
    </div>
  )
}