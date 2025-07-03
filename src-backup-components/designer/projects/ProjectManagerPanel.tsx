import React from 'react';
import { X } from 'lucide-react';

interface ProjectManagerPanelProps {
  onClose: () => void;
}

export function ProjectManagerPanel({ onClose }: ProjectManagerPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Project Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-gray-400">Project Manager Panel - Coming Soon</p>
        </div>
      </div>
    </div>
  );
}