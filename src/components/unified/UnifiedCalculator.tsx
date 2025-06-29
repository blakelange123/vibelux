'use client';

import React, { Suspense, useMemo } from 'react';

// Calculator categories and types
export type CalculatorCategory = 'environmental' | 'financial' | 'electrical' | 'photosynthetic' | 'water' | 'structural';

export type CalculatorType = 
  // Environmental calculators
  | 'advanced-dli'
  | 'advanced-heat-load' 
  | 'co2-enrichment'
  | 'psychrometric'
  | 'transpiration'
  | 'environmental-control'
  | 'plant-physiological-monitor'
  // Financial calculators
  | 'advanced-roi'
  | 'tco'
  | 'energy-cost'
  | 'ghg-emissions'
  | 'utility-rebate'
  | 'equipment-leasing'
  // Electrical calculators
  | 'grounding-system'
  | 'voltage-drop'
  | 'lpd'
  // Photosynthetic calculators
  | 'photosynthetic'
  | 'coverage-area'
  | 'enhanced-coverage-area'
  // Water calculators
  | 'formulation'
  | 'water-use-efficiency'
  // Structural calculators
  | 'enhanced-nutrient';

interface UnifiedCalculatorProps {
  type: CalculatorType;
  category?: CalculatorCategory;
  className?: string;
  // Preserve any additional props that specific calculators might need
  [key: string]: any;
}

// Loading component for calculator content
const CalculatorSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
    <div className="flex gap-4">
      <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

// Lazy load calculator components to maintain performance
const CalculatorComponents = {
  // Environmental calculators
  'advanced-dli': React.lazy(() => import('../AdvancedDLICalculator').then(module => ({ 
    default: module.default || module.AdvancedDLICalculator 
  }))),
  'advanced-heat-load': React.lazy(() => import('../AdvancedHeatLoadCalculator').then(module => ({ 
    default: module.default || module.AdvancedHeatLoadCalculator 
  }))),
  'co2-enrichment': React.lazy(() => import('../CO2EnrichmentCalculator').then(module => ({ 
    default: module.default || module.CO2EnrichmentCalculator 
  }))),
  'psychrometric': React.lazy(() => import('../PsychrometricCalculator').then(module => ({ 
    default: module.default || module.PsychrometricCalculator 
  }))),
  'transpiration': React.lazy(() => import('../TranspirationCalculator').then(module => ({ 
    default: module.default || module.TranspirationCalculator 
  }))),
  'environmental-control': React.lazy(() => import('../EnvironmentalControlCalculator').then(module => ({ 
    default: module.default || module.EnvironmentalControlCalculator 
  }))),
  'plant-physiological-monitor': React.lazy(() => import('../PlantPhysiologicalMonitor').then(module => ({ 
    default: module.default 
  }))),
  
  // Financial calculators
  'advanced-roi': React.lazy(() => import('../AdvancedROICalculator').then(module => ({ 
    default: module.default || module.AdvancedROICalculator 
  }))),
  'tco': React.lazy(() => import('../TCOCalculator').then(module => ({ 
    default: module.default || module.TCOCalculator 
  }))),
  'energy-cost': React.lazy(() => import('../EnergyCostCalculator').then(module => ({ 
    default: module.default || module.EnergyCostCalculator 
  }))),
  'ghg-emissions': React.lazy(() => import('../GHGEmissionsCalculator').then(module => ({ 
    default: module.default || module.GHGEmissionsCalculator 
  }))),
  'utility-rebate': React.lazy(() => import('../UtilityRebateCalculator').then(module => ({ 
    default: module.default || module.UtilityRebateCalculator 
  }))),
  'equipment-leasing': React.lazy(() => import('../EquipmentLeasingCalculator').then(module => ({ 
    default: module.default || module.EquipmentLeasingCalculator 
  }))),
  
  // Electrical calculators
  'grounding-system': React.lazy(() => import('../GroundingSystemCalculator').then(module => ({ 
    default: module.default || module.GroundingSystemCalculator 
  }))),
  'voltage-drop': React.lazy(() => import('../VoltageDropCalculator').then(module => ({ 
    default: module.default || module.VoltageDropCalculator 
  }))),
  'lpd': React.lazy(() => import('../LPDCalculator').then(module => ({ 
    default: module.default || module.LPDCalculator 
  }))),
  
  // Photosynthetic calculators
  'photosynthetic': React.lazy(() => import('../PhotosyntheticCalculator').then(module => ({ 
    default: module.default || module.PhotosyntheticCalculator 
  }))),
  'coverage-area': React.lazy(() => import('../CoverageAreaCalculator').then(module => ({ 
    default: module.default || module.CoverageAreaCalculator 
  }))),
  'enhanced-coverage-area': React.lazy(() => import('../EnhancedCoverageAreaCalculator').then(module => ({ 
    default: module.default || module.EnhancedCoverageAreaCalculator 
  }))),
  
  // Water calculators
  'formulation': React.lazy(() => import('../FormulationCalculator').then(module => ({ 
    default: module.default || module.FormulationCalculator 
  }))),
  'water-use-efficiency': React.lazy(() => import('../WaterUseEfficiencyCalculator').then(module => ({ 
    default: module.default || module.WaterUseEfficiencyCalculator 
  }))),
  
  // Structural calculators
  'enhanced-nutrient': React.lazy(() => import('../EnhancedNutrientCalculator').then(module => ({ 
    default: module.default || module.EnhancedNutrientCalculator 
  })))
};

// Calculator category mapping
const CALCULATOR_CATEGORIES: Record<CalculatorType, CalculatorCategory> = {
  // Environmental
  'advanced-dli': 'environmental',
  'advanced-heat-load': 'environmental',
  'co2-enrichment': 'environmental',
  'psychrometric': 'environmental',
  'transpiration': 'environmental',
  'environmental-control': 'environmental',
  'plant-physiological-monitor': 'environmental',
  
  // Financial
  'advanced-roi': 'financial',
  'tco': 'financial',
  'energy-cost': 'financial',
  'ghg-emissions': 'financial',
  'utility-rebate': 'financial',
  'equipment-leasing': 'financial',
  
  // Electrical
  'grounding-system': 'electrical',
  'voltage-drop': 'electrical',
  'lpd': 'electrical',
  
  // Photosynthetic
  'photosynthetic': 'photosynthetic',
  'coverage-area': 'photosynthetic',
  'enhanced-coverage-area': 'photosynthetic',
  
  // Water
  'formulation': 'water',
  'water-use-efficiency': 'water',
  
  // Structural
  'enhanced-nutrient': 'structural'
};

export function UnifiedCalculator({ 
  type, 
  category,
  className = "",
  ...additionalProps 
}: UnifiedCalculatorProps) {
  // Get the appropriate calculator component
  const CalculatorComponent = useMemo(() => {
    return CalculatorComponents[type];
  }, [type]);

  // Determine category if not provided
  const resolvedCategory = category || CALCULATOR_CATEGORIES[type];

  if (!CalculatorComponent) {
    console.warn(`Calculator type "${type}" not found. Available types:`, Object.keys(CalculatorComponents));
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Calculator Not Found</h3>
          <p className="text-yellow-700 text-sm mt-1">
            Calculator type "{type}" is not available. Please check the calculator type.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`unified-calculator calculator-${resolvedCategory} ${className}`}>
      <Suspense fallback={<CalculatorSkeleton />}>
        <CalculatorComponent 
          {...additionalProps}
        />
      </Suspense>
    </div>
  );
}

// Export calculator components for backward compatibility
export { CalculatorComponents };

// Helper function to get available calculator types
export function getAvailableCalculatorTypes(): CalculatorType[] {
  return Object.keys(CalculatorComponents) as CalculatorType[];
}

// Helper function to get calculators by category
export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorType[] {
  return Object.entries(CALCULATOR_CATEGORIES)
    .filter(([_, cat]) => cat === category)
    .map(([type, _]) => type as CalculatorType);
}

// Type guard for calculator types
export function isCalculatorType(type: string): type is CalculatorType {
  return Object.keys(CalculatorComponents).includes(type);
}

// Get calculator category
export function getCalculatorCategory(type: CalculatorType): CalculatorCategory {
  return CALCULATOR_CATEGORIES[type];
}