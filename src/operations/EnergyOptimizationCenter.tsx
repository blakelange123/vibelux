'use client';

import React, { useState } from 'react';
import {
  Zap,
  TrendingDown,
  DollarSign,
  Sun,
  Battery,
  Activity,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  Lightbulb,
  Wind,
  Thermometer,
  Settings,
  Download,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

interface EnergyMetric {
  device: string;
  currentDraw: number;
  peakDraw: number;
  dailyUsage: number;
  efficiency: number;
  cost: number;
}

interface DemandResponse {
  event: string;
  startTime: Date;
  duration: number;
  incentive: number;
  loadReduction: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface OptimizationOpportunity {
  id: string;
  title: string;
  description: string;
  savingsPotential: number;
  implementationCost: number;
  paybackPeriod: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'lighting' | 'hvac' | 'scheduling' | 'equipment';
}

export function EnergyOptimizationCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'optimization' | 'demand'>('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState<OptimizationOpportunity | null>(null);
  const [showImplementModal, setShowImplementModal] = useState(false);

  // Real-time energy metrics
  const energyMetrics: EnergyMetric[] = [
    { device: 'LED Arrays - Flower A', currentDraw: 42.5, peakDraw: 45.0, dailyUsage: 1020, efficiency: 94, cost: 122.40 },
    { device: 'LED Arrays - Flower B', currentDraw: 41.8, peakDraw: 45.0, dailyUsage: 1003, efficiency: 93, cost: 120.36 },
    { device: 'HVAC System 1', currentDraw: 28.3, peakDraw: 35.0, dailyUsage: 679, efficiency: 81, cost: 81.48 },
    { device: 'HVAC System 2', currentDraw: 26.7, peakDraw: 35.0, dailyUsage: 641, efficiency: 76, cost: 76.92 },
    { device: 'Dehumidifiers', currentDraw: 15.2, peakDraw: 20.0, dailyUsage: 365, efficiency: 76, cost: 43.80 },
    { device: 'Irrigation Pumps', currentDraw: 4.5, peakDraw: 8.0, dailyUsage: 108, efficiency: 88, cost: 12.96 },
    { device: 'Fans & Circulation', currentDraw: 6.8, peakDraw: 10.0, dailyUsage: 163, efficiency: 85, cost: 19.56 }
  ];

  // Demand response events
  const demandResponseEvents: DemandResponse[] = [
    {
      event: 'Peak Demand Reduction',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      duration: 4,
      incentive: 450,
      loadReduction: 30,
      status: 'upcoming'
    },
    {
      event: 'Grid Emergency Response',
      startTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      duration: 2,
      incentive: 280,
      loadReduction: 20,
      status: 'upcoming'
    }
  ];

  // Optimization opportunities
  const optimizationOpportunities: OptimizationOpportunity[] = [
    {
      id: 'opt-1',
      title: 'Dynamic Light Scheduling',
      description: 'Shift 2 hours of photoperiod to off-peak rates without affecting DLI',
      savingsPotential: 2400,
      implementationCost: 0,
      paybackPeriod: 0,
      difficulty: 'easy',
      category: 'scheduling'
    },
    {
      id: 'opt-2',
      title: 'LED Fixture Upgrade',
      description: 'Replace remaining HPS fixtures with high-efficiency LEDs',
      savingsPotential: 4800,
      implementationCost: 15000,
      paybackPeriod: 3.1,
      difficulty: 'medium',
      category: 'lighting'
    },
    {
      id: 'opt-3',
      title: 'VFD Installation on Fans',
      description: 'Install variable frequency drives on exhaust fans for speed control',
      savingsPotential: 1200,
      implementationCost: 3500,
      paybackPeriod: 2.9,
      difficulty: 'medium',
      category: 'hvac'
    },
    {
      id: 'opt-4',
      title: 'Heat Recovery System',
      description: 'Capture waste heat from dehumidifiers for space heating',
      savingsPotential: 2100,
      implementationCost: 8000,
      paybackPeriod: 3.8,
      difficulty: 'hard',
      category: 'hvac'
    }
  ];

  // Energy usage patterns
  const hourlyUsage = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    usage: hour >= 6 && hour <= 18 ? 120 + Math.sin((hour - 6) / 2) * 30 : 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
    cost: hour >= 14 && hour <= 19 ? 0.18 : 0.12, // Peak vs off-peak rates
    solar: hour >= 8 && hour <= 16 ? Math.sin((hour - 8) / 8 * Math.PI) * 25 : 0
  }));

  // Monthly trend data
  const monthlyTrend = [
    { month: 'Jan', usage: 28500, cost: 3420, target: 30000 },
    { month: 'Feb', usage: 27800, cost: 3336, target: 29000 },
    { month: 'Mar', usage: 29200, cost: 3504, target: 29000 },
    { month: 'Apr', usage: 28100, cost: 3372, target: 28000 },
    { month: 'May', usage: 27500, cost: 3300, target: 28000 },
    { month: 'Jun', usage: 26800, cost: 3216, target: 27000 }
  ];

  const totalCurrentDraw = energyMetrics.reduce((sum, m) => sum + m.currentDraw, 0);
  const totalDailyUsage = energyMetrics.reduce((sum, m) => sum + m.dailyUsage, 0);
  const totalDailyCost = energyMetrics.reduce((sum, m) => sum + m.cost, 0);
  const avgEfficiency = energyMetrics.reduce((sum, m) => sum + m.efficiency, 0) / energyMetrics.length;

  // Power factor and demand charges
  const powerMetrics = {
    powerFactor: 0.92,
    peakDemand: 165,
    demandCharge: 1250,
    monthlyBaseCharge: 450,
    carbonFootprint: 12.5 // tons CO2/month
  };

  // Handle device settings
  const handleDeviceSettings = (device: string) => {
    setSelectedDevice(device);
    setShowDeviceSettings(true);
  };

  // Handle device actions from dropdown
  const handleDeviceAction = (device: string, action: string) => {
    // Here you would implement the actual action logic
    alert(`${action} for ${device}`);
  };

  // Handle optimization implementation
  const handleImplementOptimization = (opportunity: OptimizationOpportunity) => {
    setSelectedOptimization(opportunity);
    setShowImplementModal(true);
  };

  // Execute optimization
  const executeOptimization = () => {
    if (!selectedOptimization) return;
    
    // Here you would implement the actual optimization logic
    alert(`Implementing ${selectedOptimization.title}...\n\nThis will save $${selectedOptimization.savingsPotential.toLocaleString()} annually.`);
    
    setShowImplementModal(false);
    setSelectedOptimization(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Energy Optimization Center</h2>
          <p className="text-gray-400">Real-time monitoring and intelligent optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'usage', 'optimization', 'demand'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Current Load</span>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalCurrentDraw.toFixed(1)} kW</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      totalCurrentDraw > 150 ? 'bg-red-500' :
                      totalCurrentDraw > 120 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(totalCurrentDraw / 180) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">/{180} kW</span>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Daily Usage</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{(totalDailyUsage / 1000).toFixed(1)} MWh</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="text-green-400">-5%</span> vs yesterday
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Daily Cost</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalDailyCost.toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Projected: ${(totalDailyCost * 30).toFixed(0)}/mo
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Efficiency</span>
                <Gauge className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{avgEfficiency.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 mt-1">System average</p>
            </div>
          </div>

          {/* Real-time Usage Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">24-Hour Usage Pattern</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    formatter={(value: any, name: string) => 
                      name === 'cost' ? `$${value}/kWh` : `${value} kW`
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    name="Grid Usage"
                  />
                  <Area
                    type="monotone"
                    dataKey="solar"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                    name="Solar Generation"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400">Grid Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-400">Solar Generation</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="text-red-400">Peak Hours: 2-7 PM</span>
                <span className="text-green-400">Off-Peak: 9 PM - 2 PM</span>
              </div>
            </div>
          </div>

          {/* Power Quality Metrics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Power Quality</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Power Factor</span>
                  <span className={`font-medium ${
                    powerMetrics.powerFactor >= 0.95 ? 'text-green-400' :
                    powerMetrics.powerFactor >= 0.90 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {powerMetrics.powerFactor}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Peak Demand</span>
                  <span className="text-white font-medium">{powerMetrics.peakDemand} kW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Demand Charge</span>
                  <span className="text-yellow-400 font-medium">${powerMetrics.demandCharge}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Energy', value: 65, fill: '#8B5CF6' },
                        { name: 'Demand', value: 25, fill: '#F59E0B' },
                        { name: 'Fixed', value: 10, fill: '#10B981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Energy Charges</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Demand Charges</span>
                  <span className="text-white">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fixed Charges</span>
                  <span className="text-white">10%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Sustainability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Carbon Footprint</span>
                  <span className="text-white font-medium">{powerMetrics.carbonFootprint} tons/mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Renewable %</span>
                  <span className="text-green-400 font-medium">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Carbon Offset</span>
                  <span className="text-blue-400 font-medium">2.3 tons/mo</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'usage' && (
        <>
          {/* Device Breakdown */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Energy Usage by Device</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Device</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Current</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Peak</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Daily Usage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Efficiency</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Daily Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {energyMetrics.map((metric, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {metric.device.includes('LED') ? <Lightbulb className="w-4 h-4 text-yellow-400" /> :
                           metric.device.includes('HVAC') ? <Thermometer className="w-4 h-4 text-blue-400" /> :
                           metric.device.includes('Pump') ? <Activity className="w-4 h-4 text-green-400" /> :
                           <Wind className="w-4 h-4 text-gray-400" />}
                          <span className="font-medium text-white">{metric.device}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{metric.currentDraw} kW</span>
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(metric.currentDraw / metric.peakDraw) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{metric.peakDraw} kW</td>
                      <td className="px-4 py-3 text-gray-300">{metric.dailyUsage} kWh</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${
                          metric.efficiency >= 90 ? 'text-green-400' :
                          metric.efficiency >= 80 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {metric.efficiency}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">${metric.cost.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="relative group">
                          <button 
                            onClick={() => handleDeviceSettings(metric.device)}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={() => handleDeviceAction(metric.device, 'View Details')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded-t-lg"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleDeviceAction(metric.device, 'Schedule Optimization')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                              Schedule Optimization
                            </button>
                            <button
                              onClick={() => handleDeviceAction(metric.device, 'Set Power Limit')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                              Set Power Limit
                            </button>
                            <button
                              onClick={() => handleDeviceAction(metric.device, 'View History')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                              View History
                            </button>
                            <div className="border-t border-gray-700"></div>
                            <button
                              onClick={() => handleDeviceAction(metric.device, 'Turn Off')}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors rounded-b-lg"
                            >
                              Turn Off Device
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-700">
                    <td className="px-4 py-3 font-semibold text-white">Total</td>
                    <td className="px-4 py-3 font-semibold text-white">{totalCurrentDraw.toFixed(1)} kW</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 font-semibold text-white">{totalDailyUsage} kWh</td>
                    <td className="px-4 py-3 font-semibold text-white">{avgEfficiency.toFixed(0)}%</td>
                    <td className="px-4 py-3 font-semibold text-white">${totalDailyCost.toFixed(2)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">6-Month Energy Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="usage" fill="#8B5CF6" name="Usage (kWh)" />
                  <Bar dataKey="target" fill="#374151" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'optimization' && (
        <>
          {/* Optimization Summary */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-600/30">
            <h3 className="text-lg font-semibold text-white mb-2">Total Savings Potential</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-green-400">
                  ${optimizationOpportunities.reduce((sum, o) => sum + o.savingsPotential, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Annual savings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">
                  ${optimizationOpportunities.reduce((sum, o) => sum + o.implementationCost, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total investment</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-400">2.8 years</p>
                <p className="text-sm text-gray-400">Average payback</p>
              </div>
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="space-y-4">
            {optimizationOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{opp.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        opp.difficulty === 'easy' ? 'bg-green-900/20 text-green-400' :
                        opp.difficulty === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-red-900/20 text-red-400'
                      }`}>
                        {opp.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        opp.category === 'lighting' ? 'bg-yellow-900/20 text-yellow-400' :
                        opp.category === 'hvac' ? 'bg-blue-900/20 text-blue-400' :
                        opp.category === 'scheduling' ? 'bg-purple-900/20 text-purple-400' :
                        'bg-gray-900/20 text-gray-400'
                      }`}>
                        {opp.category}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{opp.description}</p>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Annual Savings</p>
                        <p className="text-xl font-bold text-green-400">${opp.savingsPotential.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Investment</p>
                        <p className="text-xl font-bold text-yellow-400">${opp.implementationCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payback Period</p>
                        <p className="text-xl font-bold text-blue-400">{opp.paybackPeriod} years</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Energy Reduction</p>
                        <p className="text-xl font-bold text-purple-400">
                          {Math.round((opp.savingsPotential / totalDailyCost / 365) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleImplementOptimization(opp)}
                    className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Implement
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Win Actions */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Win Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <h4 className="font-medium text-white">Adjust Light Schedule</h4>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Shift morning lights-on by 2 hours to avoid peak rates
                </p>
                <button className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
                  Apply Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Thermometer className="w-5 h-5 text-blue-400" />
                  <h4 className="font-medium text-white">Optimize HVAC Setpoints</h4>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Increase night temp by 2°F to reduce cooling load
                </p>
                <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Apply Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'demand' && (
        <>
          {/* Demand Response Overview */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Demand Response Program</h3>
              <span className="px-3 py-1 bg-green-900/20 text-green-400 rounded-full text-sm font-medium">
                Enrolled
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">This Month's Earnings</p>
                <p className="text-2xl font-bold text-green-400">$1,280</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Events Participated</p>
                <p className="text-2xl font-bold text-white">4 / 5</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Avg Load Reduction</p>
                <p className="text-2xl font-bold text-blue-400">28 kW</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Performance Score</p>
                <p className="text-2xl font-bold text-purple-400">94%</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {demandResponseEvents.map((event, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{event.event}</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-gray-400">
                          Start: {event.startTime.toLocaleString()}
                        </p>
                        <p className="text-gray-400">
                          Duration: {event.duration} hours
                        </p>
                        <p className="text-gray-400">
                          Required Reduction: {event.loadReduction} kW
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">${event.incentive}</p>
                      <p className="text-sm text-gray-400">Incentive</p>
                      <button className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                        Confirm Participation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load Shedding Strategy */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Automated Load Shedding Strategy</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">1. Reduce LED intensity to 80%</span>
                  <span className="text-xs text-gray-500">-15 kW</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">2. Cycle HVAC units (50% duty)</span>
                  <span className="text-xs text-gray-500">-10 kW</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">3. Defer non-critical pumping</span>
                  <span className="text-xs text-gray-500">-5 kW</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">4. Switch to battery backup (if available)</span>
                  <span className="text-xs text-gray-500">-10 kW</span>
                </div>
                <Info className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Optimization Implementation Modal */}
      {showImplementModal && selectedOptimization && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Implement {selectedOptimization.title}</h3>
              <button
                onClick={() => {
                  setShowImplementModal(false);
                  setSelectedOptimization(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Implementation Overview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 mb-4">{selectedOptimization.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Annual Savings</p>
                    <p className="text-xl font-bold text-green-400">${selectedOptimization.savingsPotential.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Investment Required</p>
                    <p className="text-xl font-bold text-yellow-400">${selectedOptimization.implementationCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Payback Period</p>
                    <p className="text-xl font-bold text-blue-400">{selectedOptimization.paybackPeriod} years</p>
                  </div>
                </div>
              </div>
              
              {/* Implementation Steps */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Implementation Steps</h4>
                <div className="space-y-2">
                  {selectedOptimization.category === 'scheduling' && (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">1.</span>
                        <span className="text-gray-300">Analyze current light schedule and identify off-peak hours</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">2.</span>
                        <span className="text-gray-300">Adjust photoperiod start time to begin at 9 PM (off-peak)</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">3.</span>
                        <span className="text-gray-300">Monitor DLI to ensure plants receive adequate light</span>
                      </div>
                    </>
                  )}
                  {selectedOptimization.category === 'lighting' && (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">1.</span>
                        <span className="text-gray-300">Request quotes from approved LED vendors</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">2.</span>
                        <span className="text-gray-300">Schedule installation during maintenance window</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">3.</span>
                        <span className="text-gray-300">Configure new fixtures for optimal spectrum and intensity</span>
                      </div>
                    </>
                  )}
                  {selectedOptimization.category === 'hvac' && (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">1.</span>
                        <span className="text-gray-300">Install VFD units on designated equipment</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">2.</span>
                        <span className="text-gray-300">Program control logic for variable speed operation</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                        <span className="text-purple-400 font-medium">3.</span>
                        <span className="text-gray-300">Test and calibrate for optimal performance</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Implementation Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Implementation Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input
                      type="radio"
                      name="implementation"
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600"
                      defaultChecked
                    />
                    <div>
                      <span className="text-white font-medium">Immediate Implementation</span>
                      <span className="text-sm text-gray-400 block">Start within 24 hours</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input
                      type="radio"
                      name="implementation"
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white font-medium">Scheduled Implementation</span>
                      <span className="text-sm text-gray-400 block">Plan for next maintenance window</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input
                      type="radio"
                      name="implementation"
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white font-medium">Phased Implementation</span>
                      <span className="text-sm text-gray-400 block">Roll out gradually over 30 days</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Notifications */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded"
                      defaultChecked
                    />
                    <span className="text-gray-300">Email progress updates</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded"
                      defaultChecked
                    />
                    <span className="text-gray-300">Send completion report</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Estimated completion: {selectedOptimization.difficulty === 'easy' ? '1-2 days' : selectedOptimization.difficulty === 'medium' ? '1-2 weeks' : '2-4 weeks'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowImplementModal(false);
                    setSelectedOptimization(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeOptimization}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Start Implementation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Device Settings Modal */}
      {showDeviceSettings && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedDevice} Settings</h3>
              <button
                onClick={() => {
                  setShowDeviceSettings(false);
                  setSelectedDevice(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Power Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Power Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Power Limit</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white"
                        defaultValue={energyMetrics.find(m => m.device === selectedDevice)?.peakDraw || 0}
                      />
                      <span className="text-gray-400">kW</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Soft Start Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white"
                        defaultValue="5"
                      />
                      <span className="text-gray-400">min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Schedule Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Schedule</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Operating Hours</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white"
                        defaultValue="06:00"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white"
                        defaultValue="18:00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Enable Peak Shaving</label>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
              
              {/* Automation Rules */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Automation Rules</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      defaultChecked
                    />
                    <span className="text-white">Reduce power during demand response events</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Auto-shutdown when efficiency drops below 70%</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      defaultChecked
                    />
                    <span className="text-white">Send alerts for abnormal power consumption</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => {
                  setShowDeviceSettings(false);
                  setSelectedDevice(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Settings saved for ${selectedDevice}`);
                  setShowDeviceSettings(false);
                  setSelectedDevice(null);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}