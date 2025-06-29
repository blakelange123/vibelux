import { EventEmitter } from 'events';

interface SensorData {
  sensorId: string;
  type: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class SensorWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private isConnected: boolean = false;
  private subscribers: Map<string, Set<(data: SensorData) => void>> = new Map();

  constructor(config: WebSocketConfig = {}) {
    super();
    this.config = {
      url: config.url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000
    };
  }

  // Connect to WebSocket server
  connect(apiKey?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const url = new URL(this.config.url);
      if (apiKey) {
        url.searchParams.set('apiKey', apiKey);
      }

      this.ws = new WebSocket(url.toString());
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('error', error);
      this.scheduleReconnect();
    }
  }

  // Setup WebSocket event handlers
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Send queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.send(message);
      }

      // Start heartbeat
      this.startHeartbeat();
      
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        this.emit('error', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = (event) => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };
  }

  // Handle incoming messages
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'sensor_data':
        this.handleSensorData(message.data);
        break;
      
      case 'alert':
        this.emit('alert', message.data);
        break;
      
      case 'status':
        this.emit('status', message.data);
        break;
      
      case 'pong':
        // Heartbeat response
        break;
      
      case 'error':
        this.emit('error', new Error(message.message));
        break;
      
      default:
        this.emit('message', message);
    }
  }

  // Handle sensor data
  private handleSensorData(data: SensorData | SensorData[]): void {
    const dataArray = Array.isArray(data) ? data : [data];
    
    dataArray.forEach(sensorData => {
      // Emit general sensor data event
      this.emit('sensorData', sensorData);
      
      // Emit type-specific events
      this.emit(`sensor:${sensorData.type}`, sensorData);
      
      // Notify subscribers
      const typeSubscribers = this.subscribers.get(sensorData.type);
      if (typeSubscribers) {
        typeSubscribers.forEach(callback => callback(sensorData));
      }
      
      const sensorSubscribers = this.subscribers.get(sensorData.sensorId);
      if (sensorSubscribers) {
        sensorSubscribers.forEach(callback => callback(sensorData));
      }
    });
  }

  // Subscribe to specific sensor types or IDs
  subscribe(key: string, callback: (data: SensorData) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  // Send message to server
  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.emit('error', error);
    }
  }

  // Send sensor data
  sendSensorData(data: SensorData | SensorData[]): void {
    this.send({
      type: 'sensor_data',
      data: data,
      timestamp: new Date().toISOString()
    });
  }

  // Request historical data
  requestHistoricalData(params: {
    sensorId?: string;
    type?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): void {
    this.send({
      type: 'request_historical',
      params: {
        ...params,
        startTime: params.startTime?.toISOString(),
        endTime: params.endTime?.toISOString()
      }
    });
  }

  // Subscribe to live sensor stream
  subscribeToSensor(sensorId: string): void {
    this.send({
      type: 'subscribe',
      sensorId: sensorId
    });
  }

  // Unsubscribe from sensor stream
  unsubscribeFromSensor(sensorId: string): void {
    this.send({
      type: 'unsubscribe',
      sensorId: sensorId
    });
  }

  // Start heartbeat
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      60000 // Max 1 minute
    );

    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.isConnected = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.subscribers.clear();
    this.messageQueue = [];
  }

  // Get connection status
  getStatus(): {
    connected: boolean;
    readyState: number | null;
    reconnectAttempts: number;
    queuedMessages: number;
  } {
    return {
      connected: this.isConnected,
      readyState: this.ws?.readyState ?? null,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }

  // Batch send sensor data
  batchSendSensorData(dataArray: SensorData[]): void {
    const batchSize = 100;
    
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      this.sendSensorData(batch);
    }
  }

  // Create mock sensor stream (for development)
  createMockStream(types: string[] = ['temperature', 'humidity', 'co2', 'ppfd']): () => void {
    const intervals: NodeJS.Timeout[] = [];
    
    types.forEach(type => {
      const interval = setInterval(() => {
        const mockData: SensorData = {
          sensorId: `mock_${type}_001`,
          type: type,
          value: this.generateMockValue(type),
          timestamp: new Date(),
          metadata: {
            unit: this.getUnit(type),
            location: 'Grow Room 1'
          }
        };
        
        this.handleSensorData(mockData);
      }, 5000); // Every 5 seconds
      
      intervals.push(interval);
    });
    
    // Return cleanup function
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }

  // Generate mock sensor values
  private generateMockValue(type: string): number {
    const ranges: Record<string, [number, number]> = {
      temperature: [20, 28],
      humidity: [40, 70],
      co2: [400, 1200],
      ppfd: [200, 800],
      ph: [5.5, 6.5],
      ec: [1.0, 2.5],
      waterTemp: [18, 24],
      dissolvedOxygen: [6, 9]
    };
    
    const [min, max] = ranges[type] || [0, 100];
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (max - min) + min;
  }

  // Get unit for sensor type
  private getUnit(type: string): string {
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      co2: 'ppm',
      ppfd: 'μmol/m²/s',
      ph: 'pH',
      ec: 'mS/cm',
      waterTemp: '°C',
      dissolvedOxygen: 'mg/L'
    };
    
    return units[type] || '';
  }
}

// Singleton instance
export const sensorWebSocket = new SensorWebSocketService();