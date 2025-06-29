/**
 * Supply Chain & Distribution Integration Service
 * Handles inventory, wholesale platforms, and distribution networks
 */

import { prisma } from '@/lib/prisma';

interface SupplyChainConfig {
  provider: 'LEAFLINK' | 'NABIS' | 'DISTRU' | 'APEX' | 'PRODUCE_PRO' | 'FAMOUS' | 'FISHBOWL';
  apiKey: string;
  accountId?: string;
  environment?: 'sandbox' | 'production';
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentTerms?: string;
  shippingAddress?: Address;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  lotNumber?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
  batchNumber?: string;
  expirationDate?: Date;
  cost: number;
  price: number;
}

export class SupplyChainIntegrationService {
  private config: SupplyChainConfig;

  constructor(config: SupplyChainConfig) {
    this.config = config;
  }

  /**
   * Fetch orders from distribution platform
   */
  async fetchOrders(startDate: Date, endDate: Date): Promise<Order[]> {
    switch (this.config.provider) {
      case 'LEAFLINK':
        return this.fetchLeafLinkOrders(startDate, endDate);
      case 'NABIS':
        return this.fetchNabisOrders(startDate, endDate);
      case 'DISTRU':
        return this.fetchDistruOrders(startDate, endDate);
      case 'APEX':
        return this.fetchApexOrders(startDate, endDate);
      case 'PRODUCE_PRO':
        return this.fetchProduceProOrders(startDate, endDate);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * LeafLink Integration (Cannabis B2B)
   */
  private async fetchLeafLinkOrders(startDate: Date, endDate: Date): Promise<Order[]> {
    const baseUrl = 'https://www.leaflink.com/api/v2';
    
    try {
      const response = await fetch(
        `${baseUrl}/orders/?created_on__gte=${startDate.toISOString()}&created_on__lte=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      return data.results.map((order: any) => ({
        id: order.id.toString(),
        orderNumber: order.number,
        customer: order.customer.name,
        orderDate: new Date(order.created_on),
        deliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
        status: this.mapLeafLinkStatus(order.status),
        items: order.line_items.map((item: any) => ({
          productId: item.product.id.toString(),
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price),
          batchNumber: item.batch?.number,
          lotNumber: item.lot?.number
        })),
        totalAmount: parseFloat(order.total),
        paymentTerms: order.payment_terms,
        shippingAddress: {
          street: order.delivery_address.street1,
          city: order.delivery_address.city,
          state: order.delivery_address.state,
          zip: order.delivery_address.postal_code
        }
      }));
    } catch (error) {
      console.error('LeafLink API error:', error);
      throw new Error(`Failed to fetch LeafLink orders: ${error.message}`);
    }
  }

  /**
   * Nabis Integration (Cannabis B2B)
   */
  private async fetchNabisOrders(startDate: Date, endDate: Date): Promise<Order[]> {
    const baseUrl = 'https://api.getnabis.com/v1';
    
    try {
      const response = await fetch(
        `${baseUrl}/orders?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          headers: {
            'X-API-KEY': this.config.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      return data.orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.retailer.name,
        orderDate: new Date(order.created_at),
        deliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
        status: order.status.toLowerCase(),
        items: order.order_items.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          batchNumber: item.batch_id
        })),
        totalAmount: order.total_amount,
        paymentTerms: order.payment_terms,
        shippingAddress: {
          street: order.delivery_address.street,
          city: order.delivery_address.city,
          state: order.delivery_address.state,
          zip: order.delivery_address.zip
        }
      }));
    } catch (error) {
      console.error('Nabis API error:', error);
      throw new Error(`Failed to fetch Nabis orders: ${error.message}`);
    }
  }

  /**
   * Distru Integration (Cannabis B2B)
   */
  private async fetchDistruOrders(startDate: Date, endDate: Date): Promise<Order[]> {
    // Distru implementation
    throw new Error('Distru integration not yet implemented');
  }

  /**
   * APEX Trading Integration (Cannabis B2B)
   */
  private async fetchApexOrders(startDate: Date, endDate: Date): Promise<Order[]> {
    // APEX implementation
    throw new Error('APEX integration not yet implemented');
  }

  /**
   * Produce Pro Integration (Produce Distribution)
   */
  private async fetchProduceProOrders(startDate: Date, endDate: Date): Promise<Order[]> {
    const baseUrl = 'https://api.producepro.com/v1';
    
    try {
      const response = await fetch(
        `${baseUrl}/orders?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      return data.orders.map((order: any) => ({
        id: order.order_id,
        orderNumber: order.order_number,
        customer: order.customer_name,
        orderDate: new Date(order.order_date),
        deliveryDate: order.requested_delivery ? new Date(order.requested_delivery) : undefined,
        status: this.mapProduceProStatus(order.status),
        items: order.line_items.map((item: any) => ({
          productId: item.item_code,
          productName: item.item_description,
          sku: item.item_code,
          quantity: item.quantity_ordered,
          unitPrice: item.unit_price,
          totalPrice: item.extended_price,
          lotNumber: item.lot_number
        })),
        totalAmount: order.order_total,
        paymentTerms: order.terms_code,
        shippingAddress: {
          street: order.ship_to_address_1,
          city: order.ship_to_city,
          state: order.ship_to_state,
          zip: order.ship_to_zip
        }
      }));
    } catch (error) {
      console.error('Produce Pro API error:', error);
      throw new Error(`Failed to fetch Produce Pro orders: ${error.message}`);
    }
  }

  /**
   * Sync inventory levels to distribution platforms
   */
  async syncInventory(inventory: InventoryItem[]): Promise<boolean> {
    switch (this.config.provider) {
      case 'LEAFLINK':
        return this.syncLeafLinkInventory(inventory);
      case 'NABIS':
        return this.syncNabisInventory(inventory);
      case 'PRODUCE_PRO':
        return this.syncProduceProInventory(inventory);
      default:
        throw new Error(`Inventory sync not supported for ${this.config.provider}`);
    }
  }

  /**
   * LeafLink inventory sync
   */
  private async syncLeafLinkInventory(inventory: InventoryItem[]): Promise<boolean> {
    const baseUrl = 'https://www.leaflink.com/api/v2';
    
    try {
      for (const item of inventory) {
        await fetch(
          `${baseUrl}/inventory-items/${item.sku}/`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              quantity_available: item.quantity,
              price: item.price
            })
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error('LeafLink inventory sync error:', error);
      return false;
    }
  }

  /**
   * Nabis inventory sync
   */
  private async syncNabisInventory(inventory: InventoryItem[]): Promise<boolean> {
    const baseUrl = 'https://api.getnabis.com/v1';
    
    try {
      const inventoryUpdate = inventory.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        batch_id: item.batchNumber
      }));

      await fetch(
        `${baseUrl}/inventory/bulk-update`,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': this.config.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inventory: inventoryUpdate })
        }
      );
      
      return true;
    } catch (error) {
      console.error('Nabis inventory sync error:', error);
      return false;
    }
  }

  /**
   * Produce Pro inventory sync
   */
  private async syncProduceProInventory(inventory: InventoryItem[]): Promise<boolean> {
    // Produce Pro implementation
    throw new Error('Produce Pro inventory sync not yet implemented');
  }

  /**
   * Create shipment tracking
   */
  async createShipment(order: Order, trackingNumber?: string): Promise<string> {
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber: trackingNumber || `SHIP-${Date.now()}`,
        status: 'pending',
        carrier: 'TBD',
        estimatedDelivery: order.deliveryDate,
        items: {
          create: order.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            lotNumber: item.lotNumber
          }))
        }
      }
    });

    return shipment.id;
  }

  /**
   * Helper methods
   */
  private mapLeafLinkStatus(status: string): Order['status'] {
    const statusMap: Record<string, Order['status']> = {
      'submitted': 'pending',
      'accepted': 'confirmed',
      'shipped': 'in_transit',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'rejected': 'cancelled'
    };
    
    return statusMap[status.toLowerCase()] || 'pending';
  }

  private mapProduceProStatus(status: string): Order['status'] {
    const statusMap: Record<string, Order['status']> = {
      'open': 'pending',
      'confirmed': 'confirmed',
      'in_transit': 'in_transit',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status.toLowerCase()] || 'pending';
  }

  /**
   * Transform order data for analytics
   */
  transformToSalesData(orders: Order[], facilityId: string) {
    return orders.map(order => ({
      facilityId,
      customer: order.customer,
      saleDate: order.orderDate,
      totalPrice: order.totalAmount,
      orderNumber: order.orderNumber,
      status: order.status,
      metadata: {
        source: this.config.provider,
        orderId: order.id,
        deliveryDate: order.deliveryDate,
        paymentTerms: order.paymentTerms
      },
      lineItems: order.items.map(item => ({
        product: item.productName,
        quantity: item.quantity,
        pricePerUnit: item.unitPrice,
        total: item.totalPrice,
        batchNumber: item.batchNumber
      }))
    }));
  }
}

/**
 * Distribution platform configurations
 */
export const DISTRIBUTION_PLATFORMS = {
  // Cannabis B2B Platforms
  LEAFLINK: {
    name: 'LeafLink',
    type: 'cannabis',
    features: ['b2b-marketplace', 'inventory-sync', 'order-management', 'payments'],
    regions: ['US', 'CA']
  },
  NABIS: {
    name: 'Nabis',
    type: 'cannabis',
    features: ['b2b-marketplace', 'delivery', 'payments', 'analytics'],
    regions: ['CA', 'NY']
  },
  DISTRU: {
    name: 'Distru',
    type: 'cannabis',
    features: ['b2b-sales', 'inventory', 'route-planning', 'compliance'],
    regions: ['US']
  },
  APEX: {
    name: 'APEX Trading',
    type: 'cannabis',
    features: ['wholesale', 'marketplace', 'logistics'],
    regions: ['US']
  },
  
  // Produce Distribution Platforms
  PRODUCE_PRO: {
    name: 'Produce Pro Software',
    type: 'produce',
    features: ['inventory', 'sales', 'purchasing', 'accounting', 'traceability'],
    regions: ['US', 'CA', 'MX']
  },
  FAMOUS: {
    name: 'Famous Software',
    type: 'produce',
    features: ['erp', 'inventory', 'sales', 'food-safety', 'analytics'],
    regions: ['US']
  },
  
  // General Inventory Management
  FISHBOWL: {
    name: 'Fishbowl Inventory',
    type: 'general',
    features: ['inventory', 'manufacturing', 'warehouse', 'quickbooks-integration'],
    regions: ['Global']
  }
};