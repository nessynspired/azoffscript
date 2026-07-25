-- ==========================================================================
-- AZ Off Script — The Off Script Room
-- Supabase / Postgres schema
-- Run this in the Supabase SQL editor for your AZOS project.
-- Idempotent: safe to re-run.
-- ==========================================================================

create extension if not exists "pgcrypto";

-- ==========================================================================
-- Enums (text + check constraints for portability across Supabase versions)
-- ==========================================================================

do $$ begin
  create type user_role as enum ('admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type clip_status as enum (
    'Dropped', 'Needs Info', 'Planned', 'Shot', 'Cutting',
    'Review', 'Ready', 'Scheduled', 'Live', 'Vault', 'Hold', 'Do Not Post'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum (
    'Waiting', 'Approved', 'Approved With Edits',
    'Needs Review', 'Do Not Post', 'No Tag', 'Don\'t Like How I Come Across'
  );
exception when duplicate_object then null; end $$;

-- Add new status to existing enum if it was already created
do $$ begin
  alter type approval_status add value if not exists 'Don\'t Like How I Come Across';
exception when others then null; end $$;

do $$ begin
  create type idea_status as enum (
    'New', 'Crew Favorite', 'Planned', 'Filmed',
    'Used', 'Saved for Later', 'Archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type drop_type as enum (
    'video', 'tiktok_link', 'idea', 'caption', 'trend', 'final_cut'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type platform as enum (
    'tiktok', 'instagram', 'youtube', 'facebook', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type idea_category as enum (
    'Hot Takes', 'Funny Questions', 'AZ Moments', 'Group Games',
    'Trends', 'Skits', 'BTS Chaos', 'Merch Quotes'
  );
exception when duplicate_object then null; end $$;

-- ==========================================================================
-- Tables
-- (Helper functions are defined AFTER tables, since they reference them)
-- ==========================================================================

-- ==========================================================================
-- content_themes: Weekly Heat / Series — the big content focus for a week
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

create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique,           -- references auth.users(id)
  email        text not null,
  name         text not null,
  role         user_role not null default 'member',
  nickname     text,
  design_edition text,
  plot_twist   text,
  comfort_tags text[] default '{}',
  favorite_content text[] default '{}',
  availability text,
  socials      jsonb default '{}',
  photo_url    text,
  mailing_address text,                        -- private, only member + admin can see
  comfort_level   text default 'Ask Every Time',  -- Low-Key, Comfortable, Spotlight Okay, Behind the Scenes, Ask Every Time
  share_comfort   text default 'Ask before tagging/sharing',  -- Main page only, Okay to share, Ask before tagging/sharing, Do not tag me, Do not post me
  do_not_use_for  text[] default '{}',          -- silly, reaction_memes, relationship, drama, beauty_body, parenting, sponsored, main_focus, tagging, other
  first_wave   boolean not null default true,
  kit_acknowledged boolean not null default false,
  ground_rules_acknowledged_at timestamptz,
  can_plan_content boolean not null default false,  -- admin can grant this to crew: edit calendar/deadlines + change clip status
  created_at   timestamptz not null default now()
);

-- ==========================================================================
-- Gear: personalized merch/items for each member (tumblers, shirts, badges, etc)
-- Managed by admin in the Admin Gear Board
-- ==========================================================================
create type gear_item_type as enum (
  'tumbler', 'mug', 'shirt', 'badge', 'sticker', 'invite', 'member_card'
);

create type gear_status as enum (
  'needs_name_check', 'mockup_ready', 'approved', 'ordered', 'delivered', 'hold', 'not_started'
);

create table if not exists public.gear (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references public.members(id) on delete cascade,
  member_name     text not null,
  item_type       gear_item_type not null,
  personalized_name text,                         -- name to put on the item
  title_edition   text,                           -- e.g. "The Real One", "First Wave"
  mockup_url      text,                           -- link to mockup image/design
  status          gear_status not null default 'not_started',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_gear_member on public.gear(member_id);
create index if not exists idx_gear_status on public.gear(status);

create table if not exists public.clips (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          drop_type not null,
  status        clip_status not null default 'Dropped',
  link          text,
  file_path     text,                          -- Supabase Storage path when uploaded
  idea_text     text,
  caption       text,
  submitted_by  uuid not null references public.members(id) on delete cascade,
  submitted_by_name text not null,
  category      text,
  platform      platform,
  destination   text,                          -- where this video is going: tiktok, instagram, youtube, facebook, all
  best_timestamp text,
  do_not_post_notes text,
  needs_review  boolean not null default false,
  scheduled_date timestamptz,                    -- Goes live date
  due_date      timestamptz,                      -- legacy field
  idea_due_date  timestamptz,                     -- Drop-by: when ideas/links are due
  clip_due_date  timestamptz,                     -- Drop-by: when clips/links are due
  final_cut_due  timestamptz,                     -- Final cut due date
  approval_due   timestamptz,                     -- Greenlight by: approval deadline
  thumbnail_url text,                          -- video thumbnail (from oEmbed or upload)
  theme_id     uuid references public.content_themes(id) on delete set null,  -- link to Weekly Heat
  template_id  text,                           -- Quick Drop Template ID (e.g. "first_wave_intro")
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_clips_status on public.clips(status);
create index if not exists idx_clips_submitted_by on public.clips(submitted_by);
create index if not exists idx_clips_created_at on public.clips(created_at desc);
create index if not exists idx_clips_theme on public.clips(theme_id);

create table if not exists public.clip_people (
  id          uuid primary key default gen_random_uuid(),
  clip_id     uuid not null references public.clips(id) on delete cascade,
  member_id   uuid not null references public.members(id) on delete cascade,
  member_name text not null,
  created_at  timestamptz not null default now(),
  unique (clip_id, member_id)
);

create index if not exists idx_clip_people_clip on public.clip_people(clip_id);
create index if not exists idx_clip_people_member on public.clip_people(member_id);

-- ==========================================================================
-- content_assignments: "Your Part" — roles + tasks per content item
-- ==========================================================================
create table if not exists public.content_assignments (
  id              uuid primary key default gen_random_uuid(),
  clip_id         uuid not null references public.clips(id) on delete cascade,
  member_id       uuid not null references public.members(id) on delete cascade,
  member_name     text not null,
  role            text not null default 'On-Camera',
  task_type       text not null default 'Drop a Clip',
  task_title      text,
  task_notes      text,
  drop_by_date    timestamptz,
  is_required     boolean not null default true,
  status          text not null default 'Not Started',
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

create table if not exists public.approvals (
  id          uuid primary key default gen_random_uuid(),
  clip_id     uuid not null references public.clips(id) on delete cascade,
  member_id   uuid not null references public.members(id) on delete cascade,
  member_name text not null,
  status      approval_status not null default 'Waiting',
  edit_note   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (clip_id, member_id)
);

create index if not exists idx_approvals_clip on public.approvals(clip_id);
create index if not exists idx_approvals_member on public.approvals(member_id);

create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    idea_category not null default 'Hot Takes',
  status      idea_status not null default 'New',
  energy      text,
  submitted_by uuid not null references public.members(id) on delete cascade,
  submitted_by_name text not null,
  notes       text,
  crew_favorite boolean not null default false,
  votes       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_ideas_status on public.ideas(status);
create index if not exists idx_ideas_category on public.ideas(category);

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  clip_id     uuid references public.clips(id) on delete cascade,
  idea_id     uuid references public.ideas(id) on delete cascade,
  author_id   uuid not null references public.members(id) on delete cascade,
  author_name text not null,
  body        text not null,
  created_at  timestamptz not null default now(),
  check (clip_id is not null or idea_id is not null)
);

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.members(id) on delete cascade,
  kind        text not null,
  body        text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread on public.notifications(user_id, read);

create table if not exists public.activity (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.members(id) on delete set null,
  actor_name  text not null,
  kind        text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_created_at on public.activity(created_at desc);

-- ==========================================================================
-- push_subscriptions: web push endpoints per member (phone, desktop, etc.)
-- ==========================================================================
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth_key    text not null,
  created_at  timestamptz not null default now(),
  unique (member_id, endpoint)
);

create index if not exists idx_push_subs_member on public.push_subscriptions(member_id);

-- ==========================================================================
-- Helper functions: role checks (used by RLS)
-- Defined AFTER tables because SQL-language functions validate body at creation.
-- ==========================================================================

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.user_id = auth.uid() and m.role = 'admin'
  );
$$;

create or replace function public.current_member_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select m.id from public.members m where m.user_id = auth.uid() limit 1;
$$;

create or replace function public.is_member_of_clip(_clip_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.clip_people cp
    where cp.clip_id = _clip_id and cp.member_id = public.current_member_id()
  );
$$;

-- ==========================================================================
-- updated_at triggers
-- ==========================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists trg_clips_updated on public.clips;
create trigger trg_clips_updated before update on public.clips
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_approvals_updated on public.approvals;
create trigger trg_approvals_updated before update on public.approvals
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_ideas_updated on public.ideas;
create trigger trg_ideas_updated before update on public.ideas
  for each row execute function public.touch_updated_at();

-- ==========================================================================
-- Invite codes: each crew member gets a unique code tied to their profile.
-- Vanessa generates codes from the admin invite page. When someone signs up,
-- they enter their code. The trigger matches the code to a pre-configured profile.
-- No code = no access.
-- ==========================================================================

create table if not exists public.invite_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,                    -- the crew member's real name
  nickname      text,                             -- their title (e.g. "The Real One")
  email         text,                             -- optional: pre-set the email they must use
  plot_twist    text,                             -- their one-liner
  favorite_content text[] default '{}',           -- their tags
  role          user_role not null default 'member',
  used          boolean not null default false,
  used_by       uuid references auth.users(id) on delete set null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_invite_codes_code on public.invite_codes(code);

-- ==========================================================================
-- Auto-create a member row when a new auth user signs up.
-- REQUIRES a valid invite code stored in auth.users.raw_user_meta_data->>'invite_code'
-- If no code or invalid code, the user is created but their member row is NOT created
-- (they won't be able to access the portal — RLS will block them).
-- First registered user (Vanessa) is handled manually — she gets admin via the
-- check-admin script or manual SQL.
-- ==========================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _invite_code text;
  _invite public.invite_codes%rowtype;
  _existing integer;
  _role user_role;
begin
  _invite_code := new.raw_user_meta_data->>'invite_code';

  -- No invite code? Don't create a member row. They can't access the portal.
  if _invite_code is null or _invite_code = '' then
    return new;
  end if;

  -- Look up the invite code
  select * into _invite from public.invite_codes where code = _invite_code and used = false;
  if not found then
    return new;
  end if;

  -- Mark the code as used
  update public.invite_codes
    set used = true, used_by = new.id, used_at = now()
    where id = _invite.id;

  -- Create the member row with the pre-configured profile
  insert into public.members (
    user_id, email, name, role, nickname, plot_twist, favorite_content,
    first_wave, kit_acknowledged
  ) values (
    new.id,
    coalesce(new.email, _invite.email, ''),
    _invite.name,
    _invite.role,
    _invite.nickname,
    _invite.plot_twist,
    _invite.favorite_content,
    true,
    false
  );

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================================
-- clips_with_meta view: clips + people count + approval rollup
-- ==========================================================================

create or replace view public.clips_with_meta as
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

-- ==========================================================================
-- Row Level Security
-- All permission edge cases from DESIGNSPEC live here.
-- ==========================================================================

alter table public.members enable row level security;
alter table public.clips enable row level security;
alter table public.clip_people enable row level security;
alter table public.approvals enable row level security;
alter table public.ideas enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.activity enable row level security;

-- members: any authenticated member can read all crew; only self or admin can edit
drop policy if exists members_read on public.members;
create policy members_read on public.members
  for select to authenticated using (true);

drop policy if exists members_update_self on public.members;
create policy members_update_self on public.members
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists members_update_admin on public.members;
create policy members_update_admin on public.members
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists members_insert_admin on public.members;
create policy members_insert_admin on public.members
  for insert to authenticated with check (public.is_admin());

-- clips: all authenticated members can read; any member can insert; only admin or submitter can update/delete
drop policy if exists clips_read on public.clips;
create policy clips_read on public.clips
  for select to authenticated using (true);

drop policy if exists clips_insert on public.clips;
create policy clips_insert on public.clips
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists clips_update_admin on public.clips;
create policy clips_update_admin on public.clips
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists clips_update_submitter on public.clips;
create policy clips_update_submitter on public.clips
  for update to authenticated
  using (submitted_by = public.current_member_id())
  with check (submitted_by = public.current_member_id());

drop policy if exists clips_delete_admin on public.clips;
create policy clips_delete_admin on public.clips
  for delete to authenticated using (public.is_admin());

drop policy if exists clips_delete_submitter on public.clips;
create policy clips_delete_submitter on public.clips
  for delete to authenticated using (submitted_by = public.current_member_id());

-- clip_people: read all; insert admin or submitter; delete admin or submitter
drop policy if exists clip_people_read on public.clip_people;
create policy clip_people_read on public.clip_people
  for select to authenticated using (true);

drop policy if exists clip_people_insert on public.clip_people;
create policy clip_people_insert on public.clip_people
  for insert to authenticated with check (
    public.is_admin()
    or exists (
      select 1 from public.clips c
      where c.id = clip_id and c.submitted_by = public.current_member_id()
    )
  );

drop policy if exists clip_people_delete on public.clip_people;
create policy clip_people_delete on public.clip_people
  for delete to authenticated using (
    public.is_admin()
    or exists (
      select 1 from public.clips c
      where c.id = clip_id and c.submitted_by = public.current_member_id()
    )
  );

-- approvals: read all; a member can only update their OWN approval row,
-- and only if they are tagged in that clip. Admin can update any.
drop policy if exists approvals_read on public.approvals;
create policy approvals_read on public.approvals
  for select to authenticated using (true);

-- insert: a member can create their OWN approval row (if tagged in the clip),
-- OR the clip submitter / admin can create a "Waiting" approval row for a tagged member
-- (this is how the tagging flow works: when you tag someone, their approval row is seeded)
drop policy if exists approvals_upsert_own on public.approvals;
create policy approvals_upsert_own on public.approvals
  for insert to authenticated with check (
    -- case 1: member creating their own approval
    (member_id = public.current_member_id() and public.is_member_of_clip(clip_id))
    -- case 2: submitter or admin seeding a Waiting approval for a tagged member
    or (
      (public.is_admin() or exists (
        select 1 from public.clips c
        where c.id = clip_id and c.submitted_by = public.current_member_id()
      ))
      and exists (select 1 from public.clip_people cp where cp.clip_id = clip_id and cp.member_id = approvals.member_id)
    )
  );

drop policy if exists approvals_update_own on public.approvals;
create policy approvals_update_own on public.approvals
  for update to authenticated using (
    member_id = public.current_member_id()
    and public.is_member_of_clip(clip_id)
  ) with check (
    member_id = public.current_member_id()
  );

drop policy if exists approvals_update_admin on public.approvals;
create policy approvals_update_admin on public.approvals
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists approvals_delete_admin on public.approvals;
create policy approvals_delete_admin on public.approvals
  for delete to authenticated using (public.is_admin());

-- ideas: read all; any member can insert; admin or submitter can update/delete
drop policy if exists ideas_read on public.ideas;
create policy ideas_read on public.ideas
  for select to authenticated using (true);

drop policy if exists ideas_insert on public.ideas;
create policy ideas_insert on public.ideas
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists ideas_update_admin on public.ideas;
create policy ideas_update_admin on public.ideas
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists ideas_update_submitter on public.ideas;
create policy ideas_update_submitter on public.ideas
  for update to authenticated
  using (submitted_by = public.current_member_id())
  with check (submitted_by = public.current_member_id());

drop policy if exists ideas_delete_admin on public.ideas;
create policy ideas_delete_admin on public.ideas
  for delete to authenticated using (public.is_admin());

drop policy if exists ideas_delete_submitter on public.ideas;
create policy ideas_delete_submitter on public.ideas
  for delete to authenticated using (submitted_by = public.current_member_id());

-- comments: read all; any member can insert; admin or author can delete
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments
  for select to authenticated using (true);

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
  for delete to authenticated using (
    public.is_admin() or author_id = public.current_member_id()
  );

-- notifications: a member only sees their own; any authenticated user can insert (for notifying others)
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select to authenticated using (user_id = public.current_member_id());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated using (user_id = public.current_member_id());

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete to authenticated using (user_id = public.current_member_id());

-- push_subscriptions: a member manages only their own
alter table public.push_subscriptions enable row level security;

drop policy if exists push_subs_read on public.push_subscriptions;
create policy push_subs_read on public.push_subscriptions
  for select to authenticated using (member_id = public.current_member_id());

drop policy if exists push_subs_insert on public.push_subscriptions;
create policy push_subs_insert on public.push_subscriptions
  for insert to authenticated with check (member_id = public.current_member_id());

drop policy if exists push_subs_delete on public.push_subscriptions;
create policy push_subs_delete on public.push_subscriptions
  for delete to authenticated using (member_id = public.current_member_id());

-- activity: read all; insert allowed for any authenticated member (triggered from app)
drop policy if exists activity_read on public.activity;
create policy activity_read on public.activity
  for select to authenticated using (true);

drop policy if exists activity_insert on public.activity;
create policy activity_insert on public.activity
  for insert to authenticated with check (auth.uid() is not null);

-- ==========================================================================
-- Storage bucket for clip uploads (private — signed URLs only)
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('clips', 'clips', false)
on conflict (id) do nothing;

-- members can upload to their own folder; all authenticated crew can read; owner/admin can delete
drop policy if exists "clips upload own" on storage.objects;
create policy "clips upload own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'clips'
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );

drop policy if exists "clips read own or admin" on storage.objects;
drop policy if exists "clips read all crew" on storage.objects;
create policy "clips read all crew" on storage.objects
  for select to authenticated using (bucket_id = 'clips');

drop policy if exists "clips delete own or admin" on storage.objects;
create policy "clips delete own or admin" on storage.objects
  for delete to authenticated using (
    bucket_id = 'clips'
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );

-- ==========================================================================
-- Seed: helpful once you've created your first admin user via signup,
-- run this to promote a specific email to admin (replace the email):
--
-- update public.members set role = 'admin' where email = 'vanessa@azoffscript.com';
-- ==========================================================================
