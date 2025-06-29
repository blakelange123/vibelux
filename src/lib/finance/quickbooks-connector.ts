/**
 * VibeLux QuickBooks Connector
 * Handles OAuth2 authentication, API operations, and data synchronization with QuickBooks
 */

import {
  IntegrationConfig,
  ConnectionSettings,
  SyncSettings,
  SyncStatus,
  SyncError,
  Transaction,
  Invoice,
  Payment,
  FinancialAccount,
  EntityType,
  IntegrationSource,
  Customer,
  Vendor,
  Product
} from './finance-types';

// QuickBooks API Configuration
const QB_API_BASE_URL = 'https://api.intuit.com';
const QB_SANDBOX_URL = 'https://sandbox-quickbooks.api.intuit.com';
const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QB_DISCOVERY_URL = 'https://developer.api.intuit.com/.well-known/openid_configuration';

// QuickBooks specific types
interface QBAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  x_refresh_token_expires_in: number;
}

interface QBCompanyInfo {
  CompanyName: string;
  Id: string;
  SyncToken: string;
  CompanyAddr?: QBAddress;
  FiscalYearStartMonth?: string;
}

interface QBAddress {
  Line1?: string;
  City?: string;
  CountrySubDivisionCode?: string;
  PostalCode?: string;
}

interface QBAccount {
  Id: string;
  Name: string;
  AccountType: string;
  AccountSubType?: string;
  CurrentBalance?: number;
  Active: boolean;
  SyncToken: string;
  MetaData: QBMetaData;
}

interface QBTransaction {
  Id: string;
  TxnDate: string;
  DocNumber?: string;
  TotalAmt: number;
  Line: QBLineItem[];
  CustomerRef?: QBRef;
  VendorRef?: QBRef;
  SyncToken: string;
  MetaData: QBMetaData;
}

interface QBInvoice {
  Id: string;
  DocNumber?: string;
  TxnDate: string;
  DueDate?: string;
  CustomerRef: QBRef;
  Line: QBLineItem[];
  TotalAmt: number;
  Balance: number;
  SyncToken: string;
  MetaData: QBMetaData;
}

interface QBPayment {
  Id: string;
  TxnDate: string;
  TotalAmt: number;
  CustomerRef?: QBRef;
  PaymentMethodRef?: QBRef;
  DepositToAccountRef?: QBRef;
  Line?: QBPaymentLine[];
  SyncToken: string;
  MetaData: QBMetaData;
}

interface QBLineItem {
  Id?: string;
  LineNum?: number;
  Description?: string;
  Amount: number;
  DetailType: string;
  AccountBasedExpenseLineDetail?: {
    AccountRef: QBRef;
  };
  SalesItemLineDetail?: {
    ItemRef?: QBRef;
    Qty?: number;
    UnitPrice?: number;
  };
}

interface QBPaymentLine {
  Amount: number;
  LinkedTxn: Array<{
    TxnId: string;
    TxnType: string;
  }>;
}

interface QBRef {
  value: string;
  name?: string;
}

interface QBMetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}

interface QBError {
  Fault: {
    Error: Array<{
      Message: string;
      Detail: string;
      code: string;
    }>;
  };
}

export class QuickBooksConnector {
  private config: IntegrationConfig;
  private apiBaseUrl: string;
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiry?: Date;
  private companyId?: string;

  constructor(config: IntegrationConfig) {
    this.config = config;
    const settings = config.connectionSettings;
    this.apiBaseUrl = settings.qbEnvironment === 'sandbox' ? QB_SANDBOX_URL : QB_API_BASE_URL;
    this.accessToken = settings.qbAccessToken;
    this.refreshToken = settings.qbRefreshToken;
    this.companyId = settings.qbRealmId;
  }

  /**
   * OAuth2 Authentication Flow
   */
  async getAuthorizationUrl(redirectUri: string, state?: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.connectionSettings.qbClientId!,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: redirectUri,
      response_type: 'code',
      state: state || generateRandomState()
    });

    return `${QB_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<QBAuthTokens> {
    const response = await fetch(`${QB_API_BASE_URL}/oauth2/v1/tokens/bearer`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${this.getBasicAuthHeader()}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens = await response.json() as QBAuthTokens;
    await this.storeTokens(tokens);
    return tokens;
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${QB_API_BASE_URL}/oauth2/v1/tokens/bearer`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${this.getBasicAuthHeader()}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokens = await response.json() as QBAuthTokens;
    await this.storeTokens(tokens);
  }

  private async storeTokens(tokens: QBAuthTokens): Promise<void> {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Update configuration with new tokens
    this.config.connectionSettings.qbAccessToken = tokens.access_token;
    this.config.connectionSettings.qbRefreshToken = tokens.refresh_token;
    
    // TODO: Persist tokens to database
  }

  private getBasicAuthHeader(): string {
    const clientId = this.config.connectionSettings.qbClientId!;
    const clientSecret = this.config.connectionSettings.qbClientSecret!;
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

  /**
   * API Client Methods
   */
  private async makeApiRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    // Check and refresh token if needed
    if (this.tokenExpiry && this.tokenExpiry < new Date()) {
      await this.refreshAccessToken();
    }

    const url = `${this.apiBaseUrl}/v3/company/${this.companyId}/${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json() as QBError;
      throw new Error(
        error.Fault?.Error?.[0]?.Message || `API request failed: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Company Information
   */
  async getCompanyInfo(): Promise<QBCompanyInfo> {
    const result = await this.makeApiRequest<{ CompanyInfo: QBCompanyInfo }>('companyinfo/1');
    return result.CompanyInfo;
  }

  /**
   * Account Operations
   */
  async getAccounts(): Promise<FinancialAccount[]> {
    const result = await this.makeApiRequest<{ QueryResponse: { Account: QBAccount[] } }>(
      'query?query=select * from Account'
    );
    
    return result.QueryResponse.Account.map(this.mapQBAccountToFinancialAccount);
  }

  async getAccount(id: string): Promise<FinancialAccount> {
    const result = await this.makeApiRequest<{ Account: QBAccount }>(`account/${id}`);
    return this.mapQBAccountToFinancialAccount(result.Account);
  }

  /**
   * Transaction Operations
   */
  async getTransactions(
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<Transaction[]> {
    let query = 'select * from Purchase';
    const conditions: string[] = [];
    
    if (startDate) {
      conditions.push(`TxnDate >= '${formatDate(startDate)}'`);
    }
    if (endDate) {
      conditions.push(`TxnDate <= '${formatDate(endDate)}'`);
    }
    
    if (conditions.length > 0) {
      query += ` where ${conditions.join(' and ')}`;
    }
    
    query += ` MAXRESULTS ${limit}`;
    
    const result = await this.makeApiRequest<{ QueryResponse: { Purchase: QBTransaction[] } }>(
      `query?query=${encodeURIComponent(query)}`
    );
    
    return result.QueryResponse.Purchase.map(this.mapQBTransactionToTransaction);
  }

  /**
   * Invoice Operations
   */
  async getInvoices(customerId?: string): Promise<Invoice[]> {
    let query = 'select * from Invoice';
    if (customerId) {
      query += ` where CustomerRef = '${customerId}'`;
    }
    
    const result = await this.makeApiRequest<{ QueryResponse: { Invoice: QBInvoice[] } }>(
      `query?query=${encodeURIComponent(query)}`
    );
    
    return result.QueryResponse.Invoice.map(this.mapQBInvoiceToInvoice);
  }

  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const qbInvoice = this.mapInvoiceToQBInvoice(invoice);
    const result = await this.makeApiRequest<{ Invoice: QBInvoice }>(
      'invoice',
      'POST',
      qbInvoice
    );
    
    return this.mapQBInvoiceToInvoice(result.Invoice);
  }

  /**
   * Payment Operations
   */
  async getPayments(customerId?: string): Promise<Payment[]> {
    let query = 'select * from Payment';
    if (customerId) {
      query += ` where CustomerRef = '${customerId}'`;
    }
    
    const result = await this.makeApiRequest<{ QueryResponse: { Payment: QBPayment[] } }>(
      `query?query=${encodeURIComponent(query)}`
    );
    
    return result.QueryResponse.Payment.map(this.mapQBPaymentToPayment);
  }

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const qbPayment = this.mapPaymentToQBPayment(payment);
    const result = await this.makeApiRequest<{ Payment: QBPayment }>(
      'payment',
      'POST',
      qbPayment
    );
    
    return this.mapQBPaymentToPayment(result.Payment);
  }

  /**
   * Data Synchronization
   */
  async syncData(entityType: EntityType): Promise<SyncStatus> {
    const syncStatus: SyncStatus = {
      status: 'in_progress',
      startTime: new Date(),
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: []
    };

    try {
      switch (entityType) {
        case 'accounts':
          await this.syncAccounts(syncStatus);
          break;
        case 'transactions':
          await this.syncTransactions(syncStatus);
          break;
        case 'invoices':
          await this.syncInvoices(syncStatus);
          break;
        case 'payments':
          await this.syncPayments(syncStatus);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      syncStatus.status = 'completed';
      syncStatus.endTime = new Date();
    } catch (error) {
      syncStatus.status = 'failed';
      syncStatus.endTime = new Date();
      syncStatus.errors?.push({
        timestamp: new Date(),
        entityType,
        errorCode: 'SYNC_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return syncStatus;
  }

  private async syncAccounts(syncStatus: SyncStatus): Promise<void> {
    const accounts = await this.getAccounts();
    
    for (const account of accounts) {
      try {
        // TODO: Save account to VibeLux database
        syncStatus.recordsProcessed!++;
      } catch (error) {
        syncStatus.recordsFailed!++;
        syncStatus.errors?.push({
          timestamp: new Date(),
          entityType: 'accounts',
          entityId: account.id,
          errorCode: 'SAVE_FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async syncTransactions(syncStatus: SyncStatus): Promise<void> {
    const lastSync = this.config.syncSettings.entities
      .find(e => e.entityType === 'transactions')?.lastSyncDate;
    
    const transactions = await this.getTransactions(lastSync);
    
    for (const transaction of transactions) {
      try {
        // TODO: Save transaction to VibeLux database
        syncStatus.recordsProcessed!++;
      } catch (error) {
        syncStatus.recordsFailed!++;
        syncStatus.errors?.push({
          timestamp: new Date(),
          entityType: 'transactions',
          entityId: transaction.id,
          errorCode: 'SAVE_FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async syncInvoices(syncStatus: SyncStatus): Promise<void> {
    const invoices = await this.getInvoices();
    
    for (const invoice of invoices) {
      try {
        // TODO: Save invoice to VibeLux database
        syncStatus.recordsProcessed!++;
      } catch (error) {
        syncStatus.recordsFailed!++;
        syncStatus.errors?.push({
          timestamp: new Date(),
          entityType: 'invoices',
          entityId: invoice.id,
          errorCode: 'SAVE_FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async syncPayments(syncStatus: SyncStatus): Promise<void> {
    const payments = await this.getPayments();
    
    for (const payment of payments) {
      try {
        // TODO: Save payment to VibeLux database
        syncStatus.recordsProcessed!++;
      } catch (error) {
        syncStatus.recordsFailed!++;
        syncStatus.errors?.push({
          timestamp: new Date(),
          entityType: 'payments',
          entityId: payment.id,
          errorCode: 'SAVE_FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Mapping Functions
   */
  private mapQBAccountToFinancialAccount(qbAccount: QBAccount): FinancialAccount {
    return {
      id: qbAccount.Id,
      accountNumber: qbAccount.Id,
      accountName: qbAccount.Name,
      accountType: this.mapQBAccountType(qbAccount.AccountType),
      currency: 'USD', // QuickBooks uses company currency
      balance: qbAccount.CurrentBalance || 0,
      status: qbAccount.Active ? 'active' : 'inactive',
      integration: 'quickbooks',
      lastSyncDate: new Date(qbAccount.MetaData.LastUpdatedTime),
      metadata: {
        qbAccountType: qbAccount.AccountType,
        qbAccountSubType: qbAccount.AccountSubType,
        syncToken: qbAccount.SyncToken
      }
    };
  }

  private mapQBAccountType(qbType: string): FinancialAccount['accountType'] {
    const typeMap: Record<string, FinancialAccount['accountType']> = {
      'Bank': 'bank',
      'Accounts Receivable': 'accounts_receivable',
      'Other Current Asset': 'asset',
      'Fixed Asset': 'asset',
      'Other Asset': 'asset',
      'Accounts Payable': 'accounts_payable',
      'Credit Card': 'liability',
      'Long Term Liability': 'liability',
      'Other Current Liability': 'liability',
      'Equity': 'equity',
      'Income': 'revenue',
      'Other Income': 'revenue',
      'Cost of Goods Sold': 'expense',
      'Expense': 'expense',
      'Other Expense': 'expense'
    };
    
    return typeMap[qbType] || 'asset';
  }

  private mapQBTransactionToTransaction(qbTransaction: QBTransaction): Transaction {
    return {
      id: qbTransaction.Id,
      transactionDate: new Date(qbTransaction.TxnDate),
      postingDate: new Date(qbTransaction.TxnDate),
      description: qbTransaction.DocNumber || 'QuickBooks Transaction',
      amount: qbTransaction.TotalAmt,
      currency: 'USD',
      accountId: '', // TODO: Map from line items
      status: 'posted',
      lineItems: qbTransaction.Line.map(this.mapQBLineItemToTransactionLineItem),
      integration: {
        type: 'quickbooks',
        id: qbTransaction.Id,
        lastSyncDate: new Date(qbTransaction.MetaData.LastUpdatedTime)
      },
      metadata: {
        syncToken: qbTransaction.SyncToken
      }
    };
  }

  private mapQBLineItemToTransactionLineItem(qbLine: QBLineItem): TransactionLineItem {
    return {
      id: qbLine.Id || generateId(),
      description: qbLine.Description || '',
      accountId: qbLine.AccountBasedExpenseLineDetail?.AccountRef.value || '',
      debit: qbLine.Amount > 0 ? qbLine.Amount : undefined,
      credit: qbLine.Amount < 0 ? Math.abs(qbLine.Amount) : undefined
    };
  }

  private mapQBInvoiceToInvoice(qbInvoice: QBInvoice): Invoice {
    return {
      id: qbInvoice.Id,
      invoiceNumber: qbInvoice.DocNumber || qbInvoice.Id,
      customerId: qbInvoice.CustomerRef.value,
      issueDate: new Date(qbInvoice.TxnDate),
      dueDate: qbInvoice.DueDate ? new Date(qbInvoice.DueDate) : addDays(new Date(qbInvoice.TxnDate), 30),
      status: this.determineInvoiceStatus(qbInvoice),
      subtotal: qbInvoice.TotalAmt,
      taxAmount: 0, // TODO: Calculate from line items
      totalAmount: qbInvoice.TotalAmt,
      paidAmount: qbInvoice.TotalAmt - qbInvoice.Balance,
      currency: 'USD',
      paymentTerms: 'Net 30', // TODO: Get from QuickBooks
      lineItems: qbInvoice.Line.filter(line => line.DetailType === 'SalesItemLineDetail')
        .map(this.mapQBLineItemToInvoiceLineItem),
      payments: [],
      integration: {
        type: 'quickbooks',
        id: qbInvoice.Id,
        lastSyncDate: new Date(qbInvoice.MetaData.LastUpdatedTime)
      },
      metadata: {
        syncToken: qbInvoice.SyncToken
      }
    };
  }

  private determineInvoiceStatus(qbInvoice: QBInvoice): Invoice['status'] {
    if (qbInvoice.Balance === 0) return 'paid';
    if (qbInvoice.Balance < qbInvoice.TotalAmt) return 'partially_paid';
    if (new Date(qbInvoice.DueDate || qbInvoice.TxnDate) < new Date()) return 'overdue';
    return 'sent';
  }

  private mapQBLineItemToInvoiceLineItem(qbLine: QBLineItem): InvoiceLineItem {
    const detail = qbLine.SalesItemLineDetail!;
    return {
      id: qbLine.Id || generateId(),
      description: qbLine.Description || '',
      productId: detail.ItemRef?.value,
      quantity: detail.Qty || 1,
      unitPrice: detail.UnitPrice || qbLine.Amount,
      taxAmount: 0, // TODO: Get from tax details
      totalAmount: qbLine.Amount
    };
  }

  private mapQBPaymentToPayment(qbPayment: QBPayment): Payment {
    return {
      id: qbPayment.Id,
      paymentDate: new Date(qbPayment.TxnDate),
      amount: qbPayment.TotalAmt,
      currency: 'USD',
      paymentMethod: 'other', // TODO: Map from PaymentMethodRef
      customerId: qbPayment.CustomerRef?.value,
      status: 'completed',
      integration: {
        type: 'quickbooks',
        id: qbPayment.Id,
        lastSyncDate: new Date(qbPayment.MetaData.LastUpdatedTime)
      },
      metadata: {
        syncToken: qbPayment.SyncToken
      }
    };
  }

  private mapInvoiceToQBInvoice(invoice: Partial<Invoice>): Partial<QBInvoice> {
    return {
      DocNumber: invoice.invoiceNumber,
      TxnDate: invoice.issueDate ? formatDate(invoice.issueDate) : formatDate(new Date()),
      DueDate: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,
      CustomerRef: invoice.customerId ? { value: invoice.customerId } : undefined,
      Line: invoice.lineItems?.map(item => ({
        Amount: item.totalAmount,
        Description: item.description,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: item.productId ? { value: item.productId } : undefined,
          Qty: item.quantity,
          UnitPrice: item.unitPrice
        }
      }))
    };
  }

  private mapPaymentToQBPayment(payment: Partial<Payment>): Partial<QBPayment> {
    return {
      TxnDate: payment.paymentDate ? formatDate(payment.paymentDate) : formatDate(new Date()),
      TotalAmt: payment.amount,
      CustomerRef: payment.customerId ? { value: payment.customerId } : undefined
    };
  }

  /**
   * Error Handling and Retry Logic
   */
  async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    // Revoke tokens if needed
    if (this.refreshToken) {
      try {
        await fetch(`${QB_API_BASE_URL}/oauth2/v1/tokens/revoke`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${this.getBasicAuthHeader()}`
          },
          body: new URLSearchParams({
            token: this.refreshToken
          })
        });
      } catch (error) {
        console.error('Failed to revoke tokens:', error);
      }
    }

    // Clear tokens
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.tokenExpiry = undefined;
  }
}

// Helper functions
function generateRandomState(): string {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 15) + 
         crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 15);
}

function generateId(): string {
  return `vb_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 9)}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Add missing type definitions
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: any;
}

interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: any;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  price?: number;
}