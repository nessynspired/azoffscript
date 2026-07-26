-- ===========================================================================
-- QUICK TERMS ACCEPTANCES — lightweight first-login room rules agreement
-- ===========================================================================
-- Unlike the full Creator Participation + Media Release (which uses
-- agreement_signatures with a signature pad), quick terms are accepted
-- via checkboxes. This tracks who accepted which version and when.
-- ===========================================================================

do $$ begin
  create type quick_terms_type as enum ('quick_terms', 'creator_release', 'revenue_addendum');
exception when duplicate_object then null; end $$;

create table if not exists public.quick_terms_acceptances (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  member_id                 uuid not null references public.members(id) on delete cascade,
  agreement_type            quick_terms_type not null default 'quick_terms',
  agreement_version         text not null,                  -- e.g. "v1"
  accepted_at               timestamptz not null default now(),
  accepted_ip               inet,
  user_agent                text,
  accepted_checkbox_snapshot jsonb not null,                -- array of checkbox labels the user agreed to
  unique (member_id, agreement_type, agreement_version)
);

create index if not exists idx_qta_member on public.quick_terms_acceptances(member_id);
create index if not exists idx_qta_type on public.quick_terms_acceptances(agreement_type);

-- RLS
alter table public.quick_terms_acceptances enable row level security;

-- Member can read own acceptances; admin can read all
drop policy if exists qta_read on public.quick_terms_acceptances;
create policy qta_read on public.quick_terms_acceptances
  for select to authenticated
  using (member_id = public.current_member_id() or public.is_admin());

-- Member can insert own acceptance
drop policy if exists qta_insert_own on public.quick_terms_acceptances;
create policy qta_insert_own on public.quick_terms_acceptances
  for insert to authenticated
  with check (member_id = public.current_member_id());

-- Admin can delete (e.g. to reset for testing)
drop policy if exists qta_admin_delete on public.quick_terms_acceptances;
create policy qta_admin_delete on public.quick_terms_acceptances
  for delete to authenticated using (public.is_admin());

-- ===========================================================================
-- CURRENT QUICK TERMS VERSION — bump this when terms change to force re-accept
-- ===========================================================================
-- The app checks this version against what the user has accepted.
-- If the user's latest accepted version < current, they must re-accept.
