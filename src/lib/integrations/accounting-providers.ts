// Unified accounting provider interface for multiple accounting software integrations
export interface AccountingProvider {
  name: string;
  displayName: string;
  apiBaseUrl: string;
  authType: 'oauth2' | 'api_key' | 'token';
  capabilities: AccountingCapability[];
  endpoints: AccountingEndpoints;
}

export interface AccountingCapability {
  feature: string;
  supported: boolean;
  notes?: string;
}

export interface AccountingEndpoints {
  customers: string;
  items: string;
  invoices: string;
  expenses: string;
  profitLoss: string;
  balanceSheet: string;
  cashFlow: string;
  revenue: string;
  assets: string;
}

export interface AccountingIntegrationConfig {
  provider: string;
  companyId?: string;
  accessToken: string;
  refreshToken?: string;
  apiKey?: string;
  sandbox: boolean;
  baseUrl?: string;
}

// Supported accounting providers
export const ACCOUNTING_PROVIDERS: Record<string, AccountingProvider> = {
  QUICKBOOKS: {
    name: 'QUICKBOOKS',
    displayName: 'QuickBooks',
    apiBaseUrl: 'https://sandbox-quickbooks.api.intuit.com',
    authType: 'oauth2',
    capabilities: [
      { feature: 'customers', supported: true },
      { feature: 'items', supported: true },
      { feature: 'invoices', supported: true },
      { feature: 'expenses', supported: true },
      { feature: 'profitLoss', supported: true },
      { feature: 'balanceSheet', supported: true },
      { feature: 'cashFlow', supported: true },
      { feature: 'revenue', supported: true },
      { feature: 'assets', supported: true }
    ],
    endpoints: {
      customers: '/v3/company/{companyId}/customers',
      items: '/v3/company/{companyId}/items',
      invoices: '/v3/company/{companyId}/invoices',
      expenses: '/v3/company/{companyId}/expenses',
      profitLoss: '/v3/company/{companyId}/reports/ProfitAndLoss',
      balanceSheet: '/v3/company/{companyId}/reports/BalanceSheet',
      cashFlow: '/v3/company/{companyId}/reports/CashFlow',
      revenue: '/v3/company/{companyId}/reports/CustomerSales',
      assets: '/v3/company/{companyId}/items?type=Asset'
    }
  },

  XERO: {
    name: 'XERO',
    displayName: 'Xero',
    apiBaseUrl: 'https://api.xero.com',
    authType: 'oauth2',
    capabilities: [
      { feature: 'customers', supported: true },
      { feature: 'items', supported: true },
      { feature: 'invoices', supported: true },
      { feature: 'expenses', supported: true },
      { feature: 'profitLoss', supported: true },
      { feature: 'balanceSheet', supported: true },
      { feature: 'cashFlow', supported: true },
      { feature: 'revenue', supported: true },
      { feature: 'assets', supported: true }
    ],
    endpoints: {
      customers: '/api.xro/2.0/Contacts?where=IsCustomer==true',
      items: '/api.xro/2.0/Items',
      invoices: '/api.xro/2.0/Invoices',
      expenses: '/api.xro/2.0/Payments?where=PaymentType=="ACCRECPAYMENT"',
      profitLoss: '/api.xro/2.0/Reports/ProfitAndLoss',
      balanceSheet: '/api.xro/2.0/Reports/BalanceSheet',
      cashFlow: '/api.xro/2.0/Reports/CashSummary',
      revenue: '/api.xro/2.0/Reports/AgedReceivablesByContact',
      assets: '/api.xro/2.0/Assets'
    }
  },

  NETSUITE: {
    name: 'NETSUITE',
    displayName: 'NetSuite',
    apiBaseUrl: 'https://{accountId}.suitetalk.api.netsuite.com',
    authType: 'oauth2',
    capabilities: [
      { feature: 'customers', supported: true },
      { feature: 'items', supported: true },
      { feature: 'invoices', supported: true },
      { feature: 'expenses', supported: true },
      { feature: 'profitLoss', supported: true },
      { feature: 'balanceSheet', supported: true },
      { feature: 'cashFlow', supported: true },
      { feature: 'revenue', supported: true },
      { feature: 'assets', supported: true }
    ],
    endpoints: {
      customers: '/services/rest/record/v1/customer',
      items: '/services/rest/record/v1/item',
      invoices: '/services/rest/record/v1/invoice',
      expenses: '/services/rest/record/v1/expense',
      profitLoss: '/services/rest/record/v1/financialstatement/profitandloss',
      balanceSheet: '/services/rest/record/v1/financialstatement/balancesheet',
      cashFlow: '/services/rest/record/v1/financialstatement/cashflow',
      revenue: '/services/rest/record/v1/transaction?type=Invoice',
      assets: '/services/rest/record/v1/item?type=Asset'
    }
  },

  FRESHBOOKS: {
    name: 'FRESHBOOKS',
    displayName: 'FreshBooks',
    apiBaseUrl: 'https://api.freshbooks.com',
    authType: 'oauth2',
    capabilities: [
      { feature: 'customers', supported: true },
      { feature: 'items', supported: true },
      { feature: 'invoices', supported: true },
      { feature: 'expenses', supported: true },
      { feature: 'profitLoss', supported: true },
      { feature: 'balanceSheet', supported: false, notes: 'Limited balance sheet data' },
      { feature: 'cashFlow', supported: false, notes: 'No direct cash flow reports' },
      { feature: 'revenue', supported: true },
      { feature: 'assets', supported: false, notes: 'No asset management' }
    ],
    endpoints: {
      customers: '/accounting/account/{accountId}/users/clients',
      items: '/accounting/account/{accountId}/items/items',
      invoices: '/accounting/account/{accountId}/invoices/invoices',
      expenses: '/accounting/account/{accountId}/expenses/expenses',
      profitLoss: '/accounting/account/{accountId}/reports/accounting/profitloss',
      balanceSheet: '',
      cashFlow: '',
      revenue: '/accounting/account/{accountId}/reports/accounting/invoice_details',
      assets: ''
    }
  },

  WAVE: {
    name: 'WAVE',
    displayName: 'Wave Accounting',
    apiBaseUrl: 'https://gql.waveapps.com/graphql/public',
    authType: 'oauth2',
    capabilities: [
      { feature: 'customers', supported: true },
      { feature: 'items', supported: true },
      { feature: 'invoices', supported: true },
      { feature: 'expenses', supported: true },
      { feature: 'profitLoss', supported: true },
      { feature: 'balanceSheet', supported: true },
      { feature: 'cashFlow', supported: false, notes: 'No direct cash flow API' },
      { feature: 'revenue', supported: true },
      { feature: 'assets', supported: false, notes: 'Limited asset tracking' }
    ],
    endpoints: {
      customers: 'query { customers { nodes { id name email } } }',
      items: 'query { products { nodes { id name price } } }',
      invoices: 'query { invoices { nodes { id total createdAt } } }',
      expenses: 'query { transactions(accountTypes: [EXPENSE]) { nodes { id amount date } } }',
      profitLoss: 'query { accountSubtypes { nodes { name normalSide accounts { nodes { balance } } } } }',
      balanceSheet: 'query { accountSubtypes { nodes { name normalSide accounts { nodes { balance } } } } }',
      cashFlow: '',
      revenue: 'query { transactions(accountTypes: [INCOME]) { nodes { id amount date } } }',
      assets: ''
    }
  },

  SAGE: {
    name: 'SAGE',
    displayName: 'Sage Business Cloud',
    apiBaseUrl: 'https://api.columbus.sage.com',
    authType: 'oauth2',
    capabilities: [
      { feature: 'customers', supported: true },
      { feature: 'items', supported: true },
      { feature: 'invoices', supported: true },
      { feature: 'expenses', supported: true },
      { feature: 'profitLoss', supported: true },
      { feature: 'balanceSheet', supported: true },
      { feature: 'cashFlow', supported: true },
      { feature: 'revenue', supported: true },
      { feature: 'assets', supported: true }
    ],
    endpoints: {
      customers: '/v3.1/customers',
      items: '/v3.1/products',
      invoices: '/v3.1/sales_invoices',
      expenses: '/v3.1/purchase_invoices',
      profitLoss: '/v3.1/profit_and_loss_accounts',
      balanceSheet: '/v3.1/balance_sheet_accounts',
      cashFlow: '/v3.1/cash_flow_statement',
      revenue: '/v3.1/sales_invoices',
      assets: '/v3.1/fixed_assets'
    }
  }
};

// Provider validation
export function validateProvider(provider: string): boolean {
  return provider in ACCOUNTING_PROVIDERS;
}

export function getProviderCapabilities(provider: string): AccountingCapability[] {
  return ACCOUNTING_PROVIDERS[provider]?.capabilities || [];
}

export function isFeatureSupported(provider: string, feature: string): boolean {
  const capabilities = getProviderCapabilities(provider);
  const capability = capabilities.find(cap => cap.feature === feature);
  return capability?.supported || false;
}