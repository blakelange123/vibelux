'use client';

import React, { useState } from 'react';
import { 
  Leaf, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Info, 
  BarChart3,
  Activity,
  Shield,
  Zap,
  Droplets,
  Thermometer,
  Wind,
  Bug,
  Cloud,
  Calendar,
  Download,
  Upload,
  Bell,
  XCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CropRiskFactor {
  name: string;
  category: 'environmental' | 'biological' | 'operational' | 'market';
  currentRisk: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  lastIncident?: Date;
  estimatedLoss?: number;
  mitigation: string[];
}

export function CropInsuranceDetail() {
  const [selectedCoverage, setSelectedCoverage] = useState('comprehensive');
  
  // Real-time sensor data integration
  const sensorData = {
    temperature: { current: 74.2, optimal: [72, 76], status: 'good' },
    humidity: { current: 58.5, optimal: [55, 65], status: 'good' },
    vpd: { current: 1.2, optimal: [1.0, 1.5], status: 'good' },
    co2: { current: 1150, optimal: [1000, 1500], status: 'good' },
    light: { current: 850, optimal: [800, 900], status: 'good' },
    waterPh: { current: 6.1, optimal: [5.8, 6.2], status: 'good' },
    waterEc: { current: 2.1, optimal: [1.8, 2.5], status: 'good' }
  };

  // Coverage types with detailed parameters
  const coverageTypes = {
    comprehensive: {
      name: 'Comprehensive Crop Protection',
      premium: '$2,850/month',
      coverage: '$1,500,000',
      deductible: '$5,000',
      features: [
        'Yield loss protection (up to 100% of expected yield)',
        'Quality degradation coverage (THC/CBD variance)',
        'Disease & pest outbreak protection',
        'Environmental system failure',
        'Contamination coverage (mold, pesticides, heavy metals)',
        'Market price protection (±20% variance)',
        'Business interruption (up to 6 months)'
      ]
    },
    yield: {
      name: 'Yield Protection Only',
      premium: '$1,250/month',
      coverage: '$750,000',
      deductible: '$2,500',
      features: [
        'Covers yield shortfalls below 85% of average',
        'Weather-related losses',
        'Equipment failure impacts',
        'Power outage protection'
      ]
    },
    quality: {
      name: 'Quality & Compliance',
      premium: '$950/month',
      coverage: '$500,000',
      deductible: '$1,000',
      features: [
        'Failed testing coverage',
        'Potency variance protection',
        'Contamination remediation',
        'Recall expense coverage'
      ]
    }
  };

  // Risk factors specific to crop insurance
  const cropRiskFactors: CropRiskFactor[] = [
    {
      name: 'Powdery Mildew',
      category: 'biological',
      currentRisk: 35,
      trend: 'stable',
      lastIncident: new Date('2024-01-15'),
      estimatedLoss: 12500,
      mitigation: ['UV-C treatment installed', 'Preventive IPM protocol', 'Weekly spore testing']
    },
    {
      name: 'Spider Mites',
      category: 'biological',
      currentRisk: 25,
      trend: 'decreasing',
      mitigation: ['Predatory mite program', 'Environmental controls', 'Quarantine procedures']
    },
    {
      name: 'HVAC Failure',
      category: 'operational',
      currentRisk: 45,
      trend: 'stable',
      lastIncident: new Date('2023-11-03'),
      estimatedLoss: 35000,
      mitigation: ['Redundant systems', 'Preventive maintenance', '24/7 monitoring']
    },
    {
      name: 'Nutrient Imbalance',
      category: 'operational',
      currentRisk: 20,
      trend: 'decreasing',
      mitigation: ['Automated dosing', 'Daily testing', 'AI-powered adjustments']
    },
    {
      name: 'Light Stress',
      category: 'environmental',
      currentRisk: 15,
      trend: 'stable',
      mitigation: ['Automated dimming', 'Canopy monitoring', 'Heat dissipation']
    },
    {
      name: 'Market Volatility',
      category: 'market',
      currentRisk: 65,
      trend: 'increasing',
      estimatedLoss: 50000,
      mitigation: ['Contract growing', 'Product diversification', 'Forward contracts']
    }
  ];

  // Historical claims data
  const claimsHistory = [
    { month: 'Jan', claims: 2, payout: 24500, prevented: 5 },
    { month: 'Feb', claims: 1, payout: 8200, prevented: 8 },
    { month: 'Mar', claims: 0, payout: 0, prevented: 12 },
    { month: 'Apr', claims: 3, payout: 41000, prevented: 6 },
    { month: 'May', claims: 1, payout: 12000, prevented: 10 },
    { month: 'Jun', claims: 0, payout: 0, prevented: 15 }
  ];

  // Premium calculation factors
  const premiumFactors = [
    { factor: 'Facility Risk Score', impact: -15, reason: 'Excellent environmental controls' },
    { factor: 'Historical Claims', impact: -10, reason: 'Below industry average' },
    { factor: 'Sensor Integration', impact: -20, reason: 'Real-time monitoring enabled' },
    { factor: 'Compliance Record', impact: -5, reason: 'Perfect testing record' },
    { factor: 'Prevention Systems', impact: -12, reason: 'Advanced IPM program' },
    { factor: 'Staff Training', impact: -8, reason: 'Certified cultivation team' }
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 60) return '#ef4444'; // red
    if (risk >= 40) return '#f59e0b'; // yellow
    return '#22c55e'; // green
  };

  const getSensorStatusColor = (status: string) => {
    return status === 'good' ? 'text-green-400' : 
           status === 'warning' ? 'text-yellow-400' : 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Coverage Selector */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Coverage Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(coverageTypes).map(([key, coverage]) => (
            <div
              key={key}
              onClick={() => setSelectedCoverage(key)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCoverage === key 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <h4 className="font-semibold text-gray-100 mb-2">{coverage.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Premium:</span>
                  <span className="text-gray-200 font-medium">{coverage.premium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coverage:</span>
                  <span className="text-gray-200 font-medium">{coverage.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deductible:</span>
                  <span className="text-gray-200 font-medium">{coverage.deductible}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Coverage Details */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Coverage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">What\'s Covered:</h4>
            <div className="space-y-2">
              {coverageTypes[selectedCoverage as keyof typeof coverageTypes].features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Claims Process:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-sm font-semibold text-indigo-400">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-200">Automated Detection</p>
                  <p className="text-xs text-gray-400">Sensors detect anomalies and trigger alerts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-sm font-semibold text-indigo-400">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-200">Instant Documentation</p>
                  <p className="text-xs text-gray-400">AI captures evidence and generates reports</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-sm font-semibold text-indigo-400">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-200">Fast Approval</p>
                  <p className="text-xs text-gray-400">Claims processed in 24-48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Risk Monitoring */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Real-time Risk Monitoring</h3>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Live sensor feed</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {Object.entries(sensorData).map(([key, data]) => (
            <div key={key} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                {key === 'temperature' && <Thermometer className="w-3 h-3 text-gray-500" />}
                {key === 'humidity' && <Droplets className="w-3 h-3 text-gray-500" />}
                {key === 'co2' && <Cloud className="w-3 h-3 text-gray-500" />}
                {key === 'light' && <Zap className="w-3 h-3 text-gray-500" />}
              </div>
              <p className={`text-lg font-semibold ${getSensorStatusColor(data.status)}`}>
                {data.current}
              </p>
              <p className="text-xs text-gray-500">
                {data.optimal[0]}-{data.optimal[1]}
              </p>
            </div>
          ))}
        </div>

        {/* Risk Factor Grid */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-300">Active Risk Factors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cropRiskFactors.map((risk) => (
              <div key={risk.name} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-200">{risk.name}</h5>
                    <p className="text-xs text-gray-400 capitalize">{risk.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: getRiskColor(risk.currentRisk) }}>
                      {risk.currentRisk}% Risk
                    </p>
                    <p className="text-xs text-gray-400">
                      {risk.trend === 'increasing' ? '↑' : risk.trend === 'decreasing' ? '↓' : '→'} {risk.trend}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${risk.currentRisk}%`,
                      backgroundColor: getRiskColor(risk.currentRisk)
                    }}
                  />
                </div>

                {risk.lastIncident && (
                  <p className="text-xs text-gray-400 mb-2">
                    Last incident: {risk.lastIncident.toLocaleDateString()} 
                    {risk.estimatedLoss && ` - Loss: $${risk.estimatedLoss.toLocaleString()}`}
                  </p>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-300">Mitigation measures:</p>
                  {risk.mitigation.map((measure, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-gray-400">{measure}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claims Prevention & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Claims vs Prevention Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Claims Prevention Success</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={claimsHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="prevented" fill="#22c55e" name="Prevented Incidents" />
              <Bar dataKey="claims" fill="#ef4444" name="Actual Claims" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">71% prevention rate</span>
            </div>
            <div className="text-gray-400">
              Saved: $285,000 in potential claims
            </div>
          </div>
        </div>

        {/* Premium Optimization */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Premium Optimization</h3>
          <div className="space-y-3">
            {premiumFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">{factor.factor}</p>
                  <p className="text-xs text-gray-400">{factor.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{factor.impact}%</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-200">Total Premium Reduction</p>
                <p className="text-lg font-bold text-green-400">-70%</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Industry average: $9,500/mo → Your rate: $2,850/mo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Company Benefits */}
      <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-800/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Why Insurance Companies Love Vibelux Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200/80">
              <ul className="space-y-2">
                <li>• Real-time IoT data reduces fraud by 95%</li>
                <li>• Automated alerts prevent 71% of potential claims</li>
                <li>• AI-powered risk assessment improves underwriting accuracy</li>
                <li>• Sensor verification eliminates disputed claims</li>
              </ul>
              <ul className="space-y-2">
                <li>• Historical data enables precise premium calculation</li>
                <li>• Predictive analytics identify risks before losses occur</li>
                <li>• Automated documentation speeds claim processing</li>
                <li>• Integration reduces operational costs by 40%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}