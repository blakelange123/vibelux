// Enhanced Mobile Authentication with Device Fingerprinting and Session Management
// Secure implementation for Visual Operations Intelligence mobile apps

import { NextRequest } from 'next/server';
import { verifyToken } from '@clerk/backend';
import { db, prisma } from '@/lib/db';
// Removed env-validator import to avoid build-time validation
import crypto from 'crypto';

export interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  model?: string;
  osVersion?: string;
  appVersion: string;
  fingerprint: string;
}

export interface MobileSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  fingerprint: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface MobileUser {
  userId: string;
  clerkId: string;
  email: string;
  role: string;
  subscriptionTier: string;
  permissions: string[];
  organizationId?: string;
  organizationRole?: string;
  session?: MobileSession;
}

// Device fingerprinting for enhanced security
export function generateDeviceFingerprint(deviceInfo: DeviceInfo, userAgent: string): string {
  const fingerprintData = [
    deviceInfo.deviceId,
    deviceInfo.platform,
    deviceInfo.model || 'unknown',
    deviceInfo.osVersion || 'unknown',
    deviceInfo.appVersion,
    userAgent
  ].join('|');
  
  return crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
}

// Validate device fingerprint hasn't changed
export async function validateDeviceFingerprint(
  userId: string, 
  deviceId: string, 
  currentFingerprint: string
): Promise<boolean> {
  try {
    const lastSession = await prisma.mobileSession.findFirst({
      where: {
        userId,
        deviceId,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!lastSession) {
      return true; // No previous session, fingerprint is valid
    }

    // Check if fingerprint matches
    if (lastSession.fingerprint !== currentFingerprint) {
      // Log security event for fingerprint mismatch
      await prisma.securityEvent.create({
        data: {
          userId,
          eventType: 'DEVICE_FINGERPRINT_MISMATCH',
          metadata: {
            deviceId,
            oldFingerprint: lastSession.fingerprint,
            newFingerprint: currentFingerprint
          },
          createdAt: new Date()
        }
      });
      
      return false;
    }

    return true;
  } catch (error) {
    console.error('Device fingerprint validation error:', error);
    return false;
  }
}

// Create secure mobile session with device binding
export async function createSecureMobileSession(
  clerkId: string,
  deviceInfo: DeviceInfo,
  request: NextRequest
): Promise<MobileSession | null> {
  try {
    const user = await db.users.findByClerkId(clerkId);
    if (!user) {
      return null;
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const fingerprint = generateDeviceFingerprint(deviceInfo, userAgent);

    // Validate device hasn't changed
    const isValidDevice = await validateDeviceFingerprint(user.id, deviceInfo.deviceId, fingerprint);
    if (!isValidDevice) {
      throw new Error('Device verification failed');
    }

    // Check for existing active sessions on this device
    const existingSession = await prisma.mobileSession.findFirst({
      where: {
        userId: user.id,
        deviceId: deviceInfo.deviceId,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingSession) {
      // Update existing session
      const updatedSession = await prisma.mobileSession.update({
        where: { id: existingSession.id },
        data: {
          lastActiveAt: new Date(),
          ipAddress,
          userAgent,
          fingerprint
        }
      });
      
      return {
        sessionId: updatedSession.id,
        userId: updatedSession.userId,
        deviceId: updatedSession.deviceId,
        fingerprint: updatedSession.fingerprint,
        createdAt: updatedSession.createdAt,
        expiresAt: updatedSession.expiresAt,
        lastActiveAt: updatedSession.lastActiveAt,
        ipAddress: updatedSession.ipAddress || undefined,
        userAgent: updatedSession.userAgent || undefined
      };
    }

    // Create new session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

    const session = await prisma.mobileSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        deviceId: deviceInfo.deviceId,
        fingerprint,
        platform: deviceInfo.platform,
        deviceModel: deviceInfo.model,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        expiresAt,
        lastActiveAt: new Date()
      }
    });

    // Log session creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MOBILE_SESSION_CREATED',
        resourceType: 'mobile_session',
        resourceId: sessionId,
        metadata: {
          deviceId: deviceInfo.deviceId,
          platform: deviceInfo.platform,
          ipAddress
        },
        createdAt: new Date()
      }
    });

    return {
      sessionId: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      fingerprint: session.fingerprint,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastActiveAt: session.lastActiveAt,
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined
    };
  } catch (error) {
    console.error('Failed to create secure mobile session:', error);
    return null;
  }
}

// Enhanced token verification with session validation
export async function verifyMobileTokenWithSession(
  request: NextRequest
): Promise<MobileUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    const sessionHeader = request.headers.get('X-Mobile-Session');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify Clerk JWT token
    const secretKey = process.env.CLERK_SECRET_KEY;
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

    // Validate mobile session if provided
    let session: MobileSession | undefined;
    if (sessionHeader) {
      const sessionData = await prisma.mobileSession.findFirst({
        where: {
          id: sessionHeader,
          userId: user.id,
          expiresAt: { gt: new Date() }
        }
      });

      if (sessionData) {
        // Update last active time
        await prisma.mobileSession.update({
          where: { id: sessionData.id },
          data: { lastActiveAt: new Date() }
        });

        session = {
          sessionId: sessionData.id,
          userId: sessionData.userId,
          deviceId: sessionData.deviceId,
          fingerprint: sessionData.fingerprint,
          createdAt: sessionData.createdAt,
          expiresAt: sessionData.expiresAt,
          lastActiveAt: sessionData.lastActiveAt,
          ipAddress: sessionData.ipAddress || undefined,
          userAgent: sessionData.userAgent || undefined
        };
      }
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
      organizationRole: organizationRole as string,
      session
    };

    return mobileUser;
  } catch (error) {
    console.error('Mobile token verification failed:', error);
    return null;
  }
}

// Revoke all sessions for a device
export async function revokeDeviceSessions(userId: string, deviceId: string): Promise<void> {
  try {
    await prisma.mobileSession.updateMany({
      where: {
        userId,
        deviceId
      },
      data: {
        expiresAt: new Date() // Expire immediately
      }
    });

    // Log revocation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DEVICE_SESSIONS_REVOKED',
        resourceType: 'mobile_session',
        resourceId: deviceId,
        metadata: {
          reason: 'Manual revocation'
        },
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to revoke device sessions:', error);
  }
}

// Get all active sessions for a user
export async function getUserActiveSessions(userId: string): Promise<MobileSession[]> {
  try {
    const sessions = await prisma.mobileSession.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActiveAt: 'desc' }
    });

    return sessions.map(session => ({
      sessionId: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      fingerprint: session.fingerprint,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastActiveAt: session.lastActiveAt,
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined
    }));
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

// Permission helpers
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
        'access_api', 'manage_organizations', 'view_audit_logs', 'view_all_facilities'
      ];
    case 'ADMIN':
      return [
        'view_dashboard', 'control_environment', 'manage_tasks', 'manage_users',
        'view_analytics', 'manage_recipes', 'system_settings', 'access_api'
      ];
    case 'MANAGER':
      return [
        'view_dashboard', 'control_environment', 'manage_tasks',
        'view_analytics', 'manage_recipes', 'review_reports'
      ];
    case 'WORKER':
      return [
        'view_dashboard', 'submit_reports', 'view_tasks', 
        'capture_photos', 'track_location', 'view_own_data'
      ];
    default:
      return ['view_dashboard'];
  }
}

function getSubscriptionPermissions(tier: string): string[] {
  switch (tier) {
    case 'ENTERPRISE':
      return [
        'visual_ops', 'ipm_scouting', 'harvest_tracking', 'spray_tracking',
        'advanced_analytics', 'api_access', 'white_label', 'priority_support',
        'custom_integrations', 'unlimited_projects', 'team_collaboration'
      ];
    case 'PROFESSIONAL':
      return [
        'visual_ops', 'ipm_scouting', 'harvest_tracking',
        'advanced_analytics', 'api_access', 'team_collaboration',
        'extended_projects', 'priority_support'
      ];
    case 'ESSENTIAL':
      return [
        'visual_ops', 'basic_analytics', 'limited_projects'
      ];
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

export function hasPermission(user: MobileUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function requirePermission(user: MobileUser, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}

// Validate API key for service-to-service auth
export async function validateMobileApiKey(apiKey: string): Promise<boolean> {
  try {
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: hashedKey,
        expiresAt: { gt: new Date() },
        isActive: true
      }
    });
    
    if (keyRecord) {
      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}