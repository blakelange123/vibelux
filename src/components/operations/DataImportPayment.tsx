'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Brain,
  Check,
  Lock,
  Info,
  Loader2
} from 'lucide-react';

interface DataImportPaymentProps {
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export function DataImportPayment({ onPaymentSuccess, onCancel }: DataImportPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'subscription'>('card');

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // In production, this would integrate with Stripe or your payment processor
      // Example Stripe integration:
      /*
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 999, // $9.99 in cents
          product: 'data-import',
          description: 'AI-Powered Historical Data Import'
        }),
      });
      
      const { clientSecret } = await response.json();
      
      // Use Stripe Elements to complete payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      */
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On success, enable the import feature
      onPaymentSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Unlock AI-Powered Data Import
        </h3>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Intelligent Field Recognition
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI understands any data format or naming convention
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Automatic Unit Conversion
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Handles mixed units, different formats, and messy data
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Instant Historical Insights
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Discover patterns and optimizations from your past data
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="space-y-3 mb-6">
          <label className="block">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="sr-only"
            />
            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              paymentMethod === 'card'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    One-Time Import
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Import your historical data once
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  $9.99
                </p>
              </div>
            </div>
          </label>

          <label className="block">
            <input
              type="radio"
              name="payment"
              value="subscription"
              checked={paymentMethod === 'subscription'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="sr-only"
            />
            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              paymentMethod === 'subscription'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Pro Plan Upgrade
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Unlimited imports + all features
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    $99/mo
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Save $20/mo
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
          <Lock className="w-4 h-4" />
          <span>Secure payment processing by Stripe</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                {paymentMethod === 'card' ? 'Pay $9.99' : 'Upgrade to Pro'}
              </>
            )}
          </button>
        </div>

        {/* Data Privacy Note */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Your data is processed securely using Vibelux's AI infrastructure. 
              We never store or share your cultivation data. Only anonymized patterns 
              are used to improve our algorithms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}