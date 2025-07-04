// WebSocket client for real-time collaboration
import { EventEmitter } from 'events';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
  selection?: {
    objectId: string;
    type: 'fixture' | 'zone' | 'sensor';
  };
}

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'object_add' | 'object_update' | 'object_delete' | 'chat' | 'user_join' | 'user_leave';
  userId: string;
  timestamp: number;
  data: any;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export class CollaborationClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private roomId: string | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;
  private isConnected = false;

  constructor(userId: string, userName: string) {
    super();
    this.userId = userId;
    this.userName = userName;
    this.userColor = this.generateUserColor();
  }

  // Connect to collaboration room
  connect(roomId: string, wsUrl: string = 'ws://localhost:3001') {
    this.roomId = roomId;
    
    try {
      this.ws = new WebSocket(`${wsUrl}/collaboration/${roomId}`);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send join message
        this.send({
          type: 'user_join',
          userId: this.userId,
          data: {
            name: this.userName,
            color: this.userColor
          }
        });
        
        // Start heartbeat
        this.startHeartbeat();
        
        this.emit('connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (this.roomId) {
              this.connect(this.roomId, wsUrl);
            }
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      this.emit('error', error);
    }
  }
  
  // Disconnect from collaboration
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      // Send leave message
      this.send({
        type: 'user_leave',
        userId: this.userId,
        data: {}
      });
      
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.roomId = null;
  }
  
  // Send cursor position
  sendCursor(x: number, y: number) {
    this.send({
      type: 'cursor',
      userId: this.userId,
      data: { x, y }
    });
  }
  
  // Send selection
  sendSelection(objectId: string | null, type?: 'fixture' | 'zone' | 'sensor') {
    this.send({
      type: 'selection',
      userId: this.userId,
      data: objectId ? { objectId, type } : null
    });
  }
  
  // Send object addition
  sendObjectAdd(object: any) {
    this.send({
      type: 'object_add',
      userId: this.userId,
      data: object
    });
  }
  
  // Send object update
  sendObjectUpdate(objectId: string, updates: any) {
    this.send({
      type: 'object_update',
      userId: this.userId,
      data: { objectId, updates }
    });
  }
  
  // Send object deletion
  sendObjectDelete(objectId: string) {
    this.send({
      type: 'object_delete',
      userId: this.userId,
      data: { objectId }
    });
  }
  
  // Send chat message
  sendChatMessage(message: string) {
    const chatMessage: ChatMessage = {
      id: `${this.userId}-${Date.now()}`,
      userId: this.userId,
      userName: this.userName,
      message,
      timestamp: Date.now()
    };
    
    this.send({
      type: 'chat',
      userId: this.userId,
      data: chatMessage
    });
  }
  
  // Get connection status
  getIsConnected(): boolean {
    return this.isConnected;
  }
  
  // Private methods
  private send(event: CollaborationEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...event,
        timestamp: Date.now()
      }));
    }
  }
  
  private handleMessage(message: CollaborationEvent) {
    // Don't process our own messages (except chat)
    if (message.userId === this.userId && message.type !== 'chat') {
      return;
    }
    
    switch (message.type) {
      case 'cursor':
        this.emit('cursor_update', {
          userId: message.userId,
          cursor: message.data
        });
        break;
        
      case 'selection':
        this.emit('selection_update', {
          userId: message.userId,
          selection: message.data
        });
        break;
        
      case 'object_add':
        this.emit('object_added', {
          userId: message.userId,
          object: message.data
        });
        break;
        
      case 'object_update':
        this.emit('object_updated', {
          userId: message.userId,
          objectId: message.data.objectId,
          updates: message.data.updates
        });
        break;
        
      case 'object_delete':
        this.emit('object_deleted', {
          userId: message.userId,
          objectId: message.data.objectId
        });
        break;
        
      case 'chat':
        this.emit('chat_message', message.data);
        break;
        
      case 'user_join':
        this.emit('user_joined', {
          userId: message.userId,
          user: message.data
        });
        break;
        
      case 'user_leave':
        this.emit('user_left', {
          userId: message.userId
        });
        break;
        
      case 'users_list':
        this.emit('users_updated', message.data);
        break;
        
      case 'heartbeat':
        // Heartbeat response, ignore
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#48DBFB', '#1DD1A1', '#F368E0'
    ];
    return colors[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * colors.length)];
  }
}

// Singleton instance
let collaborationInstance: CollaborationClient | null = null;

export function getCollaborationClient(userId: string, userName: string): CollaborationClient {
  if (!collaborationInstance) {
    collaborationInstance = new CollaborationClient(userId, userName);
  }
  return collaborationInstance;
}