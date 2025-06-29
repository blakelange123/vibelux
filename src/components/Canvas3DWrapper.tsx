'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Temporary stub component
const Canvas3D = ({ showPPFD, showGrid, showFalseColorMap }: any) => (
  <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg border border-gray-800">
    <div className="text-center">
      <div className="text-white mb-2">3D View Temporarily Disabled</div>
      <div className="text-gray-400 text-sm">
        {showPPFD && <div>PPFD Display: ON</div>}
        {showGrid && <div>Grid: ON</div>}
        {showFalseColorMap && <div>False Color Map: ON</div>}
      </div>
    </div>
  </div>
);

interface Canvas3DWrapperProps {
  objects: any[];
  roomDimensions: { width: number; length: number; height: number };
  onObjectSelect: (id: string | null) => void;
  selectedObject: string | null;
  showPPFD: boolean;
  showGrid: boolean;
  showFalseColorMap: boolean;
}

export function Canvas3DWrapper(props: Canvas3DWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white">Initializing 3D...</div>
      </div>
    );
  }

  return <Canvas3D {...props} />;
}