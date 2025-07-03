// Workforce Management Types
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: Department;
  hireDate: Date;
  status: EmployeeStatus;
  wage: number;
  certifications: Certification[];
  skills: Skill[];
  emergencyContact: EmergencyContact;
  photo?: string;
  badgeId?: string;
  biometricId?: string;
}

export enum EmployeeRole {
  CULTIVATION_TECH = 'cultivation_tech',
  LEAD_GROWER = 'lead_grower',
  HEAD_GROWER = 'head_grower',
  IPM_SPECIALIST = 'ipm_specialist',
  HARVEST_TECH = 'harvest_tech',
  PROCESSING_TECH = 'processing_tech',
  QUALITY_CONTROL = 'quality_control',
  MAINTENANCE = 'maintenance',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export enum Department {
  CULTIVATION = 'cultivation',
  PROCESSING = 'processing',
  PACKAGING = 'packaging',
  QUALITY = 'quality',
  MAINTENANCE = 'maintenance',
  ADMINISTRATION = 'administration'
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended'
}

export interface Shift {
  id: string;
  employeeId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  breakMinutes: number;
  department: Department;
  tasks: Task[];
  actualStartTime?: Date;
  actualEndTime?: Date;
  overtimeHours?: number;
  notes?: string;
}

export interface Schedule {
  id: string;
  weekStartDate: Date;
  shifts: Shift[];
  published: boolean;
  publishedDate?: Date;
  publishedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  sop?: string; // Link to SOP
  estimatedMinutes: number;
  actualMinutes?: number;
  completedAt?: Date;
  completedBy?: string;
  roomId?: string;
  batchId?: string;
  priority: TaskPriority;
  category: TaskCategory;
  requiredSkills: Skill[];
  requiredCertifications?: Certification[];
  checklist?: ChecklistItem[];
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TaskCategory {
  WATERING = 'watering',
  FEEDING = 'feeding',
  PRUNING = 'pruning',
  TRANSPLANTING = 'transplanting',
  IPM = 'ipm',
  HARVESTING = 'harvesting',
  DRYING = 'drying',
  CURING = 'curing',
  TRIMMING = 'trimming',
  PACKAGING = 'packaging',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  QUALITY_CHECK = 'quality_check'
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clockIn: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours?: number;
  overtimeHours?: number;
  location: string;
  method: ClockMethod;
  notes?: string;
}

export enum ClockMethod {
  BIOMETRIC = 'biometric',
  BADGE = 'badge',
  PIN = 'pin',
  MOBILE = 'mobile',
  MANUAL = 'manual'
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  documentUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export enum SkillCategory {
  CULTIVATION = 'cultivation',
  PROCESSING = 'processing',
  EQUIPMENT = 'equipment',
  COMPLIANCE = 'compliance',
  SAFETY = 'safety',
  QUALITY = 'quality'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  requiredFor: EmployeeRole[];
  duration: number; // minutes
  validityPeriod?: number; // days
  content: TrainingContent[];
  quiz?: Quiz;
  passingScore: number;
}

export enum TrainingCategory {
  SAFETY = 'safety',
  COMPLIANCE = 'compliance',
  CULTIVATION = 'cultivation',
  EQUIPMENT = 'equipment',
  QUALITY = 'quality',
  PROCESS = 'process'
}

export interface TrainingContent {
  type: 'video' | 'document' | 'slides' | 'interactive';
  title: string;
  url: string;
  duration?: number;
}

export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingId: string;
  startDate: Date;
  completionDate?: Date;
  score?: number;
  passed: boolean;
  certificateUrl?: string;
  expiryDate?: Date;
}

export interface LaborMetrics {
  date: Date;
  department: Department;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  laborCost: number;
  productivity: ProductivityMetrics;
}

export interface ProductivityMetrics {
  tasksCompleted: number;
  tasksAssigned: number;
  avgTaskCompletionTime: number;
  efficiencyRate: number; // percentage
  outputPerHour?: {
    plantsTransplanted?: number;
    plantsPruned?: number;
    poundsHarvested?: number;
    poundsTrimmed?: number;
    unitsPackaged?: number;
  };
}

export interface PayrollData {
  employeeId: string;
  payPeriod: {
    startDate: Date;
    endDate: Date;
  };
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  sickHours: number;
  vacationHours: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
}