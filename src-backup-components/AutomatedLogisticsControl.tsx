"use client"

import { useState } from 'react'
import { 
  Move,
  Package,
  Clock,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  Layers,
  Grid3x3,
  BarChart3,
  Filter,
  Download,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface PlantBatch {
  id: string
  strain: string
  count: number
  currentZone: string
  dayInZone: number
  nextTransition: string
  priority: 'high' | 'medium' | 'low'
  healthScore: number
}

interface Movement {
  id: string
  batchId: string
  fromZone: string
  toZone: string
  plantCount: number
  scheduledTime: string
  actualTime?: string
  status: 'pending' | 'in-progress' | 'completed' | 'delayed'
  assignedTo?: string
  equipment: string[]
}

interface Zone {
  id: string
  name: string
  capacity: number
  occupied: number
  type: string
  benches: number
  availableBenches: number
}

interface LaborResource {
  id: string
  name: string
  status: 'available' | 'busy' | 'break'
  currentTask?: string
  efficiency: number
}

export function AutomatedLogisticsControl() {
  const [viewMode, setViewMode] = useState<'schedule' | 'map' | 'analytics'>('schedule')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [automationEnabled, setAutomationEnabled] = useState(true)

  // Plant batches
  const batches: PlantBatch[] = [
    {
      id: 'batch-001',
      strain: 'Blue Dream',
      count: 200,
      currentZone: 'prop-a',
      dayInZone: 7,
      nextTransition: '2024-01-15',
      priority: 'high',
      healthScore: 95
    },
    {
      id: 'batch-002',
      strain: 'OG Kush',
      count: 150,
      currentZone: 'veg-1',
      dayInZone: 18,
      nextTransition: '2024-01-17',
      priority: 'medium',
      healthScore: 92
    },
    {
      id: 'batch-003',
      strain: 'Girl Scout Cookies',
      count: 120,
      currentZone: 'flower-a',
      dayInZone: 42,
      nextTransition: '2024-01-25',
      priority: 'low',
      healthScore: 98
    }
  ]

  // Scheduled movements
  const movements: Movement[] = [
    {
      id: 'move-001',
      batchId: 'batch-001',
      fromZone: 'prop-a',
      toZone: 'veg-1',
      plantCount: 200,
      scheduledTime: '2024-01-15 08:00',
      status: 'pending',
      equipment: ['Rolling Bench #3', 'Transport Cart #1']
    },
    {
      id: 'move-002',
      batchId: 'batch-002',
      fromZone: 'veg-1',
      toZone: 'flower-a',
      plantCount: 75,
      scheduledTime: '2024-01-15 10:30',
      status: 'pending',
      assignedTo: 'John D.',
      equipment: ['Rolling Bench #5']
    },
    {
      id: 'move-003',
      batchId: 'batch-004',
      fromZone: 'flower-b',
      toZone: 'harvest',
      plantCount: 100,
      scheduledTime: '2024-01-15 14:00',
      status: 'in-progress',
      assignedTo: 'Sarah M.',
      equipment: ['Harvest Cart #2']
    }
  ]

  // Facility zones
  const zones: Zone[] = [
    { id: 'prop-a', name: 'Propagation A', capacity: 1200, occupied: 800, type: 'propagation', benches: 12, availableBenches: 4 },
    { id: 'veg-1', name: 'Vegetative 1', capacity: 800, occupied: 650, type: 'vegetative', benches: 8, availableBenches: 2 },
    { id: 'flower-a', name: 'Flowering A', capacity: 600, occupied: 580, type: 'flowering', benches: 6, availableBenches: 1 },
    { id: 'flower-b', name: 'Flowering B', capacity: 600, occupied: 500, type: 'flowering', benches: 6, availableBenches: 2 }
  ]

  // Labor resources
  const laborResources: LaborResource[] = [
    { id: 'emp-001', name: 'John D.', status: 'busy', currentTask: 'Moving batch-002', efficiency: 94 },
    { id: 'emp-002', name: 'Sarah M.', status: 'busy', currentTask: 'Harvest prep', efficiency: 98 },
    { id: 'emp-003', name: 'Mike R.', status: 'available', efficiency: 91 },
    { id: 'emp-004', name: 'Lisa K.', status: 'break', efficiency: 96 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Automated Logistics Control</h2>
            <p className="text-sm text-gray-400 mt-1">Optimize plant movement and resource allocation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Automation</span>
              <button
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automationEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Movement
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('schedule')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'schedule'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Schedule View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Facility Map
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'analytics'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Schedule View */}
      {viewMode === 'schedule' && (
        <>
          {/* Today's Movements */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Today's Movements</h3>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {movements.map((movement) => {
                const batch = batches.find(b => b.id === movement.batchId)
                const fromZone = zones.find(z => z.id === movement.fromZone)
                const toZone = zones.find(z => z.id === movement.toZone)
                
                return (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        movement.status === 'completed' ? 'bg-green-500/20' :
                        movement.status === 'in-progress' ? 'bg-blue-500/20' :
                        movement.status === 'delayed' ? 'bg-red-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        <Move className={`w-5 h-5 ${
                          movement.status === 'completed' ? 'text-green-400' :
                          movement.status === 'in-progress' ? 'text-blue-400' :
                          movement.status === 'delayed' ? 'text-red-400' :
                          'text-yellow-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {batch?.strain || 'Unknown Batch'} - {movement.plantCount} plants
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            batch?.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            batch?.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            {batch?.priority || 'low'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>{fromZone?.name} → {toZone?.name}</span>
                          <span>•</span>
                          <span>{movement.scheduledTime}</span>
                          {movement.assignedTo && (
                            <>
                              <span>•</span>
                              <span>{movement.assignedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        movement.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        movement.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                        movement.status === 'delayed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {movement.status}
                      </span>
                      {movement.status === 'pending' && (
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <Play className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      {movement.status === 'in-progress' && (
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <Pause className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Transitions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Transitions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{batch.strain}</h4>
                    <span className="text-xs text-gray-400">Health: {batch.healthScore}%</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plants</span>
                      <span className="text-white">{batch.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Zone</span>
                      <span className="text-white">{zones.find(z => z.id === batch.currentZone)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Day in Zone</span>
                      <span className="text-white">{batch.dayInZone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Next Move</span>
                      <span className="text-yellow-400">{batch.nextTransition}</span>
                    </div>
                  </div>
                  <button className="mt-3 w-full py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm">
                    Schedule Movement
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Facility Map View */}
      {viewMode === 'map' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Facility Layout</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {zones.map((zone) => {
              const utilization = (zone.occupied / zone.capacity) * 100
              return (
                <div
                  key={zone.id}
                  className="relative p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{zone.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      zone.type === 'propagation' ? 'bg-blue-500/20 text-blue-400' :
                      zone.type === 'vegetative' ? 'bg-green-500/20 text-green-400' :
                      zone.type === 'flowering' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {zone.type}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Capacity</span>
                        <span className="text-white">{zone.occupied}/{zone.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            utilization > 90 ? 'bg-red-500' :
                            utilization > 75 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Benches</span>
                        <span className="text-white">{zone.availableBenches}/{zone.benches}</span>
                      </div>
                    </div>
                  </div>
                  {/* Active movements indicator */}
                  {movements.some(m => m.fromZone === zone.id || m.toZone === zone.id) && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Movement Flow Visualization */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium text-white mb-3">Active Movement Flows</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">Propagation</p>
                  <p className="text-xs text-gray-500">4 batches</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-600" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400">Vegetative</p>
                  <p className="text-xs text-gray-500">6 batches</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-600" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">Flowering</p>
                  <p className="text-xs text-gray-500">8 batches</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-600" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-400">Harvest</p>
                  <p className="text-xs text-gray-500">Daily output</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">Movement Efficiency</h4>
              </div>
              <p className="text-2xl font-bold text-white">94.2%</p>
              <p className="text-sm text-green-400">+2.3% from last week</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Avg Transit Time</h4>
              </div>
              <p className="text-2xl font-bold text-white">18 min</p>
              <p className="text-sm text-blue-400">-3 min improvement</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Labor Utilization</h4>
              </div>
              <p className="text-2xl font-bold text-white">87%</p>
              <p className="text-sm text-purple-400">Optimal range</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-white">Daily Movements</h4>
              </div>
              <p className="text-2xl font-bold text-white">32</p>
              <p className="text-sm text-yellow-400">On target</p>
            </div>
          </div>

          {/* Labor Resources */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Labor Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {laborResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{resource.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      resource.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      resource.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  {resource.currentTask && (
                    <p className="text-sm text-gray-400 mb-2">{resource.currentTask}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Efficiency</span>
                    <span className="text-sm font-medium text-white">{resource.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Movement History */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Movement History</h3>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-center text-gray-400">Movement history chart would go here</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}