'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Activity,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Clock,
  BarChart3,
  Wifi,
  WifiOff,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  temperature: number;
  humidity: number;
  co2: number;
  ppfd: number;
  vpd: number;
  timestamp: Date;
}

interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  url: string;
  status: 'online' | 'offline';
  lastCapture: Date;
}

interface PlantHealth {
  zone: string;
  healthScore: number;
  issues: string[];
  growthRate: number;
  estimatedHarvest: Date;
  // Advanced stress detection
  stressLevel: number;
  nutrientDeficiencies?: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    calcium?: number;
    magnesium?: number;
  };
  diseaseRisk: number;
  waterStress: number;
  lightStress: number;
  // Photosynthesis metrics
  photosynthesisRate: number;
  lightUseEfficiency: number;
  waterUseEfficiency: number;
}

export function PlantMonitoringDashboard() {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [plantHealth, setPlantHealth] = useState<PlantHealth[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update sensor data
      setSensorData(prev => {
        const newData: SensorData = {
          temperature: 72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
          humidity: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
          co2: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400,
          ppfd: 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
          vpd: 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8,
          timestamp: new Date()
        };
        return [...prev.slice(-59), newData]; // Keep last 60 data points
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize mock data
  useEffect(() => {
    // Mock camera feeds
    setCameras([
      {
        id: 'cam-1',
        name: 'Flower Room A - Overview',
        zone: 'flower-a',
        url: '/api/camera/1/stream',
        status: 'online',
        lastCapture: new Date()
      },
      {
        id: 'cam-2',
        name: 'Veg Room 1 - Canopy',
        zone: 'veg-1',
        url: '/api/camera/2/stream',
        status: 'online',
        lastCapture: new Date()
      },
      {
        id: 'cam-3',
        name: 'Clone Room - Propagation',
        zone: 'clone',
        url: '/api/camera/3/stream',
        status: 'offline',
        lastCapture: new Date(Date.now() - 3600000)
      }
    ]);

    // Mock plant health data with advanced metrics
    setPlantHealth([
      {
        zone: 'flower-a',
        healthScore: 92,
        issues: [],
        growthRate: 1.2,
        estimatedHarvest: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        stressLevel: 8,
        nutrientDeficiencies: {
          nitrogen: 0,
          phosphorus: 0,
          potassium: 5,
          calcium: 0,
          magnesium: 3
        },
        diseaseRisk: 12,
        waterStress: 5,
        lightStress: 0,
        photosynthesisRate: 28.5,
        lightUseEfficiency: 0.045,
        waterUseEfficiency: 4.2
      },
      {
        zone: 'veg-1',
        healthScore: 85,
        issues: ['Minor nutrient deficiency detected'],
        growthRate: 0.9,
        estimatedHarvest: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        stressLevel: 15,
        nutrientDeficiencies: {
          nitrogen: 15,
          phosphorus: 8,
          potassium: 0,
          calcium: 5,
          magnesium: 12
        },
        diseaseRisk: 18,
        waterStress: 8,
        lightStress: 12,
        photosynthesisRate: 22.3,
        lightUseEfficiency: 0.038,
        waterUseEfficiency: 3.5
      },
      {
        zone: 'clone',
        healthScore: 78,
        issues: ['High humidity warning', 'Slow root development'],
        growthRate: 0.7,
        estimatedHarvest: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        stressLevel: 22,
        nutrientDeficiencies: {
          nitrogen: 5,
          phosphorus: 0,
          potassium: 8,
          calcium: 18,
          magnesium: 10
        },
        diseaseRisk: 35,
        waterStress: 20,
        lightStress: 5,
        photosynthesisRate: 15.8,
        lightUseEfficiency: 0.032,
        waterUseEfficiency: 2.8
      }
    ]);

    // Mock alerts
    setAlerts([
      {
        id: 1,
        type: 'warning',
        message: 'VPD outside optimal range in Veg Room 1',
        timestamp: new Date(Date.now() - 600000),
        zone: 'veg-1'
      },
      {
        id: 2,
        type: 'critical',
        message: 'Camera offline in Clone Room',
        timestamp: new Date(Date.now() - 3600000),
        zone: 'clone'
      }
    ]);
  }, []);

  const getEnvironmentChartData = () => {
    const labels = sensorData.map((_, i) => `${i * 5}s ago`).reverse();
    
    return {
      labels,
      datasets: [
        {
          label: 'Temperature (°F)',
          data: sensorData.map(d => d.temperature).reverse(),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Humidity (%)',
          data: sensorData.map(d => d.humidity).reverse(),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1'
        }
      ]
    };
  };

  const getLightingChartData = () => {
    const labels = sensorData.map((_, i) => `${i * 5}s ago`).reverse();
    
    return {
      labels,
      datasets: [
        {
          label: 'PPFD (μmol/m²/s)',
          data: sensorData.map(d => d.ppfd).reverse(),
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)'
        }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Plant Monitoring Dashboard</h1>
            <p className="text-gray-400">Real-time cultivation intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm">{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedZone('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedZone === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => setSelectedZone('flower-a')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedZone === 'flower-a' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Flower Room A
          </button>
          <button
            onClick={() => setSelectedZone('veg-1')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedZone === 'veg-1' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Veg Room 1
          </button>
          <button
            onClick={() => setSelectedZone('clone')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedZone === 'clone' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Clone Room
          </button>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  alert.type === 'critical' 
                    ? 'bg-red-900/50 border border-red-600' 
                    : 'bg-yellow-900/50 border border-yellow-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alert.zone} • {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feeds */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-400" />
              Live Camera Feeds
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {cameras
                .filter(cam => selectedZone === 'all' || cam.zone === selectedZone)
                .map(camera => (
                  <div key={camera.id} className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-800 relative">
                      {camera.status === 'online' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-12 h-12 text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500">Camera Feed</p>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                          <div className="text-center">
                            <WifiOff className="w-12 h-12 text-red-600 mb-2" />
                            <p className="text-sm text-red-400">Offline</p>
                          </div>
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs ${
                        camera.status === 'online' 
                          ? 'bg-green-600' 
                          : 'bg-red-600'
                      }`}>
                        {camera.status}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{camera.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Last capture: {camera.lastCapture.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Plant Health Overview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Plant Health
            </h2>
            {plantHealth
              .filter(health => selectedZone === 'all' || health.zone === selectedZone)
              .map(health => (
                <div key={health.zone} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium capitalize">{health.zone.replace('-', ' ')}</h3>
                    <span className={`text-2xl font-bold ${
                      health.healthScore >= 90 ? 'text-green-500' :
                      health.healthScore >= 70 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {health.healthScore}%
                    </span>
                  </div>
                  
                  {health.issues.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {health.issues.map((issue, i) => (
                        <p key={i} className="text-sm text-yellow-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth Rate</span>
                      <span className={health.growthRate >= 1 ? 'text-green-400' : 'text-yellow-400'}>
                        {(health.growthRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stress Level</span>
                      <span className={health.stressLevel < 10 ? 'text-green-400' : health.stressLevel < 20 ? 'text-yellow-400' : 'text-red-400'}>
                        {health.stressLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Photosynthesis</span>
                      <span className="text-green-400">
                        {health.photosynthesisRate.toFixed(1)} μmol/m²/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Disease Risk</span>
                      <span className={health.diseaseRisk < 20 ? 'text-green-400' : health.diseaseRisk < 40 ? 'text-yellow-400' : 'text-red-400'}>
                        {health.diseaseRisk}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Est. Harvest</span>
                      <span>{health.estimatedHarvest.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Nutrient deficiencies indicator */}
                  {health.nutrientDeficiencies && Object.entries(health.nutrientDeficiencies).some(([_, value]) => value > 10) && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <p className="text-xs text-gray-400 mb-2">Nutrient Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(health.nutrientDeficiencies).map(([nutrient, level]) => (
                          level > 10 && (
                            <span key={nutrient} className="text-xs px-2 py-1 rounded bg-yellow-900/50 text-yellow-400">
                              {nutrient.charAt(0).toUpperCase()} -{level}%
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Environmental Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-400" />
              Temperature & Humidity
            </h3>
            <div className="h-64">
              <Line 
                data={getEnvironmentChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: 'white' }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      ticks: { color: 'gray' },
                      grid: { drawOnChartArea: false }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              Light Intensity
            </h3>
            <div className="h-64">
              <Line 
                data={getLightingChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: 'white' }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Current Readings */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold">
                  {sensorData[sensorData.length - 1]?.temperature.toFixed(1) || '--'}°F
                </p>
                <p className="text-sm text-gray-400">Temperature</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Droplets className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">
                  {sensorData[sensorData.length - 1]?.humidity.toFixed(0) || '--'}%
                </p>
                <p className="text-sm text-gray-400">Humidity</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Wind className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold">
                  {sensorData[sensorData.length - 1]?.co2.toFixed(0) || '--'}
                </p>
                <p className="text-sm text-gray-400">CO₂ (ppm)</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Sun className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">
                  {sensorData[sensorData.length - 1]?.ppfd.toFixed(0) || '--'}
                </p>
                <p className="text-sm text-gray-400">PPFD</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">
                  {sensorData[sensorData.length - 1]?.vpd.toFixed(2) || '--'}
                </p>
                <p className="text-sm text-gray-400">VPD (kPa)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Design Data
          </button>
        </div>
      </div>
    </div>
  );
}