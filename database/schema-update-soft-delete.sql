-- Add soft delete support
ALTER TABLE poc_tracker.poc_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE poc_tracker.poc_requests ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255) DEFAULT NULL;

-- Create index for filtering non-deleted records
CREATE INDEX IF NOT EXISTS idx_poc_requests_deleted_at ON poc_tracker.poc_requests(deleted_at);
