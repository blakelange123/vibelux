"use client"

import { useState } from 'react'
import { Leaf, Sun, Droplets, TrendingUp, Calendar, Target, AlertCircle, ChevronRight } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface CropPhase {
  name: string
  duration: number // days
  lightHours: number
  lightIntensity: number // PPFD
  temperature: { day: number; night: number }
  humidity: { day: number; night: number }
  vpd: { day: number; night: number }
  ec: { min: number; max: number }
  ph: { min: number; max: number }
  co2: number
  irrigation: { frequency: string; volume: string }
}

interface Strain {
  id: string
  name: string
  type: 'indica' | 'sativa' | 'hybrid'
  floweringTime: number // weeks
  phases: CropPhase[]
  currentPhase: number
  dayInPhase: number
  startDate: string
}

export function CropSteering() {
  const [selectedStrain, setSelectedStrain] = useState<string>('strain-1')
  const [strains] = useState<Strain[]>([
    {
      id: 'strain-1',
      name: 'Blue Dream',
      type: 'hybrid',
      floweringTime: 9,
      currentPhase: 2,
      dayInPhase: 14,
      startDate: '2024-01-01',
      phases: [
        {
          name: 'Clone/Seedling',
          duration: 14,
          lightHours: 18,
          lightIntensity: 200,
          temperature: { day: 75, night: 70 },
          humidity: { day: 70, night: 75 },
          vpd: { day: 0.6, night: 0.5 },
          ec: { min: 0.8, max: 1.2 },
          ph: { min: 5.8, max: 6.2 },
          co2: 600,
          irrigation: { frequency: '2x daily', volume: '50ml' }
        },
        {
          name: 'Vegetative',
          duration: 28,
          lightHours: 18,
          lightIntensity: 600,
          temperature: { day: 78, night: 72 },
          humidity: { day: 60, night: 65 },
          vpd: { day: 1.0, night: 0.8 },
          ec: { min: 1.5, max: 2.0 },
          ph: { min: 5.8, max: 6.2 },
          co2: 800,
          irrigation: { frequency: '3x daily', volume: '150ml' }
        },
        {
          name: 'Early Flower',
          duration: 21,
          lightHours: 12,
          lightIntensity: 800,
          temperature: { day: 76, night: 68 },
          humidity: { day: 50, night: 55 },
          vpd: { day: 1.2, night: 1.0 },
          ec: { min: 2.0, max: 2.5 },
          ph: { min: 5.8, max: 6.2 },
          co2: 1000,
          irrigation: { frequency: '4x daily', volume: '200ml' }
        },
        {
          name: 'Mid Flower',
          duration: 28,
          lightHours: 12,
          lightIntensity: 900,
          temperature: { day: 74, night: 66 },
          humidity: { day: 45, night: 50 },
          vpd: { day: 1.3, night: 1.1 },
          ec: { min: 2.2, max: 2.8 },
          ph: { min: 5.8, max: 6.2 },
          co2: 1200,
          irrigation: { frequency: '4x daily', volume: '250ml' }
        },
        {
          name: 'Late Flower',
          duration: 14,
          lightHours: 12,
          lightIntensity: 800,
          temperature: { day: 72, night: 64 },
          humidity: { day: 40, night: 45 },
          vpd: { day: 1.4, night: 1.2 },
          ec: { min: 1.8, max: 2.2 },
          ph: { min: 5.8, max: 6.2 },
          co2: 1000,
          irrigation: { frequency: '3x daily', volume: '200ml' }
        },
        {
          name: 'Flush/Harvest',
          duration: 7,
          lightHours: 12,
          lightIntensity: 600,
          temperature: { day: 70, night: 62 },
          humidity: { day: 35, night: 40 },
          vpd: { day: 1.5, night: 1.3 },
          ec: { min: 0.0, max: 0.5 },
          ph: { min: 6.0, max: 6.5 },
          co2: 800,
          irrigation: { frequency: '2x daily', volume: '150ml (plain water)' }
        }
      ]
    }
  ])

  const currentStrain = strains.find(s => s.id === selectedStrain)!
  const currentPhase = currentStrain.phases[currentStrain.currentPhase]
  const totalDays = currentStrain.phases.reduce((sum, phase) => sum + phase.duration, 0)
  const daysComplete = currentStrain.phases
    .slice(0, currentStrain.currentPhase)
    .reduce((sum, phase) => sum + phase.duration, 0) + currentStrain.dayInPhase

  // Generate performance data
  const performanceData = [
    { metric: 'Light', current: 95, target: 100 },
    { metric: 'Temperature', current: 98, target: 100 },
    { metric: 'Humidity', current: 92, target: 100 },
    { metric: 'VPD', current: 88, target: 100 },
    { metric: 'EC/pH', current: 96, target: 100 },
    { metric: 'CO2', current: 90, target: 100 }
  ]

  // Calculate days until next phase
  const daysUntilNextPhase = currentPhase.duration - currentStrain.dayInPhase

  return (
    <div className="space-y-6">
      {/* Strain Overview */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            Crop Steering Dashboard
          </h3>
          <select
            value={selectedStrain}
            onChange={(e) => setSelectedStrain(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            {strains.map(strain => (
              <option key={strain.id} value={strain.id}>
                {strain.name} ({strain.type})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Current Phase</p>
            <p className="text-xl font-bold text-white">{currentPhase.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              Day {currentStrain.dayInPhase} of {currentPhase.duration}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Overall Progress</p>
            <p className="text-xl font-bold text-white">
              {Math.round((daysComplete / totalDays) * 100)}%
            </p>
            <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(daysComplete / totalDays) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Next Phase In</p>
            <p className="text-xl font-bold text-white">{daysUntilNextPhase} days</p>
            <p className="text-sm text-gray-500 mt-1">
              {currentStrain.currentPhase < currentStrain.phases.length - 1 
                ? currentStrain.phases[currentStrain.currentPhase + 1].name
                : 'Harvest Ready'}
            </p>
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {currentStrain.phases.map((phase, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  idx < currentStrain.currentPhase 
                    ? 'bg-green-900/20 text-green-400 border border-green-600/30'
                    : idx === currentStrain.currentPhase
                    ? 'bg-purple-900/20 text-purple-400 border border-purple-600/30'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {phase.name}
                </div>
                {idx < currentStrain.phases.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-600 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Phase Parameters */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Current Phase Parameters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Light</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {currentPhase.lightHours}h @ {currentPhase.lightIntensity} PPFD
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Irrigation</span>
            </div>
            <p className="text-sm font-medium text-white">
              {currentPhase.irrigation.frequency}
            </p>
            <p className="text-sm text-gray-500">{currentPhase.irrigation.volume}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">EC Range</p>
            <p className="text-lg font-semibold text-white">
              {currentPhase.ec.min} - {currentPhase.ec.max}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">pH Range</p>
            <p className="text-lg font-semibold text-white">
              {currentPhase.ph.min} - {currentPhase.ph.max}
            </p>
          </div>
        </div>

        {/* Environmental Targets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Temperature</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Day</span>
                <span className="text-sm font-medium text-white">{currentPhase.temperature.day}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Night</span>
                <span className="text-sm font-medium text-white">{currentPhase.temperature.night}°F</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Humidity</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Day</span>
                <span className="text-sm font-medium text-white">{currentPhase.humidity.day}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Night</span>
                <span className="text-sm font-medium text-white">{currentPhase.humidity.night}%</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">VPD</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Day</span>
                <span className="text-sm font-medium text-white">{currentPhase.vpd.day} kPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Night</span>
                <span className="text-sm font-medium text-white">{currentPhase.vpd.night} kPa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Radar */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Environmental Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Tracking */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Growth Metrics
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { week: 'W1', height: 6, nodes: 2 },
              { week: 'W2', height: 12, nodes: 4 },
              { week: 'W3', height: 18, nodes: 6 },
              { week: 'W4', height: 24, nodes: 10 },
              { week: 'W5', height: 28, nodes: 14 },
              { week: 'W6', height: 30, nodes: 18 },
              { week: 'W7', height: 32, nodes: 22 },
              { week: 'W8', height: 32, nodes: 24 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="height"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="Height (inches)"
              />
              <Area
                type="monotone"
                dataKey="nodes"
                stackId="2"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                name="Node Count"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Phase Transition Alert */}
      {daysUntilNextPhase <= 3 && currentStrain.currentPhase < currentStrain.phases.length - 1 && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400 mb-1">
                Phase Transition Alert
              </h4>
              <p className="text-sm text-gray-300">
                Transitioning to {currentStrain.phases[currentStrain.currentPhase + 1].name} in {daysUntilNextPhase} days.
                Review and prepare environmental adjustments.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Key Changes:</p>
                  <ul className="mt-1 space-y-1 text-gray-300">
                    {currentStrain.currentPhase < currentStrain.phases.length - 1 && (
                      <>
                        <li>• Light: {currentPhase.lightHours}h → {currentStrain.phases[currentStrain.currentPhase + 1].lightHours}h</li>
                        <li>• PPFD: {currentPhase.lightIntensity} → {currentStrain.phases[currentStrain.currentPhase + 1].lightIntensity}</li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-400">Environment:</p>
                  <ul className="mt-1 space-y-1 text-gray-300">
                    {currentStrain.currentPhase < currentStrain.phases.length - 1 && (
                      <>
                        <li>• Temp: {currentPhase.temperature.day}°F → {currentStrain.phases[currentStrain.currentPhase + 1].temperature.day}°F</li>
                        <li>• RH: {currentPhase.humidity.day}% → {currentStrain.phases[currentStrain.currentPhase + 1].humidity.day}%</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Steering Tips */}
      <div className="bg-gradient-to-r from-green-900/20 to-purple-900/20 rounded-xl p-6 border border-green-600/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Crop Steering Tips for {currentPhase.name}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {currentPhase.name === 'Vegetative' && (
            <>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Promote Vegetative Growth</p>
                  <p className="text-sm text-gray-300">
                    Higher humidity (60-70%) and lower VPD promotes stretching and leaf expansion
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sun className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Light Management</p>
                  <p className="text-sm text-gray-300">
                    Maintain 18+ hours of light at 400-600 PPFD for optimal growth
                  </p>
                </div>
              </div>
            </>
          )}
          {(currentPhase.name === 'Early Flower' || currentPhase.name === 'Mid Flower') && (
            <>
              <div className="flex items-start gap-3">
                <Droplets className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Generative Steering</p>
                  <p className="text-sm text-gray-300">
                    Lower humidity (45-55%) and higher VPD directs energy to flower production
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Day/Night Differential</p>
                  <p className="text-sm text-gray-300">
                    10°F+ temperature drop at night enhances terpene and resin production
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}