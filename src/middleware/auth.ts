import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export type UserRole = 'USER' | 'ADMIN' | 'RESEARCHER';
export type FacilityRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

interface AuthContext {
  userId: string;
  user?: {
    email?: string;
    name?: string;
  };
  facilityId?: string;
  facilityRole?: FacilityRole;
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext | NextResponse> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await db.users.findByClerkId(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get facility if user belongs to one
    const facility = await db.facilities.findByUserId(user.id);
    let facilityRole: FacilityRole | undefined;
    
    if (facility) {
      const facilityUser = await db.prisma.facilityUser.findFirst({
        where: {
          userId: user.id,
          facilityId: facility.id
        }
      });
      facilityRole = facilityUser?.role as FacilityRole;
    }
    
    return {
      userId,
      user: {
        email: user.email,
        name: user.name
      },
      facilityId: facility?.id,
      facilityRole
    };
  } catch (error) {
    // Error handling for auth middleware
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}

/**
 * Middleware to check if user has admin role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthContext | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  // Check if user has admin role
  const user = await db.users.findByClerkId(authResult.userId);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  return authResult;
}

/**
 * Middleware to check if user has researcher role
 */
export async function requireResearcher(request: NextRequest): Promise<AuthContext | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  // Check if user has researcher or admin role
  const user = await db.users.findByClerkId(authResult.userId);
  if (!user || (user.role !== 'RESEARCHER' && user.role !== 'ADMIN')) {
    return NextResponse.json(
      { error: 'Researcher access required' },
      { status: 403 }
    );
  }
  
  return authResult;
}

/**
 * Middleware to check facility permissions
 */
export async function requireFacilityRole(
  request: NextRequest,
  allowedRoles: FacilityRole[]
): Promise<AuthContext | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  if (!authResult.facilityId || !authResult.facilityRole) {
    return NextResponse.json(
      { error: 'No facility access' },
      { status: 403 }
    );
  }
  
  if (!allowedRoles.includes(authResult.facilityRole)) {
    return NextResponse.json(
      { error: 'Insufficient facility permissions' },
      { status: 403 }
    );
  }
  
  return authResult;
}

/**
 * Helper to check if user can manage facility
 */
export async function canManageFacility(userId: string, facilityId: string): Promise<boolean> {
  const facilityUser = await db.prisma.facilityUser.findFirst({
    where: {
      userId,
      facilityId,
      role: { in: ['OWNER', 'ADMIN', 'MANAGER'] }
    }
  });
  
  return !!facilityUser;
}

/**
 * Helper to check if user can view facility data
 */
export async function canViewFacility(userId: string, facilityId: string): Promise<boolean> {
  const facilityUser = await db.prisma.facilityUser.findFirst({
    where: {
      userId,
      facilityId
    }
  });
  
  return !!facilityUser;
}

/**
 * Rate limiting helper
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return async function checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const userRequests = requests.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (userRequests.count >= maxRequests) {
      return false;
    }
    
    userRequests.count++;
    return true;
  };
}

// Create rate limiters for different endpoints
export const apiRateLimiter = createRateLimiter(100, 60000); // 100 requests per minute
export const aiRateLimiter = createRateLimiter(10, 60000); // 10 requests per minute
export const uploadRateLimiter = createRateLimiter(5, 60000); // 5 uploads per minute