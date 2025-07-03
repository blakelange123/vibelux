'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Award,
  Calendar,
  Download,
  Filter,
  Activity,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Mock analytics data
const laborCostData = [
  { month: 'Jan', regular: 45000, overtime: 5000, total: 50000 },
  { month: 'Feb', regular: 48000, overtime: 4200, total: 52200 },
  { month: 'Mar', regular: 52000, overtime: 6800, total: 58800 },
  { month: 'Apr', regular: 49000, overtime: 3500, total: 52500 },
  { month: 'May', regular: 51000, overtime: 5200, total: 56200 },
  { month: 'Jun', regular: 54000, overtime: 4800, total: 58800 }
];

const productivityData = [
  { week: 'Week 1', target: 100, actual: 95, efficiency: 95 },
  { week: 'Week 2', target: 100, actual: 102, efficiency: 102 },
  { week: 'Week 3', target: 100, actual: 98, efficiency: 98 },
  { week: 'Week 4', target: 100, actual: 105, efficiency: 105 },
  { week: 'Week 5', target: 100, actual: 92, efficiency: 92 },
  { week: 'Week 6', target: 100, actual: 108, efficiency: 108 }
];

const attendanceData = [
  { date: '2024-01-15', present: 18, absent: 2, late: 1, total: 20 },
  { date: '2024-01-16', present: 19, absent: 1, late: 0, total: 20 },
  { date: '2024-01-17', present: 17, absent: 2, late: 1, total: 20 },
  { date: '2024-01-18', present: 20, absent: 0, late: 0, total: 20 },
  { date: '2024-01-19', present: 18, absent: 1, late: 1, total: 20 },
  { date: '2024-01-20', present: 16, absent: 3, late: 1, total: 20 },
  { date: '2024-01-21', present: 15, absent: 4, late: 1, total: 20 }
];

const departmentData = [
  { name: 'Cultivation', employees: 12, hours: 480, cost: 24000, color: '#10b981' },
  { name: 'Processing', employees: 4, hours: 160, cost: 8000, color: '#3b82f6' },
  { name: 'Packaging', employees: 3, hours: 120, cost: 6000, color: '#f59e0b' },
  { name: 'Quality', employees: 2, hours: 80, cost: 4000, color: '#8b5cf6' },
  { name: 'Maintenance', employees: 1, hours: 40, cost: 2000, color: '#ef4444' }
];

const overtimeData = [
  { employee: 'Sarah Johnson', regular: 40, overtime: 2.5, total: 42.5 },
  { employee: 'Mike Chen', regular: 40, overtime: 4.0, total: 44.0 },
  { employee: 'Jessica Martinez', regular: 32, overtime: 0, total: 32.0 },
  { employee: 'David Wilson', regular: 40, overtime: 1.5, total: 41.5 },
  { employee: 'Lisa Thompson', regular: 40, overtime: 3.0, total: 43.0 }
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('cost');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const kpiData = {
    totalLaborCost: 58800,
    avgHourlyRate: 26.50,
    productivityRate: 95.8,
    attendanceRate: 92.5,
    overtimeRate: 8.2,
    turnoverRate: 5.3
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Labor Analytics</h1>
                <p className="text-gray-400">Track productivity and labor costs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Labor Cost</span>
            </div>
            <div className="text-lg font-bold text-green-400">{formatCurrency(kpiData.totalLaborCost)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400">+5.2%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Avg Rate</span>
            </div>
            <div className="text-lg font-bold text-blue-400">${kpiData.avgHourlyRate}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400">+2.1%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Productivity</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{kpiData.productivityRate}%</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-red-400">-1.8%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Attendance</span>
            </div>
            <div className="text-lg font-bold text-green-400">{kpiData.attendanceRate}%</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400">+0.5%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Overtime</span>
            </div>
            <div className="text-lg font-bold text-yellow-400">{kpiData.overtimeRate}%</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-red-400" />
              <span className="text-red-400">+1.2%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Turnover</span>
            </div>
            <div className="text-lg font-bold text-red-400">{kpiData.turnoverRate}%</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="w-3 h-3 text-green-400" />
              <span className="text-green-400">-0.8%</span>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Labor Cost Trend */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Labor Cost Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={laborCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Total Cost"
                />
                <Area
                  type="monotone"
                  dataKey="overtime"
                  stackId="2"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.5}
                  name="Overtime Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Productivity vs Target */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Productivity vs Target</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                  name="Target"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Department Distribution */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employees"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Tracking */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overtime Analysis */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Overtime by Employee</h3>
            <div className="space-y-3">
              {overtimeData.map((employee, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{employee.employee}</div>
                    <div className="text-xs text-gray-400">{employee.total}h total</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(employee.overtime / 8) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-yellow-400">
                      {employee.overtime}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Breakdown Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Department Breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Department</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Employees</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Hours</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Labor Cost</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Avg Rate</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">{dept.employees}</td>
                  <td className="p-4 text-right">{dept.hours}</td>
                  <td className="p-4 text-right">{formatCurrency(dept.cost)}</td>
                  <td className="p-4 text-right">${(dept.cost / dept.hours).toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className="text-green-400">95%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Key Insights
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium text-green-400">Productivity Improvement</div>
                  <div className="text-sm text-gray-300">Cultivation team exceeded targets by 8% this week</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-400">Attendance Trending Up</div>
                  <div className="text-sm text-gray-300">92.5% attendance rate, highest in 3 months</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                <Award className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-400">Cost Efficiency</div>
                  <div className="text-sm text-gray-300">Labor cost per unit down 3% from last month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Alerts & Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-400">Overtime Spike</div>
                  <div className="text-sm text-gray-300">Processing team overtime up 15% - consider hiring</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <div className="font-medium text-red-400">Training Compliance</div>
                  <div className="text-sm text-gray-300">3 employees have expired certifications</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-400">Schedule Optimization</div>
                  <div className="text-sm text-gray-300">Evening shift understaffed by 2 employees</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}