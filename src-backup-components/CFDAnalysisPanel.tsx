'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wind, Thermometer, Droplets, Eye, Settings, Play, Download, Info, Grid3x3, BarChart3 } from 'lucide-react';

interface CFDSettings {
  meshResolution: 'coarse' | 'medium' | 'fine' | 'ultra-fine';
  turbulenceModel: 'k-epsilon' | 'k-omega' | 'RSM' | 'LES';
  solverType: 'steady-state' | 'transient';
  iterations: number;
  convergenceCriteria: number;
  timeStep?: number;
  totalTime?: number;
}

interface Inlet {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number; // m/s
  temperature: number; // °C
  turbulenceIntensity: number; // %
  type: 'supply' | 'exhaust' | 'natural';
}

interface HeatSource {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  heatGeneration: number; // W
  surfaceTemperature: number; // °C
  type: 'led-fixture' | 'equipment' | 'plants' | 'people';
}

interface CFDResults {
  velocityField: number[][];
  temperatureField: number[][];
  pressureField: number[][];
  turbulenceField: number[][];
  convergenceHistory: number[];
  maxVelocity: number;
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  airChangeRate: number;
  ventilationEffectiveness: number;
}

export function CFDAnalysisPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CFDResults | null>(null);
  const [viewMode, setViewMode] = useState<'velocity' | 'temperature' | 'pressure' | 'turbulence'>('velocity');
  const [showVectors, setShowVectors] = useState(true);
  const [showStreamlines, setShowStreamlines] = useState(false);
  
  const [settings, setSettings] = useState<CFDSettings>({
    meshResolution: 'medium',
    turbulenceModel: 'k-epsilon',
    solverType: 'steady-state',
    iterations: 1000,
    convergenceCriteria: 1e-5,
    timeStep: 0.1,
    totalTime: 60
  });

  const [inlets, setInlets] = useState<Inlet[]>([
    {
      id: '1',
      name: 'Supply Air 1',
      x: 2,
      y: 0,
      width: 0.6,
      height: 0.6,
      velocity: 2.5,
      temperature: 20,
      turbulenceIntensity: 5,
      type: 'supply'
    },
    {
      id: '2',
      name: 'Exhaust 1',
      x: 28,
      y: 4.5,
      width: 0.8,
      height: 0.8,
      velocity: -2.0,
      temperature: 25,
      turbulenceIntensity: 10,
      type: 'exhaust'
    }
  ]);

  const [heatSources, setHeatSources] = useState<HeatSource[]>([
    {
      id: '1',
      name: 'LED Fixtures',
      x: 5,
      y: 2,
      width: 20,
      length: 2,
      heatGeneration: 15000, // 15kW of LED fixtures
      surfaceTemperature: 35,
      type: 'led-fixture'
    },
    {
      id: '2',
      name: 'Plant Canopy',
      x: 0,
      y: 0,
      width: 30,
      length: 4,
      heatGeneration: -2000, // Cooling via transpiration
      surfaceTemperature: 22,
      type: 'plants'
    }
  ]);

  // Mock CFD solver
  const runCFDAnalysis = async () => {
    setIsRunning(true);
    setProgress(0);

    // Simulate CFD computation
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setProgress(i);
    }

    // Generate mock results
    const gridSize = 50;
    const velocityField = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3)
    );
    
    const temperatureField = Array(gridSize).fill(null).map((_, i) => 
      Array(gridSize).fill(null).map((_, j) => {
        // Temperature gradient based on heat sources
        let temp = 20; // Base temperature
        heatSources.forEach(source => {
          const dist = Math.sqrt((i - source.x)** 2 + (j - source.y)**2);
          if (source.heatGeneration > 0) {
            temp += source.heatGeneration / 1000 / (1 + dist * 0.5);
          }
        });
        return Math.min(40, Math.max(18, temp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2));
      })
    );

    const pressureField = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => 101325 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100)
    );

    const turbulenceField = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1)
    );

    const convergenceHistory = Array(settings.iterations / 10).fill(null).map((_, i) => 
      Math.exp(-i * 0.1) * 0.1
    );

    const mockResults: CFDResults = {
      velocityField,
      temperatureField,
      pressureField,
      turbulenceField,
      convergenceHistory,
      maxVelocity: Math.max(...velocityField.flat()),
      avgTemperature: temperatureField.flat().reduce((a, b) => a + b) / (gridSize * gridSize),
      minTemperature: Math.min(...temperatureField.flat()),
      maxTemperature: Math.max(...temperatureField.flat()),
      airChangeRate: 12.5,
      ventilationEffectiveness: 0.85
    };

    setResults(mockResults);
    setIsRunning(false);
    setProgress(100);
  };

  // Render CFD results
  const renderCFDResults = () => {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = results[`${viewMode}Field` as keyof CFDResults] as number[][];
    if (!Array.isArray(data)) return;

    const scaleX = canvas.width / data.length;
    const scaleY = canvas.height / data[0].length;

    // Draw contour map
    data.forEach((row, i) => {
      row.forEach((value, j) => {
        let color;
        const normalized = viewMode === 'temperature' 
          ? (value - results.minTemperature) / (results.maxTemperature - results.minTemperature)
          : value / results.maxVelocity;

        if (viewMode === 'velocity') {
          // Blue to red for velocity
          const r = Math.floor(normalized * 255);
          const b = Math.floor((1 - normalized) * 255);
          color = `rgb(${r}, 0, ${b})`;
        } else if (viewMode === 'temperature') {
          // Blue to yellow to red for temperature
          if (normalized < 0.5) {
            const g = Math.floor(normalized * 2 * 255);
            color = `rgb(0, ${g}, 255)`;
          } else {
            const r = Math.floor((normalized - 0.5) * 2 * 255);
            color = `rgb(${r}, 255, ${255 - r})`;
          }
        } else {
          // Grayscale for pressure/turbulence
          const gray = Math.floor(normalized * 255);
          color = `rgb(${gray}, ${gray}, ${gray})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
      });
    });

    // Draw velocity vectors
    if (showVectors && viewMode === 'velocity') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < data.length; i += 5) {
        for (let j = 0; j < data[0].length; j += 5) {
          const velocity = data[i][j];
          const angle = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * Math.PI * 2; // Mock angle
          const length = velocity * 10;
          
          const x = i * scaleX;
          const y = j * scaleY;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          ctx.stroke();
        }
      }
    }

    // Draw inlets and outlets
    inlets.forEach(inlet => {
      ctx.fillStyle = inlet.type === 'supply' ? 'green' : 'red';
      ctx.fillRect(
        inlet.x * scaleX / data.length * canvas.width,
        inlet.y * scaleY / data[0].length * canvas.height,
        inlet.width * scaleX,
        inlet.height * scaleY
      );
    });

    // Draw heat sources
    heatSources.forEach(source => {
      ctx.fillStyle = source.heatGeneration > 0 ? 'orange' : 'lightblue';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(
        source.x * scaleX / data.length * canvas.width,
        source.y * scaleY / data[0].length * canvas.height,
        source.width * scaleX / data.length * canvas.width,
        source.length * scaleY / data[0].length * canvas.height
      );
      ctx.globalAlpha = 1;
    });
  };

  useEffect(() => {
    renderCFDResults();
  }, [results, viewMode, showVectors]);

  const exportResults = () => {
    if (!results) return;
    
    const data = {
      settings,
      inlets,
      heatSources,
      results: {
        maxVelocity: results.maxVelocity,
        avgTemperature: results.avgTemperature,
        temperatureRange: [results.minTemperature, results.maxTemperature],
        airChangeRate: results.airChangeRate,
        ventilationEffectiveness: results.ventilationEffectiveness
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfd_analysis_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-600/20 rounded-lg">
            <Wind className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">CFD Analysis</h2>
            <p className="text-sm text-gray-400">Computational Fluid Dynamics simulation</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportResults}
            disabled={!results}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={runCFDAnalysis}
            disabled={isRunning}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 font-medium"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run CFD
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Solver Settings
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mesh Resolution
                </label>
                <select
                  value={settings.meshResolution}
                  onChange={(e) => setSettings({...settings, meshResolution: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="coarse">Coarse (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="fine">Fine</option>
                  <option value="ultra-fine">Ultra Fine (Slow)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Turbulence Model
                </label>
                <select
                  value={settings.turbulenceModel}
                  onChange={(e) => setSettings({...settings, turbulenceModel: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="k-epsilon">k-ε (Standard)</option>
                  <option value="k-omega">k-ω SST</option>
                  <option value="RSM">Reynolds Stress</option>
                  <option value="LES">Large Eddy Simulation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Solver Type
                </label>
                <select
                  value={settings.solverType}
                  onChange={(e) => setSettings({...settings, solverType: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="steady-state">Steady State</option>
                  <option value="transient">Transient</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Iterations
                </label>
                <input
                  type="number"
                  value={settings.iterations}
                  onChange={(e) => setSettings({...settings, iterations: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  min="100"
                  max="10000"
                  step="100"
                />
              </div>
            </div>
          </div>

          {/* Air Inlets/Outlets */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Air Inlets/Outlets</h3>
            <div className="space-y-2 text-sm">
              {inlets.map(inlet => (
                <div key={inlet.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div>
                    <div className="text-white font-medium">{inlet.name}</div>
                    <div className="text-gray-400">{inlet.velocity} m/s, {inlet.temperature}°C</div>
                  </div>
                  <div className={`w-3 h-3 rounded ${inlet.type === 'supply' ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Heat Sources */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Heat Sources</h3>
            <div className="space-y-2 text-sm">
              {heatSources.map(source => (
                <div key={source.id} className="p-2 bg-gray-700 rounded">
                  <div className="text-white font-medium">{source.name}</div>
                  <div className="text-gray-400">
                    {source.heatGeneration > 0 ? '+' : ''}{(source.heatGeneration/1000).toFixed(1)} kW
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3 space-y-4">
          {/* View Controls */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">Visualization</h3>
              
              <div className="flex gap-2">
                {['velocity', 'temperature', 'pressure', 'turbulence'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === mode
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="rounded"
                />
                Show Vectors
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showStreamlines}
                  onChange={(e) => setShowStreamlines(e.target.checked)}
                  className="rounded"
                />
                Show Streamlines
              </label>
            </div>

            {/* CFD Canvas */}
            <div className="bg-gray-900 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-auto border border-gray-700 rounded"
              />
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Computing CFD solution...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analysis Results
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">Max Velocity</div>
                  <div className="text-white text-lg font-semibold">{results.maxVelocity.toFixed(2)} m/s</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">Avg Temperature</div>
                  <div className="text-white text-lg font-semibold">{results.avgTemperature.toFixed(1)}°C</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">Air Changes/Hour</div>
                  <div className="text-white text-lg font-semibold">{results.airChangeRate.toFixed(1)} ACH</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">Ventilation Effectiveness</div>
                  <div className="text-white text-lg font-semibold">{(results.ventilationEffectiveness * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">CFD Analysis Complete</p>
                    <p>
                      Temperature range: {results.minTemperature.toFixed(1)}°C - {results.maxTemperature.toFixed(1)}°C. 
                      Ventilation effectiveness of {(results.ventilationEffectiveness * 100).toFixed(0)}% indicates good air mixing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}