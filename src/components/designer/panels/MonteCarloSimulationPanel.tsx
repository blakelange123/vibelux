'use client';

import React, { useState, useCallback } from 'react';
import { X, Play, Square, Settings, Download, Eye, Zap, Lightbulb, Target, BarChart3, Palette } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  MonteCarloRaytracer, 
  SimulationParameters, 
  IlluminanceResult, 
  Vector3D,
  Surface,
  LightSource,
  DEFAULT_SIMULATION_PARAMETERS 
} from '@/lib/monte-carlo-raytracing';

interface MonteCarloSimulationPanelProps {
  onClose: () => void;
}

interface SimulationResult {
  points: Vector3D[];
  results: IlluminanceResult[];
  statistics: {
    totalRays: number;
    processingTime: number;
    convergenceRate: number;
    averageIlluminance: number;
    uniformityRatio: number;
    energyEfficiency: number;
  };
}

export function MonteCarloSimulationPanel({ onClose }: MonteCarloSimulationPanelProps) {
  const { state } = useDesigner();
  const { room, objects } = state;
  const { showNotification } = useNotifications();

  const [isRunning, setIsRunning] = useState(false);
  const [parameters, setParameters] = useState<SimulationParameters>(DEFAULT_SIMULATION_PARAMETERS);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<'illuminance' | 'uniformity' | 'glare' | 'spectrum'>('illuminance');
  const [gridResolution, setGridResolution] = useState(20);
  const [analysisHeight, setAnalysisHeight] = useState(0.75); // 30 inches above floor
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  /**
   * Generate measurement grid points
   */
  const generateMeasurementGrid = useCallback((resolution: number, height: number): Vector3D[] => {
    const points: Vector3D[] = [];
    const stepX = room.width / (resolution - 1);
    const stepY = room.length / (resolution - 1);
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        points.push({
          x: i * stepX,
          y: j * stepY,
          z: height
        });
      }
    }
    
    return points;
  }, [room]);

  /**
   * Convert room objects to simulation geometry
   */
  const convertObjectsToGeometry = useCallback((): { surfaces: Surface[], lightSources: LightSource[] } => {
    const surfaces: Surface[] = [];
    const lightSources: LightSource[] = [];

    // Add room walls
    surfaces.push({
      id: 'floor',
      vertices: [
        { x: 0, y: 0, z: 0 },
        { x: room.width, y: 0, z: 0 },
        { x: room.width, y: room.length, z: 0 },
        { x: 0, y: room.length, z: 0 }
      ],
      normal: { x: 0, y: 0, z: 1 },
      material: { 
        id: 'concrete', 
        name: 'Concrete Floor',
        reflectance: { wavelengths: [400, 500, 600, 700], values: [0.4, 0.4, 0.4, 0.4] },
        transmittance: { wavelengths: [400, 500, 600, 700], values: [0.0, 0.0, 0.0, 0.0] },
        absorptance: { wavelengths: [400, 500, 600, 700], values: [0.6, 0.6, 0.6, 0.6] },
        roughness: 0.8,
        specularComponent: 0.1,
        diffuseComponent: 0.9,
        isEmissive: false
      },
      area: room.width * room.length
    });

    surfaces.push({
      id: 'ceiling',
      vertices: [
        { x: 0, y: 0, z: room.height },
        { x: 0, y: room.length, z: room.height },
        { x: room.width, y: room.length, z: room.height },
        { x: room.width, y: 0, z: room.height }
      ],
      normal: { x: 0, y: 0, z: -1 },
      material: { 
        id: 'white_paint', 
        name: 'White Ceiling',
        reflectance: { wavelengths: [400, 500, 600, 700], values: [0.85, 0.85, 0.85, 0.85] },
        transmittance: { wavelengths: [400, 500, 600, 700], values: [0.0, 0.0, 0.0, 0.0] },
        absorptance: { wavelengths: [400, 500, 600, 700], values: [0.15, 0.15, 0.15, 0.15] },
        roughness: 0.9,
        specularComponent: 0.1,
        diffuseComponent: 0.9,
        isEmissive: false
      },
      area: room.width * room.length
    });

    // Convert fixtures to light sources
    objects.filter(obj => obj.type === 'fixture' && obj.enabled).forEach((fixture, index) => {
      const model = (fixture as any).model;
      const wattage = model?.wattage || 600;
      const ppf = model?.ppf || 1620;
      const beamAngle = model?.beamAngle || 120;

      // Create realistic LED spectrum
      const spectrum = {
        wavelengths: [380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720, 740, 760, 780],
        values: [0.05, 0.1, 0.3, 0.5, 0.7, 0.4, 0.3, 0.2, 0.25, 0.3, 0.35, 0.8, 0.9, 1.0, 0.95, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01]
      };

      // Create photometric distribution (simplified)
      const photometricDistribution: number[][] = [];
      for (let angle = 0; angle <= 180; angle += 10) {
        const intensity = angle <= beamAngle / 2 ? 
          Math.cos(angle * Math.PI / 180) : 
          Math.max(0, Math.cos(angle * Math.PI / 180) * 0.1);
        photometricDistribution.push([angle, intensity]);
      }

      lightSources.push({
        id: `fixture_${index}`,
        position: { x: fixture.x, y: fixture.y, z: fixture.z },
        direction: { x: 0, y: 0, z: -1 }, // Pointing down
        beamAngle,
        powerDistribution: spectrum,
        totalLumens: ppf * 15, // Approximate conversion
        photometricDistribution
      });
    });

    // Convert other objects to surfaces
    objects.filter(obj => obj.type !== 'fixture').forEach((obj, index) => {
      const vertices = [
        { x: obj.x - obj.width/2, y: obj.y - obj.length/2, z: obj.z },
        { x: obj.x + obj.width/2, y: obj.y - obj.length/2, z: obj.z },
        { x: obj.x + obj.width/2, y: obj.y + obj.length/2, z: obj.z },
        { x: obj.x - obj.width/2, y: obj.y + obj.length/2, z: obj.z }
      ];

      let materialId = 'concrete';
      if (obj.type === 'bench') materialId = 'aluminum';
      if (obj.type === 'plant') materialId = 'plant_leaf';

      surfaces.push({
        id: `object_${index}`,
        vertices,
        normal: { x: 0, y: 0, z: 1 },
        material: { 
          id: materialId, 
          name: `${obj.type} surface`,
          reflectance: { wavelengths: [400, 500, 600, 700], values: [0.5, 0.5, 0.5, 0.5] },
          transmittance: { wavelengths: [400, 500, 600, 700], values: [0.0, 0.0, 0.0, 0.0] },
          absorptance: { wavelengths: [400, 500, 600, 700], values: [0.5, 0.5, 0.5, 0.5] },
          roughness: 0.7,
          specularComponent: 0.3,
          diffuseComponent: 0.7,
          isEmissive: false
        },
        area: obj.width * obj.length
      });
    });

    return { surfaces, lightSources };
  }, [objects, room]);

  /**
   * Run Monte Carlo simulation
   */
  const runSimulation = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    showNotification('info', 'Starting Monte Carlo ray-tracing simulation...');

    try {
      const startTime = Date.now();
      const raytracer = new MonteCarloRaytracer();
      
      // Setup scene geometry
      const { surfaces, lightSources } = convertObjectsToGeometry();
      
      surfaces.forEach(surface => raytracer.addSurface(surface));
      lightSources.forEach(source => raytracer.addLightSource(source));

      // Generate measurement points
      const measurementPoints = generateMeasurementGrid(gridResolution, analysisHeight);

      // Run simulation
      const simulationResults = await raytracer.runSimulation(measurementPoints, parameters);

      const processingTime = Date.now() - startTime;

      // Calculate statistics
      const averageIlluminance = simulationResults.reduce((sum, result) => sum + result.illuminance, 0) / simulationResults.length;
      const minIlluminance = Math.min(...simulationResults.map(r => r.illuminance));
      const uniformityRatio = minIlluminance / averageIlluminance;

      const totalFixturePower = lightSources.reduce((sum, source) => {
        const fixture = objects.find(obj => obj.type === 'fixture');
        return sum + ((fixture as any)?.model?.wattage || 600);
      }, 0);

      const energyEfficiency = totalFixturePower > 0 ? averageIlluminance / totalFixturePower : 0;

      const result: SimulationResult = {
        points: measurementPoints,
        results: simulationResults,
        statistics: {
          totalRays: parameters.rayCount * lightSources.length,
          processingTime,
          convergenceRate: 0.95, // Placeholder
          averageIlluminance,
          uniformityRatio,
          energyEfficiency
        }
      };

      setResults(result);
      showNotification('success', `Simulation completed in ${(processingTime / 1000).toFixed(1)}s`);

    } catch (error) {
      console.error('Simulation error:', error);
      showNotification('error', 'Simulation failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  }, [
    isRunning, 
    parameters, 
    convertObjectsToGeometry, 
    generateMeasurementGrid, 
    gridResolution, 
    analysisHeight, 
    objects, 
    showNotification
  ]);

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    showNotification('info', 'Simulation stopped');
  }, [showNotification]);

  /**
   * Export results
   */
  const exportResults = useCallback(() => {
    if (!results) return;

    const exportData = {
      parameters,
      results: results.results,
      statistics: results.statistics,
      room: { width: room.width, length: room.length, height: room.height },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monte-carlo-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('success', 'Results exported successfully');
  }, [results, parameters, room, showNotification]);

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">Monte Carlo Ray-Tracing</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Simulation Controls */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Simulation Controls</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ray Count
              </label>
              <select
                value={parameters.rayCount}
                onChange={(e) => setParameters(prev => ({ ...prev, rayCount: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              >
                <option value={10000}>10K (Fast)</option>
                <option value={50000}>50K (Balanced)</option>
                <option value={100000}>100K (Accurate)</option>
                <option value={500000}>500K (High Quality)</option>
                <option value={1000000}>1M (Maximum)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Grid Resolution
              </label>
              <select
                value={gridResolution}
                onChange={(e) => setGridResolution(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              >
                <option value={10}>10×10 (Coarse)</option>
                <option value={20}>20×20 (Standard)</option>
                <option value={30}>30×30 (Fine)</option>
                <option value={50}>50×50 (Very Fine)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Analysis Height (m)
              </label>
              <input
                type="number"
                value={analysisHeight}
                onChange={(e) => setAnalysisHeight(parseFloat(e.target.value))}
                step={0.1}
                min={0}
                max={room.height}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max Bounces
              </label>
              <input
                type="number"
                value={parameters.maxBounces}
                onChange={(e) => setParameters(prev => ({ ...prev, maxBounces: parseInt(e.target.value) }))}
                min={1}
                max={50}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-4"
          >
            <Settings className="w-4 h-4" />
            Advanced Settings
          </button>

          {showAdvancedSettings && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-800/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Wavelength Range (nm)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={parameters.wavelengthRange[0]}
                    onChange={(e) => setParameters(prev => ({ 
                      ...prev, 
                      wavelengthRange: [parseInt(e.target.value), prev.wavelengthRange[1]] 
                    }))}
                    min={350}
                    max={750}
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={isRunning}
                  />
                  <span className="text-gray-400 py-1">-</span>
                  <input
                    type="number"
                    value={parameters.wavelengthRange[1]}
                    onChange={(e) => setParameters(prev => ({ 
                      ...prev, 
                      wavelengthRange: [prev.wavelengthRange[0], parseInt(e.target.value)] 
                    }))}
                    min={450}
                    max={850}
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Spectral Resolution (nm)
                </label>
                <input
                  type="number"
                  value={parameters.spectralResolution}
                  onChange={(e) => setParameters(prev => ({ ...prev, spectralResolution: parseInt(e.target.value) }))}
                  min={1}
                  max={50}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  disabled={isRunning}
                />
              </div>

              <div className="col-span-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={parameters.importanceSampling}
                      onChange={(e) => setParameters(prev => ({ ...prev, importanceSampling: e.target.checked }))}
                      disabled={isRunning}
                      className="rounded"
                    />
                    Importance Sampling
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={parameters.adaptiveSampling}
                      onChange={(e) => setParameters(prev => ({ ...prev, adaptiveSampling: e.target.checked }))}
                      disabled={isRunning}
                      className="rounded"
                    />
                    Adaptive Sampling
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            <button
              onClick={isRunning ? stopSimulation : runSimulation}
              disabled={!objects.some(obj => obj.type === 'fixture' && obj.enabled)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400'
              }`}
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Stop Simulation' : 'Start Simulation'}
            </button>

            {results && (
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>

          {!objects.some(obj => obj.type === 'fixture' && obj.enabled) && (
            <p className="text-sm text-amber-400 mt-2">
              Add at least one enabled fixture to run simulation
            </p>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-4">Simulation Results</h3>

            {/* Analysis Type Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedAnalysis('illuminance')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedAnalysis === 'illuminance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Illuminance
              </button>
              <button
                onClick={() => setSelectedAnalysis('uniformity')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedAnalysis === 'uniformity'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Target className="w-4 h-4" />
                Uniformity
              </button>
              <button
                onClick={() => setSelectedAnalysis('glare')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedAnalysis === 'glare'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                Glare
              </button>
              <button
                onClick={() => setSelectedAnalysis('spectrum')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedAnalysis === 'spectrum'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                Spectrum
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Average Illuminance</div>
                <div className="text-lg font-semibold text-white">
                  {results.statistics.averageIlluminance.toFixed(0)} lux
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Uniformity Ratio</div>
                <div className="text-lg font-semibold text-white">
                  {results.statistics.uniformityRatio.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Energy Efficiency</div>
                <div className="text-lg font-semibold text-white">
                  {results.statistics.energyEfficiency.toFixed(1)} lux/W
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Processing Time</div>
                <div className="text-lg font-semibold text-white">
                  {(results.statistics.processingTime / 1000).toFixed(1)}s
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3 capitalize">
                {selectedAnalysis} Analysis
              </h4>
              
              {selectedAnalysis === 'illuminance' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    Range: {Math.min(...results.results.map(r => r.illuminance)).toFixed(0)} - {Math.max(...results.results.map(r => r.illuminance)).toFixed(0)} lux
                  </div>
                  <div className="h-32 bg-gray-900 rounded p-2 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 120">
                      {/* Grid background */}
                      <rect width="400" height="120" fill="#1a1a1a" />
                      
                      {/* Heat map visualization */}
                      {results.results.slice(0, 50).map((result, idx) => {
                        const x = (idx % 10) * 40;
                        const y = Math.floor(idx / 10) * 24;
                        const intensity = result.illuminance / Math.max(...results.results.map(r => r.illuminance));
                        const color = `rgb(${Math.floor(255 * intensity)}, ${Math.floor(100 * intensity)}, ${Math.floor(50 * (1 - intensity))})`;
                        
                        return (
                          <rect
                            key={idx}
                            x={x}
                            y={y}
                            width="38"
                            height="22"
                            fill={color}
                            opacity="0.8"
                          />
                        );
                      })}
                      
                      {/* Scale legend */}
                      <defs>
                        <linearGradient id="scale" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#321919', stopOpacity: 1 }} />
                          <stop offset="50%" style={{ stopColor: '#ff6432', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#ff3232', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <rect x="10" y="100" width="380" height="10" fill="url(#scale)" />
                      <text x="10" y="118" fill="#666" fontSize="10">0 lux</text>
                      <text x="370" y="118" fill="#666" fontSize="10">{Math.max(...results.results.map(r => r.illuminance)).toFixed(0)} lux</text>
                    </svg>
                  </div>
                </div>
              )}

              {selectedAnalysis === 'uniformity' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    Min/Avg Ratio: {results.statistics.uniformityRatio.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Standard: {results.statistics.uniformityRatio >= 0.7 ? 'PASS' : 'FAIL'} (&gt;0.7 required)
                  </div>
                  <div className="h-32 bg-gray-900 rounded p-2">
                    <svg className="w-full h-full" viewBox="0 0 400 120">
                      {/* Background */}
                      <rect width="400" height="120" fill="#1a1a1a" />
                      
                      {/* Uniformity gradient visualization */}
                      {results.results.slice(0, 40).map((result, idx) => {
                        const x = (idx % 8) * 50;
                        const y = Math.floor(idx / 8) * 24;
                        const avg = results.statistics.averageIlluminance;
                        const deviation = Math.abs(result.illuminance - avg) / avg;
                        const uniformity = 1 - Math.min(deviation, 1);
                        
                        // Color based on uniformity (green = good, red = poor)
                        const r = Math.floor(255 * (1 - uniformity));
                        const g = Math.floor(255 * uniformity);
                        const color = `rgb(${r}, ${g}, 50)`;
                        
                        return (
                          <rect
                            key={idx}
                            x={x}
                            y={y}
                            width="48"
                            height="22"
                            fill={color}
                            opacity="0.7"
                          />
                        );
                      })}
                      
                      {/* Uniformity scale */}
                      <defs>
                        <linearGradient id="uniformScale" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#ff3232', stopOpacity: 1 }} />
                          <stop offset="50%" style={{ stopColor: '#ffff32', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#32ff32', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <rect x="10" y="100" width="380" height="10" fill="url(#uniformScale)" />
                      <text x="10" y="118" fill="#666" fontSize="10">Poor</text>
                      <text x="180" y="118" fill="#666" fontSize="10">Fair</text>
                      <text x="360" y="118" fill="#666" fontSize="10">Good</text>
                    </svg>
                  </div>
                </div>
              )}

              {selectedAnalysis === 'glare' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    Average UGR: {results.results.reduce((sum, r) => sum + r.glareIndex, 0) / results.results.length || 0}
                  </div>
                  <div className="h-32 bg-gray-900 rounded p-2">
                    <svg className="w-full h-full" viewBox="0 0 400 120">
                      {/* Background */}
                      <rect width="400" height="120" fill="#1a1a1a" />
                      
                      {/* UGR distribution bars */}
                      {[10, 13, 16, 19, 22, 25, 28].map((ugr, idx) => {
                        const count = results.results.filter(r => 
                          r.glareIndex >= ugr && r.glareIndex < ugr + 3
                        ).length;
                        const height = (count / results.results.length) * 80;
                        const x = 30 + idx * 50;
                        
                        return (
                          <g key={ugr}>
                            <rect
                              x={x}
                              y={90 - height}
                              width="40"
                              height={height}
                              fill={ugr <= 19 ? '#32ff32' : ugr <= 22 ? '#ffff32' : '#ff3232'}
                              opacity="0.7"
                            />
                            <text x={x + 20} y="105" fill="#666" fontSize="10" textAnchor="middle">
                              {ugr}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Axis labels */}
                      <text x="200" y="118" fill="#888" fontSize="11" textAnchor="middle">UGR Value</text>
                      <text x="15" y="50" fill="#888" fontSize="11" transform="rotate(-90 15 50)">Frequency</text>
                      
                      {/* Reference line at UGR 19 (comfortable limit) */}
                      <line x1="180" y1="0" x2="180" y2="90" stroke="#ffff00" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                      <text x="185" y="10" fill="#ffff00" fontSize="9">Comfort Limit</text>
                    </svg>
                  </div>
                </div>
              )}

              {selectedAnalysis === 'spectrum' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    Color Temperature Range: {Math.min(...results.results.map(r => r.colorTemperature)).toFixed(0)}K - {Math.max(...results.results.map(r => r.colorTemperature)).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-400">
                    Average CRI: {(results.results.reduce((sum, r) => sum + r.colorRenderingIndex, 0) / results.results.length).toFixed(0)}
                  </div>
                  <div className="h-32 bg-gray-900 rounded p-2">
                    <svg className="w-full h-full" viewBox="0 0 400 120">
                      {/* Background */}
                      <rect width="400" height="120" fill="#1a1a1a" />
                      
                      {/* Spectrum curve */}
                      <path
                        d={`M 20,${90 - 30} 
                            Q 60,${90 - 20} 100,${90 - 25}
                            T 180,${90 - 60}
                            T 260,${90 - 80}
                            T 340,${90 - 40}
                            L 380,${90 - 20}`}
                        fill="none"
                        stroke="#9333ea"
                        strokeWidth="2"
                      />
                      
                      {/* Spectrum fill */}
                      <path
                        d={`M 20,90 
                            L 20,${90 - 30} 
                            Q 60,${90 - 20} 100,${90 - 25}
                            T 180,${90 - 60}
                            T 260,${90 - 80}
                            T 340,${90 - 40}
                            L 380,${90 - 20}
                            L 380,90
                            Z`}
                        fill="url(#spectrumGradient)"
                        opacity="0.3"
                      />
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#4c1d95', stopOpacity: 1 }} />
                          <stop offset="20%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                          <stop offset="40%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                          <stop offset="60%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                          <stop offset="80%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      
                      {/* Wavelength markers */}
                      {[400, 500, 600, 700].map((wavelength, idx) => {
                        const x = 20 + (idx + 0.5) * 90;
                        return (
                          <g key={wavelength}>
                            <line x1={x} y1="90" x2={x} y2="95" stroke="#666" strokeWidth="1" />
                            <text x={x} y="105" fill="#666" fontSize="10" textAnchor="middle">
                              {wavelength}nm
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Axis labels */}
                      <text x="200" y="118" fill="#888" fontSize="11" textAnchor="middle">Wavelength (nm)</text>
                      <text x="15" y="50" fill="#888" fontSize="11" transform="rotate(-90 15 50)">Intensity</text>
                      
                      {/* Peak indicators */}
                      <circle cx="100" cy="65" r="3" fill="#2563eb" />
                      <circle cx="260" cy="10" r="3" fill="#dc2626" />
                      <text x="105" y="60" fill="#2563eb" fontSize="9">Blue Peak</text>
                      <text x="230" y="25" fill="#dc2626" fontSize="9">Red Peak</text>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isRunning && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 text-blue-400">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
              <span>Running Monte Carlo simulation...</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              This may take several minutes depending on scene complexity and ray count.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}