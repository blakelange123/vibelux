import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { DocumentAnalyzer } from '@/lib/integrations/document-analyzer';

// POST /api/investment/due-diligence-manual - Generate due diligence from uploaded documents
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { facilityId, period = '12', investmentId } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID required for due diligence' },
        { status: 400 }
      );
    }

    // Get uploaded financial documents for this facility
    const documents = await prisma.financialDocument.findMany({
      where: {
        userId,
        facilityId,
        processingStatus: 'COMPLETED',
        confidence: { gte: 50 } // Only use documents with reasonable confidence
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No processed financial documents found. Please upload financial statements first.' },
        { status: 404 }
      );
    }

    // Organize documents by type
    const documentsByType = documents.reduce((acc, doc) => {
      if (!acc[doc.documentType]) {
        acc[doc.documentType] = [];
      }
      acc[doc.documentType].push(doc);
      return acc;
    }, {} as Record<string, typeof documents>);

    // Extract financial data from documents
    const profitLossDoc = documentsByType.profit_loss?.[0];
    const balanceSheetDoc = documentsByType.balance_sheet?.[0];
    const cashFlowDoc = documentsByType.cash_flow?.[0];
    const bankStatements = documentsByType.bank_statement || [];

    // Build financial data structures
    const profitLoss = profitLossDoc?.extractedData || {
      totalRevenue: 0,
      grossProfit: 0,
      operatingIncome: 0,
      netIncome: 0,
      operatingExpenses: 0,
      interestExpense: 0,
      taxExpense: 0,
      depreciation: 0,
      amortization: 0
    };

    const balanceSheet = balanceSheetDoc?.extractedData || {
      totalAssets: 0,
      currentAssets: 0,
      totalLiabilities: 0,
      currentLiabilities: 0,
      equity: 0
    };

    const cashFlow = cashFlowDoc?.extractedData || {
      operatingCashFlow: 0,
      investingCashFlow: 0,
      financingCashFlow: 0,
      freeCashFlow: 0,
      netCashFlow: 0
    };

    // Generate revenue data from bank statements or invoices
    const revenue = bankStatements.length > 0 
      ? generateRevenueFromBankStatements(bankStatements)
      : [{ date: new Date().toISOString(), amount: profitLoss.totalRevenue || 0 }];

    // Calculate investment metrics using the same logic as integrated accounting
    const dueDiligenceReport = {
      facility: {
        id: facilityId,
        period: `${period} months`,
        reportDate: new Date().toISOString(),
        currency: documents[0]?.currency || 'USD',
        accountingProvider: 'MANUAL_UPLOAD',
        dataSource: {
          documentsUsed: documents.length,
          documentTypes: Object.keys(documentsByType),
          averageConfidence: Math.round(
            documents.reduce((sum, doc) => sum + doc.confidence, 0) / documents.length
          ),
          oldestDocument: documents[documents.length - 1]?.createdAt,
          newestDocument: documents[0]?.createdAt
        }
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

      // Revenue Quality & Predictability (limited without detailed transaction data)
      revenueQuality: {
        customerConcentration: { topCustomerPercent: 0, top5CustomerPercent: 0 },
        recurringRevenue: 0,
        contractedRevenue: 0,
        revenueBacklog: 0,
        averageContractValue: 0,
        churnRate: 0
      },

      // Investment Readiness Score
      investmentReadiness: {
        overallScore: 0,
        financialStability: 0,
        growthPotential: 0,
        cashFlowPredictability: 0,
        riskFactors: [],
        recommendations: []
      },

      // Revenue Sharing Projections
      revenueSharingProjections: {
        projectedMonthlyRevenue: 0,
        estimatedInvestorReturn: 0,
        paybackPeriod: 0,
        expectedIRR: 0,
        riskAdjustedReturn: 0
      },

      // Risk Assessment
      riskAssessment: {
        creditRisk: assessCreditRisk(balanceSheet, cashFlow),
        operationalRisk: assessOperationalRisk(profitLoss),
        marketRisk: assessMarketRisk(revenue),
        concentrationRisk: 'UNKNOWN',
        liquidityRisk: assessLiquidityRisk(balanceSheet, cashFlow)
      },

      // Data quality and limitations
      dataQuality: {
        completeness: calculateDataCompleteness(documentsByType),
        confidence: Math.round(
          documents.reduce((sum, doc) => sum + doc.confidence, 0) / documents.length
        ),
        limitations: identifyDataLimitations(documentsByType),
        recommendations: generateDataRecommendations(documentsByType)
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
    console.error('Manual due diligence analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform due diligence analysis from uploaded documents' },
      { status: 500 }
    );
  }
}

// Helper functions (reusing logic from the integrated version)
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

function calculateRevenueGrowth(revenue: any[]): number {
  if (!revenue || revenue.length < 2) return 0;
  
  const sortedRevenue = revenue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstMonth = sortedRevenue[0].amount || 0;
  const lastMonth = sortedRevenue[sortedRevenue.length - 1].amount || 0;
  
  return firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
}

function calculateRevenueConsistency(revenue: any[]): number {
  return revenue.length > 0 ? 1 - calculateRevenueVolatility(revenue) : 0;
}

function calculateRevenueVolatility(revenue: any[]): number {
  if (!revenue || revenue.length < 2) return 0;
  const amounts = revenue.map(r => r.amount || 0);
  const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
  return avg > 0 ? Math.sqrt(variance) / avg : 0;
}

function calculateCashFlowRatio(cashFlow: any, profitLoss: any): number {
  return profitLoss.totalRevenue > 0 ? (cashFlow.operatingCashFlow || 0) / profitLoss.totalRevenue : 0;
}

function calculateAverageCashFlow(cashFlow: any): number {
  return cashFlow.operatingCashFlow || 0;
}

function calculateCashFlowVolatility(cashFlow: any): number {
  return 0.2; // Simplified
}

function calculateAssetTurnover(profitLoss: any, balanceSheet: any): number {
  return balanceSheet.totalAssets > 0 ? (profitLoss.totalRevenue || 0) / balanceSheet.totalAssets : 0;
}

function assessCreditRisk(balanceSheet: any, cashFlow: any): string {
  const currentRatio = (balanceSheet.currentAssets || 0) / (balanceSheet.currentLiabilities || 1);
  const cashFlowCoverage = (cashFlow.operatingCashFlow || 0) / (balanceSheet.currentLiabilities || 1);
  
  if (currentRatio > 2 && cashFlowCoverage > 0.3) return 'LOW';
  if (currentRatio > 1.2 && cashFlowCoverage > 0.1) return 'MEDIUM';
  return 'HIGH';
}

function assessOperationalRisk(profitLoss: any): string {
  const operatingMargin = (profitLoss.operatingIncome || 0) / (profitLoss.totalRevenue || 1) * 100;
  
  if (operatingMargin > 15) return 'LOW';
  if (operatingMargin > 5) return 'MEDIUM';
  return 'HIGH';
}

function assessMarketRisk(revenue: any[]): string {
  const volatility = calculateRevenueVolatility(revenue);
  
  if (volatility < 0.1) return 'LOW';
  if (volatility < 0.3) return 'MEDIUM';
  return 'HIGH';
}

function assessLiquidityRisk(balanceSheet: any, cashFlow: any): string {
  const currentRatio = (balanceSheet.currentAssets || 0) / (balanceSheet.currentLiabilities || 1);
  const operatingCashFlow = cashFlow.operatingCashFlow || 0;
  
  if (currentRatio > 1.5 && operatingCashFlow > 0) return 'LOW';
  if (currentRatio > 1.0 && operatingCashFlow >= 0) return 'MEDIUM';
  return 'HIGH';
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
  
  if (report.dataQuality.confidence < 80) {
    riskFactors.push('Document analysis confidence below 80% - data quality concerns');
    recommendations.push('Verify extracted financial data and consider providing additional documentation');
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
  
  const projectedMonthlyRevenue = monthlyRevenue * (1 + growthRate);
  
  const revenueSharePercentage = 15;
  const investmentAmount = 100000;
  
  const monthlyReturn = projectedMonthlyRevenue * (revenueSharePercentage / 100);
  const paybackPeriod = monthlyReturn > 0 ? investmentAmount / monthlyReturn : 0;
  const annualReturn = monthlyReturn * 12;
  const expectedIRR = investmentAmount > 0 ? (annualReturn / investmentAmount) * 100 : 0;
  
  const riskAdjustment = report.investmentReadiness.overallScore / 100;
  const riskAdjustedReturn = expectedIRR * riskAdjustment;
  
  return {
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
    estimatedInvestorReturn: Math.round(monthlyReturn),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    expectedIRR: Math.round(expectedIRR * 10) / 10,
    riskAdjustedReturn: Math.round(riskAdjustedReturn * 10) / 10
  };
}

function generateRevenueFromBankStatements(bankStatements: any[]): any[] {
  // Extract credit transactions as potential revenue
  const revenueTransactions = bankStatements.flatMap(statement => 
    (statement.extractedData.transactions || [])
      .filter((tx: any) => tx.type === 'credit' && tx.amount > 0)
  );
  
  // Group by month
  const monthlyRevenue = revenueTransactions.reduce((acc: any, tx: any) => {
    const month = new Date(tx.date).toISOString().substring(0, 7);
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {});

  return Object.entries(monthlyRevenue).map(([month, amount]) => ({
    date: month + '-01',
    amount: amount as number
  }));
}

function calculateDataCompleteness(documentsByType: Record<string, any[]>): number {
  const requiredTypes = ['profit_loss', 'balance_sheet'];
  const optionalTypes = ['cash_flow', 'bank_statement'];
  
  let score = 0;
  
  // Required documents (60% of score)
  requiredTypes.forEach(type => {
    if (documentsByType[type]?.length > 0) {
      score += 30;
    }
  });
  
  // Optional documents (40% of score)
  optionalTypes.forEach(type => {
    if (documentsByType[type]?.length > 0) {
      score += 20;
    }
  });
  
  return Math.min(100, score);
}

function identifyDataLimitations(documentsByType: Record<string, any[]>): string[] {
  const limitations = [];
  
  if (!documentsByType.profit_loss) {
    limitations.push('No Profit & Loss statement available - revenue and profitability analysis limited');
  }
  
  if (!documentsByType.balance_sheet) {
    limitations.push('No Balance Sheet available - asset and liability analysis limited');
  }
  
  if (!documentsByType.cash_flow) {
    limitations.push('No Cash Flow statement available - cash flow analysis estimated');
  }
  
  if (!documentsByType.bank_statement || documentsByType.bank_statement.length === 0) {
    limitations.push('No bank statements available - transaction-level analysis not possible');
  }
  
  return limitations;
}

function generateDataRecommendations(documentsByType: Record<string, any[]>): string[] {
  const recommendations = [];
  
  if (!documentsByType.profit_loss) {
    recommendations.push('Upload Profit & Loss statement for comprehensive revenue analysis');
  }
  
  if (!documentsByType.balance_sheet) {
    recommendations.push('Upload Balance Sheet for complete financial position assessment');
  }
  
  if (!documentsByType.cash_flow) {
    recommendations.push('Upload Cash Flow statement for accurate liquidity analysis');
  }
  
  recommendations.push('Consider integrating with accounting software for real-time data updates');
  recommendations.push('Verify all extracted data for accuracy before making investment decisions');
  
  return recommendations;
}