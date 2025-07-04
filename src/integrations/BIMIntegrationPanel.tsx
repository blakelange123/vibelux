'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Building2, Upload, Download, Link2, Activity, AlertCircle,
  CheckCircle, Settings, Database, Cpu, Network, Gauge,
  FileText, Box, Layers, Zap, TrendingUp, Server,
  Monitor, Cable, Wifi, Clock, RefreshCw, Eye,
  Play, Pause, Square, BarChart3, Map, Lightbulb
} from 'lucide-react';
import { BIMIntegrationService, BIMModel, SCADASystem } from '@/lib/integrations/bim-integration';
import { 
  ModbusProtocol, BACnetProtocol, OPCUAProtocol, MQTTProtocol 
} from '@/lib/integrations/scada-protocols';

export function BIMIntegrationPanel() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<'models' | 'scada' | 'mapping' | 'analytics'>('models');
  const [bimModels, setBimModels] = useState<BIMModel[]>([]);
  const [scadaSystems, setScadaSystems] = useState<SCADASystem[]>([]);
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
  const [selectedScada, setSelectedScada] = useState<SCADASystem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showScadaModal, setShowScadaModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveData, setLiveData] = useState<Map<string, any>>(new Map());
  
  const bimService = new BIMIntegrationService();

  useEffect(() => {
    loadData();
    startLiveDataUpdates();
  }, []);

  const loadData = () => {
    // Load demo data
    const demoModel: BIMModel = {
      id: 'bim_001',
      name: 'Main Cultivation Facility',
      format: 'ifc',
      version: '2024',
      projectId: 'project_001',
      buildingType: 'indoor_farm',
      totalArea: 5000,
      levels: 2,
      zones: [
        {
          id: 'zone_001',
          name: 'Cultivation Zone A',
          type: 'cultivation',
          spaces: ['space_001', 'space_002']
        }
      ],
      coordinateSystem: {
        origin: { x: 0, y: 0, z: 0 },
        units: 'metric',
        northAngle: 0
      },
      spaces: [],
      structuralElements: [],
      mepSystems: [],
      lastSynced: new Date(),
      syncStatus: 'synced',
      validationErrors: []
    };

    const demoScada: SCADASystem = {
      id: 'scada_001',
      name: 'Johnson Controls BAS',
      vendor: 'Johnson Controls',
      protocol: 'bacnet',
      connection: {
        type: 'tcp',
        host: '192.168.1.100',
        port: 47808
      },
      dataPoints: [
        {
          id: 'dp_001',
          name: 'Zone A Temperature',
          description: 'Cultivation Zone A ambient temperature',
          type: 'analog',
          units: '°F',
          address: '2:1',
          currentValue: 75.5,
          lastUpdate: new Date(),
          quality: 'good'
        }
      ],
      alarms: [],
      connected: true,
      lastUpdate: new Date(),
      errorCount: 0
    };

    setBimModels([demoModel]);
    setScadaSystems([demoScada]);
  };

  const startLiveDataUpdates = () => {
    setInterval(() => {
      const updates = new Map<string, any>();
      
      // Simulate live data updates
      updates.set('temp_zone_a', 75 + Math.random() * 5);
      updates.set('humidity_zone_a', 60 + Math.random() * 10);
      updates.set('ppfd_zone_a', 600 + Math.random() * 200);
      updates.set('co2_zone_a', 800 + Math.random() * 400);
      
      setLiveData(updates);
    }, 2000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const model = await bimService.importBIMModel(file, 'project_001');
      setBimModels([...bimModels, model]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to import BIM model:', error);
    }
  };

  const handleScadaConnect = async (config: any) => {
    setIsConnecting(true);
    try {
      const scada = await bimService.connectSCADA(config);
      setScadaSystems([...scadaSystems, scada]);
      setShowScadaModal(false);
    } catch (error) {
      console.error('Failed to connect SCADA:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">BIM Models</h2>
          <p className="text-gray-600">Building information models and 3D facility data</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import Model
        </button>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bimModels.map(model => (
          <div key={model.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.format.toUpperCase()} v{model.version}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{model.buildingType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{model.totalArea.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Levels:</span>
                  <span className="font-medium">{model.levels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zones:</span>
                  <span className="font-medium">{model.zones.length}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Sync Status</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    model.syncStatus === 'synced' ? 'text-green-600' :
                    model.syncStatus === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {model.syncStatus === 'synced' ? <CheckCircle className="w-3 h-3" /> :
                     model.syncStatus === 'pending' ? <Clock className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                    {model.syncStatus}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedModel(model)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors">
                    <Lightbulb className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Model Card */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-3"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600 font-medium">Import BIM Model</span>
          <span className="text-sm text-gray-500">IFC, RVT, DWG supported</span>
        </button>
      </div>
    </div>
  );

  const renderScadaTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">SCADA Systems</h2>
          <p className="text-gray-600">Industrial control and automation connections</p>
        </div>
        <button
          onClick={() => setShowScadaModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Link2 className="w-4 h-4" />
          Connect System
        </button>
      </div>

      {/* Protocol Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { name: 'Modbus', icon: Server, color: 'blue', count: 2 },
          { name: 'BACnet', icon: Network, color: 'green', count: 1 },
          { name: 'OPC UA', icon: Database, color: 'purple', count: 1 },
          { name: 'MQTT', icon: Wifi, color: 'orange', count: 3 }
        ].map(protocol => (
          <div key={protocol.name} className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-${protocol.color}-100 rounded-lg flex items-center justify-center`}>
                <protocol.icon className={`w-5 h-5 text-${protocol.color}-600`} />
              </div>
              <div>
                <div className="font-medium">{protocol.name}</div>
                <div className="text-sm text-gray-600">{protocol.count} devices</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {protocol.name === 'Modbus' && 'RTU/TCP industrial protocol'}
              {protocol.name === 'BACnet' && 'Building automation standard'}
              {protocol.name === 'OPC UA' && 'Unified architecture'}
              {protocol.name === 'MQTT' && 'IoT messaging protocol'}
            </div>
          </div>
        ))}
      </div>

      {/* Connected Systems */}
      <div className="space-y-4">
        {scadaSystems.map(scada => (
          <div key={scada.id} className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${
                  scada.connected ? 'bg-green-100' : 'bg-red-100'
                } rounded-lg flex items-center justify-center`}>
                  <Activity className={`w-6 h-6 ${
                    scada.connected ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{scada.name}</h3>
                  <p className="text-sm text-gray-600">{scada.vendor} - {scada.protocol.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  scada.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {scada.connected ? 'Connected' : 'Disconnected'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Connection Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>{scada.connection.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span>{scada.connection.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Port:</span>
                    <span>{scada.connection.port}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Data Points</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Points:</span>
                    <span className="font-medium">{scada.dataPoints.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Alarms:</span>
                    <span className="font-medium text-red-600">
                      {scada.alarms.filter(a => a.active).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Update Rate:</span>
                    <span className="font-medium">5s</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">System Health</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Errors:</span>
                    <span className="font-medium">{scada.errorCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium">Just now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Data Preview */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3">Live Data Stream</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Temperature</div>
                  <div className="text-lg font-semibold">
                    {liveData.get('temp_zone_a')?.toFixed(1) || '75.5'}°F
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Humidity</div>
                  <div className="text-lg font-semibold">
                    {liveData.get('humidity_zone_a')?.toFixed(1) || '65.0'}%
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">PPFD</div>
                  <div className="text-lg font-semibold">
                    {liveData.get('ppfd_zone_a')?.toFixed(0) || '750'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">CO₂</div>
                  <div className="text-lg font-semibold">
                    {liveData.get('co2_zone_a')?.toFixed(0) || '1000'} ppm
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMappingTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">System Mapping</h2>
          <p className="text-gray-600">Connect BIM elements to SCADA points and VibeLux devices</p>
        </div>
      </div>

      {/* Mapping Interface */}
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BIM Elements */}
          <div>
            <h3 className="font-semibold mb-4">BIM Elements</h3>
            <div className="space-y-2">
              {['Grow Room A', 'HVAC Zone 1', 'Electrical Panel MDP-1', 'Lighting Circuit L1'].map(element => (
                <div
                  key={element}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{element}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SCADA Points */}
          <div>
            <h3 className="font-semibold mb-4">SCADA Points</h3>
            <div className="space-y-2">
              {['Zone A Temperature', 'Zone A Humidity', 'Fan Status', 'Light Control'].map(point => (
                <div
                  key={point}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{point}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VibeLux Devices */}
          <div>
            <h3 className="font-semibold mb-4">VibeLux Devices</h3>
            <div className="space-y-2">
              {['VL-LED-001', 'VL-SENSOR-001', 'VL-CONTROLLER-001'].map(device => (
                <div
                  key={device}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{device}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapping Visualization */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">Active Mappings</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <Box className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Grow Room A</span>
              <Cable className="w-4 h-4 text-gray-400" />
              <Gauge className="w-5 h-5 text-green-600" />
              <span className="font-medium">Zone A Temperature</span>
              <Cable className="w-4 h-4 text-gray-400" />
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">VL-SENSOR-001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Integrated Analytics</h2>
          <p className="text-gray-600">Real-time insights from BIM and SCADA integration</p>
        </div>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Energy Efficiency</div>
              <div className="text-2xl font-bold">18.5 W/ft²</div>
            </div>
          </div>
          <div className="text-xs text-green-600">↗ 12% improvement</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Space Utilization</div>
              <div className="text-2xl font-bold">87%</div>
            </div>
          </div>
          <div className="text-xs text-blue-600">Optimal usage</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">System Health</div>
              <div className="text-2xl font-bold">98.5%</div>
            </div>
          </div>
          <div className="text-xs text-purple-600">All systems normal</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Compliance Score</div>
              <div className="text-2xl font-bold">100%</div>
            </div>
          </div>
          <div className="text-xs text-orange-600">Fully compliant</div>
        </div>
      </div>

      {/* 3D Visualization Placeholder */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Facility Overview</h3>
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Building2 className="w-16 h-16 mx-auto mb-4" />
            <p className="font-medium">3D BIM Visualization</p>
            <p className="text-sm mt-2">Interactive facility model with live SCADA data overlay</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-500" />
            BIM & SCADA Integration
          </h1>
          <p className="text-gray-600">Connect building models with industrial control systems</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            {scadaSystems.filter(s => s.connected).length} systems online
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'models', label: 'BIM Models', icon: Building2 },
            { id: 'scada', label: 'SCADA Systems', icon: Network },
            { id: 'mapping', label: 'Mapping', icon: Link2 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'models' && renderModelsTab()}
      {selectedTab === 'scada' && renderScadaTab()}
      {selectedTab === 'mapping' && renderMappingTab()}
      {selectedTab === 'analytics' && renderAnalyticsTab()}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Import BIM Model</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select File</label>
                  <input
                    type="file"
                    accept=".ifc,.rvt,.dwg,.nwd,.skp,.fbx"
                    onChange={handleFileUpload}
                    className="w-full p-3 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: IFC, RVT, DWG, NWD, SKP, FBX
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Building Type</label>
                  <select className="w-full p-3 border rounded-lg">
                    <option value="greenhouse">Greenhouse</option>
                    <option value="indoor_farm">Indoor Farm</option>
                    <option value="vertical_farm">Vertical Farm</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="research">Research Facility</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCADA Connection Modal */}
      {showScadaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Connect SCADA System</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">System Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Main BAS Controller"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vendor</label>
                  <select className="w-full p-3 border rounded-lg">
                    <option>Johnson Controls</option>
                    <option>Schneider Electric</option>
                    <option>Siemens</option>
                    <option>Honeywell</option>
                    <option>Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Protocol</label>
                  <select className="w-full p-3 border rounded-lg">
                    <option value="modbus">Modbus TCP/RTU</option>
                    <option value="bacnet">BACnet IP/MSTP</option>
                    <option value="opcua">OPC UA</option>
                    <option value="mqtt">MQTT</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Host/IP</label>
                    <input
                      type="text"
                      placeholder="192.168.1.100"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Port</label>
                    <input
                      type="number"
                      placeholder="502"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowScadaModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleScadaConnect({})}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}