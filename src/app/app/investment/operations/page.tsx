'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Droplets,
  Thermometer,
  Clock,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Settings,
  Bell,
  Eye,
  Calculator
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface OperatorPerformance {
  id: string;
  name: string;
  facility: string;
  currentYield: number;
  baselineYield: number;
  yieldImprovement: number;
  revenue: number;
  operatorShare: number;
  investorShare: number;
  energyEfficiency: number;
  complianceScore: number;
  lastUpdated: string;
  alerts: number;
}

interface YieldHistory {
  date: string;
  yield: number;
  baseline: number;
  revenue: number;
}

export default function OperationsInvestmentPage() {
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [showAlerts, setShowAlerts] = useState(false);
  
  // Mock data for demonstration
  const operators: OperatorPerformance[] = [
    {
      id: '1',
      name: 'Green Valley Farms',
      facility: 'Facility A - Lettuce',
      currentYield: 6.2,
      baselineYield: 4.8,
      yieldImprovement: 29.2,
      revenue: 45000,
      operatorShare: 22500,
      investorShare: 22500,
      energyEfficiency: 92,
      complianceScore: 98,
      lastUpdated: '2 mins ago',
      alerts: 0
    },
    {
      id: '2',
      name: 'Urban Harvest Co',
      facility: 'Facility B - Tomatoes',
      currentYield: 18.5,
      baselineYield: 15.2,
      yieldImprovement: 21.7,
      revenue: 68000,
      operatorShare: 34000,
      investorShare: 34000,
      energyEfficiency: 88,
      complianceScore: 95,
      lastUpdated: '5 mins ago',
      alerts: 1
    },
    {
      id: '3',
      name: 'SunRise Growers',
      facility: 'Facility C - Herbs',
      currentYield: 3.8,
      baselineYield: 3.2,
      yieldImprovement: 18.8,
      revenue: 32000,
      operatorShare: 16000,
      investorShare: 16000,
      energyEfficiency: 85,
      complianceScore: 91,
      lastUpdated: '1 hour ago',
      alerts: 2
    }
  ];
  
  const totalMetrics = {
    totalRevenue: operators.reduce((sum, op) => sum + op.revenue, 0),
    totalInvestorShare: operators.reduce((sum, op) => sum + op.investorShare, 0),
    averageYieldImprovement: operators.reduce((sum, op) => sum + op.yieldImprovement, 0) / operators.length,
    totalAlerts: operators.reduce((sum, op) => sum + op.alerts, 0)
  };
  
  const yieldHistory: YieldHistory[] = [
    { date: 'Week 1', yield: 4.9, baseline: 4.8, revenue: 35000 },
    { date: 'Week 2', yield: 5.2, baseline: 4.8, revenue: 38000 },
    { date: 'Week 3', yield: 5.5, baseline: 4.8, revenue: 41000 },
    { date: 'Week 4', yield: 5.8, baseline: 4.8, revenue: 43000 },
    { date: 'Week 5', yield: 6.0, baseline: 4.8, revenue: 44000 },
    { date: 'Week 6', yield: 6.2, baseline: 4.8, revenue: 45000 }
  ];
  
  const operatorMetrics = [
    { metric: 'Yield', score: 92, benchmark: 85 },
    { metric: 'Energy', score: 88, benchmark: 80 },
    { metric: 'Quality', score: 95, benchmark: 90 },
    { metric: 'Compliance', score: 98, benchmark: 95 },
    { metric: 'Efficiency', score: 90, benchmark: 82 }
  ];
  
  const alertsData = [
    { id: 1, operator: 'Urban Harvest Co', type: 'warning', message: 'Energy consumption 15% above target', time: '2 hours ago' },
    { id: 2, operator: 'SunRise Growers', type: 'critical', message: 'Temperature outside optimal range', time: '3 hours ago' },
    { id: 3, operator: 'SunRise Growers', type: 'warning', message: 'Maintenance schedule overdue', time: '1 day ago' }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Operations Investment Monitor</h1>
              <p className="text-gray-400">50% Yield Enhancement Partnership</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="text-sm">Alerts</span>
                {totalMetrics.totalAlerts > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 rounded-full text-xs">{totalMetrics.totalAlerts}</span>
                )}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export Report</span>
              </button>
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </span>
            </div>
            <div className="text-2xl font-bold">${totalMetrics.totalInvestorShare.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Your Share (50%)</div>
            <div className="mt-2 text-xs text-gray-500">
              Total Revenue: ${totalMetrics.totalRevenue.toLocaleString()}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.2%
              </span>
            </div>
            <div className="text-2xl font-bold">{totalMetrics.averageYieldImprovement.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Avg Yield Improvement</div>
            <div className="mt-2 text-xs text-gray-500">
              Above baseline across all facilities
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
            <div className="text-2xl font-bold">{operators.length}</div>
            <div className="text-sm text-gray-400">Active Operators</div>
            <div className="mt-2 text-xs text-gray-500">
              All systems operational
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              {totalMetrics.totalAlerts > 0 && (
                <span className="px-2 py-1 bg-red-600 rounded text-xs">Action Required</span>
              )}
            </div>
            <div className="text-2xl font-bold">{totalMetrics.totalAlerts}</div>
            <div className="text-sm text-gray-400">Active Alerts</div>
            <div className="mt-2 text-xs text-gray-500">
              {totalMetrics.totalAlerts > 0 ? 'Review immediately' : 'All systems normal'}
            </div>
          </motion.div>
        </div>
        
        {/* Operator Performance Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Operator Performance</h2>
              <div className="flex items-center gap-4">
                <select className="bg-gray-700 text-sm px-3 py-1.5 rounded-lg">
                  <option value="30d">Last 30 Days</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="24h">Last 24 Hours</option>
                </select>
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Operator/Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Current Yield
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Improvement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Revenue Split
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {operators.map((operator) => (
                  <tr key={operator.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium">{operator.name}</div>
                        <div className="text-xs text-gray-400">{operator.facility}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium">{operator.currentYield} kg/m²/mo</div>
                        <div className="text-xs text-gray-400">Baseline: {operator.baselineYield}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${operator.yieldImprovement > 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                          +{operator.yieldImprovement.toFixed(1)}%
                        </span>
                        {operator.yieldImprovement > 25 ? (
                          <ChevronUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm">
                          <span className="text-gray-400">You:</span> ${operator.investorShare.toLocaleString()}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-400">Operator:</span> ${operator.operatorShare.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{operator.energyEfficiency}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">{operator.complianceScore}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs text-gray-400">Updated {operator.lastUpdated}</span>
                        {operator.alerts > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-600 rounded-full text-xs">
                            {operator.alerts} alert{operator.alerts > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOperator(operator.id)}
                          className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                          <Calculator className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Yield Trend Chart */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Yield Trend vs Baseline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yieldHistory}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Baseline"
                />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#yieldGradient)"
                  name="Actual Yield"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Revenue Distribution */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Distribution (50/50 Split)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={operators}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
                <Bar dataKey="investorShare" fill="#8b5cf6" name="Your Share" />
                <Bar dataKey="operatorShare" fill="#3b82f6" name="Operator Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Operator Performance Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={operatorMetrics}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar name="Current" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Alerts Panel */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Alerts</h3>
              <button className="text-sm text-gray-400 hover:text-white">View All</button>
            </div>
            <div className="space-y-3">
              {alertsData.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.type === 'critical' ? 'bg-red-900/20 border-red-700' : 'bg-yellow-900/20 border-yellow-700'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${
                        alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{alert.operator}</div>
                        <div className="text-sm text-gray-300 mt-1">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-2">{alert.time}</div>
                      </div>
                    </div>
                    <button className="text-xs text-gray-400 hover:text-white">Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}