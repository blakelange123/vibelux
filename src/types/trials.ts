export interface Trial {
  projectId?: string
  
  // Experimental design
  
  // Statistical parameters
  
  // Timeline
  actualStartDate?: Date
  actualEndDate?: Date
  
  // Results
  results?: TrialResults
  
  // Metadata
}

export type TrialStatus = 
  | 'PLANNING' 
  | 'APPROVED' 
  | 'RUNNING' 
  | 'DATA_COLLECTION' 
  | 'ANALYSIS' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type TrialDesignType = 
  | 'COMPLETELY_RANDOMIZED'
  | 'RANDOMIZED_BLOCK'
  | 'FACTORIAL'
  | 'SPLIT_PLOT'
  | 'BEFORE_AFTER'
  | 'A_B_TEST'

export interface ExperimentalDesign {
  blocks?: Block[]
}

export interface Factor {
  unit?: string
  description?: string
}

export interface FactorLevel {
  description?: string
}

export interface Block {
}

export interface RandomizationScheme {
  seed?: number
  constraints?: string[]
}

export interface ControlGroup {
  treatmentId?: string
}

export interface Treatment {
  
  // Lighting parameters
  lightingConfig?: LightingTreatment
  
  // Environmental parameters
  environmentConfig?: EnvironmentalTreatment
  
  // Cultural parameters
  culturalConfig?: CulturalTreatment
  
  // Expected outcomes
  expectedOutcomes?: ExpectedOutcome[]
  
  // Cost and resources
  estimatedCost?: number
  resourceRequirements?: ResourceRequirement[]
}

export interface LightingTreatment {
  uniformity?: number // percentage
  lightSum?: number // mol/m²/day
}

export interface SpectrumTreatment {
  green?: number
  farRed?: number
  white?: number
  uv?: number
}

export interface EnvironmentalTreatment {
  temperature?: number // °C
  humidity?: number // %
  co2?: number // ppm
  airflow?: number // m/s
}

export interface CulturalTreatment {
  spacing?: number // cm
}

export interface NutritionTreatment {
  micronutrients?: { [key: string]: number }
}

export interface IrrigationTreatment {
}

export interface ExpectedOutcome {
}

export interface ResourceRequirement {
}

export interface Measurement {
  
  // Data collection
  equipment?: string
  
  // Statistical properties
  expectedMean?: number
  expectedStdDev?: number
  minimumDetectableDifference?: number
  
  // Quality control
  precision?: number
  accuracy?: number
}

export type MeasurementType = 
  | 'YIELD' 
  | 'QUALITY' 
  | 'GROWTH_RATE'
  | 'MORPHOLOGY'
  | 'PHYSIOLOGY'
  | 'ENVIRONMENTAL'
  | 'ECONOMIC'

export interface MeasurementFrequency {
  interval?: number
  timePoints?: Date[]
}

export interface StatisticalParameters {
  effectSize?: number
  actualSampleSize?: number
  
  // Analysis methods
  
  // Multiple comparisons
  multipleComparisonsCorrection?: 'BONFERRONI' | 'TUKEY' | 'DUNNETT' | 'FDR'
  
  // Missing data handling
  missingDataMethod?: 'COMPLETE_CASE' | 'IMPUTATION' | 'MIXED_MODEL'
}

export type AnalysisMethod = 
  | 'T_TEST'
  | 'ANOVA'
  | 'FACTORIAL_ANOVA'
  | 'REPEATED_MEASURES_ANOVA'
  | 'ANCOVA'
  | 'REGRESSION'
  | 'CHI_SQUARE'
  | 'NON_PARAMETRIC'

export interface TrialResults {
  
  // Performance metrics
  economicAnalysis?: EconomicAnalysis
  
  // Quality indicators
  
  // Recommendations
}

export interface DataPoint {
  notes?: string
  operator?: string
  
  // Environmental context
  environmentalConditions?: {
  }
}

export type DataQuality = 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'INVALID'

export interface StatisticalAnalysis {
  
  // Effect sizes
  
  // Model diagnostics
  modelFit?: ModelFitStatistics
  residualAnalysis?: ResidualAnalysis
}

export interface AnalysisResult {
  
  // Statistical outputs
  degreesOfFreedom?: number
  
  // Effect size
  effectSize?: number
  effectSizeCI?: [number, number]
  
  // Descriptive statistics
  
  // Post-hoc comparisons
  postHocTests?: PostHocTest[]
  
  // Interpretation
  practicalSignificance?: boolean
}

export interface PostHocTest {
}

export interface AssumptionTest {
  remedy?: string
}

export interface PowerAnalysisResult {
  recommendedSampleSize?: number
  powerCurve?: { sampleSize: number; power: number }[]
}

export interface EffectSize {
}

export interface ModelFitStatistics {
  rSquared?: number
  adjustedRSquared?: number
  aic?: number
  bic?: number
  logLikelihood?: number
}

export interface ResidualAnalysis {
  independenceTest?: { test: string; pValue: number; independent: boolean }
}

export interface Conclusion {
}

export interface PerformanceComparison {
}

export interface EconomicAnalysis {
  
  // Revenue sharing implications
  projectedSavings?: { treatmentId: string; annualSavings: number }[]
  implementationCost?: number
  riskAssessment?: RiskAssessment
}

export interface RiskAssessment {
}

export interface DataQualityMetrics {
  
  // Issues
}

export interface Recommendation {
  implementationCost?: number
  
  // Revenue sharing specific
  revenueImpact?: {
  }
}

// Trial templates for common scenarios
export interface TrialTemplate {
  id: string
  name: string
  description: string
  
  // Template configuration
  treatments: any[]
  duration: number
  metrics: string[]
  
  // Industry validation
  basedOnStudy?: string
  validatedBy?: string[]
  
  // Usage statistics
  usageCount?: number
  successRate?: number
}

export type TrialCategory = 
  | 'LIGHTING_OPTIMIZATION'
  | 'SPECTRUM_TUNING'
  | 'ENVIRONMENTAL_CONTROL'
  | 'NUTRITION_OPTIMIZATION'
  | 'VARIETY_COMPARISON'
  | 'CULTIVATION_METHOD'
  | 'ENERGY_EFFICIENCY'
  | 'AUTOMATION_TESTING'

// Integration with existing Vibelux types
export interface TrialProject extends Project {
  trialObjectives?: string[]
}

// Feature limits for trials
export const TRIAL_FEATURE_LIMITS = {
  FREE: {
    maxTrials: 1,
    maxTreatments: 3,
    maxDuration: 30 // days
  },
  PRO: {
    maxTrials: 10,
    maxTreatments: 12,
    maxDuration: 365
  },
  ENTERPRISE: {
    maxTrials: -1, // unlimited
    maxTreatments: -1,
    maxDuration: -1
  }
} as const

// Pre-built trial templates based on microgreens research
export const MICROGREENS_TRIAL_TEMPLATES: TrialTemplate[] = [
  {
    id: 'far-red-microgreens',
    name: 'Far-Red Effect on Microgreens',
    description: 'Test the impact of far-red light on microgreen growth and quality',
    treatments: [
      { id: 'control', name: 'Red/White (No Far-Red)', spectrum: 'R/W' },
      { id: 'treatment', name: 'Red/White/Far-Red', spectrum: 'R/W/FR' }
    ],
    duration: 14, // days
    metrics: ['height', 'fresh_weight', 'dry_weight', 'cotyledon_area'],
    basedOnStudy: 'Kong et al. (2019) - Far-red light supplementation',
    validatedBy: ['University of Guelph', 'USDA']
  },
  {
    id: 'ppfd-optimization',
    name: 'PPFD Optimization Trial',
    description: 'Find optimal light intensity for your specific crop',
    treatments: [
      { id: 'low', name: '90 μmol/m²/s', ppfd: 90 },
      { id: 'medium', name: '120 μmol/m²/s', ppfd: 120 },
      { id: 'high', name: '180 μmol/m²/s', ppfd: 180 },
      { id: 'very_high', name: '240 μmol/m²/s', ppfd: 240 }
    ],
    duration: 21,
    metrics: ['growth_rate', 'yield', 'quality_score', 'energy_efficiency'],
    basedOnStudy: 'Ying et al. (2020) - Light intensity effects on microgreens'
  }
]