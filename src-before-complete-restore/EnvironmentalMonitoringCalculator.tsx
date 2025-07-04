'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Calendar,
  BarChart3,
  Gauge
} from 'lucide-react';

interface EnvironmentalReading {
  timestamp: Date;
  temperature: number; // °C
  humidity: number; // %
  vpd: number; // kPa
  co2: number; // ppm
  lightIntensity: number; // PPFD μmol/m²/s
  airflow: number; // m/s
}

interface MonitoringAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  parameter: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface CropOptimalRanges {
  temperature: { min: number; max: number; optimal: number };
  humidity: { min: number; max: number; optimal: number };
  vpd: { min: number; max: number; optimal: number };
  co2: { min: number; max: number; optimal: number };
  lightIntensity: { min: number; max: number; optimal: number };
}

interface EnvironmentalStats {
  parameter: string;
  current: number;
  min24h: number;
  max24h: number;
  avg24h: number;
  trend: 'rising' | 'falling' | 'stable';
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
}

export function EnvironmentalMonitoringCalculator() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [readings, setReadings] = useState<EnvironmentalReading[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<'leafy' | 'fruiting' | 'herbs' | 'ornamental'>('leafy');
  const [monitoringInterval, setMonitoringInterval] = useState(60); // seconds
  const [showSettings, setShowSettings] = useState(false);
  const [dataRetentionHours, setDataRetentionHours] = useState(24);

  // Crop optimal ranges
  const cropRanges: Record<string, CropOptimalRanges> = {
    leafy: {
      temperature: { min: 18, max: 26, optimal: 22 },
      humidity: { min: 50, max: 75, optimal: 65 },
      vpd: { min: 0.6, max: 1.2, optimal: 0.9 },
      co2: { min: 600, max: 1200, optimal: 800 },
      lightIntensity: { min: 200, max: 600, optimal: 400 }
    },
    fruiting: {
      temperature: { min: 20, max: 30, optimal: 25 },
      humidity: { min: 60, max: 80, optimal: 70 },
      vpd: { min: 0.8, max: 1.4, optimal: 1.1 },
      co2: { min: 800, max: 1500, optimal: 1000 },
      lightIntensity: { min: 400, max: 1000, optimal: 700 }
    },
    herbs: {
      temperature: { min: 19, max: 27, optimal: 23 },
      humidity: { min: 55, max: 70, optimal: 62 },
      vpd: { min: 0.7, max: 1.3, optimal: 1.0 },
      co2: { min: 600, max: 1200, optimal: 900 },
      lightIntensity: { min: 300, max: 700, optimal: 500 }
    },
    ornamental: {
      temperature: { min: 18, max: 25, optimal: 21 },
      humidity: { min: 50, max: 70, optimal: 60 },
      vpd: { min: 0.6, max: 1.1, optimal: 0.8 },
      co2: { min: 400, max: 1000, optimal: 600 },
      lightIntensity: { min: 150, max: 500, optimal: 300 }
    }
  };

  // Current optimal ranges
  const currentRanges = cropRanges[selectedCrop];

  // Simulate sensor readings (in real implementation, this would come from actual sensors)
  const generateSensorReading = (): EnvironmentalReading => {
    const baseTemp = currentRanges.temperature.optimal;
    const baseHumidity = currentRanges.humidity.optimal;
    const baseCO2 = currentRanges.co2.optimal;
    const baseLight = currentRanges.lightIntensity.optimal;
    
    // Add realistic variations
    const temperature = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 6;
    const humidity = Math.max(20, Math.min(95, baseHumidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20));
    
    // Calculate VPD from temperature and humidity
    const saturationPressure = 0.6108 * Math.exp(17.27 * temperature / (temperature + 237.3));
    const actualPressure = saturationPressure * (humidity / 100);
    const vpd = saturationPressure - actualPressure;
    
    const co2 = Math.max(300, Math.min(2000, baseCO2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 400));
    const lightIntensity = Math.max(0, baseLight + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 200);
    const airflow = 0.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8; // 0.2-1.0 m/s
    
    return {
      timestamp: new Date(),
      temperature,
      humidity,
      vpd,
      co2,
      lightIntensity,
      airflow
    };
  };

  // Check for alerts based on readings
  const checkForAlerts = (reading: EnvironmentalReading) => {
    const newAlerts: MonitoringAlert[] = [];
    
    // Temperature alerts
    if (reading.temperature < currentRanges.temperature.min) {
      newAlerts.push({
        id: `temp-low-${Date.now()}`,
        type: 'warning',
        parameter: 'Temperature',
        message: `Temperature too low: ${reading.temperature.toFixed(1)}°C (Min: ${currentRanges.temperature.min}°C)`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (reading.temperature > currentRanges.temperature.max) {
      newAlerts.push({
        id: `temp-high-${Date.now()}`,
        type: 'critical',
        parameter: 'Temperature',
        message: `Temperature too high: ${reading.temperature.toFixed(1)}°C (Max: ${currentRanges.temperature.max}°C)`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    // Humidity alerts
    if (reading.humidity < currentRanges.humidity.min) {
      newAlerts.push({
        id: `humidity-low-${Date.now()}`,
        type: 'warning',
        parameter: 'Humidity',
        message: `Humidity too low: ${reading.humidity.toFixed(1)}% (Min: ${currentRanges.humidity.min}%)`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (reading.humidity > currentRanges.humidity.max) {
      newAlerts.push({
        id: `humidity-high-${Date.now()}`,
        type: 'critical',
        parameter: 'Humidity',
        message: `Humidity too high: ${reading.humidity.toFixed(1)}% (Max: ${currentRanges.humidity.max}%)`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    // VPD alerts
    if (reading.vpd < currentRanges.vpd.min) {
      newAlerts.push({
        id: `vpd-low-${Date.now()}`,
        type: 'info',
        parameter: 'VPD',
        message: `VPD too low: ${reading.vpd.toFixed(2)} kPa - May reduce transpiration`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (reading.vpd > currentRanges.vpd.max) {
      newAlerts.push({
        id: `vpd-high-${Date.now()}`,
        type: 'warning',
        parameter: 'VPD',
        message: `VPD too high: ${reading.vpd.toFixed(2)} kPa - Plants may experience stress`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    // CO2 alerts
    if (reading.co2 < currentRanges.co2.min) {
      newAlerts.push({
        id: `co2-low-${Date.now()}`,
        type: 'warning',
        parameter: 'CO2',
        message: `CO2 too low: ${reading.co2.toFixed(0)} ppm (Min: ${currentRanges.co2.min} ppm)`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    return newAlerts;
  };

  // Calculate environmental statistics
  const calculateStats = (): EnvironmentalStats[] => {
    if (readings.length === 0) return [];
    
    const last24h = readings.filter(r => 
      new Date().getTime() - r.timestamp.getTime() < dataRetentionHours * 60 * 60 * 1000
    );
    
    if (last24h.length === 0) return [];
    
    const latest = readings[readings.length - 1];
    
    const calculateStat = (
      parameter: keyof EnvironmentalReading,
      unit: string,
      ranges: { min: number; max: number; optimal: number }
    ): EnvironmentalStats => {
      const values = last24h.map(r => r[parameter] as number);
      const current = latest[parameter] as number;
      const min24h = Math.min(...values);
      const max24h = Math.max(...values);
      const avg24h = values.reduce((a, b) => a + b, 0) / values.length;
      
      // Calculate trend (last 10 readings vs previous 10)
      const recent = values.slice(-10);
      const previous = values.slice(-20, -10);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const previousAvg = previous.length > 0 ? previous.reduce((a, b) => a + b, 0) / previous.length : recentAvg;
      
      let trend: 'rising' | 'falling' | 'stable';
      const diff = recentAvg - previousAvg;
      if (Math.abs(diff) < (ranges.max - ranges.min) * 0.02) {
        trend = 'stable';
      } else if (diff > 0) {
        trend = 'rising';
      } else {
        trend = 'falling';
      }
      
      // Determine status
      let status: 'optimal' | 'warning' | 'critical';
      if (current >= ranges.min && current <= ranges.max) {
        status = 'optimal';
      } else if (current < ranges.min * 0.8 || current > ranges.max * 1.2) {
        status = 'critical';
      } else {
        status = 'warning';
      }
      
      return {
        parameter: parameter.toString(),
        current,
        min24h,
        max24h,
        avg24h,
        trend,
        unit,
        status
      };
    };
    
    return [
      calculateStat('temperature', '°C', currentRanges.temperature),
      calculateStat('humidity', '%', currentRanges.humidity),
      calculateStat('vpd', 'kPa', currentRanges.vpd),
      calculateStat('co2', 'ppm', currentRanges.co2),
      calculateStat('lightIntensity', 'μmol/m²/s', currentRanges.lightIntensity),
    ];
  };

  // Start/stop monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        const newReading = generateSensorReading();
        setReadings(prev => {
          const updated = [...prev, newReading];
          // Keep only readings within retention period
          const cutoff = new Date().getTime() - dataRetentionHours * 60 * 60 * 1000;
          return updated.filter(r => r.timestamp.getTime() > cutoff);
        });
        
        // Check for alerts
        const newAlerts = checkForAlerts(newReading);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts].slice(-50)); // Keep last 50 alerts
        }
      }, monitoringInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, monitoringInterval, dataRetentionHours, selectedCrop]);

  const stats = calculateStats();
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const exportData = () => {
    const data = {
      readings: readings.slice(-100), // Last 100 readings
      alerts: alerts.slice(-20), // Last 20 alerts
      settings: { crop: selectedCrop, interval: monitoringInterval },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg shadow-green-500/20 mb-4">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Environmental Monitoring
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Real-time monitoring and analysis of growing conditions
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Monitoring Controls */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Controls
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="leafy">Leafy Greens</option>
                <option value="fruiting">Fruiting Crops</option>
                <option value="herbs">Herbs</option>
                <option value="ornamental">Ornamental</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Monitoring Interval</label>
              <select
                value={monitoringInterval}
                onChange={(e) => setMonitoringInterval(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
              </select>
            </div>
            
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isMonitoring 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setReadings([]);
                  setAlerts([]);
                }}
                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={exportData}
                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center justify-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="lg:col-span-3 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-400" />
              System Status
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-sm text-gray-400">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Readings</p>
              <p className="text-xl font-bold text-white">{readings.length}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Active Alerts</p>
              <p className="text-xl font-bold text-red-400">{activeAlerts.length}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Data Points (24h)</p>
              <p className="text-xl font-bold text-white">
                {readings.filter(r => new Date().getTime() - r.timestamp.getTime() < 24 * 60 * 60 * 1000).length}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Uptime</p>
              <p className="text-xl font-bold text-green-400">
                {isMonitoring ? Math.floor(readings.length * monitoringInterval / 60) : 0}m
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Last Reading</p>
              <p className="text-sm font-medium text-white">
                {readings.length > 0 ? readings[readings.length - 1].timestamp.toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Statistics */}
      {stats.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Environmental Statistics (24h)
          </h3>
          
          <div className="grid lg:grid-cols-5 gap-4">
            {stats.map((stat, idx) => {
              const icon = stat.parameter === 'temperature' ? Thermometer :
                          stat.parameter === 'humidity' ? Droplets :
                          stat.parameter === 'vpd' ? Wind :
                          stat.parameter === 'co2' ? Activity : Sun;
              const IconComponent = icon;
              
              return (
                <div key={idx} className={`rounded-xl p-4 border ${getStatusColor(stat.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{stat.parameter}</span>
                    </div>
                    {getTrendIcon(stat.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs opacity-75">Current</p>
                      <p className="text-xl font-bold">
                        {stat.current.toFixed(stat.parameter === 'vpd' ? 2 : 0)} {stat.unit}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="opacity-75">Min</p>
                        <p className="font-medium">{stat.min24h.toFixed(stat.parameter === 'vpd' ? 2 : 0)}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Avg</p>
                        <p className="font-medium">{stat.avg24h.toFixed(stat.parameter === 'vpd' ? 2 : 0)}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Max</p>
                        <p className="font-medium">{stat.max24h.toFixed(stat.parameter === 'vpd' ? 2 : 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-900/20 backdrop-blur-xl rounded-xl p-6 border border-red-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Active Alerts ({activeAlerts.length})
          </h3>
          
          <div className="space-y-3">
            {activeAlerts.slice(-5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <p className="text-gray-400 text-xs">{alert.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAlerts(prev => 
                    prev.map(a => a.id === alert.id ? {...a, acknowledged: true} : a)
                  )}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-all"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimal Ranges Reference */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Optimal Ranges for {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Crops
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="font-medium text-white">Temperature</span>
            </div>
            <p className="text-gray-400">
              {currentRanges.temperature.min}°C - {currentRanges.temperature.max}°C
            </p>
            <p className="text-green-400 text-xs">Optimal: {currentRanges.temperature.optimal}°C</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-white">Humidity</span>
            </div>
            <p className="text-gray-400">
              {currentRanges.humidity.min}% - {currentRanges.humidity.max}%
            </p>
            <p className="text-green-400 text-xs">Optimal: {currentRanges.humidity.optimal}%</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-white">VPD</span>
            </div>
            <p className="text-gray-400">
              {currentRanges.vpd.min} - {currentRanges.vpd.max} kPa
            </p>
            <p className="text-green-400 text-xs">Optimal: {currentRanges.vpd.optimal} kPa</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">CO2</span>
            </div>
            <p className="text-gray-400">
              {currentRanges.co2.min} - {currentRanges.co2.max} ppm
            </p>
            <p className="text-green-400 text-xs">Optimal: {currentRanges.co2.optimal} ppm</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-white">Light</span>
            </div>
            <p className="text-gray-400">
              {currentRanges.lightIntensity.min} - {currentRanges.lightIntensity.max} PPFD
            </p>
            <p className="text-green-400 text-xs">Optimal: {currentRanges.lightIntensity.optimal} PPFD</p>
          </div>
        </div>
      </div>
    </div>
  );
}