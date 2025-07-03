import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export interface UserPermissions {
  isExpert: boolean;
  isAdmin: boolean;
  canBookConsultations: boolean;
  canManageExperts: boolean;
  canAccessDashboard: boolean;
  expertStatus?: string;
}

export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        expertProfile: {
          select: {
            status: true
          }
        }
      }
    });

    if (!user) {
      return {
        isExpert: false,
        isAdmin: false,
        canBookConsultations: false,
        canManageExperts: false,
        canAccessDashboard: false
      };
    }

    const isAdmin = user.role === 'ADMIN';
    const isExpert = !!user.expertProfile;
    const expertStatus = user.expertProfile?.status;

    return {
      isExpert,
      isAdmin,
      canBookConsultations: true, // All authenticated users can book
      canManageExperts: isAdmin,
      canAccessDashboard: isExpert && expertStatus === 'ACTIVE',
      expertStatus
    };

  } catch (error) {
    console.error('Error getting user permissions:', error);
    return {
      isExpert: false,
      isAdmin: false,
      canBookConsultations: false,
      canManageExperts: false,
      canAccessDashboard: false
    };
  }
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireExpertAuth() {
  const session = await requireAuth();
  const permissions = await getUserPermissions(session.user.id);
  
  if (!permissions.isExpert) {
    throw new Error('Expert access required');
  }
  
  return { session, permissions };
}

export async function requireActiveExpert() {
  const { session, permissions } = await requireExpertAuth();
  
  if (permissions.expertStatus !== 'ACTIVE') {
    throw new Error('Active expert status required');
  }
  
  return { session, permissions };
}

export async function requireAdmin() {
  const session = await requireAuth();
  const permissions = await getUserPermissions(session.user.id);
  
  if (!permissions.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return { session, permissions };
}

export async function checkConsultationAccess(consultationId: string, userId: string): Promise<boolean> {
  try {
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [
          { clientId: userId },
          { expert: { userId } }
        ]
      }
    });

    return !!consultation;
  } catch (error) {
    console.error('Error checking consultation access:', error);
    return false;
  }
}

export async function checkExpertProfileAccess(expertId: string, userId: string): Promise<boolean> {
  try {
    const expert = await prisma.expert.findFirst({
      where: {
        id: expertId,
        userId
      }
    });

    return !!expert;
  } catch (error) {
    console.error('Error checking expert profile access:', error);
    return false;
  }
}

export function withPermissions(handler: Function, requiredPermission: keyof UserPermissions) {
  return async (request: any, ...args: any[]) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const permissions = await getUserPermissions(session.user.id);
      if (!permissions[requiredPermission]) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return handler(request, { session, permissions }, ...args);
    } catch (error) {
      console.error('Permission check error:', error);
      return new Response(JSON.stringify({ error: 'Permission check failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

export function withExpertAuth(handler: Function) {
  return async (request: any, ...args: any[]) => {
    try {
      const { session, permissions } = await requireActiveExpert();
      return handler(request, { session, permissions }, ...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Access denied';
      const status = message.includes('Authentication') ? 401 : 403;
      
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

export function withAdminAuth(handler: Function) {
  return async (request: any, ...args: any[]) => {
    try {
      const { session, permissions } = await requireAdmin();
      return handler(request, { session, permissions }, ...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Access denied';
      const status = message.includes('Authentication') ? 401 : 403;
      
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}