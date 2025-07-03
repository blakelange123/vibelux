'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Activity, TrendingUp, AlertTriangle, Target,
  Camera, Microscope, Cpu, Network, BarChart3, 
  Lightbulb, Droplets, Wind, Thermometer, Clock,
  Shield, Zap, Eye, Heart, TreePine, Award
} from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

interface PlantHealthMetrics {
  overallHealth: number;
  stressLevel: number;
  growthRate: number;
  waterUseEfficiency: number;
  lightAbsorption: number;
  nutrientUptake: number;
  diseaseRisk: number;
  yieldPotential: number;
}

interface PredictiveInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'action' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  metrics: {
    current: number;
    predicted: number;
    optimal: number;
  };
}

interface LearningPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  accuracy: number;
  lastObserved: Date;
  triggers: string[];
  outcomes: string[];
}

export function AIEnhancedPlantAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'vision' | 'patterns' | 'optimization'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Plant health metrics
  const [healthMetrics, setHealthMetrics] = useState<PlantHealthMetrics>({
    overallHealth: 92,
    stressLevel: 8,
    growthRate: 1.2,
    waterUseEfficiency: 87,
    lightAbsorption: 94,
    nutrientUptake: 89,
    diseaseRisk: 12,
    yieldPotential: 96
  });

  // Predictive insights
  const [insights, setInsights] = useState<PredictiveInsight[]>([
    {
      id: 'pred-001',
      type: 'prediction',
      title: 'Optimal Harvest Window Approaching',
      description: 'Based on growth patterns and environmental data, optimal harvest window predicted in 14-17 days',
      confidence: 94,
      timeframe: '2 weeks',
      impact: 'high',
      recommendations: [
        'Begin pre-harvest preparation protocols',
        'Schedule quality testing for day 12',
        'Adjust nutrients for finishing phase'
      ],
      metrics: {
        current: 75,
        predicted: 98,
        optimal: 100
      }
    },
    {
      id: 'pred-002',
      type: 'opportunity',
      title: 'Light Spectrum Optimization Available',
      description: 'Analysis shows 12% yield increase possible with spectral adjustment',
      confidence: 87,
      timeframe: 'Immediate',
      impact: 'medium',
      recommendations: [
        'Increase far-red spectrum by 15%',
        'Reduce blue spectrum by 8% during flowering',
        'Implement sunrise/sunset simulation'
      ],
      metrics: {
        current: 82,
        predicted: 94,
        optimal: 96
      }
    }
  ]);

  // Learning patterns
  const [patterns, setPatterns] = useState<LearningPattern[]>([
    {
      id: 'pattern-001',
      name: 'Pre-Stress Water Conservation',
      description: 'Plants reduce transpiration 6-8 hours before visible stress signs',
      frequency: 156,
      accuracy: 92.5,
      lastObserved: new Date(),
      triggers: ['VPD > 1.8 kPa', 'Soil moisture < 35%', 'Temperature > 82°F'],
      outcomes: ['Stomatal closure', 'Reduced growth rate', 'Leaf angle adjustment']
    }
  ]);

  // Initialize TensorFlow model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // In production, load a pre-trained model
        // For demo, create a simple model
        const model = tf.sequential({
          layers: [
            tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dense({ units: 8, activation: 'sigmoid' })
          ]
        });
        
        model.compile({
          optimizer: 'adam',
          loss: 'meanSquaredError',
          metrics: ['accuracy']
        });
        
        setModel(model);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();
  }, []);

  // Real-time pattern detection
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate pattern detection
      const newPattern = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.95;
      if (newPattern) {
        const pattern: LearningPattern = {
          id: `pattern-${Date.now()}`,
          name: 'Circadian Rhythm Optimization',
          description: 'Plants showing improved photosynthesis with adjusted photoperiod',
          frequency: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10,
          accuracy: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
          lastObserved: new Date(),
          triggers: ['Time: 2-4 hours before lights off', 'PPFD > 600'],
          outcomes: ['Increased CO2 uptake', 'Enhanced sugar translocation']
        };
        
        setPatterns(prev => [pattern, ...prev.slice(0, 9)]);
      }

      // Update metrics with AI predictions
      setHealthMetrics(prev => ({
        ...prev,
        overallHealth: Math.min(100, Math.max(0, prev.overallHealth + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2)),
        stressLevel: Math.min(100, Math.max(0, prev.stressLevel + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3)),
        growthRate: Math.max(0, prev.growthRate + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Computer vision analysis
  const analyzeVideoFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !model) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);
    
    // Draw video frame to canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Get image data and preprocess for model
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simulate AI analysis
    setTimeout(() => {
      // Generate mock results
      const healthScore = 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
      const stressIndicators = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.3;
      const growthAnomaly = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.1;
      
      if (stressIndicators) {
        const insight: PredictiveInsight = {
          id: `insight-${Date.now()}`,
          type: 'warning',
          title: 'Early Stress Detection via Computer Vision',
          description: 'Leaf color and posture analysis indicates developing stress',
          confidence: 78,
          timeframe: '24-48 hours',
          impact: 'medium',
          recommendations: [
            'Check root zone moisture levels',
            'Verify VPD is within optimal range',
            'Inspect for pest presence'
          ],
          metrics: {
            current: healthScore,
            predicted: healthScore - 10,
            optimal: 95
          }
        };
        
        setInsights(prev => [insight, ...prev.slice(0, 9)]);
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI Health Dashboard */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          AI-Powered Plant Health Analysis
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(healthMetrics).map(([key, value]) => (
            <div key={key} className="bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">
                  {typeof value === 'number' && value < 2 ? value.toFixed(1) : Math.round(value)}
                  {key === 'waterUseEfficiency' || key === 'lightAbsorption' || key === 'nutrientUptake' ? '%' : ''}
                </p>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  key === 'stressLevel' || key === 'diseaseRisk' 
                    ? value > 30 ? 'bg-red-900/50' : value > 15 ? 'bg-yellow-900/50' : 'bg-green-900/50'
                    : value > 80 ? 'bg-green-900/50' : value > 60 ? 'bg-yellow-900/50' : 'bg-red-900/50'
                }`}>
                  <Activity className={`w-6 h-6 ${
                    key === 'stressLevel' || key === 'diseaseRisk'
                      ? value > 30 ? 'text-red-400' : value > 15 ? 'text-yellow-400' : 'text-green-400'
                      : value > 80 ? 'text-green-400' : value > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    key === 'stressLevel' || key === 'diseaseRisk'
                      ? 'bg-gradient-to-r from-green-500 to-red-500'
                      : 'bg-gradient-to-r from-red-500 to-green-500'
                  }`}
                  style={{ 
                    width: `${value}%`,
                    opacity: key === 'stressLevel' || key === 'diseaseRisk' ? 1 - (value / 100) : value / 100
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neural Network Activity */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          Neural Network Processing
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Pattern Recognition</span>
              <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-white">2,847</p>
            <p className="text-xs text-gray-400">Patterns/hour</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Prediction Accuracy</span>
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">94.2%</p>
            <p className="text-xs text-gray-400">7-day average</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Learning Rate</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">+12%</p>
            <p className="text-xs text-gray-400">Weekly improvement</p>
          </div>
        </div>
      </div>

      {/* Real-time Insights */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          AI-Generated Insights
        </h4>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {insights.slice(0, 3).map(insight => (
            <div key={insight.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'warning' ? 'bg-yellow-900/50' :
                  insight.type === 'opportunity' ? 'bg-blue-900/50' :
                  insight.type === 'action' ? 'bg-purple-900/50' :
                  'bg-green-900/50'
                }`}>
                  {insight.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                   insight.type === 'opportunity' ? <TrendingUp className="w-4 h-4 text-blue-400" /> :
                   insight.type === 'action' ? <Zap className="w-4 h-4 text-purple-400" /> :
                   <Target className="w-4 h-4 text-green-400" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-white">{insight.title}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'critical' ? 'bg-red-900/50 text-red-400' :
                      insight.impact === 'high' ? 'bg-orange-900/50 text-orange-400' :
                      insight.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-green-900/50 text-green-400'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-400">
                      Confidence: <span className="text-white font-medium">{insight.confidence}%</span>
                    </span>
                    <span className="text-gray-400">
                      Timeframe: <span className="text-white font-medium">{insight.timeframe}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Predictive Analytics Dashboard</h4>
        
        <div className="space-y-4">
          {insights.map(insight => (
            <div key={insight.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  insight.type === 'warning' ? 'bg-yellow-900/50' :
                  insight.type === 'opportunity' ? 'bg-blue-900/50' :
                  insight.type === 'action' ? 'bg-purple-900/50' :
                  'bg-green-900/50'
                }`}>
                  {insight.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                   insight.type === 'opportunity' ? <TrendingUp className="w-5 h-5 text-blue-400" /> :
                   insight.type === 'action' ? <Zap className="w-5 h-5 text-purple-400" /> :
                   <Target className="w-5 h-5 text-green-400" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-medium text-white">{insight.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.impact === 'critical' ? 'bg-red-900/50 text-red-400' :
                        insight.impact === 'high' ? 'bg-orange-900/50 text-orange-400' :
                        insight.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-green-900/50 text-green-400'
                      }`}>
                        {insight.impact} impact
                      </span>
                      <span className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                  
                  {/* Metrics Visualization */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress to Optimal</span>
                      <span className="text-gray-300">
                        {insight.metrics.current} → {insight.metrics.predicted} / {insight.metrics.optimal}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div 
                          className="bg-blue-500 transition-all duration-500"
                          style={{ width: `${(insight.metrics.current / insight.metrics.optimal) * 100}%` }}
                        />
                        <div 
                          className="bg-green-500 transition-all duration-500"
                          style={{ width: `${((insight.metrics.predicted - insight.metrics.current) / insight.metrics.optimal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">AI Recommendations:</p>
                    {insight.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="w-1 h-1 bg-gray-500 rounded-full" />
                        {rec}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                      Apply Recommendation
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors">
                      Schedule for Later
                    </button>
                    <span className="text-xs text-gray-500">
                      Timeframe: {insight.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVision = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400" />
          Computer Vision Plant Analysis
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Feed */}
          <div>
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
              <video 
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                muted
                loop
              >
                <source src="/plant-monitoring-feed.mp4" type="video/mp4" />
                Your browser does not support video.
              </video>
              <canvas 
                ref={canvasRef}
                className="hidden"
                width={640}
                height={480}
              />
            </div>
            
            <button
              onClick={analyzeVideoFrame}
              disabled={isProcessing}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                isProcessing 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                'Analyze Current Frame'
              )}
            </button>
          </div>
          
          {/* Analysis Results */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-white mb-3">Visual Health Indicators</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Leaf Color Analysis</span>
                  <span className="text-sm font-medium text-green-400">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Leaf Posture</span>
                  <span className="text-sm font-medium text-green-400">Normal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Growth Symmetry</span>
                  <span className="text-sm font-medium text-yellow-400">Minor Asymmetry</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Pest Detection</span>
                  <span className="text-sm font-medium text-green-400">None Detected</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-white mb-3">AI Detection Features</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Chlorophyll content estimation
                </li>
                <li className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-purple-400" />
                  Early disease detection
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Nutrient deficiency identification
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  Growth rate tracking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Machine Learning Pattern Discovery
        </h4>
        
        <div className="space-y-4">
          {patterns.map(pattern => (
            <div key={pattern.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-white">{pattern.name}</h5>
                  <p className="text-sm text-gray-400 mt-1">{pattern.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-400">{pattern.accuracy.toFixed(1)}% accurate</p>
                  <p className="text-xs text-gray-500">Observed {pattern.frequency} times</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Triggers:</p>
                  <ul className="space-y-1">
                    {pattern.triggers.map((trigger, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Outcomes:</p>
                  <ul className="space-y-1">
                    {pattern.outcomes.map((outcome, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  Last observed: {pattern.lastObserved.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          AI-Driven Optimization Engine
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment Optimization */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="font-medium text-white mb-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              Environmental Parameters
            </h5>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">Temperature</span>
                  <span className="text-sm text-white">75°F → 77°F</span>
                </div>
                <div className="text-xs text-green-400">+3.2% growth rate</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">Humidity</span>
                  <span className="text-sm text-white">65% → 62%</span>
                </div>
                <div className="text-xs text-green-400">-18% disease risk</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">CO₂</span>
                  <span className="text-sm text-white">800 → 1000 ppm</span>
                </div>
                <div className="text-xs text-green-400">+8.5% photosynthesis</div>
              </div>
            </div>
          </div>
          
          {/* Resource Optimization */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="font-medium text-white mb-3 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              Resource Efficiency
            </h5>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">Water Usage</span>
                  <span className="text-sm text-white">-22%</span>
                </div>
                <div className="text-xs text-blue-400">Via precision scheduling</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">Energy Consumption</span>
                  <span className="text-sm text-white">-15%</span>
                </div>
                <div className="text-xs text-blue-400">Smart dimming enabled</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">Nutrient Efficiency</span>
                  <span className="text-sm text-white">+18%</span>
                </div>
                <div className="text-xs text-blue-400">Optimized EC levels</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Yield Optimization */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-green-900/20 rounded-lg border border-purple-800/50">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-white flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-400" />
              Projected Yield Improvement
            </h5>
            <span className="text-2xl font-bold text-green-400">+24.8%</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Based on 30-day implementation of AI recommendations
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Quality Score</p>
              <p className="text-lg font-bold text-white">A+</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Time to Harvest</p>
              <p className="text-lg font-bold text-white">-3 days</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">ROI</p>
              <p className="text-lg font-bold text-white">287%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          AI-Enhanced Plant Analytics
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/50 rounded-lg">
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-sm text-purple-400">AI Active</span>
          </div>
          {model && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/50 rounded-lg">
              <Cpu className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Model Loaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {['overview', 'predictions', 'vision', 'patterns', 'optimization'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'predictions' && renderPredictions()}
      {activeTab === 'vision' && renderVision()}
      {activeTab === 'patterns' && renderPatterns()}
      {activeTab === 'optimization' && renderOptimization()}
    </div>
  );
}