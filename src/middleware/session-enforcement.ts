/**
 * Session Enforcement Middleware
 * Enforces concurrent session limits and prevents credential sharing
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';

export async function enforceSessionLimits(request: NextRequest) {
  try {
    const { userId, sessionId } = await auth();
    
    if (!userId || !sessionId) {
      return NextResponse.next();
    }

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.next();
    }

    const subscriptionTier = user.subscriptionTier || 'FREE';
    
    // Create device fingerprint
    const deviceFingerprint = await sessionManager.createDeviceFingerprint(request);
    const ipAddress = await sessionManager.getClientIP();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check session limits
    const sessionCheck = await sessionManager.checkSessionLimit(userId, subscriptionTier);

    if (!sessionCheck.allowed) {
      // Check if current session exists
      const currentSessionValid = await sessionManager.validateSession(sessionId);
      
      if (!currentSessionValid.valid) {
        // This is a new session that would exceed the limit
        // Terminate oldest sessions
        if (sessionCheck.sessionsToTerminate && sessionCheck.sessionsToTerminate.length > 0) {
          await sessionManager.terminateSessions(sessionCheck.sessionsToTerminate);
          
          // Log the action
          await prisma.auditLog.create({
            data: {
              userId,
              action: 'concurrent_sessions_exceeded',
              entityType: 'session',
              entityId: sessionId,
              metadata: {
                limit: maxSessions,
                subscriptionTier
              }
            }
          });
        }

        // Create the new session
        await sessionManager.createSession(
          userId,
          sessionId,
          deviceFingerprint,
          ipAddress,
          userAgent
        );

        // Return a response that includes a warning
        const response = NextResponse.next();
        response.headers.set('X-Session-Warning', 'Other sessions have been terminated');
        return response;
      }
    } else {
      // Check if this is a new session
      const sessionExists = await prisma.userSession.findUnique({
        where: { id: sessionId }
      });

      if (!sessionExists) {
        // Create new session
        await sessionManager.createSession(
          userId,
          sessionId,
          deviceFingerprint,
          ipAddress,
          userAgent
        );
      }
    }

    // Check for suspicious activity
    const suspiciousCheck = await sessionManager.checkSuspiciousActivity(
      userId,
      ipAddress,
      deviceFingerprint
    );

    if (suspiciousCheck.suspicious) {
      // Log security event
      await prisma.securityEvent.create({
        data: {
          userId,
          type: 'suspicious_session',
          severity: suspiciousCheck.severity || 'medium',
          metadata: {
            reason: suspiciousCheck.reason,
            ipAddress,
            deviceFingerprint
          }
        }
      });

      // Could optionally require additional verification here
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Session enforcement error:', error);
    // Don't block the request on error
    return NextResponse.next();
  }
}

/**
 * Check team member limits
 */
export async function enforceTeamLimits(facilityId: string, requestingUserId: string): Promise<{
  reason?: string;
}> {
  try {
    // Get facility owner's subscription
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        owner: true,
        facilityUsers: true
      }
    });

    if (!facility) {
      return { allowed: false, currentMembers: 0, maxMembers: 0, reason: 'Facility not found' };
    }

    // Get team member limits by tier
    const teamLimits: Record<string, number> = {
      'FREE': 1,
      'PRO': 5,
      'ENTERPRISE': -1 // unlimited
    };

    const subscriptionTier = facility.owner.subscriptionTier || 'FREE';
    const maxMembers = teamLimits[subscriptionTier] || 1;
    const currentMembers = facility.facilityUsers.length;

    if (currentMembers >= maxMembers) {
      return {
        allowed: false,
        currentMembers,
        maxMembers,
        reason: 'Team member limit reached'
      };
    }

    return {
      allowed: true,
      currentMembers,
      maxMembers
    };
  } catch (error) {
    console.error('Team limit check error:', error);
    return { 
      allowed: true, 
      currentMembers: 0, 
      maxMembers: 1,
      reason: 'Error checking team limits'
    };
  }
}