'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Handshake,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  FileText,
  Download,
  Calendar,
  Target,
  Award,
  BookOpen,
  MessageSquare,
  Building,
  Globe,
  Briefcase,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Share2,
  Megaphone,
  ShoppingCart,
  CreditCard,
  Gift
} from 'lucide-react';
import Link from 'next/link';

interface PartnerData {
  tier: 'silver' | 'gold' | 'platinum';
  status: 'active' | 'pending' | 'suspended';
  since: Date;
  commissionRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeDeals: number;
  closedDeals: number;
  registeredLeads: number;
  conversionRate: number;
}

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  status: 'new' | 'qualified' | 'in_progress' | 'won' | 'lost';
  value: number;
  registeredAt: Date;
  lastActivity: Date;
  notes?: string;
}

interface Deal {
  id: string;
  leadId: string;
  customerName: string;
  product: string;
  value: number;
  commission: number;
  status: 'pending' | 'approved' | 'paid';
  closedAt: Date;
  paidAt?: Date;
}

export default function PartnerPortalPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'deals' | 'resources' | 'training'>('overview');
  const [showRegisterLeadModal, setShowRegisterLeadModal] = useState(false);

  // Mock partner data
  const partnerData: PartnerData = {
    tier: 'gold',
    status: 'active',
    since: new Date('2023-06-15'),
    commissionRate: 20,
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    activeDeals: 8,
    closedDeals: 23,
    registeredLeads: 45,
    conversionRate: 51.1
  };

  const leads: Lead[] = [
    {
      id: '1',
      companyName: 'Green Valley Farms',
      contactName: 'John Smith',
      email: 'john@greenvalley.com',
      phone: '+1 555-0123',
      status: 'in_progress',
      value: 25000,
      registeredAt: new Date('2024-01-10'),
      lastActivity: new Date('2024-01-18'),
      notes: 'Interested in Professional plan for 3 facilities'
    },
    {
      id: '2',
      companyName: 'Urban Harvest Co',
      contactName: 'Sarah Chen',
      email: 'sarah@urbanharvest.com',
      status: 'qualified',
      value: 45000,
      registeredAt: new Date('2024-01-12'),
      lastActivity: new Date('2024-01-15')
    }
  ];

  const deals: Deal[] = [
    {
      id: '1',
      leadId: '3',
      customerName: 'Fresh Greens Inc',
      product: 'Enterprise Plan - Annual',
      value: 35000,
      commission: 7000,
      status: 'paid',
      closedAt: new Date('2023-12-15'),
      paidAt: new Date('2024-01-01')
    },
    {
      id: '2',
      leadId: '4',
      customerName: 'Vertical Farms LLC',
      product: 'Professional Plan - Annual',
      value: 12000,
      commission: 2400,
      status: 'approved',
      closedAt: new Date('2024-01-05')
    }
  ];

  const [newLead, setNewLead] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    estimatedValue: '',
    notes: ''
  });

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return {
          commission: 25,
          support: 'Dedicated account manager',
          training: 'Custom training programs',
          marketing: '$10,000 MDF annually',
          perks: ['Early access to features', 'Co-marketing opportunities', 'Executive briefings']
        };
      case 'gold':
        return {
          commission: 20,
          support: 'Priority support',
          training: 'Quarterly training sessions',
          marketing: '$5,000 MDF annually',
          perks: ['Beta access', 'Joint case studies', 'Partner badge']
        };
      case 'silver':
        return {
          commission: 15,
          support: 'Standard support',
          training: 'Online training resources',
          marketing: '$2,000 MDF annually',
          perks: ['Partner portal access', 'Sales materials', 'Referral tools']
        };
      default:
        return null;
    }
  };

  const benefits = getTierBenefits(partnerData.tier);

  const handleRegisterLead = () => {
    setShowRegisterLeadModal(false);
    setNewLead({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      estimatedValue: '',
      notes: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Partner Portal</h1>
            <p className="text-gray-400">Manage your partnership and grow together</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${
              partnerData.tier === 'platinum' ? 'bg-purple-600/20 text-purple-400' :
              partnerData.tier === 'gold' ? 'bg-yellow-600/20 text-yellow-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              <span className="font-medium capitalize">{partnerData.tier} Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-400">+15%</span>
          </div>
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-white">${partnerData.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-blue-400">{partnerData.activeDeals} active</span>
          </div>
          <p className="text-sm text-gray-400">Registered Leads</p>
          <p className="text-2xl font-bold text-white">{partnerData.registeredLeads}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-sm text-gray-400">Conversion Rate</p>
          <p className="text-2xl font-bold text-white">{partnerData.conversionRate}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-yellow-600" />
            <span className="text-sm text-gray-400">This month</span>
          </div>
          <p className="text-sm text-gray-400">Commission Earned</p>
          <p className="text-2xl font-bold text-white">${(partnerData.monthlyRevenue * partnerData.commissionRate / 100).toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'leads'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Lead Management
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'deals'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Deals & Commissions
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'resources'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'training'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Training
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Partnership Benefits */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Partnership Benefits</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Commission Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-1">{benefits?.commission}%</p>
                  <p className="text-sm text-gray-400">On all referred sales</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Marketing Fund</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400 mb-1">{benefits?.marketing}</p>
                  <p className="text-sm text-gray-400">Available this year</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-white font-medium mb-3">Exclusive Perks</h4>
                <div className="space-y-2">
                  {benefits?.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">Deal closed: Urban Harvest Co</p>
                    <p className="text-sm text-gray-400">Commission: $2,400 approved</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">New lead registered: Green Valley Farms</p>
                    <p className="text-sm text-gray-400">Estimated value: $25,000</p>
                    <p className="text-xs text-gray-500">5 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">Achieved Gold Partner status</p>
                    <p className="text-sm text-gray-400">Unlocked 20% commission rate</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowRegisterLeadModal(true)}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Register New Lead
                </button>
                <Link
                  href="/partner-portal/resources"
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Sales Materials
                </Link>
                <Link
                  href="/partner-portal/training"
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Training Portal
                </Link>
              </div>
            </div>

            {/* Partner Manager */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Partner Manager</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Michael Torres</p>
                  <p className="text-sm text-gray-400">Partner Success Manager</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Manager
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Available Mon-Fri, 9am-6pm PST
              </p>
            </div>

            {/* Next Tier Progress */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Next Tier Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Platinum Status</span>
                  <span className="text-white">75%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Revenue Target</span>
                  <span className="text-white">$125K / $150K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Deals Closed</span>
                  <span className="text-white">23 / 30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option>All Status</option>
                <option>New</option>
                <option>Qualified</option>
                <option>In Progress</option>
                <option>Won</option>
                <option>Lost</option>
              </select>
            </div>
            <button
              onClick={() => setShowRegisterLeadModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Register Lead
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Registered</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-t border-gray-700">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{lead.companyName}</p>
                      <p className="text-sm text-gray-400">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{lead.contactName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'won' ? 'bg-green-600/20 text-green-400' :
                        lead.status === 'in_progress' ? 'bg-yellow-600/20 text-yellow-400' :
                        lead.status === 'qualified' ? 'bg-blue-600/20 text-blue-400' :
                        lead.status === 'lost' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">${lead.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {lead.registeredAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-green-400 hover:text-green-300">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Pending Commissions</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${deals.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.commission, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Paid This Year</p>
              <p className="text-2xl font-bold text-green-400">
                ${deals.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.commission, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Next Payout</p>
              <p className="text-2xl font-bold text-white">Feb 1, 2024</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Deal Value</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Commission</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="border-t border-gray-700">
                    <td className="px-6 py-4 text-white">{deal.customerName}</td>
                    <td className="px-6 py-4 text-gray-300">{deal.product}</td>
                    <td className="px-6 py-4 text-gray-300">${deal.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">
                      ${deal.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        deal.status === 'paid' ? 'bg-green-600/20 text-green-400' :
                        deal.status === 'approved' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {deal.closedAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/partner-portal/resources/sales-deck"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Sales Presentations</h3>
            <p className="text-sm text-gray-400">Latest pitch decks and demos</p>
          </Link>

          <Link
            href="/partner-portal/resources/marketing"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <Megaphone className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Marketing Materials</h3>
            <p className="text-sm text-gray-400">Co-branded assets and campaigns</p>
          </Link>

          <Link
            href="/partner-portal/resources/pricing"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <CreditCard className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Pricing & Discounts</h3>
            <p className="text-sm text-gray-400">Partner pricing and deal registration</p>
          </Link>

          <Link
            href="/partner-portal/resources/technical"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <Package className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Technical Resources</h3>
            <p className="text-sm text-gray-400">Integration guides and API docs</p>
          </Link>

          <Link
            href="/partner-portal/resources/competitive"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <Target className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Competitive Intel</h3>
            <p className="text-sm text-gray-400">Battlecards and comparisons</p>
          </Link>

          <Link
            href="/partner-portal/resources/success-stories"
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
          >
            <Award className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Success Stories</h3>
            <p className="text-sm text-gray-400">Case studies and testimonials</p>
          </Link>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Certification Progress</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Sales Certification</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Completed Jan 2024</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Technical Certification</span>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">In Progress</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Advanced Solutions</span>
                  <Circle className="w-5 h-5 text-gray-400" />
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-600" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Not Started</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-white font-medium mb-4">Available Courses</h4>
              <div className="space-y-3">
                <Link
                  href="/partner-portal/training/sales-fundamentals"
                  className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-white">Sales Fundamentals</p>
                    <p className="text-sm text-gray-400">2 hours • Beginner</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link
                  href="/partner-portal/training/product-deep-dive"
                  className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-white">Product Deep Dive</p>
                    <p className="text-sm text-gray-400">4 hours • Intermediate</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link
                  href="/partner-portal/training/solution-architecture"
                  className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-white">Solution Architecture</p>
                    <p className="text-sm text-gray-400">6 hours • Advanced</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-white font-medium mb-4">Upcoming Webinars</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-white font-medium">Q1 Product Roadmap</p>
                  <p className="text-sm text-gray-400">Jan 25, 2024 • 2:00 PM PST</p>
                  <button className="mt-2 text-sm text-green-400 hover:text-green-300">
                    Register →
                  </button>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-white font-medium">Selling to Enterprise</p>
                  <p className="text-sm text-gray-400">Feb 1, 2024 • 10:00 AM PST</p>
                  <button className="mt-2 text-sm text-green-400 hover:text-green-300">
                    Register →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Lead Modal */}
      {showRegisterLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Register New Lead</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newLead.companyName}
                  onChange={(e) => setNewLead({...newLead, companyName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={newLead.contactName}
                    onChange={(e) => setNewLead({...newLead, contactName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Deal Value
                  </label>
                  <input
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({...newLead, estimatedValue: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="$0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Any additional information about this lead..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRegisterLeadModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterLead}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Register Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}