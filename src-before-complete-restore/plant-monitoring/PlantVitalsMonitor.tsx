'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Camera, Leaf, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Zap, Droplets, 
  Thermometer, Eye, Settings, RefreshCw,
  BarChart3, LineChart, Target, Lightbulb
} from 'lucide-react';

interface PlantVital {
  timestamp: Date;
  plantId: string;
  location: { x: number; y: number; zone: string };
  photosynthesisRate: number; // μmol CO2 m⁻² s⁻¹
  stressLevel: number; // 0-100 scale
  healthScore: number; // 0-100 scale
  leafTemperature: number; // °C
  transpirationRate: number; // mmol H2O m⁻² s⁻¹
  chlorophyllContent: number; // SPAD units
  leafAreaIndex: number; // m² leaf / m² ground
  growthRate: number; // cm/day
  deficiencies: string[];
  diseases: string[];
  recommendedActions: string[];
}

interface CameraSystem {
  id: string;
  name: string;
  type: 'multispectral' | 'hyperspectral' | 'thermal' | 'rgb';
  status: 'online' | 'offline' | 'maintenance';
  coverage: { x: number; y: number; width: number; height: number };
  resolution: string;
  captureInterval: number; // seconds
  lastCapture: Date;
  plantsMonitored: number;
}

export function PlantVitalsMonitor() {
  const [plantVitals, setPlantVitals] = useState<PlantVital[]>([]);
  const [cameras, setCameras] = useState<CameraSystem[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantVital | null>(null);
  const [alertLevel, setAlertLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'heatmap'>('overview');

  // Mock data - in real implementation, this would come from camera system API
  useEffect(() => {
    const mockCameras: CameraSystem[] = [
      {
        id: 'cam-001',
        name: 'VibeLux HeliOS-1',
        type: 'multispectral',
        status: 'online',
        coverage: { x: 0, y: 0, width: 20, height: 15 },
        resolution: '4096x3072',
        captureInterval: 300, // 5 minutes
        lastCapture: new Date(Date.now() - 2 * 60 * 1000),
        plantsMonitored: 48
      },
      {
        id: 'cam-002', 
        name: 'VibeLux ThermalEye-2',
        type: 'thermal',
        status: 'online',
        coverage: { x: 20, y: 0, width: 20, height: 15 },
        resolution: '640x480',
        captureInterval: 180, // 3 minutes
        lastCapture: new Date(Date.now() - 1 * 60 * 1000),
        plantsMonitored: 52
      }
    ];

    const mockVitals: PlantVital[] = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3600000),
      plantId: `plant-${String(i + 1).padStart(3, '0')}`,
      location: { 
        x: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40, 
        y: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15, 
        zone: `Zone-${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4) + 1}` 
      },
      photosynthesisRate: 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25, // Normal range 15-40
      stressLevel: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
      healthScore: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
      leafTemperature: 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
      transpirationRate: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
      chlorophyllContent: 35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
      leafAreaIndex: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
      growthRate: 0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      deficiencies: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.8 ? ['Nitrogen'] : [],
      diseases: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.9 ? ['Powdery Mildew'] : [],
      recommendedActions: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7 ? ['Increase light intensity', 'Adjust nutrition'] : []
    }));

    setCameras(mockCameras);
    setPlantVitals(mockVitals);

    // Calculate alert level
    const highStressPlants = mockVitals.filter(v => v.stressLevel > 70).length;
    const totalPlants = mockVitals.length;
    const stressRatio = highStressPlants / totalPlants;
    
    if (stressRatio > 0.2) setAlertLevel('high');
    else if (stressRatio > 0.1) setAlertLevel('medium');
    else if (stressRatio > 0.05) setAlertLevel('low');
    else setAlertLevel('none');

  }, []);

  const averageVitals = {
    photosynthesis: plantVitals.reduce((sum, p) => sum + p.photosynthesisRate, 0) / plantVitals.length || 0,
    health: plantVitals.reduce((sum, p) => sum + p.healthScore, 0) / plantVitals.length || 0,
    stress: plantVitals.reduce((sum, p) => sum + p.stressLevel, 0) / plantVitals.length || 0,
    growth: plantVitals.reduce((sum, p) => sum + p.growthRate, 0) / plantVitals.length || 0
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Plant Vitals Monitor</CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time plant health and photosynthesis monitoring
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getAlertColor(alertLevel)} border`}>
                  {alertLevel === 'none' ? 'All Systems Normal' : `${alertLevel.toUpperCase()} Alert`}
                </Badge>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Photosynthesis</p>
                  <p className="text-2xl font-bold text-white">
                    {averageVitals.photosynthesis.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">μmol CO₂ m⁻² s⁻¹</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Health Score</p>
                  <p className={`text-2xl font-bold ${getHealthColor(averageVitals.health)}`}>
                    {averageVitals.health.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">Plant health index</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Stress Level</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {averageVitals.stress.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">Environmental stress</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Growth Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {averageVitals.growth.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">cm/day</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camera Systems Status */}
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Camera className="w-5 h-5" />
              Camera Systems Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cameras.map(camera => (
                <div key={camera.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        camera.status === 'online' ? 'bg-green-500' : 
                        camera.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <h4 className="font-medium text-white">{camera.name}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {camera.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Resolution</p>
                      <p className="text-gray-200">{camera.resolution}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Plants Monitored</p>
                      <p className="text-gray-200">{camera.plantsMonitored}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Capture Interval</p>
                      <p className="text-gray-200">{camera.captureInterval}s</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Capture</p>
                      <p className="text-gray-200">
                        {Math.floor((Date.now() - camera.lastCapture.getTime()) / 60000)}m ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plant Grid/Heatmap */}
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="w-5 h-5" />
                Plant Health Heatmap
              </CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'heatmap' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Heatmap
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 lg:grid-cols-12 gap-2 p-4">
              {plantVitals.slice(0, 96).map(plant => (
                <div
                  key={plant.plantId}
                  className={`w-8 h-8 rounded cursor-pointer transition-all hover:scale-110 ${
                    plant.healthScore >= 80 ? 'bg-green-500' :
                    plant.healthScore >= 60 ? 'bg-yellow-500' :
                    plant.healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  title={`${plant.plantId}: Health ${plant.healthScore.toFixed(0)}%`}
                  onClick={() => setSelectedPlant(plant)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Plant View */}
        {selectedPlant && (
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="w-5 h-5" />
                Plant Details: {selectedPlant.plantId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Photosynthesis Rate</p>
                  <p className="text-xl font-bold text-green-400">
                    {selectedPlant.photosynthesisRate.toFixed(1)} μmol CO₂ m⁻² s⁻¹
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Health Score</p>
                  <p className={`text-xl font-bold ${getHealthColor(selectedPlant.healthScore)}`}>
                    {selectedPlant.healthScore.toFixed(0)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Stress Level</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {selectedPlant.stressLevel.toFixed(0)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Growth Rate</p>
                  <p className="text-xl font-bold text-purple-400">
                    {selectedPlant.growthRate.toFixed(1)} cm/day
                  </p>
                </div>
              </div>

              {selectedPlant.recommendedActions.length > 0 && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {selectedPlant.recommendedActions.map((action, i) => (
                      <li key={i} className="text-sm text-gray-300">• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}