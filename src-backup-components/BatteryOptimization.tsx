'use client'

import React, { useState, useEffect } from 'react'
import {
  Battery,
  Zap,
  DollarSign,
  TrendingUp,
  Sun,
  Clock,
  AlertCircle,
  Info,
  Download,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react'
import {
  BatteryOptimizer,
  generateTypicalGrowFacilityLoad,
  generateTimeOfUseRates,
  type OptimizationResult,
  type OptimizationConfig
} from '@/lib/battery/battery-optimizer'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface BatteryOptimizationProps {
  facilitySize?: number // m²
  lightingSchedule?: { on: number; off: number }
  hasSolar?: boolean
  solarCapacity?: number // kW
}

export function BatteryOptimization({
  facilitySize = 1000,
  lightingSchedule = { on: 6, off: 0 },
  hasSolar = false,
  solarCapacity = 100
}: BatteryOptimizationProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [config, setConfig] = useState<OptimizationConfig>({
    timeHorizon: 168, // 1 week
    timeStep: 15, // 15 minutes
    peakShavingTarget: facilitySize * 0.35, // 350W/m²
    selfConsumptionPriority: hasSolar ? 0.4 : 0,
    economicPriority: 0.5,
    reliabilityPriority: 0.1,
    minStateOfCharge: 0.1,
    maxStateOfCharge: 0.9
  })
  
  // Rate configuration
  const [rateConfig, setRateConfig] = useState({
    onPeakRate: 0.25,
    offPeakRate: 0.10,
    onPeakStart: 14,
    onPeakEnd: 21,
    demandCharge: 15
  })

  const runOptimization = async () => {
    setIsOptimizing(true)
    
    // Generate load profile
    const loadProfile = generateTypicalGrowFacilityLoad(
      7, // 1 week
      facilitySize,
      lightingSchedule
    )
    
    // Generate electricity rates
    const rates = generateTimeOfUseRates(
      7,
      rateConfig.onPeakRate,
      rateConfig.offPeakRate,
      { start: rateConfig.onPeakStart, end: rateConfig.onPeakEnd },
      rateConfig.demandCharge
    )
    
    // Generate solar profile if enabled
    let solarGeneration
    if (hasSolar) {
      solarGeneration = generateSolarProfile(7, solarCapacity)
    }
    
    // Run optimization
    const optimizer = new BatteryOptimizer(config)
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const optimizationResult = optimizer.optimize(loadProfile, rates, solarGeneration)
    setResult(optimizationResult)
    setIsOptimizing(false)
  }

  // Generate sample solar profile
  const generateSolarProfile = (days: number, capacity: number) => {
    const profile = []
    
    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timestamp = new Date(2024, 0, day + 1, hour, minute)
          
          // Simple solar generation curve
          let generation = 0
          if (hour >= 6 && hour <= 18) {
            const hoursSinceSunrise = hour - 6
            const hoursToSunset = 18 - hour
            const peakHour = 12
            const distanceFromPeak = Math.abs(hour - peakHour)
            
            generation = capacity * (1 - distanceFromPeak / 6) * 
                        (0.8 + 0.2 * crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF) // Add some variability
          }
          
          profile.push({ timestamp, generation })
        }
      }
    }
    
    return profile
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!result) return null
    
    const labels = result.chargeDischargeSchedule
      .filter((_, i) => i % 4 === 0) // Every hour
      .map(s => s.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    
    const powerData = result.chargeDischargeSchedule
      .filter((_, i) => i % 4 === 0)
      .map(s => s.power)
    
    const socData = result.chargeDischargeSchedule
      .filter((_, i) => i % 4 === 0)
      .map(s => s.stateOfCharge * 100)
    
    const gridData = result.chargeDischargeSchedule
      .filter((_, i) => i % 4 === 0)
      .map(s => s.gridPower)
    
    return {
      labels,
      datasets: [
        {
          label: 'Battery Power (kW)',
          data: powerData,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          yAxisID: 'y',
          fill: true
        },
        {
          label: 'State of Charge (%)',
          data: socData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'transparent',
          yAxisID: 'y1',
          borderDash: [5, 5]
        },
        {
          label: 'Grid Power (kW)',
          data: gridData,
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          yAxisID: 'y',
          fill: true
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: 'rgb(156, 163, 175)' }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgb(156, 163, 175)', maxRotation: 45 },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Power (kW)',
          color: 'rgb(156, 163, 175)'
        },
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'State of Charge (%)',
          color: 'rgb(156, 163, 175)'
        },
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100
      }
    }
  }

  const chartData = prepareChartData()

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Battery className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Battery Storage Optimization</h2>
            <p className="text-sm text-gray-400">
              Optimize battery sizing and operation for maximum savings
            </p>
          </div>
        </div>
        
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isOptimizing
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isOptimizing ? (
            <>
              <Activity className="w-4 h-4 animate-pulse" />
              Optimizing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Optimization
            </>
          )}
        </button>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Optimization Priorities</h3>
          <div className="space-y-3">
            <div>
              <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Economic Priority</span>
                <span>{(config.economicPriority * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.economicPriority}
                onChange={(e) => setConfig({...config, economicPriority: parseFloat(e.target.value)})}
                className="w-full"
              />
            </div>
            {hasSolar && (
              <div>
                <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Self-Consumption Priority</span>
                  <span>{(config.selfConsumptionPriority * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.selfConsumptionPriority}
                  onChange={(e) => setConfig({...config, selfConsumptionPriority: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
            )}
            <div>
              <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Reliability Priority</span>
                <span>{(config.reliabilityPriority * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.reliabilityPriority}
                onChange={(e) => setConfig({...config, reliabilityPriority: parseFloat(e.target.value)})}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Electricity Rates</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">On-Peak Rate ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={rateConfig.onPeakRate}
                onChange={(e) => setRateConfig({...rateConfig, onPeakRate: parseFloat(e.target.value)})}
                className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Off-Peak Rate ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={rateConfig.offPeakRate}
                onChange={(e) => setRateConfig({...rateConfig, offPeakRate: parseFloat(e.target.value)})}
                className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Demand Charge ($/kW)</label>
              <input
                type="number"
                step="0.5"
                value={rateConfig.demandCharge}
                onChange={(e) => setRateConfig({...rateConfig, demandCharge: parseFloat(e.target.value)})}
                className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Technical Constraints</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Peak Shaving Target (kW)</label>
              <input
                type="number"
                value={config.peakShavingTarget}
                onChange={(e) => setConfig({...config, peakShavingTarget: parseFloat(e.target.value)})}
                className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min State of Charge (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.minStateOfCharge * 100}
                onChange={(e) => setConfig({...config, minStateOfCharge: parseFloat(e.target.value) / 100})}
                className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max State of Charge (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.maxStateOfCharge * 100}
                onChange={(e) => setConfig({...config, maxStateOfCharge: parseFloat(e.target.value) / 100})}
                className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Battery className="w-4 h-4" />
                <span className="text-xs">Recommended Size</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {result.recommendedBatterySize.toFixed(0)} kWh
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Annual Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${result.economics.totalSavings.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Payback Period</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {result.economics.paybackPeriod.toFixed(1)} years
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">ROI</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {result.economics.roi.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Operation Schedule Chart */}
          {chartData && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Battery Operation Schedule (First 48 Hours)
              </h3>
              <div style={{ height: '300px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Economic Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Energy Cost Savings</span>
                  <span className="text-white">
                    ${result.economics.energyCostSavings.toLocaleString()}/year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Demand Charge Savings</span>
                  <span className="text-white">
                    ${result.economics.demandChargeSavings.toLocaleString()}/year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Reduction</span>
                  <span className="text-white">
                    {result.economics.peakReduction.toFixed(0)} kW
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-600">
                  <span className="text-gray-400">Net Present Value</span>
                  <span className={`font-medium ${
                    result.economics.npv > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${result.economics.npv.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                {hasSolar && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Self-Consumption Rate</span>
                    <span className="text-white">
                      {(result.performance.selfConsumptionRate * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Shaving Effectiveness</span>
                  <span className="text-white">
                    {(result.performance.peakShavingEffectiveness * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Grid Independence</span>
                  <span className="text-white">
                    {(result.performance.gridIndependence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cycles per Year</span>
                  <span className="text-white">
                    {result.performance.cyclesPerYear.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Battery Utilization</span>
                  <span className="text-white">
                    {(result.performance.batteryUtilization * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">About Battery Optimization</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Analyzes your load profile and electricity rates</li>
              <li>• Recommends optimal battery size for your needs</li>
              <li>• Generates charge/discharge schedule for maximum savings</li>
              <li>• Considers peak shaving, time-of-use rates, and solar integration</li>
              <li>• Provides detailed ROI and performance analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}