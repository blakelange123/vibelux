'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, Download, Calendar, User, 
  Activity, AlertTriangle, CheckCircle, XCircle,
  Clock, Shield, DollarSign
} from 'lucide-react';
import { AuditAction } from '@/lib/audit-logger';

interface AuditLogView {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure' | 'partial';
  duration: number;
  ipAddress: string;
  details: any;
}

export default function AuditLogsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogView | null>(null);

  // Mock data - would come from API
  const logs: AuditLogView[] = [
    {
      id: 'audit_1',
      timestamp: new Date().toISOString(),
      userEmail: 'admin@vibelux.com',
      action: AuditAction.AFFILIATE_UPDATE,
      resource: 'affiliate',
      resourceId: 'aff_123',
      status: 'success',
      duration: 145,
      ipAddress: '192.168.1.1',
      details: {
        changes: {
          tier: { from: 'bronze', to: 'silver' },
          commissionOverride: { from: null, to: 25 }
        }
      }
    },
    {
      id: 'audit_2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userEmail: 'admin@vibelux.com',
      action: AuditAction.PAYOUT_MANUAL,
      resource: 'payout',
      resourceId: 'pay_456',
      status: 'success',
      duration: 2341,
      ipAddress: '192.168.1.1',
      details: {
        amount: 287.50,
        affiliateId: 'aff_123',
        reason: 'Early payout request'
      }
    },
    {
      id: 'audit_3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      userEmail: 'support@vibelux.com',
      action: AuditAction.AFFILIATE_SUSPEND,
      resource: 'affiliate',
      resourceId: 'aff_789',
      status: 'failure',
      duration: 89,
      ipAddress: '10.0.0.5',
      details: {
        error: 'Affiliate has pending payouts',
        attemptedReason: 'Suspicious activity'
      }
    }
  ];

  const getActionIcon = (action: string) => {
    if (action.includes('payout')) return <DollarSign className="w-4 h-4" />;
    if (action.includes('affiliate')) return <User className="w-4 h-4" />;
    if (action.includes('system')) return <Shield className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">Track all administrative actions and system changes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Actions</p>
                <p className="text-2xl font-bold text-red-600">19</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <input
                type="text"
                placeholder="Filter by user..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Actions</option>
                <option value="affiliate">Affiliate Management</option>
                <option value="payout">Payouts</option>
                <option value="system">System Changes</option>
                <option value="permission">Permissions</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Clear Filters
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {log.action.replace('.', ' ').toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                      {log.resourceId && (
                        <span className="text-gray-500 text-xs ml-1">
                          ({log.resourceId})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        <span className={`text-sm ${
                          log.status === 'success' ? 'text-green-600' :
                          log.status === 'failure' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(log.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Audit Log Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Log ID</label>
                  <p className="text-gray-900">{selectedLog.id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                  <p className="text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-gray-900">{selectedLog.userEmail}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Action</label>
                  <p className="text-gray-900">{selectedLog.action}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Details</label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}