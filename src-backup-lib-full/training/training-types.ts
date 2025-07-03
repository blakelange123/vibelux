// Training Module Types
export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  targetRoles: string[];
  courses: Course[];
  duration: number; // total minutes
  difficulty: DifficultyLevel;
  prerequisites?: string[]; // program IDs
  certification?: CertificationRequirement;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  isActive: boolean;
}

export interface Course {
  id: string;
  programId: string;
  title: string;
  description: string;
  modules: Module[];
  duration: number; // minutes
  passingScore: number;
  maxAttempts: number;
  validityPeriod?: number; // days
  order: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: ModuleContent[];
  assessment?: Assessment;
  duration: number; // minutes
  order: number;
  requiredForCompletion: boolean;
}

export interface ModuleContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  url?: string;
  duration?: number; // minutes
  order: number;
  interactive?: boolean;
  metadata?: Record<string, any>;
}

export enum ContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  SLIDES = 'slides',
  INTERACTIVE = 'interactive',
  SIMULATION = 'simulation',
  VIRTUAL_REALITY = 'vr',
  AUGMENTED_REALITY = 'ar',
  QUIZ = 'quiz',
  CASE_STUDY = 'case_study',
  EXTERNAL_LINK = 'external_link'
}

export interface VideoContent extends ModuleContent {
  type: ContentType.VIDEO;
  videoUrl: string;
  thumbnailUrl?: string;
  captions?: Caption[];
  chapters?: VideoChapter[];
  playbackSpeed?: number[];
  quality?: VideoQuality[];
}

export interface Caption {
  language: string;
  url: string;
}

export interface VideoChapter {
  title: string;
  startTime: number; // seconds
  endTime: number;
}

export enum VideoQuality {
  SD = '480p',
  HD = '720p',
  FULL_HD = '1080p',
  QUAD_HD = '1440p',
  ULTRA_HD = '4k'
}

export interface Assessment {
  id: string;
  type: AssessmentType;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // minutes
  randomizeQuestions?: boolean;
  showFeedback?: boolean;
  allowRetake?: boolean;
  retakeDelay?: number; // hours
}

export enum AssessmentType {
  QUIZ = 'quiz',
  EXAM = 'exam',
  PRACTICAL = 'practical',
  PROJECT = 'project',
  PEER_REVIEW = 'peer_review'
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  media?: string;
  timeLimit?: number; // seconds
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  FILL_BLANK = 'fill_blank',
  PRACTICAL_DEMO = 'practical_demo'
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  programs: string[]; // program IDs in order
  estimatedDuration: number; // total hours
  milestones: Milestone[];
  createdBy: string;
  isRecommended: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  requiredPrograms: string[];
  badge?: Badge;
  certificate?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  issuer: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  issuingBody: string;
  requirements: CertificationRequirement;
  validityPeriod: number; // days
  renewalRequirements?: RenewalRequirement;
  badge?: Badge;
  certificateTemplate: string;
}

export interface CertificationRequirement {
  requiredCourses: string[];
  minimumScore: number;
  practicalAssessment?: boolean;
  experienceHours?: number;
  prerequisites?: string[]; // certification IDs
}

export interface RenewalRequirement {
  continuingEducationHours: number;
  refresherCourses?: string[];
  practicalAssessment?: boolean;
  renewalPeriod: number; // days before expiry
}

export interface TrainingProgress {
  id: string;
  userId: string;
  programId: string;
  courseProgress: CourseProgress[];
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  overallProgress: number; // percentage
  certificateId?: string;
}

export interface CourseProgress {
  courseId: string;
  moduleProgress: ModuleProgress[];
  assessmentResults: AssessmentResult[];
  progress: number; // percentage
  status: ProgressStatus;
  startedAt: Date;
  completedAt?: Date;
}

export interface ModuleProgress {
  moduleId: string;
  contentProgress: ContentProgress[];
  progress: number; // percentage
  status: ProgressStatus;
  timeSpent: number; // minutes
  startedAt: Date;
  completedAt?: Date;
}

export interface ContentProgress {
  contentId: string;
  progress: number; // percentage
  completed: boolean;
  timeSpent: number; // minutes
  lastPosition?: number; // for videos
  notes?: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  passed: boolean;
  answers: AnswerRecord[];
  startedAt: Date;
  submittedAt: Date;
  timeTaken: number; // minutes
  attempt: number;
}

export interface AnswerRecord {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  points: number;
  feedback?: string;
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface Instructor {
  id: string;
  userId: string;
  name: string;
  title: string;
  bio: string;
  photoUrl?: string;
  specializations: string[];
  certifications: string[];
  rating: number;
  totalStudents: number;
  courses: string[]; // course IDs
}

export interface TrainingSchedule {
  id: string;
  programId: string;
  instructorId?: string;
  startDate: Date;
  endDate: Date;
  sessions: TrainingSession[];
  maxParticipants: number;
  enrolledParticipants: string[];
  location?: TrainingLocation;
  status: ScheduleStatus;
}

export interface TrainingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  instructor?: string;
  location?: string;
  virtualMeetingUrl?: string;
  materials?: string[];
  attendance?: AttendanceRecord[];
}

export interface TrainingLocation {
  type: LocationType;
  name: string;
  address?: string;
  room?: string;
  capacity: number;
  equipment?: string[];
  virtualPlatform?: string;
  accessInstructions?: string;
}

export enum LocationType {
  ON_SITE = 'on_site',
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid',
  FIELD = 'field'
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

export interface AttendanceRecord {
  userId: string;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  duration?: number; // minutes
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  PARTIAL = 'partial'
}

export interface TrainingAnalytics {
  programId: string;
  period: AnalyticsPeriod;
  metrics: TrainingMetrics;
  trends: TrendData[];
  recommendations: string[];
}

export interface TrainingMetrics {
  totalEnrollments: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number; // hours
  satisfactionRating: number;
  certificationRate: number;
  failureRate: number;
  dropoutRate: number;
}

export interface TrendData {
  date: Date;
  enrollments: number;
  completions: number;
  averageScore: number;
  satisfaction: number;
}

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum TrainingCategory {
  SAFETY = 'safety',
  COMPLIANCE = 'compliance',
  CULTIVATION = 'cultivation',
  EQUIPMENT = 'equipment',
  QUALITY = 'quality',
  PROCESS = 'process',
  LEADERSHIP = 'leadership',
  TECHNICAL = 'technical',
  SOFT_SKILLS = 'soft_skills'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface TrainingNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  programId?: string;
  courseId?: string;
  dueDate?: Date;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  ENROLLMENT = 'enrollment',
  REMINDER = 'reminder',
  DEADLINE = 'deadline',
  COMPLETION = 'completion',
  CERTIFICATION = 'certification',
  EXPIRY_WARNING = 'expiry_warning',
  NEW_CONTENT = 'new_content',
  SCHEDULE_CHANGE = 'schedule_change'
}