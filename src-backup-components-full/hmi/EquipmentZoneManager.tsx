'use client';

import React, { useState } from 'react';
import { 
  Grid3x3, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Layers,
  Settings,
  Power,
  AlertCircle,
  Check
} from 'lucide-react';
import { EquipmentDefinition } from '@/lib/hmi/equipment-registry';

export interface EquipmentZone {
  id: string;
  name: string;
  color: string;
  equipment: string[]; // equipment IDs
  enabled: boolean;
  controlMode: 'manual' | 'auto' | 'schedule';
}

interface EquipmentZoneManagerProps {
  equipment: EquipmentDefinition[];
  zones: EquipmentZone[];
  onZoneUpdate: (zones: EquipmentZone[]) => void;
  onZoneControl: (zoneId: string, action: 'on' | 'off' | 'toggle') => void;
}

export function EquipmentZoneManager({
  equipment,
  zones,
  onZoneUpdate,
  onZoneControl
}: EquipmentZoneManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [newZone, setNewZone] = useState<Partial<EquipmentZone>>({
    name: '',
    color: '#8B5CF6',
    equipment: [],
    enabled: true,
    controlMode: 'manual'
  });

  const colors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
    '#EF4444', '#EC4899', '#3B82F6', '#6366F1'
  ];

  const handleCreateZone = () => {
    if (newZone.name) {
      const zone: EquipmentZone = {
        id: `zone-${Date.now()}`,
        name: newZone.name,
        color: newZone.color || '#8B5CF6',
        equipment: newZone.equipment || [],
        enabled: newZone.enabled ?? true,
        controlMode: newZone.controlMode || 'manual'
      };
      onZoneUpdate([...zones, zone]);
      setNewZone({
        name: '',
        color: '#8B5CF6',
        equipment: [],
        enabled: true,
        controlMode: 'manual'
      });
      setIsCreating(false);
    }
  };

  const handleUpdateZone = (zoneId: string, updates: Partial<EquipmentZone>) => {
    onZoneUpdate(zones.map(z => 
      z.id === zoneId ? { ...z, ...updates } : z
    ));
  };

  const handleDeleteZone = (zoneId: string) => {
    onZoneUpdate(zones.filter(z => z.id !== zoneId));
  };

  const toggleEquipmentInZone = (zoneId: string, equipmentId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      const isInZone = zone.equipment.includes(equipmentId);
      const updatedEquipment = isInZone
        ? zone.equipment.filter(e => e !== equipmentId)
        : [...zone.equipment, equipmentId];
      handleUpdateZone(zoneId, { equipment: updatedEquipment });
    }
  };

  const getEquipmentInZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return [];
    return equipment.filter(e => zone.equipment.includes(e.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Grid3x3 className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold">Equipment Zones</h2>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Zone
        </button>
      </div>

      {/* Zone creation form */}
      {isCreating && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">New Zone</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Zone name"
              value={newZone.name || ''}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Color</label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewZone({ ...newZone, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      newZone.color === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Control Mode</label>
              <select
                value={newZone.controlMode || 'manual'}
                onChange={(e) => setNewZone({ ...newZone, controlMode: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="manual">Manual Control</option>
                <option value="auto">Automatic</option>
                <option value="schedule">Scheduled</option>
              </select>
            </div>

            <button
              onClick={handleCreateZone}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Create Zone
            </button>
          </div>
        </div>
      )}

      {/* Zones list */}
      <div className="space-y-4">
        {zones.map(zone => {
          const zoneEquipment = getEquipmentInZone(zone.id);
          const isEditing = editingZone === zone.id;

          return (
            <div
              key={zone.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              style={{ borderLeftColor: zone.color, borderLeftWidth: 4 }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    {isEditing ? (
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => handleUpdateZone(zone.id, { name: e.target.value })}
                        className="px-2 py-1 bg-gray-900 rounded border border-gray-700 focus:border-purple-500 focus:outline-none"
                      />
                    ) : (
                      <h3 className="font-medium text-lg">{zone.name}</h3>
                    )}
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {zone.controlMode}
                    </span>
                    {zone.enabled ? (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <AlertCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onZoneControl(zone.id, 'toggle')}
                      className={`p-2 rounded-lg transition-colors ${
                        zone.enabled 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingZone(isEditing ? null : zone.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-3">
                  {zoneEquipment.length} equipment items
                </div>

                {isEditing && (
                  <div className="space-y-2 pt-3 border-t border-gray-700">
                    <h4 className="text-sm font-medium mb-2">Equipment in Zone</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {equipment.map(eq => (
                        <label
                          key={eq.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={zone.equipment.includes(eq.id)}
                            onChange={() => toggleEquipmentInZone(zone.id, eq.id)}
                            className="rounded border-gray-600"
                          />
                          <span className="text-sm">{eq.name}</span>
                          <span className="text-xs text-gray-500">({eq.type})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {!isEditing && zoneEquipment.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {zoneEquipment.slice(0, 5).map(eq => (
                      <span
                        key={eq.id}
                        className="px-2 py-1 bg-gray-700 rounded text-xs"
                      >
                        {eq.name}
                      </span>
                    ))}
                    {zoneEquipment.length > 5 && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        +{zoneEquipment.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {zones.length === 0 && !isCreating && (
        <div className="text-center py-8 text-gray-500">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No zones created yet</p>
          <p className="text-sm mt-1">Create zones to group and control equipment together</p>
        </div>
      )}
    </div>
  );
}