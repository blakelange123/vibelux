// Real-time service using Pusher for production
// For local development, you can use the mock service below

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
let pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (!pusherServer && process.env.PUSHER_APP_ID) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      useTLS: true
    });
  }
  return pusherServer;
}

// Client-side Pusher instance
export function getPusherClient() {
  if (typeof window === 'undefined') return null;
  
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    authEndpoint: '/api/pusher/auth'
  });
}

// Channel names
export function getFacilityChannel(facilityId: string) {
  return `private-facility-${facilityId}`;
}

export function getUserChannel(userId: string) {
  return `private-user-${userId}`;
}

export function getPresenceChannel(facilityId: string) {
  return `presence-facility-${facilityId}`;
}

// Server-side event emission
export async function emitRealtimeEvent(
  channel: string,
  event: string,
  data: any
) {
  const pusher = getPusherServer();
  
  if (pusher) {
    try {
      await pusher.trigger(channel, event, data);
      return true;
    } catch (error) {
      console.error('Pusher trigger error:', error);
      return false;
    }
  } else {
    // Fallback for development without Pusher
    return true;
  }
}

// Batch event emission
export async function emitBatchEvents(
  events: Array<{
    channel: string;
    event: string;
    data: any;
  }>
) {
  const pusher = getPusherServer();
  
  if (pusher && events.length > 0) {
    try {
      const batch = events.map(e => ({
        channel: e.channel,
        name: e.event,
        data: JSON.stringify(e.data)
      }));
      
      await pusher.triggerBatch(batch);
      return true;
    } catch (error) {
      console.error('Pusher batch trigger error:', error);
      return false;
    }
  }
  
  return true;
}

// Event types for tracking
export const TrackingEvents = {
  LOCATION_UPDATE: 'location:update',
  MESSAGE_NEW: 'message:new',
  ALERT_NEW: 'alert:new',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',
  SOS_TRIGGERED: 'sos:triggered',
  GEOFENCE_ENTERED: 'geofence:entered',
  GEOFENCE_EXITED: 'geofence:exited',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  TASK_ASSIGNED: 'task:assigned',
  HELP_REQUESTED: 'help:requested',
  LOCATION_SHARED: 'location:shared'
} as const;

// Mock service for development without Pusher
export class MockRealtimeService {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);
  }

  unsubscribe(channel: string, callback: (data: any) => void) {
    this.subscribers.get(channel)?.delete(callback);
  }

  emit(channel: string, event: string, data: any) {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(cb => cb({ event, data }));
    }
  }
}

// Export singleton for development
export const mockRealtimeService = new MockRealtimeService();