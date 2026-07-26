-- FIX: profile_change_requests + approved_public_profile RLS policies
--
-- BUG: Old policies checked `member_id = auth.uid()` but member_id stores
-- members.id (random UUID), NOT auth.users.id. Every insert failed.
--
-- FIX: Use the existing public.current_member_id() function which returns
-- the member.id for the current auth user. Also add admin override.
--
-- Run this in Supabase SQL Editor. Safe to re-run.

-- ===== approved_public_profile =====

drop policy if exists approved_profile_read on public.approved_public_profile;
create policy approved_profile_read on public.approved_public_profile
  for select to authenticated
  using (
    member_id = public.current_member_id() or public.is_admin()
  );

drop policy if exists approved_profile_member_insert on public.approved_public_profile;
create policy approved_profile_member_insert on public.approved_public_profile
  for insert to authenticated
  with check (
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

-- ===== profile_change_requests =====

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
