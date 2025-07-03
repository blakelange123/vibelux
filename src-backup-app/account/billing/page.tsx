'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  CreditCard,
  Calendar,
  Download,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Shield,
  Info,
  Edit3,
  RefreshCw,
  Clock,
  Receipt
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionDetails {
  plan: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  seats: number;
  usedSeats: number;
  monthlyPrice: number;
  features: string[];
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export default function BillingPage() {
  const { user } = useUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Mock subscription data
  const subscription: SubscriptionDetails = {
    plan: 'professional',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    seats: 5,
    usedSeats: 3,
    monthlyPrice: 99,
    features: [
      'Advanced LED Design Tools',
      'Unlimited Projects',
      'Team Collaboration',
      'Priority Support',
      'API Access'
    ]
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
      expiryMonth: 12,
      expiryYear: 2025
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv_1',
      date: new Date('2024-01-01'),
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - January 2024'
    },
    {
      id: 'inv_2',
      date: new Date('2023-12-01'),
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - December 2023'
    },
    {
      id: 'inv_3',
      date: new Date('2023-11-01'),
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - November 2023'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: 0,
      features: [
        'Basic LED Design Tools',
        '3 Active Projects',
        'Community Support',
        'Export to PDF'
      ],
      limits: {
        projects: 3,
        teamMembers: 1,
        storage: '1 GB'
      }
    },
    {
      name: 'Professional',
      price: 99,
      popular: true,
      features: [
        'Advanced LED Design Tools',
        'Unlimited Projects',
        'Team Collaboration (5 seats)',
        'Priority Support',
        'API Access',
        'Custom Integrations',
        'Advanced Analytics'
      ],
      limits: {
        projects: 'Unlimited',
        teamMembers: 5,
        storage: '100 GB'
      }
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Everything in Professional',
        'Unlimited Team Members',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Training',
        'SLA Guarantee',
        'White Label Options'
      ],
      limits: {
        projects: 'Unlimited',
        teamMembers: 'Unlimited',
        storage: 'Unlimited'
      }
    }
  ];

  const currentUsage = {
    apiCalls: {
      used: 45678,
      limit: 100000,
      resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    storage: {
      used: 23.4,
      limit: 100,
      unit: 'GB'
    },
    projects: {
      used: 27,
      limit: 'Unlimited'
    }
  };

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
    }
  };

  const handleReactivateSubscription = () => {
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/account/profile" className="hover:text-white">Account</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Billing & Subscription</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-400">Manage your subscription, payment methods, and billing history</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
              <span className={`px-3 py-1 text-sm rounded-full ${
                subscription.status === 'active' 
                  ? 'bg-green-600/20 text-green-400'
                  : subscription.status === 'past_due'
                  ? 'bg-red-600/20 text-red-400'
                  : 'bg-gray-600/20 text-gray-400'
              }`}>
                {subscription.status === 'active' ? 'Active' : 
                 subscription.status === 'past_due' ? 'Past Due' : 'Canceled'}
              </span>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white capitalize">{subscription.plan} Plan</h3>
                <p className="text-gray-400">${subscription.monthlyPrice}/month</p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Upgrade Plan
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next billing date</span>
                <span className="text-white">{subscription.currentPeriodEnd.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Team seats</span>
                <span className="text-white">{subscription.usedSeats} / {subscription.seats} used</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Included Features</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {subscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                className="mt-6 text-sm text-red-400 hover:text-red-300"
              >
                Cancel Subscription
              </button>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">Subscription ending soon</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Your subscription will end on {subscription.currentPeriodEnd.toLocaleDateString()}
                    </p>
                    <button
                      onClick={handleReactivateSubscription}
                      className="mt-2 text-sm text-green-400 hover:text-green-300"
                    >
                      Reactivate Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Method
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-400">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Payment information is securely processed by Stripe
            </p>
          </div>

          {/* Billing History */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Billing History</h2>
              <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>

            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white">{invoice.description}</p>
                      <p className="text-sm text-gray-400">
                        {invoice.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">${invoice.amount}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      invoice.status === 'paid'
                        ? 'bg-green-600/20 text-green-400'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {invoice.status}
                    </span>
                    <button className="text-gray-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Summary */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Usage</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">API Calls</span>
                  <span className="text-white">
                    {currentUsage.apiCalls.used.toLocaleString()} / {currentUsage.apiCalls.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${(currentUsage.apiCalls.used / currentUsage.apiCalls.limit) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Resets {currentUsage.apiCalls.resetDate.toLocaleDateString()}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-white">
                    {currentUsage.storage.used} / {currentUsage.storage.limit} {currentUsage.storage.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(currentUsage.storage.used / currentUsage.storage.limit) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-white">{currentUsage.projects.used}</span>
                </div>
                <p className="text-xs text-gray-500">Unlimited on your plan</p>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Company Name</p>
                <p className="text-white">Acme Farms Inc.</p>
              </div>
              <div>
                <p className="text-gray-400">Tax ID</p>
                <p className="text-white">XX-XXXXXXX</p>
              </div>
              <div>
                <p className="text-gray-400">Billing Email</p>
                <p className="text-white">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div>
                <p className="text-gray-400">Billing Address</p>
                <p className="text-white">123 Main St</p>
                <p className="text-white">San Francisco, CA 94105</p>
              </div>
            </div>

            <button className="mt-4 text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Edit Billing Info
            </button>
          </div>

          {/* Need Help */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-sm text-gray-300 mb-4">
              Contact our billing team for assistance with payments or subscriptions.
            </p>
            <Link
              href="/contact?subject=billing"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Contact Billing Support
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-gray-700 rounded-lg p-6 ${
                    plan.popular ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                      Most Popular
                    </span>
                  )}
                  
                  <h4 className="text-xl font-semibold text-white mb-2">{plan.name}</h4>
                  <div className="mb-6">
                    {typeof plan.price === 'number' ? (
                      <div>
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400">/month</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-white">Custom Pricing</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 mb-6 pt-4 border-t border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Projects</span>
                      <span className="text-white">{plan.limits.projects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Team Members</span>
                      <span className="text-white">{plan.limits.teamMembers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Storage</span>
                      <span className="text-white">{plan.limits.storage}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlan(plan.name);
                    }}
                    className={`w-full py-2 rounded-lg font-medium ${
                      plan.name === 'Enterprise'
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : subscription.plan === plan.name.toLowerCase()
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    disabled={subscription.plan === plan.name.toLowerCase()}
                  >
                    {plan.name === 'Enterprise' 
                      ? 'Contact Sales'
                      : subscription.plan === plan.name.toLowerCase()
                      ? 'Current Plan'
                      : `Upgrade to ${plan.name}`
                    }
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="mt-6 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}