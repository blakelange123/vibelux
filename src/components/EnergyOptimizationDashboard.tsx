'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  Zap,
  TrendingDown,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Sun,
  Moon,
  Cloud,
  Gauge,
  Battery,
  Wifi,
  WifiOff,
  Lightbulb,
  Timer,
  BarChart3,
  Target,
  Cpu,
  AlertTriangle,
  RefreshCw,
  Settings,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Bell,
  Fuel
} from 'lucide-react';

import CHPDecisionEngine from './energy/CHPDecisionEngine';

interface Props {
  facilityId: string;
}

// Real-time grid pricing data
const gridPricingData = [
  { time: '12AM', price: 0.08, demand: 65 },
  { time: '1AM', price: 0.07, demand: 60 },
  { time: '2AM', price: 0.06, demand: 55 },
  { time: '3AM', price: 0.06, demand: 50 },
  { time: '4AM', price: 0.07, demand: 52 },
  { time: '5AM', price: 0.08, demand: 58 },
  { time: '6AM', price: 0.10, demand: 70 },
  { time: '7AM', price: 0.12, demand: 80 },
  { time: '8AM', price: 0.14, demand: 85 },
  { time: '9AM', price: 0.15, demand: 88 },
  { time: '10AM', price: 0.16, demand: 90 },
  { time: '11AM', price: 0.18, demand: 92 },
  { time: '12PM', price: 0.20, demand: 95 },
  { time: '1PM', price: 0.22, demand: 98 },
  { time: '2PM', price: 0.24, demand: 100 },
  { time: '3PM', price: 0.23, demand: 98 },
  { time: '4PM', price: 0.21, demand: 95 },
  { time: '5PM', price: 0.19, demand: 92 },
  { time: '6PM', price: 0.17, demand: 88 },
  { time: '7PM', price: 0.15, demand: 85 },
  { time: '8PM', price: 0.13, demand: 80 },
  { time: '9PM', price: 0.11, demand: 75 },
  { time: '10PM', price: 0.10, demand: 70 },
  { time: '11PM', price: 0.09, demand: 65 }
];

// Energy savings over time
const savingsData = [
  { date: 'Mon', baseline: 850, actual: 680, savings: 170, percentage: 20 },
  { date: 'Tue', baseline: 860, actual: 645, savings: 215, percentage: 25 },
  { date: 'Wed', baseline: 840, actual: 672, savings: 168, percentage: 20 },
  { date: 'Thu', baseline: 880, actual: 704, savings: 176, percentage: 20 },
  { date: 'Fri', baseline: 900, actual: 675, savings: 225, percentage: 25 },
  { date: 'Sat', baseline: 820, actual: 615, savings: 205, percentage: 25 },
  { date: 'Sun', baseline: 800, actual: 640, savings: 160, percentage: 20 }
];

// Control system performance
const systemPerformance = [
  { metric: 'Response Time', value: 95, target: 90 },
  { metric: 'Optimization Rate', value: 88, target: 85 },
  { metric: 'System Uptime', value: 99.8, target: 99 },
  { metric: 'Data Accuracy', value: 97, target: 95 },
  { metric: 'Energy Efficiency', value: 92, target: 90 },
  { metric: 'Cost Reduction', value: 85, target: 80 }
];

// Demand response events
const demandResponseData = [
  { month: 'Jan', participated: 8, available: 10, earnings: 1200 },
  { month: 'Feb', participated: 7, available: 9, earnings: 1050 },
  { month: 'Mar', participated: 9, available: 11, earnings: 1350 },
  { month: 'Apr', participated: 6, available: 8, earnings: 900 },
  { month: 'May', participated: 10, available: 12, earnings: 1500 },
  { month: 'Jun', participated: 12, available: 14, earnings: 1800 }
];

// Zone optimization status
const zoneData = [
  { zone: 'Flower Room 1', status: 'active', intensity: 85, savings: 22 },
  { zone: 'Flower Room 2', status: 'active', intensity: 82, savings: 25 },
  { zone: 'Veg Room 1', status: 'active', intensity: 90, savings: 18 },
  { zone: 'Veg Room 2', status: 'paused', intensity: 100, savings: 0 },
  { zone: 'Clone Room', status: 'active', intensity: 75, savings: 30 },
  { zone: 'Dry Room', status: 'inactive', intensity: 0, savings: 0 }
];

// Custom tooltip for grid pricing
const GridPricingTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm font-medium text-white">{payload[0].payload.time}</p>
        <p className="text-sm text-green-400">Price: ${payload[0].value}/kWh</p>
        <p className="text-sm text-blue-400">Demand: {payload[1].value}%</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for savings
const SavingsTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm font-medium text-white">{payload[0].payload.date}</p>
        <p className="text-sm text-gray-400">Baseline: {payload[0].value} kWh</p>
        <p className="text-sm text-green-400">Actual: {payload[1].value} kWh</p>
        <p className="text-sm text-yellow-400">Saved: {payload[0].payload.savings} kWh ({payload[0].payload.percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function EnergyOptimizationDashboard({ facilityId }: Props) {
  const [isOptimizing, setIsOptimizing] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [peakThreshold, setPeakThreshold] = useState([85]);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Animate savings counter
  useEffect(() => {
    const targetSavings = 1319;
    const duration = 2000;
    const steps = 60;
    const increment = targetSavings / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetSavings) {
        setAnimatedSavings(targetSavings);
        clearInterval(timer);
      } else {
        setAnimatedSavings(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Update current hour
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentPrice = gridPricingData[currentHour].price;
  const isPeakHour = currentPrice > 0.15;
  const totalMonthlySavings = 8234;
  const projectedAnnualSavings = totalMonthlySavings * 12;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Current Savings</p>
                <p className="text-3xl font-bold text-green-400">${animatedSavings}</p>
                <p className="text-sm text-gray-400 mt-1">This week</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <TrendingDown className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">+23% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Grid Price</p>
                <p className="text-3xl font-bold text-blue-400">${currentPrice}</p>
                <p className="text-sm text-gray-400 mt-1">per kWh</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant={isPeakHour ? "destructive" : "default"} className="text-xs">
                {isPeakHour ? 'Peak Hours' : 'Off-Peak'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">System Status</p>
                <p className="text-2xl font-bold text-purple-400">Optimizing</p>
                <p className="text-sm text-gray-400 mt-1">6 zones active</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full animate-pulse">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={88} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Control System</p>
                <p className="text-2xl font-bold text-yellow-400">TrolMaster</p>
                <p className="text-sm text-gray-400 mt-1">{connectionStatus}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                {connectionStatus === 'connected' ? (
                  <Wifi className="w-6 h-6 text-yellow-400" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Live sync active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grid">Grid Pricing</TabsTrigger>
          <TabsTrigger value="zones">Zone Control</TabsTrigger>
          <TabsTrigger value="dli">DLI Control</TabsTrigger>
          <TabsTrigger value="demand">Demand Response</TabsTrigger>
          <TabsTrigger value="chp">CHP Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Energy Savings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Energy Consumption</CardTitle>
                <CardDescription>Baseline vs Optimized Usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={savingsData}>
                    <defs>
                      <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<SavingsTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="#8884d8" 
                      fill="url(#baselineGradient)"
                      name="Baseline"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#82ca9d" 
                      fill="url(#actualGradient)"
                      name="Optimized"
                    />
                    <Bar dataKey="savings" fill="#fbbf24" name="Savings" opacity={0.8} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>Current vs Target Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={systemPerformance}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                    <Radar 
                      name="Current" 
                      dataKey="value" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Target" 
                      dataKey="target" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.3} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>Configure your energy optimization strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="optimization-toggle">Automatic Optimization</Label>
                  <p className="text-sm text-gray-400">AI-powered energy savings based on grid conditions</p>
                </div>
                <Switch
                  id="optimization-toggle"
                  checked={isOptimizing}
                  onCheckedChange={setIsOptimizing}
                />
              </div>

              <div className="space-y-3">
                <Label>Optimization Strategy</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant={selectedStrategy === 'aggressive' ? 'default' : 'outline'}
                    onClick={() => setSelectedStrategy('aggressive')}
                    className="justify-start"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Aggressive
                  </Button>
                  <Button
                    variant={selectedStrategy === 'balanced' ? 'default' : 'outline'}
                    onClick={() => setSelectedStrategy('balanced')}
                    className="justify-start"
                  >
                    <Gauge className="w-4 h-4 mr-2" />
                    Balanced
                  </Button>
                  <Button
                    variant={selectedStrategy === 'conservative' ? 'default' : 'outline'}
                    onClick={() => setSelectedStrategy('conservative')}
                    className="justify-start"
                  >
                    <Leaf className="w-4 h-4 mr-2" />
                    Conservative
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Peak Demand Threshold</Label>
                  <span className="text-sm text-gray-400">{peakThreshold[0]}%</span>
                </div>
                <Slider
                  value={peakThreshold}
                  onValueChange={setPeakThreshold}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-400">
                  Reduce lighting intensity when grid demand exceeds this threshold
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Grid Pricing & Demand</CardTitle>
              <CardDescription>Real-time electricity rates and grid demand</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={gridPricingData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis yAxisId="price" stroke="#10b981" />
                  <YAxis yAxisId="demand" orientation="right" stroke="#f59e0b" />
                  <Tooltip content={<GridPricingTooltip />} />
                  <Legend />
                  <ReferenceLine 
                    x={gridPricingData[currentHour].time} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    label={{ value: "Now", position: "top" }}
                  />
                  <Area
                    yAxisId="price"
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    fill="url(#priceGradient)"
                    name="Price ($/kWh)"
                  />
                  <Line
                    yAxisId="demand"
                    type="monotone"
                    dataKey="demand"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="Grid Demand (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>Upcoming peak pricing periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>High prices expected: 2:00 PM - 4:00 PM</span>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          $0.24/kWh
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>Low prices tonight: 11:00 PM - 4:00 AM</span>
                        <Badge variant="outline" className="text-blue-500 border-blue-500">
                          $0.06/kWh
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Schedule</CardTitle>
                <CardDescription>Planned lighting adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="font-medium">Morning Ramp</p>
                        <p className="text-sm text-gray-400">6:00 AM - 8:00 AM</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">+15%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="font-medium">Peak Reduction</p>
                        <p className="text-sm text-gray-400">2:00 PM - 4:00 PM</p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">-25%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium">Night Mode</p>
                        <p className="text-sm text-gray-400">10:00 PM - 6:00 AM</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Zone Status Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Zone Optimization Status</CardTitle>
                  <CardDescription>Real-time control and monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zoneData.map((zone) => (
                      <div
                        key={zone.zone}
                        className={`p-4 rounded-lg border ${
                          zone.status === 'active' 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : zone.status === 'paused'
                            ? 'bg-yellow-500/10 border-yellow-500/20'
                            : 'bg-gray-800 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{zone.zone}</h4>
                          <Badge
                            variant={zone.status === 'active' ? 'default' : 'secondary'}
                            className={
                              zone.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : zone.status === 'paused'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : ''
                            }
                          >
                            {zone.status}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-400">Light Intensity</span>
                              <span>{zone.intensity}%</span>
                            </div>
                            <Progress value={zone.intensity} className="h-2" />
                          </div>
                          {zone.status === 'active' && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Energy Saved</span>
                              <span className="text-green-400">{zone.savings}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Zone Performance Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Efficiency</CardTitle>
                <CardDescription>Energy savings by zone</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={zoneData.filter(z => z.savings > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ zone, savings }) => `${zone}: ${savings}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="savings"
                    >
                      {zoneData.filter(z => z.savings > 0).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Zone Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Zone Controls</CardTitle>
              <CardDescription>Fine-tune optimization settings per zone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Intensity Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Slider defaultValue={[70]} min={50} max={100} step={5} />
                    <span className="text-sm w-12">70%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Response Time</Label>
                  <div className="flex items-center gap-2">
                    <Slider defaultValue={[5]} min={1} max={30} step={1} />
                    <span className="text-sm w-12">5m</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <div className="flex items-center gap-2">
                    <Slider defaultValue={[3]} min={1} max={5} step={1} />
                    <span className="text-sm w-12">3/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Demand Response Participation */}
            <Card>
              <CardHeader>
                <CardTitle>Demand Response Participation</CardTitle>
                <CardDescription>Monthly event participation and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={demandResponseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis yAxisId="events" stroke="#3b82f6" />
                    <YAxis yAxisId="earnings" orientation="right" stroke="#10b981" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="events"
                      dataKey="participated" 
                      fill="#3b82f6" 
                      name="Events Participated"
                    />
                    <Bar 
                      yAxisId="events"
                      dataKey="available" 
                      fill="#6366f1" 
                      opacity={0.3}
                      name="Events Available"
                    />
                    <Line 
                      yAxisId="earnings"
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Earnings ($)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming DR Events</CardTitle>
                <CardDescription>Scheduled demand response opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Peak Shaving Event</h4>
                      <Badge className="bg-green-500/20 text-green-400">Enrolled</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Tomorrow, 2:00 PM - 6:00 PM</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Est. Earnings: $280</span>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Emergency Response</h4>
                      <Badge className="bg-blue-500/20 text-blue-400">Standby</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">On-call this week</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Est. Earnings: $150-500</span>
                      <Button size="sm" variant="outline">
                        <Bell className="w-3 h-3 mr-1" />
                        Alerts On
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DR Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Demand Response Performance</CardTitle>
              <CardDescription>Your facility's DR participation metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">92%</div>
                  <p className="text-sm text-gray-400 mt-1">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">47</div>
                  <p className="text-sm text-gray-400 mt-1">Events (YTD)</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">$8,340</div>
                  <p className="text-sm text-gray-400 mt-1">Total Earnings</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">A+</div>
                  <p className="text-sm text-gray-400 mt-1">Performance Grade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Savings Projection */}
            <Card>
              <CardHeader>
                <CardTitle>Savings Projection</CardTitle>
                <CardDescription>Estimated annual savings based on current performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-green-400 mb-2">
                      ${projectedAnnualSavings.toLocaleString()}
                    </div>
                    <p className="text-gray-400">Projected Annual Savings</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <span className="text-sm">Energy Cost Reduction</span>
                      <span className="text-sm font-medium">$72,456</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <span className="text-sm">Demand Response Earnings</span>
                      <span className="text-sm font-medium">$18,240</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <span className="text-sm">Carbon Credit Value</span>
                      <span className="text-sm font-medium">$8,112</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Your contribution to sustainability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <Leaf className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-400">124</div>
                      <p className="text-sm text-gray-400">Tons CO₂ Saved</p>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                      <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-400">285</div>
                      <p className="text-sm text-gray-400">MWh Reduced</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={savingsData}>
                        <defs>
                          <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="savings" 
                          stroke="#10b981" 
                          fill="url(#co2Gradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive optimization analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Metric</th>
                      <th className="text-right py-3 px-4">This Week</th>
                      <th className="text-right py-3 px-4">Last Week</th>
                      <th className="text-right py-3 px-4">Change</th>
                      <th className="text-right py-3 px-4">YTD Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">Energy Saved (kWh)</td>
                      <td className="text-right py-3 px-4">1,319</td>
                      <td className="text-right py-3 px-4">1,072</td>
                      <td className="text-right py-3 px-4 text-green-400">+23%</td>
                      <td className="text-right py-3 px-4">45,892</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">Cost Savings ($)</td>
                      <td className="text-right py-3 px-4">$197.85</td>
                      <td className="text-right py-3 px-4">$160.80</td>
                      <td className="text-right py-3 px-4 text-green-400">+23%</td>
                      <td className="text-right py-3 px-4">$6,883.80</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">Peak Demand Reduced (kW)</td>
                      <td className="text-right py-3 px-4">42</td>
                      <td className="text-right py-3 px-4">38</td>
                      <td className="text-right py-3 px-4 text-green-400">+11%</td>
                      <td className="text-right py-3 px-4">1,456</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">DR Events Participated</td>
                      <td className="text-right py-3 px-4">3</td>
                      <td className="text-right py-3 px-4">2</td>
                      <td className="text-right py-3 px-4 text-green-400">+50%</td>
                      <td className="text-right py-3 px-4">47</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">System Uptime</td>
                      <td className="text-right py-3 px-4">99.8%</td>
                      <td className="text-right py-3 px-4">99.5%</td>
                      <td className="text-right py-3 px-4 text-green-400">+0.3%</td>
                      <td className="text-right py-3 px-4">99.7%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dli" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* DLI Targets & Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>DLI Compensation Status</CardTitle>
                <CardDescription>Real-time DLI tracking and energy optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">Target DLI</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">18.5</p>
                      <p className="text-xs text-gray-400">mol/m²/day</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">Current DLI</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">16.2</p>
                      <p className="text-xs text-gray-400">87% of target</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Progress</span>
                      <span>16.2 / 18.5 mol/m²</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Natural Light:</span>
                      <p className="font-medium">4.2 mol/m²</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Supplemental:</span>
                      <p className="font-medium">12.0 mol/m²</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spectral Strategy for Energy Savings */}
            <Card>
              <CardHeader>
                <CardTitle>Smart Spectral Optimization</CardTitle>
                <CardDescription>Energy-efficient spectrum strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Peak Hour Strategy</Label>
                      <p className="text-sm text-gray-400">Deep red focus during expensive electricity hours</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Current Strategy: Deep Red Efficiency</span>
                    </div>
                    <p className="text-sm text-gray-300">Using 75% deep red spectrum to maximize photosynthesis efficiency during peak rate period (2-6 PM)</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400">Energy Savings:</span>
                        <p className="font-medium text-green-400">28% reduction</p>
                      </div>
                      <div>
                        <span className="text-gray-400">DLI Impact:</span>
                        <p className="font-medium text-blue-400">Maintained</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Spectrum Composition</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Deep Red (660nm)</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-1" />
                      <div className="flex justify-between text-sm">
                        <span>Blue (450nm)</span>
                        <span>15%</span>
                      </div>
                      <Progress value={15} className="h-1" />
                      <div className="flex justify-between text-sm">
                        <span>Full Spectrum</span>
                        <span>10%</span>
                      </div>
                      <Progress value={10} className="h-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time-of-Day DLI Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>DLI Compensation Schedule</CardTitle>
              <CardDescription>Automated DLI delivery optimized for grid pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Adaptive DLI Scheduling</Label>
                    <p className="text-sm text-gray-400">Automatically adjusts light delivery based on energy rates and natural light</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={[
                        { hour: '6 AM', naturalLight: 0.5, supplements: 120, dliTarget: 18.5, energyRate: 0.08 },
                        { hour: '8 AM', naturalLight: 2.1, supplements: 180, dliTarget: 18.5, energyRate: 0.12 },
                        { hour: '10 AM', naturalLight: 4.2, supplements: 140, dliTarget: 18.5, energyRate: 0.16 },
                        { hour: '12 PM', naturalLight: 6.8, supplements: 80, dliTarget: 18.5, energyRate: 0.20 },
                        { hour: '2 PM', naturalLight: 5.9, supplements: 60, dliTarget: 18.5, energyRate: 0.24 },
                        { hour: '4 PM', naturalLight: 3.2, supplements: 90, dliTarget: 18.5, energyRate: 0.21 },
                        { hour: '6 PM', naturalLight: 1.8, supplements: 160, dliTarget: 18.5, energyRate: 0.17 },
                        { hour: '8 PM', naturalLight: 0.3, supplements: 200, dliTarget: 18.5, energyRate: 0.13 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="hour" stroke="#9CA3AF" />
                      <YAxis yAxisId="left" stroke="#3b82f6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="naturalLight" fill="#10b981" name="Natural Light" />
                      <Bar yAxisId="left" dataKey="supplements" fill="#3b82f6" name="Supplemental PPFD" />
                      <Line yAxisId="right" type="monotone" dataKey="energyRate" stroke="#f59e0b" strokeWidth={2} name="Energy Rate ($/kWh)" />
                      <ReferenceLine yAxisId="left" y={18.5} stroke="#ef4444" strokeDasharray="5 5" label="DLI Target" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">Off-Peak Hours</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">6-8 AM, 8-11 PM</p>
                    <p className="text-sm">Full spectrum delivery</p>
                    <p className="text-xs text-green-400">Low energy rates</p>
                  </div>
                  <div className="bg-yellow-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">Peak Hours</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">12-6 PM</p>
                    <p className="text-sm">Deep red efficiency</p>
                    <p className="text-xs text-yellow-400">High energy rates</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">Evening Push</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">6-8 PM</p>
                    <p className="text-sm">DLI compensation</p>
                    <p className="text-xs text-blue-400">Catch-up if needed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zone-Specific DLI Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Zone-Specific DLI Management</CardTitle>
              <CardDescription>Individual zone DLI targets and energy optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { zone: 'Flower Room 1', target: 40, current: 38.2, energyStrategy: 'Peak Hour Deep Red', savings: 32 },
                  { zone: 'Flower Room 2', target: 42, current: 41.8, energyStrategy: 'Balanced Spectrum', savings: 18 },
                  { zone: 'Veg Room 1', target: 20, current: 19.6, energyStrategy: 'Off-Peak Full Spectrum', savings: 8 },
                  { zone: 'Clone Room', target: 12, current: 11.8, energyStrategy: 'Gentle Light Timing', savings: 15 }
                ].map((room, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{room.zone}</h4>
                      <Badge className="bg-green-500/20 text-green-400">{room.savings}% saved</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Target DLI:</span>
                        <p className="font-medium">{room.target} mol/m²</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Current:</span>
                        <p className="font-medium text-green-400">{room.current} mol/m²</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Strategy:</span>
                        <p className="font-medium">{room.energyStrategy}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          Adjust
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{Math.round((room.current / room.target) * 100)}%</span>
                      </div>
                      <Progress value={(room.current / room.target) * 100} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chp" className="space-y-4">
          <CHPDecisionEngine />
        </TabsContent>
      </Tabs>
    </div>
  );
}