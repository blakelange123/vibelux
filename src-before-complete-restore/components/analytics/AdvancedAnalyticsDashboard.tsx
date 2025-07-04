'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Zap,
  Droplets,
  Thermometer,
  Sun,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Gauge,
  LineChart,
  PieChart,
  Share2,
  FileText,
  Settings
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter
} from 'recharts';

interface MetricCard {
  title: string;
  value: string;
  unit?: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

interface TimeRange {
  label: string;
  value: string;
}

export function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('yield');

  const timeRanges: TimeRange[] = [
    { label: 'Today', value: '1d' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'Year', value: '1y' }
  ];

  const metrics: MetricCard[] = [
    {
      title: 'Total Yield',
      value: '1,847',
      unit: 'kg',
      change: 12.5,
      trend: 'up',
      icon: Activity,
      color: 'text-green-500'
    },
    {
      title: 'Energy Efficiency',
      value: '28.4',
      unit: 'kWh/kg',
      change: -8.7,
      trend: 'down',
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      title: 'Water Usage',
      value: '2.3',
      unit: 'L/kg',
      change: -15.2,
      trend: 'down',
      icon: Droplets,
      color: 'text-blue-500'
    },
    {
      title: 'Revenue',
      value: '$847k',
      unit: '',
      change: 18.3,
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-500'
    }
  ];

  // Sample data for charts
  const yieldTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    yield: 60 + Math.sin(i * 0.2) * 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
    target: 65,
    temperature: 24 + Math.sin(i * 0.3) * 2,
    humidity: 65 + Math.cos(i * 0.2) * 5
  }));

  const energyBreakdown = [
    { name: 'Lighting', value: 45, color: '#fbbf24' },
    { name: 'HVAC', value: 30, color: '#3b82f6' },
    { name: 'Irrigation', value: 15, color: '#10b981' },
    { name: 'Other', value: 10, color: '#8b5cf6' }
  ];

  const performanceRadar = [
    { metric: 'Yield', current: 92, target: 95 },
    { metric: 'Quality', current: 88, target: 90 },
    { metric: 'Energy', current: 85, target: 88 },
    { metric: 'Water', current: 91, target: 90 },
    { metric: 'Labor', current: 87, target: 85 },
    { metric: 'Cost', current: 83, target: 80 }
  ];

  const roomComparison = [
    { room: 'Room 1', yield: 2.8, energy: 28.5, water: 2.1, quality: 92 },
    { room: 'Room 2', yield: 2.6, energy: 30.2, water: 2.3, quality: 88 },
    { room: 'Room 3', yield: 2.9, energy: 27.8, water: 2.0, quality: 94 },
    { room: 'Room 4', yield: 2.7, energy: 29.1, water: 2.2, quality: 90 }
  ];

  const costAnalysis = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: 65 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
    costs: 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
    profit: 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-gray-900 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-sm">{metric.title}</p>
                    <p className="text-2xl font-bold text-white">
                      {metric.value}
                      {metric.unit && <span className="text-lg text-gray-400 ml-1">{metric.unit}</span>}
                    </p>
                  </div>
                  <div className={`p-3 bg-gray-800 rounded-lg ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`text-sm ${
                    metric.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-gray-500 text-sm">vs last period</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Yield Trend Chart */}
          <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Yield & Environmental Correlation</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                  Yield
                </button>
                <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                  Temperature
                </button>
                <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                  Humidity
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={yieldTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis yAxisId="yield" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis yAxisId="temp" orientation="right" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                <Area
                  yAxisId="yield"
                  type="monotone"
                  dataKey="yield"
                  fill="#8b5cf6"
                  stroke="#8b5cf6"
                  fillOpacity={0.3}
                  name="Yield (kg)"
                />
                <Line
                  yAxisId="yield"
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Temp (°C)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Energy Breakdown */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Energy Consumption</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={energyBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {energyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {energyBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Performance Radar */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Index</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={performanceRadar}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Room Comparison */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Room Performance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roomComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="room" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="yield" fill="#8b5cf6" name="Yield (kg/m²)" />
                <Bar dataKey="quality" fill="#10b981" name="Quality Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">AI Insights</h2>
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <h3 className="text-white font-medium">Yield Optimization</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Room 3 outperforms by 12% due to improved VPD control
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-white font-medium">Energy Alert</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  HVAC efficiency dropped 8% - maintenance recommended
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h3 className="text-white font-medium">Opportunity</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Adjust lighting schedule to save 15% energy costs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Financial Performance</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400 text-sm">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-gray-400 text-sm">Costs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-gray-400 text-sm">Profit</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="costs" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              <Area type="monotone" dataKey="profit" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <button className="p-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-white">Generate Report</span>
            </div>
            <Calendar className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span className="text-white">Share Dashboard</span>
            </div>
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-orange-400" />
              <span className="text-white">Configure Alerts</span>
            </div>
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChart className="w-5 h-5 text-green-400" />
              <span className="text-white">Custom Analysis</span>
            </div>
            <Target className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}