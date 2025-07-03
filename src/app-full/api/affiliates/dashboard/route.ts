/**
 * Affiliate Dashboard API
 * Provides dashboard metrics and analytics for affiliates
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { affiliateSystem } from '@/lib/affiliates/affiliate-system'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    
    // Get date range (default to last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')
    
    if (customStartDate) {
      startDate.setTime(new Date(customStartDate).getTime())
    }
    
    if (customEndDate) {
      endDate.setTime(new Date(customEndDate).getTime())
    }

    // Get user's affiliate account
    const affiliate = await affiliateSystem.getAffiliateByUserId(user.userId)
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate account not found' },
        { status: 404 }
      )
    }

    // Get dashboard data
    const dashboard = await affiliateSystem.getAffiliateDashboard(affiliate.id, {
      startDate,
      endDate
    })

    // Get recent activity
    const recentLinks = await affiliateSystem.getRecentLinks(affiliate.id, 5)
    const recentClicks = await affiliateSystem.getRecentClicks(affiliate.id, 10)
    const recentCommissions = await affiliateSystem.getRecentCommissions(affiliate.id, 5)

    // Calculate additional metrics
    const clickTrend = await affiliateSystem.getClickTrend(affiliate.id, 7) // Last 7 days
    const topSources = await affiliateSystem.getTopSources(affiliate.id, { startDate, endDate })
    const deviceBreakdown = await affiliateSystem.getDeviceBreakdown(affiliate.id, { startDate, endDate })

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        code: affiliate.affiliateCode,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
        cookieDuration: affiliate.cookieDuration,
        customDomain: affiliate.customDomain
      },
      metrics: dashboard.metrics,
      trends: {
        daily: dashboard.dailyStats,
        clicks: clickTrend,
        topSources,
        deviceBreakdown
      },
      recentActivity: {
        links: recentLinks,
        clicks: recentClicks,
        commissions: recentCommissions
      },
      topLinks: dashboard.topLinks,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Affiliate dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load affiliate dashboard' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)