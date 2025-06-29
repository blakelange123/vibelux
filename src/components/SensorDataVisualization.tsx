"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar, Download, Filter, Maximize2 } from 'lucide-react'

interface SensorDataPoint {
  timestamp: string
  ppfd: number
  temperature: number
  humidity: number
  vpd: number
  dli: number
}

interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'scatter'
  metric: 'ppfd' | 'temperature' | 'humidity' | 'vpd' | 'dli'
  timeRange: '24h' | '7d' | '30d'
  aggregation: 'raw' | 'hourly' | 'daily'
}

export function SensorDataVisualization() {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'line',
    metric: 'ppfd',
    timeRange: '24h',
    aggregation: 'hourly'
  })
  const [data, setData] = useState<SensorDataPoint[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Generate sample data based on config
  useEffect(() => {
    const generateData = () => {
      const points: SensorDataPoint[] = []
      const now = new Date()
      
      let intervals = 24
      if (chartConfig.timeRange === '7d') intervals = 168
      if (chartConfig.timeRange === '30d') intervals = 720
      
      if (chartConfig.aggregation === 'daily' && chartConfig.timeRange !== '24h') {
        intervals = chartConfig.timeRange === '7d' ? 7 : 30
      }

      for (let i = 0; i < intervals; i++) {
        const timestamp = new Date(now.getTime() - (intervals - i) * 60 * 60 * 1000)
        const hour = timestamp.getHours()
        
        // Simulate realistic patterns
        const isDayTime = hour >= 6 && hour <= 22
        const basePPFD = isDayTime ? 600 : 0
        const ppfd = basePPFD + (isDayTime ? Math.sin(i / 10) * 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 : 0)
        
        const baseTemp = 72 + Math.sin(i / 12) * 5
        const temperature = baseTemp + (isDayTime ? 3 : -2) + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2
        
        const baseHumidity = 55 + Math.cos(i / 8) * 10
        const humidity = Math.max(30, Math.min(80, baseHumidity + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5))
        
        // Calculate VPD
        const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3))
        const vpd = (1 - humidity / 100) * svp
        
        // Calculate DLI (simplified)
        const dli = i === 0 ? 0 : (points[i-1]?.dli || 0) + (ppfd * 0.0036)

        points.push({
          timestamp: chartConfig.aggregation === 'daily' 
            ? timestamp.toLocaleDateString() 
            : timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ppfd: Math.round(ppfd),
          temperature: Math.round(temperature * 10) / 10,
          humidity: Math.round(humidity),
          vpd: Math.round(vpd * 100) / 100,
          dli: Math.round(dli * 10) / 10
        })
      }

      setData(points)
    }

    generateData()
  }, [chartConfig])

  const metricConfig = {
    ppfd: { 
      name: 'PPFD', 
      unit: 'μmol/m²/s', 
      color: '#a78bfa',
      domain: [0, 800] 
    },
    temperature: { 
      name: 'Temperature', 
      unit: '°F', 
      color: '#fb923c',
      domain: [60, 85] 
    },
    humidity: { 
      name: 'Humidity', 
      unit: '%', 
      color: '#60a5fa',
      domain: [30, 80] 
    },
    vpd: { 
      name: 'VPD', 
      unit: 'kPa', 
      color: '#34d399',
      domain: [0.5, 1.5] 
    },
    dli: { 
      name: 'DLI', 
      unit: 'mol/m²/day', 
      color: '#f59e0b',
      domain: [0, 40] 
    }
  }

  const currentMetric = metricConfig[chartConfig.metric]

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    const commonProps = {
      dataKey: chartConfig.metric,
      stroke: currentMetric.color,
      fill: currentMetric.color,
      strokeWidth: 2
    }

    switch (chartConfig.type) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={currentMetric.domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Area {...commonProps} fillOpacity={0.3} />
          </AreaChart>
        )
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={currentMetric.domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Bar {...commonProps} />
          </BarChart>
        )
      
      case 'scatter':
        return (
          <ScatterChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" />
            <YAxis dataKey={chartConfig.metric} stroke="#9ca3af" domain={currentMetric.domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Scatter data={data} fill={currentMetric.color} />
          </ScatterChart>
        )
      
      default: // line
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={currentMetric.domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Line {...commonProps} dot={false} />
          </LineChart>
        )
    }
  }

  const exportData = () => {
    const csv = [
      'Timestamp,PPFD,Temperature,Humidity,VPD,DLI',
      ...data.map(d => 
        `${d.timestamp},${d.ppfd},${d.temperature},${d.humidity},${d.vpd},${d.dli}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sensor-data-${chartConfig.metric}-${Date.now()}.csv`
    a.click()
  }

  // Calculate statistics
  const stats = {
    average: Math.round(data.reduce((sum, d) => sum + d[chartConfig.metric], 0) / data.length * 10) / 10,
    min: Math.min(...data.map(d => d[chartConfig.metric])),
    max: Math.max(...data.map(d => d[chartConfig.metric])),
    current: data[data.length - 1]?.[chartConfig.metric] || 0
  }

  return (
    <div className={`bg-gray-900 rounded-xl p-6 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          Sensor Data Analytics
        </h3>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={exportData}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Metric Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Metric</label>
          <select
            value={chartConfig.metric}
            onChange={(e) => setChartConfig({ ...chartConfig, metric: e.target.value as any })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            {Object.entries(metricConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>

        {/* Chart Type */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Chart Type</label>
          <select
            value={chartConfig.type}
            onChange={(e) => setChartConfig({ ...chartConfig, type: e.target.value as any })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
            <option value="scatter">Scatter</option>
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Time Range</label>
          <select
            value={chartConfig.timeRange}
            onChange={(e) => setChartConfig({ ...chartConfig, timeRange: e.target.value as any })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
        </div>

        {/* Aggregation */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Aggregation</label>
          <select
            value={chartConfig.aggregation}
            onChange={(e) => setChartConfig({ ...chartConfig, aggregation: e.target.value as any })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="raw">Raw Data</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Current</p>
          <p className="text-lg font-semibold text-white">
            {stats.current} {currentMetric.unit}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Average</p>
          <p className="text-lg font-semibold text-white">
            {stats.average} {currentMetric.unit}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Min</p>
          <p className="text-lg font-semibold text-white">
            {stats.min} {currentMetric.unit}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Max</p>
          <p className="text-lg font-semibold text-white">
            {stats.max} {currentMetric.unit}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}