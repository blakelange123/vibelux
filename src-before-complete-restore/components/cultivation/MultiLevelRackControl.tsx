'use client';

import React, { useState } from 'react';
import {
  Layers,
  Power,
  Droplets,
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Zap,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Thermometer
} from 'lucide-react';

interface ValveMode {
  mode: 'OFF' | 'AUTO' | 'HAND';
  enabled: boolean;
}

interface RackLevel {
  id: string;
  name: string;
  valve: ValveMode;
  shortCycle: {
    day: number;
    hour: number;
    min: number;
  };
  cycleEndTime: {
    day: number;
    hour: number;
    min: number;
  };
  dryStartTime: {
    day: number;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  temperature: number;
  humidity: number;
  lightIntensity: number;
  waterUsage: number;
  lastIrrigation: string;
}

export function MultiLevelRackControl() {
  const [rackLevels, setRackLevels] = useState<RackLevel[]>([
    {
      id: 'L05A',
      name: 'Level 5A - Top',
      valve: { mode: 'AUTO', enabled: true },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'active',
      temperature: 72.4,
      humidity: 64.7,
      lightIntensity: 850,
      waterUsage: 12.5,
      lastIrrigation: '2 hours ago'
    },
    {
      id: 'L04A',
      name: 'Level 4A',
      valve: { mode: 'AUTO', enabled: true },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'active',
      temperature: 72.8,
      humidity: 63.2,
      lightIntensity: 840,
      waterUsage: 11.8,
      lastIrrigation: '2 hours ago'
    },
    {
      id: 'L03A',
      name: 'Level 3A',
      valve: { mode: 'AUTO', enabled: false },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'maintenance',
      temperature: 71.9,
      humidity: 65.1,
      lightIntensity: 0,
      waterUsage: 0,
      lastIrrigation: '3 days ago'
    },
    {
      id: 'L02A',
      name: 'Level 2A',
      valve: { mode: 'HAND', enabled: true },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'active',
      temperature: 73.1,
      humidity: 62.8,
      lightIntensity: 835,
      waterUsage: 13.2,
      lastIrrigation: '1 hour ago'
    },
    {
      id: 'L01A',
      name: 'Level 1A - Bottom',
      valve: { mode: 'AUTO', enabled: true },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'active',
      temperature: 72.2,
      humidity: 66.3,
      lightIntensity: 825,
      waterUsage: 12.1,
      lastIrrigation: '2 hours ago'
    },
    {
      id: 'L05B',
      name: 'Level 5B - Top',
      valve: { mode: 'OFF', enabled: false },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'inactive',
      temperature: 70.5,
      humidity: 68.2,
      lightIntensity: 0,
      waterUsage: 0,
      lastIrrigation: 'N/A'
    },
    {
      id: 'L04B',
      name: 'Level 4B',
      valve: { mode: 'AUTO', enabled: true },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'active',
      temperature: 72.6,
      humidity: 64.1,
      lightIntensity: 845,
      waterUsage: 11.9,
      lastIrrigation: '2 hours ago'
    },
    {
      id: 'L03B',
      name: 'Level 3B',
      valve: { mode: 'AUTO', enabled: true },
      shortCycle: { day: 0, hour: 14, min: 12 },
      cycleEndTime: { day: 0, hour: 14, min: 12 },
      dryStartTime: { day: 14 },
      status: 'error',
      temperature: 74.8,
      humidity: 58.9,
      lightIntensity: 842,
      waterUsage: 10.2,
      lastIrrigation: '4 hours ago'
    }
  ]);

  const updateValveMode = (levelId: string, mode: 'OFF' | 'AUTO' | 'HAND') => {
    setRackLevels(prev => prev.map(level => 
      level.id === levelId 
        ? { ...level, valve: { ...level.valve, mode } }
        : level
    ));
  };

  const toggleLevelEnabled = (levelId: string) => {
    setRackLevels(prev => prev.map(level => 
      level.id === levelId 
        ? { ...level, valve: { ...level.valve, enabled: !level.valve.enabled } }
        : level
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case 'maintenance':
        return <Settings className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getModeButtonClass = (currentMode: string, buttonMode: string, enabled: boolean) => {
    if (!enabled) return 'bg-gray-800 text-gray-600 cursor-not-allowed';
    if (currentMode === buttonMode) {
      switch (buttonMode) {
        case 'OFF':
          return 'bg-red-600 text-white';
        case 'AUTO':
          return 'bg-green-600 text-white';
        case 'HAND':
          return 'bg-yellow-600 text-white';
        default:
          return 'bg-gray-700 text-gray-300';
      }
    }
    return 'bg-gray-700 text-gray-300 hover:bg-gray-600';
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Multi-Level Rack Control</h2>
            <p className="text-gray-400">Grow / Level Settings - Valve Control</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-white font-medium">System Active</span>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Levels</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {rackLevels.filter(l => l.status === 'active').length}/{rackLevels.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Temperature</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(rackLevels.reduce((sum, l) => sum + l.temperature, 0) / rackLevels.length).toFixed(1)}°F
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(rackLevels.reduce((sum, l) => sum + l.humidity, 0) / rackLevels.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Water Usage</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {rackLevels.reduce((sum, l) => sum + l.waterUsage, 0).toFixed(1)} L/hr
          </p>
        </div>
      </div>

      {/* Level Controls Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-sm font-medium text-gray-400">
          <div className="col-span-1">Level</div>
          <div className="col-span-3">Valve Control</div>
          <div className="col-span-1 text-center">Enable</div>
          <div className="col-span-2 text-center">Short Cycle</div>
          <div className="col-span-2 text-center">Cycle End</div>
          <div className="col-span-1 text-center">Dry Start</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Metrics</div>
        </div>

        {rackLevels.map((level) => (
          <div
            key={level.id}
            className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-700 items-center ${
              !level.valve.enabled ? 'opacity-50' : ''
            }`}
          >
            {/* Level ID */}
            <div className="col-span-1">
              <span className="text-white font-mono font-bold text-lg">{level.id}</span>
            </div>

            {/* Valve Control Buttons */}
            <div className="col-span-3 flex gap-1">
              <button
                onClick={() => updateValveMode(level.id, 'OFF')}
                disabled={!level.valve.enabled}
                className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
                  getModeButtonClass(level.valve.mode, 'OFF', level.valve.enabled)
                }`}
              >
                OFF
              </button>
              <button
                onClick={() => updateValveMode(level.id, 'AUTO')}
                disabled={!level.valve.enabled}
                className={`px-4 py-2 font-medium transition-colors ${
                  getModeButtonClass(level.valve.mode, 'AUTO', level.valve.enabled)
                }`}
              >
                AUTO
              </button>
              <button
                onClick={() => updateValveMode(level.id, 'HAND')}
                disabled={!level.valve.enabled}
                className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                  getModeButtonClass(level.valve.mode, 'HAND', level.valve.enabled)
                }`}
              >
                HAND
              </button>
            </div>

            {/* Enable Toggle */}
            <div className="col-span-1 flex justify-center">
              <button
                onClick={() => toggleLevelEnabled(level.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  level.valve.enabled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {level.valve.enabled ? 'Yes' : 'No'}
              </button>
            </div>

            {/* Short Cycle */}
            <div className="col-span-2 text-center">
              <div className="bg-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm">
                {level.shortCycle.day}d {level.shortCycle.hour}h {level.shortCycle.min}m
              </div>
            </div>

            {/* Cycle End Time */}
            <div className="col-span-2 text-center">
              <div className="bg-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm">
                {level.cycleEndTime.day}d {level.cycleEndTime.hour}h {level.cycleEndTime.min}m
              </div>
            </div>

            {/* Dry Start */}
            <div className="col-span-1 text-center">
              <div className="bg-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm">
                Day {level.dryStartTime.day}
              </div>
            </div>

            {/* Status */}
            <div className="col-span-1 flex justify-center">
              {getStatusIcon(level.status)}
            </div>

            {/* Metrics */}
            <div className="col-span-1">
              <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors text-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            <Pause className="w-4 h-4" />
            Pause System
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Play className="w-4 h-4" />
            Start All Auto
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {rackLevels.some(l => l.status === 'error') && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400 text-sm">
            Level {rackLevels.find(l => l.status === 'error')?.id} requires attention. Temperature variance detected.
          </p>
        </div>
      )}
    </div>
  );
}