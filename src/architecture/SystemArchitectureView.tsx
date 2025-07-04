'use client';

import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Cpu,
  Database,
  Network,
  Shield,
  Activity,
  Globe,
  Layers,
  GitBranch,
  Zap,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  HardDrive,
  Wifi,
  Radio,
  Cable,
  CircuitBoard,
  Router,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  FileText,
  Terminal,
  Code,
  Package,
  Box,
  Gauge,
  Heart,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero
} from 'lucide-react';

interface TierComponent {
  id: string;
  name: string;
  type: 'service' | 'database' | 'protocol' | 'device' | 'interface';
  status: 'online' | 'degraded' | 'offline' | 'maintenance';
  icon: React.ElementType;
  metrics?: {
    latency?: number;
    throughput?: string;
    uptime?: number;
    connections?: number;
  };
  connections: string[];
}

interface DataFlow {
  from: string;
  to: string;
  protocol: string;
  volume: 'low' | 'medium' | 'high';
  type: 'realtime' | 'batch' | 'stream';
}

export function SystemArchitectureView() {
  const [selectedTier, setSelectedTier] = useState<'management' | 'automation' | 'field'>('management');
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    management: false,
    automation: false,
    field: false
  });

  const handleExportDiagram = () => {
    // Export diagram as SVG/PNG
    const diagramElement = document.querySelector('.architecture-diagram');
    if (diagramElement) {
      // Create a simple text export for now (could be enhanced with canvas/svg export)
      const exportData = {
        timestamp: new Date().toISOString(),
        selectedTier,
        architecture: tiers,
        dataFlow: showDataFlow
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `vibelux-architecture-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const toggleTierExpansion = (tierKey: string) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tierKey]: !prev[tierKey]
    }));
  };

  // Three-tier architecture components
  const tiers = {
    management: {
      name: 'Management Layer',
      description: 'Cloud services, analytics, and user interfaces',
      color: 'purple',
      components: [
        {
          id: 'web-app',
          name: 'Web Application',
          type: 'interface' as const,
          status: 'online' as const,
          icon: Globe,
          metrics: { uptime: 99.99, connections: 1247 },
          connections: ['api-gateway', 'auth-service']
        },
        {
          id: 'mobile-app',
          name: 'Mobile Apps',
          type: 'interface' as const,
          status: 'online' as const,
          icon: Smartphone,
          metrics: { uptime: 99.95, connections: 523 },
          connections: ['api-gateway']
        },
        {
          id: 'api-gateway',
          name: 'API Gateway',
          type: 'service' as const,
          status: 'online' as const,
          icon: GitBranch,
          metrics: { latency: 23, throughput: '2.4k req/s' },
          connections: ['auth-service', 'data-service', 'analytics-engine']
        },
        {
          id: 'analytics-engine',
          name: 'Analytics Engine',
          type: 'service' as const,
          status: 'online' as const,
          icon: BarChart3,
          metrics: { latency: 145, throughput: '850 MB/s' },
          connections: ['time-series-db', 'ml-service']
        },
        {
          id: 'ml-service',
          name: 'ML Service',
          type: 'service' as const,
          status: 'online' as const,
          icon: Cpu,
          metrics: { latency: 89, throughput: '120 pred/s' },
          connections: ['time-series-db']
        },
        {
          id: 'auth-service',
          name: 'Auth Service',
          type: 'service' as const,
          status: 'online' as const,
          icon: Lock,
          metrics: { latency: 12, uptime: 100 },
          connections: ['user-db']
        }
      ]
    },
    automation: {
      name: 'Automation Layer',
      description: 'Edge computing, control logic, and protocol conversion',
      color: 'blue',
      components: [
        {
          id: 'edge-controller',
          name: 'Edge Controller',
          type: 'service' as const,
          status: 'online' as const,
          icon: Server,
          metrics: { latency: 5, connections: 847 },
          connections: ['bacnet-gateway', 'modbus-gateway', 'mqtt-broker']
        },
        {
          id: 'bacnet-gateway',
          name: 'BACnet Gateway',
          type: 'protocol' as const,
          status: 'online' as const,
          icon: Network,
          metrics: { connections: 124, throughput: '2.1 MB/s' },
          connections: ['hvac-controller', 'lighting-controller']
        },
        {
          id: 'modbus-gateway',
          name: 'Modbus Gateway',
          type: 'protocol' as const,
          status: 'online' as const,
          icon: CircuitBoard,
          metrics: { connections: 67, throughput: '850 KB/s' },
          connections: ['plc-1', 'plc-2', 'vfd-array']
        },
        {
          id: 'mqtt-broker',
          name: 'MQTT Broker',
          type: 'protocol' as const,
          status: 'online' as const,
          icon: Radio,
          metrics: { connections: 523, throughput: '12.4 MB/s' },
          connections: ['sensor-network', 'actuator-network']
        },
        {
          id: 'opcua-server',
          name: 'OPC UA Server',
          type: 'protocol' as const,
          status: 'online' as const,
          icon: Cable,
          metrics: { connections: 45, throughput: '3.2 MB/s' },
          connections: ['scada-system']
        },
        {
          id: 'rule-engine',
          name: 'Rule Engine',
          type: 'service' as const,
          status: 'online' as const,
          icon: GitBranch,
          metrics: { latency: 2, throughput: '15k rules/s' },
          connections: ['edge-controller']
        }
      ]
    },
    field: {
      name: 'Field Layer',
      description: 'Physical devices, sensors, and actuators',
      color: 'green',
      components: [
        {
          id: 'sensor-network',
          name: 'Sensor Network',
          type: 'device' as const,
          status: 'online' as const,
          icon: Activity,
          metrics: { connections: 284, throughput: '524 msg/s' },
          connections: []
        },
        {
          id: 'actuator-network',
          name: 'Actuator Network',
          type: 'device' as const,
          status: 'online' as const,
          icon: Zap,
          metrics: { connections: 156, throughput: '89 cmd/s' },
          connections: []
        },
        {
          id: 'hvac-controller',
          name: 'HVAC Controllers',
          type: 'device' as const,
          status: 'online' as const,
          icon: Gauge,
          metrics: { connections: 24 },
          connections: []
        },
        {
          id: 'lighting-controller',
          name: 'Lighting Controllers',
          type: 'device' as const,
          status: 'online' as const,
          icon: Zap,
          metrics: { connections: 48 },
          connections: []
        },
        {
          id: 'plc-1',
          name: 'PLC Array 1',
          type: 'device' as const,
          status: 'online' as const,
          icon: Cpu,
          metrics: { connections: 12 },
          connections: []
        },
        {
          id: 'plc-2',
          name: 'PLC Array 2',
          type: 'device' as const,
          status: 'degraded' as const,
          icon: Cpu,
          metrics: { connections: 8 },
          connections: []
        },
        {
          id: 'vfd-array',
          name: 'VFD Array',
          type: 'device' as const,
          status: 'online' as const,
          icon: CircuitBoard,
          metrics: { connections: 16 },
          connections: []
        },
        {
          id: 'scada-system',
          name: 'SCADA System',
          type: 'device' as const,
          status: 'online' as const,
          icon: Monitor,
          metrics: { connections: 1 },
          connections: []
        }
      ]
    }
  };

  // Data flow definitions
  const dataFlows: DataFlow[] = [
    { from: 'sensor-network', to: 'mqtt-broker', protocol: 'MQTT', volume: 'high', type: 'stream' },
    { from: 'mqtt-broker', to: 'edge-controller', protocol: 'MQTT', volume: 'high', type: 'stream' },
    { from: 'edge-controller', to: 'api-gateway', protocol: 'HTTPS', volume: 'medium', type: 'batch' },
    { from: 'api-gateway', to: 'analytics-engine', protocol: 'gRPC', volume: 'medium', type: 'stream' },
    { from: 'hvac-controller', to: 'bacnet-gateway', protocol: 'BACnet', volume: 'low', type: 'realtime' },
    { from: 'plc-1', to: 'modbus-gateway', protocol: 'Modbus', volume: 'medium', type: 'realtime' }
  ];

  // Database components
  const databases = [
    {
      id: 'time-series-db',
      name: 'Time Series DB',
      type: 'database' as const,
      status: 'online' as const,
      icon: Database,
      metrics: { throughput: '45k writes/s', storage: '2.4 TB' }
    },
    {
      id: 'user-db',
      name: 'User Database',
      type: 'database' as const,
      status: 'online' as const,
      icon: Database,
      metrics: { connections: 124, storage: '156 GB' }
    },
    {
      id: 'data-service',
      name: 'Data Service',
      type: 'service' as const,
      status: 'online' as const,
      icon: HardDrive,
      metrics: { latency: 8, throughput: '12.4 GB/s' }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'degraded': return AlertCircle;
      case 'offline': return XCircle;
      case 'maintenance': return Settings;
      default: return Info;
    }
  };

  const getConnectionStrength = (from: string, to: string) => {
    const flow = dataFlows.find(f => 
      (f.from === from && f.to === to) || (f.from === to && f.to === from)
    );
    if (!flow) return 0;
    switch (flow.volume) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-purple-500" />
              Three-Tier System Architecture
            </h2>
            <p className="text-gray-400 mt-1">
              Enterprise-grade architecture with management, automation, and field layers
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Show Data Flow</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDataFlow}
                  onChange={(e) => setShowDataFlow(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </label>
            <button 
              onClick={handleExportDiagram}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Diagram
            </button>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="flex items-center gap-2 mb-6">
          {Object.entries(tiers).map(([key, tier]) => (
            <button
              key={key}
              onClick={() => setSelectedTier(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTier === key
                  ? `bg-${tier.color}-600 text-white`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              style={{
                backgroundColor: selectedTier === key ? 
                  (tier.color === 'purple' ? '#9333ea' : 
                   tier.color === 'blue' ? '#3b82f6' : 
                   '#10b981') : undefined
              }}
            >
              {tier.name}
            </button>
          ))}
        </div>

        {/* Architecture Visualization */}
        <div className="grid grid-cols-3 gap-6">
          {/* Management Layer */}
          <div className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
            selectedTier === 'management' ? 'border-purple-500' : 'border-gray-700'
          }`}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-purple-500" />
              Management Layer
            </h3>
            <div className="space-y-2">
              {(expandedTiers.management ? tiers.management.components : tiers.management.components.slice(0, 4)).map((component) => {
                const Icon = component.icon;
                const StatusIcon = getStatusIcon(component.status);
                return (
                  <button
                    key={component.id}
                    onClick={() => setSelectedComponent(component.id)}
                    className={`w-full p-2 rounded flex items-center justify-between transition-all ${
                      selectedComponent === component.id
                        ? 'bg-purple-600/20 border border-purple-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{component.name}</span>
                    </div>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(component.status)}`} />
                  </button>
                );
              })}
              {tiers.management.components.length > 4 && (
                <button 
                  onClick={() => toggleTierExpansion('management')}
                  className="w-full p-2 text-gray-400 text-sm hover:text-white"
                >
                  {expandedTiers.management 
                    ? 'Show less...' 
                    : `+${tiers.management.components.length - 4} more...`
                  }
                </button>
              )}
            </div>
          </div>

          {/* Automation Layer */}
          <div className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
            selectedTier === 'automation' ? 'border-blue-500' : 'border-gray-700'
          }`}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" />
              Automation Layer
            </h3>
            <div className="space-y-2">
              {(expandedTiers.automation ? tiers.automation.components : tiers.automation.components.slice(0, 4)).map((component) => {
                const Icon = component.icon;
                const StatusIcon = getStatusIcon(component.status);
                return (
                  <button
                    key={component.id}
                    onClick={() => setSelectedComponent(component.id)}
                    className={`w-full p-2 rounded flex items-center justify-between transition-all ${
                      selectedComponent === component.id
                        ? 'bg-blue-600/20 border border-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{component.name}</span>
                    </div>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(component.status)}`} />
                  </button>
                );
              })}
              {tiers.automation.components.length > 4 && (
                <button 
                  onClick={() => toggleTierExpansion('automation')}
                  className="w-full p-2 text-gray-400 text-sm hover:text-white"
                >
                  {expandedTiers.automation 
                    ? 'Show less...' 
                    : `+${tiers.automation.components.length - 4} more...`
                  }
                </button>
              )}
            </div>
          </div>

          {/* Field Layer */}
          <div className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
            selectedTier === 'field' ? 'border-green-500' : 'border-gray-700'
          }`}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CircuitBoard className="w-5 h-5 text-green-500" />
              Field Layer
            </h3>
            <div className="space-y-2">
              {(expandedTiers.field ? tiers.field.components : tiers.field.components.slice(0, 4)).map((component) => {
                const Icon = component.icon;
                const StatusIcon = getStatusIcon(component.status);
                return (
                  <button
                    key={component.id}
                    onClick={() => setSelectedComponent(component.id)}
                    className={`w-full p-2 rounded flex items-center justify-between transition-all ${
                      selectedComponent === component.id
                        ? 'bg-green-600/20 border border-green-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{component.name}</span>
                    </div>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(component.status)}`} />
                  </button>
                );
              })}
              {tiers.field.components.length > 4 && (
                <button 
                  onClick={() => toggleTierExpansion('field')}
                  className="w-full p-2 text-gray-400 text-sm hover:text-white"
                >
                  {expandedTiers.field 
                    ? 'Show less...' 
                    : `+${tiers.field.components.length - 4} more...`
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data Flow Indicators */}
        {showDataFlow && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Active Data Flows</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <ArrowUp className="w-8 h-8 text-green-500 mx-auto mb-2 animate-pulse" />
                <p className="text-white text-sm">524 msg/s</p>
                <p className="text-gray-400 text-xs">Field → Automation</p>
              </div>
              <div className="text-center">
                <ArrowLeftRight className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                <p className="text-white text-sm">2.4k req/s</p>
                <p className="text-gray-400 text-xs">Automation ↔ Management</p>
              </div>
              <div className="text-center">
                <ArrowDown className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-pulse" />
                <p className="text-white text-sm">89 cmd/s</p>
                <p className="text-gray-400 text-xs">Management → Field</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Tier Details */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {tiers[selectedTier].name} - Detailed View
        </h3>
        <p className="text-gray-400 mb-6">{tiers[selectedTier].description}</p>
        
        <div className="grid grid-cols-3 gap-4">
          {tiers[selectedTier].components.map((component) => {
            const Icon = component.icon;
            const StatusIcon = getStatusIcon(component.status);
            
            return (
              <div
                key={component.id}
                className={`bg-gray-800 rounded-lg p-4 border transition-all cursor-pointer ${
                  selectedComponent === component.id
                    ? 'border-purple-500'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedComponent(component.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6 text-gray-400" />
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(component.status)}`} />
                </div>
                <h4 className="text-white font-medium mb-1">{component.name}</h4>
                <p className="text-gray-400 text-xs mb-3 capitalize">{component.type}</p>
                
                {component.metrics && (
                  <div className="space-y-1 text-xs">
                    {'latency' in component.metrics && component.metrics.latency && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Latency</span>
                        <span className="text-gray-300">{component.metrics.latency}ms</span>
                      </div>
                    )}
                    {'throughput' in component.metrics && component.metrics.throughput && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Throughput</span>
                        <span className="text-gray-300">{component.metrics.throughput}</span>
                      </div>
                    )}
                    {'connections' in component.metrics && component.metrics.connections && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Connections</span>
                        <span className="text-gray-300">{component.metrics.connections}</span>
                      </div>
                    )}
                    {'uptime' in component.metrics && component.metrics.uptime && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Uptime</span>
                        <span className="text-gray-300">{component.metrics.uptime}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Protocol Support Matrix */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Protocol Support Matrix</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { name: 'BACnet/IP', status: 'active', devices: 124 },
            { name: 'Modbus TCP', status: 'active', devices: 67 },
            { name: 'MQTT', status: 'active', devices: 523 },
            { name: 'OPC UA', status: 'active', devices: 45 },
            { name: 'KNX/EIB', status: 'planned', devices: 0 },
            { name: 'M-Bus', status: 'planned', devices: 0 },
            { name: 'SNMP', status: 'active', devices: 28 },
            { name: 'REST API', status: 'active', devices: 156 },
            { name: 'WebSocket', status: 'active', devices: 312 },
            { name: 'LoRaWAN', status: 'testing', devices: 12 }
          ].map((protocol) => (
            <div key={protocol.name} className="bg-gray-800 rounded-lg p-3 text-center">
              <Cable className={`w-8 h-8 mx-auto mb-2 ${
                protocol.status === 'active' ? 'text-green-500' :
                protocol.status === 'testing' ? 'text-yellow-500' :
                'text-gray-500'
              }`} />
              <p className="text-white font-medium text-sm">{protocol.name}</p>
              <p className="text-gray-400 text-xs mt-1">
                {protocol.status === 'active' ? `${protocol.devices} devices` :
                 protocol.status === 'testing' ? 'Testing' : 'Planned'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-xs text-green-400 font-medium">Healthy</span>
          </div>
          <p className="text-2xl font-bold text-white">99.97%</p>
          <p className="text-gray-400 text-sm">System Uptime</p>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Signal className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <p className="text-2xl font-bold text-white">1,247</p>
          <p className="text-gray-400 text-sm">Connected Devices</p>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-400">Normal</span>
          </div>
          <p className="text-2xl font-bold text-white">23ms</p>
          <p className="text-gray-400 text-sm">Avg. Latency</p>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-green-400">Secure</span>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-gray-400 text-sm">Security Incidents</p>
        </div>
      </div>
    </div>
  );
}