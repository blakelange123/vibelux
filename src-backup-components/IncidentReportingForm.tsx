"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  User,
  FileText,
  Save,
  Send,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface IncidentReport {
  incidentType: 'injury' | 'near-miss' | 'property-damage' | 'environmental' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  dateTime: string
  location: string
  reportedBy: string
  employeesInvolved: string[]
  witnesses: string[]
  description: string
  immediateActions: string
  rootCause: string
  correctiveActions: string[]
  photos: File[]
  supervisorNotified: boolean
  medicalAttention: boolean
  workRestrictions: boolean
  equipmentInvolved: string
  environmentalFactors: string[]
}

interface IncidentReportingFormProps {
  onSubmit: (report: IncidentReport) => void
  onCancel: () => void
}

export function IncidentReportingForm({ onSubmit, onCancel }: IncidentReportingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [report, setReport] = useState<Partial<IncidentReport>>({
    incidentType: 'near-miss',
    severity: 'low',
    dateTime: new Date().toISOString().slice(0, 16),
    employeesInvolved: [],
    witnesses: [],
    correctiveActions: [],
    photos: [],
    environmentalFactors: [],
    supervisorNotified: false,
    medicalAttention: false,
    workRestrictions: false
  })

  const steps = [
    { id: 1, name: 'Basic Information', icon: FileText },
    { id: 2, name: 'Incident Details', icon: AlertTriangle },
    { id: 3, name: 'People Involved', icon: User },
    { id: 4, name: 'Actions & Photos', icon: Camera },
    { id: 5, name: 'Review & Submit', icon: Send }
  ]

  const incidentTypes = [
    { value: 'injury', label: 'Personal Injury', color: 'bg-red-100 text-red-800' },
    { value: 'near-miss', label: 'Near Miss', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'property-damage', label: 'Property Damage', color: 'bg-orange-100 text-orange-800' },
    { value: 'environmental', label: 'Environmental', color: 'bg-green-100 text-green-800' },
    { value: 'security', label: 'Security', color: 'bg-purple-100 text-purple-800' }
  ]

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor incident with no significant impact' },
    { value: 'medium', label: 'Medium', description: 'Moderate incident requiring attention' },
    { value: 'high', label: 'High', description: 'Serious incident with significant impact' },
    { value: 'critical', label: 'Critical', description: 'Life-threatening or major incident' }
  ]

  const commonLocations = [
    'Grow Room A', 'Grow Room B', 'Grow Room C',
    'Packaging Area', 'Storage Room', 'Loading Dock',
    'Equipment Room', 'Office Area', 'Break Room',
    'Hallway', 'Entrance', 'Other'
  ]

  const environmentalFactors = [
    'Poor lighting', 'Wet surfaces', 'Excessive noise',
    'High temperature', 'Low temperature', 'Poor ventilation',
    'Chemical exposure', 'Dust/particles', 'Equipment malfunction',
    'Inadequate signage', 'Blocked pathways', 'Other'
  ]

  const handleSubmit = () => {
    onSubmit(report as IncidentReport)
  }

  const addEmployee = () => {
    setReport(prev => ({
      ...prev,
      employeesInvolved: [...(prev.employeesInvolved || []), '']
    }))
  }

  const removeEmployee = (index: number) => {
    setReport(prev => ({
      ...prev,
      employeesInvolved: prev.employeesInvolved?.filter((_, i) => i !== index) || []
    }))
  }

  const updateEmployee = (index: number, value: string) => {
    setReport(prev => ({
      ...prev,
      employeesInvolved: prev.employeesInvolved?.map((emp, i) => i === index ? value : emp) || []
    }))
  }

  const addWitness = () => {
    setReport(prev => ({
      ...prev,
      witnesses: [...(prev.witnesses || []), '']
    }))
  }

  const removeWitness = (index: number) => {
    setReport(prev => ({
      ...prev,
      witnesses: prev.witnesses?.filter((_, i) => i !== index) || []
    }))
  }

  const updateWitness = (index: number, value: string) => {
    setReport(prev => ({
      ...prev,
      witnesses: prev.witnesses?.map((wit, i) => i === index ? value : wit) || []
    }))
  }

  const addCorrectiveAction = () => {
    setReport(prev => ({
      ...prev,
      correctiveActions: [...(prev.correctiveActions || []), '']
    }))
  }

  const removeCorrectiveAction = (index: number) => {
    setReport(prev => ({
      ...prev,
      correctiveActions: prev.correctiveActions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateCorrectiveAction = (index: number, value: string) => {
    setReport(prev => ({
      ...prev,
      correctiveActions: prev.correctiveActions?.map((action, i) => i === index ? value : action) || []
    }))
  }

  const toggleEnvironmentalFactor = (factor: string) => {
    setReport(prev => {
      const factors = prev.environmentalFactors || []
      const exists = factors.includes(factor)
      return {
        ...prev,
        environmentalFactors: exists 
          ? factors.filter(f => f !== factor)
          : [...factors, factor]
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Incident Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {steps.length}: {steps.find(s => s.id === currentStep)?.name}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-12 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Incident Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {incidentTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setReport(prev => ({ ...prev, incidentType: type.value as any }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        report.incidentType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Badge className={type.color}>{type.label}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severity Level</label>
                <div className="space-y-2">
                  {severityLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setReport(prev => ({ ...prev, severity: level.value as any }))}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        report.severity === level.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-500">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={report.dateTime}
                    onChange={(e) => setReport(prev => ({ ...prev, dateTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select
                    value={report.location}
                    onChange={(e) => setReport(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select location...</option>
                    {commonLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Incident Description</label>
                <textarea
                  rows={4}
                  value={report.description}
                  onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what happened in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Equipment Involved</label>
                <input
                  type="text"
                  value={report.equipmentInvolved}
                  onChange={(e) => setReport(prev => ({ ...prev, equipmentInvolved: e.target.value }))}
                  placeholder="Specify equipment, tools, or machinery involved"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Environmental Factors</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {environmentalFactors.map(factor => (
                    <button
                      key={factor}
                      onClick={() => toggleEnvironmentalFactor(factor)}
                      className={`p-2 text-sm border rounded-lg transition-colors ${
                        report.environmentalFactors?.includes(factor)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Immediate Actions Taken</label>
                <textarea
                  rows={3}
                  value={report.immediateActions}
                  onChange={(e) => setReport(prev => ({ ...prev, immediateActions: e.target.value }))}
                  placeholder="What was done immediately after the incident?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Reported By</label>
                <input
                  type="text"
                  value={report.reportedBy}
                  onChange={(e) => setReport(prev => ({ ...prev, reportedBy: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Employees Involved</label>
                  <Button variant="outline" size="sm" onClick={addEmployee}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {report.employeesInvolved?.map((employee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={employee}
                        onChange={(e) => updateEmployee(index, e.target.value)}
                        placeholder="Employee name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeEmployee(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Witnesses</label>
                  <Button variant="outline" size="sm" onClick={addWitness}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {report.witnesses?.map((witness, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={witness}
                        onChange={(e) => updateWitness(index, e.target.value)}
                        placeholder="Witness name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeWitness(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={report.supervisorNotified}
                    onChange={(e) => setReport(prev => ({ ...prev, supervisorNotified: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Supervisor Notified</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={report.medicalAttention}
                    onChange={(e) => setReport(prev => ({ ...prev, medicalAttention: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Medical Attention Required</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={report.workRestrictions}
                    onChange={(e) => setReport(prev => ({ ...prev, workRestrictions: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Work Restrictions</span>
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Root Cause Analysis</label>
                <textarea
                  rows={3}
                  value={report.rootCause}
                  onChange={(e) => setReport(prev => ({ ...prev, rootCause: e.target.value }))}
                  placeholder="What was the underlying cause of this incident?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Corrective Actions</label>
                  <Button variant="outline" size="sm" onClick={addCorrectiveAction}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                <div className="space-y-2">
                  {report.correctiveActions?.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={action}
                        onChange={(e) => updateCorrectiveAction(index, e.target.value)}
                        placeholder="Describe corrective action"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeCorrectiveAction(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Photos/Evidence</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-2">
                    Upload photos or documents related to the incident
                  </p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="font-medium mb-4">Review Your Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {report.incidentType}
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span> {report.severity}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {report.dateTime}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {report.location}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Description:</span> {report.description}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please ensure all information is accurate. This report will be submitted to the safety department and cannot be edited after submission.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}