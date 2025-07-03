'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Brain,
  Database,
  Cpu,
  BarChart3,
  Clock,
  Target,
  Gauge
} from 'lucide-react';
import { Line, Area } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  AreaElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { GreenhouseDigitalTwin, DigitalTwinState, SensorReading } from '../../lib/digital-twin/greenhouse-digital-twin';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  AreaElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DigitalTwinDashboardProps {
  digitalTwin?: GreenhouseDigitalTwin;
  className?: string;
}

export default function DigitalTwinDashboard({ digitalTwin, className = '' }: DigitalTwinDashboardProps) {
  const [currentState, setCurrentState] = useState<DigitalTwinState | null>(null);
  const [historicalData, setHistoricalData] = useState<DigitalTwinState[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'sensors' | 'predictions' | 'virtual'>('overview');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Initialize digital twin if not provided
  const twin = useMemo(() => digitalTwin || new GreenhouseDigitalTwin(), [digitalTwin]);

  useEffect(() => {
    // Set up event listeners
    const handleStateUpdate = (state: DigitalTwinState) => {
      setCurrentState(state);
      setHistoricalData(prev => {
        const newData = [...prev, state];
        // Keep last 100 data points
        return newData.slice(-100);
      });
    };

    const handleAnomaly = (anomaly: any) => {
      setAnomalies(prev => [anomaly, ...prev.slice(0, 9)]); // Keep last 10 anomalies
    };

    const handleRecommendation = (recommendation: any) => {
      setRecommendations(prev => [recommendation, ...prev.slice(0, 4)]); // Keep last 5 recommendations
    };

    twin.onStateUpdate(handleStateUpdate);
    twin.onAnomaly(handleAnomaly);
    twin.onRecommendation(handleRecommendation);

    // Get initial state
    setCurrentState(twin.getCurrentState());

    // Simulate some sensor data for demo
    const simulateData = () => {
      if (!isRealTimeEnabled) return;
      
      const mockSensorReading: SensorReading = {
        sensorId: `sensor_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        sensorType: ['temperature', 'humidity', 'co2', 'light'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4)] as any,
        value: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
        unit: '°C',
        timestamp: new Date(),
        location: { zone: 'A1', x: 1, y: 1, z: 1 },
        quality: 'good',
        calibration: {
          lastCalibrated: new Date(),
          nextCalibration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          accuracy: 0.95
        }
      };
      
      twin.addSensorReading(mockSensorReading);
    };

    const dataInterval = setInterval(simulateData, 5000); // Every 5 seconds

    return () => {
      clearInterval(dataInterval);
      twin.cleanup();
    };
  }, [twin, isRealTimeEnabled]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF'
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151'
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  const getParameterChart = (parameter: string, color: string) => {
    const data = historicalData.slice(-20).map((state, index) => ({
      x: index,
      real: (state.realTime as any)[parameter] || 0,
      predicted: (state.predicted as any)[parameter] || 0,
      virtual: (state.virtual as any)[parameter] || 0
    }));

    return {
      labels: data.map((_, i) => `T-${20-i}`),
      datasets: [
        {
          label: 'Real',
          data: data.map(d => d.real),
          borderColor: color,
          backgroundColor: `${color}20`,
          fill: false,
          tension: 0.3
        },
        {
          label: 'Predicted',
          data: data.map(d => d.predicted),
          borderColor: `${color}80`,
          backgroundColor: `${color}10`,
          fill: false,
          tension: 0.3,
          borderDash: [5, 5]
        },
        {
          label: 'Virtual',
          data: data.map(d => d.virtual),
          borderColor: `${color}60`,
          backgroundColor: `${color}05`,
          fill: false,
          tension: 0.3,
          borderDash: [2, 2]
        }
      ]
    };
  };

  const renderMetricCard = (title: string, value: number, unit: string, icon: React.ReactNode, color: string, trend?: number) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 rounded-xl p-4 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">
        {value.toFixed(1)}<span className="text-sm text-gray-400 ml-1">{unit}</span>
      </p>
    </motion.div>
  );

  if (!currentState) {
    return (
      <div className={`bg-gray-900 rounded-xl p-8 ${className}`}>
        <div className="text-center">
          <Cpu className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Initializing Digital Twin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Greenhouse Digital Twin</h2>
              <p className="text-sm text-gray-400">Real-time AI-powered greenhouse simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isRealTimeEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isRealTimeEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'sensors', label: 'Sensors', icon: Activity },
            { id: 'predictions', label: 'Predictions', icon: Target },
            { id: 'virtual', label: 'Virtual Lab', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Environment Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderMetricCard(
                  'Temperature',
                  currentState.realTime.temperature,
                  '°C',
                  <Thermometer className="w-5 h-5 text-red-400" />,
                  'red'
                )}
                {renderMetricCard(
                  'Humidity',
                  currentState.realTime.humidity,
                  '%',
                  <Droplets className="w-5 h-5 text-blue-400" />,
                  'blue'
                )}
                {renderMetricCard(
                  'CO₂ Level',
                  currentState.realTime.co2Level,
                  'ppm',
                  <Wind className="w-5 h-5 text-green-400" />,
                  'green'
                )}
                {renderMetricCard(
                  'Light Intensity',
                  currentState.realTime.lightIntensity,
                  'PPFD',
                  <Sun className="w-5 h-5 text-yellow-400" />,
                  'yellow'
                )}
              </div>

              {/* Plant Health Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-400" />
                    Plant Health Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Health Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${currentState.plantMetrics.healthScore}%` }}
                          />
                        </div>
                        <span className="text-white font-medium">{currentState.plantMetrics.healthScore.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Growth Rate</span>
                      <span className="text-white font-medium">{currentState.plantMetrics.growthRate.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Stress Level</span>
                      <span className={`font-medium ${currentState.plantMetrics.stressLevel < 0.3 ? 'text-green-400' : 'text-red-400'}`}>
                        {(currentState.plantMetrics.stressLevel * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Yield Prediction</span>
                      <span className="text-white font-medium">{currentState.plantMetrics.yieldPrediction.toFixed(0)}g</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    System Performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Energy Efficiency</span>
                      <span className="text-white font-medium">{(currentState.systemPerformance.efficiency * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Energy Usage</span>
                      <span className="text-white font-medium">{currentState.systemPerformance.energyConsumption.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Water Usage</span>
                      <span className="text-white font-medium">{currentState.systemPerformance.waterUsage.toFixed(1)} L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">CO₂ Usage</span>
                      <span className="text-white font-medium">{currentState.systemPerformance.co2Usage.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Anomalies & Recommendations */}
              {(anomalies.length > 0 || recommendations.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {anomalies.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Recent Anomalies
                      </h3>
                      <div className="space-y-2">
                        {anomalies.slice(0, 3).map((anomaly, index) => (
                          <div key={index} className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-red-400 font-medium">{anomaly.type}</span>
                              <span className="text-xs text-gray-400">{anomaly.data?.timestamp?.toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-gray-300">{anomaly.data?.sensorType}: {anomaly.data?.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-400" />
                        AI Recommendations
                      </h3>
                      <div className="space-y-2">
                        {recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-blue-400 font-medium">Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-sm text-gray-300">{rec.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {selectedView === 'sensors' && (
            <motion.div
              key="sensors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Temperature</h3>
                <div className="h-64">
                  <Line data={getParameterChart('temperature', '#EF4444')} options={chartOptions} />
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Humidity</h3>
                <div className="h-64">
                  <Line data={getParameterChart('humidity', '#3B82F6')} options={chartOptions} />
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">CO₂ Level</h3>
                <div className="h-64">
                  <Line data={getParameterChart('co2Level', '#10B981')} options={chartOptions} />
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Light Intensity</h3>
                <div className="h-64">
                  <Line data={getParameterChart('lightIntensity', '#F59E0B')} options={chartOptions} />
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  24-Hour Predictions
                </h3>
                <p className="text-gray-400 text-sm mb-4">AI-powered predictions based on current conditions and learned patterns</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Temperature Range</h4>
                    <p className="text-2xl font-bold text-red-400">22-26°C</p>
                    <p className="text-xs text-gray-400">Expected fluctuation</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Growth Rate</h4>
                    <p className="text-2xl font-bold text-green-400">+0.8</p>
                    <p className="text-xs text-gray-400">Biomass increase</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Energy Usage</h4>
                    <p className="text-2xl font-bold text-yellow-400">12.4 kWh</p>
                    <p className="text-xs text-gray-400">Estimated consumption</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'virtual' && (
            <motion.div
              key="virtual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Virtual Experiment Lab
                </h3>
                <p className="text-gray-400 text-sm mb-6">Test different scenarios without affecting your real greenhouse</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Scenario Parameters</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Temperature Offset</label>
                        <input 
                          type="range" 
                          min="-5" 
                          max="5" 
                          step="0.5"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Humidity Offset</label>
                        <input 
                          type="range" 
                          min="-20" 
                          max="20" 
                          step="1"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Light Intensity</label>
                        <input 
                          type="range" 
                          min="200" 
                          max="1000" 
                          step="50"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium text-white transition-colors">
                      Run Virtual Experiment
                    </button>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Virtual State Comparison</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Real Health Score:</span>
                        <span className="text-white">{currentState.plantMetrics.healthScore.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Virtual Health Score:</span>
                        <span className="text-cyan-400">94%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Predicted Improvement:</span>
                        <span className="text-green-400">+6%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}