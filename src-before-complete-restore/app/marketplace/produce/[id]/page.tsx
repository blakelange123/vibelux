'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Calendar, Truck, Package, 
  Star, ShoppingCart, Heart, Share2, CheckCircle,
  AlertCircle, Leaf, Droplets, Sun, Shield,
  Clock, TrendingUp, Users
} from 'lucide-react';
import { ProduceListing } from '@/lib/marketplace-types';

// This would normally fetch from API
const mockListing: ProduceListing = {
  id: '1',
  growerId: 'grower-1',
  growerName: 'Green Valley Farms',
  growerLocation: {
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    deliveryRadius: 50
  },
  product: {
    type: 'lettuce',
    variety: 'Buttercrunch Lettuce',
    certifications: ['USDA Organic', 'GAP Certified', 'SQF Level 2'],
    growingMethod: 'hydroponic'
  },
  availability: {
    currentStock: 500,
    unit: 'heads',
    harvestDate: new Date('2024-01-20'),
    availableFrom: new Date('2024-01-21'),
    availableUntil: new Date('2024-01-28'),
    recurring: true,
    frequency: 'weekly'
  },
  pricing: {
    price: 2.50,
    unit: 'head',
    bulkDiscounts: [
      { minQuantity: 100, discountPercent: 10 },
      { minQuantity: 500, discountPercent: 20 },
      { minQuantity: 1000, discountPercent: 30 }
    ],
    contractPricing: true
  },
  quality: {
    grade: 'A',
    shelfLife: 14,
    packagingType: 'Clamshell containers',
    coldChainRequired: true,
    images: ['/lettuce-1.jpg', '/lettuce-2.jpg', '/lettuce-3.jpg']
  },
  logistics: {
    deliveryAvailable: true,
    deliveryFee: 50,
    minimumOrder: 50,
    pickupAvailable: true,
    packagingIncluded: true
  },
  sustainability: {
    carbonFootprint: 0.5,
    waterUsage: 2,
    renewableEnergy: true,
    locallyGrown: true,
    pesticideFree: true
  },
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function ProduceDetailPage() {
  const params = useParams();
  const [quantity, setQuantity] = useState(100);
  const [selectedImage, setSelectedImage] = useState(0);

  // Calculate pricing based on quantity
  const calculatePrice = () => {
    let discount = 0;
    const applicableDiscount = mockListing.pricing.bulkDiscounts
      ?.reverse()
      .find(d => quantity >= d.minQuantity);
    
    if (applicableDiscount) {
      discount = applicableDiscount.discountPercent;
    }
    
    const baseTotal = quantity * mockListing.pricing.price;
    const discountAmount = baseTotal * (discount / 100);
    const finalPrice = baseTotal - discountAmount;
    
    return { baseTotal, discount, discountAmount, finalPrice };
  }

  const { baseTotal, discount, discountAmount, finalPrice } = calculatePrice();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/marketplace/produce"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images and Details */}
          <div>
            {/* Image Gallery */}
            <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
              <div className="aspect-square bg-gray-800 relative">
                <div className="absolute top-4 left-4 flex gap-2">
                  {mockListing.product.certifications.map(cert => (
                    <span key={cert} className="px-3 py-1.5 bg-green-600/90 text-white text-sm rounded-lg">
                      {cert}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 bg-gray-900/90 text-white rounded-lg font-medium">
                    Grade {mockListing.quality.grade}
                  </div>
                </div>
                {/* Placeholder for main image */}
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="w-32 h-32 text-gray-700" />
                </div>
              </div>
              {/* Thumbnail images */}
              <div className="flex gap-2 p-4 bg-gray-800">
                {[1, 2, 3, 4].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center ${
                      selectedImage === idx ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <Leaf className="w-8 h-8 text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Grower Info */}
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">About the Grower</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{mockListing.growerName}</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    {mockListing.growerLocation.city}, {mockListing.growerLocation.state}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-white">4.8</span>
                      <span className="text-gray-400">(124 reviews)</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">Member since 2021</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Family-owned hydroponic farm specializing in premium leafy greens. 
                  We use 95% less water than traditional farming and power our facility 
                  with 100% renewable energy.
                </p>
              </div>
            </div>

            {/* Sustainability Metrics */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
              <h3 className="text-lg font-semibold text-white mb-4">Sustainability Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <Droplets className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-sm text-gray-400">Water Usage</p>
                  <p className="text-xl font-semibold text-white">
                    {mockListing.sustainability.waterUsage} gal/unit
                  </p>
                  <p className="text-xs text-green-400">95% less than soil</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <Sun className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="text-sm text-gray-400">Energy Source</p>
                  <p className="text-xl font-semibold text-white">100% Solar</p>
                  <p className="text-xs text-green-400">Carbon neutral</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <MapPin className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-sm text-gray-400">Food Miles</p>
                  <p className="text-xl font-semibold text-white">&lt; 50 miles</p>
                  <p className="text-xs text-green-400">Locally grown</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <Shield className="w-6 h-6 text-green-400 mb-2" />
                  <p className="text-sm text-gray-400">Pesticides</p>
                  <p className="text-xl font-semibold text-white">Zero</p>
                  <p className="text-xs text-green-400">100% clean</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Options */}
          <div>
            <div className="sticky top-24">
              {/* Product Title */}
              <h1 className="text-3xl font-bold text-white mb-2">
                {mockListing.product.variety}
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Fresh, {mockListing.product.growingMethod} grown
              </p>

              {/* Availability Status */}
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-400">In Stock</span>
                </div>
                <p className="text-sm text-gray-300">
                  {mockListing.availability.currentStock} {mockListing.availability.unit} available
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Harvested: {mockListing.availability.harvestDate.toLocaleDateString()}
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-white">
                      ${mockListing.pricing.price.toFixed(2)}
                    </span>
                    <span className="text-gray-400 ml-2">per {mockListing.pricing.unit}</span>
                  </div>
                  {mockListing.availability.recurring && (
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                      Weekly Available
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quantity ({mockListing.availability.unit})
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(mockListing.logistics.minimumOrder || 1, quantity - 10))}
                      className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-center text-white"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 10)}
                      className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  {mockListing.logistics.minimumOrder && quantity < mockListing.logistics.minimumOrder && (
                    <p className="text-sm text-red-400 mt-2">
                      Minimum order: {mockListing.logistics.minimumOrder} {mockListing.availability.unit}
                    </p>
                  )}
                </div>

                {/* Bulk Pricing */}
                {mockListing.pricing.bulkDiscounts && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-300 mb-2">Bulk Discounts:</p>
                    <div className="space-y-1">
                      {mockListing.pricing.bulkDiscounts.map(disc => (
                        <div key={disc.minQuantity} className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {disc.minQuantity}+ {mockListing.availability.unit}
                          </span>
                          <span className="text-green-400">
                            Save {disc.discountPercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Calculation */}
                <div className="border-t border-gray-800 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${baseTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Bulk Discount ({discount}%)</span>
                      <span className="text-green-400">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {mockListing.logistics.deliveryFee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Delivery Fee</span>
                      <span className="text-white">${mockListing.logistics.deliveryFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-800">
                    <span className="text-white">Total</span>
                    <span className="text-green-400">
                      ${(finalPrice + (mockListing.logistics.deliveryFee || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  Request Recurring Order
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" />
                    Save
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {mockListing.logistics.deliveryAvailable 
                      ? `Delivery within ${mockListing.growerLocation.deliveryRadius} miles`
                      : 'Pickup only'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    Available {mockListing.availability.availableFrom.toLocaleDateString()} - {mockListing.availability.availableUntil.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {mockListing.quality.shelfLife} days shelf life from harvest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-12 bg-gray-900 rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-400">Growing Method</dt>
                  <dd className="text-white capitalize">{mockListing.product.growingMethod}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Packaging</dt>
                  <dd className="text-white">{mockListing.quality.packagingType}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Cold Chain</dt>
                  <dd className="text-white">
                    {mockListing.quality.coldChainRequired ? 'Required' : 'Not Required'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quality Standards</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Hand-selected for quality
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Packed within 24hrs of harvest
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Temperature controlled storage
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Third-party lab tested
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Why Buy Local CEA?</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Fresher produce with longer shelf life</li>
                <li>• Consistent quality year-round</li>
                <li>• Lower carbon footprint</li>
                <li>• Support local economy</li>
                <li>• Know your farmer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}