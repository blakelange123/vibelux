'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  DollarSign,
  Users,
  Settings,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Star,
  Award,
  Shield,
  Activity,
  Bell,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Gauge,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MapPin,
  Package,
  Wrench,
  Factory
} from 'lucide-react';

interface Decision {
  id: string;
  category: 'immediate' | 'planned' | 'strategic' | 'maintenance' | 'optimization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  situation: string;
  recommendation: string;
  alternatives?: string[];
  impact: {
    yield: number;
    cost: number;
    quality: number;
    risk: number;
  };
  timeframe: string;
  confidence: number;
  dataSources: string[];
  estimatedValue: number;
  implementationSteps: string[];
  status: 'new' | 'reviewing' | 'approved' | 'implemented' | 'monitoring';
  createdAt: Date;
  deadline?: Date;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: 'positive' | 'negative' | 'neutral';
  timeframe: string;
  preparations: string[];
  triggers: string[];
}

interface KPI {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'off-track';
  lastUpdated: Date;
}

export function DecisionSupportSystem() {
  const [selectedView, setSelectedView] = useState<'dashboard' | 'decisions' | 'scenarios' | 'simulation'>('dashboard');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: 'dec-1',
      category: 'immediate',
      priority: 'critical',
      title: 'LED Panel Replacement Required',
      description: 'Panel #24 efficiency dropped below 85% threshold',
      situation: 'LED Panel #24 in Flower Room A is operating at 82% efficiency, 13% below optimal. Current yield impact estimated at 3.2% for affected area.',
      recommendation: 'Replace LED panel during next dark cycle (tonight 8PM-6AM) to prevent further yield loss.',
      alternatives: [
        'Temporary power reduction to extend life (+2 weeks, -8% yield)',
        'Wait for scheduled maintenance (+3 weeks, -15% yield total)'
      ],
      impact: {
        yield: 3.2,
        cost: -1250,
        quality: 2.1,
        risk: 15
      },
      timeframe: 'Within 12 hours',
      confidence: 94.2,
      dataSources: ['Equipment sensors', 'PPFD measurements', 'Yield prediction model'],
      estimatedValue: 3800,
      implementationSteps: [
        'Schedule technician for 8PM dark cycle',
        'Prepare replacement panel (Model: SPYDR 2p)',
        'Document current performance metrics',
        'Replace panel and calibrate',
        'Verify PPFD distribution and uniformity'
      ],
      status: 'new',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      deadline: new Date(Date.now() + 10 * 60 * 60 * 1000)
    },
    {
      id: 'dec-2',
      category: 'optimization',
      priority: 'high',
      title: 'Implement Dynamic CO₂ Injection',
      description: 'Opportunity to increase photosynthetic efficiency by 8.4%',
      situation: 'Analysis shows suboptimal CO₂ utilization during peak light periods. Current average: 847 ppm, optimal: 1200 ppm during photosynthesis.',
      recommendation: 'Install smart CO₂ injection system with environmental sensors for demand-based delivery.',
      impact: {
        yield: 8.4,
        cost: -15000,
        quality: 5.2,
        risk: 5
      },
      timeframe: '2-3 weeks implementation',
      confidence: 87.6,
      dataSources: ['CO₂ sensors', 'Photosynthesis model', 'Yield analytics'],
      estimatedValue: 42000,
      implementationSteps: [
        'Design injection point layout',
        'Install CO₂ delivery system',
        'Configure environmental controls',
        'Calibrate sensor network',
        'Test and optimize injection timing'
      ],
      status: 'reviewing',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'dec-3',
      category: 'planned',
      priority: 'medium',
      title: 'Strain Rotation for Q2',
      description: 'Optimize strain selection based on market demand and facility efficiency',
      situation: 'Market analysis shows 23% price premium for high-CBD strains. Current rotation is THC-focused with lower margins.',
      recommendation: 'Allocate 40% of flower capacity to high-CBD strains (Charlotte\'s Web, ACDC) for Q2 cycle.',
      impact: {
        yield: -2.1,
        cost: 18500,
        quality: 8.7,
        risk: 12
      },
      timeframe: 'Q2 2024 (8 weeks)',
      confidence: 82.3,
      dataSources: ['Market analysis', 'Strain performance data', 'Customer demand'],
      estimatedValue: 67000,
      implementationSteps: [
        'Source high-CBD genetics',
        'Develop cultivation protocols',
        'Train staff on new procedures',
        'Update quality control standards',
        'Monitor market response'
      ],
      status: 'approved',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'dec-4',
      category: 'maintenance',
      priority: 'medium',
      title: 'HVAC Filter Replacement Schedule',
      description: 'Optimize maintenance timing to reduce energy costs',
      situation: 'Current monthly filter changes may be suboptimal. Data suggests bi-weekly changes during high-pollen season could reduce energy consumption.',
      recommendation: 'Implement dynamic filter replacement based on pressure differential and outdoor air quality.',
      impact: {
        yield: 1.2,
        cost: -3200,
        quality: 0.8,
        risk: 3
      },
      timeframe: 'Next 30 days',
      confidence: 91.4,
      dataSources: ['HVAC sensors', 'Energy consumption', 'Air quality data'],
      estimatedValue: 12000,
      implementationSteps: [
        'Install pressure differential sensors',
        'Create dynamic scheduling algorithm',
        'Train maintenance team',
        'Monitor energy consumption changes'
      ],
      status: 'new',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ]);

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'scen-1',
      name: 'Energy Price Spike',
      description: 'Electricity costs increase by 40% during summer peak demand',
      probability: 73,
      impact: 'negative',
      timeframe: 'June - August 2024',
      preparations: [
        'Implement demand response protocols',
        'Optimize lighting schedules for off-peak hours',
        'Consider battery storage system',
        'Negotiate time-of-use rates'
      ],
      triggers: ['Peak demand alerts', 'Utility rate changes', 'Grid stress conditions']
    },
    {
      id: 'scen-2',
      name: 'New Compliance Regulations',
      description: 'State implements stricter energy efficiency requirements',
      probability: 68,
      impact: 'negative',
      timeframe: 'Q3 2024',
      preparations: [
        'Audit current energy usage',
        'Upgrade to more efficient equipment',
        'Implement advanced monitoring',
        'Document compliance procedures'
      ],
      triggers: ['Regulatory announcements', 'Industry compliance deadlines']
    },
    {
      id: 'scen-3',
      name: 'Premium Market Expansion',
      description: 'New premium cannabis market segment emerges with 50% higher margins',
      probability: 81,
      impact: 'positive',
      timeframe: 'Q2-Q3 2024',
      preparations: [
        'Develop ultra-premium cultivation protocols',
        'Invest in quality enhancement technology',
        'Create premium branding strategy',
        'Train staff on quality standards'
      ],
      triggers: ['Market research findings', 'Consumer demand patterns', 'Competitor activities']
    }
  ]);

  const [kpis, setKPIs] = useState<KPI[]>([
    {
      id: 'kpi-1',
      name: 'Yield per Square Foot',
      current: 47.3,
      target: 50.0,
      unit: 'g/sq ft',
      trend: 'up',
      status: 'on-track',
      lastUpdated: new Date()
    },
    {
      id: 'kpi-2',
      name: 'Energy Efficiency',
      current: 2.85,
      target: 3.00,
      unit: 'μmol/J',
      trend: 'up',
      status: 'on-track',
      lastUpdated: new Date()
    },
    {
      id: 'kpi-3',
      name: 'Production Cost',
      current: 0.34,
      target: 0.30,
      unit: '$/g',
      trend: 'down',
      status: 'at-risk',
      lastUpdated: new Date()
    },
    {
      id: 'kpi-4',
      name: 'Quality Score',
      current: 92.1,
      target: 95.0,
      unit: '%',
      trend: 'stable',
      status: 'at-risk',
      lastUpdated: new Date()
    }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setKPIs(prev => prev.map(kpi => ({
          ...kpi,
          current: kpi.current + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1,
          lastUpdated: new Date()
        })));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-500';
      case 'at-risk': return 'text-yellow-500';
      case 'off-track': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatConfidence = (confidence: number) => `${confidence.toFixed(1)}%`;

  const filteredDecisions = decisions.filter(decision => {
    const matchesPriority = filterPriority === 'all' || decision.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || decision.category === filterCategory;
    return matchesPriority && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-400" />
              Decision Support System
            </h1>
            <p className="text-gray-400">AI-powered recommendations and scenario planning for optimal cultivation decisions</p>
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
            
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {decisions.filter(d => d.priority === 'critical').length}
              </span>
            </div>
            <p className="text-sm text-gray-400">Critical Decisions</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {decisions.filter(d => d.status === 'new').length}
              </span>
            </div>
            <p className="text-sm text-gray-400">Pending Review</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {formatCurrency(decisions.reduce((sum, d) => sum + d.estimatedValue, 0))}
              </span>
            </div>
            <p className="text-sm text-gray-400">Total Value</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">89.2%</span>
            </div>
            <p className="text-sm text-gray-400">Avg Confidence</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {decisions.filter(d => d.deadline && d.deadline < new Date(Date.now() + 24 * 60 * 60 * 1000)).length}
              </span>
            </div>
            <p className="text-sm text-gray-400">Due Today</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Eye },
            { id: 'decisions', label: 'Active Decisions', icon: Target },
            { id: 'scenarios', label: 'Scenarios', icon: BarChart3 },
            { id: 'simulation', label: 'Simulation', icon: Settings }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedView === view.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>

        {/* Dashboard View */}
        {selectedView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Performance Indicators */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Key Performance Indicators
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {kpis.map(kpi => (
                    <div key={kpi.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{kpi.name}</span>
                        <span className={`text-sm font-medium ${getStatusColor(kpi.status)}`}>
                          {kpi.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-white">{kpi.current.toFixed(2)}</span>
                        <span className="text-sm text-gray-400">{kpi.unit}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Target: {kpi.target} {kpi.unit}</span>
                        <span className="text-gray-500">
                          {kpi.lastUpdated.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${getStatusColor(kpi.status).replace('text-', 'bg-')}`}
                          style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High Priority Decisions */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  High Priority Decisions
                </h2>
                
                <div className="space-y-4">
                  {decisions
                    .filter(d => d.priority === 'critical' || d.priority === 'high')
                    .slice(0, 3)
                    .map(decision => (
                      <div key={decision.id} className={`p-4 rounded-lg border ${getPriorityColor(decision.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-white mb-1">{decision.title}</h3>
                            <p className="text-sm text-gray-400">{decision.description}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(decision.priority)}`}>
                            {decision.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-gray-400">Value:</span>
                            <span className="ml-1 text-green-400">{formatCurrency(decision.estimatedValue)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Confidence:</span>
                            <span className="ml-1 text-blue-400">{formatConfidence(decision.confidence)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Timeframe:</span>
                            <span className="ml-1 text-yellow-400">{decision.timeframe}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all">
                            Review
                          </button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all">
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Upcoming Scenarios */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Scenario Alerts
                </h2>
                
                <div className="space-y-3">
                  {scenarios.slice(0, 3).map(scenario => (
                    <div key={scenario.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getImpactIcon(scenario.impact)}
                          <span className="text-sm font-medium text-white">{scenario.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{scenario.probability}%</span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-2">{scenario.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{scenario.timeframe}</span>
                        <span className="text-blue-400">{scenario.preparations.length} preparations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Recent Activity
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">Decision implemented: CO₂ optimization</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">New recommendation: Energy optimization</div>
                      <div className="text-xs text-gray-500">4 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">Scenario probability updated: Energy spike 73%</div>
                      <div className="text-xs text-gray-500">6 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decisions View */}
        {selectedView === 'decisions' && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="immediate">Immediate</option>
                <option value="planned">Planned</option>
                <option value="strategic">Strategic</option>
                <option value="maintenance">Maintenance</option>
                <option value="optimization">Optimization</option>
              </select>
            </div>

            {/* Decisions List */}
            <div className="space-y-6">
              {filteredDecisions.map(decision => (
                <div key={decision.id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(decision.priority)}`}>
                          {decision.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400">{decision.category}</span>
                        {decision.deadline && (
                          <span className="text-sm text-yellow-400">
                            Due: {decision.deadline.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{decision.title}</h3>
                      <p className="text-sm text-gray-400">{decision.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400 mb-1">
                        {formatCurrency(decision.estimatedValue)}
                      </div>
                      <div className="text-sm text-gray-400">Estimated Value</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Situation</h4>
                      <p className="text-sm text-gray-400">{decision.situation}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendation</h4>
                      <p className="text-sm text-gray-400">{decision.recommendation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Yield Impact</div>
                      <div className={`text-lg font-semibold ${
                        decision.impact.yield > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {decision.impact.yield > 0 ? '+' : ''}{decision.impact.yield.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Cost Impact</div>
                      <div className={`text-lg font-semibold ${
                        decision.impact.cost < 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(decision.impact.cost)}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Quality Impact</div>
                      <div className={`text-lg font-semibold ${
                        decision.impact.quality > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {decision.impact.quality > 0 ? '+' : ''}{decision.impact.quality.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Confidence</div>
                      <div className="text-lg font-semibold text-blue-400">
                        {formatConfidence(decision.confidence)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-all">
                      Approve & Implement
                    </button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all">
                      Schedule Later
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="fixed bottom-6 right-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {autoRefresh ? 'Real-time analysis active' : 'Analysis paused'}
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