"use client"

import { useState } from 'react'
import { 
  Bug,
  Shield,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Droplets,
  Wind,
  Eye,
  Settings,
  Download,
  Bell,
  Activity,
  MapPin,
  Layers,
  Filter,
  Info
} from 'lucide-react'

interface PestThreat {
  id: string
  name: string
  scientificName: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  detectionMethod: string
  populationLevel: number
  trend: 'increasing' | 'stable' | 'decreasing'
  affectedZones: string[]
  lastDetected: string
}

interface BeneficialInsect {
  id: string
  name: string
  targetPests: string[]
  populationLevel: number
  effectiveness: number
  lastRelease: string
  nextRelease: string
}

interface IPMProtocol {
  id: string
  name: string
  type: 'preventive' | 'corrective' | 'emergency'
  triggers: string[]
  actions: {
    step: number
    action: string
    timing: string
    products?: string[]
  }[]
  status: 'active' | 'scheduled' | 'completed'
  effectiveness: number
}

interface TrapData {
  id: string
  type: string
  location: string
  catchCount: number
  trend: 'up' | 'down' | 'stable'
  lastChecked: string
  needsReplacement: boolean
}

interface SpraySchedule {
  id: string
  product: string
  type: 'organic' | 'biological' | 'chemical'
  zones: string[]
  scheduledDate: string
  interval: string
  lastApplication: string
  rei: number // Re-entry interval in hours
  phi: number // Pre-harvest interval in days
}

export function AutomatedIPMSystem() {
  const [activeView, setActiveView] = useState<'overview' | 'threats' | 'protocols' | 'schedule'>('overview')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [showOnlyActive, setShowOnlyActive] = useState(false)

  // Current pest threats
  const pestThreats: PestThreat[] = [
    {
      id: 'pest-1',
      name: 'Spider Mites',
      scientificName: 'Tetranychus urticae',
      riskLevel: 'high',
      detectionMethod: 'Microscope inspection + AI imaging',
      populationLevel: 245,
      trend: 'increasing',
      affectedZones: ['flower-a', 'flower-b'],
      lastDetected: '2 hours ago'
    },
    {
      id: 'pest-2',
      name: 'Fungus Gnats',
      scientificName: 'Bradysia spp.',
      riskLevel: 'medium',
      detectionMethod: 'Yellow sticky traps',
      populationLevel: 34,
      trend: 'stable',
      affectedZones: ['veg-1'],
      lastDetected: '1 day ago'
    },
    {
      id: 'pest-3',
      name: 'Thrips',
      scientificName: 'Frankliniella occidentalis',
      riskLevel: 'low',
      detectionMethod: 'Blue sticky traps + visual',
      populationLevel: 12,
      trend: 'decreasing',
      affectedZones: ['prop-a'],
      lastDetected: '3 days ago'
    }
  ]

  // Beneficial insects
  const beneficials: BeneficialInsect[] = [
    {
      id: 'ben-1',
      name: 'Phytoseiulus persimilis',
      targetPests: ['Spider Mites'],
      populationLevel: 1200,
      effectiveness: 87,
      lastRelease: '5 days ago',
      nextRelease: 'In 2 days'
    },
    {
      id: 'ben-2',
      name: 'Hypoaspis miles',
      targetPests: ['Fungus Gnats', 'Thrips'],
      populationLevel: 5000,
      effectiveness: 92,
      lastRelease: '1 week ago',
      nextRelease: 'In 1 week'
    },
    {
      id: 'ben-3',
      name: 'Amblyseius cucumeris',
      targetPests: ['Thrips'],
      populationLevel: 3000,
      effectiveness: 78,
      lastRelease: '3 days ago',
      nextRelease: 'In 4 days'
    }
  ]

  // IPM Protocols
  const protocols: IPMProtocol[] = [
    {
      id: 'protocol-1',
      name: 'Spider Mite Outbreak Response',
      type: 'corrective',
      triggers: ['Population > 200 per plant', 'Webbing visible'],
      actions: [
        {
          step: 1,
          action: 'Isolate affected plants',
          timing: 'Immediate',
        },
        {
          step: 2,
          action: 'Release P. persimilis (2000 per zone)',
          timing: 'Within 24 hours',
        },
        {
          step: 3,
          action: 'Apply horticultural oil spray',
          timing: '48 hours after release',
          products: ['Neem oil 2%']
        }
      ],
      status: 'active',
      effectiveness: 85
    },
    {
      id: 'protocol-2',
      name: 'Weekly Preventive Protocol',
      type: 'preventive',
      triggers: ['Every Monday', 'After new plant introduction'],
      actions: [
        {
          step: 1,
          action: 'Visual inspection all zones',
          timing: '08:00 AM',
        },
        {
          step: 2,
          action: 'Check and replace sticky traps',
          timing: '09:00 AM',
        },
        {
          step: 3,
          action: 'Apply preventive beneficial release',
          timing: 'As needed',
        }
      ],
      status: 'scheduled',
      effectiveness: 94
    }
  ]

  // Trap monitoring data
  const trapData: TrapData[] = [
    {
      id: 'trap-1',
      type: 'Yellow Sticky',
      location: 'Veg Zone 1 - NW Corner',
      catchCount: 34,
      trend: 'stable',
      lastChecked: '2 days ago',
      needsReplacement: false
    },
    {
      id: 'trap-2',
      type: 'Blue Sticky',
      location: 'Flower A - Center',
      catchCount: 89,
      trend: 'up',
      lastChecked: '1 day ago',
      needsReplacement: true
    },
    {
      id: 'trap-3',
      type: 'Pheromone',
      location: 'Flower B - Entry',
      catchCount: 12,
      trend: 'down',
      lastChecked: '3 days ago',
      needsReplacement: false
    }
  ]

  // Spray schedule
  const spraySchedule: SpraySchedule[] = [
    {
      id: 'spray-1',
      product: 'Neem Oil',
      type: 'organic',
      zones: ['flower-a', 'flower-b'],
      scheduledDate: '2024-01-18',
      interval: 'Weekly',
      lastApplication: '2024-01-11',
      rei: 4,
      phi: 0
    },
    {
      id: 'spray-2',
      product: 'Beauveria bassiana',
      type: 'biological',
      zones: ['veg-1', 'veg-2'],
      scheduledDate: '2024-01-20',
      interval: 'Bi-weekly',
      lastApplication: '2024-01-06',
      rei: 0,
      phi: 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Automated IPM System</h2>
            <p className="text-sm text-gray-400 mt-1">
              Integrated pest management with biological controls
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Set Alerts
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Emergency Protocol
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['overview', 'threats', 'protocols', 'schedule'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Dashboard */}
      {activeView === 'overview' && (
        <>
          {/* IPM Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">IPM Health</h4>
              </div>
              <p className="text-3xl font-bold text-white">92%</p>
              <p className="text-sm text-green-400">Excellent Control</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-white">Active Threats</h4>
              </div>
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm text-yellow-400">1 High Risk</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Beneficials</h4>
              </div>
              <p className="text-3xl font-bold text-white">9.2k</p>
              <p className="text-sm text-blue-400">Active Population</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Effectiveness</h4>
              </div>
              <p className="text-3xl font-bold text-white">88%</p>
              <p className="text-sm text-purple-400">Control Rate</p>
            </div>
          </div>

          {/* Current Threats Overview */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Pest Pressure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pestThreats.map((threat) => (
                <div
                  key={threat.id}
                  className={`p-4 rounded-lg border ${
                    threat.riskLevel === 'critical' ? 'bg-red-900/20 border-red-800' :
                    threat.riskLevel === 'high' ? 'bg-orange-900/20 border-orange-800' :
                    threat.riskLevel === 'medium' ? 'bg-yellow-900/20 border-yellow-800' :
                    'bg-green-900/20 border-green-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{threat.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      threat.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                      threat.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      threat.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {threat.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 italic mb-2">{threat.scientificName}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Population</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{threat.populationLevel}</span>
                        <TrendingUp className={`w-3 h-3 ${
                          threat.trend === 'increasing' ? 'text-red-400' :
                          threat.trend === 'decreasing' ? 'text-green-400' :
                          'text-gray-400'
                        } ${threat.trend === 'decreasing' ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zones</span>
                      <span className="text-white">{threat.affectedZones.length} affected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last seen</span>
                      <span className="text-white">{threat.lastDetected}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beneficial Insects Status */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Beneficial Insects</h3>
            <div className="space-y-3">
              {beneficials.map((beneficial) => (
                <div key={beneficial.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{beneficial.name}</h4>
                      <p className="text-sm text-gray-400">Targets: {beneficial.targetPests.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Population</p>
                      <p className="font-medium text-white">{beneficial.populationLevel.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Effectiveness</p>
                      <p className="font-medium text-green-400">{beneficial.effectiveness}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Next Release</p>
                      <p className="font-medium text-white">{beneficial.nextRelease}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Threats Detail View */}
      {activeView === 'threats' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pest Threat Analysis</h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Zones</option>
                <option value="prop-a">Propagation A</option>
                <option value="veg-1">Vegetative 1</option>
                <option value="flower-a">Flowering A</option>
                <option value="flower-b">Flowering B</option>
              </select>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Trap Monitoring Grid */}
          <div className="mb-6">
            <h4 className="font-medium text-white mb-3">Trap Monitoring</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trapData.map((trap) => (
                <div key={trap.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{trap.location}</span>
                    </div>
                    {trap.needsReplacement && (
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                        Replace
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{trap.type}</p>
                      <p className="text-2xl font-bold text-white">{trap.catchCount}</p>
                    </div>
                    <TrendingUp className={`w-5 h-5 ${
                      trap.trend === 'up' ? 'text-red-400' :
                      trap.trend === 'down' ? 'text-green-400 rotate-180' :
                      'text-gray-400 rotate-90'
                    }`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Checked {trap.lastChecked}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Trend Chart */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium text-white mb-3">Pest Population Trends</h4>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <BarChart3 className="w-16 h-16" />
              <p className="ml-4">Population trend chart would display here</p>
            </div>
          </div>
        </div>
      )}

      {/* Protocols View */}
      {activeView === 'protocols' && (
        <div className="space-y-6">
          {protocols.map((protocol) => (
            <div key={protocol.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{protocol.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      protocol.type === 'preventive' ? 'bg-blue-500/20 text-blue-400' :
                      protocol.type === 'corrective' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {protocol.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      protocol.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      protocol.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {protocol.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {protocol.effectiveness}% effective
                    </span>
                  </div>
                </div>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Triggers:</h4>
                <div className="flex flex-wrap gap-2">
                  {protocol.triggers.map((trigger, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-300">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Action Steps:</h4>
                <div className="space-y-2">
                  {protocol.actions.map((action) => (
                    <div key={action.step} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{action.step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{action.action}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {action.timing}
                          </span>
                          {action.products && (
                            <span className="text-sm text-gray-400">
                              <Droplets className="w-3 h-3 inline mr-1" />
                              {action.products.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">IPM Schedule</h3>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Add Treatment
            </button>
          </div>

          <div className="space-y-4">
            {spraySchedule.map((schedule) => (
              <div key={schedule.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{schedule.product}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        schedule.type === 'organic' ? 'bg-green-500/20 text-green-400' :
                        schedule.type === 'biological' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {schedule.type}
                      </span>
                      <span className="text-sm text-gray-400">
                        Zones: {schedule.zones.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Next Application</p>
                    <p className="font-medium text-white">{schedule.scheduledDate}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Interval</span>
                    <p className="text-white">{schedule.interval}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Applied</span>
                    <p className="text-white">{schedule.lastApplication}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">REI</span>
                    <p className="text-white">{schedule.rei} hours</p>
                  </div>
                  <div>
                    <span className="text-gray-400">PHI</span>
                    <p className="text-white">{schedule.phi} days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Compliance Notice</h4>
                <p className="text-sm text-gray-300">
                  All applications follow EPA guidelines and state regulations. 
                  REI (Re-entry Interval) and PHI (Pre-harvest Interval) must be strictly observed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}