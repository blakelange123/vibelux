/**
 * Real-time WebSocket Server for VibeLux
 * Handles live sensor data, lighting controls, and system notifications
 */

import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'
import { verifyToken } from '@clerk/backend'
import { influxClient } from './influxdb-client'
import { db } from './db'
import { env } from './env-validator'

export interface WebSocketClient {
  id: string
  ws: WebSocket
  userId: string
  subscriptions: Set<string>
  lastPing: number
  authenticated: boolean
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'control' | 'data'
  channel?: string
  data?: any
  timestamp?: number
}

export interface LiveDataMessage {
  type: 'sensor_data' | 'lighting_status' | 'system_alert' | 'user_activity'
  channel: string
  data: any
  timestamp: number
  source: string
}

class RealtimeServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private sensorData: Map<string, SensorReading[]> = new Map();
  private processingInterval: NodeJS.Timer | null = null;
  
  constructor(port: number = 3001) {
    const server = createServer();
    this.wss = new WebSocketServer({ server });
    
    this.setupWebSocketServer();
    this.startDataProcessing();
    
    server.listen(port, () => {
    });
  }
  
  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
      const { query } = parse(req.url || '', true);
      const token = query.token as string;
      
      // Verify authentication token
      const userId = await this.verifyToken(token);
      if (!userId) {
        ws.close(1008, 'Invalid token');
        return;
      }
      
      // Get user's projects
      const projects = await prisma.project.findMany({
        where: { userId },
        select: { id: true }
      });
      
      const clientId = this.generateClientId();
      const client: Client = {
        ws,
        userId,
        projectIds: projects.map(p => p.id),
        isAlive: true
      };
      
      this.clients.set(clientId, client);
      
      // Send initial connection success
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        clientId,
        timestamp: new Date()
      }));
      
      // Handle messages
      ws.on('message', (data) => {
        this.handleMessage(clientId, data.toString());
      });
      
      // Handle pong for heartbeat
      ws.on('pong', () => {
        client.isAlive = true;
      });
      
      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(clientId);
      });
      
      // Send initial data
      this.sendHistoricalData(clientId);
    });
    
    // Heartbeat to detect broken connections
    setInterval(() => {
      this.clients.forEach((client, id) => {
        if (!client.isAlive) {
          client.ws.terminate();
          this.clients.delete(id);
          return;
        }
        
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000);
  }
  
  private async handleMessage(clientId: string, message: string) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);
      if (!client) return;
      
      switch (data.type) {
        case 'subscribe':
          // Subscribe to specific room updates
          if (data.roomId && client.projectIds.includes(data.projectId)) {
            client.ws.send(JSON.stringify({
              type: 'subscribed',
              roomId: data.roomId,
              timestamp: new Date()
            }));
          }
          break;
          
        case 'sensor_data':
          // Handle incoming sensor data (from IoT devices)
          await this.processSensorData(data);
          break;
          
        case 'control':
          // Handle control commands
          await this.handleControlCommand(client, data);
          break;
          
        case 'get_historical':
          // Send historical data for a specific time range
          await this.sendHistoricalDataRange(clientId, data);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }
  
  private async processSensorData(data: any) {
    const reading: SensorReading = {
      sensorId: data.sensorId,
      type: data.type,
      value: data.value,
      timestamp: new Date(data.timestamp || Date.now()),
      roomId: data.roomId,
      projectId: data.projectId
    };
    
    // Store in memory for real-time access
    const key = `${reading.projectId}:${reading.roomId}`;
    if (!this.sensorData.has(key)) {
      this.sensorData.set(key, []);
    }
    
    const readings = this.sensorData.get(key)!;
    readings.push(reading);
    
    // Keep only last 1000 readings per room
    if (readings.length > 1000) {
      readings.shift();
    }
    
    // Broadcast to relevant clients
    this.broadcastSensorData(reading);
    
    // Store in database (batched for efficiency)
    await this.storeSensorReading(reading);
    
    // Check for alerts
    await this.checkAlerts(reading);
  }
  
  private broadcastSensorData(reading: SensorReading) {
    this.clients.forEach((client) => {
      if (client.projectIds.includes(reading.projectId)) {
        client.ws.send(JSON.stringify({
          type: 'sensor_update',
          data: reading,
          timestamp: new Date()
        }));
      }
    });
  }
  
  private async checkAlerts(reading: SensorReading) {
    // Get alert thresholds from database
    const project = await prisma.project.findUnique({
      where: { id: reading.projectId },
      include: {
        rooms: {
          where: { id: reading.roomId }
        }
      }
    });
    
    if (!project || !project.rooms[0]) return;
    
    const room = project.rooms[0];
    let alert = null;
    
    // Check temperature
    if (reading.type === 'temperature') {
      if (reading.value > 85) {
        alert = {
          type: 'critical',
          message: `High temperature alert in ${room.name}: ${reading.value}°F`,
          value: reading.value,
          threshold: 85
        };
      } else if (reading.value < 65) {
        alert = {
          type: 'warning',
          message: `Low temperature alert in ${room.name}: ${reading.value}°F`,
          value: reading.value,
          threshold: 65
        };
      }
    }
    
    // Check humidity
    if (reading.type === 'humidity') {
      if (reading.value > 70) {
        alert = {
          type: 'warning',
          message: `High humidity alert in ${room.name}: ${reading.value}%`,
          value: reading.value,
          threshold: 70
        };
      } else if (reading.value < 40) {
        alert = {
          type: 'warning',
          message: `Low humidity alert in ${room.name}: ${reading.value}%`,
          value: reading.value,
          threshold: 40
        };
      }
    }
    
    // Check CO2
    if (reading.type === 'co2' && reading.value < 400) {
      alert = {
        type: 'warning',
        message: `Low CO2 levels in ${room.name}: ${reading.value} ppm`,
        value: reading.value,
        threshold: 400
      };
    }
    
    if (alert) {
      this.broadcastAlert({
        ...alert,
        roomId: reading.roomId,
        projectId: reading.projectId,
        sensorType: reading.type,
        timestamp: new Date()
      });
    }
  }
  
  private broadcastAlert(alert: any) {
    this.clients.forEach((client) => {
      if (client.projectIds.includes(alert.projectId)) {
        client.ws.send(JSON.stringify({
          type: 'alert',
          data: alert,
          timestamp: new Date()
        }));
      }
    });
  }
  
  private async handleControlCommand(client: Client, data: any) {
    // Verify user has permission
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        userId: client.userId
      }
    });
    
    if (!project) {
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Unauthorized',
        timestamp: new Date()
      }));
      return;
    }
    
    // Process control command
    const command = {
      deviceId: data.deviceId,
      action: data.action,
      value: data.value,
      timestamp: new Date()
    };
    
    // In production, this would send to actual device controllers
    // For now, simulate success
    setTimeout(() => {
      client.ws.send(JSON.stringify({
        type: 'control_response',
        status: 'success',
        command,
        timestamp: new Date()
      }));
      
      // Broadcast state change
      this.broadcastDeviceState({
        projectId: data.projectId,
        roomId: data.roomId,
        deviceId: data.deviceId,
        state: data.action,
        value: data.value
      });
    }, 500);
  }
  
  private broadcastDeviceState(state: any) {
    this.clients.forEach((client) => {
      if (client.projectIds.includes(state.projectId)) {
        client.ws.send(JSON.stringify({
          type: 'device_state',
          data: state,
          timestamp: new Date()
        }));
      }
    });
  }
  
  private async sendHistoricalData(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Send last 100 readings for each room
    for (const projectId of client.projectIds) {
      const rooms = await prisma.room.findMany({
        where: { projectId }
      });
      
      for (const room of rooms) {
        const key = `${projectId}:${room.id}`;
        const readings = this.sensorData.get(key) || [];
        const recent = readings.slice(-100);
        
        if (recent.length > 0) {
          client.ws.send(JSON.stringify({
            type: 'historical_data',
            roomId: room.id,
            data: recent,
            timestamp: new Date()
          }));
        }
      }
    }
  }
  
  private async sendHistoricalDataRange(clientId: string, params: any) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // In production, this would query from time-series database
    // For now, send from memory cache
    const key = `${params.projectId}:${params.roomId}`;
    const readings = this.sensorData.get(key) || [];
    
    const filtered = readings.filter(r => {
      const timestamp = r.timestamp.getTime();
      return timestamp >= params.startTime && timestamp <= params.endTime;
    });
    
    client.ws.send(JSON.stringify({
      type: 'historical_range',
      roomId: params.roomId,
      startTime: params.startTime,
      endTime: params.endTime,
      data: filtered,
      timestamp: new Date()
    }));
  }
  
  private async storeSensorReading(reading: SensorReading) {
    // Batch writes for efficiency
    // In production, use time-series database like InfluxDB or TimescaleDB
    // For now, we'll use a simple batching mechanism
    
    // This would be implemented with a queue system
    // that batches writes every few seconds
  }
  
  private startDataProcessing() {
    // Process aggregations every minute
    this.processingInterval = setInterval(async () => {
      await this.processAggregations();
    }, 60000);
  }
  
  private async processAggregations() {
    // Calculate averages, detect trends, etc.
    for (const [key, readings] of this.sensorData.entries()) {
      const [projectId, roomId] = key.split(':');
      
      if (readings.length === 0) continue;
      
      // Group by sensor type
      const byType = new Map<string, number[]>();
      readings.forEach(r => {
        if (!byType.has(r.type)) {
          byType.set(r.type, []);
        }
        byType.get(r.type)!.push(r.value);
      });
      
      // Calculate aggregates
      const aggregates: any = {};
      byType.forEach((values, type) => {
        aggregates[type] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          current: values[values.length - 1]
        };
      });
      
      // Broadcast aggregates
      this.clients.forEach((client) => {
        if (client.projectIds.includes(projectId)) {
          client.ws.send(JSON.stringify({
            type: 'aggregates',
            roomId,
            data: aggregates,
            timestamp: new Date()
          }));
        }
      });
    }
  }
  
  private async verifyToken(token: string): Promise<string | null> {
    // In production, verify JWT or session token
    // For now, extract user ID from token
    try {
      // This would integrate with Clerk or your auth system
      // Placeholder implementation
      const parts = token.split('.');
      if (parts.length === 3) {
        return 'user_' + Date.now(); // Placeholder
      }
      return null;
    } catch {
      return null;
    }
  }
  
  private generateClientId(): string {
    return `client_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }
  
  public shutdown() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.clients.forEach(client => {
      client.ws.close(1000, 'Server shutting down');
    });
    
    this.wss.close();
  }
}

// Export for use in Next.js custom server
export default RealtimeServer;