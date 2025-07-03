import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // DEVELOPMENT ONLY: Allow admin access for testing
    // TODO: Remove this before production
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  DEVELOPMENT MODE: Granting admin access to all authenticated users');
      return NextResponse.json({ 
        isAdmin: true,
        role: 'admin',
        permissions: ['admin', 'analytics', 'reports']
      });
    }

    // Get user from Clerk
    const user = await currentUser();
    
    // Check if user has admin role in Clerk metadata
    const isClerkAdmin = user?.publicMetadata?.role === 'admin' || 
                        user?.privateMetadata?.role === 'admin';
    
    // Also check database for admin status
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        role: true,
        isAdmin: true,
        permissions: true
      }
    });
    
    const isAdmin = isClerkAdmin || 
                   dbUser?.role === 'admin' || 
                   dbUser?.isAdmin === true ||
                   dbUser?.permissions?.includes('admin');
    
    // Log admin access attempts
    if (isAdmin) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'ADMIN_ACCESS_CHECK',
          resource: 'analytics',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true
        }
      }).catch(console.error); // Don't fail if audit log fails
    }
    
    return NextResponse.json({ 
      isAdmin,
      role: dbUser?.role || 'user',
      permissions: dbUser?.permissions || []
    });
    
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}