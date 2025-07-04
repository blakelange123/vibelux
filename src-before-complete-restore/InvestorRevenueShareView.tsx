'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Leaf, 
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  BarChart3,
  Shield,
  Bug,
  Package,
  Database,
  Grid3x3,
  Cpu,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface InvestmentPerformance {
  facilityId: string;
  facilityName: string;
  investmentType: 'YEP' | 'GAAS' | 'HYBRID';
  performanceData: {
    baseline: {
      energy: number;
      yield: number;
      quality: number;
      operationalCost: number;
    };
    current: {
      energy: number;
      yield: number;
      quality: number;
      operationalCost: number;
    };
    improvements: {
      energyReduction: number;
      yieldIncrease: number;
      qualityImprovement: number;
      costReduction: number;
    };
    revenueSharingMetrics: {
      totalSavings: number;
      revenueSharePercentage: number;
      revenueShareAmount: number;
      paymentStatus: string;
    };
  };
  extendedMetrics: {
    compliance: {
      violationsReduction: number;
      testingCostReduction: number;
    };
    pestDisease: {
      incidentsReduction: number;
      cropLossPrevented: number;
    };
    technology: {
      automationHoursSaved: number;
      downtimeReduction: number;
    };
    spaceUtilization: {
      utilizationImprovement: number;
      additionalProductiveSpace: number;
    };
  };
  lastPayment: {
    amount: number;
    date: string;
    status: 'pending' | 'paid' | 'processing';
  };
  contractTerms: {
    startDate: string;
    endDate: string;
    minimumReturn: number;
    targetReturn: number;
  };
}

interface InvestorRevenueShareViewProps {
  investmentId: string;
  investments?: InvestmentPerformance[];
}

export function InvestorRevenueShareView({ investmentId, investments = [] }: InvestorRevenueShareViewProps) {
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<InvestmentPerformance[]>(investments);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    if (investments.length === 0) {
      // In production, this would fetch real data from the API
      const mockData: InvestmentPerformance[] = [
        {
          facilityId: 'facility_001',
          facilityName: 'Green Valley Cannabis Co.',
          investmentType: 'YEP',
          performanceData: {
            baseline: {
              energy: 125000,
              yield: 12500,
              quality: 5,
              operationalCost: 50000
            },
            current: {
              energy: 100000,
              yield: 14375,
              quality: 3,
              operationalCost: 42500
            },
            improvements: {
              energyReduction: 20,
              yieldIncrease: 15,
              qualityImprovement: 2,
              costReduction: 15
            },
            revenueSharingMetrics: {
              totalSavings: 45000,
              revenueSharePercentage: 20,
              revenueShareAmount: 9000,
              paymentStatus: 'paid'
            }
          },
          extendedMetrics: {
            compliance: {
              violationsReduction: 3,
              testingCostReduction: 2400
            },
            pestDisease: {
              incidentsReduction: 24,
              cropLossPrevented: 3.5
            },
            technology: {
              automationHoursSaved: 480,
              downtimeReduction: 120
            },
            spaceUtilization: {
              utilizationImprovement: 85,
              additionalProductiveSpace: 500
            }
          },
          lastPayment: {
            amount: 9000,
            date: '2024-01-15',
            status: 'paid'
          },
          contractTerms: {
            startDate: '2023-01-01',
            endDate: '2025-12-31',
            minimumReturn: 15,
            targetReturn: 25
          }
        },
        {
          facilityId: 'facility_002',
          facilityName: 'Urban Greens Vertical Farm',
          investmentType: 'HYBRID',
          performanceData: {
            baseline: {
              energy: 200000,
              yield: 20000,
              quality: 8,
              operationalCost: 80000
            },
            current: {
              energy: 150000,
              yield: 24000,
              quality: 4,
              operationalCost: 64000
            },
            improvements: {
              energyReduction: 25,
              yieldIncrease: 20,
              qualityImprovement: 4,
              costReduction: 20
            },
            revenueSharingMetrics: {
              totalSavings: 72000,
              revenueSharePercentage: 18,
              revenueShareAmount: 12960,
              paymentStatus: 'processing'
            }
          },
          extendedMetrics: {
            compliance: {
              violationsReduction: 5,
              testingCostReduction: 3600
            },
            pestDisease: {
              incidentsReduction: 36,
              cropLossPrevented: 5.2
            },
            technology: {
              automationHoursSaved: 720,
              downtimeReduction: 180
            },
            spaceUtilization: {
              utilizationImprovement: 92,
              additionalProductiveSpace: 800
            }
          },
          lastPayment: {
            amount: 12960,
            date: '2024-01-20',
            status: 'processing'
          },
          contractTerms: {
            startDate: '2023-06-01',
            endDate: '2026-05-31',
            minimumReturn: 18,
            targetReturn: 30
          }
        }
      ];
      setPerformanceData(mockData);
    }
  }, [investments]);

  const totalRevenue = performanceData.reduce((sum, inv) => 
    sum + inv.performanceData.revenueSharingMetrics.revenueShareAmount, 0
  );

  const avgYieldImprovement = performanceData.reduce((sum, inv) => 
    sum + inv.performanceData.improvements.yieldIncrease, 0
  ) / (performanceData.length || 1);

  const avgEnergyReduction = performanceData.reduce((sum, inv) => 
    sum + inv.performanceData.improvements.energyReduction, 0
  ) / (performanceData.length || 1);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'text-green-400' 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: any; 
    color?: string;
  }) => (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                <span className="text-sm">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue Share"
          value={`$${totalRevenue.toLocaleString()}`}
          change={12}
          icon={DollarSign}
        />
        <MetricCard
          title="Avg Yield Improvement"
          value={`${avgYieldImprovement.toFixed(1)}%`}
          icon={Leaf}
          color="text-green-400"
        />
        <MetricCard
          title="Avg Energy Reduction"
          value={`${avgEnergyReduction.toFixed(1)}%`}
          icon={Zap}
          color="text-yellow-400"
        />
        <MetricCard
          title="Active Facilities"
          value={performanceData.length}
          icon={Building2}
          color="text-blue-400"
        />
      </div>

      {/* Facility Performance Tabs */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Facility Performance Details</CardTitle>
          <CardDescription className="text-gray-400">
            Track revenue sharing performance across your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={performanceData[0]?.facilityId} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-gray-800 border-gray-700">
              {performanceData.map((facility) => (
                <TabsTrigger 
                  key={facility.facilityId} 
                  value={facility.facilityId}
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
                >
                  {facility.facilityName}
                </TabsTrigger>
              ))}
            </TabsList>

            {performanceData.map((facility) => (
              <TabsContent key={facility.facilityId} value={facility.facilityId} className="space-y-6 mt-6">
                {/* Contract & Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Investment Type</span>
                        <Badge variant={facility.investmentType === 'YEP' ? 'default' : 'secondary'}>
                          {facility.investmentType}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Contract Period</span>
                        <span className="text-sm text-white">
                          {new Date(facility.contractTerms.startDate).getFullYear()} - 
                          {new Date(facility.contractTerms.endDate).getFullYear()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Last Payment</span>
                        <Badge 
                          variant={facility.lastPayment.status === 'paid' ? 'default' : 'secondary'}
                          className={facility.lastPayment.status === 'paid' ? 'bg-green-900/50 text-green-400' : ''}
                        >
                          {facility.lastPayment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Amount</span>
                        <span className="text-sm font-semibold text-white">
                          ${facility.lastPayment.amount.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Target Return</span>
                        <span className="text-sm font-semibold text-white">
                          {facility.contractTerms.targetReturn}%
                        </span>
                      </div>
                      <Progress 
                        value={(facility.performanceData.improvements.costReduction / facility.contractTerms.targetReturn) * 100} 
                        className="h-2 bg-gray-700"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {facility.performanceData.improvements.costReduction}% achieved
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Core Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Energy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        {facility.performanceData.improvements.energyReduction}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {((facility.performanceData.baseline.energy - facility.performanceData.current.energy) / 1000).toFixed(0)}k kWh saved
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-400" />
                        Yield
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        +{facility.performanceData.improvements.yieldIncrease}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(facility.performanceData.current.yield - facility.performanceData.baseline.yield).toLocaleString()} lbs increase
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        Quality
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        -{facility.performanceData.improvements.qualityImprovement}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Failure rate reduction
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        Cost
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        -{facility.performanceData.improvements.costReduction}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ${((facility.performanceData.baseline.operationalCost - facility.performanceData.current.operationalCost) / 1000).toFixed(0)}k saved
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Extended Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-300">Compliance</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {facility.extendedMetrics.compliance.violationsReduction} fewer
                    </p>
                    <p className="text-xs text-gray-400">violations/year</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Bug className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-300">Pest Control</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {facility.extendedMetrics.pestDisease.incidentsReduction} fewer
                    </p>
                    <p className="text-xs text-gray-400">incidents/year</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Automation</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {facility.extendedMetrics.technology.automationHoursSaved} hrs
                    </p>
                    <p className="text-xs text-gray-400">saved/year</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Grid3x3 className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-gray-300">Space</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {facility.extendedMetrics.spaceUtilization.utilizationImprovement}%
                    </p>
                    <p className="text-xs text-gray-400">utilization</p>
                  </div>
                </div>

                {/* Revenue Sharing Summary */}
                <Card className="bg-gradient-to-r from-purple-900/20 to-green-900/20 border-purple-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Sharing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-400">Total Savings Generated</p>
                        <p className="text-2xl font-bold text-white">
                          ${facility.performanceData.revenueSharingMetrics.totalSavings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Revenue Share Rate</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {facility.performanceData.revenueSharingMetrics.revenueSharePercentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Your Revenue</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${facility.performanceData.revenueSharingMetrics.revenueShareAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400">
                        Based on verified performance improvements from {new Date(facility.contractTerms.startDate).toLocaleDateString()} baseline
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}