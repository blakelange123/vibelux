// PostgreSQL operational database setup with Prisma
// This file defines the enhanced database schema for production

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Facilities and organizational structure
model Facility {
  id          String @id @default(cuid())
  name        String
  type        FacilityType
  address     String?
  coordinates Json? // {lat, lng}
  timezone    String @default("UTC")
  settings    Json? // facility-specific settings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  zones         Zone[]
  users         User[]
  photoReports  PhotoReport[]
  harvestBatches HarvestBatch[]
  sprayApplications SprayApplication[]
  ipmRoutes     IPMRoute[]
  equipment     Equipment[]
  
  @@map("facilities")
}

enum FacilityType {
  GREENHOUSE
  INDOOR_VERTICAL
  NURSERY
  PROCESSING
  WAREHOUSE
}

model Zone {
  id          String @id @default(cuid())
  facilityId  String
  name        String
  type        ZoneType
  capacity    Int?
  settings    Json? // zone-specific environmental settings
  coordinates Json? // zone boundaries
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  facility      Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  photoReports  PhotoReport[]
  harvestBatches HarvestBatch[]
  environmentalData EnvironmentalReading[]
  
  @@map("zones")
}

enum ZoneType {
  VEG
  FLOWER
  MOTHER
  CLONE
  DRYING
  CURING
  PROCESSING
  STORAGE
}

// User management and roles
model User {
  id          String @id @default(cuid())
  email       String @unique
  name        String
  role        UserRole
  department  String?
  facilityId  String
  language    String @default("en")
  settings    Json? // user preferences
  isActive    Boolean @default(true)
  lastActiveAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  facility       Facility @relation(fields: [facilityId], references: [id])
  photoReports   PhotoReport[]
  harvestBatches HarvestBatch[]
  sprayApplications SprayApplication[]
  certifications UserCertification[]
  locationHistory LocationHistory[]
  
  @@map("users")
}

enum UserRole {
  ADMIN
  MANAGER
  SUPERVISOR
  CULTIVATION_TECH
  IPM_SPECIALIST
  HARVEST_TECH
  MAINTENANCE
  QUALITY_CONTROL
  VISITOR
}

// Photo reporting system
model PhotoReport {
  id          String @id @default(cuid())
  type        ReportType
  title       String
  description String
  severity    Severity
  status      ReportStatus @default(PENDING_REVIEW)
  location    String
  coordinates Json? // {lat, lng, accuracy}
  facilityId  String
  zoneId      String?
  userId      String
  photos      Photo[]
  aiAnalysis  Json? // AI analysis results
  reviewNotes String?
  reviewedBy  String?
  reviewedAt  DateTime?
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  facility    Facility @relation(fields: [facilityId], references: [id])
  zone        Zone? @relation(fields: [zoneId], references: [id])
  user        User @relation(fields: [userId], references: [id])
  
  @@map("photo_reports")
}

enum ReportType {
  PEST_DISEASE
  EQUIPMENT
  SAFETY
  QUALITY
  INVENTORY
  MAINTENANCE
  ENVIRONMENTAL
  COMPLIANCE
  OTHER
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ReportStatus {
  PENDING_REVIEW
  IN_REVIEW
  APPROVED
  REJECTED
  RESOLVED
  ESCALATED
}

model Photo {
  id            String @id @default(cuid())
  reportId      String
  url           String
  filename      String
  size          Int
  mimeType      String
  quality       Json? // quality metrics
  annotations   Json? // photo annotations
  metadata      Json? // EXIF and other metadata
  createdAt     DateTime @default(now())

  // Relationships
  report        PhotoReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  @@map("photos")
}

// Harvest tracking
model HarvestBatch {
  id              String @id @default(cuid())
  batchNumber     String @unique
  facilityId      String
  zoneId          String?
  userId          String
  strain          String
  plantCount      Int
  plantedDate     DateTime
  harvestDate     DateTime?
  estimatedYield  Float
  actualYield     Float?
  grade           Grade?
  status          HarvestStatus @default(PLANNED)
  qualityMetrics  Json? // quality test results
  notes           String?
  photos          String[] // photo URLs
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relationships
  facility        Facility @relation(fields: [facilityId], references: [id])
  zone            Zone? @relation(fields: [zoneId], references: [id])
  user            User @relation(fields: [userId], references: [id])
  
  @@map("harvest_batches")
}

enum Grade {
  A_PLUS
  A
  B_PLUS
  B
  C
}

enum HarvestStatus {
  PLANNED
  HARVESTING
  DRYING
  CURING
  TESTING
  COMPLETE
  DESTROYED
}

// Spray applications and chemical tracking
model SprayApplication {
  id                String @id @default(cuid())
  facilityId        String
  userId            String
  productName       String
  activeIngredient  String
  epaNumber         String?
  concentration     Float
  targetPest        String
  applicationMethod ApplicationMethod
  zones             String[] // zone IDs
  mixRate           String
  totalVolume       Float?
  weather           Json? // weather conditions
  ppeVerified       Json // PPE checklist
  reEntryInterval   Int // hours
  phiDays           Int // pre-harvest interval
  status            ApplicationStatus @default(PLANNED)
  startTime         DateTime?
  endTime           DateTime?
  notes             String?
  photos            String[] // photo URLs
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relationships
  facility          Facility @relation(fields: [facilityId], references: [id])
  user              User @relation(fields: [userId], references: [id])
  
  @@map("spray_applications")
}

enum ApplicationMethod {
  FOLIAR
  SOIL_DRENCH
  FUMIGATION
  GRANULAR
}

enum ApplicationStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// IPM scouting
model IPMRoute {
  id            String @id @default(cuid())
  facilityId    String
  name          String
  description   String?
  zones         String[] // zone IDs in order
  frequency     RouteFrequency
  estimatedTime Int // minutes
  isActive      Boolean @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  facility      Facility @relation(fields: [facilityId], references: [id])
  sessions      IPMSession[]
  
  @@map("ipm_routes")
}

enum RouteFrequency {
  DAILY
  WEEKLY
  BI_WEEKLY
  MONTHLY
}

model IPMSession {
  id            String @id @default(cuid())
  routeId       String
  userId        String
  startTime     DateTime
  endTime       DateTime?
  status        SessionStatus @default(IN_PROGRESS)
  findings      Json? // pest findings and observations
  photos        String[] // photo URLs
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  route         IPMRoute @relation(fields: [routeId], references: [id])
  
  @@map("ipm_sessions")
}

enum SessionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// Equipment management
model Equipment {
  id            String @id @default(cuid())
  facilityId    String
  name          String
  type          EquipmentType
  model         String?
  serialNumber  String?
  location      String?
  status        EquipmentStatus @default(OPERATIONAL)
  lastMaintenance DateTime?
  nextMaintenance DateTime?
  specifications Json?
  manuals       String[] // document URLs
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  facility      Facility @relation(fields: [facilityId], references: [id])
  maintenanceHistory MaintenanceRecord[]
  
  @@map("equipment")
}

enum EquipmentType {
  HVAC
  LIGHTING
  IRRIGATION
  FERTIGATION
  MONITORING
  PROCESSING
  SECURITY
  OTHER
}

enum EquipmentStatus {
  OPERATIONAL
  MAINTENANCE
  REPAIR
  OFFLINE
  DECOMMISSIONED
}

model MaintenanceRecord {
  id          String @id @default(cuid())
  equipmentId String
  type        MaintenanceType
  description String
  performedBy String
  cost        Float?
  duration    Int? // minutes
  parts       Json? // parts used
  photos      String[] // photo URLs
  scheduledAt DateTime?
  completedAt DateTime
  createdAt   DateTime @default(now())

  // Relationships
  equipment   Equipment @relation(fields: [equipmentId], references: [id])
  
  @@map("maintenance_records")
}

enum MaintenanceType {
  PREVENTIVE
  CORRECTIVE
  EMERGENCY
  INSPECTION
  CALIBRATION
}

// Environmental monitoring
model EnvironmentalReading {
  id          String @id @default(cuid())
  facilityId  String
  zoneId      String
  sensorId    String
  temperature Float?
  humidity    Float?
  co2         Float?
  vpd         Float?
  lightLevel  Float?
  ph          Float?
  ec          Float?
  timestamp   DateTime @default(now())

  // Relationships
  zone        Zone @relation(fields: [zoneId], references: [id])
  
  @@map("environmental_readings")
}

// Training and certifications
model TrainingModule {
  id            String @id @default(cuid())
  title         String
  description   String
  category      TrainingCategory
  duration      Int // minutes
  content       Json // lessons and materials
  requiredScore Int @default(80)
  certification Boolean @default(false)
  isActive      Boolean @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  certifications UserCertification[]
  
  @@map("training_modules")
}

enum TrainingCategory {
  BASICS
  SAFETY
  EQUIPMENT
  QUALITY
  COMPLIANCE
  ADVANCED
}

model UserCertification {
  id              String @id @default(cuid())
  userId          String
  moduleId        String
  score           Int
  attempts        Int @default(1)
  issuedDate      DateTime @default(now())
  expiresDate     DateTime?
  verificationCode String @unique
  isActive        Boolean @default(true)

  // Relationships
  user            User @relation(fields: [userId], references: [id])
  module          TrainingModule @relation(fields: [moduleId], references: [id])
  
  @@unique([userId, moduleId])
  @@map("user_certifications")
}

// Location tracking
model LocationHistory {
  id          String @id @default(cuid())
  userId      String
  latitude    Float
  longitude   Float
  accuracy    Float?
  battery     Float?
  timestamp   DateTime @default(now())

  // Relationships
  user        User @relation(fields: [userId], references: [id])
  
  @@map("location_history")
}

// Audit logging
model AuditLog {
  id          String @id @default(cuid())
  userId      String?
  action      String
  resource    String
  resourceId  String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  @@map("audit_logs")
}