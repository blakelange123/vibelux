'use client'

import { useState, useEffect } from 'react'
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  HardDrive,
  Cloud,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  FileText,
  Archive,
  Settings,
  Activity,
  BarChart,
  TrendingUp,
  Zap,
  Server,
  Lock,
  Unlock,
  Eye,
  Plus,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react'

interface Backup {
  id: string
  filename: string
  size: number
  compressed: boolean
  encrypted: boolean
  checksum: string
  tables: string[]
  rowCounts: Record<string, number>
  createdAt: string
  location: 's3' | 'local'
  s3Key?: string
  localPath?: string
  status: 'creating' | 'completed' | 'failed' | 'deleted'
  restoredAt?: string
  duration?: number
  errorMessage?: string
}

interface BackupConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  retentionDays: number
  destination: 's3' | 'local'
  encryption: boolean
  notifications: boolean
  includeUserData: boolean
  includeLogs: boolean
  maxBackupSize: number
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  successRate: number
  lastBackupTime?: string
  nextScheduledBackup?: string
  oldestBackup?: string
  avgBackupSize: number
  avgBackupDuration: number
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [filteredBackups, setFilteredBackups] = useState<Backup[]>([])
  const [config, setConfig] = useState<BackupConfig | null>(null)
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoringBackup, setIsRestoringBackup] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)

  // Backup creation options
  const [backupOptions, setBackupOptions] = useState({
    includeUserData: true,
    includeLogs: false,
    customTables: [] as string[],
    description: ''
  })

  // Restore options
  const [restoreOptions, setRestoreOptions] = useState({
    targetDatabase: '',
    overwriteExisting: false,
    restoreUserData: true,
    customTables: [] as string[]
  })

  useEffect(() => {
    loadBackups()
    loadConfig()
    loadStats()
    const interval = setInterval(loadBackups, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [backups, searchQuery, filterStatus, filterLocation])

  async function loadBackups() {
    try {
      const response = await fetch('/api/admin/backup/list')
      const data = await response.json()
      setBackups(data.backups || mockBackups)
    } catch (error) {
      console.error('Error loading backups:', error)
      setBackups(mockBackups)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadConfig() {
    try {
      const response = await fetch('/api/admin/backup/config')
      const data = await response.json()
      setConfig(data.config || mockConfig)
    } catch (error) {
      console.error('Error loading config:', error)
      setConfig(mockConfig)
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/backup/stats')
      const data = await response.json()
      setStats(data.stats || mockStats)
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats(mockStats)
    }
  }

  function applyFilters() {
    let filtered = [...backups]

    if (searchQuery) {
      filtered = filtered.filter(backup =>
        backup.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        backup.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(backup => backup.status === filterStatus)
    }

    if (filterLocation !== 'all') {
      filtered = filtered.filter(backup => backup.location === filterLocation)
    }

    setFilteredBackups(filtered)
  }

  async function createBackup() {
    setIsCreatingBackup(true)
    try {
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupOptions)
      })

      if (response.ok) {
        await loadBackups()
        await loadStats()
        setShowBackupModal(false)
        setBackupOptions({
          includeUserData: true,
          includeLogs: false,
          customTables: [],
          description: ''
        })
      } else {
        throw new Error('Failed to create backup')
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Failed to create backup')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  async function restoreBackup(backupId: string) {
    if (!confirm('Are you sure you want to restore this backup? This action cannot be undone.')) {
      return
    }

    setIsRestoringBackup(backupId)
    try {
      const response = await fetch(`/api/admin/backup/${backupId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restoreOptions)
      })

      if (response.ok) {
        await loadBackups()
        setShowRestoreModal(false)
        alert('Backup restored successfully')
      } else {
        throw new Error('Failed to restore backup')
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Failed to restore backup')
    } finally {
      setIsRestoringBackup(null)
    }
  }

  async function deleteBackup(backupId: string) {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBackups()
        await loadStats()
      } else {
        throw new Error('Failed to delete backup')
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      alert('Failed to delete backup')
    }
  }

  async function updateConfig(newConfig: BackupConfig) {
    try {
      const response = await fetch('/api/admin/backup/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })

      if (response.ok) {
        setConfig(newConfig)
        setShowConfigModal(false)
      } else {
        throw new Error('Failed to update config')
      }
    } catch (error) {
      console.error('Error updating config:', error)
      alert('Failed to update configuration')
    }
  }

  async function testBackupSystem() {
    try {
      const response = await fetch('/api/admin/backup/test', {
        method: 'POST'
      })

      const result = await response.json()
      alert(result.success ? 'Backup system test passed!' : `Test failed: ${result.error}`)
    } catch (error) {
      console.error('Error testing backup system:', error)
      alert('Test failed')
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10'
      case 'creating': return 'text-blue-400 bg-blue-400/10'
      case 'failed': return 'text-red-400 bg-red-400/10'
      case 'deleted': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed': return CheckCircle
      case 'creating': return RefreshCw
      case 'failed': return XCircle
      case 'deleted': return Trash2
      default: return AlertTriangle
    }
  }

  // Mock data
  const mockBackups: Backup[] = [
    {
      id: 'backup_1',
      filename: 'vibelux_backup_2025-06-26T10-30-00.sql.gz.enc',
      size: 157286400, // ~150MB
      compressed: true,
      encrypted: true,
      checksum: 'sha256:abc123...',
      tables: ['users', 'designs', 'fixtures', 'calculations'],
      rowCounts: { users: 12847, designs: 5634, fixtures: 892, calculations: 23456 },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: 's3',
      s3Key: 'backups/2025/06/vibelux_backup_2025-06-26T10-30-00.sql.gz.enc',
      status: 'completed',
      duration: 340
    },
    {
      id: 'backup_2',
      filename: 'vibelux_backup_2025-06-25T10-30-00.sql.gz.enc',
      size: 152428800, // ~145MB
      compressed: true,
      encrypted: true,
      checksum: 'sha256:def456...',
      tables: ['users', 'designs', 'fixtures', 'calculations'],
      rowCounts: { users: 12756, designs: 5589, fixtures: 887, calculations: 23234 },
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      location: 's3',
      status: 'completed',
      duration: 325
    },
    {
      id: 'backup_3',
      filename: 'vibelux_backup_2025-06-24T10-30-00.sql.gz.enc',
      size: 148934656, // ~142MB
      compressed: true,
      encrypted: true,
      checksum: 'sha256:ghi789...',
      tables: ['users', 'designs', 'fixtures', 'calculations'],
      rowCounts: { users: 12689, designs: 5545, fixtures: 883, calculations: 23012 },
      createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
      location: 'local',
      localPath: '/backups/vibelux_backup_2025-06-24T10-30-00.sql.gz.enc',
      status: 'completed',
      duration: 312
    },
    {
      id: 'backup_4',
      filename: 'vibelux_backup_2025-06-23T10-30-00.sql.gz.enc',
      size: 0,
      compressed: true,
      encrypted: true,
      checksum: '',
      tables: [],
      rowCounts: {},
      createdAt: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
      location: 's3',
      status: 'failed',
      errorMessage: 'Database connection timeout'
    }
  ]

  const mockConfig: BackupConfig = {
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    destination: 's3',
    encryption: true,
    notifications: true,
    includeUserData: true,
    includeLogs: false,
    maxBackupSize: 1024 // 1GB
  }

  const mockStats: BackupStats = {
    totalBackups: 28,
    totalSize: 4294967296, // 4GB
    successRate: 96.4,
    lastBackupTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextScheduledBackup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    oldestBackup: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    avgBackupSize: 153391689, // ~146MB
    avgBackupDuration: 325
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Database Backup</h1>
            <p className="text-gray-400">Manage database backups and recovery</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={testBackupSystem}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Test System
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
            <button
              onClick={() => setShowBackupModal(true)}
              disabled={isCreatingBackup}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              {isCreatingBackup ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Archive className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.totalBackups}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Backups</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatBytes(stats.totalSize)} total size
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.successRate}%</span>
              </div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg duration: {Math.round(stats.avgBackupDuration / 60)}m
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-orange-400" />
                <span className="text-lg font-bold text-white">
                  {stats.lastBackupTime 
                    ? new Date(stats.lastBackupTime).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <p className="text-gray-400 text-sm">Last Backup</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.lastBackupTime 
                  ? new Date(stats.lastBackupTime).toLocaleTimeString()
                  : ''
                }
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-purple-400" />
                <span className="text-lg font-bold text-white">
                  {stats.nextScheduledBackup 
                    ? new Date(stats.nextScheduledBackup).toLocaleDateString()
                    : 'Not scheduled'
                  }
                </span>
              </div>
              <p className="text-gray-400 text-sm">Next Backup</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.nextScheduledBackup 
                  ? new Date(stats.nextScheduledBackup).toLocaleTimeString()
                  : ''
                }
              </p>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        {config && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Backup Configuration</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                config.enabled 
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }`}>
                {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Frequency</p>
                <p className="text-white capitalize">{config.frequency}</p>
              </div>
              <div>
                <p className="text-gray-400">Retention</p>
                <p className="text-white">{config.retentionDays} days</p>
              </div>
              <div>
                <p className="text-gray-400">Storage</p>
                <p className="text-white flex items-center gap-1">
                  {config.destination === 's3' ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                  {config.destination.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Encryption</p>
                <p className="text-white flex items-center gap-1">
                  {config.encryption ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {config.encryption ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search backups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="creating">Creating</option>
              <option value="failed">Failed</option>
              <option value="deleted">Deleted</option>
            </select>
            
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Locations</option>
              <option value="s3">S3 Storage</option>
              <option value="local">Local Storage</option>
            </select>
            
            <button
              onClick={loadBackups}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Backups List */}
        <div className="space-y-4">
          {filteredBackups.map((backup) => {
            const StatusIcon = getStatusIcon(backup.status)
            return (
              <div key={backup.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`w-5 h-5 ${backup.status === 'creating' ? 'animate-spin' : ''}`} />
                      <h3 className="text-lg font-semibold text-white">{backup.filename}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400">
                        {backup.location === 's3' ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                        <span className="text-sm">{backup.location.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-400">Size</p>
                        <p className="text-white">{formatBytes(backup.size)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p className="text-white">{new Date(backup.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Tables</p>
                        <p className="text-white">{backup.tables.length} tables</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Duration</p>
                        <p className="text-white">
                          {backup.duration ? `${Math.round(backup.duration / 60)}m ${backup.duration % 60}s` : '-'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {backup.compressed && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                          Compressed
                        </span>
                      )}
                      {backup.encrypted && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded">
                          Encrypted
                        </span>
                      )}
                      {backup.restoredAt && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                          Restored {new Date(backup.restoredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {backup.errorMessage && (
                      <div className="mt-3 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                        <p className="text-red-400 text-sm">{backup.errorMessage}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {backup.status === 'completed' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup)
                            setShowRestoreModal(true)
                          }}
                          disabled={isRestoringBackup === backup.id}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore backup"
                        >
                          {isRestoringBackup === backup.id ? (
                            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => {/* Download backup */}}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Download backup"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedBackup(backup)
                        // Show backup details modal
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete backup"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create Backup Modal */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold text-white mb-6">Create Database Backup</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={backupOptions.description}
                    onChange={(e) => setBackupOptions({ ...backupOptions, description: e.target.value })}
                    placeholder="e.g., Pre-deployment backup"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={backupOptions.includeUserData}
                      onChange={(e) => setBackupOptions({ ...backupOptions, includeUserData: e.target.checked })}
                      className="rounded border-gray-600"
                    />
                    <span className="text-gray-300">Include user data and profiles</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={backupOptions.includeLogs}
                      onChange={(e) => setBackupOptions({ ...backupOptions, includeLogs: e.target.checked })}
                      className="rounded border-gray-600"
                    />
                    <span className="text-gray-300">Include system logs and audit trails</span>
                  </label>
                </div>
                
                <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-medium">Backup Information</p>
                      <p className="text-blue-300 text-sm mt-1">
                        This will create a compressed and encrypted backup of your database. 
                        The backup will be stored according to your configured settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBackup}
                  disabled={isCreatingBackup}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  {isCreatingBackup ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  {isCreatingBackup ? 'Creating...' : 'Create Backup'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Modal */}
        {showRestoreModal && selectedBackup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold text-white mb-6">Restore Database Backup</h2>
              
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Warning</p>
                    <p className="text-red-300 text-sm mt-1">
                      This will restore the database from the selected backup. This action cannot be undone.
                      Make sure you have a recent backup before proceeding.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Backup to restore:</p>
                  <p className="text-white font-medium">{selectedBackup.filename}</p>
                  <p className="text-gray-400 text-sm">
                    Created: {new Date(selectedBackup.createdAt).toLocaleString()} 
                    • Size: {formatBytes(selectedBackup.size)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.overwriteExisting}
                      onChange={(e) => setRestoreOptions({ ...restoreOptions, overwriteExisting: e.target.checked })}
                      className="rounded border-gray-600"
                    />
                    <span className="text-gray-300">Overwrite existing data</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={restoreOptions.restoreUserData}
                      onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreUserData: e.target.checked })}
                      className="rounded border-gray-600"
                    />
                    <span className="text-gray-300">Restore user data and profiles</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => restoreBackup(selectedBackup.id)}
                  disabled={isRestoringBackup === selectedBackup.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  {isRestoringBackup === selectedBackup.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isRestoringBackup === selectedBackup.id ? 'Restoring...' : 'Restore Backup'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}