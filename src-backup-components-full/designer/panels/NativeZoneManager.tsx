'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Trash2, Settings, Clock,
  Sun, Moon, Sunrise, Sunset, Copy,
  Save, Play, Pause, ChevronRight, ChevronDown,
  Zap, Leaf, Calendar, BarChart3, X,
  Edit2, Check, AlertCircle
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { cropDatabase, getCropData } from '@/lib/crop-database';

interface LightSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  intensity: number; // percentage
  spectrum?: {
    blue: number;
    green: number;
    red: number;
    farRed: number;
  };
  rampDuration: number; // minutes
}

interface Zone {
  id: string;
  name: string;
  color: string;
  fixtures: string[];
  cropType: string;
  growthStage: 'propagation' | 'vegetative' | 'flowering' | 'finishing';
  targetPPFD: number;
  targetDLI: number;
  photoperiod: number; // hours
  schedules: LightSchedule[];
  enabled: boolean;
  area?: number; // square feet
}

interface ZoneTransition {
  fromZone: string;
  toZone: string;
  daysAfterStart: number;
  percentageToMove: number;
}

export function NativeZoneManager({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [transitions, setTransitions] = useState<ZoneTransition[]>([]);
  const [activeTab, setActiveTab] = useState<'zones' | 'schedules' | 'transitions' | 'analytics'>('zones');
  const [simulationRunning, setSimulationRunning] = useState(false);
  
  // Predefined zone templates
  const zoneTemplates = {
    propagation: {
      color: '#10b981',
      targetPPFD: 150,
      targetDLI: 13,
      photoperiod: 18,
      growthStage: 'propagation' as const,
      schedules: [{
        id: 'prop-day',
        name: 'Propagation Day',
        startTime: '06:00',
        endTime: '00:00',
        intensity: 100,
        spectrum: { blue: 30, green: 20, red: 40, farRed: 10 },
        rampDuration: 30
      }]
    },
    vegetative: {
      color: '#3b82f6',
      targetPPFD: 400,
      targetDLI: 26,
      photoperiod: 18,
      growthStage: 'vegetative' as const,
      schedules: [{
        id: 'veg-day',
        name: 'Vegetative Day',
        startTime: '06:00',
        endTime: '00:00',
        intensity: 100,
        spectrum: { blue: 35, green: 15, red: 45, farRed: 5 },
        rampDuration: 15
      }]
    },
    flowering: {
      color: '#ec4899',
      targetPPFD: 800,
      targetDLI: 35,
      photoperiod: 12,
      growthStage: 'flowering' as const,
      schedules: [{
        id: 'flower-day',
        name: 'Flowering Day',
        startTime: '06:00',
        endTime: '18:00',
        intensity: 100,
        spectrum: { blue: 20, green: 10, red: 60, farRed: 10 },
        rampDuration: 15
      }]
    },
    finishing: {
      color: '#f59e0b',
      targetPPFD: 600,
      targetDLI: 26,
      photoperiod: 12,
      growthStage: 'finishing' as const,
      schedules: [{
        id: 'finish-day',
        name: 'Finishing Day',
        startTime: '06:00',
        endTime: '18:00',
        intensity: 80,
        spectrum: { blue: 15, green: 10, red: 65, farRed: 10 },
        rampDuration: 10
      }]
    }
  };

  // Initialize zones from existing room layout
  useEffect(() => {
    if (zones.length === 0) {
      // Auto-create zones based on fixture positions
      const fixtures = state.objects.filter(obj => obj.type === 'fixture');
      
      if (fixtures.length > 0) {
        // Create 4 default zones dividing the room into quadrants
        const roomWidth = state.room?.width || 40;
        const roomLength = state.room?.length || 40;
        
        const defaultZones: Zone[] = [
          {
            id: 'zone-1',
            name: 'Propagation Zone',
            ...zoneTemplates.propagation,
            fixtures: fixtures.filter(f => f.x < roomWidth/2 && f.y < roomLength/2).map(f => f.id),
            cropType: 'lettuce',
            enabled: true,
            area: (roomWidth/2) * (roomLength/2)
          },
          {
            id: 'zone-2',
            name: 'Vegetative Zone',
            ...zoneTemplates.vegetative,
            fixtures: fixtures.filter(f => f.x >= roomWidth/2 && f.y < roomLength/2).map(f => f.id),
            cropType: 'lettuce',
            enabled: true,
            area: (roomWidth/2) * (roomLength/2)
          },
          {
            id: 'zone-3',
            name: 'Flowering Zone',
            ...zoneTemplates.flowering,
            fixtures: fixtures.filter(f => f.x < roomWidth/2 && f.y >= roomLength/2).map(f => f.id),
            cropType: 'tomato',
            enabled: true,
            area: (roomWidth/2) * (roomLength/2)
          },
          {
            id: 'zone-4',
            name: 'Finishing Zone',
            ...zoneTemplates.finishing,
            fixtures: fixtures.filter(f => f.x >= roomWidth/2 && f.y >= roomLength/2).map(f => f.id),
            cropType: 'tomato',
            enabled: true,
            area: (roomWidth/2) * (roomLength/2)
          }
        ].filter(z => z.fixtures.length > 0);
        
        setZones(defaultZones);
        if (defaultZones.length > 0) {
          setSelectedZone(defaultZones[0].id);
        }
      }
    }
  }, [state.objects, state.room, zones.length]);

  const addZone = () => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      color: '#8b5cf6',
      fixtures: [],
      cropType: 'custom',
      growthStage: 'vegetative',
      targetPPFD: 400,
      targetDLI: 25,
      photoperiod: 18,
      schedules: [],
      enabled: true
    };
    setZones([...zones, newZone]);
    setSelectedZone(newZone.id);
  };

  const updateZone = (zoneId: string, updates: Partial<Zone>) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, ...updates } : z));
  };

  const deleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(zones.length > 1 ? zones[0].id : null);
    }
  };

  const assignFixtureToZone = (fixtureId: string, zoneId: string) => {
    // Remove fixture from all zones first
    const updatedZones = zones.map(zone => ({
      ...zone,
      fixtures: zone.fixtures.filter(f => f !== fixtureId)
    }));
    
    // Add to new zone
    const targetZone = updatedZones.find(z => z.id === zoneId);
    if (targetZone) {
      targetZone.fixtures.push(fixtureId);
    }
    
    setZones(updatedZones);
  };

  const applyTemplate = (zoneId: string, templateKey: keyof typeof zoneTemplates) => {
    const template = zoneTemplates[templateKey];
    updateZone(zoneId, {
      ...template,
      growthStage: templateKey
    });
    showNotification('success', `Applied ${templateKey} template to zone`);
  };

  const calculateZoneMetrics = (zone: Zone) => {
    const fixtures = state.objects.filter(obj => 
      obj.type === 'fixture' && zone.fixtures.includes(obj.id)
    );
    
    const totalWattage = fixtures.reduce((sum, f) => sum + ((f as any).model?.wattage || 600), 0);
    const totalPPF = fixtures.reduce((sum, f) => sum + ((f as any).model?.ppf || 1000), 0);
    const avgPPFD = zone.area ? (totalPPF / zone.area) : 0;
    const actualDLI = (avgPPFD * zone.photoperiod * 3600) / 1000000;
    
    return {
      fixtureCount: fixtures.length,
      totalWattage,
      totalPPF,
      avgPPFD: Math.round(avgPPFD),
      actualDLI: Math.round(actualDLI * 10) / 10,
      efficiency: totalWattage > 0 ? (totalPPF / totalWattage).toFixed(1) : '0'
    };
  };

  const simulateZoneSchedules = () => {
    setSimulationRunning(true);
    showNotification('info', 'Simulating 24-hour zone schedules...');
    
    // In a real implementation, this would update fixture states over time
    setTimeout(() => {
      setSimulationRunning(false);
      showNotification('success', 'Schedule simulation completed');
    }, 3000);
  };

  const exportZoneConfig = () => {
    const config = {
      zones,
      transitions,
      exportDate: new Date().toISOString(),
      roomInfo: state.room
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zone-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Zone configuration exported');
  };

  const renderZonesTab = () => {
    const currentZone = zones.find(z => z.id === selectedZone);
    
    return (
      <div className="flex gap-6 h-full">
        {/* Zone List */}
        <div className="w-80 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Zones</h3>
            <button
              onClick={addZone}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          </div>
          
          <div className="space-y-2">
            {zones.map(zone => {
              const metrics = calculateZoneMetrics(zone);
              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedZone === zone.id
                      ? 'bg-gray-700 ring-2 ring-purple-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      />
                      <h4 className="font-medium text-white">{zone.name}</h4>
                      {!zone.enabled && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{metrics.fixtureCount} fixtures</span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Stage: {zone.growthStage}</div>
                    <div>Target: {zone.targetPPFD} µmol/m²/s | {zone.targetDLI} DLI</div>
                    <div className={metrics.avgPPFD >= zone.targetPPFD * 0.9 ? 'text-green-400' : 'text-yellow-400'}>
                      Actual: {metrics.avgPPFD} µmol/m²/s | {metrics.actualDLI} DLI
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Zone Details */}
        {currentZone && (
          <div className="flex-1 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentZone.color}
                  onChange={(e) => updateZone(currentZone.id, { color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentZone.name}
                  onChange={(e) => updateZone(currentZone.id, { name: e.target.value })}
                  className="text-xl font-semibold bg-transparent text-white outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentZone.enabled}
                    onChange={(e) => updateZone(currentZone.id, { enabled: e.target.checked })}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm text-white">Enabled</span>
                </label>
                <button
                  onClick={() => deleteZone(currentZone.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Zone Configuration */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Growth Stage</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(zoneTemplates).map(stage => (
                      <button
                        key={stage}
                        onClick={() => applyTemplate(currentZone.id, stage as keyof typeof zoneTemplates)}
                        className={`px-3 py-2 rounded-lg text-sm capitalize ${
                          currentZone.growthStage === stage
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Crop Type</label>
                  <select
                    value={currentZone.cropType}
                    onChange={(e) => updateZone(currentZone.id, { cropType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  >
                    <option value="custom">Custom</option>
                    {Object.entries(cropDatabase).map(([key, crop]) => (
                      <option key={key} value={key}>{crop.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Zone Area (sq ft)</label>
                  <input
                    type="number"
                    value={currentZone.area || ''}
                    onChange={(e) => updateZone(currentZone.id, { area: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target PPFD (µmol/m²/s)</label>
                  <input
                    type="number"
                    value={currentZone.targetPPFD}
                    onChange={(e) => updateZone(currentZone.id, { targetPPFD: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target DLI (mol/m²/day)</label>
                  <input
                    type="number"
                    value={currentZone.targetDLI}
                    onChange={(e) => updateZone(currentZone.id, { targetDLI: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Photoperiod (hours)</label>
                  <input
                    type="number"
                    value={currentZone.photoperiod}
                    onChange={(e) => updateZone(currentZone.id, { photoperiod: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="24"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Zone Metrics */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Zone Performance</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {(() => {
                  const metrics = calculateZoneMetrics(currentZone);
                  return (
                    <>
                      <div>
                        <span className="text-gray-400">Power Draw:</span>
                        <p className="text-lg font-semibold text-yellow-400">{metrics.totalWattage}W</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Total PPF:</span>
                        <p className="text-lg font-semibold text-blue-400">{metrics.totalPPF} µmol/s</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Efficacy:</span>
                        <p className="text-lg font-semibold text-green-400">{metrics.efficiency} µmol/J</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSchedulesTab = () => {
    const currentZone = zones.find(z => z.id === selectedZone);
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Lighting Schedules</h3>
          
          {currentZone && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-300">{currentZone.name} Schedules</h4>
                <button
                  onClick={() => {
                    const newSchedule: LightSchedule = {
                      id: `schedule-${Date.now()}`,
                      name: 'New Schedule',
                      startTime: '06:00',
                      endTime: '18:00',
                      intensity: 100,
                      rampDuration: 15
                    };
                    updateZone(currentZone.id, {
                      schedules: [...currentZone.schedules, newSchedule]
                    });
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Schedule
                </button>
              </div>
              
              {currentZone.schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No schedules configured. Add a schedule to control lighting.</p>
              ) : (
                <div className="space-y-3">
                  {currentZone.schedules.map((schedule, index) => (
                    <div key={schedule.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="text"
                          value={schedule.name}
                          onChange={(e) => {
                            const updatedSchedules = [...currentZone.schedules];
                            updatedSchedules[index].name = e.target.value;
                            updateZone(currentZone.id, { schedules: updatedSchedules });
                          }}
                          className="bg-transparent text-white font-medium outline-none"
                        />
                        <button
                          onClick={() => {
                            const updatedSchedules = currentZone.schedules.filter(s => s.id !== schedule.id);
                            updateZone(currentZone.id, { schedules: updatedSchedules });
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <label className="text-gray-400">Start Time</label>
                          <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => {
                              const updatedSchedules = [...currentZone.schedules];
                              updatedSchedules[index].startTime = e.target.value;
                              updateZone(currentZone.id, { schedules: updatedSchedules });
                            }}
                            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400">End Time</label>
                          <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => {
                              const updatedSchedules = [...currentZone.schedules];
                              updatedSchedules[index].endTime = e.target.value;
                              updateZone(currentZone.id, { schedules: updatedSchedules });
                            }}
                            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400">Intensity (%)</label>
                          <input
                            type="number"
                            value={schedule.intensity}
                            onChange={(e) => {
                              const updatedSchedules = [...currentZone.schedules];
                              updatedSchedules[index].intensity = parseInt(e.target.value) || 0;
                              updateZone(currentZone.id, { schedules: updatedSchedules });
                            }}
                            min="0"
                            max="100"
                            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400">Ramp (min)</label>
                          <input
                            type="number"
                            value={schedule.rampDuration}
                            onChange={(e) => {
                              const updatedSchedules = [...currentZone.schedules];
                              updatedSchedules[index].rampDuration = parseInt(e.target.value) || 0;
                              updateZone(currentZone.id, { schedules: updatedSchedules });
                            }}
                            min="0"
                            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Schedule Visualization */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">24-Hour Schedule Preview</h3>
          <div className="bg-gray-900 rounded-lg p-4 h-48">
            {/* This would show a timeline visualization of all schedules */}
            <div className="text-center text-gray-500 py-16">
              Schedule timeline visualization would appear here
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={simulateZoneSchedules}
              disabled={simulationRunning}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                simulationRunning
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {simulationRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Simulate Day
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTransitionsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Zone Transitions</h3>
        <p className="text-gray-400 mb-6">Configure automatic plant movement between zones as they grow.</p>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              const newTransition: ZoneTransition = {
                fromZone: zones[0]?.id || '',
                toZone: zones[1]?.id || '',
                daysAfterStart: 14,
                percentageToMove: 100
              };
              setTransitions([...transitions, newTransition]);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transition
          </button>
          
          {transitions.map((transition, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
              <select
                value={transition.fromZone}
                onChange={(e) => {
                  const updated = [...transitions];
                  updated[index].fromZone = e.target.value;
                  setTransitions(updated);
                }}
                className="px-3 py-2 bg-gray-600 text-white rounded"
              >
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
              
              <select
                value={transition.toZone}
                onChange={(e) => {
                  const updated = [...transitions];
                  updated[index].toZone = e.target.value;
                  setTransitions(updated);
                }}
                className="px-3 py-2 bg-gray-600 text-white rounded"
              >
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-400">After</span>
                <input
                  type="number"
                  value={transition.daysAfterStart}
                  onChange={(e) => {
                    const updated = [...transitions];
                    updated[index].daysAfterStart = parseInt(e.target.value) || 0;
                    setTransitions(updated);
                  }}
                  className="w-16 px-2 py-1 bg-gray-600 text-white rounded"
                />
                <span className="text-gray-400">days</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={transition.percentageToMove}
                  onChange={(e) => {
                    const updated = [...transitions];
                    updated[index].percentageToMove = parseInt(e.target.value) || 0;
                    setTransitions(updated);
                  }}
                  min="0"
                  max="100"
                  className="w-16 px-2 py-1 bg-gray-600 text-white rounded"
                />
                <span className="text-gray-400">%</span>
              </div>
              
              <button
                onClick={() => setTransitions(transitions.filter((_, i) => i !== index))}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Crop Flow Visualization */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Crop Flow Timeline</h3>
        <div className="bg-gray-900 rounded-lg p-4 h-64">
          <div className="text-center text-gray-500 py-20">
            Crop flow visualization would appear here
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Zone Performance Comparison</h3>
        <div className="space-y-3">
          {zones.map(zone => {
            const metrics = calculateZoneMetrics(zone);
            const targetAchievement = (metrics.avgPPFD / zone.targetPPFD) * 100;
            
            return (
              <div key={zone.id} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="font-medium text-white">{zone.name}</span>
                  </div>
                  <span className={`text-sm ${targetAchievement >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {Math.round(targetAchievement)}% of target
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, targetAchievement)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Energy Distribution</h3>
        <div className="space-y-3">
          {zones.map(zone => {
            const metrics = calculateZoneMetrics(zone);
            const totalSystemWattage = zones.reduce((sum, z) => 
              sum + calculateZoneMetrics(z).totalWattage, 0
            );
            const percentage = totalSystemWattage > 0 
              ? (metrics.totalWattage / totalSystemWattage) * 100
              : 0;
            
            return (
              <div key={zone.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="text-white">{zone.name}</span>
                </div>
                <span className="text-yellow-400">{metrics.totalWattage}W ({Math.round(percentage)}%)</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-300">Total System</span>
            <span className="text-yellow-400">
              {zones.reduce((sum, z) => sum + calculateZoneMetrics(z).totalWattage, 0)}W
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Zone Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Zone</th>
                <th className="text-center py-2 px-3 text-gray-400">Stage</th>
                <th className="text-center py-2 px-3 text-gray-400">Fixtures</th>
                <th className="text-center py-2 px-3 text-gray-400">Target PPFD</th>
                <th className="text-center py-2 px-3 text-gray-400">Actual PPFD</th>
                <th className="text-center py-2 px-3 text-gray-400">Power</th>
                <th className="text-center py-2 px-3 text-gray-400">Efficacy</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => {
                const metrics = calculateZoneMetrics(zone);
                return (
                  <tr key={zone.id} className="border-b border-gray-700">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                        <span className="text-white">{zone.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-3 text-gray-300 capitalize">{zone.growthStage}</td>
                    <td className="text-center py-2 px-3 text-gray-300">{metrics.fixtureCount}</td>
                    <td className="text-center py-2 px-3 text-gray-300">{zone.targetPPFD}</td>
                    <td className={`text-center py-2 px-3 ${
                      metrics.avgPPFD >= zone.targetPPFD * 0.9 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {metrics.avgPPFD}
                    </td>
                    <td className="text-center py-2 px-3 text-yellow-400">{metrics.totalWattage}W</td>
                    <td className="text-center py-2 px-3 text-blue-400">{metrics.efficiency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Multi-Zone Manager</h2>
              <p className="text-sm text-gray-400">Configure and manage lighting zones</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportZoneConfig}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Export Config
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['zones', 'schedules', 'transitions', 'analytics'] as const).map(tab => (
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
          {activeTab === 'schedules' && renderSchedulesTab()}
          {activeTab === 'transitions' && renderTransitionsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );
}