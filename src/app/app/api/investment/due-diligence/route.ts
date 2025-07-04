import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createAccountingAdapter } from '@/lib/integrations/accounting-adapter';

// Investment Due Diligence API for Revenue Sharing Programs
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const investmentId = searchParams.get('investmentId');
    const period = searchParams.get('period') || '12'; // months
    
    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID required for due diligence' },
        { status: 400 }
      );
    }

    // Get accounting integration (supports multiple providers)
    const integration = await prisma.financialIntegration.findFirst({
      where: {
        userId,
        facilityId,
        provider: { in: ['QUICKBOOKS', 'XERO', 'NETSUITE', 'FRESHBOOKS', 'WAVE'] },
        active: true
      }
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Accounting software integration required for financial due diligence. Supported: QuickBooks, Xero, NetSuite, FreshBooks, Wave' },
        { status: 404 }
      );
    }

    const accountingAdapter = createAccountingAdapter(integration.provider, {
      provider: integration.provider,
      companyId: integration.config.companyId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      sandbox: integration.config.sandbox || false
    });

    // Calculate date ranges for analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(period));
    
    // Parallel data collection for comprehensive due diligence
    const [
      profitLoss,
      balanceSheet,
      cashFlow,
      invoices,
      expenses,
      revenue,
      assets
    ] = await Promise.all([
      accountingAdapter.getProfitAndLoss(startDate, endDate),
      accountingAdapter.getBalanceSheet(endDate),
      accountingAdapter.getCashFlow(startDate, endDate),
      accountingAdapter.getInvoices(startDate, endDate),
      accountingAdapter.getExpenses(startDate, endDate),
      accountingAdapter.getRevenue(startDate, endDate),
      accountingAdapter.getAssets()
    ]);

    // Calculate investment metrics
    const dueDiligenceReport = {
      facility: {
        id: facilityId,
        period: `${period} months`,
        reportDate: new Date().toISOString(),
        currency: 'USD',
        accountingProvider: integration.provider
      },
      
      // Financial Performance
      financialPerformance: {
        totalRevenue: profitLoss.totalRevenue || 0,
        grossProfit: profitLoss.grossProfit || 0,
        netIncome: profitLoss.netIncome || 0,
        ebitda: calculateEBITDA(profitLoss),
        operatingMargin: calculateOperatingMargin(profitLoss),
        netMargin: calculateNetMargin(profitLoss),
        monthlyRevenueGrowth: calculateRevenueGrowth(revenue),
        revenueConsistency: calculateRevenueConsistency(revenue)
      },

      // Cash Flow Analysis
      cashFlow: {
        operatingCashFlow: cashFlow.operatingCashFlow || 0,
        freeCashFlow: cashFlow.freeCashFlow || 0,
        cashFlowToRevenue: calculateCashFlowRatio(cashFlow, profitLoss),
        averageMonthlyCashFlow: calculateAverageCashFlow(cashFlow),
        cashFlowVolatility: calculateCashFlowVolatility(cashFlow)
      },

      // Balance Sheet Health
      balanceSheetMetrics: {
        totalAssets: balanceSheet.totalAssets || 0,
        totalLiabilities: balanceSheet.totalLiabilities || 0,
        equity: balanceSheet.equity || 0,
        currentRatio: calculateCurrentRatio(balanceSheet),
        debtToEquity: calculateDebtToEquity(balanceSheet),
        assetTurnover: calculateAssetTurnover(profitLoss, balanceSheet),
        workingCapital: calculateWorkingCapital(balanceSheet)
      },

      // Revenue Quality & Predictability
      revenueQuality: {
        customerConcentration: calculateCustomerConcentration(invoices),
        recurringRevenue: calculateRecurringRevenue(invoices),
        contractedRevenue: calculateContractedRevenue(invoices),
        revenueBacklog: calculateRevenueBacklog(invoices),
        averageContractValue: calculateAverageContractValue(invoices),
        churnRate: calculateChurnRate(invoices, period)
      },

      // Investment Readiness Score
      investmentReadiness: {
        overallScore: 0, // Will be calculated
        financialStability: 0,
        growthPotential: 0,
        cashFlowPredictability: 0,
        riskFactors: [],
        recommendations: []
      },

      // Revenue Sharing Projections
      revenueSharingProjections: {
        projectedMonthlyRevenue: calculateProjectedRevenue(revenue),
        estimatedInvestorReturn: 0, // Will be calculated based on investment terms
        paybackPeriod: 0,
        expectedIRR: 0,
        riskAdjustedReturn: 0
      },

      // Red Flags & Risk Assessment
      riskAssessment: {
        creditRisk: assessCreditRisk(balanceSheet, cashFlow),
        operationalRisk: assessOperationalRisk(profitLoss, expenses),
        marketRisk: assessMarketRisk(revenue),
        concentrationRisk: assessConcentrationRisk(invoices),
        liquidityRisk: assessLiquidityRisk(balanceSheet, cashFlow)
      },

      // Supporting Documents
      supportingData: {
        auditedFinancials: false, // Would need to be manually verified
        taxReturns: false, // Would need to be provided separately
        contracts: [], // Would come from separate upload
        insurancePolicies: [], // Would come from separate upload
        licenses: [] // Would come from compliance system
      }
    };

    // Calculate composite scores
    dueDiligenceReport.investmentReadiness = calculateInvestmentReadiness(dueDiligenceReport);
    dueDiligenceReport.revenueSharingProjections = calculateRevenueSharingProjections(
      dueDiligenceReport,
      investmentId
    );

    return NextResponse.json(dueDiligenceReport);

  } catch (error) {
    console.error('Due diligence analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform due diligence analysis' },
      { status: 500 }
    );
  }
}

// Helper functions for financial calculations

function calculateEBITDA(profitLoss: any): number {
  const netIncome = profitLoss.netIncome || 0;
  const interest = profitLoss.interestExpense || 0;
  const taxes = profitLoss.taxExpense || 0;
  const depreciation = profitLoss.depreciation || 0;
  const amortization = profitLoss.amortization || 0;
  
  return netIncome + interest + taxes + depreciation + amortization;
}

function calculateOperatingMargin(profitLoss: any): number {
  const operatingIncome = profitLoss.operatingIncome || 0;
  const totalRevenue = profitLoss.totalRevenue || 0;
  
  return totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
}

function calculateNetMargin(profitLoss: any): number {
  const netIncome = profitLoss.netIncome || 0;
  const totalRevenue = profitLoss.totalRevenue || 0;
  
  return totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
}

function calculateCurrentRatio(balanceSheet: any): number {
  const currentAssets = balanceSheet.currentAssets || 0;
  const currentLiabilities = balanceSheet.currentLiabilities || 0;
  
  return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
}

function calculateDebtToEquity(balanceSheet: any): number {
  const totalLiabilities = balanceSheet.totalLiabilities || 0;
  const equity = balanceSheet.equity || 0;
  
  return equity > 0 ? totalLiabilities / equity : 0;
}

function calculateWorkingCapital(balanceSheet: any): number {
  const currentAssets = balanceSheet.currentAssets || 0;
  const currentLiabilities = balanceSheet.currentLiabilities || 0;
  
  return currentAssets - currentLiabilities;
}

function calculateCustomerConcentration(invoices: any[]): any {
  if (!invoices || invoices.length === 0) return { topCustomerPercent: 0, top5CustomerPercent: 0 };
  
  const customerRevenue = invoices.reduce((acc, invoice) => {
    const customerId = invoice.customerId;
    acc[customerId] = (acc[customerId] || 0) + (invoice.amount || 0);
    return acc;
  }, {});
  
  const sortedCustomers = Object.values(customerRevenue).sort((a: any, b: any) => b - a);
  const totalRevenue = sortedCustomers.reduce((sum: number, rev: any) => sum + rev, 0);
  
  return {
    topCustomerPercent: totalRevenue > 0 ? (sortedCustomers[0] || 0) / totalRevenue * 100 : 0,
    top5CustomerPercent: totalRevenue > 0 ? 
      sortedCustomers.slice(0, 5).reduce((sum: number, rev: any) => sum + rev, 0) / totalRevenue * 100 : 0
  };
}

function calculateRecurringRevenue(invoices: any[]): number {
  // This would need business logic to identify recurring vs one-time revenue
  // For now, estimate based on invoice patterns
  if (!invoices || invoices.length === 0) return 0;
  
  const monthlyRevenue = invoices.reduce((acc, invoice) => {
    const month = new Date(invoice.date).toISOString().substring(0, 7);
    acc[month] = (acc[month] || 0) + (invoice.amount || 0);
    return acc;
  }, {});
  
  const avgMonthlyRevenue = Object.values(monthlyRevenue).reduce((sum: number, rev: any) => sum + rev, 0) / Object.keys(monthlyRevenue).length;
  
  // Estimate recurring as 70% of average (would need better logic in production)
  return avgMonthlyRevenue * 0.7;
}

function calculateRevenueGrowth(revenue: any[]): number {
  if (!revenue || revenue.length < 2) return 0;
  
  const sortedRevenue = revenue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstMonth = sortedRevenue[0].amount || 0;
  const lastMonth = sortedRevenue[sortedRevenue.length - 1].amount || 0;
  
  return firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
}

function calculateInvestmentReadiness(report: any): any {
  const financialStability = Math.min(100, (
    (report.balanceSheetMetrics.currentRatio > 1.5 ? 25 : report.balanceSheetMetrics.currentRatio * 16.67) +
    (report.balanceSheetMetrics.debtToEquity < 0.5 ? 25 : Math.max(0, 25 - report.balanceSheetMetrics.debtToEquity * 50)) +
    (report.financialPerformance.netMargin > 10 ? 25 : report.financialPerformance.netMargin * 2.5) +
    (report.cashFlow.operatingCashFlow > 0 ? 25 : 0)
  ));
  
  const growthPotential = Math.min(100, Math.max(0, 
    report.financialPerformance.monthlyRevenueGrowth * 10 + 50
  ));
  
  const cashFlowPredictability = Math.min(100, (
    (report.revenueQuality.recurringRevenue / report.financialPerformance.totalRevenue * 100 * 0.7) +
    (Math.max(0, 100 - report.cashFlow.cashFlowVolatility) * 0.3)
  ));
  
  const overallScore = (financialStability + growthPotential + cashFlowPredictability) / 3;
  
  const riskFactors = [];
  const recommendations = [];
  
  if (report.balanceSheetMetrics.currentRatio < 1.2) {
    riskFactors.push('Low liquidity ratio - potential cash flow issues');
    recommendations.push('Improve working capital management');
  }
  
  if (report.revenueQuality.customerConcentration.topCustomerPercent > 30) {
    riskFactors.push('High customer concentration risk');
    recommendations.push('Diversify customer base to reduce dependency');
  }
  
  if (report.financialPerformance.netMargin < 5) {
    riskFactors.push('Low profit margins');
    recommendations.push('Focus on operational efficiency and cost management');
  }
  
  return {
    overallScore: Math.round(overallScore),
    financialStability: Math.round(financialStability),
    growthPotential: Math.round(growthPotential),
    cashFlowPredictability: Math.round(cashFlowPredictability),
    riskFactors,
    recommendations
  };
}

function calculateRevenueSharingProjections(report: any, investmentId: string | null): any {
  const monthlyRevenue = report.financialPerformance.totalRevenue / 12;
  const growthRate = Math.max(0, report.financialPerformance.monthlyRevenueGrowth / 100);
  
  // Project revenue with growth
  const projectedMonthlyRevenue = monthlyRevenue * (1 + growthRate);
  
  // These would be configured based on investment terms
  const revenueSharePercentage = 15; // 15% revenue share (typical)
  const investmentAmount = 100000; // Would come from investment record
  
  const monthlyReturn = projectedMonthlyRevenue * (revenueSharePercentage / 100);
  const paybackPeriod = monthlyReturn > 0 ? investmentAmount / monthlyReturn : 0;
  const annualReturn = monthlyReturn * 12;
  const expectedIRR = investmentAmount > 0 ? (annualReturn / investmentAmount) * 100 : 0;
  
  // Risk adjustment based on overall score
  const riskAdjustment = report.investmentReadiness.overallScore / 100;
  const riskAdjustedReturn = expectedIRR * riskAdjustment;
  
  return {
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
    estimatedInvestorReturn: Math.round(monthlyReturn),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10, // months
    expectedIRR: Math.round(expectedIRR * 10) / 10,
    riskAdjustedReturn: Math.round(riskAdjustedReturn * 10) / 10
  };
}

// Risk assessment functions
function assessCreditRisk(balanceSheet: any, cashFlow: any): string {
  const currentRatio = balanceSheet.currentAssets / (balanceSheet.currentLiabilities || 1);
  const cashFlowCoverage = cashFlow.operatingCashFlow / (balanceSheet.currentLiabilities || 1);
  
  if (currentRatio > 2 && cashFlowCoverage > 0.3) return 'LOW';
  if (currentRatio > 1.2 && cashFlowCoverage > 0.1) return 'MEDIUM';
  return 'HIGH';
}

function assessOperationalRisk(profitLoss: any, expenses: any[]): string {
  const operatingMargin = (profitLoss.operatingIncome || 0) / (profitLoss.totalRevenue || 1) * 100;
  const expenseVolatility = calculateExpenseVolatility(expenses);
  
  if (operatingMargin > 15 && expenseVolatility < 0.2) return 'LOW';
  if (operatingMargin > 5 && expenseVolatility < 0.4) return 'MEDIUM';
  return 'HIGH';
}

function assessMarketRisk(revenue: any[]): string {
  const revenueVolatility = calculateRevenueVolatility(revenue);
  
  if (revenueVolatility < 0.1) return 'LOW';
  if (revenueVolatility < 0.3) return 'MEDIUM';
  return 'HIGH';
}

function assessConcentrationRisk(invoices: any[]): string {
  const concentration = calculateCustomerConcentration(invoices);
  
  if (concentration.topCustomerPercent < 20) return 'LOW';
  if (concentration.topCustomerPercent < 40) return 'MEDIUM';
  return 'HIGH';
}

function assessLiquidityRisk(balanceSheet: any, cashFlow: any): string {
  const currentRatio = (balanceSheet.currentAssets || 0) / (balanceSheet.currentLiabilities || 1);
  const operatingCashFlow = cashFlow.operatingCashFlow || 0;
  
  if (currentRatio > 1.5 && operatingCashFlow > 0) return 'LOW';
  if (currentRatio > 1.0 && operatingCashFlow >= 0) return 'MEDIUM';
  return 'HIGH';
}

// Additional helper functions (simplified implementations)
function calculateRevenueConsistency(revenue: any[]): number {
  return revenue.length > 0 ? 1 - calculateRevenueVolatility(revenue) : 0;
}

function calculateCashFlowRatio(cashFlow: any, profitLoss: any): number {
  return profitLoss.totalRevenue > 0 ? (cashFlow.operatingCashFlow || 0) / profitLoss.totalRevenue : 0;
}

function calculateAverageCashFlow(cashFlow: any): number {
  return cashFlow.operatingCashFlow || 0; // Simplified
}

function calculateCashFlowVolatility(cashFlow: any): number {
  return 0.2; // Simplified - would need historical data
}

function calculateAssetTurnover(profitLoss: any, balanceSheet: any): number {
  return balanceSheet.totalAssets > 0 ? (profitLoss.totalRevenue || 0) / balanceSheet.totalAssets : 0;
}

function calculateContractedRevenue(invoices: any[]): number {
  return 0; // Would need contract data
}

function calculateRevenueBacklog(invoices: any[]): number {
  return 0; // Would need future contract data
}

function calculateAverageContractValue(invoices: any[]): number {
  if (!invoices || invoices.length === 0) return 0;
  const total = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  return total / invoices.length;
}

function calculateChurnRate(invoices: any[], period: string): number {
  return 0; // Would need customer lifecycle data
}

function calculateProjectedRevenue(revenue: any[]): number {
  if (!revenue || revenue.length === 0) return 0;
  const avgRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0) / revenue.length;
  return avgRevenue * 1.1; // 10% growth assumption
}

function calculateRevenueVolatility(revenue: any[]): number {
  if (!revenue || revenue.length < 2) return 0;
  const amounts = revenue.map(r => r.amount || 0);
  const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
  return Math.sqrt(variance) / avg;
}

function calculateExpenseVolatility(expenses: any[]): number {
  return 0.2; // Simplified implementation
}