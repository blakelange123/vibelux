/**
 * Real-time Sensor Data Hook
 * Manages environmental sensor data streaming via WebSocket
 */

import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

export interface SensorReading {
  sensorId: string
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'pressure'
  value: number
  unit: string
  timestamp: number
  location?: string
  projectId?: string
}

export interface SensorDataState {
  readings: SensorReading[]
  latest: Record<string, SensorReading>
  isLoading: boolean
  error: string | null
  lastUpdate: number | null
}

export interface SensorDataOptions {
  maxReadings?: number
  autoSubscribe?: boolean
  channels?: string[]
}

export function useSensorData(options: SensorDataOptions = {}) {
  const {
    maxReadings = 100,
    autoSubscribe = true,
    channels = ['sensors:environmental']
  } = options

  const [state, setState] = useState<SensorDataState>({
    readings: [],
    latest: {},
    isLoading: true,
    error: null,
    lastUpdate: null
  })

  const { 
    isConnected, 
    subscribe, 
    unsubscribe, 
    addChannelHandler 
  } = useWebSocket({ autoConnect: true })

  const addReading = useCallback((reading: SensorReading) => {
    setState(prev => {
      const newReadings = [...prev.readings, reading]
      
      // Keep only the most recent readings
      if (newReadings.length > maxReadings) {
        newReadings.splice(0, newReadings.length - maxReadings)
      }

      // Update latest readings by sensor type
      const newLatest = {
        ...prev.latest,
        [reading.type]: reading
      }

      return {
        ...prev,
        readings: newReadings,
        latest: newLatest,
        isLoading: false,
        lastUpdate: Date.now()
      }
    })
  }, [maxReadings])

  const handleSensorData = useCallback((data: any) => {
    if (Array.isArray(data)) {
      // Handle batch data (initial load or historical)
      data.forEach(reading => {
        if (reading.type && reading.value !== undefined) {
          addReading({
            sensorId: reading.sensorId || 'unknown',
            type: reading.type,
            value: reading.value,
            unit: reading.unit || getDefaultUnit(reading.type),
            timestamp: reading.timestamp || Date.now(),
            location: reading.location,
            projectId: reading.projectId
          })
        }
      })
    } else if (data.type && data.value !== undefined) {
      // Handle single reading
      addReading({
        sensorId: data.sensorId || 'unknown',
        type: data.type,
        value: data.value,
        unit: data.unit || getDefaultUnit(data.type),
        timestamp: data.timestamp || Date.now(),
        location: data.location,
        projectId: data.projectId
      })
    }
  }, [addReading])

  const handleRecentData = useCallback((data: any) => {
    handleSensorData(data)
  }, [handleSensorData])

  // Subscribe to channels when connected
  useEffect(() => {
    if (isConnected && autoSubscribe) {
      channels.forEach(channel => {
        subscribe(channel)
      })
    }
  }, [isConnected, autoSubscribe, channels, subscribe])

  // Set up message handlers
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = []

    channels.forEach(channel => {
      const cleanup = addChannelHandler(channel, handleSensorData)
      cleanupFunctions.push(cleanup)
    })

    // Handle recent data messages
    const recentDataCleanup = addChannelHandler('recent_data', handleRecentData)
    cleanupFunctions.push(recentDataCleanup)

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [channels, addChannelHandler, handleSensorData, handleRecentData])

  // Utility functions
  const getReadingsByType = useCallback((type: string) => {
    return state.readings.filter(reading => reading.type === type)
  }, [state.readings])

  const getReadingsInRange = useCallback((startTime: number, endTime: number) => {
    return state.readings.filter(
      reading => reading.timestamp >= startTime && reading.timestamp <= endTime
    )
  }, [state.readings])

  const getAverageValue = useCallback((type: string, timeWindow?: number) => {
    let readings = getReadingsByType(type)
    
    if (timeWindow) {
      const cutoffTime = Date.now() - timeWindow
      readings = readings.filter(reading => reading.timestamp >= cutoffTime)
    }
    
    if (readings.length === 0) return null
    
    const sum = readings.reduce((total, reading) => total + reading.value, 0)
    return sum / readings.length
  }, [getReadingsByType])

  const clearReadings = useCallback(() => {
    setState(prev => ({
      ...prev,
      readings: [],
      latest: {},
      lastUpdate: null
    }))
  }, [])

  return {
    // State
    ...state,
    
    // Utilities
    getReadingsByType,
    getReadingsInRange,
    getAverageValue,
    clearReadings,
    
    // Actions
    subscribe: (channel: string) => subscribe(channel),
    unsubscribe: (channel: string) => unsubscribe(channel)
  }
}

function getDefaultUnit(type: string): string {
  switch (type) {
    case 'temperature':
      return '°F'
    case 'humidity':
      return '%'
    case 'co2':
      return 'ppm'
    case 'light':
      return 'lux'
    case 'pressure':
      return 'hPa'
    default:
      return ''
  }
}