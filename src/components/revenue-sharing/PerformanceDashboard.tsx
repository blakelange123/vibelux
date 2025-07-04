'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Leaf,
  Activity,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  FileText
} from 'lucide-react';
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
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface PerformanceMetric {
  id: string;
  type: 'energy_savings' | 'yield_improvement' | 'cost_reduction' | 'revenue_increase';
  currentValue: number;
  baselineValue: number;
  savings: number;
  percentageChange: number;
  unit: string;
  timestamp: Date;
}

interface BillingStatus {
  currentPeriod: string;
  totalSavings: number;
  revenueShareAmount: number;
  status: 'calculating' | 'pending' | 'paid' | 'disputed';
  dueDate: Date;
}

export function PerformanceDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'energy' | 'yield' | 'cost'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Mock real-time data - in production, this would come from APIs
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: '1',
      type: 'energy_savings',
      currentValue: 78500,
      baselineValue: 95000,
      savings: 16500,
      percentageChange: -17.4,
      unit: 'kWh',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'yield_improvement',
      currentValue: 4250,
      baselineValue: 3800,
      savings: 450,
      percentageChange: 11.8,
      unit: 'lbs',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'cost_reduction',
      currentValue: 28500,
      baselineValue: 35000,
      savings: 6500,
      percentageChange: -18.6,
      unit: '$',
      timestamp: new Date()
    }
  ]);

  const [billingStatus] = useState<BillingStatus>({
    currentPeriod: 'November 2024',
    totalSavings: 23450,
    revenueShareAmount: 4690,
    status: 'calculating',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  });

  // Historical data for charts
  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: 95000 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20000,
      yield: 3800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600,
      cost: 35000 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8000,
      baseline: 95000
    };
  });

  // Revenue share breakdown
  const revenueShareBreakdown = [
    { name: 'Energy Savings', value: 45, amount: 2105 },
    { name: 'Yield Improvement', value: 35, amount: 1641 },
    { name: 'Cost Reduction', value: 20, amount: 944 }
  ];

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B'];

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with new mock data
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      currentValue: metric.baselineValue * (1 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.3),
      timestamp: new Date()
    })));
    
    setIsLoading(false);
  };

  useEffect(() => {
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'energy_savings': return <Zap className="w-5 h-5" />;
      case 'yield_improvement': return <Leaf className="w-5 h-5" />;
      case 'cost_reduction': return <DollarSign className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'energy_savings': return 'text-blue-400';
      case 'yield_improvement': return 'text-green-400';
      case 'cost_reduction': return 'text-yellow-400';
      default: return 'text-purple-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Revenue Sharing Performance
              <span className="px-3 py-1 bg-green-900/20 text-green-400 text-sm font-medium rounded-full">
                Live Tracking
              </span>
            </h1>
            <p className="text-gray-400 mt-1">Real-time monitoring of your savings and revenue share</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Billing Status Alert */}
        <div className={`p-4 rounded-lg border ${
          billingStatus.status === 'calculating' ? 'bg-blue-900/20 border-blue-600/30' :
          billingStatus.status === 'pending' ? 'bg-yellow-900/20 border-yellow-600/30' :
          billingStatus.status === 'paid' ? 'bg-green-900/20 border-green-600/30' :
          'bg-red-900/20 border-red-600/30'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {billingStatus.status === 'calculating' ? <Clock className="w-5 h-5 text-blue-400 mt-0.5" /> :
               billingStatus.status === 'pending' ? <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" /> :
               billingStatus.status === 'paid' ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> :
               <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />}
              <div>
                <h3 className="font-semibold text-white">
                  {billingStatus.currentPeriod} Revenue Share: ${billingStatus.revenueShareAmount.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Based on ${billingStatus.totalSavings.toLocaleString()} in verified savings • 
                  {billingStatus.status === 'calculating' ? ' Final calculation in progress' :
                   billingStatus.status === 'pending' ? ` Due ${billingStatus.dueDate.toLocaleDateString()}` :
                   billingStatus.status === 'paid' ? ' Payment received' :
                   ' Under review'}
                </p>
              </div>
            </div>
            {billingStatus.status === 'pending' && (
              <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors">
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['day', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric) => {
            const isPositive = metric.type === 'yield_improvement' ? 
              metric.percentageChange > 0 : metric.percentageChange < 0;
            
            return (
              <div key={metric.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 bg-gray-800 rounded-lg ${getMetricColor(metric.type)}`}>
                    {getMetricIcon(metric.type)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(metric.percentageChange)}%
                  </div>
                </div>
                
                <h3 className="text-gray-400 text-sm mb-1">
                  {metric.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h3>
                <p className="text-2xl font-bold text-white mb-2">
                  {metric.currentValue.toLocaleString()} {metric.unit}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Baseline: {metric.baselineValue.toLocaleString()}
                  </span>
                  <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{metric.savings.toLocaleString()} {metric.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Energy (kWh)"
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#EF4444"
                    strokeDasharray="5 5"
                    name="Baseline"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Share Breakdown */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Share Breakdown</h3>
            <div className="h-64 flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={revenueShareBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueShareBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {revenueShareBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400">Total</span>
                    <span className="text-lg font-bold text-white">
                      ${billingStatus.revenueShareAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        {showDetails && (
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Detailed Performance Metrics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Metric</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Current</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Baseline</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Savings</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">% Change</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => {
                    const revenueShare = Math.abs(metric.savings) * 0.2; // 20% share
                    return (
                      <tr key={metric.id} className="border-b border-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {metric.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {metric.currentValue.toLocaleString()} {metric.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {metric.baselineValue.toLocaleString()} {metric.unit}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-green-400">
                          {metric.savings.toLocaleString()} {metric.unit}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${
                            metric.type === 'yield_improvement' ? 
                              (metric.percentageChange > 0 ? 'text-green-400' : 'text-red-400') :
                              (metric.percentageChange < 0 ? 'text-green-400' : 'text-red-400')
                          }`}>
                            {metric.percentageChange > 0 ? '+' : ''}{metric.percentageChange}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-purple-400 font-medium">
                          ${revenueShare.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center gap-2"
          >
            {showDetails ? 'Hide' : 'Show'} Detailed Metrics
            <BarChart3 className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure Baselines
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}