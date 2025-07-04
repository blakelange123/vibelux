// Notification service for real-time alerts and messages

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  
  private constructor() {
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if ('Notification' in window && Notification.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
    }
  ): Notification | null {
    if (this.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        ...options,
        icon: options?.icon || '/icon-192x192.png',
        badge: options?.badge || '/icon-192x192.png',
      });

      // Auto close after 10 seconds unless requireInteraction is true
      if (!options?.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Handle custom actions based on data
        if (options?.data?.action) {
          this.handleNotificationAction(options.data.action, options.data);
        }
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  private handleNotificationAction(action: string, data: any) {
    switch (action) {
      case 'navigate':
        if (data.url) {
          window.location.href = data.url;
        }
        break;
      case 'open-tracking':
        window.location.href = '/tracking?tab=realtime';
        break;
      case 'respond-sos':
        // Handle SOS response
        window.location.href = `/tracking?tab=realtime&sos=${data.alertId}`;
        break;
      default:
    }
  }

  // Specialized notification methods
  showSOSAlert(from: string, message?: string) {
    this.showNotification('🚨 SOS Alert', {
      body: `Emergency alert from ${from}: ${message || 'Immediate assistance needed!'}`,
      requireInteraction: true,
      tag: 'sos-alert',
      data: {
        action: 'respond-sos',
        alertId: Date.now()
      }
    });
  }

  showProximityAlert(message: string, location?: string) {
    this.showNotification('📍 Proximity Alert', {
      body: `${message}${location ? ` at ${location}` : ''}`,
      tag: 'proximity-alert'
    });
  }

  showGeofenceAlert(action: 'entered' | 'exited', zoneName: string, userName?: string) {
    const emoji = action === 'entered' ? '➡️' : '⬅️';
    this.showNotification(`${emoji} Geofence Alert`, {
      body: `${userName || 'User'} ${action} ${zoneName}`,
      tag: 'geofence-alert'
    });
  }

  showMessageNotification(from: string, message: string, priority?: 'normal' | 'high' | 'urgent') {
    const emoji = priority === 'urgent' ? '🔴' : priority === 'high' ? '🟡' : '💬';
    this.showNotification(`${emoji} Message from ${from}`, {
      body: message,
      tag: `message-${from}`,
      requireInteraction: priority === 'urgent',
      data: {
        action: 'open-tracking'
      }
    });
  }

  showTaskNotification(title: string, description?: string, dueTime?: Date) {
    this.showNotification('📋 New Task Assigned', {
      body: `${title}${description ? `\n${description}` : ''}${dueTime ? `\nDue: ${dueTime.toLocaleString()}` : ''}`,
      tag: 'task-notification',
      data: {
        action: 'open-tracking'
      }
    });
  }

  showBatteryAlert(userId: string, level: number) {
    this.showNotification('🔋 Low Battery Alert', {
      body: `${userId}'s device battery is at ${Math.round(level * 100)}%`,
      tag: `battery-${userId}`
    });
  }

  showInactivityAlert(userId: string, lastSeen: Date) {
    const minutesAgo = Math.round((Date.now() - lastSeen.getTime()) / 60000);
    this.showNotification('⏰ Inactivity Alert', {
      body: `${userId} has been inactive for ${minutesAgo} minutes`,
      tag: `inactivity-${userId}`
    });
  }

  // Utility methods
  isSupported(): boolean {
    return 'Notification' in window;
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }
}