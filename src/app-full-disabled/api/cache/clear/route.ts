/**
 * Cache Management API
 * Provides cache clearing and invalidation endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { cacheManager } from '@/lib/cache/cache-manager'
import { CacheUtils } from '@/lib/cache/cache-decorators'

interface ClearCacheRequest {
  type: 'all' | 'namespace' | 'pattern' | 'key'
  target?: string
  keys?: string[]
  dryRun?: boolean
}

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    
    if (request.method === 'POST') {
      const body: ClearCacheRequest = await request.json()
      
      if (!body.type) {
        return NextResponse.json(
          { error: 'Cache clear type is required' },
          { status: 400 }
        )
      }

      let clearedCount = 0
      let operation = ''

      switch (body.type) {
        case 'all':
          if (!body.dryRun) {
            const success = await cacheManager.clearAll()
            clearedCount = success ? 1 : 0
          }
          operation = 'Clear all caches'
          break

        case 'namespace':
          if (!body.target) {
            return NextResponse.json(
              { error: 'Namespace target is required' },
              { status: 400 }
            )
          }
          if (!body.dryRun) {
            clearedCount = await cacheManager.invalidateNamespace(body.target)
          }
          operation = `Clear namespace: ${body.target}`
          break

        case 'pattern':
          if (!body.target) {
            return NextResponse.json(
              { error: 'Pattern target is required' },
              { status: 400 }
            )
          }
          if (!body.dryRun) {
            clearedCount = await cacheManager.invalidatePattern(body.target)
          }
          operation = `Clear pattern: ${body.target}`
          break

        case 'key':
          if (!body.keys || body.keys.length === 0) {
            return NextResponse.json(
              { error: 'Keys array is required' },
              { status: 400 }
            )
          }
          if (!body.dryRun) {
            clearedCount = await cacheManager.del(body.keys)
          }
          operation = `Clear ${body.keys.length} specific keys`
          break

        default:
          return NextResponse.json(
            { error: 'Invalid cache clear type' },
            { status: 400 }
          )
      }

      // Log the operation

      return NextResponse.json({
        success: true,
        operation,
        clearedCount,
        dryRun: body.dryRun || false,
        timestamp: Date.now(),
        performedBy: user.userId
      })

    } else if (request.method === 'DELETE') {
      // Quick clear endpoints
      const { searchParams } = new URL(request.url)
      const namespace = searchParams.get('namespace')
      const pattern = searchParams.get('pattern')
      
      let clearedCount = 0
      let operation = ''

      if (namespace) {
        clearedCount = await cacheManager.invalidateNamespace(namespace)
        operation = `Clear namespace: ${namespace}`
      } else if (pattern) {
        clearedCount = await cacheManager.invalidatePattern(pattern)
        operation = `Clear pattern: ${pattern}`
      } else {
        // Clear commonly stale namespaces
        const searchCleared = await CacheUtils.invalidateSearch()
        const apiCleared = await CacheUtils.invalidateApi()
        
        clearedCount = searchCleared + apiCleared
        operation = 'Clear search and API caches'
      }


      return NextResponse.json({
        success: true,
        operation,
        clearedCount,
        timestamp: Date.now(),
        performedBy: user.userId
      })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )

  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

export const POST = requireAdmin(handler)
export const DELETE = requireAdmin(handler)