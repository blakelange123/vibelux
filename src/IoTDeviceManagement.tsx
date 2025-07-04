"use client"
import { useState, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ThermometerSun,
  Droplets,
  Wind,
  Eye,
  Power,
  RefreshCw,
  Download,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { saveToLocalStorage, loadFromLocalStorage, STORAGE_KEYS, IoTSettings, defaultIoTSettings } from '@/lib/localStorage'

interface IoTDevice {
  id: string
  name: string
  type: 'sensor' | 'controller' | 'light' | 'hvac' | 'irrigation'
  status: 'online' | 'offline' | 'warning' | 'error'
  location: string
  lastSeen: Date
  metrics: {
    name: string
    value: number | string
    unit: string
    status?: 'normal' | 'warning' | 'critical'
  }[]
  firmware: string
  battery?: number
  signalStrength?: number
  ipAddress?: string
  macAddress?: string
  connectionType?: string
}

export function IoTDeviceManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: 'iot-001',
      name: 'Environmental Sensor A1',
      type: 'sensor',
      status: 'online',
      location: 'Greenhouse Zone 1',
      lastSeen: new Date(),
      metrics: [
        { name: 'Temperature', value: 24.5, unit: '°C', status: 'normal' },
        { name: 'Humidity', value: 65, unit: '%', status: 'normal' },
        { name: 'CO2', value: 850, unit: 'ppm', status: 'warning' },
        { name: 'Light', value: 680, unit: 'μmol/m²/s', status: 'normal' }
      ],
      firmware: 'v2.3.1',
      battery: 85,
      signalStrength: -45
    },
    {
      id: 'iot-002',
      name: 'LED Controller Zone 1',
      type: 'controller',
      status: 'online',
      location: 'Greenhouse Zone 1',
      lastSeen: new Date(),
      metrics: [
        { name: 'Power Usage', value: 450, unit: 'W', status: 'normal' },
        { name: 'Schedule', value: 'Active', unit: '', status: 'normal' },
        { name: 'Dimming', value: 75, unit: '%', status: 'normal' }
      ],
      firmware: 'v3.1.0',
      signalStrength: -52
    },
    {
      id: 'iot-003',
      name: 'HVAC Controller',
      type: 'hvac',
      status: 'warning',
      location: 'Main Facility',
      lastSeen: new Date(Date.now() - 300000),
      metrics: [
        { name: 'Set Temp', value: 22, unit: '°C', status: 'normal' },
        { name: 'Actual Temp', value: 25, unit: '°C', status: 'warning' },
        { name: 'Fan Speed', value: 60, unit: '%', status: 'normal' }
      ],
      firmware: 'v1.8.5',
      signalStrength: -68
    }
  ])
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [settings, setSettings] = useState<IoTSettings>(defaultIoTSettings)

  // Simulate loading data
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Load settings from localStorage
        const savedSettings = loadFromLocalStorage<IoTSettings>(STORAGE_KEYS.IOT_DEVICES, defaultIoTSettings)
        setSettings(savedSettings)
        
        setIsLoading(false)
      } catch (err) {
        setError('Failed to load devices. Please try again.')
        setIsLoading(false)
      }
    }
    
    loadDevices()
  }, [])

  // Real-time updates simulation
  useEffect(() => {
    if (!settings.autoRefresh || isLoading) return

    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => ({
          ...device,
          lastSeen: new Date(),
          metrics: device.metrics.map(metric => {
            // Simulate value changes
            if (typeof metric.value === 'number') {
              const variation = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2 // ±1
              let newValue = metric.value + variation
              
              // Keep values in reasonable ranges
              if (metric.name === 'Temperature') newValue = Math.max(15, Math.min(35, newValue))
              if (metric.name === 'Humidity') newValue = Math.max(30, Math.min(90, newValue))
              if (metric.name === 'CO2') newValue = Math.max(400, Math.min(1200, newValue))
              if (metric.name === 'Light') newValue = Math.max(0, Math.min(1000, newValue))
              
              return { ...metric, value: Math.round(newValue * 10) / 10 }
            }
            return metric
          })
        }))
      )
    }, settings.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [settings.autoRefresh, settings.refreshInterval, isLoading])

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-400/10'
      case 'offline': return 'text-gray-400 bg-gray-400/10'
      case 'warning': return 'text-yellow-400 bg-yellow-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
    }
  }

  const getDeviceIcon = (type: IoTDevice['type']) => {
    switch (type) {
      case 'sensor': return ThermometerSun
      case 'controller': return Settings
      case 'light': return Zap
      case 'hvac': return Wind
      case 'irrigation': return Droplets
    }
  }

  const filteredDevices = devices.filter(device => {
    const matchesFilter = filter === 'all' || device.status === filter
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const deviceStats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    warnings: devices.filter(d => d.status === 'warning' || d.status === 'error').length
  }

  const refreshDevice = (deviceId: string) => {
    // Simulate device refresh
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, lastSeen: new Date() } : d
    ))
  }

  const toggleDevicePower = (deviceId: string) => {
    setDevices(devices.map(d => 
      d.id === deviceId 
        ? { ...d, status: d.status === 'online' ? 'offline' : 'online' }
        : d
    ))
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <LoadingSpinner size="lg" text="Loading devices..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError(null)
            window.location.reload()
          }} 
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">IoT Device Management</h1>
          <p className="text-gray-400">Monitor and control your connected devices</p>
        </div>
        <button
          onClick={() => setShowAddDevice(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Devices</span>
            <Wifi className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">{deviceStats.total}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Online</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-green-400">{deviceStats.online}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Offline</span>
            <XCircle className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-400">{deviceStats.offline}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-semibold text-yellow-400">{deviceStats.warnings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Add Device Modal - Moved to top of device grid */}
      {showAddDevice && (
        <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-100">Setup New Hardware</h2>
            <button
              onClick={() => setShowAddDevice(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newDevice: IoTDevice = {
              id: `iot-${Date.now()}`,
              name: formData.get('name') as string,
              type: formData.get('type') as IoTDevice['type'],
              status: 'offline',
              location: formData.get('location') as string,
              lastSeen: new Date(),
              metrics: [],
              firmware: 'v1.0.0',
              signalStrength: -70,
              ipAddress: formData.get('ipAddress') as string,
              macAddress: formData.get('macAddress') as string,
              connectionType: formData.get('connectionType') as string
            }
            setDevices([...devices, newDevice])
            setShowAddDevice(false)
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                  placeholder="Enter device name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Device Type
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                >
                  <option value="">Select type</option>
                  <option value="sensor">Environmental Sensor</option>
                  <option value="controller">Controller</option>
                  <option value="light">Lighting</option>
                  <option value="hvac">HVAC</option>
                  <option value="irrigation">Irrigation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                  placeholder="e.g., Greenhouse Zone 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Connection Type
                </label>
                <select
                  name="connectionType"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                >
                  <option value="wifi">WiFi</option>
                  <option value="ethernet">Ethernet</option>
                  <option value="zigbee">Zigbee</option>
                  <option value="lora">LoRa</option>
                  <option value="modbus">Modbus</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  name="ipAddress"
                  pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100 font-mono"
                  placeholder="192.168.1.100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  MAC Address
                </label>
                <input
                  type="text"
                  name="macAddress"
                  pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100 font-mono uppercase"
                  placeholder="00:1B:44:11:3A:B7"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddDevice(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
              >
                Add Device
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Device Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDevices.map(device => {
          const Icon = getDeviceIcon(device.type)
          return (
            <div 
              key={device.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-100">{device.name}</h3>
                    <p className="text-sm text-gray-400">{device.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      // More options menu
                    }}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {device.metrics.slice(0, 4).map((metric, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-2">
                    <p className="text-xs text-gray-400">{metric.name}</p>
                    <p className={`text-sm font-medium ${
                      metric.status === 'warning' ? 'text-yellow-400' :
                      metric.status === 'critical' ? 'text-red-400' : 'text-gray-100'
                    }`}>
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  {device.battery !== undefined && (
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {device.battery}%
                    </span>
                  )}
                  {device.signalStrength !== undefined && (
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      {device.signalStrength}dBm
                    </span>
                  )}
                </div>
                <span>Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    refreshDevice(device.id)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Refresh</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDevicePower(device.id)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded transition-colors ${
                    device.status === 'online' 
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                      : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span className="text-sm">{device.status === 'online' ? 'Turn Off' : 'Turn On'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>


      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-100">{selectedDevice.name}</h2>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Device Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-gray-100 capitalize">{selectedDevice.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-gray-100">{selectedDevice.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Firmware</p>
                  <p className="text-gray-100">{selectedDevice.firmware}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Device ID</p>
                  <p className="text-gray-100 font-mono text-sm">{selectedDevice.id}</p>
                </div>
              </div>

              {/* Network Configuration */}
              <h3 className="font-medium text-gray-100 mb-3">Network Configuration</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Connection Type</p>
                  <p className="text-gray-100 capitalize">{selectedDevice.connectionType || 'Not configured'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">IP Address</p>
                  <p className="text-gray-100 font-mono">{selectedDevice.ipAddress || 'DHCP'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">MAC Address</p>
                  <p className="text-gray-100 font-mono text-sm uppercase">{selectedDevice.macAddress || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Signal Strength</p>
                  <p className="text-gray-100">{selectedDevice.signalStrength ? `${selectedDevice.signalStrength} dBm` : 'N/A'}</p>
                </div>
              </div>

              {/* Real-time Metrics */}
              <h3 className="font-medium text-gray-100 mb-3">Real-time Metrics</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedDevice.metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">{metric.name}</p>
                    <p className={`text-2xl font-semibold ${
                      metric.status === 'warning' ? 'text-yellow-400' :
                      metric.status === 'critical' ? 'text-red-400' : 'text-gray-100'
                    }`}>
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                ))}
              </div>

              {/* Device Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}