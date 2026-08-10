-- Add `archived` flag to members so admins can deactivate a crew member
-- without deleting them. Archived members keep their signed agreements,
-- clips, approvals, comments, and assignments on file — they just stop
-- showing up in the active crew list, public site, and assignment dropdowns.
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
