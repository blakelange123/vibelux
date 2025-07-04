'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Activity,
  Leaf,
  TrendingUp,
  Calendar,
  Settings,
  Info,
  Play,
  Pause,
  Droplets,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Timer,
  Sunrise,
  Sunset,
  Cloud,
  Eye,
  RefreshCw,
  Download,
  ChevronRight,
  Gauge,
  Waves
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

interface CircadianPhase {
  name: string;
  startHour: number;
  duration: number;
  lightIntensity: number;
  spectrum: {
    red: number;
    blue: number;
    farRed: number;
    white: number;
  };
  processes: string[];
}

interface PlantRhythm {
  id: string;
  name: string;
  species: string;
  currentPhase: string;
  phaseProgress: number;
  stomatalConductance: number;
  photosynthesisRate: number;
  transpirationRate: number;
  leafMovement: number;
  internalClock: number;
}

export function CircadianRhythmManager() {
  const [selectedPlant, setSelectedPlant] = useState('lettuce');
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(new Date().getHours());
  const [viewMode, setViewMode] = useState<'monitor' | 'schedule' | 'analysis'>('monitor');

  // Plant circadian profiles
  const [plantProfiles] = useState({
    lettuce: {
      name: 'Lettuce',
      optimalPhotoperiod: 16,
      darkPeriodMin: 6,
      criticalPhases: [
        { hour: 6, phase: 'Dawn Response', importance: 'high' },
        { hour: 12, phase: 'Midday Depression', importance: 'medium' },
        { hour: 18, phase: 'Evening Complex', importance: 'high' },
        { hour: 22, phase: 'Night Recovery', importance: 'high' }
      ]
    },
    tomato: {
      name: 'Tomato',
      optimalPhotoperiod: 14,
      darkPeriodMin: 8,
      criticalPhases: [
        { hour: 5, phase: 'Pre-dawn Mobilization', importance: 'high' },
        { hour: 10, phase: 'Morning Peak', importance: 'high' },
        { hour: 14, phase: 'Afternoon Adjustment', importance: 'medium' },
        { hour: 20, phase: 'Evening Transition', importance: 'high' }
      ]
    },
    cannabis: {
      name: 'Cannabis',
      optimalPhotoperiod: 12,
      darkPeriodMin: 12,
      criticalPhases: [
        { hour: 6, phase: 'Photomorphogenic Response', importance: 'high' },
        { hour: 11, phase: 'Peak Photosynthesis', importance: 'high' },
        { hour: 17, phase: 'Terpene Production', importance: 'high' },
        { hour: 23, phase: 'Flowering Signals', importance: 'critical' }
      ]
    }
  });

  // Circadian rhythm data (24-hour cycle)
  const [rhythmData] = useState(() =>
    Array.from({ length: 24 }, (_, hour) => {
      const phase = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      const lightOn = hour >= 6 && hour < 22; // 16-hour photoperiod
      
      return {
        hour,
        phase,
        lightIntensity: lightOn ? (hour < 12 ? 200 + hour * 50 : 800 - (hour - 12) * 40) : 0,
        photosynthesis: lightOn ? 50 + Math.sin((hour - 6) * 0.2) * 30 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 : 10,
        stomatalConductance: lightOn ? 60 + Math.cos(hour * 0.3) * 20 : 20,
        transpiration: lightOn ? 40 + Math.sin(hour * 0.25) * 20 : 15,
        leafAngle: 45 + Math.sin(hour * 0.26) * 25,
        internalClock: Math.sin((hour - 6) * (Math.PI / 12)) * 100 + 100,
        energyUse: lightOn ? 85 : 15
      };
    })
  );

  // Real-time rhythm status
  const [rhythmStatus] = useState<PlantRhythm>({
    id: 'plant-1',
    name: 'Crop Zone A',
    species: plantProfiles[selectedPlant as keyof typeof plantProfiles].name,
    currentPhase: 'Morning Peak',
    phaseProgress: 67,
    stomatalConductance: 75,
    photosynthesisRate: 82,
    transpirationRate: 68,
    leafMovement: 15,
    internalClock: timeOfDay
  });

  // Energy savings from circadian optimization
  const calculateEnergySavings = () => {
    const traditionalEnergy = 24 * 16 * 800; // 24/7 constant light
    const circadianEnergy = rhythmData.reduce((sum, h) => sum + h.lightIntensity, 0);
    const savings = ((traditionalEnergy - circadianEnergy) / traditionalEnergy) * 100;
    return savings.toFixed(1);
  };

  // Simulate time progression
  useEffect(() => {
    if (!simulationRunning) return;
    
    const interval = setInterval(() => {
      setTimeOfDay((prev) => (prev + 1) % 24);
    }, 5000); // Update every 5 seconds (simulating hours)
    
    return () => clearInterval(interval);
  }, [simulationRunning]);

  const currentData = rhythmData[timeOfDay];
  const currentProfile = plantProfiles[selectedPlant as keyof typeof plantProfiles];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              Circadian Rhythm Management
            </h2>
            <p className="text-gray-400 mt-1">
              Optimize plant growth by synchronizing with natural biological rhythms
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              {Object.entries(plantProfiles).map(([key, profile]) => (
                <option key={key} value={key}>{profile.name}</option>
              ))}
            </select>
            <button
              onClick={() => setSimulationRunning(!simulationRunning)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                simulationRunning
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {simulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {simulationRunning ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {['monitor', 'schedule', 'analysis'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Current Status Overview */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-400">Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{timeOfDay}:00</p>
            <p className="text-gray-400 text-sm capitalize">{currentData.phase}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              {currentData.lightIntensity > 0 ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-xs text-gray-400">Light</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentData.lightIntensity}</p>
            <p className="text-gray-400 text-sm">μmol/m²/s</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-400">Photosyn.</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentData.photosynthesis.toFixed(0)}</p>
            <p className="text-gray-400 text-sm">μmol CO₂/m²/s</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-400">Stomata</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentData.stomatalConductance.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm">Conductance</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">Transpir.</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentData.transpiration.toFixed(0)}</p>
            <p className="text-gray-400 text-sm">mmol H₂O/m²/s</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-gray-400">Energy</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentData.energyUse}%</p>
            <p className="text-green-400 text-sm">-{calculateEnergySavings()}% saved</p>
          </div>
        </div>
      </div>

      {viewMode === 'monitor' && (
        <>
          {/* 24-Hour Rhythm Chart */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">24-Hour Biological Rhythm</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={rhythmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <ReferenceLine x={timeOfDay} stroke="#8b5cf6" strokeWidth={2} />
                <Area 
                  type="monotone" 
                  dataKey="lightIntensity" 
                  stroke="#fbbf24" 
                  fill="#fbbf24" 
                  fillOpacity={0.2}
                  name="Light Intensity"
                />
                <Area 
                  type="monotone" 
                  dataKey="photosynthesis" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Photosynthesis Rate"
                />
                <Area 
                  type="monotone" 
                  dataKey="stomatalConductance" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  name="Stomatal Conductance"
                />
                <Area 
                  type="monotone" 
                  dataKey="internalClock" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.1}
                  name="Internal Clock"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Phases */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-500" />
                Critical Growth Phases
              </h3>
              <div className="space-y-3">
                {currentProfile.criticalPhases.map((phase, index) => {
                  const isActive = Math.abs(timeOfDay - phase.hour) < 2;
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border transition-all ${
                        isActive 
                          ? 'bg-purple-600/20 border-purple-500' 
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{phase.phase}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          phase.importance === 'critical' ? 'bg-red-600' :
                          phase.importance === 'high' ? 'bg-orange-600' :
                          'bg-yellow-600'
                        }`}>
                          {phase.importance}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          {phase.hour}:00 - {(phase.hour + 2) % 24}:00
                        </span>
                        {isActive && (
                          <span className="text-green-400 text-sm flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-green-500" />
                Rhythm Optimization Benefits
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Energy Efficiency</span>
                    <span className="text-green-400 font-medium">+{calculateEnergySavings()}%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Compared to constant 24/7 lighting
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Growth Rate</span>
                    <span className="text-green-400 font-medium">+12%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enhanced by natural rhythm synchronization
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Plant Health</span>
                    <span className="text-green-400 font-medium">+18%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Reduced stress, improved resilience
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Nutrient Uptake</span>
                    <span className="text-green-400 font-medium">+15%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Optimized during peak metabolic phases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'schedule' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Photoperiod Schedule Designer</h3>
          <div className="grid grid-cols-24 gap-1 mb-6">
            {Array.from({ length: 24 }, (_, hour) => {
              const isLight = rhythmData[hour].lightIntensity > 0;
              return (
                <div
                  key={hour}
                  className={`h-20 rounded flex flex-col items-center justify-center text-xs cursor-pointer transition-all ${
                    isLight ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={`${hour}:00 - ${isLight ? 'Light' : 'Dark'}`}
                >
                  <span className="text-white font-medium">{hour}</span>
                  {isLight ? <Sun className="w-3 h-3 text-white mt-1" /> : <Moon className="w-3 h-3 text-gray-400 mt-1" />}
                </div>
              );
            })}
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Photoperiod:</span>
                <span className="text-white font-medium ml-2">{currentProfile.optimalPhotoperiod} hours</span>
              </div>
              <div>
                <span className="text-gray-400">Dark Period:</span>
                <span className="text-white font-medium ml-2">{24 - currentProfile.optimalPhotoperiod} hours</span>
              </div>
              <div>
                <span className="text-gray-400">DLI Target:</span>
                <span className="text-white font-medium ml-2">17.3 mol/m²/day</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'analysis' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Metabolic Activity Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
                { name: 'Photosynthesis', value: currentData.photosynthesis, fill: '#10b981' },
                { name: 'Respiration', value: 100 - currentData.photosynthesis, fill: '#ef4444' },
                { name: 'Transpiration', value: currentData.transpiration, fill: '#3b82f6' },
                { name: 'Nutrient Uptake', value: currentData.stomatalConductance, fill: '#8b5cf6' }
              ]}>
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar dataKey="value" cornerRadius={10} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Circadian Synchronization Score</h3>
            <div className="flex items-center justify-center h-[250px]">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-8 border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white">87%</p>
                    <p className="text-gray-400 text-sm mt-2">Rhythm Sync</p>
                  </div>
                </div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-green-500"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((87 * 3.6 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((87 * 3.6 - 90) * Math.PI / 180)}%)`
                  }}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Light-Dark Cycle</span>
                <span className="text-green-400">Optimal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Metabolic Timing</span>
                <span className="text-green-400">Synchronized</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Stress Response</span>
                <span className="text-yellow-400">Minor Deviation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}