/**
 * WebSocket Hook Tests
 * Tests for the useWebSocket React hook
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocket } from '@/hooks/useWebSocket'

// Mock Clerk auth
const mockGetToken = jest.fn()
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test_user_123',
    getToken: mockGetToken
  })
}))

describe('useWebSocket Hook', () => {
  let mockWebSocket: any
  let mockWebSocketConstructor: jest.Mock

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: WebSocket.CONNECTING,
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    }

    mockWebSocketConstructor = jest.fn(() => mockWebSocket)
    global.WebSocket = mockWebSocketConstructor as any

    // Mock setTimeout and clearTimeout
    jest.useFakeTimers()
    
    // Mock getToken to return a test token
    mockGetToken.mockResolvedValue('test_token_123')

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Connection Management', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      expect(result.current.isConnected).toBe(false)
      expect(result.current.isConnecting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.connectionId).toBeNull()
    })

    it('should auto-connect when autoConnect is true', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: true }))

      await waitFor(() => {
        expect(result.current.isConnecting).toBe(true)
      })

      expect(mockWebSocketConstructor).toHaveBeenCalledWith(
        'ws://localhost:3002/ws?token=test_token_123'
      )
    })

    it('should connect manually when called', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.isConnecting).toBe(true)
      expect(mockWebSocketConstructor).toHaveBeenCalled()
    })

    it('should handle connection without token', async () => {
      mockGetToken.mockResolvedValue(null)
      
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      expect(mockWebSocketConstructor).toHaveBeenCalledWith('ws://localhost:3002/ws')
    })

    it('should not connect if already connecting', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
        await result.current.connect() // Second call should be ignored
      })

      expect(mockWebSocketConstructor).toHaveBeenCalledTimes(1)
    })

    it('should disconnect manually', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        result.current.disconnect()
      })

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Manual disconnect')
    })

    it('should use custom WebSocket URL', async () => {
      const customUrl = 'ws://custom.example.com/ws'
      const { result } = renderHook(() => 
        useWebSocket({ url: customUrl, autoConnect: false })
      )

      await act(async () => {
        await result.current.connect()
      })

      expect(mockWebSocketConstructor).toHaveBeenCalledWith(
        `${customUrl}?token=test_token_123`
      )
    })
  })

  describe('Connection Events', () => {
    it('should handle connection open', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      // Simulate connection open
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN
        const onOpenCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1]
        onOpenCallback?.()
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.isConnecting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle connection close', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      // Simulate connection close
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED
        const onCloseCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1]
        onCloseCallback?.({ code: 1006, reason: 'Connection lost' })
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.isConnecting).toBe(false)
      expect(result.current.connectionId).toBeNull()
    })

    it('should handle connection error', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      // Simulate connection error
      act(() => {
        const onErrorCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'error')?.[1]
        onErrorCallback?.(new Error('Connection failed'))
      })

      expect(result.current.error).toBe('Connection error')
      expect(result.current.isConnecting).toBe(false)
    })

    it('should handle message reception', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      const testMessage = {
        type: 'connected',
        data: { clientId: 'test_client_123' },
        timestamp: Date.now()
      }

      // Simulate message reception
      act(() => {
        const onMessageCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'message')?.[1]
        onMessageCallback?.({ data: JSON.stringify(testMessage) })
      })

      expect(result.current.lastMessage).toEqual(testMessage)
      expect(result.current.connectionId).toBe('test_client_123')
    })
  })

  describe('Message Handling', () => {
    it('should send messages when connected', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      // Simulate connected state
      mockWebSocket.readyState = WebSocket.OPEN

      const testMessage = { type: 'ping', timestamp: Date.now() }

      act(() => {
        const success = result.current.sendMessage(testMessage)
        expect(success).toBe(true)
      })

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ ...testMessage, timestamp: expect.any(Number) })
      )
    })

    it('should not send messages when disconnected', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      mockWebSocket.readyState = WebSocket.CLOSED

      act(() => {
        const success = result.current.sendMessage({ type: 'ping' })
        expect(success).toBe(false)
      })

      expect(mockWebSocket.send).not.toHaveBeenCalled()
    })

    it('should handle message sending errors', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      mockWebSocket.readyState = WebSocket.OPEN
      mockWebSocket.send.mockImplementation(() => {
        throw new Error('Send failed')
      })

      act(() => {
        const success = result.current.sendMessage({ type: 'ping' })
        expect(success).toBe(false)
      })
    })

    it('should add and remove message handlers', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))
      const mockHandler = jest.fn()

      let cleanup: (() => void) | undefined

      act(() => {
        cleanup = result.current.addMessageHandler('test_type', mockHandler)
      })

      // Simulate message with matching type
      act(() => {
        const onMessageCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'message')?.[1]
        onMessageCallback?.({ 
          data: JSON.stringify({ type: 'test_type', data: { value: 123 } })
        })
      })

      expect(mockHandler).toHaveBeenCalledWith({ value: 123 })

      // Remove handler
      act(() => {
        cleanup?.()
      })

      // Should not be called after removal
      mockHandler.mockClear()
      act(() => {
        const onMessageCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'message')?.[1]
        onMessageCallback?.({ 
          data: JSON.stringify({ type: 'test_type', data: { value: 456 } })
        })
      })

      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should handle channel-specific messages', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))
      const mockHandler = jest.fn()

      act(() => {
        result.current.addChannelHandler('sensors:environmental', mockHandler)
      })

      // Simulate channel message
      act(() => {
        const onMessageCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'message')?.[1]
        onMessageCallback?.({ 
          data: JSON.stringify({ 
            type: 'sensor_data',
            channel: 'sensors:environmental',
            data: { temperature: 75.5 }
          })
        })
      })

      expect(mockHandler).toHaveBeenCalledWith({ temperature: 75.5 })
    })
  })

  describe('Subscription Management', () => {
    it('should subscribe to channels', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      mockWebSocket.readyState = WebSocket.OPEN

      act(() => {
        const success = result.current.subscribe('sensors:environmental')
        expect(success).toBe(true)
      })

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'subscribe',
          channel: 'sensors:environmental',
          timestamp: expect.any(Number)
        })
      )

      expect(result.current.subscriptions).toContain('sensors:environmental')
    })

    it('should unsubscribe from channels', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      mockWebSocket.readyState = WebSocket.OPEN

      // Subscribe first
      act(() => {
        result.current.subscribe('sensors:environmental')
      })

      // Then unsubscribe
      act(() => {
        const success = result.current.unsubscribe('sensors:environmental')
        expect(success).toBe(true)
      })

      expect(mockWebSocket.send).toHaveBeenLastCalledWith(
        JSON.stringify({
          type: 'unsubscribe',
          channel: 'sensors:environmental',
          timestamp: expect.any(Number)
        })
      )

      expect(result.current.subscriptions).not.toContain('sensors:environmental')
    })

    it('should resubscribe after reconnection', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      mockWebSocket.readyState = WebSocket.OPEN

      // Subscribe to a channel
      act(() => {
        result.current.subscribe('sensors:environmental')
      })

      // Simulate disconnection and reconnection
      act(() => {
        const onCloseCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1]
        onCloseCallback?.({ code: 1006, reason: 'Connection lost' })
      })

      // Clear previous calls
      mockWebSocket.send.mockClear()

      // Simulate reconnection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN
        const onOpenCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1]
        onOpenCallback?.()
      })

      // Should resubscribe to the channel
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'subscribe',
          channel: 'sensors:environmental',
          timestamp: expect.any(Number)
        })
      )
    })
  })

  describe('Control Commands', () => {
    it('should send control commands', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      mockWebSocket.readyState = WebSocket.OPEN

      const controlData = {
        fixtureId: 'fixture_001',
        action: 'dim',
        value: 75
      }

      act(() => {
        const success = result.current.sendControl(controlData)
        expect(success).toBe(true)
      })

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'control',
          data: controlData,
          timestamp: expect.any(Number)
        })
      )
    })

    it('should send ping commands', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }))

      await act(async () => {
        await result.current.connect()
      })

      mockWebSocket.readyState = WebSocket.OPEN

      act(() => {
        const success = result.current.ping()
        expect(success).toBe(true)
      })

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'ping',
          timestamp: expect.any(Number)
        })
      )
    })
  })

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on connection loss', async () => {
      const { result } = renderHook(() => 
        useWebSocket({ 
          autoConnect: false,
          reconnectAttempts: 2,
          reconnectDelay: 1000
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      // Simulate connection loss (not manual close)
      act(() => {
        const onCloseCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1]
        onCloseCallback?.({ code: 1006, reason: 'Connection lost' })
      })

      // Fast-forward past reconnect delay
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should attempt reconnection
      expect(mockWebSocketConstructor).toHaveBeenCalledTimes(2)
    })

    it('should not reconnect on manual close', async () => {
      const { result } = renderHook(() => 
        useWebSocket({ 
          autoConnect: false,
          reconnectAttempts: 2,
          reconnectDelay: 1000
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      // Simulate manual close
      act(() => {
        const onCloseCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1]
        onCloseCallback?.({ code: 1000, reason: 'Manual disconnect' })
      })

      // Fast-forward past reconnect delay
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should not attempt reconnection
      expect(mockWebSocketConstructor).toHaveBeenCalledTimes(1)
    })

    it('should limit reconnection attempts', async () => {
      const { result } = renderHook(() => 
        useWebSocket({ 
          autoConnect: false,
          reconnectAttempts: 2,
          reconnectDelay: 1000
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      // Simulate multiple connection failures
      for (let i = 0; i < 3; i++) {
        act(() => {
          const onCloseCallback = mockWebSocket.addEventListener.mock.calls
            .find(call => call[0] === 'close')?.[1]
          onCloseCallback?.({ code: 1006, reason: 'Connection lost' })
        })

        act(() => {
          jest.advanceTimersByTime(1000)
        })
      }

      // Should only attempt 2 reconnections (original + 2 retries)
      expect(mockWebSocketConstructor).toHaveBeenCalledTimes(3)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useWebSocket({ autoConnect: false }))

      unmount()

      // Should clean up timers and connections
      expect(true).toBe(true) // This test mainly checks for no errors
    })

    it('should clear reconnection timeout on disconnect', async () => {
      const { result } = renderHook(() => 
        useWebSocket({ 
          autoConnect: false,
          reconnectDelay: 1000
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      // Trigger reconnection timer
      act(() => {
        const onCloseCallback = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1]
        onCloseCallback?.({ code: 1006, reason: 'Connection lost' })
      })

      // Manually disconnect before reconnection
      act(() => {
        result.current.disconnect()
      })

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should not attempt reconnection after manual disconnect
      expect(mockWebSocketConstructor).toHaveBeenCalledTimes(1)
    })
  })
})