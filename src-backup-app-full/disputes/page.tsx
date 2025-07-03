'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, Shield, Clock, CheckCircle, XCircle,
  MessageSquare, FileText, Search, Filter, Plus,
  TrendingUp, Users, Calendar, ChevronRight,
  AlertTriangle, HelpCircle, Scale
} from 'lucide-react';

interface Dispute {
  id: string;
  title: string;
  agreementId: string;
  equipmentType: string;
  status: 'open' | 'in_review' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lastUpdate: string;
  messages: number;
  category: string;
}

export default function DisputesPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const disputes: Dispute[] = [
    {
      id: 'DSP-001',
      title: 'Equipment performance below target',
      agreementId: 'AGR-123',
      equipmentType: 'HVAC System',
      status: 'in_review',
      priority: 'high',
      createdAt: '2024-02-18',
      lastUpdate: '2024-02-20',
      messages: 5,
      category: 'Performance'
    },
    {
      id: 'DSP-002',
      title: 'Sensor data discrepancy',
      agreementId: 'AGR-124',
      equipmentType: 'LED Grow Lights',
      status: 'open',
      priority: 'medium',
      createdAt: '2024-02-19',
      lastUpdate: '2024-02-19',
      messages: 2,
      category: 'Data Accuracy'
    },
    {
      id: 'DSP-003',
      title: 'Payout calculation error',
      agreementId: 'AGR-125',
      equipmentType: 'Irrigation System',
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-02-10',
      lastUpdate: '2024-02-15',
      messages: 8,
      category: 'Financial'
    }
  ];

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    inReview: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    avgResolutionTime: '3.2 days'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-400 bg-yellow-400/10';
      case 'in_review': return 'text-blue-400 bg-blue-400/10';
      case 'resolved': return 'text-green-400 bg-green-400/10';
      case 'escalated': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Performance': return TrendingUp;
      case 'Data Accuracy': return AlertTriangle;
      case 'Financial': return Scale;
      default: return HelpCircle;
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesStatus = selectedStatus === 'all' || dispute.status === selectedStatus;
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-white">Dispute Resolution</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Dispute Center</h1>
              <p className="text-gray-400">Resolve issues with your revenue sharing agreements</p>
            </div>
            <Link
              href="/disputes/new"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Dispute
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total Disputes</div>
                </div>
                <AlertCircle className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.open}</div>
                  <div className="text-sm text-gray-400">Open</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{stats.inReview}</div>
                  <div className="text-sm text-gray-400">In Review</div>
                </div>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
                  <div className="text-sm text-gray-400">Resolved</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.avgResolutionTime}</div>
                  <div className="text-sm text-gray-400">Avg Resolution</div>
                </div>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'open', 'in_review', 'resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Disputes List */}
            <div className="space-y-4">
              {filteredDisputes.map((dispute) => {
                const CategoryIcon = getCategoryIcon(dispute.category);
                return (
                  <Link
                    key={dispute.id}
                    href={`/disputes/${dispute.id}`}
                    className="block bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1">{dispute.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>ID: {dispute.id}</span>
                            <span>•</span>
                            <span>{dispute.equipmentType}</span>
                            <span>•</span>
                            <span>{dispute.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(dispute.priority)}`} />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {dispute.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Created {new Date(dispute.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Updated {new Date(dispute.lastUpdate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          {dispute.messages} messages
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredDisputes.length === 0 && (
              <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-white/10">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No disputes found</h3>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dispute Process */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Dispute Process</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-yellow-400">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Submit Dispute</h4>
                    <p className="text-xs text-gray-400 mt-1">Provide details and evidence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-400">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Platform Review</h4>
                    <p className="text-xs text-gray-400 mt-1">We verify claims and data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-purple-400">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Resolution</h4>
                    <p className="text-xs text-gray-400 mt-1">Fair decision based on evidence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-green-400">4</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Implementation</h4>
                    <p className="text-xs text-gray-400 mt-1">Automatic execution via smart contract</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Common Issues</h3>
              <div className="space-y-3">
                <Link
                  href="/help/performance-issues"
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-300">Performance Below Target</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/help/sensor-accuracy"
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-300">Sensor Data Issues</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/help/payout-calculations"
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-300">Payout Calculations</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Our support team is here to help resolve disputes fairly and quickly.
              </p>
              <Link
                href="/support"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}