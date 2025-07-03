"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  Database,
  Zap,
  MessageSquare,
  Settings,
  BarChart3,
  Brain,
  Server,
  Mail,
  CreditCard,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package
} from 'lucide-react'

interface DashboardMetric {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  color: string
}

interface SystemHealth {
  component: string
  status: 'healthy' | 'warning' | 'critical'
  message: string
  lastChecked: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    // Load dashboard data
    loadDashboardData()
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      // In production, these would be real API calls
      setMetrics([
        {
          label: 'Total Users',
          value: '12,847',
          change: 12.5,
          trend: 'up',
          icon: Users,
          color: 'text-blue-500'
        },
        {
          label: 'MRR',
          value: '$384,290',
          change: 8.3,
          trend: 'up',
          icon: DollarSign,
          color: 'text-green-500'
        },
        {
          label: 'Active Now',
          value: '1,284',
          change: -2.1,
          trend: 'down',
          icon: Activity,
          color: 'text-purple-500'
        },
        {
          label: 'Support Tickets',
          value: '23',
          change: 15.0,
          trend: 'up',
          icon: MessageSquare,
          color: 'text-orange-500'
        }
      ])

      setSystemHealth([
        {
          component: 'API Server',
          status: 'healthy',
          message: 'Response time: 45ms',
          lastChecked: '2 min ago'
        },
        {
          component: 'Database',
          status: 'healthy',
          message: 'Connections: 123/500',
          lastChecked: '1 min ago'
        },
        {
          component: 'Redis Cache',
          status: 'warning',
          message: 'Memory usage: 82%',
          lastChecked: '1 min ago'
        },
        {
          component: 'AI Service',
          status: 'healthy',
          message: 'Queue depth: 12',
          lastChecked: '3 min ago'
        },
        {
          component: 'Payment Gateway',
          status: 'healthy',
          message: 'Success rate: 99.8%',
          lastChecked: '5 min ago'
        }
      ])

      setRecentActivity([
        {
          id: 1,
          type: 'user_signup',
          user: 'john@example.com',
          action: 'New user signup',
          tier: 'Professional',
          timestamp: '5 min ago'
        },
        {
          id: 2,
          type: 'payment',
          user: 'sarah@company.com',
          action: 'Payment successful',
          amount: '$299',
          timestamp: '12 min ago'
        },
        {
          id: 3,
          type: 'upgrade',
          user: 'mike@greenhouse.com',
          action: 'Upgraded to Enterprise',
          from: 'Professional',
          timestamp: '28 min ago'
        },
        {
          id: 4,
          type: 'error',
          user: 'system',
          action: 'High API usage detected',
          details: 'Rate limit approaching',
          timestamp: '45 min ago'
        }
      ])

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10'
      case 'warning': return 'text-yellow-500 bg-yellow-500/10'
      case 'critical': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return XCircle
      default: return AlertCircle
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return UserCheck
      case 'payment': return CreditCard
      case 'upgrade': return TrendingUp
      case 'error': return AlertTriangle
      default: return Activity
    }
  }

  const adminSections = [
    {
      title: 'User Management',
      icon: Users,
      href: '/admin',
      description: 'Manage users, subscriptions, and permissions',
      stats: '12,847 users',
      color: 'bg-blue-500'
    },
    {
      title: 'Revenue & Billing',
      icon: DollarSign,
      href: '/admin/revenue',
      description: 'Track revenue, subscriptions, and payments',
      stats: '$384K MRR',
      color: 'bg-green-500'
    },
    {
      title: 'Support Center',
      icon: MessageSquare,
      href: '/admin/support',
      description: 'Manage tickets and customer inquiries',
      stats: '23 open tickets',
      color: 'bg-orange-500'
    },
    {
      title: 'System Monitoring',
      icon: Server,
      href: '/admin/monitoring',
      description: 'Monitor system health and performance',
      stats: '99.9% uptime',
      color: 'bg-purple-500'
    },
    {
      title: 'Database Backup',
      icon: Database,
      href: '/admin/backup',
      description: 'Manage database backups and recovery',
      stats: '28 backups',
      color: 'bg-indigo-500'
    },
    {
      title: 'AI/ML Operations',
      icon: Brain,
      href: '/admin/ml-ops',
      description: 'Monitor AI models and predictions',
      stats: '1.2M predictions',
      color: 'bg-pink-500'
    },
    {
      title: 'Feature Flags',
      icon: Zap,
      href: '/admin/features',
      description: 'Manage feature rollouts and experiments',
      stats: '8 active flags',
      color: 'bg-indigo-500'
    },
    {
      title: 'Email Campaigns',
      icon: Mail,
      href: '/admin/email',
      description: 'Send announcements and newsletters',
      stats: '85% open rate',
      color: 'bg-teal-500'
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      description: 'Configure system settings and integrations',
      stats: 'Last updated 2d ago',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">System overview and management tools</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={loadDashboardData}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change || 0)}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors group"
            >
              <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3">{section.description}</p>
              <p className="text-sm font-medium text-gray-300">{section.stats}</p>
            </Link>
          ))}
        </div>

        {/* System Health and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              System Health
            </h2>
            <div className="space-y-3">
              {systemHealth.map((item, index) => {
                const StatusIcon = getStatusIcon(item.status)
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.component}</p>
                        <p className="text-sm text-gray-400">{item.message}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.lastChecked}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ActivityIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-gray-400">
                          {activity.user} {activity.amount && `• ${activity.amount}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                )
              })}
            </div>
            <Link
              href="/admin/activity"
              className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-center text-sm text-gray-300 rounded-lg transition-colors block"
            >
              View All Activity
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
              Send Announcement
            </button>
            <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
              Export User Data
            </button>
            <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
              Clear Cache
            </button>
            <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}