// Stripe library stub implementation
export const stripe = null;

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    features: ['Basic features'],
    price: 0,
  },
  pro: {
    name: 'Pro',
    features: ['All features'],
    price: 10,
  },
  enterprise: {
    name: 'Enterprise',
    features: ['Enterprise features'],
    price: 100,
  },
};

export const hasFeatureAccess = (tier: string, feature: string): boolean => {
  // Stub implementation
  return true;
};

export const createCheckoutSession = async () => {
  console.warn('Stripe checkout session not implemented');
  return { sessionId: '' };
};

export const createPortalSession = async () => {
  console.warn('Stripe portal session not implemented');
  return { url: '' };
};

export const getProducts = async () => {
  console.warn('Stripe products not implemented');
  return [];
};

export const getPrices = async () => {
  console.warn('Stripe prices not implemented');
  return [];
};