/**
 * Feature flag system for safe component consolidation rollout
 * Allows gradual migration without breaking existing functionality
 */

import React from 'react';

export interface FeatureFlags {
  unifiedDashboards: boolean;
  unifiedCalculators: boolean;
  unifiedPanels: boolean;
  unifiedManagers: boolean;
  unifiedMonitors: boolean;
}

// Default feature flags - start with everything disabled for safety
const DEFAULT_FLAGS: FeatureFlags = {
  unifiedDashboards: false,
  unifiedCalculators: false,
  unifiedPanels: false,
  unifiedManagers: false,
  unifiedMonitors: false,
};

// Environment-based feature flags
const ENV_FLAGS: Partial<FeatureFlags> = {
  // Enable unified dashboards in development for testing
  unifiedDashboards: process.env.NODE_ENV === 'development' || process.env.ENABLE_UNIFIED_DASHBOARDS === 'true',
  // Enable unified calculators in development for testing
  unifiedCalculators: process.env.NODE_ENV === 'development' || process.env.ENABLE_UNIFIED_CALCULATORS === 'true',
  // Other flags can be enabled via environment variables
  unifiedPanels: process.env.ENABLE_UNIFIED_PANELS === 'true',
  unifiedManagers: process.env.ENABLE_UNIFIED_MANAGERS === 'true',
  unifiedMonitors: process.env.ENABLE_UNIFIED_MONITORS === 'true',
};

// Merge default flags with environment overrides
export const FEATURE_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  ...ENV_FLAGS,
};

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[flag];
}

/**
 * Get feature flag value directly
 */
export function getFeatureFlag(flag: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[flag];
}

/**
 * Enable a feature flag at runtime (useful for testing)
 */
export function enableFeatureFlag(flag: keyof FeatureFlags): void {
  FEATURE_FLAGS[flag] = true;
}

/**
 * Disable a feature flag at runtime (useful for rollback)
 */
export function disableFeatureFlag(flag: keyof FeatureFlags): void {
  FEATURE_FLAGS[flag] = false;
}

/**
 * Get all feature flags status
 */
export function getAllFeatureFlags(): FeatureFlags {
  return { ...FEATURE_FLAGS };
}

/**
 * Component wrapper that conditionally renders based on feature flag
 */
export function withFeatureFlag<T extends Record<string, any>>(
  flag: keyof FeatureFlags,
  UnifiedComponent: React.ComponentType<T>,
  LegacyComponent: React.ComponentType<T>
) {
  return function FeatureFlaggedComponent(props: T) {
    const isEnabled = useFeatureFlag(flag);
    
    if (isEnabled) {
      return React.createElement(UnifiedComponent, props);
    }
    
    return React.createElement(LegacyComponent, props);
  };
}