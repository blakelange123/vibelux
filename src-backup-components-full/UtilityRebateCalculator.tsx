"use client"
import { useState, useEffect } from 'react'
import {
  DollarSign,
  Search,
  MapPin,
  Building2,
  FileText,
  Calculator,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Zap,
  Leaf,
  Award,
  Clock,
  ExternalLink
} from 'lucide-react'
import { utilityRebateDatabase, type RebateProgram } from '@/lib/utility-rebate-database'

interface FederalIncentive {
  id: string
  name: string
  description: string
  type: 'tax-credit' | 'grant' | 'loan'
  amount: number | string
  eligibility: string[]
  expirationDate?: Date
}

export function UtilityRebateCalculator() {
  const [zipCode, setZipCode] = useState('')
  const [projectSize, setProjectSize] = useState({
    fixtures: 100,
    wattsPerFixture: 600,
    replacingType: 'HPS',
    replacingWatts: 1000,
    annualHours: 4380,
    facilityType: 'greenhouse' as 'greenhouse' | 'indoor-sole-source-non-stacked' | 'indoor-sole-source-stacked',
    cropType: 'cannabis-flowering' as 'cannabis-flowering' | 'cannabis-vegetative' | 'non-cannabis-flowering' | 'non-cannabis-vegetative',
    fixtureType: 'toplight' as 'toplight' | 'ucl',
    uclFixtures: 0
  })
  
  const [availableRebates, setAvailableRebates] = useState<RebateProgram[]>([])
  const [selectedRebates, setSelectedRebates] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  // Use the comprehensive rebate database from the imported file
  const rebateDatabase = utilityRebateDatabase

  const federalIncentives: FederalIncentive[] = [
    {
      id: '179d',
      name: '179D Tax Deduction',
      description: 'Tax deduction for energy-efficient commercial buildings',
      type: 'tax-credit',
      amount: '$0.50-$1.00 per sq ft',
      eligibility: [
        'Commercial buildings',
        'Minimum 25% energy savings',
        'Certification required'
      ],
      expirationDate: new Date('2032-12-31')
    },
    {
      id: 'usda-reap',
      name: 'USDA REAP Grant',
      description: 'Rural Energy for America Program',
      type: 'grant',
      amount: 'Up to 25% of project cost',
      eligibility: [
        'Agricultural producers',
        'Rural small businesses',
        'Energy efficiency improvements'
      ]
    },
    {
      id: 'pace',
      name: 'PACE Financing',
      description: 'Property Assessed Clean Energy financing',
      type: 'loan',
      amount: '100% financing available',
      eligibility: [
        'Commercial properties',
        'Repaid through property tax',
        'Transferable to new owner'
      ]
    }
  ]

  const searchRebates = () => {
    if (!zipCode) return

    const prefix = zipCode.substring(0, 2)
    const available = rebateDatabase.filter(rebate => 
      rebate.zipCodes.some(zc => prefix.startsWith(zc))
    )
    
    setAvailableRebates(available)
    setShowResults(true)
  }

  const calculateSavings = () => {
    const oldWatts = projectSize.fixtures * projectSize.replacingWatts
    const newWatts = projectSize.fixtures * projectSize.wattsPerFixture
    const kWhSaved = ((oldWatts - newWatts) / 1000) * projectSize.annualHours
    const percentSavings = ((oldWatts - newWatts) / oldWatts) * 100
    
    return {
      kWhSaved,
      percentSavings,
      kWReduction: (oldWatts - newWatts) / 1000
    }
  }

  const calculateRebateAmount = (rebate: RebateProgram) => {
    const savings = calculateSavings()
    let amount = 0
    
    // Check if this is an AgEE program with specific rates
    if (rebate.ageeRates && rebate.ageeRates.length > 0) {
      const rate = rebate.ageeRates.find(r => 
        r.facilityType === projectSize.facilityType && 
        r.cropType === projectSize.cropType
      )
      
      if (rate) {
        // Calculate rebate for toplight fixtures
        const toplightRebate = projectSize.fixtures * rate.toplightRebate
        // Calculate rebate for under-canopy (UCL) fixtures
        const uclRebate = projectSize.uclFixtures * rate.uclRebate
        amount = toplightRebate + uclRebate
      }
    } else if (rebate.rebateType === 'prescriptive') {
      if (rebate.rebateRate < 1) {
        // Rate is per kWh
        amount = savings.kWhSaved * rebate.rebateRate
      } else {
        // Rate is per fixture
        amount = projectSize.fixtures * rebate.rebateRate
      }
    }
    
    // Apply tier structure if exists
    if (rebate.tierStructure && savings.kWhSaved) {
      const tier = rebate.tierStructure.find(t => 
        savings.kWhSaved >= t.min && savings.kWhSaved <= t.max
      )
      if (tier) {
        amount = savings.kWhSaved * tier.rate
      }
    }
    
    return Math.min(amount, rebate.maxRebate)
  }

  const totalRebates = selectedRebates.reduce((sum, rebateId) => {
    const rebate = availableRebates.find(r => r.id === rebateId)
    return sum + (rebate ? calculateRebateAmount(rebate) : 0)
  }, 0)

  const exportReport = () => {
    const savings = calculateSavings()
    const report = {
      project: projectSize,
      energySavings: savings,
      availableRebates: availableRebates.map(r => ({
        ...r,
        estimatedRebate: calculateRebateAmount(r)
      })),
      totalPotentialRebates: totalRebates,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rebate-analysis-${zipCode}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Utility Rebate & Incentive Calculator</h1>
          <p className="text-gray-400">Find available rebates and calculate potential savings</p>
        </div>
        {showResults && (
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        )}
      </div>

      {/* Project Details */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              ZIP Code
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZIP code"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Number of Fixtures
            </label>
            <input
              type="number"
              value={projectSize.fixtures}
              onChange={(e) => setProjectSize({ ...projectSize, fixtures: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              New Fixture Watts
            </label>
            <input
              type="number"
              value={projectSize.wattsPerFixture}
              onChange={(e) => setProjectSize({ ...projectSize, wattsPerFixture: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Replacing Type
            </label>
            <select
              value={projectSize.replacingType}
              onChange={(e) => setProjectSize({ ...projectSize, replacingType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="HPS">HPS</option>
              <option value="MH">Metal Halide</option>
              <option value="CMH">CMH</option>
              <option value="T5">T5 Fluorescent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Existing Fixture Watts
            </label>
            <input
              type="number"
              value={projectSize.replacingWatts}
              onChange={(e) => setProjectSize({ ...projectSize, replacingWatts: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Annual Operating Hours
            </label>
            <input
              type="number"
              value={projectSize.annualHours}
              onChange={(e) => setProjectSize({ ...projectSize, annualHours: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
        </div>
        
        {/* AgEE Specific Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Facility Type
            </label>
            <select
              value={projectSize.facilityType}
              onChange={(e) => setProjectSize({ ...projectSize, facilityType: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="greenhouse">Greenhouse</option>
              <option value="indoor-sole-source-non-stacked">Indoor (Non-stacked)</option>
              <option value="indoor-sole-source-stacked">Indoor (Stacked/Vertical)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Crop Type
            </label>
            <select
              value={projectSize.cropType}
              onChange={(e) => setProjectSize({ ...projectSize, cropType: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="cannabis-flowering">Cannabis - Flowering</option>
              <option value="cannabis-vegetative">Cannabis - Vegetative</option>
              <option value="non-cannabis-flowering">Non-Cannabis - Flowering</option>
              <option value="non-cannabis-vegetative">Non-Cannabis - Vegetative</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Under-Canopy Fixtures (UCL)
            </label>
            <input
              type="number"
              value={projectSize.uclFixtures}
              onChange={(e) => setProjectSize({ ...projectSize, uclFixtures: Number(e.target.value) })}
              placeholder="0"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
        </div>
        
        <button
          onClick={searchRebates}
          disabled={!zipCode}
          className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search Available Rebates
        </button>
      </div>

      {/* Energy Savings Summary */}
      {showResults && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">kW Reduction</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-semibold text-gray-100">
              {calculateSavings().kWReduction.toFixed(1)} kW
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Annual kWh Saved</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-semibold text-gray-100">
              {calculateSavings().kWhSaved.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Energy Reduction</span>
              <Leaf className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-semibold text-gray-100">
              {calculateSavings().percentSavings.toFixed(0)}%
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Rebates</span>
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-semibold text-gray-100">
              ${totalRebates.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Available Rebates */}
      {showResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Utility Rebates */}
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Available Utility Rebates</h2>
            {availableRebates.length > 0 ? (
              <div className="space-y-4">
                {availableRebates.map(rebate => {
                  const rebateAmount = calculateRebateAmount(rebate)
                  const isSelected = selectedRebates.includes(rebate.id)
                  
                  return (
                    <div
                      key={rebate.id}
                      className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedRebates(selectedRebates.filter(id => id !== rebate.id))
                        } else {
                          setSelectedRebates([...selectedRebates, rebate.id])
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-100">{rebate.programName}</h3>
                          <p className="text-sm text-gray-400">{rebate.utilityCompany}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-400">
                            ${rebateAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Estimated rebate</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">
                            {rebate.rebateType === 'prescriptive' ? 'Prescriptive' : 'Custom'} program
                          </span>
                        </div>
                        
                        {/* Show AgEE specific rates if applicable */}
                        {rebate.ageeRates && rebate.ageeRates.length > 0 && (
                          <div className="bg-gray-700/50 rounded p-2 mt-2">
                            <p className="text-xs font-medium text-gray-300 mb-1">AgEE Rebate Rates:</p>
                            {(() => {
                              const rate = rebate.ageeRates.find(r => 
                                r.facilityType === projectSize.facilityType && 
                                r.cropType === projectSize.cropType
                              )
                              if (rate) {
                                return (
                                  <div className="text-xs text-gray-400 space-y-1">
                                    <p>• Toplight: ${rate.toplightRebate}/fixture</p>
                                    <p>• Under-canopy: ${rate.uclRebate}/fixture</p>
                                    <p className="text-purple-400 font-medium mt-1">
                                      Your config: {projectSize.fixtures} toplight + {projectSize.uclFixtures} UCL
                                    </p>
                                  </div>
                                )
                              }
                              return <p className="text-xs text-gray-500">Select facility/crop type for rates</p>
                            })()}
                          </div>
                        )}
                        
                        {/* Show contact info if available */}
                        {rebate.contactInfo && (
                          <div className="mt-2 p-2 bg-gray-700/30 rounded text-xs">
                            {rebate.contactInfo.phone && (
                              <p className="text-gray-400">Phone: {rebate.contactInfo.phone}</p>
                            )}
                            {rebate.contactInfo.email && (
                              <p className="text-gray-400">Email: {rebate.contactInfo.email}</p>
                            )}
                            {rebate.contactInfo.website && (
                              <a 
                                href={rebate.contactInfo.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                              >
                                View program details <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Show PDF application link if available */}
                        {rebate.applicationPDF && (
                          <div className="mt-2">
                            <a 
                              href={rebate.applicationPDF}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 rounded text-xs text-purple-400 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Download Application PDF
                            </a>
                          </div>
                        )}
                        
                        {rebate.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">
                              Deadline: {rebate.deadline.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">
                            Processing: {rebate.processingTime}
                          </span>
                        </div>
                        
                        {rebate.budgetRemaining && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">
                              Budget remaining: ${(rebate.budgetRemaining / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-purple-400 hover:text-purple-300">
                          View requirements
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-gray-400">
                          {rebate.requirements.map((req, idx) => (
                            <li key={idx}>• {req}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No utility rebates found for ZIP code {zipCode}</p>
              </div>
            )}
          </div>

          {/* Federal & State Incentives */}
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Federal & State Incentives</h2>
            <div className="space-y-4">
              {federalIncentives.map(incentive => (
                <div key={incentive.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-100">{incentive.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      incentive.type === 'tax-credit' ? 'bg-green-600/20 text-green-400' :
                      incentive.type === 'grant' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-purple-600/20 text-purple-400'
                    }`}>
                      {incentive.type.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{incentive.description}</p>
                  <p className="text-lg font-semibold text-green-400 mb-3">{incentive.amount}</p>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    {incentive.eligibility.map((req, idx) => (
                      <p key={idx}>• {req}</p>
                    ))}
                  </div>
                  
                  {incentive.expirationDate && (
                    <p className="text-xs text-yellow-400 mt-2">
                      Expires: {incentive.expirationDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary & Next Steps */}
      {showResults && selectedRebates.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Application Summary & Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-100 mb-3">Selected Programs</h3>
              <div className="space-y-2">
                {selectedRebates.map(rebateId => {
                  const rebate = availableRebates.find(r => r.id === rebateId)
                  if (!rebate) return null
                  return (
                    <div key={rebateId} className="flex justify-between text-sm">
                      <span className="text-gray-300">{rebate.programName}</span>
                      <span className="text-green-400">
                        ${calculateRebateAmount(rebate).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-gray-700 flex justify-between font-medium">
                  <span className="text-gray-100">Total Potential Rebates</span>
                  <span className="text-green-400">${totalRebates.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-100 mb-3">Required Documents</h3>
              <div className="space-y-1 text-sm text-gray-400">
                {Array.from(new Set(
                  selectedRebates.flatMap(id => {
                    const rebate = availableRebates.find(r => r.id === id)
                    return rebate?.documentsRequired || []
                  })
                )).map((doc, idx) => (
                  <p key={idx}>• {doc}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-1">Important Notes</p>
                <ul className="space-y-1 text-xs">
                  <li>• Pre-approval may be required before purchasing equipment</li>
                  <li>• Some programs require licensed contractor installation</li>
                  <li>• Rebate amounts are estimates and subject to program rules</li>
                  <li>• Programs may have budget limits and can close early</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}