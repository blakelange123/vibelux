import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export function handleApiError(
  error: unknown,
  path?: string
): NextResponse<ApiError> {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
        path
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Duplicate Entry',
          message: 'A record with this data already exists',
          timestamp: new Date().toISOString(),
          path
        },
        { status: 409 }
      );
    }
    
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'The requested resource was not found',
          timestamp: new Date().toISOString(),
          path
        },
        { status: 404 }
      );
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path
      },
      { status: 500 }
    );
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path
    },
    { status: 500 }
  );
}

// Success response helper
export function successResponse<T>(
  data: T,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  }
): NextResponse {
  const response: any = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response);
}