"use client"

import { useState, useEffect } from 'react'
import { Droplets, Zap, Thermometer, Activity, AlertTriangle, TrendingUp, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SubstrateData {
  timestamp: string
  waterContent: number // %
  ec: number // mS/cm
  temperature: number // °F
  ph?: number
}

interface SubstrateSensor {
  id: string
  name: string
  location: string
  type: 'rockwool' | 'coco' | 'soil' | 'perlite'
  data: SubstrateData
  status: 'optimal' | 'dry' | 'wet' | 'warning'
}

export function SubstrateMonitor() {
  const [sensors, setSensors] = useState<SubstrateSensor[]>([
    {
      id: 'sub-001',
      name: 'Veg Room - Row 1',
      location: 'Zone A',
      type: 'rockwool',
      data: {
        timestamp: new Date().toISOString(),
        waterContent: 65,
        ec: 2.2,
        temperature: 68,
        ph: 5.8
      },
      status: 'optimal'
    },
    {
      id: 'sub-002',
      name: 'Flower Room - Row 3',
      location: 'Zone B',
      type: 'coco',
      data: {
        timestamp: new Date().toISOString(),
        waterContent: 45,
        ec: 2.8,
        temperature: 70,
        ph: 6.2
      },
      status: 'dry'
    }
  ])

  const [selectedSensor, setSelectedSensor] = useState<string>(sensors[0].id)
  const [historicalData, setHistoricalData] = useState<SubstrateData[]>([])
  const [irrigationSchedule, setIrrigationSchedule] = useState<any[]>([])

  // Simulate real-time substrate data
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prevSensors => 
        prevSensors.map(sensor => {
          const newWC = sensor.data.waterContent + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5
          const newEC = sensor.data.ec + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2
          const newTemp = sensor.data.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1
          const newPH = sensor.data.ph ? sensor.data.ph + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1 : undefined

          // Determine status based on water content
          let status: SubstrateSensor['status'] = 'optimal'
          if (newWC < 40) status = 'dry'
          else if (newWC > 80) status = 'wet'
          else if (newEC > 3.5 || newEC < 1.5) status = 'warning'

          return {
            ...sensor,
            data: {
              timestamp: new Date().toISOString(),
              waterContent: Math.max(20, Math.min(90, newWC)),
              ec: Math.max(0.5, Math.min(5, newEC)),
              temperature: Math.max(60, Math.min(80, newTemp)),
              ph: newPH ? Math.max(5, Math.min(7, newPH)) : undefined
            },
            status
          }
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Generate irrigation schedule
  useEffect(() => {
    const schedule = []
    const now = new Date()
    
    // Morning irrigation
    schedule.push({
      time: '06:00',
      duration: 3,
      volume: 150,
      ec: 2.0,
      ph: 5.8
    })
    
    // Midday irrigation
    schedule.push({
      time: '12:00',
      duration: 2,
      volume: 100,
      ec: 2.2,
      ph: 5.9
    })
    
    // Evening irrigation
    schedule.push({
      time: '18:00',
      duration: 2,
      volume: 100,
      ec: 2.0,
      ph: 5.8
    })

    setIrrigationSchedule(schedule)
  }, [])

  const currentSensor = sensors.find(s => s.id === selectedSensor)

  const getSubstrateGuidelines = (type: string) => {
    switch (type) {
      case 'rockwool':
        return { wc: '60-80%', ec: '2.0-3.0', ph: '5.5-6.0' }
      case 'coco':
        return { wc: '50-70%', ec: '1.5-2.5', ph: '5.8-6.2' }
      case 'soil':
        return { wc: '40-60%', ec: '1.0-2.0', ph: '6.0-7.0' }
      default:
        return { wc: '50-70%', ec: '1.5-2.5', ph: '5.8-6.2' }
    }
  }

  const guidelines = currentSensor ? getSubstrateGuidelines(currentSensor.type) : null

  return (
    <div className="space-y-6">
      {/* Sensor Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sensors.map(sensor => (
          <button
            key={sensor.id}
            onClick={() => setSelectedSensor(sensor.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all ${
              selectedSensor === sensor.id
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                sensor.status === 'optimal' ? 'bg-green-400' :
                sensor.status === 'dry' ? 'bg-yellow-400' :
                sensor.status === 'wet' ? 'bg-blue-400' :
                'bg-red-400'
              }`} />
              <span className="text-sm font-medium">{sensor.name}</span>
            </div>
          </button>
        ))}
      </div>

      {currentSensor && (
        <>
          {/* Current Status */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {currentSensor.name} - {currentSensor.type}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentSensor.status === 'optimal' ? 'bg-green-900/20 text-green-400 border border-green-600/30' :
                currentSensor.status === 'dry' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-600/30' :
                currentSensor.status === 'wet' ? 'bg-blue-900/20 text-blue-400 border border-blue-600/30' :
                'bg-red-900/20 text-red-400 border border-red-600/30'
              }`}>
                {currentSensor.status.charAt(0).toUpperCase() + currentSensor.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Water Content */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Water Content</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {currentSensor.data.waterContent.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {guidelines?.wc}
                </p>
              </div>

              {/* EC */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">EC</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {currentSensor.data.ec.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {guidelines?.ec} mS/cm
                </p>
              </div>

              {/* Temperature */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Temperature</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {currentSensor.data.temperature.toFixed(0)}°F
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: 65-75°F
                </p>
              </div>

              {/* pH */}
              {currentSensor.data.ph && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">pH</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {currentSensor.data.ph.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Target: {guidelines?.ph}
                  </p>
                </div>
              )}
            </div>

            {/* Alerts */}
            {currentSensor.status !== 'optimal' && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-sm">
                    {currentSensor.status === 'dry' && (
                      <p className="text-yellow-300">
                        Low water content detected. Consider increasing irrigation frequency or volume.
                      </p>
                    )}
                    {currentSensor.status === 'wet' && (
                      <p className="text-blue-300">
                        High water content detected. Reduce irrigation to prevent root issues.
                      </p>
                    )}
                    {currentSensor.status === 'warning' && (
                      <p className="text-red-300">
                        EC levels outside optimal range. Check nutrient solution concentration.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Water Content Trend Chart */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Water Content Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { time: '00:00', wc: 70 },
                  { time: '03:00', wc: 65 },
                  { time: '06:00', wc: 75 },
                  { time: '09:00', wc: 68 },
                  { time: '12:00', wc: 72 },
                  { time: '15:00', wc: 66 },
                  { time: '18:00', wc: 71 },
                  { time: '21:00', wc: 64 },
                  { time: 'Now', wc: currentSensor.data.waterContent }
                ]}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wc"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#waterGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Irrigation Schedule */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Today's Irrigation Schedule
            </h3>
            <div className="space-y-3">
              {irrigationSchedule.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{event.time}</p>
                      <p className="text-sm text-gray-400">
                        {event.duration} min • {event.volume} mL • EC {event.ec} • pH {event.ph}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    new Date().getHours() > parseInt(event.time.split(':')[0])
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {new Date().getHours() > parseInt(event.time.split(':')[0]) ? 'Completed' : 'Scheduled'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substrate Guidelines */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-600/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-2">
                  {currentSensor.type.charAt(0).toUpperCase() + currentSensor.type.slice(1)} Growing Guidelines
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Water Content</p>
                    <p className="text-white">{guidelines?.wc}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">EC Range</p>
                    <p className="text-white">{guidelines?.ec} mS/cm</p>
                  </div>
                  <div>
                    <p className="text-gray-400">pH Range</p>
                    <p className="text-white">{guidelines?.ph}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}