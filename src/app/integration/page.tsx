'use client';
import { useState } from 'react';
import { DeviceIntegrationCenter } from '@/components/integration/DeviceIntegrationCenter';
import { EnhancedProtocolSupport } from '@/components/integration/EnhancedProtocolSupport';
import { Network, Cable, Settings } from 'lucide-react';

export default function IntegrationPage() {
  const [activeView, setActiveView] = useState<'standard' | 'enhanced'>('standard');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* View Selector */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setActiveView('standard')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeView === 'standard'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Network className="w-4 h-4" />
            Standard Protocols
          </button>
          <button
            onClick={() => setActiveView('enhanced')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeView === 'enhanced'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Cable className="w-4 h-4" />
            Enhanced Protocols
          </button>
        </div>

        {/* Content */}
        {activeView === 'standard' ? (
          <DeviceIntegrationCenter />
        ) : (
          <EnhancedProtocolSupport />
        )}
      </div>
    </div>
  );
}