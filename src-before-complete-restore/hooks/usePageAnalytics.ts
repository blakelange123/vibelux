'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface PageTrackingData {
  page: string;
  title: string;
  sessionId: string;
  referrer?: string;
  userAgent: string;
  duration?: number;
  interactions: {
    clicks: number;
    scrollDepth: number;
    formSubmissions: number;
    downloads: number;
  };
  deviceInfo: {
    type: 'desktop' | 'tablet' | 'mobile';
    os: string;
    browser: string;
    screenResolution: string;
  };
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr-session';
  
  let sessionId = sessionStorage.getItem('vibelux-session-id');
  if (!sessionId) {
    sessionId = `sess-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    sessionStorage.setItem('vibelux-session-id', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Get browser info
const getBrowserInfo = () => {
  if (typeof window === 'undefined') {
    return { browser: 'Unknown', os: 'Unknown' };
  }

  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return { browser, os };
};

export const usePageAnalytics = (enableTracking: boolean = true) => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [interactions, setInteractions] = useState({
    clicks: 0,
    scrollDepth: 0,
    formSubmissions: 0,
    downloads: 0
  });
  
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const hasTrackedView = useRef<boolean>(false);

  // Track scroll depth
  useEffect(() => {
    if (!enableTracking || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
        setInteractions(prev => ({ ...prev, scrollDepth: scrollPercent }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableTracking]);

  // Track clicks
  useEffect(() => {
    if (!enableTracking || typeof window === 'undefined') return;

    const handleClick = (event: MouseEvent) => {
      // Track downloads
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href') || target.closest('a')?.getAttribute('href');
      
      if (href && (href.includes('.pdf') || href.includes('.csv') || href.includes('.xlsx') || href.includes('download'))) {
        setInteractions(prev => ({ 
          ...prev, 
          downloads: prev.downloads + 1,
          clicks: prev.clicks + 1 
        }));
      } else {
        setInteractions(prev => ({ ...prev, clicks: prev.clicks + 1 }));
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enableTracking]);

  // Track form submissions
  useEffect(() => {
    if (!enableTracking || typeof window === 'undefined') return;

    const handleSubmit = () => {
      setInteractions(prev => ({ ...prev, formSubmissions: prev.formSubmissions + 1 }));
    };

    document.addEventListener('submit', handleSubmit);
    return () => document.removeEventListener('submit', handleSubmit);
  }, [enableTracking]);

  // Track page view and send analytics on page change
  useEffect(() => {
    if (!enableTracking || !isSignedIn || hasTrackedView.current) return;

    const trackPageView = async () => {
      try {
        const { browser, os } = getBrowserInfo();
        
        const trackingData: PageTrackingData = {
          page: pathname,
          title: document.title,
          sessionId: getSessionId(),
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
          interactions,
          deviceInfo: {
            type: getDeviceType(),
            os,
            browser,
            screenResolution: `${screen.width}x${screen.height}`
          }
        };

        await fetch('/api/analytics/page-usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData)
        });

        hasTrackedView.current = true;
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(trackPageView, 1000);
    return () => clearTimeout(timer);
  }, [pathname, enableTracking, isSignedIn, interactions]);

  // Send final analytics when leaving page
  useEffect(() => {
    if (!enableTracking || !isSignedIn) return;

    const handleBeforeUnload = async () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const { browser, os } = getBrowserInfo();
      
      const finalData: PageTrackingData = {
        page: pathname,
        title: document.title,
        sessionId: getSessionId(),
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        duration,
        interactions: {
          ...interactions,
          scrollDepth: maxScrollDepth.current
        },
        deviceInfo: {
          type: getDeviceType(),
          os,
          browser,
          screenResolution: `${screen.width}x${screen.height}`
        }
      };

      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/page-usage',
          JSON.stringify(finalData)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pathname, enableTracking, isSignedIn, interactions]);

  // Reset tracking data when page changes
  useEffect(() => {
    startTime.current = Date.now();
    maxScrollDepth.current = 0;
    hasTrackedView.current = false;
    setInteractions({
      clicks: 0,
      scrollDepth: 0,
      formSubmissions: 0,
      downloads: 0
    });
  }, [pathname]);

  return {
    interactions,
    sessionId: getSessionId(),
    trackEvent: (eventType: 'click' | 'download' | 'form_submit') => {
      if (!enableTracking) return;
      
      switch (eventType) {
        case 'click':
          setInteractions(prev => ({ ...prev, clicks: prev.clicks + 1 }));
          break;
        case 'download':
          setInteractions(prev => ({ 
            ...prev, 
            downloads: prev.downloads + 1,
            clicks: prev.clicks + 1 
          }));
          break;
        case 'form_submit':
          setInteractions(prev => ({ ...prev, formSubmissions: prev.formSubmissions + 1 }));
          break;
      }
    }
  };
};