'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Battery,
  TrendingUp,
  DollarSign,
  Activity,
  Cloud,
  Sun,
  Wind,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Settings,
  Download,
  Info,
  ChevronRight,
  Leaf,
  Globe,
  Cpu,
  Shield,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, PieChart, Pie, Cell } from 'recharts';

interface GridPricing {
  time: Date;
  price: number;
  tier: 'off-peak' | 'mid-peak' | 'peak' | 'critical';
  carbonIntensity: number;
  gridDemand: number;
  renewablePercentage: number;
}

interface DemandResponseProgram {
  id: string;
  name: string;
  provider: string;
  type: 'economic' | 'emergency' | 'ancillary';
  status: 'enrolled' | 'pending' | 'available';
  revenueToDate: number;
  nextEvent?: {
    date: Date;
    duration: number;
    targetReduction: number;
    incentiveRate: number;
  };
  performance: {
    events: number;
    successRate: number;
    avgReduction: number;
  };
}

interface VirtualPowerPlant {
  id: string;
  name: string;
  totalCapacity: number;
  availableCapacity: number;
  participants: number;
  revenue: {
    daily: number;
    monthly: number;
    annual: number;
  };
  currentBid: {
    price: number;
    quantity: number;
    status: 'accepted' | 'pending' | 'rejected';
  };
}

interface CarbonCredit {
  id: string;
  vintage: string;
  quantity: number;
  price: number;
  registry: string;
  status: 'verified' | 'pending' | 'retired';
  project: string;
  reductions: number;
}

export function GridIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'programs' | 'vpp' | 'carbon'>('overview');
  const [selectedProgram, setSelectedProgram] = useState<DemandResponseProgram | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [isConnected, setIsConnected] = useState(true);
  const [autoResponse, setAutoResponse] = useState(true);
  const [batteryOptimization, setBatteryOptimization] = useState(true);

  // Real-time grid pricing
  const [currentPricing, setCurrentPricing] = useState<GridPricing>({
    time: new Date(),
    price: 0.12,
    tier: 'mid-peak',
    carbonIntensity: 420,
    gridDemand: 75,
    renewablePercentage: 35
  });

  // Simulate real-time pricing updates
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      let tier: GridPricing['tier'] = 'off-peak';
      let price = 0.08;
      
      if (hour >= 14 && hour <= 19) {
        tier = 'peak';
        price = 0.18 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.04;
      } else if (hour >= 11 && hour < 14 || hour >= 20 && hour < 22) {
        tier = 'mid-peak';
        price = 0.12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02;
      } else {
        price = 0.08 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02;
      }

      setCurrentPricing({
        time: new Date(),
        price,
        tier,
        carbonIntensity: 350 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        gridDemand: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        renewablePercentage: 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Demand response programs
  const demandResponsePrograms: DemandResponseProgram[] = [
    {
      id: 'dr-1',
      name: 'Peak Load Reduction',
      provider: 'Pacific Grid Services',
      type: 'economic',
      status: 'enrolled',
      revenueToDate: 28500,
      nextEvent: {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 4,
        targetReduction: 30,
        incentiveRate: 0.75
      },
      performance: {
        events: 24,
        successRate: 92,
        avgReduction: 32
      }
    },
    {
      id: 'dr-2',
      name: 'Emergency Response Service',
      provider: 'State ISO',
      type: 'emergency',
      status: 'enrolled',
      revenueToDate: 15200,
      nextEvent: undefined,
      performance: {
        events: 8,
        successRate: 100,
        avgReduction: 45
      }
    },
    {
      id: 'dr-3',
      name: 'Frequency Regulation',
      provider: 'Grid Innovations Inc',
      type: 'ancillary',
      status: 'pending',
      revenueToDate: 0,
      performance: {
        events: 0,
        successRate: 0,
        avgReduction: 0
      }
    },
    {
      id: 'dr-4',
      name: 'Capacity Market Program',
      provider: 'Regional Transmission Org',
      type: 'economic',
      status: 'available',
      revenueToDate: 0,
      performance: {
        events: 0,
        successRate: 0,
        avgReduction: 0
      }
    }
  ];

  // Virtual Power Plant data
  const vppData: VirtualPowerPlant = {
    id: 'vpp-1',
    name: 'Cannabis Growers Collective',
    totalCapacity: 2400,
    availableCapacity: 1850,
    participants: 12,
    revenue: {
      daily: 4200,
      monthly: 125000,
      annual: 1450000
    },
    currentBid: {
      price: 85,
      quantity: 500,
      status: 'accepted'
    }
  };

  // Carbon credits
  const carbonCredits: CarbonCredit[] = [
    {
      id: 'cc-1',
      vintage: '2024',
      quantity: 450,
      price: 28.50,
      registry: 'Verra',
      status: 'verified',
      project: 'LED Retrofit & Efficiency',
      reductions: 450
    },
    {
      id: 'cc-2',
      vintage: '2024',
      quantity: 120,
      price: 26.75,
      registry: 'Gold Standard',
      status: 'pending',
      project: 'Renewable Energy Integration',
      reductions: 120
    }
  ];

  // Historical pricing data
  const pricingHistory = Array.from({ length: 24 }, (_, hour) => {
    let price = 0.08;
    let demand = 60;
    
    if (hour >= 14 && hour <= 19) {
      price = 0.16 + Math.sin(hour / 2) * 0.04;
      demand = 85 + Math.sin(hour / 3) * 10;
    } else if (hour >= 11 && hour < 14 || hour >= 20 && hour < 22) {
      price = 0.12 + Math.sin(hour / 3) * 0.02;
      demand = 75 + Math.sin(hour / 4) * 8;
    } else {
      price = 0.08 + Math.sin(hour / 4) * 0.02;
      demand = 60 + Math.sin(hour / 5) * 5;
    }

    return {
      hour,
      price,
      demand,
      carbon: 350 + Math.sin(hour / 6) * 150,
      renewable: 25 + Math.sin(hour / 8) * 25
    };
  });

  // Revenue breakdown
  const revenueBreakdown = [
    { source: 'Energy Arbitrage', value: 8500, color: '#8B5CF6' },
    { source: 'Demand Response', value: 12000, color: '#10B981' },
    { source: 'Capacity Markets', value: 6500, color: '#F59E0B' },
    { source: 'Carbon Credits', value: 3500, color: '#3B82F6' },
    { source: 'Ancillary Services', value: 4500, color: '#EF4444' }
  ];

  // Calculate metrics
  const totalRevenue = demandResponsePrograms.reduce((sum, p) => sum + p.revenueToDate, 0);
  const activePrograms = demandResponsePrograms.filter(p => p.status === 'enrolled').length;
  const avgPerformance = demandResponsePrograms
    .filter(p => p.status === 'enrolled')
    .reduce((sum, p) => sum + p.performance.successRate, 0) / activePrograms || 0;

  const enrollInProgram = (program: DemandResponseProgram) => {
    alert(`Enrolling in ${program.name}...\n\nProvider: ${program.provider}\nType: ${program.type}\n\nEnrollment request submitted.`);
  };

  const optimizeBattery = () => {
    setBatteryOptimization(!batteryOptimization);
    alert(`Battery optimization ${!batteryOptimization ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Advanced Grid Integration
          </h2>
          <p className="text-gray-400">Real-time grid optimization and revenue generation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isConnected ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isConnected ? 'Grid Connected' : 'Grid Disconnected'}
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-6 border border-yellow-600/30">
        <div className="grid grid-cols-6 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-white">${currentPricing.price.toFixed(3)}/kWh</p>
            <p className={`text-xs mt-1 ${
              currentPricing.tier === 'peak' ? 'text-red-400' :
              currentPricing.tier === 'mid-peak' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {currentPricing.tier.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Grid Demand</p>
            <p className="text-2xl font-bold text-white">{currentPricing.gridDemand.toFixed(0)}%</p>
            <div className="mt-1 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  currentPricing.gridDemand > 85 ? 'bg-red-500' :
                  currentPricing.gridDemand > 70 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${currentPricing.gridDemand}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Carbon Intensity</p>
            <p className="text-2xl font-bold text-white">{currentPricing.carbonIntensity.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">g CO₂/kWh</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Renewable Mix</p>
            <p className="text-2xl font-bold text-green-400">{currentPricing.renewablePercentage.toFixed(0)}%</p>
            <div className="flex items-center gap-1 mt-1">
              <Sun className="w-3 h-3 text-yellow-400" />
              <Wind className="w-3 h-3 text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Today's Revenue</p>
            <p className="text-2xl font-bold text-green-400">$1,245</p>
            <p className="text-xs text-gray-500 mt-1">+18% vs avg</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Load Flexibility</p>
            <p className="text-2xl font-bold text-purple-400">45 kW</p>
            <p className="text-xs text-gray-500 mt-1">Available now</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'pricing', 'programs', 'vpp', 'carbon'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab === 'vpp' ? 'Virtual Power Plant' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">This year</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Active Programs</span>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{activePrograms}</p>
              <p className="text-sm text-gray-500 mt-1">Enrolled</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Success Rate</span>
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{avgPerformance.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 mt-1">Avg performance</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Carbon Avoided</span>
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">570</p>
              <p className="text-sm text-gray-500 mt-1">Tons CO₂</p>
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Streams</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `$${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {revenueBreakdown.map((item) => (
                  <div key={item.source} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-400">{item.source}</span>
                    </div>
                    <span className="text-white font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">24-Hour Price Forecast</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pricingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      formatter={(value: any, name: string) => 
                        name === 'price' ? `$${value.toFixed(3)}` : `${value.toFixed(0)}%`
                      }
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.3}
                      name="Price ($/kWh)"
                    />
                    <Area
                      type="monotone"
                      dataKey="renewable"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                      name="Renewable %"
                      yAxisId="right"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Optimization Settings */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Optimization Settings</h3>
            <div className="grid grid-cols-3 gap-6">
              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                <div>
                  <p className="font-medium text-white">Auto Demand Response</p>
                  <p className="text-sm text-gray-400">Automatically participate in DR events</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoResponse}
                  onChange={(e) => setAutoResponse(e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                <div>
                  <p className="font-medium text-white">Battery Optimization</p>
                  <p className="text-sm text-gray-400">Use battery for arbitrage and grid services</p>
                </div>
                <input
                  type="checkbox"
                  checked={batteryOptimization}
                  onChange={(e) => optimizeBattery()}
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                <div>
                  <p className="font-medium text-white">Carbon Priority Mode</p>
                  <p className="text-sm text-gray-400">Optimize for lowest carbon intensity</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        </>
      )}

      {activeTab === 'pricing' && (
        <>
          {/* Live Pricing Dashboard */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Real-Time Grid Pricing</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pricingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      name="Price ($/kWh)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="carbon"
                      stroke="#EF4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Carbon (g/kWh)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="demand"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Grid Demand %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {/* Price Alerts */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h4 className="font-medium text-white mb-3">Price Alerts</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-red-900/20 rounded">
                    <span className="text-sm text-red-400">Peak pricing in 2 hours</span>
                    <span className="text-xs text-gray-500">2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-900/20 rounded">
                    <span className="text-sm text-green-400">Low pricing overnight</span>
                    <span className="text-xs text-gray-500">11:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-900/20 rounded">
                    <span className="text-sm text-yellow-400">High carbon intensity</span>
                    <span className="text-xs text-gray-500">Now</span>
                  </div>
                </div>
              </div>

              {/* Optimization Actions */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h4 className="font-medium text-white mb-3">Automated Actions</h4>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Pre-cool before peak</p>
                        <p className="text-xs text-gray-400">Scheduled for 1:30 PM</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Shift loads to off-peak</p>
                        <p className="text-xs text-gray-400">Scheduled for 10:00 PM</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price Comparison */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Rate Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Time Period</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Standard Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Time-of-Use Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Real-Time Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Your Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Off-Peak (11pm-7am)</td>
                    <td className="px-4 py-3 text-gray-300">$0.12</td>
                    <td className="px-4 py-3 text-gray-300">$0.08</td>
                    <td className="px-4 py-3 text-gray-300">$0.06-0.10</td>
                    <td className="px-4 py-3 text-white font-medium">$0.065</td>
                    <td className="px-4 py-3 text-green-400 font-medium">46%</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Mid-Peak (7am-2pm, 8pm-11pm)</td>
                    <td className="px-4 py-3 text-gray-300">$0.12</td>
                    <td className="px-4 py-3 text-gray-300">$0.12</td>
                    <td className="px-4 py-3 text-gray-300">$0.10-0.15</td>
                    <td className="px-4 py-3 text-white font-medium">$0.11</td>
                    <td className="px-4 py-3 text-green-400 font-medium">8%</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Peak (2pm-8pm)</td>
                    <td className="px-4 py-3 text-gray-300">$0.12</td>
                    <td className="px-4 py-3 text-gray-300">$0.22</td>
                    <td className="px-4 py-3 text-gray-300">$0.15-0.35</td>
                    <td className="px-4 py-3 text-white font-medium">$0.14</td>
                    <td className="px-4 py-3 text-red-400 font-medium">-17%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'programs' && (
        <div className="space-y-6">
          {/* Program Overview */}
          <div className="grid grid-cols-2 gap-6">
            {demandResponsePrograms.map((program) => (
              <div
                key={program.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{program.name}</h3>
                    <p className="text-sm text-gray-400">{program.provider}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    program.status === 'enrolled' ? 'bg-green-900/20 text-green-400' :
                    program.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {program.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Revenue to Date</p>
                    <p className="text-xl font-bold text-green-400">${program.revenueToDate.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                    <p className="text-xl font-bold text-white">{program.performance.successRate}%</p>
                  </div>
                </div>

                {program.nextEvent && (
                  <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-400">Next Event</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {program.nextEvent.date.toLocaleDateString()} • 
                      {program.nextEvent.duration}h • 
                      {program.nextEvent.targetReduction}kW reduction
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      ${program.nextEvent.incentiveRate}/kWh incentive
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {program.performance.events} events • 
                    {program.performance.avgReduction}kW avg reduction
                  </div>
                  {program.status === 'available' && (
                    <button
                      onClick={() => enrollInProgram(program)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Performance Analytics */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Program Performance</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Total Events Participated</p>
                <p className="text-3xl font-bold text-white">32</p>
                <p className="text-sm text-gray-500 mt-1">Across all programs</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Average Load Reduction</p>
                <p className="text-3xl font-bold text-purple-400">38.5 kW</p>
                <p className="text-sm text-gray-500 mt-1">Per event</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Compliance Rate</p>
                <p className="text-3xl font-bold text-green-400">94%</p>
                <p className="text-sm text-gray-500 mt-1">Target achievement</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vpp' && (
        <>
          {/* VPP Overview */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{vppData.name}</h3>
                <p className="text-gray-400">Aggregated capacity from {vppData.participants} facilities</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div className="grid grid-cols-4 gap-6 mt-6">
              <div>
                <p className="text-sm text-gray-400">Total Capacity</p>
                <p className="text-2xl font-bold text-white">{vppData.totalCapacity} kW</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Available Now</p>
                <p className="text-2xl font-bold text-green-400">{vppData.availableCapacity} kW</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-400">${vppData.revenue.monthly.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Bid Status</p>
                <p className="text-2xl font-bold text-green-400">Accepted</p>
                <p className="text-xs text-gray-500">{vppData.currentBid.quantity}kW @ ${vppData.currentBid.price}/MWh</p>
              </div>
            </div>
          </div>

          {/* Market Participation */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Market Bids</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Day-Ahead Market</span>
                    <span className="text-sm text-green-400">Won</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Quantity</p>
                      <p className="text-white">500 kW</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-white">$85/MWh</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="text-green-400">$1,020</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Real-Time Market</span>
                    <span className="text-sm text-yellow-400">Pending</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Quantity</p>
                      <p className="text-white">250 kW</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-white">$92/MWh</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Est. Revenue</p>
                      <p className="text-gray-400">$552</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Participant Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-sm text-gray-300">Your Facility</span>
                  </div>
                  <span className="text-sm text-white">185 kW available</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-sm text-gray-300">GreenLeaf Gardens</span>
                  </div>
                  <span className="text-sm text-white">220 kW available</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-sm text-gray-300">Sunrise Cultivation</span>
                  </div>
                  <span className="text-sm text-white">150 kW committed</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-300">Urban Farms Inc</span>
                  </div>
                  <span className="text-sm text-white">0 kW offline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Distribution Model</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Base Capacity Payment</span>
                <span className="text-white">$25/kW-month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Energy Market Revenue Share</span>
                <span className="text-white">85% to participants</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Performance Bonus</span>
                <span className="text-white">+10% for {'>'} 95% availability</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <span className="text-gray-300 font-medium">Your Estimated Monthly Revenue</span>
                <span className="text-2xl font-bold text-green-400">$14,250</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'carbon' && (
        <>
          {/* Carbon Overview */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Credits</span>
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">570</p>
              <p className="text-sm text-gray-500 mt-1">Tons CO₂e</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Credit Value</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">$15,675</p>
              <p className="text-sm text-gray-500 mt-1">@ $27.50/ton avg</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Verification Status</span>
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">78%</p>
              <p className="text-sm text-gray-500 mt-1">Verified</p>
            </div>
          </div>

          {/* Carbon Credit Registry */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Carbon Credit Registry</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Vintage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {carbonCredits.map((credit) => (
                    <tr key={credit.id} className="border-b border-gray-800">
                      <td className="px-4 py-3 font-mono text-sm text-gray-300">{credit.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{credit.project}</p>
                          <p className="text-xs text-gray-500">{credit.registry}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{credit.vintage}</td>
                      <td className="px-4 py-3 text-white font-medium">{credit.quantity} tCO₂e</td>
                      <td className="px-4 py-3 text-gray-300">${credit.price}</td>
                      <td className="px-4 py-3 text-white font-medium">
                        ${(credit.quantity * credit.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          credit.status === 'verified' ? 'bg-green-900/20 text-green-400' :
                          credit.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {credit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carbon Reduction Strategies */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-600/30">
            <div className="flex items-start gap-3">
              <Globe className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Carbon Reduction Strategies</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Time-shifting loads to high renewable periods reduces emissions by 35%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>LED upgrade project generated 450 verified carbon credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>On-site solar + battery could generate additional 200 credits/year</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}