/**
 * Affiliate Conversion Tracking API
 * Handles conversion tracking from purchase events
 */

import { NextRequest, NextResponse } from 'next/server'
import { affiliateSystem } from '@/lib/affiliates/affiliate-system'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      orderValue,
      productName,
      customerEmail,
      conversionType = 'sale'
    } = body

    if (!orderId || !orderValue) {
      return NextResponse.json(
        { error: 'Order ID and value are required' },
        { status: 400 }
      )
    }

    // Get affiliate tracking cookie
    const cookieStore = cookies()
    const affiliateCookie = cookieStore.get('vbl_aff')
    
    if (!affiliateCookie) {
      // No affiliate tracking cookie found
      return NextResponse.json(
        { message: 'No affiliate tracking found' },
        { status: 200 }
      )
    }

    let cookieData
    try {
      cookieData = JSON.parse(affiliateCookie.value)
    } catch {
      return NextResponse.json(
        { error: 'Invalid affiliate tracking data' },
        { status: 400 }
      )
    }

    // Check if cookie is still valid
    if (Date.now() > cookieData.expiresAt) {
      return NextResponse.json(
        { message: 'Affiliate tracking expired' },
        { status: 200 }
      )
    }

    // Track the conversion
    const commission = await affiliateSystem.trackConversion(cookieData, {
      type: conversionType,
      value: orderValue,
      orderId,
      productName,
      customerEmail
    })

    // Clear the affiliate cookie after conversion
    cookieStore.delete('vbl_aff')

    return NextResponse.json({
      success: true,
      commission: {
        id: commission.id,
        amount: commission.amount,
        rate: commission.rate,
        status: commission.status,
        affiliateId: commission.affiliateId
      },
      message: 'Conversion tracked successfully'
    })

  } catch (error) {
    console.error('Conversion tracking error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid tracking data' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}