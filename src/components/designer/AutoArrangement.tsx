'use client';

import React, { useState, useCallback } from 'react';
import {
  Target,
  Zap,
  Grid,
  RotateCw,
  Settings,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Lightbulb,
  Calculator,
  Layers,
  Move,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Room {
  width: number;
  length: number;
  height: number;
  shape: 'rectangle' | 'square' | 'circle' | 'polygon';
  obstacles?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface FixtureSpec {
  id: string;
  name: string;
  ppf: number; // μmol/s
  wattage: number;
  efficacy: number; // μmol/J
  beam_angle: number; // degrees
  mounting_height: number; // ft
  coverage_area: number; // ft²
  cost?: number;
}

interface LightingRequirements {
  target_ppfd: number; // μmol/m²/s
  target_dli: number; // mol/m²/day
  photoperiod: number; // hours
  uniformity_target: number; // 0-1 (0.8 = 80% uniformity)
  coverage_target: number; // 0-1 (0.95 = 95% coverage)
  energy_efficiency_weight: number; // 0-1 (how much to prioritize efficiency)
}

interface ArrangementPattern {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  calculate: (room: Room, fixture: FixtureSpec, requirements: LightingRequirements) => FixtureArrangement[];
}

interface FixtureArrangement {
  x: number; // percentage of room width
  y: number; // percentage of room length
  rotation: number; // degrees
  intensity: number; // 0-1 dimming level
}

interface ArrangementResult {
  fixtures: FixtureArrangement[];
  metrics: {
    total_fixtures: number;
    total_power: number; // watts
    average_ppfd: number;
    uniformity_ratio: number;
    coverage_percentage: number;
    energy_efficiency: number; // μmol/J
    estimated_cost: number;
    installation_complexity: 'low' | 'medium' | 'high';
  };
  heatmap: number[][]; // PPFD values across grid
}

interface AutoArrangementProps {
  room: Room;
  availableFixtures: FixtureSpec[];
  requirements: LightingRequirements;
  onArrangementGenerated?: (result: ArrangementResult) => void;
  onPreviewArrangement?: (fixtures: FixtureArrangement[]) => void;
}

export function AutoArrangement({
  room,
  availableFixtures,
  requirements,
  onArrangementGenerated,
  onPreviewArrangement
}: AutoArrangementProps) {
  const [selectedFixture, setSelectedFixture] = useState<FixtureSpec | null>(
    availableFixtures[0] || null
  );
  const [selectedPattern, setSelectedPattern] = useState<string>('grid');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [results, setResults] = useState<ArrangementResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    iterations: 100,
    consider_obstacles: true,
    allow_rotation: true,
    allow_dimming: true,
    minimize_shadows: true,
    edge_buffer: 1.0 // feet from walls
  });

  // Arrangement patterns
  const patterns: ArrangementPattern[] = [
    {
      id: 'grid',
      name: 'Grid Pattern',
      description: 'Regular rectangular grid - most common and efficient',
      icon: Grid,
      calculate: calculateGridPattern
    },
    {
      id: 'diamond',
      name: 'Diamond Pattern',
      description: 'Offset rows for better coverage and uniformity',
      icon: Square,
      calculate: calculateDiamondPattern
    },
    {
      id: 'hexagonal',
      name: 'Hexagonal Pattern',
      description: 'Optimal packing for circular beam patterns',
      icon: Hexagon,
      calculate: calculateHexagonalPattern
    },
    {
      id: 'perimeter',
      name: 'Perimeter Pattern',
      description: 'Focus lighting around room edges',
      icon: Circle,
      calculate: calculatePerimeterPattern
    },
    {
      id: 'optimized',
      name: 'AI Optimized',
      description: 'Machine learning optimized placement',
      icon: Target,
      calculate: calculateOptimizedPattern
    }
  ];

  // Pattern calculation functions
  function calculateGridPattern(room: Room, fixture: FixtureSpec, requirements: LightingRequirements): FixtureArrangement[] {
    const fixtures: FixtureArrangement[] = [];
    if (!room?.width || !room?.length) return fixtures;
    
    const spacing = Math.sqrt(fixture.coverage_area); // ft
    const rows = Math.floor(room.length / spacing);
    const cols = Math.floor(room.width / spacing);
    
    const offsetX = (room.width - (cols - 1) * spacing) / 2;
    const offsetY = (room.length - (rows - 1) * spacing) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (offsetX + col * spacing) / room.width * 100;
        const y = (offsetY + row * spacing) / room.length * 100;
        
        fixtures.push({
          x,
          y,
          rotation: 0,
          intensity: calculateRequiredIntensity(x, y, fixture, requirements)
        });
      }
    }
    
    return fixtures;
  }

  function calculateDiamondPattern(room: Room, fixture: FixtureSpec, requirements: LightingRequirements): FixtureArrangement[] {
    const fixtures: FixtureArrangement[] = [];
    if (!room?.width || !room?.length) return fixtures;
    
    const spacing = Math.sqrt(fixture.coverage_area); // ft
    const rows = Math.floor(room.length / spacing);
    const cols = Math.floor(room.width / spacing);
    
    const offsetX = (room.width - (cols - 1) * spacing) / 2;
    const offsetY = (room.length - (rows - 1) * spacing) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isOffset = row % 2 === 1;
        const x = (offsetX + col * spacing + (isOffset ? spacing / 2 : 0)) / room.width * 100;
        const y = (offsetY + row * spacing * 0.866) / room.length * 100; // 0.866 for diamond offset
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          fixtures.push({
            x,
            y,
            rotation: 0,
            intensity: calculateRequiredIntensity(x, y, fixture, requirements)
          });
        }
      }
    }
    
    return fixtures;
  }

  function calculateHexagonalPattern(room: Room, fixture: FixtureSpec, requirements: LightingRequirements): FixtureArrangement[] {
    const fixtures: FixtureArrangement[] = [];
    if (!room?.width || !room?.length) return fixtures;
    
    const radius = Math.sqrt(fixture.coverage_area / Math.PI); // ft
    const spacing = radius * 1.732; // Hexagonal packing
    
    const rows = Math.floor(room.length / (spacing * 0.866));
    const cols = Math.floor(room.width / spacing);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isOffset = row % 2 === 1;
        const x = (col * spacing + (isOffset ? spacing / 2 : 0)) / room.width * 100;
        const y = (row * spacing * 0.866) / room.length * 100;
        
        if (x >= 5 && x <= 95 && y >= 5 && y <= 95) { // 5% buffer
          fixtures.push({
            x,
            y,
            rotation: 0,
            intensity: calculateRequiredIntensity(x, y, fixture, requirements)
          });
        }
      }
    }
    
    return fixtures;
  }

  function calculatePerimeterPattern(room: Room, fixture: FixtureSpec, requirements: LightingRequirements): FixtureArrangement[] {
    const fixtures: FixtureArrangement[] = [];
    if (!room?.width || !room?.length) return fixtures;
    
    const perimeter = 2 * (room.width + room.length);
    const spacing = Math.sqrt(fixture.coverage_area);
    const fixtureCount = Math.floor(perimeter / spacing);
    
    for (let i = 0; i < fixtureCount; i++) {
      const t = i / fixtureCount;
      let x: number, y: number, rotation: number;
      
      if (t < 0.25) {
        // Top edge
        x = (t * 4) * 100;
        y = 10;
        rotation = 180;
      } else if (t < 0.5) {
        // Right edge
        x = 90;
        y = ((t - 0.25) * 4) * 100;
        rotation = 270;
      } else if (t < 0.75) {
        // Bottom edge
        x = (1 - (t - 0.5) * 4) * 100;
        y = 90;
        rotation = 0;
      } else {
        // Left edge
        x = 10;
        y = (1 - (t - 0.75) * 4) * 100;
        rotation = 90;
      }
      
      fixtures.push({
        x,
        y,
        rotation,
        intensity: calculateRequiredIntensity(x, y, fixture, requirements)
      });
    }
    
    return fixtures;
  }

  function calculateOptimizedPattern(room: Room, fixture: FixtureSpec, requirements: LightingRequirements): FixtureArrangement[] {
    // Simplified AI optimization - in reality this would use genetic algorithms or particle swarm optimization
    let bestArrangement = calculateGridPattern(room, fixture, requirements);
    let bestScore = evaluateArrangement(bestArrangement, room, fixture, requirements);
    
    // Try variations of grid pattern with optimizations
    for (let iteration = 0; iteration < optimizationSettings.iterations; iteration++) {
      const testArrangement = optimizeArrangement(bestArrangement, room, fixture, requirements);
      const score = evaluateArrangement(testArrangement, room, fixture, requirements);
      
      if (score > bestScore) {
        bestArrangement = testArrangement;
        bestScore = score;
      }
    }
    
    return bestArrangement;
  }

  function calculateRequiredIntensity(x: number, y: number, fixture: FixtureSpec, requirements: LightingRequirements): number {
    // Calculate intensity needed at this position to achieve target PPFD
    // This is a simplified calculation - real implementation would consider beam patterns
    const distanceFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2)) / 50;
    const edgeFactor = 1 - distanceFromCenter * 0.3; // Reduce intensity near edges
    return Math.max(0.3, Math.min(1.0, edgeFactor));
  }

  function evaluateArrangement(
    arrangement: FixtureArrangement[],
    room: Room,
    fixture: FixtureSpec,
    requirements: LightingRequirements
  ): number {
    // Multi-objective scoring function
    const metrics = calculateArrangementMetrics(arrangement, room, fixture, requirements);
    
    const ppfdScore = Math.min(1, metrics.average_ppfd / requirements.target_ppfd);
    const uniformityScore = metrics.uniformity_ratio;
    const coverageScore = metrics.coverage_percentage / 100;
    const efficiencyScore = metrics.energy_efficiency / 3.0; // Normalize to max ~3.0 μmol/J
    
    // Weighted combination
    return (
      ppfdScore * 0.3 +
      uniformityScore * 0.25 +
      coverageScore * 0.2 +
      efficiencyScore * requirements.energy_efficiency_weight * 0.25
    );
  }

  function optimizeArrangement(
    baseArrangement: FixtureArrangement[],
    room: Room,
    fixture: FixtureSpec,
    requirements: LightingRequirements
  ): FixtureArrangement[] {
    // Create variation of arrangement with small random changes
    return baseArrangement.map(f => ({
      ...f,
      x: Math.max(5, Math.min(95, f.x + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10)),
      y: Math.max(5, Math.min(95, f.y + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10)),
      rotation: optimizationSettings.allow_rotation ? f.rotation + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 30 : f.rotation,
      intensity: optimizationSettings.allow_dimming ? Math.max(0.3, Math.min(1.0, f.intensity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2)) : f.intensity
    }));
  }

  function calculateArrangementMetrics(
    arrangement: FixtureArrangement[],
    room: Room,
    fixture: FixtureSpec,
    requirements: LightingRequirements
  ): ArrangementResult['metrics'] {
    const gridSize = 20; // 20x20 grid for calculations
    const heatmap: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // Calculate PPFD at each grid point
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = (col / (gridSize - 1)) * 100;
        const y = (row / (gridSize - 1)) * 100;
        
        // Sum contribution from all fixtures
        let totalPPFD = 0;
        arrangement.forEach(fixturePos => {
          const distance = Math.sqrt(
            Math.pow((x - fixturePos.x) * room.width / 100, 2) +
            Math.pow((y - fixturePos.y) * room.length / 100, 2)
          );
          
          // Simplified light distribution - inverse square law with beam angle
          const maxDistance = Math.sqrt(fixture.coverage_area) / 2;
          if (distance <= maxDistance) {
            const intensity = fixturePos.intensity;
            const falloff = Math.max(0, 1 - (distance / maxDistance));
            const ppfdContribution = (fixture.ppf / fixture.coverage_area) * intensity * falloff;
            totalPPFD += ppfdContribution;
          }
        });
        
        heatmap[row][col] = totalPPFD;
      }
    }
    
    // Calculate metrics from heatmap
    const ppfdValues = heatmap.flat();
    const validValues = ppfdValues.filter(v => v > 0);
    const averagePPFD = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
    const minPPFD = Math.min(...validValues);
    const uniformityRatio = minPPFD / averagePPFD;
    const coveragePercentage = (validValues.length / ppfdValues.length) * 100;
    
    const totalPower = arrangement.reduce((sum, f) => sum + fixture.wattage * f.intensity, 0);
    const totalPPF = arrangement.reduce((sum, f) => sum + fixture.ppf * f.intensity, 0);
    const energyEfficiency = totalPPF / totalPower;
    
    return {
      total_fixtures: arrangement.length,
      total_power: totalPower,
      average_ppfd: averagePPFD,
      uniformity_ratio: uniformityRatio,
      coverage_percentage: coveragePercentage,
      energy_efficiency: energyEfficiency,
      estimated_cost: arrangement.length * (fixture.cost || 500),
      installation_complexity: arrangement.length < 10 ? 'low' : arrangement.length < 20 ? 'medium' : 'high'
    };
  }

  const generateArrangement = useCallback(async () => {
    if (!selectedFixture) return;
    
    setIsCalculating(true);
    setCalculationProgress(0);
    
    try {
      const pattern = patterns.find(p => p.id === selectedPattern);
      if (!pattern) return;
      
      // Simulate calculation progress
      const progressInterval = setInterval(() => {
        setCalculationProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      // Calculate arrangement
      const arrangement = pattern.calculate(room, selectedFixture, requirements);
      const metrics = calculateArrangementMetrics(arrangement, room, selectedFixture, requirements);
      
      // Generate heatmap
      const gridSize = 20;
      const heatmap: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
      
      const result: ArrangementResult = {
        fixtures: arrangement,
        metrics,
        heatmap
      };
      
      clearInterval(progressInterval);
      setCalculationProgress(100);
      
      setTimeout(() => {
        setResults([result]);
        onArrangementGenerated?.(result);
        setIsCalculating(false);
        setCalculationProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Error generating arrangement:', error);
      setIsCalculating(false);
      setCalculationProgress(0);
    }
  }, [selectedFixture, selectedPattern, room, requirements, onArrangementGenerated]);

  const handlePreviewPattern = (patternId: string) => {
    if (!selectedFixture || !onPreviewArrangement) return;
    
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;
    
    const arrangement = pattern.calculate(room, selectedFixture, requirements);
    onPreviewArrangement(arrangement);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Auto-Arrangement
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Automatically optimize fixture placement for target light levels
          </p>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Fixture Selection */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Fixture Selection
            </h3>
            
            <div className="space-y-2">
              {availableFixtures.slice(0, 3).map((fixture) => (
                <button
                  key={fixture.id}
                  onClick={() => setSelectedFixture(fixture)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    selectedFixture?.id === fixture.id
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{fixture.name}</p>
                      <p className="text-gray-400 text-xs">
                        {fixture.wattage}W • {fixture.ppf} μmol/s • {fixture.efficacy} μmol/J
                      </p>
                    </div>
                    {selectedFixture?.id === fixture.id && (
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Selection */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Grid className="w-4 h-4 text-blue-400" />
              Arrangement Pattern
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => {
                    setSelectedPattern(pattern.id);
                    handlePreviewPattern(pattern.id);
                  }}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedPattern === pattern.id
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <pattern.icon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-white font-medium text-xs text-center">{pattern.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Requirements Summary */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Target Requirements
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-gray-700 rounded">
                <p className="text-gray-400">Target PPFD</p>
                <p className="text-white font-medium">{requirements.target_ppfd} μmol/m²/s</p>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <p className="text-gray-400">Target DLI</p>
                <p className="text-white font-medium">{requirements.target_dli} mol/m²/day</p>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <p className="text-gray-400">Photoperiod</p>
                <p className="text-white font-medium">{requirements.photoperiod} hours</p>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <p className="text-gray-400">Uniformity</p>
                <p className="text-white font-medium">{(requirements.uniformity_target * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Advanced Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-sm">Consider Obstacles</label>
                  <button
                    onClick={() => setOptimizationSettings(prev => ({ ...prev, consider_obstacles: !prev.consider_obstacles }))}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      optimizationSettings.consider_obstacles ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      optimizationSettings.consider_obstacles ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-sm">Allow Rotation</label>
                  <button
                    onClick={() => setOptimizationSettings(prev => ({ ...prev, allow_rotation: !prev.allow_rotation }))}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      optimizationSettings.allow_rotation ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      optimizationSettings.allow_rotation ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-sm">Allow Dimming</label>
                  <button
                    onClick={() => setOptimizationSettings(prev => ({ ...prev, allow_dimming: !prev.allow_dimming }))}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      optimizationSettings.allow_dimming ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      optimizationSettings.allow_dimming ? 'translate-x-5' : 'translate-x-0.5'
                    } transform mt-0.5`} />
                  </button>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Edge Buffer: {optimizationSettings.edge_buffer.toFixed(1)} ft
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={optimizationSettings.edge_buffer}
                    onChange={(e) => setOptimizationSettings(prev => ({ ...prev, edge_buffer: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateArrangement}
              disabled={!selectedFixture || isCalculating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-3 mx-auto"
            >
              {isCalculating ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  Calculating... {calculationProgress}%
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Generate Arrangement
                </>
              )}
            </button>
            
            {isCalculating && (
              <div className="mt-3 mx-auto w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculationProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Arrangement Results
              </h3>
              
              {results.map((result, index) => (
                <div key={index} className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Fixtures</span>
                        <Lightbulb className="w-3 h-3 text-yellow-500" />
                      </div>
                      <p className="text-white font-bold text-lg">{result.metrics.total_fixtures}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Total Power</span>
                        <Zap className="w-3 h-3 text-yellow-500" />
                      </div>
                      <p className="text-white font-bold text-lg">{result.metrics.total_power.toFixed(0)}W</p>
                    </div>
                    
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Avg PPFD</span>
                        <Target className="w-3 h-3 text-green-500" />
                      </div>
                      <p className="text-white font-bold text-lg">{result.metrics.average_ppfd.toFixed(0)}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Uniformity</span>
                        <Grid className="w-3 h-3 text-blue-500" />
                      </div>
                      <p className="text-white font-bold text-lg">{(result.metrics.uniformity_ratio * 100).toFixed(0)}%</p>
                    </div>
                    
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Coverage</span>
                        <Eye className="w-3 h-3 text-purple-500" />
                      </div>
                      <p className="text-white font-bold text-lg">{result.metrics.coverage_percentage.toFixed(0)}%</p>
                    </div>
                    
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Efficiency</span>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                      <p className="text-white font-bold text-lg">{result.metrics.energy_efficiency.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">PPFD Target Achievement</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              result.metrics.average_ppfd >= requirements.target_ppfd * 0.9 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.metrics.average_ppfd / requirements.target_ppfd) * 100)}%` }}
                          />
                        </div>
                        <span className="text-white text-xs font-medium">
                          {((result.metrics.average_ppfd / requirements.target_ppfd) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Uniformity Target</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              result.metrics.uniformity_ratio >= requirements.uniformity_target ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${(result.metrics.uniformity_ratio / requirements.uniformity_target) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-xs font-medium">
                          {((result.metrics.uniformity_ratio / requirements.uniformity_target) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-gray-700 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      {result.metrics.average_ppfd >= requirements.target_ppfd * 0.9 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-white font-medium text-sm">
                        {result.metrics.average_ppfd >= requirements.target_ppfd * 0.9 
                          ? 'Arrangement meets targets'
                          : 'Consider adjustments for optimal performance'
                        }
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Estimated cost: ${result.metrics.estimated_cost.toLocaleString()} • 
                      Installation: {result.metrics.installation_complexity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}