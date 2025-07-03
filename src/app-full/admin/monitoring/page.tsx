"use client"

import { useState, useEffect } from 'react'
import {
  Server,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Zap,
  Eye,
  BarChart3,
  LineChart,
  Gauge
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Metric {
  timestamp: string
  value: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
}

interface Alert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  service: string
  message: string
  timestamp: string
  acknowledged: boolean
}

export default function SystemMonitoringPage() {
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [cpuHistory, setCpuHistory] = useState<Metric[]>([])
  const [memoryHistory, setMemoryHistory] = useState<Metric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    loadMonitoringData()
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  const loadMonitoringData = async () => {
    // Simulated data - replace with real API calls
    setServices([
      {
        name: 'API Gateway',
        status: 'healthy',
        uptime: 99.98,
        responseTime: 45,
        errorRate: 0.02,
        throughput: 1542
      },
      {
        name: 'PostgreSQL Database',
        status: 'healthy',
        uptime: 99.99,
        responseTime: 12,
        errorRate: 0.01,
        throughput: 892
      },
      {
        name: 'Redis Cache',
        status: 'degraded',
        uptime: 99.95,
        responseTime: 3,
        errorRate: 0.05,
        throughput: 5421
      },
      {
        name: 'AI Inference Service',
        status: 'healthy',
        uptime: 99.97,
        responseTime: 234,
        errorRate: 0.03,
        throughput: 156
      },
      {
        name: 'Background Jobs',
        status: 'healthy',
        uptime: 99.96,
        responseTime: 1890,
        errorRate: 0.04,
        throughput: 89
      },
      {
        name: 'Email Service',
        status: 'healthy',
        uptime: 99.99,
        responseTime: 567,
        errorRate: 0.01,
        throughput: 234
      }
    ])

    // Generate time series data
    const now = Date.now()
    const cpuData: Metric[] = []
    const memData: Metric[] = []
    
    for (let i = 59; i >= 0; i--) {
      const timestamp = new Date(now - i * 60000).toLocaleTimeString()
      cpuData.push({
        timestamp,
        value: 35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30 + (i < 10 ? 20 : 0) // Spike in recent data
      })
      memData.push({
        timestamp,
        value: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15
      })
    }
    
    setCpuHistory(cpuData)
    setMemoryHistory(memData)

    setAlerts([
      {
        id: '1',
        severity: 'warning',
        service: 'Redis Cache',
        message: 'Memory usage above 80% threshold',
        timestamp: '5 min ago',
        acknowledged: false
      },
      {
        id: '2',
        severity: 'info',
        service: 'API Gateway',
        message: 'Traffic spike detected (150% normal)',
        timestamp: '12 min ago',
        acknowledged: true
      },
      {
        id: '3',
        severity: 'critical',
        service: 'Database',
        message: 'Slow query detected (>5s)',
        timestamp: '23 min ago',
        acknowledged: false
      }
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'down': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'down': return XCircle
      default: return Activity
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 border-red-800 text-red-300'
      case 'warning': return 'bg-yellow-900/50 border-yellow-800 text-yellow-300'
      case 'info': return 'bg-blue-900/50 border-blue-800 text-blue-300'
      default: return 'bg-gray-900/50 border-gray-800 text-gray-300'
    }
  }

  const infrastructureMetrics = [
    { name: 'CPU Usage', value: 65, max: 100, unit: '%', color: '#3B82F6' },
    { name: 'Memory', value: 73, max: 100, unit: '%', color: '#8B5CF6' },
    { name: 'Disk I/O', value: 42, max: 100, unit: '%', color: '#10B981' },
    { name: 'Network', value: 28, max: 100, unit: '%', color: '#F59E0B' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">System Monitoring</h1>
            <p className="text-gray-400">Real-time infrastructure and service monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="5m">Last 5 Minutes</option>
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-5 h-5 text-white ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Infrastructure Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {infrastructureMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">{metric.name}</h3>
                <Gauge className="w-5 h-5 text-gray-600" />
              </div>
              <div className="relative h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: metric.value },
                        { value: metric.max - metric.value }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill={metric.color} />
                      <Cell fill="#374151" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-sm text-gray-400">{metric.unit}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Status Grid */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            Service Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status)
              return (
                <div key={index} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{service.name}</h3>
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Uptime</p>
                      <p className="text-white font-medium">{service.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Response</p>
                      <p className="text-white font-medium">{service.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Error Rate</p>
                      <p className="text-white font-medium">{service.errorRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Throughput</p>
                      <p className="text-white font-medium">{service.throughput}/min</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* CPU Usage Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              CPU Usage
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Usage Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-purple-400" />
              Memory Usage
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Active Alerts
            </h2>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
              Clear Acknowledged
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{alert.service}</p>
                      <p className="text-sm opacity-90">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-75">{alert.timestamp}</span>
                    {!alert.acknowledged && (
                      <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}