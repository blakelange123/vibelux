/**
 * Types and interfaces for the CEA Produce Marketplace
 */

export interface ProduceListing {
  id: string;
  growerId: string;
  growerName: string;
  growerLocation: {
    city: string;
    state: string;
    zipCode: string;
    deliveryRadius: number; // miles
  };
  product: {
    type: string; // 'lettuce', 'tomatoes', 'herbs', etc.
    variety: string; // 'Buttercrunch', 'Beefsteak', etc.
    certifications: string[]; // 'Organic', 'GAP', 'SQF', etc.
    growingMethod: 'hydroponic' | 'aeroponic' | 'aquaponic' | 'soil';
  };
  availability: {
    currentStock: number;
    unit: 'lbs' | 'heads' | 'bunches' | 'cases' | 'flats';
    harvestDate: Date;
    availableFrom: Date;
    availableUntil: Date;
    recurring: boolean;
    frequency?: 'weekly' | 'biweekly' | 'monthly';
  };
  pricing: {
    price: number;
    unit: string;
    bulkDiscounts?: {
      minQuantity: number;
      discountPercent: number;
    }[];
    contractPricing: boolean;
  };
  quality: {
    grade: 'A' | 'B' | 'C';
    shelfLife: number; // days
    packagingType: string;
    coldChainRequired: boolean;
    images: string[];
  };
  logistics: {
    deliveryAvailable: boolean;
    deliveryFee?: number;
    minimumOrder?: number;
    pickupAvailable: boolean;
    packagingIncluded: boolean;
  };
  sustainability: {
    carbonFootprint?: number; // kg CO2e per unit
    waterUsage?: number; // gallons per unit
    renewableEnergy: boolean;
    locallyGrown: boolean;
    pesticideFree: boolean;
  };
  status: 'active' | 'sold_out' | 'coming_soon' | 'seasonal';
  createdAt: Date;
  updatedAt: Date;
}

export interface BuyerProfile {
  id: string;
  businessName: string;
  type: 'restaurant' | 'grocery' | 'distributor' | 'institutional' | 'other';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences: {
    productTypes: string[];
    certifications: string[];
    maxDeliveryDistance: number;
    preferredPackaging: string[];
    volumeNeeds: 'small' | 'medium' | 'large' | 'enterprise';
  };
  orderHistory: Order[];
  savedGrowers: string[];
  notifications: NotificationPreferences;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryDate: Date;
  deliveryMethod: 'delivery' | 'pickup';
  notes?: string;
  createdAt: Date;
}

export interface OrderItem {
  listingId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface NotificationPreferences {
  newListings: boolean;
  priceChanges: boolean;
  availabilityAlerts: boolean;
  harvestNotifications: boolean;
  qualityReports: boolean;
}

export interface MarketplaceSearch {
  query?: string;
  productTypes?: string[];
  certifications?: string[];
  maxDistance?: number;
  priceRange?: { min: number; max: number };
  availableNow?: boolean;
  deliveryRequired?: boolean;
  minShelfLife?: number;
  gradeFilter?: string[];
}

export interface GrowerDashboard {
  activeListings: number;
  totalSales: number;
  averageRating: number;
  repeatBuyers: number;
  upcomingHarvests: HarvestPlan[];
  inventoryLevels: InventoryItem[];
}

export interface HarvestPlan {
  cropType: string;
  variety: string;
  expectedDate: Date;
  expectedYield: number;
  unit: string;
  preSold: number;
  available: number;
}

export interface InventoryItem {
  product: string;
  currentStock: number;
  unit: string;
  location: string;
  harvestDate: Date;
  daysUntilExpiry: number;
}

export interface MarketplaceAnalytics {
  topProducts: { product: string; volume: number; revenue: number }[];
  priceHistory: { date: Date; product: string; avgPrice: number }[];
  demandForecast: { product: string; projectedDemand: number; confidence: number }[];
  competitorPricing: { grower: string; product: string; price: number }[];
}

// Quality standards for different product types
export const QUALITY_STANDARDS = {
  lettuce: {
    grades: {
      A: { minWeight: 150, maxDefects: 0, color: 'vibrant', texture: 'crisp' },
      B: { minWeight: 120, maxDefects: 2, color: 'good', texture: 'acceptable' },
      C: { minWeight: 90, maxDefects: 5, color: 'fair', texture: 'soft' }
    },
    shelfLife: { optimal: 14, acceptable: 10, minimum: 7 }
  },
  tomatoes: {
    grades: {
      A: { minSize: 'large', ripeness: 'optimal', blemishes: 0 },
      B: { minSize: 'medium', ripeness: 'good', blemishes: 2 },
      C: { minSize: 'small', ripeness: 'variable', blemishes: 5 }
    },
    shelfLife: { optimal: 10, acceptable: 7, minimum: 5 }
  },
  herbs: {
    grades: {
      A: { aroma: 'strong', color: 'vibrant', damage: 'none' },
      B: { aroma: 'good', color: 'good', damage: 'minimal' },
      C: { aroma: 'fair', color: 'acceptable', damage: 'some' }
    },
    shelfLife: { optimal: 7, acceptable: 5, minimum: 3 }
  }
};