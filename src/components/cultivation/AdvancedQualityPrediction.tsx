'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Gauge,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Clock,
  Zap,
  Droplets,
  Thermometer,
  Sun,
  Wind,
  Cloud,
  Package,
  Cannabis,
  Beaker,
  Shield,
  Award,
  Star,
  Info,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Upload,
  ChevronRight,
  GitBranch,
  Sparkles,
  Gem,
  Microscope,
  TestTube,
  FlaskConical,
  Pill,
  Filter,
  TrendingDown,
  AlertCircle,
  Database,
  History
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface QualityMetric {
  id: string;
  name: string;
  category: 'cannabinoid' | 'terpene' | 'appearance' | 'structure' | 'safety';
  value: number;
  unit: string;
  targetRange: { min: number; max: number; optimal: number };
  importance: number; // 0-10
  predictedValue: number;
  confidence: number; // 0-100%
}

interface EnvironmentalFactor {
  factor: string;
  currentValue: number;
  optimalValue: number;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1
  qualityEffect: number; // -100 to +100
}

interface QualityPrediction {
  id: string;
  strain: string;
  harvestDate: Date;
  overallQuality: number; // 0-100
  confidence: number; // 0-100%
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  metrics: QualityMetric[];
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  economicImpact: {
    estimatedValue: number;
    marketGrade: string;
    pricePerUnit: number;
    yieldImpact: number;
  };
}

interface RiskFactor {
  id: string;
  type: 'environmental' | 'pest' | 'disease' | 'nutrient' | 'operational';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100%
  impact: number; // 0-100
  mitigationCost: number;
  mitigationSteps: string[];
}

interface Recommendation {
  id: string;
  category: 'immediate' | 'short-term' | 'long-term';
  action: string;
  expectedImprovement: number; // percentage
  cost: number;
  effort: 'low' | 'medium' | 'high';
  roi: number;
}

interface HistoricalHarvest {
  id: string;
  date: Date;
  strain: string;
  actualQuality: number;
  predictedQuality: number;
  environmentalConditions: {
    avgTemp: number;
    avgHumidity: number;
    avgVPD: number;
    avgPPFD: number;
    avgCO2: number;
  };
  labResults: {
    thc: number;
    cbd: number;
    totalTerpenes: number;
    moisture: number;
  };
}

interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'ensemble';
  accuracy: number;
  lastTrained: Date;
  features: string[];
  performance: {
    rmse: number;
    r2: number;
    mae: number;
  };
}

export default function AdvancedQualityPrediction() {
  const [selectedRoom, setSelectedRoom] = useState('flower-1');
  const [timeRange, setTimeRange] = useState('current-cycle');
  const [predictionMode, setPredictionMode] = useState<'real-time' | 'what-if' | 'historical'>('real-time');
  const [selectedStrain, setSelectedStrain] = useState('blue-dream');
  
  // Mock data
  const currentPrediction: QualityPrediction = {
    id: '1',
    strain: 'Blue Dream',
    harvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    overallQuality: 88,
    confidence: 92,
    grade: 'A',
    metrics: [
      {
        id: '1',
        name: 'THC Content',
        category: 'cannabinoid',
        value: 22.5,
        unit: '%',
        targetRange: { min: 20, max: 25, optimal: 23 },
        importance: 9,
        predictedValue: 23.2,
        confidence: 94
      },
      {
        id: '2',
        name: 'Total Terpenes',
        category: 'terpene',
        value: 2.8,
        unit: '%',
        targetRange: { min: 2, max: 4, optimal: 3.2 },
        importance: 8,
        predictedValue: 3.1,
        confidence: 88
      },
      {
        id: '3',
        name: 'Bud Density',
        category: 'structure',
        value: 85,
        unit: 'score',
        targetRange: { min: 70, max: 100, optimal: 90 },
        importance: 7,
        predictedValue: 87,
        confidence: 90
      },
      {
        id: '4',
        name: 'Trichome Coverage',
        category: 'appearance',
        value: 90,
        unit: '%',
        targetRange: { min: 80, max: 100, optimal: 95 },
        importance: 8,
        predictedValue: 92,
        confidence: 91
      }
    ],
    riskFactors: [
      {
        id: '1',
        type: 'environmental',
        description: 'VPD trending 15% above optimal range',
        severity: 'medium',
        probability: 75,
        impact: 20,
        mitigationCost: 50,
        mitigationSteps: [
          'Increase humidity by 5%',
          'Reduce temperature by 2°F',
          'Monitor transpiration rates'
        ]
      },
      {
        id: '2',
        type: 'nutrient',
        description: 'Slight nitrogen excess detected in week 4',
        severity: 'low',
        probability: 60,
        impact: 10,
        mitigationCost: 25,
        mitigationSteps: [
          'Reduce nitrogen in feed by 10%',
          'Increase P-K ratio',
          'Monitor leaf color'
        ]
      }
    ],
    recommendations: [
      {
        id: '1',
        category: 'immediate',
        action: 'Adjust VPD to optimal range (1.2-1.4 kPa)',
        expectedImprovement: 5,
        cost: 50,
        effort: 'low',
        roi: 4.2
      },
      {
        id: '2',
        category: 'short-term',
        action: 'Implement UV-B supplementation in final 2 weeks',
        expectedImprovement: 8,
        cost: 200,
        effort: 'medium',
        roi: 3.5
      }
    ],
    economicImpact: {
      estimatedValue: 4800,
      marketGrade: 'Premium',
      pricePerUnit: 2400,
      yieldImpact: 0
    }
  };

  const environmentalFactors: EnvironmentalFactor[] = [
    { factor: 'Temperature', currentValue: 76, optimalValue: 75, impact: 'neutral', weight: 0.15, qualityEffect: -2 },
    { factor: 'Humidity', currentValue: 48, optimalValue: 55, impact: 'negative', weight: 0.15, qualityEffect: -8 },
    { factor: 'VPD', currentValue: 1.45, optimalValue: 1.3, impact: 'negative', weight: 0.2, qualityEffect: -10 },
    { factor: 'PPFD', currentValue: 850, optimalValue: 900, impact: 'negative', weight: 0.25, qualityEffect: -5 },
    { factor: 'CO2', currentValue: 1200, optimalValue: 1200, impact: 'positive', weight: 0.15, qualityEffect: 0 },
    { factor: 'Air Circulation', currentValue: 95, optimalValue: 100, impact: 'neutral', weight: 0.1, qualityEffect: -1 }
  ];

  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    predictedQuality: 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 + (i / 30) * 10,
    actualQuality: i < 20 ? 74 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 14 + (i / 20) * 8 : null,
    confidence: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
    thc: 18 + (i / 30) * 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
    terpenes: 2 + (i / 30) * 1.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5
  }));

  const qualityDistribution = [
    { grade: 'A+', count: 12, percentage: 15 },
    { grade: 'A', count: 35, percentage: 44 },
    { grade: 'B+', count: 25, percentage: 31 },
    { grade: 'B', count: 6, percentage: 8 },
    { grade: 'C', count: 2, percentage: 2 }
  ];

  const cannabinoidProfile = [
    { compound: 'THC', current: 22.5, predicted: 23.2, optimal: 23 },
    { compound: 'CBD', current: 0.3, predicted: 0.4, optimal: 0.5 },
    { compound: 'CBG', current: 1.2, predicted: 1.3, optimal: 1.5 },
    { compound: 'CBC', current: 0.8, predicted: 0.9, optimal: 1.0 },
    { compound: 'CBN', current: 0.2, predicted: 0.2, optimal: 0.3 }
  ];

  const terpeneProfile = [
    { terpene: 'Myrcene', current: 0.8, predicted: 0.9, impact: 'sedating' },
    { terpene: 'Limonene', current: 0.6, predicted: 0.7, impact: 'uplifting' },
    { terpene: 'Caryophyllene', current: 0.5, predicted: 0.6, impact: 'anti-inflammatory' },
    { terpene: 'Pinene', current: 0.4, predicted: 0.4, impact: 'alertness' },
    { terpene: 'Linalool', current: 0.3, predicted: 0.3, impact: 'calming' },
    { terpene: 'Humulene', current: 0.2, predicted: 0.2, impact: 'appetite suppressant' }
  ];

  const modelPerformance = {
    accuracy: 92.5,
    precision: 91.8,
    recall: 93.2,
    f1Score: 92.5,
    trainingData: 1250,
    validationData: 250,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  };

  const calculateQualityScore = (metrics: QualityMetric[]) => {
    const weightedSum = metrics.reduce((sum, metric) => {
      const normalizedValue = (metric.predictedValue - metric.targetRange.min) / 
                             (metric.targetRange.max - metric.targetRange.min);
      return sum + (normalizedValue * metric.importance);
    }, 0);
    const totalWeight = metrics.reduce((sum, metric) => sum + metric.importance, 0);
    return (weightedSum / totalWeight) * 100;
  };

  const getPredictionColor = (confidence: number) => {
    if (confidence >= 90) return '#10B981';
    if (confidence >= 75) return '#F59E0B';
    return '#EF4444';
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': '#10B981',
      'A': '#34D399',
      'B+': '#F59E0B',
      'B': '#FBBF24',
      'C': '#EF4444'
    };
    return colors[grade] || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              Advanced Quality Prediction
            </h2>
            <p className="text-gray-600 mt-1">
              AI-powered harvest quality forecasting and optimization
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Update Predictions
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select 
              value={selectedRoom} 
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="flower-1">Flower Room 1</option>
              <option value="flower-2">Flower Room 2</option>
              <option value="veg-1">Veg Room 1</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Strain</label>
            <select 
              value={selectedStrain} 
              onChange={(e) => setSelectedStrain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="blue-dream">Blue Dream</option>
              <option value="og-kush">OG Kush</option>
              <option value="gelato">Gelato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select 
              value={predictionMode} 
              onChange={(e) => setPredictionMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="real-time">Real-Time Prediction</option>
              <option value="what-if">What-If Analysis</option>
              <option value="historical">Historical Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="current-cycle">Current Cycle</option>
              <option value="next-harvest">Next Harvest</option>
              <option value="30-days">Next 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quality Score Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-purple-600" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentPrediction.grade === 'A+' || currentPrediction.grade === 'A' ? 'bg-green-100 text-green-700' :
              currentPrediction.grade === 'B+' || currentPrediction.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Grade {currentPrediction.grade}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{currentPrediction.overallQuality}%</h3>
          <p className="text-sm text-gray-600 mt-1">Predicted Quality Score</p>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" style={{ color: getPredictionColor(currentPrediction.confidence) }} />
              <span className="font-medium">{currentPrediction.confidence}%</span>
              <span className="text-gray-500">confidence</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            ${currentPrediction.economicImpact.estimatedValue.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Estimated Harvest Value</p>
          <div className="mt-4 text-sm">
            <span className="font-medium">${currentPrediction.economicImpact.pricePerUnit}/lb</span>
            <span className="text-gray-500 ml-2">{currentPrediction.economicImpact.marketGrade}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">{currentPrediction.riskFactors.length}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Risk Factors</h3>
          <p className="text-sm text-gray-600 mt-1">Identified quality risks</p>
          <div className="mt-4 space-y-1">
            {currentPrediction.riskFactors.slice(0, 2).map(risk => (
              <div key={risk.id} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  risk.severity === 'critical' ? 'bg-red-500' :
                  risk.severity === 'high' ? 'bg-orange-500' :
                  risk.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <span className="text-gray-700 truncate">{risk.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {currentPrediction.recommendations.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Optimizations</h3>
          <p className="text-sm text-gray-600 mt-1">Available improvements</p>
          <div className="mt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Potential gain:</span>
              <span className="font-medium text-green-600">+12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Quality Metrics */}
        <div className="col-span-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-600" />
            Quality Metrics Breakdown
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Cannabinoid Profile */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Cannabinoid Profile</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cannabinoidProfile}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="compound" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current" fill="#9333EA" name="Current" />
                  <Bar dataKey="predicted" fill="#7C3AED" name="Predicted" />
                  <Bar dataKey="optimal" fill="#E9D5FF" name="Optimal" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Terpene Profile */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Terpene Profile</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={terpeneProfile}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="terpene" />
                  <PolarRadiusAxis angle={90} domain={[0, 1]} />
                  <Radar name="Current" dataKey="current" stroke="#9333EA" fill="#9333EA" fillOpacity={0.3} />
                  <Radar name="Predicted" dataKey="predicted" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quality Trend */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Score Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="predictedQuality" 
                  stroke="#9333EA" 
                  fill="#9333EA" 
                  fillOpacity={0.3}
                  name="Predicted Quality"
                />
                <Area 
                  type="monotone" 
                  dataKey="actualQuality" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Actual Quality"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Individual Metrics */}
          <div className="mt-6 space-y-3">
            {currentPrediction.metrics.map(metric => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    <span className="text-sm text-gray-500">({metric.category})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Current: {metric.value}{metric.unit}
                    </span>
                    <span className="text-sm font-medium text-purple-600">
                      Predicted: {metric.predictedValue}{metric.unit}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full relative"
                        style={{ width: `${(metric.predictedValue / metric.targetRange.max) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-purple-600 rounded-full" />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[60px] text-right">
                      {metric.confidence}% conf.
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {metric.targetRange.min}</span>
                    <span className="font-medium">Optimal: {metric.targetRange.optimal}</span>
                    <span>Max: {metric.targetRange.max}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Impact & Recommendations */}
        <div className="col-span-4 space-y-6">
          {/* Environmental Factors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              Environmental Impact
            </h3>
            
            <div className="space-y-3">
              {environmentalFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      {factor.impact === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : factor.impact === 'negative' ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        factor.impact === 'positive' ? 'text-green-600' :
                        factor.impact === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {factor.qualityEffect > 0 ? '+' : ''}{factor.qualityEffect}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          factor.impact === 'positive' ? 'bg-green-500' :
                          factor.impact === 'negative' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${(factor.currentValue / (factor.optimalValue * 1.5)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 min-w-[80px] text-right">
                      {factor.currentValue} / {factor.optimalValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Environmental Score</span>
                <span className="text-lg font-bold text-purple-600">82%</span>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Risk Analysis
            </h3>
            
            <div className="space-y-3">
              {currentPrediction.riskFactors.map(risk => (
                <div key={risk.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        risk.severity === 'critical' ? 'bg-red-500' :
                        risk.severity === 'high' ? 'bg-orange-500' :
                        risk.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{risk.description}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {risk.probability}% probability • {risk.impact}% impact
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700">Mitigation steps:</p>
                    {risk.mitigationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-gray-400">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Optimization Recommendations
            </h3>
            
            <div className="space-y-3">
              {currentPrediction.recommendations.map(rec => (
                <div key={rec.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          rec.category === 'immediate' ? 'bg-red-100 text-red-700' :
                          rec.category === 'short-term' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          rec.effort === 'low' ? 'bg-green-100 text-green-700' :
                          rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {rec.effort} effort
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mt-2">{rec.action}</h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Impact</p>
                      <p className="font-medium text-green-600">+{rec.expectedImprovement}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Cost</p>
                      <p className="font-medium">${rec.cost}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">ROI</p>
                      <p className="font-medium text-purple-600">{rec.roi}x</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Model Performance
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-sm font-medium">{modelPerformance.accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Training samples</span>
                <span className="text-sm font-medium">{modelPerformance.trainingData}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last updated</span>
                <span className="text-sm font-medium">2 days ago</span>
              </div>
              
              <button className="w-full mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium">
                Retrain Model
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          Historical Accuracy
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Prediction vs Actual Quality</h4>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="predicted" name="Predicted" unit="%" />
                <YAxis dataKey="actual" name="Actual" unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Harvests" 
                  data={Array.from({ length: 50 }, () => {
                    const predicted = 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25;
                    return {
                      predicted,
                      actual: predicted + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10
                    };
                  })} 
                  fill="#9333EA" 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Grade Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={qualityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" name="Percentage">
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}