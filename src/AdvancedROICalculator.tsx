'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Calendar,
  BarChart3,
  LineChart,
  Package,
  Sun,
  AlertCircle,
  Info,
  Download,
  Settings,
  Building
} from 'lucide-react';

interface ProductionMetrics {
  baseYield: number; // kg/m²/year without LED
  enhancedYield: number; // kg/m²/year with LED
  yieldIncrease: number; // percentage
  additionalYield: number; // kg/m²
}

interface FinancialInputs {
  cropPrice: number; // $/kg
  electricityCost: number; // $/kWh
  gasCost: number; // $/m³
  variableCosts: number; // $/m²/year (packaging, freight, marketing)
  discountRate: number; // % for NPV
  loanInterestRate: number; // %
  loanTerm: number; // years
}

interface LightingSystem {
  wattagePerM2: number;
  systemEfficiency: number; // %
  ppfPerWatt: number; // μmol/s/W
  costPerM2: number; // equipment cost
  installationCostPerM2: number;
  lifetime: number; // years
  annualMaintenance: number; // % of initial cost
}

interface SeasonalPricing {
  winter: number; // $/kg
  summer: number; // $/kg
  winterMonths: number;
  summerMonths: number;
}

export function AdvancedROICalculator() {
  // State for inputs
  const [growArea, setGrowArea] = useState(880); // m²
  const [cropType, setCropType] = useState('tomato');
  
  const [production, setProduction] = useState<ProductionMetrics>({
    baseYield: 70,
    enhancedYield: 84.18,
    yieldIncrease: 20.26,
    additionalYield: 14.18
  });
  
  const [financial, setFinancial] = useState<FinancialInputs>({
    cropPrice: 2.63,
    electricityCost: 0.13,
    gasCost: 0.12,
    variableCosts: 35.61,
    discountRate: 3,
    loanInterestRate: 5,
    loanTerm: 5
  });
  
  const [lighting, setLighting] = useState<LightingSystem>({
    wattagePerM2: 64.5,
    systemEfficiency: 98,
    ppfPerWatt: 2.7,
    costPerM2: 160,
    installationCostPerM2: 24,
    lifetime: 8.84,
    annualMaintenance: 2
  });
  
  const [seasonal, setSeasonal] = useState<SeasonalPricing>({
    winter: 3.30,
    summer: 1.55,
    winterMonths: 6,
    summerMonths: 6
  });
  
  const [useSeasonalPricing, setUseSeasonalPricing] = useState(true);
  const [financingOption, setFinancingOption] = useState<'cash' | 'loan'>('cash');
  
  // Calculations
  const calculateLightMetrics = () => {
    const actualWattage = lighting.wattagePerM2 / (lighting.systemEfficiency / 100);
    const totalPPF = lighting.wattagePerM2 * lighting.ppfPerWatt;
    const annualMols = totalPPF * 3600 * 12 * 365 / 1000000; // 12hr photoperiod
    const dli = totalPPF * 0.0432; // Daily Light Integral
    
    return { actualWattage, totalPPF, annualMols, dli };
  };
  
  const calculateRevenue = () => {
    const additionalProduction = production.additionalYield * growArea;
    
    let annualRevenue: number;
    if (useSeasonalPricing) {
      const winterProduction = additionalProduction * (seasonal.winterMonths / 12);
      const summerProduction = additionalProduction * (seasonal.summerMonths / 12);
      annualRevenue = (winterProduction * seasonal.winter) + (summerProduction * seasonal.summer);
    } else {
      annualRevenue = additionalProduction * financial.cropPrice;
    }
    
    const backToFarmRevenue = annualRevenue - (financial.variableCosts * growArea);
    
    return { annualRevenue, backToFarmRevenue, additionalProduction };
  };
  
  const calculateCosts = () => {
    const { actualWattage } = calculateLightMetrics();
    const annualElectricity = actualWattage * growArea * 12 * 365 / 1000; // kWh
    const electricityCost = annualElectricity * financial.electricityCost;
    
    // Gas savings from LED heat (approx 30% of electrical input)
    const heatOutput = lighting.wattagePerM2 * 0.3 * growArea * 12 * 365 / 1000; // kWh
    const gasSavings = (heatOutput / 10.55) * financial.gasCost; // Convert to m³
    
    const netOperatingCost = electricityCost - gasSavings;
    const maintenanceCost = (lighting.costPerM2 + lighting.installationCostPerM2) * growArea * (lighting.annualMaintenance / 100);
    
    return { electricityCost, gasSavings, netOperatingCost, maintenanceCost, annualElectricity };
  };
  
  const calculateInvestment = () => {
    const equipmentCost = lighting.costPerM2 * growArea;
    const installationCost = lighting.installationCostPerM2 * growArea;
    const totalInvestment = equipmentCost + installationCost;
    
    return { equipmentCost, installationCost, totalInvestment };
  };
  
  const calculateFinancials = () => {
    const { backToFarmRevenue } = calculateRevenue();
    const { netOperatingCost, maintenanceCost } = calculateCosts();
    const { totalInvestment } = calculateInvestment();
    
    const annualCashFlow = backToFarmRevenue - netOperatingCost - maintenanceCost;
    const simplePayback = totalInvestment / annualCashFlow;
    
    // NPV calculation
    let npv = -totalInvestment;
    for (let year = 1; year <= 10; year++) {
      const discountFactor = Math.pow(1 + financial.discountRate / 100, -year);
      npv += annualCashFlow * discountFactor;
    }
    
    // IRR approximation
    let irr = 0;
    if (annualCashFlow > 0) {
      // Using simplified IRR calculation
      irr = (annualCashFlow / totalInvestment) * 100;
    }
    
    return { annualCashFlow, simplePayback, npv, irr };
  };
  
  // Generate 10-year projection
  const generate10YearProjection = () => {
    const { backToFarmRevenue } = calculateRevenue();
    const { netOperatingCost, maintenanceCost } = calculateCosts();
    const { totalInvestment } = calculateInvestment();
    
    const projection = [];
    let cumulativeCashFlow = -totalInvestment;
    
    for (let year = 0; year <= 10; year++) {
      const revenue = year === 0 ? 0 : backToFarmRevenue;
      const opCost = year === 0 ? 0 : netOperatingCost;
      const maintenance = year === 0 ? 0 : maintenanceCost;
      const yearCashFlow = year === 0 ? -totalInvestment : revenue - opCost - maintenance;
      cumulativeCashFlow += yearCashFlow;
      
      projection.push({
        year,
        revenue,
        operatingCost: opCost,
        maintenanceCost: maintenance,
        cashFlow: yearCashFlow,
        cumulativeCashFlow
      });
    }
    
    return projection;
  };

  const lightMetrics = calculateLightMetrics();
  const revenue = calculateRevenue();
  const costs = calculateCosts();
  const investment = calculateInvestment();
  const financials = calculateFinancials();
  const projection = generate10YearProjection();

  // Export to Excel function
  const exportToExcel = () => {
    const data = [
      ['Advanced ROI Calculator - Analysis Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['PRODUCTION PARAMETERS'],
      ['Crop Type:', cropType],
      ['Growing Area (m²):', growArea],
      ['Base Yield (kg/m²/year):', production.baseYield],
      ['Enhanced Yield (kg/m²/year):', production.enhancedYield],
      ['Yield Increase (%):', production.yieldIncrease.toFixed(2)],
      ['Additional Yield (kg/m²):', production.additionalYield.toFixed(2)],
      [''],
      ['LIGHTING SYSTEM'],
      ['Power Density (W/m²):', lighting.wattagePerM2],
      ['System Efficiency (%):', lighting.systemEfficiency],
      ['Efficacy (μmol/J):', lighting.ppfPerWatt],
      ['Equipment Cost ($/m²):', lighting.costPerM2],
      ['Installation Cost ($/m²):', lighting.installationCostPerM2],
      ['Total PPF (μmol/s/m²):', lightMetrics.totalPPF.toFixed(0)],
      ['DLI (mol/m²/day):', lightMetrics.dli.toFixed(1)],
      [''],
      ['FINANCIAL PARAMETERS'],
      useSeasonalPricing ? ['Winter Price ($/kg):', seasonal.winter] : ['Average Price ($/kg):', financial.cropPrice],
      ...(useSeasonalPricing ? [['Summer Price ($/kg):', seasonal.summer]] : []),
      ['Electricity Cost ($/kWh):', financial.electricityCost],
      ['Gas Cost ($/m³):', financial.gasCost],
      ['Variable Costs ($/m²/year):', financial.variableCosts],
      [''],
      ['INVESTMENT ANALYSIS'],
      ['Equipment Cost ($):', investment.equipmentCost],
      ['Installation Cost ($):', investment.installationCost],
      ['Total Investment ($):', investment.totalInvestment],
      [''],
      ['REVENUE & COSTS'],
      ['Annual Revenue ($):', revenue.annualRevenue],
      ['Back-to-Farm Revenue ($):', revenue.backToFarmRevenue],
      ['Additional Production (kg/year):', revenue.additionalProduction],
      ['Electricity Cost ($):', costs.electricityCost],
      ['Gas Savings ($):', costs.gasSavings],
      ['Net Operating Cost ($):', costs.netOperatingCost],
      ['Maintenance Cost ($):', costs.maintenanceCost],
      [''],
      ['FINANCIAL METRICS'],
      ['Annual Cash Flow ($):', financials.annualCashFlow],
      ['Simple Payback (years):', financials.simplePayback.toFixed(2)],
      ['10-Year NPV ($):', financials.npv],
      ['IRR (%):', financials.irr.toFixed(2)],
      [''],
      ['10-YEAR CASH FLOW PROJECTION'],
      ['Year', 'Revenue ($)', 'Operating Cost ($)', 'Maintenance ($)', 'Cash Flow ($)', 'Cumulative ($)'],
      ...projection.map(year => [
        year.year,
        year.revenue,
        year.operatingCost,
        year.maintenanceCost,
        year.cashFlow,
        year.cumulativeCashFlow
      ])
    ];

    // Convert to CSV format
    const csv = data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ROI_Analysis_${cropType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl shadow-lg shadow-green-500/20 mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Advanced ROI Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Calculate return on investment for supplemental LED lighting in controlled environment agriculture
        </p>
      </div>

      {/* Input Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Production Parameters */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-400" />
            Production Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="tomato">Tomato</option>
                <option value="cucumber">Cucumber</option>
                <option value="pepper">Pepper</option>
                <option value="lettuce">Lettuce</option>
                <option value="cannabis">Cannabis</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Growing Area (m²)</label>
              <input
                type="number"
                value={growArea}
                onChange={(e) => setGrowArea(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Base Yield (kg/m²/year)</label>
              <input
                type="number"
                value={production.baseYield}
                onChange={(e) => setProduction({...production, baseYield: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Enhanced Yield (kg/m²/year)</label>
              <input
                type="number"
                value={production.enhancedYield}
                onChange={(e) => {
                  const enhanced = Number(e.target.value);
                  const increase = ((enhanced - production.baseYield) / production.baseYield) * 100;
                  setProduction({
                    ...production,
                    enhancedYield: enhanced,
                    yieldIncrease: increase,
                    additionalYield: enhanced - production.baseYield
                  });
                }}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-400">
                Yield Increase: {production.yieldIncrease.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                +{production.additionalYield.toFixed(1)} kg/m²/year
              </p>
            </div>
          </div>
        </div>

        {/* Lighting System */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            Lighting System
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Power Density (W/m²)</label>
              <input
                type="number"
                value={lighting.wattagePerM2}
                onChange={(e) => setLighting({...lighting, wattagePerM2: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">System Efficiency (%)</label>
              <input
                type="number"
                value={lighting.systemEfficiency}
                onChange={(e) => setLighting({...lighting, systemEfficiency: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Efficacy (μmol/J)</label>
              <input
                type="number"
                step="0.1"
                value={lighting.ppfPerWatt}
                onChange={(e) => setLighting({...lighting, ppfPerWatt: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Equipment Cost ($/m²)</label>
              <input
                type="number"
                value={lighting.costPerM2}
                onChange={(e) => setLighting({...lighting, costPerM2: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-sm text-yellow-400">
                Total PPF: {lightMetrics.totalPPF.toFixed(0)} μmol/s/m²
              </p>
              <p className="text-xs text-gray-400 mt-1">
                DLI: {lightMetrics.dli.toFixed(1)} mol/m²/day
              </p>
            </div>
          </div>
        </div>

        {/* Financial Parameters */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Financial Parameters
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="seasonal"
                checked={useSeasonalPricing}
                onChange={(e) => setUseSeasonalPricing(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
              />
              <label htmlFor="seasonal" className="text-sm text-gray-300">
                Use Seasonal Pricing
              </label>
            </div>
            
            {useSeasonalPricing ? (
              <>
                <div>
                  <label className="text-sm text-gray-400">Winter Price ($/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={seasonal.winter}
                    onChange={(e) => setSeasonal({...seasonal, winter: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Summer Price ($/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={seasonal.summer}
                    onChange={(e) => setSeasonal({...seasonal, summer: Number(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm text-gray-400">Average Price ($/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={financial.cropPrice}
                  onChange={(e) => setFinancial({...financial, cropPrice: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-400">Electricity Cost ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={financial.electricityCost}
                onChange={(e) => setFinancial({...financial, electricityCost: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Gas Cost ($/m³)</label>
              <input
                type="number"
                step="0.01"
                value={financial.gasCost}
                onChange={(e) => setFinancial({...financial, gasCost: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-400">Annual Revenue</p>
          </div>
          <p className="text-3xl font-bold text-white">${revenue.annualRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            +{revenue.additionalProduction.toFixed(0)} kg/year
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">Operating Cost</p>
          </div>
          <p className="text-3xl font-bold text-white">${costs.netOperatingCost.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {costs.annualElectricity.toFixed(0)} kWh/year
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400">Simple Payback</p>
          </div>
          <p className="text-3xl font-bold text-white">{financials.simplePayback.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">years</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-400">10-Year NPV</p>
          </div>
          <p className="text-3xl font-bold text-white">${financials.npv.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            IRR: {financials.irr.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Investment Breakdown */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Investment Analysis</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Equipment Cost</span>
              <span className="text-white font-medium">${investment.equipmentCost.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Installation Cost</span>
              <span className="text-white font-medium">${investment.installationCost.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <span className="text-green-400 font-medium">Total Investment</span>
              <span className="text-white font-bold">${investment.totalInvestment.toLocaleString()}</span>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-400 mb-2">
                <Info className="w-4 h-4 inline mr-1" />
                Annual Cash Flow
              </p>
              <p className="text-2xl font-bold text-white">
                ${financials.annualCashFlow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 10-Year Projection Chart */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">10-Year Cash Flow Projection</h3>
          
          <div className="space-y-2">
            {projection.slice(0, 6).map((year) => (
              <div key={year.year} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-16">Year {year.year}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
                  {year.cumulativeCashFlow > 0 && (
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                      style={{ width: `${Math.min((year.cumulativeCashFlow / investment.totalInvestment) * 100, 100)}%` }}
                    />
                  )}
                </div>
                <span className={`text-sm font-medium ${year.cumulativeCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${year.cumulativeCashFlow.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-3">
            <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Detailed Report
            </button>
            <button 
              onClick={exportToExcel}
              className="flex-1 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}