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

  // Cache management
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(fullKey, ttlSeconds, data);
    } else {
      await this.client.set(fullKey, data);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const data = await this.client.get(fullKey);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.getKey(key);
    await this.client.del(fullKey);
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    return (await this.client.exists(fullKey)) === 1;
  }

  // Pattern deletion
  async deletePattern(pattern: string): Promise<void> {
    const fullPattern = this.getKey(pattern);
    const keys = await this.client.keys(fullPattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // List operations
  async pushToList(key: string, values: any[], ttlSeconds?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const stringValues = values.map(v => JSON.stringify(v));
    await this.client.rpush(fullKey, ...stringValues);
    if (ttlSeconds) {
      await this.client.expire(fullKey, ttlSeconds);
    }
  }

  async getList<T = any>(key: string, start: number = 0, stop: number = -1): Promise<T[]> {
    const fullKey = this.getKey(key);
    const data = await this.client.lrange(fullKey, start, stop);
    return data.map(item => JSON.parse(item));
  }

  // Set operations
  async addToSet(key: string, members: string[], ttlSeconds?: number): Promise<void> {
    const fullKey = this.getKey(key);
    await this.client.sadd(fullKey, ...members);
    if (ttlSeconds) {
      await this.client.expire(fullKey, ttlSeconds);
    }
  }

  async getSetMembers(key: string): Promise<string[]> {
    const fullKey = this.getKey(key);
    return await this.client.smembers(fullKey);
  }

  async isSetMember(key: string, member: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    return (await this.client.sismember(fullKey, member)) === 1;
  }

  // Hash operations
  async setHash(key: string, field: string, value: any, ttlSeconds?: number): Promise<void> {
    const fullKey = this.getKey(key);
    await this.client.hset(fullKey, field, JSON.stringify(value));
    if (ttlSeconds) {
      await this.client.expire(fullKey, ttlSeconds);
    }
  }

  async getHash<T = any>(key: string, field: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const data = await this.client.hget(fullKey, field);
    return data ? JSON.parse(data) : null;
  }

  async getAllHash<T = any>(key: string): Promise<Record<string, T>> {
    const fullKey = this.getKey(key);
    const data = await this.client.hgetall(fullKey);
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(data)) {
      result[field] = JSON.parse(value);
    }
    return result;
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    count: number;
    resetIn: number;
  }> {
    const fullKey = this.getKey(`ratelimit:${key}`);
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    // Remove old entries
    await this.client.zremrangebyscore(fullKey, '-inf', windowStart);

    // Count current entries
    const count = await this.client.zcard(fullKey);

    if (count < limit) {
      // Add new entry
      await this.client.zadd(fullKey, now, `${now}-${Math.random()}`);
      await this.client.expire(fullKey, windowSeconds);
      return { allowed: true, count: count + 1, resetIn: windowSeconds };
    }

    // Get oldest entry to calculate reset time
    const oldest = await this.client.zrange(fullKey, 0, 0, 'WITHSCORES');
    const resetIn = oldest.length > 1 
      ? Math.ceil((parseInt(oldest[1]) + windowSeconds * 1000 - now) / 1000)
      : windowSeconds;

    return { allowed: false, count, resetIn };
  }

  // Pub/Sub
  async publish(channel: string, message: any): Promise<void> {
    const fullChannel = this.getKey(channel);
    await this.client.publish(fullChannel, JSON.stringify(message));
  }

  subscribe(channel: string, callback: (message: any) => void): void {
    const fullChannel = this.getKey(channel);
    const subscriber = this.client.duplicate();
    subscriber.subscribe(fullChannel);
    subscriber.on('message', (ch, msg) => {
      if (ch === fullChannel) {
        callback(JSON.parse(msg));
      }
    });
  }

  // Cleanup
  async cleanup(daysOld: number = 30): Promise<number> {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let cleaned = 0;

    // Clean up old sessions
    const sessionKeys = await this.client.keys(this.getKey('session:*'));
    for (const key of sessionKeys) {
      const ttl = await this.client.ttl(key);
      if (ttl === -1) { // No expiry set
        await this.client.del(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Create a lazy-loaded singleton instance
let cacheDBInstance: CacheDatabase | null = null;

export function getCacheDB(): CacheDatabase {
  if (!cacheDBInstance) {
    cacheDBInstance = new CacheDatabase({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'vibelux:'
    });
  }
  return cacheDBInstance;
}

// For backward compatibility
export const cacheDB = {
  connect: () => getCacheDB().connect(),
  disconnect: () => getCacheDB().disconnect(),
  setUserSession: (...args: Parameters<CacheDatabase['setUserSession']>) => getCacheDB().setUserSession(...args),
  getUserSession: (...args: Parameters<CacheDatabase['getUserSession']>) => getCacheDB().getUserSession(...args),
  deleteUserSession: (...args: Parameters<CacheDatabase['deleteUserSession']>) => getCacheDB().deleteUserSession(...args),
  set: (...args: Parameters<CacheDatabase['set']>) => getCacheDB().set(...args),
  get: (...args: Parameters<CacheDatabase['get']>) => getCacheDB().get(...args),
  delete: (...args: Parameters<CacheDatabase['delete']>) => getCacheDB().delete(...args),
  exists: (...args: Parameters<CacheDatabase['exists']>) => getCacheDB().exists(...args),
  deletePattern: (...args: Parameters<CacheDatabase['deletePattern']>) => getCacheDB().deletePattern(...args),
  pushToList: (...args: Parameters<CacheDatabase['pushToList']>) => getCacheDB().pushToList(...args),
  getList: (...args: Parameters<CacheDatabase['getList']>) => getCacheDB().getList(...args),
  addToSet: (...args: Parameters<CacheDatabase['addToSet']>) => getCacheDB().addToSet(...args),
  getSetMembers: (...args: Parameters<CacheDatabase['getSetMembers']>) => getCacheDB().getSetMembers(...args),
  isSetMember: (...args: Parameters<CacheDatabase['isSetMember']>) => getCacheDB().isSetMember(...args),
  setHash: (...args: Parameters<CacheDatabase['setHash']>) => getCacheDB().setHash(...args),
  getHash: (...args: Parameters<CacheDatabase['getHash']>) => getCacheDB().getHash(...args),
  getAllHash: (...args: Parameters<CacheDatabase['getAllHash']>) => getCacheDB().getAllHash(...args),
  checkRateLimit: (...args: Parameters<CacheDatabase['checkRateLimit']>) => getCacheDB().checkRateLimit(...args),
  publish: (...args: Parameters<CacheDatabase['publish']>) => getCacheDB().publish(...args),
  subscribe: (...args: Parameters<CacheDatabase['subscribe']>) => getCacheDB().subscribe(...args),
  cleanup: (...args: Parameters<CacheDatabase['cleanup']>) => getCacheDB().cleanup(...args),
};

// Initialize connection
export async function initializeCacheDB(): Promise<void> {
  await getCacheDB().connect();
}