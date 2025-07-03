'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Bug, Wrench, Shield, Eye, Package, Zap, Droplets, Users, MapPin,
  Calendar, DollarSign, Target, Activity, BarChart3
} from 'lucide-react';

interface VisualOperationsDashboardProps {
  facilityId: string;
}

interface DashboardStats {
  totalReports: number;
  criticalIssues: number;
  completedTasks: number;
  avgResponseTime: number;
  costSavings: number;
  activeAlerts: number;
}

interface RecentReport {
  id: string;
  type: 'ipm' | 'maintenance' | 'safety' | 'quality' | 'inventory';
  title: string;
  roomZone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'analyzing' | 'assigned' | 'in_progress' | 'completed';
  reportedBy: string;
  timestamp: Date;
  aiConfidence?: number;
  estimatedCost?: number;
  photoUrl?: string;
}

export function VisualOperationsDashboard({ facilityId }: VisualOperationsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    criticalIssues: 0,
    completedTasks: 0,
    avgResponseTime: 0,
    costSavings: 0,
    activeAlerts: 0
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [trendData, setTrendData] = useState({
    reports: { current: 24, previous: 18, trend: 'up' },
    response: { current: 1.2, previous: 2.1, trend: 'down' },
    costs: { current: 2400, previous: 3200, trend: 'down' }
  });

  useEffect(() => {
    fetchDashboardData();
  }, [facilityId, timeframe]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const statsResponse = await fetch(`/api/visual-ops/dashboard/stats?facilityId=${facilityId}&timeframe=${timeframe}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent reports
      const reportsResponse = await fetch(`/api/visual-ops/dashboard/recent?facilityId=${facilityId}&limit=10`);
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setRecentReports(reportsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ipm': return <Bug className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'safety': return <Shield className="w-5 h-5" />;
      case 'quality': return <Eye className="w-5 h-5" />;
      case 'inventory': return <Package className="w-5 h-5" />;
      default: return <Camera className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'imp': return 'text-red-600 bg-red-50';
      case 'maintenance': return 'text-orange-600 bg-orange-50';
      case 'safety': return 'text-red-700 bg-red-100';
      case 'quality': return 'text-indigo-600 bg-indigo-50';
      case 'inventory': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-200';
      case 'high': return 'text-orange-800 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-800 bg-green-100 border-green-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing': return <Activity className="w-4 h-4 animate-spin" />;
      case 'assigned': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visual Operations Intelligence</h1>
            <p className="text-gray-600">AI-powered facility monitoring and management</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                <div className="flex items-center gap-1 mt-1">
                  {trendData.reports.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-500">vs {trendData.reports.previous}</span>
                </div>
              </div>
              <Camera className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
                <p className="text-sm text-gray-500">Need immediate attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                <p className="text-sm text-gray-500">This period</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-blue-600">{trendData.response.current}h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">vs {trendData.response.previous}h</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold text-green-600">${stats.costSavings.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">vs ${trendData.costs.previous.toLocaleString()}</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeAlerts}</p>
                <p className="text-sm text-gray-500">Require action</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Photo Reports</h2>
              <p className="text-gray-600">Latest issues reported by your team</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentReports.slice(0, 8).map((report) => (
                  <div key={report.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{report.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{report.roomZone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{report.reportedBy}</span>
                        </div>
                        <span>{report.timestamp.toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusIcon(report.status)}
                          <span className="capitalize">{report.status.replace('_', ' ')}</span>
                          {report.aiConfidence && (
                            <span className="text-gray-500">• {Math.round(report.aiConfidence * 100)}% confidence</span>
                          )}
                        </div>
                        
                        {report.estimatedCost && (
                          <span className="text-sm font-medium text-green-600">
                            ${report.estimatedCost.toLocaleString()} estimated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics & Trends */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Performance Analytics</h2>
              <p className="text-gray-600">AI insights and operational trends</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Issue Type Breakdown */}
              <div>
                <h3 className="font-medium mb-3">Issue Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-red-500" />
                      <span>Pest/Disease</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div className="w-3/4 h-2 bg-red-500 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-orange-500" />
                      <span>Equipment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div className="w-1/2 h-2 bg-orange-500 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-600">50%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-700" />
                      <span>Safety</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div className="w-1/4 h-2 bg-red-700 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Performance */}
              <div>
                <h3 className="font-medium mb-3">AI Detection Accuracy</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pest Detection</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Equipment Issues</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Safety Hazards</span>
                    <span className="font-medium">96%</span>
                  </div>
                </div>
              </div>

              {/* Cost Impact */}
              <div>
                <h3 className="font-medium mb-3">Cost Impact Analysis</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${(stats.costSavings * 4).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">
                    Projected annual savings from early detection
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    Based on current prevention rate and historical costs
                  </div>
                </div>
              </div>

              {/* Response Time Trends */}
              <div>
                <h3 className="font-medium mb-3">Response Time Improvement</h3>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  67%
                </div>
                <div className="text-sm text-gray-600">
                  Faster issue resolution vs. manual reporting
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}