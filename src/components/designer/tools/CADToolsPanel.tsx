'use client';

import React, { useState } from 'react';
import { 
  MousePointer, 
  Square, 
  Circle, 
  Minus, 
  Type, 
  Ruler, 
  Grid3x3,
  Layers,
  Move,
  RotateCw,
  Copy,
  Scissors,
  ZapOff,
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

interface CADToolsPanelProps {
  onToolSelect?: (tool: string) => void;
  selectedTool?: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  lineWeight: number;
}

export function CADToolsPanel({ onToolSelect, selectedTool }: CADToolsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('drawing');
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Fixtures', visible: true, locked: false, color: '#FFD700', lineWeight: 2 },
    { id: '2', name: 'Walls', visible: true, locked: false, color: '#8B4513', lineWeight: 3 },
    { id: '3', name: 'Dimensions', visible: true, locked: false, color: '#00FF00', lineWeight: 1 },
    { id: '4', name: 'Annotations', visible: true, locked: false, color: '#FF0000', lineWeight: 1 },
    { id: '5', name: 'Grid', visible: true, locked: true, color: '#808080', lineWeight: 0.5 }
  ]);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const toolCategories = {
    drawing: {
      name: 'Drawing Tools',
      tools: [
        { id: 'select', name: 'Select', icon: MousePointer, shortcut: 'Esc' },
        { id: 'line', name: 'Line', icon: Minus, shortcut: 'L' },
        { id: 'rectangle', name: 'Rectangle', icon: Square, shortcut: 'R' },
        { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'C' },
        { id: 'text', name: 'Text', icon: Type, shortcut: 'T' },
        { id: 'dimension', name: 'Dimension', icon: Ruler, shortcut: 'D' }
      ]
    },
    modify: {
      name: 'Modify Tools',
      tools: [
        { id: 'move', name: 'Move', icon: Move, shortcut: 'M' },
        { id: 'rotate', name: 'Rotate', icon: RotateCw, shortcut: 'RO' },
        { id: 'copy', name: 'Copy', icon: Copy, shortcut: 'CO' },
        { id: 'trim', name: 'Trim', icon: Scissors, shortcut: 'TR' },
        { id: 'break', name: 'Break', icon: ZapOff, shortcut: 'BR' }
      ]
    },
    view: {
      name: 'View Tools',
      tools: [
        { id: 'grid', name: 'Grid', icon: Grid3x3, shortcut: 'G' },
        { id: 'layers', name: 'Layers', icon: Layers, shortcut: 'LA' },
        { id: 'settings', name: 'Settings', icon: Settings, shortcut: 'SET' }
      ]
    }
  };

  const handleToolSelect = (toolId: string) => {
    if (toolId === 'layers') {
      setShowLayerPanel(!showLayerPanel);
    } else {
      onToolSelect?.(toolId);
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const addNewLayer = () => {
    const newLayer: Layer = {
      id: (layers.length + 1).toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      color: '#FFFFFF',
      lineWeight: 1
    };
    setLayers([...layers, newLayer]);
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length > 1) {
      setLayers(prev => prev.filter(layer => layer.id !== layerId));
    }
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">CAD Tools</h2>
        <p className="text-sm text-gray-400">Professional drafting tools</p>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(toolCategories).map(([categoryId, category]) => (
          <div key={categoryId} className="border-b border-gray-700">
            <button
              onClick={() => setActiveCategory(activeCategory === categoryId ? '' : categoryId)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
            >
              <span className="font-medium text-white">{category.name}</span>
              {activeCategory === categoryId ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {activeCategory === categoryId && (
              <div className="px-2 pb-2">
                {category.tools.map(tool => {
                  const Icon = tool.icon;
                  const isSelected = selectedTool === tool.id;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 text-left transition-colors ${
                        isSelected 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs opacity-75">{tool.shortcut}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Layer Management Panel */}
      {showLayerPanel && (
        <div className="border-t border-gray-700 bg-gray-800 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-white">Layer Manager</h3>
            <button
              onClick={addNewLayer}
              className="p-1 text-green-400 hover:text-green-300 transition-colors"
              title="Add Layer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1 p-2">
            {layers.map(layer => (
              <div
                key={layer.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors"
              >
                {/* Color Swatch */}
                <div 
                  className="w-4 h-4 rounded border border-gray-600"
                  style={{ backgroundColor: layer.color }}
                />
                
                {/* Layer Name */}
                <div className="flex-1 text-sm text-white truncate">
                  {layer.name}
                </div>
                
                {/* Visibility Toggle */}
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className={`p-1 transition-colors ${
                    layer.visible ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-400'
                  }`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                {/* Lock Toggle */}
                <button
                  onClick={() => toggleLayerLock(layer.id)}
                  className={`p-1 transition-colors ${
                    layer.locked ? 'text-red-400 hover:text-red-300' : 'text-gray-500 hover:text-gray-400'
                  }`}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                
                {/* Edit */}
                <button
                  className="p-1 text-gray-500 hover:text-gray-400 transition-colors"
                  title="Edit Layer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                {/* Delete */}
                {layers.length > 1 && (
                  <button
                    onClick={() => deleteLayer(layer.id)}
                    className="p-1 text-red-500 hover:text-red-400 transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawing Settings */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Snap Settings
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-purple-600 text-white rounded text-xs">
                Endpoint
              </button>
              <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
                Midpoint
              </button>
              <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
                Center
              </button>
              <button className="px-3 py-2 bg-purple-600 text-white rounded text-xs">
                Grid
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Grid Spacing
            </label>
            <select 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              defaultValue="1"
            >
              <option value="0.5">0.5 ft</option>
              <option value="1">1 ft</option>
              <option value="2">2 ft</option>
              <option value="5">5 ft</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}