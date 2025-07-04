// Real-time tracking without mesh networks using Pusher and device GPS
import { 
  getPusherClient, 
  getFacilityChannel, 
  getUserChannel, 
  getPresenceChannel,
  emitRealtimeEvent,
  TrackingEvents
} from './realtime-service';
import { TrackingErrorHandler, OfflineSyncService } from './offline-sync';
import { BatteryOptimizer, BackgroundSyncOptimizer } from './battery-optimization';

export interface LocationUpdate {
  userId: string;
  assetId?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  };
  timestamp: Date;
  battery?: number;
  metadata?: {
    zone?: string;
    floor?: string;
    activity?: string;
  };
}

export interface TrackingAlert {
  id: string;
  type: 'geofence' | 'proximity' | 'sos' | 'battery' | 'inactivity' | 'speed' | 'custom';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  location?: LocationUpdate['location'];
  targetUsers?: string[];
  metadata?: Record<string, any>;
  timestamp: Date;
  acknowledged?: boolean;
}

export interface Message {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: 'text' | 'location' | 'image' | 'alert' | 'task';
  content: string;
  location?: LocationUpdate['location'];
  attachments?: string[];
  priority: 'normal' | 'high' | 'urgent';
  timestamp: Date;
  read?: boolean;
  metadata?: Record<string, any>;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'circular' | 'polygon' | 'indoor';
  boundaries: {
    center?: { lat: number; lng: number };
    radius?: number; // meters
    polygon?: Array<{ lat: number; lng: number }>;
    floor?: string;
  };
  alerts: {
    onEnter: boolean;
    onExit: boolean;
    onDwell?: { duration: number }; // seconds
  };
  restrictions?: {
    allowedUsers?: string[];
    restrictedUsers?: string[];
    schedule?: Array<{ day: number; startTime: string; endTime: string }>;
  };
}

export class RealtimeTracker {
  private pusher: any = null;
  private facilityChannel: any = null;
  private userChannel: any = null;
  private presenceChannel: any = null;
  private watchId: number | null = null;
  private locationUpdateInterval: number = 5000; // 5 seconds default
  private lastLocation: LocationUpdate | null = null;
  private geofences: Map<string, GeofenceZone> = new Map();
  private activeAlerts: Map<string, TrackingAlert> = new Map();
  private batteryOptimizer: BatteryOptimizer;
  private backgroundSyncOptimizer: BackgroundSyncOptimizer;
  private updateTimer: NodeJS.Timeout | null = null;
  
  // Callbacks
  private onLocationUpdate?: (location: LocationUpdate) => void;
  private onAlert?: (alert: TrackingAlert) => void;
  private onMessage?: (message: Message) => void;
  private onUsersUpdate?: (users: Map<string, LocationUpdate>) => void;

  constructor(
    private userId: string,
    private facilityId: string
  ) {
    this.batteryOptimizer = new BatteryOptimizer();
    this.backgroundSyncOptimizer = new BackgroundSyncOptimizer(this.batteryOptimizer);
    
    // Listen for battery optimization changes
    this.batteryOptimizer.onModeChange((mode) => {
      this.locationUpdateInterval = mode.locationUpdateInterval;
      this.restartLocationTracking();
    });
  }

  /**
   * Start real-time tracking
   */
  async startTracking(options?: {
    updateInterval?: number;
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    trackingMode?: 'passive' | 'active' | 'precise';
  }): Promise<void> {
    if (options?.updateInterval) {
      this.locationUpdateInterval = options.updateInterval;
    }

    // Initialize Pusher connection
    this.initializePusher();

    // Start location tracking with battery optimization
    if ('geolocation' in navigator) {
      // Use battery-optimized settings if no specific options provided
      const batteryOptimizedOptions = this.batteryOptimizer.getRecommendedGeoOptions();
      const geoOptions: PositionOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? batteryOptimizedOptions.enableHighAccuracy,
        timeout: options?.timeout ?? batteryOptimizedOptions.timeout,
        maximumAge: options?.maximumAge ?? batteryOptimizedOptions.maximumAge
      };

      // Watch position for continuous updates
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleLocationUpdate(position),
        (error) => this.handleLocationError(error),
        geoOptions
      );

      // Set up battery-optimized periodic updates
      this.updateTimer = setInterval(() => {
        // Use current battery-optimized interval
        const currentInterval = this.batteryOptimizer.getRecommendedUpdateInterval();
        if (this.locationUpdateInterval !== currentInterval) {
          this.locationUpdateInterval = currentInterval;
          this.restartLocationTracking();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => this.handleLocationUpdate(position),
          (error) => this.handleLocationError(error),
          this.batteryOptimizer.getRecommendedGeoOptions()
        );
      }, this.locationUpdateInterval);
    } else {
      throw new Error('Geolocation is not supported by this browser');
    }
  }

  /**
   * Stop tracking
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.facilityChannel = null;
      this.userChannel = null;
      this.presenceChannel = null;
    }

    this.backgroundSyncOptimizer.destroy();
  }

  /**
   * Send a message to another user or broadcast
   */
  async sendMessage(message: Omit<Message, 'id' | 'from' | 'timestamp'>): Promise<void> {
    const fullMessage: Message = {
      ...message,
      id: this.generateId(),
      from: this.userId,
      timestamp: new Date()
    };

    // Send via API with offline support
    try {
      await TrackingErrorHandler.sendMessage(this.facilityId, {
        toUser: message.to === 'broadcast' ? null : message.to,
        type: message.type,
        content: message.content,
        location: message.location,
        attachments: message.attachments,
        priority: message.priority.toUpperCase(),
        metadata: message.metadata
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error is already handled by TrackingErrorHandler (queued for offline sync)
      throw error;
    }
  }

  /**
   * Send an SOS alert
   */
  async sendSOSAlert(message?: string): Promise<void> {
    const alert: TrackingAlert = {
      id: this.generateId(),
      type: 'sos',
      severity: 'critical',
      title: 'SOS Alert',
      message: message || `SOS alert from ${this.userId}`,
      location: this.lastLocation?.location,
      timestamp: new Date()
    };

    // Send via API instead of direct socket
    try {
      const response = await fetch('/api/tracking/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: this.facilityId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          location: alert.location,
          targetUsers: alert.targetUsers,
          metadata: alert.metadata
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send SOS alert');
      }
    } catch (error) {
      console.error('Failed to send SOS alert:', error);
      throw error;
    }
  }

  /**
   * Create a geofence zone
   */
  async createGeofence(zone: GeofenceZone): Promise<void> {
    this.geofences.set(zone.id, zone);
    // Send via API instead of direct socket
    try {
      const response = await fetch('/api/tracking/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: this.facilityId,
          ...zone
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create geofence');
      }
    } catch (error) {
      console.error('Failed to create geofence:', error);
      throw error;
    }
  }

  /**
   * Check if location is within a geofence
   */
  private checkGeofences(location: LocationUpdate): void {
    this.geofences.forEach((zone) => {
      const wasInside = this.lastLocation ? this.isInsideGeofence(this.lastLocation.location, zone) : false;
      const isInside = this.isInsideGeofence(location.location, zone);

      if (!wasInside && isInside && zone.alerts.onEnter) {
        this.triggerGeofenceAlert(zone, 'entered', location);
      } else if (wasInside && !isInside && zone.alerts.onExit) {
        this.triggerGeofenceAlert(zone, 'exited', location);
      }
    });
  }

  /**
   * Check if a point is inside a geofence
   */
  private isInsideGeofence(location: LocationUpdate['location'], zone: GeofenceZone): boolean {
    switch (zone.type) {
      case 'circular':
        if (!zone.boundaries.center || !zone.boundaries.radius) return false;
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          zone.boundaries.center.lat,
          zone.boundaries.center.lng
        );
        return distance <= zone.boundaries.radius;

      case 'polygon':
        if (!zone.boundaries.polygon) return false;
        return this.isPointInPolygon(
          location.latitude,
          location.longitude,
          zone.boundaries.polygon
        );

      case 'indoor':
        // For indoor zones, would need additional floor/room detection
        return false;

      default:
        return false;
    }
  }

  /**
   * Send a task assignment
   */
  async assignTask(task: {
    assignedTo: string;
    title: string;
    description: string;
    location?: LocationUpdate['location'];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    dueTime?: Date;
  }): Promise<void> {
    const message: Omit<Message, 'id' | 'from' | 'timestamp'> = {
      to: task.assignedTo,
      type: 'task',
      content: task.title,
      location: task.location,
      priority: task.priority === 'low' ? 'normal' : task.priority,
      metadata: {
        description: task.description,
        dueTime: task.dueTime
      }
    };

    await this.sendMessage(message);
  }

  /**
   * Request help from nearby users
   */
  async requestNearbyHelp(
    message: string,
    radius: number = 100 // meters
  ): Promise<void> {
    if (!this.lastLocation) {
      throw new Error('Location not available');
    }

    const alert: TrackingAlert = {
      id: this.generateId(),
      type: 'proximity',
      severity: 'warning',
      title: 'Help Requested',
      message,
      location: this.lastLocation.location,
      timestamp: new Date(),
      metadata: {
        radius,
        requesterId: this.userId
      }
    };

    this.socket?.emit('help:request', alert);
  }

  /**
   * Share live location with specific users
   */
  async shareLiveLocation(
    userIds: string[],
    duration: number = 3600000 // 1 hour default
  ): Promise<void> {
    // Send via API instead of direct socket
    try {
      const response = await fetch('/api/tracking/location/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: this.facilityId,
          sharedWith: userIds,
          duration,
          startTime: new Date()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to share location');
      }
    } catch (error) {
      console.error('Failed to share location:', error);
      throw error;
    }

    // Auto-stop sharing after duration
    setTimeout(() => {
      this.stopSharingLocation(userIds);
    }, duration);
  }

  /**
   * Stop sharing location
   */
  async stopSharingLocation(userIds?: string[]): Promise<void> {
    // Send via API instead of direct socket
    try {
      const response = await fetch('/api/tracking/location/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: this.facilityId,
          userIds
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop sharing location');
      }
    } catch (error) {
      console.error('Failed to stop sharing location:', error);
      throw error;
    }
  }

  // Private methods
  private initializePusher(): void {
    this.pusher = getPusherClient();
    
    if (!this.pusher) {
      console.warn('Pusher not available, using mock service');
      return;
    }

    // Subscribe to facility channel for broadcasts
    this.facilityChannel = this.pusher.subscribe(getFacilityChannel(this.facilityId));
    
    // Subscribe to user channel for direct messages
    this.userChannel = this.pusher.subscribe(getUserChannel(this.userId));
    
    // Subscribe to presence channel for user tracking
    this.presenceChannel = this.pusher.subscribe(getPresenceChannel(this.facilityId));

    // Set up event handlers
    this.facilityChannel.bind(TrackingEvents.ALERT_NEW, (alert: TrackingAlert) => {
      this.activeAlerts.set(alert.id, alert);
      this.onAlert?.(alert);
    });

    this.facilityChannel.bind(TrackingEvents.MESSAGE_NEW, (message: Message) => {
      this.onMessage?.(message);
    });

    this.userChannel.bind(TrackingEvents.MESSAGE_NEW, (message: Message) => {
      this.onMessage?.(message);
    });

    this.userChannel.bind(TrackingEvents.ALERT_NEW, (alert: TrackingAlert) => {
      this.activeAlerts.set(alert.id, alert);
      this.onAlert?.(alert);
    });

    this.facilityChannel.bind(TrackingEvents.LOCATION_UPDATE, (update: LocationUpdate) => {
      // Handle other users' location updates
      if (update.userId !== this.userId) {
        this.onLocationUpdate?.(update);
      }
    });

    this.facilityChannel.bind(TrackingEvents.GEOFENCE_ENTERED, (data: any) => {
      const alert: TrackingAlert = {
        id: this.generateId(),
        type: 'geofence',
        severity: 'info',
        title: 'Geofence Entered',
        message: data.message,
        location: data.location,
        timestamp: new Date(),
        metadata: data.metadata
      };
      this.onAlert?.(alert);
    });

    this.facilityChannel.bind(TrackingEvents.GEOFENCE_EXITED, (data: any) => {
      const alert: TrackingAlert = {
        id: this.generateId(),
        type: 'geofence',
        severity: 'info',
        title: 'Geofence Exited',
        message: data.message,
        location: data.location,
        timestamp: new Date(),
        metadata: data.metadata
      };
      this.onAlert?.(alert);
    });

    // Handle presence events for user tracking
    this.presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
      const userMap = new Map<string, LocationUpdate>();
      members.each((member: any) => {
        if (member.info && member.info.lastLocation) {
          userMap.set(member.id, member.info.lastLocation);
        }
      });
      this.onUsersUpdate?.(userMap);
    });

    this.presenceChannel.bind('pusher:member_added', (member: any) => {
    });

    this.presenceChannel.bind('pusher:member_removed', (member: any) => {
    });
  }

  private handleLocationUpdate(position: GeolocationPosition): void {
    const update: LocationUpdate = {
      userId: this.userId,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined
      },
      timestamp: new Date(position.timestamp),
      battery: (navigator as any).getBattery ? undefined : undefined // Will implement battery API
    };

    // Check geofences
    this.checkGeofences(update);

    // Check for alerts (speed, inactivity, etc.)
    this.checkForAlerts(update);

    // Store last location
    this.lastLocation = update;

    // Send to server via API
    this.sendLocationUpdate(update);

    // Callback
    this.onLocationUpdate?.(update);
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Location error:', error);
    
    const alert: TrackingAlert = {
      id: this.generateId(),
      type: 'custom',
      severity: 'warning',
      title: 'Location Error',
      message: error.message,
      timestamp: new Date()
    };

    this.onAlert?.(alert);
  }

  private checkForAlerts(update: LocationUpdate): void {
    // Check for speeding
    if (update.location.speed && update.location.speed > 50) { // 50 m/s = 180 km/h
      const alert: TrackingAlert = {
        id: this.generateId(),
        type: 'speed',
        severity: 'warning',
        title: 'Speed Alert',
        message: `High speed detected: ${Math.round(update.location.speed * 3.6)} km/h`,
        location: update.location,
        timestamp: new Date()
      };
      this.onAlert?.(alert);
    }

    // Check battery (if available)
    if ((navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.15) { // 15%
          const alert: TrackingAlert = {
            id: this.generateId(),
            type: 'battery',
            severity: 'warning',
            title: 'Low Battery',
            message: `Battery level: ${Math.round(battery.level * 100)}%`,
            timestamp: new Date()
          };
          this.onAlert?.(alert);
        }
      });
    }
  }

  private triggerGeofenceAlert(
    zone: GeofenceZone,
    action: 'entered' | 'exited',
    location: LocationUpdate
  ): void {
    const alert: TrackingAlert = {
      id: this.generateId(),
      type: 'geofence',
      severity: 'info',
      title: `Geofence ${action}`,
      message: `User ${this.userId} ${action} ${zone.name}`,
      location: location.location,
      timestamp: new Date(),
      metadata: {
        zoneId: zone.id,
        zoneName: zone.name,
        action
      }
    };

    // Send alert via API
    this.sendAlert(alert);
    this.onAlert?.(alert);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private isPointInPolygon(lat: number, lng: number, polygon: Array<{ lat: number; lng: number }>): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      
      const intersect = ((yi > lat) !== (yj > lat))
          && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  private generateId(): string {
    return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }

  // Helper methods for API calls with offline support
  private async sendLocationUpdate(update: LocationUpdate): Promise<void> {
    try {
      await TrackingErrorHandler.sendLocationUpdate(this.facilityId, {
        latitude: update.location.latitude,
        longitude: update.location.longitude,
        accuracy: update.location.accuracy,
        altitude: update.location.altitude,
        speed: update.location.speed,
        heading: update.location.heading,
        battery: update.battery,
        metadata: update.metadata
      });
    } catch (error) {
      console.error('Failed to send location update:', error);
      // Error is already handled by TrackingErrorHandler (queued for offline sync)
    }
  }

  private async sendAlert(alert: TrackingAlert): Promise<void> {
    try {
      await TrackingErrorHandler.sendAlert(this.facilityId, {
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        location: alert.location,
        targetUsers: alert.targetUsers,
        metadata: alert.metadata
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
      // Error is already handled by TrackingErrorHandler (queued for offline sync)
    }
  }

  // Event handlers
  onLocation(callback: (location: LocationUpdate) => void): void {
    this.onLocationUpdate = callback;
  }

  onAlertReceived(callback: (alert: TrackingAlert) => void): void {
    this.onAlert = callback;
  }

  onMessageReceived(callback: (message: Message) => void): void {
    this.onMessage = callback;
  }

  onUsersUpdated(callback: (users: Map<string, LocationUpdate>) => void): void {
    this.onUsersUpdate = callback;
  }

  /**
   * Restart location tracking with new settings (for battery optimization)
   */
  private restartLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    // Restart with current battery-optimized settings
    if ('geolocation' in navigator) {
      const geoOptions = this.batteryOptimizer.getRecommendedGeoOptions();

      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleLocationUpdate(position),
        (error) => this.handleLocationError(error),
        geoOptions
      );

      this.updateTimer = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => this.handleLocationUpdate(position),
          (error) => this.handleLocationError(error),
          geoOptions
        );
      }, this.locationUpdateInterval);
    }
  }

  /**
   * Get battery information and tracking recommendations
   */
  getBatteryStatus() {
    return {
      batteryInfo: this.batteryOptimizer.getBatteryInfo(),
      currentMode: this.batteryOptimizer.getCurrentMode(),
      estimatedTime: this.batteryOptimizer.getEstimatedTrackingTime(),
      recommendations: this.batteryOptimizer.getPowerSavingRecommendations(),
      availableModes: this.batteryOptimizer.getAvailableModes()
    };
  }

  /**
   * Manually set tracking mode (overrides battery optimization)
   */
  setTrackingMode(mode: 'precision' | 'balanced' | 'economy' | 'emergency'): void {
    this.batteryOptimizer.setTrackingMode(mode);
  }
}