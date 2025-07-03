'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Leaf, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  Database,
  Thermometer,
  Droplets,
  Users,
  Wrench
} from 'lucide-react';
import { 
  baselineManager, 
  BaselineMetrics, 
  BaselineRecord, 
  SavingsCalculation 
} from '@/lib/revenue-sharing-baseline';
import { invoiceGenerator } from '@/lib/revenue-sharing-invoice';
import { BaselineDataCapture } from './BaselineDataCapture';

export function RevenueSharingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [baselines, setBaselines] = useState<BaselineRecord[]>([]);
  const [currentBaseline, setCurrentBaseline] = useState<BaselineRecord | null>(null);
  const [savingsCalc, setSavingsCalc] = useState<SavingsCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBaselineCapture, setShowBaselineCapture] = useState(false);

  // Sample facility ID (in production, this would come from auth/context)
  const facilityId = 'facility_001';

  useEffect(() => {
    loadBaselines();
  }, []);

  const loadBaselines = async () => {
    const facilityBaselines = await baselineManager.getFacilityBaselines(facilityId);
    setBaselines(facilityBaselines);
    
    // Set the most recent verified baseline as current
    const verifiedBaseline = facilityBaselines.find(b => b.status === 'verified');
    if (verifiedBaseline) {
      setCurrentBaseline(verifiedBaseline);
    }
  };

  const createNewBaseline = async (metrics: BaselineMetrics) => {
    setLoading(true);
    setShowBaselineCapture(false);
    
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = new Date();

    try {
      const newBaseline = await baselineManager.createBaseline(
        facilityId,
        metrics,
        startDate,
        endDate
      );
      
      await loadBaselines();
      setActiveTab('baseline');
    } catch (error) {
      console.error('Error creating baseline:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyBaseline = async (baselineId: string) => {
    setLoading(true);
    
    try {
      const verified = await baselineManager.verifyBaseline(baselineId, {
        name: 'John Doe',
        email: 'john@example.com',
        ipAddress: '192.168.1.1'
      });
      
      await loadBaselines();
      setCurrentBaseline(verified);
      setActiveTab('overview');
    } catch (error) {
      console.error('Error verifying baseline:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentSavings = async () => {
    if (!currentBaseline) return;
    
    setLoading(true);
    
    // Generate current metrics based on baseline with improvements
    const baseline = currentBaseline.metrics;
    
    // Sample current metrics (showing various improvements)
    const currentMetrics: BaselineMetrics = {
      energy: {
        totalKwh: baseline.energy.totalKwh * 0.8, // 20% reduction
        peakDemandKw: baseline.energy.peakDemandKw * 0.85, // 15% reduction
        avgCostPerKwh: baseline.energy.avgCostPerKwh,
        peakRateCostPerKwh: baseline.energy.peakRateCostPerKwh,
        offPeakRateCostPerKwh: baseline.energy.offPeakRateCostPerKwh,
        totalEnergyCost: baseline.energy.totalEnergyCost * 0.75,
        powerFactor: Math.min(0.99, baseline.energy.powerFactor + 0.05),
        monthlyDemandCharges: baseline.energy.monthlyDemandCharges * 0.8,
        lightingKwh: baseline.energy.lightingKwh * 0.7,
        hvacKwh: baseline.energy.hvacKwh * 0.85,
        otherKwh: baseline.energy.otherKwh * 0.9
      },
      production: {
        totalYield: baseline.production.totalYield * 1.15, // 15% increase
        yieldPerSqFt: baseline.production.yieldPerSqFt * 1.15,
        yieldPerPlant: baseline.production.yieldPerPlant * 1.1,
        gradeAPercentage: Math.min(95, baseline.production.gradeAPercentage + 10),
        gradeBPercentage: Math.max(5, baseline.production.gradeBPercentage - 5),
        wastePercentage: Math.max(0, baseline.production.wastePercentage - 2),
        averageCycleTime: baseline.production.averageCycleTime - 3,
        plantsPerCycle: baseline.production.plantsPerCycle,
        cyclesPerYear: baseline.production.cyclesPerYear + 0.5,
        harvestEfficiency: Math.min(95, baseline.production.harvestEfficiency + 5)
      },
      environmental: {
        temperature: {
          avg: 72,
          min: 70,
          max: 74,
          outOfRangeHours: Math.max(0, baseline.environmental.temperature.outOfRangeHours - 50)
        },
        humidity: {
          avg: 60,
          min: 55,
          max: 65,
          outOfRangeHours: Math.max(0, baseline.environmental.humidity.outOfRangeHours - 30)
        },
        co2: {
          avg: 1200,
          min: 1000,
          max: 1400,
          enrichmentCost: baseline.environmental.co2.enrichmentCost * 0.9
        },
        vpd: {
          avg: 1.2,
          min: 1.0,
          max: 1.4,
          optimalHours: baseline.environmental.vpd.optimalHours + 100
        },
        lighting: {
          photoperiodHours: baseline.environmental.lighting.photoperiodHours,
          averagePPFD: baseline.environmental.lighting.averagePPFD + 50,
          averageDLI: baseline.environmental.lighting.averageDLI + 3,
          spectrumEfficiency: baseline.environmental.lighting.spectrumEfficiency + 0.2
        }
      },
      waterNutrients: {
        totalWaterUsage: baseline.waterNutrients.totalWaterUsage * 0.85,
        waterCostPerGallon: baseline.waterNutrients.waterCostPerGallon,
        runoffPercentage: Math.max(5, baseline.waterNutrients.runoffPercentage - 10),
        nutrientCostPerMonth: baseline.waterNutrients.nutrientCostPerMonth * 0.9,
        ecAverage: 1.8,
        phAverage: 6.0,
        dossingAccuracy: Math.min(98, baseline.waterNutrients.dossingAccuracy + 5)
      },
      labor: {
        totalMonthlyHours: baseline.labor.totalMonthlyHours * 0.9,
        hourlyRate: baseline.labor.hourlyRate,
        overtimeHours: baseline.labor.overtimeHours * 0.5,
        tasksPerHour: baseline.labor.tasksPerHour * 1.2,
        harvestHoursPerPound: baseline.labor.harvestHoursPerPound * 0.8,
        maintenanceHours: baseline.labor.maintenanceHours * 0.85
      },
      equipment: {
        lightingFixtures: {
          count: baseline.equipment.lightingFixtures.count,
          avgAge: baseline.equipment.lightingFixtures.avgAge,
          failureRate: baseline.equipment.lightingFixtures.failureRate * 0.5,
          maintenanceCostPerYear: baseline.equipment.lightingFixtures.maintenanceCostPerYear * 0.7
        },
        hvac: {
          units: baseline.equipment.hvac.units,
          avgEfficiency: baseline.equipment.hvac.avgEfficiency + 10,
          maintenanceCostPerYear: baseline.equipment.hvac.maintenanceCostPerYear * 0.8,
          breakdownsPerYear: Math.max(0, baseline.equipment.hvac.breakdownsPerYear - 2)
        },
        otherEquipment: {
          totalValue: baseline.equipment.otherEquipment.totalValue,
          avgDowntimeHours: baseline.equipment.otherEquipment.avgDowntimeHours * 0.6,
          repairCostsPerYear: baseline.equipment.otherEquipment.repairCostsPerYear * 0.75
        }
      },
      financial: {
        totalOperationalCost: baseline.financial.totalOperationalCost * 0.85,
        costPerPound: baseline.financial.costPerPound * 0.85,
        revenuePerPound: baseline.financial.revenuePerPound * 1.05,
        grossMargin: baseline.financial.grossMargin + 8,
        ebitda: baseline.financial.ebitda * 1.25
      },
      quality: {
        thcAverage: baseline.quality.thcAverage ? baseline.quality.thcAverage + 1 : undefined,
        cbdAverage: baseline.quality.cbdAverage,
        terpeneAverage: baseline.quality.terpeneAverage ? baseline.quality.terpeneAverage + 0.2 : undefined,
        microbialFailRate: Math.max(0, baseline.quality.microbialFailRate - 2),
        pesticideFailRate: Math.max(0, baseline.quality.pesticideFailRate - 1),
        shelfLife: baseline.quality.shelfLife + 2,
        customerComplaints: Math.max(0, baseline.quality.customerComplaints - 3)
      },
      compliance: {
        testingCostsPerMonth: baseline.compliance.testingCostsPerMonth * 0.9,
        retestingFrequency: Math.max(0, baseline.compliance.retestingFrequency - 1),
        complianceViolationsPerYear: Math.max(0, baseline.compliance.complianceViolationsPerYear - 2),
        complianceFinesPerYear: 0,
        certificationCosts: baseline.compliance.certificationCosts,
        auditHoursPerMonth: baseline.compliance.auditHoursPerMonth * 0.7
      },
      pestDisease: {
        pestIncidentsPerMonth: Math.max(0, baseline.pestDisease.pestIncidentsPerMonth - 2),
        diseaseIncidentsPerMonth: Math.max(0, baseline.pestDisease.diseaseIncidentsPerMonth - 1),
        pestControlCostPerMonth: baseline.pestDisease.pestControlCostPerMonth * 0.7,
        cropLossFromPestsDiseasePercent: Math.max(0, baseline.pestDisease.cropLossFromPestsDiseasePercent - 3),
        preventativeTreatmentCost: baseline.pestDisease.preventativeTreatmentCost * 0.8,
        ipmLaborHours: baseline.pestDisease.ipmLaborHours * 0.8
      },
      inventory: {
        inventoryTurnoverRate: baseline.inventory.inventoryTurnoverRate * 1.2,
        stockoutEventsPerMonth: Math.max(0, baseline.inventory.stockoutEventsPerMonth - 2),
        excessInventoryValue: baseline.inventory.excessInventoryValue * 0.6,
        supplierLeadTime: Math.max(1, baseline.inventory.supplierLeadTime - 2),
        rushOrderPremiumsPerMonth: baseline.inventory.rushOrderPremiumsPerMonth * 0.3,
        inventoryCarryingCostPercent: baseline.inventory.inventoryCarryingCostPercent * 0.9,
        shrinkagePercent: Math.max(0, baseline.inventory.shrinkagePercent - 1)
      },
      dataManagement: {
        manualDataEntryHoursPerMonth: baseline.dataManagement.manualDataEntryHoursPerMonth * 0.2,
        reportGenerationHoursPerMonth: baseline.dataManagement.reportGenerationHoursPerMonth * 0.3,
        dataErrorsPerMonth: Math.max(0, baseline.dataManagement.dataErrorsPerMonth - 5),
        decisionDelayDays: Math.max(0, baseline.dataManagement.decisionDelayDays - 2),
        missedOptimizationOpportunities: Math.max(0, baseline.dataManagement.missedOptimizationOpportunities - 3)
      },
      spaceUtilization: {
        totalSquareFeet: baseline.spaceUtilization.totalSquareFeet,
        productiveSquareFeet: baseline.spaceUtilization.productiveSquareFeet * 1.1,
        utilizationPercent: Math.min(95, baseline.spaceUtilization.utilizationPercent + 10),
        rentPerSquareFoot: baseline.spaceUtilization.rentPerSquareFoot,
        unproductiveSpaceCost: baseline.spaceUtilization.unproductiveSpaceCost * 0.5,
        expansionConstraints: baseline.spaceUtilization.expansionConstraints
      },
      technology: {
        numberOfSystems: Math.max(1, baseline.technology.numberOfSystems - 2),
        integrationIssuesPerMonth: Math.max(0, baseline.technology.integrationIssuesPerMonth - 3),
        systemDowntimeHours: baseline.technology.systemDowntimeHours * 0.3,
        manualDataTransferHours: baseline.technology.manualDataTransferHours * 0.1,
        licenseFeesPerMonth: baseline.technology.licenseFeesPerMonth * 0.8,
        itSupportHoursPerMonth: baseline.technology.itSupportHoursPerMonth * 0.6
      },
      marketTiming: {
        averageSellingPrice: baseline.marketTiming.averageSellingPrice * 1.08,
        priceVolatilityPercent: Math.max(5, baseline.marketTiming.priceVolatilityPercent - 10),
        salesCycleTime: Math.max(1, baseline.marketTiming.salesCycleTime - 5),
        inventoryAgeAtSale: Math.max(1, baseline.marketTiming.inventoryAgeAtSale - 7),
        discountsGivenPercent: Math.max(0, baseline.marketTiming.discountsGivenPercent - 5),
        contractVsSpotSalesRatio: baseline.marketTiming.contractVsSpotSalesRatio * 1.5
      }
    };

    try {
      const savings = await baselineManager.calculateSavings(
        currentBaseline.id,
        currentMetrics,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date(),
        0.20 // 20% revenue share
      );
      
      setSavingsCalc(savings);
      setActiveTab('savings');
    } catch (error) {
      console.error('Error calculating savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!savingsCalc) return;
    
    const invoiceData = invoiceGenerator.generateInvoiceData(savingsCalc, {
      name: 'Example Grow Facility',
      address: '123 Grow Street',
      city: 'Growville',
      state: 'CA',
      zip: '12345',
      contactName: 'John Doe',
      contactEmail: 'john@example.com'
    });
    
    // Download the invoice
    await invoiceGenerator.downloadInvoice(invoiceData);
  };

  // Show baseline capture form if needed
  if (showBaselineCapture) {
    return (
      <div className="w-full min-h-screen bg-gray-950 p-6">
        <BaselineDataCapture
          onComplete={createNewBaseline}
          onCancel={() => setShowBaselineCapture(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-gray-950 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue Sharing Dashboard</h1>
          <p className="text-gray-400 mt-2">Track your savings and revenue sharing with VibeLux</p>
        </div>
        <div className="flex gap-4">
          {!currentBaseline && (
            <Button onClick={() => setShowBaselineCapture(true)} disabled={loading}>
              <Database className="mr-2 h-4 w-4" />
              Create Baseline
            </Button>
          )}
          {currentBaseline && (
            <Button onClick={calculateCurrentSavings} disabled={loading}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Calculate Savings
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
          <TabsTrigger value="baseline" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">Baseline</TabsTrigger>
          <TabsTrigger value="savings" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">Savings</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Current Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {currentBaseline ? 'Active' : 'No Baseline'}
                </div>
                <p className="text-xs text-gray-500">
                  {currentBaseline ? `Verified on ${new Date(currentBaseline.verifiedAt!).toLocaleDateString()}` : 'Create a baseline to start'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${savingsCalc ? savingsCalc.savings.totalSavings.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-gray-500">
                  This period
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Revenue Share</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${savingsCalc ? savingsCalc.revenueShare.amount.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-gray-500">
                  20% of savings
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">How Revenue Sharing Works</CardTitle>
              <CardDescription className="text-gray-400">
                We succeed when you succeed. Our platform pays for itself through the savings it generates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-900/30 border border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Baseline Setup</h3>
                  <p className="text-sm text-gray-400">
                    We establish your current energy usage, yields, and operational costs
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-900/30 border border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-white">AI Optimization</h3>
                  <p className="text-sm text-gray-400">
                    Our AI continuously optimizes lighting, HVAC, and operations
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-900/30 border border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Track Savings</h3>
                  <p className="text-sm text-gray-400">
                    Real-time monitoring shows your energy and cost reductions
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-900/30 border border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Share Success</h3>
                  <p className="text-sm text-gray-400">
                    Pay a small percentage of verified savings - typically 15-25%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="baseline" className="space-y-6 mt-6">
          {baselines.length === 0 ? (
            <Card className="text-center py-12 bg-gray-900 border-gray-800">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Baseline Established</h3>
                <p className="text-gray-400 mb-4">
                  Create a baseline to start tracking your savings
                </p>
                <Button onClick={() => setShowBaselineCapture(true)} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Database className="mr-2 h-4 w-4" />
                  Create Baseline
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {baselines.map((baseline) => (
                <Card key={baseline.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">Baseline {baseline.id.slice(-8)}</CardTitle>
                        <CardDescription className="text-gray-400">
                          Created on {new Date(baseline.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={baseline.status === 'verified' ? 'default' : 'secondary'}
                        className={baseline.status === 'verified' ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-gray-800 text-gray-400'}
                      >
                        {baseline.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Energy Metrics */}
                      <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-3">Energy Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-400 text-xs">Total kWh</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.energy?.totalKwh?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Peak Demand</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.energy?.peakDemandKw || 'N/A'} kW
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Total Cost</Label>
                            <p className="text-lg font-semibold text-white">
                              ${baseline.metrics?.energy?.totalEnergyCost?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Power Factor</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.energy?.powerFactor || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Production Metrics */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-3">Production Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-400 text-xs">Total Yield</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.production?.totalYield?.toLocaleString() || 'N/A'} lbs
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Grade A %</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.production?.gradeAPercentage || 'N/A'}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Waste %</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.production?.wastePercentage || 'N/A'}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Cycle Time</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.production?.averageCycleTime || 'N/A'} days
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-400 mb-3">Financial Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-400 text-xs">Op Cost</Label>
                            <p className="text-lg font-semibold text-white">
                              ${baseline.metrics?.financial?.totalOperationalCost?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Cost/lb</Label>
                            <p className="text-lg font-semibold text-white">
                              ${baseline.metrics?.financial?.costPerPound || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Revenue/lb</Label>
                            <p className="text-lg font-semibold text-white">
                              ${baseline.metrics?.financial?.revenuePerPound || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-xs">Margin</Label>
                            <p className="text-lg font-semibold text-white">
                              {baseline.metrics?.financial?.grossMargin || 'N/A'}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {baseline.status === 'draft' && (
                      <div className="mt-6 flex justify-end">
                        <Button onClick={() => verifyBaseline(baseline.id)} className="bg-purple-600 hover:bg-purple-700 text-white">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Baseline
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="savings" className="space-y-6 mt-6">
          {!savingsCalc ? (
            <Card className="text-center py-12 bg-gray-900 border-gray-800">
              <CardContent>
                <Zap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Savings Calculated</h3>
                <p className="text-gray-400 mb-4">
                  Calculate your current savings based on the baseline
                </p>
                <Button onClick={calculateCurrentSavings} disabled={!currentBaseline || loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Calculate Savings
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Energy Savings */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      Energy Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">kWh Reduction</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.energy.kwhReduction.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Energy Cost Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.energy.costSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Demand Charge Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.energy.demandChargeSavings.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Production Improvements */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-400" />
                      Production Gains
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Yield Increase</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.production.yieldIncrease.toLocaleString()} lbs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Yield Value</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.production.yieldValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Waste Reduction Value</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.production.wasteReductionValue.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Environmental Optimization */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-blue-400" />
                      Environmental
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Stability Improved</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.environmental.stabilityImprovement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">CO₂ Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.environmental.co2SavingsValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">HVAC Efficiency</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.environmental.hvacEfficiencyValue.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Water & Nutrients */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-cyan-400" />
                      Water & Nutrients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Water Saved</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.waterNutrients.waterReduction.toLocaleString()} gal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Water Cost Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.waterNutrients.waterCostSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Nutrient Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.waterNutrients.nutrientSavings.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Labor Efficiency */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      Labor Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Hours Saved</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.labor.hoursSaved.toLocaleString()} hrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Labor Cost Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.labor.laborCostSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Productivity Gain</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.labor.productivityGain.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment & Quality */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-400" />
                      Equipment & Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Maintenance Savings</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.equipment.maintenanceSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Quality Compliance</span>
                      <span className="font-semibold text-green-400">
                        ${savingsCalc.savings.quality.complianceValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Failure Rate Reduction</span>
                      <span className="font-semibold text-white">
                        {savingsCalc.savings.quality.failureRateReduction.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-purple-900/20 to-green-900/20 border-purple-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Total Savings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">
                        ${savingsCalc.savings.totalSavings.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Total Annual Savings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">
                        {savingsCalc.savings.savingsPercentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Cost Reduction</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-400">
                        {savingsCalc.revenueShare.percentage}%
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Revenue Share</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        ${savingsCalc.revenueShare.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Amount Due</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">ROI Calculation</h4>
                    <p className="text-sm text-gray-400">
                      For every $1 invested in VibeLux revenue sharing, you save ${(1 / savingsCalc.revenueShare.percentage * 100).toFixed(2)}.
                      Your effective ROI is <span className="text-green-400 font-semibold">{savingsCalc.savings.roi.toFixed(0)}%</span>.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button size="lg" onClick={generateInvoice} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Send className="mr-2 h-5 w-5" />
                      Generate Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6 mt-6">
          <Alert className="bg-gray-900 border-gray-800 text-white">
            <AlertCircle className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-gray-300">
              Invoice history and payment tracking coming soon. Generated invoices will appear here.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}