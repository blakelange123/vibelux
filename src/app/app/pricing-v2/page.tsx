'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, X, Sparkles, Home, Leaf, Briefcase, Zap, Microscope, 
  Building, Rocket, Globe, Crown, Users, GraduationCap, Beaker, 
  Shield, Wrench, ChevronDown, ChevronUp, ArrowRight, Info,
  Star, TrendingUp, Award, Percent
} from 'lucide-react';
import { SUBSCRIPTION_TIERS_15, FEATURE_CATEGORIES_15, getRecommendedTier15 } from '@/lib/subscription-tiers-15';

const iconMap: { [key: string]: any } = {
  Sparkles, Home, Leaf, Briefcase, Zap, Microscope,
  Building, Rocket, Globe, Crown, Users, GraduationCap,
  Beaker, Shield, Wrench, Plant: Leaf
};

export default function PricingV2Page() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedTiers, setExpandedTiers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'enterprise' | 'specialized'>('all');
  const [showComparison, setShowComparison] = useState(false);

  // Filter tiers by category
  const getFilteredTiers = () => {
    switch (selectedCategory) {
      case 'business':
        return SUBSCRIPTION_TIERS_15.filter(t => 
          ['free', 'hobbyist', 'enthusiast', 'starter-pro', 'professional', 'advanced'].includes(t.id)
        );
      case 'enterprise':
        return SUBSCRIPTION_TIERS_15.filter(t => 
          ['enterprise', 'enterprise-plus', 'corporate', 'corporate-elite'].includes(t.id)
        );
      case 'specialized':
        return SUBSCRIPTION_TIERS_15.filter(t => 
          ['consultant', 'academic', 'research', 'government', 'custom'].includes(t.id)
        );
      default:
        return SUBSCRIPTION_TIERS_15;
    }
  };

  const toggleTierExpansion = (tierId: string) => {
    setExpandedTiers(prev => 
      prev.includes(tierId) 
        ? prev.filter(id => id !== tierId)
        : [...prev, tierId]
    );
  };

  const calculateSavings = (tier: typeof SUBSCRIPTION_TIERS_15[0]) => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-100">
                15 Subscription Tiers - Find Your Perfect Fit
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Pricing That Scales With Your Success
            </h1>
            
            <p className="text-xl text-purple-100 mb-8">
              From hobbyists to mega-operations, we have specialized plans for every grower.
              Over 150 features across scientific, business, and enterprise tools.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white">$0</div>
                <div className="text-sm text-purple-200">Starting Price</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white">150+</div>
                <div className="text-sm text-purple-200">Features</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white">20%</div>
                <div className="text-sm text-purple-200">Annual Savings</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white">∞</div>
                <div className="text-sm text-purple-200">API Calls (Enterprise)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle & Filters */}
      <section className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Billing Period Toggle */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingPeriod === 'monthly' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingPeriod === 'annual' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Annual
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All Plans', count: 15 },
                { id: 'business', label: 'Business', count: 6 },
                { id: 'enterprise', label: 'Enterprise', count: 4 },
                { id: 'specialized', label: 'Specialized', count: 5 }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                  <span className="ml-2 text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Comparison Toggle */}
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {showComparison ? 'Hide' : 'Show'} Feature Comparison
            </button>
          </div>
        </div>
      </section>

      {/* Tier Cards Grid */}
      <section className="py-12">
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
                  className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden
                    ${tier.highlighted ? 'ring-2 ring-purple-500 transform scale-105' : ''}
                    ${tier.newTier ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  {/* Popular/New Badge */}
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                      <Star className="w-3 h-3 inline mr-1" />
                      POPULAR
                    </div>
                  )}
                  {tier.newTier && (
                    <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-3 py-1 rounded-br-lg">
                      NEW
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-${tier.color}-100`}>
                          <Icon className={`w-6 h-6 text-${tier.color}-600`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                          <p className="text-sm text-gray-500">{tier.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(displayPrice)}
                        </span>
                        {tier.price > 0 && (
                          <span className="text-gray-500">
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
                    <p className="text-sm text-gray-600 mb-4">
                      {tier.description}
                    </p>

                    {/* Target Audience */}
                    <div className="text-xs text-gray-500 mb-4 italic">
                      For: {tier.targetAudience}
                    </div>

                    {/* Key Limits */}
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg text-xs">
                      <div>
                        <span className="text-gray-500">Projects:</span>
                        <span className="ml-1 font-medium">
                          {tier.limits.projects === -1 ? 'Unlimited' : tier.limits.projects}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Team:</span>
                        <span className="ml-1 font-medium">
                          {tier.limits.teamMembers === -1 ? 'Unlimited' : tier.limits.teamMembers}
                        </span>
                      </div>
                      {tier.limits.apiCalls !== undefined && (
                        <div>
                          <span className="text-gray-500">API:</span>
                          <span className="ml-1 font-medium">
                            {tier.limits.apiCalls === -1 ? 'Unlimited' : `${tier.limits.apiCalls}/mo`}
                          </span>
                        </div>
                      )}
                      {tier.limits.monthlySOPs !== undefined && (
                        <div>
                          <span className="text-gray-500">SOPs:</span>
                          <span className="ml-1 font-medium">
                            {tier.limits.monthlySOPs === -1 ? 'Unlimited' : `${tier.limits.monthlySOPs}/mo`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {tier.features.slice(0, isExpanded ? undefined : 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {!isExpanded && tier.features.length > 5 && (
                        <button
                          onClick={() => toggleTierExpansion(tier.id)}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                          +{tier.features.length - 5} more features
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded && tier.features.length > 5 && (
                        <button
                          onClick={() => toggleTierExpansion(tier.id)}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1 mt-2"
                        >
                          Show less
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={tier.price === -1 ? '/contact' : '/sign-up'}
                      className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-all
                        ${tier.highlighted 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {tier.price === -1 ? 'Contact Sales' : tier.price === 0 ? 'Start Free' : 'Start Trial'}
                    </Link>

                    {/* Support Level */}
                    <p className="text-xs text-center text-gray-500 mt-3">
                      {tier.limits.supportLevel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      {showComparison && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              Detailed Feature Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-lg">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-semibold">Feature Category</th>
                    {getFilteredTiers().slice(0, 6).map(tier => (
                      <th key={tier.id} className="text-center p-4 min-w-[120px]">
                        <div className="font-semibold">{tier.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(tier.price)}
                          {tier.price > 0 && '/mo'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FEATURE_CATEGORIES_15).map(([category, features]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="p-3 font-semibold text-gray-700">
                          {category}
                        </td>
                      </tr>
                      {features.map(feature => (
                        <tr key={feature} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">{feature}</td>
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
                      ))}
                    </React.Fragment>
                  ))}
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
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">
                Why do you have 15 different tiers?
              </h3>
              <p className="text-gray-600">
                The indoor agriculture industry is incredibly diverse, from hobbyists with a single tent 
                to multi-billion dollar vertical farms. Our 15 tiers ensure everyone pays only for what 
                they need, with specialized plans for consultants, academics, government, and more.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">
                Can I switch between tiers anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade instantly and we'll prorate the difference. Downgrades take effect 
                at the next billing cycle. Special tiers (Academic, Government) require verification.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">
                Do you offer custom pricing for large orders?
              </h3>
              <p className="text-gray-600">
                Absolutely. For orders over 50 seats, annual commitments over $50,000, or unique 
                requirements, contact our sales team for volume discounts and custom terms.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">
                What's included in the AI/ML features?
              </h3>
              <p className="text-gray-600">
                Our AI features include ChatGPT-powered SOP generation, machine learning yield predictions 
                based on your historical data, predictive maintenance alerts, and intelligent spectrum 
                recommendations. Higher tiers get more monthly AI credits and advanced models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Growing Operation?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join over 10,000 growers optimizing their yields with Vibelux
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}