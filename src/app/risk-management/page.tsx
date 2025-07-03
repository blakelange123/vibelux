'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Bell,
  Activity,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Droplets,
  Bug,
  DollarSign,
  Users,
  Building2,
  Thermometer,
  Wind,
  Database,
  Settings,
  Download,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

interface RiskCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
  weight: number
}

interface Risk {
  id: string
  title: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  status: 'identified' | 'assessed' | 'mitigated' | 'monitoring' | 'closed'
  owner: string
  dueDate: string
  mitigation: string
  contingency: string
  lastUpdated: string
  estimatedCost: number
  actualCost?: number
  kpis: string[]
}

interface RiskMetrics {
  totalRisks: number
  highRisks: number
  overdue: number
  mitigated: number
  riskScore: number
  trendDirection: 'up' | 'down' | 'stable'
  categoryBreakdown: Record<string, number>
  severityDistribution: Record<string, number>
}

interface MonitoringAlert {
  id: string
  type: 'threshold' | 'trend' | 'anomaly' | 'manual'
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: string
  source: string
  value?: number
  threshold?: number
  acknowledged: boolean
  relatedRisks: string[]
}

export default function RiskManagementPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const riskCategories: RiskCategory[] = [
    {
      id: 'operational',
      name: 'Operational',
      description: 'Equipment failures, process issues, supply chain',
      icon: Settings,
      color: 'text-blue-600',
      weight: 0.3
    },
    {
      id: 'environmental',
      name: 'Environmental',
      description: 'Climate control, power outages, natural disasters',
      icon: Thermometer,
      color: 'text-green-600',
      weight: 0.25
    },
    {
      id: 'financial',
      name: 'Financial',
      description: 'Market volatility, cash flow, regulatory costs',
      icon: DollarSign,
      color: 'text-yellow-600',
      weight: 0.2
    },
    {
      id: 'biological',
      name: 'Biological',
      description: 'Pests, diseases, crop failures, contamination',
      icon: Bug,
      color: 'text-red-600',
      weight: 0.15
    },
    {
      id: 'regulatory',
      name: 'Regulatory',
      description: 'Compliance violations, permit issues, legal',
      icon: Shield,
      color: 'text-purple-600',
      weight: 0.1
    }
  ]

  useEffect(() => {
    loadSampleData()
  }, [])

  useEffect(() => {
    calculateMetrics()
  }, [risks])

  const loadSampleData = () => {
    const sampleRisks: Risk[] = [
      {
        id: 'risk_001',
        title: 'LED Fixture Failure During Peak Season',
        description: 'Risk of multiple LED fixture failures during critical flowering period due to age and heavy usage',
        category: 'operational',
        severity: 'high',
        probability: 'medium',
        impact: 'high',
        status: 'mitigated',
        owner: 'John Smith - Operations Manager',
        dueDate: '2024-03-15',
        mitigation: 'Implemented preventive maintenance schedule and purchased backup fixtures',
        contingency: 'Emergency LED rental service on standby, mobile fixtures available',
        lastUpdated: '2024-02-01',
        estimatedCost: 15000,
        actualCost: 8500,
        kpis: ['fixture_uptime', 'ppfd_consistency', 'yield_variance']
      },
      {
        id: 'risk_002',
        title: 'HVAC System Overload in Summer',
        description: 'Risk of climate control system failure during high ambient temperatures',
        category: 'environmental',
        severity: 'critical',
        probability: 'high',
        impact: 'high',
        status: 'assessed',
        owner: 'Sarah Johnson - Facilities',
        dueDate: '2024-05-01',
        mitigation: 'Installing backup cooling unit and upgrading existing system capacity',
        contingency: 'Portable AC units and temporary shading systems',
        lastUpdated: '2024-01-28',
        estimatedCost: 25000,
        kpis: ['temperature_variance', 'humidity_control', 'vpd_stability']
      },
      {
        id: 'risk_003',
        title: 'Spider Mite Outbreak',
        description: 'Potential for rapid spider mite infestation spreading across facility',
        category: 'biological',
        severity: 'high',
        probability: 'medium',
        impact: 'medium',
        status: 'monitoring',
        owner: 'Dr. Lisa Chen - IPM Specialist',
        dueDate: '2024-04-01',
        mitigation: 'Enhanced monitoring protocol and beneficial insect program',
        contingency: 'Emergency biological control agents and isolation procedures',
        lastUpdated: '2024-02-10',
        estimatedCost: 5000,
        kpis: ['pest_counts', 'beneficial_ratios', 'crop_health_index']
      },
      {
        id: 'risk_004',
        title: 'Power Grid Instability',
        description: 'Risk of power outages or voltage fluctuations affecting crop cycles',
        category: 'operational',
        severity: 'medium',
        probability: 'low',
        impact: 'high',
        status: 'identified',
        owner: 'Mike Rodriguez - Engineering',
        dueDate: '2024-06-01',
        mitigation: 'Installing UPS system and backup generator',
        contingency: 'Emergency lighting protocols and crop recovery procedures',
        lastUpdated: '2024-01-15',
        estimatedCost: 35000,
        kpis: ['power_reliability', 'voltage_stability', 'downtime_duration']
      },
      {
        id: 'risk_005',
        title: 'Regulatory Compliance Audit',
        description: 'Risk of non-compliance findings during annual state inspection',
        category: 'regulatory',
        severity: 'medium',
        probability: 'medium',
        impact: 'medium',
        status: 'mitigated',
        owner: 'Amanda White - Compliance',
        dueDate: '2024-03-30',
        mitigation: 'Completed internal audit and corrected all identified issues',
        contingency: 'Legal counsel on retainer and rapid response protocol',
        lastUpdated: '2024-02-05',
        estimatedCost: 8000,
        actualCost: 6500,
        kpis: ['compliance_score', 'documentation_completeness', 'training_completion']
      },
      {
        id: 'risk_006',
        title: 'Market Price Volatility',
        description: 'Risk of significant price drops affecting revenue projections',
        category: 'financial',
        severity: 'medium',
        probability: 'high',
        impact: 'medium',
        status: 'monitoring',
        owner: 'Robert Kim - Finance',
        dueDate: '2024-12-31',
        mitigation: 'Diversified customer base and forward contract agreements',
        contingency: 'Cost reduction measures and alternative product lines',
        lastUpdated: '2024-02-12',
        estimatedCost: 50000,
        kpis: ['price_trends', 'contract_coverage', 'margin_stability']
      }
    ]

    const sampleAlerts: MonitoringAlert[] = [
      {
        id: 'alert_001',
        type: 'threshold',
        title: 'High Temperature in Zone 3',
        description: 'Temperature exceeded 85°F for 2+ hours',
        severity: 'warning',
        timestamp: '2024-02-15T10:30:00Z',
        source: 'Environmental Monitoring',
        value: 87.2,
        threshold: 85,
        acknowledged: false,
        relatedRisks: ['risk_002']
      },
      {
        id: 'alert_002',
        type: 'anomaly',
        title: 'Unusual Power Consumption Pattern',
        description: 'Power usage 25% above normal for this time period',
        severity: 'info',
        timestamp: '2024-02-15T08:15:00Z',
        source: 'Energy Management',
        value: 125,
        threshold: 100,
        acknowledged: true,
        relatedRisks: ['risk_004']
      },
      {
        id: 'alert_003',
        type: 'trend',
        title: 'Declining PPFD Uniformity',
        description: 'Light uniformity decreasing over past 7 days',
        severity: 'warning',
        timestamp: '2024-02-14T16:45:00Z',
        source: 'Lighting System',
        acknowledged: false,
        relatedRisks: ['risk_001']
      },
      {
        id: 'alert_004',
        type: 'manual',
        title: 'Pest Monitoring Alert',
        description: 'Weekly pest count exceeded threshold in Block B',
        severity: 'critical',
        timestamp: '2024-02-13T14:20:00Z',
        source: 'IPM Team',
        acknowledged: false,
        relatedRisks: ['risk_003']
      }
    ]

    setRisks(sampleRisks)
    setAlerts(sampleAlerts)
  }

  const calculateMetrics = () => {
    if (risks.length === 0) return

    const totalRisks = risks.length
    const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical').length
    const overdue = risks.filter(r => new Date(r.dueDate) < new Date() && r.status !== 'closed').length
    const mitigated = risks.filter(r => r.status === 'mitigated' || r.status === 'closed').length

    // Calculate risk score (0-100)
    const riskScore = risks.reduce((score, risk) => {
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[risk.severity]
      const probabilityWeight = { low: 1, medium: 2, high: 3 }[risk.probability]
      const statusWeight = { identified: 1, assessed: 0.8, mitigated: 0.4, monitoring: 0.6, closed: 0.1 }[risk.status]
      
      return score + (severityWeight * probabilityWeight * statusWeight)
    }, 0)

    const normalizedScore = Math.min(100, (riskScore / (totalRisks * 12)) * 100) // Max possible score per risk is 12

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    risks.forEach(risk => {
      categoryBreakdown[risk.category] = (categoryBreakdown[risk.category] || 0) + 1
    })

    // Severity distribution
    const severityDistribution: Record<string, number> = {}
    risks.forEach(risk => {
      severityDistribution[risk.severity] = (severityDistribution[risk.severity] || 0) + 1
    })

    setMetrics({
      totalRisks,
      highRisks,
      overdue,
      mitigated,
      riskScore: Math.round(normalizedScore),
      trendDirection: 'stable', // Would be calculated from historical data
      categoryBreakdown,
      severityDistribution
    })
  }

  const addNewRisk = () => {
    const newRisk: Risk = {
      id: `risk_${Date.now()}`,
      title: '',
      description: '',
      category: 'operational',
      severity: 'medium',
      probability: 'medium',
      impact: 'medium',
      status: 'identified',
      owner: '',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mitigation: '',
      contingency: '',
      lastUpdated: new Date().toISOString(),
      estimatedCost: 0,
      kpis: []
    }
    setRisks([newRisk, ...risks])
    setSelectedRisk(newRisk)
    setIsEditing(true)
  }

  const updateRisk = (riskId: string, updates: Partial<Risk>) => {
    setRisks(risks.map(risk => 
      risk.id === riskId 
        ? { ...risk, ...updates, lastUpdated: new Date().toISOString() }
        : risk
    ))
    if (selectedRisk?.id === riskId) {
      setSelectedRisk({ ...selectedRisk, ...updates })
    }
  }

  const deleteRisk = (riskId: string) => {
    setRisks(risks.filter(risk => risk.id !== riskId))
    if (selectedRisk?.id === riskId) {
      setSelectedRisk(null)
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ))
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-500'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      identified: 'bg-gray-500',
      assessed: 'bg-blue-500',
      mitigated: 'bg-green-500',
      monitoring: 'bg-yellow-500',
      closed: 'bg-purple-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getAlertIcon = (type: string) => {
    const icons = {
      threshold: AlertTriangle,
      trend: TrendingDown,
      anomaly: Activity,
      manual: Bell
    }
    const Icon = icons[type as keyof typeof icons] || AlertCircle
    return <Icon className="w-4 h-4" />
  }

  const filteredRisks = risks.filter(risk => {
    const matchesCategory = filterCategory === 'all' || risk.category === filterCategory
    const matchesSeverity = filterSeverity === 'all' || risk.severity === filterSeverity
    const matchesSearch = searchQuery === '' || 
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSeverity && matchesSearch
  })

  const exportRiskRegister = () => {
    const exportData = {
      risks,
      metrics,
      alerts: alerts.filter(a => !a.acknowledged),
      exportDate: new Date().toISOString(),
      summary: {
        totalRisks: metrics?.totalRisks,
        highRisks: metrics?.highRisks,
        riskScore: metrics?.riskScore
      }
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `risk-register-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              Risk Management Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor, assess, and mitigate operational risks across your facility
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportRiskRegister}>
              <Download className="w-4 h-4 mr-2" />
              Export Register
            </Button>
            <Button onClick={addNewRisk}>
              <Plus className="w-4 h-4 mr-2" />
              Add Risk
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Risks</p>
                    <p className="text-2xl font-bold">{metrics.totalRisks}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High/Critical</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.highRisks}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.overdue}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mitigated</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.mitigated}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                    <p className="text-2xl font-bold">{metrics.riskScore}/100</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <Progress value={metrics.riskScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Risk List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Risk Register</span>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
                
                {/* Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search risks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {riskCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRisk?.id === risk.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedRisk(risk)
                        setIsEditing(false)
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm line-clamp-2">{risk.title}</div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`${getSeverityColor(risk.severity)} text-white`}>
                            {risk.severity}
                          </Badge>
                          <Badge className={`${getStatusColor(risk.status)} text-white text-xs`}>
                            {risk.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {riskCategories.find(c => c.id === risk.category)?.name}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span>Due: {new Date(risk.dueDate).toLocaleDateString()}</span>
                        <span className={new Date(risk.dueDate) < new Date() ? 'text-red-600' : 'text-green-600'}>
                          {new Date(risk.dueDate) < new Date() ? 'Overdue' : 'On Track'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredRisks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No risks found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Risk Details</TabsTrigger>
                <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {selectedRisk ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          {isEditing ? 'Edit Risk' : selectedRisk.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {isEditing ? 'View' : 'Edit'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => deleteRisk(selectedRisk.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">Title *</label>
                              <Input
                                value={selectedRisk.title}
                                onChange={(e) => updateRisk(selectedRisk.id, { title: e.target.value })}
                                placeholder="Risk title"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Category</label>
                              <Select
                                value={selectedRisk.category}
                                onValueChange={(value) => updateRisk(selectedRisk.id, { category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {riskCategories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                              value={selectedRisk.description}
                              onChange={(e) => updateRisk(selectedRisk.id, { description: e.target.value })}
                              placeholder="Detailed risk description"
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Severity</label>
                              <Select
                                value={selectedRisk.severity}
                                onValueChange={(value: any) => updateRisk(selectedRisk.id, { severity: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Probability</label>
                              <Select
                                value={selectedRisk.probability}
                                onValueChange={(value: any) => updateRisk(selectedRisk.id, { probability: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Status</label>
                              <Select
                                value={selectedRisk.status}
                                onValueChange={(value: any) => updateRisk(selectedRisk.id, { status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="identified">Identified</SelectItem>
                                  <SelectItem value="assessed">Assessed</SelectItem>
                                  <SelectItem value="mitigated">Mitigated</SelectItem>
                                  <SelectItem value="monitoring">Monitoring</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium mb-1">Risk Owner</label>
                              <Input
                                value={selectedRisk.owner}
                                onChange={(e) => updateRisk(selectedRisk.id, { owner: e.target.value })}
                                placeholder="Responsible person"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Due Date</label>
                              <Input
                                type="date"
                                value={selectedRisk.dueDate}
                                onChange={(e) => updateRisk(selectedRisk.id, { dueDate: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Mitigation Strategy</label>
                            <Textarea
                              value={selectedRisk.mitigation}
                              onChange={(e) => updateRisk(selectedRisk.id, { mitigation: e.target.value })}
                              placeholder="How will this risk be mitigated?"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Contingency Plan</label>
                            <Textarea
                              value={selectedRisk.contingency}
                              onChange={(e) => updateRisk(selectedRisk.id, { contingency: e.target.value })}
                              placeholder="What if mitigation fails?"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Estimated Cost ($)</label>
                            <Input
                              type="number"
                              value={selectedRisk.estimatedCost}
                              onChange={(e) => updateRisk(selectedRisk.id, { estimatedCost: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <span className="text-sm text-muted-foreground">Severity</span>
                              <div className="mt-1">
                                <Badge className={`${getSeverityColor(selectedRisk.severity)} text-white`}>
                                  {selectedRisk.severity}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Status</span>
                              <div className="mt-1">
                                <Badge className={`${getStatusColor(selectedRisk.status)} text-white`}>
                                  {selectedRisk.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Category</span>
                              <div className="mt-1 font-medium">
                                {riskCategories.find(c => c.id === selectedRisk.category)?.name}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="font-medium mb-2">Mitigation Strategy</h4>
                              <p className="text-sm text-muted-foreground">{selectedRisk.mitigation}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Contingency Plan</h4>
                              <p className="text-sm text-muted-foreground">{selectedRisk.contingency}</p>
                            </div>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <span className="text-sm text-muted-foreground">Owner</span>
                              <div className="mt-1 font-medium">{selectedRisk.owner}</div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Due Date</span>
                              <div className="mt-1 font-medium">
                                {new Date(selectedRisk.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Estimated Cost</span>
                              <div className="mt-1 font-medium text-green-600">
                                ${selectedRisk.estimatedCost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center text-muted-foreground">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">No Risk Selected</h3>
                        <p>Select a risk from the list to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Active Alerts ({alerts.filter(a => !a.acknowledged).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                            alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                            'border-blue-500 bg-blue-50'
                          } ${alert.acknowledged ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                                alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {getAlertIcon(alert.type)}
                              </div>
                              
                              <div>
                                <h4 className="font-medium">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>{alert.source}</span>
                                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                  {alert.value && alert.threshold && (
                                    <span>Value: {alert.value} (Threshold: {alert.threshold})</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {!alert.acknowledged && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {alerts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No active alerts</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Risk by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {riskCategories.map(category => {
                          const count = metrics?.categoryBreakdown[category.id] || 0
                          const percentage = metrics ? (count / metrics.totalRisks) * 100 : 0
                          const Icon = category.icon
                          
                          return (
                            <div key={category.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${category.color}`} />
                                <span className="text-sm">{category.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">{count}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Severity Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['critical', 'high', 'medium', 'low'].map(severity => {
                          const count = metrics?.severityDistribution[severity] || 0
                          const percentage = metrics ? (count / metrics.totalRisks) * 100 : 0
                          
                          return (
                            <div key={severity} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                                <span className="text-sm capitalize">{severity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getSeverityColor(severity)}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">{count}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {riskCategories.map(category => {
                    const Icon = category.icon
                    const categoryRisks = risks.filter(r => r.category === category.id)
                    const highRisks = categoryRisks.filter(r => r.severity === 'high' || r.severity === 'critical')
                    
                    return (
                      <Card key={category.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${category.color}`} />
                            {category.name}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Risks:</span>
                              <span className="font-bold">{categoryRisks.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">High/Critical:</span>
                              <span className="font-bold text-red-600">{highRisks.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Weight:</span>
                              <span className="font-bold">{(category.weight * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={categoryRisks.length * 10} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}