'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  Users,
  Leaf,
  Zap,
  Factory,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Percent,
  Package,
  Truck,
  ShoppingCart,
  Briefcase,
  Building,
  MapPin,
  Star,
  ThumbsUp,
  Filter,
  Download,
  RefreshCw,
  Settings,
  ChevronRight,
  Eye,
  Activity
} from 'lucide-react';

interface BusinessMetric {
  id: string;
  category: 'financial' | 'operational' | 'market' | 'sustainability' | 'compliance';
  name: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changeUnit?: string;
  period: string;
  benchmark?: number;
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface MarketInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'competitive';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionRequired?: boolean;
}

interface ROIAnalysis {
  investment: number;
  returns: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
}

export function BusinessIntelligenceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'financial' | 'operational' | 'market' | 'sustainability'>('overview');

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([
    {
      id: 'revenue',
      category: 'financial',
      name: 'Total Revenue',
      value: 2.4,
      unit: 'M',
      trend: 'up',
      change: 18.5,
      changeUnit: '%',
      period: 'vs last month',
      target: 2.8,
      status: 'good'
    },
    {
      id: 'gross-margin',
      category: 'financial',
      name: 'Gross Margin',
      value: 68.4,
      unit: '%',
      trend: 'up',
      change: 3.2,
      changeUnit: 'pts',
      period: 'vs last month',
      benchmark: 62,
      target: 70,
      status: 'excellent'
    },
    {
      id: 'production-efficiency',
      category: 'operational',
      name: 'Production Efficiency',
      value: 94.2,
      unit: '%',
      trend: 'up',
      change: 2.1,
      changeUnit: 'pts',
      period: 'vs last month',
      target: 95,
      status: 'excellent'
    },
    {
      id: 'yield-per-sqft',
      category: 'operational',
      name: 'Yield per Sq Ft',
      value: 47.3,
      unit: 'g',
      trend: 'up',
      change: 5.8,
      changeUnit: '%',
      period: 'vs last harvest',
      benchmark: 42,
      target: 50,
      status: 'good'
    },
    {
      id: 'energy-cost',
      category: 'operational',
      name: 'Energy Cost per Gram',
      value: 0.34,
      unit: '$',
      trend: 'down',
      change: -12.8,
      changeUnit: '%',
      period: 'vs last month',
      benchmark: 0.42,
      target: 0.30,
      status: 'excellent'
    },
    {
      id: 'customer-satisfaction',
      category: 'market',
      name: 'Customer Satisfaction',
      value: 4.7,
      unit: '/5',
      trend: 'up',
      change: 0.3,
      changeUnit: 'pts',
      period: 'vs last quarter',
      benchmark: 4.2,
      target: 4.8,
      status: 'excellent'
    },
    {
      id: 'market-share',
      category: 'market',
      name: 'Market Share',
      value: 12.8,
      unit: '%',
      trend: 'up',
      change: 1.4,
      changeUnit: 'pts',
      period: 'vs last quarter',
      benchmark: 10.5,
      target: 15,
      status: 'good'
    },
    {
      id: 'carbon-footprint',
      category: 'sustainability',
      name: 'Carbon Footprint',
      value: 0.85,
      unit: 'kg CO₂/g',
      trend: 'down',
      change: -22.3,
      changeUnit: '%',
      period: 'vs baseline',
      benchmark: 1.2,
      target: 0.75,
      status: 'excellent'
    },
    {
      id: 'water-efficiency',
      category: 'sustainability',
      name: 'Water Efficiency',
      value: 0.42,
      unit: 'L/g',
      trend: 'down',
      change: -15.2,
      changeUnit: '%',
      period: 'vs baseline',
      benchmark: 0.55,
      target: 0.40,
      status: 'good'
    },
    {
      id: 'compliance-score',
      category: 'compliance',
      name: 'Compliance Score',
      value: 98.7,
      unit: '%',
      trend: 'stable',
      change: 0.1,
      changeUnit: 'pts',
      period: 'this month',
      target: 100,
      status: 'excellent'
    }
  ]);

  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([
    {
      id: 'insight-1',
      type: 'opportunity',
      title: 'Growing Demand for Premium Cannabis',
      description: 'Premium indoor-grown cannabis seeing 35% YoY growth. Opportunity to expand high-THC strain production.',
      impact: 'high',
      timeframe: 'Next 6 months',
      actionRequired: true
    },
    {
      id: 'insight-2',
      type: 'trend',
      title: 'Sustainability Requirements Increasing',
      description: 'New regulations requiring 40% reduction in energy consumption by 2025. Early compliance provides competitive advantage.',
      impact: 'medium',
      timeframe: 'Next 18 months',
      actionRequired: true
    },
    {
      id: 'insight-3',
      type: 'competitive',
      title: 'Competitors Adopting Automation',
      description: 'Major competitors implementing automated cultivation systems. Risk of falling behind without modernization.',
      impact: 'high',
      timeframe: 'Next 12 months',
      actionRequired: true
    },
    {
      id: 'insight-4',
      type: 'opportunity',
      title: 'International Market Opening',
      description: 'European markets showing interest in North American cultivation technology. Export opportunity identified.',
      impact: 'medium',
      timeframe: 'Next 24 months'
    }
  ]);

  const roiAnalysis: ROIAnalysis = {
    investment: 1.2, // Million
    returns: 3.8,    // Million over 3 years
    roi: 316,        // Percentage
    paybackPeriod: 14, // Months
    npv: 2.1,        // Million
    irr: 47.3        // Percentage
  };

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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number, unit = 'M') => {
    return `$${amount.toFixed(1)}${unit}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              Business Intelligence Dashboard
            </h1>
            <p className="text-gray-400">Executive insights and strategic analytics for cultivation operations</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Report
            </button>
            
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configure
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-xl rounded-xl border border-green-600/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(2.4)}</div>
            <div className="text-sm text-gray-300">Monthly Revenue</div>
            <div className="text-xs text-green-400 mt-1">+18.5% vs last month</div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-xl rounded-xl border border-blue-600/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-6 h-6 text-blue-400" />
              <ArrowUpRight className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{roiAnalysis.roi}%</div>
            <div className="text-sm text-gray-300">Total ROI</div>
            <div className="text-xs text-blue-400 mt-1">Payback: {roiAnalysis.paybackPeriod}mo</div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-xl rounded-xl border border-purple-600/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-purple-400" />
              <ArrowUpRight className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">94.2%</div>
            <div className="text-sm text-gray-300">Efficiency Score</div>
            <div className="text-xs text-purple-400 mt-1">+2.1pts improvement</div>
          </div>

          <div className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 backdrop-blur-xl rounded-xl border border-orange-600/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-6 h-6 text-orange-400" />
              <ArrowDownRight className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">0.85</div>
            <div className="text-sm text-gray-300">kg CO₂/g Cannabis</div>
            <div className="text-xs text-green-400 mt-1">-22% carbon reduction</div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'operational', label: 'Operational', icon: Factory },
            { id: 'market', label: 'Market', icon: Globe },
            { id: 'sustainability', label: 'Sustainability', icon: Leaf }
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Performance Indicators */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Key Performance Indicators</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessMetrics
                  .filter(metric => selectedView === 'overview' || metric.category === selectedView)
                  .map(metric => (
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

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>{metric.period}</span>
                        {metric.target && (
                          <span>Target: {metric.target}{metric.unit}</span>
                        )}
                      </div>

                      {metric.change !== 0 && (
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${
                            (metric.trend === 'up' && metric.change > 0) || 
                            (metric.trend === 'down' && metric.change < 0)
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}{metric.changeUnit || ''}
                          </span>
                        </div>
                      )}

                      {metric.benchmark && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Industry avg:</span>
                            <span className="text-gray-400">{metric.benchmark}{metric.unit}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Investment Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Total Investment</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(roiAnalysis.investment)}</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Expected Returns</div>
                  <div className="text-xl font-bold text-green-400">{formatCurrency(roiAnalysis.returns)}</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Net Present Value</div>
                  <div className="text-xl font-bold text-blue-400">{formatCurrency(roiAnalysis.npv)}</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Internal Rate of Return</div>
                  <div className="text-xl font-bold text-purple-400">{roiAnalysis.irr}%</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Payback Period</div>
                  <div className="text-xl font-bold text-yellow-400">{roiAnalysis.paybackPeriod} months</div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">ROI</div>
                  <div className="text-xl font-bold text-green-400">{roiAnalysis.roi}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Market Insights
              </h2>
              
              <div className="space-y-4">
                {marketInsights.map(insight => (
                  <div key={insight.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {insight.type === 'threat' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        {insight.type === 'trend' && <Activity className="w-4 h-4 text-blue-500" />}
                        {insight.type === 'competitive' && <Users className="w-4 h-4 text-purple-500" />}
                        <span className="text-sm font-medium text-gray-300">{insight.title}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{insight.timeframe}</span>
                      {insight.actionRequired && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sustainability Metrics */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-400" />
                Sustainability Score
              </h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Carbon Footprint</span>
                    <span className="text-sm font-semibold text-green-400">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">22% below industry average</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Water Efficiency</span>
                    <span className="text-sm font-semibold text-blue-400">Good</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">15% improvement this month</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Renewable Energy</span>
                    <span className="text-sm font-semibold text-purple-400">Good</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">62% of total energy consumption</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}