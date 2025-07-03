'use client'

import { useState } from 'react'
import { BatteryOptimization } from '@/components/BatteryOptimization'
import { 
  Battery,
  Sun,
  Building2,
  Clock,
  Zap,
  TrendingUp,
  Settings,
  ChevronRight,
  DollarSign,
  Leaf
} from 'lucide-react'

export default function BatteryOptimizationPage() {
  const [facilityConfig, setFacilityConfig] = useState({
    size: 1000, // m²
    type: 'indoor' as 'indoor' | 'greenhouse',
    location: 'California',
    lightingSchedule: { on: 6, off: 0 }, // 18 hours on
    hasSolar: false,
    solarCapacity: 100, // kW
    existingDemand: 450, // kW
    annualEnergyUse: 3942000 // kWh
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Quick presets
  const presets = [
    {
      name: 'Small Indoor Farm',
      config: {
        size: 500,
        type: 'indoor' as const,
        lightingSchedule: { on: 6, off: 0 },
        hasSolar: false,
        solarCapacity: 0,
        existingDemand: 225
      }
    },
    {
      name: 'Large Greenhouse',
      config: {
        size: 2000,
        type: 'greenhouse' as const,
        lightingSchedule: { on: 8, off: 2 },
        hasSolar: true,
        solarCapacity: 200,
        existingDemand: 600
      }
    },
    {
      name: 'Vertical Farm',
      config: {
        size: 800,
        type: 'indoor' as const,
        lightingSchedule: { on: 4, off: 0 },
        hasSolar: false,
        solarCapacity: 0,
        existingDemand: 720
      }
    }
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    setFacilityConfig({
      ...facilityConfig,
      ...preset.config,
      annualEnergyUse: preset.config.existingDemand * 8760 * 0.85
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <Battery className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Battery Storage Optimization
              </h1>
              <p className="text-gray-400 mt-1">
                Maximize energy savings with intelligent battery storage
              </p>
            </div>
          </div>

          {/* Benefits Banner */}
          <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-6 border border-green-800/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              Why Battery Storage for Grow Facilities?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Reduce Energy Costs</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Save 20-40% on electricity bills by avoiding peak rates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Peak Shaving</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Reduce demand charges by limiting grid power draw
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Grid Independence</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Maintain operations during outages and grid issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Presets */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Presets
              </h3>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{preset.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {preset.config.size}m² · {preset.config.existingDemand}kW
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Facility Configuration */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Facility Configuration
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Facility Size (m²)
                  </label>
                  <input
                    type="number"
                    value={facilityConfig.size}
                    onChange={(e) => setFacilityConfig({
                      ...facilityConfig,
                      size: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Facility Type
                  </label>
                  <select
                    value={facilityConfig.type}
                    onChange={(e) => setFacilityConfig({
                      ...facilityConfig,
                      type: e.target.value as 'indoor' | 'greenhouse'
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="indoor">Indoor Farm</option>
                    <option value="greenhouse">Greenhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Lighting Schedule
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={facilityConfig.lightingSchedule.on}
                      onChange={(e) => setFacilityConfig({
                        ...facilityConfig,
                        lightingSchedule: {
                          ...facilityConfig.lightingSchedule,
                          on: Number(e.target.value)
                        }
                      })}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                      max="23"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      value={facilityConfig.lightingSchedule.off}
                      onChange={(e) => setFacilityConfig({
                        ...facilityConfig,
                        lightingSchedule: {
                          ...facilityConfig.lightingSchedule,
                          off: Number(e.target.value)
                        }
                      })}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                      max="23"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {facilityConfig.lightingSchedule.off <= facilityConfig.lightingSchedule.on 
                      ? 24 - facilityConfig.lightingSchedule.on + facilityConfig.lightingSchedule.off
                      : facilityConfig.lightingSchedule.off - facilityConfig.lightingSchedule.on
                    } hours daily
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={facilityConfig.hasSolar}
                      onChange={(e) => setFacilityConfig({
                        ...facilityConfig,
                        hasSolar: e.target.checked
                      })}
                      className="rounded border-gray-600 bg-gray-700 text-green-600"
                    />
                    <Sun className="w-4 h-4 text-yellow-400" />
                    Has Solar Installation
                  </label>
                </div>

                {facilityConfig.hasSolar && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Solar Capacity (kW)
                    </label>
                    <input
                      type="number"
                      value={facilityConfig.solarCapacity}
                      onChange={(e) => setFacilityConfig({
                        ...facilityConfig,
                        solarCapacity: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                )}

                {showAdvanced && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Peak Demand (kW)
                      </label>
                      <input
                        type="number"
                        value={facilityConfig.existingDemand}
                        onChange={(e) => setFacilityConfig({
                          ...facilityConfig,
                          existingDemand: Number(e.target.value)
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Annual Energy Use (kWh)
                      </label>
                      <input
                        type="number"
                        value={facilityConfig.annualEnergyUse}
                        onChange={(e) => setFacilityConfig({
                          ...facilityConfig,
                          annualEnergyUse: Number(e.target.value)
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Current Energy Profile */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Current Energy Profile
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Monthly Energy Cost</span>
                  <span className="text-lg font-semibold text-white">
                    ${((facilityConfig.annualEnergyUse / 12) * 0.15).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Monthly Demand Charge</span>
                  <span className="text-lg font-semibold text-white">
                    ${(facilityConfig.existingDemand * 15).toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Total Monthly Cost</span>
                    <span className="text-xl font-bold text-yellow-400">
                      ${(
                        ((facilityConfig.annualEnergyUse / 12) * 0.15) + 
                        (facilityConfig.existingDemand * 15)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Results */}
          <div className="lg:col-span-2">
            <BatteryOptimization
              facilitySize={facilityConfig.size}
              lightingSchedule={facilityConfig.lightingSchedule}
              hasSolar={facilityConfig.hasSolar}
              solarCapacity={facilityConfig.solarCapacity}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Installation Process
            </h3>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span className="text-gray-300">Site assessment and electrical review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span className="text-gray-300">System design and permitting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span className="text-gray-300">Installation (2-5 days)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">4.</span>
                <span className="text-gray-300">Commissioning and optimization</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              System Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Automated charge/discharge optimization
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Real-time energy monitoring
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Remote management capabilities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                10-15 year warranty options
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Scalable for future expansion
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Available Incentives
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">★</span>
                Federal ITC: 30% tax credit
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">★</span>
                State rebates up to $300/kWh
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">★</span>
                Utility programs available
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">★</span>
                Accelerated depreciation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">★</span>
                Low-interest financing options
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}