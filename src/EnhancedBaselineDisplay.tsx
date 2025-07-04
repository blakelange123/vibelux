'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Zap,
  Leaf,
  Droplets,
  Users,
  Wrench,
  Shield,
  Bug,
  Package,
  Database,
  Grid3x3,
  Cpu,
  Clock,
  Beaker,
  Building2,
  FileText,
  Calendar
} from 'lucide-react';

interface BaselineCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  totalCost: number;
  metrics: {
    label: string;
    value: number | string;
    unit: string;
    cost?: number;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

export function EnhancedBaselineDisplay({ facilityId }: { facilityId: string }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Comprehensive baseline data for all 15 categories
  const baselineCategories: BaselineCategory[] = [
    {
      id: 'energy',
      name: 'Energy',
      icon: Zap,
      color: 'text-yellow-400',
      verificationStatus: 'verified',
      totalCost: 180000,
      metrics: [
        { label: 'Total Consumption', value: 1500000, unit: 'kWh/year', cost: 180000 },
        { label: 'Peak Demand', value: 350, unit: 'kW', cost: 42000 },
        { label: 'Lighting Load', value: 900000, unit: 'kWh/year', cost: 108000 },
        { label: 'HVAC Load', value: 450000, unit: 'kWh/year', cost: 54000 },
        { label: 'Power Factor', value: 0.89, unit: '', trend: 'down' },
        { label: 'Demand Charges', value: 3500, unit: '$/month' }
      ]
    },
    {
      id: 'production',
      name: 'Production',
      icon: Leaf,
      color: 'text-green-400',
      verificationStatus: 'verified',
      totalCost: -850000, // Revenue
      metrics: [
        { label: 'Annual Yield', value: 12500, unit: 'lbs/year' },
        { label: 'Yield per Sq Ft', value: 45, unit: 'g/sq ft' },
        { label: 'Grade A Product', value: 72, unit: '%' },
        { label: 'Average Cycle Time', value: 84, unit: 'days' },
        { label: 'Revenue per Sq Ft', value: 225, unit: '$/sq ft/year' },
        { label: 'Waste Rate', value: 5.2, unit: '%', cost: 42500 }
      ]
    },
    {
      id: 'environmental',
      name: 'Environmental Control',
      icon: Building2,
      color: 'text-blue-400',
      verificationStatus: 'verified',
      totalCost: 45000,
      metrics: [
        { label: 'Avg Temperature', value: 72, unit: '°F' },
        { label: 'Avg Humidity', value: 58, unit: '%' },
        { label: 'CO2 Levels', value: 1200, unit: 'ppm' },
        { label: 'VPD Average', value: 1.15, unit: 'kPa' },
        { label: 'Out of Range Hours', value: 312, unit: 'hours/year', cost: 15600 },
        { label: 'CO2 Enrichment', value: 750, unit: '$/month', cost: 9000 }
      ]
    },
    {
      id: 'water',
      name: 'Water & Nutrients',
      icon: Droplets,
      color: 'text-cyan-400',
      verificationStatus: 'pending',
      totalCost: 68000,
      metrics: [
        { label: 'Water Usage', value: 180000, unit: 'gal/year', cost: 12000 },
        { label: 'Nutrient Cost', value: 3200, unit: '$/month', cost: 38400 },
        { label: 'Runoff Rate', value: 15, unit: '%', cost: 5400 },
        { label: 'EC Stability', value: 92, unit: '%' },
        { label: 'pH Stability', value: 88, unit: '%' },
        { label: 'Water Quality Testing', value: 1000, unit: '$/year' }
      ]
    },
    {
      id: 'labor',
      name: 'Labor',
      icon: Users,
      color: 'text-purple-400',
      verificationStatus: 'verified',
      totalCost: 420000,
      metrics: [
        { label: 'Total Headcount', value: 12, unit: 'FTE' },
        { label: 'Avg Hourly Rate', value: 18.50, unit: '$/hour' },
        { label: 'Overtime Hours', value: 1560, unit: 'hours/year', cost: 35100 },
        { label: 'Labor per lb', value: 33.60, unit: '$/lb' },
        { label: 'Productivity', value: 95, unit: 'lbs/labor hour' },
        { label: 'Training Cost', value: 8500, unit: '$/year' }
      ]
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: Wrench,
      color: 'text-orange-400',
      verificationStatus: 'verified',
      totalCost: 52000,
      metrics: [
        { label: 'Preventive Maint.', value: 2400, unit: '$/month', cost: 28800 },
        { label: 'Reactive Repairs', value: 850, unit: '$/month', cost: 10200 },
        { label: 'Spare Parts', value: 600, unit: '$/month', cost: 7200 },
        { label: 'Downtime Hours', value: 156, unit: 'hours/year', cost: 31200 },
        { label: 'MTBF', value: 2160, unit: 'hours' },
        { label: 'Service Contracts', value: 5800, unit: '$/year' }
      ]
    },
    {
      id: 'space',
      name: 'Space Utilization',
      icon: Grid3x3,
      color: 'text-indigo-400',
      verificationStatus: 'pending',
      totalCost: 180000,
      metrics: [
        { label: 'Total Space', value: 15000, unit: 'sq ft' },
        { label: 'Canopy Space', value: 8500, unit: 'sq ft' },
        { label: 'Rent/Lease', value: 12, unit: '$/sq ft/year', cost: 180000 },
        { label: 'Space Efficiency', value: 82, unit: '%' },
        { label: 'Vertical Utilization', value: 65, unit: '%' },
        { label: 'Common Area', value: 2200, unit: 'sq ft' }
      ]
    },
    {
      id: 'quality',
      name: 'Quality Control',
      icon: Beaker,
      color: 'text-pink-400',
      verificationStatus: 'verified',
      totalCost: 48000,
      metrics: [
        { label: 'Testing Frequency', value: 24, unit: 'tests/month' },
        { label: 'Lab Testing Cost', value: 2800, unit: '$/month', cost: 33600 },
        { label: 'In-House QC', value: 600, unit: '$/month', cost: 7200 },
        { label: 'Rework Cost', value: 600, unit: '$/month', cost: 7200 },
        { label: 'First Pass Yield', value: 94, unit: '%' },
        { label: 'Customer Returns', value: 0.8, unit: '%' }
      ]
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: Shield,
      color: 'text-red-400',
      verificationStatus: 'verified',
      totalCost: 72000,
      metrics: [
        { label: 'License Fees', value: 18000, unit: '$/year' },
        { label: 'Inspection Fees', value: 12000, unit: '$/year' },
        { label: 'Compliance Testing', value: 2500, unit: '$/month', cost: 30000 },
        { label: 'Legal/Consulting', value: 1000, unit: '$/month', cost: 12000 },
        { label: 'Audit Score', value: 96, unit: '%' },
        { label: 'Violations', value: 0, unit: 'count' }
      ]
    },
    {
      id: 'pest',
      name: 'Pest & Disease',
      icon: Bug,
      color: 'text-amber-400',
      verificationStatus: 'pending',
      totalCost: 28000,
      metrics: [
        { label: 'IPM Program', value: 800, unit: '$/month', cost: 9600 },
        { label: 'Pesticides', value: 450, unit: '$/month', cost: 5400 },
        { label: 'Beneficial Insects', value: 300, unit: '$/month', cost: 3600 },
        { label: 'Crop Loss', value: 2.5, unit: '%', cost: 21250 },
        { label: 'Prevention Success', value: 97, unit: '%' },
        { label: 'Treatment Events', value: 8, unit: 'per year' }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      icon: Package,
      color: 'text-violet-400',
      verificationStatus: 'unverified',
      totalCost: 85000,
      metrics: [
        { label: 'Avg Inventory Value', value: 425000, unit: '$' },
        { label: 'Turnover Rate', value: 12, unit: 'times/year' },
        { label: 'Carrying Cost', value: 20, unit: '%/year', cost: 85000 },
        { label: 'Shrinkage', value: 1.2, unit: '%', cost: 5100 },
        { label: 'Stockout Events', value: 4, unit: 'per year', cost: 8000 },
        { label: 'Order Accuracy', value: 98.5, unit: '%' }
      ]
    },
    {
      id: 'equipment',
      name: 'Equipment',
      icon: Cpu,
      color: 'text-teal-400',
      verificationStatus: 'verified',
      totalCost: 125000,
      metrics: [
        { label: 'Depreciation', value: 6250, unit: '$/month', cost: 75000 },
        { label: 'Equipment Leases', value: 2800, unit: '$/month', cost: 33600 },
        { label: 'Insurance', value: 1367, unit: '$/month', cost: 16400 },
        { label: 'Utilization Rate', value: 78, unit: '%' },
        { label: 'Equipment Age', value: 3.2, unit: 'years avg' },
        { label: 'Replacement Reserve', value: 2000, unit: '$/month' }
      ]
    },
    {
      id: 'data',
      name: 'Data Management',
      icon: Database,
      color: 'text-emerald-400',
      verificationStatus: 'verified',
      totalCost: 24000,
      metrics: [
        { label: 'Software Licenses', value: 1200, unit: '$/month', cost: 14400 },
        { label: 'Cloud Services', value: 600, unit: '$/month', cost: 7200 },
        { label: 'Data Storage', value: 2.5, unit: 'TB' },
        { label: 'System Uptime', value: 99.8, unit: '%' },
        { label: 'Backup Frequency', value: 24, unit: 'times/day' },
        { label: 'IT Support', value: 200, unit: '$/month', cost: 2400 }
      ]
    },
    {
      id: 'technology',
      name: 'Technology',
      icon: Cpu,
      color: 'text-slate-400',
      verificationStatus: 'pending',
      totalCost: 36000,
      metrics: [
        { label: 'Automation Systems', value: 1800, unit: '$/month', cost: 21600 },
        { label: 'Sensors/IoT', value: 600, unit: '$/month', cost: 7200 },
        { label: 'Control Systems', value: 400, unit: '$/month', cost: 4800 },
        { label: 'Tech Training', value: 200, unit: '$/month', cost: 2400 },
        { label: 'Automation Level', value: 65, unit: '%' },
        { label: 'Sensor Coverage', value: 88, unit: '%' }
      ]
    },
    {
      id: 'market',
      name: 'Market Timing',
      icon: Calendar,
      color: 'text-rose-400',
      verificationStatus: 'unverified',
      totalCost: 45000,
      metrics: [
        { label: 'Missed Sales Opps', value: 3750, unit: '$/month', cost: 45000 },
        { label: 'Price Variance', value: -8, unit: '%', cost: 68000 },
        { label: 'Order Fill Rate', value: 94, unit: '%' },
        { label: 'Lead Time', value: 3.5, unit: 'days' },
        { label: 'Customer Retention', value: 88, unit: '%' },
        { label: 'Market Share', value: 12, unit: '%' }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-800 text-green-200">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-800 text-yellow-200">Pending</Badge>;
      default:
        return <Badge className="bg-gray-700 text-gray-300">Unverified</Badge>;
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4 bg-gray-600 rounded-full" />;
    }
  };

  // Calculate totals
  const totalOperatingCost = baselineCategories
    .filter(cat => cat.totalCost > 0)
    .reduce((sum, cat) => sum + cat.totalCost, 0);
  
  const totalRevenue = Math.abs(baselineCategories.find(cat => cat.id === 'production')?.totalCost || 0);
  const netMargin = ((totalRevenue - totalOperatingCost) / totalRevenue * 100).toFixed(1);
  const verifiedCategories = baselineCategories.filter(cat => cat.verificationStatus === 'verified').length;

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Comprehensive Baseline Metrics</CardTitle>
          <CardDescription className="text-gray-400">
            All operational costs and metrics affecting profitability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Operating Cost</p>
              <p className="text-2xl font-bold text-red-400">
                ${totalOperatingCost.toLocaleString()}/year
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">
                ${totalRevenue.toLocaleString()}/year
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Net Margin</p>
              <p className="text-2xl font-bold text-white">{netMargin}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Verification Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={(verifiedCategories / baselineCategories.length) * 100} className="flex-1" />
                <span className="text-sm text-white">{verifiedCategories}/{baselineCategories.length}</span>
              </div>
            </div>
          </div>

          {/* Potential Savings Alert */}
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Identified Savings Opportunities</p>
                <p className="text-sm text-gray-300 mt-1">
                  Based on your baseline data, we've identified potential annual savings of 
                  <span className="font-bold text-green-400"> ${(totalOperatingCost * 0.22).toLocaleString()}</span> (22%)
                  through optimization across energy, labor, and operational efficiency.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="space-y-4">
        {baselineCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isEditing = editingCategory === category.id;
          const Icon = category.icon;

          return (
            <Card key={category.id} className="bg-gray-900 border-gray-800">
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-gray-800 rounded-lg ${category.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white flex items-center gap-3">
                        {category.name}
                        {getVerificationBadge(category.verificationStatus)}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Annual Cost: 
                        <span className={`font-bold ml-2 ${category.totalCost < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${Math.abs(category.totalCost).toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isExpanded && (
                      <div className="flex items-center gap-4 text-sm">
                        {category.metrics.slice(0, 3).map((metric, idx) => (
                          <div key={idx} className="text-gray-400">
                            <span className="text-white font-medium">{metric.value}</span> {metric.unit}
                          </div>
                        ))}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Edit Button */}
                    <div className="flex justify-end">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setEditingCategory(null)}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-700 hover:bg-gray-600"
                            onClick={() => setEditingCategory(null)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-gray-800 hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(category.id);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm text-gray-400">{metric.label}</p>
                            {getTrendIcon(metric.trend)}
                          </div>
                          {isEditing ? (
                            <Input
                              type="text"
                              defaultValue={metric.value}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          ) : (
                            <p className="text-xl font-bold text-white">
                              {typeof metric.value === 'number' 
                                ? metric.value.toLocaleString() 
                                : metric.value} {metric.unit}
                            </p>
                          )}
                          {metric.cost && (
                            <p className="text-sm text-red-400 mt-1">
                              Cost: ${metric.cost.toLocaleString()}/year
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Category Notes */}
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">
                        {category.verificationStatus === 'verified' ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Data verified from QuickBooks export on {new Date().toLocaleDateString()}
                          </span>
                        ) : category.verificationStatus === 'pending' ? (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            Processing financial data - please allow 24-48 hours
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            Please upload QuickBooks export or audited financials to establish baseline
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Export Options */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Export Baseline Data</p>
              <p className="text-sm text-gray-400">Download comprehensive baseline report</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="bg-gray-800 hover:bg-gray-700">
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 hover:bg-gray-700">
                <Database className="w-4 h-4 mr-2" />
                Excel Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}