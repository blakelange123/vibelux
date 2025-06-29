-- Update Management System Tables
-- Handles feature rollouts, subscription changes, and notifications

-- Feature Flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0,
  allowed_plans TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_users TEXT[] DEFAULT ARRAY[]::TEXT[],
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Updates table
CREATE TABLE IF NOT EXISTS system_updates (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feature', 'improvement', 'bugfix', 'security', 'breaking')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
  affected_plans TEXT[] DEFAULT ARRAY[]::TEXT[],
  rollout_percentage INTEGER NOT NULL DEFAULT 0,
  scheduled_for TIMESTAMP NOT NULL,
  released_at TIMESTAMP,
  features_added TEXT[] DEFAULT ARRAY[]::TEXT[],
  features_changed TEXT[] DEFAULT ARRAY[]::TEXT[],
  features_deprecated TEXT[] DEFAULT ARRAY[]::TEXT[],
  features_removed TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Feature Overrides table
CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature)
);

-- Update Notifications table
CREATE TABLE IF NOT EXISTS update_notifications (
  id TEXT PRIMARY KEY,
  update_id TEXT NOT NULL REFERENCES system_updates(id),
  user_id TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'in_app', 'push')),
  UNIQUE(update_id, user_id, notification_type)
);

-- Subscription Change Log table
CREATE TABLE IF NOT EXISTS subscription_change_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  from_plan TEXT,
  to_plan TEXT NOT NULL,
  change_reason TEXT,
  effective_date TIMESTAMP NOT NULL,
  created_by TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_expires_at ON feature_flags(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_updates_type ON system_updates(type);
CREATE INDEX IF NOT EXISTS idx_system_updates_severity ON system_updates(severity);
CREATE INDEX IF NOT EXISTS idx_system_updates_scheduled_for ON system_updates(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user_id ON user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_feature ON user_feature_overrides(feature);
CREATE INDEX IF NOT EXISTS idx_update_notifications_user_id ON update_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_update_notifications_read_at ON update_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_subscription_change_log_user_id ON subscription_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_change_log_effective_date ON subscription_change_log(effective_date);

-- Insert default feature flags for existing features
INSERT INTO feature_flags (id, name, description, enabled, rollout_percentage, allowed_plans) VALUES
  ('advanced_analytics', 'Advanced Analytics', 'Enhanced analytics dashboard with ML predictions', true, 100, ARRAY['pro', 'enterprise']),
  ('ai_assistant', 'AI Assistant', 'Claude-powered AI assistance for design and optimization', true, 100, ARRAY['pro', 'enterprise']),
  ('3d_visualization', '3D Visualization', 'Advanced 3D rendering and WebGL visualization', true, 100, ARRAY['pro', 'enterprise']),
  ('multi_site_management', 'Multi-Site Management', 'Manage multiple facilities from single dashboard', true, 100, ARRAY['enterprise']),
  ('white_label', 'White Label', 'Custom branding and white-label capabilities', true, 100, ARRAY['enterprise']),
  ('api_access', 'API Access', 'RESTful API access for third-party integrations', true, 100, ARRAY['pro', 'enterprise']),
  ('advanced_tomato_calculators', 'Advanced Tomato Calculators', 'Tomato-specific physiological monitoring and nutrient calculators', true, 100, ARRAY['free', 'pro', 'enterprise']),
  ('p_band_climate_control', 'P-Band Climate Control', 'Advanced climate control with momentum prevention', true, 100, ARRAY['pro', 'enterprise']),
  ('pollination_analyzer', 'Pollination Success Analyzer', 'Real-time pollination success probability for tomatoes', true, 100, ARRAY['free', 'pro', 'enterprise'])
ON CONFLICT (name) DO NOTHING;

-- Create a default system update entry for the current release
INSERT INTO system_updates (
  id, 
  version, 
  title, 
  description, 
  type, 
  severity, 
  affected_plans, 
  rollout_percentage, 
  scheduled_for, 
  released_at,
  features_added,
  features_changed
) VALUES (
  'v1.0.0-advanced-dutch-research',
  '1.0.0',
  'Advanced Dutch Research Implementation',
  'Complete implementation of tomato-specific calculators based on Advanced Dutch Research methodologies including VeGe balance analysis, P-Band climate control, and comprehensive nutrient management.',
  'feature',
  'major',
  ARRAY['free', 'pro', 'enterprise'],
  100,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  ARRAY[
    'Plant Physiological Monitor with VeGe balance analysis',
    'Tomato Nutrient Calculator with drip/drain targets',
    'Enhanced VPD Calculator with pollination success analyzer',
    'P-Band Climate Control for momentum prevention',
    'Light-based irrigation calculator',
    'Semi-closed greenhouse optimizer'
  ],
  ARRAY[
    'Unified calculator system integration',
    'Enhanced environmental control calculator',
    'Improved nutrient calculator with tomato-specific parameters'
  ]
) ON CONFLICT (id) DO NOTHING;