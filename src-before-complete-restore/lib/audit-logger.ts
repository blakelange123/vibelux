/**
 * Audit Logger for Admin Actions
 * Tracks all administrative actions for compliance and security
 */

import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  duration?: number;
}

export enum AuditAction {
  // Affiliate Management
  AFFILIATE_VIEW = 'affiliate.view',
  AFFILIATE_CREATE = 'affiliate.create',
  AFFILIATE_UPDATE = 'affiliate.update',
  AFFILIATE_DELETE = 'affiliate.delete',
  AFFILIATE_SUSPEND = 'affiliate.suspend',
  AFFILIATE_ACTIVATE = 'affiliate.activate',
  AFFILIATE_TERMINATE = 'affiliate.terminate',
  
  // Financial Actions
  PAYOUT_MANUAL = 'payout.manual',
  PAYOUT_BULK = 'payout.bulk',
  COMMISSION_ADJUST = 'commission.adjust',
  COMMISSION_OVERRIDE = 'commission.override',
  
  // System Actions
  SYSTEM_CONFIG_UPDATE = 'system.config.update',
  FEATURE_FLAG_TOGGLE = 'feature.flag.toggle',
  MAINTENANCE_MODE = 'maintenance.mode',
  
  // Data Export
  DATA_EXPORT = 'data.export',
  REPORT_GENERATE = 'report.generate',
  
  // Communications
  EMAIL_SEND_BULK = 'email.send.bulk',
  NOTIFICATION_SEND = 'notification.send',
  
  // Security
  PERMISSION_GRANT = 'permission.grant',
  PERMISSION_REVOKE = 'permission.revoke',
  API_KEY_CREATE = 'api.key.create',
  API_KEY_REVOKE = 'api.key.revoke',
}

export class AuditLogger {
  private static instance: AuditLogger;
  private queue: AuditLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start flush interval
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000); // Flush every 5 seconds
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // Add to queue
    this.queue.push(logEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // Audit log entry would be logged here in development
    }

    // Flush immediately for critical actions
    if (this.isCriticalAction(logEntry.action)) {
      await this.flush();
    }
  }

  async logRequest(
    request: Request,
    userId: string,
    userEmail: string,
    userRole: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    const startTime = Date.now();
    
    const entry = {
      userId,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success' as const,
      duration: 0,
    };

    try {
      await this.log(entry);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      AuditAction.AFFILIATE_DELETE,
      AuditAction.AFFILIATE_TERMINATE,
      AuditAction.PAYOUT_MANUAL,
      AuditAction.PAYOUT_BULK,
      AuditAction.SYSTEM_CONFIG_UPDATE,
      AuditAction.PERMISSION_GRANT,
      AuditAction.PERMISSION_REVOKE,
      AuditAction.API_KEY_CREATE,
      AuditAction.API_KEY_REVOKE,
    ];
    
    return criticalActions.includes(action);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const logsToFlush = [...this.queue];
    this.queue = [];

    try {
      // In production, this would write to database
      // await db.auditLogs.createMany({
      //   data: logsToFlush
      // });

      // For now, write to a file or external service
      if (process.env.AUDIT_LOG_ENDPOINT) {
        await fetch(process.env.AUDIT_LOG_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AUDIT_LOG_API_KEY}`,
          },
          body: JSON.stringify({ logs: logsToFlush }),
        });
      }

      // Also can write to file system for backup (server-side only)
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          const logDir = path.join(process.cwd(), 'logs', 'audit');
          const logFile = path.join(
            logDir, 
            `audit-${new Date().toISOString().split('T')[0]}.jsonl`
          );
          
          await fs.mkdir(logDir, { recursive: true });
          await fs.appendFile(
            logFile,
            logsToFlush.map(log => JSON.stringify(log)).join('\n') + '\n'
          );
        } catch (fsError) {
          console.error('Failed to write audit logs to file:', fsError);
        }
      }
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Re-add to queue on failure
      this.queue.unshift(...logsToFlush);
    }
  }

  async search(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'success' | 'failure' | 'partial';
  }): Promise<AuditLogEntry[]> {
    const { prisma } = await import('@/lib/prisma');
    
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.entityType = filters.resource;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }
    
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000 // Limit results
    });
    
    return logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      userId: log.userId,
      userEmail: '', // Would need to join with user table
      userRole: '', // Would need to join with user table  
      action: log.action,
      resource: log.entityType,
      resourceId: log.entityId,
      details: log.changes || {},
      status: 'success' as const // Default since we don't track status currently
    }));
    //     status: filters.status,
    //   },
    //   orderBy: { timestamp: 'desc' },
    //   limit: 1000,
    // });
    
    return [];
  }

  async generateReport(
    startDate: Date,
    endDate: Date,
    groupBy: 'user' | 'action' | 'resource' = 'action'
  ): Promise<any> {
    const logs = await this.search({ startDate, endDate });
    
    const report = logs.reduce((acc, log) => {
      const key = log[groupBy];
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          successCount: 0,
          failureCount: 0,
          actions: new Set(),
          resources: new Set(),
        };
      }
      
      acc[key].count++;
      if (log.status === 'success') acc[key].successCount++;
      if (log.status === 'failure') acc[key].failureCount++;
      acc[key].actions.add(log.action);
      acc[key].resources.add(log.resource);
      
      return acc;
    }, {} as Record<string, any>);
    
    // Convert sets to arrays
    Object.keys(report).forEach(key => {
      report[key].actions = Array.from(report[key].actions);
      report[key].resources = Array.from(report[key].resources);
    });
    
    return report;
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }
}

// Helper functions for common logging scenarios
export const auditLog = AuditLogger.getInstance();

export async function logAdminAction(
  req: Request,
  user: { id: string; email: string; role: string },
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: any
): Promise<void> {
  await auditLog.logRequest(
    req,
    user.id,
    user.email,
    user.role,
    action,
    resource,
    resourceId,
    details
  );
}

// Middleware for automatic audit logging
export function withAuditLogging(
  action: AuditAction,
  resource: string
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let status: 'success' | 'failure' = 'success';
      let errorMessage: string | undefined;
      let result: any;

      try {
        result = await originalMethod.apply(this, args);
      } catch (error) {
        status = 'failure';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        
        // Extract user info from args (assumes first arg is request-like)
        const req = args[0];
        const user = req?.user || { id: 'system', email: 'system', role: 'system' };
        
        await auditLog.log({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action,
          resource,
          resourceId: args[1], // Assumes second arg might be resource ID
          details: { args: args.slice(1) },
          status,
          errorMessage,
          duration,
        });
      }

      return result;
    };

    return descriptor;
  };
}

// Compliance report generator
export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<{
  summary: any;
  criticalActions: AuditLogEntry[];
  failedActions: AuditLogEntry[];
  userActivity: any;
}> {
  const logs = await auditLog.search({ startDate, endDate });
  
  const criticalActions = logs.filter(log => 
    auditLog['isCriticalAction'](log.action)
  );
  
  const failedActions = logs.filter(log => 
    log.status === 'failure'
  );
  
  const userActivity = await auditLog.generateReport(
    startDate,
    endDate,
    'user'
  );
  
  const summary = {
    totalActions: logs.length,
    criticalActions: criticalActions.length,
    failedActions: failedActions.length,
    uniqueUsers: new Set(logs.map(l => l.userId)).size,
    mostActiveUser: Object.entries(userActivity)
      .sort(([, a]: any, [, b]: any) => b.count - a.count)[0],
  };
  
  return {
    summary,
    criticalActions,
    failedActions,
    userActivity,
  };
}

export default auditLog;