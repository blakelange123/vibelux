'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Leaf, 
  Droplets, 
  Users, 
  Wrench, 
  DollarSign,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Thermometer,
  BarChart3,
  Beaker,
  Shield,
  Bug,
  Package,
  Database,
  Grid3x3,
  Cpu,
  TrendingUp
} from 'lucide-react';
import { BaselineMetrics } from '@/lib/revenue-sharing-baseline';

interface BaselineDataCaptureProps {
  onComplete: (metrics: BaselineMetrics) => void;
  onCancel: () => void;
}

export function BaselineDataCapture({ onComplete, onCancel }: BaselineDataCaptureProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 15;
  
  // Initialize comprehensive baseline data
  const [baselineData, setBaselineData] = useState<BaselineMetrics>({
    energy: {
      totalKwh: 0,
      peakDemandKw: 0,
      avgCostPerKwh: 0.12,
      peakRateCostPerKwh: 0.18,
      offPeakRateCostPerKwh: 0.08,
      totalEnergyCost: 0,
      powerFactor: 0.9,
      monthlyDemandCharges: 0,
      lightingKwh: 0,
      hvacKwh: 0,
      otherKwh: 0
    },
    production: {
      totalYield: 0,
      yieldPerSqFt: 0,
      yieldPerPlant: 0,
      gradeAPercentage: 70,
      gradeBPercentage: 25,
      wastePercentage: 5,
      averageCycleTime: 0,
      plantsPerCycle: 0,
      cyclesPerYear: 0,
      harvestEfficiency: 85
    },
    environmental: {
      temperature: {
        avg: 72,
        min: 68,
        max: 78,
        outOfRangeHours: 0
      },
      humidity: {
        avg: 60,
        min: 50,
        max: 70,
        outOfRangeHours: 0
      },
      co2: {
        avg: 1200,
        min: 800,
        max: 1500,
        enrichmentCost: 0
      },
      vpd: {
        avg: 1.2,
        min: 0.8,
        max: 1.6,
        optimalHours: 0
      },
      lighting: {
        photoperiodHours: 18,
        averagePPFD: 650,
        averageDLI: 42,
        spectrumEfficiency: 2.7
      }
    },
    waterNutrients: {
      totalWaterUsage: 0,
      waterCostPerGallon: 0.005,
      runoffPercentage: 20,
      nutrientCostPerMonth: 0,
      ecAverage: 1.8,
      phAverage: 6.0,
      dossingAccuracy: 90
    },
    labor: {
      totalMonthlyHours: 0,
      hourlyRate: 20,
      overtimeHours: 0,
      tasksPerHour: 0,
      harvestHoursPerPound: 0,
      maintenanceHours: 0
    },
    equipment: {
      lightingFixtures: {
        count: 0,
        avgAge: 0,
        failureRate: 0,
        maintenanceCostPerYear: 0
      },
      hvac: {
        units: 0,
        avgEfficiency: 0,
        maintenanceCostPerYear: 0,
        breakdownsPerYear: 0
      },
      otherEquipment: {
        totalValue: 0,
        avgDowntimeHours: 0,
        repairCostsPerYear: 0
      }
    },
    financial: {
      totalOperationalCost: 0,
      costPerPound: 0,
      revenuePerPound: 0,
      grossMargin: 0,
      ebitda: 0
    },
    quality: {
      thcAverage: 0,
      cbdAverage: 0,
      terpeneAverage: 0,
      microbialFailRate: 0,
      pesticideFailRate: 0,
      shelfLife: 7,
      customerComplaints: 0
    },
    compliance: {
      testingCostsPerMonth: 0,
      retestingFrequency: 0,
      complianceViolationsPerYear: 0,
      complianceFinesPerYear: 0,
      certificationCosts: 0,
      auditHoursPerMonth: 0
    },
    pestDisease: {
      pestIncidentsPerMonth: 0,
      diseaseIncidentsPerMonth: 0,
      pestControlCostPerMonth: 0,
      cropLossFromPestsDiseasePercent: 0,
      preventativeTreatmentCost: 0,
      ipmLaborHours: 0
    },
    inventory: {
      inventoryTurnoverRate: 0,
      stockoutEventsPerMonth: 0,
      excessInventoryValue: 0,
      supplierLeadTime: 0,
      rushOrderPremiumsPerMonth: 0,
      inventoryCarryingCostPercent: 0,
      shrinkagePercent: 0
    },
    dataManagement: {
      manualDataEntryHoursPerMonth: 0,
      reportGenerationHoursPerMonth: 0,
      dataErrorsPerMonth: 0,
      decisionDelayDays: 0,
      missedOptimizationOpportunities: 0
    },
    spaceUtilization: {
      totalSquareFeet: 0,
      productiveSquareFeet: 0,
      utilizationPercent: 0,
      rentPerSquareFoot: 0,
      unproductiveSpaceCost: 0,
      expansionConstraints: false
    },
    technology: {
      numberOfSystems: 0,
      integrationIssuesPerMonth: 0,
      systemDowntimeHours: 0,
      manualDataTransferHours: 0,
      licenseFeesPerMonth: 0,
      itSupportHoursPerMonth: 0
    },
    marketTiming: {
      averageSellingPrice: 0,
      priceVolatilityPercent: 0,
      salesCycleTime: 0,
      inventoryAgeAtSale: 0,
      discountsGivenPercent: 0,
      contractVsSpotSalesRatio: 0
    }
  });

  const updateData = (category: string, field: string, value: any) => {
    setBaselineData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof BaselineMetrics],
        [field]: value
      }
    }));
  };

  const updateNestedData = (category: string, subcategory: string, field: string, value: any) => {
    setBaselineData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof BaselineMetrics],
        [subcategory]: {
          ...(prev[category as keyof BaselineMetrics] as any)[subcategory],
          [field]: value
        }
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(baselineData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { icon: Zap, label: 'Energy Usage', color: 'text-yellow-400' },
    { icon: Leaf, label: 'Production', color: 'text-green-400' },
    { icon: Thermometer, label: 'Environment', color: 'text-blue-400' },
    { icon: Droplets, label: 'Water & Nutrients', color: 'text-cyan-400' },
    { icon: Users, label: 'Labor', color: 'text-purple-400' },
    { icon: Wrench, label: 'Equipment', color: 'text-orange-400' },
    { icon: DollarSign, label: 'Financial', color: 'text-green-400' },
    { icon: Beaker, label: 'Quality', color: 'text-pink-400' },
    { icon: Shield, label: 'Compliance', color: 'text-red-400' },
    { icon: Bug, label: 'Pest & Disease', color: 'text-amber-400' },
    { icon: Package, label: 'Inventory', color: 'text-indigo-400' },
    { icon: Database, label: 'Data Management', color: 'text-gray-400' },
    { icon: Grid3x3, label: 'Space Utilization', color: 'text-teal-400' },
    { icon: Cpu, label: 'Technology', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'Market Timing', color: 'text-emerald-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Comprehensive Baseline Data Capture</CardTitle>
          <CardDescription className="text-gray-400">
            Step {currentStep} of {totalSteps} - {steps[currentStep - 1].label}
          </CardDescription>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index + 1 === currentStep;
              const isCompleted = index + 1 < currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-purple-600' : isCompleted ? 'bg-green-600' : 'bg-gray-800'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : step.color}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Energy Usage & Costs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Total Monthly kWh</Label>
                    <Input
                      type="number"
                      value={baselineData.energy.totalKwh}
                      onChange={(e) => updateData('energy', 'totalKwh', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Peak Demand (kW)</Label>
                    <Input
                      type="number"
                      value={baselineData.energy.peakDemandKw}
                      onChange={(e) => updateData('energy', 'peakDemandKw', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average Cost per kWh ($)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={baselineData.energy.avgCostPerKwh}
                      onChange={(e) => updateData('energy', 'avgCostPerKwh', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Peak Rate Cost per kWh ($)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={baselineData.energy.peakRateCostPerKwh}
                      onChange={(e) => updateData('energy', 'peakRateCostPerKwh', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Power Factor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={baselineData.energy.powerFactor}
                      onChange={(e) => updateData('energy', 'powerFactor', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Monthly Demand Charges ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.energy.monthlyDemandCharges}
                      onChange={(e) => updateData('energy', 'monthlyDemandCharges', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Lighting kWh</Label>
                    <Input
                      type="number"
                      value={baselineData.energy.lightingKwh}
                      onChange={(e) => updateData('energy', 'lightingKwh', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">HVAC kWh</Label>
                    <Input
                      type="number"
                      value={baselineData.energy.hvacKwh}
                      onChange={(e) => updateData('energy', 'hvacKwh', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Production Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Total Monthly Yield (lbs)</Label>
                    <Input
                      type="number"
                      value={baselineData.production.totalYield}
                      onChange={(e) => updateData('production', 'totalYield', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Yield per Sq Ft (lbs)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={baselineData.production.yieldPerSqFt}
                      onChange={(e) => updateData('production', 'yieldPerSqFt', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Grade A Percentage (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.production.gradeAPercentage}
                      onChange={(e) => updateData('production', 'gradeAPercentage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Waste Percentage (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.production.wastePercentage}
                      onChange={(e) => updateData('production', 'wastePercentage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average Cycle Time (days)</Label>
                    <Input
                      type="number"
                      value={baselineData.production.averageCycleTime}
                      onChange={(e) => updateData('production', 'averageCycleTime', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Plants per Cycle</Label>
                    <Input
                      type="number"
                      value={baselineData.production.plantsPerCycle}
                      onChange={(e) => updateData('production', 'plantsPerCycle', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Environmental Conditions</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold text-gray-300 mb-3">Temperature (°F)</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-400">Average</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.temperature.avg}
                          onChange={(e) => updateNestedData('environmental', 'temperature', 'avg', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Min</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.temperature.min}
                          onChange={(e) => updateNestedData('environmental', 'temperature', 'min', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Max</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.temperature.max}
                          onChange={(e) => updateNestedData('environmental', 'temperature', 'max', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Out of Range Hours/Month</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.temperature.outOfRangeHours}
                          onChange={(e) => updateNestedData('environmental', 'temperature', 'outOfRangeHours', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-300 mb-3">Lighting</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-400">Photoperiod (hours/day)</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.lighting.photoperiodHours}
                          onChange={(e) => updateNestedData('environmental', 'lighting', 'photoperiodHours', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Average PPFD (μmol/m²/s)</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.lighting.averagePPFD}
                          onChange={(e) => updateNestedData('environmental', 'lighting', 'averagePPFD', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Average DLI (mol/m²/day)</Label>
                        <Input
                          type="number"
                          value={baselineData.environmental.lighting.averageDLI}
                          onChange={(e) => updateNestedData('environmental', 'lighting', 'averageDLI', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Efficiency (μmol/J)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={baselineData.environmental.lighting.spectrumEfficiency}
                          onChange={(e) => updateNestedData('environmental', 'lighting', 'spectrumEfficiency', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Water & Nutrient Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Total Monthly Water Usage (gallons)</Label>
                    <Input
                      type="number"
                      value={baselineData.waterNutrients.totalWaterUsage}
                      onChange={(e) => updateData('waterNutrients', 'totalWaterUsage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Water Cost per Gallon ($)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={baselineData.waterNutrients.waterCostPerGallon}
                      onChange={(e) => updateData('waterNutrients', 'waterCostPerGallon', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Runoff Percentage (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.waterNutrients.runoffPercentage}
                      onChange={(e) => updateData('waterNutrients', 'runoffPercentage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Monthly Nutrient Cost ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.waterNutrients.nutrientCostPerMonth}
                      onChange={(e) => updateData('waterNutrients', 'nutrientCostPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average EC</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.waterNutrients.ecAverage}
                      onChange={(e) => updateData('waterNutrients', 'ecAverage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average pH</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.waterNutrients.phAverage}
                      onChange={(e) => updateData('waterNutrients', 'phAverage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 5 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Labor Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Total Monthly Hours</Label>
                    <Input
                      type="number"
                      value={baselineData.labor.totalMonthlyHours}
                      onChange={(e) => updateData('labor', 'totalMonthlyHours', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.labor.hourlyRate}
                      onChange={(e) => updateData('labor', 'hourlyRate', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Monthly Overtime Hours</Label>
                    <Input
                      type="number"
                      value={baselineData.labor.overtimeHours}
                      onChange={(e) => updateData('labor', 'overtimeHours', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Harvest Hours per Pound</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.labor.harvestHoursPerPound}
                      onChange={(e) => updateData('labor', 'harvestHoursPerPound', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Monthly Maintenance Hours</Label>
                    <Input
                      type="number"
                      value={baselineData.labor.maintenanceHours}
                      onChange={(e) => updateData('labor', 'maintenanceHours', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Tasks per Hour</Label>
                    <Input
                      type="number"
                      value={baselineData.labor.tasksPerHour}
                      onChange={(e) => updateData('labor', 'tasksPerHour', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 6 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Equipment & Maintenance</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold text-gray-300 mb-3">Lighting Fixtures</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Number of Fixtures</Label>
                        <Input
                          type="number"
                          value={baselineData.equipment.lightingFixtures.count}
                          onChange={(e) => updateNestedData('equipment', 'lightingFixtures', 'count', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Average Age (years)</Label>
                        <Input
                          type="number"
                          value={baselineData.equipment.lightingFixtures.avgAge}
                          onChange={(e) => updateNestedData('equipment', 'lightingFixtures', 'avgAge', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-300 mb-3">HVAC Systems</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Number of Units</Label>
                        <Input
                          type="number"
                          value={baselineData.equipment.hvac.units}
                          onChange={(e) => updateNestedData('equipment', 'hvac', 'units', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Annual Maintenance Cost ($)</Label>
                        <Input
                          type="number"
                          value={baselineData.equipment.hvac.maintenanceCostPerYear}
                          onChange={(e) => updateNestedData('equipment', 'hvac', 'maintenanceCostPerYear', parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 7 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Total Monthly Operational Cost ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.financial.totalOperationalCost}
                      onChange={(e) => updateData('financial', 'totalOperationalCost', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Cost per Pound ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.financial.costPerPound}
                      onChange={(e) => updateData('financial', 'costPerPound', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Revenue per Pound ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.financial.revenuePerPound}
                      onChange={(e) => updateData('financial', 'revenuePerPound', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Gross Margin (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.financial.grossMargin}
                      onChange={(e) => updateData('financial', 'grossMargin', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 8 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Quality Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Average THC (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.quality.thcAverage}
                      onChange={(e) => updateData('quality', 'thcAverage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average CBD (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.quality.cbdAverage}
                      onChange={(e) => updateData('quality', 'cbdAverage', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Microbial Fail Rate (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.quality.microbialFailRate}
                      onChange={(e) => updateData('quality', 'microbialFailRate', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Pesticide Fail Rate (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.quality.pesticideFailRate}
                      onChange={(e) => updateData('quality', 'pesticideFailRate', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Average Shelf Life (days)</Label>
                    <Input
                      type="number"
                      value={baselineData.quality.shelfLife}
                      onChange={(e) => updateData('quality', 'shelfLife', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Monthly Customer Complaints</Label>
                    <Input
                      type="number"
                      value={baselineData.quality.customerComplaints}
                      onChange={(e) => updateData('quality', 'customerComplaints', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 9 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Compliance & Testing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Monthly Testing Costs ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.compliance.testingCostsPerMonth}
                      onChange={(e) => updateData('compliance', 'testingCostsPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Retesting Frequency (per month)</Label>
                    <Input
                      type="number"
                      value={baselineData.compliance.retestingFrequency}
                      onChange={(e) => updateData('compliance', 'retestingFrequency', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Compliance Violations (per year)</Label>
                    <Input
                      type="number"
                      value={baselineData.compliance.complianceViolationsPerYear}
                      onChange={(e) => updateData('compliance', 'complianceViolationsPerYear', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Compliance Fines ($ per year)</Label>
                    <Input
                      type="number"
                      value={baselineData.compliance.complianceFinesPerYear}
                      onChange={(e) => updateData('compliance', 'complianceFinesPerYear', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Annual Certification Costs ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.compliance.certificationCosts}
                      onChange={(e) => updateData('compliance', 'certificationCosts', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Audit Hours per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.compliance.auditHoursPerMonth}
                      onChange={(e) => updateData('compliance', 'auditHoursPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 10 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Pest & Disease Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Pest Incidents per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.pestDisease.pestIncidentsPerMonth}
                      onChange={(e) => updateData('pestDisease', 'pestIncidentsPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Disease Incidents per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.pestDisease.diseaseIncidentsPerMonth}
                      onChange={(e) => updateData('pestDisease', 'diseaseIncidentsPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Monthly Pest Control Cost ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.pestDisease.pestControlCostPerMonth}
                      onChange={(e) => updateData('pestDisease', 'pestControlCostPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Crop Loss from Pests/Disease (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.pestDisease.cropLossFromPestsDiseasePercent}
                      onChange={(e) => updateData('pestDisease', 'cropLossFromPestsDiseasePercent', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Preventative Treatment Cost ($/month)</Label>
                    <Input
                      type="number"
                      value={baselineData.pestDisease.preventativeTreatmentCost}
                      onChange={(e) => updateData('pestDisease', 'preventativeTreatmentCost', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">IPM Labor Hours per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.pestDisease.ipmLaborHours}
                      onChange={(e) => updateData('pestDisease', 'ipmLaborHours', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 11 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Inventory & Supply Chain</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Inventory Turnover Rate</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.inventory.inventoryTurnoverRate}
                      onChange={(e) => updateData('inventory', 'inventoryTurnoverRate', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Stockout Events per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.inventory.stockoutEventsPerMonth}
                      onChange={(e) => updateData('inventory', 'stockoutEventsPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Excess Inventory Value ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.inventory.excessInventoryValue}
                      onChange={(e) => updateData('inventory', 'excessInventoryValue', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Supplier Lead Time (days)</Label>
                    <Input
                      type="number"
                      value={baselineData.inventory.supplierLeadTime}
                      onChange={(e) => updateData('inventory', 'supplierLeadTime', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Rush Order Premiums ($/month)</Label>
                    <Input
                      type="number"
                      value={baselineData.inventory.rushOrderPremiumsPerMonth}
                      onChange={(e) => updateData('inventory', 'rushOrderPremiumsPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Inventory Carrying Cost (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.inventory.inventoryCarryingCostPercent}
                      onChange={(e) => updateData('inventory', 'inventoryCarryingCostPercent', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Shrinkage (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={baselineData.inventory.shrinkagePercent}
                      onChange={(e) => updateData('inventory', 'shrinkagePercent', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 12 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Data & Reporting</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Manual Data Entry Hours/Month</Label>
                    <Input
                      type="number"
                      value={baselineData.dataManagement.manualDataEntryHoursPerMonth}
                      onChange={(e) => updateData('dataManagement', 'manualDataEntryHoursPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Report Generation Hours/Month</Label>
                    <Input
                      type="number"
                      value={baselineData.dataManagement.reportGenerationHoursPerMonth}
                      onChange={(e) => updateData('dataManagement', 'reportGenerationHoursPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Data Errors per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.dataManagement.dataErrorsPerMonth}
                      onChange={(e) => updateData('dataManagement', 'dataErrorsPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Decision Delay (days)</Label>
                    <Input
                      type="number"
                      value={baselineData.dataManagement.decisionDelayDays}
                      onChange={(e) => updateData('dataManagement', 'decisionDelayDays', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Missed Optimization Opportunities</Label>
                    <Input
                      type="number"
                      value={baselineData.dataManagement.missedOptimizationOpportunities}
                      onChange={(e) => updateData('dataManagement', 'missedOptimizationOpportunities', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 13 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Space Utilization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Total Square Feet</Label>
                    <Input
                      type="number"
                      value={baselineData.spaceUtilization.totalSquareFeet}
                      onChange={(e) => updateData('spaceUtilization', 'totalSquareFeet', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Productive Square Feet</Label>
                    <Input
                      type="number"
                      value={baselineData.spaceUtilization.productiveSquareFeet}
                      onChange={(e) => updateData('spaceUtilization', 'productiveSquareFeet', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Utilization Percent (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.spaceUtilization.utilizationPercent}
                      onChange={(e) => updateData('spaceUtilization', 'utilizationPercent', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Rent per Square Foot ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={baselineData.spaceUtilization.rentPerSquareFoot}
                      onChange={(e) => updateData('spaceUtilization', 'rentPerSquareFoot', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Unproductive Space Cost ($/month)</Label>
                    <Input
                      type="number"
                      value={baselineData.spaceUtilization.unproductiveSpaceCost}
                      onChange={(e) => updateData('spaceUtilization', 'unproductiveSpaceCost', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="expansionConstraints"
                      checked={baselineData.spaceUtilization.expansionConstraints}
                      onChange={(e) => updateData('spaceUtilization', 'expansionConstraints', e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="expansionConstraints" className="text-gray-400">Has Expansion Constraints</Label>
                  </div>
                </div>
              </>
            )}

            {currentStep === 14 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Technology Stack</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Number of Systems</Label>
                    <Input
                      type="number"
                      value={baselineData.technology.numberOfSystems}
                      onChange={(e) => updateData('technology', 'numberOfSystems', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Integration Issues per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.technology.integrationIssuesPerMonth}
                      onChange={(e) => updateData('technology', 'integrationIssuesPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">System Downtime Hours/Month</Label>
                    <Input
                      type="number"
                      value={baselineData.technology.systemDowntimeHours}
                      onChange={(e) => updateData('technology', 'systemDowntimeHours', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Manual Data Transfer Hours/Month</Label>
                    <Input
                      type="number"
                      value={baselineData.technology.manualDataTransferHours}
                      onChange={(e) => updateData('technology', 'manualDataTransferHours', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">License Fees per Month ($)</Label>
                    <Input
                      type="number"
                      value={baselineData.technology.licenseFeesPerMonth}
                      onChange={(e) => updateData('technology', 'licenseFeesPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">IT Support Hours per Month</Label>
                    <Input
                      type="number"
                      value={baselineData.technology.itSupportHoursPerMonth}
                      onChange={(e) => updateData('technology', 'itSupportHoursPerMonth', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 15 && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Market Timing & Sales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Average Selling Price ($/lb)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={baselineData.marketTiming.averageSellingPrice}
                      onChange={(e) => updateData('marketTiming', 'averageSellingPrice', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Price Volatility (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.marketTiming.priceVolatilityPercent}
                      onChange={(e) => updateData('marketTiming', 'priceVolatilityPercent', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Sales Cycle Time (days)</Label>
                    <Input
                      type="number"
                      value={baselineData.marketTiming.salesCycleTime}
                      onChange={(e) => updateData('marketTiming', 'salesCycleTime', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Inventory Age at Sale (days)</Label>
                    <Input
                      type="number"
                      value={baselineData.marketTiming.inventoryAgeAtSale}
                      onChange={(e) => updateData('marketTiming', 'inventoryAgeAtSale', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Discounts Given (%)</Label>
                    <Input
                      type="number"
                      value={baselineData.marketTiming.discountsGivenPercent}
                      onChange={(e) => updateData('marketTiming', 'discountsGivenPercent', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Contract vs Spot Sales Ratio</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={baselineData.marketTiming.contractVsSpotSalesRatio}
                      onChange={(e) => updateData('marketTiming', 'contractVsSpotSalesRatio', parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={currentStep === 1 ? onCancel : handleBack}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {currentStep === totalSteps ? 'Complete Baseline' : 'Next'}
              {currentStep < totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}