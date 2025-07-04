import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INSUFFICIENT_CREDITS'
  | 'PAYMENT_REQUIRED';

interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    requestId?: string;
  };
}

class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Standard error responses
 */
export const ErrorResponses = {
  unauthorized: () => new AppError(
    'UNAUTHORIZED',
    'Authentication required',
    401
  ),
  
  forbidden: (message = 'Access denied') => new AppError(
    'FORBIDDEN',
    message,
    403
  ),
  
  notFound: (resource = 'Resource') => new AppError(
    'NOT_FOUND',
    `${resource} not found`,
    404
  ),
  
  badRequest: (message = 'Invalid request') => new AppError(
    'BAD_REQUEST',
    message,
    400
  ),
  
  validationError: (errors: any) => new AppError(
    'VALIDATION_ERROR',
    'Validation failed',
    400,
    errors
  ),
  
  conflict: (message = 'Resource conflict') => new AppError(
    'CONFLICT',
    message,
    409
  ),
  
  rateLimited: (retryAfter?: number) => new AppError(
    'RATE_LIMITED',
    'Too many requests',
    429,
    { retryAfter }
  ),
  
  insufficientCredits: (required: number, available: number) => new AppError(
    'INSUFFICIENT_CREDITS',
    'Insufficient credits for this operation',
    402,
    { required, available }
  ),
  
  paymentRequired: (message = 'Payment required') => new AppError(
    'PAYMENT_REQUIRED',
    message,
    402
  ),
  
  internalError: (message = 'Internal server error') => new AppError(
    'INTERNAL_ERROR',
    message,
    500
  ),
  
  serviceUnavailable: (service = 'Service') => new AppError(
    'SERVICE_UNAVAILABLE',
    `${service} is temporarily unavailable`,
    503
  ),
};

/**
 * Global error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  const requestId = generateRequestId();
  
  // Log error with context
  console.error('[API Error]', {
    requestId,
    error,
    timestamp: new Date().toISOString(),
  });
  
  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
          requestId,
        },
      },
      { status: 400 }
    );
  }
  
  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json<ErrorResponse>(
          {
            error: {
              code: 'CONFLICT',
              message: 'Resource already exists',
              details: { field: error.meta?.target },
              requestId,
            },
          },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json<ErrorResponse>(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Resource not found',
              requestId,
            },
          },
          { status: 404 }
        );
      default:
        return NextResponse.json<ErrorResponse>(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'Database operation failed',
              requestId,
            },
          },
          { status: 400 }
        );
    }
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message;
      
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message,
          requestId,
        },
      },
      { status: 500 }
    );
  }
  
  // Fallback for unknown errors
  return NextResponse.json<ErrorResponse>(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId,
      },
    },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R | NextResponse<ErrorResponse>> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Generate request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
}

/**
 * Custom error classes for specific scenarios
 */
export class ValidationError extends AppError {
  constructor(errors: any) {
    super('VALIDATION_ERROR', 'Validation failed', 400, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super('CONFLICT', message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('RATE_LIMITED', 'Too many requests', 429, { retryAfter });
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(required: number, available: number) {
    super(
      'INSUFFICIENT_CREDITS',
      'Insufficient credits for this operation',
      402,
      { required, available }
    );
  }
}

/**
 * Error logging service
 */
export class ErrorLogger {
  static async log(error: Error, context?: any): Promise<void> {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      environment: process.env.NODE_ENV,
    };
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, etc.
      console.error('[Error Log]', JSON.stringify(errorLog));
    } else {
      console.error('[Error Log]', errorLog);
    }
  }
}