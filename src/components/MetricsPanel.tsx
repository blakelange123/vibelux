"use client"

import { 
  Activity, 
  Zap, 
  TrendingUp, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface MetricsPanelProps {
  fixtureCount: number
  totalPower: number
  averagePPFD: number
  uniformity: number
  coverage: number
  roomArea: number
  targetPPFD: number
  powerCost: {
    daily: number
    monthly: number
    yearly: number
  }
  onShowEnergyCostCalculator?: () => void
  onShowMaintenanceScheduler?: () => void
  onShowEnergyMonitoring?: () => void
}

export function MetricsPanel({
  fixtureCount,
  totalPower,
  averagePPFD,
  uniformity,
  coverage,
  roomArea,
  targetPPFD,
  powerCost,
  onShowEnergyCostCalculator,
  onShowMaintenanceScheduler,
  onShowEnergyMonitoring
}: MetricsPanelProps) {
  const powerDensity = totalPower / roomArea
  const ppfdStatus = averagePPFD >= targetPPFD ? 'optimal' : averagePPFD >= targetPPFD * 0.8 ? 'warning' : 'critical'
  const uniformityStatus = uniformity >= 0.8 ? 'optimal' : uniformity >= 0.6 ? 'warning' : 'critical'

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-700 p-6 space-y-6">
      <h3 className="text-white font-semibold text-lg">Performance Analysis</h3>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Avg PPFD</p>
            {getStatusIcon(ppfdStatus)}
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(ppfdStatus)}`}>
            {averagePPFD.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {targetPPFD} μmol/m²/s
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Uniformity</p>
            {getStatusIcon(uniformityStatus)}
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(uniformityStatus)}`}>
            {(uniformity * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Min/Avg ratio
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Fixtures</span>
          </div>
          <span className="text-white font-medium">{fixtureCount}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Total Power</span>
          </div>
          <span className="text-white font-medium">{totalPower.toLocaleString()}W</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Power Density</span>
          </div>
          <span className="text-white font-medium">{powerDensity.toFixed(1)} W/ft²</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Coverage</span>
          </div>
          <span className="text-white font-medium">{coverage.toFixed(0)} ft²</span>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-800/50">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          <h4 className="text-white font-medium">Operating Costs</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-400">Daily</p>
            <p className="text-lg font-bold text-white">${powerCost.daily.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Monthly</p>
            <p className="text-lg font-bold text-white">${powerCost.monthly.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Yearly</p>
            <p className="text-lg font-bold text-white">${powerCost.yearly.toFixed(0)}</p>
          </div>
        </div>
        
        {onShowEnergyCostCalculator && (
          <button
            onClick={onShowEnergyCostCalculator}
            className="w-full mt-3 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 rounded-lg text-yellow-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Advanced Energy Analysis
          </button>
        )}
        
        {onShowMaintenanceScheduler && (
          <button
            onClick={onShowMaintenanceScheduler}
            className="w-full mt-2 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/50 rounded-lg text-orange-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Maintenance Schedule
          </button>
        )}
        
        {onShowEnergyMonitoring && (
          <button
            onClick={onShowEnergyMonitoring}
            className="w-full mt-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 rounded-lg text-blue-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Real-time Monitoring
          </button>
        )}
      </div>

      {/* Recommendations */}
      {(ppfdStatus !== 'optimal' || uniformityStatus !== 'optimal') && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-700">
          <h4 className="text-white font-medium text-sm mb-2">Recommendations</h4>
          
          {ppfdStatus !== 'optimal' && (
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5" />
              <p className="text-gray-300">
                {ppfdStatus === 'critical' 
                  ? 'Add more fixtures or increase mounting height to achieve target PPFD.'
                  : 'Consider adding 1-2 more fixtures for optimal coverage.'}
              </p>
            </div>
          )}
          
          {uniformityStatus !== 'optimal' && (
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5" />
              <p className="text-gray-300">
                {uniformityStatus === 'critical'
                  ? 'Redistribute fixtures for better uniformity. Consider a grid layout.'
                  : 'Slight fixture repositioning could improve uniformity.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}