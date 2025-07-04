"use client"

import { useState, useEffect } from 'react'
import { 
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Check,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
  Briefcase,
  UserCheck,
  Timer,
  Award,
  AlertTriangle,
  MessageSquare,
  Settings,
  Filter,
  Plus,
  Edit,
  ChevronRight,
  Star,
  Zap,
  Package,
  Droplets,
  Scissors,
  Leaf,
  Eye,
  RefreshCw,
  Info
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  skills: string[]
  efficiency: number
  tasksToday: number
  tasksCompleted: number
  hoursWorked: number
  status: 'working' | 'break' | 'available' | 'offline'
  currentTask?: string
}

interface Task {
  id: string
  title: string
  type: 'watering' | 'pruning' | 'transplanting' | 'harvesting' | 'cleaning' | 'monitoring' | 'maintenance'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  zone: string
  assignedTo?: string
  estimatedTime: number // minutes
  actualTime?: number
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  dueTime: string
  recurringSchedule?: string
  notes?: string
  completionRate?: number
}

interface WorkSchedule {
  id: string
  employeeId: string
  date: string
  shift: 'morning' | 'afternoon' | 'night'
  startTime: string
  endTime: string
  breaks: { start: string; end: string }[]
  tasks: string[] // task IDs
}

interface PerformanceMetric {
  employeeId: string
  metric: string
  value: number
  trend: 'up' | 'down' | 'stable'
  benchmark: number
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  lastTriggered?: string
  frequency: string
}

export function LaborManagementAutomation() {
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'schedule' | 'team' | 'automation'>('overview')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  
  // Editable labor benchmarks
  const [laborBenchmarks, setLaborBenchmarks] = useState({
    propagation: { hours: 7.4, employees: 2 },
    vegetative: { hours: 3.8, employees: 1 },
    harvest: { hours: 14.6, employees: 4 },
    drying: { hours: 8.4, employees: 3 }
  })
  
  // Editable task time standards (minutes per plant)
  const [taskTimeStandards, setTaskTimeStandards] = useState({
    transplantCutting: 0.08,
    initialHarvestCut: 0.10,
    largeLeafRemoval: 0.33,
    hangOnDryingLines: 0.33,
    takeDownFromLines: 0.08,
    finalTrimMachine: 0.67
  })
  
  // Editable facility metrics
  const [facilityMetrics, setFacilityMetrics] = useState({
    totalPlants: 5000,
    requiredFTEs: 10,
    laborCostPerPlant: 12.50,
    industryAvgCostPerPlant: 15.00,
    automationSavings: 180000,
    hourlyWage: 25
  })
  
  // Editable vertical farming comparison data
  const [verticalFarmingData, setVerticalFarmingData] = useState([
    { id: 1, type: 'Small Container Farm', size: 15, ftes: 0.5, laborPerKg: 18, automation: 'Low' },
    { id: 2, type: 'Medium Warehouse', size: 750, ftes: 8, laborPerKg: 12, automation: 'Medium' },
    { id: 3, type: 'Large Climate Chamber', size: 1000, ftes: 12, laborPerKg: 9, automation: 'High' },
    { id: 4, type: 'Your Facility', size: 465, ftes: 10, laborPerKg: 10.50, automation: 'High', isYours: true }
  ])
  
  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('laborManagementData')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.laborBenchmarks) setLaborBenchmarks(parsed.laborBenchmarks)
        if (parsed.taskTimeStandards) setTaskTimeStandards(parsed.taskTimeStandards)
        if (parsed.facilityMetrics) setFacilityMetrics(parsed.facilityMetrics)
        if (parsed.verticalFarmingData) setVerticalFarmingData(parsed.verticalFarmingData)
      } catch (e) {
        console.error('Failed to load saved data:', e)
      }
    }
  }, [])
  
  // Save data to localStorage
  const saveData = () => {
    const dataToSave = {
      laborBenchmarks,
      taskTimeStandards,
      facilityMetrics,
      verticalFarmingData,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('laborManagementData', JSON.stringify(dataToSave))
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 3000)
  }
  
  // Reset to defaults
  const resetToDefaults = () => {
    setLaborBenchmarks({
      propagation: { hours: 7.4, employees: 2 },
      vegetative: { hours: 3.8, employees: 1 },
      harvest: { hours: 14.6, employees: 4 },
      drying: { hours: 8.4, employees: 3 }
    })
    setTaskTimeStandards({
      transplantCutting: 0.08,
      initialHarvestCut: 0.10,
      largeLeafRemoval: 0.33,
      hangOnDryingLines: 0.33,
      takeDownFromLines: 0.08,
      finalTrimMachine: 0.67
    })
    setFacilityMetrics({
      totalPlants: 5000,
      requiredFTEs: 10,
      laborCostPerPlant: 12.50,
      industryAvgCostPerPlant: 15.00,
      automationSavings: 180000,
      hourlyWage: 25
    })
    setVerticalFarmingData([
      { id: 1, type: 'Small Container Farm', size: 15, ftes: 0.5, laborPerKg: 18, automation: 'Low' },
      { id: 2, type: 'Medium Warehouse', size: 750, ftes: 8, laborPerKg: 12, automation: 'Medium' },
      { id: 3, type: 'Large Climate Chamber', size: 1000, ftes: 12, laborPerKg: 9, automation: 'High' },
      { id: 4, type: 'Your Facility', size: 465, ftes: 10, laborPerKg: 10.50, automation: 'High', isYours: true }
    ])
  }
  
  // Calculate labor metrics based on inputs
  const calculateLaborMetrics = () => {
    // Calculate total labor hours per day
    const totalHoursPerDay = 
      laborBenchmarks.propagation.hours + 
      laborBenchmarks.vegetative.hours + 
      laborBenchmarks.harvest.hours + 
      laborBenchmarks.drying.hours
    
    // Calculate total employees needed
    const totalEmployees = 
      laborBenchmarks.propagation.employees + 
      laborBenchmarks.vegetative.employees + 
      laborBenchmarks.harvest.employees + 
      laborBenchmarks.drying.employees
    
    // Calculate FTEs (assuming 8 hour workday)
    const calculatedFTEs = Math.ceil((totalHoursPerDay / 8))
    
    // Calculate total task time per plant (in minutes)
    const totalTaskTimePerPlant = 
      taskTimeStandards.transplantCutting +
      taskTimeStandards.initialHarvestCut +
      taskTimeStandards.largeLeafRemoval +
      taskTimeStandards.hangOnDryingLines +
      taskTimeStandards.takeDownFromLines +
      taskTimeStandards.finalTrimMachine
    
    // Calculate labor cost per plant
    const laborHoursPerPlant = totalTaskTimePerPlant / 60
    const calculatedCostPerPlant = laborHoursPerPlant * facilityMetrics.hourlyWage
    
    // Calculate annual labor cost and savings
    const annualLaborCost = calculatedFTEs * facilityMetrics.hourlyWage * 2080 // 2080 hours/year
    const industryCost = facilityMetrics.totalPlants * facilityMetrics.industryAvgCostPerPlant
    const yourCost = facilityMetrics.totalPlants * calculatedCostPerPlant
    const calculatedSavings = industryCost - yourCost
    
    // Update facility metrics
    setFacilityMetrics({
      ...facilityMetrics,
      requiredFTEs: calculatedFTEs,
      laborCostPerPlant: Math.round(calculatedCostPerPlant * 100) / 100,
      automationSavings: Math.round(calculatedSavings)
    })
  }

  // Team members
  const teamMembers: TeamMember[] = [
    {
      id: 'emp-001',
      name: 'John Smith',
      role: 'Lead Cultivator',
      skills: ['Pruning', 'IPM', 'Harvesting'],
      efficiency: 94,
      tasksToday: 8,
      tasksCompleted: 6,
      hoursWorked: 5.5,
      status: 'working',
      currentTask: 'Defoliation - Flower Room A'
    },
    {
      id: 'emp-002',
      name: 'Sarah Johnson',
      role: 'Cultivation Tech',
      skills: ['Watering', 'Transplanting', 'Monitoring'],
      efficiency: 88,
      tasksToday: 10,
      tasksCompleted: 7,
      hoursWorked: 6,
      status: 'available'
    },
    {
      id: 'emp-003',
      name: 'Mike Chen',
      role: 'IPM Specialist',
      skills: ['IPM', 'Scouting', 'Treatment'],
      efficiency: 92,
      tasksToday: 6,
      tasksCompleted: 5,
      hoursWorked: 4.5,
      status: 'working',
      currentTask: 'Weekly IPM Inspection - Veg Room'
    },
    {
      id: 'emp-004',
      name: 'Lisa Davis',
      role: 'Harvest Lead',
      skills: ['Harvesting', 'Trimming', 'Drying'],
      efficiency: 96,
      tasksToday: 5,
      tasksCompleted: 4,
      hoursWorked: 5,
      status: 'break'
    }
  ]

  // Today's tasks
  const tasks: Task[] = [
    {
      id: 'task-001',
      title: 'Water Flowering Room A',
      type: 'watering',
      priority: 'high',
      zone: 'Flower A',
      assignedTo: 'emp-002',
      estimatedTime: 45,
      actualTime: 42,
      status: 'completed',
      dueTime: '08:00',
      recurringSchedule: 'Daily',
      completionRate: 100
    },
    {
      id: 'task-002',
      title: 'Defoliation Week 3 Plants',
      type: 'pruning',
      priority: 'medium',
      zone: 'Flower A',
      assignedTo: 'emp-001',
      estimatedTime: 120,
      status: 'in-progress',
      dueTime: '10:00',
      completionRate: 65
    },
    {
      id: 'task-003',
      title: 'IPM Scouting - All Zones',
      type: 'monitoring',
      priority: 'high',
      zone: 'All',
      assignedTo: 'emp-003',
      estimatedTime: 90,
      status: 'in-progress',
      dueTime: '11:00',
      recurringSchedule: 'Weekly',
      completionRate: 80
    },
    {
      id: 'task-004',
      title: 'Harvest Blue Dream - Row 5-8',
      type: 'harvesting',
      priority: 'urgent',
      zone: 'Flower B',
      assignedTo: 'emp-004',
      estimatedTime: 180,
      status: 'pending',
      dueTime: '13:00',
      notes: 'Trichomes at 20% amber'
    },
    {
      id: 'task-005',
      title: 'Transplant Clones to Veg',
      type: 'transplanting',
      priority: 'medium',
      zone: 'Clone Room',
      estimatedTime: 60,
      status: 'pending',
      dueTime: '14:00'
    }
  ]

  // Automation rules
  const automationRules: AutomationRule[] = [
    {
      id: 'auto-001',
      name: 'Daily Task Assignment',
      trigger: 'Every day at 6:00 AM',
      action: 'Assign tasks based on skills and availability',
      enabled: true,
      lastTriggered: 'Today, 6:00 AM',
      frequency: 'Daily'
    },
    {
      id: 'auto-002',
      name: 'Overdue Task Alert',
      trigger: 'Task overdue by 30 minutes',
      action: 'Send notification to supervisor and reassign',
      enabled: true,
      lastTriggered: '2 hours ago',
      frequency: 'As needed'
    },
    {
      id: 'auto-003',
      name: 'Break Reminder',
      trigger: '4 hours continuous work',
      action: 'Send break reminder to employee',
      enabled: true,
      lastTriggered: '1 hour ago',
      frequency: 'As needed'
    },
    {
      id: 'auto-004',
      name: 'Skill-Based Routing',
      trigger: 'New specialized task created',
      action: 'Auto-assign to qualified team member',
      enabled: true,
      lastTriggered: 'Yesterday',
      frequency: 'As needed'
    }
  ]

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    { employeeId: 'emp-001', metric: 'Tasks/Hour', value: 1.45, trend: 'up', benchmark: 1.2 },
    { employeeId: 'emp-001', metric: 'Quality Score', value: 96, trend: 'stable', benchmark: 90 },
    { employeeId: 'emp-002', metric: 'Tasks/Hour', value: 1.17, trend: 'down', benchmark: 1.2 },
    { employeeId: 'emp-002', metric: 'Quality Score', value: 92, trend: 'up', benchmark: 90 }
  ]

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering': return Droplets
      case 'pruning': return Scissors
      case 'transplanting': return Package
      case 'harvesting': return Leaf
      case 'cleaning': return Activity
      case 'monitoring': return Eye
      case 'maintenance': return Settings
      default: return Activity
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-400'
      case 'available': return 'bg-blue-400'
      case 'break': return 'bg-yellow-400'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Labor Management & Task Automation</h2>
            <p className="text-sm text-gray-400 mt-1">
              Optimize workforce efficiency with intelligent task assignment
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Auto-Assign All
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['overview', 'tasks', 'schedule', 'team', 'automation'] as const).map((view) => (
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
                <Users className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">Active Staff</h4>
              </div>
              <p className="text-3xl font-bold text-white">12/16</p>
              <p className="text-sm text-gray-400">75% attendance</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Task Completion</h4>
              </div>
              <p className="text-3xl font-bold text-white">78%</p>
              <p className="text-sm text-blue-400">+5% from yesterday</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Avg Task Time</h4>
              </div>
              <p className="text-3xl font-bold text-white">42min</p>
              <p className="text-sm text-gray-400">vs 45min estimate</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-white">Team Efficiency</h4>
              </div>
              <p className="text-3xl font-bold text-white">92%</p>
              <p className="text-sm text-green-400">Above target</p>
            </div>
          </div>

          {/* Current Activity */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.filter(m => m.status === 'working').map((member) => (
                <div key={member.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-400">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{member.name}</h4>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Current Task</span>
                      <span className="text-white">{member.currentTask}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{member.tasksCompleted}/{member.tasksToday} tasks</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(member.tasksCompleted / member.tasksToday) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Critical Tasks */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Critical Tasks Next 4 Hours</h3>
            <div className="space-y-3">
              {tasks
                .filter(t => t.priority === 'urgent' || t.priority === 'high')
                .slice(0, 3)
                .map((task) => {
                  const TaskIcon = getTaskIcon(task.type)
                  return (
                    <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <TaskIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>{task.zone}</span>
                          <span>Due: {task.dueTime}</span>
                          <span>{task.estimatedTime} min</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.assignedTo ? (
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <span className="text-xs text-purple-400">
                            {teamMembers.find(m => m.id === task.assignedTo)?.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      ) : (
                        <button className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                          Assign
                        </button>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      )}

      {/* Tasks View */}
      {activeView === 'tasks' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Task Management</h3>
            <div className="flex items-center gap-3">
              <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option>All Zones</option>
                <option>Flower A</option>
                <option>Flower B</option>
                <option>Veg Room</option>
                <option>Clone Room</option>
              </select>
              <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const TaskIcon = getTaskIcon(task.type)
              const assignedMember = teamMembers.find(m => m.id === task.assignedTo)
              
              return (
                <div key={task.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <TaskIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>{task.zone}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimatedTime} min
                            </span>
                            {task.recurringSchedule && (
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                {task.recurringSchedule}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {assignedMember ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs text-purple-400">
                                  {assignedMember.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span className="text-sm text-gray-300">{assignedMember.name}</span>
                            </div>
                          ) : (
                            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                              + Assign Staff
                            </button>
                          )}
                          <span className="text-sm text-gray-400">Due: {task.dueTime}</span>
                        </div>

                        {task.status === 'in-progress' && task.completionRate !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${task.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">{task.completionRate}%</span>
                          </div>
                        )}

                        {task.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}

                        {task.status === 'overdue' && (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      {task.notes && (
                        <div className="mt-2 p-2 bg-gray-900 rounded text-sm text-gray-300">
                          {task.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Staff Schedule</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['morning', 'afternoon', 'night'].map((shift) => (
              <div key={shift} className="space-y-3">
                <h4 className="font-medium text-white capitalize">{shift} Shift</h4>
                <div className="space-y-2">
                  {teamMembers
                    .filter((_, idx) => {
                      // Mock shift assignment
                      if (shift === 'morning') return idx < 2
                      if (shift === 'afternoon') return idx >= 2
                      return false
                    })
                    .map((member) => (
                      <div key={member.id} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <span className="text-xs text-purple-400">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.role}</p>
                            </div>
                          </div>
                          <UserCheck className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-xs text-gray-400">
                          {shift === 'morning' ? '6:00 AM - 2:00 PM' : '2:00 PM - 10:00 PM'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Schedule Optimization</h4>
                <p className="text-sm text-gray-300">
                  The system automatically optimizes shift assignments based on task requirements, 
                  employee skills, and labor regulations. Breaks are scheduled every 4 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team View */}
      {activeView === 'team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-400">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{member.name}</h4>
                      <p className="text-sm text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Efficiency Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{member.efficiency}%</span>
                      <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Today's Progress</span>
                    <span className="text-white">{member.tasksCompleted}/{member.tasksToday} tasks</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Hours Worked</span>
                    <span className="text-white">{member.hoursWorked}h</span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <span key={skill} className="text-xs px-2 py-1 bg-gray-800 rounded-lg text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {member.currentTask && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Current Task</p>
                      <p className="text-sm text-white">{member.currentTask}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation View */}
      {activeView === 'automation' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Automation Rules</h3>
            <div className="space-y-4">
              {automationRules.map((rule) => (
                <div key={rule.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{rule.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{rule.trigger}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        className="sr-only peer"
                        readOnly
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{rule.action}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Frequency: {rule.frequency}</span>
                      {rule.lastTriggered && <span>Last triggered: {rule.lastTriggered}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Labor Economics Calculator</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveData}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={resetToDefaults}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            {/* Save notification */}
            {showSaveNotification && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">Settings saved successfully!</span>
              </div>
            )}
            
            {/* CHI Labor Benchmarks */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Industry Labor Benchmarks (CHI Data)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Propagation</p>
                  <input
                    type="number"
                    value={laborBenchmarks.propagation.hours}
                    onChange={(e) => setLaborBenchmarks({...laborBenchmarks, propagation: {...laborBenchmarks.propagation, hours: parseFloat(e.target.value) || 0}})}
                    className="text-lg font-semibold text-white bg-transparent border-b border-gray-600 w-20 mb-1"
                    step="0.1"
                  />
                  <span className="text-lg text-white"> hrs/day</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={laborBenchmarks.propagation.employees}
                      onChange={(e) => setLaborBenchmarks({...laborBenchmarks, propagation: {...laborBenchmarks.propagation, employees: parseInt(e.target.value) || 0}})}
                      className="text-xs text-gray-500 bg-transparent border-b border-gray-700 w-8"
                    />
                    <span className="text-xs text-gray-500">employees avg</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Vegetative</p>
                  <input
                    type="number"
                    value={laborBenchmarks.vegetative.hours}
                    onChange={(e) => setLaborBenchmarks({...laborBenchmarks, vegetative: {...laborBenchmarks.vegetative, hours: parseFloat(e.target.value) || 0}})}
                    className="text-lg font-semibold text-white bg-transparent border-b border-gray-600 w-20 mb-1"
                    step="0.1"
                  />
                  <span className="text-lg text-white"> hrs/day</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={laborBenchmarks.vegetative.employees}
                      onChange={(e) => setLaborBenchmarks({...laborBenchmarks, vegetative: {...laborBenchmarks.vegetative, employees: parseInt(e.target.value) || 0}})}
                      className="text-xs text-gray-500 bg-transparent border-b border-gray-700 w-8"
                    />
                    <span className="text-xs text-gray-500">employees avg</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Harvest</p>
                  <input
                    type="number"
                    value={laborBenchmarks.harvest.hours}
                    onChange={(e) => setLaborBenchmarks({...laborBenchmarks, harvest: {...laborBenchmarks.harvest, hours: parseFloat(e.target.value) || 0}})}
                    className="text-lg font-semibold text-white bg-transparent border-b border-gray-600 w-20 mb-1"
                    step="0.1"
                  />
                  <span className="text-lg text-white"> hrs/day</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={laborBenchmarks.harvest.employees}
                      onChange={(e) => setLaborBenchmarks({...laborBenchmarks, harvest: {...laborBenchmarks.harvest, employees: parseInt(e.target.value) || 0}})}
                      className="text-xs text-gray-500 bg-transparent border-b border-gray-700 w-8"
                    />
                    <span className="text-xs text-gray-500">employees avg</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Drying</p>
                  <input
                    type="number"
                    value={laborBenchmarks.drying.hours}
                    onChange={(e) => setLaborBenchmarks({...laborBenchmarks, drying: {...laborBenchmarks.drying, hours: parseFloat(e.target.value) || 0}})}
                    className="text-lg font-semibold text-white bg-transparent border-b border-gray-600 w-20 mb-1"
                    step="0.1"
                  />
                  <span className="text-lg text-white"> hrs/day</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={laborBenchmarks.drying.employees}
                      onChange={(e) => setLaborBenchmarks({...laborBenchmarks, drying: {...laborBenchmarks.drying, employees: parseInt(e.target.value) || 0}})}
                      className="text-xs text-gray-500 bg-transparent border-b border-gray-700 w-8"
                    />
                    <span className="text-xs text-gray-500">employees avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Time Benchmarks */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Task Time Standards</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-400">Transplant cutting</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={taskTimeStandards.transplantCutting}
                        onChange={(e) => setTaskTimeStandards({...taskTimeStandards, transplantCutting: parseFloat(e.target.value) || 0})}
                        className="text-sm font-medium text-white bg-transparent border-b border-gray-600 w-16 text-right"
                        step="0.01"
                      />
                      <span className="text-sm text-white">min/plant</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-400">Initial harvest cut</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={taskTimeStandards.initialHarvestCut}
                        onChange={(e) => setTaskTimeStandards({...taskTimeStandards, initialHarvestCut: parseFloat(e.target.value) || 0})}
                        className="text-sm font-medium text-white bg-transparent border-b border-gray-600 w-16 text-right"
                        step="0.01"
                      />
                      <span className="text-sm text-white">min/plant</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-400">Large leaf removal</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={taskTimeStandards.largeLeafRemoval}
                        onChange={(e) => setTaskTimeStandards({...taskTimeStandards, largeLeafRemoval: parseFloat(e.target.value) || 0})}
                        className="text-sm font-medium text-white bg-transparent border-b border-gray-600 w-16 text-right"
                        step="0.01"
                      />
                      <span className="text-sm text-white">min/plant</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-400">Hang on drying lines</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={taskTimeStandards.hangOnDryingLines}
                        onChange={(e) => setTaskTimeStandards({...taskTimeStandards, hangOnDryingLines: parseFloat(e.target.value) || 0})}
                        className="text-sm font-medium text-white bg-transparent border-b border-gray-600 w-16 text-right"
                        step="0.01"
                      />
                      <span className="text-sm text-white">min/plant</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-400">Take down from lines</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={taskTimeStandards.takeDownFromLines}
                        onChange={(e) => setTaskTimeStandards({...taskTimeStandards, takeDownFromLines: parseFloat(e.target.value) || 0})}
                        className="text-sm font-medium text-white bg-transparent border-b border-gray-600 w-16 text-right"
                        step="0.01"
                      />
                      <span className="text-sm text-white">min/plant</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-400">Final trim (machine)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={taskTimeStandards.finalTrimMachine}
                        onChange={(e) => setTaskTimeStandards({...taskTimeStandards, finalTrimMachine: parseFloat(e.target.value) || 0})}
                        className="text-sm font-medium text-white bg-transparent border-b border-gray-600 w-16 text-right"
                        step="0.01"
                      />
                      <span className="text-sm text-white">min/plant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Labor Cost Calculator */}
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">Your Facility Labor Metrics</h4>
                <button
                  onClick={calculateLaborMetrics}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                >
                  Calculate
                </button>
              </div>
              
              {/* Input Controls */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-400">Total Plants</label>
                  <input
                    type="number"
                    value={facilityMetrics.totalPlants}
                    onChange={(e) => setFacilityMetrics({...facilityMetrics, totalPlants: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Hourly Wage ($)</label>
                  <input
                    type="number"
                    value={facilityMetrics.hourlyWage}
                    onChange={(e) => setFacilityMetrics({...facilityMetrics, hourlyWage: parseFloat(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                    step="0.50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Industry Avg $/Plant</label>
                  <input
                    type="number"
                    value={facilityMetrics.industryAvgCostPerPlant}
                    onChange={(e) => setFacilityMetrics({...facilityMetrics, industryAvgCostPerPlant: parseFloat(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                    step="0.50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Required FTEs</p>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      value={facilityMetrics.requiredFTEs}
                      onChange={(e) => setFacilityMetrics({...facilityMetrics, requiredFTEs: parseInt(e.target.value) || 0})}
                      className="text-2xl font-bold text-purple-400 bg-transparent border-b border-purple-600 w-16 text-center"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Based on {facilityMetrics.totalPlants.toLocaleString()} plants</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Labor Cost/Plant</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-green-400">$</span>
                    <input
                      type="number"
                      value={facilityMetrics.laborCostPerPlant}
                      onChange={(e) => setFacilityMetrics({...facilityMetrics, laborCostPerPlant: parseFloat(e.target.value) || 0})}
                      className="text-2xl font-bold text-green-400 bg-transparent border-b border-green-600 w-20 text-center"
                      step="0.50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">vs industry avg ${facilityMetrics.industryAvgCostPerPlant}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Automation Savings</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-blue-400">$</span>
                    <input
                      type="number"
                      value={Math.round(facilityMetrics.automationSavings / 1000)}
                      onChange={(e) => setFacilityMetrics({...facilityMetrics, automationSavings: (parseInt(e.target.value) || 0) * 1000})}
                      className="text-2xl font-bold text-blue-400 bg-transparent border-b border-blue-600 w-20 text-center"
                    />
                    <span className="text-2xl font-bold text-blue-400">k/yr</span>
                  </div>
                  <p className="text-xs text-gray-500">With current rules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Farming Labor Comparison */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Vertical Farming Labor Economics</h3>
              <button
                onClick={() => {
                  const newId = Math.max(...verticalFarmingData.map(d => d.id)) + 1
                  setVerticalFarmingData([...verticalFarmingData, {
                    id: newId,
                    type: 'New Farm Type',
                    size: 100,
                    ftes: 1,
                    laborPerKg: 15,
                    automation: 'Low'
                  }])
                }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                + Add Farm Type
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2">Farm Type</th>
                    <th className="text-right py-2">Size (m²)</th>
                    <th className="text-right py-2">FTEs Required</th>
                    <th className="text-right py-2">Labor $/kg</th>
                    <th className="text-right py-2">Automation Level</th>
                    <th className="text-right py-2"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {verticalFarmingData.map((farm) => (
                    <tr key={farm.id} className={`border-b border-gray-700 ${farm.isYours ? 'font-semibold text-purple-400' : ''}`}>
                      <td className="py-2">
                        <input
                          type="text"
                          value={farm.type}
                          onChange={(e) => {
                            setVerticalFarmingData(verticalFarmingData.map(f => 
                              f.id === farm.id ? {...f, type: e.target.value} : f
                            ))
                          }}
                          className={`bg-transparent border-b ${farm.isYours ? 'border-purple-600' : 'border-gray-600'} w-full`}
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          value={farm.size}
                          onChange={(e) => {
                            setVerticalFarmingData(verticalFarmingData.map(f => 
                              f.id === farm.id ? {...f, size: parseInt(e.target.value) || 0} : f
                            ))
                          }}
                          className={`bg-transparent border-b ${farm.isYours ? 'border-purple-600' : 'border-gray-600'} w-20 text-right`}
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          value={farm.ftes}
                          onChange={(e) => {
                            setVerticalFarmingData(verticalFarmingData.map(f => 
                              f.id === farm.id ? {...f, ftes: parseFloat(e.target.value) || 0} : f
                            ))
                          }}
                          step="0.5"
                          className={`bg-transparent border-b ${farm.isYours ? 'border-purple-600' : 'border-gray-600'} w-16 text-right`}
                        />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end">
                          <span>$</span>
                          <input
                            type="number"
                            value={farm.laborPerKg}
                            onChange={(e) => {
                              setVerticalFarmingData(verticalFarmingData.map(f => 
                                f.id === farm.id ? {...f, laborPerKg: parseFloat(e.target.value) || 0} : f
                              ))
                            }}
                            step="0.50"
                            className={`bg-transparent border-b ${farm.isYours ? 'border-purple-600' : 'border-gray-600'} w-16 text-right`}
                          />
                        </div>
                      </td>
                      <td className="text-right">
                        <select
                          value={farm.automation}
                          onChange={(e) => {
                            setVerticalFarmingData(verticalFarmingData.map(f => 
                              f.id === farm.id ? {...f, automation: e.target.value} : f
                            ))
                          }}
                          className={`bg-transparent border-b ${farm.isYours ? 'border-purple-600' : 'border-gray-600'} text-right`}
                        >
                          <option value="Low" className="bg-gray-800">Low</option>
                          <option value="Medium" className="bg-gray-800">Medium</option>
                          <option value="High" className="bg-gray-800">High</option>
                        </select>
                      </td>
                      <td className="text-right">
                        {!farm.isYours && (
                          <button
                            onClick={() => {
                              setVerticalFarmingData(verticalFarmingData.filter(f => f.id !== farm.id))
                            }}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300">
                  {(() => {
                    const yourFacility = verticalFarmingData.find(f => f.isYours)
                    const avgOthers = verticalFarmingData
                      .filter(f => !f.isYours && f.automation === 'Low')
                      .reduce((acc, f) => acc + f.ftes, 0) / verticalFarmingData.filter(f => !f.isYours && f.automation === 'Low').length
                    const savings = avgOthers > 0 ? Math.round(((avgOthers - (yourFacility?.ftes || 0)) / avgOthers) * 100) : 0
                    return `Your automation rules have reduced labor requirements by ${savings}% compared to low automation operations, saving approximately ${Math.round(avgOthers - (yourFacility?.ftes || 0))} FTEs worth of labor costs annually.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}