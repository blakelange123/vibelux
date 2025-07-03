'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Star,
  Shield,
  BarChart3,
  Calendar,
  Download,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Percent,
  Award
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VendorStats {
  totalSales: number;
  platformFees: number;
  netEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  rating: number;
  reviewCount: number;
  loyaltyDiscount: number;
}

export function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats>({
    totalSales: 125430,
    platformFees: 18814.50,
    netEarnings: 106615.50,
    totalOrders: 87,
    averageOrderValue: 1441.72,
    conversionRate: 12.3,
    rating: 4.8,
    reviewCount: 67,
    loyaltyDiscount: 0.02 // 2% discount for high volume
  });

  const [salesData, setSalesData] = useState([
    { month: 'Jan', sales: 15240, orders: 12 },
    { month: 'Feb', sales: 18930, orders: 15 },
    { month: 'Mar', sales: 22150, orders: 18 },
    { month: 'Apr', sales: 19870, orders: 14 },
    { month: 'May', sales: 24580, orders: 20 },
    { month: 'Jun', sales: 24660, orders: 8 }
  ]);

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ORD-123456',
      customer: 'Green Valley Farms',
      amount: 2480,
      status: 'processing',
      date: new Date(Date.now() - 3600000)
    },
    {
      id: 'ORD-123455',
      customer: 'Urban Grow Co.',
      amount: 1890,
      status: 'shipped',
      date: new Date(Date.now() - 86400000)
    }
  ]);

  const effectiveFeeRate = 0.15 - stats.loyaltyDiscount; // 15% minus loyalty discount

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-gray-400">Monitor your sales and grow your business</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Platform Benefits Alert */}
      <div className="mb-6 p-4 bg-green-900/20 border border-green-600 rounded-xl">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-300 mb-1">
              You've earned a 2% loyalty discount on platform fees!
            </h3>
            <p className="text-sm text-green-200">
              Your high sales volume qualifies you for reduced fees. Effective rate: {(effectiveFeeRate * 100).toFixed(0)}% (down from 15%)
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Sales</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-1">+15% from last month</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Net Earnings</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">${stats.netEarnings.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">After fees</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Platform Fees</span>
            <Percent className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">${stats.platformFees.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-1">
            {(effectiveFeeRate * 100).toFixed(0)}% rate
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Order</span>
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(0)}</div>
          <div className="text-sm text-gray-400 mt-1">{stats.totalOrders} orders</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Benefits</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium">Payment Protection</p>
                  <p className="text-sm text-gray-400">Guaranteed payments</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium">10,000+ Buyers</p>
                  <p className="text-sm text-gray-400">Verified customers</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-medium">Analytics & Insights</p>
                  <p className="text-sm text-gray-400">Track performance</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="font-medium">Fast Payments</p>
                  <p className="text-sm text-gray-400">2-day deposits</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button className="text-purple-400 hover:text-purple-300 text-sm">
            View All Orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Platform Fee</th>
                <th className="pb-3">Your Earnings</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => {
                const fee = order.amount * effectiveFeeRate;
                const earnings = order.amount - fee;
                
                return (
                  <tr key={order.id} className="border-b border-gray-800">
                    <td className="py-3 font-mono text-sm">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">${order.amount.toLocaleString()}</td>
                    <td className="py-3 text-orange-400">${fee.toFixed(2)}</td>
                    <td className="py-3 text-green-400">${earnings.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'processing' 
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-400">
                      {order.date.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why Stay On Platform */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold mb-4">Why Vibelux Marketplace?</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-purple-300">Platform Benefits</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Access to 10,000+ verified buyers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Guaranteed payment protection</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Built-in marketing & promotion tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Automated tax calculation & reporting</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-purple-300">Risks of Off-Platform Deals</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>No payment protection or guarantees</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Account suspension & loss of access</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>No dispute resolution support</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Loss of loyalty discounts & benefits</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-center">
            <span className="font-medium text-green-400">You're saving ${(stats.totalSales * stats.loyaltyDiscount).toFixed(2)}</span> in fees this month with your loyalty discount!
          </p>
        </div>
      </div>
    </div>
  );
}