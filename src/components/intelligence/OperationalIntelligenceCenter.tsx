'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Thermometer,
  Droplets,
  DollarSign,
  BarChart3,
  Activity,
  Eye,
  Target,
  Lightbulb,
  Leaf,
  Settings,
  Calendar,
  Users,
  Package,
  Wrench,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  Filter,
  Search,
  Bell,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  MapPin,
  Cpu,
  Database,
  Wifi,
  Shield,
  RefreshCw
} from 'lucide-react';

interface IntelligenceMetric {
  id: string;
  category: 'operational' | 'environmental' | 'financial' | 'predictive' | 'equipment';
  name: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changeUnit?: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  prediction?: {
    nextValue: number | string;
    confidence: number;
    timeframe: string;
  };
  insights?: string[];
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  source: string;
  message: string;
  timestamp: Date;
  location?: string;
  actionRequired?: boolean;
  recommendation?: string;
}

interface OperationalSummary {
  efficiency: number;
  yield: number;
  energyCost: number;
  maintenanceScore: number;
  complianceScore: number;
  uptime: number;
}

import { BusinessIntelligenceDashboard } from './BusinessIntelligenceDashboard';
import { AdvancedAnalyticsEngine } from './AdvancedAnalyticsEngine';
import { DecisionSupportSystem } from './DecisionSupportSystem';

export function OperationalIntelligenceCenter() {
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'predictions' | 'alerts' | 'optimization' | 'business' | 'decisions'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Real-time metrics
  const [metrics, setMetrics] = useState<IntelligenceMetric[]>([
    {
      id: 'overall-efficiency',
      category: 'operational',
      name: 'Overall Efficiency',
      value: 94.2,
      unit: '%',
      trend: 'up',
      change: 2.3,
      changeUnit: '%',
      status: 'excellent',
      prediction: {
        nextValue: 95.1,
        confidence: 87,
        timeframe: 'next 24h'
      },
      insights: ['Peak efficiency during night cycles', 'LED driver optimization contributing 1.2%']
    },
    {
      id: 'energy-efficiency',
      category: 'operational',
      name: 'Energy Efficiency',
      value: 2.85,
      unit: 'μmol/J',
      trend: 'up',
      change: 0.12,
      status: 'excellent',
      prediction: {
        nextValue: 2.89,
        confidence: 92,
        timeframe: 'next week'
      }
    },
    {
      id: 'yield-prediction',
      category: 'predictive',
      name: 'Predicted Yield',
      value: 47.3,
      unit: 'g/plant',
      trend: 'up',
      change: 3.2,
      status: 'good',
      prediction: {
        nextValue: 48.8,
        confidence: 84,
        timeframe: 'harvest'
      },
      insights: ['DLI optimization improving bud density', 'Temperature differential enhancing terpene production']
    },
    {
      id: 'vpd-optimization',
      category: 'environmental',
      name: 'VPD Optimization',
      value: 98.7,
      unit: '%',
      trend: 'stable',
      change: 0.1,
      status: 'excellent',
      insights: ['Maintaining optimal transpiration rates', 'Humidity control performing excellently']
    },
    {
      id: 'cost-per-gram',
      category: 'financial',
      name: 'Production Cost',
      value: 0.34,
      unit: '$/g',
      trend: 'down',
      change: -0.08,
      status: 'excellent',
      prediction: {
        nextValue: 0.31,
        confidence: 78,
        timeframe: 'next month'
      },
      insights: ['Energy efficiency improvements reducing costs', 'Automated systems reducing labor by 23%']
    },
    {
      id: 'equipment-health',
      category: 'equipment',
      name: 'Equipment Health',
      value: 96.8,
      unit: '%',
      trend: 'stable',
      change: -0.2,
      status: 'excellent',
      insights: ['Predictive maintenance preventing failures', '3 units scheduled for service this week']
    },
    {
      id: 'co2-efficiency',
      category: 'environmental',
      name: 'CO₂ Utilization',
      value: 89.4,
      unit: '%',
      trend: 'up',
      change: 4.2,
      status: 'good',
      insights: ['Smart injection timing improving efficiency', 'Sealed environment maintaining levels']
    },
    {
      id: 'water-efficiency',
      category: 'environmental',
      name: 'Water Use Efficiency',
      value: 0.42,
      unit: 'L/g',
      trend: 'down',
      change: -0.03,
      status: 'good',
      insights: ['Precision irrigation reducing waste', 'Runoff capture system active']
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert-1',
      type: 'warning',
      source: 'HVAC Zone 2',
      message: 'Temperature variance detected - may impact VPD',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      location: 'Flower Room B',
      actionRequired: true,
      recommendation: 'Check airflow sensor and clean intake filter'
    },
    {
      id: 'alert-2',
      type: 'info',
      source: 'ML Prediction Engine',
      message: 'Yield forecast updated - 3.2% increase expected',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      location: 'All Zones'
    },
    {
      id: 'alert-3',
      type: 'critical',
      source: 'Equipment Monitor',
      message: 'LED Panel #24 showing degraded performance',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: 'Veg Room A',
      actionRequired: true,
      recommendation: 'Schedule replacement during next dark cycle'
    },
    {
      id: 'alert-4',
      type: 'success',
      source: 'Automation System',
      message: 'Irrigation cycle completed successfully',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      location: 'All Zones'
    }
  ]);

  const [summary, setSummary] = useState<OperationalSummary>({
    efficiency: 94.2,
    yield: 47.3,
    energyCost: 0.34,
    maintenanceScore: 96.8,
    complianceScore: 100,
    uptime: 99.7
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: typeof metric.value === 'number' 
            ? metric.value + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1 
            : metric.value
        })));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/10 border-green-500/30';
      case 'good': return 'bg-blue-500/10 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = searchTerm === '' || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Operational Intelligence Center
            </h1>
            <p className="text-gray-400">Real-time insights and predictive analytics for cultivation operations</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {autoRefresh ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{summary.efficiency}%</span>
            </div>
            <p className="text-sm text-gray-400">Overall Efficiency</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{summary.yield}g</span>
            </div>
            <p className="text-sm text-gray-400">Avg Yield/Plant</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">${summary.energyCost}</span>
            </div>
            <p className="text-sm text-gray-400">Cost per Gram</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{summary.maintenanceScore}%</span>
            </div>
            <p className="text-sm text-gray-400">Equipment Health</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-2xl font-bold text-cyan-400">{summary.complianceScore}%</span>
            </div>
            <p className="text-sm text-gray-400">Compliance</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{summary.uptime}%</span>
            </div>
            <p className="text-sm text-gray-400">System Uptime</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'analytics', label: 'ML Analytics', icon: Brain },
            { id: 'business', label: 'Business Intelligence', icon: BarChart3 },
            { id: 'decisions', label: 'Decision Support', icon: Target },
            { id: 'predictions', label: 'Predictions', icon: TrendingUp },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'optimization', label: 'Optimization', icon: Lightbulb }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedView === view.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Real-Time Metrics</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search metrics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="operational">Operational</option>
                      <option value="environmental">Environmental</option>
                      <option value="financial">Financial</option>
                      <option value="predictive">Predictive</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMetrics.map(metric => (
                    <div key={metric.id} className={`p-4 rounded-lg border ${getStatusBg(metric.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 font-medium">{metric.name}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                          {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                        </span>
                        {metric.unit && (
                          <span className="text-sm text-gray-400">{metric.unit}</span>
                        )}
                      </div>

                      {metric.change !== 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          {metric.trend === 'up' ? (
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          )}
                          <span className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(metric.change)}{metric.changeUnit || ''}
                          </span>
                        </div>
                      )}

                      {metric.prediction && (
                        <div className="text-xs text-gray-400 mb-2">
                          Forecast: {typeof metric.prediction.nextValue === 'number' 
                            ? metric.prediction.nextValue.toFixed(1) 
                            : metric.prediction.nextValue}{metric.unit} 
                          ({metric.prediction.confidence}% confidence)
                        </div>
                      )}

                      {metric.insights && metric.insights.length > 0 && (
                        <div className="space-y-1">
                          {metric.insights.map((insight, idx) => (
                            <div key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                              <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                              {insight}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Recent Alerts
                </h2>
                
                <div className="space-y-3">
                  {alerts.slice(0, 4).map(alert => (
                    <div key={alert.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {alert.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-500" />}
                          {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          <span className="text-sm font-medium text-gray-300">{alert.source}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">{alert.message}</p>
                      
                      {alert.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </div>
                      )}
                      
                      {alert.recommendation && (
                        <div className="text-xs text-blue-400 bg-blue-500/10 rounded p-2">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  System Status
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-300">Data Processing</span>
                    </div>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Database Health</span>
                    </div>
                    <span className="text-sm text-green-400">98.7%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">Sensor Network</span>
                    </div>
                    <span className="text-sm text-green-400">42/43 Online</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-gray-300">ML Engine</span>
                    </div>
                    <span className="text-sm text-green-400">Training</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ML Analytics View */}
        {selectedView === 'analytics' && <AdvancedAnalyticsEngine />}

        {/* Business Intelligence View */}
        {selectedView === 'business' && <BusinessIntelligenceDashboard />}

        {/* Decision Support View */}
        {selectedView === 'decisions' && <DecisionSupportSystem />}

        {/* Predictions View */}
        {selectedView === 'predictions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Yield Predictions
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Next Harvest (14 days)</span>
                    <span className="text-sm text-green-400">87% confidence</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">48.8 g/plant</div>
                  <div className="text-sm text-gray-400">Expected yield increase of 3.2g (+7.0%)</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Quality Grade Prediction</span>
                    <span className="text-sm text-green-400">92% confidence</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">Premium</div>
                  <div className="text-sm text-gray-400">THC: 24.2%, Terpenes: 2.8%</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-yellow-400" />
                Maintenance Predictions
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">LED Panel #24</span>
                    <span className="text-sm text-red-400">Action needed</span>
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">Replace in 3 days</div>
                  <div className="text-sm text-gray-400">Performance degraded to 87% efficiency</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">HVAC Filter Bank</span>
                    <span className="text-sm text-yellow-400">Schedule soon</span>
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">Service in 7 days</div>
                  <div className="text-sm text-gray-400">Airflow efficiency at 92%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="fixed bottom-6 right-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {autoRefresh ? 'Live updates' : 'Updates paused'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}