'use client';

import React, { useState } from 'react';
import { LEDThermalManagement } from './designer/LEDThermalManagement';
import { EnhancedLEDThermalManagement } from './EnhancedLEDThermalManagement';
import { ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface LEDThermalManagementWrapperProps {
  fixtures?: any[];
  ambientTemp?: number;
  onFixtureUpdate?: (fixtureId: string, updates: any) => void;
}

export function LEDThermalManagementWrapper(props: LEDThermalManagementWrapperProps) {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-800">
        <span className={`text-sm font-medium ${!useEnhanced ? 'text-white' : 'text-gray-400'}`}>
          Basic Version
        </span>
        <button
          onClick={() => setUseEnhanced(!useEnhanced)}
          className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          role="switch"
          aria-checked={useEnhanced}
        >
          <span className="sr-only">Use enhanced version</span>
          <span
            className={`${
              useEnhanced ? 'translate-x-7' : 'translate-x-1'
            } inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center`}
          >
            {useEnhanced ? (
              <ToggleRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-600" />
            )}
          </span>
        </button>
        <span className={`text-sm font-medium flex items-center gap-1 ${useEnhanced ? 'text-white' : 'text-gray-400'}`}>
          <Sparkles className="w-4 h-4 text-blue-600" />
          Enhanced Version
        </span>
      </div>

      {/* Component Display */}
      {useEnhanced ? (
        <EnhancedLEDThermalManagement />
      ) : (
        <LEDThermalManagement {...props} />
      )}
    </div>
  );
}