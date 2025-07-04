"use client"

import { useState } from 'react'
import { 
  Lightbulb,
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Activity,
  BarChart3,
  Shield,
  Settings,
  Download,
  Upload,
  RefreshCw,
  ChevronRight,
  Info,
  Zap,
  Timer,
  Package,
  FileText,
  DollarSign,
  Sun,
  Eye
} from 'lucide-react'

interface Fixture {
  id: string
  model: string
  location: string
  zone: string
  installDate: string
  lastCalibration: string
  nextCalibration: string
  operatingHours: number
  ppfdOutput: number
  originalPpfd: number
  degradation: number
  status: 'optimal' | 'warning' | 'needs-calibration' | 'replace'
  warranty: {
    status: 'active' | 'expired'
    expiryDate: string
    coverage: string
  }
}

interface MaintenanceTask {
  id: string
  type: 'calibration' | 'cleaning' | 'inspection' | 'replacement'
  fixture: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  estimatedTime: number // hours
  cost?: number
  description: string
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed'
  technician?: string
}

interface CalibrationRecord {
  id: string
  fixtureId: string
  date: string
  technician: string
  beforePpfd: number
  afterPpfd: number
  adjustmentMade: boolean
  notes: string
  nextDue: string
}

interface ServiceContract {
  id: string
  provider: string
  type: 'basic' | 'premium' | 'enterprise'
  coverage: string[]
  startDate: string
  endDate: string
  cost: number
  included: {
    calibrations: number
    replacements: number
    responseTime: string
  }
}

export function LightSystemMaintenance() {
  const [activeView, setActiveView] = useState<'overview' | 'fixtures' | 'schedule' | 'history' | 'contracts'>('overview')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false)

  // Fixture inventory
  const fixtures: Fixture[] = [
    {
      id: 'fix-001',
      model: 'VibeGrow Pro 660W',
      location: 'Flower Room A - Row 1',
      zone: 'flower-a',
      installDate: '2022-01-15',
      lastCalibration: '2023-10-15',
      nextCalibration: '2024-04-15',
      operatingHours: 17520,
      ppfdOutput: 612,
      originalPpfd: 650,
      degradation: 5.8,
      status: 'optimal',
      warranty: {
        status: 'active',
        expiryDate: '2027-01-15',
        coverage: 'Full parts and labor'
      }
    },
    {
      id: 'fix-002',
      model: 'VibeGrow Pro 660W',
      location: 'Flower Room A - Row 2',
      zone: 'flower-a',
      installDate: '2022-01-15',
      lastCalibration: '2023-10-15',
      nextCalibration: '2024-04-15',
      operatingHours: 17520,
      ppfdOutput: 595,
      originalPpfd: 650,
      degradation: 8.5,
      status: 'warning',
      warranty: {
        status: 'active',
        expiryDate: '2027-01-15',
        coverage: 'Full parts and labor'
      }
    },
    {
      id: 'fix-003',
      model: 'VibeVeg 320W',
      location: 'Veg Room 1 - Tier 1',
      zone: 'veg-1',
      installDate: '2021-06-01',
      lastCalibration: '2023-06-01',
      nextCalibration: '2024-02-01',
      operatingHours: 22800,
      ppfdOutput: 285,
      originalPpfd: 320,
      degradation: 10.9,
      status: 'needs-calibration',
      warranty: {
        status: 'expired',
        expiryDate: '2023-06-01',
        coverage: 'None'
      }
    },
    {
      id: 'fix-004',
      model: 'VibeGrow Pro 660W',
      location: 'Flower Room B - Row 3',
      zone: 'flower-b',
      installDate: '2020-03-10',
      lastCalibration: '2023-03-10',
      nextCalibration: '2024-03-10',
      operatingHours: 33600,
      ppfdOutput: 520,
      originalPpfd: 650,
      degradation: 20,
      status: 'replace',
      warranty: {
        status: 'expired',
        expiryDate: '2023-03-10',
        coverage: 'None'
      }
    }
  ]

  // Maintenance tasks
  const maintenanceTasks: MaintenanceTask[] = [
    {
      id: 'task-001',
      type: 'calibration',
      fixture: 'Veg Room 1 - All Fixtures',
      priority: 'high',
      dueDate: '2024-02-01',
      estimatedTime: 4,
      cost: 500,
      description: 'Quarterly calibration for vegetative room fixtures',
      status: 'scheduled',
      technician: 'John Smith'
    },
    {
      id: 'task-002',
      type: 'cleaning',
      fixture: 'All Flower Room A',
      priority: 'medium',
      dueDate: '2024-02-15',
      estimatedTime: 2,
      description: 'Monthly lens cleaning and inspection',
      status: 'pending'
    },
    {
      id: 'task-003',
      type: 'replacement',
      fixture: 'Flower Room B - Row 3',
      priority: 'urgent',
      dueDate: '2024-02-05',
      estimatedTime: 1,
      cost: 1200,
      description: 'Replace fixture due to excessive degradation',
      status: 'pending'
    },
    {
      id: 'task-004',
      type: 'inspection',
      fixture: 'All Fixtures',
      priority: 'low',
      dueDate: '2024-03-01',
      estimatedTime: 8,
      description: 'Annual comprehensive system inspection',
      status: 'pending'
    }
  ]

  // Calibration history
  const calibrationRecords: CalibrationRecord[] = [
    {
      id: 'cal-001',
      fixtureId: 'fix-001',
      date: '2023-10-15',
      technician: 'Mike Chen',
      beforePpfd: 625,
      afterPpfd: 640,
      adjustmentMade: true,
      notes: 'Driver current adjusted +2%',
      nextDue: '2024-04-15'
    },
    {
      id: 'cal-002',
      fixtureId: 'fix-002',
      date: '2023-10-15',
      technician: 'Mike Chen',
      beforePpfd: 610,
      afterPpfd: 630,
      adjustmentMade: true,
      notes: 'Driver current adjusted +3%',
      nextDue: '2024-04-15'
    }
  ]

  // Service contracts
  const serviceContracts: ServiceContract[] = [
    {
      id: 'contract-001',
      provider: 'VibeLight Services',
      type: 'premium',
      coverage: ['Calibration', 'Cleaning', 'Priority Support', 'Replacement Discounts'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      cost: 12000,
      included: {
        calibrations: 4,
        replacements: 2,
        responseTime: '24 hours'
      }
    }
  ]

  const calculateSystemHealth = () => {
    const totalFixtures = fixtures.length
    const optimalFixtures = fixtures.filter(f => f.status === 'optimal').length
    return Math.round((optimalFixtures / totalFixtures) * 100)
  }

  const calculateAverageDegradation = () => {
    const totalDegradation = fixtures.reduce((sum, f) => sum + f.degradation, 0)
    return (totalDegradation / fixtures.length).toFixed(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'needs-calibration': return 'text-orange-400 bg-orange-500/20'
      case 'replace': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Light System Calibration & Maintenance</h2>
            <p className="text-sm text-gray-400 mt-1">
              Ensure optimal light output with predictive maintenance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Schedule
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Service
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['overview', 'fixtures', 'schedule', 'history', 'contracts'] as const).map((view) => (
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">System Health</h4>
              </div>
              <p className="text-3xl font-bold text-white">{calculateSystemHealth()}%</p>
              <p className="text-sm text-gray-400">Overall performance</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-white">Avg Degradation</h4>
              </div>
              <p className="text-3xl font-bold text-white">{calculateAverageDegradation()}%</p>
              <p className="text-sm text-gray-400">Light output loss</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Pending Tasks</h4>
              </div>
              <p className="text-3xl font-bold text-white">{maintenanceTasks.filter(t => t.status === 'pending').length}</p>
              <p className="text-sm text-gray-400">Require attention</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Under Warranty</h4>
              </div>
              <p className="text-3xl font-bold text-white">
                {fixtures.filter(f => f.warranty.status === 'active').length}/{fixtures.length}
              </p>
              <p className="text-sm text-gray-400">Fixtures covered</p>
            </div>
          </div>

          {/* Fixture Status Summary */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fixture Status by Zone</h3>
            <div className="space-y-3">
              {['flower-a', 'flower-b', 'veg-1'].map((zone) => {
                const zoneFixtures = fixtures.filter(f => f.zone === zone)
                const avgDegradation = zoneFixtures.reduce((sum, f) => sum + f.degradation, 0) / zoneFixtures.length
                
                return (
                  <div key={zone} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white capitalize">{zone.replace('-', ' ')}</h4>
                      <p className="text-sm text-gray-400">{zoneFixtures.length} fixtures</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Avg Degradation</p>
                        <p className="font-medium text-white">{avgDegradation.toFixed(1)}%</p>
                      </div>
                      <div className="flex gap-2">
                        {zoneFixtures.map((fixture) => (
                          <div
                            key={fixture.id}
                            className={`w-3 h-3 rounded-full ${
                              fixture.status === 'optimal' ? 'bg-green-400' :
                              fixture.status === 'warning' ? 'bg-yellow-400' :
                              fixture.status === 'needs-calibration' ? 'bg-orange-400' :
                              'bg-red-400'
                            }`}
                            title={`${fixture.model} - ${fixture.status}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Maintenance</h3>
            <div className="space-y-3">
              {maintenanceTasks
                .filter(t => t.status !== 'completed')
                .slice(0, 3)
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(task.priority).split(' ')[1]}`}>
                        <Wrench className={`w-5 h-5 ${getPriorityColor(task.priority).split(' ')[0]}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{task.fixture}</h4>
                        <p className="text-sm text-gray-400">{task.type} • {task.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Due</p>
                      <p className="font-medium text-white">{new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Fixtures View */}
      {activeView === 'fixtures' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Fixture Inventory</h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Zones</option>
                <option value="flower-a">Flower Room A</option>
                <option value="flower-b">Flower Room B</option>
                <option value="veg-1">Veg Room 1</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showOnlyWarnings}
                  onChange={(e) => setShowOnlyWarnings(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600"
                />
                Show warnings only
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {fixtures
              .filter(f => selectedZone === 'all' || f.zone === selectedZone)
              .filter(f => !showOnlyWarnings || f.status !== 'optimal')
              .map((fixture) => (
                <div key={fixture.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-white">{fixture.model}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(fixture.status)}`}>
                          {fixture.status.replace('-', ' ')}
                        </span>
                        {fixture.warranty.status === 'active' && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                            Under Warranty
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{fixture.location}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Operating Hours</p>
                      <p className="text-white font-medium">{fixture.operatingHours.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Current Output</p>
                      <p className="text-white font-medium">{fixture.ppfdOutput} PPFD</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Degradation</p>
                      <p className={`font-medium ${
                        fixture.degradation < 10 ? 'text-green-400' :
                        fixture.degradation < 15 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {fixture.degradation}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Next Calibration</p>
                      <p className="text-white font-medium">{new Date(fixture.nextCalibration).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Installed: {new Date(fixture.installDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                          Calibrate
                        </button>
                        <button className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                          Service History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Maintenance Schedule</h3>
          
          <div className="space-y-4">
            {maintenanceTasks.map((task) => (
              <div key={task.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority).split(' ')[1]}`}>
                      {task.type === 'calibration' && <Settings className={`w-5 h-5 ${getPriorityColor(task.priority).split(' ')[0]}`} />}
                      {task.type === 'cleaning' && <Lightbulb className={`w-5 h-5 ${getPriorityColor(task.priority).split(' ')[0]}`} />}
                      {task.type === 'inspection' && <Eye className={`w-5 h-5 ${getPriorityColor(task.priority).split(' ')[0]}`} />}
                      {task.type === 'replacement' && <Package className={`w-5 h-5 ${getPriorityColor(task.priority).split(' ')[0]}`} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white capitalize">{task.type} - {task.fixture}</h4>
                      <p className="text-sm text-gray-400">{task.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                    task.status === 'scheduled' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Due Date</p>
                    <p className="text-white font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Est. Time</p>
                    <p className="text-white font-medium">{task.estimatedTime} hours</p>
                  </div>
                  {task.cost && (
                    <div>
                      <p className="text-gray-400">Cost</p>
                      <p className="text-white font-medium">${task.cost}</p>
                    </div>
                  )}
                  {task.technician && (
                    <div>
                      <p className="text-gray-400">Technician</p>
                      <p className="text-white font-medium">{task.technician}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Predictive Maintenance</h4>
                <p className="text-sm text-gray-300">
                  Our AI system predicts maintenance needs based on operating hours, environmental conditions, 
                  and historical performance data. This helps prevent unexpected failures and maintains optimal light output.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Calibration History</h3>
          
          <div className="space-y-4">
            {calibrationRecords.map((record) => {
              const fixture = fixtures.find(f => f.id === record.fixtureId)
              
              return (
                <div key={record.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{fixture?.model} - {fixture?.location}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Technician: {record.technician}</span>
                      </div>
                    </div>
                    {record.adjustmentMade && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        Adjusted
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Before PPFD</p>
                      <p className="text-white font-medium">{record.beforePpfd} μmol/m²/s</p>
                    </div>
                    <div>
                      <p className="text-gray-400">After PPFD</p>
                      <p className="text-white font-medium">{record.afterPpfd} μmol/m²/s</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Improvement</p>
                      <p className="text-green-400 font-medium">
                        +{((record.afterPpfd - record.beforePpfd) / record.beforePpfd * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {record.notes && (
                    <p className="mt-3 text-sm text-gray-500 italic">Note: {record.notes}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Performance Chart */}
          <div className="mt-6">
            <h4 className="font-medium text-white mb-3">Light Output Trend</h4>
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Light degradation curve would display here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contracts View */}
      {activeView === 'contracts' && (
        <div className="space-y-6">
          {serviceContracts.map((contract) => (
            <div key={contract.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{contract.provider}</h3>
                  <p className="text-sm text-gray-400">{contract.type.charAt(0).toUpperCase() + contract.type.slice(1)} Service Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${contract.cost.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Annual</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Calibrations Included</p>
                  <p className="text-lg font-medium text-white">{contract.included.calibrations}/year</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Replacement Discount</p>
                  <p className="text-lg font-medium text-white">{contract.included.replacements} fixtures</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Response Time</p>
                  <p className="text-lg font-medium text-white">{contract.included.responseTime}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2">Coverage Includes:</h4>
                <div className="flex flex-wrap gap-2">
                  {contract.coverage.map((item, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-gray-800 rounded-full text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Valid: {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                </div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                  Renew Contract
                </button>
              </div>
            </div>
          ))}

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Savings Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium text-white mb-2">With Service Contract</h4>
                <p className="text-sm text-gray-400 mb-2">Annual maintenance cost</p>
                <p className="text-2xl font-bold text-green-400">$12,000</p>
                <p className="text-xs text-gray-500 mt-2">Fixed cost, priority service</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium text-white mb-2">Without Contract</h4>
                <p className="text-sm text-gray-400 mb-2">Estimated annual cost</p>
                <p className="text-2xl font-bold text-red-400">$18,500</p>
                <p className="text-xs text-gray-500 mt-2">Variable cost, standard service</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-800">
              <p className="text-sm text-green-400">
                Annual savings with service contract: <span className="font-bold">$6,500 (35%)</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}