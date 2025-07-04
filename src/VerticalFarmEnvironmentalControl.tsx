"use client"

import { useState, useEffect } from 'react'
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Cloud,
  Activity,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Settings
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface EnvironmentalSetpoint {
  temperature: { min: number; max: number; optimal: number }
  humidity: { min: number; max: number; optimal: number }
  co2: { min: number; max: number; optimal: number }
  vpd: { min: number; max: number; optimal: number }
  airflow: { min: number; max: number; optimal: number }
}

interface SensorReading {
  timestamp: Date
  temperature: number
  humidity: number
  co2: number
  vpd: number
  airflow: number
}

const cropSetpoints: Record<string, EnvironmentalSetpoint> = {
  'leafy-greens': {
    temperature: { min: 65, max: 75, optimal: 70 },
    humidity: { min: 60, max: 70, optimal: 65 },
    co2: { min: 800, max: 1200, optimal: 1000 },
    vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
    airflow: { min: 15, max: 25, optimal: 20 }
  },
  'herbs': {
    temperature: { min: 68, max: 78, optimal: 73 },
    humidity: { min: 55, max: 65, optimal: 60 },
    co2: { min: 900, max: 1300, optimal: 1100 },
    vpd: { min: 0.9, max: 1.3, optimal: 1.1 },
    airflow: { min: 18, max: 28, optimal: 23 }
  },
  'strawberries': {
    temperature: { min: 60, max: 70, optimal: 65 },
    humidity: { min: 65, max: 75, optimal: 70 },
    co2: { min: 1000, max: 1500, optimal: 1200 },
    vpd: { min: 0.7, max: 1.1, optimal: 0.9 },
    airflow: { min: 20, max: 30, optimal: 25 }
  },
  'cannabis': {
    temperature: { min: 70, max: 80, optimal: 75 },
    humidity: { min: 50, max: 60, optimal: 55 },
    co2: { min: 1200, max: 1500, optimal: 1350 },
    vpd: { min: 1.0, max: 1.5, optimal: 1.25 },
    airflow: { min: 25, max: 35, optimal: 30 }
  }
}

export function VerticalFarmEnvironmentalControl() {
  const [selectedCrop, setSelectedCrop] = useState('leafy-greens')
  const [currentReadings, setCurrentReadings] = useState<SensorReading>({
    timestamp: new Date(),
    temperature: 72,
    humidity: 63,
    co2: 1050,
    vpd: 1.1,
    airflow: 22
  })
  const [historicalData, setHistoricalData] = useState<SensorReading[]>([])
  const [showAlerts, setShowAlerts] = useState(true)
  const [automationEnabled, setAutomationEnabled] = useState(true)

  const setpoints = cropSetpoints[selectedCrop]

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      const newReading: SensorReading = {
        timestamp: new Date(),
        temperature: currentReadings.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5,
        humidity: currentReadings.humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1,
        co2: currentReadings.co2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20,
        vpd: Math.max(0.5, Math.min(2.0, currentReadings.vpd + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.05)),
        airflow: Math.max(10, Math.min(40, currentReadings.airflow + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2))
      }
      
      setCurrentReadings(newReading)
      setHistoricalData(prev => [...prev.slice(-59), newReading])
    }, 5000)

    return () => clearInterval(interval)
  }, [currentReadings])

  // Calculate VPD from temperature and humidity
  const calculateVPD = (temp: number, rh: number): number => {
    const tempC = (temp - 32) * 5/9
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3))
    const avp = svp * (rh / 100)
    return svp - avp
  }

  // Check if parameter is within optimal range
  const isOptimal = (value: number, param: keyof EnvironmentalSetpoint): boolean => {
    const range = setpoints[param]
    return value >= range.min && value <= range.max
  }

  // Get status color
  const getStatusColor = (value: number, param: keyof EnvironmentalSetpoint): string => {
    const range = setpoints[param]
    if (value < range.min || value > range.max) return 'text-red-400'
    if (Math.abs(value - range.optimal) < (range.max - range.min) * 0.1) return 'text-green-400'
    return 'text-yellow-400'
  }

  // Format historical data for charts
  const chartData = historicalData.map((reading, index) => ({
    time: index,
    temperature: reading.temperature,
    humidity: reading.humidity,
    co2: reading.co2 / 10, // Scale down for visibility
    vpd: reading.vpd * 50, // Scale up for visibility
    airflow: reading.airflow
  }))

  // Get alerts
  const alerts = []
  if (!isOptimal(currentReadings.temperature, 'temperature')) {
    alerts.push({
      type: 'temperature',
      message: `Temperature ${currentReadings.temperature.toFixed(1)}°F is outside optimal range`,
      severity: Math.abs(currentReadings.temperature - setpoints.temperature.optimal) > 5 ? 'high' : 'medium'
    })
  }
  if (!isOptimal(currentReadings.humidity, 'humidity')) {
    alerts.push({
      type: 'humidity',
      message: `Humidity ${currentReadings.humidity.toFixed(0)}% is outside optimal range`,
      severity: Math.abs(currentReadings.humidity - setpoints.humidity.optimal) > 10 ? 'high' : 'medium'
    })
  }
  if (!isOptimal(currentReadings.co2, 'co2')) {
    alerts.push({
      type: 'co2',
      message: `CO₂ ${currentReadings.co2.toFixed(0)}ppm is outside optimal range`,
      severity: Math.abs(currentReadings.co2 - setpoints.co2.optimal) > 200 ? 'high' : 'medium'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Environmental Control System</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Automation</label>
              <button
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  automationEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  automationEnabled ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Crop Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400">Crop Type:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="leafy-greens">Leafy Greens</option>
            <option value="herbs">Herbs</option>
            <option value="strawberries">Strawberries</option>
            <option value="cannabis">Cannabis</option>
          </select>
          <div className="ml-auto text-sm text-gray-400">
            Last update: {currentReadings.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Temperature</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(currentReadings.temperature, 'temperature')}`}>
            {currentReadings.temperature.toFixed(1)}°F
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {setpoints.temperature.optimal}°F
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Humidity</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(currentReadings.humidity, 'humidity')}`}>
            {currentReadings.humidity.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {setpoints.humidity.optimal}%
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">CO₂</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(currentReadings.co2, 'co2')}`}>
            {currentReadings.co2.toFixed(0)}ppm
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {setpoints.co2.optimal}ppm
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">VPD</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(currentReadings.vpd, 'vpd')}`}>
            {currentReadings.vpd.toFixed(2)} kPa
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {setpoints.vpd.optimal} kPa
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">Airflow</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(currentReadings.airflow, 'airflow')}`}>
            {currentReadings.airflow.toFixed(0)} ACH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {setpoints.airflow.optimal} ACH
          </p>
        </div>
      </div>

      {/* Historical Trends */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Historical Trends (Last 5 Minutes)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelFormatter={(value) => `${value * 5}s ago`}
              />
              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="co2" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="vpd" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="airflow" stroke="#06B6D4" strokeWidth={2} dot={false} />
              <ReferenceLine y={setpoints.temperature.optimal} stroke="#F59E0B" strokeDasharray="5 5" />
              <ReferenceLine y={setpoints.humidity.optimal} stroke="#3B82F6" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded" />
            <span className="text-gray-400">Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded" />
            <span className="text-gray-400">Humidity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-gray-400">CO₂ (/10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded" />
            <span className="text-gray-400">VPD (×50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded" />
            <span className="text-gray-400">Airflow</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}
              >
                <AlertCircle className={`w-5 h-5 ${
                  alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <span className="text-sm text-gray-300">{alert.message}</span>
                {automationEnabled && (
                  <span className="ml-auto text-xs text-gray-500">Auto-adjusting...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Actions */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              alert('Temperature adjustment panel would open here. Feature coming soon!')
            }}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Thermometer className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-sm text-white">Adjust Temp</p>
          </button>
          <button 
            onClick={() => {
              alert('Misting system toggled. Feature coming soon!')
            }}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Droplets className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-sm text-white">Mist System</p>
          </button>
          <button 
            onClick={() => {
              alert('CO₂ injection started for 10 minutes. Feature coming soon!')
            }}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Cloud className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm text-white">CO₂ Injection</p>
          </button>
          <button 
            onClick={() => {
              alert('Fan speed control panel would open here. Feature coming soon!')
            }}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Wind className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-sm text-white">Fan Speed</p>
          </button>
        </div>
      </div>
    </div>
  )
}