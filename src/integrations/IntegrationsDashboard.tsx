'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  // Camera, // Removed to avoid patent issues
  Thermometer,
  Package,
  Database,
  Settings,
  Plus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Key,
  Link2,
  Unlink,
  Eye,
  Wind,
  FlaskConical
} from 'lucide-react';
import { sensorManager } from '@/lib/integrations/iot-sensors';
import { scadaManager } from '@/lib/integrations/scada-systems';
import { erpManager } from '@/lib/integrations/erp-systems';

interface Integration {
  id: string;
  name: string;
  type: 'sensor' | 'scada' | 'erp' | 'climate' | 'lims';
  platform: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastSync?: Date;
  deviceCount?: number;
  config?: any;
}

interface SystemHealth {
  sensors: { total: number; online: number; offline: number };
  // cameras: { total: number; online: number; offline: number }; // Removed to avoid patent issues
  scada: { tags: number; alarms: number; plcs: number };
  erp: { plants: number; batches: number; packages: number };
}

export function IntegrationsDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    sensors: { total: 0, online: 0, offline: 0 },
    // cameras: { total: 0, online: 0, offline: 0 }, // Removed to avoid patent issues
    scada: { tags: 0, alarms: 0, plcs: 0 },
    erp: { plants: 0, batches: 0, packages: 0 }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Load existing integrations
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadIntegrations();
        await updateSystemHealth();
      } catch (error) {
        console.error('Failed to initialize integration data:', error);
      }
    };
    
    initializeData();
    
    // Refresh every 30 seconds
    const interval = setInterval(async () => {
      try {
        await updateSystemHealth();
      } catch (error) {
        console.error('Failed to update system health:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadIntegrations = async () => {
    // Load from local storage or API
    const saved = localStorage.getItem('vibelux-integrations');
    if (saved) {
      setIntegrations(JSON.parse(saved));
    }
  };

  const updateSystemHealth = async () => {
    // Get sensor status
    const allSensors = sensorManager.getAllSensors();
    const onlineSensors = allSensors.filter(s => s.status === 'online').length;
    
    // Camera functionality removed to avoid patent issues
    const allCameras: any[] = [];
    const onlineCameras = 0;
    
    // Get SCADA status
    const activeAlarms = scadaManager.getActiveAlarms();
    
    // Get ERP inventory
    let inventory: { plants: any[], batches: any[], packages: any[] } = { plants: [], batches: [], packages: [] };
    if (erpManager.getIntegration()) {
      try {
        inventory = await erpManager.getIntegration()!.getInventory();
      } catch (error) {
        console.error('Failed to get ERP inventory:', error);
      }
    }

    setSystemHealth({
      sensors: {
        total: allSensors.length,
        online: onlineSensors,
        offline: allSensors.length - onlineSensors
      },
      // cameras: {
      //   total: allCameras.length,
      //   online: onlineCameras,
      //   offline: allCameras.length - onlineCameras
      // }, // Removed to avoid patent issues
      scada: {
        tags: 0, // Would get from SCADA manager
        alarms: activeAlarms.length,
        plcs: 0 // Would get from SCADA manager
      },
      erp: {
        plants: inventory.plants.length,
        batches: inventory.batches.length,
        packages: inventory.packages.length
      }
    });
  };

  const handleAddIntegration = async (config: any) => {
    const newIntegration: Integration = {
      id: `int-${Date.now()}`,
      name: config.name,
      type: config.type,
      platform: config.platform,
      status: 'connecting',
      config
    };

    setIntegrations([...integrations, newIntegration]);
    
    // Connect based on type
    let success = false;
    try {
      switch (config.type) {
        case 'sensor':
          // Connect sensor integration
          if (config.platform === 'onset-hobo') {
            const hoboIntegration = new (await import('@/lib/integrations/iot-sensors')).OnsetHOBOIntegration({
              apiKey: config.apiKey,
              baseUrl: config.baseUrl || 'https://webservice.hobolink.com'
            });
            success = await sensorManager.addIntegration(config.name, hoboIntegration);
          } else if (config.platform === 'trolmaster') {
            const trolIntegration = new (await import('@/lib/integrations/iot-sensors')).TrolmasterIntegration({
              apiKey: config.apiKey,
              baseUrl: config.baseUrl || 'https://api.trolmaster.com'
            });
            success = await sensorManager.addIntegration(config.name, trolIntegration);
          }
          break;

        // Camera case removed to avoid patent issues
        // case 'camera':
        //   break;

        case 'scada':
          // Connect SCADA integration
          success = await scadaManager.addDevice({
            id: config.deviceId,
            name: config.name,
            type: config.platform as any,
            ipAddress: config.ipAddress,
            port: config.port || 502,
            slot: config.slot,
            rack: config.rack,
            status: 'offline',
            tags: []
          }, config.platform as any);
          break;

        case 'erp':
          // Connect ERP integration
          success = await erpManager.connect(config.platform as any, {
            apiKey: config.apiKey,
            licenseNumber: config.licenseNumber,
            facilityId: config.facilityId,
            baseUrl: config.baseUrl
          });
          break;
          
        case 'lims':
          // Connect LIMS integration
          // For now, just mark as successful
          // In production, would initialize LIMSIntegrationService
          success = true;
          break;
      }

      // Update status
      setIntegrations(prev => prev.map(int => 
        int.id === newIntegration.id 
          ? { ...int, status: success ? 'connected' : 'error' }
          : int
      ));
      
      // Save to storage
      localStorage.setItem('vibelux-integrations', JSON.stringify(integrations));
      
      // Refresh health
      updateSystemHealth().catch(error => console.error('Failed to update system health after adding integration:', error));
    } catch (error) {
      console.error('Integration connection failed:', error);
      setIntegrations(prev => prev.map(int => 
        int.id === newIntegration.id 
          ? { ...int, status: 'error' }
          : int
      ));
    }
  };

  const handleRemoveIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    // Disconnect based on type
    switch (integration.type) {
      case 'sensor':
        await sensorManager.removeIntegration(integration.name);
        break;
      // Camera case removed to avoid patent issues
      // case 'camera':
      //   break;
      case 'scada':
        await scadaManager.removeDevice(integration.config.deviceId);
        break;
      case 'erp':
        erpManager.disconnect();
        break;
      case 'lims':
        // Disconnect LIMS integration
        // In production, would clean up LIMSIntegrationService
        break;
    }

    // Remove from list
    setIntegrations(prev => prev.filter(i => i.id !== integrationId));
    localStorage.setItem('vibelux-integrations', JSON.stringify(
      integrations.filter(i => i.id !== integrationId)
    ));
    
    updateSystemHealth().catch(error => console.error('Failed to update system health after removal:', error));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await updateSystemHealth();
    } catch (error) {
      console.error('Failed to refresh system health:', error);
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExportData = async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      integrations: integrations.map(i => ({
        id: i.id,
        name: i.name,
        type: i.type,
        platform: i.platform,
        status: i.status,
        lastSync: i.lastSync
      })),
      sensors: sensorManager.getAllSensors(),
      systemHealth,
      // Add last 100 sensor readings if available
      recentReadings: []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux-integration-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncNow = async () => {
    setIsRefreshing(true);
    
    // Sync each connected integration
    for (const integration of integrations.filter(i => i.status === 'connected')) {
      try {
        switch (integration.type) {
          case 'sensor':
            // Sync sensor data
            const sensorIntegration = sensorManager.getIntegration(integration.name);
            if (sensorIntegration) {
              await sensorIntegration.discoverDevices();
            }
            break;
          case 'camera':
            // Camera functionality removed
            break;
          case 'scada':
            // Update SCADA tags - refresh alarms
            scadaManager.getActiveAlarms();
            break;
          case 'erp':
            // Sync ERP data
            if (erpManager.getIntegration()) {
              await erpManager.getIntegration()!.getInventory();
            }
            break;
          case 'lims':
            // Sync LIMS test results
            // In production, would fetch latest test results
            break;
        }
        
        // Update last sync time
        setIntegrations(prev => prev.map(i => 
          i.id === integration.id 
            ? { ...i, lastSync: new Date() }
            : i
        ));
      } catch (error) {
        console.error(`Failed to sync ${integration.name}:`, error);
      }
    }
    
    try {
      await updateSystemHealth();
    } catch (error) {
      console.error('Failed to update system health after sync:', error);
    }
    localStorage.setItem('vibelux-integrations', JSON.stringify(integrations));
    setIsRefreshing(false);
  };

  const getIntegrationIcon = (type: Integration['type']) => {
    switch (type) {
      case 'sensor': return <Thermometer className="w-5 h-5" />;
      // case 'camera': return <Camera className="w-5 h-5" />; // Removed to avoid patent issues
      case 'scada': return <Activity className="w-5 h-5" />;
      case 'erp': return <Package className="w-5 h-5" />;
      case 'climate': return <Wind className="w-5 h-5" />;
      case 'lims': return <FlaskConical className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected': return <XCircle className="w-5 h-5 text-gray-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'connecting': return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Integrations</h1>
            <p className="text-gray-400">Connect and manage external systems</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className={`p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddIntegration(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Integration
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Thermometer className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">{systemHealth.sensors.total}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">IoT Sensors</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-400">Online</span>
                <span>{systemHealth.sensors.online}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Offline</span>
                <span>{systemHealth.sensors.offline}</span>
              </div>
            </div>
          </div>

          {/* Camera section removed to avoid patent issues */}
          {/* <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Camera className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Cameras</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-400">Online</span>
                <span>0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Offline</span>
                <span>0</span>
              </div>
            </div>
          </div> */}

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold">{systemHealth.scada.alarms}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">SCADA Alarms</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Tags</span>
                <span>{systemHealth.scada.tags}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">PLCs</span>
                <span>{systemHealth.scada.plcs}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold">{systemHealth.erp.plants}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Active Plants</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Batches</span>
                <span>{systemHealth.erp.batches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Packages</span>
                <span>{systemHealth.erp.packages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Integrations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Active Integrations</h2>
          
          {integrations.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-12 text-center">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No integrations configured</p>
              <button
                onClick={() => setShowAddIntegration(true)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
              >
                Add Your First Integration
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {integrations.map(integration => (
                <div
                  key={integration.id}
                  className="bg-gray-900 rounded-lg p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      {getIntegrationIcon(integration.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{integration.name}</h3>
                      <p className="text-sm text-gray-400">
                        {integration.platform} • {integration.type}
                      </p>
                      {integration.lastSync && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <span className="text-sm capitalize">{integration.status}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedIntegration(integration)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveIntegration(integration.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-red-400"
                      >
                        <Unlink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <button 
            onClick={handleExportData}
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-blue-400" />
            <div className="text-left">
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-gray-400">Download sensor readings</p>
            </div>
          </button>
          
          <button 
            onClick={handleSyncNow}
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all flex items-center gap-3"
          >
            <Upload className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <p className="font-medium">Sync Now</p>
              <p className="text-sm text-gray-400">Force data synchronization</p>
            </div>
          </button>
          
          <button 
            onClick={() => setShowSecurityModal(true)}
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all flex items-center gap-3"
          >
            <Shield className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <p className="font-medium">Security</p>
              <p className="text-sm text-gray-400">Manage API keys</p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddIntegration && (
        <AddIntegrationModal
          onClose={() => setShowAddIntegration(false)}
          onAdd={handleAddIntegration}
        />
      )}

      {/* Integration Settings Modal */}
      {selectedIntegration && (
        <IntegrationSettingsModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <SecurityModal
          integrations={integrations}
          onClose={() => setShowSecurityModal(false)}
        />
      )}
    </div>
  );
}

// Integration types definition - moved outside modal for proper scope
const integrationTypes = [
    { 
      id: 'sensor', 
      name: 'IoT Sensors', 
      icon: Thermometer, 
      platforms: [
        'onset-hobo', 'trolmaster', 'aranet', 'sensoterra', 'metos', 'davis-instruments',
        'campbell-scientific', 'meter-group', 'sentek', 'irrometer', 'acclima',
        'stevens-water', 'adcon-telemetry', 'zynect', 'smart-elements', 'modbus-tcp',
        'wifi-sensors', 'lora-sensors', 'sigfox-sensors', 'nb-iot-sensors'
      ] 
    },
    { 
      id: 'scada', 
      name: 'SCADA/PLC', 
      icon: Activity, 
      platforms: [
        'allen-bradley', 'siemens-s7', 'schneider-modicon', 'mitsubishi-fx', 'omron-sysmac',
        'ge-fanuc', 'honeywell', 'yokogawa', 'abb-ac800m', 'beckhoff-twincat',
        'phoenix-contact', 'wago', 'red-lion', 'weintek', 'proface', 'wonderware',
        'ignition-scada', 'citect', 'wincc', 'factory-talk', 'kepware'
      ] 
    },
    { 
      id: 'erp', 
      name: 'ERP/Compliance', 
      icon: Package, 
      platforms: [
        'metrc', 'biotrack-thc', 'leafdata', 'mjfreeway', 'mjplatform', 'treez',
        'dispensary-management', 'greenline-pos', 'trellis', 'flowhub', 'leaflink',
        'cova', 'dutchie', 'iheartjane', 'weedmaps', 'seedtodata', 'sage-intacct',
        'quickbooks-enterprise', 'netsuite', 'sap-business-one', 'microsoft-dynamics',
        'oracle-erp', 'infor-cloudsuite', 'epicor', 'syspro', 'ifs-applications'
      ] 
    },
    { 
      id: 'climate', 
      name: 'Climate Systems', 
      icon: Wind, 
      platforms: [
        'priva', 'ridder', 'hoogendoorn', 'argus', 'netafim', 'irritec',
        'grodan', 'climate-control-systems', 'autogrow', 'phytech', 'semios',
        'certhon', 'bosman-van-zaal', 'dalsem', 'prins-greenhouses'
      ] 
    },
    { 
      id: 'lims', 
      name: 'Lab Testing (LIMS)', 
      icon: FlaskConical, 
      platforms: [
        'confident-cannabis', 'steep-hill', 'sc-labs', 'labware', 'labvantage',
        'sample-manager', 'element', 'eurofins', 'anresco', 'cw-analytical',
        'proverde', 'mcr-labs', 'cannasafe', 'belcosta', 'encore-labs'
      ] 
    }
  ];

// Platform name mapping function - moved outside modal for proper scope
const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    // IoT Sensors
    'onset-hobo': 'Onset HOBO',
    'trolmaster': 'Trolmaster',
    'aranet': 'Aranet',
    'sensoterra': 'Sensoterra',
    'metos': 'Metos',
    'davis-instruments': 'Davis Instruments',
    'campbell-scientific': 'Campbell Scientific',
    'meter-group': 'METER Group',
    'sentek': 'Sentek',
    'irrometer': 'Irrometer',
    'acclima': 'Acclima',
    'stevens-water': 'Stevens Water',
    'adcon-telemetry': 'ADCON Telemetry',
    'zynect': 'Zynect',
    'smart-elements': 'Smart Elements',
    'modbus-tcp': 'Modbus TCP',
    'wifi-sensors': 'WiFi Sensors',
    'lora-sensors': 'LoRa Sensors',
    'sigfox-sensors': 'Sigfox Sensors',
    'nb-iot-sensors': 'NB-IoT Sensors',
    
    // SCADA/PLC Systems
    'allen-bradley': 'Allen-Bradley (Rockwell)',
    'siemens-s7': 'Siemens S7',
    'schneider-modicon': 'Schneider Modicon',
    'mitsubishi-fx': 'Mitsubishi FX',
    'omron-sysmac': 'Omron SYSMAC',
    'ge-fanuc': 'GE Fanuc',
    'honeywell': 'Honeywell',
    'yokogawa': 'Yokogawa',
    'abb-ac800m': 'ABB AC800M',
    'beckhoff-twincat': 'Beckhoff TwinCAT',
    'phoenix-contact': 'Phoenix Contact',
    'wago': 'WAGO',
    'red-lion': 'Red Lion',
    'weintek': 'Weintek',
    'proface': 'Pro-face',
    'wonderware': 'Wonderware',
    'ignition-scada': 'Ignition SCADA',
    'citect': 'Citect',
    'wincc': 'WinCC',
    'factory-talk': 'FactoryTalk',
    'kepware': 'Kepware',
    
    // ERP/Compliance Systems
    'metrc': 'Metrc',
    'biotrack-thc': 'BioTrack THC',
    'leafdata': 'LeafData',
    'mjfreeway': 'MJ Freeway',
    'mjplatform': 'MJ Platform',
    'treez': 'Treez',
    'dispensary-management': 'Dispensary Management',
    'greenline-pos': 'Greenline POS',
    'trellis': 'Trellis',
    'flowhub': 'Flowhub',
    'leaflink': 'LeafLink',
    'cova': 'Cova',
    'dutchie': 'Dutchie',
    'iheartjane': 'iHeartJane',
    'weedmaps': 'Weedmaps',
    'seedtodata': 'Seed to Data',
    'sage-intacct': 'Sage Intacct',
    'quickbooks-enterprise': 'QuickBooks Enterprise',
    'netsuite': 'NetSuite',
    'sap-business-one': 'SAP Business One',
    'microsoft-dynamics': 'Microsoft Dynamics',
    'oracle-erp': 'Oracle ERP',
    'infor-cloudsuite': 'Infor CloudSuite',
    'epicor': 'Epicor',
    'syspro': 'SYSPRO',
    'ifs-applications': 'IFS Applications',
    
    // Climate Systems
    'priva': 'Priva',
    'ridder': 'Ridder',
    'hoogendoorn': 'Hoogendoorn',
    'argus': 'Argus',
    'netafim': 'Netafim',
    'irritec': 'Irritec',
    'grodan': 'Grodan',
    'climate-control-systems': 'Climate Control Systems',
    'autogrow': 'Autogrow',
    'phytech': 'Phytech',
    'semios': 'Semios',
    'certhon': 'Certhon',
    'bosman-van-zaal': 'Bosman Van Zaal',
    'dalsem': 'Dalsem',
    'prins-greenhouses': 'Prins Greenhouses',
    
    // LIMS Systems
    'confident-cannabis': 'Confident Cannabis',
    'steep-hill': 'Steep Hill Labs',
    'sc-labs': 'SC Labs',
    'labware': 'LabWare LIMS',
    'labvantage': 'LabVantage',
    'sample-manager': 'Sample Manager LIMS',
    'element': 'Element LIMS',
    'eurofins': 'Eurofins',
    'anresco': 'Anresco Laboratories',
    'cw-analytical': 'CW Analytical',
    'proverde': 'ProVerde Laboratories',
    'mcr-labs': 'MCR Labs',
    'cannasafe': 'CannaSafe',
    'belcosta': 'BelCosta Labs',
    'encore-labs': 'Encore Labs',
    
    'custom': 'Custom Integration'
  };
  return names[platform] || platform.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Add Integration Modal Component
function AddIntegrationModal({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void; 
  onAdd: (config: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<any>({
    type: '',
    platform: '',
    name: '',
    apiKey: '',
    baseUrl: '',
    username: '',
    password: '',
    ipAddress: '',
    subnet: '192.168.1',
    licenseNumber: '',
    facilityId: ''
  });

  const handleSubmit = () => {
    onAdd(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Add Integration</h2>
          <p className="text-sm text-gray-400 mt-1">Connect external systems to Vibelux</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Integration Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {integrationTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setConfig({ ...config, type: type.id });
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.type === type.id
                        ? 'border-purple-600 bg-purple-600/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <type.icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">{type.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.platforms.length} platforms
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Platform</h3>
              
              {/* Search platforms */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search platforms..."
                  value={config.searchTerm || ''}
                  onChange={(e) => setConfig({ ...config, searchTerm: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {integrationTypes
                  .find(t => t.id === config.type)
                  ?.platforms.filter(platform => 
                    !config.searchTerm || 
                    getPlatformName(platform).toLowerCase().includes(config.searchTerm.toLowerCase()) ||
                    platform.toLowerCase().includes(config.searchTerm.toLowerCase())
                  ).map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        setConfig({ ...config, platform });
                        setStep(3);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        config.platform === platform
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <p className="font-medium">{getPlatformName(platform)}</p>
                      <p className="text-xs text-gray-400 mt-1">{platform}</p>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Configure Connection</h3>
              
              <div>
                <label className="text-sm text-gray-400">Integration Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="My Integration"
                />
              </div>

              {/* Dynamic fields based on type and platform */}
              {(config.type === 'sensor' || config.type === 'erp' || config.type === 'climate') && (
                <div>
                  <label className="text-sm text-gray-400">
                    {config.type === 'climate' ? 'API Key / Access Token' : 'API Key'}
                  </label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              )}

              {config.type === 'camera' && (
                <>
                  <div>
                    <label className="text-sm text-gray-400">Username</label>
                    <input
                      type="text"
                      value={config.username}
                      onChange={(e) => setConfig({ ...config, username: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Password</label>
                    <input
                      type="password"
                      value={config.password}
                      onChange={(e) => setConfig({ ...config, password: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Subnet</label>
                    <input
                      type="text"
                      value={config.subnet}
                      onChange={(e) => setConfig({ ...config, subnet: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </>
              )}

              {config.type === 'scada' && (
                <>
                  <div>
                    <label className="text-sm text-gray-400">IP Address</label>
                    <input
                      type="text"
                      value={config.ipAddress}
                      onChange={(e) => setConfig({ ...config, ipAddress: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  {config.platform === 'allen-bradley' && (
                    <div>
                      <label className="text-sm text-gray-400">Slot Number</label>
                      <input
                        type="number"
                        value={config.slot || 0}
                        onChange={(e) => setConfig({ ...config, slot: parseInt(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  )}
                </>
              )}

              {config.type === 'erp' && (
                <>
                  <div>
                    <label className="text-sm text-gray-400">License Number</label>
                    <input
                      type="text"
                      value={config.licenseNumber}
                      onChange={(e) => setConfig({ ...config, licenseNumber: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Facility ID</label>
                    <input
                      type="text"
                      value={config.facilityId}
                      onChange={(e) => setConfig({ ...config, facilityId: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm text-gray-400">Base URL (optional)</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="https://api.example.com"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
            >
              Back
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
            >
              Cancel
            </button>
            {step === 3 && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Integration Settings Modal
function IntegrationSettingsModal({
  integration,
  onClose
}: {
  integration: Integration;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{integration.name} Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-400">Platform</p>
            <p className="font-medium">{integration.platform}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Status</p>
            <p className="font-medium capitalize">{integration.status}</p>
          </div>

          {integration.lastSync && (
            <div>
              <p className="text-sm text-gray-400">Last Synchronization</p>
              <p className="font-medium">{new Date(integration.lastSync).toLocaleString()}</p>
            </div>
          )}

          {integration.deviceCount !== undefined && (
            <div>
              <p className="text-sm text-gray-400">Connected Devices</p>
              <p className="font-medium">{integration.deviceCount}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-800">
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center justify-center gap-2">
              <Key className="w-4 h-4" />
              Update Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Modal Component
function SecurityModal({
  integrations,
  onClose
}: {
  integrations: Integration[];
  onClose: () => void;
}) {
  const [apiKeys, setApiKeys] = useState<Record<string, { key: string; revealed: boolean }>>({});

  useEffect(() => {
    // Initialize API keys from integrations
    const keys: Record<string, { key: string; revealed: boolean }> = {};
    integrations.forEach(integration => {
      if (integration.config?.apiKey) {
        keys[integration.id] = {
          key: integration.config.apiKey,
          revealed: false
        };
      }
    });
    setApiKeys(keys);
  }, [integrations]);

  const toggleReveal = (integrationId: string) => {
    setApiKeys(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        revealed: !prev[integrationId].revealed
      }
    }));
  };

  const generateNewKey = () => {
    // Generate a random API key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'vblx_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * chars.length));
    }
    return key;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Security Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Keys Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">API Keys</h3>
            {Object.keys(apiKeys).length === 0 ? (
              <p className="text-gray-400">No API keys configured</p>
            ) : (
              <div className="space-y-3">
                {integrations
                  .filter(i => apiKeys[i.id])
                  .map(integration => (
                    <div key={integration.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-gray-400">{integration.platform}</p>
                        </div>
                        <button
                          onClick={() => toggleReveal(integration.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="font-mono text-sm bg-gray-900 rounded p-2">
                        {apiKeys[integration.id].revealed
                          ? apiKeys[integration.id].key
                          : '••••••••••••••••••••••••••••••••'}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Generate API Key */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-medium mb-4">Vibelux API Access</h3>
            <p className="text-gray-400 mb-4">
              Generate API keys to allow external applications to access your Vibelux data.
            </p>
            <button
              onClick={() => {
                const newKey = generateNewKey();
                navigator.clipboard.writeText(newKey);
                alert(`New API key generated and copied to clipboard: ${newKey}`);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Generate New API Key
            </button>
          </div>

          {/* Security Recommendations */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-medium mb-4">Security Recommendations</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                Rotate API keys regularly (every 90 days)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                Use environment variables to store sensitive credentials
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                Restrict API access by IP address when possible
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                Monitor API usage for suspicious activity
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                Use HTTPS for all API communications
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}