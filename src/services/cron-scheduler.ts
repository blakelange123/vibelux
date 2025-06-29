/**
 * Production Cron Scheduling Infrastructure
 * Manages scheduled tasks with reliability and monitoring
 */

import { jobQueue } from './job-queue-service';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/security/webhook-auth';

interface CronJobConfig {
  name: string;
  schedule: string; // Cron expression
  jobName: string; // Job processor name
  jobData?: any;
  enabled: boolean;
  timezone?: string;
  maxConcurrency?: number;
  timeout?: number;
  retries?: number;
}

interface ScheduledJobExecution {
  jobName: string;
  scheduledTime: Date;
  executionTime?: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}

export class CronScheduler {
  private jobs: Map<string, CronJobConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private running = false;

  constructor() {
    this.loadJobConfigurations();
  }

  /**
   * Load job configurations
   */
  private async loadJobConfigurations(): Promise<void> {
    // Define all cron jobs
    const cronJobs: CronJobConfig[] = [
      {
        name: 'generate-monthly-invoices',
        schedule: '0 0 1 * *', // First day of month at midnight
        jobName: 'generateInvoice',
        enabled: true,
        timezone: 'America/New_York',
        maxConcurrency: 5,
        timeout: 300000, // 5 minutes
        retries: 3
      },
      {
        name: 'process-scheduled-payments',
        schedule: '0 9 * * *', // Daily at 9 AM
        jobName: 'processScheduledPayment',
        enabled: true,
        timezone: 'America/New_York',
        maxConcurrency: 10,
        timeout: 120000, // 2 minutes
        retries: 3
      },
      {
        name: 'collect-baseline-metrics',
        schedule: '*/15 * * * *', // Every 15 minutes
        jobName: 'collectBaselineMetrics',
        enabled: true,
        maxConcurrency: 20,
        timeout: 60000, // 1 minute
        retries: 2
      },
      {
        name: 'parse-utility-bills',
        schedule: '0 2 * * *', // Daily at 2 AM
        jobName: 'parseUtilityBill',
        enabled: true,
        maxConcurrency: 3,
        timeout: 600000, // 10 minutes
        retries: 2
      },
      {
        name: 'clean-job-history',
        schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
        jobName: 'cleanJobHistory',
        jobData: { grace: 30 * 24 * 60 * 60 * 1000 }, // 30 days
        enabled: true,
        maxConcurrency: 1,
        timeout: 300000, // 5 minutes
        retries: 1
      },
      {
        name: 'update-trust-scores',
        schedule: '0 0 * * *', // Daily at midnight
        jobName: 'updateTrustScores',
        enabled: true,
        maxConcurrency: 5,
        timeout: 300000, // 5 minutes
        retries: 2
      },
      {
        name: 'send-payment-reminders',
        schedule: '0 10 * * *', // Daily at 10 AM
        jobName: 'sendPaymentReminders',
        enabled: true,
        maxConcurrency: 10,
        timeout: 120000, // 2 minutes
        retries: 2
      },
      {
        name: 'calculate-revenue-shares',
        schedule: '0 0 * * 1', // Weekly on Monday at midnight
        jobName: 'calculateRevenueShares',
        enabled: true,
        maxConcurrency: 3,
        timeout: 600000, // 10 minutes
        retries: 3
      }
    ];

    // Store configurations
    cronJobs.forEach(job => {
      this.jobs.set(job.name, job);
    });
  }

  /**
   * Start the cron scheduler
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    // Start each enabled job
    for (const [name, config] of this.jobs) {
      if (config.enabled) {
        await this.startJob(name, config);
      }
    }

  }

  /**
   * Start a specific cron job
   */
  private async startJob(name: string, config: CronJobConfig): Promise<void> {
    try {
      // Calculate next run time
      const nextRun = this.calculateNextRun(config.schedule, config.timezone);
      const delay = nextRun.getTime() - Date.now();


      // Set timeout for next execution
      const timeout = setTimeout(async () => {
        await this.executeJob(name, config);
        
        // Reschedule if still running
        if (this.running && config.enabled) {
          await this.startJob(name, config);
        }
      }, delay);

      this.intervals.set(name, timeout);

      // Record scheduled execution
      await this.recordScheduledExecution(name, nextRun);
    } catch (error) {
      console.error(`Failed to start job ${name}:`, error);
    }
  }

  /**
   * Execute a cron job
   */
  private async executeJob(name: string, config: CronJobConfig): Promise<void> {
    const startTime = Date.now();

    try {
      // Check if job should run (avoid duplicate executions)
      const shouldRun = await this.shouldExecuteJob(name);
      if (!shouldRun) {
        return;
      }

      // Get job-specific data
      const jobData = await this.prepareJobData(config);

      // Add job to queue with timeout and retry configuration
      const job = await jobQueue.addJob(
        'cron-jobs',
        config.jobName,
        {
          ...config.jobData,
          ...jobData,
          cronJobName: name,
          scheduledTime: new Date()
        },
        {
          attempts: config.retries || 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          },
          removeOnComplete: true,
          removeOnFail: false,
          priority: 5
        }
      );

      // Wait for job completion with timeout
      const result = await this.waitForJobCompletion(job.id, config.timeout || 300000);

      const duration = Date.now() - startTime;

      // Record successful execution
      await this.recordJobExecution(name, 'completed', result, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Cron job ${name} failed after ${duration}ms:`, error);

      // Record failed execution
      await this.recordJobExecution(
        name, 
        'failed', 
        null, 
        duration, 
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Send alert for critical jobs
      if (config.retries && config.retries > 2) {
        await this.sendJobFailureAlert(name, error as Error);
      }
    }
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(schedule: string, timezone?: string): Date {
    // Simple implementation - in production use node-cron or similar
    const parts = schedule.split(' ');
    const now = new Date();
    
    // Handle simple cases
    if (schedule === '*/15 * * * *') {
      // Every 15 minutes
      const minutes = now.getMinutes();
      const nextMinute = Math.ceil(minutes / 15) * 15;
      now.setMinutes(nextMinute, 0, 0);
      if (nextMinute >= 60) {
        now.setHours(now.getHours() + 1);
        now.setMinutes(nextMinute - 60);
      }
      return now;
    } else if (schedule === '0 9 * * *') {
      // Daily at 9 AM
      now.setHours(9, 0, 0, 0);
      if (now <= new Date()) {
        now.setDate(now.getDate() + 1);
      }
      return now;
    } else if (schedule === '0 0 1 * *') {
      // First day of month
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      if (now <= new Date()) {
        now.setMonth(now.getMonth() + 1);
      }
      return now;
    }

    // Default: run in 1 minute
    return new Date(Date.now() + 60000);
  }

  /**
   * Check if job should execute
   */
  private async shouldExecuteJob(name: string): Promise<boolean> {
    try {
      // Check recent executions
      const recentExecution = await prisma.cronExecution.findFirst({
        where: {
          jobName: name,
          startedAt: {
            gte: new Date(Date.now() - 60000) // Within last minute
          },
          status: {
            in: ['running', 'completed']
          }
        },
        orderBy: {
          startedAt: 'desc'
        }
      });

      return !recentExecution;
    } catch (error) {
      console.error('Error checking job execution status:', error);
      return true; // Allow execution on error
    }
  }

  /**
   * Prepare job-specific data
   */
  private async prepareJobData(config: CronJobConfig): Promise<any> {
    const data: any = {};

    switch (config.jobName) {
      case 'generateInvoice':
        // Get all active agreements that need invoicing
        const agreements = await prisma.revenueSharingAgreement.findMany({
          where: {
            status: 'ACTIVE',
            nextInvoiceDate: {
              lte: new Date()
            }
          },
          select: { id: true }
        });
        data.agreementIds = agreements.map(a => a.id);
        break;

      case 'processScheduledPayment':
        // Get due payment schedules
        const schedules = await prisma.paymentSchedule.findMany({
          where: {
            status: 'PENDING',
            scheduledDate: {
              lte: new Date()
            }
          },
          select: { id: true }
        });
        data.scheduleIds = schedules.map(s => s.id);
        break;

      case 'collectBaselineMetrics':
        // Get all active facilities
        const facilities = await prisma.facility.findMany({
          where: { status: 'active' },
          select: { id: true }
        });
        data.facilityIds = facilities.map(f => f.id);
        break;

      case 'parseUtilityBill':
        // Get pending utility bills
        const bills = await prisma.utilityBill.findMany({
          where: {
            status: 'PENDING',
            uploadedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          select: { 
            id: true, 
            fileUrl: true, 
            facilityId: true,
            provider: true 
          }
        });
        data.bills = bills;
        break;
    }

    return data;
  }

  /**
   * Wait for job completion with timeout
   */
  private async waitForJobCompletion(
    jobId: string,
    timeout: number
  ): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const job = await jobQueue.getJob('cron-jobs', jobId);
      
      if (job?.finishedOn) {
        return job.returnvalue;
      }
      
      if (job?.failedReason) {
        throw new Error(job.failedReason);
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Job ${jobId} timed out after ${timeout}ms`);
  }

  /**
   * Stop the cron scheduler
   */
  async stop(): Promise<void> {
    this.running = false;

    // Clear all intervals
    for (const [name, timeout] of this.intervals) {
      clearTimeout(timeout);
    }
    this.intervals.clear();

  }

  /**
   * Manually trigger a job
   */
  async triggerJob(name: string): Promise<void> {
    const config = this.jobs.get(name);
    if (!config) {
      throw new Error(`Job ${name} not found`);
    }

    await this.executeJob(name, config);
  }

  /**
   * Update job configuration
   */
  async updateJobConfig(
    name: string,
    updates: Partial<CronJobConfig>
  ): Promise<void> {
    const config = this.jobs.get(name);
    if (!config) {
      throw new Error(`Job ${name} not found`);
    }

    // Update configuration
    Object.assign(config, updates);
    this.jobs.set(name, config);

    // Restart job if running and enabled changed
    if (this.running && 'enabled' in updates) {
      if (updates.enabled) {
        await this.startJob(name, config);
      } else {
        const timeout = this.intervals.get(name);
        if (timeout) {
          clearTimeout(timeout);
          this.intervals.delete(name);
        }
      }
    }

  }

  /**
   * Get job status and metrics
   */
  async getJobMetrics(name: string): Promise<any> {
    const config = this.jobs.get(name);
    if (!config) {
      throw new Error(`Job ${name} not found`);
    }

    // Get execution history
    const executions = await prisma.cronExecution.findMany({
      where: {
        jobName: name,
        startedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 100
    });

    // Calculate metrics
    const metrics = {
      name,
      schedule: config.schedule,
      enabled: config.enabled,
      isRunning: this.intervals.has(name),
      lastExecution: executions[0] || null,
      executionStats: {
        total: executions.length,
        successful: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        avgDuration: executions
          .filter(e => e.duration)
          .reduce((sum, e) => sum + e.duration!, 0) / executions.length || 0
      },
      nextRun: this.intervals.has(name) ? 
        this.calculateNextRun(config.schedule, config.timezone) : null
    };

    return metrics;
  }

  /**
   * Record scheduled execution
   */
  private async recordScheduledExecution(
    jobName: string,
    scheduledTime: Date
  ): Promise<void> {
    try {
      await prisma.cronExecution.create({
        data: {
          jobName,
          scheduledAt: scheduledTime,
          status: 'scheduled'
        }
      });
    } catch (error) {
      console.error('Failed to record scheduled execution:', error);
    }
  }

  /**
   * Record job execution
   */
  private async recordJobExecution(
    jobName: string,
    status: 'completed' | 'failed',
    result: any,
    duration: number,
    error?: string
  ): Promise<void> {
    try {
      await prisma.cronExecution.create({
        data: {
          jobName,
          status,
          startedAt: new Date(Date.now() - duration),
          completedAt: status === 'completed' ? new Date() : undefined,
          failedAt: status === 'failed' ? new Date() : undefined,
          duration,
          result: result ? JSON.stringify(result) : undefined,
          error
        }
      });
    } catch (err) {
      console.error('Failed to record job execution:', err);
    }
  }

  /**
   * Send alert for job failures
   */
  private async sendJobFailureAlert(jobName: string, error: Error): Promise<void> {
    // In production, this would send to monitoring service
    console.error(`🚨 CRON JOB FAILURE ALERT: ${jobName}`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const cronScheduler = new CronScheduler();

// API endpoint handler for webhook-based cron execution
export async function handleCronWebhook(
  request: Request
): Promise<Response> {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-cron-signature');
    const body = await request.text();
    
    if (!verifyWebhookSignature(body, signature, process.env.CRON_SECRET_KEY)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = JSON.parse(body);
    const { jobName } = data;

    if (!jobName) {
      return new Response('Missing job name', { status: 400 });
    }

    // Trigger the job
    await cronScheduler.triggerJob(jobName);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cron webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}