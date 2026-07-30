-- Add production_notes JSONB column to clips table
-- This stores selected library items (hooks, prompts, captions, transitions,
-- recording styles, shot recipes) that planners attach to a scheduled clip.
--
-- Structure stored in production_notes:
-- {
--   "hooks": ["h_cu_01", "h_de_03"],
--   "prompts": ["gp_w_01", "gp_d_02"],
--   "captions": ["cf_01"],
--   "transitions": ["t_obj_01"],
--   "recordingStyle": "rs_direct",
--   "shotRecipe": "sr_01",
--   "notes": "Additional production notes text"
-- }

ALTER TABLE clips
ADD COLUMN IF NOT EXISTS production_notes JSONB DEFAULT '{}'::jsonb;

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
