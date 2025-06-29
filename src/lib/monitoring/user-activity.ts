// User Activity Monitoring System
// Tracks user behavior, session analytics, and security events

import { prisma } from '@/lib/db';
import { auditLogger } from '../audit-logger';

export interface UserActivity {
  id: string;
  userId: string;
  sessionId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  timestamp: Date;
  duration?: number;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activities: UserActivity[];
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
  };
  ipAddress: string;
  isActive: boolean;
}

export interface UserBehaviorMetrics {
  userId: string;
  timeframe: 'day' | 'week' | 'month';
  metrics: {
    sessionsCount: number;
    totalActiveTime: number;
    avgSessionDuration: number;
    pagesViewed: number;
    actionsPerformed: number;
    featureUsage: Record<string, number>;
    peakActivityHour: number;
    deviceUsage: Record<string, number>;
    bounceRate: number;
    returnVisitor: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'suspicious_login' | 'multiple_failed_attempts' | 'unusual_location' | 'concurrent_sessions' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export class UserActivityMonitor {
  private activeSessions: Map<string, UserSession> = new Map();
  private activityBuffer: UserActivity[] = [];
  private readonly BUFFER_SIZE = 1000;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  
  constructor() {
    // Flush activity buffer periodically
    setInterval(() => {
      this.flushActivityBuffer();
    }, this.FLUSH_INTERVAL);
  }
  
  // Track user activity
  async trackActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    const fullActivity: UserActivity = {
      id: `activity_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...activity
    };
    
    // Add to buffer
    this.activityBuffer.push(fullActivity);
    
    // Update session
    await this.updateSession(activity.sessionId, activity.userId);
    
    // Check for security events
    await this.checkForSecurityEvents(fullActivity);
    
    // Flush buffer if full
    if (this.activityBuffer.length >= this.BUFFER_SIZE) {
      await this.flushActivityBuffer();
    }
  }
  
  // Start user session
  async startSession(
    userId: string,
    sessionId: string,
    userAgent: string,
    ipAddress: string
  ): Promise<UserSession> {
    const device = this.parseUserAgent(userAgent);
    const location = await this.getLocationFromIP(ipAddress);
    
    const session: UserSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      activities: [],
      device,
      location,
      ipAddress,
      isActive: true
    };
    
    this.activeSessions.set(sessionId, session);
    
    // Save to database
    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId,
        startTime: session.startTime,
        device: session.device,
        location: session.location,
        ipAddress,
        isActive: true
      }
    });
    
    // Check for concurrent sessions
    await this.checkConcurrentSessions(userId);
    
    return session;
  }
  
  // End user session
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    session.isActive = false;
    
    // Update database
    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        endTime: session.endTime,
        duration: session.duration,
        isActive: false
      }
    });
    
    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    
    // Generate session summary
    await this.generateSessionSummary(session);
  }
  
  // Get user behavior metrics
  async getUserBehaviorMetrics(
    userId: string,
    timeframe: UserBehaviorMetrics['timeframe']
  ): Promise<UserBehaviorMetrics> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    
    const [sessions, activities] = await Promise.all([
      prisma.userSession.findMany({
        where: {
          userId,
          startTime: { gte: startDate, lte: endDate }
        }
      }),
      prisma.userActivity.findMany({
        where: {
          userId,
          timestamp: { gte: startDate, lte: endDate }
        }
      })
    ]);
    
    // Calculate metrics
    const sessionsCount = sessions.length;
    const totalActiveTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgSessionDuration = sessionsCount > 0 ? totalActiveTime / sessionsCount : 0;
    
    const featureUsage: Record<string, number> = {};
    const deviceUsage: Record<string, number> = {};
    const hourlyActivity: Record<number, number> = {};
    
    activities.forEach(activity => {
      // Feature usage
      if (activity.resource) {
        featureUsage[activity.resource] = (featureUsage[activity.resource] || 0) + 1;
      }
      
      // Hourly activity
      const hour = activity.timestamp.getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });
    
    sessions.forEach(session => {
      // Device usage
      const deviceKey = `${session.device.type}_${session.device.os}`;
      deviceUsage[deviceKey] = (deviceUsage[deviceKey] || 0) + 1;
    });
    
    // Find peak activity hour
    const peakActivityHour = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;
    
    // Calculate bounce rate (sessions with only 1 activity)
    const singleActivitySessions = sessions.filter(s => 
      activities.filter(a => a.sessionId === s.id).length === 1
    ).length;
    const bounceRate = sessionsCount > 0 ? (singleActivitySessions / sessionsCount) * 100 : 0;
    
    // Check if return visitor
    const earlierSessions = await prisma.userSession.count({
      where: {
        userId,
        startTime: { lt: startDate }
      }
    });
    
    return {
      userId,
      timeframe,
      metrics: {
        sessionsCount,
        totalActiveTime,
        avgSessionDuration,
        pagesViewed: activities.filter(a => a.action === 'page_view').length,
        actionsPerformed: activities.length,
        featureUsage,
        peakActivityHour: Number(peakActivityHour),
        deviceUsage,
        bounceRate,
        returnVisitor: earlierSessions > 0
      }
    };
  }
  
  // Get security events
  async getSecurityEvents(
    userId?: string,
    severity?: SecurityEvent['severity'],
    resolved?: boolean
  ): Promise<SecurityEvent[]> {
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.resolved = resolved;
    
    return prisma.securityEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });
  }
  
  // Get user timeline
  async getUserTimeline(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    timestamp: Date;
    type: 'activity' | 'session' | 'security';
    data: any;
  }>> {
    const [activities, sessions, securityEvents] = await Promise.all([
      prisma.userActivity.findMany({
        where: {
          userId,
          timestamp: { gte: startDate, lte: endDate }
        }
      }),
      prisma.userSession.findMany({
        where: {
          userId,
          startTime: { gte: startDate, lte: endDate }
        }
      }),
      prisma.securityEvent.findMany({
        where: {
          userId,
          timestamp: { gte: startDate, lte: endDate }
        }
      })
    ]);
    
    const timeline = [
      ...activities.map(a => ({ timestamp: a.timestamp, type: 'activity' as const, data: a })),
      ...sessions.map(s => ({ timestamp: s.startTime, type: 'session' as const, data: s })),
      ...securityEvents.map(e => ({ timestamp: e.timestamp, type: 'security' as const, data: e }))
    ];
    
    return timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Private helper methods
  
  private async updateSession(sessionId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.activities.push(...this.activityBuffer.filter(a => a.sessionId === sessionId));
    }
  }
  
  private async flushActivityBuffer(): Promise<void> {
    if (this.activityBuffer.length === 0) return;
    
    try {
      await prisma.userActivity.createMany({
        data: this.activityBuffer
      });
      
      this.activityBuffer = [];
    } catch (error) {
      console.error('Failed to flush activity buffer:', error);
    }
  }
  
  private async checkForSecurityEvents(activity: UserActivity): Promise<void> {
    // Check for unusual activity patterns
    
    // 1. Multiple failed login attempts
    if (activity.action === 'login_failed') {
      const recentFailures = await prisma.userActivity.count({
        where: {
          userId: activity.userId,
          action: 'login_failed',
          timestamp: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          }
        }
      });
      
      if (recentFailures >= 5) {
        await this.createSecurityEvent({
          userId: activity.userId,
          type: 'multiple_failed_attempts',
          severity: 'high',
          description: `${recentFailures} failed login attempts in 15 minutes`,
          metadata: { 
            attempts: recentFailures,
            ipAddress: activity.ipAddress,
            userAgent: activity.userAgent
          }
        });
      }
    }
    
    // 2. Unusual location
    if (activity.action === 'login_success' && activity.location) {
      const recentLocations = await prisma.userActivity.findMany({
        where: {
          userId: activity.userId,
          action: 'login_success',
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        take: 10
      });
      
      const usualCountries = [...new Set(recentLocations.map(a => a.location?.country))];
      
      if (!usualCountries.includes(activity.location.country)) {
        await this.createSecurityEvent({
          userId: activity.userId,
          type: 'unusual_location',
          severity: 'medium',
          description: `Login from unusual location: ${activity.location.city}, ${activity.location.country}`,
          metadata: {
            location: activity.location,
            usualCountries
          }
        });
      }
    }
    
    // 3. Privilege escalation
    if (activity.action === 'role_changed' || activity.action === 'permission_granted') {
      await this.createSecurityEvent({
        userId: activity.userId,
        type: 'privilege_escalation',
        severity: 'high',
        description: `User privileges modified`,
        metadata: {
          action: activity.action,
          resource: activity.resource,
          metadata: activity.metadata
        }
      });
    }
  }
  
  private async checkConcurrentSessions(userId: string): Promise<void> {
    const activeSessions = await prisma.userSession.count({
      where: {
        userId,
        isActive: true
      }
    });
    
    if (activeSessions > 3) {
      await this.createSecurityEvent({
        userId,
        type: 'concurrent_sessions',
        severity: 'medium',
        description: `${activeSessions} concurrent sessions detected`,
        metadata: { sessionCount: activeSessions }
      });
    }
  }
  
  private async createSecurityEvent(
    event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved' | 'resolvedAt' | 'resolvedBy'>
  ): Promise<void> {
    await prisma.securityEvent.create({
      data: {
        id: `security_${Date.now()}`,
        timestamp: new Date(),
        resolved: false,
        ...event
      }
    });
    
    // Also log to audit trail
    await auditLogger.log({
      action: 'security.event_detected',
      resourceType: 'user',
      resourceId: event.userId,
      userId: 'system',
      details: {
        type: event.type,
        severity: event.severity,
        description: event.description
      }
    });
  }
  
  private parseUserAgent(userAgent: string): UserSession['device'] {
    // Simple user agent parsing - in production use a library like ua-parser-js
    const device = {
      type: 'desktop' as 'desktop' | 'mobile' | 'tablet',
      os: 'Unknown',
      browser: 'Unknown'
    };
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device.type = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }
    
    if (/Windows/.test(userAgent)) device.os = 'Windows';
    else if (/Mac/.test(userAgent)) device.os = 'macOS';
    else if (/Linux/.test(userAgent)) device.os = 'Linux';
    else if (/Android/.test(userAgent)) device.os = 'Android';
    else if (/iOS/.test(userAgent)) device.os = 'iOS';
    
    if (/Chrome/.test(userAgent)) device.browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) device.browser = 'Firefox';
    else if (/Safari/.test(userAgent)) device.browser = 'Safari';
    else if (/Edge/.test(userAgent)) device.browser = 'Edge';
    
    return device;
  }
  
  private async getLocationFromIP(ipAddress: string): Promise<UserSession['location']> {
    // In production, use a geolocation service like MaxMind or ipapi
    // This is a placeholder
    return {
      country: 'US',
      region: 'CA',
      city: 'San Francisco'
    };
  }
  
  private async generateSessionSummary(session: UserSession): Promise<void> {
    const activities = await prisma.userActivity.findMany({
      where: { sessionId: session.id }
    });
    
    const summary = {
      sessionId: session.id,
      userId: session.userId,
      duration: session.duration,
      activitiesCount: activities.length,
      pagesViewed: activities.filter(a => a.action === 'page_view').length,
      featuresUsed: [...new Set(activities.map(a => a.resource).filter(Boolean))],
      device: session.device,
      location: session.location
    };
    
    await prisma.sessionSummary.create({
      data: summary
    });
  }
}

// Export singleton instance
export const userActivityMonitor = new UserActivityMonitor();

// React hook for real-time activity tracking
export function useActivityTracker(userId: string, sessionId: string) {
  const trackActivity = (action: string, resource?: string, metadata?: Record<string, any>) => {
    userActivityMonitor.trackActivity({
      userId,
      sessionId,
      action,
      resource,
      metadata,
      userAgent: navigator.userAgent,
      ipAddress: 'client-ip' // In production, get from server
    });
  };
  
  return { trackActivity };
}