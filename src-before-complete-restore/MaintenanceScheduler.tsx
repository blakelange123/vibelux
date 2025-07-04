"use client"

import { useState, useMemo } from 'react'
import { 
  Wrench,
  Calendar,
  AlertTriangle,
  Clock,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  BarChart3,
  Info,
  Download,
  Plus,
  Settings
} from 'lucide-react'

interface MaintenanceTask {
  id: string
  type: 'cleaning' | 'inspection' | 'replacement' | 'calibration'
  description: string
  frequency: number // days
  lastCompleted?: Date
  nextDue: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: number // minutes
  cost: number
}

interface FixtureLifecycle {
  id: string
  fixtureName: string
  installDate: Date
  warrantyExpires: Date
  expectedLifespan: number // hours
  currentHours: number
  depreciationRate: number // % per year
  initialCost: number
  currentValue: number
  lumenMaintenance: number // % of initial output
  tasks: MaintenanceTask[]
}

interface MaintenanceSchedulerProps {
  fixtures: {
    id: string
    name: string
    wattage: number
    installDate?: Date
    cost?: number
    warrantyYears?: number
  }[]
  hoursPerDay: number
  className?: string
}

// Standard maintenance intervals
const MAINTENANCE_TEMPLATES = {
  cleaning: {
    frequency: 90, // days
    time: 15, // minutes
    cost: 5,
    description: 'Clean fixture lens and housing'
  },
  inspection: {
    frequency: 180,
    time: 30,
    cost: 10,
    description: 'Inspect connections, drivers, and thermal management'
  },
  calibration: {
    frequency: 365,
    time: 45,
    cost: 25,
    description: 'Calibrate light output and verify spectrum'
  }
}

export function MaintenanceScheduler({
  fixtures,
  hoursPerDay,
  className = ''
}: MaintenanceSchedulerProps) {
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [showDepreciation, setShowDepreciation] = useState(true)
  const [maintenanceHistory, setMaintenanceHistory] = useState<Record<string, Date[]>>({})
  const [laborRate, setLaborRate] = useState(50) // $/hour

  // Calculate fixture lifecycle data
  const fixtureLifecycles = useMemo((): FixtureLifecycle[] => {
    return fixtures.map(fixture => {
      const installDate = fixture.installDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Default 1 year ago
      const daysSinceInstall = Math.floor((Date.now() - installDate.getTime()) / (1000 * 60 * 60 * 24))
      const currentHours = daysSinceInstall * hoursPerDay
      
      // LED typical lifespans
      const expectedLifespan = fixture.wattage > 600 ? 50000 : 60000 // L90 hours
      
      // Calculate depreciation (straight-line over 5 years)
      const depreciationRate = 20 // % per year
      const yearsInService = daysSinceInstall / 365
      const initialCost = fixture.cost || fixture.wattage * 2 // Estimate $2/watt if not provided
      const currentValue = Math.max(initialCost * 0.1, initialCost * (1 - (depreciationRate * yearsInService) / 100))
      
      // Calculate lumen maintenance (typical LED degradation curve)
      const lumenMaintenance = Math.max(70, 100 - (currentHours / expectedLifespan) * 30)
      
      // Generate maintenance tasks
      const tasks: MaintenanceTask[] = []
      
      // Cleaning tasks
      const lastCleaning = maintenanceHistory[`${fixture.id}-cleaning`]?.[0]
      const cleaningDue = lastCleaning 
        ? new Date(lastCleaning.getTime() + MAINTENANCE_TEMPLATES.cleaning.frequency * 24 * 60 * 60 * 1000)
        : new Date()
      
      tasks.push({
        id: `${fixture.id}-cleaning`,
        type: 'cleaning',
        description: MAINTENANCE_TEMPLATES.cleaning.description,
        frequency: MAINTENANCE_TEMPLATES.cleaning.frequency,
        lastCompleted: lastCleaning,
        nextDue: cleaningDue,
        priority: cleaningDue < new Date() ? 'high' : 'medium',
        estimatedTime: MAINTENANCE_TEMPLATES.cleaning.time,
        cost: MAINTENANCE_TEMPLATES.cleaning.cost
      })
      
      // Inspection tasks
      const lastInspection = maintenanceHistory[`${fixture.id}-inspection`]?.[0]
      const inspectionDue = lastInspection
        ? new Date(lastInspection.getTime() + MAINTENANCE_TEMPLATES.inspection.frequency * 24 * 60 * 60 * 1000)
        : new Date(installDate.getTime() + MAINTENANCE_TEMPLATES.inspection.frequency * 24 * 60 * 60 * 1000)
      
      tasks.push({
        id: `${fixture.id}-inspection`,
        type: 'inspection',
        description: MAINTENANCE_TEMPLATES.inspection.description,
        frequency: MAINTENANCE_TEMPLATES.inspection.frequency,
        lastCompleted: lastInspection,
        nextDue: inspectionDue,
        priority: inspectionDue < new Date() ? 'high' : 'low',
        estimatedTime: MAINTENANCE_TEMPLATES.inspection.time,
        cost: MAINTENANCE_TEMPLATES.inspection.cost
      })
      
      // Replacement planning
      if (currentHours > expectedLifespan * 0.8) {
        tasks.push({
          id: `${fixture.id}-replacement`,
          type: 'replacement',
          description: 'Plan fixture replacement - approaching end of life',
          frequency: 0,
          nextDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
          priority: 'critical',
          estimatedTime: 120,
          cost: initialCost
        })
      }
      
      return {
        id: fixture.id,
        fixtureName: fixture.name,
        installDate,
        warrantyExpires: new Date(installDate.getTime() + (fixture.warrantyYears || 5) * 365 * 24 * 60 * 60 * 1000),
        expectedLifespan,
        currentHours,
        depreciationRate,
        initialCost,
        currentValue,
        lumenMaintenance,
        tasks
      }
    })
  }, [fixtures, hoursPerDay, maintenanceHistory])

  // Calculate upcoming maintenance summary
  const maintenanceSummary = useMemo(() => {
    const allTasks = fixtureLifecycles.flatMap(f => f.tasks)
    const overdueTasks = allTasks.filter(t => t.nextDue < new Date())
    const upcomingTasks = allTasks.filter(t => {
      const daysUntilDue = Math.floor((t.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntilDue >= 0 && daysUntilDue <= 30
    })
    
    const totalMaintenanceCost = allTasks.reduce((sum, task) => {
      const laborCost = (task.estimatedTime / 60) * laborRate
      return sum + task.cost + laborCost
    }, 0)
    
    const totalDepreciation = fixtureLifecycles.reduce((sum, f) => {
      return sum + (f.initialCost - f.currentValue)
    }, 0)
    
    return {
      overdueTasks,
      upcomingTasks,
      totalMaintenanceCost,
      totalDepreciation,
      averageLumenMaintenance: fixtureLifecycles.reduce((sum, f) => sum + f.lumenMaintenance, 0) / fixtureLifecycles.length
    }
  }, [fixtureLifecycles, laborRate])

  // Mark task as complete
  const completeTask = (taskId: string) => {
    setMaintenanceHistory(prev => ({
      ...prev,
      [taskId]: [new Date(), ...(prev[taskId] || [])]
    }))
  }

  // Export maintenance report
  const exportReport = () => {
    const report = {
      fixtures: fixtureLifecycles.map(f => ({
        name: f.fixtureName,
        installDate: f.installDate,
        currentHours: f.currentHours,
        lumenMaintenance: f.lumenMaintenance,
        currentValue: f.currentValue,
        upcomingTasks: f.tasks.filter(t => t.nextDue > new Date()).map(t => ({
          type: t.type,
          due: t.nextDue,
          cost: t.cost + (t.estimatedTime / 60) * laborRate
        }))
      })),
      summary: {
        totalFixtures: fixtures.length,
        averageLumenMaintenance: maintenanceSummary.averageLumenMaintenance,
        totalDepreciation: maintenanceSummary.totalDepreciation,
        overdueTasks: maintenanceSummary.overdueTasks.length,
        monthlyMaintenanceBudget: maintenanceSummary.totalMaintenanceCost / 12
      },
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-700/50'
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-700/50'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50'
      case 'low': return 'text-green-400 bg-green-900/30 border-green-700/50'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-700/50'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Wrench className="w-4 h-4" />
      case 'inspection': return <Settings className="w-4 h-4" />
      case 'replacement': return <AlertTriangle className="w-4 h-4" />
      case 'calibration': return <BarChart3 className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Maintenance Scheduler</h3>
            <p className="text-sm text-gray-400">Fixture lifecycle and depreciation tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDepreciation(!showDepreciation)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <DollarSign className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={exportReport}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Maintenance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Overdue Tasks</p>
          <p className={`text-xl font-bold ${maintenanceSummary.overdueTasks.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {maintenanceSummary.overdueTasks.length}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">This Month</p>
          <p className="text-xl font-bold text-yellow-400">
            {maintenanceSummary.upcomingTasks.length}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Avg Output</p>
          <p className="text-xl font-bold text-white">
            {maintenanceSummary.averageLumenMaintenance.toFixed(0)}%
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Total Depreciation</p>
          <p className="text-xl font-bold text-white">
            ${maintenanceSummary.totalDepreciation.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Labor Rate Setting */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white mb-2 block">Labor Rate ($/hour)</label>
        <input
          type="number"
          value={laborRate}
          onChange={(e) => setLaborRate(Number(e.target.value))}
          className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Fixture List */}
      <div className="space-y-4">
        {fixtureLifecycles.map((fixture) => {
          const isExpanded = selectedFixture === fixture.id
          const hasOverdueTasks = fixture.tasks.some(t => t.nextDue < new Date())
          
          return (
            <div
              key={fixture.id}
              className={`bg-gray-900/50 rounded-lg border transition-all ${
                hasOverdueTasks ? 'border-red-700/50' : 'border-gray-700'
              }`}
            >
              {/* Fixture Header */}
              <button
                onClick={() => setSelectedFixture(isExpanded ? null : fixture.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    hasOverdueTasks ? 'bg-red-400' : 'bg-green-400'
                  }`} />
                  <div className="text-left">
                    <h4 className="text-white font-medium">{fixture.fixtureName}</h4>
                    <p className="text-xs text-gray-400">
                      {fixture.currentHours.toLocaleString()} hours • {fixture.lumenMaintenance.toFixed(0)}% output
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {showDepreciation && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Current Value</p>
                      <p className="text-sm font-medium text-white">
                        ${fixture.currentValue.toFixed(0)}
                      </p>
                    </div>
                  )}
                  <Calendar className={`w-5 h-5 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  } text-gray-400`} />
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Lifecycle Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Install Date</span>
                      <p className="text-white">{fixture.installDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Warranty</span>
                      <p className={`${fixture.warrantyExpires > new Date() ? 'text-green-400' : 'text-red-400'}`}>
                        {fixture.warrantyExpires > new Date() ? 'Active' : 'Expired'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Expected Life</span>
                      <p className="text-white">{fixture.expectedLifespan.toLocaleString()} hrs</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Depreciation</span>
                      <p className="text-white">{fixture.depreciationRate}% /year</p>
                    </div>
                  </div>

                  {/* Output Degradation Chart */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-sm font-medium text-white mb-2">Light Output Degradation</p>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                        style={{ width: `${fixture.lumenMaintenance}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>{fixture.lumenMaintenance.toFixed(0)}% Current</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Maintenance Tasks */}
                  <div>
                    <h5 className="text-sm font-medium text-white mb-2">Maintenance Tasks</h5>
                    <div className="space-y-2">
                      {fixture.tasks.map((task) => {
                        const daysUntilDue = Math.floor((task.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        const isOverdue = daysUntilDue < 0
                        
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              getPriorityColor(task.priority)
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {getTaskIcon(task.type)}
                              <div>
                                <p className="text-sm font-medium text-white">{task.description}</p>
                                <p className="text-xs text-gray-400">
                                  {isOverdue 
                                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                                    : `Due in ${daysUntilDue} days`
                                  } • {task.estimatedTime} min • ${(task.cost + (task.estimatedTime / 60) * laborRate).toFixed(0)}
                                </p>
                              </div>
                            </div>
                            
                            {task.type !== 'replacement' && (
                              <button
                                onClick={() => completeTask(task.id)}
                                className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 rounded text-green-400 text-xs transition-all"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Maintenance schedules based on DLC/IES recommendations. Light output degradation 
          follows L90 standards. Depreciation calculated using straight-line method over 5 years.
        </p>
      </div>
    </div>
  )
}