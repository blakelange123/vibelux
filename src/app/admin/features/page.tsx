'use client'

import { useState, useEffect } from 'react'
import {
  Flag,
  ToggleLeft,
  ToggleRight,
  Users,
  Percent,
  Target,
  Code,
  Calendar,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  GitBranch,
  Zap
} from 'lucide-react'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  type: 'boolean' | 'percentage' | 'variant' | 'schedule'
  value?: any
  percentage?: number
  variants?: { key: string; name: string; percentage: number }[]
  targetSegments?: string[]
  targetTiers?: string[]
  targetUsers?: string[]
  schedule?: {
    startDate?: string
    endDate?: string
    timezone: string
  }
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  createdBy: string
  stats?: {
    evaluations: number
    enabledCount: number
    disabledCount: number
    uniqueUsers: number
  }
}

interface FlagVariant {
  key: string
  name: string
  percentage: number
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [filteredFlags, setFilteredFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form state for creating/editing flags
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    type: 'boolean' as const,
    enabled: false,
    percentage: 100,
    variants: [
      { key: 'control', name: 'Control', percentage: 50 },
      { key: 'treatment', name: 'Treatment', percentage: 50 }
    ],
    targetSegments: [] as string[],
    targetTiers: [] as string[],
    targetUsers: [] as string[],
    schedule: {
      startDate: '',
      endDate: '',
      timezone: 'UTC'
    }
  })

  useEffect(() => {
    loadFeatureFlags()
    const interval = setInterval(loadFeatureFlags, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [flags, searchQuery, filterType, filterStatus])

  async function loadFeatureFlags() {
    try {
      const response = await fetch('/api/admin/feature-flags')
      const data = await response.json()
      setFlags(data.flags || mockFlags)
    } catch (error) {
      console.error('Error loading feature flags:', error)
      // Use mock data for now
      setFlags(mockFlags)
    } finally {
      setIsLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...flags]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(flag =>
        flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(flag => flag.type === filterType)
    }

    // Status filter
    if (filterStatus === 'enabled') {
      filtered = filtered.filter(flag => flag.enabled)
    } else if (filterStatus === 'disabled') {
      filtered = filtered.filter(flag => !flag.enabled)
    }

    setFilteredFlags(filtered)
  }

  async function toggleFlag(flagId: string) {
    const flag = flags.find(f => f.id === flagId)
    if (!flag) return

    try {
      const response = await fetch(`/api/admin/feature-flags/${flagId}/toggle`, {
        method: 'POST'
      })

      if (response.ok) {
        setFlags(flags.map(f => 
          f.id === flagId ? { ...f, enabled: !f.enabled } : f
        ))
      }
    } catch (error) {
      console.error('Error toggling flag:', error)
    }
  }

  async function saveFlag() {
    try {
      const endpoint = isEditMode 
        ? `/api/admin/feature-flags/${selectedFlag?.id}`
        : '/api/admin/feature-flags'
      
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadFeatureFlags()
        setShowCreateModal(false)
        setIsEditMode(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving flag:', error)
    }
  }

  async function deleteFlag(flagId: string) {
    if (!confirm('Are you sure you want to delete this feature flag?')) return

    try {
      const response = await fetch(`/api/admin/feature-flags/${flagId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadFeatureFlags()
      }
    } catch (error) {
      console.error('Error deleting flag:', error)
    }
  }

  function resetForm() {
    setFormData({
      key: '',
      name: '',
      description: '',
      type: 'boolean',
      enabled: false,
      percentage: 100,
      variants: [
        { key: 'control', name: 'Control', percentage: 50 },
        { key: 'treatment', name: 'Treatment', percentage: 50 }
      ],
      targetSegments: [],
      targetTiers: [],
      targetUsers: [],
      schedule: {
        startDate: '',
        endDate: '',
        timezone: 'UTC'
      }
    })
  }

  function editFlag(flag: FeatureFlag) {
    setSelectedFlag(flag)
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      type: flag.type,
      enabled: flag.enabled,
      percentage: flag.percentage || 100,
      variants: flag.variants || [
        { key: 'control', name: 'Control', percentage: 50 },
        { key: 'treatment', name: 'Treatment', percentage: 50 }
      ],
      targetSegments: flag.targetSegments || [],
      targetTiers: flag.targetTiers || [],
      targetUsers: flag.targetUsers || [],
      schedule: flag.schedule || {
        startDate: '',
        endDate: '',
        timezone: 'UTC'
      }
    })
    setIsEditMode(true)
    setShowCreateModal(true)
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'boolean': return ToggleRight
      case 'percentage': return Percent
      case 'variant': return GitBranch
      case 'schedule': return Calendar
      default: return Flag
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'boolean': return 'text-blue-400 bg-blue-400/10'
      case 'percentage': return 'text-green-400 bg-green-400/10'
      case 'variant': return 'text-purple-400 bg-purple-400/10'
      case 'schedule': return 'text-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  // Mock data
  const mockFlags: FeatureFlag[] = [
    {
      id: 'f1',
      key: 'new-3d-renderer',
      name: '3D Renderer V2',
      description: 'New WebGL-based 3D room renderer with improved performance',
      enabled: true,
      type: 'percentage',
      percentage: 25,
      targetTiers: ['professional', 'enterprise'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com',
      stats: {
        evaluations: 15420,
        enabledCount: 3855,
        disabledCount: 11565,
        uniqueUsers: 2341
      }
    },
    {
      id: 'f2',
      key: 'ai-spectrum-optimizer',
      name: 'AI Spectrum Optimization',
      description: 'Machine learning-based spectrum recommendations',
      enabled: false,
      type: 'boolean',
      targetSegments: ['beta-testers'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com',
      stats: {
        evaluations: 8234,
        enabledCount: 0,
        disabledCount: 8234,
        uniqueUsers: 1456
      }
    },
    {
      id: 'f3',
      key: 'dynamic-pricing',
      name: 'Dynamic Pricing Model',
      description: 'A/B test for new subscription pricing',
      enabled: true,
      type: 'variant',
      variants: [
        { key: 'control', name: 'Current Pricing', percentage: 70 },
        { key: 'treatment-a', name: '10% Discount', percentage: 20 },
        { key: 'treatment-b', name: '20% Discount Annual', percentage: 10 }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com',
      stats: {
        evaluations: 5672,
        enabledCount: 5672,
        disabledCount: 0,
        uniqueUsers: 892
      }
    },
    {
      id: 'f4',
      key: 'holiday-theme',
      name: 'Holiday Theme',
      description: 'Seasonal UI theme for December',
      enabled: true,
      type: 'schedule',
      schedule: {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        timezone: 'America/New_York'
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Feature Flags</h1>
            <p className="text-gray-400">Manage feature rollouts and A/B tests</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsEditMode(false)
              setShowCreateModal(true)
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Flag
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Flag className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{flags.length}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Flags</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {flags.filter(f => f.enabled).length}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Active Flags</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <GitBranch className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {flags.filter(f => f.type === 'variant').length}
              </span>
            </div>
            <p className="text-gray-400 text-sm">A/B Tests</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">
                {flags.reduce((sum, f) => sum + (f.stats?.evaluations || 0), 0).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Evaluations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search flags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              <option value="boolean">Boolean</option>
              <option value="percentage">Percentage</option>
              <option value="variant">Variant</option>
              <option value="schedule">Schedule</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
            
            <button
              onClick={loadFeatureFlags}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Flags List */}
        <div className="space-y-4">
          {filteredFlags.map((flag) => {
            const TypeIcon = getTypeIcon(flag.type)
            return (
              <div key={flag.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(flag.type)}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{flag.name}</h3>
                        <code className="text-sm text-gray-400">{flag.key}</code>
                      </div>
                      <button
                        onClick={() => toggleFlag(flag.id)}
                        className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          flag.enabled ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            flag.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-gray-400 mb-4">{flag.description}</p>
                    
                    {/* Flag Details */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {flag.type === 'percentage' && (
                        <div className="flex items-center gap-1 text-gray-300">
                          <Percent className="w-4 h-4" />
                          {flag.percentage}% rollout
                        </div>
                      )}
                      
                      {flag.type === 'variant' && flag.variants && (
                        <div className="flex items-center gap-2">
                          {flag.variants.map((variant) => (
                            <span
                              key={variant.key}
                              className="px-2 py-1 bg-gray-700 rounded text-gray-300"
                            >
                              {variant.name}: {variant.percentage}%
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {flag.targetTiers && flag.targetTiers.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-300">
                          <Target className="w-4 h-4" />
                          Tiers: {flag.targetTiers.join(', ')}
                        </div>
                      )}
                      
                      {flag.targetSegments && flag.targetSegments.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-300">
                          <Users className="w-4 h-4" />
                          Segments: {flag.targetSegments.join(', ')}
                        </div>
                      )}
                      
                      {flag.schedule && flag.schedule.startDate && (
                        <div className="flex items-center gap-1 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          {new Date(flag.schedule.startDate).toLocaleDateString()} - 
                          {flag.schedule.endDate ? new Date(flag.schedule.endDate).toLocaleDateString() : 'Ongoing'}
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    {flag.stats && (
                      <div className="mt-4 pt-4 border-t border-gray-700 flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-400">Evaluations:</span>
                          <span className="text-white ml-1">{flag.stats.evaluations.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Unique Users:</span>
                          <span className="text-white ml-1">{flag.stats.uniqueUsers.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Enable Rate:</span>
                          <span className="text-white ml-1">
                            {flag.stats.evaluations > 0 
                              ? Math.round((flag.stats.enabledCount / flag.stats.evaluations) * 100)
                              : 0
                            }%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(flag.key)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy flag key"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => editFlag(flag)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit flag"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteFlag(flag.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete flag"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-6">
                {isEditMode ? 'Edit Feature Flag' : 'Create Feature Flag'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Flag Key
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., new-feature-name"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    disabled={isEditMode}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., New Feature Name"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this flag controls..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Flag Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="boolean">Boolean (On/Off)</option>
                    <option value="percentage">Percentage Rollout</option>
                    <option value="variant">A/B Test Variants</option>
                    <option value="schedule">Scheduled</option>
                  </select>
                </div>
                
                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Rollout Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                )}
                
                {formData.type === 'schedule' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.schedule.startDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, startDate: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.schedule.endDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, endDate: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded border-gray-600"
                  />
                  <label htmlFor="enabled" className="text-sm text-gray-300">
                    Enable flag immediately
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setIsEditMode(false)
                      resetForm()
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveFlag}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                  >
                    {isEditMode ? 'Update' : 'Create'} Flag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}