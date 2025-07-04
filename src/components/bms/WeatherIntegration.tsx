'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Compass,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Calendar,
  Clock,
  MapPin,
  Sunrise,
  Sunset,
  CloudFog,
  Waves,
  Zap,
  CloudDrizzle,
  Moon,
  Star,
  Navigation,
  Map,
  BarChart3,
  RefreshCw,
  Settings,
  Download,
  ChevronRight,
  Info,
  Bell,
  Shield
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine
} from 'recharts';

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    cloudCover: number;
    visibility: number;
    uvIndex: number;
    dewPoint: number;
    condition: string;
    icon: React.ElementType;
  };
  forecast: Array<{
    time: string;
    temp: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  }>;
  alerts: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    timeFrame: string;
  }>;
}

interface ClimateStrategy {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  active: boolean;
  priority: number;
}

export function WeatherIntegration() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [autoAdapt, setAutoAdapt] = useState(true);
  const [location] = useState({ name: 'Denver, CO', lat: 39.7392, lon: -104.9903 });

  const [weatherData] = useState<WeatherData>({
    current: {
      temp: 22.5,
      humidity: 45,
      pressure: 1013,
      windSpeed: 12,
      windDirection: 225,
      cloudCover: 35,
      visibility: 10,
      uvIndex: 6,
      dewPoint: 10.2,
      condition: 'Partly Cloudy',
      icon: Cloud
    },
    forecast: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      temp: 20 + Math.sin(i * 0.26) * 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      humidity: 45 + Math.cos(i * 0.26) * 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      precipitation: i > 14 && i < 18 ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 : 0,
      windSpeed: 10 + Math.sin(i * 0.15) * 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
      condition: i > 14 && i < 18 ? 'Rainy' : 'Partly Cloudy'
    })),
    alerts: [
      {
        severity: 'medium',
        type: 'Temperature Drop',
        message: 'Temperature expected to drop 8°C in next 6 hours',
        timeFrame: '6 hours'
      },
      {
        severity: 'low',
        type: 'Wind Advisory',
        message: 'Wind gusts up to 45 km/h expected this afternoon',
        timeFrame: '12 hours'
      }
    ]
  });

  const [climateStrategies] = useState<ClimateStrategy[]>([
    {
      id: 'cs-1',
      name: 'Cold Front Response',
      trigger: 'Temp drop > 5°C in 3 hours',
      actions: ['Increase heating setpoint', 'Close vents', 'Activate thermal screens'],
      active: true,
      priority: 1
    },
    {
      id: 'cs-2',
      name: 'High Solar Radiation',
      trigger: 'Solar > 800 W/m² & Temp > 28°C',
      actions: ['Deploy shade screens', 'Increase ventilation', 'Activate cooling'],
      active: true,
      priority: 2
    },
    {
      id: 'cs-3',
      name: 'Storm Protection',
      trigger: 'Wind speed > 50 km/h',
      actions: ['Close all vents', 'Secure screens', 'Emergency heating standby'],
      active: true,
      priority: 1
    },
    {
      id: 'cs-4',
      name: 'Frost Prevention',
      trigger: 'Outside temp < 2°C',
      actions: ['Min pipe temp 40°C', 'Energy screens closed', 'Dehumidification active'],
      active: true,
      priority: 1
    }
  ]);

  // Simulated greenhouse impact calculation
  const calculateGreenhouseImpact = () => {
    const outside = weatherData.current.temp;
    const target = 24;
    const energyNeeded = Math.abs(target - outside) * 2.5; // Simplified calculation
    
    return {
      heatingDemand: outside < target ? energyNeeded : 0,
      coolingDemand: outside > target ? energyNeeded : 0,
      ventilationRate: Math.min(100, weatherData.current.windSpeed * 5),
      screenPosition: weatherData.current.uvIndex > 7 ? 80 : 0
    };
  };

  const impact = calculateGreenhouseImpact();

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return Sun;
      case 'partly cloudy': return Cloud;
      case 'cloudy': return Cloud;
      case 'rainy': return CloudRain;
      case 'stormy': return CloudLightning;
      case 'snowy': return CloudSnow;
      case 'foggy': return CloudFog;
      default: return Cloud;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  // Radar chart data for environmental conditions
  const radarData = [
    { subject: 'Temperature', current: 75, optimal: 85 },
    { subject: 'Humidity', current: 45, optimal: 65 },
    { subject: 'Light', current: 60, optimal: 80 },
    { subject: 'CO2', current: 85, optimal: 90 },
    { subject: 'Air Flow', current: 70, optimal: 75 },
    { subject: 'Energy', current: 55, optimal: 70 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-500" />
              Weather-Adaptive Control System
            </h2>
            <p className="text-gray-400 mt-1">
              Real-time weather integration with predictive climate control
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-white">{location.name}</span>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Auto-Adapt</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdapt}
                  onChange={(e) => setAutoAdapt(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </label>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Weather Overview */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Current Conditions</p>
                <p className="text-3xl font-bold text-white">{weatherData.current.temp}°C</p>
                <p className="text-gray-400">{weatherData.current.condition}</p>
              </div>
              <Cloud className="w-16 h-16 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Humidity:</span>
                <span className="text-white">{weatherData.current.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Wind:</span>
                <span className="text-white">{weatherData.current.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Pressure:</span>
                <span className="text-white">{weatherData.current.pressure} hPa</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Visibility:</span>
                <span className="text-white">{weatherData.current.visibility} km</span>
              </div>
            </div>
          </div>

          {/* Greenhouse Impact */}
          <div className="col-span-3 bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Greenhouse Impact Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Heating Demand</span>
                    <span className="text-white font-medium">{impact.heatingDemand.toFixed(1)} kW</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, impact.heatingDemand * 2)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Cooling Demand</span>
                    <span className="text-white font-medium">{impact.coolingDemand.toFixed(1)} kW</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, impact.coolingDemand * 2)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Ventilation Rate</span>
                    <span className="text-white font-medium">{impact.ventilationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${impact.ventilationRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Screen Position</span>
                    <span className="text-white font-medium">{impact.screenPosition}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${impact.screenPosition}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Weather Alerts
          </h3>
          <div className="space-y-3">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-start gap-3">
                <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{alert.type}</p>
                  <p className="text-gray-400 text-sm">{alert.message}</p>
                  <p className="text-gray-500 text-xs mt-1">Expected in: {alert.timeFrame}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Forecast & Adaptive Strategies */}
      <div className="grid grid-cols-2 gap-6">
        {/* 24-Hour Forecast */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">24-Hour Forecast</h3>
            <div className="flex items-center gap-2">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
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
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weatherData.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.3}
                name="Temperature (°C)"
              />
              <Area 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.2}
                name="Humidity (%)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Precipitation Forecast */}
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">Precipitation Probability</p>
            <div className="flex items-center gap-1">
              {weatherData.forecast.map((hour, index) => (
                <div
                  key={index}
                  className="flex-1 h-8 bg-gray-800 rounded relative group"
                  title={`${hour.time}: ${hour.precipitation.toFixed(1)}mm`}
                >
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 rounded transition-all"
                    style={{ height: `${hour.precipitation * 10}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Climate Strategies */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Active Climate Strategies
          </h3>
          <div className="space-y-3">
            {climateStrategies.map((strategy) => (
              <div key={strategy.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${strategy.active ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-white font-medium">{strategy.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs">Priority: {strategy.priority}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">Trigger: {strategy.trigger}</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.actions.map((action, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environmental Optimization */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Environmental Optimization</h3>
        <div className="grid grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Radar name="Optimal" dataKey="optimal" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Optimization Recommendations</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white text-sm">Increase humidity by 15-20%</p>
                    <p className="text-gray-400 text-xs">Current deficit may impact transpiration</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white text-sm">Optimize energy usage during peak hours</p>
                    <p className="text-gray-400 text-xs">Shift cooling to early morning</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white text-sm">Light levels optimal for current growth stage</p>
                    <p className="text-gray-400 text-xs">Maintain current DLI target</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Energy Savings Potential</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Weather-based optimization</span>
                  <span className="text-green-400 font-medium">-18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Predictive control</span>
                  <span className="text-green-400 font-medium">-12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Natural ventilation</span>
                  <span className="text-green-400 font-medium">-8%</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Total Potential Savings</span>
                    <span className="text-green-400 font-bold text-lg">38%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}