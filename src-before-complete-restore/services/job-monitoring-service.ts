/**
 * Job Failure Recovery and Monitoring Service
 * Monitors job execution health and handles recovery strategies
 */

import { jobQueue } from './job-queue-service';
import { cronScheduler } from './cron-scheduler';
import { prisma } from '@/lib/prisma';

interface JobHealth {
  queueName: string;
  healthy: boolean;
  metrics: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    failureRate: number;
    avgProcessingTime: number;
  };
  alerts: Alert[];
}

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  timestamp: Date;
  metadata?: any;
}

interface RecoveryStrategy {
  type: 'retry' | 'dead-letter' | 'manual' | 'escalate';
  maxAttempts: number;
  backoffMs: number;
  action: (job: any) => Promise<void>;
}

export class JobMonitoringService {
  private monitoringInterval?: NodeJS.Timeout;
  private alerts: Map<string, Alert> = new Map();
  private healthChecks: Map<string, JobHealth> = new Map();
  
  // Thresholds for alerts
  private readonly thresholds = {
    failureRate: 0.1, // 10% failure rate
    queueDepth: 1000, // Max waiting jobs
    processingTime: 300000, // 5 minutes
    stalledJobs: 10,
    criticalQueues: ['payments', 'invoicing']
  };

  /**
   * Start monitoring
   */
  async start(intervalMs: number = 60000): Promise<void> {
    
    // Initial check
    await this.performHealthCheck();
    
    // Schedule regular checks
    this.monitoringInterval = setInterval(
      () => this.performHealthCheck(),
      intervalMs
    );
    
  }

  /**
   * Stop monitoring
   */
  async stop(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    
    try {
      // Check all queues
      const queueNames = ['cron-jobs', 'payments', 'invoicing', 'metrics', 'notifications'];
      
      for (const queueName of queueNames) {
        const health = await this.checkQueueHealth(queueName);
        this.healthChecks.set(queueName, health);
        
        // Process alerts
        await this.processQueueAlerts(health);
      }
      
      // Check cron job health
      await this.checkCronJobHealth();
      
      // Check for stalled jobs
      await this.checkStalledJobs();
      
      // Process recovery for failed jobs
      await this.processFailedJobRecovery();
      
      // Send aggregated alerts if needed
      await this.sendAggregatedAlerts();
      
    } catch (error) {
      console.error('Health check error:', error);
      this.createAlert('critical', 'health-check-failed', 
        'Job monitoring health check failed', { error });
    }
  }

  /**
   * Check health of a specific queue
   */
  private async checkQueueHealth(queueName: string): Promise<JobHealth> {
    try {
      const metrics = await jobQueue.getQueueMetrics(queueName);
      
      // Calculate failure rate
      const total = metrics.completed + metrics.failed;
      const failureRate = total > 0 ? metrics.failed / total : 0;
      
      // Get average processing time from recent jobs
      const recentJobs = await prisma.jobExecution.findMany({
        where: {
          jobName: { startsWith: queueName },
          completedAt: { not: null },
          startedAt: { 
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        },
        select: {
          startedAt: true,
          completedAt: true
        }
      });
      
      const avgProcessingTime = recentJobs.length > 0
        ? recentJobs.reduce((sum, job) => {
            const duration = job.completedAt!.getTime() - job.startedAt.getTime();
            return sum + duration;
          }, 0) / recentJobs.length
        : 0;
      
      const health: JobHealth = {
        queueName,
        healthy: this.isQueueHealthy(metrics, failureRate, avgProcessingTime),
        metrics: {
          ...metrics,
          failureRate,
          avgProcessingTime
        },
        alerts: []
      };
      
      // Check for issues
      if (failureRate > this.thresholds.failureRate) {
        health.alerts.push({
          id: `${queueName}-high-failure-rate`,
          severity: this.thresholds.criticalQueues.includes(queueName) ? 'critical' : 'high',
          type: 'high-failure-rate',
          message: `Queue ${queueName} has ${(failureRate * 100).toFixed(1)}% failure rate`,
          timestamp: new Date(),
          metadata: { failureRate, threshold: this.thresholds.failureRate }
        });
      }
      
      if (metrics.waiting > this.thresholds.queueDepth) {
        health.alerts.push({
          id: `${queueName}-queue-depth`,
          severity: 'high',
          type: 'queue-depth-exceeded',
          message: `Queue ${queueName} has ${metrics.waiting} waiting jobs`,
          timestamp: new Date(),
          metadata: { waiting: metrics.waiting, threshold: this.thresholds.queueDepth }
        });
      }
      
      if (avgProcessingTime > this.thresholds.processingTime) {
        health.alerts.push({
          id: `${queueName}-slow-processing`,
          severity: 'medium',
          type: 'slow-processing',
          message: `Queue ${queueName} avg processing time is ${Math.round(avgProcessingTime / 1000)}s`,
          timestamp: new Date(),
          metadata: { avgProcessingTime, threshold: this.thresholds.processingTime }
        });
      }
      
      return health;
    } catch (error) {
      console.error(`Failed to check health for queue ${queueName}:`, error);
      return {
        queueName,
        healthy: false,
        metrics: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          failureRate: 0,
          avgProcessingTime: 0
        },
        alerts: [{
          id: `${queueName}-health-check-error`,
          severity: 'high',
          type: 'health-check-error',
          message: `Failed to check health for queue ${queueName}`,
          timestamp: new Date(),
          metadata: { error }
        }]
      };
    }
  }

  /**
   * Check if queue is healthy
   */
  private isQueueHealthy(
    metrics: any,
    failureRate: number,
    avgProcessingTime: number
  ): boolean {
    return (
      failureRate <= this.thresholds.failureRate &&
      metrics.waiting <= this.thresholds.queueDepth &&
      avgProcessingTime <= this.thresholds.processingTime &&
      metrics.failed < 100 // Absolute threshold
    );
  }

  /**
   * Check cron job health
   */
  private async checkCronJobHealth(): Promise<void> {
    try {
      // Get all cron jobs
      const jobs = ['generate-monthly-invoices', 'process-scheduled-payments', 
                    'collect-baseline-metrics', 'parse-utility-bills'];
      
      for (const jobName of jobs) {
        const metrics = await cronScheduler.getJobMetrics(jobName);
        
        // Check if job is running when it should be
        if (metrics.enabled && !metrics.isRunning) {
          this.createAlert('high', 'cron-job-not-running',
            `Cron job ${jobName} is enabled but not running`, { jobName });
        }
        
        // Check failure rate
        if (metrics.executionStats.total > 0) {
          const failureRate = metrics.executionStats.failed / metrics.executionStats.total;
          if (failureRate > 0.2) { // 20% failure rate for cron jobs
            this.createAlert('high', 'cron-job-high-failure',
              `Cron job ${jobName} has ${(failureRate * 100).toFixed(1)}% failure rate`,
              { jobName, failureRate });
          }
        }
        
        // Check if job hasn't run recently when it should have
        if (metrics.enabled && metrics.lastExecution) {
          const lastRunAge = Date.now() - new Date(metrics.lastExecution.startedAt).getTime();
          const expectedInterval = this.getExpectedInterval(metrics.schedule);
          
          if (lastRunAge > expectedInterval * 2) {
            this.createAlert('medium', 'cron-job-missed-execution',
              `Cron job ${jobName} hasn't run in ${Math.round(lastRunAge / 60000)} minutes`,
              { jobName, lastRunAge, expectedInterval });
          }
        }
      }
    } catch (error) {
      console.error('Failed to check cron job health:', error);
    }
  }

  /**
   * Check for stalled jobs
   */
  private async checkStalledJobs(): Promise<void> {
    try {
      // Find jobs that have been running too long
      const stalledJobs = await prisma.jobExecution.findMany({
        where: {
          status: 'RUNNING',
          startedAt: {
            lt: new Date(Date.now() - 30 * 60 * 1000) // Running for > 30 minutes
          }
        }
      });
      
      if (stalledJobs.length > this.thresholds.stalledJobs) {
        this.createAlert('high', 'too-many-stalled-jobs',
          `${stalledJobs.length} jobs have been running for over 30 minutes`,
          { count: stalledJobs.length, jobs: stalledJobs.map(j => j.jobId) });
      }
      
      // Attempt to recover stalled jobs
      for (const stalledJob of stalledJobs) {
        await this.recoverStalledJob(stalledJob);
      }
    } catch (error) {
      console.error('Failed to check stalled jobs:', error);
    }
  }

  /**
   * Process recovery for failed jobs
   */
  private async processFailedJobRecovery(): Promise<void> {
    try {
      // Get recent failed jobs
      const failedJobs = await prisma.jobExecution.findMany({
        where: {
          status: 'FAILED',
          failedAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          },
          retryCount: {
            lt: 3 // Haven't exceeded retry limit
          }
        },
        orderBy: {
          failedAt: 'desc'
        },
        take: 50
      });
      
      
      for (const failedJob of failedJobs) {
        const strategy = this.determineRecoveryStrategy(failedJob);
        await this.executeRecoveryStrategy(failedJob, strategy);
      }
    } catch (error) {
      console.error('Failed to process job recovery:', error);
    }
  }

  /**
   * Determine recovery strategy for failed job
   */
  private determineRecoveryStrategy(job: any): RecoveryStrategy {
    // Payment jobs get special treatment
    if (job.jobName.includes('payment') || job.jobName.includes('Payment')) {
      return {
        type: 'retry',
        maxAttempts: 5,
        backoffMs: 60000 * Math.pow(2, job.retryCount || 0), // Exponential backoff
        action: async (j) => this.retryJob(j)
      };
    }
    
    // Critical jobs escalate after 3 failures
    if (job.retryCount >= 3 && this.isCriticalJob(job.jobName)) {
      return {
        type: 'escalate',
        maxAttempts: 1,
        backoffMs: 0,
        action: async (j) => this.escalateJob(j)
      };
    }
    
    // Non-critical jobs go to dead letter after 3 attempts
    if (job.retryCount >= 3) {
      return {
        type: 'dead-letter',
        maxAttempts: 1,
        backoffMs: 0,
        action: async (j) => this.moveToDeadLetter(j)
      };
    }
    
    // Default: retry with backoff
    return {
      type: 'retry',
      maxAttempts: 3,
      backoffMs: 30000 * (job.retryCount + 1), // Linear backoff
      action: async (j) => this.retryJob(j)
    };
  }

  /**
   * Execute recovery strategy
   */
  private async executeRecoveryStrategy(
    job: any,
    strategy: RecoveryStrategy
  ): Promise<void> {
    try {
      
      // Update retry count
      await prisma.jobExecution.update({
        where: { id: job.id },
        data: {
          retryCount: (job.retryCount || 0) + 1,
          lastRetryAt: new Date()
        }
      });
      
      // Wait for backoff period
      if (strategy.backoffMs > 0) {
        await new Promise(resolve => setTimeout(resolve, strategy.backoffMs));
      }
      
      // Execute recovery action
      await strategy.action(job);
      
    } catch (error) {
      console.error(`Recovery failed for job ${job.jobId}:`, error);
      
      // If recovery fails, escalate
      if (strategy.type !== 'escalate') {
        await this.escalateJob(job);
      }
    }
  }

  /**
   * Retry a failed job
   */
  private async retryJob(job: any): Promise<void> {
    
    // Re-add to queue
    const [queueName, ...jobNameParts] = job.jobName.split(':');
    const actualJobName = jobNameParts.join(':');
    
    await jobQueue.addJob(
      queueName,
      actualJobName,
      job.data ? JSON.parse(job.data) : {},
      {
        attempts: 1, // Single attempt for retry
        priority: 10 // Higher priority for retries
      }
    );
  }

  /**
   * Move job to dead letter queue
   */
  private async moveToDeadLetter(job: any): Promise<void> {
    
    await jobQueue.addJob(
      'dead-letter',
      job.jobName,
      {
        originalJob: job,
        movedAt: new Date(),
        reason: 'Max retries exceeded'
      },
      {
        removeOnComplete: false,
        removeOnFail: false
      }
    );
    
    // Update job status
    await prisma.jobExecution.update({
      where: { id: job.id },
      data: {
        status: 'DEAD_LETTER',
        movedToDeadLetterAt: new Date()
      }
    });
  }

  /**
   * Escalate critical job failure
   */
  private async escalateJob(job: any): Promise<void> {
    
    this.createAlert('critical', 'job-escalation',
      `Critical job ${job.jobName} failed after ${job.retryCount} attempts`,
      { 
        job,
        error: job.error,
        stackTrace: job.stackTrace
      }
    );
    
    // In production, this would:
    // - Send PagerDuty alert
    // - Create incident ticket
    // - Notify on-call engineer
    // - Post to Slack emergency channel
  }

  /**
   * Recover stalled job
   */
  private async recoverStalledJob(job: any): Promise<void> {
    
    try {
      // Mark as failed
      await prisma.jobExecution.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          error: 'Job stalled - exceeded maximum runtime'
        }
      });
      
      // Retry if critical
      if (this.isCriticalJob(job.jobName)) {
        await this.retryJob(job);
      }
    } catch (error) {
      console.error(`Failed to recover stalled job ${job.jobId}:`, error);
    }
  }

  /**
   * Check if job is critical
   */
  private isCriticalJob(jobName: string): boolean {
    const criticalPatterns = [
      'payment',
      'invoice',
      'billing',
      'revenue',
      'customer'
    ];
    
    return criticalPatterns.some(pattern => 
      jobName.toLowerCase().includes(pattern)
    );
  }

  /**
   * Get expected interval for cron schedule
   */
  private getExpectedInterval(schedule: string): number {
    // Simple mapping for common schedules
    const intervals: Record<string, number> = {
      '*/15 * * * *': 15 * 60 * 1000, // 15 minutes
      '0 * * * *': 60 * 60 * 1000, // 1 hour
      '0 9 * * *': 24 * 60 * 60 * 1000, // 1 day
      '0 0 1 * *': 30 * 24 * 60 * 60 * 1000, // 1 month
      '0 0 * * 0': 7 * 24 * 60 * 60 * 1000, // 1 week
    };
    
    return intervals[schedule] || 60 * 60 * 1000; // Default 1 hour
  }

  /**
   * Process alerts for queue
   */
  private async processQueueAlerts(health: JobHealth): Promise<void> {
    for (const alert of health.alerts) {
      this.alerts.set(alert.id, alert);
    }
  }

  /**
   * Create alert
   */
  private createAlert(
    severity: Alert['severity'],
    type: string,
    message: string,
    metadata?: any
  ): void {
    const alert: Alert = {
      id: `${type}-${Date.now()}`,
      severity,
      type,
      message,
      timestamp: new Date(),
      metadata
    };
    
    this.alerts.set(alert.id, alert);
  }

  /**
   * Send aggregated alerts
   */
  private async sendAggregatedAlerts(): Promise<void> {
    const recentAlerts = Array.from(this.alerts.values())
      .filter(alert => 
        Date.now() - alert.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
      );
    
    if (recentAlerts.length === 0) return;
    
    // Group by severity
    const critical = recentAlerts.filter(a => a.severity === 'critical');
    const high = recentAlerts.filter(a => a.severity === 'high');
    const medium = recentAlerts.filter(a => a.severity === 'medium');
    
    if (critical.length > 0) {
      console.error('🚨 CRITICAL ALERTS:', critical);
      // Send immediate notification
    }
    
    if (high.length > 0) {
      console.warn('⚠️ HIGH PRIORITY ALERTS:', high);
      // Send notification with 5 minute delay
    }
    
    if (medium.length > 0) {
      // Include in hourly summary
    }
    
    // Clean old alerts
    const oldAlertIds = Array.from(this.alerts.entries())
      .filter(([id, alert]) => 
        Date.now() - alert.timestamp.getTime() > 60 * 60 * 1000 // 1 hour
      )
      .map(([id]) => id);
    
    oldAlertIds.forEach(id => this.alerts.delete(id));
  }

  /**
   * Get current system health
   */
  async getSystemHealth(): Promise<{
    healthy: boolean;
    queues: JobHealth[];
    alerts: Alert[];
    summary: string;
  }> {
    const queues = Array.from(this.healthChecks.values());
    const alerts = Array.from(this.alerts.values())
      .filter(alert => 
        Date.now() - alert.timestamp.getTime() < 60 * 60 * 1000 // Last hour
      )
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    
    const healthy = queues.every(q => q.healthy) && 
                   alerts.filter(a => a.severity === 'critical').length === 0;
    
    const summary = healthy
      ? 'All systems operational'
      : `${alerts.filter(a => a.severity === 'critical').length} critical issues, ` +
        `${queues.filter(q => !q.healthy).length} unhealthy queues`;
    
    return {
      healthy,
      queues,
      alerts,
      summary
    };
  }
}

// Export singleton instance
export const jobMonitoring = new JobMonitoringService();

// Start monitoring on module load
if (process.env.NODE_ENV === 'production') {
  jobMonitoring.start().catch(console.error);
}