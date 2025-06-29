"use client"

import { useState, useEffect, useMemo } from 'react'
import { Wifi, TrendingUp, AlertCircle, BarChart3, Activity, AlertTriangle, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { useRoomMetrics } from '@/hooks/useRealtimeData'

interface SensorMetrics {
  averagePPFD: number
  validationScore: number
  lastReading: string
  trend: 'increasing' | 'decreasing' | 'stable'
  activePoints: number
}

interface SensorDashboardWidgetProps {
  projectId?: string
  roomId?: string
}

export function SensorDashboardWidget({ projectId = 'demo', roomId = 'room_1' }: SensorDashboardWidgetProps = {}) {
  // Memoize the IDs to prevent unnecessary re-renders
  const stableProjectId = useMemo(() => projectId, [projectId]);
  const stableRoomId = useMemo(() => roomId, [roomId]);
  
  const { connected, aggregates, metrics: roomMetrics, latestReadings } = useRoomMetrics(
    stableProjectId, 
    stableRoomId
  )
  
  const [metrics, setMetrics] = useState<SensorMetrics>({
    averagePPFD: 625,
    validationScore: 97.8,
    lastReading: '2 hours ago',
    trend: 'stable',
    activePoints: 24
  })
  
  // Update metrics based on real-time data
  useEffect(() => {
    if (aggregates && latestReadings.length > 0) {
      const lastReading = latestReadings[latestReadings.length - 1]
      const timeAgo = getTimeAgo(lastReading.timestamp)
      
      setMetrics(prev => ({
        ...prev,
        averagePPFD: aggregates.ppfd?.avg || prev.averagePPFD,
        lastReading: timeAgo,
        activePoints: Object.keys(aggregates).length,
        trend: roomMetrics.temperatureTrend
      }))
    }
  }, [aggregates, latestReadings, roomMetrics])
  
  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wifi className={`w-5 h-5 ${connected ? 'text-green-400' : 'text-gray-400'}`} />
          Sensor Integration
          {connected && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              LIVE
            </span>
          )}
        </h3>
        <Link 
          href="/sensors"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Validation Score */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-600/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Design Accuracy</p>
            <p className="text-2xl font-bold text-white">{metrics.validationScore}%</p>
          </div>
          <div className="text-3xl font-bold text-green-400">A+</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Avg PPFD</span>
            {metrics.trend === 'rising' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {metrics.trend === 'falling' && <TrendingDown className="w-3 h-3 text-red-400" />}
            {metrics.trend === 'stable' && <Activity className="w-3 h-3 text-blue-400" />}
          </div>
          <p className="text-lg font-semibold text-white">
            {Math.round(metrics.averagePPFD)} μmol
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Active Sensors</p>
          <p className="text-lg font-semibold text-white">{metrics.activePoints}</p>
        </div>
      </div>
      
      {/* Real-time Environmental Data */}
      {aggregates && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {aggregates.temperature && (
            <div className="bg-gray-800/30 rounded-lg p-2">
              <p className="text-xs text-gray-400">Temp</p>
              <p className="text-sm font-semibold text-white">
                {aggregates.temperature.current.toFixed(1)}°F
              </p>
            </div>
          )}
          {aggregates.humidity && (
            <div className="bg-gray-800/30 rounded-lg p-2">
              <p className="text-xs text-gray-400">RH</p>
              <p className="text-sm font-semibold text-white">
                {aggregates.humidity.current.toFixed(0)}%
              </p>
            </div>
          )}
          {roomMetrics.vpd > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-2">
              <p className="text-xs text-gray-400">VPD</p>
              <p className="text-sm font-semibold text-white">
                {roomMetrics.vpd} kPa
              </p>
            </div>
          )}
        </div>
      )}

      {/* Last Reading & Connection Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Last reading</span>
        <span className={`${connected ? 'text-green-400' : 'text-gray-300'}`}>
          {metrics.lastReading}
        </span>
      </div>

      {/* Virtual Sensor Advantage */}
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <p className="text-xs text-purple-300">
          💡 Virtual sensors save $35k+ vs hardware grids
        </p>
      </div>
    </div>
  )
}