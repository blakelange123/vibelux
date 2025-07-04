// Nutrient and Inventory Management System

export interface NutrientManagementSystem {
  stockTanks: StockTank[];
  recipes: NutrientRecipe[];
  inventory: NutrientInventory;
  schedules: FertilizationSchedule[];
  monitoring: WaterQualityMonitoring;
  automation: AutomationSettings;
}

export interface StockTank {
  id: string;
  name: string;
  location: string;
  capacity: number; // liters
  currentVolume: number;
  recipe: NutrientRecipe;
  status: TankStatus;
  ec: ECReading;
  ph: PHReading;
  temperature: number;
  lastRefill: Date;
  nextRefillDue: Date;
  cleaningDue: Date;
  alarms: TankAlarm[];
  history: TankHistory[];
}

export interface NutrientRecipe {
  id: string;
  name: string;
  crop: string;
  stage: GrowthStage;
  version: number;
  targetEC: number;
  targetPH: number;
  nutrients: NutrientComponent[];
  micronutrients: MicronutrientComponent[];
  additives: Additive[];
  mixingInstructions: MixingInstruction[];
  validatedBy: string;
  validationDate: Date;
  notes: string;
}

export interface NutrientInventory {
  stockLevels: StockLevel[];
  reorderPoints: ReorderPoint[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  consumption: ConsumptionTracking;
  forecasting: InventoryForecast;
}

export interface FertilizationSchedule {
  id: string;
  zone: string;
  crops: string[];
  activeRecipe: string;
  irrigationEvents: IrrigationEvent[];
  adjustments: RecipeAdjustment[];
  automationEnabled: boolean;
  nextFeedTime: Date;
}

export interface WaterQualityMonitoring {
  sourceWater: WaterSource;
  treatmentSystem: WaterTreatment;
  qualityTests: QualityTest[];
  alerts: WaterAlert[];
  trends: QualityTrend[];
}

// Detailed Interfaces
export interface NutrientComponent {
  name: string;
  formula: string;
  concentration: number; // g/L or mL/L
  elementalContent: ElementalContent;
  supplier: string;
  cost: number;
  solubilityLimit: number;
  compatibilityIssues?: string[];
}

export interface ElementalContent {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium?: number;
  magnesium?: number;
  sulfur?: number;
}

export interface MicronutrientComponent {
  name: string;
  elements: MicroElement[];
  concentration: number; // mg/L
  chelated: boolean;
  stability: pHRange;
}

export interface MicroElement {
  element: 'Fe' | 'Mn' | 'Zn' | 'Cu' | 'B' | 'Mo' | 'Cl';
  concentration: number;
  form: string;
}

export interface Additive {
  name: string;
  type: AdditiveType;
  purpose: string;
  concentration: number;
  applicationTiming: string;
  precautions?: string[];
}

export interface MixingInstruction {
  step: number;
  action: string;
  component: string;
  amount: number;
  unit: string;
  notes?: string;
  safety?: string;
}

export interface StockLevel {
  productId: string;
  productName: string;
  currentQuantity: number;
  unit: string;
  location: string;
  lotNumber: string;
  expiryDate?: Date;
  lastUpdated: Date;
  value: number;
}

export interface ReorderPoint {
  productId: string;
  minLevel: number;
  maxLevel: number;
  reorderQuantity: number;
  leadTime: number; // days
  supplier: string;
  autoReorder: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  products: string[];
  leadTime: number;
  minimumOrder: number;
  pricing: PricingTier[];
  performance: SupplierPerformance;
  certifications: string[];
  contact: ContactInfo;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: OrderItem[];
  status: OrderStatus;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  totalCost: number;
  notes: string;
}

export interface ConsumptionTracking {
  daily: DailyConsumption[];
  weekly: WeeklyConsumption[];
  byZone: ZoneConsumption[];
  byCrop: CropConsumption[];
  efficiency: ConsumptionEfficiency;
}

export interface InventoryForecast {
  predictions: ForecastPrediction[];
  seasonalTrends: SeasonalTrend[];
  suggestedOrders: SuggestedOrder[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface IrrigationEvent {
  timestamp: Date;
  duration: number; // minutes
  volume: number; // liters
  ec: number;
  ph: number;
  runoffVolume?: number;
  runoffEC?: number;
  runoffPH?: number;
}

export interface RecipeAdjustment {
  date: Date;
  parameter: 'EC' | 'pH' | 'Nutrient';
  originalValue: number;
  adjustedValue: number;
  reason: string;
  adjustedBy: string;
  result: string;
}

export interface WaterSource {
  type: 'Municipal' | 'Well' | 'RO' | 'Rainwater';
  quality: SourceWaterQuality;
  treatment: string[];
  testFrequency: string;
  lastTest: Date;
}

export interface WaterTreatment {
  stages: TreatmentStage[];
  capacity: number; // L/hour
  efficiency: number; // percentage
  maintenanceSchedule: MaintenanceItem[];
  consumables: Consumable[];
}

export interface QualityTest {
  id: string;
  date: Date;
  type: 'Source' | 'Treated' | 'Tank' | 'Runoff';
  parameters: WaterParameters;
  passedSpecs: boolean;
  technician: string;
  actions?: string[];
}

// Enums
export enum TankStatus {
  Active = 'Active',
  Refilling = 'Refilling',
  Cleaning = 'Cleaning',
  Maintenance = 'Maintenance',
  Offline = 'Offline'
}

export enum GrowthStage {
  Germination = 'Germination',
  Seedling = 'Seedling',
  Vegetative = 'Vegetative',
  Flowering = 'Flowering',
  Fruiting = 'Fruiting',
  Harvest = 'Harvest'
}

export enum AdditiveType {
  pH_Up = 'pH Up',
  pH_Down = 'pH Down',
  Biostimulant = 'Biostimulant',
  Surfactant = 'Surfactant',
  Chelator = 'Chelator',
  Sanitizer = 'Sanitizer'
}

export enum OrderStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Confirmed = 'Confirmed',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

// Supporting Types
export interface ECReading {
  value: number;
  timestamp: Date;
  calibrated: boolean;
  drift: number;
}

export interface PHReading {
  value: number;
  timestamp: Date;
  calibrated: boolean;
  temperature: number;
}

export interface TankAlarm {
  type: 'Low Level' | 'High EC' | 'Low EC' | 'pH Drift' | 'Temperature';
  severity: 'Warning' | 'Critical';
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface TankHistory {
  event: 'Refill' | 'Adjustment' | 'Cleaning' | 'Alarm';
  timestamp: Date;
  details: string;
  performedBy: string;
}

export interface pHRange {
  min: number;
  max: number;
  optimal: number;
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  discount?: number;
}

export interface SupplierPerformance {
  onTimeDelivery: number; // percentage
  qualityScore: number;
  responseTime: number; // hours
  issueResolution: number; // percentage
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DailyConsumption {
  date: Date;
  nutrients: Record<string, number>;
  water: number;
  cost: number;
}

export interface WeeklyConsumption {
  weekNumber: number;
  startDate: Date;
  totalNutrients: Record<string, number>;
  totalWater: number;
  totalCost: number;
  efficiency: number;
}

export interface ZoneConsumption {
  zoneId: string;
  zoneName: string;
  nutrients: Record<string, number>;
  water: number;
  plantsCount: number;
  efficiency: number;
}

export interface CropConsumption {
  crop: string;
  stage: string;
  averageDaily: Record<string, number>;
  totalToDate: Record<string, number>;
  costPerUnit: number;
}

export interface ConsumptionEfficiency {
  nutrientUtilization: number; // percentage
  waterEfficiency: number;
  costPerKg: number;
  wastePercentage: number;
  improvementAreas: string[];
}

export interface ForecastPrediction {
  product: string;
  nextWeek: number;
  nextMonth: number;
  confidence: number;
  factors: string[];
}

export interface SeasonalTrend {
  product: string;
  season: string;
  averageConsumption: number;
  peakMonth: string;
  variance: number;
}

export interface SuggestedOrder {
  supplier: string;
  items: OrderItem[];
  suggestedDate: Date;
  reason: string;
  savings: number;
}

export interface OptimizationOpportunity {
  type: 'Bulk Purchase' | 'Supplier Switch' | 'Recipe Optimization';
  description: string;
  potentialSavings: number;
  implementation: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface SourceWaterQuality {
  hardness: number;
  alkalinity: number;
  chlorine: number;
  sodium: number;
  heavyMetals: Record<string, number>;
  microbial: boolean;
}

export interface TreatmentStage {
  name: string;
  type: string;
  removalEfficiency: Record<string, number>;
  maintenanceInterval: number; // days
  lastMaintenance: Date;
}

export interface MaintenanceItem {
  equipment: string;
  task: string;
  frequency: string;
  lastPerformed: Date;
  nextDue: Date;
  procedure: string;
}

export interface Consumable {
  name: string;
  type: string;
  currentLevel: number;
  usageRate: number;
  reorderPoint: number;
  supplier: string;
}

export interface WaterParameters {
  ec: number;
  ph: number;
  temperature: number;
  dissolvedOxygen?: number;
  turbidity?: number;
  nutrients?: Record<string, number>;
  contaminants?: Record<string, number>;
}

export interface WaterAlert {
  parameter: string;
  value: number;
  threshold: number;
  location: string;
  timestamp: Date;
  severity: 'Low' | 'Medium' | 'High';
  action: string;
}

export interface QualityTrend {
  parameter: string;
  period: string;
  average: number;
  trend: 'Stable' | 'Increasing' | 'Decreasing';
  correlation?: string;
}

export interface AutomationSettings {
  enabled: boolean;
  mode: 'Manual' | 'Semi-Auto' | 'Full-Auto';
  dossingPumps: DossingPump[];
  mixingSystem: MixingSystem;
  monitoringProbes: Probe[];
  alarmSettings: AlarmConfig[];
}

export interface DossingPump {
  id: string;
  nutrient: string;
  flowRate: number; // mL/min
  calibration: Date;
  status: 'Online' | 'Offline' | 'Error';
}

export interface MixingSystem {
  tankId: string;
  mixerSpeed: number; // RPM
  mixingTime: number; // minutes
  sequence: string[];
}

export interface Probe {
  id: string;
  type: 'EC' | 'pH' | 'DO' | 'Temperature';
  location: string;
  calibrationDue: Date;
  accuracy: number;
  status: 'Good' | 'Drift' | 'Failed';
}

export interface AlarmConfig {
  parameter: string;
  lowThreshold: number;
  highThreshold: number;
  deadband: number;
  delay: number; // seconds
  escalation: string[];
}