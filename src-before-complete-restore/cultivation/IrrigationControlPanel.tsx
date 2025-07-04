'use client';

import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Gauge,
  Activity,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Beaker,
  Waves,
  Timer,
  Power,
  Database,
  Zap
} from 'lucide-react';

interface TankStatus {
  id: 'A' | 'B';
  level: number; // percentage
  volume: number; // gallons
  ph: number;
  ec: number;
  temperature: number;
  isRefilling: boolean;
  lastRefill: string;
  drainStatus: boolean;
  solenoidPower: boolean;
}

interface IrrigationMetrics {
  flowRate: number; // GPM
  systemPressure: number; // PSI
  totalDaily: number; // gallons
  efficiency: number; // percentage
  lastIrrigation: string;
  nextScheduled: string;
}

export function IrrigationControlPanel() {
  const [currentMode, setCurrentMode] = useState<'Grow' | 'Flush' | 'Clean'>('Grow');
  const [runTime, setRunTime] = useState({ days: 11, hours: 0 });
  const [stopStatus, setStopStatus] = useState({ A: false, B: false });
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(true);
  
  const [tanks, setTanks] = useState<{ A: TankStatus; B: TankStatus }>({
    A: {
      id: 'A',
      level: 70.9,
      volume: 201.6,
      ph: 5.8,
      ec: 1.8,
      temperature: 70.2,
      isRefilling: false,
      lastRefill: '4 hours ago',
      drainStatus: false,
      solenoidPower: true
    },
    B: {
      id: 'B',
      level: 45.3,
      volume: 128.4,
      ph: 6.2,
      ec: 2.1,
      temperature: 71.5,
      isRefilling: true,
      lastRefill: '2 hours ago',
      drainStatus: false,
      solenoidPower: true
    }
  });

  const [metrics, setMetrics] = useState<IrrigationMetrics>({
    flowRate: 2.4,
    systemPressure: 45,
    totalDaily: 342,
    efficiency: 87,
    lastIrrigation: '15 minutes ago',
    nextScheduled: 'in 45 minutes'
  });

  const [refillSettings, setRefillSettings] = useState({
    limits: 500, // gallons
    duration: 60, // seconds
    volumeTarget: 250, // gallons
    refillsPerDay: 40,
    stopTarget: 175, // gallons
    startTarget: 100 // gallons
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        flowRate: Math.max(0, prev.flowRate + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2),
        systemPressure: Math.max(30, Math.min(60, prev.systemPressure + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2))
      }));

      setTanks(prev => ({
        A: {
          ...prev.A,
          level: Math.max(20, Math.min(95, prev.A.level + (prev.A.isRefilling ? 0.5 : -0.1))),
          volume: Math.max(50, Math.min(280, prev.A.volume + (prev.A.isRefilling ? 1.5 : -0.3)))
        },
        B: {
          ...prev.B,
          level: Math.max(20, Math.min(95, prev.B.level + (prev.B.isRefilling ? 0.5 : -0.1))),
          volume: Math.max(50, Math.min(280, prev.B.volume + (prev.B.isRefilling ? 1.5 : -0.3)))
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleTankRefill = (tankId: 'A' | 'B') => {
    setTanks(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        isRefilling: !prev[tankId].isRefilling
      }
    }));
  };

  const toggleDrain = (tankId: 'A' | 'B') => {
    setTanks(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        drainStatus: !prev[tankId].drainStatus
      }
    }));
  };

  const getStatusColor = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    if (percentage < 30) return 'text-red-500';
    if (percentage < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Irrigation Control System</h2>
            <p className="text-gray-400">Grow / Irrigation - Real-time Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">System Status:</span>
            <span className="text-green-400 font-medium ml-2">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Mode and Runtime Display */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm mb-3">Current Mode</h3>
          <div className="flex gap-2">
            {['Grow', 'Flush', 'Clean'].map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentMode === mode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm mb-3">Run Time</h3>
          <div className="text-2xl font-bold text-white font-mono">
            {runTime.days} Days {runTime.hours} Hours
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm mb-3">E-Stop Status</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">A:</span>
              <button
                onClick={() => setStopStatus(prev => ({ ...prev, A: !prev.A }))}
                className={`px-3 py-1 rounded font-medium ${
                  stopStatus.A ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {stopStatus.A ? 'STOPPED' : 'RUNNING'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">B:</span>
              <button
                onClick={() => setStopStatus(prev => ({ ...prev, B: !prev.B }))}
                className={`px-3 py-1 rounded font-medium ${
                  stopStatus.B ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {stopStatus.B ? 'STOPPED' : 'RUNNING'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Tank Controls */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {/* Tank A */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Main Tank A</h3>
              <div className="flex items-center gap-2">
                {tanks.A.isRefilling && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                <Power className={`w-4 h-4 ${tanks.A.solenoidPower ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
            </div>

            {/* Tank Visual */}
            <div className="relative h-40 bg-gray-900 rounded-lg mb-4 overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-1000"
                style={{ height: `${tanks.A.level}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-cyan-300/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{tanks.A.volume.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">gallons</p>
                  <p className="text-xs text-gray-500 mt-1">{tanks.A.level.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Tank Metrics */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="bg-gray-700 rounded px-3 py-2">
                <span className="text-gray-400">pH:</span>
                <span className={`ml-2 font-medium ${getStatusColor(tanks.A.ph, 5.5, 6.5)}`}>
                  {tanks.A.ph.toFixed(1)}
                </span>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2">
                <span className="text-gray-400">EC:</span>
                <span className={`ml-2 font-medium ${getStatusColor(tanks.A.ec, 1.5, 2.5)}`}>
                  {tanks.A.ec.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Tank Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleDrain('A')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                  tanks.A.drainStatus
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tanks.A.drainStatus ? 'Draining' : 'Drain'}
              </button>
              <button
                onClick={() => toggleTankRefill('A')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                  tanks.A.isRefilling
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tanks.A.isRefilling ? 'Refilling' : 'Refill'}
              </button>
            </div>
          </div>

          {/* Tank B */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Main Tank B</h3>
              <div className="flex items-center gap-2">
                {tanks.B.isRefilling && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                <Power className={`w-4 h-4 ${tanks.B.solenoidPower ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
            </div>

            {/* Tank Visual */}
            <div className="relative h-40 bg-gray-900 rounded-lg mb-4 overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-1000"
                style={{ height: `${tanks.B.level}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-purple-300/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{tanks.B.volume.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">gallons</p>
                  <p className="text-xs text-gray-500 mt-1">{tanks.B.level.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Tank Metrics */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="bg-gray-700 rounded px-3 py-2">
                <span className="text-gray-400">pH:</span>
                <span className={`ml-2 font-medium ${getStatusColor(tanks.B.ph, 5.5, 6.5)}`}>
                  {tanks.B.ph.toFixed(1)}
                </span>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2">
                <span className="text-gray-400">EC:</span>
                <span className={`ml-2 font-medium ${getStatusColor(tanks.B.ec, 1.5, 2.5)}`}>
                  {tanks.B.ec.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Tank Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleDrain('B')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                  tanks.B.drainStatus
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tanks.B.drainStatus ? 'Draining' : 'Drain'}
              </button>
              <button
                onClick={() => toggleTankRefill('B')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                  tanks.B.isRefilling
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tanks.B.isRefilling ? 'Refilling' : 'Refill'}
              </button>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="space-y-4">
          {/* Flow and Pressure */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">System Metrics</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">Flow Rate</span>
                  <span className="text-white font-medium">{metrics.flowRate.toFixed(1)} GPM</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.flowRate / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">System Pressure</span>
                  <span className="text-white font-medium">{metrics.systemPressure} PSI</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.systemPressure / 100) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Today</span>
                  <span className="text-white font-medium">{metrics.totalDaily} gal</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-400 text-sm">Efficiency</span>
                  <span className="text-green-400 font-medium">{metrics.efficiency}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refill Settings */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Auto Refill</h3>
              <button
                onClick={() => setAutoRefillEnabled(!autoRefillEnabled)}
                className={`px-3 py-1 rounded font-medium text-sm ${
                  autoRefillEnabled
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {autoRefillEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Limits</span>
                <span className="text-white font-mono">{refillSettings.limits} gal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white font-mono">{refillSettings.duration} sec</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Refills/Day</span>
                <span className="text-white font-mono">{refillSettings.refillsPerDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Stop/Start</span>
                <span className="text-white font-mono">{refillSettings.stopTarget}/{refillSettings.startTarget} gal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Water Level</span>
            <Waves className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-xl font-bold text-white">OK</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Refill Status</span>
            <RefreshCw className={`w-4 h-4 ${tanks.A.isRefilling || tanks.B.isRefilling ? 'text-blue-500 animate-spin' : 'text-gray-500'}`} />
          </div>
          <p className="text-xl font-bold text-white">{tanks.A.isRefilling || tanks.B.isRefilling ? 'Active' : 'Off'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Sensor Loop</span>
            <Activity className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-white">OK</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">pH System</span>
            <Beaker className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-white">OK</p>
        </div>
      </div>

      {/* Manual Refill Controls */}
      <div className="mt-6 flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium">Manual Refill</h3>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">
              Stop
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors">
              Start
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Next irrigation:</span>
          <span className="text-white font-medium">{metrics.nextScheduled}</span>
        </div>
      </div>
    </div>
  );
}