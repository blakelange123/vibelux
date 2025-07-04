/**
 * Accounting System Integration Service
 * Supports QuickBooks, Xero, and other financial platforms
 */

import { prisma } from '@/lib/prisma';

interface AccountingConfig {
  provider: 'QUICKBOOKS' | 'XERO' | 'SAGE' | 'NETSUITE' | 'FRESHBOOKS';
  accessToken: string;
  refreshToken?: string;
  companyId: string;
  environment?: 'sandbox' | 'production';
}

interface RevenueData {
  id: string;
  date: Date;
  amount: number;
  category: string;
  customer?: string;
  description?: string;
  lineItems?: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  metadata?: Record<string, any>;
}

interface ExpenseData {
  id: string;
  date: Date;
  amount: number;
  category: string;
  vendor?: string;
  description?: string;
  accountCode?: string;
}

export class AccountingIntegrationService {
  private config: AccountingConfig;

  constructor(config: AccountingConfig) {
    this.config = config;
  }

  /**
   * Fetch revenue data from accounting system
   */
  async fetchRevenueData(startDate: Date, endDate: Date): Promise<RevenueData[]> {
    switch (this.config.provider) {
      case 'QUICKBOOKS':
        return this.fetchQuickBooksRevenue(startDate, endDate);
      case 'XERO':
        return this.fetchXeroRevenue(startDate, endDate);
      case 'SAGE':
        return this.fetchSageRevenue(startDate, endDate);
      case 'NETSUITE':
        return this.fetchNetSuiteRevenue(startDate, endDate);
      case 'FRESHBOOKS':
        return this.fetchFreshBooksRevenue(startDate, endDate);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * QuickBooks Integration
   */
  private async fetchQuickBooksRevenue(startDate: Date, endDate: Date): Promise<RevenueData[]> {
    const baseUrl = this.config.environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com/v3'
      : 'https://quickbooks.api.intuit.com/v3';

    try {
      // Fetch invoices
      const invoicesResponse = await fetch(
        `${baseUrl}/company/${this.config.companyId}/query?query=SELECT * FROM Invoice WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}' AND TxnDate <= '${endDate.toISOString().split('T')[0]}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!invoicesResponse.ok) {
        throw new Error(`QuickBooks API error: ${invoicesResponse.statusText}`);
      }

      const invoicesData = await invoicesResponse.json();
      const invoices = invoicesData.QueryResponse?.Invoice || [];

      // Fetch sales receipts
      const salesResponse = await fetch(
        `${baseUrl}/company/${this.config.companyId}/query?query=SELECT * FROM SalesReceipt WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}' AND TxnDate <= '${endDate.toISOString().split('T')[0]}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      const salesData = await salesResponse.json();
      const salesReceipts = salesData.QueryResponse?.SalesReceipt || [];

      // Transform to our format
      const revenues: RevenueData[] = [];

      // Process invoices
      for (const invoice of invoices) {
        revenues.push({
          id: invoice.Id,
          date: new Date(invoice.TxnDate),
          amount: parseFloat(invoice.TotalAmt),
          category: this.categorizeQuickBooksRevenue(invoice),
          customer: invoice.CustomerRef?.name,
          description: invoice.PrivateNote || 'Invoice',
          lineItems: invoice.Line?.filter((line: any) => line.DetailType === 'SalesItemLineDetail').map((line: any) => ({
            product: line.SalesItemLineDetail?.ItemRef?.name || 'Unknown',
            quantity: line.SalesItemLineDetail?.Qty || 1,
            unitPrice: line.SalesItemLineDetail?.UnitPrice || 0,
            total: line.Amount || 0,
          })),
          metadata: {
            source: 'QuickBooks',
            docNumber: invoice.DocNumber,
            dueDate: invoice.DueDate,
            balance: invoice.Balance,
          },
        });
      }

      // Process sales receipts
      for (const receipt of salesReceipts) {
        revenues.push({
          id: receipt.Id,
          date: new Date(receipt.TxnDate),
          amount: parseFloat(receipt.TotalAmt),
          category: this.categorizeQuickBooksRevenue(receipt),
          customer: receipt.CustomerRef?.name,
          description: receipt.PrivateNote || 'Sales Receipt',
          lineItems: receipt.Line?.filter((line: any) => line.DetailType === 'SalesItemLineDetail').map((line: any) => ({
            product: line.SalesItemLineDetail?.ItemRef?.name || 'Unknown',
            quantity: line.SalesItemLineDetail?.Qty || 1,
            unitPrice: line.SalesItemLineDetail?.UnitPrice || 0,
            total: line.Amount || 0,
          })),
          metadata: {
            source: 'QuickBooks',
            docNumber: receipt.DocNumber,
            paymentMethod: receipt.PaymentMethodRef?.name,
          },
        });
      }

      return revenues;
    } catch (error) {
      console.error('QuickBooks API error:', error);
      throw new Error(`Failed to fetch QuickBooks data: ${error.message}`);
    }
  }

  /**
   * Xero Integration
   */
  private async fetchXeroRevenue(startDate: Date, endDate: Date): Promise<RevenueData[]> {
    const baseUrl = 'https://api.xero.com/api.xro/2.0';

    try {
      // Fetch invoices
      const invoicesResponse = await fetch(
        `${baseUrl}/Invoices?where=Type=="ACCREC" AND Date>=${startDate.toISOString().split('T')[0]} AND Date<=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Accept': 'application/json',
            'xero-tenant-id': this.config.companyId,
          },
        }
      );

      if (!invoicesResponse.ok) {
        throw new Error(`Xero API error: ${invoicesResponse.statusText}`);
      }

      const invoicesData = await invoicesResponse.json();
      const revenues: RevenueData[] = [];

      for (const invoice of invoicesData.Invoices || []) {
        revenues.push({
          id: invoice.InvoiceID,
          date: new Date(invoice.Date),
          amount: invoice.Total,
          category: this.categorizeXeroRevenue(invoice),
          customer: invoice.Contact?.Name,
          description: invoice.Reference || 'Invoice',
          lineItems: invoice.LineItems?.map((line: any) => ({
            product: line.Description,
            quantity: line.Quantity,
            unitPrice: line.UnitAmount,
            total: line.LineAmount,
          })),
          metadata: {
            source: 'Xero',
            invoiceNumber: invoice.InvoiceNumber,
            status: invoice.Status,
            dueDate: invoice.DueDate,
          },
        });
      }

      return revenues;
    } catch (error) {
      console.error('Xero API error:', error);
      throw new Error(`Failed to fetch Xero data: ${error.message}`);
    }
  }

  /**
   * Sage Integration
   */
  private async fetchSageRevenue(startDate: Date, endDate: Date): Promise<RevenueData[]> {
    // Sage implementation would go here
    // This is a placeholder for the Sage API integration
    throw new Error('Sage integration not yet implemented');
  }

  /**
   * NetSuite Integration
   */
  private async fetchNetSuiteRevenue(startDate: Date, endDate: Date): Promise<RevenueData[]> {
    // NetSuite uses SOAP/REST APIs with OAuth 2.0
    // This is a placeholder for the NetSuite API integration
    throw new Error('NetSuite integration not yet implemented');
  }

  /**
   * FreshBooks Integration
   */
  private async fetchFreshBooksRevenue(startDate: Date, endDate: Date): Promise<RevenueData[]> {
    const baseUrl = 'https://api.freshbooks.com/accounting/account';

    try {
      const response = await fetch(
        `${baseUrl}/${this.config.companyId}/invoices/invoices?search[date_min]=${startDate.toISOString().split('T')[0]}&search[date_max]=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`FreshBooks API error: ${response.statusText}`);
      }

      const data = await response.json();
      const revenues: RevenueData[] = [];

      for (const invoice of data.response?.result?.invoices || []) {
        revenues.push({
          id: invoice.id.toString(),
          date: new Date(invoice.create_date),
          amount: parseFloat(invoice.amount.amount),
          category: 'Sales',
          customer: invoice.organization || invoice.fname + ' ' + invoice.lname,
          description: invoice.notes || 'Invoice',
          lineItems: invoice.lines?.map((line: any) => ({
            product: line.name,
            quantity: line.qty,
            unitPrice: parseFloat(line.unit_cost.amount),
            total: parseFloat(line.amount.amount),
          })),
          metadata: {
            source: 'FreshBooks',
            invoiceNumber: invoice.invoice_number,
            status: invoice.status,
          },
        });
      }

      return revenues;
    } catch (error) {
      console.error('FreshBooks API error:', error);
      throw new Error(`Failed to fetch FreshBooks data: ${error.message}`);
    }
  }

  /**
   * Fetch expense data from accounting system
   */
  async fetchExpenseData(startDate: Date, endDate: Date): Promise<ExpenseData[]> {
    switch (this.config.provider) {
      case 'QUICKBOOKS':
        return this.fetchQuickBooksExpenses(startDate, endDate);
      case 'XERO':
        return this.fetchXeroExpenses(startDate, endDate);
      default:
        return [];
    }
  }

  /**
   * QuickBooks Expense Fetching
   */
  private async fetchQuickBooksExpenses(startDate: Date, endDate: Date): Promise<ExpenseData[]> {
    const baseUrl = this.config.environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com/v3'
      : 'https://quickbooks.api.intuit.com/v3';

    try {
      const response = await fetch(
        `${baseUrl}/company/${this.config.companyId}/query?query=SELECT * FROM Purchase WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}' AND TxnDate <= '${endDate.toISOString().split('T')[0]}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      const expenses: ExpenseData[] = [];

      for (const purchase of data.QueryResponse?.Purchase || []) {
        expenses.push({
          id: purchase.Id,
          date: new Date(purchase.TxnDate),
          amount: parseFloat(purchase.TotalAmt),
          category: purchase.AccountRef?.name || 'Uncategorized',
          vendor: purchase.EntityRef?.name,
          description: purchase.PrivateNote,
          accountCode: purchase.AccountRef?.value,
        });
      }

      return expenses;
    } catch (error) {
      console.error('QuickBooks expense error:', error);
      return [];
    }
  }

  /**
   * Xero Expense Fetching
   */
  private async fetchXeroExpenses(startDate: Date, endDate: Date): Promise<ExpenseData[]> {
    const baseUrl = 'https://api.xero.com/api.xro/2.0';

    try {
      const response = await fetch(
        `${baseUrl}/Invoices?where=Type=="ACCPAY" AND Date>=${startDate.toISOString().split('T')[0]} AND Date<=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Accept': 'application/json',
            'xero-tenant-id': this.config.companyId,
          },
        }
      );

      const data = await response.json();
      const expenses: ExpenseData[] = [];

      for (const bill of data.Invoices || []) {
        expenses.push({
          id: bill.InvoiceID,
          date: new Date(bill.Date),
          amount: bill.Total,
          category: bill.LineItems?.[0]?.AccountCode || 'Uncategorized',
          vendor: bill.Contact?.Name,
          description: bill.Reference,
        });
      }

      return expenses;
    } catch (error) {
      console.error('Xero expense error:', error);
      return [];
    }
  }

  /**
   * Categorize revenue for better analytics
   */
  private categorizeQuickBooksRevenue(transaction: any): string {
    // Look for cannabis-specific categories in line items
    const lineItems = transaction.Line || [];
    
    for (const line of lineItems) {
      const itemName = line.SalesItemLineDetail?.ItemRef?.name?.toLowerCase() || '';
      
      if (itemName.includes('flower') || itemName.includes('bud')) return 'Flower Sales';
      if (itemName.includes('pre-roll') || itemName.includes('joint')) return 'Pre-Roll Sales';
      if (itemName.includes('concentrate') || itemName.includes('extract')) return 'Concentrate Sales';
      if (itemName.includes('edible')) return 'Edible Sales';
      if (itemName.includes('clone') || itemName.includes('seed')) return 'Genetics Sales';
      if (itemName.includes('trim') || itemName.includes('shake')) return 'Trim Sales';
      if (itemName.includes('consulting') || itemName.includes('service')) return 'Service Revenue';
    }

    return 'Other Revenue';
  }

  private categorizeXeroRevenue(invoice: any): string {
    const description = (invoice.Reference || invoice.Description || '').toLowerCase();
    
    if (description.includes('flower') || description.includes('bud')) return 'Flower Sales';
    if (description.includes('pre-roll') || description.includes('joint')) return 'Pre-Roll Sales';
    if (description.includes('concentrate') || description.includes('extract')) return 'Concentrate Sales';
    if (description.includes('wholesale')) return 'Wholesale Revenue';
    
    return 'Sales Revenue';
  }

  /**
   * Transform accounting data to match our database schema
   */
  transformToSalesRecord(revenue: RevenueData, facilityId: string) {
    return {
      facilityId,
      customer: revenue.customer || 'Unknown',
      saleDate: revenue.date,
      totalPrice: revenue.amount,
      category: revenue.category,
      metadata: {
        source: this.config.provider,
        originalId: revenue.id,
        ...revenue.metadata,
      },
      lineItems: revenue.lineItems?.map(item => ({
        product: item.product,
        quantity: item.quantity,
        pricePerUnit: item.unitPrice,
        total: item.total,
      })),
    };
  }
}

/**
 * OAuth configuration for different providers
 */
export const ACCOUNTING_OAUTH_CONFIGS = {
  QUICKBOOKS: {
    authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scopes: ['com.intuit.quickbooks.accounting'],
    discoveryUrl: 'https://developer.api.intuit.com/.well-known/openid_sandbox_configuration',
  },
  XERO: {
    authorizationUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    scopes: ['accounting.transactions.read', 'accounting.reports.read', 'accounting.journals.read'],
  },
  FRESHBOOKS: {
    authorizationUrl: 'https://auth.freshbooks.com/oauth/authorize',
    tokenUrl: 'https://api.freshbooks.com/auth/oauth/token',
    scopes: ['invoice:read', 'client:read'],
  },
};

/**
 * Helper to refresh OAuth tokens
 */
export async function refreshAccountingToken(
  provider: string,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string }> {
  const config = ACCOUNTING_OAUTH_CONFIGS[provider as keyof typeof ACCOUNTING_OAUTH_CONFIGS];
  
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env[`${provider}_CLIENT_ID`] || '',
      client_secret: process.env[`${provider}_CLIENT_SECRET`] || '',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}