-- IPM (Integrated Pest Management) Photo Scouting Tables

-- IPM Photos
CREATE TABLE IF NOT EXISTS "ipm_photos" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "photo_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "accuracy" DOUBLE PRECISION NOT NULL,
  "plant_stage" TEXT NOT NULL CHECK (plant_stage IN ('seedling', 'vegetative', 'flowering', 'harvest')),
  "room_zone" TEXT NOT NULL,
  "notes" TEXT,
  "manual_tags" TEXT[],
  "priority" TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'reviewed', 'action_taken')),
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "imp_photos_pkey" PRIMARY KEY ("id")
);

-- IPM Photo Analysis (AI Results)
CREATE TABLE IF NOT EXISTS "ipm_photo_analysis" (
  "id" TEXT NOT NULL,
  "photo_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "pest_detected" BOOLEAN NOT NULL DEFAULT false,
  "disease_detected" BOOLEAN NOT NULL DEFAULT false,
  "deficiency_detected" BOOLEAN NOT NULL DEFAULT false,
  "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "detected_issues" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "recommendations" TEXT[] NOT NULL DEFAULT '{}',
  "urgency_level" TEXT NOT NULL DEFAULT 'low' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  "raw_analysis" JSONB,
  "location" JSONB NOT NULL,
  "room_zone" TEXT NOT NULL,
  "plant_stage" TEXT NOT NULL,
  "analysis_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ipm_photo_analysis_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "imp_photo_analysis_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "imp_photos"("id") ON DELETE CASCADE
);

-- IPM Alerts
CREATE TABLE IF NOT EXISTS "ipm_alerts" (
  "id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK (type IN ('pest_outbreak', 'disease_spread', 'immediate_action', 'quarantine_needed')),
  "severity" TEXT NOT NULL CHECK (severity IN ('warning', 'critical', 'emergency')),
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "affected_photos" TEXT[] NOT NULL DEFAULT '{}',
  "recommended_actions" TEXT[] NOT NULL DEFAULT '{}',
  "assigned_to" TEXT[],
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "room_zone" TEXT NOT NULL,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolved_by" TEXT,
  "resolved_at" TIMESTAMP(3),
  "resolution_notes" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ipm_alerts_pkey" PRIMARY KEY ("id")
);

-- IPM Issues (Detected pests, diseases, deficiencies)
CREATE TABLE IF NOT EXISTS "ipm_issues" (
  "id" TEXT NOT NULL,
  "analysis_id" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK (type IN ('pest', 'disease', 'deficiency', 'environmental')),
  "name" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "severity" TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  "location" TEXT NOT NULL CHECK (location IN ('leaves', 'stems', 'buds', 'roots', 'soil')),
  "description" TEXT NOT NULL,
  "treatment_options" TEXT[] NOT NULL DEFAULT '{}',
  "spread_risk" TEXT NOT NULL CHECK (spread_risk IN ('low', 'medium', 'high', 'critical')),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ipm_issues_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ipm_issues_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "imp_photo_analysis"("id") ON DELETE CASCADE
);

-- IPM Treatments (Actions taken)
CREATE TABLE IF NOT EXISTS "imp_treatments" (
  "id" TEXT NOT NULL,
  "alert_id" TEXT,
  "photo_id" TEXT,
  "facility_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "treatment_type" TEXT NOT NULL,
  "product_used" TEXT,
  "application_method" TEXT,
  "dosage" TEXT,
  "area_treated" TEXT NOT NULL,
  "room_zone" TEXT NOT NULL,
  "notes" TEXT,
  "effectiveness_rating" INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
  "follow_up_date" TIMESTAMP(3),
  "cost" DECIMAL(10,2),
  "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ipm_treatments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ipm_treatments_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "ipm_alerts"("id") ON DELETE SET NULL,
  CONSTRAINT "ipm_treatments_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "imp_photos"("id") ON DELETE SET NULL
);

-- IPM Analytics (Summary data)
CREATE TABLE IF NOT EXISTS "ipm_analytics" (
  "id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "photos_taken" INTEGER NOT NULL DEFAULT 0,
  "pests_detected" INTEGER NOT NULL DEFAULT 0,
  "diseases_detected" INTEGER NOT NULL DEFAULT 0,
  "deficiencies_detected" INTEGER NOT NULL DEFAULT 0,
  "alerts_generated" INTEGER NOT NULL DEFAULT 0,
  "critical_alerts" INTEGER NOT NULL DEFAULT 0,
  "treatments_applied" INTEGER NOT NULL DEFAULT 0,
  "total_cost" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "average_response_time" INTEGER, -- minutes
  "most_common_pest" TEXT,
  "most_common_disease" TEXT,
  "affected_rooms" TEXT[] NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ipm_analytics_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "imp_analytics_facility_date_unique" UNIQUE ("facility_id", "date")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_ipm_photos_facility_timestamp" ON "imp_photos"("facility_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_ipm_photos_room_zone" ON "imp_photos"("facility_id", "room_zone");
CREATE INDEX IF NOT EXISTS "idx_ipm_photos_priority_status" ON "imp_photos"("priority", "status");
CREATE INDEX IF NOT EXISTS "idx_ipm_photos_location" ON "imp_photos"("latitude", "longitude");

CREATE INDEX IF NOT EXISTS "idx_ipm_analysis_photo_id" ON "imp_photo_analysis"("photo_id");
CREATE INDEX IF NOT EXISTS "idx_ipm_analysis_facility_urgency" ON "imp_photo_analysis"("facility_id", "urgency_level");
CREATE INDEX IF NOT EXISTS "idx_ipm_analysis_detections" ON "imp_photo_analysis"("pest_detected", "disease_detected", "deficiency_detected");

CREATE INDEX IF NOT EXISTS "idx_ipm_alerts_facility_timestamp" ON "ipm_alerts"("facility_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_ipm_alerts_severity_resolved" ON "ipm_alerts"("severity", "resolved");
CREATE INDEX IF NOT EXISTS "idx_ipm_alerts_room_zone" ON "ipm_alerts"("facility_id", "room_zone");

CREATE INDEX IF NOT EXISTS "idx_ipm_issues_analysis_type" ON "imp_issues"("analysis_id", "type");
CREATE INDEX IF NOT EXISTS "idx_imp_issues_severity_risk" ON "ipm_issues"("severity", "spread_risk");

CREATE INDEX IF NOT EXISTS "idx_ipm_treatments_facility_date" ON "imp_treatments"("facility_id", "applied_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_ipm_treatments_effectiveness" ON "imp_treatments"("effectiveness_rating") WHERE "effectiveness_rating" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_ipm_analytics_facility_date" ON "ipm_analytics"("facility_id", "date" DESC);