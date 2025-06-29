'use client';

import React, { useState, useMemo } from 'react';
import { Cpu, Search, X, ChevronRight, Gauge, Wifi, DollarSign, Info, Plus, AlertTriangle, Cloud, Activity, Thermometer, Droplets, Sun } from 'lucide-react';
import { environmentalControllerDatabase, controllerCategories, recommendController, calculateControlPoints, EnvironmentalController } from '@/lib/environmental-controller-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface EnvironmentalControllerPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function EnvironmentalControllerPanel({ isOpen = true, onClose }: EnvironmentalControllerPanelProps) {
  const { state, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedController, setSelectedController] = useState<EnvironmentalController | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [roomCount, setRoomCount] = useState(1);
  const [requiredFeatures, setRequiredFeatures] = useState({
    temperature: true,
    humidity: true,
    co2: false,
    lighting: false,
    irrigation: false,
    vpd: true
  });
  const [preferredType, setPreferredType] = useState<'Standalone' | 'Cloud' | 'Any'>('Any');
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<EnvironmentalController | null>(null);

  // Calculate control requirements
  const controlRequirements = useMemo(() => {
    return calculateControlPoints(roomCount);
  }, [roomCount]);

  // Get recommendations
  const recommendations = useMemo(() => {
    return recommendController(roomCount, requiredFeatures, undefined, preferredType);
  }, [roomCount, requiredFeatures, preferredType]);

  // Filter controllers
  const filteredControllers = useMemo(() => {
    return Object.values(environmentalControllerDatabase).filter(controller => {
      const matchesCategory = selectedCategory === 'all' || controller.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        controller.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        controller.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        controller.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddController = (controller: EnvironmentalController) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    const newEquipment = {
      type: 'equipment' as const,
      equipmentType: 'controller',
      name: `${controller.manufacturer} ${controller.model}`,
      x: state.room.width / 2,
      y: state.room.length / 2,
      z: controller.physical.mounting === 'Wall' ? 5 : 0,
      width: controller.physical.width / 12,
      length: controller.physical.depth / 12,
      height: controller.physical.height / 12,
      rotation: 0,
      category: controller.category,
      capabilities: controller.capabilities,
      enabled: true
    };

    addObject(newEquipment);
    showNotification('success', `Added ${controller.manufacturer} ${controller.model} to design`);
    onClose?.();
  };

  const categoryIcons = {
    Climate: '🌡️',
    Fertigation: '💧',
    Lighting: '💡',
    Integrated: '🎛️',
    Sensor: '📊',
    Software: '☁️'
  };

  const controlIcons = {
    temperature: <Thermometer className="w-3 h-3" />,
    humidity: <Droplets className="w-3 h-3" />,
    co2: <Cloud className="w-3 h-3" />,
    lighting: <Sun className="w-3 h-3" />,
    irrigation: <Droplets className="w-3 h-3" />,
    vpd: <Activity className="w-3 h-3" />
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Environmental Controllers</h2>
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
            placeholder="Search controllers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Requirements Analysis */}
      {state.room && (
        <div className="p-3 bg-purple-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-purple-400 font-medium">Control Requirements</span>
            <ChevronRight className={`w-4 h-4 text-purple-400 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} />
          </button>
          
          {showAnalysis && (
            <div className="mt-3 space-y-2 text-xs">
              {/* Configuration */}
              <div>
                <label className="block text-gray-400 mb-1">Number of Rooms/Zones:</label>
                <input
                  type="number"
                  min="1"
                  value={roomCount}
                  onChange={(e) => setRoomCount(Number(e.target.value))}
                  className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">System Type:</label>
                <select
                  value={preferredType}
                  onChange={(e) => setPreferredType(e.target.value as any)}
                  className="w-full bg-gray-800 text-white px-2 py-1 rounded"
                >
                  <option value="Any">Any Type</option>
                  <option value="Standalone">Standalone</option>
                  <option value="Cloud">Cloud-Based</option>
                </select>
              </div>

              {/* Required Features */}
              <div className="pt-2 border-t border-gray-700">
                <div className="text-gray-400 mb-1">Required Control Features:</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(requiredFeatures).map(([feature, enabled]) => (
                    <label key={feature} className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setRequiredFeatures({
                          ...requiredFeatures,
                          [feature]: e.target.checked
                        })}
                        className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="flex items-center gap-1 text-xs capitalize">
                        {controlIcons[feature as keyof typeof controlIcons]}
                        {feature === 'vpd' ? 'VPD' : feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Requirements Summary */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Required Sensors:</span>
                  <span className="text-white">{controlRequirements.totalSensors}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Required Outputs:</span>
                  <span className="text-white">{controlRequirements.totalOutputs}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Control Zones:</span>
                  <span className="text-white">{controlRequirements.zones}</span>
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.primary.length > 0 && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-purple-400 font-medium mb-1">Recommended Systems:</div>
                  {recommendations.primary.slice(0, 2).map((controller, i) => (
                    <div key={controller.id} className="bg-gray-800 p-2 rounded mb-1">
                      <div className="font-medium text-white text-xs">
                        {controller.manufacturer} {controller.model}
                      </div>
                      <div className="text-xs text-gray-400">
                        {controller.category} • {controller.type}
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
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Systems
        </button>
        {Object.entries(controllerCategories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={category.description}
          >
            <span className="text-base">{categoryIcons[id as keyof typeof categoryIcons]}</span>
            <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Controller List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredControllers.map(controller => {
            const isRecommended = recommendations.primary.some(r => r.id === controller.id);
            
            return (
              <div
                key={controller.id}
                className={`bg-gray-800 rounded-lg p-3 border transition-all cursor-pointer ${
                  isRecommended ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-gray-700 hover:border-purple-500'
                } ${selectedController?.id === controller.id ? 'bg-gray-750' : ''}`}
                onClick={() => setSelectedController(controller)}
              >
                {isRecommended && (
                  <div className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full inline-block mb-2">
                    Recommended
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{controller.manufacturer}</h3>
                    <p className="text-xs text-gray-400">{controller.model}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    controller.type === 'Cloud' ? 'bg-blue-900/50 text-blue-400' :
                    controller.type === 'Standalone' ? 'bg-green-900/50 text-green-400' :
                    controller.type === 'Networked' ? 'bg-purple-900/50 text-purple-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {controller.type}
                  </span>
                </div>

                {/* Key Capabilities */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  {controller.capabilities.zones && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{controller.capabilities.zones} zones</span>
                    </div>
                  )}
                  {controller.capabilities.sensors && (
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{controller.capabilities.sensors} sensors</span>
                    </div>
                  )}
                  {controller.connectivity.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{controller.connectivity[0]}</span>
                    </div>
                  )}
                  {controller.capabilities.remoteAccess && (
                    <div className="flex items-center gap-1">
                      <Cloud className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">Remote</span>
                    </div>
                  )}
                </div>

                {/* Control Features */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(controller.control).filter(([_, enabled]) => enabled).map(([feature]) => (
                    <span key={feature} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300 flex items-center gap-1">
                      {controlIcons[feature as keyof typeof controlIcons]}
                      {feature === 'vpd' ? 'VPD' : feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </span>
                  ))}
                </div>

                {/* Expanded Details */}
                {selectedController?.id === controller.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    {/* Features */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {controller.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Connectivity */}
                    {controller.connectivity.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-400">Connectivity:</span>
                        <span className="text-xs text-gray-200 ml-1">{controller.connectivity.join(', ')}</span>
                      </div>
                    )}

                    {/* Subscription Info */}
                    {controller.subscription && (
                      <div className="bg-yellow-900/20 p-2 rounded text-xs">
                        <div className="font-medium text-yellow-400 mb-1">
                          {controller.subscription.required ? 'Subscription Required' : 'Optional Subscription'}
                        </div>
                        {controller.subscription.monthly && (
                          <div>Monthly: ${controller.subscription.monthly}</div>
                        )}
                        <div className="text-gray-400">
                          {controller.subscription.features.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {controller.price !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {controller.price === 0 ? 'Base Price:' : 'Est. Price:'}
                        </span>
                        <span className="text-sm font-medium text-green-400">
                          {controller.price === 0 ? 'Contact Sales' : `$${controller.price.toLocaleString()}`}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddController(controller);
                        }}
                        className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Design
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpecSheetProduct(controller);
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

      {/* Automation Tip */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-purple-400">Pro Tip:</span> Start with climate control, 
          then add fertigation and lighting automation as you scale. Cloud systems offer better analytics.
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
        type="controller"
      />
    </div>
  );
}