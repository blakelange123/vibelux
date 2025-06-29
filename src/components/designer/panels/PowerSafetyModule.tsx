'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, AlertTriangle, Shield, Clock, Activity,
  Settings, ChevronRight, Info, CheckCircle,
  XCircle, Timer, TrendingUp, AlertCircle,
  FileDown, Upload, X
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface PowerZone {
  id: string;
  name: string;
  fixtures: string[];
  totalWattage: number;
  circuitBreaker: number;
  priority: number;
  delayMs: number;
  enabled: boolean;
}

interface SafetyRule {
  id: string;
  name: string;
  type: 'hot-start' | 'inrush' | 'sequence' | 'load-balance';
  enabled: boolean;
  parameters: Record<string, any>;
  description: string;
}

interface PowerEvent {
  timestamp: Date;
  type: 'startup' | 'shutdown' | 'fault' | 'override';
  zone?: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export function PowerSafetyModule({ onClose }: { onClose: () => void }) {
  const { state } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'zones' | 'rules' | 'monitor' | 'settings'>('zones');
  const [powerZones, setPowerZones] = useState<PowerZone[]>([]);
  const [safetyRules, setSafetyRules] = useState<SafetyRule[]>([
    {
      id: 'hot-start-prevention',
      name: 'Hot Start Prevention',
      type: 'hot-start',
      enabled: true,
      parameters: {
        cooldownMinutes: 15,
        applyToTypes: ['hps', 'mh', 'cmh'],
        bypassVoltage: 277
      },
      description: 'Prevents HID fixtures from restarting while hot'
    },
    {
      id: 'staged-sequencing',
      name: 'Staged Power Sequencing',
      type: 'sequence',
      enabled: true,
      parameters: {
        delayBetweenZones: 5000,
        maxSimultaneousZones: 2,
        sequenceOrder: 'priority'
      },
      description: 'Stages power-on to prevent electrical spikes'
    },
    {
      id: 'inrush-limiting',
      name: 'Inrush Current Limiting',
      type: 'inrush',
      enabled: true,
      parameters: {
        maxInrushMultiplier: 3,
        softStartDuration: 2000,
        currentLimit: 80 // percentage of breaker rating
      },
      description: 'Limits inrush current during startup'
    },
    {
      id: 'load-balancing',
      name: 'Dynamic Load Balancing',
      type: 'load-balance',
      enabled: false,
      parameters: {
        maxPhaseImbalance: 10, // percentage
        redistributeOnFault: true,
        monitorInterval: 30000
      },
      description: 'Balances load across phases automatically'
    }
  ]);
  
  const [powerEvents, setPowerEvents] = useState<PowerEvent[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(false);

  // Initialize power zones from fixtures
  useEffect(() => {
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');
    
    // Group fixtures into zones based on proximity or user-defined zones
    const zones: PowerZone[] = [];
    
    // For now, create zones based on fixture rows/areas
    const zoneMap = new Map<string, string[]>();
    
    fixtures.forEach(fixture => {
      const zoneY = Math.floor(fixture.y / 10) * 10; // Group by 10ft rows
      const zoneKey = `Zone ${Math.floor(zoneY / 10) + 1}`;
      
      if (!zoneMap.has(zoneKey)) {
        zoneMap.set(zoneKey, []);
      }
      zoneMap.get(zoneKey)!.push(fixture.id);
    });
    
    let priority = 1;
    zoneMap.forEach((fixtureIds, zoneName) => {
      const zoneFixtures = fixtures.filter(f => fixtureIds.includes(f.id));
      const totalWattage = zoneFixtures.reduce((sum, f) => sum + ((f as any).model?.wattage || 600), 0);
      
      zones.push({
        id: `zone-${priority}`,
        name: zoneName,
        fixtures: fixtureIds,
        totalWattage,
        circuitBreaker: Math.ceil(totalWattage / 240 / 0.8), // 80% rule
        priority,
        delayMs: (priority - 1) * 5000,
        enabled: true
      });
      priority++;
    });
    
    setPowerZones(zones);
  }, [state.objects]);

  const addPowerEvent = (event: Omit<PowerEvent, 'timestamp'>) => {
    setPowerEvents(prev => [{
      ...event,
      timestamp: new Date()
    }, ...prev].slice(0, 100)); // Keep last 100 events
  };

  const simulatePowerSequence = async () => {
    setSimulationRunning(true);
    addPowerEvent({
      type: 'startup',
      message: 'Initiating power sequence simulation',
      severity: 'info'
    });

    const enabledZones = powerZones.filter(z => z.enabled).sort((a, b) => a.priority - b.priority);
    
    for (let i = 0; i < enabledZones.length; i++) {
      const zone = enabledZones[i];
      
      // Check hot-start prevention
      if (safetyRules.find(r => r.id === 'hot-start-prevention')?.enabled) {
        addPowerEvent({
          type: 'startup',
          zone: zone.name,
          message: `Checking hot-start status for ${zone.name}`,
          severity: 'info'
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Apply delay
      if (zone.delayMs > 0) {
        addPowerEvent({
          type: 'startup',
          zone: zone.name,
          message: `Waiting ${zone.delayMs}ms before powering ${zone.name}`,
          severity: 'info'
        });
        await new Promise(resolve => setTimeout(resolve, zone.delayMs));
      }
      
      // Power on zone
      addPowerEvent({
        type: 'startup',
        zone: zone.name,
        message: `Powering on ${zone.name} (${zone.totalWattage}W on ${zone.circuitBreaker}A breaker)`,
        severity: 'info'
      });
      
      // Check for issues
      if (zone.totalWattage > zone.circuitBreaker * 240 * 0.8) {
        addPowerEvent({
          type: 'fault',
          zone: zone.name,
          message: `Warning: ${zone.name} exceeds 80% breaker capacity!`,
          severity: 'warning'
        });
      }
    }
    
    addPowerEvent({
      type: 'startup',
      message: 'Power sequence completed successfully',
      severity: 'info'
    });
    
    setSimulationRunning(false);
    showNotification('success', 'Power sequence simulation completed');
  };

  const calculateTotalInrush = () => {
    const enabledZones = powerZones.filter(z => z.enabled);
    const inrushMultiplier = safetyRules.find(r => r.id === 'inrush-limiting')?.parameters.maxInrushMultiplier || 3;
    
    if (safetyRules.find(r => r.id === 'staged-sequencing')?.enabled) {
      // With staging, only concurrent zones create inrush
      const maxSimultaneous = safetyRules.find(r => r.id === 'staged-sequencing')?.parameters.maxSimultaneousZones || 1;
      const largestZones = enabledZones.sort((a, b) => b.totalWattage - a.totalWattage).slice(0, maxSimultaneous);
      return largestZones.reduce((sum, zone) => sum + zone.totalWattage, 0) * inrushMultiplier;
    } else {
      // Without staging, all zones create inrush simultaneously
      return enabledZones.reduce((sum, zone) => sum + zone.totalWattage, 0) * inrushMultiplier;
    }
  };

  const renderZonesTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Power Zones Configuration</h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {powerZones.map((zone, index) => (
            <div key={zone.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={zone.enabled}
                    onChange={(e) => {
                      const updated = [...powerZones];
                      updated[index].enabled = e.target.checked;
                      setPowerZones(updated);
                    }}
                    className="w-4 h-4 text-purple-600"
                  />
                  <h4 className="font-medium text-white">{zone.name}</h4>
                  <span className="text-xs text-gray-400">Priority {zone.priority}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-300">{zone.fixtures.length} fixtures</span>
                  <span className="text-yellow-400">{zone.totalWattage}W</span>
                  <span className="text-blue-400">{zone.circuitBreaker}A breaker</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="text-xs text-gray-400">Priority</label>
                  <input
                    type="number"
                    value={zone.priority}
                    onChange={(e) => {
                      const updated = [...powerZones];
                      updated[index].priority = parseInt(e.target.value) || 1;
                      setPowerZones(updated);
                    }}
                    min="1"
                    max={powerZones.length}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Delay (ms)</label>
                  <input
                    type="number"
                    value={zone.delayMs}
                    onChange={(e) => {
                      const updated = [...powerZones];
                      updated[index].delayMs = parseInt(e.target.value) || 0;
                      setPowerZones(updated);
                    }}
                    min="0"
                    step="1000"
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Breaker (A)</label>
                  <input
                    type="number"
                    value={zone.circuitBreaker}
                    onChange={(e) => {
                      const updated = [...powerZones];
                      updated[index].circuitBreaker = parseInt(e.target.value) || 20;
                      setPowerZones(updated);
                    }}
                    min="15"
                    step="5"
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
              </div>
              
              {zone.totalWattage > zone.circuitBreaker * 240 * 0.8 && (
                <div className="mt-2 flex items-center gap-2 text-yellow-500 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Exceeds 80% breaker capacity</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Power Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h4 className="font-medium text-white">Total Connected Load</h4>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {powerZones.reduce((sum, z) => sum + (z.enabled ? z.totalWattage : 0), 0)}W
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h4 className="font-medium text-white">Peak Inrush Current</h4>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {Math.round(calculateTotalInrush() / 240)}A
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div className="space-y-4">
      {safetyRules.map((rule, index) => (
        <div key={rule.id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => {
                  const updated = [...safetyRules];
                  updated[index].enabled = e.target.checked;
                  setSafetyRules(updated);
                }}
                className="w-4 h-4 text-purple-600"
              />
              <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                rule.enabled ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
              }`}>
                {rule.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          
          <p className="text-sm text-gray-300 mb-3">{rule.description}</p>
          
          {rule.enabled && (
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
              {rule.type === 'hot-start' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cooldown Period:</span>
                    <span className="text-white">{rule.parameters.cooldownMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Applies to:</span>
                    <span className="text-white">{rule.parameters.applyToTypes.join(', ').toUpperCase()}</span>
                  </div>
                </>
              )}
              
              {rule.type === 'sequence' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Zone Delay:</span>
                    <span className="text-white">{rule.parameters.delayBetweenZones}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Simultaneous:</span>
                    <span className="text-white">{rule.parameters.maxSimultaneousZones} zones</span>
                  </div>
                </>
              )}
              
              {rule.type === 'inrush' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Inrush Multiplier:</span>
                    <span className="text-white">{rule.parameters.maxInrushMultiplier}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Limit:</span>
                    <span className="text-white">{rule.parameters.currentLimit}% of breaker</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMonitorTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Power Sequence Simulator</h3>
          <button
            onClick={simulatePowerSequence}
            disabled={simulationRunning}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              simulationRunning 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {simulationRunning ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                Running...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Run Simulation
              </>
            )}
          </button>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-3 h-64 overflow-y-auto space-y-2">
          {powerEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events recorded. Run a simulation to see the power sequence.</p>
          ) : (
            powerEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <span className="text-gray-500 text-xs">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {event.severity === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    {event.severity === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {event.severity === 'info' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    <span className="text-white">{event.message}</span>
                  </div>
                  {event.zone && (
                    <span className="text-xs text-gray-400 ml-6">{event.zone}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-white">Total Startup Time</h4>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {Math.round(powerZones.filter(z => z.enabled).reduce((max, z) => Math.max(max, z.delayMs), 0) / 1000)}s
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-white">Safety Rules Active</h4>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {safetyRules.filter(r => r.enabled).length}/{safetyRules.length}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h4 className="font-medium text-white">Zones Configured</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {powerZones.filter(z => z.enabled).length}/{powerZones.length}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Electrical Configuration</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Facility Voltage</label>
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg">
              <option value="120">120V Single Phase</option>
              <option value="208">208V Three Phase</option>
              <option value="240">240V Single Phase</option>
              <option value="277">277V Single Phase</option>
              <option value="480">480V Three Phase</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Main Breaker Size</label>
            <input
              type="number"
              defaultValue="200"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              min="100"
              step="50"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Integration Settings</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-purple-600" />
            <span className="text-white">Enable BMS Integration</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-purple-600" />
            <span className="text-white">Send Power Events to SCADA</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-purple-600" defaultChecked />
            <span className="text-white">Log Events to Database</span>
          </label>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Export Configuration</h3>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export Safety Config
          </button>
          
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Config
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Power Safety Module</h2>
              <p className="text-sm text-gray-400">Electrical safety and sequencing control</p>
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
          {(['zones', 'rules', 'monitor', 'settings'] as const).map(tab => (
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
          {activeTab === 'zones' && renderZonesTab()}
          {activeTab === 'rules' && renderRulesTab()}
          {activeTab === 'monitor' && renderMonitorTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
}