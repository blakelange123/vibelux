"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Zap,
  Building,
  Calendar,
  BarChart3,
  Download,
  Lightbulb,
  Users,
  Package,
  FileText,
  ChevronRight,
  Info,
  Settings,
  PieChart
} from 'lucide-react'
import { calculateLaborCosts, laborBenchmarks } from '@/lib/labor-calculations'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { EnhancedReportGenerator } from '@/components/reports/EnhancedReportGenerator'

interface CostCategory {
  id: string
  name: string
  icon: React.FC<any>
  color: string
}

interface CostItem {
  category: string
  item: string
  quantity: number
  unitCost: number
  totalCost: number
  lifespan: number
  annualMaintenance: number
  notes?: string
}

interface FacilityData {
  name: string
  size: number // sq ft
  rooms: number
  tiers: number
  canopyArea: number
  targetPPFD: number
  photoperiod: number
  daysPerYear: number
  cropCycles: number
  yieldPerSqFt: number
  pricePerPound: number
  utilityRate: number
  cropType: string
  automationLevel: 'low' | 'medium' | 'high'
}

const costCategories: CostCategory[] = [
  { id: 'lighting', name: 'Lighting Equipment', icon: Lightbulb, color: '#8b5cf6' },
  { id: 'infrastructure', name: 'Infrastructure', icon: Building, color: '#3b82f6' },
  { id: 'hvac', name: 'HVAC & Environment', icon: Zap, color: '#10b981' },
  { id: 'automation', name: 'Automation & Controls', icon: Settings, color: '#f59e0b' },
  { id: 'labor', name: 'Labor & Operations', icon: Users, color: '#ef4444' }
]

export function EnhancedTCOCalculator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'setup' | 'capex' | 'opex' | 'analysis' | 'benchmarks' | 'report'>('setup')
  const [showEnhancedReports, setShowEnhancedReports] = useState(false)

  // Mount check for hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync tab with URL parameters
  useEffect(() => {
    if (!mounted) return
    const tab = searchParams.get('tab') as typeof activeTab
    if (tab && ['setup', 'capex', 'opex', 'analysis', 'benchmarks', 'report'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams, mounted])

  // Update URL when tab changes
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }
  const [facility, setFacility] = useState<FacilityData>({
    name: 'Vertical Farm Facility',
    size: 50000,
    rooms: 10,
    tiers: 5,
    canopyArea: 40000,
    targetPPFD: 300,
    photoperiod: 16,
    daysPerYear: 365,
    cropCycles: 12,
    yieldPerSqFt: 0.5,
    pricePerPound: 2000,
    utilityRate: 0.12,
    cropType: 'Leafy Greens',
    automationLevel: 'medium'
  })

  const [capexItems, setCapexItems] = useState<CostItem[]>([
    {
      category: 'lighting',
      item: 'LED Grow Lights (660W)',
      quantity: 500,
      unitCost: 1200,
      totalCost: 600000,
      lifespan: 10,
      annualMaintenance: 2
    },
    {
      category: 'infrastructure',
      item: 'Grow Racks & Tables',
      quantity: 200,
      unitCost: 2500,
      totalCost: 500000,
      lifespan: 15,
      annualMaintenance: 1
    },
    {
      category: 'hvac',
      item: 'HVAC System',
      quantity: 1,
      unitCost: 350000,
      totalCost: 350000,
      lifespan: 15,
      annualMaintenance: 5
    },
    {
      category: 'automation',
      item: 'Environmental Controls',
      quantity: 1,
      unitCost: 75000,
      totalCost: 75000,
      lifespan: 10,
      annualMaintenance: 3
    }
  ])

  const [opexItems, setOpexItems] = useState<{
    electricity: number
    water: number
    nutrients: number
    labor: number
    rent: number
    insurance: number
    packaging: number
    substrate: number
    seeds: number
    utilities: number
    maintenance: number
    other: number
  }>({
    electricity: 720000, // Annual
    water: 48000,
    nutrients: 120000,
    labor: 480000,
    rent: 600000,
    insurance: 36000,
    packaging: 85000, // Annual packaging costs
    substrate: 45000, // Annual growing media costs
    seeds: 25000, // Annual seed costs
    utilities: 32000, // Gas, waste management, etc.
    maintenance: 78000, // Equipment maintenance
    other: 60000
  })

  // Auto-calculate labor costs when crop type or automation level changes
  useEffect(() => {
    const laborCalc = calculateLaborCosts({
      cropType: facility.cropType,
      canopyArea: facility.canopyArea,
      automationLevel: facility.automationLevel
    });
    
    setOpexItems(prev => ({
      ...prev,
      labor: laborCalc.annualLaborCost
    }));
  }, [facility.cropType, facility.canopyArea, facility.automationLevel]);

  const calculateTotalCapex = () => {
    return capexItems.reduce((sum, item) => sum + item.totalCost, 0)
  }

  const calculateTotalOpex = () => {
    return Object.values(opexItems).reduce((sum, cost) => sum + cost, 0)
  }

  const calculateAnnualRevenue = () => {
    const annualYield = facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles
    return annualYield * facility.pricePerPound
  }

  const calculateROI = () => {
    const annualRevenue = calculateAnnualRevenue()
    const annualOpex = calculateTotalOpex()
    const totalCapex = calculateTotalCapex()
    const annualProfit = annualRevenue - annualOpex
    return ((annualProfit / totalCapex) * 100).toFixed(1)
  }

  const calculatePayback = () => {
    const annualRevenue = calculateAnnualRevenue()
    const annualOpex = calculateTotalOpex()
    const totalCapex = calculateTotalCapex()
    const annualProfit = annualRevenue - annualOpex
    return (totalCapex / annualProfit).toFixed(1)
  }

  const generateCashFlow = () => {
    const years = 10
    const data = []
    const totalCapex = calculateTotalCapex()
    const annualRevenue = calculateAnnualRevenue()
    const annualOpex = calculateTotalOpex()
    
    for (let year = 0; year <= years; year++) {
      const revenue = year === 0 ? 0 : annualRevenue * (1 + 0.05) ** (year - 1) // 5% growth
      const opex = year === 0 ? 0 : annualOpex * (1 + 0.03) ** (year - 1) // 3% inflation
      const capex = year === 0 ? -totalCapex : 0
      const cashFlow = revenue - opex + capex
      const cumulativeCashFlow: number = data.length > 0 
        ? data[data.length - 1].cumulative + cashFlow
        : cashFlow
      
      data.push({
        year: `Year ${year}`,
        revenue,
        opex: -opex,
        capex,
        cashFlow,
        cumulative: cumulativeCashFlow
      })
    }
    
    return data
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading TCO Calculator...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Total Cost of Ownership Calculator
        </h1>
        <p className="text-gray-400">
          Comprehensive business case analysis for vertical farming operations
        </p>
      </div>

      {/* Debug indicator and quick access */}
      <div className="mb-4 p-2 bg-gray-800 rounded text-sm text-gray-400 flex justify-between items-center">
        <span>Current tab: <span className="text-purple-400">{activeTab}</span> | URL tab: <span className="text-blue-400">{searchParams.get('tab')}</span></span>
        <button 
          onClick={() => handleTabChange('opex')}
          className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
        >
          Test: Go to Operational Expenses
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-700">
        {[
          { id: 'setup', label: 'Facility Setup', icon: Building },
          { id: 'capex', label: 'Capital Expenses', icon: Package },
          { id: 'opex', label: 'Operating Expenses', icon: DollarSign },
          { id: 'analysis', label: 'Financial Analysis', icon: BarChart3 },
          { id: 'benchmarks', label: 'Industry Benchmarks', icon: TrendingUp },
          { id: 'report', label: 'Executive Report', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white bg-purple-600 rounded-t-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700 rounded-t-lg'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Sections */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Facility Configuration
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Facility Name</label>
                <input
                  type="text"
                  value={facility.name}
                  onChange={(e) => setFacility({...facility, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Total Size (sq ft)</label>
                <input
                  type="number"
                  value={facility.size}
                  onChange={(e) => setFacility({...facility, size: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Grow Rooms</label>
                <input
                  type="number"
                  value={facility.rooms}
                  onChange={(e) => setFacility({...facility, rooms: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Vertical Tiers</label>
                <input
                  type="number"
                  value={facility.tiers}
                  onChange={(e) => setFacility({...facility, tiers: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Total Canopy Area (sq ft)</label>
                <input
                  type="number"
                  value={facility.canopyArea}
                  onChange={(e) => setFacility({...facility, canopyArea: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Crop Type</label>
                <select
                  value={facility.cropType}
                  onChange={(e) => setFacility({...facility, cropType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                >
                  {laborBenchmarks.map(benchmark => (
                    <option key={benchmark.cropType} value={benchmark.cropType}>
                      {benchmark.cropType}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Automation Level</label>
                <select
                  value={facility.automationLevel}
                  onChange={(e) => setFacility({...facility, automationLevel: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                >
                  <option value="low">Low (Manual Operations)</option>
                  <option value="medium">Medium (Semi-Automated)</option>
                  <option value="high">High (Fully Automated)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Affects labor requirements and operational efficiency
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target PPFD (μmol/m²/s)</label>
                <input
                  type="number"
                  value={facility.targetPPFD}
                  onChange={(e) => setFacility({...facility, targetPPFD: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Photoperiod (hours)</label>
                <input
                  type="number"
                  value={facility.photoperiod}
                  onChange={(e) => setFacility({...facility, photoperiod: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Crop Cycles per Year</label>
                <input
                  type="number"
                  value={facility.cropCycles}
                  onChange={(e) => setFacility({...facility, cropCycles: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Yield per sq ft per Cycle (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={facility.yieldPerSqFt}
                  onChange={(e) => setFacility({...facility, yieldPerSqFt: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Average Price per Pound ($)</label>
                <input
                  type="number"
                  value={facility.pricePerPound}
                  onChange={(e) => setFacility({...facility, pricePerPound: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-100 mb-2">Quick Metrics</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Annual Production</p>
                  <p className="text-xl font-semibold text-white">
                    {(facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles).toLocaleString()} lbs
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Canopy per Room</p>
                  <p className="text-xl font-semibold text-white">
                    {Math.round(facility.canopyArea / facility.rooms).toLocaleString()} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Revenue Potential</p>
                  <p className="text-xl font-semibold text-white">
                    ${(calculateAnnualRevenue() / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capex' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Capital Expenditures
              </h2>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {costCategories.map(category => {
                const categoryItems = capexItems.filter(item => item.category === category.id)
                const Icon = category.icon
                
                return (
                  <div key={category.id} className="border rounded-lg p-4 border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5" style={{ color: category.color }} />
                      <h3 className="font-medium text-gray-100">{category.name}</h3>
                      <span className="ml-auto text-sm font-medium text-gray-400">
                        ${categoryItems.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}
                      </span>
                    </div>
                    
                    {categoryItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-100">{item.item}</p>
                          <p className="text-sm text-gray-400">
                            {item.quantity} units × ${item.unitCost.toLocaleString()} = ${item.totalCost.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {item.lifespan} yr lifespan
                          </p>
                          <p className="text-sm text-gray-400">
                            {item.annualMaintenance}% maintenance
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-100">
                  Total Capital Investment
                </h3>
                <p className="text-2xl font-bold text-white">
                  ${calculateTotalCapex().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'opex' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Annual Operating Expenses
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-100">Utilities</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Electricity (Annual)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.electricity}
                      onChange={(e) => setOpexItems({...opexItems, electricity: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated: {Math.round(facility.canopyArea * 50 * facility.photoperiod * 365 * facility.utilityRate / 1000).toLocaleString()} kWh/year
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Water & Wastewater</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.water}
                      onChange={(e) => setOpexItems({...opexItems, water: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-100">Operations</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Labor Costs</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.labor}
                      onChange={(e) => setOpexItems({...opexItems, labor: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div className="space-y-1 mt-2">
                    {(() => {
                      const laborCalc = calculateLaborCosts({
                        cropType: facility.cropType,
                        canopyArea: facility.canopyArea,
                        automationLevel: facility.automationLevel
                      });
                      return (
                        <>
                          <p className="text-xs text-gray-500">
                            {facility.cropType}: {laborCalc.fteRequired} FTEs @ ${laborCalc.hourlyRate}/hr
                          </p>
                          <p className="text-xs text-gray-500">
                            ${laborCalc.laborCostPerSqFt}/sq ft • Automation: {facility.automationLevel}
                          </p>
                        </>
                      );
                    })()}
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer hover:text-gray-400">View all labor benchmarks</summary>
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-700">
                        <div>• Leafy Greens: 1 FTE per 8,000 sq ft @ $50k/year</div>
                        <div>• Herbs: 1 FTE per 6,000 sq ft @ $55k/year</div>
                        <div>• Vine Crops: 1 FTE per 4,000 sq ft @ $65k/year</div>
                        <div>• Cannabis: 1 FTE per 5,000 sq ft @ $60k/year</div>
                        <div>• Microgreens: 1 FTE per 10,000 sq ft @ $45k/year</div>
                        <div>• Mushrooms: 1 FTE per 3,000 sq ft @ $55k/year</div>
                      </div>
                    </details>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nutrients & Supplies</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.nutrients}
                      onChange={(e) => setOpexItems({...opexItems, nutrients: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Fertilizers, pH adjusters, pesticides
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Growing Substrate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.substrate}
                      onChange={(e) => setOpexItems({...opexItems, substrate: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Rockwool, perlite, coco coir, replacement media
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Seeds & Propagation</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.seeds}
                      onChange={(e) => setOpexItems({...opexItems, seeds: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seeds, plugs, starter materials
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Packaging Materials</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.packaging}
                      onChange={(e) => setOpexItems({...opexItems, packaging: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Containers, labels, bags, shipping materials
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Equipment Maintenance</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.maintenance}
                      onChange={(e) => setOpexItems({...opexItems, maintenance: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Repairs, replacements, service contracts
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-100">Facility</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Rent/Lease</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.rent}
                      onChange={(e) => setOpexItems({...opexItems, rent: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ${(opexItems.rent / facility.size).toFixed(2)}/sq ft/year
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Insurance</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.insurance}
                      onChange={(e) => setOpexItems({...opexItems, insurance: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Other Utilities</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={opexItems.utilities}
                      onChange={(e) => setOpexItems({...opexItems, utilities: Number(e.target.value)})}
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Gas, waste management, telecom
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Other Operating Expenses</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={opexItems.other}
                    onChange={(e) => setOpexItems({...opexItems, other: Number(e.target.value)})}
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
              </div>
            </div>
            
            {/* OPEX Breakdown Chart */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-100 mb-4">Operating Expense Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Electricity', value: opexItems.electricity, color: '#8b5cf6' },
                        { name: 'Labor', value: opexItems.labor, color: '#3b82f6' },
                        { name: 'Rent', value: opexItems.rent, color: '#10b981' },
                        { name: 'Nutrients', value: opexItems.nutrients, color: '#f59e0b' },
                        { name: 'Packaging', value: opexItems.packaging, color: '#06b6d4' },
                        { name: 'Maintenance', value: opexItems.maintenance, color: '#ec4899' },
                        { name: 'Substrate', value: opexItems.substrate, color: '#14b8a6' },
                        { name: 'Seeds', value: opexItems.seeds, color: '#f97316' },
                        { name: 'Water', value: opexItems.water, color: '#0ea5e9' },
                        { name: 'Utilities', value: opexItems.utilities, color: '#a855f7' },
                        { name: 'Insurance', value: opexItems.insurance, color: '#84cc16' },
                        { name: 'Other', value: opexItems.other, color: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0,1,2,3,4,5,6].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#6b7280'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.375rem' }} itemStyle={{ color: '#e5e7eb' }} labelStyle={{ color: '#e5e7eb' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-100">
                  Total Annual Operating Expenses
                </h3>
                <p className="text-2xl font-bold text-white">
                  ${calculateTotalOpex().toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                ${(calculateTotalOpex() / facility.canopyArea).toFixed(2)} per sq ft of canopy
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Financial Analysis
            </h2>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
                <p className="text-sm text-purple-400">ROI</p>
                <p className="text-2xl font-bold text-white">
                  {calculateROI()}%
                </p>
              </div>
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-400">Payback Period</p>
                <p className="text-2xl font-bold text-white">
                  {calculatePayback()} years
                </p>
              </div>
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-400">Annual Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${(calculateAnnualRevenue() / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-400">Gross Margin</p>
                <p className="text-2xl font-bold text-white">
                  {((1 - calculateTotalOpex() / calculateAnnualRevenue()) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Cash Flow Chart */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-100 mb-4">10-Year Cash Flow Projection</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateCashFlow()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} stroke="#9ca3af" />
                    <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`} contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.375rem' }} itemStyle={{ color: '#e5e7eb' }} labelStyle={{ color: '#e5e7eb' }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="opex" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="capex" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Sensitivity Analysis */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-100 mb-4">Sensitivity Analysis</h3>
              <div className="space-y-3">
                {[
                  { factor: 'Yield per sq ft', current: facility.yieldPerSqFt, impact: 'high' },
                  { factor: 'Price per pound', current: facility.pricePerPound, impact: 'high' },
                  { factor: 'Electricity cost', current: opexItems.electricity, impact: 'medium' },
                  { factor: 'Labor cost', current: opexItems.labor, impact: 'medium' }
                ].map((item) => (
                  <div key={item.factor} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-100">{item.factor}</p>
                      <p className="text-sm text-gray-400">
                        Current: ${typeof item.current === 'number' && item.current > 100 ? item.current.toLocaleString() : item.current}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.impact === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {item.impact === 'high' ? 'High Impact' : 'Medium Impact'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Industry Benchmarks & Reference Costs
            </h2>
            
            {/* Vertical Farming Economics Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Vertical Farming Economics by Production Scale
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="text-left py-2">System Type</th>
                      <th className="text-right py-2">Growing Area (sq ft)</th>
                      <th className="text-right py-2">Investment/sq ft</th>
                      <th className="text-right py-2">Yield (lbs/sq ft/yr)</th>
                      <th className="text-right py-2">$/lb/year</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-700">
                      <td className="py-2">Small-scale mobile system</td>
                      <td className="text-right">22</td>
                      <td className="text-right">$120</td>
                      <td className="text-right">18</td>
                      <td className="text-right">$2.8</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2">Container-based multi-tier</td>
                      <td className="text-right">160</td>
                      <td className="text-right">$480</td>
                      <td className="text-right">23</td>
                      <td className="text-right">$9.2</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2">Mid-scale warehouse facility</td>
                      <td className="text-right">8,100</td>
                      <td className="text-right">$125</td>
                      <td className="text-right">18</td>
                      <td className="text-right">$3.0</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2">Advanced climate-controlled facility</td>
                      <td className="text-right">10,800</td>
                      <td className="text-right">$270</td>
                      <td className="text-right">36</td>
                      <td className="text-right">$3.2</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2">Large-scale automated facility</td>
                      <td className="text-right">54,000</td>
                      <td className="text-right">$160</td>
                      <td className="text-right">45</td>
                      <td className="text-right">$1.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Industry benchmarks based on leafy green production at 200-220 μmol/m²/s PPFD
              </p>
            </div>

            {/* Labor Requirements */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Labor Requirements by Crop Type
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-gray-400 text-sm">
                    <tr>
                      <th className="text-left py-2">Crop Type</th>
                      <th className="text-right py-2">sq ft/FTE</th>
                      <th className="text-right py-2">Annual Salary</th>
                      <th className="text-right py-2">Labor Cost/sq ft</th>
                      <th className="text-right py-2">Automation Impact</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {laborBenchmarks.map((benchmark, index) => {
                      const laborCostPerSqFt = (benchmark.annualSalary * 1.35) / benchmark.sqFtPerFTE;
                      const highAutomationSavings = 30; // 30% savings with high automation
                      return (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-2">{benchmark.cropType}</td>
                          <td className="text-right">{benchmark.sqFtPerFTE.toLocaleString()}</td>
                          <td className="text-right">${benchmark.annualSalary.toLocaleString()}</td>
                          <td className="text-right">${laborCostPerSqFt.toFixed(2)}</td>
                          <td className="text-right text-green-400">-{highAutomationSavings}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Task Distribution (Hours/Day)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Seeding/Propagation</span>
                      <span className="text-gray-300">15-20% of labor</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Transplanting</span>
                      <span className="text-gray-300">10-15% of labor</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Maintenance</span>
                      <span className="text-gray-300">20-30% of labor</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Harvesting</span>
                      <span className="text-gray-300">30-40% of labor</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Packaging</span>
                      <span className="text-gray-300">15-20% of labor</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Automation Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Seeding Automation</span>
                      <span className="text-gray-300">60-90% reduction</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Watering/Fertigation</span>
                      <span className="text-gray-300">80-95% reduction</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Climate Control</span>
                      <span className="text-gray-300">70-90% reduction</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Harvest Automation</span>
                      <span className="text-gray-300">20-60% reduction</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700">
                      <span className="text-gray-400">Packaging Lines</span>
                      <span className="text-gray-300">40-80% reduction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Facility Comparison */}
            <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-600/30">
              <h3 className="text-lg font-medium text-gray-100 mb-4">
                How Your Facility Compares
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Investment per m²</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${(calculateTotalCapex() / (facility.size * 0.092903)).toFixed(0)}/m²
                  </p>
                  <p className="text-xs text-gray-500">vs industry avg €1,500-2,500</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Expected Yield</p>
                  <p className="text-2xl font-bold text-green-400">
                    {((facility.yieldPerSqFt * 453.592) / 0.092903).toFixed(0)} kg/m²/yr
                  </p>
                  <p className="text-xs text-gray-500">vs industry avg 40-100</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Cost per kg/year</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${(calculateTotalCapex() / (facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles * 0.453592)).toFixed(0)}/kg/yr
                  </p>
                  <p className="text-xs text-gray-500">vs industry avg €13-80</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Executive Summary Report
              </h2>
              <button 
                onClick={() => setShowEnhancedReports(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Professional Report
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none text-gray-300">
              <h3>Investment Overview</h3>
              <p>
                The proposed {facility.name} represents a total capital investment of ${calculateTotalCapex().toLocaleString()} 
                with projected annual revenues of ${calculateAnnualRevenue().toLocaleString()}. Based on our analysis, 
                this investment will achieve a {calculateROI()}% ROI with a payback period of {calculatePayback()} years.
              </p>
              
              <h3>Facility Specifications</h3>
              <ul>
                <li>Total Facility Size: {facility.size.toLocaleString()} sq ft</li>
                <li>Canopy Area: {facility.canopyArea.toLocaleString()} sq ft</li>
                <li>Number of Grow Rooms: {facility.rooms}</li>
                <li>Vertical Tiers: {facility.tiers}</li>
                <li>Annual Production Capacity: {(facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles).toLocaleString()} lbs</li>
              </ul>
              
              <h3>Financial Projections</h3>
              <p>
                With a gross margin of {((1 - calculateTotalOpex() / calculateAnnualRevenue()) * 100).toFixed(1)}%, 
                the facility is projected to generate positive cash flow by year {Math.ceil(Number(calculatePayback()))}. 
                The 10-year NPV is estimated at ${(calculateAnnualRevenue() * 10 - calculateTotalOpex() * 10 - calculateTotalCapex()).toLocaleString()}.
              </p>
              
              <h3>Risk Analysis</h3>
              <p>
                Key risk factors include market price volatility, yield consistency, and energy cost fluctuations. 
                Our sensitivity analysis indicates that a 10% reduction in yield or market price would extend the 
                payback period by approximately 1-2 years.
              </p>
              
              <h3>Recommendations</h3>
              <ol>
                <li>Implement phased construction to reduce initial capital requirements</li>
                <li>Secure long-term energy contracts to stabilize operating costs</li>
                <li>Establish offtake agreements to ensure stable revenue streams</li>
                <li>Invest in automation to reduce labor costs over time</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Report Generator */}
      {showEnhancedReports && (
        <EnhancedReportGenerator
          data={{
            project: {
              name: facility.name,
              type: 'Total Cost of Ownership Analysis'
            },
            totalCost: calculateTotalCost(),
            roi: calculateROI(),
            paybackPeriod: calculatePaybackPeriod(),
            facility,
            capexItems,
            opexItems
          }}
          type="tco"
          onClose={() => setShowEnhancedReports(false)}
        />
      )}
    </div>
  )
}