// R&D and Experimentation Types

export interface Experiment {
  id: string;
  title: string;
  type: ExperimentType;
  status: ExperimentStatus;
  priority: Priority;
  hypothesis: string;
  objective: string;
  methodology: string;
  startDate: Date;
  endDate?: Date;
  duration: number; // days
  responsible: string;
  team: string[];
  controls: Control[];
  treatments: Treatment[];
  measurements: Measurement[];
  results?: Results;
  conclusions?: string;
  recommendations?: string[];
  roi?: ROICalculation;
  scalability: ScalabilityAssessment;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Trial {
  id: string;
  experimentId: string;
  name: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  replications: number;
  randomization: string;
  blockDesign: BlockDesign;
  plantCount: number;
  dataPoints: DataPoint[];
  status: TrialStatus;
  notes: string;
}

export interface CultivarScreening {
  id: string;
  crop: string;
  cultivars: Cultivar[];
  targetTraits: Trait[];
  growthConditions: GrowthConditions;
  evaluationCriteria: EvaluationCriteria[];
  results: CultivarResult[];
  recommendations: string[];
  createdAt: Date;
}

export interface PathogenTesting {
  id: string;
  sampleId: string;
  sampleType: SampleType;
  location: string;
  collectionDate: Date;
  testingDate: Date;
  pathogensDetected: Pathogen[];
  quantification: Quantification[];
  method: TestMethod;
  technician: string;
  actionTaken?: string;
  followUp?: FollowUp[];
}

export interface ProcessOptimization {
  id: string;
  process: string;
  currentPerformance: Performance;
  targetPerformance: Performance;
  improvements: Improvement[];
  implementation: Implementation;
  validation: Validation;
  savings: CostSavings;
  status: OptimizationStatus;
}

// Enums
export enum ExperimentType {
  YieldOptimization = 'Yield Optimization',
  QualityImprovement = 'Quality Improvement',
  DiseaseResistance = 'Disease Resistance',
  EnvironmentalOptimization = 'Environmental Optimization',
  NutrientOptimization = 'Nutrient Optimization',
  SystemInnovation = 'System Innovation',
  CultivarScreening = 'Cultivar Screening',
  ProcessImprovement = 'Process Improvement',
  CostReduction = 'Cost Reduction'
}

export enum ExperimentStatus {
  Planning = 'Planning',
  InProgress = 'In Progress',
  DataCollection = 'Data Collection',
  Analysis = 'Analysis',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  OnHold = 'On Hold'
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum TrialStatus {
  Setup = 'Setup',
  Active = 'Active',
  Harvesting = 'Harvesting',
  Complete = 'Complete',
  Failed = 'Failed'
}

export enum SampleType {
  Water = 'Water',
  Nutrient = 'Nutrient Solution',
  Plant = 'Plant Tissue',
  Root = 'Root',
  Seed = 'Seed',
  Media = 'Growing Media',
  Surface = 'Surface Swab',
  Air = 'Air Sample'
}

export enum TestMethod {
  PCR = 'PCR',
  ELISA = 'ELISA',
  PlateCount = 'Plate Count',
  Microscopy = 'Microscopy',
  NGS = 'Next-Gen Sequencing',
  RapidTest = 'Rapid Test Kit'
}

export enum OptimizationStatus {
  Identified = 'Identified',
  Testing = 'Testing',
  Validated = 'Validated',
  Implemented = 'Implemented',
  Monitoring = 'Monitoring'
}

// Supporting Interfaces
export interface Control {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
  applicationSchedule?: Schedule[];
}

export interface Parameter {
  name: string;
  value: number | string;
  unit?: string;
  range?: { min: number; max: number };
}

export interface Measurement {
  variable: string;
  method: string;
  frequency: string;
  equipment: string;
  accuracy: string;
  sop?: string;
}

export interface Results {
  summary: string;
  data: ResultData[];
  statistics: Statistics;
  graphs: Graph[];
  significantFindings: string[];
}

export interface ResultData {
  treatment: string;
  replicate: number;
  measurements: Record<string, number>;
  date: Date;
}

export interface Statistics {
  pValue: number;
  rSquared: number;
  cv: number; // Coefficient of variation
  lsd: number; // Least significant difference
  standardError: number;
}

export interface ROICalculation {
  investmentCost: number;
  implementationCost: number;
  annualSavings: number;
  paybackPeriod: number; // months
  npv: number; // Net present value
  irr: number; // Internal rate of return
}

export interface ScalabilityAssessment {
  feasibility: 'High' | 'Medium' | 'Low';
  requirements: string[];
  risks: string[];
  timeline: number; // months
  investmentNeeded: number;
}

export interface DataPoint {
  date: Date;
  measurements: Record<string, any>;
  notes?: string;
  images?: string[];
}

export interface BlockDesign {
  type: 'RCBD' | 'CRD' | 'Latin Square' | 'Split Plot';
  blocks: number;
  plotSize: number;
  layout: string[][];
}

export interface Cultivar {
  id: string;
  name: string;
  source: string;
  characteristics: Record<string, any>;
  parentage?: string;
}

export interface Trait {
  name: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  targetValue?: number;
  unit?: string;
}

export interface GrowthConditions {
  temperature: { day: number; night: number };
  humidity: number;
  ppfd: number;
  photoperiod: number;
  co2: number;
  vpd: number;
  nutrients: NutrientProfile;
}

export interface NutrientProfile {
  ec: number;
  ph: number;
  recipe: string;
  adjustments?: string[];
}

export interface EvaluationCriteria {
  metric: string;
  weight: number; // 0-100
  method: string;
  timing: string;
}

export interface CultivarResult {
  cultivarId: string;
  scores: Record<string, number>;
  overallScore: number;
  rank: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'Adopt' | 'Trial' | 'Reject';
}

export interface Pathogen {
  name: string;
  type: 'Fungal' | 'Bacterial' | 'Viral' | 'Oomycete';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  identified: boolean;
}

export interface Quantification {
  pathogen: string;
  count: number;
  unit: string;
  threshold: number;
  aboveThreshold: boolean;
}

export interface FollowUp {
  date: Date;
  action: string;
  result: string;
  nextSteps?: string;
}

export interface Performance {
  metric: string;
  value: number;
  unit: string;
  variability?: number;
}

export interface Improvement {
  description: string;
  expectedImpact: number; // percentage
  effort: 'Low' | 'Medium' | 'High';
  cost: number;
  timeline: number; // days
}

export interface Implementation {
  steps: Step[];
  resources: Resource[];
  timeline: number; // days
  risks: Risk[];
}

export interface Step {
  order: number;
  description: string;
  responsible: string;
  duration: number; // days
  dependencies?: number[]; // step orders
}

export interface Resource {
  type: 'Equipment' | 'Material' | 'Personnel' | 'Software';
  name: string;
  quantity: number;
  cost: number;
}

export interface Risk {
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
}

export interface Validation {
  method: string;
  criteria: string[];
  results: ValidationResult[];
  approved: boolean;
  approvedBy?: string;
  approvalDate?: Date;
}

export interface ValidationResult {
  criterion: string;
  target: number;
  actual: number;
  passed: boolean;
}

export interface CostSavings {
  laborHours: number;
  materialCost: number;
  energyCost: number;
  wastageReduction: number;
  qualityImprovement: number;
  totalAnnual: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Graph {
  title: string;
  type: 'Line' | 'Bar' | 'Scatter' | 'Box' | 'Heatmap';
  xAxis: string;
  yAxis: string;
  data: any[];
  imageUrl?: string;
}

export interface Schedule {
  week: number;
  action: string;
  amount?: number;
  unit?: string;
}