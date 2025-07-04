'use client';

import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Plus,
  Minus,
  RefreshCw,
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  category: 'nutrients' | 'media' | 'supplies' | 'equipment' | 'safety';
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: string;
  supplier: string;
  unitCost: number;
  lastOrdered?: Date;
  lastReceived?: Date;
  expiryDate?: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: { itemId: string; quantity: number; unitCost: number }[];
  totalCost: number;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDelivery?: Date;
  receivedDate?: Date;
}

interface UsageRecord {
  itemId: string;
  quantity: number;
  date: Date;
  room: string;
  purpose: string;
  recordedBy: string;
}

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'analytics'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  // Sample inventory data
  const inventory: InventoryItem[] = [
    {
      id: 'inv-1',
      name: 'Flora Series Grow',
      category: 'nutrients',
      sku: 'FLO-GRO-1G',
      quantity: 15,
      unit: 'gallons',
      minStock: 10,
      maxStock: 50,
      reorderPoint: 20,
      location: 'Storage A - Shelf 3',
      supplier: 'General Hydroponics',
      unitCost: 45.99,
      lastOrdered: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'low-stock'
    },
    {
      id: 'inv-2',
      name: 'Rockwool Cubes 4"',
      category: 'media',
      sku: 'RW-4IN-100',
      quantity: 450,
      unit: 'pieces',
      minStock: 200,
      maxStock: 1000,
      reorderPoint: 300,
      location: 'Storage B - Rack 2',
      supplier: 'Grodan',
      unitCost: 0.85,
      lastReceived: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'in-stock'
    },
    {
      id: 'inv-3',
      name: 'pH Down Solution',
      category: 'nutrients',
      sku: 'PHD-1L',
      quantity: 3,
      unit: 'liters',
      minStock: 5,
      maxStock: 20,
      reorderPoint: 8,
      location: 'Nutrient Room',
      supplier: 'Advanced Nutrients',
      unitCost: 12.50,
      status: 'out-of-stock'
    },
    {
      id: 'inv-4',
      name: 'Nitrile Gloves L',
      category: 'safety',
      sku: 'GLV-NIT-L',
      quantity: 8,
      unit: 'boxes',
      minStock: 10,
      maxStock: 50,
      reorderPoint: 15,
      location: 'PPE Station',
      supplier: 'Safety Supply Co',
      unitCost: 15.99,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'low-stock'
    },
    {
      id: 'inv-5',
      name: 'Pruning Shears',
      category: 'supplies',
      sku: 'TOOL-PRUN-01',
      quantity: 24,
      unit: 'pieces',
      minStock: 10,
      maxStock: 30,
      reorderPoint: 15,
      location: 'Tool Cabinet',
      supplier: 'Fiskars',
      unitCost: 18.99,
      status: 'in-stock'
    }
  ];

  // Sample purchase orders
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-1',
      orderNumber: 'PO-2024-0145',
      supplier: 'General Hydroponics',
      items: [
        { itemId: 'inv-1', quantity: 25, unitCost: 45.99 },
        { itemId: 'inv-3', quantity: 10, unitCost: 12.50 }
      ],
      totalCost: 1274.75,
      status: 'shipped',
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'po-2',
      orderNumber: 'PO-2024-0144',
      supplier: 'Grodan',
      items: [
        { itemId: 'inv-2', quantity: 500, unitCost: 0.85 }
      ],
      totalCost: 425.00,
      status: 'received',
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  // Usage trend data
  const usageTrend = [
    { week: 'W1', nutrients: 45, media: 120, supplies: 35 },
    { week: 'W2', nutrients: 52, media: 115, supplies: 42 },
    { week: 'W3', nutrients: 48, media: 125, supplies: 38 },
    { week: 'W4', nutrients: 55, media: 130, supplies: 45 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-400 bg-green-900/20';
      case 'low-stock': return 'text-yellow-400 bg-yellow-900/20';
      case 'out-of-stock': return 'text-red-400 bg-red-900/20';
      case 'expired': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircle className="w-4 h-4" />;
      case 'low-stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-stock': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending' || order.status === 'ordered').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-gray-400">Track supplies, nutrients, and equipment</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Create Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'inventory', 'orders', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Value</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalInventoryValue.toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-1">Inventory worth</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Items</span>
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{inventory.length}</p>
              <p className="text-sm text-gray-500 mt-1">Unique SKUs</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Low Stock</span>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{lowStockItems}</p>
              <p className="text-sm text-gray-500 mt-1">Items need reorder</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Pending Orders</span>
                <Truck className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{pendingOrders}</p>
              <p className="text-sm text-gray-500 mt-1">In transit</p>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Critical Alerts</h3>
            <div className="space-y-3">
              {inventory
                .filter(item => item.status === 'out-of-stock' || item.status === 'low-stock')
                .slice(0, 3)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">
                          {item.quantity} {item.unit} remaining • Reorder at {item.reorderPoint}
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
                      Reorder
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Usage Trend Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Usage Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line type="monotone" dataKey="nutrients" stroke="#10B981" strokeWidth={2} name="Nutrients" />
                  <Line type="monotone" dataKey="media" stroke="#3B82F6" strokeWidth={2} name="Media" />
                  <Line type="monotone" dataKey="supplies" stroke="#F59E0B" strokeWidth={2} name="Supplies" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="nutrients">Nutrients</option>
              <option value="media">Media</option>
              <option value="supplies">Supplies</option>
              <option value="equipment">Equipment</option>
              <option value="safety">Safety</option>
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white">{item.quantity} {item.unit}</p>
                        <div className="mt-1 w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.quantity > item.reorderPoint ? 'bg-green-500' :
                              item.quantity > item.minStock ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (item.quantity / item.maxStock) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.location}</td>
                    <td className="px-4 py-3 text-white">${(item.quantity * item.unitCost).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <Minus className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          {/* Purchase Orders */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Purchase Orders</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {purchaseOrders.map((order) => (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-white">{order.orderNumber}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          order.status === 'received' ? 'bg-green-900/20 text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-900/20 text-blue-400' :
                          order.status === 'ordered' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-gray-900/20 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Supplier</p>
                          <p className="text-white">{order.supplier}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total</p>
                          <p className="text-white">${order.totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Order Date</p>
                          <p className="text-white">{order.orderDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">
                            {order.receivedDate ? 'Received' : 'Expected'}
                          </p>
                          <p className="text-white">
                            {order.receivedDate?.toLocaleDateString() || 
                             order.expectedDelivery?.toLocaleDateString() || 'TBD'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reorder */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Reorder</h3>
            <p className="text-gray-300 mb-4">
              {lowStockItems} items are below reorder point
            </p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              Generate Reorder List
            </button>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Inventory Analytics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
              <div className="space-y-3">
                {['nutrients', 'media', 'supplies', 'equipment', 'safety'].map((category) => {
                  const count = inventory.filter(i => i.category === category).length;
                  const value = inventory
                    .filter(i => i.category === category)
                    .reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 capitalize">{category}</span>
                        <span className="text-white font-medium">${value.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(value / totalInventoryValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Turnover Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Average Turnover</p>
                    <p className="text-xl font-bold text-white">4.2x</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Days of Stock</p>
                    <p className="text-xl font-bold text-white">28</p>
                  </div>
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Order Frequency</p>
                    <p className="text-xl font-bold text-white">Weekly</p>
                  </div>
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}