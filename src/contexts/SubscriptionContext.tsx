'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PRICING_PLANS, hasFeatureAccess } from '@/lib/stripe';

interface SubscriptionContextType {
  subscription: {
    tier: string;
    status: string;
    features: string[];
  };
  checkFeatureAccess: (feature: string) => boolean;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    tier: 'free',
    status: 'active',
    features: PRICING_PLANS.free.features,
    limits: {},
    usage: {}
  });

  useEffect(() => {
    if (isLoaded && user) {
      loadSubscription();
    } else if (isLoaded && !user) {
      // Set default free plan for non-authenticated users
      setSubscription({
        tier: 'free',
        status: 'active',
        features: PRICING_PLANS.free.features,
        limits: {},
        usage: {}
      });
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  const loadSubscription = async () => {
    setIsLoading(true);
    try {
      // Fetch subscription data from API
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        
        const plan = PRICING_PLANS[data.plan as keyof typeof PRICING_PLANS] || PRICING_PLANS.free;
        
        setSubscription({
          tier: data.plan || 'free',
          status: data.status || 'active',
          features: plan.features,
          limits: data.limits || {},
          usage: data.usage || {}
        });
      } else {
        // Default to free plan on error
        setSubscription({
          tier: 'free',
          status: 'active',
          features: PRICING_PLANS.free.features,
          limits: {},
          usage: {}
        });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription({
        tier: 'free',
        status: 'active',
        features: PRICING_PLANS.free.features,
        limits: {},
        usage: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkFeatureAccess = (feature: string): boolean => {
    return hasFeatureAccess(subscription.tier, feature);
  };

  const checkUsageLimit = (feature: string): { allowed: boolean; remaining: number } => {
    const limit = subscription.limits[feature];
    const used = subscription.usage[feature] || 0;
    
    if (!limit || limit === -1) {
      return { allowed: true, remaining: -1 }; // Unlimited
    }
    
    const remaining = limit - used;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  };

  const refreshSubscription = async () => {
    await loadSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        checkFeatureAccess,
        isLoading
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}