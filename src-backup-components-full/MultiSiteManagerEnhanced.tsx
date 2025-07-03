"use client"
import { useState, useEffect } from 'react'
import {
  Building2,
  MapPin,
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  Thermometer,
  Droplets,
  Sun,
  DollarSign,
  Package,
  Activity,
  Globe,
  Clock,
  Filter,
  X,
  Save,
  ChevronDown
} from 'lucide-react'
import { MultiSiteMap } from './MultiSiteMap'

interface Site {
  id: string
  name: string
  location: string
  type: 'greenhouse' | 'indoor' | 'vertical-farm' | 'hybrid'
  size: number // sq ft
  zones: Zone[]
  manager: string
  contact: string
  status: 'active' | 'maintenance' | 'offline'
  address?: string
  phone?: string
  metrics: {
    totalFixtures: number
    totalPower: number // kW
    avgPPFD: number
    avgDLI: number
    energyUsage: number // kWh/month
    waterUsage: number // gallons/month
    yield: number // lbs/month
  }
}

interface Zone {
  id: string
  name: string
  area: number // sq ft
  cropType: string
  growthStage: string
  fixtures: number
  environment: {
    temperature: number
    humidity: number
    co2: number
    vpd: number
  }
  schedule: {
    lightOn: string
    lightOff: string
    photoperiod: number
  }
}

interface Alert {
  id: string
  siteId: string
  zoneId?: string
  type: 'warning' | 'error' | 'info'
  category: 'equipment' | 'environment' | 'performance' | 'maintenance'
  message: string
  timestamp: Date
  resolved: boolean
}

// Client-only time display component to avoid hydration mismatch
function TimeAgo({ timestamp }: { timestamp: Date }) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return <span className="text-gray-400">-</span>
  }
  
  return <span>{new Date(timestamp).toLocaleString()}</span>
}

export function MultiSiteManagerEnhanced() {
  const [sites, setSites] = useState<Site[]>([
    {
      id: '1',
      name: 'Main Production Facility',
      location: 'Denver, CO',
      type: 'greenhouse',
      size: 50000,
      manager: 'John Smith',
      contact: 'john@example.com',
      phone: '(555) 123-4567',
      address: '123 Growing Way, Denver, CO 80201',
      status: 'active',
      zones: [
        {
          id: 'z1',
          name: 'Lettuce Bay 1',
          area: 10000,
          cropType: 'Lettuce',
          growthStage: 'Vegetative',
          fixtures: 120,
          environment: {
            temperature: 72,
            humidity: 65,
            co2: 1200,
            vpd: 0.95
          },
          schedule: {
            lightOn: '06:00',
            lightOff: '22:00',
            photoperiod: 16
          }
        },
        {
          id: 'z2',
          name: 'Tomato House A',
          area: 15000,
          cropType: 'Tomatoes',
          growthStage: 'Flowering',
          fixtures: 180,
          environment: {
            temperature: 78,
            humidity: 60,
            co2: 1000,
            vpd: 1.2
          },
          schedule: {
            lightOn: '06:00',
            lightOff: '18:00',
            photoperiod: 12
          }
        }
      ],
      metrics: {
        totalFixtures: 300,
        totalPower: 150,
        avgPPFD: 850,
        avgDLI: 45,
        energyUsage: 54000,
        waterUsage: 12000,
        yield: 8500
      }
    },
    {
      id: '2',
      name: 'R&D Vertical Farm',
      location: 'Boulder, CO',
      type: 'vertical-farm',
      size: 20000,
      manager: 'Sarah Johnson',
      contact: 'sarah@example.com',
      phone: '(555) 234-5678',
      address: '456 Innovation Blvd, Boulder, CO 80301',
      status: 'active',
      zones: [
        {
          id: 'z3',
          name: 'Microgreens Level 1',
          area: 5000,
          cropType: 'Microgreens',
          growthStage: 'Germination',
          fixtures: 80,
          environment: {
            temperature: 68,
            humidity: 70,
            co2: 800,
            vpd: 0.8
          },
          schedule: {
            lightOn: '06:00',
            lightOff: '20:00',
            photoperiod: 14
          }
        }
      ],
      metrics: {
        totalFixtures: 80,
        totalPower: 40,
        avgPPFD: 650,
        avgDLI: 35,
        energyUsage: 14400,
        waterUsage: 3000,
        yield: 2200
      }
    }
  ])

  const [alerts, setAlerts] = useState<Alert[]>([])
  
  // Initialize alerts in useEffect to avoid hydration mismatch
  useEffect(() => {
    setAlerts([
      {
        id: 'a1',
        siteId: '1',
        zoneId: 'z1',
        type: 'warning',
        category: 'environment',
        message: 'Temperature 3°F above setpoint in Lettuce Bay 1',
        timestamp: new Date(Date.now() - 3600000),
        resolved: false
      },
      {
        id: 'a2',
        siteId: '2',
        type: 'info',
        category: 'maintenance',
        message: 'Scheduled maintenance due in 7 days',
        timestamp: new Date(Date.now() - 7200000),
        resolved: false
      }
    ])
  }, [])

  const [showAddSite, setShowAddSite] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'offline'>('all')
  
  // New site form state
  const [newSite, setNewSite] = useState({
    name: '',
    location: '',
    type: '' as Site['type'] | '',
    size: '',
    manager: '',
    contact: '',
    phone: '',
    address: '',
    zone: {
      name: '',
      cropType: '',
      area: '',
      fixtures: ''
    }
  })

  const totalMetrics = sites.reduce((acc, site) => ({
    sites: acc.sites + 1,
    fixtures: acc.fixtures + site.metrics.totalFixtures,
    power: acc.power + site.metrics.totalPower,
    energy: acc.energy + site.metrics.energyUsage,
    yield: acc.yield + site.metrics.yield
  }), { sites: 0, fixtures: 0, power: 0, energy: 0, yield: 0 })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/10'
      case 'offline': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'greenhouse': return '🏡'
      case 'indoor': return '🏢'
      case 'vertical-farm': return '🏗️'
      case 'hybrid': return '🏛️'
      default: return '🏢'
    }
  }

  const filteredSites = filterStatus === 'all' 
    ? sites 
    : sites.filter(s => s.status === filterStatus)

  const handleSaveEdit = () => {
    if (!editingSite) return
    
    setSites(prev => prev.map(site => 
      site.id === editingSite.id ? editingSite : site
    ))
    setEditingSite(null)
  }

  const handleDeleteSite = (siteId: string) => {
    if (confirm('Are you sure you want to delete this site?')) {
      setSites(prev => prev.filter(site => site.id !== siteId))
    }
  }
  
  const handleCreateSite = () => {
    if (!newSite.name || !newSite.location || !newSite.type || !newSite.size || !newSite.manager || !newSite.contact) {
      alert('Please fill in all required fields')
      return
    }
    
    const site: Site = {
      id: (sites.length + 1).toString(),
      name: newSite.name,
      location: newSite.location,
      type: newSite.type as Site['type'],
      size: parseInt(newSite.size),
      manager: newSite.manager,
      contact: newSite.contact,
      phone: newSite.phone,
      address: newSite.address,
      status: 'active',
      zones: newSite.zone.name ? [{
        id: 'z1',
        name: newSite.zone.name,
        area: parseInt(newSite.zone.area) || 0,
        cropType: newSite.zone.cropType,
        growthStage: 'Seedling',
        fixtures: parseInt(newSite.zone.fixtures) || 0,
        environment: {
          temperature: 72,
          humidity: 65,
          co2: 1000,
          vpd: 0.95
        },
        schedule: {
          lightOn: '06:00',
          lightOff: '22:00',
          photoperiod: 16
        }
      }] : [],
      metrics: {
        totalFixtures: parseInt(newSite.zone.fixtures) || 0,
        totalPower: (parseInt(newSite.zone.fixtures) || 0) * 0.5,
        avgPPFD: 750,
        avgDLI: 40,
        energyUsage: (parseInt(newSite.zone.fixtures) || 0) * 0.5 * 16 * 30,
        waterUsage: parseInt(newSite.size) * 0.24,
        yield: parseInt(newSite.size) * 0.17
      }
    }
    
    setSites(prev => [...prev, site])
    setShowAddSite(false)
    
    // Reset form
    setNewSite({
      name: '',
      location: '',
      type: '',
      size: '',
      manager: '',
      contact: '',
      phone: '',
      address: '',
      zone: {
        name: '',
        cropType: '',
        area: '',
        fixtures: ''
      }
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Multi-Site Management</h1>
          <p className="text-gray-400">Monitor and control all your growing facilities</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'map' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Map
            </button>
          </div>
          <button
            onClick={() => setShowAddSite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Sites</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">{totalMetrics.sites}</p>
          <p className="text-xs text-green-400 mt-1">
            {sites.filter(s => s.status === 'active').length} active
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Fixtures</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {totalMetrics.fixtures.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalMetrics.power} kW total
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Monthly Energy</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {(totalMetrics.energy / 1000).toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 mt-1">MWh</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Monthly Yield</span>
            <Package className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {totalMetrics.yield.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">lbs</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Efficiency</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {totalMetrics.energy > 0 ? (totalMetrics.yield / totalMetrics.energy * 1000).toFixed(2) : '0'}
          </p>
          <p className="text-xs text-gray-400 mt-1">lbs/MWh</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-gray-400">Filter by status:</span>
        <div className="flex gap-2">
          {['all', 'active', 'maintenance', 'offline'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map(site => (
            <div key={site.id} className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(site.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-100">{site.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {site.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(site.status)}`}>
                  {site.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-400">Zones</p>
                  <p className="text-lg font-medium text-gray-100">{site.zones.length}</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-400">Size</p>
                  <p className="text-lg font-medium text-gray-100">
                    {(site.size / 1000).toFixed(0)}k ft²
                  </p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-400">Fixtures</p>
                  <p className="text-lg font-medium text-gray-100">{site.metrics.totalFixtures}</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-400">Yield/mo</p>
                  <p className="text-lg font-medium text-gray-100">
                    {site.metrics.yield.toLocaleString()} lbs
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{site.manager}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedSite(site)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => setEditingSite(site)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Edit Site"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Delete Site"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Zones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Power
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSites.map(site => (
                <tr key={site.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(site.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-100">{site.name}</p>
                        <p className="text-xs text-gray-400">{site.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {site.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(site.status)}`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {site.zones.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {site.metrics.totalPower} kW
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {site.metrics.yield.toLocaleString()} lbs/mo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedSite(site)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => setEditingSite(site)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Edit Site"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSite(site.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Delete Site"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="bg-gray-800 rounded-lg h-96 overflow-hidden">
          <MultiSiteMap 
            sites={sites}
            selectedSiteId={selectedSite?.id}
            onSiteClick={(siteId) => {
              const site = sites.find(s => s.id === siteId);
              if (site) setSelectedSite(site);
            }}
          />
        </div>
      )}

      {/* Active Alerts */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Active Alerts</h2>
        <div className="space-y-3">
          {alerts.filter(a => !a.resolved).map(alert => {
            const site = sites.find(s => s.id === alert.siteId)
            return (
              <div key={alert.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    alert.type === 'warning' ? 'bg-yellow-500/10' :
                    alert.type === 'error' ? 'bg-red-500/10' :
                    'bg-blue-500/10'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      alert.type === 'warning' ? 'text-yellow-400' :
                      alert.type === 'error' ? 'text-red-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{alert.message}</p>
                    <p className="text-xs text-gray-400">
                      {site?.name} • <TimeAgo timestamp={alert.timestamp} />
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
                  Resolve
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Site Detail Modal */}
      {selectedSite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-100">{selectedSite.name}</h2>
              <button
                onClick={() => setSelectedSite(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Site Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Manager</p>
                  <p className="text-gray-100">{selectedSite.manager}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Contact</p>
                  <p className="text-gray-100">{selectedSite.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-gray-100">{selectedSite.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-gray-100">{selectedSite.address || selectedSite.location}</p>
                </div>
              </div>

              {/* Zone Details */}
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Zones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSite.zones.map(zone => (
                  <div key={zone.id} className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-100 mb-2">{zone.name}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Crop</p>
                        <p className="text-gray-100">{zone.cropType}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Stage</p>
                        <p className="text-gray-100">{zone.growthStage}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Fixtures</p>
                        <p className="text-gray-100">{zone.fixtures}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Photoperiod</p>
                        <p className="text-gray-100">{zone.schedule.photoperiod}h</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Environment</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-orange-400" />
                          {zone.environment.temperature}°F
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          {zone.environment.humidity}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-green-400" />
                          {zone.environment.co2} ppm
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Site Modal */}
      {editingSite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-100">Edit Site</h2>
              <button
                onClick={() => setEditingSite(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Site Name</label>
                <input
                  type="text"
                  value={editingSite.name}
                  onChange={(e) => setEditingSite({...editingSite, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingSite.location}
                    onChange={(e) => setEditingSite({...editingSite, location: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select
                    value={editingSite.type}
                    onChange={(e) => setEditingSite({...editingSite, type: e.target.value as Site['type']})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="greenhouse">Greenhouse</option>
                    <option value="indoor">Indoor</option>
                    <option value="vertical-farm">Vertical Farm</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Manager</label>
                  <input
                    type="text"
                    value={editingSite.manager}
                    onChange={(e) => setEditingSite({...editingSite, manager: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editingSite.contact}
                    onChange={(e) => setEditingSite({...editingSite, contact: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingSite.phone || ''}
                    onChange={(e) => setEditingSite({...editingSite, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    value={editingSite.status}
                    onChange={(e) => setEditingSite({...editingSite, status: e.target.value as Site['status']})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <textarea
                  value={editingSite.address || ''}
                  onChange={(e) => setEditingSite({...editingSite, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Size (sq ft)</label>
                <input
                  type="number"
                  value={editingSite.size}
                  onChange={(e) => setEditingSite({...editingSite, size: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-100">Add New Site</h2>
              <button
                onClick={() => setShowAddSite(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Site Name *</label>
                <input
                  type="text"
                  placeholder="Enter site name"
                  value={newSite.name}
                  onChange={(e) => setNewSite({...newSite, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Location *</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={newSite.location}
                    onChange={(e) => setNewSite({...newSite, location: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                  <select
                    value={newSite.type}
                    onChange={(e) => setNewSite({...newSite, type: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="indoor">Indoor</option>
                    <option value="vertical-farm">Vertical Farm</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Manager Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newSite.manager}
                    onChange={(e) => setNewSite({...newSite, manager: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    placeholder="manager@example.com"
                    value={newSite.contact}
                    onChange={(e) => setNewSite({...newSite, contact: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newSite.phone}
                    onChange={(e) => setNewSite({...newSite, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Size (sq ft) *</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={newSite.size}
                    onChange={(e) => setNewSite({...newSite, size: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <textarea
                  placeholder="123 Growing Way, Denver, CO 80201"
                  value={newSite.address}
                  onChange={(e) => setNewSite({...newSite, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Initial Zone Setup</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Zone Name</label>
                    <input
                      type="text"
                      placeholder="Zone 1"
                      value={newSite.zone.name}
                      onChange={(e) => setNewSite({...newSite, zone: {...newSite.zone, name: e.target.value}})}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Crop Type</label>
                    <input
                      type="text"
                      placeholder="Lettuce"
                      value={newSite.zone.cropType}
                      onChange={(e) => setNewSite({...newSite, zone: {...newSite.zone, cropType: e.target.value}})}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Area (sq ft)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={newSite.zone.area}
                      onChange={(e) => setNewSite({...newSite, zone: {...newSite.zone, area: e.target.value}})}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fixtures</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newSite.zone.fixtures}
                      onChange={(e) => setNewSite({...newSite, zone: {...newSite.zone, fixtures: e.target.value}})}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">* Required fields</p>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddSite(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSite}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Site
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}