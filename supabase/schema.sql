-- ==============================================================================
-- HPE Morpheus License Sizing Wizard - Supabase Database Schema
-- This schema is designed for future Supabase integration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- SIZING QUOTES TABLE
-- Main table storing all sizing quote data
-- ==============================================================================

CREATE TABLE IF NOT EXISTS sizing_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Customer Information
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    
    -- Datacenter Configuration (JSONB for flexibility)
    datacenters JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Public Cloud Configuration (JSONB)
    public_cloud JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Kubernetes Configuration
    kubernetes_workers INTEGER DEFAULT 0,
    
    -- Calculated Results
    on_prem_sockets INTEGER DEFAULT 0,
    public_cloud_sockets INTEGER DEFAULT 0,
    kubernetes_sockets INTEGER DEFAULT 0,
    total_sockets INTEGER DEFAULT 0,
    
    -- Status Tracking
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'POC', 'Won', 'Lost', 'Pending')),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by TEXT,
    region TEXT
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_sizing_quotes_customer_name ON sizing_quotes(customer_name);
CREATE INDEX IF NOT EXISTS idx_sizing_quotes_status ON sizing_quotes(status);
CREATE INDEX IF NOT EXISTS idx_sizing_quotes_created_at ON sizing_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sizing_quotes_total_sockets ON sizing_quotes(total_sockets);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE sizing_quotes ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to see all quotes
CREATE POLICY "Users can view all quotes" ON sizing_quotes
    FOR SELECT
    USING (true);

-- Policy for authenticated users to insert quotes
CREATE POLICY "Users can insert quotes" ON sizing_quotes
    FOR INSERT
    WITH CHECK (true);

-- Policy for authenticated users to update quotes
CREATE POLICY "Users can update quotes" ON sizing_quotes
    FOR UPDATE
    USING (true);

-- ==============================================================================
-- FUNCTIONS
-- ==============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sizing_quotes_updated_at
    BEFORE UPDATE ON sizing_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- VIEWS
-- ==============================================================================

-- Summary view for reporting
CREATE OR REPLACE VIEW sizing_quotes_summary AS
SELECT 
    status,
    COUNT(*) as quote_count,
    SUM(total_sockets) as total_sockets_all,
    AVG(total_sockets)::INTEGER as avg_sockets_per_quote,
    MIN(created_at) as earliest_quote,
    MAX(created_at) as latest_quote
FROM sizing_quotes
GROUP BY status;

-- Recent quotes view
CREATE OR REPLACE VIEW recent_sizing_quotes AS
SELECT 
    id,
    customer_name,
    customer_email,
    total_sockets,
    status,
    created_at
FROM sizing_quotes
ORDER BY created_at DESC
LIMIT 50;

-- ==============================================================================
-- SAMPLE DATA (for testing)
-- ==============================================================================

-- Uncomment to insert sample data
/*
INSERT INTO sizing_quotes (
    customer_name,
    customer_email,
    datacenters,
    public_cloud,
    kubernetes_workers,
    on_prem_sockets,
    public_cloud_sockets,
    kubernetes_sockets,
    total_sockets,
    status,
    region
) VALUES (
    'Sydney Water Corporation',
    'it@sydneywater.com.au',
    '[{"name": "Sydney DC1", "hypervisor": "vmware-vsphere", "hosts": 12, "socketsPerHost": 2}]'::jsonb,
    '[{"provider": "aws", "vms": 45}, {"provider": "azure", "vms": 30}]'::jsonb,
    50,
    24,
    5,
    5,
    34,
    'POC',
    'APAC'
);
*/
