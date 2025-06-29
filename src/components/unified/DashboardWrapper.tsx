'use client';

import React from 'react';
import { useFeatureFlag, withFeatureFlag } from '@/lib/feature-flags';
import { UnifiedDashboard, DashboardType } from './UnifiedDashboard';

/**
 * Creates a backward-compatible wrapper for dashboard components
 * Allows gradual migration from individual dashboards to unified system
 */
export function createDashboardWrapper<T extends Record<string, any>>(
  dashboardType: DashboardType,
  LegacyComponent: React.ComponentType<T>
) {
  return function DashboardWrapper(props: T) {
    const useUnified = useFeatureFlag('unifiedDashboards');
    
    if (useUnified) {
      // Use new unified dashboard system
      return (
        <UnifiedDashboard 
          type={dashboardType}
          {...props}
        />
      );
    }
    
    // Use original legacy component
    return <LegacyComponent {...props} />;
  };
}

/**
 * Individual dashboard wrappers that preserve exact same APIs
 * These replace the original components with backward compatibility
 */

// Admin dashboards
export const AdminAIOperationsDashboard = createDashboardWrapper(
  'admin-ai',
  React.lazy(() => import('../admin/AdminAIOperationsDashboard'))
);

export const AdminFinancialDashboard = createDashboardWrapper(
  'admin-financial',
  React.lazy(() => import('../admin/AdminFinancialDashboard'))
);

export const AdminMapDashboard = createDashboardWrapper(
  'admin-map',
  React.lazy(() => import('../admin/AdminMapDashboard'))
);

export const AdminSecurityDashboard = createDashboardWrapper(
  'admin-security',
  React.lazy(() => import('../admin/AdminSecurityDashboard'))
);

// Analytics dashboards
export const AdvancedAnalyticsDashboard = createDashboardWrapper(
  'analytics-advanced',
  React.lazy(() => import('../AdvancedAnalyticsDashboard'))
);

export const AIUsageDashboard = createDashboardWrapper(
  'ai-usage',
  React.lazy(() => import('../AIUsageDashboard'))
);

// Core dashboards
export const AlertDashboard = createDashboardWrapper(
  'alerts',
  React.lazy(() => import('../AlertDashboard'))
);

export const EnergyMonitoringDashboard = createDashboardWrapper(
  'energy-monitoring',
  React.lazy(() => import('../EnergyMonitoringDashboard'))
);

export const FinancialDashboard = createDashboardWrapper(
  'financial',
  React.lazy(() => import('../automation/FinancialAutomationDashboard'))
);

export const OperationsDashboard = createDashboardWrapper(
  'operations',
  React.lazy(() => import('../OperationsDashboard'))
);

export const PerformanceDashboard = createDashboardWrapper(
  'performance',
  React.lazy(() => import('../PerformanceDashboard'))
);

export const ReferralDashboard = createDashboardWrapper(
  'referral',
  React.lazy(() => import('../ReferralDashboard'))
);

export const RevenueSharingDashboard = createDashboardWrapper(
  'revenue-sharing',
  React.lazy(() => import('../RevenueSharingDashboard'))
);

export const SustainabilityDashboard = createDashboardWrapper(
  'sustainability',
  React.lazy(() => import('../SustainabilityDashboard'))
);

// Specialized dashboards
export const ComplianceDashboard = createDashboardWrapper(
  'compliance',
  React.lazy(() => import('../ComplianceDashboard'))
);

export const MarketplaceDashboard = createDashboardWrapper(
  'marketplace',
  React.lazy(() => import('../MarketplaceDashboard'))
);

/**
 * Export all dashboard components for easy importing
 * This maintains the exact same import patterns as before
 */
export {
  UnifiedDashboard,
  type DashboardType
};

/**
 * Helper to dynamically get a dashboard component by type
 */
export function getDashboardComponent(type: DashboardType) {
  const dashboardMap = {
    'admin-ai': AdminAIOperationsDashboard,
    'admin-financial': AdminFinancialDashboard,
    'admin-map': AdminMapDashboard,
    'admin-security': AdminSecurityDashboard,
    'analytics-advanced': AdvancedAnalyticsDashboard,
    'ai-usage': AIUsageDashboard,
    'alerts': AlertDashboard,
    'energy-monitoring': EnergyMonitoringDashboard,
    'financial': FinancialDashboard,
    'operations': OperationsDashboard,
    'performance': PerformanceDashboard,
    'referral': ReferralDashboard,
    'revenue-sharing': RevenueSharingDashboard,
    'sustainability': SustainabilityDashboard,
    'compliance': ComplianceDashboard,
    'marketplace': MarketplaceDashboard,
  };
  
  return dashboardMap[type];
}