/**
 * WebSocket Integration Tests
 * End-to-end tests for WebSocket server and client integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { wsServer } from '@/lib/websocket-server'
import { createMockInfluxClient, createMockDb, waitFor } from '../utils/test-helpers'

// Mock dependencies
jest.mock('@/lib/influxdb-client', () => ({
  influxClient: createMockInfluxClient()
}))

jest.mock('@/lib/db', () => ({
  db: createMockDb()
}))

jest.mock('@/lib/env-validator', () => ({
  env: {
    get: jest.fn((key: string) => {
      const envVars: Record<string, string> = {
        'CLERK_SECRET_KEY': 'test_sk_123456789',
        'NODE_ENV': 'test'
      }
      return envVars[key]
    })
  }
}))

// Mock Clerk
jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn().mockResolvedValue({
    sub: 'test_user_123',
    iat: Date.now(),
    exp: Date.now() + 3600000
  })
}))

describe('WebSocket Integration', () => {
  let serverPort: number
  let testClient: WebSocket
  let mockInfluxClient: any
  
  beforeAll(async () => {
    serverPort = 3003 // Use different port for testing
    mockInfluxClient = createMockInfluxClient()
    
    // Start WebSocket server
    await wsServer.start(serverPort)
    
    // Wait for server to be ready
    await waitFor(100)
  })

  afterAll(async () => {
    // Stop WebSocket server
    await wsServer.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Server Startup and Stats', () => {
    it('should start server successfully', () => {
      const stats = wsServer.getStats()
      
      expect(stats.isRunning).toBe(true)
      expect(stats.clientCount).toBe(0)
      expect(stats.authenticatedClients).toBe(0)
      expect(stats.channelCount).toBe(0)
    })

    it('should provide server statistics', () => {
      const stats = wsServer.getStats()
      
      expect(stats).toHaveProperty('isRunning')
      expect(stats).toHaveProperty('clientCount')
      expect(stats).toHaveProperty('authenticatedClients')
      expect(stats).toHaveProperty('channelCount')
      expect(stats).toHaveProperty('channels')
      
      expect(typeof stats.isRunning).toBe('boolean')
      expect(typeof stats.clientCount).toBe('number')
      expect(typeof stats.authenticatedClients).toBe('number')
      expect(typeof stats.channelCount).toBe('number')
      expect(typeof stats.channels).toBe('object')
    })
  })

  describe('Client Connection', () => {
    it('should accept client connections', (done) => {
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws`)
      
      testClient.onopen = () => {
        const stats = wsServer.getStats()
        expect(stats.clientCount).toBe(1)
        testClient.close()
        done()
      }
      
      testClient.onerror = (error) => {
        done(error)
      }
    })

    it('should handle client disconnection', (done) => {
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws`)
      
      testClient.onopen = () => {
        testClient.close()
      }
      
      testClient.onclose = () => {
        // Wait a bit for server to process disconnection
        setTimeout(() => {
          const stats = wsServer.getStats()
          expect(stats.clientCount).toBe(0)
          done()
        }, 50)
      }
      
      testClient.onerror = (error) => {
        done(error)
      }
    })

    it('should handle authenticated connections', (done) => {
      const token = 'test_token_123'
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws?token=${token}`)
      
      testClient.onopen = () => {
        // Wait for authentication processing
        setTimeout(() => {
          const stats = wsServer.getStats()
          expect(stats.authenticatedClients).toBeGreaterThan(0)
          testClient.close()
          done()
        }, 100)
      }
      
      testClient.onerror = (error) => {
        done(error)
      }
    })
  })

  describe('Message Handling', () => {
    beforeEach((done) => {
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws`)
      testClient.onopen = () => done()
      testClient.onerror = (error) => done(error)
    })

    afterEach(() => {
      if (testClient && testClient.readyState === WebSocket.OPEN) {
        testClient.close()
      }
    })

    it('should send welcome message on connection', (done) => {
      testClient.onmessage = (event) => {
        const message = JSON.parse(event.data)
        
        expect(message.type).toBe('connected')
        expect(message.data).toHaveProperty('clientId')
        expect(message.data).toHaveProperty('authenticated')
        expect(message.data).toHaveProperty('availableChannels')
        expect(Array.isArray(message.data.availableChannels)).toBe(true)
        
        done()
      }
    })

    it('should handle ping messages', (done) => {
      let messageCount = 0
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Skip welcome message
          const pingMessage = {
            type: 'ping',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(pingMessage))
        } else if (messageCount === 2) {
          // Check pong response
          const message = JSON.parse(event.data)
          expect(message.type).toBe('pong')
          expect(message).toHaveProperty('timestamp')
          done()
        }
      }
    })

    it('should handle channel subscription', (done) => {
      let messageCount = 0
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Skip welcome message, send subscription
          const subscribeMessage = {
            type: 'subscribe',
            channel: 'sensors:environmental',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(subscribeMessage))
        } else if (messageCount === 2) {
          // Check subscription confirmation
          const message = JSON.parse(event.data)
          expect(message.type).toBe('subscribed')
          expect(message.data.channel).toBe('sensors:environmental')
          
          // Verify server stats
          const stats = wsServer.getStats()
          expect(stats.channelCount).toBeGreaterThan(0)
          expect(stats.channels['sensors:environmental']).toBe(1)
          
          done()
        }
      }
    })

    it('should handle channel unsubscription', (done) => {
      let messageCount = 0
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Subscribe first
          const subscribeMessage = {
            type: 'subscribe',
            channel: 'sensors:environmental',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(subscribeMessage))
        } else if (messageCount === 2) {
          // Then unsubscribe
          const unsubscribeMessage = {
            type: 'unsubscribe',
            channel: 'sensors:environmental',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(unsubscribeMessage))
        } else if (messageCount === 3) {
          // Check unsubscription confirmation
          const message = JSON.parse(event.data)
          expect(message.type).toBe('unsubscribed')
          expect(message.data.channel).toBe('sensors:environmental')
          done()
        }
      }
    })

    it('should reject subscription to protected channels without auth', (done) => {
      let messageCount = 0
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Try to subscribe to protected channel
          const subscribeMessage = {
            type: 'subscribe',
            channel: 'controls:zone1',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(subscribeMessage))
        } else if (messageCount === 2) {
          // Should receive error
          const message = JSON.parse(event.data)
          expect(message.type).toBe('error')
          expect(message.data.message).toContain('Access denied')
          done()
        }
      }
    })

    it('should handle invalid message format', (done) => {
      let messageCount = 0
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Send invalid JSON
          testClient.send('invalid json message')
        } else if (messageCount === 2) {
          // Should receive error
          const message = JSON.parse(event.data)
          expect(message.type).toBe('error')
          expect(message.data.message).toContain('Invalid message format')
          done()
        }
      }
    })
  })

  describe('Data Streaming', () => {
    beforeEach((done) => {
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws`)
      testClient.onopen = () => done()
      testClient.onerror = (error) => done(error)
    })

    afterEach(() => {
      if (testClient && testClient.readyState === WebSocket.OPEN) {
        testClient.close()
      }
    })

    it('should stream sensor data to subscribed clients', (done) => {
      let messageCount = 0
      
      // Mock sensor data
      mockInfluxClient.getRecentEnvironmentalData.mockResolvedValue([
        {
          sensorId: 'test_sensor_001',
          type: 'temperature',
          value: 75.5,
          timestamp: Date.now()
        }
      ])
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Subscribe to sensor data
          const subscribeMessage = {
            type: 'subscribe',
            channel: 'sensors:environmental',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(subscribeMessage))
        } else if (messageCount === 2) {
          // Skip subscription confirmation
          return
        } else if (messageCount === 3) {
          // Should receive sensor data
          const message = JSON.parse(event.data)
          expect(message.type).toBe('sensor_data')
          expect(message.channel).toBe('sensors:environmental')
          expect(Array.isArray(message.data)).toBe(true)
          expect(message.data[0]).toHaveProperty('sensorId')
          expect(message.data[0]).toHaveProperty('type')
          expect(message.data[0]).toHaveProperty('value')
          done()
        }
      }
      
      // Trigger data streaming (normally happens automatically)
      setTimeout(() => {
        // This would be triggered by the server's streaming interval
        // For testing, we can verify the mock was called
        expect(mockInfluxClient.getRecentEnvironmentalData).toHaveBeenCalled()
      }, 100)
    })

    it('should send recent data when subscribing to a channel', (done) => {
      let messageCount = 0
      
      // Mock recent data
      mockInfluxClient.getRecentEnvironmentalData.mockResolvedValue([
        {
          sensorId: 'test_sensor_001',
          type: 'temperature',
          value: 72.0,
          timestamp: Date.now() - 60000
        }
      ])
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Subscribe to sensor data
          const subscribeMessage = {
            type: 'subscribe',
            channel: 'sensors:environmental',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(subscribeMessage))
        } else if (messageCount === 2) {
          // Should receive subscription confirmation
          const message = JSON.parse(event.data)
          expect(message.type).toBe('subscribed')
        } else if (messageCount === 3) {
          // Should receive recent data
          const message = JSON.parse(event.data)
          expect(message.type).toBe('recent_data')
          expect(message.channel).toBe('sensors:environmental')
          expect(Array.isArray(message.data)).toBe(true)
          done()
        }
      }
    })
  })

  describe('Control Commands', () => {
    beforeEach((done) => {
      // Use authenticated connection for control commands
      const token = 'test_token_123'
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws?token=${token}`)
      testClient.onopen = () => done()
      testClient.onerror = (error) => done(error)
    })

    afterEach(() => {
      if (testClient && testClient.readyState === WebSocket.OPEN) {
        testClient.close()
      }
    })

    it('should handle control commands from authenticated clients', (done) => {
      let messageCount = 0
      
      testClient.onmessage = (event) => {
        messageCount++
        
        if (messageCount === 1) {
          // Skip welcome message, send control command
          const controlMessage = {
            type: 'control',
            data: {
              fixtureId: 'fixture_001',
              action: 'dim',
              value: 75
            },
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(controlMessage))
        } else if (messageCount === 2) {
          // Should receive control response
          const message = JSON.parse(event.data)
          expect(message.type).toBe('control_response')
          expect(message.data).toHaveProperty('success')
          expect(message.data).toHaveProperty('message')
          done()
        }
      }
    })

    it('should reject control commands from unauthenticated clients', (done) => {
      // Create unauthenticated client
      const unauthClient = new WebSocket(`ws://localhost:${serverPort}/ws`)
      
      let messageCount = 0
      
      unauthClient.onopen = () => {
        unauthClient.onmessage = (event) => {
          messageCount++
          
          if (messageCount === 1) {
            // Skip welcome message, send control command
            const controlMessage = {
              type: 'control',
              data: {
                fixtureId: 'fixture_001',
                action: 'on'
              },
              timestamp: Date.now()
            }
            unauthClient.send(JSON.stringify(controlMessage))
          } else if (messageCount === 2) {
            // Should receive error
            const message = JSON.parse(event.data)
            expect(message.type).toBe('error')
            expect(message.data.message).toContain('Authentication required')
            unauthClient.close()
            done()
          }
        }
      }
      
      unauthClient.onerror = (error) => {
        done(error)
      }
    })
  })

  describe('Connection Management', () => {
    it('should handle multiple concurrent connections', async () => {
      const clients: WebSocket[] = []
      const connectionPromises: Promise<void>[] = []
      
      // Create 5 concurrent connections
      for (let i = 0; i < 5; i++) {
        const client = new WebSocket(`ws://localhost:${serverPort}/ws`)
        clients.push(client)
        
        const connectionPromise = new Promise<void>((resolve, reject) => {
          client.onopen = () => resolve()
          client.onerror = (error) => reject(error)
        })
        
        connectionPromises.push(connectionPromise)
      }
      
      // Wait for all connections
      await Promise.all(connectionPromises)
      
      // Verify server stats
      const stats = wsServer.getStats()
      expect(stats.clientCount).toBe(5)
      
      // Close all connections
      clients.forEach(client => client.close())
      
      // Wait for disconnections
      await waitFor(100)
      
      // Verify cleanup
      const finalStats = wsServer.getStats()
      expect(finalStats.clientCount).toBe(0)
    })

    it('should handle connection errors gracefully', (done) => {
      // Try to connect to wrong path
      const badClient = new WebSocket(`ws://localhost:${serverPort}/wrong-path`)
      
      badClient.onerror = () => {
        // Error is expected
        done()
      }
      
      badClient.onopen = () => {
        // Should not open
        done(new Error('Connection should have failed'))
      }
    })
  })

  describe('Performance', () => {
    it('should handle high message throughput', (done) => {
      testClient = new WebSocket(`ws://localhost:${serverPort}/ws`)
      
      let messagesSent = 0
      let messagesReceived = 0
      const totalMessages = 100
      
      testClient.onopen = () => {
        // Send many ping messages rapidly
        for (let i = 0; i < totalMessages; i++) {
          const pingMessage = {
            type: 'ping',
            timestamp: Date.now()
          }
          testClient.send(JSON.stringify(pingMessage))
          messagesSent++
        }
      }
      
      testClient.onmessage = (event) => {
        const message = JSON.parse(event.data)
        
        if (message.type === 'pong') {
          messagesReceived++
          
          if (messagesReceived === totalMessages) {
            expect(messagesReceived).toBe(messagesSent)
            testClient.close()
            done()
          }
        }
      }
      
      testClient.onerror = (error) => {
        done(error)
      }
    })

    it('should maintain stable performance under load', async () => {
      const startTime = Date.now()
      const clients: WebSocket[] = []
      
      // Create multiple connections and send messages
      for (let i = 0; i < 10; i++) {
        const client = new WebSocket(`ws://localhost:${serverPort}/ws`)
        clients.push(client)
        
        await new Promise<void>((resolve, reject) => {
          client.onopen = () => {
            // Send some messages
            for (let j = 0; j < 10; j++) {
              client.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
            }
            resolve()
          }
          client.onerror = reject
        })
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000)
      
      // Cleanup
      clients.forEach(client => client.close())
    })
  })
})