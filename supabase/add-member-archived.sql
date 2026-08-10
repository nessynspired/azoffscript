-- Add `archived` flag to members so admins can deactivate a crew member
-- without deleting them. Archived members keep their signed agreements,
-- clips, approvals, comments, and assignments on file — they just stop
-- showing up in the active crew list, public site, and assignment dropdowns.
-- Their clips, assignments, approvals, ideas, gear, and activity entries
-- are also hidden from active portal views (via view + app-level filtering).
--
-- Run this in the Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS).

-- 1. Add the archived column (defaults to false = active)
alter table public.members
  add column if not exists archived boolean not null default false;

alter table public.members
  add column if not exists archived_at timestamptz;

comment on column public.members.archived is
  'When true, this crew member is deactivated (hidden from active lists, public site, and assignment dropdowns) but their agreements + content stay on file. Admins can restore.';

comment on column public.members.archived_at is
  'Timestamp of when the member was archived (null = active).';

-- 2. Update the public read policy so archived members never show on the
--    public site (even if public_visible was true before archiving).
--    Authenticated crew can still see archived members (so admins can
--    manage + restore them), but the app filters them out of active views.
drop policy if exists members_read on public.members;
create policy members_read on public.members
  for select using (
    -- public visitors only see non-archived, public_visible profiles
    (public_visible = true and archived = false)
    -- any authenticated crew member can read all rows (active + archived)
    or auth.role() = 'authenticated'
  );

-- 3. Recreate the clips_with_meta view to exclude archived members' data:
--    - Clips submitted by archived members are excluded entirely
--    - people_count excludes archived members from clip_people
--    - approval counts exclude archived members' approvals
--    This automatically filters clips in run-sheet, lobby, ready, watch, my-kit.
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
  from public.clip_people
  where member_id not in (select id from public.members where archived = true)
  group by clip_id
) cp on cp.clip_id = c.id
left join (
  select clip_id,
    count(*) as approvals_total,
    count(*) filter (where status in ('Approved','Approved With Edits')) as approvals_approved,
    count(*) filter (where status = 'Waiting') as approvals_waiting,
    count(*) filter (where status in ('Do Not Post','No Tag')) as approvals_blocked
  from public.approvals
  where member_id not in (select id from public.members where archived = true)
  group by clip_id
) a on a.clip_id = c.id
where c.submitted_by not in (select id from public.members where archived = true);

grant select on public.clips_with_meta to authenticated;

