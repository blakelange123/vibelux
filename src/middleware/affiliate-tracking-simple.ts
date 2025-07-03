/**
 * Simplified Affiliate Tracking Middleware for Edge Runtime
 */

import { NextRequest, NextResponse } from 'next/server';

export async function affiliateTrackingMiddleware(request: NextRequest) {
  const url = request.nextUrl;
  const response = NextResponse.next();
  
  // Check if URL has affiliate parameters
  const affiliateCode = url.searchParams.get('ref') || url.searchParams.get('aff');
  
  if (!affiliateCode) {
    return response;
  }
  
  try {
    // Set affiliate cookie (simplified version)
    response.cookies.set('affiliate_ref', affiliateCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Also set a landing page cookie
    response.cookies.set('affiliate_landing', url.pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Clean URL by removing affiliate parameters
    url.searchParams.delete('ref');
    url.searchParams.delete('aff');
    
    // Redirect to clean URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('[Affiliate Middleware] Error:', error);
    return response;
  }
}

export default affiliateTrackingMiddleware;