'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  BellRing,
  BellOff,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Leaf,
  Activity,
  Clock,
  MapPin,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  Gauge,
  Shield,
  Bug,
  Lightbulb,
  WifiOff,
  Database,
  BarChart3,
  Target,
  Info
} from 'lucide-react';

interface EnvironmentalSensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'vpd' | 'pressure' | 'airflow';
  location: string;
  zone: string;
  current_value: number;
  unit: string;
  status: 'online' | 'offline' | 'error' | 'calibrating';
  last_reading: Date;
  battery_level?: number;
  signal_strength?: number;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  sensor_type: string;
  condition: 'above' | 'below' | 'outside_range' | 'rate_of_change' | 'no_data';
  threshold_high?: number;
  threshold_low?: number;
  rate_threshold?: number; // per minute
  time_window?: number; // minutes
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  crop_specific: string[]; // empty array means all crops
  time_restrictions?: {
    start_hour: number;
    end_hour: number;
    days: number[]; // 0-6, Sunday-Saturday
  };
  escalation_rules: {
    delay_minutes: number;
    notification_methods: ('email' | 'sms' | 'push' | 'slack' | 'teams')[];
    recipients: string[];
  }[];
}

interface EnvironmentalAlert {
  id: string;
  rule_id: string;
  sensor_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  triggered_at: Date;
  acknowledged_at?: Date;
  resolved_at?: Date;
  acknowledged_by?: string;
  current_value: number;
  threshold_value?: number;
  zone: string;
  location: string;
  crop_impact: 'severe' | 'moderate' | 'minor' | 'none';
  recommended_actions: string[];
  auto_actions_taken: string[];
  escalation_level: number;
  notification_history: {
    timestamp: Date;
    method: string;
    recipient: string;
    status: 'sent' | 'delivered' | 'failed';
  }[];
}

interface CropSafetyParameters {
  crop_type: string;
  growth_stage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  temperature: { min: number; max: number; optimal_min: number; optimal_max: number };
  humidity: { min: number; max: number; optimal_min: number; optimal_max: number };
  co2: { min: number; max: number; optimal_min: number; optimal_max: number };
  vpd: { min: number; max: number; optimal_min: number; optimal_max: number };
  light_hours: { min: number; max: number; optimal: number };
  ph: { min: number; max: number; optimal_min: number; optimal_max: number };
  ec: { min: number; max: number; optimal_min: number; optimal_max: number };
}

export function RealTimeEnvironmentalAlerts() {
  const [sensors, setSensors] = useState<EnvironmentalSensor[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<EnvironmentalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [selectedAlert, setSelectedAlert] = useState<EnvironmentalAlert | null>(null);

  // Generate sample data
  useEffect(() => {
    const loadInitialData = () => {
      setSensors(generateSampleSensors());
      setAlertRules(generateSampleAlertRules());
      setActiveAlerts(generateSampleAlerts());
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      updateSensorReadings();
      checkAlertConditions();
      setLastUpdate(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const generateSampleSensors = (): EnvironmentalSensor[] => [
    {
      id: 'temp-001',
      name: 'Temperature Sensor A1',
      type: 'temperature',
      location: 'Zone A - North Side',
      zone: 'Zone A',
      current_value: 24.3,
      unit: '°C',
      status: 'online',
      last_reading: new Date(),
      battery_level: 87,
      signal_strength: 95
    },
    {
      id: 'hum-001',
      name: 'Humidity Sensor A1',
      type: 'humidity',
      location: 'Zone A - North Side',
      zone: 'Zone A',
      current_value: 72.1,
      unit: '%',
      status: 'online',
      last_reading: new Date(),
      battery_level: 91,
      signal_strength: 92
    },
    {
      id: 'co2-001',
      name: 'CO2 Sensor Main',
      type: 'co2',
      location: 'Zone A - Center',
      zone: 'Zone A',
      current_value: 1450,
      unit: 'ppm',
      status: 'online',
      last_reading: new Date(),
      signal_strength: 88
    },
    {
      id: 'temp-002',
      name: 'Temperature Sensor B1',
      type: 'temperature',
      location: 'Zone B - South Side',
      zone: 'Zone B',
      current_value: 28.7,
      unit: '°C',
      status: 'error',
      last_reading: new Date(Date.now() - 15 * 60 * 1000),
      battery_level: 23,
      signal_strength: 45
    },
    {
      id: 'hum-002',
      name: 'Humidity Sensor B1',
      type: 'humidity',
      location: 'Zone B - South Side',
      zone: 'Zone B',
      current_value: 45.2,
      unit: '%',
      status: 'online',
      last_reading: new Date(),
      battery_level: 76,
      signal_strength: 82
    },
    {
      id: 'light-001',
      name: 'PPFD Sensor A1',
      type: 'light',
      location: 'Zone A - Canopy Level',
      zone: 'Zone A',
      current_value: 650,
      unit: 'μmol/m²/s',
      status: 'online',
      last_reading: new Date(),
      signal_strength: 93
    }
  ];

  const generateSampleAlertRules = (): AlertRule[] => [
    {
      id: 'rule-temp-high',
      name: 'High Temperature Alert',
      description: 'Temperature exceeds safe growing limits',
      sensor_type: 'temperature',
      condition: 'above',
      threshold_high: 28,
      severity: 'critical',
      enabled: true,
      crop_specific: [],
      escalation_rules: [
        {
          delay_minutes: 0,
          notification_methods: ['push', 'email'],
          recipients: ['grower@farm.com', 'manager@farm.com']
        },
        {
          delay_minutes: 15,
          notification_methods: ['sms', 'email'],
          recipients: ['emergency@farm.com']
        }
      ]
    },
    {
      id: 'rule-humidity-low',
      name: 'Low Humidity Alert',
      description: 'Humidity below optimal range for plant health',
      sensor_type: 'humidity',
      condition: 'below',
      threshold_low: 50,
      severity: 'high',
      enabled: true,
      crop_specific: ['lettuce', 'spinach'],
      escalation_rules: [
        {
          delay_minutes: 5,
          notification_methods: ['push'],
          recipients: ['grower@farm.com']
        }
      ]
    },
    {
      id: 'rule-co2-high',
      name: 'CO2 Concentration Alert',
      description: 'CO2 levels may be toxic to workers',
      sensor_type: 'co2',
      condition: 'above',
      threshold_high: 5000,
      severity: 'critical',
      enabled: true,
      crop_specific: [],
      escalation_rules: [
        {
          delay_minutes: 0,
          notification_methods: ['push', 'sms', 'email'],
          recipients: ['safety@farm.com', 'manager@farm.com']
        }
      ]
    },
    {
      id: 'rule-sensor-offline',
      name: 'Sensor Offline Alert',
      description: 'Critical sensor has stopped reporting data',
      sensor_type: 'temperature',
      condition: 'no_data',
      time_window: 10,
      severity: 'high',
      enabled: true,
      crop_specific: [],
      escalation_rules: [
        {
          delay_minutes: 10,
          notification_methods: ['push', 'email'],
          recipients: ['tech@farm.com']
        }
      ]
    }
  ];

  const generateSampleAlerts = (): EnvironmentalAlert[] => [
    {
      id: 'alert-001',
      rule_id: 'rule-temp-high',
      sensor_id: 'temp-002',
      severity: 'critical',
      title: 'Critical Temperature Exceeded',
      message: 'Temperature in Zone B has reached 28.7°C, exceeding the safe limit of 28.0°C',
      triggered_at: new Date(Date.now() - 5 * 60 * 1000),
      current_value: 28.7,
      threshold_value: 28.0,
      zone: 'Zone B',
      location: 'Zone B - South Side',
      crop_impact: 'severe',
      recommended_actions: [
        'Increase ventilation immediately',
        'Check cooling system operation',
        'Consider shade cloth deployment',
        'Monitor for heat stress symptoms'
      ],
      auto_actions_taken: [
        'Exhaust fans increased to 100%',
        'Cooling system activated'
      ],
      escalation_level: 1,
      notification_history: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          method: 'push',
          recipient: 'grower@farm.com',
          status: 'delivered'
        },
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          method: 'email',
          recipient: 'manager@farm.com',
          status: 'delivered'
        }
      ]
    },
    {
      id: 'alert-002',
      rule_id: 'rule-humidity-low',
      sensor_id: 'hum-002',
      severity: 'high',
      title: 'Low Humidity Detected',
      message: 'Humidity in Zone B has dropped to 45.2%, below the optimal range',
      triggered_at: new Date(Date.now() - 12 * 60 * 1000),
      current_value: 45.2,
      threshold_value: 50.0,
      zone: 'Zone B',
      location: 'Zone B - South Side',
      crop_impact: 'moderate',
      recommended_actions: [
        'Activate humidification system',
        'Check for air leaks',
        'Reduce ventilation if safe',
        'Monitor VPD levels'
      ],
      auto_actions_taken: [
        'Humidifier system activated'
      ],
      escalation_level: 0,
      notification_history: [
        {
          timestamp: new Date(Date.now() - 7 * 60 * 1000),
          method: 'push',
          recipient: 'grower@farm.com',
          status: 'delivered'
        }
      ]
    },
    {
      id: 'alert-003',
      rule_id: 'rule-sensor-offline',
      sensor_id: 'temp-002',
      severity: 'high',
      title: 'Sensor Communication Lost',
      message: 'Temperature sensor B1 has not reported data for 15 minutes',
      triggered_at: new Date(Date.now() - 10 * 60 * 1000),
      current_value: 0,
      zone: 'Zone B',
      location: 'Zone B - South Side',
      crop_impact: 'minor',
      recommended_actions: [
        'Check sensor power and connections',
        'Verify network connectivity',
        'Replace sensor if necessary',
        'Use backup monitoring methods'
      ],
      auto_actions_taken: [],
      escalation_level: 0,
      notification_history: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          method: 'email',
          recipient: 'tech@farm.com',
          status: 'delivered'
        }
      ]
    }
  ];

  const updateSensorReadings = useCallback(() => {
    setSensors(prev => prev.map(sensor => ({
      ...sensor,
      current_value: sensor.status === 'online' ? 
        sensor.current_value + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2 : sensor.current_value,
      last_reading: sensor.status === 'online' ? new Date() : sensor.last_reading,
      battery_level: sensor.battery_level ? 
        Math.max(0, sensor.battery_level - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1) : undefined
    })));
  }, []);

  const checkAlertConditions = useCallback(() => {
    // Simulate new alerts based on sensor values
    // In reality, this would be done on the backend
    const newAlerts: EnvironmentalAlert[] = [];
    
    sensors.forEach(sensor => {
      alertRules.forEach(rule => {
        if (rule.sensor_type === sensor.type && rule.enabled) {
          let shouldAlert = false;
          
          switch (rule.condition) {
            case 'above':
              shouldAlert = sensor.current_value > (rule.threshold_high || 0);
              break;
            case 'below':
              shouldAlert = sensor.current_value < (rule.threshold_low || 0);
              break;
            case 'no_data':
              const minutesSinceReading = (Date.now() - sensor.last_reading.getTime()) / (1000 * 60);
              shouldAlert = minutesSinceReading > (rule.time_window || 10);
              break;
          }
          
          if (shouldAlert && !activeAlerts.find(alert => 
            alert.sensor_id === sensor.id && alert.rule_id === rule.id && !alert.resolved_at
          )) {
            // Create new alert (simplified)
            // In reality, this would be managed by the backend
          }
        }
      });
    });
  }, [sensors, alertRules, activeAlerts]);

  const acknowledgeAlert = (alertId: string, userId: string = 'current_user') => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged_at: new Date(), acknowledged_by: userId }
        : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved_at: new Date() }
        : alert
    ));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-900/20 border-red-800';
      case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-800';
      case 'medium': return 'text-yellow-500 bg-yellow-900/20 border-yellow-800';
      case 'low': return 'text-blue-500 bg-blue-900/20 border-blue-800';
      default: return 'text-gray-500 bg-gray-900/20 border-gray-800';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'humidity': return <Droplets className="w-4 h-4" />;
      case 'co2': return <Wind className="w-4 h-4" />;
      case 'light': return <Lightbulb className="w-4 h-4" />;
      case 'ph': return <Activity className="w-4 h-4" />;
      case 'ec': return <Zap className="w-4 h-4" />;
      case 'vpd': return <Gauge className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredAlerts = activeAlerts.filter(alert => {
    if (!showResolved && alert.resolved_at) return false;
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (selectedZone !== 'all' && alert.zone !== selectedZone) return false;
    return true;
  });

  const criticalAlerts = activeAlerts.filter(alert => 
    alert.severity === 'critical' && !alert.resolved_at
  ).length;

  const zones = Array.from(new Set(sensors.map(s => s.zone)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading environmental monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-400" />
              Environmental Alert System
            </h1>
            <p className="text-gray-400">Real-time monitoring and alerting for critical growing conditions</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Critical Alert Counter */}
            {criticalAlerts > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg">
                <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="text-red-400 font-bold">{criticalAlerts} Critical</span>
              </div>
            )}
            
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-500">
                  {activeAlerts.filter(a => a.severity === 'critical' && !a.resolved_at).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-orange-500">
                  {activeAlerts.filter(a => a.severity === 'high' && !a.resolved_at).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sensors Online</p>
                <p className="text-2xl font-bold text-green-500">
                  {sensors.filter(s => s.status === 'online').length}/{sensors.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-500">2.3<span className="text-sm">min</span></p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              showResolved 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {showResolved ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            Show Resolved
          </button>
        </div>

        {/* Active Alerts */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">All Clear!</h3>
              <p className="text-gray-400">No alerts match your current filters.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-gray-900 rounded-lg p-6 border transition-all cursor-pointer ${
                  getSeverityColor(alert.severity)
                } ${selectedAlert?.id === alert.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{alert.title}</h3>
                      <p className="text-gray-300 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.triggered_at.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {getSensorIcon(sensors.find(s => s.id === alert.sensor_id)?.type || '')}
                          {alert.current_value} {sensors.find(s => s.id === alert.sensor_id)?.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.resolved_at ? (
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">
                        Resolved
                      </span>
                    ) : alert.acknowledged_at ? (
                      <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs">
                        Acknowledged
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-600 text-white animate-pulse' :
                        alert.severity === 'high' ? 'bg-orange-600 text-white' :
                        alert.severity === 'medium' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Crop Impact */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">Crop Impact:</span>
                    <span className={`text-sm font-medium ${
                      alert.crop_impact === 'severe' ? 'text-red-400' :
                      alert.crop_impact === 'moderate' ? 'text-orange-400' :
                      alert.crop_impact === 'minor' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {alert.crop_impact.charAt(0).toUpperCase() + alert.crop_impact.slice(1)}
                    </span>
                  </div>
                  
                  {alert.escalation_level > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-400" />
                      <span className="text-gray-400 text-sm">Escalated (Level {alert.escalation_level})</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">Recommended Actions</h4>
                    <ul className="space-y-1">
                      {alert.recommended_actions.map((action, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {alert.auto_actions_taken.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2 text-sm">Auto Actions Taken</h4>
                      <ul className="space-y-1">
                        {alert.auto_actions_taken.map((action, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!alert.resolved_at && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    {!alert.acknowledged_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acknowledgeAlert(alert.id);
                        }}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resolveAlert(alert.id);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Mark Resolved
                    </button>
                    
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}