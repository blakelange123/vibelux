'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  DollarSign, BarChart3, PieChart, Calculator,
  Shield, FileText, Download, RefreshCw, Eye,
  Building, Calendar, Percent, Clock
} from 'lucide-react';
import { EnhancedReportGenerator } from '@/components/reports/EnhancedReportGenerator';

interface DueDiligenceReport {
  facility: {
    id: string;
    period: string;
    reportDate: string;
    currency: string;
    accountingProvider: string;
  };
  financialPerformance: {
    totalRevenue: number;
    grossProfit: number;
    netIncome: number;
    ebitda: number;
    operatingMargin: number;
    netMargin: number;
    monthlyRevenueGrowth: number;
    revenueConsistency: number;
  };
  cashFlow: {
    operatingCashFlow: number;
    freeCashFlow: number;
    cashFlowToRevenue: number;
    averageMonthlyCashFlow: number;
    cashFlowVolatility: number;
  };
  balanceSheetMetrics: {
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    currentRatio: number;
    debtToEquity: number;
    assetTurnover: number;
    workingCapital: number;
  };
  revenueQuality: {
    customerConcentration: {
      topCustomerPercent: number;
      top5CustomerPercent: number;
    };
    recurringRevenue: number;
    contractedRevenue: number;
    revenueBacklog: number;
    averageContractValue: number;
    churnRate: number;
  };
  investmentReadiness: {
    overallScore: number;
    financialStability: number;
    growthPotential: number;
    cashFlowPredictability: number;
    riskFactors: string[];
    recommendations: string[];
  };
  revenueSharingProjections: {
    projectedMonthlyRevenue: number;
    estimatedInvestorReturn: number;
    paybackPeriod: number;
    expectedIRR: number;
    riskAdjustedReturn: number;
  };
  riskAssessment: {
    creditRisk: string;
    operationalRisk: string;
    marketRisk: string;
    concentrationRisk: string;
    liquidityRisk: string;
  };
}

interface DueDiligenceDashboardProps {
  facilityId: string;
  investmentId?: string;
}

export function DueDiligenceDashboard({ facilityId, investmentId }: DueDiligenceDashboardProps) {
  const [report, setReport] = useState<DueDiligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('12');
  const [showEnhancedReports, setShowEnhancedReports] = useState(false);

  useEffect(() => {
    fetchDueDiligenceReport();
  }, [facilityId, investmentId, period]);

  const fetchDueDiligenceReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        facilityId,
        period,
        ...(investmentId && { investmentId })
      });

      const response = await fetch(`/api/investment/due-diligence?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch due diligence report');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400 bg-green-400/10';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
      case 'HIGH': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-purple-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Analyzing financial data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Due Diligence Error</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDueDiligenceReport}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Investment Due Diligence</h1>
            <p className="text-gray-400">{report.facility.accountingProvider} Financial Analysis • {report.facility.period} • Updated {new Date(report.facility.reportDate).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
            </select>
            <button
              onClick={fetchDueDiligenceReport}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={() => setShowEnhancedReports(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Professional Report
            </button>
          </div>
        </div>

        {/* Investment Readiness Score */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Investment Readiness Score</h2>
              <p className="text-gray-400">Comprehensive assessment based on financial data</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(report.investmentReadiness.overallScore)}`}>
                {report.investmentReadiness.overallScore}/100
              </div>
              <p className="text-sm text-gray-400 mt-1">Overall Score</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(report.investmentReadiness.financialStability)}`}>
                {report.investmentReadiness.financialStability}
              </div>
              <p className="text-sm text-gray-400">Financial Stability</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(report.investmentReadiness.growthPotential)}`}>
                {report.investmentReadiness.growthPotential}
              </div>
              <p className="text-sm text-gray-400">Growth Potential</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(report.investmentReadiness.cashFlowPredictability)}`}>
                {report.investmentReadiness.cashFlowPredictability}
              </div>
              <p className="text-sm text-gray-400">Cash Flow Predictability</p>
            </div>
          </div>
        </div>

        {/* Revenue Sharing Projections */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Revenue Sharing Projections
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Monthly Revenue</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(report.revenueSharingProjections.projectedMonthlyRevenue)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Investor Return</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(report.revenueSharingProjections.estimatedInvestorReturn)}
              </div>
              <div className="text-xs text-gray-500">per month</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Payback Period</span>
              </div>
              <div className="text-xl font-bold text-white">
                {report.revenueSharingProjections.paybackPeriod} mos
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Expected IRR</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatPercentage(report.revenueSharingProjections.expectedIRR)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">Risk Adjusted</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatPercentage(report.revenueSharingProjections.riskAdjustedReturn)}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Financial Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Revenue</span>
                <span className="font-semibold">{formatCurrency(report.financialPerformance.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Gross Profit</span>
                <span className="font-semibold">{formatCurrency(report.financialPerformance.grossProfit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Net Income</span>
                <span className="font-semibold">{formatCurrency(report.financialPerformance.netIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">EBITDA</span>
                <span className="font-semibold">{formatCurrency(report.financialPerformance.ebitda)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <span className="text-gray-400">Operating Margin</span>
                <span className="font-semibold">{formatPercentage(report.financialPerformance.operatingMargin)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Net Margin</span>
                <span className="font-semibold">{formatPercentage(report.financialPerformance.netMargin)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Monthly Growth</span>
                <span className={`font-semibold flex items-center gap-1 ${report.financialPerformance.monthlyRevenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {report.financialPerformance.monthlyRevenueGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {formatPercentage(report.financialPerformance.monthlyRevenueGrowth)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Balance Sheet Health
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Assets</span>
                <span className="font-semibold">{formatCurrency(report.balanceSheetMetrics.totalAssets)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Liabilities</span>
                <span className="font-semibold">{formatCurrency(report.balanceSheetMetrics.totalLiabilities)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Equity</span>
                <span className="font-semibold">{formatCurrency(report.balanceSheetMetrics.equity)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Working Capital</span>
                <span className="font-semibold">{formatCurrency(report.balanceSheetMetrics.workingCapital)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <span className="text-gray-400">Current Ratio</span>
                <span className="font-semibold">{report.balanceSheetMetrics.currentRatio.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Debt-to-Equity</span>
                <span className="font-semibold">{report.balanceSheetMetrics.debtToEquity.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Asset Turnover</span>
                <span className="font-semibold">{report.balanceSheetMetrics.assetTurnover.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(report.riskAssessment).map(([risk, level]) => (
              <div key={risk} className="text-center">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(level)}`}>
                  {level}
                </div>
                <p className="text-xs text-gray-400 mt-2 capitalize">
                  {risk.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
            ))}
          </div>
          
          {/* Risk Factors */}
          {report.investmentReadiness.riskFactors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Factors
              </h4>
              <ul className="space-y-2">
                {report.investmentReadiness.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommendations */}
          {report.investmentReadiness.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-green-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {report.investmentReadiness.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Data Source Notice */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400">Data Source Verification</h4>
              <p className="text-sm text-gray-300 mt-1">
                This analysis is based on verified {report.facility.accountingProvider} financial data. All figures are automatically synchronized 
                and calculated using standardized financial metrics. For investment decisions, please also review 
                additional documentation including audited financials, tax returns, and legal agreements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Report Generator */}
      {showEnhancedReports && (
        <EnhancedReportGenerator
          data={report}
          type="investment"
          onClose={() => setShowEnhancedReports(false)}
        />
      )}
    </div>
  );
}

export default DueDiligenceDashboard;