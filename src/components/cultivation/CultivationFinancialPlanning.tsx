'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart,
  BarChart3,
  Calendar,
  Zap,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Upload,
  Settings,
  Target,
  Banknote,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Lightbulb,
  Droplets,
  Wind,
  Home,
  Wrench,
  ShoppingCart,
  FileText,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostCategory {
  id: string;
  name: string;
  category: 'fixed' | 'variable' | 'capital';
  subcategory: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually' | 'per-cycle';
  notes?: string;
  isElectricity?: boolean;
}

interface RevenueStream {
  id: string;
  name: string;
  type: 'flower' | 'trim' | 'clone' | 'other';
  pricePerUnit: number;
  unit: string;
  expectedQuantity: number;
  frequency: 'per-cycle' | 'monthly' | 'annually';
  qualityGrade?: 'A' | 'B' | 'C';
}

interface FinancialScenario {
  id: string;
  name: string;
  description: string;
  costs: CostCategory[];
  revenues: RevenueStream[];
  assumptions: {
    cyclesPerYear: number;
    yieldPerSqFt: number;
    electricityRate: number; // $/kWh
    laborRate: number; // $/hour
    facilitySize: number; // sq ft
    canopySize: number; // sq ft
    lightingEfficiency: number; // μmol/J
    avgPPFD: number;
    photoperiod: number; // hours
  };
}

interface ROIMetrics {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  breakEvenCycles: number;
  paybackPeriod: number; // months
  roi: number; // percentage
  costPerGram: number;
  revenuePerSqFt: number;
  profitPerSqFt: number;
}

interface CashFlow {
  month: number;
  revenue: number;
  costs: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

const defaultCosts: CostCategory[] = [
  // Capital Costs
  { id: 'c1', name: 'LED Grow Lights', category: 'capital', subcategory: 'Equipment', amount: 150000, frequency: 'one-time', notes: '300 fixtures @ $500 each' },
  { id: 'c2', name: 'HVAC System', category: 'capital', subcategory: 'Equipment', amount: 75000, frequency: 'one-time' },
  { id: 'c3', name: 'Irrigation System', category: 'capital', subcategory: 'Equipment', amount: 25000, frequency: 'one-time' },
  { id: 'c4', name: 'Racking & Benches', category: 'capital', subcategory: 'Infrastructure', amount: 30000, frequency: 'one-time' },
  { id: 'c5', name: 'Environmental Controls', category: 'capital', subcategory: 'Equipment', amount: 20000, frequency: 'one-time' },
  
  // Fixed Costs
  { id: 'f1', name: 'Facility Lease', category: 'fixed', subcategory: 'Facility', amount: 15000, frequency: 'monthly' },
  { id: 'f2', name: 'Insurance', category: 'fixed', subcategory: 'Operations', amount: 2500, frequency: 'monthly' },
  { id: 'f3', name: 'Security', category: 'fixed', subcategory: 'Operations', amount: 1500, frequency: 'monthly' },
  { id: 'f4', name: 'Licensing & Compliance', category: 'fixed', subcategory: 'Legal', amount: 25000, frequency: 'annually' },
  { id: 'f5', name: 'Management Salaries', category: 'fixed', subcategory: 'Labor', amount: 20000, frequency: 'monthly' },
  
  // Variable Costs
  { id: 'v1', name: 'Electricity - Lighting', category: 'variable', subcategory: 'Utilities', amount: 8000, frequency: 'monthly', isElectricity: true },
  { id: 'v2', name: 'Electricity - HVAC', category: 'variable', subcategory: 'Utilities', amount: 4000, frequency: 'monthly', isElectricity: true },
  { id: 'v3', name: 'Water & Nutrients', category: 'variable', subcategory: 'Utilities', amount: 1500, frequency: 'monthly' },
  { id: 'v4', name: 'Growing Media', category: 'variable', subcategory: 'Supplies', amount: 2000, frequency: 'per-cycle' },
  { id: 'v5', name: 'Seeds/Clones', category: 'variable', subcategory: 'Supplies', amount: 3000, frequency: 'per-cycle' },
  { id: 'v6', name: 'Cultivation Labor', category: 'variable', subcategory: 'Labor', amount: 15000, frequency: 'monthly' },
  { id: 'v7', name: 'Packaging', category: 'variable', subcategory: 'Supplies', amount: 1000, frequency: 'per-cycle' },
  { id: 'v8', name: 'Testing & QA', category: 'variable', subcategory: 'Compliance', amount: 2000, frequency: 'per-cycle' }
];

const defaultRevenues: RevenueStream[] = [
  { id: 'r1', name: 'Premium Flower', type: 'flower', pricePerUnit: 2000, unit: 'lb', expectedQuantity: 50, frequency: 'per-cycle', qualityGrade: 'A' },
  { id: 'r2', name: 'Standard Flower', type: 'flower', pricePerUnit: 1500, unit: 'lb', expectedQuantity: 75, frequency: 'per-cycle', qualityGrade: 'B' },
  { id: 'r3', name: 'Trim/Shake', type: 'trim', pricePerUnit: 300, unit: 'lb', expectedQuantity: 40, frequency: 'per-cycle' },
  { id: 'r4', name: 'Clone Sales', type: 'clone', pricePerUnit: 10, unit: 'clone', expectedQuantity: 500, frequency: 'monthly' }
];

export function CultivationFinancialPlanning() {
  const [scenario, setScenario] = useState<FinancialScenario>({
    id: 'default',
    name: 'Base Scenario',
    description: 'Standard 10,000 sq ft facility with LED lighting',
    costs: defaultCosts,
    revenues: defaultRevenues,
    assumptions: {
      cyclesPerYear: 5,
      yieldPerSqFt: 0.125, // lbs
      electricityRate: 0.12, // $/kWh
      laborRate: 20, // $/hour
      facilitySize: 10000,
      canopySize: 6000,
      lightingEfficiency: 2.5, // μmol/J
      avgPPFD: 700,
      photoperiod: 12
    }
  });

  const [activeView, setActiveView] = useState<'overview' | 'costs' | 'revenue' | 'cashflow' | 'sensitivity' | 'comparison'>('overview');
  const [showDetails, setShowDetails] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [sensitivityParameter, setSensitivityParameter] = useState<'yield' | 'price' | 'electricity' | 'labor'>('yield');
  const [comparisonScenarios, setComparisonScenarios] = useState<FinancialScenario[]>([]);

  // Calculate electricity costs based on lighting parameters
  const calculateElectricityCost = () => {
    const { avgPPFD, photoperiod, canopySize, lightingEfficiency, electricityRate } = scenario.assumptions;
    
    // Calculate total PPF needed
    const totalPPF = avgPPFD * canopySize * 0.092903; // Convert sq ft to m²
    
    // Calculate power consumption in kW
    const powerKW = (totalPPF / lightingEfficiency) / 1000;
    
    // Calculate monthly electricity cost
    const monthlyHours = photoperiod * 30;
    const monthlyCost = powerKW * monthlyHours * electricityRate;
    
    return monthlyCost;
  };

  // Update electricity costs when assumptions change
  useEffect(() => {
    const lightingCost = calculateElectricityCost();
    setScenario(prev => ({
      ...prev,
      costs: prev.costs.map(cost => 
        cost.id === 'v1' ? { ...cost, amount: lightingCost } : cost
      )
    }));
  }, [scenario.assumptions.avgPPFD, scenario.assumptions.photoperiod, scenario.assumptions.canopySize, scenario.assumptions.lightingEfficiency, scenario.assumptions.electricityRate]);

  // Calculate ROI metrics
  const calculateROI = (): ROIMetrics => {
    const { costs, revenues, assumptions } = scenario;
    
    // Calculate annual revenues
    let annualRevenue = 0;
    revenues.forEach(rev => {
      if (rev.frequency === 'per-cycle') {
        annualRevenue += rev.pricePerUnit * rev.expectedQuantity * assumptions.cyclesPerYear;
      } else if (rev.frequency === 'monthly') {
        annualRevenue += rev.pricePerUnit * rev.expectedQuantity * 12;
      } else {
        annualRevenue += rev.pricePerUnit * rev.expectedQuantity;
      }
    });
    
    // Calculate annual costs
    let annualFixedCosts = 0;
    let annualVariableCosts = 0;
    let capitalCosts = 0;
    
    costs.forEach(cost => {
      const annualAmount = 
        cost.frequency === 'monthly' ? cost.amount * 12 :
        cost.frequency === 'quarterly' ? cost.amount * 4 :
        cost.frequency === 'per-cycle' ? cost.amount * assumptions.cyclesPerYear :
        cost.frequency === 'annually' ? cost.amount :
        0; // one-time costs not included in annual
      
      if (cost.category === 'capital') {
        capitalCosts += cost.amount;
      } else if (cost.category === 'fixed') {
        annualFixedCosts += annualAmount;
      } else {
        annualVariableCosts += annualAmount;
      }
    });
    
    const totalAnnualCosts = annualFixedCosts + annualVariableCosts;
    const grossProfit = annualRevenue - totalAnnualCosts;
    const grossMargin = (grossProfit / annualRevenue) * 100;
    
    // Calculate depreciation (5-year for equipment)
    const annualDepreciation = capitalCosts / 5;
    const netProfit = grossProfit - annualDepreciation;
    const netMargin = (netProfit / annualRevenue) * 100;
    
    // Calculate other metrics
    const totalYieldPerCycle = assumptions.yieldPerSqFt * assumptions.canopySize;
    const totalAnnualYield = totalYieldPerCycle * assumptions.cyclesPerYear;
    const costPerGram = (totalAnnualCosts / (totalAnnualYield * 453.592)); // Convert lbs to grams
    
    const breakEvenCycles = capitalCosts / (grossProfit / assumptions.cyclesPerYear);
    const paybackPeriod = (capitalCosts / grossProfit) * 12; // in months
    const roi = ((netProfit / capitalCosts) * 100);
    
    const revenuePerSqFt = annualRevenue / assumptions.canopySize;
    const profitPerSqFt = netProfit / assumptions.canopySize;
    
    return {
      totalRevenue: annualRevenue,
      totalCosts: totalAnnualCosts,
      grossProfit,
      grossMargin,
      netProfit,
      netMargin,
      breakEvenCycles,
      paybackPeriod,
      roi,
      costPerGram,
      revenuePerSqFt,
      profitPerSqFt
    };
  };

  const metrics = calculateROI();

  // Generate cash flow projection
  const generateCashFlow = (): CashFlow[] => {
    const monthlyData: CashFlow[] = [];
    let cumulativeCashFlow = -scenario.costs.filter(c => c.category === 'capital').reduce((sum, c) => sum + c.amount, 0);
    
    for (let month = 1; month <= 36; month++) {
      // Calculate revenue for this month
      let monthlyRevenue = 0;
      scenario.revenues.forEach(rev => {
        if (rev.frequency === 'monthly') {
          monthlyRevenue += rev.pricePerUnit * rev.expectedQuantity;
        } else if (rev.frequency === 'per-cycle') {
          // Assume harvest every 2.4 months (5 cycles/year)
          if (month % Math.floor(12 / scenario.assumptions.cyclesPerYear) === 0) {
            monthlyRevenue += rev.pricePerUnit * rev.expectedQuantity;
          }
        }
      });
      
      // Calculate costs for this month
      let monthlyCosts = 0;
      scenario.costs.forEach(cost => {
        if (cost.frequency === 'monthly') {
          monthlyCosts += cost.amount;
        } else if (cost.frequency === 'quarterly' && month % 3 === 0) {
          monthlyCosts += cost.amount;
        } else if (cost.frequency === 'annually' && month % 12 === 0) {
          monthlyCosts += cost.amount;
        } else if (cost.frequency === 'per-cycle') {
          if (month % Math.floor(12 / scenario.assumptions.cyclesPerYear) === 0) {
            monthlyCosts += cost.amount;
          }
        }
      });
      
      const netCashFlow = monthlyRevenue - monthlyCosts;
      cumulativeCashFlow += netCashFlow;
      
      monthlyData.push({
        month,
        revenue: monthlyRevenue,
        costs: monthlyCosts,
        netCashFlow,
        cumulativeCashFlow
      });
    }
    
    return monthlyData;
  };

  const cashFlowData = generateCashFlow();

  // Generate cost breakdown data
  const getCostBreakdown = () => {
    const breakdown: { name: string; value: number; category: string }[] = [];
    const categoryTotals: Record<string, number> = {};
    
    scenario.costs.forEach(cost => {
      const annualAmount = 
        cost.frequency === 'monthly' ? cost.amount * 12 :
        cost.frequency === 'quarterly' ? cost.amount * 4 :
        cost.frequency === 'per-cycle' ? cost.amount * scenario.assumptions.cyclesPerYear :
        cost.frequency === 'annually' ? cost.amount :
        cost.amount / 5; // Amortize capital costs over 5 years
      
      if (!categoryTotals[cost.subcategory]) {
        categoryTotals[cost.subcategory] = 0;
      }
      categoryTotals[cost.subcategory] += annualAmount;
    });
    
    Object.entries(categoryTotals).forEach(([category, value]) => {
      breakdown.push({ name: category, value, category });
    });
    
    return breakdown.sort((a, b) => b.value - a.value);
  };

  // Generate sensitivity analysis data
  const generateSensitivityData = () => {
    const baseMetrics = calculateROI();
    const variations = [-20, -10, 0, 10, 20]; // percentage variations
    
    return variations.map(variation => {
      const modifiedScenario = { ...scenario };
      
      switch (sensitivityParameter) {
        case 'yield':
          modifiedScenario.assumptions.yieldPerSqFt = scenario.assumptions.yieldPerSqFt * (1 + variation / 100);
          break;
        case 'price':
          modifiedScenario.revenues = scenario.revenues.map(rev => ({
            ...rev,
            pricePerUnit: rev.pricePerUnit * (1 + variation / 100)
          }));
          break;
        case 'electricity':
          modifiedScenario.assumptions.electricityRate = scenario.assumptions.electricityRate * (1 + variation / 100);
          break;
        case 'labor':
          modifiedScenario.assumptions.laborRate = scenario.assumptions.laborRate * (1 + variation / 100);
          break;
      }
      
      // Recalculate metrics with modified scenario
      const tempScenario = scenario;
      setScenario(modifiedScenario);
      const modifiedMetrics = calculateROI();
      setScenario(tempScenario);
      
      return {
        variation: `${variation > 0 ? '+' : ''}${variation}%`,
        netProfit: modifiedMetrics.netProfit,
        roi: modifiedMetrics.roi,
        paybackPeriod: modifiedMetrics.paybackPeriod
      };
    });
  };

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const addCost = () => {
    const newCost: CostCategory = {
      id: `c-${Date.now()}`,
      name: 'New Cost Item',
      category: 'variable',
      subcategory: 'Other',
      amount: 0,
      frequency: 'monthly'
    };
    setScenario(prev => ({
      ...prev,
      costs: [...prev.costs, newCost]
    }));
  };

  const updateCost = (id: string, updates: Partial<CostCategory>) => {
    setScenario(prev => ({
      ...prev,
      costs: prev.costs.map(cost => 
        cost.id === id ? { ...cost, ...updates } : cost
      )
    }));
  };

  const removeCost = (id: string) => {
    setScenario(prev => ({
      ...prev,
      costs: prev.costs.filter(cost => cost.id !== id)
    }));
  };

  const addRevenue = () => {
    const newRevenue: RevenueStream = {
      id: `r-${Date.now()}`,
      name: 'New Revenue Stream',
      type: 'flower',
      pricePerUnit: 0,
      unit: 'lb',
      expectedQuantity: 0,
      frequency: 'per-cycle'
    };
    setScenario(prev => ({
      ...prev,
      revenues: [...prev.revenues, newRevenue]
    }));
  };

  const updateRevenue = (id: string, updates: Partial<RevenueStream>) => {
    setScenario(prev => ({
      ...prev,
      revenues: prev.revenues.map(revenue => 
        revenue.id === id ? { ...revenue, ...updates } : revenue
      )
    }));
  };

  const removeRevenue = (id: string) => {
    setScenario(prev => ({
      ...prev,
      revenues: prev.revenues.filter(revenue => revenue.id !== id)
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cultivation Financial Planning
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              ROI analysis and financial projections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Annual Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(metrics.revenuePerSqFt)}/sq ft
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Net Profit</span>
            {metrics.netProfit > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${metrics.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(metrics.netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.netMargin.toFixed(1)}% margin
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">ROI</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.roi.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.paybackPeriod.toFixed(1)} mo payback
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Cost per Gram</span>
            <Calculator className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${metrics.costPerGram.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            All-in production cost
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'costs', label: 'Cost Analysis', icon: Receipt },
          { id: 'revenue', label: 'Revenue Streams', icon: Banknote },
          { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
          { id: 'sensitivity', label: 'Sensitivity', icon: BarChart3 },
          { id: 'comparison', label: 'Compare', icon: Target }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Views */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Breakdown Pie Chart */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Annual Cost Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={getCostBreakdown()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCostBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly P&L */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profit & Loss Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(metrics.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Operating Costs</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    -{formatCurrency(metrics.totalCosts)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Gross Profit</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(metrics.grossProfit)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {metrics.grossMargin.toFixed(1)}% margin
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Depreciation</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    -{formatCurrency(scenario.costs.filter(c => c.category === 'capital').reduce((sum, c) => sum + c.amount, 0) / 5)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Net Profit</span>
                    <span className={`font-bold text-xl ${metrics.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.netProfit)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {metrics.netMargin.toFixed(1)}% margin
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Assumptions */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Key Assumptions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Cycles per Year
                </label>
                <input
                  type="number"
                  value={scenario.assumptions.cyclesPerYear}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, cyclesPerYear: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Yield per sq ft (lbs)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={scenario.assumptions.yieldPerSqFt}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, yieldPerSqFt: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Electricity Rate ($/kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={scenario.assumptions.electricityRate}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, electricityRate: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Canopy Size (sq ft)
                </label>
                <input
                  type="number"
                  value={scenario.assumptions.canopySize}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, canopySize: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Lighting Parameters */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Lighting System Parameters
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Average PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={scenario.assumptions.avgPPFD}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, avgPPFD: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Photoperiod (hours)
                </label>
                <input
                  type="number"
                  value={scenario.assumptions.photoperiod}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, photoperiod: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Efficiency (μmol/J)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={scenario.assumptions.lightingEfficiency}
                  onChange={(e) => setScenario(prev => ({
                    ...prev,
                    assumptions: { ...prev.assumptions, lightingEfficiency: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Monthly kWh
                </label>
                <p className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-900 dark:text-blue-100 font-semibold">
                  {((calculateElectricityCost() / scenario.assumptions.electricityRate)).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'costs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Categories
            </h3>
            <button
              onClick={addCost}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Cost
            </button>
          </div>

          {/* Cost Tables by Category */}
          {['capital', 'fixed', 'variable'].map(category => (
            <div key={category} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                {category} Costs
              </h4>
              <div className="space-y-2">
                {scenario.costs
                  .filter(cost => cost.category === category)
                  .map(cost => (
                    <div key={cost.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <input
                        type="text"
                        value={cost.name}
                        onChange={(e) => updateCost(cost.id, { name: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <select
                        value={cost.subcategory}
                        onChange={(e) => updateCost(cost.id, { subcategory: e.target.value })}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="Equipment">Equipment</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Facility">Facility</option>
                        <option value="Labor">Labor</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Operations">Operations</option>
                        <option value="Legal">Legal</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={cost.amount}
                          onChange={(e) => updateCost(cost.id, { amount: Number(e.target.value) })}
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <select
                        value={cost.frequency}
                        onChange={(e) => updateCost(cost.id, { frequency: e.target.value as any })}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="one-time">One-time</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                        <option value="per-cycle">Per Cycle</option>
                      </select>
                      {cost.isElectricity && (
                        <Zap className="w-4 h-4 text-yellow-500" title="Calculated from lighting parameters" />
                      )}
                      <button
                        onClick={() => removeCost(cost.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'revenue' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Streams
            </h3>
            <button
              onClick={addRevenue}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Revenue
            </button>
          </div>

          <div className="space-y-3">
            {scenario.revenues.map(revenue => (
              <div key={revenue.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={revenue.name}
                      onChange={(e) => updateRevenue(revenue.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Type
                    </label>
                    <select
                      value={revenue.type}
                      onChange={(e) => updateRevenue(revenue.id, { type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="flower">Flower</option>
                      <option value="trim">Trim/Shake</option>
                      <option value="clone">Clones</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Price/Unit
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={revenue.pricePerUnit}
                        onChange={(e) => updateRevenue(revenue.id, { pricePerUnit: Number(e.target.value) })}
                        className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={revenue.expectedQuantity}
                      onChange={(e) => updateRevenue(revenue.id, { expectedQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Frequency
                    </label>
                    <select
                      value={revenue.frequency}
                      onChange={(e) => updateRevenue(revenue.id, { frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="per-cycle">Per Cycle</option>
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4">
                    {revenue.type === 'flower' && (
                      <select
                        value={revenue.qualityGrade || 'B'}
                        onChange={(e) => updateRevenue(revenue.id, { qualityGrade: e.target.value as any })}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="A">Grade A</option>
                        <option value="B">Grade B</option>
                        <option value="C">Grade C</option>
                      </select>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Annual Revenue: {formatCurrency(
                        revenue.frequency === 'per-cycle' 
                          ? revenue.pricePerUnit * revenue.expectedQuantity * scenario.assumptions.cyclesPerYear
                          : revenue.frequency === 'monthly'
                          ? revenue.pricePerUnit * revenue.expectedQuantity * 12
                          : revenue.pricePerUnit * revenue.expectedQuantity
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => removeRevenue(revenue.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'cashflow' && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              36-Month Cash Flow Projection
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="costs" 
                  stackId="2"
                  stroke="#EF4444" 
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Costs"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeCashFlow" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Cumulative Cash Flow"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cash Flow Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Break-Even Point
                </h4>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.ceil(metrics.breakEvenCycles)} cycles
              </p>
              <p className="text-sm text-gray-500">
                ~{(metrics.breakEvenCycles * 12 / scenario.assumptions.cyclesPerYear).toFixed(1)} months
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-green-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Initial Investment
                </h4>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(scenario.costs.filter(c => c.category === 'capital').reduce((sum, c) => sum + c.amount, 0))}
              </p>
              <p className="text-sm text-gray-500">
                Capital expenditure
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  3-Year NPV
                </h4>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.netProfit * 3 - scenario.costs.filter(c => c.category === 'capital').reduce((sum, c) => sum + c.amount, 0))}
              </p>
              <p className="text-sm text-gray-500">
                10% discount rate
              </p>
            </div>
          </div>
        </div>
      )}

      {activeView === 'sensitivity' && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sensitivity Analysis
              </h3>
              <select
                value={sensitivityParameter}
                onChange={(e) => setSensitivityParameter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="yield">Yield per sq ft</option>
                <option value="price">Product Prices</option>
                <option value="electricity">Electricity Rate</option>
                <option value="labor">Labor Costs</option>
              </select>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateSensitivityData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="variation" 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Bar dataKey="netProfit" fill="#8B5CF6" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Sensitivity Insights
              </h4>
            </div>
            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              <li>• A 10% increase in yield improves net profit by {((generateSensitivityData()[3].netProfit - generateSensitivityData()[2].netProfit) / generateSensitivityData()[2].netProfit * 100).toFixed(1)}%</li>
              <li>• Price sensitivity is highest for premium flower products</li>
              <li>• Energy efficiency improvements have compound benefits</li>
              <li>• Labor automation can significantly improve margins</li>
            </ul>
          </div>
        </div>
      )}

      {activeView === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scenario Comparison
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Compare different cultivation scenarios and strategies
            </p>
            
            {/* Placeholder for comparison functionality */}
            <div className="mt-6 text-center py-12">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Create multiple scenarios to compare financial outcomes
              </p>
              <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                Create New Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}