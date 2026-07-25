-- ===========================================================================
-- AGREEMENTS — versioned participation agreements + electronic signatures
-- ===========================================================================
-- Tracks agreement versions (v1, v2, ...) and who signed which version.
-- Crew sign in-app; admin can release new versions and see who signed.
-- ===========================================================================

do $$ begin
  create type agreement_status as enum ('Draft', 'Active', 'Retired');
exception when duplicate_object then null; end $$;

-- Agreement versions (the document templates)
create table if not exists public.agreements (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  version         text not null,                -- e.g. "v1", "v2"
  title           text not null,
  summary         text,                          -- plain-English summary
  body_markdown   text not null,                 -- full agreement text
  status          agreement_status not null default 'Draft',
  activated_at    timestamptz,
  retired_at      timestamptz,
  created_by      uuid references public.members(id) on delete set null,
  unique (version)
);

create index if not exists idx_agreements_status on public.agreements(status);

-- Signatures (who signed which version)
create table if not exists public.agreement_signatures (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  agreement_id    uuid not null references public.agreements(id) on delete cascade,
  member_id       uuid not null references public.members(id) on delete cascade,
  member_name     text not null,
  member_email    text,
  member_phone    text,
  social_handles  text,
  printed_name    text not null,                 -- typed legal name
  ip_address      inet,
  user_agent      text,
  acknowledged_checklist boolean not null default false,
  unique (agreement_id, member_id)
);

create index if not exists idx_signatures_agreement on public.agreement_signatures(agreement_id);
create index if not exists idx_signatures_member on public.agreement_signatures(member_id);

-- RLS
alter table public.agreements enable row level security;
alter table public.agreement_signatures enable row level security;

-- Agreements: all authenticated can read Active/Draft; admin can write
drop policy if exists agreements_read on public.agreements;
create policy agreements_read on public.agreements
  for select to authenticated using (true);

drop policy if exists agreements_admin_write on public.agreements;
create policy agreements_admin_write on public.agreements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Signatures: member can read own; admin can read all; member can insert own
drop policy if exists sig_read_own on public.agreement_signatures;
create policy sig_read_own on public.agreement_signatures
  for select to authenticated
  using (member_id = auth.uid() or public.is_admin());

drop policy if exists sig_insert_own on public.agreement_signatures;
create policy sig_insert_own on public.agreement_signatures
  for insert to authenticated
  with check (member_id = auth.uid());

drop policy if exists sig_admin_update on public.agreement_signatures;
create policy sig_admin_update on public.agreement_signatures
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
