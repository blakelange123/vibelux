import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  : null as any;

// Client-side Stripe promise - temporarily disabled to fix development issues
export const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Legacy function for backward compatibility
export const getStripeJs = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return stripePromise;
};

// Updated pricing plans to match new homepage tiers
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    description: '14-day trial with limited features',
    price: {
      monthly: 0,
      annually: 0
    },
    interval: null,
    stripePriceId: null,
    features: [
      'Room size up to 100 sq ft',
      '1 grow room',
      'Basic PPFD calculations',
      'Limited DLC fixtures',
      'Export to PDF',
      '5 AI Assistant queries/month',
      'Community forum access'
    ],
    limitations: {
      roomSize: 100, // sq ft
      rooms: 1,
      fixtures: 50,
      users: 1,
      exportFormats: ['pdf'],
      aiQueries: 5,
      tiers: 1
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small growers and hobbyists',
    price: {
      monthly: 29,
      annually: 25 // per month when billed annually
    },
    stripePriceId: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID
    },
    interval: 'month',
    features: [
      'Up to 5 grow rooms',
      'Room size up to 1,000 sq ft',
      'Basic PPFD calculations',
      'Limited DLC fixture database',
      'Export to PDF',
      'Email support',
      '25 AI Assistant queries/month',
      'Basic analytics',
      'Single tier support'
    ],
    limitations: {
      roomSize: 1000,
      rooms: 5,
      fixtures: 200,
      users: 1,
      exportFormats: ['pdf'],
      aiQueries: 25,
      tiers: 1
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For serious cultivators and consultants',
    price: {
      monthly: 79,
      annually: 67 // per month when billed annually
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_PRO_ANNUAL_PRICE_ID
    },
    interval: 'month',
    features: [
      'Unlimited grow rooms',
      'Unlimited room size',
      'Advanced PPFD & spectrum analysis',
      'Full DLC database access (1,200+ fixtures)',
      'CAD & 3D exports',
      'Priority email support',
      '100 AI Assistant queries/month',
      'Advanced analytics',
      'Multi-tier support (up to 10)',
      'Custom reporting',
      'ML Yield Predictor',
      'ROI calculations',
      'Spectrum optimizer'
    ],
    limitations: {
      roomSize: -1, // unlimited
      rooms: -1,
      fixtures: 1200,
      users: 1,
      exportFormats: ['pdf', 'cad', 'excel', 'csv', '3d'],
      aiQueries: 100,
      tiers: 10
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Built for commercial operations',
    price: {
      monthly: 199,
      annually: 169 // per month when billed annually
    },
    stripePriceId: {
      monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID
    },
    interval: 'month',
    features: [
      'Everything in Professional',
      'Multi-facility management',
      'Team collaboration (5 users)',
      '500 AI Assistant queries/month',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Phone & video support',
      'Advanced ML features',
      'Disease detection AI',
      'Utility rebate calculator',
      'White-label reports'
    ],
    limitations: {
      roomSize: -1,
      rooms: -1,
      fixtures: -1,
      users: 5,
      exportFormats: ['pdf', 'cad', 'excel', 'csv', '3d', 'api'],
      aiQueries: 500,
      tiers: -1
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Tailored for large-scale operations',
    price: {
      monthly: null, // custom pricing
      annually: null
    },
    stripePriceId: {
      monthly: null,
      annually: null
    },
    interval: 'custom',
    features: [
      'Everything in Business',
      'Unlimited users',
      'Unlimited AI queries',
      'Custom branding',
      'On-premise deployment option',
      'SLA guarantees (99.9% uptime)',
      '24/7 dedicated support',
      'Custom feature development',
      'Training & onboarding',
      'Compliance certification',
      'Advanced security features',
      'Priority infrastructure'
    ],
    limitations: {
      roomSize: -1,
      rooms: -1,
      fixtures: -1,
      users: -1,
      exportFormats: ['all', 'custom'],
      aiQueries: -1,
      tiers: -1
    }
  }
};

export type PricingPlan = typeof PRICING_PLANS[keyof typeof PRICING_PLANS];

// Subscription status interface
export interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';
  plan: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

/**
 * Format price for display
 */
export function formatPrice(priceInDollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInDollars);
}

/**
 * Check if user has access to a feature based on their plan
 */
export function hasFeatureAccess(userPlan: string, feature: string): boolean {
  const featureMatrix = {
    free: [
      'basic_design',
      'pdf_export',
      'basic_ppfd',
      'dlc_fixtures_limited',
      'ai_queries_limited',
      'community_support'
    ],
    starter: [
      'basic_design',
      'pdf_export',
      'basic_ppfd',
      'dlc_fixtures_limited',
      'ai_queries_limited',
      'email_support',
      'multi_room_limited',
      'basic_analytics'
    ],
    professional: [
      'unlimited_design',
      'all_exports',
      'advanced_ppfd',
      'dlc_fixtures_full',
      'multi_tier',
      'ai_queries_standard',
      'ml_yield_predictor',
      'spectrum_optimizer',
      'roi_analysis',
      'custom_reporting',
      'priority_email_support',
      'advanced_analytics'
    ],
    business: [
      'all_professional_features',
      'multi_facility',
      'team_collaboration',
      'ai_queries_extended',
      'api_full',
      'custom_integrations',
      'disease_detection',
      'phone_support',
      'account_manager',
      'white_label_reports'
    ],
    enterprise: [
      'all_features',
      'unlimited_everything',
      'custom_branding',
      'on_premise',
      'sla_guarantees',
      'dedicated_support',
      'custom_development',
      'training',
      'compliance_cert',
      'priority_infrastructure'
    ]
  };

  // Get the user's plan level
  const planLevel = userPlan;

  // Enterprise gets everything
  if (planLevel === 'enterprise') return true;
  
  // Business gets business + professional + starter + free features
  if (planLevel === 'business') {
    return featureMatrix.business.includes(feature) || 
           featureMatrix.professional.includes(feature) ||
           featureMatrix.starter.includes(feature) ||
           featureMatrix.free.includes(feature) ||
           featureMatrix.business.includes('all_professional_features');
  }
  
  // Professional gets professional + starter + free features
  if (planLevel === 'professional') {
    return featureMatrix.professional.includes(feature) || 
           featureMatrix.starter.includes(feature) ||
           featureMatrix.free.includes(feature);
  }
  
  // Starter gets starter + free features
  if (planLevel === 'starter') {
    return featureMatrix.starter.includes(feature) || 
           featureMatrix.free.includes(feature);
  }
  
  // Free only gets free features
  return featureMatrix.free.includes(feature);
}