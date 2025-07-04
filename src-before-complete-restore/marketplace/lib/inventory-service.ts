/**
 * Inventory Management Service
 * Handles stock tracking, alerts, and synchronization
 */

export interface InventoryItem {
  listingId: string;
  productName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  unit: string;
  lastUpdated: Date;
  lowStockThreshold: number;
  autoReorder: boolean;
  reorderQuantity: number;
}

export interface InventoryMovement {
  id: string;
  listingId: string;
  type: 'in' | 'out' | 'reserved' | 'released' | 'adjustment';
  quantity: number;
  reason: string;
  orderId?: string;
  timestamp: Date;
  balanceBefore: number;
  balanceAfter: number;
}

export interface StockAlert {
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon';
  listingId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  message: string;
  severity: 'warning' | 'critical';
}

export class InventoryService {
  private movements: Map<string, InventoryMovement[]> = new Map();
  private alerts: Map<string, StockAlert[]> = new Map();
  
  /**
   * Update inventory levels
   */
  async updateInventory(
    listingId: string,
    quantity: number,
    type: InventoryMovement['type'],
    reason: string,
    orderId?: string
  ): Promise<InventoryItem> {
    const inventory = await this.getInventoryByListingId(listingId);
    const balanceBefore = inventory.currentStock;
    
    // Calculate new balance
    switch (type) {
      case 'in':
        inventory.currentStock += quantity;
        inventory.availableStock += quantity;
        break;
      case 'out':
        inventory.currentStock -= quantity;
        inventory.availableStock -= quantity;
        break;
      case 'reserved':
        inventory.availableStock -= quantity;
        inventory.reservedStock += quantity;
        break;
      case 'released':
        inventory.availableStock += quantity;
        inventory.reservedStock -= quantity;
        break;
      case 'adjustment':
        const diff = quantity - inventory.currentStock;
        inventory.currentStock = quantity;
        inventory.availableStock += diff;
        break;
    }
    
    // Record movement
    const movement: InventoryMovement = {
      id: this.generateMovementId(),
      listingId,
      type,
      quantity,
      reason,
      orderId,
      timestamp: new Date(),
      balanceBefore,
      balanceAfter: inventory.currentStock
    };
    
    this.recordMovement(listingId, movement);
    
    // Check for alerts
    await this.checkInventoryAlerts(inventory);
    
    // Update last modified
    inventory.lastUpdated = new Date();
    
    return inventory;
  }
  
  /**
   * Reserve inventory for an order
   */
  async reserveInventory(
    items: { listingId: string; quantity: number }[],
    orderId: string
  ): Promise<void> {
    // Check availability first
    for (const item of items) {
      const inventory = await this.getInventoryByListingId(item.listingId);
      if (inventory.availableStock < item.quantity) {
        throw new Error(`Insufficient stock for ${inventory.productName}. Available: ${inventory.availableStock}, Requested: ${item.quantity}`);
      }
    }
    
    // Reserve all items
    for (const item of items) {
      await this.updateInventory(
        item.listingId,
        item.quantity,
        'reserved',
        `Reserved for order ${orderId}`,
        orderId
      );
    }
  }
  
  /**
   * Release reserved inventory
   */
  async releaseInventory(
    items: { listingId: string; quantity: number }[],
    orderId: string
  ): Promise<void> {
    for (const item of items) {
      await this.updateInventory(
        item.listingId,
        item.quantity,
        'released',
        `Released from order ${orderId}`,
        orderId
      );
    }
  }
  
  /**
   * Confirm inventory sale
   */
  async confirmSale(
    items: { listingId: string; quantity: number }[],
    orderId: string
  ): Promise<void> {
    for (const item of items) {
      const inventory = await this.getInventoryByListingId(item.listingId);
      
      // Convert reserved to sold
      inventory.reservedStock -= item.quantity;
      inventory.currentStock -= item.quantity;
      
      // Record the sale
      await this.updateInventory(
        item.listingId,
        item.quantity,
        'out',
        `Sold via order ${orderId}`,
        orderId
      );
    }
  }
  
  /**
   * Check and create inventory alerts
   */
  private async checkInventoryAlerts(inventory: InventoryItem): Promise<void> {
    const alerts: StockAlert[] = [];
    
    // Check for out of stock
    if (inventory.availableStock === 0) {
      alerts.push({
        type: 'out_of_stock',
        listingId: inventory.listingId,
        productName: inventory.productName,
        currentStock: inventory.currentStock,
        threshold: 0,
        message: `${inventory.productName} is out of stock`,
        severity: 'critical'
      });
    }
    // Check for low stock
    else if (inventory.availableStock <= inventory.lowStockThreshold) {
      alerts.push({
        type: 'low_stock',
        listingId: inventory.listingId,
        productName: inventory.productName,
        currentStock: inventory.currentStock,
        threshold: inventory.lowStockThreshold,
        message: `${inventory.productName} is running low (${inventory.availableStock} ${inventory.unit} remaining)`,
        severity: 'warning'
      });
      
      // Auto-reorder if enabled
      if (inventory.autoReorder) {
        await this.createReorderSuggestion(inventory);
      }
    }
    
    // Store alerts
    if (alerts.length > 0) {
      this.alerts.set(inventory.listingId, alerts);
      await this.sendInventoryAlerts(alerts);
    }
  }
  
  /**
   * Get inventory movements history
   */
  getMovementHistory(
    listingId: string,
    startDate?: Date,
    endDate?: Date
  ): InventoryMovement[] {
    const movements = this.movements.get(listingId) || [];
    
    if (startDate || endDate) {
      return movements.filter(m => {
        if (startDate && m.timestamp < startDate) return false;
        if (endDate && m.timestamp > endDate) return false;
        return true;
      });
    }
    
    return movements;
  }
  
  /**
   * Calculate inventory metrics
   */
  calculateInventoryMetrics(listingId: string, days: number = 30): {
    averageDailySales: number;
    turnoverRate: number;
    daysOfStock: number;
    stockoutRisk: 'low' | 'medium' | 'high';
  } {
    const movements = this.getMovementHistory(
      listingId,
      new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    );
    
    // Calculate sales
    const sales = movements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const averageDailySales = sales / days;
    
    // Get current inventory
    const inventory = this.getInventoryByListingIdSync(listingId);
    const daysOfStock = inventory.availableStock / averageDailySales;
    
    // Calculate turnover
    const averageInventory = movements.reduce((sum, m) => sum + m.balanceAfter, 0) / movements.length;
    const turnoverRate = sales / averageInventory;
    
    // Assess stockout risk
    let stockoutRisk: 'low' | 'medium' | 'high' = 'low';
    if (daysOfStock < 3) stockoutRisk = 'high';
    else if (daysOfStock < 7) stockoutRisk = 'medium';
    
    return {
      averageDailySales,
      turnoverRate,
      daysOfStock,
      stockoutRisk
    };
  }
  
  /**
   * Sync inventory with external systems
   */
  async syncInventory(source: 'vibelux' | 'external', data: any): Promise<void> {
    if (source === 'vibelux') {
      // Sync from VibeLux facility data
      // Could pull from harvest tracking, sensor data, etc.
    } else {
      // Sync from external ERP/inventory system
    }
  }
  
  /**
   * Forecast inventory needs
   */
  forecastInventoryNeeds(
    listingId: string,
    forecastDays: number = 14
  ): {
    projectedStockout: Date | null;
    recommendedReorderDate: Date;
    recommendedReorderQuantity: number;
  } {
    const metrics = this.calculateInventoryMetrics(listingId);
    const inventory = this.getInventoryByListingIdSync(listingId);
    
    // Project stockout date
    const projectedStockout = metrics.daysOfStock > 0
      ? new Date(Date.now() + metrics.daysOfStock * 24 * 60 * 60 * 1000)
      : null;
    
    // Recommend reorder date (with lead time buffer)
    const leadTimeDays = 3; // Typical growing/harvest lead time
    const recommendedReorderDate = new Date(
      Date.now() + (metrics.daysOfStock - leadTimeDays) * 24 * 60 * 60 * 1000
    );
    
    // Recommend quantity (forecast period + safety stock)
    const recommendedReorderQuantity = Math.ceil(
      metrics.averageDailySales * (forecastDays + leadTimeDays) * 1.2 // 20% safety stock
    );
    
    return {
      projectedStockout,
      recommendedReorderDate,
      recommendedReorderQuantity
    };
  }
  
  // Helper methods
  private generateMovementId(): string {
    return `MOV-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 5)}`;
  }
  
  private recordMovement(listingId: string, movement: InventoryMovement): void {
    const movements = this.movements.get(listingId) || [];
    movements.push(movement);
    this.movements.set(listingId, movements);
  }
  
  private async getInventoryByListingId(listingId: string): Promise<InventoryItem> {
    // Mock implementation - replace with database query
    return {
      listingId,
      productName: 'Sample Product',
      currentStock: 100,
      reservedStock: 10,
      availableStock: 90,
      unit: 'units',
      lastUpdated: new Date(),
      lowStockThreshold: 20,
      autoReorder: true,
      reorderQuantity: 100
    };
  }
  
  private getInventoryByListingIdSync(listingId: string): InventoryItem {
    // Mock implementation
    return {
      listingId,
      productName: 'Sample Product',
      currentStock: 100,
      reservedStock: 10,
      availableStock: 90,
      unit: 'units',
      lastUpdated: new Date(),
      lowStockThreshold: 20,
      autoReorder: true,
      reorderQuantity: 100
    };
  }
  
  private async sendInventoryAlerts(alerts: StockAlert[]): Promise<void> {
    // Implement email/SMS notifications
  }
  
  private async createReorderSuggestion(inventory: InventoryItem): Promise<void> {
    // Implement reorder workflow
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();