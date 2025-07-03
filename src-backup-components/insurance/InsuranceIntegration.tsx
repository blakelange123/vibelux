'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  FileText,
  Camera,
  Activity,
  DollarSign,
  Clock,
  Award,
  Info,
  ChevronRight,
  Download,
  Upload,
  AlertCircle,
  BarChart3,
  Gauge,
  Lock,
  RefreshCw,
  Send,
  ChevronDown,
  X,
  Calendar,
  Bell,
  Eye,
  ThumbsUp,
  Cloud,
  Wrench,
  Users,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

interface RiskFactor {
  id: string;
  category: string;
  factor: string;
  status: 'good' | 'warning' | 'critical';
  score: number;
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
  lastChecked: Date;
  aiPrediction?: {
    futureScore: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
  };
  automatedActions?: {
    enabled: boolean;
    triggers: string[];
    lastAction?: Date;
  };
}

interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  type: string;
  coverage: number;
  premium: number;
  deductible: number;
  status: 'active' | 'pending' | 'expired';
  startDate: Date;
  endDate: Date;
  claims: number;
  savings: number;
  parametricTriggers?: {
    temperature?: { min: number; max: number };
    humidity?: { min: number; max: number };
    powerOutage?: { duration: number };
  };
  instantPayout?: {
    enabled: boolean;
    conditions: string[];
    maxPayout: number;
  };
  blockchainVerified?: boolean;
}

interface Incident {
  id: string;
  date: Date;
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  location: string;
  description: string;
  status: 'reported' | 'investigating' | 'resolved' | 'claim-filed';
  estimatedLoss?: number;
  documentation: string[];
  insuranceClaim?: {
    claimNumber: string;
    status: string;
    amount: number;
  };
}

interface ComplianceItem {
  id: string;
  requirement: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  dueDate?: Date;
  evidence?: string[];
  impact: string;
}

export function InsuranceIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'policies' | 'incidents' | 'compliance' | 'marketplace' | 'analytics'>('overview');
  const [riskScore, setRiskScore] = useState(78);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [autoReporting, setAutoReporting] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [parametricPayoutEnabled, setParametricPayoutEnabled] = useState(true);
  const [blockchainEnabled, setBlockchainEnabled] = useState(true);
  const [showMarketplace, setShowMarketplace] = useState(false);

  // Risk factors
  const riskFactors: RiskFactor[] = [
    {
      id: 'rf-1',
      category: 'Environmental',
      factor: 'Temperature Control',
      status: 'good',
      score: 92,
      impact: 'high',
      description: 'HVAC systems maintaining optimal range',
      lastChecked: new Date()
    },
    {
      id: 'rf-2',
      category: 'Environmental',
      factor: 'Humidity Management',
      status: 'warning',
      score: 68,
      impact: 'high',
      description: 'Humidity occasionally exceeding 70% - mold risk',
      mitigation: 'Increase dehumidification capacity',
      lastChecked: new Date()
    },
    {
      id: 'rf-3',
      category: 'Equipment',
      factor: 'Electrical Systems',
      status: 'good',
      score: 85,
      impact: 'high',
      description: 'All circuits within safe operating parameters',
      lastChecked: new Date()
    },
    {
      id: 'rf-4',
      category: 'Equipment',
      factor: 'Fire Suppression',
      status: 'good',
      score: 95,
      impact: 'high',
      description: 'Systems tested and certified',
      lastChecked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'rf-5',
      category: 'Security',
      factor: 'Access Control',
      status: 'good',
      score: 88,
      impact: 'medium',
      description: 'Biometric systems active, all entries logged',
      lastChecked: new Date()
    },
    {
      id: 'rf-6',
      category: 'Security',
      factor: 'Video Surveillance',
      status: 'warning',
      score: 72,
      impact: 'medium',
      description: '2 cameras offline in storage area',
      mitigation: 'Repair scheduled for tomorrow',
      lastChecked: new Date()
    },
    {
      id: 'rf-7',
      category: 'Operations',
      factor: 'Staff Training',
      status: 'good',
      score: 90,
      impact: 'medium',
      description: 'All staff certified in safety protocols',
      lastChecked: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'rf-8',
      category: 'Operations',
      factor: 'Chemical Storage',
      status: 'critical',
      score: 45,
      impact: 'high',
      description: 'Improper storage detected in Room B',
      mitigation: 'Immediate reorganization required',
      lastChecked: new Date()
    }
  ];

  // Insurance policies
  const policies: InsurancePolicy[] = [
    {
      id: 'pol-1',
      provider: 'AgriSure Insurance',
      policyNumber: 'AG-2024-789456',
      type: 'General Liability',
      coverage: 5000000,
      premium: 18500,
      deductible: 10000,
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      claims: 0,
      savings: 3200
    },
    {
      id: 'pol-2',
      provider: 'CannaCare Mutual',
      policyNumber: 'CC-2024-123789',
      type: 'Crop Insurance',
      coverage: 2000000,
      premium: 24000,
      deductible: 25000,
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      claims: 1,
      savings: 5600
    },
    {
      id: 'pol-3',
      provider: 'TechProtect Inc',
      policyNumber: 'TP-2024-456123',
      type: 'Equipment Breakdown',
      coverage: 1000000,
      premium: 8500,
      deductible: 5000,
      status: 'active',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-03-01'),
      claims: 0,
      savings: 1200
    }
  ];

  // Recent incidents
  const incidents: Incident[] = [
    {
      id: 'inc-1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'Environmental',
      severity: 'minor',
      location: 'Flower Room A',
      description: 'Power outage caused 2-hour light interruption',
      status: 'resolved',
      estimatedLoss: 0,
      documentation: ['power-log.pdf', 'maintenance-report.pdf']
    },
    {
      id: 'inc-2',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      type: 'Equipment',
      severity: 'moderate',
      location: 'HVAC System',
      description: 'Compressor failure in Unit 2',
      status: 'claim-filed',
      estimatedLoss: 12000,
      documentation: ['hvac-failure.pdf', 'repair-invoice.pdf', 'photos.zip'],
      insuranceClaim: {
        claimNumber: 'CLM-2024-0892',
        status: 'Approved',
        amount: 10000
      }
    },
    {
      id: 'inc-3',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'Security',
      severity: 'minor',
      location: 'Perimeter Fence',
      description: 'Motion sensor triggered - false alarm (wildlife)',
      status: 'resolved',
      estimatedLoss: 0,
      documentation: ['security-log.pdf', 'camera-footage.mp4']
    }
  ];

  // Compliance requirements
  const complianceItems: ComplianceItem[] = [
    {
      id: 'comp-1',
      requirement: 'Annual Fire System Inspection',
      category: 'Safety',
      status: 'compliant',
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      evidence: ['fire-cert-2024.pdf'],
      impact: 'Required for insurance coverage'
    },
    {
      id: 'comp-2',
      requirement: 'Electrical System Certification',
      category: 'Infrastructure',
      status: 'compliant',
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      evidence: ['electrical-cert-2024.pdf'],
      impact: 'Reduces premium by 5%'
    },
    {
      id: 'comp-3',
      requirement: 'Security Audit',
      category: 'Security',
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      impact: 'Required for liability coverage'
    },
    {
      id: 'comp-4',
      requirement: 'Environmental Controls Calibration',
      category: 'Operations',
      status: 'non-compliant',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      impact: 'May void crop insurance claims'
    }
  ];

  // Calculate metrics
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverage, 0);
  const annualPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const totalSavings = policies.reduce((sum, p) => sum + p.savings, 0);
  const activeIncidents = incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length;
  
  // Benchmark data
  const industryAverages = {
    riskScore: 65,
    premiumPerSqFt: 2.85,
    claimsPerYear: 2.4,
    complianceRate: 78
  };

  // Risk score history
  const riskHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    score: 75 + Math.sin(i / 5) * 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
    incidents: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2)
  }));

  // Premium impact factors
  const premiumFactors = [
    { factor: 'Safety Compliance', impact: -15, status: 'active' },
    { factor: 'Security Systems', impact: -10, status: 'active' },
    { factor: 'Claim History', impact: 5, status: 'active' },
    { factor: 'Risk Mitigation', impact: -8, status: 'active' },
    { factor: 'Automated Monitoring', impact: -12, status: 'active' }
  ];

  const refreshRiskScore = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRiskScore(Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20) + 70);
    setIsRefreshing(false);
  };

  const fileIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowClaimForm(true);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            Insurance Savings Dashboard
          </h2>
          <p className="text-gray-400">Future feature: Qualify for premium discounts through certified risk monitoring</p>
          <p className="text-sm text-yellow-400 mt-1">Coming soon: Insurance partnerships in development</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshRiskScore}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Insurance Report
          </button>
        </div>
      </div>

      {/* Risk Score Overview */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-600/30">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Facility Risk Score</h3>
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: riskScore, fill: riskScore >= 80 ? '#10B981' : riskScore >= 60 ? '#F59E0B' : '#EF4444' }]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}</p>
                  <p className="text-sm text-gray-400">Risk Score</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Coverage</p>
              <p className="text-2xl font-bold text-white">${(totalCoverage / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-500 mt-1">Across {policies.length} policies</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Annual Premium</p>
              <p className="text-2xl font-bold text-white">${(annualPremium / 1000).toFixed(0)}k</p>
              <p className="text-xs text-green-400 mt-1">-{((totalSavings / annualPremium) * 100).toFixed(0)}% discount</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Premium Savings</p>
              <p className="text-2xl font-bold text-green-400">${totalSavings.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">From risk reduction</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Incidents</p>
              <p className="text-2xl font-bold text-yellow-400">{activeIncidents}</p>
              <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Claims Filed</p>
              <p className="text-2xl font-bold text-white">{policies.reduce((sum, p) => sum + p.claims, 0)}</p>
              <p className="text-xs text-gray-500 mt-1">This policy period</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Compliance</p>
              <p className="text-2xl font-bold text-white">
                {Math.round((complianceItems.filter(c => c.status === 'compliant').length / complianceItems.length) * 100)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Requirements met</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['overview', 'risk', 'policies', 'incidents', 'compliance', 'marketplace', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Risk Trend */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">30-Day Risk Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    name="Risk Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Premium Impact */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Premium Impact Factors</h3>
              <div className="space-y-3">
                {premiumFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${factor.impact < 0 ? 'text-green-400' : 'text-red-400'}`} />
                      <span className="text-gray-300">{factor.factor}</span>
                    </div>
                    <span className={`font-medium ${factor.impact < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Total Premium Impact</span>
                    <span className="text-xl font-bold text-green-400">
                      {premiumFactors.reduce((sum, f) => sum + f.impact, 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Automated Features</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                  <div>
                    <p className="font-medium text-white">Auto Incident Reporting</p>
                    <p className="text-sm text-gray-400">Sensors automatically report incidents</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReporting}
                    onChange={(e) => setAutoReporting(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                  <div>
                    <p className="font-medium text-white">Compliance Monitoring</p>
                    <p className="text-sm text-gray-400">Track and alert on requirements</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                  <div>
                    <p className="font-medium text-white">Risk Score Sharing</p>
                    <p className="text-sm text-gray-400">Share data with insurers for discounts</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Categories */}
          <div className="grid grid-cols-4 gap-4">
            {['Environmental', 'Equipment', 'Security', 'Operations'].map((category) => {
              const categoryFactors = riskFactors.filter(rf => rf.category === category);
              const avgScore = categoryFactors.reduce((sum, rf) => sum + rf.score, 0) / categoryFactors.length;
              
              return (
                <div key={category} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h4 className="font-medium text-white mb-2">{category}</h4>
                  <p className={`text-2xl font-bold ${getRiskColor(avgScore)}`}>
                    {avgScore.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {categoryFactors.filter(rf => rf.status === 'warning' || rf.status === 'critical').length} issues
                  </p>
                </div>
              );
            })}
          </div>

          {/* Risk Factors Detail */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Risk Factor Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Factor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Impact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Checked</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {riskFactors.map((factor) => (
                    <tr key={factor.id} className="border-b border-gray-800">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{factor.factor}</p>
                          <p className="text-xs text-gray-500">{factor.description}</p>
                          {factor.mitigation && (
                            <p className="text-xs text-yellow-400 mt-1">⚠️ {factor.mitigation}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{factor.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getRiskColor(factor.score)}`}>
                            {factor.score}
                          </span>
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                factor.score >= 80 ? 'bg-green-500' :
                                factor.score >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${factor.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          factor.status === 'good' ? 'bg-green-900/20 text-green-400' :
                          factor.status === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-red-900/20 text-red-400'
                        }`}>
                          {factor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${
                          factor.impact === 'high' ? 'text-red-400' :
                          factor.impact === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {factor.impact}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {Math.floor((Date.now() - factor.lastChecked.getTime()) / (1000 * 60 * 60))}h ago
                      </td>
                      <td className="px-4 py-3">
                        {factor.status !== 'good' && (
                          <button className="text-sm text-purple-400 hover:text-purple-300">
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Mitigation Recommendations */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-600/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Priority Risk Mitigation</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>Immediate: Reorganize chemical storage to meet safety standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>This week: Repair offline security cameras to maintain coverage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span>This month: Increase dehumidification to prevent mold risk</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Policy Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{policy.type}</h3>
                    <p className="text-sm text-gray-400">{policy.provider}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    policy.status === 'active' ? 'bg-green-900/20 text-green-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {policy.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Coverage</p>
                    <p className="text-xl font-bold text-white">${(policy.coverage / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Annual Premium</p>
                    <p className="text-xl font-bold text-white">${policy.premium.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Deductible</p>
                    <p className="text-xl font-bold text-white">${policy.deductible.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Premium Savings</p>
                    <p className="text-xl font-bold text-green-400">${policy.savings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Policy Number</span>
                    <span className="text-gray-300 font-mono">{policy.policyNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Coverage Period</span>
                    <span className="text-gray-300">
                      {policy.startDate.toLocaleDateString()} - {policy.endDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Claims Filed</span>
                    <span className="text-gray-300">{policy.claims}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                    File Claim
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coverage Analysis */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage Analysis</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Coverage Gaps</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Cyber liability not covered</span>
                  </li>
                  <li className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Business interruption limited to 30 days</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Recommended Add-ons</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Cyber insurance - $8k/year</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Extended BI coverage - $3k/year</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Optimization Opportunities</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                    <span>Bundle policies for 8% discount</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                    <span>Increase deductibles for 12% savings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-6">
          {/* Incident Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Incidents</span>
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{incidents.length}</p>
              <p className="text-xs text-gray-500">This year</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Claims Filed</span>
                <Send className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {incidents.filter(i => i.insuranceClaim).length}
              </p>
              <p className="text-xs text-gray-500">Total claims</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Claim Value</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${incidents
                  .filter(i => i.insuranceClaim)
                  .reduce((sum, i) => sum + (i.insuranceClaim?.amount || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Recovered</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg Resolution</span>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">4.2</p>
              <p className="text-xs text-gray-500">Days</p>
            </div>
          </div>

          {/* Incident List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Incident Log</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-white">{incident.type} Incident</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.severity === 'severe' ? 'bg-red-900/20 text-red-400' :
                          incident.severity === 'moderate' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-blue-900/20 text-blue-400'
                        }`}>
                          {incident.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.status === 'resolved' ? 'bg-green-900/20 text-green-400' :
                          incident.status === 'claim-filed' ? 'bg-purple-900/20 text-purple-400' :
                          incident.status === 'investigating' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {incident.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{incident.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{incident.location}</span>
                        {incident.estimatedLoss ? (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400">
                              Est. Loss: ${incident.estimatedLoss.toLocaleString()}
                            </span>
                          </>
                        ) : null}
                      </div>
                      {incident.insuranceClaim && (
                        <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                          <p className="text-sm">
                            <span className="text-purple-400">Claim #{incident.insuranceClaim.claimNumber}</span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-green-400">${incident.insuranceClaim.amount.toLocaleString()} {incident.insuranceClaim.status}</span>
                          </p>
                        </div>
                      )}
                      {incident.documentation.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400">
                            {incident.documentation.length} documents attached
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!incident.insuranceClaim && incident.estimatedLoss && incident.estimatedLoss > 0 && (
                        <button
                          onClick={() => fileIncident(incident)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                        >
                          File Claim
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Report */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Incident Report</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-white">Equipment Failure</span>
                </div>
                <p className="text-sm text-gray-400">Report equipment malfunction or breakdown</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-white">Security Incident</span>
                </div>
                <p className="text-sm text-gray-400">Report security breach or intrusion</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Environmental Issue</span>
                </div>
                <p className="text-sm text-gray-400">Report temperature, humidity, or other issues</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Other Incident</span>
                </div>
                <p className="text-sm text-gray-400">Report any other type of incident</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Safety Compliance</h3>
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="space-y-2">
                {complianceItems
                  .filter(c => c.category === 'Safety')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 truncate">{item.requirement}</span>
                      {item.status === 'compliant' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : item.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Infrastructure</h3>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-2">
                {complianceItems
                  .filter(c => c.category === 'Infrastructure')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 truncate">{item.requirement}</span>
                      {item.status === 'compliant' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : item.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Operations</h3>
                <Gauge className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-2">
                {complianceItems
                  .filter(c => c.category === 'Operations' || c.category === 'Security')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 truncate">{item.requirement}</span>
                      {item.status === 'compliant' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : item.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Compliance Requirements */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Compliance Requirements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Requirement</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Due Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Impact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-800">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{item.requirement}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{item.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'compliant' ? 'bg-green-900/20 text-green-400' :
                          item.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-red-900/20 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {item.dueDate ? (
                          <span className={
                            item.dueDate < new Date() ? 'text-red-400' :
                            item.dueDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-yellow-400' :
                            'text-gray-300'
                          }>
                            {item.dueDate.toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.impact}</td>
                      <td className="px-4 py-3">
                        {item.evidence ? (
                          <button className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        ) : (
                          <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300">
                            <Upload className="w-4 h-4" />
                            Upload
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Benefits */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-600/30">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Compliance Benefits</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>5% premium reduction for electrical certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>3% discount for completed safety training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>Priority claim processing for compliant facilities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Insurance Marketplace Header */}
          <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg p-6 border border-indigo-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Insurance Partnership Vision</h3>
                <p className="text-gray-400">Proposed: Partner with insurers to offer discounts for monitored facilities</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-yellow-900/20 text-yellow-400 rounded-full text-sm font-medium">
                  Feature In Development
                </span>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Proposed Insurance Products */}
          <div className="text-center text-gray-400 mb-6">
            <p className="text-sm">Example insurance types that could offer discounts for Vibelux-monitored facilities:</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parametric Weather Insurance */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 relative opacity-75">
              <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">Proposed</div>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Cloud className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Parametric Weather Insurance</h4>
                  <p className="text-sm text-gray-400">Could offer instant payouts based on sensor data</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Temperature extremes</span>
                  <span className="text-green-400">✓ Covered</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Humidity deviations</span>
                  <span className="text-green-400">✓ Covered</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Power outages</span>
                  <span className="text-green-400">✓ Covered</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Instant payout</span>
                  <span className="text-blue-400">&lt; 24 hours</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">Potential Savings: 20-30%</span>
              </div>
            </div>

            {/* Cyber Insurance for Cannabis */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Cannabis Cyber Insurance</h4>
                  <p className="text-sm text-gray-400">Protection against digital threats</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Data breaches</span>
                  <span className="text-green-400">✓ $2M coverage</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Ransomware</span>
                  <span className="text-green-400">✓ Covered</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">System downtime</span>
                  <span className="text-green-400">✓ Loss recovery</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">METRC compliance</span>
                  <span className="text-green-400">✓ Included</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">From $189/mo</span>
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>

            {/* Blockchain-Verified Crop Insurance */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Blockchain Crop Insurance</h4>
                  <p className="text-sm text-gray-400">Immutable coverage verification</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Smart contracts</span>
                  <span className="text-green-400">✓ Automated</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Yield protection</span>
                  <span className="text-green-400">✓ 90% coverage</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Quality assurance</span>
                  <span className="text-green-400">✓ THC/CBD levels</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Chain verification</span>
                  <span className="text-blue-400">Ethereum</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">From $599/mo</span>
                <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>

            {/* Equipment-as-a-Service Insurance */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Wrench className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Equipment-as-a-Service</h4>
                  <p className="text-sm text-gray-400">Insurance bundled with equipment</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">All equipment covered</span>
                  <span className="text-green-400">✓ 100%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Replacement guarantee</span>
                  <span className="text-green-400">✓ 48 hours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Maintenance included</span>
                  <span className="text-green-400">✓ Full service</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Upgrade options</span>
                  <span className="text-green-400">✓ Annual</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">Custom Pricing</span>
                <button className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors">
                  Get Quote
                </button>
              </div>
            </div>
          </div>

          {/* Group Buying Power */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-600/30">
            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-green-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Vibelux Group Insurance Program</h3>
                <p className="text-gray-300 mb-4">
                  Join other growers to unlock group rates and save up to 40% on premiums
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-400">40%</p>
                    <p className="text-sm text-gray-400">Average savings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">Growing</p>
                    <p className="text-sm text-gray-400">Member network</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">A+ Rated</p>
                    <p className="text-sm text-gray-400">Provider network</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Join Group Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Predictive Analytics Header */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-600/30">
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insurance Analytics</h3>
            <p className="text-gray-400">Machine learning models predict risks and optimize coverage</p>
          </div>

          {/* Risk Prediction Models */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">30-Day Risk Forecast</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Equipment Failure Risk</span>
                    <span className="text-yellow-400 font-medium">Medium (42%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '42%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">HVAC Unit 2 showing wear patterns</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Environmental Risk</span>
                    <span className="text-green-400 font-medium">Low (18%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Stable conditions predicted</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Security Risk</span>
                    <span className="text-green-400 font-medium">Low (12%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">No threats detected</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Operational Risk</span>
                    <span className="text-red-400 font-medium">High (67%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Staff certification expiring</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Premium Optimization</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Potential Annual Savings</span>
                    <span className="text-2xl font-bold text-green-400">$18,420</span>
                  </div>
                  <p className="text-sm text-gray-400">By implementing 5 recommended actions</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Install water leak sensors</span>
                    <span className="text-green-400">-$4,200/yr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Upgrade fire suppression</span>
                    <span className="text-green-400">-$6,800/yr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Implement 24/7 monitoring</span>
                    <span className="text-green-400">-$3,500/yr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Staff safety certification</span>
                    <span className="text-green-400">-$2,100/yr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Join group program</span>
                    <span className="text-green-400">-$1,820/yr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Claims Prediction */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Claims Likelihood Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="riskScore" 
                    stroke="#9CA3AF" 
                    label={{ value: 'Risk Score', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="claimProbability" 
                    stroke="#9CA3AF"
                    label={{ value: 'Claim Probability (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Scatter
                    name="Your Facility"
                    data={[{ riskScore: 78, claimProbability: 15 }]}
                    fill="#8B5CF6"
                  />
                  <Scatter
                    name="Industry Average"
                    data={[
                      { riskScore: 45, claimProbability: 65 },
                      { riskScore: 55, claimProbability: 45 },
                      { riskScore: 65, claimProbability: 30 },
                      { riskScore: 75, claimProbability: 18 },
                      { riskScore: 85, claimProbability: 8 },
                      { riskScore: 95, claimProbability: 3 }
                    ]}
                    fill="#6B7280"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-purple-400">Your facility</span> has a 15% claim probability,
                <span className="text-green-400"> 73% lower</span> than facilities with similar operations.
                This translates to approximately <span className="font-medium text-white">$12,000 in annual premium savings</span>.
              </p>
            </div>
          </div>

          {/* ROI Dashboard */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Insurance ROI</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">342%</p>
              <p className="text-xs text-gray-500">Risk mitigation value</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Prevented Losses</span>
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">$284k</p>
              <p className="text-xs text-gray-500">This year</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Coverage Efficiency</span>
                <Gauge className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">94%</p>
              <p className="text-xs text-gray-500">Optimal coverage</p>
            </div>
          </div>
        </div>
      )}

      {/* Claim Form Modal */}
      {showClaimForm && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">File Insurance Claim</h3>
              <button
                onClick={() => {
                  setShowClaimForm(false);
                  setSelectedIncident(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Claim submitted successfully!\n\nClaim number: CLM-2024-' + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000));
              setShowClaimForm(false);
              setSelectedIncident(null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Incident Type</label>
                  <input
                    type="text"
                    value={selectedIncident.type}
                    disabled
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Incident Date</label>
                  <input
                    type="date"
                    defaultValue={selectedIncident.date.toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    defaultValue={selectedIncident.description}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Loss</label>
                  <input
                    type="number"
                    defaultValue={selectedIncident.estimatedLoss}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Supporting Documents</label>
                  <div className="space-y-2">
                    {selectedIncident.documentation.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{doc}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Add More Documents
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      required
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">
                      I certify that all information provided is accurate and complete
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowClaimForm(false);
                    setSelectedIncident(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}