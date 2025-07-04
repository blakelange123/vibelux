"use client"

import { useState, useEffect } from 'react'
import { 
  Smartphone, 
  Tablet, 
  Laptop,
  Cloud,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  X,
  Download,
  Upload,
  Activity,
  Clock,
  Shield,
  QrCode,
  Link2,
  Settings,
  Bell,
  Battery,
  Signal
} from 'lucide-react'

interface Device {
  id: string
  name: string
  type: 'phone' | 'tablet' | 'desktop'
  platform: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Web'
  lastSync: Date
  status: 'online' | 'offline' | 'syncing'
  batteryLevel?: number
  signalStrength?: number
  version: string
}

interface SyncItem {
  id: string
  type: 'design' | 'fixture' | 'schedule' | 'settings' | 'sensor_data'
  name: string
  size: number
  lastModified: Date
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
  devices: string[]
}

interface SyncConflict {
  id: string
  itemId: string
  itemName: string
  type: string
  localChange: Date
  remoteChange: Date
  resolution?: 'local' | 'remote' | 'merge'
}

export function MobileAppSync() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'John\'s iPhone',
      type: 'phone',
      platform: 'iOS',
      lastSync: new Date(Date.now() - 1000 * 60 * 5),
      status: 'online',
      batteryLevel: 85,
      signalStrength: 4,
      version: '2.3.1'
    },
    {
      id: '2',
      name: 'Field iPad',
      type: 'tablet',
      platform: 'iOS',
      lastSync: new Date(Date.now() - 1000 * 60 * 30),
      status: 'offline',
      batteryLevel: 45,
      signalStrength: 2,
      version: '2.3.1'
    },
    {
      id: '3',
      name: 'Office Desktop',
      type: 'desktop',
      platform: 'Windows',
      lastSync: new Date(),
      status: 'online',
      version: '2.3.1'
    }
  ])

  const [syncItems, setSyncItems] = useState<SyncItem[]>([
    {
      id: '1',
      type: 'design',
      name: 'Greenhouse A - Main Layout',
      size: 2.5 * 1024 * 1024,
      lastModified: new Date(Date.now() - 1000 * 60 * 10),
      syncStatus: 'synced',
      devices: ['1', '2', '3']
    },
    {
      id: '2',
      type: 'schedule',
      name: 'Summer 2024 Schedule',
      size: 156 * 1024,
      lastModified: new Date(Date.now() - 1000 * 60 * 60),
      syncStatus: 'pending',
      devices: ['1', '3']
    },
    {
      id: '3',
      type: 'sensor_data',
      name: 'Room B Sensor History',
      size: 8.3 * 1024 * 1024,
      lastModified: new Date(Date.now() - 1000 * 60 * 5),
      syncStatus: 'conflict',
      devices: ['1', '2']
    }
  ])

  const [conflicts, setConflicts] = useState<SyncConflict[]>([
    {
      id: '1',
      itemId: '3',
      itemName: 'Room B Sensor History',
      type: 'sensor_data',
      localChange: new Date(Date.now() - 1000 * 60 * 5),
      remoteChange: new Date(Date.now() - 1000 * 60 * 3)
    }
  ])

  const [syncInProgress, setSyncInProgress] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState(15) // minutes
  const [showQRCode, setShowQRCode] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  // Simulate sync progress
  useEffect(() => {
    if (syncInProgress) {
      const timer = setTimeout(() => {
        setSyncInProgress(false)
        // Update sync status
        setSyncItems(prev => prev.map(item => ({
          ...item,
          syncStatus: item.syncStatus === 'pending' ? 'synced' : item.syncStatus
        })))
        // Update device last sync
        setDevices(prev => prev.map(device => ({
          ...device,
          lastSync: device.status === 'online' ? new Date() : device.lastSync
        })))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [syncInProgress])

  const getDeviceIcon = (device: Device) => {
    switch (device.type) {
      case 'phone': return <Smartphone className="w-8 h-8" />
      case 'tablet': return <Tablet className="w-8 h-8" />
      case 'desktop': return <Laptop className="w-8 h-8" />
    }
  }

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': return 'text-green-600'
      case 'offline': return 'text-gray-400'
      case 'syncing': return 'text-blue-600'
    }
  }

  const getSyncStatusIcon = (status: SyncItem['syncStatus']) => {
    switch (status) {
      case 'synced': return <Check className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'conflict': return <X className="w-4 h-4 text-red-600" />
      case 'error': return <X className="w-4 h-4 text-red-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const handleSync = () => {
    setSyncInProgress(true)
  }

  const handleResolveConflict = (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    setConflicts(prev => prev.map(c => 
      c.id === conflictId ? { ...c, resolution } : c
    ))
    // In a real app, this would resolve the conflict
    setTimeout(() => {
      setConflicts(prev => prev.filter(c => c.id !== conflictId))
      setSyncItems(prev => prev.map(item => 
        item.syncStatus === 'conflict' ? { ...item, syncStatus: 'synced' } : item
      ))
    }, 1000)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mobile App Sync</h2>
        </div>
        <div className="flex items-center gap-3">
          {syncInProgress ? (
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Syncing...</span>
            </div>
          ) : (
            <button
              onClick={handleSync}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Now
            </button>
          )}
        </div>
      </div>

      {/* Connected Devices */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Connected Devices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(device => (
            <div
              key={device.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={getStatusColor(device.status)}>
                  {getDeviceIcon(device)}
                </div>
                <div className="flex items-center gap-2">
                  {device.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <h4 className="font-semibold mb-1">{device.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {device.platform} • v{device.version}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Last sync</span>
                  <span>{getTimeAgo(device.lastSync)}</span>
                </div>
                
                {device.batteryLevel !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <Battery className="w-4 h-4 text-gray-600" />
                    <span>{device.batteryLevel}%</span>
                  </div>
                )}
                
                {device.signalStrength !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <Signal className="w-4 h-4 text-gray-600" />
                    <span>{device.signalStrength}/5</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add New Device */}
          <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer transition-colors">
            <Smartphone className="w-8 h-8 mb-2" />
            <span>Add Device</span>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Sync Status</h3>
        
        {/* Sync Conflicts */}
        {conflicts.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">
              Sync Conflicts ({conflicts.length})
            </h4>
            {conflicts.map(conflict => (
              <div key={conflict.id} className="p-3 bg-white dark:bg-gray-800 rounded mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{conflict.itemName}</span>
                  <span className="text-sm text-gray-600">{conflict.type}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Local: {conflict.localChange.toLocaleString()} | 
                  Remote: {conflict.remoteChange.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveConflict(conflict.id, 'local')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Keep Local
                  </button>
                  <button
                    onClick={() => handleResolveConflict(conflict.id, 'remote')}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Keep Remote
                  </button>
                  <button
                    onClick={() => handleResolveConflict(conflict.id, 'merge')}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Merge Both
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sync Items */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Size</th>
                <th className="text-left py-2">Modified</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Devices</th>
              </tr>
            </thead>
            <tbody>
              {syncItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3">
                    <span className="font-medium">{item.name}</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 text-sm">{formatFileSize(item.size)}</td>
                  <td className="py-3 text-sm">{getTimeAgo(item.lastModified)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getSyncStatusIcon(item.syncStatus)}
                      <span className="text-sm capitalize">{item.syncStatus}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {devices.filter(d => item.devices.includes(d.id)).map(device => (
                        <div
                          key={device.id}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
                          title={device.name}
                        >
                          {device.type === 'phone' && <Smartphone className="w-3 h-3" />}
                          {device.type === 'tablet' && <Tablet className="w-3 h-3" />}
                          {device.type === 'desktop' && <Laptop className="w-3 h-3" />}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Sync Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Auto Sync</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically sync changes
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="toggle"
              />
            </label>

            {autoSync && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sync Interval
                </label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={5}>Every 5 minutes</option>
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                </select>
              </div>
            )}

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Wi-Fi Only</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Only sync on Wi-Fi connections
                  </p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Sync Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notify when sync completes
                  </p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Data Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-medium">842 MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">2 GB monthly limit</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Downloads</span>
                <span>523 MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploads</span>
                <span>319 MB</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setShowQRCode(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <QrCode className="w-4 h-4" />
                Link New Device
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              End-to-End Encryption
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All data synced between devices is encrypted using AES-256 encryption.
              Your data remains private and secure during transmission and storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}