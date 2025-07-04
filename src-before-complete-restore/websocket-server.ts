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

class VibeLuxWebSocketServer {
  private static instance: VibeLuxWebSocketServer
  private wss: WebSocketServer | null = null
  private server: any = null
  private clients: Map<string, WebSocketClient> = new Map()
  private channels: Map<string, Set<string>> = new Map()
  private dataStreamInterval: NodeJS.Timeout | null = null
  private isRunning = false

  private constructor() {}

  static getInstance(): VibeLuxWebSocketServer {
    if (!VibeLuxWebSocketServer.instance) {
      VibeLuxWebSocketServer.instance = new VibeLuxWebSocketServer()
    }
    return VibeLuxWebSocketServer.instance
  }

  /**
   * Start the WebSocket server
   */
  async start(port: number = 3002): Promise<boolean> {
    try {
      if (this.isRunning) {
        return true
      }

      // Create HTTP server for WebSocket upgrade
      this.server = createServer()
      
      // Create WebSocket server
      this.wss = new WebSocketServer({ 
        server: this.server,
        path: '/ws',
        perMessageDeflate: {
          zlibDeflateOptions: {
            level: 3,
            memLevel: 7
          }
        }
      })

      // Handle new connections
      this.wss.on('connection', this.handleConnection.bind(this))

      // Start HTTP server
      await new Promise<void>((resolve, reject) => {
        this.server.listen(port, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Start data streaming
      this.startDataStreaming()

      this.isRunning = true
      return true

    } catch (error) {
      console.error('❌ Failed to start WebSocket server:', error)
      return false
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: WebSocket, request: any) {
    const clientId = this.generateClientId()
    const url = parse(request.url || '', true)
    const token = url.query.token as string


    // Create client object
    const client: WebSocketClient = {
      id: clientId,
      ws,
      userId: '',
      subscriptions: new Set(),
      lastPing: Date.now(),
      authenticated: false
    }

    // Authenticate if token provided
    if (token) {
      try {
        const secretKey = env.get('CLERK_SECRET_KEY')
        if (secretKey) {
          const payload = await verifyToken(token, { secretKey })
          if (payload?.sub) {
            const user = await db.users.findByClerkId(payload.sub)
            if (user) {
              client.userId = user.id
              client.authenticated = true
            }
          }
        }
      } catch (error) {
        console.warn(`Authentication failed for client ${clientId}:`, error)
      }
    }

    this.clients.set(clientId, client)

    // Set up message handling
    ws.on('message', (data) => this.handleMessage(clientId, data))
    ws.on('close', () => this.handleDisconnection(clientId))
    ws.on('error', (error) => this.handleError(clientId, error))

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      data: {
        clientId,
        authenticated: client.authenticated,
        availableChannels: this.getAvailableChannels(client)
      },
      timestamp: Date.now()
    })

    // Set up ping/pong for connection health
    this.setupPingPong(clientId)
  }

  /**
   * Handle incoming messages from clients
   */
  private async handleMessage(clientId: string, data: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    try {
      const message: WebSocketMessage = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscribe(clientId, message.channel || '')
          break
          
        case 'unsubscribe':
          await this.handleUnsubscribe(clientId, message.channel || '')
          break
          
        case 'ping':
          client.lastPing = Date.now()
          this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() })
          break
          
        case 'control':
          await this.handleControl(clientId, message.data)
          break
          
        default:
          console.warn(`Unknown message type from ${clientId}: ${message.type}`)
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error)
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: Date.now()
      })
    }
  }

  /**
   * Handle client subscription to channels
   */
  private async handleSubscribe(clientId: string, channel: string) {
    const client = this.clients.get(clientId)
    if (!client) return

    // Check permissions for channel
    if (!this.hasChannelPermission(client, channel)) {
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: `Access denied to channel: ${channel}` },
        timestamp: Date.now()
      })
      return
    }

    // Add to subscriptions
    client.subscriptions.add(channel)
    
    // Add to channel mapping
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set())
    }
    this.channels.get(channel)!.add(clientId)


    // Send confirmation
    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { channel },
      timestamp: Date.now()
    })

    // Send recent data for the channel
    await this.sendRecentData(clientId, channel)
  }

  /**
   * Handle client unsubscription from channels
   */
  private async handleUnsubscribe(clientId: string, channel: string) {
    const client = this.clients.get(clientId)
    if (!client) return

    client.subscriptions.delete(channel)
    this.channels.get(channel)?.delete(clientId)


    this.sendToClient(clientId, {
      type: 'unsubscribed',
      data: { channel },
      timestamp: Date.now()
    })
  }

  /**
   * Handle lighting control commands
   */
  private async handleControl(clientId: string, controlData: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.authenticated) {
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Authentication required for controls' },
        timestamp: Date.now()
      })
      return
    }

    try {
      // Execute control command (integrate with existing control system)
      const result = await this.executeControl(client.userId, controlData)
      
      // Broadcast control event to relevant channels
      if (result.success) {
        const controlEvent: LiveDataMessage = {
          type: 'lighting_status',
          channel: `controls:${controlData.zone || controlData.fixtureId}`,
          data: {
            action: controlData.action,
            target: controlData.fixtureId || controlData.zone,
            value: controlData.value,
            userId: client.userId,
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          source: 'websocket_control'
        }

        this.broadcastToChannel(controlEvent.channel, controlEvent)
      }

      // Send response to client
      this.sendToClient(clientId, {
        type: 'control_response',
        data: result,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error(`Control error for client ${clientId}:`, error)
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Control command failed' },
        timestamp: Date.now()
      })
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId)
    if (!client) return


    // Remove from all channels
    for (const channel of client.subscriptions) {
      this.channels.get(channel)?.delete(clientId)
    }

    // Remove client
    this.clients.delete(clientId)
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(clientId: string, error: Error) {
    console.error(`WebSocket error for client ${clientId}:`, error)
  }

  /**
   * Start periodic data streaming
   */
  private startDataStreaming() {
    this.dataStreamInterval = setInterval(async () => {
      await this.streamSensorData()
      await this.streamLightingStatus()
      this.cleanupStaleConnections()
    }, 5000) // Stream every 5 seconds
  }

  /**
   * Stream sensor data to subscribed clients
   */
  private async streamSensorData() {
    try {
      const environmentalData = await influxClient.getRecentEnvironmentalData(undefined, 1)
      
      if (environmentalData.length > 0) {
        const message: LiveDataMessage = {
          type: 'sensor_data',
          channel: 'sensors:environmental',
          data: environmentalData,
          timestamp: Date.now(),
          source: 'influxdb'
        }

        this.broadcastToChannel('sensors:environmental', message)
      }
    } catch (error) {
      console.error('Error streaming sensor data:', error)
    }
  }

  /**
   * Stream lighting status to subscribed clients
   */
  private async streamLightingStatus() {
    try {
      const lightingData = await influxClient.getRecentLightingData(undefined, 1)
      
      if (lightingData.length > 0) {
        const message: LiveDataMessage = {
          type: 'lighting_status',
          channel: 'lighting:status',
          data: lightingData,
          timestamp: Date.now(),
          source: 'influxdb'
        }

        this.broadcastToChannel('lighting:status', message)
      }
    } catch (error) {
      console.error('Error streaming lighting data:', error)
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error)
      }
    }
  }

  /**
   * Broadcast message to all clients in a channel
   */
  private broadcastToChannel(channel: string, message: LiveDataMessage) {
    const clientIds = this.channels.get(channel)
    if (!clientIds) return

    for (const clientId of clientIds) {
      this.sendToClient(clientId, message)
    }
  }

  /**
   * Check if client has permission for channel
   */
  private hasChannelPermission(client: WebSocketClient, channel: string): boolean {
    // Public channels
    const publicChannels = ['sensors:environmental', 'lighting:status', 'system:alerts']
    if (publicChannels.includes(channel)) return true

    // Authenticated-only channels
    if (!client.authenticated) return false

    // User-specific channels
    if (channel.startsWith(`user:${client.userId}`)) return true

    // Control channels require authentication
    if (channel.startsWith('controls:')) return true

    return false
  }

  /**
   * Get available channels for client
   */
  private getAvailableChannels(client: WebSocketClient): string[] {
    const channels = ['sensors:environmental', 'lighting:status', 'system:alerts']
    
    if (client.authenticated) {
      channels.push(
        `user:${client.userId}`,
        'controls:*',
        'analytics:live'
      )
    }

    return channels
  }

  /**
   * Send recent data when client subscribes to channel
   */
  private async sendRecentData(clientId: string, channel: string) {
    try {
      let data = null

      if (channel === 'sensors:environmental') {
        data = await influxClient.getRecentEnvironmentalData(undefined, 1)
      } else if (channel === 'lighting:status') {
        data = await influxClient.getRecentLightingData(undefined, 1)
      }

      if (data && data.length > 0) {
        this.sendToClient(clientId, {
          type: 'recent_data',
          channel,
          data,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error(`Error sending recent data for ${channel}:`, error)
    }
  }

  /**
   * Execute lighting control command
   */
  private async executeControl(userId: string, controlData: any): Promise<any> {
    // Simulate control execution - integrate with actual hardware control
    return {
      success: true,
      message: `${controlData.action} executed successfully`,
      data: controlData
    }
  }

  /**
   * Set up ping/pong for connection health
   */
  private setupPingPong(clientId: string) {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId)
      if (!client || client.ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval)
        return
      }

      // Check if client is still responsive
      if (Date.now() - client.lastPing > 60000) {
        client.ws.terminate()
        clearInterval(interval)
      }
    }, 30000) // Check every 30 seconds
  }

  /**
   * Clean up stale connections
   */
  private cleanupStaleConnections() {
    const now = Date.now()
    const staleClients = []

    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState !== WebSocket.OPEN || now - client.lastPing > 120000) {
        staleClients.push(clientId)
      }
    }

    for (const clientId of staleClients) {
      this.handleDisconnection(clientId)
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return


    // Clear data streaming
    if (this.dataStreamInterval) {
      clearInterval(this.dataStreamInterval)
    }

    // Close all client connections
    for (const [clientId, client] of this.clients) {
      client.ws.close()
    }

    // Close server
    if (this.wss) {
      this.wss.close()
    }

    if (this.server) {
      this.server.close()
    }

    this.isRunning = false
  }

  /**
   * Get server statistics
   */
  getStats(): any {
    return {
      isRunning: this.isRunning,
      clientCount: this.clients.size,
      authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
      channelCount: this.channels.size,
      channels: Object.fromEntries(
        Array.from(this.channels.entries()).map(([channel, clients]) => [channel, clients.size])
      )
    }
  }
}

// Export singleton instance
export const wsServer = VibeLuxWebSocketServer.getInstance()

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  wsServer.start().catch(console.error)
}

export default wsServer