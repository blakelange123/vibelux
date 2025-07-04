// Mobile App Types & Interfaces

export interface MobileApp {
  user: MobileUser;
  offlineData: OfflineData;
  syncStatus: SyncStatus;
  deviceInfo: DeviceInfo;
  permissions: MobilePermissions;
}

export interface MobileUser {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  authToken: string;
  refreshToken: string;
  lastSync: Date;
  preferences: UserPreferences;
}

export interface OfflineData {
  tasks: OfflineTask[];
  plants: OfflinePlant[];
  inventory: OfflineInventory[];
  readings: OfflineReading[];
  photos: OfflinePhoto[];
  signatures: OfflineSignature[];
  pendingSync: PendingSync[];
}

export interface SyncStatus {
  lastSync: Date;
  pendingItems: number;
  syncInProgress: boolean;
  conflicts: SyncConflict[];
  networkStatus: 'online' | 'offline' | 'syncing';
  dataUsage: DataUsage;
}

export interface DeviceInfo {
  id: string;
  platform: 'ios' | 'android';
  version: string;
  model: string;
  storage: StorageInfo;
  battery: BatteryInfo;
  capabilities: DeviceCapabilities;
}

export interface MobilePermissions {
  camera: boolean;
  location: boolean;
  notifications: boolean;
  storage: boolean;
  biometric: boolean;
}

// Barcode Scanning
export interface BarcodeScanner {
  scan(): Promise<ScanResult>;
  scanBatch(): Promise<ScanResult[]>;
  generateBarcode(data: string, type: BarcodeType): string;
  validateBarcode(code: string, type: BarcodeType): boolean;
}

export interface ScanResult {
  code: string;
  type: BarcodeType;
  timestamp: Date;
  location?: GPSLocation;
  confidence: number;
}

export enum BarcodeType {
  QRCode = 'QR_CODE',
  Code128 = 'CODE_128',
  Code39 = 'CODE_39',
  EAN13 = 'EAN_13',
  UPC = 'UPC',
  DataMatrix = 'DATA_MATRIX',
  PlantTag = 'PLANT_TAG',
  InventoryTag = 'INVENTORY_TAG'
}

// Offline Capabilities
export interface OfflineTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
  room: string;
  data: any;
  createdOffline: boolean;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface OfflinePlant {
  id: string;
  tagId: string;
  strain: string;
  stage: PlantStage;
  location: string;
  plantedDate: Date;
  observations: PlantObservation[];
  tasks: string[];
  lastModified: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface OfflineInventory {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastCount: Date;
  adjustments: InventoryAdjustment[];
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface OfflineReading {
  id: string;
  type: ReadingType;
  value: number;
  unit: string;
  location: string;
  timestamp: Date;
  recordedBy: string;
  deviceId?: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface OfflinePhoto {
  id: string;
  uri: string;
  thumbnail: string;
  type: PhotoType;
  relatedId: string;
  relatedType: string;
  tags: string[];
  timestamp: Date;
  location?: GPSLocation;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface OfflineSignature {
  id: string;
  type: SignatureType;
  documentId: string;
  signatureData: string;
  signedBy: string;
  timestamp: Date;
  location?: GPSLocation;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

// Mobile-Specific Features
export interface QuickActions {
  scanPlant(): void;
  recordObservation(): void;
  completeTask(): void;
  takePhoto(): void;
  adjustInventory(): void;
  recordReading(): void;
  viewAlerts(): void;
  startHarvest(): void;
}

export interface MobileNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  destructive?: boolean;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

// Data Sync
export interface PendingSync {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

export interface SyncConflict {
  id: string;
  type: string;
  localData: any;
  serverData: any;
  resolution?: 'local' | 'server' | 'merge';
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface DataUsage {
  uploaded: number; // bytes
  downloaded: number;
  cachedSize: number;
  photosSize: number;
  lastReset: Date;
}

// Mobile Forms
export interface MobileForm {
  id: string;
  type: FormType;
  title: string;
  fields: FormField[];
  validation: ValidationRule[];
  submitOffline: boolean;
  requiresSignature: boolean;
  requiresPhoto: boolean;
  requiresLocation: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  conditionalDisplay?: ConditionalRule[];
}

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

// Enums
export enum TaskType {
  Watering = 'Watering',
  Feeding = 'Feeding',
  Pruning = 'Pruning',
  Training = 'Training',
  Scouting = 'Scouting',
  Harvest = 'Harvest',
  Transplant = 'Transplant',
  Clean = 'Clean',
  Maintenance = 'Maintenance',
  Observation = 'Observation'
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Skipped = 'Skipped',
  Blocked = 'Blocked'
}

export enum Priority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

export enum PlantStage {
  Clone = 'Clone',
  Veg = 'Veg',
  Flower = 'Flower',
  Harvest = 'Harvest',
  Drying = 'Drying',
  Curing = 'Curing'
}

export enum ReadingType {
  Temperature = 'Temperature',
  Humidity = 'Humidity',
  pH = 'pH',
  EC = 'EC',
  CO2 = 'CO2',
  Light = 'Light',
  Weight = 'Weight'
}

export enum PhotoType {
  Plant = 'Plant',
  Disease = 'Disease',
  Pest = 'Pest',
  Deficiency = 'Deficiency',
  Progress = 'Progress',
  Harvest = 'Harvest',
  Issue = 'Issue',
  Documentation = 'Documentation'
}

export enum SignatureType {
  TaskCompletion = 'Task Completion',
  Delivery = 'Delivery',
  Inspection = 'Inspection',
  Harvest = 'Harvest',
  Disposal = 'Disposal',
  Transfer = 'Transfer'
}

export enum NotificationType {
  Task = 'Task',
  Alert = 'Alert',
  Reminder = 'Reminder',
  System = 'System',
  Emergency = 'Emergency'
}

export enum FormType {
  TaskCompletion = 'Task Completion',
  PlantObservation = 'Plant Observation',
  EnvironmentalReading = 'Environmental Reading',
  InventoryCount = 'Inventory Count',
  HarvestRecord = 'Harvest Record',
  IssueReport = 'Issue Report',
  MaintenanceLog = 'Maintenance Log'
}

export enum FieldType {
  Text = 'Text',
  Number = 'Number',
  Select = 'Select',
  MultiSelect = 'Multi-Select',
  Date = 'Date',
  Time = 'Time',
  Photo = 'Photo',
  Signature = 'Signature',
  Barcode = 'Barcode',
  Location = 'Location',
  Toggle = 'Toggle',
  Slider = 'Slider',
  Rating = 'Rating'
}

// Supporting Interfaces
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  defaultRoom?: string;
  quickActions: string[];
  dataSync: SyncPreferences;
}

export interface NotificationPreferences {
  tasks: boolean;
  alerts: boolean;
  reminders: boolean;
  sounds: boolean;
  vibration: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
}

export interface SyncPreferences {
  wifiOnly: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  photoQuality: 'low' | 'medium' | 'high';
  keepOfflineData: number; // days
}

export interface StorageInfo {
  total: number; // MB
  used: number;
  available: number;
  appSize: number;
  cacheSize: number;
  photosSize: number;
}

export interface BatteryInfo {
  level: number; // percentage
  charging: boolean;
  lowPowerMode: boolean;
}

export interface DeviceCapabilities {
  camera: boolean;
  nfc: boolean;
  bluetooth: boolean;
  biometric: BiometricType[];
  sensors: string[];
}

export enum BiometricType {
  Fingerprint = 'Fingerprint',
  FaceID = 'FaceID',
  Iris = 'Iris'
}

export interface PlantObservation {
  id: string;
  type: string;
  severity?: 'low' | 'medium' | 'high';
  notes: string;
  photos?: string[];
  timestamp: Date;
  recordedBy: string;
}

export interface InventoryAdjustment {
  id: string;
  type: 'add' | 'remove' | 'count';
  quantity: number;
  reason: string;
  timestamp: Date;
  recordedBy: string;
  verified?: boolean;
}