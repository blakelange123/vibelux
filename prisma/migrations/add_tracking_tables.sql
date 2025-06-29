-- Add tracking-related tables to the schema

-- Location tracking table
CREATE TABLE IF NOT EXISTS "location_updates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "battery_level" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    
    CONSTRAINT "location_updates_pkey" PRIMARY KEY ("id")
);

-- Geofence zones
CREATE TABLE IF NOT EXISTS "geofence_zones" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'circular', 'polygon', 'indoor'
    "boundaries" JSONB NOT NULL, -- { center: {lat, lng}, radius } or { polygon: [{lat, lng}] }
    "alerts" JSONB NOT NULL, -- { onEnter: boolean, onExit: boolean, onDwell: { duration } }
    "restrictions" JSONB, -- { allowedUsers: [], restrictedUsers: [], schedule: [] }
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "geofence_zones_pkey" PRIMARY KEY ("id")
);

-- Tracking alerts
CREATE TABLE IF NOT EXISTS "tracking_alerts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'geofence', 'proximity', 'sos', 'battery', 'inactivity', 'speed', 'custom'
    "severity" TEXT NOT NULL, -- 'info', 'warning', 'critical'
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "location" JSONB,
    "triggered_by" TEXT NOT NULL,
    "target_users" TEXT[],
    "metadata" JSONB,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "tracking_alerts_pkey" PRIMARY KEY ("id")
);

-- Messages
CREATE TABLE IF NOT EXISTS "tracking_messages" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "from_user" TEXT NOT NULL,
    "to_user" TEXT, -- NULL for broadcast
    "type" TEXT NOT NULL, -- 'text', 'location', 'image', 'alert', 'task'
    "content" TEXT NOT NULL,
    "location" JSONB,
    "attachments" TEXT[],
    "priority" TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'high', 'urgent'
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "tracking_messages_pkey" PRIMARY KEY ("id")
);

-- Worker devices
CREATE TABLE IF NOT EXISTS "worker_devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "phone_model" TEXT,
    "ble_version" TEXT,
    "mesh_support" BOOLEAN NOT NULL DEFAULT false,
    "background_scanning" BOOLEAN NOT NULL DEFAULT false,
    "tracking_consent" BOOLEAN NOT NULL DEFAULT false,
    "consent_given_at" TIMESTAMP(3),
    "last_seen" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "worker_devices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "worker_devices_user_device_unique" UNIQUE ("user_id", "device_id")
);

-- Location sharing sessions
CREATE TABLE IF NOT EXISTS "location_sharing" (
    "id" TEXT NOT NULL,
    "shared_by" TEXT NOT NULL,
    "shared_with" TEXT[] NOT NULL,
    "facility_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "location_sharing_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "location_updates_user_facility_idx" ON "location_updates"("user_id", "facility_id");
CREATE INDEX "location_updates_timestamp_idx" ON "location_updates"("timestamp");
CREATE INDEX "geofence_zones_facility_idx" ON "geofence_zones"("facility_id");
CREATE INDEX "tracking_alerts_facility_idx" ON "tracking_alerts"("facility_id");
CREATE INDEX "tracking_alerts_timestamp_idx" ON "tracking_alerts"("timestamp");
CREATE INDEX "tracking_messages_facility_idx" ON "tracking_messages"("facility_id");
CREATE INDEX "tracking_messages_users_idx" ON "tracking_messages"("from_user", "to_user");
CREATE INDEX "worker_devices_user_idx" ON "worker_devices"("user_id");

-- Add foreign key constraints if user and facility tables exist
-- ALTER TABLE "location_updates" ADD CONSTRAINT "location_updates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
-- ALTER TABLE "location_updates" ADD CONSTRAINT "location_updates_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE;