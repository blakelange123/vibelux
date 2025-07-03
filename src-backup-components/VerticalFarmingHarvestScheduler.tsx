"use client"
import { useState } from 'react'
import {
  Calendar,
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Leaf,
  BarChart3,
  Users,
  Truck
} from 'lucide-react'

interface HarvestSchedule {
  date: string
  rack: string
  crop: string
  quantity: number
  quality: 'A' | 'B' | 'C'
  laborHours: number
  status: 'scheduled' | 'in-progress' | 'completed'
}

interface CropBatch {
  id: string
  rack: string
  crop: string
  plantDate: string
  expectedHarvest: string
  currentStage: string
  health: number
  predictedYield: number
}

interface TeamMember {
  id: string
  name: string
  role: 'Harvester' | 'Supervisor' | 'Quality Control' | 'Packager'
  availability: 'available' | 'busy' | 'off-duty'
  experience: number // years
  productivity: number // units per hour
  currentTask?: string
}

interface TeamAssignment {
  harvestId: string
  teamMembers: string[] // member IDs
  startTime: string
  endTime: string
  notes?: string
}

export function VerticalFarmingHarvestScheduler() {
  const [activeView, setActiveView] = useState<'calendar' | 'batches' | 'analytics'>('calendar')
  const [showTeamScheduler, setShowTeamScheduler] = useState(false)
  const [selectedHarvest, setSelectedHarvest] = useState<HarvestSchedule | null>(null)
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([])
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  
  const harvestSchedule: HarvestSchedule[] = [
    {
      date: '2024-01-15',
      rack: 'A1-A4',
      crop: 'Lettuce - Butterhead',
      quantity: 480,
      quality: 'A',
      laborHours: 4,
      status: 'scheduled'
    },
    {
      date: '2024-01-16',
      rack: 'B1-B3',
      crop: 'Basil - Genovese',
      quantity: 320,
      quality: 'A',
      laborHours: 3,
      status: 'scheduled'
    },
    {
      date: '2024-01-17',
      rack: 'C1-C5',
      crop: 'Spinach - Baby',
      quantity: 600,
      quality: 'B',
      laborHours: 5,
      status: 'scheduled'
    },
    {
      date: '2024-01-18',
      rack: 'D1-D2',
      crop: 'Kale - Curly',
      quantity: 280,
      quality: 'A',
      laborHours: 3,
      status: 'scheduled'
    }
  ]

  const cropBatches: CropBatch[] = [
    {
      id: 'B001',
      rack: 'A1-A4',
      crop: 'Lettuce - Butterhead',
      plantDate: '2023-12-01',
      expectedHarvest: '2024-01-15',
      currentStage: 'Mature',
      health: 95,
      predictedYield: 480
    },
    {
      id: 'B002',
      rack: 'B1-B3',
      crop: 'Basil - Genovese',
      plantDate: '2023-12-10',
      expectedHarvest: '2024-01-16',
      currentStage: 'Flowering',
      health: 88,
      predictedYield: 320
    },
    {
      id: 'B003',
      rack: 'E1-E6',
      crop: 'Tomatoes - Cherry',
      plantDate: '2023-11-15',
      expectedHarvest: '2024-02-01',
      currentStage: 'Fruiting',
      health: 92,
      predictedYield: 750
    }
  ]

  const weeklyMetrics = {
    totalHarvest: 2180,
    laborHours: 28,
    averageQuality: 92,
    fulfillmentRate: 98
  }

  const teamMembers: TeamMember[] = [
    {
      id: 'tm1',
      name: 'Sarah Johnson',
      role: 'Supervisor',
      availability: 'available',
      experience: 5,
      productivity: 150,
      currentTask: undefined
    },
    {
      id: 'tm2',
      name: 'Mike Chen',
      role: 'Harvester',
      availability: 'available',
      experience: 3,
      productivity: 120,
      currentTask: undefined
    },
    {
      id: 'tm3',
      name: 'Emily Rodriguez',
      role: 'Harvester',
      availability: 'busy',
      experience: 2,
      productivity: 100,
      currentTask: 'Rack B1-B3 Harvest'
    },
    {
      id: 'tm4',
      name: 'James Wilson',
      role: 'Quality Control',
      availability: 'available',
      experience: 4,
      productivity: 80,
      currentTask: undefined
    },
    {
      id: 'tm5',
      name: 'Lisa Park',
      role: 'Packager',
      availability: 'available',
      experience: 2,
      productivity: 90,
      currentTask: undefined
    },
    {
      id: 'tm6',
      name: 'David Brown',
      role: 'Harvester',
      availability: 'off-duty',
      experience: 1,
      productivity: 85,
      currentTask: undefined
    }
  ]

  const handleScheduleTeam = (harvest: HarvestSchedule) => {
    setSelectedHarvest(harvest)
    setSelectedTeamMembers([])
    setShowTeamScheduler(true)
  }

  const handleAssignTeam = () => {
    if (!selectedHarvest || selectedTeamMembers.length === 0) {
      alert('Please select at least one team member')
      return
    }

    const assignment: TeamAssignment = {
      harvestId: `${selectedHarvest.date}-${selectedHarvest.rack}`,
      teamMembers: selectedTeamMembers,
      startTime: '08:00',
      endTime: '12:00',
      notes: ''
    }

    setTeamAssignments(prev => [...prev, assignment])
    setShowTeamScheduler(false)
    alert(`Team assigned successfully to ${selectedHarvest.crop} harvest!`)
  }

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const getAssignedTeam = (harvest: HarvestSchedule) => {
    const assignment = teamAssignments.find(
      a => a.harvestId === `${harvest.date}-${harvest.rack}`
    )
    if (!assignment) return []
    
    return assignment.teamMembers.map(id => 
      teamMembers.find(m => m.id === id)
    ).filter(Boolean)
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Harvest Scheduler</h2>
            <p className="text-gray-400">AI-powered harvest prediction & planning</p>
          </div>
        </div>
        
        {/* View Switcher */}
        <div className="flex gap-2">
          {[
            { id: 'calendar', label: 'Schedule', icon: Calendar },
            { id: 'batches', label: 'Crop Batches', icon: Leaf },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeView === view.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="space-y-6">
          {/* Weekly Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-green-400" />
                <span className="text-xs text-green-400">+12%</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.totalHarvest}</p>
              <p className="text-sm text-gray-400">Units This Week</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-blue-400">Optimal</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.laborHours}h</p>
              <p className="text-sm text-gray-400">Labor Hours</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-purple-400">Grade A</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.averageQuality}%</p>
              <p className="text-sm text-gray-400">Avg Quality</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Truck className="w-5 h-5 text-orange-400" />
                <span className="text-xs text-orange-400">On Track</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.fulfillmentRate}%</p>
              <p className="text-sm text-gray-400">Fulfillment</p>
            </div>
          </div>

          {/* Harvest Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Upcoming Harvests</h3>
            <div className="space-y-3">
              {harvestSchedule.map((harvest, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          {new Date(harvest.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {new Date(harvest.date).getDate()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(harvest.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{harvest.crop}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Rack: {harvest.rack}</span>
                          <span>{harvest.quantity} units</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            harvest.quality === 'A' ? 'bg-green-500/20 text-green-400' :
                            harvest.quality === 'B' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            Grade {harvest.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Labor</p>
                        <p className="font-medium text-white">{harvest.laborHours}h</p>
                      </div>
                      <button 
                        onClick={() => handleScheduleTeam(harvest)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        {getAssignedTeam(harvest).length > 0 ? (
                          <span>Team ({getAssignedTeam(harvest).length})</span>
                        ) : (
                          <span>Schedule Team</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Crop Batches View */}
      {activeView === 'batches' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {cropBatches.map(batch => (
              <div key={batch.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2">
                      {batch.crop}
                      <span className="text-xs text-gray-500">#{batch.id}</span>
                    </h4>
                    <p className="text-sm text-gray-400">Rack: {batch.rack}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    batch.currentStage === 'Mature' ? 'bg-green-500/20 text-green-400' :
                    batch.currentStage === 'Flowering' ? 'bg-purple-500/20 text-purple-400' :
                    batch.currentStage === 'Fruiting' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {batch.currentStage}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Planted</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(batch.plantDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Harvest</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(batch.expectedHarvest).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Health Score</p>
                    <p className="text-sm font-medium text-white">{batch.health}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Predicted Yield</p>
                    <p className="text-sm font-medium text-white">{batch.predictedYield} units</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                    style={{ width: `${batch.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Harvest Predictions</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="w-16 h-16 text-gray-700" />
              <p className="ml-4">Yield prediction chart would be displayed here</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Quality Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Grade A</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <span className="text-sm text-white">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Grade B</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-sm text-white">20%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Grade C</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '5%' }} />
                    </div>
                    <span className="text-sm text-white">5%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Labor Efficiency</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">78</p>
                <p className="text-sm text-gray-400">units/hour</p>
                <p className="text-xs text-green-400 mt-2">+15% vs last month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Scheduler Modal */}
      {showTeamScheduler && selectedHarvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Schedule Team</h2>
                <p className="text-gray-400 mt-1">
                  Assign team members to {selectedHarvest.crop} harvest on {selectedHarvest.date}
                </p>
              </div>
              <button 
                onClick={() => setShowTeamScheduler(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Harvest Details */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Harvest Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Rack</p>
                  <p className="text-white font-medium">{selectedHarvest.rack}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="text-white font-medium">{selectedHarvest.quantity} units</p>
                </div>
                <div>
                  <p className="text-gray-500">Est. Labor</p>
                  <p className="text-white font-medium">{selectedHarvest.laborHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-500">Quality Target</p>
                  <p className="text-white font-medium">Grade {selectedHarvest.quality}</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Available Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map(member => {
                  const isSelected = selectedTeamMembers.includes(member.id)
                  const isAvailable = member.availability === 'available'
                  
                  return (
                    <div
                      key={member.id}
                      onClick={() => isAvailable && toggleTeamMember(member.id)}
                      className={`
                        border rounded-lg p-4 transition-all cursor-pointer
                        ${isSelected 
                          ? 'bg-green-900/20 border-green-600' 
                          : 'bg-gray-800 border-gray-700'
                        }
                        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              member.availability === 'available' ? 'bg-green-400' :
                              member.availability === 'busy' ? 'bg-yellow-400' :
                              'bg-gray-400'
                            }`} />
                            <h4 className="font-medium text-white">{member.name}</h4>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{member.role}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-gray-500">
                              {member.experience} yrs exp
                            </span>
                            <span className="text-gray-500">
                              {member.productivity} units/hr
                            </span>
                          </div>
                          {member.currentTask && (
                            <p className="text-xs text-yellow-400 mt-2">
                              Currently: {member.currentTask}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected Team Summary */}
            {selectedTeamMembers.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Team Summary</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTeamMembers.map(id => {
                    const member = teamMembers.find(m => m.id === id)
                    if (!member) return null
                    return (
                      <span key={id} className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">
                        {member.name} ({member.role})
                      </span>
                    )
                  })}
                </div>
                <div className="text-sm text-gray-400">
                  Total productivity: {
                    selectedTeamMembers.reduce((sum, id) => {
                      const member = teamMembers.find(m => m.id === id)
                      return sum + (member?.productivity || 0)
                    }, 0)
                  } units/hr
                </div>
              </div>
            )}

            {/* Time Slots */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Schedule Time</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Start Time</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">End Time</label>
                  <input
                    type="time"
                    defaultValue="12:00"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
              <textarea
                placeholder="Special instructions or notes..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={handleAssignTeam}
                disabled={selectedTeamMembers.length === 0}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                Assign Team ({selectedTeamMembers.length} members)
              </button>
              <button 
                onClick={() => setShowTeamScheduler(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}