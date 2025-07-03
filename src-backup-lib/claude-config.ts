import Anthropic from '@anthropic-ai/sdk';

// Production-ready Claude configuration
export const CLAUDE_CONFIG = {
  // Use environment variable only - no hardcoded keys for security
  apiKey: process.env.CLAUDE_API_KEY || '',
  
  // Default model configurations - using the best available models
  models: {
    design: 'claude-3-5-sonnet-20241022',    // Best overall model - fast, capable, and cost-effective
    simple: 'claude-3-5-sonnet-20241022',    // Same model for consistency 
    haiku: 'claude-3-haiku-20240307'         // Ultra-fast for simple queries when needed
  },
  
  // Claude 3.5 supports 200k context window - no need for restrictive limits
  tokenLimits: {
    small: 100000,     // <5,000 sq ft (100k tokens)
    medium: 150000,    // 5,000-10,000 sq ft (150k tokens) 
    large: 180000,     // 10,000-20,000 sq ft (180k tokens)
    xlarge: 200000     // >20,000 sq ft (200k tokens - max context)
  },
  
  // Rate limiting configuration
  rateLimits: {
    maxRetries: 5,
    retryDelay: 2000,       // Claude has better rate limits
    backoffFactor: 2,
    timeout: 120000,        // 120s timeout
    jitter: true
  },
  
  // Usage tracking
  tracking: {
    logUsage: true,
    alertThreshold: 0.8   // Alert at 80% usage
  }
};

// Create configured Claude client
export function createClaudeClient() {
  if (!CLAUDE_CONFIG.apiKey) {
    throw new Error('Claude API key not configured. Set CLAUDE_API_KEY in environment.');
  }
  
  
  try {
    return new Anthropic({
      apiKey: CLAUDE_CONFIG.apiKey,
    });
  } catch (error) {
    console.error('Failed to create Claude client:', error);
    throw error;
  }
}

// Helper to select appropriate model based on query complexity
export function selectModel(queryType: 'design' | 'simple' | 'fast' = 'design') {
  if (queryType === 'fast') return CLAUDE_CONFIG.models.haiku;
  return queryType === 'simple' ? CLAUDE_CONFIG.models.simple : CLAUDE_CONFIG.models.design;
}

// Helper to get token limit based on facility size
export function getTokenLimit(facilityArea: number): number {
  if (facilityArea > 20000) return CLAUDE_CONFIG.tokenLimits.xlarge;
  if (facilityArea > 10000) return CLAUDE_CONFIG.tokenLimits.large;
  if (facilityArea > 5000) return CLAUDE_CONFIG.tokenLimits.medium;
  return CLAUDE_CONFIG.tokenLimits.small;
}

// Production readiness checklist
export function checkProductionReadiness(): {
  ready: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!CLAUDE_CONFIG.apiKey) {
    issues.push('Claude API key not set');
  }
  
  if (!process.env.STRIPE_SECRET_KEY) {
    issues.push('Stripe not configured for usage billing');
  }
  
  return {
    ready: issues.length === 0,
    issues
  };
}