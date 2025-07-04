/**
 * Logistics Consolidation System
 * Enables order consolidation from multiple suppliers and cold chain management
 */

export interface ConsolidationCenter {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  capabilities: {
    coldStorage: boolean;
    temperatureRanges: {
      min: number;
      max: number;
      unit: 'F' | 'C';
    }[];
    maxCapacity: number;
    capacityUnit: 'pallets' | 'cubic-feet' | 'square-feet';
    services: ('cross-docking' | 'repackaging' | 'quality-inspection' | 'labeling')[];
  };
  
  availability: {
    operatingHours: {
      [day: string]: { open: string; close: string; } | 'closed';
    };
    currentUtilization: number; // percentage
    nextAvailableSlot: Date;
  };
  
  certifications: string[];
  rating: number;
  costStructure: {
    storageFee: number; // per day per pallet
    handlingFee: number; // per pallet
    consolidationFee: number; // per order
  };
}

export interface ConsolidationOrder {
  id: string;
  buyerId: string;
  
  // Multiple source orders
  sourceOrders: SourceOrder[];
  
  // Consolidation details
  consolidationCenter: ConsolidationCenter;
  consolidationDate: Date;
  
  // Delivery details
  finalDestination: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryInstructions?: string;
  };
  
  requestedDeliveryDate: Date;
  deliveryWindow: {
    start: string; // time
    end: string; // time
  };
  
  // Status tracking
  status: 'pending' | 'collecting' | 'consolidating' | 'in-transit' | 'delivered' | 'cancelled';
  timeline: ConsolidationEvent[];
  
  // Cost breakdown
  costs: {
    productTotal: number;
    consolidationFees: number;
    storageFees: number;
    deliveryFees: number;
    totalAmount: number;
  };
  
  // Cold chain requirements
  temperatureRequirements?: {
    min: number;
    max: number;
    unit: 'F' | 'C';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
  }[];
  
  pickup: {
    location: string;
    scheduledDate: Date;
    window: { start: string; end: string; };
    status: 'pending' | 'picked-up' | 'in-transit' | 'delivered-to-center';
  };
  
  // Quality requirements
  qualityChecks?: {
    required: boolean;
    parameters: string[];
  };
}

export interface ConsolidationEvent {
  id: string;
  timestamp: Date;
  type: 'order-placed' | 'pickup-scheduled' | 'picked-up' | 'arrived-at-center' | 
        'consolidation-started' | 'consolidation-complete' | 'shipped' | 'delivered';
  location?: string;
  description: string;
  temperature?: number;
  photos?: string[];
}

export interface ShippingRoute {
  id: string;
  carrier: string;
  
  // Route details
  origin: ConsolidationCenter;
  destination: string;
  
  // Schedule
  departureTime: Date;
  estimatedArrival: Date;
  
  // Capacity
  totalCapacity: number;
  availableCapacity: number;
  capacityUnit: 'pallets' | 'cubic-feet';
  
  // Cost
  ratePerPallet: number;
  minimumCharge: number;
  
  // Requirements
  temperatureControlled: boolean;
  temperatureRange?: {
    min: number;
    max: number;
    unit: 'F' | 'C';
  };
}

export class LogisticsConsolidation {
  /**
   * Find optimal consolidation center based on source orders
   */
  static findOptimalCenter(
    sourceOrders: SourceOrder[],
    destination: ConsolidationOrder['finalDestination'],
    centers: ConsolidationCenter[]
  ): {
    center: ConsolidationCenter;
    totalDistance: number;
    estimatedCost: number;
    reasoning: string[];
  } | null {
    if (centers.length === 0) return null;
    
    // Calculate scores for each center
    const scoredCenters = centers.map(center => {
      let score = 0;
      const reasoning: string[] = [];
      
      // Distance score (simplified - would use real geocoding)
      const avgDistance = this.calculateAverageDistance(sourceOrders, center);
      const distanceScore = Math.max(0, 100 - avgDistance / 10);
      score += distanceScore * 0.3;
      reasoning.push(`Distance score: ${distanceScore.toFixed(0)}`);
      
      // Capacity score
      if (center.availability.currentUtilization < 80) {
        score += 20;
        reasoning.push('Has available capacity');
      }
      
      // Cold storage capability
      const needsColdStorage = sourceOrders.some(order => 
        order.items.some(item => item.productName.toLowerCase().includes('fresh'))
      );
      if (needsColdStorage && center.capabilities.coldStorage) {
        score += 30;
        reasoning.push('Has required cold storage');
      }
      
      // Cost score
      const estimatedCost = this.estimateConsolidationCost(sourceOrders, center);
      const costScore = Math.max(0, 100 - estimatedCost / 10);
      score += costScore * 0.2;
      reasoning.push(`Cost score: ${costScore.toFixed(0)}`);
      
      // Rating score
      score += center.rating * 10;
      reasoning.push(`Rating: ${center.rating}/5`);
      
      return {
        center,
        score,
        totalDistance: avgDistance,
        estimatedCost,
        reasoning
      };
    });
    
    // Sort by score and return best option
    scoredCenters.sort((a, b) => b.score - a.score);
    const best = scoredCenters[0];
    
    return {
      center: best.center,
      totalDistance: best.totalDistance,
      estimatedCost: best.estimatedCost,
      reasoning: best.reasoning
    };
  }
  
  /**
   * Create consolidation order
   */
  static createConsolidationOrder(
    buyerId: string,
    sourceOrders: SourceOrder[],
    center: ConsolidationCenter,
    destination: ConsolidationOrder['finalDestination'],
    deliveryDate: Date
  ): ConsolidationOrder {
    const orderId = `consol_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    // Calculate costs
    const productTotal = sourceOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
    );
    
    const consolidationFees = center.costStructure.consolidationFee * sourceOrders.length;
    const estimatedStorageDays = 2; // Typical consolidation time
    const storageFees = center.costStructure.storageFee * sourceOrders.length * estimatedStorageDays;
    const deliveryFees = this.estimateDeliveryFee(center, destination);
    
    const order: ConsolidationOrder = {
      id: orderId,
      buyerId,
      sourceOrders,
      consolidationCenter: center,
      consolidationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      finalDestination: destination,
      requestedDeliveryDate: deliveryDate,
      deliveryWindow: {
        start: '08:00',
        end: '17:00'
      },
      status: 'pending',
      timeline: [{
        id: `event_${Date.now()}`,
        timestamp: new Date(),
        type: 'order-placed',
        description: 'Consolidation order created'
      }],
      costs: {
        productTotal,
        consolidationFees,
        storageFees,
        deliveryFees,
        totalAmount: productTotal + consolidationFees + storageFees + deliveryFees
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return order;
  }
  
  /**
   * Track consolidation order
   */
  static addTrackingEvent(
    order: ConsolidationOrder,
    event: Omit<ConsolidationEvent, 'id' | 'timestamp'>
  ): ConsolidationOrder {
    const newEvent: ConsolidationEvent = {
      ...event,
      id: `event_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    // Update order status based on event
    let newStatus = order.status;
    switch (event.type) {
      case 'pickup-scheduled':
        newStatus = 'collecting';
        break;
      case 'consolidation-started':
        newStatus = 'consolidating';
        break;
      case 'shipped':
        newStatus = 'in-transit';
        break;
      case 'delivered':
        newStatus = 'delivered';
        break;
    }
    
    return {
      ...order,
      status: newStatus,
      timeline: [...order.timeline, newEvent],
      updatedAt: new Date()
    };
  }
  
  /**
   * Find available shipping routes
   */
  static findShippingRoutes(
    center: ConsolidationCenter,
    destination: string,
    requiredCapacity: number,
    temperatureControlled: boolean = false
  ): ShippingRoute[] {
    // Mock shipping routes - would integrate with carrier APIs
    const routes: ShippingRoute[] = [
      {
        id: 'route_1',
        carrier: 'Cold Chain Express',
        origin: center,
        destination,
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedArrival: new Date(Date.now() + 36 * 60 * 60 * 1000),
        totalCapacity: 26,
        availableCapacity: 18,
        capacityUnit: 'pallets',
        ratePerPallet: 125,
        minimumCharge: 500,
        temperatureControlled: true,
        temperatureRange: { min: 32, max: 40, unit: 'F' }
      },
      {
        id: 'route_2',
        carrier: 'Fresh Direct Logistics',
        origin: center,
        destination,
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        estimatedArrival: new Date(Date.now() + 60 * 60 * 60 * 1000),
        totalCapacity: 33,
        availableCapacity: 25,
        capacityUnit: 'pallets',
        ratePerPallet: 95,
        minimumCharge: 400,
        temperatureControlled: true,
        temperatureRange: { min: 35, max: 45, unit: 'F' }
      }
    ];
    
    // Filter by requirements
    return routes.filter(route => 
      route.availableCapacity >= requiredCapacity &&
      (!temperatureControlled || route.temperatureControlled)
    );
  }
  
  /**
   * Calculate consolidation savings
   */
  static calculateSavings(
    individualDeliveryCoste: number[],
    consolidatedCost: number
  ): {
    totalSavings: number;
    percentageSaved: number;
    breakEven: number; // minimum orders needed to save money
  } {
    const individualTotal = individualDeliveryCoste.reduce((sum, cost) => sum + cost, 0);
    const totalSavings = individualTotal - consolidatedCost;
    const percentageSaved = (totalSavings / individualTotal) * 100;
    
    // Calculate break-even point
    const avgIndividualCost = individualTotal / individualDeliveryCoste.length;
    const breakEven = Math.ceil(consolidatedCost / avgIndividualCost);
    
    return {
      totalSavings: Math.max(0, totalSavings),
      percentageSaved: Math.max(0, percentageSaved),
      breakEven
    };
  }
  
  /**
   * Helper: Calculate average distance
   */
  private static calculateAverageDistance(
    sourceOrders: SourceOrder[],
    center: ConsolidationCenter
  ): number {
    // Simplified calculation - would use real geocoding API
    return sourceOrders.length * 50; // Mock 50 miles average
  }
  
  /**
   * Helper: Estimate consolidation cost
   */
  private static estimateConsolidationCost(
    sourceOrders: SourceOrder[],
    center: ConsolidationCenter
  ): number {
    const pallets = sourceOrders.length; // Simplified - 1 pallet per order
    const storageDays = 2;
    
    return (
      center.costStructure.consolidationFee * sourceOrders.length +
      center.costStructure.storageFee * pallets * storageDays +
      center.costStructure.handlingFee * pallets
    );
  }
  
  /**
   * Helper: Estimate delivery fee
   */
  private static estimateDeliveryFee(
    center: ConsolidationCenter,
    destination: any
  ): number {
    // Simplified calculation - would use real distance and carrier rates
    const baseFee = 200;
    const perMileFee = 2.5;
    const estimatedMiles = 100; // Would calculate real distance
    
    return baseFee + (perMileFee * estimatedMiles);
  }
}

/**
 * Cold Chain Monitoring
 */
export interface TemperatureReading {
  timestamp: Date;
  temperature: number;
  unit: 'F' | 'C';
  location: string;
  deviceId: string;
}

export interface ColdChainAlert {
  id: string;
  orderId: string;
  timestamp: Date;
  alertType: 'temperature-excursion' | 'device-offline' | 'door-open';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  temperature?: number;
  duration?: number; // minutes
  resolved: boolean;
  resolvedAt?: Date;
}

export class ColdChainMonitoring {
  /**
   * Check if temperature is within range
   */
  static isTemperatureValid(
    reading: TemperatureReading,
    requirements: { min: number; max: number; unit: 'F' | 'C' }
  ): boolean {
    // Convert if needed
    let temp = reading.temperature;
    if (reading.unit !== requirements.unit) {
      temp = reading.unit === 'F' 
        ? (temp - 32) * 5/9  // F to C
        : temp * 9/5 + 32;   // C to F
    }
    
    return temp >= requirements.min && temp <= requirements.max;
  }
  
  /**
   * Generate alert for temperature excursion
   */
  static generateTemperatureAlert(
    orderId: string,
    reading: TemperatureReading,
    requirements: { min: number; max: number; unit: 'F' | 'C' },
    duration: number
  ): ColdChainAlert {
    const severity = duration > 60 ? 'critical' : 
                    duration > 30 ? 'high' :
                    duration > 15 ? 'medium' : 'low';
    
    return {
      id: `alert_${Date.now()}`,
      orderId,
      timestamp: new Date(),
      alertType: 'temperature-excursion',
      severity,
      message: `Temperature ${reading.temperature}°${reading.unit} outside range ` +
               `(${requirements.min}-${requirements.max}°${requirements.unit}) ` +
               `for ${duration} minutes at ${reading.location}`,
      temperature: reading.temperature,
      duration,
      resolved: false
    };
  }
}