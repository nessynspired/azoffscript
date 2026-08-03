-- Fix RLS policy on agreement_signatures — the old policy checked
-- member_id = auth.uid(), but member_id is the members.id UUID, NOT the
-- auth user ID. So crew members could never read their own signatures,
-- which caused:
--   1. The "have I already signed?" check to return empty
--   2. The woman tries to sign again
--   3. The unique constraint on (agreement_id, member_id) blocks the insert
--   4. "duplicate key value violates unique constraint" error
--
-- The fix: check member_id against the member row where user_id = auth.uid()

drop policy if exists sig_read_own on public.agreement_signatures;
create policy sig_read_own on public.agreement_signatures
  for select to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists sig_insert_own on public.agreement_signatures;
create policy sig_insert_own on public.agreement_signatures
  for insert to authenticated
  with check (
    member_id in (select id from public.members where user_id = auth.uid())
  );

-- Keep the admin update policy as-is
drop policy if exists sig_admin_update on public.agreement_signatures;
create policy sig_admin_update on public.agreement_signatures
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
