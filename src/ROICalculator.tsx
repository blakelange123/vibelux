"use client"

import { useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  PiggyBank,
  BarChart3,
  Zap,
  Leaf,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export function ROICalculator() {
  const [currentSystem, setCurrentSystem] = useState<'hps' | 'fluorescent' | 'none'>('hps')
  const [currentFixtures, setCurrentFixtures] = useState(20)
  const [currentWattage, setCurrentWattage] = useState(1000)
  const [newFixtures, setNewFixtures] = useState(20)
  const [newWattage, setNewWattage] = useState(600)
  const [ledCostPerFixture, setLedCostPerFixture] = useState(899)
  const [electricityRate, setElectricityRate] = useState(0.12)
  const [hoursPerDay, setHoursPerDay] = useState(12)
  const [daysPerYear, setDaysPerYear] = useState(365)
  const [currentYield, setCurrentYield] = useState(1000) // grams per month
  const [yieldIncrease, setYieldIncrease] = useState(20) // percentage
  const [productPrice, setProductPrice] = useState(3) // $ per gram
  const [hvacReduction, setHvacReduction] = useState(30) // percentage
  const [rebateAmount, setRebateAmount] = useState(0)
  const [maintenanceSavings, setMaintenanceSavings] = useState(50) // $ per fixture per year
  const [financingRate, setFinancingRate] = useState(0) // APR percentage
  const [financingTerm, setFinancingTerm] = useState(0) // months

  // Current system calculations
  const currentTotalWattage = currentFixtures * currentWattage
  const currentDailyKwh = (currentTotalWattage * hoursPerDay) / 1000
  const currentYearlyKwh = currentDailyKwh * daysPerYear
  const currentYearlyCost = currentYearlyKwh * electricityRate
  
  // New LED system calculations
  const newTotalWattage = newFixtures * newWattage
  const newDailyKwh = (newTotalWattage * hoursPerDay) / 1000
  const newYearlyKwh = newDailyKwh * daysPerYear
  const newYearlyCost = newYearlyKwh * electricityRate
  
  // Energy savings
  const energySavingsKwh = currentYearlyKwh - newYearlyKwh
  const energySavingsDollars = currentYearlyCost - newYearlyCost
  const energySavingsPercent = (energySavingsDollars / currentYearlyCost) * 100
  
  // HVAC savings
  const hvacSavingsDollars = (currentYearlyCost * 0.3) * (hvacReduction / 100)
  
  // Yield improvements
  const currentYearlyYield = currentYield * 12
  const newYearlyYield = currentYearlyYield * (1 + yieldIncrease / 100)
  const additionalYield = newYearlyYield - currentYearlyYield
  const additionalRevenue = additionalYield * productPrice
  
  // Maintenance savings
  const yearlyMaintenanceSavings = newFixtures * maintenanceSavings
  
  // Total annual savings
  const totalAnnualSavings = energySavingsDollars + hvacSavingsDollars + additionalRevenue + yearlyMaintenanceSavings
  
  // Investment calculations
  const totalInvestment = (newFixtures * ledCostPerFixture) - rebateAmount
  
  // Financing calculations
  let monthlyPayment = 0
  let totalFinancingCost = 0
  if (financingRate > 0 && financingTerm > 0) {
    const monthlyRate = financingRate / 100 / 12
    monthlyPayment = totalInvestment * (monthlyRate * Math.pow(1 + monthlyRate, financingTerm)) / (Math.pow(1 + monthlyRate, financingTerm) - 1)
    totalFinancingCost = (monthlyPayment * financingTerm) - totalInvestment
  }
  
  // Simple payback period
  const paybackMonths = totalInvestment / (totalAnnualSavings / 12)
  const paybackYears = paybackMonths / 12
  
  // 5-year NPV calculation (assuming 8% discount rate)
  const discountRate = 0.08
  let npv = -totalInvestment
  for (let year = 1; year <= 5; year++) {
    npv += totalAnnualSavings / Math.pow(1 + discountRate, year)
  }
  
  // IRR approximation
  const irr = (totalAnnualSavings / totalInvestment) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
          LED Upgrade ROI Calculator
        </h1>
        <p className="text-gray-400">
          Calculate return on investment for LED lighting upgrades
        </p>
      </div>

      {/* Input Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current System */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Current System
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Type
              </label>
              <select
                value={currentSystem}
                onChange={(e) => setCurrentSystem(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
              >
                <option value="hps">HPS</option>
                <option value="fluorescent">Fluorescent</option>
                <option value="none">New Installation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Fixtures
              </label>
              <input
                type="number"
                value={currentFixtures}
                onChange={(e) => setCurrentFixtures(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Watts per Fixture
              </label>
              <input
                type="number"
                value={currentWattage}
                onChange={(e) => setCurrentWattage(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Yield (g/month)
              </label>
              <input
                type="number"
                value={currentYield}
                onChange={(e) => setCurrentYield(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* New LED System */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            New LED System
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LED Fixtures Needed
              </label>
              <input
                type="number"
                value={newFixtures}
                onChange={(e) => setNewFixtures(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Watts per LED Fixture
              </label>
              <input
                type="number"
                value={newWattage}
                onChange={(e) => setNewWattage(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cost per LED Fixture ($)
              </label>
              <input
                type="number"
                value={ledCostPerFixture}
                onChange={(e) => setLedCostPerFixture(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expected Yield Increase (%)
              </label>
              <input
                type="number"
                value={yieldIncrease}
                onChange={(e) => setYieldIncrease(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Financial Parameters */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            Financial Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
                step="0.01"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Price ($/g)
              </label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                step="0.01"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rebate Amount ($)
              </label>
              <input
                type="number"
                value={rebateAmount}
                onChange={(e) => setRebateAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Operating Hours/Day
              </label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-400">Total Investment</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalInvestment.toLocaleString()}</p>
          {rebateAmount > 0 && (
            <p className="text-xs text-green-400 mt-1">After ${rebateAmount} rebate</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">Payback Period</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {paybackYears < 1 ? `${Math.round(paybackMonths)} mo` : `${paybackYears.toFixed(1)} yr`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Simple payback</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400">Annual Savings</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalAnnualSavings.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">${(totalAnnualSavings / 12).toFixed(0)}/month</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-400">ROI</p>
          </div>
          <p className="text-3xl font-bold text-white">{irr.toFixed(0)}%</p>
          <p className="text-xs text-gray-400 mt-1">Annual return</p>
        </div>
      </div>

      {/* Detailed Savings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Savings */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Annual Savings Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Energy Savings</span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${energySavingsDollars.toFixed(0)}</p>
                <p className="text-xs text-gray-400">{energySavingsPercent.toFixed(0)}% reduction</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">HVAC Savings</span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${hvacSavingsDollars.toFixed(0)}</p>
                <p className="text-xs text-gray-400">{hvacReduction}% reduction</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Yield Revenue</span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${additionalRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-400">+{additionalYield.toFixed(0)}g/year</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Maintenance</span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${yearlyMaintenanceSavings.toFixed(0)}</p>
                <p className="text-xs text-gray-400">Reduced replacements</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
              <span className="text-green-400 font-medium">Total Annual Savings</span>
              <span className="text-white font-bold text-xl">${totalAnnualSavings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 5-Year Financial Summary */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">5-Year Financial Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Total Investment</span>
              <span className="text-red-400 font-medium">-${totalInvestment.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">5-Year Savings</span>
              <span className="text-green-400 font-medium">${(totalAnnualSavings * 5).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Net Present Value</span>
              <span className="text-white font-medium">${npv.toFixed(0)}</span>
            </div>
            
            {financingTerm > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Financing Cost</span>
                <span className="text-yellow-400 font-medium">${totalFinancingCost.toFixed(0)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <span className="text-purple-400 font-medium">5-Year Net Profit</span>
              <span className="text-white font-bold text-xl">
                ${((totalAnnualSavings * 5) - totalInvestment - totalFinancingCost).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cumulative Cash Flow</h3>
        
        <div className="h-64 flex items-end gap-4">
          {[0, 1, 2, 3, 4, 5].map((year) => {
            const cashFlow = year === 0 ? -totalInvestment : (totalAnnualSavings * year) - totalInvestment
            const height = Math.abs(cashFlow) / Math.max(totalInvestment, totalAnnualSavings * 5) * 100
            const isPositive = cashFlow >= 0
            
            return (
              <div key={year} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-2">
                    ${(cashFlow / 1000).toFixed(0)}k
                  </span>
                  <div 
                    className={`w-full rounded-t transition-all ${
                      isPositive 
                        ? 'bg-gradient-to-t from-green-600 to-green-400' 
                        : 'bg-gradient-to-b from-red-600 to-red-400'
                    }`}
                    style={{ 
                      height: `${height}%`,
                      minHeight: '4px'
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">Year {year}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Investment Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paybackYears <= 2 ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">Excellent ROI</p>
                <p className="text-sm text-gray-300 mt-1">
                  Payback in {paybackYears < 1 ? `${Math.round(paybackMonths)} months` : `${paybackYears.toFixed(1)} years`} - strongly recommended.
                </p>
              </div>
            </div>
          ) : paybackYears <= 3 ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Good ROI</p>
                <p className="text-sm text-gray-300 mt-1">
                  {paybackYears.toFixed(1)} year payback is reasonable for LED upgrades.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Long Payback</p>
                <p className="text-sm text-gray-300 mt-1">
                  Consider energy incentives or higher electricity rates to improve ROI.
                </p>
              </div>
            </div>
          )}
          
          {energySavingsPercent >= 40 && (
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Significant Energy Reduction</p>
                <p className="text-sm text-gray-300 mt-1">
                  {energySavingsPercent.toFixed(0)}% energy savings will reduce operating costs substantially.
                </p>
              </div>
            </div>
          )}
          
          {npv > totalInvestment && (
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">Positive NPV</p>
                <p className="text-sm text-gray-300 mt-1">
                  Project will generate ${npv.toFixed(0)} in present value over 5 years.
                </p>
              </div>
            </div>
          )}
          
          {additionalRevenue > energySavingsDollars && (
            <div className="flex items-start gap-3">
              <Leaf className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">Yield Improvement Drives ROI</p>
                <p className="text-sm text-gray-300 mt-1">
                  Additional revenue from {yieldIncrease}% yield increase is your biggest benefit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}