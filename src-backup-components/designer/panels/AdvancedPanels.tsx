'use client';

import React from 'react';
import { X, Box, BarChart3, Thermometer, Leaf, Grid3x3, Globe, FlaskConical, Zap } from 'lucide-react';

interface PanelProps {
  onClose: () => void;
}

// Import the actual 3D Visualization components
import { ThreeJS3DVisualization } from '../visualization/ThreeJS3DVisualization';
import { useDesigner } from '../context/DesignerContext';

export function Advanced3DVisualizationPanel({ onClose }: PanelProps) {
  const { state } = useDesigner();
  const [viewMode, setViewMode] = React.useState<'3d' | 'ppfd' | 'thermal' | 'layers'>('3d');
  
  // Filter fixtures from objects
  const fixtures = state.objects
    .filter(obj => obj.type === 'fixture')
    .map(obj => ({
      id: obj.id,
      x: obj.x,
      y: obj.y,
      z: obj.z,
      width: obj.width,
      height: obj.length,
      power: (obj as any).model?.wattage || 600,
      ppfd: (obj as any).model?.ppfd || 1000,
      spectrum: (obj as any).model?.spectrum || {},
      beamAngle: (obj as any).model?.beamAngle || 120,
      mountingHeight: obj.z
    }));
  
  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Box className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">Advanced 3D Visualization</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ThreeJS3DVisualization 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          quality="high"
        />
      </div>
    </div>
  );
}

// Re-export the actual Advanced PPFD Mapping component
export { AdvancedPPFDMappingPanel } from './AdvancedPPFDMapping';

import { ThermalManagementSystem } from '../thermal/ThermalManagementSystem';

export function LEDThermalManagementPanel({ onClose }: PanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-[900px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <ThermalManagementSystem onClose={onClose} />
      </div>
    </div>
  );
}

export function PlantBiologyIntegrationPanel({ onClose }: PanelProps) {
  // Dynamically import the actual plant biology component
  const PlantBiologyWrapper = React.lazy(() => import('../PlantBiologyWrapper'));
  
  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold text-white">Plant Biology Integration</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading plant biology data...</div>
          </div>
        }>
          <PlantBiologyWrapper />
        </React.Suspense>
      </div>
    </div>
  );
}

import { MultiZoneControlSystem } from '../zones/MultiZoneControlSystem';

export function MultiZoneControlSystemPanel({ onClose }: PanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-[1000px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <MultiZoneControlSystem onClose={onClose} />
      </div>
    </div>
  );
}

import { ResearchPropagationTools } from '../research/ResearchPropagationTools';

export function ResearchPropagationToolsPanel({ onClose }: PanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-[1100px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <ResearchPropagationTools onClose={onClose} />
      </div>
    </div>
  );
}

import { GPUAcceleratedRenderer } from '../../GPUAcceleratedRenderer';

export function GPURayTracingPanel({ onClose }: PanelProps) {
  const { state } = useDesigner();
  
  // Convert fixtures for GPU renderer
  const fixtures = state.objects
    .filter(obj => obj.type === 'fixture' && obj.enabled)
    .map(obj => ({
      id: obj.id,
      x: obj.x,
      y: obj.y,
      z: obj.z || state.room.height - 2,
      model: (obj as any).model || {},
      dimmingLevel: (obj as any).dimmingLevel || 100
    }));
  
  return (
    <div className="fixed inset-y-0 right-0 w-[1200px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">GPU-Accelerated Ray Tracing</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <GPUAcceleratedRenderer 
          fixtures={fixtures}
          room={{
            width: state.room.width,
            length: state.room.length,
            height: state.room.height
          }}
          workingHeight={state.room.workingHeight}
          onCalculationComplete={(results) => {
          }}
        />
      </div>
    </div>
  );
}