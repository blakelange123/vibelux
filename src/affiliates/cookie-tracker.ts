/**
 * Affiliate Cookie Tracking System
 * Handles first-party cookie tracking for affiliate referrals
 */

import { cookies } from 'next/headers';

export interface AffiliateCookie {
  affiliateId: string;
  clickId: string;
  linkId: string;
  timestamp: number;
  source?: string;
  medium?: string;
  campaign?: string;
}

export class AffiliateCookieTracker {
  private static readonly COOKIE_NAME = 'vibelux_aff';
  private static readonly COOKIE_DURATION = 30; // days
  
  /**
   * Set affiliate tracking cookie
   */
  static async setCookie(data: AffiliateCookie): Promise<void> {
    const cookieStore = cookies();
    
    const cookieValue = this.encodeCookie(data);
    const maxAge = this.COOKIE_DURATION * 24 * 60 * 60; // Convert days to seconds
    
    cookieStore.set(this.COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
      // Domain setting for cross-subdomain tracking
      domain: process.env.COOKIE_DOMAIN || undefined
    });
  }
  
  /**
   * Get affiliate tracking cookie
   */
  static async getCookie(): Promise<AffiliateCookie | null> {
    const cookieStore = cookies();
    const cookie = cookieStore.get(this.COOKIE_NAME);
    
    if (!cookie?.value) {
      return null;
    }
    
    try {
      return this.decodeCookie(cookie.value);
    } catch (error) {
      console.error('Failed to decode affiliate cookie:', error);
      return null;
    }
  }
  
  /**
   * Clear affiliate tracking cookie
   */
  static async clearCookie(): Promise<void> {
    const cookieStore = cookies();
    cookieStore.delete(this.COOKIE_NAME);
  }
  
  /**
   * Check if cookie has expired
   */
  static isCookieExpired(cookie: AffiliateCookie): boolean {
    const expirationTime = cookie.timestamp + (this.COOKIE_DURATION * 24 * 60 * 60 * 1000);
    return Date.now() > expirationTime;
  }
  
  /**
   * Encode cookie data
   */
  private static encodeCookie(data: AffiliateCookie): string {
    // Use base64 encoding to avoid issues with special characters
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
  }
  
  /**
   * Decode cookie data
   */
  private static decodeCookie(value: string): AffiliateCookie {
    const jsonString = Buffer.from(value, 'base64').toString('utf-8');
    return JSON.parse(jsonString);
  }
}

/**
 * Client-side cookie utilities
 * For use in browser environment
 */
export class AffiliateCookieClient {
  private static readonly COOKIE_NAME = 'vibelux_aff';
  private static readonly COOKIE_DURATION = 30; // days
  
  /**
   * Set affiliate cookie from client side
   */
  static setCookie(data: AffiliateCookie): void {
    const cookieValue = btoa(JSON.stringify(data));
    const expires = new Date();
    expires.setDate(expires.getDate() + this.COOKIE_DURATION);
    
    // Build cookie string
    let cookieString = `${this.COOKIE_NAME}=${cookieValue}`;
    cookieString += `; expires=${expires.toUTCString()}`;
    cookieString += '; path=/';
    cookieString += '; SameSite=Lax';
    
    if (window.location.protocol === 'https:') {
      cookieString += '; Secure';
    }
    
    // Set domain for cross-subdomain tracking if configured
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    if (cookieDomain) {
      cookieString += `; Domain=${cookieDomain}`;
    }
    
    document.cookie = cookieString;
  }
  
  /**
   * Get affiliate cookie from client side
   */
  static getCookie(): AffiliateCookie | null {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.COOKIE_NAME && value) {
        try {
          const jsonString = atob(value);
          return JSON.parse(jsonString);
        } catch (error) {
          console.error('Failed to parse affiliate cookie:', error);
          return null;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Clear affiliate cookie from client side
   */
  static clearCookie(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  
  /**
   * Update cookie timestamp (extend duration)
   */
  static refreshCookie(): void {
    const existingCookie = this.getCookie();
    if (existingCookie) {
      existingCookie.timestamp = Date.now();
      this.setCookie(existingCookie);
    }
  }
}

/**
 * Tracking pixel implementation
 * For cross-domain tracking
 */
export function generateTrackingPixel(
  affiliateId: string,
  linkId: string,
  clickId: string
): string {
  const params = new URLSearchParams({
    aid: affiliateId,
    lid: linkId,
    cid: clickId,
    t: Date.now().toString()
  });
  
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/pixel?${params.toString()}`;
}

/**
 * PostMessage handler for cross-domain tracking
 * Allows child iframes to communicate tracking data
 */
export class CrossDomainTracker {
  private static listeners: Set<(data: AffiliateCookie) => void> = new Set();
  
  static initialize(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('message', (event) => {
      // Verify origin
      const allowedOrigins = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '').split(',');
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }
      
      // Verify message type
      if (event.data?.type !== 'vibelux_affiliate_tracking') {
        return;
      }
      
      // Process tracking data
      const trackingData = event.data.payload as AffiliateCookie;
      if (trackingData) {
        // Set cookie
        AffiliateCookieClient.setCookie(trackingData);
        
        // Notify listeners
        this.listeners.forEach(listener => listener(trackingData));
      }
    });
  }
  
  static sendTrackingData(targetOrigin: string, data: AffiliateCookie): void {
    if (typeof window === 'undefined') return;
    
    window.postMessage({
      type: 'vibelux_affiliate_tracking',
      payload: data
    }, targetOrigin);
  }
  
  static onTrackingReceived(callback: (data: AffiliateCookie) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
}

/**
 * URL parameter parser for affiliate links
 */
export function parseAffiliateParams(url: string): {
  affiliateCode?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
} {
  const urlObj = new URL(url);
  const params = urlObj.searchParams;
  
  return {
    affiliateCode: params.get('ref') || params.get('aff') || undefined,
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined
  };
}

/**
 * Cookie consent checker
 * Ensures GDPR compliance
 */
export function canSetAffiliateCookie(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check for cookie consent
  // This should integrate with your cookie consent solution
  const consent = localStorage.getItem('cookie_consent');
  if (!consent) return false;
  
  try {
    const consentData = JSON.parse(consent);
    return consentData.marketing === true || consentData.analytics === true;
  } catch {
    return false;
  }
}

/**
 * Debug utilities for development
 */
export const AffiliateDebug = {
  logCookie(): void {
    if (typeof window === 'undefined') return;
    
    const cookie = AffiliateCookieClient.getCookie();
    
    if (cookie) {
      const remainingDays = Math.floor(
        (cookie.timestamp + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000)
      );
    }
  },
  
  simulateClick(affiliateCode: string): void {
    if (typeof window === 'undefined') return;
    
    const mockCookie: AffiliateCookie = {
      affiliateId: 'test_' + affiliateCode,
      clickId: 'click_' + Date.now(),
      linkId: 'link_' + Date.now(),
      timestamp: Date.now(),
      source: 'test',
      medium: 'debug',
      campaign: 'test_campaign'
    };
    
    AffiliateCookieClient.setCookie(mockCookie);
  },
  
  clearAll(): void {
    if (typeof window === 'undefined') return;
    
    AffiliateCookieClient.clearCookie();
  }
};

export default AffiliateCookieTracker;