'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Zap,
  Receipt,
  FileText,
  Calculator,
  BanknoteIcon,
  Wallet,
  PiggyBank,
  Target,
  Award,
  Gift,
  ShoppingCart,
  Package,
  Truck,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

interface RevenueData {
  period: string
  revenue: number
  growth: number
  breakdown: {
    subscriptions: number
    revenueSharing: number
    marketplace: number
    carbonCredits: number
    affiliates: number
  }
}

interface SubscriptionData {
  tier: string
  count: number
  mrr: number
  churnRate: number
  averageLifetime: number
  color: string
}

interface RevenueSharingData {
  facilityId: string
  facilityName: string
  type: string
  energySaved: number
  dollarsSaved: number
  ourShare: number
  status: 'active' | 'pending' | 'paid'
  lastPayment: Date
}

interface PaymentData {
  id: string
  customer: string
  amount: number
  status: 'succeeded' | 'processing' | 'failed'
  type: 'subscription' | 'revenue_share' | 'marketplace'
  date: Date
}

export default function AdminFinancialDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [revenueSharing, setRevenueSharing] = useState<RevenueSharingData[]>([])
  const [recentPayments, setRecentPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFinancialData()
  }, [timeRange])

  const loadFinancialData = async () => {
    setLoading(true)
    // Mock data - replace with actual API calls
    
    // Revenue data
    const mockRevenue: RevenueData[] = [
      {
        period: 'Jan 2024',
        revenue: 245678,
        growth: 15.2,
        breakdown: {
          subscriptions: 145000,
          revenueSharing: 78000,
          marketplace: 15000,
          carbonCredits: 5678,
          affiliates: 2000
        }
      },
      {
        period: 'Feb 2024',
        revenue: 287945,
        growth: 17.2,
        breakdown: {
          subscriptions: 165000,
          revenueSharing: 95000,
          marketplace: 18945,
          carbonCredits: 7000,
          affiliates: 2000
        }
      },
      {
        period: 'Mar 2024',
        revenue: 325678,
        growth: 13.1,
        breakdown: {
          subscriptions: 185000,
          revenueSharing: 108000,
          marketplace: 22678,
          carbonCredits: 8000,
          affiliates: 2000
        }
      }
    ]
    setRevenueData(mockRevenue)

    // Subscription data
    const mockSubs: SubscriptionData[] = [
      {
        tier: 'Enterprise',
        count: 45,
        mrr: 89550,
        churnRate: 2.1,
        averageLifetime: 24,
        color: 'bg-purple-500'
      },
      {
        tier: 'Professional',
        count: 234,
        mrr: 18486,
        churnRate: 3.5,
        averageLifetime: 18,
        color: 'bg-blue-500'
      },
      {
        tier: 'Academic',
        count: 89,
        mrr: 8811,
        churnRate: 1.2,
        averageLifetime: 36,
        color: 'bg-green-500'
      },
      {
        tier: 'Hobbyist',
        count: 567,
        mrr: 5103,
        churnRate: 8.2,
        averageLifetime: 6,
        color: 'bg-yellow-500'
      },
      {
        tier: 'Free',
        count: 2345,
        mrr: 0,
        churnRate: 15.3,
        averageLifetime: 3,
        color: 'bg-gray-500'
      }
    ]
    setSubscriptions(mockSubs)

    // Revenue sharing data
    const mockRS: RevenueSharingData[] = [
      {
        facilityId: 'fac_1',
        facilityName: 'GreenTech SF',
        type: 'INDOOR',
        energySaved: 45678,
        dollarsSaved: 5678,
        ourShare: 1135.60,
        status: 'active',
        lastPayment: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        facilityId: 'fac_2',
        facilityName: 'VertiFarms Austin',
        type: 'VERTICAL_FARM',
        energySaved: 78234,
        dollarsSaved: 9234,
        ourShare: 1846.80,
        status: 'pending',
        lastPayment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        facilityId: 'fac_3',
        facilityName: 'Urban Greens NYC',
        type: 'GREENHOUSE',
        energySaved: 34567,
        dollarsSaved: 4123,
        ourShare: 824.60,
        status: 'paid',
        lastPayment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
    setRevenueSharing(mockRS)

    // Recent payments
    const mockPayments: PaymentData[] = [
      {
        id: 'pay_1',
        customer: 'GreenTech SF',
        amount: 1990,
        status: 'succeeded',
        type: 'subscription',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'pay_2',
        customer: 'VertiFarms Austin',
        amount: 1846.80,
        status: 'processing',
        type: 'revenue_share',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: 'pay_3',
        customer: 'John Doe',
        amount: 79,
        status: 'succeeded',
        type: 'subscription',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]
    setRecentPayments(mockPayments)

    setLoading(false)
  }

  const calculateTotalMRR = () => {
    return subscriptions.reduce((sum, sub) => sum + sub.mrr, 0)
  }

  const calculateTotalActiveUsers = () => {
    return subscriptions.reduce((sum, sub) => sum + sub.count, 0)
  }

  const calculateRevenueSharingTotal = () => {
    return revenueSharing.reduce((sum, rs) => sum + rs.ourShare, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'active':
        return 'text-green-600'
      case 'processing':
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600 mt-1">Track revenue, subscriptions, and financial performance</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Calculator className="w-4 h-4 mr-2" />
              Run Billing
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(325678).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +13.1% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recurring</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${calculateTotalMRR().toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.2% growth rate
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Sharing</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${calculateRevenueSharingTotal().toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" />
                  {revenueSharing.filter(rs => rs.status === 'active').length} active
                </p>
              </div>
              <PiggyBank className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paying Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter(s => s.mrr > 0).reduce((sum, s) => sum + s.count, 0)}
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  {calculateTotalActiveUsers()} total users
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue/User</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Math.round(calculateTotalMRR() / subscriptions.filter(s => s.mrr > 0).reduce((sum, s) => sum + s.count, 0))}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3" />
                  Target: $150
                </p>
              </div>
              <Wallet className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="revenue-sharing">Revenue Sharing</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Revenue trend chart</p>
                    <p className="text-sm text-gray-400">Would display line chart with monthly revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Subscriptions</span>
                    </div>
                    <span className="text-sm font-bold">$185,000 (56.8%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Revenue Sharing</span>
                    </div>
                    <span className="text-sm font-bold">$108,000 (33.2%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Marketplace</span>
                    </div>
                    <span className="text-sm font-bold">$22,678 (7.0%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Carbon Credits</span>
                    </div>
                    <span className="text-sm font-bold">$8,000 (2.5%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Affiliates</span>
                    </div>
                    <span className="text-sm font-bold">$2,000 (0.6%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Recent Payments
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        payment.type === 'subscription' ? 'bg-purple-100' :
                        payment.type === 'revenue_share' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {payment.type === 'subscription' ? <CreditCard className="w-5 h-5 text-purple-600" /> :
                         payment.type === 'revenue_share' ? <Zap className="w-5 h-5 text-green-600" /> :
                         <ShoppingCart className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.customer}</p>
                        <p className="text-sm text-gray-600 capitalize">{payment.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
                      <div className={`flex items-center gap-1 text-sm ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="capitalize">{payment.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <Card key={sub.tier}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{sub.tier}</CardTitle>
                    <Badge variant="outline">{sub.count} users</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MRR</span>
                      <span className="font-bold text-lg">${sub.mrr.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Churn Rate</span>
                      <span className={`font-medium ${
                        sub.churnRate > 5 ? 'text-red-600' : 
                        sub.churnRate > 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {sub.churnRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Lifetime</span>
                      <span className="font-medium">{sub.averageLifetime} months</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">% of total users</span>
                        <span className="text-xs font-medium">
                          {((sub.count / calculateTotalActiveUsers()) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(sub.count / calculateTotalActiveUsers()) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subscription Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Net MRR Growth</p>
                  <p className="text-3xl font-bold text-green-600">+$12,450</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Customer LTV</p>
                  <p className="text-3xl font-bold text-gray-900">$2,340</p>
                  <p className="text-xs text-gray-500 mt-1">Average</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">CAC</p>
                  <p className="text-3xl font-bold text-gray-900">$156</p>
                  <p className="text-xs text-gray-500 mt-1">Per customer</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">LTV:CAC Ratio</p>
                  <p className="text-3xl font-bold text-purple-600">15:1</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Sharing Tab */}
        <TabsContent value="revenue-sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Revenue Sharing Agreements</CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {revenueSharing.length} Active Facilities
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueSharing.map((rs) => (
                  <div key={rs.facilityId} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="w-5 h-5 text-gray-400" />
                          <h4 className="font-medium text-gray-900">{rs.facilityName}</h4>
                          <Badge variant="outline">{rs.type}</Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              rs.status === 'active' ? 'text-green-600 border-green-200' :
                              rs.status === 'pending' ? 'text-yellow-600 border-yellow-200' :
                              'text-gray-600 border-gray-200'
                            }
                          >
                            {rs.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Energy Saved</p>
                            <p className="font-medium">{rs.energySaved.toLocaleString()} kWh</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Customer Savings</p>
                            <p className="font-medium text-green-600">${rs.dollarsSaved.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Our Share (20%)</p>
                            <p className="font-medium text-purple-600">${rs.ourShare.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Last Payment</p>
                            <p className="font-medium">{rs.lastPayment.toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Sharing Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total Energy Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {(revenueSharing.reduce((sum, rs) => sum + rs.energySaved, 0) / 1000).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">MWh this month</p>
                  <p className="text-xs text-green-600 mt-2">
                    Equivalent to {Math.round(revenueSharing.reduce((sum, rs) => sum + rs.energySaved, 0) * 0.000433)} tons CO₂
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ${revenueSharing.reduce((sum, rs) => sum + rs.dollarsSaved, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total this month</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Avg ${Math.round(revenueSharing.reduce((sum, rs) => sum + rs.dollarsSaved, 0) / revenueSharing.length)} per facility
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Revenue Share Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    ${calculateRevenueSharingTotal().toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">This month (20%)</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Projected annual: ${(calculateRevenueSharingTotal() * 12).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-gray-700">Date</th>
                      <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-700">Type</th>
                      <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...recentPayments, ...recentPayments, ...recentPayments].map((payment, idx) => (
                      <tr key={`${payment.id}-${idx}`} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm">{payment.date.toLocaleDateString()}</td>
                        <td className="p-4 text-sm font-medium">{payment.customer}</td>
                        <td className="p-4 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {payment.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm font-bold">${payment.amount.toLocaleString()}</td>
                        <td className="p-4 text-sm">
                          <div className={`flex items-center gap-1 ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="capitalize">{payment.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium">MRR Growth Rate</span>
                    </div>
                    <span className="font-bold text-green-600">+8.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">User Growth Rate</span>
                    </div>
                    <span className="font-bold text-blue-600">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">ARPU Growth</span>
                    </div>
                    <span className="font-bold text-purple-600">+5.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Churn Rate</span>
                    </div>
                    <span className="font-bold text-red-600">3.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forecasting */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Revenue forecast chart</p>
                    <p className="text-sm text-gray-400">Projected revenue for next 12 months</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Q2 2024 Projection</p>
                      <p className="text-xl font-bold text-gray-900">$1.2M</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">2024 Annual Projection</p>
                      <p className="text-xl font-bold text-gray-900">$5.8M</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}