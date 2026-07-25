-- ==========================================================================
-- Push Subscriptions + Notification enhancements
-- Run this in the Supabase Dashboard → SQL Editor. Idempotent.
-- ==========================================================================

-- ==========================================================================
-- push_subscriptions: stores web push endpoints per member
-- A member can have multiple subscriptions (phone, desktop, tablet)
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

-- ==========================================================================
-- Allow inserts into notifications by any authenticated user
-- (the app inserts notifications on behalf of members — e.g. when Vanessa
-- assigns Sholanda, we insert a notification for Sholanda)
-- ==========================================================================
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert to authenticated with check (auth.uid() is not null);
