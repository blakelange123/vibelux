'use client';

import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  soft?: boolean; // Show feature but disabled
  showUpgradePrompt?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  soft = false,
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { checkFeatureAccess, plan } = useSubscription();
  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (soft) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        {showUpgradePrompt && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-2">Premium Feature</p>
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to unlock
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
      <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-white mb-2">
        Premium Feature Required
      </h3>
      <p className="text-gray-400 mb-4">
        Upgrade your plan to access this feature
      </p>
      <Link 
        href="/pricing" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
      >
        <Sparkles className="w-5 h-5" />
        View Plans
      </Link>
    </div>
  );
}

// Usage limit component
interface UsageLimitGateProps {
  feature: string;
  children: React.ReactNode;
  onLimitReached?: () => void;
}

export function UsageLimitGate({ feature, children, onLimitReached }: UsageLimitGateProps) {
  const { checkUsageLimit } = useSubscription();
  const { allowed, remaining } = checkUsageLimit(feature);

  if (!allowed) {
    if (onLimitReached) {
      onLimitReached();
    }
    
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 text-center">
        <p className="text-yellow-300 font-medium mb-2">
          Usage Limit Reached
        </p>
        <p className="text-gray-400 text-sm mb-3">
          You've reached your monthly limit for {feature}
        </p>
        <Link 
          href="/pricing" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
        >
          Upgrade for more
        </Link>
      </div>
    );
  }

  // Show warning when approaching limit
  if (remaining > 0 && remaining <= 5) {
    return (
      <>
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3 mb-4">
          <p className="text-yellow-300 text-sm">
            {remaining} {feature} remaining this month
          </p>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}