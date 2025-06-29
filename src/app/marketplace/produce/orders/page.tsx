'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Clock, CheckCircle, Truck, XCircle, 
  RefreshCw, Calendar, MapPin, MessageSquare,
  DollarSign, ChevronRight, AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/marketplace-types';

const statusConfig: Record<OrderStatus, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'yellow', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'blue', icon: CheckCircle, label: 'Confirmed' },
  IN_TRANSIT: { color: 'purple', icon: Truck, label: 'In Transit' },
  DELIVERED: { color: 'green', icon: CheckCircle, label: 'Delivered' },
  CANCELLED: { color: 'red', icon: XCircle, label: 'Cancelled' },
  REFUNDED: { color: 'gray', icon: RefreshCw, label: 'Refunded' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/orders?role=${activeTab}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Orders</h1>
              <p className="text-sm text-gray-400">Manage your produce orders</p>
            </div>
            <Link
              href="/marketplace/produce"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`flex-1 px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'buyer'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Purchases
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`flex-1 px-4 py-2 rounded font-medium transition-all ${
              activeTab === 'seller'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Sales
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            All Orders
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as OrderStatus)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                statusFilter === status
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'buyer' 
                ? "You haven't placed any orders yet" 
                : "You haven't received any orders yet"}
            </p>
            <Link
              href="/marketplace/produce"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Marketplace
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const StatusIcon = statusConfig[order.status].icon;
              const statusColor = statusConfig[order.status].color;
              
              return (
                <div key={order.id} className="bg-gray-900 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          Order #{order.id.slice(-6)}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1 bg-${statusColor}-600/20 text-${statusColor}-400 rounded-full text-sm`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig[order.status].label}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-800 pt-4 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between py-2">
                        <div>
                          <p className="text-white">{item.productName}</p>
                          <p className="text-sm text-gray-400">
                            {item.quantity} {item.unit} @ ${item.pricePerUnit}/{item.unit}
                          </p>
                        </div>
                        <p className="text-white">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-start gap-6 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Truck className="w-4 h-4" />
                      <span>{order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-gray-400">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-1">{order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-3">
                      {activeTab === 'buyer' && order.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Mark as Received
                        </button>
                      )}
                      {activeTab === 'seller' && order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Confirm Order
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {activeTab === 'seller' && order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'IN_TRANSIT')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Mark as Shipped
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/marketplace/produce/orders/${order.id}`}
                        className="text-sm text-green-400 hover:text-green-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}