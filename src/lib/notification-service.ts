// Notification Service - Stub Implementation

export interface NotificationConfig {
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  preferences: {
    doNotDisturb?: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
    alertTypes: {
      critical: boolean;
      warning: boolean;
      info: boolean;
      success: boolean;
    };
    grouping: {
      enabled: boolean;
      interval: number; // minutes
    };
  };
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  userId?: string;
  facilityId?: string;
  roomId?: string;
  metadata?: Record<string, any>;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
}

export interface NotificationResult {
  success: boolean;
  channels: {
    inApp?: { success: boolean; error?: string };
    email?: { success: boolean; error?: string };
    sms?: { success: boolean; error?: string };
    push?: { success: boolean; error?: string };
  };
  timestamp: Date;
}

export class NotificationService {
  private config: NotificationConfig;
  private alertQueue: Alert[] = [];
  private notificationHistory: Map<string, NotificationResult> = new Map();
  private subscribers: Map<string, Function[]> = new Map();

  constructor(config?: Partial<NotificationConfig>) {
    this.config = {
      channels: {
        inApp: true,
        email: false,
        sms: false,
        push: true,
        ...config?.channels
      },
      preferences: {
        alertTypes: {
          critical: true,
          warning: true,
          info: true,
          success: true
        },
        grouping: {
          enabled: true,
          interval: 5
        },
        ...config?.preferences
      }
    };

    // Start processing queue
    this.startQueueProcessor();
  }

  async sendNotification(alert: Alert): Promise<NotificationResult> {
    // Check if notification should be sent based on preferences
    if (!this.shouldSendNotification(alert)) {
      return {
        success: false,
        channels: {},
        timestamp: new Date()
      };
    }

    // Add to queue for processing
    this.alertQueue.push(alert);

    // Process immediately for critical alerts
    if (alert.type === 'critical') {
      return this.processAlert(alert);
    }

    // Return pending result for non-critical
    return {
      success: true,
      channels: { inApp: { success: true } },
      timestamp: new Date()
    };
  }

  async sendBatch(alerts: Alert[]): Promise<NotificationResult[]> {
    return Promise.all(alerts.map(alert => this.sendNotification(alert)));
  }

  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      channels: {
        ...this.config.channels,
        ...config.channels
      },
      preferences: {
        ...this.config.preferences,
        ...config.preferences
      }
    };
  }

  getConfig(): NotificationConfig {
    return this.config;
  }

  getHistory(limit?: number): Alert[] {
    const history = Array.from(this.notificationHistory.keys())
      .map(id => this.alertQueue.find(a => a.id === id))
      .filter(Boolean) as Alert[];
    
    return limit ? history.slice(-limit) : history;
  }

  clearHistory(): void {
    this.notificationHistory.clear();
  }

  subscribe(event: 'alert' | 'notification' | 'error', handler: Function): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(handler);
  }

  unsubscribe(event: string, handler: Function): void {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  private shouldSendNotification(alert: Alert): boolean {
    // Check alert type preferences
    if (!this.config.preferences.alertTypes[alert.type]) {
      return false;
    }

    // Check Do Not Disturb
    if (this.config.preferences.doNotDisturb?.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = this.config.preferences.doNotDisturb;
      
      if (start < end) {
        // Normal case: DND during same day
        if (currentTime >= start && currentTime <= end) {
          return alert.type === 'critical'; // Only critical alerts during DND
        }
      } else {
        // DND spans midnight
        if (currentTime >= start || currentTime <= end) {
          return alert.type === 'critical';
        }
      }
    }

    return true;
  }

  private async processAlert(alert: Alert): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channels: {},
      timestamp: new Date()
    };

    // Process each enabled channel
    if (this.config.channels.inApp) {
      result.channels.inApp = await this.sendInAppNotification(alert);
    }

    if (this.config.channels.email) {
      result.channels.email = await this.sendEmailNotification(alert);
    }

    if (this.config.channels.sms) {
      result.channels.sms = await this.sendSMSNotification(alert);
    }

    if (this.config.channels.push) {
      result.channels.push = await this.sendPushNotification(alert);
    }

    // Update success status
    result.success = Object.values(result.channels).some(channel => channel.success);

    // Store in history
    this.notificationHistory.set(alert.id, result);

    // Emit notification event
    this.emit('notification', { alert, result });

    return result;
  }

  private async sendInAppNotification(alert: Alert): Promise<{ success: boolean; error?: string }> {
    try {
      // Emit alert for in-app handling
      this.emit('alert', alert);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async sendEmailNotification(alert: Alert): Promise<{ success: boolean; error?: string }> {
    // Stub implementation
    console.log('Sending email notification:', alert.title);
    return { success: true };
  }

  private async sendSMSNotification(alert: Alert): Promise<{ success: boolean; error?: string }> {
    // Stub implementation
    console.log('Sending SMS notification:', alert.title);
    return { success: true };
  }

  private async sendPushNotification(alert: Alert): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if push notifications are supported and permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(alert.title, {
          body: alert.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: alert.id,
          data: alert,
          requireInteraction: alert.type === 'critical'
        });

        notification.onclick = () => {
          window.focus();
          this.emit('notification-clicked', alert);
        };

        return { success: true };
      } else {
        return { success: false, error: 'Push notifications not permitted' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.alertQueue.length === 0) return;

      // Group alerts if enabled
      if (this.config.preferences.grouping.enabled) {
        const now = Date.now();
        const groupingWindow = this.config.preferences.grouping.interval * 60 * 1000;
        
        // Find alerts within grouping window
        const alertsToProcess = this.alertQueue.filter(alert => 
          now - alert.timestamp.getTime() >= groupingWindow
        );

        if (alertsToProcess.length > 0) {
          // Remove from queue
          this.alertQueue = this.alertQueue.filter(a => !alertsToProcess.includes(a));
          
          // Process grouped alerts
          if (alertsToProcess.length === 1) {
            this.processAlert(alertsToProcess[0]);
          } else {
            // Create grouped notification
            const groupedAlert: Alert = {
              id: crypto.randomUUID(),
              type: this.getMostSevereType(alertsToProcess),
              title: `${alertsToProcess.length} new alerts`,
              message: alertsToProcess.map(a => a.title).join(', '),
              source: 'system',
              timestamp: new Date(),
              metadata: {
                alerts: alertsToProcess
              }
            };
            
            this.processAlert(groupedAlert);
          }
        }
      } else {
        // Process all alerts immediately
        const alert = this.alertQueue.shift();
        if (alert) {
          this.processAlert(alert);
        }
      }
    }, 1000); // Check every second
  }

  private getMostSevereType(alerts: Alert[]): Alert['type'] {
    const severityOrder: Alert['type'][] = ['critical', 'warning', 'info', 'success'];
    
    for (const severity of severityOrder) {
      if (alerts.some(a => a.type === severity)) {
        return severity;
      }
    }
    
    return 'info';
  }
}

// Alert Builder for easy alert creation
export class AlertBuilder {
  private alert: Partial<Alert> = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    source: 'system'
  };

  type(type: Alert['type']): AlertBuilder {
    this.alert.type = type;
    return this;
  }

  title(title: string): AlertBuilder {
    this.alert.title = title;
    return this;
  }

  message(message: string): AlertBuilder {
    this.alert.message = message;
    return this;
  }

  source(source: string): AlertBuilder {
    this.alert.source = source;
    return this;
  }

  user(userId: string): AlertBuilder {
    this.alert.userId = userId;
    return this;
  }

  facility(facilityId: string): AlertBuilder {
    this.alert.facilityId = facilityId;
    return this;
  }

  room(roomId: string): AlertBuilder {
    this.alert.roomId = roomId;
    return this;
  }

  metadata(metadata: Record<string, any>): AlertBuilder {
    this.alert.metadata = metadata;
    return this;
  }

  action(label: string, action: string, primary?: boolean): AlertBuilder {
    if (!this.alert.actions) {
      this.alert.actions = [];
    }
    this.alert.actions.push({ label, action, primary });
    return this;
  }

  build(): Alert {
    if (!this.alert.type || !this.alert.title || !this.alert.message) {
      throw new Error('Alert must have type, title, and message');
    }
    
    return this.alert as Alert;
  }
}

// Singleton instance getter
let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(config?: Partial<NotificationConfig>): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService(config);
  } else if (config) {
    notificationServiceInstance.updateConfig(config);
  }
  
  return notificationServiceInstance;
}

// Export convenience functions
export async function sendCriticalAlert(title: string, message: string, metadata?: Record<string, any>): Promise<NotificationResult> {
  const service = getNotificationService();
  const alert = new AlertBuilder()
    .type('critical')
    .title(title)
    .message(message)
    .metadata(metadata || {})
    .build();
  
  return service.sendNotification(alert);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}