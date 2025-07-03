'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Battery,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  Target,
  Shield,
  Bell,
  Settings,
  RefreshCw,
  Download,
  ChevronRight,
  Info,
  Lightbulb,
  Power,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PiggyBank,
  Timer,
  Cloud,
  Sun,
  Moon,
  Wind,
  Thermometer,
  BatteryCharging,
  Cpu,
  GitBranch,
  Play,
  Pause
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea } from 'recharts';

interface EnergyPrice {
  time: Date;
  price: number; // $/kWh
  tier: 'off-peak' | 'mid-peak' | 'on-peak' | 'critical';
  forecast?: boolean;
}

interface DemandResponse {
  id: string;
  eventType: 'voluntary' | 'mandatory' | 'emergency';
  startTime: Date;
  endTime: Date;
  targetReduction: number; // kW
  incentiveRate: number; // $/kW
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  actualReduction?: number;
  earnings?: number;
}

interface EnergyContract {
  id: string;
  provider: string;
  type: 'fixed' | 'variable' | 'time-of-use' | 'real-time';
  baseRate: number;
  peakRate?: number;
  offPeakRate?: number;
  demandCharge: number; // $/kW
  contractEnd: Date;
  monthlyCapacity: number; // kWh
}

interface LoadProfile {
  hour: number;
  baseLoad: number; // kW
  lightingLoad: number; // kW
  hvacLoad: number; // kW
  otherLoad: number; // kW
  totalLoad: number; // kW
  shiftableLoad: number; // kW
  criticalLoad: number; // kW
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  type: 'cost' | 'carbon' | 'reliability' | 'balanced';
  rules: {
    maxDemand?: number;
    minDemand?: number;
    shiftablePercentage: number;
    batteryCycleLimit?: number;
    comfortRange?: { min: number; max: number };
  };
  estimatedSavings: number; // percentage
  currentlyActive: boolean;
}

interface GridStatus {
  frequency: number; // Hz
  voltage: number; // V
  stability: 'stable' | 'unstable' | 'critical';
  renewablePercentage: number;
  carbonIntensity: number; // gCO2/kWh
  congestionLevel: 'low' | 'medium' | 'high';
}

const generatePriceData = (): EnergyPrice[] => {
  const now = new Date();
  const data: EnergyPrice[] = [];
  
  // Historical data (past 24 hours)
  for (let i = 24; i >= 1; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    let price, tier: EnergyPrice['tier'];
    if (hour >= 0 && hour < 6) {
      price = 0.08 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02;
      tier = 'off-peak';
    } else if (hour >= 6 && hour < 9 || hour >= 20 && hour < 22) {
      price = 0.12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.03;
      tier = 'mid-peak';
    } else if (hour >= 14 && hour < 18) {
      price = 0.18 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05;
      tier = 'on-peak';
    } else {
      price = 0.10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02;
      tier = 'mid-peak';
    }
    
    data.push({ time, price, tier, forecast: false });
  }
  
  // Current price
  data.push({
    time: now,
    price: 0.14,
    tier: 'mid-peak',
    forecast: false
  });
  
  // Forecast data (next 24 hours)
  for (let i = 1; i <= 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    let price, tier: EnergyPrice['tier'];
    if (hour >= 0 && hour < 6) {
      price = 0.07 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02;
      tier = 'off-peak';
    } else if (hour >= 6 && hour < 9 || hour >= 20 && hour < 22) {
      price = 0.11 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.03;
      tier = 'mid-peak';
    } else if (hour >= 14 && hour < 18) {
      price = 0.20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.08;
      tier = 'on-peak';
    } else {
      price = 0.09 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02;
      tier = 'mid-peak';
    }
    
    // Add some critical pricing events
    if (i === 18 && crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7) {
      price = 0.35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.15;
      tier = 'critical';
    }
    
    data.push({ time, price, tier, forecast: true });
  }
  
  return data;
};

const mockDemandResponses: DemandResponse[] = [
  {
    id: 'dr-1',
    eventType: 'voluntary',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    targetReduction: 150,
    incentiveRate: 0.50,
    status: 'scheduled'
  },
  {
    id: 'dr-2',
    eventType: 'mandatory',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    targetReduction: 200,
    incentiveRate: 0.75,
    status: 'completed',
    actualReduction: 185,
    earnings: 416.25
  }
];

export function EnergyMarketIntegration() {
  const [priceData, setPriceData] = useState<EnergyPrice[]>(generatePriceData());
  const [demandResponses, setDemandResponses] = useState<DemandResponse[]>(mockDemandResponses);
  const [activeView, setActiveView] = useState<'dashboard' | 'pricing' | 'demand' | 'optimization' | 'contracts' | 'analytics'>('dashboard');
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy>({
    id: 'balanced',
    name: 'Balanced Optimization',
    description: 'Balance between cost savings and operational stability',
    type: 'balanced',
    rules: {
      maxDemand: 800,
      shiftablePercentage: 30,
      comfortRange: { min: 22, max: 26 }
    },
    estimatedSavings: 18,
    currentlyActive: true
  });
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [gridStatus, setGridStatus] = useState<GridStatus>({
    frequency: 60.0,
    voltage: 480,
    stability: 'stable',
    renewablePercentage: 42,
    carbonIntensity: 285,
    congestionLevel: 'medium'
  });

  // Calculate current and projected costs
  const calculateCosts = () => {
    const currentHour = new Date().getHours();
    const currentPrice = priceData.find(p => !p.forecast)?.price || 0.14;
    const avgPrice = priceData.filter(p => !p.forecast).reduce((sum, p) => sum + p.price, 0) / priceData.filter(p => !p.forecast).length;
    const peakPrice = Math.max(...priceData.map(p => p.price));
    const offPeakPrice = Math.min(...priceData.map(p => p.price));
    
    // Assume 500kW average load
    const avgLoad = 500;
    const dailyCost = avgLoad * 24 * avgPrice;
    const monthlyCost = dailyCost * 30;
    const savingsWithOptimization = monthlyCost * (selectedStrategy.estimatedSavings / 100);
    
    return {
      currentPrice,
      avgPrice,
      peakPrice,
      offPeakPrice,
      dailyCost,
      monthlyCost,
      savingsWithOptimization,
      projectedMonthlyCost: monthlyCost - savingsWithOptimization
    };
  };

  const costs = calculateCosts();

  // Generate load profile data
  const generateLoadProfile = (): LoadProfile[] => {
    return Array.from({ length: 24 }, (_, hour) => {
      const baseLoad = 150 + Math.sin(hour * 0.3) * 20;
      const lightingLoad = hour >= 6 && hour < 18 ? 300 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 : 0;
      const hvacLoad = 100 + Math.sin(hour * 0.2) * 30 + (lightingLoad > 0 ? 80 : 0);
      const otherLoad = 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20;
      const totalLoad = baseLoad + lightingLoad + hvacLoad + otherLoad;
      
      return {
        hour,
        baseLoad,
        lightingLoad,
        hvacLoad,
        otherLoad,
        totalLoad,
        shiftableLoad: lightingLoad * 0.2 + hvacLoad * 0.3,
        criticalLoad: baseLoad + lightingLoad * 0.8
      };
    });
  };

  const loadProfile = generateLoadProfile();

  // Generate optimization scenarios
  const generateOptimizationScenarios = () => {
    const baseline = loadProfile.reduce((sum, l) => sum + l.totalLoad, 0);
    const prices = priceData.slice(25, 49); // Next 24 hours
    
    return [
      {
        name: 'Baseline',
        cost: prices.reduce((sum, p, i) => sum + p.price * loadProfile[i].totalLoad, 0),
        peakDemand: Math.max(...loadProfile.map(l => l.totalLoad)),
        carbonEmissions: baseline * 0.285 // kg CO2
      },
      {
        name: 'Cost Optimized',
        cost: prices.reduce((sum, p, i) => sum + p.price * loadProfile[i].totalLoad, 0) * 0.82,
        peakDemand: Math.max(...loadProfile.map(l => l.totalLoad)) * 0.9,
        carbonEmissions: baseline * 0.285 * 1.05
      },
      {
        name: 'Carbon Optimized',
        cost: prices.reduce((sum, p, i) => sum + p.price * loadProfile[i].totalLoad, 0) * 0.95,
        peakDemand: Math.max(...loadProfile.map(l => l.totalLoad)),
        carbonEmissions: baseline * 0.285 * 0.75
      },
      {
        name: 'Balanced',
        cost: prices.reduce((sum, p, i) => sum + p.price * loadProfile[i].totalLoad, 0) * 0.88,
        peakDemand: Math.max(...loadProfile.map(l => l.totalLoad)) * 0.95,
        carbonEmissions: baseline * 0.285 * 0.90
      }
    ];
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update grid status
      setGridStatus(prev => ({
        ...prev,
        frequency: 60 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1,
        voltage: 480 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5,
        renewablePercentage: Math.max(0, Math.min(100, prev.renewablePercentage + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5)),
        carbonIntensity: Math.max(200, Math.min(400, prev.carbonIntensity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTierColor = (tier: EnergyPrice['tier']) => {
    switch (tier) {
      case 'off-peak': return '#10B981';
      case 'mid-peak': return '#F59E0B';
      case 'on-peak': return '#EF4444';
      case 'critical': return '#991B1B';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Real-Time Energy Market Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Dynamic pricing optimization and demand response
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              gridStatus.stability === 'stable' ? 'bg-green-500' :
              gridStatus.stability === 'unstable' ? 'bg-yellow-500' :
              'bg-red-500'
            } animate-pulse`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Grid {gridStatus.stability}</span>
          </div>
          <button
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              automationEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {automationEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {automationEnabled ? 'Auto-Optimize ON' : 'Auto-Optimize OFF'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Current Price</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${costs.currentPrice.toFixed(3)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per kWh</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Daily Cost</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(costs.dailyCost)}
          </p>
          <p className="text-xs text-green-500 mt-1">
            -${costs.dailyCost * (selectedStrategy.estimatedSavings / 100) | 0} saved
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Peak Demand</span>
            <Gauge className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.max(...loadProfile.map(l => l.totalLoad)).toFixed(0)} kW
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${(Math.max(...loadProfile.map(l => l.totalLoad)) * 15).toFixed(0)} charge
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Carbon Intensity</span>
            <Cloud className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {gridStatus.carbonIntensity}
          </p>
          <p className="text-xs text-gray-500 mt-1">gCO₂/kWh</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">DR Events</span>
            <Bell className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {demandResponses.filter(dr => dr.status === 'scheduled').length}
          </p>
          <p className="text-xs text-purple-500 mt-1">upcoming</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'pricing', label: 'Energy Pricing', icon: TrendingUp },
          { id: 'demand', label: 'Demand Response', icon: Activity },
          { id: 'optimization', label: 'Optimization', icon: Target },
          { id: 'contracts', label: 'Contracts', icon: CreditCard },
          { id: 'analytics', label: 'Analytics', icon: LineChart }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Views */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Real-time Price Chart */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              48-Hour Energy Price Forecast
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={priceData.map(p => ({
                time: p.time.getHours(),
                price: p.price,
                tier: p.tier,
                forecast: p.forecast
              }))}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Price ($/kWh)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                          <p className="text-white font-medium">
                            ${data.price.toFixed(3)}/kWh
                          </p>
                          <p className="text-sm text-gray-400">
                            {data.tier.replace('-', ' ')} • {data.forecast ? 'Forecast' : 'Actual'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  x={24} 
                  stroke="#6B7280" 
                  strokeDasharray="5 5" 
                  label={{ value: "Now", position: "top" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#F59E0B" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Load Management Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Current Load Distribution
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={loadProfile.slice(new Date().getHours() - 2, new Date().getHours() + 4)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Bar dataKey="baseLoad" stackId="a" fill="#6366F1" name="Base Load" />
                  <Bar dataKey="lightingLoad" stackId="a" fill="#F59E0B" name="Lighting" />
                  <Bar dataKey="hvacLoad" stackId="a" fill="#3B82F6" name="HVAC" />
                  <Bar dataKey="otherLoad" stackId="a" fill="#10B981" name="Other" />
                  <Line type="monotone" dataKey="shiftableLoad" stroke="#EF4444" strokeWidth={2} name="Shiftable" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Optimization Opportunities
              </h4>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Load Shifting</span>
                    </div>
                    <span className="text-sm text-green-600">Save $124/day</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Shift 30% of lighting load to off-peak hours
                  </p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Battery className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Peak Shaving</span>
                    </div>
                    <span className="text-sm text-green-600">Save $89/day</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reduce peak demand by 15% using battery storage
                  </p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Renewable Matching</span>
                    </div>
                    <span className="text-sm text-green-600">-142 kg CO₂/day</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Align loads with high renewable generation periods
                  </p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Market Alerts
              </h4>
            </div>
            <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <div className="flex items-center justify-between">
                <span>Critical pricing event expected tomorrow 2-6 PM</span>
                <span className="font-medium">$0.45/kWh peak</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Voluntary demand response opportunity in 4 hours</span>
                <span className="font-medium">$0.50/kW incentive</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Grid congestion warning for current zone</span>
                <span className="font-medium">Consider load reduction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'pricing' && (
        <div className="space-y-6">
          {/* Detailed Price Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Time-of-Use Pricing Structure
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceData.slice(24, 48).map(p => ({
                  hour: p.time.getHours(),
                  price: p.price,
                  tier: p.tier
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Bar dataKey="price" fill={(entry: any) => getTierColor(entry.tier)} />
                  <ReferenceLine y={costs.avgPrice} stroke="#6B7280" strokeDasharray="5 5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Price Statistics (24h)
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${costs.avgPrice.toFixed(3)}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Peak</span>
                    <span className="font-medium text-red-600">
                      ${costs.peakPrice.toFixed(3)}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Off-Peak</span>
                    <span className="font-medium text-green-600">
                      ${costs.offPeakPrice.toFixed(3)}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Spread</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(costs.peakPrice - costs.offPeakPrice).toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Rate Periods
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Off-Peak: 10 PM - 6 AM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Mid-Peak: 6-9 AM, 8-10 PM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      On-Peak: 2-6 PM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-900" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Critical: Event-based
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Forecast Accuracy */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Forecast Accuracy
                </h4>
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                94.2% accurate (7-day avg)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <p className="font-medium mb-1">Machine Learning Model</p>
                <p>LSTM neural network with weather and demand inputs</p>
              </div>
              <div>
                <p className="font-medium mb-1">Update Frequency</p>
                <p>Every 5 minutes with 48-hour rolling forecast</p>
              </div>
              <div>
                <p className="font-medium mb-1">Confidence Interval</p>
                <p>±$0.02/kWh for next 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'demand' && (
        <div className="space-y-6">
          {/* Active and Upcoming DR Events */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Demand Response Events
            </h3>
            {demandResponses.map(dr => (
              <div key={dr.id} className={`rounded-lg p-4 ${
                dr.status === 'scheduled' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                dr.status === 'active' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        dr.eventType === 'emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        dr.eventType === 'mandatory' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {dr.eventType.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        dr.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        dr.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        dr.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {dr.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {dr.targetReduction} kW reduction requested
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dr.startTime.toLocaleDateString()} {dr.startTime.toLocaleTimeString()} - {dr.endTime.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      ${dr.incentiveRate}/kW
                    </p>
                    {dr.earnings && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Earned: ${dr.earnings}
                      </p>
                    )}
                  </div>
                </div>
                
                {dr.status === 'scheduled' && (
                  <div className="mt-4 flex items-center gap-3">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                      Accept & Prepare
                    </button>
                    <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                      Opt Out
                    </button>
                    <span className="text-sm text-gray-500">
                      Response required by {new Date(dr.startTime.getTime() - 60 * 60 * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                {dr.actualReduction && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Performance</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {dr.actualReduction} kW achieved ({((dr.actualReduction / dr.targetReduction) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* DR Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                This Month
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Events</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Reduction</span>
                  <span className="font-medium">1,250 kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Earnings</span>
                  <span className="font-medium text-green-600">$3,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Available Capacity
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Immediate (5 min)</span>
                    <span className="font-medium">85 kW</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Short Notice (1 hr)</span>
                    <span className="font-medium">180 kW</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Planned (24 hr)</span>
                    <span className="font-medium">320 kW</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Load Shedding Priority
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">1.</span>
                  <span className="text-gray-700 dark:text-gray-300">Non-critical HVAC zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">2.</span>
                  <span className="text-gray-700 dark:text-gray-300">Dimmable lighting (20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">3.</span>
                  <span className="text-gray-700 dark:text-gray-300">Auxiliary equipment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">4.</span>
                  <span className="text-gray-700 dark:text-gray-300">Partial grow room shutdown</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'optimization' && (
        <div className="space-y-6">
          {/* Strategy Selection */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Optimization Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { id: 'cost', name: 'Cost Minimization', icon: DollarSign, savings: 22, selected: selectedStrategy.type === 'cost' },
                { id: 'carbon', name: 'Carbon Reduction', icon: Cloud, savings: 12, selected: selectedStrategy.type === 'carbon' },
                { id: 'reliability', name: 'Grid Stability', icon: Shield, savings: 8, selected: selectedStrategy.type === 'reliability' },
                { id: 'balanced', name: 'Balanced', icon: Target, savings: 18, selected: selectedStrategy.type === 'balanced' }
              ].map(strategy => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(prev => ({ ...prev, type: strategy.id as any, estimatedSavings: strategy.savings }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    strategy.selected 
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <strategy.icon className={`w-8 h-8 mb-2 ${
                    strategy.selected ? 'text-yellow-600' : 'text-gray-500'
                  }`} />
                  <h4 className={`font-medium ${
                    strategy.selected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {strategy.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {strategy.savings}% savings
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Optimization Scenarios */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              24-Hour Optimization Comparison
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateOptimizationScenarios()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Cost') return `$${value.toFixed(0)}`;
                    if (name === 'Peak Demand') return `${value.toFixed(0)} kW`;
                    if (name === 'Carbon') return `${value.toFixed(0)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#F59E0B" name="Cost" />
                <Bar dataKey="peakDemand" fill="#EF4444" name="Peak Demand" />
                <Bar dataKey="carbonEmissions" fill="#6B7280" name="Carbon" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Optimization Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Optimization Parameters
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Max Demand Limit</span>
                    <span className="font-medium">{selectedStrategy.rules.maxDemand} kW</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="1000"
                    value={selectedStrategy.rules.maxDemand}
                    onChange={(e) => setSelectedStrategy(prev => ({
                      ...prev,
                      rules: { ...prev.rules, maxDemand: Number(e.target.value) }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Shiftable Load %</span>
                    <span className="font-medium">{selectedStrategy.rules.shiftablePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={selectedStrategy.rules.shiftablePercentage}
                    onChange={(e) => setSelectedStrategy(prev => ({
                      ...prev,
                      rules: { ...prev.rules, shiftablePercentage: Number(e.target.value) }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Temperature Range</span>
                    <span className="font-medium">
                      {selectedStrategy.rules.comfortRange?.min}-{selectedStrategy.rules.comfortRange?.max}°C
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={selectedStrategy.rules.comfortRange?.min}
                      onChange={(e) => setSelectedStrategy(prev => ({
                        ...prev,
                        rules: { 
                          ...prev.rules, 
                          comfortRange: { 
                            ...prev.rules.comfortRange!, 
                            min: Number(e.target.value) 
                          } 
                        }
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={selectedStrategy.rules.comfortRange?.max}
                      onChange={(e) => setSelectedStrategy(prev => ({
                        ...prev,
                        rules: { 
                          ...prev.rules, 
                          comfortRange: { 
                            ...prev.rules.comfortRange!, 
                            max: Number(e.target.value) 
                          } 
                        }
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                AI Optimization Engine
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Machine Learning</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Predictive Control</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weather Integration</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                    Connected
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Last optimization run: 5 min ago</p>
                  <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm">
                    Run Manual Optimization
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'contracts' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Energy Supply Contracts
          </h3>
          
          {/* Active Contract */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Pacific Energy Solutions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time-of-Use Commercial Rate</p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Base Rate</p>
                <p className="font-medium text-gray-900 dark:text-white">$0.095/kWh</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Peak Rate</p>
                <p className="font-medium text-gray-900 dark:text-white">$0.225/kWh</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Demand Charge</p>
                <p className="font-medium text-gray-900 dark:text-white">$15/kW</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contract End</p>
                <p className="font-medium text-gray-900 dark:text-white">Dec 2025</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Monthly Capacity: 350,000 kWh</span>
                <span className="text-gray-600 dark:text-gray-400">Used: 68%</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View Details
              </button>
            </div>
          </div>

          {/* Alternative Options */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Market Alternatives
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">Real-Time Pricing</h5>
                  <span className="text-sm text-green-600">Save ~15%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Dynamic hourly pricing based on wholesale market rates
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Avg: $0.082/kWh</span>
                  <span className="text-gray-600 dark:text-gray-400">Risk: High</span>
                  <button className="text-blue-600 hover:text-blue-700">Compare</button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">Green Power Purchase</h5>
                  <span className="text-sm text-blue-600">100% Renewable</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Fixed rate with certified renewable energy credits
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fixed: $0.110/kWh</span>
                  <span className="text-gray-600 dark:text-gray-400">Risk: Low</span>
                  <button className="text-blue-600 hover:text-blue-700">Compare</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          {/* Cost Analysis */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Energy Cost Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                    day: i + 1,
                    baseline: 2800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400,
                    optimized: 2200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300,
                    savings: 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" tick={{ fill: '#6B7280' }} />
                    <YAxis tick={{ fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#E5E7EB' }}
                      formatter={(value: number) => `$${value.toFixed(0)}`}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="baseline" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Baseline Cost" />
                    <Area type="monotone" dataKey="optimized" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Optimized Cost" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Monthly Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Consumption</span>
                      <span className="font-medium">285,420 kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Energy Cost</span>
                      <span className="font-medium">$42,813</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Demand Charges</span>
                      <span className="font-medium">$12,450</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Total Savings</span>
                      <span className="font-medium text-green-600">$9,847</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h5 className="font-medium text-green-900 dark:text-green-100">
                      Projected Annual Savings
                    </h5>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    $118,164
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    With current optimization strategy
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Load Factor
              </h5>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">72%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">30-day average</p>
                <div className="mt-3 text-xs text-green-600">+5% vs last month</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-500" />
                Peak Coincidence
              </h5>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">42%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Grid peak overlap</p>
                <div className="mt-3 text-xs text-green-600">-12% improved</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-yellow-500" />
                AI Accuracy
              </h5>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">96.5%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Forecast accuracy</p>
                <div className="mt-3 text-xs text-gray-500">7-day rolling avg</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}