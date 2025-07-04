import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class MarketplaceDB {
  // Vendor Management
  async registerVendor(data: {
    name: string;
    type: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    specialties: string[];
    certifications: string[];
    paymentTerms: string;
    minimumOrder: number;
    shippingZones: string[];
  }) {
    return await prisma.vendor.create({
      data: {
        name: data.name,
        type: data.type,
        verified: false,
        rating: 0,
        reviewCount: 0,
        contact: {
          email: data.email,
          phone: data.phone,
          address: data.address
        },
        businessInfo: {
          taxId: data.taxId,
          yearEstablished: new Date().getFullYear(),
          insuranceExpiry: null
        },
        specialties: data.specialties,
        certifications: data.certifications,
        paymentTerms: data.paymentTerms,
        minimumOrder: data.minimumOrder,
        shippingZones: data.shippingZones
      }
    });
  }

  async searchVendors(filters: {
    type?: string;
    specialty?: string;
    minRating?: number;
    verified?: boolean;
  }) {
    const where: Prisma.VendorWhereInput = {};
    
    if (filters.type) where.type = filters.type;
    if (filters.verified !== undefined) where.verified = filters.verified;
    if (filters.minRating) where.rating = { gte: filters.minRating };
    if (filters.specialty) {
      where.specialties = { has: filters.specialty };
    }

    return await prisma.vendor.findMany({
      where,
      orderBy: { rating: 'desc' }
    });
  }

  // Product Management
  async listProduct(data: {
    vendorId: string;
    category: string;
    subcategory?: string;
    name: string;
    brand: string;
    model?: string;
    description: string;
    specifications: any;
    images: string[];
    listPrice: number;
    wholesalePrice?: number;
    volumePricing?: { quantity: number; price: number }[];
    availability: string;
    leadTime: number;
    warranty: string;
    certifications: string[];
    tags: string[];
  }) {
    return await prisma.product.create({
      data: {
        vendorId: data.vendorId,
        category: data.category,
        subcategory: data.subcategory,
        name: data.name,
        brand: data.brand,
        model: data.model,
        description: data.description,
        specifications: data.specifications,
        images: data.images,
        pricing: {
          list: data.listPrice,
          wholesale: data.wholesalePrice,
          volume: data.volumePricing,
          currency: 'USD'
        },
        availability: data.availability,
        leadTime: data.leadTime,
        warranty: data.warranty,
        certifications: data.certifications,
        tags: data.tags
      }
    });
  }

  async searchProducts(filters: {
    category?: string;
    vendorId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
  }) {
    const where: Prisma.ProductWhereInput = {};
    
    if (filters.category) where.category = filters.category;
    if (filters.vendorId) where.vendorId = filters.vendorId;
    if (filters.availability) where.availability = filters.availability;
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } }
      ];
    }

    // Price filtering would need to be done in application layer
    // since pricing is stored as JSON
    const products = await prisma.product.findMany({
      where,
      include: { vendor: true }
    });

    // Apply price filters
    return products.filter(product => {
      const price = product.pricing?.list || 0;
      if (filters.minPrice && price < filters.minPrice) return false;
      if (filters.maxPrice && price > filters.maxPrice) return false;
      return true;
    });
  }

  // Genetics Marketplace
  async listGenetics(data: {
    vendorId: string;
    strain: string;
    type: string;
    lineage: string;
    thcMin: number;
    thcMax: number;
    cbdMin: number;
    cbdMax: number;
    terpenes: string[];
    floweringTime: number;
    yieldPotential: string;
    licensingType: string;
    royaltyRate?: number;
    minimumOrder?: number;
    territoryRestrictions?: string[];
    availability: number;
    price: number;
    certifications: string[];
    labResults?: string;
    images: string[];
    description: string;
  }) {
    return await prisma.geneticListing.create({
      data: {
        vendorId: data.vendorId,
        strain: data.strain,
        type: data.type,
        genetics: {
          lineage: data.lineage,
          thc: { min: data.thcMin, max: data.thcMax },
          cbd: { min: data.cbdMin, max: data.cbdMax },
          terpenes: data.terpenes,
          floweringTime: data.floweringTime,
          yieldPotential: data.yieldPotential
        },
        licensing: {
          type: data.licensingType,
          royaltyRate: data.royaltyRate,
          minimumOrder: data.minimumOrder,
          territoryRestrictions: data.territoryRestrictions
        },
        availability: data.availability,
        price: data.price,
        certifications: data.certifications,
        labResults: data.labResults,
        images: data.images,
        description: data.description
      }
    });
  }

  async searchGenetics(filters: {
    type?: string;
    thcMin?: number;
    cbdMin?: number;
    floweringTimeMax?: number;
    licensingType?: string;
  }) {
    const genetics = await prisma.geneticListing.findMany({
      where: {
        type: filters.type,
        availability: { gt: 0 }
      },
      include: { vendor: true }
    });

    // Apply additional filters on JSON fields
    return genetics.filter(genetic => {
      if (filters.thcMin && genetic.genetics?.thc?.min < filters.thcMin) return false;
      if (filters.cbdMin && genetic.genetics?.cbd?.min < filters.cbdMin) return false;
      if (filters.floweringTimeMax && genetic.genetics?.floweringTime > filters.floweringTimeMax) return false;
      if (filters.licensingType && genetic.licensing?.type !== filters.licensingType) return false;
      return true;
    });
  }

  // Purchase Orders
  async createPurchaseOrder(buyerId: string, vendorId: string, items: {
    productId: string;
    quantity: number;
    price: number;
    notes?: string;
  }[]) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over $500

    return await prisma.purchaseOrder.create({
      data: {
        buyerId,
        vendorId,
        status: 'draft',
        items: items,
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
        }
      }
    });
  }

  async updatePurchaseOrderStatus(orderId: string, status: string) {
    return await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
  }

  async getPurchaseOrders(buyerId?: string, vendorId?: string) {
    const where: Prisma.PurchaseOrderWhereInput = {};
    if (buyerId) where.buyerId = buyerId;
    if (vendorId) where.vendorId = vendorId;

    return await prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: true,
        buyer: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // RFQ System
  async createRFQ(data: {
    buyerId: string;
    title: string;
    description: string;
    requirements: {
      category: string;
      quantity: number;
      specifications?: any;
      targetPrice?: number;
    }[];
    deadline: Date;
    deliveryDate: Date;
    shippingAddress: string;
  }) {
    return await prisma.rfq.create({
      data: {
        buyerId: data.buyerId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        deadline: data.deadline,
        deliveryDate: data.deliveryDate,
        shippingAddress: data.shippingAddress,
        status: 'open'
      }
    });
  }

  async submitQuote(data: {
    rfqId: string;
    vendorId: string;
    items: {
      requirementIndex: number;
      price: number;
      leadTime: number;
      notes?: string;
    }[];
    totalPrice: number;
    validUntil: Date;
    terms: string;
    attachments?: string[];
  }) {
    // First check if RFQ exists and is open
    const rfq = await prisma.rfq.findUnique({
      where: { id: data.rfqId }
    });

    if (!rfq || rfq.status !== 'open') {
      throw new Error('RFQ not found or not accepting quotes');
    }

    return await prisma.quote.create({
      data: {
        rfqId: data.rfqId,
        vendorId: data.vendorId,
        items: data.items,
        totalPrice: data.totalPrice,
        validUntil: data.validUntil,
        terms: data.terms,
        attachments: data.attachments || [],
        status: 'submitted'
      }
    });
  }

  // Recommendations
  async getRecommendedProducts(userId: string, category?: string) {
    // Get user's purchase history
    const userOrders = await prisma.purchaseOrder.findMany({
      where: { buyerId: userId },
      include: { vendor: true }
    });

    // Get preferred vendors based on order history
    const preferredVendorIds = [...new Set(userOrders.map(o => o.vendorId))];

    // Get highly rated verified vendors
    const topVendors = await prisma.vendor.findMany({
      where: {
        verified: true,
        rating: { gte: 4 }
      },
      select: { id: true },
      orderBy: { rating: 'desc' },
      take: 10
    });

    const vendorIds = [...preferredVendorIds, ...topVendors.map(v => v.id)];

    // Get products from these vendors
    return await prisma.product.findMany({
      where: {
        vendorId: { in: vendorIds },
        availability: 'in-stock',
        ...(category && { category })
      },
      include: { vendor: true },
      orderBy: [
        { vendor: { rating: 'desc' } },
        { updatedAt: 'desc' }
      ],
      take: 10
    });
  }

  // Analytics
  async getMarketplaceStats() {
    const [
      totalVendors,
      totalProducts,
      totalGenetics,
      activeOrders,
      openRFQs
    ] = await Promise.all([
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.geneticListing.count(),
      prisma.purchaseOrder.count({
        where: {
          status: { in: ['submitted', 'accepted', 'processing', 'shipped'] }
        }
      }),
      prisma.rfq.count({
        where: { status: 'open' }
      })
    ]);

    return {
      totalVendors,
      totalProducts,
      totalGenetics,
      activeOrders,
      openRFQs
    };
  }
}

export const marketplaceDB = new MarketplaceDB();