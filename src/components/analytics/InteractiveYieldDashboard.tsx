'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Activity,
  Beaker,
  Zap,
  Droplets,
  Sun,
  Award,
  AlertCircle,
  CheckCircle,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

// Generate realistic daily yield data
const generateYieldData = (days: number) => {
  const baseYield = 2.5; // g/day/plant base
  const data = [];
  let cumulativeYield = 0;
  
  for (let i = 0; i < days; i++) {
    const growthPhase = i < 30 ? 'veg' : i < 70 ? 'flower' : 'harvest';
    const phaseMultiplier = 
      growthPhase === 'veg' ? 0.3 + (i / 30) * 0.5 :
      growthPhase === 'flower' ? 0.8 + (i - 30) / 40 * 0.4 :
      1.2 - (i - 70) / 20 * 0.3;
    
    const dailyYield = baseYield * phaseMultiplier + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5;
    cumulativeYield += dailyYield;
    
    data.push({
      day: i + 1,
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      dailyYield: Math.max(0, dailyYield),
      cumulativeYield,
      phase: growthPhase,
      ppfd: 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300,
      dli: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
      vpd: 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.6,
      co2: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600,
      waterUsage: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      nutrientEC: 1.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8,
      qualityScore: 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
    });
  }
  
  return data;
};

// Generate strain comparison data
const generateStrainData = () => [
  { strain: 'Blue Dream', yield: 2.8, thc: 21, cbd: 2, terpenes: 2.1, qualityScore: 92 },
  { strain: 'OG Kush', yield: 2.5, thc: 24, cbd: 0.3, terpenes: 2.8, qualityScore: 89 },
  { strain: 'Gelato', yield: 2.6, thc: 22, cbd: 0.5, terpenes: 2.5, qualityScore: 91 },
  { strain: 'Zkittlez', yield: 2.4, thc: 19, cbd: 1, terpenes: 3.2, qualityScore: 88 },
  { strain: 'Wedding Cake', yield: 2.7, thc: 25, cbd: 0.2, terpenes: 2.3, qualityScore: 93 },
];

// Generate quality metrics data
const generateQualityData = () => ({
  overall: 88,
  breakdown: {
    appearance: 92,
    aroma: 89,
    potency: 91,
    trichomes: 87,
    structure: 85,
    color: 90,
  },
  trends: [
    { week: 'W1', score: 75 },
    { week: 'W2', score: 78 },
    { week: 'W3', score: 82 },
    { week: 'W4', score: 85 },
    { week: 'W5', score: 87 },
    { week: 'W6', score: 88 },
    { week: 'W7', score: 89 },
    { week: 'W8', score: 88 },
  ],
});

// Environmental correlation data
const generateEnvironmentalCorrelations = () => [
  { factor: 'PPFD', correlation: 0.85, impact: 'High' },
  { factor: 'CO2', correlation: 0.78, impact: 'High' },
  { factor: 'Temperature', correlation: -0.45, impact: 'Medium' },
  { factor: 'Humidity', correlation: -0.32, impact: 'Medium' },
  { factor: 'VPD', correlation: 0.72, impact: 'High' },
  { factor: 'Nutrients', correlation: 0.68, impact: 'Medium' },
];

export default function InteractiveYieldDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'cycle'>('month');
  const [selectedStrain, setSelectedStrain] = useState('Blue Dream');
  const [yieldData, setYieldData] = useState(generateYieldData(30));
  const [strainData] = useState(generateStrainData());
  const [qualityData] = useState(generateQualityData());
  const [correlations] = useState(generateEnvironmentalCorrelations());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Update data based on time range
  useEffect(() => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    setYieldData(generateYieldData(days));
  }, [timeRange]);

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      setYieldData(generateYieldData(days));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  // Calculate current metrics
  const currentMetrics = {
    dailyYield: yieldData[yieldData.length - 1]?.dailyYield || 0,
    avgYield: yieldData.reduce((sum, d) => sum + d.dailyYield, 0) / yieldData.length,
    totalYield: yieldData[yieldData.length - 1]?.cumulativeYield || 0,
    qualityScore: yieldData[yieldData.length - 1]?.qualityScore || 0,
    projectedHarvest: (yieldData[yieldData.length - 1]?.cumulativeYield || 0) * 1.2,
  };

  const COLORS = ['#a06bff', '#2bc48a', '#ff6b6b', '#4ecdc4', '#f7dc6f'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Interactive Yield Analytics</h2>
          <p className="text-gray-400 mt-1">Real-time cultivation metrics and quality tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-purple-600"
            />
            Auto-refresh
          </label>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'hover:bg-gray-800 text-gray-400'
            }`}
            title="Filter Options"
          >
            <Filter className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              title="Download Options"
            >
              <Download className="w-5 h-5" />
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    // Export functionality here
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors rounded-t-lg"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    // Export functionality here
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => {
                    // Export functionality here
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors rounded-b-lg"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
              setYieldData(generateYieldData(days));
            }}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'cycle'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              timeRange === range
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {range === 'cycle' ? 'Full Cycle' : range}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Daily Yield</p>
                <p className="text-2xl font-bold text-white">
                  {currentMetrics.dailyYield.toFixed(2)} g/day
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last week
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Quality Score</p>
                <p className="text-2xl font-bold text-white">
                  {currentMetrics.qualityScore.toFixed(0)}/100
                </p>
                <Progress value={currentMetrics.qualityScore} className="mt-2 h-1" />
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Yield/Plant</p>
                <p className="text-2xl font-bold text-white">
                  {currentMetrics.avgYield.toFixed(2)} g/day
                </p>
                <p className="text-xs text-gray-500 mt-1">30-day average</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Yield</p>
                <p className="text-2xl font-bold text-white">
                  {(currentMetrics.totalYield / 1000).toFixed(1)} kg
                </p>
                <p className="text-xs text-gray-500 mt-1">This cycle</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Projected Harvest</p>
                <p className="text-2xl font-bold text-white">
                  {(currentMetrics.projectedHarvest / 1000).toFixed(1)} kg
                </p>
                <p className="text-xs text-blue-400 mt-1">In 14 days</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="yield" className="space-y-4">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="yield">Yield Trends</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          <TabsTrigger value="strains">Strain Comparison</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="yield" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Daily Yield Progression (g/day/plant)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={yieldData}>
                  <defs>
                    <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a06bff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a06bff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dailyYield"
                    stroke="#a06bff"
                    fillOpacity={1}
                    fill="url(#yieldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Environmental Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={yieldData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="ppfd" stroke="#a06bff" name="PPFD" />
                    <Line type="monotone" dataKey="co2" stroke="#2bc48a" name="CO2" />
                    <Line type="monotone" dataKey="vpd" stroke="#ff6b6b" name="VPD" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Resource Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yieldData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                    <Bar dataKey="waterUsage" fill="#4ecdc4" name="Water (L)" />
                    <Bar dataKey="nutrientEC" fill="#f7dc6f" name="Nutrient EC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quality Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={Object.entries(qualityData.breakdown).map(([key, value]) => ({
                      metric: key.charAt(0).toUpperCase() + key.slice(1),
                      score: value,
                    }))}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                      <Radar name="Quality Score" dataKey="score" stroke="#a06bff" fill="#a06bff" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Overall Quality Score</p>
                    <p className="text-5xl font-bold text-white">{qualityData.overall}</p>
                    <p className="text-sm text-green-400 mt-2">Premium Grade</p>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(qualityData.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400 capitalize">{key}</span>
                          <span className="text-sm text-white">{value}/100</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quality Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={qualityData.trends}>
                  <defs>
                    <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2bc48a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2bc48a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis domain={[70, 100]} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2bc48a"
                    fillOpacity={1}
                    fill="url(#qualityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strains" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Strain Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={strainData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="strain" type="category" stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Legend />
                  <Bar dataKey="yield" fill="#a06bff" name="Yield (g/day)" />
                  <Bar dataKey="qualityScore" fill="#2bc48a" name="Quality Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Cannabinoid Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strainData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="strain" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                    <Bar dataKey="thc" fill="#ff6b6b" name="THC %" />
                    <Bar dataKey="cbd" fill="#4ecdc4" name="CBD %" />
                    <Bar dataKey="terpenes" fill="#f7dc6f" name="Terpenes %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Strain Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={strainData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="yield"
                      label={(entry) => `${entry.strain}: ${entry.yield}g`}
                    >
                      {strainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Environmental Factor Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlations.map((factor) => (
                  <div key={factor.factor} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          factor.impact === 'High' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                        }`}>
                          {factor.factor === 'PPFD' && <Sun className="w-4 h-4 text-yellow-400" />}
                          {factor.factor === 'CO2' && <Activity className="w-4 h-4 text-green-400" />}
                          {factor.factor === 'Temperature' && <Activity className="w-4 h-4 text-orange-400" />}
                          {factor.factor === 'Humidity' && <Droplets className="w-4 h-4 text-blue-400" />}
                          {factor.factor === 'VPD' && <Activity className="w-4 h-4 text-purple-400" />}
                          {factor.factor === 'Nutrients' && <Beaker className="w-4 h-4 text-pink-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{factor.factor}</p>
                          <p className="text-sm text-gray-400">
                            Correlation: {factor.correlation > 0 ? '+' : ''}{(factor.correlation * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <Badge variant={factor.impact === 'High' ? 'destructive' : 'secondary'}>
                        {factor.impact} Impact
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.abs(factor.correlation) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Increase PPFD by 10%</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Could improve yield by 8-12% based on current correlation data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Optimize VPD Range</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Current VPD occasionally exceeds optimal range, affecting transpiration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">CO2 Enrichment Timing</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Adjust CO2 injection to align with peak photosynthesis periods
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filters Panel */}
      {showFilters && (
        <div className="fixed right-4 top-20 w-80 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filter Options</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Time Range</label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'cycle')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="cycle">Full Cycle</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Strain Selection</label>
              <select 
                value={selectedStrain}
                onChange={(e) => setSelectedStrain(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {strainData.map(strain => (
                  <option key={strain.strain} value={strain.strain}>{strain.strain}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Metrics</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600 mr-2" />
                  <span className="text-gray-300">Daily Yield</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600 mr-2" />
                  <span className="text-gray-300">Quality Score</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600 mr-2" />
                  <span className="text-gray-300">Environmental Data</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex gap-2">
              <button 
                onClick={() => {
                  setTimeRange('month');
                  setSelectedStrain('Blue Dream');
                }}
                className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}