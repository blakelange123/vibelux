// Redis caching and session management
import Redis from 'ioredis';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

export class CacheDatabase {
  private client: Redis;
  private keyPrefix: string;

  constructor(config: RedisConfig) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
    this.keyPrefix = config.keyPrefix || 'vibelux:';
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  // User session management
  async setUserSession(userId: string, sessionData: {
    facilityId: string;
    role: string;
    permissions: string[];
    language: string;
    lastActive: Date;
  }, ttlSeconds: number = 86400): Promise<void> {
    const key = this.getKey(`session:${userId}`);
    await this.client.setex(key, ttlSeconds, JSON.stringify(sessionData));
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = this.getKey(`session:${userId}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserSession(userId: string): Promise<void> {
    const key = this.getKey(`session:${userId}`);
    await this.client.del(key);
  }

  async refreshUserSession(userId: string, ttlSeconds: number = 86400): Promise<void> {
    const key = this.getKey(`session:${userId}`);
    await this.client.expire(key, ttlSeconds);
  }

  // Real-time location tracking
  async setUserLocation(userId: string, location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
    facilityId: string;
    zoneId?: string;
  }): Promise<void> {
    const key = this.getKey(`location:${userId}`);
    await this.client.setex(key, 300, JSON.stringify(location)); // 5 minute expiry
  }

  async getUserLocation(userId: string): Promise<any | null> {
    const key = this.getKey(`location:${userId}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getFacilityUserLocations(facilityId: string): Promise<Array<{ userId: string; location: any }>> {
    const pattern = this.getKey('location:*');
    const keys = await this.client.keys(pattern);
    const locations = [];

    for (const key of keys) {
      const userId = key.replace(this.getKey('location:'), '');
      const locationData = await this.client.get(key);
      if (locationData) {
        const location = JSON.parse(locationData);
        if (location.facilityId === facilityId) {
          locations.push({ userId, location });
        }
      }
    }

    return locations;
  }

  // Environmental data caching
  async setEnvironmentalData(zoneId: string, data: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    lightLevel: number;
    timestamp: Date;
  }): Promise<void> {
    const key = this.getKey(`env:${zoneId}`);
    await this.client.setex(key, 600, JSON.stringify(data)); // 10 minute expiry
  }

  async getEnvironmentalData(zoneId: string): Promise<any | null> {
    const key = this.getKey(`env:${zoneId}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Report caching
  async cachePhotoReport(reportId: string, reportData: any, ttlSeconds: number = 3600): Promise<void> {
    const key = this.getKey(`report:${reportId}`);
    await this.client.setex(key, ttlSeconds, JSON.stringify(reportData));
  }

  async getCachedPhotoReport(reportId: string): Promise<any | null> {
    const key = this.getKey(`report:${reportId}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // AI analysis result caching
  async cacheAIAnalysis(photoHash: string, analysis: any, ttlSeconds: number = 86400): Promise<void> {
    const key = this.getKey(`ai:${photoHash}`);
    await this.client.setex(key, ttlSeconds, JSON.stringify(analysis));
  }

  async getCachedAIAnalysis(photoHash: string): Promise<any | null> {
    const key = this.getKey(`ai:${photoHash}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Notification queuing
  async queueNotification(notification: {
    userId: string;
    type: 'email' | 'push' | 'sms';
    title: string;
    message: string;
    data?: any;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<void> {
    const queue = this.getKey('notifications:queue');
    await this.client.lpush(queue, JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString()
    }));
  }

  async dequeueNotification(): Promise<any | null> {
    const queue = this.getKey('notifications:queue');
    const data = await this.client.rpop(queue);
    return data ? JSON.parse(data) : null;
  }

  async getNotificationQueueLength(): Promise<number> {
    const queue = this.getKey('notifications:queue');
    return await this.client.llen(queue);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const redisKey = this.getKey(`rate:${key}`);
    const current = await this.client.incr(redisKey);
    
    if (current === 1) {
      await this.client.expire(redisKey, windowSeconds);
    }
    
    const ttl = await this.client.ttl(redisKey);
    const resetTime = new Date(Date.now() + (ttl * 1000));
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime
    };
  }

  // Task locking (for background jobs)
  async acquireLock(lockKey: string, ttlSeconds: number = 300): Promise<boolean> {
    const key = this.getKey(`lock:${lockKey}`);
    const result = await this.client.set(key, Date.now().toString(), 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    const key = this.getKey(`lock:${lockKey}`);
    await this.client.del(key);
  }

  async isLocked(lockKey: string): Promise<boolean> {
    const key = this.getKey(`lock:${lockKey}`);
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Metrics aggregation
  async incrementMetric(metric: string, value: number = 1): Promise<void> {
    const key = this.getKey(`metric:${metric}`);
    await this.client.incrby(key, value);
  }

  async getMetric(metric: string): Promise<number> {
    const key = this.getKey(`metric:${metric}`);
    const value = await this.client.get(key);
    return value ? parseInt(value) : 0;
  }

  async setMetricExpiry(metric: string, ttlSeconds: number): Promise<void> {
    const key = this.getKey(`metric:${metric}`);
    await this.client.expire(key, ttlSeconds);
  }

  // Real-time messaging
  async publishMessage(channel: string, message: any): Promise<void> {
    await this.client.publish(this.getKey(channel), JSON.stringify(message));
  }

  async subscribeToChannel(channel: string, callback: (message: any) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.subscribe(this.getKey(channel));
    
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === this.getKey(channel)) {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          console.error('Error parsing Redis message:', error);
        }
      }
    });
  }

  // Geospatial operations for facility mapping
  async addUserToFacilityMap(facilityId: string, userId: string, longitude: number, latitude: number): Promise<void> {
    const key = this.getKey(`geo:${facilityId}`);
    await this.client.geoadd(key, longitude, latitude, userId);
    await this.client.expire(key, 3600); // 1 hour expiry
  }

  async getUsersNearLocation(facilityId: string, longitude: number, latitude: number, radiusMeters: number): Promise<Array<{
    userId: string;
    distance: number;
    coordinates: [number, number];
  }>> {
    const key = this.getKey(`geo:${facilityId}`);
    const results = await this.client.georadius(
      key, longitude, latitude, radiusMeters, 'm', 'WITHDIST', 'WITHCOORD'
    );

    return results.map((result: any) => ({
      userId: result[0],
      distance: parseFloat(result[1]),
      coordinates: [parseFloat(result[2][0]), parseFloat(result[2][1])]
    }));
  }

  // System health monitoring
  async setSystemHealth(component: string, status: 'healthy' | 'degraded' | 'error', details?: any): Promise<void> {
    const key = this.getKey(`health:${component}`);
    await this.client.setex(key, 300, JSON.stringify({
      status,
      details,
      timestamp: new Date().toISOString()
    }));
  }

  async getSystemHealth(): Promise<Record<string, any>> {
    const pattern = this.getKey('health:*');
    const keys = await this.client.keys(pattern);
    const health: Record<string, any> = {};

    for (const key of keys) {
      const component = key.replace(this.getKey('health:'), '');
      const data = await this.client.get(key);
      if (data) {
        health[component] = JSON.parse(data);
      }
    }

    return health;
  }

  // Cleanup utilities
  async cleanupExpiredKeys(): Promise<number> {
    const pattern = this.getKey('*');
    const keys = await this.client.keys(pattern);
    let cleaned = 0;

    for (const key of keys) {
      const ttl = await this.client.ttl(key);
      if (ttl === -1) { // No expiry set
        // Set default expiry for certain key types
        if (key.includes(':location:') || key.includes(':env:')) {
          await this.client.expire(key, 3600);
          cleaned++;
        }
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const cacheDB = new CacheDatabase({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'vibelux:'
});

// Initialize connection
export async function initializeCacheDB(): Promise<void> {
  await cacheDB.connect();
}