import { QuickBooksIntegration } from './quickbooks';
import { XeroIntegration } from './xero';
import { ACCOUNTING_PROVIDERS, AccountingProvider, AccountingIntegrationConfig } from './accounting-providers';

// Unified interface for all accounting integrations
export interface AccountingAdapter {
  getCustomers(): Promise<any[]>;
  getItems(): Promise<any[]>;
  getInvoices(startDate?: Date, endDate?: Date): Promise<any[]>;
  getExpenses(startDate?: Date, endDate?: Date): Promise<any[]>;
  getProfitAndLoss(startDate: Date, endDate: Date): Promise<any>;
  getBalanceSheet(asOfDate: Date): Promise<any>;
  getCashFlow(startDate: Date, endDate: Date): Promise<any>;
  getRevenue(startDate?: Date, endDate?: Date): Promise<any[]>;
  getAssets(): Promise<any[]>;
}

export class UnifiedAccountingAdapter implements AccountingAdapter {
  private integration: AccountingAdapter;
  private provider: AccountingProvider;

  constructor(providerName: string, config: AccountingIntegrationConfig) {
    this.provider = ACCOUNTING_PROVIDERS[providerName];
    
    if (!this.provider) {
      throw new Error(`Unsupported accounting provider: ${providerName}`);
    }

    // Initialize the appropriate integration
    switch (providerName) {
      case 'QUICKBOOKS':
        this.integration = new QuickBooksIntegration({
          companyId: config.companyId!,
          accessToken: config.accessToken,
          refreshToken: config.refreshToken!,
          sandbox: config.sandbox
        });
        break;

      case 'XERO':
        this.integration = new XeroIntegration({
          tenantId: config.companyId!,
          accessToken: config.accessToken,
          refreshToken: config.refreshToken!,
          sandbox: config.sandbox
        });
        break;

      default:
        throw new Error(`Provider ${providerName} not yet implemented`);
    }
  }

  // Unified methods that delegate to the appropriate integration
  async getCustomers() {
    this.validateCapability('customers');
    return this.integration.getCustomers();
  }

  async getItems() {
    this.validateCapability('items');
    return this.integration.getItems();
  }

  async getInvoices(startDate?: Date, endDate?: Date) {
    this.validateCapability('invoices');
    return this.integration.getInvoices(startDate, endDate);
  }

  async getExpenses(startDate?: Date, endDate?: Date) {
    this.validateCapability('expenses');
    return this.integration.getExpenses(startDate, endDate);
  }

  async getProfitAndLoss(startDate: Date, endDate: Date) {
    this.validateCapability('profitLoss');
    return this.integration.getProfitAndLoss(startDate, endDate);
  }

  async getBalanceSheet(asOfDate: Date) {
    this.validateCapability('balanceSheet');
    return this.integration.getBalanceSheet(asOfDate);
  }

  async getCashFlow(startDate: Date, endDate: Date) {
    this.validateCapability('cashFlow');
    return this.integration.getCashFlow(startDate, endDate);
  }

  async getRevenue(startDate?: Date, endDate?: Date) {
    this.validateCapability('revenue');
    return this.integration.getRevenue(startDate, endDate);
  }

  async getAssets() {
    this.validateCapability('assets');
    return this.integration.getAssets();
  }

  // Helper methods
  private validateCapability(feature: string) {
    const capability = this.provider.capabilities.find(cap => cap.feature === feature);
    
    if (!capability || !capability.supported) {
      throw new Error(
        `Feature '${feature}' is not supported by ${this.provider.displayName}${
          capability?.notes ? ': ' + capability.notes : ''
        }`
      );
    }
  }

  getProviderInfo() {
    return {
      name: this.provider.name,
      displayName: this.provider.displayName,
      capabilities: this.provider.capabilities
    };
  }

  isFeatureSupported(feature: string): boolean {
    const capability = this.provider.capabilities.find(cap => cap.feature === feature);
    return capability?.supported || false;
  }
}

// Factory function for creating accounting adapters
export function createAccountingAdapter(
  provider: string, 
  config: AccountingIntegrationConfig
): UnifiedAccountingAdapter {
  return new UnifiedAccountingAdapter(provider, config);
}

// Helper function to get all supported providers
export function getSupportedProviders(): AccountingProvider[] {
  return Object.values(ACCOUNTING_PROVIDERS);
}

// Helper function to validate provider configuration
export function validateProviderConfig(
  provider: string, 
  config: AccountingIntegrationConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const providerInfo = ACCOUNTING_PROVIDERS[provider];

  if (!providerInfo) {
    return { valid: false, errors: [`Unknown provider: ${provider}`] };
  }

  // Check required fields based on auth type
  switch (providerInfo.authType) {
    case 'oauth2':
      if (!config.accessToken) errors.push('Access token is required');
      if (!config.refreshToken) errors.push('Refresh token is required');
      break;
    
    case 'api_key':
      if (!config.apiKey) errors.push('API key is required');
      break;
    
    case 'token':
      if (!config.accessToken) errors.push('Access token is required');
      break;
  }

  // Provider-specific validations
  if (provider === 'QUICKBOOKS' && !config.companyId) {
    errors.push('Company ID is required for QuickBooks');
  }

  if (provider === 'XERO' && !config.companyId) {
    errors.push('Tenant ID is required for Xero');
  }

  return { valid: errors.length === 0, errors };
}