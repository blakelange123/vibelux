'use client';

import React, { useState, useMemo } from 'react';
import { UnifiedCalculator, CalculatorCategory, CalculatorType, getCalculatorsByCategory } from './UnifiedCalculator';
import { 
  Calculator, Thermometer, DollarSign, Zap, 
  Droplets, Building, ChevronDown, ChevronRight 
} from 'lucide-react';

interface CalculatorSuiteProps {
  category: CalculatorCategory;
  defaultCalculator?: CalculatorType;
  layout?: 'tabs' | 'accordion' | 'grid';
  className?: string;
}

// Category metadata
const CATEGORY_CONFIG = {
  environmental: {
    label: 'Environmental',
    icon: Thermometer,
    color: 'green',
    description: 'Climate and environmental calculations'
  },
  financial: {
    label: 'Financial',
    icon: DollarSign,
    color: 'blue',
    description: 'ROI, cost analysis, and financial planning'
  },
  electrical: {
    label: 'Electrical',
    icon: Zap,
    color: 'yellow',
    description: 'Electrical systems and power calculations'
  },
  photosynthetic: {
    label: 'Photosynthetic',
    icon: Calculator,
    color: 'purple',
    description: 'Light and photosynthesis calculations'
  },
  water: {
    label: 'Water & Nutrients',
    icon: Droplets,
    color: 'cyan',
    description: 'Water quality and nutrient calculations'
  },
  structural: {
    label: 'Structural',
    icon: Building,
    color: 'gray',
    description: 'Structural and material calculations'
  }
};

// Calculator display names
const CALCULATOR_NAMES: Record<CalculatorType, string> = {
  'advanced-dli': 'Advanced DLI Calculator',
  'advanced-heat-load': 'Heat Load Calculator',
  'co2-enrichment': 'CO2 Enrichment Calculator',
  'psychrometric': 'Psychrometric Calculator',
  'transpiration': 'Transpiration Calculator',
  'environmental-control': 'Environmental Control Calculator',
  'plant-physiological-monitor': '🍅 Plant Physiological Monitor',
  'advanced-roi': 'Advanced ROI Calculator',
  'tco': 'Total Cost of Ownership',
  'energy-cost': 'Energy Cost Calculator',
  'ghg-emissions': 'GHG Emissions Calculator',
  'utility-rebate': 'Utility Rebate Calculator',
  'equipment-leasing': 'Equipment Leasing Calculator',
  'grounding-system': 'Grounding System Calculator',
  'voltage-drop': 'Voltage Drop Calculator',
  'lpd': 'LPD Calculator',
  'photosynthetic': 'Photosynthetic Calculator',
  'coverage-area': 'Coverage Area Calculator',
  'enhanced-coverage-area': 'Enhanced Coverage Calculator',
  'formulation': 'Formulation Calculator',
  'water-use-efficiency': 'Water Use Efficiency Calculator',
  'enhanced-nutrient': 'Enhanced Nutrient Calculator'
};

export function CalculatorSuite({ 
  category, 
  defaultCalculator, 
  layout = 'tabs',
  className = ""
}: CalculatorSuiteProps) {
  const categoryConfig = CATEGORY_CONFIG[category];
  const availableCalculators = useMemo(() => getCalculatorsByCategory(category), [category]);
  
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(() => {
    return defaultCalculator || availableCalculators[0];
  });
  
  const [expandedCalculators, setExpandedCalculators] = useState<CalculatorType[]>([activeCalculator]);

  const toggleExpanded = (calculatorType: CalculatorType) => {
    setExpandedCalculators(prev => 
      prev.includes(calculatorType)
        ? prev.filter(c => c !== calculatorType)
        : [...prev, calculatorType]
    );
  };

  const CategoryIcon = categoryConfig.icon;

  if (availableCalculators.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-medium">No Calculators Available</h3>
          <p className="text-gray-600 text-sm mt-1">
            No calculators found for category "{category}".
          </p>
        </div>
      </div>
    );
  }

  // Tabs layout
  if (layout === 'tabs') {
    return (
      <div className={`calculator-suite ${className}`}>
        {/* Header */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 bg-${categoryConfig.color}-100 rounded-lg`}>
              <CategoryIcon className={`w-6 h-6 text-${categoryConfig.color}-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{categoryConfig.label} Calculators</h2>
              <p className="text-gray-600">{categoryConfig.description}</p>
            </div>
          </div>
          
          {/* Calculator tabs */}
          <div className="flex flex-wrap gap-2">
            {availableCalculators.map(calculatorType => (
              <button
                key={calculatorType}
                onClick={() => setActiveCalculator(calculatorType)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeCalculator === calculatorType
                    ? `bg-${categoryConfig.color}-600 text-white`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {CALCULATOR_NAMES[calculatorType]}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator content */}
        <div className="calculator-content">
          <UnifiedCalculator 
            type={activeCalculator}
            category={category}
          />
        </div>
      </div>
    );
  }

  // Accordion layout
  if (layout === 'accordion') {
    return (
      <div className={`calculator-suite ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 bg-${categoryConfig.color}-100 rounded-lg`}>
            <CategoryIcon className={`w-6 h-6 text-${categoryConfig.color}-600`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{categoryConfig.label} Calculators</h2>
            <p className="text-gray-600">{categoryConfig.description}</p>
          </div>
        </div>

        {/* Calculator accordion */}
        <div className="space-y-4">
          {availableCalculators.map(calculatorType => {
            const isExpanded = expandedCalculators.includes(calculatorType);
            
            return (
              <div key={calculatorType} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleExpanded(calculatorType)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {CALCULATOR_NAMES[calculatorType]}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    <UnifiedCalculator 
                      type={calculatorType}
                      category={category}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div className={`calculator-suite ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 bg-${categoryConfig.color}-100 rounded-lg`}>
          <CategoryIcon className={`w-6 h-6 text-${categoryConfig.color}-600`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{categoryConfig.label} Calculators</h2>
          <p className="text-gray-600">{categoryConfig.description}</p>
        </div>
      </div>

      {/* Calculator grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableCalculators.map(calculatorType => (
          <div key={calculatorType} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              {CALCULATOR_NAMES[calculatorType]}
            </h3>
            <UnifiedCalculator 
              type={calculatorType}
              category={category}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Export calculator names for external use
export { CALCULATOR_NAMES, CATEGORY_CONFIG };