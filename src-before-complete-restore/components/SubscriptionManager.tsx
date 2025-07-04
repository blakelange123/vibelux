'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';

interface SubscriptionManagerProps {
  currentPlan?: string;
  customerId?: string;
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export function SubscriptionManager({
  currentPlan = 'free',
  customerId,
  subscriptionStatus,
  cancelAtPeriodEnd,
  currentPeriodEnd
}: SubscriptionManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const plan = PRICING_PLANS[currentPlan as keyof typeof PRICING_PLANS] || PRICING_PLANS.free;

  const handleManageSubscription = async () => {
    if (!customerId) {
      router.push('/pricing');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (cancelAtPeriodEnd) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">
          <AlertCircle className="w-4 h-4" />
          Canceling at period end
        </div>
      );
    }

    switch (subscriptionStatus) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Active
          </div>
        );
      case 'past_due':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            Payment Past Due
          </div>
        );
      case 'trialing':
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Trial Active
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
        {getStatusBadge()}
      </div>

      <div className="space-y-4">
        {/* Current Plan */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Plan</p>
          <p className="text-2xl font-bold text-gray-900">{plan.name}</p>
          <p className="text-gray-600">{plan.description}</p>
        </div>

        {/* Billing */}
        {currentPlan !== 'free' && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Billing</p>
            <p className="text-lg font-semibold text-gray-900">
              ${plan.price}/{plan.interval}
            </p>
            {currentPeriodEnd && (
              <p className="text-sm text-gray-600">
                {cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                {new Date(currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Features */}
        <div>
          <p className="text-sm text-gray-500 mb-3">Features</p>
          <ul className="space-y-2">
            {plan.features.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          {currentPlan === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Upgrade Plan
            </button>
          ) : (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Manage Subscription
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Usage This Month</h3>
        <div className="space-y-3">
          <UsageBar
            label="Projects"
            current={2}
            limit={plan.limitations.projects}
          />
          <UsageBar
            label="Team Members"
            current={1}
            limit={plan.limitations.users}
          />
        </div>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  current,
  limit
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const unlimited = limit === -1;
  const percentage = unlimited ? 0 : (current / limit) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isNearLimit ? 'text-orange-600' : 'text-gray-900'}`}>
          {current} {unlimited ? '' : `/ ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isNearLimit ? 'bg-orange-500' : 'bg-purple-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}