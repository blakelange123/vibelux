'use client';

import React, { useState } from 'react';
import {
  Settings,
  Lightbulb,
  Zap,
  Target,
  RotateCw,
  Move,
  Palette,
  Sliders,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Grid,
  Layers,
  Info,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Power,
  Gauge,
  Thermometer,
  Activity,
  Edit3,
  Save,
  RotateCcw
} from 'lucide-react';

interface Position {
  x: number;
  y: number;
  z?: number;
}

interface Rotation {
  x: number;
  y: number;
  z: number;
}

interface LightingProperties {
  intensity: number; // 0-100%
  color: string;
  temperature: number; // Kelvin
  spectrum: {
    red: number;
    green: number;
    blue: number;
    white: number;
    farRed: number;
  };
  ppf: number; // μmol/s
  ppfd: number; // μmol/m²/s
  efficacy: number; // μmol/J
  beam_angle: number; // degrees
}

interface PhysicalProperties {
  width: number;
  height: number;
  depth?: number;
  weight?: number;
  mounting_height: number;
  tilt_angle: number;
}

interface OperationalProperties {
  enabled: boolean;
  dimmable: boolean;
  schedule?: {
    on_time: string;
    off_time: string;
    dimming_curve: string;
  };
  power_consumption: number; // watts
  heat_output: number; // BTU/hr
  lifespan: number; // hours
}

interface DesignObject {
  id: string;
  type: 'fixture' | 'room' | 'obstacle' | 'sensor' | 'group';
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  position: Position;
  rotation: Rotation;
  scale: { x: number; y: number; z: number };
  visible: boolean;
  locked: boolean;
  selected: boolean;
  lighting_properties?: LightingProperties;
  physical_properties?: PhysicalProperties;
  operational_properties?: OperationalProperties;
  tags: string[];
  notes?: string;
  created_at: Date;
  modified_at: Date;
}

interface ObjectPropertiesSidebarProps {
  selectedObject: DesignObject | null;
  onUpdateObject?: (objectId: string, updates: Partial<DesignObject>) => void;
  onDuplicateObject?: (objectId: string) => void;
  onDeleteObject?: (objectId: string) => void;
  onClose?: () => void;
}

export function ObjectPropertiesSidebar({
  selectedObject,
  onUpdateObject,
  onDuplicateObject,
  onDeleteObject,
  onClose
}: ObjectPropertiesSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    transform: true,
    lighting: true,
    physical: false,
    operational: false,
    advanced: false
  });
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFieldEdit = (field: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const commitFieldEdit = (field: string) => {
    if (selectedObject && localValues[field] !== undefined) {
      const updates = getNestedUpdate(field, localValues[field]);
      onUpdateObject?.(selectedObject.id, updates);
      setLocalValues(prev => {
        const newValues = { ...prev };
        delete newValues[field];
        return newValues;
      });
    }
    setEditingField(null);
  };

  const getNestedUpdate = (field: string, value: any): Partial<DesignObject> => {
    const parts = field.split('.');
    if (parts.length === 1) {
      return { [field]: value };
    }
    
    const result: any = {};
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    return result;
  };

  const getFieldValue = (obj: DesignObject, field: string): any => {
    const parts = field.split('.');
    let value: any = obj;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    
    return localValues[field] !== undefined ? localValues[field] : value;
  };

  const renderEditableField = (
    label: string,
    field: string,
    type: 'text' | 'number' | 'select' | 'color' = 'text',
    options?: string[],
    unit?: string,
    min?: number,
    max?: number,
    step?: number
  ) => {
    if (!selectedObject) return null;
    
    const value = getFieldValue(selectedObject, field);
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-center justify-between py-2">
        <label className="text-xs text-gray-400">{label}</label>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              {type === 'select' ? (
                <select
                  value={localValues[field] || value || ''}
                  onChange={(e) => handleFieldEdit(field, e.target.value)}
                  className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                  autoFocus
                >
                  {options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : type === 'color' ? (
                <input
                  type="color"
                  value={localValues[field] || value || '#ffffff'}
                  onChange={(e) => handleFieldEdit(field, e.target.value)}
                  className="w-8 h-6 rounded border border-gray-600"
                  autoFocus
                />
              ) : (
                <input
                  type={type}
                  value={localValues[field] !== undefined ? localValues[field] : (value || '')}
                  onChange={(e) => handleFieldEdit(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                  autoFocus
                  min={min}
                  max={max}
                  step={step}
                />
              )}
              <button
                onClick={() => commitFieldEdit(field)}
                className="p-1 text-green-400 hover:text-green-300"
              >
                <Save className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setEditingField(null);
                  setLocalValues(prev => {
                    const newValues = { ...prev };
                    delete newValues[field];
                    return newValues;
                  });
                }}
                className="p-1 text-red-400 hover:text-red-300"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-white text-xs font-medium">
                {type === 'color' && value ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border border-gray-600"
                      style={{ backgroundColor: value }}
                    />
                    {value}
                  </div>
                ) : (
                  `${value || '-'}${unit || ''}`
                )}
              </span>
              <button
                onClick={() => {
                  setEditingField(field);
                  setLocalValues(prev => ({ ...prev, [field]: value }));
                }}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    icon: React.ElementType,
    sectionKey: string,
    children: React.ReactNode
  ) => (
    <div className="border border-gray-700 rounded-lg">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <div className="w-4 h-4 text-purple-400">{React.createElement(icon)}</div>}
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="p-4 bg-gray-800/50">
          {children}
        </div>
      )}
    </div>
  );

  if (!selectedObject) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No object selected</p>
          <p className="text-gray-500 text-xs mt-1">Select an object to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold">Object Properties</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            {selectedObject.type === 'fixture' && <Lightbulb className="w-4 h-4 text-yellow-500" />}
            {selectedObject.type === 'room' && <Grid className="w-4 h-4 text-blue-500" />}
            {selectedObject.type === 'obstacle' && <Target className="w-4 h-4 text-red-500" />}
            {selectedObject.type === 'sensor' && <Activity className="w-4 h-4 text-green-500" />}
            {selectedObject.type === 'group' && <Layers className="w-4 h-4 text-purple-500" />}
            <span className="text-white font-medium text-sm">{selectedObject.name}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onUpdateObject?.(selectedObject.id, { visible: !selectedObject.visible })}
              className={`p-1 ${selectedObject.visible ? 'text-blue-400' : 'text-gray-600'}`}
            >
              {selectedObject.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onUpdateObject?.(selectedObject.id, { locked: !selectedObject.locked })}
              className={`p-1 ${selectedObject.locked ? 'text-red-400' : 'text-gray-400'}`}
            >
              {selectedObject.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicateObject?.(selectedObject.id)}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-xs flex items-center justify-center gap-2"
          >
            <Copy className="w-3 h-3" />
            Duplicate
          </button>
          <button
            onClick={() => onDeleteObject?.(selectedObject.id)}
            className="flex-1 px-3 py-2 bg-red-900/50 hover:bg-red-900/70 border border-red-800 rounded-lg text-red-400 text-xs flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>

      {/* Properties Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Properties */}
        {renderSection('Basic Properties', Info, 'basic', (
          <div className="space-y-2">
            {renderEditableField('Name', 'name', 'text')}
            {renderEditableField('Type', 'type', 'select', ['fixture', 'room', 'obstacle', 'sensor', 'group'])}
            {selectedObject.brand && renderEditableField('Brand', 'brand', 'text')}
            {selectedObject.model && renderEditableField('Model', 'model', 'text')}
            {selectedObject.category && renderEditableField('Category', 'category', 'text')}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-300">{selectedObject.created_at.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Modified</span>
                <span className="text-gray-300">{selectedObject.modified_at.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Transform Properties */}
        {renderSection('Transform', Move, 'transform', (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">Position</div>
            {renderEditableField('X', 'position.x', 'number', undefined, 'ft', undefined, undefined, 0.1)}
            {renderEditableField('Y', 'position.y', 'number', undefined, 'ft', undefined, undefined, 0.1)}
            {selectedObject.position.z !== undefined && renderEditableField('Z', 'position.z', 'number', undefined, 'ft', undefined, undefined, 0.1)}
            
            <div className="text-xs text-gray-400 mb-2 mt-4">Rotation</div>
            {renderEditableField('X Rotation', 'rotation.x', 'number', undefined, '°', 0, 360)}
            {renderEditableField('Y Rotation', 'rotation.y', 'number', undefined, '°', 0, 360)}
            {renderEditableField('Z Rotation', 'rotation.z', 'number', undefined, '°', 0, 360)}
            
            <div className="text-xs text-gray-400 mb-2 mt-4">Scale</div>
            {renderEditableField('X Scale', 'scale.x', 'number', undefined, 'x', 0.1, 10, 0.1)}
            {renderEditableField('Y Scale', 'scale.y', 'number', undefined, 'x', 0.1, 10, 0.1)}
            {renderEditableField('Z Scale', 'scale.z', 'number', undefined, 'x', 0.1, 10, 0.1)}
          </div>
        ))}

        {/* Lighting Properties */}
        {selectedObject.lighting_properties && renderSection('Lighting Properties', Lightbulb, 'lighting', (
          <div className="space-y-2">
            {renderEditableField('Intensity', 'lighting_properties.intensity', 'number', undefined, '%', 0, 100)}
            {renderEditableField('Color', 'lighting_properties.color', 'color')}
            {renderEditableField('Temperature', 'lighting_properties.temperature', 'number', undefined, 'K', 2700, 6500)}
            {renderEditableField('PPF', 'lighting_properties.ppf', 'number', undefined, ' μmol/s')}
            {renderEditableField('PPFD', 'lighting_properties.ppfd', 'number', undefined, ' μmol/m²/s')}
            {renderEditableField('Efficacy', 'lighting_properties.efficacy', 'number', undefined, ' μmol/J', undefined, undefined, 0.1)}
            {renderEditableField('Beam Angle', 'lighting_properties.beam_angle', 'number', undefined, '°', 15, 180)}
            
            <div className="text-xs text-gray-400 mb-2 mt-4">Spectrum (%)</div>
            {renderEditableField('Red', 'lighting_properties.spectrum.red', 'number', undefined, '%', 0, 100)}
            {renderEditableField('Green', 'lighting_properties.spectrum.green', 'number', undefined, '%', 0, 100)}
            {renderEditableField('Blue', 'lighting_properties.spectrum.blue', 'number', undefined, '%', 0, 100)}
            {renderEditableField('White', 'lighting_properties.spectrum.white', 'number', undefined, '%', 0, 100)}
            {renderEditableField('Far Red', 'lighting_properties.spectrum.farRed', 'number', undefined, '%', 0, 100)}
          </div>
        ))}

        {/* Physical Properties */}
        {selectedObject.physical_properties && renderSection('Physical Properties', Target, 'physical', (
          <div className="space-y-2">
            {renderEditableField('Width', 'physical_properties.width', 'number', undefined, 'in', undefined, undefined, 0.1)}
            {renderEditableField('Height', 'physical_properties.height', 'number', undefined, 'in', undefined, undefined, 0.1)}
            {selectedObject.physical_properties.depth && renderEditableField('Depth', 'physical_properties.depth', 'number', undefined, 'in', undefined, undefined, 0.1)}
            {selectedObject.physical_properties.weight && renderEditableField('Weight', 'physical_properties.weight', 'number', undefined, ' lbs', undefined, undefined, 0.1)}
            {renderEditableField('Mounting Height', 'physical_properties.mounting_height', 'number', undefined, 'ft', undefined, undefined, 0.1)}
            {renderEditableField('Tilt Angle', 'physical_properties.tilt_angle', 'number', undefined, '°', -90, 90)}
          </div>
        ))}

        {/* Operational Properties */}
        {selectedObject.operational_properties && renderSection('Operational Properties', Power, 'operational', (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <label className="text-xs text-gray-400">Enabled</label>
              <button
                onClick={() => onUpdateObject?.(selectedObject.id, { 
                  operational_properties: { 
                    ...selectedObject.operational_properties!, 
                    enabled: !selectedObject.operational_properties!.enabled 
                  }
                })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  selectedObject.operational_properties.enabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  selectedObject.operational_properties.enabled ? 'translate-x-5' : 'translate-x-0.5'
                } transform mt-0.5`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <label className="text-xs text-gray-400">Dimmable</label>
              <button
                onClick={() => onUpdateObject?.(selectedObject.id, { 
                  operational_properties: { 
                    ...selectedObject.operational_properties!, 
                    dimmable: !selectedObject.operational_properties!.dimmable 
                  }
                })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  selectedObject.operational_properties.dimmable ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  selectedObject.operational_properties.dimmable ? 'translate-x-5' : 'translate-x-0.5'
                } transform mt-0.5`} />
              </button>
            </div>
            
            {renderEditableField('Power Consumption', 'operational_properties.power_consumption', 'number', undefined, 'W')}
            {renderEditableField('Heat Output', 'operational_properties.heat_output', 'number', undefined, ' BTU/hr')}
            {renderEditableField('Lifespan', 'operational_properties.lifespan', 'number', undefined, ' hours')}
          </div>
        ))}

        {/* Advanced Properties */}
        {renderSection('Advanced', Settings, 'advanced', (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-1">
                {selectedObject.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Notes</label>
              <textarea
                value={selectedObject.notes || ''}
                onChange={(e) => onUpdateObject?.(selectedObject.id, { notes: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                rows={3}
                placeholder="Add notes about this object..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}