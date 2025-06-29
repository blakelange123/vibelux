'use client';

import React, { useState, useMemo } from 'react';
import { Zap, Search, X, ChevronRight, Gauge, Shield, DollarSign, Info, Plus, AlertTriangle, Battery, Power } from 'lucide-react';
import { electricalDatabase, electricalCategories, recommendElectricalInfrastructure, calculateElectricalLoad, calculateUPSRequirements, ElectricalEquipment } from '@/lib/electrical-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface ElectricalInfrastructurePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ElectricalInfrastructurePanel({ isOpen = true, onClose }: ElectricalInfrastructurePanelProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<ElectricalEquipment | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [criticalLoadPercent, setCriticalLoadPercent] = useState(30);
  const [redundancy, setRedundancy] = useState(false);
  const [powerFactor, setPowerFactor] = useState(0.9);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<ElectricalEquipment | null>(null);

  // Calculate total electrical load from fixtures and HVAC
  const totalLoad = useMemo(() => {
    const fixtures = state.objects.filter(obj => obj.type === 'fixture' && obj.enabled);
    const fixtureWattage = fixtures.reduce((sum, f) => sum + ((f as any).model?.wattage || 600), 0);
    
    const hvacEquipment = state.objects.filter(obj => 
      obj.type === 'equipment' && (obj as any).equipmentType === 'hvac' && obj.enabled
    );
    const hvacKw = hvacEquipment.reduce((sum, h) => {
      const watts = (h as any).power?.watts || 0;
      const mca = (h as any).power?.mca || 0;
      const voltage = (h as any).power?.voltage || 240;
      return sum + (watts / 1000 || (mca * voltage * 1.732 / 1000)); // 3-phase approximation
    }, 0);
    
    return calculateElectricalLoad(fixtures.length, fixtureWattage / fixtures.length || 600, hvacKw, 10, powerFactor);
  }, [state.objects, powerFactor]);

  // Calculate critical load
  const criticalLoad = useMemo(() => {
    return totalLoad.totalLoad * (criticalLoadPercent / 100);
  }, [totalLoad, criticalLoadPercent]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return null;
    const roomCount = state.objects.filter(obj => obj.type === 'room').length || 1;
    return recommendElectricalInfrastructure(
      totalLoad.totalLoad,
      criticalLoad,
      roomCount,
      redundancy
    );
  }, [state.room, totalLoad, criticalLoad, redundancy]);

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return Object.values(electricalDatabase).filter(equipment => {
      const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        equipment.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddEquipment = (equipment: ElectricalEquipment) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    const newEquipment = {
      type: 'equipment' as const,
      equipmentType: 'electrical',
      name: `${equipment.manufacturer} ${equipment.model}`,
      x: state.room.width / 2,
      y: state.room.length / 2,
      z: equipment.physical.mounting === 'Wall' ? 5 : 0,
      width: equipment.physical.width / 12,
      length: equipment.physical.depth / 12,
      height: equipment.physical.height / 12,
      rotation: 0,
      category: equipment.category,
      capacity: equipment.capacity,
      enabled: true
    };

    addObject(newEquipment);
    showNotification('success', `Added ${equipment.manufacturer} ${equipment.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    Panel: '⚡',
    Transformer: '🔌',
    Generator: '🏭',
    UPS: '🔋',
    PDU: '🔌',
    Switchgear: '🔀',
    Meter: '📊'
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Electrical Infrastructure</h2>
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
            placeholder="Search electrical equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Load Analysis */}
      {state.room && (
        <div className="p-3 bg-yellow-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-yellow-400 font-medium">Electrical Load Analysis</span>
            <ChevronRight className={`w-4 h-4 text-yellow-400 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
          </button>
          
          {showAnalysis && (
            <div className="mt-3 space-y-2 text-xs">
              {/* Load Summary */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lighting Load:</span>
                  <span className="text-white">{totalLoad.lightingLoad.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HVAC Load:</span>
                  <span className="text-white">{(totalLoad.totalLoad - totalLoad.lightingLoad).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-gray-700">
                  <span className="text-gray-300">Total Load:</span>
                  <span className="text-yellow-400">{totalLoad.totalLoad.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total KVA:</span>
                  <span className="text-white">{totalLoad.totalKva.toFixed(1)} kVA</span>
                </div>
              </div>

              {/* Service Requirements */}
              <div className="pt-2 border-t border-gray-700">
                <div className="text-yellow-400 font-medium mb-1">Service Requirements:</div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="font-medium text-white">
                    {totalLoad.recommendedService}A @ {totalLoad.voltage}V
                  </div>
                  <div className="text-gray-400">
                    {totalLoad.voltage === 480 ? '3-Phase Delta' : 
                     totalLoad.voltage === 208 ? '3-Phase Wye' : 'Single Phase'}
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="pt-2 border-t border-gray-700 space-y-2">
                <div>
                  <label className="block text-gray-400 mb-1">Critical Load %:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={criticalLoadPercent}
                    onChange={(e) => setCriticalLoadPercent(Number(e.target.value))}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  />
                  <div className="text-gray-400 mt-0.5">
                    Critical: {criticalLoad.toFixed(1)} kW
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Power Factor:</label>
                  <input
                    type="number"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(Number(e.target.value))}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                  />
                </div>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={redundancy}
                    onChange={(e) => setRedundancy(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-yellow-500"
                  />
                  <span>Redundancy Required</span>
                </label>
              </div>

              {/* Recommendations */}
              {recommendations && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-yellow-400 font-medium mb-1">Recommended Equipment:</div>
                  <div className="space-y-1">
                    {recommendations.mainPanel && (
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-xs font-medium text-white">Main Panel</div>
                        <div className="text-xs text-gray-400">
                          {recommendations.mainPanel.manufacturer} {recommendations.mainPanel.model}
                        </div>
                      </div>
                    )}
                    {recommendations.transformer && (
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-xs font-medium text-white">Transformer</div>
                        <div className="text-xs text-gray-400">
                          {recommendations.transformer.capacity.kva} kVA
                        </div>
                      </div>
                    )}
                    {recommendations.generator && (
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-xs font-medium text-white">Generator</div>
                        <div className="text-xs text-gray-400">
                          {recommendations.generator.capacity.kw} kW
                        </div>
                      </div>
                    )}
                    {recommendations.ups && (
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-xs font-medium text-white">UPS System</div>
                        <div className="text-xs text-gray-400">
                          {recommendations.ups.capacity.kva} kVA
                        </div>
                      </div>
                    )}
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
      <div className="flex gap-1 p-2 bg-gray-800 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Equipment
        </button>
        {Object.entries(electricalCategories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === id
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={category.description}
          >
            <span className="text-base">{categoryIcons[id as keyof typeof categoryIcons]}</span>
            <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredEquipment.map(equipment => {
            const isRecommended = 
              (recommendations?.mainPanel?.id === equipment.id) ||
              (recommendations?.transformer?.id === equipment.id) ||
              (recommendations?.generator?.id === equipment.id) ||
              (recommendations?.ups?.id === equipment.id) ||
              (recommendations?.pdus?.some(p => p.id === equipment.id));
            
            return (
              <div
                key={equipment.id}
                className={`bg-gray-800 rounded-lg p-3 border transition-all cursor-pointer ${
                  isRecommended ? 'border-yellow-500 ring-1 ring-yellow-500/50' : 'border-gray-700 hover:border-yellow-500'
                } ${selectedEquipment?.id === equipment.id ? 'bg-gray-750' : ''}`}
                onClick={() => setSelectedEquipment(equipment)}
              >
                {isRecommended && (
                  <div className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full inline-block mb-2">
                    Recommended
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{equipment.manufacturer}</h3>
                    <p className="text-xs text-gray-400">{equipment.model}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    equipment.category === 'Panel' ? 'bg-blue-900/50 text-blue-400' :
                    equipment.category === 'Generator' ? 'bg-green-900/50 text-green-400' :
                    equipment.category === 'UPS' ? 'bg-purple-900/50 text-purple-400' :
                    equipment.category === 'Transformer' ? 'bg-orange-900/50 text-orange-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {equipment.type || equipment.category}
                  </span>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {equipment.capacity.amperage && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{equipment.capacity.amperage}A</span>
                    </div>
                  )}
                  {equipment.capacity.kva && (
                    <div className="flex items-center gap-1">
                      <Power className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{equipment.capacity.kva} kVA</span>
                    </div>
                  )}
                  {equipment.capacity.kw && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{equipment.capacity.kw} kW</span>
                    </div>
                  )}
                  {equipment.capacity.voltage && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">
                        {Array.isArray(equipment.capacity.voltage) 
                          ? equipment.capacity.voltage.join('/') 
                          : equipment.capacity.voltage}V
                      </span>
                    </div>
                  )}
                  {equipment.specifications.runtime && equipment.category === 'UPS' && (
                    <div className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{equipment.specifications.runtime} min</span>
                    </div>
                  )}
                  {equipment.specifications.efficiency && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{equipment.specifications.efficiency}%</span>
                    </div>
                  )}
                </div>

                {/* Safety Ratings */}
                {(equipment.safety.ul || equipment.safety.nema) && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">
                      {[equipment.safety.ul, equipment.safety.nema].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedEquipment?.id === equipment.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    {/* Features */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {equipment.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Physical Specs */}
                    <div className="bg-gray-700/50 p-2 rounded text-xs">
                      <div className="font-medium text-gray-300 mb-1">Physical:</div>
                      <div className="grid grid-cols-2 gap-1 text-gray-400">
                        <div>Size: {equipment.physical.width}"W × {equipment.physical.height}"H</div>
                        <div>Weight: {equipment.physical.weight} lbs</div>
                        <div>Mount: {equipment.physical.mounting}</div>
                        {equipment.physical.nema && <div>NEMA: {equipment.physical.nema}</div>}
                      </div>
                    </div>

                    {/* Connections */}
                    {equipment.connections && (
                      <div className="text-xs">
                        <span className="text-gray-400">Connections:</span>
                        <span className="text-gray-200 ml-1">
                          {equipment.connections.input} → {equipment.connections.output}
                        </span>
                      </div>
                    )}

                    {/* Lead Time */}
                    {equipment.leadTime && (
                      <div className="bg-yellow-900/20 p-2 rounded text-xs">
                        <AlertTriangle className="w-3 h-3 text-yellow-400 inline mr-1" />
                        <span className="text-yellow-400">Lead Time: {equipment.leadTime}</span>
                      </div>
                    )}

                    {/* Price */}
                    {equipment.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Est. Price:</span>
                        <span className="text-sm font-medium text-green-400">${equipment.price.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddEquipment(equipment);
                        }}
                        className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Design
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpecSheetProduct(equipment);
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

      {/* Electrical Safety Tip */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-yellow-400">Safety First:</span> Always consult with a licensed 
          electrician for installation. Proper grounding and GFCI protection required in grow environments.
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
        type="electrical"
      />
    </div>
  );
}