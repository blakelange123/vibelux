"use client"

import { useState, useEffect } from 'react'
import { 
  WifiOff, 
  Wifi, 
  Download, 
  Upload,
  HardDrive,
  Cloud,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Database,
  Clock,
  Trash2,
  Settings,
  Shield,
  Activity,
  FolderOpen,
  FileText
} from 'lucide-react'

interface OfflineData {
  id: string
  type: 'design' | 'fixture' | 'calculation' | 'report' | 'settings'
  name: string
  size: number
  lastAccessed: Date
  modifiedOffline: boolean
  syncPending: boolean
}

interface CacheCategory {
  name: string
  icon: React.FC<any>
  size: number
  items: number
  enabled: boolean
}

interface OfflineActivity {
  id: string
  action: string
  timestamp: Date
  synced: boolean
  error?: string
}

export function OfflineMode() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineEnabled, setOfflineEnabled] = useState(true)
  const [autoDownload, setAutoDownload] = useState(true)
  const [cacheSizeLimit, setCacheSizeLimit] = useState(500) // MB
  const [currentCacheSize, setCurrentCacheSize] = useState(234.5) // MB
  
  const [offlineData, setOfflineData] = useState<OfflineData[]>([
    {
      id: '1',
      type: 'design',
      name: 'Greenhouse A Layout',
      size: 2.5 * 1024 * 1024,
      lastAccessed: new Date(Date.now() - 1000 * 60 * 30),
      modifiedOffline: true,
      syncPending: true
    },
    {
      id: '2',
      type: 'fixture',
      name: 'DLC Fixture Database',
      size: 45.2 * 1024 * 1024,
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      modifiedOffline: false,
      syncPending: false
    },
    {
      id: '3',
      type: 'calculation',
      name: 'PPFD Calculator Cache',
      size: 1.2 * 1024 * 1024,
      lastAccessed: new Date(Date.now() - 1000 * 60 * 15),
      modifiedOffline: false,
      syncPending: false
    },
    {
      id: '4',
      type: 'report',
      name: 'Monthly Energy Report',
      size: 856 * 1024,
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      modifiedOffline: false,
      syncPending: false
    }
  ])

  const [cacheCategories, setCacheCategories] = useState<CacheCategory[]>([
    { name: 'Designs', icon: FileText, size: 45.3, items: 12, enabled: true },
    { name: 'Fixtures', icon: Database, size: 128.5, items: 1245, enabled: true },
    { name: 'Calculations', icon: Activity, size: 23.4, items: 89, enabled: true },
    { name: 'Reports', icon: FileText, size: 15.8, items: 24, enabled: true },
    { name: 'Images', icon: FolderOpen, size: 21.5, items: 156, enabled: false }
  ])

  const [activities, setActivities] = useState<OfflineActivity[]>([
    {
      id: '1',
      action: 'Created new design "Room B Layout"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      synced: false
    },
    {
      id: '2',
      action: 'Modified fixture placement in "Greenhouse A"',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      synced: false
    },
    {
      id: '3',
      action: 'Generated PPFD heatmap',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      synced: true
    }
  ])

  const [syncInProgress, setSyncInProgress] = useState(false)

  // Simulate online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineData.some(d => d.syncPending)) {
      handleSync()
    }
  }, [isOnline])

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
    if (!isOnline) return
    
    setSyncInProgress(true)
    
    // Simulate sync
    setTimeout(() => {
      setOfflineData(prev => prev.map(item => ({
        ...item,
        modifiedOffline: false,
        syncPending: false
      })))
      
      setActivities(prev => prev.map(activity => ({
        ...activity,
        synced: true
      })))
      
      setSyncInProgress(false)
    }, 3000)
  }

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      setOfflineData([])
      setCurrentCacheSize(0)
    }
  }

  const toggleCategory = (categoryName: string) => {
    setCacheCategories(prev => prev.map(cat =>
      cat.name === categoryName ? { ...cat, enabled: !cat.enabled } : cat
    ))
  }

  const getCacheUsagePercentage = () => {
    return (currentCacheSize / cacheSizeLimit) * 100
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-6 h-6 text-green-600" />
          ) : (
            <WifiOff className="w-6 h-6 text-red-600" />
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offline Mode</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {isOnline && offlineData.some(d => d.syncPending) && (
            <button
              onClick={handleSync}
              disabled={syncInProgress}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {syncInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Sync Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Working Offline
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You're currently offline. Changes will be saved locally and synced when you reconnect.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cache Usage */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Storage Usage</h3>
          <button
            onClick={handleClearCache}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">
              {currentCacheSize.toFixed(1)} MB of {cacheSizeLimit} MB used
            </span>
            <span className="text-sm font-medium">
              {getCacheUsagePercentage().toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                getCacheUsagePercentage() > 90 ? 'bg-red-600' :
                getCacheUsagePercentage() > 70 ? 'bg-yellow-600' :
                'bg-green-600'
              }`}
              style={{ width: `${getCacheUsagePercentage()}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {cacheCategories.map(category => (
            <div
              key={category.name}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                category.enabled 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => toggleCategory(category.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <category.icon className={`w-5 h-5 ${
                  category.enabled ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                {category.enabled ? (
                  <Check className="w-4 h-4 text-indigo-600" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <p className="font-medium text-sm">{category.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {category.size} MB • {category.items} items
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Data */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Offline Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Size</th>
                <th className="text-left py-2">Last Accessed</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offlineData.map(item => (
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
                  <td className="py-3 text-sm">{getTimeAgo(item.lastAccessed)}</td>
                  <td className="py-3">
                    {item.syncPending ? (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Pending sync</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Synced</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offline Activity */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Offline Activity</h3>
        <div className="space-y-2">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {activity.synced ? (
                  <Cloud className="w-4 h-4 text-green-600" />
                ) : (
                  <HardDrive className="w-4 h-4 text-gray-600" />
                )}
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
              {activity.error ? (
                <span className="text-xs text-red-600">{activity.error}</span>
              ) : activity.synced ? (
                <span className="text-xs text-green-600">Synced</span>
              ) : (
                <span className="text-xs text-gray-500">Local only</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Offline Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Enable Offline Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Work without internet connection
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={offlineEnabled}
                onChange={(e) => setOfflineEnabled(e.target.checked)}
                className="toggle"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Auto Download</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download recent data for offline use
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoDownload}
                onChange={(e) => setAutoDownload(e.target.checked)}
                className="toggle"
              />
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cache Size Limit
              </label>
              <select
                value={cacheSizeLimit}
                onChange={(e) => setCacheSizeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={100}>100 MB</option>
                <option value={250}>250 MB</option>
                <option value={500}>500 MB</option>
                <option value={1000}>1 GB</option>
                <option value={2000}>2 GB</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Security</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Encrypted Storage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All offline data is encrypted on your device
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Auto Expiry</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Offline data expires after 30 days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Conflict Resolution</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart merging prevents data loss
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}