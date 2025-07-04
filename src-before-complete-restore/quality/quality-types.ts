// Quality Management System Types

export interface QualityDocument {
  id: string;
  type: DocumentType;
  title: string;
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  status: DocumentStatus;
  approvedBy: string;
  content: string;
  attachments: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CAPA {
  id: string;
  type: 'Corrective' | 'Preventive';
  issueDate: Date;
  status: CAPAStatus;
  priority: Priority;
  description: string;
  rootCause: string;
  proposedAction: string;
  responsiblePerson: string;
  targetDate: Date;
  completionDate?: Date;
  verificationDate?: Date;
  effectiveness: string;
  attachments: string[];
  relatedBatches: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LabResult {
  id: string;
  batchId: string;
  labName: string;
  sampleId: string;
  testDate: Date;
  status: TestStatus;
  cannabinoids: CannabinoidProfile;
  terpenes: TerpeneProfile;
  pesticides: PesticideResult[];
  heavyMetals: HeavyMetalResult[];
  microbials: MicrobialResult[];
  mycotoxins: MycotoxinResult[];
  moisture: number;
  waterActivity: number;
  foreignMatter: boolean;
  coaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface COA {
  id: string;
  batchId: string;
  labResultId: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  productName: string;
  productType: string;
  strain: string;
  lot: string;
  passedAllTests: boolean;
  qrCode: string;
  signature: string;
  notes: string;
  createdAt: Date;
}

export interface Deviation {
  id: string;
  date: Date;
  type: DeviationType;
  severity: Severity;
  description: string;
  immediateAction: string;
  investigationRequired: boolean;
  capaId?: string;
  affectedBatches: string[];
  reportedBy: string;
  status: DeviationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeControl {
  id: string;
  requestDate: Date;
  requestor: string;
  changeType: ChangeType;
  description: string;
  justification: string;
  impactAssessment: string;
  approvals: Approval[];
  implementationDate?: Date;
  verificationDate?: Date;
  status: ChangeControlStatus;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  certifications: Certification[];
  auditHistory: SupplierAudit[];
  scorecard: SupplierScorecard;
  approvalStatus: ApprovalStatus;
  approvedProducts: string[];
  contacts: Contact[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  version: string;
  cannabinoidLimits: {
    thc: { min: number; max: number };
    cbd: { min: number; max: number };
    cbg?: { min: number; max: number };
  };
  moistureLimits: { min: number; max: number };
  appearanceStandards: string[];
  odorProfile: string;
  testingRequirements: TestRequirement[];
  packagingSpecs: PackagingSpec[];
  storageConditions: string;
  shelfLife: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum DocumentType {
  SOP = 'SOP',
  WorkInstruction = 'Work Instruction',
  Form = 'Form',
  Policy = 'Policy',
  Specification = 'Specification',
  Certificate = 'Certificate',
}

export enum DocumentStatus {
  Draft = 'Draft',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Obsolete = 'Obsolete',
}

export enum CAPAStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Implemented = 'Implemented',
  Verified = 'Verified',
  Closed = 'Closed',
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum TestStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Passed = 'Passed',
  Failed = 'Failed',
  Retesting = 'Retesting',
}

export enum DeviationType {
  Environmental = 'Environmental',
  Process = 'Process',
  Equipment = 'Equipment',
  Material = 'Material',
  Documentation = 'Documentation',
  Testing = 'Testing',
}

export enum Severity {
  Critical = 'Critical',
  Major = 'Major',
  Minor = 'Minor',
}

export enum DeviationStatus {
  Open = 'Open',
  UnderInvestigation = 'Under Investigation',
  CAPARequired = 'CAPA Required',
  Closed = 'Closed',
}

export enum ChangeType {
  Process = 'Process',
  Equipment = 'Equipment',
  Facility = 'Facility',
  Software = 'Software',
  Supplier = 'Supplier',
  Document = 'Document',
}

export enum ChangeControlStatus {
  Draft = 'Draft',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Implemented = 'Implemented',
  Verified = 'Verified',
  Rejected = 'Rejected',
}

export enum SupplierType {
  Nutrients = 'Nutrients',
  Equipment = 'Equipment',
  Packaging = 'Packaging',
  Testing = 'Testing',
  Services = 'Services',
  Genetics = 'Genetics',
}

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Conditional = 'Conditional',
  Suspended = 'Suspended',
  Rejected = 'Rejected',
}

// Supporting interfaces
export interface CannabinoidProfile {
  thc: number;
  thca: number;
  cbd: number;
  cbda: number;
  cbg?: number;
  cbn?: number;
  cbc?: number;
  total: number;
}

export interface TerpeneProfile {
  myrcene?: number;
  limonene?: number;
  pinene?: number;
  linalool?: number;
  caryophyllene?: number;
  humulene?: number;
  terpinolene?: number;
  total: number;
}

export interface PesticideResult {
  analyte: string;
  result: number;
  lod: number;
  loq: number;
  limit: number;
  status: 'Pass' | 'Fail';
}

export interface HeavyMetalResult {
  metal: string;
  result: number;
  limit: number;
  unit: string;
  status: 'Pass' | 'Fail';
}

export interface MicrobialResult {
  organism: string;
  result: number;
  limit: number;
  unit: string;
  status: 'Pass' | 'Fail';
}

export interface MycotoxinResult {
  mycotoxin: string;
  result: number;
  limit: number;
  unit: string;
  status: 'Pass' | 'Fail';
}

export interface Approval {
  role: string;
  approver: string;
  date: Date;
  comments: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  certificateNumber: string;
  documentUrl?: string;
}

export interface SupplierAudit {
  date: Date;
  auditor: string;
  score: number;
  findings: string[];
  correctionsDue: Date;
  status: 'Passed' | 'Failed' | 'Conditional';
}

export interface SupplierScorecard {
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  overallScore: number;
  lastUpdated: Date;
}

export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface TestRequirement {
  test: string;
  frequency: string;
  method: string;
  acceptanceCriteria: string;
}

export interface PackagingSpec {
  type: string;
  material: string;
  size: string;
  labelRequirements: string[];
}