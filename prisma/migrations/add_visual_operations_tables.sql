-- Visual Operations Intelligence Database Schema
-- Task Completion Tracking
CREATE TABLE IF NOT EXISTS task_completion (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    room_zone TEXT NOT NULL,
    description TEXT,
    completed_by TEXT NOT NULL,
    location TEXT, -- JSON string with lat/lng
    status TEXT DEFAULT 'photo_pending', -- photo_pending, verified, completed, rejected
    before_photo_url TEXT,
    after_photo_url TEXT,
    verification_score REAL,
    ai_analysis TEXT, -- JSON string with AI analysis results
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Photo Reports
CREATE TABLE IF NOT EXISTS inventory_report (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    room_zone TEXT NOT NULL,
    report_type TEXT NOT NULL, -- low_stock, damaged_goods, missing_items, cycle_count
    description TEXT,
    reported_by TEXT NOT NULL,
    location TEXT, -- JSON string with lat/lng
    status TEXT DEFAULT 'photo_pending', -- photo_pending, investigating, resolved
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    photo_urls TEXT, -- JSON array of photo URLs
    ai_analysis TEXT, -- JSON string with AI analysis
    items_affected TEXT, -- JSON array of affected items
    estimated_cost REAL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Control Photo Reports
CREATE TABLE IF NOT EXISTS quality_report (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    room_zone TEXT NOT NULL,
    issue_type TEXT NOT NULL, -- product_defect, contamination, process_deviation, packaging_issue
    description TEXT,
    reported_by TEXT NOT NULL,
    location TEXT, -- JSON string with lat/lng
    status TEXT DEFAULT 'investigating', -- investigating, contained, resolved, escalated
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    compliance_risk BOOLEAN DEFAULT FALSE,
    photo_urls TEXT, -- JSON array of photo URLs
    ai_analysis TEXT, -- JSON string with AI analysis
    recommended_actions TEXT, -- JSON array of recommended actions
    batch_numbers TEXT, -- JSON array of affected batches
    regulatory_report_needed BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generic Photo Reports
CREATE TABLE IF NOT EXISTS photo_report (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    report_type TEXT NOT NULL, -- qr_asset, custom_issue, compliance_doc, environmental_issue
    category TEXT NOT NULL, -- ipm, maintenance, safety, quality, inventory, environmental, compliance
    title TEXT NOT NULL,
    room_zone TEXT NOT NULL,
    description TEXT,
    reported_by TEXT NOT NULL,
    location TEXT, -- JSON string with lat/lng
    status TEXT DEFAULT 'submitted', -- submitted, in_review, assigned, resolved
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    urgency TEXT DEFAULT 'normal', -- normal, review_needed, regulatory, environmental
    photo_urls TEXT, -- JSON array of photo URLs
    ai_analysis TEXT, -- JSON string with AI analysis
    recommended_actions TEXT, -- JSON array of recommended actions
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photo Storage and Processing Metadata
CREATE TABLE IF NOT EXISTS photo_metadata (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    original_url TEXT NOT NULL,
    compressed_url TEXT,
    thumbnail_url TEXT,
    category TEXT NOT NULL,
    report_type TEXT,
    report_id TEXT, -- Links to specific report tables
    file_size INTEGER,
    dimensions TEXT, -- JSON with width/height
    exif_data TEXT, -- JSON with EXIF metadata
    ai_analysis TEXT, -- JSON with AI analysis results
    ocr_text TEXT, -- Extracted text from OCR
    processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visual Operations Analytics
CREATE TABLE IF NOT EXISTS visual_operations_stats (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_reports INTEGER DEFAULT 0,
    critical_issues INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    avg_response_time_hours REAL DEFAULT 0,
    cost_savings REAL DEFAULT 0,
    active_alerts INTEGER DEFAULT 0,
    report_breakdown TEXT, -- JSON with breakdown by type
    ai_accuracy_scores TEXT, -- JSON with accuracy metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_completion_facility_date ON task_completion(facility_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_inventory_report_facility_status ON inventory_report(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_quality_report_facility_severity ON quality_report(facility_id, severity);
CREATE INDEX IF NOT EXISTS idx_photo_report_facility_priority ON photo_report(facility_id, priority);
CREATE INDEX IF NOT EXISTS idx_photo_metadata_facility_category ON photo_metadata(facility_id, category);
CREATE INDEX IF NOT EXISTS idx_visual_ops_stats_facility_date ON visual_operations_stats(facility_id, date);