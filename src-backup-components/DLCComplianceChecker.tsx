"use client"
import { useState, useEffect } from 'react'
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  Upload,
  FileText,
  Award,
  TrendingUp,
  Calendar,
  ExternalLink,
  Filter,
  Info,
  Zap,
  DollarSign,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react'

interface DLCCategory {
  id: string
  name: string
  description: string
  minEfficacy: number // µmol/J
  minPPF: number // µmol/s
  powerFactor: number
  thd: number // Total Harmonic Distortion %
  driverLifetime: number // hours
  warranty: number // years
}

interface FixtureSpec {
  manufacturer: string
  model: string
  power: number // watts
  ppf: number // µmol/s
  efficacy: number // µmol/J
  spectrum: {
    blue: number // 400-500nm %
    green: number // 500-600nm %
    red: number // 600-700nm %
    farRed: number // 700-800nm %
  }
  powerFactor: number
  thd: number
  l70Hours: number
  warranty: number
  price: number
  dlcListed: boolean
  dlcCategory?: string
  dlcListingDate?: Date
  dlcExpirationDate?: Date
}

interface ComplianceReport {
  fixture: FixtureSpec
  category: DLCCategory
  compliant: boolean
  issues: string[]
  rebateEligible: boolean
  estimatedRebate: number
  recommendations: string[]
}

export function DLCComplianceChecker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [fixtures, setFixtures] = useState<FixtureSpec[]>([])
  const [selectedFixture, setSelectedFixture] = useState<FixtureSpec | null>(null)
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [filterCompliant, setFilterCompliant] = useState<'all' | 'compliant' | 'non-compliant'>('all')

  // DLC Horticultural Categories (as of 2024)
  const dlcCategories: DLCCategory[] = [
    {
      id: 'standard',
      name: 'DLC Standard',
      description: 'Basic efficiency requirements',
      minEfficacy: 2.3,
      minPPF: 100,
      powerFactor: 0.9,
      thd: 20,
      driverLifetime: 50000,
      warranty: 5
    },
    {
      id: 'premium',
      name: 'DLC Premium',
      description: 'Higher efficiency, eligible for enhanced rebates',
      minEfficacy: 2.6,
      minPPF: 100,
      powerFactor: 0.9,
      thd: 20,
      driverLifetime: 50000,
      warranty: 5
    },
    {
      id: 'premium-v5',
      name: 'DLC Premium V5.1',
      description: 'Latest requirements with improved performance',
      minEfficacy: 2.8,
      minPPF: 100,
      powerFactor: 0.95,
      thd: 15,
      driverLifetime: 75000,
      warranty: 5
    },
    {
      id: 'technical',
      name: 'Technical Requirements',
      description: 'Full spectrum and controllability features',
      minEfficacy: 2.6,
      minPPF: 100,
      powerFactor: 0.9,
      thd: 20,
      driverLifetime: 50000,
      warranty: 5
    }
  ]

  // Sample fixture database (in production, this would be API-driven)
  const fixtureDatabase: FixtureSpec[] = [
    {
      manufacturer: 'GrowLight Pro',
      model: 'GL-1000',
      power: 1000,
      ppf: 2800,
      efficacy: 2.8,
      spectrum: { blue: 15, green: 30, red: 45, farRed: 10 },
      powerFactor: 0.96,
      thd: 12,
      l70Hours: 90000,
      warranty: 5,
      price: 1200,
      dlcListed: true,
      dlcCategory: 'premium-v5',
      dlcListingDate: new Date('2023-06-15'),
      dlcExpirationDate: new Date('2025-06-15')
    },
    {
      manufacturer: 'EcoGrow Solutions',
      model: 'EG-600',
      power: 600,
      ppf: 1560,
      efficacy: 2.6,
      spectrum: { blue: 12, green: 25, red: 50, farRed: 13 },
      powerFactor: 0.92,
      thd: 18,
      l70Hours: 75000,
      warranty: 5,
      price: 800,
      dlcListed: true,
      dlcCategory: 'premium',
      dlcListingDate: new Date('2023-01-20'),
      dlcExpirationDate: new Date('2025-01-20')
    },
    {
      manufacturer: 'Budget Lights',
      model: 'BL-500',
      power: 500,
      ppf: 1000,
      efficacy: 2.0,
      spectrum: { blue: 20, green: 35, red: 40, farRed: 5 },
      powerFactor: 0.85,
      thd: 25,
      l70Hours: 40000,
      warranty: 3,
      price: 350,
      dlcListed: false
    },
    {
      manufacturer: 'Premium Photonics',
      model: 'PP-800X',
      power: 800,
      ppf: 2320,
      efficacy: 2.9,
      spectrum: { blue: 18, green: 27, red: 43, farRed: 12 },
      powerFactor: 0.98,
      thd: 8,
      l70Hours: 100000,
      warranty: 7,
      price: 1500,
      dlcListed: true,
      dlcCategory: 'premium-v5',
      dlcListingDate: new Date('2024-01-10'),
      dlcExpirationDate: new Date('2026-01-10')
    }
  ]

  useEffect(() => {
    // Filter fixtures based on search and compliance
    let filtered = fixtureDatabase

    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCompliant !== 'all') {
      filtered = filtered.filter(f => 
        filterCompliant === 'compliant' ? f.dlcListed : !f.dlcListed
      )
    }

    setFixtures(filtered)
  }, [searchQuery, filterCompliant])

  const checkCompliance = (fixture: FixtureSpec, categoryId: string) => {
    const category = dlcCategories.find(c => c.id === categoryId)
    if (!category) return

    const issues: string[] = []
    const recommendations: string[] = []

    // Check efficacy
    if (fixture.efficacy < category.minEfficacy) {
      issues.push(`Efficacy (${fixture.efficacy} µmol/J) below minimum ${category.minEfficacy} µmol/J`)
      recommendations.push('Consider upgrading to more efficient LED chips or drivers')
    }

    // Check PPF
    if (fixture.ppf < category.minPPF) {
      issues.push(`PPF (${fixture.ppf} µmol/s) below minimum ${category.minPPF} µmol/s`)
    }

    // Check power factor
    if (fixture.powerFactor < category.powerFactor) {
      issues.push(`Power factor (${fixture.powerFactor}) below minimum ${category.powerFactor}`)
      recommendations.push('Upgrade to driver with active power factor correction')
    }

    // Check THD
    if (fixture.thd > category.thd) {
      issues.push(`THD (${fixture.thd}%) exceeds maximum ${category.thd}%`)
      recommendations.push('Consider driver with better harmonic filtering')
    }

    // Check lifetime
    if (fixture.l70Hours < category.driverLifetime) {
      issues.push(`L70 lifetime (${fixture.l70Hours}h) below minimum ${category.driverLifetime}h`)
      recommendations.push('Improve thermal management or use higher quality components')
    }

    // Check warranty
    if (fixture.warranty < category.warranty) {
      issues.push(`Warranty (${fixture.warranty} years) below minimum ${category.warranty} years`)
    }

    const compliant = issues.length === 0
    const rebateEligible = compliant && fixture.dlcListed
    
    // Estimate rebate based on category and power
    let estimatedRebate = 0
    if (rebateEligible) {
      if (categoryId === 'premium-v5') {
        estimatedRebate = fixture.power * 0.25 // $0.25/watt for premium v5
      } else if (categoryId === 'premium') {
        estimatedRebate = fixture.power * 0.20 // $0.20/watt for premium
      } else {
        estimatedRebate = fixture.power * 0.15 // $0.15/watt for standard
      }
    }

    // Add positive recommendations if compliant
    if (compliant) {
      recommendations.push('Fixture meets all DLC requirements')
      if (fixture.dlcListed) {
        recommendations.push('Eligible for utility rebates in most jurisdictions')
      } else {
        recommendations.push('Consider applying for DLC listing to access rebates')
      }
    }

    const report: ComplianceReport = {
      fixture,
      category,
      compliant,
      issues,
      rebateEligible,
      estimatedRebate,
      recommendations
    }

    setComplianceReport(report)
  }

  const exportReport = () => {
    if (!complianceReport) return

    const data = {
      fixture: complianceReport.fixture,
      category: complianceReport.category.name,
      compliant: complianceReport.compliant,
      issues: complianceReport.issues,
      rebateEligible: complianceReport.rebateEligible,
      estimatedRebate: complianceReport.estimatedRebate,
      recommendations: complianceReport.recommendations,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dlc-compliance-${complianceReport.fixture.model}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // In production, parse spec sheet or IES file
    alert('Spec sheet upload functionality would parse and extract fixture specifications')
    setShowUpload(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">DLC QPL Compliance Checker</h1>
          <p className="text-gray-400">Verify fixture compliance with DesignLights Consortium standards</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Spec Sheet
          </button>
          <a
            href="https://www.designlights.org/horticultural-lighting/search/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            DLC QPL Database
          </a>
        </div>
      </div>

      {/* DLC Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {dlcCategories.map(category => (
          <div
            key={category.id}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => setSelectedCategory(category.id)}
          >
            <h3 className="font-medium text-gray-100 mb-1">{category.name}</h3>
            <p className="text-xs text-gray-400 mb-2">{category.description}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Min. Efficacy:</span>
                <span className="text-gray-100">{category.minEfficacy} µmol/J</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min. PF:</span>
                <span className="text-gray-100">{category.powerFactor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixture Search & List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filters */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fixtures by manufacturer or model..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              <select
                value={filterCompliant}
                onChange={(e) => setFilterCompliant(e.target.value as any)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              >
                <option value="all">All Fixtures</option>
                <option value="compliant">DLC Listed</option>
                <option value="non-compliant">Non-Listed</option>
              </select>
            </div>
          </div>

          {/* Fixture List */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {fixtures.map(fixture => (
                <div
                  key={`${fixture.manufacturer}-${fixture.model}`}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${
                    selectedFixture?.model === fixture.model ? 'bg-gray-750' : ''
                  }`}
                  onClick={() => setSelectedFixture(fixture)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-100">
                        {fixture.manufacturer} {fixture.model}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-400">
                        <span>{fixture.power}W</span>
                        <span>{fixture.ppf} µmol/s</span>
                        <span>{fixture.efficacy} µmol/J</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fixture.dlcListed ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">DLC Listed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Not Listed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Test */}
          {selectedFixture && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Test Compliance</h2>
              <div className="grid grid-cols-2 gap-3">
                {dlcCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => checkCompliance(selectedFixture, category.id)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-gray-100">{category.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Test against requirements</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Selected Fixture Details */}
          {selectedFixture && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Fixture Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Model</p>
                  <p className="font-medium text-gray-100">
                    {selectedFixture.manufacturer} {selectedFixture.model}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-400">Power</p>
                    <p className="font-medium text-gray-100">{selectedFixture.power}W</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">PPF</p>
                    <p className="font-medium text-gray-100">{selectedFixture.ppf} µmol/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Efficacy</p>
                    <p className="font-medium text-gray-100">{selectedFixture.efficacy} µmol/J</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Power Factor</p>
                    <p className="font-medium text-gray-100">{selectedFixture.powerFactor}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Spectrum Distribution</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Blue:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedFixture.spectrum.blue}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{selectedFixture.spectrum.blue}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Green:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${selectedFixture.spectrum.green}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{selectedFixture.spectrum.green}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Red:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${selectedFixture.spectrum.red}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{selectedFixture.spectrum.red}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Far Red:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${selectedFixture.spectrum.farRed}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{selectedFixture.spectrum.farRed}%</span>
                    </div>
                  </div>
                </div>

                {selectedFixture.dlcListed && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-green-400" />
                      <p className="text-sm font-medium text-green-400">DLC Listed</p>
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p>Category: {selectedFixture.dlcCategory}</p>
                      <p>Listed: {selectedFixture.dlcListingDate?.toLocaleDateString()}</p>
                      <p>Expires: {selectedFixture.dlcExpirationDate?.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Report */}
          {complianceReport && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Compliance Report</h3>
                <button
                  onClick={exportReport}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="mb-4">
                <div className={`flex items-center gap-2 text-lg font-medium ${
                  complianceReport.compliant ? 'text-green-400' : 'text-red-400'
                }`}>
                  {complianceReport.compliant ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  {complianceReport.compliant ? 'Compliant' : 'Non-Compliant'}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {complianceReport.category.name} Requirements
                </p>
              </div>

              {complianceReport.issues.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-100 mb-2">Issues Found:</p>
                  <ul className="space-y-1 text-sm text-red-400">
                    {complianceReport.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-100 mb-2">Recommendations:</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  {complianceReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {complianceReport.rebateEligible && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-100">Rebate Eligible</p>
                      <p className="text-xs text-gray-400">Based on typical utility programs</p>
                    </div>
                    <p className="text-lg font-semibold text-green-400">
                      ${complianceReport.estimatedRebate.toFixed(0)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ROI Calculator */}
          {selectedFixture && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">ROI Analysis</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fixture Cost:</span>
                  <span className="text-gray-100">${selectedFixture.price}</span>
                </div>
                {complianceReport?.rebateEligible && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Rebate:</span>
                    <span className="text-green-400">-${complianceReport.estimatedRebate.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t border-gray-700 pt-3">
                  <span className="text-gray-100">Net Cost:</span>
                  <span className="text-gray-100">
                    ${(selectedFixture.price - (complianceReport?.estimatedRebate || 0)).toFixed(0)}
                  </span>
                </div>
                <div className="pt-2 space-y-1 text-xs text-gray-400">
                  <p>• Energy savings vs HPS: ~40%</p>
                  <p>• Typical payback: 2-3 years</p>
                  <p>• Lifetime savings: ${(selectedFixture.power * 0.4 * 12 * 0.12 * 10).toFixed(0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Upload Spec Sheet</h2>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Drop spec sheet or IES file here</p>
              <input
                type="file"
                accept=".pdf,.ies,.ldt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer inline-block transition-colors"
              >
                Choose File
              </label>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}