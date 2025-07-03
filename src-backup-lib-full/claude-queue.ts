import { CLAUDE_CONFIG } from './claude-config';

interface QueuedRequest {
  id: string;
  timestamp: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
}

class ClaudeRequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // Claude has better rate limits (1000 req/min = ~16/sec)
  
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
        const result = await this.executeWithRetry(request);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.processing = false;
  }
  
  private async executeWithRetry(request: QueuedRequest): Promise<any> {
    try {
      return await request.execute();
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.status === 429 && request.retries < CLAUDE_CONFIG.rateLimits.maxRetries) {
        request.retries++;
        
        // Calculate exponential backoff with jitter
        const baseDelay = CLAUDE_CONFIG.rateLimits.retryDelay;
        const backoffFactor = Math.pow(CLAUDE_CONFIG.rateLimits.backoffFactor, request.retries - 1);
        let delay = baseDelay * backoffFactor;
        
        if (CLAUDE_CONFIG.rateLimits.jitter) {
          // Add 0-25% random jitter
          delay = delay * (1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.25);
        }
        
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(request);
      }
      
      throw error;
    }
  }
  
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastRequestTime: this.lastRequestTime
    };
  }
}

// Export singleton instance
export const claudeQueue = new ClaudeRequestQueue();