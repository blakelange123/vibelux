'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, Filter, Search, Calendar, DollarSign,
  TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, MessageSquare, Eye, Edit, Trash2, ChevronRight,
  BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface Offer {
  id: string;
  requestId: string;
  requestTitle: string;
  facilityName: string;
  equipmentType: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  equipmentValue: number;
  proposedRevShare: number;
  requestedRevShare: number;
  createdAt: string;
  expiresAt: string;
  message: string;
  viewCount: number;
  hasQuestions: boolean;
}

export default function EquipmentOffersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const offers: Offer[] = [
    {
      id: 'OFF-001',
      requestId: 'REQ-123',
      requestTitle: '500 LED Grow Lights for Expansion',
      facilityName: 'Green Valley Farms',
      equipmentType: 'LED Grow Lights',
      status: 'pending',
      equipmentValue: 420000,
      proposedRevShare: 11,
      requestedRevShare: 12,
      createdAt: '2024-02-18',
      expiresAt: '2024-02-25',
      message: 'We can provide Fluence SPYDR 2x lights at a competitive rate...',
      viewCount: 15,
      hasQuestions: true
    },
    {
      id: 'OFF-002',
      requestId: 'REQ-124',
      requestTitle: 'HVAC System Upgrade',
      facilityName: 'Urban Grow Co',
      equipmentType: 'HVAC System',
      status: 'accepted',
      equipmentValue: 85000,
      proposedRevShare: 10,
      requestedRevShare: 10,
      createdAt: '2024-02-15',
      expiresAt: '2024-02-22',
      message: 'Our climate control systems are perfect for your needs...',
      viewCount: 32,
      hasQuestions: false
    },
    {
      id: 'OFF-003',
      requestId: 'REQ-125',
      requestTitle: 'Automated Irrigation System',
      facilityName: 'Sunshine Gardens',
      equipmentType: 'Irrigation System',
      status: 'rejected',
      equipmentValue: 65000,
      proposedRevShare: 15,
      requestedRevShare: 12,
      createdAt: '2024-02-10',
      expiresAt: '2024-02-17',
      message: 'High-efficiency drip irrigation with smart controls...',
      viewCount: 8,
      hasQuestions: false
    }
  ];

  const stats = {
    totalOffers: offers.length,
    pendingOffers: offers.filter(o => o.status === 'pending').length,
    acceptedOffers: offers.filter(o => o.status === 'accepted').length,
    totalValue: offers.reduce((sum, o) => sum + o.equipmentValue, 0),
    avgRevShare: offers.reduce((sum, o) => sum + o.proposedRevShare, 0) / offers.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'accepted': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'withdrawn': return 'text-gray-400 bg-gray-400/10';
      case 'expired': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'withdrawn': return AlertCircle;
      case 'expired': return Calendar;
      default: return AlertCircle;
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredOffers = offers.filter(offer => {
    const matchesStatus = selectedStatus === 'all' || offer.status === selectedStatus;
    const matchesSearch = offer.requestTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
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
                <Link href="/equipment-board" className="hover:text-white transition-colors">Equipment Board</Link>
                <span>/</span>
                <span className="text-white">My Offers</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Equipment Offers</h1>
              <p className="text-gray-400">Manage your equipment investment offers</p>
            </div>
            <Link
              href="/equipment-board"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200"
            >
              Browse Requests
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalOffers}</div>
                  <div className="text-sm text-gray-400">Total Offers</div>
                </div>
                <Package className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingOffers}</div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.acceptedOffers}</div>
                  <div className="text-sm text-gray-400">Accepted</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">${(stats.totalValue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.avgRevShare.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Avg Rev Share</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  selectedStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
          >
            <option value="newest">Newest First</option>
            <option value="value-high">Highest Value</option>
            <option value="value-low">Lowest Value</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const StatusIcon = getStatusIcon(offer.status);
            const daysRemaining = getDaysRemaining(offer.expiresAt);
            const revShareDiff = offer.proposedRevShare - offer.requestedRevShare;
            
            return (
              <div
                key={offer.id}
                className="bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/equipment-board/${offer.requestId}`}
                        className="text-xl font-semibold text-white hover:text-purple-400 transition-colors"
                      >
                        {offer.requestTitle}
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {offer.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{offer.facilityName}</span>
                      <span>•</span>
                      <span>{offer.equipmentType}</span>
                      <span>•</span>
                      <span>Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {offer.status === 'pending' && (
                      <>
                        <Link
                          href={`/equipment-board/offers/${offer.id}/edit`}
                          className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Equipment Value</div>
                    <div className="text-xl font-semibold text-white">${offer.equipmentValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your Rev Share</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-white">{offer.proposedRevShare}%</span>
                      {revShareDiff !== 0 && (
                        <span className={`flex items-center gap-1 text-sm ${revShareDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {revShareDiff < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {Math.abs(revShareDiff)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Platform Fee (15%)</div>
                    <div className="text-xl font-semibold text-purple-400">${(offer.equipmentValue * 0.15).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      {offer.status === 'pending' ? 'Expires In' : 'Expired'}
                    </div>
                    <div className={`text-xl font-semibold ${daysRemaining > 3 ? 'text-white' : 'text-orange-400'}`}>
                      {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {offer.viewCount} views
                    </span>
                    {offer.hasQuestions && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <MessageSquare className="w-4 h-4" />
                        New questions
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/equipment-board/offers/${offer.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-white/10">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No offers found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or browse new equipment requests</p>
            <Link
              href="/equipment-board"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              Browse Equipment Requests
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Tips for Successful Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">Research the facility's needs and tailor your offer accordingly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">Competitive revenue share rates increase acceptance chances</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">Include warranty and maintenance in your offer for better appeal</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">Respond to questions promptly to build trust</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}