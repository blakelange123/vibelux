// Mock WebSocket server for testing collaboration features
// In production, this would be replaced with a real WebSocket server

import { EventEmitter } from 'events';

interface MockWebSocketServer extends EventEmitter {
  clients: Set<MockWebSocket>;
  rooms: Map<string, Set<MockWebSocket>>;
}

interface MockWebSocket extends EventEmitter {
  id: string;
  roomId?: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  readyState: number;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

class MockWebSocketServer extends EventEmitter {
  clients = new Set<MockWebSocket>();
  rooms = new Map<string, Set<MockWebSocket>>();

  constructor() {
    super();
  }

  // Simulate WebSocket connection
  connect(roomId: string): MockWebSocket {
    const ws = new MockWebSocketClient() as MockWebSocket;
    ws.roomId = roomId;
    
    // Add to room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);
    this.clients.add(ws);

    // Handle messages
    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    // Simulate connection delay
    setTimeout(() => {
      ws.readyState = ws.OPEN;
      ws.emit('open');
    }, 100);

    return ws;
  }

  private handleMessage(ws: MockWebSocket, message: any) {
    const { type, userId, data } = message;

    switch (type) {
      case 'user_join':
        ws.userId = userId;
        ws.userName = data.name;
        ws.userColor = data.color;
        
        // Broadcast user list to room
        this.broadcastToRoom(ws.roomId!, {
          type: 'users_list',
          data: this.getRoomUsers(ws.roomId!)
        });

        // Notify others of new user
        this.broadcastToRoom(ws.roomId!, {
          type: 'user_join',
          userId,
          data
        }, ws);
        break;

      case 'user_leave':
        this.handleDisconnect(ws);
        break;

      case 'cursor':
      case 'selection':
      case 'object_add':
      case 'object_update':
      case 'object_delete':
      case 'chat':
        // Broadcast to other users in the room
        this.broadcastToRoom(ws.roomId!, message, ws);
        break;

      case 'heartbeat':
        // Respond to heartbeat
        ws.emit('message', JSON.stringify({ type: 'heartbeat' }));
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  private handleDisconnect(ws: MockWebSocket) {
    if (ws.roomId) {
      const room = this.rooms.get(ws.roomId);
      if (room) {
        room.delete(ws);
        
        // Notify others of user leaving
        if (ws.userId) {
          this.broadcastToRoom(ws.roomId, {
            type: 'user_leave',
            userId: ws.userId,
            data: {}
          });
        }

        // Update user list
        this.broadcastToRoom(ws.roomId, {
          type: 'users_list',
          data: this.getRoomUsers(ws.roomId)
        });

        // Clean up empty room
        if (room.size === 0) {
          this.rooms.delete(ws.roomId);
        }
      }
    }
    
    this.clients.delete(ws);
  }

  private broadcastToRoom(roomId: string, message: any, exclude?: MockWebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageString = JSON.stringify({
      ...message,
      timestamp: Date.now()
    });

    room.forEach(client => {
      if (client !== exclude && client.readyState === client.OPEN) {
        client.emit('message', messageString);
      }
    });
  }

  private getRoomUsers(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room)
      .filter(ws => ws.userId)
      .map(ws => ({
        id: ws.userId,
        name: ws.userName,
        color: ws.userColor
      }));
  }
}

class MockWebSocketClient extends EventEmitter {
  id = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9);
  readyState = 0; // CONNECTING
  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;

  send(data: string) {
    if (this.readyState === this.OPEN) {
      this.emit('message', data);
    }
  }

  close() {
    this.readyState = this.CLOSED;
    this.emit('close');
  }
}

// Global mock server instance
let mockServer: MockWebSocketServer | null = null;

// Mock WebSocket implementation for browser
export class MockWebSocket extends EventEmitter {
  readyState = 0;
  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;
  
  private mockClient: MockWebSocket | null = null;

  constructor(url: string) {
    super();
    
    // Initialize mock server if needed
    if (!mockServer) {
      mockServer = new MockWebSocketServer();
    }

    // Extract room ID from URL
    const roomMatch = url.match(/\/collaboration\/(.+)$/);
    const roomId = roomMatch ? roomMatch[1] : 'default';

    // Connect to mock server
    setTimeout(() => {
      this.mockClient = mockServer!.connect(roomId);
      this.readyState = this.CONNECTING;

      // Forward events
      this.mockClient.on('open', () => {
        this.readyState = this.OPEN;
        this.emit('open');
      });

      this.mockClient.on('message', (data: string) => {
        this.emit('message', { data });
      });

      this.mockClient.on('close', () => {
        this.readyState = this.CLOSED;
        this.emit('close');
      });

      this.mockClient.on('error', (error: any) => {
        this.emit('error', error);
      });
    }, 10);
  }

  send(data: string) {
    if (this.mockClient && this.readyState === this.OPEN) {
      this.mockClient.emit('message', data);
    }
  }

  close() {
    if (this.mockClient) {
      this.mockClient.close();
    }
    this.readyState = this.CLOSED;
  }
}

// Replace WebSocket globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).WebSocket = MockWebSocket;
}