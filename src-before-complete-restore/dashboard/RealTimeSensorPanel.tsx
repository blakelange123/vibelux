/**
 * Real-time Sensor Data Panel
 * Displays live environmental sensor readings with WebSocket integration
 */

'use client'

import React from 'react'
import { useSensorData } from '@/hooks/useSensorData'
import { WebSocketStatusBadge } from '@/components/common/WebSocketStatus'
import { ThermometerIcon, WaterIcon, CloudIcon, SunIcon } from 'lucide-react'

interface SensorCardProps {
  type: string
  value: number | null
  unit: string
  icon: React.ReactNode
  label: string
  trend?: 'up' | 'down' | 'stable'
  alert?: boolean
}

function SensorCard({ type, value, unit, icon, label, trend, alert }: SensorCardProps) {
  const formatValue = (val: number | null) => {
    if (val === null) return '--'
    return val.toFixed(1)
  }

  const getTrendColor = () => {
    if (alert) return 'text-red-500'
    switch (trend) {
      case 'up': return 'text-green-500'
      case 'down': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
      alert ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${alert ? 'text-red-500' : 'text-blue-500'}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </div>
        {trend && (
          <div className={`text-xs ${getTrendColor()}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline space-x-1">
        <span className={`text-2xl font-bold ${
          alert ? 'text-red-600' : 'text-gray-900 dark:text-white'
        }`}>
          {formatValue(value)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {unit}
        </span>
      </div>

      {alert && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          ⚠ Out of range
        </div>
      )}
    </div>
  )
}

interface RealTimeSensorPanelProps {
  className?: string
  showHistory?: boolean
}

export function RealTimeSensorPanel({ 
  className = '', 
  showHistory = false 
}: RealTimeSensorPanelProps) {
  const { 
    latest, 
    isLoading, 
    error, 
    lastUpdate,
    getAverageValue,
    getReadingsByType 
  } = useSensorData()

  const getAlertStatus = (type: string, value: number) => {
    switch (type) {
      case 'temperature':
        return value > 85 || value < 65
      case 'humidity':
        return value > 70 || value < 40
      case 'co2':
        return value < 400 || value > 1000
      default:
        return false
    }
  }

  const getTrend = (type: string) => {
    const recent = getReadingsByType(type).slice(-3)
    if (recent.length < 2) return 'stable'
    
    const current = recent[recent.length - 1]?.value || 0
    const previous = recent[recent.length - 2]?.value || 0
    
    if (current > previous * 1.02) return 'up'
    if (current < previous * 0.98) return 'down'
    return 'stable'
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="text-red-600 dark:text-red-400">
          Failed to load sensor data: {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Environmental Sensors
          </h3>
          <WebSocketStatusBadge />
        </div>
        
        {lastUpdate && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Sensor cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorCard
            type="temperature"
            value={latest.temperature?.value || null}
            unit="°F"
            icon={<ThermometerIcon size={16} />}
            label="Temperature"
            trend={getTrend('temperature')}
            alert={latest.temperature && getAlertStatus('temperature', latest.temperature.value)}
          />
          
          <SensorCard
            type="humidity"
            value={latest.humidity?.value || null}
            unit="%"
            icon={<WaterIcon size={16} />}
            label="Humidity"
            trend={getTrend('humidity')}
            alert={latest.humidity && getAlertStatus('humidity', latest.humidity.value)}
          />
          
          <SensorCard
            type="co2"
            value={latest.co2?.value || null}
            unit="ppm"
            icon={<CloudIcon size={16} />}
            label="CO₂"
            trend={getTrend('co2')}
            alert={latest.co2 && getAlertStatus('co2', latest.co2.value)}
          />
          
          <SensorCard
            type="light"
            value={latest.light?.value || null}
            unit="lux"
            icon={<SunIcon size={16} />}
            label="Light Level"
            trend={getTrend('light')}
          />
        </div>
      )}

      {/* Historical averages */}
      {showHistory && !isLoading && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            24-Hour Averages
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
              <span className="ml-1 font-medium">
                {getAverageValue('temperature', 24 * 60 * 60 * 1000)?.toFixed(1) || '--'}°F
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Humidity:</span>
              <span className="ml-1 font-medium">
                {getAverageValue('humidity', 24 * 60 * 60 * 1000)?.toFixed(1) || '--'}%
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">CO₂:</span>
              <span className="ml-1 font-medium">
                {getAverageValue('co2', 24 * 60 * 60 * 1000)?.toFixed(0) || '--'} ppm
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Light:</span>
              <span className="ml-1 font-medium">
                {getAverageValue('light', 24 * 60 * 60 * 1000)?.toFixed(0) || '--'} lux
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}