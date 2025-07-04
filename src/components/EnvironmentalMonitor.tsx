"use client"

import { useState, useEffect, useMemo } from 'react'
import { 
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

interface SensorReading {
  timestamp: Date
  temperature: number // °C
  humidity: number // %
  co2: number // ppm
  vpd: number // kPa
  lightIntensity: number // μmol/m²/s
}

interface SensorThresholds {
  temperature: { min: number; max: number; optimal: { min: number; max: number } }
  humidity: { min: number; max: number; optimal: { min: number; max: number } }
  co2: { min: number; max: number; optimal: { min: number; max: number } }
  vpd: { min: number; max: number; optimal: { min: number; max: number } }
}

interface EnvironmentalAlert {
  id: string
  type: 'temperature' | 'humidity' | 'co2' | 'vpd'
  severity: 'warning' | 'critical'
  message: string
  timestamp: Date
  value: number
}

const DEFAULT_THRESHOLDS: Record<string, SensorThresholds> = {
  lettuce: {
    temperature: { min: 15, max: 25, optimal: { min: 18, max: 22 } },
    humidity: { min: 50, max: 80, optimal: { min: 60, max: 70 } },
    co2: { min: 400, max: 1500, optimal: { min: 800, max: 1200 } },
    vpd: { min: 0.6, max: 1.2, optimal: { min: 0.8, max: 1.0 } }
  },
  tomato: {
    temperature: { min: 18, max: 28, optimal: { min: 21, max: 24 } },
    humidity: { min: 60, max: 85, optimal: { min: 65, max: 75 } },
    co2: { min: 400, max: 1500, optimal: { min: 1000, max: 1400 } },
    vpd: { min: 0.8, max: 1.4, optimal: { min: 1.0, max: 1.2 } }
  },
  cannabis: {
    temperature: { min: 20, max: 30, optimal: { min: 24, max: 26 } },
    humidity: { min: 40, max: 70, optimal: { min: 50, max: 60 } },
    co2: { min: 400, max: 1500, optimal: { min: 1200, max: 1500 } },
    vpd: { min: 0.8, max: 1.5, optimal: { min: 1.0, max: 1.3 } }
  }
}

interface EnvironmentalMonitorProps {
  cropType: string
  growthStage: string
  onAlertChange?: (alerts: EnvironmentalAlert[]) => void
  className?: string
}

export function EnvironmentalMonitor({
  cropType,
  growthStage,
  onAlertChange,
  className = ''
}: EnvironmentalMonitorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null)
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60) // seconds

  // Get thresholds for current crop
  const thresholds = DEFAULT_THRESHOLDS[cropType] || DEFAULT_THRESHOLDS.lettuce

  // Calculate VPD from temperature and humidity
  const calculateVPD = (temp: number, humidity: number): number => {
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))
    const avp = svp * (humidity / 100)
    return svp - avp
  }

  // Simulate sensor readings (in production, this would connect to real sensors)
  const generateReading = (): SensorReading => {
    const baseTemp = 22
    const baseHumidity = 65
    const baseCO2 = 1000
    
    const temp = baseTemp + (Math.random() - 0.5) * 4
    const humidity = baseHumidity + (Math.random() - 0.5) * 10
    const co2 = baseCO2 + (Math.random() - 0.5) * 200
    const vpd = calculateVPD(temp, humidity)
    const lightIntensity = 600 + (Math.random() - 0.5) * 100
    
    return {
      timestamp: new Date(),
      temperature: temp,
      humidity,
      co2,
      vpd,
      lightIntensity
    }
  }

  // Check for alerts
  const checkAlerts = (reading: SensorReading): EnvironmentalAlert[] => {
    const newAlerts: EnvironmentalAlert[] = []
    
    // Temperature alerts
    if (reading.temperature < thresholds.temperature.min || reading.temperature > thresholds.temperature.max) {
      newAlerts.push({
        id: `temp-${Date.now()}`,
        type: 'temperature',
        severity: 'critical',
        message: `Temperature ${reading.temperature.toFixed(1)}°C is outside safe range`,
        timestamp: new Date(),
        value: reading.temperature
      })
    } else if (reading.temperature < thresholds.temperature.optimal.min || reading.temperature > thresholds.temperature.optimal.max) {
      newAlerts.push({
        id: `temp-${Date.now()}`,
        type: 'temperature',
        severity: 'warning',
        message: `Temperature ${reading.temperature.toFixed(1)}°C is outside optimal range`,
        timestamp: new Date(),
        value: reading.temperature
      })
    }
    
    // Humidity alerts
    if (reading.humidity < thresholds.humidity.min || reading.humidity > thresholds.humidity.max) {
      newAlerts.push({
        id: `humidity-${Date.now()}`,
        type: 'humidity',
        severity: 'critical',
        message: `Humidity ${reading.humidity.toFixed(0)}% is outside safe range`,
        timestamp: new Date(),
        value: reading.humidity
      })
    }
    
    // CO2 alerts
    if (reading.co2 < thresholds.co2.min) {
      newAlerts.push({
        id: `co2-${Date.now()}`,
        type: 'co2',
        severity: 'warning',
        message: `CO2 ${reading.co2.toFixed(0)}ppm is below optimal for photosynthesis`,
        timestamp: new Date(),
        value: reading.co2
      })
    }
    
    // VPD alerts
    if (reading.vpd < thresholds.vpd.min || reading.vpd > thresholds.vpd.max) {
      newAlerts.push({
        id: `vpd-${Date.now()}`,
        type: 'vpd',
        severity: 'critical',
        message: `VPD ${reading.vpd.toFixed(2)}kPa affects transpiration rate`,
        timestamp: new Date(),
        value: reading.vpd
      })
    }
    
    return newAlerts
  }

  // Update readings
  useEffect(() => {
    if (!autoRefresh || !isConnected) return
    
    const interval = setInterval(() => {
      const newReading = generateReading()
      setCurrentReading(newReading)
      setReadings(prev => [...prev.slice(-59), newReading]) // Keep last 60 readings
      
      const newAlerts = checkAlerts(newReading)
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)) // Keep last 10 alerts
        onAlertChange?.(newAlerts)
      }
    }, refreshInterval * 1000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, isConnected, refreshInterval, thresholds])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (readings.length === 0) return null
    
    const recent = readings.slice(-10)
    const avgTemp = recent.reduce((sum, r) => sum + r.temperature, 0) / recent.length
    const avgHumidity = recent.reduce((sum, r) => sum + r.humidity, 0) / recent.length
    const avgCO2 = recent.reduce((sum, r) => sum + r.co2, 0) / recent.length
    const avgVPD = recent.reduce((sum, r) => sum + r.vpd, 0) / recent.length
    
    // Trends
    const tempTrend = recent.length > 1 ? recent[recent.length - 1].temperature - recent[0].temperature : 0
    const humidityTrend = recent.length > 1 ? recent[recent.length - 1].humidity - recent[0].humidity : 0
    
    return {
      avgTemp,
      avgHumidity,
      avgCO2,
      avgVPD,
      tempTrend,
      humidityTrend
    }
  }, [readings])

  // Export data
  const exportData = () => {
    const data = {
      cropType,
      growthStage,
      readings: readings.map(r => {
        const { timestamp, ...rest } = r
        return {
          ...rest,
          timestamp: timestamp.toISOString()
        }
      }),
      alerts,
      statistics,
      thresholds,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `environmental-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (value: number, thresholds: { min: number; max: number; optimal: { min: number; max: number } }) => {
    if (value < thresholds.min || value > thresholds.max) return 'text-red-400'
    if (value < thresholds.optimal.min || value > thresholds.optimal.max) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusIcon = (value: number, thresholds: { min: number; max: number; optimal: { min: number; max: number } }) => {
    if (value < thresholds.min || value > thresholds.max) return <AlertTriangle className="w-4 h-4" />
    if (value < thresholds.optimal.min || value > thresholds.optimal.max) return <Activity className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Thermometer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Environmental Monitor</h3>
            <p className="text-sm text-gray-400">Real-time sensor integration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
              isConnected 
                ? 'bg-green-600/20 border border-green-600/50 text-green-400'
                : 'bg-gray-700 border border-gray-600 text-gray-400'
            }`}
          >
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? 'Connected' : 'Connect'}
          </button>
          <button
            onClick={exportData}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
          <p className="text-gray-300 text-sm text-center">
            Click "Connect" to start receiving sensor data
          </p>
        </div>
      )}

      {/* Current Readings */}
      {isConnected && currentReading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Temperature */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Temperature</span>
                </div>
                {getStatusIcon(currentReading.temperature, thresholds.temperature)}
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(currentReading.temperature, thresholds.temperature)}`}>
                {currentReading.temperature.toFixed(1)}°C
              </p>
              {statistics && (
                <div className="flex items-center gap-1 mt-1">
                  {statistics.tempTrend > 0 ? (
                    <TrendingUp className="w-3 h-3 text-red-400" />
                  ) : statistics.tempTrend < 0 ? (
                    <TrendingDown className="w-3 h-3 text-blue-400" />
                  ) : null}
                  <span className="text-xs text-gray-500">
                    {Math.abs(statistics.tempTrend).toFixed(1)}°/10min
                  </span>
                </div>
              )}
            </div>

            {/* Humidity */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Humidity</span>
                </div>
                {getStatusIcon(currentReading.humidity, thresholds.humidity)}
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(currentReading.humidity, thresholds.humidity)}`}>
                {currentReading.humidity.toFixed(0)}%
              </p>
              {statistics && (
                <div className="flex items-center gap-1 mt-1">
                  {statistics.humidityTrend > 0 ? (
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                  ) : statistics.humidityTrend < 0 ? (
                    <TrendingDown className="w-3 h-3 text-orange-400" />
                  ) : null}
                  <span className="text-xs text-gray-500">
                    {Math.abs(statistics.humidityTrend).toFixed(0)}%/10min
                  </span>
                </div>
              )}
            </div>

            {/* CO2 */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">CO₂</span>
                </div>
                {getStatusIcon(currentReading.co2, thresholds.co2)}
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(currentReading.co2, thresholds.co2)}`}>
                {currentReading.co2.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">ppm</p>
            </div>

            {/* VPD */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">VPD</span>
                </div>
                {getStatusIcon(currentReading.vpd, thresholds.vpd)}
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(currentReading.vpd, thresholds.vpd)}`}>
                {currentReading.vpd.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">kPa</p>
            </div>
          </div>

          {/* Optimal Ranges */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
            <h4 className="font-medium text-white mb-3">Optimal Ranges for {cropType}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Temperature:</span>
                <span className="text-white">
                  {thresholds.temperature.optimal.min}–{thresholds.temperature.optimal.max}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Humidity:</span>
                <span className="text-white">
                  {thresholds.humidity.optimal.min}–{thresholds.humidity.optimal.max}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CO₂:</span>
                <span className="text-white">
                  {thresholds.co2.optimal.min}–{thresholds.co2.optimal.max} ppm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VPD:</span>
                <span className="text-white">
                  {thresholds.vpd.optimal.min}–{thresholds.vpd.optimal.max} kPa
                </span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h4 className="font-medium text-white mb-3">Recent Alerts</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2 text-sm p-2 rounded ${
                      alert.severity === 'critical' 
                        ? 'bg-red-900/30 text-red-300' 
                        : 'bg-yellow-900/30 text-yellow-300'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{alert.message}</p>
                      <p className="text-xs opacity-70">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Auto-refresh Settings */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-300">Auto-refresh every {refreshInterval}s</span>
        </label>
        
        <button
          onClick={() => {
            if (isConnected) {
              const newReading = generateReading()
              setCurrentReading(newReading)
              setReadings(prev => [...prev.slice(-59), newReading])
            }
          }}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}