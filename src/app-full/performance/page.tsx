'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, DollarSign, Activity, BarChart3, 
  AlertCircle, CheckCircle, Clock, Package,
  Calendar, Download, Filter, ChevronRight,
  Zap, Droplets, ThermometerSun, ArrowUpRight,
  ArrowDownRight, Minus
} from 'lucide-react';

interface PerformanceMetrics {
  energySavings: number;
  revenueGenerated: number;
  equipmentUptime: number;
  performanceScore: number;
  totalPayouts: number;
  pendingPayouts: number;
  agreements: {
    active: number;
    total: number;
  };
}

interface Agreement {
  id: string;
  equipmentType: string;
  investor: string;
  startDate: string;
  performanceTarget: number;
  actualPerformance: number;
  status: 'active' | 'warning' | 'critical';
  nextPayout: string;
  monthlyRevShare: number;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    energySavings: 42500,
    revenueGenerated: 128750,
    equipmentUptime: 98.5,
    performanceScore: 94,
    totalPayouts: 85600,
    pendingPayouts: 12400,
    agreements: {
      active: 3,
      total: 5
    }
  });

  const [agreements, setAgreements] = useState<Agreement[]>([
    {
      id: '1',
      equipmentType: 'LED Grow Lights',
      investor: 'Green Energy Partners',
      startDate: '2024-01-15',
      performanceTarget: 85,
      actualPerformance: 92,
      status: 'active',
      nextPayout: '2024-02-15',
      monthlyRevShare: 3200
    },
    {
      id: '2',
      equipmentType: 'HVAC System',
      investor: 'Climate Control Ventures',
      startDate: '2024-02-01',
      performanceTarget: 90,
      actualPerformance: 87,
      status: 'warning',
      nextPayout: '2024-03-01',
      monthlyRevShare: 2800
    },
    {
      id: '3',
      equipmentType: 'Irrigation System',
      investor: 'AquaTech Investments',
      startDate: '2023-12-01',
      performanceTarget: 80,
      actualPerformance: 95,
      status: 'active',
      nextPayout: '2024-02-28',
      monthlyRevShare: 1500
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPerformanceTrend = (actual: number, target: number) => {
    const diff = actual - target;
    if (diff > 0) return { icon: ArrowUpRight, color: 'text-green-400', value: `+${diff}%` };
    if (diff < 0) return { icon: ArrowDownRight, color: 'text-red-400', value: `${diff}%` };
    return { icon: Minus, color: 'text-gray-400', value: '0%' };
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-white">Performance Tracking</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Revenue Share Performance</h1>
              <p className="text-gray-400">Monitor your equipment performance and revenue sharing agreements</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/performance/reports"
                className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Link>
              <Link
                href="/disputes"
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Dispute Center
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-xs text-green-400 font-medium">+12.5%</span>
              </div>
              <div className="text-3xl font-bold text-white">${metrics.energySavings.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Energy Savings (kWh)</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-xs text-green-400 font-medium">+8.3%</span>
              </div>
              <div className="text-3xl font-bold text-white">${metrics.revenueGenerated.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Revenue Generated</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-gray-400 font-medium">Stable</span>
              </div>
              <div className="text-3xl font-bold text-white">{metrics.equipmentUptime}%</div>
              <div className="text-sm text-gray-400">Equipment Uptime</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-green-400 font-medium">Excellent</span>
              </div>
              <div className="text-3xl font-bold text-white">{metrics.performanceScore}</div>
              <div className="text-sm text-gray-400">Performance Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Agreements */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-6">Active Revenue Share Agreements</h2>
            <div className="space-y-4">
              {agreements.map((agreement) => {
                const trend = getPerformanceTrend(agreement.actualPerformance, agreement.performanceTarget);
                return (
                  <Link
                    key={agreement.id}
                    href={`/performance/${agreement.id}`}
                    className="block bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-1">{agreement.equipmentType}</h3>
                        <p className="text-sm text-gray-400">Investor: {agreement.investor}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agreement.status)}`}>
                        {agreement.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Performance</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold text-white">{agreement.actualPerformance}%</span>
                          <div className={`flex items-center gap-1 ${trend.color}`}>
                            <trend.icon className="w-4 h-4" />
                            <span className="text-sm">{trend.value}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Target</div>
                        <div className="text-xl font-semibold text-gray-300">{agreement.performanceTarget}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Monthly Rev Share</div>
                        <div className="text-xl font-semibold text-green-400">${agreement.monthlyRevShare}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Started: {new Date(agreement.startDate).toLocaleDateString()}
                      </span>
                      <span className="text-purple-400">
                        Next payout: {new Date(agreement.nextPayout).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/equipment-board"
              className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition-colors font-medium"
            >
              <Package className="w-5 h-5" />
              Browse More Equipment
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payout Summary */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Payout Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Total Paid Out</span>
                    <span className="text-lg font-semibold text-white">${metrics.totalPayouts.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '70%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Pending Payouts</span>
                    <span className="text-lg font-semibold text-yellow-400">${metrics.pendingPayouts.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Next payout date: March 1, 2024</p>
                </div>
              </div>
              <Link
                href="/performance/payouts"
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                View Payout History
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">Your LED lights are performing 7% above target!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">HVAC system needs maintenance to meet targets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">Schedule preventive maintenance for next month</p>
                  </div>
                </div>
              </div>
              <Link
                href="/performance/optimization"
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                View Optimization Guide →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/performance/sensors"
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-300">Verify Sensor Data</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/performance/maintenance"
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-300">Schedule Maintenance</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/disputes/new"
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm text-gray-300">Report an Issue</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                Week
              </button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">
                Month
              </button>
              <button className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                Year
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Performance chart visualization would go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}