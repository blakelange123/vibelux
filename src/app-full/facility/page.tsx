'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity,
  Building2,
  Zap,
  Target,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for demonstration
const mockPerformanceData = [
  { month: 'Jan', yield: 65000, energy: 450, revenue: 125000 },
  { month: 'Feb', yield: 68000, energy: 440, revenue: 132000 },
  { month: 'Mar', yield: 72000, energy: 425, revenue: 145000 },
  { month: 'Apr', yield: 75000, energy: 420, revenue: 152000 },
  { month: 'May', yield: 78000, energy: 415, revenue: 158000 },
  { month: 'Jun', yield: 82000, energy: 410, revenue: 165000 },
];

const mockInvestments = [
  {
    id: 'inv-1',
    type: 'GaaS',
    status: 'Active',
    raised: 750000,
    target: 1000000,
    investors: 12,
    startDate: '2024-01-15',
  },
  {
    id: 'inv-2',
    type: 'YEP',
    status: 'Pending',
    raised: 250000,
    target: 500000,
    investors: 5,
    startDate: null,
  },
];

export default function FacilityDashboard() {
  const [loading, setLoading] = useState(false);
  const [facilityData, setFacilityData] = useState({
    name: 'GreenTech Farms Ohio',
    type: 'Vertical Farm',
    location: 'Columbus, OH',
    size: 45000, // sq ft
    established: '2022',
  });

  const stats = [
    {
      label: 'Total Raised',
      value: '$1.2M',
      change: '+15%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      label: 'Active Investors',
      value: '17',
      change: '+3',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Avg. Yield',
      value: '75k lbs',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Energy Efficiency',
      value: '92%',
      change: '+2%',
      icon: Zap,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">{facilityData.name}</h1>
          <p className="text-gray-300 mt-2 text-lg">
            {facilityData.type} • {facilityData.location} • {facilityData.size.toLocaleString()} sq ft
          </p>
        </div>
        <Link href="/facility/investment/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 py-3">
            <Plus className="h-4 w-4 mr-2" />
            Create Investment Opportunity
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gray-800 border-gray-700 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2 text-white">{stat.value}</p>
                    <p className={`text-sm mt-2 font-medium ${stat.color}`}>{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-900/20')}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Investment Overview */}
      <Card className="bg-gray-800 border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white">Active Investment Opportunities</CardTitle>
          <CardDescription className="text-gray-300">Manage your funding campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInvestments.map((investment) => (
              <div key={investment.id} className="border border-gray-600 rounded-lg p-6 bg-gray-700">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-white">{investment.type} Investment</h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        investment.status === 'Active' 
                          ? 'bg-green-900/50 text-green-300 border border-green-600' 
                          : 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
                      }`}>
                        {investment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        ${investment.raised.toLocaleString()} / ${investment.target.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        {investment.investors} investors
                      </span>
                      {investment.startDate && (
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                          Started {new Date(investment.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-3 mt-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(investment.raised / investment.target) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-300 font-medium">
                      {Math.round((investment.raised / investment.target) * 100)}% funded
                    </p>
                  </div>
                  <Link href={`/facility/investment/${investment.id}`}>
                    <Button variant="outline" size="sm" className="ml-4 border-blue-500 text-blue-400 hover:bg-blue-900/20">
                      Manage
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white">Yield Performance</CardTitle>
            <CardDescription className="text-gray-300">Monthly production and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="month" stroke="#d1d5db" />
                <YAxis yAxisId="left" stroke="#d1d5db" />
                <YAxis yAxisId="right" orientation="right" stroke="#d1d5db" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: 'white'
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Yield (lbs)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white">Energy Efficiency</CardTitle>
            <CardDescription className="text-gray-300">kWh per pound of produce</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="month" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: 'white'
                  }}
                />
                <Bar dataKey="energy" fill="#f59e0b" name="Energy (kWh/lb)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-300">Common tasks and reporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/facility/investment/performance">
              <Button variant="outline" className="w-full justify-start h-auto p-4 border-gray-600 hover:bg-blue-900/20 hover:border-blue-500 transition-colors bg-gray-700 text-white">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-900/40 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Submit Performance Report</div>
                    <div className="text-sm text-gray-300">Monthly metrics update</div>
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/facility/documents/upload">
              <Button variant="outline" className="w-full justify-start h-auto p-4 border-gray-600 hover:bg-green-900/20 hover:border-green-500 transition-colors bg-gray-700 text-white">
                <div className="flex items-center">
                  <div className="p-2 bg-green-900/40 rounded-lg mr-3">
                    <Target className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Upload Financial Documents</div>
                    <div className="text-sm text-gray-300">Reports and statements</div>
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/facility/investment/communications">
              <Button variant="outline" className="w-full justify-start h-auto p-4 border-gray-600 hover:bg-purple-900/20 hover:border-purple-500 transition-colors bg-gray-700 text-white">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-900/40 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Message Investors</div>
                    <div className="text-sm text-gray-300">Communicate updates</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}