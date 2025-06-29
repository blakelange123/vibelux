'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Lightbulb, 
  Square, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Copy,
  Layers
} from 'lucide-react';
import { RoomObject, Fixture } from '../context/types';

interface CompactPropertiesPanelProps {
  selectedObject?: RoomObject | null;
  onPropertyChange?: (property: string, value: any) => void;
  onObjectAction?: (action: 'delete' | 'copy' | 'duplicate' | 'focus') => void;
}

export function CompactPropertiesPanel({ 
  selectedObject, 
  onPropertyChange, 
  onObjectAction 
}: CompactPropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'position']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'fixture': return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case 'room': return <Square className="w-4 h-4 text-blue-400" />;
      case 'zone': return <Layers className="w-4 h-4 text-green-400" />;
      default: return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-white">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No object selected</p>
            <p className="text-xs mt-1">Select an object to view properties</p>
          </div>
        </div>
      </div>
    );
  }

  const renderPropertyInput = (key: string, value: any, type: 'text' | 'number' | 'boolean' | 'select' = 'text', options?: string[]) => {
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{key}</span>
            <button
              onClick={() => onPropertyChange?.(key, !value)}
              className={`p-1 rounded transition-colors ${
                value ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              {value ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        );
        
      case 'number':
        return (
          <div>
            <label className="text-xs text-gray-400 block mb-1">{key}</label>
            <input
              type="number"
              value={value || 0}
              onChange={(e) => onPropertyChange?.(key, parseFloat(e.target.value))}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        );
        
      case 'select':
        return (
          <div>
            <label className="text-xs text-gray-400 block mb-1">{key}</label>
            <select
              value={value}
              onChange={(e) => onPropertyChange?.(key, e.target.value)}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-purple-500"
            >
              {options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
        
      default:
        return (
          <div>
            <label className="text-xs text-gray-400 block mb-1">{key}</label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onPropertyChange?.(key, e.target.value)}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        );
    }
  };

  // Get display name for the object
  const getObjectName = () => {
    if (selectedObject.customName) return selectedObject.customName;
    if (selectedObject.type === 'fixture') {
      const fixture = selectedObject as Fixture;
      return fixture.model?.name || 'Unknown Fixture';
    }
    return `${selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)} ${selectedObject.id}`;
  };

  const sections = [
    {
      id: 'basic',
      title: 'Basic',
      properties: selectedObject.type === 'fixture' ? [
        { key: 'Name', value: selectedObject.customName || (selectedObject as Fixture).model?.name || 'Unknown', type: 'text' },
        { key: 'Model', value: (selectedObject as Fixture).model?.name || 'Unknown', type: 'text' },
        { key: 'Enabled', value: selectedObject.enabled, type: 'boolean' },
        { key: 'Dimming', value: (selectedObject as Fixture).dimmingLevel || 100, type: 'number' }
      ] : [
        { key: 'Name', value: selectedObject.customName || getObjectName(), type: 'text' },
        { key: 'Type', value: selectedObject.type, type: 'text' }
      ]
    },
    {
      id: 'position',
      title: 'Position',
      properties: [
        { key: 'X', value: selectedObject.x, type: 'number' },
        { key: 'Y', value: selectedObject.y, type: 'number' },
        { key: 'Z', value: selectedObject.z, type: 'number' },
        { key: 'Rotation', value: selectedObject.rotation, type: 'number' }
      ]
    },
    {
      id: 'dimensions',
      title: 'Dimensions',
      properties: [
        { key: 'Width', value: selectedObject.width, type: 'number' },
        { key: 'Length', value: selectedObject.length, type: 'number' },
        { key: 'Height', value: selectedObject.height, type: 'number' }
      ]
    },
    {
      id: 'lighting',
      title: 'Lighting',
      properties: selectedObject.type === 'fixture' ? [
        { key: 'PPF', value: (selectedObject as Fixture).model?.ppf || 0, type: 'number' },
        { key: 'PPE', value: (selectedObject as Fixture).model?.efficacy || 0, type: 'number' },
        { key: 'Wattage', value: (selectedObject as Fixture).model?.wattage || 0, type: 'number' },
        { key: 'Spectrum', value: (selectedObject as Fixture).model?.spectrum || 'Unknown', type: 'text' }
      ] : []
    }
  ].filter(section => section.properties.length > 0);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getObjectIcon(selectedObject.type)}
            <h3 className="text-sm font-semibold text-white">Properties</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onObjectAction?.('copy')}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => onObjectAction?.('delete')}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {selectedObject.type} • {getObjectName()}
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sections.map(section => (
          <div key={section.id} className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-2 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between text-left"
            >
              <span className="text-sm font-medium text-white">{section.title}</span>
              {expandedSections.includes(section.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.includes(section.id) && (
              <div className="p-2 space-y-2 bg-gray-800/50">
                {section.properties.map(prop => (
                  <div key={prop.key}>
                    {renderPropertyInput(prop.key, prop.value, prop.type as any, (prop as any).options)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => onObjectAction?.('duplicate')}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={() => onObjectAction?.('focus')}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors"
          >
            Focus
          </button>
        </div>
      </div>
    </div>
  );
}