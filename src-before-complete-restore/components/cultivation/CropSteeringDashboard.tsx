'use client';

import React, { useState, useEffect } from 'react';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Navigation,
  Flower2,
  Sprout
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CropSteeringEngine, CropSteeringProfile } from '@/lib/cultivation/crop-steering-engine';

const steeringEngine = new CropSteeringEngine();

export function CropSteeringDashboard() {
  const [selectedRoom, setSelectedRoom] = useState('flower-1');
  const [activeProfile, setActiveProfile] = useState<CropSteeringProfile | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [morphologyMode, setMorphologyMode] = useState(false);
  const [morphologyData, setMorphologyData] = useState({
    internodeLength: 3,
    leafSize: 15,
    stemThickness: 1,
    plantHeight: 60,
    flowerDevelopment: 0
  });

  useEffect(() => {
    // Subscribe to steering updates
    steeringEngine.on('metricsUpdated', ({ roomId, metrics }) => {
      if (roomId === selectedRoom) {
        setMetrics(metrics);
      }
    });

    steeringEngine.on('steeringRecommendation', (recommendation) => {
    });

    // Simulate sensor data updates
    const interval = setInterval(() => {
      const data = {
        temperature: 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        co2: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400,
        ppfd: 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        waterContent: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        ec: 2.0 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.0,
        ph: 5.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8
      };

      steeringEngine.updateSensorData(selectedRoom, data);
      setSensorData(prev => [...prev.slice(-50), { ...data, time: new Date().toLocaleTimeString() }]);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedRoom]);

  const activateProfile = (profileId: string) => {
    steeringEngine.activateProfile(selectedRoom, profileId);
    const report = steeringEngine.getSteeringReport(selectedRoom);
    setActiveProfile(report.profile);
  };

  const updateMorphology = () => {
    steeringEngine.recordMorphology(selectedRoom, morphologyData);
    setMorphologyMode(false);
  };

  const getSteeringColor = (direction: string) => {
    switch (direction) {
      case 'generative': return 'text-orange-400';
      case 'vegetative': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getSteeringIcon = (direction: string) => {
    switch (direction) {
      case 'generative': return Flower2;
      case 'vegetative': return Sprout;
      default: return Minus;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crop Steering Control</h1>
          <p className="text-gray-400">Precision morphology management through environmental control</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMorphologyMode(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Record Morphology
          </button>
          
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Room Selector */}
      <div className="flex gap-2 mb-6">
        {['flower-1', 'flower-2', 'veg-1'].map(room => (
          <button
            key={room}
            onClick={() => setSelectedRoom(room)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedRoom === room
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {room.charAt(0).toUpperCase() + room.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Main Steering Indicator */}
      {metrics && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Steering Direction */}
            <div className="text-center">
              <h3 className="text-sm text-gray-400 mb-2">Steering Direction</h3>
              <div className={`flex items-center justify-center gap-3 ${getSteeringColor(metrics.steeringDirection)}`}>
                {React.createElement(getSteeringIcon(metrics.steeringDirection), { className: 'w-12 h-12' })}
                <div>
                  <div className="text-3xl font-bold capitalize">{metrics.steeringDirection}</div>
                  <div className="text-sm text-gray-400">Morphology Index: {metrics.morphologyIndex.toFixed(0)}</div>
                </div>
              </div>
            </div>

            {/* Steering Intensity Gauge */}
            <div className="text-center">
              <h3 className="text-sm text-gray-400 mb-2">Steering Intensity</h3>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${metrics.steeringIntensity * 3.52} 352`}
                    className={getSteeringColor(metrics.steeringDirection)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-3xl font-bold">{metrics.steeringIntensity.toFixed(0)}%</div>
                    <div className="text-xs text-gray-400">Intensity</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stress Indicators */}
            <div>
              <h3 className="text-sm text-gray-400 mb-4">Stress Levels</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Environmental</span>
                    <span>{metrics.environmentalStress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        metrics.environmentalStress > 70 ? 'bg-red-500' : 
                        metrics.environmentalStress > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${metrics.environmentalStress}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Water</span>
                    <span>{metrics.waterStress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        metrics.waterStress > 70 ? 'bg-red-500' : 
                        metrics.waterStress > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${metrics.waterStress}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nutrient</span>
                    <span>{metrics.nutrientStress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        metrics.nutrientStress > 70 ? 'bg-red-500' : 
                        metrics.nutrientStress > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${metrics.nutrientStress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Trends */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Climate Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f97316" 
                  name="Temp (°F)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  name="RH (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Root Zone Conditions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="waterContent" 
                  stroke="#06b6d4" 
                  name="Water Content (%)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="ec" 
                  stroke="#8b5cf6" 
                  name="EC (mS/cm)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profile Selection */}
      {!activeProfile && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Select Crop Steering Profile</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => activateProfile('CSP-1')}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <h4 className="font-semibold mb-2">Cannabis - Balanced</h4>
              <p className="text-sm text-gray-400">Balanced generative/vegetative for optimal quality</p>
            </button>
            
            <button
              onClick={() => activateProfile('CSP-2')}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <h4 className="font-semibold mb-2">Cannabis - Generative</h4>
              <p className="text-sm text-gray-400">Push for higher yields and denser flowers</p>
            </button>
            
            <button
              onClick={() => activateProfile('CSP-3')}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <h4 className="font-semibold mb-2">Tomato - Production</h4>
              <p className="text-sm text-gray-400">Optimized for continuous harvest</p>
            </button>
          </div>
        </div>
      )}

      {/* Morphology Recording Modal */}
      {morphologyMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Record Plant Morphology</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Internode Length (cm)
                </label>
                <input
                  type="number"
                  value={morphologyData.internodeLength}
                  onChange={(e) => setMorphologyData({
                    ...morphologyData,
                    internodeLength: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Leaf Size (cm)
                </label>
                <input
                  type="number"
                  value={morphologyData.leafSize}
                  onChange={(e) => setMorphologyData({
                    ...morphologyData,
                    leafSize: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Stem Thickness (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={morphologyData.stemThickness}
                  onChange={(e) => setMorphologyData({
                    ...morphologyData,
                    stemThickness: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Plant Height (cm)
                </label>
                <input
                  type="number"
                  value={morphologyData.plantHeight}
                  onChange={(e) => setMorphologyData({
                    ...morphologyData,
                    plantHeight: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Flower Development (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={morphologyData.flowerDevelopment}
                  onChange={(e) => setMorphologyData({
                    ...morphologyData,
                    flowerDevelopment: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setMorphologyMode(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={updateMorphology}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}