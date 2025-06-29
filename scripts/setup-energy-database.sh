#!/bin/bash

# Energy Optimization Database Setup Script
# This script sets up the PostgreSQL database tables for the energy optimization system

set -e  # Exit on error

echo "🚀 Setting up Energy Optimization Database..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create a .env file with your DATABASE_URL"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}Using database: $DATABASE_URL${NC}"

# Function to run SQL file
run_sql() {
    local sql_file=$1
    echo -e "${YELLOW}Running: $sql_file${NC}"
    
    if [ -f "$sql_file" ]; then
        psql "$DATABASE_URL" -f "$sql_file"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully executed $sql_file${NC}"
        else
            echo -e "${RED}❌ Failed to execute $sql_file${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ File not found: $sql_file${NC}"
        exit 1
    fi
}

# Create backup of existing database (optional)
echo -e "${YELLOW}Creating database backup...${NC}"
BACKUP_FILE="backup/energy_db_backup_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backup
pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || echo -e "${YELLOW}No existing data to backup${NC}"

# Run the energy savings schema
run_sql "prisma/migrations/energy_savings_schema.sql"

# Create initial data
echo -e "${YELLOW}Creating initial data...${NC}"
psql "$DATABASE_URL" << EOF
-- Insert default energy optimization config for demo
INSERT INTO energy_optimization_config (
    facility_id,
    facility_name,
    zip_code,
    primary_crop,
    primary_growth_stage,
    use_manual_rates,
    peak_start,
    peak_end,
    peak_rate,
    off_peak_rate,
    shoulder_rate,
    demand_charge,
    max_dimming_percent,
    allow_photoperiod_shift,
    optimization_active
) VALUES (
    gen_random_uuid(),
    'Demo Facility',
    '12345',
    'cannabis',
    'flowering',
    true,
    '14:00',
    '19:00',
    0.18,
    0.08,
    0.12,
    15.00,
    85,
    false,
    false
) ON CONFLICT DO NOTHING;

-- Add sample lighting zones
WITH config AS (
    SELECT id FROM energy_optimization_config WHERE facility_name = 'Demo Facility' LIMIT 1
)
INSERT INTO lighting_zones (
    config_id,
    zone_name,
    device_id,
    max_power_kw,
    crop_type,
    growth_stage,
    current_intensity,
    current_photoperiod,
    lights_on_time,
    lights_off_time
)
SELECT 
    config.id,
    zone_name,
    device_id,
    max_power,
    crop_type,
    growth_stage,
    100,
    photoperiod,
    lights_on,
    lights_off
FROM config, (VALUES
    ('Flower Room A', 'modbus-device-001', 75.0, 'cannabis', 'flowering', 12, '08:00', '20:00'),
    ('Flower Room B', 'modbus-device-002', 75.0, 'cannabis', 'flowering', 12, '08:00', '20:00'),
    ('Veg Room 1', 'modbus-device-003', 50.0, 'cannabis', 'vegetative', 18, '06:00', '00:00'),
    ('Clone Room', 'modbus-device-004', 25.0, 'cannabis', 'vegetative', 24, '00:00', '00:00')
) AS zones(zone_name, device_id, max_power, crop_type, growth_stage, photoperiod, lights_on, lights_off)
ON CONFLICT DO NOTHING;

echo "Sample data created successfully"
EOF

# Create indexes for better performance
echo -e "${YELLOW}Creating additional indexes...${NC}"
psql "$DATABASE_URL" << EOF
-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_power_readings_hour ON power_readings (EXTRACT(hour FROM timestamp));
CREATE INDEX IF NOT EXISTS idx_optimization_events_action ON optimization_events (action_type);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON energy_system_alerts (facility_id, resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_verified_savings_period ON verified_savings (billing_period_start, billing_period_end);

-- Create a view for real-time monitoring
CREATE OR REPLACE VIEW real_time_energy_status AS
SELECT 
    lz.id as zone_id,
    lz.zone_name,
    lz.crop_type,
    lz.growth_stage,
    lz.current_intensity,
    lz.max_power_kw,
    pr.power_kw as current_power_kw,
    pr.power_kw / lz.max_power_kw * 100 as utilization_percent,
    pr.rate_per_kwh,
    pr.timestamp as last_reading,
    CASE 
        WHEN pr.rate_schedule = 'peak' THEN 'Peak Hours'
        WHEN pr.rate_schedule = 'off-peak' THEN 'Off-Peak'
        ELSE 'Shoulder'
    END as rate_period
FROM lighting_zones lz
LEFT JOIN LATERAL (
    SELECT * FROM power_readings 
    WHERE zone_id = lz.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) pr ON true;

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_energy_summary AS
SELECT 
    DATE(timestamp) as date,
    facility_id,
    zone_id,
    SUM(energy_kwh) as total_kwh,
    AVG(power_kw) as avg_power_kw,
    MAX(power_kw) as peak_power_kw,
    SUM(energy_kwh * rate_per_kwh) as total_cost,
    COUNT(*) as reading_count
FROM power_readings
GROUP BY DATE(timestamp), facility_id, zone_id;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_daily_summary()
RETURNS void AS \$\$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_energy_summary;
END;
\$\$ LANGUAGE plpgsql;

echo "Views and functions created successfully"
EOF

# Set up cron job for maintenance (optional)
echo -e "${YELLOW}Setting up maintenance tasks...${NC}"
psql "$DATABASE_URL" << EOF
-- Create pg_cron extension if available (requires pg_cron extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh of materialized view (if pg_cron is available)
DO \$\$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule('refresh-energy-summary', '0 1 * * *', 'SELECT refresh_daily_summary();');
        PERFORM cron.schedule('cleanup-old-readings', '0 2 * * 0', 'DELETE FROM power_readings WHERE timestamp < NOW() - INTERVAL ''90 days'';');
    END IF;
END
\$\$;
EOF

# Verify setup
echo -e "${YELLOW}Verifying database setup...${NC}"
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('energy_optimization_config', 'lighting_zones', 'power_readings', 'optimization_events', 'verified_savings', 'energy_system_alerts', 'energy_baselines');")

if [ $TABLES -eq 7 ]; then
    echo -e "${GREEN}✅ All tables created successfully!${NC}"
else
    echo -e "${RED}❌ Some tables are missing. Found $TABLES out of 7 expected tables.${NC}"
    exit 1
fi

# Generate Prisma types
echo -e "${YELLOW}Generating Prisma types...${NC}"
npx prisma db pull
npx prisma generate

echo -e "${GREEN}🎉 Energy Optimization Database Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start the energy optimization service: npm run start:energy"
echo "2. Configure facilities at: http://localhost:3000/energy-setup"
echo "3. Monitor savings at: http://localhost:3000/energy-savings"
echo ""
echo -e "${YELLOW}Database backup saved to: $BACKUP_FILE${NC}"