"use client"
import { useState } from 'react'
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
  X
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

export function MultiSiteManager() {
  const [sites, setSites] = useState<Site[]>([
    {
      id: '1',
      name: 'Main Production Facility',
      location: 'Denver, CO',
      type: 'greenhouse',
      size: 50000,
      manager: 'John Smith',
      contact: 'john@example.com',
      status: 'active',
      zones: [
        {
          id: 'z1',
          name: 'Lettuce Bay 1',
          area: 10000,
          cropType: 'Lettuce',
          growthStage: 'Vegetative',
          fixtures: 120,
          environment: { temperature: 72, humidity: 65, co2: 800, vpd: 1.2 },
          schedule: { lightOn: '06:00', lightOff: '22:00', photoperiod: 16 }
        },
        {
          id: 'z2',
          name: 'Tomato Greenhouse A',
          area: 15000,
          cropType: 'Tomato',
          growthStage: 'Flowering',
          fixtures: 200,
          environment: { temperature: 75, humidity: 70, co2: 1000, vpd: 1.4 },
          schedule: { lightOn: '05:00', lightOff: '21:00', photoperiod: 16 }
        }
      ],
      metrics: {
        totalFixtures: 320,
        totalPower: 192,
        avgPPFD: 450,
        avgDLI: 25.9,
        energyUsage: 138240,
        waterUsage: 45000,
        yield: 8500
      }
    },
    {
      id: '2',
      name: 'R&D Vertical Farm',
      location: 'Portland, OR',
      type: 'vertical-farm',
      size: 20000,
      manager: 'Sarah Johnson',
      contact: 'sarah@example.com',
      status: 'active',
      zones: [
        {
          id: 'z3',
          name: 'Microgreens Level 1',
          area: 5000,
          cropType: 'Microgreens',
          growthStage: 'Germination',
          fixtures: 80,
          environment: { temperature: 70, humidity: 75, co2: 600, vpd: 0.8 },
          schedule: { lightOn: '06:00', lightOff: '00:00', photoperiod: 18 }
        }
      ],
      metrics: {
        totalFixtures: 160,
        totalPower: 96,
        avgPPFD: 200,
        avgDLI: 13,
        energyUsage: 69120,
        waterUsage: 15000,
        yield: 2500
      }
    }
  ])

  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [showAddSite, setShowAddSite] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [alerts] = useState<Alert[]>([
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
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {(totalMetrics.yield / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-400 mt-1">lbs</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Alerts</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {alerts.filter(a => !a.resolved).length}
          </p>
          <p className="text-xs text-orange-400 mt-1">
            {alerts.filter(a => a.type === 'warning' && !a.resolved).length} warnings
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100 text-sm"
          >
            <option value="all">All Sites</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Sites View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map(site => (
            <div
              key={site.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              onClick={() => setSelectedSite(site)}
            >
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
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
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
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <Settings className="w-4 h-4 text-gray-400" />
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
                      {site?.name} • {new Date(alert.timestamp).toLocaleString()}
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
    </div>
  )
}