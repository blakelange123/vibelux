'use client';

import React, { useState } from 'react';
import { X, Grid3x3, Ruler, Eye, Volume2, Zap } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { state, dispatch } = useDesigner();
  const { ui, room } = state;
  
  // Settings state
  const [realtimePPFD, setRealtimePPFD] = useState(true);
  const [highQualityRendering, setHighQualityRendering] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Designer Settings</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Grid Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Grid Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Show Grid</span>
                <input
                  type="checkbox"
                  checked={ui.grid.enabled}
                  onChange={(e) => dispatch({ 
                    type: 'UPDATE_UI', 
                    payload: { grid: { ...ui.grid, enabled: e.target.checked } } 
                  })}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Snap to Grid</span>
                <input
                  type="checkbox"
                  checked={ui.grid.snap}
                  onChange={(e) => dispatch({ 
                    type: 'UPDATE_UI', 
                    payload: { grid: { ...ui.grid, snap: e.target.checked } } 
                  })}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
              </label>
              <div>
                <label className="text-sm text-gray-300">Grid Size (ft)</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={ui.grid.size}
                  onChange={(e) => dispatch({ 
                    type: 'UPDATE_UI', 
                    payload: { grid: { ...ui.grid, size: Number(e.target.value) } } 
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Units Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Units & Measurements
            </h3>
            <div>
              <label className="text-sm text-gray-300">Measurement System</label>
              <select
                value={ui.measurement.unit}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_UI', 
                  payload: { measurement: { unit: e.target.value as 'imperial' | 'metric' } } 
                })}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="imperial">Imperial (feet, inches)</option>
                <option value="metric">Metric (meters, cm)</option>
              </select>
            </div>
          </div>

          {/* Room Defaults */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Room Defaults
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-300">Working Height (ft)</label>
                <input
                  type="number"
                  min="0"
                  max={room.height}
                  step="0.5"
                  value={room.workingHeight}
                  onChange={(e) => dispatch({ 
                    type: 'UPDATE_ROOM', 
                    payload: { workingHeight: Number(e.target.value) } 
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Ceiling Reflectance</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={room.reflectances.ceiling}
                  onChange={(e) => dispatch({ 
                    type: 'UPDATE_ROOM', 
                    payload: { 
                      reflectances: { 
                        ...room.reflectances, 
                        ceiling: Number(e.target.value) 
                      } 
                    } 
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Wall Reflectance</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={room.reflectances.walls}
                  onChange={(e) => dispatch({ 
                    type: 'UPDATE_ROOM', 
                    payload: { 
                      reflectances: { 
                        ...room.reflectances, 
                        walls: Number(e.target.value) 
                      } 
                    } 
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance
            </h3>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Real-time PPFD Calculation</span>
              <input
                type="checkbox"
                checked={realtimePPFD}
                onChange={(e) => {
                  setRealtimePPFD(e.target.checked);
                  // Real-time PPFD is already implemented via useCalculations hook
                }}
                className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">High Quality Rendering</span>
              <input
                type="checkbox"
                checked={highQualityRendering}
                onChange={(e) => {
                  setHighQualityRendering(e.target.checked);
                }}
                className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>

          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Sound
            </h3>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Enable Sound Effects</span>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => {
                  setSoundEffects(e.target.checked);
                }}
                className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-800 flex gap-3">
            <button
              onClick={() => {
                dispatch({ type: 'RESET' });
                onClose();
              }}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-red-400 font-medium transition-all"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}