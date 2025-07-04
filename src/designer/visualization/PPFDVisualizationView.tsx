'use client';

import React from 'react';
import { SmoothPPFDGradientMap } from './SmoothPPFDGradientMap';
import { AdvancedVisualizationPanel } from './AdvancedVisualizationPanel';
import { useDesigner } from '../context/DesignerContext';

export function PPFDVisualizationView() {
  const { state } = useDesigner();

  return (
    <div className="flex h-full">
      {/* Main Visualization Area */}
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl max-h-4xl">
          <SmoothPPFDGradientMap 
            width={1200} 
            height={800} 
            showControls={true}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Control Panel */}
      <AdvancedVisualizationPanel />
    </div>
  );
}