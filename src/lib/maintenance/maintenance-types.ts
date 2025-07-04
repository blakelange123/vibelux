// Equipment Maintenance & Asset Management Types

export interface MaintenanceSystem {
  equipment: Equipment[];
  maintenanceSchedules: MaintenanceSchedule[];
  workOrders: WorkOrder[];
  maintenancePlans: MaintenancePlan[];
  spareParts: SparePart[];
  vendors: MaintenanceVendor[];
  history: MaintenanceHistory[];
  metrics: MaintenanceMetrics;
}

export interface Equipment {
  id: string;
  assetTag: string;
  name: string;
  category: EquipmentCategory;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  location: Location;
  purchaseInfo: PurchaseInfo;
  specifications: Specification[];
  criticality: CriticalityLevel;
  parentEquipment?: string;
  childEquipment?: string[];
  documents: Document[];
  warranty: Warranty;
  lifecycle: LifecycleInfo;
  performance: PerformanceMetrics;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  frequency: Frequency;
  lastPerformed?: Date;
  nextDue: Date;
  estimatedDuration: number; // hours
  requiredParts: RequiredPart[];
  requiredSkills: string[];
  procedures: Procedure[];
  safetyRequirements: SafetyRequirement[];
  priority: Priority;
  assignedTo?: string;
  alerts: Alert[];
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: Priority;
  equipmentId: string;
  scheduleId?: string;
  requestedBy: string;
  requestedDate: Date;
  description: string;
  assignedTo?: string;
  assignedDate?: Date;
  scheduledDate?: Date;
  startedDate?: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  tasks: MaintenanceTask[];
  partsUsed: PartUsage[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  attachments: Attachment[];
  failureAnalysis?: FailureAnalysis;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  equipmentCategory: EquipmentCategory;
  type: PlanType;
  description: string;
  tasks: PlannedTask[];
  triggers: MaintenanceTrigger[];
  estimatedAnnualCost: number;
  complianceRequirements: ComplianceRequirement[];
  effectiveness: PlanEffectiveness;
}

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: PartCategory;
  manufacturer: string;
  compatibility: string[];
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: string;
  unitCost: number;
  supplier: SupplierInfo;
  leadTime: number; // days
  criticalPart: boolean;
  alternatives: string[];
}

export interface MaintenanceHistory {
  id: string;
  equipmentId: string;
  workOrderId: string;
  date: Date;
  type: MaintenanceType;
  performedBy: string;
  duration: number;
  description: string;
  findings: string[];
  actions: string[];
  partsReplaced: ReplacedPart[];
  cost: MaintenanceCost;
  nextRecommendations?: string[];
  performance: PerformanceSnapshot;
}

// Enums
export enum EquipmentCategory {
  HVAC = 'HVAC',
  Lighting = 'Lighting',
  Irrigation = 'Irrigation',
  Electrical = 'Electrical',
  Automation = 'Automation',
  Processing = 'Processing',
  Packaging = 'Packaging',
  Laboratory = 'Laboratory',
  Safety = 'Safety',
  Facility = 'Facility'
}

export enum EquipmentStatus {
  Operational = 'Operational',
  Degraded = 'Degraded',
  UnderMaintenance = 'Under Maintenance',
  Failed = 'Failed',
  Standby = 'Standby',
  Decommissioned = 'Decommissioned'
}

export enum MaintenanceType {
  Preventive = 'Preventive',
  Predictive = 'Predictive',
  Corrective = 'Corrective',
  Emergency = 'Emergency',
  Calibration = 'Calibration',
  Inspection = 'Inspection',
  Overhaul = 'Overhaul'
}

export enum WorkOrderType {
  Scheduled = 'Scheduled',
  Unscheduled = 'Unscheduled',
  Emergency = 'Emergency',
  Preventive = 'Preventive',
  Corrective = 'Corrective',
  Predictive = 'Predictive'
}

export enum WorkOrderStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Scheduled = 'Scheduled',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Closed = 'Closed'
}

export enum Priority {
  Emergency = 'Emergency',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Routine = 'Routine'
}

export enum CriticalityLevel {
  Critical = 'Critical',
  Essential = 'Essential',
  Important = 'Important',
  Standard = 'Standard',
  NonCritical = 'Non-Critical'
}

export enum PlanType {
  TimeBased = 'Time-Based',
  ConditionBased = 'Condition-Based',
  UsageBased = 'Usage-Based',
  Predictive = 'Predictive',
  RunToFailure = 'Run-to-Failure'
}

export enum PartCategory {
  Mechanical = 'Mechanical',
  Electrical = 'Electrical',
  Electronic = 'Electronic',
  Hydraulic = 'Hydraulic',
  Pneumatic = 'Pneumatic',
  Consumable = 'Consumable',
  Safety = 'Safety'
}

// Supporting Interfaces
export interface Location {
  building: string;
  room: string;
  area?: string;
  coordinates?: GPSCoordinates;
}

export interface PurchaseInfo {
  vendor: string;
  purchaseDate: Date;
  purchasePrice: number;
  purchaseOrder?: string;
  installationDate: Date;
  commissioningDate?: Date;
}

export interface Specification {
  parameter: string;
  value: string;
  unit?: string;
}

export interface Warranty {
  provider: string;
  startDate: Date;
  endDate: Date;
  type: 'Parts' | 'Labor' | 'Comprehensive';
  terms: string;
  contactInfo: ContactInfo;
}

export interface LifecycleInfo {
  expectedLifespan: number; // years
  currentAge: number; // years
  replacementCost: number;
  depreciationRate: number;
  endOfLife?: Date;
}

export interface PerformanceMetrics {
  availability: number; // percentage
  reliability: number; // MTBF in hours
  performance: number; // percentage
  oee?: number; // Overall Equipment Effectiveness
  failureRate: number;
  maintenanceCostRatio: number;
}

export interface Frequency {
  type: 'Calendar' | 'Runtime' | 'Cycles' | 'Condition';
  interval: number;
  unit: string;
  tolerance?: number; // percentage
}

export interface RequiredPart {
  partId: string;
  quantity: number;
  optional: boolean;
}

export interface Procedure {
  stepNumber: number;
  description: string;
  estimatedTime: number; // minutes
  safetyNote?: string;
  tools?: string[];
  specifications?: string[];
  acceptanceCriteria?: string;
}

export interface SafetyRequirement {
  type: 'PPE' | 'Lockout' | 'Permit' | 'Training';
  description: string;
  mandatory: boolean;
}

export interface Alert {
  type: 'Due' | 'Overdue' | 'Upcoming' | 'Critical';
  message: string;
  date: Date;
  acknowledged?: boolean;
}

export interface MaintenanceTask {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  findings?: string;
  pass?: boolean;
}

export interface PartUsage {
  partId: string;
  quantity: number;
  serialNumbers?: string[];
  cost: number;
}

export interface FailureAnalysis {
  failureMode: string;
  rootCause: string;
  impactAssessment: ImpactAssessment;
  correctiveActions: string[];
  preventiveActions: string[];
}

export interface PlannedTask {
  name: string;
  description: string;
  frequency: Frequency;
  estimatedDuration: number;
  requiredSkills: string[];
  procedures: string[];
}

export interface MaintenanceTrigger {
  type: 'Time' | 'Usage' | 'Condition' | 'Event';
  condition: string;
  threshold: number;
  unit: string;
}

export interface ComplianceRequirement {
  regulation: string;
  requirement: string;
  frequency: string;
  documentation: string[];
}

export interface PlanEffectiveness {
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
  availability: number;
  complianceRate: number;
  costSavings: number;
}

export interface SupplierInfo {
  name: string;
  partNumber: string;
  leadTime: number;
  minimumOrder: number;
  pricing: PricingTier[];
}

export interface ReplacedPart {
  partId: string;
  oldSerialNumber?: string;
  newSerialNumber?: string;
  reason: string;
}

export interface MaintenanceCost {
  labor: number;
  parts: number;
  external: number;
  downtime: number;
  total: number;
}

export interface PerformanceSnapshot {
  metrics: Record<string, number>;
  readings: Record<string, number>;
  condition: string;
}

export interface MaintenanceVendor {
  id: string;
  name: string;
  type: VendorType;
  specializations: string[];
  certifications: string[];
  contact: ContactInfo;
  responseTime: number; // hours
  rates: ServiceRate[];
  rating: number;
  contracts: ServiceContract[];
}

export interface MaintenanceMetrics {
  overview: {
    totalEquipment: number;
    operationalEquipment: number;
    scheduledMaintenance: number;
    overdueMaintenace: number;
    openWorkOrders: number;
    mtbf: number;
    mttr: number;
    availability: number;
  };
  costs: {
    monthlyAverage: number;
    yearToDate: number;
    preventiveCost: number;
    correctiveCost: number;
    emergencyCost: number;
    laborCost: number;
    partsCost: number;
  };
  performance: {
    pmCompliance: number; // Preventive Maintenance
    scheduleAdherence: number;
    firstTimeFixRate: number;
    workOrderBacklog: number;
    emergencyRate: number;
  };
  reliability: {
    failureRate: number;
    criticalEquipmentUptime: number;
    unplannedDowntime: number;
    repeatFailures: number;
  };
}

// Additional Supporting Types
export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadDate: Date;
  version?: string;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
}

export interface PricingTier {
  minQuantity: number;
  unitPrice: number;
}

export interface ImpactAssessment {
  safety: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  production: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  quality: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  compliance: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  financial: number;
}

export enum VendorType {
  OEM = 'OEM',
  Contractor = 'Contractor',
  Specialist = 'Specialist',
  General = 'General'
}

export interface ServiceRate {
  type: 'Regular' | 'Overtime' | 'Emergency' | 'Weekend';
  rate: number;
  minimumHours?: number;
}

export interface ServiceContract {
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  scope: string[];
  sla: ServiceLevelAgreement;
}

export interface ServiceLevelAgreement {
  responseTime: number; // hours
  resolutionTime: number; // hours
  availability: number; // percentage
  penalties?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}