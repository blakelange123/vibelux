"use client"

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Calendar,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Receipt,
  Package,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface RevenueMetrics {
  mrr: number
  mrrGrowth: number
  arr: number
  arrGrowth: number
  totalRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  ltv: number
  cac: number
  paybackPeriod: number
}

interface SubscriptionBreakdown {
  tier: string
  count: number
  revenue: number
  percentage: number
  color: string
}

interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  type: 'subscription' | 'one-time' | 'usage'
  description: string
  createdAt: string
  paymentMethod: string
}

interface ChurnAnalysis {
  totalChurned: number
  churnReasons: { reason: string; count: number; percentage: number }[]
  churnByTier: { tier: string; count: number; rate: number }[]
  averageLifetime: number
}

export default function RevenueBillingPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<SubscriptionBreakdown[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [churnAnalysis, setChurnAnalysis] = useState<ChurnAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions' | 'churn'>('overview')

  useEffect(() => {
    loadRevenueData()
  }, [timeRange])

  const loadRevenueData = async () => {
    setIsLoading(true)
    try {
      // Simulated data - replace with actual API calls
      setMetrics({
        mrr: 384290,
        mrrGrowth: 8.3,
        arr: 4611480,
        arrGrowth: 12.5,
        totalRevenue: 1842938,
        averageRevenuePerUser: 143.25,
        churnRate: 2.8,
        ltv: 5127,
        cac: 423,
        paybackPeriod: 2.95
      })

      // Generate revenue trend data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const revenueHistory = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        return {
          date: date.toLocaleDateString(),
          revenue: 12000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 + (i * 150),
          newSubscriptions: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 20,
          churn: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10) + 5,
          netGrowth: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40) + 15
        }
      })
      setRevenueData(revenueHistory)

      setSubscriptionBreakdown([
        { tier: 'Free', count: 8234, revenue: 0, percentage: 64.1, color: '#6B7280' },
        { tier: 'Startup', count: 1456, revenue: 43680, percentage: 11.3, color: '#3B82F6' },
        { tier: 'Professional', count: 2123, revenue: 169840, percentage: 16.5, color: '#8B5CF6' },
        { tier: 'Enterprise', count: 1034, revenue: 170770, percentage: 8.1, color: '#10B981' }
      ])

      setTransactions([
        {
          id: 't1',
          userId: 'u1',
          userName: 'John Smith',
          userEmail: 'john@example.com',
          amount: 299,
          status: 'completed',
          type: 'subscription',
          description: 'Professional Plan - Monthly',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_****_4242'
        },
        {
          id: 't2',
          userId: 'u2',
          userName: 'Sarah Johnson',
          userEmail: 'sarah@company.com',
          amount: 1499,
          status: 'completed',
          type: 'subscription',
          description: 'Enterprise Plan - Monthly',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_****_5555'
        },
        {
          id: 't3',
          userId: 'u3',
          userName: 'Mike Chen',
          userEmail: 'mike@startup.com',
          amount: 29,
          status: 'failed',
          type: 'subscription',
          description: 'Startup Plan - Monthly',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_****_3434'
        },
        {
          id: 't4',
          userId: 'u4',
          userName: 'Lisa Wang',
          userEmail: 'lisa@greenhouse.com',
          amount: 299,
          status: 'refunded',
          type: 'subscription',
          description: 'Professional Plan - Refund',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_****_6666'
        }
      ])

      setChurnAnalysis({
        totalChurned: 156,
        churnReasons: [
          { reason: 'Too expensive', count: 45, percentage: 28.8 },
          { reason: 'Not using enough', count: 38, percentage: 24.4 },
          { reason: 'Missing features', count: 32, percentage: 20.5 },
          { reason: 'Found alternative', count: 23, percentage: 14.7 },
          { reason: 'Other', count: 18, percentage: 11.5 }
        ],
        churnByTier: [
          { tier: 'Free', count: 0, rate: 0 },
          { tier: 'Startup', count: 67, rate: 4.6 },
          { tier: 'Professional', count: 52, rate: 2.5 },
          { tier: 'Enterprise', count: 37, rate: 3.6 }
        ],
        averageLifetime: 18.5
      })
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10'
      case 'pending': return 'text-yellow-500 bg-yellow-500/10'
      case 'failed': return 'text-red-500 bg-red-500/10'
      case 'refunded': return 'text-purple-500 bg-purple-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'pending': return Clock
      case 'failed': return XCircle
      case 'refunded': return RefreshCw
      default: return AlertTriangle
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Revenue & Billing</h1>
            <p className="text-gray-400">Track revenue, subscriptions, and financial metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <div className={`flex items-center gap-1 text-sm ${
                  metrics.mrrGrowth > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metrics.mrrGrowth > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(metrics.mrrGrowth)}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(metrics.mrr)}</p>
              <p className="text-sm text-gray-500 mt-1">ARR: {formatCurrency(metrics.arr)}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-400" />
                <div className="text-sm text-gray-500">Per user</div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Average Revenue Per User</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(metrics.averageRevenuePerUser)}</p>
              <p className="text-sm text-gray-500 mt-1">Monthly average</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingDown className="w-8 h-8 text-red-400" />
                <div className="text-sm text-red-400">{metrics.churnRate}%</div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Churn Rate</p>
              <p className="text-2xl font-bold text-white">{metrics.totalChurned || 156}</p>
              <p className="text-sm text-gray-500 mt-1">Users this month</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-purple-400" />
                <div className="text-sm text-gray-500">LTV:CAC</div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Customer Lifetime Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(metrics.ltv)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(metrics.ltv / metrics.cac).toFixed(1)}:1 ratio
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          {['overview', 'transactions', 'subscriptions', 'churn'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Revenue Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Revenue Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Revenue by Tier</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionBreakdown.filter(s => s.revenue > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ tier, percentage }) => `${tier} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {subscriptionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {subscriptionBreakdown.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: tier.color }} />
                        <span className="text-gray-300">{tier.tier}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium">{formatCurrency(tier.revenue)}</span>
                        <span className="text-gray-500 ml-2">({tier.count} users)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Growth Metrics</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar dataKey="newSubscriptions" fill="#10B981" name="New" />
                      <Bar dataKey="churn" fill="#EF4444" name="Churned" />
                      <Bar dataKey="netGrowth" fill="#3B82F6" name="Net Growth" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
                  Filter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Transaction</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Payment Method</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transactions.map((transaction) => {
                    const StatusIcon = getStatusIcon(transaction.status)
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-400">ID: {transaction.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{transaction.userName}</p>
                            <p className="text-sm text-gray-400">{transaction.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{formatCurrency(transaction.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-sm text-blue-400 hover:text-blue-300">
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {subscriptionBreakdown.map((tier) => (
                <div key={tier.tier} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{tier.tier} Tier</h3>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ 
                      backgroundColor: `${tier.color}20`,
                      color: tier.color 
                    }}>
                      {tier.count} users
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Revenue</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(tier.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">% of Total</p>
                      <p className="text-xl font-bold text-white">{tier.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Avg. per User</p>
                      <p className="text-xl font-bold text-white">
                        {tier.revenue > 0 ? formatCurrency(tier.revenue / tier.count) : '$0'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Subscribers</p>
                    <p className="text-2xl font-bold text-white">
                      {subscriptionBreakdown.reduce((sum, tier) => sum + tier.count, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Paying Customers</p>
                    <p className="text-2xl font-bold text-white">
                      {subscriptionBreakdown
                        .filter(t => t.tier !== 'Free')
                        .reduce((sum, tier) => sum + tier.count, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">35.9%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Upgrade Rate</p>
                    <p className="text-2xl font-bold text-white">12.3%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Changes</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">23 upgrades</p>
                      <p className="text-xs text-gray-400">This week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">8 downgrades</p>
                      <p className="text-xs text-gray-400">This week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">156 new trials</p>
                      <p className="text-xs text-gray-400">This week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'churn' && churnAnalysis && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-1">Total Churned</p>
                <p className="text-2xl font-bold text-white">{churnAnalysis.totalChurned}</p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-1">Churn Rate</p>
                <p className="text-2xl font-bold text-red-400">{metrics?.churnRate}%</p>
                <p className="text-sm text-gray-500 mt-1">Monthly average</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-1">Avg. Lifetime</p>
                <p className="text-2xl font-bold text-white">{churnAnalysis.averageLifetime} mo</p>
                <p className="text-sm text-gray-500 mt-1">Before churn</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-1">Revenue Impact</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(23847)}</p>
                <p className="text-sm text-gray-500 mt-1">Lost MRR</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Churn Reasons</h2>
                <div className="space-y-4">
                  {churnAnalysis.churnReasons.map((reason) => (
                    <div key={reason.reason}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">{reason.reason}</span>
                        <span className="text-white font-medium">{reason.count} ({reason.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Churn by Tier</h2>
                <div className="space-y-4">
                  {churnAnalysis.churnByTier.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{tier.tier}</p>
                        <p className="text-sm text-gray-400">{tier.count} users churned</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-400">{tier.rate}%</p>
                        <p className="text-xs text-gray-500">churn rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}