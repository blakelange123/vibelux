'use client';

import React, { useState, useMemo } from 'react';
import { Leaf, Search, X, ChevronRight, Flame, Gauge, AlertTriangle, DollarSign, Info, Plus, Timer, Building, Zap } from 'lucide-react';
import { co2Database, co2Categories, recommendCO2System, calculateCO2Requirement, calculateGeneratorRuntime, calculateTankDuration, CO2System } from '@/lib/co2-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface CO2SystemPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CO2SystemPanel({ isOpen = true, onClose }: CO2SystemPanelProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<CO2System | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [targetPPM, setTargetPPM] = useState(1200);
  const [hasGasLine, setHasGasLine] = useState(false);
  const [preferNoHeat, setPreferNoHeat] = useState(false);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<CO2System | null>(null);
  
  // Advanced CO2 enrichment settings
  const [enrichmentMode, setEnrichmentMode] = useState<'standard' | 'null-balance'>('standard');
  const [plantUptakeRate, setPlantUptakeRate] = useState(0.5); // g/m²/hr
  const [ventilationRate, setVentilationRate] = useState(0.1); // air changes per hour

  // Calculate room requirements with null-balance methodology
  const roomRequirements = useMemo(() => {
    if (!state.room) return null;
    const roomVolume = state.room.width * state.room.length * state.room.height;
    const basicRequirement = calculateCO2Requirement(roomVolume, targetPPM);
    
    if (enrichmentMode === 'null-balance') {
      // Null-balance CO2 calculation for maximum yield
      const roomAreaM2 = (state.room.width * state.room.length) * 0.0929; // ft² to m²
      const plantUptake = plantUptakeRate * roomAreaM2; // g/hr
      const ventilationLoss = (ventilationRate * roomVolume * 0.0283168 * 1.8) / 1000; // kg/hr
      const totalDemand = (plantUptake / 1000) + ventilationLoss; // kg/hr
      const co2FlowRate = totalDemand * 548.8; // Convert kg/hr to ft³/hr
      
      return {
        ...basicRequirement,
        nullBalanceRate: co2FlowRate,
        plantUptake: plantUptake,
        ventilationLoss: ventilationLoss * 1000,
        yieldIncrease: Math.min((targetPPM - 400) / 400 * 30, 30) // Up to 30% yield increase
      };
    }
    
    return basicRequirement;
  }, [state.room, targetPPM, enrichmentMode, plantUptakeRate, ventilationRate]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return null;
    return recommendCO2System(
      state.room.width,
      state.room.length,
      state.room.height,
      hasGasLine,
      preferNoHeat
    );
  }, [state.room, hasGasLine, preferNoHeat]);

  // Filter systems
  const filteredSystems = useMemo(() => {
    return Object.values(co2Database).filter(system => {
      const matchesCategory = selectedCategory === 'all' || system.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        system.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddSystem = (system: CO2System) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    const newEquipment = {
      type: 'equipment' as const,
      equipmentType: 'co2System',
      name: `${system.manufacturer} ${system.model}`,
      x: state.room.width / 2,
      y: state.room.length / 2,
      z: system.category === 'Generator' ? state.room.height - 2 : 0, // Mount generators high
      width: system.physical.width / 12,
      length: system.physical.depth / 12,
      height: system.physical.height / 12,
      rotation: 0,
      category: system.category,
      capacity: system.capacity.output,
      enabled: true
    };

    addObject(newEquipment);
    showNotification('success', `Added ${system.manufacturer} ${system.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    Generator: '🔥',
    Tank: '🛢️',
    Controller: '🎛️',
    Monitor: '📊',
    Regulator: '🔧'
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">CO₂ Systems</h2>
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
            placeholder="Search CO₂ equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {/* CO₂ Analysis */}
      {state.room && (
        <div className="p-3 bg-green-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-green-400 font-medium">CO₂ Requirements Analysis</span>
            <ChevronRight className={`w-4 h-4 text-green-400 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
          </button>
          
          {showAnalysis && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target PPM:</span>
                <input
                  type="number"
                  value={targetPPM}
                  onChange={(e) => setTargetPPM(Number(e.target.value))}
                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-20"
                  min="800"
                  max="1500"
                  step="100"
                />
              </div>
              
              {roomRequirements && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Initial Charge:</span>
                    <span className="text-white">{roomRequirements.initialCharge.toFixed(1)} ft³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maintenance Rate:</span>
                    <span className="text-green-400">{roomRequirements.maintenanceRate.toFixed(1)} ft³/hr</span>
                  </div>
                  
                  {enrichmentMode === 'null-balance' && roomRequirements.nullBalanceRate && (
                    <>
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-yellow-400 text-xs mb-1">Null-Balance Enrichment</div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Optimal Flow:</span>
                          <span className="text-yellow-400">{roomRequirements.nullBalanceRate.toFixed(1)} ft³/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plant Uptake:</span>
                          <span className="text-white">{roomRequirements.plantUptake.toFixed(1)} g/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Yield Increase:</span>
                          <span className="text-green-400">+{roomRequirements.yieldIncrease.toFixed(0)}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="pt-2 border-t border-gray-700 space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasGasLine}
                    onChange={(e) => setHasGasLine(e.target.checked)}
                    className="rounded bg-gray-800 border-gray-600"
                  />
                  <span className="text-gray-300">Natural gas available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferNoHeat}
                    onChange={(e) => setPreferNoHeat(e.target.checked)}
                    className="rounded bg-gray-800 border-gray-600"
                  />
                  <span className="text-gray-300">Avoid heat/humidity</span>
                </label>
                
                <div className="pt-2">
                  <label className="text-xs text-gray-400">Enrichment Mode:</label>
                  <select
                    value={enrichmentMode}
                    onChange={(e) => setEnrichmentMode(e.target.value as 'standard' | 'null-balance')}
                    className="w-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded"
                  >
                    <option value="standard">Standard (Basic)</option>
                    <option value="null-balance">Null-Balance (Max Yield)</option>
                  </select>
                </div>
                
                {enrichmentMode === 'null-balance' && (
                  <div className="space-y-1 pt-1">
                    <div>
                      <label className="text-xs text-gray-400">Plant Uptake (g/m²/hr):</label>
                      <input
                        type="number"
                        value={plantUptakeRate}
                        onChange={(e) => setPlantUptakeRate(Number(e.target.value))}
                        className="w-full mt-0.5 bg-gray-800 text-white text-xs px-2 py-1 rounded"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Air Changes/hr:</label>
                      <input
                        type="number"
                        value={ventilationRate}
                        onChange={(e) => setVentilationRate(Number(e.target.value))}
                        className="w-full mt-0.5 bg-gray-800 text-white text-xs px-2 py-1 rounded"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                      />
                    </div>
                  </div>
                )}
              </div>

              {recommendations && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-green-400 font-medium mb-1">Recommended:</div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="font-medium text-white">
                      {recommendations.primary.manufacturer} {recommendations.primary.model}
                    </div>
                    {recommendations.tankSize && (
                      <div className="text-xs text-gray-400 mt-1">
                        ~{recommendations.refillsPerMonth} refills/month
                      </div>
                    )}
                  </div>
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
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Systems
        </button>
        {Object.entries(co2Categories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === id
                ? 'bg-green-600 text-white'
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
            const isRecommended = recommendations?.primary.id === system.id;
            
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
                    system.category === 'Generator' ? 'bg-orange-900/50 text-orange-400' :
                    system.category === 'Tank' ? 'bg-blue-900/50 text-blue-400' :
                    system.category === 'Controller' ? 'bg-purple-900/50 text-purple-400' :
                    system.category === 'Monitor' ? 'bg-green-900/50 text-green-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {system.category}
                  </span>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {system.capacity.output && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">
                        {system.capacity.output} {system.category === 'Tank' ? 'lbs' : 'ft³/hr'}
                      </span>
                    </div>
                  )}
                  {system.type && (
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.type}</span>
                    </div>
                  )}
                  {system.capacity.coverage && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.capacity.coverage} ft³</span>
                    </div>
                  )}
                  {system.power?.watts && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{system.power.watts}W</span>
                    </div>
                  )}
                </div>

                {/* Runtime Analysis for Generators */}
                {system.category === 'Generator' && state.room && roomRequirements && (
                  <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                    {(() => {
                      const runtime = calculateGeneratorRuntime(system, 
                        state.room.width * state.room.length * state.room.height, 
                        targetPPM
                      );
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Charge Time:</span>
                            <span className="text-gray-200">{runtime.chargeTime} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Daily Runtime:</span>
                            <span className="text-gray-200">{runtime.dailyRuntime.toFixed(1)} hrs</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Tank Duration Analysis */}
                {system.category === 'Tank' && state.room && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Tank Duration:</span>
                    <span className="text-green-400">
                      ~{calculateTankDuration(
                        system.capacity.output || 0,
                        state.room.width * state.room.length * state.room.height,
                        targetPPM
                      )} days
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

                    {/* Safety Features */}
                    {system.safety.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Safety Features:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {system.safety.map((safety, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-yellow-900/30 border border-yellow-800 rounded text-yellow-400">
                              {safety}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Operating Cost */}
                    {system.consumables && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Consumable:</span>
                        <span className="text-gray-200">{system.consumables.type}</span>
                      </div>
                    )}

                    {/* Price */}
                    {system.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Est. Price:</span>
                        <span className="text-sm font-medium text-green-400">${system.price}</span>
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

      {/* Safety Warning */}
      <div className="p-3 bg-yellow-900/20 border-t border-yellow-800/50">
        <div className="flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-200">
            <span className="font-medium">Safety Notice:</span> CO₂ levels above 5000 PPM are dangerous. 
            Always install monitors and ensure proper ventilation. Follow local codes.
          </p>
        </div>
      </div>

      {/* Spec Sheet Viewer */}
      <SpecSheetViewer
        isOpen={showSpecSheet}
        onClose={() => {
          setShowSpecSheet(false);
          setSpecSheetProduct(null);
        }}
        product={specSheetProduct}
        type="co2"
      />
    </div>
  );
}