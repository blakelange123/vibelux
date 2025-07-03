"use client"

import { useState, useMemo } from 'react'
import { 
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle,
  BarChart3,
  Sun,
  Moon,
  Info,
  Download
} from 'lucide-react'

interface TimeOfUseRate {
  id: string
  name: string
  startHour: number
  endHour: number
  rate: number // $/kWh
  color: string
}

interface UtilityProfile {
  id: string
  name: string
  region: string
  baseRate: number
  demandCharge: number // $/kW
  timeOfUseRates: TimeOfUseRate[]
  hasNetMetering: boolean
  solarBuybackRate: number
}

interface EnergyCostResult {
  dailyCost: number
  monthlyCost: number
  yearlyCost: number
  peakHoursCost: number
  offPeakHoursCost: number
  demandCharges: number
  totalWithDemand: number
  savingsOpportunity: number
  costBreakdown: {
    hour: number
    cost: number
    rate: number
    kWh: number
  }[]
}

// Common utility profiles
const UTILITY_PROFILES: UtilityProfile[] = [
  {
    id: 'pge-ca',
    name: 'PG&E California',
    region: 'California',
    baseRate: 0.12,
    demandCharge: 15,
    hasNetMetering: true,
    solarBuybackRate: 0.08,
    timeOfUseRates: [
      { id: 'peak', name: 'Peak', startHour: 16, endHour: 21, rate: 0.45, color: '#EF4444' },
      { id: 'partial', name: 'Partial Peak', startHour: 14, endHour: 16, rate: 0.35, color: '#F59E0B' },
      { id: 'partial2', name: 'Partial Peak', startHour: 21, endHour: 24, rate: 0.35, color: '#F59E0B' },
      { id: 'offpeak', name: 'Off-Peak', startHour: 0, endHour: 14, rate: 0.25, color: '#10B981' }
    ]
  },
  {
    id: 'coned-ny',
    name: 'ConEd New York',
    region: 'New York',
    baseRate: 0.15,
    demandCharge: 20,
    hasNetMetering: true,
    solarBuybackRate: 0.10,
    timeOfUseRates: [
      { id: 'peak', name: 'Peak', startHour: 8, endHour: 22, rate: 0.35, color: '#EF4444' },
      { id: 'offpeak', name: 'Off-Peak', startHour: 22, endHour: 8, rate: 0.20, color: '#10B981' }
    ]
  },
  {
    id: 'custom',
    name: 'Custom Utility',
    region: 'Custom',
    baseRate: 0.10,
    demandCharge: 0,
    hasNetMetering: false,
    solarBuybackRate: 0,
    timeOfUseRates: [
      { id: 'flat', name: 'Flat Rate', startHour: 0, endHour: 24, rate: 0.10, color: '#6B7280' }
    ]
  }
]

interface EnergyCostCalculatorProps {
  fixtures: {
    wattage: number
    enabled: boolean
    schedule?: { on: number; off: number }[]
  }[]
  photoperiod: number
  className?: string
}

export function EnergyCostCalculator({
  fixtures,
  photoperiod,
  className = ''
}: EnergyCostCalculatorProps) {
  const [selectedUtility, setSelectedUtility] = useState<UtilityProfile>(UTILITY_PROFILES[0])
  const [customPhotoperiod, setCustomPhotoperiod] = useState(photoperiod)
  const [lightingSchedule, setLightingSchedule] = useState({
    startHour: 6,
    endHour: 22
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [includeHVAC, setIncludeHVAC] = useState(true)
  const [hvacMultiplier, setHVACMultiplier] = useState(0.3) // 30% additional for cooling

  // Calculate total fixture power
  const totalPower = useMemo(() => {
    return fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
  }, [fixtures])

  // Calculate energy costs
  const costAnalysis = useMemo((): EnergyCostResult => {
    const totalKW = totalPower / 1000
    const hvacKW = includeHVAC ? totalKW * hvacMultiplier : 0
    const totalLoadKW = totalKW + hvacKW

    // Calculate hourly costs
    const costBreakdown: EnergyCostResult['costBreakdown'] = []
    let dailyCost = 0
    let peakHoursCost = 0
    let offPeakHoursCost = 0

    // Determine which hours the lights are on
    const lightsOn = new Array(24).fill(false)
    if (lightingSchedule.endHour > lightingSchedule.startHour) {
      for (let h = lightingSchedule.startHour; h < lightingSchedule.endHour; h++) {
        lightsOn[h] = true
      }
    } else {
      // Handle overnight schedules
      for (let h = lightingSchedule.startHour; h < 24; h++) {
        lightsOn[h] = true
      }
      for (let h = 0; h < lightingSchedule.endHour; h++) {
        lightsOn[h] = true
      }
    }

    // Calculate cost for each hour
    for (let hour = 0; hour < 24; hour++) {
      if (!lightsOn[hour]) {
        costBreakdown.push({ hour, cost: 0, rate: 0, kWh: 0 })
        continue
      }

      // Find applicable rate
      let rate = selectedUtility.baseRate
      const touRate = selectedUtility.timeOfUseRates.find(r => {
        if (r.endHour > r.startHour) {
          return hour >= r.startHour && hour < r.endHour
        } else {
          return hour >= r.startHour || hour < r.endHour
        }
      })
      
      if (touRate) {
        rate = touRate.rate
        if (touRate.name.includes('Peak')) {
          peakHoursCost += totalLoadKW * rate
        } else {
          offPeakHoursCost += totalLoadKW * rate
        }
      }

      const hourlyCost = totalLoadKW * rate
      dailyCost += hourlyCost

      costBreakdown.push({
        hour,
        cost: hourlyCost,
        rate,
        kWh: totalLoadKW
      })
    }

    // Calculate demand charges (based on peak kW)
    const peakDemand = Math.max(...costBreakdown.map(h => h.kWh))
    const monthlyDemandCharge = peakDemand * selectedUtility.demandCharge

    // Calculate potential savings by shifting to off-peak
    const peakRates = selectedUtility.timeOfUseRates.filter(r => r.name.includes('Peak'))
    const offPeakRates = selectedUtility.timeOfUseRates.filter(r => r.name.includes('Off-Peak'))
    const avgPeakRate = peakRates.length > 0 
      ? peakRates.reduce((sum, r) => sum + r.rate, 0) / peakRates.length
      : selectedUtility.baseRate
    const avgOffPeakRate = offPeakRates.length > 0
      ? offPeakRates.reduce((sum, r) => sum + r.rate, 0) / offPeakRates.length
      : selectedUtility.baseRate
    
    const currentPeakHours = costBreakdown.filter(h => {
      const touRate = selectedUtility.timeOfUseRates.find(r => {
        if (r.endHour > r.startHour) {
          return h.hour >= r.startHour && h.hour < r.endHour
        } else {
          return h.hour >= r.startHour || h.hour < r.endHour
        }
      })
      return touRate?.name.includes('Peak')
    }).length

    const savingsOpportunity = currentPeakHours * totalLoadKW * (avgPeakRate - avgOffPeakRate)

    return {
      dailyCost,
      monthlyCost: dailyCost * 30,
      yearlyCost: dailyCost * 365,
      peakHoursCost,
      offPeakHoursCost,
      demandCharges: monthlyDemandCharge,
      totalWithDemand: (dailyCost * 30) + monthlyDemandCharge,
      savingsOpportunity: savingsOpportunity * 30,
      costBreakdown
    }
  }, [totalPower, selectedUtility, lightingSchedule, includeHVAC, hvacMultiplier])

  // Export cost report
  const exportReport = () => {
    const report = {
      utility: selectedUtility.name,
      fixtures: {
        count: fixtures.filter(f => f.enabled).length,
        totalWattage: totalPower,
        hvacLoad: includeHVAC ? totalPower * hvacMultiplier : 0
      },
      schedule: lightingSchedule,
      costs: {
        daily: costAnalysis.dailyCost,
        monthly: costAnalysis.monthlyCost,
        yearly: costAnalysis.yearlyCost,
        demandCharges: costAnalysis.demandCharges,
        totalMonthly: costAnalysis.totalWithDemand
      },
      hourlyBreakdown: costAnalysis.costBreakdown,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energy-cost-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get rate color for visualization
  const getRateColor = (hour: number) => {
    const touRate = selectedUtility.timeOfUseRates.find(r => {
      if (r.endHour > r.startHour) {
        return hour >= r.startHour && hour < r.endHour
      } else {
        return hour >= r.startHour || hour < r.endHour
      }
    })
    return touRate?.color || '#6B7280'
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Energy Cost Calculator</h3>
            <p className="text-sm text-gray-400">Time-of-use rate optimization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Zap className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={exportReport}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Utility Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Utility Provider</label>
        <select
          value={selectedUtility.id}
          onChange={(e) => setSelectedUtility(UTILITY_PROFILES.find(u => u.id === e.target.value) || UTILITY_PROFILES[0])}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
        >
          {UTILITY_PROFILES.map(utility => (
            <option key={utility.id} value={utility.id}>
              {utility.name} - {utility.region}
            </option>
          ))}
        </select>
      </div>

      {/* Lighting Schedule */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Lighting Schedule</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Lights On</label>
            <div className="flex items-center gap-2 mt-1">
              <Sun className="w-4 h-4 text-yellow-400" />
              <input
                type="number"
                min="0"
                max="23"
                value={lightingSchedule.startHour}
                onChange={(e) => setLightingSchedule({...lightingSchedule, startHour: Number(e.target.value)})}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
              />
              <span className="text-gray-400 text-sm">:00</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Lights Off</label>
            <div className="flex items-center gap-2 mt-1">
              <Moon className="w-4 h-4 text-blue-400" />
              <input
                type="number"
                min="0"
                max="23"
                value={lightingSchedule.endHour}
                onChange={(e) => setLightingSchedule({...lightingSchedule, endHour: Number(e.target.value)})}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
              />
              <span className="text-gray-400 text-sm">:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time-of-Use Rate Visualization */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Time-of-Use Rate Schedule</h4>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          {/* 24-hour timeline */}
          <div className="relative h-16 mb-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const isLightOn = costAnalysis.costBreakdown[hour].kWh > 0
              return (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-r border-gray-700"
                  style={{
                    left: `${(hour / 24) * 100}%`,
                    width: `${100 / 24}%`,
                    backgroundColor: getRateColor(hour),
                    opacity: isLightOn ? 0.8 : 0.2
                  }}
                >
                  {isLightOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sun className="w-3 h-3 text-white opacity-60" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Hour labels */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>12AM</span>
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
            <span>12AM</span>
          </div>

          {/* Rate legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {selectedUtility.timeOfUseRates.map(rate => (
              <div key={rate.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: rate.color }}
                />
                <span className="text-xs text-gray-300">
                  {rate.name}: ${rate.rate.toFixed(3)}/kWh
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Daily Cost</p>
          <p className="text-xl font-bold text-white">${costAnalysis.dailyCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Monthly Cost</p>
          <p className="text-xl font-bold text-white">${costAnalysis.monthlyCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Yearly Cost</p>
          <p className="text-xl font-bold text-white">${costAnalysis.yearlyCost.toFixed(0)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Demand Charges</p>
          <p className="text-xl font-bold text-yellow-400">${costAnalysis.demandCharges.toFixed(2)}</p>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
          <h4 className="font-medium text-white mb-3">Advanced Settings</h4>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeHVAC}
                onChange={(e) => setIncludeHVAC(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-300">Include HVAC cooling load</span>
            </label>
            
            {includeHVAC && (
              <div>
                <label className="text-xs text-gray-400">HVAC Load Multiplier</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={hvacMultiplier}
                  onChange={(e) => setHVACMultiplier(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Additional {(hvacMultiplier * 100).toFixed(0)}% for cooling
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-white mb-2">Load Summary</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lighting Load:</span>
                  <span className="text-white">{(totalPower / 1000).toFixed(2)} kW</span>
                </div>
                {includeHVAC && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">HVAC Load:</span>
                    <span className="text-white">{((totalPower * hvacMultiplier) / 1000).toFixed(2)} kW</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Total Load:</span>
                  <span className="text-white">
                    {((totalPower * (1 + (includeHVAC ? hvacMultiplier : 0))) / 1000).toFixed(2)} kW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Opportunity */}
      {costAnalysis.savingsOpportunity > 0 && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/50 mb-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">
                Potential Savings Opportunity
              </p>
              <p className="text-2xl font-bold text-green-400 mb-2">
                ${costAnalysis.savingsOpportunity.toFixed(2)}/month
              </p>
              <p className="text-xs text-gray-300">
                By shifting lighting schedule to off-peak hours, you could save up to 
                ${(costAnalysis.savingsOpportunity * 12).toFixed(0)} annually.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Energy costs calculated based on current utility rates and time-of-use schedules. 
          Actual costs may vary. Consider demand response programs and solar integration 
          for additional savings.
        </p>
      </div>
    </div>
  )
}