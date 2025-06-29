/**
 * Affiliate Tracking Middleware
 * Handles affiliate link clicks and cookie setting
 */

import { NextRequest, NextResponse } from 'next/server';
import { AffiliateCookieTracker, parseAffiliateParams, type AffiliateCookie } from '@/lib/affiliates/cookie-tracker';

export async function affiliateTrackingMiddleware(request: NextRequest) {
  const url = request.nextUrl;
  const response = NextResponse.next();
  
  // Check if URL has affiliate parameters
  const affiliateCode = url.searchParams.get('ref') || url.searchParams.get('aff');
  
  if (!affiliateCode) {
    return response;
  }
  
  try {
    // Parse all affiliate parameters
    const params = parseAffiliateParams(url.toString());
    
    // Generate unique IDs
    const clickId = `click_${Date.now()}_${(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF).toString(36).substring(7)}`;
    const linkId = `link_${affiliateCode}_${Date.now()}`;
    
    // Create tracking record (this would normally hit the database)
    const trackingData = {
      affiliateCode,
      clickId,
      linkId,
      ...params
    };
    
    // Log the click (in production, this would be an async database write)
    
    // Set affiliate cookie
    const cookieData: AffiliateCookie = {
      clickId,
      linkId,
    };
    
    // Set the cookie in the response
    const cookieValue = Buffer.from(JSON.stringify(cookieData)).toString('base64');
    const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
    
    response.cookies.set('vibelux_aff', cookieValue, {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Record the click asynchronously
    // Don't await to avoid blocking the response
    recordAffiliateClick(trackingData).catch(error => {
      console.error('Failed to record affiliate click:', error);
    });
    
    // Clean URL by removing affiliate parameters
    const cleanUrl = new URL(url);
    cleanUrl.searchParams.delete('ref');
    cleanUrl.searchParams.delete('aff');
    
    // Optionally keep UTM parameters for analytics
    // cleanUrl.searchParams.delete('utm_source');
    // cleanUrl.searchParams.delete('utm_medium');
    // cleanUrl.searchParams.delete('utm_campaign');
    // cleanUrl.searchParams.delete('utm_term');
    // cleanUrl.searchParams.delete('utm_content');
    
    // Redirect to clean URL if parameters were removed
    if (cleanUrl.toString() !== url.toString()) {
      return NextResponse.redirect(cleanUrl, {
        headers: response.headers
      });
    }
    
  } catch (error) {
    console.error('Affiliate tracking error:', error);
    // Don't block the request on error
  }
  
  return response;
}

/**
 * Record affiliate click in database
 */
async function recordAffiliateClick(data: any): Promise<void> {
  try {
    // In production, this would make an API call to record the click
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to record click: ${response.status}`);
    }
  } catch (error) {
    // Log but don't throw - we don't want to block the user
    console.error('Failed to record affiliate click:', error);
  }
}

/**
 * Conversion tracking helper
 * Call this when a conversion happens (signup, purchase, etc)
 */
export async function trackAffiliateConversion(
  customerId: string,
  conversionType: string,
  conversionValue: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Get affiliate cookie
    const cookie = await AffiliateCookieTracker.getCookie();
    
    if (!cookie) {
      return; // No affiliate attribution
    }
    
    // Check if cookie is expired
    if (AffiliateCookieTracker.isCookieExpired(cookie)) {
      return;
    }
    
    // Record conversion
    const conversionData = {
      customerId,
      conversionType,
      conversionValue,
      ...metadata
    };
    
    const response = await fetch('/api/affiliate/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversionData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to track conversion: ${response.status}`);
    }
    
    // Clear cookie after successful conversion
    await AffiliateCookieTracker.clearCookie();
    
  } catch (error) {
    console.error('Failed to track affiliate conversion:', error);
    // Don't throw - we don't want to break the conversion flow
  }
}

/**
 * Get current affiliate attribution
 * Use this to check if a user has affiliate attribution before conversion
 */
export async function getAffiliateAttribution(): Promise<{
  affiliateId?: string;
  daysRemaining?: number;
} | null> {
  try {
    const cookie = await AffiliateCookieTracker.getCookie();
    
    if (!cookie) {
      return null;
    }
    
    if (AffiliateCookieTracker.isCookieExpired(cookie)) {
      return null;
    }
    
    const daysRemaining = Math.floor(
      (cookie.timestamp + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return {
      affiliateId: cookie.affiliateId,
      daysRemaining
    };
  } catch (error) {
    console.error('Failed to get affiliate attribution:', error);
    return null;
  }
}

export default affiliateTrackingMiddleware;