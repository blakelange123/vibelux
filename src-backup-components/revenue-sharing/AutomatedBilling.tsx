'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Calculator,
  Receipt,
  Building,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Settings,
  Shield,
  Info
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Invoice {
  id: string;
  invoiceNumber: string;
  billingPeriod: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'disputed';
  subtotal: number;
  tax: number;
  total: number;
  lineItems: InvoiceLineItem[];
  paymentMethod?: PaymentMethod;
  paidDate?: Date;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  metric: string;
  baseline: number;
  actual: number;
  savings: number;
  revenueSharePercentage: number;
  amount: number;
}

interface PaymentMethod {
  id: string;
  type: 'ach' | 'wire' | 'credit_card' | 'check';
  last4?: string;
  bankName?: string;
  isDefault: boolean;
}

interface BillingSettings {
  autoCharge: boolean;
  sendReminders: boolean;
  reminderDays: number[];
  ccEmails: string[];
  paymentTerms: number;
  minimumBillingAmount: number;
}

export function AutomatedBilling() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment' | 'settings'>('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Mock data
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-0042',
      billingPeriod: 'November 2024',
      issueDate: new Date('2024-12-01'),
      dueDate: new Date('2024-12-31'),
      status: 'sent',
      subtotal: 4690,
      tax: 422.10,
      total: 5112.10,
      lineItems: [
        {
          id: '1',
          description: 'Energy Savings Revenue Share',
          metric: 'kWh saved',
          baseline: 95000,
          actual: 78500,
          savings: 16500,
          revenueSharePercentage: 20,
          amount: 2145
        },
        {
          id: '2',
          description: 'Yield Improvement Revenue Share',
          metric: 'lbs increase',
          baseline: 3800,
          actual: 4250,
          savings: 450,
          revenueSharePercentage: 25,
          amount: 1687.50
        },
        {
          id: '3',
          description: 'Cost Reduction Revenue Share',
          metric: 'operational savings',
          baseline: 35000,
          actual: 28500,
          savings: 6500,
          revenueSharePercentage: 15,
          amount: 857.50
        }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-0041',
      billingPeriod: 'October 2024',
      issueDate: new Date('2024-11-01'),
      dueDate: new Date('2024-11-30'),
      status: 'paid',
      subtotal: 4230,
      tax: 380.70,
      total: 4610.70,
      lineItems: [],
      paymentMethod: {
        id: '1',
        type: 'ach',
        bankName: 'Chase Bank',
        last4: '4782',
        isDefault: true
      },
      paidDate: new Date('2024-11-28')
    }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'ach',
      bankName: 'Chase Bank',
      last4: '4782',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit_card',
      last4: '4242',
      isDefault: false
    }
  ]);

  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    autoCharge: true,
    sendReminders: true,
    reminderDays: [7, 3, 1],
    ccEmails: ['accounting@grower.com'],
    paymentTerms: 30,
    minimumBillingAmount: 100
  });

  // Revenue trend data
  const revenueTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue: 3500 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2000,
      projected: 4500 + i * 100
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-900/20';
      case 'sent': return 'text-blue-400 bg-blue-900/20';
      case 'viewed': return 'text-purple-400 bg-purple-900/20';
      case 'overdue': return 'text-red-400 bg-red-900/20';
      case 'disputed': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const calculateUpcomingRevenue = () => {
    return invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'viewed')
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  const calculateOverdueAmount = () => {
    return invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-500" />
            Automated Billing
          </h2>
          <p className="text-gray-400">Manage revenue sharing invoices and payments</p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          Create Manual Invoice
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'invoices', 'payment', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Billing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">This Month</p>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">$5,112</p>
              <p className="text-sm text-green-400 mt-1">+12% from last month</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Outstanding</p>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">${calculateUpcomingRevenue().toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">2 invoices pending</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Overdue</p>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">${calculateOverdueAmount()}</p>
              <p className="text-sm text-gray-500 mt-1">0 invoices</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">YTD Revenue</p>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">$48,560</p>
              <p className="text-sm text-purple-400 mt-1">On track for $58k</p>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#10B981"
                    strokeDasharray="5 5"
                    name="Projected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Recent Transactions</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">Payment Received</p>
                      <p className="text-sm text-gray-400">INV-2024-0041 • ACH Transfer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">$4,610.70</p>
                    <p className="text-sm text-gray-400">Nov 28, 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">Invoice Sent</p>
                      <p className="text-sm text-gray-400">INV-2024-0042 • November Revenue Share</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">$5,112.10</p>
                    <p className="text-sm text-gray-400">Dec 1, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Invoice List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Invoice</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Due Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-400">
                            Issued {invoice.issueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{invoice.billingPeriod}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">${invoice.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">
                          Subtotal: ${invoice.subtotal.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {invoice.dueDate.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-300">
                            <Download className="w-4 h-4" />
                          </button>
                          {invoice.status === 'sent' && (
                            <button className="text-blue-400 hover:text-blue-300">
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {method.type === 'ach' ? (
                      <Building className="w-5 h-5 text-blue-400" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-purple-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {method.type === 'ach' ? 'ACH Transfer' : 'Credit Card'}
                        {method.isDefault && (
                          <span className="ml-2 text-xs bg-green-900/20 text-green-400 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        {method.bankName || 'Visa'} ending in {method.last4}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-300">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
              Add Payment Method
            </button>
          </div>

          {/* Billing Contact */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Billing Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">accounting@grower.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">123 Main St, Portland, OR 97201</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Billing Settings */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-6">Billing Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Auto-charge on due date</p>
                    <p className="text-sm text-gray-400">Automatically charge the default payment method</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={billingSettings.autoCharge}
                    onChange={(e) => setBillingSettings({...billingSettings, autoCharge: e.target.checked})}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Send payment reminders</p>
                    <p className="text-sm text-gray-400">Email reminders before due date</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={billingSettings.sendReminders}
                    onChange={(e) => setBillingSettings({...billingSettings, sendReminders: e.target.checked})}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <p className="font-medium text-white mb-2">Payment Terms</p>
                  <select
                    value={billingSettings.paymentTerms}
                    onChange={(e) => setBillingSettings({...billingSettings, paymentTerms: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value={15}>Net 15</option>
                    <option value={30}>Net 30</option>
                    <option value={45}>Net 45</option>
                    <option value={60}>Net 60</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <p className="font-medium text-white mb-2">Minimum Billing Amount</p>
                  <p className="text-sm text-gray-400 mb-2">Don't generate invoices below this amount</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={billingSettings.minimumBillingAmount}
                      onChange={(e) => setBillingSettings({...billingSettings, minimumBillingAmount: parseFloat(e.target.value)})}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <p className="font-medium text-white mb-2">CC Email Addresses</p>
                  <p className="text-sm text-gray-400 mb-2">Additional recipients for invoices</p>
                  <input
                    type="text"
                    value={billingSettings.ccEmails.join(', ')}
                    onChange={(e) => setBillingSettings({...billingSettings, ccEmails: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </label>
              </div>
            </div>

            <button className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              Save Settings
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-1">Bank-Level Security</p>
                <p className="text-sm text-gray-300">
                  All payment information is encrypted and processed through PCI-compliant systems. 
                  We never store sensitive payment details on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-3xl w-full mx-4 border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Invoice {selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Bill To</p>
                  <p className="font-medium text-white">Acme Cannabis Co</p>
                  <p className="text-sm text-gray-300">123 Main Street</p>
                  <p className="text-sm text-gray-300">Portland, OR 97201</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Invoice Date</p>
                  <p className="font-medium text-white">{selectedInvoice.issueDate.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-400 mt-2">Due Date</p>
                  <p className="font-medium text-white">{selectedInvoice.dueDate.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border-t border-gray-800 pt-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-gray-400">
                      <th className="text-left pb-2">Description</th>
                      <th className="text-right pb-2">Savings</th>
                      <th className="text-right pb-2">Rate</th>
                      <th className="text-right pb-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-t border-gray-800">
                        <td className="py-3">
                          <p className="font-medium text-white">{item.description}</p>
                          <p className="text-sm text-gray-400">
                            {item.metric}: {item.baseline.toLocaleString()} → {item.actual.toLocaleString()}
                          </p>
                        </td>
                        <td className="text-right py-3 text-gray-300">
                          {item.savings.toLocaleString()}
                        </td>
                        <td className="text-right py-3 text-gray-300">
                          {item.revenueSharePercentage}%
                        </td>
                        <td className="text-right py-3 font-medium text-white">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-800">
                      <td colSpan={3} className="text-right py-2 text-gray-400">Subtotal</td>
                      <td className="text-right py-2 font-medium text-white">
                        ${selectedInvoice.subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-right py-2 text-gray-400">Tax (9%)</td>
                      <td className="text-right py-2 font-medium text-white">
                        ${selectedInvoice.tax.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-800">
                      <td colSpan={3} className="text-right py-2 text-lg font-semibold text-white">
                        Total Due
                      </td>
                      <td className="text-right py-2 text-lg font-bold text-white">
                        ${selectedInvoice.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                {selectedInvoice.status === 'sent' && (
                  <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}