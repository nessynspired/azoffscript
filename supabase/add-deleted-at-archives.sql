-- Archive tables + triggers for ALL deletable tables in the database
-- This prevents data loss from accidental UI deletions by backing up
-- the full row before it's permanently deleted.
--
-- Covers: clips, content_assignments, trend_references, clip_people,
-- approvals, comments, ideas, gear, assignment_comments,
-- content_themes, approved_public_profile, profile_change_requests,
-- quick_terms_acceptances, revenue_events, invite_codes, join_submissions
--
-- Also creates a deleted_files log for storage uploads (videos, photos)
-- that get deleted through the UI.

-- ===========================================================================
-- Generic archive table — one table for all archived rows
-- ===========================================================================
create table if not exists public.deleted_rows (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,
  row_id        text not null,
  data          jsonb not null,
  deleted_by    uuid references public.members(id) on delete set null,
  deleted_at    timestamptz not null default now()
);

comment on table public.deleted_rows is 'Archive of any row deleted through the UI; allows restore if needed';

create index if not exists idx_deleted_rows_table on public.deleted_rows(table_name);
create index if not exists idx_deleted_rows_row_id on public.deleted_rows(row_id);
create index if not exists idx_deleted_rows_deleted_at on public.deleted_rows(deleted_at desc);

alter table public.deleted_rows enable row level security;

drop policy if exists deleted_rows_read_admin on public.deleted_rows;
create policy deleted_rows_read_admin on public.deleted_rows
  for select to authenticated using (public.is_admin());

drop policy if exists deleted_rows_insert on public.deleted_rows;
create policy deleted_rows_insert on public.deleted_rows
  for insert to authenticated with check (true);

drop policy if exists deleted_rows_delete_admin on public.deleted_rows;
create policy deleted_rows_delete_admin on public.deleted_rows
  for delete to authenticated using (public.is_admin());

-- ===========================================================================
-- Deleted files log — tracks storage files that were removed
-- ===========================================================================
create table if not exists public.deleted_files (
  id            uuid primary key default gen_random_uuid(),
  bucket_id     text not null,
  file_path     text not null,
  file_url      text,
  file_size     bigint,
  mime_type     text,
  deleted_by    uuid references public.members(id) on delete set null,
  deleted_at    timestamptz not null default now()
);

comment on table public.deleted_files is 'Log of storage files (videos, photos) deleted through the UI';

create index if not exists idx_deleted_files_bucket on public.deleted_files(bucket_id);
create index if not exists idx_deleted_files_deleted_at on public.deleted_files(deleted_at desc);

alter table public.deleted_files enable row level security;

drop policy if exists deleted_files_read_admin on public.deleted_files;
create policy deleted_files_read_admin on public.deleted_files
  for select to authenticated using (public.is_admin());

drop policy if exists deleted_files_insert on public.deleted_files;
create policy deleted_files_insert on public.deleted_files
  for insert to authenticated with check (true);

drop policy if exists deleted_files_delete_admin on public.deleted_files;
create policy deleted_files_delete_admin on public.deleted_files
  for delete to authenticated using (public.is_admin());

-- ===========================================================================
-- Generic archive function — works for any table
-- ===========================================================================
create or replace function public.archive_deleted_row()
returns trigger as $$
begin
  insert into public.deleted_rows (table_name, row_id, data, deleted_by)
  values (
    TG_TABLE_NAME,
    (old.id)::text,
    to_jsonb(old),
    public.current_member_id()
  );
  return old;
end;
$$ language plpgsql security definer;

-- ===========================================================================
-- Triggers for ALL deletable tables
-- ===========================================================================

-- Clips
drop trigger if exists trg_archive_clips on public.clips;
create trigger trg_archive_clips
  before delete on public.clips
  for each row execute function public.archive_deleted_row();

-- Content assignments
drop trigger if exists trg_archive_content_assignments on public.content_assignments;
create trigger trg_archive_content_assignments
  before delete on public.content_assignments
  for each row execute function public.archive_deleted_row();

-- Trend references
drop trigger if exists trg_archive_trend_references on public.trend_references;
create trigger trg_archive_trend_references
  before delete on public.trend_references
  for each row execute function public.archive_deleted_row();

-- Clip people
drop trigger if exists trg_archive_clip_people on public.clip_people;
create trigger trg_archive_clip_people
  before delete on public.clip_people
  for each row execute function public.archive_deleted_row();

-- Approvals
drop trigger if exists trg_archive_approvals on public.approvals;
create trigger trg_archive_approvals
  before delete on public.approvals
  for each row execute function public.archive_deleted_row();

-- Comments
drop trigger if exists trg_archive_comments on public.comments;
create trigger trg_archive_comments
  before delete on public.comments
  for each row execute function public.archive_deleted_row();

-- Ideas
drop trigger if exists trg_archive_ideas on public.ideas;
create trigger trg_archive_ideas
  before delete on public.ideas
  for each row execute function public.archive_deleted_row();

-- Gear
drop trigger if exists trg_archive_gear on public.gear;
create trigger trg_archive_gear
  before delete on public.gear
  for each row execute function public.archive_deleted_row();

-- Assignment comments
drop trigger if exists trg_archive_assignment_comments on public.assignment_comments;
create trigger trg_archive_assignment_comments
  before delete on public.assignment_comments
  for each row execute function public.archive_deleted_row();

-- Content themes
drop trigger if exists trg_archive_content_themes on public.content_themes;
create trigger trg_archive_content_themes
  before delete on public.content_themes
  for each row execute function public.archive_deleted_row();

-- Approved public profiles
drop trigger if exists trg_archive_approved_public_profile on public.approved_public_profile;
create trigger trg_archive_approved_public_profile
  before delete on public.approved_public_profile
  for each row execute function public.archive_deleted_row();

-- Profile change requests
drop trigger if exists trg_archive_profile_change_requests on public.profile_change_requests;
create trigger trg_archive_profile_change_requests
  before delete on public.profile_change_requests
  for each row execute function public.archive_deleted_row();

-- Quick terms acceptances
drop trigger if exists trg_archive_quick_terms_acceptances on public.quick_terms_acceptances;
create trigger trg_archive_quick_terms_acceptances
  before delete on public.quick_terms_acceptances
  for each row execute function public.archive_deleted_row();

-- Revenue events
drop trigger if exists trg_archive_revenue_events on public.revenue_events;
create trigger trg_archive_revenue_events
  before delete on public.revenue_events
  for each row execute function public.archive_deleted_row();

-- Invite codes
drop trigger if exists trg_archive_invite_codes on public.invite_codes;
create trigger trg_archive_invite_codes
  before delete on public.invite_codes
  for each row execute function public.archive_deleted_row();

-- Join submissions
drop trigger if exists trg_archive_join_submissions on public.join_submissions;
create trigger trg_archive_join_submissions
  before delete on public.join_submissions
  for each row execute function public.archive_deleted_row();

-- Notifications (in case bulk-deleted)
drop trigger if exists trg_archive_notifications on public.notifications;
create trigger trg_archive_notifications
  before delete on public.notifications
  for each row execute function public.archive_deleted_row();

-- Activity (in case bulk-deleted)
drop trigger if exists trg_archive_activity on public.activity;
create trigger trg_archive_activity
  before delete on public.activity
  for each row execute function public.archive_deleted_row();

-- ===========================================================================
-- Restore function — admins can call this to restore a deleted row
-- ===========================================================================
create or replace function public.restore_deleted_row(p_archive_id uuid)
returns void as $$
declare
  rec record;
begin
  select * into rec from public.deleted_rows where id = p_archive_id;
  if not found then
    raise exception 'Archive record not found';
  end if;

  -- Use dynamic SQL to insert the row back into its original table
  execute format('insert into %I select * from jsonb_populate_record(null::%I, $1)',
    rec.table_name, rec.table_name)
  using rec.data;

  -- Remove from archive
  delete from public.deleted_rows where id = p_archive_id;
end;
$$ language plpgsql security definer;

grant execute on function public.restore_deleted_row(uuid) to authenticated;
