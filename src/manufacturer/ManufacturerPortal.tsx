'use client';

import React, { useState } from 'react';
import { Upload, Package, Award, BarChart3, FileText, Send, Check, X } from 'lucide-react';
import { ManufacturerFeaturedProducts, ManufacturerSubmission } from '@/lib/manufacturer/featured-products';

export function ManufacturerPortal() {
  const [activeTab, setActiveTab] = useState<'submit' | 'benefits' | 'analytics'>('submit');
  const [submission, setSubmission] = useState<Partial<ManufacturerSubmission>>({
    companyInfo: {
      name: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      country: ''
    },
    products: [],
    requestedTier: 'basic'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await ManufacturerFeaturedProducts.submitApplication(submission as ManufacturerSubmission);
    setSubmitResult(result);
    setIsSubmitting(false);
  };

  const tierBenefits = {
    basic: ManufacturerFeaturedProducts.getTierBenefits('basic'),
    premium: ManufacturerFeaturedProducts.getTierBenefits('premium'),
    platinum: ManufacturerFeaturedProducts.getTierBenefits('platinum')
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Manufacturer Partner Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Showcase your products to thousands of lighting designers and engineers
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 text-sm font-medium rounded-l-lg transition-colors ${
                activeTab === 'submit'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Submit Products
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-6 py-3 text-sm font-medium border-l border-gray-200 dark:border-gray-700 transition-colors ${
                activeTab === 'benefits'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Partnership Benefits
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium rounded-r-lg border-l border-gray-200 dark:border-gray-700 transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Submit Products Tab */}
        {activeTab === 'submit' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Submit Your Products
            </h2>

            {submitResult && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex items-center">
                  {submitResult.success ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : (
                    <X className="w-5 h-5 mr-2" />
                  )}
                  {submitResult.message}
                </div>
              </div>
            )}

            <form className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={submission.companyInfo?.name || ''}
                      onChange={(e) => setSubmission({
                        ...submission,
                        companyInfo: { ...submission.companyInfo!, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website *
                    </label>
                    <input
                      type="url"
                      value={submission.companyInfo?.website || ''}
                      onChange={(e) => setSubmission({
                        ...submission,
                        companyInfo: { ...submission.companyInfo!, website: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={submission.companyInfo?.contactEmail || ''}
                      onChange={(e) => setSubmission({
                        ...submission,
                        companyInfo: { ...submission.companyInfo!, contactEmail: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={submission.companyInfo?.contactPhone || ''}
                      onChange={(e) => setSubmission({
                        ...submission,
                        companyInfo: { ...submission.companyInfo!, contactPhone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Product Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Product Information
                </h3>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Upload product datasheets, IES files, and images
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Select Files
                  </button>
                </div>
              </div>

              {/* Partnership Tier */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Select Partnership Tier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['basic', 'premium', 'platinum'] as const).map((tier) => (
                    <div
                      key={tier}
                      onClick={() => setSubmission({ ...submission, requestedTier: tier })}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        submission.requestedTier === tier
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize mb-2">
                        {tier}
                      </h4>
                      <p className="text-2xl font-bold text-purple-600 mb-2">
                        ${tierBenefits[tier].price}/mo
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• {tierBenefits[tier].products} products</li>
                        <li>• {tierBenefits[tier].placements.join(', ')} placement</li>
                        <li>• Priority level {tierBenefits[tier].priority}</li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['basic', 'premium', 'platinum'] as const).map((tier) => {
              const benefits = tierBenefits[tier];
              const isPlatinum = tier === 'platinum';
              
              return (
                <div
                  key={tier}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${
                    isPlatinum ? 'ring-2 ring-purple-600 transform scale-105' : ''
                  }`}
                >
                  {isPlatinum && (
                    <div className="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize mb-2">
                    {tier}
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 mb-6">
                    ${benefits.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {benefits.products === 'unlimited' ? 'Unlimited' : `Up to ${benefits.products}`} products
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {benefits.placements.join(', ')} placement
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Priority level {benefits.priority}
                      </span>
                    </li>
                    {benefits.analytics && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Advanced analytics
                        </span>
                      </li>
                    )}
                    {benefits.customBranding && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Custom branding
                        </span>
                      </li>
                    )}
                    {benefits.apiAccess && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">
                          API access
                        </span>
                      </li>
                    )}
                    {benefits.coMarketing && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Co-marketing opportunities
                        </span>
                      </li>
                    )}
                  </ul>
                  
                  <button className={`w-full py-3 font-medium rounded-lg transition-colors ${
                    isPlatinum
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}>
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Performance Analytics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Impressions</span>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">12,453</p>
                <p className="text-sm text-green-600 dark:text-green-400">+23% this month</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Clicks</span>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">892</p>
                <p className="text-sm text-green-600 dark:text-green-400">+15% this month</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">CTR</span>
                  <Award className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">7.2%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Industry avg: 4.5%</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Designs Used</span>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                <p className="text-sm text-green-600 dark:text-green-400">+32% this month</p>
              </div>
            </div>
            
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>Analytics are available for Premium and Platinum tier partners.</p>
              <p>Upgrade your plan to access detailed performance metrics.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}