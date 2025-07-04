'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Package,
  Calendar,
  ChevronLeft,
  Download,
  RefreshCw,
  Eye,
  Clock,
  Target,
  Zap,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  CreditCard,
  UserCheck,
  UserX,
  ShoppingCart,
  FileText,
  Map,
  Globe,
  Cpu,
  Shield,
  Database,
  Settings,
  Flag,
  MapPin,
  Navigation,
  MousePointer,
  Grid3x3
} from 'lucide-react';
import RealTimeUserMap from '@/components/analytics/RealTimeUserMap';
import LiveUserJourney from '@/components/analytics/LiveUserJourney';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import ConversionFunnel from '@/components/analytics/ConversionFunnel';
import SessionRecording from '@/components/analytics/SessionRecording';
import CohortAnalysis from '@/components/analytics/CohortAnalysis';
import SmartAlertSystem from '@/components/analytics/SmartAlertSystem';
import DashboardBuilder from '@/components/analytics/DashboardBuilder';
import Link from 'next/link';
import AdminGuard from '@/components/auth/AdminGuard';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalUsers: number;
    userGrowth: number;
    activeUsers: number;
    conversionRate: number;
    avgRevenuePerUser: number;
    churnRate: number;
  };
  revenue: {
    monthly: { month: string; revenue: number; }[];
    bySubscription: { tier: string; revenue: number; users: number; }[];
    projectedRevenue: number;
  };
  users: {
    demographics: { country: string; users: number; revenue: number; }[];
    acquisition: { source: string; users: number; conversionRate: number; }[];
    retention: { cohort: string; day0: number; day7: number; day30: number; }[];
  };
  activity: {
    pageViews: { page: string; views: number; avgTime: string; }[];
    features: { feature: string; usage: number; satisfaction: number; }[];
    errors: { type: string; count: number; affected: number; }[];
  };
  geographic: {
    countries: Array<{
      country: string;
      countryCode: string;
      users: number;
      revenue: number;
      avgSessionDuration: number;
    }>;
    cities: Array<{
      city: string;
      country: string;
      latitude: number;
      longitude: number;
      users: number;
      sessions: number;
    }>;
  };
  realtime: {
    activeUsers: number;
    currentSessions: number;
    pageViewsPerMinute: number;
    conversionEvents: number;
    satisfaction: number;
  };
}

function AdminAnalyticsContent() {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics with dateRange:', dateRange);
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: exportFormat, dateRange })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'json')}
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
                <button
                  onClick={exportData}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              <button
                onClick={fetchAnalytics}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <Link
                href="/admin"
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'realtime', label: 'Real-Time', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'engagement', label: 'Engagement', icon: MousePointer },
              { id: 'funnel', label: 'Conversion', icon: Target },
              { id: 'sessions', label: 'Sessions', icon: Eye },
              { id: 'cohorts', label: 'Cohorts', icon: Grid3x3 },
              { id: 'alerts', label: 'Alerts', icon: AlertCircle },
              { id: 'builder', label: 'Builder', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id)}
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                    selectedView === tab.id
                      ? 'border-purple-500 text-purple-400 bg-gray-800/50'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Overview */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <span className={`text-sm font-medium ${
                    analytics.overview.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(analytics.overview.revenueGrowth)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Total Revenue</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className={`text-sm font-medium ${
                    analytics.overview.userGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(analytics.overview.userGrowth)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {analytics.overview.totalUsers.toLocaleString()}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Total Users</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-purple-400">
                    {analytics.overview.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {analytics.overview.activeUsers.toLocaleString()}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Active Users</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-yellow-400">
                    {analytics.overview.churnRate.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.overview.avgRevenuePerUser)}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Avg Revenue/User</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Revenue chart visualization would go here</p>
              </div>
            </div>

            {/* Top Pages & Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
                <div className="space-y-3">
                  {analytics.activity.pageViews.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{page.page}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{page.views.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">{page.avgTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Feature Usage</h3>
                <div className="space-y-3">
                  {analytics.activity.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{feature.feature}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{feature.usage.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">{feature.satisfaction}% satisfaction</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time View */}
        {selectedView === 'realtime' && (
          <div className="space-y-6">
            <RealTimeUserMap userLocations={
              analytics.geographic.cities.map(city => ({
                id: city.city,
                country: city.country,
                countryCode: '',
                city: city.city,
                latitude: city.latitude,
                longitude: city.longitude,
                activeUsers: city.users,
                sessions: city.sessions,
                avgSessionDuration: 0,
                conversionRate: 0
              }))
            } />
            <LiveUserJourney />
          </div>
        )}

        {/* Users View */}
        {selectedView === 'users' && (
          <div className="space-y-6">
            {/* User Demographics */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Demographics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Country</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Users</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.users.demographics.map((demo, index) => (
                      <tr key={index} className="border-b border-gray-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-white">{demo.country}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {demo.users.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {formatCurrency(demo.revenue)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {formatCurrency(demo.revenue / demo.users)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Acquisition Sources */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Acquisition Sources</h3>
              <div className="space-y-4">
                {analytics.users.acquisition.map((source, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">{source.source}</span>
                      <span className="text-white font-medium">
                        {source.users.toLocaleString()} users
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(source.users / analytics.overview.totalUsers) * 100}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {source.conversionRate.toFixed(1)}% conversion rate
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue View */}
        {selectedView === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue by Subscription */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue by Subscription Tier</h3>
              <div className="space-y-4">
                {analytics.revenue.bySubscription.map((tier, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-medium">{tier.tier}</h4>
                        <p className="text-gray-400 text-sm">{tier.users.toLocaleString()} users</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(tier.revenue)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatCurrency(tier.revenue / tier.users)}/user
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(tier.revenue / analytics.overview.totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projected Revenue */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Projected Annual Revenue</h3>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(analytics.revenue.projectedRevenue)}
              </p>
              <p className="text-gray-400 mt-1">Based on current growth rate</p>
            </div>
          </div>
        )}

        {/* Engagement View */}
        {selectedView === 'engagement' && (
          <div className="space-y-6">
            <EngagementHeatmap />
          </div>
        )}

        {/* Conversion Funnel */}
        {selectedView === 'funnel' && (
          <div className="space-y-6">
            <ConversionFunnel />
          </div>
        )}

        {/* Session Recording */}
        {selectedView === 'sessions' && (
          <div className="space-y-6">
            <SessionRecording />
          </div>
        )}

        {/* Cohort Analysis */}
        {selectedView === 'cohorts' && (
          <div className="space-y-6">
            <CohortAnalysis />
          </div>
        )}

        {/* Smart Alerts */}
        {selectedView === 'alerts' && (
          <div className="space-y-6">
            <SmartAlertSystem className="w-full" />
          </div>
        )}

        {/* Dashboard Builder */}
        {selectedView === 'builder' && (
          <div className="space-y-6">
            <DashboardBuilder 
              className="w-full" 
              onSave={(dashboard) => {
                console.log('Dashboard saved:', dashboard);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      <AdminAnalyticsContent />
    </AdminGuard>
  );
}