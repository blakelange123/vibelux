/**
 * Enhanced Mobile Authentication Login Endpoint
 * Handles secure mobile app login with device fingerprinting and session management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSecureMobileSession, DeviceInfo } from '@/lib/mobile-auth-enhanced'
import { db } from '@/lib/db'
import { securityMiddleware } from '@/middleware/security'
import { z } from 'zod'

// Validate device info schema
const deviceInfoSchema = z.object({
  deviceId: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
  model: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().min(1)
})

// Validate login request
const loginRequestSchema = z.object({
  clerkId: z.string().min(1),
  deviceInfo: deviceInfoSchema
})

async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = loginRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { clerkId, deviceInfo } = validationResult.data

    // Rate limiting check (prevent brute force)
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    // TODO: Implement rate limiting with Redis
    // const isRateLimited = await checkRateLimit(clientIp, 'mobile_login', 5, 300) // 5 attempts per 5 minutes
    // if (isRateLimited) {
    //   return NextResponse.json(
    //     { error: 'Too many login attempts' },
    //     { status: 429 }
    //   )
    // }

    // Verify user exists in database
    const user = await db.users.findByClerkId(clerkId)
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          message: 'Please complete web registration first'
        },
        { status: 404 }
      )
    }

    // Check if user is allowed to use mobile app based on subscription
    if (user.subscriptionTier === 'FREE') {
      return NextResponse.json(
        { 
          error: 'Mobile access not available',
          message: 'Upgrade to Essential or higher for mobile app access'
        },
        { status: 403 }
      )
    }

    // Create secure mobile session with device fingerprinting
    const session = await createSecureMobileSession(clerkId, deviceInfo, request)
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create secure session' },
        { status: 500 }
      )
    }

    // Log successful login
    await db.usageRecords.create({
      userId: user.id,
      feature: 'mobile_auth',
      action: 'secure_login_success',
      metadata: {
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        sessionId: session.sessionId,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString()
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        permissions: getPermissionsForUser(user.role, user.subscriptionTier)
      },
      message: 'Secure mobile session created successfully'
    })

  } catch (error) {
    console.error('Mobile login error:', error)
    
    // Log failed attempt
    try {
      const body = await request.json().catch(() => ({}))
      if (body.deviceInfo?.deviceId) {
        await db.securityEvents.logFailedLogin({
          deviceId: body.deviceInfo.deviceId,
          reason: error instanceof Error ? error.message : 'Unknown error',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        })
      }
    } catch (logError) {
      console.error('Failed to log security event:', logError)
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// Helper to get user permissions
function getPermissionsForUser(role: string, tier: string): string[] {
  const permissions: string[] = ['view_dashboard']
  
  // Role-based permissions
  if (role === 'WORKER') {
    permissions.push('submit_reports', 'view_tasks', 'capture_photos', 'track_location')
  } else if (role === 'MANAGER' || role === 'ADMIN') {
    permissions.push('submit_reports', 'view_tasks', 'capture_photos', 'track_location', 'review_reports', 'manage_workers')
  }
  
  // Tier-based permissions
  if (tier === 'PROFESSIONAL' || tier === 'ENTERPRISE') {
    permissions.push('advanced_analytics', 'api_access')
  }
  
  if (tier === 'ENTERPRISE') {
    permissions.push('custom_integrations', 'white_label')
  }
  
  return [...new Set(permissions)]
}

export const POST = securityMiddleware(handler)