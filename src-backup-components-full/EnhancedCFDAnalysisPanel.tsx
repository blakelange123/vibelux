'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  Settings, 
  Play, 
  Download, 
  Info, 
  Grid3x3, 
  BarChart3,
  Pause,
  RotateCcw,
  Layers,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Fan,
  Building,
  ArrowUp,
  ArrowDown,
  Gauge,
  Map,
  Maximize2
} from 'lucide-react';
import { LEDControlPanel } from './LEDControlPanel';

interface BoundaryCondition {
  id: string;
  name: string;
  type: 'inlet' | 'outlet' | 'wall' | 'symmetry';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  properties: {
    velocity?: { x: number; y: number; z: number };
    temperature?: number;
    pressure?: number;
    turbulenceIntensity?: number;
    roughness?: number;
  };
}

interface DomainObject {
  id: string;
  name: string;
  type: 'heat-source' | 'obstacle' | 'porous-media' | 'fan';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  properties: {
    heatGeneration?: number;
    porosity?: number;
    resistance?: number;
    fanCurve?: { flow: number[]; pressure: number[] };
    material?: 'aluminum' | 'steel' | 'copper' | 'plastic' | 'plant-canopy';
  };
}

interface MeshSettings {
  baseSize: number;
  growthRate: number;
  maxSize: number;
  minSize: number;
  boundaryLayers: {
    enabled: boolean;
    firstLayerHeight: number;
    growthRate: number;
    numberOfLayers: number;
  };
  refinementRegions: {
    id: string;
    position: { x: number; y: number; z: number };
    dimensions: { width: number; height: number; depth: number };
    level: number;
  }[];
}

interface SolverSettings {
  type: 'steady' | 'transient';
  turbulenceModel: 'laminar' | 'k-epsilon' | 'k-omega-sst' | 'les' | 'rans';
  algorithm: 'SIMPLE' | 'SIMPLEC' | 'PISO' | 'COUPLED';
  discretization: {
    pressure: 'standard' | 'second-order' | 'body-force-weighted';
    momentum: 'first-order' | 'second-order' | 'quick';
    energy: 'first-order' | 'second-order';
    turbulence: 'first-order' | 'second-order';
  };
  relaxationFactors: {
    pressure: number;
    momentum: number;
    energy: number;
    turbulence: number;
  };
  convergenceCriteria: {
    continuity: number;
    momentum: number;
    energy: number;
    turbulence: number;
  };
  transientSettings?: {
    timeStep: number;
    numberOfTimeSteps: number;
    maxIterationsPerTimeStep: number;
  };
}

interface PhysicsModels {
  gravity: { enabled: boolean; vector: { x: number; y: number; z: number } };
  buoyancy: { enabled: boolean; referenceTemperature: number; thermalExpansion: number };
  radiation: { enabled: boolean; model: 'none' | 'p1' | 'discrete-ordinates' | 'surface-to-surface' };
  species: { enabled: boolean; co2Concentration?: number; humidity?: number };
  plantTranspiration: { enabled: boolean; leafAreaDensity?: number; stomatalResistance?: number };
}

interface SimulationResults {
  meshStatistics: {
    cellCount: number;
    faceCount: number;
    nodeCount: number;
    quality: { min: number; avg: number; max: number };
    skewness: { min: number; avg: number; max: number };
  };
  convergenceHistory: {
    iteration: number[];
    continuity: number[];
    momentum: number[];
    energy: number[];
    turbulence: number[];
  };
  fieldData: {
    velocity: { magnitude: number[][][]; vectors: { u: number; v: number; w: number }[][][] };
    temperature: number[][][];
    pressure: number[][][];
    turbulence: { k: number[][][]; epsilon: number[][][]; intensity: number[][][] };
    co2?: number[][][];
    humidity?: number[][][];
  };
  statistics: {
    velocity: { min: number; max: number; avg: number; uniformityIndex: number };
    temperature: { min: number; max: number; avg: number; uniformityIndex: number };
    pressure: { min: number; max: number; avg: number; drop: number };
    turbulence: { avgIntensity: number; maxIntensity: number };
    ventilation: {
      airChangeRate: number;
      meanAge: number;
      effectiveness: number;
      shortCircuiting: number;
    };
  };
  recommendations: {
    category: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    action: string;
  }[];
}

// LED Fixture interface for CFD integration
interface LEDFixture {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  specifications: {
    totalWattage: number;
    efficacy: number; // μmol/J
    efficiency: number; // percentage (90% = 10% heat)
    spectrum: {
      red: number;
      blue: number;
      white: number;
      farRed: number;
    };
    dimmingLevel: number; // 0-100%
    thermalDerating: {
      enabled: boolean;
      maxJunctionTemp: number; // °C
      deratingFactor: number; // %/°C
    };
  };
  thermal: {
    heatGeneration: number; // Calculated based on efficiency
    thermalResistance: number; // °C/W
    heatSinkMaterial: 'aluminum' | 'copper' | 'steel';
    heatSinkArea: number; // m²
    fanCooling: {
      enabled: boolean;
      airflow: number; // CFM
      power: number; // W
    };
  };
}

export function EnhancedCFDAnalysisPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIteration, setCurrentIteration] = useState(0);
  
  // Domain setup
  const [domain, setDomain] = useState({
    dimensions: { length: 30, width: 20, height: 5 }, // meters
    units: 'metric' as 'metric' | 'imperial'
  });

  // LED Fixtures state
  const [ledFixtures, setLedFixtures] = useState<LEDFixture[]>([
    {
      id: 'led-bank-1',
      name: 'LED Bank 1',
      position: { x: 15, y: 10, z: 3.5 },
      dimensions: { width: 4, height: 4, depth: 0.1 },
      specifications: {
        totalWattage: 1000,
        efficacy: 2.5,
        efficiency: 45, // 45% efficient = 55% heat
        spectrum: { red: 40, blue: 20, white: 35, farRed: 5 },
        dimmingLevel: 100,
        thermalDerating: {
          enabled: true,
          maxJunctionTemp: 85,
          deratingFactor: 1.0
        }
      },
      thermal: {
        heatGeneration: 550, // Will be calculated
        thermalResistance: 0.5,
        heatSinkMaterial: 'aluminum',
        heatSinkArea: 2.0,
        fanCooling: {
          enabled: false,
          airflow: 0,
          power: 0
        }
      }
    }
  ]);
  
  // Boundary conditions
  const [boundaries, setBoundaries] = useState<BoundaryCondition[]>([
    {
      id: 'inlet-1',
      name: 'Supply Air Diffuser 1',
      type: 'inlet',
      position: { x: 5, y: 0, z: 4.5 },
      dimensions: { width: 0.6, height: 0.6, depth: 0.1 },
      properties: {
        velocity: { x: 0, y: 0, z: -2.5 },
        temperature: 18,
        turbulenceIntensity: 5
      }
    },
    {
      id: 'outlet-1',
      name: 'Return Air Grille 1',
      type: 'outlet',
      position: { x: 25, y: 19, z: 0.5 },
      dimensions: { width: 1.0, height: 0.8, depth: 0.1 },
      properties: {
        pressure: 0 // gauge pressure
      }
    }
  ]);
  
  // Domain objects (synced with LED fixtures)
  const [objects, setObjects] = useState<DomainObject[]>([
    {
      id: 'canopy-1',
      name: 'Plant Canopy',
      type: 'porous-media',
      position: { x: 15, y: 10, z: 1.5 },
      dimensions: { width: 25, height: 18, depth: 1.0 },
      properties: {
        porosity: 0.7,
        resistance: 100,
        heatGeneration: -5000, // Cooling via transpiration
        material: 'plant-canopy'
      }
    }
  ]);

  // Function to sync LED fixtures with domain objects
  const syncLEDFixturesWithObjects = (fixtures: LEDFixture[]) => {
    const ledObjects: DomainObject[] = fixtures.map(fixture => ({
      id: fixture.id,
      name: fixture.name,
      type: 'heat-source' as const,
      position: fixture.position,
      dimensions: fixture.dimensions,
      properties: {
        heatGeneration: fixture.thermal.heatGeneration,
        material: fixture.thermal.heatSinkMaterial
      }
    }));

    // Keep non-LED objects and add LED objects
    const nonLEDObjects = objects.filter(obj => !fixtures.some(f => f.id === obj.id));
    setObjects([...nonLEDObjects, ...ledObjects]);
  };

  // Update objects when LED fixtures change
  useEffect(() => {
    syncLEDFixturesWithObjects(ledFixtures);
  }, [ledFixtures]);

  // Handler for LED fixtures changes
  const handleLEDFixturesChange = (newFixtures: LEDFixture[]) => {
    setLedFixtures(newFixtures);
  };
  
  // Mesh settings
  const [meshSettings, setMeshSettings] = useState<MeshSettings>({
    baseSize: 0.5,
    growthRate: 1.2,
    maxSize: 1.0,
    minSize: 0.05,
    boundaryLayers: {
      enabled: true,
      firstLayerHeight: 0.001,
      growthRate: 1.2,
      numberOfLayers: 5
    },
    refinementRegions: []
  });
  
  // Solver settings
  const [solverSettings, setSolverSettings] = useState<SolverSettings>({
    type: 'steady',
    turbulenceModel: 'k-omega-sst',
    algorithm: 'SIMPLE',
    discretization: {
      pressure: 'second-order',
      momentum: 'second-order',
      energy: 'second-order',
      turbulence: 'first-order'
    },
    relaxationFactors: {
      pressure: 0.3,
      momentum: 0.7,
      energy: 0.8,
      turbulence: 0.8
    },
    convergenceCriteria: {
      continuity: 1e-4,
      momentum: 1e-4,
      energy: 1e-6,
      turbulence: 1e-4
    }
  });
  
  // Physics models
  const [physics, setPhysics] = useState<PhysicsModels>({
    gravity: { enabled: true, vector: { x: 0, y: 0, z: -9.81 } },
    buoyancy: { enabled: true, referenceTemperature: 20, thermalExpansion: 0.00343 },
    radiation: { enabled: false, model: 'none' },
    species: { enabled: true, co2Concentration: 1000, humidity: 60 },
    plantTranspiration: { enabled: true, leafAreaDensity: 3, stomatalResistance: 100 }
  });
  
  // Visualization settings
  const [viewSettings, setViewSettings] = useState({
    field: 'velocity' as 'velocity' | 'temperature' | 'pressure' | 'turbulence' | 'co2' | 'humidity',
    slice: 'z' as 'x' | 'y' | 'z',
    slicePosition: 1.5,
    showVectors: true,
    showStreamlines: false,
    showMesh: false,
    colorScale: 'jet' as 'jet' | 'hot' | 'cool' | 'grayscale',
    vectorScale: 1,
    opacity: 1
  });
  
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [meshGenerated, setMeshGenerated] = useState(false);

  // Generate computational mesh
  const generateMesh = async () => {
    setProgress(0);
    // Simulate mesh generation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    setMeshGenerated(true);
    setProgress(100);
  };

  // Run CFD simulation
  const runSimulation = async () => {
    if (!meshGenerated) {
      alert('Please generate mesh first');
      return;
    }
    
    setIsRunning(true);
    setProgress(0);
    setCurrentIteration(0);
    
    const maxIterations = solverSettings.type === 'steady' ? 1000 : 
                         solverSettings.transientSettings?.numberOfTimeSteps || 100;
    
    // Initialize convergence history
    const convergenceHistory = {
      iteration: [] as number[],
      continuity: [] as number[],
      momentum: [] as number[],
      energy: [] as number[],
      turbulence: [] as number[]
    };
    
    // Simulate iterative solution
    for (let iter = 0; iter < maxIterations; iter++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkPause);
              resolve(undefined);
            }
          }, 100);
        });
      }
      
      if (!isRunning) break;
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setCurrentIteration(iter);
      setProgress((iter / maxIterations) * 100);
      
      // Update convergence history
      convergenceHistory.iteration.push(iter);
      convergenceHistory.continuity.push(Math.exp(-iter * 0.01) * 0.1);
      convergenceHistory.momentum.push(Math.exp(-iter * 0.015) * 0.1);
      convergenceHistory.energy.push(Math.exp(-iter * 0.02) * 0.01);
      convergenceHistory.turbulence.push(Math.exp(-iter * 0.012) * 0.1);
      
      // Check convergence
      if (iter > 100 && 
          convergenceHistory.continuity[iter] < solverSettings.convergenceCriteria.continuity &&
          convergenceHistory.momentum[iter] < solverSettings.convergenceCriteria.momentum &&
          convergenceHistory.energy[iter] < solverSettings.convergenceCriteria.energy) {
        break;
      }
    }
    
    // Generate realistic results
    const gridSize = { x: 60, y: 40, z: 10 };
    
    // Generate velocity field with realistic patterns
    const velocityField = {
      magnitude: Array(gridSize.x).fill(null).map(() =>
        Array(gridSize.y).fill(null).map(() =>
          Array(gridSize.z).fill(null).map(() => 0)
        )
      ),
      vectors: Array(gridSize.x).fill(null).map(() =>
        Array(gridSize.y).fill(null).map(() =>
          Array(gridSize.z).fill(null).map(() => ({ u: 0, v: 0, w: 0 }))
        )
      )
    };
    
    // Generate temperature field with heat source effects
    const temperatureField = Array(gridSize.x).fill(null).map((_, i) =>
      Array(gridSize.y).fill(null).map((_, j) =>
        Array(gridSize.z).fill(null).map((_, k) => {
          let temp = 20; // Base temperature
          
          // Add heat source effects
          objects.forEach(obj => {
            if (obj.properties.heatGeneration && obj.properties.heatGeneration > 0) {
              const dist = Math.sqrt(
                Math.pow((i / gridSize.x) * domain.dimensions.length - obj.position.x, 2) +
                Math.pow((j / gridSize.y) * domain.dimensions.width - obj.position.y, 2) +
                Math.pow((k / gridSize.z) * domain.dimensions.height - obj.position.z, 2)
              );
              temp += (obj.properties.heatGeneration / 10000) / (1 + dist * 2);
            }
          });
          
          // Add some noise
          temp += (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2;
          
          return Math.min(35, Math.max(15, temp));
        })
      )
    );
    
    // Calculate statistics
    const tempFlat = temperatureField.flat(3);
    const tempMin = Math.min(...tempFlat);
    const tempMax = Math.max(...tempFlat);
    const tempAvg = tempFlat.reduce((a, b) => a + b) / tempFlat.length;
    
    // Generate recommendations based on results
    const recommendations = [];
    
    if (tempMax - tempMin > 5) {
      recommendations.push({
        category: 'Temperature Uniformity',
        severity: 'high' as const,
        message: `Large temperature variation of ${(tempMax - tempMin).toFixed(1)}°C detected`,
        action: 'Consider adjusting air distribution or adding more diffusers'
      });
    }
    
    if (tempAvg > 28) {
      recommendations.push({
        category: 'Cooling Capacity',
        severity: 'medium' as const,
        message: 'Average temperature exceeds recommended range',
        action: 'Increase cooling capacity or improve heat removal'
      });
    }
    
    // Set results
    setResults({
      meshStatistics: {
        cellCount: gridSize.x * gridSize.y * gridSize.z,
        faceCount: (gridSize.x + 1) * gridSize.y * gridSize.z + 
                   gridSize.x * (gridSize.y + 1) * gridSize.z + 
                   gridSize.x * gridSize.y * (gridSize.z + 1),
        nodeCount: (gridSize.x + 1) * (gridSize.y + 1) * (gridSize.z + 1),
        quality: { min: 0.85, avg: 0.92, max: 0.98 },
        skewness: { min: 0.02, avg: 0.08, max: 0.15 }
      },
      convergenceHistory,
      fieldData: {
        velocity: velocityField,
        temperature: temperatureField,
        pressure: Array(gridSize.x).fill(null).map(() =>
          Array(gridSize.y).fill(null).map(() =>
            Array(gridSize.z).fill(null).map(() => 101325 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100)
          )
        ),
        turbulence: {
          k: Array(gridSize.x).fill(null).map(() =>
            Array(gridSize.y).fill(null).map(() =>
              Array(gridSize.z).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5)
            )
          ),
          epsilon: Array(gridSize.x).fill(null).map(() =>
            Array(gridSize.y).fill(null).map(() =>
              Array(gridSize.z).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1)
            )
          ),
          intensity: Array(gridSize.x).fill(null).map(() =>
            Array(gridSize.y).fill(null).map(() =>
              Array(gridSize.z).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10)
            )
          )
        }
      },
      statistics: {
        velocity: {
          min: 0.1,
          max: 3.5,
          avg: 1.2,
          uniformityIndex: 0.75
        },
        temperature: {
          min: tempMin,
          max: tempMax,
          avg: tempAvg,
          uniformityIndex: 1 - (tempMax - tempMin) / tempAvg
        },
        pressure: {
          min: 101300,
          max: 101350,
          avg: 101325,
          drop: 50
        },
        turbulence: {
          avgIntensity: 5.2,
          maxIntensity: 12.5
        },
        ventilation: {
          airChangeRate: 15.2,
          meanAge: 240, // seconds
          effectiveness: 0.82,
          shortCircuiting: 0.15
        }
      },
      recommendations
    });
    
    setIsRunning(false);
    setProgress(100);
  };

  // Render visualization
  const renderVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get the appropriate field data
    let fieldData;
    switch (viewSettings.field) {
      case 'temperature':
        fieldData = results.fieldData.temperature;
        break;
      case 'velocity':
        fieldData = results.fieldData.velocity.magnitude;
        break;
      case 'pressure':
        fieldData = results.fieldData.pressure;
        break;
      case 'turbulence':
        fieldData = results.fieldData.turbulence.intensity;
        break;
      default:
        fieldData = results.fieldData.temperature;
    }
    
    // Extract slice
    const sliceIndex = Math.floor(viewSettings.slicePosition / 
      (viewSettings.slice === 'x' ? domain.dimensions.length : 
       viewSettings.slice === 'y' ? domain.dimensions.width : 
       domain.dimensions.height) * fieldData.length);
    
    let sliceData;
    if (viewSettings.slice === 'z') {
      sliceData = fieldData.map(x => x.map(y => y[sliceIndex] || 0));
    } else if (viewSettings.slice === 'y') {
      sliceData = fieldData.map(x => x[sliceIndex]?.map(z => z) || []);
    } else {
      sliceData = fieldData[sliceIndex]?.map(y => y.map(z => z)) || [];
    }
    
    // Render contour plot
    const scaleX = canvas.width / sliceData.length;
    const scaleY = canvas.height / (sliceData[0]?.length || 1);
    
    sliceData.forEach((row, i) => {
      row.forEach((value, j) => {
        const color = getColorForValue(value, viewSettings.field, viewSettings.colorScale);
        ctx.fillStyle = color;
        ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
      });
    });
    
    // Draw velocity vectors if enabled
    if (viewSettings.showVectors && viewSettings.field === 'velocity' && results.fieldData.velocity.vectors) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      
      const vectorSpacing = 10;
      for (let i = 0; i < sliceData.length; i += vectorSpacing) {
        for (let j = 0; j < sliceData[0].length; j += vectorSpacing) {
          const vector = results.fieldData.velocity.vectors[i]?.[j]?.[sliceIndex];
          if (vector) {
            const x = i * scaleX;
            const y = j * scaleY;
            const scale = viewSettings.vectorScale * 10;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + vector.u * scale, y + vector.v * scale);
            ctx.stroke();
            
            // Arrowhead
            const angle = Math.atan2(vector.v, vector.u);
            ctx.save();
            ctx.translate(x + vector.u * scale, y + vector.v * scale);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-5, -2);
            ctx.lineTo(-5, 2);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.restore();
          }
        }
      }
    }
  };

  const getColorForValue = (value: number, field: string, colorScale: string): string => {
    let normalized = 0;
    
    switch (field) {
      case 'temperature':
        normalized = (value - 15) / 20; // 15-35°C range
        break;
      case 'velocity':
        normalized = value / 3.5; // 0-3.5 m/s range
        break;
      case 'pressure':
        normalized = (value - 101300) / 100; // ±50 Pa range
        break;
      case 'turbulence':
        normalized = value / 15; // 0-15% range
        break;
    }
    
    normalized = Math.max(0, Math.min(1, normalized));
    
    switch (colorScale) {
      case 'jet':
        if (normalized < 0.25) {
          const t = normalized * 4;
          return `rgb(0, 0, ${Math.floor(128 + t * 127)})`;
        } else if (normalized < 0.5) {
          const t = (normalized - 0.25) * 4;
          return `rgb(0, ${Math.floor(t * 255)}, 255)`;
        } else if (normalized < 0.75) {
          const t = (normalized - 0.5) * 4;
          return `rgb(${Math.floor(t * 255)}, 255, ${Math.floor(255 - t * 255)})`;
        } else {
          const t = (normalized - 0.75) * 4;
          return `rgb(255, ${Math.floor(255 - t * 255)}, 0)`;
        }
      case 'hot':
        const r = Math.floor(normalized * 255);
        const g = Math.floor(normalized * normalized * 255);
        const b = Math.floor(normalized * normalized * normalized * 255);
        return `rgb(${r}, ${g}, ${b})`;
      case 'cool':
        return `rgb(${Math.floor(normalized * 255)}, ${Math.floor((1 - normalized) * 255)}, 255)`;
      case 'grayscale':
        const gray = Math.floor(normalized * 255);
        return `rgb(${gray}, ${gray}, ${gray})`;
      default:
        return 'white';
    }
  };

  useEffect(() => {
    renderVisualization();
  }, [results, viewSettings]);

  const exportResults = () => {
    if (!results) return;
    
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        domain,
        meshSettings,
        solverSettings,
        physics
      },
      boundaries,
      objects,
      results: {
        statistics: results.statistics,
        recommendations: results.recommendations,
        convergenceHistory: results.convergenceHistory
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfd-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Wind className="w-6 h-6 text-cyan-400" />
          Advanced CFD Analysis
        </h3>
        <div className="flex gap-2">
          {!meshGenerated && (
            <button
              onClick={generateMesh}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Generate Mesh
            </button>
          )}
          {meshGenerated && !isRunning && (
            <button
              onClick={runSimulation}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Simulation
            </button>
          )}
          {isRunning && (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setIsPaused(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
          {results && (
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Setup Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Domain Setup */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              Domain Setup
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Length (m)
                </label>
                <input
                  type="number"
                  value={domain.dimensions.length}
                  onChange={(e) => setDomain({...domain, dimensions: {...domain.dimensions, length: Number(e.target.value)}})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Width (m)
                </label>
                <input
                  type="number"
                  value={domain.dimensions.width}
                  onChange={(e) => setDomain({...domain, dimensions: {...domain.dimensions, width: Number(e.target.value)}})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Height (m)
                </label>
                <input
                  type="number"
                  value={domain.dimensions.height}
                  onChange={(e) => setDomain({...domain, dimensions: {...domain.dimensions, height: Number(e.target.value)}})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          {/* Boundary Conditions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-green-400" />
              Boundary Conditions
            </h4>
            <div className="space-y-2">
              {boundaries.map(boundary => (
                <div key={boundary.id} className="p-2 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{boundary.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      boundary.type === 'inlet' ? 'bg-green-900/20 text-green-400' : 
                      boundary.type === 'outlet' ? 'bg-red-900/20 text-red-400' : 
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {boundary.type}
                    </span>
                  </div>
                  {boundary.properties.velocity && (
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.sqrt(
                        boundary.properties.velocity.x ** 2 + 
                        boundary.properties.velocity.y ** 2 + 
                        boundary.properties.velocity.z ** 2
                      ).toFixed(1)} m/s
                    </p>
                  )}
                  {boundary.properties.temperature && (
                    <p className="text-xs text-gray-400">
                      {boundary.properties.temperature}°C
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LED Control Panel */}
          <LEDControlPanel 
            fixtures={ledFixtures}
            onFixturesChange={handleLEDFixturesChange}
            disabled={isRunning}
          />

          {/* Domain Objects */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              Domain Objects
            </h4>
            <div className="space-y-2">
              {objects.map(obj => (
                <div key={obj.id} className="p-2 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{obj.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      obj.type === 'heat-source' ? 'bg-orange-900/20 text-orange-400' : 
                      obj.type === 'porous-media' ? 'bg-green-900/20 text-green-400' : 
                      'bg-blue-900/20 text-blue-400'
                    }`}>
                      {obj.type}
                    </span>
                  </div>
                  {obj.properties.heatGeneration && (
                    <p className="text-xs text-gray-400 mt-1">
                      {obj.properties.heatGeneration > 0 ? '+' : ''}{(obj.properties.heatGeneration / 1000).toFixed(1)} kW
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Solver Settings */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Solver Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Turbulence Model
                </label>
                <select
                  value={solverSettings.turbulenceModel}
                  onChange={(e) => setSolverSettings({...solverSettings, turbulenceModel: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                  disabled={isRunning}
                >
                  <option value="laminar">Laminar</option>
                  <option value="k-epsilon">k-ε Standard</option>
                  <option value="k-omega-sst">k-ω SST</option>
                  <option value="les">LES</option>
                  <option value="rans">RANS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Solution Algorithm
                </label>
                <select
                  value={solverSettings.algorithm}
                  onChange={(e) => setSolverSettings({...solverSettings, algorithm: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                  disabled={isRunning}
                >
                  <option value="SIMPLE">SIMPLE</option>
                  <option value="SIMPLEC">SIMPLEC</option>
                  <option value="PISO">PISO</option>
                  <option value="COUPLED">Coupled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Visualization Controls */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                Visualization
              </h4>
              <div className="flex gap-2">
                {(['velocity', 'temperature', 'pressure', 'turbulence'] as const).map(field => (
                  <button
                    key={field}
                    onClick={() => setViewSettings({...viewSettings, field})}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewSettings.field === field
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="bg-gray-900 rounded-lg p-2 mb-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-auto rounded"
              />
            </div>

            {/* View Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slice Plane
                </label>
                <select
                  value={viewSettings.slice}
                  onChange={(e) => setViewSettings({...viewSettings, slice: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                >
                  <option value="x">X Plane</option>
                  <option value="y">Y Plane</option>
                  <option value="z">Z Plane</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slice Position (m)
                </label>
                <input
                  type="range"
                  value={viewSettings.slicePosition}
                  onChange={(e) => setViewSettings({...viewSettings, slicePosition: Number(e.target.value)})}
                  min="0"
                  max={
                    viewSettings.slice === 'x' ? domain.dimensions.length :
                    viewSettings.slice === 'y' ? domain.dimensions.width :
                    domain.dimensions.height
                  }
                  step="0.1"
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{viewSettings.slicePosition.toFixed(1)} m</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Color Scale
                </label>
                <select
                  value={viewSettings.colorScale}
                  onChange={(e) => setViewSettings({...viewSettings, colorScale: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                >
                  <option value="jet">Jet</option>
                  <option value="hot">Hot</option>
                  <option value="cool">Cool</option>
                  <option value="grayscale">Grayscale</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={viewSettings.showVectors}
                    onChange={(e) => setViewSettings({...viewSettings, showVectors: e.target.checked})}
                    className="rounded"
                  />
                  Vectors
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={viewSettings.showMesh}
                    onChange={(e) => setViewSettings({...viewSettings, showMesh: e.target.checked})}
                    className="rounded"
                  />
                  Mesh
                </label>
              </div>
            </div>

            {/* Progress */}
            {(isRunning || progress > 0) && progress < 100 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{isRunning ? `Iteration ${currentIteration}` : 'Mesh Generation'}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <>
              {/* Statistics */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Simulation Results
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Temperature</span>
                      <Thermometer className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{results.statistics.temperature.avg.toFixed(1)}°C</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Range: {results.statistics.temperature.min.toFixed(1)} - {results.statistics.temperature.max.toFixed(1)}°C
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Air Velocity</span>
                      <Wind className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{results.statistics.velocity.avg.toFixed(1)} m/s</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max: {results.statistics.velocity.max.toFixed(1)} m/s
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">ACH</span>
                      <Fan className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{results.statistics.ventilation.airChangeRate.toFixed(1)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Air changes per hour
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Effectiveness</span>
                      <Gauge className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {(results.statistics.ventilation.effectiveness * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ventilation efficiency
                    </p>
                  </div>
                </div>

                {/* Uniformity Indices */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-3">Temperature Uniformity</h5>
                    <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          results.statistics.temperature.uniformityIndex > 0.9 ? 'bg-green-500' :
                          results.statistics.temperature.uniformityIndex > 0.8 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${results.statistics.temperature.uniformityIndex * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      Index: {results.statistics.temperature.uniformityIndex.toFixed(3)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-3">Velocity Uniformity</h5>
                    <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          results.statistics.velocity.uniformityIndex > 0.8 ? 'bg-green-500' :
                          results.statistics.velocity.uniformityIndex > 0.7 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${results.statistics.velocity.uniformityIndex * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      Index: {results.statistics.velocity.uniformityIndex.toFixed(3)}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Optimization Recommendations
                    </h5>
                    <div className="space-y-3">
                      {results.recommendations.map((rec, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          rec.severity === 'high' ? 'bg-red-900/20 border-red-800' :
                          rec.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-800' :
                          'bg-blue-900/20 border-blue-800'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  rec.severity === 'high' ? 'bg-red-900/50 text-red-300' :
                                  rec.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                                  'bg-blue-900/50 text-blue-300'
                                }`}>
                                  {rec.severity.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-300">{rec.category}</span>
                              </div>
                              <p className="text-sm text-gray-100 font-medium">{rec.message}</p>
                              <p className="text-sm text-gray-300 mt-1">{rec.action}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Convergence History */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Convergence History
                </h5>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-sm text-gray-300">
                    <p>Final residuals:</p>
                    <ul className="mt-2 space-y-1">
                      <li>Continuity: {results.convergenceHistory.continuity[results.convergenceHistory.continuity.length - 1]?.toExponential(2)}</li>
                      <li>Momentum: {results.convergenceHistory.momentum[results.convergenceHistory.momentum.length - 1]?.toExponential(2)}</li>
                      <li>Energy: {results.convergenceHistory.energy[results.convergenceHistory.energy.length - 1]?.toExponential(2)}</li>
                      <li>Turbulence: {results.convergenceHistory.turbulence[results.convergenceHistory.turbulence.length - 1]?.toExponential(2)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}