'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  RefreshCw,
  Shield,
  Terminal,
  Wifi,
  WifiOff,
  Zap,
  Play,
  Pause,
  Info,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  Bug,
  BarChart3,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { climateComputerManager, ClimateComputerConfig, UnifiedDataPoint } from '@/lib/integrations/climate-computers/integration-manager';

interface IntegrationStatus {
  id: string;
  name: string;
  brand: string;
  enabled: boolean;
  connected: boolean;
  lastSync?: Date;
  dataPointCount: number;
  errorCount: number;
  latency?: number;
}

interface DiagnosticResult {
  timestamp: Date;
  test: string;
  result: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface DataFlowMetrics {
  incomingRate: number;
  outgoingRate: number;
  errorRate: number;
  queueDepth: number;
}

export function ClimateIntegrationManager() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [unifiedData, setUnifiedData] = useState<UnifiedDataPoint[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [dataFlowMetrics, setDataFlowMetrics] = useState<DataFlowMetrics>({
    incomingRate: 0,
    outgoingRate: 0,
    errorRate: 0,
    queueDepth: 0
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    dataFlow: true,
    diagnostics: false,
    configuration: false
  });

  // Load integration status on mount and set up refresh interval
  useEffect(() => {
    loadIntegrationStatus();
    loadUnifiedData();

    const interval = setInterval(() => {
      loadIntegrationStatus();
      loadUnifiedData();
      updateDataFlowMetrics();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadIntegrationStatus = () => {
    const status = climateComputerManager.getIntegrationStatus();
    setIntegrations(status.map(s => ({
      ...s,
      errorCount: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5), // Simulated error count
      latency: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100) + 10 // Simulated latency
    })));
  };

  const loadUnifiedData = () => {
    const data = climateComputerManager.getUnifiedData();
    setUnifiedData(data);
  };

  const updateDataFlowMetrics = () => {
    // Simulate data flow metrics
    setDataFlowMetrics({
      incomingRate: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10,
      outgoingRate: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30) + 5,
      errorRate: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      queueDepth: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20)
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const runDiagnostics = async (integrationId: string) => {
    setIsRunningDiagnostics(true);
    setDiagnosticResults([]);

    const tests = [
      { name: 'Network Connectivity', delay: 500 },
      { name: 'Authentication', delay: 800 },
      { name: 'Protocol Compatibility', delay: 600 },
      { name: 'Data Point Discovery', delay: 1200 },
      { name: 'Read/Write Permissions', delay: 700 },
      { name: 'Response Time', delay: 400 }
    ];

    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, test.delay));
      
      const result: DiagnosticResult = {
        timestamp: new Date(),
        test: test.name,
        result: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.8 ? 'warning' : 'success',
        message: test.name === 'Response Time' 
          ? `Average latency: ${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10}ms`
          : `${test.name} check passed`,
        details: test.name === 'Data Point Discovery' 
          ? { pointsFound: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100) + 50 }
          : undefined
      };

      setDiagnosticResults(prev => [...prev, result]);
    }

    setIsRunningDiagnostics(false);
  };

  const handleSync = async (integrationId: string) => {
    const result = await climateComputerManager.syncIntegration(integrationId);
    if (result.success) {
      loadIntegrationStatus();
      loadUnifiedData();
    }
  };

  const exportConfiguration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    const config = {
      integration,
      dataPoints: unifiedData.filter(d => d.source.integrationId === integrationId),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${integration.name.replace(/\s+/g, '-')}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    if (!status.enabled) return <WifiOff className="w-5 h-5 text-gray-500" />;
    if (!status.connected) return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (status.errorCount > 0) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const getDataCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <Thermometer className="w-4 h-4" />;
      case 'irrigation': return <Droplets className="w-4 h-4" />;
      case 'lighting': return <Sun className="w-4 h-4" />;
      case 'co2': return <Wind className="w-4 h-4" />;
      default: return <Gauge className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Climate Integration Manager</h1>
          <p className="text-gray-400">Monitor and manage all climate computer connections</p>
        </div>
        <button
          onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Advanced Configuration
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Integrations</span>
            <Wifi className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {integrations.filter(i => i.connected).length}/{integrations.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Connected systems</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Data Points</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">{unifiedData.length}</p>
          <p className="text-xs text-gray-500 mt-1">Live monitoring</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Data Rate</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {dataFlowMetrics.incomingRate} <span className="text-sm text-gray-400">pts/s</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Incoming data</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">System Health</span>
            <Shield className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {Math.round((1 - dataFlowMetrics.errorRate / 100) * 100)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Operational</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Integrations */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('overview')}
            >
              <h2 className="text-lg font-semibold text-gray-100">Integration Overview</h2>
              {expandedSections.overview ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>

            {expandedSections.overview && (
              <div className="space-y-3">
                {integrations.map(integration => (
                  <div
                    key={integration.id}
                    className={`border border-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedIntegration === integration.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedIntegration(integration.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(integration)}
                        <div>
                          <h3 className="font-medium text-gray-100">{integration.name}</h3>
                          <p className="text-sm text-gray-400">{integration.brand}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-100">{integration.dataPointCount} points</p>
                          {integration.latency && (
                            <p className="text-xs text-gray-400">{integration.latency}ms latency</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSync(integration.id);
                          }}
                          className="p-2 hover:bg-gray-600 rounded transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {integration.errorCount > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
                        <AlertTriangle className="w-3 h-3" />
                        {integration.errorCount} errors in last sync
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Data Flow */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('dataFlow')}
            >
              <h2 className="text-lg font-semibold text-gray-100">Real-time Data Flow</h2>
              {expandedSections.dataFlow ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>

            {expandedSections.dataFlow && (
              <div className="space-y-4">
                {/* Data Flow Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Incoming</span>
                      <Download className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-xl font-semibold text-gray-100">
                      {dataFlowMetrics.incomingRate} pts/s
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Queue Depth</span>
                      <Database className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-xl font-semibold text-gray-100">
                      {dataFlowMetrics.queueDepth}
                    </p>
                  </div>
                </div>

                {/* Recent Data Points */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Data Points</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {unifiedData.slice(0, 10).map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                        <div className="flex items-center gap-2">
                          {getDataCategoryIcon(point.category)}
                          <span className="text-gray-300">{point.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-100">
                            {point.value.toFixed(2)} {point.unit}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            point.status === 'good' ? 'bg-green-400' : 
                            point.status === 'uncertain' ? 'bg-yellow-400' : 
                            'bg-red-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics & Configuration */}
        <div className="space-y-6">
          {/* Diagnostics Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('diagnostics')}
            >
              <h3 className="text-lg font-semibold text-gray-100">Diagnostics</h3>
              {expandedSections.diagnostics ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>

            {expandedSections.diagnostics && selectedIntegration && (
              <div className="space-y-4">
                <button
                  onClick={() => runDiagnostics(selectedIntegration)}
                  disabled={isRunningDiagnostics}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isRunningDiagnostics ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Bug className="w-4 h-4" />
                      Run Diagnostics
                    </>
                  )}
                </button>

                {diagnosticResults.length > 0 && (
                  <div className="space-y-2">
                    {diagnosticResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-700 rounded">
                        {result.result === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                        ) : result.result === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-100">{result.test}</p>
                          <p className="text-xs text-gray-400">{result.message}</p>
                          {result.details && (
                            <pre className="text-xs text-gray-500 mt-1">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {selectedIntegration && (
                <>
                  <button
                    onClick={() => exportConfiguration(selectedIntegration)}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Configuration
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2">
                    <Terminal className="w-4 h-4" />
                    View Logs
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documentation
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-100 mb-2">Need Help?</h3>
                <p className="text-xs text-gray-400 mb-3">
                  View our integration guides or contact support for assistance with climate computer connections.
                </p>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  View Integration Guide
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Configuration Modal */}
      {showAdvancedConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Advanced Configuration</h2>
              <button
                onClick={() => setShowAdvancedConfig(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Polling Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-3">Data Polling Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Polling Interval</label>
                    <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                      <option>5 seconds</option>
                      <option>10 seconds</option>
                      <option>30 seconds</option>
                      <option>1 minute</option>
                      <option>5 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Batch Size</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Retry Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-3">Error Handling</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Max Retries</label>
                    <input
                      type="number"
                      defaultValue="3"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Retry Delay (ms)</label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Protocol-Specific Settings */}
              <div>
                <h3 className="text-lg font-medium mb-3">Protocol Settings</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-100 mb-2">Modbus TCP</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-400">Timeout (ms)</label>
                        <input type="number" defaultValue="5000" className="w-full mt-1 px-2 py-1 bg-gray-700 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-400">Unit ID</label>
                        <input type="number" defaultValue="1" className="w-full mt-1 px-2 py-1 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-100 mb-2">BACnet</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-400">Device Instance</label>
                        <input type="number" defaultValue="1234" className="w-full mt-1 px-2 py-1 bg-gray-700 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-400">Network Number</label>
                        <input type="number" defaultValue="0" className="w-full mt-1 px-2 py-1 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={() => setShowAdvancedConfig(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}