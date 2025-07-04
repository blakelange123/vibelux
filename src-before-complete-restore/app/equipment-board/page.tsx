'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Package, Search, Filter, Plus, DollarSign, Clock, MapPin, 
  Users, TrendingUp, Shield, CheckCircle, AlertCircle, Calendar,
  Building, ChevronRight, Eye, MessageSquare, Zap, Award,
  BarChart3, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface EquipmentRequest {
  id: string;
  title: string;
  equipmentType: string;
  estimatedValue: number;
  proposedRevShare: number;
  termMonths: number;
  neededBy: string;
  status: string;
  viewCount: number;
  facility: {
    id: string;
    name: string;
    type: string;
    city: string;
    state: string;
  };
  requester: {
    id: string;
    name: string;
  };
  _count: {
    offers: number;
    questions: number;
  };
  createdAt: string;
}

export default function EquipmentBoardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    equipmentType: '',
    minValue: '',
    maxValue: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalValue: 0,
    avgRevShare: 0,
    activeInvestors: 0
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/equipment-requests?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // In a real implementation, this would be a separate API call
    setStats({
      totalRequests: 42,
      totalValue: 2850000,
      avgRevShare: 12.5,
      activeInvestors: 18
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-green-400 bg-green-400/10';
      case 'REVIEWING_OFFERS': return 'text-yellow-400 bg-yellow-400/10';
      case 'MATCHED': return 'text-blue-400 bg-blue-400/10';
      case 'IN_ESCROW': return 'text-purple-400 bg-purple-400/10';
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTimeRemaining = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Equipment Request Board</h1>
              <p className="text-gray-400">Connect growers with equipment investors - 15% platform fee on successful matches</p>
            </div>
            <Link
              href="/equipment-board/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Post Request
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-400" />
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalRequests}</div>
              <div className="text-sm text-gray-400">Active Requests</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{formatCurrency(stats.totalValue)}</div>
              <div className="text-sm text-gray-400">Total Value</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <span className="text-sm text-gray-400">{stats.avgRevShare}%</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.avgRevShare}%</div>
              <div className="text-sm text-gray-400">Avg Revenue Share</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-pink-400" />
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.activeInvestors}</div>
              <div className="text-sm text-gray-400">Active Investors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="REVIEWING_OFFERS">Reviewing Offers</option>
                <option value="MATCHED">Matched</option>
              </select>

              <select
                value={filters.equipmentType}
                onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="">All Equipment</option>
                <option value="LED">LED Lights</option>
                <option value="HVAC">HVAC Systems</option>
                <option value="SENSORS">Sensors</option>
                <option value="AUTOMATION">Automation</option>
              </select>

              <input
                type="number"
                placeholder="Min Value"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400"
              />

              <input
                type="number"
                placeholder="Max Value"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Request Cards */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-gray-400">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                Loading equipment requests...
              </div>
            </div>
          ) : (requests || []).length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-white/10">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No equipment requests found</h3>
              <p className="text-gray-400 mb-6">Be the first to post an equipment request!</p>
              <Link
                href="/equipment-board/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Post Request
              </Link>
            </div>
          ) : (
            (requests || []).map((request) => (
              <div
                key={request.id}
                className="bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {request.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {request.facility.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.facility.city}, {request.facility.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeRemaining(request.neededBy)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{formatCurrency(request.estimatedValue)}</div>
                      <div className="text-sm text-gray-400">Equipment Value</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Equipment Type</div>
                      <div className="text-white font-medium">{request.equipmentType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Revenue Share</div>
                      <div className="text-white font-medium">{request.proposedRevShare}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Term Length</div>
                      <div className="text-white font-medium">{request.termMonths} months</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Platform Fee</div>
                      <div className="text-purple-400 font-medium">15% ({formatCurrency(request.estimatedValue * 0.15)})</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {request.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {request._count.offers} offers
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {request._count.questions} questions
                      </span>
                    </div>
                    <Link
                      href={`/equipment-board/${request.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Platform Fee Notice */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">15% Platform Fee Protection</h3>
              <p className="text-gray-300 mb-3">
                VibeLux charges a 15% platform fee on all successful equipment matches. This fee ensures:
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Smart escrow protection for both parties
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Equipment verification and quality assurance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Automated revenue sharing and payment processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Dispute resolution and platform support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}