'use client';

import React, { useState } from 'react';
import { MarketplaceGate } from '@/components/marketplace/MarketplaceGate';
import Link from 'next/link';
import { 
  ArrowLeft, Users, Star, MapPin, Package, DollarSign,
  MessageSquare, Calendar, TrendingUp, Filter, Search,
  Building2, Truck, Clock, CheckCircle, AlertCircle,
  Mail, Phone, Globe, Plus
} from 'lucide-react';

interface BuyerProfile {
  id: string;
  businessName: string;
  businessType: 'restaurant' | 'grocery' | 'distributor' | 'foodservice' | 'other';
  contact: {
    name: string;
    email: string;
    phone: string;
    website?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderHistory: {
    totalOrders: number;
    totalRevenue: number;
    lastOrder: Date;
    averageOrderValue: number;
    favoriteProducts: string[];
  };
  preferences: {
    preferredDeliveryDays: string[];
    certifications: string[];
    volumeNeeds: 'small' | 'medium' | 'large' | 'enterprise';
    paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60';
  };
  relationship: {
    status: 'active' | 'inactive' | 'pending' | 'vip';
    rating: number;
    notes: string;
    tags: string[];
  };
}

const mockBuyers: BuyerProfile[] = [
  {
    id: '1',
    businessName: 'Fresh Kitchen Restaurant',
    businessType: 'restaurant',
    contact: {
      name: 'John Smith',
      email: 'john@freshkitchen.com',
      phone: '(415) 555-0123',
      website: 'freshkitchen.com'
    },
    location: {
      address: '123 Market St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    orderHistory: {
      totalOrders: 124,
      totalRevenue: 45280,
      lastOrder: new Date('2024-01-18'),
      averageOrderValue: 365,
      favoriteProducts: ['Buttercrunch Lettuce', 'Cherry Tomatoes', 'Fresh Basil']
    },
    preferences: {
      preferredDeliveryDays: ['Monday', 'Thursday'],
      certifications: ['USDA Organic', 'GAP Certified'],
      volumeNeeds: 'medium',
      paymentTerms: 'net30'
    },
    relationship: {
      status: 'vip',
      rating: 5,
      notes: 'Excellent customer, always pays on time. Prefers morning deliveries.',
      tags: ['premium', 'recurring', 'farm-to-table']
    }
  },
  {
    id: '2',
    businessName: 'Green Grocer Market',
    businessType: 'grocery',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@greengrocer.com',
      phone: '(510) 555-0456'
    },
    location: {
      address: '456 Broadway',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612'
    },
    orderHistory: {
      totalOrders: 98,
      totalRevenue: 38500,
      lastOrder: new Date('2024-01-20'),
      averageOrderValue: 393,
      favoriteProducts: ['Mixed Greens', 'Herbs', 'Microgreens']
    },
    preferences: {
      preferredDeliveryDays: ['Tuesday', 'Friday'],
      certifications: ['Non-GMO Project'],
      volumeNeeds: 'large',
      paymentTerms: 'net15'
    },
    relationship: {
      status: 'active',
      rating: 4.5,
      notes: 'Growing account, interested in exclusive varieties',
      tags: ['organic', 'local-focused']
    }
  }
];

const businessTypeIcons = {
  restaurant: { icon: Building2, color: 'purple' },
  grocery: { icon: Building2, color: 'green' },
  distributor: { icon: Truck, color: 'blue' },
  foodservice: { icon: Users, color: 'orange' },
  other: { icon: Building2, color: 'gray' }
};

function BuyerNetworkContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'vip' | 'inactive'>('all');
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerProfile | null>(null);

  const filteredBuyers = mockBuyers.filter(buyer => {
    const matchesSearch = buyer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || buyer.relationship.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-2xl font-bold text-white">Buyer Network</h1>
              <p className="text-sm text-gray-400">Manage your customer relationships</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Add Buyer
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search buyers by name or location..."
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'vip', 'inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <Users className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-sm text-gray-400 mb-1">Total Buyers</p>
            <p className="text-3xl font-bold text-white">{mockBuyers.length}</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <Star className="w-8 h-8 text-yellow-400 mb-4" />
            <p className="text-sm text-gray-400 mb-1">VIP Customers</p>
            <p className="text-3xl font-bold text-white">
              {mockBuyers.filter(b => b.relationship.status === 'vip').length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <DollarSign className="w-8 h-8 text-green-400 mb-4" />
            <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">
              ${mockBuyers.reduce((sum, b) => sum + b.orderHistory.totalRevenue, 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
            <p className="text-sm text-gray-400 mb-1">Avg Order Value</p>
            <p className="text-3xl font-bold text-white">
              ${Math.round(mockBuyers.reduce((sum, b) => sum + b.orderHistory.averageOrderValue, 0) / mockBuyers.length)}
            </p>
          </div>
        </div>

        {/* Buyers Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredBuyers.map(buyer => {
            const TypeIcon = businessTypeIcons[buyer.businessType].icon;
            const iconColor = businessTypeIcons[buyer.businessType].color;
            
            return (
              <div key={buyer.id} className="bg-gray-900 rounded-xl p-6 hover:bg-gray-850 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${iconColor}-600/20 rounded-lg flex items-center justify-center`}>
                      <TypeIcon className={`w-6 h-6 text-${iconColor}-400`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{buyer.businessName}</h3>
                      <p className="text-sm text-gray-400 capitalize">{buyer.businessType}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {buyer.location.city}, {buyer.location.state}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    buyer.relationship.status === 'vip' ? 'bg-yellow-600/20 text-yellow-400' :
                    buyer.relationship.status === 'active' ? 'bg-green-600/20 text-green-400' :
                    buyer.relationship.status === 'pending' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {buyer.relationship.status.toUpperCase()}
                  </div>
                </div>

                {/* Order Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Orders</p>
                    <p className="text-lg font-semibold text-white">{buyer.orderHistory.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-lg font-semibold text-white">
                      ${buyer.orderHistory.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Order</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date().getTime() - buyer.orderHistory.lastOrder.getTime() < 7 * 24 * 60 * 60 * 1000
                        ? 'This week'
                        : new Date().getTime() - buyer.orderHistory.lastOrder.getTime() < 30 * 24 * 60 * 60 * 1000
                        ? 'This month'
                        : 'Older'
                      }
                    </p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="border-t border-gray-800 pt-4 mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{buyer.preferences.volumeNeeds} volume</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{buyer.preferences.paymentTerms}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {buyer.relationship.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedBuyer(buyer)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="text-sm text-green-400 hover:text-green-300">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Message Modal */}
        {selectedBuyer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">
                Message {selectedBuyer.businessName}
              </h3>
              <textarea
                className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                placeholder="Type your message..."
              />
              <div className="flex gap-3 mt-4">
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Send Message
                </button>
                <button 
                  onClick={() => setSelectedBuyer(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerNetworkPage() {
  return (
    <MarketplaceGate feature="buyers">
      <BuyerNetworkContent />
    </MarketplaceGate>
  );
}