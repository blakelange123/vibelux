import { NextRequest, NextResponse } from 'next/server';

export async function affiliateTrackingMiddleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Check for affiliate code in query params
  const { searchParams } = new URL(req.url);
  const affiliateCode = searchParams.get('ref') || searchParams.get('affiliate');
  
  if (affiliateCode) {
    // Set affiliate cookie
    response.cookies.set('affiliate_code', affiliateCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Track affiliate visit
    try {
      await trackAffiliateVisit(affiliateCode, req);
    } catch (error) {
      console.error('Failed to track affiliate visit:', error);
    }
  }
  
  return response;
}

async function trackAffiliateVisit(affiliateCode: string, req: NextRequest) {
  // Add your affiliate tracking logic here
  const data = {
    affiliateCode,
    url: req.url,
    referrer: req.headers.get('referer'),
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  };
  
  // Log or send to analytics service
  console.log('Affiliate visit:', data);
}