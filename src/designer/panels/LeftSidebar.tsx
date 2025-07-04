'use client';

import React from 'react';
import { 
  Move, Plus, Grid3x3, Maximize2, Lightbulb, Sprout, Table,
  Layers, Sun, ChevronRight, Trash2, Copy, Settings2, Bot,
  Zap, Calculator, Download, Factory, Shield, Route, DoorOpen,
  MessageSquare
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { FixtureLibraryCompact } from './FixtureLibraryCompact';

const tools = [
  { id: 'select', icon: Move, label: 'Select' },
  { id: 'place', icon: Plus, label: 'Place' },
];

const objectTypes = [
  { id: 'fixture', icon: Lightbulb, label: 'Light Fixture' },
  { id: 'plant', icon: Sprout, label: 'Plant/Canopy' },
  { id: 'bench', icon: Table, label: 'Bench/Table' },
  { id: 'rack', icon: Layers, label: 'Vertical Rack' },
  { id: 'underCanopy', icon: Sun, label: 'Under Canopy' },
  { id: 'emergencyFixture', icon: Shield, label: 'Emergency Light' },
  { id: 'exitDoor', icon: DoorOpen, label: 'Exit Door' },
  { id: 'egressPath', icon: Route, label: 'Egress Path' }
];

export function LeftSidebar() {
  const { state, dispatch, setTool } = useDesigner();
  const { ui, room } = state;

  return (
    <div className="w-64 bg-gray-900/90 backdrop-blur-xl border-r border-gray-800 flex flex-col">
      {/* Tools Section */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Tools</h3>
        <div className="grid grid-cols-3 gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                ui.selectedTool === tool.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tool.icon className="w-5 h-5" />
              <span className="text-xs">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Object Type Selection */}
      {ui.selectedTool === 'place' && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Object Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {objectTypes.map(type => (
              <button
                key={type.id}
                onClick={() => dispatch({ type: 'SET_OBJECT_TYPE', payload: type.id })}
                className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 text-xs ${
                  ui.selectedObjectType === type.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-[10px]">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fixture Library - Only show for actual fixtures */}
      {ui.selectedTool === 'place' && ui.selectedObjectType === 'fixture' && (
        <div className="flex-1 overflow-y-auto">
          <FixtureLibraryCompact />
        </div>
      )}

      {/* Room Settings */}
      <div className="p-4 border-t border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Room Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Width (ft)</label>
            <input
              type="number"
              value={room.width}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_ROOM', 
                payload: { width: Number(e.target.value) } 
              })}
              className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Length (ft)</label>
            <input
              type="number"
              value={room.length}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_ROOM', 
                payload: { length: Number(e.target.value) } 
              })}
              className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Height (ft)</label>
            <input
              type="number"
              value={room.height}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_ROOM', 
                payload: { height: Number(e.target.value) } 
              })}
              className="w-full mt-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'aiAssistant' })}
          className="w-full flex items-center gap-2 p-2 rounded text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Design Assistant</span>
        </button>
        
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'greenhouse' })}
          className="w-full flex items-center gap-2 p-2 rounded text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all"
        >
          <Factory className="w-4 h-4" />
          <span>Professional Greenhouse</span>
        </button>
        
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'emergencyLighting' })}
          className="w-full flex items-center gap-2 p-2 rounded text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
        >
          <Shield className="w-4 h-4" />
          <span>Emergency Lighting</span>
        </button>
        
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'spectrumAnalysis' })}
          className="w-full flex items-center gap-2 p-2 rounded text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Spectrum Analysis</span>
        </button>
      </div>
    </div>
  );
}