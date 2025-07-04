'use client';

import React, { useState, useEffect } from 'react';
import {
  Wind,
  Sun,
  Thermometer,
  Droplets,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Zap,
  TrendingUp,
  TrendingDown,
  Cloud,
  Navigation,
  Maximize2,
  Minimize2,
  GitBranch,
  Layers,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  CircuitBoard,
  Cpu,
  Fan,
  Waves,
  Filter
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarGrid, PolarAngleAxis, Cell } from 'recharts';

interface AirflowVector {
  x: number;
  y: number;
  z: number;
  velocity: number; // m/s
  temperature: number; // °C
  humidity: number; // %
}

interface ThermalLoad {
  zone: string;
  sensibleHeat: number; // kW
  latentHeat: number; // kW
  lightingLoad: number; // kW
  plantTranspiration: number; // L/hr
  currentTemp: number;
  targetTemp: number;
  deltaT: number;
}

interface AirflowPattern {
  id: string;
  name: string;
  type: 'laminar' | 'turbulent' | 'mixed' | 'directional';
  efficiency: number; // 0-100%
  uniformity: number; // 0-100%
  coverage: number; // 0-100%
  energyUse: number; // kW
  zones: {
    id: string;
    airChangesPerHour: number;
    velocity: number;
    direction: { x: number; y: number; z: number };
  }[];
}

interface MicroclimateZone {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  currentConditions: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    airVelocity: number;
  };
  targetConditions: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    airVelocity: number;
  };
  lightingIntensity: number; // PPFD
  plantDensity: number; // plants/m²
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
}

interface IntegrationStrategy {
  id: string;
  name: string;
  description: string;
  lightingSchedule: {
    hour: number;
    intensity: number; // 0-100%
    spectrum: string;
  }[];
  hvacResponse: {
    hour: number;
    coolingSetpoint: number;
    heatingSetpoint: number;
    fanSpeed: number; // 0-100%
    freshAirIntake: number; // 0-100%
  }[];
  expectedOutcomes: {
    energySavings: number; // %
    temperatureStability: number; // ±°C
    humidityStability: number; // ±%
    co2Efficiency: number; // %
  };
}

const mockThermalLoads: ThermalLoad[] = [
  {
    zone: 'Zone A - Flowering',
    sensibleHeat: 45.2,
    latentHeat: 12.3,
    lightingLoad: 38.5,
    plantTranspiration: 8.4,
    currentTemp: 25.2,
    targetTemp: 24.0,
    deltaT: 1.2
  },
  {
    zone: 'Zone B - Vegetative',
    sensibleHeat: 38.7,
    latentHeat: 15.1,
    lightingLoad: 32.0,
    plantTranspiration: 10.2,
    currentTemp: 26.1,
    targetTemp: 26.0,
    deltaT: 0.1
  },
  {
    zone: 'Zone C - Clone/Seedling',
    sensibleHeat: 22.4,
    latentHeat: 8.9,
    lightingLoad: 18.5,
    plantTranspiration: 5.1,
    currentTemp: 24.8,
    targetTemp: 25.0,
    deltaT: -0.2
  }
];

const mockMicroclimates: MicroclimateZone[] = [
  {
    id: 'mc-1',
    name: 'Canopy Top - Row 1',
    position: { x: 0, y: 0, z: 2.5 },
    size: { width: 3, height: 0.5, depth: 10 },
    currentConditions: {
      temperature: 26.5,
      humidity: 62,
      co2: 850,
      vpd: 1.35,
      airVelocity: 0.8
    },
    targetConditions: {
      temperature: 25.0,
      humidity: 65,
      co2: 900,
      vpd: 1.2,
      airVelocity: 1.0
    },
    lightingIntensity: 850,
    plantDensity: 16,
    growthStage: 'flowering'
  },
  {
    id: 'mc-2',
    name: 'Canopy Middle - Row 1',
    position: { x: 0, y: 0, z: 1.5 },
    size: { width: 3, height: 1, depth: 10 },
    currentConditions: {
      temperature: 24.8,
      humidity: 68,
      co2: 780,
      vpd: 0.95,
      airVelocity: 0.4
    },
    targetConditions: {
      temperature: 24.0,
      humidity: 65,
      co2: 900,
      vpd: 1.1,
      airVelocity: 0.6
    },
    lightingIntensity: 450,
    plantDensity: 16,
    growthStage: 'flowering'
  },
  {
    id: 'mc-3',
    name: 'Under Canopy - Row 1',
    position: { x: 0, y: 0, z: 0.5 },
    size: { width: 3, height: 0.5, depth: 10 },
    currentConditions: {
      temperature: 23.2,
      humidity: 72,
      co2: 720,
      vpd: 0.75,
      airVelocity: 0.2
    },
    targetConditions: {
      temperature: 23.0,
      humidity: 70,
      co2: 800,
      vpd: 0.8,
      airVelocity: 0.3
    },
    lightingIntensity: 150,
    plantDensity: 16,
    growthStage: 'flowering'
  }
];

export function AirflowLightingIntegration() {
  const [activeView, setActiveView] = useState<'overview' | 'thermal' | 'airflow' | 'microclimates' | 'strategies' | 'optimization'>('overview');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [thermalLoads, setThermalLoads] = useState<ThermalLoad[]>(mockThermalLoads);
  const [microclimates, setMicroclimates] = useState<MicroclimateZone[]>(mockMicroclimates);
  const [integrationMode, setIntegrationMode] = useState<'manual' | 'auto' | 'predictive'>('auto');
  const [showVectors, setShowVectors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  
  const [currentStrategy, setCurrentStrategy] = useState<IntegrationStrategy>({
    id: 'default',
    name: 'Adaptive Climate Control',
    description: 'Dynamically adjusts HVAC based on lighting heat load',
    lightingSchedule: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      intensity: hour >= 6 && hour < 18 ? 100 : 0,
      spectrum: 'full'
    })),
    hvacResponse: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      coolingSetpoint: hour >= 6 && hour < 18 ? 24 : 22,
      heatingSetpoint: 20,
      fanSpeed: hour >= 6 && hour < 18 ? 80 : 40,
      freshAirIntake: hour >= 6 && hour < 18 ? 30 : 15
    })),
    expectedOutcomes: {
      energySavings: 22,
      temperatureStability: 0.5,
      humidityStability: 3,
      co2Efficiency: 85
    }
  });

  // Calculate total system load
  const calculateSystemLoad = () => {
    const totalSensible = thermalLoads.reduce((sum, load) => sum + load.sensibleHeat, 0);
    const totalLatent = thermalLoads.reduce((sum, load) => sum + load.latentHeat, 0);
    const totalLighting = thermalLoads.reduce((sum, load) => sum + load.lightingLoad, 0);
    const totalTranspiration = thermalLoads.reduce((sum, load) => sum + load.plantTranspiration, 0);
    
    return {
      totalSensible,
      totalLatent,
      totalLighting,
      totalTranspiration,
      totalCoolingRequired: totalSensible + totalLatent,
      percentFromLighting: (totalLighting / (totalSensible + totalLatent)) * 100
    };
  };

  const systemLoad = calculateSystemLoad();

  // Generate airflow pattern data
  const generateAirflowGrid = () => {
    const grid = [];
    const gridSize = 10;
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Simulate airflow patterns
        const distanceFromFan = Math.sqrt(Math.pow(x - 2, 2) + Math.pow(y - 5, 2));
        const velocity = Math.max(0.2, 2.5 - distanceFromFan * 0.3) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.3;
        
        // Calculate direction based on obstacles and heat sources
        const angle = Math.atan2(y - 5, x - 2) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5;
        
        grid.push({
          x: x * 2,
          y: y * 2,
          velocity,
          direction: angle,
          temperature: 24 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3,
          humidity: 65 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10
        });
      }
    }
    
    return grid;
  };

  const airflowGrid = generateAirflowGrid();

  // Generate hourly integration data
  const generateHourlyData = () => {
    return Array.from({ length: 24 }, (_, hour) => {
      const lighting = currentStrategy.lightingSchedule[hour];
      const hvac = currentStrategy.hvacResponse[hour];
      
      return {
        hour,
        lightIntensity: lighting.intensity,
        heatLoad: (lighting.intensity / 100) * 45, // kW
        coolingDemand: (lighting.intensity / 100) * 38,
        fanSpeed: hvac.fanSpeed,
        temperature: hvac.coolingSetpoint + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.8,
        humidity: 65 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5,
        energyUse: ((lighting.intensity / 100) * 45) + (hvac.fanSpeed / 100) * 15
      };
    });
  };

  const hourlyData = generateHourlyData();

  // Calculate microclimate deviations
  const calculateDeviations = () => {
    return microclimates.map(mc => ({
      zone: mc.name,
      tempDeviation: mc.currentConditions.temperature - mc.targetConditions.temperature,
      humidityDeviation: mc.currentConditions.humidity - mc.targetConditions.humidity,
      co2Deviation: mc.currentConditions.co2 - mc.targetConditions.co2,
      vpdDeviation: mc.currentConditions.vpd - mc.targetConditions.vpd,
      score: 100 - Math.abs(mc.currentConditions.temperature - mc.targetConditions.temperature) * 10
                  - Math.abs(mc.currentConditions.humidity - mc.targetConditions.humidity) * 2
                  - Math.abs(mc.currentConditions.co2 - mc.targetConditions.co2) * 0.05
    }));
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMicroclimates(prev => prev.map(mc => ({
        ...mc,
        currentConditions: {
          ...mc.currentConditions,
          temperature: mc.currentConditions.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2,
          humidity: mc.currentConditions.humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1,
          co2: mc.currentConditions.co2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20,
          airVelocity: Math.max(0.1, mc.currentConditions.airVelocity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1)
        }
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getVectorColor = (velocity: number) => {
    if (velocity < 0.5) return '#3B82F6'; // Blue - low
    if (velocity < 1.0) return '#10B981'; // Green - optimal
    if (velocity < 1.5) return '#F59E0B'; // Yellow - high
    return '#EF4444'; // Red - too high
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 22) return '#3B82F6'; // Blue - cool
    if (temp < 24) return '#10B981'; // Green - optimal
    if (temp < 26) return '#F59E0B'; // Yellow - warm
    return '#EF4444'; // Red - hot
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wind className="w-8 h-8 text-cyan-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Airflow-Lighting Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Optimize climate control with intelligent HVAC-lighting coordination
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={integrationMode}
            onChange={(e) => setIntegrationMode(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="manual">Manual Control</option>
            <option value="auto">Auto-Adjust</option>
            <option value="predictive">Predictive AI</option>
          </select>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Heat Load</span>
            <Thermometer className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {systemLoad.totalCoolingRequired.toFixed(1)} kW
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {systemLoad.percentFromLighting.toFixed(0)}% from lighting
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Transpiration Rate</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {systemLoad.totalTranspiration.toFixed(1)} L/hr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Plant moisture load
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Air Circulation</span>
            <Wind className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            12.5 ACH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Air changes/hour
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Energy Efficiency</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStrategy.expectedOutcomes.energySavings}%
          </p>
          <p className="text-xs text-green-500 mt-1">
            vs. independent control
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'thermal', label: 'Thermal Loads', icon: Thermometer },
          { id: 'airflow', label: 'Airflow Patterns', icon: Wind },
          { id: 'microclimates', label: 'Microclimates', icon: Cloud },
          { id: 'strategies', label: 'Control Strategies', icon: GitBranch },
          { id: 'optimization', label: 'Optimization', icon: Target }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Views */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Hourly Integration Chart */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              24-Hour Light-HVAC Coordination
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: '#6B7280' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Intensity/Speed (%)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Heat Load (kW)', angle: 90, position: 'insideRight', fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="lightIntensity" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Light Intensity"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="heatLoad" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Heat Load"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="fanSpeed" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Fan Speed"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* System Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Integration Benefits
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Energy Savings</span>
                    <span className="font-medium text-green-600">{currentStrategy.expectedOutcomes.energySavings}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${currentStrategy.expectedOutcomes.energySavings}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Temperature Stability</span>
                    <span className="font-medium text-blue-600">±{currentStrategy.expectedOutcomes.temperatureStability}°C</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${100 - currentStrategy.expectedOutcomes.temperatureStability * 20}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">CO₂ Efficiency</span>
                    <span className="font-medium text-purple-600">{currentStrategy.expectedOutcomes.co2Efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${currentStrategy.expectedOutcomes.co2Efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Real-Time Status
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Lighting-HVAC Sync', status: 'active', icon: CheckCircle },
                  { label: 'Predictive Cooling', status: 'active', icon: CheckCircle },
                  { label: 'Zone Balancing', status: 'warning', icon: AlertTriangle },
                  { label: 'Energy Recovery', status: 'active', icon: CheckCircle },
                  { label: 'Dehumidification', status: 'active', icon: CheckCircle }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <item.icon className={`w-4 h-4 ${
                      item.status === 'active' ? 'text-green-500' :
                      item.status === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Optimization Recommendations
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Consider reducing fan speed by 10% during lights-off to save 2.4 kW while maintaining adequate circulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Pre-cool facility 30 minutes before lights-on to reduce peak cooling demand</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Zone C shows excess airflow - redirect 15% to Zone A for better heat removal</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeView === 'thermal' && (
        <div className="space-y-6">
          {/* Thermal Load Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Heat Load by Zone
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={thermalLoads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="zone" tick={{ fill: '#6B7280', fontSize: 12 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: '#6B7280' }} label={{ value: 'Heat Load (kW)', angle: -90, position: 'insideLeft', fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Legend />
                  <Bar dataKey="sensibleHeat" stackId="a" fill="#EF4444" name="Sensible Heat" />
                  <Bar dataKey="latentHeat" stackId="a" fill="#3B82F6" name="Latent Heat" />
                  <Bar dataKey="lightingLoad" stackId="a" fill="#F59E0B" name="Lighting Load" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Temperature Differentials
              </h3>
              <div className="space-y-3">
                {thermalLoads.map((load, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{load.zone}</span>
                      <span className={`text-sm font-medium ${
                        Math.abs(load.deltaT) < 0.5 ? 'text-green-600' :
                        Math.abs(load.deltaT) < 1.0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {load.deltaT > 0 ? '+' : ''}{load.deltaT.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{load.currentTemp}°C</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{load.targetTemp}°C</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Transpiration: {load.plantTranspiration} L/hr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heat Management Strategy */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Heat Management Insights
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-800 dark:text-yellow-200">
              <div>
                <p className="font-medium mb-1">Lighting Contribution</p>
                <p>{systemLoad.percentFromLighting.toFixed(0)}% of total heat load comes from grow lights</p>
              </div>
              <div>
                <p className="font-medium mb-1">Peak Load Timing</p>
                <p>Maximum cooling demand occurs 2-3 hours after lights-on</p>
              </div>
              <div>
                <p className="font-medium mb-1">Moisture Management</p>
                <p>{systemLoad.totalTranspiration.toFixed(1)} L/hr requires active dehumidification</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'airflow' && (
        <div className="space-y-6">
          {/* Airflow Visualization Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Airflow Pattern Visualization
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="rounded text-cyan-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Vectors</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded text-cyan-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Heatmap</span>
              </label>
            </div>
          </div>

          {/* Airflow Grid Visualization */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="relative" style={{ paddingBottom: '60%' }}>
              <div className="absolute inset-0">
                {/* Background heatmap */}
                {showHeatmap && (
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                    {airflowGrid.map((point, idx) => (
                      <div
                        key={idx}
                        className="relative"
                        style={{
                          backgroundColor: getTemperatureColor(point.temperature),
                          opacity: 0.3
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Airflow vectors */}
                {showVectors && airflowGrid.filter((_, idx) => idx % 4 === 0).map((point, idx) => (
                  <div
                    key={idx}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: `${(point.x / 20) * 100}%`,
                      top: `${(point.y / 20) * 100}%`,
                      transform: `rotate(${point.direction}rad)`
                    }}
                  >
                    <ArrowRight 
                      className="w-6 h-6"
                      style={{ 
                        color: getVectorColor(point.velocity),
                        strokeWidth: Math.min(3, point.velocity + 1)
                      }}
                    />
                  </div>
                ))}
                
                {/* Equipment positions */}
                <div className="absolute top-4 left-8 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                  Fan Unit 1
                </div>
                <div className="absolute bottom-4 right-8 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                  Return Air
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Air Velocity</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-xs">Optimal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded" />
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span className="text-xs">Excessive</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average velocity: 0.8 m/s
              </div>
            </div>
          </div>

          {/* Airflow Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-cyan-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">Flow Uniformity</h4>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">78%</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: &gt;85%</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">Pressure Drop</h4>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">125 Pa</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Across grow space</p>
              <p className="text-xs text-green-500 mt-1">Within optimal range</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-5 h-5 text-green-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">Filter Status</h4>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">72%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining life</p>
              <p className="text-xs text-yellow-500 mt-1">Replace in 28 days</p>
            </div>
          </div>
        </div>
      )}

      {activeView === 'microclimates' && (
        <div className="space-y-6">
          {/* Microclimate Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {microclimates.map((mc) => (
              <div key={mc.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{mc.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mc.growthStage === 'flowering' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    mc.growthStage === 'vegetative' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {mc.growthStage}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Temperature */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                      <Thermometer className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {mc.currentConditions.temperature.toFixed(1)}°C
                      </span>
                      <span className="text-sm text-gray-500">
                        / {mc.targetConditions.temperature}°C
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      Math.abs(mc.currentConditions.temperature - mc.targetConditions.temperature) < 0.5 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`}>
                      {mc.currentConditions.temperature > mc.targetConditions.temperature ? '+' : ''}
                      {(mc.currentConditions.temperature - mc.targetConditions.temperature).toFixed(1)}°C
                    </div>
                  </div>
                  
                  {/* Humidity */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                      <Droplets className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {mc.currentConditions.humidity.toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        / {mc.targetConditions.humidity}%
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      Math.abs(mc.currentConditions.humidity - mc.targetConditions.humidity) < 3 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`}>
                      {mc.currentConditions.humidity > mc.targetConditions.humidity ? '+' : ''}
                      {(mc.currentConditions.humidity - mc.targetConditions.humidity).toFixed(0)}%
                    </div>
                  </div>
                  
                  {/* VPD */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">VPD</span>
                      <Gauge className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {mc.currentConditions.vpd.toFixed(2)} kPa
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      Math.abs(mc.currentConditions.vpd - mc.targetConditions.vpd) < 0.1 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`}>
                      Target: {mc.targetConditions.vpd} kPa
                    </div>
                  </div>
                  
                  {/* Air Velocity */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Air Velocity</span>
                      <Wind className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {mc.currentConditions.airVelocity.toFixed(1)} m/s
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      mc.currentConditions.airVelocity >= mc.targetConditions.airVelocity * 0.8 &&
                      mc.currentConditions.airVelocity <= mc.targetConditions.airVelocity * 1.2
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`}>
                      Target: {mc.targetConditions.airVelocity} m/s
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Light Intensity</span>
                    <span className="font-medium text-gray-900 dark:text-white">{mc.lightingIntensity} μmol</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600 dark:text-gray-400">CO₂ Level</span>
                    <span className="font-medium text-gray-900 dark:text-white">{mc.currentConditions.co2} ppm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Microclimate Performance Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Microclimate Deviations
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={calculateDeviations()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="zone" tick={{ fill: '#6B7280', fontSize: 11 }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Bar dataKey="tempDeviation" fill="#EF4444" name="Temp (°C)" />
                <Bar dataKey="humidityDeviation" fill="#3B82F6" name="RH (%)" />
                <Bar dataKey="vpdDeviation" fill="#8B5CF6" name="VPD (kPa)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeView === 'strategies' && (
        <div className="space-y-6">
          {/* Current Strategy Details */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Control Strategy: {currentStrategy.name}
              </h3>
              <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">
                Edit Strategy
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{currentStrategy.description}</p>
            
            {/* Strategy Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Lighting Schedule</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentStrategy.lightingSchedule.filter((_, idx) => idx % 2 === 0).map((schedule, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded px-3 py-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {schedule.hour}:00 - {schedule.hour + 2}:00
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{schedule.intensity}%</span>
                        </div>
                        <span className="text-xs text-gray-500">{schedule.spectrum}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">HVAC Response</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentStrategy.hvacResponse.filter((_, idx) => idx % 2 === 0).map((response, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded px-3 py-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {response.hour}:00 - {response.hour + 2}:00
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">{response.coolingSetpoint}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fan className="w-4 h-4 text-cyan-500" />
                          <span className="text-sm font-medium">{response.fanSpeed}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pre-defined Strategies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Control Strategies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'Energy Saver',
                  description: 'Minimizes energy use while maintaining acceptable conditions',
                  savings: 28,
                  stability: 1.0,
                  icon: Zap,
                  color: 'green'
                },
                {
                  name: 'Precision Control',
                  description: 'Maintains tight environmental parameters for sensitive crops',
                  savings: 15,
                  stability: 0.3,
                  icon: Target,
                  color: 'blue'
                },
                {
                  name: 'High Transpiration',
                  description: 'Optimized for crops with high moisture output',
                  savings: 18,
                  stability: 0.5,
                  icon: Droplets,
                  color: 'cyan'
                },
                {
                  name: 'Peak Shaving',
                  description: 'Reduces energy use during peak demand periods',
                  savings: 35,
                  stability: 0.8,
                  icon: TrendingDown,
                  color: 'purple'
                }
              ].map((strategy, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <strategy.icon className={`w-6 h-6 text-${strategy.color}-500`} />
                      <h4 className="font-medium text-gray-900 dark:text-white">{strategy.name}</h4>
                    </div>
                    <button className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm">
                      Apply
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{strategy.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Energy Savings</span>
                      <p className="font-medium text-green-600">{strategy.savings}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Temp Stability</span>
                      <p className="font-medium text-blue-600">±{strategy.stability}°C</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'optimization' && (
        <div className="space-y-6">
          {/* Optimization Goals */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Optimization Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Performance</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={[
                    { name: 'Energy Efficiency', value: 78, fill: '#10B981' },
                    { name: 'Climate Stability', value: 85, fill: '#3B82F6' },
                    { name: 'Uniformity', value: 72, fill: '#8B5CF6' },
                    { name: 'CO₂ Utilization', value: 88, fill: '#F59E0B' }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis type="number" domain={[0, 100]} />
                    <RadialBar dataKey="value" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Optimization Priorities</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Energy Efficiency', weight: 35, icon: Zap },
                    { label: 'Temperature Uniformity', weight: 25, icon: Thermometer },
                    { label: 'Humidity Control', weight: 20, icon: Droplets },
                    { label: 'Air Quality', weight: 20, icon: Wind }
                  ].map((priority, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <priority.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{priority.label}</span>
                        </div>
                        <span className="font-medium">{priority.weight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={priority.weight}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        onChange={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-green-900 dark:text-green-100">
                AI-Powered Optimization Recommendations
              </h4>
            </div>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <CircuitBoard className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Implement Variable Air Volume (VAV) Control
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Reduce Zone A airflow by 20% during lights-off while increasing Zone C by 15%
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-green-600">Savings: 3.2 kW</span>
                      <span className="text-blue-600">Impact: Minimal</span>
                      <button className="text-cyan-600 hover:text-cyan-700">Apply Now</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Predictive Pre-cooling Algorithm
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Start cooling 45 minutes before lights-on to reduce peak load by 18%
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-green-600">Savings: 5.8 kW peak</span>
                      <span className="text-blue-600">Impact: Moderate</span>
                      <button className="text-cyan-600 hover:text-cyan-700">Schedule</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}