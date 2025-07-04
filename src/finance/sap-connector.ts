/**
 * VibeLux SAP Connector
 * Handles integration with SAP Business One via Service Layer API
 */

import {
  IntegrationConfig,
  ConnectionSettings,
  SyncStatus,
  Transaction,
  Invoice,
  Payment,
  FinancialAccount,
  EntityType,
  IntegrationSource,
  TransactionLineItem,
  InvoiceLineItem,
  PaymentStatus,
  AccountType
} from './finance-types';

// SAP B1 Service Layer API types
interface SAPSession {
  SessionId: string;
  Version: string;
  SessionTimeout: number;
}

interface SAPAccount {
  Code: string;
  Name: string;
  AccountType: string;
  Balance: number;
  Currency: string;
  ActiveAccount: 'tYES' | 'tNO';
  FatherAccountKey?: string;
  Level?: number;
}

interface SAPBusinessPartner {
  CardCode: string;
  CardName: string;
  CardType: 'cCustomer' | 'cSupplier' | 'cLead';
  Balance: number;
  Currency: string;
  ContactPerson?: string;
  Phone1?: string;
  EmailAddress?: string;
}

interface SAPDocument {
  DocEntry: number;
  DocNum: number;
  DocType: string;
  DocDate: string;
  DocDueDate?: string;
  CardCode: string;
  CardName: string;
  DocTotal: number;
  DocCurrency: string;
  DocStatus: 'O' | 'C'; // Open or Closed
  DocumentLines: SAPDocumentLine[];
}

interface SAPDocumentLine {
  LineNum: number;
  ItemCode?: string;
  ItemDescription?: string;
  Quantity?: number;
  Price?: number;
  LineTotal: number;
  AccountCode?: string;
  TaxCode?: string;
  VatSum?: number;
}

interface SAPJournalEntry {
  JdtNum: number;
  RefDate: string;
  DueDate?: string;
  Memo?: string;
  TransactionCode?: string;
  JournalEntryLines: SAPJournalLine[];
}

interface SAPJournalLine {
  Line_ID: number;
  AccountCode: string;
  Debit?: number;
  Credit?: number;
  FCDebit?: number;
  FCCredit?: number;
  FCCurrency?: string;
  ShortName?: string;
  ContraAccount?: string;
  LineMemo?: string;
  Reference1?: string;
  Reference2?: string;
  CostingCode?: string;
  CostingCode2?: string;
  CostingCode3?: string;
}

interface SAPPayment {
  DocEntry: number;
  DocNum: number;
  DocType: string;
  DocDate: string;
  CardCode?: string;
  CardName?: string;
  DocCurrency: string;
  DocRate: number;
  TransferAccount?: string;
  TransferSum?: number;
  PaymentInvoices?: SAPPaymentInvoice[];
}

interface SAPPaymentInvoice {
  LineNum: number;
  DocEntry: number;
  SumApplied: number;
  InvoiceType: string;
}

interface SAPError {
  error: {
    code: number;
    message: {
      lang: string;
      value: string;
    };
  };
}

export class SAPConnector {
  private config: IntegrationConfig;
  private baseUrl: string;
  private sessionId?: string;
  private sessionTimeout?: number;
  private lastActivity?: Date;

  constructor(config: IntegrationConfig) {
    this.config = config;
    const settings = config.connectionSettings;
    
    // Construct base URL for SAP Service Layer
    const protocol = settings.sapServiceLayer ? 'https' : 'http';
    this.baseUrl = `${protocol}://${settings.sapHost}:${settings.sapPort}/b1s/v1`;
  }

  /**
   * Authentication
   */
  async connect(): Promise<void> {
    const loginData = {
      CompanyDB: this.config.connectionSettings.sapCompanyDb,
      UserName: this.config.connectionSettings.sapUsername,
      Password: this.config.connectionSettings.sapPassword
    };

    try {
      const response = await fetch(`${this.baseUrl}/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        const error = await response.json() as SAPError;
        throw new Error(`SAP login failed: ${error.error?.message?.value || response.statusText}`);
      }

      const session = await response.json() as SAPSession;
      this.sessionId = response.headers.get('Set-Cookie')?.match(/B1SESSION=([^;]+)/)?.[1];
      this.sessionTimeout = session.SessionTimeout * 60 * 1000; // Convert to milliseconds
      this.lastActivity = new Date();

    } catch (error) {
      throw new Error(`Failed to connect to SAP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/Logout`, {
        method: 'POST',
        headers: {
          'Cookie': `B1SESSION=${this.sessionId}`
        }
      });
    } catch (error) {
      console.error('Failed to logout from SAP:', error);
    } finally {
      this.sessionId = undefined;
      this.sessionTimeout = undefined;
      this.lastActivity = undefined;
    }
  }

  /**
   * Session Management
   */
  private async ensureValidSession(): Promise<void> {
    if (!this.sessionId || !this.lastActivity || !this.sessionTimeout) {
      await this.connect();
      return;
    }

    const timeSinceLastActivity = Date.now() - this.lastActivity.getTime();
    if (timeSinceLastActivity > this.sessionTimeout * 0.8) {
      // Reconnect if 80% of session timeout has passed
      await this.disconnect();
      await this.connect();
    }
  }

  /**
   * API Request Helper
   */
  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    isOData: boolean = true
  ): Promise<T> {
    await this.ensureValidSession();

    const url = `${this.baseUrl}/${endpoint}`;
    const headers: HeadersInit = {
      'Cookie': `B1SESSION=${this.sessionId}`,
      'Content-Type': 'application/json'
    };

    if (isOData && method === 'GET') {
      headers['Prefer'] = 'odata.maxpagesize=100';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    this.lastActivity = new Date();

    if (!response.ok) {
      const error = await response.json() as SAPError;
      throw new Error(
        `SAP API error: ${error.error?.message?.value || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Chart of Accounts Operations
   */
  async getAccounts(): Promise<FinancialAccount[]> {
    const result = await this.makeRequest<{ value: SAPAccount[] }>('ChartOfAccounts');
    return result.value.map(this.mapSAPAccountToFinancialAccount.bind(this));
  }

  async getAccount(code: string): Promise<FinancialAccount> {
    const account = await this.makeRequest<SAPAccount>(`ChartOfAccounts('${code}')`);
    return this.mapSAPAccountToFinancialAccount(account);
  }

  /**
   * Business Partner Operations
   */
  async getBusinessPartners(type?: 'customer' | 'supplier'): Promise<any[]> {
    let filter = '';
    if (type === 'customer') {
      filter = "?$filter=CardType eq 'cCustomer'";
    } else if (type === 'supplier') {
      filter = "?$filter=CardType eq 'cSupplier'";
    }

    const result = await this.makeRequest<{ value: SAPBusinessPartner[] }>(
      `BusinessPartners${filter}`
    );
    return result.value;
  }

  /**
   * Journal Entry Operations (Transactions)
   */
  async getTransactions(
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<Transaction[]> {
    let filter = '';
    const filters: string[] = [];

    if (startDate) {
      filters.push(`RefDate ge '${this.formatDate(startDate)}'`);
    }
    if (endDate) {
      filters.push(`RefDate le '${this.formatDate(endDate)}'`);
    }

    if (filters.length > 0) {
      filter = `?$filter=${filters.join(' and ')}&$top=${limit}`;
    } else {
      filter = `?$top=${limit}`;
    }

    const result = await this.makeRequest<{ value: SAPJournalEntry[] }>(
      `JournalEntries${filter}`
    );
    
    return result.value.map(this.mapSAPJournalEntryToTransaction.bind(this));
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const sapJournal = this.mapTransactionToSAPJournalEntry(transaction);
    const created = await this.makeRequest<SAPJournalEntry>(
      'JournalEntries',
      'POST',
      sapJournal
    );
    
    return this.mapSAPJournalEntryToTransaction(created);
  }

  /**
   * Invoice Operations
   */
  async getInvoices(customerId?: string): Promise<Invoice[]> {
    let filter = '';
    if (customerId) {
      filter = `?$filter=CardCode eq '${customerId}'`;
    }

    const result = await this.makeRequest<{ value: SAPDocument[] }>(
      `Invoices${filter}`
    );
    
    return result.value.map(this.mapSAPDocumentToInvoice.bind(this));
  }

  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const sapInvoice = this.mapInvoiceToSAPDocument(invoice);
    const created = await this.makeRequest<SAPDocument>(
      'Invoices',
      'POST',
      sapInvoice
    );
    
    return this.mapSAPDocumentToInvoice(created);
  }

  /**
   * Payment Operations
   */
  async getPayments(customerId?: string): Promise<Payment[]> {
    let filter = '';
    if (customerId) {
      filter = `?$filter=CardCode eq '${customerId}'`;
    }

    const result = await this.makeRequest<{ value: SAPPayment[] }>(
      `IncomingPayments${filter}`
    );
    
    return result.value.map(this.mapSAPPaymentToPayment.bind(this));
  }

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const sapPayment = this.mapPaymentToSAPPayment(payment);
    const created = await this.makeRequest<SAPPayment>(
      'IncomingPayments',
      'POST',
      sapPayment
    );
    
    return this.mapSAPPaymentToPayment(created);
  }

  /**
   * Batch Processing
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<{ successful: R[]; failed: Array<{ item: T; error: Error }> }> {
    const successful: R[] = [];
    const failed: Array<{ item: T; error: Error }> = [];

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const promises = batch.map(async (item) => {
        try {
          const result = await processor(item);
          successful.push(result);
        } catch (error) {
          failed.push({ 
            item, 
            error: error instanceof Error ? error : new Error('Unknown error') 
          });
        }
      });

      await Promise.all(promises);
    }

    return { successful, failed };
  }

  /**
   * Real-time Sync
   */
  async setupWebhook(webhookUrl: string): Promise<void> {
    // SAP B1 doesn't have native webhooks, but we can set up polling
    // or use SAP Business One Service Layer notifications
    console.warn('SAP B1 webhook setup not implemented. Consider using polling instead.');
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
    const { successful, failed } = await this.processBatch(
      accounts,
      async (account) => {
        // TODO: Save to VibeLux database
        return account;
      }
    );

    syncStatus.recordsProcessed! += successful.length;
    syncStatus.recordsFailed! += failed.length;

    failed.forEach(({ item, error }) => {
      syncStatus.errors?.push({
        timestamp: new Date(),
        entityType: 'accounts',
        entityId: item.id,
        errorCode: 'SAVE_FAILED',
        errorMessage: error.message
      });
    });
  }

  private async syncTransactions(syncStatus: SyncStatus): Promise<void> {
    const lastSync = this.config.syncSettings.entities
      .find(e => e.entityType === 'transactions')?.lastSyncDate;
    
    const transactions = await this.getTransactions(lastSync);
    const { successful, failed } = await this.processBatch(
      transactions,
      async (transaction) => {
        // TODO: Save to VibeLux database
        return transaction;
      }
    );

    syncStatus.recordsProcessed! += successful.length;
    syncStatus.recordsFailed! += failed.length;
  }

  private async syncInvoices(syncStatus: SyncStatus): Promise<void> {
    const invoices = await this.getInvoices();
    const { successful, failed } = await this.processBatch(
      invoices,
      async (invoice) => {
        // TODO: Save to VibeLux database
        return invoice;
      }
    );

    syncStatus.recordsProcessed! += successful.length;
    syncStatus.recordsFailed! += failed.length;
  }

  private async syncPayments(syncStatus: SyncStatus): Promise<void> {
    const payments = await this.getPayments();
    const { successful, failed } = await this.processBatch(
      payments,
      async (payment) => {
        // TODO: Save to VibeLux database
        return payment;
      }
    );

    syncStatus.recordsProcessed! += successful.length;
    syncStatus.recordsFailed! += failed.length;
  }

  /**
   * Mapping Functions
   */
  private mapSAPAccountToFinancialAccount(sapAccount: SAPAccount): FinancialAccount {
    return {
      id: sapAccount.Code,
      accountNumber: sapAccount.Code,
      accountName: sapAccount.Name,
      accountType: this.mapSAPAccountType(sapAccount.AccountType),
      currency: sapAccount.Currency || 'USD',
      balance: sapAccount.Balance,
      status: sapAccount.ActiveAccount === 'tYES' ? 'active' : 'inactive',
      integration: 'sap',
      lastSyncDate: new Date(),
      metadata: {
        sapAccountType: sapAccount.AccountType,
        level: sapAccount.Level,
        parentAccount: sapAccount.FatherAccountKey
      }
    };
  }

  private mapSAPAccountType(sapType: string): AccountType {
    const typeMap: Record<string, AccountType> = {
      'at_Assets': 'asset',
      'at_Liabilities': 'liability',
      'at_Equity': 'equity',
      'at_Revenue': 'revenue',
      'at_Expense': 'expense',
      'at_Other': 'asset'
    };
    
    return typeMap[sapType] || 'asset';
  }

  private mapSAPJournalEntryToTransaction(sapJournal: SAPJournalEntry): Transaction {
    const totalDebit = sapJournal.JournalEntryLines.reduce(
      (sum, line) => sum + (line.Debit || 0),
      0
    );

    return {
      id: sapJournal.JdtNum.toString(),
      transactionDate: new Date(sapJournal.RefDate),
      postingDate: new Date(sapJournal.RefDate),
      description: sapJournal.Memo || `Journal Entry ${sapJournal.JdtNum}`,
      amount: totalDebit,
      currency: 'USD', // TODO: Get from company settings
      accountId: '', // Will be set from line items
      status: 'posted',
      lineItems: sapJournal.JournalEntryLines.map(this.mapSAPJournalLineToTransactionLine),
      integration: {
        type: 'sap',
        id: sapJournal.JdtNum.toString(),
        lastSyncDate: new Date()
      }
    };
  }

  private mapSAPJournalLineToTransactionLine(sapLine: SAPJournalLine): TransactionLineItem {
    return {
      id: sapLine.Line_ID.toString(),
      description: sapLine.LineMemo || sapLine.ShortName || '',
      accountId: sapLine.AccountCode,
      debit: sapLine.Debit,
      credit: sapLine.Credit
    };
  }

  private mapSAPDocumentToInvoice(sapDoc: SAPDocument): Invoice {
    const subtotal = sapDoc.DocumentLines.reduce(
      (sum, line) => sum + (line.LineTotal || 0),
      0
    );
    const taxAmount = sapDoc.DocumentLines.reduce(
      (sum, line) => sum + (line.VatSum || 0),
      0
    );

    return {
      id: sapDoc.DocEntry.toString(),
      invoiceNumber: sapDoc.DocNum.toString(),
      customerId: sapDoc.CardCode,
      issueDate: new Date(sapDoc.DocDate),
      dueDate: sapDoc.DocDueDate ? new Date(sapDoc.DocDueDate) : new Date(sapDoc.DocDate),
      status: sapDoc.DocStatus === 'O' ? 'sent' : 'paid',
      subtotal,
      taxAmount,
      totalAmount: sapDoc.DocTotal,
      paidAmount: sapDoc.DocStatus === 'C' ? sapDoc.DocTotal : 0,
      currency: sapDoc.DocCurrency,
      paymentTerms: 'Net 30', // TODO: Get from business partner
      lineItems: sapDoc.DocumentLines.map(this.mapSAPDocumentLineToInvoiceLine),
      payments: [],
      integration: {
        type: 'sap',
        id: sapDoc.DocEntry.toString(),
        lastSyncDate: new Date()
      }
    };
  }

  private mapSAPDocumentLineToInvoiceLine(sapLine: SAPDocumentLine): InvoiceLineItem {
    return {
      id: sapLine.LineNum.toString(),
      description: sapLine.ItemDescription || '',
      productId: sapLine.ItemCode,
      quantity: sapLine.Quantity || 1,
      unitPrice: sapLine.Price || sapLine.LineTotal,
      taxAmount: sapLine.VatSum || 0,
      totalAmount: sapLine.LineTotal,
      accountId: sapLine.AccountCode
    };
  }

  private mapSAPPaymentToPayment(sapPayment: SAPPayment): Payment {
    return {
      id: sapPayment.DocEntry.toString(),
      paymentDate: new Date(sapPayment.DocDate),
      amount: sapPayment.TransferSum || 0,
      currency: sapPayment.DocCurrency,
      paymentMethod: 'other', // TODO: Map from payment means
      customerId: sapPayment.CardCode,
      status: 'completed' as PaymentStatus,
      bankAccount: sapPayment.TransferAccount,
      integration: {
        type: 'sap',
        id: sapPayment.DocEntry.toString(),
        lastSyncDate: new Date()
      }
    };
  }

  private mapTransactionToSAPJournalEntry(transaction: Partial<Transaction>): Partial<SAPJournalEntry> {
    return {
      RefDate: transaction.transactionDate ? 
        this.formatDate(transaction.transactionDate) : 
        this.formatDate(new Date()),
      Memo: transaction.description,
      JournalEntryLines: transaction.lineItems?.map((line, index) => ({
        Line_ID: index,
        AccountCode: line.accountId,
        Debit: line.debit,
        Credit: line.credit,
        LineMemo: line.description
      })) || []
    };
  }

  private mapInvoiceToSAPDocument(invoice: Partial<Invoice>): Partial<SAPDocument> {
    return {
      DocDate: invoice.issueDate ? 
        this.formatDate(invoice.issueDate) : 
        this.formatDate(new Date()),
      DocDueDate: invoice.dueDate ? 
        this.formatDate(invoice.dueDate) : 
        undefined,
      CardCode: invoice.customerId,
      DocumentLines: invoice.lineItems?.map((item, index) => ({
        LineNum: index,
        ItemCode: item.productId,
        ItemDescription: item.description,
        Quantity: item.quantity,
        Price: item.unitPrice,
        LineTotal: item.totalAmount
      })) || []
    };
  }

  private mapPaymentToSAPPayment(payment: Partial<Payment>): Partial<SAPPayment> {
    return {
      DocDate: payment.paymentDate ? 
        this.formatDate(payment.paymentDate) : 
        this.formatDate(new Date()),
      CardCode: payment.customerId,
      DocCurrency: payment.currency || 'USD',
      TransferSum: payment.amount
    };
  }

  /**
   * Utility Functions
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Error Recovery
   */
  async handleError(error: Error, context: string): Promise<void> {
    console.error(`SAP Connector Error in ${context}:`, error);

    // Check if it's a session error and try to reconnect
    if (error.message.includes('Session') || error.message.includes('401')) {
      await this.disconnect();
      await this.connect();
    }
  }
}