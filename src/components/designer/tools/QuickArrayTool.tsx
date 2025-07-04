'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grid3x3, X, RefreshCw, Move, RotateCw, Check, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';

interface QuickArrayToolProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialFixture?: any;
}

interface ArrayPreview {
  fixtures: {
    x: number;
    y: number;
    rotation: number;
  }[];
  coverage: {
    width: number;
    length: number;
  };
  statistics: {
    totalFixtures: number;
    totalWattage: number;
    totalPPF: number;
    averagePPFD: number;
    uniformity: number;
    coverage: number;
  };
}

export function QuickArrayTool({ isOpen = true, onClose, initialFixture }: QuickArrayToolProps) {
  const { state, dispatch, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  
  // Array configuration
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(4);
  const [rowSpacing, setRowSpacing] = useState(48); // inches
  const [columnSpacing, setColumnSpacing] = useState(48); // inches
  const [rotation, setRotation] = useState(0);
  const [centerInRoom, setCenterInRoom] = useState(true);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  
  // Fixture selection
  const [selectedFixture, setSelectedFixture] = useState<any>(
    initialFixture || Object.values(dlcFixturesDatabase)[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFixtureList, setShowFixtureList] = useState(false);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Filter fixtures
  const filteredFixtures = useMemo(() => {
    return Object.values(dlcFixturesDatabase).filter(fixture => {
      const matchesSearch = searchQuery === '' || 
        fixture.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.model.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  // Calculate array preview
  const arrayPreview = useMemo((): ArrayPreview => {
    const fixtures: ArrayPreview['fixtures'] = [];
    
    // Calculate total coverage area
    const totalWidth = (columns - 1) * columnSpacing + (selectedFixture?.dimensions?.width || 48);
    const totalLength = (rows - 1) * rowSpacing + (selectedFixture?.dimensions?.length || 48);
    
    // Calculate starting position
    let arrayStartX = startX;
    let arrayStartY = startY;
    
    if (centerInRoom && state.room) {
      arrayStartX = (state.room.width - totalWidth) / 2;
      arrayStartY = (state.room.length - totalLength) / 2;
    }
    
    // Generate fixture positions
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        fixtures.push({
          x: arrayStartX + col * columnSpacing,
          y: arrayStartY + row * rowSpacing,
          rotation: rotation
        });
      }
    }
    
    // Calculate statistics
    const totalFixtures = rows * columns;
    const fixtureWattage = selectedFixture?.electricalSpecs?.wattage || 600;
    const fixturePPF = selectedFixture?.lightOutput?.ppf || 1600;
    const totalWattage = totalFixtures * fixtureWattage;
    const totalPPF = totalFixtures * fixturePPF;
    
    // Estimate PPFD and uniformity
    const roomArea = state.room ? (state.room.width * state.room.length) / 144 : 100; // sq ft
    const averagePPFD = totalPPF / roomArea / 10.76; // rough estimate
    const uniformity = 0.8 - (Math.max(rowSpacing, columnSpacing) - 36) * 0.001; // decreases with spacing
    const coverage = Math.min(100, (totalWidth * totalLength) / (state.room?.width || 1) / (state.room?.length || 1) * 100);
    
    return {
      fixtures,
      coverage: { width: totalWidth, length: totalLength },
      statistics: {
        totalFixtures,
        totalWattage,
        totalPPF,
        averagePPFD,
        uniformity: Math.max(0.6, Math.min(0.9, uniformity)),
        coverage
      }
    };
  }, [rows, columns, rowSpacing, columnSpacing, rotation, centerInRoom, startX, startY, selectedFixture, state.room]);

  // Optimize spacing based on fixture and room
  const optimizeSpacing = useCallback(() => {
    if (!state.room || !selectedFixture) return;
    
    setOptimizing(true);
    
    // Calculate optimal spacing based on fixture beam angle and mounting height
    const mountingHeight = (selectedFixture.mounting?.height || 96) - 72; // inches above canopy
    const beamAngle = selectedFixture.lightOutput?.beamAngle || 120;
    const lightRadius = mountingHeight * Math.tan((beamAngle / 2) * Math.PI / 180);
    
    // Optimal spacing is about 1.5x the light radius for good overlap
    const optimalSpacing = Math.round(lightRadius * 1.5);
    
    // Calculate number of fixtures that fit
    const possibleColumns = Math.floor((state.room.width - 24) / optimalSpacing) + 1;
    const possibleRows = Math.floor((state.room.length - 24) / optimalSpacing) + 1;
    
    setColumnSpacing(optimalSpacing);
    setRowSpacing(optimalSpacing);
    setColumns(Math.min(possibleColumns, 10));
    setRows(Math.min(possibleRows, 10));
    setCenterInRoom(true);
    
    setTimeout(() => {
      setOptimizing(false);
      showNotification('success', `Optimized for ${optimalSpacing}" spacing based on fixture beam angle`);
    }, 500);
  }, [state.room, selectedFixture, showNotification]);

  // Apply the array
  const applyArray = useCallback(() => {
    if (!selectedFixture || arrayPreview.fixtures.length === 0) {
      showNotification('error', 'Please configure the array first');
      return;
    }

    // Add all fixtures
    arrayPreview.fixtures.forEach((pos, index) => {
      const newFixture = {
        type: 'fixture' as const,
        name: `${selectedFixture.manufacturer} ${selectedFixture.model}`,
        x: pos.x,
        y: pos.y,
        z: selectedFixture.mounting?.height || 96,
        rotation: pos.rotation,
        width: selectedFixture.dimensions?.width || 48,
        length: selectedFixture.dimensions?.length || 48,
        height: selectedFixture.dimensions?.height || 6,
        model: selectedFixture,
        enabled: true
      };
      
      addObject(newFixture);
    });

    showNotification('success', `Added ${arrayPreview.fixtures.length} fixtures in array`);
    onClose?.();
  }, [selectedFixture, arrayPreview, addObject, showNotification, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        applyArray();
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, applyArray, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Quick Array Tool</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Selected Fixture */}
        <div 
          className="bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => setShowFixtureList(!showFixtureList)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">
                {selectedFixture?.manufacturer} {selectedFixture?.model}
              </div>
              <div className="text-xs text-gray-400">
                {selectedFixture?.electricalSpecs?.wattage}W • {selectedFixture?.lightOutput?.ppf} PPF
              </div>
            </div>
            <Lightbulb className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Fixture Selection (Collapsible) */}
      {showFixtureList && (
        <div className="p-3 bg-gray-800 border-b border-gray-700 max-h-48 overflow-y-auto">
          <input
            type="text"
            placeholder="Search fixtures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mb-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400"
          />
          <div className="space-y-1">
            {filteredFixtures.slice(0, 10).map(fixture => (
              <button
                key={fixture.id}
                onClick={() => {
                  setSelectedFixture(fixture);
                  setShowFixtureList(false);
                }}
                className={`w-full p-2 text-left rounded transition-colors ${
                  fixture.id === selectedFixture?.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="text-xs font-medium">{fixture.manufacturer} {fixture.model}</div>
                <div className="text-xs opacity-75">{fixture.electricalSpecs.wattage}W • ${fixture.pricing?.msrp}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Array Configuration */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Grid Configuration */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Array Configuration</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={columns}
                  onChange={(e) => setColumns(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Row Spacing (in)</label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={rowSpacing}
                  onChange={(e) => setRowSpacing(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Column Spacing (in)</label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={columnSpacing}
                  onChange={(e) => setColumnSpacing(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
            </div>
          </div>

          {/* Positioning */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Positioning</h3>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={centerInRoom}
                onChange={(e) => setCenterInRoom(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-purple-500"
              />
              <span className="text-sm text-gray-300">Center in room</span>
            </label>
            
            {!centerInRoom && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start X (in)</label>
                  <input
                    type="number"
                    value={startX}
                    onChange={(e) => setStartX(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Y (in)</label>
                  <input
                    type="number"
                    value={startY}
                    onChange={(e) => setStartY(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Rotation (degrees)</label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={optimizeSpacing}
            disabled={optimizing}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize Spacing
              </>
            )}
          </button>

          {/* Preview Statistics */}
          {showPreview && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Preview Statistics</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Total Fixtures:</span>
                  <div className="text-white font-medium">{arrayPreview.statistics.totalFixtures}</div>
                </div>
                <div>
                  <span className="text-gray-400">Total Wattage:</span>
                  <div className="text-white font-medium">{arrayPreview.statistics.totalWattage.toLocaleString()}W</div>
                </div>
                <div>
                  <span className="text-gray-400">Total PPF:</span>
                  <div className="text-white font-medium">{arrayPreview.statistics.totalPPF.toLocaleString()} μmol/s</div>
                </div>
                <div>
                  <span className="text-gray-400">Avg PPFD:</span>
                  <div className="text-white font-medium">~{Math.round(arrayPreview.statistics.averagePPFD)} μmol/m²/s</div>
                </div>
                <div>
                  <span className="text-gray-400">Coverage:</span>
                  <div className="text-white font-medium">{arrayPreview.coverage.width}" × {arrayPreview.coverage.length}"</div>
                </div>
                <div>
                  <span className="text-gray-400">Room Coverage:</span>
                  <div className={`font-medium ${
                    arrayPreview.statistics.coverage > 80 ? 'text-green-400' :
                    arrayPreview.statistics.coverage > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {arrayPreview.statistics.coverage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {arrayPreview.statistics.coverage > 100 && (
                <div className="flex items-start gap-2 p-2 bg-red-900/20 rounded text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Array extends beyond room boundaries</span>
                </div>
              )}
              {arrayPreview.statistics.averagePPFD < 300 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-900/20 rounded text-xs text-yellow-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>PPFD may be too low for optimal growth</span>
                </div>
              )}
              {arrayPreview.statistics.averagePPFD > 1000 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-900/20 rounded text-xs text-yellow-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>PPFD may be too high - consider CO₂ supplementation</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={applyArray}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Check className="w-4 h-4" />
          Apply Array ({arrayPreview.statistics.totalFixtures} fixtures)
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <div className="text-xs text-gray-500 text-center">
          Press ⌘+Enter to apply quickly
        </div>
      </div>
    </div>
  );
}