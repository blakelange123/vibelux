'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, MapPin, Leaf, ShoppingCart, X,
  TrendingUp, Award, Calendar, Truck, Package,
  Star, Clock, CheckCircle, AlertCircle, ChevronDown,
  Grid, List, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { ProduceListing } from '@/lib/marketplace-types';
import { MarketplaceSearch, SearchFilters } from '@/lib/marketplace-search';
import { 
  produceCategories, 
  certificationOptions, 
  growingMethods,
  stateOptions,
  priceRanges,
  deliveryRadiusOptions,
  sortingOptions
} from '@/lib/marketplace-categories';
import MarketplaceGate from '@/components/marketplace/MarketplaceGate';

// Extended mock data to include floriculture
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
      type: 'leafy-greens',
      variety: 'Buttercrunch Lettuce',
      certifications: ['USDA Organic', 'GAP Certified'],
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
      images: []
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
    growerName: 'Bloom & Grow Florals',
    growerLocation: {
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      deliveryRadius: 75
    },
    product: {
      type: 'floriculture',
      variety: 'Dutch Roses - Red',
      certifications: ['Rainforest Alliance', 'Fair Trade'],
      growingMethod: 'greenhouse'
    },
    availability: {
      currentStock: 2000,
      unit: 'stems',
      harvestDate: new Date('2024-01-19'),
      availableFrom: new Date('2024-01-20'),
      availableUntil: new Date('2024-01-25'),
      recurring: true,
      frequency: 'weekly'
    },
    pricing: {
      price: 1.25,
      unit: 'stem',
      bulkDiscounts: [
        { minQuantity: 500, discountPercent: 15 },
        { minQuantity: 1000, discountPercent: 25 }
      ],
      contractPricing: true
    },
    quality: {
      grade: 'A',
      shelfLife: 7,
      packagingType: 'Bunches of 25',
      coldChainRequired: true,
      images: []
    },
    logistics: {
      deliveryAvailable: true,
      deliveryFee: 0,
      minimumOrder: 100,
      pickupAvailable: false,
      packagingIncluded: true
    },
    sustainability: {
      carbonFootprint: 0.3,
      waterUsage: 5,
      renewableEnergy: true,
      locallyGrown: true,
      pesticideFree: false
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    growerId: 'grower-3',
    growerName: 'Urban Microgreens Co',
    growerLocation: {
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110',
      deliveryRadius: 30
    },
    product: {
      type: 'microgreens',
      variety: 'Rainbow Mix Microgreens',
      certifications: ['USDA Organic', 'Certified Naturally Grown'],
      growingMethod: 'vertical'
    },
    availability: {
      currentStock: 50,
      unit: 'trays',
      harvestDate: new Date('2024-01-20'),
      availableFrom: new Date('2024-01-20'),
      availableUntil: new Date('2024-01-23'),
      recurring: true,
      frequency: 'biweekly'
    },
    pricing: {
      price: 18.00,
      unit: 'tray',
      bulkDiscounts: [
        { minQuantity: 10, discountPercent: 10 },
        { minQuantity: 25, discountPercent: 20 }
      ],
      contractPricing: false
    },
    quality: {
      grade: 'A',
      shelfLife: 7,
      packagingType: 'Live trays',
      coldChainRequired: false,
      images: []
    },
    logistics: {
      deliveryAvailable: true,
      deliveryFee: 25,
      minimumOrder: 5,
      pickupAvailable: true,
      packagingIncluded: true
    },
    sustainability: {
      carbonFootprint: 0.1,
      waterUsage: 0.5,
      renewableEnergy: true,
      locallyGrown: true,
      pesticideFree: true
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function ProduceBoardContent() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    certifications: [],
    priceRange: { min: 0, max: 999999 },
    location: {},
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState<number>(50);
  const [selectedSort, setSelectedSort] = useState<string>('nearest');

  // Apply filters
  const searchResults = MarketplaceSearch.searchListings(mockListings, filters);

  // Update filters when selections change
  useEffect(() => {
    setFilters({
      ...filters,
      categories: selectedCategories,
      certifications: selectedCertifications,
      priceRange: selectedPriceRange 
        ? priceRanges.find(r => r.id === selectedPriceRange) || { min: 0, max: 999999 }
        : { min: 0, max: 999999 },
      location: {
        ...filters.location,
        state: selectedState || undefined,
        radius: selectedRadius
      },
      sortBy: sortingOptions.find(s => s.id === selectedSort)?.id === 'price-low' ? 'price' :
              sortingOptions.find(s => s.id === selectedSort)?.id === 'price-high' ? 'price' :
              sortingOptions.find(s => s.id === selectedSort)?.id === 'freshest' ? 'date' :
              sortingOptions.find(s => s.id === selectedSort)?.id === 'rating' ? 'rating' : 'distance',
      sortOrder: selectedSort === 'price-high' ? 'desc' : 'asc'
    });
  }, [selectedCategories, selectedCertifications, selectedPriceRange, selectedState, selectedRadius, selectedSort]);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCertifications([]);
    setSelectedPriceRange('');
    setSelectedState('');
    setSelectedRadius(50);
    setFilters({ query: '' });
  };

  const activeFilterCount = 
    selectedCategories.length + 
    selectedCertifications.length + 
    (selectedPriceRange ? 1 : 0) + 
    (selectedState ? 1 : 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">CEA Produce Board</h1>
              <p className="text-sm text-gray-400">
                Fresh floriculture, leafy greens, tomatoes, herbs & more from local growers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/marketplace/produce/grower-dashboard"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Sell Produce
              </Link>
              <Link
                href="/marketplace/produce/orders"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <section className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search roses, lettuce, microgreens, herbs..."
                value={filters.query || ''}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-400">Active filters:</span>
              {selectedCategories.map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-full text-sm flex items-center gap-2">
                  {produceCategories.find(c => c.id === cat)?.name}
                  <button onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCertifications.map(cert => (
                <span key={cert} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-sm flex items-center gap-2">
                  {cert}
                  <button onClick={() => setSelectedCertifications(selectedCertifications.filter(c => c !== cert))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedPriceRange && (
                <span className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-full text-sm flex items-center gap-2">
                  {priceRanges.find(r => r.id === selectedPriceRange)?.label}
                  <button onClick={() => setSelectedPriceRange('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <section className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Product Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {produceCategories.map(category => (
                    <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                          }
                        }}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span className="text-gray-300 text-sm flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Certifications</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {certificationOptions.map(cert => (
                    <label key={cert} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCertifications.includes(cert)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCertifications([...selectedCertifications, cert]);
                          } else {
                            setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
                          }
                        }}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span className="text-gray-300 text-sm">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price & Location */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">All prices</option>
                    {priceRanges.map(range => (
                      <option key={range.id} value={range.id}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Location</h3>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white mb-3"
                  >
                    <option value="">All states</option>
                    {stateOptions.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {deliveryRadiusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort & Other Options */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Sort By</h3>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {sortingOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Other Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded" />
                      <span className="text-gray-300 text-sm">Available now only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded" />
                      <span className="text-gray-300 text-sm">Free delivery only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded" />
                      <span className="text-gray-300 text-sm">Organic only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Summary */}
      <section className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Found <span className="text-white font-semibold">{searchResults.total}</span> listings
            {filters.query && <> for "{filters.query}"</>}
          </p>
          <button className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300">
            <RefreshCw className="w-4 h-4" />
            Refresh results
          </button>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.listings.map(listing => {
              const category = produceCategories.find(c => c.id === listing.product.type);
              return (
                <div key={listing.id} className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-green-600/50 transition-all">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-800">
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                      {listing.product.certifications.slice(0, 2).map(cert => (
                        <span key={cert} className="px-2 py-1 bg-green-600/90 text-white text-xs rounded">
                          {cert}
                        </span>
                      ))}
                      {listing.product.certifications.length > 2 && (
                        <span className="px-2 py-1 bg-gray-700/90 text-white text-xs rounded">
                          +{listing.product.certifications.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gray-900/90 text-white rounded">
                      Grade {listing.quality.grade}
                    </div>
                    {/* Category Icon */}
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span className="text-6xl mb-2">{category?.icon}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">{category?.name}</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                      {listing.product.variety}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      by {listing.growerName}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-green-400">
                          ${listing.pricing.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400 ml-1">/{listing.pricing.unit}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {listing.availability.currentStock} {listing.availability.unit}
                      </span>
                    </div>

                    {/* Key Features */}
                    <div className="flex flex-wrap gap-2 mb-4 text-xs">
                      <span className="flex items-center gap-1 text-gray-300">
                        <MapPin className="w-3 h-3" />
                        {listing.growerLocation.city}
                      </span>
                      <span className="flex items-center gap-1 text-gray-300">
                        <Truck className="w-3 h-3" />
                        {listing.logistics.deliveryFee === 0 ? 'Free delivery' : `$${listing.logistics.deliveryFee} delivery`}
                      </span>
                      {listing.availability.recurring && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <RefreshCw className="w-3 h-3" />
                          {listing.availability.frequency}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/marketplace/produce/${listing.id}`}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium text-center transition-colors"
                      >
                        View Details
                      </Link>
                      <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {searchResults.listings.map(listing => {
              const category = produceCategories.find(c => c.id === listing.product.type);
              return (
                <div key={listing.id} className="bg-gray-900 rounded-xl p-6 hover:ring-2 hover:ring-green-600/50 transition-all">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">{category?.icon}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{listing.product.variety}</h3>
                          <p className="text-sm text-gray-400">
                            by {listing.growerName} • {listing.growerLocation.city}, {listing.growerLocation.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">
                            ${listing.pricing.price.toFixed(2)}
                            <span className="text-sm text-gray-400 ml-1">/{listing.pricing.unit}</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {listing.availability.currentStock} {listing.availability.unit} available
                          </p>
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {listing.product.certifications.map(cert => (
                          <span key={cert} className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            {cert}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                          {listing.product.growingMethod}
                        </span>
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                          Grade {listing.quality.grade}
                        </span>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {listing.quality.shelfLife} days shelf life
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          {listing.logistics.deliveryAvailable ? 'Delivery available' : 'Pickup only'}
                        </span>
                        {listing.availability.recurring && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <RefreshCw className="w-4 h-4" />
                            Available {listing.availability.frequency}
                          </span>
                        )}
                        {listing.pricing.bulkDiscounts && listing.pricing.bulkDiscounts.length > 0 && (
                          <span className="flex items-center gap-1 text-orange-400">
                            <TrendingUp className="w-4 h-4" />
                            Bulk discounts available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/marketplace/produce/${listing.id}`}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProduceBoardPage() {
  return (
    <MarketplaceGate feature="view">
      <ProduceBoardContent />
    </MarketplaceGate>
  );
}