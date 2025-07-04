'use client';

import React, { useState } from 'react';
import { 
  Shield, CheckCircle, Clock, AlertTriangle, 
  FileText, Database, Search, Filter, 
  Calendar, User, Activity, Download,
  Camera, Scale, Thermometer, FlaskConical
} from 'lucide-react';

interface VerificationRecord {
  id: string;
  type: 'weight' | 'quality' | 'compliance' | 'security';
  timestamp: string;
  verifier: string;
  status: 'verified' | 'pending' | 'failed';
  details: any;
  evidence: string[];
}

export default function VerificationPage() {
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock verification records
  const verificationRecords: VerificationRecord[] = [
    {
      id: 'VER-2024-001',
      type: 'weight',
      timestamp: new Date().toISOString(),
      verifier: 'John Smith',
      status: 'verified',
      details: {
        batchId: 'B-2024-0315',
        weightBefore: '45.2 lbs',
        weightAfter: '8.1 lbs',
        dryingTime: '7 days',
        moistureContent: '8.2%'
      },
      evidence: ['weight-before.jpg', 'weight-after.jpg', 'moisture-reading.jpg']
    },
    {
      id: 'VER-2024-002',
      type: 'quality',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      verifier: 'Sarah Johnson',
      status: 'verified',
      details: {
        batchId: 'B-2024-0312',
        thcLevel: '22.4%',
        cbdLevel: '0.8%',
        testingLab: 'Green Lab Analytics',
        coaNumber: 'COA-2024-0892'
      },
      evidence: ['lab-results.pdf', 'sample-photo.jpg']
    },
    {
      id: 'VER-2024-003',
      type: 'compliance',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      verifier: 'Mike Davis',
      status: 'pending',
      details: {
        packageId: 'PKG-2024-0456',
        stateSystem: 'METRC',
        tagNumber: '1A4FF0100000022000000123',
        requiresSync: true
      },
      evidence: ['package-label.jpg', 'metrc-screenshot.png']
    }
  ];

  const verificationStats = {
    total: 1247,
    verified: 1198,
    pending: 35,
    failed: 14,
    successRate: 96.1
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Scale className="w-5 h-5 text-blue-500" />;
      case 'quality':
        return <FlaskConical className="w-5 h-5 text-purple-500" />;
      case 'compliance':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'security':
        return <Camera className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    
    return date.toLocaleDateString();
  };

  const filteredRecords = verificationRecords.filter(record => {
    const matchesType = !filterType || record.type === filterType;
    const matchesStatus = !filterStatus || record.status === filterStatus;
    const matchesSearch = !searchTerm || 
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.verifier.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Verification Center
          </h1>
          <p className="text-gray-600 mt-2">
            Track and verify all compliance-related activities and measurements
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{verificationStats.total}</p>
              </div>
              <Database className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verificationStats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{verificationStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{verificationStats.failed}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{verificationStats.successRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="weight">Weight Verification</option>
                <option value="quality">Quality Testing</option>
                <option value="compliance">Compliance Check</option>
                <option value="security">Security Audit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verifier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        <span className="capitalize">{record.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {record.verifier}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`text-sm capitalize ${
                          record.status === 'verified' ? 'text-green-600' :
                          record.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4 text-gray-400" />
                        {record.evidence.length} files
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Details Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Verification Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Record ID</label>
                    <p className="text-gray-900">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedRecord.type)}
                      <span className="capitalize">{selectedRecord.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="text-gray-900">{new Date(selectedRecord.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Verifier</label>
                    <p className="text-gray-900">{selectedRecord.verifier}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedRecord.status)}
                    <span className={`capitalize ${
                      selectedRecord.status === 'verified' ? 'text-green-600' :
                      selectedRecord.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Details</label>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4">
                    {Object.entries(selectedRecord.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Evidence Files</label>
                  <div className="mt-2 space-y-2">
                    {selectedRecord.evidence.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{file}</span>
                        <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}