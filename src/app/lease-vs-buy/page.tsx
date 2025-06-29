'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Building2, 
  Percent, 
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Download,
  Scale,
  Clock,
  Target,
  Zap,
  Wrench,
  Shield
} from 'lucide-react'

interface EquipmentItem {
  id: string
  category: 'lighting' | 'environmental' | 'automation' | 'monitoring' | 'infrastructure'
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  depreciation: number // years
  maintenance: number // annual %
  warranty: number // years
}

interface LeaseTerms {
  duration: number // months
  rate: number // %
  residualValue: number // %
  includeMaintenance: boolean
  includeUpgrades: boolean
  earlyTerminationFee: number // %
}

interface FinancialMetrics {
  purchasePrice: number
  downPayment: number
  loanRate: number
  loanTerm: number
  annualInflation: number
  taxRate: number
  depreciationMethod: 'straight-line' | 'macrs'
  salesTax: number
}

interface CashFlowAnalysis {
  year: number
  leasePayments: number
  loanPayments: number
  maintenance: number
  depreciation: number
  taxSavings: number
  netCashFlow: number
  cumulativeCashFlow: number
}

export default function LeaseVsBuyPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [leaseTerms, setLeaseTerms] = useState<LeaseTerms>({
    duration: 60,
    rate: 8.5,
    residualValue: 20,
    includeMaintenance: true,
    includeUpgrades: false,
    earlyTerminationFee: 25
  })
  const [financialTerms, setFinancialTerms] = useState<FinancialMetrics>({
    purchasePrice: 0,
    downPayment: 20,
    loanRate: 6.5,
    loanTerm: 60,
    annualInflation: 3,
    taxRate: 25,
    depreciationMethod: 'macrs',
    salesTax: 8.5
  })
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [selectedScenario, setSelectedScenario] = useState<'lease' | 'buy'>('lease')

  useEffect(() => {
    loadSampleEquipment()
  }, [])

  useEffect(() => {
    if (equipment.length > 0) {
      calculateAnalysis()
    }
  }, [equipment, leaseTerms, financialTerms])

  const loadSampleEquipment = () => {
    const sampleEquipment: EquipmentItem[] = [
      {
        id: 'light_001',
        category: 'lighting',
        name: 'LED Grow Light System - 640W Full Spectrum',
        quantity: 24,
        unitPrice: 1200,
        totalPrice: 28800,
        depreciation: 7,
        maintenance: 5,
        warranty: 5
      },
      {
        id: 'env_001',
        category: 'environmental',
        name: 'Climate Control System - 5 Ton',
        quantity: 2,
        unitPrice: 15000,
        totalPrice: 30000,
        depreciation: 10,
        maintenance: 8,
        warranty: 3
      },
      {
        id: 'auto_001',
        category: 'automation',
        name: 'Fertigation System - Automated',
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
        depreciation: 10,
        maintenance: 6,
        warranty: 2
      },
      {
        id: 'mon_001',
        category: 'monitoring',
        name: 'Environmental Monitoring Package',
        quantity: 1,
        unitPrice: 8500,
        totalPrice: 8500,
        depreciation: 5,
        warranty: 2,
        maintenance: 4
      },
      {
        id: 'inf_001',
        category: 'infrastructure',
        name: 'Electrical Panel and Installation',
        quantity: 1,
        unitPrice: 12000,
        totalPrice: 12000,
        depreciation: 15,
        maintenance: 2,
        warranty: 1
      }
    ]
    setEquipment(sampleEquipment)
  }

  const calculateAnalysis = () => {
    const totalEquipmentCost = equipment.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalWithTax = totalEquipmentCost * (1 + financialTerms.salesTax / 100)
    
    // Update purchase price
    setFinancialTerms(prev => ({ ...prev, purchasePrice: totalWithTax }))

    // Calculate lease vs buy analysis
    const analysis = performLeaseVsBuyAnalysis(totalWithTax)
    setAnalysisResults(analysis)
  }

  const performLeaseVsBuyAnalysis = (totalCost: number) => {
    const leaseDurationYears = leaseTerms.duration / 12
    const monthlyLeasePayment = calculateLeasePayment(totalCost)
    const totalLeasePayments = monthlyLeasePayment * leaseTerms.duration
    
    // Buy option calculations
    const downPaymentAmount = totalCost * (financialTerms.downPayment / 100)
    const loanAmount = totalCost - downPaymentAmount
    const monthlyLoanPayment = calculateLoanPayment(loanAmount)
    const totalLoanPayments = monthlyLoanPayment * financialTerms.loanTerm
    const totalBuyCost = downPaymentAmount + totalLoanPayments

    // Calculate annual maintenance costs
    const annualMaintenanceCost = equipment.reduce((sum, item) => {
      return sum + (item.totalPrice * item.maintenance / 100)
    }, 0)

    // Tax benefits
    const annualDepreciation = calculateAnnualDepreciation(totalCost)
    const annualTaxSavings = (annualDepreciation + annualMaintenanceCost) * (financialTerms.taxRate / 100)

    // Net present value calculations
    const discountRate = 0.08 // 8% discount rate
    const leaseNPV = calculateNPV(Array(leaseTerms.duration).fill(monthlyLeasePayment), discountRate / 12)
    const buyNPV = calculateBuyNPV(totalCost, monthlyLoanPayment, annualTaxSavings, leaseDurationYears, discountRate)

    // Cash flow analysis
    const cashFlowAnalysis = generateCashFlowAnalysis(
      leaseDurationYears,
      monthlyLeasePayment * 12,
      monthlyLoanPayment * 12,
      annualMaintenanceCost,
      annualDepreciation,
      annualTaxSavings
    )

    // Recommendation logic
    const recommendation = determineRecommendation(leaseNPV, buyNPV, cashFlowAnalysis, leaseDurationYears)

    return {
      lease: {
        monthlyPayment: monthlyLeasePayment,
        totalPayments: totalLeasePayments,
        includedMaintenance: leaseTerms.includeMaintenance,
        residualValue: totalCost * (leaseTerms.residualValue / 100),
        npv: leaseNPV
      },
      buy: {
        downPayment: downPaymentAmount,
        monthlyPayment: monthlyLoanPayment,
        totalCost: totalBuyCost,
        annualMaintenance: annualMaintenanceCost,
        annualTaxSavings,
        residualValue: calculateResidualValue(totalCost, leaseDurationYears),
        npv: buyNPV
      },
      comparison: {
        leaseSavings: buyNPV - leaseNPV,
        paybackPeriod: calculatePaybackPeriod(cashFlowAnalysis),
        breakEvenPoint: calculateBreakEvenPoint(monthlyLeasePayment, monthlyLoanPayment),
        roi: calculateROI(totalCost, annualTaxSavings, leaseDurationYears)
      },
      cashFlow: cashFlowAnalysis,
      recommendation
    }
  }

  const calculateLeasePayment = (equipmentCost: number) => {
    const monthlyRate = leaseTerms.rate / 100 / 12
    const residualAmount = equipmentCost * (leaseTerms.residualValue / 100)
    const depreciationAmount = equipmentCost - residualAmount
    
    // Standard lease payment calculation
    const depreciationPayment = depreciationAmount / leaseTerms.duration
    const financePayment = (equipmentCost + residualAmount) * monthlyRate
    
    return depreciationPayment + financePayment
  }

  const calculateLoanPayment = (loanAmount: number) => {
    const monthlyRate = financialTerms.loanRate / 100 / 12
    const numberOfPayments = financialTerms.loanTerm
    
    if (monthlyRate === 0) return loanAmount / numberOfPayments
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  }

  const calculateAnnualDepreciation = (cost: number) => {
    if (financialTerms.depreciationMethod === 'straight-line') {
      return cost / 7 // 7-year depreciation for equipment
    } else {
      // MACRS 7-year schedule
      const macrsRates = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893]
      return cost * macrsRates[0] // First year
    }
  }

  const calculateNPV = (cashFlows: number[], discountRate: number) => {
    return cashFlows.reduce((npv, cashFlow, index) => {
      return npv + cashFlow / Math.pow(1 + discountRate, index + 1)
    }, 0)
  }

  const calculateBuyNPV = (
    initialCost: number, 
    monthlyPayment: number, 
    annualTaxSavings: number, 
    years: number, 
    discountRate: number
  ) => {
    let npv = -financialTerms.downPayment / 100 * initialCost // Initial down payment
    
    for (let year = 1; year <= years; year++) {
      const annualLoanPayments = monthlyPayment * 12
      const netCashFlow = -annualLoanPayments + annualTaxSavings
      npv += netCashFlow / Math.pow(1 + discountRate, year)
    }
    
    // Add residual value
    const residualValue = calculateResidualValue(initialCost, years)
    npv += residualValue / Math.pow(1 + discountRate, years)
    
    return npv
  }

  const calculateResidualValue = (initialCost: number, years: number) => {
    // Using straight-line depreciation for residual value estimation
    const annualDepreciationRate = 1 / 7 // 7-year useful life
    const depreciatedValue = initialCost * (1 - annualDepreciationRate * years)
    return Math.max(depreciatedValue, initialCost * 0.1) // Minimum 10% residual
  }

  const generateCashFlowAnalysis = (
    years: number,
    annualLeasePayment: number,
    annualLoanPayment: number,
    annualMaintenance: number,
    annualDepreciation: number,
    annualTaxSavings: number
  ): CashFlowAnalysis[] => {
    const cashFlow: CashFlowAnalysis[] = []
    let leaseCumulative = 0
    let buyCumulative = -financialTerms.purchasePrice * (financialTerms.downPayment / 100)
    
    for (let year = 1; year <= Math.ceil(years); year++) {
      const leasePayments = annualLeasePayment
      const loanPayments = annualLoanPayment
      const maintenance = leaseTerms.includeMaintenance ? 0 : annualMaintenance
      const taxSavings = annualTaxSavings
      
      const leaseNetCashFlow = -leasePayments - maintenance
      const buyNetCashFlow = -loanPayments - annualMaintenance + taxSavings
      
      leaseCumulative += leaseNetCashFlow
      buyCumulative += buyNetCashFlow
      
      cashFlow.push({
        year,
        leasePayments,
        loanPayments,
        maintenance,
        depreciation: annualDepreciation,
        taxSavings,
        netCashFlow: buyNetCashFlow - leaseNetCashFlow,
        cumulativeCashFlow: buyCumulative - leaseCumulative
      })
    }
    
    return cashFlow
  }

  const calculatePaybackPeriod = (cashFlow: CashFlowAnalysis[]) => {
    for (let i = 0; i < cashFlow.length; i++) {
      if (cashFlow[i].cumulativeCashFlow > 0) {
        return i + 1
      }
    }
    return cashFlow.length
  }

  const calculateBreakEvenPoint = (monthlyLease: number, monthlyLoan: number) => {
    // Simplified break-even calculation
    return Math.abs(monthlyLease - monthlyLoan) / monthlyLease * 100
  }

  const calculateROI = (initialCost: number, annualSavings: number, years: number) => {
    const totalSavings = annualSavings * years
    return (totalSavings / initialCost) * 100
  }

  const determineRecommendation = (
    leaseNPV: number, 
    buyNPV: number, 
    cashFlow: CashFlowAnalysis[], 
    years: number
  ) => {
    const npvDifference = buyNPV - leaseNPV
    const paybackPeriod = calculatePaybackPeriod(cashFlow)
    
    let recommendation: 'lease' | 'buy' | 'neutral' = 'neutral'
    const reasons: string[] = []
    let confidence = 'medium'
    
    if (npvDifference > financialTerms.purchasePrice * 0.1) {
      recommendation = 'buy'
      reasons.push('Significant NPV advantage for purchasing')
      confidence = 'high'
    } else if (npvDifference < -financialTerms.purchasePrice * 0.05) {
      recommendation = 'lease'
      reasons.push('Leasing provides better cash flow management')
      confidence = 'high'
    }
    
    if (paybackPeriod <= years / 2) {
      reasons.push('Quick payback period favors purchasing')
      if (recommendation === 'neutral') recommendation = 'buy'
    }
    
    if (leaseTerms.includeMaintenance && !leaseTerms.includeUpgrades) {
      reasons.push('Lease includes maintenance but no technology upgrades')
    }
    
    if (years <= 3) {
      reasons.push('Short-term use case may favor leasing')
      if (recommendation === 'neutral') recommendation = 'lease'
    }
    
    return {
      choice: recommendation,
      confidence: confidence as 'low' | 'medium' | 'high',
      reasons,
      npvAdvantage: Math.abs(npvDifference),
      paybackPeriod
    }
  }

  const addEquipmentItem = () => {
    const newItem: EquipmentItem = {
      id: `eq_${Date.now()}`,
      category: 'lighting',
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      depreciation: 7,
      maintenance: 5,
      warranty: 1
    }
    setEquipment([...equipment, newItem])
  }

  const updateEquipmentItem = (id: string, updates: Partial<EquipmentItem>) => {
    setEquipment(equipment.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates }
        updated.totalPrice = updated.quantity * updated.unitPrice
        return updated
      }
      return item
    }))
  }

  const removeEquipmentItem = (id: string) => {
    setEquipment(equipment.filter(item => item.id !== id))
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      lighting: Zap,
      environmental: Building2,
      automation: Wrench,
      monitoring: BarChart3,
      infrastructure: Shield
    }
    const Icon = icons[category as keyof typeof icons] || Building2
    return <Icon className="w-4 h-4" />
  }

  const exportAnalysis = () => {
    if (!analysisResults) return
    
    const exportData = {
      equipment,
      leaseTerms,
      financialTerms,
      analysis: analysisResults,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lease-vs-buy-analysis-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-green-600" />
              Lease vs Buy Calculator
            </h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis for equipment acquisition decisions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportAnalysis} disabled={!analysisResults}>
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Equipment List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Equipment Portfolio
                </CardTitle>
                <CardDescription>Define the equipment to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <span className="font-medium text-sm">Item {index + 1}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEquipmentItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid gap-2">
                        <Input
                          placeholder="Equipment name"
                          value={item.name}
                          onChange={(e) => updateEquipmentItem(item.id, { name: e.target.value })}
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateEquipmentItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                          />
                          <Input
                            type="number"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => updateEquipmentItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="text-sm font-medium text-green-600">
                          Total: ${item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addEquipmentItem} variant="outline" className="w-full">
                    Add Equipment
                  </Button>
                  
                  <div className="pt-3 border-t">
                    <div className="text-lg font-bold">
                      Total Equipment: ${equipment.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tabs defaultValue="lease" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="lease">Lease Terms</TabsTrigger>
                      <TabsTrigger value="buy">Buy Terms</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="lease" className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Lease Duration (months)</label>
                        <Input
                          type="number"
                          value={leaseTerms.duration}
                          onChange={(e) => setLeaseTerms({...leaseTerms, duration: parseInt(e.target.value) || 60})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={leaseTerms.rate}
                          onChange={(e) => setLeaseTerms({...leaseTerms, rate: parseFloat(e.target.value) || 8.5})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Residual Value (%)</label>
                        <Input
                          type="number"
                          value={leaseTerms.residualValue}
                          onChange={(e) => setLeaseTerms({...leaseTerms, residualValue: parseFloat(e.target.value) || 20})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={leaseTerms.includeMaintenance}
                            onChange={(e) => setLeaseTerms({...leaseTerms, includeMaintenance: e.target.checked})}
                          />
                          <span className="text-sm">Include Maintenance</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={leaseTerms.includeUpgrades}
                            onChange={(e) => setLeaseTerms({...leaseTerms, includeUpgrades: e.target.checked})}
                          />
                          <span className="text-sm">Include Upgrades</span>
                        </label>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="buy" className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Down Payment (%)</label>
                        <Input
                          type="number"
                          value={financialTerms.downPayment}
                          onChange={(e) => setFinancialTerms({...financialTerms, downPayment: parseFloat(e.target.value) || 20})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Loan Rate (%)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={financialTerms.loanRate}
                          onChange={(e) => setFinancialTerms({...financialTerms, loanRate: parseFloat(e.target.value) || 6.5})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Loan Term (months)</label>
                        <Input
                          type="number"
                          value={financialTerms.loanTerm}
                          onChange={(e) => setFinancialTerms({...financialTerms, loanTerm: parseInt(e.target.value) || 60})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                        <Input
                          type="number"
                          value={financialTerms.taxRate}
                          onChange={(e) => setFinancialTerms({...financialTerms, taxRate: parseFloat(e.target.value) || 25})}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {analysisResults ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className={`border-2 ${selectedScenario === 'lease' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Lease Option
                        {analysisResults.recommendation?.choice === 'lease' && (
                          <Badge className="bg-green-500">Recommended</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Monthly Payment:</span>
                          <span className="font-bold">${analysisResults.lease.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Payments:</span>
                          <span className="font-bold">${analysisResults.lease.totalPayments.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance Included:</span>
                          <span className={analysisResults.lease.includedMaintenance ? 'text-green-600' : 'text-red-600'}>
                            {analysisResults.lease.includedMaintenance ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Residual Value:</span>
                          <span className="font-bold">${analysisResults.lease.residualValue.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span>Net Present Value:</span>
                            <span className="font-bold text-lg">
                              ${Math.abs(analysisResults.lease.npv).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 ${selectedScenario === 'buy' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Buy Option
                        {analysisResults.recommendation?.choice === 'buy' && (
                          <Badge className="bg-green-500">Recommended</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Down Payment:</span>
                          <span className="font-bold">${analysisResults.buy.downPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Payment:</span>
                          <span className="font-bold">${analysisResults.buy.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-bold">${analysisResults.buy.totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Tax Savings:</span>
                          <span className="font-bold text-green-600">${analysisResults.buy.annualTaxSavings.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span>Net Present Value:</span>
                            <span className="font-bold text-lg">
                              ${Math.abs(analysisResults.buy.npv).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {analysisResults.recommendation?.choice === 'lease' ? (
                          <Badge className="bg-blue-500 text-white px-4 py-2">Lease Recommended</Badge>
                        ) : analysisResults.recommendation?.choice === 'buy' ? (
                          <Badge className="bg-green-500 text-white px-4 py-2">Buy Recommended</Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white px-4 py-2">Neutral</Badge>
                        )}
                        <span className={`text-sm ${
                          analysisResults.recommendation?.confidence === 'high' ? 'text-green-600' :
                          analysisResults.recommendation?.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analysisResults.recommendation?.confidence} confidence
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Key Factors:</h4>
                        <ul className="space-y-1">
                          {analysisResults.recommendation?.reasons.map((reason: string, index: number) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">NPV Advantage:</span>
                          <div className="font-bold">${analysisResults.recommendation?.npvAdvantage.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payback Period:</span>
                          <div className="font-bold">{analysisResults.recommendation?.paybackPeriod} years</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Flow Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Cash Flow Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium border-b pb-2">
                        <div>Year</div>
                        <div>Annual Difference</div>
                        <div>Cumulative</div>
                        <div>Status</div>
                      </div>
                      
                      {analysisResults.cashFlow.map((year: CashFlowAnalysis) => (
                        <div key={year.year} className="grid grid-cols-4 gap-4 text-sm">
                          <div>{year.year}</div>
                          <div className={year.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${Math.abs(year.netCashFlow).toLocaleString()}
                          </div>
                          <div className={year.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${Math.abs(year.cumulativeCashFlow).toLocaleString()}
                          </div>
                          <div>
                            {year.cumulativeCashFlow >= 0 ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">Add Equipment to Begin Analysis</h3>
                    <p>Configure your equipment list and financial terms to see the comparison</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}