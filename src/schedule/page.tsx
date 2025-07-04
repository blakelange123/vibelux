"use client"

import { useState } from 'react'
import { 
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Calendar,
  Save,
  Play,
  Pause,
  Settings,
  Zap,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react'

interface Schedule {
  id: string
  name: string
  stages: Stage[]
  active: boolean
}

interface Stage {
  id: string
  name: string
  duration: number // days
  photoperiod: number // hours
  intensity: number // percentage
  spectrum?: string
  rampUp: number // minutes
  rampDown: number // minutes
  sunriseTime: string
}

const defaultSchedules: Schedule[] = [
  {
    id: 'lettuce-1',
    name: 'Lettuce - Fast Growth',
    active: true,
    stages: [
      {
        id: 'germination',
        name: 'Germination',
        duration: 7,
        photoperiod: 16,
        intensity: 30,
        spectrum: 'Blue Heavy',
        rampUp: 15,
        rampDown: 15,
        sunriseTime: '06:00'
      },
      {
        id: 'seedling',
        name: 'Seedling',
        duration: 14,
        photoperiod: 18,
        intensity: 50,
        spectrum: 'Balanced',
        rampUp: 30,
        rampDown: 30,
        sunriseTime: '06:00'
      },
      {
        id: 'vegetative',
        name: 'Vegetative',
        duration: 21,
        photoperiod: 16,
        intensity: 100,
        spectrum: 'Full Spectrum',
        rampUp: 30,
        rampDown: 30,
        sunriseTime: '06:00'
      }
    ]
  },
  {
    id: 'cannabis-1',
    name: 'Cannabis - Standard',
    active: false,
    stages: [
      {
        id: 'clone',
        name: 'Clone/Seedling',
        duration: 14,
        photoperiod: 18,
        intensity: 40,
        spectrum: 'Blue Heavy',
        rampUp: 30,
        rampDown: 30,
        sunriseTime: '06:00'
      },
      {
        id: 'veg',
        name: 'Vegetative',
        duration: 28,
        photoperiod: 18,
        intensity: 80,
        spectrum: 'Balanced',
        rampUp: 45,
        rampDown: 45,
        sunriseTime: '06:00'
      },
      {
        id: 'flower',
        name: 'Flowering',
        duration: 56,
        photoperiod: 12,
        intensity: 100,
        spectrum: 'Red Heavy',
        rampUp: 60,
        rampDown: 60,
        sunriseTime: '08:00'
      }
    ]
  }
]

export default function LightingSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(defaultSchedules)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>(defaultSchedules[0])
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [dayInStage, setDayInStage] = useState(1)
  const [isPlaying, setIsPlaying] = useState(true)

  const currentStage = selectedSchedule.stages[currentStageIndex]
  const totalDays = selectedSchedule.stages.reduce((sum, stage) => sum + stage.duration, 0)
  const currentDay = selectedSchedule.stages
    .slice(0, currentStageIndex)
    .reduce((sum, stage) => sum + stage.duration, 0) + dayInStage

  // Calculate DLI for current stage
  const calculateDLI = (photoperiod: number, intensity: number) => {
    const basePPFD = 600 // at 100% intensity
    const actualPPFD = (basePPFD * intensity) / 100
    return (actualPPFD * photoperiod * 0.0036).toFixed(1)
  }

  // Calculate energy usage
  const calculateEnergy = (photoperiod: number, intensity: number) => {
    const baseWattage = 600 // per fixture
    const actualWattage = (baseWattage * intensity) / 100
    return ((actualWattage * photoperiod) / 1000).toFixed(2)
  }

  const addStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      duration: 7,
      photoperiod: 16,
      intensity: 80,
      spectrum: 'Full Spectrum',
      rampUp: 30,
      rampDown: 30,
      sunriseTime: '06:00'
    }
    
    setSelectedSchedule({
      ...selectedSchedule,
      stages: [...selectedSchedule.stages, newStage]
    })
  }

  const updateStage = (stageId: string, updates: Partial<Stage>) => {
    setSelectedSchedule({
      ...selectedSchedule,
      stages: selectedSchedule.stages.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    })
  }

  const deleteStage = (stageId: string) => {
    setSelectedSchedule({
      ...selectedSchedule,
      stages: selectedSchedule.stages.filter(stage => stage.id !== stageId)
    })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-orange-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-purple-500 rounded-2xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                    Lighting Schedule
                  </h1>
                  <p className="text-gray-400 mt-1">Automate photoperiods and intensity throughout growth stages</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isPlaying
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Active' : 'Paused'}
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Schedule List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Schedule Templates</h3>
                <div className="space-y-2">
                  {schedules.map(schedule => (
                    <button
                      key={schedule.id}
                      onClick={() => setSelectedSchedule(schedule)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedSchedule.id === schedule.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-xs opacity-80">
                            {schedule.stages.length} stages • {
                              schedule.stages.reduce((sum, s) => sum + s.duration, 0)
                            } days
                          </p>
                        </div>
                        {schedule.active && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Current Status</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Overall Progress</span>
                      <span className="text-white font-medium">Day {currentDay} of {totalDays}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
                        style={{ width: `${(currentDay / totalDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Stage Progress</span>
                      <span className="text-white font-medium">
                        Day {dayInStage} of {currentStage.duration}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(dayInStage / currentStage.duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Active Stage:</span>
                      <span className="text-white font-medium">{currentStage.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Photoperiod:</span>
                      <span className="text-white font-medium">{currentStage.photoperiod}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Intensity:</span>
                      <span className="text-white font-medium">{currentStage.intensity}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily DLI:</span>
                      <span className="text-white font-medium">
                        {calculateDLI(currentStage.photoperiod, currentStage.intensity)} mol/m²
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Editor */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Growth Stages</h3>
                    <button
                      onClick={addStage}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-all flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Stage
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {selectedSchedule.stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={`bg-gray-800/50 rounded-xl p-6 border transition-all ${
                        index === currentStageIndex
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === currentStageIndex
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={stage.name}
                            onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                            className="bg-transparent text-white font-medium text-lg border-b border-gray-600 focus:border-purple-500 outline-none"
                          />
                        </div>
                        <button
                          onClick={() => deleteStage(stage.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-400">Duration (days)</label>
                          <input
                            type="number"
                            value={stage.duration}
                            onChange={(e) => updateStage(stage.id, { duration: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Photoperiod (hours)</label>
                          <input
                            type="number"
                            value={stage.photoperiod}
                            onChange={(e) => updateStage(stage.id, { photoperiod: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Intensity (%)</label>
                          <input
                            type="number"
                            value={stage.intensity}
                            onChange={(e) => updateStage(stage.id, { intensity: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="text-xs text-gray-400">Spectrum</label>
                          <select
                            value={stage.spectrum}
                            onChange={(e) => updateStage(stage.id, { spectrum: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          >
                            <option value="Blue Heavy">Blue Heavy</option>
                            <option value="Balanced">Balanced</option>
                            <option value="Red Heavy">Red Heavy</option>
                            <option value="Full Spectrum">Full Spectrum</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Sunrise Time</label>
                          <input
                            type="time"
                            value={stage.sunriseTime}
                            onChange={(e) => updateStage(stage.id, { sunriseTime: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Ramp Time (min)</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <input
                              type="number"
                              value={stage.rampUp}
                              onChange={(e) => updateStage(stage.id, { rampUp: Number(e.target.value) })}
                              placeholder="Up"
                              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                            />
                            <input
                              type="number"
                              value={stage.rampDown}
                              onChange={(e) => updateStage(stage.id, { rampDown: Number(e.target.value) })}
                              placeholder="Down"
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stage Metrics */}
                      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400">Daily DLI</p>
                          <p className="text-white font-medium">
                            {calculateDLI(stage.photoperiod, stage.intensity)} mol/m²
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Daily Energy</p>
                          <p className="text-white font-medium">
                            {calculateEnergy(stage.photoperiod, stage.intensity)} kWh
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Stage Total</p>
                          <p className="text-white font-medium">
                            {(Number(calculateDLI(stage.photoperiod, stage.intensity)) * stage.duration).toFixed(0)} mol/m²
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Timeline */}
              <div className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Today's Light Cycle</h3>
                
                <div className="relative h-32 bg-gray-900 rounded-lg overflow-hidden">
                  {/* Time markers */}
                  <div className="absolute inset-0 grid grid-cols-24 opacity-20">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="border-r border-white/20" />
                    ))}
                  </div>

                  {/* Light period */}
                  <div
                    className="absolute top-0 h-full bg-gradient-to-r from-yellow-500/20 to-yellow-500/40"
                    style={{
                      left: `${(parseInt(currentStage.sunriseTime.split(':')[0]) / 24) * 100}%`,
                      width: `${(currentStage.photoperiod / 24) * 100}%`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-yellow-500/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                        {currentStage.photoperiod}h Light Period
                      </div>
                    </div>
                  </div>

                  {/* Current time indicator */}
                  <div 
                    className="absolute top-0 w-0.5 h-full bg-white"
                    style={{ left: `${(new Date().getHours() / 24) * 100}%` }}
                  >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                {/* Time labels */}
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}