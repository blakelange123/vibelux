'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Search, Filter, Eye, Edit, Trash2,
  Package, DollarSign, Calendar, MapPin, CheckCircle,
  XCircle, Clock, MoreVertical, Download, Upload,
  AlertCircle, TrendingUp, Users, Building2, Zap
} from 'lucide-react';

interface EquipmentOffer {
  id: string;
  title: string;
  description: string;
  category: 'lighting' | 'hvac' | 'controls' | 'sensors' | 'irrigation' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  brand: string;
  model: string;
  quantity: number;
  price: number;
  priceType: 'fixed' | 'negotiable' | 'auction';
  location: {
    city: string;
    state: string;
    distance?: number;
  };
  seller: {
    id: string;
    name: string;
    rating: number;
    totalSales: number;
    verified: boolean;
  };
  images: string[];
  specifications: { [key: string]: string };
  energyEfficiency?: {
    efficacy: number; // μmol/J for lights
    powerDraw: number; // Watts
    certification?: string;
  };
  status: 'active' | 'pending' | 'sold' | 'expired';
  views: number;
  inquiries: number;
  createdAt: Date;
  expiresAt: Date;
}

export default function EquipmentOffersPage() {
  const [offers, setOffers] = useState<EquipmentOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'distance'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOffers();
  }, [selectedCategory, selectedCondition, sortBy]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockOffers = generateMockOffers();
      setOffers(mockOffers);
    } finally {
      setLoading(false);
    }
  };

  const generateMockOffers = (): EquipmentOffer[] => {
    return [
      {
        id: '1',
        title: 'Fluence SPYDR 2p LED Grow Lights - 10 Units',
        description: 'High-efficiency LED grow lights, used for 2 cycles only. Excellent condition with all original packaging.',
        category: 'lighting',
        condition: 'like_new',
        brand: 'Fluence',
        model: 'SPYDR 2p',
        quantity: 10,
        price: 8500,
        priceType: 'negotiable',
        location: { city: 'Denver', state: 'CO', distance: 0 },
        seller: {
          id: 'seller1',
          name: 'Green Valley Farms',
          rating: 4.8,
          totalSales: 23,
          verified: true
        },
        images: ['/api/placeholder/400/300'],
        specifications: {
          'PPF': '1870 μmol/s',
          'Efficacy': '2.8 μmol/J',
          'Input Power': '645W',
          'Dimensions': '44" x 44" x 3"',
          'Weight': '33 lbs'
        },
        energyEfficiency: {
          efficacy: 2.8,
          powerDraw: 645,
          certification: 'DLC Premium'
        },
        status: 'active',
        views: 342,
        inquiries: 12,
        createdAt: new Date('2024-01-20'),
        expiresAt: new Date('2024-02-20')
      },
      {
        id: '2',
        title: 'Quest 506 Commercial Dehumidifier',
        description: 'Industrial-grade dehumidifier, 506 pints/day capacity. Minor cosmetic wear but fully functional.',
        category: 'hvac',
        condition: 'good',
        brand: 'Quest',
        model: '506',
        quantity: 1,
        price: 4200,
        priceType: 'fixed',
        location: { city: 'Portland', state: 'OR', distance: 120 },
        seller: {
          id: 'seller2',
          name: 'Pacific Grow Systems',
          rating: 4.5,
          totalSales: 15,
          verified: true
        },
        images: ['/api/placeholder/400/300'],
        specifications: {
          'Capacity': '506 pints/day',
          'Power': '8.3 amps',
          'Air Flow': '640 CFM',
          'Operating Temp': '33°F - 110°F'
        },
        status: 'active',
        views: 128,
        inquiries: 5,
        createdAt: new Date('2024-01-18'),
        expiresAt: new Date('2024-02-18')
      },
      {
        id: '3',
        title: 'Argus Titan Control System - Complete Setup',
        description: 'Full environmental control system with CO2, temp, humidity, and lighting control. Includes all sensors.',
        category: 'controls',
        condition: 'good',
        brand: 'Argus',
        model: 'Titan',
        quantity: 1,
        price: 12000,
        priceType: 'negotiable',
        location: { city: 'Sacramento', state: 'CA', distance: 85 },
        seller: {
          id: 'seller3',
          name: 'NorCal Cultivation Co',
          rating: 5.0,
          totalSales: 8,
          verified: true
        },
        images: ['/api/placeholder/400/300'],
        specifications: {
          'Zones': '8 independent',
          'Sensors': 'Included',
          'Connectivity': 'Ethernet/WiFi',
          'Display': '10" touchscreen'
        },
        status: 'active',
        views: 256,
        inquiries: 18,
        createdAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-02-15')
      }
    ];
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || offer.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'distance':
        return (a.location.distance || 0) - (b.location.distance || 0);
      default:
        return 0;
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting': return '💡';
      case 'hvac': return '❄️';
      case 'controls': return '🎛️';
      case 'sensors': return '📡';
      case 'irrigation': return '💧';
      default: return '📦';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-400 bg-green-500/20';
      case 'like_new': return 'text-blue-400 bg-blue-500/20';
      case 'good': return 'text-yellow-400 bg-yellow-500/20';
      case 'fair': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Equipment
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Equipment Marketplace</h1>
              <p className="text-gray-400">
                Buy and sell quality cultivation equipment from verified growers
              </p>
            </div>
            <Link
              href="/equipment/offers/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              List Equipment
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Listings</p>
                <p className="text-2xl font-bold text-white">247</p>
              </div>
              <Package className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white">$1.2M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Verified Sellers</p>
                <p className="text-2xl font-bold text-white">89%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Response</p>
                <p className="text-2xl font-bold text-white">2.3h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment, brands, or sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="lighting">Lighting</option>
            <option value="hvac">HVAC</option>
            <option value="controls">Control Systems</option>
            <option value="sensors">Sensors</option>
            <option value="irrigation">Irrigation</option>
            <option value="other">Other</option>
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Conditions</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="distance">Distance</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Found <span className="text-white font-medium">{sortedOffers.length}</span> equipment listings
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Loading equipment offers...</p>
            </div>
          </div>
        ) : sortedOffers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No equipment found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCondition('all');
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedOffers.map((offer) => (
              <div 
                key={offer.id} 
                className={`bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Image */}
                <div className={viewMode === 'grid' ? 'h-48 bg-gray-800' : 'w-48 h-32 bg-gray-800 flex-shrink-0'}>
                  <img 
                    src={offer.images[0]} 
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getCategoryIcon(offer.category)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getConditionColor(offer.condition)}`}>
                          {offer.condition.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{offer.title}</h3>
                      <p className="text-sm text-gray-400">{offer.brand} {offer.model}</p>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{offer.description}</p>

                  {/* Energy Efficiency Badge */}
                  {offer.energyEfficiency && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-green-500/10 rounded-lg">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        {offer.energyEfficiency.efficacy} μmol/J • {offer.energyEfficiency.powerDraw}W
                      </span>
                    </div>
                  )}

                  {/* Price and Location */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        ${offer.price.toLocaleString()}
                        {offer.quantity > 1 && <span className="text-sm text-gray-400"> ({offer.quantity} units)</span>}
                      </p>
                      <p className="text-sm text-gray-400">{offer.priceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {offer.location.city}, {offer.location.state}
                      </p>
                      {offer.location.distance && (
                        <p className="text-xs text-gray-500">{offer.location.distance} miles</p>
                      )}
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white flex items-center gap-1">
                          {offer.seller.name}
                          {offer.seller.verified && <CheckCircle className="w-3 h-3 text-blue-400" />}
                        </p>
                        <p className="text-xs text-gray-400">
                          ⭐ {offer.seller.rating} • {offer.seller.totalSales} sales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {offer.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {offer.inquiries}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      href={`/equipment/offers/${offer.id}`}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}