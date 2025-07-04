'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';
import { UnifiedCustomer, UnifiedPricingManager } from '@/lib/unified-pricing';

interface SubscriptionManagerProps {
  customer: UnifiedCustomer;
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
  revenueData?: {
    monthlyRevenue: number;
    revenueSharingPayments: number;
  };
}

export function SubscriptionManager({
  customer,
  subscriptionStatus,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  revenueData
}: SubscriptionManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const features = UnifiedPricingManager.getCustomerFeatures(customer);
  const billingSummary = UnifiedPricingManager.getBillingSummary(customer, revenueData);

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
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
          <p className="text-sm text-gray-500 mb-1">
            Current {customer.paymentModel === 'subscription' ? 'Plan' : 'Model'}
          </p>
          <p className="text-2xl font-bold text-gray-900">{features.tier.name}</p>
          <p className="text-gray-600">{features.tier.description}</p>
          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {customer.paymentModel === 'subscription' ? 'Subscription' : 'Revenue Sharing'}
          </div>
        </div>

        {/* Billing */}
        {customer.effectiveFeatureLevel !== 'free' && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Billing</p>
            {billingSummary.model === 'subscription' ? (
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  ${billingSummary.monthlyAmount}/month
                </p>
                {billingSummary.annualAmount && (
                  <p className="text-sm text-green-600">
                    Save ${(billingSummary.monthlyAmount * 12) - billingSummary.annualAmount} with annual billing
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  ${billingSummary.baseAmount}/month base
                  {billingSummary.variableAmount > 0 && (
                    <span className="text-sm text-gray-600">
                      + ${billingSummary.variableAmount} performance
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Total: ${billingSummary.totalAmount} (savings: ${billingSummary.savingsGenerated})
                </p>
              </div>
            )}
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
            {features.features.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {features.features.length > 5 && (
            <p className="text-sm text-gray-500 mt-2">
              +{features.features.length - 5} more features
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          {customer.effectiveFeatureLevel === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Upgrade Plan
            </button>
          ) : (
            <div className="space-y-2">
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
                    Manage {customer.paymentModel === 'subscription' ? 'Subscription' : 'Billing'}
                  </>
                )}
              </button>
              
              {customer.paymentModel === 'subscription' && (
                <button
                  onClick={() => router.push('/pricing/revenue-sharing')}
                  className="w-full py-2 text-purple-600 hover:text-purple-700 transition-colors text-sm"
                >
                  Switch to Revenue Sharing →
                </button>
              )}
              
              {customer.paymentModel === 'revenue-sharing' && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-2 text-purple-600 hover:text-purple-700 transition-colors text-sm"
                >
                  View Subscription Plans →
                </button>
              )}
            </div>
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
            limit={features.limits.projects}
          />
          <UsageBar
            label="Team Members"
            current={1}
            limit={features.limits.teamMembers}
          />
          {features.limits.monthlySOPs && (
            <UsageBar
              label="SOPs Generated"
              current={3}
              limit={features.limits.monthlySOPs}
            />
          )}
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