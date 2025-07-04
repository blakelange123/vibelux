'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Wifi, 
  WifiOff,
  Weight,
  Thermometer,
  Droplets,
  Eye,
  BarChart3,
  AlertCircle,
  Settings,
  Plus,
  RefreshCw,
  Download,
  TrendingUp,
  Camera
} from 'lucide-react'
import {
  SensorDevice,
  SensorReading,
  SensorType,
  WeightReading,
  CO2Reading,
  TempHumidityReading,
  SpectralReading,
  ThermalReading
} from '@/lib/sensor-interfaces'
import { sensorService, createMockSensors } from '@/lib/sensor-integration'

interface SensorDashboardProps {
  onSensorData?: (sensorId: string, reading: SensorReading) => void
}

export default function SensorDashboard({ onSensorData }: SensorDashboardProps) {
  const [sensors, setSensors] = useState<SensorDevice[]>([])
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [sensorReadings, setSensorReadings] = useState<Map<string, SensorReading[]>>(new Map())
  const [showAddSensor, setShowAddSensor] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showRawData, setShowRawData] = useState(false)

  // Initialize with mock sensors in development
  useEffect(() => {
    const mockSensors = createMockSensors()
    setSensors(mockSensors)
  }, [])

  // Subscribe to sensor updates
  useEffect(() => {
    const subscriptions: { sensorId: string; callback: (reading: SensorReading) => void }[] = []

    sensors.forEach(sensor => {
      if (sensor.status === 'connected') {
        const callback = (reading: SensorReading) => {
          setSensorReadings(prev => {
            const newMap = new Map(prev)
            const readings = newMap.get(sensor.id) || []
            newMap.set(sensor.id, [...readings.slice(-99), reading]) // Keep last 100
            return newMap
          })

          if (onSensorData) {
            onSensorData(sensor.id, reading)
          }
        }

        sensorService.subscribe(sensor.id, callback)
        subscriptions.push({ sensorId: sensor.id, callback })
      }
    })

    return () => {
      subscriptions.forEach(({ sensorId, callback }) => {
        sensorService.unsubscribe(sensorId, callback)
      })
    }
  }, [sensors, onSensorData])

  // Connect/disconnect sensor
  const toggleSensorConnection = async (sensor: SensorDevice) => {
    if (sensor.status === 'disconnected') {
      const success = await sensorService.connectSensor(sensor)
      if (success) {
        setSensors(prev => prev.map(s => 
          s.id === sensor.id ? { ...s, status: 'connected' } : s
        ))
      }
    } else {
      sensorService.disconnectSensor(sensor.id)
      setSensors(prev => prev.map(s => 
        s.id === sensor.id ? { ...s, status: 'disconnected' } : s
      ))
    }
  }

  // Get sensor icon
  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case SensorType.WEIGHT:
        return <Weight className="w-5 h-5" />
      case SensorType.TEMPERATURE_HUMIDITY:
        return <Thermometer className="w-5 h-5" />
      case SensorType.CO2:
        return <Droplets className="w-5 h-5" />
      case SensorType.SPECTROMETER:
        return <BarChart3 className="w-5 h-5" />
      case SensorType.THERMAL_CAMERA:
        return <Camera className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  // Get sensor color
  const getSensorColor = (type: SensorType) => {
    switch (type) {
      case SensorType.WEIGHT:
        return 'text-green-400'
      case SensorType.TEMPERATURE_HUMIDITY:
        return 'text-blue-400'
      case SensorType.CO2:
        return 'text-yellow-400'
      case SensorType.SPECTROMETER:
        return 'text-purple-400'
      case SensorType.THERMAL_CAMERA:
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  // Render sensor value
  const renderSensorValue = (sensor: SensorDevice, reading?: SensorReading) => {
    if (!reading) return <span className="text-gray-500">No data</span>

    switch (sensor.type) {
      case SensorType.WEIGHT:
        const weightReading = reading as WeightReading
        return (
          <div>
            <div className="text-2xl font-bold">
              {weightReading.value.toFixed(2)} {weightReading.unit}
            </div>
            <div className="text-xs text-gray-400">
              {weightReading.stability === 'stable' ? '✓ Stable' : '~ Unstable'}
            </div>
          </div>
        )

      case SensorType.CO2:
        const co2Reading = reading as CO2Reading
        return (
          <div>
            <div className="text-2xl font-bold">{co2Reading.value} ppm</div>
            {co2Reading.temperature && (
              <div className="text-xs text-gray-400">
                {co2Reading.temperature.toFixed(1)}°C
              </div>
            )}
          </div>
        )

      case SensorType.TEMPERATURE_HUMIDITY:
        const thReading = reading as TempHumidityReading
        return (
          <div>
            <div className="text-xl font-bold">
              {thReading.value.temperature}°C / {thReading.value.humidity}%
            </div>
            <div className="text-xs text-gray-400">
              VPD: {thReading.value.vpd?.toFixed(2)} kPa
            </div>
          </div>
        )

      case SensorType.SPECTROMETER:
        const specReading = reading as SpectralReading
        return (
          <div>
            <div className="text-xl font-bold">
              {specReading.value.ppfd} µmol/m²/s
            </div>
            <div className="text-xs text-gray-400">
              CCT: {specReading.value.cct}K
            </div>
          </div>
        )

      case SensorType.THERMAL_CAMERA:
        const thermalReading = reading as ThermalReading
        return (
          <div>
            <div className="text-lg font-bold">
              {thermalReading.value.average.toFixed(1)}°C avg
            </div>
            <div className="text-xs text-gray-400">
              {thermalReading.value.min.toFixed(1)} - {thermalReading.value.max.toFixed(1)}°C
            </div>
          </div>
        )

      default:
        return <div className="text-lg">{JSON.stringify(reading.value)}</div>
    }
  }

  // Get selected sensor details
  const selectedSensorData = selectedSensor 
    ? sensors.find(s => s.id === selectedSensor)
    : null
  const selectedReadings = selectedSensor 
    ? sensorReadings.get(selectedSensor) || []
    : []

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Sensor Dashboard
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          <button
            onClick={() => setShowAddSensor(true)}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sensor
          </button>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sensors.map(sensor => {
          const lastReading = sensorReadings.get(sensor.id)?.[sensorReadings.get(sensor.id)!.length - 1]
          
          return (
            <div
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-600 ${
                selectedSensor === sensor.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={getSensorColor(sensor.type)}>
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{sensor.name}</h4>
                    <p className="text-xs text-gray-400">{sensor.model}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSensorConnection(sensor)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    sensor.status === 'connected'
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                  }`}
                >
                  {sensor.status === 'connected' ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <WifiOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="text-center py-2">
                {sensor.status === 'connected' ? (
                  renderSensorValue(sensor, lastReading)
                ) : (
                  <span className="text-gray-500">Disconnected</span>
                )}
              </div>

              {lastReading && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Last update</span>
                    <span>{new Date(lastReading.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">Quality</span>
                    <span className={`font-medium ${
                      lastReading.quality === 'good' ? 'text-green-400' :
                      lastReading.quality === 'warning' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {lastReading.quality}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Sensor Details */}
      {selectedSensorData && (
        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium flex items-center gap-2">
              {getSensorIcon(selectedSensorData.type)}
              {selectedSensorData.name}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              >
                {showRawData ? 'Hide' : 'Show'} Raw Data
              </button>
              <button
                onClick={() => {
                  // Export sensor data
                  const data = sensorService.getReadings(selectedSensorData.id)
                  const json = JSON.stringify(data, null, 2)
                  const blob = new Blob([json], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${selectedSensorData.id}-data.json`
                  a.click()
                }}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>

          {/* Sensor Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-400">Interface</span>
              <p className="font-medium uppercase">{selectedSensorData.interface}</p>
            </div>
            <div>
              <span className="text-gray-400">Address</span>
              <p className="font-medium">{selectedSensorData.address || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400">Status</span>
              <p className={`font-medium ${
                selectedSensorData.status === 'connected' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {selectedSensorData.status}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Readings</span>
              <p className="font-medium">{selectedReadings.length}</p>
            </div>
          </div>

          {/* Reading History Chart */}
          {selectedReadings.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Reading History</h5>
              
              {/* Simple line chart visualization */}
              <div className="h-32 relative">
                {selectedSensorData.type === SensorType.WEIGHT && (
                  <WeightChart readings={selectedReadings as WeightReading[]} />
                )}
                {selectedSensorData.type === SensorType.CO2 && (
                  <CO2Chart readings={selectedReadings as CO2Reading[]} />
                )}
                {selectedSensorData.type === SensorType.TEMPERATURE_HUMIDITY && (
                  <TempHumidityChart readings={selectedReadings as TempHumidityReading[]} />
                )}
                {selectedSensorData.type === SensorType.SPECTROMETER && (
                  <SpectrumChart readings={selectedReadings as SpectralReading[]} />
                )}
              </div>

              {/* Statistics */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                {(() => {
                  const stats = sensorService.getStatistics(
                    selectedSensorData.id,
                    new Date(Date.now() - 3600000), // Last hour
                    new Date()
                  )
                  if (!stats) return null

                  return (
                    <>
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400">Average</div>
                        <div className="font-medium">{stats.average.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400">Min</div>
                        <div className="font-medium">{stats.min.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400">Max</div>
                        <div className="font-medium">{stats.max.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400">Std Dev</div>
                        <div className="font-medium">{stats.stdDev.toFixed(2)}</div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Raw Data */}
          {showRawData && selectedReadings.length > 0 && (
            <div className="mt-4 bg-gray-900 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Raw Data (Last 5)</h5>
              <pre className="text-xs text-gray-400 overflow-auto max-h-40">
                {JSON.stringify(selectedReadings.slice(-5), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Sensor Configuration Tips */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <h4 className="font-medium text-blue-400 mb-1">Sensor Integration</h4>
            <p className="mb-2">
              This dashboard supports direct integration with Raspberry Pi and other platforms:
            </p>
            <ul className="space-y-1 text-xs">
              <li>• HX711 weight sensors via GPIO pins</li>
              <li>• EE870 CO₂ sensors via Modbus RTU/TCP</li>
              <li>• ENS210 temp/RH via I²C interface</li>
              <li>• AMS Moonlight spectrum sensors</li>
              <li>• FLIR thermal cameras via SDK</li>
              <li>• IP cameras via RTSP/ONVIF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple chart components
function WeightChart({ readings }: { readings: WeightReading[] }) {
  const values = readings.map(r => r.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <svg className="w-full h-full">
      <polyline
        fill="none"
        stroke="rgb(34 197 94)"
        strokeWidth="2"
        points={readings.map((r, i) => {
          const x = (i / (readings.length - 1)) * 100
          const y = 100 - ((r.value - min) / range) * 100
          return `${x},${y}`
        }).join(' ')}
      />
    </svg>
  )
}

function CO2Chart({ readings }: { readings: CO2Reading[] }) {
  const values = readings.map(r => r.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <svg className="w-full h-full">
      <polyline
        fill="none"
        stroke="rgb(250 204 21)"
        strokeWidth="2"
        points={readings.map((r, i) => {
          const x = (i / (readings.length - 1)) * 100
          const y = 100 - ((r.value - min) / range) * 100
          return `${x},${y}`
        }).join(' ')}
      />
    </svg>
  )
}

function TempHumidityChart({ readings }: { readings: TempHumidityReading[] }) {
  const temps = readings.map(r => r.value.temperature)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp || 1

  return (
    <svg className="w-full h-full">
      <polyline
        fill="none"
        stroke="rgb(59 130 246)"
        strokeWidth="2"
        points={readings.map((r, i) => {
          const x = (i / (readings.length - 1)) * 100
          const y = 100 - ((r.value.temperature - minTemp) / tempRange) * 100
          return `${x},${y}`
        }).join(' ')}
      />
    </svg>
  )
}

function SpectrumChart({ readings }: { readings: SpectralReading[] }) {
  const values = readings.map(r => r.value.ppfd || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <svg className="w-full h-full">
      <polyline
        fill="none"
        stroke="rgb(168 85 247)"
        strokeWidth="2"
        points={readings.map((r, i) => {
          const x = (i / (readings.length - 1)) * 100
          const y = 100 - ((r.value.ppfd || 0 - min) / range) * 100
          return `${x},${y}`
        }).join(' ')}
      />
    </svg>
  )
}