/**
 * Marketplace Configuration
 * Controls behavior for integrated vs standalone deployment
 */

export interface MarketplaceConfig {
  // Deployment mode
  mode: 'integrated' | 'hybrid' | 'standalone';
  
  // Branding
  branding: {
    name: string;
    logo: string;
    domain: string;
    tagline: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  
  // Feature flags
  features: {
    useVibeLuxAuth: boolean;
    importFacilityData: boolean;
    sharedAnalytics: boolean;
    customCheckout: boolean;
    whiteLabel: boolean;
  };
  
  // Integration settings
  integration: {
    vibeluxAPI?: string;
    authMode: 'shared' | 'federated' | 'separate';
    dataSync: 'realtime' | 'batch' | 'manual' | 'none';
    ssoEnabled: boolean;
  };
  
  // Business rules
  business: {
    commissionRate: number;
    minimumPayout: number;
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    supportedRegions: string[];
    requiredCertifications: string[];
  };
  
  // API configuration
  api: {
    baseURL: string;
    version: string;
    rateLimit: number;
    authentication: 'jwt' | 'apikey' | 'oauth2';
  };
}

// Development configuration
const development: MarketplaceConfig = {
  mode: 'integrated',
  branding: {
    name: 'VibeLux Marketplace',
    logo: '/vibelux-logo.svg',
    domain: 'localhost:3000/marketplace',
    tagline: 'Fresh CEA Produce Direct from Growers',
    colors: {
      primary: '#10b981', // green-500
      secondary: '#8b5cf6', // purple-500
      accent: '#f59e0b' // amber-500
    }
  },
  features: {
    useVibeLuxAuth: true,
    importFacilityData: true,
    sharedAnalytics: true,
    customCheckout: false,
    whiteLabel: false
  },
  integration: {
    vibeluxAPI: 'http://localhost:3000/api',
    authMode: 'shared',
    dataSync: 'realtime',
    ssoEnabled: true
  },
  business: {
    commissionRate: 0.05, // 5%
    minimumPayout: 50,
    payoutSchedule: 'weekly',
    supportedRegions: ['US'],
    requiredCertifications: []
  },
  api: {
    baseURL: 'http://localhost:3000/api/marketplace',
    version: 'v1',
    rateLimit: 100,
    authentication: 'jwt'
  }
};

// Production - Integrated Mode
const productionIntegrated: MarketplaceConfig = {
  mode: 'integrated',
  branding: {
    name: 'VibeLux Marketplace',
    logo: '/vibelux-logo.svg',
    domain: 'app.vibelux.com/marketplace',
    tagline: 'Fresh CEA Produce Direct from Growers',
    colors: {
      primary: '#10b981',
      secondary: '#8b5cf6',
      accent: '#f59e0b'
    }
  },
  features: {
    useVibeLuxAuth: true,
    importFacilityData: true,
    sharedAnalytics: true,
    customCheckout: false,
    whiteLabel: false
  },
  integration: {
    vibeluxAPI: 'https://api.vibelux.com',
    authMode: 'shared',
    dataSync: 'realtime',
    ssoEnabled: true
  },
  business: {
    commissionRate: 0.05,
    minimumPayout: 50,
    payoutSchedule: 'weekly',
    supportedRegions: ['US', 'CA'],
    requiredCertifications: ['GAP', 'USDA Organic']
  },
  api: {
    baseURL: 'https://api.vibelux.com/marketplace',
    version: 'v1',
    rateLimit: 1000,
    authentication: 'jwt'
  }
};

// Production - Hybrid Mode (Subdomain)
const productionHybrid: MarketplaceConfig = {
  mode: 'hybrid',
  branding: {
    name: 'CEA Connect',
    logo: '/cea-connect-logo.svg',
    domain: 'marketplace.vibelux.com',
    tagline: 'The B2B Marketplace for Controlled Environment Agriculture',
    colors: {
      primary: '#059669', // emerald-600
      secondary: '#7c3aed', // violet-600
      accent: '#dc2626' // red-600
    }
  },
  features: {
    useVibeLuxAuth: true,
    importFacilityData: true,
    sharedAnalytics: false,
    customCheckout: true,
    whiteLabel: false
  },
  integration: {
    vibeluxAPI: 'https://api.vibelux.com',
    authMode: 'federated',
    dataSync: 'batch',
    ssoEnabled: true
  },
  business: {
    commissionRate: 0.035, // 3.5%
    minimumPayout: 100,
    payoutSchedule: 'weekly',
    supportedRegions: ['US', 'CA', 'MX'],
    requiredCertifications: []
  },
  api: {
    baseURL: 'https://api.marketplace.vibelux.com',
    version: 'v1',
    rateLimit: 5000,
    authentication: 'jwt'
  }
};

// Production - Standalone Mode
const productionStandalone: MarketplaceConfig = {
  mode: 'standalone',
  branding: {
    name: 'FreshLink',
    logo: '/freshlink-logo.svg',
    domain: 'freshlink.io',
    tagline: 'Direct from Indoor Farms to Your Business',
    colors: {
      primary: '#16a34a', // green-600
      secondary: '#0891b2', // cyan-600
      accent: '#ea580c' // orange-600
    }
  },
  features: {
    useVibeLuxAuth: false,
    importFacilityData: false,
    sharedAnalytics: false,
    customCheckout: true,
    whiteLabel: true
  },
  integration: {
    vibeluxAPI: 'https://api.vibelux.com',
    authMode: 'separate',
    dataSync: 'manual',
    ssoEnabled: false
  },
  business: {
    commissionRate: 0.025, // 2.5%
    minimumPayout: 100,
    payoutSchedule: 'daily',
    supportedRegions: ['US', 'CA', 'MX', 'EU', 'UK'],
    requiredCertifications: []
  },
  api: {
    baseURL: 'https://api.freshlink.io',
    version: 'v2',
    rateLimit: 10000,
    authentication: 'oauth2'
  }
};

// Configuration selector based on environment
export function getMarketplaceConfig(): MarketplaceConfig {
  const mode = process.env.NEXT_PUBLIC_MARKETPLACE_MODE || 'integrated';
  const env = process.env.NODE_ENV;
  
  if (env === 'development') {
    return development;
  }
  
  switch (mode) {
    case 'hybrid':
      return productionHybrid;
    case 'standalone':
      return productionStandalone;
    case 'integrated':
    default:
      return productionIntegrated;
  }
}

// Helper to check if marketplace is standalone
export function isStandalone(): boolean {
  return getMarketplaceConfig().mode === 'standalone';
}

// Helper to get marketplace branding
export function getMarketplaceBranding() {
  return getMarketplaceConfig().branding;
}

// Helper to check feature availability
export function hasMarketplaceFeature(feature: keyof MarketplaceConfig['features']): boolean {
  return getMarketplaceConfig().features[feature];
}

export default getMarketplaceConfig();