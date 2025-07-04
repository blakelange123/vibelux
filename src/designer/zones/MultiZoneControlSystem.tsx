'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid3x3, Plus, Settings, Calendar, Zap, Save, X,
  Thermometer, Sun, Clock, Users, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Copy, Trash2, Edit2, Droplets
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface Zone {
  id: string;
  name: string;
  color: string;
  bounds: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  fixtureIds: string[];
  settings: {
    targetPPFD: number;
    targetTemp: number;
    photoperiod: number;
    dimmingLevel: number;
    enabled: boolean;
  };
  schedule: {
    enabled: boolean;
    events: Array<{
      id: string;
      time: string;
      action: 'on' | 'off' | 'dim';
      value?: number;
    }>;
  };
  sensors: {
    ppfd?: number;
    temperature?: number;
    humidity?: number;
    co2?: number;
  };
  metrics: {
    powerUsage: number;
    efficiency: number;
    dli: number;
  };
  pidControl?: {
    enabled: boolean;
    mode: 'ppfd' | 'temperature' | 'both';
    ppfdPID?: {
      kp: number;
      ki: number;
      kd: number;
      lastError: number;
      integral: number;
    };
    tempPID?: {
      kp: number;
      ki: number;
      kd: number;
      lastError: number;
      integral: number;
    };
  };
}

interface ZonePreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<Zone['settings']>;
  schedule?: Zone['schedule'];
}

const DEFAULT_ZONE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const ZONE_PRESETS: ZonePreset[] = [
  {
    id: 'veg',
    name: 'Vegetative Growth',
    description: 'Optimal settings for vegetative phase',
    settings: {
      targetPPFD: 400,
      targetTemp: 24,
      photoperiod: 18,
      dimmingLevel: 100
    }
  },
  {
    id: 'flower',
    name: 'Flowering',
    description: 'Settings for flowering/fruiting phase',
    settings: {
      targetPPFD: 600,
      targetTemp: 22,
      photoperiod: 12,
      dimmingLevel: 100
    }
  },
  {
    id: 'propagation',
    name: 'Propagation',
    description: 'Gentle settings for cuttings and seedlings',
    settings: {
      targetPPFD: 150,
      targetTemp: 25,
      photoperiod: 16,
      dimmingLevel: 50
    }
  },
  {
    id: 'mother',
    name: 'Mother Plants',
    description: 'Maintain healthy mother plants',
    settings: {
      targetPPFD: 300,
      targetTemp: 23,
      photoperiod: 18,
      dimmingLevel: 80
    }
  }
];

interface MultiZoneControlSystemProps {
  onClose?: () => void;
}

export function MultiZoneControlSystem({ onClose }: MultiZoneControlSystemProps) {
  const { state, dispatch } = useDesigner();
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  
  // Initialize zones from room data
  useEffect(() => {
    // Check if we have existing zones in state or create default
    if (zones.length === 0) {
      // Create a default zone covering the entire room
      const defaultZone: Zone = {
        id: 'zone-1',
        name: 'Main Growing Area',
        color: DEFAULT_ZONE_COLORS[0],
        bounds: {
          x1: 0,
          y1: 0,
          x2: state.room.width,
          y2: state.room.length
        },
        fixtureIds: state.objects
          .filter(obj => obj.type === 'fixture')
          .map(obj => obj.id),
        settings: {
          targetPPFD: 500,
          targetTemp: 23,
          photoperiod: 18,
          dimmingLevel: 100,
          enabled: true
        },
        schedule: {
          enabled: false,
          events: []
        },
        sensors: {},
        metrics: {
          powerUsage: 0,
          efficiency: 0,
          dli: 0
        }
      };
      setZones([defaultZone]);
    }
  }, []);

  // Calculate zone metrics
  useEffect(() => {
    const updatedZones = zones.map(zone => {
      const fixtures = state.objects.filter(
        obj => obj.type === 'fixture' && zone.fixtureIds.includes(obj.id)
      );
      
      const totalPower = fixtures.reduce((sum, f) => 
        sum + (((f as any).model?.wattage || 600) * zone.settings.dimmingLevel / 100), 0
      );
      
      const zoneArea = (zone.bounds.x2 - zone.bounds.x1) * (zone.bounds.y2 - zone.bounds.y1);
      const avgPPFD = zone.settings.targetPPFD * (zone.settings.dimmingLevel / 100);
      const dli = (avgPPFD * zone.settings.photoperiod * 3600) / 1000000;
      
      return {
        ...zone,
        metrics: {
          powerUsage: totalPower,
          efficiency: zoneArea > 0 ? avgPPFD / (totalPower / zoneArea) : 0,
          dli
        }
      };
    });
    
    if (JSON.stringify(updatedZones) !== JSON.stringify(zones)) {
      setZones(updatedZones);
    }
  }, [zones, state.objects]);

  // Create new zone
  const createZone = (bounds: Zone['bounds']) => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      color: DEFAULT_ZONE_COLORS[zones.length % DEFAULT_ZONE_COLORS.length],
      bounds,
      fixtureIds: [],
      settings: {
        targetPPFD: 500,
        targetTemp: 23,
        photoperiod: 18,
        dimmingLevel: 100,
        enabled: true
      },
      schedule: {
        enabled: false,
        events: []
      },
      sensors: {},
      metrics: {
        powerUsage: 0,
        efficiency: 0,
        dli: 0
      }
    };
    
    // Find fixtures within zone bounds
    const fixturesInZone = state.objects.filter(obj => {
      if (obj.type !== 'fixture') return false;
      return obj.x >= bounds.x1 && obj.x <= bounds.x2 &&
             obj.y >= bounds.y1 && obj.y <= bounds.y2;
    });
    
    newZone.fixtureIds = fixturesInZone.map(f => f.id);
    setZones([...zones, newZone]);
    setSelectedZone(newZone.id);
  };

  // Apply preset to zone
  const applyPreset = (zoneId: string, presetId: string) => {
    const preset = ZONE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          settings: {
            ...zone.settings,
            ...preset.settings
          },
          schedule: preset.schedule || zone.schedule
        };
      }
      return zone;
    }));
  };

  // Update zone settings
  const updateZoneSettings = (zoneId: string, settings: Partial<Zone['settings']>) => {
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          settings: {
            ...zone.settings,
            ...settings
          }
        };
      }
      return zone;
    }));
    
    // Apply dimming to fixtures
    const zone = zones.find(z => z.id === zoneId);
    if (zone && settings.dimmingLevel !== undefined) {
      zone.fixtureIds.forEach(fixtureId => {
        // In a real implementation, this would send commands to fixtures
      });
    }
  };

  // Add schedule event
  const addScheduleEvent = (zoneId: string, event: Omit<Zone['schedule']['events'][0], 'id'>) => {
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          schedule: {
            ...zone.schedule,
            events: [
              ...zone.schedule.events,
              { ...event, id: `event-${Date.now()}` }
            ].sort((a, b) => a.time.localeCompare(b.time))
          }
        };
      }
      return zone;
    }));
  };

  // Delete zone
  const deleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    }
  };

  // Duplicate zone
  const duplicateZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    const newZone: Zone = {
      ...zone,
      id: `zone-${Date.now()}`,
      name: `${zone.name} (Copy)`,
      bounds: {
        x1: zone.bounds.x1 + 1,
        y1: zone.bounds.y1 + 1,
        x2: zone.bounds.x2 + 1,
        y2: zone.bounds.y2 + 1
      }
    };
    
    setZones([...zones, newZone]);
  };

  // Calculate total metrics
  const totalMetrics = useMemo(() => {
    return zones.reduce((acc, zone) => ({
      power: acc.power + zone.metrics.powerUsage,
      avgDLI: acc.avgDLI + zone.metrics.dli / zones.length,
      activeZones: acc.activeZones + (zone.settings.enabled ? 1 : 0)
    }), { power: 0, avgDLI: 0, activeZones: 0 });
  }, [zones]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Grid3x3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Multi-Zone Control System</h2>
            <p className="text-sm text-gray-400">Manage independent lighting zones for optimal growth</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDrawingZone(!isDrawingZone)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isDrawingZone 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isDrawingZone ? 'Drawing Zone...' : 'New Zone'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Grid3x3 className="w-4 h-4" />
            <span className="text-xs">Active Zones</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalMetrics.activeZones} / {zones.length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Total Power</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {(totalMetrics.power / 1000).toFixed(1)} kW
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Sun className="w-4 h-4" />
            <span className="text-xs">Average DLI</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {totalMetrics.avgDLI.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone List */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Lighting Zones</h3>
          <div className="space-y-2">
            {zones.map(zone => (
              <div
                key={zone.id}
                className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedZone === zone.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedZone(zone.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    <h4 className="font-medium text-white">{zone.name}</h4>
                    {zone.settings.enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingZone(zone.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateZone(zone.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteZone(zone.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Fixtures:</span>
                    <span className="text-white ml-1">{zone.fixtureIds.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Power:</span>
                    <span className="text-white ml-1">{zone.metrics.powerUsage}W</span>
                  </div>
                  <div>
                    <span className="text-gray-500">DLI:</span>
                    <span className="text-white ml-1">{zone.metrics.dli.toFixed(1)}</span>
                  </div>
                </div>
                
                {zone.schedule.enabled && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                    <Clock className="w-3 h-3" />
                    <span>Schedule active</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zone Details */}
        {selectedZone && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Zone Settings</h3>
            {(() => {
              const zone = zones.find(z => z.id === selectedZone);
              if (!zone) return null;
              
              return (
                <div className="space-y-4">
                  {/* Quick Presets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Apply Preset
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ZONE_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(zone.id, preset.id)}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm text-left"
                        >
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-gray-400">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zone Controls */}
                  <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="flex items-center justify-between text-sm text-gray-300 mb-2">
                        <span>Zone Enabled</span>
                        <input
                          type="checkbox"
                          checked={zone.settings.enabled}
                          onChange={(e) => updateZoneSettings(zone.id, { enabled: e.target.checked })}
                          className="rounded border-gray-600"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Dimming Level: {zone.settings.dimmingLevel}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={zone.settings.dimmingLevel}
                        onChange={(e) => updateZoneSettings(zone.id, { dimmingLevel: Number(e.target.value) })}
                        className="w-full"
                        disabled={!zone.settings.enabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Target PPFD (μmol/m²/s)
                      </label>
                      <input
                        type="number"
                        value={zone.settings.targetPPFD}
                        onChange={(e) => updateZoneSettings(zone.id, { targetPPFD: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        min="0"
                        max="2000"
                        disabled={!zone.settings.enabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Photoperiod (hours)
                      </label>
                      <input
                        type="number"
                        value={zone.settings.photoperiod}
                        onChange={(e) => updateZoneSettings(zone.id, { photoperiod: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        min="0"
                        max="24"
                        disabled={!zone.settings.enabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Target Temperature (°C)
                      </label>
                      <input
                        type="number"
                        value={zone.settings.targetTemp}
                        onChange={(e) => updateZoneSettings(zone.id, { targetTemp: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        min="15"
                        max="35"
                        disabled={!zone.settings.enabled}
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-300">Schedule</h4>
                      <button
                        onClick={() => setShowScheduler(!showScheduler)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {showScheduler ? 'Hide' : 'Configure'}
                      </button>
                    </div>
                    
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={zone.schedule.enabled}
                        onChange={(e) => setZones(zones.map(z => 
                          z.id === zone.id 
                            ? { ...z, schedule: { ...z.schedule, enabled: e.target.checked } }
                            : z
                        ))}
                        className="rounded border-gray-600"
                      />
                      Enable scheduled control
                    </label>

                    {showScheduler && zone.schedule.enabled && (
                      <div className="mt-3 space-y-2">
                        {zone.schedule.events.map(event => (
                          <div key={event.id} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">{event.time}</span>
                            <span className="text-white capitalize">{event.action}</span>
                            {event.value !== undefined && (
                              <span className="text-gray-400">{event.value}%</span>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const time = prompt('Enter time (HH:MM):');
                            const action = prompt('Enter action (on/off/dim):') as any;
                            const value = action === 'dim' ? Number(prompt('Enter dim level (0-100):')) : undefined;
                            
                            if (time && action) {
                              addScheduleEvent(zone.id, { time, action, value });
                            }
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          + Add Event
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sensor Readings */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Sensor Readings</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">PPFD:</span>
                        <span className="text-sm text-white">
                          {zone.sensors.ppfd || '--'} μmol/m²/s
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-400">Temp:</span>
                        <span className="text-sm text-white">
                          {zone.sensors.temperature || '--'}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">RH:</span>
                        <span className="text-sm text-white">
                          {zone.sensors.humidity || '--'}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">CO₂:</span>
                        <span className="text-sm text-white">
                          {zone.sensors.co2 || '--'} ppm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PID Control */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-300">PID Control</h4>
                      <button
                        onClick={() => {
                          // Open PID control panel for this zone
                          window.dispatchEvent(new CustomEvent('openPIDControl', { 
                            detail: { zoneId: zone.id, zoneName: zone.name } 
                          }));
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Configure
                      </button>
                    </div>
                    
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      <input
                        type="checkbox"
                        checked={zone.pidControl?.enabled || false}
                        onChange={(e) => {
                          const newZones = zones.map(z => {
                            if (z.id === zone.id) {
                              return {
                                ...z,
                                pidControl: {
                                  ...z.pidControl,
                                  enabled: e.target.checked,
                                  mode: z.pidControl?.mode || 'ppfd',
                                  ppfdPID: z.pidControl?.ppfdPID || {
                                    kp: 0.5,
                                    ki: 0.1,
                                    kd: 0.05,
                                    lastError: 0,
                                    integral: 0
                                  }
                                }
                              };
                            }
                            return z;
                          });
                          setZones(newZones);
                        }}
                        className="rounded border-gray-600"
                      />
                      Enable automatic control
                    </label>

                    {zone.pidControl?.enabled && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Control Mode:</span>
                          <select
                            value={zone.pidControl.mode}
                            onChange={(e) => {
                              const newZones = zones.map(z => {
                                if (z.id === zone.id && z.pidControl) {
                                  return {
                                    ...z,
                                    pidControl: {
                                      ...z.pidControl,
                                      mode: e.target.value as 'ppfd' | 'temperature' | 'both'
                                    }
                                  };
                                }
                                return z;
                              });
                              setZones(newZones);
                            }}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="ppfd">PPFD Only</option>
                            <option value="temperature">Temperature Only</option>
                            <option value="both">Both</option>
                          </select>
                        </div>
                        
                        {(zone.pidControl.mode === 'ppfd' || zone.pidControl.mode === 'both') && zone.sensors.ppfd && (
                          <div className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500">PPFD Control</span>
                              <span className={`${
                                Math.abs((zone.sensors.ppfd || 0) - zone.settings.targetPPFD) < 10 
                                  ? 'text-green-400' 
                                  : 'text-yellow-400'
                              }`}>
                                {zone.sensors.ppfd > zone.settings.targetPPFD ? '↓' : '↑'} Adjusting
                              </span>
                            </div>
                            <div className="bg-gray-700 rounded h-1 mb-1">
                              <div 
                                className="bg-purple-500 h-1 rounded transition-all duration-500"
                                style={{ 
                                  width: `${Math.min(100, (zone.sensors.ppfd / zone.settings.targetPPFD) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Zone Map Visualization */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Zone Layout</h3>
        <div 
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          style={{ height: '300px' }}
          onMouseDown={(e) => {
            if (isDrawingZone) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * state.room.width;
              const y = ((e.clientY - rect.top) / rect.height) * state.room.length;
              setDrawingStart({ x, y });
            }
          }}
          onMouseUp={(e) => {
            if (isDrawingZone && drawingStart) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * state.room.width;
              const y = ((e.clientY - rect.top) / rect.height) * state.room.length;
              
              createZone({
                x1: Math.min(drawingStart.x, x),
                y1: Math.min(drawingStart.y, y),
                x2: Math.max(drawingStart.x, x),
                y2: Math.max(drawingStart.y, y)
              });
              
              setIsDrawingZone(false);
              setDrawingStart(null);
            }
          }}
        >
          {/* Zones */}
          {zones.map(zone => (
            <div
              key={zone.id}
              className="absolute border-2 transition-all cursor-pointer"
              style={{
                left: `${(zone.bounds.x1 / state.room.width) * 100}%`,
                top: `${(zone.bounds.y1 / state.room.length) * 100}%`,
                width: `${((zone.bounds.x2 - zone.bounds.x1) / state.room.width) * 100}%`,
                height: `${((zone.bounds.y2 - zone.bounds.y1) / state.room.length) * 100}%`,
                borderColor: zone.color,
                backgroundColor: `${zone.color}20`,
                opacity: zone.settings.enabled ? 1 : 0.5
              }}
              onClick={() => setSelectedZone(zone.id)}
            >
              <div className="absolute top-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                {zone.name}
              </div>
            </div>
          ))}
          
          {/* Fixtures */}
          {state.objects.filter(obj => obj.type === 'fixture').map(fixture => (
            <div
              key={fixture.id}
              className="absolute w-2 h-4 bg-yellow-400"
              style={{
                left: `${(fixture.x / state.room.width) * 100}%`,
                top: `${(fixture.y / state.room.length) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Help text */}
          {isDrawingZone && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/75 px-3 py-2 rounded-lg text-white text-sm">
                Click and drag to draw a new zone
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}