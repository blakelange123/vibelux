'use client'

import { useState, useEffect } from 'react'
import { 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon,
  Clock,
  Calendar,
  Zap,
  Leaf,
  AlertCircle,
  Settings,
  TrendingUp
} from 'lucide-react'

interface PhotoperiodSchedulerProps {
  defaultPhotoperiod: number
  onScheduleChange?: (schedule: DaySchedule[]) => void
  cropType?: string
  growthStage?: string
}

interface DaySchedule {
  time: string // HH:MM
  intensity: number // 0-100%
  spectrum?: {
    red: number
    blue: number
    farRed: number
  }
  event: 'sunrise' | 'sunset' | 'peak' | 'supplemental' | null
}

interface PhotoperiodPreset {
  name: string
  description: string
  photoperiod: number
  sunriseTime: string
  sunriseDuration: number // minutes
  sunsetDuration: number // minutes
  useFarRedEOD: boolean // End of day far-red treatment
  farRedDuration: number // minutes
  nightInterruption?: {
    enabled: boolean
    time: string
    duration: number
  }
}

const cropPhotoperiodPresets: Record<string, PhotoperiodPreset> = {
  'lettuce-vegetative': {
    name: 'Lettuce - Continuous Growth',
    description: 'Long day for maximum growth',
    photoperiod: 18,
    sunriseTime: '06:00',
    sunriseDuration: 30,
    sunsetDuration: 30,
    useFarRedEOD: false,
    farRedDuration: 0
  },
  'tomato-vegetative': {
    name: 'Tomato - Vegetative',
    description: 'Balanced day length for strong vegetative growth',
    photoperiod: 16,
    sunriseTime: '06:00',
    sunriseDuration: 45,
    sunsetDuration: 45,
    useFarRedEOD: true,
    farRedDuration: 30
  },
  'tomato-flowering': {
    name: 'Tomato - Flowering',
    description: 'Slightly reduced photoperiod to induce flowering',
    photoperiod: 14,
    sunriseTime: '06:00',
    sunriseDuration: 45,
    sunsetDuration: 45,
    useFarRedEOD: true,
    farRedDuration: 30
  },
  'cannabis-vegetative': {
    name: 'Cannabis - Vegetative (18/6)',
    description: 'Long day to maintain vegetative state',
    photoperiod: 18,
    sunriseTime: '06:00',
    sunriseDuration: 15,
    sunsetDuration: 15,
    useFarRedEOD: false,
    farRedDuration: 0
  },
  'cannabis-flowering': {
    name: 'Cannabis - Flowering (12/12)',
    description: 'Equal day/night to induce flowering',
    photoperiod: 12,
    sunriseTime: '08:00',
    sunriseDuration: 15,
    sunsetDuration: 15,
    useFarRedEOD: true,
    farRedDuration: 15
  },
  'strawberry-june': {
    name: 'Strawberry - June Bearing',
    description: 'Short day treatment for flower induction',
    photoperiod: 10,
    sunriseTime: '07:00',
    sunriseDuration: 30,
    sunsetDuration: 30,
    useFarRedEOD: false,
    farRedDuration: 0,
    nightInterruption: {
      enabled: false,
      time: '22:00',
      duration: 30
    }
  },
  'chrysanthemum': {
    name: 'Chrysanthemum - Flower Induction',
    description: 'Short day with optional night interruption',
    photoperiod: 11,
    sunriseTime: '07:00',
    sunriseDuration: 30,
    sunsetDuration: 30,
    useFarRedEOD: false,
    farRedDuration: 0,
    nightInterruption: {
      enabled: true,
      time: '22:00',
      duration: 4
    }
  }
}

export default function PhotoperiodScheduler({
  defaultPhotoperiod,
  onScheduleChange,
  cropType = 'lettuce',
  growthStage = 'vegetative'
}: PhotoperiodSchedulerProps) {
  const [photoperiod, setPhotoperiod] = useState(defaultPhotoperiod)
  const [sunriseTime, setSunriseTime] = useState('06:00')
  const [sunriseDuration, setSunriseDuration] = useState(30) // minutes
  const [sunsetDuration, setSunsetDuration] = useState(30) // minutes
  const [useSunSimulation, setUseSunSimulation] = useState(true)
  const [useFarRedEOD, setUseFarRedEOD] = useState(false)
  const [farRedDuration, setFarRedDuration] = useState(30) // minutes
  const [selectedPreset, setSelectedPreset] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [nightInterruption, setNightInterruption] = useState({
    enabled: false,
    time: '22:00',
    duration: 30 // minutes
  })

  // Generate daily schedule
  const generateSchedule = (): DaySchedule[] => {
    const schedule: DaySchedule[] = []
    
    // Parse sunrise time
    const [sunriseHour, sunriseMinute] = sunriseTime.split(':').map(Number)
    const sunriseMinutes = sunriseHour * 60 + sunriseMinute
    const sunsetMinutes = sunriseMinutes + photoperiod * 60
    
    // Generate 24-hour schedule in 15-minute intervals
    for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      let intensity = 0
      let spectrum = { red: 35, blue: 20, farRed: 5 }
      let event: DaySchedule['event'] = null
      
      // Night period
      if (minutes < sunriseMinutes || minutes >= sunsetMinutes + (useFarRedEOD ? farRedDuration : 0)) {
        intensity = 0
        
        // Night interruption
        if (nightInterruption.enabled) {
          const [niHour, niMinute] = nightInterruption.time.split(':').map(Number)
          const niMinutes = niHour * 60 + niMinute
          if (minutes >= niMinutes && minutes < niMinutes + nightInterruption.duration) {
            intensity = 10
            spectrum = { red: 50, blue: 0, farRed: 50 }
            event = 'supplemental'
          }
        }
      }
      // Sunrise period
      else if (minutes >= sunriseMinutes && minutes < sunriseMinutes + sunriseDuration) {
        const progress = (minutes - sunriseMinutes) / sunriseDuration
        if (useSunSimulation) {
          // Simulate sunrise spectrum shift
          intensity = Math.round(progress * 100)
          spectrum = {
            red: 20 + progress * 20, // Start orange, shift to white
            blue: 5 + progress * 15,
            farRed: 10 - progress * 5
          }
        } else {
          intensity = 100
        }
        if (minutes === sunriseMinutes) event = 'sunrise'
      }
      // Day period
      else if (minutes < sunsetMinutes - sunsetDuration) {
        intensity = 100
        event = minutes === sunriseMinutes + sunriseDuration ? 'peak' : null
      }
      // Sunset period
      else if (minutes < sunsetMinutes) {
        const progress = (minutes - (sunsetMinutes - sunsetDuration)) / sunsetDuration
        if (useSunSimulation) {
          // Simulate sunset spectrum shift
          intensity = Math.round((1 - progress) * 100)
          spectrum = {
            red: 40 + progress * 10, // Shift to red/orange
            blue: 20 - progress * 15,
            farRed: 5 + progress * 10
          }
        } else {
          intensity = 0
        }
        if (minutes === sunsetMinutes - sunsetDuration) event = 'sunset'
      }
      // Far-red EOD treatment
      else if (useFarRedEOD && minutes < sunsetMinutes + farRedDuration) {
        intensity = 30
        spectrum = { red: 0, blue: 0, farRed: 100 }
        event = 'supplemental'
      }
      
      schedule.push({ time, intensity, spectrum, event })
    }
    
    return schedule
  }

  const schedule = generateSchedule()

  // Calculate DLI
  const calculateDLI = () => {
    const totalHours = schedule.filter(s => s.intensity > 0).length * 0.25 // 15-min intervals
    const avgIntensity = schedule.reduce((sum, s) => sum + s.intensity, 0) / schedule.length
    const avgPPFD = 600 * (avgIntensity / 100) // Assume 600 PPFD at 100%
    return (avgPPFD * totalHours * 3.6) / 1000
  }

  const estimatedDLI = calculateDLI()

  // Load preset
  const loadPreset = (presetKey: string) => {
    const preset = cropPhotoperiodPresets[presetKey]
    if (preset) {
      setPhotoperiod(preset.photoperiod)
      setSunriseTime(preset.sunriseTime)
      setSunriseDuration(preset.sunriseDuration)
      setSunsetDuration(preset.sunsetDuration)
      setUseFarRedEOD(preset.useFarRedEOD)
      setFarRedDuration(preset.farRedDuration)
      if (preset.nightInterruption) {
        setNightInterruption(preset.nightInterruption)
      }
      setSelectedPreset(presetKey)
    }
  }

  useEffect(() => {
    if (onScheduleChange) {
      onScheduleChange(schedule)
    }
  }, [photoperiod, sunriseTime, sunriseDuration, sunsetDuration, useSunSimulation, useFarRedEOD, farRedDuration, nightInterruption])

  // Auto-select preset based on crop
  useEffect(() => {
    const presetKey = `${cropType}-${growthStage}`
    if (cropPhotoperiodPresets[presetKey]) {
      loadPreset(presetKey)
    }
  }, [cropType, growthStage])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400" />
          Photoperiod Scheduler
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Photoperiod Preset</label>
        <select
          value={selectedPreset}
          onChange={(e) => loadPreset(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Custom Schedule</option>
          {Object.entries(cropPhotoperiodPresets).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.name} - {preset.description}
            </option>
          ))}
        </select>
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Photoperiod: {photoperiod} hours
          </label>
          <input
            type="range"
            min="0"
            max="24"
            step="0.5"
            value={photoperiod}
            onChange={(e) => {
              setPhotoperiod(Number(e.target.value))
              setSelectedPreset('')
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0h (Dark)</span>
            <span>12h</span>
            <span>24h (Continuous)</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Sunrise Time</label>
          <input
            type="time"
            value={sunriseTime}
            onChange={(e) => {
              setSunriseTime(e.target.value)
              setSelectedPreset('')
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Sunrise/Sunset Simulation */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-gray-300 flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-orange-400" />
            Sunrise/Sunset Simulation
          </label>
          <button
            onClick={() => setUseSunSimulation(!useSunSimulation)}
            className={`w-10 h-5 rounded-full transition-all ${
              useSunSimulation ? 'bg-orange-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${
              useSunSimulation ? 'translate-x-5' : 'translate-x-0.5'
            } transform mt-0.5`} />
          </button>
        </div>
        
        {useSunSimulation && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Sunrise Duration</label>
              <select
                value={sunriseDuration}
                onChange={(e) => setSunriseDuration(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Sunset Duration</label>
              <select
                value={sunsetDuration}
                onChange={(e) => setSunsetDuration(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Far-Red EOD Treatment */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-gray-300 flex items-center gap-2">
            <Sunset className="w-4 h-4 text-red-600" />
            Far-Red End-of-Day Treatment
          </label>
          <button
            onClick={() => setUseFarRedEOD(!useFarRedEOD)}
            className={`w-10 h-5 rounded-full transition-all ${
              useFarRedEOD ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${
              useFarRedEOD ? 'translate-x-5' : 'translate-x-0.5'
            } transform mt-0.5`} />
          </button>
        </div>
        
        {useFarRedEOD && (
          <div>
            <label className="text-xs text-gray-400">Far-Red Duration</label>
            <select
              value={farRedDuration}
              onChange={(e) => setFarRedDuration(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Promotes stem elongation and flowering in many crops
            </p>
          </div>
        )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Night Interruption</h4>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-gray-400">Enable Night Break</label>
            <button
              onClick={() => setNightInterruption({...nightInterruption, enabled: !nightInterruption.enabled})}
              className={`w-10 h-5 rounded-full transition-all ${
                nightInterruption.enabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                nightInterruption.enabled ? 'translate-x-5' : 'translate-x-0.5'
              } transform mt-0.5`} />
            </button>
          </div>
          
          {nightInterruption.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Time</label>
                <input
                  type="time"
                  value={nightInterruption.time}
                  onChange={(e) => setNightInterruption({...nightInterruption, time: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Duration (min)</label>
                <input
                  type="number"
                  value={nightInterruption.duration}
                  onChange={(e) => setNightInterruption({...nightInterruption, duration: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Used to control flowering in photoperiod-sensitive crops
          </p>
        </div>
      )}

      {/* Schedule Visualization */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">24-Hour Light Schedule</h4>
        <div className="relative h-24">
          {schedule.filter((_, i) => i % 4 === 0).map((slot, index) => { // Show hourly
            const hour = index
            return (
              <div
                key={hour}
                className="absolute bottom-0 w-3"
                style={{
                  left: `${(hour / 24) * 100}%`,
                  height: `${slot.intensity}%`,
                  backgroundColor: slot.intensity > 0 
                    ? slot.spectrum?.farRed === 100 
                      ? '#8B0000' 
                      : slot.intensity < 100 
                        ? '#FFA500' 
                        : '#FFFF00'
                    : '#1F2937'
                }}
              />
            )
          })}
          
          {/* Event markers */}
          {schedule.filter(s => s.event).map((slot, index) => {
            const [hour, minute] = slot.time.split(':').map(Number)
            const position = ((hour + minute / 60) / 24) * 100
            
            return (
              <div
                key={index}
                className="absolute top-0 w-px h-full"
                style={{ left: `${position}%` }}
              >
                <div className="absolute -top-4 -left-3 text-xs">
                  {slot.event === 'sunrise' && <Sunrise className="w-6 h-6 text-orange-400" />}
                  {slot.event === 'sunset' && <Sunset className="w-6 h-6 text-orange-600" />}
                  {slot.event === 'supplemental' && <Moon className="w-6 h-6 text-purple-400" />}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Light Period</span>
          </div>
          <div className="text-lg font-semibold">{photoperiod}h</div>
          <div className="text-xs text-gray-500">
            {Math.floor(photoperiod)}:{((photoperiod % 1) * 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Est. DLI</span>
          </div>
          <div className="text-lg font-semibold">{estimatedDLI.toFixed(1)}</div>
          <div className="text-xs text-gray-500">mol/m²/day</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Energy Use</span>
          </div>
          <div className="text-lg font-semibold">
            {Math.round(schedule.reduce((sum, s) => sum + s.intensity, 0) / schedule.length)}%
          </div>
          <div className="text-xs text-gray-500">Avg intensity</div>
        </div>
      </div>

      {/* Recommendations */}
      {cropType && (
        <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-medium text-blue-400">
              Photoperiod Recommendations for {cropType}
            </h4>
          </div>
          <ul className="text-xs text-gray-300 space-y-1">
            {cropType === 'lettuce' && (
              <>
                <li>• 16-18 hours for maximum growth rate</li>
                <li>• 24-hour photoperiod possible but may reduce quality</li>
                <li>• No far-red EOD needed</li>
              </>
            )}
            {cropType === 'tomato' && (
              <>
                <li>• 16-18 hours during vegetative stage</li>
                <li>• 12-14 hours to promote flowering</li>
                <li>• Far-red EOD enhances fruit set</li>
              </>
            )}
            {cropType === 'cannabis' && (
              <>
                <li>• Maintain 18+ hours for vegetative growth</li>
                <li>• Switch to 12/12 to induce flowering</li>
                <li>• Avoid light interruptions during dark period</li>
              </>
            )}
            {cropType === 'strawberry' && (
              <>
                <li>• Short days (8-12h) for flower induction</li>
                <li>• Long days (16h) for runner production</li>
                <li>• Night interruption prevents flowering</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}