import React from 'react';

interface PageAnalyticsProviderProps {
  children: React.ReactNode;
}

const PageAnalyticsProvider: React.FC<PageAnalyticsProviderProps> = ({ children }) => {
  // Stub implementation - analytics tracking would go here
  return <>{children}</>;
};

export default PageAnalyticsProvider;