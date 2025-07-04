"use client"

import { useState, useEffect } from 'react'
import {
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Activity,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  MapPin,
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { EnhancedWeatherAPI, type WeatherData, type SpectrumRecommendation } from '@/lib/weather-api'
import { NRELAPIIntegration, type DSIREResponse, type UtilityRates } from '@/lib/nrel-api'
import { ControlsAnalyzer, type ControlAnalysisResult } from '@/lib/controls-analyzer'

interface WeatherAdaptiveLightingProps {
  currentFixtures?: Array<{
    id: string
    wattage: number
    technology: string
    voltage: string
  }>
  location?: {
    city?: string
    lat?: number
    lon?: number
    zipCode?: string
  }
  onSpectrumRecommendation?: (recommendation: SpectrumRecommendation) => void
  className?: string
}

export function WeatherAdaptiveLighting({
  currentFixtures = [],
  location = {},
  onSpectrumRecommendation,
  className = ''
}: WeatherAdaptiveLightingProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [spectrumRecommendation, setSpectrumRecommendation] = useState<SpectrumRecommendation | null>(null)
  const [incentiveData, setIncentiveData] = useState<DSIREResponse | null>(null)
  const [utilityRates, setUtilityRates] = useState<UtilityRates | null>(null)
  const [controlAnalysis, setControlAnalysis] = useState<ControlAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const weatherAPI = new EnhancedWeatherAPI()
  const nrelAPI = new NRELAPIIntegration()
  const controlsAnalyzer = new ControlsAnalyzer()

  useEffect(() => {
    if (location.city || (location.lat && location.lon)) {
      fetchWeatherData()
    }
    if (location.zipCode) {
      fetchEnergyData()
    }
    if (currentFixtures.length > 0) {
      analyzeControlSystems()
    }
  }, [location, currentFixtures])

  useEffect(() => {
    if (weatherData) {
      const recommendation = weatherAPI.getTemperatureSpectrumRecommendations(weatherData)
      if ('error' in recommendation) {
        setError(recommendation.error)
      } else {
        setSpectrumRecommendation(recommendation)
        onSpectrumRecommendation?.(recommendation)
      }
    }
  }, [weatherData])

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await weatherAPI.getCurrentWeather(
        location.city,
        location.lat,
        location.lon
      )

      if ('error' in result) {
        setError(result.error)
      } else {
        setWeatherData(result)
        setLastUpdated(new Date())
      }
    } catch (err) {
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnergyData = async () => {
    if (!location.zipCode) return

    try {
      const [incentives, rates] = await Promise.all([
        nrelAPI.getDSIREIncentives(location.zipCode, 'lighting', 'commercial'),
        nrelAPI.getUtilityRates(location.zipCode)
      ])

      if ('error' in incentives) {
        console.warn('Incentive data error:', incentives.error)
      } else {
        setIncentiveData(incentives)
      }

      if ('error' in rates) {
        console.warn('Utility rates error:', rates.error)
      } else {
        setUtilityRates(rates)
      }
    } catch (err) {
      console.warn('Energy data fetch error:', err)
    }
  }

  const analyzeControlSystems = () => {
    if (currentFixtures.length === 0) return

    // Convert fixture data to format expected by analyzer
    const fixtureData = currentFixtures.map(fixture => ({
      'Reported Input Wattage': fixture.wattage,
      'Input Voltage': fixture.voltage,
      'Lamp Technology': fixture.technology
    }))

    const analysis = controlsAnalyzer.analyzeControlCompatibility(fixtureData[0]) // Analyze first fixture as example
    setControlAnalysis(analysis)
  }

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear': return <Sun className="w-6 h-6 text-yellow-400" />
      case 'clouds': return <Cloud className="w-6 h-6 text-gray-400" />
      case 'rain': return <CloudRain className="w-6 h-6 text-blue-400" />
      default: return <Cloud className="w-6 h-6 text-gray-400" />
    }
  }

  const getVPDStatus = (vpd: number) => {
    if (vpd < 0.5) return { status: 'Low', color: 'text-blue-400', icon: CheckCircle }
    if (vpd > 1.5) return { status: 'High', color: 'text-red-400', icon: AlertTriangle }
    return { status: 'Optimal', color: 'text-green-400', icon: CheckCircle }
  }

  return (
    <div className={`bg-gray-800/50 rounded-xl border border-gray-700 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Weather-Adaptive Lighting
          </h3>
          <button
            onClick={fetchWeatherData}
            disabled={loading}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4 mx-auto"></div>
              <p className="text-gray-400">Fetching weather data...</p>
            </div>
          </div>
        )}

        {/* Demo Mode Notice */}
        {weatherData && !process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
            <p className="text-blue-400 text-sm">
              Demo Mode: Using simulated weather data. Add API keys to your environment for real data.
            </p>
          </div>
        )}

        {/* Current Weather Conditions */}
        {weatherData && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getWeatherIcon(weatherData.weatherMain)}
                  <span className="text-white text-sm font-medium">
                    {weatherData.location.city}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(weatherData.temperature)}°C
                </div>
                <div className="text-gray-400 text-xs">
                  {weatherData.weatherDescription}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">VPD Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const vpdStatus = getVPDStatus(weatherData.vpd)
                    const IconComponent = vpdStatus.icon
                    return (
                      <>
                        <IconComponent className={`w-4 h-4 ${vpdStatus.color}`} />
                        <span className={`text-sm ${vpdStatus.color}`}>
                          {vpdStatus.status}
                        </span>
                      </>
                    )
                  })()}
                </div>
                <div className="text-gray-400 text-xs">
                  {weatherData.vpd.toFixed(2)} kPa
                </div>
              </div>
            </div>

            {/* Environmental Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-900/30 rounded-lg p-2">
                <div className="flex justify-center mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-white text-sm font-medium">
                  {weatherData.humidity}%
                </div>
                <div className="text-gray-500 text-xs">Humidity</div>
              </div>

              <div className="bg-gray-900/30 rounded-lg p-2">
                <div className="flex justify-center mb-1">
                  <Wind className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-white text-sm font-medium">
                  {weatherData.windSpeed.toFixed(1)}
                </div>
                <div className="text-gray-500 text-xs">Wind m/s</div>
              </div>

              <div className="bg-gray-900/30 rounded-lg p-2">
                <div className="flex justify-center mb-1">
                  <Cloud className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-white text-sm font-medium">
                  {weatherData.cloudCover}%
                </div>
                <div className="text-gray-500 text-xs">Clouds</div>
              </div>

              <div className="bg-gray-900/30 rounded-lg p-2">
                <div className="flex justify-center mb-1">
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-white text-sm font-medium">
                  {(weatherData.lightTransmission * 100).toFixed(0)}%
                </div>
                <div className="text-gray-500 text-xs">Light</div>
              </div>
            </div>
          </div>
        )}

        {/* Spectrum Recommendations */}
        {spectrumRecommendation && (
          <div className="mt-4 bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
            <h4 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Adaptive Spectrum Recommendation
            </h4>
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center">
                <div className="text-blue-400 font-medium">
                  {spectrumRecommendation.recommendedSpectrum.bluePercent}%
                </div>
                <div className="text-gray-500 text-xs">Blue</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-medium">
                  {spectrumRecommendation.recommendedSpectrum.greenPercent}%
                </div>
                <div className="text-gray-500 text-xs">Green</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-medium">
                  {spectrumRecommendation.recommendedSpectrum.redPercent}%
                </div>
                <div className="text-gray-500 text-xs">Red</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-medium">
                  {spectrumRecommendation.recommendedSpectrum.farRedPercent}%
                </div>
                <div className="text-gray-500 text-xs">Far-Red</div>
              </div>
            </div>

            <p className="text-purple-200 text-sm">
              {spectrumRecommendation.recommendationText}
            </p>
            
            {/* Additional Actions */}
            <div className="mt-3 pt-3 border-t border-purple-600/30">
              <p className="text-purple-300 text-xs mb-2">Apply these settings to:</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs rounded-lg transition-colors">
                  Current Zone
                </button>
                <button className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs rounded-lg transition-colors">
                  All Zones
                </button>
                <button className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs rounded-lg transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Energy Incentives */}
        {incentiveData && incentiveData.incentives.length > 0 && (
          <div className="mt-4 bg-green-900/20 border border-green-600/30 rounded-lg p-3">
            <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Available Incentives ({incentiveData.totalPrograms})
            </h4>
            <div className="space-y-2">
              {incentiveData.incentives.slice(0, 3).map((incentive, index) => (
                <div key={index} className="text-sm">
                  <div className="text-green-200 font-medium">{incentive.programName}</div>
                  <div className="text-gray-400">{incentive.incentiveType} - ${incentive.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control System Analysis */}
        {controlAnalysis && (
          <div className="mt-4 bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
            <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Control System Analysis
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-blue-200 text-sm font-medium">Energy Savings Potential</div>
                <div className="text-white text-lg font-bold">
                  {(controlAnalysis.energySavingsPotential * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-sm font-medium">Est. Control Cost</div>
                <div className="text-white text-lg font-bold">
                  ${controlAnalysis.controlCostEstimate.toFixed(0)}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-blue-200 text-sm font-medium">Recommended Controls</div>
              <div className="text-gray-300 text-sm">
                {controlAnalysis.dimmingOptions
                  .sort((a, b) => b.compatibility - a.compatibility)[0]?.type || 'Basic Timer'}
              </div>
            </div>
          </div>
        )}

        {lastUpdated && (
          <div className="mt-4 text-center text-gray-500 text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}