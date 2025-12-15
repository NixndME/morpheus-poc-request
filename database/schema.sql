-- ============================================================================
-- Morpheus POC License Request Tool - Database Schema
-- Database: morpheus_poc
-- Schema: poc_tracker
-- ============================================================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS poc_tracker;

-- Set search path
SET search_path TO poc_tracker;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE requestor_type AS ENUM (
    'hpe-sales-engineer',
    'partner-engineer',
    'gsi-partner',
    'distributor',
    'internal-team'
);

CREATE TYPE poc_status AS ENUM (
    'Draft',
    'Pending Review',
    'Approved',
    'Active',
    'Extended',
    'Completed',
    'Expired',
    'Cancelled'
);

CREATE TYPE poc_outcome AS ENUM (
    'Success - PO Expected',
    'Success - PO Received',
    'Partial Success',
    'Failed - Technical',
    'Failed - Business',
    'Failed - No Budget',
    'Failed - Competition',
    'Pending',
    'N/A'
);

CREATE TYPE deal_size AS ENUM (
    'less-than-50k',
    '50k-100k',
    '100k-250k',
    '250k-500k',
    '500k-plus',
    'unknown'
);

-- ============================================================================
-- MAIN TABLE: poc_requests
-- ============================================================================

CREATE TABLE poc_requests (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(20) UNIQUE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Requestor Information
    requestor_name VARCHAR(255) NOT NULL,
    requestor_email VARCHAR(255) NOT NULL,
    requestor_type requestor_type NOT NULL,
    requestor_company VARCHAR(255),
    requestor_region VARCHAR(50) NOT NULL,
    opportunity_id VARCHAR(100),
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_industry VARCHAR(100) NOT NULL,
    customer_country VARCHAR(100),
    customer_contact_name VARCHAR(255),
    customer_contact_email VARCHAR(255),
    
    -- POC Details
    use_case_description TEXT NOT NULL,
    business_justification TEXT,
    poc_duration INTEGER NOT NULL DEFAULT 45,
    start_date DATE,
    expected_end_date DATE,
    success_criteria TEXT NOT NULL,
    deal_size deal_size NOT NULL DEFAULT 'unknown',
    environment_ready BOOLEAN NOT NULL DEFAULT false,
    
    -- Infrastructure (stored as JSONB for flexibility)
    datacenters JSONB DEFAULT '[]'::jsonb,
    public_cloud JSONB DEFAULT '[]'::jsonb,
    kubernetes_clusters JSONB DEFAULT '[]'::jsonb,
    
    -- Integrations (stored as JSONB)
    integrations JSONB DEFAULT '{}'::jsonb,
    
    -- Calculated Values
    on_prem_sockets INTEGER DEFAULT 0,
    public_cloud_sockets INTEGER DEFAULT 0,
    kubernetes_sockets INTEGER DEFAULT 0,
    total_sockets INTEGER DEFAULT 0,
    
    -- Status & Tracking
    status poc_status DEFAULT 'Pending Review',
    outcome poc_outcome DEFAULT 'Pending',
    outcome_details JSONB,
    
    -- Approval Info
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    
    -- License Info
    license_key TEXT,
    
    -- Notes
    internal_notes TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_poc_requests_reference_id ON poc_requests(reference_id);
CREATE INDEX idx_poc_requests_status ON poc_requests(status);
CREATE INDEX idx_poc_requests_created_at ON poc_requests(created_at DESC);
CREATE INDEX idx_poc_requests_customer_name ON poc_requests(customer_name);
CREATE INDEX idx_poc_requests_requestor_email ON poc_requests(requestor_email);
CREATE INDEX idx_poc_requests_requestor_region ON poc_requests(requestor_region);
CREATE INDEX idx_poc_requests_deal_size ON poc_requests(deal_size);

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_poc_requests_updated_at
    BEFORE UPDATE ON poc_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE poc_audit_log (
    id SERIAL PRIMARY KEY,
    poc_id UUID REFERENCES poc_requests(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    old_status poc_status,
    new_status poc_status,
    comment TEXT,
    details JSONB
);

CREATE INDEX idx_audit_log_poc_id ON poc_audit_log(poc_id);
CREATE INDEX idx_audit_log_performed_at ON poc_audit_log(performed_at DESC);

-- ============================================================================
-- VIEWS FOR REPORTING / BI
-- ============================================================================

-- Summary view for dashboard
CREATE VIEW poc_summary AS
SELECT 
    status,
    COUNT(*) as count,
    SUM(total_sockets) as total_sockets,
    AVG(poc_duration) as avg_duration
FROM poc_requests
GROUP BY status;

-- Regional breakdown
CREATE VIEW poc_by_region AS
SELECT 
    requestor_region,
    status,
    COUNT(*) as count,
    SUM(total_sockets) as total_sockets
FROM poc_requests
GROUP BY requestor_region, status
ORDER BY requestor_region, status;

-- Deal size analysis
CREATE VIEW poc_by_deal_size AS
SELECT 
    deal_size,
    status,
    COUNT(*) as count,
    SUM(total_sockets) as total_sockets
FROM poc_requests
GROUP BY deal_size, status
ORDER BY deal_size, status;

-- Monthly trends
CREATE VIEW poc_monthly_trends AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    status,
    COUNT(*) as count,
    SUM(total_sockets) as total_sockets
FROM poc_requests
GROUP BY DATE_TRUNC('month', created_at), status
ORDER BY month DESC, status;

-- Industry breakdown
CREATE VIEW poc_by_industry AS
SELECT 
    customer_industry,
    COUNT(*) as count,
    SUM(total_sockets) as total_sockets,
    COUNT(CASE WHEN status = 'Completed' AND outcome LIKE 'Success%' THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'Completed' AND outcome LIKE 'Failed%' THEN 1 END) as failed
FROM poc_requests
GROUP BY customer_industry
ORDER BY count DESC;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO poc_requests (
    reference_id,
    requestor_name, requestor_email, requestor_type, requestor_company, requestor_region,
    customer_name, customer_industry, customer_country,
    use_case_description, business_justification, poc_duration, success_criteria,
    deal_size, environment_ready,
    datacenters, public_cloud, kubernetes_clusters, integrations,
    on_prem_sockets, public_cloud_sockets, kubernetes_sockets, total_sockets,
    status
) VALUES (
    'POC-2024-DEMO01',
    'John Smith', 'john.smith@partner.com', 'partner-engineer', 'AC3', 'anz',
    'Sydney Water Corporation', 'government', 'Australia',
    'VMware migration to Morpheus with self-service portal',
    'Cost reduction initiative after Broadcom acquisition',
    45,
    'Successfully migrate 50 VMs and deploy self-service catalog',
    '100k-250k', true,
    '[{"id": "dc1", "name": "Sydney DC1", "hypervisor": "vmware-vsphere", "hosts": 12, "socketsPerHost": 2}]',
    '[{"provider": "aws", "vms": 45}]',
    '[{"id": "k8s1", "name": "Production EKS", "distribution": "eks", "workers": 30, "location": "aws"}]',
    '{"automation": ["ansible-tower", "terraform"], "itsm": "servicenow", "loadBalancer": ["f5-bigip"], "dnsIpam": ["infoblox"]}',
    24, 3, 3, 30,
    'Active'
);
*/

-- ============================================================================
-- GRANTS (adjust as needed for your setup)
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA poc_tracker TO admin;

-- Grant all on tables
GRANT ALL ON ALL TABLES IN SCHEMA poc_tracker TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA poc_tracker TO admin;

-- For read-only BI users (create this role if needed)
-- CREATE ROLE bi_readonly;
-- GRANT USAGE ON SCHEMA poc_tracker TO bi_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA poc_tracker TO bi_readonly;
