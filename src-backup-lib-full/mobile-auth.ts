// Mobile Authentication Helper
// Verifies Clerk JWT tokens for mobile API requests

import { NextRequest } from 'next/server';
import { verifyToken } from '@clerk/backend';
import { db } from '@/lib/db';
import { env } from '@/lib/env-validator';

export interface MobileUser {
  userId: string;
  clerkId: string;
  email: string;
  role: string;
  subscriptionTier: string;
  permissions: string[];
  organizationId?: string;
  organizationRole?: string;
}

export async function verifyMobileToken(request: NextRequest): Promise<MobileUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify Clerk JWT token
    const secretKey = env.get('CLERK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Clerk secret key not configured');
    }

    const payload = await verifyToken(token, {
      secretKey,
      issuer: (iss) => iss.startsWith('https://'),
    });

    if (!payload || !payload.sub) {
      return null;
    }

    // Get user from database
    const user = await db.users.findByClerkId(payload.sub);
    if (!user) {
      console.warn(`User not found in database for Clerk ID: ${payload.sub}`);
      return null;
    }

    // Check for organization membership
    const organizationId = payload.org_id || payload.organization_id;
    const organizationRole = payload.org_role || payload.organization_role;

    const mobileUser: MobileUser = {
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      permissions: getPermissionsForUser(user.role, user.subscriptionTier, organizationRole),
      organizationId: organizationId as string,
      organizationRole: organizationRole as string
    };

    return mobileUser;
  } catch (error) {
    console.error('Mobile token verification failed:', error);
    return null;
  }
}

function getPermissionsForUser(
  role: string, 
  subscriptionTier: string, 
  organizationRole?: string
): string[] {
  const basePermissions = getBasePermissions(role);
  const tierPermissions = getSubscriptionPermissions(subscriptionTier);
  const orgPermissions = getOrganizationPermissions(organizationRole);
  
  return [...new Set([...basePermissions, ...tierPermissions, ...orgPermissions])];
}

function getBasePermissions(role: string): string[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return [
        'view_dashboard', 'control_environment', 'manage_tasks', 'manage_users',
        'view_analytics', 'manage_recipes', 'system_settings', 'manage_billing',
        'access_api', 'manage_organizations', 'view_audit_logs'
      ];
    case 'ADMIN':
      return [
        'view_dashboard', 'control_environment', 'manage_tasks', 'manage_users',
        'view_analytics', 'manage_recipes', 'system_settings', 'access_api'
      ];
    case 'USER':
      return [
        'view_dashboard', 'control_environment', 'manage_tasks',
        'view_analytics', 'manage_recipes'
      ];
    default:
      return ['view_dashboard'];
  }
}

function getSubscriptionPermissions(tier: string): string[] {
  switch (tier) {
    case 'ENTERPRISE':
      return [
        'advanced_analytics', 'api_access', 'white_label', 'priority_support',
        'custom_integrations', 'unlimited_projects', 'team_collaboration'
      ];
    case 'PROFESSIONAL':
      return [
        'advanced_analytics', 'api_access', 'team_collaboration',
        'extended_projects', 'priority_support'
      ];
    case 'FREE':
    default:
      return ['basic_features'];
  }
}

function getOrganizationPermissions(orgRole?: string): string[] {
  if (!orgRole) return [];
  
  switch (orgRole) {
    case 'org:admin':
      return ['manage_organization', 'invite_members', 'manage_billing'];
    case 'org:member':
      return ['collaborate_projects'];
    default:
      return [];
  }
}

export async function createMobileSession(clerkId: string): Promise<string | null> {
  try {
    // In a real implementation, you might create a session token
    // For now, we'll use Clerk's built-in JWT tokens
    const user = await db.users.findByClerkId(clerkId);
    if (!user) {
      return null;
    }

    // Log mobile session creation
    await db.usageRecords.create({
      userId: user.id,
      feature: 'mobile_auth',
      action: 'session_created',
      metadata: {
        timestamp: new Date().toISOString(),
        device_type: 'mobile'
      }
    });

    return 'session_created'; // Clerk handles the actual JWT
  } catch (error) {
    console.error('Failed to create mobile session:', error);
    return null;
  }
}

export async function validateMobileApiKey(apiKey: string): Promise<boolean> {
  try {
    // Check if it's a valid API key from database
    const keyRecord = await db.query.raw(
      'SELECT * FROM "ApiKey" WHERE key = $1 AND ("expiresAt" IS NULL OR "expiresAt" > NOW())',
      [apiKey]
    );
    
    if (keyRecord && keyRecord.length > 0) {
      // Update last used timestamp
      await db.query.raw(
        'UPDATE "ApiKey" SET "lastUsed" = NOW() WHERE key = $1',
        [apiKey]
      );
      return true;
    }

    // Fallback to environment variable for development
    const devApiKey = env.get('MOBILE_API_KEY');
    return devApiKey ? apiKey === devApiKey : false;
    
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}

export function hasPermission(user: MobileUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function requirePermission(user: MobileUser, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}