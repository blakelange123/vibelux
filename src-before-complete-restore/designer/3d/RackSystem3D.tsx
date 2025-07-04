import React from 'react';
import { X } from 'lucide-react';

interface RackSystem3DProps {
  onClose?: () => void;
}

export function RackSystem3D({ onClose }: RackSystem3DProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-4">
      {onClose && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">3D Rack System</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">3D Rack System Visualization - Coming Soon</p>
      </div>
    </div>
  );
}