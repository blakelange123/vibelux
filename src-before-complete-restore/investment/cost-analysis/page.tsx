'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Package,
  Users,
  Wrench,
  Droplets,
  Thermometer,
  Calculator,
  FileText,
  ChevronRight,
  Info,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Sankey
} from 'recharts';

interface CostCategory {
  name: string;
  current: number;
  baseline: number;
  potential: number;
  percentOfRevenue: number;
  trend: 'up' | 'down' | 'stable';
  improvementPotential: number;
}

interface FacilityCosts {
  facilityId: string;
  facilityName: string;
  totalRevenue: number;
  netMargin: number;
  categories: CostCategory[];
}

export default function CostAnalysisPage() {
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [timeRange, setTimeRange] = useState('6m');
  const [showPotential, setShowPotential] = useState(true);
  
  // Mock cost data
  const facilityCosts: FacilityCosts = {
    facilityId: '1',
    facilityName: 'Green Valley Farms - Lettuce Production',
    totalRevenue: 180000,
    netMargin: 15.2,
    categories: [
      {
        name: 'Energy',
        current: 28000,
        baseline: 35000,
        potential: 22000,
        percentOfRevenue: 15.6,
        trend: 'down',
        improvementPotential: 21.4
      },
      {
        name: 'Labor',
        current: 45000,
        baseline: 48000,
        potential: 38000,
        percentOfRevenue: 25.0,
        trend: 'stable',
        improvementPotential: 15.6
      },
      {
        name: 'Nutrients',
        current: 12000,
        baseline: 15000,
        potential: 9500,
        percentOfRevenue: 6.7,
        trend: 'down',
        improvementPotential: 20.8
      },
      {
        name: 'Water',
        current: 3500,
        baseline: 4200,
        potential: 2800,
        percentOfRevenue: 1.9,
        trend: 'down',
        improvementPotential: 20.0
      },
      {
        name: 'Maintenance',
        current: 8000,
        baseline: 7500,
        potential: 6500,
        percentOfRevenue: 4.4,
        trend: 'up',
        improvementPotential: 18.8
      },
      {
        name: 'Other OpEx',
        current: 15000,
        baseline: 16000,
        potential: 12000,
        percentOfRevenue: 8.3,
        trend: 'stable',
        improvementPotential: 20.0
      }
    ]
  };
  
  const totalCurrentCosts = facilityCosts.categories.reduce((sum, cat) => sum + cat.current, 0);
  const totalPotentialCosts = facilityCosts.categories.reduce((sum, cat) => sum + cat.potential, 0);
  const totalSavingsPotential = totalCurrentCosts - totalPotentialCosts;
  const yieldUpsidePotential = 35; // percentage
  
  // Cost trend data
  const costTrendData = [
    { month: 'Jan', energy: 32000, labor: 46000, nutrients: 13000, total: 115000 },
    { month: 'Feb', energy: 31000, labor: 45500, nutrients: 12800, total: 113000 },
    { month: 'Mar', energy: 30000, labor: 45000, nutrients: 12500, total: 111500 },
    { month: 'Apr', energy: 29000, labor: 45000, nutrients: 12200, total: 110000 },
    { month: 'May', energy: 28500, labor: 45000, nutrients: 12000, total: 108500 },
    { month: 'Jun', energy: 28000, labor: 45000, nutrients: 12000, total: 107000 }
  ];
  
  // Upside calculation
  const currentProfit = facilityCosts.totalRevenue - totalCurrentCosts;
  const potentialRevenue = facilityCosts.totalRevenue * (1 + yieldUpsidePotential / 100);
  const potentialProfit = potentialRevenue - totalPotentialCosts;
  const totalUpside = potentialProfit - currentProfit;
  const investorShare = totalUpside * 0.5; // 50% share
  
  // Sankey data for cost flow
  const sankeyData = {
    nodes: [
      { name: 'Revenue' },
      { name: 'Costs' },
      { name: 'Profit' },
      { name: 'Energy' },
      { name: 'Labor' },
      { name: 'Materials' },
      { name: 'Other' }
    ],
    links: [
      { source: 0, target: 1, value: totalCurrentCosts },
      { source: 0, target: 2, value: currentProfit },
      { source: 1, target: 3, value: 28000 },
      { source: 1, target: 4, value: 45000 },
      { source: 1, target: 5, value: 15500 },
      { source: 1, target: 6, value: 23000 }
    ]
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Cost Analysis & Upside Extraction</h1>
              <p className="text-gray-400">Identify true profit potential from operations</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="bg-gray-800 text-sm px-4 py-2 rounded-lg"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Facility Selector */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="w-5 h-5 text-gray-400" />
              <select className="bg-gray-700 px-4 py-2 rounded-lg">
                <option>Green Valley Farms - Lettuce Production</option>
                <option>Urban Harvest Co - Tomato Facility</option>
                <option>SunRise Growers - Herb Gardens</option>
              </select>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Revenue:</span>
                <span className="ml-2 font-medium">${facilityCosts.totalRevenue.toLocaleString()}/mo</span>
              </div>
              <div>
                <span className="text-gray-400">Net Margin:</span>
                <span className="ml-2 font-medium text-green-400">{facilityCosts.netMargin}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upside Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-400" />
              <span className="text-xs bg-green-600/20 px-2 py-1 rounded-full text-green-400">
                Total Upside
              </span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${totalUpside.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-2">Per month potential</div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">Your 50% Share:</div>
              <div className="text-xl font-semibold text-green-400">
                ${investorShare.toLocaleString()}/mo
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-2xl font-bold">
              ${totalSavingsPotential.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Cost Reduction Potential</div>
            <div className="mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Current</span>
                <span>${totalCurrentCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Potential</span>
                <span className="text-green-400">${totalPotentialCosts.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold">+{yieldUpsidePotential}%</div>
            <div className="text-sm text-gray-400">Yield Improvement</div>
            <div className="mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Current Yield</span>
                <span>4.8 kg/m²</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Potential</span>
                <span className="text-green-400">6.5 kg/m²</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Percent className="w-8 h-8 text-yellow-400" />
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">2.8x</div>
            <div className="text-sm text-gray-400">ROI Multiple</div>
            <div className="mt-4 text-xs text-gray-500">
              Based on 24-month projection with 50% revenue share
            </div>
          </motion.div>
        </div>
        
        {/* Cost Breakdown Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cost Categories */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Cost Breakdown & Opportunities</h3>
              <button
                onClick={() => setShowPotential(!showPotential)}
                className="text-sm text-gray-400 hover:text-white"
              >
                {showPotential ? 'Hide' : 'Show'} Potential
              </button>
            </div>
            
            <div className="space-y-4">
              {facilityCosts.categories.map((category) => (
                <div key={category.name} className="border-b border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        category.trend === 'up' ? 'bg-red-400' : 
                        category.trend === 'down' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <span className="font-medium">{category.name}</span>
                      {category.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                      {category.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${category.current.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{category.percentOfRevenue}% of revenue</div>
                    </div>
                  </div>
                  
                  {showPotential && (
                    <div className="ml-5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Industry Baseline</span>
                        <span>${category.baseline.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Optimization Potential</span>
                        <span className="text-green-400">${category.potential.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all"
                          style={{ width: `${100 - category.improvementPotential}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Current</span>
                        <span>{category.improvementPotential.toFixed(1)}% savings possible</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Cost Trend Chart */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6">Cost Trend Analysis</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                <Line type="monotone" dataKey="labor" stroke="#3b82f6" strokeWidth={2} name="Labor" />
                <Line type="monotone" dataKey="nutrients" stroke="#10b981" strokeWidth={2} name="Nutrients" />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Action Items */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            Recommended Actions to Capture Upside
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Energy Optimization</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Implement smart lighting schedules and upgrade to latest LED technology
                  </p>
                  <div className="text-sm">
                    <span className="text-gray-500">Potential Savings:</span>
                    <span className="ml-2 text-green-400 font-medium">$6,000/mo</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Labor Efficiency</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Automation of repetitive tasks and optimized scheduling
                  </p>
                  <div className="text-sm">
                    <span className="text-gray-500">Potential Savings:</span>
                    <span className="ml-2 text-green-400 font-medium">$7,000/mo</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Droplets className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Resource Management</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Precision fertigation and water recycling systems
                  </p>
                  <div className="text-sm">
                    <span className="text-gray-500">Potential Savings:</span>
                    <span className="ml-2 text-green-400 font-medium">$3,200/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-400">Total Monthly Upside Potential</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Combined cost savings and yield improvements
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">${totalUpside.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Your share: ${investorShare.toLocaleString()}/mo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}