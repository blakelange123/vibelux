'use client';

import React, { useState } from 'react';
import { MarketplaceGate } from '@/components/marketplace/MarketplaceGate';
import Link from 'next/link';
import { 
  ArrowLeft, Camera, Plus, X, Info, Save,
  Package, DollarSign, Truck, Calendar, Leaf,
  Award, AlertCircle, CheckCircle
} from 'lucide-react';
import { ProduceListing } from '@/lib/marketplace-types';

interface ListingFormData {
  productType: string;
  variety: string;
  growingMethod: string;
  certifications: string[];
  currentStock: number;
  unit: string;
  harvestDate: string;
  availableFrom: string;
  availableUntil: string;
  recurring: boolean;
  frequency: string;
  price: number;
  priceUnit: string;
  bulkDiscounts: { minQuantity: number; discountPercent: number }[];
  grade: string;
  shelfLife: number;
  packagingType: string;
  coldChainRequired: boolean;
  deliveryAvailable: boolean;
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  pickupAvailable: boolean;
  images: File[];
}

function CreateListingContent() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    productType: '',
    variety: '',
    growingMethod: 'hydroponic',
    certifications: [],
    currentStock: 0,
    unit: 'lbs',
    harvestDate: '',
    availableFrom: '',
    availableUntil: '',
    recurring: false,
    frequency: 'weekly',
    price: 0,
    priceUnit: 'lb',
    bulkDiscounts: [],
    grade: 'A',
    shelfLife: 7,
    packagingType: '',
    coldChainRequired: true,
    deliveryAvailable: true,
    deliveryRadius: 50,
    deliveryFee: 0,
    minimumOrder: 10,
    pickupAvailable: true,
    images: []
  });

  const productTypes = [
    { id: 'leafy-greens', name: 'Leafy Greens', icon: '🥬' },
    { id: 'tomatoes', name: 'Tomatoes', icon: '🍅' },
    { id: 'herbs', name: 'Fresh Herbs', icon: '🌿' },
    { id: 'floriculture', name: 'Floriculture', icon: '🌸' },
    { id: 'berries', name: 'Berries', icon: '🍓' },
    { id: 'peppers', name: 'Peppers', icon: '🌶️' },
    { id: 'cucumbers-squash', name: 'Cucumbers & Squash', icon: '🥒' },
    { id: 'microgreens', name: 'Microgreens', icon: '🌱' },
    { id: 'mushrooms', name: 'Mushrooms', icon: '🍄' },
    { id: 'root-vegetables', name: 'Root Vegetables', icon: '🥕' },
    { id: 'specialty', name: 'Specialty Produce', icon: '✨' }
  ];

  const certificationOptions = [
    'USDA Organic',
    'GAP Certified',
    'SQF Level 2',
    'Non-GMO Project',
    'Rainforest Alliance',
    'Fair Trade',
    'GlobalGAP',
    'Local Harvest'
  ];

  const handleAddBulkDiscount = () => {
    setFormData({
      ...formData,
      bulkDiscounts: [...formData.bulkDiscounts, { minQuantity: 0, discountPercent: 0 }]
    });
  };

  const handleRemoveBulkDiscount = (index: number) => {
    setFormData({
      ...formData,
      bulkDiscounts: formData.bulkDiscounts.filter((_, i) => i !== index)
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            href="/marketplace/produce"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Product Info' },
              { num: 2, label: 'Pricing & Inventory' },
              { num: 3, label: 'Delivery Options' },
              { num: 4, label: 'Review & Publish' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s.num 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                {idx < 3 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step > s.num ? 'bg-green-600' : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {[
              'Product Info',
              'Pricing & Inventory',
              'Delivery Options',
              'Review & Publish'
            ].map((label, idx) => (
              <span key={idx} className="text-xs text-gray-400">{label}</span>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-gray-900 rounded-xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Product Information</h2>
              
              {/* Product Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  What are you selling?
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {productTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, productType: type.id })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.productType === type.id
                          ? 'border-green-500 bg-green-600/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-xs md:text-sm text-white">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Variety */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Variety / Specific Name
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  placeholder="e.g., Buttercrunch, Cherry Tomatoes, Basil"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              {/* Growing Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Growing Method
                </label>
                <select
                  value={formData.growingMethod}
                  onChange={(e) => setFormData({ ...formData, growingMethod: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="hydroponic">Hydroponic</option>
                  <option value="aeroponic">Aeroponic</option>
                  <option value="aquaponic">Aquaponic</option>
                  <option value="soil">Soil-based</option>
                </select>
              </div>

              {/* Certifications */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Certifications (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {certificationOptions.map(cert => (
                    <label key={cert} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              certifications: [...formData.certifications, cert]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              certifications: formData.certifications.filter(c => c !== cert)
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

              {/* Quality Grade */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quality Grade
                </label>
                <div className="flex gap-3">
                  {['A', 'B', 'C'].map(grade => (
                    <button
                      key={grade}
                      onClick={() => setFormData({ ...formData, grade })}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        formData.grade === grade
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Grade A: Premium quality, no defects. Grade B: Good quality, minor defects. Grade C: Standard quality.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Pricing & Inventory</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Current Stock Available
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="lbs">lbs</option>
                      <option value="heads">heads</option>
                      <option value="bunches">bunches</option>
                      <option value="cases">cases</option>
                      <option value="flats">flats</option>
                      <option value="stems">stems</option>
                      <option value="pots">pots</option>
                      <option value="trays">trays</option>
                      <option value="oz">oz</option>
                      <option value="pints">pints</option>
                      <option value="bushels">bushels</option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price per Unit
                  </label>
                  <div className="flex gap-3">
                    <div className="flex items-center px-3 bg-gray-800 border border-gray-700 rounded-l-lg">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-r-lg text-white"
                    />
                  </div>
                </div>

                {/* Harvest Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                {/* Shelf Life */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Shelf Life (days)
                  </label>
                  <input
                    type="number"
                    value={formData.shelfLife}
                    onChange={(e) => setFormData({ ...formData, shelfLife: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Availability Dates */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Available Until
                  </label>
                  <input
                    type="date"
                    value={formData.availableUntil}
                    onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Bulk Discounts */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-400">
                    Bulk Discounts (optional)
                  </label>
                  <button
                    onClick={handleAddBulkDiscount}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Discount
                  </button>
                </div>
                {formData.bulkDiscounts.map((discount, idx) => (
                  <div key={idx} className="flex gap-3 mb-3">
                    <input
                      type="number"
                      placeholder="Min quantity"
                      value={discount.minQuantity}
                      onChange={(e) => {
                        const newDiscounts = [...formData.bulkDiscounts];
                        newDiscounts[idx].minQuantity = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, bulkDiscounts: newDiscounts });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={discount.discountPercent}
                      onChange={(e) => {
                        const newDiscounts = [...formData.bulkDiscounts];
                        newDiscounts[idx].discountPercent = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, bulkDiscounts: newDiscounts });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <button
                      onClick={() => handleRemoveBulkDiscount(idx)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Recurring Availability */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">This product is available regularly</span>
                </label>
                {formData.recurring && (
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="mt-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Delivery Options</h2>

              {/* Delivery Available */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.deliveryAvailable}
                    onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">Offer delivery service</span>
                </label>
                
                {formData.deliveryAvailable && (
                  <div className="mt-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Delivery Radius (miles)
                        </label>
                        <input
                          type="number"
                          value={formData.deliveryRadius}
                          onChange={(e) => setFormData({ ...formData, deliveryRadius: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Delivery Fee ($)
                        </label>
                        <input
                          type="number"
                          value={formData.deliveryFee}
                          onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">Enter 0 for free delivery</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup Available */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.pickupAvailable}
                    onChange={(e) => setFormData({ ...formData, pickupAvailable: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">Allow customer pickup</span>
                </label>
              </div>

              {/* Minimum Order */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Minimum Order Quantity
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: parseInt(e.target.value) || 0 })}
                    className="w-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <span className="text-gray-400">{formData.unit}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Set to 1 for no minimum
                </p>
              </div>

              {/* Packaging */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Packaging Type
                </label>
                <input
                  type="text"
                  value={formData.packagingType}
                  onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
                  placeholder="e.g., Clamshell containers, Vented bags, Bulk bins"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              {/* Cold Chain */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.coldChainRequired}
                    onChange={(e) => setFormData({ ...formData, coldChainRequired: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">Cold chain required</span>
                </label>
                <p className="text-xs text-gray-400 mt-2 ml-7">
                  Check if product requires refrigeration during transport
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Review & Publish</h2>
              
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-400 mb-1">Ready to publish!</h3>
                    <p className="text-sm text-gray-300">
                      Your listing is complete. Review the details below before publishing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Product Summary</h3>
                  <dl className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-400">Product</dt>
                      <dd className="text-white">{formData.variety}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Growing Method</dt>
                      <dd className="text-white capitalize">{formData.growingMethod}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Grade</dt>
                      <dd className="text-white">Grade {formData.grade}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Certifications</dt>
                      <dd className="text-white">{formData.certifications.join(', ') || 'None'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Pricing & Inventory</h3>
                  <dl className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-400">Price</dt>
                      <dd className="text-white">${formData.price} per {formData.priceUnit}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Available Stock</dt>
                      <dd className="text-white">{formData.currentStock} {formData.unit}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Availability</dt>
                      <dd className="text-white">
                        {formData.availableFrom} to {formData.availableUntil}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Bulk Discounts</dt>
                      <dd className="text-white">{formData.bulkDiscounts.length} tiers</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Delivery Options</h3>
                  <dl className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-400">Delivery</dt>
                      <dd className="text-white">
                        {formData.deliveryAvailable 
                          ? `Within ${formData.deliveryRadius} miles ($${formData.deliveryFee})`
                          : 'Not available'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Pickup</dt>
                      <dd className="text-white">{formData.pickupAvailable ? 'Available' : 'Not available'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Minimum Order</dt>
                      <dd className="text-white">{formData.minimumOrder} {formData.unit}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Cold Chain</dt>
                      <dd className="text-white">{formData.coldChainRequired ? 'Required' : 'Not required'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 text-green-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <Link href="/marketplace/terms" className="text-green-400 underline hover:text-green-300">
                      marketplace terms and conditions
                    </Link>{' '}
                    and confirm that all information provided is accurate.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Publish Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <MarketplaceGate feature="create">
      <CreateListingContent />
    </MarketplaceGate>
  );
}