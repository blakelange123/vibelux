"use client"

import { useState, useEffect } from 'react'
import { WeatherAdaptiveLighting } from '@/components/WeatherAdaptiveLighting'
import { MapPin, AlertTriangle } from 'lucide-react'

export default function WeatherAdaptivePage() {
  const [location, setLocation] = useState<{
    city?: string
    lat?: number
    lon?: number
    zipCode?: string
  }>({})
  const [locationError, setLocationError] = useState<string | null>(null)
  const [manualLocation, setManualLocation] = useState({
    city: '',
    zipCode: ''
  })

  // Try to get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setLocationError(null)
        },
        (error) => {
          setLocationError('Unable to get your location. Please enter a city or zip code.')
        }
      )
    }
  }, [])

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualLocation.city || manualLocation.zipCode) {
      setLocation({
        city: manualLocation.city,
        zipCode: manualLocation.zipCode
      })
      setLocationError(null)
    }
  }

  // Example fixture data - in a real app, this would come from user's saved fixtures
  const exampleFixtures = [
    {
      id: '1',
      wattage: 600,
      technology: 'LED',
      voltage: '120-277V'
    },
    {
      id: '2',
      wattage: 400,
      technology: 'LED',
      voltage: '120-277V'
    }
  ]

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-purple-gradient">
            Weather-Adaptive Lighting
          </h1>
          <p className="text-gray-400">
            Optimize your lighting spectrum and controls based on real-time weather conditions
          </p>
        </div>

        {/* Location Setup */}
        {(!location.city && !location.lat) && (
          <div className="mb-8 bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Set Your Location
            </h2>
            
            {locationError && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <p className="text-yellow-400 text-sm">{locationError}</p>
              </div>
            )}

            <form onSubmit={handleManualLocationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City Name
                  </label>
                  <input
                    type="text"
                    value={manualLocation.city}
                    onChange={(e) => setManualLocation({ ...manualLocation, city: e.target.value })}
                    placeholder="e.g., Denver"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ZIP Code (for incentives)
                  </label>
                  <input
                    type="text"
                    value={manualLocation.zipCode}
                    onChange={(e) => setManualLocation({ ...manualLocation, zipCode: e.target.value })}
                    placeholder="e.g., 80202"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Set Location
              </button>
            </form>
          </div>
        )}

        {/* Weather Adaptive Component */}
        {(location.city || location.lat || location.zipCode) ? (
          <>
            {/* Location Display */}
            <div className="mb-6 bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Current Location</h3>
                    <p className="text-white font-semibold">
                      {location.city || `Lat: ${location.lat?.toFixed(4)}, Lon: ${location.lon?.toFixed(4)}`}
                      {location.zipCode && ` (${location.zipCode})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLocation({})}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Change Location
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherAdaptiveLighting
                currentFixtures={exampleFixtures}
                location={location}
                className="lg:col-span-2"
                onSpectrumRecommendation={(recommendation) => {
                }}
              />
            </div>
          </>
        ) : null}

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Monitors real-time weather conditions in your area</li>
              <li>• Calculates VPD (Vapor Pressure Deficit) for optimal growth</li>
              <li>• Adjusts spectrum recommendations based on temperature stress</li>
              <li>• Provides energy-saving control system recommendations</li>
              <li>• Identifies available rebates and incentives in your area</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Optimize plant growth with weather-adapted lighting</li>
              <li>• Reduce energy costs with intelligent controls</li>
              <li>• Prevent stress conditions before they occur</li>
              <li>• Maximize available rebates and incentives</li>
              <li>• Improve crop quality and yield consistency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}