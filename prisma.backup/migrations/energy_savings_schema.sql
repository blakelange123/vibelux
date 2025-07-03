-- Energy Savings Program Database Schema
-- Add these tables to your existing PostgreSQL database

-- Energy optimization configurations per facility
CREATE TABLE energy_optimization_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  facility_name VARCHAR(255) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  primary_crop VARCHAR(50) NOT NULL,
  primary_growth_stage VARCHAR(50) NOT NULL,
  
  -- Rate schedule (if manual)
  use_manual_rates BOOLEAN DEFAULT FALSE,
  peak_start TIME,
  peak_end TIME,
  peak_rate DECIMAL(6,4),
  off_peak_rate DECIMAL(6,4),
  shoulder_rate DECIMAL(6,4),
  demand_charge DECIMAL(8,2),
  
  -- Configuration
  max_dimming_percent INTEGER DEFAULT 85,
  allow_photoperiod_shift BOOLEAN DEFAULT TRUE,
  emergency_contact_email VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  -- Status
  optimization_active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  last_optimization_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lighting zones configuration
CREATE TABLE lighting_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES energy_optimization_config(id) ON DELETE CASCADE,
  zone_name VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL, -- Maps to existing hardware
  max_power_kw DECIMAL(8,2) NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  growth_stage VARCHAR(50) NOT NULL,
  
  -- Current state
  current_intensity INTEGER DEFAULT 100,
  current_photoperiod DECIMAL(4,2),
  lights_on_time TIME,
  lights_off_time TIME,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time power readings
CREATE TABLE power_readings (
  id BIGSERIAL PRIMARY KEY,
  facility_id UUID NOT NULL,
  zone_id UUID REFERENCES lighting_zones(id),
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Electrical measurements
  power_kw DECIMAL(10,3) NOT NULL,
  energy_kwh DECIMAL(12,3),
  power_factor DECIMAL(3,2),
  voltage DECIMAL(6,2),
  current DECIMAL(8,2),
  frequency DECIMAL(4,2),
  
  -- Cost data
  rate_per_kwh DECIMAL(6,4),
  rate_schedule VARCHAR(20), -- 'peak', 'off-peak', 'shoulder'
  
  -- Metadata
  source VARCHAR(50), -- 'meter', 'calculated', 'manual'
  device_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization events log
CREATE TABLE optimization_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  zone_id UUID REFERENCES lighting_zones(id),
  event_time TIMESTAMPTZ NOT NULL,
  
  -- Action taken
  action_type VARCHAR(50) NOT NULL, -- 'dim', 'restore', 'shift', 'block'
  action_value JSONB NOT NULL, -- {"from": 100, "to": 85, "reason": "peak shaving"}
  
  -- Crop safety
  crop_type VARCHAR(50),
  growth_stage VARCHAR(50),
  safety_score INTEGER, -- 0-100
  blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  
  -- Energy impact
  baseline_power_kw DECIMAL(10,3),
  optimized_power_kw DECIMAL(10,3),
  power_saved_kw DECIMAL(10,3),
  
  -- Context
  energy_rate DECIMAL(6,4),
  rate_schedule VARCHAR(20),
  outside_temperature DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verified savings for billing
CREATE TABLE verified_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Baseline (what they would have used)
  baseline_kwh DECIMAL(12,2) NOT NULL,
  baseline_cost DECIMAL(10,2) NOT NULL,
  baseline_peak_kw DECIMAL(10,2),
  
  -- Actual usage
  actual_kwh DECIMAL(12,2) NOT NULL,
  actual_cost DECIMAL(10,2) NOT NULL,
  actual_peak_kw DECIMAL(10,2),
  
  -- Verified savings
  kwh_saved DECIMAL(12,2) NOT NULL,
  dollars_saved DECIMAL(10,2) NOT NULL,
  percent_saved DECIMAL(5,2) NOT NULL,
  co2_avoided_kg DECIMAL(10,2),
  
  -- Revenue share (20%)
  revenue_share_amount DECIMAL(10,2) NOT NULL,
  
  -- Verification
  verification_method VARCHAR(50) DEFAULT 'IPMVP',
  confidence_score INTEGER, -- 0-100
  verified_by VARCHAR(255),
  verified_at TIMESTAMPTZ,
  
  -- Billing
  invoice_number VARCHAR(50),
  invoice_sent_at TIMESTAMPTZ,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_received_at TIMESTAMPTZ,
  
  -- Detailed breakdown
  savings_breakdown JSONB, -- Daily/hourly breakdown
  optimization_summary JSONB, -- What strategies were used
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System health and alerts
CREATE TABLE energy_system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  alert_time TIMESTAMPTZ NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'safety', 'hardware', 'savings', 'system'
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Context
  zone_id UUID REFERENCES lighting_zones(id),
  related_event_id UUID,
  
  -- Resolution
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Notifications sent
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baseline establishment
CREATE TABLE energy_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  baseline_name VARCHAR(255),
  
  -- Period used for baseline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Baseline metrics
  avg_daily_kwh DECIMAL(10,2) NOT NULL,
  avg_daily_cost DECIMAL(10,2) NOT NULL,
  avg_peak_demand_kw DECIMAL(10,2),
  
  -- By rate schedule
  peak_hours_kwh DECIMAL(10,2),
  off_peak_hours_kwh DECIMAL(10,2),
  shoulder_hours_kwh DECIMAL(10,2),
  
  -- Operating conditions during baseline
  avg_temperature DECIMAL(5,2),
  production_volume DECIMAL(10,2),
  operating_hours DECIMAL(6,2),
  
  -- Validation
  data_quality_score INTEGER, -- 0-100
  approved BOOLEAN DEFAULT FALSE,
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_power_readings_facility_time ON power_readings(facility_id, timestamp DESC);
CREATE INDEX idx_power_readings_zone_time ON power_readings(zone_id, timestamp DESC);
CREATE INDEX idx_optimization_events_facility_time ON optimization_events(facility_id, event_time DESC);
CREATE INDEX idx_optimization_events_zone_time ON optimization_events(zone_id, event_time DESC);
CREATE INDEX idx_verified_savings_facility ON verified_savings(facility_id);
CREATE INDEX idx_energy_system_alerts_facility ON energy_system_alerts(facility_id, alert_time DESC);
CREATE INDEX idx_energy_baselines_facility ON energy_baselines(facility_id);

-- Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_energy_optimization_config_updated_at 
  BEFORE UPDATE ON energy_optimization_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lighting_zones_updated_at 
  BEFORE UPDATE ON lighting_zones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verified_savings_updated_at 
  BEFORE UPDATE ON verified_savings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();