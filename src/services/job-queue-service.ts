/**
 * Production Job Queue Service using Redis
 * Handles background job processing with failure recovery and monitoring
 */

import { prisma } from '@/lib/prisma';
import Redis from 'ioredis';

interface JobOptions {
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  delay?: number;
  priority?: number;
}

interface Job {
  id: string;
  name: string;
  data: any;
  opts: JobOptions;
  attemptsMade: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  stacktrace?: string[];
  timestamp: number;
  returnvalue?: any;
  progress?: number;
}

interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class JobQueueService {
  private redis: Redis;
  private pubClient: Redis;
  private subClient: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private isShuttingDown = false;

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };

    this.redis = new Redis(redisConfig);
    this.pubClient = new Redis(redisConfig);
    this.subClient = new Redis(redisConfig);

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for Redis connections
   */
  private setupEventHandlers(): void {
    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
    });

    this.redis.on('close', () => {
    });
  }

  /**
   * Create or get a queue
   */
  async getQueue(name: string): Promise<Queue> {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, this.redis, this.pubClient, this.subClient);
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  /**
   * Add a job to a queue
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: any,
    opts: JobOptions = {}
  ): Promise<Job> {
    const queue = await this.getQueue(queueName);
    return queue.add(jobName, data, opts);
  }

  /**
   * Process jobs from a queue
   */
  async processQueue(
    queueName: string,
    processor: (job: Job) => Promise<any>,
    concurrency = 1
  ): Promise<Worker> {
    if (this.workers.has(queueName)) {
      throw new Error(`Worker already exists for queue: ${queueName}`);
    }

    const worker = new Worker(
      queueName,
      processor,
      {
        redis: this.redis,
        concurrency
      }
    );

    this.workers.set(queueName, worker);

    // Setup worker event handlers
    worker.on('completed', (job: Job, result: any) => {
      this.recordJobCompletion(job, result);
    });

    worker.on('failed', (job: Job, err: Error) => {
      console.error(`❌ Job ${job.id} failed in queue ${queueName}:`, err);
      this.recordJobFailure(job, err);
    });

    worker.on('stalled', (job: Job) => {
      console.warn(`⚠️ Job ${job.id} stalled in queue ${queueName}`);
    });

    return worker;
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(queueName: string): Promise<any> {
    const queue = await this.getQueue(queueName);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  /**
   * Get job details
   */
  async getJob(queueName: string, jobId: string): Promise<Job | null> {
    const queue = await this.getQueue(queueName);
    return queue.getJob(jobId);
  }

  /**
   * Retry a failed job
   */
  async retryJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job && job.failedReason) {
      await job.retry();
    }
  }

  /**
   * Clean completed/failed jobs
   */
  async cleanQueue(
    queueName: string,
    grace: number = 3600000, // 1 hour
    limit: number = 1000
  ): Promise<number[]> {
    const queue = await this.getQueue(queueName);
    
    const [completed, failed] = await Promise.all([
      queue.clean(grace, 'completed', limit),
      queue.clean(grace, 'failed', limit)
    ]);

    return [...completed, ...failed];
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;


    // Close all workers
    const workerPromises = Array.from(this.workers.values()).map(worker => 
      worker.close()
    );
    await Promise.all(workerPromises);

    // Close all queues
    const queuePromises = Array.from(this.queues.values()).map(queue => 
      queue.close()
    );
    await Promise.all(queuePromises);

    // Close Redis connections
    await Promise.all([
      this.redis.quit(),
      this.pubClient.quit(),
      this.subClient.quit()
    ]);

  }

  /**
   * Record job completion in database
   */
  private async recordJobCompletion(job: Job, result: any): Promise<void> {
    try {
      await prisma.jobExecution.create({
        data: {
          jobId: job.id,
          jobName: job.name,
          status: 'COMPLETED',
          startedAt: new Date(job.processedOn || Date.now()),
          completedAt: new Date(job.finishedOn || Date.now()),
          result: JSON.stringify(result),
          attempts: job.attemptsMade
        }
      });
    } catch (error) {
      console.error('Failed to record job completion:', error);
    }
  }

  /**
   * Record job failure in database
   */
  private async recordJobFailure(job: Job, error: Error): Promise<void> {
    try {
      await prisma.jobExecution.create({
        data: {
          jobId: job.id,
          jobName: job.name,
          status: 'FAILED',
          startedAt: new Date(job.processedOn || Date.now()),
          failedAt: new Date(),
          error: error.message,
          stackTrace: error.stack,
          attempts: job.attemptsMade
        }
      });

      // Send alert if critical job fails
      if (job.opts.priority && job.opts.priority > 5) {
        await this.sendJobFailureAlert(job, error);
      }
    } catch (err) {
      console.error('Failed to record job failure:', err);
    }
  }

  /**
   * Send alert for critical job failures
   */
  private async sendJobFailureAlert(job: Job, error: Error): Promise<void> {
    // In production, this would send to PagerDuty, Slack, etc.
    console.error(`🚨 CRITICAL JOB FAILURE: ${job.name} (${job.id})`, {
      error: error.message,
      attempts: job.attemptsMade,
      data: job.data
    });
  }
}

/**
 * Simple Queue implementation using Redis
 */
class Queue {
  constructor(
    private name: string,
    private redis: Redis,
    private pubClient: Redis,
    private subClient: Redis
  ) {}

  async add(jobName: string, data: any, opts: JobOptions = {}): Promise<Job> {
    const job: Job = {
      id: `${this.name}:${Date.now()}:${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      name: jobName,
      data,
      opts: {
        attempts: opts.attempts || 3,
        backoff: opts.backoff || { type: 'exponential', delay: 1000 },
        removeOnComplete: opts.removeOnComplete !== false,
        removeOnFail: opts.removeOnFail || false,
        delay: opts.delay || 0,
        priority: opts.priority || 0
      },
      attemptsMade: 0,
      timestamp: Date.now()
    };

    // Store job in Redis
    await this.redis.hset(
      `queue:${this.name}:jobs`,
      job.id,
      JSON.stringify(job)
    );

    // Add to waiting list
    if (job.opts.delay && job.opts.delay > 0) {
      await this.redis.zadd(
        `queue:${this.name}:delayed`,
        Date.now() + job.opts.delay,
        job.id
      );
    } else {
      await this.redis.lpush(`queue:${this.name}:waiting`, job.id);
    }

    // Publish job added event
    await this.pubClient.publish(`queue:${this.name}:added`, job.id);

    return job;
  }

  async getJob(jobId: string): Promise<Job | null> {
    const jobData = await this.redis.hget(`queue:${this.name}:jobs`, jobId);
    return jobData ? JSON.parse(jobData) : null;
  }

  async getWaitingCount(): Promise<number> {
    return this.redis.llen(`queue:${this.name}:waiting`);
  }

  async getActiveCount(): Promise<number> {
    return this.redis.llen(`queue:${this.name}:active`);
  }

  async getCompletedCount(): Promise<number> {
    return this.redis.zcard(`queue:${this.name}:completed`);
  }

  async getFailedCount(): Promise<number> {
    return this.redis.zcard(`queue:${this.name}:failed`);
  }

  async getDelayedCount(): Promise<number> {
    return this.redis.zcard(`queue:${this.name}:delayed`);
  }

  async clean(grace: number, type: 'completed' | 'failed', limit: number): Promise<string[]> {
    const cutoff = Date.now() - grace;
    const key = `queue:${this.name}:${type}`;
    
    const jobIds = await this.redis.zrangebyscore(key, '-inf', cutoff, 'LIMIT', 0, limit);
    
    if (jobIds.length > 0) {
      await this.redis.zrem(key, ...jobIds);
      await this.redis.hdel(`queue:${this.name}:jobs`, ...jobIds);
    }
    
    return jobIds;
  }

  async close(): Promise<void> {
    // Cleanup logic if needed
  }
}

/**
 * Simple Worker implementation
 */
class Worker extends EventEmitter {
  private running = false;
  private processing = 0;

  constructor(
    private queueName: string,
    private processor: (job: Job) => Promise<any>,
    private options: {
      redis: Redis;
      concurrency: number;
    }
  ) {
    super();
    this.start();
  }

  private async start(): Promise<void> {
    this.running = true;
    
    while (this.running) {
      if (this.processing >= this.options.concurrency) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      const jobId = await this.options.redis.brpoplpush(
        `queue:${this.queueName}:waiting`,
        `queue:${this.queueName}:active`,
        1
      );

      if (jobId) {
        this.processing++;
        this.processJob(jobId).finally(() => {
          this.processing--;
        });
      }
    }
  }

  private async processJob(jobId: string): Promise<void> {
    try {
      const jobData = await this.options.redis.hget(
        `queue:${this.queueName}:jobs`,
        jobId
      );
      
      if (!jobData) {
        console.error(`Job ${jobId} not found`);
        return;
      }

      const job: Job = JSON.parse(jobData);
      job.processedOn = Date.now();
      job.attemptsMade++;

      try {
        const result = await this.processor(job);
        job.finishedOn = Date.now();
        job.returnvalue = result;

        // Move to completed
        await this.options.redis.lrem(`queue:${this.queueName}:active`, 1, jobId);
        await this.options.redis.zadd(
          `queue:${this.queueName}:completed`,
          Date.now(),
          jobId
        );

        // Update job data
        await this.options.redis.hset(
          `queue:${this.queueName}:jobs`,
          jobId,
          JSON.stringify(job)
        );

        this.emit('completed', job, result);

        // Remove if configured
        if (job.opts.removeOnComplete) {
          await this.options.redis.hdel(`queue:${this.queueName}:jobs`, jobId);
        }
      } catch (error) {
        job.failedReason = error instanceof Error ? error.message : 'Unknown error';
        job.stacktrace = error instanceof Error ? error.stack?.split('\n') : [];

        // Check if should retry
        if (job.attemptsMade < (job.opts.attempts || 3)) {
          const delay = this.calculateBackoff(job);
          
          // Move back to delayed queue
          await this.options.redis.lrem(`queue:${this.queueName}:active`, 1, jobId);
          await this.options.redis.zadd(
            `queue:${this.queueName}:delayed`,
            Date.now() + delay,
            jobId
          );

          // Update job data
          await this.options.redis.hset(
            `queue:${this.queueName}:jobs`,
            jobId,
            JSON.stringify(job)
          );
        } else {
          // Move to failed
          await this.options.redis.lrem(`queue:${this.queueName}:active`, 1, jobId);
          await this.options.redis.zadd(
            `queue:${this.queueName}:failed`,
            Date.now(),
            jobId
          );

          // Update job data
          await this.options.redis.hset(
            `queue:${this.queueName}:jobs`,
            jobId,
            JSON.stringify(job)
          );

          this.emit('failed', job, error as Error);

          // Remove if configured
          if (job.opts.removeOnFail) {
            await this.options.redis.hdel(`queue:${this.queueName}:jobs`, jobId);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error);
    }
  }

  private calculateBackoff(job: Job): number {
    const backoff = job.opts.backoff || { type: 'exponential', delay: 1000 };
    
    if (backoff.type === 'exponential') {
      return backoff.delay * Math.pow(2, job.attemptsMade - 1);
    } else {
      return backoff.delay;
    }
  }

  async close(): Promise<void> {
    this.running = false;
    
    // Wait for current jobs to complete
    while (this.processing > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// EventEmitter implementation
class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// Export singleton instance
export const jobQueue = new JobQueueService();

// Job processors for common tasks
export const jobProcessors = {
  // Process scheduled payments
  processScheduledPayment: async (job: Job) => {
    const { paymentScheduleId } = job.data;
    
    // Import dynamically to avoid circular dependencies
    const { PaymentRetryService } = await import('./payment-retry-service');
    const retryService = new PaymentRetryService();
    
    return await retryService.executeScheduledRetry(paymentScheduleId);
  },

  // Generate and send invoices
  generateInvoice: async (job: Job) => {
    const { agreementId, period } = job.data;
    
    // Implementation would generate invoice based on usage
    return { invoiceId: `INV-${Date.now()}` };
  },

  // Collect baseline metrics
  collectBaselineMetrics: async (job: Job) => {
    const { facilityId } = job.data;
    
    const { BaselineMetricCollector } = await import('./baseline-metric-collector');
    const collector = new BaselineMetricCollector();
    
    return await collector.collectLiveMetrics(facilityId);
  },

  // Parse utility bills
  parseUtilityBill: async (job: Job) => {
    const { billUrl, facilityId, provider } = job.data;
    
    const { UtilityBillParser } = await import('./utility-bill-parser');
    const parser = new UtilityBillParser();
    
    // Fetch bill from URL
    const response = await fetch(billUrl);
    const buffer = await response.arrayBuffer();
    
    return await parser.parseBill(Buffer.from(buffer), 'pdf', provider);
  },

  // Clean old job data
  cleanJobHistory: async (job: Job) => {
    const { grace = 7 * 24 * 60 * 60 * 1000 } = job.data; // 7 days default
    
    const cutoff = new Date(Date.now() - grace);
    
    const deleted = await prisma.jobExecution.deleteMany({
      where: {
        OR: [
          { completedAt: { lt: cutoff } },
          { failedAt: { lt: cutoff } }
        ]
      }
    });
    
    return { deletedCount: deleted.count };
  }
};