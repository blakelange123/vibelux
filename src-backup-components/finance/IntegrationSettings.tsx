'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Link2, 
  Unlink, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  ChevronRight,
  Calendar,
  Database,
  ArrowUpDown,
  Filter,
  Map,
  Clock,
  Shield,
  Loader2,
  ChevronDown,
  Save,
  TestTube,
  Key,
  Globe,
  Server
} from 'lucide-react';
import {
  IntegrationConfig,
  IntegrationType,
  IntegrationStatus,
  EntityType,
  SyncDirection,
  SyncFrequency,
  ConflictResolution,
  MappingRule,
  IntegrationError,
  ConnectionSettings
} from '@/lib/finance/finance-types';

interface IntegrationCardProps {
  integration: IntegrationConfig;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onConfigure: () => void;
}

function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onSync, 
  onConfigure 
}: IntegrationCardProps) {
  const isConnected = integration.status === 'connected';
  const isSyncing = integration.status === 'syncing';
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${
            integration.type === 'quickbooks' ? 'bg-green-500/10' : 'bg-blue-500/10'
          }`}>
            {integration.type === 'quickbooks' ? (
              <div className="w-8 h-8 text-green-400 font-bold">QB</div>
            ) : (
              <div className="w-8 h-8 text-blue-400 font-bold">SAP</div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 
                integration.status === 'error' ? 'bg-red-400' : 
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-400 capitalize">
                {integration.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 
                  rounded-lg transition-colors disabled:opacity-50"
                title="Sync now"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onDisconnect}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 
                  rounded-lg transition-colors"
                title="Disconnect"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white 
                rounded-lg text-sm font-medium transition-colors"
            >
              Connect
            </button>
          )}
          
          <button
            onClick={onConfigure}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 
              rounded-lg transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {integration.lastSyncDate && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last sync</span>
          <span className="text-gray-400">
            {new Date(integration.lastSyncDate).toLocaleString()}
          </span>
        </div>
      )}
      
      {integration.errorLog && integration.errorLog.length > 0 && (
        <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">
                {integration.errorLog[0].message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(integration.errorLog[0].timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConnectionFormProps {
  type: IntegrationType;
  settings: Partial<ConnectionSettings>;
  onSave: (settings: ConnectionSettings) => void;
  onCancel: () => void;
}

function ConnectionForm({ type, settings, onSave, onCancel }: ConnectionFormProps) {
  const [formData, setFormData] = useState<Partial<ConnectionSettings>>(settings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResult({
      success: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3,
      message: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3 ? 'Connection successful' : 'Failed to connect'
    });
    setTesting(false);
  };

  const handleSave = () => {
    onSave(formData as ConnectionSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-white mb-4">
          Connect to {type === 'quickbooks' ? 'QuickBooks' : 'SAP'}
        </h3>

        <div className="space-y-4">
          {type === 'quickbooks' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Environment
                </label>
                <select
                  value={formData.qbEnvironment || 'production'}
                  onChange={(e) => setFormData({ ...formData, qbEnvironment: e.target.value as 'sandbox' | 'production' })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.qbClientId || ''}
                  onChange={(e) => setFormData({ ...formData, qbClientId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter QuickBooks Client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={formData.qbClientSecret || ''}
                  onChange={(e) => setFormData({ ...formData, qbClientSecret: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter QuickBooks Client Secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Company ID (Realm ID)
                </label>
                <input
                  type="text"
                  value={formData.qbRealmId || ''}
                  onChange={(e) => setFormData({ ...formData, qbRealmId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter QuickBooks Company ID"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  SAP Host
                </label>
                <input
                  type="text"
                  value={formData.sapHost || ''}
                  onChange={(e) => setFormData({ ...formData, sapHost: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., sap.company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.sapPort || 50000}
                  onChange={(e) => setFormData({ ...formData, sapPort: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.sapUsername || ''}
                  onChange={(e) => setFormData({ ...formData, sapUsername: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="SAP username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.sapPassword || ''}
                  onChange={(e) => setFormData({ ...formData, sapPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="SAP password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Company Database
                </label>
                <input
                  type="text"
                  value={formData.sapCompanyDb || ''}
                  onChange={(e) => setFormData({ ...formData, sapCompanyDb: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Company database name"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="serviceLayer"
                  checked={formData.sapServiceLayer || false}
                  onChange={(e) => setFormData({ ...formData, sapServiceLayer: e.target.checked })}
                  className="rounded border-gray-700 bg-gray-800 text-purple-600 
                    focus:ring-purple-500"
                />
                <label htmlFor="serviceLayer" className="text-sm text-gray-400">
                  Use Service Layer API
                </label>
              </div>
            </>
          )}

          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult.success ? 'bg-green-500/10 border border-green-500/20' : 
              'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg 
              transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white 
              rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface EntityAdvancedConfigProps {
  entityType: EntityType;
  config: any;
  integrationType: IntegrationType;
  onChange: (config: any) => void;
}

function EntityAdvancedConfig({ entityType, config, integrationType, onChange }: EntityAdvancedConfigProps) {
  const [localConfig, setLocalConfig] = useState(config.advancedSettings || {});

  const handleChange = (key: string, value: any) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onChange({ ...config, advancedSettings: updated });
  };

  // Entity-specific configuration based on type
  switch (entityType) {
    case 'accounts':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Account Type Mapping
            </label>
            <select
              value={localConfig.accountTypeMapping || 'auto'}
              onChange={(e) => handleChange('accountTypeMapping', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="auto">Automatic mapping</option>
              <option value="manual">Manual mapping</option>
              <option value="custom">Custom rules</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-includeInactive`}
              checked={localConfig.includeInactive || false}
              onChange={(e) => handleChange('includeInactive', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-includeInactive`} className="text-sm text-gray-400">
              Include inactive accounts
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-autoCreate`}
              checked={localConfig.autoCreateAccounts || false}
              onChange={(e) => handleChange('autoCreateAccounts', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-autoCreate`} className="text-sm text-gray-400">
              Auto-create missing accounts
            </label>
          </div>
        </div>
      );

    case 'transactions':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Date Range
              </label>
              <select
                value={localConfig.dateRange || 'last_30_days'}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="current_month">Current month</option>
                <option value="last_month">Last month</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Transaction Types
              </label>
              <select
                value={localConfig.transactionTypes || 'all'}
                onChange={(e) => handleChange('transactionTypes', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All types</option>
                <option value="expenses">Expenses only</option>
                <option value="income">Income only</option>
                <option value="transfers">Transfers only</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-includePending`}
              checked={localConfig.includePending || false}
              onChange={(e) => handleChange('includePending', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-includePending`} className="text-sm text-gray-400">
              Include pending transactions
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-autoReconcile`}
              checked={localConfig.autoReconcile || false}
              onChange={(e) => handleChange('autoReconcile', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-autoReconcile`} className="text-sm text-gray-400">
              Auto-reconcile matched transactions
            </label>
          </div>
        </div>
      );

    case 'invoices':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Invoice Number Format
            </label>
            <input
              type="text"
              value={localConfig.numberFormat || 'INV-{YYYY}-{0000}'}
              onChange={(e) => handleChange('numberFormat', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              placeholder="e.g., INV-{YYYY}-{0000}"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Default Due Days
              </label>
              <input
                type="number"
                value={localConfig.defaultDueDays || 30}
                onChange={(e) => handleChange('defaultDueDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white text-sm focus:border-purple-500 focus:outline-none"
                min="1"
                max="365"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tax Rate
              </label>
              <input
                type="number"
                value={localConfig.taxRate || 0}
                onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white text-sm focus:border-purple-500 focus:outline-none"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-autoSend`}
              checked={localConfig.autoSendInvoices || false}
              onChange={(e) => handleChange('autoSendInvoices', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-autoSend`} className="text-sm text-gray-400">
              Auto-send invoices to customers
            </label>
          </div>
        </div>
      );

    case 'payments':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Payment Methods
            </label>
            <div className="space-y-2">
              {['Cash', 'Check', 'Credit Card', 'Bank Transfer', 'Other'].map(method => (
                <div key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`payment-${method}`}
                    checked={localConfig.paymentMethods?.[method] !== false}
                    onChange={(e) => {
                      const methods = localConfig.paymentMethods || {};
                      handleChange('paymentMethods', { ...methods, [method]: e.target.checked });
                    }}
                    className="rounded border-gray-700 bg-gray-800 text-purple-600"
                  />
                  <label htmlFor={`payment-${method}`} className="text-sm text-gray-400">
                    {method}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-autoApply`}
              checked={localConfig.autoApplyPayments || false}
              onChange={(e) => handleChange('autoApplyPayments', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-autoApply`} className="text-sm text-gray-400">
              Auto-apply payments to open invoices
            </label>
          </div>
        </div>
      );

    case 'customers':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Customer ID Format
            </label>
            <input
              type="text"
              value={localConfig.customerIdFormat || 'CUST-{0000}'}
              onChange={(e) => handleChange('customerIdFormat', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              placeholder="e.g., CUST-{0000}"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-syncContacts`}
              checked={localConfig.syncContacts || false}
              onChange={(e) => handleChange('syncContacts', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-syncContacts`} className="text-sm text-gray-400">
              Sync contact information
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-syncCreditTerms`}
              checked={localConfig.syncCreditTerms || false}
              onChange={(e) => handleChange('syncCreditTerms', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-syncCreditTerms`} className="text-sm text-gray-400">
              Sync credit terms and limits
            </label>
          </div>
        </div>
      );

    case 'vendors':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Vendor Categories
            </label>
            <select
              value={localConfig.vendorCategories || 'all'}
              onChange={(e) => handleChange('vendorCategories', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All categories</option>
              <option value="suppliers">Suppliers only</option>
              <option value="contractors">Contractors only</option>
              <option value="utilities">Utilities only</option>
              <option value="custom">Custom selection</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-sync1099`}
              checked={localConfig.sync1099Info || false}
              onChange={(e) => handleChange('sync1099Info', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-sync1099`} className="text-sm text-gray-400">
              Sync 1099 information
            </label>
          </div>
        </div>
      );

    case 'products':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Type
            </label>
            <select
              value={localConfig.productType || 'all'}
              onChange={(e) => handleChange('productType', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All products</option>
              <option value="inventory">Inventory items</option>
              <option value="non_inventory">Non-inventory items</option>
              <option value="services">Services</option>
              <option value="bundles">Product bundles</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-syncInventory`}
              checked={localConfig.syncInventoryLevels || false}
              onChange={(e) => handleChange('syncInventoryLevels', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-syncInventory`} className="text-sm text-gray-400">
              Sync inventory levels
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-syncPricing`}
              checked={localConfig.syncPricing || false}
              onChange={(e) => handleChange('syncPricing', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-syncPricing`} className="text-sm text-gray-400">
              Sync pricing information
            </label>
          </div>
        </div>
      );

    case 'cost_centers':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Cost Center Hierarchy
            </label>
            <select
              value={localConfig.hierarchyLevel || 'all'}
              onChange={(e) => handleChange('hierarchyLevel', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All levels</option>
              <option value="department">Department level</option>
              <option value="project">Project level</option>
              <option value="location">Location level</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-autoAllocate`}
              checked={localConfig.autoAllocateCosts || false}
              onChange={(e) => handleChange('autoAllocateCosts', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-autoAllocate`} className="text-sm text-gray-400">
              Auto-allocate costs based on rules
            </label>
          </div>
        </div>
      );

    case 'budgets':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Budget Period
            </label>
            <select
              value={localConfig.budgetPeriod || 'monthly'}
              onChange={(e) => handleChange('budgetPeriod', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom periods</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-syncActuals`}
              checked={localConfig.syncActuals || false}
              onChange={(e) => handleChange('syncActuals', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-syncActuals`} className="text-sm text-gray-400">
              Sync actual vs budget comparisons
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${entityType}-alertsEnabled`}
              checked={localConfig.budgetAlertsEnabled || false}
              onChange={(e) => handleChange('budgetAlertsEnabled', e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            <label htmlFor={`${entityType}-alertsEnabled`} className="text-sm text-gray-400">
              Enable budget alerts
            </label>
          </div>
          {localConfig.budgetAlertsEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Alert Threshold (%)
              </label>
              <input
                type="number"
                value={localConfig.alertThreshold || 90}
                onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white text-sm focus:border-purple-500 focus:outline-none"
                min="50"
                max="100"
              />
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="p-3 bg-gray-800/50 rounded-lg text-sm text-gray-500">
          Configuration for {entityType} coming soon...
        </div>
      );
  }
}

interface SyncSettingsProps {
  config: IntegrationConfig;
  onSave: (config: IntegrationConfig) => void;
  onClose: () => void;
}

function SyncSettings({ config, onSave, onClose }: SyncSettingsProps) {
  const [settings, setSettings] = useState(config.syncSettings);
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const entities: EntityType[] = [
    'accounts', 'transactions', 'invoices', 'payments', 
    'customers', 'vendors', 'products', 'cost_centers', 'budgets'
  ];

  const handleEntityToggle = (entityType: EntityType) => {
    const updatedEntities = [...settings.entities];
    const entityIndex = updatedEntities.findIndex(e => e.entityType === entityType);
    
    if (entityIndex >= 0) {
      updatedEntities[entityIndex] = {
        ...updatedEntities[entityIndex],
        enabled: !updatedEntities[entityIndex].enabled
      };
    } else {
      updatedEntities.push({
        entityType,
        enabled: true
      });
    }
    
    setSettings({ ...settings, entities: updatedEntities });
  };

  const getEntityConfig = (entityType: EntityType) => {
    return settings.entities.find(e => e.entityType === entityType) || {
      entityType,
      enabled: false
    };
  };

  const handleSave = () => {
    onSave({ ...config, syncSettings: settings });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Sync Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">General Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Sync Direction
                </label>
                <select
                  value={settings.direction}
                  onChange={(e) => setSettings({ ...settings, direction: e.target.value as SyncDirection })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="vibelux_to_external">VibeLux → {config.type}</option>
                  <option value="external_to_vibelux">{config.type} → VibeLux</option>
                  <option value="bidirectional">Bidirectional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Sync Frequency
                </label>
                <select
                  value={settings.frequency}
                  onChange={(e) => setSettings({ ...settings, frequency: e.target.value as SyncFrequency })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="realtime">Real-time</option>
                  <option value="every_5_minutes">Every 5 minutes</option>
                  <option value="every_15_minutes">Every 15 minutes</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Conflict Resolution
                </label>
                <select
                  value={settings.conflictResolution}
                  onChange={(e) => setSettings({ ...settings, conflictResolution: e.target.value as ConflictResolution })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="vibelux_wins">VibeLux wins</option>
                  <option value="external_wins">{config.type} wins</option>
                  <option value="newest_wins">Newest wins</option>
                  <option value="manual_review">Manual review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Batch Size
                </label>
                <input
                  type="number"
                  value={settings.batchSize}
                  onChange={(e) => setSettings({ ...settings, batchSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* Entity Configuration */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Entity Configuration</h4>
            
            <div className="space-y-2">
              {entities.map((entityType) => {
                const entityConfig = getEntityConfig(entityType);
                const isExpanded = expandedEntity === entityType;
                
                return (
                  <div key={entityType} className="border border-gray-800 rounded-lg">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50"
                      onClick={() => setExpandedEntity(isExpanded ? null : entityType)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={entityConfig.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleEntityToggle(entityType);
                          }}
                          className="rounded border-gray-700 bg-gray-800 text-purple-600 
                            focus:ring-purple-500"
                        />
                        <span className="text-white capitalize">
                          {entityType.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {entityConfig.lastSyncDate && (
                          <span className="text-xs text-gray-500">
                            Last sync: {new Date(entityConfig.lastSyncDate).toLocaleDateString()}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="text-sm text-gray-400">
                          Configure specific settings for {entityType} synchronization
                        </div>
                        
                        {/* Entity-specific settings */}
                        <EntityAdvancedConfig
                          entityType={entityType}
                          config={entityConfig}
                          integrationType={config.type}
                          onChange={(updatedConfig) => {
                            const updatedEntities = settings.entities.map(e =>
                              e.entityType === entityType ? { ...e, ...updatedConfig } : e
                            );
                            setSettings({ ...settings, entities: updatedEntities });
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white 
              rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: '1',
      type: 'quickbooks',
      name: 'QuickBooks Online',
      status: 'disconnected',
      connectionSettings: {},
      syncSettings: {
        enabled: true,
        direction: 'bidirectional',
        frequency: 'every_15_minutes',
        batchSize: 100,
        retryAttempts: 3,
        retryDelay: 5000,
        conflictResolution: 'newest_wins',
        entities: []
      },
      mappingRules: []
    },
    {
      id: '2',
      type: 'sap',
      name: 'SAP Business One',
      status: 'disconnected',
      connectionSettings: {},
      syncSettings: {
        enabled: true,
        direction: 'external_to_vibelux',
        frequency: 'hourly',
        batchSize: 50,
        retryAttempts: 3,
        retryDelay: 10000,
        conflictResolution: 'external_wins',
        entities: []
      },
      mappingRules: []
    }
  ]);

  const [showConnectionForm, setShowConnectionForm] = useState<IntegrationType | null>(null);
  const [showSyncSettings, setShowSyncSettings] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'mapping' | 'logs'>('connections');

  const handleConnect = (type: IntegrationType) => {
    setShowConnectionForm(type);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, status: 'disconnected' as IntegrationStatus } : int
    ));
  };

  const handleSync = async (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, status: 'syncing' as IntegrationStatus } : int
    ));
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIntegrations(integrations.map(int => 
      int.id === id ? { 
        ...int, 
        status: 'connected' as IntegrationStatus,
        lastSyncDate: new Date()
      } : int
    ));
  };

  const handleSaveConnection = (type: IntegrationType, settings: ConnectionSettings) => {
    setIntegrations(integrations.map(int => 
      int.type === type ? { 
        ...int, 
        connectionSettings: settings,
        status: 'connected' as IntegrationStatus
      } : int
    ));
    setShowConnectionForm(null);
  };

  const handleSaveSyncSettings = (config: IntegrationConfig) => {
    setIntegrations(integrations.map(int => 
      int.id === config.id ? config : int
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Financial Integrations</h1>
        <p className="text-gray-400">
          Connect and configure your accounting systems for seamless data synchronization
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('connections')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'connections' 
              ? 'text-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Connections
          {activeTab === 'connections' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('mapping')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'mapping' 
              ? 'text-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Field Mapping
          {activeTab === 'mapping' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'logs' 
              ? 'text-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Error Logs
          {activeTab === 'logs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={() => handleConnect(integration.type)}
              onDisconnect={() => handleDisconnect(integration.id)}
              onSync={() => handleSync(integration.id)}
              onConfigure={() => setShowSyncSettings(integration.id)}
            />
          ))}
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Field Mapping</h3>
              <p className="text-gray-400">
                Configure field mappings between VibeLux and your accounting systems
              </p>
              <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                text-white rounded-lg transition-colors">
                Configure Mappings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Error Logs</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Clear resolved
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Sample error logs */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white">
                        Failed to sync invoice #INV-2024-0156
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        QuickBooks • 2 hours ago
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">
                      Warning
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Customer not found in QuickBooks. Please create the customer first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Form Modal */}
      {showConnectionForm && (
        <ConnectionForm
          type={showConnectionForm}
          settings={integrations.find(i => i.type === showConnectionForm)?.connectionSettings || {}}
          onSave={(settings) => handleSaveConnection(showConnectionForm, settings)}
          onCancel={() => setShowConnectionForm(null)}
        />
      )}

      {/* Sync Settings Modal */}
      {showSyncSettings && (
        <SyncSettings
          config={integrations.find(i => i.id === showSyncSettings)!}
          onSave={handleSaveSyncSettings}
          onClose={() => setShowSyncSettings(null)}
        />
      )}
    </div>
  );
}