"use client"

import { useState, useEffect } from 'react'
import { 
  Sun, 
  MapPin, 
  Calendar,
  TrendingUp,
  DollarSign,
  Info,
  ChevronDown
} from 'lucide-react'
import {
  solarRadiationDatabase,
  getSolarRadiationByLocation,
  getMonthlyDLIFromSolar,
  calculateSupplementalDLI,
  calculateAnnualSupplementalCost,
  type SolarRadiationData
} from '@/lib/solar-radiation-data'

interface SolarRadiationPanelProps {
  targetDLI: number
  photoperiod: number
  fixtureWattage: number
  electricityRate: number
  onLocationChange?: (location: SolarRadiationData) => void
  className?: string
}

export default function SolarRadiationPanel({
  targetDLI,
  photoperiod,
  fixtureWattage,
  electricityRate,
  onLocationChange,
  className = ''
}: SolarRadiationPanelProps) {
  const [selectedLocation, setSelectedLocation] = useState<SolarRadiationData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const monthKeys = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ] as const

  // Get user's current location
  const getCurrentLocation = () => {
    setLoadingLocation(true)
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = getSolarRadiationByLocation(
            position.coords.latitude,
            position.coords.longitude
          )
          if (location) {
            setSelectedLocation(location)
            onLocationChange?.(location)
          }
          setLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLoadingLocation(false)
          // Default to Los Angeles
          const defaultLocation = solarRadiationDatabase[0]
          setSelectedLocation(defaultLocation)
          onLocationChange?.(defaultLocation)
        }
      )
    } else {
      // Default to Los Angeles
      const defaultLocation = solarRadiationDatabase[0]
      setSelectedLocation(defaultLocation)
      onLocationChange?.(defaultLocation)
      setLoadingLocation(false)
    }
  }

  useEffect(() => {
    // Initialize with first location
    if (!selectedLocation && solarRadiationDatabase.length > 0) {
      setSelectedLocation(solarRadiationDatabase[0])
    }
  }, [selectedLocation])

  if (!selectedLocation) return null

  const currentMonthKey = monthKeys[selectedMonth]
  const currentSolarRadiation = selectedLocation.monthlyData[currentMonthKey]
  const naturalDLI = getMonthlyDLIFromSolar(currentSolarRadiation)
  const { supplementalDLI, supplementalPPFD } = calculateSupplementalDLI(
    targetDLI,
    naturalDLI,
    photoperiod
  )

  const annualData = calculateAnnualSupplementalCost(
    selectedLocation,
    targetDLI,
    photoperiod,
    fixtureWattage,
    electricityRate
  )

  // Calculate seasonal variations
  const seasonalData = {
    winter: getMonthlyDLIFromSolar(selectedLocation.peakSunHours.winter),
    spring: getMonthlyDLIFromSolar(selectedLocation.peakSunHours.spring),
    summer: getMonthlyDLIFromSolar(selectedLocation.peakSunHours.summer),
    fall: getMonthlyDLIFromSolar(selectedLocation.peakSunHours.fall)
  }

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'winter': return 'text-blue-400'
      case 'spring': return 'text-green-400'
      case 'summer': return 'text-yellow-400'
      case 'fall': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Solar Radiation Analysis</h3>
            <p className="text-sm text-gray-400">Natural light contribution to DLI</p>
          </div>
        </div>
      </div>

      {/* Location Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Location</label>
        <div className="space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-left flex items-center justify-between hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{selectedLocation.city}, {selectedLocation.state}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                showLocationDropdown ? 'rotate-180' : ''
              }`} />
            </button>

            {showLocationDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {Object.entries(
                  solarRadiationDatabase.reduce((acc, location) => {
                    if (!acc[location.region]) acc[location.region] = []
                    acc[location.region].push(location)
                    return acc
                  }, {} as Record<string, SolarRadiationData[]>)
                ).map(([region, locations]) => (
                  <div key={region}>
                    <div className="px-3 py-2 text-xs text-gray-500 bg-gray-800/50 font-medium">
                      {region}
                    </div>
                    {locations.map((location) => (
                      <button
                        key={`${location.city}-${location.state}`}
                        onClick={() => {
                          setSelectedLocation(location)
                          onLocationChange?.(location)
                          setShowLocationDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-all flex items-center justify-between"
                      >
                        <span className="text-sm">{location.city}, {location.state}</span>
                        <span className="text-xs text-gray-400">
                          {location.annualAverage.toFixed(1)} kWh/m²/day
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={getCurrentLocation}
            disabled={loadingLocation}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {loadingLocation ? 'Getting location...' : 'Use Current Location'}
          </button>
        </div>
      </div>

      {/* Month Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>{month}</option>
          ))}
        </select>
      </div>

      {/* Solar Radiation Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Solar Radiation</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {currentSolarRadiation.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400">kWh/m²/day</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Natural DLI</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {naturalDLI.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400">mol/m²/day</p>
        </div>
      </div>

      {/* Supplemental Lighting Requirements */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-700/50 mb-6">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Supplemental Lighting Requirements
        </h4>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Target DLI:</span>
            <span className="text-white font-medium">{targetDLI} mol/m²/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Natural DLI:</span>
            <span className="text-green-400 font-medium">{naturalDLI.toFixed(1)} mol/m²/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Supplemental DLI:</span>
            <span className="text-blue-400 font-medium">{supplementalDLI.toFixed(1)} mol/m²/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Required PPFD:</span>
            <span className="text-purple-400 font-medium">{supplementalPPFD.toFixed(0)} μmol/m²/s</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4">
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 relative"
              style={{ width: `${Math.min((naturalDLI / targetDLI) * 100, 100)}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900">
                {((naturalDLI / targetDLI) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Natural light provides {((naturalDLI / targetDLI) * 100).toFixed(0)}% of target DLI
          </p>
        </div>
      </div>

      {/* Seasonal Variations */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Seasonal Natural DLI</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(seasonalData).map(([season, dli]) => (
            <div key={season} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <span className={`text-xs font-medium ${getSeasonColor(season)} capitalize`}>
                {season}
              </span>
              <p className="text-lg font-bold text-white mt-1">{dli.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Cost Analysis */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Annual Supplemental Lighting Cost
        </h4>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-300">Annual Cost:</span>
            <span className="text-white font-bold text-lg">
              ${annualData.annualCost.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Avg. Supplemental DLI:</span>
            <span className="text-white">
              {annualData.annualSupplementalDLI.toFixed(1)} mol/m²/day
            </span>
          </div>
        </div>

        {/* Monthly Cost Chart */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400 mb-2">Monthly Costs</p>
          {monthKeys.map((month, index) => {
            const cost = annualData.monthlyCosts[month]
            const maxCost = Math.max(...Object.values(annualData.monthlyCosts))
            const percentage = (cost / maxCost) * 100
            
            return (
              <div key={month} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12 capitalize">
                  {month.slice(0, 3)}
                </span>
                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-red-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-white w-12 text-right">
                  ${cost.toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Solar radiation data from NREL. Natural DLI calculated assuming 45% PAR fraction 
          of total solar radiation. Actual values may vary based on greenhouse glazing, 
          weather patterns, and local conditions.
        </p>
      </div>
    </div>
  )
}