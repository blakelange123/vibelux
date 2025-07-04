'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Shield,
  Bug,
  Thermometer,
  Droplets,
  Zap,
  Wind,
  Calendar,
  ChevronRight,
  Bell,
  Settings,
  Activity,
  AlertOctagon,
  Info,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PredictiveAlert {
  id: string;
  type: 'pest' | 'disease' | 'equipment' | 'environmental' | 'yield';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  probability: number; // 0-100%
  timeframe: string; // e.g., "Next 48 hours"
  impactEstimate: {
    yield?: number; // % impact
    cost?: number; // $ impact
    quality?: string; // quality impact description
  };
  preventiveActions: string[];
  dataPoints: {
    parameter: string;
    current: number;
    threshold: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  confidence: number; // 0-100%
}

interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  status: 'normal' | 'warning' | 'critical';
}

export function PredictiveAlerts() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([
    {
      id: 'alert-1',
      type: 'pest',
      severity: 'high',
      title: 'Spider Mite Risk Increasing',
      description: 'Environmental conditions becoming favorable for spider mite outbreak',
      probability: 78,
      timeframe: 'Next 72 hours',
      impactEstimate: {
        yield: -12,
        cost: 4500,
        quality: 'Potential webbing on flowers'
      },
      preventiveActions: [
        'Increase humidity to 55-60%',
        'Apply preventive neem oil treatment',
        'Inspect undersides of leaves in sections A3-A5',
        'Prepare beneficial predator mites for release'
      ],
      dataPoints: [
        { parameter: 'Humidity', current: 42, threshold: 50, trend: 'decreasing' },
        { parameter: 'Temperature', current: 78, threshold: 75, trend: 'increasing' },
        { parameter: 'Air Circulation', current: 65, threshold: 80, trend: 'decreasing' }
      ],
      confidence: 82
    },
    {
      id: 'alert-2',
      type: 'equipment',
      severity: 'medium',
      title: 'Dehumidifier Performance Degrading',
      description: 'Unit 3 showing 15% efficiency loss, likely filter issue',
      probability: 85,
      timeframe: 'Next 5 days',
      impactEstimate: {
        cost: 200,
        quality: 'Risk of PM/mold if humidity rises'
      },
      preventiveActions: [
        'Schedule filter cleaning/replacement',
        'Check condensate drain for blockage',
        'Verify refrigerant levels',
        'Consider backup unit activation'
      ],
      dataPoints: [
        { parameter: 'Power Draw', current: 4.2, threshold: 3.8, trend: 'increasing' },
        { parameter: 'Moisture Removal', current: 12, threshold: 15, trend: 'decreasing' },
        { parameter: 'Runtime Hours', current: 2800, threshold: 3000, trend: 'increasing' }
      ],
      confidence: 91
    },
    {
      id: 'alert-3',
      type: 'yield',
      severity: 'medium',
      title: 'Below-Target DLI in Flower Room B',
      description: 'Sections B3-B6 receiving 15% less light than optimal',
      probability: 95,
      timeframe: 'Current',
      impactEstimate: {
        yield: -8,
        cost: 3200,
        quality: 'Lower terpene production expected'
      },
      preventiveActions: [
        'Adjust fixture height by -6 inches',
        'Increase photoperiod by 30 minutes',
        'Clean fixture lenses (10% output loss)',
        'Consider supplemental side lighting'
      ],
      dataPoints: [
        { parameter: 'DLI Actual', current: 38.2, threshold: 45, trend: 'stable' },
        { parameter: 'Canopy PPFD', current: 650, threshold: 750, trend: 'decreasing' },
        { parameter: 'Light Degradation', current: 10, threshold: 5, trend: 'increasing' }
      ],
      confidence: 94
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState<PredictiveAlert | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    pest: true,
    disease: true,
    equipment: true,
    environmental: true,
    yield: true
  });

  // Calculate overall facility risk score
  const calculateRiskScore = () => {
    const riskFactors: RiskFactor[] = [
      { name: 'Environmental Stability', value: 72, weight: 0.25, status: 'warning' },
      { name: 'Equipment Health', value: 85, weight: 0.20, status: 'normal' },
      { name: 'Pest/Disease Pressure', value: 45, weight: 0.30, status: 'critical' },
      { name: 'Yield Trajectory', value: 88, weight: 0.25, status: 'normal' }
    ];

    const weightedScore = riskFactors.reduce((sum, factor) => 
      sum + (factor.value * factor.weight), 0
    );

    return { score: weightedScore, factors: riskFactors };
  };

  const riskAnalysis = calculateRiskScore();

  // Simulated prediction confidence over time
  const confidenceTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    accuracy: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10
  }));

  const getSeverityColor = (severity: PredictiveAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-600/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-600/30';
    }
  };

  const getTypeIcon = (type: PredictiveAlert['type']) => {
    switch (type) {
      case 'pest': return <Bug className="w-5 h-5" />;
      case 'disease': return <Shield className="w-5 h-5" />;
      case 'equipment': return <Settings className="w-5 h-5" />;
      case 'environmental': return <Thermometer className="w-5 h-5" />;
      case 'yield': return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Predictive Alert System</h2>
          <p className="text-gray-400">AI-powered issue prevention</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
          <Bell className="w-4 h-4" />
          Configure Alerts
        </button>
      </div>

      {/* Risk Score Overview */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Facility Risk Score</h3>
            <p className="text-sm text-gray-400">Overall health and risk assessment</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${
              riskAnalysis.score > 80 ? 'text-green-400' :
              riskAnalysis.score > 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {riskAnalysis.score.toFixed(0)}
            </p>
            <p className="text-sm text-gray-500">out of 100</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {riskAnalysis.factors.map((factor, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{factor.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  factor.status === 'normal' ? 'bg-green-900/20 text-green-400' :
                  factor.status === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {factor.status}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{factor.value}</p>
                <p className="text-xs text-gray-500">weight: {(factor.weight * 100).toFixed(0)}%</p>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    factor.status === 'normal' ? 'bg-green-500' :
                    factor.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${factor.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white">Active Predictions</h3>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                getSeverityColor(alert.severity)
              } ${selectedAlert?.id === alert.id ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-900/50 rounded-lg">
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{alert.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{alert.probability}%</p>
                      <p className="text-xs text-gray-400">probability</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {alert.timeframe}
                    </span>
                    {alert.impactEstimate.yield && (
                      <span className="flex items-center gap-1 text-red-400">
                        <TrendingUp className="w-4 h-4" />
                        {alert.impactEstimate.yield}% yield
                      </span>
                    )}
                    {alert.impactEstimate.cost && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        ${alert.impactEstimate.cost}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-gray-500">
                      {alert.confidence}% confidence
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Alert Details */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Alert Details</h3>
          {selectedAlert ? (
            <div className="space-y-4">
              {/* Contributing Factors */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Contributing Factors</h4>
                <div className="space-y-2">
                  {selectedAlert.dataPoints.map((point, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{point.parameter}</span>
                        <span className={`text-xs ${
                          point.trend === 'increasing' ? 'text-red-400' :
                          point.trend === 'decreasing' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {point.trend}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{point.current}</span>
                        <span className="text-xs text-gray-500">target: {point.threshold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventive Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Recommended Actions</h4>
                <div className="space-y-2">
                  {selectedAlert.preventiveActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <p className="text-sm text-gray-300">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                Create Prevention Tasks
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select an alert to view details
            </p>
          )}
        </div>
      </div>

      {/* Prediction Accuracy */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Prediction Accuracy</h3>
          <span className="text-sm text-gray-400">7-day average: 89.2%</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={confidenceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis domain={[80, 100]} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prevention Success Stories */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">Prevention Wins This Month</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">14</p>
            <p className="text-sm text-gray-400">Issues Prevented</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">$18.5K</p>
            <p className="text-sm text-gray-400">Saved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">96%</p>
            <p className="text-sm text-gray-400">Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}