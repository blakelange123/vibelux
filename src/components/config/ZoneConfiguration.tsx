'use client';

import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Save, X, AlertTriangle,
  Building2, Gauge, Map, Settings, Shield, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ZoneConfig {
  id: string;
  name: string;
  type: 'greenhouse' | 'nursery' | 'storage' | 'processing' | 'flowering' | 'vegetative';
  description?: string;
  building?: string;
  floor?: string;
  area?: number; // square feet
  controlSystem: 'bms' | 'hmi' | 'manual' | 'none';
  controlAuthority: {
    climate: 'bms' | 'hmi' | 'manual';
    lighting: 'bms' | 'hmi' | 'manual';
    irrigation: 'bms' | 'hmi' | 'manual';
    security: 'bms' | 'hmi' | 'manual';
  };
  equipment: {
    hvac: string[];
    lighting: string[];
    irrigation: string[];
    sensors: string[];
  };
  setpoints: {
    temperature: { min: number; max: number; };
    humidity: { min: number; max: number; };
    co2: { min: number; max: number; };
    light: { min: number; max: number; };
  };
  schedules: {
    lighting: { on: string; off: string; };
    irrigation: { frequency: string; duration: number; };
  };
  alerts: {
    email: string[];
    sms: string[];
    criticalOnly: boolean;
  };
}

interface ZoneConfigurationProps {
  onSave?: (zones: ZoneConfig[]) => void;
  existingZones?: ZoneConfig[];
}

export function ZoneConfiguration({ onSave, existingZones = [] }: ZoneConfigurationProps) {
  const [zones, setZones] = useState<ZoneConfig[]>(existingZones);
  const [editingZone, setEditingZone] = useState<ZoneConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Check for control conflicts
  const checkConflicts = (updatedZones: ZoneConfig[]) => {
    const newConflicts: string[] = [];
    const equipmentControl: Record<string, string[]> = {};

    updatedZones.forEach(zone => {
      // Check if equipment is assigned to multiple control systems
      Object.entries(zone.equipment).forEach(([type, equipmentList]) => {
        equipmentList.forEach(equipmentId => {
          const key = `${type}-${equipmentId}`;
          if (!equipmentControl[key]) {
            equipmentControl[key] = [];
          }
          
          const controlAuth = zone.controlAuthority[type as keyof typeof zone.controlAuthority];
          if (controlAuth !== 'manual') {
            equipmentControl[key].push(`${zone.name} (${controlAuth})`);
          }
        });
      });
    });

    // Find conflicts
    Object.entries(equipmentControl).forEach(([equipment, controllers]) => {
      if (controllers.length > 1) {
        newConflicts.push(
          `Equipment "${equipment}" is controlled by multiple systems: ${controllers.join(', ')}`
        );
      }
    });

    setConflicts(newConflicts);
    return newConflicts.length === 0;
  };

  const handleSaveZone = (zone: ZoneConfig) => {
    let updatedZones;
    if (editingZone) {
      updatedZones = zones.map(z => z.id === zone.id ? zone : z);
    } else {
      zone.id = `zone-${Date.now()}`;
      updatedZones = [...zones, zone];
    }

    if (checkConflicts(updatedZones)) {
      setZones(updatedZones);
      setShowForm(false);
      setEditingZone(null);
      onSave?.(updatedZones);
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    const updatedZones = zones.filter(z => z.id !== zoneId);
    setZones(updatedZones);
    checkConflicts(updatedZones);
    onSave?.(updatedZones);
  };

  const getControlSystemColor = (system: string) => {
    switch (system) {
      case 'bms': return 'bg-blue-500';
      case 'hmi': return 'bg-purple-500';
      case 'manual': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Zone Configuration</h2>
          <p className="text-gray-400">Configure facility zones and control systems</p>
        </div>
        <Button
          onClick={() => {
            setEditingZone(null);
            setShowForm(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <Card className="bg-red-900/20 border-red-600/50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-400 mb-2">Control Conflicts Detected</h3>
              <ul className="space-y-1 text-sm text-red-300">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Zone List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {zones.map(zone => (
          <Card key={zone.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                <p className="text-sm text-gray-400">{zone.type} • {zone.area} sq ft</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getControlSystemColor(zone.controlSystem)} text-white`}>
                  {zone.controlSystem.toUpperCase()}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingZone(zone);
                    setShowForm(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteZone(zone.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Control Authority */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Control Authority</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Climate:</span>
                  <Badge variant="outline" className="text-xs">
                    {zone.controlAuthority.climate.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Lighting:</span>
                  <Badge variant="outline" className="text-xs">
                    {zone.controlAuthority.lighting.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Irrigation:</span>
                  <Badge variant="outline" className="text-xs">
                    {zone.controlAuthority.irrigation.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Security:</span>
                  <Badge variant="outline" className="text-xs">
                    {zone.controlAuthority.security.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Equipment Summary */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
                <div>
                  <span className="block font-medium">HVAC</span>
                  <span>{zone.equipment.hvac.length} units</span>
                </div>
                <div>
                  <span className="block font-medium">Lighting</span>
                  <span>{zone.equipment.lighting.length} fixtures</span>
                </div>
                <div>
                  <span className="block font-medium">Irrigation</span>
                  <span>{zone.equipment.irrigation.length} zones</span>
                </div>
                <div>
                  <span className="block font-medium">Sensors</span>
                  <span>{zone.equipment.sensors.length} devices</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Zone Form Modal */}
      {showForm && (
        <ZoneFormModal
          zone={editingZone}
          onSave={handleSaveZone}
          onClose={() => {
            setShowForm(false);
            setEditingZone(null);
          }}
        />
      )}
    </div>
  );
}

// Zone Form Modal Component
function ZoneFormModal({ 
  zone, 
  onSave, 
  onClose 
}: { 
  zone: ZoneConfig | null; 
  onSave: (zone: ZoneConfig) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ZoneConfig>(zone || {
    id: '',
    name: '',
    type: 'greenhouse',
    description: '',
    building: '',
    floor: '',
    area: 0,
    controlSystem: 'none',
    controlAuthority: {
      climate: 'manual',
      lighting: 'manual',
      irrigation: 'manual',
      security: 'manual'
    },
    equipment: {
      hvac: [],
      lighting: [],
      irrigation: [],
      sensors: []
    },
    setpoints: {
      temperature: { min: 20, max: 26 },
      humidity: { min: 50, max: 70 },
      co2: { min: 400, max: 800 },
      light: { min: 0, max: 100 }
    },
    schedules: {
      lighting: { on: '06:00', off: '18:00' },
      irrigation: { frequency: 'daily', duration: 10 }
    },
    alerts: {
      email: [],
      sms: [],
      criticalOnly: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {zone ? 'Edit Zone' : 'Create New Zone'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Zone Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Zone Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="greenhouse">Greenhouse</option>
                  <option value="nursery">Nursery</option>
                  <option value="flowering">Flowering</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="storage">Storage</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Area (sq ft)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Primary Control System</label>
                <select
                  value={formData.controlSystem}
                  onChange={(e) => setFormData({ ...formData, controlSystem: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="none">None</option>
                  <option value="bms">BMS (Building Management)</option>
                  <option value="hmi">HMI (Equipment Control)</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Control Authority */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Control Authority</h3>
            <p className="text-sm text-gray-400">
              Assign which system controls each equipment type to prevent conflicts
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Climate Control</label>
                <select
                  value={formData.controlAuthority.climate}
                  onChange={(e) => setFormData({
                    ...formData,
                    controlAuthority: { ...formData.controlAuthority, climate: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="manual">Manual</option>
                  <option value="bms">BMS</option>
                  <option value="hmi">HMI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Lighting Control</label>
                <select
                  value={formData.controlAuthority.lighting}
                  onChange={(e) => setFormData({
                    ...formData,
                    controlAuthority: { ...formData.controlAuthority, lighting: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="manual">Manual</option>
                  <option value="bms">BMS</option>
                  <option value="hmi">HMI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Irrigation Control</label>
                <select
                  value={formData.controlAuthority.irrigation}
                  onChange={(e) => setFormData({
                    ...formData,
                    controlAuthority: { ...formData.controlAuthority, irrigation: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="manual">Manual</option>
                  <option value="bms">BMS</option>
                  <option value="hmi">HMI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Security Control</label>
                <select
                  value={formData.controlAuthority.security}
                  onChange={(e) => setFormData({
                    ...formData,
                    controlAuthority: { ...formData.controlAuthority, security: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="manual">Manual</option>
                  <option value="bms">BMS</option>
                  <option value="hmi">HMI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Setpoints */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Environmental Setpoints</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Temperature Range (°C)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.setpoints.temperature.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      setpoints: {
                        ...formData.setpoints,
                        temperature: { ...formData.setpoints.temperature, min: parseFloat(e.target.value) }
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Min"
                  />
                  <span className="text-gray-400 self-center">to</span>
                  <input
                    type="number"
                    value={formData.setpoints.temperature.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      setpoints: {
                        ...formData.setpoints,
                        temperature: { ...formData.setpoints.temperature, max: parseFloat(e.target.value) }
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Humidity Range (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.setpoints.humidity.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      setpoints: {
                        ...formData.setpoints,
                        humidity: { ...formData.setpoints.humidity, min: parseFloat(e.target.value) }
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Min"
                  />
                  <span className="text-gray-400 self-center">to</span>
                  <input
                    type="number"
                    value={formData.setpoints.humidity.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      setpoints: {
                        ...formData.setpoints,
                        humidity: { ...formData.setpoints.humidity, max: parseFloat(e.target.value) }
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-800">
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {zone ? 'Update Zone' : 'Create Zone'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}