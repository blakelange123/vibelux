'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Activity,
  Target,
  Zap,
  Calendar,
  ChevronRight,
  Info,
  Download,
  RefreshCw,
  Gauge,
  Leaf,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts';
import { 
  YieldPrediction,
  AnalyticalInsight,
  AnomalyDetection,
  OptimizationRecommendation,
  InsightSeverity,
  Priority
} from '@/lib/analytics/advanced-analytics-types';
import { YieldPredictionModel } from '@/lib/analytics/yield-prediction-model';

export function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState<'predictions' | 'insights' | 'anomalies' | 'optimization'>('predictions');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStrain, setSelectedStrain] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [predictions, setPredictions] = useState<YieldPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPrediction, setExpandedPrediction] = useState<string | null>(null);

  const model = new YieldPredictionModel();

  // Sample data for demonstration
  const insights: AnalyticalInsight[] = [
    {
      id: 'ins-1',
      type: 'Optimization',
      category: 'Environmental',
      severity: 'High',
      title: 'Suboptimal DLI in Flower Room A',
      description: 'Daily Light Integral is 15% below target for current growth stage. Increasing PPFD to 900 μmol/m²/s could improve yield by 8-12%.',
      impact: {
        financial: 4500,
        operational: 'Requires light schedule adjustment',
        timeline: 'Immediate',
        quality: 'Positive impact on trichome development',
        compliance: 'No impact'
      },
      evidence: [
        { type: 'metric', source: 'Light Sensors', value: 'DLI: 38 mol/m²/day', timestamp: new Date(), reliability: 0.95 },
        { type: 'benchmark', source: 'Industry Standard', value: 'Target: 45 mol/m²/day', timestamp: new Date(), reliability: 0.90 }
      ],
      recommendations: [
        { action: 'Increase photoperiod by 1 hour', priority: 'High', effort: 'Low', expectedOutcome: '8% yield increase', timeline: '2 weeks', dependencies: [] },
        { action: 'Upgrade to high-efficiency LEDs', priority: 'Medium', effort: 'High', expectedOutcome: '12% yield increase', timeline: '4 weeks', dependencies: ['Budget approval'] }
      ],
      confidence: 0.87,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'ins-2',
      type: 'Risk',
      category: 'Quality',
      severity: 'Critical',
      title: 'VPD Fluctuations Risk Mold Development',
      description: 'Nighttime VPD dropping below 0.8 kPa in Flower Room B. 40% increased risk of botrytis in dense canopy areas.',
      impact: {
        financial: -12000,
        operational: 'Potential crop loss',
        timeline: '5-7 days',
        quality: 'Severe quality degradation',
        compliance: 'Failed testing risk'
      },
      evidence: [
        { type: 'sensor', source: 'Environmental Monitor', value: 'VPD: 0.65 kPa (night avg)', timestamp: new Date(), reliability: 0.98 },
        { type: 'historical', source: 'Previous Incidents', value: '3 mold events at similar VPD', timestamp: new Date(), reliability: 0.85 }
      ],
      recommendations: [
        { action: 'Increase night temperature by 2°C', priority: 'Critical', effort: 'Low', expectedOutcome: 'Maintain VPD > 0.8', timeline: 'Immediate', dependencies: [] },
        { action: 'Add dehumidification capacity', priority: 'High', effort: 'Medium', expectedOutcome: 'Stable humidity control', timeline: '1 week', dependencies: ['Equipment availability'] }
      ],
      confidence: 0.92,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  const anomalies: AnomalyDetection[] = [
    {
      id: 'anom-1',
      type: 'Statistical',
      severity: 'High',
      location: 'Veg Room - Section C',
      parameter: 'Growth Rate',
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      value: 0.3,
      expectedRange: { min: 0.8, max: 1.2, unit: 'inches/day' },
      deviation: 3.2,
      pattern: { type: 'Sudden Drop', frequency: 'One-time', duration: 4, recurrence: false },
      possibleCauses: ['Nutrient lockout', 'Root zone issues', 'Light malfunction'],
      suggestedActions: ['Check pH and EC runoff', 'Inspect root health', 'Verify light output']
    },
    {
      id: 'anom-2',
      type: 'Pattern',
      severity: 'Medium',
      location: 'Nutrient System',
      parameter: 'pH Drift',
      detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      value: 0.5,
      expectedRange: { min: 0, max: 0.2, unit: 'pH/day' },
      deviation: 2.5,
      pattern: { type: 'Gradual Increase', frequency: 'Daily', duration: 7, recurrence: true },
      possibleCauses: ['Dosing pump calibration', 'Solution degradation', 'Biofilm buildup'],
      suggestedActions: ['Calibrate pH probe', 'Replace nutrient solution', 'Clean reservoir']
    }
  ];

  const optimizations: OptimizationRecommendation[] = [
    {
      id: 'opt-1',
      area: 'Energy',
      priority: 'High',
      title: 'Implement Dynamic Light Scheduling',
      description: 'Adjust light intensity based on real-time DLI accumulation and electricity rates',
      currentState: {
        metrics: { 'Energy Cost': 0.45, 'DLI Consistency': 0.75, 'Peak Demand': 850 },
        timestamp: new Date(),
        source: 'Energy Monitor'
      },
      targetState: {
        metrics: { 'Energy Cost': 0.38, 'DLI Consistency': 0.92, 'Peak Demand': 720 },
        timestamp: new Date(),
        source: 'Optimization Model'
      },
      expectedImprovement: {
        absolute: { 'Energy Cost': -0.07, 'Peak Demand': -130 },
        percentage: { 'Energy Cost': -15.5, 'DLI Consistency': 22.7 },
        timeToRealize: 30
      },
      implementation: {
        steps: [
          { order: 1, action: 'Install smart controllers', responsible: 'Facilities', duration: 3, dependencies: [] },
          { order: 2, action: 'Configure DLI targets', responsible: 'Cultivation', duration: 1, dependencies: [1] },
          { order: 3, action: 'Test and validate', responsible: 'Operations', duration: 2, dependencies: [2] }
        ],
        duration: 6,
        resources: [{ type: 'Equipment', quantity: 4, cost: 2000 }, { type: 'Labor', quantity: 40, cost: 1600 }],
        risks: [{ description: 'Light stress during transition', probability: 0.2, impact: 0.1, mitigation: 'Gradual implementation' }]
      },
      roi: {
        investment: 3600,
        returns: 18000,
        paybackPeriod: 2.4,
        npv: 45000,
        irr: 0.35
      },
      confidence: 0.83
    }
  ];

  useEffect(() => {
    // Generate sample predictions
    generatePredictions();
  }, [selectedRoom, selectedStrain]);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      // Simulate prediction generation
      const samplePrediction = await model.predictYield({
        roomId: 'room-1',
        strainId: 'strain-1',
        batchId: 'batch-123',
        plantCount: 50,
        canopyArea: 100,
        plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        currentStage: 'Flowering',
        daysInCurrentStage: 21,
        expectedFloweringDays: 63,
        expectedTotalDays: 84,
        expectedStageDuration: 28,
        nutrientEC: 1.8,
        nutrientPH: 5.8,
        irrigationsPerDay: 4,
        pruningMethod: 'Defoliation',
        trainingMethod: 'SCROG',
        growMedium: 'Coco Coir',
        environmentData: {
          temperature: { avg: 75, variance: 2.1 },
          humidity: { avg: 55, variance: 4.3 },
          co2: { avg: 1200, variance: 50 },
          light: { ppfd: 850, dli: 42 },
          vpd: { avg: 1.2, variance: 0.2 }
        }
      });

      setPredictions([samplePrediction]);
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: InsightSeverity | string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-900/20';
      case 'High': return 'text-orange-400 bg-orange-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'Low': return 'text-blue-400 bg-blue-900/20';
      case 'Info': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: Priority | string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Sample data for yield prediction chart
  const predictionData = [
    { week: 'W1', predicted: 1850, actual: 1820, confidence: 90 },
    { week: 'W2', predicted: 1920, actual: 1890, confidence: 88 },
    { week: 'W3', predicted: 1980, actual: 1995, confidence: 85 },
    { week: 'W4', predicted: 2050, actual: 2030, confidence: 87 },
    { week: 'W5', predicted: 2100, actual: null, confidence: 82 },
    { week: 'W6', predicted: 2150, actual: null, confidence: 78 }
  ];

  // Sample data for factor analysis
  const factorData = [
    { factor: 'Light', impact: 85, optimal: 100 },
    { factor: 'Temperature', impact: 92, optimal: 100 },
    { factor: 'Humidity', impact: 78, optimal: 100 },
    { factor: 'CO2', impact: 88, optimal: 100 },
    { factor: 'Nutrients', impact: 95, optimal: 100 },
    { factor: 'Genetics', impact: 90, optimal: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-gray-400">AI-powered insights and predictions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Rooms</option>
            <option value="flower-a">Flower Room A</option>
            <option value="flower-b">Flower Room B</option>
            <option value="veg">Veg Room</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={generatePredictions}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['predictions', 'insights', 'anomalies', 'optimization'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'predictions' && (
        <>
          {/* AI Prediction Summary */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">AI Yield Predictions</h3>
                  <p className="text-gray-400">Machine learning models analyzing your cultivation data</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4 mr-2 inline" />
                Export Report
              </button>
            </div>

            {predictions.map((prediction) => (
              <div key={prediction.id} className="mt-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Expected Yield</span>
                      <Leaf className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {prediction.prediction.expectedYield.toLocaleString()}g
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {prediction.prediction.yieldPerSqFt.toFixed(1)} g/sq ft
                    </p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Confidence</span>
                      <Gauge className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {(prediction.confidence.level * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ±{((prediction.confidence.upper - prediction.confidence.lower) / 2).toFixed(0)}g
                    </p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Quality Grade</span>
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {prediction.prediction.quality.grade}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {prediction.prediction.quality.thcContent?.toFixed(1)}% THC
                    </p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Harvest In</span>
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {prediction.prediction.timeline.daysToHarvest}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">days</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedPrediction(expandedPrediction === prediction.id ? null : prediction.id)}
                  className="mt-4 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {expandedPrediction === prediction.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  View Detailed Analysis
                </button>

                {expandedPrediction === prediction.id && (
                  <div className="mt-4 space-y-4">
                    {/* Contributing Factors */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Contributing Factors</h4>
                      <div className="space-y-2">
                        {prediction.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${factor.direction === 'positive' ? 'bg-green-400' : 'bg-red-400'}`} />
                              <span className="text-gray-300">{factor.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-400">
                                {factor.currentValue} → {factor.optimalValue}
                              </span>
                              <span className={`text-sm font-medium ${factor.direction === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                                {factor.direction === 'positive' ? '+' : ''}{factor.impact}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Risk Factors</h4>
                      <div className="space-y-3">
                        {prediction.risks.map((risk, idx) => (
                          <div key={idx} className="border-l-2 border-yellow-400 pl-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-white">{risk.type}</p>
                              <span className="text-xs text-yellow-400">
                                {(risk.probability * 100).toFixed(0)}% chance
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{risk.description}</p>
                            <p className="text-xs text-gray-500">Mitigation: {risk.mitigation[0]}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">AI Recommendations</h4>
                      <div className="space-y-2">
                        {prediction.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                            <p className="text-sm text-gray-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Prediction Chart */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Yield Prediction Accuracy</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="Predicted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Factor Impact Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={factorData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="factor" stroke="#9CA3AF" />
                    <Radar
                      name="Current"
                      dataKey="impact"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Optimal"
                      dataKey="optimal"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                    {insight.type === 'Risk' ? <AlertTriangle className="w-5 h-5" /> :
                     insight.type === 'Optimization' ? <TrendingUp className="w-5 h-5" /> :
                     <Lightbulb className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                    <p className="text-gray-400 mt-1">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {Math.round((insight.confidence * 100))}% confidence
                  </span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Impact Analysis */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Financial</p>
                  <p className={`font-medium ${insight.impact.financial > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(insight.impact.financial).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Timeline</p>
                  <p className="font-medium text-white">{insight.impact.timeline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quality</p>
                  <p className="font-medium text-white">{insight.impact.quality}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Operational</p>
                  <p className="font-medium text-white">{insight.impact.operational}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                {insight.recommendations.slice(0, 2).map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                      <p className="text-sm text-gray-300">{rec.action}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Effort: {rec.effort}</span>
                      <span>•</span>
                      <span>{rec.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {anomaly.parameter} Anomaly Detected
                    </h3>
                    <p className="text-gray-400">{anomaly.location}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round((Date.now() - anomaly.detectedAt.getTime()) / (1000 * 60 * 60))}h ago
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Detected Value</p>
                  <p className="text-xl font-bold text-red-400">
                    {anomaly.value} {anomaly.expectedRange.unit}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Expected Range</p>
                  <p className="text-xl font-bold text-green-400">
                    {anomaly.expectedRange.min}-{anomaly.expectedRange.max}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Deviation</p>
                  <p className="text-xl font-bold text-yellow-400">{anomaly.deviation}σ</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Possible Causes</p>
                  <div className="flex flex-wrap gap-2">
                    {anomaly.possibleCauses.map((cause, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300">
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Suggested Actions</p>
                  <div className="space-y-1">
                    {anomaly.suggestedActions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'optimization' && (
        <div className="space-y-4">
          {optimizations.map((opt) => (
            <div key={opt.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-purple-900/20 text-purple-400`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{opt.title}</h3>
                    <p className="text-gray-400">{opt.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor(opt.priority)}`}>
                  {opt.priority} Priority
                </span>
              </div>

              {/* ROI Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">ROI</p>
                  <p className="text-xl font-bold text-green-400">
                    {(opt.roi.returns / opt.roi.investment * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Payback</p>
                  <p className="text-xl font-bold text-white">{opt.roi.paybackPeriod} mo</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Investment</p>
                  <p className="text-xl font-bold text-white">${opt.roi.investment.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Confidence</p>
                  <p className="text-xl font-bold text-blue-400">{(opt.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Expected Improvements */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-400 mb-2">Expected Improvements</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(opt.expectedImprovement.percentage).map(([metric, value]) => (
                    <div key={metric} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{metric}</span>
                      <span className={`text-sm font-medium ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {value > 0 ? '+' : ''}{value.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementation Steps */}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Implementation Plan</p>
                <div className="space-y-2">
                  {opt.implementation.steps.map((step) => (
                    <div key={step.order} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-900/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-medium">
                        {step.order}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{step.action}</p>
                        <p className="text-xs text-gray-500">{step.responsible} • {step.duration} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                View Detailed Analysis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}