-- ===========================================================================
-- MONEY SIDE — revenue events, splits, payouts
-- ===========================================================================
-- Tracks revenue by type (paid content, platform, merch, events),
-- deducts direct costs, applies preset split templates, and tracks
-- payout + agreement + disclosure status.
--
-- NOT ACTIVE until written agreements are in place.
-- ===========================================================================

do $$ begin
  create type revenue_type as enum ('Paid Content', 'Platform Revenue', 'Merch Revenue', 'Events');
exception when duplicate_object then null; end $$;

do $$ begin
  create type revenue_status as enum ('Draft', 'Pending Approval', 'Approved', 'Paid', 'On Hold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type disclosure_type as enum ('None', 'Sponsored', 'Gifted', 'Affiliate', 'Paid Partnership');
exception when duplicate_object then null; end $$;

do $$ begin
  create type split_template as enum ('Paid Content', 'Platform Revenue', 'Merch Revenue', 'Custom');
exception when duplicate_object then null; end $$;

-- Revenue events
create table if not exists public.revenue_events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- What
  title           text not null,
  description     text,
  revenue_type    revenue_type not null default 'Paid Content',
  split_template  split_template not null default 'Paid Content',
  disclosure      disclosure_type not null default 'None',

  -- Money (in cents to avoid float issues)
  gross_cents     integer not null default 0,
  expenses_cents  integer not null default 0,
  net_cents       integer generated always as (gross_cents - expenses_cents) stored,

  -- Who
  planner_involved boolean not null default false,
  planner_id       uuid references public.members(id) on delete set null,
  contributor_ids  uuid[] not null default '{}',   -- people in the content
  promo_contributor_ids uuid[] not null default '{}', -- crew who helped promote/sell merch

  -- Status
  status          revenue_status not null default 'Draft',
  agreement_signed boolean not null default false,
  paid_out         boolean not null default false,
  paid_at          timestamptz,

  -- Link to content (optional)
  clip_id          uuid references public.clips(id) on delete set null,

  -- Audit
  created_by       uuid references public.members(id) on delete set null,
  approved_by      uuid references public.members(id) on delete set null
);

create index if not exists idx_revenue_status on public.revenue_events(status);
create index if not exists idx_revenue_type on public.revenue_events(revenue_type);

-- RLS
alter table public.revenue_events enable row level security;

-- All authenticated members can read (crew sees limited info in the UI)
drop policy if exists revenue_read on public.revenue_events;
create policy revenue_read on public.revenue_events
  for select to authenticated using (true);

-- Only admin can insert/update/delete
drop policy if exists revenue_insert_admin on public.revenue_events;
create policy revenue_insert_admin on public.revenue_events
  for insert to authenticated with check (public.is_admin());

drop policy if exists revenue_update_admin on public.revenue_events;
create policy revenue_update_admin on public.revenue_events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists revenue_delete_admin on public.revenue_events;
create policy revenue_delete_admin on public.revenue_events
  for delete to authenticated using (public.is_admin());

-- Updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_revenue_touch on public.revenue_events;
create trigger trg_revenue_touch before update on public.revenue_events
for each row execute function public.touch_updated_at();
