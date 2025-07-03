'use client';

import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  LineChart,
  Zap,
  Droplets,
  Sun,
  Wind,
  ThermometerSun,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';

interface PredictionData {
  category: string;
  prediction: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  timeframe: string;
  recommendations: string[];
}

interface AnalyticsMetric {
  label: string;
  value: number;
  unit: string;
  trend: number;
  status: 'optimal' | 'warning' | 'critical';
  icon: React.ElementType;
}

export function AIEnhancedPlantAnalytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeAnalysis, setActiveAnalysis] = useState('overview');

  const predictions: PredictionData[] = [
    {
      category: 'Yield Optimization',
      prediction: 'Expected 15% yield increase with current environmental adjustments',
      confidence: 92,
      impact: 'positive',
      timeframe: 'Next 2 weeks',
      recommendations: [
        'Increase PPFD by 50 μmol/m²/s in flowering zones',
        'Adjust night temperature to 18°C for optimal respiration',
        'Implement CO2 enrichment during peak photosynthesis hours'
      ]
    },
    {
      category: 'Disease Risk',
      prediction: 'Low powdery mildew risk detected in Zone B',
      confidence: 87,
      impact: 'negative',
      timeframe: 'Next 5 days',
      recommendations: [
        'Reduce humidity to below 50% during dark periods',
        'Increase air circulation in affected zones',
        'Monitor leaf surface moisture closely'
      ]
    },
    {
      category: 'Resource Efficiency',
      prediction: 'Water usage can be reduced by 20% without affecting growth',
      confidence: 89,
      impact: 'positive',
      timeframe: 'Immediate',
      recommendations: [
        'Implement deficit irrigation during vegetative stage',
        'Optimize irrigation scheduling based on VPD',
        'Use moisture sensors for precise water delivery'
      ]
    },
    {
      category: 'Harvest Timing',
      prediction: 'Optimal harvest window in 12-14 days',
      confidence: 94,
      impact: 'neutral',
      timeframe: '2 weeks',
      recommendations: [
        'Monitor trichome development daily',
        'Prepare drying facilities for incoming harvest',
        'Schedule labor for peak harvest period'
      ]
    }
  ];

  const analyticsMetrics: AnalyticsMetric[] = [
    {
      label: 'Growth Rate',
      value: 2.3,
      unit: 'cm/day',
      trend: 12,
      status: 'optimal',
      icon: TrendingUp
    },
    {
      label: 'Water Efficiency',
      value: 0.85,
      unit: 'L/g',
      trend: -8,
      status: 'optimal',
      icon: Droplets
    },
    {
      label: 'Light Utilization',
      value: 94,
      unit: '%',
      trend: 5,
      status: 'optimal',
      icon: Sun
    },
    {
      label: 'Nutrient Uptake',
      value: 78,
      unit: '%',
      trend: -3,
      status: 'warning',
      icon: Activity
    },
    {
      label: 'VPD Score',
      value: 1.2,
      unit: 'kPa',
      trend: 0,
      status: 'optimal',
      icon: Wind
    },
    {
      label: 'Energy Efficiency',
      value: 88,
      unit: '%',
      trend: 7,
      status: 'optimal',
      icon: Zap
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          {['overview', 'predictions', 'metrics', 'recommendations'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveAnalysis(view)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeAnalysis === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
        
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="bg-gray-800 text-gray-300 rounded-lg px-4 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* AI Analysis Overview */}
      {activeAnalysis === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights Summary */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Analysis Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Overall Plant Health</p>
                  <p className="text-2xl font-bold text-white">92%</p>
                </div>
                <div className="text-green-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Active Predictions</p>
                  <p className="text-lg font-semibold text-white">12</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Avg Confidence</p>
                  <p className="text-lg font-semibold text-white">90.5%</p>
                </div>
              </div>
              
              <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-600/30">
                <p className="text-sm text-purple-300">
                  AI models have analyzed 1.2M data points in the last 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              {analyticsMetrics.slice(0, 4).map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-xl font-bold text-white">{metric.value}</p>
                      <p className="text-sm text-gray-400">{metric.unit}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {metric.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : metric.trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                      {Math.abs(metric.trend)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Predictions View */}
      {activeAnalysis === 'predictions' && (
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{prediction.category}</h3>
                  <p className={`text-sm ${getImpactColor(prediction.impact)}`}>
                    {prediction.impact === 'positive' ? '↑' : prediction.impact === 'negative' ? '↓' : '→'} {prediction.timeframe}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Confidence</p>
                  <p className="text-2xl font-bold text-white">{prediction.confidence}%</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{prediction.prediction}</p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Recommendations:</p>
                {prediction.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics View */}
      {activeAnalysis === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{metric.label}</h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="text-lg text-gray-400">{metric.unit}</p>
                </div>
                
                <div className={`flex items-center gap-2 ${
                  metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.trend > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : metric.trend < 0 ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {metric.trend > 0 ? '+' : ''}{metric.trend}% from last period
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        metric.status === 'optimal' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (metric.value / 100) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations View */}
      {activeAnalysis === 'recommendations' && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI-Generated Action Plan</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Immediate Actions</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Adjust Zone B humidity to 45-50%</li>
                    <li>• Increase CO2 levels to 1200 ppm during light hours</li>
                    <li>• Calibrate pH sensors in nutrient reservoir</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">This Week</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Schedule preventive maintenance for HVAC system</li>
                    <li>• Review and optimize light spectrum for flowering stage</li>
                    <li>• Implement automated fertigation adjustments</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Long-term Optimizations</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Consider upgrading to quantum sensors for better light measurement</li>
                    <li>• Implement machine learning for predictive climate control</li>
                    <li>• Evaluate ROI of automated pruning systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}