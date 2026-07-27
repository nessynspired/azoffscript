-- Add planned_clip_id column to clips table
-- This lets crew connect their dropped clips/links to a planned calendar item
-- so admins can see which drop belongs to which planned content piece.

ALTER TABLE clips
ADD COLUMN IF NOT EXISTS planned_clip_id UUID REFERENCES clips(id) ON DELETE SET NULL;

-- Update the clips_with_meta view to include the new column
CREATE OR REPLACE VIEW clips_with_meta AS
SELECT
  c.*,
  (SELECT COUNT(*) FROM clip_people WHERE clip_id = c.id) AS people_count,
  (SELECT COUNT(*) FROM approvals WHERE clip_id = c.id) AS approvals_total,
  (SELECT COUNT(*) FROM approvals WHERE clip_id = c.id AND status = 'Approved') AS approvals_approved,
  (SELECT COUNT(*) FROM approvals WHERE clip_id = c.id AND status = 'Waiting') AS approvals_waiting,
  (SELECT COUNT(*) FROM approvals WHERE clip_id = c.id AND status = 'Rejected') AS approvals_blocked
FROM clips c;
