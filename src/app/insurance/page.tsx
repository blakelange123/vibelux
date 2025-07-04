'use client';

import React, { useState } from 'react';
import { Shield, AlertCircle, TrendingUp, DollarSign, FileText, CheckCircle, Info, BarChart3, Leaf, ChevronRight } from 'lucide-react';
import { CropInsuranceDetail } from '@/components/insurance/CropInsuranceDetail';

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'crop-insurance'>('overview');
  const coverageTypes = [
    {
      name: 'Property Insurance',
      coverage: '$2,500,000',
      premium: '$1,250/mo',
      deductible: '$10,000',
      status: 'Active',
      features: ['Building coverage', 'Equipment breakdown', 'Business interruption', 'Crop loss']
    },
    {
      name: 'General Liability',
      coverage: '$1,000,000',
      premium: '$450/mo',
      deductible: '$5,000',
      status: 'Active',
      features: ['Product liability', 'Premises liability', 'Completed operations', 'Medical payments']
    },
    {
      name: 'Crop Insurance',
      coverage: '$500,000',
      premium: '$850/mo',
      deductible: '$2,500',
      status: 'Active',
      features: ['Yield protection', 'Revenue protection', 'Disease coverage', 'Weather events']
    },
    {
      name: 'Cyber Liability',
      coverage: '$1,000,000',
      premium: '$350/mo',
      deductible: '$10,000',
      status: 'Pending',
      features: ['Data breach', 'Network security', 'Business interruption', 'Cyber extortion']
    }
  ];

  const riskFactors = [
    { name: 'Fire & Smoke', level: 'High', score: 85, mitigation: 'Sprinkler system, fire alarms' },
    { name: 'Equipment Failure', level: 'Medium', score: 65, mitigation: 'Preventive maintenance program' },
    { name: 'Crop Disease', level: 'Medium', score: 60, mitigation: 'IPM protocols, regular testing' },
    { name: 'Theft & Vandalism', level: 'Low', score: 35, mitigation: 'Security cameras, access control' },
    { name: 'Weather Events', level: 'Medium', score: 55, mitigation: 'Backup generators, reinforced structure' },
    { name: 'Cyber Attacks', level: 'Medium', score: 70, mitigation: 'Firewall, regular backups' }
  ];

  const claimsHistory = [
    { date: '2024-01-15', type: 'Equipment', amount: '$12,500', status: 'Paid', description: 'HVAC compressor failure' },
    { date: '2023-11-03', type: 'Crop Loss', amount: '$8,200', status: 'Paid', description: 'Powdery mildew outbreak' },
    { date: '2023-08-22', type: 'Property', amount: '$4,300', status: 'Paid', description: 'Storm damage to greenhouse' },
    { date: '2023-05-10', type: 'Liability', amount: '$0', status: 'Denied', description: 'Customer slip and fall' }
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 70) return 'bg-red-900/20';
    if (score >= 50) return 'bg-yellow-900/20';
    return 'bg-green-900/20';
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-100">Insurance Dashboard</h1>
          </div>
          <p className="text-gray-400">Manage coverage, assess risks, and track claims for your cultivation facility</p>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('crop-insurance')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'crop-insurance'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Crop Insurance
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Enhanced</span>
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-400">Monthly</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">$2,900</p>
            <p className="text-sm text-gray-400">Total Premiums</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">Coverage</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">$5M</p>
            <p className="text-sm text-gray-400">Total Protection</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <span className="text-sm text-gray-400">Risk Score</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">62</p>
            <p className="text-sm text-gray-400">Medium Risk</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-indigo-400" />
              <span className="text-sm text-gray-400">Claims Ratio</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">18%</p>
            <p className="text-sm text-gray-400">Below Average</p>
          </div>
        </div>

        {/* Active Policies */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Active Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coverageTypes.map((policy) => (
              <div key={policy.name} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{policy.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm px-2 py-1 rounded ${
                        policy.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {policy.status}
                      </span>
                    </div>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Coverage</p>
                    <p className="text-sm font-semibold text-gray-200">{policy.coverage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Premium</p>
                    <p className="text-sm font-semibold text-gray-200">{policy.premium}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Deductible</p>
                    <p className="text-sm font-semibold text-gray-200">{policy.deductible}</p>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-400 mb-2">Coverage Includes:</p>
                  <div className="space-y-1">
                    {policy.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Risk Assessment</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="space-y-4">
                {riskFactors.map((risk) => (
                  <div key={risk.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-200">{risk.name}</span>
                      <span className={`text-sm font-semibold ${getRiskColor(risk.score)}`}>
                        {risk.level} ({risk.score})
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${getRiskBgColor(risk.score)}`}
                        style={{ width: `${risk.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Mitigation: {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Claims History */}
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Claims History</h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400">Amount</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsHistory.map((claim, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4 text-sm text-gray-300">{claim.date}</td>
                      <td className="p-4 text-sm text-gray-300">{claim.type}</td>
                      <td className="p-4 text-sm text-gray-300">{claim.amount}</td>
                      <td className="p-4">
                        <span className={`text-sm px-2 py-1 rounded ${
                          claim.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Crop Insurance Feature Highlight */}
        <div className="bg-green-900/20 rounded-lg p-6 border border-green-800/30 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Leaf className="w-6 h-6 text-green-400 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">Advanced Crop Insurance Protection</h3>
                <p className="text-sm text-green-200/80 mb-3">
                  Our IoT-integrated crop insurance provides real-time risk monitoring and automated claim processing, 
                  reducing premiums by up to 70% while preventing 71% of potential losses.
                </p>
                <ul className="space-y-1 text-sm text-green-200/70">
                  <li>• Real-time sensor monitoring for proactive risk management</li>
                  <li>• AI-powered predictive analytics for loss prevention</li>
                  <li>• Automated documentation for faster claim processing</li>
                  <li>• Premium optimization based on your prevention measures</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('crop-insurance')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Insurance Tips */}
        <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-800/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Insurance Optimization Tips</h3>
              <ul className="space-y-2 text-sm text-blue-200/80">
                <li>• Regular safety audits can reduce premiums by up to 15%</li>
                <li>• Document all equipment maintenance to support claims</li>
                <li>• Consider bundling policies for multi-line discounts</li>
                <li>• Review coverage annually as your facility expands</li>
                <li>• Install monitoring systems to qualify for lower rates</li>
              </ul>
            </div>
          </div>
        </div>
          </>
        ) : (
          <CropInsuranceDetail />
        )}
      </div>
    </div>
  );
}