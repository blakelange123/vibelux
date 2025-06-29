'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Zap,
  TrendingUp,
  DollarSign,
  Leaf,
  Award,
  Calendar,
  Download,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Battery,
  Sun,
  Moon,
  Activity
} from 'lucide-react';

export default function EnergySavingsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('week');

  // Mock data - in production, fetch from API
  const savingsOverTime = [
    { month: 'Jan', savings: 2850, cost: 427.50, co2: 1.2 },
    { month: 'Feb', savings: 3200, cost: 480.00, co2: 1.4 },
    { month: 'Mar', savings: 3650, cost: 547.50, co2: 1.6 },
    { month: 'Apr', savings: 3100, cost: 465.00, co2: 1.3 },
    { month: 'May', savings: 4200, cost: 630.00, co2: 1.8 },
    { month: 'Jun', savings: 4856, cost: 728.40, co2: 2.1 }
  ];

  const savingsByCategory = [
    { name: 'Lighting Optimization', value: 45, color: '#10b981' },
    { name: 'Peak Shaving', value: 30, color: '#3b82f6' },
    { name: 'Demand Response', value: 15, color: '#f59e0b' },
    { name: 'Schedule Optimization', value: 10, color: '#8b5cf6' }
  ];

  const monthlyBreakdown = {
    totalSaved: 4856,
    costSaved: 728.40,
    co2Reduced: 2.1,
    peakReduction: 42,
    uptimePercentage: 99.8,
    zonesOptimized: 6
  };

  const achievements = [
    { icon: Zap, label: 'Energy Saver', description: 'Saved over 1,000 kWh', unlocked: true },
    { icon: DollarSign, label: 'Cost Cutter', description: 'Saved over $500', unlocked: true },
    { icon: Leaf, label: 'Eco Warrior', description: 'Reduced 1 ton of CO₂', unlocked: true },
    { icon: Award, label: 'Peak Master', description: 'Reduced peak by 40%', unlocked: true },
    { icon: Calendar, label: 'Consistent Saver', description: '30 days of savings', unlocked: true },
    { icon: Battery, label: 'Grid Helper', description: 'Participated in 10 DR events', unlocked: false }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Energy Savings Dashboard</h1>
              <p className="text-xl text-gray-400">Your verified savings and environmental impact</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={() => router.push('/energy-dashboard')}>
                <Activity className="w-4 h-4 mr-2" />
                Live Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400">This Month</Badge>
              </div>
              <p className="text-3xl font-bold text-green-400">{monthlyBreakdown.totalSaved} kWh</p>
              <p className="text-sm text-gray-400 mt-2">Energy Saved</p>
              <div className="mt-4">
                <Progress value={85} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">85% of monthly target</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400">Verified</Badge>
              </div>
              <p className="text-3xl font-bold text-blue-400">${monthlyBreakdown.costSaved}</p>
              <p className="text-sm text-gray-400 mt-2">Cost Saved</p>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+18% vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Leaf className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">Impact</Badge>
              </div>
              <p className="text-3xl font-bold text-purple-400">{monthlyBreakdown.co2Reduced} tons</p>
              <p className="text-sm text-gray-400 mt-2">CO₂ Reduced</p>
              <p className="text-xs text-gray-500 mt-4">Equivalent to planting 50 trees</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
                <Badge className="bg-yellow-500/20 text-yellow-400">{monthlyBreakdown.uptimePercentage}%</Badge>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{monthlyBreakdown.peakReduction} kW</p>
              <p className="text-sm text-gray-400 mt-2">Peak Reduction</p>
              <p className="text-xs text-gray-500 mt-4">{monthlyBreakdown.zonesOptimized} zones optimized</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Trend</CardTitle>
              <CardDescription>Monthly energy and cost savings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={savingsOverTime}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#10b981" 
                    fill="url(#savingsGradient)"
                    name="Energy Saved (kWh)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Savings by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Breakdown</CardTitle>
              <CardDescription>How your savings are achieved</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={savingsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {savingsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Milestones reached through energy optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`text-center p-4 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-900/50 border-gray-800 opacity-50'
                  }`}
                >
                  <achievement.icon 
                    className={`w-8 h-8 mx-auto mb-2 ${
                      achievement.unlocked ? 'text-yellow-400' : 'text-gray-600'
                    }`} 
                  />
                  <p className={`text-sm font-medium ${
                    achievement.unlocked ? 'text-white' : 'text-gray-500'
                  }`}>
                    {achievement.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                  {achievement.unlocked && (
                    <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Sharing Summary */}
        <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Revenue Sharing Summary</h3>
                <p className="text-gray-300 mb-4">
                  You've saved ${monthlyBreakdown.costSaved} this month. Based on our 20% revenue share:
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm text-gray-400">Your Savings</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${(monthlyBreakdown.costSaved * 0.80).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">VibeLux Fee</p>
                    <p className="text-2xl font-bold text-gray-300">
                      ${(monthlyBreakdown.costSaved * 0.20).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#374151"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56 * 0.8} ${2 * Math.PI * 56}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-400">80%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">Your Share</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/energy-setup">
            <Button variant="outline" size="lg">
              Optimize More Zones
            </Button>
          </Link>
          <Link href="/pricing/revenue-sharing">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700">
              Learn About Revenue Sharing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}