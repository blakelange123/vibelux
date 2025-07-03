'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  Activity, 
  Database, 
  Server, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  Users,
  Settings,
  Flag
} from 'lucide-react'

interface PerformanceMetrics {
  api: {
    responseTime: number
    requestCount: number
    errorRate: number
    throughput: number
  }
  database: {
    activeConnections: number
    queryDuration: number
    slowQueries: number
    hitRate: number
  }
  system: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    uptime: number
  }
  cache: {
    hitRate: number
    memoryUsage: number
    keyCount: number
    evictions: number
  }
}

interface ChartData {
  time: string
  responseTime: number
  requestCount: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  cacheHitRate: number
}

export default function PerformancePage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      // In production, this would call actual API endpoints
      const mockMetrics: PerformanceMetrics = {
        api: {
          responseTime: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500 + 100,
          requestCount: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000) + 500,
          errorRate: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05,
          throughput: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 50
        },
        database: {
          activeConnections: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10,
          queryDuration: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 20,
          slowQueries: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5),
          hitRate: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3 + 0.7
        },
        system: {
          cpuUsage: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8 + 0.1,
          memoryUsage: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.7 + 0.2,
          diskUsage: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.6 + 0.3,
          uptime: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 86400 * 30 // up to 30 days
        },
        cache: {
          hitRate: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3 + 0.7,
          memoryUsage: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1024 * 100,
          keyCount: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000) + 1000,
          evictions: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10)
        }
      }

      setMetrics(mockMetrics)

      // Add to chart data
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      
      setChartData(prev => {
        const newData = [...prev, {
          time: timeString,
          responseTime: mockMetrics.api.responseTime,
          requestCount: mockMetrics.api.requestCount,
          errorRate: mockMetrics.api.errorRate * 100,
          cpuUsage: mockMetrics.system.cpuUsage * 100,
          memoryUsage: mockMetrics.system.memoryUsage * 100,
          cacheHitRate: mockMetrics.cache.hitRate * 100
        }]
        
        // Keep only last 20 data points
        return newData.slice(-20)
      })

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'destructive'
    if (value >= thresholds.warning) return 'secondary'
    return 'default'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading performance metrics...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
          </div>
          
          {/* Admin Navigation */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => router.push('/admin')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              Users
            </button>
            <button 
              onClick={() => router.push('/admin/performance')}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md flex items-center gap-2 hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Performance
            </button>
            <button 
              onClick={() => router.push('/admin/backup')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4" />
              Backup
            </button>
            <button 
              onClick={() => router.push('/admin/features')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Features
            </button>
            <button 
              onClick={() => router.push('/admin/settings')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Performance Monitoring</h1>
              <p className="text-gray-400">
                Real-time system performance metrics and optimization insights
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center space-x-2"
              >
                <Activity className="h-4 w-4" />
                <span>{autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}</span>
              </Button>
              
              <Button onClick={fetchMetrics} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.api.responseTime.toFixed(0)}ms</div>
            <Badge variant={getStatusColor(metrics?.api.responseTime || 0, { warning: 500, critical: 1000 })}>
              {metrics?.api.responseTime && metrics.api.responseTime < 500 ? 'Good' : 
               metrics?.api.responseTime && metrics.api.responseTime < 1000 ? 'Warning' : 'Critical'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((metrics?.api.errorRate || 0) * 100).toFixed(2)}%</div>
            <Badge variant={getStatusColor((metrics?.api.errorRate || 0) * 100, { warning: 2, critical: 5 })}>
              {metrics?.api.errorRate && metrics.api.errorRate < 0.02 ? 'Good' : 
               metrics?.api.errorRate && metrics.api.errorRate < 0.05 ? 'Warning' : 'Critical'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((metrics?.system.cpuUsage || 0) * 100).toFixed(1)}%</div>
            <Badge variant={getStatusColor((metrics?.system.cpuUsage || 0) * 100, { warning: 70, critical: 90 })}>
              {metrics?.system.cpuUsage && metrics.system.cpuUsage < 0.7 ? 'Good' : 
               metrics?.system.cpuUsage && metrics.system.cpuUsage < 0.9 ? 'Warning' : 'Critical'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((metrics?.cache.hitRate || 0) * 100).toFixed(1)}%</div>
            <Badge variant={metrics?.cache.hitRate && metrics.cache.hitRate > 0.8 ? 'default' : 'secondary'}>
              {metrics?.cache.hitRate && metrics.cache.hitRate > 0.8 ? 'Excellent' : 'Needs Optimization'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>API response times over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>API error rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="errorRate" 
                      stroke="#ff7300" 
                      fill="#ff7300" 
                      fillOpacity={0.3}
                      name="Error Rate (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Statistics</CardTitle>
              <CardDescription>Current API performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics?.api.requestCount}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics?.api.throughput.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Requests/sec</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics?.api.responseTime.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{((metrics?.api.errorRate || 0) * 100).toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CPU & Memory Usage</CardTitle>
                <CardDescription>System resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cpuUsage" 
                      stroke="#8884d8" 
                      name="CPU Usage (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="memoryUsage" 
                      stroke="#82ca9d" 
                      name="Memory Usage (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>CPU Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(metrics?.system.cpuUsage || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{((metrics?.system.cpuUsage || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Memory Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(metrics?.system.memoryUsage || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{((metrics?.system.memoryUsage || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Disk Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${(metrics?.system.diskUsage || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{((metrics?.system.diskUsage || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Uptime</span>
                  <span className="text-sm font-medium">{formatUptime(metrics?.system.uptime || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Database Connections</CardTitle>
                <CardDescription>Active and total database connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Connections</span>
                    <span className="text-2xl font-bold text-blue-600">{metrics?.database.activeConnections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Query Duration</span>
                    <span className="text-lg font-medium">{metrics?.database.queryDuration.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Slow Queries</span>
                    <Badge variant={metrics?.database.slowQueries === 0 ? 'default' : 'destructive'}>
                      {metrics?.database.slowQueries}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Query Cache Hit Rate</span>
                    <span className="text-lg font-medium">{((metrics?.database.hitRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Health</CardTitle>
                <CardDescription>Overall database performance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Database Connection: Healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {metrics?.database.slowQueries === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>Query Performance: {metrics?.database.slowQueries === 0 ? 'Excellent' : 'Needs Attention'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(metrics?.database.hitRate || 0) > 0.8 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>Cache Efficiency: {(metrics?.database.hitRate || 0) > 0.8 ? 'Good' : 'Needs Optimization'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Cache hit rate and efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="cacheHitRate" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                    name="Cache Hit Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {((metrics?.cache.hitRate || 0) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Cache effectiveness</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatBytes(metrics?.cache.memoryUsage || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Current cache size</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {(metrics?.cache.keyCount || 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Cached objects</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  )
}