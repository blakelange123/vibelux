/**
 * WebSocket Connection Status Indicator
 * Shows real-time connection status and statistics
 */

'use client'

import React from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

interface WebSocketStatusProps {
  showDetails?: boolean
  className?: string
}

export function WebSocketStatus({ showDetails = false, className = '' }: WebSocketStatusProps) {
  const { 
    isConnected, 
    isConnecting, 
    error, 
    connectionId, 
    subscriptions,
    lastMessage 
  } = useWebSocket()

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500'
    if (isConnecting) return 'bg-yellow-500'
    if (error) return 'bg-red-500'
    return 'bg-gray-400'
  }

  const getStatusText = () => {
    if (isConnected) return 'Connected'
    if (isConnecting) return 'Connecting...'
    if (error) return 'Error'
    return 'Disconnected'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status indicator */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {getStatusText()}
        </span>
      </div>

      {/* Detailed status */}
      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isConnected && connectionId && (
            <span>ID: {connectionId.slice(-8)}</span>
          )}
          {error && (
            <span className="text-red-500">{error}</span>
          )}
        </div>
      )}

      {/* Subscription count */}
      {isConnected && subscriptions.length > 0 && (
        <div className="text-xs text-blue-600 dark:text-blue-400">
          {subscriptions.length} channel{subscriptions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

interface WebSocketStatusBadgeProps {
  compact?: boolean
}

export function WebSocketStatusBadge({ compact = false }: WebSocketStatusBadgeProps) {
  const { isConnected, isConnecting, error } = useWebSocket()

  if (compact) {
    return (
      <div className={`w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-400' : 
        isConnecting ? 'bg-yellow-400' : 
        'bg-gray-400'
      }`} />
    )
  }

  return (
    <div className={`px-2 py-1 rounded text-xs font-medium ${
      isConnected 
        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
        : isConnecting
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }`}>
      {isConnected ? 'Live' : isConnecting ? 'Connecting' : 'Offline'}
    </div>
  )
}

interface WebSocketStatsProps {
  className?: string
}

export function WebSocketStats({ className = '' }: WebSocketStatsProps) {
  const { 
    isConnected,
    connectionId,
    subscriptions,
    lastMessage
  } = useWebSocket()

  if (!isConnected) {
    return (
      <div className={`text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <p>Not connected to real-time data</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">Connection:</span>
        <span className="font-mono text-green-600 dark:text-green-400">
          {connectionId?.slice(-12) || 'Unknown'}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">Subscriptions:</span>
        <span className="font-medium">
          {subscriptions.length}
        </span>
      </div>

      {subscriptions.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Channels:</span>
          <div className="flex flex-wrap gap-1">
            {subscriptions.map((channel, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      )}

      {lastMessage && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last: {lastMessage.type} {lastMessage.timestamp && (
            <span>({new Date(lastMessage.timestamp).toLocaleTimeString()})</span>
          )}
        </div>
      )}
    </div>
  )
}