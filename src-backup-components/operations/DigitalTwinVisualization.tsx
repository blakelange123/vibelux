'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Box,
  Sphere,
  Line,
  Text,
  Html,
  useGLTF,
  Float
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Layers,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Eye,
  EyeOff,
  Download,
  Upload,
  Zap,
  AlertTriangle,
  TrendingUp,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { DigitalTwinEngine, DigitalTwinState } from '@/lib/digital-twin-engine';
import { useDigitalTwin } from '@/hooks/useDigitalTwin';

interface VisualizationMode {
  temperature: boolean;
  humidity: boolean;
  airflow: boolean;
  light: boolean;
  co2: boolean;
  vpd: boolean;
}

interface SimulationMetrics {
  fps: number;
  particleCount: number;
  cellCount: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface DigitalTwinVisualizationProps {
  projectId?: string;
  roomId?: string;
}

export function DigitalTwinVisualization({ 
  projectId = 'demo', 
  roomId = 'room_1' 
}: DigitalTwinVisualizationProps) {
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>({
    temperature: true,
    humidity: false,
    airflow: false,
    light: false,
    co2: false,
    vpd: false
  });
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    fps: 60,
    particleCount: 0,
    cellCount: 0,
    cpuUsage: 0,
    memoryUsage: 0
  });

  // Use Digital Twin hook with real sensor data
  const {
    state: twinState,
    isRunning: isSimulating,
    connected,
    realData,
    insights,
    controls
  } = useDigitalTwin({
    projectId,
    roomId,
    facilityDimensions: { width: 20, length: 10, height: 3 },
    resolution: 0.5
  });

  // Update metrics based on simulation state
  useEffect(() => {
    if (twinState) {
      setMetrics(prev => ({
        ...prev,
        cellCount: 40 * 20 * 6, // Based on grid resolution
        fps: isSimulating ? 30 : 0
      }));
    }
  }, [twinState, isSimulating]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Digital Twin Simulator
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time physics-based facility simulation
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            connected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {connected ? 'Live Data' : 'Offline'}
            </span>
          </div>
          
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Load Facility
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => isSimulating ? controls.stop() : controls.start()}
              className={`p-3 rounded-lg transition-colors ${
                isSimulating 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={controls.reset}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Speed:</span>
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="0.1">0.1x</option>
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="5">5x</option>
                <option value="10">10x</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {new Date().toLocaleString()}
              </span>
            </div>
            {realData && (
              <div className="flex items-center gap-3 text-xs">
                {realData.temperature && (
                  <span className="text-gray-400">
                    Temp: {realData.temperature.current.toFixed(1)}°F
                  </span>
                )}
                {realData.humidity && (
                  <span className="text-gray-400">
                    RH: {realData.humidity.current.toFixed(0)}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="grid grid-cols-3 gap-6">
        {/* 3D View */}
        <div className="col-span-2">
          <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <Canvas>
              <PerspectiveCamera makeDefault position={[15, 10, 15]} />
              <OrbitControls enablePan enableZoom enableRotate />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              
              <Suspense fallback={null}>
                <FacilityModel />
                <EnvironmentalVisualization 
                  state={twinState}
                  mode={visualizationMode}
                />
                <PlantVisualization 
                  plants={twinState?.plants || []}
                  onSelectPlant={setSelectedPlant}
                />
                <EquipmentVisualization
                  equipment={twinState?.equipment || []}
                />
              </Suspense>
              
              <Environment preset="warehouse" />
            </Canvas>
          </div>

          {/* Visualization Controls */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Visualization Layers
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(visualizationMode).map(([mode, enabled]) => (
                <button
                  key={mode}
                  onClick={() => setVisualizationMode(prev => ({
                    ...prev,
                    [mode]: !prev[mode as keyof VisualizationMode]
                  }))}
                  className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${
                    enabled
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {mode === 'temperature' && <Thermometer className="w-4 h-4" />}
                  {mode === 'humidity' && <Droplets className="w-4 h-4" />}
                  {mode === 'airflow' && <Wind className="w-4 h-4" />}
                  {mode === 'light' && <Sun className="w-4 h-4" />}
                  {mode === 'co2' && <Activity className="w-4 h-4" />}
                  {mode === 'vpd' && <Zap className="w-4 h-4" />}
                  <span className="capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Predictions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Predictions
            </h3>
            {twinState?.predictions && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Yield</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {twinState.predictions.yield.total.toFixed(0)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {twinState.predictions.yield.confidence}% confidence
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Energy Usage</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {twinState.predictions.energy.dailyUsage.toFixed(1)} kWh/day
                  </p>
                  <p className="text-xs text-gray-500">
                    ${twinState.predictions.energy.monthlyCost.toFixed(0)}/month
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Issues & Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Issues & Insights
            </h3>
            {insights && (
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Environmental Uniformity
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {insights.uniformity.toFixed(1)}% uniform
                  </p>
                </div>
                {insights.optimizationSuggestions.slice(0, 2).map((suggestion, idx) => (
                  <div key={idx} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {twinState?.predictions.issues && (
              <div className="mt-2 space-y-2">
                {twinState.predictions.issues.slice(0, 2).map((issue, idx) => (
                  <div key={idx} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {issue.issue}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {issue.probability}% chance in {issue.timeframe} days
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulation Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Simulation Performance
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">FPS</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {metrics.fps}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Grid Cells</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {(40 * 20 * 6).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">CPU Usage</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {metrics.cpuUsage}%
                </span>
              </div>
            </div>
          </div>

          {/* Selected Plant Info */}
          {selectedPlant && twinState && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Plant Details
              </h3>
              {/* Plant info would go here */}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Environmental Uniformity
          </h3>
          {/* Chart showing spatial variance */}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Energy Optimization Opportunities
          </h3>
          {/* Optimization suggestions */}
        </div>
      </div>
    </div>
  );
}

// 3D Components
function FacilityModel() {
  return (
    <group>
      {/* Floor */}
      <Box args={[20, 0.1, 10]} position={[10, 0, 5]}>
        <meshStandardMaterial color="#333" />
      </Box>
      
      {/* Walls */}
      <Box args={[0.1, 3, 10]} position={[0, 1.5, 5]}>
        <meshStandardMaterial color="#666" opacity={0.3} transparent />
      </Box>
      <Box args={[0.1, 3, 10]} position={[20, 1.5, 5]}>
        <meshStandardMaterial color="#666" opacity={0.3} transparent />
      </Box>
      <Box args={[20, 3, 0.1]} position={[10, 1.5, 0]}>
        <meshStandardMaterial color="#666" opacity={0.3} transparent />
      </Box>
      <Box args={[20, 3, 0.1]} position={[10, 1.5, 10]}>
        <meshStandardMaterial color="#666" opacity={0.3} transparent />
      </Box>
      
      {/* Grow Tables */}
      {Array.from({ length: 4 }, (_, i) => (
        <Box key={i} args={[4, 0.8, 1.2]} position={[5 + i * 5, 0.4, 2.5]}>
          <meshStandardMaterial color="#444" />
        </Box>
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <Box key={i + 4} args={[4, 0.8, 1.2]} position={[5 + i * 5, 0.4, 7.5]}>
          <meshStandardMaterial color="#444" />
        </Box>
      ))}
    </group>
  );
}

function EnvironmentalVisualization({ state, mode }: { state: DigitalTwinState | null; mode: VisualizationMode }) {
  // This would render temperature fields, airflow vectors, etc.
  return null;
}

function PlantVisualization({ plants, onSelectPlant }: { plants: any[]; onSelectPlant: (id: string) => void }) {
  return (
    <group>
      {plants.map((plant) => (
        <Sphere
          key={plant.id}
          args={[0.3]}
          position={[plant.position.x, plant.position.y + 1, plant.position.z]}
          onClick={() => onSelectPlant(plant.id)}
        >
          <meshStandardMaterial color="#00ff00" />
        </Sphere>
      ))}
    </group>
  );
}

function EquipmentVisualization({ equipment }: { equipment: any[] }) {
  return (
    <group>
      {equipment.map((item) => (
        <Box
          key={item.id}
          args={[0.5, 0.5, 0.5]}
          position={[item.position.x, item.position.y, item.position.z]}
        >
          <meshStandardMaterial color={item.status === 'on' ? '#ffff00' : '#666666'} />
        </Box>
      ))}
    </group>
  );
}