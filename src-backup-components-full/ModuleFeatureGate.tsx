'use client';

import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ModuleType, checkFeatureAccess, UserSubscription } from '@/lib/subscription-modules';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ModuleFeatureGateProps {
  module: ModuleType;
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  soft?: boolean; // Show content but with overlay
  customMessage?: string;
  showUpgradeButton?: boolean;
}

export function ModuleFeatureGate({
  module,
  feature,
  children,
  fallback,
  soft = false,
  customMessage,
  showUpgradeButton = true
}: ModuleFeatureGateProps) {
  const { subscription, isLoading } = useSubscription();
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-32" />;
  }
  
  // Create UserSubscription instance from context data
  const userSubscription = new UserSubscription(
    subscription?.plan || 'free',
    subscription?.addOns || [],
    subscription?.bundleId
  );
  
  const access = checkFeatureAccess(userSubscription, module, feature);
  
  if (access.hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (soft) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 max-w-md">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-400 mb-4">
              {customMessage || access.reason}
            </p>
            {showUpgradeButton && (
              <div className="flex gap-3 justify-center">
                {access.upgradeOptions?.includes('add-on') && (
                  <Link
                    href="/settings/subscription/add-ons"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Add Module
                  </Link>
                )}
                {access.upgradeOptions?.includes('upgrade') && (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Hard gate - don't show content at all
  return (
    <div className="bg-gray-800 rounded-lg p-8 text-center">
      <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Feature Not Available</h3>
      <p className="text-gray-400 mb-4">
        {customMessage || access.reason}
      </p>
      {showUpgradeButton && (
        <div className="flex gap-3 justify-center">
          {access.upgradeOptions?.includes('add-on') && (
            <Link
              href="/settings/subscription/add-ons"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Add Module
            </Link>
          )}
          {access.upgradeOptions?.includes('upgrade') && (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Upgrade Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for programmatic access checking
export function useModuleAccess(module: ModuleType, feature?: string) {
  const { subscription, isLoading } = useSubscription();
  
  if (isLoading) {
    return { hasAccess: false, isLoading: true };
  }
  
  const userSubscription = new UserSubscription(
    subscription?.plan || 'free',
    subscription?.addOns || [],
    subscription?.bundleId
  );
  
  const access = checkFeatureAccess(userSubscription, module, feature);
  
  return {
    hasAccess: access.hasAccess,
    reason: access.reason,
    upgradeOptions: access.upgradeOptions,
    isLoading: false
  };
}

// Usage limit component
export function UsageLimitDisplay({ 
  limitType, 
  current, 
  max,
  showBar = true 
}: { 
  limitType: string;
  current: number;
  max: number;
  showBar?: boolean;
}) {
  const percentage = max === -1 ? 0 : (current / max) * 100;
  const isUnlimited = max === -1;
  const isNearLimit = percentage > 80;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 capitalize">{limitType}</span>
        <span className={isNearLimit ? 'text-yellow-400' : 'text-gray-300'}>
          {isUnlimited ? 'Unlimited' : `${current} / ${max}`}
        </span>
      </div>
      {showBar && !isUnlimited && (
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isNearLimit ? 'bg-yellow-400' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}