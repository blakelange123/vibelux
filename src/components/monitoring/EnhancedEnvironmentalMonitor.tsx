'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Sun,
  Leaf,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

interface EnvironmentalData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  vpd: number;
  co2: number;
  radiation: number; // PPFD
  rtr: number; // RTR value
}

interface RTRAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  zone?: string;
}

export function EnhancedEnvironmentalMonitor() {
  const [currentData, setCurrentData] = useState<EnvironmentalData>({
    timestamp: new Date(),
    temperature: 22.5,
    humidity: 65,
    vpd: 1.2,
    co2: 850,
    radiation: 450,
    rtr: 1.5
  });
  
  const [historicalData, setHistoricalData] = useState<EnvironmentalData[]>([]);
  const [rtrAlerts, setRtrAlerts] = useState<RTRAlert[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'vpd' | 'co2' | 'radiation' | 'rtr'>('rtr');
  const [showRTRZones, setShowRTRZones] = useState(true);

  // Generate mock historical data
  useEffect(() => {
    const generateData = () => {
      const data: EnvironmentalData[] = [];
      const now = new Date();
      
      for (let i = 0; i < 48; i++) { // 48 hours of data
        const timestamp = new Date(now.getTime() - (48 - i) * 60 * 60 * 1000);
        const hour = timestamp.getHours();
        
        // Simulate daily cycles
        const baseTemp = 22 + Math.sin((hour - 6) / 24 * 2 * Math.PI) * 3;
        const radiation = hour >= 6 && hour <= 18 
          ? Math.max(0, 400 + Math.sin((hour - 6) / 12 * Math.PI) * 500)
          : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30;
        
        const temperature = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1;
        const humidity = 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20;
        const rtr = radiation > 0 ? temperature / (radiation / 100) : 0;
        
        // Calculate VPD
        const tempC = temperature;
        const svp = 0.6108 * Math.exp(17.27 * tempC / (tempC + 237.3));
        const vpd = svp * (1 - humidity / 100);
        
        data.push({
          timestamp,
          temperature,
          humidity,
          vpd,
          co2: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
          radiation,
          rtr
        });
      }
      
      setHistoricalData(data);
      setCurrentData(data[data.length - 1]);
    };

    generateData();
    const interval = setInterval(generateData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor RTR and generate alerts
  useEffect(() => {
    if (!currentData) return;
    
    const newAlerts: RTRAlert[] = [];
    
    if (currentData.rtr < 0.8) {
      newAlerts.push({
        id: `rtr-low-${Date.now()}`,
        type: 'critical',
        message: 'RTR critically low - plants may be stressed',
        timestamp: new Date(),
        zone: 'all'
      });
    } else if (currentData.rtr > 2.5) {
      newAlerts.push({
        id: `rtr-high-${Date.now()}`,
        type: 'critical',
        message: 'RTR critically high - risk of plant damage',
        timestamp: new Date(),
        zone: 'all'
      });
    } else if (currentData.rtr < 1.2 || currentData.rtr > 1.8) {
      newAlerts.push({
        id: `rtr-suboptimal-${Date.now()}`,
        type: 'warning',
        message: `RTR outside optimal range (${currentData.rtr.toFixed(2)})`,
        timestamp: new Date(),
        zone: 'all'
      });
    }
    
    setRtrAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
  }, [currentData]);

  // Get RTR zone info
  const getRTRZone = (rtr: number) => {
    if (rtr < 0.8) return { name: 'Critical Low', color: '#dc2626' };
    if (rtr < 1.2) return { name: 'Vegetative', color: '#f59e0b' };
    if (rtr <= 1.8) return { name: 'Optimal', color: '#10b981' };
    if (rtr <= 2.5) return { name: 'Generative', color: '#3b82f6' };
    return { name: 'Critical High', color: '#8b5cf6' };
  };

  const currentZone = getRTRZone(currentData.rtr);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Environmental Monitor with RTR</h1>
            <p className="text-gray-400">Real-time environmental data with Plant Empowerment RTR analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRTRZones(!showRTRZones)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showRTRZones ? 'Hide' : 'Show'} RTR Zones
          </button>
          
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">Temperature</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {currentData.temperature.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Humidity</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {currentData.humidity.toFixed(0)}%
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">VPD</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {currentData.vpd.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">CO₂</span>
          </div>
          <div className="text-2xl font-bold text-gray-300">
            {currentData.co2.toFixed(0)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">PPFD</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {currentData.radiation.toFixed(0)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color: currentZone.color }} />
            <span className="text-sm font-medium">RTR</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: currentZone.color }}>
            {currentData.rtr.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" style={{ color: currentZone.color }} />
            <span className="text-sm font-medium">Balance</span>
          </div>
          <div className="text-sm font-bold" style={{ color: currentZone.color }}>
            {currentZone.name}
          </div>
        </div>
      </div>

      {/* RTR Alerts */}
      {rtrAlerts.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            RTR Alerts
          </h3>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {rtrAlerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.type === 'critical' ? 'bg-red-900/20 border border-red-700' :
                  alert.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-700' :
                  'bg-blue-900/20 border border-blue-700'
                }`}
              >
                {alert.type === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}
                
                <div className="flex-1">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-gray-400">{alert.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Selection */}
      <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4">
        <span className="text-sm font-medium">View Metric:</span>
        <div className="flex gap-2">
          {(['temperature', 'humidity', 'vpd', 'co2', 'radiation', 'rtr'] as const).map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedMetric === metric 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {metric.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {selectedMetric === 'rtr' ? 'RTR Trend Analysis' : `${selectedMetric.toUpperCase()} Trend`}
          </h3>
          
          {selectedMetric === 'rtr' && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Vegetative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Generative</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
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
              
              {/* RTR Reference Lines */}
              {selectedMetric === 'rtr' && showRTRZones && (
                <>
                  <ReferenceLine y={0.8} stroke="#dc2626" strokeDasharray="2 2" strokeOpacity={0.7} />
                  <ReferenceLine y={1.2} stroke="#f59e0b" strokeDasharray="2 2" strokeOpacity={0.7} />
                  <ReferenceLine y={1.8} stroke="#3b82f6" strokeDasharray="2 2" strokeOpacity={0.7} />
                  <ReferenceLine y={2.5} stroke="#8b5cf6" strokeDasharray="2 2" strokeOpacity={0.7} />
                </>
              )}
              
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={
                  selectedMetric === 'temperature' ? '#ef4444' :
                  selectedMetric === 'humidity' ? '#3b82f6' :
                  selectedMetric === 'vpd' ? '#10b981' :
                  selectedMetric === 'co2' ? '#6b7280' :
                  selectedMetric === 'radiation' ? '#f59e0b' :
                  '#10b981'
                }
                fill={
                  selectedMetric === 'temperature' ? '#ef444420' :
                  selectedMetric === 'humidity' ? '#3b82f620' :
                  selectedMetric === 'vpd' ? '#10b98120' :
                  selectedMetric === 'co2' ? '#6b728020' :
                  selectedMetric === 'radiation' ? '#f59e0b20' :
                  '#10b98120'
                }
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Lighting Integration
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Optimize lighting based on current RTR values
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            Open RTR Lighting Control
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Export Data
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Download environmental and RTR data for analysis
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Export RTR Report
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Configure Alerts
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Set up custom RTR thresholds and notifications
          </p>
          <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
            Alert Settings
          </button>
        </div>
      </div>
    </div>
  );
}