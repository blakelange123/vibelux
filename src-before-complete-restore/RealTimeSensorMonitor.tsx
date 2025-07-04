"use client"

import { useState, useEffect, useRef } from 'react'
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw, Download, Settings2 } from 'lucide-react'

interface SensorPoint {
  id: string
  name: string
  x: number
  y: number
  ppfd: number
  temp: number
  humidity: number
  co2: number
  vpd: number
  status: 'optimal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

interface AlertConfig {
  ppfdMin: number
  ppfdMax: number
  tempMin: number
  tempMax: number
  humidityMin: number
  humidityMax: number
  co2Min: number
  co2Max: number
  vpdMin: number
  vpdMax: number
}

export function RealTimeSensorMonitor() {
  const [sensors, setSensors] = useState<SensorPoint[]>([])
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [refreshRate, setRefreshRate] = useState(5000) // 5 seconds
  const [showAlerts, setShowAlerts] = useState(true)
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    ppfdMin: 400,
    ppfdMax: 800,
    tempMin: 65,
    tempMax: 78,
    humidityMin: 40,
    humidityMax: 70,
    co2Min: 400,
    co2Max: 1500,
    vpdMin: 0.8,
    vpdMax: 1.2
  })
  const [history, setHistory] = useState<{ [key: string]: number[] }>({})
  const intervalRef = useRef<NodeJS.Timeout>()

  // Simulate sensor data
  const generateSensorData = (): SensorPoint[] => {
    const positions = [
      { x: 5, y: 5, name: 'Zone A1' },
      { x: 15, y: 5, name: 'Zone A2' },
      { x: 5, y: 15, name: 'Zone B1' },
      { x: 15, y: 15, name: 'Zone B2' },
      { x: 10, y: 10, name: 'Center' }
    ]

    return positions.map((pos, idx) => {
      // Add some realistic variation
      const baseTemp = 72 + Math.sin(Date.now() / 10000 + idx) * 3
      const baseHumidity = 55 + Math.cos(Date.now() / 8000 + idx) * 10
      const basePPFD = 600 + Math.sin(Date.now() / 12000 + idx * 2) * 100
      
      const temp = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2
      const humidity = baseHumidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5
      const ppfd = basePPFD + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50
      const co2 = 800 + Math.sin(Date.now() / 15000) * 200 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100
      
      // Calculate VPD
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))
      const vpd = (1 - humidity / 100) * svp

      // Determine status
      let status: 'optimal' | 'warning' | 'critical' = 'optimal'
      if (
        ppfd < alertConfig.ppfdMin || ppfd > alertConfig.ppfdMax ||
        temp < alertConfig.tempMin || temp > alertConfig.tempMax ||
        humidity < alertConfig.humidityMin || humidity > alertConfig.humidityMax ||
        vpd < alertConfig.vpdMin || vpd > alertConfig.vpdMax
      ) {
        status = 'warning'
      }
      if (
        ppfd < alertConfig.ppfdMin * 0.8 || ppfd > alertConfig.ppfdMax * 1.2 ||
        temp < alertConfig.tempMin - 5 || temp > alertConfig.tempMax + 5
      ) {
        status = 'critical'
      }

      // Determine trend based on history
      const historyKey = `sensor-${idx}`
      const currentHistory = history[historyKey] || []
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (currentHistory.length > 2) {
        const recent = currentHistory.slice(-3)
        const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
        if (ppfd > avgRecent * 1.02) trend = 'up'
        else if (ppfd < avgRecent * 0.98) trend = 'down'
      }

      return {
        id: `sensor-${idx}`,
        name: pos.name,
        x: pos.x,
        y: pos.y,
        ppfd: Math.round(ppfd),
        temp: Math.round(temp * 10) / 10,
        humidity: Math.round(humidity),
        co2: Math.round(co2),
        vpd: Math.round(vpd * 100) / 100,
        status,
        trend
      }
    })
  }

  // Update sensor data
  useEffect(() => {
    if (isLive) {
      const updateData = () => {
        const newData = generateSensorData()
        setSensors(newData)
        
        // Update history
        const newHistory = { ...history }
        newData.forEach(sensor => {
          const key = sensor.id
          if (!newHistory[key]) newHistory[key] = []
          newHistory[key].push(sensor.ppfd)
          if (newHistory[key].length > 20) newHistory[key].shift()
        })
        setHistory(newHistory)
      }

      updateData() // Initial update
      intervalRef.current = setInterval(updateData, refreshRate)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [isLive, refreshRate])

  // Export data
  const exportData = () => {
    const csv = [
      'Timestamp,Sensor,X,Y,PPFD,Temperature,Humidity,CO2,VPD,Status',
      ...sensors.map(s => 
        `${new Date().toISOString()},${s.name},${s.x},${s.y},${s.ppfd},${s.temp},${s.humidity},${s.co2},${s.vpd},${s.status}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sensor-data-${Date.now()}.csv`
    a.click()
  }

  const alerts = sensors.filter(s => s.status !== 'optimal')

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400" />
          Real-Time Sensor Monitor
        </h3>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`p-2 rounded-lg transition-colors ${
              showAlerts ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
            title="Toggle alerts"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className={`p-2 rounded-lg transition-colors ${
              isLive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLive ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={exportData}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map(sensor => (
            <div
              key={sensor.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                sensor.status === 'critical' 
                  ? 'bg-red-900/20 border border-red-600/30' 
                  : 'bg-yellow-900/20 border border-yellow-600/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-4 h-4 ${
                  sensor.status === 'critical' ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <span className="text-sm text-white">{sensor.name}</span>
              </div>
              <div className="text-sm text-gray-300">
                {sensor.ppfd < alertConfig.ppfdMin && `Low PPFD: ${sensor.ppfd} μmol`}
                {sensor.ppfd > alertConfig.ppfdMax && `High PPFD: ${sensor.ppfd} μmol`}
                {sensor.temp < alertConfig.tempMin && `Low Temp: ${sensor.temp}°F`}
                {sensor.temp > alertConfig.tempMax && `High Temp: ${sensor.temp}°F`}
                {sensor.vpd < alertConfig.vpdMin && `Low VPD: ${sensor.vpd} kPa`}
                {sensor.vpd > alertConfig.vpdMax && `High VPD: ${sensor.vpd} kPa`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => (
          <div
            key={sensor.id}
            onClick={() => setSelectedSensor(sensor.id)}
            className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-gray-700 ${
              selectedSensor === sensor.id ? 'ring-2 ring-purple-500' : ''
            } ${
              sensor.status === 'critical' ? 'border border-red-600/50' :
              sensor.status === 'warning' ? 'border border-yellow-600/50' :
              'border border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{sensor.name}</h4>
              <div className="flex items-center gap-2">
                {sensor.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                {sensor.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                {sensor.trend === 'stable' && <Minus className="w-4 h-4 text-blue-400" />}
                <div className={`w-2 h-2 rounded-full ${
                  sensor.status === 'optimal' ? 'bg-green-400' :
                  sensor.status === 'warning' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">PPFD</p>
                <p className="text-white font-medium">{sensor.ppfd} μmol</p>
              </div>
              <div>
                <p className="text-gray-400">Temp</p>
                <p className="text-white font-medium">{sensor.temp}°F</p>
              </div>
              <div>
                <p className="text-gray-400">RH</p>
                <p className="text-white font-medium">{sensor.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">VPD</p>
                <p className="text-white font-medium">{sensor.vpd} kPa</p>
              </div>
            </div>
            
            {/* Mini chart */}
            {history[sensor.id] && history[sensor.id].length > 1 && (
              <div className="mt-3 h-8 flex items-end gap-0.5">
                {history[sensor.id].slice(-10).map((value, idx) => {
                  const height = ((value - 400) / 400) * 100
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-purple-600/50 rounded-t"
                      style={{ height: `${Math.max(10, Math.min(100, height))}%` }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            {sensors.length} sensors active
          </span>
          <span className="text-gray-400">
            Refresh: {refreshRate / 1000}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-400">Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-gray-400">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-gray-400">Critical</span>
          </div>
        </div>
      </div>
    </div>
  )
}