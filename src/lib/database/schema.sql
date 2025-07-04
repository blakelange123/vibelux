-- Revenue Sharing Database Schema
-- PostgreSQL schema for Vibelux revenue sharing system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Facilities table (existing, extended)
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS 
  revenue_sharing_enabled BOOLEAN DEFAULT FALSE,
  revenue_sharing_tier VARCHAR(20) DEFAULT 'professional',
  revenue_sharing_start_date DATE,
  billing_settings JSONB DEFAULT '{}';

-- Baselines table
CREATE TABLE IF NOT EXISTS baselines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  metric_type VARCHAR(20) NOT NULL CHECK (metric_type IN ('energy', 'yield', 'cost', 'quality')),
  baseline_value NUMERIC(12,2) NOT NULL,
  measurement_unit VARCHAR(20) NOT NULL,
  period VARCHAR(50) NOT NULL, -- e.g., '12-month average'
  source VARCHAR(20) NOT NULL CHECK (source IN ('historical', 'industry', 'custom', 'imported')),
  effective_date DATE NOT NULL,
  expiry_date DATE,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'disputed')),
  verified_by VARCHAR(100),
  verified_at TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, metric_type, effective_date)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  metric_type VARCHAR(20) NOT NULL CHECK (metric_type IN ('energy', 'yield', 'cost', 'quality')),
  actual_value NUMERIC(12,2) NOT NULL,
  baseline_value NUMERIC(12,2) NOT NULL,
  savings_amount NUMERIC(12,2) NOT NULL,
  measurement_date TIMESTAMP NOT NULL,
  data_source VARCHAR(50) NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 1.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  weather_normalized BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metrics_facility_date (facility_id, measurement_date)
);

-- Revenue share calculations table
CREATE TABLE IF NOT EXISTS revenue_share_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  billing_period VARCHAR(7) NOT NULL, -- YYYY-MM format
  calculation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_savings NUMERIC(12,2) NOT NULL,
  total_revenue_share NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'disputed')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  calculation_details JSONB NOT NULL, -- Detailed breakdown by metric
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, billing_period)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS revenue_share_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id),
  calculation_id UUID NOT NULL REFERENCES revenue_share_calculations(id),
  billing_period VARCHAR(7) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'disputed', 'cancelled')),
  subtotal NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.09,
  tax_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  payment_method_id UUID,
  paid_at TIMESTAMP,
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice line items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES revenue_share_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  metric_type VARCHAR(20) NOT NULL,
  baseline_value NUMERIC(12,2) NOT NULL,
  actual_value NUMERIC(12,2) NOT NULL,
  savings_amount NUMERIC(12,2) NOT NULL,
  revenue_share_percentage NUMERIC(5,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('ach', 'wire', 'credit_card', 'check')),
  is_default BOOLEAN DEFAULT FALSE,
  last_four VARCHAR(4),
  bank_name VARCHAR(100),
  account_type VARCHAR(20),
  stripe_payment_method_id VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES revenue_share_invoices(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processor VARCHAR(50),
  processor_transaction_id VARCHAR(100),
  failure_reason TEXT,
  processed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensor configurations table
CREATE TABLE IF NOT EXISTS sensor_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('temperature', 'humidity', 'co2', 'light', 'power', 'water', 'nutrients')),
  protocol VARCHAR(20) NOT NULL CHECK (protocol IN ('modbus', 'mqtt', 'http', 'bacnet')),
  connection_string TEXT NOT NULL,
  location VARCHAR(100),
  polling_interval INTEGER NOT NULL DEFAULT 60, -- seconds
  is_active BOOLEAN DEFAULT TRUE,
  calibration_offset NUMERIC(8,2) DEFAULT 0,
  calibration_scale NUMERIC(8,4) DEFAULT 1,
  last_calibrated_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensor readings table (time-series data)
CREATE TABLE IF NOT EXISTS sensor_readings (
  sensor_id UUID NOT NULL REFERENCES sensor_configs(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  value NUMERIC(12,4) NOT NULL,
  quality NUMERIC(3,0) DEFAULT 100 CHECK (quality >= 0 AND quality <= 100),
  metadata JSONB DEFAULT '{}',
  PRIMARY KEY (sensor_id, timestamp)
);

-- Create hypertable for time-series data (if using TimescaleDB)
-- SELECT create_hypertable('sensor_readings', 'timestamp');

-- API integrations table
CREATE TABLE IF NOT EXISTS api_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('utility', 'weather', 'equipment', 'compliance')),
  endpoint TEXT NOT NULL,
  api_key_encrypted TEXT, -- Should be encrypted at rest
  headers JSONB DEFAULT '{}',
  refresh_interval INTEGER NOT NULL DEFAULT 60, -- minutes
  data_mapping JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR(20),
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data quality logs table
CREATE TABLE IF NOT EXISTS data_quality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  check_type VARCHAR(50) NOT NULL,
  check_date TIMESTAMP NOT NULL,
  completeness_score NUMERIC(5,2),
  accuracy_score NUMERIC(5,2),
  timeliness_score NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  issues JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing settings table
CREATE TABLE IF NOT EXISTS billing_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  auto_charge BOOLEAN DEFAULT TRUE,
  payment_terms INTEGER DEFAULT 30, -- days
  minimum_billing_amount NUMERIC(8,2) DEFAULT 100.00,
  tax_rate NUMERIC(5,4) DEFAULT 0.09,
  reminder_schedule INTEGER[] DEFAULT ARRAY[7, 3, 1], -- days before due date
  cc_emails TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS revenue_share_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_baselines_facility ON baselines(facility_id);
CREATE INDEX idx_baselines_effective ON baselines(effective_date);
CREATE INDEX idx_metrics_facility ON performance_metrics(facility_id);
CREATE INDEX idx_metrics_date ON performance_metrics(measurement_date);
CREATE INDEX idx_calculations_facility ON revenue_share_calculations(facility_id);
CREATE INDEX idx_calculations_period ON revenue_share_calculations(billing_period);
CREATE INDEX idx_invoices_facility ON revenue_share_invoices(facility_id);
CREATE INDEX idx_invoices_customer ON revenue_share_invoices(customer_id);
CREATE INDEX idx_invoices_status ON revenue_share_invoices(status);
CREATE INDEX idx_invoices_due ON revenue_share_invoices(due_date);
CREATE INDEX idx_transactions_invoice ON payment_transactions(invoice_id);
CREATE INDEX idx_sensors_facility ON sensor_configs(facility_id);
CREATE INDEX idx_integrations_facility ON api_integrations(facility_id);
CREATE INDEX idx_audit_facility ON revenue_share_audit_log(facility_id);
CREATE INDEX idx_audit_created ON revenue_share_audit_log(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_baselines_updated_at BEFORE UPDATE ON baselines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculations_updated_at BEFORE UPDATE ON revenue_share_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON revenue_share_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensor_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON api_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_settings_updated_at BEFORE UPDATE ON billing_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for reporting
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT 
  f.id as facility_id,
  f.name as facility_name,
  rsc.billing_period,
  rsc.total_savings,
  rsc.total_revenue_share,
  rsi.status as invoice_status,
  rsi.total_amount as invoice_total,
  rsi.paid_amount,
  rsi.due_date
FROM facilities f
JOIN revenue_share_calculations rsc ON f.id = rsc.facility_id
LEFT JOIN revenue_share_invoices rsi ON rsc.id = rsi.calculation_id
WHERE f.revenue_sharing_enabled = TRUE
ORDER BY rsc.billing_period DESC;

CREATE OR REPLACE VIEW sensor_status_overview AS
SELECT 
  sc.facility_id,
  sc.type as sensor_type,
  COUNT(*) as total_sensors,
  SUM(CASE WHEN sc.is_active THEN 1 ELSE 0 END) as active_sensors,
  AVG(CASE WHEN sr.timestamp > NOW() - INTERVAL '1 hour' THEN sr.quality ELSE 0 END) as avg_quality
FROM sensor_configs sc
LEFT JOIN LATERAL (
  SELECT quality, timestamp 
  FROM sensor_readings 
  WHERE sensor_id = sc.id 
  ORDER BY timestamp DESC 
  LIMIT 1
) sr ON TRUE
GROUP BY sc.facility_id, sc.type;