'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Building2, Package, Users, CheckCircle,
  Leaf, TrendingUp, Shield, Truck, Calendar, DollarSign,
  Camera, FileText, Award, ChevronRight
} from 'lucide-react';

type UserType = 'grower' | 'buyer' | null;
type GrowerStep = 'info' | 'verification' | 'listing' | 'complete';
type BuyerStep = 'info' | 'preferences' | 'complete';

export default function MarketplaceOnboardingPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [growerStep, setGrowerStep] = useState<GrowerStep>('info');
  const [buyerStep, setBuyerStep] = useState<BuyerStep>('info');
  
  // Form data
  const [growerData, setGrowerData] = useState({
    farmName: '',
    description: '',
    city: '',
    state: '',
    facilitySize: '',
    growingMethods: [] as string[],
    certifications: [] as string[],
    productTypes: [] as string[]
  });
  
  const [buyerData, setBuyerData] = useState({
    businessName: '',
    businessType: '',
    city: '',
    state: '',
    productInterests: [] as string[],
    volumeNeeds: '',
    deliveryFrequency: ''
  });

  // User type selection
  if (!userType) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to VibeLux Marketplace
            </h1>
            <p className="text-xl text-gray-400">
              Connect directly with CEA growers and buyers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Grower Option */}
            <button
              onClick={() => setUserType('grower')}
              className="bg-gray-900 rounded-xl p-8 text-left hover:ring-2 hover:ring-green-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <Leaf className="w-12 h-12 text-green-500" />
                <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-green-500 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">I'm a Grower</h2>
              <p className="text-gray-400 mb-6">
                List your fresh produce and connect with local buyers
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Direct sales to restaurants & retailers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Set your own prices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Analytics & inventory tools
                </li>
              </ul>
            </button>

            {/* Buyer Option */}
            <button
              onClick={() => setUserType('buyer')}
              className="bg-gray-900 rounded-xl p-8 text-left hover:ring-2 hover:ring-blue-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <Building2 className="w-12 h-12 text-blue-500" />
                <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">I'm a Buyer</h2>
              <p className="text-gray-400 mb-6">
                Source fresh produce directly from local CEA growers
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Fresh, locally-grown produce
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Transparent pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Flexible delivery options
                </li>
              </ul>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grower onboarding flow
  if (userType === 'grower') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-12">
            {['Business Info', 'Verification', 'First Listing', 'Complete'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  idx <= ['info', 'verification', 'listing', 'complete'].indexOf(growerStep)
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div className={`w-full h-1 ${
                    idx < ['info', 'verification', 'listing', 'complete'].indexOf(growerStep)
                      ? 'bg-green-600' 
                      : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {growerStep === 'info' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Tell us about your farm</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Farm/Business Name
                  </label>
                  <input
                    type="text"
                    value={growerData.farmName}
                    onChange={(e) => setGrowerData({ ...growerData, farmName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Green Valley Farms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={growerData.description}
                    onChange={(e) => setGrowerData({ ...growerData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Tell buyers about your growing operation..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={growerData.city}
                      onChange={(e) => setGrowerData({ ...growerData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      State
                    </label>
                    <select
                      value={growerData.state}
                      onChange={(e) => setGrowerData({ ...growerData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">Select state</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Growing Methods (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Hydroponic', 'Aeroponic', 'Aquaponic', 'Vertical Farming', 'Greenhouse', 'Indoor'].map(method => (
                      <label key={method} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={growerData.growingMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGrowerData({
                                ...growerData,
                                growingMethods: [...growerData.growingMethods, method]
                              });
                            } else {
                              setGrowerData({
                                ...growerData,
                                growingMethods: growerData.growingMethods.filter(m => m !== method)
                              });
                            }
                          }}
                          className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                        />
                        <span className="text-white">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setGrowerStep('verification')}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {growerStep === 'verification' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Verification & Certifications</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Upload Documents</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button className="p-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Business License</p>
                    </button>
                    <button className="p-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Insurance Certificate</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Certifications (select all that apply)
                  </label>
                  <div className="space-y-2">
                    {['USDA Organic', 'GAP Certified', 'SQF Level 2', 'Non-GMO Project', 'Fair Trade'].map(cert => (
                      <label key={cert} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={growerData.certifications.includes(cert)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGrowerData({
                                ...growerData,
                                certifications: [...growerData.certifications, cert]
                              });
                            } else {
                              setGrowerData({
                                ...growerData,
                                certifications: growerData.certifications.filter(c => c !== cert)
                              });
                            }
                          }}
                          className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                        />
                        <span className="text-white">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <p className="text-sm text-blue-400">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Verification typically takes 1-2 business days. You can start creating listings immediately!
                  </p>
                </div>

                <button
                  onClick={() => setGrowerStep('listing')}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {growerStep === 'listing' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Create your first listing</h2>
              <p className="text-gray-400 mb-8">
                Let's add your first product to get started. You can always add more later!
              </p>

              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <Link
                  href="/marketplace/produce/create-listing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create First Listing
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setGrowerStep('complete')}
                  className="block mx-auto mt-4 text-sm text-gray-400 hover:text-white"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {growerStep === 'complete' && (
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to the marketplace!</h2>
              <p className="text-gray-400 mb-8">
                Your account is ready. Here's what you can do next:
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Link href="/marketplace/produce/create-listing" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Create Listings</p>
                </Link>
                <Link href="/marketplace/produce/grower-dashboard" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium">View Dashboard</p>
                </Link>
                <Link href="/marketplace/produce-board" className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Browse Market</p>
                </Link>
              </div>

              <Link
                href="/marketplace/produce/grower-dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Buyer onboarding flow
  if (userType === 'buyer') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-12">
            {['Business Info', 'Preferences', 'Complete'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  idx <= ['info', 'preferences', 'complete'].indexOf(buyerStep)
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < 2 && (
                  <div className={`w-full h-1 ${
                    idx < ['info', 'preferences', 'complete'].indexOf(buyerStep)
                      ? 'bg-blue-600' 
                      : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {buyerStep === 'info' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Tell us about your business</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={buyerData.businessName}
                    onChange={(e) => setBuyerData({ ...buyerData, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Fresh Kitchen Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Business Type
                  </label>
                  <select
                    value={buyerData.businessType}
                    onChange={(e) => setBuyerData({ ...buyerData, businessType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Select type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="distributor">Distributor</option>
                    <option value="institution">Institution</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={buyerData.city}
                      onChange={(e) => setBuyerData({ ...buyerData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      State
                    </label>
                    <select
                      value={buyerData.state}
                      onChange={(e) => setBuyerData({ ...buyerData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">Select state</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setBuyerStep('preferences')}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {buyerStep === 'preferences' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">What are you looking for?</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Product Interests (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Leafy Greens', 'Tomatoes', 'Herbs', 'Microgreens', 'Berries', 'Floriculture'].map(product => (
                      <label key={product} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={buyerData.productInterests.includes(product)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBuyerData({
                                ...buyerData,
                                productInterests: [...buyerData.productInterests, product]
                              });
                            } else {
                              setBuyerData({
                                ...buyerData,
                                productInterests: buyerData.productInterests.filter(p => p !== product)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                        />
                        <span className="text-white">{product}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Volume Needs
                  </label>
                  <select
                    value={buyerData.volumeNeeds}
                    onChange={(e) => setBuyerData({ ...buyerData, volumeNeeds: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Select volume</option>
                    <option value="small">Small (&lt; $1,000/month)</option>
                    <option value="medium">Medium ($1,000 - $10,000/month)</option>
                    <option value="large">Large ($10,000 - $50,000/month)</option>
                    <option value="enterprise">Enterprise ($50,000+/month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Delivery Frequency
                  </label>
                  <select
                    value={buyerData.deliveryFrequency}
                    onChange={(e) => setBuyerData({ ...buyerData, deliveryFrequency: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="2-3-weekly">2-3 times per week</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <button
                  onClick={() => setBuyerStep('complete')}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}

          {buyerStep === 'complete' && (
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">You're all set!</h2>
              <p className="text-gray-400 mb-8">
                Start browsing fresh produce from local CEA growers
              </p>

              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6 mb-8">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-lg font-semibold text-white mb-1">Welcome Offer</p>
                <p className="text-gray-300">Use code <span className="font-mono font-bold text-green-400">FRESH10</span> for $10 off your first order!</p>
              </div>

              <Link
                href="/marketplace/produce-board"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Browse Produce
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}