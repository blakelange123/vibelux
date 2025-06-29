'use client';

import React, { useState, useEffect } from 'react';
import { Grid3x3, Copy, Settings, Play, X, Calculator, Zap, Info } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import type { RoomObject, Fixture } from '../context/types';

interface ArrayToolProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedObject?: RoomObject | null;
}

interface ArrayConfig {
  mode: 'manual' | 'ppfd';
  // Manual mode
  rows: number;
  columns: number;
  rowSpacing: number;
  columnSpacing: number;
  // PPFD mode
  targetPPFD: number;
  mountingHeight: number;
  workingHeight: number;
  roomWidth: number;
  roomLength: number;
  // Shared
  pattern: 'grid' | 'diamond' | 'staggered';
  rotateAlternate: boolean;
  centerInRoom: boolean;
}

export function ArrayTool({ isOpen, onClose, selectedObject }: ArrayToolProps) {
  const { state, addObject, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const { room } = state;
  
  // Use selectedFixture from state if no selectedObject is provided
  const fixtureToArray = selectedObject || state.selectedFixture;
  
  const [config, setConfig] = useState<ArrayConfig>({
    mode: 'manual',
    // Manual mode
    rows: 3,
    columns: 3,
    rowSpacing: 4,
    columnSpacing: 4,
    // PPFD mode
    targetPPFD: 500,
    mountingHeight: (room?.height || 10) - 2, // 2 feet from ceiling
    workingHeight: 3, // 3 feet from floor
    roomWidth: room?.width || 20,
    roomLength: room?.length || 20,
    // Shared
    pattern: 'grid',
    rotateAlternate: false,
    centerInRoom: true
  });

  const [preview, setPreview] = useState<RoomObject[]>([]);
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    actualPPFD: number;
    uniformity: number;
    coverage: number;
  } | null>(null);

  // Calculate optimal spacing based on target PPFD
  const calculateOptimalSpacing = () => {
    if (!fixtureToArray || (fixtureToArray.type && fixtureToArray.type !== 'fixture')) return { rows: 3, columns: 3, spacing: 4 };
    
    const fixture = fixtureToArray as any;
    const ppf = fixture.ppf || fixture.model?.ppf || 1000; // μmol/s
    const beamAngle = fixture.beamAngle || fixture.model?.beamAngle || 120; // degrees
    
    // Calculate coverage area per fixture at mounting height
    const fixtureToCanopy = config.mountingHeight - config.workingHeight;
    const coverageRadius = fixtureToCanopy * Math.tan((beamAngle / 2) * Math.PI / 180);
    const coverageArea = Math.PI * coverageRadius * coverageRadius; // square feet
    
    // Estimate PPFD at center of beam (simplified inverse square law)
    const centerPPFD = (ppf * 0.85) / (coverageArea * 0.0929); // Convert to m² and apply efficiency
    
    // Calculate required overlap factor based on target PPFD
    const overlapFactor = Math.sqrt(centerPPFD / config.targetPPFD);
    const optimalSpacing = coverageRadius * 2 / overlapFactor;
    
    // Calculate grid dimensions
    const cols = Math.ceil(config.roomWidth / optimalSpacing);
    const rows = Math.ceil(config.roomLength / optimalSpacing);
    
    // Adjust spacing to fit room exactly
    const adjustedSpacingX = config.roomWidth / cols;
    const adjustedSpacingY = config.roomLength / rows;
    
    return {
      rows,
      columns: cols,
      rowSpacing: adjustedSpacingY,
      columnSpacing: adjustedSpacingX
    };
  };

  const calculateArrayPositions = () => {
    if (!fixtureToArray) return [];
    
    const positions: RoomObject[] = [];
    let rows, columns, rowSpacing, columnSpacing;
    
    if (config.mode === 'ppfd') {
      const optimal = calculateOptimalSpacing();
      rows = optimal.rows;
      columns = optimal.columns;
      rowSpacing = optimal.rowSpacing;
      columnSpacing = optimal.columnSpacing;
    } else {
      rows = config.rows;
      columns = config.columns;
      rowSpacing = config.rowSpacing;
      columnSpacing = config.columnSpacing;
    }
    
    const { pattern, rotateAlternate, centerInRoom } = config;
    
    // Calculate total array dimensions
    const totalWidth = (columns - 1) * (columnSpacing ?? 0);
    const totalLength = (rows - 1) * (rowSpacing ?? 0);
    
    // Calculate starting position
    let startX = fixtureToArray.x || room?.width / 2 || 10;
    let startY = fixtureToArray.y || room?.length / 2 || 10;
    
    if (centerInRoom && room?.width && room?.length) {
      startX = (room.width - totalWidth) / 2;
      startY = (room.length - totalLength) / 2;
    }
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        let x = startX + col * (columnSpacing ?? 0);
        const y = startY + row * (rowSpacing ?? 0);
        
        // Apply pattern offsets
        if (pattern === 'diamond' && row % 2 === 1) {
          x += (columnSpacing ?? 0) / 2;
        } else if (pattern === 'staggered') {
          x += (row % 2) * ((columnSpacing ?? 0) / 3);
        }
        
        // Skip if fixture already exists at this position
        if (fixtureToArray.x && fixtureToArray.y && 
            Math.abs(x - fixtureToArray.x) < 0.1 && 
            Math.abs(y - fixtureToArray.y) < 0.1) {
          continue;
        }
        
        const newObject: RoomObject = {
          id: `array-${Date.now()}-${row}-${col}`,
          type: 'fixture',
          x,
          y,
          z: config.mode === 'ppfd' ? config.mountingHeight : (fixtureToArray.z || 8),
          width: fixtureToArray.width || 2,
          length: fixtureToArray.length || 4,
          height: fixtureToArray.height || 0.5,
          rotation: rotateAlternate && (row + col) % 2 === 1 
            ? ((fixtureToArray.rotation || 0) + 90) % 360 
            : (fixtureToArray.rotation || 0),
          enabled: true,
          locked: false
        };
        
        positions.push(newObject);
      }
    }
    
    return positions;
  };

  // Calculate PPFD metrics for the array
  const calculatePPFDMetrics = (positions: RoomObject[]) => {
    if (!fixtureToArray || (fixtureToArray.type && fixtureToArray.type !== 'fixture')) return;
    
    const fixture = fixtureToArray as any;
    const ppf = fixture.ppf || fixture.model?.ppf || 1000;
    
    // Sample points across the room
    const samplePoints = 20;
    const ppfdValues: number[] = [];
    
    for (let x = 0; x < samplePoints; x++) {
      for (let y = 0; y < samplePoints; y++) {
        const pointX = (x / (samplePoints - 1)) * config.roomWidth;
        const pointY = (y / (samplePoints - 1)) * config.roomLength;
        
        let totalPPFD = 0;
        
        // Calculate contribution from each fixture
        positions.forEach(pos => {
          const dx = pointX - pos.x;
          const dy = pointY - pos.y;
          const dz = (pos.z || config.mountingHeight) - config.workingHeight;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0.1) {
            // Simplified PPFD calculation
            const ppfd = (ppf / (4 * Math.PI * distance * distance * 0.0929)) * 0.85;
            totalPPFD += ppfd;
          }
        });
        
        ppfdValues.push(totalPPFD);
      }
    }
    
    const avgPPFD = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    const minPPFD = Math.min(...ppfdValues);
    const maxPPFD = Math.max(...ppfdValues);
    const uniformity = minPPFD / avgPPFD;
    
    setCalculatedMetrics({
      actualPPFD: avgPPFD,
      uniformity,
      coverage: (ppfdValues.filter(v => v >= config.targetPPFD * 0.9).length / ppfdValues.length) * 100
    });
  };

  const handlePreview = () => {
    const positions = calculateArrayPositions();
    setPreview(positions);
    if (config.mode === 'ppfd') {
      calculatePPFDMetrics(positions);
    }
    showNotification('info', `Preview generated: ${positions.length} fixtures`);
  };

  const handleApply = () => {
    if (!fixtureToArray) {
      showNotification('warning', 'Please select a fixture from the library first');
      return;
    }
    
    const positions = calculateArrayPositions();
    
    if (positions.length === 0) {
      showNotification('warning', 'No fixtures to place');
      return;
    }
    
    // Create a unique group ID for this array
    const arrayGroupId = `array-${Date.now()}`;
    
    // Add all fixtures with group ID
    positions.forEach(pos => {
      const { id, ...objectData } = pos;
      
      // Ensure we have a valid fixture object
      const fixtureObject: RoomObject = {
        id: `${id}`,
        type: 'fixture',
        x: objectData.x,
        y: objectData.y,
        z: objectData.z || 8,
        width: objectData.width || 2,
        length: objectData.length || 4,
        height: objectData.height || 0.5,
        rotation: objectData.rotation || 0,
        enabled: true,
        locked: false,
        group: arrayGroupId,
        // Include fixture model data if available
        model: typeof fixtureToArray.model === 'object' ? fixtureToArray.model : undefined,
        brand: fixtureToArray.brand,
        modelName: typeof fixtureToArray.model === 'string' ? fixtureToArray.model : fixtureToArray.model?.model,
        wattage: fixtureToArray.wattage,
        ppf: fixtureToArray.ppf,
        coverage: fixtureToArray.coverage
      };
      
      addObject(fixtureObject);
    });
    
    showNotification('success', `Created array of ${positions.length} fixtures (Group: ${arrayGroupId})`);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-white">Array Tool</h2>
          </div>
          <button
            onClick={() => onClose?.()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!fixtureToArray ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No fixture selected</p>
            <p className="text-sm text-gray-500 mb-4">Please select a fixture from the library first</p>
            <button
              onClick={() => {
                dispatch({ type: 'SET_TOOL', payload: 'place' });
                onClose?.();
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Select Fixture
            </button>
          </div>
        ) : (
          <>
            {/* Selected Fixture Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Selected Fixture</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {fixtureToArray.brand || 'Unknown'} {typeof fixtureToArray.model === 'string' ? fixtureToArray.model : fixtureToArray.model?.model || 'Fixture'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {fixtureToArray.wattage || 600}W • {fixtureToArray.ppf || 1000} μmol/s
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Coverage</p>
                  <p className="text-sm text-white">{fixtureToArray.coverage || 16} sq ft</p>
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setConfig({ ...config, mode: 'manual' })}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  config.mode === 'manual'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Manual Spacing
              </button>
              <button
                onClick={() => setConfig({ ...config, mode: 'ppfd' })}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  config.mode === 'ppfd'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Calculator className="w-4 h-4" />
                PPFD Target
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Configuration based on mode */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">
                  {config.mode === 'manual' ? 'Grid Configuration' : 'PPFD Configuration'}
                </h3>
                
                {config.mode === 'manual' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rows</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={config.rows}
                          onChange={(e) => setConfig({ ...config, rows: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Columns</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={config.columns}
                          onChange={(e) => setConfig({ ...config, columns: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Row Spacing (ft)</label>
                        <input
                          type="number"
                          min="0.5"
                          max="50"
                          step="0.5"
                          value={config.rowSpacing}
                          onChange={(e) => setConfig({ ...config, rowSpacing: parseFloat(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Column Spacing (ft)</label>
                        <input
                          type="number"
                          min="0.5"
                          max="50"
                          step="0.5"
                          value={config.columnSpacing}
                          onChange={(e) => setConfig({ ...config, columnSpacing: parseFloat(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target PPFD (μmol/m²/s)</label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        step="50"
                        value={config.targetPPFD}
                        onChange={(e) => setConfig({ ...config, targetPPFD: parseInt(e.target.value) || 500 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: Veg 400-600, Flower 600-900
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Mounting Height (ft)</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          step="0.5"
                          value={config.mountingHeight}
                          onChange={(e) => setConfig({ ...config, mountingHeight: parseFloat(e.target.value) || 10 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Working Height (ft)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={config.workingHeight}
                          onChange={(e) => setConfig({ ...config, workingHeight: parseFloat(e.target.value) || 3 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Room Width (ft)</label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          step="1"
                          value={config.roomWidth}
                          onChange={(e) => setConfig({ ...config, roomWidth: parseFloat(e.target.value) || room?.width || 20 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Room Length (ft)</label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          step="1"
                          value={config.roomLength}
                          onChange={(e) => setConfig({ ...config, roomLength: parseFloat(e.target.value) || room?.length || 20 })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Pattern Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">Pattern Options</h3>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pattern Type</label>
                  <select
                    value={config.pattern}
                    onChange={(e) => setConfig({ ...config, pattern: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="grid">Regular Grid</option>
                    <option value="diamond">Diamond (Offset Rows)</option>
                    <option value="staggered">Staggered</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.rotateAlternate}
                      onChange={(e) => setConfig({ ...config, rotateAlternate: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Rotate alternate fixtures 90°</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.centerInRoom}
                      onChange={(e) => setConfig({ ...config, centerInRoom: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Center array in room</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Array Summary</h3>
              {config.mode === 'manual' ? (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Fixtures:</span>
                    <span className="ml-2 text-white font-medium">{config.rows * config.columns}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Array Width:</span>
                    <span className="ml-2 text-white font-medium">
                      {((config.columns - 1) * config.columnSpacing).toFixed(1)} ft
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Array Length:</span>
                    <span className="ml-2 text-white font-medium">
                      {((config.rows - 1) * config.rowSpacing).toFixed(1)} ft
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Total Fixtures:</span>
                      <span className="ml-2 text-white font-medium">
                        {(() => {
                          const optimal = calculateOptimalSpacing();
                          return optimal.rows * optimal.columns;
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Calculated Spacing:</span>
                      <span className="ml-2 text-white font-medium">
                        {calculateOptimalSpacing()?.rowSpacing?.toFixed(1) ?? 'N/A'} ft
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Distance to Canopy:</span>
                      <span className="ml-2 text-white font-medium">
                        {(config.mountingHeight - config.workingHeight).toFixed(1)} ft
                      </span>
                    </div>
                  </div>
                  
                  {calculatedMetrics && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Avg PPFD:</span>
                          <span className={`ml-2 font-medium ${
                            Math.abs(calculatedMetrics.actualPPFD - config.targetPPFD) < config.targetPPFD * 0.1
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`}>
                            {calculatedMetrics.actualPPFD.toFixed(0)} μmol/m²/s
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Uniformity:</span>
                          <span className={`ml-2 font-medium ${
                            calculatedMetrics.uniformity > 0.7 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {(calculatedMetrics.uniformity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Coverage:</span>
                          <span className={`ml-2 font-medium ${
                            calculatedMetrics.coverage > 90 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {calculatedMetrics.coverage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* PPFD Info Box */}
            {config.mode === 'ppfd' && selectedObject && (
              <div className="bg-purple-600/20 rounded-lg p-4 mb-6 border border-purple-600/50">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-purple-300 font-medium mb-1">
                      Fixture: {(selectedObject as any).model?.name || 'Unknown Model'}
                    </p>
                    <p className="text-purple-200/80">
                      PPF: {(selectedObject as any).model?.ppf || 1000} μmol/s | 
                      Beam Angle: {(selectedObject as any).model?.beamAngle || 120}°
                    </p>
                    <p className="text-purple-200/60 mt-1">
                      The calculator optimizes spacing to achieve your target PPFD with minimal fixtures.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Status */}
            {preview.length > 0 && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Preview ready: {preview.length} fixtures will be placed
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Create Array
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}