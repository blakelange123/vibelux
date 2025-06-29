import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Rate limiting store (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token store (replace with secure session storage in production)
const csrfTokens = new Map<string, string>();

export class MarketplaceSecurityMiddleware {
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private static readonly RATE_LIMIT_MAX_REQUESTS = 100;

  /**
   * Rate limiting middleware
   */
  static rateLimit(request: NextRequest, identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW;
    
    const current = rateLimitStore.get(identifier) || { count: 0, resetTime: now };
    
    if (current.resetTime < windowStart) {
      // Reset window
      current.count = 1;
      current.resetTime = now;
    } else {
      current.count++;
    }
    
    rateLimitStore.set(identifier, current);
    
    return current.count <= this.RATE_LIMIT_MAX_REQUESTS;
  }

  /**
   * Input sanitization for marketplace data
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/[<>]/g, '') // Remove potential XSS tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
        .slice(0, 1000); // Limit length
    }
    
    if (typeof input === 'number') {
      if (!isFinite(input) || isNaN(input)) {
        throw new Error('Invalid numeric input');
      }
      return input;
    }
    
    if (Array.isArray(input)) {
      return input.slice(0, 100).map(item => this.sanitizeInput(item)); // Limit array size
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (typeof key === 'string' && key.length < 100) {
          sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Validate marketplace operations
   */
  static validateMarketplaceInput(data: any, operation: 'cart' | 'order' | 'listing'): string[] {
    const errors: string[] = [];
    
    if (operation === 'cart') {
      if (!data.productId || typeof data.productId !== 'string' || data.productId.length > 50) {
        errors.push('Invalid product ID');
      }
      
      if (data.quantity !== undefined && (typeof data.quantity !== 'number' || data.quantity < 0 || data.quantity > 1000)) {
        errors.push('Invalid quantity (must be 0-1000)');
      }
      
      if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0 || data.price > 1000000)) {
        errors.push('Invalid price (must be positive and reasonable)');
      }
    }
    
    if (operation === 'listing') {
      if (!data.title || typeof data.title !== 'string' || data.title.length < 3 || data.title.length > 200) {
        errors.push('Invalid title (3-200 characters)');
      }
      
      if (!data.description || typeof data.description !== 'string' || data.description.length < 10 || data.description.length > 5000) {
        errors.push('Invalid description (10-5000 characters)');
      }
      
      if (!data.price || typeof data.price !== 'number' || data.price <= 0 || data.price > 1000000) {
        errors.push('Invalid price');
      }
    }
    
    return errors;
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(userId: string): string {
    const token = crypto.randomUUID();
    csrfTokens.set(userId, token);
    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(userId: string, token: string): boolean {
    const storedToken = csrfTokens.get(userId);
    return storedToken === token;
  }

  /**
   * Platform protection - detect attempts to circumvent fees
   */
  static checkPlatformCircumvention(content: string): boolean {
    const suspiciousPatterns = [
      // Contact sharing patterns
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
      /\b(?:whatsapp|telegram|signal|discord)\b/i, // Messaging apps
      /\b(?:call|text|email|dm|direct)\s+(?:me|us)\b/i, // Direct contact requests
      /\b(?:off.?platform|outside|bypass|avoid.?fees)\b/i, // Platform avoidance
      // Unicode/obfuscation attempts
      /[\u200B-\u200D\uFEFF]/, // Zero-width characters
      /[^\x00-\x7F]+/g, // Non-ASCII characters in contact info context
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Complete security check for marketplace requests
   */
  static async securityCheck(request: NextRequest, operation: string): Promise<{
    error?: string;
    userId?: string;
  }> {
    try {
      // Authentication check
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: 'Authentication required' };
      }

      // Rate limiting
      const clientId = request.ip || userId;
      if (!this.rateLimit(request, clientId)) {
        return { success: false, error: 'Rate limit exceeded' };
      }

      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token');
        if (!csrfToken || !this.validateCSRFToken(userId, csrfToken)) {
          // For now, just log CSRF issues (implement full protection in production)
          console.warn('CSRF token missing or invalid for user:', userId);
        }
      }

      return { success: true, userId };
    } catch (error) {
      console.error('Security check failed:', error);
      return { success: false, error: 'Security validation failed' };
    }
  }
}

/**
 * Middleware wrapper for marketplace API routes
 */
export function withMarketplaceSecurity(
) {
  return async (request: NextRequest) => {
    const securityResult = await MarketplaceSecurityMiddleware.securityCheck(request, 'api');
    
    if (!securityResult.success) {
      return NextResponse.json(
        { error: securityResult.error },
        { status: securityResult.error?.includes('Rate limit') ? 429 : 401 }
      );
    }

    try {
      return await handler(request, { userId: securityResult.userId! });
    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}