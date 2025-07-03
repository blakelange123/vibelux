'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Droplets,
  Thermometer,
  Wind,
  Calendar,
  Download,
  Filter,
  Target,
  Leaf,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

const mockYieldData = [
  { month: 'Jan', yield: 1200, target: 1300, quality: 92 },
  { month: 'Feb', yield: 1350, target: 1300, quality: 94 },
  { month: 'Mar', yield: 1280, target: 1300, quality: 89 },
  { month: 'Apr', yield: 1450, target: 1400, quality: 96 },
  { month: 'May', yield: 1520, target: 1400, quality: 93 },
  { month: 'Jun', yield: 1480, target: 1400, quality: 95 }
];

const mockEnvironmentalData = [
  { time: '00:00', temp: 22, humidity: 65, co2: 1200, light: 0 },
  { time: '06:00', temp: 24, humidity: 68, co2: 1100, light: 800 },
  { time: '12:00', temp: 26, humidity: 60, co2: 950, light: 1000 },
  { time: '18:00', temp: 25, humidity: 62, co2: 1050, light: 600 },
  { time: '24:00', temp: 22, humidity: 65, co2: 1200, light: 0 }
];

const mockEnergyData = [
  { month: 'Jan', lighting: 2400, hvac: 1800, irrigation: 400, other: 300 },
  { month: 'Feb', lighting: 2200, hvac: 1600, irrigation: 450, other: 280 },
  { month: 'Mar', lighting: 2500, hvac: 1900, irrigation: 420, other: 320 },
  { month: 'Apr', lighting: 2300, hvac: 1700, irrigation: 480, other: 290 },
  { month: 'May', lighting: 2600, hvac: 2100, irrigation: 500, other: 350 },
  { month: 'Jun', lighting: 2550, hvac: 2000, irrigation: 490, other: 340 }
];

const mockCropData = [
  { name: 'Vegetative', value: 35, count: 420 },
  { name: 'Flowering', value: 45, count: 540 },
  { name: 'Harvest Ready', value: 15, count: 180 },
  { name: 'Curing', value: 5, count: 60 }
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function FacilityPerformance() {
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  const kpis = [
    {
      label: 'Total Yield',
      value: '8,280 kg',
      change: '+12.3%',
      trend: 'up',
      icon: Leaf,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Quality Score',
      value: '93.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Energy Efficiency',
      value: '2.1 kWh/g',
      change: '-8.5%',
      trend: 'up',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Revenue',
      value: '$1.2M',
      change: '+18.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20'
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Room B3 humidity above optimal range',
      time: '2 hours ago',
      icon: Droplets
    },
    {
      id: 2,
      type: 'success',
      message: 'Harvest completed for Zone A - 95% quality achieved',
      time: '1 day ago',
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'info',
      message: 'Irrigation system maintenance scheduled for tomorrow',
      time: '2 days ago',
      icon: Settings
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="text-gray-300 mt-2">Monitor and analyze your facility's operational performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{kpi.label}</p>
                    <p className="text-3xl font-bold mt-2 text-white">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yield">Yield Analysis</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="energy">Energy Usage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crop Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Current Crop Status</CardTitle>
                <CardDescription className="text-gray-300">
                  Distribution of plants by growth stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCropData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {mockCropData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {mockCropData.map((item, index) => (
                    <div key={item.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.count} plants</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Alerts</CardTitle>
                <CardDescription className="text-gray-300">
                  Recent notifications and system status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-600">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'warning' ? 'bg-yellow-500/20' :
                        alert.type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          alert.type === 'warning' ? 'text-yellow-500' :
                          alert.type === 'success' ? 'text-green-500' : 'text-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Yield Analysis Tab */}
        <TabsContent value="yield" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Yield Performance</CardTitle>
              <CardDescription className="text-gray-300">
                Monthly yield vs targets and quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockYieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Bar dataKey="yield" fill="#8b5cf6" name="Actual Yield (kg)" />
                    <Bar dataKey="target" fill="#06b6d4" name="Target Yield (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quality Trends</CardTitle>
              <CardDescription className="text-gray-300">
                Quality score over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockYieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Environmental Conditions</CardTitle>
              <CardDescription className="text-gray-300">
                24-hour environmental monitoring data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockEnvironmentalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
                    <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} name="Humidity (%)" />
                    <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} name="CO2 (ppm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg Temperature</p>
                    <p className="text-2xl font-bold mt-2 text-white">24.2°C</p>
                    <p className="text-sm text-green-500 mt-1">Optimal range</p>
                  </div>
                  <Thermometer className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg Humidity</p>
                    <p className="text-2xl font-bold mt-2 text-white">63.8%</p>
                    <p className="text-sm text-green-500 mt-1">Within target</p>
                  </div>
                  <Droplets className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg CO2</p>
                    <p className="text-2xl font-bold mt-2 text-white">1,075 ppm</p>
                    <p className="text-sm text-green-500 mt-1">Good levels</p>
                  </div>
                  <Wind className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Energy Usage Tab */}
        <TabsContent value="energy" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Energy Consumption Breakdown</CardTitle>
              <CardDescription className="text-gray-300">
                Monthly energy usage by system category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockEnergyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Area type="monotone" dataKey="lighting" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="hvac" stackId="1" stroke="#06b6d4" fill="#06b6d4" />
                    <Area type="monotone" dataKey="irrigation" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="other" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Lighting</p>
                    <p className="text-xl font-bold mt-2 text-white">2,550 kWh</p>
                    <p className="text-sm text-yellow-500 mt-1">58% of total</p>
                  </div>
                  <div className="w-3 h-8 bg-yellow-500 rounded"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">HVAC</p>
                    <p className="text-xl font-bold mt-2 text-white">2,000 kWh</p>
                    <p className="text-sm text-blue-500 mt-1">35% of total</p>
                  </div>
                  <div className="w-3 h-8 bg-blue-500 rounded"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Irrigation</p>
                    <p className="text-xl font-bold mt-2 text-white">490 kWh</p>
                    <p className="text-sm text-green-500 mt-1">9% of total</p>
                  </div>
                  <div className="w-3 h-8 bg-green-500 rounded"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Other</p>
                    <p className="text-xl font-bold mt-2 text-white">340 kWh</p>
                    <p className="text-sm text-purple-500 mt-1">6% of total</p>
                  </div>
                  <div className="w-3 h-8 bg-purple-500 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}