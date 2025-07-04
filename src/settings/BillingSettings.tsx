'use client';

import React, { useState } from 'react';
import { CreditCard, Download, AlertCircle, Check, ChevronRight } from 'lucide-react';

interface BillingSettingsProps {
  // Add props as needed
}

export function BillingSettings({}: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real data from API
  const currentPlan = {
    name: 'Professional',
    price: 79,
    interval: 'month',
    nextBillingDate: '2024-02-15',
    seats: 3,
    seatsUsed: 2,
  };

  const billingHistory = [
    { id: 1, date: '2024-01-15', amount: 79, status: 'paid', invoice: 'INV-2024-001' },
    { id: 2, date: '2023-12-15', amount: 79, status: 'paid', invoice: 'INV-2023-012' },
    { id: 3, date: '2023-11-15', amount: 79, status: 'paid', invoice: 'INV-2023-011' },
  ];

  const paymentMethod = {
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current Plan */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Plan</p>
            <p className="text-xl font-semibold text-white">{currentPlan.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Price</p>
            <p className="text-xl font-semibold text-white">
              ${currentPlan.price}/{currentPlan.interval}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Team Seats</p>
            <p className="text-white">
              {currentPlan.seatsUsed} of {currentPlan.seats} used
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Next Billing Date</p>
            <p className="text-white">
              {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Upgrade Plan
          </button>
          <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors">
            Add Seats
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-white font-medium">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </p>
              <p className="text-sm text-gray-400">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
            </div>
          </div>
          <button className="text-purple-400 hover:text-purple-300 text-sm">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
        <div className="space-y-2">
          {billingHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white">
                    ${item.amount} - {new Date(item.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400">{item.invoice}</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm">
                <Download className="w-4 h-4" />
                Invoice
              </button>
            </div>
          ))}
        </div>
        <button className="mt-4 text-purple-400 hover:text-purple-300 text-sm">
          View all invoices →
        </button>
      </div>

      {/* Billing Information */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400 mb-1">Company Name</p>
            <p className="text-white">Acme Cultivation Co.</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Billing Email</p>
            <p className="text-white">billing@acmecultivation.com</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Billing Address</p>
            <p className="text-white">123 Main Street<br />Denver, CO 80202</p>
          </div>
        </div>
        <button className="mt-4 text-purple-400 hover:text-purple-300 text-sm">
          Update billing information
        </button>
      </div>

      {/* Usage & Limits */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usage & Limits</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Projects</span>
              <span className="text-white">45 / 100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">API Calls</span>
              <span className="text-white">750 / 1,000</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">AI Credits</span>
              <span className="text-white">82 / 100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription */}
      <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50">
        <h3 className="text-lg font-semibold text-white mb-2">Cancel Subscription</h3>
        <p className="text-sm text-gray-400 mb-4">
          We'd hate to see you go. Your subscription will remain active until the end of your billing period.
        </p>
        <button className="text-red-400 hover:text-red-300 text-sm">
          Cancel subscription
        </button>
      </div>
    </div>
  );
}