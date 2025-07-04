// Supply Chain Management Types

export interface SupplyChainSystem {
  inventory: Inventory[];
  suppliers: Supplier[];
  orders: SupplyOrder[];
  shipments: Shipment[];
  warehouses: Warehouse[];
  transfers: InventoryTransfer[];
  demandForecasts: DemandForecast[];
  analytics: SupplyChainAnalytics;
}

export interface Inventory {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: InventoryCategory;
  type: InventoryType;
  unit: UnitOfMeasure;
  currentStock: StockLevel;
  movements: InventoryMovement[];
  locations: InventoryLocation[];
  costs: InventoryCost;
  specifications: ItemSpecification[];
  certifications: ItemCertification[];
  expiryTracking?: ExpiryInfo;
  batchTracking?: BatchInfo[];
  qualityRequirements?: QualityRequirement[];
  handlingInstructions?: string;
  hazmatInfo?: HazmatInfo;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: SupplierType;
  status: SupplierStatus;
  contact: ContactDetails;
  products: SuppliedProduct[];
  performance: SupplierPerformance;
  agreements: SupplyAgreement[];
  leadTimes: LeadTimeInfo[];
  minimumOrders: MinimumOrder[];
  paymentTerms: string;
  certifications: SupplierCertification[];
  qualityRating: number;
  reliabilityScore: number;
  preferredStatus: boolean;
}

export interface SupplyOrder {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  supplier: SupplierReference;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  items: OrderItem[];
  shipping: ShippingInfo;
  costs: OrderCosts;
  tracking: TrackingInfo;
  documents: OrderDocument[];
  qualityChecks: QualityCheck[];
  issues: OrderIssue[];
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  origin: Location;
  destination: Location;
  carrier: CarrierInfo;
  status: ShipmentStatus;
  items: ShipmentItem[];
  tracking: DetailedTracking;
  documents: ShippingDocument[];
  temperature?: TemperatureLog[];
  security: SecurityInfo;
  costs: ShipmentCosts;
  timeline: ShipmentTimeline;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: WarehouseType;
  location: Address;
  capacity: WarehouseCapacity;
  zones: WarehouseZone[];
  inventory: WarehouseInventory[];
  staff: WarehouseStaff[];
  equipment: WarehouseEquipment[];
  operatingHours: OperatingSchedule;
  certifications: string[];
  climate: ClimateControl;
}

export interface InventoryTransfer {
  id: string;
  transferNumber: string;
  type: TransferType;
  status: TransferStatus;
  fromLocation: string;
  toLocation: string;
  requestedBy: string;
  requestedDate: Date;
  approvedBy?: string;
  approvalDate?: Date;
  items: TransferItem[];
  reason: string;
  priority: Priority;
  completedDate?: Date;
  notes?: string;
}

export interface DemandForecast {
  id: string;
  product: string;
  period: ForecastPeriod;
  method: ForecastMethod;
  predictions: PredictionData[];
  accuracy: ForecastAccuracy;
  factors: DemandFactor[];
  seasonality: SeasonalPattern;
  confidence: ConfidenceLevel;
  adjustments: ManualAdjustment[];
}

// Enums
export enum InventoryCategory {
  RawMaterials = 'Raw Materials',
  Nutrients = 'Nutrients',
  GrowingMedia = 'Growing Media',
  Packaging = 'Packaging',
  Supplies = 'Supplies',
  Equipment = 'Equipment',
  Safety = 'Safety',
  Chemicals = 'Chemicals',
  Seeds = 'Seeds',
  Consumables = 'Consumables'
}

export enum InventoryType {
  Stockable = 'Stockable',
  Consumable = 'Consumable',
  Serialized = 'Serialized',
  Batch = 'Batch',
  Perishable = 'Perishable',
  Hazardous = 'Hazardous'
}

export enum UnitOfMeasure {
  Each = 'Each',
  Kilogram = 'kg',
  Gram = 'g',
  Liter = 'L',
  Milliliter = 'mL',
  Meter = 'm',
  SquareMeter = 'm²',
  CubicMeter = 'm³',
  Box = 'Box',
  Pallet = 'Pallet',
  Case = 'Case'
}

export enum SupplierType {
  Manufacturer = 'Manufacturer',
  Distributor = 'Distributor',
  Wholesaler = 'Wholesaler',
  DirectImporter = 'Direct Importer',
  LocalSupplier = 'Local Supplier'
}

export enum SupplierStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Suspended = 'Suspended',
  Preferred = 'Preferred'
}

export enum OrderType {
  Purchase = 'Purchase',
  Replenishment = 'Replenishment',
  Emergency = 'Emergency',
  Blanket = 'Blanket',
  Scheduled = 'Scheduled'
}

export enum OrderStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Confirmed = 'Confirmed',
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  PartiallyDelivered = 'Partially Delivered',
  Cancelled = 'Cancelled',
  OnHold = 'On Hold'
}

export enum ShipmentStatus {
  Preparing = 'Preparing',
  AwaitingPickup = 'Awaiting Pickup',
  InTransit = 'In Transit',
  OutForDelivery = 'Out for Delivery',
  Delivered = 'Delivered',
  Delayed = 'Delayed',
  Lost = 'Lost',
  Damaged = 'Damaged'
}

export enum WarehouseType {
  Central = 'Central',
  Distribution = 'Distribution',
  ColdStorage = 'Cold Storage',
  Quarantine = 'Quarantine',
  Overflow = 'Overflow'
}

export enum TransferType {
  Internal = 'Internal',
  Intercompany = 'Intercompany',
  Emergency = 'Emergency',
  Rebalancing = 'Rebalancing',
  Return = 'Return'
}

export enum TransferStatus {
  Requested = 'Requested',
  Approved = 'Approved',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
  Critical = 'Critical'
}

export enum ForecastMethod {
  MovingAverage = 'Moving Average',
  ExponentialSmoothing = 'Exponential Smoothing',
  ARIMA = 'ARIMA',
  MachineLearning = 'Machine Learning',
  Seasonal = 'Seasonal',
  Hybrid = 'Hybrid'
}

// Supporting Interfaces
export interface StockLevel {
  onHand: number;
  available: number;
  allocated: number;
  onOrder: number;
  inTransit: number;
  quarantine: number;
  damaged: number;
  total: number;
  reorderPoint: number;
  safetyStock: number;
  maxStock: number;
}

export interface InventoryMovement {
  id: string;
  date: Date;
  type: MovementType;
  quantity: number;
  unit: UnitOfMeasure;
  reference: string;
  reason: string;
  performedBy: string;
  fromLocation?: string;
  toLocation?: string;
  cost?: number;
  notes?: string;
}

export interface InventoryLocation {
  warehouseId: string;
  zone: string;
  bin: string;
  quantity: number;
  status: LocationStatus;
  lastCounted?: Date;
  lastMovement?: Date;
}

export interface InventoryCost {
  unitCost: number;
  averageCost: number;
  lastCost: number;
  standardCost: number;
  totalValue: number;
  currency: string;
  lastUpdated: Date;
}

export interface ItemSpecification {
  attribute: string;
  value: string;
  unit?: string;
  critical: boolean;
}

export interface ItemCertification {
  type: string;
  number: string;
  issuedBy: string;
  validUntil: Date;
  document?: string;
}

export interface ExpiryInfo {
  trackExpiry: boolean;
  shelfLife: number; // days
  expiryDate?: Date;
  bestBefore?: Date;
  alertDays: number;
}

export interface BatchInfo {
  batchNumber: string;
  manufacturingDate: Date;
  expiryDate?: Date;
  quantity: number;
  location: string;
  qualityStatus: string;
  certificateOfAnalysis?: string;
}

export interface QualityRequirement {
  parameter: string;
  specification: string;
  testMethod: string;
  frequency: string;
}

export interface HazmatInfo {
  classification: string;
  unNumber: string;
  packingGroup: string;
  handlingInstructions: string;
  emergencyContact: string;
  sds: string; // Safety Data Sheet URL
}

export interface ContactDetails {
  primaryContact: Contact;
  alternateContacts: Contact[];
  addresses: Address[];
  website?: string;
}

export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
}

export interface Address {
  type: 'billing' | 'shipping' | 'both';
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SuppliedProduct {
  productId: string;
  supplierSKU: string;
  description: string;
  unitPrice: number;
  currency: string;
  moq: number; // Minimum Order Quantity
  leadTime: number; // days
  packSize: number;
  availability: 'In Stock' | 'Made to Order' | 'Limited' | 'Discontinued';
}

export interface SupplierPerformance {
  onTimeDelivery: number; // percentage
  qualityScore: number;
  responsiveness: number;
  priceCompetitiveness: number;
  overallRating: number;
  totalOrders: number;
  successfulOrders: number;
  issues: number;
  lastReview: Date;
}

export interface SupplyAgreement {
  agreementNumber: string;
  type: 'Contract' | 'Blanket' | 'Spot';
  startDate: Date;
  endDate: Date;
  terms: string[];
  pricingTerms: PricingTerms;
  volumeCommitments?: VolumeCommitment[];
  penalties?: Penalty[];
}

export interface LeadTimeInfo {
  productCategory: string;
  standardLeadTime: number;
  rushLeadTime?: number;
  rushCost?: number;
  factors: string[];
}

export interface MinimumOrder {
  type: 'Value' | 'Quantity' | 'Weight';
  value: number;
  unit: string;
  products?: string[];
}

export interface SupplierCertification {
  type: string;
  number: string;
  issuingBody: string;
  validUntil: Date;
  scope: string[];
  document?: string;
}

export interface SupplierReference {
  id: string;
  name: string;
  code: string;
}

export interface OrderItem {
  lineNumber: number;
  productId: string;
  sku: string;
  description: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  requestedDelivery?: Date;
  confirmedDelivery?: Date;
  receivedQuantity?: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  rejectionReason?: string;
}

export interface ShippingInfo {
  method: string;
  carrier?: string;
  service: string;
  account?: string;
  instructions?: string;
  incoterms?: string;
}

export interface OrderCosts {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  other: number;
  total: number;
  currency: string;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: Date;
  currentStatus: string;
  lastUpdate: Date;
  events: TrackingEvent[];
}

export interface OrderDocument {
  type: 'PO' | 'Invoice' | 'PackingList' | 'COA' | 'Other';
  name: string;
  url: string;
  uploadDate: Date;
}

export interface QualityCheck {
  parameter: string;
  specification: string;
  result: string;
  passed: boolean;
  checkedBy: string;
  checkedDate: Date;
  notes?: string;
}

export interface OrderIssue {
  type: 'Quality' | 'Quantity' | 'Delivery' | 'Documentation' | 'Other';
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedDate: Date;
  reportedBy: string;
  resolution?: string;
  resolvedDate?: Date;
}

export interface Location {
  type: 'Warehouse' | 'Supplier' | 'Customer' | 'Transit';
  id: string;
  name: string;
  address: Address;
}

export interface CarrierInfo {
  name: string;
  service: string;
  contact: Contact;
  account?: string;
}

export interface ShipmentItem {
  orderItemId?: string;
  productId: string;
  quantity: number;
  unit: UnitOfMeasure;
  weight?: number;
  volume?: number;
  pallets?: number;
  serialNumbers?: string[];
  batchNumbers?: string[];
}

export interface DetailedTracking {
  currentLocation: string;
  currentStatus: ShipmentStatus;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  events: TrackingEvent[];
  milestones: ShipmentMilestone[];
  alerts: TrackingAlert[];
}

export interface TrackingEvent {
  timestamp: Date;
  location: string;
  status: string;
  description: string;
  details?: string;
}

export interface ShippingDocument {
  type: 'BillOfLading' | 'PackingList' | 'CustomsDeclaration' | 'Insurance' | 'Other';
  documentNumber: string;
  url: string;
  required: boolean;
  submitted: boolean;
}

export interface TemperatureLog {
  timestamp: Date;
  temperature: number;
  humidity?: number;
  location?: string;
  withinRange: boolean;
}

export interface SecurityInfo {
  sealNumber?: string;
  sealIntact?: boolean;
  inspections: SecurityInspection[];
  incidents?: SecurityIncident[];
}

export interface ShipmentCosts {
  freight: number;
  insurance: number;
  customs?: number;
  handling: number;
  other: number;
  total: number;
  currency: string;
}

export interface ShipmentTimeline {
  created: Date;
  pickedUp?: Date;
  inTransit?: Date;
  customsCleared?: Date;
  outForDelivery?: Date;
  delivered?: Date;
  estimatedTransitTime: number; // hours
  actualTransitTime?: number;
}

export interface WarehouseCapacity {
  totalSpace: number; // square meters
  usedSpace: number;
  availableSpace: number;
  rackingCapacity: number; // pallets
  usedRacking: number;
  floorCapacity: number;
  usedFloor: number;
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'Receiving' | 'Storage' | 'Picking' | 'Packing' | 'Shipping' | 'Quarantine';
  capacity: number;
  currentOccupancy: number;
  temperatureControlled: boolean;
  temperatureRange?: { min: number; max: number };
  securityLevel: 'Standard' | 'High' | 'Restricted';
}

export interface WarehouseInventory {
  productId: string;
  locations: StorageLocation[];
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  lastCycleCount?: Date;
  accuracy?: number;
}

export interface WarehouseStaff {
  id: string;
  name: string;
  role: string;
  shift: string;
  certifications: string[];
  productivity?: number;
}

export interface WarehouseEquipment {
  type: string;
  quantity: number;
  available: number;
  underMaintenance: number;
}

export interface OperatingSchedule {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
  holidays: string[];
}

export interface ClimateControl {
  controlled: boolean;
  temperature?: { min: number; max: number; unit: 'C' | 'F' };
  humidity?: { min: number; max: number };
  monitoring: boolean;
  alerts: boolean;
}

export interface TransferItem {
  productId: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  transferredQuantity?: number;
  unit: UnitOfMeasure;
  batchNumbers?: string[];
  reason?: string;
}

export interface ForecastPeriod {
  start: Date;
  end: Date;
  granularity: 'Daily' | 'Weekly' | 'Monthly';
}

export interface PredictionData {
  date: Date;
  predictedDemand: number;
  actualDemand?: number;
  upperBound: number;
  lowerBound: number;
  confidence: number;
}

export interface ForecastAccuracy {
  mape: number; // Mean Absolute Percentage Error
  mad: number; // Mean Absolute Deviation
  mse: number; // Mean Squared Error
  trackingSignal: number;
  bias: number;
}

export interface DemandFactor {
  name: string;
  type: 'Internal' | 'External';
  impact: number;
  description: string;
}

export interface SeasonalPattern {
  identified: boolean;
  period: number; // days
  amplitude: number;
  peaks: string[];
  troughs: string[];
}

export interface ConfidenceLevel {
  level: number; // percentage
  factors: string[];
  dataQuality: 'High' | 'Medium' | 'Low';
}

export interface ManualAdjustment {
  date: Date;
  originalValue: number;
  adjustedValue: number;
  reason: string;
  adjustedBy: string;
}

export interface SupplyChainAnalytics {
  inventoryMetrics: InventoryMetrics;
  supplierMetrics: SupplierMetrics;
  warehouseMetrics: WarehouseMetrics;
  costMetrics: CostMetrics;
  performanceMetrics: PerformanceMetrics;
}

export interface InventoryMetrics {
  totalValue: number;
  turnoverRate: number;
  stockoutRate: number;
  excessInventory: number;
  deadStock: number;
  carryingCost: number;
  daysOfSupply: number;
  fillRate: number;
}

export interface SupplierMetrics {
  activeSuppliers: number;
  averageLeadTime: number;
  onTimeDeliveryRate: number;
  defectRate: number;
  costSavings: number;
  supplierConcentration: number;
}

export interface WarehouseMetrics {
  utilizationRate: number;
  pickingAccuracy: number;
  orderFulfillmentRate: number;
  averagePickTime: number;
  inventoryAccuracy: number;
  damagedGoodsRate: number;
}

export interface CostMetrics {
  totalProcurementCost: number;
  transportationCost: number;
  warehousingCost: number;
  inventoryHoldingCost: number;
  orderingCost: number;
  stockoutCost: number;
}

export interface PerformanceMetrics {
  perfectOrderRate: number;
  orderCycleTime: number;
  cashToOrderCycle: number;
  supplyChainResponseTime: number;
  forecastAccuracy: number;
}

// Additional Supporting Types
export enum MovementType {
  Receipt = 'Receipt',
  Issue = 'Issue',
  Transfer = 'Transfer',
  Adjustment = 'Adjustment',
  Return = 'Return',
  Scrap = 'Scrap',
  CycleCount = 'Cycle Count'
}

export enum LocationStatus {
  Active = 'Active',
  Reserved = 'Reserved',
  Blocked = 'Blocked',
  Maintenance = 'Maintenance'
}

export interface PricingTerms {
  basePrice: number;
  currency: string;
  validUntil: Date;
  discountTiers?: DiscountTier[];
  surcharges?: Surcharge[];
}

export interface DiscountTier {
  minQuantity: number;
  discount: number;
  type: 'Percentage' | 'Fixed';
}

export interface Surcharge {
  type: string;
  amount: number;
  conditions: string;
}

export interface VolumeCommitment {
  product: string;
  minVolume: number;
  period: string;
  penalty?: number;
}

export interface Penalty {
  condition: string;
  amount: number;
  type: 'Fixed' | 'Percentage';
}

export interface StorageLocation {
  zone: string;
  bin: string;
  quantity: number;
  lotNumber?: string;
  expiryDate?: Date;
}

export interface ShipmentMilestone {
  name: string;
  plannedDate: Date;
  actualDate?: Date;
  status: 'Pending' | 'Completed' | 'Delayed';
}

export interface TrackingAlert {
  type: 'Delay' | 'Damage' | 'Route Change' | 'Temperature' | 'Security';
  message: string;
  severity: 'Low' | 'Medium' | 'High';
  timestamp: Date;
}

export interface SecurityInspection {
  date: Date;
  location: string;
  inspector: string;
  passed: boolean;
  findings?: string[];
}

export interface SecurityIncident {
  date: Date;
  type: string;
  description: string;
  resolution?: string;
}