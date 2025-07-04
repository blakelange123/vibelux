"use client"

import { useState, useEffect } from 'react'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Gauge,
  Battery,
  Sun
} from 'lucide-react'

interface EnergyData {
  timestamp: Date
  power: number // Watts
  energy: number // kWh
  cost: number // $
}

interface PeakDemand {
  value: number
  timestamp: Date
}

export function EnergyMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [currentPower, setCurrentPower] = useState(3250)
  const [totalEnergy, setTotalEnergy] = useState(78.5)
  const [totalCost, setTotalCost] = useState(9.42)
  const [peakDemand, setPeakDemand] = useState<PeakDemand>({ value: 4500, timestamp: new Date() })
  const [powerFactor, setPowerFactor] = useState(0.95)
  const [energyCostPerKWh] = useState(0.12)

  // Simulate real-time power updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPower(prev => {
        const change = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 200
        return Math.max(0, prev + change)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getTimeRangeMultiplier = () => {
    switch (timeRange) {
      case 'day': return 1
      case 'week': return 7
      case 'month': return 30
      case 'year': return 365
    }
  }

  const calculateProjectedCost = () => {
    const dailyCost = totalCost
    const multiplier = getTimeRangeMultiplier()
    return dailyCost * multiplier
  }

  const getEfficiencyRating = () => {
    if (powerFactor >= 0.95) return { label: 'Excellent', color: 'text-green-600' }
    if (powerFactor >= 0.90) return { label: 'Good', color: 'text-yellow-600' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  const mockHourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    power: Math.max(0, 3000 + Math.sin(i / 3) * 1500 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 500),
    cost: 0
  })).map(d => ({ ...d, cost: (d.power / 1000) * energyCostPerKWh }))

  const maxPower = Math.max(...mockHourlyData.map(d => d.power))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold">Energy Monitoring</h3>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg capitalize ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
          <p className="text-2xl font-bold">{currentPower.toFixed(0)}W</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Power</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Battery className="w-5 h-5 text-green-600" />
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{totalEnergy.toFixed(1)} kWh</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Energy</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <span className="text-xs text-yellow-600">
              ${energyCostPerKWh}/kWh
            </span>
          </div>
          <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Energy Cost</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Gauge className="w-5 h-5 text-orange-600" />
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">{peakDemand.value}W</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Peak Demand</p>
        </div>
      </div>

      {/* Power Usage Chart */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Power Usage Pattern</h4>
        <div className="h-48 relative">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {mockHourlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer"
                  style={{ height: `${(data.power / maxPower) * 100}%` }}
                  title={`${data.hour}:00 - ${data.power.toFixed(0)}W`}
                />
                {index % 4 === 0 && (
                  <span className="text-xs text-gray-500 mt-1">{data.hour}:00</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-3">Cost Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Lighting</span>
              <span className="font-medium">75%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">HVAC</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Other</span>
              <span className="font-medium">5%</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Projected {timeRange}</span>
                <span className="font-bold text-lg text-indigo-600">
                  ${calculateProjectedCost().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-3">Efficiency Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Power Factor</span>
              <span className={`font-medium ${getEfficiencyRating().color}`}>
                {powerFactor.toFixed(2)} - {getEfficiencyRating().label}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Load Factor</span>
              <span className="font-medium">82%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Utilization</span>
              <span className="font-medium">91%</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Efficiency Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: '87%' }}
                    />
                  </div>
                  <span className="font-bold">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Sun className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Optimization Opportunities</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Shift 30% of lighting load to off-peak hours to save $12/day</li>
              <li>• Implement dimming controls during low-activity periods</li>
              <li>• Consider upgrading to higher efficiency fixtures for 15% energy reduction</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {peakDemand.value > 4000 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                High Peak Demand Alert
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Peak demand exceeded 4kW at {peakDemand.timestamp.toLocaleTimeString()}.
                Consider load balancing to avoid demand charges.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}