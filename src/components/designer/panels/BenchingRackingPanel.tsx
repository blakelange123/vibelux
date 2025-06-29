'use client';

import React, { useState, useMemo } from 'react';
import { Layers, Search, X, ChevronRight, Square, Ruler, DollarSign, Info, Plus, AlertTriangle, Grid3x3 } from 'lucide-react';
import { benchingDatabase, benchingCategories, recommendBenchingSystem, calculateBenchingEfficiency, calculateVerticalCapacity, BenchingSystem } from '@/lib/benching-racking-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface BenchingRackingPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function BenchingRackingPanel({ isOpen = true, onClose }: BenchingRackingPanelProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<BenchingSystem | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [cropType, setCropType] = useState<'cannabis' | 'leafygreens' | 'propagation'>('cannabis');
  const [benchType, setBenchType] = useState<'static' | 'rolling' | 'mobile'>('rolling');
  const [aisleWidth, setAisleWidth] = useState(36);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<BenchingSystem | null>(null);

  // Calculate space efficiency
  const spaceEfficiency = useMemo(() => {
    if (!state.room) return null;
    return calculateBenchingEfficiency(
      state.room.width,
      state.room.length,
      benchType,
      aisleWidth
    );
  }, [state.room, benchType, aisleWidth]);

  // Calculate vertical capacity if applicable
  const verticalCapacity = useMemo(() => {
    if (!state.room || state.room.height < 10 * 12) return null;
    return calculateVerticalCapacity(state.room.height, 3, 24);
  }, [state.room]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return null;
    return recommendBenchingSystem(
      state.room.width,
      state.room.length,
      state.room.height,
      cropType
    );
  }, [state.room, cropType]);

  // Filter systems
  const filteredSystems = useMemo(() => {
    return Object.values(benchingDatabase).filter(system => {
      const matchesCategory = selectedCategory === 'all' || system.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        system.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddSystem = (system: BenchingSystem) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    const newEquipment = {
      type: 'equipment' as const,
      equipmentType: 'benching',
      name: `${system.manufacturer} ${system.model}`,
      x: state.room.width / 2,
      y: state.room.length / 2,
      z: 0,
      width: system.dimensions.width / 12,
      length: system.dimensions.length / 12,
      height: (system.dimensions.workHeight || 30) / 12,
      rotation: 0,
      category: system.category,
      dimensions: system.dimensions,
      capacity: system.capacity,
      enabled: true
    };

    addObject(newEquipment);
    showNotification('success', `Added ${system.manufacturer} ${system.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    RollingBench: '🛤️',
    StaticBench: '🪑',
    VerticalRack: '📚',
    MobileCarriage: '🚂',
    GrowTable: '💧',
    PropagationBench: '🌱'
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Benching & Racking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search benching systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {/* Space Analysis */}
      {state.room && (
        <div className="p-3 bg-green-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-green-400 font-medium">Space Efficiency Analysis</span>
            <ChevronRight className={`w-4 h-4 text-green-400 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
          </button>
          
          {showAnalysis && spaceEfficiency && (
            <div className="mt-3 space-y-2 text-xs">
              {/* Configuration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Crop Type:</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value as any)}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    <option value="cannabis">Cannabis</option>
                    <option value="leafygreens">Leafy Greens</option>
                    <option value="propagation">Propagation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Bench Type:</label>
                  <select
                    value={benchType}
                    onChange={(e) => setBenchType(e.target.value as any)}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    <option value="static">Static</option>
                    <option value="rolling">Rolling</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">Aisle Width (inches):</label>
                  <input
                    type="number"
                    min="24"
                    max="60"
                    value={aisleWidth}
                    onChange={(e) => setAisleWidth(Number(e.target.value))}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  />
                </div>
              </div>

              {/* Efficiency Results */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Room Area:</span>
                  <span className="text-white">{spaceEfficiency.totalArea.toFixed(0)} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Growing Area:</span>
                  <span className="text-white">{spaceEfficiency.usableArea.toFixed(0)} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bench Count:</span>
                  <span className="text-white">{spaceEfficiency.benchCount} benches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aisles:</span>
                  <span className="text-white">{spaceEfficiency.aisleCount}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-gray-700">
                  <span className="text-gray-300">Space Efficiency:</span>
                  <span className={`${
                    spaceEfficiency.efficiency > 70 ? 'text-green-400' :
                    spaceEfficiency.efficiency > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {spaceEfficiency.efficiency.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Vertical Growing Potential */}
              {verticalCapacity && verticalCapacity.feasible && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-green-400 font-medium mb-1">Vertical Growing Potential:</div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Tiers:</span>
                      <span className="text-white">{verticalCapacity.maxTiers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grow Space/Tier:</span>
                      <span className="text-white">{verticalCapacity.growSpace}"</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {verticalCapacity.maxTiers * spaceEfficiency.usableArea} sq ft total with vertical
                    </div>
                  </div>
                </div>
              )}

              {/* Comparison */}
              {recommendations && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-green-400 font-medium mb-1">System Comparison:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Static:</span>
                      <span className="text-white">{recommendations.efficiency.static.efficiency.toFixed(0)}% efficiency</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Rolling:</span>
                      <span className="text-white">{recommendations.efficiency.rolling.efficiency.toFixed(0)}% efficiency</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Mobile:</span>
                      <span className="text-white">{recommendations.efficiency.mobile.efficiency.toFixed(0)}% efficiency</span>
                    </div>
                  </div>
                  {recommendations.notes.map((note, i) => (
                    <div key={i} className="text-xs text-gray-400 italic mt-1">• {note}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 p-3 bg-gray-900 border-b border-gray-700 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
              : 'bg-gray-800 text-gray-100 hover:bg-gray-700 hover:text-white border border-gray-600'
          }`}
        >
          All Systems
        </button>
        {Object.entries(benchingCategories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedCategory === id
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                : 'bg-gray-800 text-gray-100 hover:bg-gray-700 hover:text-white border border-gray-600'
            }`}
            title={category.description}
          >
            <span className="text-lg">{categoryIcons[id as keyof typeof categoryIcons]}</span>
            <span>{category.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* System List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredSystems.map(system => {
            const isRecommended = recommendations?.primary.some(r => r.id === system.id);
            
            return (
              <div
                key={system.id}
                className={`bg-gray-800 rounded-lg p-3 border transition-all cursor-pointer ${
                  isRecommended ? 'border-green-500 ring-1 ring-green-500/50' : 'border-gray-700 hover:border-green-500'
                } ${selectedSystem?.id === system.id ? 'bg-gray-750' : ''}`}
                onClick={() => setSelectedSystem(system)}
              >
                {isRecommended && (
                  <div className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full inline-block mb-2">
                    Recommended
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{system.manufacturer}</h3>
                    <p className="text-xs text-gray-400">{system.model}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    system.category === 'RollingBench' ? 'bg-blue-900/50 text-blue-400' :
                    system.category === 'VerticalRack' ? 'bg-purple-900/50 text-purple-400' :
                    system.category === 'GrowTable' ? 'bg-cyan-900/50 text-cyan-400' :
                    system.category === 'PropagationBench' ? 'bg-green-900/50 text-green-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {system.type}
                  </span>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Square className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">
                      {system.dimensions.width}" × {system.dimensions.length}"
                    </span>
                  </div>
                  {system.dimensions.tiers && (
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.dimensions.tiers} tiers</span>
                    </div>
                  )}
                  {system.capacity.trays && (
                    <div className="flex items-center gap-1">
                      <Grid3x3 className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.trays.count} trays</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{system.capacity.weightPerSqFt} lbs/ft²</span>
                  </div>
                </div>

                {/* Materials */}
                <div className="mt-2 text-xs">
                  <span className="text-gray-400">Materials:</span>
                  <span className="text-gray-300 ml-1">
                    {system.materials.frame} frame, {system.materials.surface} top
                  </span>
                </div>

                {/* Expanded Details */}
                {selectedSystem?.id === system.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    {/* Features */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {system.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dimensions Details */}
                    <div className="bg-gray-700/50 p-2 rounded text-xs">
                      <div className="font-medium text-gray-300 mb-1">Dimensions:</div>
                      <div className="grid grid-cols-2 gap-1 text-gray-400">
                        <div>Size: {system.dimensions.width}" × {system.dimensions.length}"</div>
                        {system.dimensions.workHeight && <div>Height: {system.dimensions.workHeight}"</div>}
                        {system.dimensions.tierSpacing && <div>Tier Spacing: {system.dimensions.tierSpacing}"</div>}
                        <div>Weight Cap: {system.capacity.totalWeight} lbs</div>
                      </div>
                    </div>

                    {/* Mobility */}
                    {system.mobility && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Mobility:</span>
                        <span className={`px-2 py-0.5 rounded ${
                          system.mobility.type === 'Mobile' || system.mobility.type === 'Motorized' 
                            ? 'bg-green-900/50 text-green-400' 
                            : system.mobility.type === 'Rolling'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {system.mobility.type}
                        </span>
                      </div>
                    )}

                    {/* Accessories */}
                    {system.accessories && system.accessories.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-400">Accessories:</span>
                        <div className="text-xs text-gray-200 mt-0.5">{system.accessories.join(', ')}</div>
                      </div>
                    )}

                    {/* Price */}
                    {system.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Est. Price:</span>
                        <span className="text-sm font-medium text-green-400">
                          ${system.price.toLocaleString()}
                          {system.pricePerSqFt && (
                            <span className="text-xs text-gray-400"> (${system.pricePerSqFt}/ft²)</span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSystem(system);
                        }}
                        className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Design
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpecSheetProduct(system);
                          setShowSpecSheet(true);
                        }}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs font-medium transition-colors"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Space Tip */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-green-400">Pro Tip:</span> Rolling benches can increase growing 
          space by 25-35% compared to static benches. Consider vertical systems for leafy greens.
        </p>
      </div>

      {/* Spec Sheet Viewer */}
      <SpecSheetViewer
        isOpen={showSpecSheet}
        onClose={() => {
          setShowSpecSheet(false);
          setSpecSheetProduct(null);
        }}
        product={specSheetProduct}
        type="bench"
      />
    </div>
  );
}