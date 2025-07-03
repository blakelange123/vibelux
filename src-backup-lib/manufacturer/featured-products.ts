export interface FeaturedProduct {
  id: string;
  manufacturerId: string;
  manufacturer: {
    name: string;
    logo?: string;
    website: string;
    description: string;
    tier: 'basic' | 'premium' | 'platinum';
  };
  product: {
    name: string;
    model: string;
    image: string;
    category: 'linear' | 'highbay' | 'panel' | 'spotlight' | 'grow' | 'specialty';
    wattage: number;
    lumens: number;
    ppf?: number;
    efficacy: number;
    beamAngle: number;
    cct?: string; // Color temperature
    cri?: number; // Color rendering index
    spectrum?: {
      blue: number;
      green: number;
      red: number;
      farRed: number;
      uv?: number;
    };
    dimming: boolean;
    voltage: string;
    lifespan: number;
    warranty: number;
    certifications: string[];
    features: string[];
    applications: string[];
    price?: {
      msrp: number;
      dealerPrice?: number;
      currency: string;
    };
  };
  featured: {
    startDate: Date;
    endDate: Date;
    placement: 'carousel' | 'sidebar' | 'popup' | 'library';
    priority: number; // 1-10, higher is more prominent
    impressions: number;
    clicks: number;
    designs: number; // Number of times used in designs
  };
  promotions?: {
    discount?: number;
    message?: string;
    code?: string;
  };
}

export interface ManufacturerSubmission {
  companyInfo: {
    name: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    country: string;
  };
  products: {
    name: string;
    model: string;
    datasheet: File | string; // PDF or URL
    iesFile?: File | string; // IES photometric file
    images: (File | string)[];
    specifications: any; // JSON specification data
  }[];
  marketingMaterials?: {
    logo: File | string;
    bannerImage?: File | string;
    description: string;
    videos?: string[];
  };
  certifications: {
    dlc?: boolean;
    energyStar?: boolean;
    ulListing?: boolean;
    other?: string[];
  };
  requestedTier: 'basic' | 'premium' | 'platinum';
}

export class ManufacturerFeaturedProducts {
  private static featuredProducts: Map<string, FeaturedProduct> = new Map();
  
  // Get currently featured products
  static getFeaturedProducts(options?: {
    placement?: string;
    category?: string;
    limit?: number;
  }): FeaturedProduct[] {
    const now = new Date();
    let products = Array.from(this.featuredProducts.values())
      .filter(p => {
        const isActive = p.featured.startDate <= now && p.featured.endDate >= now;
        const matchesPlacement = !options?.placement || p.featured.placement === options.placement;
        const matchesCategory = !options?.category || p.product.category === options.category;
        return isActive && matchesPlacement && matchesCategory;
      })
      .sort((a, b) => b.featured.priority - a.featured.priority);
    
    if (options?.limit) {
      products = products.slice(0, options.limit);
    }
    
    return products;
  }
  
  // Track product impression
  static trackImpression(productId: string) {
    const product = this.featuredProducts.get(productId);
    if (product) {
      product.featured.impressions++;
    }
  }
  
  // Track product click
  static trackClick(productId: string) {
    const product = this.featuredProducts.get(productId);
    if (product) {
      product.featured.clicks++;
    }
  }
  
  // Track product used in design
  static trackDesignUse(productId: string) {
    const product = this.featuredProducts.get(productId);
    if (product) {
      product.featured.designs++;
    }
  }
  
  // Get manufacturer tier benefits
  static getTierBenefits(tier: 'basic' | 'premium' | 'platinum') {
    const benefits = {
      basic: {
        products: 5,
        placements: ['library'],
        priority: 3,
        analytics: false,
        support: 'email',
        price: 299 // per month
      },
      premium: {
        products: 20,
        placements: ['library', 'sidebar'],
        priority: 6,
        analytics: true,
        support: 'priority',
        customBranding: true,
        price: 999
      },
      platinum: {
        products: 'unlimited',
        placements: ['library', 'sidebar', 'carousel', 'popup'],
        priority: 10,
        analytics: true,
        apiAccess: true,
        support: 'dedicated',
        customBranding: true,
        coMarketing: true,
        price: 2999
      }
    };
    
    return benefits[tier];
  }
  
  // Submit manufacturer application
  static async submitApplication(submission: ManufacturerSubmission): Promise<{
    success: boolean;
    applicationId?: string;
    message: string;
  }> {
    try {
      // Here you would typically send this to your backend API
      // For now, we'll simulate the submission
      const applicationId = `MFG-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).substr(2, 9)}`;
      
      // Application submission debug info would be logged here
      
      return {
        success: true,
        applicationId,
        message: 'Your application has been submitted successfully. Our team will review it within 2-3 business days.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit application. Please try again later.'
      };
    }
  }
  
  // Get analytics for manufacturer
  static getManufacturerAnalytics(manufacturerId: string) {
    const products = Array.from(this.featuredProducts.values())
      .filter(p => p.manufacturerId === manufacturerId);
    
    const totalImpressions = products.reduce((sum, p) => sum + p.featured.impressions, 0);
    const totalClicks = products.reduce((sum, p) => sum + p.featured.clicks, 0);
    const totalDesigns = products.reduce((sum, p) => sum + p.featured.designs, 0);
    
    return {
      products: products.length,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
      designs: totalDesigns,
      conversionRate: totalClicks > 0 ? (totalDesigns / totalClicks * 100).toFixed(2) : 0,
      topProducts: products
        .sort((a, b) => b.featured.designs - a.featured.designs)
        .slice(0, 5)
        .map(p => ({
          name: p.product.name,
          model: p.product.model,
          designs: p.featured.designs,
          clicks: p.featured.clicks
        }))
    };
  }
}

// Example featured products (would typically come from database)
export const FEATURED_PRODUCTS_SAMPLE: FeaturedProduct[] = [
  {
    id: 'fp-001',
    manufacturerId: 'mfg-fluence',
    manufacturer: {
      name: 'Fluence Bioengineering',
      logo: '/logos/fluence.png',
      website: 'https://fluence.science',
      description: 'Global leader in LED lighting solutions for commercial crop production',
      tier: 'platinum'
    },
    product: {
      name: 'SPYDR 2p',
      model: 'SPY2P44',
      image: '/products/fluence-spydr-2p.jpg',
      category: 'grow',
      wattage: 645,
      lumens: 0,
      ppf: 1700,
      efficacy: 2.6,
      beamAngle: 120,
      spectrum: {
        blue: 15,
        green: 30,
        red: 40,
        farRed: 15
      },
      dimming: true,
      voltage: '277-480V',
      lifespan: 50000,
      warranty: 5,
      certifications: ['DLC', 'UL', 'IP66'],
      features: [
        'High-efficacy broad spectrum',
        'Optimized for flowering',
        'Dimming control 0-10V',
        'Daisy chain capable'
      ],
      applications: ['Cannabis', 'Tomatoes', 'Leafy Greens'],
      price: {
        msrp: 1299,
        currency: 'USD'
      }
    },
    featured: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      placement: 'carousel',
      priority: 10,
      impressions: 0,
      clicks: 0,
      designs: 0
    },
    promotions: {
      discount: 10,
      message: 'Save 10% on bulk orders over 100 units',
      code: 'BULK10'
    }
  }
];