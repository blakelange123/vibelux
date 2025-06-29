import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate mock analytics data
    const mockAnalytics = {
      overview: {
        totalRevenue: 284750,
        revenueGrowth: 15.7,
        totalUsers: 12547,
        userGrowth: 12.3,
        activeUsers: 8908,
        conversionRate: 6.2,
        avgRevenuePerUser: 22.67,
        churnRate: 2.3
      },
      revenue: {
        monthly: [
          { month: 'Oct', revenue: 85200 },
          { month: 'Nov', revenue: 92150 },
          { month: 'Dec', revenue: 107400 }
        ],
        bySubscription: [
          { tier: 'Free', revenue: 0, users: 7528 },
          { tier: 'Professional', revenue: 113900, users: 3137 },
          { tier: 'Enterprise', revenue: 170850, users: 1882 }
        ],
        projectedRevenue: 356250
      },
      users: {
        demographics: [
          { country: 'United States', users: 5646, revenue: 128137 },
          { country: 'Canada', users: 1506, revenue: 34170 },
          { country: 'United Kingdom', users: 1004, revenue: 22780 },
          { country: 'Germany', users: 753, revenue: 17085 },
          { country: 'Australia', users: 627, revenue: 14238 }
        ],
        acquisition: [
          { source: 'Google Search', users: 4391, conversionRate: 6.2 },
          { source: 'Direct', users: 3137, conversionRate: 8.1 },
          { source: 'Social Media', users: 2509, conversionRate: 4.8 },
          { source: 'Referral', users: 1882, conversionRate: 7.5 },
          { source: 'Email', users: 628, conversionRate: 9.2 }
        ],
        retention: [
          { cohort: 'Week 1', rate: 85.2 },
          { cohort: 'Month 1', rate: 72.1 },
          { cohort: 'Month 3', rate: 65.8 },
          { cohort: 'Month 6', rate: 58.9 },
          { cohort: 'Year 1', rate: 52.3 }
        ]
      },
      activity: {
        pageViews: [
          { page: '/design', views: 28858, avgTime: '4m 32s' },
          { page: '/dashboard', views: 22585, avgTime: '3m 15s' },
          { page: '/calculator', views: 18821, avgTime: '5m 42s' },
          { page: '/reports', views: 11292, avgTime: '6m 18s' },
          { page: '/settings', views: 7528, avgTime: '2m 8s' }
        ],
        features: [
          { feature: 'Lighting Designer', usage: 10038, satisfaction: 87 },
          { feature: 'PPFD Calculator', usage: 7528, satisfaction: 92 },
          { feature: 'Heat Load Calculator', usage: 5019, satisfaction: 85 },
          { feature: 'Report Generator', usage: 3764, satisfaction: 89 },
          { feature: 'Multi-Site Manager', usage: 2509, satisfaction: 78 }
        ],
        errors: [
          { type: 'API Timeout', count: 12, affected: 8 },
          { type: 'Calculation Error', count: 5, affected: 5 },
          { type: 'UI Glitch', count: 18, affected: 14 }
        ]
      },
      geographic: {
        countries: [
          { country: 'United States', countryCode: 'US', users: 5646, revenue: 128137, avgSessionDuration: 285 },
          { country: 'Canada', countryCode: 'CA', users: 1506, revenue: 34170, avgSessionDuration: 312 },
          { country: 'United Kingdom', countryCode: 'GB', users: 1004, revenue: 22780, avgSessionDuration: 267 },
          { country: 'Germany', countryCode: 'DE', users: 753, revenue: 17085, avgSessionDuration: 298 },
          { country: 'Australia', countryCode: 'AU', users: 627, revenue: 14238, avgSessionDuration: 251 }
        ],
        cities: [
          { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, users: 1506, sessions: 1882 },
          { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, users: 1004, sessions: 1255 },
          { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, users: 627, sessions: 753 },
          { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, users: 565, sessions: 628 },
          { city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, users: 314, sessions: 377 },
          { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, users: 314, sessions: 377 }
        ]
      },
      realtime: {
        activeUsers: 89,
        currentSessions: 134,
        pageViewsPerMinute: 42,
        conversionEvents: 6,
        satisfaction: 4.6
      }
    }

    return NextResponse.json(mockAnalytics)

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}