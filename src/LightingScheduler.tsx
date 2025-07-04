"use client"

import { useState } from 'react'
import { Calendar, Clock, Sun, Moon, Zap, Plus, Trash2, Copy, Save } from 'lucide-react'

interface Schedule {
  id: string
  name: string
  startTime: string
  endTime: string
  intensity: number
  spectrum?: {
    red: number
    blue: number
    white: number
    farRed: number
  }
  days: string[]
  enabled: boolean
}

interface SchedulePreset {
  name: string
  description: string
  schedules: Omit<Schedule, 'id'>[]
}

const presets: SchedulePreset[] = [
  {
    name: 'Vegetative Growth',
    description: '18/6 photoperiod optimized for vegetative growth',
    schedules: [
      {
        name: 'Main Light Period',
        startTime: '06:00',
        endTime: '00:00',
        intensity: 100,
        spectrum: { red: 30, blue: 50, white: 15, farRed: 5 },
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        enabled: true
      }
    ]
  },
  {
    name: 'Flowering',
    description: '12/12 photoperiod for flowering phase',
    schedules: [
      {
        name: 'Flowering Period',
        startTime: '06:00',
        endTime: '18:00',
        intensity: 100,
        spectrum: { red: 60, blue: 20, white: 15, farRed: 5 },
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        enabled: true
      }
    ]
  },
  {
    name: 'Sunrise/Sunset',
    description: 'Gradual intensity changes mimicking natural light',
    schedules: [
      {
        name: 'Sunrise',
        startTime: '06:00',
        endTime: '08:00',
        intensity: 30,
        spectrum: { red: 40, blue: 20, white: 35, farRed: 5 },
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        enabled: true
      },
      {
        name: 'Day',
        startTime: '08:00',
        endTime: '18:00',
        intensity: 100,
        spectrum: { red: 35, blue: 35, white: 25, farRed: 5 },
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        enabled: true
      },
      {
        name: 'Sunset',
        startTime: '18:00',
        endTime: '20:00',
        intensity: 30,
        spectrum: { red: 50, blue: 15, white: 30, farRed: 5 },
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        enabled: true
      }
    ]
  }
]

export function LightingScheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Main Schedule',
      startTime: '06:00',
      endTime: '22:00',
      intensity: 100,
      spectrum: { red: 40, blue: 30, white: 25, farRed: 5 },
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: true
    }
  ])
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const addSchedule = () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      name: `Schedule ${schedules.length + 1}`,
      startTime: '09:00',
      endTime: '17:00',
      intensity: 80,
      days: [...daysOfWeek],
      enabled: true
    }
    setSchedules([...schedules, newSchedule])
  }

  const updateSchedule = (id: string, updates: Partial<Schedule>) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id))
  }

  const toggleDay = (scheduleId: string, day: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) return

    const newDays = schedule.days.includes(day)
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day]

    updateSchedule(scheduleId, { days: newDays })
  }

  const applyPreset = () => {
    const preset = presets.find(p => p.name === selectedPreset)
    if (!preset) return

    const newSchedules = preset.schedules.map((s, index) => ({
      ...s,
      id: Date.now().toString() + index
    }))
    setSchedules(newSchedules)
  }

  const calculateDailyPhotoperiod = () => {
    let totalMinutes = 0
    schedules.forEach(schedule => {
      if (schedule.enabled) {
        const [startHour, startMin] = schedule.startTime.split(':').map(Number)
        const [endHour, endMin] = schedule.endTime.split(':').map(Number)
        
        let minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
        if (minutes < 0) minutes += 24 * 60 // Handle overnight schedules
        
        totalMinutes += minutes
      }
    })
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const getTimelineBlocks = () => {
    const blocks: { start: number; end: number; schedule: Schedule }[] = []
    
    schedules.forEach(schedule => {
      if (schedule.enabled) {
        const [startHour, startMin] = schedule.startTime.split(':').map(Number)
        const [endHour, endMin] = schedule.endTime.split(':').map(Number)
        
        const startPercent = ((startHour * 60 + startMin) / (24 * 60)) * 100
        const endPercent = ((endHour * 60 + endMin) / (24 * 60)) * 100
        
        if (endPercent < startPercent) {
          // Handle overnight schedules
          blocks.push({ start: startPercent, end: 100, schedule })
          blocks.push({ start: 0, end: endPercent, schedule })
        } else {
          blocks.push({ start: startPercent, end: endPercent, schedule })
        }
      }
    })
    
    return blocks
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold">Lighting Schedule</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select Preset...</option>
            {presets.map(preset => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            onClick={applyPreset}
            disabled={!selectedPreset}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Daily Timeline</h4>
        <div className="relative h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Hour markers */}
          {[0, 6, 12, 18].map(hour => (
            <div
              key={hour}
              className="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              <span className="absolute -top-6 -left-3 text-xs text-gray-600 dark:text-gray-400">
                {hour}:00
              </span>
            </div>
          ))}
          
          {/* Schedule blocks */}
          {getTimelineBlocks().map((block, index) => (
            <div
              key={index}
              className="absolute top-2 bottom-2 bg-indigo-500 rounded"
              style={{
                left: `${block.start}%`,
                width: `${block.end - block.start}%`,
                opacity: block.schedule.intensity / 100
              }}
              title={`${block.schedule.name}: ${block.schedule.startTime} - ${block.schedule.endTime}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Total photoperiod: {calculateDailyPhotoperiod()}</span>
          <span>Dark period: {(() => {
            const [hours, minutes] = calculateDailyPhotoperiod().split('h ')
            const totalMinutes = parseInt(hours) * 60 + parseInt(minutes)
            const darkMinutes = 24 * 60 - totalMinutes
            return `${Math.floor(darkMinutes / 60)}h ${darkMinutes % 60}m`
          })()}</span>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map(schedule => (
          <div
            key={schedule.id}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={schedule.name}
                onChange={(e) => updateSchedule(schedule.id, { name: e.target.value })}
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => updateSchedule(schedule.id, { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => updateSchedule(schedule.id, { startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => updateSchedule(schedule.id, { endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Intensity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={schedule.intensity}
                    onChange={(e) => updateSchedule(schedule.id, { intensity: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{schedule.intensity}%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Active Days</label>
              <div className="flex gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(schedule.id, day)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      schedule.days.includes(day)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Schedule Button */}
      <button
        onClick={addSchedule}
        className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-600 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"
      >
        <Plus className="w-5 h-5" />
        Add Schedule
      </button>

      {/* Energy Usage Estimate */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <div>
            <h4 className="font-semibold">Energy Usage Estimate</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on current schedule: ~{calculateDailyPhotoperiod()} of operation daily
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}