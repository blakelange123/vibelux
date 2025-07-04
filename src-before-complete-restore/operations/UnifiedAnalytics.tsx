'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  DollarSign,
  Users,
  Leaf,
  Droplets,
  Thermometer,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  Info,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Legend
} from 'recharts';

interface PerformanceMetric {
  category: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

interface YieldData {
  week: string;
  actual: number;
  predicted: number;
  environmental: number;
}

export function UnifiedAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Comprehensive performance data
  const performanceData: PerformanceMetric[] = [
    { category: 'Yield Efficiency', current: 92, target: 95, trend: 'up' },
    { category: 'Energy Usage', current: 78, target: 70, trend: 'down' },
    { category: 'Labor Productivity', current: 88, target: 85, trend: 'up' },
    { category: 'Quality Score', current: 94, target: 90, trend: 'stable' },
    { category: 'Cost Control', current: 82, target: 80, trend: 'down' },
    { category: 'Compliance', current: 96, target: 100, trend: 'up' }
  ];

  // Yield correlation data
  const yieldCorrelation = [
    { week: 'W1', actual: 62, predicted: 60, environmental: 88 },
    { week: 'W2', actual: 65, predicted: 63, environmental: 92 },
    { week: 'W3', actual: 58, predicted: 62, environmental: 75 },
    { week: 'W4', actual: 68, predicted: 66, environmental: 95 },
    { week: 'W5', actual: 70, predicted: 68, environmental: 98 },
    { week: 'W6', actual: 64, predicted: 65, environmental: 85 }
  ];

  // Multi-factor analysis for radar chart
  const radarData = [
    { factor: 'Temperature', roomA: 85, roomB: 92, optimal: 95 },
    { factor: 'Humidity', roomA: 78, roomB: 88, optimal: 90 },
    { factor: 'Light', roomA: 92, roomB: 85, optimal: 100 },
    { factor: 'Nutrients', roomA: 88, roomB: 90, optimal: 95 },
    { factor: 'CO2', roomA: 95, roomB: 82, optimal: 100 },
    { factor: 'Airflow', roomA: 80, roomB: 85, optimal: 90 }
  ];

  // Cost breakdown over time
  const costTrend = [
    { month: 'Jan', labor: 12000, energy: 8000, nutrients: 4000, other: 3000 },
    { month: 'Feb', labor: 11500, energy: 8500, nutrients: 3800, other: 3200 },
    { month: 'Mar', labor: 12200, energy: 7800, nutrients: 4200, other: 2900 },
    { month: 'Apr', labor: 11800, energy: 7500, nutrients: 4100, other: 3100 },
    { month: 'May', labor: 12500, energy: 7200, nutrients: 4300, other: 3000 },
    { month: 'Jun', labor: 12000, energy: 7000, nutrients: 4000, other: 2800 }
  ];

  // ROI metrics
  const roiMetrics = {
    currentMonthRevenue: 125000,
    currentMonthCosts: 45000,
    currentMonthProfit: 80000,
    projectedAnnualROI: 2.8,
    paybackPeriod: 4.2,
    grossMargin: 64
  };

  // Key insights
  const insights = [
    {
      type: 'positive',
      title: 'Yield Improvement',
      description: 'DLI optimization resulted in 8% yield increase in Flower Room A',
      impact: '+$12,500/month',
      action: 'Apply same settings to Room B'
    },
    {
      type: 'warning',
      title: 'Energy Spike',
      description: 'Dehumidifier efficiency dropped 15% in last 2 weeks',
      impact: '+$450/month',
      action: 'Schedule maintenance ASAP'
    },
    {
      type: 'opportunity',
      title: 'Labor Optimization',
      description: 'Task automation can reduce manual labor by 3 hours/day',
      impact: '-$2,800/month',
      action: 'Enable auto-scheduling'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Unified Analytics</h2>
          <p className="text-gray-400">Comprehensive operational and environmental insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Rooms</option>
            <option value="flower-a">Flower A</option>
            <option value="flower-b">Flower B</option>
            <option value="veg">Veg Room</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Monthly Revenue</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            ${(roiMetrics.currentMonthRevenue / 1000).toFixed(0)}k
          </p>
          <p className="text-sm text-green-400 mt-1">+12% vs last month</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Operating Costs</span>
            <Activity className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            ${(roiMetrics.currentMonthCosts / 1000).toFixed(0)}k
          </p>
          <p className="text-sm text-green-400 mt-1">-5% optimization</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Gross Margin</span>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{roiMetrics.grossMargin}%</p>
          <p className="text-sm text-gray-400 mt-1">Industry avg: 55%</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Annual ROI</span>
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{roiMetrics.projectedAnnualROI}x</p>
          <p className="text-sm text-gray-400 mt-1">{roiMetrics.paybackPeriod} mo payback</p>
        </div>
      </div>

      {/* Performance Scorecard */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Scorecard</h3>
        <div className="grid grid-cols-3 gap-4">
          {performanceData.map((metric, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{metric.category}</span>
                <span className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-400' :
                  metric.trend === 'down' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{metric.current}%</p>
                <p className="text-xs text-gray-500">target: {metric.target}%</p>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.current >= metric.target ? 'bg-green-500' :
                    metric.current >= metric.target * 0.9 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metric.current}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Yield vs Environmental Score */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Yield Correlation Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yieldCorrelation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="actual" fill="#10B981" name="Actual Yield (g/sqft)" />
                <Line yAxisId="left" type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} name="Predicted" />
                <Line yAxisId="right" type="monotone" dataKey="environmental" stroke="#F59E0B" strokeWidth={2} name="Env Score %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Strong correlation (R²=0.87) between environmental score and yield outcomes
          </p>
        </div>

        {/* Multi-Room Comparison Radar */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Room Performance Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="factor" stroke="#9CA3AF" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                <Radar name="Room A" dataKey="roomA" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Radar name="Room B" dataKey="roomB" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Optimal" dataKey="optimal" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} strokeDasharray="5 5" />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Trend Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Area type="monotone" dataKey="labor" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
              <Area type="monotone" dataKey="energy" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
              <Area type="monotone" dataKey="nutrients" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="other" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Actionable Insights</h3>
        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              insight.type === 'positive' ? 'bg-green-900/20 border-green-600/30' :
              insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-600/30' :
              'bg-blue-900/20 border-blue-600/30'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'positive' ? 'bg-green-900/50' :
                  insight.type === 'warning' ? 'bg-yellow-900/50' :
                  'bg-blue-900/50'
                }`}>
                  {insight.type === 'positive' ? <TrendingUp className="w-5 h-5 text-green-400" /> :
                   insight.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-400" /> :
                   <Target className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
                  <p className={`text-sm font-medium mt-2 ${
                    insight.type === 'positive' ? 'text-green-400' :
                    insight.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    Impact: {insight.impact}
                  </p>
                  <button className="mt-3 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    {insight.action} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Modeling */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">Predictive Modeling</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Next Month Yield</p>
            <p className="text-2xl font-bold text-white">+5.2%</p>
            <p className="text-xs text-gray-500">confidence: 89%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Energy Savings</p>
            <p className="text-2xl font-bold text-green-400">$1,850</p>
            <p className="text-xs text-gray-500">from optimization</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Quality Score</p>
            <p className="text-2xl font-bold text-purple-400">96.5</p>
            <p className="text-xs text-gray-500">+2.5 improvement</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">ROI Timeline</p>
            <p className="text-2xl font-bold text-blue-400">3.8 mo</p>
            <p className="text-xs text-gray-500">accelerated by 0.4mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}