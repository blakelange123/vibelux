'use client';

import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ModuleType, 
  ADD_ON_MODULES, 
  SUBSCRIPTION_TIERS,
  UserSubscription 
} from '@/lib/subscription-modules';
import { 
  Check, 
  Lock, 
  Plus, 
  Sparkles,
  Info,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionModulesPage() {
  const { subscription, isLoading } = useSubscription();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-96" />;
  }
  
  const userSubscription = new UserSubscription(
    subscription?.plan || 'starter',
    subscription?.addOns || [],
    subscription?.bundleId
  );
  
  const currentTier = SUBSCRIPTION_TIERS[subscription?.plan || 'starter'];
  const availableFeatures = userSubscription.getAvailableFeatures();
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription & Modules</h1>
        <p className="text-gray-400">Manage your plan and add-on modules</p>
      </div>
      
      {/* Current Plan Summary */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">{currentTier.name} Plan</h2>
            <p className="text-gray-400">
              ${userSubscription.getTotalCost()}/month
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Change Plan
          </Link>
        </div>
        
        {/* Usage Limits */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Users</p>
            <p className="text-lg font-semibold">
              {currentTier.limits.users === -1 ? 'Unlimited' : currentTier.limits.users}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Facility Size</p>
            <p className="text-lg font-semibold">
              {currentTier.limits.sqft === -1 ? 'Unlimited' : `${currentTier.limits.sqft.toLocaleString()} sqft`}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">API Calls</p>
            <p className="text-lg font-semibold">
              {currentTier.limits.apiCalls === -1 ? 'Unlimited' : `${currentTier.limits.apiCalls.toLocaleString()}/mo`}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Projects</p>
            <p className="text-lg font-semibold">
              {currentTier.limits.projects === -1 ? 'Unlimited' : currentTier.limits.projects}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Exports</p>
            <p className="text-lg font-semibold">
              {currentTier.limits.exports === -1 ? 'Unlimited' : `${currentTier.limits.exports}/mo`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Included Modules */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Included in Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableFeatures.modules.map((moduleType) => (
            <div key={moduleType} className="bg-gray-800 rounded-lg p-4 border border-green-600/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">
                  {moduleType.replace(/_/g, ' ')}
                </h4>
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-gray-400">
                Included in {currentTier.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Active Add-ons */}
      {availableFeatures.addOns.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Active Add-on Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFeatures.addOns.map((moduleType) => {
              const module = ADD_ON_MODULES[moduleType];
              return (
                <div key={moduleType} className="bg-gray-800 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{module.name}</h4>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                  <p className="text-sm font-medium">${module.price}/month</p>
                  <button className="mt-3 text-sm text-red-400 hover:text-red-300">
                    Remove Module
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Available Add-ons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Add-on Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(ADD_ON_MODULES).map((module) => {
            const hasModule = availableFeatures.addOns.includes(module.id);
            const canAdd = userSubscription.canAddModule(module.id);
            
            if (hasModule) return null; // Already have it
            
            return (
              <div 
                key={module.id} 
                className={`bg-gray-800 rounded-lg p-4 ${
                  canAdd ? 'hover:bg-gray-750 cursor-pointer' : 'opacity-50'
                }`}
                onClick={() => canAdd && setSelectedModule(module.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{module.name}</h4>
                  {canAdd ? (
                    <Plus className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">{module.description}</p>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">${module.price}/month</p>
                  {module.requiresTier && !canAdd && (
                    <p className="text-xs text-red-400">
                      Requires {module.requiresTier} tier or higher
                    </p>
                  )}
                </div>
                <ul className="mt-3 space-y-1">
                  {module.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {canAdd && (
                  <button className="mt-4 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors">
                    Add Module
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Module Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Add {ADD_ON_MODULES[selectedModule].name}
            </h3>
            <p className="text-gray-400 mb-4">
              This will add ${ADD_ON_MODULES[selectedModule].price}/month to your subscription.
            </p>
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Current subscription</span>
                <span>${userSubscription.getTotalCost()}/mo</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>{ADD_ON_MODULES[selectedModule].name}</span>
                <span>+${ADD_ON_MODULES[selectedModule].price}/mo</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>New total</span>
                  <span>
                    ${userSubscription.getTotalCost() + ADD_ON_MODULES[selectedModule].price}/mo
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}