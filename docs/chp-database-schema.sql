-- CHP Operations Database Schema Extension
-- Extends existing Vibelux database to support Combined Heat & Power operations

-- ============================================================================
-- CHP UNITS TABLE
-- Stores information about CHP equipment at each facility
-- ============================================================================
CREATE TABLE chp_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    
    -- Technical Specifications
    rated_power_output_kw DECIMAL(10,2) NOT NULL, -- kW electrical output
    rated_thermal_output_kw DECIMAL(10,2) NOT NULL, -- kW thermal output
    rated_co2_output_cfh DECIMAL(10,2) NOT NULL, -- CFH CO2 production
    fuel_consumption_therms_per_hour DECIMAL(8,3) NOT NULL,
    electrical_efficiency DECIMAL(5,2), -- %
    thermal_efficiency DECIMAL(5,2), -- %
    overall_efficiency DECIMAL(5,2), -- %
    
    -- Operational Limits
    min_load_percent DECIMAL(5,2) DEFAULT 30, -- Minimum operating load
    max_continuous_hours INTEGER DEFAULT 8760, -- Hours per year
    startup_time_minutes INTEGER DEFAULT 15,
    shutdown_time_minutes INTEGER DEFAULT 10,
    
    -- Control System Integration
    control_system_type VARCHAR(100), -- 'modbus', 'bacnet', 'api', 'manual'
    control_endpoint VARCHAR(500), -- IP/URL for control system
    monitoring_endpoint VARCHAR(500), -- IP/URL for monitoring
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'offline'
    commissioned_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHP MARKET CONDITIONS TABLE
-- Stores real-time and historical market pricing data
-- ============================================================================
CREATE TABLE chp_market_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    
    -- Pricing Data
    grid_price_per_kwh DECIMAL(8,4) NOT NULL, -- $/kWh
    natural_gas_price_per_therm DECIMAL(8,4) NOT NULL, -- $/therm
    co2_price_per_lb DECIMAL(8,4) NOT NULL, -- $/lb
    
    -- Market Context
    time_of_use_period VARCHAR(50), -- 'peak', 'off-peak', 'super-off-peak'
    demand_response_event BOOLEAN DEFAULT FALSE,
    grid_frequency DECIMAL(6,3), -- Hz
    grid_voltage DECIMAL(8,2), -- V
    
    -- Forecasting Data
    forecast_horizon_hours INTEGER, -- How far ahead this data is for
    confidence_level DECIMAL(5,2), -- % confidence in forecast
    
    -- Data Source
    data_source VARCHAR(100), -- 'caiso', 'pjm', 'ercot', 'manual', etc.
    data_quality VARCHAR(50) DEFAULT 'good', -- 'good', 'estimated', 'poor'
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHP ECONOMIC DECISIONS TABLE
-- Stores the economic analysis and decisions made by the optimization engine
-- ============================================================================
CREATE TABLE chp_economic_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chp_unit_id UUID NOT NULL REFERENCES chp_units(id),
    market_conditions_id UUID REFERENCES chp_market_conditions(id),
    
    -- Economic Analysis
    grid_revenue_per_hour DECIMAL(10,2) NOT NULL,
    co2_offset_value_per_hour DECIMAL(10,2) NOT NULL,
    heat_recovery_value_per_hour DECIMAL(10,2) NOT NULL,
    fuel_cost_per_hour DECIMAL(10,2) NOT NULL,
    om_cost_per_hour DECIMAL(10,2) NOT NULL,
    net_benefit_per_hour DECIMAL(10,2) NOT NULL,
    
    -- Decision Parameters
    breakeven_grid_price DECIMAL(8,4) NOT NULL,
    safety_margin_percent DECIMAL(8,2) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL, -- 0-100%
    
    -- Decision Output
    decision VARCHAR(50) NOT NULL, -- 'RUN_CHP', 'PURCHASE_CO2', 'MARGINAL'
    decision_reason TEXT,
    recommended_action VARCHAR(100), -- 'start', 'stop', 'continue', 'monitor'
    
    -- Execution Tracking
    executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_result VARCHAR(100),
    
    -- Next Evaluation
    next_evaluation_time TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    decision_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHP OPERATIONAL DATA TABLE
-- Stores real-time operational data from CHP units
-- ============================================================================
CREATE TABLE chp_operational_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chp_unit_id UUID NOT NULL REFERENCES chp_units(id),
    
    -- Operational Status
    is_running BOOLEAN NOT NULL,
    operating_mode VARCHAR(50), -- 'auto', 'manual', 'maintenance', 'emergency'
    load_percent DECIMAL(5,2), -- % of rated capacity
    
    -- Power Generation
    electrical_output_kw DECIMAL(10,2),
    thermal_output_kw DECIMAL(10,2),
    co2_output_cfh DECIMAL(10,2),
    
    -- Fuel Consumption
    fuel_flow_rate_therms_per_hour DECIMAL(8,3),
    fuel_consumed_today_therms DECIMAL(10,3),
    
    -- Efficiency Metrics
    electrical_efficiency_percent DECIMAL(5,2),
    thermal_efficiency_percent DECIMAL(5,2),
    overall_efficiency_percent DECIMAL(5,2),
    
    -- Engine Metrics
    engine_speed_rpm INTEGER,
    engine_temperature_f DECIMAL(6,2),
    coolant_temperature_f DECIMAL(6,2),
    oil_pressure_psi DECIMAL(6,2),
    
    -- Electrical Metrics
    voltage_phase_a DECIMAL(8,2),
    voltage_phase_b DECIMAL(8,2),
    voltage_phase_c DECIMAL(8,2),
    current_phase_a DECIMAL(8,2),
    current_phase_b DECIMAL(8,2),
    current_phase_c DECIMAL(8,2),
    power_factor DECIMAL(4,3),
    frequency_hz DECIMAL(6,3),
    
    -- Environmental
    exhaust_temperature_f DECIMAL(6,2),
    ambient_temperature_f DECIMAL(6,2),
    
    -- Alarms and Warnings
    alarm_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    active_alarms TEXT[], -- Array of alarm codes/descriptions
    active_warnings TEXT[], -- Array of warning codes/descriptions
    
    -- Runtime Tracking
    runtime_hours_today DECIMAL(6,2),
    runtime_hours_total DECIMAL(10,2),
    start_count_today INTEGER DEFAULT 0,
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHP FINANCIAL PERFORMANCE TABLE
-- Tracks financial performance and ROI of CHP operations
-- ============================================================================
CREATE TABLE chp_financial_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chp_unit_id UUID NOT NULL REFERENCES chp_units(id),
    
    -- Time Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
    
    -- Revenue Streams
    grid_revenue DECIMAL(12,2) NOT NULL,
    co2_offset_value DECIMAL(12,2) NOT NULL,
    heat_recovery_value DECIMAL(12,2) NOT NULL,
    demand_response_payments DECIMAL(12,2) DEFAULT 0,
    renewable_energy_credits DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) NOT NULL,
    
    -- Costs
    fuel_costs DECIMAL(12,2) NOT NULL,
    maintenance_costs DECIMAL(12,2) DEFAULT 0,
    labor_costs DECIMAL(12,2) DEFAULT 0,
    insurance_costs DECIMAL(12,2) DEFAULT 0,
    depreciation DECIMAL(12,2) DEFAULT 0,
    total_costs DECIMAL(12,2) NOT NULL,
    
    -- Performance Metrics
    net_profit DECIMAL(12,2) NOT NULL,
    profit_margin_percent DECIMAL(8,4),
    roi_percent DECIMAL(8,4),
    payback_period_months DECIMAL(8,2),
    
    -- Operational Metrics
    capacity_factor DECIMAL(5,2), -- % of time running
    availability_factor DECIMAL(5,2), -- % of time available
    kwh_generated DECIMAL(12,2),
    therms_consumed DECIMAL(12,2),
    co2_produced_lbs DECIMAL(12,2),
    
    -- Comparison Metrics
    savings_vs_grid_purchase DECIMAL(12,2),
    savings_vs_co2_purchase DECIMAL(12,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHP MAINTENANCE RECORDS TABLE
-- Tracks maintenance activities and schedules
-- ============================================================================
CREATE TABLE chp_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chp_unit_id UUID NOT NULL REFERENCES chp_units(id),
    
    -- Maintenance Details
    maintenance_type VARCHAR(100) NOT NULL, -- 'preventive', 'corrective', 'emergency'
    description TEXT NOT NULL,
    work_performed TEXT,
    parts_replaced TEXT[],
    
    -- Scheduling
    scheduled_date DATE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    downtime_hours DECIMAL(8,2),
    
    -- Personnel
    technician_name VARCHAR(255),
    technician_certification VARCHAR(255),
    supervisor_name VARCHAR(255),
    
    -- Costs
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    contractor_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Results
    maintenance_successful BOOLEAN,
    notes TEXT,
    next_maintenance_due DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- CHP Units
CREATE INDEX idx_chp_units_facility_id ON chp_units(facility_id);
CREATE INDEX idx_chp_units_status ON chp_units(status);

-- Market Conditions
CREATE INDEX idx_chp_market_conditions_facility_timestamp ON chp_market_conditions(facility_id, timestamp);
CREATE INDEX idx_chp_market_conditions_timestamp ON chp_market_conditions(timestamp);
CREATE INDEX idx_chp_market_conditions_data_source ON chp_market_conditions(data_source);

-- Economic Decisions
CREATE INDEX idx_chp_economic_decisions_unit_time ON chp_economic_decisions(chp_unit_id, decision_time);
CREATE INDEX idx_chp_economic_decisions_decision ON chp_economic_decisions(decision);
CREATE INDEX idx_chp_economic_decisions_next_eval ON chp_economic_decisions(next_evaluation_time);

-- Operational Data
CREATE INDEX idx_chp_operational_data_unit_timestamp ON chp_operational_data(chp_unit_id, timestamp);
CREATE INDEX idx_chp_operational_data_is_running ON chp_operational_data(is_running);
CREATE INDEX idx_chp_operational_data_timestamp ON chp_operational_data(timestamp);

-- Financial Performance
CREATE INDEX idx_chp_financial_performance_unit_period ON chp_financial_performance(chp_unit_id, period_start, period_end);
CREATE INDEX idx_chp_financial_performance_period_type ON chp_financial_performance(period_type);

-- Maintenance Records
CREATE INDEX idx_chp_maintenance_records_unit_id ON chp_maintenance_records(chp_unit_id);
CREATE INDEX idx_chp_maintenance_records_scheduled_date ON chp_maintenance_records(scheduled_date);
CREATE INDEX idx_chp_maintenance_records_type ON chp_maintenance_records(maintenance_type);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_chp_units_updated_at BEFORE UPDATE ON chp_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chp_financial_performance_updated_at BEFORE UPDATE ON chp_financial_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chp_maintenance_records_updated_at BEFORE UPDATE ON chp_maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Current CHP Status View
CREATE VIEW chp_current_status AS
SELECT 
    cu.id as chp_unit_id,
    cu.name as unit_name,
    cu.facility_id,
    f.name as facility_name,
    cu.rated_power_output_kw,
    cu.rated_co2_output_cfh,
    cod.is_running,
    cod.electrical_output_kw,
    cod.co2_output_cfh,
    cod.electrical_efficiency_percent,
    cod.runtime_hours_today,
    cod.timestamp as last_reading
FROM chp_units cu
JOIN facilities f ON cu.facility_id = f.id
LEFT JOIN LATERAL (
    SELECT * FROM chp_operational_data 
    WHERE chp_unit_id = cu.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) cod ON true
WHERE cu.status = 'active';

-- Recent Economic Decisions View
CREATE VIEW chp_recent_decisions AS
SELECT 
    ced.id,
    cu.name as unit_name,
    cu.facility_id,
    ced.decision,
    ced.net_benefit_per_hour,
    ced.safety_margin_percent,
    ced.confidence_score,
    ced.decision_time,
    ced.executed,
    mc.grid_price_per_kwh,
    mc.natural_gas_price_per_therm,
    mc.co2_price_per_lb
FROM chp_economic_decisions ced
JOIN chp_units cu ON ced.chp_unit_id = cu.id
LEFT JOIN chp_market_conditions mc ON ced.market_conditions_id = mc.id
WHERE ced.decision_time >= NOW() - INTERVAL '24 hours'
ORDER BY ced.decision_time DESC;

-- Daily Financial Performance View
CREATE VIEW chp_daily_performance AS
SELECT 
    chp_unit_id,
    cu.name as unit_name,
    period_start::date as date,
    SUM(total_revenue) as daily_revenue,
    SUM(total_costs) as daily_costs,
    SUM(net_profit) as daily_profit,
    AVG(capacity_factor) as avg_capacity_factor,
    SUM(kwh_generated) as daily_kwh,
    SUM(co2_produced_lbs) as daily_co2_lbs
FROM chp_financial_performance cfp
JOIN chp_units cu ON cfp.chp_unit_id = cu.id
WHERE period_type = 'daily'
GROUP BY chp_unit_id, cu.name, period_start::date
ORDER BY period_start::date DESC;

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample CHP unit (assuming facility with id exists)
-- INSERT INTO chp_units (
--     facility_id, name, manufacturer, model, 
--     rated_power_output_kw, rated_thermal_output_kw, rated_co2_output_cfh,
--     fuel_consumption_therms_per_hour, electrical_efficiency, thermal_efficiency,
--     control_system_type, status
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000001', -- Replace with actual facility_id
--     'CHP Unit #1',
--     'Caterpillar',
--     'CG132-8',
--     500.0,
--     1200.0,
--     2500.0,
--     58.0,
--     42.5,
--     45.0,
--     'modbus',
--     'active'
-- );

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE chp_units IS 'CHP equipment inventory and specifications';
COMMENT ON TABLE chp_market_conditions IS 'Real-time and historical energy market pricing data';
COMMENT ON TABLE chp_economic_decisions IS 'Economic analysis results and operational decisions';
COMMENT ON TABLE chp_operational_data IS 'Real-time operational telemetry from CHP units';
COMMENT ON TABLE chp_financial_performance IS 'Financial performance tracking and ROI analysis';
COMMENT ON TABLE chp_maintenance_records IS 'Maintenance scheduling, execution, and cost tracking';

COMMENT ON VIEW chp_current_status IS 'Current operational status of all active CHP units';
COMMENT ON VIEW chp_recent_decisions IS 'Recent economic decisions with market context';
COMMENT ON VIEW chp_daily_performance IS 'Daily aggregated financial and operational performance';