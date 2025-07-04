'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Sun, 
  Droplets, 
  Wind, 
  Thermometer,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ControlStatus {
  lighting: {
    intensity: number;
    photoperiod: number;
    spectrum: string;
    status: 'idle' | 'updating' | 'updated';
  };
  environment: {
    temperature: number;
    humidity: number;
    co2: number;
    status: 'idle' | 'updating' | 'updated';
  };
  irrigation: {
    ec: number;
    ph: number;
    frequency: number;
    status: 'idle' | 'updating' | 'updated';
  };
}

export function VerticalFarmingControlPanel() {
  const [controlStatus, setControlStatus] = useState<ControlStatus>({
    lighting: {
      intensity: 180,
      photoperiod: 16,
      spectrum: 'Balanced',
      status: 'idle'
    },
    environment: {
      temperature: 22,
      humidity: 65,
      co2: 800,
      status: 'idle'
    },
    irrigation: {
      ec: 1.8,
      ph: 6.0,
      frequency: 6,
      status: 'idle'
    }
  });

  // Listen for optimization events
  useEffect(() => {
    const handleOptimizationApplied = (event: CustomEvent) => {
      const { changes } = event.detail;
      
      // Simulate real-time updates
      changes.forEach((change: any, index: number) => {
        setTimeout(() => {
          setControlStatus(prev => {
            const newStatus = { ...prev };
            
            switch (change.system) {
              case 'lighting':
                newStatus.lighting.status = 'updating';
                if (change.parameter === 'intensity') {
                  newStatus.lighting.intensity = change.newValue;
                }
                break;
              case 'environment':
                newStatus.environment.status = 'updating';
                if (change.parameter === 'co2') {
                  newStatus.environment.co2 = change.newValue;
                }
                break;
              case 'irrigation':
                newStatus.irrigation.status = 'updating';
                break;
            }
            
            return newStatus;
          });
          
          // Mark as updated after delay
          setTimeout(() => {
            setControlStatus(prev => {
              const newStatus = { ...prev };
              newStatus.lighting.status = 'updated';
              newStatus.environment.status = 'updated';
              newStatus.irrigation.status = 'updated';
              return newStatus;
            });
          }, 1000);
        }, index * 500);
      });
    };

    window.addEventListener('optimizationApplied', handleOptimizationApplied as any);
    return () => window.removeEventListener('optimizationApplied', handleOptimizationApplied as any);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'updating':
        return <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'updated':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Monitor className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'updating':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'updated':
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-gray-700';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Live Control System Status</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          Real-time monitoring
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lighting Control */}
        <div className={`bg-gray-800 rounded-lg p-4 border transition-all ${getStatusColor(controlStatus.lighting.status)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Lighting</h4>
            </div>
            {getStatusIcon(controlStatus.lighting.status)}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Intensity</span>
              <span className="text-white font-medium">{controlStatus.lighting.intensity} PPFD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Photoperiod</span>
              <span className="text-white font-medium">{controlStatus.lighting.photoperiod}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Spectrum</span>
              <span className="text-white font-medium">{controlStatus.lighting.spectrum}</span>
            </div>
          </div>
        </div>

        {/* Environment Control */}
        <div className={`bg-gray-800 rounded-lg p-4 border transition-all ${getStatusColor(controlStatus.environment.status)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-white">Environment</h4>
            </div>
            {getStatusIcon(controlStatus.environment.status)}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Temperature</span>
              <span className="text-white font-medium">{controlStatus.environment.temperature}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Humidity</span>
              <span className="text-white font-medium">{controlStatus.environment.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CO₂</span>
              <span className="text-white font-medium">{controlStatus.environment.co2} ppm</span>
            </div>
          </div>
        </div>

        {/* Irrigation Control */}
        <div className={`bg-gray-800 rounded-lg p-4 border transition-all ${getStatusColor(controlStatus.irrigation.status)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <h4 className="font-medium text-white">Irrigation</h4>
            </div>
            {getStatusIcon(controlStatus.irrigation.status)}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">EC</span>
              <span className="text-white font-medium">{controlStatus.irrigation.ec} mS/cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">pH</span>
              <span className="text-white font-medium">{controlStatus.irrigation.ph}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Frequency</span>
              <span className="text-white font-medium">{controlStatus.irrigation.frequency}x/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Messages */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            Control system connected. All parameters within optimal range.
          </span>
        </div>
      </div>
    </div>
  );
}