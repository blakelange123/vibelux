'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Settings,
  Brain,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  Sun,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Calendar,
  Eye,
  Layers,
  Cpu,
  Database,
  Network,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Save,
  Share,
  Copy,
  Grid3x3,
  Move3d,
  Lightbulb,
  Package,
  Factory,
  Users,
  DollarSign,
  Microscope,
  FlaskConical,
  GitBranch,
  CloudRain,
  Bug,
  Shield,
  Calculator,
  FileText,
  Camera,
  Info,
  XCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DigitalTwinEnhancements } from './DigitalTwinEnhancements';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  parameters: {
    lighting: {
      schedule: string;
      intensity: number;
      spectrum: string;
    };
    climate: {
      temperature: [number, number]; // day/night
      humidity: [number, number];
      co2: number;
      airflow: number;
    };
    irrigation: {
      frequency: string;
      volume: number;
      ec: number;
      ph: number;
    };
    strain: {
      name: string;
      genetics: string;
      flowering_time: number;
    };
  };
  expectedOutcome: {
    yield: number;
    quality: number;
    energyCost: number;
    timeToHarvest: number;
  };
}

interface SimulationResult {
  id: string;
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentDay: number;
  metrics: {
    yield: number;
    quality: number;
    energyUsed: number;
    waterUsed: number;
    nutrientCost: number;
    laborHours: number;
    totalCost: number;
    roi: number;
  };
  timeline: Array<{
    day: number;
    events: string[];
    metrics: Record<string, number>;
  }>;
}

interface EnvironmentalData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  ppfd: number;
  vpd: number;
  dli: number;
  ph: number;
  ec: number;
  soilMoisture: number;
}

export function DigitalTwinSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario-1');
  const [selectedView, setSelectedView] = useState<'setup' | 'running' | 'results' | 'compare' | 'advanced'>('setup');
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [showEnhancements, setShowEnhancements] = useState(false);

  const [scenarios] = useState<SimulationScenario[]>([
    {
      id: 'scenario-1',
      name: 'High-Yield Optimization',
      description: 'Maximize yield while maintaining quality standards',
      duration: 70,
      parameters: {
        lighting: {
          schedule: '18/6 veg, 12/12 flower',
          intensity: 1000,
          spectrum: 'Full spectrum with enhanced red'
        },
        climate: {
          temperature: [26, 22],
          humidity: [60, 50],
          co2: 1200,
          airflow: 0.8
        },
        irrigation: {
          frequency: 'Every 2 days',
          volume: 1.5,
          ec: 1.8,
          ph: 6.2
        },
        strain: {
          name: 'OG Kush',
          genetics: 'Indica dominant hybrid',
          flowering_time: 56
        }
      },
      expectedOutcome: {
        yield: 52.3,
        quality: 91.2,
        energyCost: 1.42,
        timeToHarvest: 70
      }
    },
    {
      id: 'scenario-2',
      name: 'Energy Efficiency Focus',
      description: 'Minimize energy consumption while maintaining acceptable yields',
      duration: 75,
      parameters: {
        lighting: {
          schedule: '18/6 veg, 12/12 flower',
          intensity: 750,
          spectrum: 'LED efficiency optimized'
        },
        climate: {
          temperature: [24, 20],
          humidity: [65, 55],
          co2: 800,
          airflow: 0.6
        },
        irrigation: {
          frequency: 'Every 3 days',
          volume: 1.2,
          ec: 1.6,
          ph: 6.0
        },
        strain: {
          name: 'Green Crack',
          genetics: 'Sativa dominant',
          flowering_time: 63
        }
      },
      expectedOutcome: {
        yield: 43.7,
        quality: 87.8,
        energyCost: 0.89,
        timeToHarvest: 75
      }
    },
    {
      id: 'scenario-3',
      name: 'Premium Quality Focus',
      description: 'Optimize for maximum cannabinoid and terpene production',
      duration: 84,
      parameters: {
        lighting: {
          schedule: '18/6 veg, 11/13 flower',
          intensity: 900,
          spectrum: 'UV-B enhanced spectrum'
        },
        climate: {
          temperature: [25, 18],
          humidity: [55, 45],
          co2: 1400,
          airflow: 1.0
        },
        irrigation: {
          frequency: 'Daily precision',
          volume: 1.0,
          ec: 2.0,
          ph: 6.5
        },
        strain: {
          name: 'Purple Haze',
          genetics: 'Sativa dominant',
          flowering_time: 70
        }
      },
      expectedOutcome: {
        yield: 38.9,
        quality: 96.4,
        energyCost: 1.78,
        timeToHarvest: 84
      }
    }
  ]);

  const [results, setResults] = useState<SimulationResult[]>([
    {
      id: 'result-1',
      scenarioId: 'scenario-1',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 30 * 60 * 1000),
      status: 'completed',
      progress: 100,
      currentDay: 70,
      metrics: {
        yield: 51.8,
        quality: 92.1,
        energyUsed: 2847,
        waterUsed: 425,
        nutrientCost: 342,
        laborHours: 89,
        totalCost: 1284,
        roi: 247
      },
      timeline: [
        {
          day: 1,
          events: ['Seedlings planted', 'Irrigation system activated'],
          metrics: { height: 2.1, leaf_count: 4 }
        },
        {
          day: 14,
          events: ['Vegetative growth phase', 'First training session'],
          metrics: { height: 12.3, leaf_count: 18 }
        },
        {
          day: 28,
          events: ['Switched to flower lighting', 'Nutrient formula adjusted'],
          metrics: { height: 28.7, bud_sites: 12 }
        }
      ]
    }
  ]);

  const [realTimeData, setRealTimeData] = useState<EnvironmentalData>({
    timestamp: new Date(),
    temperature: 24.3,
    humidity: 58.2,
    co2: 1150,
    ppfd: 875,
    vpd: 0.82,
    dli: 42.3,
    ph: 6.1,
    ec: 1.7,
    soilMoisture: 68
  });

  useEffect(() => {
    if (isSimulating && currentResult) {
      const interval = setInterval(() => {
        setCurrentResult(prev => {
          if (!prev) return prev;
          
          const newProgress = Math.min(100, prev.progress + (simulationSpeed * 0.5));
          const newDay = Math.floor((newProgress / 100) * scenarios.find(s => s.id === prev.scenarioId)!.duration);
          
          return {
            ...prev,
            progress: newProgress,
            currentDay: newDay,
            metrics: {
              ...prev.metrics,
              yield: prev.metrics.yield + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1,
              quality: prev.metrics.quality + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2,
              energyUsed: prev.metrics.energyUsed + simulationSpeed * 2.3,
              waterUsed: prev.metrics.waterUsed + simulationSpeed * 0.8
            }
          };
        });

        // Update real-time environmental data
        setRealTimeData(prev => ({
          ...prev,
          timestamp: new Date(),
          temperature: 24.3 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2,
          humidity: 58.2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5,
          co2: 1150 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100,
          ppfd: 875 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50,
          vpd: 0.82 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulating, simulationSpeed, currentResult]);

  const startSimulation = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    const newResult: SimulationResult = {
      id: `result-${Date.now()}`,
      scenarioId: selectedScenario,
      startTime: new Date(),
      status: 'running',
      progress: 0,
      currentDay: 0,
      metrics: {
        yield: 0,
        quality: 0,
        energyUsed: 0,
        waterUsed: 0,
        nutrientCost: 0,
        laborHours: 0,
        totalCost: 0,
        roi: 0
      },
      timeline: []
    };

    setCurrentResult(newResult);
    setIsSimulating(true);
    setSelectedView('running');
  };

  const pauseSimulation = () => {
    setIsSimulating(!isSimulating);
    if (currentResult) {
      setCurrentResult(prev => prev ? {
        ...prev,
        status: isSimulating ? 'paused' : 'running'
      } : null);
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentResult(null);
    setSelectedView('setup');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getScenario = (id: string) => scenarios.find(s => s.id === id);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Layers className="w-8 h-8 text-blue-400" />
              Digital Twin Simulator
            </h1>
            <p className="text-gray-400">Virtual cultivation environment for testing and optimization</p>
          </div>
          
          <div className="flex items-center gap-3">
            {currentResult && (
              <>
                <div className="px-4 py-2 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="text-lg font-bold text-blue-400">{currentResult.progress.toFixed(1)}%</div>
                </div>
                
                <div className="px-4 py-2 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Day</div>
                  <div className="text-lg font-bold text-white">{currentResult.currentDay}</div>
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2">
              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
              
              <button
                onClick={isSimulating ? pauseSimulation : currentResult ? pauseSimulation : startSimulation}
                className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  isSimulating 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : currentResult 
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : currentResult ? (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* View Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'setup', label: 'Setup', icon: Settings },
            { id: 'running', label: 'Live Simulation', icon: Activity },
            { id: 'results', label: 'Results', icon: BarChart3 },
            { id: 'compare', label: 'Compare', icon: Target },
            { id: 'advanced', label: 'Advanced', icon: Brain }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedView === view.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>

        {/* Setup View */}
        {selectedView === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Selection */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Choose Simulation Scenario</h2>
                
                <div className="space-y-4">
                  {scenarios.map(scenario => (
                    <div 
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedScenario === scenario.id 
                          ? 'bg-blue-600/20 border-blue-500' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{scenario.name}</h3>
                        <span className="text-sm text-gray-400">{scenario.duration} days</span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>
                      
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        <div className="p-2 bg-gray-700 rounded">
                          <div className="text-gray-400">Expected Yield</div>
                          <div className="font-semibold text-green-400">{scenario.expectedOutcome.yield}g</div>
                        </div>
                        <div className="p-2 bg-gray-700 rounded">
                          <div className="text-gray-400">Quality Score</div>
                          <div className="font-semibold text-blue-400">{scenario.expectedOutcome.quality}%</div>
                        </div>
                        <div className="p-2 bg-gray-700 rounded">
                          <div className="text-gray-400">Energy Cost</div>
                          <div className="font-semibold text-yellow-400">${scenario.expectedOutcome.energyCost}/g</div>
                        </div>
                        <div className="p-2 bg-gray-700 rounded">
                          <div className="text-gray-400">Time to Harvest</div>
                          <div className="font-semibold text-purple-400">{scenario.expectedOutcome.timeToHarvest}d</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scenario Details */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Scenario Details</h2>
              
              {selectedScenario && (
                <div className="space-y-4">
                  {(() => {
                    const scenario = getScenario(selectedScenario);
                    if (!scenario) return null;
                    
                    return (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Lighting
                          </h3>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Schedule: {scenario.parameters.lighting.schedule}</div>
                            <div>Intensity: {scenario.parameters.lighting.intensity} PPFD</div>
                            <div>Spectrum: {scenario.parameters.lighting.spectrum}</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Climate
                          </h3>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Temperature: {scenario.parameters.climate.temperature[0]}°C day / {scenario.parameters.climate.temperature[1]}°C night</div>
                            <div>Humidity: {scenario.parameters.climate.humidity[0]}% day / {scenario.parameters.climate.humidity[1]}% night</div>
                            <div>CO₂: {scenario.parameters.climate.co2} ppm</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Irrigation
                          </h3>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Frequency: {scenario.parameters.irrigation.frequency}</div>
                            <div>Volume: {scenario.parameters.irrigation.volume}L per plant</div>
                            <div>EC: {scenario.parameters.irrigation.ec} mS/cm</div>
                            <div>pH: {scenario.parameters.irrigation.ph}</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Leaf className="w-4 h-4" />
                            Strain
                          </h3>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Name: {scenario.parameters.strain.name}</div>
                            <div>Genetics: {scenario.parameters.strain.genetics}</div>
                            <div>Flowering: {scenario.parameters.strain.flowering_time} days</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Running Simulation View */}
        {selectedView === 'running' && currentResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time Metrics */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Real-time Environment</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-400">Live Simulation</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-400">Temperature</span>
                    </div>
                    <div className="text-xl font-bold text-white">{realTimeData.temperature.toFixed(1)}°C</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Humidity</span>
                    </div>
                    <div className="text-xl font-bold text-white">{realTimeData.humidity.toFixed(1)}%</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">CO₂</span>
                    </div>
                    <div className="text-xl font-bold text-white">{realTimeData.co2.toFixed(0)} ppm</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">PPFD</span>
                    </div>
                    <div className="text-xl font-bold text-white">{realTimeData.ppfd.toFixed(0)}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">VPD</span>
                    </div>
                    <div className="text-xl font-bold text-white">{realTimeData.vpd.toFixed(2)}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">DLI</span>
                    </div>
                    <div className="text-xl font-bold text-white">{realTimeData.dli.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              {/* Progress and Controls */}
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Simulation Progress</h2>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Speed:</label>
                    <select
                      value={simulationSpeed}
                      onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={5}>5x</option>
                      <option value={10}>10x</option>
                    </select>
                  </div>
                </div>
                
                <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all flex items-center justify-center"
                    style={{ width: `${currentResult.progress}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {currentResult.progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Current Day</div>
                    <div className="font-semibold text-white">{currentResult.currentDay}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className={`font-semibold ${
                      currentResult.status === 'running' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {currentResult.status.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Time Elapsed</div>
                    <div className="font-semibold text-white">
                      {Math.floor((Date.now() - currentResult.startTime.getTime()) / 60000)}m
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Est. Completion</div>
                    <div className="font-semibold text-white">
                      {Math.floor((100 - currentResult.progress) / simulationSpeed)}m
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Metrics */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Current Metrics</h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Projected Yield</div>
                  <div className="text-lg font-bold text-green-400">{currentResult.metrics.yield.toFixed(1)}g</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Quality Score</div>
                  <div className="text-lg font-bold text-blue-400">{currentResult.metrics.quality.toFixed(1)}%</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Energy Used</div>
                  <div className="text-lg font-bold text-yellow-400">{currentResult.metrics.energyUsed.toFixed(0)} kWh</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Water Used</div>
                  <div className="text-lg font-bold text-cyan-400">{currentResult.metrics.waterUsed.toFixed(0)} L</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Total Cost</div>
                  <div className="text-lg font-bold text-red-400">{formatCurrency(currentResult.metrics.totalCost)}</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Projected ROI</div>
                  <div className="text-lg font-bold text-purple-400">{currentResult.metrics.roi.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {selectedView === 'results' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map(result => {
              const scenario = getScenario(result.scenarioId);
              if (!scenario) return null;
              
              return (
                <div key={result.id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{scenario.name}</h3>
                      <p className="text-sm text-gray-400">
                        Completed: {result.endTime?.toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      result.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Final Yield</div>
                      <div className="text-lg font-bold text-green-400">{result.metrics.yield.toFixed(1)}g</div>
                      <div className="text-xs text-gray-500">
                        vs predicted: {scenario.expectedOutcome.yield}g
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Quality Score</div>
                      <div className="text-lg font-bold text-blue-400">{result.metrics.quality.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">
                        vs predicted: {scenario.expectedOutcome.quality}%
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Total Energy</div>
                      <div className="text-lg font-bold text-yellow-400">{result.metrics.energyUsed.toFixed(0)} kWh</div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">ROI</div>
                      <div className="text-lg font-bold text-purple-400">{result.metrics.roi.toFixed(0)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all">
                      Export Data
                    </button>
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all">
                      Clone Scenario
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compare View */}
        {selectedView === 'compare' && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Scenario Comparison</h2>
            <p className="text-gray-400">Compare multiple simulation results side by side to identify optimal growing conditions.</p>
            {/* Comparison functionality would go here */}
          </div>
        )}

        {/* Advanced View */}
        {selectedView === 'advanced' && (
          <div>
            <DigitalTwinEnhancements />
          </div>
        )}

        {/* Status Display */}
        <div className="fixed bottom-6 left-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {isSimulating ? 'Simulation Active' : 'Simulation Idle'}
              </span>
            </div>
            {currentResult && (
              <div className="text-sm text-gray-500">
                Day {currentResult.currentDay} • {currentResult.progress.toFixed(0)}% complete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}