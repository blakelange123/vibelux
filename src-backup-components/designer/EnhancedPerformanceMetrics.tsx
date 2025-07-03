"use client"
import { Activity, Zap, Target, TrendingUp, BarChart3, Info } from 'lucide-react'

interface UniformityMetrics {
  minAvgRatio: number
  avgMaxRatio: number
  minMaxRatio: number
  cv: number
}

interface PerformanceMetricsProps {
  averagePPFD: number
  minPPFD: number
  maxPPFD: number
  uniformity: number // Backward compatibility
  uniformityMetrics?: UniformityMetrics
  dli: number
  powerDensity?: number
  efficacy?: number
  coverage?: number
  className?: string
}

export function EnhancedPerformanceMetrics({
  averagePPFD,
  minPPFD,
  maxPPFD,
  uniformity,
  uniformityMetrics,
  dli,
  powerDensity,
  efficacy,
  coverage,
  className = ""
}: PerformanceMetricsProps) {
  
  const getUniformityRating = (ratio: number): { color: string, label: string } => {
    if (ratio >= 0.9) return { color: 'text-green-400', label: 'Excellent' }
    if (ratio >= 0.8) return { color: 'text-green-300', label: 'Good' }
    if (ratio >= 0.7) return { color: 'text-yellow-400', label: 'Fair' }
    if (ratio >= 0.6) return { color: 'text-orange-400', label: 'Poor' }
    return { color: 'text-red-400', label: 'Very Poor' }
  }

  const getCVRating = (cv: number): { color: string, label: string } => {
    if (cv <= 15) return { color: 'text-green-400', label: 'Excellent' }
    if (cv <= 25) return { color: 'text-green-300', label: 'Good' }
    if (cv <= 35) return { color: 'text-yellow-400', label: 'Fair' }
    if (cv <= 50) return { color: 'text-orange-400', label: 'Poor' }
    return { color: 'text-red-400', label: 'Very Poor' }
  }

  const minAvgRating = getUniformityRating(uniformityMetrics?.minAvgRatio || uniformity)
  const cvRating = getCVRating(uniformityMetrics?.cv || 0)

  return (
    <div className={`bg-gray-800 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Metrics
        </h4>
        <div className="text-xs text-gray-400">
          Real-time calculations
        </div>
      </div>
      
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Avg PPFD</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {averagePPFD.toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">μmol/m²/s</div>
        </div>

        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">DLI</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {dli.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">mol/m²/d</div>
        </div>

        {powerDensity && (
          <div className="bg-gray-700 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Power Density</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {powerDensity.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">W/m²</div>
          </div>
        )}

        {efficacy && (
          <div className="bg-gray-700 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Efficacy</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {efficacy.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">PPF/W</div>
          </div>
        )}
      </div>

      {/* Enhanced Uniformity Analysis */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-white font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            Uniformity Analysis
          </h5>
          <div className="flex items-center gap-1 text-xs">
            <Info className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Industry Standards</span>
          </div>
        </div>
        
        {/* PPFD Range */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">PPFD Range</span>
            <span className="text-sm text-white">
              {minPPFD.toFixed(0)} - {maxPPFD.toFixed(0)} μmol/m²/s
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Min</span>
            <span>Avg: {averagePPFD.toFixed(0)}</span>
            <span>Max</span>
          </div>
        </div>

        {/* Uniformity Ratios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Min/Avg</div>
            <div className={`text-sm font-semibold ${minAvgRating.color}`}>
              {((uniformityMetrics?.minAvgRatio || uniformity) * 100).toFixed(1)}%
            </div>
            <div className={`text-xs ${minAvgRating.color}`}>
              {minAvgRating.label}
            </div>
          </div>
          
          {uniformityMetrics && (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Avg/Max</div>
                <div className={`text-sm font-semibold ${getUniformityRating(uniformityMetrics.avgMaxRatio).color}`}>
                  {(uniformityMetrics.avgMaxRatio * 100).toFixed(1)}%
                </div>
                <div className={`text-xs ${getUniformityRating(uniformityMetrics.avgMaxRatio).color}`}>
                  {getUniformityRating(uniformityMetrics.avgMaxRatio).label}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Min/Max</div>
                <div className={`text-sm font-semibold ${getUniformityRating(uniformityMetrics.minMaxRatio).color}`}>
                  {(uniformityMetrics.minMaxRatio * 100).toFixed(1)}%
                </div>
                <div className={`text-xs ${getUniformityRating(uniformityMetrics.minMaxRatio).color}`}>
                  {getUniformityRating(uniformityMetrics.minMaxRatio).label}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">CV</div>
                <div className={`text-sm font-semibold ${cvRating.color}`}>
                  {uniformityMetrics.cv.toFixed(1)}%
                </div>
                <div className={`text-xs ${cvRating.color}`}>
                  {cvRating.label}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Industry Standards Reference */}
        <div className="text-xs text-gray-500 pt-3 border-t border-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Good Uniformity:</span>
              <br />Min/Avg ≥ 80%, CV ≤ 25%
            </div>
            <div>
              <span className="font-medium">Excellent Uniformity:</span>
              <br />Min/Avg ≥ 90%, CV ≤ 15%
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Information */}
      {coverage !== undefined && (
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Target Coverage</span>
            <span className={`text-sm font-semibold ${
              coverage >= 95 ? 'text-green-400' :
              coverage >= 85 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {coverage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div 
              className={`h-1 rounded-full ${
                coverage >= 95 ? 'bg-green-400' :
                coverage >= 85 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(coverage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}