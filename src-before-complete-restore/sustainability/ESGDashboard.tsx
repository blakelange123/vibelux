'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf,
  TrendingDown,
  Award,
  BarChart3,
  FileText,
  Download,
  Calendar,
  Target,
  Users,
  Droplets,
  Zap,
  Recycle,
  AlertTriangle,
  CheckCircle,
  Info,
  Building,
  TreePine,
  Car,
  Factory,
  Globe,
  Shield,
  ArrowDown,
  ArrowUp,
  Gauge
} from 'lucide-react';
import { EmissionsCalculator, FacilityData, EmissionsReport } from '@/lib/esg/emissions-calculator';
import { SustainabilityCalculator, ResourceMetrics, SocialMetrics, GovernanceMetrics } from '@/lib/esg/sustainability-metrics';

export function ESGDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'emissions' | 'resources' | 'social' | 'reports'>('overview');
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('year');
  
  // Initialize calculators
  const emissionsCalc = new EmissionsCalculator();
  const sustainabilityCalc = new SustainabilityCalculator();
  
  // Sample facility data - in production, this would come from actual sensors
  const [facilityData] = useState<FacilityData>({
    location: 'California',
    zipCode: '90210',
    squareFeet: 50000,
    monthlyElectricityKWh: 125000,
    monthlyNaturalGasCubicMeters: 500,
    refrigerantType: 'R410A',
    refrigerantLeakageKg: 2,
    solarGenerationKWh: 20000,
    renewableEnergyPercent: 30
  });

  const [resourceMetrics] = useState<ResourceMetrics>({
    energy: {
      totalKWh: 1500000,
      renewableKWh: 450000,
      renewablePercent: 30,
      energyIntensity: 25,
      pue: 1.4
    },
    water: {
      totalGallons: 500000,
      recycledGallons: 300000,
      recycledPercent: 60,
      waterIntensity: 8,
      runoffCaptured: 50000
    },
    waste: {
      totalKg: 10000,
      compostedKg: 6000,
      recycledKg: 3000,
      landfillKg: 1000,
      diversionRate: 90
    },
    chemicals: {
      pesticideUse: 0,
      fertilizerUse: 500,
      organicPercent: 100
    }
  });

  const [socialMetrics] = useState<SocialMetrics>({
    labor: {
      totalEmployees: 25,
      livingWagePercent: 100,
      womenPercent: 40,
      minorityPercent: 35,
      trainingHours: 1000,
      safetyIncidents: 0,
      turnoverRate: 12
    },
    community: {
      localHires: 20,
      communityInvestment: 50000,
      educationPrograms: 12,
      foodDonated: 5000
    },
    supply: {
      localSuppliers: 15,
      certifiedSuppliers: 12,
      supplierAudits: 8
    }
  });

  const [governanceMetrics] = useState<GovernanceMetrics>({
    certifications: ['USDA Organic', 'Fair Trade', 'B-Corp Pending'],
    policies: [
      'Environmental Policy',
      'Code of Conduct',
      'Supply Chain Policy',
      'Data Privacy Policy'
    ],
    audits: {
      internal: 4,
      external: 2,
      findings: 3
    },
    transparency: {
      publicReporting: true,
      dataVerification: true,
      stakeholderEngagement: 8
    }
  });

  // Calculate emissions
  const emissionsReport = emissionsCalc.calculateEmissions(facilityData);
  
  // Calculate ESG score
  const esgScore = sustainabilityCalc.calculateESGScore(
    emissionsReport,
    resourceMetrics,
    socialMetrics,
    governanceMetrics
  );

  // Calculate baseline for comparison (traditional greenhouse)
  const baselineData: FacilityData = {
    ...facilityData,
    monthlyElectricityKWh: 200000, // Higher energy use
    solarGenerationKWh: 0, // No solar
    renewableEnergyPercent: 0 // No renewables
  };
  const baselineEmissions = emissionsCalc.calculateEmissions(baselineData);
  const emissionsReduction = emissionsCalc.calculateEmissionsReduction(emissionsReport, baselineEmissions);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* ESG Score Card */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">ESG Performance Score</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-600"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - esgScore.overall / 100)}`}
                  className="text-green-400 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-3xl font-bold text-white">{Math.round(esgScore.overall)}</div>
                  <div className="text-xs text-gray-400">Overall</div>
                </div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              esgScore.grade === 'A' ? 'text-green-400' :
              esgScore.grade === 'B' ? 'text-blue-400' :
              esgScore.grade === 'C' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              Grade: {esgScore.grade}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Environmental</span>
              <Leaf className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">{Math.round(esgScore.environmental)}</div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${esgScore.environmental}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {emissionsReduction.percentReduction.toFixed(1)}% below baseline
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Social</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">{Math.round(esgScore.social)}</div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${esgScore.social}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              100% living wages
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Governance</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">{Math.round(esgScore.governance)}</div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${esgScore.governance}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {governanceMetrics.certifications.length} certifications
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-400">Carbon Footprint</h4>
            <Factory className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {(emissionsReport.totalEmissions / 1000).toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">tCO₂e/year</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowDown className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">
              {emissionsReduction.percentReduction.toFixed(0)}% vs baseline
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-400">Renewable Energy</h4>
            <Sun className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {resourceMetrics.energy.renewablePercent}%
            </span>
            <span className="text-sm text-gray-400">of total</span>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {(resourceMetrics.energy.renewableKWh / 1000).toFixed(0)} MWh renewable
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-400">Water Recycling</h4>
            <Droplets className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {resourceMetrics.water.recycledPercent}%
            </span>
            <span className="text-sm text-gray-400">recycled</span>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {(resourceMetrics.water.recycledGallons / 1000).toFixed(0)}k gal saved
          </div>
        </div>
      </div>

      {/* Environmental Impact Equivalents */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Environmental Impact</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <TreePine className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {emissionsReduction.equivalentTrees.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Trees planted equivalent</p>
          </div>
          
          <div className="text-center">
            <Car className="w-12 h-12 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {emissionsReduction.equivalentCars.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Cars off the road</p>
          </div>
          
          <div className="text-center">
            <Building className="w-12 h-12 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {emissionsReport.emissionsIntensity.toFixed(2)}
            </div>
            <p className="text-sm text-gray-400">kg CO₂e/sq ft/year</p>
          </div>
          
          <div className="text-center">
            <Recycle className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {resourceMetrics.waste.diversionRate}%
            </div>
            <p className="text-sm text-gray-400">Waste diverted</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmissions = () => (
    <div className="space-y-6">
      {/* Emissions Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">GHG Emissions by Scope</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Scope 1 - Direct</h4>
            <div className="text-2xl font-bold text-orange-400 mb-3">
              {(emissionsReport.scope1.total / 1000).toFixed(2)} tCO₂e
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Natural Gas</span>
                <span className="text-white">{(emissionsReport.scope1.naturalGas / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Refrigerants</span>
                <span className="text-white">{(emissionsReport.scope1.refrigerants / 1000).toFixed(2)} t</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Scope 2 - Electricity</h4>
            <div className="text-2xl font-bold text-yellow-400 mb-3">
              {(emissionsReport.scope2.total / 1000).toFixed(2)} tCO₂e
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Location-based</span>
                <span className="text-white">{(emissionsReport.scope2.electricityLocationBased / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market-based</span>
                <span className="text-white">{(emissionsReport.scope2.electricityMarketBased / 1000).toFixed(2)} t</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Scope 3 - Indirect</h4>
            <div className="text-2xl font-bold text-purple-400 mb-3">
              {(emissionsReport.scope3.total / 1000).toFixed(2)} tCO₂e
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Upstream Energy</span>
                <span className="text-white">{(emissionsReport.scope3.upstreamEnergy / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Waste</span>
                <span className="text-white">{(emissionsReport.scope3.waste / 1000).toFixed(2)} t</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reduction Opportunities */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Emissions Reduction Achieved</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-white">Solar Generation</p>
                <p className="text-xs text-gray-400">On-site renewable energy</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-400">
                -{(emissionsReport.reductions.fromSolar / 1000).toFixed(2)} tCO₂e
              </p>
              <p className="text-xs text-gray-400">annually</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-white">Renewable Energy Purchases</p>
                <p className="text-xs text-gray-400">Clean power agreements</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-400">
                -{(emissionsReport.reductions.fromRenewables / 1000).toFixed(2)} tCO₂e
              </p>
              <p className="text-xs text-gray-400">annually</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">Energy Efficiency</p>
                <p className="text-xs text-gray-400">LED lighting, smart controls</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-400">
                -{(emissionsReport.reductions.fromEfficiency / 1000).toFixed(2)} tCO₂e
              </p>
              <p className="text-xs text-gray-400">annually</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Total Emissions Avoided</p>
              <p className="text-xs text-gray-400 mt-1">Compared to traditional greenhouse</p>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {(emissionsReduction.absoluteReduction / 1000).toFixed(1)} tCO₂e
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sustainability Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">GHG Protocol Report</h4>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Complete greenhouse gas inventory following GHG Protocol Corporate Standard
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">ESG Performance Report</h4>
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Comprehensive ESG metrics and performance against industry benchmarks
            </p>
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">TCFD Climate Report</h4>
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Climate-related financial disclosures following TCFD recommendations
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Sustainability Certificate</h4>
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Official sustainability performance certificate for stakeholders
            </p>
            <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Certifications & Standards</h3>
        
        <div className="space-y-3">
          {governanceMetrics.certifications.map((cert, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">{cert}</span>
              </div>
              <span className="text-sm text-gray-400">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-400" />
          ESG & Sustainability Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Annual</option>
          </select>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: Gauge },
          { id: 'emissions', label: 'Emissions', icon: Factory },
          { id: 'resources', label: 'Resources', icon: Droplets },
          { id: 'social', label: 'Social', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'emissions' && renderEmissions()}
      {activeTab === 'reports' && renderReports()}
      {/* Additional tabs can be implemented similarly */}
    </div>
  );
}