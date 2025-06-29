/**
 * Mobile Authentication Middleware
 * Handles authentication for mobile API endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyMobileToken, validateMobileApiKey, MobileUser, hasPermission } from '@/lib/mobile-auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: MobileUser
}

/**
 * Middleware to authenticate mobile API requests
 */
export function withMobileAuth(
  options: {
    requirePermission?: string
    allowApiKey?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let user: MobileUser | null = null

      // Try JWT token authentication first
      user = await verifyMobileToken(request)

      // If JWT fails and API key auth is allowed, try API key
      if (!user && options.allowApiKey) {
        const apiKey = request.headers.get('X-API-Key') || 
                      request.headers.get('x-api-key') ||
                      new URL(request.url).searchParams.get('api_key')
        
        if (apiKey && await validateMobileApiKey(apiKey)) {
          // Create a basic user object for API key auth
          user = {
          }
        }
      }

      if (!user) {
        return NextResponse.json(
          { 
          },
          { status: 401 }
        )
      }

      // Check required permission
      if (options.requirePermission && !hasPermission(user, options.requirePermission)) {
        return NextResponse.json(
          { 
          },
          { status: 403 }
        )
      }

      // Add user to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = user

      // Call the handler
      return await handler(authenticatedRequest)

    } catch (error) {
      console.error('Mobile auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Quick authentication middleware for basic endpoints
 */
export function requireAuth(
) {
  return withMobileAuth(handler, { allowApiKey: true })
}

/**
 * Permission-based authentication middleware
 */
export function requirePermission(
) {
  return withMobileAuth(handler, { 
  })
}

/**
 * Admin-only authentication middleware
 */
export function requireAdmin(
) {
  return withMobileAuth(handler, {
  })
}

/**
 * Extract user from authenticated request
 */
export function getAuthenticatedUser(request: AuthenticatedRequest): MobileUser {
  if (!request.user) {
    throw new Error('Request not authenticated')
  }
  return request.user
}

/**
 * Check if user has specific subscription tier or higher
 */
export function hasSubscriptionTier(user: MobileUser, tier: 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'): boolean {
  const tierLevels = { 'FREE': 0, 'PROFESSIONAL': 1, 'ENTERPRISE': 2 }
  const userLevel = tierLevels[user.subscriptionTier as keyof typeof tierLevels] || 0
  const requiredLevel = tierLevels[tier]
  return userLevel >= requiredLevel
}

/**
 * Subscription tier requirement middleware
 */
export function requireSubscriptionTier(
) {
  return withMobileAuth(async (request: AuthenticatedRequest) => {
    const user = getAuthenticatedUser(request)
    
    if (!hasSubscriptionTier(user, tier)) {
      return NextResponse.json(
        { 
        },
        { status: 402 }
      )
    }

    return handler(request)
  }, { allowApiKey: true })
}