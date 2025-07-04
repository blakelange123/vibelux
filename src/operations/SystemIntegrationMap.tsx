'use client';

import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Database,
  Cloud,
  Shield,
  Activity,
  Wifi,
  Link,
  Server,
  Smartphone,
  Monitor,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  BarChart3
} from 'lucide-react';

interface SystemNode {
  id: string;
  name: string;
  type: 'core' | 'module' | 'external' | 'device';
  status: 'online' | 'offline' | 'warning';
  connections: string[];
  metrics?: {
    latency?: number;
    throughput?: number;
    uptime?: number;
  };
}

interface DataFlow {
  from: string;
  to: string;
  type: 'sensor' | 'control' | 'analytics' | 'alert';
  volume: number; // data points per minute
}

export function SystemIntegrationMap() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'topology' | 'dataflow' | 'security'>('topology');

  // System nodes
  const systemNodes: SystemNode[] = [
    // Core Systems
    {
      id: 'core-server',
      name: 'Vibelux Core Server',
      type: 'core',
      status: 'online',
      connections: ['db-server', 'analytics-engine', 'api-gateway', 'automation-controller'],
      metrics: { uptime: 99.98, throughput: 15000 }
    },
    {
      id: 'db-server',
      name: 'Database Cluster',
      type: 'core',
      status: 'online',
      connections: ['core-server', 'analytics-engine', 'backup-storage'],
      metrics: { uptime: 99.99, latency: 2.3 }
    },
    {
      id: 'analytics-engine',
      name: 'ML Analytics Engine',
      type: 'core',
      status: 'online',
      connections: ['core-server', 'db-server', 'prediction-service'],
      metrics: { throughput: 5000 }
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'core',
      status: 'online',
      connections: ['core-server', 'mobile-app', 'web-app', 'third-party'],
      metrics: { latency: 45, throughput: 8000 }
    },
    
    // Modules
    {
      id: 'automation-controller',
      name: 'Automation Controller',
      type: 'module',
      status: 'online',
      connections: ['core-server', 'hvac-system', 'lighting-system', 'irrigation-system']
    },
    {
      id: 'sensor-hub',
      name: 'Sensor Hub',
      type: 'module',
      status: 'online',
      connections: ['env-sensors', 'power-meters', 'flow-sensors', 'core-server']
    },
    {
      id: 'prediction-service',
      name: 'Predictive Service',
      type: 'module',
      status: 'online',
      connections: ['analytics-engine', 'alert-system']
    },
    {
      id: 'alert-system',
      name: 'Alert System',
      type: 'module',
      status: 'warning',
      connections: ['prediction-service', 'notification-service', 'core-server']
    },
    
    // External Services
    {
      id: 'cloud-backup',
      name: 'Cloud Backup',
      type: 'external',
      status: 'online',
      connections: ['backup-storage']
    },
    {
      id: 'weather-api',
      name: 'Weather API',
      type: 'external',
      status: 'online',
      connections: ['core-server']
    },
    {
      id: 'utility-api',
      name: 'Utility API',
      type: 'external',
      status: 'online',
      connections: ['core-server']
    },
    {
      id: 'compliance-api',
      name: 'METRC API',
      type: 'external',
      status: 'online',
      connections: ['core-server']
    },
    
    // Devices
    {
      id: 'env-sensors',
      name: 'Environmental Sensors',
      type: 'device',
      status: 'online',
      connections: ['sensor-hub']
    },
    {
      id: 'hvac-system',
      name: 'HVAC Systems',
      type: 'device',
      status: 'online',
      connections: ['automation-controller']
    },
    {
      id: 'lighting-system',
      name: 'LED Lighting',
      type: 'device',
      status: 'online',
      connections: ['automation-controller']
    },
    {
      id: 'irrigation-system',
      name: 'Irrigation System',
      type: 'device',
      status: 'online',
      connections: ['automation-controller']
    }
  ];

  // Data flows
  const dataFlows: DataFlow[] = [
    { from: 'env-sensors', to: 'sensor-hub', type: 'sensor', volume: 1200 },
    { from: 'sensor-hub', to: 'core-server', type: 'sensor', volume: 1200 },
    { from: 'core-server', to: 'analytics-engine', type: 'analytics', volume: 800 },
    { from: 'analytics-engine', to: 'prediction-service', type: 'analytics', volume: 200 },
    { from: 'prediction-service', to: 'alert-system', type: 'alert', volume: 50 },
    { from: 'automation-controller', to: 'hvac-system', type: 'control', volume: 100 },
    { from: 'automation-controller', to: 'lighting-system', type: 'control', volume: 150 },
    { from: 'automation-controller', to: 'irrigation-system', type: 'control', volume: 80 }
  ];

  const getNodeIcon = (type: string, name: string) => {
    if (name.includes('Database')) return <Database className="w-6 h-6" />;
    if (name.includes('ML') || name.includes('Analytics')) return <Cpu className="w-6 h-6" />;
    if (name.includes('API')) return <Globe className="w-6 h-6" />;
    if (name.includes('Cloud')) return <Cloud className="w-6 h-6" />;
    if (name.includes('Sensor')) return <Activity className="w-6 h-6" />;
    if (name.includes('LED') || name.includes('Light')) return <Zap className="w-6 h-6" />;
    if (type === 'core') return <Server className="w-6 h-6" />;
    if (type === 'device') return <Wifi className="w-6 h-6" />;
    return <Network className="w-6 h-6" />;
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-purple-900/20 border-purple-600';
      case 'module': return 'bg-blue-900/20 border-blue-600';
      case 'external': return 'bg-green-900/20 border-green-600';
      case 'device': return 'bg-yellow-900/20 border-yellow-600';
      default: return 'bg-gray-900/20 border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-red-400';
      case 'warning': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  // Security status
  const securityMetrics = {
    encryptionStatus: 'AES-256',
    certificateExpiry: 89, // days
    lastSecurityAudit: '2024-03-15',
    vulnerabilities: 0,
    accessControls: 'RBAC Enabled',
    dataRetention: '90 days',
    backupStatus: 'Automated Daily',
    complianceStatus: 'HIPAA, SOC2'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Integration Map</h2>
          <p className="text-gray-400">Complete infrastructure and data flow visualization</p>
        </div>
        <div className="flex gap-2">
          {['topology', 'dataflow', 'security'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'topology' && (
        <>
          {/* System Status Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Systems</span>
                <Network className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{systemNodes.length}</p>
              <p className="text-sm text-gray-500">{systemNodes.filter(n => n.status === 'online').length} online</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Data Flow</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {dataFlows.reduce((sum, flow) => sum + flow.volume, 0)}
              </p>
              <p className="text-sm text-gray-500">points/min</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Integrations</span>
                <Link className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {systemNodes.filter(n => n.type === 'external').length}
              </p>
              <p className="text-sm text-gray-500">External APIs</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Uptime</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">99.98%</p>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
          </div>

          {/* Network Topology */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Network Topology</h3>
            <div className="grid grid-cols-4 gap-4">
              {/* Core Systems */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Core Systems</h4>
                <div className="space-y-3">
                  {systemNodes.filter(n => n.type === 'core').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        getNodeColor(node.type)
                      } ${selectedNode === node.id ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getNodeIcon(node.type, node.name)}
                          <div>
                            <p className="font-medium text-white text-sm">{node.name}</p>
                            {node.metrics?.uptime && (
                              <p className="text-xs text-gray-400">Uptime: {node.metrics.uptime}%</p>
                            )}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Processing Modules</h4>
                <div className="space-y-3">
                  {systemNodes.filter(n => n.type === 'module').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        getNodeColor(node.type)
                      } ${selectedNode === node.id ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getNodeIcon(node.type, node.name)}
                          <p className="font-medium text-white text-sm">{node.name}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Services */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">External Services</h4>
                <div className="space-y-3">
                  {systemNodes.filter(n => n.type === 'external').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        getNodeColor(node.type)
                      } ${selectedNode === node.id ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getNodeIcon(node.type, node.name)}
                          <p className="font-medium text-white text-sm">{node.name}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Connected Devices</h4>
                <div className="space-y-3">
                  {systemNodes.filter(n => n.type === 'device').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        getNodeColor(node.type)
                      } ${selectedNode === node.id ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getNodeIcon(node.type, node.name)}
                          <p className="font-medium text-white text-sm">{node.name}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Connection Details */}
            {selectedNode && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium text-white mb-3">
                  Connections for {systemNodes.find(n => n.id === selectedNode)?.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {systemNodes.find(n => n.id === selectedNode)?.connections.map((conn) => (
                    <span key={conn} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm">
                      {systemNodes.find(n => n.id === conn)?.name || conn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'dataflow' && (
        <>
          {/* Data Flow Visualization */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Real-Time Data Flow</h3>
            <div className="space-y-4">
              {dataFlows.map((flow, idx) => {
                const fromNode = systemNodes.find(n => n.id === flow.from);
                const toNode = systemNodes.find(n => n.id === flow.to);
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-white">{fromNode?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs ${
                        flow.type === 'sensor' ? 'bg-blue-900/20 text-blue-400' :
                        flow.type === 'control' ? 'bg-green-900/20 text-green-400' :
                        flow.type === 'analytics' ? 'bg-purple-900/20 text-purple-400' :
                        'bg-yellow-900/20 text-yellow-400'
                      }`}>
                        {flow.type}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{flow.volume}/min</span>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-white">{toNode?.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Volume by Type */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Data Volume by Type</h3>
              <div className="space-y-3">
                {['sensor', 'control', 'analytics', 'alert'].map((type) => {
                  const volume = dataFlows
                    .filter(f => f.type === type)
                    .reduce((sum, f) => sum + f.volume, 0);
                  const percentage = (volume / dataFlows.reduce((sum, f) => sum + f.volume, 0)) * 100;
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 capitalize">{type} Data</span>
                        <span className="text-white font-medium">{volume} pts/min</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            type === 'sensor' ? 'bg-blue-500' :
                            type === 'control' ? 'bg-green-500' :
                            type === 'analytics' ? 'bg-purple-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Processing Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Avg Processing Time</span>
                  <span className="text-white font-medium">23ms</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Queue Depth</span>
                  <span className="text-green-400 font-medium">Low (124)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Error Rate</span>
                  <span className="text-green-400 font-medium">0.02%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Throughput</span>
                  <span className="text-blue-400 font-medium">2,850 msg/sec</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'security' && (
        <>
          {/* Security Overview */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Security Status</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Encryption</span>
                </div>
                <p className="text-xl font-bold text-white">{securityMetrics.encryptionStatus}</p>
                <p className="text-xs text-gray-500 mt-1">End-to-end</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">Certificate</span>
                </div>
                <p className="text-xl font-bold text-white">{securityMetrics.certificateExpiry}d</p>
                <p className="text-xs text-gray-500 mt-1">Until expiry</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Vulnerabilities</span>
                </div>
                <p className="text-xl font-bold text-white">{securityMetrics.vulnerabilities}</p>
                <p className="text-xs text-gray-500 mt-1">Critical issues</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400">Compliance</span>
                </div>
                <p className="text-lg font-bold text-white">{securityMetrics.complianceStatus}</p>
              </div>
            </div>
          </div>

          {/* Security Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Access Control</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Authentication</span>
                  <span className="text-green-400">Multi-Factor</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Authorization</span>
                  <span className="text-green-400">{securityMetrics.accessControls}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Session Management</span>
                  <span className="text-green-400">Secure Tokens</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">API Security</span>
                  <span className="text-green-400">OAuth 2.0</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Data Protection</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Data Retention</span>
                  <span className="text-blue-400">{securityMetrics.dataRetention}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Backup Status</span>
                  <span className="text-green-400">{securityMetrics.backupStatus}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Last Audit</span>
                  <span className="text-gray-400">{securityMetrics.lastSecurityAudit}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Audit Logs</span>
                  <span className="text-green-400">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}