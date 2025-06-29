"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  PilotFacility, 
  PilotProgramPhase, 
  pilotProgramClient as pilotProgram 
} from '@/lib/pilot-program-client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  Shield, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Play, 
  PauseCircle,
  FileText,
  Users,
  Activity,
  AlertTriangle,
  BarChart3,
  Target,
  Zap,
  Info,
  Plus,
  RefreshCw,
  Download
} from 'lucide-react'

interface PilotProgramDashboardProps {
  onWebSocketConnect?: (ws: WebSocket) => void
}

interface PilotProgramReport {
  summary: {
    currentPhase: string
    totalFacilities: number
    activeFacilities: number
    graduatedFacilities: number
    averageSavings: number
    averageConfidence: number
    successRate: number
  }
  facilities: PilotFacility[]
  recommendations: string[]
  riskAssessment: {
    totalPotentialLiability: number
    reserveFundRequired: number
    currentReserveFund: number
    insuranceCoverage?: string
    riskLevel: string
  }
}

interface EnrollmentFormData {
  facilityName: string
  location: string
  size: number
  cropType: string
  age?: number
  equipment?: string
  experience?: number
  creditScore?: number
  hasEnergyMeters?: boolean
  hasEnvironmentalSensors?: boolean
  dataHistory?: number
}

export default function PilotProgramDashboard({ onWebSocketConnect }: PilotProgramDashboardProps) {
  const [facilities, setFacilities] = useState<PilotFacility[]>([])
  const [report, setReport] = useState<PilotProgramReport | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<PilotFacility | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrollmentForm, setEnrollmentForm] = useState<EnrollmentFormData>({
    facilityName: '',
    location: '',
    size: 0,
    cropType: '',
    age: 5,
    equipment: 'good',
    experience: 3,
    creditScore: 650
  })
  const [wsConnected, setWsConnected] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [currentPhase, setCurrentPhase] = useState<PilotProgramPhase | null>(null)

  // Load pilot program data
  const loadPilotData = useCallback(async () => {
    try {
      const reportData = await pilotProgram.generateReport()
      setReport(reportData)
      setFacilities(reportData.facilities)
      
      // Load current phase
      const phase = pilotProgram.getCurrentPhase()
      setCurrentPhase(phase)
    } catch (error) {
      console.error('Error loading pilot data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const wsUrl = (window as any).NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
        const ws = new WebSocket(wsUrl)
        
        ws.onopen = () => {
          setWsConnected(true)
          ws.send(JSON.stringify({ type: 'subscribe', channel: 'pilot-program' }))
          if (onWebSocketConnect) {
            onWebSocketConnect(ws)
          }
        }

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.type === 'pilot-update') {
            loadPilotData()
          }
        }

        ws.onclose = () => {
          setWsConnected(false)
        }

        return () => {
          ws.close()
        }
      } catch (error) {
        console.error('WebSocket connection error:', error)
      }
    }
  }, [loadPilotData, onWebSocketConnect])

  // Initial load and periodic refresh
  useEffect(() => {
    loadPilotData()
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(loadPilotData, 30000)
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loadPilotData])

  // Enroll new facility
  const handleEnrollFacility = async () => {
    setIsEnrolling(true)
    try {
      const newFacility = await pilotProgram.enrollFacility({
        ...enrollmentForm,
        existingData: {
          hasEnergyMeters: enrollmentForm.hasEnergyMeters,
          hasEnvironmentalSensors: enrollmentForm.hasEnvironmentalSensors,
          dataHistory: enrollmentForm.dataHistory
        }
      })
      
      // Reset form
      setEnrollmentForm({
        facilityName: '',
        location: '',
        size: 0,
        cropType: '',
        age: 5,
        equipment: 'good',
        experience: 3,
        creditScore: 650
      })
      
      // Reload data
      await loadPilotData()
      
      // Select the new facility
      setSelectedFacility(newFacility)
    } catch (error) {
      console.error('Error enrolling facility:', error)
      alert(error instanceof Error ? error.message : 'Failed to enroll facility')
    } finally {
      setIsEnrolling(false)
    }
  }

  // Progress facility status
  const handleProgressFacility = async (facilityId: string) => {
    try {
      await pilotProgram.progressFacility(facilityId)
      await loadPilotData()
    } catch (error) {
      console.error('Error progressing facility:', error)
    }
  }

  // Generate and download report
  const handleDownloadReport = () => {
    if (!report) return
    
    const reportContent = {
      generatedAt: new Date().toISOString(),
      ...report
    }
    
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pilot-program-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get phase info
  const getPhaseInfo = (phaseName: string): { color: string; icon: React.ReactNode; description: string } => {
    switch (phaseName) {
      case 'pilot':
        return {
          color: 'bg-blue-500',
          icon: <Activity className="w-4 h-4" />,
          description: 'Initial testing phase with shared savings model'
        }
      case 'limited':
        return {
          color: 'bg-amber-500',
          icon: <Shield className="w-4 h-4" />,
          description: 'Limited rollout with conservative guarantees'
        }
      case 'full':
        return {
          color: 'bg-green-500',
          icon: <CheckCircle2 className="w-4 h-4" />,
          description: 'Full deployment with comprehensive guarantees'
        }
      default:
        return {
          color: 'bg-gray-500',
          icon: <Info className="w-4 h-4" />,
          description: 'Unknown phase'
        }
    }
  }

  // Get status badge
  const getStatusBadge = (status: PilotFacility['status']) => {
    const badges = {
      pending: { label: 'Pending', color: 'bg-gray-500' },
      baseline: { label: 'Establishing Baseline', color: 'bg-blue-500' },
      monitoring: { label: 'Active Monitoring', color: 'bg-amber-500' },
      verification: { label: 'Verifying Savings', color: 'bg-purple-500' },
      graduated: { label: 'Graduated', color: 'bg-green-500' }
    }
    
    const badge = badges[status] || badges.pending
    return (
      <Badge className={`${badge.color} text-white`}>
        {badge.label}
      </Badge>
    )
  }

  // Get risk level badge
  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500 text-white">Low Risk</Badge>
    if (score >= 60) return <Badge className="bg-amber-500 text-white">Moderate Risk</Badge>
    return <Badge className="bg-red-500 text-white">High Risk</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading pilot program data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            Pilot Program Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage guaranteed savings pilot program rollout
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm text-gray-400">
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button onClick={loadPilotData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleDownloadReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Phase Card */}
      {report && (
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getPhaseInfo(report.summary.currentPhase).icon}
                Current Phase: {report.summary.currentPhase.charAt(0).toUpperCase() + report.summary.currentPhase.slice(1)}
              </span>
              <Badge className={getPhaseInfo(report.summary.currentPhase).color + ' text-white'}>
                Active
              </Badge>
            </CardTitle>
            <CardDescription>
              {getPhaseInfo(report.summary.currentPhase).description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Phase Progress</p>
                <Progress 
                  value={(report.summary.totalFacilities / 5) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {report.summary.totalFacilities} / 5 facilities enrolled
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Success Rate</p>
                <Progress 
                  value={report.summary.successRate} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {report.summary.successRate.toFixed(1)}% performing above target
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Average Confidence</p>
                <Progress 
                  value={report.summary.averageConfidence} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {report.summary.averageConfidence.toFixed(1)}% measurement confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Facilities</p>
                  <p className="text-2xl font-bold text-white">{report.summary.totalFacilities}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg. Savings</p>
                  <p className="text-2xl font-bold text-white">{report.summary.averageSavings.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Risk Level</p>
                  <p className="text-2xl font-bold text-white capitalize">{report.riskAssessment.riskLevel}</p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${
                  report.riskAssessment.riskLevel === 'low' ? 'text-green-500' :
                  report.riskAssessment.riskLevel === 'moderate' ? 'text-amber-500' :
                  'text-red-500'
                }`} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Reserve Fund</p>
                  <p className="text-2xl font-bold text-white">
                    ${(report.riskAssessment.reserveFundRequired || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="facilities" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Facility List */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Enrolled Facilities</CardTitle>
                  <CardDescription>
                    Manage and monitor pilot program participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {facilities.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No facilities enrolled yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Start by enrolling your first facility in the pilot program
                      </p>
                    </div>
                  ) : (
                    facilities.map((facility) => (
                      <div
                        key={facility.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedFacility?.id === facility.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedFacility(facility)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">
                                {facility.facilityName}
                              </h3>
                              {getStatusBadge(facility.status)}
                            </div>
                            <p className="text-sm text-gray-400">
                              {facility.location} • {facility.size.toLocaleString()} sq ft • {facility.cropType}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">
                                Enrolled: {new Date(facility.enrollmentDate).toLocaleDateString()}
                              </span>
                              {facility.performanceMetrics.currentSavings && (
                                <span className="text-green-400">
                                  {facility.performanceMetrics.currentSavings.toFixed(1)}% savings
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Facility Details */}
            <div className="space-y-4">
              {selectedFacility ? (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Facility Details</CardTitle>
                    <CardDescription>{selectedFacility.facilityName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Risk Profile */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Risk Score</span>
                        {getRiskBadge(selectedFacility.riskProfile.score)}
                      </div>
                      <Progress value={selectedFacility.riskProfile.score} className="h-2" />
                    </div>

                    {/* Risk Factors */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Risk Factors</p>
                      {Object.entries(selectedFacility.riskProfile.factors).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-white">{value}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Guarantee Terms */}
                    {selectedFacility.guaranteeTerms && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-white">Contract Terms</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Type</span>
                            <span className="text-white capitalize">
                              {selectedFacility.guaranteeTerms.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Target Savings</span>
                            <span className="text-white">
                              {selectedFacility.guaranteeTerms.targetSavings}%
                            </span>
                          </div>
                          {selectedFacility.guaranteeTerms.guaranteedSavings && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Guaranteed</span>
                              <span className="text-white">
                                {selectedFacility.guaranteeTerms.guaranteedSavings}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Revenue Share</span>
                            <span className="text-white">
                              {selectedFacility.guaranteeTerms.revenueShare}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Duration</span>
                            <span className="text-white">
                              {selectedFacility.guaranteeTerms.duration} months
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {selectedFacility.status !== 'graduated' && (
                      <Button
                        onClick={() => handleProgressFacility(selectedFacility.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Progress to Next Stage
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Select a facility to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-4">
          <Card className="glass-card max-w-2xl">
            <CardHeader>
              <CardTitle>Enroll New Facility</CardTitle>
              <CardDescription>
                Add a new facility to the pilot program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Facility Name</label>
                  <input
                    type="text"
                    value={enrollmentForm.facilityName}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, facilityName: e.target.value })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Enter facility name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Location</label>
                  <input
                    type="text"
                    value={enrollmentForm.location}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, location: e.target.value })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Size (sq ft)</label>
                  <input
                    type="number"
                    value={enrollmentForm.size}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, size: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Crop Type</label>
                  <select
                    value={enrollmentForm.cropType}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, cropType: e.target.value })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select crop type</option>
                    <option value="Cannabis">Cannabis</option>
                    <option value="Leafy Greens">Leafy Greens</option>
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Mixed Crops">Mixed Crops</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Facility Age (years)</label>
                  <input
                    type="number"
                    value={enrollmentForm.age}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Equipment Condition</label>
                  <select
                    value={enrollmentForm.equipment}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, equipment: e.target.value })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Operator Experience (years)</label>
                  <input
                    type="number"
                    value={enrollmentForm.experience}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Credit Score</label>
                  <input
                    type="number"
                    value={enrollmentForm.creditScore}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, creditScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="650"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Existing Infrastructure</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enrollmentForm.hasEnergyMeters}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, hasEnergyMeters: e.target.checked })}
                      className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400">Has energy meters installed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enrollmentForm.hasEnvironmentalSensors}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, hasEnvironmentalSensors: e.target.checked })}
                      className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400">Has environmental sensors</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleEnrollFacility}
                disabled={!enrollmentForm.facilityName || !enrollmentForm.location || !enrollmentForm.size || !enrollmentForm.cropType || isEnrolling}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isEnrolling ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Enroll Facility
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Savings Performance</CardTitle>
                <CardDescription>
                  Energy savings achieved across all facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facilities.filter(f => f.performanceMetrics.currentSavings).map((facility) => (
                    <div key={facility.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {facility.facilityName}
                        </span>
                        <span className="text-sm text-gray-400">
                          {facility.performanceMetrics.currentSavings?.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={facility.performanceMetrics.currentSavings || 0} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Target: {facility.guaranteeTerms?.targetSavings}%</span>
                        <span>Confidence: {facility.performanceMetrics.confidenceLevel?.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                  {facilities.filter(f => f.performanceMetrics.currentSavings).length === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No performance data available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Aggregate Metrics</CardTitle>
                <CardDescription>
                  Overall program performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Average Savings</p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.averageSavings.toFixed(1)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.successRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Active Facilities</p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.activeFacilities}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Graduated</p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.graduatedFacilities}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Performance Distribution</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-300">
                            {facilities.filter(f => (f.performanceMetrics.currentSavings || 0) > 20).length} facilities exceeding target
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-300">
                            {facilities.filter(f => (f.performanceMetrics.currentSavings || 0) >= 15 && (f.performanceMetrics.currentSavings || 0) <= 20).length} facilities on target
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-300">
                            {facilities.filter(f => (f.performanceMetrics.currentSavings || 0) < 15 && (f.performanceMetrics.currentSavings || 0) > 0).length} facilities below target
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {report && (
              <>
                <Card className="glass-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Financial Risk Assessment</CardTitle>
                    <CardDescription>
                      Current liability and reserve fund status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Total Potential Liability</p>
                        <p className="text-2xl font-bold text-white">
                          ${report.riskAssessment.totalPotentialLiability.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Required Reserve Fund</p>
                        <p className="text-2xl font-bold text-white">
                          ${report.riskAssessment.reserveFundRequired.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Reserve Fund Coverage</span>
                        <span className="text-sm text-white">
                          {((report.riskAssessment.currentReserveFund / report.riskAssessment.reserveFundRequired) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(report.riskAssessment.currentReserveFund / report.riskAssessment.reserveFundRequired) * 100} 
                        className="h-2"
                      />
                    </div>

                    {report.riskAssessment.insuranceCoverage && (
                      <Alert className="border-blue-500/50 bg-blue-500/10">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <div className="ml-2">
                          <p className="text-sm font-semibold text-white">Insurance Coverage Active</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Policy: {report.riskAssessment.insuranceCoverage}
                          </p>
                        </div>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription>
                      Facility risk profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">Low Risk</span>
                        <span className="text-sm text-white">
                          {facilities.filter(f => f.riskProfile.score >= 80).length} facilities
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-400">Moderate Risk</span>
                        <span className="text-sm text-white">
                          {facilities.filter(f => f.riskProfile.score >= 60 && f.riskProfile.score < 80).length} facilities
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-400">High Risk</span>
                        <span className="text-sm text-white">
                          {facilities.filter(f => f.riskProfile.score < 60).length} facilities
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Program Recommendations</CardTitle>
              <CardDescription>
                AI-generated insights based on current performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report && report.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.map((recommendation, index) => (
                    <Alert key={index} className="border-purple-500/50 bg-purple-500/10">
                      <Info className="w-4 h-4 text-purple-500" />
                      <div className="ml-2">
                        <p className="text-sm text-white">{recommendation}</p>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-400">No critical recommendations at this time</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Program is performing within expected parameters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}