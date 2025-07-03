/**
 * Real-time Collaboration Client
 * Handles WebSocket connections, presence, and state synchronization
 */

import { EventEmitter } from 'events'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
}

export interface Presence {
  user: User
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
  viewport?: { x: number; y: number; zoom: number }
  lastActive: Date
  status: 'active' | 'idle' | 'away'
}

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'comment' | 'presence' | 'sync'
  userId: string
  data: any
  timestamp: Date
  version?: number
}

export interface Comment {
  id: string
  userId: string
  text: string
  position?: { x: number; y: number }
  elementId?: string
  resolved: boolean
  replies: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface CollaborationConfig {
  projectId: string
  userId: string
  user: User
  wsUrl?: string
  reconnectDelay?: number
  heartbeatInterval?: number
  idleTimeout?: number
}

export class CollaborationClient extends EventEmitter {
  private config: CollaborationConfig
  private ws: WebSocket | null = null
  private presence: Map<string, Presence> = new Map()
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private idleTimer: NodeJS.Timeout | null = null
  private isConnected = false
  private messageQueue: CollaborationEvent[] = []
  private lastActivity = Date.now()
  private documentVersion = 0
  
  constructor(config: CollaborationConfig) {
    super()
    this.config = {
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      reconnectDelay: 5000,
      heartbeatInterval: 30000,
      idleTimeout: 300000, // 5 minutes
      ...config
    }
  }
  
  /**
   * Connect to collaboration server
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    
    try {
      this.ws = new WebSocket(`${this.config.wsUrl}/collaborate/${this.config.projectId}`)
      
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error)
      this.scheduleReconnect()
    }
  }
  
  /**
   * Disconnect from collaboration server
   */
  disconnect() {
    this.clearTimers()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
    this.presence.clear()
    this.emit('disconnected')
  }
  
  /**
   * Send cursor position
   */
  sendCursor(x: number, y: number) {
    this.updateActivity()
    this.send({
      type: 'cursor',
      userId: this.config.userId,
      data: { x, y },
      timestamp: new Date()
    })
  }
  
  /**
   * Send selection
   */
  sendSelection(elementId: string, start: number, end: number) {
    this.updateActivity()
    this.send({
      type: 'selection',
      userId: this.config.userId,
      data: { elementId, start, end },
      timestamp: new Date()
    })
  }
  
  /**
   * Send edit operation
   */
  sendEdit(operation: any, version?: number) {
    this.updateActivity()
    this.send({
      type: 'edit',
      userId: this.config.userId,
      data: operation,
      timestamp: new Date(),
      version: version || this.documentVersion
    })
  }
  
  /**
   * Send comment
   */
  sendComment(comment: Partial<Comment>) {
    this.updateActivity()
    this.send({
      type: 'comment',
      userId: this.config.userId,
      data: {
        ...comment,
        id: comment.id || this.generateId(),
        userId: this.config.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolved: false,
        replies: []
      },
      timestamp: new Date()
    })
  }
  
  /**
   * Update user presence
   */
  updatePresence(data: Partial<Presence>) {
    this.updateActivity()
    const presence: Presence = {
      user: this.config.user,
      lastActive: new Date(),
      status: 'active',
      ...data
    }
    
    this.send({
      type: 'presence',
      userId: this.config.userId,
      data: presence,
      timestamp: new Date()
    })
  }
  
  /**
   * Get all active users
   */
  getActiveUsers(): Presence[] {
    return Array.from(this.presence.values()).filter(p => 
      p.status === 'active' && 
      Date.now() - p.lastActive.getTime() < this.config.idleTimeout!
    )
  }
  
  /**
   * Get user presence
   */
  getUserPresence(userId: string): Presence | undefined {
    return this.presence.get(userId)
  }
  
  /**
   * Private methods
   */
  private handleOpen() {
    this.isConnected = true
    
    // Send initial presence
    this.updatePresence({ status: 'active' })
    
    // Process queued messages
    while (this.messageQueue.length > 0) {
      const event = this.messageQueue.shift()
      if (event) this.send(event)
    }
    
    // Start heartbeat
    this.startHeartbeat()
    
    // Start idle detection
    this.startIdleDetection()
    
    this.emit('connected')
  }
  
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'presence':
          this.handlePresenceUpdate(data)
          break
          
        case 'cursor':
          this.emit('cursor', data)
          break
          
        case 'selection':
          this.emit('selection', data)
          break
          
        case 'edit':
          this.handleEdit(data)
          break
          
        case 'comment':
          this.emit('comment', data)
          break
          
        case 'sync':
          this.handleSync(data)
          break
          
        case 'error':
          this.handleServerError(data)
          break
          
        default:
          console.warn('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  }
  
  private handleClose() {
    this.isConnected = false
    this.clearTimers()
    this.emit('disconnected')
    this.scheduleReconnect()
  }
  
  private handleError(error: Event) {
    console.error('WebSocket error:', error)
    this.emit('error', error)
  }
  
  private handlePresenceUpdate(data: CollaborationEvent) {
    const presence = data.data as Presence
    
    if (data.userId === this.config.userId) return
    
    if (presence.status === 'away') {
      this.presence.delete(data.userId)
      this.emit('user-left', presence.user)
    } else {
      const isNew = !this.presence.has(data.userId)
      this.presence.set(data.userId, presence)
      
      if (isNew) {
        this.emit('user-joined', presence.user)
      }
    }
    
    this.emit('presence-update', this.getActiveUsers())
  }
  
  private handleEdit(data: CollaborationEvent) {
    // Check version for conflict resolution
    if (data.version && data.version < this.documentVersion) {
      // Conflict detected - request sync
      this.requestSync()
      return
    }
    
    this.documentVersion = data.version || this.documentVersion + 1
    this.emit('edit', data)
  }
  
  private handleSync(data: CollaborationEvent) {
    this.documentVersion = data.data.version
    this.emit('sync', data.data)
  }
  
  private handleServerError(data: any) {
    console.error('Server error:', data.error)
    this.emit('server-error', data.error)
  }
  
  private send(event: CollaborationEvent) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(event)
      return
    }
    
    try {
      this.ws.send(JSON.stringify(event))
    } catch (error) {
      console.error('Failed to send message:', error)
      this.messageQueue.push(event)
    }
  }
  
  private requestSync() {
    this.send({
      type: 'sync',
      userId: this.config.userId,
      data: { request: true, version: this.documentVersion },
      timestamp: new Date()
    })
  }
  
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'presence',
          userId: this.config.userId,
          data: { heartbeat: true },
          timestamp: new Date()
        })
      }
    }, this.config.heartbeatInterval)
  }
  
  private startIdleDetection() {
    this.idleTimer = setInterval(() => {
      const now = Date.now()
      const idleTime = now - this.lastActivity
      
      if (idleTime > this.config.idleTimeout!) {
        this.updatePresence({ status: 'idle' })
      } else if (idleTime > this.config.idleTimeout! * 2) {
        this.updatePresence({ status: 'away' })
      }
    }, 60000) // Check every minute
  }
  
  private updateActivity() {
    this.lastActivity = Date.now()
    
    // Update status if it was idle
    const currentPresence = this.presence.get(this.config.userId)
    if (currentPresence?.status !== 'active') {
      this.updatePresence({ status: 'active' })
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimer) return
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.config.reconnectDelay)
  }
  
  private clearTimers() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.idleTimer) {
      clearInterval(this.idleTimer)
      this.idleTimer = null
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
  
  private generateId(): string {
    return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
  }
}

/**
 * Operational Transform for conflict resolution
 */
export class OperationalTransform {
  /**
   * Transform operation A against operation B
   */
  static transform(opA: any, opB: any, priority: 'left' | 'right' = 'left'): [any, any] {
    // Simple implementation - extend based on operation types
    if (opA.type === 'insert' && opB.type === 'insert') {
      if (opA.position < opB.position || (opA.position === opB.position && priority === 'left')) {
        return [opA, { ...opB, position: opB.position + opA.text.length }]
      } else {
        return [{ ...opA, position: opA.position + opB.text.length }, opB]
      }
    }
    
    if (opA.type === 'delete' && opB.type === 'delete') {
      if (opA.position + opA.length <= opB.position) {
        return [opA, { ...opB, position: opB.position - opA.length }]
      } else if (opB.position + opB.length <= opA.position) {
        return [{ ...opA, position: opA.position - opB.length }, opB]
      } else {
        // Overlapping deletes - resolve conflict
        const start = Math.min(opA.position, opB.position)
        const end = Math.max(opA.position + opA.length, opB.position + opB.length)
        const newOp = { type: 'delete', position: start, length: end - start }
        return [newOp, { type: 'noop' }]
      }
    }
    
    // Add more transformation rules as needed
    return [opA, opB]
  }
  
  /**
   * Apply operation to document
   */
  static apply(doc: string, op: any): string {
    switch (op.type) {
      case 'insert':
        return doc.slice(0, op.position) + op.text + doc.slice(op.position)
        
      case 'delete':
        return doc.slice(0, op.position) + doc.slice(op.position + op.length)
        
      case 'noop':
        return doc
        
      default:
        console.warn('Unknown operation type:', op.type)
        return doc
    }
  }
}