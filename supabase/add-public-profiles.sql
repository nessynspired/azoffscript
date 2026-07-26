-- ===========================================================================
-- PUBLIC PROFILES — crew-managed, admin-approved public-facing profile data
-- ===========================================================================
-- Crew members submit profile change requests (photo, name, title, bio, etc).
-- Vanessa/Admin reviews and approves. Only approved data shows on the website,
-- portal, member cards, and email signatures.
--
-- Two tables:
--   1. approved_public_profile  — the currently approved public profile (one row per member)
--   2. profile_change_requests   — the history of submitted requests (Draft → Submitted → Approved/Rejected)
--
-- The approved_public_profile table is the SINGLE SOURCE OF TRUTH for anything
-- public-facing. The website, portal, member cards, and email signatures all
-- read from this table — never from hardcoded values.
-- ===========================================================================

do $$ begin
  create type profile_approval_status as enum ('Draft', 'Submitted', 'Needs Review', 'Approved', 'Rejected', 'Archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type photo_permission_status as enum ('Pending Upload', 'Pending Review', 'Approved for Website', 'Approved for Portal Only', 'Approved for Email Signature', 'Rejected / Needs New Photo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tag_preference as enum ('yes', 'no', 'ask_every_time');
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_visibility as enum ('public', 'portal_only', 'hidden');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- approved_public_profile — the currently approved public profile per member
-- ---------------------------------------------------------------------------
create table if not exists public.approved_public_profile (
  id                              uuid primary key default gen_random_uuid(),
  member_id                       uuid not null references public.members(id) on delete cascade,
  legal_name                      text,
  display_name                    text,
  preferred_website_name          text,
  preferred_email_signature_name  text,
  public_title                    text,
  secondary_role                  text,
  short_personality_line          text,
  website_bio                     text,
  portal_avatar_url               text,
  website_photo_url               text,
  email_signature_photo_url       text,
  social_handle                   text,
  tag_preference                  tag_preference default 'ask_every_time',
  profile_visibility              profile_visibility default 'public',
  photo_permission_status         photo_permission_status default 'Pending Upload',
  profile_approval_status         profile_approval_status default 'Draft',
  requested_changes_note          text,
  admin_review_note               text,
  approved_by                     uuid references public.members(id),
  approved_at                     timestamptz,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),
  unique (member_id)
);

create index if not exists idx_approved_profile_member on public.approved_public_profile(member_id);
create index if not exists idx_approved_profile_visibility on public.approved_public_profile(profile_visibility);

-- ---------------------------------------------------------------------------
-- profile_change_requests — every submitted request (history + pending)
-- ---------------------------------------------------------------------------
create table if not exists public.profile_change_requests (
  id                              uuid primary key default gen_random_uuid(),
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),
  member_id                       uuid not null references public.members(id) on delete cascade,
  -- Snapshot of requested values at submission time
  display_name                    text,
  preferred_website_name          text,
  preferred_email_signature_name  text,
  public_title                    text,
  secondary_role                  text,
  short_personality_line          text,
  website_bio                     text,
  portal_avatar_url               text,
  website_photo_url               text,
  email_signature_photo_url       text,
  social_handle                   text,
  tag_preference                  tag_preference,
  profile_visibility              profile_visibility,
  requested_changes_note          text,
  -- Review
  status                          profile_approval_status not null default 'Draft',
  admin_review_note               text,
  reviewed_by                     uuid references public.members(id),
  reviewed_at                     timestamptz
);

create index if not exists idx_pcr_member on public.profile_change_requests(member_id);
create index if not exists idx_pcr_status on public.profile_change_requests(status);
create index if not exists idx_pcr_created on public.profile_change_requests(created_at desc);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.approved_public_profile enable row level security;
alter table public.profile_change_requests enable row level security;

-- approved_public_profile: all authenticated can read public/portal_only; admin can write
drop policy if exists approved_profile_read on public.approved_public_profile;
create policy approved_profile_read on public.approved_public_profile
  for select to authenticated
  using (
    member_id = public.current_member_id() or public.is_admin()
  );

drop policy if exists approved_profile_member_update on public.approved_public_profile;
create policy approved_profile_member_update on public.approved_public_profile
  for update to authenticated
  using (
    member_id = public.current_member_id() or public.is_admin()
  )
  with check (
    member_id = public.current_member_id() or public.is_admin()
  );

drop policy if exists approved_profile_member_insert on public.approved_public_profile;
create policy approved_profile_member_insert on public.approved_public_profile
  for insert to authenticated
  with check (
    member_id = public.current_member_id() or public.is_admin()
  );

-- profile_change_requests: member can read own + insert own; admin can read all + update
drop policy if exists pcr_read on public.profile_change_requests;
create policy pcr_read on public.profile_change_requests
  for select to authenticated
  using (
    member_id = public.current_member_id() or public.is_admin()
  );

drop policy if exists pcr_insert_own on public.profile_change_requests;
create policy pcr_insert_own on public.profile_change_requests
  for insert to authenticated
  with check (
    member_id = public.current_member_id() or public.is_admin()
  );

drop policy if exists pcr_member_update_own on public.profile_change_requests;
create policy pcr_member_update_own on public.profile_change_requests
  for update to authenticated
  using (
    member_id = public.current_member_id() or public.is_admin()
  )
  with check (
    member_id = public.current_member_id() or public.is_admin()
  );

drop policy if exists pcr_admin_update on public.profile_change_requests;
create policy pcr_admin_update on public.profile_change_requests
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- updated_at triggers
-- ===========================================================================
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_approved_profile_updated on public.approved_public_profile;
create trigger trg_approved_profile_updated before update on public.approved_public_profile
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_pcr_updated on public.profile_change_requests;
create trigger trg_pcr_updated before update on public.profile_change_requests
  for each row execute function public.touch_updated_at();
