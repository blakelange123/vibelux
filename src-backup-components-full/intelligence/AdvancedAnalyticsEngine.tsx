'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Zap,
  Leaf,
  Thermometer,
  Droplets,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Settings,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Database,
  Network,
  Gauge,
  LineChart,
  BarChart,
  Users,
  Package,
  Factory,
  Shield,
  Award,
  Star,
  TrendingDown
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'time-series' | 'anomaly-detection';
  status: 'training' | 'ready' | 'deployed' | 'needs-retraining';
  accuracy: number;
  lastTrained: Date;
  predictions: number;
  confidence: number;
  inputs: string[];
  outputs: string[];
  description: string;
}

interface Prediction {
  id: string;
  modelId: string;
  target: string;
  predictedValue: number | string;
  confidence: number;
  timeframe: string;
  actualValue?: number | string;
  accuracy?: number;
  factors: Array<{
    name: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
}

interface Anomaly {
  id: string;
  type: 'equipment' | 'environmental' | 'growth' | 'energy' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  location: string;
  probability: number;
  recommendation: string;
  status: 'new' | 'investigating' | 'resolved';
}

interface OptimizationRecommendation {
  id: string;
  category: 'lighting' | 'climate' | 'irrigation' | 'nutrients' | 'timing' | 'layout';
  title: string;
  description: string;
  expectedImpact: {
    yield: number;
    energy: number;
    cost: number;
    quality: number;
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeRequired: string;
    costEstimate: number;
  };
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export function AdvancedAnalyticsEngine() {
  const [selectedTab, setSelectedTab] = useState<'models' | 'predictions' | 'anomalies' | 'optimization'>('models');
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const [mlModels, setMLModels] = useState<MLModel[]>([
    {
      id: 'yield-predictor',
      name: 'Yield Prediction Model',
      type: 'regression',
      status: 'deployed',
      accuracy: 94.2,
      lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      predictions: 1247,
      confidence: 87.3,
      inputs: ['DLI', 'VPD', 'CO2', 'temperature', 'humidity', 'strain', 'plant_age'],
      outputs: ['fresh_weight', 'dry_weight', 'quality_grade'],
      description: 'Predicts final yield and quality based on environmental conditions and strain characteristics'
    },
    {
      id: 'energy-optimizer',
      name: 'Energy Optimization Model',
      type: 'regression',
      status: 'deployed',
      accuracy: 91.8,
      lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      predictions: 892,
      confidence: 89.1,
      inputs: ['light_intensity', 'photoperiod', 'HVAC_load', 'outside_temp', 'occupancy'],
      outputs: ['energy_consumption', 'peak_demand', 'cost_per_gram'],
      description: 'Optimizes energy usage while maintaining optimal growing conditions'
    },
    {
      id: 'disease-detector',
      name: 'Plant Disease Detection',
      type: 'classification',
      status: 'deployed',
      accuracy: 96.7,
      lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      predictions: 453,
      confidence: 92.4,
      inputs: ['leaf_images', 'environmental_data', 'growth_stage', 'strain_type'],
      outputs: ['disease_type', 'severity', 'treatment_recommendation'],
      description: 'Early detection of plant diseases and pests using computer vision and environmental data'
    },
    {
      id: 'quality-predictor',
      name: 'Cannabinoid Profile Predictor',
      type: 'regression',
      status: 'training',
      accuracy: 88.5,
      lastTrained: new Date(Date.now() - 1 * 60 * 60 * 1000),
      predictions: 0,
      confidence: 0,
      inputs: ['spectrum_profile', 'harvest_timing', 'curing_conditions', 'genetics'],
      outputs: ['THC_percentage', 'CBD_percentage', 'terpene_profile'],
      description: 'Predicts final cannabinoid and terpene profiles based on cultivation parameters'
    },
    {
      id: 'anomaly-detector',
      name: 'System Anomaly Detection',
      type: 'anomaly-detection',
      status: 'deployed',
      accuracy: 93.1,
      lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      predictions: 2341,
      confidence: 85.7,
      inputs: ['sensor_readings', 'equipment_metrics', 'environmental_trends'],
      outputs: ['anomaly_score', 'anomaly_type', 'confidence_level'],
      description: 'Detects unusual patterns in facility operations and equipment performance'
    }
  ]);

  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: 'pred-1',
      modelId: 'yield-predictor',
      target: 'Harvest Yield - Room A',
      predictedValue: 48.7,
      confidence: 87.3,
      timeframe: '14 days',
      actualValue: 46.2,
      accuracy: 94.8,
      factors: [
        { name: 'DLI Optimization', impact: 0.32, direction: 'positive' },
        { name: 'VPD Control', impact: 0.28, direction: 'positive' },
        { name: 'CO2 Enrichment', impact: 0.24, direction: 'positive' },
        { name: 'Temperature Variance', impact: -0.12, direction: 'negative' }
      ]
    },
    {
      id: 'pred-2',
      modelId: 'energy-optimizer',
      target: 'Energy Cost Reduction',
      predictedValue: 18.4,
      confidence: 89.1,
      timeframe: '30 days',
      factors: [
        { name: 'LED Efficiency', impact: 0.45, direction: 'positive' },
        { name: 'HVAC Optimization', impact: 0.31, direction: 'positive' },
        { name: 'Peak Demand Management', impact: 0.24, direction: 'positive' }
      ]
    },
    {
      id: 'pred-3',
      modelId: 'quality-predictor',
      target: 'THC Percentage',
      predictedValue: 24.8,
      confidence: 82.6,
      timeframe: 'Harvest',
      factors: [
        { name: 'UV-B Exposure', impact: 0.38, direction: 'positive' },
        { name: 'Harvest Timing', impact: 0.29, direction: 'positive' },
        { name: 'Night Temperature Drop', impact: 0.21, direction: 'positive' },
        { name: 'Stress Factors', impact: -0.15, direction: 'negative' }
      ]
    }
  ]);

  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      id: 'anom-1',
      type: 'equipment',
      severity: 'high',
      description: 'LED Panel #24 showing 12% efficiency degradation',
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: 'Flower Room A, Zone 3',
      probability: 94.2,
      recommendation: 'Schedule maintenance during next dark cycle to prevent yield impact',
      status: 'new'
    },
    {
      id: 'anom-2',
      type: 'environmental',
      severity: 'medium',
      description: 'Unusual humidity pattern detected in Veg Room B',
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      location: 'Veg Room B',
      probability: 87.6,
      recommendation: 'Check dehumidifier settings and air circulation',
      status: 'investigating'
    },
    {
      id: 'anom-3',
      type: 'growth',
      severity: 'low',
      description: 'Slower than expected growth rate in Sector 7',
      detectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      location: 'Flower Room C, Sector 7',
      probability: 76.3,
      recommendation: 'Review nutrient solution EC and pH levels',
      status: 'resolved'
    }
  ]);

  const [optimizations, setOptimizations] = useState<OptimizationRecommendation[]>([
    {
      id: 'opt-1',
      category: 'lighting',
      title: 'Implement Dynamic Spectrum Modulation',
      description: 'Adjust red:blue ratio based on growth stage and strain genetics for optimal cannabinoid production',
      expectedImpact: {
        yield: 8.3,
        energy: -5.2,
        cost: -12.1,
        quality: 15.7
      },
      implementation: {
        complexity: 'medium',
        timeRequired: '2-3 weeks',
        costEstimate: 15000
      },
      confidence: 87.4,
      priority: 'high'
    },
    {
      id: 'opt-2',
      category: 'climate',
      title: 'Optimize VPD Control Strategy',
      description: 'Implement strain-specific VPD curves that adapt to plant development stage',
      expectedImpact: {
        yield: 12.1,
        energy: 2.3,
        cost: -8.7,
        quality: 9.4
      },
      implementation: {
        complexity: 'low',
        timeRequired: '1 week',
        costEstimate: 3000
      },
      confidence: 92.1,
      priority: 'high'
    },
    {
      id: 'opt-3',
      category: 'irrigation',
      title: 'Predictive Irrigation Scheduling',
      description: 'Use plant stress indicators and growth models to optimize irrigation timing and volume',
      expectedImpact: {
        yield: 6.8,
        energy: -1.2,
        cost: -15.3,
        quality: 7.2
      },
      implementation: {
        complexity: 'high',
        timeRequired: '4-6 weeks',
        costEstimate: 25000
      },
      confidence: 84.6,
      priority: 'medium'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-500';
      case 'ready': return 'text-blue-500';
      case 'training': return 'text-yellow-500';
      case 'needs-retraining': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const formatAccuracy = (accuracy: number) => `${accuracy.toFixed(1)}%`;
  const formatConfidence = (confidence: number) => `${confidence.toFixed(1)}%`;
  const formatImpact = (impact: number) => `${impact > 0 ? '+' : ''}${impact.toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Advanced Analytics Engine
            </h1>
            <p className="text-gray-400">Machine learning models and predictive analytics for cultivation optimization</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTraining(!isTraining)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                isTraining 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isTraining ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isTraining ? 'Training...' : 'Start Training'}
            </button>
            
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Models
            </button>
            
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configure
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{mlModels.length}</span>
            </div>
            <p className="text-sm text-gray-400">Active Models</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">92.8%</span>
            </div>
            <p className="text-sm text-gray-400">Avg Accuracy</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{predictions.length}</span>
            </div>
            <p className="text-sm text-gray-400">Active Predictions</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{anomalies.filter(a => a.status === 'new').length}</span>
            </div>
            <p className="text-sm text-gray-400">New Anomalies</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'models', label: 'ML Models', icon: Brain },
            { id: 'predictions', label: 'Predictions', icon: TrendingUp },
            { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
            { id: 'optimization', label: 'Optimization', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedTab === 'models' && (
          <div className="grid grid-cols-1 gap-6">
            {mlModels.map(model => (
              <div key={model.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{model.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{model.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-blue-400">{model.type}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">Status:</span>
                        <span className={getStatusColor(model.status)}>{model.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getStatusColor(model.status)} mb-1`}>
                      {formatAccuracy(model.accuracy)}
                    </div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Predictions Made</div>
                    <div className="text-lg font-semibold text-white">{model.predictions.toLocaleString()}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-semibold text-white">{formatConfidence(model.confidence)}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Last Trained</div>
                    <div className="text-lg font-semibold text-white">{model.lastTrained.toLocaleDateString()}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Inputs</div>
                    <div className="text-lg font-semibold text-white">{model.inputs.length}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Input Features</div>
                    <div className="flex flex-wrap gap-1">
                      {model.inputs.map(input => (
                        <span key={input} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {input}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Output Targets</div>
                    <div className="flex flex-wrap gap-1">
                      {model.outputs.map(output => (
                        <span key={output} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all">
                    Retrain Model
                  </button>
                  <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-all">
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'predictions' && (
          <div className="grid grid-cols-1 gap-6">
            {predictions.map(prediction => (
              <div key={prediction.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{prediction.target}</h3>
                    <p className="text-sm text-gray-400">
                      Model: {mlModels.find(m => m.id === prediction.modelId)?.name}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {typeof prediction.predictedValue === 'number' 
                        ? prediction.predictedValue.toFixed(1) 
                        : prediction.predictedValue}
                    </div>
                    <div className="text-sm text-gray-400">{prediction.timeframe}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-semibold text-white">{formatConfidence(prediction.confidence)}</div>
                  </div>
                  
                  {prediction.actualValue && (
                    <>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-400">Actual Value</div>
                        <div className="text-lg font-semibold text-white">
                          {typeof prediction.actualValue === 'number' 
                            ? prediction.actualValue.toFixed(1) 
                            : prediction.actualValue}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-400">Accuracy</div>
                        <div className="text-lg font-semibold text-green-400">{formatAccuracy(prediction.accuracy!)}</div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-3">Contributing Factors</div>
                  <div className="space-y-2">
                    {prediction.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-sm text-gray-300">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full ${
                            factor.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'
                          }`} style={{ width: `${Math.abs(factor.impact) * 100}px` }} />
                          <span className={`text-sm font-medium ${
                            factor.direction === 'positive' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'anomalies' && (
          <div className="grid grid-cols-1 gap-4">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400">{anomaly.type}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{anomaly.description}</h3>
                    <p className="text-sm text-gray-400">{anomaly.location}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-red-400 mb-1">{anomaly.probability.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Confidence</div>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                  <div className="text-sm text-blue-400 font-medium mb-1">Recommendation:</div>
                  <div className="text-sm text-gray-300">{anomaly.recommendation}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Detected: {anomaly.detectedAt.toLocaleString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all">
                      Investigate
                    </button>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all">
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'optimization' && (
          <div className="grid grid-cols-1 gap-6">
            {optimizations.map(optimization => (
              <div key={optimization.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(optimization.priority)}`}>
                        {optimization.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400">{optimization.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{optimization.title}</h3>
                    <p className="text-sm text-gray-400">{optimization.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-400 mb-1">{formatConfidence(optimization.confidence)}</div>
                    <div className="text-sm text-gray-400">Confidence</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Yield Impact</div>
                    <div className={`text-lg font-semibold ${
                      optimization.expectedImpact.yield > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatImpact(optimization.expectedImpact.yield)}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Energy Impact</div>
                    <div className={`text-lg font-semibold ${
                      optimization.expectedImpact.energy < 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatImpact(optimization.expectedImpact.energy)}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Cost Impact</div>
                    <div className={`text-lg font-semibold ${
                      optimization.expectedImpact.cost < 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatImpact(optimization.expectedImpact.cost)}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Quality Impact</div>
                    <div className={`text-lg font-semibold ${
                      optimization.expectedImpact.quality > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatImpact(optimization.expectedImpact.quality)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Complexity</div>
                    <div className="text-lg font-semibold text-white">{optimization.implementation.complexity}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Time Required</div>
                    <div className="text-lg font-semibold text-white">{optimization.implementation.timeRequired}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Cost Estimate</div>
                    <div className="text-lg font-semibold text-white">
                      ${optimization.implementation.costEstimate.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-all">
                    Implement Recommendation
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all">
                    Schedule Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}