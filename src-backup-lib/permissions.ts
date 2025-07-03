import { db } from '@/lib/db';

export type Permission = 
  // Facility permissions
  | 'facility.view'
  | 'facility.edit'
  | 'facility.delete'
  | 'facility.users.manage'
  | 'facility.investments.create'
  | 'facility.investments.edit'
  | 'facility.investments.delete'
  | 'facility.reports.view'
  | 'facility.reports.export'
  // Project permissions
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.share'
  // Design permissions
  | 'design.basic'
  | 'design.advanced'
  | 'design.3d'
  | 'design.export'
  // Admin permissions
  | 'admin.users'
  | 'admin.affiliates'
  | 'admin.investments'
  | 'admin.reports'
  // Research permissions
  | 'research.papers'
  | 'research.data'
  | 'research.experiments';

// Role-based permission mappings
const rolePermissions: Record<string, Permission[]> = {
  // User roles
  USER: [
    'projects.view',
    'projects.create',
    'projects.edit',
    'design.basic',
  ],
  RESEARCHER: [
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'design.basic',
    'design.advanced',
    'design.3d',
    'design.export',
    'research.papers',
    'research.data',
    'research.experiments',
  ],
  ADMIN: [
    // All permissions
    'facility.view',
    'facility.edit',
    'facility.delete',
    'facility.users.manage',
    'facility.investments.create',
    'facility.investments.edit',
    'facility.investments.delete',
    'facility.reports.view',
    'facility.reports.export',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'projects.share',
    'design.basic',
    'design.advanced',
    'design.3d',
    'design.export',
    'admin.users',
    'admin.affiliates',
    'admin.investments',
    'admin.reports',
    'research.papers',
    'research.data',
    'research.experiments',
  ],
};

// Facility role permissions
const facilityRolePermissions: Record<string, Permission[]> = {
  OWNER: [
    'facility.view',
    'facility.edit',
    'facility.delete',
    'facility.users.manage',
    'facility.investments.create',
    'facility.investments.edit',
    'facility.investments.delete',
    'facility.reports.view',
    'facility.reports.export',
  ],
  ADMIN: [
    'facility.view',
    'facility.edit',
    'facility.users.manage',
    'facility.investments.create',
    'facility.investments.edit',
    'facility.reports.view',
    'facility.reports.export',
  ],
  MANAGER: [
    'facility.view',
    'facility.edit',
    'facility.reports.view',
    'facility.reports.export',
  ],
  OPERATOR: [
    'facility.view',
    'facility.reports.view',
  ],
  VIEWER: [
    'facility.view',
  ],
};

// Subscription tier permissions
const tierPermissions: Record<string, Permission[]> = {
  FREE: [
    'projects.view',
    'projects.create',
    'design.basic',
  ],
  STARTER: [
    'projects.view',
    'projects.create',
    'projects.edit',
    'design.basic',
    'design.export',
  ],
  PROFESSIONAL: [
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'projects.share',
    'design.basic',
    'design.advanced',
    'design.export',
  ],
  BUSINESS: [
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'projects.share',
    'design.basic',
    'design.advanced',
    'design.3d',
    'design.export',
    'research.papers',
  ],
  ENTERPRISE: [
    // All non-admin permissions
    'facility.view',
    'facility.edit',
    'facility.users.manage',
    'facility.investments.create',
    'facility.investments.edit',
    'facility.reports.view',
    'facility.reports.export',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'projects.share',
    'design.basic',
    'design.advanced',
    'design.3d',
    'design.export',
    'research.papers',
    'research.data',
    'research.experiments',
  ],
};

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission,
  facilityId?: string
): Promise<boolean> {
  try {
    const user = await db.users.findUnique(userId);
    if (!user) return false;

    // Check user role permissions
    const userRolePerms = rolePermissions[user.role || 'USER'] || [];
    if (userRolePerms.includes(permission)) return true;

    // Check subscription tier permissions
    const tierPerms = tierPermissions[user.subscriptionTier || 'FREE'] || [];
    if (tierPerms.includes(permission)) return true;

    // Check facility role permissions if facility-specific
    if (facilityId && permission.startsWith('facility.')) {
      const facilityUser = await db.prisma.facilityUser.findFirst({
        where: { userId, facilityId }
      });
      
      if (facilityUser) {
        const facilityPerms = facilityRolePermissions[facilityUser.role] || [];
        if (facilityPerms.includes(permission)) return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(
  userId: string,
  facilityId?: string
): Promise<Permission[]> {
  try {
    const user = await db.users.findUnique(userId);
    if (!user) return [];

    const permissions = new Set<Permission>();

    // Add user role permissions
    const userRolePerms = rolePermissions[user.role || 'USER'] || [];
    userRolePerms.forEach(p => permissions.add(p));

    // Add subscription tier permissions
    const tierPerms = tierPermissions[user.subscriptionTier || 'FREE'] || [];
    tierPerms.forEach(p => permissions.add(p));

    // Add facility role permissions if applicable
    if (facilityId) {
      const facilityUser = await db.prisma.facilityUser.findFirst({
        where: { userId, facilityId }
      });
      
      if (facilityUser) {
        const facilityPerms = facilityRolePermissions[facilityUser.role] || [];
        facilityPerms.forEach(p => permissions.add(p));
      }
    }

    return Array.from(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

/**
 * Check multiple permissions at once
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[],
  facilityId?: string
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission, facilityId)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[],
  facilityId?: string
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission, facilityId))) {
      return false;
    }
  }
  return true;
}

/**
 * Permission-based feature flags
 */
export async function getFeatureFlags(userId: string): Promise<Record<string, boolean>> {
  const permissions = await getUserPermissions(userId);
  
  return {
    canUseBasicDesigner: permissions.includes('design.basic'),
    canUseAdvancedDesigner: permissions.includes('design.advanced'),
    canUse3DDesigner: permissions.includes('design.3d'),
    canExportDesigns: permissions.includes('design.export'),
    canAccessResearch: permissions.includes('research.papers'),
    canManageUsers: permissions.includes('admin.users'),
    canCreateInvestments: permissions.includes('facility.investments.create'),
    hasEnterpriseFeatures: permissions.includes('research.experiments'),
  };
}