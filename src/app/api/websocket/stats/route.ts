/**
 * WebSocket Server Statistics API
 * Provides real-time statistics about WebSocket connections
 */

import { NextResponse } from 'next/server'
import { requireAdmin, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { wsServer } from '@/lib/websocket-server'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    
    // Get WebSocket server statistics
    const stats = wsServer.getStats()
    
    // Add additional server information
    const serverInfo = {
      ...stats,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      timestamp: Date.now()
    }
    
    return NextResponse.json({
      server: serverInfo,
      user: {
        id: user.userId,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('WebSocket stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get WebSocket statistics' },
      { status: 500 }
    )
  }
}

export const GET = requireAdmin(handler)