"use client"

import { useState } from 'react'
import { Droplets, Clock, Calendar, Zap, Activity, Plus, Trash2, Play, Pause, Settings, Beaker, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { WaterQualityWidget } from './WaterQualityWidget'

interface IrrigationEvent {
  id: string
  name: string
  time: string
  duration: number // minutes
  volume: number // mL
  ec: number
  ph: number
  zones: string[]
  active: boolean
  repeat: 'daily' | 'custom'
  customDays?: number[]
}

interface Zone {
  id: string
  name: string
  substrate: string
  plantStage: 'clone' | 'veg' | 'flower'
  currentWC: number
  targetWC: number
  lastIrrigation: string
}

export function IrrigationControl() {
  const [zones, setZones] = useState<Zone[]>([
    {
      id: 'zone-1',
      name: 'Veg Room A',
      substrate: 'Rockwool',
      plantStage: 'veg',
      currentWC: 65,
      targetWC: 70,
      lastIrrigation: '2 hours ago'
    },
    {
      id: 'zone-2',
      name: 'Flower Room B',
      substrate: 'Coco Coir',
      plantStage: 'flower',
      currentWC: 55,
      targetWC: 60,
      lastIrrigation: '4 hours ago'
    },
    {
      id: 'zone-3',
      name: 'Clone Room',
      substrate: 'Rockwool Cubes',
      plantStage: 'clone',
      currentWC: 80,
      targetWC: 85,
      lastIrrigation: '30 min ago'
    }
  ])

  const [events, setEvents] = useState<IrrigationEvent[]>([
    {
      id: 'evt-1',
      name: 'Morning Feed',
      time: '06:00',
      duration: 3,
      volume: 150,
      ec: 2.0,
      ph: 5.8,
      zones: ['zone-1', 'zone-2'],
      active: true,
      repeat: 'daily'
    },
    {
      id: 'evt-2',
      name: 'Midday Boost',
      time: '12:00',
      duration: 2,
      volume: 100,
      ec: 2.2,
      ph: 5.9,
      zones: ['zone-1', 'zone-2'],
      active: true,
      repeat: 'daily'
    },
    {
      id: 'evt-3',
      name: 'Clone Misting',
      time: '09:00',
      duration: 1,
      volume: 50,
      ec: 0.8,
      ph: 6.0,
      zones: ['zone-3'],
      active: true,
      repeat: 'custom',
      customDays: [1, 3, 5] // Mon, Wed, Fri
    }
  ])

  const [selectedZone, setSelectedZone] = useState<string>('zone-1')
  const [isSystemActive, setIsSystemActive] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)

  // Calculate daily water usage
  const calculateDailyUsage = () => {
    return events.reduce((total, event) => {
      if (event.active) {
        const zonesCount = event.zones.length
        return total + (event.volume * zonesCount)
      }
      return total
    }, 0)
  }

  // Get next irrigation time
  const getNextIrrigation = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const nextEvents = events
      .filter(e => e.active)
      .map(e => {
        const [hours, minutes] = e.time.split(':').map(Number)
        const eventTime = hours * 60 + minutes
        return { ...e, minutesFromNow: eventTime - currentTime }
      })
      .filter(e => e.minutesFromNow > 0)
      .sort((a, b) => a.minutesFromNow - b.minutesFromNow)

    if (nextEvents.length > 0) {
      const next = nextEvents[0]
      const hours = Math.floor(next.minutesFromNow / 60)
      const minutes = next.minutesFromNow % 60
      return { event: next, timeString: `${hours}h ${minutes}m` }
    }
    
    return null
  }

  const toggleEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, active: !e.active } : e
    ))
  }

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }

  const nextIrrigation = getNextIrrigation()

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            Irrigation Control System
          </h3>
          <button
            onClick={() => setIsSystemActive(!isSystemActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isSystemActive
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isSystemActive ? (
              <>
                <Play className="w-4 h-4" />
                System Active
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                System Paused
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Daily Usage</p>
            <p className="text-2xl font-bold text-white">
              {(calculateDailyUsage() / 1000).toFixed(1)}L
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Active Events</p>
            <p className="text-2xl font-bold text-white">
              {events.filter(e => e.active).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Next Irrigation</p>
            <p className="text-xl font-bold text-white">
              {nextIrrigation ? nextIrrigation.timeString : 'None today'}
            </p>
          </div>
        </div>
      </div>

      {/* Zone Status */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Zone Status</h3>
        <div className="grid gap-3">
          {zones.map(zone => (
            <div
              key={zone.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedZone === zone.id
                  ? 'bg-purple-900/20 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedZone(zone.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{zone.name}</h4>
                  <p className="text-sm text-gray-400">
                    {zone.substrate} • {zone.plantStage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Water Content</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-white">{zone.currentWC}%</p>
                    <span className="text-sm text-gray-500">/ {zone.targetWC}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">Last irrigation: {zone.lastIrrigation}</p>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(zone.currentWC / zone.targetWC) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Irrigation Schedule */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Irrigation Schedule</h3>
          <button
            onClick={() => setShowEventForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{event.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      event.active
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {event.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time
                      </p>
                      <p className="text-white">{event.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">{event.duration} min</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Volume</p>
                      <p className="text-white">{event.volume} mL</p>
                    </div>
                    <div>
                      <p className="text-gray-400">EC/pH</p>
                      <p className="text-white">{event.ec} / {event.ph}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Zones: {event.zones.map(zId => zones.find(z => z.id === zId)?.name).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleEvent(event.id)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    {event.active ? (
                      <Pause className="w-4 h-4 text-gray-300" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="p-1.5 bg-gray-700 hover:bg-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Usage Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Weekly Water Usage
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { day: 'Mon', usage: 2.1 },
              { day: 'Tue', usage: 2.3 },
              { day: 'Wed', usage: 2.2 },
              { day: 'Thu', usage: 2.4 },
              { day: 'Fri', usage: 2.3 },
              { day: 'Sat', usage: 2.5 },
              { day: 'Sun', usage: 2.2 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${value}L`}
              />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Quality Widget */}
      <WaterQualityWidget 
        ph={events.find(e => e.id === 'evt-1')?.ph || 6.5}
        ec={events.find(e => e.id === 'evt-1')?.ec || 0.5}
        temperature={20}
        onAnalyzeClick={() => window.location.href = '/water-analysis'}
      />

      {/* Fertigation Tips */}
      <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl p-6 border border-blue-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Fertigation Best Practices
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">EC Management</p>
                <p className="text-sm text-gray-300">
                  Start low (1.5-2.0) in veg, increase gradually to 2.0-2.5 in flower
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">pH Control</p>
                <p className="text-sm text-gray-300">
                  Maintain 5.5-6.0 for rockwool, 5.8-6.2 for coco
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Timing</p>
                <p className="text-sm text-gray-300">
                  First feed 1-2 hours after lights on, last feed 2-3 hours before lights off
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Droplets className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Runoff Target</p>
                <p className="text-sm text-gray-300">
                  Maintain 10-20% runoff to prevent salt buildup
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}