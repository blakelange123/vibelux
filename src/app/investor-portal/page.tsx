'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Download,
  Lock,
  Bell,
  MessageSquare,
  Shield,
  Building,
  Globe,
  Target,
  Activity,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface InvestorData {
  investmentAmount: number;
  investmentDate: Date;
  ownershipPercentage: number;
  shareClass: string;
  boardSeat: boolean;
  currentValuation: number;
  irr: number;
  multiple: number;
}

interface CompanyMetrics {
  revenue: {
    current: number;
    growth: number;
    arr: number;
  };
  users: {
    total: number;
    growth: number;
    churn: number;
  };
  financial: {
    runway: number;
    burnRate: number;
    grossMargin: number;
  };
}

export default function InvestorPortalPage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'reports' | 'updates'>('overview');

  // Mock investor data
  const investorData: InvestorData = {
    investmentAmount: 5000000,
    investmentDate: new Date('2023-06-15'),
    ownershipPercentage: 12.5,
    shareClass: 'Series A Preferred',
    boardSeat: true,
    currentValuation: 50000000,
    irr: 35.2,
    multiple: 2.8
  };

  const companyMetrics: CompanyMetrics = {
    revenue: {
      current: 8500000,
      growth: 145,
      arr: 12000000
    },
    users: {
      total: 2847,
      growth: 32,
      churn: 3.2
    },
    financial: {
      runway: 18,
      burnRate: 450000,
      grossMargin: 72
    }
  };

  const documents = [
    {
      id: '1',
      name: 'Q4 2024 Financial Report',
      type: 'financial',
      date: new Date('2024-01-15'),
      size: '2.4 MB',
      confidential: true
    },
    {
      id: '2',
      name: 'Board Meeting Deck - January 2024',
      type: 'board',
      date: new Date('2024-01-10'),
      size: '8.7 MB',
      confidential: true
    },
    {
      id: '3',
      name: 'Series A Investment Agreement',
      type: 'legal',
      date: new Date('2023-06-15'),
      size: '1.2 MB',
      confidential: true
    },
    {
      id: '4',
      name: '2024 Annual Operating Plan',
      type: 'strategy',
      date: new Date('2023-12-20'),
      size: '3.5 MB',
      confidential: true
    }
  ];

  const updates = [
    {
      id: '1',
      title: 'December 2024 Investor Update',
      date: new Date('2024-01-05'),
      summary: 'Record revenue month, new enterprise partnerships, and product roadmap update.',
      highlights: [
        'Revenue up 28% MoM',
        'Signed 3 enterprise deals',
        '2 key hires in engineering'
      ]
    },
    {
      id: '2',
      title: 'Q3 2024 Performance Report',
      date: new Date('2023-10-15'),
      summary: 'Strong quarter with significant growth in key metrics and market expansion.',
      highlights: [
        'ARR crossed $10M',
        'Launched in 2 new markets',
        'NPS score improved to 72'
      ]
    }
  ];

  // Check if user is authorized investor
  const isInvestor = user?.publicMetadata?.role === 'investor';

  if (!isInvestor) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-gray-400 mb-6">This portal is only accessible to authorized investors.</p>
          <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-block">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Investor Portal</h1>
                <p className="text-sm text-gray-400">Vibelux Technologies Inc.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Investment Summary */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Your Investment</p>
              <p className="text-2xl font-bold text-white">
                ${investorData.investmentAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {investorData.shareClass}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-green-400">
                ${(investorData.investmentAmount * investorData.multiple).toLocaleString()}
              </p>
              <p className="text-xs text-green-400 mt-1">
                {investorData.multiple}x multiple
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Ownership</p>
              <p className="text-2xl font-bold text-white">
                {investorData.ownershipPercentage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Fully diluted
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">IRR</p>
              <p className="text-2xl font-bold text-green-400">
                {investorData.irr}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Since {investorData.investmentDate.getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Company Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Reports & Analytics
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'updates'
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Updates
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">ARR</p>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${(companyMetrics.revenue.arr / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      +{companyMetrics.revenue.growth}% YoY
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">Total Users</p>
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {companyMetrics.users.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      +{companyMetrics.users.growth}% MoM
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">Runway</p>
                      <Clock className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {companyMetrics.financial.runway} mo
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      ${(companyMetrics.financial.burnRate / 1000).toFixed(0)}k/mo burn
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Subscription Revenue</span>
                      <span className="text-sm text-white">72%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '72%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Marketplace Revenue</span>
                      <span className="text-sm text-white">18%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '18%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Services Revenue</span>
                      <span className="text-sm text-white">10%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Company Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Founded</p>
                    <p className="text-white">2021</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Headquarters</p>
                    <p className="text-white">San Francisco, CA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Employees</p>
                    <p className="text-white">127</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Valuation</p>
                    <p className="text-white">${investorData.currentValuation.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Raised</p>
                    <p className="text-white">$15M</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Q1 Board Meeting</p>
                      <p className="text-sm text-gray-400">March 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Annual Investor Day</p>
                      <p className="text-sm text-gray-400">April 20, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Confidential Documents</h3>
              <button className="text-sm text-gray-400 hover:text-white">
                Request Access →
              </button>
            </div>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-400">
                        {doc.date.toLocaleDateString()} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.confidential && (
                      <Lock className="w-4 h-4 text-yellow-400" />
                    )}
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Financial Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Gross Margin</span>
                  <span className="text-white font-medium">{companyMetrics.financial.grossMargin}%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Net Revenue Retention</span>
                  <span className="text-white font-medium">128%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">CAC Payback</span>
                  <span className="text-white font-medium">14 months</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400">LTV:CAC Ratio</span>
                  <span className="text-white font-medium">3.2:1</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Growth Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Monthly Churn</span>
                  <span className="text-white font-medium">{companyMetrics.users.churn}%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Logo Retention</span>
                  <span className="text-white font-medium">94%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">NPS Score</span>
                  <span className="text-white font-medium">72</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400">Sales Efficiency</span>
                  <span className="text-white font-medium">1.4</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quarterly Trends</h3>
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Interactive charts would be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{update.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {update.date.toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-green-400 hover:text-green-300 flex items-center gap-1">
                    View Full Update
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-300 mb-4">{update.summary}</p>
                <div className="space-y-2">
                  {update.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-600/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Need More Information?</h3>
              <p className="text-gray-300 mb-4">
                Contact our investor relations team for additional documents, reports, or to schedule a call.
              </p>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Contact IR Team
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}