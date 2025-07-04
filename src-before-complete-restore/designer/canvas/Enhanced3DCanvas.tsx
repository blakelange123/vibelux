'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useDesigner } from '../context/DesignerContext';

// Dynamically import Three.js visualization to avoid SSR issues
const ThreeJS3DVisualization = dynamic(
  () => import('../visualization/ThreeJS3DVisualization').then(mod => ({ default: mod.ThreeJS3DVisualization })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white font-medium">Loading 3D View...</div>
        </div>
      </div>
    )
  }
);


interface Enhanced3DCanvasProps {
  viewType?: 'perspective' | 'top' | 'front' | 'side';
  syncWith2D?: boolean;
  quality?: 'low' | 'medium' | 'high';
  showControls?: boolean;
}

export function Enhanced3DCanvas({
  viewType = 'perspective',
  syncWith2D = true,
  quality = 'medium',
  showControls = true
}: Enhanced3DCanvasProps) {
  const { state, dispatch } = useDesigner();
  const { room } = state;
  const [viewMode, setViewMode] = React.useState<'3d' | 'ppfd' | 'thermal' | 'layers'>('3d');

  // Determine if this should show a greenhouse based on room size
  const isGreenhouse = room && (room.height > 8 || room.width > 20 || room.length > 30);

  // Set greenhouse structure type if detected
  React.useEffect(() => {
    if (isGreenhouse && room && !room.structureType) {
      // Update room to have greenhouse structure type
      dispatch({ 
        type: 'UPDATE_ROOM', 
        payload: { 
          ...room, 
          structureType: room.length > 100 ? 'gutter-connect' : 'single-span' 
        } 
      });
    }
  }, [isGreenhouse, room, dispatch]);

  // Use original Three.js version which has greenhouse support
  return (
    <ThreeJS3DVisualization
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      quality={quality}
    />
  );
}