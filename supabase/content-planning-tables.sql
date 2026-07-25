-- ==========================================================================
-- Content Planning Hub: themes, trend references, theme_id on clips
-- Run this in the Supabase Dashboard → SQL Editor.
-- Idempotent: safe to re-run.
-- ==========================================================================

-- ==========================================================================
-- content_themes: Weekly Heat / Series
-- ==========================================================================
create table if not exists public.content_themes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  start_date  date,
  end_date    date,
  color       text default 'copper-clay',
  status      text not null default 'Planning',  -- Planning, Active, Wrapped
  created_by  uuid references public.members(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_themes_status on public.content_themes(status);
create index if not exists idx_themes_dates on public.content_themes(start_date, end_date);

-- ==========================================================================
-- trend_references: Trend Drops — links/inspiration the crew is following
-- ==========================================================================
create table if not exists public.trend_references (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  url           text not null,
  platform      public.platform default 'tiktok',
  submitted_by  uuid not null references public.members(id) on delete cascade,
  submitted_by_name text not null,
  notes         text,
  theme_id      uuid references public.content_themes(id) on delete set null,
  status        text not null default 'New',  -- New, Watching, Assigned, Used, Passed
  created_at    timestamptz not null default now()
);

create index if not exists idx_trends_status on public.trend_references(status);
create index if not exists idx_trends_theme on public.trend_references(theme_id);

-- ==========================================================================
-- Add theme_id to clips so planned posts can be linked to a Weekly Heat
-- ==========================================================================
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'clips'
                   and column_name = 'theme_id') then
    alter table public.clips add column theme_id uuid references public.content_themes(id) on delete set null;
  end if;
end $$;

-- ==========================================================================
-- Row Level Security
-- ==========================================================================

alter table public.content_themes enable row level security;
alter table public.trend_references enable row level security;

-- content_themes: all authenticated can read; admin + planners can write
drop policy if exists themes_read on public.content_themes;
create policy themes_read on public.content_themes
  for select to authenticated using (true);

drop policy if exists themes_insert on public.content_themes;
create policy themes_insert on public.content_themes
  for insert to authenticated with check (
    public.is_admin()
    or exists (select 1 from public.members m where m.user_id = auth.uid() and m.can_plan_content = true)
  );

drop policy if exists themes_update on public.content_themes;
create policy themes_update on public.content_themes
  for update to authenticated using (
    public.is_admin()
    or exists (select 1 from public.members m where m.user_id = auth.uid() and m.can_plan_content = true)
  );

drop policy if exists themes_delete on public.content_themes;
create policy themes_delete on public.content_themes
  for delete to authenticated using (public.is_admin());

-- trend_references: all authenticated can read; all authenticated can insert; submitter/admin/planner can update/delete
drop policy if exists trends_read on public.trend_references;
create policy trends_read on public.trend_references
  for select to authenticated using (true);

drop policy if exists trends_insert on public.trend_references;
create policy trends_insert on public.trend_references
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists trends_update on public.trend_references;
create policy trends_update on public.trend_references
  for update to authenticated using (
    public.is_admin()
    or submitted_by = public.current_member_id()
    or exists (select 1 from public.members m where m.user_id = auth.uid() and m.can_plan_content = true)
  );

drop policy if exists trends_delete on public.trend_references;
create policy trends_delete on public.trend_references
  for delete to authenticated using (
    public.is_admin()
    or submitted_by = public.current_member_id()
  );

-- Allow planners to update theme_id on clips (in addition to existing policies)
-- The clips_update_planners policy from allow-crew-deadlines.sql already covers this.

-- ==========================================================================
-- Recreate clips_with_meta view to include theme_id
-- ==========================================================================
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

grant select on public.clips_with_meta to authenticated;
