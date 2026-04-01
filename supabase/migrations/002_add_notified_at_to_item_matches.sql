-- ============================================================================
-- Add notified_at column to item_matches table
-- This tracks when an email notification was sent for a match
-- ============================================================================

ALTER TABLE item_matches ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Create index for querying unnotified matches
CREATE INDEX IF NOT EXISTS idx_item_matches_notified_at ON item_matches(notified_at);
