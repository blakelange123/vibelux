'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  Zap,
  Target,
  Clock,
  BarChart3,
  Lightbulb,
  Droplets,
  ThermometerSun,
  Leaf
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OperationalMetrics {
  energyPerGram: number;
  waterPerGram: number;
  laborHoursPerPound: number;
  yieldPerSqFt: number;
  qualityScore: number;
  costPerGram: number;
}

interface EnvironmentalCorrelation {
  parameter: string;
  correlation: number;
  impact: 'positive' | 'negative';
  recommendation: string;
}

export function OperationalInsights() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'cycle'>('week');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  // Simulated operational data
  const metrics: OperationalMetrics = {
    energyPerGram: 45.2, // kWh/g
    waterPerGram: 3.8, // L/g
    laborHoursPerPound: 2.4,
    yieldPerSqFt: 65.3, // g/sq ft
    qualityScore: 92, // %
    costPerGram: 1.85 // $
  };

  // Environmental correlations with yield
  const correlations: EnvironmentalCorrelation[] = [
    {
      parameter: 'DLI Consistency',
      correlation: 0.89,
      impact: 'positive',
      recommendation: 'Maintain DLI within 5% of target'
    },
    {
      parameter: 'VPD Variance',
      correlation: -0.72,
      impact: 'negative',
      recommendation: 'Reduce VPD swings during lights-on'
    },
    {
      parameter: 'pH Stability',
      correlation: 0.81,
      impact: 'positive',
      recommendation: 'Keep pH drift under 0.3 daily'
    },
    {
      parameter: 'Temperature Spikes',
      correlation: -0.65,
      impact: 'negative',
      recommendation: 'Improve HVAC response time'
    }
  ];

  // Cost breakdown data
  const costBreakdown = [
    { name: 'Energy', value: 35, color: '#3B82F6' },
    { name: 'Labor', value: 28, color: '#10B981' },
    { name: 'Nutrients', value: 15, color: '#F59E0B' },
    { name: 'Water', value: 8, color: '#06B6D4' },
    { name: 'Other', value: 14, color: '#8B5CF6' }
  ];

  // Trend data
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    yield: 62 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
    energy: 44 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
    quality: 90 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5
  }));

  const getMetricStatus = (current: number, target: number, inverse: boolean = false) => {
    const performance = inverse ? target / current : current / target;
    if (performance >= 0.95) return { color: 'text-green-400', status: 'Excellent' };
    if (performance >= 0.85) return { color: 'text-yellow-400', status: 'Good' };
    return { color: 'text-red-400', status: 'Needs Improvement' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Operational Insights</h2>
          <p className="text-gray-400">Connecting environment to outcomes</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Rooms</option>
            <option value="flower-a">Flower Room A</option>
            <option value="flower-b">Flower Room B</option>
            <option value="veg">Veg Room</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="cycle">This Cycle</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <span className={`text-xs ${getMetricStatus(metrics.yieldPerSqFt, 70).color}`}>
              {getMetricStatus(metrics.yieldPerSqFt, 70).status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.yieldPerSqFt.toFixed(1)}</p>
          <p className="text-xs text-gray-400">g/sq ft</p>
          <p className="text-xs text-gray-500 mt-1">Target: 70</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className={`text-xs ${getMetricStatus(metrics.energyPerGram, 40, true).color}`}>
              {getMetricStatus(metrics.energyPerGram, 40, true).status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.energyPerGram.toFixed(1)}</p>
          <p className="text-xs text-gray-400">kWh/g</p>
          <p className="text-xs text-gray-500 mt-1">Target: &lt;40</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className={`text-xs ${getMetricStatus(metrics.waterPerGram, 3.5, true).color}`}>
              {getMetricStatus(metrics.waterPerGram, 3.5, true).status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.waterPerGram.toFixed(1)}</p>
          <p className="text-xs text-gray-400">L/g</p>
          <p className="text-xs text-gray-500 mt-1">Target: &lt;3.5</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className={`text-xs ${getMetricStatus(metrics.laborHoursPerPound, 2.0, true).color}`}>
              {getMetricStatus(metrics.laborHoursPerPound, 2.0, true).status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.laborHoursPerPound.toFixed(1)}</p>
          <p className="text-xs text-gray-400">hrs/lb</p>
          <p className="text-xs text-gray-500 mt-1">Target: &lt;2.0</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className={`text-xs ${getMetricStatus(metrics.qualityScore, 90).color}`}>
              {getMetricStatus(metrics.qualityScore, 90).status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.qualityScore}%</p>
          <p className="text-xs text-gray-400">Quality</p>
          <p className="text-xs text-gray-500 mt-1">Target: &gt;90%</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className={`text-xs ${getMetricStatus(metrics.costPerGram, 1.50, true).color}`}>
              {getMetricStatus(metrics.costPerGram, 1.50, true).status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">${metrics.costPerGram.toFixed(2)}</p>
          <p className="text-xs text-gray-400">per gram</p>
          <p className="text-xs text-gray-500 mt-1">Target: &lt;$1.50</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Environmental Impact Analysis */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Environmental Impact on Yield</h3>
          <div className="space-y-3">
            {correlations.map((item, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{item.parameter}</span>
                  <span className={`text-sm font-medium ${
                    item.impact === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.impact === 'positive' ? '+' : ''}{(item.correlation * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.impact === 'positive' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{item.recommendation}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-300">Optimization Opportunity</p>
                <p className="text-xs text-gray-300 mt-1">
                  Improving DLI consistency could increase yield by up to 8.2% based on current variance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Cost per Gram Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${value}%`}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {costBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="yield" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Yield (g/sqft)"
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Energy (kWh/g)"
              />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Quality Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          AI-Powered Recommendations
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">Increase Light Intensity</p>
                <p className="text-sm text-gray-300">
                  Rooms A & B are 12% below optimal DLI. Increase to 45 mol/m²/day for 7% yield gain.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <ThermometerSun className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Optimize VPD Schedule</p>
                <p className="text-sm text-gray-300">
                  Adjust night temps 2°C higher to maintain VPD. Expected 5% quality improvement.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-white">Shift Irrigation Schedule</p>
                <p className="text-sm text-gray-300">
                  Move first irrigation 30min earlier based on transpiration data. Save 8% water.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-white">Address pH Drift</p>
                <p className="text-sm text-gray-300">
                  Tank B showing 0.4 daily drift. Check dosing pumps. Risk of nutrient lockout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}