/**
 * IoT Sensor Integration Management Page
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Wifi, 
  Radio, 
  Settings, 
  Plus, 
  Search, 
  Battery, 
  Signal, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Gauge,
  Thermometer,
  Droplets,
  Zap,
  Camera,
  Shield,
  Activity
} from 'lucide-react';

interface SensorDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel?: number;
  signalStrength?: number;
  lastReading: {
    value: number;
    unit: string;
    timestamp: Date;
  };
  location: {
    roomId: string;
    zone?: string;
  };
}

interface DiscoveredDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  address: string;
  rssi?: number;
}

export default function SensorIntegrationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery' | 'devices' | 'analytics'>('overview');
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryType, setDiscoveryType] = useState<'wifi' | 'zigbee' | 'modbus'>('wifi');

  useEffect(() => {
    // Load existing devices
    loadDevices();
  }, []);

  const loadDevices = async () => {
    // Mock data - in production would fetch from API
    setDevices([
      {
        id: 'TEMP-001',
        name: 'Main Room Temperature',
        type: 'temperature',
        manufacturer: 'SensorTech',
        status: 'online',
        batteryLevel: 85,
        signalStrength: -45,
        lastReading: { value: 76.2, unit: '°F', timestamp: new Date() },
        location: { roomId: 'room-1' }
      },
      {
        id: 'HUM-001',
        name: 'Main Room Humidity',
        type: 'humidity',
        manufacturer: 'SensorTech',
        status: 'online',
        batteryLevel: 92,
        signalStrength: -38,
        lastReading: { value: 62.5, unit: '%RH', timestamp: new Date() },
        location: { roomId: 'room-1' }
      },
      {
        id: 'CO2-001',
        name: 'CO2 Monitor',
        type: 'co2',
        manufacturer: 'AirQuality Pro',
        status: 'offline',
        signalStrength: -85,
        lastReading: { value: 980, unit: 'ppm', timestamp: new Date(Date.now() - 300000) },
        location: { roomId: 'room-1' }
      },
      {
        id: 'PPFD-001',
        name: 'Light Sensor',
        type: 'ppfd',
        manufacturer: 'LightMeter',
        status: 'online',
        batteryLevel: 78,
        signalStrength: -52,
        lastReading: { value: 825, unit: 'μmol/m²/s', timestamp: new Date() },
        location: { roomId: 'room-1' }
      },
      {
        id: 'PH-001',
        name: 'pH Sensor',
        type: 'ph',
        manufacturer: 'NutriSense',
        status: 'error',
        batteryLevel: 15,
        signalStrength: -62,
        lastReading: { value: 6.1, unit: 'pH', timestamp: new Date(Date.now() - 600000) },
        location: { roomId: 'room-1' }
      }
    ]);
  };

  const discoverDevices = async () => {
    setIsDiscovering(true);
    setDiscoveredDevices([]);

    try {
      // Simulate device discovery
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockDiscovered: DiscoveredDevice[] = [
        {
          id: 'SOIL-ZB-001',
          name: 'GrowSense Soil Moisture',
          type: 'soil_moisture',
          manufacturer: 'GrowSense',
          model: 'GS-SOIL-ZB',
          address: '0x00124B0021C64F47',
          rssi: -55
        },
        {
          id: 'EC-ZB-001', 
          name: 'EC Sensor Pro',
          type: 'ec',
          manufacturer: 'NutriSense',
          model: 'NS-EC-ZB',
          address: '0x00124B0021C64F48',
          rssi: -48
        },
        {
          id: 'FLOW-MB-001',
          name: 'Flow Rate Monitor',
          type: 'flow_rate',
          manufacturer: 'FlowTech',
          model: 'FT-FLOW-485',
          address: '192.168.1.250:502'
        }
      ];

      setDiscoveredDevices(mockDiscovered);
    } finally {
      setIsDiscovering(false);
    }
  };

  const addDevice = async (discovered: DiscoveredDevice) => {
    // Mock adding device
    const newDevice: SensorDevice = {
      id: discovered.id,
      name: discovered.name,
      type: discovered.type,
      manufacturer: discovered.manufacturer,
      status: 'online',
      batteryLevel: 100,
      signalStrength: discovered.rssi || -50,
      lastReading: { value: 0, unit: '', timestamp: new Date() },
      location: { roomId: 'room-1' }
    };

    setDevices(prev => [...prev, newDevice]);
    setDiscoveredDevices(prev => prev.filter(d => d.id !== discovered.id));
  };

  const getSensorIcon = (type: string) => {
    const iconMap = {
      temperature: Thermometer,
      humidity: Droplets,
      co2: Activity,
      ppfd: Zap,
      ph: Gauge,
      ec: Gauge,
      soil_moisture: Droplets,
      flow_rate: Activity,
      motion: Camera,
      door_sensor: Shield
    };
    
    const Icon = iconMap[type as keyof typeof iconMap] || Settings;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const errorCount = devices.filter(d => d.status === 'error').length;
  const batteryLowCount = devices.filter(d => d.batteryLevel && d.batteryLevel < 20).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IoT Sensor Integration</h1>
          <p className="mt-2 text-gray-600">
            Discover, configure, and monitor your cultivation sensors
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Activity },
              { id: 'discovery', name: 'Device Discovery', icon: Search },
              { id: 'devices', name: 'Devices', icon: Settings },
              { id: 'analytics', name: 'Analytics', icon: Gauge }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Online</p>
                    <p className="text-2xl font-bold text-gray-900">{onlineCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Offline</p>
                    <p className="text-2xl font-bold text-gray-900">{offlineCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Error</p>
                    <p className="text-2xl font-bold text-gray-900">{errorCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Battery className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Battery</p>
                    <p className="text-2xl font-bold text-gray-900">{batteryLowCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">pH Sensor - Low Battery</p>
                      <p className="text-sm text-red-600">Battery level at 15% - replace soon</p>
                    </div>
                    <span className="ml-auto text-xs text-red-500">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">CO2 Monitor - Offline</p>
                      <p className="text-sm text-yellow-600">No readings received for 5 minutes</p>
                    </div>
                    <span className="ml-auto text-xs text-yellow-500">5 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Device Discovery</h3>
                <p className="text-sm text-gray-600">Scan for new IoT sensors on your network</p>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Protocol:</label>
                    <select
                      value={discoveryType}
                      onChange={(e) => setDiscoveryType(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="wifi">WiFi / Ethernet</option>
                      <option value="zigbee">Zigbee Mesh</option>
                      <option value="modbus">Modbus TCP</option>
                    </select>
                  </div>

                  <button
                    onClick={discoverDevices}
                    disabled={isDiscovering}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                    <span>{isDiscovering ? 'Discovering...' : 'Start Discovery'}</span>
                  </button>
                </div>

                {isDiscovering && (
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">
                      Scanning for {discoveryType} devices...
                    </span>
                  </div>
                )}

                {discoveredDevices.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Discovered Devices ({discoveredDevices.length})</h4>
                    {discoveredDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getSensorIcon(device.type)}
                          <div>
                            <p className="font-medium text-gray-900">{device.name}</p>
                            <p className="text-sm text-gray-600">
                              {device.manufacturer} {device.model}
                            </p>
                            <p className="text-xs text-gray-500">{device.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {device.rssi && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Signal className="h-4 w-4" />
                              <span>{device.rssi} dBm</span>
                            </div>
                          )}
                          <button
                            onClick={() => addDevice(device)}
                            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Device Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Reading
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Battery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getSensorIcon(device.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{device.name}</div>
                            <div className="text-sm text-gray-500">{device.manufacturer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(device.status)}
                          <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>
                            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {device.lastReading.value} {device.lastReading.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.floor((Date.now() - device.lastReading.timestamp.getTime()) / 60000)} min ago
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {device.batteryLevel ? (
                          <div className="flex items-center space-x-2">
                            <Battery className={`h-4 w-4 ${
                              device.batteryLevel > 50 ? 'text-green-600' : 
                              device.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                            <span className="text-sm text-gray-900">{device.batteryLevel}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Wired</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {device.signalStrength && (
                          <div className="flex items-center space-x-2">
                            <Signal className={`h-4 w-4 ${
                              device.signalStrength > -50 ? 'text-green-600' : 
                              device.signalStrength > -70 ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                            <span className="text-sm text-gray-900">{device.signalStrength} dBm</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Configure
                        </button>
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          Calibrate
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sensor Analytics</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Real-time data visualization, correlations, and predictive insights coming soon.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Enable Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}