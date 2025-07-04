/**
 * Affiliate Tracking Pixel
 * 1x1 pixel for tracking impressions and additional analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { affiliateSystem } from '@/lib/affiliates/affiliate-system'

// 1x1 transparent pixel in base64
const PIXEL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params
    
    // Get request information
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

    // Track pixel impression (non-blocking)
    setImmediate(async () => {
      try {
        await affiliateSystem.trackPixelImpression(linkId, {
          ipAddress,
          userAgent,
          referrer,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Pixel tracking error:', error)
      }
    })

    // Return 1x1 transparent pixel
    const pixelBuffer = Buffer.from(PIXEL_DATA, 'base64')
    
    return new NextResponse(pixelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixelBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Tracking pixel error:', error)
    
    // Still return pixel even if tracking fails
    const pixelBuffer = Buffer.from(PIXEL_DATA, 'base64')
    
    return new NextResponse(pixelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixelBuffer.length.toString()
      }
    })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}