'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid3x3, 
  Copy, 
  Settings, 
  Play, 
  X, 
  Zap,
  Ruler,
  RotateCw,
  Target,
  Layers,
  Info
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import type { RoomObject, Fixture } from '../context/types';

interface BatchPlacementToolProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedFixture?: Fixture | null;
}

interface PlacementConfig {
  // Grid settings
  rows: number;
  columns: number;
  spacing: number; // feet
  mountingHeight: number; // feet
  
  // Pattern settings
  pattern: 'grid' | 'staggered' | 'diamond' | 'hexagonal';
  rotation: number; // degrees
  offset: { x: number; y: number };
  
  // Optimization settings
  autoOptimize: boolean;
  targetPPFD: number;
  targetUniformity: number;
  avoidObstacles: boolean;
  
  // Budget settings
  maxFixtures: number;
  budgetLimit: number;
}

export function BatchPlacementTool({ isOpen, onClose, selectedFixture }: BatchPlacementToolProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const { room } = state;
  
  const [config, setConfig] = useState<PlacementConfig>({
    rows: 4,
    columns: 4,
    spacing: 4,
    mountingHeight: 10,
    pattern: 'grid',
    rotation: 0,
    offset: { x: 0, y: 0 },
    autoOptimize: false,
    targetPPFD: 500,
    targetUniformity: 0.8,
    avoidObstacles: true,
    maxFixtures: 100,
    budgetLimit: 10000
  });
  
  const [preview, setPreview] = useState<RoomObject[]>([]);
  const [metrics, setMetrics] = useState({
    totalFixtures: 0,
    estimatedPPFD: 0,
    estimatedUniformity: 0,
    totalPower: 0,
    totalCost: 0
  });

  // Calculate batch placement
  const calculateBatchPlacement = () => {
    if (!selectedFixture) return [];
    
    const fixtures: RoomObject[] = [];
    const { rows, columns, spacing, pattern, rotation, offset, mountingHeight } = config;
    
    // Calculate starting position (centered in room)
    const totalWidth = (columns - 1) * spacing;
    const totalLength = (rows - 1) * spacing;
    const startX = (room.width - totalWidth) / 2 + offset.x;
    const startY = (room.length - totalLength) / 2 + offset.y;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        let x = startX + col * spacing;
        let y = startY + row * spacing;
        
        // Apply pattern modifications
        switch (pattern) {
          case 'staggered':
            if (row % 2 === 1) x += spacing / 2;
            break;
          case 'diamond':
            x += (row % 2) * spacing / 2;
            y = startY + row * spacing * 0.866; // sqrt(3)/2 for equilateral triangles
            break;
          case 'hexagonal':
            x += (row % 2) * spacing / 2;
            y = startY + row * spacing * 0.75;
            break;
        }
        
        // Check room boundaries
        if (x >= 0 && x <= room.width && y >= 0 && y <= room.length) {
          const fixture: Fixture = {
            id: `batch-${Date.now()}-${row}-${col}`,
            type: 'fixture' as const,
            x,
            y,
            z: mountingHeight,
            rotation,
            width: selectedFixture.width || 1.2,
            length: selectedFixture.length || 0.6,
            height: selectedFixture.height || 0.2,
            enabled: true,
            model: selectedFixture.model || {
              name: 'Unknown',
              wattage: 100,
              ppf: 200,
              beamAngle: 120
            }
          };
          fixtures.push(fixture);
        }
        
        if (fixtures.length >= config.maxFixtures) break;
      }
      if (fixtures.length >= config.maxFixtures) break;
    }
    
    return fixtures;
  };
  
  // Auto-optimize placement
  const optimizePlacement = () => {
    if (!selectedFixture || !config.autoOptimize) return;
    
    // Simple optimization: adjust spacing to meet target PPFD
    const fixtureOutput = selectedFixture.model?.ppf || 200;
    const beamAngle = selectedFixture.model?.beamAngle || 120;
    const coverageArea = Math.PI * Math.pow(config.mountingHeight * Math.tan(beamAngle * Math.PI / 360), 2);
    const ppfdPerFixture = fixtureOutput / coverageArea;
    
    // Calculate required fixture density
    const requiredDensity = config.targetPPFD / ppfdPerFixture;
    const optimalSpacing = Math.sqrt(1 / requiredDensity);
    
    // Update spacing
    setConfig(prev => ({
      ...prev,
      spacing: Math.max(2, Math.min(10, optimalSpacing))
    }));
    
    showNotification('info', `Optimized spacing to ${optimalSpacing.toFixed(1)} ft for target PPFD`);
  };
  
  // Update preview when config changes
  useEffect(() => {
    const fixtures = calculateBatchPlacement();
    setPreview(fixtures);
    
    // Calculate metrics
    const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).model?.wattage || 0), 0);
    const totalCost = fixtures.length * ((selectedFixture as any)?.price || 500);
    const avgPPFD = config.targetPPFD; // Simplified - would need full calculation
    
    setMetrics({
      totalFixtures: fixtures.length,
      estimatedPPFD: avgPPFD,
      estimatedUniformity: 0.75 + (config.spacing < 5 ? 0.1 : 0), // Simplified
      totalPower,
      totalCost
    });
  }, [config, selectedFixture, room]);
  
  const handleApply = () => {
    if (preview.length === 0) {
      showNotification('warning', 'No fixtures to place');
      return;
    }
    
    // Add all fixtures to the design
    const batchId = `batch-${Date.now()}`;
    preview.forEach(fixture => {
      const { id, ...fixtureWithoutId } = fixture;
      addObject({
        ...fixtureWithoutId,
        group: batchId
      });
    });
    
    showNotification('success', `Placed ${preview.length} fixtures in batch`);
    onClose?.();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Grid3x3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Batch Placement Tool</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rapidly fill space with optimal fixture layout</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {!selectedFixture ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No fixture selected</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Please select a fixture from the library first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Configuration */}
              <div className="space-y-6">
                {/* Grid Settings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Grid Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.rows}
                        onChange={(e) => setConfig({ ...config, rows: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Columns</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.columns}
                        onChange={(e) => setConfig({ ...config, columns: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Spacing */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Spacing (ft)
                    {config.autoOptimize && <span className="text-purple-600 ml-1">(Auto)</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="2"
                      max="10"
                      step="0.5"
                      value={config.spacing}
                      onChange={(e) => setConfig({ ...config, spacing: parseFloat(e.target.value) })}
                      className="flex-1 accent-purple-600"
                      disabled={config.autoOptimize}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                      {config.spacing.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                {/* Pattern */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Pattern</label>
                  <select
                    value={config.pattern}
                    onChange={(e) => setConfig({ ...config, pattern: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="grid">Grid</option>
                    <option value="staggered">Staggered</option>
                    <option value="diamond">Diamond</option>
                    <option value="hexagonal">Hexagonal</option>
                  </select>
                </div>
                
                {/* Auto-Optimize */}
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-Optimize</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Adjust spacing for target PPFD</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setConfig(prev => ({ ...prev, autoOptimize: !prev.autoOptimize }));
                      if (!config.autoOptimize) optimizePlacement();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.autoOptimize ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.autoOptimize ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              
              {/* Preview and Metrics */}
              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h3>
                  <div className="aspect-square bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
                    {/* Simple visual preview */}
                    <div className="absolute inset-0 p-4">
                      {preview.map((fixture, idx) => (
                        <div
                          key={idx}
                          className="absolute w-2 h-2 bg-purple-500 rounded-full"
                          style={{
                            left: `${(fixture.x / room.width) * 100}%`,
                            top: `${(fixture.y / room.length) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estimated Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Fixtures</span>
                      <span className="font-medium text-gray-900 dark:text-white">{metrics.totalFixtures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg PPFD</span>
                      <span className="font-medium text-gray-900 dark:text-white">{metrics.estimatedPPFD} µmol/m²/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Uniformity</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(metrics.estimatedUniformity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Power</span>
                      <span className="font-medium text-gray-900 dark:text-white">{metrics.totalPower.toLocaleString()} W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Est. Cost</span>
                      <span className="font-medium text-gray-900 dark:text-white">${metrics.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Warning */}
                {metrics.totalFixtures > 50 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Large number of fixtures may impact performance. Consider using zones for better organization.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {selectedFixture && (
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ready to place {metrics.totalFixtures} fixtures
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={preview.length === 0}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  Place Fixtures
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}