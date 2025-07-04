'use client';

import React, { useState } from 'react';
import Room3DWebGLEnhanced from '@/components/Room3DWebGLEnhanced';
import { motion } from 'framer-motion';
import { Maximize, Activity, Thermometer, Droplets, Wind } from 'lucide-react';

export default function Visualization3DPage() {
  const [selectedView, setSelectedView] = useState<'full' | 'split'>('full');
  
  // Mock room configuration
  const roomDimensions = {
    width: 12,
    length: 20,
    height: 4
  };
  
  // Mock fixtures
  const fixtures = [
    {
      id: 'fixture-1',
      x: -3,
      y: -5,
      z: 3.5,
      rotation: 0,
      model: {
        brand: 'Fluence',
        model: 'SPYDR 2x',
        wattage: 645,
        ppf: 1700,
        beamAngle: 120
      },
      enabled: true,
      assignedTiers: ['tier-1']
    },
    {
      id: 'fixture-2',
      x: 3,
      y: -5,
      z: 3.5,
      rotation: 0,
      model: {
        brand: 'Fluence',
        model: 'SPYDR 2x',
        wattage: 645,
        ppf: 1700,
        beamAngle: 120
      },
      enabled: true,
      assignedTiers: ['tier-1']
    },
    {
      id: 'fixture-3',
      x: -3,
      y: 0,
      z: 3.5,
      rotation: 0,
      model: {
        brand: 'Gavita',
        model: '1700e',
        wattage: 645,
        ppf: 1700,
        beamAngle: 120
      },
      enabled: true,
      assignedTiers: ['tier-2']
    },
    {
      id: 'fixture-4',
      x: 3,
      y: 0,
      z: 3.5,
      rotation: 0,
      model: {
        brand: 'Gavita',
        model: '1700e',
        wattage: 645,
        ppf: 1700,
        beamAngle: 120
      },
      enabled: false,
      assignedTiers: ['tier-2']
    },
    {
      id: 'fixture-5',
      x: -3,
      y: 5,
      z: 3.5,
      rotation: 0,
      model: {
        brand: 'ThinkGrow',
        model: 'Model-I Plus',
        wattage: 630,
        ppf: 1620,
        beamAngle: 120
      },
      enabled: true,
      assignedTiers: ['tier-3']
    },
    {
      id: 'fixture-6',
      x: 3,
      y: 5,
      z: 3.5,
      rotation: 0,
      model: {
        brand: 'ThinkGrow',
        model: 'Model-I Plus',
        wattage: 630,
        ppf: 1620,
        beamAngle: 120
      },
      enabled: true,
      assignedTiers: ['tier-3']
    }
  ];
  
  // Mock tiers
  const tiers = [
    {
      id: 'tier-1',
      name: 'Bottom Tier',
      height: 0.5,
      benchDepth: 1.5,
      canopyHeight: 1.0,
      color: '#10b981',
      visible: true,
      enabled: true
    },
    {
      id: 'tier-2',
      name: 'Middle Tier',
      height: 1.5,
      benchDepth: 1.5,
      canopyHeight: 1.0,
      color: '#3b82f6',
      visible: true,
      enabled: true
    },
    {
      id: 'tier-3',
      name: 'Top Tier',
      height: 2.5,
      benchDepth: 1.5,
      canopyHeight: 1.0,
      color: '#8b5cf6',
      visible: true,
      enabled: true
    }
  ];
  
  // Mock sensor positions
  const sensorPositions = [
    // Zone 1 sensors
    { id: 'temp-1', x: -4, y: -6, z: 1.5, type: 'temperature' as const, zone: 'Zone 1' },
    { id: 'hum-1', x: -4, y: -6, z: 2, type: 'humidity' as const, zone: 'Zone 1' },
    { id: 'co2-1', x: -4, y: -6, z: 2.5, type: 'co2' as const, zone: 'Zone 1' },
    { id: 'light-1', x: -4, y: -6, z: 3, type: 'light' as const, zone: 'Zone 1' },
    
    // Zone 2 sensors
    { id: 'temp-2', x: 4, y: -6, z: 1.5, type: 'temperature' as const, zone: 'Zone 2' },
    { id: 'hum-2', x: 4, y: -6, z: 2, type: 'humidity' as const, zone: 'Zone 2' },
    { id: 'co2-2', x: 4, y: -6, z: 2.5, type: 'co2' as const, zone: 'Zone 2' },
    { id: 'light-2', x: 4, y: -6, z: 3, type: 'light' as const, zone: 'Zone 2' },
    
    // Zone 3 sensors
    { id: 'temp-3', x: -4, y: 0, z: 1.5, type: 'temperature' as const, zone: 'Zone 3' },
    { id: 'hum-3', x: -4, y: 0, z: 2, type: 'humidity' as const, zone: 'Zone 3' },
    { id: 'co2-3', x: -4, y: 0, z: 2.5, type: 'co2' as const, zone: 'Zone 3' },
    { id: 'light-3', x: -4, y: 0, z: 3, type: 'light' as const, zone: 'Zone 3' },
    
    // Zone 4 sensors
    { id: 'temp-4', x: 4, y: 0, z: 1.5, type: 'temperature' as const, zone: 'Zone 4' },
    { id: 'hum-4', x: 4, y: 0, z: 2, type: 'humidity' as const, zone: 'Zone 4' },
    { id: 'co2-4', x: 4, y: 0, z: 2.5, type: 'co2' as const, zone: 'Zone 4' },
    { id: 'light-4', x: 4, y: 0, z: 3, type: 'light' as const, zone: 'Zone 4' },
    
    // Zone 5 sensors
    { id: 'temp-5', x: -4, y: 6, z: 1.5, type: 'temperature' as const, zone: 'Zone 5' },
    { id: 'hum-5', x: -4, y: 6, z: 2, type: 'humidity' as const, zone: 'Zone 5' },
    { id: 'co2-5', x: -4, y: 6, z: 2.5, type: 'co2' as const, zone: 'Zone 5' },
    { id: 'light-5', x: -4, y: 6, z: 3, type: 'light' as const, zone: 'Zone 5' },
    
    // Zone 6 sensors
    { id: 'temp-6', x: 4, y: 6, z: 1.5, type: 'temperature' as const, zone: 'Zone 6' },
    { id: 'hum-6', x: 4, y: 6, z: 2, type: 'humidity' as const, zone: 'Zone 6' },
    { id: 'co2-6', x: 4, y: 6, z: 2.5, type: 'co2' as const, zone: 'Zone 6' },
    { id: 'light-6', x: 4, y: 6, z: 3, type: 'light' as const, zone: 'Zone 6' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            3D Grow Room Visualization
          </h1>
          <p className="text-gray-400">
            Real-time environmental monitoring with interactive 3D visualization
          </p>
        </motion.div>
        
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedView('full')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'full'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Maximize className="w-4 h-4 inline mr-2" />
            Full View
          </button>
          <button
            onClick={() => setSelectedView('split')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'split'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Split View
          </button>
        </div>
        
        {/* Visualization Container */}
        {selectedView === 'full' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 rounded-lg overflow-hidden"
            style={{ height: '80vh' }}
          >
            <Room3DWebGLEnhanced
              roomDimensions={roomDimensions}
              fixtures={fixtures}
              tiers={tiers}
              sensorPositions={sensorPositions}
              showGrid={true}
              showLightBeams={true}
              showSensorData={true}
              showAlerts={true}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3D View */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-lg overflow-hidden"
              style={{ height: '60vh' }}
            >
              <Room3DWebGLEnhanced
                roomDimensions={roomDimensions}
                fixtures={fixtures}
                tiers={tiers}
                sensorPositions={sensorPositions}
                showGrid={true}
                showLightBeams={true}
                showSensorData={true}
                showAlerts={true}
              />
            </motion.div>
            
            {/* Sensor Data Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-lg p-6"
              style={{ height: '60vh', overflowY: 'auto' }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Live Sensor Readings
              </h2>
              
              <div className="space-y-4">
                {/* Zone Summary Cards */}
                {[1, 2, 3, 4, 5, 6].map((zone) => (
                  <motion.div
                    key={zone}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: zone * 0.1 }}
                    className="bg-gray-800 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-medium text-white mb-3">
                      Zone {zone}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-400" />
                        <div>
                          <div className="text-xs text-gray-400">Temperature</div>
                          <div className="text-lg font-semibold text-white">
                            {(72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5).toFixed(1)}°F
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-xs text-gray-400">Humidity</div>
                          <div className="text-lg font-semibold text-white">
                            {(55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-xs text-gray-400">CO2</div>
                          <div className="text-lg font-semibold text-white">
                            {(800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400).toFixed(0)} ppm
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-xs text-gray-400">VPD</div>
                          <div className="text-lg font-semibold text-white">
                            {(0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4).toFixed(2)} kPa
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gray-900 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-3">
            Features Demonstrated
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <h3 className="text-white font-medium mb-2">Real-time Sensors</h3>
              <ul className="space-y-1">
                <li>• Live environmental data</li>
                <li>• Alert indicators</li>
                <li>• Zone-based monitoring</li>
                <li>• Interactive sensor nodes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">3D Visualization</h3>
              <ul className="space-y-1">
                <li>• Interactive camera controls</li>
                <li>• Light beam visualization</li>
                <li>• Fixture management</li>
                <li>• Multi-tier support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Smart Alerts</h3>
              <ul className="space-y-1">
                <li>• Temperature alerts</li>
                <li>• Humidity warnings</li>
                <li>• CO2 level monitoring</li>
                <li>• Visual indicators</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}