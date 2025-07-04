'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  DollarSign, 
  Sun, 
  Clock,
  AlertTriangle,
  TrendingDown,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface PeakHourSpectrumOptimizerProps {
  fixtures: {
    id: string
    name: string
    wattage: number
    hasSpectralControl: boolean
    spectrumChannels?: {
      deepRed?: number // 660nm efficiency
      red?: number // 630nm efficiency  
      blue?: number // 450nm efficiency
      white?: number // white efficiency
      farRed?: number // 730nm efficiency
      uv?: number // UV efficiency
    }
  }[]
  peakHours: { start: number; end: number }
  peakRate: number // $/kWh
  offPeakRate: number // $/kWh
  photoperiod: number
  onScheduleUpdate?: (schedule: any) => void
}

interface SpectrumSchedule {
  time: string
  spectrum: {
    deepRed: number
    red: number
    blue: number
    white: number
    farRed: number
    uv: number
  }
  ppfdReduction: number
  energySavings: number
  isPeakHour: boolean
}

export default function PeakHourSpectrumOptimizer({
  fixtures,
  peakHours,
  peakRate,
  offPeakRate,
  photoperiod,
  onScheduleUpdate
}: PeakHourSpectrumOptimizerProps) {
  const [optimizationEnabled, setOptimizationEnabled] = useState(true)
  const [minimumPPFDPercent, setMinimumPPFDPercent] = useState(70) // Maintain at least 70% PPFD
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customSpectrum, setCustomSpectrum] = useState({
    deepRed: 100,
    red: 0,
    blue: 5,
    white: 0,
    farRed: 10,
    uv: 0
  })

  // Calculate spectral efficiency (µmol/J)
  const spectralEfficiencies = {
    deepRed: 3.0, // Most efficient at 660nm
    red: 2.8,
    blue: 2.5,
    white: 2.3,
    farRed: 2.7,
    uv: 1.5
  }

  // Generate optimized schedule
  const generateOptimizedSchedule = (): SpectrumSchedule[] => {
    const schedule: SpectrumSchedule[] = []
    const lightStartHour = 6 // 6 AM default
    
    for (let hour = 0; hour < 24; hour++) {
      const isLightOn = hour >= lightStartHour && hour < lightStartHour + photoperiod
      const isPeakHour = hour >= peakHours.start && hour < peakHours.end
      
      if (!isLightOn) continue

      let spectrum = {
        deepRed: 100,
        red: 100,
        blue: 100,
        white: 100,
        farRed: 100,
        uv: 100
      }
      
      let ppfdReduction = 0
      let energySavings = 0

      if (isPeakHour && optimizationEnabled) {
        // During peak hours, optimize for spectral efficiency
        spectrum = { ...customSpectrum }
        
        // Calculate PPFD reduction
        const normalPower = 100 // All channels at 100%
        const optimizedPower = Object.entries(spectrum).reduce((sum, [channel, value]) => {
          return sum + (value / 100) * (1 / spectralEfficiencies[channel as keyof typeof spectralEfficiencies])
        }, 0) / Object.keys(spectrum).length

        ppfdReduction = (1 - optimizedPower) * 100
        
        // Ensure minimum PPFD
        if (ppfdReduction > (100 - minimumPPFDPercent)) {
          const scaleFactor = (100 - minimumPPFDPercent) / ppfdReduction
          ppfdReduction = 100 - minimumPPFDPercent
          
          // Scale spectrum to maintain minimum PPFD
          Object.keys(spectrum).forEach(channel => {
            spectrum[channel as keyof typeof spectrum] = 
              customSpectrum[channel as keyof typeof customSpectrum] + 
              (100 - customSpectrum[channel as keyof typeof customSpectrum]) * (1 - scaleFactor)
          })
        }

        // Calculate energy savings
        const powerReduction = Object.entries(spectrum).reduce((sum, [channel, value]) => {
          return sum + (100 - value) / Object.keys(spectrum).length
        }, 0)
        
        energySavings = powerReduction
      }

      schedule.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        spectrum,
        ppfdReduction,
        energySavings,
        isPeakHour
      })
    }

    return schedule
  }

  const schedule = generateOptimizedSchedule()

  // Calculate total savings
  const totalDailySavings = schedule.reduce((sum, slot) => {
    if (!slot.isPeakHour) return sum
    
    const totalWattage = fixtures.reduce((w, f) => w + f.wattage, 0)
    const hourlyKWh = totalWattage / 1000
    const savings = hourlyKWh * (slot.energySavings / 100) * (peakRate - offPeakRate)
    
    return sum + savings
  }, 0)

  const annualSavings = totalDailySavings * 365

  // Count fixtures with spectral control
  const spectralFixtures = fixtures.filter(f => f.hasSpectralControl).length

  useEffect(() => {
    if (onScheduleUpdate) {
      onScheduleUpdate(schedule)
    }
  }, [optimizationEnabled, minimumPPFDPercent, customSpectrum])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Peak Hour Spectrum Optimizer
        </h3>
        <button
          onClick={() => setOptimizationEnabled(!optimizationEnabled)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            optimizationEnabled 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {optimizationEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Fixture Compatibility */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Spectral Control Fixtures</span>
          <span className="text-lg font-semibold">
            {spectralFixtures} / {fixtures.length}
          </span>
        </div>
        {spectralFixtures === 0 && (
          <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            No fixtures with spectral control detected
          </div>
        )}
      </div>

      {/* Peak Hour Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Peak Hours</div>
          <div className="text-lg font-semibold">
            {peakHours.start}:00 - {peakHours.end}:00
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Rate: ${peakRate.toFixed(2)}/kWh
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Off-Peak Rate</div>
          <div className="text-lg font-semibold">
            ${offPeakRate.toFixed(2)}/kWh
          </div>
          <div className="text-xs text-green-400 mt-1">
            {((1 - offPeakRate/peakRate) * 100).toFixed(0)}% cheaper
          </div>
        </div>
      </div>

      {/* Optimization Settings */}
      {optimizationEnabled && (
        <>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              Minimum PPFD During Peak Hours: {minimumPPFDPercent}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={minimumPPFDPercent}
              onChange={(e) => setMinimumPPFDPercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50% (Max Savings)</span>
              <span>100% (No Reduction)</span>
            </div>
          </div>

          {/* Peak Hour Spectrum Mix */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">Peak Hour Spectrum Mix</h4>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-xs text-gray-400 mb-3">
              Optimize for photosynthetic efficiency using deep red (660nm) during expensive peak hours
            </div>

            {showAdvanced && (
              <div className="space-y-3">
                {Object.entries(customSpectrum).map(([channel, value]) => (
                  <div key={channel}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-300">
                        {channel.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-gray-400">
                        {value}% • {spectralEfficiencies[channel as keyof typeof spectralEfficiencies]} µmol/J
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => setCustomSpectrum({
                        ...customSpectrum,
                        [channel]: Number(e.target.value)
                      })}
                      className="w-full h-1"
                    />
                  </div>
                ))}
              </div>
            )}

            {!showAdvanced && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-red-900/30 rounded p-2 text-center">
                  <div className="text-red-400 font-medium">Deep Red</div>
                  <div className="text-white">{customSpectrum.deepRed}%</div>
                </div>
                <div className="bg-blue-900/30 rounded p-2 text-center">
                  <div className="text-blue-400 font-medium">Blue</div>
                  <div className="text-white">{customSpectrum.blue}%</div>
                </div>
                <div className="bg-purple-900/30 rounded p-2 text-center">
                  <div className="text-purple-400 font-medium">Far Red</div>
                  <div className="text-white">{customSpectrum.farRed}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Schedule Visualization */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Daily Schedule</h4>
            <div className="space-y-1">
              {schedule.map((slot, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-2 rounded text-xs ${
                    slot.isPeakHour ? 'bg-yellow-900/20' : 'bg-gray-800'
                  }`}
                >
                  <span className="text-gray-400">{slot.time}</span>
                  <div className="flex items-center gap-4">
                    {slot.ppfdReduction > 0 && (
                      <span className="text-yellow-400">
                        -{slot.ppfdReduction.toFixed(0)}% PPFD
                      </span>
                    )}
                    {slot.energySavings > 0 && (
                      <span className="text-green-400">
                        -{slot.energySavings.toFixed(0)}% Power
                      </span>
                    )}
                    {slot.isPeakHour && (
                      <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                        Peak
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Summary */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-green-400">Projected Savings</h4>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400">Daily Savings</div>
                <div className="text-xl font-bold text-white">
                  ${totalDailySavings.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Annual Savings</div>
                <div className="text-xl font-bold text-green-400">
                  ${annualSavings.toFixed(0)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Using deep red spectrum during {peakHours.end - peakHours.start} peak hours daily
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Spectral Control Warning */}
      {spectralFixtures === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400 mb-1">
                Spectral Control Required
              </h4>
              <p className="text-sm text-gray-300">
                This optimization requires fixtures with independent spectral control. 
                Consider upgrading to color-tunable LED fixtures to take advantage of 
                peak hour energy savings through spectral optimization.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}