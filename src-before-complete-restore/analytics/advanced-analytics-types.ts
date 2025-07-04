// Advanced Analytics & AI Prediction Types

export interface AdvancedAnalyticsSystem {
  predictions: YieldPrediction[];
  insights: AnalyticalInsight[];
  models: PredictiveModel[];
  anomalies: AnomalyDetection[];
  recommendations: OptimizationRecommendation[];
  correlations: CorrelationAnalysis[];
  forecasts: DemandForecast[];
  simulations: WhatIfSimulation[];
}

export interface YieldPrediction {
  id: string;
  roomId: string;
  strainId: string;
  batchId: string;
  predictionDate: Date;
  harvestDate: Date;
  model: ModelReference;
  prediction: PredictionResult;
  confidence: ConfidenceInterval;
  factors: ContributingFactor[];
  risks: RiskFactor[];
  recommendations: string[];
  actualYield?: number;
  accuracy?: number;
}

export interface PredictionResult {
  expectedYield: number; // grams
  yieldPerSqFt: number;
  yieldPerPlant: number;
  quality: QualityPrediction;
  timeline: TimelinePrediction;
  probability: ProbabilityDistribution;
}

export interface AnalyticalInsight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  impact: ImpactAnalysis;
  evidence: Evidence[];
  recommendations: Recommendation[];
  confidence: number;
  createdAt: Date;
  expiresAt?: Date;
  acknowledged?: boolean;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  status: ModelStatus;
  accuracy: ModelAccuracy;
  features: ModelFeature[];
  training: TrainingMetadata;
  performance: ModelPerformance;
  deployment: DeploymentInfo;
}

export interface AnomalyDetection {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  location: string;
  parameter: string;
  detectedAt: Date;
  value: number;
  expectedRange: Range;
  deviation: number; // standard deviations
  pattern: AnomalyPattern;
  possibleCauses: string[];
  suggestedActions: string[];
  falsePositive?: boolean;
}

export interface OptimizationRecommendation {
  id: string;
  area: OptimizationArea;
  priority: Priority;
  title: string;
  description: string;
  currentState: MetricSnapshot;
  targetState: MetricSnapshot;
  expectedImprovement: ImprovementMetrics;
  implementation: ImplementationPlan;
  roi: ROICalculation;
  confidence: number;
}

export interface CorrelationAnalysis {
  id: string;
  variables: CorrelatedVariable[];
  coefficient: number; // -1 to 1
  pValue: number;
  sampleSize: number;
  timeframe: TimeFrame;
  relationship: RelationshipType;
  strength: CorrelationStrength;
  insights: string[];
  visualizations: Visualization[];
}

export interface DemandForecast {
  id: string;
  product: string;
  strain: string;
  period: ForecastPeriod;
  forecast: ForecastData;
  drivers: DemandDriver[];
  seasonality: SeasonalityPattern;
  accuracy: ForecastAccuracy;
  scenarios: ScenarioAnalysis[];
}

export interface WhatIfSimulation {
  id: string;
  name: string;
  description: string;
  baselineScenario: Scenario;
  alternativeScenarios: Scenario[];
  parameters: SimulationParameter[];
  results: SimulationResults;
  recommendations: string[];
  createdBy: string;
  createdAt: Date;
}

// Enums
export enum InsightType {
  Trend = 'Trend',
  Anomaly = 'Anomaly',
  Correlation = 'Correlation',
  Prediction = 'Prediction',
  Optimization = 'Optimization',
  Risk = 'Risk'
}

export enum InsightCategory {
  Yield = 'Yield',
  Quality = 'Quality',
  Cost = 'Cost',
  Environmental = 'Environmental',
  Operational = 'Operational',
  Compliance = 'Compliance'
}

export enum InsightSeverity {
  Info = 'Info',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum ModelType {
  Regression = 'Regression',
  Classification = 'Classification',
  TimeSeries = 'Time Series',
  NeuralNetwork = 'Neural Network',
  RandomForest = 'Random Forest',
  GradientBoosting = 'Gradient Boosting',
  Ensemble = 'Ensemble'
}

export enum ModelStatus {
  Training = 'Training',
  Validating = 'Validating',
  Deployed = 'Deployed',
  Deprecated = 'Deprecated',
  Failed = 'Failed'
}

export enum AnomalyType {
  Statistical = 'Statistical',
  Pattern = 'Pattern',
  Contextual = 'Contextual',
  Collective = 'Collective'
}

export enum AnomalySeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum OptimizationArea {
  Energy = 'Energy',
  Water = 'Water',
  Nutrients = 'Nutrients',
  Labor = 'Labor',
  Space = 'Space',
  Time = 'Time',
  Quality = 'Quality',
  Yield = 'Yield'
}

export enum RelationshipType {
  Linear = 'Linear',
  NonLinear = 'Non-Linear',
  Inverse = 'Inverse',
  Exponential = 'Exponential',
  Logarithmic = 'Logarithmic',
  Seasonal = 'Seasonal'
}

export enum CorrelationStrength {
  VeryWeak = 'Very Weak',
  Weak = 'Weak',
  Moderate = 'Moderate',
  Strong = 'Strong',
  VeryStrong = 'Very Strong'
}

// Supporting Interfaces
export interface ModelReference {
  modelId: string;
  modelName: string;
  version: string;
  type: ModelType;
}

export interface QualityPrediction {
  grade: string;
  thcContent?: number;
  cbdContent?: number;
  terpeneProfile?: TerpeneProfile;
  defectProbability: number;
  trimRatio: number;
}

export interface TimelinePrediction {
  daysToHarvest: number;
  optimalHarvestWindow: DateRange;
  growthStages: GrowthStage[];
  criticalDates: CriticalDate[];
}

export interface ProbabilityDistribution {
  mean: number;
  median: number;
  standardDeviation: number;
  percentiles: Percentile[];
  distribution: DistributionPoint[];
}

export interface ContributingFactor {
  name: string;
  category: string;
  currentValue: number;
  optimalValue: number;
  impact: number; // percentage
  direction: 'positive' | 'negative';
  controllable: boolean;
}

export interface RiskFactor {
  type: string;
  probability: number;
  impact: number;
  description: string;
  mitigation: string[];
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number; // e.g., 0.95 for 95%
}

export interface ImpactAnalysis {
  financial: number;
  operational: string;
  timeline: string;
  quality: string;
  compliance: string;
}

export interface Evidence {
  type: string;
  source: string;
  value: any;
  timestamp: Date;
  reliability: number;
}

export interface Recommendation {
  action: string;
  priority: Priority;
  effort: EffortLevel;
  expectedOutcome: string;
  timeline: string;
  dependencies: string[];
}

export interface ModelFeature {
  name: string;
  type: 'numerical' | 'categorical' | 'temporal';
  importance: number;
  correlation: number;
  description: string;
}

export interface TrainingMetadata {
  datasetSize: number;
  trainingDuration: number; // minutes
  trainedAt: Date;
  trainedBy: string;
  hyperparameters: Record<string, any>;
  validationStrategy: string;
}

export interface ModelAccuracy {
  overall: number;
  byCategory?: Record<string, number>;
  metrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  mse?: number; // Mean Squared Error
  rmse?: number; // Root Mean Squared Error
  mae?: number; // Mean Absolute Error
  r2?: number; // R-squared
  accuracy?: number; // Classification accuracy
  precision?: number;
  recall?: number;
  f1Score?: number;
}

export interface ModelPerformance {
  latency: number; // milliseconds
  throughput: number; // predictions per second
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
}

export interface DeploymentInfo {
  environment: string;
  endpoint?: string;
  lastUpdated: Date;
  version: string;
  scaling: ScalingConfig;
}

export interface Range {
  min: number;
  max: number;
  unit: string;
}

export interface AnomalyPattern {
  type: string;
  frequency?: string;
  duration?: number;
  recurrence?: boolean;
}

export interface MetricSnapshot {
  metrics: Record<string, number>;
  timestamp: Date;
  source: string;
}

export interface ImprovementMetrics {
  absolute: Record<string, number>;
  percentage: Record<string, number>;
  timeToRealize: number; // days
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  duration: number; // days
  resources: Resource[];
  risks: Risk[];
}

export interface ROICalculation {
  investment: number;
  returns: number;
  paybackPeriod: number; // months
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
}

export interface CorrelatedVariable {
  name: string;
  type: string;
  unit: string;
  source: string;
}

export interface TimeFrame {
  start: Date;
  end: Date;
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface Visualization {
  type: 'scatter' | 'line' | 'heatmap' | '3d';
  data: any;
  config: any;
}

export interface ForecastPeriod {
  start: Date;
  end: Date;
  granularity: string;
}

export interface ForecastData {
  values: TimeSeriesPoint[];
  trend: TrendComponent;
  seasonality: SeasonalComponent;
  confidence: ConfidenceBand[];
}

export interface DemandDriver {
  name: string;
  impact: number;
  type: 'internal' | 'external';
  controllable: boolean;
}

export interface SeasonalityPattern {
  period: string;
  amplitude: number;
  phase: number;
  strength: number;
}

export interface ForecastAccuracy {
  mape: number; // Mean Absolute Percentage Error
  rmse: number;
  bias: number;
  trackingSignal: number;
}

export interface ScenarioAnalysis {
  name: string;
  assumptions: Assumption[];
  results: ForecastData;
  probability: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
  probability?: number;
}

export interface SimulationParameter {
  name: string;
  type: string;
  baseValue: any;
  range?: Range;
  distribution?: string;
}

export interface SimulationResults {
  summary: Record<string, any>;
  details: SimulationRun[];
  statistics: SimulationStatistics;
  sensitivityAnalysis: SensitivityResult[];
}

// Additional Supporting Types
export interface TerpeneProfile {
  profile: Record<string, number>;
  dominantTerpenes: string[];
  aromaProfile: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface GrowthStage {
  stage: string;
  startDate: Date;
  duration: number;
  completed: boolean;
}

export interface CriticalDate {
  event: string;
  date: Date;
  importance: 'Low' | 'Medium' | 'High';
}

export interface Percentile {
  percentile: number;
  value: number;
}

export interface DistributionPoint {
  value: number;
  probability: number;
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum EffortLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'Very High'
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
}

export interface ImplementationStep {
  order: number;
  action: string;
  responsible: string;
  duration: number;
  dependencies: number[];
}

export interface Resource {
  type: string;
  quantity: number;
  cost: number;
}

export interface Risk {
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  actual?: number;
}

export interface TrendComponent {
  direction: 'up' | 'down' | 'stable';
  strength: number;
  equation?: string;
}

export interface SeasonalComponent {
  pattern: number[];
  period: number;
  strength: number;
}

export interface ConfidenceBand {
  timestamp: Date;
  lower: number;
  upper: number;
}

export interface Assumption {
  parameter: string;
  value: any;
  rationale: string;
}

export interface SimulationRun {
  iteration: number;
  parameters: Record<string, any>;
  results: Record<string, any>;
}

export interface SimulationStatistics {
  mean: Record<string, number>;
  median: Record<string, number>;
  stdDev: Record<string, number>;
  percentiles: Record<string, Percentile[]>;
}

export interface SensitivityResult {
  parameter: string;
  sensitivity: number;
  relationship: string;
  criticalRange?: Range;
}