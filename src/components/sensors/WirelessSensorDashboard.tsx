'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { WirelessNetworkManager, WirelessSensor, SensorReading } from '@/lib/sensors/wireless-network-manager';

const networkManager = new WirelessNetworkManager();

export function WirelessSensorDashboard() {
  const [sensors, setSensors] = useState<WirelessSensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<WirelessSensor | null>(null);
  const [networkHealth, setNetworkHealth] = useState<any>({});
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [showSignalMap, setShowSignalMap] = useState(false);
  const [discoveredSensors, setDiscoveredSensors] = useState<WirelessSensor[]>([]);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'low-battery'>('all');

  useEffect(() => {
    // Load initial data
    loadSensors();
    updateNetworkHealth();

    // Subscribe to events
    networkManager.on('sensorReading', ({ sensor, reading }) => {
      setSensors(prev => prev.map(s => s.id === sensor.id ? sensor : s));
    });

    networkManager.on('sensorAlert', ({ sensor, alert }) => {
    });

    networkManager.on('sensorOffline', (sensor) => {
      setSensors(prev => prev.map(s => s.id === sensor.id ? { ...s, status: 'offline' } : s));
    });

    networkManager.on('sensorReconnected', (sensor) => {
      setSensors(prev => prev.map(s => s.id === sensor.id ? { ...s, status: 'online' } : s));
    });

    const interval = setInterval(() => {
      updateNetworkHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadSensors = () => {
    const topology = networkManager.getNetworkTopology();
    setSensors(topology.sensors);
  };

  const updateNetworkHealth = () => {
    setNetworkHealth(networkManager.getNetworkHealth());
  };

  const discoverNewSensors = async () => {
    const discovered = await networkManager.discoverSensors();
    setDiscoveredSensors(discovered);
    setShowAddSensor(true);
  };

  const addDiscoveredSensor = async (sensor: WirelessSensor) => {
    await networkManager.addSensor(sensor);
    loadSensors();
    setShowAddSensor(false);
  };

  const getFilteredSensors = () => {
    switch (filter) {
      case 'online':
        return sensors.filter(s => s.status === 'online');
      case 'offline':
        return sensors.filter(s => s.status === 'offline');
      case 'low-battery':
        return sensors.filter(s => s.battery < 20);
      default:
        return sensors;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'co2': return Wind;
      case 'light': return Sun;
      default: return Activity;
    }
  };

  const getSignalQuality = (strength: number) => {
    if (strength > -60) return { label: 'Excellent', color: 'text-green-400' };
    if (strength > -70) return { label: 'Good', color: 'text-blue-400' };
    if (strength > -80) return { label: 'Fair', color: 'text-yellow-400' };
    return { label: 'Poor', color: 'text-red-400' };
  };

  const getBatteryIcon = (level: number) => {
    if (level < 20) return { icon: BatteryLow, color: 'text-red-400' };
    if (level < 50) return { icon: Battery, color: 'text-yellow-400' };
    return { icon: Battery, color: 'text-green-400' };
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wireless Sensor Network</h1>
          <p className="text-gray-400">Monitor and manage your wireless sensor infrastructure</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={discoverNewSensors}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sensor
          </button>
          
          <button
            onClick={() => setShowSignalMap(true)}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Signal Map
          </button>
        </div>
      </div>

      {/* Network Health */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Sensors</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{networkHealth.totalSensors || 0}</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Online</span>
            <Wifi className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">{networkHealth.onlineSensors || 0}</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Low Battery</span>
            <BatteryLow className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">{networkHealth.lowBatterySensors || 0}</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Weak Signal</span>
            <Signal className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{networkHealth.weakSignalSensors || 0}</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Signal</span>
            <Signal className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{networkHealth.averageSignalStrength?.toFixed(0) || 0} dBm</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Gateway Load</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{networkHealth.gatewayUtilization?.toFixed(0) || 0}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'online', 'offline', 'low-battery'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Sensor Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredSensors().map(sensor => {
          const Icon = getSensorIcon(sensor.type);
          const signalQuality = getSignalQuality(sensor.signalStrength);
          const batteryInfo = getBatteryIcon(sensor.battery);
          const BatteryIcon = batteryInfo.icon;
          const latestReading = networkManager.getLatestReading(sensor.id);

          return (
            <div
              key={sensor.id}
              className={`bg-gray-900 rounded-xl p-6 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all ${
                sensor.status === 'offline' ? 'opacity-60' : ''
              }`}
              onClick={() => setSelectedSensor(sensor)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    sensor.status === 'online' ? 'bg-green-600/20' : 'bg-red-600/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      sensor.status === 'online' ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{sensor.name}</h3>
                    <p className="text-sm text-gray-400">{sensor.location.room}</p>
                  </div>
                </div>
                {sensor.status === 'offline' && <WifiOff className="w-5 h-5 text-red-400" />}
              </div>

              {/* Latest Readings */}
              {latestReading && sensor.status === 'online' && (
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {latestReading.values.temperature && (
                    <div>
                      <span className="text-gray-400">Temp:</span>
                      <span className="ml-1 font-medium">{latestReading.values.temperature.toFixed(1)}°F</span>
                    </div>
                  )}
                  {latestReading.values.humidity && (
                    <div>
                      <span className="text-gray-400">RH:</span>
                      <span className="ml-1 font-medium">{latestReading.values.humidity.toFixed(0)}%</span>
                    </div>
                  )}
                  {latestReading.values.co2 && (
                    <div>
                      <span className="text-gray-400">CO₂:</span>
                      <span className="ml-1 font-medium">{latestReading.values.co2.toFixed(0)} ppm</span>
                    </div>
                  )}
                  {latestReading.values.vpd && (
                    <div>
                      <span className="text-gray-400">VPD:</span>
                      <span className="ml-1 font-medium">{latestReading.values.vpd.toFixed(2)} kPa</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <Signal className={`w-4 h-4 ${signalQuality.color}`} />
                  <span className="text-sm">{signalQuality.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BatteryIcon className={`w-4 h-4 ${batteryInfo.color}`} />
                  <span className="text-sm">{sensor.battery}%</span>
                </div>
              </div>

              {/* Alerts */}
              {sensor.alerts.filter(a => !a.acknowledged).length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{sensor.alerts.filter(a => !a.acknowledged).length} active alerts</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedSensor.name}</h2>
                  <p className="text-gray-400">ID: {selectedSensor.id} | MAC: {selectedSensor.macAddress}</p>
                </div>
                <button
                  onClick={() => setSelectedSensor(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sensor Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Device Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="capitalize">{selectedSensor.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Firmware</span>
                      <span>{selectedSensor.firmware}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Battery Life</span>
                      <span>~{networkManager.estimateBatteryLife(selectedSensor.id)} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Seen</span>
                      <span>{new Date(selectedSensor.lastSeen).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Room</span>
                      <span>{selectedSensor.location.room}</span>
                    </div>
                    {selectedSensor.location.zone && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Zone</span>
                        <span>{selectedSensor.location.zone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position</span>
                      <span>
                        X:{selectedSensor.location.position.x}, 
                        Y:{selectedSensor.location.position.y}, 
                        Z:{selectedSensor.location.position.z}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              {selectedSensor.alerts.filter(a => !a.acknowledged).length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Active Alerts</h3>
                  <div className="space-y-2">
                    {selectedSensor.alerts.filter(a => !a.acknowledged).map(alert => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          alert.severity === 'critical' ? 'bg-red-900/20 border border-red-600' :
                          alert.severity === 'warning' ? 'bg-yellow-900/20 border border-yellow-600' :
                          'bg-blue-900/20 border border-blue-600'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => networkManager.acknowledgeAlert(selectedSensor.id, alert.id)}
                          className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          Acknowledge
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Configure
                </button>
                <button className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Calibrate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Sensor Modal */}
      {showAddSensor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Add New Sensor</h2>
              <p className="text-gray-400 text-sm mt-1">
                {discoveredSensors.length} sensor(s) discovered
              </p>
            </div>

            <div className="p-6">
              {discoveredSensors.length === 0 ? (
                <div className="text-center py-8">
                  <WifiOff className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No new sensors found</p>
                  <button
                    onClick={discoverNewSensors}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan Again
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {discoveredSensors.map(sensor => (
                    <div
                      key={sensor.id}
                      className="p-4 bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{sensor.type} Sensor</p>
                        <p className="text-sm text-gray-400">MAC: {sensor.macAddress}</p>
                      </div>
                      <button
                        onClick={() => addDiscoveredSensor(sensor)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowAddSensor(false)}
                className="w-full mt-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}