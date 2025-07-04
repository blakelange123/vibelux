/**
 * VibeLux Financial Integration Module - Type Definitions
 * Comprehensive types for financial accounts, transactions, invoices, and integrations
 */

// Base Financial Types
export interface FinancialAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  currency: string;
  balance: number;
  creditLimit?: number;
  status: AccountStatus;
  integration?: IntegrationType;
  lastSyncDate?: Date;
  metadata?: Record<string, any>;
}

export type AccountType = 
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense'
  | 'bank'
  | 'accounts_receivable'
  | 'accounts_payable'
  | 'inventory';

export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'closed';

export interface Transaction {
  id: string;
  transactionDate: Date;
  postingDate: Date;
  description: string;
  reference?: string;
  amount: number;
  currency: string;
  accountId: string;
  categoryId?: string;
  costCenterId?: string;
  projectId?: string;
  vendorId?: string;
  customerId?: string;
  status: TransactionStatus;
  attachments?: Attachment[];
  lineItems?: TransactionLineItem[];
  integration?: IntegrationSource;
  syncStatus?: SyncStatus;
  metadata?: Record<string, any>;
}

export type TransactionStatus = 
  | 'pending'
  | 'posted'
  | 'reconciled'
  | 'voided'
  | 'reversed';

export interface TransactionLineItem {
  id: string;
  description: string;
  accountId: string;
  debit?: number;
  credit?: number;
  taxAmount?: number;
  taxRate?: number;
  quantity?: number;
  unitPrice?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  paymentTerms: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  attachments?: Attachment[];
  integration?: IntegrationSource;
  syncStatus?: SyncStatus;
}

export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  taxAmount: number;
  totalAmount: number;
  accountId?: string;
  costCenterId?: string;
}

export interface Payment {
  id: string;
  paymentDate: Date;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  invoiceId?: string;
  customerId?: string;
  vendorId?: string;
  status: PaymentStatus;
  bankAccount?: string;
  processorTransactionId?: string;
  fees?: number;
  integration?: IntegrationSource;
}

export type PaymentMethod = 
  | 'cash'
  | 'check'
  | 'ach'
  | 'wire'
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'other';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

// Budget and Cost Center Types
export interface Budget {
  id: string;
  name: string;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  status: BudgetStatus;
  totalBudget: number;
  allocations: BudgetAllocation[];
  actualSpending?: number;
  variance?: number;
  approvedBy?: string;
  approvalDate?: Date;
}

export type BudgetStatus = 
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'active'
  | 'closed';

export interface BudgetAllocation {
  id: string;
  budgetId: string;
  accountId?: string;
  costCenterId?: string;
  categoryId?: string;
  period: string; // 'monthly' | 'quarterly' | 'annual'
  allocatedAmount: number;
  actualAmount?: number;
  variance?: number;
  notes?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  status: 'active' | 'inactive';
  budget?: number;
  actualCost?: number;
  allocations?: CostCenterAllocation[];
}

export interface CostCenterAllocation {
  accountId: string;
  percentage: number;
}

// Financial Reporting Types
export interface FinancialReport {
  id: string;
  reportType: ReportType;
  name: string;
  period: ReportPeriod;
  generatedDate: Date;
  data: any; // Report-specific data structure
  filters?: ReportFilter[];
  groupBy?: string[];
  sortBy?: string[];
}

export type ReportType = 
  | 'balance_sheet'
  | 'income_statement'
  | 'cash_flow'
  | 'trial_balance'
  | 'general_ledger'
  | 'accounts_receivable_aging'
  | 'accounts_payable_aging'
  | 'budget_vs_actual'
  | 'cost_center_analysis'
  | 'custom';

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

// Integration Configuration Types
export type IntegrationType = 'quickbooks' | 'sap' | 'manual';

export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  connectionSettings: ConnectionSettings;
  syncSettings: SyncSettings;
  mappingRules: MappingRule[];
  lastSyncDate?: Date;
  lastSyncStatus?: SyncStatus;
  errorLog?: IntegrationError[];
}

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'syncing'
  | 'paused';

export interface ConnectionSettings {
  // QuickBooks specific
  qbCompanyId?: string;
  qbClientId?: string;
  qbClientSecret?: string;
  qbAccessToken?: string;
  qbRefreshToken?: string;
  qbRealmId?: string;
  qbEnvironment?: 'sandbox' | 'production';
  
  // SAP specific
  sapHost?: string;
  sapPort?: number;
  sapUsername?: string;
  sapPassword?: string;
  sapCompanyDb?: string;
  sapServiceLayer?: boolean;
  
  // Common
  apiEndpoint?: string;
  authMethod?: 'oauth2' | 'basic' | 'apikey' | 'certificate';
  apiKey?: string;
  certificate?: string;
  webhookUrl?: string;
}

export interface SyncSettings {
  enabled: boolean;
  direction: SyncDirection;
  frequency: SyncFrequency;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number; // milliseconds
  conflictResolution: ConflictResolution;
  entities: EntitySyncConfig[];
}

export type SyncDirection = 
  | 'vibelux_to_external'
  | 'external_to_vibelux'
  | 'bidirectional';

export type SyncFrequency = 
  | 'realtime'
  | 'every_5_minutes'
  | 'every_15_minutes'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'manual';

export type ConflictResolution = 
  | 'vibelux_wins'
  | 'external_wins'
  | 'newest_wins'
  | 'manual_review';

export interface EntitySyncConfig {
  entityType: EntityType;
  enabled: boolean;
  lastSyncDate?: Date;
  syncFields?: string[];
  filters?: SyncFilter[];
}

export type EntityType = 
  | 'accounts'
  | 'transactions'
  | 'invoices'
  | 'payments'
  | 'customers'
  | 'vendors'
  | 'products'
  | 'cost_centers'
  | 'budgets';

export interface SyncFilter {
  field: string;
  operator: string;
  value: any;
}

// Mapping Rules
export interface MappingRule {
  id: string;
  entityType: EntityType;
  vibeluxField: string;
  externalField: string;
  transformationType?: TransformationType;
  transformationConfig?: any;
  defaultValue?: any;
  required: boolean;
}

export type TransformationType = 
  | 'direct'
  | 'lookup'
  | 'formula'
  | 'conditional'
  | 'custom';

// Synchronization Types
export interface SyncStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  recordsProcessed?: number;
  recordsFailed?: number;
  errors?: SyncError[];
}

export interface SyncError {
  timestamp: Date;
  entityType: EntityType;
  entityId?: string;
  errorCode: string;
  errorMessage: string;
  details?: any;
}

export interface IntegrationError {
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  code: string;
  message: string;
  details?: any;
  resolved?: boolean;
}

export interface IntegrationSource {
  type: IntegrationType;
  id: string;
  lastSyncDate?: Date;
}

// Helper Types
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadDate: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Financial Metrics
export interface FinancialMetrics {
  revenue: MetricValue;
  expenses: MetricValue;
  netIncome: MetricValue;
  cashFlow: MetricValue;
  accountsReceivable: MetricValue;
  accountsPayable: MetricValue;
  workingCapital: MetricValue;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
}

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// Export all types
export type {
  FinancialAccount,
  Transaction,
  Invoice,
  Payment,
  Budget,
  CostCenter,
  FinancialReport,
  IntegrationConfig,
  MappingRule,
  SyncStatus,
  FinancialMetrics
};