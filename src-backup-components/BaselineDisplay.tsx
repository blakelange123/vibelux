'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Check, X, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface BaselineCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  totalCost: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  lastUpdated: string;
  metrics: {
    [key: string]: {
      label: string;
      value: number | string;
      unit: string;
      cost?: number;
      trend?: 'up' | 'down' | 'stable';
      editable?: boolean;
    };
  };
}

const BaselineDisplay: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  const [baselineData, setBaselineData] = useState<BaselineCategory[]>([
    {
      id: 'energy',
      name: 'Energy Costs',
      icon: '⚡',
      totalCost: 125000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-15',
      metrics: {
        electricity: { label: 'Electricity Usage', value: 1250000, unit: 'kWh/year', cost: 100000, trend: 'down', editable: true },
        peakDemand: { label: 'Peak Demand', value: 350, unit: 'kW', cost: 15000, trend: 'stable', editable: true },
        powerFactor: { label: 'Power Factor', value: 0.92, unit: '', cost: 5000, trend: 'up', editable: true },
        hvac: { label: 'HVAC Energy', value: 250000, unit: 'kWh/year', cost: 20000, trend: 'down', editable: true },
        lighting: { label: 'Lighting Energy', value: 750000, unit: 'kWh/year', cost: 60000, trend: 'down', editable: true },
        utilityRate: { label: 'Average Rate', value: 0.08, unit: '$/kWh', editable: true },
      }
    },
    {
      id: 'production',
      name: 'Production Metrics',
      icon: '🌱',
      totalCost: 85000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-14',
      metrics: {
        yield: { label: 'Average Yield', value: 55, unit: 'g/sq ft', trend: 'up', editable: true },
        cycleTime: { label: 'Cycle Time', value: 84, unit: 'days', trend: 'stable', editable: true },
        plantDensity: { label: 'Plant Density', value: 4.5, unit: 'plants/sq ft', editable: true },
        harvestLoss: { label: 'Harvest Loss', value: 8, unit: '%', cost: 35000, trend: 'down', editable: true },
        qualityGrade: { label: 'A-Grade Ratio', value: 75, unit: '%', trend: 'up', editable: true },
        revenuePerSqFt: { label: 'Revenue/sq ft', value: 450, unit: '$/year', trend: 'up', editable: true },
      }
    },
    {
      id: 'environmental',
      name: 'Environmental Control',
      icon: '🌡️',
      totalCost: 45000,
      verificationStatus: 'pending',
      lastUpdated: '2024-01-13',
      metrics: {
        temperature: { label: 'Avg Temperature', value: 72, unit: '°F', editable: true },
        humidity: { label: 'Avg Humidity', value: 65, unit: '%', editable: true },
        co2: { label: 'CO2 Levels', value: 1200, unit: 'ppm', cost: 15000, editable: true },
        vpd: { label: 'VPD Average', value: 1.2, unit: 'kPa', editable: true },
        airflow: { label: 'Air Changes', value: 20, unit: '/hour', cost: 10000, editable: true },
        uniformity: { label: 'Environmental Uniformity', value: 92, unit: '%', trend: 'up', editable: true },
      }
    },
    {
      id: 'water',
      name: 'Water & Nutrients',
      icon: '💧',
      totalCost: 68000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-12',
      metrics: {
        waterUsage: { label: 'Water Consumption', value: 125000, unit: 'gal/year', cost: 8000, trend: 'down', editable: true },
        nutrientCost: { label: 'Nutrient Cost', value: 45000, unit: '$/year', cost: 45000, trend: 'stable', editable: true },
        runoffRate: { label: 'Runoff Rate', value: 15, unit: '%', cost: 5000, trend: 'down', editable: true },
        ecTarget: { label: 'EC Target', value: 2.2, unit: 'mS/cm', editable: true },
        phTarget: { label: 'pH Target', value: 5.8, unit: '', editable: true },
        fertilizerEfficiency: { label: 'Fertilizer Efficiency', value: 85, unit: '%', trend: 'up', editable: true },
      }
    },
    {
      id: 'labor',
      name: 'Labor Costs',
      icon: '👥',
      totalCost: 320000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-11',
      metrics: {
        headcount: { label: 'Total Staff', value: 12, unit: 'FTE', cost: 240000, editable: true },
        hourlyRate: { label: 'Avg Hourly Rate', value: 22, unit: '$/hour', editable: true },
        overtime: { label: 'Overtime Hours', value: 2400, unit: 'hours/year', cost: 60000, trend: 'down', editable: true },
        productivity: { label: 'Plants/Person/Day', value: 150, unit: '', trend: 'up', editable: true },
        training: { label: 'Training Cost', value: 20000, unit: '$/year', cost: 20000, editable: true },
        turnoverRate: { label: 'Turnover Rate', value: 18, unit: '%', trend: 'down', editable: true },
      }
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: '🔧',
      totalCost: 42000,
      verificationStatus: 'pending',
      lastUpdated: '2024-01-10',
      metrics: {
        preventive: { label: 'Preventive Maintenance', value: 18000, unit: '$/year', cost: 18000, editable: true },
        reactive: { label: 'Reactive Repairs', value: 12000, unit: '$/year', cost: 12000, trend: 'down', editable: true },
        supplies: { label: 'Supplies & Parts', value: 8000, unit: '$/year', cost: 8000, editable: true },
        contracts: { label: 'Service Contracts', value: 4000, unit: '$/year', cost: 4000, editable: true },
        downtime: { label: 'Downtime Hours', value: 120, unit: 'hours/year', trend: 'down', editable: true },
        mtbf: { label: 'MTBF', value: 2160, unit: 'hours', trend: 'up', editable: true },
      }
    },
    {
      id: 'space',
      name: 'Space Utilization',
      icon: '📐',
      totalCost: 180000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-09',
      metrics: {
        totalArea: { label: 'Total Facility', value: 25000, unit: 'sq ft', editable: true },
        cultivationArea: { label: 'Cultivation Area', value: 18000, unit: 'sq ft', editable: true },
        canopyArea: { label: 'Canopy Area', value: 15000, unit: 'sq ft', editable: true },
        rent: { label: 'Rent/Lease', value: 150000, unit: '$/year', cost: 150000, editable: true },
        utilities: { label: 'Base Utilities', value: 30000, unit: '$/year', cost: 30000, editable: true },
        efficiency: { label: 'Space Efficiency', value: 72, unit: '%', trend: 'up', editable: true },
      }
    },
    {
      id: 'quality',
      name: 'Quality Control',
      icon: '✅',
      totalCost: 95000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-08',
      metrics: {
        testing: { label: 'Lab Testing', value: 60000, unit: '$/year', cost: 60000, editable: true },
        inHouseQc: { label: 'In-House QC', value: 25000, unit: '$/year', cost: 25000, editable: true },
        rework: { label: 'Rework/Waste', value: 10000, unit: '$/year', cost: 10000, trend: 'down', editable: true },
        passRate: { label: 'First Pass Rate', value: 94, unit: '%', trend: 'up', editable: true },
        recalls: { label: 'Recalls/Returns', value: 0.5, unit: '%', trend: 'down', editable: true },
        customerComplaints: { label: 'Complaints/Month', value: 3, unit: '', trend: 'down', editable: true },
      }
    },
    {
      id: 'compliance',
      name: 'Compliance & Certifications',
      icon: '📋',
      totalCost: 55000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-07',
      metrics: {
        licensing: { label: 'Licensing Fees', value: 25000, unit: '$/year', cost: 25000, editable: true },
        inspections: { label: 'Inspection Costs', value: 8000, unit: '$/year', cost: 8000, editable: true },
        certifications: { label: 'Certifications', value: 12000, unit: '$/year', cost: 12000, editable: true },
        consulting: { label: 'Compliance Consulting', value: 10000, unit: '$/year', cost: 10000, editable: true },
        violations: { label: 'Violations/Year', value: 0, unit: '', trend: 'stable', editable: true },
        auditScore: { label: 'Audit Score', value: 98, unit: '%', trend: 'up', editable: true },
      }
    },
    {
      id: 'pest',
      name: 'Pest & Disease Management',
      icon: '🐛',
      totalCost: 38000,
      verificationStatus: 'pending',
      lastUpdated: '2024-01-06',
      metrics: {
        ipm: { label: 'IPM Program', value: 18000, unit: '$/year', cost: 18000, editable: true },
        pesticides: { label: 'Pesticides/Biologicals', value: 12000, unit: '$/year', cost: 12000, editable: true },
        losses: { label: 'Crop Losses', value: 8000, unit: '$/year', cost: 8000, trend: 'down', editable: true },
        outbreaks: { label: 'Outbreaks/Year', value: 2, unit: '', trend: 'down', editable: true },
        beneficialRelease: { label: 'Beneficial Releases', value: 24, unit: '/year', editable: true },
        scoutingHours: { label: 'Scouting Hours', value: 520, unit: 'hours/year', editable: true },
      }
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      icon: '📦',
      totalCost: 145000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-05',
      metrics: {
        avgInventory: { label: 'Average Inventory', value: 125000, unit: '$', cost: 125000, editable: true },
        turnover: { label: 'Inventory Turnover', value: 8.5, unit: 'x/year', trend: 'up', editable: true },
        shrinkage: { label: 'Shrinkage/Loss', value: 15000, unit: '$/year', cost: 15000, trend: 'down', editable: true },
        storage: { label: 'Storage Costs', value: 5000, unit: '$/year', cost: 5000, editable: true },
        stockouts: { label: 'Stockouts/Year', value: 12, unit: '', trend: 'down', editable: true },
        leadTime: { label: 'Avg Lead Time', value: 7, unit: 'days', editable: true },
      }
    },
    {
      id: 'equipment',
      name: 'Equipment & Infrastructure',
      icon: '⚙️',
      totalCost: 85000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-04',
      metrics: {
        depreciation: { label: 'Depreciation', value: 45000, unit: '$/year', cost: 45000, editable: true },
        leases: { label: 'Equipment Leases', value: 25000, unit: '$/year', cost: 25000, editable: true },
        insurance: { label: 'Equipment Insurance', value: 15000, unit: '$/year', cost: 15000, editable: true },
        utilization: { label: 'Equipment Utilization', value: 78, unit: '%', trend: 'up', editable: true },
        age: { label: 'Average Age', value: 3.5, unit: 'years', editable: true },
        efficiency: { label: 'Operating Efficiency', value: 88, unit: '%', trend: 'stable', editable: true },
      }
    },
    {
      id: 'data',
      name: 'Data Management',
      icon: '💾',
      totalCost: 28000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-03',
      metrics: {
        software: { label: 'Software Licenses', value: 18000, unit: '$/year', cost: 18000, editable: true },
        cloud: { label: 'Cloud Services', value: 6000, unit: '$/year', cost: 6000, editable: true },
        backup: { label: 'Backup & Recovery', value: 4000, unit: '$/year', cost: 4000, editable: true },
        dataPoints: { label: 'Data Points/Day', value: 50000, unit: '', trend: 'up', editable: true },
        uptime: { label: 'System Uptime', value: 99.8, unit: '%', trend: 'stable', editable: true },
        responseTime: { label: 'Avg Response Time', value: 250, unit: 'ms', trend: 'down', editable: true },
      }
    },
    {
      id: 'technology',
      name: 'Technology & Automation',
      icon: '🤖',
      totalCost: 62000,
      verificationStatus: 'pending',
      lastUpdated: '2024-01-02',
      metrics: {
        automation: { label: 'Automation Systems', value: 35000, unit: '$/year', cost: 35000, editable: true },
        sensors: { label: 'Sensors & IoT', value: 15000, unit: '$/year', cost: 15000, editable: true },
        integration: { label: 'Integration Costs', value: 8000, unit: '$/year', cost: 8000, editable: true },
        training: { label: 'Tech Training', value: 4000, unit: '$/year', cost: 4000, editable: true },
        automationRate: { label: 'Automation Rate', value: 45, unit: '%', trend: 'up', editable: true },
        roi: { label: 'Tech ROI', value: 2.3, unit: 'x', trend: 'up', editable: true },
      }
    },
    {
      id: 'market',
      name: 'Market Timing & Sales',
      icon: '📈',
      totalCost: 75000,
      verificationStatus: 'verified',
      lastUpdated: '2024-01-01',
      metrics: {
        missedSales: { label: 'Missed Opportunities', value: 45000, unit: '$/year', cost: 45000, trend: 'down', editable: true },
        priceVariance: { label: 'Price Variance', value: 12, unit: '%', trend: 'down', editable: true },
        salesCycle: { label: 'Sales Cycle', value: 14, unit: 'days', trend: 'down', editable: true },
        customerAcquisition: { label: 'Customer Acquisition', value: 20000, unit: '$/year', cost: 20000, editable: true },
        retention: { label: 'Customer Retention', value: 85, unit: '%', trend: 'up', editable: true },
        marketShare: { label: 'Market Share', value: 8.5, unit: '%', trend: 'up', editable: true },
      }
    }
  ]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleEdit = (fieldId: string) => {
    const newEditing = new Set(editingFields);
    if (newEditing.has(fieldId)) {
      newEditing.delete(fieldId);
    } else {
      newEditing.add(fieldId);
    }
    setEditingFields(newEditing);
  };

  const handleValueChange = (categoryId: string, metricKey: string, newValue: string) => {
    setBaselineData(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          metrics: {
            ...category.metrics,
            [metricKey]: {
              ...category.metrics[metricKey],
              value: isNaN(parseFloat(newValue)) ? newValue : parseFloat(newValue)
            }
          }
        };
      }
      return category;
    }));
  };

  const calculateTotalCosts = () => {
    return baselineData.reduce((sum, category) => sum + category.totalCost, 0);
  };

  const calculatePotentialSavings = () => {
    // Calculate potential savings based on optimization opportunities
    const energySavings = baselineData.find(c => c.id === 'energy')?.totalCost || 0;
    const laborSavings = baselineData.find(c => c.id === 'labor')?.totalCost || 0;
    const wasteSavings = baselineData.find(c => c.id === 'pest')?.totalCost || 0;
    
    return (energySavings * 0.25) + (laborSavings * 0.15) + (wasteSavings * 0.30);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><AlertCircle className="w-3 h-3 mr-1" />Unverified</Badge>;
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <div className="w-4 h-4 text-gray-400">—</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-100">Baseline Operations Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Total Annual Operating Costs</h3>
              <p className="text-3xl font-bold text-white">${calculateTotalCosts().toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">Across all 15 categories</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Potential Annual Savings</h3>
              <p className="text-3xl font-bold text-green-400">${calculatePotentialSavings().toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">Through optimization</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Verification Status</h3>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={73} className="flex-1" />
                <span className="text-sm font-medium text-gray-300">73%</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">11 of 15 categories verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="space-y-4">
        {baselineData.map((category) => (
          <Card key={category.id} className="bg-gray-800/50 border-gray-700">
            <CardHeader className="cursor-pointer" onClick={() => toggleCategory(category.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-100">{category.name}</CardTitle>
                    <p className="text-sm text-gray-400">Annual Cost: ${category.totalCost.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getVerificationBadge(category.verificationStatus)}
                  {expandedCategories.has(category.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedCategories.has(category.id) && (
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-400 mb-4">
                  Last updated: {new Date(category.lastUpdated).toLocaleDateString()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(category.metrics).map(([key, metric]) => {
                    const fieldId = `${category.id}-${key}`;
                    const isEditing = editingFields.has(fieldId);
                    
                    return (
                      <div key={key} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-gray-300">{metric.label}</Label>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(metric.trend)}
                            {metric.editable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleEdit(fieldId)}
                                className="h-6 w-6 p-0"
                              >
                                {isEditing ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-baseline gap-2">
                          {isEditing ? (
                            <Input
                              type="text"
                              value={metric.value}
                              onChange={(e) => handleValueChange(category.id, key, e.target.value)}
                              className="h-8 bg-gray-800 border-gray-600"
                              autoFocus
                            />
                          ) : (
                            <>
                              <span className="text-xl font-bold text-white">
                                {typeof metric.value === 'number' 
                                  ? metric.value.toLocaleString()
                                  : metric.value}
                              </span>
                              <span className="text-sm text-gray-400">{metric.unit}</span>
                            </>
                          )}
                        </div>
                        
                        {metric.cost && (
                          <div className="mt-2 text-sm text-gray-400">
                            Cost impact: ${metric.cost.toLocaleString()}/year
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Category Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Category Optimization Progress</span>
                    <span className="text-sm font-medium text-gray-300">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
          Export Baseline Report
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Start Optimization Analysis
        </Button>
      </div>
    </div>
  );
};

export default BaselineDisplay;