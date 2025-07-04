'use client';

import React, { useState } from 'react';
import { X, Building, CheckCircle, Download } from 'lucide-react';
import { ROOM_TEMPLATES, RoomTemplateManager, type RoomTemplate } from '@/lib/room-templates';
import { useDesigner } from '../context/DesignerContext';

interface RoomTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoomTemplateDialog({ isOpen, onClose }: RoomTemplateDialogProps) {
  const { dispatch } = useDesigner();
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'greenhouse', name: 'Greenhouse' },
    { id: 'indoor_grow', name: 'Indoor Grow' },
    { id: 'vertical_farm', name: 'Vertical Farm' },
    { id: 'warehouse', name: 'Warehouse' },
    { id: 'office', name: 'Office' },
    { id: 'retail', name: 'Retail' }
  ];

  const filteredTemplates = ROOM_TEMPLATES.filter(template => 
    filterCategory === 'all' || template.category === filterCategory
  );

  const handleApplyTemplate = (template: RoomTemplate) => {
    try {
      const templateData = RoomTemplateManager.applyTemplate(template);
      
      // Update room dimensions
      dispatch({
        type: 'UPDATE_ROOM',
        payload: {
          width: template.dimensions.width,
          length: template.dimensions.length,
          height: template.dimensions.height,
          workingHeight: template.layout.fixtureHeight - 1
        }
      });

      // Clear existing objects
      dispatch({ type: 'CLEAR_OBJECTS' });

      // Add template objects
      templateData.objects.forEach((obj: any) => {
        setTimeout(() => {
          dispatch({ type: 'ADD_OBJECT', payload: obj });
        }, 100);
      });

      onClose();
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. Please try again.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'greenhouse': return '🌿';
      case 'indoor_grow': return '🏠';
      case 'vertical_farm': return '🏗️';
      case 'warehouse': return '🏭';
      case 'office': return '🏢';
      case 'retail': return '🛍️';
      default: return '📐';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'greenhouse': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'indoor_grow': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'vertical_farm': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'warehouse': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'office': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'retail': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-white">Room Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setFilterCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filterCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Templates Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`bg-gray-800 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-500 ring-2 ring-purple-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {template.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(template.category)}`}>
                          {getCategoryIcon(template.category)} {template.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Dimensions</div>
                          <div className="text-sm text-white">
                            {template.dimensions.width} × {template.dimensions.length} × {template.dimensions.height} ft
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Target PPFD</div>
                          <div className="text-sm text-white">
                            {template.lighting.targetPPFD} μmol/m²/s
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Fixture Type</div>
                          <div className="text-sm text-white">
                            {template.fixtures.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Photoperiod</div>
                          <div className="text-sm text-white">
                            {template.lighting.photoperiod}h
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          DLI: {template.lighting.targetDLI} mol/m²/d • 
                          Power: {template.fixtures.wattage}W per fixture
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Details */}
            {selectedTemplate && (
              <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Template Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Room Layout</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Aisle Width:</span>
                        <span className="text-white">{selectedTemplate.layout.aisleWidth} ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bench Height:</span>
                        <span className="text-white">{selectedTemplate.layout.benchHeight} ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fixture Height:</span>
                        <span className="text-white">{selectedTemplate.layout.fixtureHeight} ft</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Lighting Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target PPFD:</span>
                        <span className="text-white">{selectedTemplate.lighting.targetPPFD} μmol/m²/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target DLI:</span>
                        <span className="text-white">{selectedTemplate.lighting.targetDLI} mol/m²/d</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uniformity:</span>
                        <span className="text-white">{(selectedTemplate.lighting.uniformityTarget * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Fixture Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{selectedTemplate.fixtures.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Power:</span>
                        <span className="text-white">{selectedTemplate.fixtures.wattage}W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">PPF:</span>
                        <span className="text-white">{selectedTemplate.fixtures.ppf} μmol/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Spacing:</span>
                        <span className="text-white">
                          {selectedTemplate.fixtures.spacing.x} × {selectedTemplate.fixtures.spacing.y} ft
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedTemplate.benches && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Bench Layout</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rows:</span>
                          <span className="text-white">{selectedTemplate.benches.rows}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Columns:</span>
                          <span className="text-white">{selectedTemplate.benches.columns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bench Size:</span>
                          <span className="text-white">
                            {selectedTemplate.benches.width} × {selectedTemplate.benches.length} ft
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Apply Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}