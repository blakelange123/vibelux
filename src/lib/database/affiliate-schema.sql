-- Affiliate System Database Schema
-- PostgreSQL schema for Vibelux affiliate program

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  commission_tier_id VARCHAR(50) NOT NULL DEFAULT 'bronze', -- References smart commission structure
  
  -- Stripe Connect
  stripe_account_id VARCHAR(255) UNIQUE,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  
  -- Contact & Company Info
  company_name VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  
  -- Tax Information
  tax_id VARCHAR(50),
  tax_id_type VARCHAR(20) CHECK (tax_id_type IN ('ssn', 'ein', 'itin', 'foreign')),
  tax_form_submitted BOOLEAN DEFAULT FALSE,
  tax_form_submitted_at TIMESTAMP,
  w9_document_url VARCHAR(500),
  
  -- Marketing Info
  audience_size INTEGER,
  niche TEXT[],
  social_media JSONB DEFAULT '{}',
  promotion_methods TEXT[],
  experience_level VARCHAR(50),
  
  -- Statistics
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_commissions_earned DECIMAL(12,2) DEFAULT 0,
  total_commissions_paid DECIMAL(12,2) DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  
  -- Settings
  cookie_duration INTEGER DEFAULT 30, -- days
  payout_schedule VARCHAR(20) DEFAULT 'monthly' CHECK (payout_schedule IN ('weekly', 'biweekly', 'monthly', 'manual')),
  minimum_payout_amount DECIMAL(8,2) DEFAULT 100.00,
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Metadata
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias VARCHAR(50),
  
  -- Campaign tracking
  campaign VARCHAR(100),
  source VARCHAR(100),
  medium VARCHAR(100),
  content VARCHAR(255),
  term VARCHAR(100),
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  
  -- Statistics
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- Metadata
  title VARCHAR(255),
  description TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  visitor_id VARCHAR(100) NOT NULL,
  
  -- Click data
  ip_address INET NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  
  -- Device info
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'other')),
  os VARCHAR(50),
  browser VARCHAR(50),
  
  -- Location
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- UTM parameters
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(255),
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP,
  conversion_value DECIMAL(12,2),
  
  -- Metadata
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(visitor_id, link_id, clicked_at)
);

-- Affiliate conversions table
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  click_id UUID REFERENCES affiliate_clicks(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  
  -- Conversion details
  conversion_type VARCHAR(50) NOT NULL CHECK (conversion_type IN ('signup', 'subscription', 'revenue_sharing', 'upgrade', 'renewal')),
  conversion_value DECIMAL(12,2) NOT NULL,
  recurring_value DECIMAL(12,2), -- For subscriptions
  
  -- Customer info
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  payment_model VARCHAR(20) CHECK (payment_model IN ('subscription', 'revenue-sharing')),
  subscription_tier VARCHAR(50),
  
  -- Tracking
  attribution_window INTEGER NOT NULL, -- days between click and conversion
  first_click_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fraud')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  order_id VARCHAR(100),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  conversion_id UUID REFERENCES affiliate_conversions(id),
  
  -- Commission details
  commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN ('signup_bonus', 'recurring', 'retention_bonus', 'volume_bonus', 'growth_bonus', 'manual')),
  base_amount DECIMAL(12,2) NOT NULL, -- Amount before commission
  commission_rate DECIMAL(5,2) NOT NULL, -- Percentage rate applied
  commission_amount DECIMAL(12,2) NOT NULL, -- Actual commission earned
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- For recurring commissions
  customer_months_active INTEGER, -- How many months customer has been active
  current_rate_tier VARCHAR(20), -- Which rate tier applies (months1to6, etc)
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'canceled')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  -- Period tracking
  commission_month VARCHAR(7) NOT NULL, -- YYYY-MM format
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate payouts table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Payout details
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
  commission_ids UUID[] NOT NULL, -- Array of commission IDs included
  
  -- Stripe info
  stripe_transfer_id VARCHAR(255) UNIQUE,
  stripe_payout_id VARCHAR(255),
  processing_fee DECIMAL(8,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'canceled', 'returned')),
  failure_reason TEXT,
  
  -- Dates
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  paid_at TIMESTAMP,
  
  -- Metadata
  payout_method VARCHAR(20) DEFAULT 'stripe' CHECK (payout_method IN ('stripe', 'paypal', 'wire', 'check', 'crypto')),
  reference_number VARCHAR(100),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate notifications table
CREATE TABLE IF NOT EXISTS affiliate_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  
  -- Related entities
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  
  -- Metadata
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate activity log table
CREATE TABLE IF NOT EXISTS affiliate_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- Who performed the action
  
  -- Activity details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  
  -- Request info
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_tier ON affiliates(tier);
CREATE INDEX idx_affiliates_stripe_account ON affiliates(stripe_account_id);

CREATE INDEX idx_links_affiliate_id ON affiliate_links(affiliate_id);
CREATE INDEX idx_links_short_code ON affiliate_links(short_code);
CREATE INDEX idx_links_active ON affiliate_links(is_active);

CREATE INDEX idx_clicks_link_id ON affiliate_clicks(link_id);
CREATE INDEX idx_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_clicks_visitor_id ON affiliate_clicks(visitor_id);
CREATE INDEX idx_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX idx_clicks_clicked_at ON affiliate_clicks(clicked_at);

CREATE INDEX idx_conversions_affiliate_id ON affiliate_conversions(affiliate_id);
CREATE INDEX idx_conversions_customer_id ON affiliate_conversions(customer_id);
CREATE INDEX idx_conversions_status ON affiliate_conversions(status);
CREATE INDEX idx_conversions_converted_at ON affiliate_conversions(converted_at);

CREATE INDEX idx_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON affiliate_commissions(status);
CREATE INDEX idx_commissions_month ON affiliate_commissions(commission_month);
CREATE INDEX idx_commissions_type ON affiliate_commissions(commission_type);

CREATE INDEX idx_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_payouts_status ON affiliate_payouts(status);
CREATE INDEX idx_payouts_period ON affiliate_payouts(period_start, period_end);

-- Triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON affiliate_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON affiliate_commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON affiliate_payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for reporting
CREATE OR REPLACE VIEW affiliate_performance_summary AS
SELECT 
  a.id,
  a.affiliate_code,
  a.company_name,
  a.tier,
  a.status,
  a.total_clicks,
  a.total_conversions,
  a.total_revenue,
  a.total_commissions_earned,
  a.total_commissions_paid,
  a.active_referrals,
  CASE 
    WHEN a.total_clicks > 0 THEN ROUND((a.total_conversions::NUMERIC / a.total_clicks) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  CASE 
    WHEN a.total_conversions > 0 THEN ROUND(a.total_revenue / a.total_conversions, 2)
    ELSE 0 
  END as avg_order_value,
  a.created_at,
  a.last_activity_at
FROM affiliates a
ORDER BY a.total_commissions_earned DESC;

CREATE OR REPLACE VIEW monthly_commission_summary AS
SELECT 
  ac.affiliate_id,
  a.affiliate_code,
  a.company_name,
  ac.commission_month,
  COUNT(*) as commission_count,
  SUM(CASE WHEN ac.commission_type = 'recurring' THEN ac.commission_amount ELSE 0 END) as recurring_commissions,
  SUM(CASE WHEN ac.commission_type = 'signup_bonus' THEN ac.commission_amount ELSE 0 END) as signup_bonuses,
  SUM(CASE WHEN ac.commission_type IN ('retention_bonus', 'volume_bonus', 'growth_bonus') THEN ac.commission_amount ELSE 0 END) as performance_bonuses,
  SUM(ac.commission_amount) as total_commissions,
  COUNT(DISTINCT ac.conversion_id) as unique_customers
FROM affiliate_commissions ac
JOIN affiliates a ON ac.affiliate_id = a.id
WHERE ac.status = 'approved'
GROUP BY ac.affiliate_id, a.affiliate_code, a.company_name, ac.commission_month
ORDER BY ac.commission_month DESC, total_commissions DESC;

-- Sample data migration for existing system
-- This would need to be customized based on existing user data
/*
INSERT INTO affiliates (user_id, affiliate_code, status, tier)
SELECT 
  id as user_id,
  'AFF' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0') as affiliate_code,
  'pending' as status,
  'bronze' as tier
FROM users
WHERE role = 'affiliate'
ON CONFLICT DO NOTHING;
*/