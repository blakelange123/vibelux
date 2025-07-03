'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  Zap,
  Droplets,
  Leaf,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';

export default function OperationsMetricsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('otif');

  // Mock metrics data
  const metrics = {
    otif: {
      current: 98.2,
      target: 95,
      trend: '+2.1%',
      status: 'good'
    },
    yield: {
      current: 142.5,
      target: 135,
      trend: '+5.6%',
      status: 'good',
      unit: 'g/m²/day'
    },
    quality: {
      current: 94.8,
      target: 90,
      trend: '-0.3%',
      status: 'warning',
      unit: '% First Pass'
    },
    labor: {
      current: 87.5,
      target: 85,
      trend: '+3.2%',
      status: 'good',
      unit: '% Efficiency'
    },
    inventory: {
      current: 95.3,
      target: 95,
      trend: '+0.5%',
      status: 'good',
      unit: '% Accuracy'
    },
    energy: {
      current: 2.8,
      target: 3.0,
      trend: '-7.1%',
      status: 'good',
      unit: 'kWh/kg'
    }
  };

  const detailedMetrics = {
    production: {
      throughput: '2,847 units/day',
      cycleTime: '42 days',
      capacity: '86.3%',
      oee: '78.5%'
    },
    quality: {
      defectRate: '5.2%',
      pathogenDetections: '0',
      customerComplaints: '3',
      qualityScore: '94.8/100'
    },
    financial: {
      costPerUnit: '$2.34',
      revenuePerSqFt: '$148',
      grossMargin: '42%',
      roi: '187%'
    },
    environmental: {
      waterUsage: '1.2 L/kg',
      co2Efficiency: '98%',
      tempStability: '99.2%',
      lightEfficiency: '2.1 µmol/J'
    }
  };

  const predictions = {
    yieldForecast: {
      next7Days: 145.2,
      next30Days: 148.7,
      confidence: 92
    },
    diseaseRisk: {
      level: 'Low',
      probability: 12,
      topRisks: ['Pythium', 'Fusarium']
    },
    maintenanceNeeds: [
      { equipment: 'HVAC Unit 3', days: 5, priority: 'High' },
      { equipment: 'Pump Station 2', days: 12, priority: 'Medium' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend.startsWith('+') 
      ? <TrendingUp className="w-4 h-4 text-green-400" />
      : <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/operations" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Operations
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-400" />
                Operations Metrics & KPIs
              </h1>
              <p className="text-gray-400">
                Real-time performance monitoring and predictive analytics
              </p>
            </div>
            
            <div className="flex gap-3">
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(metrics).map(([key, metric]) => (
            <div 
              key={key}
              className={`bg-gray-800 rounded-lg p-4 border ${
                selectedMetric === key ? 'border-green-500' : 'border-gray-700'
              } cursor-pointer hover:border-gray-600 transition-colors`}
              onClick={() => setSelectedMetric(key)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase">{key}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.current}{metric.unit ? '' : '%'}
              </div>
              {metric.unit && (
                <div className="text-xs text-gray-500">{metric.unit}</div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Target: {metric.target}
              </div>
              <div className="text-xs text-gray-400">
                {metric.trend} vs last period
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production & Quality Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Production Metrics */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Production Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(detailedMetrics.production).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-lg font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Quality Assurance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(detailedMetrics.quality).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className={`text-lg font-bold ${
                      key === 'pathogenDetections' && value === '0' ? 'text-green-400' : ''
                    }`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Financial Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(detailedMetrics.financial).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-lg font-bold text-green-400">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Environmental Metrics */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-400" />
                Environmental Efficiency
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(detailedMetrics.environmental).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-lg font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Predictions & Alerts */}
          <div className="space-y-6">
            {/* Yield Predictions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Yield Predictions
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Next 7 Days</span>
                    <span className="text-sm text-gray-500">
                      {predictions.yieldForecast.confidence}% confidence
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {predictions.yieldForecast.next7Days} g/m²/day
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Next 30 Days</div>
                  <div className="text-xl font-bold">
                    {predictions.yieldForecast.next30Days} g/m²/day
                  </div>
                </div>
              </div>
            </div>

            {/* Disease Risk Assessment */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Disease Risk Assessment
              </h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Risk</span>
                  <span className={`font-bold ${
                    predictions.diseaseRisk.level === 'Low' ? 'text-green-400' :
                    predictions.diseaseRisk.level === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {predictions.diseaseRisk.level}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${predictions.diseaseRisk.probability}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {predictions.diseaseRisk.probability}% probability
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Top Risk Factors</div>
                <div className="space-y-1">
                  {predictions.diseaseRisk.topRisks.map((risk) => (
                    <div key={risk} className="text-sm bg-gray-900 rounded px-2 py-1">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Maintenance Predictions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Maintenance Schedule
              </h3>
              <div className="space-y-3">
                {predictions.maintenanceNeeds.map((item, index) => (
                  <div key={index} className="pb-3 border-b border-gray-700 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.equipment}</div>
                        <div className="text-xs text-gray-400">
                          Due in {item.days} days
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === 'High' ? 'bg-red-900/30 text-red-400' :
                        item.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Alerts */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" />
                Active Alerts
              </h3>
              <div className="space-y-2">
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">pH Drift - Tank 3</div>
                      <div className="text-xs text-gray-400">5 minutes ago</div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Harvest Queue Full</div>
                      <div className="text-xs text-gray-400">12 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
          <h3 className="text-xl font-semibold mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="font-medium">Optimize Flower Room 3</span>
              </div>
              <p className="text-sm text-gray-400">
                Increase PPFD by 50 µmol to reach yield target
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Schedule PM for HVAC</span>
              </div>
              <p className="text-sm text-gray-400">
                Preventive maintenance will avoid 8hr downtime
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Adjust Nutrient Mix</span>
              </div>
              <p className="text-sm text-gray-400">
                Reduce N by 10% based on tissue analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}