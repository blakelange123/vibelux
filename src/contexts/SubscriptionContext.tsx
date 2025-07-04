'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface SubscriptionContextType {
  subscription: SubscriptionTier | null;
  isLoading: boolean;
  updateSubscription: (tier: SubscriptionTier) => void;
  cancelSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading subscription data
    const loadSubscription = async () => {
      try {
        // Default to free tier
        setSubscription({
          id: 'free',
          name: 'Free',
          price: 0,
          features: ['Basic features', '1 project', 'Community support']
        });
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const updateSubscription = (tier: SubscriptionTier) => {
    setSubscription(tier);
  };

  const cancelSubscription = () => {
    setSubscription({
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Basic features', '1 project', 'Community support']
    });
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, updateSubscription, cancelSubscription }}>
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