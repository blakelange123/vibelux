'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  CreditCard,
  FileText,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
  BarChart3,
  Wallet,
  Receipt,
  Building2,
  Loader2
} from 'lucide-react';
import { 
  FinancialMetrics, 
  MetricValue,
  Transaction,
  Invoice,
  Payment,
  Budget,
  CostCenter
} from '@/lib/finance/finance-types';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

function DashboardCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  subtitle,
  loading 
}: DashboardCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
          
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          ) : (
            <>
              <div className="text-2xl font-bold text-white">
                {typeof value === 'number' && title.includes('$') ? 
                  `$${value.toLocaleString()}` : 
                  value
                }
              </div>
              
              {subtitle && (
                <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
              )}
            </>
          )}
        </div>
        
        {change !== undefined && trend && !loading && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
             trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : 
             <Activity className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isExpense = transaction.amount < 0;
  
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          isExpense ? 'bg-red-500/10' : 'bg-green-500/10'
        }`}>
          {isExpense ? 
            <ArrowDownRight className="w-4 h-4 text-red-400" /> : 
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          }
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            {transaction.description}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(transaction.transactionDate).toLocaleDateString()}
            {transaction.reference && ` • ${transaction.reference}`}
          </div>
        </div>
      </div>
      <div className={`text-sm font-semibold ${
        isExpense ? 'text-red-400' : 'text-green-400'
      }`}>
        {isExpense ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
      </div>
    </div>
  );
}

export function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  
  // Mock data - replace with actual API calls
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    revenue: {
      current: 485750,
      previous: 425000,
      change: 60750,
      changePercent: 14.3,
      trend: 'up'
    },
    expenses: {
      current: 285420,
      previous: 298000,
      change: -12580,
      changePercent: -4.2,
      trend: 'down'
    },
    netIncome: {
      current: 200330,
      previous: 127000,
      change: 73330,
      changePercent: 57.8,
      trend: 'up'
    },
    cashFlow: {
      current: 156890,
      previous: 143000,
      change: 13890,
      changePercent: 9.7,
      trend: 'up'
    },
    accountsReceivable: {
      current: 89450,
      previous: 95000,
      change: -5550,
      changePercent: -5.8,
      trend: 'down'
    },
    accountsPayable: {
      current: 45230,
      previous: 52000,
      change: -6770,
      changePercent: -13.0,
      trend: 'down'
    },
    workingCapital: {
      current: 245000,
      previous: 230000,
      change: 15000,
      changePercent: 6.5,
      trend: 'up'
    },
    currentRatio: 2.1,
    quickRatio: 1.8,
    debtToEquity: 0.45
  });

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      transactionDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-15'),
      description: 'LED Fixture Purchase - Fluence SPYDR',
      reference: 'INV-2024-0156',
      amount: -12500,
      currency: 'USD',
      accountId: 'acc_001',
      status: 'posted'
    },
    {
      id: '2',
      transactionDate: new Date('2024-01-14'),
      postingDate: new Date('2024-01-14'),
      description: 'Customer Payment - Green Valley Farms',
      reference: 'PAY-2024-0089',
      amount: 35000,
      currency: 'USD',
      accountId: 'acc_002',
      status: 'posted'
    },
    {
      id: '3',
      transactionDate: new Date('2024-01-13'),
      postingDate: new Date('2024-01-13'),
      description: 'Utility Payment - Electric',
      reference: 'UTIL-2024-001',
      amount: -4850,
      currency: 'USD',
      accountId: 'acc_003',
      status: 'posted'
    },
    {
      id: '4',
      transactionDate: new Date('2024-01-12'),
      postingDate: new Date('2024-01-12'),
      description: 'Service Revenue - Lighting Design',
      reference: 'SRV-2024-0034',
      amount: 8500,
      currency: 'USD',
      accountId: 'acc_004',
      status: 'posted'
    }
  ]);

  const [activeIntegrations] = useState([
    { name: 'QuickBooks', status: 'connected', lastSync: new Date('2024-01-15T10:30:00') },
    { name: 'SAP', status: 'disconnected', lastSync: null }
  ]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
      setLastSync(new Date());
    }, 1500);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setLastSync(new Date());
    setSyncing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
            <p className="text-gray-400 mt-1">
              Monitor your financial health and integrations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastSync && (
              <div className="text-sm text-gray-400">
                Last sync: {lastSync.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg 
                transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        {/* Integration Status */}
        <div className="flex items-center gap-4">
          {activeIntegrations.map((integration) => (
            <div key={integration.name} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                integration.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-gray-400">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Revenue"
          value={formatCurrency(metrics.revenue.current)}
          change={metrics.revenue.changePercent}
          trend={metrics.revenue.trend}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="This month"
          loading={loading}
        />
        
        <DashboardCard
          title="Expenses"
          value={formatCurrency(metrics.expenses.current)}
          change={metrics.expenses.changePercent}
          trend={metrics.expenses.trend}
          icon={<CreditCard className="w-5 h-5" />}
          subtitle="This month"
          loading={loading}
        />
        
        <DashboardCard
          title="Net Income"
          value={formatCurrency(metrics.netIncome.current)}
          change={metrics.netIncome.changePercent}
          trend={metrics.netIncome.trend}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="This month"
          loading={loading}
        />
        
        <DashboardCard
          title="Cash Flow"
          value={formatCurrency(metrics.cashFlow.current)}
          change={metrics.cashFlow.changePercent}
          trend={metrics.cashFlow.trend}
          icon={<Activity className="w-5 h-5" />}
          subtitle="Operating cash flow"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <DashboardCard
          title="Accounts Receivable"
          value={formatCurrency(metrics.accountsReceivable.current)}
          change={metrics.accountsReceivable.changePercent}
          trend={metrics.accountsReceivable.trend}
          icon={<Receipt className="w-5 h-5" />}
          subtitle="Outstanding invoices"
          loading={loading}
        />
        
        <DashboardCard
          title="Accounts Payable"
          value={formatCurrency(metrics.accountsPayable.current)}
          change={metrics.accountsPayable.changePercent}
          trend={metrics.accountsPayable.trend}
          icon={<FileText className="w-5 h-5" />}
          subtitle="Pending payments"
          loading={loading}
        />
        
        <DashboardCard
          title="Working Capital"
          value={formatCurrency(metrics.workingCapital.current)}
          change={metrics.workingCapital.changePercent}
          trend={metrics.workingCapital.trend}
          icon={<Wallet className="w-5 h-5" />}
          subtitle="Available capital"
          loading={loading}
        />
      </div>

      {/* Financial Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Financial Ratios</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current Ratio</span>
              <span className="text-sm font-medium text-white">
                {metrics.currentRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Quick Ratio</span>
              <span className="text-sm font-medium text-white">
                {metrics.quickRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Debt to Equity</span>
              <span className="text-sm font-medium text-white">
                {metrics.debtToEquity.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Budget Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Revenue</span>
                <span className="text-sm text-green-400">108%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '108%', maxWidth: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Expenses</span>
                <span className="text-sm text-yellow-400">92%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Profit</span>
                <span className="text-sm text-green-400">125%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cost Centers */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Cost Centers</h3>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Operations</span>
              <span className="text-sm font-medium text-white">$125,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">R&D</span>
              <span className="text-sm font-medium text-white">$87,200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Sales & Marketing</span>
              <span className="text-sm font-medium text-white">$72,820</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View all
            </button>
          </div>
        </div>
        
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}