'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer, Droplets, Wind, Gauge, Sun, Cloud,
  Activity, AlertTriangle, CheckCircle, Settings,
  TrendingUp, TrendingDown, Minus, RefreshCw
} from 'lucide-react';
import { sensorService } from '@/lib/sensor-integration';
import type { SensorDevice, SensorReading } from '@/lib/sensor-interfaces';

interface ClimateData {
  temperature: number;
  humidity: number;
  co2: number;
  lightLevel: number;
  vpd: number;
  dewPoint: number;
  timestamp: Date;
}

interface ClimateTarget {
  parameter: 'temperature' | 'humidity' | 'co2' | 'vpd';
  min: number;
  max: number;
  optimal: number;
}

interface GreenhouseClimateIntegrationProps {
  greenhouseId?: string;
  onClimateUpdate?: (data: ClimateData) => void;
  showControls?: boolean;
}

export function GreenhouseClimateIntegration({
  greenhouseId = 'default',
  onClimateUpdate,
  showControls = true
}: GreenhouseClimateIntegrationProps) {
  const [climateData, setClimateData] = useState<ClimateData>({
    temperature: 24,
    humidity: 65,
    co2: 800,
    lightLevel: 450,
    vpd: 1.2,
    dewPoint: 16.5,
    timestamp: new Date()
  });

  const [historicalData, setHistoricalData] = useState<ClimateData[]>([]);
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [targets] = useState<ClimateTarget[]>([
    { parameter: 'temperature', min: 20, max: 28, optimal: 24 },
    { parameter: 'humidity', min: 60, max: 80, optimal: 70 },
    { parameter: 'co2', min: 400, max: 1200, optimal: 1000 },
    { parameter: 'vpd', min: 0.8, max: 1.6, optimal: 1.2 }
  ]);

  // Connect to sensors on mount
  useEffect(() => {
    const mockSensors = sensorService.getSensors();
    setSensors(mockSensors);
    
    // Connect to sensors and subscribe to updates
    mockSensors.forEach(sensor => {
      sensorService.connectSensor(sensor).then(connected => {
        if (connected) {
          sensorService.subscribe(sensor.id, handleSensorReading);
        }
      });
    });

    setIsConnected(true);

    return () => {
      // Cleanup subscriptions
      mockSensors.forEach(sensor => {
        sensorService.unsubscribe(sensor.id, handleSensorReading);
        sensorService.disconnectSensor(sensor.id);
      });
    };
  }, []);

  const handleSensorReading = (reading: SensorReading) => {
    // Update climate data based on sensor readings
    setClimateData(prev => {
      const updated = { ...prev, timestamp: reading.timestamp };
      
      if ('value' in reading && typeof reading.value === 'object' && reading.value !== null) {
        const val = reading.value as any;
        if ('temperature' in val && 'humidity' in val) {
          updated.temperature = val.temperature;
          updated.humidity = val.humidity;
          updated.vpd = val.vpd || prev.vpd;
          updated.dewPoint = val.dewPoint || prev.dewPoint;
        }
      } else if (typeof reading.value === 'number' && reading.unit === 'ppm') {
        updated.co2 = reading.value;
      }
      
      return updated;
    });
  };

  // Update historical data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const newData = [...prev, climateData];
        // Keep only last 60 minutes
        return newData.slice(-60);
      });
      
      // Check for alerts
      checkAlerts();
    }, 60000);

    return () => clearInterval(interval);
  }, [climateData]);

  // Notify parent component of climate updates
  useEffect(() => {
    if (onClimateUpdate) {
      onClimateUpdate(climateData);
    }
  }, [climateData, onClimateUpdate]);

  const checkAlerts = () => {
    const newAlerts: string[] = [];
    
    targets.forEach(target => {
      const value = climateData[target.parameter];
      if (value < target.min) {
        newAlerts.push(`${target.parameter} too low: ${value}`);
      } else if (value > target.max) {
        newAlerts.push(`${target.parameter} too high: ${value}`);
      }
    });
    
    setAlerts(newAlerts);
  };

  const getParameterStatus = (value: number, target: ClimateTarget) => {
    if (value < target.min || value > target.max) return 'danger';
    if (Math.abs(value - target.optimal) < (target.max - target.min) * 0.1) return 'optimal';
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrend = (parameter: keyof ClimateData) => {
    if (historicalData.length < 2) return 'stable';
    const recent = historicalData.slice(-5);
    const values = recent.map(d => d[parameter] as number);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = climateData[parameter] as number;
    
    if (current > avg * 1.02) return 'up';
    if (current < avg * 0.98) return 'down';
    return 'stable';
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          Real-Time Climate Monitoring
        </h3>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Climate Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Temperature */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-300">Temperature</span>
            </div>
            {getTrend('temperature') === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
            {getTrend('temperature') === 'down' && <TrendingDown className="w-4 h-4 text-blue-500" />}
            {getTrend('temperature') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getStatusColor(getParameterStatus(climateData.temperature, targets[0]))}`}>
              {climateData.temperature.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">°C</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Target: {targets[0].min}-{targets[0].max}°C
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-500" />
              <span className="text-sm font-medium text-gray-300">Humidity</span>
            </div>
            {getTrend('humidity') === 'up' && <TrendingUp className="w-4 h-4 text-blue-500" />}
            {getTrend('humidity') === 'down' && <TrendingDown className="w-4 h-4 text-orange-500" />}
            {getTrend('humidity') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getStatusColor(getParameterStatus(climateData.humidity, targets[1]))}`}>
              {climateData.humidity.toFixed(0)}
            </span>
            <span className="text-sm text-gray-400">%</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Target: {targets[1].min}-{targets[1].max}%
          </div>
        </div>

        {/* CO2 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-300">CO₂</span>
            </div>
            {getTrend('co2') === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            {getTrend('co2') === 'down' && <TrendingDown className="w-4 h-4 text-yellow-500" />}
            {getTrend('co2') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getStatusColor(getParameterStatus(climateData.co2, targets[2]))}`}>
              {climateData.co2}
            </span>
            <span className="text-sm text-gray-400">ppm</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Target: {targets[2].min}-{targets[2].max} ppm
          </div>
        </div>

        {/* VPD */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-300">VPD</span>
            </div>
            {getTrend('vpd') === 'up' && <TrendingUp className="w-4 h-4 text-purple-500" />}
            {getTrend('vpd') === 'down' && <TrendingDown className="w-4 h-4 text-purple-500" />}
            {getTrend('vpd') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getStatusColor(getParameterStatus(climateData.vpd, targets[3]))}`}>
              {climateData.vpd.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400">kPa</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Target: {targets[3].min}-{targets[3].max} kPa
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">Dew Point</p>
          <p className="text-lg font-semibold text-gray-200">{climateData.dewPoint.toFixed(1)}°C</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Light Level</p>
          <p className="text-lg font-semibold text-gray-200">{climateData.lightLevel} μmol/m²/s</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Active Sensors</p>
          <p className="text-lg font-semibold text-gray-200">{sensors.filter(s => s.status === 'connected').length}/{sensors.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Last Update</p>
          <p className="text-lg font-semibold text-gray-200">
            {climateData.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Alerts
          </h4>
          <ul className="space-y-1">
            {alerts.map((alert, index) => (
              <li key={index} className="text-sm text-red-400">• {alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Control Panel */}
      {showControls && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Climate Controls
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="px-4 py-2 bg-blue-900/20 text-blue-400 border border-blue-800 rounded-lg hover:bg-blue-800/30 transition-colors text-sm font-medium">
              Adjust Heating
            </button>
            <button className="px-4 py-2 bg-cyan-900/20 text-cyan-400 border border-cyan-800 rounded-lg hover:bg-cyan-800/30 transition-colors text-sm font-medium">
              Adjust Cooling
            </button>
            <button className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-800 rounded-lg hover:bg-green-800/30 transition-colors text-sm font-medium">
              CO₂ Injection
            </button>
            <button className="px-4 py-2 bg-purple-900/20 text-purple-400 border border-purple-800 rounded-lg hover:bg-purple-800/30 transition-colors text-sm font-medium">
              Vent Control
            </button>
          </div>
        </div>
      )}
    </div>
  );
}