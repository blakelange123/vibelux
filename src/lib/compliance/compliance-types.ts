// Compliance Calendar Types

export interface ComplianceEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category: ComplianceCategory;
  dueDate: Date;
  reminderDays: number[];
  frequency: Frequency;
  status: EventStatus;
  priority: Priority;
  responsiblePerson: string;
  responsibleDepartment: string;
  regulatoryBody: string;
  referenceNumber?: string;
  attachments: Attachment[];
  completedDate?: Date;
  completedBy?: string;
  notes: string;
  recurringConfig?: RecurringConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceTask {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours?: number;
  completedDate?: Date;
  completedBy?: string;
  checklist: ChecklistItem[];
  documents: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface License {
  id: string;
  type: LicenseType;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  renewalDate: Date;
  status: LicenseStatus;
  holder: string;
  facility: string;
  fees: LicenseFee[];
  conditions: string[];
  documents: Document[];
  renewalTasks: ComplianceTask[];
  history: LicenseHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  id: string;
  type: InspectionType;
  scheduledDate: Date;
  actualDate?: Date;
  inspector: string;
  inspectorOrganization: string;
  status: InspectionStatus;
  areas: string[];
  findings: Finding[];
  correctiveActions: CorrectiveAction[];
  score?: number;
  passed?: boolean;
  reportUrl?: string;
  followUpDate?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Regulation {
  id: string;
  title: string;
  code: string;
  category: RegulationCategory;
  jurisdiction: string;
  effectiveDate: Date;
  summary: string;
  fullText: string;
  requirements: Requirement[];
  penalties: Penalty[];
  relatedRegulations: string[];
  updates: RegulationUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceReport {
  id: string;
  type: ReportType;
  period: string;
  dueDate: Date;
  submittedDate?: Date;
  status: ReportStatus;
  preparedBy: string;
  approvedBy?: string;
  submittedTo: string;
  data: any;
  attachments: Attachment[];
  errors: string[];
  warnings: string[];
  confirmationNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: string;
  title: string;
  type: TrainingType;
  category: TrainingCategory;
  required: boolean;
  frequency: Frequency;
  duration: number; // hours
  provider: string;
  description: string;
  objectives: string[];
  targetRoles: string[];
  completions: TrainingCompletion[];
  materials: Material[];
  expiryMonths?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum EventType {
  License = 'License Renewal',
  Report = 'Report Submission',
  Inspection = 'Inspection',
  Training = 'Training',
  Audit = 'Audit',
  Payment = 'Payment',
  Filing = 'Filing',
  Meeting = 'Meeting',
  Deadline = 'Deadline',
  Other = 'Other'
}

export enum ComplianceCategory {
  StateRegulatory = 'State Regulatory',
  LocalRegulatory = 'Local Regulatory',
  Federal = 'Federal',
  Environmental = 'Environmental',
  Safety = 'Safety',
  Quality = 'Quality',
  Financial = 'Financial',
  HR = 'Human Resources',
  Security = 'Security'
}

export enum Frequency {
  OneTime = 'One Time',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  SemiAnnual = 'Semi-Annual',
  Annual = 'Annual',
  Biennial = 'Biennial'
}

export enum EventStatus {
  Upcoming = 'Upcoming',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum TaskStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Blocked = 'Blocked',
  Cancelled = 'Cancelled'
}

export enum LicenseType {
  Cultivation = 'Cultivation',
  Manufacturing = 'Manufacturing',
  Distribution = 'Distribution',
  Retail = 'Retail',
  Testing = 'Testing',
  Microbusiness = 'Microbusiness',
  BusinessLicense = 'Business License',
  BuildingPermit = 'Building Permit',
  FirePermit = 'Fire Permit'
}

export enum LicenseStatus {
  Active = 'Active',
  Expired = 'Expired',
  Suspended = 'Suspended',
  Revoked = 'Revoked',
  Pending = 'Pending',
  InRenewal = 'In Renewal'
}

export enum InspectionType {
  StateCompliance = 'State Compliance',
  LocalCompliance = 'Local Compliance',
  Fire = 'Fire Safety',
  Health = 'Health Department',
  Building = 'Building Code',
  OSHA = 'OSHA',
  Environmental = 'Environmental',
  Security = 'Security',
  Quality = 'Quality'
}

export enum InspectionStatus {
  Scheduled = 'Scheduled',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Passed = 'Passed',
  Failed = 'Failed',
  PendingCorrections = 'Pending Corrections',
  Reinspection = 'Re-inspection Required'
}

export enum RegulationCategory {
  Cultivation = 'Cultivation',
  Processing = 'Processing',
  Testing = 'Testing',
  Packaging = 'Packaging',
  Labeling = 'Labeling',
  Advertising = 'Advertising',
  Security = 'Security',
  RecordKeeping = 'Record Keeping',
  Waste = 'Waste Disposal',
  Transportation = 'Transportation'
}

export enum ReportType {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Annual = 'Annual',
  Incident = 'Incident',
  Inventory = 'Inventory',
  Financial = 'Financial',
  Environmental = 'Environmental',
  Safety = 'Safety'
}

export enum ReportStatus {
  Draft = 'Draft',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Submitted = 'Submitted',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Revised = 'Revised'
}

export enum TrainingType {
  Onboarding = 'Onboarding',
  Compliance = 'Compliance',
  Safety = 'Safety',
  Security = 'Security',
  Quality = 'Quality',
  Technical = 'Technical',
  Management = 'Management'
}

export enum TrainingCategory {
  Required = 'Required',
  Recommended = 'Recommended',
  Optional = 'Optional',
  Certification = 'Certification'
}

// Supporting Interfaces
export interface RecurringConfig {
  frequency: Frequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthsOfYear?: number[];
  endDate?: Date;
  occurrences?: number;
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

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  required: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  version: string;
  url: string;
  expiryDate?: Date;
}

export interface LicenseFee {
  type: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  receiptNumber?: string;
}

export interface LicenseHistory {
  action: string;
  date: Date;
  performedBy: string;
  notes: string;
}

export interface Finding {
  id: string;
  category: string;
  description: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Observation';
  regulationReference?: string;
  correctionRequired: boolean;
  correctionDeadline?: Date;
  status: 'Open' | 'Corrected' | 'Verified';
}

export interface CorrectiveAction {
  id: string;
  findingId: string;
  description: string;
  responsiblePerson: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Verified';
  evidence: string[];
}

export interface Requirement {
  id: string;
  text: string;
  category: string;
  applicableTo: string[];
  documentation: string[];
  frequency?: Frequency;
}

export interface Penalty {
  violation: string;
  minFine: number;
  maxFine: number;
  otherPenalties: string[];
  criminalCharges: boolean;
}

export interface RegulationUpdate {
  date: Date;
  version: string;
  summary: string;
  changes: string[];
}

export interface TrainingCompletion {
  employeeId: string;
  employeeName: string;
  completedDate: Date;
  score?: number;
  certificateNumber?: string;
  expiryDate?: Date;
}

export interface Material {
  id: string;
  title: string;
  type: 'Video' | 'Document' | 'Presentation' | 'Quiz';
  url: string;
  duration?: number;
}