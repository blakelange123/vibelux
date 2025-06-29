/**
 * Order Management System for Marketplace
 * Handles order creation, status updates, and notifications
 */

import { Order, OrderStatus, OrderItem, ProduceListing } from '@/lib/marketplace-types';

export interface CreateOrderParams {
  buyerId: string;
  sellerId: string;
  items: {
    listingId: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  deliveryDate: Date;
  notes?: string;
}

export interface OrderNotification {
  type: 'email' | 'sms' | 'in_app';
  recipient: 'buyer' | 'seller' | 'both';
  template: string;
  data: Record<string, any>;
}

export class OrderManagementService {
  /**
   * Create a new order
   */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    // Calculate totals
    const subtotal = params.items.reduce((sum, item) => 
      sum + (item.quantity * item.pricePerUnit), 0
    );
    
    // Apply marketplace commission (5%)
    const commission = subtotal * 0.05;
    const sellerPayout = subtotal - commission;
    
    // Create order object
    const order: Order = {
      id: this.generateOrderId(),
      buyerId: params.buyerId,
      buyer: await this.getUserById(params.buyerId),
      sellerId: params.sellerId,
      seller: await this.getUserById(params.sellerId),
      items: params.items.map(item => ({
        id: this.generateItemId(),
        orderId: '',
        listingId: item.listingId,
        productName: '', // Will be populated from listing
        quantity: item.quantity,
        unit: '', // Will be populated from listing
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.quantity * item.pricePerUnit
      })),
      status: 'PENDING',
      totalAmount: subtotal,
      deliveryMethod: params.deliveryMethod,
      deliveryAddress: params.deliveryAddress,
      deliveryDate: params.deliveryDate,
      notes: params.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Set order ID on items
    order.items.forEach(item => item.orderId = order.id);
    
    // Send notifications
    await this.sendOrderNotifications(order, 'created');
    
    // Update inventory
    await this.updateInventory(order, 'reserve');
    
    return order;
  }
  
  /**
   * Update order status with validation
   */
  async updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus,
    userId: string
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    // Validate status transition
    if (!this.isValidStatusTransition(order.status, newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }
    
    // Validate user permissions
    if (!this.canUpdateStatus(order, newStatus, userId)) {
      throw new Error('User does not have permission to update this order status');
    }
    
    // Update status
    order.status = newStatus;
    order.updatedAt = new Date();
    
    // Handle status-specific actions
    await this.handleStatusChange(order, newStatus);
    
    // Send notifications
    await this.sendOrderNotifications(order, 'status_updated');
    
    return order;
  }
  
  /**
   * Valid status transitions
   */
  private isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: []
    };
    
    return transitions[current]?.includes(next) || false;
  }
  
  /**
   * Check if user can update order status
   */
  private canUpdateStatus(order: Order, newStatus: OrderStatus, userId: string): boolean {
    switch (newStatus) {
      case 'CONFIRMED':
      case 'IN_TRANSIT':
        return order.sellerId === userId;
      case 'DELIVERED':
        return order.buyerId === userId;
      case 'CANCELLED':
        return order.buyerId === userId || order.sellerId === userId;
      case 'REFUNDED':
        return order.sellerId === userId;
      default:
        return false;
    }
  }
  
  /**
   * Handle status-specific actions
   */
  private async handleStatusChange(order: Order, newStatus: OrderStatus): Promise<void> {
    switch (newStatus) {
      case 'CONFIRMED':
        // Lock inventory
        await this.updateInventory(order, 'confirm');
        break;
        
      case 'CANCELLED':
        // Release inventory
        await this.updateInventory(order, 'release');
        break;
        
      case 'DELIVERED':
        // Trigger payout to seller
        await this.initiatePayout(order);
        // Request rating
        await this.requestRating(order);
        break;
        
      case 'REFUNDED':
        // Process refund
        await this.processRefund(order);
        break;
    }
  }
  
  /**
   * Send order notifications
   */
  private async sendOrderNotifications(order: Order, event: string): Promise<void> {
    const notifications: OrderNotification[] = [];
    
    switch (event) {
      case 'created':
        notifications.push(
          {
            type: 'email',
            recipient: 'buyer',
            template: 'order_confirmation',
            data: { order }
          },
          {
            type: 'email',
            recipient: 'seller',
            template: 'new_order',
            data: { order }
          }
        );
        break;
        
      case 'status_updated':
        notifications.push({
          type: 'email',
          recipient: 'both',
          template: 'order_status_update',
          data: { order, status: order.status }
        });
        break;
    }
    
    // Queue notifications for sending
    await this.queueNotifications(notifications);
  }
  
  /**
   * Update inventory based on order
   */
  private async updateInventory(order: Order, action: 'reserve' | 'confirm' | 'release'): Promise<void> {
    for (const item of order.items) {
      const listing = await this.getListingById(item.listingId);
      
      switch (action) {
        case 'reserve':
          // Temporarily reduce available stock
          listing.availability.currentStock -= item.quantity;
          break;
          
        case 'confirm':
          // Inventory already reduced, just log
          break;
          
        case 'release':
          // Return stock to available
          listing.availability.currentStock += item.quantity;
          break;
      }
      
      await this.updateListing(listing);
    }
  }
  
  /**
   * Calculate order metrics
   */
  calculateOrderMetrics(orders: Order[]): {
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    topProducts: { product: string; quantity: number; revenue: number }[];
  } {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalRevenue / orders.length;
    
    // Count by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
    
    // Top products
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const current = productMap.get(item.productName) || { quantity: 0, revenue: 0 };
        productMap.set(item.productName, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.totalPrice
        });
      });
    });
    
    const topProducts = Array.from(productMap.entries())
      .map(([product, data]) => ({ product, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    return {
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      topProducts
    };
  }
  
  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }
  
  /**
   * Generate unique item ID
   */
  private generateItemId(): string {
    return `ITM-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 5)}`.toUpperCase();
  }
  
  // Mock implementations - replace with actual database calls
  private async getUserById(id: string): Promise<any> {
    return { id, name: 'User Name', email: 'user@example.com' };
  }
  
  private async getOrderById(id: string): Promise<Order> {
    throw new Error('Not implemented');
  }
  
  private async getListingById(id: string): Promise<ProduceListing> {
    throw new Error('Not implemented');
  }
  
  private async updateListing(listing: ProduceListing): Promise<void> {
  }
  
  private async queueNotifications(notifications: OrderNotification[]): Promise<void> {
  }
  
  private async initiatePayout(order: Order): Promise<void> {
  }
  
  private async requestRating(order: Order): Promise<void> {
  }
  
  private async processRefund(order: Order): Promise<void> {
  }
}

// Export singleton instance
export const orderService = new OrderManagementService();