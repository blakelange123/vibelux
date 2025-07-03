'use client';

import React, { useState, useMemo } from 'react';
import { Thermometer, Search, X, ChevronRight, Snowflake, Flame, Gauge, Zap, DollarSign, Info, Plus, AlertTriangle, Building, Move } from 'lucide-react';
import { hvacDatabase, hvacCategories, recommendHVACSystem, calculateCoolingLoad, HVACSystem } from '@/lib/hvac-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { HVACPositionControl } from './HVACPositionControl';
import { SpecSheetViewer } from './SpecSheetViewer';

interface HVACSystemPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function HVACSystemPanel({ isOpen = true, onClose }: HVACSystemPanelProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<HVACSystem | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [climate, setClimate] = useState<'hot' | 'moderate' | 'cold'>('moderate');
  const [targetTemp, setTargetTemp] = useState(78);
  const [showPositionControl, setShowPositionControl] = useState(false);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<HVACSystem | null>(null);

  // Calculate total lighting watts
  const totalLightingWatts = useMemo(() => {
    return state.objects
      .filter(obj => obj.type === 'fixture' && obj.enabled)
      .reduce((sum, fixture) => sum + ((fixture as any).model?.wattage || 600), 0);
  }, [state.objects]);

  // Calculate cooling load
  const coolingLoad = useMemo(() => {
    if (!state.room) return null;
    return calculateCoolingLoad(
      state.room.width,
      state.room.length,
      state.room.height,
      totalLightingWatts
    );
  }, [state.room, totalLightingWatts]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return null;
    return recommendHVACSystem(
      state.room.width,
      state.room.length,
      state.room.height,
      totalLightingWatts,
      climate
    );
  }, [state.room, totalLightingWatts, climate]);

  // Filter systems
  const filteredSystems = useMemo(() => {
    return Object.values(hvacDatabase).filter(system => {
      const matchesCategory = selectedCategory === 'all' || system.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        system.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddSystem = (system: HVACSystem) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    // Determine appropriate placement and dimensions based on equipment type
    let placement, dimensions;
    
    if (system.category === 'RTU' || system.category === 'AHU') {
      // Rooftop/AHU units go on roof or ceiling level
      placement = {
        x: state.room.width / 2,
        y: state.room.length / 2,
        z: state.room.height // On roof/ceiling
      };
      // Use outdoor dimensions for RTU (they're typically all outdoor)
      dimensions = system.physical?.outdoor || { width: 84, height: 42, depth: 60 }; // Default RTU size
    } else if (system.category === 'Chiller') {
      // Chillers are typically outdoor equipment rooms or equipment pads
      placement = {
        x: state.room.width * 0.1, // Side placement for chillers
        y: state.room.length * 0.1,
        z: 0 // Ground/pad level
      };
      dimensions = system.physical?.outdoor || { width: 48, height: 78, depth: 96 }; // Default chiller size
    } else if (system.category === 'MiniSplit') {
      // Mini-splits have indoor and outdoor units - place indoor unit
      placement = {
        x: state.room.width / 2,
        y: state.room.length / 2,
        z: state.room.height - 1 // Wall mounted near ceiling
      };
      // Prefer indoor unit dimensions for mini-splits in grow rooms
      dimensions = system.physical?.indoor || system.physical?.outdoor || { width: 42, height: 12, depth: 9 };
    } else if (system.category === 'Heater') {
      // Heaters typically wall or ceiling mounted
      placement = {
        x: state.room.width * 0.9, // Corner placement
        y: state.room.length * 0.1,
        z: state.room.height - 2 // Wall mounted
      };
      dimensions = system.physical?.indoor || { width: 26, height: 21, depth: 38 }; // Default heater size
    } else {
      // Default placement for other equipment
      placement = {
        x: state.room.width / 2,
        y: state.room.length / 2,
        z: 0
      };
      dimensions = system.physical?.outdoor || system.physical?.indoor || { width: 48, height: 48, depth: 24 };
    }

    const newEquipment = {
      type: 'equipment' as const,
      equipmentType: 'hvac',
      name: `${system.manufacturer} ${system.model}`,
      x: placement.x,
      y: placement.y,
      z: placement.z,
      width: dimensions.width / 12, // Convert inches to feet
      length: dimensions.depth / 12, // depth becomes length in 2D view
      height: dimensions.height / 12, // Convert inches to feet
      rotation: 0,
      category: system.category,
      coolingCapacity: system.capacity.cooling,
      heatingCapacity: system.capacity.heating,
      enabled: true,
      // Store original dimensions for reference
      physicalDimensions: dimensions,
      // Store capacity info for labeling
      tons: system.capacity.tons,
      airflow: system.capacity.airflow
    };

    // Equipment placement debug info would be logged here
    
    
    addObject(newEquipment);
    
    // Check if object was added by checking the state after a brief delay
    setTimeout(() => {
    }, 100);
    
    showNotification('success', `Added ${system.manufacturer} ${system.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    MiniSplit: '❄️',
    RTU: '🏢',
    Chiller: '🧊',
    Heater: '🔥',
    HeatPump: '♻️',
    AHU: '💨'
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">HVAC Systems</h2>
          </div>
          <div className="flex items-center gap-2">
            {state.objects.filter(obj => obj.type === 'equipment').length > 0 && (
              <button
                onClick={() => setShowPositionControl(true)}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Move className="w-3 h-3" />
                Position
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search HVAC systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Load Analysis */}
      {state.room && (
        <div className="p-3 bg-blue-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-blue-400 font-medium">Cooling Load Analysis</span>
            <ChevronRight className={`w-4 h-4 text-blue-400 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
          </button>
          
          {showAnalysis && coolingLoad && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Lighting Load:</span>
                <span className="text-white">{totalLightingWatts.toLocaleString()}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sensible Load:</span>
                <span className="text-white">{Math.round(coolingLoad.sensibleLoad).toLocaleString()} BTU/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latent Load:</span>
                <span className="text-white">{Math.round(coolingLoad.latentLoad).toLocaleString()} BTU/hr</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-gray-700">
                <span className="text-gray-300">Total Load:</span>
                <span className="text-blue-400">{(coolingLoad.totalLoad / 12000).toFixed(1)} tons</span>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <label className="block text-gray-400 mb-1">Climate Zone:</label>
                <select
                  value={climate}
                  onChange={(e) => setClimate(e.target.value as any)}
                  className="w-full bg-gray-800 text-white text-xs px-2 py-1 rounded"
                >
                  <option value="hot">Hot (95°F+ summer)</option>
                  <option value="moderate">Moderate (85°F summer)</option>
                  <option value="cold">Cold (Heating required)</option>
                </select>
              </div>

              {recommendations && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-blue-400 font-medium mb-1">Recommended Systems:</div>
                  {recommendations.primary.slice(0, 2).map((sys, i) => (
                    <div key={sys.id} className="bg-gray-800 p-2 rounded mb-1">
                      <div className="font-medium text-white text-xs">
                        {sys.manufacturer} {sys.model}
                      </div>
                      <div className="text-xs text-gray-400">
                        {sys.capacity.tons} tons • SEER {sys.efficiency.seer || 'N/A'}
                      </div>
                    </div>
                  ))}
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
        {Object.entries(hvacCategories).map(([id, category]) => (
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
            const isRecommended = recommendations?.primary.some(r => r.id === system.id);
            
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
                    system.type === 'Cooling' ? 'bg-blue-900/50 text-blue-400' :
                    system.type === 'Heating' ? 'bg-red-900/50 text-red-400' :
                    'bg-green-900/50 text-green-400'
                  }`}>
                    {system.type}
                  </span>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {system.capacity.tons && (
                    <div className="flex items-center gap-1">
                      <Snowflake className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.tons} tons</span>
                    </div>
                  )}
                  {system.efficiency.seer && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">SEER {system.efficiency.seer}</span>
                    </div>
                  )}
                  {system.power.voltage && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.power.voltage}V/{system.power.phase}PH</span>
                    </div>
                  )}
                  {system.coverage?.sqft && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.coverage.sqft} ft²</span>
                    </div>
                  )}
                </div>

                {/* Efficiency Rating */}
                {system.efficiency.seer && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Efficiency</span>
                    <span className={`text-xs font-medium ${
                      system.efficiency.seer >= 18 ? 'text-green-400' :
                      system.efficiency.seer >= 15 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      SEER {system.efficiency.seer}
                    </span>
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

                    {/* Capacity Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {system.capacity.cooling && (
                        <div>
                          <span className="text-gray-400">Cooling:</span>
                          <span className="text-gray-200 ml-1">{system.capacity.cooling.toLocaleString()} BTU</span>
                        </div>
                      )}
                      {system.capacity.heating && (
                        <div>
                          <span className="text-gray-400">Heating:</span>
                          <span className="text-gray-200 ml-1">{system.capacity.heating.toLocaleString()} BTU</span>
                        </div>
                      )}
                    </div>

                    {/* Power Requirements */}
                    <div className="bg-gray-700/50 p-2 rounded text-xs">
                      <div className="font-medium text-yellow-400 mb-1">Electrical Requirements:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>MCA: {system.power.mca}A</div>
                        <div>MOP: {system.power.mop}A</div>
                      </div>
                    </div>

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

      {/* Energy Tip */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-blue-400">Pro Tip:</span> Size HVAC for peak summer loads plus 
          10-20% safety factor. Consider redundancy with multiple units for critical operations.
        </p>
      </div>
    </div>

    {/* HVAC Position Control Panel */}
    <HVACPositionControl 
      isOpen={showPositionControl}
      onClose={() => setShowPositionControl(false)}
    />

    {/* Spec Sheet Viewer */}
    <SpecSheetViewer
      isOpen={showSpecSheet}
      onClose={() => {
        setShowSpecSheet(false);
        setSpecSheetProduct(null);
      }}
      product={specSheetProduct}
      type="hvac"
    />
  </>
  );
}