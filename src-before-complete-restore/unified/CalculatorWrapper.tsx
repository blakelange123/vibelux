'use client';

import React from 'react';
import { useFeatureFlag } from '@/lib/feature-flags';
import { UnifiedCalculator, CalculatorType } from './UnifiedCalculator';

/**
 * Creates a backward-compatible wrapper for calculator components
 * Allows gradual migration from individual calculators to unified system
 */
export function createCalculatorWrapper<T extends Record<string, any>>(
  calculatorType: CalculatorType,
  LegacyComponent: React.ComponentType<T>
) {
  return function CalculatorWrapper(props: T) {
    const useUnified = useFeatureFlag('unifiedCalculators');
    
    if (useUnified) {
      // Use new unified calculator system
      return (
        <UnifiedCalculator 
          type={calculatorType}
          {...props}
        />
      );
    }
    
    // Use original legacy component
    return <LegacyComponent {...props} />;
  };
}

/**
 * Individual calculator wrappers that preserve exact same APIs
 * These replace the original components with backward compatibility
 */

// Environmental calculators
export const AdvancedDLICalculator = createCalculatorWrapper(
  'advanced-dli',
  React.lazy(() => import('../AdvancedDLICalculator'))
);

export const AdvancedHeatLoadCalculator = createCalculatorWrapper(
  'advanced-heat-load',
  React.lazy(() => import('../AdvancedHeatLoadCalculator'))
);

export const CO2EnrichmentCalculator = createCalculatorWrapper(
  'co2-enrichment',
  React.lazy(() => import('../CO2EnrichmentCalculator'))
);

export const PsychrometricCalculator = createCalculatorWrapper(
  'psychrometric',
  React.lazy(() => import('../PsychrometricCalculator'))
);

export const TranspirationCalculator = createCalculatorWrapper(
  'transpiration',
  React.lazy(() => import('../TranspirationCalculator'))
);

export const EnvironmentalControlCalculator = createCalculatorWrapper(
  'environmental-control',
  React.lazy(() => import('../EnvironmentalControlCalculator'))
);

// Financial calculators
export const AdvancedROICalculator = createCalculatorWrapper(
  'advanced-roi',
  React.lazy(() => import('../AdvancedROICalculator'))
);

export const TCOCalculator = createCalculatorWrapper(
  'tco',
  React.lazy(() => import('../TCOCalculator'))
);

export const EnergyCostCalculator = createCalculatorWrapper(
  'energy-cost',
  React.lazy(() => import('../EnergyCostCalculator'))
);

export const GHGEmissionsCalculator = createCalculatorWrapper(
  'ghg-emissions',
  React.lazy(() => import('../GHGEmissionsCalculator'))
);

export const UtilityRebateCalculator = createCalculatorWrapper(
  'utility-rebate',
  React.lazy(() => import('../UtilityRebateCalculator'))
);

export const EquipmentLeasingCalculator = createCalculatorWrapper(
  'equipment-leasing',
  React.lazy(() => import('../EquipmentLeasingCalculator'))
);

// Electrical calculators
export const GroundingSystemCalculator = createCalculatorWrapper(
  'grounding-system',
  React.lazy(() => import('../GroundingSystemCalculator'))
);

export const VoltageDropCalculator = createCalculatorWrapper(
  'voltage-drop',
  React.lazy(() => import('../VoltageDropCalculator'))
);

export const LPDCalculator = createCalculatorWrapper(
  'lpd',
  React.lazy(() => import('../LPDCalculator'))
);

// Photosynthetic calculators
export const PhotosyntheticCalculator = createCalculatorWrapper(
  'photosynthetic',
  React.lazy(() => import('../PhotosyntheticCalculator'))
);

export const CoverageAreaCalculator = createCalculatorWrapper(
  'coverage-area',
  React.lazy(() => import('../CoverageAreaCalculator'))
);

export const EnhancedCoverageAreaCalculator = createCalculatorWrapper(
  'enhanced-coverage-area',
  React.lazy(() => import('../EnhancedCoverageAreaCalculator'))
);

// Water calculators
export const FormulationCalculator = createCalculatorWrapper(
  'formulation',
  React.lazy(() => import('../FormulationCalculator'))
);

export const WaterUseEfficiencyCalculator = createCalculatorWrapper(
  'water-use-efficiency',
  React.lazy(() => import('../WaterUseEfficiencyCalculator'))
);

// Structural calculators
export const EnhancedNutrientCalculator = createCalculatorWrapper(
  'enhanced-nutrient',
  React.lazy(() => import('../EnhancedNutrientCalculator'))
);

/**
 * Export all calculator components for easy importing
 * This maintains the exact same import patterns as before
 */
export {
  UnifiedCalculator,
  type CalculatorType,
  type CalculatorCategory
} from './UnifiedCalculator';

export { CalculatorSuite } from './CalculatorSuite';

/**
 * Helper to dynamically get a calculator component by type
 */
export function getCalculatorComponent(type: CalculatorType) {
  const calculatorMap = {
    'advanced-dli': AdvancedDLICalculator,
    'advanced-heat-load': AdvancedHeatLoadCalculator,
    'co2-enrichment': CO2EnrichmentCalculator,
    'psychrometric': PsychrometricCalculator,
    'transpiration': TranspirationCalculator,
    'environmental-control': EnvironmentalControlCalculator,
    'advanced-roi': AdvancedROICalculator,
    'tco': TCOCalculator,
    'energy-cost': EnergyCostCalculator,
    'ghg-emissions': GHGEmissionsCalculator,
    'utility-rebate': UtilityRebateCalculator,
    'equipment-leasing': EquipmentLeasingCalculator,
    'grounding-system': GroundingSystemCalculator,
    'voltage-drop': VoltageDropCalculator,
    'lpd': LPDCalculator,
    'photosynthetic': PhotosyntheticCalculator,
    'coverage-area': CoverageAreaCalculator,
    'enhanced-coverage-area': EnhancedCoverageAreaCalculator,
    'formulation': FormulationCalculator,
    'water-use-efficiency': WaterUseEfficiencyCalculator,
    'enhanced-nutrient': EnhancedNutrientCalculator,
  };
  
  return calculatorMap[type];
}