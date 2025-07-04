'use client';

import React, { useState, useEffect } from 'react';
import { DualUnitCostDisplay, CostSummaryCard } from './DualUnitCostDisplay';
import { BarChart3, TrendingDown, TrendingUp, Calculator, Leaf, Package, RefreshCw, Plus, Filter, Calendar, DollarSign, FileText } from 'lucide-react';

interface BatchData {
  id: string;
  batchNumber: string;
  cropType: string;
  costPerGram: number;
  costPerPound: number;
  totalCost: number;
  totalWeight: number; // grams
  yield: number;
  status: string;
  harvestDate?: string;
}

interface CostAnalysis {
  summary: {
    totalExpenses: number;
    totalYield: number;
    avgCostPerGram: number;
    avgCostPerPound: number;
    batchCount: number;
  };
  categoryBreakdown: Array<{
    categoryName: string;
    amount: number;
  }>;
  comparison: {
    previousPeriod: number;
    percentageChange: number;
    trend: string;
  };
  industryBenchmarks: Array<{
    cropType: string;
    industry: {
      costPerGram: number;
      costPerPound: number;
    };
  }>;
  batches: BatchData[];
}

export function CostTrackingDashboard({ facilityId }: { facilityId?: string }) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [costData, setCostData] = useState<BatchData[]>([]);
  const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cost data
  useEffect(() => {
    if (facilityId) {
      fetchCostData();
    }
  }, [facilityId, period]);

  const fetchCostData = async () => {
    if (!facilityId) return;
    
    setLoading(true);
    try {
      // Fetch cost analysis
      const analysisResponse = await fetch(
        `/api/costs/analysis?facilityId=${facilityId}&period=${period}`
      );
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          setAnalysis(analysisData.data);
          setCostData(analysisData.data.batches.map((batch: any) => ({
            ...batch,
            totalCost: batch.costPerGram * batch.yield,
            totalWeight: batch.yield
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchCostData();
  };

  const totalCosts = analysis?.summary.totalExpenses || 0;
  const totalSavings = costData.reduce((sum, batch) => {
    const benchmark = analysis?.industryBenchmarks.find(
      b => b.cropType.toLowerCase() === batch.cropType.toLowerCase()
    );
    if (benchmark && batch.costPerGram < benchmark.industry.costPerGram) {
      return sum + ((benchmark.industry.costPerGram - batch.costPerGram) * batch.totalWeight);
    }
    return sum;
  }, 0);

  const getProductIcon = (productType: string) => {
    switch (productType) {
      case 'cannabis': return <Leaf className="w-5 h-5 text-green-600" />;
      case 'lettuce': return <Package className="w-5 h-5 text-green-500" />;
      case 'tomatoes': return <Package className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Tracking Dashboard</h2>
          <p className="text-gray-600">Production costs per gram and per pound across all products</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calculator className="w-4 h-4" />
          <span>Dual unit tracking enabled</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Production Costs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalCosts.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Production Costs</p>
        </div>

        {/* Total Savings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${totalSavings > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalSavings > 0 ? (
                <TrendingDown className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingUp className="w-6 h-6 text-red-600" />
              )}
            </div>
            <span className="text-sm text-gray-600">vs. Baseline</span>
          </div>
          <p className={`text-2xl font-bold ${totalSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalSavings > 0 ? '+' : ''}${totalSavings.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {totalSavings > 0 ? 'Cost Savings' : 'Cost Increase'}
          </p>
        </div>

        {/* Product Mix */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Active Products</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockCostData.length}</p>
          <p className="text-sm text-gray-600">Product Types</p>
        </div>
      </div>

      {/* Product Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockCostData.map((data, index) => (
          <CostSummaryCard
            key={index}
            costData={data}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedProduct(data.productType)}
          />
        ))}
      </div>

      {/* Product Selection Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {mockCostData.map((data, index) => (
            <button
              key={index}
              onClick={() => setSelectedProduct(data.productType)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedProduct === data.productType
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getProductIcon(data.productType)}
              {data.productType.charAt(0).toUpperCase() + data.productType.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Detailed Cost Analysis */}
      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {costData
            .filter(batch => batch.cropType === selectedProduct)
            .map((batch) => (
              <DualUnitCostDisplay
                key={batch.id}
                costData={{
                  costPerGram: batch.costPerGram,
                  costPerPound: batch.costPerPound,
                  totalCost: batch.totalCost,
                  totalWeight: batch.totalWeight,
                  productType: batch.cropType as any,
                  baselineCostPerGram: analysis?.industryBenchmarks.find(
                    b => b.cropType.toLowerCase() === batch.cropType.toLowerCase()
                  )?.industry.costPerGram || 0,
                  baselineCostPerPound: analysis?.industryBenchmarks.find(
                    b => b.cropType.toLowerCase() === batch.cropType.toLowerCase()
                  )?.industry.costPerPound || 0
                }}
                showBaseline={true}
                showTrend={true}
              />
            ))}
          
          {/* Cost Breakdown Chart Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Labor</span>
                <span className="font-medium text-gray-900">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Materials</span>
                <span className="font-medium text-gray-900">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Energy</span>
                <span className="font-medium text-gray-900">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Equipment</span>
                <span className="font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {analysis?.categoryBreakdown && analysis.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown by Category</h3>
          <div className="space-y-3">
            {analysis.categoryBreakdown.sort((a, b) => b.amount - a.amount).map((category) => {
              const percentage = totalCosts > 0 ? (category.amount / totalCosts) * 100 : 0;
              return (
                <div key={category.categoryName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{category.categoryName}</span>
                    <span className="text-gray-900 font-medium">
                      ${category.amount.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Dual Unit Cost Tracking</h4>
            <p className="text-sm text-gray-600 mt-1">
              The system automatically tracks costs in both grams and pounds to accommodate cannabis (typically priced per gram) 
              and produce (typically priced per pound) within the same platform. Unit conversions are handled automatically 
              using the standard conversion rate of 453.592 grams per pound.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}