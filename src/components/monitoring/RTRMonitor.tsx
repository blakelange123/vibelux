'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Thermometer,
  Sun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Settings,
  Info,
  Calendar,
  Clock,
  Target,
  Zap,
  Leaf,
  Database,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Gauge
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';

interface EnvironmentalReading {
  timestamp: Date;
  temperature: number; // °C
  humidity: number; // %
  radiation: number; // μmol/m²/s (PPFD)
  co2: number; // ppm
  vpd: number; // kPa
}

interface RTRData {
  timestamp: Date;
  temperature: number;
  radiation: number;
  rtr: number;
  plantBalance: 'optimal' | 'generative' | 'vegetative' | 'critical';
  dailyAvgTemp: number;
  dailyLightIntegral: number;
}

interface RTRZone {
  name: string;
  color: string;
  minRTR: number;
  maxRTR: number;
  description: string;
  recommendations: string[];
}

// Plant Empowerment RTR zones based on scientific literature
const RTR_ZONES: RTRZone[] = [
  {
    name: 'Critical Low',
    color: '#dc2626',
    minRTR: 0,
    maxRTR: 0.8,
    description: 'Severely limiting plant growth',
    recommendations: [
      'Increase temperature gradually',
      'Check heating systems',
      'Consider supplemental lighting'
    ]
  },
  {
    name: 'Vegetative',
    color: '#f59e0b',
    minRTR: 0.8,
    maxRTR: 1.2,
    description: 'Promotes vegetative growth',
    recommendations: [
      'Good for young plants',
      'Leaf development focus',
      'Monitor fruit set'
    ]
  },
  {
    name: 'Optimal Balance',
    color: '#10b981',
    minRTR: 1.2,
    maxRTR: 1.8,
    description: 'Ideal plant balance for most crops',
    recommendations: [
      'Maintain current conditions',
      'Balanced growth and fruiting',
      'Monitor plant response'
    ]
  },
  {
    name: 'Generative',
    color: '#3b82f6',
    minRTR: 1.8,
    maxRTR: 2.5,
    description: 'Promotes flowering and fruiting',
    recommendations: [
      'Good for fruit development',
      'Higher production phase',
      'Watch for plant stress'
    ]
  },
  {
    name: 'Critical High',
    color: '#8b5cf6',
    minRTR: 2.5,
    maxRTR: 5.0,
    description: 'Risk of plant stress',
    recommendations: [
      'Reduce temperature',
      'Increase humidity',
      'Check cooling systems'
    ]
  }
];

export function RTRMonitor() {
  const [historicalData, setHistoricalData] = useState<RTRData[]>([]);
  const [currentRTR, setCurrentRTR] = useState<RTRData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [selectedCrop, setSelectedCrop] = useState<'tomato' | 'lettuce' | 'cucumber' | 'pepper' | 'cannabis'>('tomato');
  const [showOptimalZones, setShowOptimalZones] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simulate real-time environmental data
  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      const data: RTRData[] = [];
      
      for (let i = 0; i < 168; i++) { // 7 days of hourly data
        const timestamp = new Date(now.getTime() - (168 - i) * 60 * 60 * 1000);
        const hour = timestamp.getHours();
        
        // Simulate daily temperature and light patterns
        const baseTemp = 22 + Math.sin((hour - 6) / 24 * 2 * Math.PI) * 4; // 18-26°C daily cycle
        const radiation = hour >= 6 && hour <= 18 
          ? Math.max(0, 400 + Math.sin((hour - 6) / 12 * Math.PI) * 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100)
          : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50; // Night time low light
        
        const temperature = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2;
        
        // Calculate RTR based on Plant Empowerment methodology
        const rtr = radiation > 0 ? temperature / (radiation / 100) : 0;
        
        // Calculate daily averages (simplified)
        const dailyAvgTemp = baseTemp;
        const dailyLightIntegral = 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10; // mol/m²/day
        
        // Determine plant balance based on RTR
        let plantBalance: RTRData['plantBalance'] = 'optimal';
        if (rtr < 0.8 || rtr > 2.5) plantBalance = 'critical';
        else if (rtr < 1.2) plantBalance = 'vegetative';
        else if (rtr > 1.8) plantBalance = 'generative';
        
        data.push({
          timestamp,
          temperature,
          radiation,
          rtr,
          plantBalance,
          dailyAvgTemp,
          dailyLightIntegral
        });
      }
      
      setHistoricalData(data);
      setCurrentRTR(data[data.length - 1]);
    };

    generateMockData();
    
    if (isLive) {
      const interval = setInterval(generateMockData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const hoursBack = {
      '24h': 24,
      '7d': 168,
      '30d': 720,
      '90d': 2160
    }[selectedTimeRange];
    
    const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    return historicalData.filter(d => d.timestamp >= cutoff);
  }, [historicalData, selectedTimeRange]);

  // Get current RTR zone
  const currentZone = useMemo(() => {
    if (!currentRTR) return null;
    return RTR_ZONES.find(zone => 
      currentRTR.rtr >= zone.minRTR && currentRTR.rtr < zone.maxRTR
    ) || RTR_ZONES[RTR_ZONES.length - 1];
  }, [currentRTR]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const rtrs = filteredData.map(d => d.rtr).filter(r => r > 0);
    const avgRTR = rtrs.reduce((sum, r) => sum + r, 0) / rtrs.length;
    const minRTR = Math.min(...rtrs);
    const maxRTR = Math.max(...rtrs);
    
    const optimalHours = filteredData.filter(d => 
      d.rtr >= 1.2 && d.rtr <= 1.8
    ).length;
    const optimalPercentage = (optimalHours / filteredData.length) * 100;
    
    return {
      avgRTR: avgRTR.toFixed(2),
      minRTR: minRTR.toFixed(2),
      maxRTR: maxRTR.toFixed(2),
      optimalPercentage: optimalPercentage.toFixed(1)
    };
  }, [filteredData]);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RTR Monitor</h1>
              <p className="text-gray-400">Radiation Temperature Ratio - Plant Empowerment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-8">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300">{isLive ? 'Live' : 'Paused'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isLive ? <RefreshCw className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current RTR Status */}
      {currentRTR && currentZone && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current RTR Status</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium`} style={{ backgroundColor: currentZone.color + '20', color: currentZone.color }}>
                {currentZone.name}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: currentZone.color }}>
                  {currentRTR.rtr.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">RTR Value</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {currentRTR.temperature.toFixed(1)}°C
                </div>
                <div className="text-sm text-gray-400">Temperature</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {currentRTR.radiation.toFixed(0)}
                </div>
                <div className="text-sm text-gray-400">PPFD (μmol/m²/s)</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  currentRTR.plantBalance === 'optimal' ? 'text-green-400' :
                  currentRTR.plantBalance === 'critical' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {currentRTR.plantBalance.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400">Plant Balance</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="col-span-1 md:col-span-2 bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Period Statistics ({selectedTimeRange})</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.avgRTR}</div>
                  <div className="text-sm text-gray-400">Average RTR</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-blue-400">{stats.optimalPercentage}%</div>
                  <div className="text-sm text-gray-400">Time in Optimal Zone</div>
                </div>
                
                <div>
                  <div className="text-xl font-semibold text-gray-300">{stats.minRTR} - {stats.maxRTR}</div>
                  <div className="text-sm text-gray-400">RTR Range</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    {currentRTR.plantBalance === 'optimal' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="text-sm text-gray-300">
                      {currentRTR.plantBalance === 'optimal' ? 'Balanced' : 'Needs Attention'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">Current Status</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Time Range:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="tomato">Tomato</option>
              <option value="lettuce">Lettuce</option>
              <option value="cucumber">Cucumber</option>
              <option value="pepper">Pepper</option>
              <option value="cannabis">Cannabis</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOptimalZones}
              onChange={(e) => setShowOptimalZones(e.target.checked)}
              className="rounded border-gray-600"
            />
            Show Optimal Zones
          </label>
        </div>
      </div>

      {/* RTR Chart */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">RTR Trend Analysis</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Info className="w-4 h-4" />
            <span>RTR = Temperature (°C) / (Radiation (μmol/m²/s) / 100)</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                stroke="#9ca3af"
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Legend />
              
              {/* RTR Zones */}
              {showOptimalZones && RTR_ZONES.map(zone => (
                <ReferenceLine 
                  key={zone.name}
                  y={zone.minRTR} 
                  stroke={zone.color} 
                  strokeDasharray="2 2" 
                  strokeOpacity={0.5}
                />
              ))}
              
              <Area
                type="monotone"
                dataKey="rtr"
                stroke="#10b981"
                fill="#10b98120"
                strokeWidth={2}
                name="RTR Value"
              />
              
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={1}
                yAxisId="right"
                name="Temperature (°C)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RTR Zones Reference */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Plant Empowerment RTR Zones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {RTR_ZONES.map(zone => (
            <div key={zone.name} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-medium">{zone.name}</span>
              </div>
              
              <div className="text-sm text-gray-300 mb-2">
                RTR: {zone.minRTR} - {zone.maxRTR}
              </div>
              
              <div className="text-xs text-gray-400 mb-3">
                {zone.description}
              </div>
              
              <div className="space-y-1">
                {zone.recommendations.map((rec, idx) => (
                  <div key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                    <span className="text-green-400">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analysis (if enabled) */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature vs Radiation Scatter Plot */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Temperature vs Radiation Correlation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={filteredData.filter(d => d.radiation > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="radiation" 
                    name="Radiation" 
                    unit=" μmol/m²/s"
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    dataKey="temperature" 
                    name="Temperature" 
                    unit="°C"
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Scatter 
                    name="Data Points" 
                    dataKey="temperature" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Light Integral */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Light Integral Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData.filter((_, idx) => idx % 24 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke="#9ca3af"
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dailyLightIntegral"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="DLI (mol/m²/day)"
                  />
                  <ReferenceLine y={15} stroke="#10b981" strokeDasharray="2 2" label="Target DLI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}