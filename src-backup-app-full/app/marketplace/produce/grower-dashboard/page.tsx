'use client';

import React, { useState } from 'react';
import { MarketplaceGate } from '@/components/marketplace/MarketplaceGate';
import Link from 'next/link';
import { 
  Package, DollarSign, TrendingUp, Users, 
  Calendar, Truck, BarChart3, PieChart,
  AlertCircle, CheckCircle, Clock, ArrowUp,
  ArrowDown, Edit, Eye, Trash2, Plus
} from 'lucide-react';
import { GrowerDashboard, HarvestPlan, ProduceListing } from '@/lib/marketplace-types';

// Mock data
const mockDashboard: GrowerDashboard = {
  activeListings: 8,
  totalSales: 45280,
  averageRating: 4.8,
  repeatBuyers: 67,
  upcomingHarvests: [
    {
      cropType: 'lettuce',
      variety: 'Buttercrunch',
      expectedDate: new Date('2024-01-25'),
      expectedYield: 500,
      unit: 'heads',
      preSold: 350,
      available: 150
    },
    {
      cropType: 'tomatoes',
      variety: 'Cherry',
      expectedDate: new Date('2024-01-28'),
      expectedYield: 200,
      unit: 'lbs',
      preSold: 120,
      available: 80
    }
  ],
  inventoryLevels: [
    {
      product: 'Buttercrunch Lettuce',
      currentStock: 500,
      unit: 'heads',
      location: 'Greenhouse A',
      harvestDate: new Date('2024-01-20'),
      daysUntilExpiry: 10
    },
    {
      product: 'Cherry Tomatoes',
      currentStock: 200,
      unit: 'lbs',
      location: 'Greenhouse B',
      harvestDate: new Date('2024-01-19'),
      daysUntilExpiry: 8
    }
  ]
};

const mockListings: Partial<ProduceListing>[] = [
  {
    id: '1',
    product: { variety: 'Buttercrunch Lettuce', type: 'lettuce' },
    availability: { currentStock: 500, unit: 'heads' },
    pricing: { price: 2.50, unit: 'head' },
    status: 'active'
  },
  {
    id: '2',
    product: { variety: 'Cherry Tomatoes', type: 'tomatoes' },
    availability: { currentStock: 200, unit: 'lbs' },
    pricing: { price: 4.99, unit: 'lb' },
    status: 'active'
  }
];

function GrowerDashboardContent() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock analytics data
  const salesData = {
    week: { revenue: 8500, orders: 23, growth: 12 },
    month: { revenue: 45280, orders: 142, growth: 18 },
    year: { revenue: 485000, orders: 1843, growth: 45 }
  };

  const currentData = salesData[timeRange];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Grower Dashboard</h1>
              <p className="text-sm text-gray-400">Manage your produce listings and sales</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/marketplace/produce/create-listing"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Listing
              </Link>
              <Link
                href="/marketplace/produce"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                View Marketplace
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-green-400 font-medium">+2 this week</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">Active Listings</p>
            <p className="text-3xl font-bold text-white">{mockDashboard.activeListings}</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-sm text-green-400 font-medium flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {currentData.growth}%
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">${currentData.revenue.toLocaleString()}</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-yellow-${i <= Math.floor(mockDashboard.averageRating) ? '500' : '900/20'}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-white">{mockDashboard.averageRating}</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-orange-400" />
              <span className="text-sm text-green-400 font-medium">85% retention</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">Repeat Buyers</p>
            <p className="text-3xl font-bold text-white">{mockDashboard.repeatBuyers}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sales Analytics */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Sales Analytics</h2>
                <div className="flex bg-gray-800 rounded-lg p-1">
                  {(['week', 'month', 'year'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        timeRange === range 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-16 h-16 text-gray-700" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Orders</p>
                  <p className="text-2xl font-bold text-white">{currentData.orders}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Avg Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${Math.round(currentData.revenue / currentData.orders)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Growth</p>
                  <p className="text-2xl font-bold text-green-400">+{currentData.growth}%</p>
                </div>
              </div>
            </div>

            {/* Active Listings */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Active Listings</h2>
                <Link
                  href="/marketplace/produce/create-listing"
                  className="text-sm text-green-400 hover:text-green-300"
                >
                  Add New
                </Link>
              </div>

              <div className="space-y-4">
                {mockListings.map(listing => (
                  <div key={listing.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                          {listing.product?.type === 'lettuce' ? '🥬' : '🍅'}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{listing.product?.variety}</h4>
                          <p className="text-sm text-gray-400">
                            {listing.availability?.currentStock} {listing.availability?.unit} @ ${listing.pricing?.price}/{listing.pricing?.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Harvests */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Harvests</h3>
              <div className="space-y-4">
                {mockDashboard.upcomingHarvests.map((harvest, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{harvest.variety}</h4>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {harvest.expectedDate.toLocaleDateString()}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Expected Yield</span>
                        <span className="text-white">
                          {harvest.expectedYield} {harvest.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Pre-sold</span>
                        <span className="text-yellow-400">
                          {harvest.preSold} {harvest.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Available</span>
                        <span className="text-green-400">
                          {harvest.available} {harvest.unit}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ width: `${(harvest.preSold / harvest.expectedYield) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Inventory Alerts</h3>
              <div className="space-y-3">
                {mockDashboard.inventoryLevels
                  .filter(item => item.daysUntilExpiry < 7)
                  .map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-orange-900/20 rounded-lg border border-orange-600/30">
                      <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.product}</p>
                        <p className="text-xs text-gray-400">
                          {item.daysUntilExpiry} days until expiry • {item.currentStock} {item.unit} remaining
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/marketplace/produce/orders"
                  className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-white">View Orders</span>
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                    5 new
                  </span>
                </Link>
                <Link
                  href="/marketplace/produce/analytics"
                  className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-white">Detailed Analytics</span>
                  <PieChart className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/marketplace/produce/buyers"
                  className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-white">Buyer Network</span>
                  <Users className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GrowerDashboardPage() {
  return (
    <MarketplaceGate feature="create">
      <GrowerDashboardContent />
    </MarketplaceGate>
  );
}