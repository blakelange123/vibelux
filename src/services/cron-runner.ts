/**
 * Cron Job Runner Service
 * Executes scheduled financial automation tasks
 */

import { cronJobs, cronMonitoring } from '@/lib/cron/cron-config';
import cron from 'node-cron';

interface JobStatus {
  name: string;
  isRunning: boolean;
  lastRun?: Date;
  lastError?: string;
  consecutiveFailures: number;
  nextRun?: Date;
}

export class CronRunner {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobStatuses: Map<string, JobStatus> = new Map();
  private isRunning = false;

  constructor() {
    // Initialize job statuses
    cronJobs.forEach(job => {
      this.jobStatuses.set(job.name, {
        name: job.name,
        isRunning: false,
        consecutiveFailures: 0
      });
    });
  }

  /**
   * Start all cron jobs
   */
  async start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Schedule all jobs
    cronJobs.forEach(jobConfig => {
      try {
        const task = cron.schedule(jobConfig.schedule, async () => {
          await this.executeJob(jobConfig);
        }, {
          scheduled: false, // Don't start immediately
          timezone: 'UTC'
        });

        this.jobs.set(jobConfig.name, task);
        task.start();

        
        // Update next run time
        const status = this.jobStatuses.get(jobConfig.name)!;
        status.nextRun = this.getNextRunTime(jobConfig.schedule);
        
      } catch (error) {
        console.error(`❌ Failed to schedule job ${jobConfig.name}:`, error);
      }
    });

  }

  /**
   * Stop all cron jobs
   */
  async stop() {
    if (!this.isRunning) return;

    this.isRunning = false;

    // Destroy all tasks
    this.jobs.forEach((task, name) => {
      task.destroy();
    });

    this.jobs.clear();
  }

  /**
   * Execute a specific job
   */
  private async executeJob(jobConfig: typeof cronJobs[0]) {
    const status = this.jobStatuses.get(jobConfig.name)!;
    
    if (status.isRunning) {
      return;
    }

    status.isRunning = true;
    status.lastRun = new Date();
    

    try {
      // Make HTTP request to the job endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${jobConfig.endpoint}`, {
        method: jobConfig.method,
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET_KEY || 'development-secret'
        },
        body: jobConfig.body ? JSON.stringify(jobConfig.body) : undefined,
        signal: AbortSignal.timeout(jobConfig.timeout || 300000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      // Success
      status.consecutiveFailures = 0;
      status.lastError = undefined;
      status.nextRun = this.getNextRunTime(jobConfig.schedule);
      

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      status.consecutiveFailures++;
      status.lastError = errorMessage;
      
      console.error(`❌ Job failed: ${jobConfig.name}`, errorMessage);

      // Send alert if failure threshold exceeded
      if (status.consecutiveFailures >= cronMonitoring.failureThreshold) {
        await this.sendAlert(jobConfig, status, errorMessage);
      }

      // Retry logic
      if (status.consecutiveFailures <= jobConfig.retries) {
      }

    } finally {
      status.isRunning = false;
    }
  }

  /**
   * Send alert for failed job
   */
  private async sendAlert(jobConfig: typeof cronJobs[0], status: JobStatus, error: string) {
    const alertMessage = `
🚨 **Cron Job Alert**
Job: ${jobConfig.name}
Failures: ${status.consecutiveFailures}
Last Error: ${error}
Description: ${jobConfig.description}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      // Slack notification
      if (cronMonitoring.slackWebhook) {
        await fetch(cronMonitoring.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: alertMessage,
            channel: '#alerts',
            username: 'Vibelux Cron Monitor'
          })
        });
      }

      // Email notification (implement based on your email service)
      if (cronMonitoring.emailAlerts) {
        // TODO: Implement email service integration
      }

    } catch (alertError) {
      console.error('Failed to send alert:', alertError);
    }
  }

  /**
   * Get job statuses
   */
  getJobStatuses(): JobStatus[] {
    return Array.from(this.jobStatuses.values());
  }

  /**
   * Get next run time for a cron expression
   */
  private getNextRunTime(cronExpression: string): Date {
    // This is a simplified implementation
    // In production, you'd use a proper cron parser like 'cron-parser'
    const now = new Date();
    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow as fallback
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobName: string): Promise<boolean> {
    const jobConfig = cronJobs.find(j => j.name === jobName);
    if (!jobConfig) {
      console.error(`Job not found: ${jobName}`);
      return false;
    }

    await this.executeJob(jobConfig);
    return true;
  }

  /**
   * Get service health
   */
  getHealth() {
    const statuses = this.getJobStatuses();
    const totalJobs = statuses.length;
    const runningJobs = statuses.filter(s => s.isRunning).length;
    const failedJobs = statuses.filter(s => s.consecutiveFailures > 0).length;

    return {
      isRunning: this.isRunning,
      totalJobs,
      runningJobs,
      failedJobs,
      status: failedJobs === 0 ? 'healthy' : failedJobs < totalJobs / 2 ? 'degraded' : 'unhealthy',
      uptime: process.uptime(),
      lastCheck: new Date().toISOString()
    };
  }
}

// Singleton instance
let cronRunner: CronRunner | null = null;

export function getCronRunner(): CronRunner {
  if (!cronRunner) {
    cronRunner = new CronRunner();
  }
  return cronRunner;
}

// Auto-start in production
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_CRON_JOBS === 'true') {
  const runner = getCronRunner();
  runner.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGTERM', () => runner.stop());
  process.on('SIGINT', () => runner.stop());
}