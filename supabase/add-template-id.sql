-- Add template_id column to clips table
-- This links a clip to a Quick Drop Template (e.g. "first_wave_intro")
-- so the crew card can show template instructions, sample lines, and time estimates.

alter table public.clips
  add column if not exists template_id text;

-- Recreate the clips_with_meta view to include the new column.
-- Must DROP first because CREATE OR REPLACE VIEW cannot change the column
-- list (adding template_id via c.* shifts the existing columns).
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

-- Restore default permissions on the recreated view
grant select on public.clips_with_meta to authenticated;
