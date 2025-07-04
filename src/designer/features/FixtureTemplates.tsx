'use client';

import React, { useState } from 'react';
import { Grid3x3, Save, Trash2, Copy, Eye } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { autoArrangeFixtures } from '../utils/collisionDetection';
import type { Position, Fixture } from '../context/types';

interface FixtureTemplate {
  id: string;
  name: string;
  description: string;
  fixturePositions: Position[];
  fixtureModel: Fixture['model'];
  roomDimensions: { width: number; length: number };
}

const defaultTemplates: FixtureTemplate[] = [
  {
    id: 'grid-4x4',
    name: '4x4 Grid',
    description: 'Standard 4x4 grid layout for uniform coverage',
    fixturePositions: [],
    fixtureModel: {
      name: 'LED Panel',
      wattage: 600,
      ppf: 1620,
      beamAngle: 120,
      manufacturer: 'Generic',
      efficacy: 2.7,
      spectrum: 'Full Spectrum'
    },
    roomDimensions: { width: 40, length: 40 }
  },
  {
    id: 'staggered',
    name: 'Staggered Layout',
    description: 'Staggered pattern for better uniformity',
    fixturePositions: [],
    fixtureModel: {
      name: 'LED Panel',
      wattage: 600,
      ppf: 1620,
      beamAngle: 120,
      manufacturer: 'Generic',
      efficacy: 2.7,
      spectrum: 'Full Spectrum'
    },
    roomDimensions: { width: 40, length: 40 }
  }
];

export function FixtureTemplates() {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const { room, objects } = state;
  
  const [templates, setTemplates] = useState<FixtureTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const saveCurrentAsTemplate = () => {
    const fixtures = objects.filter(obj => obj.type === 'fixture') as Fixture[];
    
    if (fixtures.length === 0) {
      showNotification('warning', 'No fixtures to save as template');
      return;
    }
    
    const templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    const newTemplate: FixtureTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: `${fixtures.length} fixtures`,
      fixturePositions: fixtures.map(f => ({ x: f.x, y: f.y, z: f.z })),
      fixtureModel: fixtures[0].model || {
        name: 'LED Panel',
        wattage: 600,
        ppf: 1620,
        beamAngle: 120,
        manufacturer: 'Generic',
        efficacy: 2.7,
        spectrum: 'Full Spectrum'
      },
      roomDimensions: { width: room.width, length: room.length }
    };
    
    setTemplates([...templates, newTemplate]);
    showNotification('success', 'Template saved successfully');
  };
  
  const applyTemplate = (template: FixtureTemplate) => {
    // Clear existing fixtures
    dispatch({ type: 'RESET' });
    
    // Scale positions to current room dimensions
    const scaleX = room.width / template.roomDimensions.width;
    const scaleY = room.length / template.roomDimensions.length;
    
    // Add fixtures from template
    template.fixturePositions.forEach(pos => {
      dispatch({
        type: 'ADD_OBJECT',
        payload: {
          type: 'fixture',
          x: pos.x * scaleX,
          y: pos.y * scaleY,
          z: pos.z,
          rotation: 0,
          width: 2,
          length: 4,
          height: 0.5,
          enabled: true,
          model: template.fixtureModel
        }
      });
    });
    
    showNotification('success', `Applied template: ${template.name}`);
  };
  
  const generateGrid = (rows: number, cols: number) => {
    const positions = autoArrangeFixtures(rows * cols, room);
    
    // Clear and add new fixtures
    dispatch({ type: 'RESET' });
    
    positions.forEach(pos => {
      dispatch({
        type: 'ADD_OBJECT',
        payload: {
          type: 'fixture',
          x: pos.x,
          y: pos.y,
          z: pos.z,
          rotation: 0,
          width: 2,
          length: 4,
          height: 0.5,
          enabled: true,
          model: {
            name: 'LED Panel',
            wattage: 600,
            ppf: 1620,
            beamAngle: 120,
            manufacturer: 'Generic',
            efficacy: 2.7,
            spectrum: 'Full Spectrum'
          }
        }
      });
    });
    
    showNotification('success', `Generated ${rows}x${cols} grid layout`);
  };
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Fixture Templates</h3>
      
      {/* Quick Grid Generators */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Quick Layouts</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => generateGrid(3, 3)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-all"
          >
            3×3 Grid
          </button>
          <button
            onClick={() => generateGrid(4, 4)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-all"
          >
            4×4 Grid
          </button>
          <button
            onClick={() => generateGrid(5, 5)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-all"
          >
            5×5 Grid
          </button>
        </div>
      </div>
      
      {/* Save Current Layout */}
      <button
        onClick={saveCurrentAsTemplate}
        className="w-full mb-4 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save Current as Template
      </button>
      
      {/* Template List */}
      <div className="space-y-2">
        {templates.map(template => (
          <div
            key={template.id}
            className={`p-3 bg-gray-800/50 rounded-lg border transition-all cursor-pointer ${
              selectedTemplate === template.id
                ? 'border-purple-600'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">{template.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{template.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    applyTemplate(template);
                  }}
                  className="p-1 hover:bg-gray-700 rounded transition-all"
                  title="Apply Template"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                {template.id.startsWith('custom-') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplates(templates.filter(t => t.id !== template.id));
                      showNotification('info', 'Template deleted');
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-all"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}