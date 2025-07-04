"use client"

import { useState, useEffect } from 'react'
import { Thermometer, Droplets, Wind, Cloud, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer 
} from 'recharts'

interface EnvironmentalData {
  timestamp: string
  temperature: number
  humidity: number
  vpd: number
  co2: number
}

interface SensorReading {
  label: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'optimal' | 'warning' | 'critical'
  icon: any
  color: string
  optimal: { min: number; max: number }
}

export function EnvironmentalMonitor() {
  const [currentData, setCurrentData] = useState<EnvironmentalData>({
    timestamp: new Date().toISOString(),
    temperature: 72,
    humidity: 55,
    vpd: 1.2,
    co2: 800
  })
  
  const [historicalData, setHistoricalData] = useState<EnvironmentalData[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'vpd' | 'co2'>('temperature')

  // Calculate VPD from temperature and humidity
  const calculateVPD = (temp: number, rh: number): number => {
    // Convert F to C
    const tempC = (temp - 32) * 5 / 9
    // Saturation vapor pressure
    const svp = 0.6108 * Math.exp(17.27 * tempC / (tempC + 237.3))
    // Actual vapor pressure
    const avp = svp * (rh / 100)
    // VPD in kPa
    return Math.round((svp - avp) * 100) / 100
  }

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentData(prev => {
        const newTemp = prev.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2
        const newHumidity = prev.humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3
        const newCO2 = prev.co2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50
        const newVPD = calculateVPD(newTemp, newHumidity)

        const newData = {
          timestamp: new Date().toISOString(),
          temperature: Math.round(newTemp * 10) / 10,
          humidity: Math.round(newHumidity),
          vpd: newVPD,
          co2: Math.round(newCO2)
        }

        // Check for alerts
        const newAlerts: string[] = []
        if (newTemp < 65 || newTemp > 85) newAlerts.push('Temperature out of range')
        if (newHumidity < 40 || newHumidity > 70) newAlerts.push('Humidity out of range')
        if (newVPD < 0.8 || newVPD > 1.5) newAlerts.push('VPD not optimal')
        if (newCO2 < 400 || newCO2 > 1500) newAlerts.push('CO2 levels abnormal')
        
        setAlerts(newAlerts)
        
        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Store historical data
  useEffect(() => {
    setHistoricalData(prev => {
      const newHistory = [...prev, currentData]
      // Keep last 20 data points
      if (newHistory.length > 20) {
        return newHistory.slice(-20)
      }
      return newHistory
    })
  }, [currentData])

  const sensorReadings: SensorReading[] = [
    {
      label: 'Temperature',
      value: currentData.temperature,
      unit: '°F',
      trend: currentData.temperature > 75 ? 'up' : currentData.temperature < 70 ? 'down' : 'stable',
      status: currentData.temperature >= 68 && currentData.temperature <= 78 ? 'optimal' : 
               currentData.temperature >= 65 && currentData.temperature <= 85 ? 'warning' : 'critical',
      icon: Thermometer,
      color: 'text-orange-400',
      optimal: { min: 68, max: 78 }
    },
    {
      label: 'Humidity',
      value: currentData.humidity,
      unit: '%',
      trend: currentData.humidity > 60 ? 'up' : currentData.humidity < 50 ? 'down' : 'stable',
      status: currentData.humidity >= 50 && currentData.humidity <= 60 ? 'optimal' : 
               currentData.humidity >= 40 && currentData.humidity <= 70 ? 'warning' : 'critical',
      icon: Droplets,
      color: 'text-blue-400',
      optimal: { min: 50, max: 60 }
    },
    {
      label: 'VPD',
      value: currentData.vpd,
      unit: 'kPa',
      trend: currentData.vpd > 1.2 ? 'up' : currentData.vpd < 1.0 ? 'down' : 'stable',
      status: currentData.vpd >= 0.8 && currentData.vpd <= 1.2 ? 'optimal' : 
               currentData.vpd >= 0.6 && currentData.vpd <= 1.5 ? 'warning' : 'critical',
      icon: Wind,
      color: 'text-green-400',
      optimal: { min: 0.8, max: 1.2 }
    },
    {
      label: 'CO2',
      value: currentData.co2,
      unit: 'ppm',
      trend: currentData.co2 > 900 ? 'up' : currentData.co2 < 700 ? 'down' : 'stable',
      status: currentData.co2 >= 700 && currentData.co2 <= 900 ? 'optimal' : 
               currentData.co2 >= 400 && currentData.co2 <= 1500 ? 'warning' : 'critical',
      icon: Cloud,
      color: 'text-purple-400',
      optimal: { min: 700, max: 900 }
    }
  ]

  const getChartData = () => {
    return historicalData.map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }),
      value: d[selectedMetric]
    }))
  }

  return (
    <div className="w-full space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-400 mb-1">Environmental Alerts</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {alerts.map((alert, idx) => (
                  <li key={idx}>• {alert}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Current Readings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sensorReadings.map((reading) => {
          const Icon = reading.icon
          return (
            <div
              key={reading.label}
              className={`bg-gray-900 rounded-xl p-6 border transition-all cursor-pointer hover:scale-105 ${
                selectedMetric === reading.label.toLowerCase()
                  ? 'border-purple-600 ring-2 ring-purple-600/20 shadow-lg shadow-purple-500/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setSelectedMetric(reading.label.toLowerCase() as any)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-800`}>
                  <Icon className={`w-6 h-6 ${reading.color}`} />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reading.status === 'optimal' ? 'bg-green-900/20 text-green-400' :
                  reading.status === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {reading.status}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-400">{reading.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {reading.label === 'VPD' ? reading.value.toFixed(1) : Math.round(reading.value)}
                  </span>
                  <span className="text-sm text-gray-500">{reading.unit}</span>
                </div>
                {reading.trend !== 'stable' && (
                  <div className="flex items-center gap-1 mt-1">
                    {reading.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {reading.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Optimal: {reading.optimal.min}-{reading.optimal.max}{reading.unit}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Historical Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} History
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environmental Recommendations */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Environmental Optimization Tips
        </h3>
        <div className="space-y-3">
          {currentData.vpd < 0.8 && (
            <div className="flex items-start gap-3">
              <Wind className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Low VPD Detected</p>
                <p className="text-sm text-gray-300">
                  Increase temperature or decrease humidity to improve transpiration
                </p>
              </div>
            </div>
          )}
          {currentData.vpd > 1.5 && (
            <div className="flex items-start gap-3">
              <Wind className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">High VPD Detected</p>
                <p className="text-sm text-gray-300">
                  Decrease temperature or increase humidity to prevent stress
                </p>
              </div>
            </div>
          )}
          {currentData.co2 < 700 && (
            <div className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Low CO2 Levels</p>
                <p className="text-sm text-gray-300">
                  Consider CO2 supplementation during lights-on period for better growth
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}