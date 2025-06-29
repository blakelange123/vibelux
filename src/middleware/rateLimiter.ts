// Rate limiting middleware for AI endpoints
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMITS = {
  free: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  pro: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  enterprise: { requests: 1000, windowMs: 60 * 60 * 1000 } // 1000 per hour
}

async function getUserTier(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });
    return user?.subscriptionTier?.toLowerCase() || 'free';
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return 'free'; // Default to free on error
  }
}

export async function rateLimitAI(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user tier from database
    const userTier = await getUserTier(userId)
    const limits = RATE_LIMITS[userTier as keyof typeof RATE_LIMITS]
    
    const now = Date.now()
    const key = `${userId}-${userTier}`
    const entry = rateLimitStore.get(key)
    
    // Reset if window expired
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + limits.windowMs
      })
      return null // Allow request
    }
    
    // Check if limit exceeded
    if (entry.count >= limits.requests) {
      const resetInMinutes = Math.ceil((entry.resetTime - now) / 60000)
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetInMinutes
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limits.requests.toString(),
            'X-RateLimit-Remaining': Math.max(0, limits.requests - entry.count).toString(),
            'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
          }
        }
      )
    }
    
    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)
    
    return null // Allow request
    
  } catch (error) {
    console.error('Rate limiting error:', error)
    return null // Allow request on error
  }
}