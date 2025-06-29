'use client';

import React, { useState, useMemo } from 'react';
import { Wind, Search, Filter, X, ChevronRight, Zap, Volume2, Ruler, DollarSign, Info, Plus } from 'lucide-react';
import { fanDatabase, fanCategories, recommendFanConfiguration, FanModel } from '@/lib/fan-database';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { SpecSheetViewer } from './SpecSheetViewer';

interface FanLibraryPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function FanLibraryPanel({ isOpen = true, onClose }: FanLibraryPanelProps) {
  const { state, addObject, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFan, setSelectedFan] = useState<FanModel | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [specSheetProduct, setSpecSheetProduct] = useState<FanModel | null>(null);

  // Calculate room recommendations
  const recommendations = useMemo(() => {
    if (!state.room) return null;
    return recommendFanConfiguration(
      state.room.width,
      state.room.length,
      state.room.height
    );
  }, [state.room]);

  // Filter fans based on search and category
  const filteredFans = useMemo(() => {
    return Object.values(fanDatabase).filter(fan => {
      const matchesCategory = selectedCategory === 'all' || fan.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        fan.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fan.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fan.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddFan = (fan: FanModel) => {
    if (!state.room) {
      showNotification('error', 'Please create a room first');
      return;
    }

    // Set tool to place mode
    dispatch({ type: 'SET_TOOL', payload: 'place' });
    
    // Store selected fan for placement
    dispatch({ 
      type: 'SET_SELECTED_FIXTURE', 
      payload: {
        ...fan,
        type: 'hvacFan',
        fanType: fan.category,
        airflow: fan.airflow.cfm,
        power: fan.power.watts,
        diameter: fan.physical.diameter,
        mountType: fan.physical.mountType
      }
    });

    showNotification('info', `Selected ${fan.manufacturer} ${fan.model}. Click on the canvas to place the fan.`);
    onClose?.();
  };

  const categoryIcons = {
    VAF: '↓',
    HAF: '→',
    Exhaust: '↗',
    Intake: '↙',
    Inline: '⟷',
    Jet: '⚡'
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Fan Library</h2>
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
            placeholder="Search fans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Room Recommendations */}
      {state.room && (
        <div className="p-3 bg-blue-900/20 border-b border-gray-700">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span className="text-blue-400 font-medium">Room Recommendations</span>
            <ChevronRight className={`w-4 h-4 text-blue-400 transition-transform ${showRecommendations ? 'rotate-90' : ''}`} />
          </button>
          
          {showRecommendations && recommendations && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Room Volume:</span>
                <span className="text-white">{(state.room.width * state.room.length * state.room.height).toFixed(0)} ft³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VAF Fans Needed:</span>
                <span className="text-green-400">{recommendations.vafFans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">HAF Fans Needed:</span>
                <span className="text-green-400">{recommendations.hafFans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Exhaust CFM Required:</span>
                <span className="text-yellow-400">{recommendations.exhaustCFM.toFixed(0)} CFM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Intake CFM Required:</span>
                <span className="text-blue-400">{recommendations.intakeCFM.toFixed(0)} CFM</span>
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
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Fans
        </button>
        {Object.entries(fanCategories).map(([id, category]) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="text-base">{categoryIcons[id as keyof typeof categoryIcons]}</span>
            {category.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Fan List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredFans.map(fan => (
            <div
              key={fan.id}
              className={`bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer ${
                selectedFan?.id === fan.id ? 'border-blue-500 bg-gray-750' : ''
              }`}
              onClick={() => setSelectedFan(fan)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{fan.manufacturer}</h3>
                  <p className="text-xs text-gray-400">{fan.model}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  fan.category === 'VAF' ? 'bg-green-900/50 text-green-400' :
                  fan.category === 'HAF' ? 'bg-blue-900/50 text-blue-400' :
                  fan.category === 'Exhaust' ? 'bg-red-900/50 text-red-400' :
                  fan.category === 'Intake' ? 'bg-cyan-900/50 text-cyan-400' :
                  fan.category === 'Inline' ? 'bg-purple-900/50 text-purple-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {fan.category}
                </span>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300">{fan.airflow.cfm} CFM</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300">{fan.power.watts}W</span>
                </div>
                <div className="flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300">{fan.physical.diameter}"</span>
                </div>
                {fan.performance?.noiseLevel && (
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{fan.performance.noiseLevel} dB</span>
                  </div>
                )}
              </div>

              {/* Efficiency Badge */}
              {fan.performance?.efficiency && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Efficiency</span>
                  <span className={`text-xs font-medium ${
                    fan.performance.efficiency > 30 ? 'text-green-400' :
                    fan.performance.efficiency > 20 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {fan.performance.efficiency.toFixed(1)} CFM/W
                  </span>
                </div>
              )}

              {/* Expanded Details */}
              {selectedFan?.id === fan.id && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  {/* Features */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {fan.features.map((feature, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Performance Details */}
                  {fan.performance && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {fan.performance.staticPressure && (
                        <div>
                          <span className="text-gray-400">Static Pressure:</span>
                          <span className="text-gray-200 ml-1">{fan.performance.staticPressure}" WC</span>
                        </div>
                      )}
                      {fan.performance.throwDistance && (
                        <div>
                          <span className="text-gray-400">Throw:</span>
                          <span className="text-gray-200 ml-1">{fan.performance.throwDistance} ft</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {fan.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Est. Price:</span>
                      <span className="text-sm font-medium text-green-400">${fan.price}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddFan(fan);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Design
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpecSheetProduct(fan);
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
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-medium text-blue-400">Pro Tip:</span> Use VAF fans above canopy for direct airflow, 
          HAF fans for horizontal circulation, and maintain 20-30 air changes per hour for optimal growing conditions.
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
        type="fan"
      />
    </div>
  );
}