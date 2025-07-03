import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.affiliateCode) {
      return NextResponse.json(
        { error: 'Affiliate code is required' },
        { status: 400 }
      );
    }
    
    // Find affiliate by code
    const affiliate = await db.affiliates.findByCode(data.affiliateCode);
    
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid or inactive affiliate code' },
        { status: 404 }
      );
    }
    
    // Generate click ID if not provided
    const clickId = data.clickId || generateClickId();
    
    // Create affiliate click record
    const click = await db.prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        clickId,
        linkId: data.linkId,
        ipAddress: data.ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: data.userAgent || request.headers.get('user-agent') || 'unknown',
        referrer: data.referrer,
        landingPage: data.landingPage,
        utmSource: data.source,
        utmMedium: data.medium,
        utmCampaign: data.campaign,
        deviceType: detectDeviceType(data.userAgent || request.headers.get('user-agent')),
        country: data.country,
        city: data.city
      }
    });
    
    // Set affiliate tracking cookie (30 days)
    const cookieStore = cookies();
    cookieStore.set('vl_aff', affiliate.code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    // Also set click ID cookie for conversion tracking
    cookieStore.set('vl_click', clickId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    // Update affiliate stats
    await db.prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: { increment: 1 },
        lastClickAt: new Date()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      clickId: click.clickId,
      trackingSet: true
    });
    
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

// GET endpoint to check tracking status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const affiliateCode = cookieStore.get('vl_aff')?.value;
    const clickId = cookieStore.get('vl_click')?.value;
    
    if (!affiliateCode) {
      return NextResponse.json({
        tracked: false,
        message: 'No affiliate tracking found'
      });
    }
    
    const affiliate = await db.affiliates.findByCode(affiliateCode);
    
    if (!affiliate) {
      return NextResponse.json({
        tracked: false,
        message: 'Invalid affiliate code'
      });
    }
    
    return NextResponse.json({
      tracked: true,
      affiliateCode: affiliate.code,
      affiliateName: affiliate.user.name,
      clickId,
      expiresIn: '30 days'
    });
    
  } catch (error) {
    console.error('Failed to check tracking status:', error);
    return NextResponse.json(
      { error: 'Failed to check tracking' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateClickId(): string {
  return `click_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 9)}`;
}

function detectDeviceType(userAgent: string | null): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}