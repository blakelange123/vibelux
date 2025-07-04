/**
 * React Hook for WebSocket Connection Management
 * Provides real-time data streaming and connection handling for VibeLux
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

export interface WebSocketMessage {
  type: string
  channel?: string
  data?: any
  timestamp?: number
}

export interface WebSocketHookOptions {
  url?: string
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
}

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastMessage: WebSocketMessage | null
  connectionId: string | null
}

export function useWebSocket(options: WebSocketHookOptions = {}) {
  const { getToken } = useAuth()
  const {
    url = 'ws://localhost:3002/ws',
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000
  } = options

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    connectionId: null
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  const subscriptionsRef = useRef<Set<string>>(new Set())
  const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  const connect = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Get authentication token
      const token = await getToken()
      const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url

      // Create WebSocket connection
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null
        }))
        reconnectCountRef.current = 0

        // Resubscribe to previous channels
        subscriptionsRef.current.forEach(channel => {
          subscribe(channel)
        })
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          setState(prev => ({ ...prev, lastMessage: message }))

          // Handle connection confirmation
          if (message.type === 'connected') {
            setState(prev => ({
              ...prev,
              connectionId: message.data?.clientId || null
            }))
          }

          // Route message to specific handlers
          const handlers = messageHandlersRef.current.get(message.type)
          if (handlers) {
            handlers.forEach(handler => handler(message.data))
          }

          // Route channel-specific messages
          if (message.channel) {
            const channelHandlers = messageHandlersRef.current.get(`channel:${message.channel}`)
            if (channelHandlers) {
              channelHandlers.forEach(handler => handler(message.data))
            }
          }

        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionId: null
        }))
        wsRef.current = null

        // Attempt reconnection if not manual close
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setState(prev => ({
          ...prev,
          error: 'Connection error',
          isConnecting: false
        }))
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to connect',
        isConnecting: false
      }))
    }
  }, [getToken, url, reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionId: null
    }))
  }, [])

  const scheduleReconnect = useCallback(() => {
    reconnectCountRef.current++
    
    setState(prev => ({
      ...prev,
      error: `Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`
    }))

    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, reconnectDelay)
  }, [connect, reconnectAttempts, reconnectDelay])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message')
      return false
    }

    try {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }))
      return true
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
      return false
    }
  }, [])

  const subscribe = useCallback((channel: string) => {
    subscriptionsRef.current.add(channel)
    
    if (state.isConnected) {
      return sendMessage({
        type: 'subscribe',
        channel
      })
    }
    return false
  }, [state.isConnected, sendMessage])

  const unsubscribe = useCallback((channel: string) => {
    subscriptionsRef.current.delete(channel)
    
    if (state.isConnected) {
      return sendMessage({
        type: 'unsubscribe',
        channel
      })
    }
    return false
  }, [state.isConnected, sendMessage])

  const addMessageHandler = useCallback((
    type: string,
    handler: (data: any) => void
  ) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set())
    }
    messageHandlersRef.current.get(type)!.add(handler)

    // Return cleanup function
    return () => {
      const handlers = messageHandlersRef.current.get(type)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          messageHandlersRef.current.delete(type)
        }
      }
    }
  }, [])

  const addChannelHandler = useCallback((
    channel: string,
    handler: (data: any) => void
  ) => {
    return addMessageHandler(`channel:${channel}`, handler)
  }, [addMessageHandler])

  const sendControl = useCallback((controlData: {
    fixtureId: string
    action: string
    value?: number
    zone?: string
  }) => {
    return sendMessage({
      type: 'control',
      data: controlData
    })
  }, [sendMessage])

  const ping = useCallback(() => {
    return sendMessage({ type: 'ping' })
  }, [sendMessage])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    // State
    ...state,
    subscriptions: Array.from(subscriptionsRef.current),
    
    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    sendControl,
    ping,
    
    // Event handlers
    addMessageHandler,
    addChannelHandler
  }
}