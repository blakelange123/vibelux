import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function apiAuthMiddleware(req: NextRequest) {
  // Check for API key in headers
  const apiKey = req.headers.get('x-api-key');
  
  if (apiKey) {
    // Validate API key
    if (apiKey === process.env.API_SECRET_KEY) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Fall back to user authentication
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

// Validate API key and return user/app details
export async function validateAPIKey(apiKey: string): Promise<{ valid: boolean; userId?: string; appId?: string }> {
  if (!apiKey) {
    return { valid: false };
  }

  try {
    // In production, this would check against a database of API keys
    // For now, we'll do a simple check
    if (apiKey === process.env.API_SECRET_KEY) {
      return { valid: true, appId: 'system' };
    }

    // Check database for API key
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (apiKeyRecord && apiKeyRecord.active) {
      return { 
        valid: true, 
        userId: apiKeyRecord.userId,
        appId: apiKeyRecord.id 
      };
    }

    return { valid: false };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false };
  }
}

// Track API usage for rate limiting and analytics
export async function trackAPIUsage(apiKey: string, endpoint: string, method: string): Promise<void> {
  try {
    await prisma.apiUsage.create({
      data: {
        apiKey,
        endpoint,
        method,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to track API usage:', error);
  }
}

// Generate standardized error response
export function generateErrorResponse(error: string, status: number = 400, details?: any) {
  return NextResponse.json({
    error,
    status,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  }, { status });
}

// Generate standardized API response
export function generateAPIResponse(data: any, meta?: any) {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(meta && { meta })
  });
}