// Offline Data Sync & Conflict Resolution

import { 
  OfflineData, 
  PendingSync, 
  SyncConflict, 
  SyncStatus,
  OfflineTask,
  OfflinePlant,
  OfflineInventory,
  OfflineReading,
  OfflinePhoto,
  OfflineSignature
} from './mobile-types';

export class OfflineSyncManager {
  private db: LocalDatabase;
  private queue: SyncQueue;
  private conflictResolver: ConflictResolver;
  private networkMonitor: NetworkMonitor;

  constructor() {
    this.db = new LocalDatabase();
    this.queue = new SyncQueue();
    this.conflictResolver = new ConflictResolver();
    this.networkMonitor = new NetworkMonitor();
  }

  async initializeOfflineStorage(): Promise<void> {
    await this.db.initialize();
    await this.loadCriticalData();
    this.startBackgroundSync();
  }

  async saveOffline(type: string, data: any): Promise<void> {
    const id = this.generateOfflineId();
    const timestamp = new Date();

    await this.db.save(type, {
      ...data,
      id,
      createdOffline: true,
      syncStatus: 'pending',
      lastModified: timestamp
    });

    await this.queue.add({
      id,
      type,
      action: 'create',
      data,
      timestamp,
      attempts: 0
    });
  }

  async updateOffline(type: string, id: string, data: any): Promise<void> {
    const existing = await this.db.get(type, id);
    const timestamp = new Date();

    await this.db.update(type, id, {
      ...existing,
      ...data,
      syncStatus: 'pending',
      lastModified: timestamp
    });

    await this.queue.add({
      id: this.generateSyncId(),
      type,
      action: 'update',
      data: { id, ...data },
      timestamp,
      attempts: 0
    });
  }

  async syncData(): Promise<SyncResult> {
    if (!this.networkMonitor.isOnline()) {
      return { success: false, error: 'No network connection' };
    }

    const pendingItems = await this.queue.getPending();
    const results: SyncItemResult[] = [];

    for (const item of pendingItems) {
      try {
        const result = await this.syncItem(item);
        results.push(result);

        if (result.success) {
          await this.queue.remove(item.id);
          await this.updateSyncStatus(item.type, item.data.id, 'synced');
        } else if (result.conflict) {
          await this.handleConflict(item, result.serverData);
        }
      } catch (error) {
        await this.handleSyncError(item, error);
      }
    }

    return {
      success: true,
      synced: results.filter(r => r.success).length,
      conflicts: results.filter(r => r.conflict).length,
      failed: results.filter(r => !r.success && !r.conflict).length
    };
  }

  private async syncItem(item: PendingSync): Promise<SyncItemResult> {
    const api = new SyncAPI();
    
    switch (item.action) {
      case 'create':
        return await api.create(item.type, item.data);
      case 'update':
        return await api.update(item.type, item.data.id, item.data);
      case 'delete':
        return await api.delete(item.type, item.data.id);
    }
  }

  private async handleConflict(item: PendingSync, serverData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: this.generateConflictId(),
      type: item.type,
      localData: item.data,
      serverData: serverData
    };

    const resolution = await this.conflictResolver.resolve(conflict);
    
    switch (resolution) {
      case 'local':
        await this.forceSync(item);
        break;
      case 'server':
        await this.acceptServerData(item.type, serverData);
        break;
      case 'merge':
        const mergedData = await this.mergeData(item.data, serverData);
        await this.syncMergedData(item.type, mergedData);
        break;
    }
  }

  private async loadCriticalData(): Promise<void> {
    // Load essential data for offline operation
    const criticalTypes = ['strains', 'rooms', 'users', 'recipes'];
    
    for (const type of criticalTypes) {
      try {
        const data = await this.fetchAndCache(type);
        await this.db.bulkSave(type, data);
      } catch (error) {
        // Failed to cache critical data - application should handle gracefully
      }
    }
  }

  private startBackgroundSync(): void {
    // Sync when network becomes available
    this.networkMonitor.on('online', () => {
      this.syncData();
    });

    // Periodic sync
    setInterval(() => {
      if (this.networkMonitor.isOnline()) {
        this.syncData();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private generateOfflineId(): string {
    return `offline_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }
}

// Local Database Implementation
class LocalDatabase {
  private db: any; // IndexedDB or SQLite instance

  async initialize(): Promise<void> {
    // Initialize IndexedDB for browser environments
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.db = await this.openIndexedDB();
    } else {
      // Fallback to memory storage for server-side rendering
      this.db = new Map();
    }
  }
  
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VibeluxOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        const stores = ['tasks', 'plants', 'inventory', 'readings', 'photos', 'queue'];
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('syncStatus', 'syncStatus', { unique: false });
            store.createIndex('lastModified', 'lastModified', { unique: false });
          }
        });
      };
    });
  }

  async save(type: string, data: any): Promise<void> {
    if (this.db instanceof Map) {
      // Memory storage fallback
      if (!this.db.has(type)) this.db.set(type, new Map());
      this.db.get(type).set(data.id, data);
    } else {
      // IndexedDB storage
      const transaction = this.db.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      await store.put(data);
    }
  }

  async get(type: string, id: string): Promise<any> {
    if (this.db instanceof Map) {
      return this.db.get(type)?.get(id);
    } else {
      const transaction = this.db.transaction([type], 'readonly');
      const store = transaction.objectStore(type);
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async update(type: string, id: string, data: any): Promise<void> {
    if (this.db instanceof Map) {
      if (!this.db.has(type)) this.db.set(type, new Map());
      const existing = this.db.get(type).get(id) || {};
      this.db.get(type).set(id, { ...existing, ...data });
    } else {
      const transaction = this.db.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      const existing = await new Promise<any>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || {});
        request.onerror = () => reject(request.error);
      });
      await store.put({ ...existing, ...data, id });
    }
  }

  async bulkSave(type: string, data: any[]): Promise<void> {
    if (this.db instanceof Map) {
      if (!this.db.has(type)) this.db.set(type, new Map());
      const typeMap = this.db.get(type);
      data.forEach(item => typeMap.set(item.id, item));
    } else {
      const transaction = this.db.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      for (const item of data) {
        await store.put(item);
      }
    }
  }

  async query(type: string, filter?: any): Promise<any[]> {
    // Query local data
  }
}

// Sync Queue Management
class SyncQueue {
  private queue: PendingSync[] = [];

  async add(item: PendingSync): Promise<void> {
    this.queue.push(item);
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    this.queue = this.queue.filter(item => item.id !== id);
    await this.persist();
  }

  async getPending(): Promise<PendingSync[]> {
    return this.queue.filter(item => item.attempts < 3);
  }

  async incrementAttempts(id: string): Promise<void> {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.attempts++;
      item.lastAttempt = new Date();
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('vibelux_sync_queue', JSON.stringify(this.queue));
      }
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }
  
  async load(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('vibelux_sync_queue');
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.queue = [];
    }
  }
}

// Conflict Resolution
class ConflictResolver {
  async resolve(conflict: SyncConflict): Promise<'local' | 'server' | 'merge'> {
    // Default strategy: last write wins
    const localTime = conflict.localData.lastModified;
    const serverTime = conflict.serverData.lastModified;

    if (localTime > serverTime) {
      return 'local';
    } else if (serverTime > localTime) {
      return 'server';
    } else {
      // Same timestamp, needs manual resolution or merge
      return 'merge';
    }
  }

  async mergeStrategies(type: string): Promise<MergeStrategy> {
    const strategies: Record<string, MergeStrategy> = {
      'tasks': {
        fields: ['status', 'notes', 'completedBy'],
        arrays: ['photos', 'signatures'],
        preference: 'mostComplete'
      },
      'plants': {
        fields: ['stage', 'location', 'health'],
        arrays: ['observations', 'tasks'],
        preference: 'mostRecent'
      },
      'inventory': {
        fields: ['quantity'],
        arrays: ['adjustments'],
        preference: 'sum'
      }
    };

    return strategies[type] || { fields: [], arrays: [], preference: 'local' };
  }
}

// Network Monitoring
class NetworkMonitor {
  private online: boolean = navigator.onLine;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  isOnline(): boolean {
    return this.online;
  }

  private setOnline(status: boolean): void {
    this.online = status;
    this.emit(status ? 'online' : 'offline');
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb());
  }
}

// Sync API
class SyncAPI {
  private baseUrl = '/api/mobile/sync';

  async create(type: string, data: any): Promise<SyncItemResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 409) {
        const serverData = await response.json();
        return { success: false, conflict: true, serverData };
      }
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async update(type: string, id: string, data: any): Promise<SyncItemResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 409) {
        const serverData = await response.json();
        return { success: false, conflict: true, serverData };
      }
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async delete(type: string, id: string): Promise<SyncItemResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }
  
  private getAuthToken(): string | null {
    // Get stored auth token from localStorage or sessionStorage
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }
}

// Types
interface SyncResult {
  success: boolean;
  synced?: number;
  conflicts?: number;
  failed?: number;
  error?: string;
}

interface SyncItemResult {
  success: boolean;
  conflict?: boolean;
  serverData?: any;
  error?: string;
}

interface MergeStrategy {
  fields: string[];
  arrays: string[];
  preference: 'local' | 'server' | 'mostRecent' | 'mostComplete' | 'sum';
}

// Offline Data Helpers
export class OfflineDataHelpers {
  static canWorkOffline(feature: string): boolean {
    const offlineFeatures = [
      'task-completion',
      'plant-observation',
      'inventory-count',
      'photo-capture',
      'barcode-scan',
      'environmental-reading'
    ];
    return offlineFeatures.includes(feature);
  }

  static getOfflineCapacity(): OfflineCapacity {
    return {
      tasks: { max: 1000, current: 0 },
      plants: { max: 5000, current: 0 },
      photos: { max: 500, current: 0 },
      readings: { max: 10000, current: 0 }
    };
  }

  static async cleanupOldData(daysToKeep: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Remove old synced data
  }
}

interface OfflineCapacity {
  tasks: { max: number; current: number };
  plants: { max: number; current: number };
  photos: { max: number; current: number };
  readings: { max: number; current: number };
}

export async function updateSyncStatus(type: string, id: string, status: 'pending' | 'synced' | 'conflict'): Promise<void> {
  const db = new LocalDatabase();
  await db.initialize();
  
  const existing = await db.get(type, id);
  if (existing) {
    await db.update(type, id, { syncStatus: status, lastSyncAttempt: new Date() });
  }
}

export async function fetchAndCache(type: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/mobile/sync/${type}/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch and cache ${type}:`, error);
    return [];
  }
}

export async function forceSync(item: PendingSync): Promise<void> {
  const api = new SyncAPI();
  
  try {
    let result;
    switch (item.action) {
      case 'create':
        result = await api.create(item.type, { ...item.data, forceOverwrite: true });
        break;
      case 'update':
        result = await api.update(item.type, item.data.id, { ...item.data, forceOverwrite: true });
        break;
      case 'delete':
        result = await api.delete(item.type, item.data.id);
        break;
    }
    
    if (result.success) {
      await updateSyncStatus(item.type, item.data.id, 'synced');
    } else {
      throw new Error(result.error || 'Force sync failed');
    }
  } catch (error) {
    console.error('Force sync failed:', error);
    throw error;
  }
}

export async function acceptServerData(type: string, data: any): Promise<void> {
  const db = new LocalDatabase();
  await db.initialize();
  
  await db.update(type, data.id, {
    ...data,
    syncStatus: 'synced',
    lastModified: new Date(),
    conflictResolved: true
  });
}

export async function mergeData(localData: any, serverData: any): Promise<any> {
  // Simple merge strategy - prioritize local changes for specific fields
  const merged = { ...serverData };
  
  // Preserve local changes for user-modified fields
  const userFields = ['notes', 'status', 'completedBy', 'completedAt'];
  userFields.forEach(field => {
    if (localData[field] !== undefined) {
      merged[field] = localData[field];
    }
  });
  
  // Merge arrays by combining unique items
  const arrayFields = ['photos', 'signatures', 'observations'];
  arrayFields.forEach(field => {
    if (localData[field] && serverData[field]) {
      merged[field] = [...new Set([...serverData[field], ...localData[field]])];
    } else if (localData[field]) {
      merged[field] = localData[field];
    }
  });
  
  merged.lastModified = new Date();
  merged.mergedAt = new Date();
  
  return merged;
}

export async function syncMergedData(type: string, data: any): Promise<void> {
  const api = new SyncAPI();
  
  const result = await api.update(type, data.id, {
    ...data,
    mergedData: true,
    mergedAt: new Date()
  });
  
  if (result.success) {
    await updateSyncStatus(type, data.id, 'synced');
  } else {
    throw new Error(result.error || 'Failed to sync merged data');
  }
}

export async function handleSyncError(item: PendingSync, error: any): Promise<void> {
  const queue = new SyncQueue();
  
  // Increment attempt counter
  await queue.incrementAttempts(item.id);
  
  // Log error for debugging
  console.error(`Sync error for ${item.type}:${item.data.id}:`, error);
  
  // If max attempts reached, mark as failed
  if (item.attempts >= 3) {
    await updateSyncStatus(item.type, item.data.id, 'conflict');
    
    // Store error details for manual resolution
    const db = new LocalDatabase();
    await db.initialize();
    await db.update(item.type, item.data.id, {
      syncError: {
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        attempts: item.attempts
      }
    });
  }
}