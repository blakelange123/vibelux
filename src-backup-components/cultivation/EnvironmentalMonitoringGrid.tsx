'use client';

import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface ZoneData {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  status: 'ok' | 'warning' | 'error';
  lightStatus: boolean;
}

export function EnvironmentalMonitoringGrid() {
  const [zones, setZones] = useState<ZoneData[]>([
    { id: 'L1A', name: 'UNIT 1', temperature: 74.8, humidity: 64.7, co2: 824, vpd: 1.2, status: 'ok', lightStatus: true },
    { id: 'L2A', name: 'UNIT 2', temperature: 72.5, humidity: 63.12, co2: 812, vpd: 1.1, status: 'ok', lightStatus: true },
    { id: 'L3A', name: 'UNIT 3', temperature: 73.7, humidity: 61.5, co2: 835, vpd: 1.3, status: 'ok', lightStatus: true },
    { id: 'L4A', name: 'UNIT 4', temperature: 72.3, humidity: 64.8, co2: 798, vpd: 1.1, status: 'ok', lightStatus: true },
    { id: 'L1B', name: 'UNIT 5', temperature: 75.1, humidity: 68.2, co2: 845, vpd: 1.0, status: 'warning', lightStatus: true },
    { id: 'L2B', name: 'UNIT 6', temperature: 72.8, humidity: 63.9, co2: 820, vpd: 1.2, status: 'ok', lightStatus: false },
    { id: 'L3B', name: 'UNIT 7', temperature: 73.2, humidity: 62.7, co2: 810, vpd: 1.2, status: 'ok', lightStatus: true },
    { id: 'L4B', name: 'UNIT 8', temperature: 72.9, humidity: 65.3, co2: 830, vpd: 1.1, status: 'ok', lightStatus: true }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev => prev.map(zone => ({
        ...zone,
        temperature: zone.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.4,
        humidity: zone.humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.8,
        co2: Math.round(zone.co2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20),
        vpd: Math.round((zone.vpd + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1) * 10) / 10
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Environmental Monitoring</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Real-time Data</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Monitoring Grid - AeroFarms Style */}
      <div className="grid grid-cols-4 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Zone Header */}
            <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
              <span className="text-white font-bold">{zone.id}</span>
              <div className="flex items-center gap-2">
                {zone.lightStatus && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Lights On" />
                )}
                <span className={`text-sm font-medium ${getStatusColor(zone.status)}`}>
                  {zone.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Temperature Display */}
            <div className="p-4 space-y-3">
              <div className="text-center">
                <p className="text-4xl font-bold text-white font-mono">
                  {zone.temperature.toFixed(1)}°F
                </p>
                <p className="text-sm text-gray-400 mt-1">AIR TEMPERATURE</p>
              </div>

              {/* Humidity Display */}
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">REL. HUMIDITY</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {zone.humidity.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-900 rounded p-2">
                  <p className="text-gray-400 text-xs">CO₂</p>
                  <p className="text-white font-bold">{zone.co2} ppm</p>
                </div>
                <div className="bg-gray-900 rounded p-2">
                  <p className="text-gray-400 text-xs">VPD</p>
                  <p className="text-white font-bold">{zone.vpd} kPa</p>
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    zone.status === 'ok' ? 'bg-green-500' :
                    zone.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: zone.status === 'ok' ? '100%' : zone.status === 'warning' ? '60%' : '30%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Average Temp</span>
          <span className="text-white font-bold">
            {(zones.reduce((sum, z) => sum + z.temperature, 0) / zones.length).toFixed(1)}°F
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Average RH</span>
          <span className="text-white font-bold">
            {(zones.reduce((sum, z) => sum + z.humidity, 0) / zones.length).toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Average CO₂</span>
          <span className="text-white font-bold">
            {Math.round(zones.reduce((sum, z) => sum + z.co2, 0) / zones.length)} ppm
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">System Status</span>
          <span className="text-green-400 font-bold">ALL OK</span>
        </div>
      </div>
    </div>
  );
}