import { EventEmitter } from 'events';

export interface Vendor {
  id: string;
  name: string;
  type: 'equipment' | 'genetics' | 'supplies' | 'services';
  verified: boolean;
  rating: number;
  reviewCount: number;
  specialties: string[];
  certifications: string[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  businessInfo: {
    taxId: string;
    yearEstablished: number;
    insuranceExpiry: Date;
  };
  paymentTerms: string;
  minimumOrder: number;
  shippingZones: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface Product {
  id: string;
  vendorId: string;
  category: 'lighting' | 'hvac' | 'automation' | 'nutrients' | 'media' | 'genetics' | 'equipment' | 'other';
  subcategory?: string;
  name: string;
  brand: string;
  model?: string;
  description: string;
  specifications: Record<string, any>;
  images: string[];
  pricing: {
    list: number;
    wholesale?: number;
    volume?: { quantity: number; price: number }[];
    currency: string;
  };
  availability: 'in-stock' | 'backorder' | 'discontinued';
  leadTime: number; // days
  warranty: string;
  certifications: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneticListing {
  id: string;
  vendorId: string;
  strain: string;
  type: 'clone' | 'seed' | 'tissue-culture' | 'pollen';
  genetics: {
    lineage: string;
    thc: { min: number; max: number };
    cbd: { min: number; max: number };
    terpenes: string[];
    floweringTime: number; // weeks
    yieldPotential: string;
  };
  licensing: {
    type: 'exclusive' | 'non-exclusive' | 'white-label';
    royaltyRate?: number;
    minimumOrder?: number;
    territoryRestrictions?: string[];
  };
  availability: number;
  price: number;
  certifications: string[]; // virus-free, organic, etc.
  labResults?: string;
  images: string[];
  description: string;
}

export interface PurchaseOrder {
  id: string;
  buyerId: string;
  vendorId: string;
  status: 'draft' | 'submitted' | 'accepted' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    productId: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  shipping: {
    address: string;
    method: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
  };
  payment: {
    method: 'credit' | 'wire' | 'net-terms';
    terms?: string;
    status: 'pending' | 'paid' | 'partial' | 'overdue';
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RFQ {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  specifications: Record<string, any>;
  quantity: number;
  targetPrice?: number;
  deliveryDate: Date;
  attachments: string[];
  status: 'open' | 'closed' | 'awarded';
  quotes: Quote[];
  createdAt: Date;
  expiresAt: Date;
}

export interface Quote {
  id: string;
  rfqId: string;
  vendorId: string;
  price: number;
  leadTime: number;
  validUntil: Date;
  notes: string;
  attachments: string[];
  status: 'submitted' | 'accepted' | 'rejected';
  createdAt: Date;
}

export class MarketplaceManager extends EventEmitter {
  private vendors: Map<string, Vendor> = new Map();
  private products: Map<string, Product> = new Map();
  private genetics: Map<string, GeneticListing> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private rfqs: Map<string, RFQ> = new Map();

  constructor() {
    super();
    this.initializeSampleData();
  }

  // Vendor Management
  public registerVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'lastActive'>): Vendor {
    const newVendor: Vendor = {
      ...vendor,
      id: `VND-${Date.now()}`,
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.vendors.set(newVendor.id, newVendor);
    this.emit('vendorRegistered', newVendor);
    return newVendor;
  }

  public getVendor(vendorId: string): Vendor | undefined {
    return this.vendors.get(vendorId);
  }

  public searchVendors(filters: {
    type?: string;
    specialty?: string;
    minRating?: number;
    verified?: boolean;
  }): Vendor[] {
    return Array.from(this.vendors.values()).filter(vendor => {
      if (filters.type && vendor.type !== filters.type) return false;
      if (filters.specialty && !vendor.specialties.includes(filters.specialty)) return false;
      if (filters.minRating && vendor.rating < filters.minRating) return false;
      if (filters.verified !== undefined && vendor.verified !== filters.verified) return false;
      return true;
    });
  }

  // Product Management
  public listProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `PRD-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.set(newProduct.id, newProduct);
    this.emit('productListed', newProduct);
    return newProduct;
  }

  public searchProducts(filters: {
    category?: string;
    vendorId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
  }): Product[] {
    return Array.from(this.products.values()).filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.vendorId && product.vendorId !== filters.vendorId) return false;
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.minPrice && product.pricing.list < filters.minPrice) return false;
      if (filters.maxPrice && product.pricing.list > filters.maxPrice) return false;
      if (filters.availability && product.availability !== filters.availability) return false;
      return true;
    });
  }

  // Genetics Marketplace
  public listGenetics(listing: Omit<GeneticListing, 'id'>): GeneticListing {
    const newListing: GeneticListing = {
      ...listing,
      id: `GEN-${Date.now()}`
    };

    this.genetics.set(newListing.id, newListing);
    this.emit('geneticsListed', newListing);
    return newListing;
  }

  public searchGenetics(filters: {
    type?: string;
    thcMin?: number;
    cbdMin?: number;
    floweringTimeMax?: number;
    licensingType?: string;
  }): GeneticListing[] {
    return Array.from(this.genetics.values()).filter(genetic => {
      if (filters.type && genetic.type !== filters.type) return false;
      if (filters.thcMin && genetic.genetics.thc.min < filters.thcMin) return false;
      if (filters.cbdMin && genetic.genetics.cbd.min < filters.cbdMin) return false;
      if (filters.floweringTimeMax && genetic.genetics.floweringTime > filters.floweringTimeMax) return false;
      if (filters.licensingType && genetic.licensing.type !== filters.licensingType) return false;
      return true;
    });
  }

  // Purchase Orders
  public createPurchaseOrder(buyerId: string, vendorId: string, items: PurchaseOrder['items']): PurchaseOrder {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over $500

    const newOrder: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      buyerId,
      vendorId,
      status: 'draft',
      items,
      totals: {
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping
      },
      shipping: {
        address: '',
        method: 'standard'
      },
      payment: {
        method: 'credit',
        status: 'pending'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.purchaseOrders.set(newOrder.id, newOrder);
    this.emit('purchaseOrderCreated', newOrder);
    return newOrder;
  }

  public updatePurchaseOrderStatus(orderId: string, status: PurchaseOrder['status']): void {
    const order = this.purchaseOrders.get(orderId);
    if (!order) throw new Error('Order not found');

    order.status = status;
    order.updatedAt = new Date();
    
    this.emit('purchaseOrderUpdated', order);
  }

  // RFQ System
  public createRFQ(rfq: Omit<RFQ, 'id' | 'status' | 'quotes' | 'createdAt'>): RFQ {
    const newRFQ: RFQ = {
      ...rfq,
      id: `RFQ-${Date.now()}`,
      status: 'open',
      quotes: [],
      createdAt: new Date()
    };

    this.rfqs.set(newRFQ.id, newRFQ);
    this.emit('rfqCreated', newRFQ);
    return newRFQ;
  }

  public submitQuote(quote: Omit<Quote, 'id' | 'status' | 'createdAt'>): Quote {
    const rfq = this.rfqs.get(quote.rfqId);
    if (!rfq) throw new Error('RFQ not found');

    const newQuote: Quote = {
      ...quote,
      id: `QTE-${Date.now()}`,
      status: 'submitted',
      createdAt: new Date()
    };

    rfq.quotes.push(newQuote);
    this.emit('quoteSubmitted', newQuote);
    return newQuote;
  }

  // Recommendation Engine
  public getRecommendedProducts(buyerId: string, category?: string): Product[] {
    // Simple recommendation based on category and rating
    const vendors = Array.from(this.vendors.values())
      .filter(v => v.verified && v.rating >= 4)
      .map(v => v.id);

    return this.searchProducts({ category })
      .filter(p => vendors.includes(p.vendorId))
      .sort((a, b) => {
        const vendorA = this.vendors.get(a.vendorId);
        const vendorB = this.vendors.get(b.vendorId);
        return (vendorB?.rating || 0) - (vendorA?.rating || 0);
      })
      .slice(0, 10);
  }

  // Analytics
  public getMarketplaceStats(): {
    totalVendors: number;
    totalProducts: number;
    totalGenetics: number;
    activeOrders: number;
    openRFQs: number;
  } {
    return {
      totalVendors: this.vendors.size,
      totalProducts: this.products.size,
      totalGenetics: this.genetics.size,
      activeOrders: Array.from(this.purchaseOrders.values())
        .filter(o => ['submitted', 'accepted', 'processing', 'shipped'].includes(o.status)).length,
      openRFQs: Array.from(this.rfqs.values()).filter(r => r.status === 'open').length
    };
  }

  private initializeSampleData(): void {
    // Sample vendors
    const vendors = [
      {
        name: 'Premium Grow Lights Co.',
        type: 'equipment' as const,
        verified: true,
        rating: 4.8,
        reviewCount: 245,
        specialties: ['LED Lighting', 'Supplemental Lighting'],
        certifications: ['DLC Certified', 'UL Listed'],
        contact: {
          email: 'sales@premiumgrowlights.com',
          phone: '+1-800-555-0100',
          address: '123 Industrial Way, Portland, OR 97201'
        },
        businessInfo: {
          taxId: 'XX-XXXXXXX',
          yearEstablished: 2015,
          insuranceExpiry: new Date('2025-12-31')
        },
        paymentTerms: 'Net 30',
        minimumOrder: 500,
        shippingZones: ['US', 'CA']
      },
      {
        name: 'Elite Genetics Lab',
        type: 'genetics' as const,
        verified: true,
        rating: 4.9,
        reviewCount: 189,
        specialties: ['Premium Strains', 'Tissue Culture'],
        certifications: ['Virus-Free Certified', 'Organic'],
        contact: {
          email: 'info@elitegenetics.com',
          phone: '+1-800-555-0200',
          address: '456 Genetics Dr, Denver, CO 80201'
        },
        businessInfo: {
          taxId: 'XX-XXXXXXX',
          yearEstablished: 2018,
          insuranceExpiry: new Date('2025-12-31')
        },
        paymentTerms: 'Prepaid',
        minimumOrder: 100,
        shippingZones: ['US']
      }
    ];

    vendors.forEach(v => this.registerVendor(v));

    // Sample products
    const vendor1Id = Array.from(this.vendors.values())[0].id;
    
    this.listProduct({
      vendorId: vendor1Id,
      category: 'lighting',
      subcategory: 'LED Fixtures',
      name: 'ProGrow 720W LED',
      brand: 'ProGrow',
      model: 'PG-720',
      description: 'High-efficiency 720W LED grow light with full spectrum',
      specifications: {
        wattage: 720,
        ppf: 1944,
        efficacy: 2.7,
        spectrum: 'Full',
        dimensions: '44" x 44" x 4"'
      },
      images: ['/api/placeholder/400/300'],
      pricing: {
        list: 899,
        wholesale: 719,
        volume: [
          { quantity: 10, price: 679 },
          { quantity: 50, price: 639 }
        ],
        currency: 'USD'
      },
      availability: 'in-stock',
      leadTime: 3,
      warranty: '5 years',
      certifications: ['DLC', 'UL', 'IP65'],
      tags: ['commercial', 'high-ppfd', 'waterproof']
    });

    // Sample genetics
    const vendorArray = Array.from(this.vendors.values());
    if (vendorArray.length > 1) {
      const vendor2Id = vendorArray[1].id;
      
      this.listGenetics({
      vendorId: vendor2Id,
      strain: 'Blue Dream Elite',
      type: 'clone',
      genetics: {
        lineage: 'Blueberry x Haze',
        thc: { min: 17, max: 24 },
        cbd: { min: 0.1, max: 0.3 },
        terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
        floweringTime: 9,
        yieldPotential: 'High (500-600g/m²)'
      },
      licensing: {
        type: 'non-exclusive',
        royaltyRate: 5,
        minimumOrder: 100
      },
      availability: 500,
      price: 12,
      certifications: ['Virus-Free', 'Pesticide-Free'],
      images: ['/api/placeholder/400/300'],
      description: 'Premium Blue Dream genetics with enhanced terpene profile'
    });
    }
  }
}