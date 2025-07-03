'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Users,
  Link2,
  Copy,
  Download,
  Eye,
  MousePointer,
  UserPlus,
  BarChart3,
  Calendar,
  Settings,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Share2,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Crown,
  Star,
  Gift
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SmartCommissionCalculator, SMART_COMMISSION_TIERS } from '@/lib/affiliates/smart-commission-structure';

export default function AffiliateDashboardPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const affiliateId = 'aff_123456';
  const affiliateLink = `https://vibelux.com?ref=${affiliateId}`;
  
  // Mock data
  const stats = {
    totalEarnings: 12450,
    monthlyEarnings: 3200,
    pendingEarnings: 1450,
    totalClicks: 1247,
    totalSignups: 43,
    activeCustomers: 12,
    conversionRate: 3.45,
    averageOrderValue: 1037,
    activeReferrals: 28 // For tier calculation
  };

  // Get current tier based on active referrals
  const currentTier = SmartCommissionCalculator.getAffiliateTier(stats.activeReferrals);

  const earningsData = [
    { month: 'Jul', earnings: 1200, clicks: 150, signups: 5 },
    { month: 'Aug', earnings: 1800, clicks: 220, signups: 8 },
    { month: 'Sep', earnings: 2400, clicks: 310, signups: 11 },
    { month: 'Oct', earnings: 2850, clicks: 380, signups: 9 },
    { month: 'Nov', earnings: 3200, clicks: 410, signups: 10 },
    { month: 'Dec', earnings: 3650, clicks: 450, signups: 12 }
  ];

  const referrals = [
    {
      id: '1',
      name: 'Green Valley Farms',
      status: 'active',
      joinDate: '2024-10-15',
      monthlyRevenue: 1200,
      totalEarnings: 3600,
      plan: 'Yield Enhancement'
    },
    {
      id: '2',
      name: 'Urban Grow Co',
      status: 'active',
      joinDate: '2024-09-20',
      monthlyRevenue: 800,
      totalEarnings: 3200,
      plan: 'Energy Optimizer'
    },
    {
      id: '3',
      name: 'Sunshine Gardens',
      status: 'pending',
      joinDate: '2024-12-01',
      monthlyRevenue: 0,
      totalEarnings: 0,
      plan: 'Hybrid Optimizer'
    }
  ];

  const marketingMaterials = [
    {
      title: 'Email Templates',
      description: '5 proven email sequences',
      icon: Mail,
      link: '/affiliate/resources/emails'
    },
    {
      title: 'Social Media Kit',
      description: 'Graphics and copy for all platforms',
      icon: Share2,
      link: '/affiliate/resources/social'
    },
    {
      title: 'Landing Pages',
      description: '3 high-converting templates',
      icon: ExternalLink,
      link: '/affiliate/resources/landing'
    },
    {
      title: 'Webinar Slides',
      description: 'Complete presentation deck',
      icon: BarChart3,
      link: '/affiliate/resources/webinar'
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, Partner #{affiliateId}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/affiliate/settings"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </Link>
              <Link
                href="/affiliate/payout"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Request Payout
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Total Earnings</p>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Lifetime</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">This Month</p>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">${stats.monthlyEarnings.toLocaleString()}</p>
            <p className="text-sm text-green-400 mt-1">+15% from last month</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Active Customers</p>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.totalSignups} total signups</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Conversion Rate</p>
              <MousePointer className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
            <p className="text-sm text-gray-500 mt-1">{stats.totalClicks} clicks</p>
          </div>
        </div>

        {/* Affiliate Link */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/50 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Your Affiliate Link</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-800 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
              {affiliateLink}
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-gray-400">Share on:</p>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Facebook className="w-4 h-4 text-blue-400" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Twitter className="w-4 h-4 text-sky-400" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Linkedin className="w-4 h-4 text-blue-500" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Mail className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Tier Status */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Partner Tier</h2>
            <div className="flex items-center gap-2">
              {currentTier.id === 'gold' && <Crown className="w-5 h-5 text-yellow-400" />}
              {currentTier.id === 'silver' && <Award className="w-5 h-5 text-gray-300" />}
              {currentTier.id === 'bronze' && <Star className="w-5 h-5 text-orange-400" />}
              <span className={`font-semibold ${currentTier.color}`}>{currentTier.name}</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Commission Rates</p>
              <p className="text-lg font-bold text-white">
                {currentTier.subscriptionCustomers.months1to6}% → {currentTier.subscriptionCustomers.months37plus}%
              </p>
              <p className="text-sm text-gray-500">Subscription customers</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Revenue Sharing Rates</p>
              <p className="text-lg font-bold text-white">
                {currentTier.revenueSharingCustomers.months1to6}% → {currentTier.revenueSharingCustomers.months37plus}%
              </p>
              <p className="text-sm text-gray-500">Performance-based customers</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Next Tier Progress</p>
              <p className="text-lg font-bold text-white">
                {stats.activeReferrals} / {currentTier.id === 'bronze' ? '11' : currentTier.id === 'silver' ? '51' : '∞'}
              </p>
              <p className="text-sm text-gray-500">Active referrals</p>
            </div>
          </div>

          {/* Bonuses */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3">Current Bonuses</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-green-900/20 text-green-400 px-3 py-1 rounded-full text-sm">
                <Gift className="w-4 h-4" />
                ${currentTier.bonuses.signupBonus} signup bonus
              </div>
              <div className="flex items-center gap-2 bg-blue-900/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                ${currentTier.bonuses.qualityBonus} retention bonus
              </div>
              <div className="flex items-center gap-2 bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                <TrendingUp className="w-4 h-4" />
                +{currentTier.bonuses.growthBonus}% growth bonus
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Chart */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Earnings Overview</h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-6">Performance Metrics</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="clicks" fill="#8B5CF6" />
                  <Bar dataKey="signups" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-gray-400">Clicks</p>
                <p className="text-xl font-bold text-purple-400">{stats.totalClicks}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Signups</p>
                <p className="text-xl font-bold text-blue-400">{stats.totalSignups}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Conversion</p>
                <p className="text-xl font-bold text-green-400">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Your Referrals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Join Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Monthly Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-gray-800">
                    <td className="px-6 py-4 text-white">{referral.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'active' 
                          ? 'bg-green-900/20 text-green-400 border border-green-700/50'
                          : 'bg-yellow-900/20 text-yellow-400 border border-yellow-700/50'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{referral.joinDate}</td>
                    <td className="px-6 py-4 text-gray-300">{referral.plan}</td>
                    <td className="px-6 py-4 text-white">${referral.monthlyRevenue}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">${referral.totalEarnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Marketing Resources */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Marketing Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketingMaterials.map((material) => (
              <Link
                key={material.title}
                href={material.link}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-700 transition-all group"
              >
                <material.icon className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-semibold text-white mb-1">{material.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{material.description}</p>
                <div className="flex items-center text-purple-400 text-sm group-hover:translate-x-1 transition-transform">
                  Download <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Payout Information */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Payout Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-white">${stats.pendingEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Ready for withdrawal</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Next Payout</p>
              <p className="text-2xl font-bold text-white">Dec 15, 2024</p>
              <p className="text-sm text-gray-500 mt-1">Monthly schedule</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Payment Method</p>
              <p className="text-lg font-semibold text-white">ACH Transfer</p>
              <Link href="/affiliate/settings" className="text-sm text-purple-400 hover:text-purple-300 mt-1">
                Update payment info →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}