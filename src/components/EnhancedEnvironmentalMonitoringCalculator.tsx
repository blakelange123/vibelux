'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Gauge,
  Wifi,
  WifiOff,
  Database,
  Server,
  Shield,
  LineChart,
  Bell,
  Mail,
  Smartphone,
  CheckCircle,
  XCircle,
  Info,
  Cpu,
  HardDrive,
  Zap,
  Cloud
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorDevice {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'multi';
  manufacturer: string;
  model: string;
  protocol: 'modbus' | 'mqtt' | 'http' | 'bacnet' | 'serial';
  address: string;
  status: 'online' | 'offline' | 'error';
  lastReading?: Date;
  calibration?: {
    offset: number;
    scale: number;
    lastCalibrated: Date;
  };
}

interface EnvironmentalReading {
  timestamp: Date;
  sensorId: string;
  temperature?: number;
  humidity?: number;
  vpd?: number;
  co2?: number;
  lightIntensity?: number;
  ph?: number;
  ec?: number;
  airflow?: number;
  leafTemperature?: number;
  soilMoisture?: number;
  waterTemperature?: number;
  dissolvedOxygen?: number;
}

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  parameter: string;
  condition: 'above' | 'below' | 'outside' | 'rate-change';
  threshold: number | { min: number; max: number };
  duration: number; // minutes
  severity: 'info' | 'warning' | 'critical';
  actions: {
    notification: boolean;
    email: boolean;
    sms: boolean;
    webhook?: string;
    controlAction?: string;
  };
}

interface DataAnalytics {
  correlations: {
    parameters: [string, string];
    coefficient: number;
    significance: number;
  }[];
  patterns: {
    parameter: string;
    type: 'daily' | 'weekly' | 'anomaly';
    description: string;
    confidence: number;
  }[];
  predictions: {
    parameter: string;
    nextHour: number;
    next24Hours: number[];
    confidence: number;
  }[];
  recommendations: {
    category: string;
    priority: 'low' | 'medium' | 'high';
    action: string;
    expectedImprovement: string;
  }[];
}

interface IntegrationSettings {
  cloudStorage: {
    enabled: boolean;
    provider: 'aws' | 'azure' | 'google' | 'local';
    endpoint?: string;
    credentials?: { key: string; secret: string };
  };
  apiEndpoints: {
    enabled: boolean;
    endpoints: {
      realtime: string;
      historical: string;
      alerts: string;
    };
    authentication: 'none' | 'apikey' | 'oauth';
  };
  automation: {
    enabled: boolean;
    rules: {
      id: string;
      trigger: string;
      condition: string;
      action: string;
      device: string;
    }[];
  };
}

const SENSOR_PRESETS: SensorDevice[] = [
  {
    id: 'teros-12',
    name: 'TEROS 12',
    type: 'multi',
    manufacturer: 'METER Group',
    model: 'TEROS 12',
    protocol: 'modbus',
    address: '192.168.1.100:502',
    status: 'offline'
  },
  {
    id: 'scd-30',
    name: 'SCD30 CO2 Sensor',
    type: 'co2',
    manufacturer: 'Sensirion',
    model: 'SCD30',
    protocol: 'serial',
    address: '/dev/ttyUSB0',
    status: 'offline'
  },
  {
    id: 'am2320',
    name: 'AM2320 Temp/Humidity',
    type: 'humidity',
    manufacturer: 'ASAIR',
    model: 'AM2320',
    protocol: 'mqtt',
    address: 'mqtt://broker.local:1883/sensors/am2320',
    status: 'offline'
  }
];

export function EnhancedEnvironmentalMonitoringCalculator() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sensors, setSensors] = useState<SensorDevice[]>(SENSOR_PRESETS);
  const [readings, setReadings] = useState<EnvironmentalReading[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'temp-high',
      name: 'High Temperature Alert',
      enabled: true,
      parameter: 'temperature',
      condition: 'above',
      threshold: 30,
      duration: 5,
      severity: 'critical',
      actions: {
        notification: true,
        email: true,
        sms: false,
        controlAction: 'increase-cooling'
      }
    },
    {
      id: 'vpd-range',
      name: 'VPD Out of Range',
      enabled: true,
      parameter: 'vpd',
      condition: 'outside',
      threshold: { min: 0.8, max: 1.2 },
      duration: 10,
      severity: 'warning',
      actions: {
        notification: true,
        email: false,
        sms: false
      }
    }
  ]);
  
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<DataAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    cloudStorage: {
      enabled: false,
      provider: 'local'
    },
    apiEndpoints: {
      enabled: false,
      endpoints: {
        realtime: '/api/monitoring/realtime',
        historical: '/api/monitoring/historical',
        alerts: '/api/monitoring/alerts'
      },
      authentication: 'apikey'
    },
    automation: {
      enabled: false,
      rules: []
    }
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const chartRef = useRef<any>(null);

  // Simulate sensor readings with more realistic patterns
  const generateSensorReading = (sensor: SensorDevice): EnvironmentalReading => {
    const hour = new Date().getHours();
    const dayProgress = hour / 24;
    
    // Base values with diurnal patterns
    const tempBase = 22 + Math.sin(dayProgress * Math.PI * 2 - Math.PI/2) * 3;
    const humidityBase = 65 - Math.sin(dayProgress * Math.PI * 2) * 10;
    const co2Base = 800 + Math.sin(dayProgress * Math.PI * 2 + Math.PI) * 200;
    const lightBase = hour >= 6 && hour <= 18 ? 
      400 * Math.sin((hour - 6) / 12 * Math.PI) : 0;
    
    // Add noise and sensor-specific variations
    const reading: EnvironmentalReading = {
      timestamp: new Date(),
      sensorId: sensor.id
    };
    
    if (sensor.type === 'temperature' || sensor.type === 'multi') {
      reading.temperature = tempBase + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2;
      reading.leafTemperature = reading.temperature - 1 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5);
    }
    
    if (sensor.type === 'humidity' || sensor.type === 'multi') {
      reading.humidity = Math.max(30, Math.min(90, humidityBase + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5));
      
      // Calculate VPD
      if (reading.temperature && reading.humidity) {
        const svp = 0.6108 * Math.exp(17.27 * reading.temperature / (reading.temperature + 237.3));
        const avp = svp * (reading.humidity / 100);
        reading.vpd = svp - avp;
      }
    }
    
    if (sensor.type === 'co2' || sensor.type === 'multi') {
      reading.co2 = Math.max(400, co2Base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50);
    }
    
    if (sensor.type === 'light' || sensor.type === 'multi') {
      reading.lightIntensity = Math.max(0, lightBase + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50);
    }
    
    if (sensor.type === 'multi') {
      reading.ph = 6.5 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5;
      reading.ec = 1.8 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.3;
      reading.soilMoisture = 65 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10;
      reading.waterTemperature = tempBase - 2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5);
      reading.dissolvedOxygen = 7 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1;
    }
    
    reading.airflow = 0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5;
    
    return reading;
  };

  // Analyze data for patterns and correlations
  const analyzeData = () => {
    if (readings.length < 100) return;
    
    const newAnalytics: DataAnalytics = {
      correlations: [],
      patterns: [],
      predictions: [],
      recommendations: []
    };
    
    // Simple correlation analysis
    const parameters = ['temperature', 'humidity', 'vpd', 'co2'];
    for (let i = 0; i < parameters.length; i++) {
      for (let j = i + 1; j < parameters.length; j++) {
        const correlation = calculateCorrelation(
          readings.map(r => r[parameters[i] as keyof EnvironmentalReading] as number || 0),
          readings.map(r => r[parameters[j] as keyof EnvironmentalReading] as number || 0)
        );
        newAnalytics.correlations.push({
          parameters: [parameters[i], parameters[j]],
          coefficient: correlation,
          significance: Math.abs(correlation) > 0.7 ? 0.99 : Math.abs(correlation) > 0.5 ? 0.95 : 0.8
        });
      }
    }
    
    // Pattern detection
    const last24h = readings.filter(r => 
      new Date().getTime() - r.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    if (last24h.length > 0) {
      // Check for daily patterns
      const tempByHour = Array(24).fill(null).map(() => [] as number[]);
      last24h.forEach(r => {
        if (r.temperature) {
          const hour = r.timestamp.getHours();
          tempByHour[hour].push(r.temperature);
        }
      });
      
      const avgTempByHour = tempByHour.map(temps => 
        temps.length > 0 ? temps.reduce((a, b) => a + b) / temps.length : null
      );
      
      const tempVariation = Math.max(...avgTempByHour.filter(t => t !== null) as number[]) - 
                           Math.min(...avgTempByHour.filter(t => t !== null) as number[]);
      
      if (tempVariation > 3) {
        newAnalytics.patterns.push({
          parameter: 'temperature',
          type: 'daily',
          description: `Daily temperature variation of ${tempVariation.toFixed(1)}°C detected`,
          confidence: 0.85
        });
      }
    }
    
    // Simple predictions (linear extrapolation)
    parameters.forEach(param => {
      const recent = readings.slice(-10)
        .map(r => r[param as keyof EnvironmentalReading] as number)
        .filter(v => v !== undefined);
      
      if (recent.length >= 5) {
        const trend = (recent[recent.length - 1] - recent[0]) / recent.length;
        const nextHour = recent[recent.length - 1] + trend * 6; // 6 data points per hour
        
        newAnalytics.predictions.push({
          parameter: param,
          nextHour,
          next24Hours: Array(24).fill(0).map((_, i) => nextHour + trend * i * 6),
          confidence: 0.7
        });
      }
    });
    
    // Generate recommendations
    const latestReading = readings[readings.length - 1];
    if (latestReading) {
      if (latestReading.vpd && (latestReading.vpd < 0.6 || latestReading.vpd > 1.4)) {
        newAnalytics.recommendations.push({
          category: 'Climate Control',
          priority: 'high',
          action: latestReading.vpd < 0.6 ? 
            'Increase temperature or decrease humidity to raise VPD' :
            'Decrease temperature or increase humidity to lower VPD',
          expectedImprovement: 'Optimize transpiration rate by 15-20%'
        });
      }
      
      if (latestReading.co2 && latestReading.co2 < 600) {
        newAnalytics.recommendations.push({
          category: 'CO2 Enrichment',
          priority: 'medium',
          action: 'Increase CO2 supplementation to optimal levels',
          expectedImprovement: 'Potential 10-15% increase in photosynthesis'
        });
      }
    }
    
    setAnalytics(newAnalytics);
  };

  // Calculate correlation coefficient
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;
    
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    
    return denomX * denomY > 0 ? numerator / Math.sqrt(denomX * denomY) : 0;
  };

  // Check alert rules
  const checkAlerts = (reading: EnvironmentalReading) => {
    alertRules.forEach(rule => {
      if (!rule.enabled) return;
      
      const value = reading[rule.parameter as keyof EnvironmentalReading] as number;
      if (value === undefined) return;
      
      let triggered = false;
      
      switch (rule.condition) {
        case 'above':
          triggered = value > (rule.threshold as number);
          break;
        case 'below':
          triggered = value < (rule.threshold as number);
          break;
        case 'outside':
          const range = rule.threshold as { min: number; max: number };
          triggered = value < range.min || value > range.max;
          break;
      }
      
      if (triggered) {
        const alert = {
          id: `${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          timestamp: new Date(),
          parameter: rule.parameter,
          value,
          severity: rule.severity,
          message: `${rule.name}: ${rule.parameter} is ${value.toFixed(2)}`,
          acknowledged: false
        };
        
        setActiveAlerts(prev => [...prev, alert].slice(-50));
        
        // Trigger actions
        if (rule.actions.notification) {
          // In real implementation, would send push notification
        }
        if (rule.actions.email) {
          // In real implementation, would send email
        }
        if (rule.actions.webhook) {
          // In real implementation, would call webhook
        }
      }
    });
  };

  // Monitor sensors
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        // Update sensor status randomly for demo
        setSensors(prev => prev.map(sensor => ({
          ...sensor,
          status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.1 ? 'online' : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.5 ? 'offline' : 'error',
          lastReading: sensor.status === 'online' ? new Date() : sensor.lastReading
        })));
        
        // Generate readings for online sensors
        sensors.filter(s => s.status === 'online').forEach(sensor => {
          const reading = generateSensorReading(sensor);
          setReadings(prev => [...prev, reading].slice(-1000)); // Keep last 1000 readings
          checkAlerts(reading);
        });
      }, 5000); // Every 5 seconds
      
      // Run analytics every minute
      const analyticsInterval = setInterval(analyzeData, 60000);
      
      return () => {
        clearInterval(interval);
        clearInterval(analyticsInterval);
      };
    }
  }, [isMonitoring, sensors, alertRules]);

  // Prepare chart data
  const getChartData = () => {
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = new Date().getTime() - timeRanges[selectedTimeRange];
    const filteredReadings = readings.filter(r => r.timestamp.getTime() > cutoff);
    
    // Group by time intervals
    const intervalMinutes = selectedTimeRange === '1h' ? 1 : 
                           selectedTimeRange === '6h' ? 5 :
                           selectedTimeRange === '24h' ? 15 :
                           selectedTimeRange === '7d' ? 60 : 240;
    
    const grouped = new Map<string, EnvironmentalReading[]>();
    filteredReadings.forEach(reading => {
      const key = new Date(
        Math.floor(reading.timestamp.getTime() / (intervalMinutes * 60 * 1000)) * 
        intervalMinutes * 60 * 1000
      ).toISOString();
      
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(reading);
    });
    
    const labels: string[] = [];
    const data: number[] = [];
    
    Array.from(grouped.entries()).sort().forEach(([time, readings]) => {
      labels.push(new Date(time).toLocaleTimeString());
      const values = readings.map(r => r[selectedParameter as keyof EnvironmentalReading] as number)
        .filter(v => v !== undefined);
      data.push(values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0);
    });
    
    return {
      labels,
      datasets: [{
        label: selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1),
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const exportData = () => {
    const exportObj = {
      metadata: {
        exportDate: new Date().toISOString(),
        readingCount: readings.length,
        sensors: sensors.map(s => ({ id: s.id, name: s.name, status: s.status })),
        timeRange: selectedTimeRange
      },
      readings: readings.slice(-1000),
      alerts: activeAlerts.slice(-100),
      analytics,
      settings: { alertRules, integrationSettings }
    };
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental-monitoring-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unacknowledgedAlerts = activeAlerts.filter(a => !a.acknowledged);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Eye className="w-6 h-6 text-green-600" />
          Advanced Environmental Monitoring System
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <LineChart className="w-4 h-4" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">System Status</span>
            <Activity className={`w-4 h-4 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-lg font-semibold">{isMonitoring ? 'Active' : 'Stopped'}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Sensors Online</span>
            <Wifi className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-semibold">
            {sensors.filter(s => s.status === 'online').length}/{sensors.length}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Data Points</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-semibold">{readings.length.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Alerts</span>
            <Bell className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-lg font-semibold text-orange-600">{unacknowledgedAlerts.length}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cloud Sync</span>
            <Cloud className={`w-4 h-4 ${integrationSettings.cloudStorage.enabled ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-lg font-semibold">{integrationSettings.cloudStorage.enabled ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">API Status</span>
            <Server className={`w-4 h-4 ${integrationSettings.apiEndpoints.enabled ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-lg font-semibold">{integrationSettings.apiEndpoints.enabled ? 'Active' : 'Inactive'}</p>
        </div>
      </div>

      {/* Sensor Status Grid */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          Sensor Network Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map(sensor => (
            <div key={sensor.id} className={`bg-white rounded-lg p-4 border-2 ${
              sensor.status === 'online' ? 'border-green-300' :
              sensor.status === 'offline' ? 'border-gray-300' :
              'border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">{sensor.name}</h5>
                <div className={`w-3 h-3 rounded-full ${
                  sensor.status === 'online' ? 'bg-green-500 animate-pulse' :
                  sensor.status === 'offline' ? 'bg-gray-400' :
                  'bg-red-500'
                }`} />
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Model: {sensor.manufacturer} {sensor.model}</p>
                <p className="text-gray-600">Protocol: {sensor.protocol.toUpperCase()}</p>
                <p className="text-gray-600">Address: {sensor.address}</p>
                {sensor.lastReading && (
                  <p className="text-gray-500">Last reading: {sensor.lastReading.toLocaleTimeString()}</p>
                )}
              </div>
              {sensor.calibration && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Calibrated: {sensor.calibration.lastCalibrated.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Environmental Trends
          </h4>
          <div className="flex gap-2">
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="vpd">VPD</option>
              <option value="co2">CO2</option>
              <option value="lightIntensity">Light Intensity</option>
              <option value="ph">pH</option>
              <option value="ec">EC</option>
            </select>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        {readings.length > 0 ? (
          <div className="h-64">
            <Line 
              ref={chartRef}
              data={getChartData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available. Start monitoring to see trends.
          </div>
        )}
      </div>

      {/* Active Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Alerts ({unacknowledgedAlerts.length})
          </h4>
          <div className="space-y-3">
            {unacknowledgedAlerts.slice(-5).reverse().map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {alert.timestamp.toLocaleTimeString()} - {alert.parameter}: {alert.value?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAlerts(prev => 
                    prev.map(a => a.id === alert.id ? {...a, acknowledged: true} : a)
                  )}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && analytics && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            Data Analytics & Insights
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlations */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">Parameter Correlations</h5>
              <div className="space-y-2">
                {analytics.correlations.slice(0, 5).map((corr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {corr.parameters[0]} ↔ {corr.parameters[1]}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            Math.abs(corr.coefficient) > 0.7 ? 'bg-green-500' :
                            Math.abs(corr.coefficient) > 0.4 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.abs(corr.coefficient) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{corr.coefficient.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Patterns */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">Detected Patterns</h5>
              <div className="space-y-2">
                {analytics.patterns.map((pattern, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{pattern.parameter}</span>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                        {pattern.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{pattern.description}</p>
                    <p className="text-xs text-gray-500">Confidence: {(pattern.confidence * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Predictions */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">Short-term Predictions</h5>
              <div className="space-y-2">
                {analytics.predictions.slice(0, 4).map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{pred.parameter} (1hr)</span>
                    <span className="font-medium">{pred.nextHour.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">AI Recommendations</h5>
              <div className="space-y-2">
                {analytics.recommendations.map((rec, idx) => (
                  <div key={idx} className={`p-2 rounded border ${
                    rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                    rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{rec.action}</p>
                    <p className="text-xs text-gray-500 mt-1">Expected: {rec.expectedImprovement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            System Settings
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alert Rules */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">Alert Rules</h5>
              <div className="space-y-2">
                {alertRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{rule.name}</p>
                      <p className="text-xs text-gray-600">
                        {rule.parameter} {rule.condition} {
                          typeof rule.threshold === 'number' ? 
                          rule.threshold : 
                          `${rule.threshold.min}-${rule.threshold.max}`
                        }
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rule.enabled}
                        onChange={(e) => setAlertRules(prev => 
                          prev.map(r => r.id === rule.id ? {...r, enabled: e.target.checked} : r)
                        )}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cloud Integration */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">Cloud Integration</h5>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={integrationSettings.cloudStorage.enabled}
                    onChange={(e) => setIntegrationSettings(prev => ({
                      ...prev,
                      cloudStorage: { ...prev.cloudStorage, enabled: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Enable Cloud Storage</span>
                </label>
                {integrationSettings.cloudStorage.enabled && (
                  <select
                    value={integrationSettings.cloudStorage.provider}
                    onChange={(e) => setIntegrationSettings(prev => ({
                      ...prev,
                      cloudStorage: { ...prev.cloudStorage, provider: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="local">Local Storage</option>
                    <option value="aws">AWS S3</option>
                    <option value="azure">Azure Blob</option>
                    <option value="google">Google Cloud</option>
                  </select>
                )}
              </div>
            </div>
            
            {/* API Settings */}
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">API Configuration</h5>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={integrationSettings.apiEndpoints.enabled}
                    onChange={(e) => setIntegrationSettings(prev => ({
                      ...prev,
                      apiEndpoints: { ...prev.apiEndpoints, enabled: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Enable API Endpoints</span>
                </label>
                {integrationSettings.apiEndpoints.enabled && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={integrationSettings.apiEndpoints.endpoints.realtime}
                      onChange={(e) => setIntegrationSettings(prev => ({
                        ...prev,
                        apiEndpoints: {
                          ...prev.apiEndpoints,
                          endpoints: { ...prev.apiEndpoints.endpoints, realtime: e.target.value }
                        }
                      }))}
                      placeholder="Realtime endpoint"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      value={integrationSettings.apiEndpoints.authentication}
                      onChange={(e) => setIntegrationSettings(prev => ({
                        ...prev,
                        apiEndpoints: { ...prev.apiEndpoints, authentication: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="none">No Authentication</option>
                      <option value="apikey">API Key</option>
                      <option value="oauth">OAuth 2.0</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}