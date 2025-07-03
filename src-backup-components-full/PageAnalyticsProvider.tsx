'use client';

import React from 'react';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

interface PageAnalyticsProviderProps {
  children: React.ReactNode;
  enableTracking?: boolean;
}

export const PageAnalyticsProvider: React.FC<PageAnalyticsProviderProps> = ({ 
  children, 
  enableTracking = true 
}) => {
  // Initialize page analytics tracking
  usePageAnalytics(enableTracking);
  
  return <>{children}</>;
};