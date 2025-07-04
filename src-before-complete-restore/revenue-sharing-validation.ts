/**
 * Validation utilities for revenue-sharing calculations
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateCostScenario(scenario: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Facility Size
  if (!scenario.facilitySize || scenario.facilitySize <= 0) {
    errors.push({ field: 'facilitySize', message: 'Facility size must be greater than 0' });
  }
  if (scenario.facilitySize > 1000000) {
    errors.push({ field: 'facilitySize', message: 'Facility size seems unrealistic (>1M sq ft)' });
  }

  // Energy Bill
  if (!scenario.monthlyEnergyBill || scenario.monthlyEnergyBill < 0) {
    errors.push({ field: 'monthlyEnergyBill', message: 'Energy bill cannot be negative' });
  }
  if (scenario.monthlyEnergyBill > scenario.facilitySize * 10) {
    errors.push({ field: 'monthlyEnergyBill', message: 'Energy bill seems high for facility size' });
  }

  // Yield
  if (!scenario.currentYield || scenario.currentYield <= 0) {
    errors.push({ field: 'currentYield', message: 'Yield must be greater than 0' });
  }
  if (scenario.currentYield > 5) {
    errors.push({ field: 'currentYield', message: 'Yield seems unrealistic (>5 lbs/sqft/year)' });
  }

  // Crop Price
  if (!scenario.cropPrice || scenario.cropPrice <= 0) {
    errors.push({ field: 'cropPrice', message: 'Crop price must be greater than 0' });
  }
  if (scenario.cropPrice > 10000) {
    errors.push({ field: 'cropPrice', message: 'Crop price seems unrealistic (>$10,000/lb)' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Benchmark data for different crop types
export const CROP_BENCHMARKS = {
  cannabis: {
    yieldRange: { min: 0.2, max: 1.5, typical: 0.5 },
    priceRange: { min: 500, max: 3000, typical: 1500 },
    energyIntensity: { min: 30, max: 100, typical: 60 }, // $/sqft/year
    description: 'Indoor cannabis cultivation'
  },
  'leafy-greens': {
    yieldRange: { min: 0.5, max: 2.0, typical: 1.0 },
    priceRange: { min: 5, max: 30, typical: 12 },
    energyIntensity: { min: 20, max: 60, typical: 35 },
    description: 'Vertical farming leafy greens'
  },
  tomatoes: {
    yieldRange: { min: 0.3, max: 1.2, typical: 0.6 },
    priceRange: { min: 100, max: 1500, typical: 800 },
    energyIntensity: { min: 15, max: 50, typical: 30 },
    description: 'Greenhouse tomato production'
  },
  strawberries: {
    yieldRange: { min: 0.2, max: 0.8, typical: 0.4 },
    priceRange: { min: 200, max: 2000, typical: 1000 },
    energyIntensity: { min: 25, max: 70, typical: 45 },
    description: 'Indoor strawberry cultivation'
  },
  herbs: {
    yieldRange: { min: 0.1, max: 0.5, typical: 0.25 },
    priceRange: { min: 500, max: 5000, typical: 2000 },
    energyIntensity: { min: 30, max: 80, typical: 50 },
    description: 'High-value herb production'
  }
};

export function getBenchmarkWarnings(scenario: any): string[] {
  const warnings: string[] = [];
  const cropType = scenario.cropType || 'other';
  const benchmark = CROP_BENCHMARKS[cropType as keyof typeof CROP_BENCHMARKS];

  if (benchmark) {
    // Check yield
    if (scenario.currentYield < benchmark.yieldRange.min) {
      warnings.push(`Yield seems low for ${cropType}. Typical range: ${benchmark.yieldRange.min}-${benchmark.yieldRange.max} lbs/sqft/year`);
    }
    if (scenario.currentYield > benchmark.yieldRange.max) {
      warnings.push(`Yield seems high for ${cropType}. Typical range: ${benchmark.yieldRange.min}-${benchmark.yieldRange.max} lbs/sqft/year`);
    }

    // Check price
    if (scenario.cropPrice < benchmark.priceRange.min) {
      warnings.push(`Price seems low for ${cropType}. Typical range: $${benchmark.priceRange.min}-$${benchmark.priceRange.max}/lb`);
    }
    if (scenario.cropPrice > benchmark.priceRange.max) {
      warnings.push(`Price seems high for ${cropType}. Typical range: $${benchmark.priceRange.min}-$${benchmark.priceRange.max}/lb`);
    }

    // Check energy intensity
    const energyIntensity = (scenario.monthlyEnergyBill * 12) / scenario.facilitySize;
    if (energyIntensity < benchmark.energyIntensity.min) {
      warnings.push(`Energy usage seems low for ${cropType}. Typical: $${benchmark.energyIntensity.min}-$${benchmark.energyIntensity.max}/sqft/year`);
    }
    if (energyIntensity > benchmark.energyIntensity.max) {
      warnings.push(`Energy usage seems high for ${cropType}. Typical: $${benchmark.energyIntensity.min}-$${benchmark.energyIntensity.max}/sqft/year`);
    }
  }

  return warnings;
}

// Format currency with proper localization
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Debounce function for input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}