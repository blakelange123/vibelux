'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Link2,
  Zap,
  Server,
  Shield,
  Info,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'power' | 'water' | 'nutrients';
  status: 'online' | 'offline' | 'error';
  lastReading: number;
  unit: string;
  location: string;
  lastUpdated: Date;
  accuracy: number;
  calibrationDate: Date;
}

interface DataSource {
  id: string;
  name: string;
  type: 'sensor' | 'api' | 'manual' | 'integration';
  status: 'active' | 'inactive' | 'error';
  frequency: string;
  dataPoints: number;
  lastSync: Date;
  config: any;
}

interface Integration {
  id: string;
  name: string;
  logo?: string;
  type: 'utility' | 'weather' | 'equipment' | 'compliance';
  status: 'connected' | 'disconnected' | 'pending';
  lastSync: Date;
  dataTypes: string[];
}

export function DataCollection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'integrations' | 'quality'>('overview');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  const [dataQuality, setDataQuality] = useState(96.8);
  
  // Mock real-time data updates
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: '1',
      name: 'Room 1 - Temp/Humidity',
      type: 'temperature',
      status: 'online',
      lastReading: 72.5,
      unit: '°F',
      location: 'Flower Room 1',
      lastUpdated: new Date(),
      accuracy: 99.2,
      calibrationDate: new Date('2024-10-15')
    },
    {
      id: '2',
      name: 'Room 1 - CO2',
      type: 'co2',
      status: 'online',
      lastReading: 1200,
      unit: 'ppm',
      location: 'Flower Room 1',
      lastUpdated: new Date(),
      accuracy: 98.5,
      calibrationDate: new Date('2024-10-15')
    },
    {
      id: '3',
      name: 'Main Power Meter',
      type: 'power',
      status: 'online',
      lastReading: 45.2,
      unit: 'kW',
      location: 'Electrical Room',
      lastUpdated: new Date(),
      accuracy: 99.9,
      calibrationDate: new Date('2024-09-01')
    },
    {
      id: '4',
      name: 'Quantum Sensor Array',
      type: 'light',
      status: 'online',
      lastReading: 850,
      unit: 'μmol/m²/s',
      location: 'Canopy Level',
      lastUpdated: new Date(),
      accuracy: 97.8,
      calibrationDate: new Date('2024-11-01')
    },
    {
      id: '5',
      name: 'Water Flow Meter',
      type: 'water',
      status: 'error',
      lastReading: 0,
      unit: 'gal/min',
      location: 'Irrigation Room',
      lastUpdated: new Date(Date.now() - 3600000),
      accuracy: 95.0,
      calibrationDate: new Date('2024-08-15')
    }
  ]);

  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Pacific Power & Light',
      type: 'utility',
      status: 'connected',
      lastSync: new Date(),
      dataTypes: ['Energy Usage', 'Demand', 'Time-of-Use Rates']
    },
    {
      id: '2',
      name: 'NOAA Weather Service',
      type: 'weather',
      status: 'connected',
      lastSync: new Date(),
      dataTypes: ['Temperature', 'Humidity', 'Solar Radiation']
    },
    {
      id: '3',
      name: 'Gavita Controller',
      type: 'equipment',
      status: 'connected',
      lastSync: new Date(),
      dataTypes: ['Light Output', 'Operating Hours', 'Dimming Level']
    },
    {
      id: '4',
      name: 'METRC',
      type: 'compliance',
      status: 'pending',
      lastSync: new Date(Date.now() - 86400000),
      dataTypes: ['Plant Count', 'Harvest Data', 'Waste Tracking']
    }
  ]);

  // Simulate real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        lastReading: sensor.status === 'online' 
          ? sensor.lastReading + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2
          : sensor.lastReading,
        lastUpdated: sensor.status === 'online' ? new Date() : sensor.lastUpdated
      })));
      
      setDataQuality(prev => Math.min(100, Math.max(90, prev + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Historical data for charts
  const sensorHistory = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - (23 - i));
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric' }),
      temperature: 72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
      humidity: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      co2: 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400,
      power: 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return 'text-green-400';
      case 'offline':
      case 'disconnected':
      case 'inactive':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      case 'humidity': return <Droplets className="w-5 h-5" />;
      case 'co2': return <Wind className="w-5 h-5" />;
      case 'light': return <Sun className="w-5 h-5" />;
      case 'power': return <Zap className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'utility': return <Zap className="w-5 h-5" />;
      case 'weather': return <Sun className="w-5 h-5" />;
      case 'equipment': return <Server className="w-5 h-5" />;
      case 'compliance': return <Shield className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-500" />
            Data Collection Infrastructure
          </h2>
          <p className="text-gray-400">Real-time monitoring and integration management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button
            onClick={() => setShowAddSensorModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sensor
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-medium text-white">Data Collection Active</p>
              <p className="text-sm text-gray-300">
                {sensors.filter(s => s.status === 'online').length}/{sensors.length} sensors online • 
                {' '}{integrations.filter(i => i.status === 'connected').length}/{integrations.length} integrations active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Data Quality</p>
              <p className="text-xl font-bold text-white">{dataQuality.toFixed(1)}%</p>
            </div>
            <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'sensors', 'integrations', 'quality'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <span className="text-xs text-green-400">LIVE</span>
              </div>
              <p className="text-sm text-gray-400">Temperature</p>
              <p className="text-2xl font-bold text-white">
                {sensors.find(s => s.type === 'temperature')?.lastReading.toFixed(1)}°F
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-green-400">LIVE</span>
              </div>
              <p className="text-sm text-gray-400">Humidity</p>
              <p className="text-2xl font-bold text-white">62.3%</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-green-400">LIVE</span>
              </div>
              <p className="text-sm text-gray-400">Power Usage</p>
              <p className="text-2xl font-bold text-white">
                {sensors.find(s => s.type === 'power')?.lastReading.toFixed(1)} kW
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Wind className="w-5 h-5 text-green-400" />
                <span className="text-xs text-green-400">LIVE</span>
              </div>
              <p className="text-sm text-gray-400">CO2 Level</p>
              <p className="text-2xl font-bold text-white">
                {sensors.find(s => s.type === 'co2')?.lastReading.toFixed(0)} ppm
              </p>
            </div>
          </div>

          {/* Live Data Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">24-Hour Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    name="Temperature (°F)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    name="Humidity (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="power"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                    name="Power (kW)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Sources Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Active Sensors</h3>
              <div className="space-y-3">
                {sensors.slice(0, 3).map((sensor) => (
                  <div key={sensor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gray-800 rounded-lg ${getStatusColor(sensor.status)}`}>
                        {getSensorIcon(sensor.type)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{sensor.name}</p>
                        <p className="text-sm text-gray-400">{sensor.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {sensor.lastReading.toFixed(1)} {sensor.unit}
                      </p>
                      <p className="text-xs text-gray-400">
                        {sensor.status === 'online' ? 'Just now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Integration Status</h3>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gray-800 rounded-lg ${getStatusColor(integration.status)}`}>
                        {getIntegrationIcon(integration.type)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{integration.name}</p>
                        <p className="text-sm text-gray-400">
                          {integration.dataTypes.length} data types
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sensors' && (
        <div className="space-y-4">
          {/* Sensor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((sensor) => (
              <div
                key={sensor.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedSensor(sensor)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 bg-gray-800 rounded-lg ${getStatusColor(sensor.status)}`}>
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    {sensor.status === 'online' ? (
                      <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${getStatusColor(sensor.status)}`}>
                      {sensor.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-1">{sensor.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{sensor.location}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Current Reading</span>
                    <span className="font-medium text-white">
                      {sensor.lastReading.toFixed(1)} {sensor.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Accuracy</span>
                    <span className="text-sm text-green-400">{sensor.accuracy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Last Updated</span>
                    <span className="text-sm text-gray-300">
                      {sensor.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {sensor.status === 'error' && (
                  <div className="mt-3 p-2 bg-red-900/20 rounded border border-red-600/30">
                    <p className="text-xs text-red-400">Sensor offline - check connection</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Integration Categories */}
          {['utility', 'weather', 'equipment', 'compliance'].map((category) => (
            <div key={category} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                {category} Integrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => i.type === category)
                  .map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gray-700 rounded-lg ${getStatusColor(integration.status)}`}>
                          {getIntegrationIcon(integration.type)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{integration.name}</p>
                          <p className="text-sm text-gray-400">
                            Last sync: {integration.lastSync.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === 'connected' ? (
                          <button className="text-red-400 hover:text-red-300">
                            Disconnect
                          </button>
                        ) : (
                          <button className="text-green-400 hover:text-green-300">
                            Connect
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-300">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Add Integration Button */}
          <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Integration
          </button>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-6">
          {/* Data Quality Overview */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Data Quality Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Quality Score</span>
                  <span className="text-2xl font-bold text-white">{dataQuality.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${dataQuality}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Data Completeness</span>
                  <span className="text-2xl font-bold text-white">98.2%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98.2%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Sensor Uptime</span>
                  <span className="text-2xl font-bold text-white">95.7%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95.7%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Data Validation Rules */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Validation Rules</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Temperature Range Check</p>
                    <p className="text-sm text-gray-400">Alerts if outside 65-85°F range</p>
                  </div>
                </div>
                <span className="text-sm text-green-400">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Power Consumption Limits</p>
                    <p className="text-sm text-gray-400">Flags readings over 100kW</p>
                  </div>
                </div>
                <span className="text-sm text-green-400">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium text-white">Missing Data Detection</p>
                    <p className="text-sm text-gray-400">Alerts after 15 minutes of no data</p>
                  </div>
                </div>
                <span className="text-sm text-yellow-400">Warning</span>
              </div>
            </div>
          </div>

          {/* Calibration Schedule */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Calibration Schedule</h3>
            <div className="space-y-3">
              {sensors.map((sensor) => {
                const daysSinceCalibration = Math.floor(
                  (Date.now() - sensor.calibrationDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                const dueForCalibration = daysSinceCalibration > 90;
                
                return (
                  <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getSensorIcon(sensor.type)}
                      <div>
                        <p className="font-medium text-white">{sensor.name}</p>
                        <p className="text-sm text-gray-400">
                          Last calibrated: {sensor.calibrationDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {dueForCalibration ? (
                        <span className="text-sm text-yellow-400">Due for calibration</span>
                      ) : (
                        <span className="text-sm text-green-400">
                          Next in {90 - daysSinceCalibration} days
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedSensor.name}</h3>
              <button
                onClick={() => setSelectedSensor(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Reading</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedSensor.lastReading.toFixed(1)} {selectedSensor.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor(selectedSensor.status)}`}>
                    {selectedSensor.status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">{selectedSensor.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Accuracy</p>
                  <p className="text-white">{selectedSensor.accuracy}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Calibration</p>
                  <p className="text-white">{selectedSensor.calibrationDate.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  Configure
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
                  Calibrate
                </button>
                <button className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg font-medium transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}