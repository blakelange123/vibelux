import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Real-time analytics event types
export interface AnalyticsEvent {
  type: 'pageview' | 'click' | 'hover' | 'scroll' | 'conversion' | 'user_join' | 'user_leave';
  timestamp: number;
  userId: string;
  sessionId: string;
  data: {
    page?: string;
    element?: string;
    coordinates?: { x: number; y: number };
    scrollDepth?: number;
    conversionType?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    location?: {
      country: string;
      city: string;
      coordinates: { lat: number; lng: number };
    };
    userAgent?: string;
    referrer?: string;
  };
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  averageSessionTime: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicData: Array<{
    country: string;
    users: number;
    coordinates: { lat: number; lng: number };
  }>;
  conversionEvents: Array<{
    type: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface UseRealTimeAnalyticsOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  updateInterval?: number;
  bufferSize?: number;
}

export interface UseRealTimeAnalyticsReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  metrics: RealTimeMetrics | null;
  events: AnalyticsEvent[];
  sendEvent: (event: Omit<AnalyticsEvent, 'timestamp'>) => void;
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
}

class RealTimeAnalyticsService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventBuffer: AnalyticsEvent[] = [];
  private maxBufferSize = 1000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.setupHeartbeat();
  }

  connect(options?: { reconnectAttempts?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (options?.reconnectAttempts) {
        this.maxReconnectAttempts = options.reconnectAttempts;
      }

      // In a real implementation, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      this.socket = {
        connected: true,
        connect: () => {},
        disconnect: () => {},
        on: (event: string, callback: Function) => {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
          }
          this.listeners.get(event)?.push(callback as any);
        },
        off: (event: string, callback?: Function) => {
          if (callback) {
            const listeners = this.listeners.get(event) || [];
            const index = listeners.indexOf(callback as any);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          } else {
            this.listeners.delete(event);
          }
        },
        emit: (event: string, data: any) => {
          // Simulate server response
          this.simulateServerResponse(event, data);
        }
      } as any;

      this.setupEventListeners();
      this.startSimulation();
      
      setTimeout(() => {
        this.emit('connected');
        resolve();
      }, 100);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.emit('disconnected');
    }
  }

  sendEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.addToBuffer(fullEvent);

    if (this.socket?.connected) {
      this.socket.emit('analytics_event', fullEvent);
    }
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    return () => {
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  getBufferedEvents(): AnalyticsEvent[] {
    return [...this.eventBuffer];
  }

  clearBuffer(): void {
    this.eventBuffer = [];
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnected');
      this.attemptReconnect();
    });

    this.socket.on('analytics_update', (data: RealTimeMetrics) => {
      this.emit('metrics_update', data);
    });

    this.socket.on('new_event', (event: AnalyticsEvent) => {
      this.addToBuffer(event);
      this.emit('new_event', event);
    });

    this.socket.on('error', (error: any) => {
      this.emit('error', error);
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', 'Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect().catch((error) => {
        this.emit('error', error);
      });
    }, Math.pow(2, this.reconnectAttempts) * 1000);
  }

  private addToBuffer(event: AnalyticsEvent): void {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() });
      }
    }, 30000);
  }

  private startSimulation(): void {
    // Simulate real-time events for demonstration
    setInterval(() => {
      this.generateMockEvent();
      this.generateMockMetrics();
    }, 2000);
  }

  private generateMockEvent(): void {
    const eventTypes: AnalyticsEvent['type'][] = ['pageview', 'click', 'hover', 'scroll', 'conversion'];
    const pages = ['/dashboard', '/analytics', '/settings', '/billing', '/users', '/projects'];
    const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia'];
    const cities = ['New York', 'London', 'Berlin', 'Paris', 'Toronto', 'Sydney'];

    const event: AnalyticsEvent = {
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp: Date.now(),
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
      data: {
        page: pages[Math.floor(Math.random() * pages.length)],
        element: Math.random() > 0.5 ? `btn-${Math.random().toString(36).substr(2, 5)}` : undefined,
        coordinates: {
          x: Math.floor(Math.random() * 1920),
          y: Math.floor(Math.random() * 1080)
        },
        scrollDepth: Math.floor(Math.random() * 100),
        deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
        location: {
          country: countries[Math.floor(Math.random() * countries.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
          coordinates: {
            lat: Math.random() * 180 - 90,
            lng: Math.random() * 360 - 180
          }
        }
      }
    };

    this.addToBuffer(event);
    this.emit('new_event', event);
  }

  private generateMockMetrics(): void {
    const metrics: RealTimeMetrics = {
      activeUsers: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 10000) + 1000,
      uniqueVisitors: Math.floor(Math.random() * 2000) + 500,
      conversionRate: Math.random() * 15 + 5,
      averageSessionTime: Math.floor(Math.random() * 600) + 120,
      topPages: [
        { page: '/dashboard', views: Math.floor(Math.random() * 1000) + 500 },
        { page: '/analytics', views: Math.floor(Math.random() * 800) + 300 },
        { page: '/settings', views: Math.floor(Math.random() * 600) + 200 },
        { page: '/billing', views: Math.floor(Math.random() * 400) + 100 },
        { page: '/users', views: Math.floor(Math.random() * 300) + 50 }
      ],
      deviceBreakdown: {
        desktop: Math.floor(Math.random() * 300) + 200,
        mobile: Math.floor(Math.random() * 200) + 100,
        tablet: Math.floor(Math.random() * 50) + 25
      },
      geographicData: [
        { country: 'United States', users: Math.floor(Math.random() * 200) + 100, coordinates: { lat: 39.8283, lng: -98.5795 } },
        { country: 'United Kingdom', users: Math.floor(Math.random() * 100) + 50, coordinates: { lat: 55.3781, lng: -3.4360 } },
        { country: 'Germany', users: Math.floor(Math.random() * 80) + 40, coordinates: { lat: 51.1657, lng: 10.4515 } },
        { country: 'France', users: Math.floor(Math.random() * 70) + 30, coordinates: { lat: 46.2276, lng: 2.2137 } },
        { country: 'Canada', users: Math.floor(Math.random() * 60) + 25, coordinates: { lat: 56.1304, lng: -106.3468 } }
      ],
      conversionEvents: [
        { type: 'signup', count: Math.floor(Math.random() * 50) + 10, trend: 'up' },
        { type: 'purchase', count: Math.floor(Math.random() * 30) + 5, trend: 'stable' },
        { type: 'upgrade', count: Math.floor(Math.random() * 20) + 3, trend: 'down' }
      ]
    };

    this.emit('metrics_update', metrics);
  }

  private simulateServerResponse(event: string, data: any): void {
    // Simulate server processing and response
    setTimeout(() => {
      if (event === 'analytics_event') {
        this.emit('event_processed', { success: true, eventId: data.timestamp });
      }
    }, Math.random() * 100);
  }
}

// Singleton instance
const analyticsService = new RealTimeAnalyticsService();

export function useRealTimeAnalytics(options: UseRealTimeAnalyticsOptions = {}): UseRealTimeAnalyticsReturn {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    updateInterval = 5000,
    bufferSize = 1000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      await analyticsService.connect({ reconnectAttempts });
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, reconnectAttempts]);

  const disconnect = useCallback(() => {
    analyticsService.disconnect();
    setIsConnected(false);
  }, []);

  const sendEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp'>) => {
    analyticsService.sendEvent(event);
  }, []);

  const clearEvents = useCallback(() => {
    analyticsService.clearBuffer();
    setEvents([]);
  }, []);

  useEffect(() => {
    const unsubscribeConnected = analyticsService.subscribe('connected', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    const unsubscribeDisconnected = analyticsService.subscribe('disconnected', () => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    const unsubscribeError = analyticsService.subscribe('error', (error: string) => {
      setError(error);
      setIsConnecting(false);
    });

    const unsubscribeMetrics = analyticsService.subscribe('metrics_update', (newMetrics: RealTimeMetrics) => {
      setMetrics(newMetrics);
    });

    const unsubscribeEvents = analyticsService.subscribe('new_event', (event: AnalyticsEvent) => {
      setEvents(prev => {
        const updated = [...prev, event];
        return updated.slice(-bufferSize);
      });
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
      unsubscribeMetrics();
      unsubscribeEvents();
    };
  }, [bufferSize]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, isConnected]);

  // Periodic buffer sync
  useEffect(() => {
    const interval = setInterval(() => {
      const bufferedEvents = analyticsService.getBufferedEvents();
      setEvents(bufferedEvents.slice(-bufferSize));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, bufferSize]);

  return {
    isConnected,
    isConnecting,
    error,
    metrics,
    events,
    sendEvent,
    connect,
    disconnect,
    clearEvents
  };
}

// Hook for page analytics
export function usePageAnalytics() {
  const { sendEvent, isConnected } = useRealTimeAnalytics();

  const trackPageView = useCallback((page: string, additionalData?: Partial<AnalyticsEvent['data']>) => {
    if (!isConnected) return;

    sendEvent({
      type: 'pageview',
      userId: localStorage.getItem('userId') || 'anonymous',
      sessionId: sessionStorage.getItem('sessionId') || 'session-' + Date.now(),
      data: {
        page,
        deviceType: window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop',
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...additionalData
      }
    });
  }, [sendEvent, isConnected]);

  const trackClick = useCallback((element: string, coordinates?: { x: number; y: number }) => {
    if (!isConnected) return;

    sendEvent({
      type: 'click',
      userId: localStorage.getItem('userId') || 'anonymous',
      sessionId: sessionStorage.getItem('sessionId') || 'session-' + Date.now(),
      data: {
        page: window.location.pathname,
        element,
        coordinates,
        deviceType: window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop'
      }
    });
  }, [sendEvent, isConnected]);

  const trackScroll = useCallback((scrollDepth: number) => {
    if (!isConnected) return;

    sendEvent({
      type: 'scroll',
      userId: localStorage.getItem('userId') || 'anonymous',
      sessionId: sessionStorage.getItem('sessionId') || 'session-' + Date.now(),
      data: {
        page: window.location.pathname,
        scrollDepth,
        deviceType: window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop'
      }
    });
  }, [sendEvent, isConnected]);

  const trackConversion = useCallback((conversionType: string, additionalData?: Partial<AnalyticsEvent['data']>) => {
    if (!isConnected) return;

    sendEvent({
      type: 'conversion',
      userId: localStorage.getItem('userId') || 'anonymous',
      sessionId: sessionStorage.getItem('sessionId') || 'session-' + Date.now(),
      data: {
        page: window.location.pathname,
        conversionType,
        deviceType: window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop',
        ...additionalData
      }
    });
  }, [sendEvent, isConnected]);

  return {
    trackPageView,
    trackClick,
    trackScroll,
    trackConversion
  };
}

export default analyticsService;