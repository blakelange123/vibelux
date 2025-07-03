"use client"
import { useState } from 'react'
import {
  Calculator,
  DollarSign,
  Calendar,
  TrendingUp,
  CreditCard,
  FileText,
  PiggyBank,
  BarChart3,
  Info,
  Download,
  Building2,
  CheckCircle,
  FileDown
} from 'lucide-react'
import { exportToCSV, exportToPDF, generateLeasingReportHTML } from '@/lib/exportUtils'

interface LeaseOption {
  term: number // months
  rate: number // annual percentage
  downPayment: number // percentage
  residualValue: number // percentage
  monthlyPayment: number
  totalCost: number
  taxBenefit: number
}

interface Equipment {
  name: string
  cost: number
  category: string
  lifespan: number // years
}

export function EquipmentLeasingCalculator() {
  const [equipment, setEquipment] = useState<Equipment>({
    name: 'LED Grow Light System',
    cost: 250000,
    category: 'Lighting',
    lifespan: 10
  })
  
  const [leaseParams, setLeaseParams] = useState({
    creditScore: 'excellent',
    companyAge: 5,
    annualRevenue: 1000000,
    taxRate: 25
  })

  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const equipmentOptions: Equipment[] = [
    { name: 'LED Grow Light System', cost: 250000, category: 'Lighting', lifespan: 10 },
    { name: 'Climate Control System', cost: 150000, category: 'HVAC', lifespan: 15 },
    { name: 'Automated Irrigation', cost: 100000, category: 'Irrigation', lifespan: 12 },
    { name: 'Sensor Network', cost: 50000, category: 'Monitoring', lifespan: 8 },
    { name: 'Complete Grow Room', cost: 500000, category: 'Full Setup', lifespan: 20 }
  ]

  const calculateLeaseOptions = (): LeaseOption[] => {
    const baseRate = leaseParams.creditScore === 'excellent' ? 4.5 : 
                    leaseParams.creditScore === 'good' ? 6.5 : 8.5
    
    const terms = [24, 36, 48, 60]
    
    return terms.map(term => {
      const rate = baseRate + (term > 36 ? 0.5 : 0)
      const monthlyRate = rate / 100 / 12
      const downPaymentAmount = equipment.cost * 0.1
      const financedAmount = equipment.cost - downPaymentAmount
      
      // Calculate monthly payment using loan formula
      const monthlyPayment = financedAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
        (Math.pow(1 + monthlyRate, term) - 1)
      
      const totalPayments = monthlyPayment * term + downPaymentAmount
      const residualValue = equipment.cost * 0.1
      const totalCost = totalPayments
      
      // Tax benefits from depreciation
      const annualDepreciation = equipment.cost / equipment.lifespan
      const taxBenefit = (annualDepreciation * (term / 12)) * (leaseParams.taxRate / 100)
      
      return {
        term,
        rate,
        downPayment: 10,
        residualValue: 10,
        monthlyPayment,
        totalCost,
        taxBenefit
      }
    })
  }

  const leaseOptions = calculateLeaseOptions()

  const buyVsLeaseComparison = () => {
    const selected = selectedOption !== null ? leaseOptions[selectedOption] : leaseOptions[1]
    const cashPrice = equipment.cost
    const leaseCostAfterTax = selected.totalCost - selected.taxBenefit
    const savings = cashPrice - leaseCostAfterTax
    
    return {
      cashPrice,
      leaseTotal: selected.totalCost,
      taxSavings: selected.taxBenefit,
      netLeaseCost: leaseCostAfterTax,
      cashFlowBenefit: cashPrice - (selected.downPayment * equipment.cost / 100),
      savings
    }
  }

  const comparison = buyVsLeaseComparison()

  const handleExportPDF = () => {
    const reportHTML = generateLeasingReportHTML({
      equipment,
      leaseOptions,
      selectedOption,
      comparison
    })
    exportToPDF(reportHTML, `Leasing_Analysis_${equipment.name.replace(/\s+/g, '_')}.pdf`)
  }

  const handleExportCSV = () => {
    const csvData = leaseOptions.map(option => ({
      'Term (months)': option.term,
      'APR (%)': option.rate,
      'Monthly Payment': option.monthlyPayment.toFixed(0),
      'Total Cost': option.totalCost.toFixed(0),
      'Tax Benefit': option.taxBenefit.toFixed(0),
      'Net Cost': (option.totalCost - option.taxBenefit).toFixed(0)
    }))
    exportToCSV(csvData, `Lease_Options_${equipment.name.replace(/\s+/g, '_')}.csv`)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Equipment Leasing Calculator</h1>
        <p className="text-gray-400">Compare leasing options and calculate your best financing strategy</p>
      </div>

      {/* Equipment Selection */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Select Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Equipment Type</label>
            <select
              value={equipment.name}
              onChange={(e) => {
                const selected = equipmentOptions.find(eq => eq.name === e.target.value)
                if (selected) setEquipment(selected)
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              {equipmentOptions.map(eq => (
                <option key={eq.name} value={eq.name}>{eq.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Equipment Cost</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={equipment.cost}
                onChange={(e) => setEquipment({ ...equipment, cost: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Credit Score</label>
            <select
              value={leaseParams.creditScore}
              onChange={(e) => setLeaseParams({ ...leaseParams, creditScore: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="excellent">Excellent (750+)</option>
              <option value="good">Good (650-749)</option>
              <option value="fair">Fair (550-649)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Annual Revenue</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={leaseParams.annualRevenue}
                onChange={(e) => setLeaseParams({ ...leaseParams, annualRevenue: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={leaseParams.taxRate}
              onChange={(e) => setLeaseParams({ ...leaseParams, taxRate: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Lease Options */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Lease Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaseOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOption === index
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-100">{option.term} Months</h3>
                <p className="text-sm text-gray-400 mb-3">{option.rate}% APR</p>
                
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Monthly:</span>
                    <span className="text-gray-100 font-medium">
                      ${option.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-gray-100">
                      ${option.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tax Benefit:</span>
                    <span className="text-green-400">
                      -${option.taxBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Buy vs Lease Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Buy vs Lease Analysis
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Cash Purchase Price</span>
              <span className="text-gray-100 font-medium">
                ${comparison.cashPrice.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total Lease Payments</span>
              <span className="text-gray-100">
                ${comparison.leaseTotal.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Tax Savings</span>
              <span className="text-green-400">
                -${comparison.taxSavings.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700 font-semibold">
              <span className="text-gray-100">Net Lease Cost</span>
              <span className="text-gray-100">
                ${comparison.netLeaseCost.toLocaleString()}
              </span>
            </div>
            
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-300 mb-2">Cash Flow Preserved</p>
              <p className="text-2xl font-bold text-purple-400">
                ${comparison.cashFlowBenefit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Capital available for other investments
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Leasing Benefits
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <PiggyBank className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-100">Preserve Working Capital</p>
                <p className="text-sm text-gray-400">Keep cash available for core operations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-100">Flexible Payment Terms</p>
                <p className="text-sm text-gray-400">Match payments to revenue cycles</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-100">Tax Advantages</p>
                <p className="text-sm text-gray-400">Deduct lease payments as operating expenses</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-100">Technology Upgrades</p>
                <p className="text-sm text-gray-400">Easier to upgrade to newer equipment</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              Get Lease Quote
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={handleExportPDF}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF Report
              </button>
              
              <button 
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                CSV Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}