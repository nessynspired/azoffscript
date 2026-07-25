-- Create the clips_with_meta view.
-- Run this in the Supabase Dashboard → SQL Editor if the Run Sheet page
-- shows "Can't load the Run Sheet" or clips aren't appearing.
-- Uses DROP + CREATE (not CREATE OR REPLACE) because OR REPLACE cannot
-- change the column list of an existing view.

drop view if exists public.clips_with_meta;

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

-- Grant access so authenticated users can query it via the API
grant select on public.clips_with_meta to authenticated;
