"use client"

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Sun, 
  Wind,
  Gauge,
  Settings,
  AlertCircle,
  CheckCircle,
  Wifi,
  Layers,
  Move,
  Target,
  TrendingUp,
  Clock,
  Zap,
  RefreshCw,
  Camera,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface SystemStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'warning'
  icon: any
  metrics: {
    label: string
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'stable'
  }[]
}

interface Zone {
  id: string
  name: string
  type: 'propagation' | 'vegetative' | 'flowering' | 'drying'
  climate: {
    temperature: number
    humidity: number
    co2: number
    vpd: number
  }
  lighting: {
    intensity: number
    spectrum: string
    photoperiod: string
  }
  irrigation: {
    frequency: string
    volume: number
    ec: number
    ph: number
  }
  plantCount: number
  daysInZone: number
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  status: 'active' | 'paused'
  lastTriggered?: string
}

export function UnifiedControlCenter() {
  const [selectedZone, setSelectedZone] = useState<string>('zone-1')
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // System statuses
  const systems: SystemStatus[] = [
    {
      id: 'climate',
      name: 'Climate Control',
      status: 'online',
      icon: Thermometer,
      metrics: [
        { label: 'Avg Temp', value: 24.5, unit: '°C', trend: 'stable' },
        { label: 'Avg RH', value: 65, unit: '%', trend: 'up' },
        { label: 'Avg CO₂', value: 1200, unit: 'ppm', trend: 'stable' }
      ]
    },
    {
      id: 'lighting',
      name: 'Lighting System',
      status: 'online',
      icon: Sun,
      metrics: [
        { label: 'Active Fixtures', value: 156, unit: '', trend: 'stable' },
        { label: 'Avg PPFD', value: 650, unit: 'μmol', trend: 'stable' },
        { label: 'Energy Usage', value: 45.2, unit: 'kW', trend: 'down' }
      ]
    },
    {
      id: 'irrigation',
      name: 'Irrigation Control',
      status: 'warning',
      icon: Droplets,
      metrics: [
        { label: 'Flow Rate', value: 12.5, unit: 'L/min', trend: 'stable' },
        { label: 'Tank Level', value: 75, unit: '%', trend: 'down' },
        { label: 'Next Cycle', value: '14:30', unit: '', trend: 'stable' }
      ]
    },
    {
      id: 'logistics',
      name: 'Logistics System',
      status: 'online',
      icon: Move,
      metrics: [
        { label: 'Movements Today', value: 24, unit: '', trend: 'up' },
        { label: 'Queue', value: 3, unit: 'pending', trend: 'stable' },
        { label: 'Efficiency', value: 94, unit: '%', trend: 'up' }
      ]
    },
    {
      id: 'health',
      name: 'Plant Health Imaging',
      status: 'online',
      icon: Camera,
      metrics: [
        { label: 'Health Score', value: 92, unit: '%', trend: 'stable' },
        { label: 'Issues Detected', value: 3, unit: '', trend: 'down' },
        { label: 'Last Scan', value: '5 min', unit: 'ago', trend: 'stable' }
      ]
    },
    {
      id: 'ipm',
      name: 'IPM System',
      status: 'online',
      icon: Shield,
      metrics: [
        { label: 'Active Threats', value: 2, unit: '', trend: 'down' },
        { label: 'Beneficials', value: '9.2k', unit: '', trend: 'up' },
        { label: 'Control Rate', value: 88, unit: '%', trend: 'stable' }
      ]
    }
  ]

  // Zone configurations
  const zones: Zone[] = [
    {
      id: 'zone-1',
      name: 'Propagation Zone',
      type: 'propagation',
      climate: { temperature: 25, humidity: 70, co2: 800, vpd: 0.8 },
      lighting: { intensity: 200, spectrum: 'Full', photoperiod: '18/6' },
      irrigation: { frequency: '4x daily', volume: 50, ec: 0.8, ph: 5.8 },
      plantCount: 1200,
      daysInZone: 7
    },
    {
      id: 'zone-2',
      name: 'Vegetative Zone',
      type: 'vegetative',
      climate: { temperature: 24, humidity: 65, co2: 1200, vpd: 1.0 },
      lighting: { intensity: 400, spectrum: 'Blue Enhanced', photoperiod: '18/6' },
      irrigation: { frequency: '3x daily', volume: 150, ec: 1.5, ph: 6.0 },
      plantCount: 800,
      daysInZone: 21
    },
    {
      id: 'zone-3',
      name: 'Flowering Zone',
      type: 'flowering',
      climate: { temperature: 22, humidity: 55, co2: 1000, vpd: 1.2 },
      lighting: { intensity: 650, spectrum: 'Red Enhanced', photoperiod: '12/12' },
      irrigation: { frequency: '2x daily', volume: 300, ec: 2.0, ph: 6.2 },
      plantCount: 600,
      daysInZone: 56
    }
  ]

  // Automation rules
  const automationRules: AutomationRule[] = [
    {
      id: 'rule-1',
      name: 'Zone Transition',
      trigger: 'Day 7 in Propagation',
      action: 'Move to Vegetative Zone',
      status: 'active',
      lastTriggered: '2 hours ago'
    },
    {
      id: 'rule-2',
      name: 'Climate Adjustment',
      trigger: 'VPD > 1.4',
      action: 'Increase humidity by 5%',
      status: 'active',
      lastTriggered: '45 min ago'
    },
    {
      id: 'rule-3',
      name: 'Emergency Irrigation',
      trigger: 'Substrate WC < 30%',
      action: 'Trigger irrigation cycle',
      status: 'active',
      lastTriggered: '3 days ago'
    },
    {
      id: 'rule-4',
      name: 'Harvest Alert',
      trigger: 'Day 56 in Flowering',
      action: 'Notify harvest team',
      status: 'active',
      lastTriggered: 'Yesterday'
    },
    {
      id: 'rule-5',
      name: 'Health Check',
      trigger: 'Health Score < 85%',
      action: 'Trigger visual inspection',
      status: 'active',
      lastTriggered: '5 hours ago'
    },
    {
      id: 'rule-6',
      name: 'IPM Response',
      trigger: 'Pest population > threshold',
      action: 'Release beneficial insects',
      status: 'active',
      lastTriggered: '2 days ago'
    }
  ]

  const selectedZoneData = zones.find(z => z.id === selectedZone) || zones[0]

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Unified Control Center</h1>
            <p className="text-sm text-gray-400 mt-1">
              Complete facility automation and monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setLastUpdate(new Date())}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
            <Link
              href="/settings"
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {systems.map((system) => {
            const Icon = system.icon
            return (
              <div
                key={system.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      system.status === 'online' ? 'bg-green-500/20' : 
                      system.status === 'warning' ? 'bg-yellow-500/20' : 
                      'bg-red-500/20'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        system.status === 'online' ? 'text-green-400' : 
                        system.status === 'warning' ? 'text-yellow-400' : 
                        'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{system.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{system.status}</p>
                    </div>
                  </div>
                  {system.status === 'online' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : system.status === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="space-y-2">
                  {system.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {metric.value}{metric.unit}
                        </span>
                        {metric.trend && (
                          <TrendingUp className={`w-3 h-3 ${
                            metric.trend === 'up' ? 'text-green-400 rotate-0' :
                            metric.trend === 'down' ? 'text-red-400 rotate-180' :
                            'text-gray-400 rotate-90'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Control Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Zone Selector */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Zone Management</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedZone === zone.id
                        ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/20'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <h3 className="font-medium text-white mb-1">{zone.name}</h3>
                    <p className="text-sm text-gray-400">{zone.plantCount} plants</p>
                    <p className="text-xs text-gray-500 mt-1">Day {zone.daysInZone}</p>
                  </button>
                ))}
              </div>

              {/* Zone Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Climate */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Climate</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature</span>
                      <span className="text-white">{selectedZoneData.climate.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Humidity</span>
                      <span className="text-white">{selectedZoneData.climate.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CO₂</span>
                      <span className="text-white">{selectedZoneData.climate.co2} ppm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VPD</span>
                      <span className="text-white">{selectedZoneData.climate.vpd} kPa</span>
                    </div>
                  </div>
                </div>

                {/* Lighting */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-medium text-white">Lighting</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Intensity</span>
                      <span className="text-white">{selectedZoneData.lighting.intensity} μmol</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Spectrum</span>
                      <span className="text-white">{selectedZoneData.lighting.spectrum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Photoperiod</span>
                      <span className="text-white">{selectedZoneData.lighting.photoperiod}</span>
                    </div>
                  </div>
                </div>

                {/* Irrigation */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-4 h-4 text-green-400" />
                    <h4 className="font-medium text-white">Irrigation</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frequency</span>
                      <span className="text-white">{selectedZoneData.irrigation.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume</span>
                      <span className="text-white">{selectedZoneData.irrigation.volume} mL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">EC</span>
                      <span className="text-white">{selectedZoneData.irrigation.ec} mS/cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">pH</span>
                      <span className="text-white">{selectedZoneData.irrigation.ph}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Adjust Settings
                </button>
                <button className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  View History
                </button>
                <button className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  Export Data
                </button>
              </div>
            </div>

            {/* Production Flow */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Production Flow</h2>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  {zones.map((zone, idx) => (
                    <div key={zone.id} className="flex-1 relative">
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                          zone.type === 'propagation' ? 'bg-blue-500/20 text-blue-400' :
                          zone.type === 'vegetative' ? 'bg-green-500/20 text-green-400' :
                          zone.type === 'flowering' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          <Layers className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-white mt-2">{zone.name}</p>
                        <p className="text-xs text-gray-400">{zone.plantCount} plants</p>
                      </div>
                      {idx < zones.length - 1 && (
                        <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-700">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-700 rotate-45" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Daily Harvest Target</p>
                      <p className="text-2xl font-bold text-white">24.5 kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Current Output</p>
                      <p className="text-2xl font-bold text-green-400">26.2 kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Efficiency</p>
                      <p className="text-2xl font-bold text-white">107%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Automation</h2>
                <button
                  onClick={() => setAutomationEnabled(!automationEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    automationEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    automationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-3">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-lg border ${
                      rule.status === 'active' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-800/50 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{rule.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rule.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Trigger: {rule.trigger}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Action: {rule.action}</span>
                      </div>
                      {rule.lastTriggered && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500">Last: {rule.lastTriggered}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">
                Manage Rules
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Energy Usage</span>
                  <span className="text-sm font-medium text-white">892 kWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Water Usage</span>
                  <span className="text-sm font-medium text-white">3,240 L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Movements</span>
                  <span className="text-sm font-medium text-white">24 transfers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Alerts</span>
                  <span className="text-sm font-medium text-yellow-400">2 warnings</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">System Uptime</span>
                  <span className="text-sm font-medium text-green-400">99.98%</span>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Sensor Network</span>
                  </div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">PLC System</span>
                  </div>
                  <span className="text-xs text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">SCADA</span>
                  </div>
                  <span className="text-xs text-yellow-400">Syncing</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">HVAC</span>
                  </div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}