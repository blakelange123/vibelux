'use client';

import React from 'react';
import { X, Lightbulb, Settings, BarChart3, Trash2 } from 'lucide-react';
import { useDesigner, useSelectedObject } from '../context/DesignerContext';
import { FixtureStyleSelector } from './FixtureStyleSelector';
import type { Fixture } from '../context/types';

export function RightSidebar() {
  const { state, dispatch, updateObject, deleteObject } = useDesigner();
  const selectedObject = useSelectedObject();
  const { calculations } = state;

  if (!selectedObject) {
    return (
      <div className="w-80 bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 p-4">
        <h3 className="text-lg font-medium text-white mb-4">Properties</h3>
        <p className="text-gray-400 text-sm">Select an object to view its properties</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900/90 backdrop-blur-xl border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Object Properties
        </h3>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'rightSidebar' })}
          className="p-1 hover:bg-gray-800 rounded transition-all"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Object Info */}
      <div className="p-4 space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Type</span>
            <span className="text-sm text-white capitalize">{selectedObject.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">ID</span>
            <span className="text-xs text-gray-400 font-mono">{selectedObject.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Position */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Position</h4>
            <div className="flex gap-1">
              <button
                onClick={() => updateObject(selectedObject.id, { x: selectedObject.x + 1 })}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                title="Move right 1ft"
              >
                X+
              </button>
              <button
                onClick={() => updateObject(selectedObject.id, { y: selectedObject.y + 1 })}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                title="Move down 1ft"
              >
                Y+
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-400">X (ft)</label>
              <input
                type="number"
                step="0.1"
                value={selectedObject.x.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '-') return;
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    updateObject(selectedObject.id, { x: numValue });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) {
                    updateObject(selectedObject.id, { x: selectedObject.x });
                  }
                }}
                className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Y (ft)</label>
              <input
                type="number"
                step="0.1"
                value={selectedObject.y.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '-') return;
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    updateObject(selectedObject.id, { y: numValue });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) {
                    updateObject(selectedObject.id, { y: selectedObject.y });
                  }
                }}
                className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Z (ft)</label>
              <input
                type="number"
                step="0.1"
                value={selectedObject.z.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '-') return;
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    updateObject(selectedObject.id, { z: numValue });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) {
                    updateObject(selectedObject.id, { z: selectedObject.z });
                  }
                }}
                className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Width (ft)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedObject.width.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') return;
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue > 0) {
                    updateObject(selectedObject.id, { width: numValue });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value) || value <= 0) {
                    updateObject(selectedObject.id, { width: selectedObject.width });
                  }
                }}
                className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Length (ft)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedObject.length.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') return;
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue > 0) {
                    updateObject(selectedObject.id, { length: numValue });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value) || value <= 0) {
                    updateObject(selectedObject.id, { length: selectedObject.length });
                  }
                }}
                className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="text-xs text-gray-400">Rotation (degrees)</label>
          <input
            type="number"
            step="1"
            min="0"
            max="359"
            value={selectedObject.rotation}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') return;
              let numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                // Normalize rotation to 0-359 range
                numValue = numValue % 360;
                if (numValue < 0) numValue += 360;
                updateObject(selectedObject.id, { rotation: numValue });
              }
            }}
            onBlur={(e) => {
              const value = parseFloat(e.target.value);
              if (isNaN(value)) {
                updateObject(selectedObject.id, { rotation: selectedObject.rotation });
              }
            }}
            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>0°</span>
            <span>Current: {selectedObject.rotation}°</span>
            <span>359°</span>
          </div>
        </div>

        {/* Fixture-specific properties */}
        {selectedObject.type === 'fixture' && (
          <FixtureProperties fixture={selectedObject as Fixture} />
        )}

        {/* Quick Actions */}
        <div className="pt-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateObject(selectedObject.id, { x: 0, y: 0 })}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
              >
                Reset Position
              </button>
              <button
                onClick={() => updateObject(selectedObject.id, { rotation: 0 })}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
              >
                Reset Rotation
              </button>
            </div>
          </div>
          
          <button
            onClick={() => updateObject(selectedObject.id, { enabled: !selectedObject.enabled })}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
              selectedObject.enabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {selectedObject.enabled ? 'Enabled' : 'Disabled'}
          </button>
          
          <button
            onClick={() => {
              deleteObject(selectedObject.id);
              dispatch({ type: 'SELECT_OBJECT', payload: null });
            }}
            className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-red-400 font-medium transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Object
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-auto p-4 border-t border-gray-800">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Avg PPFD</p>
            <p className="text-white font-medium">{calculations.averagePPFD.toFixed(0)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Uniformity</p>
            <p className="text-white font-medium">{(calculations.uniformity * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Min PPFD</p>
            <p className="text-white font-medium">{calculations.minPPFD.toFixed(0)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Max PPFD</p>
            <p className="text-white font-medium">{calculations.maxPPFD.toFixed(0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FixtureProperties({ fixture }: { fixture: Fixture }) {
  const { updateObject } = useDesigner();

  const handleStyleChange = (style: string) => {
    // Update fixture with new style - this could be stored in fixture.style property
    updateObject(fixture.id, { 
      ...fixture,
      style: style // Add style property to fixture
    });
  };

  return (
    <div className="space-y-3 pt-3 border-t border-gray-700">
      <h4 className="text-sm font-medium text-gray-300">Fixture Properties</h4>
      
      {/* Fixture Style Selector */}
      <FixtureStyleSelector 
        selectedFixture={fixture}
        onStyleChange={handleStyleChange}
      />
      
      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Model</span>
          <span className="text-sm text-white">{fixture.model.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Wattage</span>
          <span className="text-sm text-white">{fixture.model.wattage}W</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">PPF</span>
          <span className="text-sm text-white">{fixture.model.ppf} µmol/s</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Efficacy</span>
          <span className="text-sm text-white">
            {(fixture.model.ppf / fixture.model.wattage).toFixed(1)} µmol/J
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Dimming Level (%)</label>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={fixture.dimmingLevel || 100}
          onChange={(e) => updateObject(fixture.id, { dimmingLevel: parseInt(e.target.value) })}
          className="w-full mt-2"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">10%</span>
          <span className="text-sm text-white font-medium">{fixture.dimmingLevel || 100}%</span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
      </div>
    </div>
  );
}