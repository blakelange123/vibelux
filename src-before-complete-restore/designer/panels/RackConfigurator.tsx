'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Ruler, 
  Grid3x3, 
  Lightbulb, 
  Leaf,
  Settings,
  Plus,
  Minus,
  Copy,
  Eye,
  Save,
  Package,
  Droplets,
  Sun
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

export interface RackTier {
  id: string;
  height: number; // Height from rack base (ft)
  hasLighting: boolean;
  lightingType: 'top' | 'inter-canopy' | 'under-canopy';
  fixtureCount: number;
  fixtureSpacing: number;
  hasPlants: boolean;
  plantRows: number;
  plantColumns: number;
  plantSpacing: number;
  canopyHeight: number;
  growthStage: 'seedling' | 'vegetative' | 'flowering';
}

export interface RackConfiguration {
  id: string;
  name: string;
  width: number;
  length: number;
  height: number;
  tiers: RackTier[];
  aisleWidth: number;
  materialType: 'galvanized' | 'stainless' | 'aluminum' | 'painted';
  reflectivity: number;
  structuralType: 'mobile' | 'stationary';
  hasIrrigation: boolean;
  hasEnvironmentalControls: boolean;
}

interface RackConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceRack: (config: RackConfiguration) => void;
  initialConfig?: RackConfiguration;
}

const DEFAULT_MATERIALS = {
  galvanized: { reflectivity: 0.55, name: 'Galvanized Steel' },
  stainless: { reflectivity: 0.65, name: 'Stainless Steel' },
  aluminum: { reflectivity: 0.75, name: 'Aluminum' },
  painted: { reflectivity: 0.85, name: 'White Painted Steel' }
};

export function RackConfigurator({ 
  isOpen, 
  onClose, 
  onPlaceRack,
  initialConfig 
}: RackConfiguratorProps) {
  const { state } = useDesigner();
  const { room } = state;

  const [config, setConfig] = useState<RackConfiguration>(initialConfig || {
    id: `rack-${Date.now()}`,
    name: 'Vertical Growing Rack',
    width: 4,
    length: 8,
    height: 8,
    tiers: [
      {
        id: 'tier-1',
        height: 2,
        hasLighting: true,
        lightingType: 'top',
        fixtureCount: 2,
        fixtureSpacing: 4,
        hasPlants: true,
        plantRows: 2,
        plantColumns: 4,
        plantSpacing: 1,
        canopyHeight: 1.5,
        growthStage: 'vegetative'
      },
      {
        id: 'tier-2',
        height: 4.5,
        hasLighting: true,
        lightingType: 'top',
        fixtureCount: 2,
        fixtureSpacing: 4,
        hasPlants: true,
        plantRows: 2,
        plantColumns: 4,
        plantSpacing: 1,
        canopyHeight: 1.5,
        growthStage: 'vegetative'
      },
      {
        id: 'tier-3',
        height: 7,
        hasLighting: true,
        lightingType: 'top',
        fixtureCount: 2,
        fixtureSpacing: 4,
        hasPlants: true,
        plantRows: 2,
        plantColumns: 4,
        plantSpacing: 1,
        canopyHeight: 1.5,
        growthStage: 'vegetative'
      }
    ],
    aisleWidth: 3,
    materialType: 'galvanized',
    reflectivity: 0.55,
    structuralType: 'stationary',
    hasIrrigation: true,
    hasEnvironmentalControls: false
  });

  const [selectedTier, setSelectedTier] = useState<string | null>(config.tiers[0]?.id);
  const [showPreview, setShowPreview] = useState(true);

  // Update material reflectivity when type changes
  useEffect(() => {
    if (config.materialType) {
      setConfig(prev => ({
        ...prev,
        reflectivity: DEFAULT_MATERIALS[config.materialType].reflectivity
      }));
    }
  }, [config.materialType]);

  const addTier = () => {
    const lastTier = config.tiers[config.tiers.length - 1];
    const newHeight = lastTier ? lastTier.height + 2.5 : 2;
    
    if (newHeight > room.height - 1) {
      alert('Cannot add tier - exceeds room height');
      return;
    }

    const newTier: RackTier = {
      id: `tier-${Date.now()}`,
      height: newHeight,
      hasLighting: true,
      lightingType: 'top',
      fixtureCount: 2,
      fixtureSpacing: config.length / 2,
      hasPlants: true,
      plantRows: 2,
      plantColumns: 4,
      plantSpacing: 1,
      canopyHeight: 1.5,
      growthStage: 'vegetative'
    };

    setConfig(prev => ({
      ...prev,
      tiers: [...prev.tiers, newTier],
      height: Math.max(prev.height, newHeight + 1)
    }));
    setSelectedTier(newTier.id);
  };

  const removeTier = (tierId: string) => {
    if (config.tiers.length <= 1) {
      alert('Must have at least one tier');
      return;
    }

    setConfig(prev => ({
      ...prev,
      tiers: prev.tiers.filter(t => t.id !== tierId)
    }));

    if (selectedTier === tierId) {
      setSelectedTier(config.tiers[0].id);
    }
  };

  const updateTier = (tierId: string, updates: Partial<RackTier>) => {
    setConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId ? { ...tier, ...updates } : tier
      )
    }));
  };

  const calculateTotalFixtures = () => {
    return config.tiers.reduce((total, tier) => 
      total + (tier.hasLighting ? tier.fixtureCount : 0), 0
    );
  };

  const calculateTotalPlants = () => {
    return config.tiers.reduce((total, tier) => 
      total + (tier.hasPlants ? tier.plantRows * tier.plantColumns : 0), 0
    );
  };

  const selectedTierData = config.tiers.find(t => t.id === selectedTier);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Configuration */}
        <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-400" />
              Multi-Tier Rack Configuration
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Basic Configuration */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Rack Dimensions
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Width (ft)</label>
                  <input
                    type="number"
                    value={config.width}
                    onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min="2"
                    max="8"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Length (ft)</label>
                  <input
                    type="number"
                    value={config.length}
                    onChange={(e) => setConfig({ ...config, length: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min="4"
                    max="20"
                    step="1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Max Height (ft)</label>
                  <input
                    type="number"
                    value={config.height}
                    onChange={(e) => setConfig({ ...config, height: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    min="4"
                    max={room.height - 1}
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            {/* Material and Structure */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Material & Structure
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Material Type</label>
                  <select
                    value={config.materialType}
                    onChange={(e) => setConfig({ ...config, materialType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {Object.entries(DEFAULT_MATERIALS).map(([key, mat]) => (
                      <option key={key} value={key}>{mat.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Reflectivity: {(config.reflectivity * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Structure Type</label>
                  <select
                    value={config.structuralType}
                    onChange={(e) => setConfig({ ...config, structuralType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="stationary">Stationary</option>
                    <option value="mobile">Mobile (with casters)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.hasIrrigation}
                    onChange={(e) => setConfig({ ...config, hasIrrigation: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-800 text-purple-600"
                  />
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Integrated Irrigation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.hasEnvironmentalControls}
                    onChange={(e) => setConfig({ ...config, hasEnvironmentalControls: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-800 text-purple-600"
                  />
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Environmental Controls</span>
                </label>
              </div>
            </div>

            {/* Tier Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Tier Configuration
                </h3>
                <button
                  onClick={addTier}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Tier
                </button>
              </div>

              {/* Tier List */}
              <div className="space-y-2 mb-4">
                {config.tiers.map((tier, index) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTier === tier.id
                        ? 'bg-purple-600/20 border border-purple-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">Tier {index + 1}</span>
                        <span className="text-sm text-gray-400 ml-2">
                          @ {tier.height} ft • {tier.plantRows}×{tier.plantColumns} plants
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTier(tier.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Tier Details */}
              {selectedTierData && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white">Tier Settings</h4>
                  
                  <div>
                    <label className="text-sm text-gray-400">Height from Base (ft)</label>
                    <input
                      type="number"
                      value={selectedTierData.height}
                      onChange={(e) => updateTier(selectedTierData.id, { height: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                      max={config.height}
                      step="0.5"
                    />
                  </div>

                  {/* Lighting Configuration */}
                  <div>
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedTierData.hasLighting}
                        onChange={(e) => updateTier(selectedTierData.id, { hasLighting: e.target.checked })}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">Enable Lighting</span>
                    </label>

                    {selectedTierData.hasLighting && (
                      <div className="ml-6 space-y-3">
                        <div>
                          <label className="text-sm text-gray-400">Lighting Type</label>
                          <select
                            value={selectedTierData.lightingType}
                            onChange={(e) => updateTier(selectedTierData.id, { lightingType: e.target.value as any })}
                            className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                          >
                            <option value="top">Top Lighting</option>
                            <option value="inter-canopy">Inter-Canopy</option>
                            <option value="under-canopy">Under-Canopy</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm text-gray-400">Fixture Count</label>
                            <input
                              type="number"
                              value={selectedTierData.fixtureCount}
                              onChange={(e) => updateTier(selectedTierData.id, { fixtureCount: Number(e.target.value) })}
                              className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Spacing (ft)</label>
                            <input
                              type="number"
                              value={selectedTierData.fixtureSpacing}
                              onChange={(e) => updateTier(selectedTierData.id, { fixtureSpacing: Number(e.target.value) })}
                              className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              min="1"
                              step="0.5"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plant Configuration */}
                  <div>
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedTierData.hasPlants}
                        onChange={(e) => updateTier(selectedTierData.id, { hasPlants: e.target.checked })}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <Leaf className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">Enable Plants</span>
                    </label>

                    {selectedTierData.hasPlants && (
                      <div className="ml-6 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm text-gray-400">Plant Rows</label>
                            <input
                              type="number"
                              value={selectedTierData.plantRows}
                              onChange={(e) => updateTier(selectedTierData.id, { plantRows: Number(e.target.value) })}
                              className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Plant Columns</label>
                            <input
                              type="number"
                              value={selectedTierData.plantColumns}
                              onChange={(e) => updateTier(selectedTierData.id, { plantColumns: Number(e.target.value) })}
                              className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              min="1"
                              max="20"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Plant Spacing (ft)</label>
                          <input
                            type="number"
                            value={selectedTierData.plantSpacing}
                            onChange={(e) => updateTier(selectedTierData.id, { plantSpacing: Number(e.target.value) })}
                            className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            min="0.5"
                            step="0.25"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Canopy Height (ft)</label>
                          <input
                            type="number"
                            value={selectedTierData.canopyHeight}
                            onChange={(e) => updateTier(selectedTierData.id, { canopyHeight: Number(e.target.value) })}
                            className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            min="0.5"
                            max="4"
                            step="0.25"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Growth Stage</label>
                          <select
                            value={selectedTierData.growthStage}
                            onChange={(e) => updateTier(selectedTierData.id, { growthStage: e.target.value as any })}
                            className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                          >
                            <option value="seedling">Seedling</option>
                            <option value="vegetative">Vegetative</option>
                            <option value="flowering">Flowering</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onPlaceRack(config)}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Place Rack System
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/3 p-6 bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-400" />
              Preview
            </h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-gray-400 hover:text-white"
            >
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>

          {showPreview && (
            <div className="space-y-4">
              {/* Visual Preview */}
              <div className="bg-gray-900 rounded-lg p-4 h-64 flex items-center justify-center">
                <RackPreview config={config} />
              </div>

              {/* Statistics */}
              <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-white mb-2">Rack Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Tiers</span>
                    <span className="text-white">{config.tiers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Fixtures</span>
                    <span className="text-white">{calculateTotalFixtures()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Plants</span>
                    <span className="text-white">{calculateTotalPlants()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Growing Area</span>
                    <span className="text-white">
                      {(config.width * config.length * config.tiers.length).toFixed(1)} ft²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Footprint</span>
                    <span className="text-white">
                      {config.width} × {config.length} ft
                    </span>
                  </div>
                </div>
              </div>

              {/* Efficiency Metrics */}
              <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-400 mb-2">Space Efficiency</h4>
                <div className="text-2xl font-bold text-white">
                  {((config.tiers.length * config.width * config.length) / (config.width * config.length) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-green-300 mt-1">
                  Vertical space utilization vs single tier
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rack Preview Component
function RackPreview({ config }: { config: RackConfiguration }) {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 200 240" className="w-full h-full">
        {/* Rack Frame */}
        <rect
          x="20"
          y={240 - config.height * 20}
          width={config.width * 20}
          height={config.height * 20}
          fill="none"
          stroke="#6B7280"
          strokeWidth="2"
        />
        
        {/* Tiers */}
        {config.tiers.map((tier, index) => {
          const y = 240 - tier.height * 20;
          return (
            <g key={tier.id}>
              {/* Tier Platform */}
              <rect
                x="20"
                y={y}
                width={config.width * 20}
                height="2"
                fill="#9CA3AF"
              />
              
              {/* Plants */}
              {tier.hasPlants && (
                <rect
                  x="25"
                  y={y - tier.canopyHeight * 20}
                  width={config.width * 20 - 10}
                  height={tier.canopyHeight * 20}
                  fill="#22C55E"
                  opacity="0.3"
                  rx="2"
                />
              )}
              
              {/* Lights */}
              {tier.hasLighting && (
                <rect
                  x="30"
                  y={tier.lightingType === 'under-canopy' ? y - 5 : y - tier.canopyHeight * 20 - 10}
                  width={config.width * 20 - 20}
                  height="5"
                  fill="#FBBF24"
                  opacity="0.8"
                />
              )}
              
              {/* Tier Label */}
              <text
                x="10"
                y={y + 5}
                fill="#9CA3AF"
                fontSize="10"
                textAnchor="end"
              >
                T{index + 1}
              </text>
            </g>
          );
        })}
        
        {/* Base */}
        <rect
          x="15"
          y="235"
          width={config.width * 20 + 10}
          height="5"
          fill="#6B7280"
        />
      </svg>
    </div>
  );
}