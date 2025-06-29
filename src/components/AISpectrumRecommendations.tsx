"use client"

import { useState, useMemo } from 'react'
import { 
  Brain,
  Sparkles,
  TrendingUp,
  Info,
  Check,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Target,
  BookOpen,
  Settings,
  ChevronRight
} from 'lucide-react'
import { SpectrumAI } from '@/lib/spectrum-ai'

interface SpectrumData {
  blue: number
  green: number
  red: number
  farRed: number
}

interface AISpectrumRecommendationsProps {
  currentSpectrum: SpectrumData
  targetCrop: string
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  environmentalData?: {
    temperature: number
    humidity: number
    co2: number
  }
  onApplyRecommendation?: (spectrum: SpectrumData) => void
  className?: string
}

export function AISpectrumRecommendations({
  currentSpectrum,
  targetCrop,
  growthStage,
  environmentalData,
  onApplyRecommendation,
  className = ''
}: AISpectrumRecommendationsProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showReferences, setShowReferences] = useState(false)

  // Get AI recommendations
  const recommendation = useMemo(() => {
    return SpectrumAI.getRecommendation(
      targetCrop,
      growthStage,
      environmentalData ? {
        temperature: environmentalData.temperature,
        humidity: environmentalData.humidity,
        co2: environmentalData.co2,
        growthDensity: 'medium' // Default for now
      } : undefined
    )
  }, [targetCrop, growthStage, environmentalData])

  // Get recommended light levels
  const lightLevels = useMemo(() => ({
    dli: SpectrumAI.getDLIRecommendation(targetCrop, growthStage),
    ppfd: SpectrumAI.getPPFDRecommendation(targetCrop, growthStage),
    photoperiod: SpectrumAI.getPhotoperiodRecommendation(targetCrop, growthStage)
  }), [targetCrop, growthStage])

  // Analyze current spectrum
  const analysis = useMemo(() => {
    return SpectrumAI.analyzeSpectrum(currentSpectrum, targetCrop, growthStage)
  }, [currentSpectrum, targetCrop, growthStage])

  // Calculate spectrum differences
  const differences = {
    blue: recommendation.blue - currentSpectrum.blue,
    green: recommendation.green - currentSpectrum.green,
    red: recommendation.red - currentSpectrum.red,
    farRed: recommendation.farRed - currentSpectrum.farRed
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Check className="w-5 h-5 text-green-400" />
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-400" />
    return <AlertTriangle className="w-5 h-5 text-red-400" />
  }

  const formatDifference = (value: number) => {
    if (value > 0) return `+${value}%`
    return `${value}%`
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Spectrum Analysis</h3>
            <p className="text-sm text-gray-400">Research-based recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getScoreIcon(analysis.score)}
          <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}%
          </span>
        </div>
      </div>

      {/* Current vs Recommended */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Current Spectrum</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-400">Blue</span>
              <span className="text-white font-medium">{currentSpectrum.blue}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Green</span>
              <span className="text-white font-medium">{currentSpectrum.green}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">Red</span>
              <span className="text-white font-medium">{currentSpectrum.red}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400">Far Red</span>
              <span className="text-white font-medium">{currentSpectrum.farRed}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-700/50">
          <h4 className="text-sm font-medium text-purple-300 mb-3">AI Recommended</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-400">Blue</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{recommendation.blue}%</span>
                {differences.blue !== 0 && (
                  <span className={`text-xs ${differences.blue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatDifference(differences.blue)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Green</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{recommendation.green}%</span>
                {differences.green !== 0 && (
                  <span className={`text-xs ${differences.green > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatDifference(differences.green)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">Red</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{recommendation.red}%</span>
                {differences.red !== 0 && (
                  <span className={`text-xs ${differences.red > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatDifference(differences.red)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400">Far Red</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{recommendation.farRed}%</span>
                {differences.farRed !== 0 && (
                  <span className={`text-xs ${differences.farRed > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatDifference(differences.farRed)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Score */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/50 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Potential Efficiency</span>
          </div>
          <span className="text-2xl font-bold text-green-400">{recommendation.efficiency}%</span>
        </div>
        {analysis.potentialImprovement > 5 && (
          <p className="text-sm text-green-300">
            +{analysis.potentialImprovement.toFixed(0)}% improvement possible
          </p>
        )}
      </div>

      {/* Recommended Light Levels */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Target DLI</span>
          </div>
          <p className="text-xl font-bold text-white">{lightLevels.dli}</p>
          <p className="text-xs text-gray-500">mol/m²/day</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Target PPFD</span>
          </div>
          <p className="text-xl font-bold text-white">{lightLevels.ppfd}</p>
          <p className="text-xs text-gray-500">μmol/m²/s</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Photoperiod</span>
          </div>
          <p className="text-xl font-bold text-white">{lightLevels.photoperiod}h</p>
          <p className="text-xs text-gray-500">hours/day</p>
        </div>
      </div>

      {/* AI Rationale */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-4">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Rationale
        </h4>
        <p className="text-sm text-gray-300">{recommendation.rationale}</p>
      </div>

      {/* Improvement Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Suggested Improvements</h4>
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {onApplyRecommendation && (
        <button
          onClick={() => onApplyRecommendation(recommendation)}
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <Sparkles className="w-4 h-4" />
          Apply AI Recommendation
        </button>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
      >
        <Info className="w-4 h-4" />
        {showDetails ? 'Hide' : 'Show'} Technical Details
      </button>

      {/* Technical Details */}
      {showDetails && (
        <div className="mt-4 space-y-4">
          {/* Environmental Adjustments */}
          {environmentalData && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h5 className="text-sm font-medium text-white mb-2">Environmental Adjustments</h5>
              <div className="space-y-1 text-xs text-gray-400">
                <p>Temperature: {environmentalData.temperature}°C</p>
                <p>Humidity: {environmentalData.humidity}%</p>
                <p>CO₂: {environmentalData.co2} ppm</p>
              </div>
            </div>
          )}

          {/* References */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="w-full flex items-center justify-between text-sm font-medium text-white mb-2"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Research References
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showReferences ? 'rotate-90' : ''}`} />
            </button>
            
            {showReferences && (
              <div className="space-y-1">
                {recommendation.references.map((ref, index) => (
                  <p key={index} className="text-xs text-gray-400">• {ref}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          AI recommendations are based on peer-reviewed research and are continuously updated. 
          Results may vary based on cultivar, environmental conditions, and growing methods.
        </p>
      </div>
    </div>
  )
}