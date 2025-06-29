'use client';

import React, { useState } from 'react';
import { ArrowUpDown, DollarSign, Weight, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { RevenueShareService } from '@/services/revenue-sharing/RevenueShareService';

interface CostData {
  costPerGram: number;
  costPerPound: number;
  totalCost: number;
  totalWeight: number; // in grams
  productType: 'cannabis' | 'lettuce' | 'tomatoes' | 'herbs' | 'other';
  baselineCostPerGram?: number;
  baselineCostPerPound?: number;
}

interface DualUnitCostDisplayProps {
  costData: CostData;
  showBaseline?: boolean;
  showTrend?: boolean;
  compact?: boolean;
  className?: string;
}

export function DualUnitCostDisplay({ 
  costData, 
  showBaseline = false, 
  showTrend = false,
  compact = false,
  className = ''
}: DualUnitCostDisplayProps) {
  const [primaryUnit, setPrimaryUnit] = useState<'gram' | 'pound'>(
    RevenueShareService.getPreferredUnit(costData.productType)
  );

  const displayFormat = RevenueShareService.formatCostDisplay(
    costData.costPerGram,
    costData.costPerPound,
    costData.productType
  );

  const toggleUnit = () => {
    setPrimaryUnit(primaryUnit === 'gram' ? 'pound' : 'gram');
  };

  const calculateSavings = () => {
    if (!costData.baselineCostPerGram) return null;
    
    return RevenueShareService.calculateCostSavingsWithUnits(
      costData.baselineCostPerGram,
      costData.costPerGram,
      costData.totalWeight,
      costData.productType
    );
  };

  const savings = calculateSavings();
  const weightInPounds = RevenueShareService.convertGramsToPounds(costData.totalWeight);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <DollarSign className="w-4 h-4 text-gray-500" />
        <button
          onClick={toggleUnit}
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
        >
          {primaryUnit === 'gram' ? displayFormat.primary.formatted : displayFormat.secondary.formatted}
          <ArrowUpDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Cost Analysis</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Weight className="w-4 h-4" />
          <span>{costData.totalWeight.toLocaleString()}g ({weightInPounds.toFixed(2)}lb)</span>
        </div>
      </div>

      {/* Primary Cost Display */}
      <div className="mb-4">
        <button
          onClick={toggleUnit}
          className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <div className="text-left">
            <p className="text-sm text-gray-600">Cost per {primaryUnit}</p>
            <p className="text-2xl font-bold text-purple-600">
              {primaryUnit === 'gram' ? displayFormat.primary.formatted : displayFormat.secondary.formatted}
            </p>
          </div>
          <ArrowUpDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Secondary Unit Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Also: {primaryUnit === 'gram' ? displayFormat.secondary.formatted : displayFormat.primary.formatted}
        </p>
      </div>

      {/* Total Cost */}
      <div className="flex items-center justify-between mb-4 p-3 border border-gray-200 rounded-lg">
        <span className="text-sm text-gray-600">Total Cost</span>
        <span className="font-semibold text-gray-900">${costData.totalCost.toFixed(2)}</span>
      </div>

      {/* Baseline Comparison */}
      {showBaseline && savings && (
        <div className="space-y-3">
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm font-medium text-gray-900 mb-2">vs. Baseline</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Baseline</p>
                <p className="font-medium text-gray-900">
                  ${costData.baselineCostPerGram?.toFixed(2)}/g
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Current</p>
                <p className="font-medium text-gray-900">
                  ${costData.costPerGram.toFixed(2)}/g
                </p>
              </div>
            </div>

            {/* Savings Display */}
            <div className={`mt-3 p-3 rounded-lg ${
              savings.totalSavings > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {savings.totalSavings > 0 ? (
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    savings.totalSavings > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {savings.totalSavings > 0 ? 'Cost Savings' : 'Cost Increase'}
                  </span>
                </div>
                <span className={`font-bold ${
                  savings.totalSavings > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(savings.totalSavings).toFixed(2)}
                </span>
              </div>
              
              <div className="mt-2 text-xs text-gray-600">
                <p>Per gram: ${Math.abs(savings.savingsPerGram).toFixed(3)} • Per pound: ${Math.abs(savings.savingsPerPound).toFixed(2)}</p>
                <p>Improvement: {savings.percentImprovement.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Type Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Info className="w-3 h-3" />
        <span>
          {costData.productType.charAt(0).toUpperCase() + costData.productType.slice(1)} • 
          Primary unit: {RevenueShareService.getPreferredUnit(costData.productType)}
        </span>
      </div>
    </div>
  );
}

// Quick summary component for dashboards
export function CostSummaryCard({ costData, className = '' }: { costData: CostData; className?: string }) {
  const displayFormat = RevenueShareService.formatCostDisplay(
    costData.costPerGram,
    costData.costPerPound,
    costData.productType
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Production Cost</p>
          <p className="text-lg font-bold text-gray-900">{displayFormat.primary.formatted}</p>
          <p className="text-xs text-gray-500">{displayFormat.secondary.formatted}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="font-semibold text-gray-900">${costData.totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500">
            {costData.totalWeight.toLocaleString()}g
          </p>
        </div>
      </div>
    </div>
  );
}