'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Handshake, Filter, Calendar, DollarSign, Shield,
  TrendingUp, Clock, CheckCircle, AlertTriangle, 
  FileText, Package, Truck, Activity, ChevronRight,
  Download, ExternalLink, Info, AlertCircle
} from 'lucide-react';

interface Match {
  id: string;
  requestTitle: string;
  equipmentType: string;
  investor: string;
  grower: string;
  status: 'pending_escrow' | 'in_escrow' | 'pending_delivery' | 'pending_verification' | 'active' | 'completed';
  equipmentValue: number;
  platformFee: number;
  revShareRate: number;
  monthlyRevShare: number;
  matchedAt: string;
  escrowStatus: 'pending' | 'funded' | 'released';
  deliveryStatus: 'pending' | 'shipped' | 'delivered' | 'installed';
  verificationSteps: {
    equipmentReceived: boolean;
    specsMet: boolean;
    installed: boolean;
    operational: boolean;
    iotConnected: boolean;
    performanceVerified: boolean;
  };
  nextAction: string;
  contractAddress?: string;
  escrowAddress?: string;
}

export default function EquipmentMatchesPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const matches: Match[] = [
    {
      id: 'MATCH-001',
      requestTitle: '500 LED Grow Lights for Expansion',
      equipmentType: 'LED Grow Lights',
      investor: 'Green Energy Partners',
      grower: 'Green Valley Farms',
      status: 'pending_verification',
      equipmentValue: 425000,
      platformFee: 63750,
      revShareRate: 12,
      monthlyRevShare: 4250,
      matchedAt: '2024-02-10',
      escrowStatus: 'funded',
      deliveryStatus: 'delivered',
      verificationSteps: {
        equipmentReceived: true,
        specsMet: true,
        installed: true,
        operational: false,
        iotConnected: false,
        performanceVerified: false
      },
      nextAction: 'Complete equipment verification',
      contractAddress: '0x123...abc',
      escrowAddress: '0x456...def'
    },
    {
      id: 'MATCH-002',
      requestTitle: 'HVAC System Upgrade',
      equipmentType: 'HVAC System',
      investor: 'Climate Control Ventures',
      grower: 'Urban Grow Co',
      status: 'in_escrow',
      equipmentValue: 85000,
      platformFee: 12750,
      revShareRate: 10,
      monthlyRevShare: 850,
      matchedAt: '2024-02-15',
      escrowStatus: 'funded',
      deliveryStatus: 'pending',
      verificationSteps: {
        equipmentReceived: false,
        specsMet: false,
        installed: false,
        operational: false,
        iotConnected: false,
        performanceVerified: false
      },
      nextAction: 'Awaiting equipment shipment',
      contractAddress: '0x789...ghi',
      escrowAddress: '0xabc...jkl'
    },
    {
      id: 'MATCH-003',
      requestTitle: 'Automated Irrigation System',
      equipmentType: 'Irrigation System',
      investor: 'AquaTech Investments',
      grower: 'Sunshine Gardens',
      status: 'active',
      equipmentValue: 65000,
      platformFee: 9750,
      revShareRate: 11,
      monthlyRevShare: 715,
      matchedAt: '2024-01-20',
      escrowStatus: 'released',
      deliveryStatus: 'installed',
      verificationSteps: {
        equipmentReceived: true,
        specsMet: true,
        installed: true,
        operational: true,
        iotConnected: true,
        performanceVerified: true
      },
      nextAction: 'Revenue sharing active',
      contractAddress: '0xmno...pqr',
      escrowAddress: '0xstu...vwx'
    }
  ];

  const stats = {
    totalMatches: matches.length,
    activeMatches: matches.filter(m => m.status === 'active').length,
    pendingVerification: matches.filter(m => m.status === 'pending_verification').length,
    totalValue: matches.reduce((sum, m) => sum + m.equipmentValue, 0),
    totalPlatformFees: matches.reduce((sum, m) => sum + m.platformFee, 0),
    monthlyRevShare: matches.filter(m => m.status === 'active').reduce((sum, m) => sum + m.monthlyRevShare, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_escrow': return 'text-yellow-400 bg-yellow-400/10';
      case 'in_escrow': return 'text-blue-400 bg-blue-400/10';
      case 'pending_delivery': return 'text-orange-400 bg-orange-400/10';
      case 'pending_verification': return 'text-purple-400 bg-purple-400/10';
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getVerificationProgress = (steps: Match['verificationSteps']) => {
    const completed = Object.values(steps).filter(v => v).length;
    const total = Object.values(steps).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const filteredMatches = matches.filter(match => {
    return selectedStatus === 'all' || match.status === selectedStatus;
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
                <span className="text-white">Matches</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Equipment Matches</h1>
              <p className="text-gray-400">Track your active equipment partnerships</p>
            </div>
            <Link
              href="/equipment-board"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200"
            >
              Browse More Equipment
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalMatches}</div>
                  <div className="text-sm text-gray-400">Total Matches</div>
                </div>
                <Handshake className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.activeMatches}</div>
                  <div className="text-sm text-gray-400">Active</div>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingVerification}</div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">${(stats.totalValue / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">${(stats.totalPlatformFees / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-400">Platform Fees</div>
                </div>
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">${stats.monthlyRevShare.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Monthly Rev</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {['all', 'active', 'pending_verification', 'in_escrow'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
          {filteredMatches.map((match) => {
            const progress = getVerificationProgress(match.verificationSteps);
            
            return (
              <div
                key={match.id}
                className="bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{match.requestTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{match.equipmentType}</span>
                        <span>•</span>
                        <span>Match ID: {match.id}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                      {getStatusLabel(match.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Investor</div>
                      <div className="text-white font-medium">{match.investor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Grower</div>
                      <div className="text-white font-medium">{match.grower}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Equipment Value</div>
                      <div className="text-lg font-semibold text-white">${(match.equipmentValue / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Platform Fee</div>
                      <div className="text-lg font-semibold text-purple-400">${(match.platformFee / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Rev Share</div>
                      <div className="text-lg font-semibold text-white">{match.revShareRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Monthly</div>
                      <div className="text-lg font-semibold text-green-400">${match.monthlyRevShare}</div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className={`p-3 rounded-lg ${match.escrowStatus === 'funded' ? 'bg-green-900/20' : 'bg-gray-800/50'}`}>
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${match.escrowStatus === 'funded' ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className={`text-sm ${match.escrowStatus === 'funded' ? 'text-green-400' : 'text-gray-400'}`}>
                          Escrow {match.escrowStatus}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${match.deliveryStatus === 'delivered' || match.deliveryStatus === 'installed' ? 'bg-green-900/20' : 'bg-gray-800/50'}`}>
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${match.deliveryStatus === 'delivered' || match.deliveryStatus === 'installed' ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className={`text-sm ${match.deliveryStatus === 'delivered' || match.deliveryStatus === 'installed' ? 'text-green-400' : 'text-gray-400'}`}>
                          {match.deliveryStatus.charAt(0).toUpperCase() + match.deliveryStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-400">
                          {progress.completed}/{progress.total} verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Progress */}
                  {match.status === 'pending_verification' && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Verification Progress</span>
                        <span className="text-sm text-white">{progress.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {Object.entries(match.verificationSteps).map(([step, completed]) => (
                          <div key={step} className="flex items-center gap-2 text-xs">
                            {completed ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-gray-600" />
                            )}
                            <span className={completed ? 'text-green-400' : 'text-gray-500'}>
                              {step.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Action */}
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Next: {match.nextAction}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Matched {new Date(match.matchedAt).toLocaleDateString()}</span>
                      {match.contractAddress && (
                        <a
                          href={`https://etherscan.io/address/${match.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                        >
                          Contract
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <Link
                      href={`/equipment-board/matches/${match.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-white/10">
            <Handshake className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
            <p className="text-gray-400 mb-6">Start by browsing equipment requests or submitting offers</p>
            <Link
              href="/equipment-board"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              Browse Equipment Board
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Platform Fee Notice */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Escrow Protection</h3>
              <p className="text-gray-300 mb-3">
                All equipment matches are protected by our smart escrow system. The 15% platform fee ensures:
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Secure fund holding until equipment verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Automated release upon successful installation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Dispute resolution and platform support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Ongoing revenue share management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}