"use client"
import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Zap,
  Leaf,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  ExternalLink,
  Info,
  Download,
  Calculator,
  BarChart3,
  PiggyBank,
  Lightbulb,
  CheckCircle
} from 'lucide-react'
import { utilityRebateDatabase, type RebateProgram } from '@/lib/utility-rebate-database'
import { EnhancedRebateCalculator, type ProjectDetails, type EnhancedSavingsAnalysis } from '@/lib/enhanced-rebate-calculator'
import { getVerificationStatus } from '@/lib/rebate-verification-status'

export function EnhancedUtilityRebateCalculator() {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'results'>('basic')
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    fixtures: 100,
    wattsPerFixture: 600,
    replacingType: 'HPS',
    replacingWatts: 1000,
    dailyHours: 12,
    daysPerWeek: 7,
    weeksPerYear: 52,
    facilityType: 'greenhouse',
    cropType: 'cannabis-flowering',
    facilityArea: 10000,
    installationCost: 150000,
    fixtureType: 'toplight',
    uclFixtures: 0,
    electricityCost: 0.12,
    hvacSavings: 20,
    maintenanceSavings: 5000,
    discountRate: 0.08
  })
  
  const [zipCode, setZipCode] = useState('')
  const [availableRebates, setAvailableRebates] = useState<RebateProgram[]>([])
  const [selectedRebates, setSelectedRebates] = useState<string[]>([])
  const [savingsAnalysis, setSavingsAnalysis] = useState<EnhancedSavingsAnalysis | null>(null)
  const [showTOUOptimization, setShowTOUOptimization] = useState(false)
  
  const calculator = new EnhancedRebateCalculator()
  
  const searchRebates = () => {
    if (!zipCode) return
    
    const prefix = zipCode.substring(0, 2)
    const available = utilityRebateDatabase.filter(rebate => 
      rebate.zipCodes.some(zc => prefix.startsWith(zc))
    )
    
    setAvailableRebates(available)
    // Auto-select active rebates
    const activeRebates = available.filter(r => 
      r.programStatus?.active && r.programStatus?.fundsAvailable
    )
    setSelectedRebates(activeRebates.map(r => r.id))
  }
  
  const calculateSavings = () => {
    const selectedPrograms = availableRebates.filter(r => selectedRebates.includes(r.id))
    const primaryUtility = selectedPrograms[0]
    
    const analysis = calculator.calculateComprehensiveSavings(
      projectDetails,
      selectedPrograms,
      primaryUtility?.utilityRates
    )
    
    setSavingsAnalysis(analysis)
    setActiveTab('results')
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value))
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Enhanced Utility Rebate & ROI Calculator
        </h1>
        <p className="text-gray-400">
          Comprehensive analysis including TOU optimization, financial metrics, and stackable incentives
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'basic'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Basic Details
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'advanced'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Advanced Options
        </button>
        <button
          onClick={() => setActiveTab('results')}
          disabled={!savingsAnalysis}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'results'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50'
          }`}
        >
          Results & Analysis
        </button>
      </div>
      
      {/* Basic Details Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          {/* Location & Utility */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Location & Utility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ZIP Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter ZIP code"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                  <button
                    onClick={searchRebates}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {availableRebates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Available Programs ({availableRebates.length})
                  </label>
                  <div className="text-sm text-gray-300">
                    {availableRebates.filter(r => r.programStatus?.active).length} active programs found
                  </div>
                </div>
              )}
            </div>
            
            {/* Available Rebates */}
            {availableRebates.length > 0 && (
              <div className="mt-4 space-y-2">
                {availableRebates.map(rebate => (
                  <div
                    key={rebate.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRebates.includes(rebate.id)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => {
                      if (selectedRebates.includes(rebate.id)) {
                        setSelectedRebates(selectedRebates.filter(id => id !== rebate.id))
                      } else {
                        setSelectedRebates([...selectedRebates, rebate.id])
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-100">{rebate.programName}</h3>
                        <p className="text-sm text-gray-400">{rebate.utilityCompany}</p>
                      </div>
                      <div className="text-right">
                        {rebate.programStatus && (
                          <div className="flex items-center gap-2">
                            {rebate.programStatus.active ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className="text-sm text-gray-400">
                              {rebate.programStatus.fundsAvailable ? 'Funds available' : 'Waitlist'}
                            </span>
                          </div>
                        )}
                        {(() => {
                          const verification = getVerificationStatus(rebate.id)
                          if (verification && verification.verificationLevel !== 'verified') {
                            return (
                              <div className="mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  verification.verificationLevel === 'partial' ? 'bg-yellow-600/20 text-yellow-400' :
                                  verification.verificationLevel === 'estimated' ? 'bg-orange-600/20 text-orange-400' :
                                  'bg-red-600/20 text-red-400'
                                }`}>
                                  {verification.verificationLevel === 'partial' ? 'Partially Verified' :
                                   verification.verificationLevel === 'estimated' ? 'Estimated' :
                                   'Unverified'}
                                </span>
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                    
                    {/* Show TOU rates if available */}
                    {rebate.utilityRates && rebate.utilityRates.type === 'tou' && (
                      <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                        <p className="text-gray-300 font-medium mb-1">Time-of-Use Rates Available</p>
                        <p className="text-gray-400">
                          Peak: ${rebate.utilityRates.rates.find(r => r.period?.includes('peak'))?.rate}/kWh
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Project Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Number of Fixtures
                </label>
                <input
                  type="number"
                  value={projectDetails.fixtures}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    fixtures: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  New Fixture Watts
                </label>
                <input
                  type="number"
                  value={projectDetails.wattsPerFixture}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    wattsPerFixture: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Installation Cost
                </label>
                <input
                  type="number"
                  value={projectDetails.installationCost}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    installationCost: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Replacing Type
                </label>
                <select
                  value={projectDetails.replacingType}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    replacingType: e.target.value as any
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                >
                  <option value="HPS">HPS</option>
                  <option value="MH">Metal Halide</option>
                  <option value="CMH">CMH</option>
                  <option value="T5">T5 Fluorescent</option>
                  <option value="T8">T8 Fluorescent</option>
                  <option value="LED">Older LED</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Existing Watts
                </label>
                <input
                  type="number"
                  value={projectDetails.replacingWatts}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    replacingWatts: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Facility Type
                </label>
                <select
                  value={projectDetails.facilityType}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    facilityType: e.target.value as any
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                >
                  <option value="greenhouse">Greenhouse</option>
                  <option value="indoor-sole-source-non-stacked">Indoor (Non-stacked)</option>
                  <option value="indoor-sole-source-stacked">Indoor (Stacked/Vertical)</option>
                  <option value="vertical-farm">Vertical Farm</option>
                </select>
              </div>
            </div>

            {/* SCE AgEE Specific Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Crop Type
                  <span className="text-xs text-purple-400 ml-1">(For SCE AgEE rates)</span>
                </label>
                <select
                  value={projectDetails.cropType}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    cropType: e.target.value as any
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                >
                  <option value="cannabis-flowering">Cannabis - Flowering</option>
                  <option value="cannabis-vegetative">Cannabis - Vegetative</option>
                  <option value="non-cannabis-flowering">Non-Cannabis - Flowering</option>
                  <option value="non-cannabis-vegetative">Non-Cannabis - Vegetative</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  UCL Fixtures
                  <span className="text-xs text-purple-400 ml-1">(Under-canopy lighting)</span>
                </label>
                <input
                  type="number"
                  value={projectDetails.uclFixtures || 0}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    uclFixtures: Number(e.target.value)
                  })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
            </div>
          </div>
          
          {/* Operating Schedule */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Operating Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Daily Hours
                </label>
                <input
                  type="number"
                  value={projectDetails.dailyHours}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    dailyHours: Number(e.target.value)
                  })}
                  min="0"
                  max="24"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Days per Week
                </label>
                <input
                  type="number"
                  value={projectDetails.daysPerWeek}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    daysPerWeek: Number(e.target.value)
                  })}
                  min="1"
                  max="7"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Weeks per Year
                </label>
                <input
                  type="number"
                  value={projectDetails.weeksPerYear}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    weeksPerYear: Number(e.target.value)
                  })}
                  min="1"
                  max="52"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={calculateSavings}
            disabled={availableRebates.length === 0}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
          >
            Calculate Savings & ROI
          </button>
        </div>
      )}
      
      {/* Advanced Options Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Financial Parameters */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Financial Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Electricity Cost ($/kWh)
                </label>
                <input
                  type="number"
                  value={projectDetails.electricityCost}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    electricityCost: Number(e.target.value)
                  })}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Annual Maintenance Savings
                </label>
                <input
                  type="number"
                  value={projectDetails.maintenanceSavings}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    maintenanceSavings: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Discount Rate (%)
                </label>
                <input
                  type="number"
                  value={(projectDetails.discountRate || 0.08) * 100}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    discountRate: Number(e.target.value) / 100
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Benefits */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Additional Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  HVAC Savings (% cooling reduction)
                </label>
                <input
                  type="number"
                  value={projectDetails.hvacSavings}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    hvacSavings: Number(e.target.value)
                  })}
                  min="0"
                  max="50"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Facility Area (sq ft)
                </label>
                <input
                  type="number"
                  value={projectDetails.facilityArea}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    facilityArea: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                />
              </div>
            </div>
          </div>
          
          {/* Crop & Growing Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Crop & Growing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Crop Type
                </label>
                <select
                  value={projectDetails.cropType}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    cropType: e.target.value as any
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                >
                  <option value="cannabis-flowering">Cannabis - Flowering</option>
                  <option value="cannabis-vegetative">Cannabis - Vegetative</option>
                  <option value="non-cannabis-flowering">Non-Cannabis - Flowering</option>
                  <option value="non-cannabis-vegetative">Non-Cannabis - Vegetative</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Fixture Type
                </label>
                <select
                  value={projectDetails.fixtureType}
                  onChange={(e) => setProjectDetails({
                    ...projectDetails,
                    fixtureType: e.target.value as any
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                >
                  <option value="toplight">Toplight Only</option>
                  <option value="ucl">Under-Canopy Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
              
              {(projectDetails.fixtureType === 'ucl' || projectDetails.fixtureType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    UCL Fixtures
                  </label>
                  <input
                    type="number"
                    value={projectDetails.uclFixtures}
                    onChange={(e) => setProjectDetails({
                      ...projectDetails,
                      uclFixtures: Number(e.target.value)
                    })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Results Tab */}
      {activeTab === 'results' && savingsAnalysis && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Financial Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Rebates</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(savingsAnalysis.totalRebates)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Net Project Cost</p>
                <p className="text-2xl font-bold text-gray-100">
                  {formatCurrency(savingsAnalysis.netProjectCost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Simple Payback</p>
                <p className="text-2xl font-bold text-blue-400">
                  {savingsAnalysis.simplePayback.toFixed(1)} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">10-Year NPV</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(savingsAnalysis.npv)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">IRR</p>
                <p className="text-xl font-semibold text-gray-100">
                  {(savingsAnalysis.irr * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Annual Savings</p>
                <p className="text-xl font-semibold text-green-400">
                  {formatCurrency(savingsAnalysis.annualEnergySavings)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">kWh Saved/Year</p>
                <p className="text-xl font-semibold text-gray-100">
                  {formatNumber(savingsAnalysis.annualKwhSaved)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">CO₂ Reduced</p>
                <p className="text-xl font-semibold text-green-400">
                  {savingsAnalysis.carbonReduction.toFixed(1)} tons/yr
                </p>
              </div>
            </div>
          </div>
          
          {/* TOU Optimization */}
          {savingsAnalysis.touSavings && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Time-of-Use Optimization</h3>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                  +{formatCurrency(savingsAnalysis.touSavings.additionalSavings)}/year
                </span>
              </div>
              <div className="space-y-3">
                {savingsAnalysis.touSavings.recommendedSchedule.map((schedule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                    <div>
                      <p className="font-medium text-gray-100">{schedule.period}</p>
                      <p className="text-sm text-gray-400">{schedule.hours}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-100">{schedule.percentageOfOperation}%</p>
                      <p className="text-sm text-gray-400">of operation</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Rebate Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Utility Rebate Comparison ({savingsAnalysis.rebateDetails.length} Programs)
            </h3>
            <div className="space-y-4">
              {savingsAnalysis.rebateDetails.map((rebate, idx) => (
                <div key={idx} className="p-5 bg-gray-700/50 rounded-lg border border-gray-600">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-100 text-lg">{rebate.programName}</h4>
                      <p className="text-gray-400 text-sm">{rebate.utilityCompany}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-400">
                        {formatCurrency(rebate.amount)}
                      </span>
                      {rebate.maxRebate && rebate.amount >= rebate.maxRebate && (
                        <p className="text-xs text-yellow-400">Max rebate reached</p>
                      )}
                    </div>
                  </div>

                  {/* Calculation Method */}
                  <div className="mb-3 p-3 bg-gray-800/50 rounded border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">{rebate.calculationMethod}</span>
                    </div>
                    <p className="text-sm text-gray-300">{rebate.calculationDetails}</p>
                  </div>

                  {/* Program Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Processing Time</p>
                      <p className="text-gray-200">{rebate.processingTime || 'Contact utility'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Program Status</p>
                      <div className="flex items-center gap-2">
                        {rebate.programStatus?.active ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-gray-200">
                          {rebate.programStatus?.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Application</p>
                      {rebate.applicationPDF ? (
                        <a 
                          href={rebate.applicationPDF} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                        >
                          <FileText className="w-4 h-4" />
                          PDF Form
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400">Contact utility</span>
                      )}
                    </div>
                  </div>

                  {/* Deadline Warning */}
                  {rebate.deadline && (
                    <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-300">
                        Application deadline: {rebate.deadline.toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  {rebate.contactInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {rebate.contactInfo.phone && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Phone:</span>
                            <a href={`tel:${rebate.contactInfo.phone}`} className="text-blue-400 hover:text-blue-300">
                              {rebate.contactInfo.phone}
                            </a>
                          </div>
                        )}
                        {rebate.contactInfo.website && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Website:</span>
                            <a 
                              href={rebate.contactInfo.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              More Info
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Comparison Table */}
            {savingsAnalysis.rebateDetails.length > 1 && (
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Quick Comparison
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-gray-300">Utility</th>
                        <th className="text-right py-2 text-gray-300">Rebate Amount</th>
                        <th className="text-center py-2 text-gray-300">Method</th>
                        <th className="text-center py-2 text-gray-300">Processing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savingsAnalysis.rebateDetails.map((rebate, idx) => (
                        <tr key={idx} className="border-b border-gray-700/50">
                          <td className="py-2 text-gray-200">{rebate.utilityCompany}</td>
                          <td className="py-2 text-right font-medium text-green-400">
                            {formatCurrency(rebate.amount)}
                          </td>
                          <td className="py-2 text-center text-purple-300 text-xs">
                            {rebate.calculationMethod}
                          </td>
                          <td className="py-2 text-center text-gray-400 text-xs">
                            {rebate.processingTime || 'TBD'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Total Rebates Summary */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-green-300">Total Available Rebates</span>
                </div>
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(savingsAnalysis.totalRebates)}
                </span>
              </div>
              <p className="text-sm text-green-300 mt-2">
                Total rebates from {savingsAnalysis.rebateDetails.length} eligible programs
              </p>
            </div>
          </div>
          
          {/* Additional Incentives */}
          {savingsAnalysis.additionalIncentives.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Stackable Incentives</h3>
              <div className="space-y-3">
                {savingsAnalysis.additionalIncentives.map((incentive, idx) => (
                  <div key={idx} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-100">{incentive.name}</h4>
                        <p className="text-sm text-gray-400">{incentive.notes}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        incentive.type === 'federal' ? 'bg-blue-600/20 text-blue-400' :
                        incentive.type === 'state' ? 'bg-purple-600/20 text-purple-400' :
                        'bg-green-600/20 text-green-400'
                      }`}>
                        {incentive.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Export Options */}
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Full Report
            </button>
            <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate Rebate Applications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}