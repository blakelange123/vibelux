import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function marketplaceSecurityMiddleware(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has marketplace access
    const hasMarketplaceAccess = await checkMarketplaceAccess(userId);
    
    if (!hasMarketplaceAccess) {
      return NextResponse.json({ error: 'Marketplace access denied' }, { status: 403 });
    }
    
    // Add security headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-marketplace-user', userId);
    requestHeaders.set('x-marketplace-timestamp', new Date().toISOString());
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Security check failed' }, { status: 500 });
  }
}

async function checkMarketplaceAccess(userId: string): Promise<boolean> {
  // Add your marketplace access logic here
  // For now, allow all authenticated users
  return true;
}

// Export as class for compatibility
export class MarketplaceSecurityMiddleware {
  static async handle(req: NextRequest) {
    return marketplaceSecurityMiddleware(req);
  }
}

// Export as higher-order function
export function withMarketplaceSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const securityResponse = await marketplaceSecurityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }
    return handler(req);
  };
}