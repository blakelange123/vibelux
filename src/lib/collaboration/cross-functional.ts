// Cross-Functional Collaboration & R&D to Production Pipeline

export interface CrossFunctionalSystem {
  projects: CrossFunctionalProject[];
  pipeline: R2DPipeline[];
  collaborations: CollaborationHub[];
  knowledgeTransfer: KnowledgeTransfer[];
  decisionForums: DecisionForum[];
  performanceMetrics: CollaborationMetrics;
}

export interface CrossFunctionalProject {
  id: string;
  title: string;
  objective: string;
  stage: ProjectStage;
  priority: Priority;
  departments: Department[];
  timeline: Timeline;
  deliverables: Deliverable[];
  dependencies: Dependency[];
  risks: Risk[];
  communications: Communication[];
  decisions: Decision[];
  results: ProjectResults;
  status: ProjectStatus;
}

export interface R2DPipeline {
  id: string;
  innovation: Innovation;
  stages: PipelineStage[];
  currentStage: string;
  readinessLevel: number; // 1-9 TRL scale
  scalingStrategy: ScalingStrategy;
  validations: Validation[];
  transitions: StageTransition[];
  commercialization: Commercialization;
}

export interface CollaborationHub {
  id: string;
  name: string;
  purpose: string;
  teams: Team[];
  workstreams: Workstream[];
  meetings: Meeting[];
  artifacts: Artifact[];
  metrics: HubMetrics;
}

export interface KnowledgeTransfer {
  id: string;
  type: TransferType;
  source: KnowledgeSource;
  target: KnowledgeTarget;
  content: Content;
  method: TransferMethod;
  effectiveness: Effectiveness;
  retention: RetentionPlan;
}

export interface DecisionForum {
  id: string;
  name: string;
  type: ForumType;
  frequency: string;
  participants: Participant[];
  charter: Charter;
  decisions: ForumDecision[];
  effectiveness: ForumEffectiveness;
}

// Enums
export enum ProjectStage {
  Ideation = 'Ideation',
  Feasibility = 'Feasibility',
  Development = 'Development',
  Pilot = 'Pilot',
  Validation = 'Validation',
  ScaleUp = 'Scale-Up',
  Production = 'Production',
  Optimization = 'Optimization'
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum ProjectStatus {
  Planning = 'Planning',
  Active = 'Active',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum TransferType {
  Technical = 'Technical',
  Process = 'Process',
  Operational = 'Operational',
  Cultural = 'Cultural',
  Strategic = 'Strategic'
}

export enum ForumType {
  Strategic = 'Strategic',
  Tactical = 'Tactical',
  Operational = 'Operational',
  Technical = 'Technical',
  Emergency = 'Emergency'
}

// Supporting Interfaces
export interface Department {
  name: string;
  lead: string;
  members: string[];
  responsibilities: string[];
  commitments: Commitment[];
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  criticalPath: CriticalPath[];
  buffer: number; // days
}

export interface Milestone {
  name: string;
  date: Date;
  deliverables: string[];
  dependencies: string[];
  status: 'Pending' | 'On Track' | 'At Risk' | 'Completed' | 'Delayed';
  owner: string;
}

export interface CriticalPath {
  activity: string;
  duration: number;
  predecessors: string[];
  slack: number;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  owner: string;
  dueDate: Date;
  status: DeliverableStatus;
  acceptanceCriteria: string[];
  approvers: string[];
  artifacts: string[];
}

export interface Dependency {
  type: 'Internal' | 'External' | 'Resource' | 'Technical';
  description: string;
  owner: string;
  requiredBy: Date;
  status: 'Available' | 'Pending' | 'Blocked';
  mitigation?: string;
}

export interface Risk {
  id: string;
  description: string;
  probability: RiskLevel;
  impact: RiskLevel;
  category: string;
  owner: string;
  mitigation: string;
  contingency: string;
  status: 'Active' | 'Mitigated' | 'Accepted' | 'Closed';
}

export interface Communication {
  type: 'Update' | 'Decision' | 'Issue' | 'Request';
  from: string;
  to: string[];
  subject: string;
  content: string;
  date: Date;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  responseRequired: boolean;
  responses?: Response[];
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  options: Option[];
  selectedOption: string;
  rationale: string;
  decisionMaker: string;
  stakeholders: string[];
  date: Date;
  impact: string;
  reversible: boolean;
}

export interface ProjectResults {
  achievements: Achievement[];
  metrics: ResultMetric[];
  lessonsLearned: Lesson[];
  recommendations: string[];
  nextSteps: string[];
}

export interface Innovation {
  title: string;
  description: string;
  source: 'R&D' | 'Operations' | 'External' | 'Customer';
  inventor: string;
  potentialImpact: Impact;
  intellectualProperty: IP[];
}

export interface PipelineStage {
  name: string;
  objectives: string[];
  entryGate: Gate;
  exitGate: Gate;
  activities: Activity[];
  duration: number; // days
  resources: Resource[];
  deliverables: string[];
  status: StageStatus;
}

export interface Gate {
  criteria: Criterion[];
  reviewers: string[];
  decision: 'Go' | 'No-Go' | 'Hold' | 'Pending';
  date?: Date;
  feedback?: string[];
}

export interface Criterion {
  description: string;
  metric: string;
  target: number;
  actual?: number;
  met: boolean;
}

export interface ScalingStrategy {
  approach: 'Phased' | 'Parallel' | 'Big Bang';
  phases: ScalingPhase[];
  resourceRequirements: ResourceRequirement[];
  risks: ScalingRisk[];
  timeline: number; // months
}

export interface ScalingPhase {
  name: string;
  scope: string;
  successCriteria: string[];
  duration: number; // weeks
  resources: string[];
}

export interface Validation {
  type: 'Technical' | 'Operational' | 'Financial' | 'Market';
  method: string;
  results: ValidationResult;
  date: Date;
  validator: string;
  documentation: string[];
}

export interface StageTransition {
  from: string;
  to: string;
  date: Date;
  approvedBy: string[];
  conditions: string[];
  issues?: string[];
  duration: number; // days
}

export interface Commercialization {
  strategy: string;
  marketSize: number;
  targetCustomers: string[];
  pricing: PricingStrategy;
  launchPlan: LaunchPlan;
  partnerships: Partnership[];
}

export interface Team {
  name: string;
  purpose: string;
  lead: string;
  members: Member[];
  charter: string;
  metrics: TeamMetric[];
  health: TeamHealth;
}

export interface Workstream {
  id: string;
  name: string;
  objective: string;
  lead: string;
  activities: WorkstreamActivity[];
  dependencies: string[];
  deliverables: string[];
  status: WorkstreamStatus;
}

export interface Meeting {
  id: string;
  type: string;
  purpose: string;
  frequency: string;
  attendees: string[];
  agenda: AgendaItem[];
  outcomes: Outcome[];
  actionItems: ActionItem[];
  effectiveness: number; // 0-100
}

export interface Artifact {
  id: string;
  name: string;
  type: string;
  version: string;
  owner: string;
  created: Date;
  modified: Date;
  url: string;
  tags: string[];
}

export interface HubMetrics {
  collaborationIndex: number;
  decisionVelocity: number;
  knowledgeSharing: number;
  projectSuccess: number;
  innovationRate: number;
}

export interface KnowledgeSource {
  type: 'Expert' | 'Document' | 'System' | 'Experience';
  identifier: string;
  expertise: string[];
  availability: string;
}

export interface KnowledgeTarget {
  audience: string[];
  currentLevel: string;
  targetLevel: string;
  gaps: string[];
}

export interface Content {
  topics: Topic[];
  format: 'Document' | 'Video' | 'Training' | 'Mentoring' | 'Workshop';
  complexity: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: number; // hours
}

export interface TransferMethod {
  approach: string;
  tools: string[];
  schedule: Schedule[];
  assessment: Assessment;
}

export interface Effectiveness {
  preAssessment: number;
  postAssessment: number;
  retention30Day: number;
  retention90Day: number;
  applicationRate: number;
}

export interface RetentionPlan {
  refresherSchedule: string;
  practiceOpportunities: string[];
  mentoring: boolean;
  documentation: string[];
}

export interface Participant {
  name: string;
  role: string;
  department: string;
  decisionAuthority: string;
  attendance: number; // percentage
}

export interface Charter {
  purpose: string;
  scope: string[];
  authority: string[];
  processes: Process[];
  metrics: string[];
}

export interface ForumDecision {
  id: string;
  topic: string;
  decision: string;
  date: Date;
  participants: string[];
  votingRecord?: VotingRecord;
  implementation: string;
  followUp: FollowUp[];
}

export interface ForumEffectiveness {
  decisionQuality: number;
  implementationRate: number;
  timeToDecision: number; // days
  stakeholderSatisfaction: number;
  revisitRate: number; // percentage
}

// Additional Supporting Types
export enum DeliverableStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum RiskLevel {
  VeryLow = 'Very Low',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'Very High'
}

export enum StageStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
  Cancelled = 'Cancelled'
}

export enum WorkstreamStatus {
  Planning = 'Planning',
  Active = 'Active',
  Blocked = 'Blocked',
  Complete = 'Complete'
}

export interface Commitment {
  resource: string;
  allocation: number; // percentage
  startDate: Date;
  endDate: Date;
}

export interface Response {
  from: string;
  content: string;
  date: Date;
  actionRequired?: string;
}

export interface Option {
  name: string;
  pros: string[];
  cons: string[];
  cost: number;
  risk: string;
  recommendation: boolean;
}

export interface Achievement {
  description: string;
  metric: string;
  target: number;
  actual: number;
  variance: number;
}

export interface ResultMetric {
  name: string;
  baseline: number;
  target: number;
  actual: number;
  unit: string;
  trend: 'Improving' | 'Stable' | 'Declining';
}

export interface Lesson {
  category: string;
  observation: string;
  impact: string;
  recommendation: string;
  applicability: string[];
}

export interface Impact {
  financial: number;
  operational: string;
  strategic: string;
  timeframe: string;
}

export interface IP {
  type: 'Patent' | 'Trade Secret' | 'Copyright' | 'Trademark';
  status: 'Filed' | 'Pending' | 'Granted' | 'Abandoned';
  filingDate?: Date;
  number?: string;
}

export interface Activity {
  name: string;
  owner: string;
  duration: number;
  dependencies: string[];
  status: 'Pending' | 'Active' | 'Complete';
}

export interface Resource {
  type: 'Human' | 'Equipment' | 'Material' | 'Financial';
  quantity: number;
  unit: string;
  availability: string;
}

export interface ResourceRequirement {
  phase: string;
  resources: Resource[];
  timing: string;
  criticalPath: boolean;
}

export interface ScalingRisk {
  description: string;
  phase: string;
  probability: RiskLevel;
  impact: RiskLevel;
  mitigation: string;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  findings: string[];
  recommendations: string[];
}

export interface PricingStrategy {
  model: string;
  pricePoint: number;
  competitivePosition: string;
  marginTarget: number;
}

export interface LaunchPlan {
  phases: LaunchPhase[];
  marketing: MarketingPlan;
  sales: SalesPlan;
  support: SupportPlan;
}

export interface LaunchPhase {
  name: string;
  targets: string[];
  duration: number;
  successMetrics: string[];
}

export interface Partnership {
  partner: string;
  type: string;
  terms: string;
  value: number;
}

export interface Member {
  name: string;
  role: string;
  skills: string[];
  allocation: number;
  performance: number;
}

export interface TeamMetric {
  metric: string;
  target: number;
  current: number;
  trend: string;
}

export interface TeamHealth {
  morale: number;
  collaboration: number;
  productivity: number;
  innovation: number;
  retention: number;
}

export interface WorkstreamActivity {
  name: string;
  owner: string;
  startDate: Date;
  endDate: Date;
  status: string;
  blockers?: string[];
}

export interface AgendaItem {
  topic: string;
  presenter: string;
  duration: number;
  type: 'Information' | 'Discussion' | 'Decision';
}

export interface Outcome {
  item: string;
  result: string;
  owner?: string;
  dueDate?: Date;
}

export interface ActionItem {
  action: string;
  owner: string;
  dueDate: Date;
  priority: string;
  status: string;
}

export interface Topic {
  name: string;
  objectives: string[];
  content: string;
  examples: string[];
  exercises: string[];
}

export interface Schedule {
  session: string;
  date: Date;
  duration: number;
  location: string;
  facilitator: string;
}

export interface Assessment {
  method: string;
  criteria: string[];
  passingScore: number;
  retakeAllowed: boolean;
}

export interface Process {
  name: string;
  steps: string[];
  owner: string;
  documentation: string;
}

export interface VotingRecord {
  method: 'Consensus' | 'Majority' | 'Unanimous';
  votes: Vote[];
  result: string;
}

export interface Vote {
  participant: string;
  vote: 'For' | 'Against' | 'Abstain';
  rationale?: string;
}

export interface FollowUp {
  action: string;
  owner: string;
  dueDate: Date;
  status: string;
  notes?: string;
}