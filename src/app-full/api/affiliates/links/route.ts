/**
 * Affiliate Links API
 * Create and manage affiliate links
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { affiliateSystem } from '@/lib/affiliates/affiliate-system'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    
    if (request.method === 'POST') {
      // Create new affiliate link
      const body = await request.json()
      
      const {
        url,
        campaign,
        source,
        medium,
        content,
        customAlias,
        expiresIn,
        title,
        description,
        tags
      } = body

      if (!url) {
        return NextResponse.json(
          { error: 'URL is required' },
          { status: 400 }
        )
      }

      // Validate URL format
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }

      // Get user's affiliate account
      const affiliate = await affiliateSystem.getAffiliateByUserId(user.userId)
      if (!affiliate) {
        return NextResponse.json(
          { error: 'Affiliate account not found' },
          { status: 404 }
        )
      }

      if (affiliate.status !== 'active') {
        return NextResponse.json(
          { error: 'Affiliate account not active' },
          { status: 403 }
        )
      }

      // Generate the link
      const link = await affiliateSystem.generateLink(affiliate.id, {
        url,
        campaign,
        source,
        medium,
        content,
        customAlias,
        expiresIn,
        title,
        description,
        tags
      })

      // Generate platform-specific content
      const platformLinks = affiliateSystem.generatePlatformLinks(
        affiliate.affiliateCode,
        { website: url }
      )

      // Build the actual affiliate URL
      const affiliateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/go/${link.shortCode}`

      return NextResponse.json({
        link: {
          id: link.id,
          shortCode: link.shortCode,
          originalUrl: link.originalUrl,
          affiliateUrl,
          customAlias: link.customAlias,
          campaign: link.campaign,
          source: link.source,
          medium: link.medium,
          content: link.content,
          isActive: link.isActive,
          expiresAt: link.expiresAt,
          stats: link.stats,
          createdAt: link.createdAt
        },
        platformContent: platformLinks,
        trackingPixel: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/api/affiliates/pixel/${link.id}.png`
      })

    } else if (request.method === 'GET') {
      // Get affiliate's links
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const campaign = searchParams.get('campaign')
      const active = searchParams.get('active')

      // Get user's affiliate account
      const affiliate = await affiliateSystem.getAffiliateByUserId(user.userId)
      if (!affiliate) {
        return NextResponse.json(
          { error: 'Affiliate account not found' },
          { status: 404 }
        )
      }

      const filters = {
        affiliateId: affiliate.id,
        campaign: campaign || undefined,
        isActive: active ? active === 'true' : undefined
      }

      const { links, total } = await affiliateSystem.getAffiliateLinks(
        filters,
        { page, limit }
      )

      // Add full URLs to response
      const enrichedLinks = links.map(link => ({
        ...link,
        affiliateUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/go/${link.shortCode}`
      }))

      return NextResponse.json({
        links: enrichedLinks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )

  } catch (error) {
    console.error('Affiliate links API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Custom alias already exists' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('not active')) {
        return NextResponse.json(
          { error: 'Affiliate account not active' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to process affiliate link request' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(handler)
export const GET = requireAuth(handler)