'use client';

import React, { useState } from 'react';
import {
  Cable,
  Network,
  Radio,
  Wifi,
  Server,
  Database,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Settings,
  Download,
  Upload,
  Activity,
  Zap,
  Globe,
  Terminal,
  Code,
  Package,
  Box,
  Layers,
  GitBranch,
  RefreshCw,
  Play,
  Pause,
  Save,
  FileText,
  Key,
  Lock,
  Unlock,
  ChevronRight,
  Info,
  HelpCircle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown
} from 'lucide-react';

interface ProtocolConfig {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  version: string;
  description: string;
  icon: React.ElementType;
  config: Record<string, any>;
  statistics: {
    devices: number;
    messages: number;
    errors: number;
    uptime: number;
    lastActivity: Date;
  };
  features: string[];
  vendors?: string[];
}

interface DeviceMapping {
  id: string;
  deviceName: string;
  protocol: string;
  address: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: Date;
  tags: number;
}

export function EnhancedProtocolSupport() {
  const [activeTab, setActiveTab] = useState<'protocols' | 'mappings' | 'diagnostics'>('protocols');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('knx');
  const [testMode, setTestMode] = useState(false);

  // Enhanced protocol configurations
  const [protocols] = useState<Record<string, ProtocolConfig>>({
    'knx': {
      id: 'knx',
      name: 'KNX/EIB',
      type: 'Building Automation',
      status: 'active',
      version: '2.1',
      description: 'European standard for home and building control',
      icon: Network,
      config: {
        interface: 'KNXnet/IP',
        multicastAddress: '224.0.23.12',
        port: 3671,
        individualAddress: '1.1.255',
        connectionType: 'TUNNEL',
        natMode: false
      },
      statistics: {
        devices: 156,
        messages: 45821,
        errors: 12,
        uptime: 99.8,
        lastActivity: new Date()
      },
      features: [
        'Automatic device discovery',
        'Group address monitoring',
        'ETS project import',
        'Real-time telegram analysis',
        'Secure communication'
      ],
      vendors: ['ABB', 'Siemens', 'Schneider', 'Jung', 'Gira']
    },
    'mbus': {
      id: 'mbus',
      name: 'M-Bus',
      type: 'Meter Reading',
      status: 'active',
      version: '4.0',
      description: 'Meter-Bus for remote reading of utility meters',
      icon: Activity,
      config: {
        serialPort: '/dev/ttyUSB0',
        baudRate: 2400,
        parity: 'even',
        dataBits: 8,
        stopBits: 1,
        primaryAddressing: true,
        secondaryAddressing: true
      },
      statistics: {
        devices: 89,
        messages: 12456,
        errors: 3,
        uptime: 99.9,
        lastActivity: new Date()
      },
      features: [
        'Automatic meter scanning',
        'Multi-slave support',
        'Wireless M-Bus gateway',
        'Data encryption',
        'Batch reading'
      ],
      vendors: ['Kamstrup', 'Sensus', 'Itron', 'Diehl', 'Sontex']
    },
    'lonworks': {
      id: 'lonworks',
      name: 'LonWorks/LonMark',
      type: 'Building Automation',
      status: 'testing',
      version: '7.0',
      description: 'Echelon LonWorks building automation protocol',
      icon: GitBranch,
      config: {
        interfaceType: 'IP-852',
        channelId: 1,
        subnet: 1,
        node: 127,
        domain: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        authenticationEnabled: true
      },
      statistics: {
        devices: 45,
        messages: 8921,
        errors: 7,
        uptime: 98.5,
        lastActivity: new Date()
      },
      features: [
        'SNVT support',
        'Network management',
        'Device templates',
        'Binding management',
        'Schedule synchronization'
      ],
      vendors: ['Honeywell', 'Distech', 'Delta Controls', 'TAC']
    },
    'dali': {
      id: 'dali',
      name: 'DALI',
      type: 'Lighting Control',
      status: 'active',
      version: '2.0',
      description: 'Digital Addressable Lighting Interface',
      icon: Zap,
      config: {
        busVoltage: 16,
        maxDevices: 64,
        groups: 16,
        scenes: 16,
        fadeTime: 1.0,
        broadcastEnabled: true
      },
      statistics: {
        devices: 128,
        messages: 34567,
        errors: 2,
        uptime: 99.95,
        lastActivity: new Date()
      },
      features: [
        'Individual ballast control',
        'Group and scene management',
        'Emergency lighting',
        'Energy monitoring',
        'Tunable white control'
      ],
      vendors: ['Osram', 'Philips', 'Tridonic', 'Helvar']
    },
    'enocean': {
      id: 'enocean',
      name: 'EnOcean',
      type: 'Wireless Sensors',
      status: 'active',
      version: '3.0',
      description: 'Energy harvesting wireless sensor technology',
      icon: Radio,
      config: {
        frequency: '868.3',
        serialPort: '/dev/ttyUSB1',
        baseId: '0x00000000',
        remainingWriteCycles: 10,
        repeaterLevel: 2
      },
      statistics: {
        devices: 234,
        messages: 56789,
        errors: 5,
        uptime: 99.7,
        lastActivity: new Date()
      },
      features: [
        'Battery-free operation',
        'Secure communication',
        'Repeater support',
        'Teach-in automation',
        'EEP profiles'
      ],
      vendors: ['EnOcean', 'Eltako', 'Omnio', 'Thermokon']
    }
  });

  // Device mappings
  const [deviceMappings] = useState<DeviceMapping[]>([
    {
      id: 'dm-1',
      deviceName: 'Zone 1 Climate Sensor',
      protocol: 'KNX',
      address: '1.1.15',
      status: 'online',
      lastSeen: new Date(),
      tags: 15
    },
    {
      id: 'dm-2',
      deviceName: 'Water Meter Main',
      protocol: 'M-Bus',
      address: '0x12345678',
      status: 'online',
      lastSeen: new Date(),
      tags: 8
    },
    {
      id: 'dm-3',
      deviceName: 'Lighting Controller A',
      protocol: 'DALI',
      address: '0-31',
      status: 'online',
      lastSeen: new Date(),
      tags: 32
    },
    {
      id: 'dm-4',
      deviceName: 'Wireless Temp Sensor',
      protocol: 'EnOcean',
      address: '0x01234567',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
      tags: 4
    }
  ]);

  const currentProtocol = protocols[selectedProtocol];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
        return 'text-green-500';
      case 'testing':
        return 'text-yellow-500';
      case 'inactive':
      case 'offline':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
        return CheckCircle;
      case 'testing':
        return Clock;
      case 'inactive':
      case 'offline':
        return XCircle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Cable className="w-8 h-8 text-blue-500" />
              Enhanced Protocol Support
            </h2>
            <p className="text-gray-400 mt-1">
              Extended integration with KNX, M-Bus, LonWorks, DALI, and more
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Test Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </label>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Add Protocol
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
          {['protocols', 'mappings', 'diagnostics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'protocols' && (
        <>
          {/* Protocol Grid */}
          <div className="grid grid-cols-5 gap-4">
            {Object.values(protocols).map((protocol) => {
              const Icon = protocol.icon;
              const StatusIcon = getStatusIcon(protocol.status);
              
              return (
                <button
                  key={protocol.id}
                  onClick={() => setSelectedProtocol(protocol.id)}
                  className={`bg-gray-900 rounded-lg border p-4 transition-all ${
                    selectedProtocol === protocol.id
                      ? 'border-purple-500'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-8 h-8 text-gray-400" />
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(protocol.status)}`} />
                  </div>
                  <h3 className="text-white font-medium text-left">{protocol.name}</h3>
                  <p className="text-gray-400 text-xs text-left mt-1">{protocol.type}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">v{protocol.version}</span>
                    <span className="text-xs text-gray-400">{protocol.statistics.devices} devices</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Protocol Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{currentProtocol.name} Configuration</h3>
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-3">{currentProtocol.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(currentProtocol.config).slice(0, 6).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-white ml-2">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Features</h4>
                  {currentProtocol.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {currentProtocol.vendors && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Supported Vendors</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentProtocol.vendors.map((vendor) => (
                        <span key={vendor} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                          {vendor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Protocol Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-400">Devices</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{currentProtocol.statistics.devices}</p>
                  <p className="text-green-400 text-xs mt-1">+12 this week</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-400">Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{currentProtocol.statistics.messages.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs mt-1">Last 24h</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-xs text-gray-400">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{currentProtocol.statistics.errors}</p>
                  <p className="text-red-400 text-xs mt-1">0.02% error rate</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-xs text-gray-400">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{currentProtocol.statistics.uptime}%</p>
                  <p className="text-gray-400 text-xs mt-1">30 days</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" />
                  Start Discovery
                </button>
                <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Restart Service
                </button>
                <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  Export Configuration
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'mappings' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Device Protocol Mappings</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Device Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Protocol</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Address</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Tags</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Seen</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deviceMappings.map((mapping) => {
                  const StatusIcon = getStatusIcon(mapping.status);
                  return (
                    <tr key={mapping.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-white">{mapping.deviceName}</td>
                      <td className="py-3 px-4 text-gray-300">{mapping.protocol}</td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-sm">{mapping.address}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(mapping.status)}`} />
                          <span className={`text-sm capitalize ${getStatusColor(mapping.status)}`}>
                            {mapping.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{mapping.tags}</td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {mapping.lastSeen.toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Protocol Health Check</h3>
            <div className="space-y-3">
              {Object.values(protocols).map((protocol) => {
                const Icon = protocol.icon;
                const StatusIcon = getStatusIcon(protocol.status);
                
                return (
                  <div key={protocol.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="text-white font-medium">{protocol.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(protocol.status)}`} />
                        <span className={`text-sm capitalize ${getStatusColor(protocol.status)}`}>
                          {protocol.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                      <span>{protocol.statistics.devices} devices</span>
                      <span>{protocol.statistics.uptime}% uptime</span>
                      <span>{protocol.statistics.errors} errors</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Communication Log</h3>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs text-gray-300 h-64 overflow-y-auto">
              <p className="text-green-400">[2024-01-15 10:23:45] KNX: Device discovery started</p>
              <p className="text-gray-300">[2024-01-15 10:23:46] KNX: Found device at 1.1.15</p>
              <p className="text-gray-300">[2024-01-15 10:23:47] KNX: Found device at 1.1.16</p>
              <p className="text-yellow-400">[2024-01-15 10:23:48] M-Bus: Retry connection to 0x12345678</p>
              <p className="text-gray-300">[2024-01-15 10:23:49] M-Bus: Connection established</p>
              <p className="text-blue-400">[2024-01-15 10:23:50] DALI: Scene 1 activated</p>
              <p className="text-gray-300">[2024-01-15 10:23:51] EnOcean: Temperature update from 0x01234567</p>
              <p className="text-red-400">[2024-01-15 10:23:52] EnOcean: Device 0x01234567 offline</p>
              <p className="text-gray-300">[2024-01-15 10:23:53] LonWorks: Testing connection...</p>
              <p className="text-green-400">[2024-01-15 10:23:54] System: All protocols operational</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}