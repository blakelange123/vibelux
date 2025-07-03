'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Brain, 
  Sparkles, 
  CreditCard, 
  Check, 
  Loader2,
  AlertCircle
} from 'lucide-react';

// Temporarily disable Stripe to fix development issues
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface QueryPackage {
  id: string;
  name: string;
  queries: number;
  price: number;
  priceId: string;
  popular?: boolean;
}

const QUERY_PACKAGES: QueryPackage[] = [
  {
    id: 'small',
    name: 'Starter Pack',
    queries: 25,
    price: 9.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_QUERIES_25_PRICE_ID || 'price_placeholder_25'
  },
  {
    id: 'medium',
    name: 'Growth Pack',
    queries: 100,
    price: 29.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_QUERIES_100_PRICE_ID || 'price_placeholder_100',
    popular: true
  },
  {
    id: 'large',
    name: 'Pro Pack',
    queries: 500,
    price: 99.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_QUERIES_500_PRICE_ID || 'price_placeholder_500'
  }
];

interface AIQueryPurchaseProps {
  currentQueries?: number;
  maxQueries?: number;
  onPurchaseComplete?: (queries: number) => void;
}

export function AIQueryPurchase({ 
  currentQueries = 0,
  maxQueries = 10,
  onPurchaseComplete 
}: AIQueryPurchaseProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    try {
      setIsLoading(packageId);
      setError(null);

      const selectedPackage = QUERY_PACKAGES.find(p => p.id === packageId);
      if (!selectedPackage) {
        throw new Error('Invalid package selected');
      }

      const response = await fetch('/api/stripe/create-query-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPackage.priceId,
          packageId: selectedPackage.id,
          queries: selectedPackage.queries
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(null);
    }
  };

  const queriesUsedPercent = (currentQueries / maxQueries) * 100;
  const isNearLimit = queriesUsedPercent > 80;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Current Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Assistant Queries
          </h3>
          <span className={`text-sm font-medium ${
            isNearLimit ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {currentQueries} / {maxQueries} used
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? 'bg-yellow-400' : 'bg-purple-400'
            }`}
            style={{ width: `${Math.min(queriesUsedPercent, 100)}%` }}
          />
        </div>
        
        {isNearLimit && (
          <p className="text-xs text-yellow-400 mt-2">
            You're running low on AI queries. Purchase more to continue using the AI Assistant.
          </p>
        )}
      </div>

      {/* Package Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Purchase Additional Queries</h4>
        
        {QUERY_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative rounded-lg border ${
              pkg.popular 
                ? 'border-purple-500 bg-purple-900/20' 
                : 'border-gray-700 bg-gray-900/50'
            } p-4`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-4">
                <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-white">{pkg.name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{pkg.queries} queries</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${pkg.price}</p>
                <p className="text-xs text-gray-400">${(pkg.price / pkg.queries).toFixed(2)}/query</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePurchase(pkg.id)}
              disabled={isLoading !== null}
              className={`mt-3 w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                pkg.popular
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isLoading === pkg.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Purchase
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm text-red-400 font-medium">Purchase Error</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">What you can do with AI queries:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2 text-gray-400">
            <Check className="w-4 h-4 text-green-400 mt-0.5" />
            <span>Get instant lighting recommendations</span>
          </li>
          <li className="flex items-start gap-2 text-gray-400">
            <Check className="w-4 h-4 text-green-400 mt-0.5" />
            <span>Optimize spectrum for specific crops</span>
          </li>
          <li className="flex items-start gap-2 text-gray-400">
            <Check className="w-4 h-4 text-green-400 mt-0.5" />
            <span>Troubleshoot growing issues</span>
          </li>
          <li className="flex items-start gap-2 text-gray-400">
            <Check className="w-4 h-4 text-green-400 mt-0.5" />
            <span>Generate custom reports</span>
          </li>
        </ul>
      </div>
    </div>
  );
}