"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  HardHat,
  Eye,
  Zap,
  Thermometer,
  Wind,
  Heart,
  Clock,
  FileText,
  Camera,
  TrendingUp,
  Calendar,
  MapPin,
  Wrench,
  ArrowRight,
  Info,
  Download,
  Plus,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SafetyIncident {
  id: string
  date: string
  type: 'injury' | 'near-miss' | 'hazard' | 'violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  employee: string
  status: 'open' | 'investigating' | 'resolved'
  corrective_actions?: string[]
}

interface SafetyMetric {
  label: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface SafetyTraining {
  id: string
  name: string
  type: 'required' | 'optional' | 'certification'
  duration: string
  employees_completed: number
  total_employees: number
  due_date?: string
  description: string
}

interface ErgonomicAssessment {
  id: string
  workstation: string
  employee: string
  date: string
  risk_level: 'low' | 'medium' | 'high'
  issues: string[]
  recommendations: string[]
  status: 'pending' | 'in-progress' | 'completed'
}

export function WorkplaceSafetyModule() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'incidents' | 'training' | 'ergonomics' | 'compliance'>('dashboard')

  // Sample data
  const safetyMetrics: SafetyMetric[] = [
    { label: 'Days Without Injury', value: 127, target: 365, unit: 'days', trend: 'up', color: '#10B981' },
    { label: 'Safety Score', value: 94, target: 95, unit: '%', trend: 'up', color: '#3B82F6' },
    { label: 'Training Completion', value: 87, target: 100, unit: '%', trend: 'up', color: '#8B5CF6' },
    { label: 'Near Miss Reports', value: 23, target: 30, unit: 'reports', trend: 'down', color: '#F59E0B' },
    { label: 'PPE Compliance', value: 96, target: 100, unit: '%', trend: 'stable', color: '#EF4444' },
    { label: 'Ergonomic Risk Score', value: 2.3, target: 2.0, unit: 'score', trend: 'down', color: '#06B6D4' }
  ]

  const recentIncidents: SafetyIncident[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'near-miss',
      severity: 'medium',
      location: 'Tier 3 - Section A',
      description: 'Employee almost slipped on wet floor near hydroponic system',
      employee: 'John Smith',
      status: 'resolved',
      corrective_actions: ['Installed additional drainage', 'Added slip-resistant mats', 'Updated cleaning protocols']
    },
    {
      id: '2',
      date: '2024-01-12',
      type: 'injury',
      severity: 'low',
      location: 'Packaging Area',
      description: 'Minor cut from packaging equipment',
      employee: 'Sarah Johnson',
      status: 'resolved',
      corrective_actions: ['Equipment maintenance completed', 'Safety guard installed']
    },
    {
      id: '3',
      date: '2024-01-10',
      type: 'hazard',
      severity: 'high',
      location: 'Electrical Panel Room',
      description: 'Exposed electrical wiring near water source',
      employee: 'Mike Davis',
      status: 'investigating'
    }
  ]

  const safetyTrainings: SafetyTraining[] = [
    {
      id: '1',
      name: 'Vertical Farming Safety Fundamentals',
      type: 'required',
      duration: '4 hours',
      employees_completed: 34,
      total_employees: 40,
      due_date: '2024-02-01',
      description: 'Basic safety protocols for vertical farming operations'
    },
    {
      id: '2',
      name: 'Electrical Safety & Lockout/Tagout',
      type: 'required',
      duration: '2 hours',
      employees_completed: 28,
      total_employees: 40,
      due_date: '2024-01-30',
      description: 'Safety procedures for electrical systems and equipment'
    },
    {
      id: '3',
      name: 'Ergonomics in Agriculture',
      type: 'optional',
      duration: '3 hours',
      employees_completed: 15,
      total_employees: 40,
      description: 'Preventing musculoskeletal injuries in farming operations'
    },
    {
      id: '4',
      name: 'Chemical Handling & Storage',
      type: 'certification',
      duration: '6 hours',
      employees_completed: 12,
      total_employees: 15,
      due_date: '2024-03-15',
      description: 'Safe handling of nutrients, pesticides, and cleaning chemicals'
    }
  ]

  const ergonomicAssessments: ErgonomicAssessment[] = [
    {
      id: '1',
      workstation: 'Planting Station A',
      employee: 'Lisa Chen',
      date: '2024-01-14',
      risk_level: 'medium',
      issues: ['Repetitive bending', 'Reaching overhead', 'Standing for long periods'],
      recommendations: ['Adjustable work surface', 'Anti-fatigue mats', 'Rotation schedule'],
      status: 'in-progress'
    },
    {
      id: '2',
      workstation: 'Harvesting Platform B',
      employee: 'Tom Wilson',
      date: '2024-01-12',
      risk_level: 'high',
      issues: ['Heavy lifting', 'Awkward postures', 'Vibration exposure'],
      recommendations: ['Mechanical lift assist', 'Ergonomic tools', 'Job rotation'],
      status: 'pending'
    },
    {
      id: '3',
      workstation: 'Packaging Line',
      employee: 'Anna Rodriguez',
      date: '2024-01-10',
      risk_level: 'low',
      issues: ['Minor repetitive strain'],
      recommendations: ['Wrist supports', 'Regular breaks'],
      status: 'completed'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'open': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Workplace Safety & Ergonomics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive safety management for vertical farming operations
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Incident
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'incidents', name: 'Incidents', icon: AlertTriangle },
              { id: 'training', name: 'Training', icon: Users },
              { id: 'ergonomics', name: 'Ergonomics', icon: Heart },
              { id: 'compliance', name: 'Compliance', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Safety Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safetyMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-500">{metric.label}</h3>
                          <div className={`p-2 rounded-full`} style={{ backgroundColor: `${metric.color}20` }}>
                            <div className="w-4 h-4" style={{ backgroundColor: metric.color }} />
                          </div>
                        </div>
                        <div className="flex items-baseline">
                          <p className="text-3xl font-bold" style={{ color: metric.color }}>
                            {metric.value}
                          </p>
                          <p className="ml-2 text-sm text-gray-500">{metric.unit}</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Target: {metric.target}{metric.unit}</span>
                            <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={(metric.value / metric.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Recent Safety Incidents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentIncidents.slice(0, 3).map((incident) => (
                          <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getSeverityColor(incident.severity)}>
                                  {incident.severity}
                                </Badge>
                                <Badge variant="outline">{incident.type}</Badge>
                                <span className="text-sm text-gray-500">{incident.date}</span>
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white mb-1">
                                {incident.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                Location: {incident.location} • Employee: {incident.employee}
                              </p>
                            </div>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        View All Incidents
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Safety Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          3 employees due for safety recertification this week
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Monthly safety inspection scheduled for tomorrow
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Camera className="w-4 h-4 mr-2" />
                        Report Incident
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Schedule Training
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Heart className="w-4 h-4 mr-2" />
                        Ergonomic Assessment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'training' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {safetyTrainings.map((training) => (
                  <Card key={training.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant={training.type === 'required' ? 'destructive' : training.type === 'certification' ? 'default' : 'secondary'}>
                          {training.type}
                        </Badge>
                        <span className="text-sm text-gray-500">{training.duration}</span>
                      </div>
                      <CardTitle className="text-lg">{training.name}</CardTitle>
                      <CardDescription>{training.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{training.employees_completed}/{training.total_employees}</span>
                          </div>
                          <Progress 
                            value={(training.employees_completed / training.total_employees) * 100}
                            className="h-2"
                          />
                        </div>
                        {training.due_date && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            Due: {training.due_date}
                          </div>
                        )}
                        <Button className="w-full">
                          Manage Training
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ergonomics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ergonomicAssessments.map((assessment) => (
                  <Card key={assessment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{assessment.workstation}</CardTitle>
                        <Badge className={getRiskColor(assessment.risk_level)}>
                          {assessment.risk_level} risk
                        </Badge>
                      </div>
                      <CardDescription>
                        Employee: {assessment.employee} • Date: {assessment.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Issues Identified:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {assessment.issues.map((issue, index) => (
                              <li key={index} className="flex items-center">
                                <ArrowRight className="w-3 h-3 mr-2" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {assessment.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}