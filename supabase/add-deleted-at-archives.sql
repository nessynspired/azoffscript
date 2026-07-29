-- Archive tables + triggers for deleted clips, assignments, and trends
-- This prevents data loss from accidental UI deletions by backing up
-- the full row before it's permanently deleted.

-- ===========================================================================
-- Archive tables
-- ===========================================================================
create table if not exists public.deleted_clips (
  id            uuid primary key,
  data          jsonb not null,
  deleted_by    uuid references public.members(id) on delete set null,
  deleted_at    timestamptz not null default now()
);

comment on table public.deleted_clips is 'Archive of clips deleted through the UI; allows restore if needed';

-- RLS for deleted_clips: admins can read/restore; no one else should see them
alter table public.deleted_clips enable row level security;

drop policy if exists deleted_clips_read_admin on public.deleted_clips;
create policy deleted_clips_read_admin on public.deleted_clips
  for select to authenticated using (public.is_admin());

drop policy if exists deleted_clips_insert_trigger on public.deleted_clips;
create policy deleted_clips_insert_trigger on public.deleted_clips
  for insert to authenticated with check (true);

drop policy if exists deleted_clips_delete_admin on public.deleted_clips;
create policy deleted_clips_delete_admin on public.deleted_clips
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------

create table if not exists public.deleted_content_assignments (
  id            uuid primary key,
  data          jsonb not null,
  deleted_by    uuid references public.members(id) on delete set null,
  deleted_at    timestamptz not null default now()
);

comment on table public.deleted_content_assignments is 'Archive of content_assignments deleted through the UI';

alter table public.deleted_content_assignments enable row level security;

drop policy if exists deleted_asgn_read_admin on public.deleted_content_assignments;
create policy deleted_asgn_read_admin on public.deleted_content_assignments
  for select to authenticated using (public.is_admin());

drop policy if exists deleted_asgn_insert_trigger on public.deleted_content_assignments;
create policy deleted_asgn_insert_trigger on public.deleted_content_assignments
  for insert to authenticated with check (true);

drop policy if exists deleted_asgn_delete_admin on public.deleted_content_assignments;
create policy deleted_asgn_delete_admin on public.deleted_content_assignments
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------

create table if not exists public.deleted_trend_references (
  id            uuid primary key,
  data          jsonb not null,
  deleted_by    uuid references public.members(id) on delete set null,
  deleted_at    timestamptz not null default now()
);

comment on table public.deleted_trend_references is 'Archive of trend_references deleted through the UI';

alter table public.deleted_trend_references enable row level security;

drop policy if exists deleted_trends_read_admin on public.deleted_trend_references;
create policy deleted_trends_read_admin on public.deleted_trend_references
  for select to authenticated using (public.is_admin());

drop policy if exists deleted_trends_insert_trigger on public.deleted_trend_references;
create policy deleted_trends_insert_trigger on public.deleted_trend_references
  for insert to authenticated with check (true);

drop policy if exists deleted_trends_delete_admin on public.deleted_trend_references;
create policy deleted_trends_delete_admin on public.deleted_trend_references
  for delete to authenticated using (public.is_admin());

-- ===========================================================================
-- Trigger functions that archive rows before deletion
-- ===========================================================================
create or replace function public.archive_deleted_clip()
returns trigger as $$
begin
  insert into public.deleted_clips (id, data, deleted_by)
  values (old.id, to_jsonb(old), public.current_member_id());
  return old;
end;
$$ language plpgsql security definer;

create or replace function public.archive_deleted_assignment()
returns trigger as $$
begin
  insert into public.deleted_content_assignments (id, data, deleted_by)
  values (old.id, to_jsonb(old), public.current_member_id());
  return old;
end;
$$ language plpgsql security definer;

create or replace function public.archive_deleted_trend()
returns trigger as $$
begin
  insert into public.deleted_trend_references (id, data, deleted_by)
  values (old.id, to_jsonb(old), public.current_member_id());
  return old;
end;
$$ language plpgsql security definer;

-- ===========================================================================
-- Triggers
-- ===========================================================================
drop trigger if exists trg_archive_deleted_clip on public.clips;
create trigger trg_archive_deleted_clip
  before delete on public.clips
  for each row execute function public.archive_deleted_clip();

drop trigger if exists trg_archive_deleted_assignment on public.content_assignments;
create trigger trg_archive_deleted_assignment
  before delete on public.content_assignments
  for each row execute function public.archive_deleted_assignment();

drop trigger if exists trg_archive_deleted_trend on public.trend_references;
create trigger trg_archive_deleted_trend
  before delete on public.trend_references
  for each row execute function public.archive_deleted_trend();
