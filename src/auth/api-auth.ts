import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { RateLimiter } from '@/lib/monitoring/error-handler';

export interface AuthContext {
  userId?: string;
  customerId?: string;
  role: UserRole;
  permissions: string[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  CUSTOMER = 'CUSTOMER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  API_CLIENT = 'API_CLIENT',
}

export interface ApiKeyAuth {
  id: string;
  customerId: string;
  keyHash: string;
  permissions: string[];
  rateLimit: number;
  lastUsed: Date;
  expiresAt?: Date;
  active: boolean;
}

export class ApiAuthManager {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  
  static {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }
  private static readonly API_KEY_PREFIX = 'vbl_';

  /**
   * Authenticate API request
   */
  static async authenticate(req: NextApiRequest): Promise<AuthContext> {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    if (authHeader.startsWith('Bearer ')) {
      // JWT Authentication
      return await this.authenticateJWT(authHeader.substring(7));
    } else if (authHeader.startsWith('ApiKey ')) {
      // API Key Authentication
      return await this.authenticateApiKey(authHeader.substring(7), req);
    } else {
      throw new Error('Invalid authorization header format');
    }
  }

  /**
   * Authenticate JWT token
   */
  private static async authenticateJWT(token: string): Promise<AuthContext> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // Get user from database to ensure still active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          subscriptionTier: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.id,
        role: user.role as UserRole,
        permissions: this.getRolePermissions(user.role as UserRole, user.subscriptionTier),
      };
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  /**
   * Authenticate API key
   */
  private static async authenticateApiKey(apiKey: string, req: NextApiRequest): Promise<AuthContext> {
    if (!apiKey.startsWith(this.API_KEY_PREFIX)) {
      throw new Error('Invalid API key format');
    }

    // Hash the API key for lookup
    const keyHash = this.hashApiKey(apiKey);
    
    // Find API key in database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { customer: true }
    });

    if (!apiKeyRecord || !apiKeyRecord.active) {
      throw new Error('Invalid or inactive API key');
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new Error('API key expired');
    }

    // Rate limiting
    const clientIP = this.getClientIP(req);
    const rateLimitKey = `api_key_${apiKeyRecord.id}_${clientIP}`;
    const rateLimit = RateLimiter.checkLimit(rateLimitKey, apiKeyRecord.rateLimit, 60000);
    
    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded');
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() }
    });

    return {
      customerId: apiKeyRecord.customerId,
      role: UserRole.API_CLIENT,
      permissions: apiKeyRecord.permissions,
    };
  }

  /**
   * Check if user has required permission
   */
  static hasPermission(context: AuthContext, permission: string): boolean {
    // Admin has all permissions
    if (context.role === UserRole.ADMIN) {
      return true;
    }

    return context.permissions.includes(permission);
  }

  /**
   * Check if user can access customer data
   */
  static canAccessCustomer(context: AuthContext, customerId: string): boolean {
    // Admin can access all
    if (context.role === UserRole.ADMIN) {
      return true;
    }

    // API clients can only access their own customer data
    if (context.role === UserRole.API_CLIENT) {
      return context.customerId === customerId;
    }

    // Regular users need specific permission
    return context.permissions.includes('customer:read');
  }

  /**
   * Generate API key for customer
   */
  static async generateApiKey(
    customerId: string,
    permissions: string[],
    rateLimit: number = 1000,
    expiresAt?: Date
  ): Promise<string> {
    const apiKey = this.generateSecureApiKey();
    const keyHash = this.hashApiKey(apiKey);

    await prisma.apiKey.create({
      data: {
        customerId,
        keyHash,
        permissions,
        rateLimit,
        expiresAt,
        active: true,
        createdAt: new Date(),
      }
    });

    return apiKey;
  }

  /**
   * Revoke API key
   */
  static async revokeApiKey(apiKey: string): Promise<void> {
    const keyHash = this.hashApiKey(apiKey);
    
    await prisma.apiKey.update({
      where: { keyHash },
      data: { active: false }
    });
  }

  /**
   * Get role permissions
   */
  private static getRolePermissions(role: UserRole, subscriptionTier?: string): string[] {
    const basePermissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ['*'], // All permissions
      [UserRole.USER]: [
        'profile:read',
        'profile:write',
        'facilities:read',
        'sensors:read',
        'experiments:read',
        'experiments:write',
      ],
      [UserRole.CUSTOMER]: [
        'customer:read',
        'utility:read',
        'utility:write',
        'invoices:read',
        'payments:read',
        'compliance:read',
      ],
      [UserRole.SERVICE_PROVIDER]: [
        'service_requests:read',
        'service_requests:write',
        'work_orders:read',
        'work_orders:write',
        'profile:read',
        'profile:write',
      ],
      [UserRole.API_CLIENT]: [
        'api:read',
        'utility:read',
        'iot:read',
        'ml:read',
      ],
    };

    const permissions = basePermissions[role] || [];

    // Add subscription tier permissions
    if (subscriptionTier === 'PREMIUM') {
      permissions.push('ml:advanced', 'analytics:advanced');
    } else if (subscriptionTier === 'ENTERPRISE') {
      permissions.push('ml:advanced', 'analytics:advanced', 'api:write', 'webhooks:manage');
    }

    return permissions;
  }

  /**
   * Generate secure API key
   */
  private static generateSecureApiKey(): string {
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${this.API_KEY_PREFIX}${randomBytes}`;
  }

  /**
   * Hash API key for storage
   */
  private static hashApiKey(apiKey: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Get client IP address
   */
  private static getClientIP(req: NextApiRequest): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection?.remoteAddress ||
      'unknown'
    ).split(',')[0].trim();
  }
}

/**
 * Middleware for API authentication
 */
export function withAuth(
  requiredPermissions: string[] = [],
  allowApiKey: boolean = true
) {
  return function (
    handler: (req: NextApiRequest, res: NextApiResponse, context: AuthContext) => Promise<void>
  ) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Skip auth for OPTIONS requests
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }

        // Authenticate request
        const context = await ApiAuthManager.authenticate(req);

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.every(permission =>
            ApiAuthManager.hasPermission(context, permission)
          );

          if (!hasPermission) {
            return res.status(403).json({
              success: false,
              error: 'Insufficient permissions'
            });
          }
        }

        // Call handler with auth context
        await handler(req, res, context);
      } catch (error) {
        const message = (error as Error).message;
        
        if (message.includes('Missing authorization') || 
            message.includes('Invalid') || 
            message.includes('expired')) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        if (message.includes('Rate limit')) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded'
          });
        }

        return res.status(500).json({
          success: false,
          error: 'Authentication error'
        });
      }
    };
  };
}

/**
 * Middleware for admin-only endpoints
 */
export function withAdminAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, context: AuthContext) => Promise<void>
) {
  return withAuth(['admin:all'], false)(handler);
}

/**
 * Middleware for customer data endpoints
 */
export function withCustomerAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, context: AuthContext) => Promise<void>
) {
  return withAuth(['customer:read'])(async (req: NextApiRequest, res: NextApiResponse, context: AuthContext) => {
    // Additional check for customer data access
    const customerId = req.body?.customerId || req.query?.customerId as string;
    
    if (customerId && !ApiAuthManager.canAccessCustomer(context, customerId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to customer data'
      });
    }

    await handler(req, res, context);
  });
}