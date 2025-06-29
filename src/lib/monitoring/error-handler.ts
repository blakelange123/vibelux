import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export interface ErrorContext {
  userId?: string;
  customerId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ipAddress?: string;
  requestData?: any;
  stack?: string;
}

export class ErrorHandler {
  static async logError(
    error: Error,
    context: ErrorContext = {}
  ): Promise<void> {
    try {
      // Log to database
      await prisma.apiLog.create({
        data: {
          endpoint: context.endpoint || 'unknown',
          method: context.method || 'unknown',
          statusCode: 500,
          requestData: context.requestData,
          responseData: null,
          errorMessage: error.message,
          responseTime: 0,
          userAgent: context.userAgent,
          ipAddress: context.ipAddress,
          userId: context.userId,
          customerId: context.customerId,
          createdAt: new Date(),
        }
      });

      // Create system alert for critical errors
      if (this.isCriticalError(error)) {
        await this.createSystemAlert(error, context);
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', {
          message: error.message,
          stack: error.stack,
          context
        });
      }

      // TODO: In production, send to external monitoring service (Sentry, DataDog, etc.)
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  static async logApiRequest(
    req: NextApiRequest,
    res: NextApiResponse,
    responseTime: number,
    error?: Error
  ): Promise<void> {
    try {
      const statusCode = error ? 500 : res.statusCode;
      
      await prisma.apiLog.create({
        data: {
          endpoint: req.url || 'unknown',
          method: req.method || 'unknown',
          statusCode,
          requestData: this.sanitizeRequestData(req.body),
          responseData: error ? null : undefined,
          errorMessage: error?.message,
          responseTime,
          userAgent: req.headers['user-agent'],
          ipAddress: this.getClientIP(req),
          userId: this.extractUserId(req),
          customerId: this.extractCustomerId(req),
          createdAt: new Date(),
        }
      });
    } catch (loggingError) {
      console.error('Failed to log API request:', loggingError);
    }
  }

  private static isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      /database.*connection/i,
      /payment.*failed/i,
      /security.*violation/i,
      /compliance.*violation/i,
      /unauthorized.*access/i,
      /rate.*limit.*exceeded/i,
    ];

    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.stack || '')
    );
  }

  private static async createSystemAlert(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    try {
      const severity = this.getErrorSeverity(error);
      const type = this.getErrorType(error);

      await prisma.systemAlert.create({
        data: {
          type,
          severity,
          title: `${type}: ${error.message.substring(0, 100)}`,
          description: `Error: ${error.message}\n\nContext: ${JSON.stringify(context, null, 2)}\n\nStack: ${error.stack}`,
          entityType: context.customerId ? 'customer' : context.userId ? 'user' : undefined,
          entityId: context.customerId || context.userId,
          acknowledged: false,
          resolved: false,
          createdAt: new Date(),
        }
      });
    } catch (alertError) {
      console.error('Failed to create system alert:', alertError);
    }
  }

  private static getErrorSeverity(error: Error): string {
    if (/critical|security|payment|database/i.test(error.message)) {
      return 'critical';
    }
    if (/unauthorized|forbidden|compliance/i.test(error.message)) {
      return 'high';
    }
    if (/validation|not.*found/i.test(error.message)) {
      return 'medium';
    }
    return 'low';
  }

  private static getErrorType(error: Error): string {
    if (/database|connection|prisma/i.test(error.message)) {
      return 'DATABASE_ERROR';
    }
    if (/payment|stripe|plaid/i.test(error.message)) {
      return 'PAYMENT_ERROR';
    }
    if (/utility|api|integration/i.test(error.message)) {
      return 'INTEGRATION_ERROR';
    }
    if (/compliance|legal/i.test(error.message)) {
      return 'COMPLIANCE_ERROR';
    }
    if (/authentication|authorization|security/i.test(error.message)) {
      return 'SECURITY_ERROR';
    }
    if (/validation|invalid|malformed/i.test(error.message)) {
      return 'VALIDATION_ERROR';
    }
    return 'SYSTEM_ERROR';
  }

  private static sanitizeRequestData(data: any): any {
    if (!data) return null;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'creditCard',
      'ssn',
      'accountNumber'
    ];

    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private static getClientIP(req: NextApiRequest): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection?.remoteAddress ||
      'unknown'
    ).split(',')[0].trim();
  }

  private static extractUserId(req: NextApiRequest): string | undefined {
    // Extract from JWT token, session, or request body
    return req.body?.userId || req.query?.userId as string;
  }

  private static extractCustomerId(req: NextApiRequest): string | undefined {
    // Extract from request body or query
    return req.body?.customerId || req.query?.customerId as string;
  }
}

// Middleware for automatic error handling
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    
    try {
      await handler(req, res);
      
      // Log successful request
      const responseTime = Date.now() - startTime;
      await ErrorHandler.logApiRequest(req, res, responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorObj = error as Error;
      
      // Log error
      await ErrorHandler.logError(errorObj, {
        endpoint: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ipAddress: ErrorHandler['getClientIP'](req),
        requestData: req.body,
        userId: ErrorHandler['extractUserId'](req),
        customerId: ErrorHandler['extractCustomerId'](req),
      });

      await ErrorHandler.logApiRequest(req, res, responseTime, errorObj);

      // Send error response
      if (!res.headersSent) {
        const statusCode = this.getHttpStatusCode(errorObj);
        res.status(statusCode).json({
          success: false,
          error: process.env.NODE_ENV === 'production' 
            ? 'An error occurred processing your request'
            : errorObj.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  function getHttpStatusCode(error: Error): number {
    if (/not.*found/i.test(error.message)) return 404;
    if (/unauthorized|forbidden/i.test(error.message)) return 403;
    if (/validation|invalid|malformed/i.test(error.message)) return 400;
    if (/rate.*limit/i.test(error.message)) return 429;
    return 500;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static thresholds = {
    slow_request: 5000, // 5 seconds
    critical_request: 10000, // 10 seconds
  };

  static async trackRequest(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    try {
      // Create alert for slow requests
      if (duration > this.thresholds.slow_request) {
        await prisma.systemAlert.create({
          data: {
            type: 'PERFORMANCE_ISSUE',
            severity: duration > this.thresholds.critical_request ? 'critical' : 'medium',
            title: `Slow API Request: ${method} ${endpoint}`,
            description: `Request took ${duration}ms to complete. This may indicate performance issues.`,
            entityType: 'system',
            acknowledged: false,
            resolved: false,
            createdAt: new Date(),
          }
        });
      }

      // Track metrics (in production, this would go to metrics service)
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }
}

// Rate limiting helper
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(
    identifier: string,
    maxAttempts: number = 100,
    windowMs: number = 60000 // 1 minute
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / windowMs)}`;
    
    const current = this.attempts.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (current.count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }
    
    current.count++;
    this.attempts.set(key, current);
    
    // Cleanup old entries
    this.cleanup();
    
    return {
      allowed: true,
      remaining: maxAttempts - current.count,
      resetTime: current.resetTime
    };
  }
  
  private static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.attempts.entries()) {
      if (value.resetTime < now) {
        this.attempts.delete(key);
      }
    }
  }
}