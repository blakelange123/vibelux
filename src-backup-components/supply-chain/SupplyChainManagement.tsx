'use client';

import React, { useState } from 'react';
import {
  Package,
  Truck,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  DollarSign,
  Warehouse,
  ShoppingCart,
  Activity,
  Users,
  Globe,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  Inventory,
  SupplyOrder,
  Shipment,
  InventoryCategory,
  OrderStatus,
  ShipmentStatus,
  Priority
} from '@/lib/supply-chain/supply-chain-types';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

export function SupplyChainManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'shipments' | 'suppliers' | 'analytics'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Sample inventory data
  const inventory: Inventory[] = [
    {
      id: 'inv-001',
      sku: 'NUT-FLO-001',
      name: 'FloraGro Nutrient Solution',
      description: 'High-performance growth phase nutrient',
      category: InventoryCategory.Nutrients,
      type: 'Stockable',
      unit: 'L',
      currentStock: {
        onHand: 450,
        available: 380,
        allocated: 70,
        onOrder: 200,
        inTransit: 0,
        quarantine: 0,
        damaged: 0,
        total: 450,
        reorderPoint: 300,
        safetyStock: 100,
        maxStock: 800
      },
      movements: [],
      locations: [
        {
          warehouseId: 'wh-001',
          zone: 'A',
          bin: 'A-12-3',
          quantity: 450,
          status: 'Active',
          lastCounted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ],
      costs: {
        unitCost: 24.50,
        averageCost: 23.75,
        lastCost: 24.50,
        standardCost: 23.00,
        totalValue: 11025,
        currency: 'USD',
        lastUpdated: new Date()
      },
      specifications: [
        { attribute: 'NPK Ratio', value: '2-1-6', critical: true },
        { attribute: 'pH', value: '5.5-6.5', critical: true }
      ],
      certifications: [
        {
          type: 'OMRI Listed',
          number: 'OMRI-2024-001',
          issuedBy: 'OMRI',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 'inv-002',
      sku: 'MED-RW-4IN',
      name: 'Rockwool Cubes 4"',
      description: 'Premium growing medium cubes',
      category: InventoryCategory.GrowingMedia,
      type: 'Batch',
      unit: 'Each',
      currentStock: {
        onHand: 2400,
        available: 2100,
        allocated: 300,
        onOrder: 0,
        inTransit: 500,
        quarantine: 0,
        damaged: 20,
        total: 2400,
        reorderPoint: 1000,
        safetyStock: 500,
        maxStock: 5000
      },
      movements: [],
      locations: [
        {
          warehouseId: 'wh-001',
          zone: 'B',
          bin: 'B-05-2',
          quantity: 2400,
          status: 'Active',
          lastCounted: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        }
      ],
      costs: {
        unitCost: 0.85,
        averageCost: 0.82,
        lastCost: 0.85,
        standardCost: 0.80,
        totalValue: 2040,
        currency: 'USD',
        lastUpdated: new Date()
      },
      specifications: [
        { attribute: 'Size', value: '4x4x4 inches', critical: true },
        { attribute: 'Density', value: '60 kg/m³', critical: false }
      ],
      certifications: [],
      batchTracking: [
        {
          batchNumber: 'RW-2024-03-001',
          manufacturingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          quantity: 1200,
          location: 'B-05-2',
          qualityStatus: 'Passed'
        },
        {
          batchNumber: 'RW-2024-03-002',
          manufacturingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          quantity: 1200,
          location: 'B-05-2',
          qualityStatus: 'Passed'
        }
      ]
    }
  ];

  // Sample orders
  const orders: SupplyOrder[] = [
    {
      id: 'so-001',
      orderNumber: 'PO-2024-0567',
      type: 'Replenishment',
      status: OrderStatus.InTransit,
      supplier: {
        id: 'sup-001',
        name: 'Advanced Nutrients Co.',
        code: 'AN-001'
      },
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          lineNumber: 1,
          productId: 'inv-001',
          sku: 'NUT-FLO-001',
          description: 'FloraGro Nutrient Solution',
          quantity: 200,
          unit: 'L',
          unitPrice: 24.50,
          total: 4900
        }
      ],
      shipping: {
        method: 'Ground',
        carrier: 'FedEx',
        service: 'FedEx Ground',
        instructions: 'Deliver to receiving dock'
      },
      costs: {
        subtotal: 4900,
        shipping: 125,
        tax: 392,
        discount: 0,
        other: 0,
        total: 5417,
        currency: 'USD'
      },
      tracking: {
        carrier: 'FedEx',
        trackingNumber: '7846-2910-3847',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        currentStatus: 'In Transit',
        lastUpdate: new Date(),
        events: []
      },
      documents: [],
      qualityChecks: [],
      issues: []
    },
    {
      id: 'so-002',
      orderNumber: 'PO-2024-0568',
      type: 'Emergency',
      status: OrderStatus.Submitted,
      supplier: {
        id: 'sup-002',
        name: 'Grodan Rockwool',
        code: 'GR-001'
      },
      orderDate: new Date(),
      expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      items: [
        {
          lineNumber: 1,
          productId: 'inv-002',
          sku: 'MED-RW-4IN',
          description: 'Rockwool Cubes 4"',
          quantity: 2000,
          unit: 'Each',
          unitPrice: 0.85,
          total: 1700
        }
      ],
      shipping: {
        method: 'Express',
        carrier: 'UPS',
        service: 'UPS Next Day Air',
        instructions: 'Urgent - notify on arrival'
      },
      costs: {
        subtotal: 1700,
        shipping: 250,
        tax: 156,
        discount: 0,
        other: 50,
        total: 2156,
        currency: 'USD'
      },
      tracking: {
        carrier: 'UPS',
        trackingNumber: 'Pending',
        currentStatus: 'Order Placed',
        lastUpdate: new Date(),
        events: []
      },
      documents: [],
      qualityChecks: [],
      issues: []
    }
  ];

  // Sample shipments
  const shipments: Shipment[] = [
    {
      id: 'sh-001',
      shipmentNumber: 'SHP-2024-0234',
      origin: {
        type: 'Supplier',
        id: 'sup-001',
        name: 'Advanced Nutrients Co.',
        address: {
          type: 'shipping',
          street1: '123 Industrial Way',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        }
      },
      destination: {
        type: 'Warehouse',
        id: 'wh-001',
        name: 'Main Distribution Center',
        address: {
          type: 'shipping',
          street1: '456 Grow Avenue',
          city: 'Denver',
          state: 'CO',
          postalCode: '80201',
          country: 'USA'
        }
      },
      carrier: {
        name: 'FedEx',
        service: 'FedEx Ground',
        contact: {
          name: 'FedEx Support',
          email: 'support@fedex.com',
          phone: '1-800-GOFEDEX',
          title: 'Customer Service'
        }
      },
      status: ShipmentStatus.InTransit,
      items: [
        {
          productId: 'inv-001',
          quantity: 200,
          unit: 'L',
          weight: 200,
          pallets: 2
        }
      ],
      tracking: {
        currentLocation: 'Phoenix, AZ',
        currentStatus: ShipmentStatus.InTransit,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        events: [
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            location: 'Los Angeles, CA',
            status: 'Picked up',
            description: 'Package picked up by FedEx'
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            location: 'Phoenix, AZ',
            status: 'In transit',
            description: 'Package in transit to destination'
          }
        ],
        milestones: [],
        alerts: []
      },
      documents: [],
      security: {
        inspections: [],
        sealNumber: 'SEAL-123456',
        sealIntact: true
      },
      costs: {
        freight: 125,
        insurance: 25,
        handling: 0,
        other: 0,
        total: 150,
        currency: 'USD'
      },
      timeline: {
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        pickedUp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        inTransit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedTransitTime: 120,
        actualTransitTime: 48
      }
    }
  ];

  // Calculate metrics
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.costs.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.currentStock.available <= item.currentStock.reorderPoint).length;
  const activeOrders = orders.filter(o => o.status !== OrderStatus.Delivered && o.status !== OrderStatus.Cancelled).length;
  const shipmentsInTransit = shipments.filter(s => s.status === ShipmentStatus.InTransit).length;

  // Sample data for charts
  const inventoryTurnoverData = [
    { month: 'Jan', turnover: 4.2 },
    { month: 'Feb', turnover: 4.5 },
    { month: 'Mar', turnover: 4.1 },
    { month: 'Apr', turnover: 4.8 }
  ];

  const categoryDistribution = [
    { name: 'Nutrients', value: 35, color: '#10B981' },
    { name: 'Growing Media', value: 25, color: '#3B82F6' },
    { name: 'Packaging', value: 15, color: '#F59E0B' },
    { name: 'Supplies', value: 15, color: '#8B5CF6' },
    { name: 'Other', value: 10, color: '#6B7280' }
  ];

  const demandForecastData = [
    { week: 'W1', actual: 850, forecast: 820 },
    { week: 'W2', actual: 920, forecast: 900 },
    { week: 'W3', actual: 880, forecast: 890 },
    { week: 'W4', actual: null, forecast: 910 },
    { week: 'W5', actual: null, forecast: 950 },
    { week: 'W6', actual: null, forecast: 920 }
  ];

  const getStatusColor = (status: OrderStatus | ShipmentStatus) => {
    switch (status) {
      case OrderStatus.Delivered:
      case ShipmentStatus.Delivered:
        return 'text-green-400 bg-green-900/20';
      case OrderStatus.InTransit:
      case ShipmentStatus.InTransit:
        return 'text-blue-400 bg-blue-900/20';
      case OrderStatus.Confirmed:
        return 'text-purple-400 bg-purple-900/20';
      case OrderStatus.Submitted:
        return 'text-yellow-400 bg-yellow-900/20';
      case ShipmentStatus.Delayed:
        return 'text-orange-400 bg-orange-900/20';
      case OrderStatus.Cancelled:
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Critical: return 'text-red-400';
      case Priority.Urgent: return 'text-orange-400';
      case Priority.High: return 'text-yellow-400';
      case Priority.Medium: return 'text-blue-400';
      case Priority.Low: return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Supply Chain Management</h2>
          <p className="text-gray-400">End-to-end inventory and logistics tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4 mr-2 inline" />
            New Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'inventory', 'orders', 'shipments', 'suppliers', 'analytics'].map((tab) => (
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
                <span className="text-gray-400">Inventory Value</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalInventoryValue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Across all locations</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Low Stock Items</span>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{lowStockItems}</p>
              <p className="text-sm text-gray-500 mt-1">Need reordering</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Active Orders</span>
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{activeOrders}</p>
              <p className="text-sm text-gray-500 mt-1">In progress</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">In Transit</span>
                <Truck className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{shipmentsInTransit}</p>
              <p className="text-sm text-gray-500 mt-1">Shipments</p>
            </div>
          </div>

          {/* Supply Chain Flow */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Supply Chain Flow</h3>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white font-medium">Suppliers</p>
                <p className="text-sm text-gray-400">12 Active</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShoppingCart className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-white font-medium">Orders</p>
                <p className="text-sm text-gray-400">{activeOrders} Active</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-white font-medium">Shipments</p>
                <p className="text-sm text-gray-400">{shipmentsInTransit} In Transit</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Warehouse className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-white font-medium">Warehouse</p>
                <p className="text-sm text-gray-400">3 Locations</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-white font-medium">Production</p>
                <p className="text-sm text-gray-400">Ready</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Inventory Turnover</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryTurnoverData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="turnover" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Inventory by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
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
                placeholder="Search inventory..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              {Object.values(InventoryCategory).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock Levels</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const stockPercentage = (item.currentStock.available / item.currentStock.maxStock) * 100;
                  const needsReorder = item.currentStock.available <= item.currentStock.reorderPoint;

                  return (
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white">{item.currentStock.available}</span>
                            <span className="text-gray-400">/ {item.currentStock.maxStock} {item.unit}</span>
                          </div>
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                stockPercentage > 50 ? 'bg-green-500' :
                                stockPercentage > 25 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.locations.map((loc, idx) => (
                          <p key={idx} className="text-sm text-gray-300">
                            {loc.zone}-{loc.bin}
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-white">${item.costs.totalValue.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {needsReorder ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-900/20 text-yellow-400">
                            <AlertTriangle className="w-3 h-3" />
                            Reorder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-900/20 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <Info className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          {/* Active Orders */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.type === 'Emergency' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/20 text-red-400">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{order.supplier.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${order.costs.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Total Value</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">Order Date</p>
                    <p className="text-white">{order.orderDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Expected Delivery</p>
                    <p className="text-white">{order.expectedDelivery.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="text-white">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Shipping</p>
                    <p className="text-white">{order.shipping.method}</p>
                  </div>
                </div>

                {order.tracking.trackingNumber !== 'Pending' && (
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Tracking</p>
                      <p className="text-white">{order.tracking.trackingNumber}</p>
                    </div>
                    <span className="text-sm text-gray-400">{order.tracking.currentStatus}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Supply Chain Analytics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Demand Forecast</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demandForecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Inventory Accuracy</p>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Order Fill Rate</p>
                    <p className="text-2xl font-bold text-white">96.2%</p>
                  </div>
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">On-Time Delivery</p>
                    <p className="text-2xl font-bold text-white">94.8%</p>
                  </div>
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Stockout Rate</p>
                    <p className="text-2xl font-bold text-white">2.1%</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Supply Chain Cost Analysis</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-white">$45.2K</p>
                <p className="text-sm text-gray-400">Procurement</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xl font-bold text-white">$8.7K</p>
                <p className="text-sm text-gray-400">Transportation</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Warehouse className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-white">$12.3K</p>
                <p className="text-sm text-gray-400">Warehousing</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-xl font-bold text-white">$6.5K</p>
                <p className="text-sm text-gray-400">Inventory Holding</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-xl font-bold text-white">$2.1K</p>
                <p className="text-sm text-gray-400">Stockout Cost</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}