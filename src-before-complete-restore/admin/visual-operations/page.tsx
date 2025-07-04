'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Camera, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  Eye, Filter, Search, ChevronRight, Award, BarChart3, Shield,
  Bug, Wrench, Package, Zap, MessageSquare, X, Check, XCircle,
  Calendar, Download, RefreshCw, Star, Activity, MapPin,
  GraduationCap, BookOpen, Target, Trophy
} from 'lucide-react';

interface PhotoReport {
  id: string;
  type: 'pest' | 'equipment' | 'safety' | 'quality' | 'inventory' | 'other';
  status: 'pending_review' | 'approved' | 'rejected' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  photoUrl: string;
  location: string;
  reportedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  aiAnalysis: {
    confidence: number;
    detectedIssues: string[];
    estimatedCost?: number;
    urgency: string;
  };
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  stats: {
    totalReports: number;
    approvedReports: number;
    accuracy: number;
    responseTime: number; // minutes
    badges: string[];
  };
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  lastActive: Date;
}

export default function VisualOperationsAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'workers' | 'training' | 'analytics'>('overview');
  const [selectedReport, setSelectedReport] = useState<PhotoReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in production, fetch from API
  const mockReports: PhotoReport[] = [
    {
      id: '1',
      type: 'pest',
      status: 'pending_review',
      severity: 'high',
      title: 'Spider mites detected on plants in Veg Room 3',
      description: 'Multiple plants showing signs of spider mite infestation',
      photoUrl: '/mock-photo-1.jpg',
      location: 'Veg Room 3, Row 4',
      reportedBy: { id: '1', name: 'John Smith' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      aiAnalysis: {
        confidence: 0.94,
        detectedIssues: ['Spider mites', 'Leaf damage'],
        estimatedCost: 5000,
        urgency: 'Immediate action required'
      }
    },
    {
      id: '2',
      type: 'equipment',
      status: 'approved',
      severity: 'medium',
      title: 'HVAC fan making unusual noise',
      description: 'Grinding noise from fan unit, possible bearing issue',
      photoUrl: '/mock-photo-2.jpg',
      location: 'Flower Room 2',
      reportedBy: { id: '2', name: 'Sarah Johnson' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      aiAnalysis: {
        confidence: 0.87,
        detectedIssues: ['Bearing wear', 'Vibration detected'],
        estimatedCost: 450,
        urgency: 'Schedule maintenance within 48 hours'
      },
      reviewedBy: 'Mike Davis',
      reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];

  const mockWorkers: Worker[] = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Cultivation Tech',
      department: 'Growing Operations',
      stats: {
        totalReports: 156,
        approvedReports: 148,
        accuracy: 94.8,
        responseTime: 12,
        badges: ['pest_detective', 'quick_reporter', 'top_performer']
      },
      performance: {
        daily: 8,
        weekly: 42,
        monthly: 156
      },
      lastActive: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Maintenance Tech',
      department: 'Facilities',
      stats: {
        totalReports: 89,
        approvedReports: 85,
        accuracy: 95.5,
        responseTime: 8,
        badges: ['equipment_expert', 'safety_champion']
      },
      performance: {
        daily: 5,
        weekly: 28,
        monthly: 89
      },
      lastActive: new Date(Date.now() - 45 * 60 * 1000)
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return Bug;
      case 'equipment': return Wrench;
      case 'safety': return Shield;
      case 'quality': return Eye;
      case 'inventory': return Package;
      case 'electrical': return Zap;
      default: return Camera;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'text-yellow-500 bg-yellow-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      case 'resolved': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-600/10 border-red-600/20';
      case 'high': return 'text-orange-600 bg-orange-600/10 border-orange-600/20';
      case 'medium': return 'text-yellow-600 bg-yellow-600/10 border-yellow-600/20';
      case 'low': return 'text-green-600 bg-green-600/10 border-green-600/20';
      default: return 'text-gray-600 bg-gray-600/10 border-gray-600/20';
    }
  };

  const handleApproveReport = (reportId: string) => {
    // In production, make API call to approve report
    // Audit log: Report approved
    setSelectedReport(null);
  };

  const handleRejectReport = (reportId: string) => {
    // In production, make API call to reject report
    // Audit log: Report rejected
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-purple-500" />
                Visual Operations Admin
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'reports', label: 'Photo Reports', icon: Camera },
              { id: 'workers', label: 'Workers', icon: Users },
              { id: 'training', label: 'Training', icon: GraduationCap },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <span className="text-xs text-gray-500">Today</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">18</div>
                <div className="text-sm text-gray-400">Pending Reviews</div>
                <div className="mt-3 text-xs text-yellow-500">
                  ↑ 5 from yesterday
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-xs text-gray-500">This Week</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">234</div>
                <div className="text-sm text-gray-400">Reports Processed</div>
                <div className="mt-3 text-xs text-green-500">
                  94% approval rate
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">7</div>
                <div className="text-sm text-gray-400">Critical Issues</div>
                <div className="mt-3 text-xs text-red-500">
                  Immediate action required
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">42</div>
                <div className="text-sm text-gray-400">Active Workers</div>
                <div className="mt-3 text-xs text-purple-500">
                  89% participation rate
                </div>
              </div>
            </div>

            {/* Recent Critical Issues */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Recent Critical Issues
              </h2>
              <div className="space-y-4">
                {mockReports
                  .filter(r => r.severity === 'high' || r.severity === 'critical')
                  .slice(0, 3)
                  .map(report => {
                    const Icon = getTypeIcon(report.type);
                    return (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getSeverityColor(report.severity)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{report.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span>{report.reportedBy.name}</span>
                              <span>•</span>
                              <span>{report.location}</span>
                              <span>•</span>
                              <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                        >
                          Review Now
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Performers This Week
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockWorkers.slice(0, 3).map((worker, index) => (
                  <div key={worker.id} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {worker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{worker.name}</h3>
                        <p className="text-sm text-gray-400">{worker.role}</p>
                      </div>
                      {index === 0 && (
                        <div className="ml-auto">
                          <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Reports</span>
                        <p className="font-medium text-white">{worker.performance.weekly}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Accuracy</span>
                        <p className="font-medium text-green-500">{worker.stats.accuracy}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {/* Filters */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="pest">Pest/Disease</option>
                  <option value="equipment">Equipment</option>
                  <option value="safety">Safety</option>
                  <option value="quality">Quality</option>
                  <option value="inventory">Inventory</option>
                </select>

                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {mockReports.map(report => {
                const Icon = getTypeIcon(report.type);
                return (
                  <div key={report.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getSeverityColor(report.severity)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{report.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {report.reportedBy.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {report.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(report.timestamp).toLocaleString()}
                          </div>
                        </div>

                        {report.aiAnalysis && (
                          <div className="bg-gray-900 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">AI Analysis</span>
                              <span className="text-sm text-purple-400">{Math.round(report.aiAnalysis.confidence * 100)}% confidence</span>
                            </div>
                            <div className="text-sm text-gray-300">
                              <p className="mb-1">Issues: {report.aiAnalysis.detectedIssues.join(', ')}</p>
                              <p className="mb-1">Urgency: {report.aiAnalysis.urgency}</p>
                              {report.aiAnalysis.estimatedCost && (
                                <p>Estimated Cost: ${report.aiAnalysis.estimatedCost.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Review Report
                          </button>
                          {report.status === 'pending_review' && (
                            <>
                              <button
                                onClick={() => handleApproveReport(report.id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectReport(report.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <div>
            {/* Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockWorkers.map(worker => (
                <div key={worker.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {worker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{worker.name}</h3>
                        <p className="text-sm text-gray-400">{worker.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Activity className={`w-5 h-5 ${
                        new Date(worker.lastActive).getTime() > Date.now() - 60 * 60 * 1000
                          ? 'text-green-500'
                          : 'text-gray-500'
                      }`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{worker.performance.daily}</div>
                      <div className="text-xs text-gray-400">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{worker.performance.weekly}</div>
                      <div className="text-xs text-gray-400">This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{worker.performance.monthly}</div>
                      <div className="text-xs text-gray-400">This Month</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Accuracy Rate</span>
                      <span className="text-green-500 font-medium">{worker.stats.accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Avg Response Time</span>
                      <span className="text-blue-500 font-medium">{worker.stats.responseTime} min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {worker.stats.badges.slice(0, 3).map(badge => (
                      <div key={badge} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                        {badge.replace('_', ' ')}
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-8">
            {/* Training Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="w-8 h-8 text-purple-500" />
                  <span className="text-xs text-gray-500">Active</span>
                </div>
                <p className="text-3xl font-bold text-white">38</p>
                <p className="text-sm text-gray-400">Workers in Training</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-blue-500" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <p className="text-3xl font-bold text-white">15</p>
                <p className="text-sm text-gray-400">Training Modules</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <span className="text-xs text-gray-500">Issued</span>
                </div>
                <p className="text-3xl font-bold text-white">156</p>
                <p className="text-sm text-gray-400">Certifications</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-green-500" />
                  <span className="text-xs text-gray-500">Average</span>
                </div>
                <p className="text-3xl font-bold text-white">89%</p>
                <p className="text-sm text-gray-400">Completion Rate</p>
              </div>
            </div>
            
            {/* Module Performance */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Module Performance</h3>
              <div className="space-y-3">
                {[
                  { name: 'Visual Operations Basics', completions: 42, avgScore: 92, color: 'purple' },
                  { name: 'Pest & Disease Identification', completions: 38, avgScore: 87, color: 'red' },
                  { name: 'Equipment & Safety Reporting', completions: 35, avgScore: 94, color: 'orange' },
                  { name: 'Quality Control Documentation', completions: 28, avgScore: 89, color: 'blue' },
                  { name: 'Compliance & Audit Documentation', completions: 22, avgScore: 91, color: 'green' }
                ].map(module => (
                  <div key={module.name} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{module.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>{module.completions} completions</span>
                        <span>•</span>
                        <span>Avg: {module.avgScore}%</span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-${module.color}-500 h-2 rounded-full`}
                          style={{ width: `${module.avgScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Certification Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Expiring Certifications</h3>
                <div className="space-y-3">
                  {[
                    { worker: 'John Smith', cert: 'Safety Champion', days: 12 },
                    { worker: 'Sarah Johnson', cert: 'Equipment Specialist', days: 18 },
                    { worker: 'Mike Davis', cert: 'Visual Operations Expert', days: 25 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{item.worker}</p>
                        <p className="text-sm text-gray-400">{item.cert}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        item.days <= 14 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {item.days} days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Training Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    Create New Module
                  </button>
                  <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                    Assign Training
                  </button>
                  <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                    Export Training Report
                  </button>
                  <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                    Manage Certifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Performance Metrics</h2>
              <div className="text-center py-12 text-gray-400">
                Analytics charts and graphs would be displayed here
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Review Photo Report</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Photo Section */}
                <div>
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
                    <div className="aspect-video bg-gray-700 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-600" />
                      <span className="ml-2 text-gray-500">Photo would be displayed here</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">AI Analysis</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-purple-400">{Math.round(selectedReport.aiAnalysis.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Detected Issues</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedReport.aiAnalysis.detectedIssues.map(issue => (
                            <span key={issue} className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Urgency</span>
                        <p className="text-white mt-1">{selectedReport.aiAnalysis.urgency}</p>
                      </div>
                      {selectedReport.aiAnalysis.estimatedCost && (
                        <div>
                          <span className="text-gray-400">Estimated Cost</span>
                          <p className="text-white mt-1">${selectedReport.aiAnalysis.estimatedCost.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{selectedReport.title}</h3>
                      <p className="text-gray-300">{selectedReport.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Reported By</span>
                        <p className="text-white font-medium">{selectedReport.reportedBy.name}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Location</span>
                        <p className="text-white font-medium">{selectedReport.location}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Timestamp</span>
                        <p className="text-white font-medium">{new Date(selectedReport.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Severity</span>
                        <p className={`font-medium capitalize ${getSeverityColor(selectedReport.severity)}`}>
                          {selectedReport.severity}
                        </p>
                      </div>
                    </div>

                    {/* Action Form */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Review Actions</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Comments</label>
                          <textarea
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                            rows={3}
                            placeholder="Add review comments..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Assign To</label>
                          <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                            <option>Select team member...</option>
                            <option>Maintenance Team</option>
                            <option>Growing Team</option>
                            <option>Safety Officer</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Priority Override</label>
                          <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                            <option>Keep AI recommendation</option>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApproveReport(selectedReport.id)}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve & Create Work Order
                      </button>
                      <button
                        onClick={() => handleRejectReport(selectedReport.id)}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}