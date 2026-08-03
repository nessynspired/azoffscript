-- COMBINED MIGRATION — run this once in the Supabase SQL Editor
-- This applies all pending database changes at once.
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS).

-- 1. Add production_notes column (for storing multiple file paths + library items)
ALTER TABLE clips
ADD COLUMN IF NOT EXISTS production_notes JSONB DEFAULT '{}'::jsonb;

-- 2. Add drop_purpose column (separates raw footage from content clips)
ALTER TABLE clips
ADD COLUMN IF NOT EXISTS drop_purpose text NOT NULL DEFAULT 'content';

-- 3. Fix RLS policy on agreement_signatures
--    The old policy checked member_id = auth.uid(), but member_id is the
--    members.id UUID, NOT the auth user ID. This caused signature reads to
--    fail, leading to duplicate key errors on re-sign.
drop policy if exists sig_read_own on public.agreement_signatures;
create policy sig_read_own on public.agreement_signatures
  for select to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists sig_insert_own on public.agreement_signatures;
create policy sig_insert_own on public.agreement_signatures
  for insert to authenticated
  with check (
    member_id in (select id from public.members where user_id = auth.uid())
  );

drop policy if exists sig_admin_update on public.agreement_signatures;
create policy sig_admin_update on public.agreement_signatures
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4. Recreate the clips_with_meta view to include the new columns
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

-- Done! All features should work now:
-- - Multiple file uploads (production_notes column)
-- - Raw footage vs content clips (drop_purpose column)
-- - Agreement signing (fixed RLS policy)
