// Lean Six Sigma & Operational Excellence Tools

export interface LeanSixSigmaSystem {
  gembaWalks: GembaWalk[];
  dmaicProjects: DMAICProject[];
  fiveSAudits: FiveSAudit[];
  kaizens: KaizenEvent[];
  valueStreamMaps: ValueStreamMap[];
  rootCauseAnalyses: RootCauseAnalysis[];
  continuousImprovement: ContinuousImprovement;
}

export interface GembaWalk {
  id: string;
  date: Date;
  area: string;
  leader: string;
  participants: string[];
  purpose: string;
  observations: Observation[];
  opportunities: Opportunity[];
  actionItems: ActionItem[];
  followUpDate: Date;
  status: 'Scheduled' | 'Completed' | 'Overdue';
}

export interface Observation {
  category: ObservationCategory;
  description: string;
  severity: 'Good Practice' | 'Minor' | 'Major' | 'Critical';
  sopDeviation?: boolean;
  photo?: string;
  immediateAction?: string;
}

export interface DMAICProject {
  id: string;
  title: string;
  problem: string;
  goal: string;
  scope: string;
  team: ProjectTeam;
  phase: DMAICPhase;
  timeline: ProjectTimeline;
  metrics: ProjectMetrics;
  savings: ProjectSavings;
  status: ProjectStatus;
  documents: Document[];
}

export interface FiveSAudit {
  id: string;
  area: string;
  date: Date;
  auditor: string;
  scores: FiveSScores;
  findings: Finding[];
  improvements: string[];
  photos: AuditPhoto[];
  nextAuditDate: Date;
  trend: ScoreTrend;
}

export interface KaizenEvent {
  id: string;
  title: string;
  type: KaizenType;
  startDate: Date;
  endDate: Date;
  facilitator: string;
  team: string[];
  currentState: ProcessState;
  futureState: ProcessState;
  improvements: Improvement[];
  results: KaizenResults;
  sustainabilityPlan: SustainabilityPlan;
}

export interface ValueStreamMap {
  id: string;
  process: string;
  product: string;
  currentState: VSMState;
  futureState: VSMState;
  improvements: VSMImprovement[];
  implementation: Implementation;
  benefits: Benefits;
}

export interface RootCauseAnalysis {
  id: string;
  problem: string;
  date: Date;
  team: string[];
  method: RCAMethod;
  findings: RCAFinding[];
  rootCauses: RootCause[];
  solutions: Solution[];
  implementation: Implementation;
  effectiveness: EffectivenessCheck;
}

// Enums
export enum ObservationCategory {
  Safety = 'Safety',
  Quality = 'Quality',
  Productivity = 'Productivity',
  Organization = 'Organization',
  StandardWork = 'Standard Work',
  Training = 'Training',
  Equipment = 'Equipment',
  Waste = 'Waste'
}

export enum DMAICPhase {
  Define = 'Define',
  Measure = 'Measure',
  Analyze = 'Analyze',
  Improve = 'Improve',
  Control = 'Control'
}

export enum ProjectStatus {
  Planning = 'Planning',
  Active = 'Active',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum KaizenType {
  Process = 'Process',
  Quality = 'Quality',
  Safety = 'Safety',
  Productivity = 'Productivity',
  Cost = 'Cost',
  FlowTime = 'Flow Time'
}

export enum RCAMethod {
  FiveWhys = '5 Whys',
  Fishbone = 'Fishbone',
  FaultTree = 'Fault Tree',
  FMEA = 'FMEA',
  A3 = 'A3'
}

// Supporting Interfaces
export interface Opportunity {
  type: 'Quick Win' | 'Project' | 'Kaizen';
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  effort: 'Low' | 'Medium' | 'High';
  owner?: string;
  dueDate?: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  responsible: string;
  dueDate: Date;
  status: 'Open' | 'In Progress' | 'Completed';
  completedDate?: Date;
  notes?: string;
}

export interface ProjectTeam {
  champion: string;
  leader: string;
  members: TeamMember[];
  coach?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  allocation: number; // percentage
}

export interface ProjectTimeline {
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  milestones: Milestone[];
}

export interface Milestone {
  phase: string;
  targetDate: Date;
  actualDate?: Date;
  deliverables: string[];
  status: 'Pending' | 'Completed' | 'Delayed';
}

export interface ProjectMetrics {
  baseline: Metric[];
  current: Metric[];
  target: Metric[];
  improvement: number; // percentage
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  measurementDate: Date;
}

export interface ProjectSavings {
  hardSavings: number;
  softSavings: number;
  avoidedCosts: number;
  revenueIncrease: number;
  totalBenefit: number;
  roi: number;
  paybackPeriod: number; // months
}

export interface FiveSScores {
  sort: Score;
  setInOrder: Score;
  shine: Score;
  standardize: Score;
  sustain: Score;
  overall: number;
}

export interface Score {
  value: number; // 0-5
  criteria: string[];
  evidence: string[];
}

export interface Finding {
  sCategory: '1S' | '2S' | '3S' | '4S' | '5S';
  issue: string;
  location: string;
  photo?: string;
  corrected: boolean;
  correctionDate?: Date;
}

export interface AuditPhoto {
  category: string;
  type: 'Before' | 'After' | 'Good Practice';
  description: string;
  url: string;
  timestamp: Date;
}

export interface ScoreTrend {
  direction: 'Improving' | 'Stable' | 'Declining';
  change: number; // percentage
  history: HistoricalScore[];
}

export interface HistoricalScore {
  date: Date;
  overall: number;
  breakdown: FiveSScores;
}

export interface ProcessState {
  cycleTime: number;
  leadTime: number;
  processTime: number;
  waitTime: number;
  inventory: number;
  defectRate: number;
  firstPassYield: number;
  steps: ProcessStep[];
}

export interface ProcessStep {
  name: string;
  type: 'Value Add' | 'Non-Value Add' | 'Necessary Non-Value Add';
  time: number;
  distance?: number;
  inventory?: number;
  issues?: string[];
}

export interface Improvement {
  description: string;
  category: string;
  beforeMetric: number;
  afterMetric: number;
  improvement: number; // percentage
  sustainabilityRisk: 'Low' | 'Medium' | 'High';
}

export interface KaizenResults {
  metrics: BeforeAfterMetric[];
  savings: number;
  safetyImprovements: string[];
  qualityImprovements: string[];
  moraleImpact: 'Negative' | 'Neutral' | 'Positive';
}

export interface BeforeAfterMetric {
  metric: string;
  before: number;
  after: number;
  unit: string;
  improvement: number; // percentage
}

export interface SustainabilityPlan {
  standardWork: StandardWork[];
  training: TrainingPlan[];
  audits: AuditSchedule[];
  metrics: SustainabilityMetric[];
  owner: string;
}

export interface StandardWork {
  document: string;
  version: number;
  approvedBy: string;
  effectiveDate: Date;
  trainingRequired: boolean;
}

export interface TrainingPlan {
  topic: string;
  audience: string[];
  frequency: string;
  method: string;
  materials: string[];
}

export interface AuditSchedule {
  type: string;
  frequency: string;
  auditor: string;
  checklist: string;
}

export interface SustainabilityMetric {
  metric: string;
  target: number;
  frequency: string;
  responsible: string;
}

export interface VSMState {
  totalLeadTime: number;
  valueAddTime: number;
  processEfficiency: number;
  steps: VSMStep[];
  inventory: InventoryPoint[];
  informationFlow: InformationFlow[];
}

export interface VSMStep {
  process: string;
  cycleTime: number;
  setupTime: number;
  uptime: number;
  operators: number;
  shifts: number;
  yield: number;
}

export interface InventoryPoint {
  location: string;
  quantity: number;
  daysSupply: number;
  value: number;
}

export interface InformationFlow {
  from: string;
  to: string;
  method: string;
  frequency: string;
  issues?: string[];
}

export interface VSMImprovement {
  area: string;
  description: string;
  impact: VSMImpact;
  implementation: string;
  cost: number;
  timeline: number; // days
}

export interface VSMImpact {
  leadTimeReduction: number;
  inventoryReduction: number;
  qualityImprovement: number;
  costSaving: number;
}

export interface Implementation {
  steps: ImplementationStep[];
  resources: Resource[];
  risks: Risk[];
  timeline: number; // days
  budget: number;
}

export interface ImplementationStep {
  order: number;
  action: string;
  responsible: string;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Resource {
  type: string;
  description: string;
  quantity: number;
  cost: number;
  source: string;
}

export interface Risk {
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
}

export interface Benefits {
  financial: FinancialBenefit;
  operational: OperationalBenefit;
  quality: QualityBenefit;
  safety: SafetyBenefit;
}

export interface FinancialBenefit {
  annualSavings: number;
  oneTimeSavings: number;
  revenueIncrease: number;
  roi: number;
}

export interface OperationalBenefit {
  throughputIncrease: number;
  leadTimeReduction: number;
  uptimeImprovement: number;
  laborEfficiency: number;
}

export interface QualityBenefit {
  defectReduction: number;
  yieldImprovement: number;
  customerSatisfaction: number;
  reworkReduction: number;
}

export interface SafetyBenefit {
  incidentReduction: number;
  ergonomicScore: number;
  hazardsEliminated: number;
  nearMissReduction: number;
}

export interface RCAFinding {
  category: string;
  description: string;
  evidence: string[];
  contributionLevel: 'Primary' | 'Secondary' | 'Minor';
}

export interface RootCause {
  cause: string;
  category: 'People' | 'Process' | 'Equipment' | 'Material' | 'Environment' | 'Management';
  verified: boolean;
  verificationMethod: string;
}

export interface Solution {
  description: string;
  rootCauseAddressed: string[];
  effectiveness: 'Low' | 'Medium' | 'High';
  cost: number;
  implementation: 'Immediate' | 'Short Term' | 'Long Term';
  owner: string;
}

export interface EffectivenessCheck {
  date: Date;
  metric: string;
  target: number;
  actual: number;
  effective: boolean;
  nextCheckDate?: Date;
}

export interface ContinuousImprovement {
  suggestions: Suggestion[];
  projects: Project[];
  metrics: CIMetric[];
  recognition: Recognition[];
  training: CITraining[];
}

export interface Suggestion {
  id: string;
  submittedBy: string;
  date: Date;
  area: string;
  idea: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Implemented' | 'Rejected';
  savings?: number;
  implementation?: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  savings: number;
  completionDate?: Date;
}

export interface CIMetric {
  name: string;
  current: number;
  target: number;
  trend: 'Up' | 'Down' | 'Stable';
  unit: string;
}

export interface Recognition {
  employee: string;
  achievement: string;
  date: Date;
  category: string;
  impact: string;
}

export interface CITraining {
  topic: string;
  level: 'Awareness' | 'Practitioner' | 'Expert';
  participants: number;
  completionRate: number;
  nextSession?: Date;
}