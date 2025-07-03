'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, TrendingUp, Users, Building2, AlertTriangle, CheckCircle,
  MapPin, Zap, DollarSign, Clock, Eye, Globe, Wifi, WifiOff,
  ArrowUp, ArrowDown, Minus, BarChart3, PieChart, LineChart,
  Camera, Bug, Scissors, Droplets, ThermometerSun, Monitor,
  Star, Award, Target, Gauge, RefreshCw, Maximize2, Filter
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FacilityHealthMetrics {
  facilityId: string;
  facilityName: string;
  coordinates: { lat: number; lng: number };
  isOnline: boolean;
  healthScore: number;
  activeUsers: number;
  totalUsers: number;
  recentAlerts: number;
  performance: {
    avgResponseTime: number;
    qualityScore: number;
    userEngagement: number;
    systemUptime: number;
  };
  realtimeData: {
    reportsLastHour: number;
    activeNow: number;
    lastActivity: Date;
  };
}

interface GlobalMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  totalFacilities: number;
  activeFacilities: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: number;
  avgQualityScore: number;
}

export default function EnhancedAdminDashboard() {
  const [facilities, setFacilities] = useState<FacilityHealthMetrics[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardData();
    
    if (realtimeEnabled) {
      const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, realtimeEnabled]);

  const loadDashboardData = async () => {
    // Mock data with realistic values
    const mockGlobalMetrics: GlobalMetrics = {
      totalRevenue: 47350,
      monthlyGrowth: 12.5,
      totalFacilities: 28,
      activeFacilities: 26,
      totalUsers: 234,
      activeUsers: 67,
      systemHealth: 98.2,
      avgQualityScore: 89.4
    };

    const mockFacilities: FacilityHealthMetrics[] = [
      {
        facilityId: 'facility-1',
        facilityName: 'Green Valley Greenhouse',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        isOnline: true,
        healthScore: 96,
        activeUsers: 8,
        totalUsers: 15,
        recentAlerts: 1,
        performance: {
          avgResponseTime: 2.1,
          qualityScore: 94,
          userEngagement: 87,
          systemUptime: 99.8
        },
        realtimeData: {
          reportsLastHour: 12,
          activeNow: 8,
          lastActivity: new Date(Date.now() - 5 * 60 * 1000)
        }
      },
      {
        facilityId: 'facility-2',
        facilityName: 'Urban Farms Inc',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        isOnline: true,
        healthScore: 91,
        activeUsers: 5,
        totalUsers: 8,
        recentAlerts: 0,
        performance: {
          avgResponseTime: 1.8,
          qualityScore: 91,
          userEngagement: 92,
          systemUptime: 99.5
        },
        realtimeData: {
          reportsLastHour: 8,
          activeNow: 5,
          lastActivity: new Date(Date.now() - 2 * 60 * 1000)
        }
      },
      {
        facilityId: 'facility-3',
        facilityName: 'Sunny Fields Nursery',
        coordinates: { lat: 32.7767, lng: -96.7970 },
        isOnline: false,
        healthScore: 65,
        activeUsers: 0,
        totalUsers: 3,
        recentAlerts: 3,
        performance: {
          avgResponseTime: 4.5,
          qualityScore: 76,
          userEngagement: 45,
          systemUptime: 89.2
        },
        realtimeData: {
          reportsLastHour: 0,
          activeNow: 0,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    setGlobalMetrics(mockGlobalMetrics);
    setFacilities(mockFacilities);
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-500 bg-green-500/10';
    if (score >= 85) return 'text-yellow-500 bg-yellow-500/10';
    if (score >= 70) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Chart configurations
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [32000, 35500, 38200, 41800, 44300, 47350],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const facilityHealthData = {
    labels: facilities.map(f => f.facilityName),
    datasets: [
      {
        label: 'Health Score',
        data: facilities.map(f => f.healthScore),
        backgroundColor: facilities.map(f => {
          if (f.healthScore >= 95) return 'rgba(34, 197, 94, 0.8)';
          if (f.healthScore >= 85) return 'rgba(251, 191, 36, 0.8)';
          if (f.healthScore >= 70) return 'rgba(251, 146, 60, 0.8)';
          return 'rgba(239, 68, 68, 0.8)';
        }),
        borderColor: facilities.map(f => {
          if (f.healthScore >= 95) return 'rgb(34, 197, 94)';
          if (f.healthScore >= 85) return 'rgb(251, 191, 36)';
          if (f.healthScore >= 70) return 'rgb(251, 146, 60)';
          return 'rgb(239, 68, 68)';
        }),
        borderWidth: 2
      }
    ]
  };

  const userEngagementData = {
    labels: ['High Engagement', 'Medium Engagement', 'Low Engagement', 'Inactive'],
    datasets: [
      {
        data: [12, 8, 5, 3],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2
      }
    ]
  };

  const performanceRadarData = {
    labels: ['Response Time', 'Quality Score', 'User Engagement', 'System Uptime', 'Report Volume'],
    datasets: [
      {
        label: 'Average Performance',
        data: [85, 89, 82, 96, 78],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgb(139, 92, 246)',
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(139, 92, 246)'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Monitor className="w-8 h-8 text-blue-400" />
              Admin Command Center
            </h1>
            <p className="text-gray-400 mt-1">Real-time visibility across all customer facilities</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Realtime:</span>
              <button
                onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  realtimeEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    realtimeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700">
              {(['grid', 'map', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            <button
              onClick={loadDashboardData}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        {globalMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <div className="flex items-center gap-1">
                  {getTrendIcon(globalMetrics.monthlyGrowth)}
                  <span className="text-sm font-medium">+{globalMetrics.monthlyGrowth}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold">${globalMetrics.totalRevenue.toLocaleString()}</p>
              <p className="text-green-100">Monthly Revenue</p>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{globalMetrics.activeFacilities}/{globalMetrics.totalFacilities}</span>
                </div>
              </div>
              <p className="text-3xl font-bold">{globalMetrics.totalFacilities}</p>
              <p className="text-blue-100">Total Facilities</p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8" />
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">{globalMetrics.activeUsers} active</span>
                </div>
              </div>
              <p className="text-3xl font-bold">{globalMetrics.totalUsers}</p>
              <p className="text-purple-100">Total Users</p>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Gauge className="w-8 h-8" />
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">{globalMetrics.systemHealth}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold">{globalMetrics.avgQualityScore}%</p>
              <p className="text-orange-100">Avg Quality Score</p>
            </div>
          </div>
        )}

        {/* Advanced Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Revenue Growth Trend
              </h3>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="h-64">
              <Line 
                data={revenueChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'rgba(59, 130, 246, 0.5)',
                      borderWidth: 1
                    }
                  },
                  scales: {
                    x: { 
                      grid: { color: 'rgba(75, 85, 99, 0.3)' },
                      ticks: { color: 'rgba(156, 163, 175, 1)' }
                    },
                    y: { 
                      grid: { color: 'rgba(75, 85, 99, 0.3)' },
                      ticks: { color: 'rgba(156, 163, 175, 1)' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* User Engagement Distribution */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Engagement Distribution
              </h3>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="h-64">
              <Doughnut 
                data={userEngagementData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: 'rgba(156, 163, 175, 1)' }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'white',
                      bodyColor: 'white'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Facility Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facility Health Scores */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Facility Health Scores
              </h3>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="h-64">
              <Bar 
                data={facilityHealthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'white',
                      bodyColor: 'white'
                    }
                  },
                  scales: {
                    x: { 
                      grid: { color: 'rgba(75, 85, 99, 0.3)' },
                      ticks: { color: 'rgba(156, 163, 175, 1)' }
                    },
                    y: { 
                      grid: { color: 'rgba(75, 85, 99, 0.3)' },
                      ticks: { color: 'rgba(156, 163, 175, 1)' },
                      min: 0,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Performance Radar */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                Performance Overview
              </h3>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="h-64">
              <Radar 
                data={performanceRadarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'white',
                      bodyColor: 'white'
                    }
                  },
                  scales: {
                    r: {
                      angleLines: { color: 'rgba(75, 85, 99, 0.3)' },
                      grid: { color: 'rgba(75, 85, 99, 0.3)' },
                      pointLabels: { color: 'rgba(156, 163, 175, 1)' },
                      ticks: { color: 'rgba(156, 163, 175, 1)' },
                      min: 0,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Real-time Facility Grid */}
        {viewMode === 'grid' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Live Facility Monitor
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Live Data</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map(facility => (
                <div key={facility.facilityId} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{facility.facilityName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {facility.isOnline ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs ${facility.isOnline ? 'text-green-400' : 'text-red-400'}`}>
                          {facility.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        facility.healthScore >= 95 ? 'text-green-500' :
                        facility.healthScore >= 85 ? 'text-yellow-500' :
                        facility.healthScore >= 70 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {facility.healthScore}%
                      </div>
                      <div className="text-xs text-gray-400">Health Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800 rounded p-2">
                      <div className="flex items-center gap-1 text-blue-400 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">Users</span>
                      </div>
                      <p className="text-white font-medium">{facility.activeUsers}/{facility.totalUsers}</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded p-2">
                      <div className="flex items-center gap-1 text-green-400 mb-1">
                        <Camera className="w-3 h-3" />
                        <span className="text-xs">Reports/hr</span>
                      </div>
                      <p className="text-white font-medium">{facility.realtimeData.reportsLastHour}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quality Score</span>
                      <span className="text-white">{facility.performance.qualityScore}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${facility.performance.qualityScore}%` }}
                      />
                    </div>
                  </div>

                  {facility.recentAlerts > 0 && (
                    <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-800/50 rounded flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-300">{facility.recentAlerts} active alerts</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>Last activity: {facility.realtimeData.lastActivity.toLocaleTimeString()}</span>
                    <button className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Real-time Activity Feed
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[
              { icon: <Camera className="w-4 h-4 text-blue-400" />, message: 'Spider mites detected at Green Valley Greenhouse', time: '2 min ago', severity: 'high' },
              { icon: <Scissors className="w-4 h-4 text-green-400" />, message: 'Harvest completed at Urban Farms Inc - Batch #VB-2024-052', time: '5 min ago', severity: 'normal' },
              { icon: <Droplets className="w-4 h-4 text-purple-400" />, message: 'Spray application started at Vertical Gardens Co', time: '8 min ago', severity: 'normal' },
              { icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />, message: 'Environmental sensor offline at Sunny Fields Nursery', time: '12 min ago', severity: 'medium' },
              { icon: <Users className="w-4 h-4 text-blue-400" />, message: 'New user registered at Green Valley Greenhouse', time: '15 min ago', severity: 'normal' },
              { icon: <Bug className="w-4 h-4 text-orange-400" />, message: 'IPM scouting route completed at Urban Farms Inc', time: '18 min ago', severity: 'normal' }
            ].map((activity, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                activity.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                activity.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                'bg-gray-900/50 border-gray-600'
              }`}>
                <div className="p-1">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}