'use client';

import React, { useState } from 'react';
import { MarketplaceGate } from '@/components/marketplace/MarketplaceGate';
import Link from 'next/link';
import { 
  Search, Filter, MapPin, Leaf, ShoppingCart, 
  TrendingUp, Award, Calendar, Truck, Package,
  Star, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { ProduceListing, MarketplaceSearch } from '@/lib/marketplace-types';

// Mock data for demonstration
const mockListings: ProduceListing[] = [
  {
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
      variety: 'Buttercrunch',
      certifications: ['Organic', 'GAP Certified'],
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
        { minQuantity: 500, discountPercent: 20 }
      ],
      contractPricing: true
    },
    quality: {
      grade: 'A',
      shelfLife: 14,
      packagingType: 'Clamshell',
      coldChainRequired: true,
      images: ['/lettuce-1.jpg']
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
  },
  {
    id: '2',
    growerId: 'grower-2',
    growerName: 'Vertical Harvest Co',
    growerLocation: {
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      deliveryRadius: 75
    },
    product: {
      type: 'tomatoes',
      variety: 'Cherry Tomatoes',
      certifications: ['SQF', 'Non-GMO'],
      growingMethod: 'aeroponic'
    },
    availability: {
      currentStock: 200,
      unit: 'lbs',
      harvestDate: new Date('2024-01-19'),
      availableFrom: new Date('2024-01-20'),
      availableUntil: new Date('2024-01-25'),
      recurring: true,
      frequency: 'biweekly'
    },
    pricing: {
      price: 4.99,
      unit: 'lb',
      bulkDiscounts: [
        { minQuantity: 50, discountPercent: 15 }
      ],
      contractPricing: false
    },
    quality: {
      grade: 'A',
      shelfLife: 10,
      packagingType: 'Vented containers',
      coldChainRequired: false,
      images: ['/tomatoes-1.jpg']
    },
    logistics: {
      deliveryAvailable: true,
      deliveryFee: 0,
      minimumOrder: 20,
      pickupAvailable: false,
      packagingIncluded: true
    },
    sustainability: {
      carbonFootprint: 0.3,
      waterUsage: 1.5,
      renewableEnergy: true,
      locallyGrown: true,
      pesticideFree: true
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function ProduceMarketplaceContent() {
  const [searchParams, setSearchParams] = useState<MarketplaceSearch>({
    query: '',
    availableNow: true
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'buyer' | 'grower'>('buyer');

  const categories = [
    { id: 'lettuce', name: 'Lettuce', icon: '🥬', count: 24 },
    { id: 'tomatoes', name: 'Tomatoes', icon: '🍅', count: 18 },
    { id: 'herbs', name: 'Herbs', icon: '🌿', count: 32 },
    { id: 'berries', name: 'Berries', icon: '🍓', count: 12 },
    { id: 'peppers', name: 'Peppers', icon: '🌶️', count: 15 },
    { id: 'cucumbers', name: 'Cucumbers', icon: '🥒', count: 9 }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">CEA Produce Marketplace</h1>
              <p className="text-sm text-gray-400">Fresh, local, sustainable produce direct from growers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('buyer')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    viewMode === 'buyer' 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  I'm Buying
                </button>
                <button
                  onClick={() => setViewMode('grower')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    viewMode === 'grower' 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  I'm Selling
                </button>
              </div>
              <Link
                href="/marketplace/produce/orders"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'buyer' ? (
        <>
          {/* Search and Filters */}
          <section className="border-b border-gray-800 bg-gray-900/30">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for lettuce, tomatoes, herbs..."
                    value={searchParams.query}
                    onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
                    <MapPin className="w-4 h-4" />
                    <span>Within 50 miles</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-full text-sm">
                  Available Now
                </button>
                <button className="px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-full text-sm">
                  Organic Only
                </button>
                <button className="px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-full text-sm">
                  Free Delivery
                </button>
                <button className="px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-full text-sm">
                  Grade A Only
                </button>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              <aside className="lg:col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-white">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{category.count}</span>
                    </button>
                  ))}
                </div>

                {/* Sustainability Metrics */}
                <div className="mt-8 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-600/30">
                  <h4 className="font-semibold text-white mb-3">Sustainability Impact</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Avg. Miles Saved</span>
                      <span className="text-green-400 font-semibold">847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Water Saved</span>
                      <span className="text-blue-400 font-semibold">75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Carbon Reduced</span>
                      <span className="text-purple-400 font-semibold">62%</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Listings Grid */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedCategory 
                      ? `${categories.find(c => c.id === selectedCategory)?.name} Available`
                      : 'All Fresh Produce'
                    }
                  </h2>
                  <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>Sort by: Nearest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Freshest First</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {mockListings.map(listing => (
                    <div key={listing.id} className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-green-600/50 transition-all">
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-800">
                        <div className="absolute top-3 left-3 flex gap-2">
                          {listing.product.certifications.map(cert => (
                            <span key={cert} className="px-2 py-1 bg-green-600/90 text-white text-xs rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-1 bg-gray-900/90 text-white rounded">
                          Grade {listing.quality.grade}
                        </div>
                        {/* Placeholder for image */}
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-16 h-16 text-gray-700" />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {listing.product.variety}
                            </h3>
                            <p className="text-sm text-gray-400">
                              by {listing.growerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">
                              ${listing.pricing.price}
                            </p>
                            <p className="text-sm text-gray-400">per {listing.pricing.unit}</p>
                          </div>
                        </div>

                        {/* Key Info */}
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Package className="w-4 h-4 text-gray-400" />
                            {listing.availability.currentStock} {listing.availability.unit} available
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {listing.quality.shelfLife} days shelf life
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {listing.growerLocation.city}, {listing.growerLocation.state}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Truck className="w-4 h-4 text-gray-400" />
                            {listing.logistics.deliveryAvailable ? 'Delivery available' : 'Pickup only'}
                          </div>
                        </div>

                        {/* Sustainability Badges */}
                        <div className="flex gap-2 mb-4">
                          {listing.sustainability.renewableEnergy && (
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                              🌞 Solar Powered
                            </span>
                          )}
                          {listing.sustainability.pesticideFree && (
                            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                              🌱 Pesticide Free
                            </span>
                          )}
                          {listing.sustainability.locallyGrown && (
                            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                              📍 Local
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Link
                            href={`/marketplace/produce/${listing.id}`}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors"
                          >
                            View Details
                          </Link>
                          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Grower View */
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Sell Your Fresh Produce
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect directly with restaurants, grocers, and institutions. 
              Get better prices, reduce waste, and build lasting relationships.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/marketplace/produce/create-listing"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Your First Listing
              </Link>
              <Link
                href="/marketplace/produce/grower-dashboard"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gray-900 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Better Prices</h3>
              <p className="text-gray-400">
                Direct sales mean no middleman fees. Keep more of your revenue.
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <Award className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Quality Recognition</h3>
              <p className="text-gray-400">
                Showcase your certifications and growing methods to premium buyers.
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <Calendar className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Predictable Demand</h3>
              <p className="text-gray-400">
                Build recurring relationships and plan harvests with confidence.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProduceMarketplacePage() {
  return (
    <MarketplaceGate feature="view">
      <ProduceMarketplaceContent />
    </MarketplaceGate>
  );
}