'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Ruler, 
  RotateCw, 
  Layers,
  Tag,
  Palette,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { RoomObject } from '../context/types';

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { state, updateObject, dispatch } = useDesigner();
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    transform: true,
    appearance: false,
    specific: true
  });

  const selectedObject = state.objects.find(obj => obj.id === state.ui.selectedObjectId);

  if (!isOpen || !selectedObject) return null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNumberInput = (property: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateObject(selectedObject.id, { [property]: numValue });
    }
  };

  const handleTextInput = (property: string, value: string) => {
    updateObject(selectedObject.id, { [property]: value });
  };

  const handleToggle = (property: string, currentValue: boolean) => {
    updateObject(selectedObject.id, { [property]: !currentValue });
  };

  const getObjectTypeIcon = () => {
    switch (selectedObject.type) {
      case 'fixture':
        return '💡';
      case 'plant':
        return '🌱';
      case 'equipment':
        return '⚙️';
      case 'hvacFan':
        return '🌀';
      case 'bench':
        return '🪑';
      case 'wall':
        return '🧱';
      default:
        return '📦';
    }
  };

  const renderSpecificProperties = () => {
    switch (selectedObject.type) {
      case 'fixture':
        return (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Model</label>
              <input
                type="text"
                value={selectedObject.model?.name || 'Unknown'}
                readOnly
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Wattage</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={selectedObject.model?.wattage || 0}
                  readOnly
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
                <span className="text-xs text-gray-400">W</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">PPF</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={selectedObject.model?.ppf || 0}
                  readOnly
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
                <span className="text-xs text-gray-400">μmol/s</span>
              </div>
            </div>
          </>
        );

      case 'equipment':
        const equipmentType = (selectedObject as any).equipmentType;
        return (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Equipment Type</label>
              <input
                type="text"
                value={equipmentType || 'Unknown'}
                readOnly
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-300 capitalize"
              />
            </div>
            {equipmentType === 'hvac' && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cooling Capacity</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={(selectedObject as any).tons || 'N/A'}
                      readOnly
                      className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                    <span className="text-xs text-gray-400">tons</span>
                  </div>
                </div>
              </>
            )}
          </>
        );

      case 'plant':
        return (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Plant Type</label>
              <select
                value={(selectedObject as any).plantType || 'cannabis'}
                onChange={(e) => handleTextInput('plantType', e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                <option value="cannabis">Cannabis</option>
                <option value="lettuce">Lettuce</option>
                <option value="tomato">Tomato</option>
                <option value="herbs">Herbs</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Growth Stage</label>
              <select
                value={(selectedObject as any).growthStage || 'vegetative'}
                onChange={(e) => handleTextInput('growthStage', e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Properties</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Object Info */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getObjectTypeIcon()}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white capitalize">{selectedObject.type}</p>
              <p className="text-xs text-gray-400">ID: {selectedObject.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* General Section */}
        <div className="bg-gray-800 rounded-lg">
          <button
            onClick={() => toggleSection('general')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">General</span>
            {expandedSections.general ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expandedSections.general && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Custom Name</label>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={selectedObject.customName || ''}
                    onChange={(e) => handleTextInput('customName', e.target.value)}
                    placeholder="Enter custom name..."
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Enabled</span>
                <button
                  onClick={() => handleToggle('enabled', selectedObject.enabled)}
                  className={`p-1.5 rounded transition-colors ${
                    selectedObject.enabled
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {selectedObject.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Locked</span>
                <button
                  onClick={() => handleToggle('locked', selectedObject.locked || false)}
                  className={`p-1.5 rounded transition-colors ${
                    selectedObject.locked
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {selectedObject.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transform Section */}
        <div className="bg-gray-800 rounded-lg">
          <button
            onClick={() => toggleSection('transform')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-white">Transform</span>
            {expandedSections.transform ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expandedSections.transform && (
            <div className="px-3 pb-3 space-y-3">
              {/* Position */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">X</label>
                    <input
                      type="number"
                      value={selectedObject.x.toFixed(1)}
                      onChange={(e) => handleNumberInput('x', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={selectedObject.y.toFixed(1)}
                      onChange={(e) => handleNumberInput('y', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Z</label>
                    <input
                      type="number"
                      value={selectedObject.z.toFixed(1)}
                      onChange={(e) => handleNumberInput('z', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Size</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={selectedObject.width.toFixed(1)}
                      onChange={(e) => handleNumberInput('width', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Length</label>
                    <input
                      type="number"
                      value={selectedObject.length.toFixed(1)}
                      onChange={(e) => handleNumberInput('length', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={selectedObject.height.toFixed(1)}
                      onChange={(e) => handleNumberInput('height', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rotation</label>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={selectedObject.rotation}
                    onChange={(e) => handleNumberInput('rotation', e.target.value)}
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    step="15"
                    min="0"
                    max="360"
                  />
                  <span className="text-xs text-gray-400">°</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Type-Specific Properties */}
        {renderSpecificProperties() && (
          <div className="bg-gray-800 rounded-lg">
            <button
              onClick={() => toggleSection('specific')}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-white">
                {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)} Properties
              </span>
              {expandedSections.specific ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.specific && (
              <div className="px-3 pb-3 space-y-3">
                {renderSpecificProperties()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              const newObj = { ...selectedObject, id: `${selectedObject.type}_${Date.now()}` };
              dispatch({ type: 'ADD_OBJECT', payload: newObj });
            }}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
          >
            Duplicate Object
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'DELETE_OBJECT', payload: selectedObject.id });
              onClose();
            }}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
          >
            Delete Object
          </button>
        </div>
      </div>
    </div>
  );
}