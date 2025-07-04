'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  FileText,
  Package,
  Truck,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Send,
  Edit,
  Copy,
  MoreVertical,
  Calendar,
  Building2,
  User,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  PurchaseOrder, 
  POStatus, 
  POType,
  Vendor,
  VendorStatus,
  Priority
} from '@/lib/purchasing/purchase-types';

export function PurchaseOrderManagement() {
  const [activeTab, setActiveTab] = useState<'orders' | 'vendors' | 'requisitions' | 'analytics'>('orders');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePO, setShowCreatePO] = useState(false);

  // Sample data
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-001',
      poNumber: 'PO-2024-0234',
      vendor: {
        id: 'v-001',
        name: 'Advanced Nutrients Co.',
        code: 'AN-001'
      },
      status: POStatus.Approved,
      type: POType.Standard,
      requestedBy: 'John Smith',
      approvedBy: 'Sarah Johnson',
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      deliveryLocation: 'Warehouse A',
      items: [
        {
          lineNumber: 1,
          itemType: 'product',
          itemCode: 'NUT-001',
          description: 'Flora Grow Nutrient Solution',
          category: 'Nutrients',
          quantity: 50,
          unit: 'gallons',
          unitPrice: 45.99,
          discount: 0,
          tax: 0.08,
          total: 2483.46,
          receivedQuantity: 0,
          invoicedQuantity: 0
        },
        {
          lineNumber: 2,
          itemType: 'product',
          itemCode: 'PH-001',
          description: 'pH Down Solution',
          category: 'Nutrients',
          quantity: 20,
          unit: 'liters',
          unitPrice: 12.50,
          discount: 0,
          tax: 0.08,
          total: 270.00,
          receivedQuantity: 0,
          invoicedQuantity: 0
        }
      ],
      subtotal: 2549.50,
      tax: 203.96,
      shipping: 0,
      discount: 0,
      total: 2753.46,
      currency: 'USD',
      paymentTerms: 'Net 30',
      attachments: [],
      approvalHistory: [
        {
          stepNumber: 1,
          approverRole: 'Manager',
          approver: 'Sarah Johnson',
          status: 'Approved',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          comments: 'Approved for standard nutrient restock'
        }
      ],
      deliveryStatus: {
        status: 'Pending'
      },
      invoiceStatus: POStatus.Draft
    },
    {
      id: 'po-002',
      poNumber: 'PO-2024-0235',
      vendor: {
        id: 'v-002',
        name: 'GrowTech Equipment',
        code: 'GT-002'
      },
      status: POStatus.Sent,
      type: POType.Emergency,
      requestedBy: 'Mike Chen',
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      deliveryLocation: 'Flower Room B',
      items: [
        {
          lineNumber: 1,
          itemType: 'product',
          itemCode: 'PUMP-003',
          description: 'Dosing Pump Replacement',
          category: 'Equipment',
          quantity: 2,
          unit: 'units',
          unitPrice: 450.00,
          discount: 0,
          tax: 0.08,
          total: 972.00,
          receivedQuantity: 0,
          invoicedQuantity: 0
        }
      ],
      subtotal: 900.00,
      tax: 72.00,
      shipping: 50.00,
      discount: 0,
      total: 1022.00,
      currency: 'USD',
      paymentTerms: 'Due on Receipt',
      attachments: [],
      approvalHistory: [],
      deliveryStatus: {
        status: 'Pending'
      },
      invoiceStatus: POStatus.Draft
    }
  ];

  const vendors: Vendor[] = [
    {
      id: 'v-001',
      name: 'Advanced Nutrients Co.',
      code: 'AN-001',
      status: VendorStatus.Active,
      category: 'Nutrients',
      contacts: [
        {
          name: 'James Wilson',
          title: 'Sales Manager',
          email: 'james@advancednutrients.com',
          phone: '555-0123',
          isPrimary: true
        }
      ],
      addresses: [
        {
          type: 'both',
          street1: '123 Industrial Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
          isDefault: true
        }
      ],
      paymentTerms: {
        termCode: 'NET30',
        description: 'Net 30 Days',
        netDays: 30
      },
      currency: 'USD',
      taxId: '12-3456789',
      certifications: [],
      documents: [],
      bankDetails: {
        bankName: 'Chase Bank',
        accountName: 'Advanced Nutrients Co.',
        accountNumber: '****1234',
        routingNumber: '123456789'
      },
      rating: {
        overall: 4.5,
        quality: 4.7,
        delivery: 4.3,
        price: 4.2,
        service: 4.6,
        compliance: 5.0,
        reviewCount: 24,
        lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      compliance: {
        isCompliant: true,
        licenses: [],
        insurance: [],
        violations: []
      },
      createdDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  const getStatusColor = (status: POStatus) => {
    switch (status) {
      case POStatus.Draft: return 'text-gray-400 bg-gray-900/20';
      case POStatus.PendingApproval: return 'text-yellow-400 bg-yellow-900/20';
      case POStatus.Approved: return 'text-green-400 bg-green-900/20';
      case POStatus.Sent: return 'text-blue-400 bg-blue-900/20';
      case POStatus.Acknowledged: return 'text-purple-400 bg-purple-900/20';
      case POStatus.PartiallyDelivered: return 'text-orange-400 bg-orange-900/20';
      case POStatus.Delivered: return 'text-green-400 bg-green-900/20';
      case POStatus.Completed: return 'text-gray-400 bg-gray-900/20';
      case POStatus.Cancelled: return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: POStatus) => {
    switch (status) {
      case POStatus.Draft: return <FileText className="w-4 h-4" />;
      case POStatus.PendingApproval: return <Clock className="w-4 h-4" />;
      case POStatus.Approved: return <CheckCircle className="w-4 h-4" />;
      case POStatus.Sent: return <Send className="w-4 h-4" />;
      case POStatus.Delivered: return <Package className="w-4 h-4" />;
      case POStatus.Cancelled: return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (type: POType) => {
    if (type === POType.Emergency) return 'text-red-400';
    if (type === POType.Planned) return 'text-blue-400';
    return 'text-gray-400';
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesStatus = selectedStatus === 'all' || po.status === selectedStatus;
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);
  const pendingPOs = purchaseOrders.filter(po => po.status === POStatus.PendingApproval).length;
  const overdueDeliveries = purchaseOrders.filter(po => 
    po.expectedDelivery < new Date() && 
    po.status !== POStatus.Delivered && 
    po.status !== POStatus.Completed
  ).length;
  const activeVendors = vendors.filter(v => v.status === VendorStatus.Active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Purchase Order Management</h2>
          <p className="text-gray-400">Manage vendors, orders, and procurement</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
          <button 
            onClick={() => setShowCreatePO(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Create PO
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['orders', 'vendors', 'requisitions', 'analytics'].map((tab) => (
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

      {activeTab === 'orders' && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total PO Value</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalPOValue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Active Orders</span>
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{purchaseOrders.length}</p>
              <p className="text-sm text-gray-500 mt-1">{pendingPOs} pending approval</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Overdue</span>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{overdueDeliveries}</p>
              <p className="text-sm text-gray-500 mt-1">Deliveries overdue</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Vendors</span>
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{activeVendors}</p>
              <p className="text-sm text-gray-500 mt-1">Active vendors</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PO number or vendor..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              {Object.values(POStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Purchase Orders Table */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">PO Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Vendor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Expected</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-white">{po.poNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{po.vendor.name}</p>
                        <p className="text-sm text-gray-400">{po.vendor.code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">${po.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">{po.items.length} items</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(po.status)}`}>
                        {getStatusIcon(po.status)}
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${getPriorityColor(po.type)}`}>
                        {po.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {po.expectedDelivery.toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
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

      {activeTab === 'vendors' && (
        <>
          {/* Vendor List */}
          <div className="grid grid-cols-1 gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">{vendor.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        vendor.status === VendorStatus.Active 
                          ? 'bg-green-900/20 text-green-400' 
                          : 'bg-gray-900/20 text-gray-400'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Category</p>
                        <p className="text-white">{vendor.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment Terms</p>
                        <p className="text-white">{vendor.paymentTerms.description}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rating</p>
                        <div className="flex items-center gap-1">
                          <span className="text-white">{vendor.rating.overall.toFixed(1)}</span>
                          <span className="text-yellow-400">★</span>
                          <span className="text-gray-400">({vendor.rating.reviewCount})</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Last Activity</p>
                        <p className="text-white">{vendor.lastActivity.toLocaleDateString()}</p>
                      </div>
                    </div>
                    {vendor.contacts[0] && (
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{vendor.contacts[0].name}</span>
                        </div>
                        <span>•</span>
                        <span>{vendor.contacts[0].email}</span>
                        <span>•</span>
                        <span>{vendor.contacts[0].phone}</span>
                      </div>
                    )}
                  </div>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Purchase Analytics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {['Nutrients', 'Equipment', 'Media', 'Supplies'].map((category) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300">{category}</span>
                      <span className="text-white font-medium">$12,450</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Vendor Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">On-Time Delivery</p>
                    <p className="text-2xl font-bold text-white">94%</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Quality Score</p>
                    <p className="text-2xl font-bold text-white">4.6/5</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Cost Savings</p>
                    <p className="text-2xl font-bold text-white">$8,234</p>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}