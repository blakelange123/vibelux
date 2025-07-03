'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Settings, Play, Pause,
  Download, Upload, Terminal, Zap,
  AlertCircle, CheckCircle, RefreshCw, X,
  Sliders, Database, Activity
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { 
  ModbusLightingControl, 
  createLightingController, 
  REGISTER_MAPS,
  ModbusConfig,
  ModbusRegisterMap
} from '@/lib/modbus-lighting-control';

interface ZoneControl {
  id: number;
  name: string;
  enabled: boolean;
  dimming: number;
  intensity: number;
  actualIntensity: number;
  temperature: number;
  power: number;
}

export function ModbusLightingControlPanel({ onClose }: { onClose: () => void }) {
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'connection' | 'control' | 'registers' | 'logs'>('connection');
  const [connectionType, setConnectionType] = useState<'TCP' | 'RTU'>('TCP');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [selectedProtocol, setSelectedProtocol] = useState<'modbus-growwise' | 'modbus-generic'>('modbus-growwise');
  
  const [config, setConfig] = useState<ModbusConfig>({
    type: 'TCP',
    host: '192.168.1.100',
    tcpPort: 502,
    slaveId: 1,
    timeout: 5000,
    retries: 3
  });
  
  const [zones, setZones] = useState<ZoneControl[]>([
    { id: 0, name: 'Zone 1', enabled: true, dimming: 100, intensity: 450, actualIntensity: 445, temperature: 45, power: 580 },
    { id: 1, name: 'Zone 2', enabled: true, dimming: 80, intensity: 400, actualIntensity: 398, temperature: 43, power: 460 },
    { id: 2, name: 'Zone 3', enabled: false, dimming: 0, intensity: 0, actualIntensity: 0, temperature: 25, power: 0 },
    { id: 3, name: 'Zone 4', enabled: true, dimming: 60, intensity: 300, actualIntensity: 295, temperature: 41, power: 340 }
  ]);
  
  const [controller, setController] = useState<ModbusLightingControl | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [customRegisterMap, setCustomRegisterMap] = useState<string>(
    JSON.stringify(REGISTER_MAPS.generic, null, 2)
  );
  
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    setLogs(prev => [`${timestamp} ${prefix} ${message}`, ...prev].slice(0, 100));
  };
  
  const handleConnect = async () => {
    setConnectionStatus('connecting');
    addLog('Initiating connection...', 'info');
    
    try {
      const newController = createLightingController(selectedProtocol, config);
      if (!newController) {
        throw new Error('Failed to create controller');
      }
      
      const connected = await newController.connect();
      if (connected) {
        setController(newController);
        setConnectionStatus('connected');
        addLog(`Connected to ${config.type === 'TCP' ? config.host : config.port}`, 'success');
        showNotification('success', 'Connected to Modbus device');
        
        // Start polling for status
        startStatusPolling(newController);
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      addLog(`Connection failed: ${error}`, 'error');
      showNotification('error', 'Failed to connect to Modbus device');
    }
  };
  
  const handleDisconnect = async () => {
    if (controller) {
      await controller.disconnect();
      setController(null);
      setConnectionStatus('disconnected');
      addLog('Disconnected', 'info');
      showNotification('info', 'Disconnected from Modbus device');
    }
  };
  
  const startStatusPolling = (ctrl: ModbusLightingControl) => {
    const pollInterval = setInterval(async () => {
      const status = await ctrl.readStatus();
      if (status) {
        setZones(zones => zones.map((zone, index) => {
          const statusData = status.zones[index];
          if (statusData) {
            return {
              ...zone,
              actualIntensity: statusData.actualIntensity,
              temperature: statusData.temperature,
              power: statusData.powerConsumption
            };
          }
          return zone;
        }));
      }
    }, 2000); // Poll every 2 seconds
    
    // Store interval ID for cleanup
    (ctrl as any).pollInterval = pollInterval;
  };
  
  const updateZone = async (zoneId: number, field: keyof ZoneControl, value: any) => {
    if (!controller || connectionStatus !== 'connected') return;
    
    const newZones = [...zones];
    newZones[zoneId] = { ...newZones[zoneId], [field]: value };
    setZones(newZones);
    
    try {
      switch (field) {
        case 'enabled':
          // This would need zone enable register support
          addLog(`Zone ${zoneId + 1} ${value ? 'enabled' : 'disabled'}`, 'success');
          break;
        case 'dimming':
          await controller.setZoneDimming(zoneId, value);
          addLog(`Zone ${zoneId + 1} dimming set to ${value}%`, 'success');
          break;
        case 'intensity':
          await controller.setZoneIntensity(zoneId, value);
          addLog(`Zone ${zoneId + 1} intensity set to ${value} PPFD`, 'success');
          break;
      }
    } catch (error) {
      addLog(`Failed to update zone ${zoneId + 1}: ${error}`, 'error');
      showNotification('error', `Failed to update zone ${zoneId + 1}`);
    }
  };
  
  const applyPreset = async (preset: 'off' | 'low' | 'medium' | 'high' | 'sunrise' | 'sunset') => {
    if (!controller || connectionStatus !== 'connected') return;
    
    const presets = {
      off: { dimming: 0, intensity: 0 },
      low: { dimming: 30, intensity: 200 },
      medium: { dimming: 60, intensity: 400 },
      high: { dimming: 100, intensity: 800 },
      sunrise: { dimming: 20, intensity: 100 },
      sunset: { dimming: 10, intensity: 50 }
    };
    
    const settings = presets[preset];
    
    try {
      const recipe = {
        zones: zones.map(zone => ({
          enabled: preset !== 'off',
          dimming: settings.dimming,
          intensity: settings.intensity
        }))
      };
      
      await controller.applyLightingRecipe(recipe);
      
      // Update local state
      setZones(zones => zones.map(zone => ({
        ...zone,
        enabled: preset !== 'off',
        dimming: settings.dimming,
        intensity: settings.intensity
      })));
      
      addLog(`Applied preset: ${preset}`, 'success');
      showNotification('success', `Applied ${preset} preset to all zones`);
    } catch (error) {
      addLog(`Failed to apply preset: ${error}`, 'error');
      showNotification('error', 'Failed to apply preset');
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controller) {
        const interval = (controller as any).pollInterval;
        if (interval) clearInterval(interval);
        controller.disconnect();
      }
    };
  }, [controller]);
  
  const renderConnectionTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Connection Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Protocol</label>
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              disabled={connectionStatus !== 'disconnected'}
            >
              <option value="modbus-growwise">Modbus - GrowWise</option>
              <option value="modbus-generic">Modbus - Generic</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Connection Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setConnectionType('TCP');
                  setConfig({ ...config, type: 'TCP' });
                }}
                className={`px-4 py-2 rounded-lg ${
                  connectionType === 'TCP'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={connectionStatus !== 'disconnected'}
              >
                Modbus TCP
              </button>
              <button
                onClick={() => {
                  setConnectionType('RTU');
                  setConfig({ ...config, type: 'RTU' });
                }}
                className={`px-4 py-2 rounded-lg ${
                  connectionType === 'RTU'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={connectionStatus !== 'disconnected'}
              >
                Modbus RTU
              </button>
            </div>
          </div>
          
          {connectionType === 'TCP' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Host/IP Address</label>
                  <input
                    type="text"
                    value={config.host || ''}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    placeholder="192.168.1.100"
                    disabled={connectionStatus !== 'disconnected'}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Port</label>
                  <input
                    type="number"
                    value={config.tcpPort || 502}
                    onChange={(e) => setConfig({ ...config, tcpPort: parseInt(e.target.value) || 502 })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    disabled={connectionStatus !== 'disconnected'}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Serial Port</label>
                  <input
                    type="text"
                    value={config.port || ''}
                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    placeholder="/dev/ttyUSB0"
                    disabled={connectionStatus !== 'disconnected'}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Baud Rate</label>
                  <select
                    value={config.baudRate || 9600}
                    onChange={(e) => setConfig({ ...config, baudRate: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    disabled={connectionStatus !== 'disconnected'}
                  >
                    <option value="9600">9600</option>
                    <option value="19200">19200</option>
                    <option value="38400">38400</option>
                    <option value="57600">57600</option>
                    <option value="115200">115200</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Data Bits</label>
                  <select
                    value={config.dataBits || 8}
                    onChange={(e) => setConfig({ ...config, dataBits: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    disabled={connectionStatus !== 'disconnected'}
                  >
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Stop Bits</label>
                  <select
                    value={config.stopBits || 1}
                    onChange={(e) => setConfig({ ...config, stopBits: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    disabled={connectionStatus !== 'disconnected'}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Parity</label>
                  <select
                    value={config.parity || 'none'}
                    onChange={(e) => setConfig({ ...config, parity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    disabled={connectionStatus !== 'disconnected'}
                  >
                    <option value="none">None</option>
                    <option value="even">Even</option>
                    <option value="odd">Odd</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Slave ID</label>
              <input
                type="number"
                value={config.slaveId}
                onChange={(e) => setConfig({ ...config, slaveId: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                min="1"
                max="247"
                disabled={connectionStatus !== 'disconnected'}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout || 5000}
                onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 5000 })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                disabled={connectionStatus !== 'disconnected'}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Retries</label>
              <input
                type="number"
                value={config.retries || 3}
                onChange={(e) => setConfig({ ...config, retries: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                disabled={connectionStatus !== 'disconnected'}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : connectionStatus === 'connecting' ? (
              <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm text-gray-400">
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
          
          <button
            onClick={connectionStatus === 'disconnected' ? handleConnect : handleDisconnect}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
              connectionStatus === 'disconnected'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : connectionStatus === 'connecting'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'disconnected' ? (
              <>
                <Wifi className="w-4 h-4" />
                Connect
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                Disconnect
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Connection Profiles</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-white">GrowWise Controller #1</span>
            <button className="text-purple-400 hover:text-purple-300">Load</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-white">Test Lab System</span>
            <button className="text-purple-400 hover:text-purple-300">Load</button>
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg w-full">
          Save Current Profile
        </button>
      </div>
    </div>
  );
  
  const renderControlTab = () => (
    <div className="space-y-6">
      {connectionStatus !== 'connected' ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <WifiOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect to a Modbus device to control lighting</p>
        </div>
      ) : (
        <>
          {/* Quick Presets */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-6 gap-2">
              <button
                onClick={() => applyPreset('off')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Off
              </button>
              <button
                onClick={() => applyPreset('low')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Low
              </button>
              <button
                onClick={() => applyPreset('medium')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Medium
              </button>
              <button
                onClick={() => applyPreset('high')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                High
              </button>
              <button
                onClick={() => applyPreset('sunrise')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Sunrise
              </button>
              <button
                onClick={() => applyPreset('sunset')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Sunset
              </button>
            </div>
          </div>
          
          {/* Zone Controls */}
          <div className="space-y-4">
            {zones.map(zone => (
              <div key={zone.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={zone.enabled}
                      onChange={(e) => updateZone(zone.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-white">Enabled</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Dimming Level</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        value={zone.dimming}
                        onChange={(e) => updateZone(zone.id, 'dimming', parseInt(e.target.value))}
                        min="0"
                        max="100"
                        className="flex-1"
                        disabled={!zone.enabled}
                      />
                      <span className="text-white font-medium w-12 text-right">{zone.dimming}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Intensity (PPFD)</label>
                    <input
                      type="number"
                      value={zone.intensity}
                      onChange={(e) => updateZone(zone.id, 'intensity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                      disabled={!zone.enabled}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{zone.actualIntensity}</div>
                    <div className="text-xs text-gray-400">Actual PPFD</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{zone.temperature}°C</div>
                    <div className="text-xs text-gray-400">Temperature</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{zone.power}W</div>
                    <div className="text-xs text-gray-400">Power</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  
  const renderRegistersTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Register Map Configuration</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Custom Register Map (JSON)
          </label>
          <textarea
            value={customRegisterMap}
            onChange={(e) => setCustomRegisterMap(e.target.value)}
            className="w-full h-96 px-3 py-2 bg-gray-900 text-green-400 font-mono text-sm rounded-lg"
            spellCheck={false}
          />
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            Validate JSON
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Load Template
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Export Map
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Register Templates</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <div className="font-medium text-white">GrowWise Standard</div>
            <div className="text-sm text-gray-400">4 zones, dimming + intensity control</div>
          </button>
          <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <div className="font-medium text-white">Generic Single Channel</div>
            <div className="text-sm text-gray-400">Basic on/off and dimming</div>
          </button>
          <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <div className="font-medium text-white">Multi-Spectrum</div>
            <div className="text-sm text-gray-400">RGB + White + Far Red control</div>
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderLogsTab = () => (
    <div className="bg-gray-800 rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Communication Log</h3>
        <button
          onClick={() => setLogs([])}
          className="text-sm text-gray-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-4 h-[calc(100%-60px)] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No log entries</p>
        ) : (
          <div className="space-y-1 font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-300">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Modbus Lighting Control</h2>
              <p className="text-sm text-gray-400">Industrial protocol integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['connection', 'control', 'registers', 'logs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'connection' && renderConnectionTab()}
          {activeTab === 'control' && renderControlTab()}
          {activeTab === 'registers' && renderRegistersTab()}
          {activeTab === 'logs' && renderLogsTab()}
        </div>
      </div>
    </div>
  );
}