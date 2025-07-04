import React from 'react';

interface MultiLayerCanopyPanelProps {
  layers: any[];
  onLayersChange: (layers: any[]) => void;
  maxHeight: number;
}

export function MultiLayerCanopyPanel({ layers, onLayersChange, maxHeight }: MultiLayerCanopyPanelProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-3">Multi-Layer Canopy</h3>
      <p className="text-gray-400 text-sm">Feature coming soon...</p>
    </div>
  );
}