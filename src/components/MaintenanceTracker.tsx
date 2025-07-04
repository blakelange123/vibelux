"use client"
import { useState, useEffect } from 'react'
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  Wrench,
  DollarSign,
  BarChart3,
  FileText,
  Plus,
  Filter,
  Download,
  Settings,
  AlertTriangle,
  Info,
  Shield,
  RefreshCw,
  Zap,
  X
} from 'lucide-react'

interface MaintenanceTask {
  id: string
  fixtureId: string
  fixtureName: string
  taskType: 'cleaning' | 'inspection' | 'replacement' | 'calibration'
  description: string
  dueDate: Date
  lastCompleted?: Date
  frequency: number // days
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'overdue' | 'completed'
  estimatedTime: number // minutes
  cost?: number
}

interface Fixture {
  id: string
  name: string
  model: string
  manufacturer: string
  installDate: Date
  initialLumens: number
  currentLumens: number
  l70Hours: number // Hours to 70% lumen maintenance
  l80Hours: number // Hours to 80% lumen maintenance
  l90Hours: number // Hours to 90% lumen maintenance
  operatingHours: number
  warrantyExpiry: Date
  purchaseCost: number
  replacementCost: number
}

interface DepreciationData {
  fixtureId: string
  currentValue: number
  depreciatedAmount: number
  depreciationRate: number // percentage per year
  projectedLifespan: number // years
  salvageValue: number
}

export function MaintenanceTracker() {
  const [fixtures, setFixtures] = useState<Fixture[]>([
    {
      id: '1',
      name: 'Zone 1 - Main Array',
      model: 'SPYDR 2p',
      manufacturer: 'Fluence',
      installDate: new Date('2023-01-15'),
      initialLumens: 45000,
      currentLumens: 43200,
      l70Hours: 50000,
      l80Hours: 36000,
      l90Hours: 25000,
      operatingHours: 8760,
      warrantyExpiry: new Date('2028-01-15'),
      purchaseCost: 1899,
      replacementCost: 2099
    },
    {
      id: '2',
      name: 'Zone 2 - Veg Room',
      model: '1700e LED',
      manufacturer: 'Gavita',
      installDate: new Date('2022-06-01'),
      initialLumens: 48000,
      currentLumens: 44160,
      l70Hours: 50000,
      l80Hours: 35000,
      l90Hours: 24000,
      operatingHours: 14600,
      warrantyExpiry: new Date('2027-06-01'),
      purchaseCost: 1799,
      replacementCost: 1999
    }
  ])

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      fixtureId: '1',
      fixtureName: 'Zone 1 - Main Array',
      taskType: 'cleaning',
      description: 'Clean lens and heat sinks',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastCompleted: new Date(Date.now() - 83 * 24 * 60 * 60 * 1000),
      frequency: 90,
      priority: 'medium',
      status: 'pending',
      estimatedTime: 30,
      cost: 0
    },
    {
      id: '2',
      fixtureId: '2',
      fixtureName: 'Zone 2 - Veg Room',
      taskType: 'inspection',
      description: 'Check driver temperatures and connections',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastCompleted: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000),
      frequency: 180,
      priority: 'high',
      status: 'overdue',
      estimatedTime: 45,
      cost: 0
    }
  ])

  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddTask, setShowAddTask] = useState(false)

  // Calculate lumen depreciation
  const calculateLumenDepreciation = (fixture: Fixture): number => {
    const percentage = (fixture.currentLumens / fixture.initialLumens) * 100
    return 100 - percentage
  }

  // Calculate depreciation value
  const calculateDepreciation = (fixture: Fixture): DepreciationData => {
    const ageYears = (Date.now() - fixture.installDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
    const depreciationRate = 20 // 20% per year (5-year straight line)
    const depreciatedAmount = fixture.purchaseCost * (depreciationRate / 100) * ageYears
    const currentValue = Math.max(fixture.purchaseCost - depreciatedAmount, fixture.purchaseCost * 0.1)
    
    return {
      fixtureId: fixture.id,
      currentValue,
      depreciatedAmount,
      depreciationRate,
      projectedLifespan: 5,
      salvageValue: fixture.purchaseCost * 0.1
    }
  }

  // Calculate L70/L80/L90 predictions
  const calculateLumenMaintenancePrediction = (fixture: Fixture) => {
    const hoursPerYear = 365 * 12 // Assuming 12 hours/day operation
    const currentLumenPercentage = (fixture.currentLumens / fixture.initialLumens) * 100
    
    // Linear interpolation for predictions
    const degradationRate = (100 - currentLumenPercentage) / fixture.operatingHours
    
    const hoursTo90 = currentLumenPercentage > 90 ? (currentLumenPercentage - 90) / degradationRate : 0
    const hoursTo80 = currentLumenPercentage > 80 ? (currentLumenPercentage - 80) / degradationRate : 0
    const hoursTo70 = currentLumenPercentage > 70 ? (currentLumenPercentage - 70) / degradationRate : 0
    
    return {
      l90Date: new Date(Date.now() + hoursTo90 * 60 * 60 * 1000),
      l80Date: new Date(Date.now() + hoursTo80 * 60 * 60 * 1000),
      l70Date: new Date(Date.now() + hoursTo70 * 60 * 60 * 1000),
      yearsTo90: hoursTo90 / hoursPerYear,
      yearsTo80: hoursTo80 / hoursPerYear,
      yearsTo70: hoursTo70 / hoursPerYear
    }
  }

  // Update task statuses
  useEffect(() => {
    const updateStatuses = () => {
      setMaintenanceTasks(tasks =>
        tasks.map(task => {
          const now = new Date()
          if (task.dueDate < now && task.status !== 'completed') {
            return { ...task, status: 'overdue' }
          }
          return task
        })
      )
    }

    updateStatuses()
    const interval = setInterval(updateStatuses, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const getTaskIcon = (type: MaintenanceTask['taskType']) => {
    switch (type) {
      case 'cleaning': return '🧹'
      case 'inspection': return '🔍'
      case 'replacement': return '🔧'
      case 'calibration': return '📏'
    }
  }

  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
    }
  }

  const filteredTasks = maintenanceTasks.filter(task => {
    if (filterStatus === 'all') return true
    return task.status === filterStatus
  })

  const exportMaintenanceReport = () => {
    const report = {
      fixtures: fixtures.map(f => ({
        ...f,
        depreciation: calculateDepreciation(f),
        lumenMaintenance: calculateLumenMaintenancePrediction(f)
      })),
      tasks: maintenanceTasks,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maintenance-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Maintenance & Depreciation Tracker</h1>
          <p className="text-gray-400">Monitor fixture performance, schedule maintenance, and track depreciation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
          <button
            onClick={exportMaintenanceReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Fixtures</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">{fixtures.length}</p>
          <p className="text-xs text-gray-400 mt-1">Active installations</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Pending Tasks</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {maintenanceTasks.filter(t => t.status === 'pending').length}
          </p>
          <p className="text-xs text-red-400 mt-1">
            {maintenanceTasks.filter(t => t.status === 'overdue').length} overdue
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Asset Value</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            ${fixtures.reduce((sum, f) => sum + calculateDepreciation(f).currentValue, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Current book value</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Degradation</span>
            <TrendingDown className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {(fixtures.reduce((sum, f) => sum + calculateLumenDepreciation(f), 0) / fixtures.length).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Lumen depreciation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixture List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Fixtures</h2>
          {fixtures.map(fixture => {
            const depreciation = calculateDepreciation(fixture)
            const lumenLoss = calculateLumenDepreciation(fixture)
            
            return (
              <div
                key={fixture.id}
                className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedFixture?.id === fixture.id ? 'ring-2 ring-purple-500' : 'hover:bg-gray-700'
                }`}
                onClick={() => setSelectedFixture(fixture)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-100">{fixture.name}</h3>
                    <p className="text-sm text-gray-400">{fixture.manufacturer} {fixture.model}</p>
                  </div>
                  {lumenLoss > 20 && (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Operating Hours</p>
                    <p className="text-gray-100 font-medium">{fixture.operatingHours.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Lumen Output</p>
                    <p className="text-gray-100 font-medium">{(100 - lumenLoss).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Book Value</p>
                    <p className="text-gray-100 font-medium">${depreciation.currentValue.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Warranty</p>
                    <p className={`font-medium ${
                      fixture.warrantyExpiry > new Date() ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {fixture.warrantyExpiry > new Date() ? 'Active' : 'Expired'}
                    </p>
                  </div>
                </div>
                
                {/* L70/80/90 Indicator */}
                <div className="mt-3 bg-gray-700 rounded p-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">L90</span>
                    <span className="text-gray-400">L80</span>
                    <span className="text-gray-400">L70</span>
                  </div>
                  <div className="relative h-2 bg-gray-600 rounded-full mt-1">
                    <div
                      className="absolute left-0 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                      style={{ width: `${Math.min((fixture.operatingHours / fixture.l70Hours) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Maintenance Tasks */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100">Maintenance Schedule</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-500 text-gray-100 text-sm"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div key={task.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getTaskIcon(task.taskType)}</div>
                      <div>
                        <h4 className="font-medium text-gray-100">{task.description}</h4>
                        <p className="text-sm text-gray-400">{task.fixtureName}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority} priority
                          </span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime} min
                          </span>
                          {task.cost && task.cost > 0 && (
                            <span className="text-gray-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {task.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        task.status === 'overdue' ? 'text-red-400' :
                        task.status === 'pending' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {task.status === 'overdue' ? 'Overdue' :
                         task.status === 'pending' ? `Due ${new Date(task.dueDate).toLocaleDateString()}` :
                         'Completed'}
                      </p>
                      {task.lastCompleted && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last: {new Date(task.lastCompleted).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {task.status !== 'completed' && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </button>
                      <button className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Reschedule
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fixture Details */}
          {selectedFixture && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">
                Fixture Details - {selectedFixture.name}
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Depreciation Analysis */}
                <div>
                  <h3 className="font-medium text-gray-100 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Depreciation Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchase Cost</span>
                      <span className="text-gray-100">${selectedFixture.purchaseCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Value</span>
                      <span className="text-gray-100">${calculateDepreciation(selectedFixture).currentValue.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Depreciated</span>
                      <span className="text-red-400">-${calculateDepreciation(selectedFixture).depreciatedAmount.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Replacement Cost</span>
                      <span className="text-gray-100">${selectedFixture.replacementCost}</span>
                    </div>
                  </div>
                </div>
                
                {/* Lumen Maintenance */}
                <div>
                  <h3 className="font-medium text-gray-100 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                    Lumen Maintenance Forecast
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Output</span>
                      <span className="text-gray-100">{((selectedFixture.currentLumens / selectedFixture.initialLumens) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">L90 Reached</span>
                      <span className="text-gray-100">{calculateLumenMaintenancePrediction(selectedFixture).yearsTo90.toFixed(1)} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">L80 Reached</span>
                      <span className="text-gray-100">{calculateLumenMaintenancePrediction(selectedFixture).yearsTo80.toFixed(1)} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">L70 Reached</span>
                      <span className="text-gray-100">{calculateLumenMaintenancePrediction(selectedFixture).yearsTo70.toFixed(1)} years</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Maintenance Recommendations
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {calculateLumenDepreciation(selectedFixture) > 10 && (
                    <li>• Consider increasing cleaning frequency to improve light output</li>
                  )}
                  {selectedFixture.operatingHours > selectedFixture.l90Hours && (
                    <li>• Schedule photometric testing to verify actual output</li>
                  )}
                  {calculateDepreciation(selectedFixture).currentValue < selectedFixture.replacementCost * 0.3 && (
                    <li>• Start planning for replacement within next 12-18 months</li>
                  )}
                  <li>• Regular driver temperature checks can extend lifespan</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Maintenance Task</h3>
              <button
                onClick={() => setShowAddTask(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fixture</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  {fixtures.map(fixture => (
                    <option key={fixture.id} value={fixture.id}>
                      {fixture.name} - {fixture.model}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Type</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option value="cleaning">Cleaning</option>
                  <option value="inspection">Inspection</option>
                  <option value="replacement">Replacement</option>
                  <option value="calibration">Calibration</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Enter task description..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Frequency (days)</label>
                  <input
                    type="number"
                    placeholder="90"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Est. Time (min)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cost (optional)</label>
                <input
                  type="number"
                  placeholder="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add logic to create task
                    alert('Task added successfully!');
                    setShowAddTask(false);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}