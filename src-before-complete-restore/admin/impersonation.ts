import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const IMPERSONATION_SECRET = new TextEncoder().encode(
  process.env.IMPERSONATION_SECRET || 'vibelux-admin-impersonation-secret-key'
);

export interface ImpersonationToken {
  adminId: string;
  targetUserId: string;
  sessionId: string;
  exp: number;
}

// Admin emails that have impersonation access
const ADMIN_EMAILS = [
  'admin@vibelux.com',
  'support@vibelux.com',
  // Add your admin emails here
  ...(process.env.ADMIN_EMAILS?.split(',') || [])
];

export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { email: true, role: true }
  });
  
  if (!user) return false;
  
  return user.role === 'ADMIN' || 
         user.role === 'SUPER_ADMIN' || 
         ADMIN_EMAILS.includes(user.email);
}

export async function createImpersonationSession(
  adminId: string,
  targetUserId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  // Verify admin has permission
  const isAdmin = await isUserAdmin(adminId);
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Get admin user for logging
  const adminUser = await prisma.user.findUnique({
    where: { clerkId: adminId }
  });
  
  if (!adminUser) {
    throw new Error('Admin user not found');
  }
  
  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { clerkId: targetUserId }
  });
  
  if (!targetUser) {
    throw new Error('Target user not found');
  }
  
  // End any active impersonation sessions for this admin
  await prisma.impersonationSession.updateMany({
    where: {
      adminId: adminUser.id,
      active: true
    },
    data: {
      active: false,
      endedAt: new Date()
    }
  });
  
  // Create new impersonation session
  const session = await prisma.impersonationSession.create({
    data: {
      adminId: adminUser.id,
      targetUserId: targetUser.id,
      reason,
      active: true
    }
  });
  
  // Log the impersonation start
  await prisma.adminAuditLog.create({
    data: {
      adminId: adminUser.id,
      action: 'IMPERSONATION_START',
      targetUserId: targetUser.id,
      details: {
        reason,
        targetEmail: targetUser.email,
        sessionId: session.id
      },
      ipAddress,
      userAgent
    }
  });
  
  // Create JWT token for impersonation
  const token = await new SignJWT({
    adminId: adminUser.id,
    targetUserId: targetUser.clerkId,
    sessionId: session.id
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(IMPERSONATION_SECRET);
  
  return token;
}

export async function endImpersonationSession(
  sessionId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const session = await prisma.impersonationSession.findUnique({
    where: { id: sessionId },
    include: {
      admin: true,
      targetUser: true
    }
  });
  
  if (!session || !session.active) {
    throw new Error('Invalid or inactive session');
  }
  
  // End the session
  await prisma.impersonationSession.update({
    where: { id: sessionId },
    data: {
      active: false,
      endedAt: new Date()
    }
  });
  
  // Log the impersonation end
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.adminId,
      action: 'IMPERSONATION_END',
      targetUserId: session.targetUserId,
      details: {
        sessionId: session.id,
        duration: new Date().getTime() - session.startedAt.getTime()
      },
      ipAddress,
      userAgent
    }
  });
}

export async function verifyImpersonationToken(token: string): Promise<ImpersonationToken | null> {
  try {
    const { payload } = await jwtVerify(token, IMPERSONATION_SECRET);
    
    // Verify session is still active
    const session = await prisma.impersonationSession.findUnique({
      where: { id: payload.sessionId as string },
      select: { active: true }
    });
    
    if (!session?.active) {
      return null;
    }
    
    return payload as ImpersonationToken;
  } catch (error) {
    return null;
  }
}

export async function getCurrentImpersonation(request: Request): Promise<{
  isImpersonating: boolean;
  adminId?: string;
  targetUserId?: string;
  sessionId?: string;
} | null> {
  const cookieStore = await cookies();
  const impersonationToken = cookieStore.get('vibelux_impersonation');
  
  if (!impersonationToken?.value) {
    return { isImpersonating: false };
  }
  
  const tokenData = await verifyImpersonationToken(impersonationToken.value);
  
  if (!tokenData) {
    return { isImpersonating: false };
  }
  
  return {
    isImpersonating: true,
    adminId: tokenData.adminId,
    targetUserId: tokenData.targetUserId,
    sessionId: tokenData.sessionId
  };
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const adminUser = await prisma.user.findUnique({
    where: { clerkId: adminId }
  });
  
  if (!adminUser) return;
  
  let targetUser;
  if (targetUserId) {
    targetUser = await prisma.user.findUnique({
      where: { clerkId: targetUserId }
    });
  }
  
  await prisma.adminAuditLog.create({
    data: {
      adminId: adminUser.id,
      action,
      targetUserId: targetUser?.id,
      details,
      ipAddress,
      userAgent
    }
  });
}