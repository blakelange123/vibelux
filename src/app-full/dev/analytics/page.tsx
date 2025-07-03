'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

interface PageAnalytics {
  page: string;
  title: string;
  views: number;
  uniqueUsers: number;
  averageDuration: number;
  bounceRate: number;
  conversionRate: number;
  topReferrers: Array<{
    source: string;
    views: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  timeAnalysis: {
    peakHours: Array<{
      hour: number;
      views: number;
    }>;
    dailyTrend: Array<{
      date: string;
      views: number;
      uniqueUsers: number;
    }>;
  };
}

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalUsers: number;
    avgSessionDuration: number;
    timeRange: string;
    lastUpdated: string;
  };
  pages: PageAnalytics[];
  realtime?: {
    activeUsers: number;
    currentPageViews: number;
    topActivePages: Array<{
      page: string;
      title: string;
      activeUsers: number;
    }>;
  };
  insights: {
    mostPopularPage: PageAnalytics;
    longestEngagement: PageAnalytics;
    highestConversion: PageAnalytics;
    mobileUsage: number;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DeveloperAnalyticsPage() {
  const { isSignedIn } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeRange,
        ...(selectedPage !== 'all' && { page: selectedPage }),
        ...(realtimeEnabled && { realtime: 'true' })
      });

      const response = await fetch(`/api/analytics/page-usage?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchAnalytics();
    }
  }, [isSignedIn, timeRange, selectedPage, realtimeEnabled]);

  // Auto-refresh realtime data
  useEffect(() => {
    if (!realtimeEnabled || !isSignedIn) return;

    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [realtimeEnabled, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please sign in to access developer analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { summary, pages, realtime, insights } = analyticsData;

  // Prepare data for charts
  const pageViewsData = pages.slice(0, 10).map(page => ({
    page: page.title.length > 20 ? page.title.substring(0, 20) + '...' : page.title,
    views: page.views,
    users: page.uniqueUsers,
    duration: page.averageDuration
  }));

  const deviceData = pages.reduce((acc, page) => {
    acc.desktop += page.deviceBreakdown.desktop || 0;
    acc.tablet += page.deviceBreakdown.tablet || 0;
    acc.mobile += page.deviceBreakdown.mobile || 0;
    return acc;
  }, { desktop: 0, tablet: 0, mobile: 0 });

  const deviceChartData = [
    { name: 'Desktop', value: deviceData.desktop, color: '#10b981' },
    { name: 'Mobile', value: deviceData.mobile, color: '#3b82f6' },
    { name: 'Tablet', value: deviceData.tablet, color: '#f59e0b' }
  ];

  const timelineData = insights.mostPopularPage?.timeAnalysis?.dailyTrend || [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Page Analytics Dashboard</h1>
          <p className="text-gray-400">Developer insights into page usage and user behavior</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-900 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
            variant={realtimeEnabled ? "default" : "outline"}
            size="sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            Real-time
          </Button>
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      {realtimeEnabled && realtime && (
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Real-time Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{realtime.activeUsers}</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{realtime.currentPageViews}</div>
                <div className="text-sm text-gray-400">Page Views (1h)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium">Top Active:</div>
                <div className="text-sm text-gray-400">
                  {realtime.topActivePages[0]?.title} ({realtime.topActivePages[0]?.activeUsers} users)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Page Views</p>
                <p className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unique Users</p>
                <p className="text-2xl font-bold">{summary.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Session Time</p>
                <p className="text-2xl font-bold">{Math.round(summary.avgSessionDuration)}s</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Mobile Usage</p>
                <p className="text-2xl font-bold">{Math.round(insights.mobileUsage)}%</p>
              </div>
              <Smartphone className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Page Details</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Chart */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Pages by Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pageViewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="page" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="views" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Device Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trend */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Daily Page Views Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uniqueUsers" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="grid gap-4">
            {pages.slice(0, 10).map((page, index) => (
              <Card key={page.page} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{page.title}</h3>
                        <p className="text-sm text-gray-400">{page.page}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">views</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Unique Users</p>
                      <p className="font-medium">{page.uniqueUsers}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Duration</p>
                      <p className="font-medium">{page.averageDuration}s</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Bounce Rate</p>
                      <p className="font-medium">{page.bounceRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Conversion</p>
                      <p className="font-medium">{page.conversionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Top Referrer</p>
                      <p className="font-medium">
                        {page.topReferrers[0]?.source?.replace('https://', '') || 'direct'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Desktop Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {deviceData.desktop.toLocaleString()}
                  </div>
                  <div className="text-gray-400">
                    {((deviceData.desktop / summary.totalViews) * 100).toFixed(1)}% of total views
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {deviceData.mobile.toLocaleString()}
                  </div>
                  <div className="text-gray-400">
                    {((deviceData.mobile / summary.totalViews) * 100).toFixed(1)}% of total views
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tablet className="w-5 h-5" />
                  Tablet Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {deviceData.tablet.toLocaleString()}
                  </div>
                  <div className="text-gray-400">
                    {((deviceData.tablet / summary.totalViews) * 100).toFixed(1)}% of total views
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Most Popular Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{insights.mostPopularPage.title}</h3>
                  <p className="text-gray-400">{insights.mostPopularPage.page}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-400">Views</p>
                      <p className="text-xl font-bold">{insights.mostPopularPage.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Users</p>
                      <p className="text-xl font-bold">{insights.mostPopularPage.uniqueUsers}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Highest Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{insights.longestEngagement.title}</h3>
                  <p className="text-gray-400">{insights.longestEngagement.page}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-400">Avg Duration</p>
                      <p className="text-xl font-bold">{insights.longestEngagement.averageDuration}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Bounce Rate</p>
                      <p className="text-xl font-bold">{insights.longestEngagement.bounceRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Key Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">✓ High Performance Pages</h4>
                  <p className="text-sm text-gray-300">
                    Focus development efforts on enhancing {insights.mostPopularPage.title} and {insights.longestEngagement.title} 
                    as they show the highest user engagement.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">📱 Mobile Optimization</h4>
                  <p className="text-sm text-gray-300">
                    {insights.mobileUsage > 30 
                      ? `Mobile usage is high (${insights.mobileUsage.toFixed(1)}%). Consider mobile-first optimizations.`
                      : `Mobile usage is ${insights.mobileUsage.toFixed(1)}%. Focus on desktop experience while improving mobile.`
                    }
                  </p>
                </div>

                <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-2">⚡ Performance Opportunities</h4>
                  <p className="text-sm text-gray-300">
                    Pages with high bounce rates may benefit from performance optimization and content improvements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}