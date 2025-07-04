"use client"

import { useState } from 'react'
import { 
  Thermometer,
  Droplets,
  Wind,
  Cloud,
  Sun,
  Moon,
  Settings,
  Save,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  Calendar
} from 'lucide-react'

interface ClimateProfile {
  id: string
  name: string
  temperature: {
    day: number
    night: number
    tolerance: number
  }
  humidity: {
    day: number
    night: number
    tolerance: number
  }
  co2: {
    day: number
    night: number
  }
  vpd: {
    target: number
    min: number
    max: number
  }
  lightIntensity: number
  photoperiod: {
    on: string
    off: string
  }
}

interface Zone {
  id: string
  name: string
  type: 'propagation' | 'vegetative' | 'flowering' | 'drying'
  currentProfile: string
  plantCount: number
  dayInPhase: number
  totalDays: number
  transitions: {
    nextZone: string
    triggerDay: number
    automatic: boolean
  }
}

interface ScheduledTransition {
  id: string
  fromZone: string
  toZone: string
  scheduledDate: string
  plantCount: number
  status: 'pending' | 'in-progress' | 'completed'
}

export function MultiZoneClimateManager() {
  const [selectedZone, setSelectedZone] = useState<string>('zone-1')
  const [editMode, setEditMode] = useState(false)
  const [showProfileLibrary, setShowProfileLibrary] = useState(false)

  // Climate profiles for different growth stages
  const [climateProfiles] = useState<ClimateProfile[]>([
    {
      id: 'prop-standard',
      name: 'Propagation Standard',
      temperature: { day: 25, night: 23, tolerance: 1 },
      humidity: { day: 70, night: 75, tolerance: 5 },
      co2: { day: 800, night: 400 },
      vpd: { target: 0.8, min: 0.6, max: 1.0 },
      lightIntensity: 200,
      photoperiod: { on: '06:00', off: '00:00' }
    },
    {
      id: 'veg-aggressive',
      name: 'Vegetative Aggressive',
      temperature: { day: 26, night: 22, tolerance: 1.5 },
      humidity: { day: 65, night: 70, tolerance: 5 },
      co2: { day: 1200, night: 400 },
      vpd: { target: 1.0, min: 0.8, max: 1.2 },
      lightIntensity: 400,
      photoperiod: { on: '06:00', off: '00:00' }
    },
    {
      id: 'flower-standard',
      name: 'Flowering Standard',
      temperature: { day: 24, night: 20, tolerance: 1 },
      humidity: { day: 55, night: 60, tolerance: 5 },
      co2: { day: 1000, night: 400 },
      vpd: { target: 1.2, min: 1.0, max: 1.4 },
      lightIntensity: 650,
      photoperiod: { on: '06:00', off: '18:00' }
    },
    {
      id: 'flower-late',
      name: 'Late Flowering',
      temperature: { day: 22, night: 18, tolerance: 1 },
      humidity: { day: 45, night: 50, tolerance: 5 },
      co2: { day: 800, night: 400 },
      vpd: { target: 1.4, min: 1.2, max: 1.6 },
      lightIntensity: 600,
      photoperiod: { on: '06:00', off: '18:00' }
    }
  ])

  // Zone configurations
  const [zones] = useState<Zone[]>([
    {
      id: 'zone-1',
      name: 'Propagation Bay A',
      type: 'propagation',
      currentProfile: 'prop-standard',
      plantCount: 1200,
      dayInPhase: 5,
      totalDays: 7,
      transitions: {
        nextZone: 'zone-2',
        triggerDay: 7,
        automatic: true
      }
    },
    {
      id: 'zone-2',
      name: 'Vegetative Hall 1',
      type: 'vegetative',
      currentProfile: 'veg-aggressive',
      plantCount: 800,
      dayInPhase: 18,
      totalDays: 21,
      transitions: {
        nextZone: 'zone-3',
        triggerDay: 21,
        automatic: true
      }
    },
    {
      id: 'zone-3',
      name: 'Flowering Room A',
      type: 'flowering',
      currentProfile: 'flower-standard',
      plantCount: 600,
      dayInPhase: 42,
      totalDays: 56,
      transitions: {
        nextZone: 'harvest',
        triggerDay: 56,
        automatic: false
      }
    }
  ])

  // Scheduled transitions
  const [transitions] = useState<ScheduledTransition[]>([
    {
      id: 't-1',
      fromZone: 'zone-1',
      toZone: 'zone-2',
      scheduledDate: '2024-01-15 14:00',
      plantCount: 400,
      status: 'pending'
    },
    {
      id: 't-2',
      fromZone: 'zone-2',
      toZone: 'zone-3',
      scheduledDate: '2024-01-16 10:00',
      plantCount: 200,
      status: 'pending'
    }
  ])

  const currentZone = zones.find(z => z.id === selectedZone) || zones[0]
  const currentProfile = climateProfiles.find(p => p.id === currentZone.currentProfile)

  return (
    <div className="space-y-6">
      {/* Zone Overview */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Multi-Zone Climate Control</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfileLibrary(!showProfileLibrary)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Profile Library
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Transition
            </button>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {zones.map((zone) => {
            const progress = (zone.dayInPhase / zone.totalDays) * 100
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedZone === zone.id
                    ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/20'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{zone.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    zone.type === 'propagation' ? 'bg-blue-500/20 text-blue-400' :
                    zone.type === 'vegetative' ? 'bg-green-500/20 text-green-400' :
                    zone.type === 'flowering' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {zone.type}
                  </span>
                </div>
                <div className="text-left mb-2">
                  <p className="text-sm text-gray-400">{zone.plantCount} plants</p>
                  <p className="text-xs text-gray-500">Day {zone.dayInPhase} of {zone.totalDays}</p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Current Zone Climate Settings */}
      {currentProfile && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{currentZone.name} Climate Settings</h3>
              <p className="text-sm text-gray-400 mt-1">Profile: {currentProfile.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temperature */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <h4 className="font-medium text-white">Temperature</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Day</span>
                    <Sun className="w-4 h-4 text-yellow-400" />
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={currentProfile.temperature.day}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.temperature.day}°C</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Night</span>
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={currentProfile.temperature.night}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.temperature.night}°C</p>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Tolerance: ±{currentProfile.temperature.tolerance}°C</span>
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Humidity</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Day</span>
                    <Sun className="w-4 h-4 text-yellow-400" />
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={currentProfile.humidity.day}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.humidity.day}%</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Night</span>
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={currentProfile.humidity.night}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.humidity.night}%</p>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Tolerance: ±{currentProfile.humidity.tolerance}%</span>
                </div>
              </div>
            </div>

            {/* CO2 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">CO₂ Levels</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Day</span>
                    <Sun className="w-4 h-4 text-yellow-400" />
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={currentProfile.co2.day}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.co2.day}</p>
                  )}
                  <p className="text-xs text-gray-500">ppm</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Night</span>
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={currentProfile.co2.night}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.co2.night}</p>
                  )}
                  <p className="text-xs text-gray-500">ppm</p>
                </div>
              </div>
            </div>

            {/* VPD */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">VPD Control</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Target VPD</span>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.1"
                      value={currentProfile.vpd.target}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white mt-1"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">{currentProfile.vpd.target}</p>
                  )}
                  <p className="text-xs text-gray-500">kPa</p>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Min: {currentProfile.vpd.min}</span>
                    <span className="text-gray-500">Max: {currentProfile.vpd.max}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full"
                      style={{ 
                        width: '60%',
                        marginLeft: '20%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lighting Settings */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Lighting Schedule</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-400">Intensity</span>
                <p className="text-xl font-bold text-white">{currentProfile.lightIntensity} μmol/m²/s</p>
              </div>
              <div>
                <span className="text-sm text-gray-400">Lights On</span>
                <p className="text-xl font-bold text-white">{currentProfile.photoperiod.on}</p>
              </div>
              <div>
                <span className="text-sm text-gray-400">Lights Off</span>
                <p className="text-xl font-bold text-white">{currentProfile.photoperiod.off}</p>
              </div>
            </div>
          </div>

          {/* Transition Settings */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Zone Transition</h4>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                currentZone.transitions.automatic
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {currentZone.transitions.automatic ? 'Automatic' : 'Manual'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-400">Next Zone</span>
                <p className="text-lg font-medium text-white">
                  {zones.find(z => z.id === currentZone.transitions.nextZone)?.name || 'Harvest'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-400">Transition Day</span>
                <p className="text-lg font-medium text-white">
                  Day {currentZone.transitions.triggerDay} ({currentZone.transitions.triggerDay - currentZone.dayInPhase} days remaining)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Transitions */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scheduled Transitions</h3>
        <div className="space-y-3">
          {transitions.map((transition) => {
            const fromZone = zones.find(z => z.id === transition.fromZone)
            const toZone = zones.find(z => z.id === transition.toZone)
            return (
              <div
                key={transition.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transition.status === 'pending' ? 'bg-yellow-500/20' :
                    transition.status === 'in-progress' ? 'bg-blue-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      transition.status === 'pending' ? 'text-yellow-400' :
                      transition.status === 'in-progress' ? 'text-blue-400' :
                      'text-green-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {fromZone?.name} → {toZone?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {transition.plantCount} plants • {transition.scheduledDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transition.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    transition.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {transition.status}
                  </span>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile Library Modal */}
      {showProfileLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Climate Profile Library</h3>
              <button
                onClick={() => setShowProfileLibrary(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {climateProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <h4 className="font-medium text-white mb-2">{profile.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Temp:</span>
                      <span className="text-white ml-1">{profile.temperature.day}/{profile.temperature.night}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-400">RH:</span>
                      <span className="text-white ml-1">{profile.humidity.day}/{profile.humidity.night}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">CO₂:</span>
                      <span className="text-white ml-1">{profile.co2.day} ppm</span>
                    </div>
                    <div>
                      <span className="text-gray-400">VPD:</span>
                      <span className="text-white ml-1">{profile.vpd.target} kPa</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-1 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm">
                      Apply
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Profile
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                Create New Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}