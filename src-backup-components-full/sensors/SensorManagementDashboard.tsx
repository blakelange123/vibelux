'use client';

import React, { useState, useEffect } from 'react';
import { SensorSetupWizard } from './SensorSetupWizard';
import { 
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  BarChart3,
  Download,
  RefreshCw,
  Info,
  Edit,
  Trash2,
  Power,
  TestTube,
  Zap,
  ChevronRight,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { getTimeSeriesDB, getSensorHistory } from '@/lib/timeseries/influxdb-client';

interface SensorData {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec';
  roomId: string;
  roomName: string;
  status: 'online' | 'offline' | 'error' | 'warning';
  currentValue: number;
  unit: string;
  lastUpdate: Date;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  battery?: number;
  signal?: number;
  config: {
    minAlert: number;
    maxAlert: number;
    calibrationOffset: number;
    updateInterval: number;
  };
  statistics: {
    min24h: number;
    max24h: number;
    avg24h: number;
  };
}

export function SensorManagementDashboard() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataRetention, setDataRetention] = useState(30); // days

  // Load sensors
  useEffect(() => {
    loadSensors();
    const interval = setInterval(loadSensors, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSensors = async () => {
    // Mock data - in production, fetch from API
    const mockSensors: SensorData[] = [
      {
        id: 'temp_1',
        name: 'Canopy Temperature',
        type: 'temperature',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        status: 'online',
        currentValue: 75.2,
        unit: '°F',
        lastUpdate: new Date(),
        trend: 'up',
        trendValue: 0.5,
        battery: 85,
        signal: 92,
        config: {
          minAlert: 65,
          maxAlert: 85,
          calibrationOffset: 0,
          updateInterval: 60
        },
        statistics: {
          min24h: 72.1,
          max24h: 78.3,
          avg24h: 75.1
        }
      },
      {
        id: 'hum_1',
        name: 'Canopy Humidity',
        type: 'humidity',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        status: 'online',
        currentValue: 55.5,
        unit: '%',
        lastUpdate: new Date(),
        trend: 'down',
        trendValue: -2.1,
        battery: 85,
        signal: 92,
        config: {
          minAlert: 40,
          maxAlert: 70,
          calibrationOffset: 0,
          updateInterval: 60
        },
        statistics: {
          min24h: 52.3,
          max24h: 61.2,
          avg24h: 56.8
        }
      },
      {
        id: 'co2_1',
        name: 'Room CO2',
        type: 'co2',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        status: 'online',
        currentValue: 1200,
        unit: 'ppm',
        lastUpdate: new Date(),
        trend: 'stable',
        trendValue: 0,
        config: {
          minAlert: 800,
          maxAlert: 1500,
          calibrationOffset: 0,
          updateInterval: 300
        },
        statistics: {
          min24h: 950,
          max24h: 1450,
          avg24h: 1180
        }
      },
      {
        id: 'ph_1',
        name: 'Reservoir pH',
        type: 'ph',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        status: 'warning',
        currentValue: 6.4,
        unit: 'pH',
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
        trend: 'up',
        trendValue: 0.2,
        config: {
          minAlert: 5.8,
          maxAlert: 6.2,
          calibrationOffset: 0.1,
          updateInterval: 600
        },
        statistics: {
          min24h: 5.9,
          max24h: 6.4,
          avg24h: 6.1
        }
      },
      {
        id: 'temp_2',
        name: 'Ambient Temperature',
        type: 'temperature',
        roomId: 'room_2',
        roomName: 'Veg Room',
        status: 'offline',
        currentValue: 0,
        unit: '°F',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        trend: 'stable',
        trendValue: 0,
        battery: 12,
        signal: 0,
        config: {
          minAlert: 70,
          maxAlert: 80,
          calibrationOffset: 0,
          updateInterval: 60
        },
        statistics: {
          min24h: 0,
          max24h: 0,
          avg24h: 0
        }
      }
    ];
    setSensors(mockSensors);
  };

  const refreshSensorData = async () => {
    setIsRefreshing(true);
    await loadSensors();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      case 'humidity': return <Droplets className="w-5 h-5" />;
      case 'co2': return <Wind className="w-5 h-5" />;
      case 'light': return <Sun className="w-5 h-5" />;
      case 'ph': return <TestTube className="w-5 h-5" />;
      case 'ec': return <Zap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'offline': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-blue-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const rooms = [
    { id: 'all', name: 'All Rooms' },
    ...Array.from(new Set(sensors.map(s => s.roomId))).map(roomId => ({
      id: roomId,
      name: sensors.find(s => s.roomId === roomId)?.roomName || roomId
    }))
  ];

  const filteredSensors = selectedRoom === 'all' 
    ? sensors 
    : sensors.filter(s => s.roomId === selectedRoom);

  const sensorStats = {
    total: sensors.length,
    online: sensors.filter(s => s.status === 'online').length,
    offline: sensors.filter(s => s.status === 'offline').length,
    warnings: sensors.filter(s => s.status === 'warning' || s.status === 'error').length
  };

  if (showSetupWizard) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setShowSetupWizard(false)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
        <SensorSetupWizard
          roomId="room_1"
          roomName="Flower Room A"
          onComplete={() => {
            setShowSetupWizard(false);
            loadSensors();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-purple-500" />
            Sensor Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and configure all environmental sensors
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshSensorData}
            disabled={isRefreshing}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowSetupWizard(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sensors
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sensors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sensorStats.total}</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Online</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{sensorStats.online}</p>
            </div>
            <Wifi className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{sensorStats.offline}</p>
            </div>
            <WifiOff className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{sensorStats.warnings}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Room Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Room:</span>
          <div className="flex gap-2">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedRoom === room.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSensors.map(sensor => (
          <div
            key={sensor.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            {/* Sensor Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  sensor.status === 'online' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {getSensorIcon(sensor.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {sensor.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sensor.roomName}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sensor.status)}`}>
                {sensor.status}
              </span>
            </div>

            {/* Current Value */}
            {sensor.status === 'online' ? (
              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {sensor.currentValue}
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-1">
                        {sensor.unit}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getTrendIcon(sensor.trend, sensor.trendValue)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {sensor.trendValue > 0 ? '+' : ''}{sensor.trendValue} {sensor.unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">24h range</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sensor.statistics.min24h} - {sensor.statistics.max24h}
                    </p>
                  </div>
                </div>

                {/* Alert Range */}
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-green-500"
                    style={{
                      left: '20%',
                      width: '60%'
                    }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-gray-900 dark:bg-white rounded-full -mt-0.5"
                    style={{
                      left: `${((sensor.currentValue - sensor.statistics.min24h) / (sensor.statistics.max24h - sensor.statistics.min24h)) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{sensor.config.minAlert}</span>
                  <span>Optimal Range</span>
                  <span>{sensor.config.maxAlert}</span>
                </div>
              </div>
            ) : (
              <div className="mb-4 py-8 text-center">
                <WifiOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last seen: {new Date(sensor.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Sensor Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
              {sensor.battery !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Battery</span>
                  <span className={`font-medium ${
                    sensor.battery > 50 ? 'text-green-600' : 
                    sensor.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sensor.battery}%
                  </span>
                </div>
              )}
              {sensor.signal !== undefined && sensor.status === 'online' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Signal</span>
                  <span className={`font-medium ${
                    sensor.signal > 70 ? 'text-green-600' : 
                    sensor.signal > 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sensor.signal}%
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Update Interval</span>
                <span className="text-gray-900 dark:text-white">
                  {sensor.config.updateInterval}s
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setSelectedSensor(sensor)}
                className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Configure
              </button>
              <button className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
                <BarChart3 className="w-3 h-3" />
                History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Data Retention Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Data Retention Settings
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-300">
              Keep sensor data for {dataRetention} days
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Based on your Professional subscription. Upgrade for longer retention.
            </p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      {selectedSensor && (
        <SensorConfigModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          onSave={(updated) => {
            setSensors(prev => prev.map(s => 
              s.id === updated.id ? updated : s
            ));
            setSelectedSensor(null);
          }}
        />
      )}
    </div>
  );
}

// Sensor Configuration Modal
function SensorConfigModal({ 
  sensor, 
  onClose, 
  onSave 
}: { 
  sensor: SensorData; 
  onClose: () => void;
  onSave: (sensor: SensorData) => void;
}) {
  const [config, setConfig] = useState(sensor.config);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configure {sensor.name}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Alert Threshold
            </label>
            <input
              type="number"
              value={config.minAlert}
              onChange={(e) => setConfig({ ...config, minAlert: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Alert Threshold
            </label>
            <input
              type="number"
              value={config.maxAlert}
              onChange={(e) => setConfig({ ...config, maxAlert: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calibration Offset
            </label>
            <input
              type="number"
              step="0.1"
              value={config.calibrationOffset}
              onChange={(e) => setConfig({ ...config, calibrationOffset: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Update Interval (seconds)
            </label>
            <input
              type="number"
              value={config.updateInterval}
              onChange={(e) => setConfig({ ...config, updateInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...sensor, config })}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}