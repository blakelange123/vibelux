'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calculator,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Droplets,
  Leaf,
  Package,
  Users,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
  Save,
  Play,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Percent,
  Hash,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  Briefcase,
  TrendingDown,
  Eye,
  EyeOff,
  Filter,
  Layers,
  Grid3x3,
  Award
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Sankey,
  ComposedChart,
  ReferenceLine,
  Scatter
} from 'recharts';

interface FarmConfiguration {
  name: string;
  cells: number;
  tiersPerCell: number;
  areaPerTier: number;
  crops: CropType[];
  location: string;
  laborCost: number;
  energyCost: number;
  waterCost: number;
  rentCost: number;
}

interface CropType {
  id: string;
  name: string;
  cycleTime: number;
  yieldPerCycle: number;
  pricePerKg: number;
  seedCost: number;
  nutrientCost: number;
  laborHours: number;
  marketDemand: 'high' | 'medium' | 'low';
}

interface FinancialMetrics {
  revenue: number;
  opex: number;
  capex: number;
  ebitda: number;
  netProfit: number;
  roi: number;
  paybackPeriod: number;
  irr: number;
  npv: number;
}

export function AdvancedBusinessModeling() {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'scenarios' | 'optimization'>('overview');
  const [timeHorizon, setTimeHorizon] = useState<1 | 3 | 5 | 10>(5);
  const [showConfidential, setShowConfidential] = useState(true);

  // Farm configuration
  const [farmConfig] = useState<FarmConfiguration>({
    name: 'Vibelux Vertical Farm',
    cells: 5,
    tiersPerCell: 12,
    areaPerTier: 100, // m²
    crops: [
      {
        id: 'lettuce',
        name: 'Lettuce',
        cycleTime: 35,
        yieldPerCycle: 150, // kg/m²/cycle
        pricePerKg: 6.5,
        seedCost: 0.15,
        nutrientCost: 0.25,
        laborHours: 0.5,
        marketDemand: 'high'
      },
      {
        id: 'herbs',
        name: 'Herbs',
        cycleTime: 28,
        yieldPerCycle: 80,
        pricePerKg: 18.5,
        seedCost: 0.35,
        nutrientCost: 0.30,
        laborHours: 0.8,
        marketDemand: 'high'
      },
      {
        id: 'tomatoes',
        name: 'Tomatoes',
        cycleTime: 90,
        yieldPerCycle: 200,
        pricePerKg: 4.5,
        seedCost: 0.25,
        nutrientCost: 0.45,
        laborHours: 1.2,
        marketDemand: 'medium'
      }
    ],
    location: 'Urban Industrial Zone',
    laborCost: 25, // $/hour
    energyCost: 0.12, // $/kWh
    waterCost: 0.003, // $/L
    rentCost: 15 // $/m²/month
  });

  // Calculate key metrics
  const totalGrowingArea = farmConfig.cells * farmConfig.tiersPerCell * farmConfig.areaPerTier;
  const annualCycles = 365 / farmConfig.crops[0].cycleTime;
  const annualProduction = totalGrowingArea * farmConfig.crops[0].yieldPerCycle * annualCycles;

  // Financial projections
  const [financialData] = useState(() => {
    const years = Array.from({ length: timeHorizon }, (_, i) => {
      const year = i + 1;
      const utilization = Math.min(0.4 + (i * 0.15), 0.95); // Ramp up over time
      const revenue = annualProduction * farmConfig.crops[0].pricePerKg * utilization;
      const opex = revenue * 0.65; // 65% OpEx ratio
      const ebitda = revenue - opex;
      
      return {
        year,
        revenue: revenue / 1000000, // Convert to millions
        opex: opex / 1000000,
        ebitda: ebitda / 1000000,
        netProfit: (ebitda * 0.75) / 1000000,
        cashFlow: (ebitda * 0.85) / 1000000,
        utilization: utilization * 100
      };
    });
    return years;
  });

  // Cost breakdown
  const [costBreakdown] = useState([
    { name: 'Labor', value: 28, color: '#3b82f6' },
    { name: 'Energy', value: 24, color: '#f59e0b' },
    { name: 'Seeds & Nutrients', value: 18, color: '#10b981' },
    { name: 'Rent & Facility', value: 15, color: '#8b5cf6' },
    { name: 'Maintenance', value: 8, color: '#ef4444' },
    { name: 'Other', value: 7, color: '#6b7280' }
  ]);

  // Revenue streams
  const [revenueStreams] = useState([
    { source: 'Retail Sales', percentage: 45, growth: 12 },
    { source: 'Restaurant Supply', percentage: 30, growth: 18 },
    { source: 'Grocery Chains', percentage: 20, growth: 8 },
    { source: 'Farmers Markets', percentage: 5, growth: 25 }
  ]);

  // Scenario analysis
  const [scenarios] = useState([
    {
      name: 'Conservative',
      utilization: 0.7,
      priceGrowth: 0.02,
      costGrowth: 0.03,
      npv: 2.8,
      irr: 0.18,
      payback: 4.2
    },
    {
      name: 'Base Case',
      utilization: 0.85,
      priceGrowth: 0.04,
      costGrowth: 0.03,
      npv: 5.4,
      irr: 0.28,
      payback: 3.1
    },
    {
      name: 'Optimistic',
      utilization: 0.95,
      priceGrowth: 0.06,
      costGrowth: 0.025,
      npv: 8.7,
      irr: 0.42,
      payback: 2.3
    }
  ]);

  // Calculate summary metrics
  const totalCapex = farmConfig.cells * 850000; // $850k per cell
  const avgAnnualRevenue = financialData.reduce((sum, year) => sum + year.revenue, 0) / financialData.length;
  const avgEbitdaMargin = financialData.reduce((sum, year) => sum + (year.ebitda / year.revenue), 0) / financialData.length * 100;

  const formatCurrency = (value: number, decimals = 1) => {
    return `$${value.toFixed(decimals)}M`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calculator className="w-8 h-8 text-green-500" />
              Advanced Business Modeling
            </h2>
            <p className="text-gray-400 mt-1">
              {farmConfig.cells}-cell vertical farm financial analysis and optimization
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Confidential</span>
              <button
                onClick={() => setShowConfidential(!showConfidential)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                {showConfidential ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value) as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value={1}>1 Year</option>
              <option value={3}>3 Years</option>
              <option value={5}>5 Years</option>
              <option value={10}>10 Years</option>
            </select>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export Model
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2">
          {['overview', 'detailed', 'scenarios', 'optimization'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-400">Facility</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalGrowingArea.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">m² Growing Area</p>
              <p className="text-xs text-gray-500 mt-1">{farmConfig.cells} cells × {farmConfig.tiersPerCell} tiers</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-400">Production</span>
              </div>
              <p className="text-2xl font-bold text-white">{(annualProduction / 1000).toFixed(0)}</p>
              <p className="text-gray-400 text-sm">Tons/Year</p>
              <p className="text-xs text-green-400 mt-1">At 85% utilization</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-400">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {showConfidential ? formatCurrency(avgAnnualRevenue) : '•••'}
              </p>
              <p className="text-gray-400 text-sm">Annual Average</p>
              <p className="text-xs text-green-400 mt-1">+15% YoY growth</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-400">EBITDA</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {showConfidential ? `${avgEbitdaMargin.toFixed(0)}%` : '•••'}
              </p>
              <p className="text-gray-400 text-sm">Margin</p>
              <p className="text-xs text-blue-400 mt-1">Industry avg: 25%</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-400">ROI</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {showConfidential ? '28%' : '•••'}
              </p>
              <p className="text-gray-400 text-sm">Annual Return</p>
              <p className="text-xs text-yellow-400 mt-1">3.1 yr payback</p>
            </div>
          </div>

          {/* Financial Projections Chart */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Financial Projections</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: 'Revenue/Costs ($M)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Utilization (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: any) => showConfidential ? value : '•••'}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar yAxisId="left" dataKey="opex" fill="#ef4444" name="Operating Costs" />
                <Line yAxisId="left" type="monotone" dataKey="ebitda" stroke="#3b82f6" strokeWidth={3} name="EBITDA" />
                <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" name="Utilization %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown & Revenue Streams */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Operating Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => showConfidential ? `${value}%` : '•••'}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {costBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400 text-sm">{item.name}</span>
                    <span className="text-white text-sm ml-auto">
                      {showConfidential ? `${item.value}%` : '•••'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Streams</h3>
              <div className="space-y-4">
                {revenueStreams.map((stream) => (
                  <div key={stream.source} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{stream.source}</span>
                      <span className="text-gray-400">
                        {showConfidential ? `${stream.percentage}%` : '•••'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${stream.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">YoY Growth</span>
                      <span className="text-green-400">+{stream.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'detailed' && (
        <>
          {/* Detailed Financial Analysis */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Financial Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Metric</th>
                    {financialData.map((year) => (
                      <th key={year.year} className="text-right py-3 px-4 text-gray-400 font-medium">
                        Year {year.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white">Revenue</td>
                    {financialData.map((year) => (
                      <td key={year.year} className="py-3 px-4 text-right text-gray-300">
                        {showConfidential ? formatCurrency(year.revenue) : '•••'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white">Operating Costs</td>
                    {financialData.map((year) => (
                      <td key={year.year} className="py-3 px-4 text-right text-gray-300">
                        {showConfidential ? formatCurrency(year.opex) : '•••'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white">EBITDA</td>
                    {financialData.map((year) => (
                      <td key={year.year} className="py-3 px-4 text-right text-green-400 font-medium">
                        {showConfidential ? formatCurrency(year.ebitda) : '•••'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white">Net Profit</td>
                    {financialData.map((year) => (
                      <td key={year.year} className="py-3 px-4 text-right text-gray-300">
                        {showConfidential ? formatCurrency(year.netProfit) : '•••'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4 text-white">Cash Flow</td>
                    {financialData.map((year) => (
                      <td key={year.year} className="py-3 px-4 text-right text-blue-400">
                        {showConfidential ? formatCurrency(year.cashFlow) : '•••'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white">Utilization %</td>
                    {financialData.map((year) => (
                      <td key={year.year} className="py-3 px-4 text-right text-gray-300">
                        {year.utilization.toFixed(0)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Unit Economics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h4 className="text-white font-medium mb-4">Per m² Economics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Annual Yield</span>
                  <span className="text-white">{(farmConfig.crops[0].yieldPerCycle * annualCycles).toFixed(0)} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Revenue</span>
                  <span className="text-white">
                    {showConfidential ? `$${(farmConfig.crops[0].yieldPerCycle * annualCycles * farmConfig.crops[0].pricePerKg).toFixed(0)}` : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Direct Costs</span>
                  <span className="text-white">
                    {showConfidential ? `$${((farmConfig.crops[0].seedCost + farmConfig.crops[0].nutrientCost) * farmConfig.crops[0].yieldPerCycle * annualCycles).toFixed(0)}` : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <span className="text-gray-400">Gross Margin</span>
                  <span className="text-green-400 font-medium">
                    {showConfidential ? '87%' : '•••'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h4 className="text-white font-medium mb-4">Per Kg Economics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sale Price</span>
                  <span className="text-white">${farmConfig.crops[0].pricePerKg.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Production Cost</span>
                  <span className="text-white">
                    {showConfidential ? '$1.85' : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Distribution</span>
                  <span className="text-white">
                    {showConfidential ? '$0.45' : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <span className="text-gray-400">Net Margin</span>
                  <span className="text-green-400 font-medium">
                    {showConfidential ? '$4.20' : '•••'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h4 className="text-white font-medium mb-4">Per Cell Economics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">CAPEX</span>
                  <span className="text-white">
                    {showConfidential ? '$850k' : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Annual Revenue</span>
                  <span className="text-white">
                    {showConfidential ? '$1.2M' : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Annual OPEX</span>
                  <span className="text-white">
                    {showConfidential ? '$780k' : '•••'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <span className="text-gray-400">Cell ROI</span>
                  <span className="text-green-400 font-medium">
                    {showConfidential ? '49%' : '•••'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'scenarios' && (
        <div className="space-y-6">
          {/* Scenario Comparison */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Scenario Analysis</h3>
            <div className="grid grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.name}
                  className={`bg-gray-800 rounded-lg p-6 border-2 ${
                    scenario.name === 'Base Case' ? 'border-purple-500' : 'border-gray-700'
                  }`}
                >
                  <h4 className="text-white font-medium text-lg mb-4">{scenario.name}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Utilization</span>
                      <span className="text-white">{(scenario.utilization * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Price Growth</span>
                      <span className="text-white">{(scenario.priceGrowth * 100).toFixed(0)}% p.a.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Cost Growth</span>
                      <span className="text-white">{(scenario.costGrowth * 100).toFixed(0)}% p.a.</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">NPV</span>
                        <span className="text-green-400 font-medium">
                          {showConfidential ? `$${scenario.npv}M` : '•••'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">IRR</span>
                        <span className="text-blue-400 font-medium">
                          {showConfidential ? `${(scenario.irr * 100).toFixed(0)}%` : '•••'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Payback</span>
                        <span className="text-yellow-400 font-medium">
                          {showConfidential ? `${scenario.payback} years` : '•••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity Analysis */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sensitivity Analysis</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={[
                    { factor: 'Sale Price ±10%', impact: 35 },
                    { factor: 'Energy Cost ±10%', impact: -24 },
                    { factor: 'Labor Cost ±10%', impact: -28 },
                    { factor: 'Yield ±10%', impact: 32 },
                    { factor: 'CAPEX ±10%', impact: -18 },
                    { factor: 'Utilization ±10%', impact: 30 }
                  ]}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" domain={[-40, 40]} />
                  <YAxis dataKey="factor" type="category" width={120} />
                  <Tooltip
                    formatter={(value: any) => showConfidential ? `${value}%` : '•••'}
                  />
                  <Bar dataKey="impact" fill="#10b981" />
                  <ReferenceLine x={0} stroke="#6b7280" />
                </RechartsBarChart>
              </ResponsiveContainer>
              <p className="text-gray-400 text-sm mt-4">
                Impact on NPV from ±10% change in each factor
              </p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'optimization' && (
        <div className="space-y-6">
          {/* Optimization Recommendations */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Optimization Opportunities
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Energy Efficiency</h4>
                    <span className="text-green-400 text-sm">+$450k/year</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Implement advanced LED control and heat recovery systems
                  </p>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-300 text-sm">Reduce energy cost by 18%</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Crop Mix Optimization</h4>
                    <span className="text-green-400 text-sm">+$680k/year</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Shift 30% production to high-value herbs and microgreens
                  </p>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300 text-sm">Increase revenue per m² by 22%</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Automation Upgrade</h4>
                    <span className="text-green-400 text-sm">+$320k/year</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Automated seeding, transplanting, and harvesting
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-300 text-sm">Reduce labor hours by 40%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Optimization Impact</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400">Current EBITDA</span>
                      <span className="text-white">
                        {showConfidential ? '$1.89M' : '•••'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400">Optimization Potential</span>
                      <span className="text-green-400">
                        {showConfidential ? '+$1.45M' : '•••'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                      <span className="text-gray-400">Optimized EBITDA</span>
                      <span className="text-white font-medium text-lg">
                        {showConfidential ? '$3.34M' : '•••'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">New ROI</span>
                      <span className="text-green-400 font-medium text-2xl">
                        {showConfidential ? '47%' : '•••'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Payback Period</span>
                      <span className="text-yellow-400 font-medium">
                        {showConfidential ? '2.1 years' : '•••'}
                      </span>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Play className="w-4 h-4" />
                    Generate Implementation Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Timeline */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Implementation Roadmap</h3>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              <div className="space-y-6">
                {[
                  { month: 'Month 1-2', task: 'Energy audit and LED upgrade planning', cost: '$150k', impact: 'Quick win' },
                  { month: 'Month 3-4', task: 'Crop mix transition and market development', cost: '$80k', impact: 'High impact' },
                  { month: 'Month 5-8', task: 'Automation system installation', cost: '$450k', impact: 'Long-term' },
                  { month: 'Month 9-12', task: 'Full optimization and fine-tuning', cost: '$50k', impact: 'Sustained' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{item.month}</h4>
                        <span className="text-gray-400">{item.cost}</span>
                      </div>
                      <p className="text-gray-300">{item.task}</p>
                      <p className="text-sm text-purple-400 mt-1">{item.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}