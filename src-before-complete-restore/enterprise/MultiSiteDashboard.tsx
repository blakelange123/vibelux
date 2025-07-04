'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Users, 
  Zap, 
  Droplets, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  Globe,
  Settings,
  Filter,
  Download,
  Plus,
  Search,
  Calendar,
  Clock,
  Target,
  Award,
  Briefcase,
  Database,
  Shield,
  Bell,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Facility {
  id: string
  name: string
  location: string
  type: 'indoor' | 'greenhouse' | 'outdoor' | 'vertical'
  status: 'operational' | 'maintenance' | 'offline' | 'commissioning'
  manager: {
    name: string
    email: string
    avatar?: string
  }
  metrics: {
    totalArea: number // sq ft
    activeZones: number
    totalZones: number
    dailyYield: number // kg
    monthlyYield: number // kg
    efficiency: number // percentage
    energyUsage: number // kWh
    waterUsage: number // liters
    laborHours: number
    revenue: number // USD
    profit: number // USD
    profitMargin: number // percentage
  }
  alerts: {
    critical: number
    warning: number
    info: number
  }
  compliance: {
    environmental: number // percentage
    safety: number // percentage
    quality: number // percentage
  }
  lastUpdate: Date
}

interface KPIComparison {
  metric: string
  facilities: {
    facilityId: string
    value: number
    trend: 'up' | 'down' | 'stable'
    changePercent: number
  }[]
}

interface EnterpriseAlert {
  id: string
  facilityId: string
  facilityName: string
  type: 'operational' | 'compliance' | 'financial' | 'security' | 'maintenance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  acknowledged: boolean
  assignedTo?: string
}

export default function MultiSiteDashboard() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [kpiComparisons, setKpiComparisons] = useState<KPIComparison[]>([])
  const [alerts, setAlerts] = useState<EnterpriseAlert[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['all'])
  const [timeRange, setTimeRange] = useState('7d')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with API calls
  useEffect(() => {
    const mockFacilities: Facility[] = [
      {
        id: 'facility-1',
        name: 'Denver Cultivation',
        location: 'Denver, CO',
        type: 'indoor',
        status: 'operational',
        manager: {
          name: 'Sarah Johnson',
          email: 'sarah@vibelux.com',
          avatar: '/avatars/sarah.jpg'
        },
        metrics: {
          totalArea: 15000,
          activeZones: 12,
          totalZones: 15,
          dailyYield: 45.2,
          monthlyYield: 1356.0,
          efficiency: 94,
          energyUsage: 2850,
          waterUsage: 890,
          laborHours: 168,
          revenue: 425000,
          profit: 127500,
          profitMargin: 30
        },
        alerts: {
          critical: 0,
          warning: 2,
          info: 5
        },
        compliance: {
          environmental: 98,
          safety: 95,
          quality: 97
        },
        lastUpdate: new Date()
      },
      {
        id: 'facility-2',
        name: 'Portland Greenhouse',
        location: 'Portland, OR',
        type: 'greenhouse',
        status: 'operational',
        manager: {
          name: 'Mike Chen',
          email: 'mike@vibelux.com',
          avatar: '/avatars/mike.jpg'
        },
        metrics: {
          totalArea: 25000,
          activeZones: 18,
          totalZones: 20,
          dailyYield: 78.6,
          monthlyYield: 2358.0,
          efficiency: 89,
          energyUsage: 1890,
          waterUsage: 1245,
          laborHours: 240,
          revenue: 695000,
          profit: 173750,
          profitMargin: 25
        },
        alerts: {
          critical: 1,
          warning: 3,
          info: 8
        },
        compliance: {
          environmental: 92,
          safety: 98,
          quality: 94
        },
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'facility-3',
        name: 'Austin Vertical Farm',
        location: 'Austin, TX',
        type: 'vertical',
        status: 'maintenance',
        manager: {
          name: 'Lisa Rodriguez',
          email: 'lisa@vibelux.com',
          avatar: '/avatars/lisa.jpg'
        },
        metrics: {
          totalArea: 8000,
          activeZones: 6,
          totalZones: 10,
          dailyYield: 22.1,
          monthlyYield: 663.0,
          efficiency: 76,
          energyUsage: 1420,
          waterUsage: 445,
          laborHours: 120,
          revenue: 298000,
          profit: 59600,
          profitMargin: 20
        },
        alerts: {
          critical: 2,
          warning: 1,
          info: 3
        },
        compliance: {
          environmental: 85,
          safety: 88,
          quality: 91
        },
        lastUpdate: new Date(Date.now() - 45 * 60 * 1000)
      }
    ]
    setFacilities(mockFacilities)

    const mockKPIs: KPIComparison[] = [
      {
        metric: 'Efficiency (%)',
        facilities: [
          { facilityId: 'facility-1', value: 94, trend: 'up', changePercent: 2.1 },
          { facilityId: 'facility-2', value: 89, trend: 'stable', changePercent: 0.5 },
          { facilityId: 'facility-3', value: 76, trend: 'down', changePercent: -3.2 }
        ]
      },
      {
        metric: 'Profit Margin (%)',
        facilities: [
          { facilityId: 'facility-1', value: 30, trend: 'up', changePercent: 1.8 },
          { facilityId: 'facility-2', value: 25, trend: 'up', changePercent: 0.9 },
          { facilityId: 'facility-3', value: 20, trend: 'down', changePercent: -2.1 }
        ]
      },
      {
        metric: 'Daily Yield (kg)',
        facilities: [
          { facilityId: 'facility-1', value: 45.2, trend: 'up', changePercent: 5.2 },
          { facilityId: 'facility-2', value: 78.6, trend: 'up', changePercent: 3.1 },
          { facilityId: 'facility-3', value: 22.1, trend: 'down', changePercent: -8.5 }
        ]
      }
    ]
    setKpiComparisons(mockKPIs)

    const mockAlerts: EnterpriseAlert[] = [
      {
        id: '1',
        facilityId: 'facility-2',
        facilityName: 'Portland Greenhouse',
        type: 'operational',
        severity: 'critical',
        title: 'HVAC System Failure',
        description: 'Zone 12 temperature exceeded 35°C for 2+ hours',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false
      },
      {
        id: '2',
        facilityId: 'facility-3',
        facilityName: 'Austin Vertical Farm',
        type: 'maintenance',
        severity: 'critical',
        title: 'LED Array Malfunction',
        description: 'Tier 3 LED array showing 40% power reduction',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        acknowledged: false
      },
      {
        id: '3',
        facilityId: 'facility-1',
        facilityName: 'Denver Cultivation',
        type: 'compliance',
        severity: 'medium',
        title: 'Water Usage Above Threshold',
        description: 'Daily water usage 15% above permitted limits',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false
      }
    ]
    setAlerts(mockAlerts)
  }, [])

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = searchTerm === '' || 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSelection = selectedFacilities.includes('all') || 
      selectedFacilities.includes(facility.id)
    return matchesSearch && matchesSelection
  })

  const getTotalMetric = (metricKey: keyof Facility['metrics']) => {
    return filteredFacilities.reduce((sum, facility) => 
      sum + (facility.metrics[metricKey] as number), 0
    )
  }

  const getAverageMetric = (metricKey: keyof Facility['metrics']) => {
    const total = getTotalMetric(metricKey)
    return filteredFacilities.length > 0 ? total / filteredFacilities.length : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      case 'commissioning': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string, changePercent: number) => {
    if (trend === 'up') {
      return <ArrowUpRight className={`w-3 h-3 ${changePercent > 0 ? 'text-green-600' : 'text-red-600'}`} />
    } else if (trend === 'down') {
      return <ArrowDownRight className={`w-3 h-3 ${changePercent < 0 ? 'text-red-600' : 'text-green-600'}`} />
    }
    return <span className="w-3 h-3 text-gray-400">—</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
            <p className="text-gray-600 mt-1">Multi-site operations overview and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length > 0 && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length} Critical Alert{alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length > 1 ? 's' : ''} Requiring Immediate Attention
                </h3>
              </div>
              <div className="space-y-2">
                {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.facilityName} • {alert.description}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedFacilities[0]} onValueChange={(value) => setSelectedFacilities([value])}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select facilities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Enterprise KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(getTotalMetric('revenue') / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      12.5% vs last month
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Area</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(getTotalMetric('totalArea') / 1000).toFixed(0)}K sq ft
                    </p>
                    <p className="text-xs text-gray-500">
                      {getTotalMetric('activeZones')} / {getTotalMetric('totalZones')} zones active
                    </p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Daily Yield</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getTotalMetric('dailyYield').toFixed(1)} kg
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      8.2% vs last week
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getAverageMetric('efficiency').toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      2.1% vs last month
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facility Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((facility) => (
              <Card key={facility.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <p className="text-sm text-gray-600">{facility.location}</p>
                    </div>
                    <Badge className={getStatusColor(facility.status)}>
                      {facility.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={facility.manager.avatar} />
                        <AvatarFallback>
                          {facility.manager.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{facility.manager.name}</p>
                        <p className="text-xs text-gray-600">Facility Manager</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Daily Yield</p>
                        <p className="font-medium">{facility.metrics.dailyYield} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className="font-medium">{facility.metrics.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-medium">${(facility.metrics.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Profit Margin</p>
                        <p className="font-medium">{facility.metrics.profitMargin}%</p>
                      </div>
                    </div>
                    
                    {/* Alerts Summary */}
                    {(facility.alerts.critical + facility.alerts.warning) > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        {facility.alerts.critical > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {facility.alerts.critical} Critical
                          </Badge>
                        )}
                        {facility.alerts.warning > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {facility.alerts.warning} Warning
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Overall Health</span>
                        <span className="text-xs text-gray-600">
                          {Math.round((facility.compliance.environmental + facility.compliance.safety + facility.compliance.quality) / 3)}%
                        </span>
                      </div>
                      <Progress 
                        value={(facility.compliance.environmental + facility.compliance.safety + facility.compliance.quality) / 3} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {filteredFacilities.map((facility) => (
              <Card key={facility.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-xl">{facility.name}</CardTitle>
                        <p className="text-gray-600">{facility.location} • {facility.type} facility</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(facility.status)}>
                        {facility.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Total Area</p>
                      <p className="text-lg font-semibold">{facility.metrics.totalArea.toLocaleString()} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Zones</p>
                      <p className="text-lg font-semibold">{facility.metrics.activeZones}/{facility.metrics.totalZones}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Daily Yield</p>
                      <p className="text-lg font-semibold">{facility.metrics.dailyYield} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="text-lg font-semibold">{facility.metrics.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-lg font-semibold">${(facility.metrics.revenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profit Margin</p>
                      <p className="text-lg font-semibold">{facility.metrics.profitMargin}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Compliance Scores</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Environmental</span>
                          <span className="text-xs font-medium">{facility.compliance.environmental}%</span>
                        </div>
                        <Progress value={facility.compliance.environmental} className="h-1" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Safety</span>
                          <span className="text-xs font-medium">{facility.compliance.safety}%</span>
                        </div>
                        <Progress value={facility.compliance.safety} className="h-1" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Quality</span>
                          <span className="text-xs font-medium">{facility.compliance.quality}%</span>
                        </div>
                        <Progress value={facility.compliance.quality} className="h-1" />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Resource Usage</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Energy</span>
                          <span className="text-xs font-medium">{facility.metrics.energyUsage} kWh</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Water</span>
                          <span className="text-xs font-medium">{facility.metrics.waterUsage} L</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Labor</span>
                          <span className="text-xs font-medium">{facility.metrics.laborHours} hrs</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Active Alerts</p>
                      <div className="space-y-1">
                        {facility.alerts.critical > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                              {facility.alerts.critical} Critical
                            </Badge>
                          </div>
                        )}
                        {facility.alerts.warning > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {facility.alerts.warning} Warning
                            </Badge>
                          </div>
                        )}
                        {facility.alerts.info > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {facility.alerts.info} Info
                            </Badge>
                          </div>
                        )}
                        {facility.alerts.critical === 0 && facility.alerts.warning === 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600">All systems normal</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {kpiComparisons.map((kpi, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{kpi.metric} Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kpi.facilities.map((facilityKPI) => {
                      const facility = facilities.find(f => f.id === facilityKPI.facilityId)
                      if (!facility) return null
                      
                      return (
                        <div key={facilityKPI.facilityId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <div>
                              <p className="font-medium">{facility.name}</p>
                              <p className="text-sm text-gray-600">{facility.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-semibold">
                                {kpi.metric.includes('%') ? facilityKPI.value.toFixed(1) : facilityKPI.value.toFixed(2)}
                                {kpi.metric.includes('%') ? '%' : ''}
                                {kpi.metric.includes('kg') ? ' kg' : ''}
                              </p>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(facilityKPI.trend, facilityKPI.changePercent)}
                                <span className={`text-xs ${
                                  facilityKPI.changePercent > 0 ? 'text-green-600' : 
                                  facilityKPI.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {facilityKPI.changePercent > 0 ? '+' : ''}{facilityKPI.changePercent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Progress 
                              value={Math.min(100, (facilityKPI.value / Math.max(...kpi.facilities.map(f => f.value))) * 100)}
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts & Issues Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">
                          {alert.type}
                        </Badge>
                        <span className="text-sm font-medium">{alert.facilityName}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
                      <p className="text-gray-700 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp.toLocaleString()}
                        </div>
                        {alert.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Assigned to {alert.assignedTo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      )}
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}