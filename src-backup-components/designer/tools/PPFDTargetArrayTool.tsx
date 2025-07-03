'use client';

import React, { useState, useEffect } from 'react';
import { X, Grid3x3, Zap, Calculator, Settings, Play, Info } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { calculatePPFDAtPoint } from '../utils/calculations';
import type { Fixture, RoomObject } from '../context/types';
import { FixtureSelectionModal } from '../modals/FixtureSelectionModal';
import type { FixtureModel } from '@/components/FixtureLibrary';

interface PPFDTargetArrayToolProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PPFDTargetArrayTool({ isOpen, onClose }: PPFDTargetArrayToolProps) {
  const { state, dispatch, addObject } = useDesigner();
  const { room, objects, ui } = state;
  
  const [targetPPFD, setTargetPPFD] = useState(400);
  const [workingHeight, setWorkingHeight] = useState(3); // feet from floor
  const [layoutType, setLayoutType] = useState<'grid' | 'staggered'>('grid');
  const [fixtureSpacing, setFixtureSpacing] = useState<'auto' | 'manual'>('auto');
  const [manualSpacingX, setManualSpacingX] = useState(4);
  const [manualSpacingY, setManualSpacingY] = useState(4);
  const [selectedFixtureModel, setSelectedFixtureModel] = useState<FixtureModel | null>(ui.selectedFixtureModel);
  const [preview, setPreview] = useState<RoomObject[]>([]);
  const [showFixtureSelection, setShowFixtureSelection] = useState(false);
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    averagePPFD: number;
    uniformity: number;
    fixtureCount: number;
    totalPower: number;
    fixturesNeeded: number;
    efficiency: number;
  } | null>(null);

  // Calculate optimal fixture placement
  const calculateOptimalLayout = () => {
    if (!room?.width || !room?.length || !room?.height) {
      alert('Please configure room dimensions first');
      return;
    }
    
    const fixtureModel = selectedFixtureModel || ui.selectedFixtureModel;
    if (!fixtureModel) {
      alert('Please select a fixture from the library first. Click on a fixture in the Fixture Library panel.');
      return;
    }
    
    // Update the selected fixture model if it was from UI
    if (!selectedFixtureModel && ui.selectedFixtureModel) {
      setSelectedFixtureModel(ui.selectedFixtureModel);
    }

    const fixtures: RoomObject[] = [];
    const mountingHeight = (room?.height || 10) - 2; // 2 feet from ceiling
    const fixtureToCanopy = mountingHeight - workingHeight;
    
    // Get fixture PPF (default to 1000 if not specified)
    const fixturePPF = fixtureModel.ppf || 1000;
    const beamAngle = fixtureModel.beamAngle || 120;
    
    // Calculate room area in square meters
    const roomAreaFt2 = room.width * room.length;
    const roomAreaM2 = roomAreaFt2 * 0.092903; // Convert ft² to m²
    
    // Calculate total PPF required for target PPFD
    // PPFD = PPF / Area, so PPF = PPFD × Area
    const totalPPFRequired = targetPPFD * roomAreaM2;
    
    // Calculate efficiency factor based on mounting height
    // Higher mounting = more light loss to walls
    const wallLossFactor = 0.1 + (fixtureToCanopy / 20) * 0.1; // 10-20% wall loss
    const reflectionFactor = 0.1; // 10% bonus from reflections
    const netEfficiency = (1 - wallLossFactor + reflectionFactor);
    
    // Calculate number of fixtures needed
    const fixturesNeeded = Math.ceil(totalPPFRequired / (fixturePPF * netEfficiency));
    
    // Calculate optimal spacing based on fixture count
    let spacingX: number, spacingY: number;
    if (fixtureSpacing === 'auto') {
      // Find the best rectangular arrangement
      let bestCols = 1;
      let bestRows = fixturesNeeded;
      let bestRatio = Math.abs((room.width / room.length) - (bestCols / bestRows));
      
      for (let cols = 1; cols <= fixturesNeeded; cols++) {
        const rows = Math.ceil(fixturesNeeded / cols);
        const ratio = Math.abs((room.width / room.length) - (cols / rows));
        if (ratio < bestRatio) {
          bestRatio = ratio;
          bestCols = cols;
          bestRows = rows;
        }
      }
      
      // Calculate spacing to evenly distribute fixtures
      spacingX = room.width / (bestCols + 1);
      spacingY = room.length / (bestRows + 1);
      
      // Ensure minimum spacing for maintenance access
      const minSpacing = 2; // 2 feet minimum
      if (spacingX < minSpacing || spacingY < minSpacing) {
        // Recalculate with minimum spacing
        bestCols = Math.floor(room.width / minSpacing) - 1;
        bestRows = Math.floor(room.length / minSpacing) - 1;
        spacingX = room.width / (bestCols + 1);
        spacingY = room.length / (bestRows + 1);
      }
    } else {
      spacingX = manualSpacingX;
      spacingY = manualSpacingY;
    }
    
    // Calculate grid dimensions based on spacing
    const cols = Math.floor((room.width + spacingX) / spacingX);
    const rows = Math.ceil(fixturesNeeded / cols);
    
    // Calculate starting offset to center the array
    const totalWidth = (cols - 1) * spacingX;
    const totalLength = (rows - 1) * spacingY;
    const offsetX = (room.width - totalWidth) / 2;
    const offsetY = (room.length - totalLength) / 2;
    
    // Generate fixtures
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let x = offsetX + col * spacingX;
        const y = offsetY + row * spacingY;
        
        // Apply staggered pattern if selected
        if (layoutType === 'staggered' && row % 2 === 1) {
          x += spacingX / 2;
          // Skip if fixture would be outside room bounds
          if (x > room.width - 1) continue;
        }
        
        const fixture: Fixture = {
          id: `preview-${row}-${col}`,
          type: 'fixture' as const,
          x,
          y,
          z: mountingHeight,
          rotation: 0,
          width: 2,
          length: 4,
          height: 0.5,
          enabled: true,
          model: fixtureModel
        };
        
        fixtures.push(fixture);
      }
    }
    
    // Calculate metrics for preview
    const ppfdValues: number[] = [];
    const gridResolution = 1; // 1 foot grid
    
    for (let x = 0; x < room.width; x += gridResolution) {
      for (let y = 0; y < room.length; y += gridResolution) {
        const ppfd = fixtures.reduce((total, fixture) => {
          return total + calculatePPFDAtPoint(
            { x, y, z: workingHeight },
            fixture as Fixture
          );
        }, 0);
        ppfdValues.push(ppfd);
      }
    }
    
    const avgPPFD = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    const minPPFD = Math.min(...ppfdValues);
    const maxPPFD = Math.max(...ppfdValues);
    const uniformity = minPPFD / avgPPFD;
    const totalPower = fixtures.length * (fixtureModel.wattage || 600);
    
    setCalculatedMetrics({
      averagePPFD: avgPPFD,
      uniformity,
      fixtureCount: fixtures.length,
      totalPower,
      fixturesNeeded,
      efficiency: netEfficiency
    });
    
    setPreview(fixtures);
  };

  // Apply the array to the canvas
  const applyArray = () => {
    if (preview.length === 0) return;
    
    // Add all fixtures from preview
    preview.forEach((fixture, index) => {
      setTimeout(() => {
        const { id, ...fixtureWithoutId } = fixture;
        addObject(fixtureWithoutId);
      }, index * 50); // Stagger additions for smooth UI
    });
    
    onClose();
  };

  // Update preview when parameters change
  useEffect(() => {
    if (selectedFixtureModel || ui.selectedFixtureModel) {
      calculateOptimalLayout();
    }
  }, [targetPPFD, workingHeight, layoutType, fixtureSpacing, manualSpacingX, manualSpacingY, selectedFixtureModel, ui.selectedFixtureModel]);

  // Sync with selected fixture from UI
  useEffect(() => {
    if (ui.selectedFixtureModel) {
      setSelectedFixtureModel(ui.selectedFixtureModel);
    }
  }, [ui.selectedFixtureModel]);

  // Show fixture selection modal when opened without a fixture
  useEffect(() => {
    if (isOpen && !selectedFixtureModel && !ui.selectedFixtureModel) {
      setShowFixtureSelection(true);
    }
  }, [isOpen, selectedFixtureModel, ui.selectedFixtureModel]);

  const handleFixtureSelection = (fixture: FixtureModel) => {
    setSelectedFixtureModel(fixture);
    setShowFixtureSelection(false);
    // Also update the UI state so other components know
    dispatch({ type: 'SET_SELECTED_FIXTURE_MODEL', payload: fixture });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-white">PPFD Target Array Tool</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Target Parameters */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-500" />
              Target Parameters
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={targetPPFD}
                  onChange={(e) => setTargetPPFD(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  min="50"
                  max="2000"
                  step="50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: Leafy greens (150-250), Cannabis veg (400-600), Cannabis flower (600-900)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Canopy Height (feet from floor)
                </label>
                <input
                  type="number"
                  value={workingHeight}
                  onChange={(e) => setWorkingHeight(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  min="0"
                  max={room.height - 3}
                  step="0.5"
                />
                <p className="text-xs text-gray-400 mt-1">
                  The height where PPFD will be calculated
                </p>
              </div>
            </div>
          </div>

          {/* Layout Options */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              Layout Options
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Layout Pattern
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayoutType('grid')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      layoutType === 'grid'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setLayoutType('staggered')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      layoutType === 'staggered'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Staggered
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fixture Spacing
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setFixtureSpacing('auto')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      fixtureSpacing === 'auto'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Auto-Calculate
                  </button>
                  <button
                    onClick={() => setFixtureSpacing('manual')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      fixtureSpacing === 'manual'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Manual
                  </button>
                </div>
                
                {fixtureSpacing === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400">X Spacing (ft)</label>
                      <input
                        type="number"
                        value={manualSpacingX}
                        onChange={(e) => setManualSpacingX(Number(e.target.value))}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        min="1"
                        max={room.width}
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Y Spacing (ft)</label>
                      <input
                        type="number"
                        value={manualSpacingY}
                        onChange={(e) => setManualSpacingY(Number(e.target.value))}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        min="1"
                        max={room.length}
                        step="0.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Fixture */}
          {selectedFixtureModel ? (
            <div className="bg-purple-600/20 rounded-lg border border-purple-600/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-purple-300">Selected Fixture</h4>
                <button
                  onClick={() => setShowFixtureSelection(true)}
                  className="text-xs text-purple-300 hover:text-purple-200 underline"
                >
                  Change Fixture
                </button>
              </div>
              <p className="text-white font-medium">{selectedFixtureModel.brand} {selectedFixtureModel.model}</p>
              <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-400">Wattage:</span>
                  <span className="text-white ml-1">{selectedFixtureModel.wattage}W</span>
                </div>
                <div>
                  <span className="text-gray-400">PPF:</span>
                  <span className="text-white ml-1">{selectedFixtureModel.ppf} μmol/s</span>
                </div>
                <div>
                  <span className="text-gray-400">Efficacy:</span>
                  <span className="text-white ml-1">{selectedFixtureModel.efficacy} μmol/J</span>
                </div>
                <div>
                  <span className="text-gray-400">Beam:</span>
                  <span className="text-white ml-1">{selectedFixtureModel.beamAngle || 120}°</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-600/20 rounded-lg border border-yellow-600/50 p-4">
              <p className="text-yellow-300 text-sm">No fixture selected. Please select a fixture to continue.</p>
              <button
                onClick={() => setShowFixtureSelection(true)}
                className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Select Fixture
              </button>
            </div>
          )}

          {/* Calculated Metrics */}
          {calculatedMetrics && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Calculated Results
              </h3>
              
              {/* Target Analysis */}
              <div className="bg-blue-600/20 rounded-lg border border-blue-600/50 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300">To achieve {targetPPFD} μmol/m²/s target:</p>
                    <p className="text-white font-medium">
                      {calculatedMetrics.fixturesNeeded} fixtures needed 
                      <span className="text-gray-400 text-sm ml-2">
                        ({(calculatedMetrics.efficiency * 100).toFixed(0)}% efficiency factor applied)
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Room: {room.width}' × {room.length}' = {(room.width * room.length).toFixed(0)} ft² 
                      ({(room.width * room.length * 0.092903).toFixed(0)} m²)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Fixture PPF</p>
                    <p className="text-xl font-bold text-white">{selectedFixtureModel?.ppf} μmol/s</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Mounting: {((room?.height || 10) - 2).toFixed(1)}' high
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Fixtures Placed</p>
                  <p className="text-2xl font-bold text-white">{calculatedMetrics.fixtureCount}</p>
                  {calculatedMetrics.fixtureCount !== calculatedMetrics.fixturesNeeded && (
                    <p className="text-xs text-yellow-400 mt-1">
                      {calculatedMetrics.fixtureCount > calculatedMetrics.fixturesNeeded ? 'More than needed' : 'Less than needed'}
                    </p>
                  )}
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Avg PPFD</p>
                  <p className="text-2xl font-bold text-white">{calculatedMetrics.averagePPFD.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">μmol/m²/s</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Uniformity</p>
                  <p className="text-2xl font-bold text-white">{(calculatedMetrics.uniformity * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Power</p>
                  <p className="text-2xl font-bold text-white">{(calculatedMetrics.totalPower / 1000).toFixed(1)}</p>
                  <p className="text-xs text-gray-400">kW</p>
                </div>
              </div>
              
              {Math.abs(calculatedMetrics.averagePPFD - targetPPFD) > targetPPFD * 0.1 && (
                <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-300">
                      Achieved PPFD differs from target by more than 10%. 
                      {calculatedMetrics.averagePPFD < targetPPFD 
                        ? 'Consider using higher PPF fixtures or reducing spacing.'
                        : 'Consider using dimming controls or increasing spacing.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {preview.length} fixtures will be placed
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={calculateOptimalLayout}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Recalculate
            </button>
            <button
              onClick={applyArray}
              disabled={preview.length === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Apply Array
            </button>
          </div>
        </div>
      </div>
      
      {/* Fixture Selection Modal */}
      <FixtureSelectionModal
        isOpen={showFixtureSelection}
        onClose={() => setShowFixtureSelection(false)}
        onSelect={handleFixtureSelection}
        title="Select Fixture for Array"
      />
    </div>
  );
}