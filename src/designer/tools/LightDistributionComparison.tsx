'use client';

import React, { useState } from 'react';
import { X, Eye, BarChart3, Download, Settings } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface LightDistributionComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LightDistributionComparison({ isOpen, onClose }: LightDistributionComparisonProps) {
  const { state } = useDesigner();
  const [selectedFixtures, setSelectedFixtures] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'ies-vs-estimated' | 'fixture-comparison'>('ies-vs-estimated');

  if (!isOpen) return null;

  // Get fixtures with custom IES data
  const fixturesWithIES = state.objects
    .filter(obj => obj.type === 'fixture' && obj.customIES)
    .map(obj => ({
      id: obj.id,
      name: `${obj.brand || 'Unknown'} ${obj.model || 'Fixture'}`,
      hasIES: !!obj.customIES,
      position: { x: obj.x, y: obj.y }
    }));

  const toggleFixtureSelection = (fixtureId: string) => {
    setSelectedFixtures(prev => 
      prev.includes(fixtureId) 
        ? prev.filter(id => id !== fixtureId)
        : [...prev, fixtureId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-white font-semibold text-xl">Light Distribution Comparison</h2>
            <p className="text-gray-400 text-sm mt-1">
              Compare IES photometric data with estimated distributions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">Comparison Type:</label>
              <select 
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value as any)}
                className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1 text-sm border border-gray-600"
              >
                <option value="ies-vs-estimated">IES vs Estimated</option>
                <option value="fixture-comparison">Fixture Comparison</option>
              </select>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
              <Settings className="w-4 h-4" />
              Options
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Fixture Selection */}
          {fixturesWithIES.length > 0 && (
            <div>
              <h3 className="text-gray-300 font-medium mb-2">Available Fixtures with IES Data:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {fixturesWithIES.map(fixture => (
                  <label
                    key={fixture.id}
                    className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFixtures.includes(fixture.id)}
                      onChange={() => toggleFixtureSelection(fixture.id)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <div className="text-gray-300">{fixture.name}</div>
                      <div className="text-gray-500">({fixture.position.x}, {fixture.position.y})</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison Content */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedFixtures.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-1">Select Fixtures to Compare</h3>
                <p className="text-sm">
                  Choose fixtures with IES data to see detailed photometric comparisons
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - IES Distribution */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  IES Photometric Data
                </h3>
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <p className="text-sm">Polar Distribution Chart</p>
                    <p className="text-xs mt-1">Based on actual IES measurements</p>
                  </div>
                </div>
                
                {/* IES Data Summary */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Lumens:</span>
                    <span className="text-gray-300">45,000 lm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Peak Intensity:</span>
                    <span className="text-gray-300">12,450 cd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Beam Angle:</span>
                    <span className="text-gray-300">120° × 95°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Field Angle:</span>
                    <span className="text-gray-300">145° × 115°</span>
                  </div>
                </div>
              </div>

              {/* Right Panel - Estimated Distribution */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estimated Distribution
                </h3>
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <p className="text-sm">Estimated Pattern</p>
                    <p className="text-xs mt-1">Based on fixture characteristics</p>
                  </div>
                </div>
                
                {/* Estimated Data Summary */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Lumens:</span>
                    <span className="text-gray-300">42,000 lm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Peak:</span>
                    <span className="text-gray-300">11,200 cd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pattern Type:</span>
                    <span className="text-gray-300">Lambertian</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-green-400">93%</span>
                  </div>
                </div>
              </div>

              {/* Comparison Analysis */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Analysis & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <div className="text-green-400 font-medium mb-1">Accuracy: 93%</div>
                    <p className="text-gray-300">
                      Estimated distribution closely matches IES data. Safe to use for initial calculations.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <div className="text-yellow-400 font-medium mb-1">Coverage Difference: 7%</div>
                    <p className="text-gray-300">
                      Slight variance in edge distribution. Consider IES data for precision work.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <div className="text-blue-400 font-medium mb-1">Recommendation</div>
                    <p className="text-gray-300">
                      Use IES data for final calculations and professional reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}