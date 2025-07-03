'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Activity, BarChart3, Calendar, CheckCircle,
  AlertCircle, Download, FileText, Package, Shield,
  TrendingUp, Zap, DollarSign, Clock, ExternalLink,
  ThermometerSun, Droplets, Sun, Wind
} from 'lucide-react';

interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  energy: number;
}

interface PayoutHistory {
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
  transactionId?: string;
}

export default function AgreementDetailPage() {
  const params = useParams();
  const { agreementId } = params;

  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - would be fetched based on agreementId
  const agreement = {
    id: agreementId,
    equipmentType: 'LED Grow Lights',
    manufacturer: 'Fluence Bioengineering',
    model: 'SPYDR 2x',
    quantity: 50,
    investor: 'Green Energy Partners',
    investorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E9',
    startDate: '2024-01-15',
    termMonths: 60,
    performanceTarget: 85,
    actualPerformance: 92,
    status: 'active',
    totalValue: 125000,
    monthlyRevShare: 3200,
    revSharePercentage: 15,
    contractAddress: '0x123...abc',
    nextPayout: '2024-03-15',
    totalPaidOut: 12800,
    uptime: 98.5,
    energySaved: 15420,
    specifications: {
      power: '630W',
      ppfd: '1700 μmol/m²/s',
      coverage: '4x4 ft',
      efficiency: '2.7 μmol/J'
    }
  };

  const sensorReadings: SensorReading[] = [
    { timestamp: '2024-02-20 12:00', temperature: 24.5, humidity: 65, co2: 800, light: 850, energy: 31.5 },
    { timestamp: '2024-02-20 13:00', temperature: 25.2, humidity: 63, co2: 820, light: 850, energy: 31.5 },
    { timestamp: '2024-02-20 14:00', temperature: 25.8, humidity: 61, co2: 840, light: 850, energy: 31.5 },
    { timestamp: '2024-02-20 15:00', temperature: 25.5, humidity: 62, co2: 830, light: 850, energy: 31.5 },
    { timestamp: '2024-02-20 16:00', temperature: 24.8, humidity: 64, co2: 810, light: 600, energy: 22.1 }
  ];

  const payoutHistory: PayoutHistory[] = [
    { date: '2024-02-15', amount: 3200, status: 'paid', transactionId: '0xabc...123' },
    { date: '2024-01-15', amount: 3200, status: 'paid', transactionId: '0xdef...456' },
    { date: '2023-12-15', amount: 3200, status: 'paid', transactionId: '0xghi...789' },
    { date: '2023-11-15', amount: 3200, status: 'paid', transactionId: '0xjkl...012' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'processing': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/performance"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Performance
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{agreement.equipmentType}</h1>
              <p className="text-gray-400">Agreement ID: {agreement.id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(agreement.status)}`}>
              {agreement.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {['overview', 'performance', 'payouts', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Equipment Details */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Equipment Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Manufacturer</div>
                    <div className="text-white">{agreement.manufacturer}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Model</div>
                    <div className="text-white">{agreement.model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Quantity</div>
                    <div className="text-white">{agreement.quantity} units</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Value</div>
                    <div className="text-white">${agreement.totalValue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Power:</span>
                      <span className="text-white">{agreement.specifications.power}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-400">PPFD:</span>
                      <span className="text-white">{agreement.specifications.ppfd}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Coverage:</span>
                      <span className="text-white">{agreement.specifications.coverage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Efficiency:</span>
                      <span className="text-white">{agreement.specifications.efficiency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Terms */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Agreement Terms</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Start Date</span>
                    <span className="text-white">{new Date(agreement.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Term Length</span>
                    <span className="text-white">{agreement.termMonths} months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Revenue Share</span>
                    <span className="text-white">{agreement.revSharePercentage}% of energy savings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Performance Target</span>
                    <span className="text-white">{agreement.performanceTarget}% uptime</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Smart Contract</span>
                    <a
                      href={`https://etherscan.io/address/${agreement.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                    >
                      {agreement.contractAddress}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Investor Info */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Investor Information</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{agreement.investor}</h3>
                    <p className="text-sm text-gray-400 mt-1">Wallet: {agreement.investorWallet}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-gray-400">Verified Investor</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Current Performance</span>
                      <span className="text-2xl font-bold text-white">{agreement.actualPerformance}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                        style={{ width: `${agreement.actualPerformance}%` }} 
                      />
                    </div>
                    <p className="text-xs text-green-400 mt-1">+7% above target</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Uptime</span>
                      <span className="text-white">{agreement.uptime}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Energy Saved</span>
                      <span className="text-white">{agreement.energySaved.toLocaleString()} kWh</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Monthly Rev Share</span>
                      <span className="text-green-400 font-medium">${agreement.monthlyRevShare}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Payout */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Next Payout</h3>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${agreement.monthlyRevShare.toLocaleString()}
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(agreement.nextPayout).toLocaleDateString()}
                </p>
                <div className="mt-4 text-sm text-gray-300">
                  Total Paid Out: <span className="text-white font-medium">${agreement.totalPaidOut.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href={`/performance/${agreementId}/verify`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Activity className="w-5 h-5" />
                  Verify Performance
                </Link>
                <Link
                  href="/disputes/new"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                  Report Issue
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Live Sensor Data */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Live Sensor Readings</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-white/10">
                      <th className="pb-3 text-sm font-medium text-gray-400">Timestamp</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Temp (°C)</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Humidity (%)</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">CO2 (ppm)</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Light (μmol)</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Energy (kW)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sensorReadings.map((reading, index) => (
                      <tr key={index}>
                        <td className="py-3 text-sm text-gray-300">{reading.timestamp}</td>
                        <td className="py-3 text-sm text-white">{reading.temperature}</td>
                        <td className="py-3 text-sm text-white">{reading.humidity}</td>
                        <td className="py-3 text-sm text-white">{reading.co2}</td>
                        <td className="py-3 text-sm text-white">{reading.light}</td>
                        <td className="py-3 text-sm text-green-400">{reading.energy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Performance Trends</h2>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Performance chart visualization would go here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payout History */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Payout History</h2>
              <div className="space-y-4">
                {payoutHistory.map((payout, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-8 h-8 text-green-400" />
                      <div>
                        <div className="text-white font-medium">${payout.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">{new Date(payout.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status.toUpperCase()}
                      </span>
                      {payout.transactionId && (
                        <a
                          href={`https://etherscan.io/tx/${payout.transactionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">${agreement.totalPaidOut.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Paid Out</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">${agreement.monthlyRevShare}</div>
                <div className="text-sm text-gray-400">Average Monthly</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">15th</div>
                <div className="text-sm text-gray-400">Payout Day</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Agreement Documents</h2>
              <div className="space-y-3">
                {[
                  { name: 'Revenue Share Agreement', date: '2024-01-15', size: '2.4 MB' },
                  { name: 'Equipment Specifications', date: '2024-01-15', size: '1.8 MB' },
                  { name: 'Installation Report', date: '2024-01-20', size: '3.2 MB' },
                  { name: 'Performance Verification', date: '2024-02-15', size: '1.1 MB' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-400">{doc.date} • {doc.size}</div>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}