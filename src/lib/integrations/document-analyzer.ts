import { Anthropic } from '@anthropic-ai/sdk';

export interface DocumentAnalysisResult {
  documentType: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'bank_statement' | 'tax_return' | 'invoice' | 'expense_report' | 'unknown';
  confidence: number;
  extractedData: any;
  period?: {
    startDate: string;
    endDate: string;
  };
  currency?: string;
  errors: string[];
  warnings: string[];
}

export class DocumentAnalyzer {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  async analyzeFinancialDocument(
    documentContent: string,
    documentName: string,
    expectedType?: string
  ): Promise<DocumentAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(documentContent, documentName, expectedType);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const analysisResult = this.parseClaudeResponse(response.content[0].text);
      return analysisResult;
    } catch (error) {
      console.error('Document analysis error:', error);
      return {
        documentType: 'unknown',
        confidence: 0,
        extractedData: {},
        errors: [`Failed to analyze document: ${error.message}`],
        warnings: []
      };
    }
  }

  private buildAnalysisPrompt(content: string, filename: string, expectedType?: string): string {
    return `
You are a financial document analysis expert. Analyze the following financial document and extract key data for investment due diligence.

Document filename: ${filename}
${expectedType ? `Expected document type: ${expectedType}` : ''}

Document content:
${content}

Please analyze this document and return a JSON response with the following structure:
{
  "documentType": "profit_loss|balance_sheet|cash_flow|bank_statement|tax_return|invoice|expense_report|unknown",
  "confidence": 0-100,
  "period": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "currency": "USD|EUR|GBP|etc",
  "extractedData": {
    // For Profit & Loss:
    "totalRevenue": number,
    "grossProfit": number,
    "operatingIncome": number,
    "netIncome": number,
    "operatingExpenses": number,
    "costOfGoodsSold": number,
    "interestExpense": number,
    "taxExpense": number,
    "depreciation": number,
    
    // For Balance Sheet:
    "totalAssets": number,
    "currentAssets": number,
    "fixedAssets": number,
    "totalLiabilities": number,
    "currentLiabilities": number,
    "longTermLiabilities": number,
    "equity": number,
    "retainedEarnings": number,
    "cash": number,
    "accountsReceivable": number,
    "inventory": number,
    "accountsPayable": number,
    
    // For Cash Flow:
    "operatingCashFlow": number,
    "investingCashFlow": number,
    "financingCashFlow": number,
    "netCashFlow": number,
    "beginningCash": number,
    "endingCash": number,
    
    // For Bank Statements:
    "transactions": [
      {
        "date": "YYYY-MM-DD",
        "description": "string",
        "amount": number,
        "type": "debit|credit",
        "category": "string"
      }
    ],
    "openingBalance": number,
    "closingBalance": number,
    
    // Additional fields for any document type:
    "companyName": "string",
    "accountingPeriod": "string",
    "accountingStandard": "GAAP|IFRS|Other"
  },
  "errors": ["array of validation errors"],
  "warnings": ["array of warnings or missing data"],
  "rawText": "key sections of text for verification"
}

Analysis Guidelines:
1. Identify the document type based on structure and content
2. Extract ALL numerical values with high precision
3. Ensure dates are in ISO format (YYYY-MM-DD)
4. Flag any inconsistencies or unclear values
5. Calculate derived metrics when possible (e.g., gross margin, current ratio)
6. Identify the reporting period and currency
7. Note if data appears incomplete or requires manual verification
8. For agricultural businesses, pay special attention to seasonal patterns
9. Flag any red flags for investment analysis

Return ONLY the JSON response, no additional text.
`;
  }

  private parseClaudeResponse(response: string): DocumentAnalysisResult {
    try {
      // Extract JSON from response (Claude sometimes adds explanatory text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the response
      return {
        documentType: parsed.documentType || 'unknown',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        extractedData: parsed.extractedData || {},
        period: parsed.period,
        currency: parsed.currency,
        errors: Array.isArray(parsed.errors) ? parsed.errors : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
      };
    } catch (error) {
      return {
        documentType: 'unknown',
        confidence: 0,
        extractedData: {},
        errors: [`Failed to parse analysis: ${error.message}`],
        warnings: []
      };
    }
  }

  // Batch analyze multiple documents
  async analyzeDocumentBatch(
    documents: Array<{ content: string; name: string; expectedType?: string }>
  ): Promise<DocumentAnalysisResult[]> {
    const results = await Promise.all(
      documents.map(doc => 
        this.analyzeFinancialDocument(doc.content, doc.name, doc.expectedType)
      )
    );

    return results;
  }

  // Validate analysis results for consistency
  validateAnalysisConsistency(results: DocumentAnalysisResult[]): {
    valid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for period consistency
    const periods = results
      .filter(r => r.period)
      .map(r => r.period);
    
    if (periods.length > 1) {
      const uniquePeriods = new Set(periods.map(p => `${p!.startDate}-${p!.endDate}`));
      if (uniquePeriods.size > 1) {
        issues.push('Documents cover different time periods');
        recommendations.push('Ensure all financial documents are for the same reporting period');
      }
    }

    // Check for currency consistency
    const currencies = results
      .filter(r => r.currency)
      .map(r => r.currency);
    
    if (currencies.length > 1) {
      const uniqueCurrencies = new Set(currencies);
      if (uniqueCurrencies.size > 1) {
        issues.push('Documents use different currencies');
        recommendations.push('Convert all amounts to the same currency before analysis');
      }
    }

    // Check confidence levels
    const lowConfidenceResults = results.filter(r => r.confidence < 70);
    if (lowConfidenceResults.length > 0) {
      issues.push(`${lowConfidenceResults.length} documents have low confidence scores`);
      recommendations.push('Review and verify low-confidence document extractions manually');
    }

    // Balance sheet equation check
    const balanceSheet = results.find(r => r.documentType === 'balance_sheet');
    if (balanceSheet && balanceSheet.extractedData) {
      const { totalAssets, totalLiabilities, equity } = balanceSheet.extractedData;
      if (totalAssets && totalLiabilities && equity) {
        const difference = Math.abs(totalAssets - (totalLiabilities + equity));
        const tolerance = totalAssets * 0.01; // 1% tolerance
        
        if (difference > tolerance) {
          issues.push('Balance sheet equation does not balance');
          recommendations.push('Verify balance sheet data - Assets should equal Liabilities + Equity');
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Generate standardized financial data from analysis results
  generateStandardizedData(results: DocumentAnalysisResult[]): {
    profitLoss?: any;
    balanceSheet?: any;
    cashFlow?: any;
    bankStatements?: any[];
    period?: { startDate: string; endDate: string };
    currency?: string;
    confidence: number;
  } {
    const profitLossData = results.find(r => r.documentType === 'profit_loss');
    const balanceSheetData = results.find(r => r.documentType === 'balance_sheet');
    const cashFlowData = results.find(r => r.documentType === 'cash_flow');
    const bankStatements = results.filter(r => r.documentType === 'bank_statement');

    // Determine period and currency
    const period = results.find(r => r.period)?.period;
    const currency = results.find(r => r.currency)?.currency;

    // Calculate overall confidence
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      profitLoss: profitLossData?.extractedData,
      balanceSheet: balanceSheetData?.extractedData,
      cashFlow: cashFlowData?.extractedData,
      bankStatements: bankStatements.map(r => r.extractedData),
      period,
      currency,
      confidence: Math.round(avgConfidence)
    };
  }
}