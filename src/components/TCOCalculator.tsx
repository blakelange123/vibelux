"use client"
import { useState, useEffect } from 'react'
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Zap,
  Wrench,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Download,
  Settings,
  Lightbulb,
  Droplets,
  Users,
  Package,
  Shield,
  Clock,
  PieChart,
  Info
} from 'lucide-react'

interface TCOComponent {
  category: string
  name: string
  initialCost: number
  annualCost: number
  lifespan: number // years
  maintenanceCost: number
  efficiencyLoss: number // % per year
}

interface TCOAnalysis {
  totalInitialInvestment: number
  annualOperatingCost: number
  fiveYearTCO: number
  tenYearTCO: number
  paybackPeriod: number
  roi: number
  npv: number
}

interface Scenario {
  id: string
  name: string
  description: string
  fixtures: number
  technology: 'LED' | 'HPS' | 'CMH' | 'Fluorescent'
  components: TCOComponent[]
}

export function TCOCalculator() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'led-modern',
      name: 'Modern LED System',
      description: 'High-efficiency LED fixtures with smart controls',
      fixtures: 100,
      technology: 'LED',
      components: [
        {
          category: 'Fixtures',
          name: 'LED Grow Lights',
          initialCost: 180000,
          annualCost: 0,
          lifespan: 10,
          maintenanceCost: 500,
          efficiencyLoss: 3
        },
        {
          category: 'Energy',
          name: 'Electricity',
          initialCost: 0,
          annualCost: 45000,
          lifespan: 1,
          maintenanceCost: 0,
          efficiencyLoss: 0
        },
        {
          category: 'Controls',
          name: 'Smart Control System',
          initialCost: 15000,
          annualCost: 1200,
          lifespan: 7,
          maintenanceCost: 300,
          efficiencyLoss: 0
        },
        {
          category: 'HVAC',
          name: 'Cooling Reduction',
          initialCost: -20000,
          annualCost: -8000,
          lifespan: 15,
          maintenanceCost: 0,
          efficiencyLoss: 0
        },
        {
          category: 'Installation',
          name: 'Professional Installation',
          initialCost: 25000,
          annualCost: 0,
          lifespan: 10,
          maintenanceCost: 0,
          efficiencyLoss: 0
        },
        {
          category: 'Maintenance',
          name: 'Cleaning & Calibration',
          initialCost: 0,
          annualCost: 3000,
          lifespan: 1,
          maintenanceCost: 0,
          efficiencyLoss: 0
        }
      ]
    },
    {
      id: 'hps-traditional',
      name: 'Traditional HPS System',
      description: 'High-pressure sodium fixtures',
      fixtures: 100,
      technology: 'HPS',
      components: [
        {
          category: 'Fixtures',
          name: 'HPS Fixtures & Ballasts',
          initialCost: 80000,
          annualCost: 0,
          lifespan: 5,
          maintenanceCost: 2000,
          efficiencyLoss: 5
        },
        {
          category: 'Energy',
          name: 'Electricity',
          initialCost: 0,
          annualCost: 85000,
          lifespan: 1,
          maintenanceCost: 0,
          efficiencyLoss: 0
        },
        {
          category: 'Bulbs',
          name: 'HPS Bulb Replacements',
          initialCost: 0,
          annualCost: 12000,
          lifespan: 1,
          maintenanceCost: 0,
          efficiencyLoss: 0
        },
        {
          category: 'HVAC',
          name: 'Additional Cooling',
          initialCost: 30000,
          annualCost: 15000,
          lifespan: 10,
          maintenanceCost: 2000,
          efficiencyLoss: 2
        },
        {
          category: 'Installation',
          name: 'Installation',
          initialCost: 15000,
          annualCost: 0,
          lifespan: 5,
          maintenanceCost: 0,
          efficiencyLoss: 0
        }
      ]
    }
  ])

  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['led-modern', 'hps-traditional'])
  const [comparisonYears, setComparisonYears] = useState(10)
  const [electricityRate, setElectricityRate] = useState(0.12) // $/kWh
  const [inflationRate, setInflationRate] = useState(0.03) // 3%
  const [discountRate, setDiscountRate] = useState(0.08) // 8%

  const calculateTCO = (scenario: Scenario): TCOAnalysis => {
    let totalInitial = 0
    let annualOperating = 0
    
    // Calculate initial investment and annual costs
    scenario.components.forEach(component => {
      totalInitial += component.initialCost
      annualOperating += component.annualCost + component.maintenanceCost
    })

    // Calculate multi-year TCO with inflation and efficiency loss
    let fiveYearTCO = totalInitial
    let tenYearTCO = totalInitial
    
    for (let year = 1; year <= 10; year++) {
      let yearCost = annualOperating * Math.pow(1 + inflationRate, year - 1)
      
      // Add efficiency loss impact
      scenario.components.forEach(component => {
        if (component.efficiencyLoss > 0 && component.category === 'Energy') {
          yearCost += component.annualCost * (component.efficiencyLoss / 100) * year
        }
      })
      
      // Add replacement costs
      scenario.components.forEach(component => {
        if (year % component.lifespan === 0 && year > 0) {
          yearCost += component.initialCost * Math.pow(1 + inflationRate, year - 1)
        }
      })
      
      if (year <= 5) fiveYearTCO += yearCost
      tenYearTCO += yearCost
    }

    // Calculate NPV
    let npv = -totalInitial
    for (let year = 1; year <= 10; year++) {
      const savings = scenario.technology === 'LED' ? 40000 : 0 // Annual savings vs baseline
      npv += savings / Math.pow(1 + discountRate, year)
    }

    // Simple payback period (years)
    const annualSavings = scenario.technology === 'LED' ? 40000 : 0
    const paybackPeriod = annualSavings > 0 ? totalInitial / annualSavings : 0

    // ROI
    const totalSavings = annualSavings * 10
    const roi = totalInitial > 0 ? ((totalSavings - totalInitial) / totalInitial) * 100 : 0

    return {
      totalInitialInvestment: totalInitial,
      annualOperatingCost: annualOperating,
      fiveYearTCO: fiveYearTCO,
      tenYearTCO: tenYearTCO,
      paybackPeriod: paybackPeriod,
      roi: roi,
      npv: npv
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const exportAnalysis = () => {
    const data = selectedScenarios.map(id => {
      const scenario = scenarios.find(s => s.id === id)
      if (!scenario) return null
      const analysis = calculateTCO(scenario)
      return {
        scenario: scenario.name,
        ...analysis
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    const csv = [
      ['Scenario', 'Initial Investment', 'Annual Operating', '5-Year TCO', '10-Year TCO', 'Payback Period', 'ROI', 'NPV'],
      ...data.map(d => [
        d.scenario,
        d.totalInitialInvestment,
        d.annualOperatingCost,
        d.fiveYearTCO,
        d.tenYearTCO,
        d.paybackPeriod.toFixed(1),
        d.roi.toFixed(1) + '%',
        d.npv
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tco-analysis-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Total Cost of Ownership Calculator</h1>
          <p className="text-gray-400">Compare lifecycle costs of different lighting technologies</p>
        </div>
        <button
          onClick={exportAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Analysis
        </button>
      </div>

      {/* Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Analysis Parameters
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Comparison Period (years)
            </label>
            <input
              type="number"
              value={comparisonYears}
              onChange={(e) => setComparisonYears(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Electricity Rate ($/kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={electricityRate}
              onChange={(e) => setElectricityRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Inflation Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inflationRate * 100}
              onChange={(e) => setInflationRate(Number(e.target.value) / 100)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Discount Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={discountRate * 100}
              onChange={(e) => setDiscountRate(Number(e.target.value) / 100)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {scenarios.map(scenario => {
          const isSelected = selectedScenarios.includes(scenario.id)
          const analysis = calculateTCO(scenario)
          
          return (
            <div
              key={scenario.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                isSelected ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => {
                if (isSelected && selectedScenarios.length > 1) {
                  setSelectedScenarios(selectedScenarios.filter(id => id !== scenario.id))
                } else if (!isSelected) {
                  setSelectedScenarios([...selectedScenarios, scenario.id])
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <Lightbulb className={`w-5 h-5 ${
                      scenario.technology === 'LED' ? 'text-green-400' :
                      scenario.technology === 'HPS' ? 'text-orange-400' :
                      'text-blue-400'
                    }`} />
                    {scenario.name}
                  </h3>
                  <p className="text-sm text-gray-400">{scenario.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                }`}>
                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Initial Investment</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {formatCurrency(analysis.totalInitialInvestment)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Annual Operating</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {formatCurrency(analysis.annualOperatingCost)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">10-Year TCO</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {formatCurrency(analysis.tenYearTCO)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Payback Period</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {analysis.paybackPeriod > 0 ? `${analysis.paybackPeriod.toFixed(1)} years` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Component Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Cost Components</h4>
                {scenario.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{component.name}</span>
                    <span className={`font-medium ${
                      component.initialCost < 0 || component.annualCost < 0
                        ? 'text-green-400'
                        : 'text-gray-100'
                    }`}>
                      {component.initialCost > 0 && formatCurrency(component.initialCost)}
                      {component.annualCost !== 0 && (
                        <span className="text-xs text-gray-400">
                          {component.initialCost > 0 && ' + '}
                          {formatCurrency(Math.abs(component.annualCost))}/yr
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Chart */}
      {selectedScenarios.length > 1 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            TCO Comparison Over Time
          </h2>
          
          <div className="h-64 relative">
            {/* Simple bar chart visualization */}
            <div className="absolute inset-0 flex items-end justify-around">
              {selectedScenarios.map((id, index) => {
                const scenario = scenarios.find(s => s.id === id)
                if (!scenario) return null
                const analysis = calculateTCO(scenario)
                const maxTCO = Math.max(...selectedScenarios.map(sid => {
                  const s = scenarios.find(sc => sc.id === sid)
                  return s ? calculateTCO(s).tenYearTCO : 0
                }))
                
                return (
                  <div key={id} className="flex flex-col items-center gap-2 flex-1">
                    <div className="flex flex-col gap-1 w-full max-w-24">
                      <div
                        className="bg-purple-600 rounded-t transition-all"
                        style={{ 
                          height: `${(analysis.tenYearTCO / maxTCO) * 200}px`,
                          opacity: 0.8 + (index * 0.1)
                        }}
                      />
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{scenario.name}</p>
                        <p className="text-sm font-semibold text-gray-100">
                          {formatCurrency(analysis.tenYearTCO)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ROI Comparison */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Best Initial Cost</p>
              <p className="text-lg font-semibold text-green-400">
                {(() => {
                  const best = scenarios
                    .filter(s => selectedScenarios.includes(s.id))
                    .sort((a, b) => calculateTCO(a).totalInitialInvestment - calculateTCO(b).totalInitialInvestment)[0]
                  return best ? best.name : 'N/A'
                })()}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Lowest Operating Cost</p>
              <p className="text-lg font-semibold text-green-400">
                {(() => {
                  const best = scenarios
                    .filter(s => selectedScenarios.includes(s.id))
                    .sort((a, b) => calculateTCO(a).annualOperatingCost - calculateTCO(b).annualOperatingCost)[0]
                  return best ? best.name : 'N/A'
                })()}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Best 10-Year TCO</p>
              <p className="text-lg font-semibold text-green-400">
                {(() => {
                  const best = scenarios
                    .filter(s => selectedScenarios.includes(s.id))
                    .sort((a, b) => calculateTCO(a).tenYearTCO - calculateTCO(b).tenYearTCO)[0]
                  return best ? best.name : 'N/A'
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Insights */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">TCO Analysis Insights</p>
            <ul className="space-y-1 text-xs">
              <li>• LED systems typically have 40-60% lower operating costs than HPS</li>
              <li>• Consider utility rebates which can reduce initial LED investment by 20-50%</li>
              <li>• Factor in crop yield improvements (5-20%) with optimized spectrum</li>
              <li>• Include carbon credits and sustainability reporting benefits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}