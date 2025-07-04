// Seed-to-Sale Tracking Types

export interface Plant {
  id: string;
  tagId: string;
  strain: string;
  plantBatchId: string;
  stage: PlantStage;
  location: string;
  room: string;
  section?: string;
  row?: string;
  position?: string;
  plantedDate: Date;
  vegetativeDate?: Date;
  floweringDate?: Date;
  harvestDate?: Date;
  destroyDate?: Date;
  motherPlantId?: string;
  height: number;
  health: HealthStatus;
  notes: string;
  waterings: WateringRecord[];
  feedings: FeedingRecord[];
  pestApplications: PestApplication[];
  movements: MovementRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantBatch {
  id: string;
  name: string;
  strain: string;
  type: BatchType;
  count: number;
  sourceType: SourceType;
  sourceBatchId?: string;
  plantedDate: Date;
  room: string;
  nutrients: NutrientMix[];
  ipm: IPMSchedule;
  trackingTags: string[];
  status: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Harvest {
  id: string;
  harvestBatchId: string;
  plantIds: string[];
  strain: string;
  harvestDate: Date;
  room: string;
  wetWeight: number;
  dryWeight?: number;
  wasteWeight: number;
  harvestType: HarvestType;
  dryingLocation: string;
  dryingStartDate: Date;
  dryingEndDate?: Date;
  trimmedWeight?: number;
  packagedWeight?: number;
  labSampleTaken: boolean;
  labResultId?: string;
  status: HarvestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  id: string;
  tagId: string;
  productType: ProductType;
  strain: string;
  harvestBatchId: string;
  weight: number;
  unitOfMeasure: UnitOfMeasure;
  packagedDate: Date;
  labResultId?: string;
  status: PackageStatus;
  location: string;
  price?: number;
  soldDate?: Date;
  soldTo?: string;
  manifestId?: string;
  remediationId?: string;
  childPackages: string[];
  parentPackageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transfer {
  id: string;
  manifestNumber: string;
  type: TransferType;
  status: TransferStatus;
  originLicense: string;
  destinationLicense: string;
  destinationFacility: string;
  driver: string;
  driverLicense: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  packages: TransferPackage[];
  departureDate: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  route: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceReport {
  id: string;
  type: ReportType;
  period: string;
  submittedDate: Date;
  status: ReportStatus;
  data: any;
  stateSystemId?: string;
  errors: ComplianceError[];
  warnings: ComplianceWarning[];
  createdAt: Date;
}

export interface WasteLog {
  id: string;
  date: Date;
  type: WasteType;
  reason: WasteReason;
  weight: number;
  unitOfMeasure: UnitOfMeasure;
  method: DisposalMethod;
  plantIds: string[];
  packageIds: string[];
  witnessName: string;
  notes: string;
  reportedToState: boolean;
  stateReportId?: string;
  createdAt: Date;
}

// State System Integration
export interface StateSystemConfig {
  system: 'METRC' | 'BioTrack' | 'Leaf';
  apiKey: string;
  userKey: string;
  licenseNumber: string;
  facilityId: string;
  endpoint: string;
  syncEnabled: boolean;
  lastSyncDate?: Date;
  syncInterval: number; // minutes
}

// Enums
export enum PlantStage {
  Clone = 'Clone',
  Vegetative = 'Vegetative',
  Flowering = 'Flowering',
  Harvested = 'Harvested',
  Destroyed = 'Destroyed',
}

export enum HealthStatus {
  Healthy = 'Healthy',
  PestIssue = 'Pest Issue',
  Disease = 'Disease',
  Nutrient = 'Nutrient Deficiency',
  Environmental = 'Environmental Stress',
  Quarantine = 'Quarantine',
}

export enum BatchType {
  Clone = 'Clone',
  Seed = 'Seed',
  Mother = 'Mother',
  Vegetative = 'Vegetative',
  Flowering = 'Flowering',
}

export enum SourceType {
  Seed = 'Seed',
  Clone = 'Clone',
  Mother = 'Mother',
  Purchase = 'Purchase',
}

export enum BatchStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Harvested = 'Harvested',
  Destroyed = 'Destroyed',
}

export enum HarvestType {
  Full = 'Full Plant',
  Partial = 'Partial',
  Manicure = 'Manicure',
}

export enum HarvestStatus {
  Drying = 'Drying',
  Curing = 'Curing',
  Processing = 'Processing',
  Complete = 'Complete',
}

export enum ProductType {
  Flower = 'Flower',
  Trim = 'Trim',
  Shake = 'Shake',
  PreRoll = 'Pre-Roll',
  Concentrate = 'Concentrate',
  Edible = 'Edible',
  Topical = 'Topical',
  Tincture = 'Tincture',
  Clone = 'Clone',
}

export enum UnitOfMeasure {
  Grams = 'g',
  Pounds = 'lb',
  Ounces = 'oz',
  Each = 'ea',
}

export enum PackageStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Sold = 'Sold',
  InTransit = 'In Transit',
  Remediation = 'Remediation',
  Destroyed = 'Destroyed',
}

export enum TransferType {
  Wholesale = 'Wholesale',
  Lab = 'Lab Sample',
  Waste = 'Waste',
  Return = 'Return',
  Internal = 'Internal',
}

export enum TransferStatus {
  Pending = 'Pending',
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  Rejected = 'Rejected',
  Void = 'Void',
}

export enum ReportType {
  Inventory = 'Inventory',
  Sales = 'Sales',
  Waste = 'Waste',
  Lab = 'Lab Results',
  Compliance = 'Compliance',
}

export enum ReportStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export enum WasteType {
  Plant = 'Plant',
  Product = 'Product',
  Byproduct = 'Byproduct',
}

export enum WasteReason {
  Disease = 'Disease',
  Pest = 'Pest Contamination',
  TestFailure = 'Failed Testing',
  Damage = 'Damage',
  Expiration = 'Expiration',
  Other = 'Other',
}

export enum DisposalMethod {
  Compost = 'Compost',
  Burn = 'Burn',
  Bury = 'Bury',
  WasteManagement = 'Waste Management',
  Rendered = 'Rendered Unusable',
}

// Supporting Interfaces
export interface WateringRecord {
  date: Date;
  amount: number;
  ph: number;
  ec: number;
  runoff: number;
  notes?: string;
}

export interface FeedingRecord {
  date: Date;
  nutrients: string[];
  ec: number;
  ph: number;
  amount: number;
  notes?: string;
}

export interface PestApplication {
  date: Date;
  product: string;
  activeIngredient: string;
  concentration: number;
  applicationMethod: string;
  applicator: string;
  rei: number; // re-entry interval in hours
  notes?: string;
}

export interface MovementRecord {
  date: Date;
  fromLocation: string;
  toLocation: string;
  reason: string;
  movedBy: string;
}

export interface NutrientMix {
  name: string;
  npk: string;
  concentration: number;
  schedule: string;
}

export interface IPMSchedule {
  preventative: IPMApplication[];
  scouting: ScoutingSchedule;
  thresholds: PestThreshold[];
}

export interface IPMApplication {
  product: string;
  frequency: string;
  lastApplied?: Date;
  nextDue: Date;
}

export interface ScoutingSchedule {
  frequency: string;
  lastScouted?: Date;
  nextDue: Date;
}

export interface PestThreshold {
  pest: string;
  threshold: number;
  action: string;
}

export interface TransferPackage {
  packageId: string;
  tagId: string;
  productType: string;
  weight: number;
  unitPrice: number;
  labResultId?: string;
}

export interface ComplianceError {
  code: string;
  message: string;
  field?: string;
  severity: 'Critical' | 'Error';
}

export interface ComplianceWarning {
  code: string;
  message: string;
  field?: string;
}