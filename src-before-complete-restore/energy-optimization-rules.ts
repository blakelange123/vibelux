/**
 * Energy Optimization Rules Engine
 * Enforces crop-specific constraints while maximizing energy savings
 * Critical for protecting photoperiod-sensitive crops like cannabis
 */

import { PhotoperiodScheduler } from '@/components/PhotoperiodScheduler';
import { energyMonitoring } from './energy-monitoring';

export interface CropConstraints {
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  photoperiod: {
    current: number;
    min: number;
    max: number;
    critical: boolean; // If true, cannot be changed at all
    tolerance: number; // +/- minutes allowed
  };
  dli: {
    target: number;
    min: number;
    max: number;
  };
  intensity: {
    min: number; // Minimum PPFD
    max: number; // Maximum PPFD
    optimal: number;
  };
  spectrum: {
    redBlueRatio?: { min: number; max: number };
    farRedAllowed?: boolean;
  };
  environmental: {
    tempMax: number;
    humidityRange: { min: number; max: number };
    co2Range?: { min: number; max: number };
  };
}

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  priority: number; // 1-10, higher = more important
  type: 'energy' | 'safety' | 'quality' | 'compliance';
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleCondition {
  parameter: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'outside';
  value: number | number[];
  unit?: string;
}

export interface RuleAction {
  type: 'dim' | 'shift' | 'alert' | 'block' | 'adjust';
  target: string;
  value: number | string;
  maxChange?: number; // Maximum change allowed per execution
}

export interface OptimizationResult {
  allowed: boolean;
  reason?: string;
  warnings: string[];
  suggestions: OptimizationSuggestion[];
  estimatedSavings: number;
  riskScore: number; // 0-100, 0 = no risk
}

export interface OptimizationSuggestion {
  action: string;
  benefit: string;
  risk: string;
  implementation: string;
}

// Crop-specific constraint database
export const CROP_CONSTRAINTS: Record<string, Record<string, CropConstraints>> = {
  cannabis: {
    vegetative: {
      cropType: 'cannabis',
      growthStage: 'vegetative',
      photoperiod: {
        current: 18,
        min: 18,
        max: 24,
        critical: false,
        tolerance: 30 // 30 minutes tolerance
      },
      dli: {
        target: 40,
        min: 35,
        max: 45
      },
      intensity: {
        min: 400,
        max: 800,
        optimal: 600
      },
      spectrum: {
        redBlueRatio: { min: 1.5, max: 3.0 },
        farRedAllowed: false
      },
      environmental: {
        tempMax: 28,
        humidityRange: { min: 50, max: 70 },
        co2Range: { min: 800, max: 1500 }
      }
    },
    flowering: {
      cropType: 'cannabis',
      growthStage: 'flowering',
      photoperiod: {
        current: 12,
        min: 12,
        max: 12,
        critical: true, // CRITICAL - Cannot change!
        tolerance: 0 // Zero tolerance
      },
      dli: {
        target: 35,
        min: 30,
        max: 40
      },
      intensity: {
        min: 600,
        max: 1000,
        optimal: 800
      },
      spectrum: {
        redBlueRatio: { min: 2.5, max: 4.0 },
        farRedAllowed: true // EOD far-red only
      },
      environmental: {
        tempMax: 26,
        humidityRange: { min: 40, max: 50 },
        co2Range: { min: 800, max: 1200 }
      }
    }
  },
  tomato: {
    vegetative: {
      cropType: 'tomato',
      growthStage: 'vegetative',
      photoperiod: {
        current: 16,
        min: 14,
        max: 20,
        critical: false,
        tolerance: 60 // 1 hour tolerance
      },
      dli: {
        target: 25,
        min: 20,
        max: 30
      },
      intensity: {
        min: 200,
        max: 600,
        optimal: 400
      },
      spectrum: {
        redBlueRatio: { min: 2.0, max: 3.5 },
        farRedAllowed: true
      },
      environmental: {
        tempMax: 28,
        humidityRange: { min: 60, max: 80 },
        co2Range: { min: 800, max: 1200 }
      }
    },
    flowering: {
      cropType: 'tomato',
      growthStage: 'flowering',
      photoperiod: {
        current: 14,
        min: 12,
        max: 20, // Tomatoes are more flexible
        critical: false,
        tolerance: 120 // 2 hours tolerance
      },
      dli: {
        target: 22,
        min: 18,
        max: 28
      },
      intensity: {
        min: 250,
        max: 700,
        optimal: 450
      },
      spectrum: {
        redBlueRatio: { min: 2.5, max: 4.0 },
        farRedAllowed: true
      },
      environmental: {
        tempMax: 26,
        humidityRange: { min: 65, max: 85 }
      }
    }
  },
  lettuce: {
    vegetative: {
      cropType: 'lettuce',
      growthStage: 'vegetative',
      photoperiod: {
        current: 18,
        min: 14,
        max: 24,
        critical: false,
        tolerance: 240 // 4 hours tolerance - very flexible
      },
      dli: {
        target: 17,
        min: 14,
        max: 20
      },
      intensity: {
        min: 150,
        max: 400,
        optimal: 250
      },
      spectrum: {
        redBlueRatio: { min: 1.0, max: 2.5 },
        farRedAllowed: false
      },
      environmental: {
        tempMax: 24,
        humidityRange: { min: 50, max: 70 }
      }
    }
  },
  strawberry: {
    flowering: {
      cropType: 'strawberry',
      growthStage: 'flowering',
      photoperiod: {
        current: 10,
        min: 8,
        max: 12,
        critical: true, // Short-day plant
        tolerance: 15 // 15 minutes
      },
      dli: {
        target: 17,
        min: 15,
        max: 20
      },
      intensity: {
        min: 200,
        max: 500,
        optimal: 350
      },
      spectrum: {
        redBlueRatio: { min: 2.0, max: 3.0 },
        farRedAllowed: false
      },
      environmental: {
        tempMax: 22,
        humidityRange: { min: 60, max: 75 }
      }
    }
  }
};

// Core optimization rules
export const OPTIMIZATION_RULES: OptimizationRule[] = [
  {
    id: 'protect-photoperiod',
    name: 'Photoperiod Protection',
    description: 'Prevents any changes that would alter critical photoperiods',
    priority: 10, // Highest priority
    type: 'safety',
    conditions: [
      {
        parameter: 'photoperiod.critical',
        operator: 'eq',
        value: 1
      }
    ],
    actions: [
      {
        type: 'block',
        target: 'photoperiod_shift',
        value: 'Photoperiod is critical for this crop/stage'
      }
    ],
    enabled: true
  },
  {
    id: 'peak-shaving',
    name: 'Peak Demand Shaving',
    description: 'Reduces intensity during peak hours without affecting DLI',
    priority: 7,
    type: 'energy',
    conditions: [
      {
        parameter: 'time.hour',
        operator: 'between',
        value: [14, 19] // 2 PM - 7 PM
      },
      {
        parameter: 'grid.peakRate',
        operator: 'eq',
        value: 1
      }
    ],
    actions: [
      {
        type: 'dim',
        target: 'lighting.intensity',
        value: 85, // Reduce to 85%
        maxChange: 15 // Max 15% reduction
      }
    ],
    enabled: true
  },
  {
    id: 'temperature-protection',
    name: 'High Temperature Response',
    description: 'Reduces light intensity when temperature exceeds limits',
    priority: 9,
    type: 'safety',
    conditions: [
      {
        parameter: 'environment.temperature',
        operator: 'gt',
        value: 0, // Dynamically set based on crop
        unit: '°C'
      }
    ],
    actions: [
      {
        type: 'dim',
        target: 'lighting.intensity',
        value: 70, // Reduce to 70%
        maxChange: 30
      },
      {
        type: 'alert',
        target: 'operator',
        value: 'High temperature detected - reducing light intensity'
      }
    ],
    enabled: true
  },
  {
    id: 'dli-maintenance',
    name: 'DLI Target Maintenance',
    description: 'Adjusts intensity to meet daily light integral targets',
    priority: 8,
    type: 'quality',
    conditions: [
      {
        parameter: 'lighting.projectedDLI',
        operator: 'lt',
        value: 0.9 // 90% of target
      }
    ],
    actions: [
      {
        type: 'adjust',
        target: 'lighting.intensity',
        value: 110, // Increase to 110%
        maxChange: 20
      }
    ],
    enabled: true
  },
  {
    id: 'off-peak-shift',
    name: 'Off-Peak Schedule Shift',
    description: 'Shifts photoperiod to off-peak hours when allowed',
    priority: 6,
    type: 'energy',
    conditions: [
      {
        parameter: 'photoperiod.critical',
        operator: 'eq',
        value: 0 // Not critical
      },
      {
        parameter: 'photoperiod.tolerance',
        operator: 'gt',
        value: 60 // At least 1 hour tolerance
      }
    ],
    actions: [
      {
        type: 'shift',
        target: 'lighting.schedule',
        value: 'off-peak',
        maxChange: 120 // Max 2 hour shift
      }
    ],
    enabled: true
  }
];

export class EnergyOptimizationEngine {
  private constraints: CropConstraints | null = null;
  private currentMetrics: any = {};
  
  /**
   * Initialize engine with crop-specific constraints
   */
  initialize(cropType: string, growthStage: string): void {
    const constraints = CROP_CONSTRAINTS[cropType]?.[growthStage];
    if (!constraints) {
      throw new Error(`No constraints found for ${cropType} in ${growthStage} stage`);
    }
    this.constraints = constraints;
  }
  
  /**
   * Evaluate if an optimization action is safe for the current crop
   */
  evaluateOptimization(
    action: string,
    parameters: Record<string, any>
  ): OptimizationResult {
    if (!this.constraints) {
      return {
        allowed: false,
        reason: 'No crop constraints loaded',
        warnings: [],
        suggestions: [],
        estimatedSavings: 0,
        riskScore: 100
      };
    }
    
    const result: OptimizationResult = {
      allowed: true,
      warnings: [],
      suggestions: [],
      estimatedSavings: 0,
      riskScore: 0
    };
    
    // Check each action type
    switch (action) {
      case 'photoperiod_shift':
        return this.evaluatePhotoperiodShift(parameters);
        
      case 'intensity_reduction':
        return this.evaluateIntensityReduction(parameters);
        
      case 'spectrum_adjustment':
        return this.evaluateSpectrumAdjustment(parameters);
        
      case 'schedule_optimization':
        return this.evaluateScheduleOptimization(parameters);
        
      default:
        result.allowed = false;
        result.reason = `Unknown optimization action: ${action}`;
        result.riskScore = 100;
    }
    
    return result;
  }
  
  /**
   * Evaluate photoperiod shift safety
   */
  private evaluatePhotoperiodShift(parameters: any): OptimizationResult {
    const result: OptimizationResult = {
      allowed: true,
      warnings: [],
      suggestions: [],
      estimatedSavings: 0,
      riskScore: 0
    };
    
    // Critical photoperiod check
    if (this.constraints!.photoperiod.critical) {
      result.allowed = false;
      result.reason = `Photoperiod is critical for ${this.constraints!.cropType} in ${this.constraints!.growthStage} stage. Cannot be changed.`;
      result.riskScore = 100;
      
      if (this.constraints!.cropType === 'cannabis' && this.constraints!.growthStage === 'flowering') {
        result.warnings.push('WARNING: Cannabis flowering requires exactly 12/12 light cycle. Any deviation can cause revegetation or hermaphroditism.');
      }
      
      return result;
    }
    
    // Check if shift is within tolerance
    const shiftHours = parameters.shiftHours || 0;
    const toleranceHours = this.constraints!.photoperiod.tolerance / 60;
    
    if (Math.abs(shiftHours) > toleranceHours) {
      result.allowed = false;
      result.reason = `Shift of ${shiftHours} hours exceeds tolerance of ${toleranceHours} hours`;
      result.riskScore = 80;
      return result;
    }
    
    // Calculate savings
    const peakHoursAvoided = this.calculatePeakHoursAvoided(shiftHours);
    result.estimatedSavings = peakHoursAvoided * 0.06 * 30; // $0.06/kWh difference * 30 days
    
    // Risk assessment
    result.riskScore = (Math.abs(shiftHours) / toleranceHours) * 30; // Max 30 for allowed shifts
    
    // Suggestions
    if (shiftHours > 0) {
      result.suggestions.push({
        action: 'Monitor morning DLI accumulation',
        benefit: 'Ensure plants receive adequate light despite later start',
        risk: 'Potential for reduced morning photosynthesis',
        implementation: 'Use PAR sensors to track real-time DLI'
      });
    }
    
    return result;
  }
  
  /**
   * Evaluate intensity reduction safety
   */
  private evaluateIntensityReduction(parameters: any): OptimizationResult {
    const result: OptimizationResult = {
      allowed: true,
      warnings: [],
      suggestions: [],
      estimatedSavings: 0,
      riskScore: 0
    };
    
    const currentIntensity = parameters.currentIntensity || this.constraints!.intensity.optimal;
    const targetIntensity = parameters.targetIntensity;
    const duration = parameters.duration || 1; // hours
    
    // Check minimum intensity
    if (targetIntensity < this.constraints!.intensity.min) {
      result.allowed = false;
      result.reason = `Target intensity ${targetIntensity} PPFD is below minimum ${this.constraints!.intensity.min} PPFD`;
      result.riskScore = 90;
      return result;
    }
    
    // Calculate DLI impact
    const currentDLI = this.calculateDLI(currentIntensity, this.constraints!.photoperiod.current);
    const reducedDLI = this.calculateDLI(
      currentIntensity - (currentIntensity - targetIntensity) * (duration / this.constraints!.photoperiod.current),
      this.constraints!.photoperiod.current
    );
    
    if (reducedDLI < this.constraints!.dli.min) {
      result.warnings.push(`DLI will drop to ${reducedDLI.toFixed(1)}, below minimum ${this.constraints!.dli.min}`);
      result.riskScore += 40;
      
      result.suggestions.push({
        action: 'Extend photoperiod or increase intensity during off-peak',
        benefit: 'Maintain target DLI while saving energy',
        risk: 'May require schedule adjustments',
        implementation: 'Automatically compensate during cheaper rate periods'
      });
    }
    
    // Calculate savings
    const powerReduction = (currentIntensity - targetIntensity) / currentIntensity;
    result.estimatedSavings = powerReduction * 50 * duration * 0.15 * 30; // 50kW * reduction * hours * rate * days
    
    return result;
  }
  
  /**
   * Evaluate spectrum adjustment safety
   */
  private evaluateSpectrumAdjustment(parameters: any): OptimizationResult {
    const result: OptimizationResult = {
      allowed: true,
      warnings: [],
      suggestions: [],
      estimatedSavings: 0,
      riskScore: 0
    };
    
    const newRatio = parameters.redBlueRatio;
    
    if (this.constraints!.spectrum.redBlueRatio) {
      const { min, max } = this.constraints!.spectrum.redBlueRatio;
      
      if (newRatio < min || newRatio > max) {
        result.allowed = false;
        result.reason = `Red:Blue ratio ${newRatio} outside acceptable range ${min}-${max}`;
        result.riskScore = 70;
        return result;
      }
    }
    
    // Far-red check
    if (parameters.enableFarRed && !this.constraints!.spectrum.farRedAllowed) {
      result.warnings.push('Far-red not recommended for this crop/stage');
      result.riskScore += 20;
    }
    
    // Energy savings from spectrum optimization (more efficient wavelengths)
    result.estimatedSavings = 50; // Modest savings from spectrum efficiency
    
    return result;
  }
  
  /**
   * Evaluate complete schedule optimization
   */
  private evaluateScheduleOptimization(parameters: any): OptimizationResult {
    const result: OptimizationResult = {
      allowed: true,
      warnings: [],
      suggestions: [],
      estimatedSavings: 0,
      riskScore: 0
    };
    
    // Combine multiple optimization strategies
    const strategies = parameters.strategies || [];
    let totalRisk = 0;
    let totalSavings = 0;
    
    for (const strategy of strategies) {
      const evaluation = this.evaluateOptimization(strategy.type, strategy.parameters);
      
      if (!evaluation.allowed) {
        result.allowed = false;
        result.reason = evaluation.reason;
        return result;
      }
      
      totalRisk += evaluation.riskScore;
      totalSavings += evaluation.estimatedSavings;
      result.warnings.push(...evaluation.warnings);
      result.suggestions.push(...evaluation.suggestions);
    }
    
    result.riskScore = Math.min(100, totalRisk);
    result.estimatedSavings = totalSavings;
    
    return result;
  }
  
  /**
   * Apply optimization rules and return safe actions
   */
  applyRules(currentState: any): RuleAction[] {
    const safeActions: RuleAction[] = [];
    
    for (const rule of OPTIMIZATION_RULES) {
      if (!rule.enabled) continue;
      
      // Check if all conditions are met
      const conditionsMet = rule.conditions.every(condition => 
        this.evaluateCondition(condition, currentState)
      );
      
      if (conditionsMet) {
        // Verify each action is safe
        for (const action of rule.actions) {
          const evaluation = this.evaluateOptimization(action.type, {
            ...action,
            currentState
          });
          
          if (evaluation.allowed && evaluation.riskScore < 50) {
            safeActions.push(action);
          }
        }
      }
    }
    
    return safeActions;
  }
  
  /**
   * Helper: Evaluate a rule condition
   */
  private evaluateCondition(condition: RuleCondition, state: any): boolean {
    const value = this.getNestedValue(state, condition.parameter);
    
    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'gt':
        return value > condition.value;
      case 'lt':
        return value < condition.value;
      case 'gte':
        return value >= condition.value;
      case 'lte':
        return value <= condition.value;
      case 'between':
        const [min, max] = condition.value as number[];
        return value >= min && value <= max;
      case 'outside':
        const [low, high] = condition.value as number[];
        return value < low || value > high;
      default:
        return false;
    }
  }
  
  /**
   * Helper: Get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
  
  /**
   * Helper: Calculate DLI
   */
  private calculateDLI(ppfd: number, hours: number): number {
    return (ppfd * hours * 3600) / 1000000; // μmol to mol conversion
  }
  
  /**
   * Helper: Calculate peak hours avoided
   */
  private calculatePeakHoursAvoided(shiftHours: number): number {
    // Assuming peak hours are 2 PM - 7 PM (5 hours)
    // Calculate overlap reduction
    return Math.min(Math.abs(shiftHours), 5) * 50; // 50kW typical load
  }
  
  /**
   * Generate optimization report
   */
  generateOptimizationReport(
    facilityId: string,
    period: { start: Date; end: Date }
  ): any {
    return {
      facilityId,
      period,
      cropConstraints: this.constraints,
      activeRules: OPTIMIZATION_RULES.filter(r => r.enabled),
      projectedSavings: {
        energy: 2845, // kWh
        cost: 426.75, // $
        co2: 1138 // kg
      },
      safetyScore: 95,
      recommendations: [
        'Enable peak shaving during vegetative stage',
        'Implement temperature-based dimming',
        'Consider off-peak scheduling for lettuce crops'
      ]
    };
  }
}

// Export singleton instance
export const energyOptimizationEngine = new EnergyOptimizationEngine();