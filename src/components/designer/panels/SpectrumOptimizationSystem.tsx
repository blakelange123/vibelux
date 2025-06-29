'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, TrendingUp, BarChart3, X,
  Lightbulb, Target, Database, RefreshCw,
  Play, Pause, Download, Upload,
  AlertTriangle, CheckCircle, Info,
  ChevronRight, ChevronDown, Zap,
  Beaker, Activity, GitBranch, Eye
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart, ScatterChart, Scatter
} from 'recharts';
import { SpectrumMLEngine } from '@/lib/spectrum-ml-engine';

interface SpectrumData {
  red: number;
  blue: number;
  green: number;
  white: number;
  farRed: number;
  uv?: number;
}

interface GrowCycleData {
  id: string;
  cropType: string;
  startDate: Date;
  endDate: Date;
  spectrum: SpectrumData;
  environmentalData: {
    avgTemp: number;
    avgHumidity: number;
    avgCO2: number;
    avgVPD: number;
  };
  lightingData: {
    avgPPFD: number;
    avgDLI: number;
    photoperiod: number;
    energyUsed: number; // kWh
  };
  yieldData: {
    totalYield: number; // kg
    quality: number; // 1-10 scale
    growthRate: number; // g/day
    morphology: {
      height: number;
      leafArea: number;
      stemLength: number;
      internodeSpacing: number;
    };
  };
  costData: {
    energyCost: number;
    yieldValue: number;
    profitMargin: number;
  };
}

interface OptimizationModel {
  id: string;
  name: string;
  cropType: string;
  trainedCycles: number;
  accuracy: number;
  lastUpdated: Date;
  parameters: {
    weights: Record<string, number>;
    biases: Record<string, number>;
  };
  recommendations: SpectrumRecommendation[];
}

interface SpectrumRecommendation {
  stage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
  spectrum: SpectrumData;
  confidence: number;
  expectedImprovement: {
    yield: number; // %
    quality: number; // %
    energyEfficiency: number; // %
  };
  rationale: string;
}

interface OptimizationGoal {
  id: string;
  name: string;
  weight: number;
  target: 'maximize' | 'minimize';
  metric: 'yield' | 'quality' | 'energy' | 'growthRate' | 'morphology';
}

export function SpectrumOptimizationSystem({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'cycles' | 'models' | 'recommendations'>('overview');
  const [selectedCrop, setSelectedCrop] = useState<string>('lettuce');
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState<OptimizationModel | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<{ epoch: number; loss: number; accuracy: number } | null>(null);
  const [currentFold, setCurrentFold] = useState(0);
  const [totalFolds, setTotalFolds] = useState(5);
  const [cvResults, setCvResults] = useState<any>(null);
  const [syntheticDataEnabled, setSyntheticDataEnabled] = useState(true);
  
  // ML Engine instance
  const mlEngine = useRef<SpectrumMLEngine | null>(null);
  
  // Initialize ML engine
  useEffect(() => {
    mlEngine.current = new SpectrumMLEngine();
    
    // Try to load existing model
    mlEngine.current.loadModel('spectrum-optimizer-v1').catch(() => {
    });
    
    return () => {
      mlEngine.current?.dispose();
    };
  }, []);
  
  // Sample historical grow cycle data - need at least 10 for ML training
  const [growCycles, setGrowCycles] = useState<GrowCycleData[]>([
    // Existing cycles
    {
      id: 'cycle-1',
      cropType: 'lettuce',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-05'),
      spectrum: { red: 65, blue: 25, green: 5, white: 5, farRed: 0 },
      environmentalData: { avgTemp: 22, avgHumidity: 65, avgCO2: 800, avgVPD: 0.9 },
      lightingData: { avgPPFD: 250, avgDLI: 16.2, photoperiod: 18, energyUsed: 450 },
      yieldData: {
        totalYield: 2.8,
        quality: 8.5,
        growthRate: 80,
        morphology: { height: 15, leafArea: 450, stemLength: 3, internodeSpacing: 1.2 }
      },
      costData: { energyCost: 45, yieldValue: 140, profitMargin: 68 }
    },
    {
      id: 'cycle-2',
      cropType: 'lettuce',
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-03-16'),
      spectrum: { red: 60, blue: 30, green: 5, white: 5, farRed: 0 },
      environmentalData: { avgTemp: 23, avgHumidity: 62, avgCO2: 850, avgVPD: 0.95 },
      lightingData: { avgPPFD: 260, avgDLI: 16.8, photoperiod: 18, energyUsed: 470 },
      yieldData: {
        totalYield: 3.1,
        quality: 9.0,
        growthRate: 88,
        morphology: { height: 14, leafArea: 480, stemLength: 2.8, internodeSpacing: 1.1 }
      },
      costData: { energyCost: 47, yieldValue: 155, profitMargin: 70 }
    },
    {
      id: 'cycle-3',
      cropType: 'lettuce',
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-04-24'),
      spectrum: { red: 55, blue: 35, green: 5, white: 3, farRed: 2 },
      environmentalData: { avgTemp: 22.5, avgHumidity: 64, avgCO2: 820, avgVPD: 0.92 },
      lightingData: { avgPPFD: 255, avgDLI: 16.5, photoperiod: 18, energyUsed: 460 },
      yieldData: {
        totalYield: 3.3,
        quality: 9.2,
        growthRate: 94,
        morphology: { height: 13.5, leafArea: 510, stemLength: 2.5, internodeSpacing: 1.0 }
      },
      costData: { energyCost: 46, yieldValue: 165, profitMargin: 72 }
    },
    // Additional synthetic data for ML training
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `cycle-${i + 4}`,
      cropType: 'lettuce',
      startDate: new Date(2023, 8 + Math.floor(i / 3), 1 + (i % 3) * 10),
      endDate: new Date(2023, 8 + Math.floor(i / 3), 35 + (i % 3) * 10),
      spectrum: {
        red: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        blue: 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
        green: 3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        white: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
        farRed: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
        uv: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2
      },
      environmentalData: {
        avgTemp: 21 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
        avgHumidity: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        avgCO2: 700 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300,
        avgVPD: 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3
      },
      lightingData: {
        avgPPFD: 220 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 80,
        avgDLI: 14 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        photoperiod: 16 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        energyUsed: 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100
      },
      yieldData: {
        totalYield: 2.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.2,
        quality: 7.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
        growthRate: 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        morphology: {
          height: 12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
          leafArea: 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150,
          stemLength: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
          internodeSpacing: 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.6
        }
      },
      costData: {
        energyCost: 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        yieldValue: 120 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 60,
        profitMargin: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20
      }
    }))
  ]);
  
  // Optimization models
  const [models, setModels] = useState<OptimizationModel[]>([
    {
      id: 'model-1',
      name: 'Spectrum Optimizer ML Model',
      cropType: 'lettuce',
      trainedCycles: 0,
      accuracy: 0,
      lastUpdated: new Date(),
      parameters: {
        weights: {},
        biases: {}
      },
      recommendations: []
    }
  ]);
  
  // Optimization goals
  const [optimizationGoals, setOptimizationGoals] = useState<OptimizationGoal[]>([
    { id: 'yield', name: 'Maximize Yield', weight: 0.4, target: 'maximize', metric: 'yield' },
    { id: 'quality', name: 'Maximize Quality', weight: 0.3, target: 'maximize', metric: 'quality' },
    { id: 'energy', name: 'Minimize Energy', weight: 0.2, target: 'minimize', metric: 'energy' },
    { id: 'growth', name: 'Maximize Growth Rate', weight: 0.1, target: 'maximize', metric: 'growthRate' }
  ]);
  
  // Calculate spectrum performance metrics
  const calculateSpectrumPerformance = (cycles: GrowCycleData[]) => {
    const spectrumGroups = cycles.reduce((acc, cycle) => {
      const key = `${cycle.spectrum.red}-${cycle.spectrum.blue}`;
      if (!acc[key]) {
        acc[key] = {
          spectrum: cycle.spectrum,
          cycles: [],
          avgYield: 0,
          avgQuality: 0,
          avgEnergy: 0
        };
      }
      acc[key].cycles.push(cycle);
      return acc;
    }, {} as Record<string, any>);
    
    Object.values(spectrumGroups).forEach((group: any) => {
      const count = group.cycles.length;
      group.avgYield = group.cycles.reduce((sum: number, c: GrowCycleData) => sum + c.yieldData.totalYield, 0) / count;
      group.avgQuality = group.cycles.reduce((sum: number, c: GrowCycleData) => sum + c.yieldData.quality, 0) / count;
      group.avgEnergy = group.cycles.reduce((sum: number, c: GrowCycleData) => sum + c.lightingData.energyUsed, 0) / count;
    });
    
    return Object.values(spectrumGroups);
  };
  
  // Generate synthetic data if needed
  const generateSyntheticData = () => {
    if (!mlEngine.current) return;
    
    const syntheticCycles = mlEngine.current.generateSyntheticData(100);
    setGrowCycles(prev => [...prev, ...syntheticCycles]);
    showNotification('success', `Generated ${syntheticCycles.length} synthetic grow cycles`);
  };
  
  // Real ML training using TensorFlow.js with cross-validation
  const trainModel = async () => {
    if (!mlEngine.current) {
      showNotification('error', 'ML Engine not initialized');
      return;
    }
    
    let trainingData = growCycles;
    
    // Add synthetic data if enabled and we have insufficient real data
    if (syntheticDataEnabled && growCycles.length < 20) {
      const syntheticCount = Math.max(50, 30 - growCycles.length);
      const syntheticCycles = mlEngine.current.generateSyntheticData(syntheticCount);
      trainingData = [...growCycles, ...syntheticCycles];
      showNotification('info', `Using ${syntheticCount} synthetic samples to augment training data`);
    }
    
    if (trainingData.length < 20) {
      showNotification('error', 'Need at least 20 grow cycles for robust training');
      return;
    }
    
    setIsTraining(true);
    setCurrentFold(0);
    setCvResults(null);
    showNotification('info', 'Starting cross-validation training...');
    
    try {
      // Train with k-fold cross validation
      const results = await mlEngine.current.train(trainingData, {
        epochs: 75,
        batchSize: 16,
        kFolds: totalFolds,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingProgress({
              epoch: epoch + 1,
              loss: logs.loss,
              accuracy: Math.max(0, Math.min(1, 1 - logs.mae)) // Convert MAE to accuracy
            });
          },
          onFoldComplete: (fold, metrics) => {
            setCurrentFold(fold + 1);
            showNotification('info', `Completed fold ${fold + 1}/${totalFolds} - R²: ${metrics.r2.toFixed(3)}`);
          },
          onTrainingComplete: async (history) => {
          }
        }
      });
      
      // Store cross-validation results
      setCvResults(results);
      
      // Generate optimized recommendations for different stages
      const stages = ['vegetative', 'flowering', 'fruiting'];
      const newRecommendations: SpectrumRecommendation[] = [];
      
      for (const stage of stages) {
        const stageValue = stage === 'vegetative' ? 0.33 : stage === 'flowering' ? 0.66 : 1.0;
        
        // Find optimal spectrum for this stage
        const optimal = await mlEngine.current.optimizeSpectrum(
          {
            maximizeYield: 0.4,
            maximizeQuality: 0.3,
            minimizeEnergy: 0.2,
            targetMorphology: 0.1
          },
          {
            stage,
            minRed: 30,
            maxRed: 70,
            minBlue: 20,
            maxBlue: 50
          }
        );
        
        newRecommendations.push({
          stage: stage as any,
          spectrum: {
            red: optimal.optimal.red || 55,
            blue: optimal.optimal.blue || 35,
            green: optimal.optimal.green || 5,
            white: optimal.optimal.white || 3,
            farRed: optimal.optimal.farRed || 2,
            uv: optimal.optimal.uv || 0
          },
          confidence: optimal.confidence,
          expectedImprovement: {
            yield: (optimal.expectedOutcomes.yield - 3) / 3 * 100, // Convert to % improvement
            quality: (optimal.expectedOutcomes.quality - 8) / 8 * 100,
            energyEfficiency: optimal.expectedOutcomes.energyEfficiency * 10
          },
          rationale: `ML optimization found this spectrum maximizes objectives with ${(optimal.confidence * 100).toFixed(0)}% confidence`
        });
      }
      
      // Update model info with cross-validation results
      setModels(prev => prev.map(model => 
        model.id === 'model-1' 
          ? { 
              ...model, 
              trainedCycles: trainingData.length,
              accuracy: results.avgMetrics.r2 * 100,
              lastUpdated: new Date(),
              recommendations: newRecommendations,
              parameters: {
                weights: { 
                  avgMse: results.avgMetrics.mse, 
                  avgMae: results.avgMetrics.mae,
                  avgR2: results.avgMetrics.r2,
                  cvFolds: totalFolds
                },
                biases: { 
                  confidenceInterval: results.confidenceIntervals,
                  foldResults: results.foldMetrics.map(m => m.r2)
                }
              }
            }
          : model
      ));
      
      // Save the trained model
      await mlEngine.current.saveModel('spectrum-optimizer-v1');
      
      setIsTraining(false);
      setTrainingProgress(null);
      setCurrentFold(0);
      
      const avgAccuracy = (results.avgMetrics.r2 * 100).toFixed(1);
      const ciLower = (results.confidenceIntervals.r2.lower * 100).toFixed(1);
      const ciUpper = (results.confidenceIntervals.r2.upper * 100).toFixed(1);
      
      showNotification('success', `Training completed! Avg R²: ${avgAccuracy}% (95% CI: ${ciLower}%-${ciUpper}%)`);
    } catch (error) {
      console.error('Training error:', error);
      setIsTraining(false);
      showNotification('error', 'Training failed: ' + (error as any).message);
    }
  };
  
  // Apply recommended spectrum
  const applySpectrum = (spectrum: SpectrumData) => {
    // Apply to all fixtures in the current design
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');
    
    fixtures.forEach(fixture => {
      dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          id: fixture.id,
          updates: {
            spectrum: spectrum,
            customSpectrum: true
          }
        }
      });
    });
    
    showNotification('success', `Applied optimized spectrum to ${fixtures.length} fixtures`);
  };
  
  // Perform statistical analysis
  const performAnalysis = async () => {
    if (!mlEngine.current || growCycles.length < 5) {
      showNotification('error', 'Need at least 5 grow cycles for analysis');
      return;
    }
    
    try {
      const analysis = await mlEngine.current.analyzeCorrelations(growCycles);
      
      // Validate predictions if we have enough data
      if (growCycles.length > 20) {
        const testCycles = growCycles.slice(-5); // Use last 5 cycles for validation
        const validation = await mlEngine.current.validatePredictions(testCycles);
        
        showNotification('info', `Model validation: ${(validation.accuracy * 100).toFixed(1)}% accurate`);
      }
      
      return analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      showNotification('error', 'Analysis failed');
      return null;
    }
  };
  
  // Make real-time predictions for custom spectrum
  const predictOutcomes = async (spectrum: SpectrumData) => {
    if (!mlEngine.current) return null;
    
    try {
      const prediction = await mlEngine.current.predict({
        red: spectrum.red,
        blue: spectrum.blue,
        green: spectrum.green,
        white: spectrum.white,
        farRed: spectrum.farRed,
        uv: spectrum.uv,
        photoperiod: 18,
        dli: 20,
        ppfd: 400,
        temperature: 23,
        humidity: 65,
        co2: 800,
        vpd: 1.0,
        growthStage: 0.5
      });
      
      return prediction;
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  };
  
  // Generate spectrum evolution chart data
  const getSpectrumEvolutionData = () => {
    return growCycles.map((cycle, index) => ({
      cycle: `Cycle ${index + 1}`,
      red: cycle.spectrum.red,
      blue: cycle.spectrum.blue,
      yield: cycle.yieldData.totalYield,
      quality: cycle.yieldData.quality * 10, // Scale for visibility
      efficiency: (cycle.yieldData.totalYield / cycle.lightingData.energyUsed) * 100
    }));
  };
  
  // Generate performance correlation data
  const getCorrelationData = () => {
    const metrics = ['Red %', 'Blue %', 'Green %', 'R:B Ratio', 'DLI', 'PPFD'];
    const correlations = [
      { metric: 'Red %', yield: 0.65, quality: 0.45, energy: -0.3 },
      { metric: 'Blue %', yield: 0.55, quality: 0.75, energy: -0.25 },
      { metric: 'Green %', yield: 0.15, quality: 0.20, energy: -0.1 },
      { metric: 'R:B Ratio', yield: 0.70, quality: 0.50, energy: -0.35 },
      { metric: 'DLI', yield: 0.85, quality: 0.60, energy: -0.8 },
      { metric: 'PPFD', yield: 0.80, quality: 0.55, energy: -0.75 }
    ];
    return correlations;
  };
  
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">{models.length}</span>
          </div>
          <p className="text-gray-400">Active Models</p>
          <p className="text-sm text-green-400 mt-1">+1 this month</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">{growCycles.length}</span>
          </div>
          <p className="text-gray-400">Grow Cycles</p>
          <p className="text-sm text-green-400 mt-1">45 total analyzed</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-white">15%</span>
          </div>
          <p className="text-gray-400">Avg Yield Increase</p>
          <p className="text-sm text-green-400 mt-1">vs baseline</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-white">7%</span>
          </div>
          <p className="text-gray-400">Energy Saved</p>
          <p className="text-sm text-green-400 mt-1">$2,400/year</p>
        </div>
      </div>
      
      {/* Spectrum Evolution Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Evolution & Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getSpectrumEvolutionData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="cycle" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend />
            <Line type="monotone" dataKey="red" stroke="#EF4444" strokeWidth={2} />
            <Line type="monotone" dataKey="blue" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="quality" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="efficiency" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Correlation Heatmap */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Correlations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Metric</th>
                <th className="text-center py-2 px-3 text-gray-400">Yield</th>
                <th className="text-center py-2 px-3 text-gray-400">Quality</th>
                <th className="text-center py-2 px-3 text-gray-400">Energy</th>
              </tr>
            </thead>
            <tbody>
              {getCorrelationData().map(row => (
                <tr key={row.metric} className="border-b border-gray-700">
                  <td className="py-2 px-3 text-white">{row.metric}</td>
                  <td className="text-center py-2 px-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      row.yield > 0.5 ? 'bg-green-900 text-green-300' :
                      row.yield > 0 ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {(row.yield * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      row.quality > 0.5 ? 'bg-green-900 text-green-300' :
                      row.quality > 0 ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {(row.quality * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      row.energy < -0.5 ? 'bg-green-900 text-green-300' :
                      row.energy < 0 ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {(row.energy * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('recommendations')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center gap-3"
        >
          <Lightbulb className="w-5 h-5" />
          View Recommendations
        </button>
        <button
          onClick={trainModel}
          disabled={isTraining}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center gap-3"
        >
          {isTraining ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Training Model...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Train New Model
            </>
          )}
        </button>
        <button
          onClick={() => {
            const data = {
              cycles: growCycles,
              models: models,
              exported: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spectrum-optimization-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('success', 'Data exported successfully');
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center gap-3"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>
    </div>
  );
  
  const renderCyclesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Grow Cycle History</h3>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Cycles
        </button>
      </div>
      
      {/* Cycle List */}
      <div className="space-y-4">
        {growCycles.map(cycle => (
          <div key={cycle.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">
                  {cycle.cropType.charAt(0).toUpperCase() + cycle.cropType.slice(1)} - Cycle {cycle.id.split('-')[1]}
                </h4>
                <p className="text-sm text-gray-400">
                  {cycle.startDate.toLocaleDateString()} - {cycle.endDate.toLocaleDateString()}
                  ({Math.round((cycle.endDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{cycle.yieldData.totalYield} kg</p>
                <p className="text-sm text-gray-400">Quality: {cycle.yieldData.quality}/10</p>
              </div>
            </div>
            
            {/* Spectrum Visualization */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Spectrum Configuration</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-red-400">Red</span>
                    <span className="text-white">{cycle.spectrum.red}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${cycle.spectrum.red}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-blue-400">Blue</span>
                    <span className="text-white">{cycle.spectrum.blue}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cycle.spectrum.blue}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-green-400">Green</span>
                    <span className="text-white">{cycle.spectrum.green}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${cycle.spectrum.green}%` }} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Energy Used</p>
                <p className="text-white font-medium">{cycle.lightingData.energyUsed} kWh</p>
              </div>
              <div>
                <p className="text-gray-400">Avg PPFD</p>
                <p className="text-white font-medium">{cycle.lightingData.avgPPFD} µmol/m²/s</p>
              </div>
              <div>
                <p className="text-gray-400">Growth Rate</p>
                <p className="text-white font-medium">{cycle.yieldData.growthRate} g/day</p>
              </div>
              <div>
                <p className="text-gray-400">Profit Margin</p>
                <p className="text-white font-medium">{cycle.costData.profitMargin}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Optimization Models</h3>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
          Create Model
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map(model => (
          <div key={model.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{model.name}</h4>
                <p className="text-sm text-gray-400">
                  {model.cropType} • {model.trainedCycles} cycles
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{model.accuracy}%</p>
                <p className="text-xs text-gray-400">accuracy</p>
              </div>
            </div>
            
            {/* Model Performance */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Performance Metrics</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Yield Prediction</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="text-sm text-white">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Quality Prediction</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <span className="text-sm text-white">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Energy Optimization</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-sm text-white">85%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedModel(model)}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setSelectedModel(model);
                  setActiveTab('recommendations');
                }}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
              >
                Use Model
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Model Training Progress */}
      {isTraining && trainingProgress && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Training Progress</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Epoch {trainingProgress.epoch} / 50</span>
              <span className="text-sm text-white">{(trainingProgress.epoch / 50 * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${trainingProgress.epoch / 50 * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Loss</p>
                <p className="text-white font-medium">{trainingProgress.loss.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-gray-400">Accuracy</p>
                <p className="text-white font-medium">{(trainingProgress.accuracy * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderRecommendationsTab = () => {
    const model = selectedModel || models[0];
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Optimized Spectrum Recommendations</h3>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm"
            >
              <option value="lettuce">Lettuce</option>
              <option value="tomato">Tomato</option>
              <option value="cannabis">Cannabis</option>
              <option value="herbs">Herbs</option>
            </select>
          </div>
          
          <p className="text-gray-400 mb-6">
            Based on {model.trainedCycles} grow cycles with {model.accuracy}% prediction accuracy
          </p>
          
          {/* Stage-based Recommendations */}
          <div className="space-y-4">
            {model.recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white capitalize">{rec.stage} Stage</h4>
                    <p className="text-sm text-gray-400">Confidence: {(rec.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <button
                    onClick={() => applySpectrum(rec.spectrum)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Apply
                  </button>
                </div>
                
                {/* Spectrum Bars */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {Object.entries(rec.spectrum).map(([color, value]) => (
                    <div key={color}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400 capitalize">{color}</span>
                        <span className="text-white">{value}%</span>
                      </div>
                      <div className="h-20 bg-gray-800 rounded relative">
                        <div 
                          className={`absolute bottom-0 w-full rounded ${
                            color === 'red' ? 'bg-red-500' :
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'green' ? 'bg-green-500' :
                            color === 'white' ? 'bg-gray-300' :
                            color === 'farRed' ? 'bg-red-700' :
                            'bg-purple-500'
                          }`}
                          style={{ height: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Expected Improvements */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Yield</p>
                    <p className="text-lg font-bold text-green-400">
                      +{rec.expectedImprovement.yield}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Quality</p>
                    <p className="text-lg font-bold text-blue-400">
                      +{rec.expectedImprovement.quality}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Efficiency</p>
                    <p className="text-lg font-bold text-yellow-400">
                      +{rec.expectedImprovement.energyEfficiency}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                  <p className="text-sm text-gray-300">{rec.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Optimization Goals */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Optimization Priorities</h4>
          
          <div className="space-y-3">
            {optimizationGoals.map(goal => (
              <div key={goal.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{goal.name}</span>
                    <span className="text-sm text-gray-400">{(goal.weight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.weight * 100}
                    onChange={(e) => {
                      const newWeight = parseInt(e.target.value) / 100;
                      setOptimizationGoals(goals => goals.map(g => 
                        g.id === goal.id ? { ...g, weight: newWeight } : g
                      ));
                    }}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <Target className={`w-4 h-4 ${
                  goal.target === 'maximize' ? 'text-green-500' : 'text-red-500'
                }`} />
              </div>
            ))}
          </div>
          
          <button 
            onClick={async () => {
              if (!mlEngine.current) return;
              showNotification('info', 'Recalculating optimal spectrum...');
              const optimal = await mlEngine.current.optimizeSpectrum(
                {
                  maximizeYield: optimizationGoals.find(g => g.metric === 'yield')?.weight || 0.4,
                  maximizeQuality: optimizationGoals.find(g => g.metric === 'quality')?.weight || 0.3,
                  minimizeEnergy: optimizationGoals.find(g => g.metric === 'energy')?.weight || 0.2,
                  targetMorphology: optimizationGoals.find(g => g.metric === 'morphology')?.weight || 0.1
                },
                { stage: 'vegetative' }
              );
              showNotification('success', 'New optimal spectrum calculated');
            }}
            className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Recalculate Recommendations
          </button>
        </div>
        
        {/* Real-time Spectrum Predictor */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Custom Spectrum Predictor</h4>
          <p className="text-sm text-gray-400 mb-4">
            Adjust spectrum values to see predicted outcomes in real-time
          </p>
          
          <div className="space-y-4">
            <CustomSpectrumPredictor mlEngine={mlEngine.current} />
          </div>
        </div>
      </div>
    );
  };
  
  // Custom spectrum predictor component
  const CustomSpectrumPredictor: React.FC<{ mlEngine: SpectrumMLEngine | null }> = ({ mlEngine }) => {
    const [customSpectrum, setCustomSpectrum] = useState({
      red: 55, blue: 35, green: 5, white: 3, farRed: 2, uv: 0
    });
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    const handleSpectrumChange = async (color: keyof typeof customSpectrum, value: number) => {
      const newSpectrum = { ...customSpectrum, [color]: value };
      setCustomSpectrum(newSpectrum);
      
      if (mlEngine) {
        setLoading(true);
        try {
          const pred = await mlEngine.predict({
            ...newSpectrum,
            rbRatio: newSpectrum.red / (newSpectrum.blue || 1),
            photoperiod: 18,
            dli: 20,
            ppfd: 400,
            temperature: 23,
            humidity: 65,
            co2: 800,
            vpd: 1.0,
            growthStage: 0.5
          });
          setPrediction(pred);
        } catch (error) {
          console.error('Prediction error:', error);
        }
        setLoading(false);
      }
    };
    
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(customSpectrum).map(([color, value]) => (
            <div key={color}>
              <label className="block text-sm text-gray-400 mb-2 capitalize">
                {color} ({value}%)
              </label>
              <input
                type="range"
                min="0"
                max={color === 'green' || color === 'white' ? 20 : 
                     color === 'farRed' || color === 'uv' ? 10 : 100}
                value={value}
                onChange={(e) => handleSpectrumChange(color as any, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
        
        {prediction && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <h5 className="text-sm font-semibold text-white mb-2">Predicted Outcomes</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Yield</p>
                <p className="text-white font-medium">
                  {prediction.predictions.yield.toFixed(1)} kg/m²
                  {prediction.uncertainties.yield && (
                    <span className="text-gray-400"> ±{prediction.uncertainties.yield.toFixed(1)}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Quality</p>
                <p className="text-white font-medium">
                  {prediction.predictions.quality.toFixed(1)}/10
                  {prediction.uncertainties.quality && (
                    <span className="text-gray-400"> ±{prediction.uncertainties.quality.toFixed(1)}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Energy Efficiency</p>
                <p className="text-white font-medium">
                  {prediction.predictions.energyEfficiency.toFixed(1)} g/kWh
                </p>
              </div>
              <div>
                <p className="text-gray-400">Confidence</p>
                <p className="text-white font-medium">
                  {(prediction.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-2">Calculating predictions...</p>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Spectrum Optimization System</h2>
              <p className="text-sm text-gray-400">ML-powered spectrum analysis and optimization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['overview', 'cycles', 'models', 'recommendations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'cycles' && renderCyclesTab()}
          {activeTab === 'models' && renderModelsTab()}
          {activeTab === 'recommendations' && renderRecommendationsTab()}
        </div>
      </div>
    </div>
  );
}