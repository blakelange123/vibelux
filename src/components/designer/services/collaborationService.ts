import { RoomObject, DesignerAction } from '../context/types';

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedObjectId?: string | null;
}

export interface CollaborationEvent {
  type: 'user-joined' | 'user-left' | 'cursor-moved' | 'action' | 'chat' | 'sync-request' | 'sync-response';
  userId: string;
  timestamp: number;
  data?: any;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
}

class CollaborationService {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private userId: string = `user-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  private users: Map<string, CollaborationUser> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  // User colors for collaboration
  private userColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];

  constructor() {
    // Initialize with current user
    const userColor = this.userColors[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * this.userColors.length)];
    this.users.set(this.userId, {
      id: this.userId,
      name: `User ${this.userId.slice(-4)}`,
      color: userColor
    });
  }

  // Connect to collaboration room
  async connect(roomId: string, userName?: string): Promise<void> {
    if (this.ws && this.isConnected && this.roomId === roomId) {
      return; // Already connected to this room
    }

    this.roomId = roomId;
    
    // Update current user name if provided
    if (userName) {
      const currentUser = this.users.get(this.userId);
      if (currentUser) {
        currentUser.name = userName;
      }
    }

    // For demo purposes, we'll simulate WebSocket connection
    // In production, this would connect to a real WebSocket server
    this.simulateConnection();
  }

  // Simulate WebSocket connection for demo
  private simulateConnection() {
    this.isConnected = true;
    this.emit('connection-status', { connected: true });
    
    // Simulate other users joining
    setTimeout(() => {
      this.simulateUserJoined();
    }, 2000);

    // Start heartbeat
    this.startHeartbeat();
  }

  // Simulate another user joining
  private simulateUserJoined() {
    const userId = `user-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    const userColor = this.userColors[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * this.userColors.length)];
    const user: CollaborationUser = {
      id: userId,
      name: `Guest ${userId.slice(-4)}`,
      color: userColor
    };
    
    this.users.set(userId, user);
    this.emit('user-joined', user);
    
    // Simulate user activity
    this.simulateUserActivity(userId);
  }

  // Simulate user cursor movements and actions
  private simulateUserActivity(userId: string) {
    // Random cursor movements
    const moveCursor = () => {
      if (!this.users.has(userId)) return;
      
      const user = this.users.get(userId)!;
      user.cursor = {
        x: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
        y: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100
      };
      
      this.emit('cursor-moved', { userId, cursor: user.cursor });
      
      // Schedule next movement
      setTimeout(moveCursor, 2000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3000);
    };
    
    moveCursor();
  }

  // Send action to other users
  sendAction(action: DesignerAction) {
    if (!this.isConnected) return;
    
    const event: CollaborationEvent = {
      type: 'action',
      userId: this.userId,
      timestamp: Date.now(),
      data: action
    };
    
    // In production, this would send via WebSocket
    // For demo, we'll just emit locally
    this.emit('remote-action', { userId: this.userId, action });
  }

  // Send cursor position
  sendCursorPosition(x: number, y: number) {
    if (!this.isConnected) return;
    
    const currentUser = this.users.get(this.userId);
    if (currentUser) {
      currentUser.cursor = { x, y };
    }
    
    // In production, this would send via WebSocket
    // For demo, we'll just update locally
  }

  // Send chat message
  sendChatMessage(message: string): ChatMessage {
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      userId: this.userId,
      message,
      timestamp: Date.now()
    };
    
    if (this.isConnected) {
      // In production, this would send via WebSocket
      this.emit('chat-message', chatMessage);
    }
    
    return chatMessage;
  }

  // Request sync from other users
  requestSync() {
    if (!this.isConnected) return;
    
    const event: CollaborationEvent = {
      type: 'sync-request',
      userId: this.userId,
      timestamp: Date.now()
    };
    
    // In production, this would send via WebSocket
    this.emit('sync-requested', { userId: this.userId });
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // Send heartbeat
        // In production, this would send via WebSocket
      }
    }, 30000); // Every 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Disconnect from room
  disconnect() {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.roomId = null;
    this.users.clear();
    this.users.set(this.userId, {
      id: this.userId,
      name: `User ${this.userId.slice(-4)}`,
      color: this.userColors[0]
    });
    
    this.emit('connection-status', { connected: false });
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  getCurrentUserId(): string {
    return this.userId;
  }

  getCurrentUser(): CollaborationUser | undefined {
    return this.users.get(this.userId);
  }

  getUsers(): CollaborationUser[] {
    return Array.from(this.users.values());
  }

  getOtherUsers(): CollaborationUser[] {
    return Array.from(this.users.values()).filter(user => user.id !== this.userId);
  }

  isUserConnected(): boolean {
    return this.isConnected;
  }

  getRoomId(): string | null {
    return this.roomId;
  }
}

// Singleton instance
export const collaborationService = new CollaborationService();