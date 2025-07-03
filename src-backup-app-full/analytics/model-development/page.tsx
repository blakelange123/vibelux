'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, BarChart3, LineChart, Brain, 
  GitBranch, Zap, AlertTriangle, CheckCircle, Info,
  Eye, Download, Play, Pause, RefreshCw, Settings,
  Calendar, Filter, Layers, Target, FlaskConical
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ComposedChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
  Treemap
} from 'recharts';

interface ModelDevelopment {
  modelId: string;
  version: string;
  status: 'training' | 'validation' | 'production' | 'archived';
  createdAt: Date;
  metrics: {
    current: number;
    previous: number;
    change: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  features: {
    name: string;
    type: 'spectral' | 'environmental' | 'temporal' | 'interaction';
    added: Date;
    impact: number;
    stability: number;
  }[];
  experiments: {
    id: string;
    name: string;
    date: Date;
    type: 'feature_addition' | 'hyperparameter_tuning' | 'architecture_change';
    result: 'success' | 'failure' | 'neutral';
    metricChange: number;
    description: string;
  }[];
  trainingHistory: {
    epoch: number;
    trainLoss: number;
    valLoss: number;
    trainAccuracy: number;
    valAccuracy: number;
    learningRate: number;
  }[];
}

export default function ModelDevelopmentPage() {
  const [selectedModel, setSelectedModel] = useState('spectral_yield_v3');
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'features' | 'experiments' | 'training'>('overview');
  const [modelData, setModelData] = useState<ModelDevelopment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadModelDevelopmentData();
  }, [selectedModel, timeRange]);

  const loadModelDevelopmentData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const data = generateMockModelData();
      setModelData(data);
    } finally {
      setLoading(false);
    }
  };

  const generateMockModelData = (): ModelDevelopment => {
    const features = [
      { name: 'UV-A %', type: 'spectral' as const, added: new Date('2024-01-15'), impact: 85, stability: 92 },
      { name: 'Red:Far-Red Ratio', type: 'spectral' as const, added: new Date('2024-01-10'), impact: 78, stability: 88 },
      { name: 'CO₂ × DLI', type: 'interaction' as const, added: new Date('2024-01-20'), impact: 72, stability: 85 },
      { name: 'VPD', type: 'environmental' as const, added: new Date('2024-01-05'), impact: 68, stability: 90 },
      { name: 'Growth Stage Days', type: 'temporal' as const, added: new Date('2024-01-18'), impact: 65, stability: 82 },
      { name: 'Blue × Red %', type: 'interaction' as const, added: new Date('2024-01-12'), impact: 62, stability: 87 },
      { name: 'Photoperiod', type: 'temporal' as const, added: new Date('2024-01-08'), impact: 58, stability: 95 },
      { name: 'Nutrient EC', type: 'environmental' as const, added: new Date('2024-01-22'), impact: 55, stability: 78 },
    ];

    const experiments = [
      {
        id: 'exp_001',
        name: 'Add UV-A quadratic term',
        date: new Date('2024-01-25'),
        type: 'feature_addition' as const,
        result: 'success' as const,
        metricChange: 3.2,
        description: 'Added UV-A² to capture diminishing returns at high UV levels'
      },
      {
        id: 'exp_002',
        name: 'Optimize hyperparameters',
        date: new Date('2024-01-23'),
        type: 'hyperparameter_tuning' as const,
        result: 'success' as const,
        metricChange: 1.8,
        description: 'Grid search on learning rate and regularization'
      },
      {
        id: 'exp_003',
        name: 'Add temporal encoding',
        date: new Date('2024-01-20'),
        type: 'architecture_change' as const,
        result: 'neutral' as const,
        metricChange: 0.2,
        description: 'Added sinusoidal time encoding - minimal impact'
      },
      {
        id: 'exp_004',
        name: 'Remove green spectrum',
        date: new Date('2024-01-18'),
        type: 'feature_addition' as const,
        result: 'failure' as const,
        metricChange: -1.5,
        description: 'Removing green % decreased model performance'
      }
    ];

    const trainingHistory = Array.from({ length: 100 }, (_, i) => ({
      epoch: i + 1,
      trainLoss: 0.5 * Math.exp(-i / 30) + 0.05 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02,
      valLoss: 0.5 * Math.exp(-i / 25) + 0.08 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.03,
      trainAccuracy: 0.5 + 0.45 * (1 - Math.exp(-i / 20)) + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02,
      valAccuracy: 0.5 + 0.40 * (1 - Math.exp(-i / 20)) + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.03,
      learningRate: 0.001 * Math.pow(0.95, Math.floor(i / 20))
    }));

    return {
      modelId: 'spectral_yield_v3',
      version: '3.2.1',
      status: 'production',
      createdAt: new Date('2024-01-01'),
      metrics: {
        current: 0.893,
        previous: 0.865,
        change: 3.2,
        trend: 'improving'
      },
      features,
      experiments,
      trainingHistory
    };
  };

  // Calculate feature type distribution
  const featureTypeDistribution = modelData ? 
    Object.entries(
      modelData.features.reduce((acc, feature) => {
        acc[feature.type] = (acc[feature.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: type === 'spectral' ? '#8B5CF6' : 
            type === 'environmental' ? '#10B981' :
            type === 'temporal' ? '#3B82F6' : '#F59E0B'
    })) : [];

  // Prepare experiment timeline data
  const experimentTimeline = modelData ?
    modelData.experiments.map(exp => ({
      date: exp.date.toLocaleDateString(),
      impact: exp.metricChange,
      name: exp.name,
      result: exp.result
    })) : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading || !modelData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading model development data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analytics
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Model Development</h1>
              <p className="text-gray-400">
                Track regression model evolution and experiment results
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTraining(!isTraining)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isTraining 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isTraining ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop Training
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Training
                  </>
                )}
              </button>
              <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Model Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className={`text-sm px-2 py-1 rounded-full ${
                modelData.status === 'production' ? 'bg-green-500/20 text-green-400' :
                modelData.status === 'training' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {modelData.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Current Model</p>
            <p className="text-2xl font-bold text-white">{modelData.modelId}</p>
            <p className="text-sm text-gray-500 mt-1">Version {modelData.version}</p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className={`w-8 h-8 ${
                modelData.metrics.trend === 'improving' ? 'text-green-400' :
                modelData.metrics.trend === 'stable' ? 'text-yellow-400' :
                'text-red-400'
              }`} />
              <span className={`text-sm font-medium ${
                modelData.metrics.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {modelData.metrics.change > 0 ? '+' : ''}{modelData.metrics.change.toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-400 text-sm">Performance</p>
            <p className="text-2xl font-bold text-white">
              R² = {modelData.metrics.current.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Prev: {modelData.metrics.previous.toFixed(3)}
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <FlaskConical className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">Last 30d</span>
            </div>
            <p className="text-gray-400 text-sm">Experiments</p>
            <p className="text-2xl font-bold text-white">{modelData.experiments.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {modelData.experiments.filter(e => e.result === 'success').length} successful
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Layers className="w-8 h-8 text-orange-400" />
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <p className="text-gray-400 text-sm">Features</p>
            <p className="text-2xl font-bold text-white">{modelData.features.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {featureTypeDistribution.length} types
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          {['overview', 'features', 'experiments', 'training'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-6 py-3 font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Overview View */}
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Feature Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Feature Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={featureTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {featureTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {featureTypeDistribution.map((type) => (
                      <div key={type.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.fill }}></div>
                        <span className="text-sm text-gray-400">{type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experiment Impact Timeline */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Experiment Impact</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={experimentTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="impact">
                        {experimentTimeline.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.result === 'success' ? '#10B981' :
                              entry.result === 'failure' ? '#EF4444' : '#6B7280'
                            } 
                          />
                        ))}
                      </Bar>
                      <ReferenceLine y={0} stroke="#9CA3AF" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Model Evolution Timeline */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Model Performance Evolution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={modelData.trainingHistory.filter((_, i) => i % 5 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="epoch" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={[0, 1]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="trainAccuracy" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                      name="Training Accuracy"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valAccuracy" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      name="Validation Accuracy"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Features View */}
        {viewMode === 'features' && (
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Feature Analysis</h3>
              <div className="space-y-4">
                {modelData.features
                  .sort((a, b) => b.impact - a.impact)
                  .map((feature) => (
                    <div key={feature.name} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">{feature.name}</h4>
                          <p className="text-sm text-gray-400">
                            Added {feature.added.toLocaleDateString()} • {feature.type}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          feature.type === 'spectral' ? 'bg-purple-500/20 text-purple-400' :
                          feature.type === 'environmental' ? 'bg-green-500/20 text-green-400' :
                          feature.type === 'temporal' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {feature.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Impact Score</span>
                            <span className="text-sm text-white">{feature.impact}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${feature.impact}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Stability</span>
                            <span className="text-sm text-white">{feature.stability}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${feature.stability}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Experiments View */}
        {viewMode === 'experiments' && (
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Experiment History</h3>
              <div className="space-y-4">
                {modelData.experiments.map((experiment) => (
                  <div key={experiment.id} className={`p-4 rounded-lg border ${
                    experiment.result === 'success' ? 'bg-green-900/20 border-green-500/20' :
                    experiment.result === 'failure' ? 'bg-red-900/20 border-red-500/20' :
                    'bg-gray-800 border-gray-700'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{experiment.name}</h4>
                        <p className="text-sm text-gray-400">
                          {experiment.date.toLocaleDateString()} • {experiment.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-semibold ${
                          experiment.metricChange > 0 ? 'text-green-400' : 
                          experiment.metricChange < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {experiment.metricChange > 0 ? '+' : ''}{experiment.metricChange.toFixed(1)}%
                        </span>
                        {experiment.result === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : experiment.result === 'failure' ? (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Info className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{experiment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training View */}
        {viewMode === 'training' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Loss Curves */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Loss Curves</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modelData.trainingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="epoch" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" scale="log" domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="trainLoss" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={false}
                        name="Training Loss"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valLoss" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={false}
                        name="Validation Loss"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Learning Rate Schedule */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Learning Rate Schedule</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modelData.trainingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="epoch" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" scale="log" domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="stepAfter" 
                        dataKey="learningRate" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={false}
                        name="Learning Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Training Statistics */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Training Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Final Training Loss</p>
                  <p className="text-2xl font-bold text-white">
                    {modelData.trainingHistory[modelData.trainingHistory.length - 1].trainLoss.toFixed(4)}
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Final Validation Loss</p>
                  <p className="text-2xl font-bold text-white">
                    {modelData.trainingHistory[modelData.trainingHistory.length - 1].valLoss.toFixed(4)}
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Best Validation Accuracy</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.max(...modelData.trainingHistory.map(h => h.valAccuracy)).toFixed(3)}
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Total Epochs</p>
                  <p className="text-2xl font-bold text-white">
                    {modelData.trainingHistory.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Panel */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <GitBranch className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Development Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Recent Improvements:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• UV-A quadratic term improved THC prediction by 3.2%</li>
                    <li>• CO₂ × DLI interaction captures growth optimization</li>
                    <li>• VPD coefficient shows strong negative correlation as expected</li>
                    <li>• Model stability improved with regularization tuning</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Next Experiments:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Test three-way interaction: Light × CO₂ × Temperature</li>
                    <li>• Add cultivar-specific coefficients for strain optimization</li>
                    <li>• Implement attention mechanism for temporal features</li>
                    <li>• Explore ensemble methods for uncertainty quantification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}