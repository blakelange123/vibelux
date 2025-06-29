-- Privacy Controls and Data Retention Tables

-- User Privacy Settings
CREATE TABLE IF NOT EXISTS "user_privacy_settings" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "location_sharing_enabled" BOOLEAN NOT NULL DEFAULT true,
  "location_retention_days" INTEGER NOT NULL DEFAULT 90,
  "allow_real_time_tracking" BOOLEAN NOT NULL DEFAULT true,
  "allow_historical_access" BOOLEAN NOT NULL DEFAULT true,
  "share_with_supervisors" BOOLEAN NOT NULL DEFAULT true,
  "share_with_peers" BOOLEAN NOT NULL DEFAULT false,
  "anonymize_in_reports" BOOLEAN NOT NULL DEFAULT false,
  "data_deletion_requested" BOOLEAN NOT NULL DEFAULT false,
  "deletion_scheduled_date" TIMESTAMP(3),
  "consent_version" TEXT NOT NULL DEFAULT '1.0',
  "consent_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_privacy_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_privacy_settings_user_facility_unique" UNIQUE ("user_id", "facility_id")
);

-- Data Retention Policies (per facility)
CREATE TABLE IF NOT EXISTS "data_retention_policies" (
  "id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "location_data_retention_days" INTEGER NOT NULL DEFAULT 90,
  "message_retention_days" INTEGER NOT NULL DEFAULT 365,
  "alert_retention_days" INTEGER NOT NULL DEFAULT 180,
  "inactive_user_data_retention_days" INTEGER NOT NULL DEFAULT 1095,
  "automatic_deletion_enabled" BOOLEAN NOT NULL DEFAULT true,
  "compliance_requirements" TEXT[],
  "last_review_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "data_retention_policies_facility_unique" UNIQUE ("facility_id")
);

-- Data Retention Log (audit trail)
CREATE TABLE IF NOT EXISTS "data_retention_logs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "facility_id" TEXT,
  "action" TEXT NOT NULL, -- DELETION_REQUESTED, AUTOMATED_CLEANUP, USER_DATA_DELETED, etc.
  "scheduled_date" TIMESTAMP(3),
  "completed_date" TIMESTAMP(3),
  "reason" TEXT,
  "status" TEXT NOT NULL, -- PENDING, COMPLETED, FAILED, CANCELLED
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "data_retention_logs_pkey" PRIMARY KEY ("id")
);

-- Consent History (track consent changes)
CREATE TABLE IF NOT EXISTS "consent_history" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "facility_id" TEXT NOT NULL,
  "consent_version" TEXT NOT NULL,
  "consent_given" BOOLEAN NOT NULL,
  "consent_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "consent_details" JSONB,
  
  CONSTRAINT "consent_history_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_privacy_settings_user_facility" ON "user_privacy_settings"("user_id", "facility_id");
CREATE INDEX IF NOT EXISTS "idx_user_privacy_settings_deletion_scheduled" ON "user_privacy_settings"("deletion_scheduled_date") WHERE "data_deletion_requested" = true;
CREATE INDEX IF NOT EXISTS "idx_data_retention_logs_facility" ON "data_retention_logs"("facility_id");
CREATE INDEX IF NOT EXISTS "idx_data_retention_logs_user" ON "data_retention_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_data_retention_logs_status" ON "data_retention_logs"("status");
CREATE INDEX IF NOT EXISTS "idx_consent_history_user_facility" ON "consent_history"("user_id", "facility_id");
CREATE INDEX IF NOT EXISTS "idx_consent_history_date" ON "consent_history"("consent_date");