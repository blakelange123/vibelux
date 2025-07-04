import { OPENAI_CONFIG } from './openai-config';

interface QueuedRequest {
  id: string;
  timestamp: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
}

class OpenAIRequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // Minimum 1 second between requests
  
  async add<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `req_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        execute,
        resolve,
        reject,
        retries: 0
      };
      
      this.queue.push(request);
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      
      // Ensure minimum interval between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }
      
      try {
        this.lastRequestTime = Date.now();
        const result = await request.execute();
        request.resolve(result);
      } catch (error: any) {
        // Handle rate limit errors with retry
        if (error?.status === 429 && request.retries < OPENAI_CONFIG.rateLimits.maxRetries) {
          request.retries++;
          
          // Calculate backoff delay
          const baseDelay = OPENAI_CONFIG.rateLimits.retryDelay;
          const backoff = Math.pow(OPENAI_CONFIG.rateLimits.backoffFactor, request.retries);
          let delay = baseDelay * backoff;
          
          // Add jitter
          if (OPENAI_CONFIG.rateLimits.jitter) {
            const jitterRange = delay * 0.3;
            const jitter = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * jitterRange - (jitterRange / 2);
            delay = Math.round(delay + jitter);
          }
          
          
          // Re-queue the request with delay
          setTimeout(() => {
            this.queue.unshift(request);
            this.processQueue();
          }, delay);
        } else {
          // Max retries reached or other error
          request.reject(error);
        }
      }
    }
    
    this.processing = false;
  }
  
  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastRequestTime: this.lastRequestTime
    };
  }
  
  // Clear the queue (for emergencies)
  clear() {
    const cleared = this.queue.length;
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    return cleared;
  }
}

// Global instance
export const openAIQueue = new OpenAIRequestQueue();

// Helper function to use the queue
export async function queueOpenAIRequest<T>(
  execute: () => Promise<T>
): Promise<T> {
  return openAIQueue.add(execute);
}