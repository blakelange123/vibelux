import OpenAI from 'openai';

// Production-ready OpenAI configuration
export const OPENAI_CONFIG = {
  // Use environment variable with fallback
  apiKey: process.env.OPENAI_API_KEY || '',
  
  // Organization ID for better rate limits (optional)
  organization: process.env.OPENAI_ORG_ID,
  
  // Default model configurations
  models: {
    design: 'gpt-4-turbo-preview', // Best for complex design tasks
    simple: 'gpt-3.5-turbo',       // For simple queries (100x cheaper)
    vision: 'gpt-4-vision-preview'  // For image analysis
  },
  
  // Token limits by facility size
  tokenLimits: {
    small: 4000,      // <5,000 sq ft
    medium: 6000,     // 5,000-10,000 sq ft
    large: 8000,      // 10,000-20,000 sq ft
    xlarge: 10000     // >20,000 sq ft
  },
  
  // Rate limiting configuration
  rateLimits: {
    maxRetries: 5,          // Increased from 3
    retryDelay: 5000,       // Increased from 2000ms to 5000ms
    backoffFactor: 2.5,     // Increased from 2 to 2.5 for longer waits
    timeout: 120000,        // Increased from 90s to 120s
    jitter: true            // Add randomness to prevent thundering herd
  },
  
  // Usage tracking
  tracking: {
    logUsage: true,
    alertThreshold: 0.8   // Alert at 80% usage
  }
};

// Create configured OpenAI client
export function createOpenAIClient() {
  if (!OPENAI_CONFIG.apiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment.');
  }
  
  
  try {
    return new OpenAI({
      apiKey: OPENAI_CONFIG.apiKey,
      organization: OPENAI_CONFIG.organization,
      maxRetries: OPENAI_CONFIG.rateLimits.maxRetries,
      timeout: OPENAI_CONFIG.rateLimits.timeout,
    });
  } catch (error) {
    console.error('Failed to create OpenAI client:', error);
    throw error;
  }
}

// Helper to select appropriate model based on query complexity
export function selectModel(queryType: 'design' | 'simple' | 'vision' = 'design') {
  return OPENAI_CONFIG.models[queryType];
}

// Helper to get token limit based on facility size
export function getTokenLimit(facilityArea: number): number {
  if (facilityArea > 20000) return OPENAI_CONFIG.tokenLimits.xlarge;
  if (facilityArea > 10000) return OPENAI_CONFIG.tokenLimits.large;
  if (facilityArea > 5000) return OPENAI_CONFIG.tokenLimits.medium;
  return OPENAI_CONFIG.tokenLimits.small;
}

// Production readiness checklist
export function checkProductionReadiness(): {
  ready: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!OPENAI_CONFIG.apiKey) {
    issues.push('OpenAI API key not set');
  }
  
  if (!OPENAI_CONFIG.organization) {
    issues.push('OpenAI organization ID not set (optional but recommended for better rate limits)');
  }
  
  if (!process.env.STRIPE_SECRET_KEY) {
    issues.push('Stripe not configured for usage billing');
  }
  
  return {
    ready: issues.length === 0,
    issues
  };
}