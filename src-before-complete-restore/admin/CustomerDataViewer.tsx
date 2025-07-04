'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye, Users, Building2, BarChart3, Camera, Bug, Scissors,
  Droplets, Calendar, MapPin, TrendingUp, AlertTriangle,
  Filter, Search, ChevronDown, ChevronRight, RefreshCw,
  Shield, Clock, Activity, Database, Download, Settings
} from 'lucide-react';

interface CustomerFacility {
  id: string;
  name: string;
  type: 'greenhouse' | 'indoor_vertical' | 'nursery' | 'processing';
  address: string;
  isActive: boolean;
  lastActivity: Date;
  metrics: {
    totalReports: number;
    activeUsers: number;
    harvestBatches: number;
    sprayApplications: number;
    avgResponseTime: number; // hours
    qualityScore: number;
  };
  subscription: {
    plan: 'essential' | 'professional' | 'enterprise';
    features: string[];
    expiresAt: Date;
  };
}

interface CustomerOverview {
  facilityId: string;
  facilityName: string;
  recentActivity: Array<{
    id: string;
    type: 'photo_report' | 'harvest' | 'spray_application' | 'ipm_scouting';
    title: string;
    user: string;
    timestamp: Date;
    status: string;
  }>;
  performanceMetrics: {
    reportsThisWeek: number;
    avgResolveTime: number;
    qualityTrend: number;
    userEngagement: number;
  };
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

export default function CustomerDataViewer() {
  const [activeTab, setActiveTab] = useState<'overview' | 'facilities' | 'analytics' | 'exports'>('overview');
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<CustomerFacility[]>([]);
  const [customerOverview, setCustomerOverview] = useState<CustomerOverview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      loadCustomerOverview(selectedFacility);
    }
  }, [selectedFacility]);

  const loadFacilities = async () => {
    // Mock data - in production, fetch from admin API
    const mockFacilities: CustomerFacility[] = [
      {
        id: 'facility-1',
        name: 'Green Valley Greenhouse',
        type: 'greenhouse',
        address: '123 Farm Road, California, USA',
        isActive: true,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        metrics: {
          totalReports: 342,
          activeUsers: 15,
          harvestBatches: 28,
          sprayApplications: 67,
          avgResponseTime: 2.4,
          qualityScore: 92
        },
        subscription: {
          plan: 'professional',
          features: ['visual_ops', 'ipm_scouting', 'harvest_tracking', 'analytics'],
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'facility-2',
        name: 'Urban Farms Inc',
        type: 'indoor_vertical',
        address: '456 City Center, New York, USA',
        isActive: true,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metrics: {
          totalReports: 189,
          activeUsers: 8,
          harvestBatches: 45,
          sprayApplications: 23,
          avgResponseTime: 1.8,
          qualityScore: 87
        },
        subscription: {
          plan: 'enterprise',
          features: ['visual_ops', 'ipm_scouting', 'harvest_tracking', 'spray_tracking', 'analytics', 'api_access'],
          expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'facility-3',
        name: 'Sunny Fields Nursery',
        type: 'nursery',
        address: '789 Garden Way, Texas, USA',
        isActive: false,
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        metrics: {
          totalReports: 78,
          activeUsers: 3,
          harvestBatches: 12,
          sprayApplications: 34,
          avgResponseTime: 4.2,
          qualityScore: 78
        },
        subscription: {
          plan: 'essential',
          features: ['visual_ops', 'basic_analytics'],
          expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    setFacilities(mockFacilities);
  };

  const loadCustomerOverview = async (facilityId: string) => {
    // Mock data - in production, fetch detailed customer data
    const mockOverview: CustomerOverview = {
      facilityId,
      facilityName: facilities.find(f => f.id === facilityId)?.name || 'Unknown',
      recentActivity: [
        {
          id: 'activity-1',
          type: 'photo_report',
          title: 'Spider mites detected in Veg Room 3',
          user: 'John Smith',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'pending_review'
        },
        {
          id: 'activity-2',
          type: 'harvest',
          title: 'Purple Punch batch VB-2024-001 completed',
          user: 'Maria Rodriguez',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'completed'
        },
        {
          id: 'activity-3',
          type: 'spray_application',
          title: 'Neem oil application in Flower Room 2',
          user: 'James Wilson',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'completed'
        }
      ],
      performanceMetrics: {
        reportsThisWeek: 23,
        avgResolveTime: 2.4,
        qualityTrend: 8.5,
        userEngagement: 78
      },
      alerts: [
        {
          id: 'alert-1',
          severity: 'medium',
          message: 'Environmental sensor offline in Zone 3',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
          id: 'alert-2',
          severity: 'low',
          message: 'Subscription expires in 45 days',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    };

    setCustomerOverview(mockOverview);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-500 bg-purple-500/10';
      case 'professional': return 'text-blue-500 bg-blue-500/10';
      case 'essential': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'photo_report': return <Camera className="w-4 h-4 text-blue-400" />;
      case 'harvest': return <Scissors className="w-4 h-4 text-green-400" />;
      case 'spray_application': return <Droplets className="w-4 h-4 text-purple-400" />;
      case 'ipm_scouting': return <Bug className="w-4 h-4 text-orange-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = searchQuery === '' || 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || facility.subscription.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="w-7 h-7 text-blue-400" />
            Customer Data Viewer
          </h1>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-700">
          {(['overview', 'facilities', 'analytics', 'exports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 border-b-2 transition-colors capitalize font-medium ${
                activeTab === tab
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facility Selector */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Select Facility</h3>
              
              <div className="space-y-3">
                {facilities.slice(0, 5).map(facility => (
                  <button
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedFacility === facility.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{facility.name}</span>
                      <div className={`w-2 h-2 rounded-full ${facility.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {facility.metrics.activeUsers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {facility.metrics.totalReports}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Overview */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFacility && customerOverview ? (
              <>
                {/* Performance Metrics */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">{customerOverview.facilityName} - Performance</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs">Reports</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{customerOverview.performanceMetrics.reportsThisWeek}</p>
                      <p className="text-xs text-gray-400">This week</p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Resolve Time</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{customerOverview.performanceMetrics.avgResolveTime}h</p>
                      <p className="text-xs text-gray-400">Average</p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">Quality</span>
                      </div>
                      <p className="text-2xl font-bold text-white">+{customerOverview.performanceMetrics.qualityTrend}%</p>
                      <p className="text-xs text-gray-400">This month</p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs">Engagement</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{customerOverview.performanceMetrics.userEngagement}%</p>
                      <p className="text-xs text-gray-400">User activity</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  
                  <div className="space-y-3">
                    {customerOverview.recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="font-medium text-white">{activity.title}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>by {activity.user}</span>
                            <span>{activity.timestamp.toLocaleTimeString()}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              activity.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                {customerOverview.alerts.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Alerts</h3>
                    
                    <div className="space-y-3">
                      {customerOverview.alerts.map(alert => (
                        <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5" />
                              <div>
                                <p className="font-medium">{alert.message}</p>
                                <p className="text-xs opacity-70 mt-1">{alert.timestamp.toLocaleString()}</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium uppercase">{alert.severity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a facility to view customer data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'facilities' && (
        <>
          {/* Filters */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search facilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Plans</option>
                <option value="essential">Essential</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Facilities List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reports</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredFacilities.map(facility => (
                    <tr key={facility.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{facility.name}</div>
                          <div className="text-sm text-gray-400">{facility.address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPlanColor(facility.subscription.plan)}`}>
                          {facility.subscription.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{facility.metrics.activeUsers}</td>
                      <td className="px-6 py-4 text-white">{facility.metrics.totalReports}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-700 rounded-full h-2 w-16">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${facility.metrics.qualityScore}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{facility.metrics.qualityScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`w-2 h-2 rounded-full ${facility.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedFacility(facility.id)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => setShowDetails(facility.id)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Settings"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Other tabs would be implemented similarly */}
    </div>
  );
}