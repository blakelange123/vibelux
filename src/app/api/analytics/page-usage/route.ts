import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface PageView {
  id: string;
  userId: string;
  sessionId: string;
  page: string;
  title: string;
  referrer?: string;
  userAgent: string;
  timestamp: string;
  duration?: number; // seconds spent on page
  interactions: {
    clicks: number;
    scrollDepth: number; // percentage
    formSubmissions: number;
    downloads: number;
  };
  deviceInfo: {
    type: 'desktop' | 'tablet' | 'mobile';
    os: string;
    browser: string;
    screenResolution: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
  };
}

interface PageAnalytics {
  page: string;
  title: string;
  views: number;
  uniqueUsers: number;
  averageDuration: number;
  bounceRate: number;
  conversionRate: number;
  topReferrers: Array<{
    source: string;
    views: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  timeAnalysis: {
    peakHours: Array<{
      hour: number;
      views: number;
    }>;
    dailyTrend: Array<{
      date: string;
      views: number;
      uniqueUsers: number;
    }>;
  };
  userJourney: Array<{
    fromPage: string;
    toPage: string;
    count: number;
    conversionRate: number;
  }>;
}

// Demo page analytics store (in production, this would be a time-series database)
const demoPageViews: PageView[] = [
  {
    id: 'pv-001',
    userId: 'user-123',
    sessionId: 'sess-abc123',
    page: '/',
    title: 'Vibelux - Home',
    referrer: 'https://google.com',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    interactions: { clicks: 3, scrollDepth: 75, formSubmissions: 0, downloads: 0 },
    deviceInfo: { type: 'desktop', os: 'macOS', browser: 'Chrome', screenResolution: '1920x1080' },
    location: { country: 'US', region: 'CA', city: 'San Francisco' }
  },
  {
    id: 'pv-002',
    userId: 'user-123',
    sessionId: 'sess-abc123',
    page: '/operations',
    title: 'Operations Center',
    referrer: '/',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
    duration: 180,
    interactions: { clicks: 12, scrollDepth: 90, formSubmissions: 0, downloads: 1 },
    deviceInfo: { type: 'desktop', os: 'macOS', browser: 'Chrome', screenResolution: '1920x1080' },
    location: { country: 'US', region: 'CA', city: 'San Francisco' }
  },
  {
    id: 'pv-003',
    userId: 'user-456',
    sessionId: 'sess-def456',
    page: '/investment',
    title: 'Investment Dashboard',
    referrer: 'https://linkedin.com',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    duration: 240,
    interactions: { clicks: 8, scrollDepth: 85, formSubmissions: 1, downloads: 2 },
    deviceInfo: { type: 'desktop', os: 'Windows', browser: 'Edge', screenResolution: '1920x1080' },
    location: { country: 'US', region: 'TX', city: 'Austin' }
  },
  {
    id: 'pv-004',
    userId: 'user-789',
    sessionId: 'sess-ghi789',
    page: '/marketplace',
    title: 'B2B Marketplace',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: 95,
    interactions: { clicks: 15, scrollDepth: 60, formSubmissions: 0, downloads: 0 },
    deviceInfo: { type: 'mobile', os: 'iOS', browser: 'Safari', screenResolution: '390x844' },
    location: { country: 'CA', region: 'ON', city: 'Toronto' }
  }
];

// Generate more realistic demo data
const generateDemoData = (days: number = 30): PageView[] => {
  const pages = [
    { path: '/', title: 'Vibelux - Home', weight: 25 },
    { path: '/operations', title: 'Operations Center', weight: 20 },
    { path: '/investment', title: 'Investment Dashboard', weight: 15 },
    { path: '/marketplace', title: 'B2B Marketplace', weight: 12 },
    { path: '/energy-dashboard', title: 'Energy Dashboard', weight: 10 },
    { path: '/operations/metrics', title: 'Operations Metrics', weight: 8 },
    { path: '/facility/performance', title: 'Facility Performance', weight: 7 },
    { path: '/workforce/analytics', title: 'Workforce Analytics', weight: 5 },
    { path: '/admin/analytics', title: 'Admin Analytics', weight: 3 },
    { path: '/operations/hmi', title: 'HMI Control', weight: 4 },
    { path: '/marketplace/produce', title: 'Produce Marketplace', weight: 6 },
    { path: '/compliance', title: 'Compliance Dashboard', weight: 4 },
    { path: '/pricing', title: 'Pricing', weight: 8 },
    { path: '/contact', title: 'Contact', weight: 3 }
  ];

  const referrers = [
    'https://google.com',
    'https://linkedin.com',
    'https://facebook.com',
    'https://twitter.com',
    'direct',
    'https://github.com',
    'https://reddit.com'
  ];

  const devices = [
    { type: 'desktop' as const, os: 'macOS', browser: 'Chrome', resolution: '1920x1080', weight: 60 },
    { type: 'desktop' as const, os: 'Windows', browser: 'Chrome', resolution: '1920x1080', weight: 25 },
    { type: 'mobile' as const, os: 'iOS', browser: 'Safari', resolution: '390x844', weight: 10 },
    { type: 'mobile' as const, os: 'Android', browser: 'Chrome', resolution: '412x915', weight: 5 }
  ];

  const locations = [
    { country: 'US', region: 'CA', city: 'San Francisco' },
    { country: 'US', region: 'NY', city: 'New York' },
    { country: 'US', region: 'TX', city: 'Austin' },
    { country: 'CA', region: 'ON', city: 'Toronto' },
    { country: 'GB', region: 'England', city: 'London' },
    { country: 'DE', region: 'Berlin', city: 'Berlin' },
    { country: 'AU', region: 'NSW', city: 'Sydney' }
  ];

  const data: PageView[] = [];
  const totalViews = days * 50; // ~50 views per day

  for (let i = 0; i < totalViews; i++) {
    const page = pages[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * pages.length)];
    const device = devices[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * devices.length)];
    const location = locations[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * locations.length)];
    const referrer = referrers[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * referrers.length)];
    
    // Create realistic timestamp distribution (more activity during business hours)
    const daysAgo = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * days);
    const hour = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 24);
    const hourWeight = hour >= 8 && hour <= 18 ? 3 : 1; // Business hours weight
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * hourWeight * 60 * 60 * 1000);

    data.push({
      id: `pv-${i + 100}`,
      userId: `user-${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100)}`,
      sessionId: `sess-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      page: page.path,
      title: page.title,
      referrer: referrer === 'direct' ? undefined : referrer,
      userAgent: `Mozilla/5.0 (${device.type === 'mobile' ? 'Mobile' : 'Desktop'})`,
      timestamp: timestamp.toISOString(),
      duration: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300 + 30), // 30-330 seconds
      interactions: {
        clicks: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20),
        scrollDepth: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100),
        formSubmissions: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.9 ? 1 : 0,
        downloads: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.95 ? 1 : 0
      },
      deviceInfo: {
        type: device.type,
        os: device.os,
        browser: device.browser,
        screenResolution: device.resolution
      },
      location
    });
  }

  return [...demoPageViews, ...data];
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions (in production, check user roles)
    // For demo, allow all authenticated users to view analytics
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const page = searchParams.get('page');
    const includeRealtime = searchParams.get('realtime') === 'true';

    // Generate comprehensive demo data
    const allPageViews = generateDemoData(parseInt(timeRange.replace('d', '')));
    
    // Filter by time range
    const cutoffDate = new Date(Date.now() - parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000);
    const filteredViews = allPageViews.filter(view => new Date(view.timestamp) >= cutoffDate);

    // Group by page
    const pageGroups = filteredViews.reduce((acc, view) => {
      if (!acc[view.page]) acc[view.page] = [];
      acc[view.page].push(view);
      return acc;
    }, {} as Record<string, PageView[]>);

    // Calculate analytics for each page
    const pageAnalytics: PageAnalytics[] = Object.entries(pageGroups).map(([pagePath, views]) => {
      const uniqueUsers = new Set(views.map(v => v.userId)).size;
      const totalDuration = views.reduce((sum, v) => sum + (v.duration || 0), 0);
      const averageDuration = totalDuration / views.length;
      
      // Calculate bounce rate (sessions with only one page view)
      const sessions = views.reduce((acc, view) => {
        if (!acc[view.sessionId]) acc[view.sessionId] = [];
        acc[view.sessionId].push(view);
        return acc;
      }, {} as Record<string, PageView[]>);
      
      const singlePageSessions = Object.values(sessions).filter(sessionViews => sessionViews.length === 1).length;
      const bounceRate = (singlePageSessions / Object.keys(sessions).length) * 100;

      // Referrer analysis
      const referrerCounts = views.reduce((acc, view) => {
        const ref = view.referrer || 'direct';
        acc[ref] = (acc[ref] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topReferrers = Object.entries(referrerCounts)
        .map(([source, count]) => ({
          source,
          views: count,
          percentage: (count / views.length) * 100
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Device breakdown
      const deviceCounts = views.reduce((acc, view) => {
        acc[view.deviceInfo.type] = (acc[view.deviceInfo.type] || 0) + 1;
        return acc;
      }, { desktop: 0, tablet: 0, mobile: 0 });

      // Time analysis
      const hourlyViews = views.reduce((acc, view) => {
        const hour = new Date(view.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakHours = Object.entries(hourlyViews)
        .map(([hour, count]) => ({ hour: parseInt(hour), views: count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 6);

      // Daily trend (last 7 days)
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayViews = views.filter(v => {
          const viewDate = new Date(v.timestamp);
          return viewDate.toDateString() === date.toDateString();
        });
        
        dailyData.push({
          date: date.toISOString().split('T')[0],
          views: dayViews.length,
          uniqueUsers: new Set(dayViews.map(v => v.userId)).size
        });
      }

      return {
        page: pagePath,
        title: views[0].title,
        views: views.length,
        uniqueUsers,
        averageDuration: Math.round(averageDuration),
        bounceRate: Math.round(bounceRate * 10) / 10,
        conversionRate: views.filter(v => v.interactions.formSubmissions > 0).length / views.length * 100,
        topReferrers,
        deviceBreakdown: deviceCounts,
        timeAnalysis: {
          peakHours,
          dailyTrend: dailyData
        },
        userJourney: [] // Would be calculated with session flow analysis
      };
    });

    // Sort by views
    pageAnalytics.sort((a, b) => b.views - a.views);

    // If specific page requested, return detailed analytics
    if (page) {
      const pageData = pageAnalytics.find(p => p.page === page);
      if (!pageData) {
        return NextResponse.json(
          { error: 'Page not found in analytics' },
          { status: 404 }
        );
      }
      return NextResponse.json({ page: pageData });
    }

    // Overall platform statistics
    const totalViews = filteredViews.length;
    const totalUsers = new Set(filteredViews.map(v => v.userId)).size;
    const avgSessionDuration = filteredViews.reduce((sum, v) => sum + (v.duration || 0), 0) / totalViews;

    // Real-time data (last hour)
    const realtimeData = includeRealtime ? {
      activeUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 + 10), // Mock real-time active users
      currentPageViews: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 5),
      topActivePages: pageAnalytics.slice(0, 5).map(p => ({
        page: p.page,
        title: p.title,
        activeUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 1)
      }))
    } : undefined;

    return NextResponse.json({
      summary: {
        totalViews,
        totalUsers,
        avgSessionDuration: Math.round(avgSessionDuration),
        timeRange,
        lastUpdated: new Date().toISOString()
      },
      pages: pageAnalytics,
      realtime: realtimeData,
      insights: {
        mostPopularPage: pageAnalytics[0],
        longestEngagement: pageAnalytics.sort((a, b) => b.averageDuration - a.averageDuration)[0],
        highestConversion: pageAnalytics.sort((a, b) => b.conversionRate - a.conversionRate)[0],
        mobileUsage: (filteredViews.filter(v => v.deviceInfo.type === 'mobile').length / totalViews) * 100
      }
    });
  } catch (error) {
    console.error('Error fetching page analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const trackingData = await request.json();
    
    // Validate required fields for page tracking
    const requiredFields = ['page', 'title', 'sessionId'];
    for (const field of requiredFields) {
      if (!trackingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new page view record
    const newPageView: PageView = {
      id: `pv-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      userId,
      sessionId: trackingData.sessionId,
      page: trackingData.page,
      title: trackingData.title,
      referrer: trackingData.referrer,
      userAgent: trackingData.userAgent || 'Unknown',
      timestamp: new Date().toISOString(),
      duration: trackingData.duration,
      interactions: trackingData.interactions || {
        clicks: 0,
        scrollDepth: 0,
        formSubmissions: 0,
        downloads: 0
      },
      deviceInfo: trackingData.deviceInfo || {
        type: 'desktop',
        os: 'Unknown',
        browser: 'Unknown',
        screenResolution: 'Unknown'
      },
      location: trackingData.location
    };

    // In production, this would save to time-series database
    demoPageViews.push(newPageView);

    return NextResponse.json({
      success: true,
      trackingId: newPageView.id,
      message: 'Page view tracked successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}