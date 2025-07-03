'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShoppingCart, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { ModuleType, checkFeatureAccess, UserSubscription } from '@/lib/subscription-modules';

interface MarketplaceGateProps {
  children: React.ReactNode;
  feature?: 'view' | 'create' | 'analytics' | 'buyers';
  fallback?: 'hide' | 'blur' | 'upgrade';
}

function MarketplaceGate({ 
  children, 
  feature = 'view',
  fallback = 'upgrade' 
}: MarketplaceGateProps) {
  // In a real app, get user subscription from context or API
  // For now, mock the user subscription
  const mockUserSubscription = new UserSubscription('starter', [ModuleType.MARKETPLACE]); // Change to test different tiers
  
  const access = checkFeatureAccess(mockUserSubscription, ModuleType.MARKETPLACE);
  
  // If user has marketplace access, check specific feature
  if (access.hasAccess) {
    // Additional feature-level checks could go here
    if (feature === 'analytics' || feature === 'buyers') {
      // These might require a higher tier within marketplace
      const hasAdvancedFeatures = mockUserSubscription.hasFeature(ModuleType.MARKETPLACE, `${feature}_dashboard`);
      if (!hasAdvancedFeatures && fallback !== 'hide') {
        return <UpgradePrompt feature={feature} />;
      }
    }
    return <>{children}</>;
  }

  // Handle different fallback strategies
  switch (fallback) {
    case 'hide':
      return null;
      
    case 'blur':
      return (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none">
            {children}
          </div>
          <MarketplaceUpgradeOverlay />
        </div>
      );
      
    case 'upgrade':
    default:
      return <MarketplaceUpgradePage />;
  }
}

function MarketplaceUpgradeOverlay() {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md text-center">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Marketplace Access Required
        </h3>
        <p className="text-gray-400 mb-6">
          Upgrade to access the CEA Marketplace and connect with buyers and sellers directly.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          View Pricing Plans
        </Link>
      </div>
    </div>
  );
}

function MarketplaceUpgradePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <ShoppingCart className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            CEA Marketplace
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect directly with growers and buyers. Sell your fresh produce or source 
            locally-grown ingredients for your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">For Growers</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <Package className="w-5 h-5 text-green-400 mt-0.5" />
                <span>List unlimited products with photos and certifications</span>
              </li>
              <li className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-400 mt-0.5" />
                <span>Set bulk pricing and manage recurring orders</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <span>Analytics dashboard to track sales and inventory</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-400 mt-0.5" />
                <span>Build relationships with repeat buyers</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">For Buyers</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-400 mt-0.5" />
                <span>Browse fresh produce from local CEA growers</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                <span>Filter by certifications, location, and price</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                <span>Connect directly with growers</span>
              </li>
              <li className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-400 mt-0.5" />
                <span>Schedule recurring deliveries</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-8 border border-green-600/30 text-center">
          <div className="bg-green-900/30 rounded-lg p-4 mb-4 border border-green-600/50">
            <p className="text-lg font-semibold text-green-400">🎉 First 100 Growers Join FREE!</p>
            <p className="text-sm text-gray-300 mt-1">Be part of building the CEA marketplace from the ground up</p>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            CEA Marketplace Access
          </h3>
          <p className="text-gray-400 mb-6">
            FREE for first 100 growers, then $29/month + 5% transaction fee
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              View Pricing Plans
            </Link>
            <Link
              href="/marketplace/demo"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpgradePrompt({ feature }: { feature: string }) {
  const featureNames: Record<string, string> = {
    analytics: 'Analytics Dashboard',
    buyers: 'Buyer Network Management',
    create: 'Create Listings',
    view: 'View Marketplace'
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md text-center">
        <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {featureNames[feature]} Requires Higher Tier
        </h3>
        <p className="text-gray-400 mb-6">
          This advanced marketplace feature requires the Professional tier or higher.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}

// Export the component
export { MarketplaceGate };
export default MarketplaceGate;

// Hook for checking marketplace access in components
export function useMarketplaceAccess() {
  const mockUserSubscription = new UserSubscription('starter', [ModuleType.MARKETPLACE]);
  const access = checkFeatureAccess(mockUserSubscription, ModuleType.MARKETPLACE);
  
  return {
    hasAccess: access.hasAccess,
    canViewListings: access.hasAccess,
    canCreateListings: access.hasAccess && mockUserSubscription.hasFeature(ModuleType.MARKETPLACE, 'create_listings'),
    canAccessAnalytics: access.hasAccess && mockUserSubscription.hasFeature(ModuleType.MARKETPLACE, 'analytics_dashboard'),
    canAccessBuyerNetwork: access.hasAccess && mockUserSubscription.hasFeature(ModuleType.MARKETPLACE, 'buyer_network'),
    subscription: mockUserSubscription
  };
}