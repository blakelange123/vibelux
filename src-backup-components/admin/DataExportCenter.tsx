'use client';

import React, { useState, useEffect } from 'react';
import {
  Download, Calendar, Filter, FileText, Database, Image,
  BarChart3, Users, Clock, CheckCircle, AlertTriangle,
  Eye, Settings, RefreshCw, Archive, Shield
} from 'lucide-react';

interface ExportRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  requestedBy: string;
  requestedByName: string;
  exportType: 'full' | 'reports' | 'analytics' | 'compliance' | 'custom';
  dataTypes: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileSize?: number;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

interface DataExportStats {
  totalRequests: number;
  pendingRequests: number;
  completedToday: number;
  storageUsed: number;
  topExportTypes: Array<{ type: string; count: number }>;
}

export default function DataExportCenter() {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [stats, setStats] = useState<DataExportStats | null>(null);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [showCreateExport, setShowCreateExport] = useState(false);

  useEffect(() => {
    loadExportRequests();
    loadStats();
  }, [selectedFacility, dateRange]);

  const loadExportRequests = async () => {
    // Mock data - in production, fetch from API
    const mockRequests: ExportRequest[] = [
      {
        id: 'exp-001',
        facilityId: 'facility-1',
        facilityName: 'Green Valley Greenhouse',
        requestedBy: 'user-123',
        requestedByName: 'John Smith',
        exportType: 'full',
        dataTypes: ['photo_reports', 'harvest_data', 'environmental_data', 'ipm_scouting'],
        dateRange: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        format: 'xlsx',
        status: 'completed',
        fileSize: 15728640, // 15MB
        downloadUrl: '/api/exports/exp-001/download',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'exp-002',
        facilityId: 'facility-2',
        facilityName: 'Urban Farms Inc',
        requestedBy: 'user-456',
        requestedByName: 'Sarah Johnson',
        exportType: 'compliance',
        dataTypes: ['spray_applications', 'training_records', 'audit_logs'],
        dateRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        format: 'pdf',
        status: 'processing',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];

    setExportRequests(mockRequests);
  };

  const loadStats = async () => {
    const mockStats: DataExportStats = {
      totalRequests: 156,
      pendingRequests: 3,
      completedToday: 12,
      storageUsed: 2.4, // GB
      topExportTypes: [
        { type: 'Analytics Reports', count: 45 },
        { type: 'Photo Reports', count: 38 },
        { type: 'Compliance Data', count: 28 },
        { type: 'Harvest Data', count: 25 },
        { type: 'Full Export', count: 20 }
      ]
    };

    setStats(mockStats);
  };

  const handleCreateExport = async (exportConfig: any) => {
    // In production, create export request
    console.log('Creating export:', exportConfig);
    setShowCreateExport(false);
    loadExportRequests();
  };

  const handleDownload = async (requestId: string) => {
    // In production, generate download link with authentication
    const request = exportRequests.find(r => r.id === requestId);
    if (request?.downloadUrl) {
      window.open(request.downloadUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'processing': return 'text-yellow-500 bg-yellow-500/10';
      case 'pending': return 'text-blue-500 bg-blue-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-400" />
            Data Export Center
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateExport(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              New Export
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('customer')}
            className={`py-3 border-b-2 transition-colors font-medium ${
              activeTab === 'customer'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Customer Exports
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 border-b-2 transition-colors font-medium ${
              activeTab === 'admin'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Admin Overview
          </button>
        </div>
      </div>

      {activeTab === 'customer' && (
        <>
          {/* Export Requests */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Export Requests</h2>
              
              <div className="flex items-center gap-4">
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Facilities</option>
                  <option value="facility-1">Green Valley Greenhouse</option>
                  <option value="facility-2">Urban Farms Inc</option>
                  <option value="facility-3">Vertical Gardens Co</option>
                </select>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange({...dateRange, start: new Date(e.target.value)})}
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange({...dateRange, end: new Date(e.target.value)})}
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Export</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {exportRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{request.id}</div>
                          <div className="text-sm text-gray-400">by {request.requestedByName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">{request.facilityName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-white capitalize">{request.exportType}</span>
                          <span className="text-xs text-gray-400 uppercase">{request.format}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {request.fileSize ? formatFileSize(request.fileSize) : '-'}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {request.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {request.status === 'completed' && (
                            <button
                              onClick={() => handleDownload(request.id)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                          )}
                          <button
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
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

      {activeTab === 'admin' && stats && (
        <>
          {/* Admin Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Archive className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalRequests}</p>
              <p className="text-sm text-gray-400">Export Requests</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-yellow-500" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-400">In Queue</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Database className="w-8 h-8 text-purple-500" />
                <span className="text-xs text-gray-500">Storage</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.storageUsed}GB</p>
              <p className="text-sm text-gray-400">Used</p>
            </div>
          </div>

          {/* Top Export Types */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Popular Export Types
            </h3>
            
            <div className="space-y-3">
              {stats.topExportTypes.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                    <span className="text-white">{type.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-700 rounded-full h-2 w-24">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(type.count / Math.max(...stats.topExportTypes.map(t => t.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-8 text-right">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Export Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg hover:bg-blue-900/30 transition-colors">
                <Shield className="w-6 h-6 text-blue-400 mb-2" />
                <p className="font-medium text-white">Data Privacy Controls</p>
                <p className="text-sm text-gray-400">Manage data access and retention</p>
              </button>
              
              <button className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg hover:bg-green-900/30 transition-colors">
                <Archive className="w-6 h-6 text-green-400 mb-2" />
                <p className="font-medium text-white">Bulk Export Tools</p>
                <p className="text-sm text-gray-400">Export multiple facilities</p>
              </button>
              
              <button className="p-4 bg-purple-900/20 border border-purple-800/50 rounded-lg hover:bg-purple-900/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
                <p className="font-medium text-white">Usage Analytics</p>
                <p className="text-sm text-gray-400">Export patterns and insights</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Export Modal */}
      {showCreateExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Create New Export</h3>
            
            {/* Export configuration form would go here */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Export Type</label>
                <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                  <option value="full">Full Data Export</option>
                  <option value="reports">Photo Reports Only</option>
                  <option value="analytics">Analytics Data</option>
                  <option value="compliance">Compliance Records</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {['CSV', 'JSON', 'XLSX', 'PDF'].map(format => (
                    <button
                      key={format}
                      className="py-2 px-3 bg-gray-900 border border-gray-700 rounded-lg text-white hover:border-blue-500 transition-colors"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateExport(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateExport({})}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}