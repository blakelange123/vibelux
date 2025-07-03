'use client'

import { useState, useEffect } from 'react'
import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  BarChart3,
  Activity,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Thermometer,
  Gauge,
  Zap,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  MapPin,
  Timer,
  Waves
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'

interface WaterUsageData {
  timestamp: Date
  zone: string
  usage: number // liters
  flow: number // L/min
  pressure: number // PSI
  temperature: number // °C
  ph: number
  ec: number // mS/cm
  runoff: number // liters
}

interface WaterZone {
  id: string
  name: string
  type: 'irrigation' | 'fertigation' | 'foliar' | 'cleaning'
  status: 'active' | 'inactive' | 'maintenance' | 'alert'
  dailyUsage: number
  weeklyUsage: number
  monthlyUsage: number
  efficiency: number // percentage
  lastMaintenance: Date
  nextMaintenance: Date
  sensors: {
    flowMeter: boolean
    pressureSensor: boolean
    phSensor: boolean
    ecSensor: boolean
    temperatureSensor: boolean
  }
  alerts: {
    highUsage: boolean
    lowPressure: boolean
    phOutOfRange: boolean
    ecOutOfRange: boolean
    leakDetection: boolean
  }
}

interface WaterAlert {
  id: string
  zone: string
  type: 'high_usage' | 'low_pressure' | 'ph_alert' | 'ec_alert' | 'leak' | 'maintenance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  acknowledged: boolean
}

interface WaterReport {
  period: 'daily' | 'weekly' | 'monthly'
  totalUsage: number
  costSavings: number
  efficiency: number
  zones: {
    zone: string
    usage: number
    efficiency: number
    alerts: number
  }[]
}

export default function WaterManagement() {
  const [zones, setZones] = useState<WaterZone[]>([])
  const [usageData, setUsageData] = useState<WaterUsageData[]>([])
  const [alerts, setAlerts] = useState<WaterAlert[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - replace with API calls
  useEffect(() => {
    const mockZones: WaterZone[] = [
      {
        id: 'zone-a',
        name: 'Zone A - Flower',
        type: 'irrigation',
        status: 'active',
        dailyUsage: 245.8,
        weeklyUsage: 1720.6,
        monthlyUsage: 7382.4,
        efficiency: 87,
        lastMaintenance: new Date('2024-03-15'),
        nextMaintenance: new Date('2024-04-15'),
        sensors: {
          flowMeter: true,
          pressureSensor: true,
          phSensor: true,
          ecSensor: true,
          temperatureSensor: true
        },
        alerts: {
          highUsage: false,
          lowPressure: false,
          phOutOfRange: false,
          ecOutOfRange: false,
          leakDetection: false
        }
      },
      {
        id: 'zone-b',
        name: 'Zone B - Veg',
        type: 'fertigation',
        status: 'alert',
        dailyUsage: 189.3,
        weeklyUsage: 1325.1,
        monthlyUsage: 5678.9,
        efficiency: 92,
        lastMaintenance: new Date('2024-03-10'),
        nextMaintenance: new Date('2024-04-10'),
        sensors: {
          flowMeter: true,
          pressureSensor: true,
          phSensor: true,
          ecSensor: true,
          temperatureSensor: false
        },
        alerts: {
          highUsage: true,
          lowPressure: false,
          phOutOfRange: true,
          ecOutOfRange: false,
          leakDetection: false
        }
      },
      {
        id: 'zone-c',
        name: 'Zone C - Leafy Greens',
        type: 'irrigation',
        status: 'active',
        dailyUsage: 156.7,
        weeklyUsage: 1096.9,
        monthlyUsage: 4703.1,
        efficiency: 94,
        lastMaintenance: new Date('2024-03-20'),
        nextMaintenance: new Date('2024-04-20'),
        sensors: {
          flowMeter: true,
          pressureSensor: true,
          phSensor: true,
          ecSensor: true,
          temperatureSensor: true
        },
        alerts: {
          highUsage: false,
          lowPressure: false,
          phOutOfRange: false,
          ecOutOfRange: false,
          leakDetection: false
        }
      }
    ]
    setZones(mockZones)

    const mockAlerts: WaterAlert[] = [
      {
        id: '1',
        zone: 'Zone B - Veg',
        type: 'ph_alert',
        severity: 'medium',
        message: 'pH level is 7.8, outside optimal range (5.5-6.5)',
        timestamp: new Date(),
        acknowledged: false
      },
      {
        id: '2',
        zone: 'Zone B - Veg',
        type: 'high_usage',
        severity: 'low',
        message: 'Water usage 15% above average for this time period',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false
      }
    ]
    setAlerts(mockAlerts)

    // Generate mock usage data
    const now = new Date()
    const mockUsageData: WaterUsageData[] = []
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      mockZones.forEach(zone => {
        mockUsageData.push({
          timestamp,
          zone: zone.name,
          usage: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 5,
          flow: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 2,
          pressure: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 25,
          temperature: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 20,
          ph: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 + 5.5,
          ec: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5 + 1.2,
          runoff: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 + 0.5
        })
      })
    }
    setUsageData(mockUsageData)
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getTotalUsage = (period: 'daily' | 'weekly' | 'monthly') => {
    return zones.reduce((sum, zone) => {
      switch (period) {
        case 'daily': return sum + zone.dailyUsage
        case 'weekly': return sum + zone.weeklyUsage
        case 'monthly': return sum + zone.monthlyUsage
        default: return sum
      }
    }, 0)
  }

  const getAverageEfficiency = () => {
    const totalEfficiency = zones.reduce((sum, zone) => sum + zone.efficiency, 0)
    return Math.round(totalEfficiency / zones.length)
  }

  const getActiveAlerts = () => {
    return alerts.filter(alert => !alert.acknowledged)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      case 'alert': return 'bg-red-100 text-red-800'
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

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Water Management</h1>
            <p className="text-gray-600 mt-1">Monitor usage, efficiency, and system health</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={refreshData} 
              variant="outline" 
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {getActiveAlerts().length > 0 && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  {getActiveAlerts().length} Active Alert{getActiveAlerts().length > 1 ? 's' : ''}
                </h3>
              </div>
              <div className="space-y-2">
                {getActiveAlerts().slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm font-medium">{alert.zone}</span>
                      <span className="text-sm text-gray-600">{alert.message}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zone Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Daily Usage</p>
                    <p className="text-2xl font-bold text-gray-900">{getTotalUsage('daily').toFixed(1)}L</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      5.2% vs yesterday
                    </p>
                  </div>
                  <Droplets className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">{getAverageEfficiency()}%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      2.1% vs last week
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                    <p className="text-2xl font-bold text-gray-900">$1,247</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Zones</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {zones.filter(z => z.status === 'active').length}/{zones.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getActiveAlerts().length} alert{getActiveAlerts().length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <Card key={zone.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                    <Badge className={getStatusColor(zone.status)}>
                      {zone.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{zone.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Daily Usage:</span>
                      <span className="text-sm font-medium">{zone.dailyUsage.toFixed(1)}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficiency:</span>
                      <span className="text-sm font-medium">{zone.efficiency}%</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Efficiency</span>
                        <span className="text-xs text-gray-600">{zone.efficiency}%</span>
                      </div>
                      <Progress value={zone.efficiency} className="h-2" />
                    </div>
                    
                    {/* Sensor Status */}
                    <div className="pt-2">
                      <p className="text-xs text-gray-600 mb-2">Sensors:</p>
                      <div className="flex gap-1">
                        <Badge variant={zone.sensors.flowMeter ? "default" : "secondary"} className="text-xs">
                          Flow
                        </Badge>
                        <Badge variant={zone.sensors.pressureSensor ? "default" : "secondary"} className="text-xs">
                          Pressure
                        </Badge>
                        <Badge variant={zone.sensors.phSensor ? "default" : "secondary"} className="text-xs">
                          pH
                        </Badge>
                        <Badge variant={zone.sensors.ecSensor ? "default" : "secondary"} className="text-xs">
                          EC
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Active Alerts */}
                    {Object.values(zone.alerts).some(alert => alert) && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">
                            {Object.values(zone.alerts).filter(alert => alert).length} active alert(s)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Zone Details Tab */}
        <TabsContent value="zones" className="space-y-6">
          {/* Zone Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
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
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-2" />
                  <p>Usage chart visualization</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Water Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">6.2</p>
                      <p className="text-sm text-gray-600">pH Level</p>
                      <Progress value={75} className="h-2 mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">1.4</p>
                      <p className="text-sm text-gray-600">EC (mS/cm)</p>
                      <Progress value={85} className="h-2 mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">22.5°C</p>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <Progress value={90} className="h-2 mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">32 PSI</p>
                      <p className="text-sm text-gray-600">Pressure</p>
                      <Progress value={80} className="h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage vs Efficiency Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <Activity className="w-12 h-12 mb-2" />
                  <p>Correlation chart placeholder</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <DollarSign className="w-12 h-12 mb-2" />
                  <p>Cost breakdown chart placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Water Usage Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue placeholder="Report period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Zone selection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Report will include:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Total water usage and cost breakdown</li>
                    <li>• Zone-by-zone efficiency analysis</li>
                    <li>• Quality metrics and compliance data</li>
                    <li>• Maintenance recommendations</li>
                    <li>• Trend analysis and forecasting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}