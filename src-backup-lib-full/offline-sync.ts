// Enhanced offline support and data synchronization for greenhouse operations
interface QueuedOperation {
  id: string;
  type: 'location' | 'message' | 'alert' | 'geofence' | 'photo_report' | 'ipm_scouting' | 'spray_application' | 'harvest_data';
  endpoint: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date;
  pendingOperations: number;
  failedOperations: number;
}

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private onlineStatus = navigator.onLine;
  private statusCallbacks: Set<(status: SyncStatus) => void> = new Set();
  private readonly STORAGE_KEY = 'vibelux_offline_queue';
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private syncTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadQueueFromStorage();
    this.setupEventListeners();
    this.startSyncTimer();
  }

  static getInstance(): OfflineSyncService {
    if (!this.instance) {
      this.instance = new OfflineSyncService();
    }
    return this.instance;
  }

  /**
   * Add operation to offline queue
   */
  queueOperation(
    type: QueuedOperation['type'],
    endpoint: string,
    data: any,
    maxRetries: number = 3
  ): string {
    const operation: QueuedOperation = {
      id: `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      type,
      endpoint,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries
    };

    // Limit queue size
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // Remove oldest operations first
      this.queue.splice(0, this.queue.length - this.MAX_QUEUE_SIZE + 1);
    }

    this.queue.push(operation);
    this.saveQueueToStorage();
    this.notifyStatusChange();

    // Try to process immediately if online
    if (this.onlineStatus) {
      this.processQueue();
    }

    return operation.id;
  }

  /**
   * Process queued operations when back online
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.onlineStatus || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const processedIds: string[] = [];
    const failedOperations: QueuedOperation[] = [];

    for (const operation of this.queue) {
      try {
        const success = await this.executeOperation(operation);
        
        if (success) {
          processedIds.push(operation.id);
        } else {
          operation.retryCount++;
          if (operation.retryCount >= operation.maxRetries) {
            console.error(`Max retries exceeded for operation ${operation.id}`);
            processedIds.push(operation.id); // Remove from queue
            failedOperations.push(operation);
          }
        }
      } catch (error) {
        console.error(`Failed to execute operation ${operation.id}:`, error);
        operation.retryCount++;
        if (operation.retryCount >= operation.maxRetries) {
          processedIds.push(operation.id); // Remove from queue
          failedOperations.push(operation);
        }
      }

      // Small delay between operations to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Remove processed operations from queue
    this.queue = this.queue.filter(op => !processedIds.includes(op.id));
    
    this.saveQueueToStorage();
    this.isProcessing = false;
    this.notifyStatusChange();

    // Log failed operations
    if (failedOperations.length > 0) {
      console.warn(`${failedOperations.length} operations failed permanently`);
    }

  }

  /**
   * Execute a single operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<boolean> {
    try {
      const response = await fetch(operation.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation.data)
      });

      if (response.ok) {
        return true;
      } else if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        console.error(`Client error for operation ${operation.id}: ${response.status}`);
        return true; // Remove from queue
      } else {
        // Server error - retry
        return false;
      }
    } catch (error) {
      // Network error - retry
      return false;
    }
  }

  /**
   * Setup event listeners for online/offline status
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.processQueue();
      this.notifyStatusChange();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      this.notifyStatusChange();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.onlineStatus) {
        this.processQueue();
      }
    });
  }

  /**
   * Start sync timer for periodic processing
   */
  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.onlineStatus && this.queue.length > 0) {
        this.processQueue();
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Save queue to localStorage
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save queue to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored).map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    const failedOperations = this.queue.filter(op => op.retryCount >= op.maxRetries).length;
    
    return {
      isOnline: this.onlineStatus,
      lastSyncTime: new Date(), // TODO: Track actual last sync time
      pendingOperations: this.queue.length,
      failedOperations
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of status changes
   */
  private notifyStatusChange(): void {
    const status = this.getStatus();
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Status callback error:', error);
      }
    });
  }

  /**
   * Clear all queued operations
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueueToStorage();
    this.notifyStatusChange();
  }

  /**
   * Force sync (manual trigger)
   */
  async forceSync(): Promise<void> {
    if (this.onlineStatus) {
      await this.processQueue();
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.statusCallbacks.clear();
  }
}

// Enhanced error handling for tracking operations
export class TrackingErrorHandler {
  private static retryDelays = [1000, 2000, 5000, 10000]; // Progressive delays

  /**
   * Execute operation with retry and offline queueing
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationType: QueuedOperation['type'],
    endpoint: string,
    data: any,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // If we're offline, queue the operation
        if (!navigator.onLine) {
          OfflineSyncService.getInstance().queueOperation(
            operationType,
            endpoint,
            data,
            maxRetries
          );
          throw new Error('Operation queued for offline sync');
        }

        // Wait before retry (progressive backoff)
        if (attempt < maxRetries - 1) {
          const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed, queue for offline sync
    OfflineSyncService.getInstance().queueOperation(
      operationType,
      endpoint,
      data,
      maxRetries
    );

    throw lastError!;
  }

  /**
   * Handle location update with error recovery
   */
  static async sendLocationUpdate(
    facilityId: string,
    locationData: any
  ): Promise<void> {
    const endpoint = '/api/tracking/location';
    const data = { facilityId, ...locationData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'location',
      endpoint,
      data
    );
  }

  /**
   * Handle message sending with error recovery
   */
  static async sendMessage(
    facilityId: string,
    messageData: any
  ): Promise<void> {
    const endpoint = '/api/tracking/messages';
    const data = { facilityId, ...messageData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'message',
      endpoint,
      data
    );
  }

  /**
   * Handle alert sending with error recovery
   */
  static async sendAlert(
    facilityId: string,
    alertData: any
  ): Promise<void> {
    const endpoint = '/api/tracking/alerts';
    const data = { facilityId, ...alertData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'alert',
      endpoint,
      data
    );
  }

  /**
   * Handle photo report submission with error recovery
   */
  static async sendPhotoReport(
    facilityId: string,
    reportData: any
  ): Promise<void> {
    const endpoint = '/api/visual-ops/reports';
    const data = { facilityId, ...reportData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'photo_report',
      endpoint,
      data
    );
  }

  /**
   * Handle IPM scouting data with error recovery
   */
  static async sendIPMScoutingData(
    facilityId: string,
    scoutingData: any
  ): Promise<void> {
    const endpoint = '/api/ipm/scouting';
    const data = { facilityId, ...scoutingData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'ipm_scouting',
      endpoint,
      data
    );
  }

  /**
   * Handle spray application data with error recovery
   */
  static async sendSprayApplicationData(
    facilityId: string,
    sprayData: any
  ): Promise<void> {
    const endpoint = '/api/spray/applications';
    const data = { facilityId, ...sprayData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'spray_application',
      endpoint,
      data
    );
  }

  /**
   * Handle harvest data with error recovery
   */
  static async sendHarvestData(
    facilityId: string,
    harvestData: any
  ): Promise<void> {
    const endpoint = '/api/harvest/data';
    const data = { facilityId, ...harvestData };

    return this.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      'harvest_data',
      endpoint,
      data
    );
  }
}

// Connection quality monitoring
export class ConnectionQualityMonitor {
  private static instance: ConnectionQualityMonitor;
  private connectionQuality: 'excellent' | 'good' | 'poor' | 'offline' = 'excellent';
  private callbacks: Set<(quality: string) => void> = new Set();

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): ConnectionQualityMonitor {
    if (!this.instance) {
      this.instance = new ConnectionQualityMonitor();
    }
    return this.instance;
  }

  private startMonitoring(): void {
    // Monitor connection via navigator.connection API (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateQuality = () => {
        if (!navigator.onLine) {
          this.setQuality('offline');
          return;
        }

        const effectiveType = connection.effectiveType;
        switch (effectiveType) {
          case '4g':
            this.setQuality('excellent');
            break;
          case '3g':
            this.setQuality('good');
            break;
          case '2g':
          case 'slow-2g':
            this.setQuality('poor');
            break;
          default:
            this.setQuality('good');
        }
      };

      connection.addEventListener('change', updateQuality);
      updateQuality();
    }

    // Fallback: Monitor via periodic ping
    setInterval(async () => {
      try {
        const start = Date.now();
        await fetch('/api/ping', { method: 'HEAD' });
        const latency = Date.now() - start;

        if (latency < 100) {
          this.setQuality('excellent');
        } else if (latency < 300) {
          this.setQuality('good');
        } else {
          this.setQuality('poor');
        }
      } catch {
        this.setQuality('offline');
      }
    }, 30000); // Check every 30 seconds
  }

  private setQuality(quality: ConnectionQualityMonitor['connectionQuality']): void {
    if (this.connectionQuality !== quality) {
      this.connectionQuality = quality;
      this.callbacks.forEach(callback => callback(quality));
    }
  }

  getQuality(): string {
    return this.connectionQuality;
  }

  onQualityChange(callback: (quality: string) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}