'use client';

import React, { useState } from 'react';
import {
  Zap,
  Battery,
  Sun,
  Wind,
  Gauge,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Calendar,
  DollarSign,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Flame,
  Snowflake,
  Droplets,
  Power,
  Cpu,
  HardDrive,
  Shield,
  Target,
  Award,
  Info
} from 'lucide-react';
import {
  LineChart,
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
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Sankey,
  Rectangle
} from 'recharts';

interface EnergySource {
  name: string;
  type: 'grid' | 'solar' | 'wind' | 'backup';
  current: number;
  capacity: number;
  cost: number;
  carbon: number;
  status: 'active' | 'standby' | 'offline';
}

interface ConsumerGroup {
  name: string;
  icon: React.ElementType;
  consumption: number;
  percentage: number;
  trend: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export function EnergyManagement() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [viewMode, setViewMode] = useState<'overview' | 'sources' | 'consumers' | 'optimization'>('overview');

  // Energy sources data
  const [energySources] = useState<EnergySource[]>([
    {
      name: 'Grid Power',
      type: 'grid',
      current: 245,
      capacity: 500,
      cost: 0.12,
      carbon: 0.45,
      status: 'active'
    },
    {
      name: 'Solar Array',
      type: 'solar',
      current: 85,
      capacity: 150,
      cost: 0,
      carbon: 0,
      status: 'active'
    },
    {
      name: 'Wind Turbine',
      type: 'wind',
      current: 0,
      capacity: 50,
      cost: 0,
      carbon: 0,
      status: 'standby'
    },
    {
      name: 'Backup Generator',
      type: 'backup',
      current: 0,
      capacity: 200,
      cost: 0.25,
      carbon: 0.8,
      status: 'standby'
    }
  ]);

  // Consumer groups
  const [consumerGroups] = useState<ConsumerGroup[]>([
    { name: 'Lighting', icon: Sun, consumption: 125, percentage: 38, trend: -5, priority: 'high' },
    { name: 'HVAC', icon: Wind, consumption: 95, percentage: 29, trend: 12, priority: 'critical' },
    { name: 'Irrigation', icon: Droplets, consumption: 45, percentage: 14, trend: -2, priority: 'high' },
    { name: 'Controls', icon: Cpu, consumption: 35, percentage: 10, trend: 0, priority: 'critical' },
    { name: 'Other', icon: Power, consumption: 30, percentage: 9, trend: 3, priority: 'low' }
  ]);

  // Calculate totals
  const totalGeneration = energySources.reduce((sum, source) => sum + source.current, 0);
  const totalConsumption = consumerGroups.reduce((sum, group) => sum + group.consumption, 0);
  const efficiency = (totalConsumption / totalGeneration) * 100;

  // Historical data
  const [energyHistory] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      grid: 200 + Math.sin(i * 0.26) * 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
      solar: i > 6 && i < 18 ? 50 + Math.sin((i - 12) * 0.5) * 50 : 0,
      consumption: 250 + Math.sin(i * 0.26) * 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
      cost: 0.12 + (i > 16 && i < 22 ? 0.08 : 0)
    }))
  );

  // Peak demand analysis
  const peakDemand = Math.max(...energyHistory.map(h => h.consumption));
  const avgDemand = energyHistory.reduce((sum, h) => sum + h.consumption, 0) / energyHistory.length;

  // Cost breakdown
  const costData = [
    { name: 'Time-of-Use Charges', value: 45, color: '#8b5cf6' },
    { name: 'Demand Charges', value: 30, color: '#3b82f6' },
    { name: 'Fixed Charges', value: 15, color: '#10b981' },
    { name: 'Other Fees', value: 10, color: '#f59e0b' }
  ];

  // Optimization opportunities
  const optimizations = [
    {
      name: 'Load Shifting',
      potential: 18,
      savings: 2400,
      effort: 'low',
      description: 'Shift non-critical loads to off-peak hours'
    },
    {
      name: 'Peak Shaving',
      potential: 12,
      savings: 1800,
      effort: 'medium',
      description: 'Reduce peak demand through battery storage'
    },
    {
      name: 'Solar Expansion',
      potential: 25,
      savings: 3500,
      effort: 'high',
      description: 'Add 100kW additional solar capacity'
    },
    {
      name: 'Efficiency Upgrades',
      potential: 15,
      savings: 2100,
      effort: 'medium',
      description: 'LED retrofits and HVAC optimization'
    }
  ];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'grid': return Zap;
      case 'solar': return Sun;
      case 'wind': return Wind;
      case 'backup': return Battery;
      default: return Power;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 flex-wrap">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 flex-shrink-0" />
              <span className="break-words">Energy Management System</span>
            </h2>
            <p className="text-gray-400 mt-1">
              Real-time monitoring and optimization of facility energy consumption
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              {['overview', 'sources', 'consumers', 'optimization'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                // Generate professional energy report
                const reportData = {
                  date: new Date().toISOString(),
                  totalGeneration,
                  totalConsumption,
                  efficiency,
                  peakDemand,
                  avgDemand,
                  energySources,
                  consumerGroups,
                  costData,
                  optimizations
                };
                
                // Convert to CSV for now (can be enhanced to PDF later)
                const csv = [
                  ['Energy Management Report', new Date().toLocaleDateString()],
                  [],
                  ['Summary Metrics'],
                  ['Total Generation (kW)', totalGeneration],
                  ['Total Consumption (kW)', totalConsumption],
                  ['Efficiency (%)', efficiency.toFixed(1)],
                  ['Peak Demand (kW)', peakDemand.toFixed(0)],
                  ['Average Demand (kW)', avgDemand.toFixed(0)],
                  [],
                  ['Energy Sources'],
                  ['Source', 'Type', 'Current (kW)', 'Capacity (kW)', 'Cost ($/kWh)', 'Carbon (kg/kWh)', 'Status'],
                  ...energySources.map(s => [s.name, s.type, s.current, s.capacity, s.cost, s.carbon, s.status]),
                  [],
                  ['Consumer Groups'],
                  ['Group', 'Consumption (kW)', 'Percentage (%)', 'Trend (%)', 'Priority'],
                  ...consumerGroups.map(g => [g.name, g.consumption, g.percentage, g.trend, g.priority]),
                  [],
                  ['Optimization Opportunities'],
                  ['Opportunity', 'Potential (%)', 'Savings ($)', 'Effort', 'Description'],
                  ...optimizations.map(o => [o.name, o.potential, o.savings, o.effort, o.description])
                ].map(row => row.join(',')).join('\n');
                
                // Download CSV
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `energy-report-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Professional Export
            </button>
            <button 
              onClick={() => {
                // Energy management settings clicked
              }}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
            <p className="text-gray-400 text-sm">Total Power</p>
            <p className="text-2xl font-bold text-white">{totalGeneration} kW</p>
            <p className="text-xs text-gray-400 mt-1">
              {efficiency.toFixed(1)}% efficiency
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <TrendingDown className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm">Current Cost</p>
            <p className="text-2xl font-bold text-white">$0.14/kWh</p>
            <p className="text-xs text-green-400 mt-1">-12% vs last month</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Sun className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-400">{((85 / 330) * 100).toFixed(0)}%</span>
            </div>
            <p className="text-gray-400 text-sm">Renewable</p>
            <p className="text-2xl font-bold text-white">85 kW</p>
            <p className="text-xs text-gray-400 mt-1">26% of total</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-5 h-5 text-red-500" />
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-gray-400 text-sm">Peak Demand</p>
            <p className="text-2xl font-bold text-white">{peakDemand.toFixed(0)} kW</p>
            <p className="text-xs text-yellow-400 mt-1">Near limit</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <TrendingDown className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm">Carbon Saved</p>
            <p className="text-2xl font-bold text-white">2.4 tons</p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Power Flow Visualization */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Sources</h3>
              <div className="space-y-3">
                {energySources.map((source) => {
                  const Icon = getSourceIcon(source.type);
                  return (
                    <div key={source.name} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <span className="text-white font-medium">{source.name}</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          source.status === 'active' ? 'text-green-400' :
                          source.status === 'standby' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {source.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-white">{source.current} kW</span>
                        <span className="text-gray-400 text-sm">of {source.capacity} kW</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            source.type === 'solar' ? 'bg-orange-500' :
                            source.type === 'wind' ? 'bg-blue-500' :
                            source.type === 'grid' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${(source.current / source.capacity) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          Cost: ${source.cost}/kWh
                        </span>
                        <span className="text-gray-400">
                          CO₂: {source.carbon} kg/kWh
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Consumers</h3>
              <div className="space-y-3">
                {consumerGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.name} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <span className="text-white font-medium">{group.name}</span>
                        </div>
                        <span className={`text-sm font-medium flex items-center gap-1 ${
                          group.trend > 0 ? 'text-red-400' : 
                          group.trend < 0 ? 'text-green-400' : 
                          'text-gray-400'
                        }`}>
                          {group.trend > 0 ? <ArrowUp className="w-3 h-3" /> : 
                           group.trend < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                          {Math.abs(group.trend)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-white">{group.consumption} kW</span>
                        <span className="text-gray-400 text-sm">{group.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            group.priority === 'critical' ? 'bg-red-500' :
                            group.priority === 'high' ? 'bg-orange-500' :
                            group.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Energy History Chart */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">24-Hour Energy Profile</h3>
              <div className="flex items-center gap-2">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                      timeRange === range
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="pb-8">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={energyHistory} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    name="Total Consumption"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="grid" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    name="Grid Power"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="solar" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    name="Solar Power"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {viewMode === 'optimization' && (
        <div className="space-y-6">
          {/* Cost Analysis */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
              <div className="pb-4">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {costData.map((item) => (
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

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Total Energy Cost</span>
                    <span className="text-white font-medium">$12,450</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">-8.5% from last month</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Average Cost per kWh</span>
                    <span className="text-white font-medium">$0.142</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">-5.3% from last month</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Peak Demand Charges</span>
                    <span className="text-white font-medium">$3,735</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">+2.1% from last month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Optimization Opportunities
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">$9,800</p>
                <p className="text-gray-400 text-sm">Potential monthly savings</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {optimizations.map((opt) => (
                <div key={opt.name} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{opt.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(opt.effort)}`}>
                      {opt.effort} effort
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{opt.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{opt.potential}%</p>
                      <p className="text-gray-400 text-xs">Reduction potential</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">${opt.savings}</p>
                      <p className="text-gray-400 text-xs">Monthly savings</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${opt.potential * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demand Response */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Demand Response Program
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-medium">Program Status</span>
                </div>
                <p className="text-green-400 font-medium mb-2">Enrolled & Active</p>
                <p className="text-gray-400 text-sm">Tier 2 participant</p>
                <p className="text-gray-400 text-sm">Next event: Tomorrow 2-6 PM</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-white font-medium">Earnings</span>
                </div>
                <p className="text-2xl font-bold text-white">$1,245</p>
                <p className="text-gray-400 text-sm">This month</p>
                <p className="text-green-400 text-sm">+$450 pending</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-white font-medium">Performance</span>
                </div>
                <p className="text-2xl font-bold text-white">96%</p>
                <p className="text-gray-400 text-sm">Compliance rate</p>
                <p className="text-gray-400 text-sm">12/12 events completed</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}