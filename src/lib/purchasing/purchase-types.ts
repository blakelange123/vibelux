// Purchase Order & Vendor Management Types

export interface PurchaseOrderSystem {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  requisitions: PurchaseRequisition[];
  approvals: ApprovalWorkflow[];
  contracts: VendorContract[];
  invoices: Invoice[];
  receipts: GoodsReceipt[];
  performance: VendorPerformance[];
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  status: VendorStatus;
  category: VendorCategory;
  contacts: VendorContact[];
  addresses: Address[];
  paymentTerms: PaymentTerms;
  currency: string;
  taxId: string;
  certifications: Certification[];
  documents: VendorDocument[];
  bankDetails: BankDetails;
  rating: VendorRating;
  compliance: VendorCompliance;
  createdDate: Date;
  lastActivity: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: VendorReference;
  status: POStatus;
  type: POType;
  requisitionId?: string;
  requestedBy: string;
  approvedBy?: string;
  orderDate: Date;
  expectedDelivery: Date;
  deliveryLocation: string;
  items: POLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentTerms: string;
  notes?: string;
  attachments: Attachment[];
  approvalHistory: ApprovalStep[];
  deliveryStatus: DeliveryStatus;
  invoiceStatus: InvoiceStatus;
}

export interface PurchaseRequisition {
  id: string;
  requisitionNumber: string;
  requestedBy: string;
  department: string;
  status: RequisitionStatus;
  priority: Priority;
  requestDate: Date;
  neededBy: Date;
  justification: string;
  items: RequisitionItem[];
  estimatedTotal: number;
  approvalRequired: boolean;
  approvalChain: ApprovalChain;
  convertedToPO?: string;
}

export interface POLineItem {
  lineNumber: number;
  itemType: 'product' | 'service';
  itemCode: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  specifications?: ItemSpecification[];
  deliveryDate?: Date;
  receivedQuantity: number;
  invoicedQuantity: number;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poNumber: string;
  vendorName: string;
  receivedDate: Date;
  receivedBy: string;
  status: ReceiptStatus;
  items: ReceiptItem[];
  qualityCheck: QualityCheck;
  discrepancies: Discrepancy[];
  photos: string[];
  signature: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  poNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentDate?: Date;
  approvals: ApprovalStep[];
  disputes?: Dispute[];
}

export interface VendorContract {
  id: string;
  contractNumber: string;
  vendorId: string;
  type: ContractType;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  value: number;
  terms: ContractTerms;
  items: ContractItem[];
  sla: ServiceLevelAgreement;
  renewalTerms?: RenewalTerms;
  attachments: Attachment[];
  amendments: Amendment[];
}

export interface VendorPerformance {
  vendorId: string;
  period: PerformancePeriod;
  metrics: PerformanceMetrics;
  scorecard: Scorecard;
  issues: PerformanceIssue[];
  improvements: Improvement[];
}

// Enums
export enum VendorStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Suspended = 'Suspended',
  Blacklisted = 'Blacklisted'
}

export enum VendorCategory {
  Nutrients = 'Nutrients',
  GrowingMedia = 'Growing Media',
  Equipment = 'Equipment',
  Lighting = 'Lighting',
  HVAC = 'HVAC',
  Packaging = 'Packaging',
  Lab = 'Lab Services',
  Maintenance = 'Maintenance',
  Consulting = 'Consulting',
  Software = 'Software',
  Other = 'Other'
}

export enum POStatus {
  Draft = 'Draft',
  PendingApproval = 'Pending Approval',
  Approved = 'Approved',
  Sent = 'Sent',
  Acknowledged = 'Acknowledged',
  PartiallyDelivered = 'Partially Delivered',
  Delivered = 'Delivered',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum POType {
  Standard = 'Standard',
  Blanket = 'Blanket',
  Contract = 'Contract',
  Planned = 'Planned',
  Emergency = 'Emergency'
}

export enum RequisitionStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
  ConvertedToPO = 'Converted to PO'
}

export enum Priority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent',
  Emergency = 'Emergency'
}

export enum ReceiptStatus {
  Pending = 'Pending',
  PartiallyReceived = 'Partially Received',
  Received = 'Received',
  Rejected = 'Rejected',
  UnderInspection = 'Under Inspection'
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  PartiallyPaid = 'Partially Paid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Disputed = 'Disputed',
  Cancelled = 'Cancelled'
}

export enum ContractType {
  Purchase = 'Purchase',
  Service = 'Service',
  Maintenance = 'Maintenance',
  License = 'License',
  Framework = 'Framework'
}

export enum ContractStatus {
  Draft = 'Draft',
  UnderNegotiation = 'Under Negotiation',
  Active = 'Active',
  Expiring = 'Expiring',
  Expired = 'Expired',
  Terminated = 'Terminated',
  Renewed = 'Renewed'
}

// Supporting Interfaces
export interface VendorContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary: boolean;
  department?: string;
}

export interface Address {
  type: 'billing' | 'shipping' | 'both';
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentTerms {
  termCode: string;
  description: string;
  netDays: number;
  discountPercent?: number;
  discountDays?: number;
}

export interface Certification {
  type: string;
  number: string;
  issuedBy: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'Valid' | 'Expiring' | 'Expired';
  document?: string;
}

export interface VendorDocument {
  id: string;
  type: string;
  name: string;
  uploadDate: Date;
  expiryDate?: Date;
  url: string;
  verified: boolean;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
}

export interface VendorRating {
  overall: number; // 1-5
  quality: number;
  delivery: number;
  price: number;
  service: number;
  compliance: number;
  reviewCount: number;
  lastReview: Date;
}

export interface VendorCompliance {
  isCompliant: boolean;
  lastAudit?: Date;
  nextAudit?: Date;
  licenses: License[];
  insurance: Insurance[];
  violations: Violation[];
}

export interface VendorReference {
  id: string;
  name: string;
  code: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: 'PO' | 'Invoice' | 'Contract' | 'Vendor';
  conditions: ApprovalCondition[];
  steps: WorkflowStep[];
  escalation: EscalationRule[];
}

export interface ApprovalChain {
  workflowId: string;
  currentStep: number;
  steps: ApprovalStep[];
  startDate: Date;
  completionDate?: Date;
}

export interface ApprovalStep {
  stepNumber: number;
  approverRole: string;
  approver?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Skipped';
  date?: Date;
  comments?: string;
  conditions?: string[];
}

export interface RequisitionItem {
  itemCode?: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  preferredVendor?: string;
  justification?: string;
  attachments?: string[];
}

export interface ItemSpecification {
  attribute: string;
  value: string;
  required: boolean;
}

export interface DeliveryStatus {
  status: 'Pending' | 'InTransit' | 'Delivered' | 'Delayed';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export interface ReceiptItem {
  lineNumber: number;
  itemCode: string;
  description: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  condition: 'Good' | 'Damaged' | 'Defective';
  lotNumber?: string;
  expiryDate?: Date;
  location: string;
  notes?: string;
}

export interface QualityCheck {
  performed: boolean;
  performedBy?: string;
  date?: Date;
  passed?: boolean;
  findings?: string[];
  photos?: string[];
}

export interface Discrepancy {
  type: 'Quantity' | 'Quality' | 'Damage' | 'Wrong Item' | 'Missing';
  description: string;
  itemCode?: string;
  quantity?: number;
  resolution?: string;
  photos?: string[];
}

export interface InvoiceItem {
  poLineNumber?: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface PaymentMethod {
  type: 'Check' | 'ACH' | 'Wire' | 'Credit Card' | 'Cash';
  reference: string;
  details?: string;
}

export interface Dispute {
  id: string;
  type: 'Price' | 'Quantity' | 'Quality' | 'Delivery' | 'Other';
  description: string;
  amount?: number;
  raisedBy: string;
  raisedDate: Date;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Escalated';
  resolution?: string;
  resolvedDate?: Date;
}

export interface ContractTerms {
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms?: string;
  liabilityTerms?: string;
  terminationClause?: string;
  penaltyClause?: string;
}

export interface ContractItem {
  itemCode: string;
  description: string;
  category: string;
  priceType: 'Fixed' | 'Variable' | 'Tiered';
  unitPrice: number;
  minQuantity?: number;
  maxQuantity?: number;
  discountTiers?: DiscountTier[];
}

export interface ServiceLevelAgreement {
  deliveryTime: number; // days
  qualityStandard: string;
  availability: number; // percentage
  responseTime: number; // hours
  penalties: Penalty[];
}

export interface RenewalTerms {
  autoRenew: boolean;
  renewalPeriod: number; // months
  priceAdjustment?: string;
  noticePeriod: number; // days
}

export interface Amendment {
  id: string;
  date: Date;
  description: string;
  changes: string[];
  approvedBy: string;
  effectiveDate: Date;
}

export interface PerformancePeriod {
  startDate: Date;
  endDate: Date;
  type: 'Monthly' | 'Quarterly' | 'Annual';
}

export interface PerformanceMetrics {
  onTimeDelivery: number; // percentage
  qualityScore: number;
  priceVariance: number;
  responseTime: number; // hours
  defectRate: number;
  returnRate: number;
  orderAccuracy: number;
  documentationAccuracy: number;
}

export interface Scorecard {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  trend: 'Improving' | 'Stable' | 'Declining';
  ranking?: number;
  recommendations: string[];
}

export interface PerformanceIssue {
  id: string;
  date: Date;
  type: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  resolution?: string;
  preventiveAction?: string;
}

export interface Improvement {
  area: string;
  target: number;
  current: number;
  actions: string[];
  deadline: Date;
}

// Additional Supporting Types
export interface License {
  type: string;
  number: string;
  expiryDate: Date;
}

export interface Insurance {
  type: string;
  provider: string;
  policyNumber: string;
  coverage: number;
  expiryDate: Date;
}

export interface Violation {
  date: Date;
  type: string;
  description: string;
  severity: 'Minor' | 'Major' | 'Critical';
  resolved: boolean;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface WorkflowStep {
  stepNumber: number;
  name: string;
  approverType: 'Role' | 'User' | 'Manager';
  approver: string;
  conditions?: ApprovalCondition[];
  timeLimit?: number; // hours
}

export interface EscalationRule {
  afterHours: number;
  escalateTo: string;
  notifyList: string[];
}

export interface DiscountTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
}

export interface Penalty {
  condition: string;
  amount: number;
  type: 'Fixed' | 'Percentage';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  uploadedBy: string;
  url: string;
}