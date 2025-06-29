'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Wind, Thermometer, Play, Download, Info, Settings, X, 
  Activity, Gauge, Droplets, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { CFDEngine, CFDConfig, CFDResults } from '../cfd/CFDEngine';

interface PanelProps {
  onClose: () => void;
}

interface CFDSettings {
  meshResolution: 'coarse' | 'medium' | 'fine';
  iterations: number;
  showVectors: boolean;
  showStreamlines: boolean;
  visualizationMode: 'velocity' | 'temperature' | 'pressure';
  turbulenceModel: 'laminar' | 'k-epsilon' | 'k-omega';
  inletVelocity: number;
  ambientTemp: number;
}

export function CFDAnalysisPanel({ onClose }: PanelProps) {
  const { state } = useDesigner();
  const { room, objects } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [settings, setSettings] = useState<CFDSettings>({
    meshResolution: 'medium',
    iterations: 500,
    showVectors: true,
    showStreamlines: false,
    visualizationMode: 'velocity',
    turbulenceModel: 'laminar',
    inletVelocity: 0.5,
    ambientTemp: 22
  });
  const [cfdResults, setCFDResults] = useState<CFDResults | null>(null);

  // Run CFD analysis using real solver
  const runAnalysis = async () => {
    setIsRunning(true);
    setProgress(0);

    const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
    
    // Convert fixtures to heat sources
    const heatSources = fixtures.map(fixture => ({
      x: fixture.x,
      y: fixture.y,
      z: fixture.z || room.height - 1,
      power: ((fixture as any).model?.wattage || 600) * 0.8, // 80% heat dissipation
      width: fixture.width || 1.2,
      length: fixture.length || 0.6,
      height: 0.2
    }));

    // Set up grid resolution
    const gridRes = {
      coarse: { x: 20, y: 20, z: 10 },
      medium: { x: 30, y: 30, z: 15 },
      fine: { x: 40, y: 40, z: 20 }
    }[settings.meshResolution];

    // CFD configuration
    const cfdConfig: CFDConfig = {
      roomDimensions: {
        width: room.width,
        length: room.length,
        height: room.height
      },
      gridResolution: gridRes,
      ambientTemp: settings.ambientTemp,
      inletVelocity: settings.inletVelocity,
      heatSources,
      boundaries: {
        west: { type: 'inlet', velocity: { x: settings.inletVelocity, y: 0, z: 0 }, temperature: settings.ambientTemp },
        east: { type: 'outlet' },
        floor: { type: 'wall', temperature: settings.ambientTemp },
        ceiling: { type: 'wall' },
        north: { type: 'wall' },
        south: { type: 'wall' }
      },
      turbulenceModel: settings.turbulenceModel,
      iterations: settings.iterations
    };

    // Run CFD solver in chunks to show progress
    try {
      // Initialize solver
      const engine = new CFDEngine(cfdConfig);
      
      // Simulate progress (actual solver runs in one go)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Run solver
      const results = await new Promise<CFDResults>((resolve) => {
        setTimeout(() => {
          resolve(engine.solve());
        }, 100);
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      setCFDResults(results);
      setResults({
        velocityField: [],
        temperatureField: [],
        avgTemperature: results.metrics.avgTemperature,
        maxVelocity: results.metrics.maxVelocity,
        minTemperature: results.metrics.minTemperature,
        maxTemperature: results.metrics.maxTemperature,
        airChangeRate: results.metrics.airChangeRate,
        energyEfficiency: results.metrics.thermalComfort.pmv < 0.5 && results.metrics.thermalComfort.pmv > -0.5 ? 'Good' : 
                         results.metrics.thermalComfort.pmv < 1 && results.metrics.thermalComfort.pmv > -1 ? 'Fair' : 'Poor'
      });
    } catch (error) {
      console.error('CFD analysis failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Render CFD results on canvas
  const renderCFDResults = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cfdResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the appropriate field based on visualization mode
    let field: number[][][];
    let minValue: number;
    let maxValue: number;
    
    switch (settings.visualizationMode) {
      case 'temperature':
        field = cfdResults.temperatureField;
        minValue = cfdResults.metrics.minTemperature + 273.15;
        maxValue = cfdResults.metrics.maxTemperature + 273.15;
        break;
      case 'pressure':
        field = cfdResults.pressureField;
        minValue = Math.min(...field.flat().flat());
        maxValue = Math.max(...field.flat().flat());
        break;
      default: // velocity
        field = cfdResults.velocityField.magnitude;
        minValue = 0;
        maxValue = cfdResults.metrics.maxVelocity;
    }

    // Take a slice at mid-height for 2D visualization
    const midZ = Math.floor(field[0][0].length / 2);
    const sliceData = field.map(row => row.map(col => col[midZ]));
    
    const scaleX = canvas.width / sliceData.length;
    const scaleY = canvas.height / sliceData[0].length;

    // Draw field visualization
    sliceData.forEach((row: number[], i: number) => {
      row.forEach((value: number, j: number) => {
        const normalized = (value - minValue) / (maxValue - minValue);

        let color;
        if (settings.visualizationMode === 'temperature') {
          // Blue to red for temperature
          const r = Math.floor(normalized * 255);
          const b = Math.floor((1 - normalized) * 255);
          color = `rgba(${r}, 100, ${b}, 0.8)`;
        } else if (settings.visualizationMode === 'pressure') {
          // Green to yellow for pressure
          const g = 200;
          const r = Math.floor(normalized * 255);
          const b = Math.floor((1 - normalized) * 100);
          color = `rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
          // Blue to yellow for velocity
          const r = Math.floor(normalized * 255);
          const g = Math.floor(normalized * 200);
          const b = Math.floor((1 - normalized) * 255);
          color = `rgba(${r}, ${g}, ${b}, 0.8)`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
      });
    });

    // Draw velocity vectors if enabled
    if (settings.showVectors && settings.visualizationMode === 'velocity') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      
      const step = 4; // Show every 4th vector
      for (let i = 0; i < sliceData.length; i += step) {
        for (let j = 0; j < sliceData[0].length; j += step) {
          const u = cfdResults.velocityField.u[i][j][midZ];
          const v = cfdResults.velocityField.v[i][j][midZ];
          const magnitude = Math.sqrt(u*u + v*v);
          
          if (magnitude > 0.01) {
            const scale = 20;
            const x = i * scaleX;
            const y = j * scaleY;
            const dx = (u / magnitude) * Math.min(magnitude * scale, 20);
            const dy = (v / magnitude) * Math.min(magnitude * scale, 20);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + dx, y + dy);
            
            // Arrowhead
            const angle = Math.atan2(dy, dx);
            ctx.lineTo(x + dx - 5 * Math.cos(angle - Math.PI/6), y + dy - 5 * Math.sin(angle - Math.PI/6));
            ctx.moveTo(x + dx, y + dy);
            ctx.lineTo(x + dx - 5 * Math.cos(angle + Math.PI/6), y + dy - 5 * Math.sin(angle + Math.PI/6));
            
            ctx.stroke();
          }
        }
      }
    }

    // Draw streamlines if enabled
    if (settings.showStreamlines && cfdResults.streamlines) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      
      cfdResults.streamlines.forEach(streamline => {
        ctx.beginPath();
        streamline.points.forEach((point, idx) => {
          const x = (point.x / room.width) * canvas.width;
          const y = (point.y / room.length) * canvas.height;
          
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });
    }

    // Draw room outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw fixtures
    const fixtureScaleX = canvas.width / room.width;
    const fixtureScaleY = canvas.height / room.length;
    
    objects.filter(obj => obj.type === 'fixture').forEach(fixture => {
      ctx.fillStyle = fixture.enabled ? '#fbbf24' : '#6b7280';
      ctx.fillRect(
        fixture.x * fixtureScaleX - 5,
        fixture.y * fixtureScaleY - 10,
        10,
        20
      );
    });
  }, [cfdResults, settings, room, objects]);

  // Export CFD report
  const exportCFDReport = () => {
    if (!cfdResults) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      roomDimensions: room,
      settings: settings,
      results: {
        metrics: cfdResults.metrics,
        convergenceHistory: cfdResults.convergenceHistory,
        summary: {
          airQuality: cfdResults.metrics.airChangeRate > 6 ? 'Excellent' : 
                      cfdResults.metrics.airChangeRate > 4 ? 'Good' : 
                      cfdResults.metrics.airChangeRate > 2 ? 'Fair' : 'Poor',
          thermalComfort: cfdResults.metrics.thermalComfort.ppd < 10 ? 'Excellent' : 
                         cfdResults.metrics.thermalComfort.ppd < 20 ? 'Good' : 
                         cfdResults.metrics.thermalComfort.ppd < 30 ? 'Fair' : 'Poor',
          energyEfficiency: cfdResults.metrics.avgTemperature < 25 ? 'Good' : 
                           cfdResults.metrics.avgTemperature < 28 ? 'Fair' : 'Poor'
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cfd-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (cfdResults) {
      renderCFDResults();
    }
  }, [cfdResults, settings, renderCFDResults]);

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 text-cyan-500" />
          <h2 className="text-xl font-semibold text-white">CFD Analysis</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 flex">
        {/* Settings */}
        <div className="w-64 border-r border-gray-700 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Analysis Settings
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Mesh Resolution</label>
                <select
                  value={settings.meshResolution}
                  onChange={(e) => setSettings({...settings, meshResolution: e.target.value as any})}
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="coarse">Coarse (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="fine">Fine (Detailed)</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Iterations</label>
                <input
                  type="number"
                  value={settings.iterations}
                  onChange={(e) => setSettings({...settings, iterations: Number(e.target.value)})}
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  min="100"
                  max="2000"
                  step="100"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Turbulence Model</label>
                <select
                  value={settings.turbulenceModel}
                  onChange={(e) => setSettings({...settings, turbulenceModel: e.target.value as any})}
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="laminar">Laminar Flow</option>
                  <option value="k-epsilon">k-ε Model</option>
                  <option value="k-omega">k-ω Model</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Inlet Velocity (m/s)</label>
                <input
                  type="number"
                  value={settings.inletVelocity}
                  onChange={(e) => setSettings({...settings, inletVelocity: Number(e.target.value)})}
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  min="0.1"
                  max="5"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Ambient Temp (°C)</label>
                <input
                  type="number"
                  value={settings.ambientTemp}
                  onChange={(e) => setSettings({...settings, ambientTemp: Number(e.target.value)})}
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  min="15"
                  max="35"
                  step="1"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Visualization</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="display"
                  checked={settings.visualizationMode === 'velocity'}
                  onChange={() => setSettings({...settings, visualizationMode: 'velocity'})}
                />
                Velocity Field
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="display"
                  checked={settings.visualizationMode === 'temperature'}
                  onChange={() => setSettings({...settings, visualizationMode: 'temperature'})}
                />
                Temperature Field
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="display"
                  checked={settings.visualizationMode === 'pressure'}
                  onChange={() => setSettings({...settings, visualizationMode: 'pressure'})}
                />
                Pressure Field
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showVectors}
                  onChange={(e) => setSettings({...settings, showVectors: e.target.checked})}
                  disabled={settings.visualizationMode !== 'velocity'}
                />
                Show Velocity Vectors
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showStreamlines}
                  onChange={(e) => setSettings({...settings, showStreamlines: e.target.checked})}
                />
                Show Streamlines
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Current Design</h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">Room: {room.width} × {room.length} × {room.height} ft</div>
              <div className="text-gray-400">Fixtures: {objects.filter(obj => obj.type === 'fixture').length}</div>
              <div className="text-gray-400">Total Power: {objects.filter(obj => obj.type === 'fixture' && obj.enabled).reduce((sum, f) => sum + ((f as any).model?.wattage || 600), 0)}W</div>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={isRunning}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
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

        {/* Visualization */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  {settings.visualizationMode === 'temperature' ? 'Temperature Distribution' : 
                   settings.visualizationMode === 'pressure' ? 'Pressure Field' : 'Airflow Velocity'}
                </h3>
                <div className="text-sm text-gray-400">
                  {settings.visualizationMode === 'temperature' ? 'Thermal analysis at mid-height' : 
                   settings.visualizationMode === 'pressure' ? 'Pressure distribution' : 'Velocity magnitude and vectors'}
                </div>
              </div>
              {cfdResults && (
                <button
                  onClick={exportCFDReport}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              )}
            </div>

            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              className="w-full h-auto bg-gray-900 border border-gray-700 rounded"
            />

            {isRunning && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Computing CFD solution...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {cfdResults && (
              <div className="mt-4 space-y-4">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Activity className="w-3 h-3" />
                      Max Velocity
                    </div>
                    <div className="text-white text-lg font-semibold">{cfdResults.metrics.maxVelocity.toFixed(2)} m/s</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Thermometer className="w-3 h-3" />
                      Avg Temperature
                    </div>
                    <div className="text-white text-lg font-semibold">{cfdResults.metrics.avgTemperature.toFixed(1)}°C</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Wind className="w-3 h-3" />
                      Air Changes/Hour
                    </div>
                    <div className="text-white text-lg font-semibold">{cfdResults.metrics.airChangeRate.toFixed(1)}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Gauge className="w-3 h-3" />
                      Pressure Drop
                    </div>
                    <div className="text-white text-lg font-semibold">{(cfdResults.metrics.pressureDrop / 1000).toFixed(1)} kPa</div>
                  </div>
                </div>
                
                {/* Thermal Comfort */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Thermal Comfort Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">PMV (Predicted Mean Vote)</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xl font-bold ${
                          Math.abs(cfdResults.metrics.thermalComfort.pmv) < 0.5 ? 'text-green-400' :
                          Math.abs(cfdResults.metrics.thermalComfort.pmv) < 1 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {cfdResults.metrics.thermalComfort.pmv.toFixed(2)}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({cfdResults.metrics.thermalComfort.pmv < -0.5 ? 'Cool' :
                            cfdResults.metrics.thermalComfort.pmv > 0.5 ? 'Warm' : 'Neutral'})
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">PPD (% Dissatisfied)</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xl font-bold ${
                          cfdResults.metrics.thermalComfort.ppd < 10 ? 'text-green-400' :
                          cfdResults.metrics.thermalComfort.ppd < 20 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {cfdResults.metrics.thermalComfort.ppd.toFixed(0)}%
                        </div>
                        {cfdResults.metrics.thermalComfort.ppd < 10 && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs">Mixing Efficiency</div>
                    <div className="text-white text-lg font-semibold">
                      {(cfdResults.metrics.mixingEfficiency * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs">Temp Range</div>
                    <div className="text-white text-lg font-semibold">
                      {cfdResults.metrics.minTemperature.toFixed(1)} - {cfdResults.metrics.maxTemperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs">Convergence</div>
                    <div className="text-white text-lg font-semibold">
                      {cfdResults.convergenceHistory.length} iter
                    </div>
                  </div>
                </div>
              </div>
            )}

            {cfdResults && (
              <div className="mt-4 space-y-3">
                {/* Analysis Summary */}
                <div className="p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">CFD Analysis Complete</p>
                      <p>
                        Airflow simulation converged after {cfdResults.convergenceHistory.length} iterations.
                        {cfdResults.metrics.airChangeRate < 4 && ' Consider increasing ventilation for better air circulation.'}
                        {cfdResults.metrics.thermalComfort.ppd > 20 && ' Thermal comfort could be improved.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Warnings */}
                {(cfdResults.metrics.maxTemperature > 30 || cfdResults.metrics.airChangeRate < 2) && (
                  <div className="p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-300">
                        <p className="font-medium mb-1">Recommendations</p>
                        <ul className="list-disc list-inside space-y-1">
                          {cfdResults.metrics.maxTemperature > 30 && (
                            <li>High temperatures detected - increase cooling capacity</li>
                          )}
                          {cfdResults.metrics.airChangeRate < 2 && (
                            <li>Low air exchange rate - improve ventilation system</li>
                          )}
                          {cfdResults.metrics.mixingEfficiency < 0.5 && (
                            <li>Poor air mixing - consider adding circulation fans</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}