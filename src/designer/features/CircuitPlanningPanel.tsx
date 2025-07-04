'use client';

import React from 'react';
import { X, Zap } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

export default function CircuitPlanningPanel() {
  const { dispatch } = useDesigner();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Circuit Planning
          </h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'circuitPlanning' })}
            className="p-1 hover:bg-gray-800 rounded transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-gray-400">Circuit planning panel content...</p>
        </div>
      </div>
    </div>
  );
}