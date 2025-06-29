'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3,
  Target,
  Activity,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface CohortData {
  cohortPeriod: string;
  cohortSize: number;
  retentionData: number[];
  conversionData?: number[];
  revenueData?: number[];
}

interface CohortMetrics {
  totalCohorts: number;
  averageRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  bestPerformingCohort: {
    period: string;
    retention: number;
  };
  worstPerformingCohort: {
    period: string;
    retention: number;
  };
  retentionTrend: 'improving' | 'declining' | 'stable';
}

interface CohortAnalysisProps {
  className?: string;
  cohortType?: 'weekly' | 'monthly' | 'quarterly';
  metricType?: 'retention' | 'revenue' | 'engagement';
  timeRange?: '3m' | '6m' | '12m' | '24m';
}

export default function CohortAnalysis({
  className = '',
  cohortType = 'monthly',
  metricType = 'retention',
  timeRange = '12m'
}: CohortAnalysisProps) {
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [metrics, setMetrics] = useState<CohortMetrics | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heatmapView, setHeatmapView] = useState(true);

  // Generate mock cohort data
  const generateMockCohortData = (): { cohorts: CohortData[], metrics: CohortMetrics } => {
    const periods = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : 24;
    const cohorts: CohortData[] = [];
    
    // Generate cohorts for the specified time range
    for (let i = 0; i < periods; i++) {
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() - i);
      
      const cohortSize = Math.floor(Math.random() * 500) + 100;
      const retentionPeriods = cohortType === 'weekly' ? 12 : cohortType === 'monthly' ? 12 : 4;
      
      const retentionData: number[] = [];
      let currentRetention = 100; // Start at 100%
      
      for (let j = 0; j < retentionPeriods; j++) {
        if (j === 0) {
          retentionData.push(100); // Day 0 is always 100%
        } else {
          // Simulate realistic retention drop-off
          const dropRate = j === 1 ? 0.6 : j === 2 ? 0.8 : 0.9 + Math.random() * 0.08;
          currentRetention *= dropRate;
          retentionData.push(Math.max(currentRetention, 5)); // Minimum 5% retention
        }
      }

      // Generate revenue data for revenue cohorts
      const revenueData = metricType === 'revenue' ? retentionData.map((retention, index) => {
        const baseRevenue = Math.random() * 50 + 10;
        return (retention / 100) * baseRevenue * (1 + index * 0.1); // Growing revenue per retained user
      }) : undefined;

      cohorts.push({
        cohortPeriod: baseDate.toISOString().slice(0, 7), // YYYY-MM format
        cohortSize,
        retentionData,
        revenueData
      });
    }

    // Calculate metrics
    const day1Retentions = cohorts.map(c => c.retentionData[1] || 0);
    const day7Retentions = cohorts.map(c => c.retentionData[2] || 0);
    const day30Retentions = cohorts.map(c => c.retentionData[3] || 0);

    const bestCohort = cohorts.reduce((best, current) => 
      (current.retentionData[3] || 0) > (best.retentionData[3] || 0) ? current : best
    );

    const worstCohort = cohorts.reduce((worst, current) => 
      (current.retentionData[3] || 0) < (worst.retentionData[3] || 0) ? current : worst
    );

    // Determine trend by comparing first half vs second half of cohorts
    const firstHalf = cohorts.slice(Math.floor(cohorts.length / 2));
    const secondHalf = cohorts.slice(0, Math.floor(cohorts.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, c) => sum + (c.retentionData[3] || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, c) => sum + (c.retentionData[3] || 0), 0) / secondHalf.length;
    
    let retentionTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (firstHalfAvg > secondHalfAvg * 1.05) retentionTrend = 'improving';
    else if (firstHalfAvg < secondHalfAvg * 0.95) retentionTrend = 'declining';

    const metrics: CohortMetrics = {
      totalCohorts: cohorts.length,
      averageRetention: {
        day1: day1Retentions.reduce((sum, r) => sum + r, 0) / day1Retentions.length,
        day7: day7Retentions.reduce((sum, r) => sum + r, 0) / day7Retentions.length,
        day30: day30Retentions.reduce((sum, r) => sum + r, 0) / day30Retentions.length
      },
      bestPerformingCohort: {
        period: bestCohort.cohortPeriod,
        retention: bestCohort.retentionData[3] || 0
      },
      worstPerformingCohort: {
        period: worstCohort.cohortPeriod,
        retention: worstCohort.retentionData[3] || 0
      },
      retentionTrend
    };

    return { cohorts, metrics };
  };

  useEffect(() => {
    const loadData = () => {
      const { cohorts, metrics: generatedMetrics } = generateMockCohortData();
      setCohortData(cohorts);
      setMetrics(generatedMetrics);
      setIsLoading(false);
    };

    loadData();
  }, [cohortType, metricType, timeRange]);

  const getRetentionColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRetentionIntensity = (value: number) => {
    // Return opacity based on retention value
    return Math.max(0.1, value / 100);
  };

  const formatPeriodLabel = (period: string, index: number) => {
    const periodTypes = {
      weekly: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11'],
      monthly: ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11'],
      quarterly: ['Q0', 'Q1', 'Q2', 'Q3']
    };

    return periodTypes[cohortType][index] || `Period ${index}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-yellow-500" />;
    }
  };

  const exportData = () => {
    const csv = [
      ['Cohort Period', 'Cohort Size', ...cohortData[0]?.retentionData.map((_, i) => formatPeriodLabel('', i)) || []],
      ...cohortData.map(cohort => [
        cohort.cohortPeriod,
        cohort.cohortSize.toString(),
        ...cohort.retentionData.map(r => r.toFixed(1))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Loading cohort analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Cohort Analysis</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={cohortType}
              onChange={(e) => setCohortType(e.target.value as any)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            >
              <option value="weekly">Weekly Cohorts</option>
              <option value="monthly">Monthly Cohorts</option>
              <option value="quarterly">Quarterly Cohorts</option>
            </select>
            
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as any)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            >
              <option value="retention">User Retention</option>
              <option value="revenue">Revenue Retention</option>
              <option value="engagement">Engagement</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="24m">Last 24 Months</option>
            </select>

            <div className="flex border border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setHeatmapView(true)}
                className={`px-3 py-1 text-sm ${
                  heatmapView ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => setHeatmapView(false)}
                className={`px-3 py-1 text-sm ${
                  !heatmapView ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Table
              </button>
            </div>

            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Total Cohorts</span>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.totalCohorts}</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Day 1 Retention</span>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.averageRetention.day1.toFixed(1)}%</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Day 7 Retention</span>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.averageRetention.day7.toFixed(1)}%</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Day 30 Retention</span>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.averageRetention.day30.toFixed(1)}%</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon(metrics.retentionTrend)}
                <span className="text-sm text-gray-400">Trend</span>
              </div>
              <p className="text-lg font-bold text-white capitalize">{metrics.retentionTrend}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {heatmapView ? (
          /* Heatmap View */
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">
                        Cohort Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Size
                      </th>
                      {cohortData[0]?.retentionData.map((_, index) => (
                        <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {formatPeriodLabel('', index)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {cohortData.map((cohort, cohortIndex) => (
                      <tr 
                        key={cohort.cohortPeriod}
                        className={`hover:bg-gray-800 cursor-pointer ${
                          selectedCohort?.cohortPeriod === cohort.cohortPeriod ? 'bg-purple-900/20' : ''
                        }`}
                        onClick={() => setSelectedCohort(cohort)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-900 z-10">
                          {cohort.cohortPeriod}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {cohort.cohortSize.toLocaleString()}
                        </td>
                        {cohort.retentionData.map((retention, periodIndex) => (
                          <td key={periodIndex} className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="relative">
                              <div 
                                className={`w-full h-8 rounded flex items-center justify-center text-white text-xs font-medium ${getRetentionColor(retention)}`}
                                style={{ opacity: getRetentionIntensity(retention) }}
                              >
                                {retention.toFixed(1)}%
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cohort Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cohort Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Day 1 Retention
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Day 7 Retention
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Day 30 Retention
                  </th>
                  {metricType === 'revenue' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Revenue/User
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cohortData.map((cohort) => (
                  <tr 
                    key={cohort.cohortPeriod}
                    className={`hover:bg-gray-800 cursor-pointer ${
                      selectedCohort?.cohortPeriod === cohort.cohortPeriod ? 'bg-purple-900/20' : ''
                    }`}
                    onClick={() => setSelectedCohort(cohort)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {cohort.cohortPeriod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {cohort.cohortSize.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {(cohort.retentionData[1] || 0).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {(cohort.retentionData[2] || 0).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {(cohort.retentionData[3] || 0).toFixed(1)}%
                    </td>
                    {metricType === 'revenue' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        ${(cohort.revenueData?.[3] || 0).toFixed(2)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cohort Details */}
        {selectedCohort && (
          <div className="mt-6 bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Cohort Details: {selectedCohort.cohortPeriod}
              </h3>
              <button
                onClick={() => setSelectedCohort(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Retention Curve</h4>
                <div className="h-48 bg-gray-800 rounded-lg p-4 flex items-end gap-2">
                  {selectedCohort.retentionData.map((retention, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${retention * 1.5}px` }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-2 transform -rotate-45">
                        {formatPeriodLabel('', index)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Key Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Initial Cohort Size</span>
                    <span className="text-sm font-medium text-white">{selectedCohort.cohortSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Day 1 Retention</span>
                    <span className="text-sm font-medium text-white">{(selectedCohort.retentionData[1] || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Day 7 Retention</span>
                    <span className="text-sm font-medium text-white">{(selectedCohort.retentionData[2] || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Day 30 Retention</span>
                    <span className="text-sm font-medium text-white">{(selectedCohort.retentionData[3] || 0).toFixed(1)}%</span>
                  </div>
                  {metricType === 'revenue' && selectedCohort.revenueData && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Revenue per User (Day 30)</span>
                      <span className="text-sm font-medium text-white">${selectedCohort.revenueData[3].toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">80%+ Retention</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">40-80% Retention</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">&lt;40% Retention</span>
            </div>
          </div>

          {metrics && (
            <div className="text-sm text-gray-400">
              Best: {metrics.bestPerformingCohort.period} ({metrics.bestPerformingCohort.retention.toFixed(1)}%) • 
              Worst: {metrics.worstPerformingCohort.period} ({metrics.worstPerformingCohort.retention.toFixed(1)}%)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}