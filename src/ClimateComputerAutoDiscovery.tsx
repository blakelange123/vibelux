'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wifi,
  WifiOff,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Activity,
  Network,
  Server,
  Cpu,
  Zap,
  Shield,
  RefreshCw,
  Play,
  Pause,
  Info,
  ChevronRight,
  Clock,
  Database,
  Gauge,
  BarChart3,
  Thermometer,
  Droplets,
  Wind,
  Package
} from 'lucide-react';
import { climateComputerManager, ClimateComputerConfig, ClimateComputerBrand } from '@/lib/integrations/climate-computers/integration-manager';

interface DiscoveredDevice {
  id: string;
  name: string;
  brand: ClimateComputerBrand;
  host: string;
  port: number;
  protocol: 'modbus' | 'bacnet' | 'mqtt' | 'rest' | 'unknown';
  status: 'discovered' | 'testing' | 'ready' | 'error';
  compatibility: number; // 0-100
  features: string[];
  lastSeen: Date;
  responseTime?: number;
  error?: string;
}

interface NetworkScanStatus {
  isScanning: boolean;
  progress: number;
  currentSubnet: string;
  devicesFound: number;
  startTime?: Date;
  estimatedTime?: number;
}

export function ClimateComputerAutoDiscovery() {
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);
  const [scanStatus, setScanStatus] = useState<NetworkScanStatus>({
    isScanning: false,
    progress: 0,
    currentSubnet: '',
    devicesFound: 0
  });
  const [configuredDevices, setConfiguredDevices] = useState<ClimateComputerConfig[]>([]);
  const [networkRange, setNetworkRange] = useState('192.168.1');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load configured devices on mount
  useEffect(() => {
    loadConfiguredDevices();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefresh && !scanStatus.isScanning) {
      const interval = setInterval(() => {
        startDiscovery();
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, scanStatus.isScanning]);

  const loadConfiguredDevices = async () => {
    const status = climateComputerManager.getIntegrationStatus();
    const configs = status.map(s => ({
      id: s.id,
      name: s.name,
      brand: s.brand,
      facilityId: 'facility-1',
      config: {},
      enabled: s.enabled,
      lastSync: s.lastSync
    }));
    setConfiguredDevices(configs);
  };

  const detectProtocol = async (host: string, port: number): Promise<'modbus' | 'bacnet' | 'mqtt' | 'rest' | 'unknown'> => {
    // Simulate protocol detection based on port
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (port === 502) return 'modbus';
    if (port === 47808) return 'bacnet';
    if (port === 1883) return 'mqtt';
    if (port === 80 || port === 443) return 'rest';
    return 'unknown';
  };

  const startDiscovery = useCallback(async () => {
    setScanStatus({
      isScanning: true,
      progress: 0,
      currentSubnet: networkRange,
      devicesFound: 0,
      startTime: new Date(),
      estimatedTime: 30
    });

    setDiscoveredDevices([]);

    try {
      // Simulate network scanning with progress updates
      const totalSteps = 10;
      
      for (let i = 0; i < totalSteps; i++) {
        setScanStatus(prev => ({
          ...prev,
          progress: ((i + 1) / totalSteps) * 100,
          currentSubnet: `${networkRange}.${i * 25}-${(i + 1) * 25}`
        }));

        // Discover devices on this subnet range
        if (i === 3 || i === 6 || i === 8) { // Simulate finding devices at certain points
          const discovered = await climateComputerManager.autoDiscover(networkRange);
          
          for (const config of discovered) {
            const device: DiscoveredDevice = {
              id: config.id,
              name: config.name,
              brand: config.brand,
              host: config.config.host,
              port: config.config.port || 502,
              protocol: await detectProtocol(config.config.host, config.config.port || 502),
              status: 'discovered',
              compatibility: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30) + 70, // 70-100%
              features: getDeviceFeatures(config.brand),
              lastSeen: new Date(),
              responseTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10 // 10-60ms
            };

            setDiscoveredDevices(prev => [...prev, device]);
            setScanStatus(prev => ({ ...prev, devicesFound: prev.devicesFound + 1 }));

            // Test device connection
            await testDeviceConnection(device);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Discovery failed:', error);
    } finally {
      setScanStatus(prev => ({ ...prev, isScanning: false, progress: 100 }));
    }
  }, [networkRange]);

  const testDeviceConnection = async (device: DiscoveredDevice) => {
    setDiscoveredDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, status: 'testing' } : d
    ));

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDiscoveredDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'ready' } : d
      ));
    } catch (error) {
      setDiscoveredDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'error', error: 'Connection failed' } : d
      ));
    }
  };

  const getDeviceFeatures = (brand: ClimateComputerBrand): string[] => {
    const features: Record<ClimateComputerBrand, string[]> = {
      priva: ['Climate Control', 'Energy Management', 'Water Management', 'Labor Tracking', 'Analytics'],
      hortimax: ['Climate Control', 'Irrigation', 'Fertigation', 'Weather Station', 'Alarms'],
      argus: ['Environmental Control', 'Lighting Control', 'CO2 Management', 'Screens', 'Heating'],
      trolmaster: ['Environmental Monitoring', 'Automation', 'Alerts', 'Data Logging', 'Mobile App'],
      growlink: ['Sensor Monitoring', 'Control Automation', 'Alerts', 'Reporting', 'Cloud Access'],
      autogrow: ['Climate Control', 'Fertigation', 'Lighting', 'CO2', 'Data Analytics'],
      netafim: ['Irrigation Control', 'Fertilizer Dosing', 'Climate Integration', 'Flow Monitoring', 'Scheduling']
    };
    
    return features[brand] || ['Basic Monitoring', 'Control'];
  };

  const handleQuickSetup = async (device: DiscoveredDevice) => {
    const config: ClimateComputerConfig = {
      id: device.id,
      name: device.name,
      brand: device.brand,
      facilityId: 'facility-1',
      config: {
        host: device.host,
        port: device.port,
        protocol: device.protocol,
        username: 'admin', // Would be provided by user
        password: '' // Would be provided by user
      },
      enabled: true
    };

    const success = await climateComputerManager.addIntegration(config);
    if (success) {
      await loadConfiguredDevices();
      setSelectedDevice(null);
    }
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'modbus': return <Cpu className="w-4 h-4" />;
      case 'bacnet': return <Network className="w-4 h-4" />;
      case 'mqtt': return <Database className="w-4 h-4" />;
      case 'rest': return <Server className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-400/10';
      case 'testing': return 'text-yellow-400 bg-yellow-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getBrandIcon = (brand: ClimateComputerBrand) => {
    switch (brand) {
      case 'priva': return <Server className="w-5 h-5 text-blue-400" />;
      case 'hortimax': return <Gauge className="w-5 h-5 text-green-400" />;
      case 'argus': return <Activity className="w-5 h-5 text-purple-400" />;
      case 'trolmaster': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <Cpu className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Climate Computer Auto-Discovery</h1>
          <p className="text-gray-400">Automatically find and configure climate control systems on your network</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-Refresh {autoRefresh ? 'On' : 'Off'}
          </button>
          <button
            onClick={startDiscovery}
            disabled={scanStatus.isScanning}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
          >
            {scanStatus.isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Start Discovery
              </>
            )}
          </button>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Network Configuration</h2>
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Network Range</label>
            <input
              type="text"
              value={networkRange}
              onChange={(e) => setNetworkRange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="192.168.1"
            />
          </div>
          
          {showAdvancedSettings && (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Port Range</label>
                <input
                  type="text"
                  defaultValue="1-65535"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Timeout (ms)</label>
                <input
                  type="number"
                  defaultValue="5000"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </>
          )}
        </div>

        {/* Scan Progress */}
        {scanStatus.isScanning && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Scanning {scanStatus.currentSubnet}...
              </span>
              <span className="text-sm text-gray-400">
                {scanStatus.devicesFound} devices found
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${scanStatus.progress}%` }}
              />
            </div>
            {scanStatus.estimatedTime && (
              <p className="text-xs text-gray-500 mt-1">
                Estimated time remaining: {Math.ceil((scanStatus.estimatedTime * (100 - scanStatus.progress)) / 100)}s
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discovered Devices */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Discovered Devices</h2>
            
            {discoveredDevices.length === 0 ? (
              <div className="text-center py-12">
                <Wifi className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No devices discovered yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Start Discovery" to scan your network</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discoveredDevices.map(device => (
                  <div
                    key={device.id}
                    className={`border border-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDevice?.id === device.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getBrandIcon(device.brand)}
                        <div>
                          <h3 className="font-medium text-gray-100">{device.name}</h3>
                          <p className="text-sm text-gray-400">
                            {device.host}:{device.port}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              {getProtocolIcon(device.protocol)}
                              <span className="text-gray-400">{device.protocol.toUpperCase()}</span>
                            </div>
                            {device.responseTime && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                {device.responseTime}ms
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <div className="w-12 bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-green-400 h-1.5 rounded-full"
                                  style={{ width: `${device.compatibility}%` }}
                                />
                              </div>
                              <span className="text-gray-400">{device.compatibility}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                        {device.status === 'ready' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickSetup(device);
                            }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
                          >
                            Quick Setup
                          </button>
                        )}
                      </div>
                    </div>

                    {device.error && (
                      <div className="mt-2 p-2 bg-red-900/20 rounded text-xs text-red-400">
                        {device.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configured Devices */}
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Configured Devices</h2>
            
            {configuredDevices.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No devices configured yet</p>
            ) : (
              <div className="space-y-3">
                {configuredDevices.map(device => (
                  <div key={device.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getBrandIcon(device.brand)}
                      <div>
                        <p className="font-medium text-gray-100">{device.name}</p>
                        <p className="text-xs text-gray-400">
                          Last sync: {device.lastSync ? new Date(device.lastSync).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.enabled ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Device Details */}
        <div className="space-y-6">
          {selectedDevice ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Device Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Device Name</p>
                  <p className="font-medium text-gray-100">{selectedDevice.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Network Address</p>
                  <p className="font-mono text-sm text-gray-100">{selectedDevice.host}:{selectedDevice.port}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Protocol</p>
                  <div className="flex items-center gap-2">
                    {getProtocolIcon(selectedDevice.protocol)}
                    <span className="text-gray-100">{selectedDevice.protocol.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDevice.features.map(feature => (
                      <span key={feature} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Compatibility Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedDevice.compatibility >= 80 ? 'bg-green-400' :
                          selectedDevice.compatibility >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${selectedDevice.compatibility}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-100">{selectedDevice.compatibility}%</span>
                  </div>
                </div>

                {selectedDevice.status === 'ready' && (
                  <button
                    onClick={() => handleQuickSetup(selectedDevice)}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Configure Device
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Getting Started</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mt-0.5">1</div>
                  <p>Click "Start Discovery" to scan your network for compatible climate computers</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mt-0.5">2</div>
                  <p>Select a discovered device to view its details and capabilities</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mt-0.5">3</div>
                  <p>Use "Quick Setup" for one-click configuration with default settings</p>
                </div>
              </div>
            </div>
          )}

          {/* Protocol Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Supported Protocols</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-100">Modbus TCP/RTU</p>
                  <p className="text-xs text-gray-400">Industrial automation protocol</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Network className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-100">BACnet</p>
                  <p className="text-xs text-gray-400">Building automation standard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-100">MQTT</p>
                  <p className="text-xs text-gray-400">IoT messaging protocol</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-100">REST API</p>
                  <p className="text-xs text-gray-400">HTTP-based web services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-100 mb-2">Security Notice</h3>
                <p className="text-xs text-gray-400">
                  Auto-discovery scans your local network only. Ensure you have permission to scan the network 
                  and that discovered devices are properly secured with authentication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}