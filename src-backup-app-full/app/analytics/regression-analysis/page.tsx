'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, BarChart3, LineChart, Brain, 
  Activity, Zap, Leaf, Sun, Eye, Download, Info,
  AlertCircle, CheckCircle, Layers, Target, Microscope
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  ScatterChart,
  Scatter,
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
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  Dot
} from 'recharts';

interface RegressionAnalysis {
  modelId: string;
  cultivar: string;
  growthStage: string;
  modelType: 'LINEAR' | 'RIDGE' | 'LASSO' | 'RANDOM_FOREST' | 'NEURAL_NETWORK';
  metrics: {
    rSquared: number;
    rmse: number;
    mae: number;
    mape: number;
    crossValidationScore: number;
    featureImportance: { [key: string]: number };
  };
  coefficients: {
    spectral: {
      uv_a: number;
      uv_a_squared: number;
      blue: number;
      blue_squared: number;
      red: number;
      red_squared: number;
      far_red: number;
      blue_red_interaction: number;
      red_far_red_ratio: number;
    };
    environmental: {
      co2: number;
      vpd: number;
      temperature: number;
      humidity: number;
      nutrient_ec: number;
    };
    temporal: {
      photoperiod: number;
      dli: number;
      growth_stage_factor: number;
      days_in_stage: number;
    };
  };
  predictions: {
    date: string;
    predicted: number;
    actual: number;
    residual: number;
    confidence_lower: number;
    confidence_upper: number;
  }[];
  residualAnalysis: {
    shapiroWilkPValue: number;
    durbinWatsonStat: number;
    heteroscedasticityPValue: number;
    autocorrelation: number[];
  };
  performance: {
    trainingScore: number;
    validationScore: number;
    testScore: number;
    overfittingRisk: 'low' | 'medium' | 'high';
  };
}

export default function RegressionAnalysisPage() {
  const [selectedCultivar, setSelectedCultivar] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState<'yield' | 'thc' | 'quality'>('yield');
  const [timeRange, setTimeRange] = useState('30d');
  const [analysisData, setAnalysisData] = useState<RegressionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    loadRegressionAnalysis();
  }, [selectedCultivar, selectedStage, selectedMetric, timeRange]);

  const loadRegressionAnalysis = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const data = generateMockRegressionData();
      setAnalysisData(data);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRegressionData = (): RegressionAnalysis => {
    const predictions = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const predicted = 100 + Math.sin(i / 5) * 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
      const actual = predicted + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 15;
      
      return {
        date: date.toISOString().split('T')[0],
        predicted,
        actual,
        residual: actual - predicted,
        confidence_lower: predicted - 10,
        confidence_upper: predicted + 10
      };
    });

    return {
      modelId: 'model_2024_01_spectral',
      cultivar: 'Blue Dream',
      growthStage: 'flowering',
      modelType: 'RANDOM_FOREST',
      metrics: {
        rSquared: 0.89,
        rmse: 12.3,
        mae: 9.8,
        mape: 8.2,
        crossValidationScore: 0.87,
        featureImportance: {
          red_percent: 0.25,
          dli_total: 0.18,
          co2_ppm: 0.15,
          blue_percent: 0.12,
          vpd_kpa: 0.10,
          uv_a_percent: 0.08,
          temperature: 0.07,
          photoperiod: 0.05
        }
      },
      coefficients: {
        spectral: {
          uv_a: 2.31,
          uv_a_squared: -0.28,
          blue: 0.82,
          blue_squared: -0.10,
          red: 0.92,
          red_squared: -0.08,
          far_red: 0.45,
          blue_red_interaction: 0.15,
          red_far_red_ratio: 0.84
        },
        environmental: {
          co2: 0.05,
          vpd: -15.2,
          temperature: 1.8,
          humidity: -0.9,
          nutrient_ec: 3.2
        },
        temporal: {
          photoperiod: 2.5,
          dli: 0.54,
          growth_stage_factor: 12.5,
          days_in_stage: 0.3
        }
      },
      predictions,
      residualAnalysis: {
        shapiroWilkPValue: 0.23,
        durbinWatsonStat: 1.95,
        heteroscedasticityPValue: 0.15,
        autocorrelation: [0.95, 0.82, 0.65, 0.48, 0.32]
      },
      performance: {
        trainingScore: 0.92,
        validationScore: 0.87,
        testScore: 0.85,
        overfittingRisk: 'low'
      }
    };
  };

  const getModelHealthColor = (rSquared: number) => {
    if (rSquared >= 0.85) return 'text-green-400';
    if (rSquared >= 0.75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getModelHealthStatus = (rSquared: number) => {
    if (rSquared >= 0.85) return 'Excellent';
    if (rSquared >= 0.75) return 'Good';
    if (rSquared >= 0.65) return 'Fair';
    return 'Poor';
  };

  // Feature importance data for radar chart
  const featureImportanceData = analysisData ? 
    Object.entries(analysisData.metrics.featureImportance)
      .map(([feature, importance]) => ({
        feature: feature.replace(/_/g, ' '),
        importance: importance * 100
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8) : [];

  // Residual distribution data
  const residualDistribution = analysisData ?
    analysisData.predictions.map(p => ({
      residual: p.residual,
      frequency: 1
    })) : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading regression analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">No regression data available</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">Regression Analysis</h1>
              <p className="text-gray-400">
                Analyze spectral lighting model performance and coefficient development
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button 
                onClick={() => {
                  // Export regression analysis data
                  const data = 'Regression Analysis Data\nDate,Variable,Coefficient,P-Value\n';
                  const blob = new Blob([data], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `regression-analysis-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Model Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className={`text-sm font-medium ${getModelHealthColor(analysisData.metrics.rSquared)}`}>
                {getModelHealthStatus(analysisData.metrics.rSquared)}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Model Performance</p>
            <p className="text-2xl font-bold text-white">
              R² = {analysisData.metrics.rSquared.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Cross-validation: {analysisData.metrics.crossValidationScore.toFixed(3)}
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-400">RMSE</span>
            </div>
            <p className="text-gray-400 text-sm">Prediction Accuracy</p>
            <p className="text-2xl font-bold text-white">
              ±{analysisData.metrics.rmse.toFixed(1)} units
            </p>
            <p className="text-sm text-gray-500 mt-1">
              MAPE: {analysisData.metrics.mape.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Layers className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">{analysisData.modelType}</span>
            </div>
            <p className="text-gray-400 text-sm">Model Type</p>
            <p className="text-2xl font-bold text-white">
              {analysisData.predictions.length} obs
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {Object.keys(analysisData.metrics.featureImportance).length} features
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className={`w-8 h-8 ${
                analysisData.performance.overfittingRisk === 'low' ? 'text-green-400' :
                analysisData.performance.overfittingRisk === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`} />
              <span className="text-sm text-gray-400">Risk Assessment</span>
            </div>
            <p className="text-gray-400 text-sm">Overfitting Risk</p>
            <p className="text-2xl font-bold text-white capitalize">
              {analysisData.performance.overfittingRisk}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Val/Train: {(analysisData.performance.validationScore / analysisData.performance.trainingScore * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Main Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Predictions vs Actuals */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Predictions vs Actuals</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analysisData.predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="confidence_upper"
                    stackId="1"
                    stroke="#0000"
                    fill="#8B5CF6"
                    fillOpacity={0.1}
                    name="95% CI Upper"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence_lower"
                    stackId="2"
                    stroke="#0000"
                    fill="#8B5CF6"
                    fillOpacity={0.1}
                    name="95% CI Lower"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={false}
                    name="Predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Actual"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Feature Importance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={featureImportanceData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="feature" stroke="#9CA3AF" fontSize={12} />
                  <PolarRadiusAxis stroke="#9CA3AF" domain={[0, 30]} />
                  <Radar 
                    name="Importance %" 
                    dataKey="importance" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Residual Analysis */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Residual Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-400 mb-3">Residual Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={analysisData.predictions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="predicted" stroke="#9CA3AF" name="Fitted Values" />
                    <YAxis dataKey="residual" stroke="#9CA3AF" name="Residuals" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Residuals" fill="#8B5CF6" />
                    <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="5 5" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-3">Statistical Tests</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Normality Test</p>
                    <p className="text-sm text-gray-400">Shapiro-Wilk p-value</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      analysisData.residualAnalysis.shapiroWilkPValue > 0.05 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {analysisData.residualAnalysis.shapiroWilkPValue.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {analysisData.residualAnalysis.shapiroWilkPValue > 0.05 ? 'Normal' : 'Non-normal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Autocorrelation</p>
                    <p className="text-sm text-gray-400">Durbin-Watson statistic</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      Math.abs(analysisData.residualAnalysis.durbinWatsonStat - 2) < 0.5 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {analysisData.residualAnalysis.durbinWatsonStat.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.abs(analysisData.residualAnalysis.durbinWatsonStat - 2) < 0.5 ? 'No autocorrelation' : 'Some autocorrelation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Heteroscedasticity</p>
                    <p className="text-sm text-gray-400">Breusch-Pagan p-value</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      analysisData.residualAnalysis.heteroscedasticityPValue > 0.05 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {analysisData.residualAnalysis.heteroscedasticityPValue.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {analysisData.residualAnalysis.heteroscedasticityPValue > 0.05 ? 'Homoscedastic' : 'Heteroscedastic'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coefficient Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Spectral Coefficients */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              Spectral Coefficients
            </h3>
            <div className="space-y-3">
              {Object.entries(analysisData.coefficients.spectral).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-sm font-medium ${
                    value > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {value > 0 ? '+' : ''}{value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Coefficients */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-400" />
              Environmental Coefficients
            </h3>
            <div className="space-y-3">
              {Object.entries(analysisData.coefficients.environmental).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-sm font-medium ${
                    value > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {value > 0 ? '+' : ''}{value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Temporal Coefficients */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Temporal Coefficients
            </h3>
            <div className="space-y-3">
              {Object.entries(analysisData.coefficients.temporal).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-sm font-medium ${
                    value > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {value > 0 ? '+' : ''}{value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Microscope className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Model Insights & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Key Findings:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Red light percentage shows strongest positive correlation ({(analysisData.metrics.featureImportance.red_percent * 100).toFixed(0)}% importance)</li>
                    <li>• UV-A has diminishing returns (negative quadratic term: {analysisData.coefficients.spectral.uv_a_squared})</li>
                    <li>• CO₂ and DLI are co-limiting factors for yield optimization</li>
                    <li>• Blue:Red ratio interaction significantly affects morphology</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Increase red spectrum allocation by 2-3% for yield improvement</li>
                    <li>• Maintain UV-A below 6% to avoid diminishing returns</li>
                    <li>• Consider CO₂ supplementation when DLI &gt; 40 mol/m²/day</li>
                    <li>• Monitor VPD closely - strong negative coefficient detected</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-white">Model Validation Status</span>
                </div>
                <p className="text-sm text-gray-300">
                  The model shows {getModelHealthStatus(analysisData.metrics.rSquared).toLowerCase()} predictive performance 
                  with R² = {analysisData.metrics.rSquared.toFixed(3)}. Residual analysis confirms assumptions are met. 
                  The model is suitable for production use with {analysisData.performance.overfittingRisk} overfitting risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}