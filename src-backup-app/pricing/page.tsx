'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, X, Sparkles, Home, Flower2, Briefcase, Zap, Microscope, 
  Building, Rocket, Globe, Crown, Users, GraduationCap, Beaker, 
  Shield, Wrench, ChevronDown, ChevronUp, ArrowRight, Info,
  Star, TrendingUp, Award, Percent, ShoppingCart, Brain, Camera, Network, Layers, CircuitBoard
} from 'lucide-react';
import { SAFE_SUBSCRIPTION_TIERS, SAFE_FEATURE_CATEGORIES } from '@/lib/subscription-tiers-safe';
import PricingNavigation from '@/components/PricingNavigation';

const iconMap: { [key: string]: any } = {
  Sparkles, Home, Flower2, Briefcase, Zap, Microscope,
  Building, Rocket, Globe, Crown, Users, GraduationCap,
  Beaker, Shield, Wrench
};

// Color mapping for Tailwind classes (must be static strings)
const colorClasses: { [key: string]: { gradient: string; icon: string; badge: string } } = {
  gray: { gradient: 'from-gray-600 to-gray-700', icon: 'bg-gray-600/10 text-gray-400', badge: 'bg-gray-600/20 text-gray-300' },
  green: { gradient: 'from-green-600 to-emerald-600', icon: 'bg-green-600/10 text-green-400', badge: 'bg-green-600/20 text-green-300' },
  blue: { gradient: 'from-blue-600 to-cyan-600', icon: 'bg-blue-600/10 text-blue-400', badge: 'bg-blue-600/20 text-blue-300' },
  purple: { gradient: 'from-purple-600 to-pink-600', icon: 'bg-purple-600/10 text-purple-400', badge: 'bg-purple-600/20 text-purple-300' },
  indigo: { gradient: 'from-indigo-600 to-blue-600', icon: 'bg-indigo-600/10 text-indigo-400', badge: 'bg-indigo-600/20 text-indigo-300' },
  orange: { gradient: 'from-orange-600 to-red-600', icon: 'bg-orange-600/10 text-orange-400', badge: 'bg-orange-600/20 text-orange-300' },
  red: { gradient: 'from-red-600 to-rose-600', icon: 'bg-red-600/10 text-red-400', badge: 'bg-red-600/20 text-red-300' },
  pink: { gradient: 'from-pink-600 to-rose-600', icon: 'bg-pink-600/10 text-pink-400', badge: 'bg-pink-600/20 text-pink-300' },
  yellow: { gradient: 'from-yellow-600 to-orange-600', icon: 'bg-yellow-600/10 text-yellow-400', badge: 'bg-yellow-600/20 text-yellow-300' },
  emerald: { gradient: 'from-emerald-600 to-green-600', icon: 'bg-emerald-600/10 text-emerald-400', badge: 'bg-emerald-600/20 text-emerald-300' },
  teal: { gradient: 'from-teal-600 to-cyan-600', icon: 'bg-teal-600/10 text-teal-400', badge: 'bg-teal-600/20 text-teal-300' },
  cyan: { gradient: 'from-cyan-600 to-blue-600', icon: 'bg-cyan-600/10 text-cyan-400', badge: 'bg-cyan-600/20 text-cyan-300' },
  violet: { gradient: 'from-violet-600 to-purple-600', icon: 'bg-violet-600/10 text-violet-400', badge: 'bg-violet-600/20 text-violet-300' },
  slate: { gradient: 'from-slate-600 to-gray-600', icon: 'bg-slate-600/10 text-slate-400', badge: 'bg-slate-600/20 text-slate-300' },
  rose: { gradient: 'from-rose-600 to-pink-600', icon: 'bg-rose-600/10 text-rose-400', badge: 'bg-rose-600/20 text-rose-300' }
};

export default function PricingV2Page() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedTiers, setExpandedTiers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'enterprise' | 'specialized'>('all');
  const [showComparison, setShowComparison] = useState(false);

  // Filter tiers by category
  const getFilteredTiers = () => {
    // Use safe tiers only - no patent risks
    return SAFE_SUBSCRIPTION_TIERS;
  };

  const toggleTierExpansion = (tierId: string) => {
    setExpandedTiers(prev => 
      prev.includes(tierId) 
        ? prev.filter(id => id !== tierId)
        : [...prev, tierId]
    );
  };

  const calculateSavings = (tier: typeof SAFE_SUBSCRIPTION_TIERS[0]) => {
    if (!tier.priceAnnual || tier.price === 0) return 0;
    const monthlyTotal = tier.price * 12;
    return monthlyTotal - tier.priceAnnual;
  };

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName] || Sparkles;
    return Icon;
  };

  const formatPrice = (price: number) => {
    if (price === -1) return 'Custom';
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <PricingNavigation />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                CEA as a Service + AI Intelligence - Flexible Pricing Options
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose how you want to access VibeLux - from traditional subscriptions to 
              performance-based partnerships with AI-powered analytics included.
            </p>

            {/* Investment Platform CTA */}
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-600/30 max-w-2xl mx-auto mb-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Investment Partnership Program
                  </h3>
                  <p className="text-sm text-gray-400">
                    Connect with verified investors for equipment and growth capital
                  </p>
                </div>
                <Link
                  href="/investment"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Platform Access CTA */}
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-600/30 max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Traditional SaaS Platform
                  </h3>
                  <p className="text-sm text-gray-400">
                    Full platform access with predictable monthly pricing
                  </p>
                </div>
                <Link
                  href="#platform-tiers"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  View Plans →
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">$0</div>
                <div className="text-sm text-gray-400">Upfront Cost</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-gray-400">Expert Support</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-gray-400">Performance Based</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-400">AI Crop Database</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle & Filters */}
      <section className="sticky top-20 z-40 bg-black/90 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Billing Period Toggle */}
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-1 rounded-full inline-flex backdrop-blur border border-white/10">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'monthly' 
                      ? 'bg-white text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'annual' 
                      ? 'bg-white text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Annual
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 backdrop-blur">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10">
              {[
                { id: 'all', label: 'All Plans', count: 15 },
                { id: 'business', label: 'Business', count: 6 },
                { id: 'enterprise', label: 'Enterprise', count: 4 },
                { id: 'specialized', label: 'Specialized', count: 5 }
              ].map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                  <span className={`ml-1.5 text-xs ${
                    selectedCategory === cat.id ? 'text-gray-700' : 'text-gray-500'
                  }`}>({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Comparison Toggle */}
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              {showComparison ? 'Hide' : 'Show'} Feature Comparison
            </button>
          </div>
        </div>
      </section>

      {/* Three Pricing Paths */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Three Ways to Access VibeLux
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the model that best fits your needs and growth stage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Investment Partnership */}
            <div className="relative bg-gradient-to-b from-purple-900/20 to-purple-900/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-600/30 hover:border-purple-600/50 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                RECOMMENDED
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400">
                  <Network className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">CEA as a Service</h3>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Everything you need to grow successfully - equipment, AI-powered software, and 24/7 support. Pay only based on your actual performance improvements.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>No upfront equipment costs</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Transparent agreements</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Performance-based payouts</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Keep 100% equity</span>
                </li>
              </ul>

              <div className="mb-6">
                <div className="text-2xl font-semibold text-white">Platform Fee: 2.5%</div>
                <p className="text-sm text-gray-400">of successful partnerships</p>
              </div>

              <Link
                href="/get-started"
                className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium text-center transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Traditional SaaS */}
            <div className="relative bg-gradient-to-b from-blue-900/20 to-blue-900/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-600/30 hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Platform Access</h3>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Core platform subscription with modular add-ons. Choose exactly what you need with predictable pricing and no revenue sharing.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Core platform features</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Optional add-on modules</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Visual Operations: $39-$99/month</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Employee Tracking: +$29/user</span>
                </li>
              </ul>

              <div className="mb-6">
                <div className="text-2xl font-semibold text-white">From $199/month</div>
                <p className="text-sm text-gray-400">Core platform + add-ons</p>
              </div>

              <Link
                href="#platform-tiers"
                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-center transition-all"
              >
                View Plans
              </Link>
            </div>

            {/* Hybrid Model */}
            <div className="relative bg-gradient-to-b from-green-900/20 to-green-900/10 backdrop-blur-xl rounded-3xl p-8 border border-green-600/30 hover:border-green-600/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-green-600/20 text-green-400">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Hybrid Model</h3>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Combine platform access with equipment partnerships. Get the best of both worlds with reduced fees and flexible financing.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Reduced platform fees</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Partial equipment funding</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Flexible terms</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom agreements</span>
                </li>
              </ul>

              <div className="mb-6">
                <div className="text-2xl font-semibold text-white">Custom Pricing</div>
                <p className="text-sm text-gray-400">Based on your needs</p>
              </div>

              <Link
                href="/contact?interest=hybrid"
                className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-center transition-all"
              >
                Get Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Cards Grid */}
      <section className="py-16" id="platform-tiers">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getFilteredTiers().map(tier => {
              const Icon = getIconComponent(tier.icon);
              const isExpanded = expandedTiers.includes(tier.id);
              const savings = calculateSavings(tier);
              const displayPrice = billingPeriod === 'annual' && tier.priceAnnual 
                ? Math.round(tier.priceAnnual / 12)
                : tier.price;

              return (
                <div
                  key={tier.id}
                  className={`relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden border border-white/10 hover:border-white/20
                    ${tier.highlighted ? 'ring-2 ring-white/50 transform scale-105 bg-white/10' : ''}
                    ${tier.newTier ? 'ring-2 ring-green-500/50' : ''}
                  `}
                >
                  {/* Popular/New Badge */}
                  {tier.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                      <Star className="w-3 h-3 inline mr-1" />
                      POPULAR
                    </div>
                  )}
                  {tier.newTier && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                      NEW
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${colorClasses[tier.color]?.icon || 'bg-gray-600/10 text-gray-400'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                          <p className="text-sm text-gray-400">{tier.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-semibold text-white tracking-tight">
                          {formatPrice(displayPrice)}
                        </span>
                        {tier.price > 0 && (
                          <span className="text-gray-400">
                            /{billingPeriod === 'annual' ? 'mo' : 'month'}
                          </span>
                        )}
                      </div>
                      {billingPeriod === 'annual' && savings > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save ${savings}/year
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                      {tier.description}
                    </p>

                    {/* Target Audience */}
                    <div className="text-xs text-gray-500 mb-6 font-medium">
                      Ideal for: {tier.targetAudience}
                    </div>

                    {/* Key Limits */}
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-white/5 rounded-2xl text-xs backdrop-blur">
                      <div>
                        <span className="text-gray-500 uppercase text-[10px] tracking-wider">Projects</span>
                        <span className="block font-semibold text-white text-sm mt-0.5">
                          {tier.limits.projects === -1 ? 'Unlimited' : tier.limits.projects}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase text-[10px] tracking-wider">Team</span>
                        <span className="block font-semibold text-white text-sm mt-0.5">
                          {tier.limits.teamMembers === -1 ? 'Unlimited' : tier.limits.teamMembers}
                        </span>
                      </div>
                      {tier.limits.monthlySOPs !== undefined && (
                        <div>
                          <span className="text-gray-500 uppercase text-[10px] tracking-wider">SOPs</span>
                          <span className="block font-semibold text-white text-sm mt-0.5">
                            {tier.limits.monthlySOPs === -1 ? 'Unlimited' : `${tier.limits.monthlySOPs}/mo`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {tier.features.slice(0, isExpanded ? undefined : 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                      {!isExpanded && tier.features.length > 5 && (
                        <button
                          onClick={() => toggleTierExpansion(tier.id)}
                          className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 mt-3 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-full transition-all"
                        >
                          +{tier.features.length - 5} more features
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded && tier.features.length > 5 && (
                        <button
                          onClick={() => toggleTierExpansion(tier.id)}
                          className="text-sm text-gray-400 hover:text-gray-300 font-medium flex items-center gap-1 mt-3"
                        >
                          Show less
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={tier.price === -1 ? '/contact' : '/sign-up'}
                      className={`block w-full py-3 px-4 rounded-full font-medium text-center transition-all
                        ${tier.highlighted 
                          ? 'bg-gradient-to-r from-white to-gray-100 text-black hover:shadow-lg' 
                          : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur'
                        }
                      `}
                    >
                      {tier.price === -1 ? 'Contact Sales' : tier.price === 0 ? 'Start Free' : 'Start Trial'}
                    </Link>

                    {/* Support Level */}
                    <p className="text-xs text-center text-gray-400 mt-3">
                      {tier.limits.supportLevel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Platform Benefits */}
      <section className="py-16 bg-gradient-to-br from-purple-900/10 to-indigo-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-600/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Choose the Investment Platform?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Revolutionary blockchain technology creates transparent, fair partnerships
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-2xl mb-3">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Smart Contracts</h3>
                <p className="text-sm text-gray-400">Automated, trustless execution</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-3">
                  <CircuitBoard className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">IoT Verification</h3>
                <p className="text-sm text-gray-400">Real performance data</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-2xl mb-3">
                  <Brain className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">AI Predictions</h3>
                <p className="text-sm text-gray-400">ROI optimization</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600/20 rounded-2xl mb-3">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Fair Returns</h3>
                <p className="text-sm text-gray-400">Performance-based</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                href="/investment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Explore Investment Platform
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      {showComparison && (
        <section className="py-16 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Detailed Feature Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-gray-900 rounded-lg shadow-xl border border-gray-700">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800">
                    <th className="text-left p-4 font-semibold text-white">Feature Category</th>
                    {getFilteredTiers().slice(0, 6).map(tier => (
                      <th key={tier.id} className="text-center p-4 min-w-[120px]">
                        <div className="font-semibold text-white">{tier.name}</div>
                        <div className="text-sm text-gray-400">
                          {formatPrice(tier.price)}
                          {tier.price > 0 && '/mo'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SAFE_FEATURE_CATEGORIES).flatMap(([category, features]) => [
                    <tr key={`category-${category}`} className="bg-gray-800">
                      <td colSpan={7} className="p-3 font-semibold text-gray-300">
                        {category}
                      </td>
                    </tr>,
                    ...features.map(feature => (
                      <tr key={`${category}-${feature}`} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="p-3 text-sm text-gray-300">{feature}</td>
                        {getFilteredTiers().slice(0, 6).map(tier => (
                          <td key={tier.id} className="text-center p-3">
                            {tier.features.some(f => f.includes(feature)) ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ])}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View all 150+ features in detail
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Add-On Modules Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enhance Your Experience with Add-On Modules
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Expand your VibeLux capabilities with specialized modules designed for specific needs
            </p>
          </div>

          {/* Visual Operations Intelligence Tiers */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Visual Operations Intelligence Tiers</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Essential Visual */}
              <div className="relative bg-gradient-to-b from-gray-900/20 to-gray-900/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-600/30 hover:border-gray-600/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gray-600/20 text-gray-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Essential Visual</h4>
                    <p className="text-sm text-gray-400">Basic photo reporting</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-gray-500" />
                    <span>Basic photo reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-gray-500" />
                    <span>Manual issue categorization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-gray-500" />
                    <span>Standard alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-gray-500" />
                    <span>30-day photo retention</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-semibold text-white">$39</div>
                  <p className="text-sm text-gray-400">per month per facility</p>
                </div>

                <Link
                  href="/contact?tier=essential"
                  className="block w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-medium text-center transition-all text-sm"
                >
                  Get Started
                </Link>
              </div>

              {/* Professional Visual */}
              <div className="relative bg-gradient-to-b from-blue-900/20 to-blue-900/10 backdrop-blur-xl rounded-3xl p-6 border border-blue-600/30 hover:border-blue-600/50 transition-all duration-300">
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  POPULAR
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Professional Visual</h4>
                    <p className="text-sm text-gray-400">AI-powered analysis</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>AI-powered analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>Automated work orders</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>Predictive insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>90-day retention</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-500" />
                    <span>Maintenance system integration</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-semibold text-white">$69</div>
                  <p className="text-sm text-blue-400">per month per facility</p>
                </div>

                <Link
                  href="/contact?tier=professional"
                  className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-center transition-all text-sm"
                >
                  Get Started
                </Link>
              </div>

              {/* Enterprise Visual Intelligence */}
              <div className="relative bg-gradient-to-b from-purple-900/20 to-purple-900/10 backdrop-blur-xl rounded-3xl p-6 border border-purple-600/30 hover:border-purple-600/50 transition-all duration-300">
                <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  PREMIUM
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Enterprise Intelligence</h4>
                    <p className="text-sm text-gray-400">Advanced AI diagnostics</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>Advanced AI diagnostics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>Real-time compliance monitoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>Custom analytics dashboards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>Unlimited retention</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>API integrations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>Custom AI training</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-semibold text-white">$99</div>
                  <p className="text-sm text-purple-400">per month per facility</p>
                  <p className="text-xs text-gray-500">Average ROI: $12K-$75K annually</p>
                </div>

                <Link
                  href="/visual-operations"
                  className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium text-center transition-all text-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Marketplace Module */}
            <div className="relative bg-gradient-to-b from-green-900/20 to-green-900/10 backdrop-blur-xl rounded-3xl p-8 border border-green-600/30 hover:border-green-600/50 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                NEW
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-green-600/20 text-green-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">CEA Marketplace</h3>
                  <p className="text-sm text-gray-400">Connect growers with buyers</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Access the largest CEA produce marketplace. List products, manage orders, and connect with verified buyers nationwide.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Create unlimited product listings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Be first to connect with incoming buyers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Inventory & order management</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Analytics & insights dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>5% commission on transactions</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-white line-through text-gray-500">$99</span>
                  <span className="text-4xl font-semibold text-white ml-2">FREE</span>
                </div>
                <p className="text-sm text-green-400 mt-1">Launch Special - First 100 Growers</p>
                <p className="text-sm text-gray-500">Then $29/month + 5% transaction fee</p>
              </div>

              <Link
                href="/marketplace/onboarding"
                className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-center transition-all"
              >
                Activate Marketplace
              </Link>
            </div>

            {/* API Access Module */}
            <div className="relative bg-gradient-to-b from-blue-900/20 to-blue-900/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-600/30 hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Advanced API</h3>
                  <p className="text-sm text-gray-400">Enterprise integration</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Full API access for custom integrations, automated workflows, and third-party applications.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>100,000 API calls/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Webhook support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Custom endpoints</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Dedicated support</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white">$199</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/contact?interest=api')}
                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-center transition-all"
              >
                Contact Sales
              </button>
            </div>

            {/* White Label Module */}
            <div className="relative bg-gradient-to-b from-purple-900/20 to-purple-900/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-600/30 hover:border-purple-600/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">White Label</h3>
                  <p className="text-sm text-gray-400">Your brand, our tech</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Rebrand VibeLux with your logo, colors, and domain for a fully customized experience.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Custom domain</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Remove VibeLux branding</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Priority support</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white">$499</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>

              <button className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium text-center transition-all">
                Contact Sales
              </button>
            </div>

            {/* Compliance Module */}
            <div className="relative bg-gradient-to-b from-yellow-900/20 to-yellow-900/10 backdrop-blur-xl rounded-3xl p-8 border border-yellow-600/30 hover:border-yellow-600/50 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                US FOODS
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-yellow-600/20 text-yellow-400">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Compliance Suite</h3>
                  <p className="text-sm text-gray-400">Buyer requirements automation</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Automated compliance tracking for major buyers including US Foods, Sysco, and retail chains.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>GFSI certification tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>Mock recall automation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>FSMA compliance tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>Document version control</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white">$149</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Per buyer program</p>
              </div>

              <Link
                href="/compliance/us-foods"
                className="block w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full font-medium text-center transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Predictive Maintenance Module */}
            <div className="relative bg-gradient-to-b from-purple-900/20 to-purple-900/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-600/30 hover:border-purple-600/50 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                AI-POWERED
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Predictive Maintenance</h3>
                  <p className="text-sm text-gray-400">AI-powered failure prediction</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Predict equipment failures 7-30 days in advance with 92% accuracy. Reduce downtime and maintenance costs.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>ML-based failure prediction</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Automated parts ordering</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Cost optimization analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Real-time sensor monitoring</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-sm">Included in</span>
                  <span className="text-2xl font-semibold text-white ml-1">Professional+</span>
                </div>
              </div>

              <Link
                href="/features/predictive-maintenance"
                className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium text-center transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Energy Grid Integration Module */}
            <div className="relative bg-gradient-to-b from-yellow-900/20 to-yellow-900/10 backdrop-blur-xl rounded-3xl p-8 border border-yellow-600/30 hover:border-yellow-600/50 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                REVENUE STREAM
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-yellow-600/20 text-yellow-400">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Grid Integration</h3>
                  <p className="text-sm text-gray-400">Turn energy into revenue</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Connect to energy markets, participate in demand response, and generate revenue from your facility's flexibility.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>Real-time grid pricing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>Demand response enrollment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>Virtual Power Plant access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-yellow-500" />
                  <span>Carbon credit tracking</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-sm">Included in</span>
                  <span className="text-2xl font-semibold text-white ml-1">Enterprise</span>
                </div>
              </div>

              <Link
                href="/features/grid-integration"
                className="block w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full font-medium text-center transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Insurance Integration Module */}
            <div className="relative bg-gradient-to-b from-cyan-900/20 to-cyan-900/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-600/30 hover:border-cyan-600/50 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-cyan-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                RISK MANAGEMENT
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-cyan-600/20 text-cyan-400">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Insurance Integration</h3>
                  <p className="text-sm text-gray-400">Automated risk & compliance</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Real-time risk scoring, automated compliance tracking, and instant claims processing for optimal premiums.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-cyan-500" />
                  <span>24/7 risk monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-cyan-500" />
                  <span>Automated compliance reports</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-cyan-500" />
                  <span>Instant claims documentation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-cyan-500" />
                  <span>Premium optimization</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-sm">Included in</span>
                  <span className="text-2xl font-semibold text-white ml-1">Enterprise</span>
                </div>
              </div>

              <Link
                href="/features/insurance-integration"
                className="block w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium text-center transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation Tool */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Not sure which plan is right for you?
            </h2>
            <p className="mb-6 text-purple-100">
              Answer a few questions and we'll recommend the perfect tier for your needs.
            </p>
            <Link
              href="/pricing-quiz"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              Take the Quiz
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                Why do you have 15 different tiers?
              </h3>
              <p className="text-gray-400">
                The indoor agriculture industry is incredibly diverse, from hobbyists with a single tent 
                to multi-billion dollar vertical farms. Our 15 tiers ensure everyone pays only for what 
                they need, with specialized plans for consultants, academics, government, and more.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                Can I switch between tiers anytime?
              </h3>
              <p className="text-gray-400">
                Yes! You can upgrade instantly and we'll prorate the difference. Downgrades take effect 
                at the next billing cycle. Special tiers (Academic, Government) require verification.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                Do you offer custom pricing for large orders?
              </h3>
              <p className="text-gray-400">
                Absolutely. For orders over 50 seats, annual commitments over $50,000, or unique 
                requirements, contact our sales team for volume discounts and custom terms.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                What's included in the AI/ML features?
              </h3>
              <p className="text-gray-400">
                Our AI features include intelligent SOP generation, machine learning yield predictions 
                based on your historical data, predictive maintenance alerts (7-30 day equipment failure prediction), 
                intelligent spectrum recommendations, and real-time risk scoring. Higher tiers get more monthly 
                AI credits and access to advanced AI capabilities.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                How does the energy grid integration work?
              </h3>
              <p className="text-gray-400">
                Enterprise customers can connect their facilities to energy markets for demand response programs, 
                Virtual Power Plant participation, and real-time grid pricing optimization. This can generate 
                substantial revenue by shifting loads during peak periods and participating in grid stability programs.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                How does the investment platform work?
              </h3>
              <p className="text-gray-400">
                Our blockchain-based platform connects growers with investors for equipment and growth financing. 
                Smart contracts automatically execute revenue sharing based on IoT-verified performance data, 
                ensuring transparent and fair partnerships without traditional financing constraints.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-white">
                What makes Visual Operations Intelligence worth $99/month?
              </h3>
              <p className="text-gray-400">
                Visual Operations transforms every worker into an intelligent sensor. With 94% pest detection accuracy, 
                60% reduction in equipment downtime, and average savings of $12K-$75K annually, the first critical issue 
                caught typically pays for the entire year. It includes 12 types of photo reports, real-time AI analysis, 
                automated work orders, and comprehensive analytics - essentially replacing expensive consultants and 
                preventing costly problems before they escalate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Access Growth Capital?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of agricultural finance with our blockchain investment platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/investment"
              className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Explore Investment Options
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-purple-700 transition-colors border border-purple-500"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}