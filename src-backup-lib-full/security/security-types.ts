// Security & Access Control Types

export interface AccessZone {
  id: string;
  name: string;
  description: string;
  type: ZoneType;
  securityLevel: SecurityLevel;
  doors: Door[];
  cameras: Camera[];
  requiredBadgeTypes: BadgeType[];
  schedule: AccessSchedule;
  capacity: number;
  currentOccupancy: number;
  alarms: Alarm[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Door {
  id: string;
  name: string;
  zoneId: string;
  type: DoorType;
  status: DoorStatus;
  lastAccess?: AccessLog;
  reader: CardReader;
  lockType: LockType;
  camera?: string;
  alarmEnabled: boolean;
  maintenanceDate?: Date;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  zoneId: string;
  type: CameraType;
  status: CameraStatus;
  recordingEnabled: boolean;
  motionDetection: boolean;
  resolution: string;
  frameRate: number;
  storageLocation: string;
  retentionDays: number;
  lastMaintenance?: Date;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  badgeId: string;
  badgeType: BadgeType;
  accessLevel: AccessLevel;
  allowedZones: string[];
  photo?: string;
  fingerprint?: boolean;
  activeStatus: boolean;
  hireDate: Date;
  backgroundCheck: BackgroundCheck;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  purpose: VisitPurpose;
  hostEmployeeId: string;
  hostName: string;
  badgeNumber: string;
  checkInTime: Date;
  checkOutTime?: Date;
  allowedZones: string[];
  escortRequired: boolean;
  photoId: string;
  signature: string;
  vehicleInfo?: VehicleInfo;
  items?: string[];
  notes?: string;
  preRegistered: boolean;
  createdAt: Date;
}

export interface AccessLog {
  id: string;
  timestamp: Date;
  personId: string;
  personType: 'Employee' | 'Visitor' | 'Contractor';
  personName: string;
  doorId: string;
  doorName: string;
  zoneId: string;
  zoneName: string;
  accessType: AccessType;
  granted: boolean;
  denialReason?: string;
  tailgating?: boolean;
  photo?: string;
}

export interface Alarm {
  id: string;
  type: AlarmType;
  severity: AlarmSeverity;
  zoneId: string;
  zoneName: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  description: string;
  response: string;
  falseAlarm: boolean;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  date: Date;
  time: string;
  location: string;
  description: string;
  involvedPersons: string[];
  witnesses: string[];
  reportedBy: string;
  investigator?: string;
  status: IncidentStatus;
  actionsTaken: string[];
  preventiveMeasures: string[];
  attachments: string[];
  policeReport?: string;
  insuranceClaim?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  badgeNumber: string;
  type: BadgeType;
  assignedTo?: string;
  assignedType?: 'Employee' | 'Visitor' | 'Contractor';
  status: BadgeStatus;
  issueDate: Date;
  expiryDate?: Date;
  lastUsed?: Date;
  accessZones: string[];
  photo?: string;
  deactivationReason?: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

// Enums
export enum ZoneType {
  Public = 'Public',
  Restricted = 'Restricted',
  HighSecurity = 'High Security',
  Cultivation = 'Cultivation',
  Processing = 'Processing',
  Vault = 'Vault',
  Office = 'Office',
  Loading = 'Loading',
}

export enum SecurityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum DoorType {
  Main = 'Main Entrance',
  Emergency = 'Emergency Exit',
  Internal = 'Internal',
  Loading = 'Loading Dock',
  Vault = 'Vault Door',
}

export enum DoorStatus {
  Locked = 'Locked',
  Unlocked = 'Unlocked',
  Open = 'Open',
  Forced = 'Forced Open',
  Offline = 'Offline',
  Maintenance = 'Maintenance',
}

export enum LockType {
  Electronic = 'Electronic',
  Magnetic = 'Magnetic',
  Biometric = 'Biometric',
  Keypad = 'Keypad',
  Manual = 'Manual',
}

export enum CameraType {
  Fixed = 'Fixed',
  PTZ = 'PTZ',
  Dome = 'Dome',
  Bullet = 'Bullet',
  Thermal = 'Thermal',
}

export enum CameraStatus {
  Online = 'Online',
  Offline = 'Offline',
  Recording = 'Recording',
  Maintenance = 'Maintenance',
}

export enum BadgeType {
  Employee = 'Employee',
  Manager = 'Manager',
  Executive = 'Executive',
  Visitor = 'Visitor',
  Contractor = 'Contractor',
  Vendor = 'Vendor',
  Inspector = 'Inspector',
  Temporary = 'Temporary',
}

export enum AccessLevel {
  Basic = 'Basic',
  Standard = 'Standard',
  Elevated = 'Elevated',
  Manager = 'Manager',
  Admin = 'Admin',
  Emergency = 'Emergency',
}

export enum VisitPurpose {
  Business = 'Business Meeting',
  Delivery = 'Delivery',
  Maintenance = 'Maintenance',
  Inspection = 'Inspection',
  Tour = 'Tour',
  Interview = 'Interview',
  Training = 'Training',
  Other = 'Other',
}

export enum AccessType {
  Badge = 'Badge',
  Keypad = 'Keypad',
  Biometric = 'Biometric',
  Manual = 'Manual Override',
  Remote = 'Remote Unlock',
}

export enum AlarmType {
  DoorForcedOpen = 'Door Forced Open',
  DoorHeldOpen = 'Door Held Open',
  InvalidAccess = 'Invalid Access Attempt',
  Tailgating = 'Tailgating Detected',
  MotionDetected = 'Motion Detected',
  PanicButton = 'Panic Button',
  FireAlarm = 'Fire Alarm',
  SystemFailure = 'System Failure',
}

export enum AlarmSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum IncidentType {
  Theft = 'Theft',
  Vandalism = 'Vandalism',
  Trespassing = 'Trespassing',
  Assault = 'Assault',
  Accident = 'Accident',
  MedicalEmergency = 'Medical Emergency',
  FireEmergency = 'Fire Emergency',
  PolicyViolation = 'Policy Violation',
  Other = 'Other',
}

export enum IncidentSeverity {
  Minor = 'Minor',
  Moderate = 'Moderate',
  Major = 'Major',
  Critical = 'Critical',
}

export enum IncidentStatus {
  Open = 'Open',
  UnderInvestigation = 'Under Investigation',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Escalated = 'Escalated',
}

export enum BadgeStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Lost = 'Lost',
  Stolen = 'Stolen',
  Expired = 'Expired',
  Suspended = 'Suspended',
}

export enum AuditAction {
  Login = 'Login',
  Logout = 'Logout',
  AccessGranted = 'Access Granted',
  AccessDenied = 'Access Denied',
  BadgeIssued = 'Badge Issued',
  BadgeDeactivated = 'Badge Deactivated',
  ZoneModified = 'Zone Modified',
  AlarmAcknowledged = 'Alarm Acknowledged',
  IncidentCreated = 'Incident Created',
  SettingsChanged = 'Settings Changed',
}

// Supporting Interfaces
export interface AccessSchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
  holidays: boolean;
}

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface CardReader {
  id: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  lastCommunication: Date;
  online: boolean;
}

export interface BackgroundCheck {
  completed: boolean;
  date?: Date;
  result?: 'Clear' | 'Review' | 'Failed';
  expiryDate?: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  state: string;
  parkingLocation?: string;
}

export interface SecurityMetrics {
  totalAccesses: number;
  deniedAccesses: number;
  activeAlarms: number;
  openIncidents: number;
  visitorsOnSite: number;
  employeesOnSite: number;
  zonesAtCapacity: number;
  camerasOffline: number;
  doorsOffline: number;
  tailgatingEvents: number;
  avgResponseTime: number;
  complianceScore: number;
}