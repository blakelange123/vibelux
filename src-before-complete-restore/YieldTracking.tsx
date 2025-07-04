"use client"

import { useState } from 'react'
import { TrendingUp, DollarSign, Zap, Package, Calendar, Award, BarChart3, PieChart } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Harvest {
  id: string
  batchId: string
  strain: string
  roomId: string
  harvestDate: string
  wetWeight: number // grams
  dryWeight: number // grams
  trimWeight: number // grams
  wasteWeight: number // grams
  plantCount: number
  squareFeet: number
  lightingWatts: number
  totalKwhUsed: number
  nutrientsCost: number
  laborHours: number
  quality: 'A+' | 'A' | 'B' | 'C'
}

interface Analytics {
  gramsPerWatt: number
  gramsPerSqFt: number
  costPerGram: number
  kwhPerGram: number
  trimRatio: number
  wasteRatio: number
}

export function YieldTracking() {
  const [harvests] = useState<Harvest[]>([
    {
      id: 'harvest-1',
      batchId: 'BATCH-2024-001',
      strain: 'Blue Dream',
      roomId: 'Flower Room A',
      harvestDate: '2024-01-15',
      wetWeight: 4500,
      dryWeight: 900,
      trimWeight: 180,
      wasteWeight: 45,
      plantCount: 12,
      squareFeet: 64,
      lightingWatts: 1200,
      totalKwhUsed: 1450,
      nutrientsCost: 245,
      laborHours: 32,
      quality: 'A+'
    },
    {
      id: 'harvest-2',
      batchId: 'BATCH-2024-002',
      strain: 'OG Kush',
      roomId: 'Flower Room B',
      harvestDate: '2024-02-01',
      wetWeight: 3800,
      dryWeight: 760,
      trimWeight: 152,
      wasteWeight: 38,
      plantCount: 10,
      squareFeet: 48,
      lightingWatts: 900,
      totalKwhUsed: 1100,
      nutrientsCost: 198,
      laborHours: 28,
      quality: 'A'
    }
  ])

  const calculateAnalytics = (harvest: Harvest): Analytics => {
    const totalUsableWeight = harvest.dryWeight - harvest.wasteWeight
    const gramsPerWatt = totalUsableWeight / harvest.lightingWatts
    const gramsPerSqFt = totalUsableWeight / harvest.squareFeet
    const kwhPerGram = harvest.totalKwhUsed / totalUsableWeight
    
    // Estimate costs
    const electricityCost = harvest.totalKwhUsed * 0.12 // $0.12 per kWh
    const laborCost = harvest.laborHours * 25 // $25 per hour
    const totalCost = electricityCost + harvest.nutrientsCost + laborCost
    const costPerGram = totalCost / totalUsableWeight
    
    const trimRatio = (harvest.trimWeight / harvest.dryWeight) * 100
    const wasteRatio = (harvest.wasteWeight / harvest.dryWeight) * 100

    return {
      gramsPerWatt,
      gramsPerSqFt,
      costPerGram,
      kwhPerGram,
      trimRatio,
      wasteRatio
    }
  }

  // Calculate totals and averages
  const totalDryWeight = harvests.reduce((sum, h) => sum + h.dryWeight, 0)
  const totalRevenue = totalDryWeight * 5 // $5 per gram wholesale
  const avgGramsPerWatt = harvests.reduce((sum, h) => 
    sum + calculateAnalytics(h).gramsPerWatt, 0) / harvests.length
  const avgGramsPerSqFt = harvests.reduce((sum, h) => 
    sum + calculateAnalytics(h).gramsPerSqFt, 0) / harvests.length

  // Monthly yield data
  const monthlyYieldData = [
    { month: 'Jan', yield: 900, target: 850 },
    { month: 'Feb', yield: 760, target: 850 },
    { month: 'Mar', yield: 920, target: 900 },
    { month: 'Apr', yield: 980, target: 900 },
    { month: 'May', yield: 1050, target: 950 },
    { month: 'Jun', yield: 1100, target: 1000 }
  ]

  // Strain distribution
  const strainDistribution = [
    { name: 'Blue Dream', value: 35, color: '#8B5CF6' },
    { name: 'OG Kush', value: 25, color: '#10B981' },
    { name: 'Girl Scout Cookies', value: 20, color: '#F59E0B' },
    { name: 'Gorilla Glue', value: 20, color: '#EF4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">+12%</span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Total Yield (YTD)</p>
          <p className="text-2xl font-bold text-white">
            {(totalDryWeight / 1000).toFixed(1)} kg
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">+8%</span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Revenue (YTD)</p>
          <p className="text-2xl font-bold text-white">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-yellow-400">+5%</span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Grams per Watt</p>
          <p className="text-2xl font-bold text-white">
            {avgGramsPerWatt.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-400">+15%</span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Grams per Sq Ft</p>
          <p className="text-2xl font-bold text-white">
            {avgGramsPerSqFt.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Monthly Yield Trend */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Monthly Yield Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyYieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6' }}
                name="Actual Yield (g)"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981' }}
                name="Target (g)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strain Performance */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            Strain Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={strainDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {strainDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {strainDistribution.map((strain) => (
              <div key={strain.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: strain.color }}
                  />
                  <span className="text-sm text-gray-300">{strain.name}</span>
                </div>
                <span className="text-sm text-white font-medium">{strain.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            Cost Breakdown per Gram
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: 'Electricity', cost: 1.2 },
                { category: 'Nutrients', cost: 0.8 },
                { category: 'Labor', cost: 2.1 },
                { category: 'Other', cost: 0.9 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => `$${value}`}
                />
                <Bar dataKey="cost" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Cost per Gram</span>
              <span className="text-lg font-semibold text-white">$5.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Harvests */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Harvests
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Batch ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Strain</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Dry Weight</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">g/W</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Quality</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">$/g</th>
              </tr>
            </thead>
            <tbody>
              {harvests.map((harvest) => {
                const analytics = calculateAnalytics(harvest)
                return (
                  <tr key={harvest.id} className="border-b border-gray-800/50">
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {harvest.batchId}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {harvest.strain}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {new Date(harvest.harvestDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-white">
                      {harvest.dryWeight}g
                    </td>
                    <td className="py-3 px-4 text-sm text-white">
                      {analytics.gramsPerWatt.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        harvest.quality === 'A+' ? 'bg-green-900/20 text-green-400' :
                        harvest.quality === 'A' ? 'bg-blue-900/20 text-blue-400' :
                        harvest.quality === 'B' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-red-900/20 text-red-400'
                      }`}>
                        {harvest.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white">
                      ${analytics.costPerGram.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-green-900/20 to-purple-900/20 rounded-xl p-6 border border-green-600/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-green-400" />
          Performance Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">Top Performing Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-sm text-gray-300">Blue Dream - Flower Room A</span>
                <span className="text-sm font-medium text-green-400">0.75 g/W</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-sm text-gray-300">Grams per Sq Ft Average</span>
                <span className="text-sm font-medium text-green-400">14.1 g/ft²</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-sm text-gray-300">Quality A+ Rate</span>
                <span className="text-sm font-medium text-green-400">68%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">Optimization Opportunities</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">Reduce Labor Costs</p>
                  <p className="text-xs text-gray-400">
                    Automate trimming to save 15% on labor costs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">Improve Energy Efficiency</p>
                  <p className="text-xs text-gray-400">
                    Upgrade to LED fixtures for 30% energy savings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}