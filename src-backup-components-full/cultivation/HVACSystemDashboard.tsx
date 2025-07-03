'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  AlertCircle,
  CheckCircle,
  Power,
  TrendingUp,
  TrendingDown,
  Settings,
  Snowflake,
  Sun,
  Activity,
  Zap,
  Timer,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HVACUnit {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'error' | 'maintenance';
  mode: 'cooling' | 'heating' | 'dehumidify' | 'ventilation';
  setpoint: number;
  currentTemp: number;
  currentHumidity: number;
  fanSpeed: number; // percentage
  compressorStatus: boolean;
  powerConsumption: number; // kW
  runtime: number; // hours
  efficiency: number; // percentage
}

interface ChillerStatus {
  fluidTemp: number;
  setpoint: number;
  flowRate: number;
  pressure: number;
  status: 'running' | 'standby' | 'error';
  compressorLoad: number; // percentage
}

interface CO2System {
  currentPPM: number;
  targetPPM: number;
  injectionRate: number; // L/min
  tankLevel: number; // percentage
  mode: '24hr' | 'lights_on' | 'manual';
  efficiency: number;
}

export function HVACSystemDashboard() {
  const [units, setUnits] = useState<HVACUnit[]>([
    {
      id: 'UNIT-1',
      name: 'Main HVAC Unit 1',
      status: 'active',
      mode: 'cooling',
      setpoint: 72,
      currentTemp: 72.4,
      currentHumidity: 64.7,
      fanSpeed: 75,
      compressorStatus: true,
      powerConsumption: 12.4,
      runtime: 2847,
      efficiency: 92
    },
    {
      id: 'UNIT-2',
      name: 'Main HVAC Unit 2',
      status: 'active',
      mode: 'cooling',
      setpoint: 72,
      currentTemp: 72.5,
      currentHumidity: 63.1,
      fanSpeed: 80,
      compressorStatus: true,
      powerConsumption: 13.1,
      runtime: 2652,
      efficiency: 89
    },
    {
      id: 'UNIT-3',
      name: 'Auxiliary Unit',
      status: 'standby',
      mode: 'ventilation',
      setpoint: 72,
      currentTemp: 73.2,
      currentHumidity: 65.8,
      fanSpeed: 30,
      compressorStatus: false,
      powerConsumption: 2.1,
      runtime: 1245,
      efficiency: 94
    }
  ]);

  const [chiller, setChiller] = useState<ChillerStatus>({
    fluidTemp: 45.2,
    setpoint: 45,
    flowRate: 125,
    pressure: 28,
    status: 'running',
    compressorLoad: 68
  });

  const [co2System, setCO2System] = useState<CO2System>({
    currentPPM: 875,
    targetPPM: 900,
    injectionRate: 2.4,
    tankLevel: 76,
    mode: 'lights_on',
    efficiency: 91
  });

  const [historicalData, setHistoricalData] = useState(() => 
    Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      temperature: 72 + Math.sin(i * 0.3) * 2,
      humidity: 65 + Math.cos(i * 0.4) * 5,
      co2: 800 + Math.sin(i * 0.2) * 100
    }))
  );

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUnits(prev => prev.map(unit => ({
        ...unit,
        currentTemp: unit.currentTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2,
        currentHumidity: unit.currentHumidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5,
        fanSpeed: Math.max(30, Math.min(100, unit.fanSpeed + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5))
      })));

      setCO2System(prev => ({
        ...prev,
        currentPPM: Math.max(400, Math.min(1200, prev.currentPPM + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'cooling':
        return <Snowflake className="w-4 h-4 text-blue-400" />;
      case 'heating':
        return <Sun className="w-4 h-4 text-orange-400" />;
      case 'dehumidify':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'ventilation':
        return <Wind className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'standby':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'maintenance':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
            <Thermometer className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">HVAC System Control</h2>
            <p className="text-gray-400">Real-time Climate Management Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-white font-medium">All Systems Normal</span>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Temp</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(units.reduce((sum, unit) => sum + unit.currentTemp, 0) / units.length).toFixed(1)}°F
          </p>
          <p className="text-xs text-green-400 mt-1">±0.3°F</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg RH</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(units.reduce((sum, unit) => sum + unit.currentHumidity, 0) / units.length).toFixed(1)}%
          </p>
          <p className="text-xs text-green-400 mt-1">±1.2%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">CO₂ Level</span>
            <Wind className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{co2System.currentPPM}</p>
          <p className="text-xs text-gray-400 mt-1">ppm</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Power Use</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {units.reduce((sum, unit) => sum + unit.powerConsumption, 0).toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 mt-1">kW</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Efficiency</span>
            <Gauge className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(units.reduce((sum, unit) => sum + unit.efficiency, 0) / units.length).toFixed(0)}%
          </p>
          <p className="text-xs text-green-400 mt-1">+2.3%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Units</span>
            <Power className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            {units.filter(u => u.status === 'active').length}/{units.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">online</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* HVAC Units */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">HVAC Units</h3>
          <div className="space-y-4">
            {units.map((unit) => (
              <div key={unit.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIndicator(unit.status)}
                    <h4 className="text-white font-medium">{unit.name}</h4>
                    {getModeIcon(unit.mode)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Runtime: {unit.runtime}h</span>
                    <button className={`px-3 py-1 rounded text-sm font-medium ${
                      unit.status === 'active' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {unit.status.toUpperCase()}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Temperature</p>
                    <p className="text-lg font-bold text-white">{unit.currentTemp.toFixed(1)}°F</p>
                    <p className="text-xs text-gray-500">Set: {unit.setpoint}°F</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Humidity</p>
                    <p className="text-lg font-bold text-white">{unit.currentHumidity.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Target: 65%</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Fan Speed</p>
                    <p className="text-lg font-bold text-white">{unit.fanSpeed}%</p>
                    <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                      <div 
                        className="bg-cyan-500 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${unit.fanSpeed}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Power</p>
                    <p className="text-lg font-bold text-white">{unit.powerConsumption} kW</p>
                    <p className="text-xs text-green-400">η {unit.efficiency}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Compressor:</span>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      unit.compressorStatus 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {unit.compressorStatus ? 'ON' : 'OFF'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chiller and CO2 System */}
        <div className="space-y-6">
          {/* Chiller Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Chiller System</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIndicator(chiller.status)}
                  <span className="text-white font-medium">Chiller Unit 1</span>
                </div>
                <Snowflake className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Fluid Temp</span>
                    <span className="text-white font-medium">{chiller.fluidTemp}°F</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${((chiller.fluidTemp - 40) / 20) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Setpoint: {chiller.setpoint}°F</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Flow Rate</p>
                    <p className="text-sm font-bold text-white">{chiller.flowRate} GPM</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Pressure</p>
                    <p className="text-sm font-bold text-white">{chiller.pressure} PSI</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Compressor Load</span>
                    <span className="text-sm font-bold text-white">{chiller.compressorLoad}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${chiller.compressorLoad}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CO2 System */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">CO₂ Management</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Carbon Dioxide System</span>
                <Wind className="w-5 h-5 text-purple-400" />
              </div>

              <div className="space-y-3">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Current Level</span>
                    <span className="text-2xl font-bold text-white">{co2System.currentPPM}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(co2System.currentPPM / 1500) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Target: {co2System.targetPPM} ppm</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Injection Rate</p>
                    <p className="text-sm font-bold text-white">{co2System.injectionRate} L/min</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Tank Level</p>
                    <p className="text-sm font-bold text-white">{co2System.tankLevel}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {['24hr', 'lights_on', 'manual'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCO2System(prev => ({ ...prev, mode: mode as any }))}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        co2System.mode === mode
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {mode === 'lights_on' ? 'Lights On' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Climate Trends Chart */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">24-Hour Climate Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="hour" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="temp"
              orientation="left"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{ value: 'Temp (°F) / RH (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="co2"
              orientation="right"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{ value: 'CO₂ (ppm)', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#e5e7eb' }}
              itemStyle={{ color: '#e5e7eb' }}
            />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              name="Temperature"
            />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="humidity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Humidity"
            />
            <Line 
              yAxisId="co2"
              type="monotone" 
              dataKey="co2" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
              name="CO₂"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* System Alerts */}
      {units.some(u => u.currentTemp > u.setpoint + 2) && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <p className="text-yellow-400 text-sm">
            Temperature variance detected in {units.filter(u => u.currentTemp > u.setpoint + 2).length} unit(s). 
            Check airflow and cooling capacity.
          </p>
        </div>
      )}
    </div>
  );
}