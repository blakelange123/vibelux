'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
  Power,
  Settings,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
  Bell,
  X
} from 'lucide-react';

interface RealtimeMonitoringDashboardProps {
  projectId: string;
  roomId?: string;
}

export function RealtimeMonitoringDashboard({ projectId, roomId }: RealtimeMonitoringDashboardProps) {
  // Memoize the alert callback to prevent recreating on every render
  const handleAlert = useCallback((alert: any) => {
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Environment Alert', {
        body: alert.message,
        icon: '/icon-192.png'
      });
    }
  }, []);

  // Memoize the options object to prevent recreation on every render
  const realtimeOptions = useMemo(() => ({
    projectId,
    roomId,
    autoReconnect: true,
    onAlert: handleAlert
  }), [projectId, roomId, handleAlert]);

  const {
    connected,
    readings,
    aggregates,
    alerts,
    sendControl
  } = useRealtimeData(realtimeOptions);

  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [showAlerts, setShowAlerts] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Process readings for charts
  const chartData = readings
    .filter(r => r.type === selectedMetric)
    .map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString(),
      value: r.value,
      timestamp: r.timestamp.getTime()
    }))
    .slice(-50); // Last 50 readings

  // Calculate VPD if we have temp and humidity
  const calculateVPD = () => {
    if (!aggregates?.temperature || !aggregates?.humidity) return null;
    
    const temp = aggregates.temperature.current;
    const rh = aggregates.humidity.current;
    
    // Tetens equation
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const vpd = svp * (1 - rh / 100);
    
    return Math.round(vpd * 100) / 100;
  };

  const vpd = calculateVPD();

  const metricConfigs = {
    temperature: {
      label: 'Temperature',
      unit: '°F',
      icon: Thermometer,
      color: '#ef4444',
      optimal: { min: 68, max: 78 }
    },
    humidity: {
      label: 'Humidity',
      unit: '%',
      icon: Droplets,
      color: '#3b82f6',
      optimal: { min: 45, max: 65 }
    },
    co2: {
      label: 'CO₂',
      unit: 'ppm',
      icon: Wind,
      color: '#10b981',
      optimal: { min: 600, max: 1200 }
    },
    ppfd: {
      label: 'Light (PPFD)',
      unit: 'μmol',
      icon: Sun,
      color: '#f59e0b',
      optimal: { min: 400, max: 800 }
    }
  };

  const renderMetricCard = (type: string) => {
    const config = metricConfigs[type as keyof typeof metricConfigs];
    const data = aggregates?.[type];
    if (!data) return null;

    const Icon = config.icon;
    const isOptimal = data.current >= config.optimal.min && data.current <= config.optimal.max;

    return (
      <div
        key={type}
        onClick={() => setSelectedMetric(type)}
        className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
          selectedMetric === type ? 'ring-2 ring-purple-500' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">{config.label}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isOptimal ? 'bg-green-500' : 'bg-yellow-500'}`} />
        </div>
        
        <div className="text-2xl font-bold text-white">
          {data.current.toFixed(1)} {config.unit}
        </div>
        
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Min</span>
            <p className="text-gray-300">{data.min.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-gray-500">Avg</span>
            <p className="text-gray-300">{data.avg.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-gray-500">Max</span>
            <p className="text-gray-300">{data.max.toFixed(1)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Real-time Environmental Monitoring
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {roomId ? `Room: ${roomId}` : 'All Rooms'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {(['1h', '6h', '24h', '7d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts ({alerts.length})
            </h3>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {alerts.slice(-3).map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{alert.message}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(metricConfigs).map(type => renderMetricCard(type))}
      </div>

      {/* VPD Card */}
      {vpd !== null && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-400" />
                Vapor Pressure Deficit (VPD)
              </h3>
              <p className="text-sm text-gray-400">
                Calculated from temperature and humidity
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{vpd} kPa</div>
              <div className={`text-sm ${
                vpd >= 0.8 && vpd <= 1.2 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {vpd >= 0.8 && vpd <= 1.2 ? 'Optimal' : 'Sub-optimal'}
              </div>
            </div>
          </div>
          
          {/* VPD Scale */}
          <div className="relative h-8 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-lg">
            <div 
              className="absolute top-0 w-1 h-full bg-white"
              style={{ left: `${Math.min(100, Math.max(0, (vpd / 2) * 100))}%` }}
            />
            <div className="absolute -bottom-6 left-0 text-xs text-gray-400">0</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">1.0</div>
            <div className="absolute -bottom-6 right-0 text-xs text-gray-400">2.0</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {metricConfigs[selectedMetric as keyof typeof metricConfigs]?.label} Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={metricConfigs[selectedMetric as keyof typeof metricConfigs]?.color}
                fill={metricConfigs[selectedMetric as keyof typeof metricConfigs]?.color}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Environmental Controls
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => sendControl('hvac_main', 'setTemperature', 75)}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Thermometer className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-sm text-white">Set Temp 75°F</p>
          </button>
          
          <button
            onClick={() => sendControl('hvac_main', 'setHumidity', 55)}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Droplets className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-sm text-white">Set RH 55%</p>
          </button>
          
          <button
            onClick={() => sendControl('co2_controller', 'setTarget', 800)}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Wind className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm text-white">Set CO₂ 800ppm</p>
          </button>
          
          <button
            onClick={() => sendControl('light_veg_1', 'setIntensity', 80)}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Sun className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-sm text-white">Light 80%</p>
          </button>
        </div>
      </div>
    </div>
  );
}