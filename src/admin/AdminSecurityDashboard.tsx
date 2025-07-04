'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Key,
  UserX,
  UserCheck,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  Fingerprint,
  Smartphone,
  Monitor,
  Globe,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  UserMinus,
  Ban,
  RefreshCw,
  Download,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Zap,
  Database,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  MemoryStick,
  Gauge,
  AlertOctagon,
  CheckCircle2,
  XOctagon,
  Timer,
  Layers,
  GitBranch,
  Package,
  Code,
  Terminal,
  Bug,
  Wrench
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'

interface SecurityEvent {
  id: string
  type: 'SUSPICIOUS_LOGIN' | 'BRUTE_FORCE' | 'CREDENTIAL_SHARING' | 'ANOMALY' | 'DATA_BREACH' | 'UNAUTHORIZED_ACCESS'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  userName?: string
  ipAddress: string
  location: string
  details: string
  timestamp: Date
  resolved: boolean
  resolvedBy?: string
  actions: string[]
}

interface SystemHealth {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  latency: number
  cpu: number
  memory: number
  lastCheck: Date
}

interface DatabaseMetrics {
  name: string
  size: number
  connections: number
  queries: number
  slowQueries: number
  replicationLag: number
  status: 'healthy' | 'warning' | 'critical'
}

interface APIMetrics {
  endpoint: string
  requests: number
  errors: number
  avgLatency: number
  p95Latency: number
  p99Latency: number
  errorRate: number
}

export default function AdminSecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([])
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics[]>([])
  const [apiMetrics, setApiMetrics] = useState<APIMetrics[]>([])
  const [activeTab, setActiveTab] = useState('security')
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')

  useEffect(() => {
    loadSecurityData()
    loadSystemHealth()
    loadDatabaseMetrics()
    loadAPIMetrics()

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSecurityData()
        loadSystemHealth()
        loadDatabaseMetrics()
        loadAPIMetrics()
      }, 10000) // Refresh every 10 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange])

  const loadSecurityData = async () => {
    // Mock data - replace with actual API calls
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'SUSPICIOUS_LOGIN',
        severity: 'high',
        userId: 'user_123',
        userName: 'john.doe@example.com',
        ipAddress: '185.234.218.90',
        location: 'Moscow, Russia',
        details: 'Login from unusual location with VPN detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: false,
        actions: ['Block IP', 'Reset Password', 'Notify User']
      },
      {
        id: '2',
        type: 'BRUTE_FORCE',
        severity: 'critical',
        ipAddress: '45.142.212.100',
        location: 'Unknown',
        details: '127 failed login attempts in 5 minutes',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: true,
        resolvedBy: 'admin@vibelux.com',
        actions: ['IP Banned', 'Rate Limit Applied']
      },
      {
        id: '3',
        type: 'CREDENTIAL_SHARING',
        severity: 'medium',
        userId: 'user_456',
        userName: 'sarah.chen@vertifarms.co',
        ipAddress: '192.168.1.100',
        location: 'Austin, TX',
        details: 'Same credentials used from 3 different devices simultaneously',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        resolved: false,
        actions: ['Investigate', 'Contact User', 'Monitor']
      },
      {
        id: '4',
        type: 'ANOMALY',
        severity: 'low',
        userId: 'user_789',
        userName: 'mike.wilson@greenhouse.io',
        ipAddress: '10.0.0.50',
        location: 'San Francisco, CA',
        details: 'Unusual API usage pattern detected - 500% increase in requests',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        resolved: true,
        resolvedBy: 'system',
        actions: ['Monitored', 'No Action Required']
      }
    ]
    
    setSecurityEvents(mockEvents)
  }

  const loadSystemHealth = async () => {
    const mockHealth: SystemHealth[] = [
      {
        service: 'API Gateway',
        status: 'healthy',
        uptime: 99.99,
        latency: 45,
        cpu: 23,
        memory: 67,
        lastCheck: new Date()
      },
      {
        service: 'Auth Service',
        status: 'healthy',
        uptime: 99.95,
        latency: 32,
        cpu: 18,
        memory: 45,
        lastCheck: new Date()
      },
      {
        service: 'Database Primary',
        status: 'healthy',
        uptime: 100,
        latency: 8,
        cpu: 45,
        memory: 78,
        lastCheck: new Date()
      },
      {
        service: 'Redis Cache',
        status: 'healthy',
        uptime: 99.99,
        latency: 2,
        cpu: 12,
        memory: 34,
        lastCheck: new Date()
      },
      {
        service: 'ML Pipeline',
        status: 'degraded',
        uptime: 98.5,
        latency: 250,
        cpu: 89,
        memory: 92,
        lastCheck: new Date()
      },
      {
        service: 'CDN',
        status: 'healthy',
        uptime: 100,
        latency: 15,
        cpu: 5,
        memory: 23,
        lastCheck: new Date()
      }
    ]

    setSystemHealth(mockHealth)
  }

  const loadDatabaseMetrics = async () => {
    const mockDb: DatabaseMetrics[] = [
      {
        name: 'PostgreSQL Primary',
        size: 245.6, // GB
        connections: 125,
        queries: 15420,
        slowQueries: 3,
        replicationLag: 0.05,
        status: 'healthy'
      },
      {
        name: 'PostgreSQL Replica 1',
        size: 245.6,
        connections: 45,
        queries: 8200,
        slowQueries: 1,
        replicationLag: 0.12,
        status: 'healthy'
      },
      {
        name: 'Redis Cluster',
        size: 8.4,
        connections: 890,
        queries: 125000,
        slowQueries: 0,
        replicationLag: 0,
        status: 'healthy'
      },
      {
        name: 'TimescaleDB',
        size: 1250.8,
        connections: 67,
        queries: 45000,
        slowQueries: 12,
        replicationLag: 0.8,
        status: 'warning'
      }
    ]

    setDatabaseMetrics(mockDb)
  }

  const loadAPIMetrics = async () => {
    const mockAPI: APIMetrics[] = [
      {
        endpoint: '/api/auth/login',
        requests: 12450,
        errors: 23,
        avgLatency: 45,
        p95Latency: 120,
        p99Latency: 250,
        errorRate: 0.18
      },
      {
        endpoint: '/api/facilities/*',
        requests: 45678,
        errors: 12,
        avgLatency: 78,
        p95Latency: 200,
        p99Latency: 450,
        errorRate: 0.03
      },
      {
        endpoint: '/api/energy/*',
        requests: 89234,
        errors: 45,
        avgLatency: 125,
        p95Latency: 350,
        p99Latency: 800,
        errorRate: 0.05
      },
      {
        endpoint: '/api/ml/predict',
        requests: 5678,
        errors: 234,
        avgLatency: 850,
        p95Latency: 2000,
        p99Latency: 3500,
        errorRate: 4.12
      }
    ]

    setApiMetrics(mockAPI)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'low': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'down': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4" />
      case 'degraded': return <AlertCircle className="w-4 h-4" />
      case 'down': return <XOctagon className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = !searchQuery || 
      event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery)
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter
    
    return matchesSearch && matchesSeverity
  })

  const unresolvedCount = securityEvents.filter(e => !e.resolved).length
  const criticalCount = securityEvents.filter(e => e.severity === 'critical' && !e.resolved).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security & System Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor security events, system health, and infrastructure status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="autorefresh"
              />
              <label htmlFor="autorefresh" className="text-sm font-medium">Auto-refresh</label>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Critical Security Alert</h3>
              <p className="text-red-800">{criticalCount} critical security events require immediate attention</p>
            </div>
          </div>
          <Button size="sm" variant="destructive">
            View Critical Events
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={unresolvedCount > 0 ? 'border-red-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">{securityEvents.length}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {unresolvedCount} unresolved
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.97%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  All systems operational
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  89 new today
                </p>
              </div>
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Health</p>
                <p className="text-2xl font-bold text-gray-900">98.5%</p>
                <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  ML service degraded
                </p>
              </div>
              <Server className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Events
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Infrastructure
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            API Performance
          </TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events, users, IPs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 border rounded-lg ${
                      event.resolved ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getSeverityColor(event.severity)} variant="outline">
                            {getSeverityIcon(event.severity)}
                            {event.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {event.type.replace(/_/g, ' ')}
                          </span>
                          {event.resolved && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{event.details}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {event.userName && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.userName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {event.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {event.resolvedBy && (
                          <p className="text-xs text-gray-500 mt-2">
                            Resolved by {event.resolvedBy}
                          </p>
                        )}
                      </div>
                      
                      {!event.resolved && (
                        <div className="flex flex-col gap-2 ml-4">
                          {event.actions.map((action, idx) => (
                            <Button key={idx} size="sm" variant="outline">
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemHealth.map((service) => (
              <Card key={service.service}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{service.service}</CardTitle>
                    <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      <span className="text-sm font-medium capitalize">{service.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Uptime</span>
                        <span className="font-medium">{service.uptime}%</span>
                      </div>
                      <Progress value={service.uptime} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Cpu className="w-3 h-3" />
                          CPU
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={service.cpu} className="h-2 flex-1" />
                          <span className="text-xs font-medium">{service.cpu}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <MemoryStick className="w-3 h-3" />
                          Memory
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={service.memory} className="h-2 flex-1" />
                          <span className="text-xs font-medium">{service.memory}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Latency
                      </span>
                      <span className={`font-medium ${
                        service.latency > 100 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {service.latency}ms
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resource Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">CPU, Memory, and Network usage charts</p>
                  <p className="text-sm text-gray-400">Would display time-series graphs here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {databaseMetrics.map((db) => (
              <Card key={db.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{db.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={
                        db.status === 'healthy' ? 'text-green-600 border-green-200' :
                        db.status === 'warning' ? 'text-yellow-600 border-yellow-200' :
                        'text-red-600 border-red-200'
                      }
                    >
                      {db.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="text-xl font-semibold">{db.size} GB</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Connections</p>
                      <p className="text-xl font-semibold">{db.connections}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Queries/sec</p>
                      <p className="text-xl font-semibold">{Math.round(db.queries / 60)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Slow Queries</p>
                      <p className={`text-xl font-semibold ${
                        db.slowQueries > 10 ? 'text-red-600' : 
                        db.slowQueries > 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {db.slowQueries}
                      </p>
                    </div>
                  </div>
                  
                  {db.replicationLag > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Replication Lag</span>
                        <span className={`text-sm font-medium ${
                          db.replicationLag > 1 ? 'text-red-600' : 
                          db.replicationLag > 0.5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {db.replicationLag}s
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Query Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Query Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">245,678</p>
                    <p className="text-sm text-gray-600">Total Queries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">12ms</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">16</p>
                    <p className="text-sm text-gray-600">Slow Queries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">0.02%</p>
                    <p className="text-sm text-gray-600">Error Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Performance Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiMetrics.map((api) => (
                  <div key={api.endpoint} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{api.endpoint}</h4>
                        <p className="text-sm text-gray-600">
                          {api.requests.toLocaleString()} requests
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          api.errorRate > 1 ? 'text-red-600 border-red-200' :
                          api.errorRate > 0.5 ? 'text-yellow-600 border-yellow-200' :
                          'text-green-600 border-green-200'
                        }
                      >
                        {api.errorRate.toFixed(2)}% error rate
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Avg Latency</p>
                        <p className="font-medium">{api.avgLatency}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-600">P95 Latency</p>
                        <p className="font-medium">{api.p95Latency}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-600">P99 Latency</p>
                        <p className="font-medium">{api.p99Latency}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Errors</p>
                        <p className="font-medium text-red-600">{api.errors}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">2.3M</p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                  <p className="text-xs text-green-600 mt-2">+15% from yesterday</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">99.8%</p>
                  <p className="text-sm text-gray-600">All endpoints</p>
                  <p className="text-xs text-gray-500 mt-2">SLA target: 99.5%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">87ms</p>
                  <p className="text-sm text-gray-600">All endpoints</p>
                  <p className="text-xs text-yellow-600 mt-2">ML endpoints: 850ms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}