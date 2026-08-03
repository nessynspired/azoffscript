-- Add drop_purpose column to clips table
-- This separates "raw_footage" (videos the crew records for Vanessa to stitch/edit)
-- from "content" (planned content pipeline clips with recipes, assignments, deadlines).
--
-- Raw footage drops are NOT part of the production pipeline — they go to a separate
-- "Raw Footage" area where all crew can see each other's drops for stitching.
-- Content clips go through the normal pipeline: Dropped -> Planned -> Shot -> etc.

ALTER TABLE clips
ADD COLUMN IF NOT EXISTS drop_purpose text NOT NULL DEFAULT 'content';

-- Backfill: any existing video drop that is NOT connected to a planned clip
-- and has no recipe is likely raw footage. But to be safe, we leave existing
-- clips as 'content' so nothing disappears from the pipeline unexpectedly.
-- Admins can reclassify individual clips if needed.

-- Recreate the clips_with_meta view to include the new column.
drop view if exists public.clips_with_meta cascade;

create view public.clips_with_meta as
select
  c.*,
  coalesce(cp.people_count, 0) as people_count,
  coalesce(a.approvals_total, 0) as approvals_total,
  coalesce(a.approvals_approved, 0) as approvals_approved,
  coalesce(a.approvals_waiting, 0) as approvals_waiting,
  coalesce(a.approvals_blocked, 0) as approvals_blocked
from public.clips c
left join (
  select clip_id, count(*) as people_count
  from public.clip_people group by clip_id
) cp on cp.clip_id = c.id
left join (
  select clip_id,
    count(*) as approvals_total,
    count(*) filter (where status in ('Approved','Approved With Edits')) as approvals_approved,
    count(*) filter (where status = 'Waiting') as approvals_waiting,
    count(*) filter (where status in ('Do Not Post','No Tag')) as approvals_blocked
  from public.approvals group by clip_id
) a on a.clip_id = c.id;

grant select on public.clips_with_meta to authenticated;
