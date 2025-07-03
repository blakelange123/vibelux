'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, Download, RefreshCw, DollarSign, 
  UserCheck, UserX, Edit, Eye, Send, AlertCircle,
  TrendingUp, Users, CreditCard, Activity
} from 'lucide-react';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  tier: 'bronze' | 'silver' | 'gold';
  joinDate: string;
  totalEarnings: number;
  pendingCommissions: number;
  activeReferrals: number;
  conversionRate: number;
  lastActivity: string;
  stripeConnected: boolean;
  taxFormSubmitted: boolean;
}

export default function AdminAffiliatesPage() {
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<string>('');

  // Mock data - would come from database
  const affiliates: Affiliate[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@growbetter.com',
      code: 'GROW2024',
      status: 'active',
      tier: 'silver',
      joinDate: '2024-01-15',
      totalEarnings: 4521.83,
      pendingCommissions: 287.50,
      activeReferrals: 23,
      conversionRate: 12.5,
      lastActivity: '2 hours ago',
      stripeConnected: true,
      taxFormSubmitted: true
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@urbanharvest.io',
      code: 'URBAN10',
      status: 'pending',
      tier: 'bronze',
      joinDate: '2024-11-20',
      totalEarnings: 0,
      pendingCommissions: 0,
      activeReferrals: 0,
      conversionRate: 0,
      lastActivity: '1 day ago',
      stripeConnected: false,
      taxFormSubmitted: false
    }
  ];

  const stats = {
    totalAffiliates: 156,
    activeAffiliates: 142,
    monthlyCommissions: 45782.50,
    averageConversion: 8.7
  };

  const handleAction = (affiliate: Affiliate, action: string) => {
    setSelectedAffiliate(affiliate);
    setActionType(action);
    setShowActionModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Management</h1>
          <p className="text-gray-600 mt-2">Full administrative control over the affiliate program</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAffiliates}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAffiliates}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Commissions</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyCommissions.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Conversion</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageConversion}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Process All Payouts
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Approve Pending
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync Stripe Data
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Affiliates</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search affiliates..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                        <div className="text-sm text-gray-500">{affiliate.email}</div>
                        <div className="text-xs text-gray-400">Code: {affiliate.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          affiliate.status === 'active' ? 'bg-green-100 text-green-800' :
                          affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          affiliate.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {affiliate.status}
                        </span>
                        <div className="flex gap-2">
                          {!affiliate.stripeConnected && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              No Stripe
                            </span>
                          )}
                          {!affiliate.taxFormSubmitted && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              No Tax Form
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        affiliate.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        affiliate.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {affiliate.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ${affiliate.totalEarnings.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Pending: ${affiliate.pendingCommissions.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {affiliate.activeReferrals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {affiliate.conversionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(affiliate, 'view')}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(affiliate, 'edit')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(affiliate, 'payout')}
                          className="text-green-600 hover:text-green-900"
                          title="Manual Payout"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        {affiliate.status === 'active' ? (
                          <button
                            onClick={() => handleAction(affiliate, 'suspend')}
                            className="text-red-600 hover:text-red-900"
                            title="Suspend"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(affiliate, 'activate')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && selectedAffiliate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">
                {actionType === 'view' && 'Affiliate Details'}
                {actionType === 'edit' && 'Edit Affiliate'}
                {actionType === 'payout' && 'Manual Payout'}
                {actionType === 'suspend' && 'Suspend Affiliate'}
                {actionType === 'activate' && 'Activate Affiliate'}
              </h3>

              {actionType === 'edit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue={selectedAffiliate.name}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedAffiliate.email}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Code</label>
                    <input
                      type="text"
                      defaultValue={selectedAffiliate.code}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                    <select
                      defaultValue={selectedAffiliate.tier}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Override (%)
                    </label>
                    <input
                      type="number"
                      placeholder="Leave blank for default rates"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Internal notes about this affiliate..."
                    />
                  </div>
                </div>
              )}

              {actionType === 'payout' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pending Commissions</p>
                    <p className="text-2xl font-bold">${selectedAffiliate.pendingCommissions.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payout Amount</label>
                    <input
                      type="number"
                      defaultValue={selectedAffiliate.pendingCommissions}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Regular Payout</option>
                      <option>Early Payout Request</option>
                      <option>Bonus Payment</option>
                      <option>Adjustment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Optional notes about this payout..."
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle action
                    setShowActionModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {actionType === 'edit' && 'Save Changes'}
                  {actionType === 'payout' && 'Process Payout'}
                  {actionType === 'suspend' && 'Suspend Affiliate'}
                  {actionType === 'activate' && 'Activate Affiliate'}
                  {actionType === 'view' && 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}