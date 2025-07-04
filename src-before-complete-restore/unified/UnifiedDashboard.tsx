'use client';

import React, { Suspense, useMemo } from 'react';
import { getUserRole } from '@/lib/user-permissions';

// Dashboard content types
export type DashboardType = 
  | 'admin-ai' 
  | 'admin-financial' 
  | 'admin-map' 
  | 'admin-security'
  | 'analytics-advanced'
  | 'ai-usage'
  | 'alerts'
  | 'business-intelligence'
  | 'compliance'
  | 'cost-tracking'
  | 'energy-monitoring'
  | 'equipment'
  | 'financial'
  | 'industry-specific'
  | 'integrations'
  | 'marketplace'
  | 'operations'
  | 'performance'
  | 'referral'
  | 'revenue-sharing'
  | 'sustainability';

interface UnifiedDashboardProps {
  type: DashboardType;
  userRole?: string;
  facilityId?: string;
  className?: string;
  // Preserve any additional props that specific dashboards might need
  [key: string]: any;
}

// Loading component for dashboard content
const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

// Lazy load dashboard components to maintain performance
const DashboardComponents = {
  'admin-ai': React.lazy(() => import('../AdminAIOperationsDashboard').then(module => ({ 
    default: module.AdminAIOperationsDashboard || module.default 
  }))),
  'admin-financial': React.lazy(() => import('../AdminFinancialDashboard').then(module => ({ 
    default: module.AdminFinancialDashboard || module.default 
  }))),
  'admin-map': React.lazy(() => import('../AdminMapDashboard').then(module => ({ 
    default: module.AdminMapDashboard || module.default 
  }))),
  'admin-security': React.lazy(() => import('../AdminSecurityDashboard').then(module => ({ 
    default: module.AdminSecurityDashboard || module.default 
  }))),
  'analytics-advanced': React.lazy(() => import('../AdvancedAnalyticsDashboard').then(module => ({ 
    default: module.AdvancedAnalyticsDashboard || module.default 
  }))),
  'ai-usage': React.lazy(() => import('../AIUsageDashboard').then(module => ({ 
    default: module.AIUsageDashboard || module.default 
  }))),
  'alerts': React.lazy(() => import('../AlertDashboard').then(module => ({ 
    default: module.AlertDashboard || module.default 
  }))),
  'business-intelligence': React.lazy(() => import('../analytics/AdvancedAnalyticsDashboard').then(module => ({ 
    default: module.default 
  }))),
  'compliance': React.lazy(() => import('../ComplianceDashboard').then(module => ({ 
    default: module.ComplianceDashboard || module.default 
  }))),
  'cost-tracking': React.lazy(() => import('../CostTrackingDashboard').then(module => ({ 
    default: module.CostTrackingDashboard || module.default 
  }))),
  'energy-monitoring': React.lazy(() => import('../EnergyMonitoringDashboard').then(module => ({ 
    default: module.EnergyMonitoringDashboard || module.default 
  }))),
  'equipment': React.lazy(() => import('../EquipmentDashboard').then(module => ({ 
    default: module.EquipmentDashboard || module.default 
  }))),
  'financial': React.lazy(() => import('../FinancialDashboard').then(module => ({ 
    default: module.FinancialDashboard || module.default 
  }))),
  'industry-specific': React.lazy(() => import('../analytics/IndustrySpecificDashboard').then(module => ({ 
    default: module.default 
  }))),
  'integrations': React.lazy(() => import('../IntegrationsDashboard').then(module => ({ 
    default: module.IntegrationsDashboard || module.default 
  }))),
  'marketplace': React.lazy(() => import('../MarketplaceDashboard').then(module => ({ 
    default: module.MarketplaceDashboard || module.default 
  }))),
  'operations': React.lazy(() => import('../OperationsDashboard').then(module => ({ 
    default: module.OperationsDashboard || module.default 
  }))),
  'performance': React.lazy(() => import('../PerformanceDashboard').then(module => ({ 
    default: module.PerformanceDashboard || module.default 
  }))),
  'referral': React.lazy(() => import('../ReferralDashboard').then(module => ({ 
    default: module.ReferralDashboard || module.default 
  }))),
  'revenue-sharing': React.lazy(() => import('../RevenueSharingDashboard').then(module => ({ 
    default: module.RevenueSharingDashboard || module.default 
  }))),
  'sustainability': React.lazy(() => import('../SustainabilityDashboard').then(module => ({ 
    default: module.SustainabilityDashboard || module.default 
  })))
};

export function UnifiedDashboard({ 
  type, 
  userRole, 
  facilityId, 
  className = "",
  ...additionalProps 
}: UnifiedDashboardProps) {
  // Get the appropriate dashboard component
  const DashboardComponent = useMemo(() => {
    return DashboardComponents[type];
  }, [type]);

  // Get user role if not provided
  const resolvedUserRole = userRole || getUserRole();

  if (!DashboardComponent) {
    console.warn(`Dashboard type "${type}" not found. Available types:`, Object.keys(DashboardComponents));
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Dashboard Not Found</h3>
          <p className="text-yellow-700 text-sm mt-1">
            Dashboard type "{type}" is not available. Please check the dashboard type.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`unified-dashboard ${className}`}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardComponent 
          userRole={resolvedUserRole}
          facilityId={facilityId}
          {...additionalProps}
        />
      </Suspense>
    </div>
  );
}

// Export individual dashboard components for backward compatibility
export { DashboardComponents };

// Helper function to get available dashboard types
export function getAvailableDashboardTypes(): DashboardType[] {
  return Object.keys(DashboardComponents) as DashboardType[];
}

// Type guard for dashboard types
export function isDashboardType(type: string): type is DashboardType {
  return Object.keys(DashboardComponents).includes(type);
}