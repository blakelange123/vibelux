'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Layers,
  Target,
  ChevronRight,
  Clock,
  DollarSign,
  Leaf,
  Activity,
  Zap,
  Droplets,
  ThermometerSun,
  Wind,
  Award
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface CultivationInsight {
  id: string;
  type: 'optimization' | 'anomaly' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  impact: {
    yield?: number;
    cost?: number;
    quality?: number;
    time?: number;
  };
  confidence: number;
  dataSource: string[];
  suggestedActions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface StrainPerformance {
  strain: string;
  avgYield: number;
  avgQuality: number;
  avgCycleTime: number;
  profitability: number;
  environmentalFit: number;
}

interface CrossFacilityBenchmark {
  metric: string;
  yourFacility: number;
  industryAvg: number;
  topPerformers: number;
  percentile: number;
}

export function CultivationInsightsHub() {
  const [activeTab, setActiveTab] = useState<'insights' | 'strains' | 'benchmarks' | 'experiments'>('insights');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedStrain, setSelectedStrain] = useState<string | null>(null);

  // AI-generated insights that connect all systems
  const insights: CultivationInsight[] = [
    {
      id: 'ins-1',
      type: 'optimization',
      title: 'VPD Optimization Opportunity in Flower B',
      description: 'ML model detected suboptimal VPD during hours 10-14. Adjusting temperature by +2°F and humidity by -5% could increase trichome production.',
      impact: { yield: 3, quality: 8, cost: -150 },
      confidence: 87,
      dataSource: ['Environmental sensors', 'Yield tracking', 'Historical batches'],
      suggestedActions: [
        'Adjust HVAC setpoints for midday period',
        'Monitor trichome development over next 48h',
        'Compare with Batch #2024-089 which had optimal VPD'
      ],
      priority: 'high'
    },
    {
      id: 'ins-2',
      type: 'anomaly',
      title: 'Unusual Nutrient Uptake Pattern Detected',
      description: 'Strain "Purple Haze" showing 20% higher nitrogen uptake than historical average in week 3 of flower. May indicate exceptional vigor or stress response.',
      impact: { yield: 5, quality: 0, cost: 200 },
      confidence: 92,
      dataSource: ['Irrigation sensors', 'Lab results', 'Plant vision AI'],
      suggestedActions: [
        'Conduct tissue analysis within 24 hours',
        'Review recent environmental changes',
        'Adjust nutrient concentration if confirmed'
      ],
      priority: 'medium'
    },
    {
      id: 'ins-3',
      type: 'opportunity',
      title: 'Energy Savings Through Dynamic Light Scheduling',
      description: 'Analysis shows 18% energy reduction possible by shifting 2 hours of photoperiod to off-peak rates without affecting DLI targets.',
      impact: { cost: -2400, yield: 0, quality: 0 },
      confidence: 95,
      dataSource: ['Power monitoring', 'Utility rates', 'Growth models'],
      suggestedActions: [
        'Implement dynamic scheduling for next cycle',
        'Monitor plant stress indicators',
        'Calculate ROI over 6-month period'
      ],
      priority: 'medium'
    },
    {
      id: 'ins-4',
      type: 'achievement',
      title: 'Record Quality Score Achieved',
      description: 'Batch #2024-112 achieved 98.5% quality score - highest in facility history. Environmental conditions and practices have been documented for replication.',
      impact: { quality: 98.5, yield: 0, cost: 0 },
      confidence: 100,
      dataSource: ['Lab testing', 'Quality control', 'Customer feedback'],
      suggestedActions: [
        'Create SOP from this batch\'s practices',
        'Train team on successful techniques',
        'Apply learnings to similar strains'
      ],
      priority: 'low'
    }
  ];

  // Strain performance comparison
  const strainPerformance: StrainPerformance[] = [
    {
      strain: 'Blue Dream',
      avgYield: 68.5,
      avgQuality: 92,
      avgCycleTime: 63,
      profitability: 145,
      environmentalFit: 88
    },
    {
      strain: 'Purple Haze',
      avgYield: 62.3,
      avgQuality: 94,
      avgCycleTime: 70,
      profitability: 132,
      environmentalFit: 82
    },
    {
      strain: 'OG Kush',
      avgYield: 71.2,
      avgQuality: 89,
      avgCycleTime: 65,
      profitability: 156,
      environmentalFit: 91
    },
    {
      strain: 'White Widow',
      avgYield: 65.8,
      avgQuality: 91,
      avgCycleTime: 60,
      profitability: 148,
      environmentalFit: 85
    },
    {
      strain: 'Gorilla Glue',
      avgYield: 69.4,
      avgQuality: 95,
      avgCycleTime: 68,
      profitability: 162,
      environmentalFit: 87
    }
  ];

  // Cross-facility benchmarking
  const benchmarks: CrossFacilityBenchmark[] = [
    { metric: 'Yield (g/sqft)', yourFacility: 65.3, industryAvg: 55.2, topPerformers: 72.8, percentile: 78 },
    { metric: 'Energy (kWh/g)', yourFacility: 45.2, industryAvg: 58.3, topPerformers: 38.5, percentile: 71 },
    { metric: 'Water (L/g)', yourFacility: 3.8, industryAvg: 5.2, topPerformers: 3.2, percentile: 82 },
    { metric: 'Quality Score', yourFacility: 92, industryAvg: 86, topPerformers: 96, percentile: 85 },
    { metric: 'Cost per Gram', yourFacility: 1.85, industryAvg: 2.45, topPerformers: 1.52, percentile: 79 },
    { metric: 'Cycle Time (days)', yourFacility: 65, industryAvg: 70, topPerformers: 62, percentile: 75 }
  ];

  // Experimental tracking data
  const experimentData = [
    {
      id: 'exp-1',
      name: 'UV-B Supplementation Trial',
      status: 'active',
      progress: 65,
      startDate: '2024-10-15',
      hypothesis: 'Adding UV-B in final 2 weeks increases trichome production by 15%',
      controlGroup: 'Batch-2024-118A',
      testGroup: 'Batch-2024-118B',
      metrics: {
        trichomeDensity: '+12%',
        terpeneProfile: '+8%',
        yieldImpact: '-2%',
        confidence: 78
      }
    },
    {
      id: 'exp-2',
      name: 'Drought Stress Protocol',
      status: 'completed',
      progress: 100,
      startDate: '2024-09-01',
      hypothesis: 'Controlled drought stress in week 7 improves resin production',
      results: {
        success: true,
        resinIncrease: '+18%',
        yieldImpact: '-5%',
        recommendedProtocol: 'Reduce irrigation by 30% for 5 days in week 7'
      }
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Lightbulb className="w-5 h-5" />;
      case 'anomaly': return <AlertCircle className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'achievement': return <Award className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'anomaly': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'opportunity': return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'achievement': return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cultivation Insights Hub</h2>
          <p className="text-gray-400">AI-powered insights connecting all your systems</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Brain className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['insights', 'strains', 'benchmarks', 'experiments'].map((tab) => (
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

      {activeTab === 'insights' && (
        <>
          {/* Insight Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Active Insights</span>
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{insights.length}</p>
              <p className="text-sm text-gray-500">2 critical</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Potential Savings</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">$4.8K</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Yield Impact</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">+8%</p>
              <p className="text-sm text-gray-500">If implemented</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg Confidence</span>
                <Activity className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">91%</p>
              <p className="text-sm text-gray-500">ML accuracy</p>
            </div>
          </div>

          {/* Insight Cards */}
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-6 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                        <p className="text-gray-300 mt-1">{insight.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'critical' ? 'bg-red-900/20 text-red-400' :
                        insight.priority === 'high' ? 'bg-orange-900/20 text-orange-400' :
                        insight.priority === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-green-900/20 text-green-400'
                      }`}>
                        {insight.priority} priority
                      </span>
                    </div>

                    {/* Impact Metrics */}
                    <div className="flex items-center gap-6 mt-4 text-sm">
                      {insight.impact.yield && (
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Yield:</span>
                          <span className={`font-medium ${insight.impact.yield > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {insight.impact.yield > 0 ? '+' : ''}{insight.impact.yield}%
                          </span>
                        </div>
                      )}
                      {insight.impact.cost && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">Cost:</span>
                          <span className={`font-medium ${insight.impact.cost < 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${Math.abs(insight.impact.cost)}
                          </span>
                        </div>
                      )}
                      {insight.impact.quality && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">Quality:</span>
                          <span className="font-medium text-purple-400">
                            {insight.impact.quality > 0 ? '+' : ''}{insight.impact.quality}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Data Sources */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Data sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.dataSource.map((source, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Actions */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-300 mb-2">Recommended Actions:</p>
                      <div className="space-y-2">
                        {insight.suggestedActions.map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-300">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">ML Confidence</span>
                        <span className="text-white font-medium">{insight.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'strains' && (
        <>
          {/* Strain Performance Matrix */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Strain Performance Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Strain</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Avg Yield (g/sqft)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Quality Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Cycle Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Profitability Index</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Environmental Fit</th>
                  </tr>
                </thead>
                <tbody>
                  {strainPerformance.map((strain) => (
                    <tr
                      key={strain.strain}
                      className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => setSelectedStrain(strain.strain)}
                    >
                      <td className="px-4 py-3 font-medium text-white">{strain.strain}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{strain.avgYield}</span>
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(strain.avgYield / 80) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${
                          strain.avgQuality >= 94 ? 'text-purple-400' :
                          strain.avgQuality >= 90 ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {strain.avgQuality}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{strain.avgCycleTime} days</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${
                          strain.profitability >= 150 ? 'text-green-400' :
                          strain.profitability >= 140 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {strain.profitability}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            strain.environmentalFit >= 90 ? 'bg-green-400' :
                            strain.environmentalFit >= 85 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`} />
                          <span className="text-gray-300">{strain.environmentalFit}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strain Recommendations */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">AI Strain Recommendations</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Best for Your Environment</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">OG Kush</span>
                    <span className="text-green-400 text-sm">91% match</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">Blue Dream</span>
                    <span className="text-green-400 text-sm">88% match</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Highest ROI Potential</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">Gorilla Glue</span>
                    <span className="text-purple-400 text-sm">$162/sqft</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">OG Kush</span>
                    <span className="text-purple-400 text-sm">$156/sqft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'benchmarks' && (
        <>
          {/* Benchmark Overview */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Industry Benchmarking</h3>
            <div className="space-y-4">
              {benchmarks.map((benchmark, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{benchmark.metric}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      benchmark.percentile >= 80 ? 'bg-green-900/20 text-green-400' :
                      benchmark.percentile >= 60 ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {benchmark.percentile}th percentile
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Your Facility</p>
                      <p className="text-xl font-bold text-white">{benchmark.yourFacility}</p>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-3"></div>
                        </div>
                        <div className="relative flex items-center">
                          <div
                            className="bg-purple-500 rounded-full h-3"
                            style={{ width: `${(benchmark.yourFacility / benchmark.topPerformers) * 100}%` }}
                          />
                          <div
                            className="absolute w-0.5 h-5 bg-gray-400"
                            style={{ left: `${(benchmark.industryAvg / benchmark.topPerformers) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0</span>
                        <span className="text-xs text-gray-400">Industry Avg</span>
                        <span className="text-xs text-green-400">Top 10%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400">Top 10%</p>
                      <p className="text-xl font-bold text-green-400">{benchmark.topPerformers}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Opportunities */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Path to Top Performance</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h4 className="font-medium text-blue-300">Energy Efficiency</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Implementing dynamic light scheduling could reduce energy usage by 17% to match top performers
                </p>
                <p className="text-xs text-gray-400 mt-2">Potential savings: $3,600/month</p>
              </div>
              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <h4 className="font-medium text-green-300">Yield Optimization</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Achieving top 10% yield requires 7.5 g/sqft improvement - achievable through VPD optimization
                </p>
                <p className="text-xs text-gray-400 mt-2">Potential revenue: +$15,000/month</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'experiments' && (
        <>
          {/* Active Experiments */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Cultivation Experiments</h3>
            <div className="space-y-4">
              {experimentData.map((exp) => (
                <div key={exp.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{exp.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      exp.status === 'active' ? 'bg-green-900/20 text-green-400' :
                      exp.status === 'completed' ? 'bg-blue-900/20 text-blue-400' :
                      'bg-gray-900/20 text-gray-400'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  
                  {exp.status === 'active' ? (
                    <>
                      <p className="text-sm text-gray-300 mb-3">{exp.hypothesis}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{exp.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${exp.progress}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-400">Control Group</p>
                            <p className="text-sm text-white">{exp.controlGroup}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Test Group</p>
                            <p className="text-sm text-white">{exp.testGroup}</p>
                          </div>
                        </div>
                        {exp.metrics && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-2">Preliminary Results:</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-green-400">Trichomes: {exp.metrics.trichomeDensity}</span>
                              <span className="text-blue-400">Terpenes: {exp.metrics.terpeneProfile}</span>
                              <span className="text-yellow-400">Yield: {exp.metrics.yieldImpact}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-300 mb-3">{exp.hypothesis}</p>
                      {exp.results && (
                        <div className="bg-gray-900 rounded-lg p-3">
                          <p className="text-sm font-medium text-white mb-2">
                            Result: {exp.results.success ? 'Success' : 'Failed'}
                          </p>
                          <div className="space-y-1 text-sm">
                            <p className="text-green-400">Resin increase: {exp.results.resinIncrease}</p>
                            <p className="text-yellow-400">Yield impact: {exp.results.yieldImpact}</p>
                            <p className="text-gray-300 mt-2">{exp.results.recommendedProtocol}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experiment Ideas */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">AI-Suggested Experiments</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Far-Red EOD Treatment</p>
                  <p className="text-sm text-gray-300">
                    15 minutes of far-red light at end-of-day could accelerate flowering by 3-5 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">CO2 Ramping Protocol</p>
                  <p className="text-sm text-gray-300">
                    Gradually increase CO2 from 800 to 1200 ppm over flowering weeks 2-6
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}