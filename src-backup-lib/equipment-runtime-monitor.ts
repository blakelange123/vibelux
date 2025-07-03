// Equipment Runtime Monitoring Service
// Tracks real-time equipment usage and updates operating hours automatically

import { Equipment, equipmentManager } from './equipment-manager';

export interface RuntimeSession {
  equipmentId: string;
  startTime: Date;
  endTime?: Date;
  hoursAccumulated: number;
}

export interface RuntimeData {
  equipmentId: string;
  status: 'running' | 'stopped' | 'idle';
  currentPower?: number; // Watts
  temperature?: number; // Celsius
  lastUpdate: Date;
}

export class EquipmentRuntimeMonitor {
  private activeSessions: Map<string, RuntimeSession> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private runtimeData: Map<string, RuntimeData> = new Map();
  private webhookEndpoint?: string;

  constructor() {
    // Start periodic updates every minute
    this.startPeriodicUpdates();
  }

  // Start tracking runtime for a piece of equipment
  startRuntime(equipmentId: string): void {
    if (this.activeSessions.has(equipmentId)) {
      console.warn(`Runtime already being tracked for equipment ${equipmentId}`);
      return;
    }

    const session: RuntimeSession = {
      equipmentId,
      startTime: new Date(),
      hoursAccumulated: 0
    };

    this.activeSessions.set(equipmentId, session);
    
    // Update runtime data
    this.runtimeData.set(equipmentId, {
      equipmentId,
      status: 'running',
      lastUpdate: new Date()
    });
  }

  // Stop tracking runtime and update total hours
  stopRuntime(equipmentId: string): number {
    const session = this.activeSessions.get(equipmentId);
    if (!session) {
      console.warn(`No active runtime session for equipment ${equipmentId}`);
      return 0;
    }

    session.endTime = new Date();
    const hoursRun = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
    session.hoursAccumulated = hoursRun;

    // Update equipment total hours
    const equipment = equipmentManager.getEquipmentById(equipmentId);
    if (equipment) {
      equipmentManager.updateUsageHours(equipmentId, hoursRun);
    }

    this.activeSessions.delete(equipmentId);
    
    // Update runtime data
    this.runtimeData.set(equipmentId, {
      equipmentId,
      status: 'stopped',
      lastUpdate: new Date()
    });

    return hoursRun;
  }

  // Get current runtime for active equipment
  getCurrentRuntime(equipmentId: string): number {
    const session = this.activeSessions.get(equipmentId);
    if (!session) return 0;

    const now = new Date();
    return (now.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
  }

  // Update runtime data from IoT device
  updateRuntimeData(data: RuntimeData): void {
    this.runtimeData.set(data.equipmentId, data);

    // Auto-detect start/stop based on power consumption
    if (data.currentPower !== undefined) {
      const isRunning = data.currentPower > 10; // Threshold in watts
      const wasRunning = this.activeSessions.has(data.equipmentId);

      if (isRunning && !wasRunning) {
        this.startRuntime(data.equipmentId);
      } else if (!isRunning && wasRunning) {
        this.stopRuntime(data.equipmentId);
      }
    }
  }

  // Webhook endpoint for IoT devices to report runtime
  setWebhookEndpoint(endpoint: string): void {
    this.webhookEndpoint = endpoint;
  }

  // Process webhook data from IoT devices
  processWebhookData(payload: any): void {
    // Example payload structure from IoT devices
    // {
    //   deviceId: "light-001",
    //   timestamp: "2024-01-20T10:30:00Z",
    //   status: "on",
    //   power: 450,
    //   temperature: 45
    // }

    if (payload.deviceId) {
      const runtimeData: RuntimeData = {
        equipmentId: payload.deviceId,
        status: payload.status === 'on' ? 'running' : 'stopped',
        currentPower: payload.power,
        temperature: payload.temperature,
        lastUpdate: new Date(payload.timestamp || Date.now())
      };

      this.updateRuntimeData(runtimeData);
    }
  }

  // Integration with Modbus/BACnet/MQTT for runtime monitoring
  async connectToProtocol(protocol: 'modbus' | 'bacnet' | 'mqtt', config: any): Promise<void> {
    // This would connect to industrial protocols for real-time monitoring
    // Implementation would depend on specific protocol libraries
    
    switch (protocol) {
      case 'modbus':
        // Connect to Modbus TCP/RTU devices
        // Read holding registers for runtime data
        break;
      case 'bacnet':
        // Connect to BACnet/IP devices
        // Subscribe to COV (Change of Value) notifications
        break;
      case 'mqtt':
        // Connect to MQTT broker
        // Subscribe to equipment status topics
        break;
    }
  }

  // Get all active runtime sessions
  getActiveSessions(): RuntimeSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Get runtime statistics for reporting
  getRuntimeStatistics(equipmentId: string, period: 'day' | 'week' | 'month' = 'day'): {
    totalHours: number;
    averageDaily: number;
    uptime: number;
  } {
    const equipment = equipmentManager.getEquipmentById(equipmentId);
    if (!equipment) {
      return { totalHours: 0, averageDaily: 0, uptime: 0 };
    }

    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const recentHours = equipment.usage.dailyHours.slice(-days);
    const totalHours = recentHours.reduce((sum, hours) => sum + hours, 0);
    const averageDaily = totalHours / days;
    const uptime = (totalHours / (days * 24)) * 100;

    return {
      totalHours,
      averageDaily,
      uptime
    };
  }

  // Periodic update of active sessions
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(() => {
      // Update hours for all active sessions
      this.activeSessions.forEach((session, equipmentId) => {
        const hoursRun = this.getCurrentRuntime(equipmentId);
        
        // Update equipment usage every hour
        if (hoursRun >= 1 && Math.floor(hoursRun) > Math.floor(session.hoursAccumulated)) {
          const hoursSinceLastUpdate = Math.floor(hoursRun) - Math.floor(session.hoursAccumulated);
          equipmentManager.updateUsageHours(equipmentId, hoursSinceLastUpdate);
          session.hoursAccumulated = hoursRun;
        }
      });

      // Check for stale runtime data (no update in 5 minutes)
      const staleThreshold = 5 * 60 * 1000; // 5 minutes
      const now = new Date();
      
      this.runtimeData.forEach((data, equipmentId) => {
        if (data.status === 'running' && 
            now.getTime() - data.lastUpdate.getTime() > staleThreshold) {
          console.warn(`Runtime data stale for equipment ${equipmentId}, marking as stopped`);
          this.stopRuntime(equipmentId);
        }
      });
    }, 60000); // Run every minute
  }

  // Clean up resources
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Stop all active sessions
    this.activeSessions.forEach((session, equipmentId) => {
      this.stopRuntime(equipmentId);
    });
  }
}

// Create singleton instance
export const runtimeMonitor = new EquipmentRuntimeMonitor();

// Example integration with equipment manager
export function integrateRuntimeMonitoring(): void {
  // Listen for equipment status changes
  // This would typically be triggered by your IoT integration
  
  // Example: Start monitoring when equipment is activated
  // equipmentManager.on('equipment:activated', (equipmentId) => {
  //   runtimeMonitor.startRuntime(equipmentId);
  // });
  
  // Example: Stop monitoring when equipment is deactivated
  // equipmentManager.on('equipment:deactivated', (equipmentId) => {
  //   runtimeMonitor.stopRuntime(equipmentId);
  // });
}

// API endpoint handler for IoT webhooks
export function handleRuntimeWebhook(req: Request): Response {
  try {
    const payload = req.body;
    runtimeMonitor.processWebhookData(payload);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Runtime webhook error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process runtime data' }), { status: 500 });
  }
}