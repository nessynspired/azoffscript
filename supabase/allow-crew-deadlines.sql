-- Allow authenticated crew members with can_plan_content=true to update
-- clips (deadlines + status). Admins always have full access.
-- Run this in the Supabase Dashboard → SQL Editor.

-- Replace the submitter-only update policy with one that allows content
-- planners (can_plan_content=true) and admins to update any clip.
drop policy if exists clips_update_submitter on public.clips;
drop policy if exists clips_update_deadlines on public.clips;

create policy clips_update_planners on public.clips
  for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.members m
      where m.user_id = auth.uid() and m.can_plan_content = true
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.members m
      where m.user_id = auth.uid() and m.can_plan_content = true
    )
  );

-- Note: clips_update_admin already exists and gives admins full update access.
-- This new policy gives content planners the ability to update deadlines
-- AND move clip statuses. Deletes remain admin-only (enforced in app UI + RLS).
