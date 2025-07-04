"use client"

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface EconomicsChartProps {
  roiMetrics: {
    setupCost: number
    annualOperatingCost: number
    annualRevenue: number
    paybackPeriod: number
    fiveYearNPV: number
    irrPercent: number
  }
  energyMetrics: {
    totalLightingPower: number
    hvacLoad: number
    totalPowerDraw: number
    annualEnergyCost: number
  }
}

export function VerticalFarmingEconomicsChart({ roiMetrics, energyMetrics }: EconomicsChartProps) {
  // Generate cash flow projection data
  const cashFlowData = []
  let cumulativeCashFlow = -roiMetrics.setupCost
  
  for (let year = 0; year <= 10; year++) {
    if (year === 0) {
      cashFlowData.push({
        year: `Year ${year}`,
        cashFlow: -roiMetrics.setupCost,
        cumulative: cumulativeCashFlow,
        revenue: 0,
        operating: 0
      })
    } else {
      const annualProfit = roiMetrics.annualRevenue - roiMetrics.annualOperatingCost
      cumulativeCashFlow += annualProfit
      cashFlowData.push({
        year: `Year ${year}`,
        cashFlow: annualProfit,
        cumulative: cumulativeCashFlow,
        revenue: roiMetrics.annualRevenue,
        operating: -roiMetrics.annualOperatingCost
      })
    }
  }

  // Cost breakdown data for pie chart
  const costBreakdown = [
    { name: 'Electricity', value: energyMetrics.annualEnergyCost, color: '#FBBF24' },
    { name: 'Labor', value: roiMetrics.annualOperatingCost - energyMetrics.annualEnergyCost, color: '#8B5CF6' },
    { name: 'Water & Nutrients', value: roiMetrics.annualOperatingCost * 0.15, color: '#3B82F6' },
    { name: 'Maintenance', value: roiMetrics.annualOperatingCost * 0.1, color: '#10B981' },
    { name: 'Other', value: roiMetrics.annualOperatingCost * 0.05, color: '#6B7280' }
  ]

  // Monthly revenue projection
  const monthlyData = []
  const monthlyRevenue = roiMetrics.annualRevenue / 12
  const monthlyCost = roiMetrics.annualOperatingCost / 12
  
  for (let month = 1; month <= 12; month++) {
    monthlyData.push({
      month: `M${month}`,
      revenue: monthlyRevenue,
      costs: monthlyCost,
      profit: monthlyRevenue - monthlyCost
    })
  }

  return (
    <div className="space-y-6">
      {/* Cash Flow Projection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">10-Year Cash Flow Projection</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#10B981" 
                fill="url(#cumulativeGradient)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="cashFlow" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Break Even</p>
            <p className="text-lg font-semibold text-white">{roiMetrics.paybackPeriod.toFixed(1)} years</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">5-Year NPV</p>
            <p className="text-lg font-semibold text-green-400">${(roiMetrics.fiveYearNPV / 1000000).toFixed(2)}M</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">IRR</p>
            <p className="text-lg font-semibold text-purple-400">{roiMetrics.irrPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Operating Cost Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Annual Operating Costs</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
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
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-white">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Monthly Performance</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="#10B981" />
                <Bar dataKey="costs" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-400">Monthly Revenue</p>
              <p className="text-lg font-semibold text-green-400">${(monthlyRevenue / 1000).toFixed(1)}k</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Monthly Profit</p>
              <p className="text-lg font-semibold text-white">${((monthlyRevenue - monthlyCost) / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}