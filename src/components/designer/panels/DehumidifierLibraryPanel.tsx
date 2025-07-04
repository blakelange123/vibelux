'use client';

import React, { useState, useMemo } from 'react';
import { Droplets, Search, Filter, X, ChevronRight, Zap, Gauge, Ruler, DollarSign, Info, Plus, Droplet } from 'lucide-react';
import { dehumidifierDatabase, dehumidifierCategories, recommendDehumidifiers, calculateEnergyUsage, DehumidifierModel } from '@/lib/dehumidifier-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface DehumidifierLibraryPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DehumidifierLibraryPanel({ isOpen = true, onClose }: DehumidifierLibraryPanelProps) {
  const { state, addObject, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<DehumidifierModel | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [plantStage, setPlantStage] = useState<'clone' | 'veg' | 'flower'>('flower');
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<DehumidifierModel | null>(null);

  // Get plant count from current design
  const plantCount = useMemo(() => {
    return state.objects.filter(obj => obj.type === 'plant').length || 50; // Default estimate
  }, [state.objects]);

  // Calculate recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return [];
    return recommendDehumidifiers(
      state.room.width,
      state.room.length,
      state.room.height,
      plantCount,
      plantStage
    );
  }, [state.room, plantCount, plantStage]);

  // Filter units based on search and category
  const filteredUnits = useMemo(() => {
    return Object.values(dehumidifierDatabase).filter(unit => {
      const matchesCategory = selectedCategory === 'all' || unit.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        unit.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddUnit = (unit: DehumidifierModel) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    const newDehumidifier = {
      type: 'equipment' as const,
      equipmentType: 'dehumidifier',
      name: `${unit.manufacturer} ${unit.model}`,
      x: state.room.width / 2,
      y: state.room.length / 2,
      z: 0,
      width: unit.physical.width / 12, // Convert inches to feet
      length: unit.physical.depth / 12,
      height: unit.physical.height / 12,
      rotation: 0,
      capacity: unit.capacity.pintsPerDay,
      power: unit.power.watts,
      efficiency: unit.efficiency.pintsPerKwh,
      enabled: true
    };

    addObject(newDehumidifier);
    showNotification('success', `Added ${unit.manufacturer} ${unit.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    Portable: '📦',
    Ducted: '🌬️',
    Desiccant: '💨',
    Split: '🔧'
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Dehumidifier Library</h2>
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
            placeholder="Search dehumidifiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Room Analysis */}
      {state.room && (
        <div className="p-3 bg-cyan-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-cyan-400 font-medium">Moisture Load Analysis</span>
            <ChevronRight className={`w-4 h-4 text-cyan-400 transition-transform ${showRecommendations ? 'rotate-90' : ''}`} />
          </button>
          
          {showRecommendations && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Room Volume:</span>
                <span className="text-white">{(state.room.width * state.room.length * state.room.height).toFixed(0)} ft³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plant Count:</span>
                <span className="text-white">{plantCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Plant Stage:</span>
                <select
                  value={plantStage}
                  onChange={(e) => setPlantStage(e.target.value as any)}
                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded"
                >
                  <option value="clone">Clone/Seedling</option>
                  <option value="veg">Vegetative</option>
                  <option value="flower">Flowering</option>
                </select>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="text-cyan-400 font-medium mb-1">Recommended Units:</div>
                {recommendations.slice(0, 3).map((unit, i) => (
                  <div key={unit.id} className="flex justify-between text-gray-300">
                    <span>{i + 1}. {unit.manufacturer} {unit.model}</span>
                    <span className="text-cyan-400">{unit.capacity.pintsPerDay} PPD</span>
                  </div>
                ))}
              </div>
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
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Units
        </button>
        {Object.entries(dehumidifierCategories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="text-base">{categoryIcons[id as keyof typeof categoryIcons]}</span>
            {category.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Unit List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredUnits.map(unit => {
            const energyUsage = calculateEnergyUsage(unit);
            
            return (
              <div
                key={unit.id}
                className={`bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-cyan-500 transition-all cursor-pointer ${
                  selectedUnit?.id === unit.id ? 'border-cyan-500 bg-gray-750' : ''
                }`}
                onClick={() => setSelectedUnit(unit)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{unit.manufacturer}</h3>
                    <p className="text-xs text-gray-400">{unit.model}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    unit.category === 'Portable' ? 'bg-blue-900/50 text-blue-400' :
                    unit.category === 'Ducted' ? 'bg-green-900/50 text-green-400' :
                    unit.category === 'Desiccant' ? 'bg-purple-900/50 text-purple-400' :
                    'bg-orange-900/50 text-orange-400'
                  }`}>
                    {unit.category}
                  </span>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{unit.capacity.pintsPerDay} PPD</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{unit.power.watts}W</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{unit.efficiency.pintsPerKwh} PPK</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{unit.coverage.sqft} ft²</span>
                  </div>
                </div>

                {/* Efficiency Badge */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Efficiency</span>
                  <span className={`text-xs font-medium ${
                    unit.efficiency.pintsPerKwh > 4 ? 'text-green-400' :
                    unit.efficiency.pintsPerKwh > 3 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {unit.efficiency.pintsPerKwh} pints/kWh
                  </span>
                </div>

                {/* Expanded Details */}
                {selectedUnit?.id === unit.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    {/* Features */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {unit.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Operating Costs */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Daily Energy:</span>
                        <span className="text-gray-200 ml-1">{energyUsage.dailyKwh.toFixed(1)} kWh</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly Cost:</span>
                        <span className="text-gray-200 ml-1">${energyUsage.monthlyCost.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    {unit.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Est. Price:</span>
                        <span className="text-sm font-medium text-green-400">${unit.price}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddUnit(unit);
                        }}
                        className="flex-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Design
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpecSheetProduct(unit);
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

      {/* Quick Tips */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-cyan-400">Pro Tip:</span> Size dehumidifiers for peak transpiration during 
          flowering. Target 50-60% RH for veg, 40-50% for flower to prevent mold and optimize VPD.
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
        type="dehumidifier"
      />
    </div>
  );
}