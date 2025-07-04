'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Server,
  Cpu,
  Database,
  Link2,
  Check,
  X,
  AlertCircle,
  Settings,
  RefreshCw,
  Plus,
  Network,
  Zap,
  Activity,
  Shield,
  Terminal,
  Cable,
  Radio,
  Thermometer
} from 'lucide-react';

interface DeviceConnection {
  id: string;
  name: string;
  type: 'bacnet' | 'modbus' | 'mqtt' | 'opcua' | 'api' | 'knx' | 'zigbee' | 'lora';
  protocol: string;
  ipAddress?: string;
  port?: number;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSeen: string;
  deviceCount: number;
  dataPoints: number;
  pollRate: number; // seconds
  config?: any;
}

interface DeviceType {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  connectionId: string;
  points: DataPoint[];
  status: 'online' | 'offline' | 'error';
}

interface DataPoint {
  id: string;
  name: string;
  type: 'analog' | 'digital' | 'multi-state';
  value: any;
  unit?: string;
  writable: boolean;
  address: string;
}

export function DeviceIntegrationCenter() {
  const [connections, setConnections] = useState<DeviceConnection[]>([
    {
      id: 'bac1',
      name: 'Main BACnet Network',
      type: 'bacnet',
      protocol: 'BACnet/IP',
      ipAddress: '192.168.1.100',
      port: 47808,
      status: 'connected',
      lastSeen: '2 seconds ago',
      deviceCount: 24,
      dataPoints: 847,
      pollRate: 5
    },
    {
      id: 'mod1',
      name: 'Irrigation Controllers',
      type: 'modbus',
      protocol: 'Modbus TCP',
      ipAddress: '192.168.1.201',
      port: 502,
      status: 'connected',
      lastSeen: '1 second ago',
      deviceCount: 8,
      dataPoints: 256,
      pollRate: 2
    },
    {
      id: 'mqtt1',
      name: 'Sensor Network',
      type: 'mqtt',
      protocol: 'MQTT',
      ipAddress: '192.168.1.50',
      port: 1883,
      status: 'connected',
      lastSeen: 'Real-time',
      deviceCount: 48,
      dataPoints: 192,
      pollRate: 1
    },
    {
      id: 'opc1',
      name: 'HVAC System',
      type: 'opcua',
      protocol: 'OPC UA',
      ipAddress: '192.168.1.150',
      port: 4840,
      status: 'error',
      lastSeen: '5 minutes ago',
      deviceCount: 12,
      dataPoints: 324,
      pollRate: 10
    }
  ]);

  const [selectedConnection, setSelectedConnection] = useState<string | null>('bac1');
  const [showAddConnection, setShowAddConnection] = useState(false);

  const getProtocolIcon = (type: string) => {
    switch (type) {
      case 'bacnet':
        return <Network className="w-5 h-5" />;
      case 'modbus':
        return <Cpu className="w-5 h-5" />;
      case 'mqtt':
        return <Radio className="w-5 h-5" />;
      case 'opcua':
        return <Server className="w-5 h-5" />;
      case 'api':
        return <Link2 className="w-5 h-5" />;
      case 'knx':
        return <Cable className="w-5 h-5" />;
      case 'zigbee':
        return <Wifi className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'disconnected':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'configuring':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-gray-500';
    }
  };

  const bacnetDevices = [
    { id: 101, name: 'AHU-1', type: 'Air Handler', points: 42 },
    { id: 102, name: 'AHU-2', type: 'Air Handler', points: 42 },
    { id: 201, name: 'VAV-01', type: 'VAV Box', points: 12 },
    { id: 202, name: 'VAV-02', type: 'VAV Box', points: 12 },
    { id: 301, name: 'CHILLER-1', type: 'Chiller', points: 38 },
    { id: 401, name: 'LIGHTS-Z1', type: 'Lighting Controller', points: 24 },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Device Integration Center</h1>
            <p className="text-gray-400">Manage and monitor all connected equipment and protocols</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Add Connection
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Connections</span>
              <Network className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">{connections.length}</p>
            <p className="text-xs text-green-400 mt-1">
              {connections.filter(c => c.status === 'connected').length} active
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Devices</span>
              <Cpu className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">
              {connections.reduce((sum, c) => sum + c.deviceCount, 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Across all protocols</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Data Points</span>
              <Database className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">
              {connections.reduce((sum, c) => sum + c.dataPoints, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Real-time monitoring</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Data Rate</span>
              <Activity className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white">2.4k</p>
            <p className="text-xs text-gray-400 mt-1">Points/second</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Connection List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Protocol Connections</h2>
            </div>
            <div className="p-4 space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  onClick={() => setSelectedConnection(connection.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedConnection === connection.id
                      ? 'bg-gray-800 border-purple-500'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getProtocolIcon(connection.type)}
                      <div>
                        <h3 className="text-white font-medium">{connection.name}</h3>
                        <p className="text-gray-400 text-sm">{connection.protocol}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Devices</p>
                      <p className="text-white font-medium">{connection.deviceCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Points</p>
                      <p className="text-white font-medium">{connection.dataPoints}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Poll Rate</p>
                      <p className="text-white font-medium">{connection.pollRate}s</p>
                    </div>
                  </div>
                  {connection.ipAddress && (
                    <p className="text-xs text-gray-500 mt-2">
                      {connection.ipAddress}:{connection.port}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connection Details */}
          <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-800">
            {selectedConnection && (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {connections.find(c => c.id === selectedConnection)?.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded flex items-center gap-2 transition-colors">
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded flex items-center gap-2 transition-colors">
                      <Terminal className="w-3 h-3" />
                      Console
                    </button>
                  </div>
                </div>

                {/* Connection Configuration */}
                {selectedConnection === 'bac1' && (
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-4">BACnet Configuration</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-400 text-sm">Network Address</label>
                        <input
                          type="text"
                          value="192.168.1.100"
                          className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-400 text-sm">UDP Port</label>
                        <input
                          type="text"
                          value="47808"
                          className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-400 text-sm">Device Instance</label>
                        <input
                          type="text"
                          value="1234"
                          className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <label className="text-gray-400 text-sm">Max APDU</label>
                        <input
                          type="text"
                          value="1476"
                          className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Device List */}
                    <h3 className="text-white font-medium mb-4">Discovered Devices</h3>
                    <div className="space-y-2">
                      {bacnetDevices.map((device) => (
                        <div key={device.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-white font-medium">{device.name}</p>
                              <p className="text-gray-400 text-sm">Device ID: {device.id} • {device.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-white font-medium">{device.points}</p>
                              <p className="text-gray-400 text-xs">points</p>
                            </div>
                            <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
                              Configure
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Protocol Configurations */}
                {selectedConnection === 'mod1' && (
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-4">Modbus TCP Configuration</h3>
                    <div className="text-center text-gray-400 py-8">
                      <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p>Modbus configuration interface</p>
                    </div>
                  </div>
                )}

                {selectedConnection === 'mqtt1' && (
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-4">MQTT Broker Configuration</h3>
                    <div className="text-center text-gray-400 py-8">
                      <Radio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p>MQTT configuration interface</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Data Flow Visualization */}
        <div className="mt-8 bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Real-time Data Flow</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Temperature Points</span>
                <Thermometer className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-white">248</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-green-400">All sensors reporting</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Control Outputs</span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">86</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">Manual override on 3</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Alarms Active</span>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-white">3</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <X className="w-3 h-3 text-red-400" />
                <span className="text-red-400">2 critical, 1 warning</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Network Health</span>
                <Wifi className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">98.7%</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}