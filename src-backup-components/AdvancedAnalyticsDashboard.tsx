"use client"

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Zap,
  Leaf,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  Clock,
  PieChart,
  LineChart,
  Cloud,
  Database,
  Settings
} from 'lucide-react'
import { SalesforceIntegration } from './SalesforceIntegration'
import { DataInputManager } from './analytics/DataInputManager'
import { IndustrySpecificDashboard } from './analytics/IndustrySpecificDashboard'
import { FacilityType } from '@/lib/facility-types'

interface MetricCard {
  id: string
  title: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.FC<any>
  color: string
  unit?: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color: string
  }[]
}

export function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue')
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval] = useState(60) // seconds
  const [showSalesforce, setShowSalesforce] = useState(false)
  const [showDataInput, setShowDataInput] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [facilityId] = useState('default-facility-id') // This should come from context/props
  const [facilityType] = useState<FacilityType>(FacilityType.CANNABIS) // This should come from facility data
  
  const exportData = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `analytics-dashboard-${timestamp}`
    
    if (format === 'csv') {
      // Generate CSV data
      let csvContent = 'Analytics Dashboard Export\n\n'
      csvContent += 'Metrics Summary\n'
      csvContent += 'Metric,Value,Change,Trend\n'
      
      metrics.forEach(metric => {
        csvContent += `${metric.title},${metric.value} ${metric.unit || ''},${metric.change}%,${metric.trend}\n`
      })
      
      csvContent += '\nFacility Comparison\n'
      csvContent += 'Facility,Yield (kg/m²),Energy (kWh/kg),Cost ($/kg),Efficiency,Status\n'
      
      // Add sample facility data
      const facilities = ['Greenhouse A', 'Greenhouse B', 'Indoor Farm 1', 'Indoor Farm 2']
      facilities.forEach(facility => {
        const yield_ = (40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)
        const energy = (30 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(1)
        const cost = (2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2).toFixed(2)
        const efficiency = (80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(0)
        const status = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3 ? 'Optimal' : 'Warning'
        csvContent += `${facility},${yield_},${energy},$${cost},${efficiency}%,${status}\n`
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()
    } else if (format === 'excel') {
      // Generate Excel-compatible HTML
      let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Analytics Dashboard</title></head>
      <body>
      <h1>Analytics Dashboard Export</h1>
      <h2>Metrics Summary</h2>
      <table border="1">
        <tr><th>Metric</th><th>Value</th><th>Change</th><th>Trend</th></tr>`
      
      metrics.forEach(metric => {
        excelContent += `<tr>
          <td>${metric.title}</td>
          <td>${metric.value} ${metric.unit || ''}</td>
          <td>${metric.change}%</td>
          <td>${metric.trend}</td>
        </tr>`
      })
      
      excelContent += `</table>
      <br/>
      <h2>Facility Comparison</h2>
      <table border="1">
        <tr><th>Facility</th><th>Yield (kg/m²)</th><th>Energy (kWh/kg)</th><th>Cost ($/kg)</th><th>Efficiency</th><th>Status</th></tr>`
      
      const facilities = ['Greenhouse A', 'Greenhouse B', 'Indoor Farm 1', 'Indoor Farm 2']
      facilities.forEach(facility => {
        const yield_ = (40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)
        const energy = (30 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(1)
        const cost = (2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2).toFixed(2)
        const efficiency = (80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(0)
        const status = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3 ? 'Optimal' : 'Warning'
        excelContent += `<tr>
          <td>${facility}</td>
          <td>${yield_}</td>
          <td>${energy}</td>
          <td>$${cost}</td>
          <td>${efficiency}%</td>
          <td>${status}</td>
        </tr>`
      })
      
      excelContent += '</table></body></html>'
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.xls`
      link.click()
    } else if (format === 'pdf') {
      // For PDF, we'll use the browser's print functionality
      window.print()
    }
  }

  // Fetch real-time metrics
  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/metrics?facilityId=${facilityId}&period=${timeRange}&detailed=true`)
      if (response.ok) {
        const data = await response.json()
        setRealTimeMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [timeRange, facilityId])

  // Use real-time data or fallback to defaults
  const metrics: MetricCard[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: realTimeMetrics?.revenue?.total ? `$${realTimeMetrics.revenue.total.toLocaleString()}` : '$0',
      change: realTimeMetrics?.revenue?.trend || 0,
      trend: realTimeMetrics?.revenue?.trend > 0 ? 'up' : realTimeMetrics?.revenue?.trend < 0 ? 'down' : 'neutral',
      icon: DollarSign,
      color: 'green',
      unit: 'USD'
    },
    {
      id: 'energy',
      title: 'Energy Efficiency',
      value: realTimeMetrics?.energy?.efficiency?.toFixed(1) || '0',
      change: realTimeMetrics?.energy?.trend || 0,
      trend: realTimeMetrics?.energy?.trend > 0 ? 'up' : realTimeMetrics?.energy?.trend < 0 ? 'down' : 'neutral',
      icon: Zap,
      color: 'yellow',
      unit: 'g/kWh'
    },
    {
      id: 'yield',
      title: 'Average Yield',
      value: realTimeMetrics?.yield?.average?.toFixed(1) || '0',
      change: realTimeMetrics?.yield?.trend || 0,
      trend: realTimeMetrics?.yield?.trend > 0 ? 'up' : realTimeMetrics?.yield?.trend < 0 ? 'down' : 'neutral',
      icon: Leaf,
      color: 'green',
      unit: 'kg/m²'
    },
    {
      id: 'utilization',
      title: 'Space Utilization',
      value: realTimeMetrics?.space?.utilization ? `${realTimeMetrics.space.utilization.toFixed(0)}%` : '0%',
      change: 0, // Space utilization doesn't have trends
      trend: 'neutral',
      icon: Target,
      color: 'blue',
      unit: '%'
    }
  ]

  // Simulate real-time data updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // Update data here
      }, 1000)
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Refresh data when data input changes
  const handleDataUpdate = () => {
    fetchMetrics()
  }

  const generateChartData = (metric: string): ChartData => {
    const days = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365
    const labels = Array.from({ length: Math.min(days, 12) }, (_, i) => {
      if (timeRange === 'day') return `${i}:00`
      if (timeRange === 'week') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]
      if (timeRange === 'month') return `Day ${i * 3 + 1}`
      return `Month ${i + 1}`
    })

    return {
      labels,
      datasets: [
        {
          label: 'Current Period',
          data: labels.map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 50),
          color: '#a06bff'
        },
        {
          label: 'Previous Period',
          data: labels.map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 40),
          color: '#6b7280'
        }
      ]
    }
  }

  const getInsights = () => {
    return [
      {
        type: 'positive',
        icon: TrendingUp,
        title: 'Revenue Growth',
        description: 'Revenue increased by 12.5% compared to last month'
      },
      {
        type: 'warning',
        icon: AlertTriangle,
        title: 'Yield Decline',
        description: 'Average yield decreased by 2.1% - check environmental conditions'
      },
      {
        type: 'info',
        icon: Info,
        title: 'Energy Optimization',
        description: 'Consider adjusting photoperiod to improve energy efficiency'
      }
    ]
  }

  const getPerformanceScore = () => {
    const scores = {
      efficiency: 92,
      quality: 88,
      reliability: 95,
      sustainability: 85
    }
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)
    return { overall, breakdown: scores }
  }

  const chartData = generateChartData(selectedMetric)
  const performanceScore = getPerformanceScore()
  const insights = getInsights()

  return (
    <div className="bg-[#1a1739] rounded-lg shadow-md p-6 border border-purple-900/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#a06bff]" />
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Auto-refresh</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="toggle"
            />
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-[#2d2a55] rounded-lg text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-[#9256ff] text-white hover:bg-[#a06bff]' 
                : 'hover:bg-[#2d2a55] text-gray-300'
            }`}
            title="Filter Options"
          >
            <Filter className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="p-2 hover:bg-[#2d2a55] rounded-lg text-gray-300 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#2d2a55] border border-purple-900/20 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  exportData('csv')
                  setShowDownloadMenu(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#1a1833] text-gray-300 hover:text-white transition-colors rounded-t-lg"
              >
                Export as CSV
              </button>
              <button
                onClick={() => {
                  exportData('excel')
                  setShowDownloadMenu(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#1a1833] text-gray-300 hover:text-white transition-colors"
              >
                Export as Excel
              </button>
              <button
                onClick={() => {
                  exportData('pdf')
                  setShowDownloadMenu(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#1a1833] text-gray-300 hover:text-white transition-colors rounded-b-lg"
              >
                Export as PDF
              </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSalesforce(!showSalesforce)}
            className={`p-2 rounded-lg transition-colors ${
              showSalesforce 
                ? 'bg-[#9256ff] text-white hover:bg-[#a06bff]' 
                : 'hover:bg-[#2d2a55] text-gray-300'
            }`}
            title="Salesforce Integration"
          >
            <Cloud className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDataInput(!showDataInput)}
            className={`p-2 rounded-lg transition-colors ${
              showDataInput 
                ? 'bg-[#9256ff] text-white hover:bg-[#a06bff]' 
                : 'hover:bg-[#2d2a55] text-gray-300'
            }`}
            title="Data Input Manager"
          >
            <Database className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-[#9256ff] text-white hover:bg-[#a06bff]' 
                : 'hover:bg-[#2d2a55] text-gray-300'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(['day', 'week', 'month', 'quarter', 'year'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize ${
              timeRange === range
                ? 'bg-[#9256ff] text-white'
                : 'bg-[#2d2a55] text-gray-400 hover:bg-[#3d3a65] transition-colors'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Industry-Specific Dashboard */}
      <div className="mb-8">
        <IndustrySpecificDashboard 
          facilityId={facilityId}
          facilityType={facilityType}
          timeRange={timeRange}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className={`p-4 border rounded-lg cursor-pointer transition-shadow hover:shadow-md ${
              selectedMetric === metric.id ? 'border-[#a06bff] bg-purple-900/20' : 'border-gray-700'
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                metric.color === 'green' ? 'bg-[#2bc48a]/20' :
                metric.color === 'yellow' ? 'bg-yellow-900/30' :
                metric.color === 'blue' ? 'bg-[#9256ff]/20' :
                'bg-[#2d2a55]'
              }`}>
                <metric.icon className={`w-5 h-5 ${
                  metric.color === 'green' ? 'text-[#2bc48a]' :
                  metric.color === 'yellow' ? 'text-yellow-500' :
                  metric.color === 'blue' ? 'text-[#a06bff]' :
                  'text-gray-400'
                }`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-[#2bc48a]' : 'text-red-500'
              }`}>
                {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-white">
              {metric.value}
              {metric.unit && <span className="text-sm font-normal text-gray-400"> {metric.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <div className="border border-purple-900/20 rounded-lg p-6 bg-[#1a1739]/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-white">Trend Analysis</h3>
            <div className="h-64 flex items-center justify-center bg-[#0f0d1f] rounded">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-2 text-[#a06bff]" />
                <p className="text-sm text-gray-400">
                  {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} over time
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              {chartData.datasets.map((dataset, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: dataset.color }}
                  />
                  <span className="text-sm text-gray-400">
                    {dataset.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Score */}
        <div>
          <div className="border border-purple-900/20 rounded-lg p-6 bg-[#1a1739]/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-white">Performance Score</h3>
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - performanceScore.overall / 100)}`}
                    className="text-[#a06bff] transform -rotate-90 origin-center transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-white">{performanceScore.overall}%</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Overall Performance</p>
            </div>
            <div className="space-y-3">
              {Object.entries(performanceScore.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm capitalize text-gray-300">{key}</span>
                    <span className="text-sm font-medium text-white">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#9256ff] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-lg ${
                insight.type === 'positive' ? 'border-[#2bc48a]/30 bg-[#2bc48a]/10' :
                insight.type === 'warning' ? 'border-yellow-600/30 bg-yellow-900/20' :
                'border-[#a06bff]/30 bg-[#9256ff]/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`w-5 h-5 mt-0.5 ${
                  insight.type === 'positive' ? 'text-[#2bc48a]' :
                  insight.type === 'warning' ? 'text-yellow-500' :
                  'text-[#a06bff]'
                }`} />
                <div>
                  <h4 className="font-semibold mb-1 text-white">{insight.title}</h4>
                  <p className="text-sm text-gray-400">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Facility Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Facility</th>
                <th className="text-left py-3 px-4">Yield (kg/m²)</th>
                <th className="text-left py-3 px-4">Energy (kWh/kg)</th>
                <th className="text-left py-3 px-4">Cost ($/kg)</th>
                <th className="text-left py-3 px-4">Efficiency</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {['Greenhouse A', 'Greenhouse B', 'Indoor Farm 1', 'Indoor Farm 2'].map((facility, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-[#2d2a55]/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{facility}</td>
                  <td className="py-3 px-4">{(40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)}</td>
                  <td className="py-3 px-4">{(30 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(1)}</td>
                  <td className="py-3 px-4">${(2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-[#2bc48a] h-2 rounded-full"
                          style={{ width: `${80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20}%` }}
                        />
                      </div>
                      <span className="text-sm">{(80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3 
                        ? 'bg-[#2bc48a]/20 text-[#2bc48a]' 
                        : 'bg-yellow-900/20 text-yellow-500'
                    }`}>
                      {crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3 ? 'Optimal' : 'Warning'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-[#2d2a55]/50 rounded-lg backdrop-blur-sm border border-purple-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Need deeper analysis?</h4>
            <p className="text-sm text-gray-400 mt-1">
              Generate custom reports or schedule automated analytics
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-purple-900/20 rounded-lg hover:bg-[#2d2a55] text-gray-300 transition-colors">
              Schedule Report
            </button>
            <button className="px-4 py-2 bg-[#9256ff] text-white rounded-lg hover:bg-[#a06bff] transition-colors">
              Custom Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Salesforce Integration Panel */}
      {showSalesforce && (
        <div className="fixed right-4 top-20 w-96 z-50 shadow-2xl">
          <SalesforceIntegration
            data={{
              projectStatus: 'Active',
              energySavings: metrics.find(m => m.id === 'efficiency')?.value || 28,
              roiPercentage: Math.round(parseFloat(metrics.find(m => m.id === 'revenue')?.value.toString().replace(/[^0-9.-]/g, '') || '0') / 1000),
              fixtureCount: 120,
              totalPPFD: 680,
              coverageArea: 12000,
              annualYieldEstimate: 52000,
              implementationTimeline: '2-3 months',
              annualSavings: parseFloat(metrics.find(m => m.id === 'costs')?.value.toString().replace(/[^0-9.-]/g, '') || '0'),
              paybackPeriod: 15,
              yieldImprovement: 30,
              spectrumOptimization: 'AI-Optimized Full Spectrum',
              qualityImprovement: 'Premium Grade'
            }}
            reportId={`analytics-${Date.now()}`}
            onClose={() => setShowSalesforce(false)}
          />
        </div>
      )}

      {/* Data Input Manager Modal */}
      {showDataInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1739] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-900/20">
            <div className="sticky top-0 bg-[#1a1739] p-6 border-b border-purple-900/20 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Data Input Manager</h2>
              <button
                onClick={() => setShowDataInput(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <DataInputManager 
                facilityId={facilityId} 
                facilityType={facilityType}
                onDataUpdate={handleDataUpdate} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1739] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-900/20">
            <div className="sticky top-0 bg-[#1a1739] p-6 border-b border-purple-900/20 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Analytics Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Display Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Show real-time updates</span>
                    <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Show advanced metrics</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Enable animations</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Data Range</h3>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Export Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Include raw data in exports</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Include charts in PDF exports</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                  </label>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="fixed right-4 top-20 w-80 bg-[#1a1739] rounded-xl border border-purple-900/20 shadow-2xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filter Options</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Metric Type</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="all">All Metrics</option>
                <option value="revenue">Revenue</option>
                <option value="yield">Yield</option>
                <option value="energy">Energy</option>
                <option value="quality">Quality</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Facility Type</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="all">All Facilities</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="indoor">Indoor Farm</option>
                <option value="vertical">Vertical Farm</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Status</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600 mr-2" />
                  <span className="text-gray-300">Optimal</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600 mr-2" />
                  <span className="text-gray-300">Warning</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-purple-600 mr-2" />
                  <span className="text-gray-300">Critical</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex gap-2">
              <button className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                Clear
              </button>
              <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}