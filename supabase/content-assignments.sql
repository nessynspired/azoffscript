-- ==========================================================================
-- Content Assignments: "Your Part" — roles + tasks per content item
-- Run this in the Supabase Dashboard → SQL Editor.
-- Idempotent: safe to re-run.
-- ==========================================================================

-- ==========================================================================
-- content_assignments: who's doing what for each clip
-- ==========================================================================
create table if not exists public.content_assignments (
  id              uuid primary key default gen_random_uuid(),
  clip_id         uuid not null references public.clips(id) on delete cascade,
  member_id       uuid not null references public.members(id) on delete cascade,
  member_name     text not null,
  role            text not null default 'On-Camera',  -- Lead, On-Camera, Reaction, Clip Dropper, Caption Help, Trend Finder, Editor, Reviewer, Planner, Behind the Scenes
  task_type       text not null default 'Drop a Clip',  -- Drop a Clip, Drop a Link, Answer Prompt, Suggest Caption, Greenlight Clip, Edit/Stitch, Schedule Post, Bring Prop/Gear, Show Up
  task_title      text,
  task_notes      text,
  drop_by_date    timestamptz,
  is_required     boolean not null default true,
  status          text not null default 'Not Started',  -- Not Started, In Progress, Dropped, Waiting on Vanessa, Needs Tweak, Greenlit, Done, Skipped, Hold
  completed_at    timestamptz,
  created_by      uuid references public.members(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (clip_id, member_id, task_type)
);

create index if not exists idx_assignments_clip on public.content_assignments(clip_id);
create index if not exists idx_assignments_member on public.content_assignments(member_id);
create index if not exists idx_assignments_status on public.content_assignments(status);
create index if not exists idx_assignments_drop_by on public.content_assignments(drop_by_date);

-- ==========================================================================
-- assignment_comments: notes on a specific assignment
-- ==========================================================================
create table if not exists public.assignment_comments (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references public.content_assignments(id) on delete cascade,
  member_id       uuid not null references public.members(id) on delete cascade,
  member_name     text not null,
  comment         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_assignment_comments_assignment on public.assignment_comments(assignment_id);

-- ==========================================================================
-- Row Level Security
-- ==========================================================================

alter table public.content_assignments enable row level security;
alter table public.assignment_comments enable row level security;

-- Assignments: all authenticated can read; admin + planners can insert/update/delete
drop policy if exists assignments_read on public.content_assignments;
create policy assignments_read on public.content_assignments
  for select to authenticated using (true);

drop policy if exists assignments_insert on public.content_assignments;
create policy assignments_insert on public.content_assignments
  for insert to authenticated with check (
    public.is_admin()
    or exists (select 1 from public.members m where m.user_id = auth.uid() and m.can_plan_content = true)
  );

drop policy if exists assignments_update on public.content_assignments;
create policy assignments_update on public.content_assignments
  for update to authenticated using (
    public.is_admin()
    or exists (select 1 from public.members m where m.user_id = auth.uid() and m.can_plan_content = true)
    or member_id = public.current_member_id()  -- crew can update their own assignment status
  );

drop policy if exists assignments_delete on public.content_assignments;
create policy assignments_delete on public.content_assignments
  for delete to authenticated using (
    public.is_admin()
    or exists (select 1 from public.members m where m.user_id = auth.uid() and m.can_plan_content = true)
  );

-- Comments: all authenticated can read; all authenticated can insert; author/admin can delete
drop policy if exists asgn_comments_read on public.assignment_comments;
create policy asgn_comments_read on public.assignment_comments
  for select to authenticated using (true);

drop policy if exists asgn_comments_insert on public.assignment_comments;
create policy asgn_comments_insert on public.assignment_comments
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists asgn_comments_delete on public.assignment_comments;
create policy asgn_comments_delete on public.assignment_comments
  for delete to authenticated using (
    public.is_admin()
    or member_id = public.current_member_id()
  );

-- ==========================================================================
-- Updated trigger for updated_at
-- ==========================================================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assignments_updated on public.content_assignments;
create trigger trg_assignments_updated
  before update on public.content_assignments
  for each row execute function public.touch_updated_at();
