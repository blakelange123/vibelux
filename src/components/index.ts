/**
 * Unified component exports with backward compatibility
 * This file maintains all existing imports while enabling gradual migration to unified components
 */

// =============================================================================
// UNIFIED DASHBOARD SYSTEM (NEW)
// =============================================================================
export { 
  UnifiedDashboard,
  type DashboardType,
  getAvailableDashboardTypes,
  isDashboardType 
} from './unified/UnifiedDashboard';

export {
  AdminAIOperationsDashboard,
  AdminFinancialDashboard, 
  AdminMapDashboard,
  AdminSecurityDashboard,
  AdvancedAnalyticsDashboard,
  AIUsageDashboard,
  AlertDashboard,
  EnergyMonitoringDashboard,
  FinancialDashboard,
  OperationsDashboard,
  PerformanceDashboard,
  ReferralDashboard,
  RevenueSharingDashboard,
  SustainabilityDashboard,
  ComplianceDashboard,
  MarketplaceDashboard,
  getDashboardComponent
} from './unified/DashboardWrapper';

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export {
  useFeatureFlag,
  getFeatureFlag,
  enableFeatureFlag,
  disableFeatureFlag,
  getAllFeatureFlags,
  withFeatureFlag,
  type FeatureFlags
} from '../lib/feature-flags';

// =============================================================================
// UNIFIED CALCULATOR SYSTEM (NEW)
// =============================================================================
export { 
  UnifiedCalculator,
  type CalculatorType,
  type CalculatorCategory,
  getAvailableCalculatorTypes,
  getCalculatorsByCategory,
  isCalculatorType,
  getCalculatorCategory
} from './unified/UnifiedCalculator';

export {
  CalculatorSuite,
  CALCULATOR_NAMES,
  CATEGORY_CONFIG
} from './unified/CalculatorSuite';

export {
  AdvancedDLICalculator,
  AdvancedHeatLoadCalculator,
  CO2EnrichmentCalculator,
  PsychrometricCalculator,
  TranspirationCalculator,
  EnvironmentalControlCalculator,
  AdvancedROICalculator,
  TCOCalculator,
  EnergyCostCalculator,
  GHGEmissionsCalculator,
  UtilityRebateCalculator,
  EquipmentLeasingCalculator,
  GroundingSystemCalculator,
  VoltageDropCalculator,
  LPDCalculator,
  PhotosyntheticCalculator,
  CoverageAreaCalculator,
  EnhancedCoverageAreaCalculator,
  FormulationCalculator,
  WaterUseEfficiencyCalculator,
  EnhancedNutrientCalculator,
  getCalculatorComponent
} from './unified/CalculatorWrapper';

// =============================================================================
// EXISTING COMPONENTS (PRESERVED FOR BACKWARD COMPATIBILITY)
// =============================================================================

// Note: All existing component exports are preserved below
// During migration, imports will gradually point to unified components
// but the API remains exactly the same

// Core Components
export { default as AIAssistant } from './AIAssistant';
export { default as AdvancedDesigner } from './AdvancedDesigner';
export { default as OpenAccessResearchLibrary } from './OpenAccessResearchLibrary';
export { default as EnhancedPaperCard } from './EnhancedPaperCard';

// Layout & Navigation
export { default as UnifiedNavigation } from './UnifiedNavigation';
export { ResponsiveLayoutWrapper } from './ResponsiveLayoutWrapper';
export { AppHeader } from './AppHeader';
export { Breadcrumbs } from './Breadcrumbs';

// Calculators (Will be consolidated in Phase 2)
export { default as AdvancedDLICalculator } from './AdvancedDLICalculator';
export { default as AdvancedHeatLoadCalculator } from './AdvancedHeatLoadCalculator';
export { default as AdvancedROICalculator } from './AdvancedROICalculator';
export { default as CO2EnrichmentCalculator } from './CO2EnrichmentCalculator';
export { default as CoverageAreaCalculator } from './CoverageAreaCalculator';
export { default as EnergyCostCalculator } from './EnergyCostCalculator';
export { default as EnvironmentalControlCalculator } from './EnvironmentalControlCalculator';
export { default as FormulationCalculator } from './FormulationCalculator';
export { default as GHGEmissionsCalculator } from './GHGEmissionsCalculator';
export { default as GroundingSystemCalculator } from './GroundingSystemCalculator';
export { default as LPDCalculator } from './LPDCalculator';
export { default as PhotosyntheticCalculator } from './PhotosyntheticCalculator';
export { default as PsychrometricCalculator } from './PsychrometricCalculator';
export { default as TCOCalculator } from './TCOCalculator';
export { default as TranspirationCalculator } from './TranspirationCalculator';
export { default as UtilityRebateCalculator } from './UtilityRebateCalculator';
export { default as VoltageDropCalculator } from './VoltageDropCalculator';
export { default as WaterUseEfficiencyCalculator } from './WaterUseEfficiencyCalculator';

// Panels (Will be consolidated in Phase 3)
export { default as CFDAnalysisPanel } from './CFDAnalysisPanel';
export { default as DLIOptimizerPanel } from './DLIOptimizerPanel';
export { default as EmergencyLightingPanel } from './EmergencyLightingPanel';
export { default as LEDControlPanel } from './LEDControlPanel';
export { default as SpectrumAnalysisPanel } from './SpectrumAnalysisPanel';
export { default as SpectrumVisualizationPanel } from './SpectrumVisualizationPanel';

// Managers (Will be consolidated in Phase 4)  
export { default as MultiSiteManager } from './MultiSiteManager';
export { default as MultiZoneClimateManager } from './MultiZoneClimateManager';
export { default as LightRecipeManager } from './LightRecipeManager';
export { default as WaterNutrientManager } from './WaterNutrientManager';

// Monitors (Will be consolidated in Phase 5)
export { default as RealTimeSensorMonitor } from './RealTimeSensorMonitor';
export { default as PerformanceMonitor } from './PerformanceMonitor';
export { default as PlantHealthMonitor } from './PlantHealthMonitor';

// Add more exports as needed...
// This file will be gradually updated as we consolidate components