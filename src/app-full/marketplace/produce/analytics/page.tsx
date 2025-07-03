'use client';

import React, { useState } from 'react';
import { MarketplaceGate } from '@/components/marketplace/MarketplaceGate';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, Users, Package, DollarSign,
  BarChart3, PieChart, Calendar, Download, Filter,
  Star, MapPin, Clock, Percent, ArrowUp, ArrowDown
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    byMonth: { month: string; amount: number }[];
    byProduct: { product: string; amount: number; percentage: number }[];
  };
  orders: {
    total: number;
    completed: number;
    averageValue: number;
    byStatus: { status: string; count: number }[];
  };
  customers: {
    total: number;
    new: number;
    repeat: number;
    retention: number;
    topBuyers: { name: string; orders: number; revenue: number }[];
  };
  products: {
    topSelling: { name: string; units: number; revenue: number }[];
    inventory: { product: string; stock: number; turnover: number }[];
    ratings: { product: string; rating: number; reviews: number }[];
  };
  geography: {
    byCity: { city: string; orders: number; revenue: number }[];
    deliveryRadius: { distance: number; orders: number }[];
  };
}

const mockAnalytics: AnalyticsData = {
  revenue: {
    total: 485000,
    growth: 23.5,
    byMonth: [
      { month: 'Jan', amount: 35000 },
      { month: 'Feb', amount: 42000 },
      { month: 'Mar', amount: 38000 },
      { month: 'Apr', amount: 45000 },
      { month: 'May', amount: 52000 },
      { month: 'Jun', amount: 48000 }
    ],
    byProduct: [
      { product: 'Lettuce', amount: 145000, percentage: 30 },
      { product: 'Tomatoes', amount: 120000, percentage: 25 },
      { product: 'Herbs', amount: 95000, percentage: 20 },
      { product: 'Microgreens', amount: 75000, percentage: 15 },
      { product: 'Others', amount: 50000, percentage: 10 }
    ]
  },
  orders: {
    total: 1843,
    completed: 1752,
    averageValue: 262,
    byStatus: [
      { status: 'Delivered', count: 1752 },
      { status: 'In Transit', count: 45 },
      { status: 'Pending', count: 23 },
      { status: 'Cancelled', count: 23 }
    ]
  },
  customers: {
    total: 287,
    new: 43,
    repeat: 244,
    retention: 85,
    topBuyers: [
      { name: 'Fresh Kitchen Restaurant', orders: 124, revenue: 45280 },
      { name: 'Green Grocer Market', orders: 98, revenue: 38500 },
      { name: 'Healthy Bites Cafe', orders: 87, revenue: 32100 },
      { name: 'Farm to Table Co', orders: 76, revenue: 28900 }
    ]
  },
  products: {
    topSelling: [
      { name: 'Buttercrunch Lettuce', units: 12500, revenue: 31250 },
      { name: 'Cherry Tomatoes', units: 8200, revenue: 40918 },
      { name: 'Fresh Basil', units: 6500, revenue: 19500 },
      { name: 'Mixed Microgreens', units: 4200, revenue: 25200 }
    ],
    inventory: [
      { product: 'Buttercrunch Lettuce', stock: 500, turnover: 25 },
      { product: 'Cherry Tomatoes', stock: 200, turnover: 41 },
      { product: 'Fresh Basil', stock: 150, turnover: 43 },
      { product: 'Mixed Microgreens', stock: 100, turnover: 42 }
    ],
    ratings: [
      { product: 'Buttercrunch Lettuce', rating: 4.8, reviews: 234 },
      { product: 'Cherry Tomatoes', rating: 4.9, reviews: 187 },
      { product: 'Fresh Basil', rating: 4.7, reviews: 156 },
      { product: 'Mixed Microgreens', rating: 4.9, reviews: 98 }
    ]
  },
  geography: {
    byCity: [
      { city: 'San Francisco', orders: 782, revenue: 205000 },
      { city: 'Oakland', orders: 543, revenue: 142000 },
      { city: 'Berkeley', orders: 321, revenue: 84000 },
      { city: 'San Jose', orders: 197, revenue: 54000 }
    ],
    deliveryRadius: [
      { distance: 10, orders: 892 },
      { distance: 25, orders: 654 },
      { distance: 50, orders: 297 }
    ]
  }
};

function MarketplaceAnalyticsContent() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'geography'>('overview');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/marketplace/produce/grower-dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Marketplace Analytics</h1>
              <p className="text-sm text-gray-400">Deep insights into your produce business</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
                <option value="year">Last 12 months</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'geography', label: 'Geography', icon: MapPin }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 flex-1 px-4 py-2 rounded font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    mockAnalytics.revenue.growth > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {mockAnalytics.revenue.growth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(mockAnalytics.revenue.growth)}%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${mockAnalytics.revenue.total.toLocaleString()}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-gray-400">
                    {Math.round((mockAnalytics.orders.completed / mockAnalytics.orders.total) * 100)}% completed
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{mockAnalytics.orders.total.toLocaleString()}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-green-400">+{mockAnalytics.customers.new} new</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-white">{mockAnalytics.customers.total}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  <span className="text-sm text-gray-400">${mockAnalytics.orders.averageValue}</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Customer Retention</p>
                <p className="text-3xl font-bold text-white">{mockAnalytics.customers.retention}%</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Revenue Trend</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {mockAnalytics.revenue.byMonth.map((month, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-800 rounded-t relative" style={{
                      height: `${(month.amount / Math.max(...mockAnalytics.revenue.byMonth.map(m => m.amount))) * 100}%`
                    }}>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                        ${(month.amount / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Product */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Revenue by Product</h3>
                <div className="space-y-4">
                  {mockAnalytics.revenue.byProduct.map((product, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">{product.product}</span>
                        <span className="text-gray-400">${(product.amount / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${product.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Order Status Breakdown</h3>
                <div className="flex items-center justify-center h-48">
                  <PieChart className="w-32 h-32 text-gray-700" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {mockAnalytics.orders.byStatus.map((status, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status.status === 'Delivered' ? 'bg-green-500' :
                        status.status === 'In Transit' ? 'bg-purple-500' :
                        status.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-400">{status.status}</span>
                      <span className="text-sm text-white ml-auto">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* Top Selling Products */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Top Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-800">
                      <th className="pb-3 text-sm font-medium text-gray-400">Product</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Units Sold</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Revenue</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAnalytics.products.topSelling.map((product, idx) => {
                      const rating = mockAnalytics.products.ratings.find(r => r.product === product.name);
                      return (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="py-4 text-white">{product.name}</td>
                          <td className="py-4 text-gray-300">{product.units.toLocaleString()}</td>
                          <td className="py-4 text-gray-300">${product.revenue.toLocaleString()}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-white">{rating?.rating || '-'}</span>
                              <span className="text-sm text-gray-400">({rating?.reviews || 0})</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Turnover */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Inventory Performance</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {mockAnalytics.products.inventory.map((item, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{item.product}</h4>
                      <span className="text-sm text-green-400">{item.turnover}x turnover</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Current Stock: </span>
                        <span className="text-white">{item.stock} units</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">~{Math.round(365 / item.turnover)} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-8">
            {/* Customer Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">New vs Repeat</p>
                    <p className="text-2xl font-bold text-white">
                      {mockAnalytics.customers.new} / {mockAnalytics.customers.repeat}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(mockAnalytics.customers.repeat / mockAnalytics.customers.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Percent className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Retention Rate</p>
                    <p className="text-2xl font-bold text-white">{mockAnalytics.customers.retention}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Above industry average of 75%</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Customer Value</p>
                    <p className="text-2xl font-bold text-white">
                      ${Math.round(mockAnalytics.revenue.total / mockAnalytics.customers.total)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Lifetime value</p>
              </div>
            </div>

            {/* Top Buyers */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Top Buyers</h3>
              <div className="space-y-4">
                {mockAnalytics.customers.topBuyers.map((buyer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{buyer.name}</h4>
                      <p className="text-sm text-gray-400">{buyer.orders} orders placed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">${buyer.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">lifetime value</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geography Tab */}
        {activeTab === 'geography' && (
          <div className="space-y-8">
            {/* Orders by City */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Orders by City</h3>
              <div className="space-y-4">
                {mockAnalytics.geography.byCity.map((city, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">{city.city}</p>
                        <p className="text-sm text-gray-400">{city.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${city.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">
                        {Math.round((city.revenue / mockAnalytics.revenue.total) * 100)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Radius Analysis */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Delivery Radius Performance</h3>
              <div className="space-y-4">
                {mockAnalytics.geography.deliveryRadius.map((radius, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">Within {radius.distance} miles</span>
                      <span className="text-gray-400">{radius.orders} orders</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(radius.orders / mockAnalytics.orders.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketplaceAnalyticsPage() {
  return (
    <MarketplaceGate feature="analytics">
      <MarketplaceAnalyticsContent />
    </MarketplaceGate>
  );
}