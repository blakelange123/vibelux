/**
 * Session Management Service
 * Prevents credential sharing and enforces seat limits
 */

import { prisma } from './prisma';
import { createHash } from 'crypto';
import { headers } from 'next/headers';

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
}

export class SessionManager {
  private static instance: SessionManager;
  
  static getInstance(): SessionManager {
    if (!this.instance) {
      this.instance = new SessionManager();
    }
    return this.instance;
  }

  /**
   * Create device fingerprint from request data
   */
  async createDeviceFingerprint(req: Request): Promise<string> {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const acceptLanguage = headersList.get('accept-language') || 'unknown';
    const acceptEncoding = headersList.get('accept-encoding') || 'unknown';
    
    // Create a hash of device characteristics
    const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    const fingerprint = createHash('sha256').update(fingerprintData).digest('hex');
    
    return fingerprint;
  }

  /**
   * Get client IP address
   */
  async getClientIP(): Promise<string> {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    
    return '127.0.0.1';
  }

  /**
   * Check if user has exceeded concurrent session limit
   */
  async checkSessionLimit(userId: string, subscriptionTier: string): Promise<{
    allowed: boolean;
    currentSessions: number;
    maxSessions: number;
    sessionsToTerminate?: string[];
  }> {
    // Define session limits by tier
    const sessionLimits: Record<string, number> = {
      FREE: 1,
      HOBBYIST: 2,
      GROWER: 3,
      PROFESSIONAL: 5,
      ENTERPRISE: 10,
      ADMIN: 99
    };

    const maxSessions = sessionLimits[subscriptionTier] || 1;
    
    // Get active sessions from database
    const activeSessions = await prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        isActive: true
      },
      orderBy: { lastActiveAt: 'desc' }
    });

    const currentSessions = activeSessions.length;

    if (currentSessions >= maxSessions) {
      // Determine which sessions to terminate (oldest first)
      const sessionsToKeep = maxSessions - 1; // Keep newest sessions
      const sessionsToTerminate = activeSessions
        .slice(sessionsToKeep)
        .map(s => s.id);

      return {
        allowed: false,
        currentSessions,
        maxSessions,
        sessionsToTerminate
      };
    }

    return {
      allowed: true,
      currentSessions,
      maxSessions
    };
  }

  /**
   * Create new session
   */
  async createSession(
    userId: string,
    sessionToken: string,
    deviceFingerprint: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDays(expiresAt.getDate() + 30); // 30 day expiry

    await prisma.userSession.create({
      data: {
        id: sessionToken,
        userId,
        deviceFingerprint,
        ipAddress,
        userAgent,
        lastActiveAt: new Date(),
        expiresAt,
        isActive: true
      }
    });

    // Log session creation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SESSION_CREATED',
        details: {
          ipAddress,
          deviceFingerprint,
          userAgent
        }
      }
    });
  }

  /**
   * Terminate sessions
   */
  async terminateSessions(sessionIds: string[]): Promise<void> {
    await prisma.userSession.updateMany({
      where: { id: { in: sessionIds } },
      data: { 
        isActive: false,
        terminatedAt: new Date()
      }
    });
  }

  /**
   * Check for suspicious login patterns
   */
  async checkSuspiciousActivity(
    userId: string,
    currentIP: string,
    deviceFingerprint: string
  ): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    
    // Get recent sessions
    const recentSessions = await prisma.userSession.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check for rapid location changes
    const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress));
    if (uniqueIPs.size > 3) {
      reasons.push('Multiple locations in 24 hours');
    }

    // Check for multiple device fingerprints
    const uniqueDevices = new Set(recentSessions.map(s => s.deviceFingerprint));
    if (uniqueDevices.size > 3) {
      reasons.push('Multiple devices in 24 hours');
    }

    // Check for impossible travel (would need geolocation service)
    // This is a placeholder for more sophisticated checks

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Validate session
   */
  async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    userId?: string;
    reason?: string;
  }> {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionToken }
    });

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, reason: 'Session terminated' };
    }

    if (session.expiresAt < new Date()) {
      return { valid: false, reason: 'Session expired' };
    }

    // Update last active time
    await prisma.userSession.update({
      where: { id: sessionToken },
      data: { lastActiveAt: new Date() }
    });

    return { valid: true, userId: session.userId };
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActiveAt: 'desc' }
    });

    return sessions.map(s => ({
      sessionId: s.id,
      userId: s.userId,
      deviceFingerprint: s.deviceFingerprint,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt
    }));
  }

  /**
   * Terminate all other sessions (for "logout everywhere else" feature)
   */
  async terminateOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        isActive: true
      },
      data: {
        isActive: false,
        terminatedAt: new Date()
      }
    });

    return result.count;
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();