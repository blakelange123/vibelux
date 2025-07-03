'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Package,
  Activity,
  Clock,
  DollarSign,
  Wrench,
  Shield,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, PieChart, Pie, Cell } from 'recharts';

interface EquipmentHealth {
  id: string;
  name: string;
  type: string;
  healthScore: number;
  failureProbability: number;
  daysToFailure: number | null;
  lastMaintenance: Date;
  operatingHours: number;
  efficiency: number;
  vibration: number;
  temperature: number;
  current: number;
  trends: {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    severity: 'normal' | 'warning' | 'critical';
    rate: number;
  }[];
  predictedFailures: {
    component: string;
    probability: number;
    timeframe: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
  }[];
  recommendations: {
    action: string;
    urgency: 'immediate' | 'soon' | 'scheduled' | 'monitor';
    cost: number;
    savings: number;
    description: string;
  }[];
}

interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'failure' | 'degradation' | 'efficiency' | 'threshold';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  predictedDate: Date;
  confidence: number;
}

interface PartsInventory {
  partNumber: string;
  name: string;
  quantity: number;
  reorderPoint: number;
  leadTime: number;
  supplier: string;
  cost: number;
  equipmentTypes: string[];
  predictedNeed: {
    quantity: number;
    date: Date;
    confidence: number;
  };
}

export function PredictiveMaintenance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'alerts' | 'inventory'>('overview');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentHealth | null>(null);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock equipment health data
  const equipmentHealth: EquipmentHealth[] = [
    {
      id: 'led-array-1',
      name: 'LED Array Zone A',
      type: 'Lighting',
      healthScore: 68,
      failureProbability: 35,
      daysToFailure: 42,
      lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      operatingHours: 12500,
      efficiency: 89,
      vibration: 0.8,
      temperature: 85,
      current: 42.5,
      trends: [
        { metric: 'Temperature', direction: 'up', severity: 'warning', rate: 0.5 },
        { metric: 'Efficiency', direction: 'down', severity: 'warning', rate: -0.3 },
        { metric: 'Current Draw', direction: 'up', severity: 'normal', rate: 0.1 }
      ],
      predictedFailures: [
        {
          component: 'LED Driver #3',
          probability: 78,
          timeframe: '4-6 weeks',
          impact: 'high',
          estimatedCost: 850
        },
        {
          component: 'Cooling Fan',
          probability: 45,
          timeframe: '8-10 weeks',
          impact: 'medium',
          estimatedCost: 220
        }
      ],
      recommendations: [
        {
          action: 'Replace LED Driver #3',
          urgency: 'soon',
          cost: 850,
          savings: 3200,
          description: 'Prevent cascade failure and production loss'
        },
        {
          action: 'Clean heat sinks',
          urgency: 'immediate',
          cost: 50,
          savings: 500,
          description: 'Reduce operating temperature by 8-10°C'
        }
      ]
    },
    {
      id: 'hvac-1',
      name: 'HVAC Unit 1',
      type: 'Climate Control',
      healthScore: 82,
      failureProbability: 18,
      daysToFailure: null,
      lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      operatingHours: 8900,
      efficiency: 92,
      vibration: 1.2,
      temperature: 78,
      current: 28.3,
      trends: [
        { metric: 'Vibration', direction: 'up', severity: 'normal', rate: 0.1 },
        { metric: 'Efficiency', direction: 'stable', severity: 'normal', rate: 0 }
      ],
      predictedFailures: [
        {
          component: 'Compressor Belt',
          probability: 32,
          timeframe: '12-16 weeks',
          impact: 'medium',
          estimatedCost: 180
        }
      ],
      recommendations: [
        {
          action: 'Schedule belt inspection',
          urgency: 'scheduled',
          cost: 100,
          savings: 800,
          description: 'Preventive replacement during next maintenance'
        }
      ]
    },
    {
      id: 'pump-1',
      name: 'Irrigation Pump 1',
      type: 'Water System',
      healthScore: 45,
      failureProbability: 72,
      daysToFailure: 18,
      lastMaintenance: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      operatingHours: 22000,
      efficiency: 71,
      vibration: 2.8,
      temperature: 95,
      current: 8.2,
      trends: [
        { metric: 'Vibration', direction: 'up', severity: 'critical', rate: 1.2 },
        { metric: 'Efficiency', direction: 'down', severity: 'critical', rate: -0.8 },
        { metric: 'Temperature', direction: 'up', severity: 'critical', rate: 0.9 }
      ],
      predictedFailures: [
        {
          component: 'Bearing Assembly',
          probability: 92,
          timeframe: '2-3 weeks',
          impact: 'critical',
          estimatedCost: 1200
        },
        {
          component: 'Shaft Seal',
          probability: 85,
          timeframe: '2-3 weeks',
          impact: 'high',
          estimatedCost: 450
        }
      ],
      recommendations: [
        {
          action: 'Emergency bearing replacement',
          urgency: 'immediate',
          cost: 1650,
          savings: 8500,
          description: 'Prevent catastrophic failure and water damage'
        }
      ]
    }
  ];

  // Mock alerts
  useEffect(() => {
    const mockAlerts: MaintenanceAlert[] = [
      {
        id: 'alert-1',
        equipmentId: 'pump-1',
        equipmentName: 'Irrigation Pump 1',
        type: 'failure',
        severity: 'critical',
        message: 'Bearing failure predicted within 18 days - 92% confidence',
        timestamp: new Date(),
        acknowledged: false,
        predictedDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        confidence: 0.92
      },
      {
        id: 'alert-2',
        equipmentId: 'led-array-1',
        equipmentName: 'LED Array Zone A',
        type: 'degradation',
        severity: 'warning',
        message: 'LED driver efficiency degrading - replacement recommended',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
        predictedDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        confidence: 0.78
      },
      {
        id: 'alert-3',
        equipmentId: 'hvac-2',
        equipmentName: 'HVAC Unit 2',
        type: 'threshold',
        severity: 'info',
        message: 'Filter replacement due in 7 days',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        acknowledged: true,
        predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        confidence: 1.0
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  // Mock parts inventory
  const partsInventory: PartsInventory[] = [
    {
      partNumber: 'DRV-001',
      name: 'LED Driver 600W',
      quantity: 3,
      reorderPoint: 2,
      leadTime: 14,
      supplier: 'ElectroSupply Co',
      cost: 850,
      equipmentTypes: ['Lighting'],
      predictedNeed: {
        quantity: 2,
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        confidence: 0.78
      }
    },
    {
      partNumber: 'BRG-445',
      name: 'Pump Bearing Assembly',
      quantity: 0,
      reorderPoint: 1,
      leadTime: 7,
      supplier: 'Industrial Parts Ltd',
      cost: 1200,
      equipmentTypes: ['Water System'],
      predictedNeed: {
        quantity: 1,
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        confidence: 0.92
      }
    },
    {
      partNumber: 'FLT-HVAC-24',
      name: 'HVAC Filter 24x24x4',
      quantity: 12,
      reorderPoint: 6,
      leadTime: 3,
      supplier: 'FilterMax',
      cost: 45,
      equipmentTypes: ['Climate Control'],
      predictedNeed: {
        quantity: 4,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        confidence: 0.95
      }
    }
  ];

  // Calculate metrics
  const criticalEquipment = equipmentHealth.filter(e => e.failureProbability > 60).length;
  const avgHealthScore = equipmentHealth.reduce((sum, e) => sum + e.healthScore, 0) / equipmentHealth.length;
  const totalPredictedCost = equipmentHealth.reduce((sum, e) => 
    sum + e.predictedFailures.reduce((s, f) => s + f.estimatedCost, 0), 0
  );
  const potentialSavings = equipmentHealth.reduce((sum, e) => 
    sum + e.recommendations.reduce((s, r) => s + r.savings, 0), 0
  );

  // Health trend data
  const healthTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    health: 85 - (i * 0.5) + Math.sin(i / 5) * 5,
    failures: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2),
    efficiency: 92 - (i * 0.3) + Math.sin(i / 7) * 3
  }));

  // Failure prediction data
  const failurePredictionData = equipmentHealth
    .filter(e => e.daysToFailure !== null)
    .map(e => ({
      equipment: e.name,
      days: e.daysToFailure,
      probability: e.failureProbability,
      cost: e.predictedFailures[0]?.estimatedCost || 0
    }))
    .sort((a, b) => a.days! - b.days!);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const orderPart = (part: PartsInventory) => {
    alert(`Ordering ${part.predictedNeed.quantity} units of ${part.name}\nSupplier: ${part.supplier}\nLead time: ${part.leadTime} days`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            Predictive Maintenance AI
          </h2>
          <p className="text-gray-400">ML-powered failure prediction and optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="week">7 Days</option>
            <option value="month">30 Days</option>
            <option value="quarter">90 Days</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'equipment', 'alerts', 'inventory'].map((tab) => (
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

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg Health Score</span>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{avgHealthScore.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="text-red-400">-3%</span> from last month
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Critical Equipment</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">{criticalEquipment}</p>
              <p className="text-sm text-gray-500 mt-1">Failure risk &gt;60%</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Predicted Costs</span>
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalPredictedCost.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Next 90 days</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Potential Savings</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">${potentialSavings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Through prevention</p>
            </div>
          </div>

          {/* Health Trend Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Facility Health Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="health"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Health Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Efficiency"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Failure Timeline */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Predicted Failure Timeline</h3>
            <div className="space-y-3">
              {failurePredictionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-16 text-center py-2 rounded-lg ${
                    item.days! <= 30 ? 'bg-red-900/30 text-red-400' :
                    item.days! <= 60 ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-blue-900/30 text-blue-400'
                  }`}>
                    {item.days}d
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{item.equipment}</h4>
                      <span className="text-sm text-gray-400">{item.probability}% probability</span>
                    </div>
                    <div className="mt-1 bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.probability > 75 ? 'bg-red-500' :
                          item.probability > 50 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${item.probability}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${item.cost}</p>
                    <p className="text-xs text-gray-500">Est. cost</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>Irrigation Pump 1 shows accelerating degradation pattern - immediate action required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>LED Array Zone A temperature rise correlates with reduced efficiency - cleaning recommended</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>Scheduling preventive maintenance now could save $12,300 over next quarter</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment List */}
          <div className="space-y-4">
            {equipmentHealth.map((equipment) => (
              <div
                key={equipment.id}
                onClick={() => setSelectedEquipment(equipment)}
                className={`bg-gray-900 rounded-lg p-4 border cursor-pointer transition-all ${
                  selectedEquipment?.id === equipment.id
                    ? 'border-purple-600 ring-2 ring-purple-600/20'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{equipment.name}</h3>
                    <p className="text-sm text-gray-400">{equipment.type}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      equipment.healthScore >= 80 ? 'text-green-400' :
                      equipment.healthScore >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {equipment.healthScore}%
                    </div>
                    <p className="text-xs text-gray-500">Health Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Failure Risk</p>
                    <p className={`font-medium ${
                      equipment.failureProbability > 60 ? 'text-red-400' :
                      equipment.failureProbability > 30 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {equipment.failureProbability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Efficiency</p>
                    <p className="text-white font-medium">{equipment.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Operating Hours</p>
                    <p className="text-white font-medium">{equipment.operatingHours.toLocaleString()}</p>
                  </div>
                </div>

                {equipment.daysToFailure && (
                  <div className="mt-3 p-2 bg-red-900/20 border border-red-600/30 rounded">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Failure predicted in {equipment.daysToFailure} days
                    </p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {equipment.trends.map((trend, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                        trend.severity === 'critical' ? 'bg-red-900/20 text-red-400' :
                        trend.severity === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {trend.metric}
                      {trend.direction === 'up' ? <ArrowUp className="w-3 h-3" /> :
                       trend.direction === 'down' ? <ArrowDown className="w-3 h-3" /> :
                       null}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Equipment Details */}
          {selectedEquipment && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                {selectedEquipment.name} Analysis
              </h3>

              {/* Sensor Readings */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Temperature</p>
                  <p className="text-xl font-bold text-white">{selectedEquipment.temperature}°F</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Vibration</p>
                  <p className="text-xl font-bold text-white">{selectedEquipment.vibration} mm/s</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Current Draw</p>
                  <p className="text-xl font-bold text-white">{selectedEquipment.current} A</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Last Service</p>
                  <p className="text-xl font-bold text-white">
                    {Math.floor((Date.now() - selectedEquipment.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000))}d ago
                  </p>
                </div>
              </div>

              {/* Predicted Failures */}
              <div className="mb-6">
                <h4 className="font-medium text-white mb-3">Predicted Failures</h4>
                <div className="space-y-2">
                  {selectedEquipment.predictedFailures.map((failure, idx) => (
                    <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{failure.component}</span>
                        <span className={`text-sm ${
                          failure.impact === 'critical' ? 'text-red-400' :
                          failure.impact === 'high' ? 'text-orange-400' :
                          failure.impact === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {failure.impact} impact
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{failure.timeframe}</span>
                        <span className="text-gray-400">{failure.probability}% probability</span>
                      </div>
                      <div className="mt-2 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                          style={{ width: `${failure.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-white mb-3">AI Recommendations</h4>
                <div className="space-y-2">
                  {selectedEquipment.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{rec.action}</p>
                          <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-yellow-400">Cost: ${rec.cost}</span>
                            <span className="text-green-400">Saves: ${rec.savings}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          rec.urgency === 'immediate' ? 'bg-red-900/20 text-red-400' :
                          rec.urgency === 'soon' ? 'bg-yellow-900/20 text-yellow-400' :
                          rec.urgency === 'scheduled' ? 'bg-blue-900/20 text-blue-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {rec.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-600/30">
              <div className="flex items-center justify-between">
                <span className="text-red-400">Critical Alerts</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length}
              </p>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
              <div className="flex items-center justify-between">
                <span className="text-yellow-400">Warning Alerts</span>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length}
              </p>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
              <div className="flex items-center justify-between">
                <span className="text-blue-400">Info Alerts</span>
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {alerts.filter(a => a.severity === 'info' && !a.acknowledged).length}
              </p>
            </div>
          </div>

          {/* Alert List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 ${alert.acknowledged ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-900/20' :
                        alert.severity === 'warning' ? 'bg-yellow-900/20' :
                        'bg-blue-900/20'
                      }`}>
                        {alert.type === 'failure' ? <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} /> :
                         alert.type === 'degradation' ? <TrendingUp className="w-5 h-5 text-yellow-400" /> :
                         alert.type === 'efficiency' ? <Activity className="w-5 h-5 text-orange-400" /> :
                         <Clock className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{alert.equipmentName}</h4>
                        <p className="text-gray-300 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                          <span>Predicted: {new Date(alert.predictedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <>
          {/* Parts Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Low Stock Items</span>
                <Package className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {partsInventory.filter(p => p.quantity <= p.reorderPoint).length}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Predicted Need</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {partsInventory.reduce((sum, p) => sum + p.predictedNeed.quantity, 0)}
              </p>
              <p className="text-xs text-gray-500">Next 90 days</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Order Value</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${partsInventory
                  .filter(p => p.quantity <= p.reorderPoint)
                  .reduce((sum, p) => sum + (p.predictedNeed.quantity * p.cost), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg Lead Time</span>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round(partsInventory.reduce((sum, p) => sum + p.leadTime, 0) / partsInventory.length)} days
              </p>
            </div>
          </div>

          {/* Parts Inventory Table */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Parts Inventory & Predictions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Part Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Predicted Need</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Lead Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {partsInventory.map((part) => (
                    <tr key={part.partNumber} className="border-b border-gray-800">
                      <td className="px-4 py-3 font-mono text-sm text-gray-300">{part.partNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{part.name}</p>
                          <p className="text-xs text-gray-500">{part.equipmentTypes.join(', ')}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-medium ${
                          part.quantity === 0 ? 'text-red-400' :
                          part.quantity <= part.reorderPoint ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {part.quantity} / {part.reorderPoint}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white">{part.predictedNeed.quantity} units</p>
                          <p className="text-xs text-gray-500">
                            by {new Date(part.predictedNeed.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-purple-400">
                            {(part.predictedNeed.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{part.leadTime} days</td>
                      <td className="px-4 py-3 text-white font-medium">${part.cost}</td>
                      <td className="px-4 py-3">
                        {part.quantity <= part.reorderPoint && (
                          <button
                            onClick={() => orderPart(part)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                          >
                            Order Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Ordering Recommendations */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-600/30">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Ordering Recommendations</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>Order pump bearing immediately - 92% failure probability in 18 days, 7-day lead time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>Bundle LED drivers with next order - save 15% on shipping, predicted need in 35 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>Consider increasing HVAC filter stock - consumption trending 20% above normal</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}