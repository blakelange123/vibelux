'use client';

import React, { useState, useMemo } from 'react';
import { Droplets, Search, X, ChevronRight, Gauge, Zap, DollarSign, Info, Plus, AlertTriangle, Leaf } from 'lucide-react';
import { irrigationDatabase, irrigationCategories, recommendIrrigationSystem, calculateWaterRequirement, calculateDosingRequirements, IrrigationSystem } from '@/lib/irrigation-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface IrrigationSystemPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function IrrigationSystemPanel({ isOpen = true, onClose }: IrrigationSystemPanelProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<IrrigationSystem | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [plantStage, setPlantStage] = useState<'seedling' | 'vegetative' | 'flowering'>('flowering');
  const [growthMedium, setGrowthMedium] = useState<'soil' | 'coco' | 'rockwool' | 'hydro'>('coco');
  const [plantCount, setPlantCount] = useState(100);
  const [targetEC, setTargetEC] = useState(1.5);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<IrrigationSystem | null>(null);

  // Calculate water requirements
  const waterRequirements = useMemo(() => {
    if (!state.room) return null;
    return calculateWaterRequirement(
      plantCount,
      plantStage,
      growthMedium,
      78 // Default temp
    );
  }, [plantCount, plantStage, growthMedium, state.room]);

  // Calculate dosing requirements
  const dosingRequirements = useMemo(() => {
    if (!waterRequirements) return null;
    return calculateDosingRequirements(
      waterRequirements.totalDailyWater,
      targetEC
    );
  }, [waterRequirements, targetEC]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return null;
    return recommendIrrigationSystem(
      state.room.width,
      state.room.length,
      plantCount,
      growthMedium,
      'advanced'
    );
  }, [state.room, plantCount, growthMedium]);

  // Filter systems
  const filteredSystems = useMemo(() => {
    return Object.values(irrigationDatabase).filter(system => {
      const matchesCategory = selectedCategory === 'all' || system.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        system.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddSystem = (system: IrrigationSystem) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    const newEquipment = {
      type: 'equipment' as const,
      equipmentType: 'irrigation',
      name: `${system.manufacturer} ${system.model}`,
      x: state.room.width / 2,
      y: state.room.length / 2,
      z: 0,
      width: (system.physical?.width || 24) / 12,
      length: (system.physical?.depth || 24) / 12,
      height: (system.physical?.height || 12) / 12,
      rotation: 0,
      category: system.category,
      flowRate: system.capacity.flowRate,
      coverage: system.capacity.coverage,
      enabled: true
    };

    addObject(newEquipment);
    showNotification('success', `Added ${system.manufacturer} ${system.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    Drip: '💧',
    EbbFlow: '🌊',
    NFT: '🏞️',
    DWC: '🪣',
    Aeroponic: '🌫️',
    Dosing: '💉',
    Controller: '🎛️',
    WaterTreatment: '🚰'
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Irrigation Systems</h2>
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
            placeholder="Search irrigation systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Water Analysis */}
      {state.room && (
        <div className="p-3 bg-blue-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-blue-400 font-medium">Water Requirements Analysis</span>
            <ChevronRight className={`w-4 h-4 text-blue-400 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
          </button>
          
          {showAnalysis && waterRequirements && (
            <div className="mt-3 space-y-2 text-xs">
              {/* Configuration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Plant Count:</label>
                  <input
                    type="number"
                    value={plantCount}
                    onChange={(e) => setPlantCount(Number(e.target.value))}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Growth Stage:</label>
                  <select
                    value={plantStage}
                    onChange={(e) => setPlantStage(e.target.value as any)}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    <option value="seedling">Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Medium:</label>
                  <select
                    value={growthMedium}
                    onChange={(e) => setGrowthMedium(e.target.value as any)}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    <option value="soil">Soil</option>
                    <option value="coco">Coco</option>
                    <option value="rockwool">Rockwool</option>
                    <option value="hydro">Hydro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Target EC:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetEC}
                    onChange={(e) => setTargetEC(Number(e.target.value))}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  />
                </div>
              </div>

              {/* Water Requirements */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Water/Plant:</span>
                  <span className="text-white">{waterRequirements.dailyWaterPerPlant.toFixed(2)} gal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Daily Water:</span>
                  <span className="text-white">{waterRequirements.totalDailyWater.toFixed(0)} gal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency:</span>
                  <span className="text-white">{waterRequirements.irrigationFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Runoff %:</span>
                  <span className="text-white">{waterRequirements.runoffPercentage}%</span>
                </div>
              </div>

              {/* Dosing Requirements */}
              {dosingRequirements && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-blue-400 font-medium mb-1">Nutrient Requirements:</div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Part A Daily:</span>
                    <span className="text-white">{dosingRequirements.nutrientADaily.toFixed(0)} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Part B Daily:</span>
                    <span className="text-white">{dosingRequirements.nutrientBDaily.toFixed(0)} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">pH Adjust:</span>
                    <span className="text-white">~{dosingRequirements.phAdjustDaily.toFixed(0)} ml</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1">
                    <span className="text-gray-300">Monthly Cost:</span>
                    <span className="text-green-400">${dosingRequirements.monthlyNutrientCost.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-blue-400 font-medium mb-1">Recommended Setup:</div>
                  {recommendations.distribution && (
                    <div className="bg-gray-800 p-2 rounded mb-1">
                      <div className="font-medium text-white text-xs">
                        {recommendations.distribution.manufacturer} {recommendations.distribution.model}
                      </div>
                      <div className="text-xs text-gray-400">
                        Distribution System
                      </div>
                    </div>
                  )}
                  {recommendations.dosing && (
                    <div className="bg-gray-800 p-2 rounded mb-1">
                      <div className="font-medium text-white text-xs">
                        {recommendations.dosing.manufacturer} {recommendations.dosing.model}
                      </div>
                      <div className="text-xs text-gray-400">
                        Dosing System
                      </div>
                    </div>
                  )}
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
      <div className="flex gap-1 p-2 bg-gray-800 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Systems
        </button>
        {Object.entries(irrigationCategories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={category.description}
          >
            <span className="text-base">{categoryIcons[id as keyof typeof categoryIcons]}</span>
            <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* System List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredSystems.map(system => {
            const isRecommended = recommendations?.distribution?.id === system.id || 
                                  recommendations?.dosing?.id === system.id ||
                                  recommendations?.controller?.id === system.id ||
                                  recommendations?.waterTreatment?.id === system.id;
            
            return (
              <div
                key={system.id}
                className={`bg-gray-800 rounded-lg p-3 border transition-all cursor-pointer ${
                  isRecommended ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-gray-700 hover:border-blue-500'
                } ${selectedSystem?.id === system.id ? 'bg-gray-750' : ''}`}
                onClick={() => setSelectedSystem(system)}
              >
                {isRecommended && (
                  <div className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full inline-block mb-2">
                    Recommended
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{system.manufacturer}</h3>
                    <p className="text-xs text-gray-400">{system.model}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    system.category === 'Drip' ? 'bg-blue-900/50 text-blue-400' :
                    system.category === 'EbbFlow' ? 'bg-cyan-900/50 text-cyan-400' :
                    system.category === 'NFT' ? 'bg-green-900/50 text-green-400' :
                    system.category === 'DWC' ? 'bg-purple-900/50 text-purple-400' :
                    system.category === 'Dosing' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {irrigationCategories[system.category]?.name || system.category}
                  </span>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {system.capacity.flowRate && (
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.flowRate} GPH</span>
                    </div>
                  )}
                  {system.capacity.coverage && (
                    <div className="flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.coverage} plants</span>
                    </div>
                  )}
                  {system.capacity.channels && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.channels} channels</span>
                    </div>
                  )}
                  {system.capacity.zones && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.zones} zones</span>
                    </div>
                  )}
                  {system.power?.watts && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.power.watts}W</span>
                    </div>
                  )}
                </div>

                {/* Accuracy/Precision */}
                {system.specifications?.accuracy && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Accuracy</span>
                    <span className="text-xs font-medium text-green-400">±{system.specifications.accuracy}%</span>
                  </div>
                )}

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

                    {/* Pressure Requirements */}
                    {system.specifications?.pressure && (
                      <div className="bg-gray-700/50 p-2 rounded text-xs">
                        <div className="font-medium text-yellow-400 mb-1">Pressure Requirements:</div>
                        <div>{system.specifications.pressure.min}-{system.specifications.pressure.max} {system.specifications.pressure.unit}</div>
                      </div>
                    )}

                    {/* Connectivity */}
                    {system.connectivity && system.connectivity.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-400">Connectivity:</span>
                        <span className="text-xs text-gray-200 ml-1">{system.connectivity.join(', ')}</span>
                      </div>
                    )}

                    {/* Consumables */}
                    {system.consumables && system.consumables.length > 0 && (
                      <div className="bg-yellow-900/20 p-2 rounded text-xs">
                        <div className="font-medium text-yellow-400 mb-1">Consumables:</div>
                        {system.consumables.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.type}: {item.lifespan}</span>
                            {item.cost && <span className="text-green-400">${item.cost}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    {system.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Est. Price:</span>
                        <span className="text-sm font-medium text-green-400">${system.price.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSystem(system);
                        }}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
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

      {/* Water Tip */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-blue-400">Pro Tip:</span> Match irrigation frequency to medium 
          water holding capacity. Coco and rockwool need more frequent irrigation than soil.
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
        type="irrigation"
      />
    </div>
  );
}