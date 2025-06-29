'use client';

import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  RefreshCw,
  Upload,
  Download,
  Eye,
  Edit,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Info,
  Activity,
  Database,
  Zap
} from 'lucide-react';
import { 
  Inventory,
  InventoryMovement,
  StockLevel,
  MovementType,
  BatchInfo,
  ExpiryInfo,
  InventoryCategory
} from '@/lib/supply-chain/supply-chain-types';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryTrackingProps {
  inventory: Inventory[];
  onUpdateStock: (itemId: string, movement: InventoryMovement) => void;
  onTransfer: (itemId: string, fromLocation: string, toLocation: string, quantity: number) => void;
}

export function InventoryTracking({ inventory, onUpdateStock, onTransfer }: InventoryTrackingProps) {
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'count'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !showLowStock || item.currentStock.available <= item.currentStock.reorderPoint;
    const matchesExpiring = !showExpiring || (item.expiryTracking && isExpiringSoon(item.expiryTracking));
    
    return matchesSearch && matchesCategory && matchesLowStock && matchesExpiring;
  });

  const isExpiringSoon = (expiry: ExpiryInfo): boolean => {
    if (!expiry.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((expiry.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= expiry.alertDays;
  };

  const getStockStatus = (stock: StockLevel) => {
    const percentage = (stock.available / stock.maxStock) * 100;
    if (stock.available <= stock.safetyStock) return { color: 'text-red-400', bg: 'bg-red-900/20', status: 'Critical' };
    if (stock.available <= stock.reorderPoint) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', status: 'Low' };
    if (percentage > 90) return { color: 'text-blue-400', bg: 'bg-blue-900/20', status: 'Overstocked' };
    return { color: 'text-green-400', bg: 'bg-green-900/20', status: 'Optimal' };
  };

  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case MovementType.Receipt: return <Plus className="w-4 h-4 text-green-400" />;
      case MovementType.Issue: return <Minus className="w-4 h-4 text-red-400" />;
      case MovementType.Transfer: return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case MovementType.Adjustment: return <Edit className="w-4 h-4 text-yellow-400" />;
      case MovementType.Return: return <RefreshCw className="w-4 h-4 text-purple-400" />;
      case MovementType.Scrap: return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleStockAdjustment = () => {
    if (!selectedItem || adjustmentQuantity === 0) return;

    let movementType: MovementType;
    let quantity = adjustmentQuantity;

    switch (adjustmentType) {
      case 'add':
        movementType = MovementType.Receipt;
        break;
      case 'remove':
        movementType = MovementType.Issue;
        quantity = -quantity;
        break;
      case 'count':
        movementType = MovementType.CycleCount;
        quantity = adjustmentQuantity - selectedItem.currentStock.onHand;
        break;
      default:
        return;
    }

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: new Date(),
      type: movementType,
      quantity: Math.abs(quantity),
      unit: selectedItem.unit,
      reference: `ADJ-${Date.now()}`,
      reason: adjustmentReason,
      performedBy: 'Current User',
      cost: selectedItem.costs.unitCost * Math.abs(quantity)
    };

    onUpdateStock(selectedItem.id, movement);
    setShowAdjustmentModal(false);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
  };

  // Calculate metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.currentStock.available <= item.currentStock.reorderPoint).length;
  const expiringItems = inventory.filter(item => item.expiryTracking && isExpiringSoon(item.expiryTracking)).length;
  const totalValue = inventory.reduce((sum, item) => sum + item.costs.totalValue, 0);

  // Sample movement history data
  const movementData = [
    { date: 'Mon', receipts: 250, issues: 180, net: 70 },
    { date: 'Tue', receipts: 320, issues: 290, net: 30 },
    { date: 'Wed', receipts: 180, issues: 220, net: -40 },
    { date: 'Thu', receipts: 400, issues: 350, net: 50 },
    { date: 'Fri', receipts: 280, issues: 260, net: 20 },
    { date: 'Sat', receipts: 150, issues: 140, net: 10 },
    { date: 'Sun', receipts: 100, issues: 80, net: 20 }
  ];

  // Value trend data
  const valueTrendData = [
    { week: 'W1', value: 125000 },
    { week: 'W2', value: 132000 },
    { week: 'W3', value: 128000 },
    { week: 'W4', value: 135000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalItems}</p>
          <p className="text-xs text-gray-400">SKUs</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-yellow-400">Action needed</span>
          </div>
          <p className="text-2xl font-bold text-white">{lowStockItems}</p>
          <p className="text-xs text-gray-400">Low Stock</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-orange-400">Attention</span>
          </div>
          <p className="text-2xl font-bold text-white">{expiringItems}</p>
          <p className="text-xs text-gray-400">Expiring Soon</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">${(totalValue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-400">Inventory Value</p>
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
            placeholder="Search inventory by name or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Categories</option>
          {Object.values(InventoryCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showLowStock 
              ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-600/30' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Low Stock
        </button>
        <button
          onClick={() => setShowExpiring(!showExpiring)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showExpiring 
              ? 'bg-orange-900/20 text-orange-400 border border-orange-600/30' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Expiring
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Inventory List */}
        <div className="col-span-2 space-y-4">
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.currentStock);
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-gray-900 rounded-lg p-4 border cursor-pointer transition-all ${
                  isSelected ? 'border-purple-600' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">SKU</p>
                        <p className="text-gray-300">{item.sku}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Available</p>
                        <p className="text-white font-medium">
                          {item.currentStock.available} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Location</p>
                        <p className="text-gray-300">
                          {item.locations[0]?.zone}-{item.locations[0]?.bin}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Value</p>
                        <p className="text-white">${item.costs.totalValue.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Stock Level</span>
                        <span>{((item.currentStock.available / item.currentStock.maxStock) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`absolute top-0 left-0 h-2 rounded-full ${
                            item.currentStock.available <= item.currentStock.safetyStock ? 'bg-red-500' :
                            item.currentStock.available <= item.currentStock.reorderPoint ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(item.currentStock.available / item.currentStock.maxStock) * 100}%` }}
                        />
                        <div 
                          className="absolute top-0 h-2 w-0.5 bg-yellow-400"
                          style={{ left: `${(item.currentStock.reorderPoint / item.currentStock.maxStock) * 100}%` }}
                          title="Reorder Point"
                        />
                        <div 
                          className="absolute top-0 h-2 w-0.5 bg-red-400"
                          style={{ left: `${(item.currentStock.safetyStock / item.currentStock.maxStock) * 100}%` }}
                          title="Safety Stock"
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      {item.currentStock.onOrder > 0 && (
                        <div className="flex items-center gap-1 text-blue-400">
                          <Package className="w-3 h-3" />
                          <span>{item.currentStock.onOrder} on order</span>
                        </div>
                      )}
                      {item.currentStock.allocated > 0 && (
                        <div className="flex items-center gap-1 text-purple-400">
                          <Database className="w-3 h-3" />
                          <span>{item.currentStock.allocated} allocated</span>
                        </div>
                      )}
                      {item.expiryTracking && item.expiryTracking.expiryDate && (
                        <div className={`flex items-center gap-1 ${
                          isExpiringSoon(item.expiryTracking) ? 'text-orange-400' : 'text-gray-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>Expires {item.expiryTracking.expiryDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Item Details */}
        <div className="col-span-1">
          {selectedItem ? (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Item Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => {
                    setAdjustmentType('add');
                    setShowAdjustmentModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-green-900/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-900/30 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add
                </button>
                <button
                  onClick={() => {
                    setAdjustmentType('remove');
                    setShowAdjustmentModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-red-900/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-900/30 transition-colors"
                >
                  <Minus className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
                <button
                  onClick={() => {
                    setAdjustmentType('count');
                    setShowAdjustmentModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-900/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-900/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Count
                </button>
              </div>

              {/* Stock Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Stock Levels</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">On Hand</span>
                      <span className="text-white font-medium">{selectedItem.currentStock.onHand}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Available</span>
                      <span className="text-white font-medium">{selectedItem.currentStock.available}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Allocated</span>
                      <span className="text-yellow-400">{selectedItem.currentStock.allocated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">On Order</span>
                      <span className="text-blue-400">{selectedItem.currentStock.onOrder}</span>
                    </div>
                    {selectedItem.currentStock.quarantine > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Quarantine</span>
                        <span className="text-orange-400">{selectedItem.currentStock.quarantine}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Reorder Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Reorder Point</span>
                      <span className="text-white">{selectedItem.currentStock.reorderPoint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Safety Stock</span>
                      <span className="text-white">{selectedItem.currentStock.safetyStock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Max Stock</span>
                      <span className="text-white">{selectedItem.currentStock.maxStock}</span>
                    </div>
                  </div>
                </div>

                {/* Batch Information */}
                {selectedItem.batchTracking && selectedItem.batchTracking.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Batch Information</h4>
                    <div className="space-y-2">
                      {selectedItem.batchTracking.slice(0, 3).map((batch, idx) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{batch.batchNumber}</span>
                            <span className="text-gray-400">{batch.quantity} units</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Mfg: {batch.manufacturingDate.toLocaleDateString()}
                            {batch.expiryDate && ` • Exp: ${batch.expiryDate.toLocaleDateString()}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Cost Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Unit Cost</span>
                      <span className="text-white">${selectedItem.costs.unitCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Average Cost</span>
                      <span className="text-white">${selectedItem.costs.averageCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Total Value</span>
                      <span className="text-green-400 font-medium">${selectedItem.costs.totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Select an item to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Movement Analytics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Movement History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                <Bar dataKey="receipts" fill="#10B981" name="Receipts" />
                <Bar dataKey="issues" fill="#EF4444" name="Issues" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Inventory Value Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={valueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              {adjustmentType === 'add' && 'Add Stock'}
              {adjustmentType === 'remove' && 'Remove Stock'}
              {adjustmentType === 'count' && 'Cycle Count'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Item</label>
                <p className="text-white">{selectedItem.name} ({selectedItem.sku})</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {adjustmentType === 'count' ? 'Counted Quantity' : 'Quantity'}
                </label>
                <input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  min="0"
                />
                {adjustmentType === 'count' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current on-hand: {selectedItem.currentStock.onHand} {selectedItem.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reason</label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                  rows={3}
                  placeholder="Enter reason for adjustment..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustmentModal(false);
                    setAdjustmentQuantity(0);
                    setAdjustmentReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={adjustmentQuantity === 0 || !adjustmentReason}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    adjustmentQuantity === 0 || !adjustmentReason
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}